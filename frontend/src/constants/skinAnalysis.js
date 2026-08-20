/**
 * 데일리 스킨 분석 모달의 레이더 차트 데이터.
 *
 * 축은 `AAC_AI_Skin_Care_Service_Planning.md` 8.1 "AI 사진 분석"의 5항목
 * (색소 불균형 · 모공 · 주름 · 홍조 · 피부결)을 그대로 쓴다. 이 5개가 현재 분석
 * 모델이 실제로 산출하는 전부라 오각형을 유지했다 — 항목이 6개 이상으로 늘어나면
 * 이 배열에 추가하기만 하면 SkinRadarChart 가 자동으로 육각형 이상으로 그린다.
 *
 * 실제 분석 결과는 IMPROVED/STABLE/WORSENED/NEEDS_ATTENTION 등급으로만 내려오고
 * 0~100 점수 필드는 아직 백엔드에 없다. 그래서 여기 점수는 더미다 — 백엔드에
 * 항목별 수치 점수 필드가 추가되면 이 상수 대신 그 응답을 쓰도록 바꾼다.
 */
export const SKIN_ANALYSIS_FACTORS = [
  { key: 'pigmentation', score: 62 },
  { key: 'pore', score: 78 },
  { key: 'wrinkle', score: 55 },
  { key: 'redness', score: 70 },
  { key: 'texture', score: 45 },
];
