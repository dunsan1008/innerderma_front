import client from '@/api/client';

/**
 * 인증 도메인 API.
 * 비밀번호 없이 userCode 만으로 인증하는 대회 시연용 구조 — userCode 는 서버가 아니라
 * 클라이언트가 생성해서 최초 1회 등록하고, 이후에는 같은 userCode 로 토큰만 재발급받는다.
 * (userCode 생성은 @/lib/auth 의 generateUserCode() 참고)
 */

/** 최초 가입. name/phoneNumber 는 필수값이지만 지금은 데모용 고정값을 사용한다. */
export function register({ userCode, name, phoneNumber }) {
  return client.post('/auth/register', { userCode, name, phoneNumber });
}

/** 기존 userCode 로 토큰 재발급 (요청 바디 없이 쿼리 파라미터로 전달) */
export function issueToken(userCode) {
  return client.post('/auth/token', null, { params: { userCode } });
}
