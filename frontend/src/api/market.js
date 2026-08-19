import client from '@/api/client';

/**
 * 마켓(제품 추천 · 찜 · 필터) 도메인 API.
 * 규칙: 화면에서 axios 를 직접 부르지 않고 이 모듈만 사용한다.
 *
 * 현재는 constants/marketProducts.js 의 Figma 더미 데이터로 화면이 동작한다.
 */

/**
 * 카테고리·필터별 추천 상품 목록.
 * @param {'all'|'oily'|'skin'} category 카테고리 탭 (전체 / 수부지 / 피부탄력)
 * @param {object} filters { gender, ageGroup, diagnosis }
 */
export function getRecommendedProducts({ category = 'all', filters = {} } = {}) {
  return client.get('/products/recommended', { params: { category, ...filters } });
}

/** 찜 목록 */
export function getWishlist() {
  return client.get('/wishlist');
}

/** 찜 토글 */
export function toggleWishlist(productId) {
  return client.post(`/wishlist/${productId}/toggle`);
}

/** 찜 목록에서 선택 삭제 */
export function removeFromWishlist(productIds) {
  return client.delete('/wishlist', { data: { productIds } });
}
