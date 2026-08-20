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
