import client from '@/api/client';

/**
 * 찜 도메인 API.
 * 백엔드엔 토글 엔드포인트가 없다 — 추가/삭제를 각각 호출해서 화면단에서 토글처럼 보이게 한다.
 */

/** 찜 목록 조회 */
export function getWishlist(userCode) {
  return client.get(`/users/${userCode}/wishlist`);
}

/** 찜 추가. productSource 는 상품이 속한 스토어/출처 구분값 (cart.js 참고) */
export function addToWishlist(userCode, { productId, productSource }) {
  return client.post(`/users/${userCode}/wishlist`, { productId, productSource });
}

/** 찜 삭제 */
export function removeFromWishlist(userCode, productId) {
  return client.delete(`/users/${userCode}/wishlist/${productId}`);
}
