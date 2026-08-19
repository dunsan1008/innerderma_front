/**
 * 밴드 분할 픽셀 diff (개발 전용).
 *
 * 긴 화면(frameH > bandH)을 bandH(기본 852px) 단위로 쪼개서 밴드별로 비교한다.
 * 짧은 화면(frameH <= bandH)은 밴드 1개 = 전체 화면으로 취급한다.
 *
 * 사용법:
 *   node scripts/diff-band.mjs <ref.png> <impl.png> <outDir> <frameH> [originX,originY]
 *
 * 출력:
 *   <outDir>/<name>-band0.png  (좌: ref / 중: impl / 우: diff 3분할, 최대 393×852×3 = 1179×852)
 *   stdout: 밴드별 mismatch% JSON 배열
 *
 * ref 는 Figma get_screenshot(scale 1) 결과를 그대로 넣는다.
 * 불투명 영역 바운딩 박스로 프레임 위치를 자동 감지한다 (diff.mjs 과 동일 로직).
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const [refPath, implPath, outDir, frameHArg, originArg] = process.argv.slice(2);
if (!refPath || !implPath || !outDir || !frameHArg) {
  console.error('usage: node scripts/diff-band.mjs <ref.png> <impl.png> <outDir> <frameH> [originX,originY]');
  process.exit(1);
}

const originOverride = originArg ? originArg.split(',').map(Number) : null;
const FRAME_W = 393;
const BAND_H = 852;
const frameH = Number(frameHArg);
const bandCount = Math.ceil(frameH / BAND_H);

mkdirSync(outDir, { recursive: true });

const toDataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const stem = basename(refPath, '.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

const results = await page.evaluate(
  async ({ refUrl, implUrl, W, totalH, bandH, bands, origin }) => {
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

    // --- ref 프레임 위치 자동 감지 ---
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
    const left = origin ? origin[0] : minX;
    const top = origin ? origin[1] : minY;

    // 전체 프레임을 한 번 그려서 알파 맵과 픽셀 데이터를 확보한다
    const fullRef = canvasOf(W, totalH);
    const grRef = fullRef.getContext('2d');
    grRef.fillStyle = '#ffffff';
    grRef.fillRect(0, 0, W, totalH);
    grRef.drawImage(ref, left, top, W, totalH, 0, 0, W, totalH);
    const refData = grRef.getImageData(0, 0, W, totalH).data;

    // 알파 맵 (ref 원본에서)
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

      // ref band
      og.drawImage(fullRef, 0, yStart, W, h, 0, 0, W, h);
      // impl band
      og.drawImage(fullImpl, 0, yStart, W, h, W, 0, W, h);

      // diff
      const diffImg = og.createImageData(W, h);
      let bad = 0;
      let compared = 0;

      for (let ly = 0; ly < h; ly++) {
        for (let lx = 0; lx < W; lx++) {
          const globalY = yStart + ly;
          const gi = (globalY * W + lx) * 4;
          const li = (ly * W + lx) * 4;

          // 투명(라운드 코너 바깥) 건너뛰기
          if (alphaData[gi + 3] < 250) {
            diffImg.data[li] = 240;
            diffImg.data[li + 1] = 240;
            diffImg.data[li + 2] = 255;
            diffImg.data[li + 3] = 255;
            continue;
          }
          compared++;

          const dr = Math.abs(refData[gi] - implData[gi]);
          const dg = Math.abs(refData[gi + 1] - implData[gi + 1]);
          const db = Math.abs(refData[gi + 2] - implData[gi + 2]);
          const d = dr + dg + db;

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

      const ratio = compared > 0 ? bad / compared : 0;
      output.push({
        band: b,
        mismatch: +(ratio * 100).toFixed(2),
        badPx: bad,
        compared,
        dataUrl: out.toDataURL('image/png'),
      });
    }

    return { output, detect: { left, top } };
  },
  {
    refUrl: toDataUrl(refPath),
    implUrl: toDataUrl(implPath),
    W: FRAME_W,
    totalH: frameH,
    bandH: BAND_H,
    bands: bandCount,
    origin: originOverride,
  },
);

// 결과 저장
const summary = [];
for (const band of results.output) {
  const outFile = join(outDir, `${stem}-band${band.band}.png`);
  writeFileSync(outFile, Buffer.from(band.dataUrl.split(',')[1], 'base64'));
  summary.push({ band: band.band, mismatch: band.mismatch, badPx: band.badPx, compared: band.compared });
  console.error(`band${band.band}: ${band.mismatch}% (${band.badPx}/${band.compared}px) → ${outFile}`);
}

// stdout 에는 JSON 만 — 파이프라인에서 쓸 수 있도록
console.log(JSON.stringify(summary));

await browser.close();
