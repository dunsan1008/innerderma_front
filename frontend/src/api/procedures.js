import client from '@/api/client';

/**
 * 시술 기록 도메인 API.
 * RoutineScreen의 "왜 이 루틴인가요"(시술 후 경과일 등)와
 * MyPageScreen의 "내 시술 관리"가 이 데이터를 쓴다.
 */

/** 시술 기록 목록 */
export function getProcedures(userCode) {
  return client.get(`/users/${userCode}/procedures`);
}

/** 시술 기록 상세 */
export function getProcedure(userCode, id) {
  return client.get(`/users/${userCode}/procedures/${id}`);
}

/** 현재 시술 맥락 (가장 최근 시술 기준 경과일·회복 단계 등) */
export function getTreatmentContext(userCode) {
  return client.get(`/users/${userCode}/procedures/treatment-context`);
}

/** 선택 가능한 시술 목록(드롭다운용). KB에 등록된 시술만 온다 */
export function getAvailableTreatments(userCode) {
  return client.get(`/users/${userCode}/procedures/available-treatments`);
}

/**
 * 시술 여부 등록. 온보딩(가입 직후)에서 한 번 호출한다.
 * 받았으면 { hadProcedure: true, treatmentCode, procedureDate?, facilityCode? } —
 * 회복 기간·주의사항 등 임상 값은 클라이언트가 만들지 않고 서버가 Treatment KB에서 채운다.
 * 안 받았으면 { hadProcedure: false } — 기록을 만들지 않는다(기록 없음 = 미시술 상태).
 * 등록 시 서버의 SolutionCache가 무효화되어 다음 /ai-care 호출에 바로 반영된다.
 */
export function registerProcedure(userCode, { hadProcedure, treatmentCode, procedureDate, facilityCode }) {
  return client.post(`/users/${userCode}/procedures`, { hadProcedure, treatmentCode, procedureDate, facilityCode });
}
