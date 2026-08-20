import client from '@/api/client';

/**
 * 피부 사진 촬영 도메인 API.
 * 업로드는 파일 하나만 받는다(멀티파트 필드명 `file`) — 촬영 일시는 서버가 결정한다.
 */

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

/** 사진 업로드만 (분석은 별도) */
export function uploadSkinCapture(userCode, file) {
  const form = new FormData();
  form.append('file', file);
  return client.post(`/users/${userCode}/skin-captures`, form, multipart);
}

/** 사진 업로드 + 분석을 한 번에 */
export function uploadAndAnalyzeSkinCapture(userCode, file) {
  const form = new FormData();
  form.append('file', file);
  return client.post(`/users/${userCode}/skin-captures/analyze`, form, multipart);
}

/** 오늘 촬영했는지 여부 */
export function getTodaySkinCapture(userCode) {
  return client.get(`/users/${userCode}/skin-captures/today`);
}

/** 가장 최근 촬영 */
export function getLatestSkinCapture(userCode) {
  return client.get(`/users/${userCode}/skin-captures/latest`);
}

/** 촬영 이력 */
export function getSkinCaptureHistory(userCode) {
  return client.get(`/users/${userCode}/skin-captures/history`);
}
