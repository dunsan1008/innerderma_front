import client from '@/api/client';

/**
 * 마켓(제품 · 추천) 도메인 API.
 *
 * 주의: 응답의 상품엔 category/targetConcern은 있지만 "피쓰 서울 vs 윔 스토어"를
 * 구분하는 필드가 명시적으로 없다 — brand 값("Pith"/"WIM" 등으로 추정)으로
 * 구분해야 할 가능성이 높다. 실제 데이터를 받아보고 확인 필요 (Phase 3에서 확정).
 * 추천(product-recommendations/daily)도 카테고리/스토어별로 나뉘지 않고 날짜별 1세트만
 * 온다 — 화면의 스토어/카테고리 탭 필터는 지금은 클라이언트에서 상품 목록을 걸러 써야 한다.
 */

/**
 * 상품 목록.
 * @param {object} [filters] { category, concern }
 */
export function getProducts({ category, concern } = {}) {
  return client.get('/products', { params: { category, concern } });
}

/** 상품 상세 (productCode 기준) */
export function getProduct(productCode) {
  return client.get(`/products/${productCode}`);
}

/** KB(지식베이스) 제품 전체 목록 — 판매 상품(products)과는 별개의 참고 데이터 */
export function getKnowledgeProducts() {
  return client.get('/knowledge-products');
}

/** KB 제품 상세 */
export function getKnowledgeProduct(productId) {
  return client.get(`/knowledge-products/${productId}`);
}

/** 오늘(또는 지정 날짜)의 데일리 맞춤 상품 추천 */
export function getDailyProductRecommendations(userCode, date) {
  return client.get(`/users/${userCode}/product-recommendations/daily`, { params: { date } });
}
