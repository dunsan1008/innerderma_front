/**
 * ref / impl 의 특정 y 구간을 확대해 위아래로 붙여 보여준다 (개발 전용, 폰트 굵기·자간 확인용).
 *
 * 사용법:
 *   node scripts/zoom.mjs <ref.png> <impl.png> <out.png> <frameHeight> <y0> <y1> [zoom]
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [refPath, implPath, outPath, frameHArg, y0Arg, y1Arg, zoomArg] = process.argv.slice(2);
const FRAME_W = 393;
const frameH = Number(frameHArg);
const y0 = Number(y0Arg);
const y1 = Number(y1Arg);
const zoom = Number(zoomArg || 3);
const toDataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

const dataUrl = await page.evaluate(
  async ({ refUrl, implUrl, W, H, a, b, z }) => {
    const load = (src) =>
      new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });
    const [ref, impl] = await Promise.all([load(refUrl), load(implUrl)]);

    const probe = document.createElement('canvas');
    probe.width = ref.width;
    probe.height = ref.height;
    const pg = probe.getContext('2d');
    pg.drawImage(ref, 0, 0);
    const pd = pg.getImageData(0, 0, ref.width, ref.height).data;
    let minX = Infinity;
    let minY = Infinity;
    for (let y = 0; y < ref.height; y++) {
      for (let x = 0; x < ref.width; x++) {
        if (pd[(y * ref.width + x) * 4 + 3] === 255) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
        }
      }
    }

    const bandH = b - a;
    const out = document.createElement('canvas');
    out.width = W * z;
    out.height = bandH * z * 2 + 8;
    const g = out.getContext('2d');
    g.fillStyle = '#ff00ff';
    g.fillRect(0, 0, out.width, out.height);
    g.imageSmoothingEnabled = false;

    // 상단: Figma
    g.drawImage(ref, minX, minY + a, W, bandH, 0, 0, W * z, bandH * z);
    // 하단: 구현
    const s = impl.width / W;
    g.drawImage(impl, 0, a * s * (impl.height / (H * s)), impl.width, bandH * s, 0, bandH * z + 8, W * z, bandH * z);

    return out.toDataURL('image/png');
  },
  { refUrl: toDataUrl(refPath), implUrl: toDataUrl(implPath), W: FRAME_W, H: frameH, a: y0, b: y1, z: zoom },
);

writeFileSync(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log(`wrote ${outPath} (위: Figma / 아래: 구현, ${zoom}x)`);
await browser.close();
