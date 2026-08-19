/**
 * 디센더(g·y·p·q·j)가 잘리는 텍스트를 찾아낸다 (개발 전용, 임시 진단용).
 *
 * 잘림은 두 조건이 겹칠 때 생긴다.
 *   1) line-height 가 글꼴의 실제 잉크 높이보다 작아 글자가 자기 줄 박스를 넘어간다
 *   2) 그 요소나 조상이 overflow: hidden/clip 으로 줄 박스 끝에서 잘라낸다
 *
 * scrollHeight 비교로는 못 잡는다 — scrollHeight 는 줄 박스 기준이라
 * 줄 박스를 삐져나온 잉크는 계산에 안 들어간다. 그래서 canvas 로 글꼴의
 * actualBoundingBoxDescent 를 재서 줄 박스 아래로 얼마나 넘치는지 직접 계산한다.
 *
 * 사용법: node scripts/find-clipped-text.mjs [baseUrl] [lang]
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4173';
const lang = process.argv[3] || 'en';

const ROUTES = [
  '/signup',
  '/connecting',
  '/connected',
  '/home/first-visit',
  '/home',
  '/camera',
  '/self-check',
  '/solution-loading',
  '/solution-summary',
  '/solution/night',
  '/solution/morning',
  '/mypage',
  '/market',
  '/market/wim',
  '/market/oily',
  '/market/elasticity',
  '/market/wishlist',
  '/market/cart',
  '/market/product',
  '/market/filter/gender',
];

const browser = await chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: lang === 'ko' ? 'ko-KR' : 'en-US',
  permissions: ['camera'],
});

// 언어를 강제로 지정한다 (uiStore 가 localStorage 에 저장한다)
await context.addInitScript((code) => {
  localStorage.setItem('innerderma.ui', JSON.stringify({ state: { lang: code }, version: 0 }));
}, lang);

const page = await context.newPage();

const findings = [];

for (const route of ROUTES) {
  await page.goto(`${base}${route}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-frame]').catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const rows = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    /**
     * 요소나 조상 중 실제로 잘라내는 가장 가까운 박스를 찾는다.
     *
     * 스크롤 컨테이너(auto/scroll)를 먼저 만나면 null 을 준다 — 그 아래로 밀려난
     * 내용은 스크롤하면 보이므로 잘림이 아니다. (여기서 멈추지 않고 더 위로 올라가면
     * 화면 밖 요소가 전부 "잘렸다" 고 잡혀 오탐이 된다)
     */
    const clippingAncestor = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const s = getComputedStyle(node);
        if (s.overflowY === 'auto' || s.overflowY === 'scroll') return null;
        if (s.overflowY === 'hidden' || s.overflowY === 'clip') return node;
        node = node.parentElement;
      }
      return null;
    };

    const out = [];

    for (const el of document.querySelectorAll('p, span, div, button, a, h1, h2, h3, label')) {
      // 직접 자식으로 텍스트를 가진 요소만
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join('')
        .trim();
      if (!text) continue;
      // 디센더가 있는 글자가 없으면 볼 필요 없다
      if (!/[gjpqyGJQ,;()\[\]{}]/.test(text)) continue;

      const s = getComputedStyle(el);
      const fontSize = parseFloat(s.fontSize);
      const lineHeight = s.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(s.lineHeight);
      if (!fontSize) continue;

      ctx.font = `${s.fontStyle} ${s.fontWeight} ${fontSize}px ${s.fontFamily}`;
      const m = ctx.measureText(text);
      const fontAscent = m.fontBoundingBoxAscent ?? fontSize * 0.8;
      const fontDescent = m.fontBoundingBoxDescent ?? fontSize * 0.2;
      const inkDescent = m.actualBoundingBoxDescent ?? 0;

      // 줄 박스 안에서 베이스라인 위치
      const halfLeading = (lineHeight - (fontAscent + fontDescent)) / 2;
      const baseline = halfLeading + fontAscent;
      // 잉크가 줄 박스 아래로 넘치는 양
      const inkOverflow = baseline + inkDescent - lineHeight;

      if (inkOverflow <= 0.2) continue;

      const clipper = clippingAncestor(el);
      if (!clipper) continue;

      const r = el.getBoundingClientRect();
      const cr = clipper.getBoundingClientRect();
      const cs = getComputedStyle(clipper);

      // 클립 경계 = 자르는 박스의 padding box 아래끝 (padding 안쪽은 잘리지 않는다)
      const clipBottom = cr.bottom - parseFloat(cs.borderBottomWidth || 0);
      // 마지막 줄 박스의 아래끝 = 요소의 content box 아래끝
      const contentBottom =
        r.bottom - parseFloat(s.paddingBottom || 0) - parseFloat(s.borderBottomWidth || 0);
      // 줄 박스 아래로 쓸 수 있는 여유
      const slack = clipBottom - contentBottom;

      if (slack < inkOverflow) {
        out.push({
          text: text.slice(0, 40),
          tag: el.tagName.toLowerCase(),
          nodeId: el.getAttribute('data-node-id') || el.closest('[data-node-id]')?.getAttribute('data-node-id') || '',
          name: el.getAttribute('data-name') || '',
          fontSize,
          lineHeight,
          inkOverflow: +inkOverflow.toFixed(2),
          slack: +slack.toFixed(2),
          shortBy: +(inkOverflow - slack).toFixed(2),
          clipper: `${clipper.tagName.toLowerCase()}.${(clipper.className || '').toString().split(' ').slice(0, 2).join('.')}`,
          clipOverflow: cs.overflowY,
        });
      }
    }
    return out;
  });

  for (const r of rows) findings.push({ route, ...r });
}

await browser.close();

// ── 리포트 ──
if (findings.length === 0) {
  console.log(`[${lang}] 잘리는 텍스트 없음`);
} else {
  console.log(`[${lang}] 디센더가 잘리는 텍스트 ${findings.length}건\n`);
  const byRoute = {};
  for (const f of findings) (byRoute[f.route] ??= []).push(f);
  for (const [route, list] of Object.entries(byRoute)) {
    console.log(`── ${route}`);
    for (const f of list) {
      console.log(
        `   "${f.text}"\n     ${f.fontSize}px / line-height ${f.lineHeight}px` +
          ` → 잉크가 줄 박스보다 ${f.inkOverflow}px 넘침, 여유 ${f.slack}px (${f.shortBy}px 부족)` +
          `\n     클립: ${f.clipper} (overflow-y: ${f.clipOverflow})  node=${f.nodeId} name=${f.name}`,
      );
    }
    console.log('');
  }
}
