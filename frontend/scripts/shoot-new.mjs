/**
 * 신규 4개 화면 스크린샷 (개발 전용).
 * DeviceFrame 이 축소 배치되므로, 프레임 요소만 잘라 Figma 원본과 같은 393 폭으로 저장한다.
 *
 * 사용법: node scripts/shoot-new.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] || 'https://localhost:4173';
const OUT = '.shots/new';
await mkdir(OUT, { recursive: true });

const TARGETS = [
  { name: 'self-check', path: '/self-check', height: 852 },
  { name: 'solution-loading', path: '/solution-loading', height: 852 },
  { name: 'cart', path: '/market/cart', height: 933 },
  { name: 'product-detail', path: '/market/product', height: 1611 },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  // 프레임을 1:1 로 담기 위해 뷰포트를 프레임보다 크게 잡는다
  viewport: { width: 500, height: 1800 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true,
  locale: 'ko-KR',
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log(`PAGEERROR  ${e.message}`));
page.on('console', (m) => m.type() === 'error' && console.log(`CONSOLE  ${m.text()}`));

for (const t of TARGETS) {
  await page.goto(`${base}${t.path}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-frame]');
  // 스크롤되는 화면은 전체를 담기 위해 프레임 축소를 풀고 실제 높이로 펼친다
  await page.evaluate((h) => {
    const frame = document.querySelector('[data-frame]');
    frame.style.transform = 'none';
    frame.style.width = '393px';
    frame.style.height = `${h}px`;
    frame.style.borderRadius = '0';
    frame.style.boxShadow = 'none';
    const scroll = frame.querySelector('.app-scroll');
    if (scroll) scroll.style.overflow = 'visible';
  }, t.height);
  await page.waitForTimeout(600);
  const el = await page.$('[data-frame]');
  await el.screenshot({ path: `${OUT}/${t.name}.png` });
  console.log(`saved ${OUT}/${t.name}.png`);
}

await browser.close();
