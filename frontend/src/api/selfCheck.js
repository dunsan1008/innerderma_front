import client from '@/api/client';

/**
 * 데일리 자가 문진 도메인 API.
 *
 * 주의: 백엔드는 11개 항목(pain/heatSensation/tightness/dryness/itching/swelling/
 * peeling/breakout/oozing/bleeding/barrierDamage) 각각을 'NONE'|'MILD'|'MODERATE'|'SEVERE'
 * 4단계로 받는다. 지금 SelfCheckScreen(`constants/selfCheck.js`)은 5개 항목
 * 다중 선택(있음/없음) UI라서, 화면을 실제 연동할 때 두 모델을 맞추는 작업이 필요하다
 * (예: 선택 안 함=NONE, 선택함=MODERATE 로 단순 매핑하거나, 문항 자체를 백엔드 11개
 * 항목에 맞춰 다시 설계하거나 — Phase 2에서 결정).
 */

/** @param {object} answers 11개 항목 각각 'NONE'|'MILD'|'MODERATE'|'SEVERE', note는 선택 */
export function submitSelfCheck(userCode, answers) {
  return client.post(`/users/${userCode}/self-checks`, answers);
}

/** 가장 최근 자가문진 (+ 그 시점 스냅샷 요약) */
export function getLatestSelfCheck(userCode) {
  return client.get(`/users/${userCode}/self-checks/latest`);
}

/** 자가문진 이력 */
export function getSelfCheckHistory(userCode) {
  return client.get(`/users/${userCode}/self-checks/history`);
}
