/**
 * 다국어 검증 (개발 전용).
 * 4개 언어 × 주요 라우트를 돌며
 *  1) {t.xxx} 리터럴이 노출되지 않는지
 *  2) 실제로 해당 언어로 번역됐는지 (기대 문구 존재 + 한국어 잔존 여부)
 *     — 한국어 잔존 검사만 예외를 두는 라우트는 KO_MARKER_SKIP_ROUTES 참고
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
  { label: 'English', code: 'en', expect: 'Tonight', routeExpect: { '/mypage': 'My Info', '/market': 'Daily Analysis' } },
  { label: '中文', code: 'zh', expect: '今晚', routeExpect: { '/mypage': '我的信息', '/market': '每日分析' } },
  { label: '日本語', code: 'ja', expect: '今夜', routeExpect: { '/mypage': '基本情報', '/market': 'デイリー分析' } },
  { label: '한국어', code: 'ko', expect: '오늘 밤', routeExpect: { '/mypage': '내 정보', '/market': '데일리 분석' } },
];

/** 한국어 고유 문구 — 다른 언어에서 남아 있으면 미번역 */
const KO_MARKERS = ['오늘 밤', '내일 아침', '오늘의 피부케어', '내 정보', '데일리 분석 맞춤 상품 추천', '인식중', '인식됨'];

/**
 * KO_MARKERS(한국어 누출) 검사만 건너뛰는 라우트 → 이유.
 *
 * ⚠️ 임시 예외다. 번역 작업을 재개하면 이 목록을 비우고(또는 해당 항목을 지우고)
 *    다시 전 라우트에서 한국어 누출 검사가 돌게 해야 한다.
 *    이 예외를 방치하면 해당 라우트의 진짜 미번역 누출을 영구히 놓친다.
 *
 * 이 목록은 KO_MARKERS 검사에만 적용된다.
 * `{t.xxx}` 원시 리터럴 누출 검사, routeExpect 기대 문구 검사, 런타임 에러 검사는
 * 이 라우트에도 그대로 적용된다.
 */
const KO_MARKER_SKIP_ROUTES = {
  '/home/first-visit':
    '기본 솔루션 문구(constants/basicSolution.js)를 의도적으로 한국어 하드코딩했다. '
    + '근거: .kiro/steering/i18n-multilingual.md(퍼블리싱 완료까지 번역 보류, 새 화면은 한국어 하드코딩) '
    + '+ .kiro/specs/first-visit-basic-solution/requirements.md 12.3'
    + '("한국어 외 언어 선택 시에도 기본 솔루션 문구를 한국어로 표시한다 — 의도된 동작이며 '
    + '언어별 표시 검증은 번역 재개 시점에 다룬다").',
};

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
    // KO_MARKERS 검사는 KO_MARKER_SKIP_ROUTES 에 등록된 라우트에서만 건너뛴다(위 주석 참고).
    if (code !== 'ko' && !KO_MARKER_SKIP_ROUTES[r] && KO_MARKERS.some((m) => txt.includes(m))) untranslated.push(r);
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
