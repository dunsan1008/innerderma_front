/**
 * Figma 원본과 구현 스크린샷을 픽셀 단위로 비교한다 (개발 전용).
 *
 * 사용법:
 *   node scripts/diff.mjs <ref.png> <impl.png> <out.png> <frameHeight>
 *
 * ref 는 Figma get_screenshot 결과(스케일 1, 그림자용 투명 여백 포함)를 넣는다.
 * 여백은 그림자 offset 때문에 상하가 비대칭(위 46 / 아래 54)이라 하드코딩하지 않고,
 * 알파 = 255 인 영역의 바운딩 박스로 프레임 위치를 자동 감지한다.
 * (라운드 코너의 안티에일리어싱 때문에 감지 박스는 사방 1px 안쪽으로 잡히므로 보정한다.)
 *
 * 출력: 좌(Figma) / 중(구현) / 우(차이·빨강) 3분할 이미지 + 불일치 비율과 문제 구간.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [refPath, implPath, outPath, frameHArg, originArg] = process.argv.slice(2);
if (!refPath || !implPath || !outPath || !frameHArg) {
  console.error('usage: node scripts/diff.mjs <ref.png> <impl.png> <out.png> <frameHeight> [originX,originY]');
  process.exit(1);
}

/**
 * 프레임 원점 직접 지정용.
 * 딤(반투명)만 깔린 오버레이 프레임은 불투명 영역이 다이얼로그뿐이라
 * 자동 감지가 프레임 원점을 잘못 잡는다. 그런 경우 "0,0" 처럼 넘긴다.
 */
const originOverride = originArg ? originArg.split(',').map(Number) : null;

const FRAME_W = 393;
const frameH = Number(frameHArg);
const toDataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

const result = await page.evaluate(
  async ({ refUrl, implUrl, W, H, origin }) => {
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

    // --- ref 프레임 위치 자동 감지 (alpha === 255 바운딩 박스) ---
    const probe = canvasOf(ref.width, ref.height);
    const pg = probe.getContext('2d');
    pg.drawImage(ref, 0, 0);
    const pd = pg.getImageData(0, 0, ref.width, ref.height).data;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -1;
    let maxY = -1;
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
    // 스케일 1 내보내기에서는 불투명 박스가 프레임과 정확히 일치한다.
    const left = origin ? origin[0] : minX;
    const top = origin ? origin[1] : minY;
    const detectedW = origin ? W : maxX - minX + 1;
    const detectedH = origin ? H : maxY - minY + 1;

    // 프레임 밖(라운드 코너 등 투명 영역)은 비교 대상에서 제외하기 위해 알파를 따로 보관한다.
    const alphaOnly = canvasOf(W, H);
    const gAlpha = alphaOnly.getContext('2d');
    gAlpha.drawImage(ref, left, top, W, H, 0, 0, W, H);
    const refAlpha = gAlpha.getImageData(0, 0, W, H).data;

    const ca = canvasOf(W, H);
    const ga = ca.getContext('2d');
    ga.imageSmoothingQuality = 'high';
    ga.fillStyle = '#ffffff';
    ga.fillRect(0, 0, W, H);
    ga.drawImage(ref, left, top, W, H, 0, 0, W, H);

    const cb = canvasOf(W, H);
    const gb = cb.getContext('2d');
    gb.imageSmoothingQuality = 'high';
    gb.fillStyle = '#ffffff';
    gb.fillRect(0, 0, W, H);
    gb.drawImage(impl, 0, 0, impl.width, impl.height, 0, 0, W, H);

    const da = ga.getImageData(0, 0, W, H).data;
    const db = gb.getImageData(0, 0, W, H).data;

    const out = canvasOf(W * 3, H);
    const og = out.getContext('2d');
    og.fillStyle = '#ffffff';
    og.fillRect(0, 0, out.width, out.height);
    og.drawImage(ca, 0, 0);
    og.drawImage(cb, W, 0);

    const diffImg = og.createImageData(W, H);
    const rowBad = new Array(H).fill(0);
    const colBad = new Array(W).fill(0);
    let bad = 0;

    let compared = 0;
    for (let i = 0; i < da.length; i += 4) {
      const px = i / 4;
      const y = Math.floor(px / W);
      const x = px % W;

      // 프레임 밖(코너 라운드 바깥)은 건너뛴다.
      if (refAlpha[i + 3] < 250) {
        diffImg.data[i] = 240;
        diffImg.data[i + 1] = 240;
        diffImg.data[i + 2] = 255;
        diffImg.data[i + 3] = 255;
        continue;
      }
      compared++;

      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 90) {
        bad++;
        rowBad[y]++;
        colBad[x]++;
        diffImg.data[i] = 255;
        diffImg.data[i + 1] = 0;
        diffImg.data[i + 2] = 0;
        diffImg.data[i + 3] = 255;
      } else {
        const v = 255 - Math.min(255, d);
        diffImg.data[i] = v;
        diffImg.data[i + 1] = v;
        diffImg.data[i + 2] = v;
        diffImg.data[i + 3] = 255;
      }
    }
    og.putImageData(diffImg, W * 2, 0);

    const bands = [];
    let start = -1;
    for (let y = 0; y <= H; y++) {
      const isBad = y < H && rowBad[y] > W * 0.02;
      if (isBad && start < 0) start = y;
      if (!isBad && start >= 0) {
        bands.push({ from: start, to: y - 1, px: rowBad.slice(start, y).reduce((s, n) => s + n, 0) });
        start = -1;
      }
    }
    bands.sort((p, q) => q.px - p.px);

    return {
      ratio: bad / Math.max(1, compared),
      badPx: bad,
      compared,
      bands: bands.slice(0, 8),
      detect: { left, top, detectedW, detectedH },
      dataUrl: out.toDataURL('image/png'),
    };
  },
  { refUrl: toDataUrl(refPath), implUrl: toDataUrl(implPath), W: FRAME_W, H: frameH, origin: originOverride },
);

writeFileSync(outPath, Buffer.from(result.dataUrl.split(',')[1], 'base64'));

const { left, top, detectedW, detectedH } = result.detect;
console.log(`frame detected at (${left}, ${top})  size≈${detectedW}x${detectedH}  expected ${FRAME_W}x${frameH}`);
if (Math.abs(detectedW - FRAME_W) > 2 || Math.abs(detectedH - frameH) > 2) {
  console.warn('warn: 감지된 프레임 크기가 기대값과 다릅니다. ref 가 스케일 1 로 내보내졌는지 확인하세요.');
}
console.log(`mismatch: ${(result.ratio * 100).toFixed(2)}%  (${result.badPx} / ${result.compared} px)`);
if (result.bands.length) {
  console.log('worst bands (y → bad px):');
  for (const b of result.bands) console.log(`  ${String(b.from).padStart(4)}-${String(b.to).padEnd(4)} → ${b.px}`);
}

await browser.close();
