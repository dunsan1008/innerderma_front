import client from '@/api/client';

/**
 * 피부 상태 스냅샷 · 트렌드 · 진단 · 분석 도메인 API.
 */

/** 피부 상태 스냅샷 생성/갱신 */
export function createSkinStateSnapshot(userCode, body) {
  return client.post(`/users/${userCode}/skin-state-snapshots`, body);
}

/** 가장 최근 스냅샷 */
export function getLatestSkinStateSnapshot(userCode) {
  return client.get(`/users/${userCode}/skin-state-snapshots/latest`);
}

/** 피부 상태 추세 (회복/악화 추이) */
export function getSkinStateTrend(userCode) {
  return client.get(`/users/${userCode}/skin-state-trend`);
}

/** 가장 최근 진단 결과 */
export function getLatestSkinDiagnosis(userCode) {
  return client.get(`/users/${userCode}/skin-diagnosis`);
}

/** 진단 이력 */
export function getSkinDiagnosisHistory(userCode) {
  return client.get(`/users/${userCode}/skin-diagnosis/history`);
}

/** 피부 분석 실행. captureId 대상, actualAge 는 선택(자가 입력 나이) */
export function analyzeSkin(userCode, { captureId, actualAge } = {}) {
  return client.post(`/users/${userCode}/skin-analyses`, { captureId, actualAge });
}

/** 가장 최근 분석 결과 */
export function getLatestSkinAnalysis(userCode) {
  return client.get(`/users/${userCode}/skin-analyses/latest`);
}

/** 분석 이력 */
export function getSkinAnalysisHistory(userCode) {
  return client.get(`/users/${userCode}/skin-analyses/history`);
}
