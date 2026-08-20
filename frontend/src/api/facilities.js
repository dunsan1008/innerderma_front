import client from '@/api/client';

/**
 * 제휴 시설(지점) 도메인 API.
 * 응답은 { id, facilityCode, name } 뿐이라 방문 기록 연결과는 무관해 보인다 —
 * 지금은 어느 화면도 쓰지 않는다. 용도가 명확해지면(예: 지점 선택 UI) 연결한다.
 */

/** 시설 목록 */
export function getFacilities() {
  return client.get('/facilities');
}

/** 시설 상세 */
export function getFacility(facilityCode) {
  return client.get(`/facilities/${facilityCode}`);
}
