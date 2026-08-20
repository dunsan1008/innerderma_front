/**
 * 최초 접속(촬영 전) 기본 솔루션 표시 문구.
 *
 * ⚠️ 잠정 문구 — 검수 후 교체 예정.
 *   스킨케어 안내 문구이므로 `constants/routines.js` 처럼 사전 검수를 거쳐야 하는지
 *   검수 주체 확인이 필요한 상태다(design.md 열린 질문 3). 문구가 확정되면 이 파일만 교체한다.
 *
 * 백엔드 연동 시 교체 대상:
 *   GET /users/{userCode}/skin-diagnosis                  (api/skinState.js#getLatestSkinDiagnosis)
 *     → skinType / concerns / summary / diagnosedAt 로 section·why 문구를 대체한다
 *   GET /users/{userCode}/procedures/treatment-context     (api/procedures.js#getTreatmentContext)
 *     → 시술명 / 경과일 / 주의사항으로 why.tags·avoid.items 를 대체한다
 *   섭취·추천 제품은 서버가 언어별 제품명을 내려줄 예정이므로 이름도 그때 교체한다.
 *
 * 규약:
 *   - `constants/routines.js`(사전 검수된 촬영 후 솔루션 문구)와 문자열을 공유하지 않는다.
 *     그 파일의 문구를 읽어 파생·요약해 쓰지 않는다 — 요약 과정에서 검수된 안전 문구의 의미가 훼손된다.
 *   - 섭취 문구는 제조사 공식 섭취 방법만 쓴다. 복용량을 판단하지 않고, 짧게 만들 때
 *     기존 문장을 잘라내지 않고 별도의 짧은 공식 문구를 쓴다.
 *   - 정상 회복·부작용을 단정하는 의료적 확정 표현을 쓰지 않는다(기획서 §14).
 *   - 현행 방침(.kiro/steering/i18n-multilingual.md)에 따라 한국어 하드코딩이며 사전에 등록하지 않는다.
 *     번역 재개 시 이 파일의 문자열만 사전 키로 옮기면 된다.
 *   - 모든 배열·객체는 모듈 스코프 상수다. 렌더마다 재생성되지 않는다.
 *
 * depth 규칙: 항목 수는 촬영 후 솔루션과 같고(스텝 4장 · 섭취 2장 · 피해주세요 3항목),
 * 각 항목의 글자 수와 부가 안내 박스(note/footnote)만 얕다.
 */

/** 사이클 세그먼트 보조 텍스트 */
export const BASIC_SEGMENT_CAPTIONS = { night: '기본 회복', morning: '기본 보호' };

/** 두 사이클 공통 DERMA CARE 보조 문구 */
const BASIC_SECTION_SUB = '오프라인 진단 기준 기본 관리';

/** 두 사이클 공통 '피해주세요' 제목 */
const BASIC_AVOID_TITLE = '기본 관리 중 피해주세요';

/**
 * 오늘 밤 기본 나이트 루틴.
 * `steps[].tagKey` 는 `components/routine/StepList.jsx` 의 TAG_STYLE 키여야 한다
 * (moist · nutrient · barrier · lock · waste · uv). 번역과 무관한 안정 키다.
 */
export const BASIC_NIGHT = {
  section: {
    label: 'DERMA CARE',
    sub: BASIC_SECTION_SUB,
    title: '오늘 밤 기본 나이트 루틴',
  },
  steps: [
    { no: '01', title: '순한 클렌징', tag: '노폐물', tagKey: 'waste', description: '미온수로 부드럽게 씻어요' },
    { no: '02', title: '수분 토너', tag: '수분', tagKey: 'moist', description: '토너로 수분을 채워요' },
    { no: '03', title: '장벽 세럼', tag: '장벽', tagKey: 'barrier', description: '민감해진 피부를 달래요' },
    { no: '04', title: '수분 크림', tag: '잠금', tagKey: 'lock', description: '마지막에 수분을 덮어요' },
  ],
  /** 나이트에는 저녁 세안 카드가 없다 (모닝 전용 블록) */
  eveningWash: null,
  avoid: {
    label: 'ETC',
    title: BASIC_AVOID_TITLE,
    items: ['뜨거운 물 세안', '과한 각질 제거', '잦은 얼굴 만지기'],
  },
};

/** 내일 아침 기본 모닝 루틴 */
export const BASIC_MORNING = {
  section: {
    label: 'DERMA CARE',
    sub: BASIC_SECTION_SUB,
    title: '내일 아침 기본 모닝 루틴',
  },
  steps: [
    { no: '01', title: '가벼운 세안', tag: '노폐물', tagKey: 'waste', description: '물세안으로 가볍게 정리해요' },
    { no: '02', title: '수분 토너', tag: '수분', tagKey: 'moist', description: '토너로 수분을 더해요' },
    { no: '03', title: '보습 크림', tag: '장벽', tagKey: 'barrier', description: '수분이 날아가지 않게 덮어요' },
    { no: '04', title: '선크림 바르기', tag: 'UV', tagKey: 'uv', description: '외출 전에 꼼꼼히 발라요' },
  ],
  /**
   * 모닝 전용 저녁 세안 카드.
   * basic 은 부가 안내 박스를 두지 않는다 — `note` / `footnote` 는 항상 null 이다.
   */
  eveningWash: {
    badge: 'N',
    title: '오늘 저녁 세안',
    tag: '기본 관리',
    description: '자기 전 미온수로 부드럽게 씻어요',
    note: null,
    footnote: null,
  },
  avoid: {
    label: 'ETC',
    title: BASIC_AVOID_TITLE,
    items: ['자외선 차단 생략', '뜨거운 물 세안', '급한 각질 제거'],
  },
};

/**
 * INNER CARE 헤더. full 은 제목이 두 줄이고 basic 은 한 줄이다.
 * `lines` 배열의 길이가 곧 제목 줄 수다.
 */
export const BASIC_INNER_CARE = {
  label: 'INNER CARE',
  sub: '오늘 섭취 기본 관리',
  lines: ['속부터 채우는 기본 이너케어'],
};

/**
 * 섭취 카드. full 과 같은 2장이고 `note` 만 없다.
 * `howTo` 는 제조사 공식 섭취 방법 문구다 — 복용량을 판단하거나 문장을 잘라 쓰지 않는다.
 * 제품명은 더미이며 백엔드 연동 시 서버가 언어별 이름을 내려준다.
 */
export const BASIC_SUPPLEMENTS = [
  { name: '이너 콜라겐 파우더', howTo: '하루 1포, 물과 함께 섭취', note: null },
  { name: '비타민 C 이너샷', howTo: '하루 1병, 식후 섭취', note: null },
];

/** '왜 이 루틴인가요' 블록 라벨 */
export const BASIC_WHY_LABEL = '왜 이 루틴인가요';

/**
 * 근거 태그: 이 화면이 무엇을 근거로 하는지 밝히는 기본 태그.
 * 오프라인 정밀 진단을 받고 기록을 연결한 뒤 앱에 들어온다는 서비스 전제상 항상 보유한 근거다.
 */
export const BASIC_EVIDENCE_TAG = '오프라인 정밀 진단';

/**
 * 근거 태그: 진단일·시술 근거가 하나도 없을 때 두 번째 태그로 채우는 문구.
 *
 * 왜 필요한가:
 *   `BASIC_FALLBACK_SOURCE` 는 `diagnosedAt`·`treatment` 를 비워 둔다(위 주석 참고).
 *   그래서 폴백 경로에서는 진단일 태그도 시술 태그도 생기지 않아 태그가
 *   `BASIC_EVIDENCE_TAG` 하나로 줄어드는데, 요구사항 5.6 은 2개 이상을 요구한다.
 *
 * 왜 이 문구인가:
 *   "아직 촬영하지 않았다"는 것은 이 화면이 렌더되는 조건 자체이므로 **항상 참인 사실**이다.
 *   보유하지 않은 근거(진단일·시술·사진 분석)를 지어내지 않으므로 근거 정직성(Property 4)에
 *   위배되지 않는다. 오히려 지금 보고 있는 것이 사진 분석 결과가 아니라는 점을 명시해
 *   '오늘 피부 사진' 태그를 뺀 이유를 화면에서 보완한다.
 *   진단일·시술 근거가 있으면 그쪽이 더 구체적이므로 이 태그는 쓰지 않는다(태그 상한 3개 유지).
 */
export const BASIC_PRE_CAPTURE_TAG = '촬영 전 기본 구성';

/**
 * 근거 태그: '{진단일} 기준'.
 * 연도·요일은 태그 칩에서 근거로서 의미가 없고 길이만 늘리므로 월·일만 쓴다.
 */
export const basicDiagnosedTag = (month, day) => `${month}월 ${day}일 진단 기준`;

/** 근거 태그: 시술 경과일 */
export const basicTreatmentDayTag = (daysSince) => `시술 후 ${daysSince}일차`;

/** 근거 태그 개수 상한. full 과 같은 3개까지만 표시한다(요구사항 5.6: 2~3개) */
export const BASIC_WHY_TAG_LIMIT = 3;

/**
 * 고민 키 → 표시 라벨. 진단 요약이 없을 때 요약 문장을 조립하는 데만 쓴다.
 *
 * 키 어휘는 `constants/skinAnalysis.js` / `hooks/useBasicSolution.js#KNOWN_CONCERN_KEYS` 와 같다.
 * 라벨 문자열은 `i18n/ko.js` 의 `skinAnalysis.factors` 와 우연히 같지만 **참조하지 않는다** —
 * 기본 솔루션 문구는 사전을 경유하지 않고 이 파일에 모아 두는 것이 규약이고(번역 재개 시 이동 대상),
 * 순수 함수인 `toBasicView` 가 언어 상태에 의존하면 안 된다.
 */
export const BASIC_CONCERN_LABELS = {
  pigmentation: '색소',
  pore: '모공',
  wrinkle: '주름',
  redness: '홍조',
  texture: '피부결',
};

/** 고민 라벨 나열 구분자 */
export const BASIC_CONCERN_JOINER = ' · ';

/**
 * 서버 진단 요약이 없을 때 피부 타입·고민 키를 **나열하는 수준으로만** 조립하는 문장.
 *
 * 상태를 판단하거나 회복·부작용을 단정하지 않는다(기획서 §14 의료적 확정 표현 금지).
 * 보유한 진단 기록의 항목을 그대로 읽어 주는 것이 전부다.
 */
export const BASIC_SUMMARY_SENTENCE = {
  both: (skinType, concerns) =>
    `오프라인 정밀 진단 기록의 피부 타입은 ${skinType}, 관리 항목은 ${concerns} 입니다.`,
  skinTypeOnly: (skinType) => `오프라인 정밀 진단 기록의 피부 타입은 ${skinType} 입니다.`,
  concernsOnly: (concerns) => `오프라인 정밀 진단 기록의 관리 항목은 ${concerns} 입니다.`,
};

/**
 * 진단 요약도 피부 타입·고민 키도 없을 때 쓰는 마지막 폴백 문장.
 * 상태를 단정하지 않고 이 화면이 무엇을 근거로 하는지만 밝힌다.
 */
export const BASIC_WHY_FALLBACK_TEXT =
  '오프라인 정밀 진단 기록을 기준으로 구성한 기본 관리입니다. 오늘 피부를 촬영하면 더 정밀한 솔루션으로 바뀝니다.';

/**
 * 하단 CTA 문구 — 이 화면의 목적인 촬영으로 넘어가는 버튼.
 *
 * 제거된 회색 자리표시 카드 3개(Figma 870:3635~3637)가 갖고 있던 세안 확인 모달 진입점을
 * 이 버튼이 승계한다. 촬영 후 솔루션의 CTA(수행 완료)와 자리를 공유하는 슬롯이다.
 * 기본 솔루션에서는 수행 완료를 기록할 수 없다 — `careStore.completedDates` 는 촬영·분석을
 * 거친 솔루션의 수행 기록이고 캘린더 초록 칩의 근거이므로 여기에 섞으면 안 된다.
 */
export const BASIC_CTA_LABEL = '오늘 피부 촬영하기';

/** 제품 추천 블록 제목 */
export const BASIC_RECOMMEND_TITLE = '함께 쓰면 좋은 제품';
/** 제품 추천 장수. basic 은 1행 2장이다 (full 은 2행 4장) */
export const BASIC_RECOMMEND_COUNT = 2;

/**
 * 시술 주의사항을 '피해주세요' 앞쪽에 붙일 때의 개수 상한.
 *
 * 서버가 주의사항을 몇 개 내려줄지 알 수 없다. 상한이 없으면 이 카드 하나가
 * 본문 높이를 지배해 나머지 항목이 스크롤 밖으로 밀린다.
 * 각 '문구'는 절대 가공하지 않고(요구사항 7.1) 붙일 '개수'만 제한한다.
 */
export const MAX_CAUTION_ITEMS = 3;

/**
 * '피해주세요' 항목 전체 개수 상한.
 *
 * 값 근거:
 *   - 하한: 3 이상이어야 한다. 기본 문구가 3항목이고(요구사항 3.2 · 6.6 이 요구하는 최소치)
 *     주의사항이 하나도 없어도 그 3항목은 그대로 남아야 한다.
 *   - 상한: 카드가 무한히 자라지 않게 하는 방어선이다. 5를 넘기면 basic 의 '얕은 분량' 성격이 깨진다.
 * 주의사항이 MAX_CAUTION_ITEMS(3) 만큼 붙으면 3 + 3 = 6 이 되어 이 상한에 걸린다.
 * 이때 뒤쪽(기본 문구)부터 밀려난다 — 안전 문구가 일반 안내보다 우선한다는 의도이며,
 * 주의사항이 앞쪽에 붙으므로 총 개수는 어떤 경우에도 3 이상으로 유지된다.
 * 자르는 것은 항목 개수이고 각 문구는 원문 그대로다(요구사항 7.2).
 */
export const BASIC_AVOID_LIMIT = 5;

/**
 * 근거 데이터를 가져오지 못했을 때 쓰는 폴백 `BasicSolutionSource`.
 *
 * 조회 진행 중(요구사항 1.3)이거나 진단·시술 조회가 모두 실패한 상태(6.2)에서 쓴다.
 * 스켈레톤이나 오류 문구 없이 이 더미로 즉시 완전한 화면을 렌더한다 —
 * 첫 화면에서 서비스가 고장 났다고 느끼게 하지 않는 것이 목적이다.
 * `hooks/useBasicSolution.js#emptyBasicSolutionSource()` 와 같은 5개 필드 형태다.
 *
 * `diagnosedAt` 을 `null` 로 둔 이유:
 *   폴백은 "근거 데이터를 못 가져온 상태"다. 여기에 날짜를 넣으면 '{진단일} 기준' 태그가
 *   붙어 보유하지도 않은 진단일을 표시하게 된다. 근거 정직성(Property 4)에 정면으로 어긋나므로
 *   비운다. 그 결과 폴백 경로의 근거 태그가 1개로 줄어들 수 있으니,
 *   `toBasicView` 는 진단일·시술에 의존하지 않는 태그로 2개를 채워야 한다(요구사항 5.6).
 *
 * `treatment: null` 인 이유:
 *   시술 여부는 조회 결과로만 판정한다. 폴백이 시술을 가정하면 시술받지 않은 사용자에게
 *   시술 안내가 노출된다. 시술을 받지 않은 사용자와 조회 실패 사용자는 같은 화면을 본다(6.5).
 *
 * ⚠️ 소비자(`toBasicView`)는 이 객체를 변형하지 않는다. 모듈 스코프 단일 인스턴스이므로
 *    한 번 변형되면 이후 모든 렌더가 오염된다. 항상 새 객체·새 배열로 조립한다.
 */
export const BASIC_FALLBACK_SOURCE = {
  /** 특정 진단 결과를 단정하지 않는 일반 표기 */
  skinType: '기본 관리 기준',
  /**
   * 회복기 공통 관리 축(진정 · 피부결). `constants/skinAnalysis.js` 의 알려진 고민 키여야
   * `hooks/useBasicSolution.js` 의 `KNOWN_CONCERN_KEYS` 와 어휘가 어긋나지 않는다.
   * 아래 `diagnosisSummary` 가 채워져 있어 요약 조립(`buildSummaryFrom`) 경로를 타지 않으므로
   * 이 키들이 "진단된 고민"으로 화면에 표시되지는 않는다.
   */
  concerns: ['redness', 'texture'],
  /**
   * 폴백 요약. `BASIC_WHY_FALLBACK_TEXT` 와 같은 문장을 의도적으로 재사용한다 —
   * 두 경로(더미 사용 / 응답이 비어 있음) 모두 "아직 근거를 못 가져왔다"는 같은 상태이고,
   * 문장을 따로 두면 한쪽만 수정되어 어긋난다.
   */
  diagnosisSummary: BASIC_WHY_FALLBACK_TEXT,
  /** 위 주석 참고 — 없는 진단일을 표시하지 않는다 */
  diagnosedAt: null,
  /** 위 주석 참고 — 시술은 조회 결과로만 판정한다 */
  treatment: null,
};
