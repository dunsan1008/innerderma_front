/**
 * 데일리 스킨 분석 모달의 레이더 차트 데이터.
 *
 * 원래는 `AAC_AI_Skin_Care_Service_Planning.md` 8.1 의 5항목(색소·모공·주름·홍조·피부결)을
 * 그대로 쓰려 했지만, 백엔드가 실제로 추가한 `MetricScores`는 모공과 피부결을
 * `poreTextureScore` 하나로 합쳐서 내려준다(별도 피부결 점수 없음) — 없는 값을
 * 지어내는 대신 실제로 있는 4항목만 축으로 쓴다.
 *
 * 여기 점수는 실제 분석이 없을 때(로그인 전 · 그날 분석 없음 · 요청 실패)의
 * 더미 폴백이다. 실제 데이터는 `hooks/useSkinAnalysisScores.js`가 가져온다.
 * 점수는 0~100, 높을수록 건강한 상태다(백엔드 확인 기준).
 */
export const SKIN_ANALYSIS_FACTORS = [
  { key: 'pigmentation', score: 62 },
  { key: 'poreTexture', score: 58 },
  { key: 'wrinkle', score: 70 },
  { key: 'redness', score: 65 },
];
