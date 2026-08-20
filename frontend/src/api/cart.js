import client from '@/api/client';

/**
 * 장바구니 도메인 API.
 *
 * 주의: 배송방법(기본/새벽배송/방문수령) 필드가 백엔드 스키마에 없다 —
 * `store/cartStore.js`의 delivery 상태는 당분간 프론트 전용으로 유지한다.
 */

/** 장바구니 조회 */
export function getCart(userCode) {
  return client.get(`/users/${userCode}/cart`);
}

/** 장바구니 추가. productSource 는 상품이 속한 스토어/출처 구분값으로 보인다 */
export function addToCart(userCode, { productId, productSource, quantity = 1 }) {
  return client.post(`/users/${userCode}/cart`, { productId, productSource, quantity });
}

/** 장바구니 수량 변경 */
export function updateCartQuantity(userCode, productId, quantity) {
  return client.patch(`/users/${userCode}/cart/${productId}`, { quantity });
}

/** 장바구니 항목 삭제 */
export function removeFromCart(userCode, productId) {
  return client.delete(`/users/${userCode}/cart/${productId}`);
}

/** 장바구니 전체 비우기 */
export function clearCart(userCode) {
  return client.delete(`/users/${userCode}/cart`);
}
