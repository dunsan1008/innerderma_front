import serum from '@/assets/figma/cart-serum.png';
import cream from '@/assets/figma/cart-cream.png';
import cleanser from '@/assets/figma/cart-cleanser.png';

/**
 * MY 장바구니 초기 담긴 상품 (Figma 1026:2397).
 * 추후 백엔드 연동 시 `GET /api/v1/cart` 응답으로 교체한다.
 *
 * Figma 는 3개 중 앞의 2개만 체크된 상태로 그려져 있다(선택 2개 / 90,000원).
 */
export const INITIAL_CART_ITEMS = [
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

/** Figma 기본 상태: 앞 두 개가 선택돼 있다 */
export const INITIAL_CART_SELECTED = ['serum', 'cream'];

/** 배송방법 옵션 */
export const DELIVERY_OPTIONS = ['기본', '새벽배송', '방문수령'];

/** 1,234,000 → "1,234,000원" */
export const formatPrice = (value) => `${value.toLocaleString('ko-KR')}원`;
