/**
 * 검증용 스크린샷 도구 (개발 전용, 배포 산출물에 포함되지 않음).
 *
 * 사용법:
 *   node scripts/shoot.mjs <baseUrl> <out디렉터리> <route:파일명>...
 * 예:
 *   node scripts/shoot.mjs http://localhost:4173 .shots /:01-splash /signup:02-signup
 *
 * 각 라우트마다 두 장을 남긴다.
 *   <이름>.png       : 아이폰 프레임(393x852) 그대로
 *   <이름>-full.png  : 852 보다 긴 화면의 전체 길이 (프레임 높이를 임시로 늘려 촬영)
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const [baseUrl, outDir, ...specs] = process.argv.slice(2);

if (!baseUrl || !outDir || specs.length === 0) {
  console.error('usage: node scripts/shoot.mjs <baseUrl> <outDir> <route:name>...');
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });

const FRAME = '[data-frame]';
const CONTENT = '[data-screen-content]';

for (const spec of specs) {
  const idx = spec.lastIndexOf(':');
  const route = spec.slice(0, idx);
  const name = spec.slice(idx + 1);

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'load' });
  await page.waitForSelector(FRAME);
  await page.evaluate(() => document.fonts.ready);
  // 스플래시 자동 전환 타이머보다 먼저 촬영해야 하므로 대기는 짧게 잡는다.
  await page.waitForTimeout(350);

  await page.locator(FRAME).screenshot({ path: `${outDir}/${name}.png` });

  // 프레임보다 긴 화면은 전체 길이도 남긴다.
  const contentHeight = await page.locator(CONTENT).evaluate((el) => el.getBoundingClientRect().height);
  if (contentHeight > 852.5) {
    await page.locator(FRAME).evaluate((el, h) => {
      el.style.height = `${h}px`;
      el.style.borderRadius = '0px';
    }, contentHeight);
    await page.setViewportSize({ width: 900, height: Math.ceil(contentHeight) + 40 });
    await page.waitForTimeout(150);
    await page.locator(FRAME).screenshot({ path: `${outDir}/${name}-full.png` });
    await page.setViewportSize({ width: 900, height: 1000 });
  }

  console.log(`shot ${name} (${route}) height=${Math.round(contentHeight)}`);
}

await browser.close();
