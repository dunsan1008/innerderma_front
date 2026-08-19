import serum from '@/assets/figma/cart-serum.jpg';
import cream from '@/assets/figma/cart-cream.jpg';
import cleanser from '@/assets/figma/cart-cleanser.jpg';

/**
 * MY 장바구니 초기 상태.
 *
 * **비어 있다.** 사용자가 직접 담지 않은 상품이 장바구니에 들어 있으면
 * 최초 접속 시 담은 적 없는 주문이 있는 것처럼 보인다.
 * 그래서 Figma 의 "3개 담긴" 상태는 디자인 참고용으로만 남기고
 * 실제 초기값은 빈 목록으로 둔다.
 *
 * 추후 백엔드 연동 시 `GET /api/v1/cart` 응답으로 교체한다.
 */
export const INITIAL_CART_ITEMS = [];

/** 장바구니 기본 선택 — 담긴 상품이 없으므로 비어 있다 */
export const INITIAL_CART_SELECTED = [];

/**
 * Figma 1026:2397 에 그려져 있던 예시 상품.
 * 초기값으로는 쓰지 않고, 상세 화면에서 "장바구니 담기" 시 참고할 옵션 문구·규격의
 * 근거로만 남겨 둔다. (디자인 대조용)
 */
export const CART_DESIGN_SAMPLE = [
  {
    id: 'serum',
    name: 'InnerDerma 세럼',
    option: '히알루론산 집중 수분 앰플 50ml',
    price: 38000,
    image: serum,
    delivery: '기본',
    quantity: 1,
    nodeId: '1026:2426',
  },
  {
    id: 'cream',
    name: 'InnerDerma 크림',
    option: '장벽 강화 리페어 크림 100ml',
    price: 52000,
    image: cream,
    delivery: '기본',
    quantity: 1,
    nodeId: '1026:2461',
  },
  {
    id: 'cleanser',
    name: 'InnerDerma 클렌저',
    option: '저자극 약산성 폼 클렌저 150ml',
    price: 24000,
    image: cleanser,
    delivery: '기본',
    quantity: 1,
    nodeId: '1026:2496',
  },
];

/** 배송방법 옵션 */
export const DELIVERY_OPTIONS = ['기본', '새벽배송', '방문수령'];

/** 1,234,000 → "1,234,000원" */
export const formatPrice = (value) => `${value.toLocaleString('ko-KR')}원`;
