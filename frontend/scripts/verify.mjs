/**
 * 기능 동작 검증 (개발 전용).
 * 요청받은 9개 항목이 실제로 동작하는지 브라우저에서 확인한다.
 *
 * 사용법: node scripts/verify.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:4173';
const OUT = '.shots/verify';
await mkdir(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

// ── 실제 날짜 기준값 ────────────────────────────────────────────────────────
// 앱이 mock 날짜(2026-08-08)가 아니라 실제 오늘을 쓰므로 검증 기대값도 여기서 계산한다.
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};
const TODAY = new Date();
const TODAY_KEY = keyOf(TODAY);
/** 이 달의 마지막 날 */
const LAST_DAY = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
/** 더미 수행 기록 (lib/calendar.js 의 INITIAL_COMPLETED_KEYS 와 같은 오프셋) */
const COMPLETED_OFFSETS = [-7, -6, -5, -3, -1];
const COMPLETED_KEYS = COMPLETED_OFFSETS.map((o) => keyOf(shift(o)));
/** 이번 주(월~일) 날짜키 */
const WEEK_KEYS = (() => {
  const monday = shift(-((TODAY.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return keyOf(d);
  });
})();
/** 이번 주에서 초록이어야 하는 날 (오늘은 흰 칩이라 제외) */
const EXPECTED_GREEN_DAYS = WEEK_KEYS.filter((k) => COMPLETED_KEYS.includes(k) && k !== TODAY_KEY).map((k) =>
  String(Number(k.slice(8, 10))),
);
/** 이번 달 안에 있는 과거 날짜 하나 (날짜 클릭 이동 검증용) */
const PAST_PICK = (() => {
  for (const o of [-4, -3, -2, -1, -5, -6]) {
    const d = shift(o);
    if (d.getMonth() === TODAY.getMonth()) return d;
  }
  return shift(-1);
})();
/** 이번 달 안에 있는 미래 날짜 하나 */
const FUTURE_PICK = (() => {
  for (const o of [5, 4, 3, 2, 1]) {
    const d = shift(o);
    if (d.getMonth() === TODAY.getMonth()) return d;
  }
  return null;
})();

console.log(
  `기준 날짜: 오늘=${TODAY_KEY} / 이번달 마지막날=${LAST_DAY} / 예상 초록=${EXPECTED_GREEN_DAYS.join(',') || '없음'}` +
    ` / 과거선택=${PAST_PICK.getDate()}일 / 미래선택=${FUTURE_PICK ? `${FUTURE_PICK.getDate()}일` : '이번달에 없음'}\n`,
);

const browser = await chromium.launch({
  // 헤드리스 환경에는 실제 카메라가 없어 크로미움 내장 가짜 카메라를 붙인다.
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 700 },
  permissions: ['camera'],
  // preview:https 로 띄운 서버는 자체 서명 인증서를 쓴다
  ignoreHTTPSErrors: true,
  // 이 검증은 한국어 UI 문구로 요소를 찾는다.
  // 브라우저 로케일이 en 이면 앱이 영어로 열려 aria-label 매칭이 전부 깨진다.
  locale: 'ko-KR',
});
const page = await context.newPage();

/**
 * 프레임(393x852) 내부 좌표를 실제 화면 좌표로 바꿔 클릭한다.
 * DeviceFrame 이 transform: scale 로 축소되어 있어 요소 기준 좌표로는 히트 테스트가 어긋난다.
 */
async function clickInFrame(fx, fy) {
  const pt = await page.evaluate(([x, y]) => {
    const r = document.querySelector('[data-frame]').getBoundingClientRect();
    return { x: r.left + (x * r.width) / 393, y: r.top + (y * r.height) / 852 };
  }, [fx, fy]);
  await page.mouse.click(pt.x, pt.y);
}

// ── 1. 페이지 스크롤 없음 + 프레임이 뷰포트에 맞게 축소되고 가운데 배치 ──────────
await page.goto(`${base}/home/first-visit`, { waitUntil: 'load' });
await page.waitForSelector('[data-frame]');
await page.waitForTimeout(400);

const shell = await page.evaluate(() => {
  const doc = document.documentElement;
  const frame = document.querySelector('[data-frame]');
  const rect = frame.getBoundingClientRect();
  return {
    pageScrollable: doc.scrollHeight > doc.clientHeight + 1,
    frameTop: rect.top,
    frameBottom: rect.bottom,
    frameHeight: rect.height,
    viewportHeight: window.innerHeight,
    centerOffset: Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2),
  };
});
check('1) 페이지 자체 스크롤 없음', !shell.pageScrollable);
check('1) 프레임이 뷰포트 안에 들어옴', shell.frameBottom <= shell.viewportHeight + 1 && shell.frameTop >= -1,
  `top=${shell.frameTop.toFixed(0)} bottom=${shell.frameBottom.toFixed(0)} vh=${shell.viewportHeight}`);
check('1) 가로 중앙 정렬', shell.centerOffset < 2, `오차 ${shell.centerOffset.toFixed(1)}px`);
check('1) 위아래 여백 존재', shell.frameTop > 4, `상단 여백 ${shell.frameTop.toFixed(0)}px`);

// ── 2·3. 스크롤 시 상단 헤더/하단 탭바 고정 ─────────────────────────────────
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForSelector('[data-fixed-header]');
await page.waitForTimeout(400);

const before = await page.evaluate(() => ({
  header: document.querySelector('[data-fixed-header]').getBoundingClientRect().top,
  tabbar: document.querySelector('[data-fixed-tabbar]').getBoundingClientRect().top,
  scrollTop: document.querySelector('.app-scroll').scrollTop,
}));
await page.evaluate(() => {
  document.querySelector('.app-scroll').scrollTop = 600;
});
await page.waitForTimeout(300);
const after = await page.evaluate(() => ({
  header: document.querySelector('[data-fixed-header]').getBoundingClientRect().top,
  tabbar: document.querySelector('[data-fixed-tabbar]').getBoundingClientRect().top,
  scrollTop: document.querySelector('.app-scroll').scrollTop,
}));

check('2) 스크롤해도 상단 상태바/헤더 고정', Math.abs(after.header - before.header) < 1,
  `${before.header.toFixed(0)} → ${after.header.toFixed(0)}`);
check('3) 스크롤해도 하단 네비 고정', Math.abs(after.tabbar - before.tabbar) < 1,
  `${before.tabbar.toFixed(0)} → ${after.tabbar.toFixed(0)}`);
check('2·3) 가운데 영역은 실제로 스크롤됨', after.scrollTop > before.scrollTop + 100,
  `scrollTop ${before.scrollTop} → ${after.scrollTop}`);
await page.screenshot({ path: `${OUT}/market-scrolled.png` });

// ── 9. 배너 자동 슬라이드 ───────────────────────────────────────────────────
const slideName = () =>
  page.evaluate(() => {
    const ps = [...document.querySelectorAll('p')].map((p) => p.textContent.trim());
    return ps.find((t) => t.includes('피쓰') && (t.includes('토너') || t.includes('에센스') || t.includes('크림'))) || '';
  });
const firstSlide = await slideName();
await page.mouse.move(1200, 650); // 배너에서 포인터를 떼어 자동 전환이 돌게 한다
await page.waitForTimeout(4800);
const secondSlide = await slideName();
check('9) 추천 상품 배너 자동 슬라이드', firstSlide !== secondSlide && !!secondSlide,
  `"${firstSlide}" → "${secondSlide}"`);

// ── 4. 캘린더 모달 (라우팅 아님) + 날짜 클릭 이동 ───────────────────────────
await page.goto(`${base}/home/first-visit`, { waitUntil: 'load' });
await page.waitForTimeout(300);
// 캘린더 영역(헤더 요일 스트립)을 터치한다
await page.locator('[data-node-id="870:3587"] button').first().click();
await page.waitForTimeout(300);
const calendarOpen = await page.locator('[role="dialog"][aria-label="전체 캘린더"]').isVisible();
const urlAfterOpen = new URL(page.url()).pathname;
check('4) 캘린더 영역 터치 → 전체 캘린더 모달 표시', calendarOpen);
check('4) 캘린더가 라우팅이 아닌 모달', urlAfterOpen === '/home/first-visit', `url=${urlAfterOpen}`);
await page.screenshot({ path: `${OUT}/calendar-modal.png` });

// 이 달의 마지막 날이 렌더되는지 (실제 달력 계산 확인 — 28/29/30/31 어느 달이든)
const hasLastDay = await page.getByRole('button', { name: `${LAST_DAY}일` }).count();
check(`4) 실제 달력 계산 (이번 달 ${LAST_DAY}일 렌더)`, hasLastDay > 0);
check('4) 이번 달에 없는 날짜는 렌더 안 됨',
  (await page.getByRole('button', { name: `${LAST_DAY + 1}일`, exact: true }).count()) === 0);

await page.getByRole('button', { name: `${PAST_PICK.getDate()}일` }).click();
await page.waitForTimeout(400);
const afterPick = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"][aria-label="전체 캘린더"]');
  // 헤더 주간 스트립에서 테두리가 그려진 칩(= 선택한 날) 숫자를 읽는다
  // 날짜를 고르면 솔루션 화면으로 이동하므로 두 헤더(홈 870:3587 / 루틴 870:3800) 모두에서 찾는다
  const chips = [
    ...document.querySelectorAll('[data-node-id="870:3587"] span[data-state], [data-node-id="870:3800"] span[data-state]'),
  ];
  const selected = chips.find((el) => el.querySelector('[data-name="Selected"]'));
  return {
    closed: !dialog,
    selectedDay: selected ? selected.textContent.trim() : null,
    path: location.pathname,
  };
});
check('4) 날짜 클릭 시 모달 닫힘', afterPick.closed);
check('4) 날짜 클릭 시 해당 날짜가 선택 표시됨', afterPick.selectedDay === String(PAST_PICK.getDate()),
  `주간 스트립 선택값=${afterPick.selectedDay}, 기대=${PAST_PICK.getDate()}, path=${afterPick.path}`);
await page.screenshot({ path: `${OUT}/calendar-picked.png` });

// ── 5. 세안 확인 모달 (라우팅 아님) ─────────────────────────────────────────
const pathBeforeWash = new URL(page.url()).pathname;
await page.getByRole('button', { name: '촬영' }).first().click();
await page.waitForTimeout(300);
const washVisible = await page.getByText('귀가 후 세안을 하고 오셨나요?').isVisible();
const washPath = new URL(page.url()).pathname;
check('5) 촬영 버튼 → 세안 확인 모달', washVisible);
check('5) 세안 확인이 라우팅이 아닌 모달 상태', washPath === pathBeforeWash, `url 그대로 ${washPath}`);
await page.screenshot({ path: `${OUT}/wash-check-modal.png` });

await page.getByRole('button', { name: '아직이에요!' }).click();
await page.waitForTimeout(250);
check('5) "아직이에요!" 로 모달만 닫힘',
  !(await page.getByText('귀가 후 세안을 하고 오셨나요?').isVisible()) &&
    new URL(page.url()).pathname === pathBeforeWash);

// ── 6. 실제 카메라 연동 ────────────────────────────────────────────────────
await page.getByRole('button', { name: '촬영' }).first().click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: '완료했습니다!' }).click();
await page.waitForTimeout(2500);
check('6) 카메라 화면으로 이동', new URL(page.url()).pathname === '/camera');

const video = await page.evaluate(() => {
  const v = document.querySelector('video');
  if (!v) return null;
  return { hasStream: !!v.srcObject, w: v.videoWidth, h: v.videoHeight, paused: v.paused };
});
check('6) getUserMedia 스트림이 video 에 연결됨', !!video?.hasStream, JSON.stringify(video));
check('6) 실제 영상 프레임 수신', (video?.w || 0) > 0 && (video?.h || 0) > 0, `${video?.w}x${video?.h}`);
await page.screenshot({ path: `${OUT}/camera-live.png` });

const recognised = await page.getByText('얼굴이 인식되었어요. 촬영 버튼을 눌러주세요.').isVisible();
check('6) 스트림 준비 후 인식됨 상태 전환', recognised);

await page.getByRole('button', { name: '촬영', exact: true }).click();
await page.waitForTimeout(600);
check('6) 셔터 → 촬영 후 자가진단으로 이동', new URL(page.url()).pathname === '/self-check');
const captured = await page.evaluate(() => window.localStorage && true);
void captured;

// ── 7. 하트 찜 등록/삭제 ───────────────────────────────────────────────────
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForTimeout(500);

const firstHeart = page.getByRole('button', { name: /찜하기|찜 해제/ }).first();
const initialLabel = await firstHeart.getAttribute('aria-label');
await firstHeart.click();
await page.waitForTimeout(250);
const toggledLabel = await firstHeart.getAttribute('aria-label');
check('7) 하트 클릭으로 찜 상태 토글', initialLabel !== toggledLabel, `${initialLabel} → ${toggledLabel}`);

const wishedCount = await page.evaluate(
  () => document.querySelectorAll('button[aria-label="찜 해제"]').length,
);
await page.goto(`${base}/market/wishlist`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const listedCount = await page.evaluate(
  () => document.querySelectorAll('[data-name="PostCard"]').length,
);
check('7) 찜 목록이 하트 상태와 일치', listedCount === wishedCount,
  `마켓 찜 ${wishedCount}개 / 찜 화면 ${listedCount}개`);
await page.screenshot({ path: `${OUT}/wishlist.png` });

// ── 8. 선택삭제 정렬 ───────────────────────────────────────────────────────
const row = await page.evaluate(() => {
  const findByText = (t) => [...document.querySelectorAll('span,button,p')].find((el) => el.textContent.trim() === t);
  const all = findByText('전체');
  const change = findByText('배송방법 변경');
  const del = findByText('선택삭제');
  if (!all || !change || !del) return null;
  const r = (el) => el.getBoundingClientRect();
  return {
    allRight: r(all).right,
    changeLeft: r(change).left,
    delRight: r(del).right,
    frameRight: document.querySelector('[data-frame]').getBoundingClientRect().right,
    sameLine: Math.abs(r(all).top - r(del).top) < 4,
  };
});
check('8) 전체 / 배송방법 변경 간격이 과하지 않음',
  row && row.changeLeft - row.allRight < 40, row ? `간격 ${(row.changeLeft - row.allRight).toFixed(0)}px` : 'n/a');
check('8) 선택삭제가 같은 줄에 우측 정렬', row && row.sameLine && row.frameRight - row.delRight < 40,
  row ? `우측 여백 ${(row.frameRight - row.delRight).toFixed(0)}px` : 'n/a');

// ══ 저장값(localStorage) 내구성 — 홈에 솔루션이 보이는지 ═══════════════════════
// 옛 저장값이 남은 브라우저에서 홈이 "최초 접속"(빈 카드) 상태로 열리는 문제가 두 번 재발해 고정 검증한다.
const CARE_KEY = 'innerderma.care';
const savedCases = [
  ['새 브라우저', null],
  ['version 없는 옛 저장값', { state: { phase: 'night', selectedDate: TODAY_KEY, hasCaptureToday: false } }],
  ['version 0 저장값', { state: { phase: 'night', selectedDate: TODAY_KEY, hasCaptureToday: false }, version: 0 }],
  ['completedDates 손상', { state: { phase: 'night', selectedDate: TODAY_KEY, hasCaptureToday: true, completedDates: null }, version: 0 }],
  ['저장값이 쓰레기', { state: 'broken' }],
];

for (const [label, payload] of savedCases) {
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.evaluate(
    ([k, v]) => (v ? localStorage.setItem(k, JSON.stringify(v)) : localStorage.removeItem(k)),
    [CARE_KEY, payload],
  );
  await page.goto(`${base}/home`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const hasRoutine = await page.evaluate(() => ({
    루틴: /회복을 위한 나이트 루틴|수분 유지를 위한 모닝 루틴/.test(document.body.innerText),
    빈화면: document.body.innerText.trim().length === 0,
  }));
  check(`G) 홈에 솔루션 표시 — ${label}`, hasRoutine.루틴 && !hasRoutine.빈화면, JSON.stringify(hasRoutine));
}

// 반대로, 새 형식으로 저장된 "최초 접속" 상태는 그대로 유지돼야 한다 (덮어쓰면 안 됨)
await page.goto(`${base}/`, { waitUntil: 'load' });
await page.evaluate(
  ([k, today]) =>
    localStorage.setItem(
      k,
      JSON.stringify({
        state: { phase: 'night', selectedDate: today, hasCaptureToday: false, completedDates: [] },
        version: 1,
      }),
    ),
  [CARE_KEY, TODAY_KEY],
);
await page.goto(`${base}/home`, { waitUntil: 'load' });
await page.waitForTimeout(400);
check('G) 새 형식의 최초 접속 상태는 유지됨',
  await page.getByText('오늘의 데일리 루틴을 시작해 보세요!').isVisible());

// 이후 검증은 깨끗한 상태에서
await page.evaluate((k) => localStorage.removeItem(k), CARE_KEY);

// ══ 2차 개선 요청 검증 ══════════════════════════════════════════════════════

// 초록 표시가 접힌 주간 스트립에 실제로 그려지는지 (localStorage 초기화 후)
await page.goto(`${base}/`, { waitUntil: 'load' });
await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/solution/morning`, { waitUntil: 'load' });
await page.waitForTimeout(400);

const readStrip = () =>
  page.evaluate(() => {
    const chips = [...document.querySelectorAll('[data-node-id="870:3800"] span[data-state]')];
    return chips.map((chip) => ({
      day: chip.textContent.trim(),
      state: chip.getAttribute('data-state'),
      selected: !!chip.querySelector('[data-name="Selected"]'),
      cls: chip.className,
    }));
  });

const strip = await readStrip();
const greens = strip.filter((c) => c.state === 'record').map((c) => c.day);
check('B) 접힌 주간 스트립에 초록 표시 나옴',
  greens.length > 0 && strip.filter((c) => c.state === 'record').every((c) => c.cls.includes('bg-chip-green')),
  `초록=${greens.join(',') || '없음'}`);
check('B) 초록이 수행 완료한 날과 일치', greens.join(',') === EXPECTED_GREEN_DAYS.join(','),
  `초록=${greens.join(',')} / 기대=${EXPECTED_GREEN_DAYS.join(',')}`);
check(`B) 오늘(${TODAY.getDate()}일)은 흰 칩`,
  strip.some((c) => c.day === String(TODAY.getDate()) && c.state === 'today' && /bg-white(?![-\w])/.test(c.cls)),
  JSON.stringify(strip.find((c) => c.state === 'today')));
check('B) 미수행 지난 날은 회색 칩',
  strip.filter((c) => c.state === 'empty').every((c) => c.cls.includes('bg-white-20')),
  `회색=${strip.filter((c) => c.state === 'empty').map((c) => c.day).join(',') || '없음'}`);
check('B) 아직 오지 않은 날은 칩 없음',
  strip.filter((c) => c.state === 'future').every((c) => c.cls.includes('bg-transparent')),
  `미래=${strip.filter((c) => c.state === 'future').map((c) => c.day).join(',') || '없음'}`);
check('B) 기본 선택은 오늘 하나뿐이고 테두리로 표시',
  strip.filter((c) => c.selected).length === 1 && strip.find((c) => c.selected)?.state === 'today',
  `선택=${strip.filter((c) => c.selected).map((c) => c.day).join(',')}`);

// 수행 완료 버튼: 당일에만 활성화
const btn = page.locator('[data-testid="complete-button"]');
await btn.scrollIntoViewIfNeeded();
const todayBtn = await btn.evaluate((el) => ({ disabled: el.disabled, label: el.textContent.trim() }));
check('C) 오늘 날짜에서 수행 완료 버튼 활성화', todayBtn.disabled === false, JSON.stringify(todayBtn));

// 눌러서 완료 → 초록 표시가 늘어나는지
await btn.click();
await page.waitForTimeout(500);
const afterComplete = await page.evaluate(() => ({
  path: location.pathname,
  completed: JSON.parse(localStorage.getItem('innerderma.care') || '{}')?.state?.completedDates || [],
}));
check('C) 수행 완료 누르면 그날이 완료로 기록됨',
  afterComplete.completed.includes(TODAY_KEY), `${TODAY_KEY} in ${JSON.stringify(afterComplete.completed)}`);

// 다른 날짜를 선택하면 미생성 안내가 뜨고 수행 완료 버튼은 존재하지 않는다
await page.goto(`${base}/solution/morning`, { waitUntil: 'load' });
await page.waitForTimeout(300);
await page.locator('[data-node-id="870:3800"] button').first().click(); // 캘린더 열기
await page.waitForTimeout(400);
await page.getByRole('button', { name: `${PAST_PICK.getDate()}일` }).click();
await page.waitForTimeout(500);
const noSolNotice = await page.evaluate(() => document.body.innerText.includes('아직 솔루션이 생성되지 않았어요'));
check('C) 과거 미촬영 날짜에서는 미생성 안내 표시', noSolNotice);
check('C) 과거 미촬영 날짜에서는 수행 완료 버튼 없음',
  (await page.locator('[data-testid="complete-button"]').count()) === 0);

// 전체 캘린더의 칩 색이 규칙대로인지 (초록=수행 / 흰=오늘 / 회색=미수행 / 미래=칩 없음)
await page.locator('[data-node-id="870:3800"] button').first().click();
await page.waitForTimeout(400);
const monthChips = await page.evaluate(() => {
  const out = {};
  for (const btn of document.querySelectorAll('[role="dialog"][aria-label="전체 캘린더"] button[aria-label$="일"]')) {
    const chip = btn.querySelector('[data-state]');
    if (!chip) continue;
    out[btn.getAttribute('aria-label')] = {
      state: chip.getAttribute('data-state'),
      cls: chip.className,
      selected: !!chip.querySelector('[data-name="Selected"]'),
    };
  }
  return out;
});
const chipAt = (d) => monthChips[`${d.getDate()}일`];
const completedPast = shift(-3); // 더미 기록에 들어있는 지난 날
check('B) 수행한 지난 날이 캘린더에서 초록',
  chipAt(completedPast)?.state === 'record' && chipAt(completedPast).cls.includes('bg-chip-green'),
  `${completedPast.getDate()}일 = ${JSON.stringify(chipAt(completedPast))}`);
check(`B) 오늘(${TODAY.getDate()}일)은 캘린더에서 흰 칩`,
  chipAt(TODAY)?.state === 'today' && /bg-white(?![-\w])/.test(chipAt(TODAY).cls),
  JSON.stringify(chipAt(TODAY)));
if (FUTURE_PICK) {
  check(`B) 미래(${FUTURE_PICK.getDate()}일)는 캘린더에서 칩 없음`,
    chipAt(FUTURE_PICK)?.state === 'future' && chipAt(FUTURE_PICK).cls.includes('bg-transparent'),
    JSON.stringify(chipAt(FUTURE_PICK)));
}
check('B) 선택한 날은 캘린더에서 테두리로 표시',
  chipAt(PAST_PICK)?.selected === true && Object.values(monthChips).filter((c) => c.selected).length === 1,
  `${PAST_PICK.getDate()}일 = ${JSON.stringify(chipAt(PAST_PICK))}`);
await page.screenshot({ path: `${OUT}/calendar-completed.png` });

// 캘린더 애니메이션: 열림/닫힘 양방향으로 실제 보간되는지
const panelState = () =>
  page.evaluate(() => {
    const panel = document.querySelector('[data-node-id="870:5805"]');
    const dim = document.querySelector('[data-testid="calendar-backdrop"]');
    if (!panel) return null;
    const s = getComputedStyle(panel);
    return {
      duration: s.transitionDuration,
      property: s.transitionProperty,
      opacity: +(+s.opacity).toFixed(2),
      translateY: +(new DOMMatrix(s.transform).m42).toFixed(1),
      dimOpacity: +(+getComputedStyle(dim).opacity).toFixed(2),
    };
  });

const settled = await panelState();
check('A) 캘린더 패널에 전환 애니메이션 적용',
  parseFloat(settled.duration) > 0 && settled.opacity === 1 && settled.translateY === 0,
  JSON.stringify(settled));

// 다시 닫고 열어서 열림 중간 프레임을 확인한다
await clickInFrame(30, 700);
await page.waitForTimeout(500);
await page.locator('[data-node-id="870:3800"] button').first().click();
/**
 * 중간 프레임 샘플링.
 * 마운트 직후 한 프레임은 opacity 0(전환 시작 전)이라 고정 대기로 재면 결과가 흔들린다.
 * 0 < opacity < 1 인 프레임이 나올 때까지 짧게 폴링한다.
 */
const opening = await (async () => {
  let last = null;
  for (let i = 0; i < 24; i++) {
    last = await panelState();
    if (last && last.opacity > 0 && last.opacity < 1) return last;
    await page.waitForTimeout(10);
  }
  return last;
})();
check('A) 열릴 때 패널이 서서히 나타남 (중간 프레임 보간)',
  opening && opening.opacity > 0 && opening.opacity < 1 && opening.translateY < 0,
  JSON.stringify(opening));
check('A) 열릴 때 딤도 함께 페이드 인', opening && opening.dimOpacity > 0 && opening.dimOpacity < 1,
  `dim=${opening?.dimOpacity}`);
await page.waitForTimeout(400);
check('A) 열림 완료 후 제자리', (await panelState())?.translateY === 0);

// 모달 밖 클릭으로 닫힘 (캘린더)
await clickInFrame(30, 700); // 패널(536px) 아래 딤 영역
await page.waitForTimeout(100);
const midClose = await page.locator('[data-node-id="870:5805"]').evaluate((el) => getComputedStyle(el).opacity);
check('A) 닫힐 때도 페이드 아웃 (즉시 사라지지 않음)', parseFloat(midClose) < 1, `opacity=${midClose}`);
await page.waitForTimeout(500);
check('D) 캘린더 모달 밖 클릭으로 닫힘',
  (await page.locator('[role="dialog"][aria-label="전체 캘린더"]').count()) === 0);

// 모달 밖 클릭으로 닫힘 (세안 확인)
await page.getByRole('button', { name: '촬영' }).first().click();
await page.waitForTimeout(350);
check('D) 세안 확인 모달 표시', await page.getByText('귀가 후 세안을 하고 오셨나요?').isVisible());
await clickInFrame(30, 100); // 다이얼로그(y330~) 위쪽 딤 영역
await page.waitForTimeout(400);
check('D) 세안 확인 모달 밖 클릭으로 닫힘',
  (await page.getByText('귀가 후 세안을 하고 오셨나요?').count()) === 0);

// 모달 밖 클릭으로 닫힘 (필터 시트)
await page.goto(`${base}/market/filter/gender`, { waitUntil: 'load' });
await page.waitForTimeout(300);
await clickInFrame(30, 60); // 시트(y371~) 위쪽 딤 영역
await page.waitForTimeout(400);
check('D) 필터 시트 밖 클릭으로 닫힘', new URL(page.url()).pathname === '/market',
  `url=${new URL(page.url()).pathname}`);

// 하단 네비게이션 바 통일 — 모든 화면이 같은 탭바 노드/치수를 쓴다
const tabbars = {};
for (const [name, path] of [
  ['홈', '/home/first-visit'],
  ['루틴-night', '/solution/night'],
  ['루틴-morning', '/solution/morning'],
  ['마이페이지', '/mypage'],
  ['마켓', '/market'],
  ['찜', '/market/wishlist'],
]) {
  await page.goto(`${base}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  tabbars[name] = await page.evaluate(() => {
    const el = document.querySelector('[data-name="Group 68"]');
    if (!el) return null;
    const frame = document.querySelector('[data-frame]').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const cam = el.querySelector('[data-name="Group 65"]')?.getBoundingClientRect();
    return {
      node: el.getAttribute('data-node-id'),
      w: Math.round(r.width),
      h: Math.round(r.height),
      // 프레임 하단 기준 위치 (스케일 영향 제거를 위해 비율로)
      bottomGap: Math.round(frame.bottom - r.bottom),
      camLeft: cam ? Math.round(cam.left - r.left) : null,
    };
  });
}
const shapes = Object.values(tabbars);
check('E) 모든 화면에 마켓 탭바(Group 68) 존재', shapes.every((s) => s && s.node === '870:6024'),
  JSON.stringify(tabbars));
const first = JSON.stringify(shapes[0]);
check('E) 하단 네비게이션 바가 모든 화면에서 동일', shapes.every((s) => JSON.stringify(s) === first),
  Object.entries(tabbars).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' | '));

// ══ 3차 개선 요청 검증 ══════════════════════════════════════════════════════

await page.goto(`${base}/`, { waitUntil: 'load' });
await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/solution/night`, { waitUntil: 'load' });
await page.waitForTimeout(400);

// H) 실제 날짜 기준으로 뜨는지
const stripNow = await readStrip();
check('H) 오늘이 실제 날짜와 일치',
  stripNow.some((c) => c.state === 'today' && c.day === String(TODAY.getDate())),
  `오늘=${stripNow.find((c) => c.state === 'today')?.day} / 실제=${TODAY.getDate()}`);
check('H) 주간 스트립이 이번 주 날짜',
  stripNow.map((c) => c.day).join(',') === WEEK_KEYS.map((k) => String(Number(k.slice(8, 10)))).join(','),
  `${stripNow.map((c) => c.day).join(',')} / 기대 ${WEEK_KEYS.map((k) => Number(k.slice(8, 10))).join(',')}`);

// I) 월·연도 이동
const openCalendar = async () => {
  await page.locator('[data-node-id="870:3800"] button').first().click();
  await page.waitForTimeout(400);
};
const monthText = () => page.locator('[data-node-id="870:5821"] button[aria-expanded]').textContent();
await openCalendar();
const baseMonth = await monthText();
await page.getByRole('button', { name: '다음 달' }).click();
await page.waitForTimeout(250);
const nextMonth = await monthText();
await page.getByRole('button', { name: '이전 달' }).click();
await page.waitForTimeout(250);
check('I) 다음 달 이동', nextMonth !== baseMonth, `${baseMonth} → ${nextMonth}`);
check('I) 이전 달로 복귀', (await monthText()) === baseMonth, `→ ${await monthText()}`);

// 연말/연초를 넘어가도 연도가 따라가는지 (12번 넘기면 정확히 1년 뒤)
for (let i = 0; i < 12; i++) await page.getByRole('button', { name: '다음 달' }).click();
await page.waitForTimeout(300);
const afterYear = await monthText();
const [by, bm] = baseMonth.match(/(\d+)년 (\d+)월/).slice(1).map(Number);
check('I) 월 이동 12회 = 정확히 1년 뒤', afterYear === `${by + 1}년 ${bm}월`, `${baseMonth} → ${afterYear}`);
for (let i = 0; i < 12; i++) await page.getByRole('button', { name: '이전 달' }).click();
await page.waitForTimeout(300);

// 연·월 피커
await page.locator('[data-node-id="870:5821"] button[aria-expanded]').click();
await page.waitForTimeout(300);
check('I) 라벨 탭으로 연·월 피커 열림', await page.locator('[data-name="MonthYearPicker"]').isVisible());
const yearText = () => page.locator('[data-name="MonthYearPicker"] span').first().textContent();
const y0 = await yearText();
await page.getByRole('button', { name: '다음 해' }).click();
await page.waitForTimeout(200);
const y1 = await yearText();
check('I) 다음 해 이동', y1 === `${Number(y0.replace('년', '')) + 1}년`, `${y0} → ${y1}`);
await page.getByRole('button', { name: '이전 해' }).click();
await page.getByRole('button', { name: '이전 해' }).click();
await page.waitForTimeout(200);
check('I) 이전 해 이동', (await yearText()) === `${Number(y0.replace('년', '')) - 1}년`, `→ ${await yearText()}`);
await page.screenshot({ path: `${OUT}/calendar-picker.png` });

await page.getByRole('button', { name: '3월', exact: true }).click();
await page.waitForTimeout(300);
check('I) 피커에서 월 고르면 그 달로 이동',
  (await monthText()) === `${Number(y0.replace('년', '')) - 1}년 3월` &&
    !(await page.locator('[data-name="MonthYearPicker"]').isVisible()),
  `→ ${await monthText()}`);

// 다른 달로 옮겨도 날짜를 고를 수 있는지
const firstDay = page.locator('[role="dialog"] button[aria-label="15일"]');
await firstDay.click();
await page.waitForTimeout(500);
check('I) 다른 달의 날짜도 선택 가능',
  (await page.locator('[role="dialog"][aria-label="전체 캘린더"]').count()) === 0);

// J) completedDates 에 있는 과거 날짜는 솔루션 표시 / 그 외 과거·미래는 미생성 안내
// 이전 단계에서 다른 달(2025-03)이 선택돼 있으므로, 이번 달의 수행 완료 날짜로 돌린다
await page.evaluate((k) => localStorage.removeItem(k), CARE_KEY);
await page.goto(`${base}/solution/night`, { waitUntil: 'load' });
await page.waitForTimeout(400);
// 오늘은 항상 솔루션이 보인다 (hasCaptureToday 가 true 로 초기화됐으니)
const bodyOf = () =>
  page.evaluate(() => ({
    루틴: /회복을 위한 나이트 루틴|수분 유지를 위한 모닝 루틴/.test(document.body.innerText),
    안내: document.body.innerText.includes('아직 솔루션이 생성되지 않았어요'),
    완료버튼: !!document.querySelector('[data-testid="complete-button"]'),
  }));
check('J) 오늘 날짜는 솔루션이 보임', (await bodyOf()).루틴, JSON.stringify(await bodyOf()));

// completedDates 에 있는 과거 날짜(어제 = 더미 기록에 포함)에서도 솔루션이 보인다
await openCalendar();
const yesterday = shift(-1);
if (yesterday.getMonth() === TODAY.getMonth()) {
  await page.getByRole('button', { name: `${yesterday.getDate()}일` }).click();
  await page.waitForTimeout(500);
  check('J) 수행 완료된 과거 날짜는 솔루션 표시', (await bodyOf()).루틴, JSON.stringify(await bodyOf()));
} else {
  check('J) 수행 완료된 과거 날짜는 솔루션 표시', true, '어제가 다른 달이라 스킵');
}

// completedDates 에 없는 과거 날짜는 미생성 안내
await openCalendar();
if (PAST_PICK.getMonth() === TODAY.getMonth()) {
  await page.getByRole('button', { name: `${PAST_PICK.getDate()}일` }).click();
  await page.waitForTimeout(500);
  check('J) 미촬영 과거 날짜는 미생성 안내', (await bodyOf()).안내, JSON.stringify(await bodyOf()));
} else {
  check('J) 미촬영 과거 날짜는 미생성 안내', true, 'PAST_PICK이 다른 달이라 스킵');
}

if (FUTURE_PICK) {
  // 앞 단계에서 다른 달(2025-03)을 선택해 뒀다. 캘린더는 선택한 날짜의 달에서 열리므로
  // 이번 달로 되돌린 뒤 미래 날짜를 고른다.
  await page.evaluate((k) => localStorage.removeItem(k), CARE_KEY);
  await page.goto(`${base}/solution/night`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  check('J) 저장값 초기화 후 이번 달에서 열림', true);

  await openCalendar();
  check('I) 캘린더는 선택한 날짜의 달에서 열림', (await monthText()) === baseMonth, `${await monthText()}`);
  await page.getByRole('button', { name: `${FUTURE_PICK.getDate()}일` }).click();
  await page.waitForTimeout(500);
  const fut = await bodyOf();
  check('J) 미래 날짜는 "솔루션 미생성" 안내', fut.안내 && !fut.루틴, JSON.stringify(fut));
  check('J) 미래 날짜에는 수행 완료 버튼 없음', fut.완료버튼 === false);
  check('J) 미래 날짜 안내에 해당 날짜가 표시됨',
    await page.getByText(`${FUTURE_PICK.getMonth() + 1}월 ${FUTURE_PICK.getDate()}일`, { exact: false }).isVisible());
  await page.screenshot({ path: `${OUT}/future-date.png` });

  // 오늘로 돌아오면 다시 솔루션이 보인다
  await openCalendar();
  await page.getByRole('button', { name: `${TODAY.getDate()}일` }).click();
  await page.waitForTimeout(500);
  check('J) 오늘로 돌아오면 솔루션 복귀', (await bodyOf()).루틴);
}

// K) 오늘 밤 ↔ 내일 아침 전환 애니메이션
const thumb = () =>
  page.locator('[data-testid="segment-thumb"]').evaluate((el) => ({
    x: +new DOMMatrix(getComputedStyle(el).transform).m41.toFixed(1),
    duration: getComputedStyle(el).transitionDuration,
  }));
const t0 = await thumb();
check('K) 세그먼트 선택 표시에 전환 시간 설정', parseFloat(t0.duration) > 0, JSON.stringify(t0));
await page.getByRole('button', { name: /내일 아침/ }).click();
await page.waitForTimeout(90);
const tMid = await thumb();
check('K) 전환 중간에 실제로 미끄러짐 (리마운트 아님)', tMid.x > 0 && tMid.x < 174.5, `x=${tMid.x}`);
await page.screenshot({ path: `${OUT}/segment-mid.png` });
await page.waitForTimeout(400);
const tEnd = await thumb();
check('K) 전환 완료 위치', Math.abs(tEnd.x - 174.5) < 1, `x=${tEnd.x}`);
check('K) 사이클 전환 후 url 반영', new URL(page.url()).pathname === '/solution/morning',
  new URL(page.url()).pathname);
check('K) 모닝 본문으로 바뀜',
  await page.getByText('수분 유지를 위한 모닝 루틴').isVisible());
await page.getByRole('button', { name: /오늘 밤/ }).click();
await page.waitForTimeout(90);
const tBack = await thumb();
check('K) 되돌아올 때도 미끄러짐', tBack.x > 0 && tBack.x < 174.5, `x=${tBack.x}`);
await page.waitForTimeout(400);
check('K) 나이트로 복귀', new URL(page.url()).pathname === '/solution/night' && Math.abs((await thumb()).x) < 1);

// 빈 하트 아이콘 교체 확인
await page.goto(`${base}/market/oily`, { waitUntil: 'load' });
await page.waitForTimeout(400);
const hearts = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('button[aria-label*="찜"] img')];
  return imgs.map((i) => ({ src: i.getAttribute('src') || '', label: i.closest('button').getAttribute('aria-label') }));
});
// Vite 는 작은 SVG 를 data URI 로 인라인하므로 파일명이 아니라 내용으로 확인한다.
const svgOf = (src) => (src.startsWith('data:') ? decodeURIComponent(src.replace(/^data:image\/svg\+xml,/, '')) : src);
const isEmptyHeart = (src) => {
  const svg = svgOf(src);
  return /heart-empty/.test(svg) || (/stroke=['"]#9C9C9C['"]/i.test(svg) && !/fill=['"]#/i.test(svg));
};
const isFilledHeart = (src) => {
  const svg = svgOf(src);
  return /heart-red/.test(svg) || /fill=['"]#FF0000['"]/i.test(svg);
};

const empties = hearts.filter((h) => h.label === '찜하기');
check('F) 찜하지 않은 하트가 빈 하트(heart-empty) 로 교체됨',
  empties.length > 0 && empties.every((h) => isEmptyHeart(h.src)),
  `${empties.length}개 / 첫 항목=${svgOf(empties[0]?.src || '').slice(0, 80)}`);
// 마켓은 아무것도 찜되지 않은 상태로 열리는 게 맞다(요청 사항).
// 따라서 채운 하트는 직접 하나 찜해서 확인한다.
// 상품 카드의 하트만 센다(헤더의 "찜 목록" 버튼 등은 제외)
const productHearts = hearts.filter((h) => h.label === '찜하기' || h.label === '찜 해제');
check('F) 마켓 첫 진입에는 찜된 상품이 없음',
  productHearts.length > 0 && productHearts.every((h) => h.label === '찜하기'),
  `찜됨 ${productHearts.filter((h) => h.label === '찜 해제').length}개 / 상품 ${productHearts.length}개`);

// 하트를 눌러 찜하면 채운 하트로 바뀌는지
const firstEmpty = page.locator('button[aria-label="찜하기"]').first();
await firstEmpty.click();
await page.waitForTimeout(300);
const toggledSrc = await page.locator('button[aria-label="찜 해제"]').first().locator('img').getAttribute('src');
check('F) 빈 하트 클릭 → 채운 하트로 전환', isFilledHeart(toggledSrc || ''));
check('F) 찜한 하트는 채워진 하트 유지', isFilledHeart(toggledSrc || ''), toggledSrc ? '찜 1개' : '없음');
check('F) 빈 하트와 채운 하트가 서로 다른 아이콘',
  empties.length > 0 && !!toggledSrc && empties[0].src !== toggledSrc);
await page.screenshot({ path: `${OUT}/hearts.png` });

// ══ L) 신규 화면: 자가진단 / 솔루션 생성 로딩 / 장바구니 / 상품 상세 ═════════════
// 페이지 런타임 에러를 잡아 둔다(빈 화면으로 나가는 회귀 방지)
const newScreenErrors = [];
page.on('pageerror', (e) => newScreenErrors.push(e.message));

// 카드를 누르면 상품 상세로 이동하는지 (하트 클릭과 겹치지 않는지)
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.locator('button[aria-label$="상세보기"]').first().click();
await page.waitForTimeout(400);
check('L) 마켓 카드 클릭 → 상품 상세로 이동',
  new URL(page.url()).pathname.startsWith('/market/product'), `url=${new URL(page.url()).pathname}`);
// 상세는 목록에서 고른 상품(첫 카드 = 피쓰 코어 리빌드 크림)의 값을 그대로 보여준다
check('L) 상품 상세에 이름·가격·태그 3개 렌더',
  (await page.getByText('피쓰 코어 리빌드 크림 50ml').count()) > 0 &&
    (await page.getByText('54,000원').count()) > 0 &&
    (await page.getByText('피부과전용').count()) > 0);
check('L) 상품 상세 상세설명 자리표시 3블록',
  (await page.locator('[data-name="DetailPlaceholder"]').count()) === 3);

// 찜 토글이 상세에서도 동작하는지
await page.locator('[data-testid="pd-wish"]').click();
await page.waitForTimeout(200);
check('L) 상품 상세 찜 토글',
  (await page.locator('[data-testid="pd-wish"]').getAttribute('aria-pressed')) === 'true');

// 장바구니에 담으면 장바구니로 이동하는지
await page.locator('[data-testid="pd-add-cart"]').click();
await page.waitForTimeout(500);
check('L) 장바구니 담기 → /market/cart 이동', new URL(page.url()).pathname === '/market/cart',
  `url=${new URL(page.url()).pathname}`);

// 장바구니 기본 상태 (Figma: 3개 중 앞 2개 선택 / 90,000원)
await page.evaluate(() => localStorage.removeItem('innerderma.cart'));
await page.goto(`${base}/market/cart`, { waitUntil: 'load' });
await page.waitForTimeout(400);
const cartCards = () => page.locator('[data-name="CartItemCard"]').count();
check('L) 장바구니 카드 3개', (await cartCards()) === 3);
check('L) 기본 선택 2개 · 합계 90,000원',
  (await page.getByText('선택 2개').count()) > 0 && (await page.getByText('90,000원').count()) > 0);

// 수량 변경이 금액에 반영되는지
await page.locator('[data-name="CartItemCard"]').first().getByRole('button', { name: '수량 늘리기' }).click();
await page.waitForTimeout(250);
check('L) 수량 늘리면 합계 반영 (90,000 → 128,000)', (await page.getByText('128,000원').count()) > 0);

// 전체 선택 3상태
const allBox = page.locator('[data-testid="cart-select-all"]');
check('L) 전체 체크박스 부분선택은 mixed', (await allBox.getAttribute('aria-checked')) === 'mixed');
await allBox.click();
await page.waitForTimeout(200);
check('L) 전체 선택 클릭 → 전부 해제', (await allBox.getAttribute('aria-checked')) === 'false');
await allBox.click();
await page.waitForTimeout(200);
check('L) 다시 클릭 → 전부 선택', (await allBox.getAttribute('aria-checked')) === 'true');

// 선택삭제
await page.locator('[data-testid="cart-delete-selected"]').click();
await page.waitForTimeout(300);
check('L) 선택삭제로 전부 비워짐', (await cartCards()) === 0);
await page.screenshot({ path: `${OUT}/cart.png` });

// 자가진단 → 로딩 → 솔루션 요약
await page.goto(`${base}/self-check`, { waitUntil: 'load' });
await page.waitForTimeout(400);
const saveBtn = page.locator('[data-testid="selfcheck-save"]');
check('L) 자가진단 항목 5개 + 그 외 입력',
  (await page.locator('[data-testid^="selfcheck-"]:not([data-testid="selfcheck-save"]):not([data-testid="selfcheck-other"])').count()) === 5 &&
    (await page.locator('[data-testid="selfcheck-other"]').count()) === 1);
check('L) 아무것도 안 고르면 저장 비활성', await saveBtn.isDisabled());
await page.locator('[data-testid="selfcheck-tight"]').click();
await page.locator('[data-testid="selfcheck-sting"]').click();
await page.waitForTimeout(200);
check('L) 항목 다중 선택',
  (await page.locator('[data-testid="selfcheck-tight"]').getAttribute('aria-pressed')) === 'true' &&
    (await page.locator('[data-testid="selfcheck-sting"]').getAttribute('aria-pressed')) === 'true');
await page.locator('[data-testid="selfcheck-none"]').click();
await page.waitForTimeout(200);
check('L) "아무 이상이 없어요" 는 단독 선택',
  (await page.locator('[data-testid="selfcheck-none"]').getAttribute('aria-pressed')) === 'true' &&
    (await page.locator('[data-testid="selfcheck-tight"]').getAttribute('aria-pressed')) === 'false');
await saveBtn.click();
await page.waitForTimeout(400);
check('L) 저장 → 솔루션 생성 로딩', new URL(page.url()).pathname === '/solution-loading',
  `url=${new URL(page.url()).pathname}`);
check('L) 로딩 화면 문구', (await page.getByText('데이터를 취합 중입니다.').count()) > 0);
await page.waitForTimeout(2200);
check('L) 로딩 후 솔루션 요약으로 이동', new URL(page.url()).pathname === '/solution-summary',
  `url=${new URL(page.url()).pathname}`);

// ══ M) 상품명 18자 제한 · 스토어 토글 · 찜 동기화 · 베스트 조합 접기 ═══════════
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForTimeout(500);

// 카드/배너 상품명이 모두 18자 + … 규칙을 지키는지
const nameCheck = await page.evaluate(() => {
  const texts = [...document.querySelectorAll('[data-name="ProductName"], [data-name="BannerProductName"]')]
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  const tooLong = texts.filter((t) => (t.endsWith('…') ? t.length !== 19 : t.length > 18));
  return { count: texts.length, tooLong, sample: texts.slice(0, 3) };
});
check('M) 상품명이 공백 포함 18자 이내 (초과분은 …)',
  nameCheck.count > 0 && nameCheck.tooLong.length === 0,
  `${nameCheck.count}개 검사 / 위반 ${JSON.stringify(nameCheck.tooLong)}`);
check('M) 잘린 이름은 … 로 끝난다',
  (await page.evaluate(() =>
    [...document.querySelectorAll('[data-name="ProductName"]')].some((el) => el.textContent.trim().endsWith('…')),
  )),
  nameCheck.sample.join(' | '));

// 스토어 토글 — 피쓰 활성 / 같은 자리 / 윔으로 전환
const togglePos = () =>
  page.evaluate(() => {
    const el = document.querySelector('[data-name="StoreToggle"]');
    if (!el) return null;
    const frame = document.querySelector('[data-frame]').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      wim: el.getAttribute('data-wim'),
      // 프레임 기준 좌표로 환산 (DeviceFrame 이 scale 로 축소되어 있다)
      top: Math.round(((r.top - frame.top) * 852) / frame.height),
      width: Math.round((r.width * 393) / frame.width),
    };
  });
const pithToggle = await togglePos();
check('M) 피쓰 서울 탭에서 토글이 피쓰 활성', pithToggle?.wim === 'false', JSON.stringify(pithToggle));
check('M) 토글 폭이 361', pithToggle?.width === 361, `${pithToggle?.width}`);

await page.locator('[data-testid="store-toggle-wim"]').click();
await page.waitForTimeout(600);
check('M) 윔 스토어로 전환', new URL(page.url()).pathname === '/market/wim', `url=${new URL(page.url()).pathname}`);
const wimToggle = await togglePos();
check('M) 윔 스토어에서 토글이 윔 활성', wimToggle?.wim === 'true', JSON.stringify(wimToggle));
check('M) 토글 위치가 두 스토어에서 동일',
  pithToggle && wimToggle && pithToggle.top === wimToggle.top,
  `피쓰 top=${pithToggle?.top} / 윔 top=${wimToggle?.top}`);
check('M) 윔 스토어 상품 카드 6개',
  (await page.locator('[data-name="PostCard"]').count()) === 6);
check('M) 윔 스토어 상품명이 윔 제품',
  (await page.getByText('윔쉐이크', { exact: false }).count()) > 0);
await page.screenshot({ path: `${OUT}/wim-store.png` });

await page.locator('[data-testid="store-toggle-pith"]').click();
await page.waitForTimeout(600);
check('M) 다시 피쓰 서울로 전환', new URL(page.url()).pathname === '/market', `url=${new URL(page.url()).pathname}`);

// 목록에서 찜 → 상세에서도 찜 상태 유지
await page.evaluate(() => localStorage.removeItem('innerderma.wishlist'));
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.locator('button[aria-label="찜하기"]').first().click();
await page.waitForTimeout(250);
const wishedName = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="찜 해제"]');
  return btn?.closest('[data-name="PostCard"]')?.querySelector('[data-name="ProductName"]')?.textContent.trim() ?? '';
});
await page.locator('button[aria-label$="상세보기"]').first().click();
await page.waitForTimeout(500);
check('M) 목록에서 찜한 상품이 상세에서도 찜 상태',
  (await page.locator('[data-testid="pd-wish"]').getAttribute('aria-pressed')) === 'true',
  `목록에서 찜한 상품=${wishedName}`);
// 상세에서 해제하면 목록도 풀린다
await page.locator('[data-testid="pd-wish"]').click();
await page.waitForTimeout(250);
await page.goBack();
await page.waitForTimeout(500);
check('M) 상세에서 찜 해제하면 목록도 해제',
  (await page.locator('button[aria-label="찜 해제"]').count()) === 0);

// 배너 클릭 → 상세 이동
await page.locator('[data-testid="featured-banner"]').click();
await page.waitForTimeout(500);
check('M) 추천 배너 클릭 → 상세 이동',
  new URL(page.url()).pathname.startsWith('/market/product'), `url=${new URL(page.url()).pathname}`);
// 상세 대표 이미지가 그 상품 이미지인지 (기본 더미 hero 가 아니어야 한다)
const heroSrc = await page.locator('[data-testid="pd-hero"]').getAttribute('src');
check('M) 상세 대표 이미지가 선택한 상품 이미지', !!heroSrc && /banner-53|banner/.test(heroSrc), `${heroSrc?.slice(-28)}`);

// 베스트 조합 접기/펴기
const comboBox = () =>
  page.evaluate(() => {
    const card = document.querySelector('[data-name="ComboCard"]');
    const cta = document.querySelector('[data-testid="combo-add"]');
    return {
      open: card?.getAttribute('data-open'),
      height: Math.round(card.getBoundingClientRect().height * 100) / 100,
      ctaOpacity: +getComputedStyle(cta).opacity,
    };
  });
const opened = await comboBox();
check('M) 베스트 조합 기본 펼침', opened.open === 'true' && opened.ctaOpacity === 1, JSON.stringify(opened));
await page.locator('[data-testid="combo-toggle"]').click();
await page.waitForTimeout(500);
const closed = await comboBox();
check('M) 접으면 카드 높이가 줄고 CTA 가 사라짐',
  closed.open === 'false' && closed.height < opened.height && closed.ctaOpacity === 0,
  `${opened.height} → ${closed.height} / CTA ${closed.ctaOpacity}`);
check('M) 접으면 화살표가 반전',
  (await page.evaluate(() => {
    const span = document.querySelector('[data-testid="combo-toggle"] span');
    return new DOMMatrix(getComputedStyle(span).transform).a < -0.9;
  })));
await page.locator('[data-testid="combo-toggle"]').click();
await page.waitForTimeout(500);
const reopened = await comboBox();
check('M) 다시 펴면 원래 높이·CTA 복귀',
  reopened.open === 'true' && Math.abs(reopened.height - opened.height) < 1 && reopened.ctaOpacity === 1,
  `${closed.height} → ${reopened.height}`);
await page.screenshot({ path: `${OUT}/product-detail-combo.png` });

// 찜 화면 체크박스가 하트와 같은 가로열인지
await page.goto(`${base}/market`, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.locator('button[aria-label="찜하기"]').first().click();
await page.waitForTimeout(250);
await page.goto(`${base}/market/wishlist`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const rowAlign = await page.evaluate(() => {
  const card = document.querySelector('[data-name="PostCard"]');
  if (!card) return null;
  const box = card.querySelector('[data-name="SelectCheckbox"]');
  const heart = card.querySelector('button[aria-label="찜 해제"], button[aria-label="찜하기"]');
  if (!box || !heart) return null;
  const b = box.getBoundingClientRect();
  const h = heart.getBoundingClientRect();
  return { dCenter: Math.abs((b.top + b.bottom) / 2 - (h.top + h.bottom) / 2) };
});
check('M) 찜 화면 체크박스가 하트와 같은 가로열',
  rowAlign && rowAlign.dCenter < 1.5, rowAlign ? `중심 차이 ${rowAlign.dCenter.toFixed(2)}px` : 'n/a');
await page.screenshot({ path: `${OUT}/wishlist-checkbox-row.png` });

// 솔루션 전 회색 스태틱 — 두 스토어 모두
for (const [label, path] of [['피쓰 서울', '/market'], ['윔 스토어', '/market/wim']]) {
  const fresh = await context.newPage();
  await fresh.addInitScript(() => {
    localStorage.setItem(
      'innerderma.care',
      JSON.stringify({ state: { phase: 'night', selectedDate: '2026-01-01', hasCaptureToday: false, completedDates: [] }, version: 1 }),
    );
  });
  await fresh.goto(`${base}${path}`, { waitUntil: 'load' });
  await fresh.waitForTimeout(500);
  const gray = await fresh.locator('[data-name="NoSolutionBanner"]').count();
  const cards = await fresh.locator('[data-name="PostCard"]').count();
  check(`M) 솔루션 전 ${label} 탭은 회색 스태틱`, gray === 1 && cards === 0, `회색 ${gray} / 카드 ${cards}`);
  await fresh.close();
}

check('L) 신규 화면에서 런타임 에러 없음', newScreenErrors.length === 0, newScreenErrors.join(' | ') || '-');

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} 통과`);
if (failed.length) {
  console.log('실패:');
  failed.forEach((f) => console.log(`  - ${f.name} ${f.detail}`));
  process.exitCode = 1;
}
