/**
 * 싱크로율 회귀 게이트 (개발 전용).
 *
 * sync.json 매니페스트를 읽어 전 화면을 촬영하고, .figma-ref 의 원본과
 * 밴드 분할 diff 를 실행한 뒤, 허용 기준선(max%)을 넘는 밴드만 리포트한다.
 *
 * 사용법:
 *   node scripts/sync.mjs [baseUrl] [--update-baseline]
 *
 * 옵션:
 *   --update-baseline  현재 mismatch 를 sync.json 의 max 로 갱신 (최초 등록용)
 *
 * 종료코드:
 *   0  전체 통과
 *   1  기준선 초과 밴드 있음
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(__dirname, 'sync.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const baseUrl = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : 'http://localhost:4173';
const updateBaseline = process.argv.includes('--update-baseline');

const REF_DIR = join(__dirname, '..', '.figma-ref');
const OUT_DIR = join(__dirname, '..', '.shots', 'sync');
mkdirSync(OUT_DIR, { recursive: true });

const { frameW: FRAME_W, bandH: BAND_H, screens } = manifest;

// ─── 유틸 ──────────────────────────────────────────────────────────────────
const toDataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

/**
 * Playwright 페이지 안에서 밴드 diff 를 실행한다.
 * diff-band.mjs 의 핵심 로직을 인라인으로 재사용 (별도 프로세스 안 띄움).
 */
async function diffBands(page, refPath, implPath, frameH) {
  const bandCount = Math.ceil(frameH / BAND_H);

  return page.evaluate(
    async ({ refUrl, implUrl, W, totalH, bandH, bands }) => {
      const load = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const [ref, impl] = await Promise.all([load(refUrl), load(implUrl)]);

      const canvasOf = (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      };

      // 불투명 바운딩 박스로 프레임 원점 감지
      const probe = canvasOf(ref.width, ref.height);
      const pg = probe.getContext('2d');
      pg.drawImage(ref, 0, 0);
      const pd = pg.getImageData(0, 0, ref.width, ref.height).data;
      let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
      for (let y = 0; y < ref.height; y++) {
        for (let x = 0; x < ref.width; x++) {
          if (pd[(y * ref.width + x) * 4 + 3] === 255) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      const left = minX;
      const top = minY;

      // 전체 프레임 렌더
      const fullRef = canvasOf(W, totalH);
      const grRef = fullRef.getContext('2d');
      grRef.fillStyle = '#ffffff';
      grRef.fillRect(0, 0, W, totalH);
      grRef.drawImage(ref, left, top, W, totalH, 0, 0, W, totalH);
      const refData = grRef.getImageData(0, 0, W, totalH).data;

      const alphaCanvas = canvasOf(W, totalH);
      const alphaG = alphaCanvas.getContext('2d');
      alphaG.drawImage(ref, left, top, W, totalH, 0, 0, W, totalH);
      const alphaData = alphaG.getImageData(0, 0, W, totalH).data;

      const fullImpl = canvasOf(W, totalH);
      const grImpl = fullImpl.getContext('2d');
      grImpl.fillStyle = '#ffffff';
      grImpl.fillRect(0, 0, W, totalH);
      grImpl.drawImage(impl, 0, 0, impl.width, impl.height, 0, 0, W, totalH);
      const implData = grImpl.getImageData(0, 0, W, totalH).data;

      const output = [];

      for (let b = 0; b < bands; b++) {
        const yStart = b * bandH;
        const h = Math.min(bandH, totalH - yStart);

        const out = canvasOf(W * 3, h);
        const og = out.getContext('2d');
        og.fillStyle = '#ffffff';
        og.fillRect(0, 0, out.width, out.height);
        og.drawImage(fullRef, 0, yStart, W, h, 0, 0, W, h);
        og.drawImage(fullImpl, 0, yStart, W, h, W, 0, W, h);

        const diffImg = og.createImageData(W, h);
        let bad = 0;
        let compared = 0;

        for (let ly = 0; ly < h; ly++) {
          for (let lx = 0; lx < W; lx++) {
            const gi = ((yStart + ly) * W + lx) * 4;
            const li = (ly * W + lx) * 4;

            if (alphaData[gi + 3] < 250) {
              diffImg.data[li] = 240;
              diffImg.data[li + 1] = 240;
              diffImg.data[li + 2] = 255;
              diffImg.data[li + 3] = 255;
              continue;
            }
            compared++;

            const d =
              Math.abs(refData[gi] - implData[gi]) +
              Math.abs(refData[gi + 1] - implData[gi + 1]) +
              Math.abs(refData[gi + 2] - implData[gi + 2]);

            if (d > 90) {
              bad++;
              diffImg.data[li] = 255;
              diffImg.data[li + 1] = 0;
              diffImg.data[li + 2] = 0;
              diffImg.data[li + 3] = 255;
            } else {
              const v = 255 - Math.min(255, d);
              diffImg.data[li] = v;
              diffImg.data[li + 1] = v;
              diffImg.data[li + 2] = v;
              diffImg.data[li + 3] = 255;
            }
          }
        }
        og.putImageData(diffImg, W * 2, 0);

        output.push({
          band: b,
          mismatch: +(compared > 0 ? (bad / compared) * 100 : 0).toFixed(2),
          badPx: bad,
          compared,
          dataUrl: out.toDataURL('image/png'),
        });
      }

      return output;
    },
    {
      refUrl: toDataUrl(refPath),
      implUrl: toDataUrl(implPath),
      W: FRAME_W,
      totalH: frameH,
      bandH: BAND_H,
      bands: bandCount,
    },
  );
}

// ─── 메인 ──────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 500, height: 1800 },
  deviceScaleFactor: 1,
  locale: 'ko-KR',
});
const page = await context.newPage();

// diff 전용 빈 페이지 (evaluate 에서 canvas 를 쓰기 위함)
const diffPage = await context.newPage();
await diffPage.goto('about:blank');

const failures = [];
const allResults = [];

for (const screen of screens) {
  const refFile = join(REF_DIR, `${screen.name}.png`);
  if (!existsSync(refFile)) {
    console.log(`SKIP  ${screen.name} — ref 파일 없음`);
    continue;
  }

  // ── 촬영 ──
  await page.goto(`${baseUrl}${screen.route}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-frame]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  // 프레임을 원래 크기로 펼치고 스크린샷
  await page.evaluate((h) => {
    const frame = document.querySelector('[data-frame]');
    frame.style.transform = 'none';
    frame.style.width = '393px';
    frame.style.height = `${h}px`;
    frame.style.borderRadius = '0';
    frame.style.boxShadow = 'none';
    const scroll = frame.querySelector('.app-scroll');
    if (scroll) scroll.style.overflow = 'visible';
  }, screen.frameH);
  await page.setViewportSize({ width: 500, height: screen.frameH + 40 });
  await page.waitForTimeout(200);

  const implFile = join(OUT_DIR, `${screen.name}.png`);
  const el = await page.$('[data-frame]');
  await el.screenshot({ path: implFile });

  // 뷰포트 복원
  await page.setViewportSize({ width: 500, height: 1800 });

  // ── 밴드 diff ──
  const bands = await diffBands(diffPage, refFile, implFile, screen.frameH);

  // diff 이미지 저장 + 판정
  let worstMismatch = 0;
  for (const band of bands) {
    const bandFile = join(OUT_DIR, `${screen.name}-band${band.band}.png`);
    writeFileSync(bandFile, Buffer.from(band.dataUrl.split(',')[1], 'base64'));

    if (band.mismatch > worstMismatch) worstMismatch = band.mismatch;

    if (band.mismatch > screen.max) {
      failures.push({ screen: screen.name, band: band.band, mismatch: band.mismatch, max: screen.max });
    }
  }

  const status = worstMismatch > screen.max ? 'FAIL' : 'PASS';
  const bandStr = bands.map((b) => `${b.mismatch}%`).join(' / ');
  console.log(`${status}  ${screen.name.padEnd(22)} bands=[${bandStr}]  max=${screen.max}%`);

  allResults.push({ name: screen.name, bands: bands.map((b) => b.mismatch), worst: worstMismatch });
}

await browser.close();

// ── baseline 갱신 모드 ──
if (updateBaseline) {
  for (const r of allResults) {
    const entry = screens.find((s) => s.name === r.name);
    if (entry) {
      // 현재 값 + 0.5% 여유를 둔다 (안티에일리어싱 변동 흡수)
      entry.max = +(Math.ceil((r.worst + 0.5) * 10) / 10).toFixed(1);
    }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nbaseline 갱신 완료 → ${manifestPath}`);
}

// ── 결과 요약 ──
console.log(`\n${'─'.repeat(60)}`);
if (failures.length === 0) {
  console.log(`ALL PASS  (${allResults.length} screens)`);
} else {
  console.log(`FAILURES  (${failures.length} bands over threshold):`);
  for (const f of failures) {
    console.log(`  ${f.screen} band${f.band}: ${f.mismatch}% > ${f.max}%`);
  }
  process.exitCode = 1;
}

// stdout JSON 요약 (CI 파이프라인용)
const jsonOut = join(OUT_DIR, 'results.json');
writeFileSync(jsonOut, JSON.stringify({ pass: failures.length === 0, screens: allResults, failures }, null, 2));
