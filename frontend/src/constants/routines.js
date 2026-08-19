/**
 * Figma 나이트/모닝 루틴 화면에 적힌 내용을 그대로 옮긴 더미 데이터.
 * 추후 백엔드 연동 시 `GET /api/v1/care-cycles/{date}` 응답으로 교체한다.
 * 문구는 임의로 바꾸지 않는다 (안전 안내는 사전 검수된 리소스를 쓴다는 기획 원칙).
 */

/** 오늘 밤 — 회복을 위한 나이트 루틴 (Figma 870:3855) */
export const NIGHT_STEPS = [
  {
    no: '01',
    title: '스킨·토너 수분 첫 레이어',
    tag: '수분 공급',
    tagKey: 'moist',
    titleFlex: 261.945,
    description: '세안 후 손바닥으로 가볍게 눌러 흡수시켜 피부 결을 정돈하세요.',
    nodeId: '870:3857',
  },
  {
    no: '02',
    title: '집중 영양 앰플 케어',
    tag: '성분 공급',
    tagKey: 'nutrient',
    titleFlex: 261.945,
    description: '피부 결을 따라 부드럽게 롤링하며 깊숙이 스며들도록 해주세요.',
    nodeId: '870:3875',
  },
  {
    no: '03',
    title: '나이트 크림 보습 장벽 강화',
    tag: '보습막 형성',
    tagKey: 'barrier',
    titleFlex: 252.742,
    description: '적당량을 덜어 얼굴 전체에 감싸듯 꾹꾹 눌러 흡수시켜 주세요.',
    nodeId: '870:3893',
  },
  {
    no: '04',
    title: '슬리핑 팩 수분 마무리',
    tag: '수분 잠금',
    tagKey: 'lock',
    titleFlex: 261.945,
    description: '마지막 단계에서 얇게 펴 바르고 다음 날 아침에 세안하세요.',
    nodeId: '870:3910',
  },
];

/** 내일 아침 — 수분 유지를 위한 모닝 루틴 (Figma 870:4086) */
export const MORNING_STEPS = [
  {
    no: '01',
    title: '물 세안',
    tag: '노폐물 제거',
    tagKey: 'waste',
    titleFlex: 252.742,
    description: '뜨겁지 않은 미온수로 가볍게 씻어내어 밤새 분비물을 제거하세요.',
    nodeId: '870:4088',
  },
  {
    no: '02',
    title: '토너·에센스 수분 채움',
    tag: '수분 공급',
    tagKey: 'moist',
    titleFlex: 261.945,
    description: '화장솜 없이 손바닥으로 가볍게 두드려 흡수시켜 주세요.',
    nodeId: '870:4106',
  },
  {
    no: '03',
    title: '겔 크림으로 보습막 형성',
    tag: '보습막 형성',
    tagKey: 'barrier',
    titleFlex: 252.742,
    description: '가볍게 두드리듯 흡수시켜 하루 종일 피부 장벽을 보호하세요.',
    nodeId: '870:4124',
  },
  {
    no: '04',
    title: '자외선 차단제 SPF 50+',
    tag: '자외선 차단',
    tagKey: 'uv',
    titleFlex: 252.742,
    description: '흐린 날에도 UV 차단은 필수, 마지막 단계에서 꼼꼼히 발라주세요.',
    nodeId: '870:4141',
  },
];

/** 섭취 케어 카드 (나이트·모닝 공통, Figma 870:3933 / 870:4183) */
export const SUPPLEMENT_CARDS = [
  {
    name: 'WIM 마린 콜라겐 앰플',
    howTo: '하루 1포, 아침 식후 물 또는 음료에 혼합해 섭취하세요.',
    note: null,
  },
  {
    name: 'WIM 피부 프로바이오틱스',
    howTo: '하루 1캡슐, 저녁 식후 물과 함께 섭취하세요.',
    note: '⚠ 공복 섭취 시 속 불편감이 생길 수 있어요.',
  },
];

/** 오늘은 피해주세요 */
export const NIGHT_AVOID = ['강한 각질 제거 제품', '알코올 함량이 높은 토너', '자극적인 향료 성분'];
export const MORNING_AVOID = ['밀폐력 강한 오일 선크림', '두꺼운 파운데이션 제품', '합성 향료·향수 성분'];

/** 왜 이 루틴인가요? (나이트·모닝 동일 문구) */
export const WHY_TEXT =
  '오늘 피부는 약간의 건조함과 붉어짐이 보여요. WHS에서 받은 시술 후 현재 회복 단계를 함께 고려해, 자극을 줄이고 피부 장벽 회복을 돕는 루틴을 추천했어요.';
export const WHY_TAGS = ['오늘 피부 사진', 'WHS 진단 데이터', '시술 후 7일차'];

/** 모닝 화면 전용 — 저녁 세안 루틴 안내 카드 (Figma 870:4154) */
export const EVENING_WASH = {
  badge: 'N',
  title: '저녁 세안 루틴',
  tag: '노폐물 제거',
  description:
    '기본적으로 클렌징폼은 약산성을, 선크림이나 메이크업과 함께 외출하신 경우에는 클렌징오일을 추가로 사용해주세요.',
  note: '오일은 첫 펌프 시 꼭 물이 묻지 않은 손으로, 충분한 마사지 후 미온수로 유화 과정을 거쳐 깨끗이 씻어내 주세요.',
  footnote: '3~4 펌프 · 깨끗한 맨손으로 사용',
};
