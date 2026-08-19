/** ref PNG 의 알파/불투명 영역 경계를 조사한다 (개발 전용, 여백 자동 감지 검증용). */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const [p] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
const info = await page.evaluate(async (src) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => {
    const i = (y * c.width + x) * 4;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]];
  };
  // 완전 불투명(alpha=255) 픽셀의 바운딩 박스
  let minX = 1e9;
  let minY = 1e9;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] === 255) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    size: [c.width, c.height],
    corner: at(0, 0),
    center: at(c.width >> 1, c.height >> 1),
    opaqueBox: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
  };
}, `data:image/png;base64,${readFileSync(p).toString('base64')}`);

console.log(JSON.stringify(info, null, 2));
await browser.close();
