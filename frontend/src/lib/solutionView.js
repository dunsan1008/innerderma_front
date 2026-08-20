/**
 * 솔루션 화면(촬영 전 기본 / 촬영 후 상세)이 공유하는 표시 모델(`SolutionView`) 어댑터.
 *
 * `toFullView` 는 `RoutineScreen` 에 인라인으로 있던 필드별 폴백 조립을 **그대로** 옮긴 것이다.
 * 조건 순서·연산자(`||` / `?.` / `?? `)를 문자 그대로 유지한다 — `||` 를 `??` 로 바꾸는 것만으로도
 * 빈 문자열·0 의 처리가 달라져 기존 화면의 렌더 결과가 바뀐다(P10: 기존 화면 무변경).
 *
 * React 훅을 호출하지 않는 순수 함수다. 번역 텍스트가 필요한 부분은 호출부가 `useRoutineText()`
 * 결과(`rt`)를 인자로 넘긴다.
 */
import {
  BASIC_AVOID_LIMIT,
  BASIC_CONCERN_JOINER,
  BASIC_CONCERN_LABELS,
  BASIC_EVIDENCE_TAG,
  BASIC_FALLBACK_SOURCE,
  BASIC_INNER_CARE,
  BASIC_MORNING,
  BASIC_NIGHT,
  BASIC_PRE_CAPTURE_TAG,
  BASIC_RECOMMEND_COUNT,
  BASIC_RECOMMEND_TITLE,
  BASIC_SEGMENT_CAPTIONS,
  BASIC_SUMMARY_SENTENCE,
  BASIC_SUPPLEMENTS,
  BASIC_WHY_FALLBACK_TEXT,
  BASIC_WHY_LABEL,
  BASIC_WHY_TAG_LIMIT,
  MAX_CAUTION_ITEMS,
  basicDiagnosedTag,
  basicTreatmentDayTag,
} from '@/constants/basicSolution';
import { findProductByKey } from '@/constants/marketScreens';
import { SOLUTION_RECOMMEND_NAMES } from '@/constants/marketProducts';
import { parseDateKey } from '@/lib/calendar';

/**
 * 본문 블록별 Figma 노드 id. `RoutineScreen` 이 각 섹션에 직접 붙이던 값을 그대로 모았다.
 * (기본 솔루션은 Figma 원본 노드가 없어 이 값을 쓰지 않는다 — 없는 id 를 발명하지 않는다)
 */
const FULL_NODE_IDS = {
  night: {
    sectionHeader: '870:3848',
    stepList: '870:3855',
    innerCare: '870:3923',
    supplements: '870:3933',
    avoid: '870:3952',
    why: '870:3971',
    recommendTitle: '989:1220',
  },
  morning: {
    sectionHeader: '870:4079',
    stepList: '870:4086',
    eveningWash: '870:4154',
    innerCare: '870:4173',
    supplements: '870:4183',
    avoid: '870:4202',
    why: '870:4221',
    recommendTitle: '989:1220',
  },
};

/**
 * 촬영 후 솔루션의 표시 모델을 만든다.
 *
 * 필드별 폴백 순서는 `aiCare`(신규 LLM 파이프라인) → `solution`(기존 `/care-solutions`) →
 * 더미(`rt`) 다. aiCare 는 훅(`useAiCare`)으로만 얻을 수 있으므로 이 순수 함수가 직접 부르지 않고
 * 화면이 취득해 인자로 넘긴다.
 *
 * @param {object|null} solution `useCareSolution()` 이 준 실데이터. 없으면 전부 `rt` 폴백.
 * @param {object} rt `useRoutineText()` 결과 (번역된 더미 폴백 + 섹션 라벨)
 * @param {'night'|'morning'} cycle
 * @param {object|null} [aiCare] `useAiCare()` 가 준 `/ai-care` 응답. 없으면 기존 체인만 쓴다.
 *   `aiCare.routineWithheld` 가 true 면(시술 회복기) 스텝·회피 목록·섭취 카드·저녁 세안
 *   카드를 전부 비우고 폴백 체인을 타지 않는다 — `aiCare.routineWithheldReason` 을
 *   "왜 이 루틴인가요" 자리에 그대로 보여준다.
 * @returns {object} `depth: 'full'` 인 SolutionView
 */
export function toFullView(solution, rt, cycle, aiCare = null) {
  const night = cycle === 'night';

  /**
   * 신규 AI Care 파이프라인(`/ai-care`, LLM 기반) 결과. 백엔드가 안정화 중이라
   * 필드가 빈 배열로 오는 경우가 있어, 각 필드가 비어 있으면 아래에서 기존 solution → 더미
   * 순으로 자연스럽게 폴백한다. aiCare 는 밤/아침 사이클을 `care.night` / `care.morning` 으로 나눠 준다.
   */
  const aiCareContent = aiCare?.care ?? null;
  const aiCycleCare = aiCareContent ? (night ? aiCareContent.night : aiCareContent.morning) : null;

  /**
   * 시술 회복기 루틴 보류(`routineWithheld`). 백엔드가 안전상 회복 기간 동안 의도적으로
   * 제품 추천을 비워서 준다("이건 규칙상 정상" — 프론트가 임의로 판단한 게 아니다).
   * 이때 스텝·회피 목록·섭취 카드가 비어 있다고 solution/더미로 폴백하면 회복기에도
   * 평소처럼 제품을 추천하는 꼴이 되어 의도를 정면으로 어긴다 — 그래서 withheld 면
   * 폴백 체인 전체를 건너뛰고 빈 상태를 그대로 유지하며, 이유(`routineWithheldReason`)를
   * "왜 이 루틴인가요" 자리에 그대로 보여준다.
   */
  const withheld = aiCare?.routineWithheld === true;
  const withheldReason = withheld ? aiCare.routineWithheldReason || '' : null;

  /** 하단 추천 카드 4개 — 마켓 목록의 상품을 이름으로 찾아 그대로 쓴다 */
  const recommendProducts = SOLUTION_RECOMMEND_NAMES.map((name) => findProductByKey(name)).filter(Boolean);

  /**
   * 스텝 목록: aiCare(신규) → solution(기존) → 더미 순으로 폴백한다.
   * aiCare 의 Step 은 `/care-solutions`와 스키마가 다르다 — 지시문(title/description)이
   * 아니라 "이 제품을(productName) 이렇게(usage) 쓰세요, 왜냐하면(reason)" 구조라
   * 카드의 title/description 두 줄로 재구성한다. 카테고리 태그(tagKey/tag)에 대응하는
   * 값이 없어서 태그 칩은 만들지 않는다(StepList 가 tag 없으면 칩을 안 그리도록 처리됨).
   */
  const aiSteps = aiCycleCare?.steps?.length
    ? aiCycleCare.steps.map((s) => ({
        title: s.productName,
        description: s.reason ? `${s.usage} ${s.reason}` : s.usage,
      }))
    : null;
  const solutionSteps = solution ? (night ? solution.eveningSteps : solution.morningSteps) : null;
  const realSteps = withheld ? [] : (aiSteps ?? solutionSteps);
  const steps = withheld
    ? []
    : realSteps?.length
      ? realSteps.map((s, i) => ({ ...s, no: String(i + 1).padStart(2, '0'), nodeId: `step-${i}` }))
      : night
        ? rt.nightSteps
        : rt.morningSteps;
  /**
   * 피해야 할 것: aiCare 는 밤/아침 구분 없이 `innerCare.avoid` 하나뿐이라
   * 두 사이클 화면에 동일하게 쓴다(기존 solution 은 eveningAvoid/morningAvoid로 나뉘어 있었다).
   */
  const aiAvoid = aiCareContent?.innerCare?.avoid?.length ? aiCareContent.innerCare.avoid : null;
  const avoidItems = withheld
    ? []
    : aiAvoid ??
      (solution
        ? night
          ? solution.eveningAvoid
          : solution.morningAvoid
        : night
          ? rt.nightAvoid
          : rt.morningAvoid);
  /** 섭취 추천: aiCare의 innerCare.recommended(productName/usage/reason) → solution.supplements → 더미 */
  const aiRecommended = aiCareContent?.innerCare?.recommended?.length
    ? aiCareContent.innerCare.recommended.map((r) => ({ name: r.productName, howTo: r.usage, note: r.reason || null }))
    : null;
  const supplementCards = withheld
    ? []
    : aiRecommended ??
      (solution?.supplements?.length
        ? solution.supplements.map((s) => ({ name: s.title, howTo: s.usage, note: null }))
        : rt.supplementCards);
  /** 저녁 세안 카드는 aiCare에 대응 필드가 없어 기존 solution/더미 그대로 쓴다 — withheld면 이것도 비운다 */
  const eveningWash = withheld
    ? null
    : solution?.eveningWash
      ? { badge: 'N', ...solution.eveningWash }
      : rt.eveningWash;
  /**
   * "왜 이 루틴인가요" 본문:
   *  - aiCare 가 있으면 상태 요약 + 오늘의 목표를 우선 쓰고, 주의사항(caution)이 있으면
   *    맨 앞에 붙인다.
   *  - 없으면 기존 solution(WHS 진단 요약 → 안전 안내)으로, 그것도 없으면 더미로 폴백한다.
   * aiCare의 primaryConcern은 "STABLE"처럼 다듬어지지 않은 내부 값이라 태그로 쓰기엔
   * 부적절해서, whyTags는 aiCare와 무관하게 기존 solution.concernTags → 더미를 그대로 쓴다.
   */
  const aiWhyText = aiCareContent
    ? [aiCareContent.caution, aiCareContent.skinStateSummary, aiCareContent.todayGoal].filter(Boolean).join(' ')
    : '';
  const whyText = withheld
    ? withheldReason || rt.whyText
    : aiWhyText || solution?.whsDiagnosisSummary || solution?.safetyMessage || rt.whyText;
  const whyTags = solution?.concernTags?.length ? solution.concernTags : rt.whyTags;

  return {
    depth: 'full',
    nodeIds: FULL_NODE_IDS[night ? 'night' : 'morning'],
    section: {
      label: rt.sectionLabel,
      sub: rt.sectionSub,
      title: rt.sectionTitle(night),
    },
    steps,
    /** 저녁 세안 카드는 모닝 전용 — 나이트에서는 렌더하지 않는다 */
    eveningWash: night ? null : eveningWash,
    /**
     * INNER CARE 헤더·피해주세요·왜 이 루틴인가요의 라벨은 값을 담지 않는다.
     * 담지 않으면 렌더 컴포넌트가 기존 `useT()` 폴백을 그대로 쓰므로 문구가 변하지 않는다.
     */
    innerCare: null,
    supplements: supplementCards,
    avoid: { label: null, title: null, items: avoidItems },
    why: { label: null, text: whyText, tags: whyTags },
    /** 추천 제목도 기존처럼 `t.solution.recommendTitle` 폴백에 맡긴다 */
    recommend: { title: null, products: recommendProducts },
  };
}

/* ────────────────────────────── 기본 솔루션 (촬영 전) ────────────────────────────── */

/**
 * 기본 솔루션 하단 추천 2장.
 *
 * 촬영 후(full, 4장)와 **같은 목록의 앞 2개**를 쓴다. 판단 근거:
 *   - 목록을 따로 두면 제품명 문자열이 두 곳으로 갈라지고, 찜 상태가 목록·상세와 함께
 *     움직이려면 어차피 마켓 카탈로그의 같은 상품을 참조해야 한다.
 *   - 촬영 전후로 추천이 겹치는 것은 문제가 아니라 의도다. 사진을 찍었다는 사실만으로
 *     추천 상품의 정체가 바뀌면 "촬영하면 더 정밀해진다"가 아니라 "다른 걸 판다"로 읽힌다.
 *   - 추천 근거 자체는 백엔드 연동 시 `GET /api/v1/care/{date}/recommendations` 로 대체될
 *     예정이므로(constants/marketProducts.js 주석), 지금 basic 전용 목록을 설계해 둘 이유가 없다.
 */
const BASIC_RECOMMEND_NAMES = SOLUTION_RECOMMEND_NAMES.slice(0, BASIC_RECOMMEND_COUNT);

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 앞에서 n개만. 입력 배열을 변형하지 않고 새 배열을 만든다 */
function take(list, n) {
  return Array.isArray(list) ? list.slice(0, Math.max(0, n)) : [];
}

/**
 * 내용 있는 문자열만 통과. 그 외(타입 오류·빈 문자열)는 null.
 * `normalizeBasicSource` 가 이미 걸러 주지만, `toBasicView` 는 정규화를 거치지 않은
 * source(폴백 더미·테스트·향후 다른 호출부)도 받을 수 있으므로 여기서 한 번 더 접는다.
 * 통과한 값은 가공하지 않는다.
 */
function asText(value) {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/**
 * '{진단일} 기준' 태그 문자열. 형식이 어긋나면 null 이고 태그가 붙지 않는다.
 *
 * `lib/calendar.js#formatDateLabel` 을 쓰지 않는 이유: '2026년 8월 20일 목요일' 은 태그 칩에
 * 넣기엔 길고 연도·요일이 근거로서 의미가 없다. 날짜키 파싱만 calendar 의 규약(`parseDateKey`)에
 * 맞춰 두고 문구 조립은 `constants/basicSolution.js` 가 맡는다.
 */
function formatDiagnosedTag(diagnosedAt) {
  if (typeof diagnosedAt !== 'string' || !DATE_KEY_RE.test(diagnosedAt)) return null;
  const { month, day } = parseDateKey(diagnosedAt);
  return basicDiagnosedTag(month, day);
}

/**
 * 서버 진단 요약이 없을 때 쓰는 요약 문장.
 *
 * **피부 타입과 고민 키를 나열하는 수준으로만** 조립한다(요구사항 7.7). 상태를 판단하거나
 * 회복·부작용을 단정하는 문장을 만들지 않는다 — 프론트가 의료적 판단을 하는 통로가 되면 안 된다.
 *
 * @returns {string|null} 나열할 근거가 하나도 없으면 null (호출부가 폴백 문장을 쓴다)
 */
function buildSummaryFrom(skinType, concerns) {
  const type = asText(skinType);

  // 알려진 고민 키만 라벨로 바뀐다. 미지의 코드는 라벨이 없어 조용히 버려진다(요구사항 8.5)
  const labels = [];
  for (const key of Array.isArray(concerns) ? concerns : []) {
    const label = typeof key === 'string' ? BASIC_CONCERN_LABELS[key] : undefined;
    if (typeof label === 'string' && !labels.includes(label)) labels.push(label);
  }
  const concernText = labels.length ? labels.join(BASIC_CONCERN_JOINER) : null;

  if (type && concernText) return BASIC_SUMMARY_SENTENCE.both(type, concernText);
  if (type) return BASIC_SUMMARY_SENTENCE.skinTypeOnly(type);
  if (concernText) return BASIC_SUMMARY_SENTENCE.concernsOnly(concernText);
  return null;
}

/**
 * 시술 맥락을 방어적으로 읽는다. 쓸 수 있는 필드가 하나도 없으면 null —
 * 시술을 받지 않은 사용자와 깨진 응답이 같은 경로로 처리된다.
 * `cautions` 문구는 절대 가공하지 않는다(요구사항 7.1).
 */
function readTreatment(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const name = asText(raw.name);
  const daysSince =
    typeof raw.daysSince === 'number' && Number.isFinite(raw.daysSince) && raw.daysSince >= 0
      ? Math.floor(raw.daysSince)
      : null;
  const cautions = Array.isArray(raw.cautions)
    ? raw.cautions.filter((item) => typeof item === 'string' && item.trim() !== '')
    : [];
  if (name === null && daysSince === null && cautions.length === 0) return null;
  return { name, daysSince, cautions };
}

/**
 * 촬영 전 기본 솔루션의 표시 모델을 만든다.
 *
 * 항목 구성은 `toFullView` 와 같고(스텝 4장 · 섭취 2장 · 피해주세요 3항목 이상) 깊이만 얕다.
 * `depth` 는 렌더 항목 수에 영향을 주지 않는다 — 줄어드는 것은 글자 수와 부가 안내 박스뿐이다.
 *
 * 순수 함수다. `onboardingStore`(persist 되지 않는 `userType`)를 비롯한 어떤 스토어도 읽지 않는다.
 * 같은 근거 데이터면 새로고침 전후로 항상 같은 결과가 나온다(Property 6).
 *
 * @param {object|null} source `useBasicSolution()` 이 준 근거 데이터. null 이면 폴백 더미를 쓴다.
 * @param {'night'|'morning'} cycle
 * @returns {object} `depth: 'basic'` 인 SolutionView. **항상 완전한 view** — 필수 필드가 비지 않는다.
 */
export function toBasicView(source, cycle) {
  // 근거가 없어도 화면은 비지 않는다. 폴백 더미는 모듈 스코프 단일 인스턴스이므로
  // 아래에서 절대 변형하지 않고 읽기만 한다 (push 금지 — 새 배열만 만든다)
  const s = source ?? BASIC_FALLBACK_SOURCE;

  // 'morning' 이 아닌 값은 나이트로 본다 — `RoutineScreen` 의 기존 규칙과 같다
  const night = cycle !== 'morning';
  const copy = night ? BASIC_NIGHT : BASIC_MORNING;

  /* ── 왜 이 루틴인가요: 실제 보유한 근거만 반영한다 ── */
  const whyText =
    asText(s.diagnosisSummary) ?? buildSummaryFrom(s.skinType, s.concerns) ?? BASIC_WHY_FALLBACK_TEXT;

  const treatment = readTreatment(s.treatment);
  const diagnosedTag = formatDiagnosedTag(s.diagnosedAt);

  // 태그는 "근거 출처 목록"이라 개수 고정이 아니라 실제 근거에 종속된다.
  // '오늘 피부 사진' 은 넣지 않는다 — 촬영 전이라 사진 근거가 없다(Property 4).
  const tags = [BASIC_EVIDENCE_TAG];
  if (diagnosedTag !== null) tags.push(diagnosedTag);
  if (treatment !== null) {
    if (treatment.daysSince !== null) tags.push(basicTreatmentDayTag(treatment.daysSince));
    else if (treatment.name !== null) tags.push(treatment.name);
  }
  // 진단일·시술 근거가 둘 다 없으면(폴백 경로) 태그가 1개로 줄어든다.
  // 촬영 전이라는 사실만으로 붙일 수 있는 태그로 하한 2개를 맞춘다(요구사항 5.6)
  if (tags.length < 2) tags.push(BASIC_PRE_CAPTURE_TAG);

  /* ── 피해주세요: 시술 주의사항을 앞쪽에 붙인다 ── */
  // 자르는 것은 **항목 개수**이고 각 문구는 서버 원문 그대로다(요구사항 7.2, Property 8).
  // 상한에 걸리면 뒤쪽(기본 문구)부터 밀려나 안전 문구가 우선된다.
  // 주의사항은 최대 MAX_CAUTION_ITEMS(3) 개이고 기본 문구가 3개이므로 총 개수는 항상 3 이상이다.
  const avoidItems = treatment !== null && treatment.cautions.length > 0
    ? take([...take(treatment.cautions, MAX_CAUTION_ITEMS), ...copy.avoid.items], BASIC_AVOID_LIMIT)
    : copy.avoid.items;

  return {
    depth: 'basic',
    /**
     * 기본 솔루션은 Figma 원본 노드가 없는 신규 구성이다.
     * 없는 노드 id 를 발명하면 픽셀 diff 도구가 잘못된 기준을 잡는다 — null 로 두고
     * `SolutionBody` 가 `data-name` 만 붙인다(요구사항 8.6).
     */
    nodeIds: null,
    segmentCaptions: BASIC_SEGMENT_CAPTIONS,
    section: copy.section,
    /** 항상 4장. 모듈 스코프 상수를 그대로 참조한다(렌더마다 재생성하지 않는다) */
    steps: copy.steps,
    /** 저녁 세안 카드는 모닝 전용. basic 은 부가 안내 박스를 두지 않는다 */
    eveningWash: night ? null : { ...copy.eveningWash, note: null, footnote: null },
    innerCare: BASIC_INNER_CARE,
    /** 항상 2장, `note` 는 상수 정의부터 null 이다 */
    supplements: BASIC_SUPPLEMENTS,
    avoid: { label: copy.avoid.label, title: copy.avoid.title, items: avoidItems },
    why: { label: BASIC_WHY_LABEL, text: whyText, tags: take(tags, BASIC_WHY_TAG_LIMIT) },
    recommend: {
      title: BASIC_RECOMMEND_TITLE,
      // 이미 로드된 카탈로그에서 찾는다. 등록되지 않은 이름은 걸러 낸다
      products: BASIC_RECOMMEND_NAMES.map((name) => findProductByKey(name)).filter(Boolean),
    },
  };
}
