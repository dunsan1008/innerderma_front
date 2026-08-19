/**
 * 다국어 검증 (개발 전용).
 * 4개 언어 × 주요 라우트를 돌며
 *  1) {t.xxx} 리터럴이 노출되지 않는지
 *  2) 실제로 해당 언어로 번역됐는지 (기대 문구 존재 + 한국어 잔존 여부)
 *  3) 새로고침 후에도 언어가 유지되는지
 * 를 확인한다.
 *
 * 사용법: node scripts/verify-i18n.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'https://localhost:4173';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, ignoreHTTPSErrors: true, permissions: ['camera'] });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));

const ROUTES = ['/solution/night', '/solution/morning', '/home/first-visit', '/market',
  '/market/wishlist', '/mypage', '/camera', '/market/filter/gender', '/signup', '/solution-summary'];

/** 각 언어에서 솔루션 화면에 반드시 보여야 하는 문구 */
const LANGS = [
  { label: 'English', code: 'en', expect: 'Tonight', routeExpect: { '/mypage': 'My Info', '/market': 'Personalized' } },
  { label: '中文', code: 'zh', expect: '今晚', routeExpect: { '/mypage': '我的信息', '/market': '个性化' } },
  { label: '日本語', code: 'ja', expect: '今夜', routeExpect: { '/mypage': '基本情報', '/market': 'パーソナル' } },
  { label: '한국어', code: 'ko', expect: '오늘 밤', routeExpect: { '/mypage': '내 정보', '/market': '맞춤형' } },
];

/** 한국어 고유 문구 — 다른 언어에서 남아 있으면 미번역 */
const KO_MARKERS = ['오늘 밤', '내일 아침', '오늘의 피부케어', '내 정보', '맞춤형 진단 상품 추천', '인식중', '인식됨'];

const setLang = async (label) => {
  await p.goto(`${BASE}/solution/night`, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  await p.locator('button[aria-label="언어 선택"]').click();
  await p.waitForTimeout(250);
  await p.getByText(label, { exact: true }).click();
  await p.waitForTimeout(450);
};

await p.goto(`${BASE}/`, { waitUntil: 'load' });
await p.evaluate(() => localStorage.clear());

for (const { label, code, expect, routeExpect } of LANGS) {
  await setLang(label);
  check(`${code}: 언어 전환 반영`, (await p.evaluate(() => document.body.innerText)).includes(expect), expect);

  const literalPages = [];
  const untranslated = [];
  for (const r of ROUTES) {
    await p.goto(`${BASE}${r}`, { waitUntil: 'load' });
    await p.waitForTimeout(r === '/camera' ? 1200 : 350);
    const txt = await p.evaluate(() => document.body.innerText);
    if (/\{t\./.test(txt)) literalPages.push(r);
    if (code !== 'ko' && KO_MARKERS.some((m) => txt.includes(m))) untranslated.push(r);
    const want = routeExpect[r];
    if (want && !txt.includes(want)) untranslated.push(`${r}(기대="${want}")`);
  }
  check(`${code}: 치환 안 된 {t.} 리터럴 없음`, literalPages.length === 0, literalPages.join(', ') || '-');
  check(`${code}: 전 라우트 번역 적용`, untranslated.length === 0, untranslated.join(', ') || '-');
}

// 새로고침 후 언어 유지
await setLang('日本語');
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(500);
check('새로고침 후 언어 유지', (await p.evaluate(() => document.body.innerText)).includes('今夜'),
  (await p.evaluate(() => document.body.innerText)).slice(0, 20).replace(/\n/g, ' '));

check('런타임 에러 없음', errors.length === 0, errors.join(' | ') || '-');

await b.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} 통과`);
if (failed.length) process.exitCode = 1;
