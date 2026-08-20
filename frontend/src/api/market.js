import client from '@/api/client';

/**
 * 마켓(제품 · 추천) 도메인 API.
 *
 * `source`로 스토어를 구분한다 — 'PIECE_SEOUL'(피쓰 서울) / 'WIM_STORE'(윔 스토어).
 * "수부지"/"피부탄력" 카테고리 탭은 서버에 없는 개념이라, 응답의 `skinStateTags`를
 * 클라이언트에서 걸러서 흉내낸다 (수부지=HYDRATION 포함, 피부탄력=BARRIER_RECOVERY
 * 또는 STABLE 포함 — 백엔드팀 확인 기준. `hooks/useMarketProducts.js` 참고).
 * 추천(product-recommendations/daily)도 카테고리/스토어별로 나뉘지 않고 날짜별 1세트만
 * 온다 — 화면의 스토어/카테고리 탭 필터는 지금은 클라이언트에서 상품 목록을 걸러 써야 한다.
 * `/knowledge-products`는 삭제되고 `/products`로 통합됐다.
 */

/**
 * 상품 목록.
 * @param {object} [filters] { category, concern, source }
 */
export function getProducts({ category, concern, source } = {}) {
  return client.get('/products', { params: { category, concern, source } });
}

/** 상품 상세 (productCode 기준) */
export function getProduct(productCode) {
  return client.get(`/products/${productCode}`);
}

/** 오늘(또는 지정 날짜)의 데일리 맞춤 상품 추천 */
export function getDailyProductRecommendations(userCode, date) {
  return client.get(`/users/${userCode}/product-recommendations/daily`, { params: { date } });
}
