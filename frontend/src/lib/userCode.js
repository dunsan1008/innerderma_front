/**
 * userCode 생성.
 * 비밀번호 없이 userCode 만으로 인증하는 구조라, 신규 가입 시 클라이언트가
 * 고유값을 직접 만들어 서버에 등록한다(서버는 값을 발급해주지 않고 그대로 저장만 한다).
 */
export function generateUserCode() {
  return `USER-${crypto.randomUUID()}`;
}
