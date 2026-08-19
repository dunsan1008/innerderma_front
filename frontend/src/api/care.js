import client from '@/api/client';

/**
 * 케어 사이클 · 촬영 · 자가 상태 도메인 API.
 * 규칙: 화면에서 axios 를 직접 부르지 않고 이 모듈만 사용한다.
 *
 * 현재 화면들은 Figma 문구를 그대로 담은 더미 데이터(constants/*.js)로 동작하며,
 * 백엔드가 준비되면 각 화면에서 이 함수들로 교체한다.
 * 기획서 15장 핵심 데이터 모델을 기준으로 경로와 필드 이름을 잡았다.
 */

/** 방문 기록 연결 (가입화면 → 로딩중 → 연결 완료) */
export function linkVisitRecord({ userType, reserverName, visitCode, treatmentDate }) {
  return client.post('/visit-records/link', { userType, reserverName, visitCode, treatmentDate });
}

/**
 * 피부 사진 업로드.
 * 하루 한 번 제한은 서버가 사용자 현지 날짜(captureDate)로 판단한다.
 */
export function uploadSkinCapture({ file, capturedAt, captureDate, timezone }) {
  const form = new FormData();
  form.append('image', file);
  form.append('capturedAt', capturedAt);
  form.append('captureDate', captureDate);
  form.append('timezone', timezone);
  return client.post('/skin-captures', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

/** 자가 상태 입력 (통증·열감·당김 등) */
export function submitSelfCheck({ captureId, symptoms, checkedAt }) {
  return client.post('/self-checks', { captureId, symptoms, checkedAt });
}

/**
 * 특정 날짜의 케어 사이클 조회.
 * 응답에 generationType(NEW_ANALYSIS | CARRIED_FORWARD)과 기준 촬영일이 함께 온다.
 */
export function getCareCycle(date) {
  return client.get('/care-cycles', { params: { date } });
}

/** 월별 케어 기록 (캘린더용) */
export function getCareRecords(month) {
  return client.get('/care-records', { params: { month } });
}

/** 루틴 수행 완료 체크 */
export function completeRoutine({ cycleId, phase }) {
  return client.post(`/care-cycles/${cycleId}/complete`, { phase });
}
