import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [p, ...pts] = process.argv.slice(2);
const b = await chromium.launch();
const pg = await b.newPage();
const out = await pg.evaluate(async ({ src, pts }) => {
  const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = src; });
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  return pts.map((s) => { const [x, y] = s.split(',').map(Number); const i = (y * c.width + x) * 4; return `${s} -> rgba(${d[i]},${d[i+1]},${d[i+2]},${d[i+3]})`; });
}, { src: `data:image/png;base64,${readFileSync(p).toString('base64')}`, pts });
console.log(out.join('\n'));
await b.close();
