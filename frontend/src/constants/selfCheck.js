/**
 * 데일리 자가 진단 항목 (Figma 970:1090).
 * Figma 에는 같은 좌표에 버튼이 겹쳐 있어(970:1111/1113, 970:1115/1117)
 * 실제 항목 목록으로 정리했다. 순서는 Figma 위→아래 그대로.
 *
 * 추후 백엔드 연동 시 `GET /api/v1/self-check/items` 응답으로 교체한다.
 */
export const SELF_CHECK_ITEMS = [
  { id: 'tight', label: '피부가 심하게 당겨요' },
  { id: 'hot', label: '화끈거리고 열감이 느껴져요' },
  { id: 'sting', label: '따끔거려요' },
  { id: 'rough', label: '피부가 푸석해요' },
  { id: 'none', label: '아무 이상이 없어요.' },
];

/** 기타 입력 항목 (Figma 970:1119 — 카드 형태로 분리돼 있다) */
export const SELF_CHECK_OTHER = { id: 'other', label: '그 외' };
