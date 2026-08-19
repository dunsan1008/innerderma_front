/**
 * 캘린더 계산 유틸.
 *
 * 모든 날짜는 'YYYY-MM-DD' 문자열(= dateKey)로 다룬다.
 * 예전에는 Figma 프레임에 그려진 2026년 8월 한 달만 상수로 두고 "며칠"이라는 숫자로 계산했는데,
 * 월·연도 이동을 지원하려면 달을 넘나들어야 해서 날짜키를 기본 단위로 바꿨다.
 *
 * 칩 표시 규칙
 *  - 'record' : 그날 솔루션을 수행 완료함  → 초록 칩
 *  - 'today'  : 오늘                      → 흰 칩 + 검정 글씨
 *  - 'empty'  : 지난 날인데 수행 기록 없음  → 회색 칩
 *  - 'future' : 아직 오지 않은 날           → 칩 없음
 *
 * "선택한 날"은 색이 아니라 **테두리**로 따로 표시한다(상태와 독립).
 * 수행 완료 여부는 careStore 의 `completedDates` 가 들고 있고, 이 모듈은 그 목록을 받아 상태만 계산한다.
 */

const pad = (n) => String(n).padStart(2, '0');

/** {year, month, day} → 'YYYY-MM-DD' (month 는 1~12) */
export function toDateKey({ year, month, day }) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** 'YYYY-MM-DD' → {year, month, day} */
export function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return { year, month, day };
}

/** 하위 호환: 날짜키에서 '일'만 뽑는다 */
export function dayFromDateKey(dateKey) {
  return parseDateKey(dateKey).day;
}

/** 날짜키 → Date (로컬 자정) */
function toDate(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(year, month - 1, day);
}

/** Date → 날짜키 */
function fromDate(d) {
  return toDateKey({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });
}

/**
 * 실제 오늘.
 * 백엔드 연동 시에는 서버가 판단한 현지 날짜로 교체한다(하루 한 번 촬영 제한과 기준이 같아야 한다).
 */
export function todayKey() {
  return fromDate(new Date());
}

/** 앱을 띄운 시점의 오늘 (스토어 기본값용 스냅샷) */
export const TODAY_KEY = todayKey();

/** 오늘이 속한 달 */
export function currentMonth() {
  const { year, month } = parseDateKey(todayKey());
  return { year, month };
}

/**
 * 백엔드 연동 전 더미 수행 기록.
 * Figma 디자인이 "오늘 기준 -7·-6·-5·-3일" 에 초록 칩을 그려 뒀던 패턴에 어제(-1)를 더했다.
 * (어제를 넣어야 오늘이 주 초반일 때도 접힌 주간 스트립에서 초록 표시를 확인할 수 있다)
 */
export const INITIAL_COMPLETED_KEYS = [-7, -6, -5, -3, -1].map((offset) => addDays(TODAY_KEY, offset));

/** 날짜키에 일수를 더한다 */
export function addDays(dateKey, delta) {
  const d = toDate(dateKey);
  d.setDate(d.getDate() + delta);
  return fromDate(d);
}

/** 해당 달의 마지막 날 */
export function daysInMonth({ year, month }) {
  return new Date(year, month, 0).getDate();
}

/** 1일의 요일 인덱스 (월=0 … 일=6) */
export function firstWeekdayIndex({ year, month }) {
  const jsDay = new Date(year, month - 1, 1).getDay(); // 일=0
  return (jsDay + 6) % 7;
}

/** 월 이동 (연도 넘김 자동 처리) */
export function shiftMonth({ year, month }, delta) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** 연도 이동 */
export function shiftYear({ year, month }, delta) {
  return { year: year + delta, month };
}

/** '2026년 8월' */
export function monthLabel({ year, month }) {
  return `${year}년 ${month}월`;
}

/** 날짜키가 같은 달인지 */
export function isSameMonth(dateKey, { year, month }) {
  const p = parseDateKey(dateKey);
  return p.year === year && p.month === month;
}

/** a < b 면 음수, 같으면 0, a > b 면 양수 (날짜키는 문자열 비교로 충분하다) */
export function compareDateKeys(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 아직 오지 않은 날인지 */
export function isFutureDate(dateKey, today = todayKey()) {
  return compareDateKeys(dateKey, today) > 0;
}

export function isToday(dateKey, today = todayKey()) {
  return dateKey === today;
}

/**
 * 날짜 하나의 칩 상태.
 * @param {string} dateKey
 * @param {string[]} completedKeys 수행 완료한 날짜 키 목록
 * @param {string} today
 */
export function stateOf(dateKey, completedKeys = [], today = todayKey()) {
  // 오늘은 항상 흰 칩으로 위치를 알린다 (수행 완료 여부는 수행 완료 버튼 상태로 확인한다)
  if (dateKey === today) return 'today';
  if (completedKeys.includes(dateKey)) return 'record';
  return isFutureDate(dateKey, today) ? 'future' : 'empty';
}

/** 격자 한 칸 */
function cellOf(dateKey, completedKeys, today) {
  return {
    day: parseDateKey(dateKey).day,
    dateKey,
    state: stateOf(dateKey, completedKeys, today),
    completed: completedKeys.includes(dateKey),
    isToday: dateKey === today,
    isFuture: isFutureDate(dateKey, today),
  };
}

/**
 * 한 달을 주 단위(월~일)로 쪼갠다.
 * 각 주는 7칸이며 그 달에 없는 칸은 null 이다.
 *
 * @param {{year:number, month:number}} month 보고 있는 달
 * @param {string[]} completedKeys
 */
export function buildMonthWeeks(month, completedKeys = [], today = todayKey()) {
  const total = daysInMonth(month);
  const offset = firstWeekdayIndex(month);
  const cells = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let day = 1; day <= total; day++) {
    cells.push(cellOf(toDateKey({ ...month, day }), completedKeys, today));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

/** 요일 헤더 라벨 */
export const WEEKDAY_HEADER = WEEKDAY_LABELS;

/**
 * 접힌 캘린더(주간 스트립) 7칸.
 *
 * **기준 날짜가 항상 맨 앞(첫 칸)** 이고 거기서 6일을 이어 붙인다.
 * 월~일 고정이었을 때는 기준일이 일요일이면 다음 날이 스트립 밖으로 나가서
 * 이틀 묶음 표기가 사라졌다. 기준일을 앞에 두면 묶을 이틀이 늘 첫 두 칸에 들어온다.
 *
 * 요일 라벨은 칸마다 실제 날짜에서 뽑는다(더 이상 월요일로 시작하지 않으므로).
 * 달을 넘는 구간(예: 8/31~9/6)도 이어서 만든다.
 */
export function buildWeekStrip(dateKey, completedKeys = [], today = todayKey()) {
  const base = toDate(dateKey);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    return {
      label: WEEKDAY_LABELS[(d.getDay() + 6) % 7],
      ...cellOf(fromDate(d), completedKeys, today),
    };
  });
}

/** 월/연 선택 피커에 쓰는 12개월 라벨 */
export const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

/** '2026년 8월 20일 목요일' — 안내 문구에 쓴다 */
export function formatDateLabel(dateKey) {
  const { year, month, day } = parseDateKey(dateKey);
  const weekday = WEEKDAY_LABELS[(toDate(dateKey).getDay() + 6) % 7];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}
