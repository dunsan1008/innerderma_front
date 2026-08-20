import client from '@/api/client';

/**
 * 사용자 프로필 · 환경설정 도메인 API.
 */

/** 사용자 조회 */
export function getUser(userCode) {
  return client.get(`/users/${userCode}`);
}

/** 프로필 수정 (name/phoneNumber 둘 다 선택적) */
export function updateProfile(userCode, { name, phoneNumber }) {
  return client.put(`/users/${userCode}`, { name, phoneNumber });
}

/** 환경설정 조회 — 지금은 locale 하나뿐이다 */
export function getPreference(userCode) {
  return client.get(`/users/${userCode}/preference`);
}

/** 환경설정 수정 */
export function updatePreference(userCode, locale) {
  return client.put(`/users/${userCode}/preference`, { locale });
}
