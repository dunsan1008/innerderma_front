import client from '@/api/client';

/**
 * 케어 사이클 · 솔루션 · 완료 기록 도메인 API.
 * 모든 함수는 userCode 를 첫 인자로 받는다(경로 파라미터).
 */

/** 특정 날짜(생략 시 오늘)의 케어 사이클 */
export function getDailyCareCycle(userCode, date) {
  return client.get(`/users/${userCode}/care-cycles/daily`, { params: { date } });
}

/** 케어 사이클 생성 */
export function createCareCycle(userCode) {
  return client.post(`/users/${userCode}/care-cycles`);
}

/** 특정 날짜(생략 시 오늘)의 케어 솔루션 */
export function getDailyCareSolution(userCode, date) {
  return client.get(`/users/${userCode}/care-solutions/daily`, { params: { date } });
}

/** 케어 솔루션 생성 (특정 케어 사이클 기준) */
export function createCareSolution(userCode, careCycleId) {
  return client.post(`/users/${userCode}/care-solutions`, { careCycleId });
}

/** 특정 날짜(생략 시 오늘)의 루틴 수행 완료 여부 */
export function getCareCompletions(userCode, date) {
  return client.get(`/users/${userCode}/care-completions`, { params: { date } });
}

/** 루틴 수행 완료 저장. phase: 'NIGHT' | 'MORNING' */
export function saveCareCompletion(userCode, { servedDate, phase, completed }) {
  return client.put(`/users/${userCode}/care-completions`, { servedDate, phase, completed });
}

/** 기간별 완료 이력 (캘린더용). from/to 생략 가능 */
export function getCareCompletionHistory(userCode, { from, to } = {}) {
  return client.get(`/users/${userCode}/care-completions/history`, { params: { from, to } });
}

/** 기간별 완료 요약 통계 */
export function getCareCompletionSummary(userCode, { from, to } = {}) {
  return client.get(`/users/${userCode}/care-completions/summary`, { params: { from, to } });
}

/** 특정 날짜(생략 시 오늘)의 데일리 케어 통합 조회 */
export function getDailyCare(userCode, date) {
  return client.get(`/users/${userCode}/daily-care`, { params: { date } });
}

/** 기간별 케어 기록 목록 */
export function getCareHistory(userCode, { from, to } = {}) {
  return client.get(`/users/${userCode}/care-history`, { params: { from, to } });
}

/** 특정 날짜의 케어 기록 상세 */
export function getCareHistoryDetail(userCode, date) {
  return client.get(`/users/${userCode}/care-history/${date}`);
}

/** AI Care 생성 (규칙 엔진 실행). locale 생략 시 서버 기본값 */
export function createAiCare(userCode, locale) {
  return client.post(`/users/${userCode}/ai-care`, null, { params: { locale } });
}
