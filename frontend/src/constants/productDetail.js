import hero from '@/assets/figma/pd-hero.jpg';
import combo1 from '@/assets/figma/pd-combo-1.jpg';
import combo2 from '@/assets/figma/pd-combo-2.jpg';
import combo3 from '@/assets/figma/pd-combo-3.jpg';

/**
 * 상품 상세 (Figma 1026:2575 ProductDetail).
 * 추후 백엔드 연동 시 `GET /api/v1/products/{id}` 응답으로 교체한다.
 */
export const PRODUCT_DETAIL = {
  id: 'pith-core-rebuild-cream',
  name: '피쓰 코어 리빌드 크림 50ml',
  option: '장벽 강화 리페어 크림 50ml',
  price: 54000,
  image: hero,
  tags: [
    { label: '피부재생', width: 61, textWidth: 45 },
    { label: '수부지', width: 61, textWidth: 40 },
    { label: '저자극 인증', width: 68, textWidth: 54 },
  ],
  /** 많이 구매하는 베스트 조합 (Figma 1026:2617) */
  combo: {
    title: '많이 구매하는 베스트 조합',
    images: [combo1, combo2, combo3],
    cta: '장바구니에 바로 담기',
    /**
     * 콤보에 포함된 실제 상품 3개.
     * 장바구니에 담을 때 이 정보를 쓴다 — 예전에는 메인 상품을 수량 3으로 담았다.
     * 이미지 순서는 Figma 좌→우와 같다.
     */
    products: [
      { id: 'combo-core-cream', name: '피쓰 코어 리빌드 크림', option: '50ml', price: 54000, image: combo1 },
      { id: 'combo-hyalcharger', name: '하이알차저™ 온리', option: '#일자형 고분자 히알루론산', price: 27000, image: combo2 },
      { id: 'combo-sun-essence', name: '피쓰 판테티놀 선 에센스', option: '30ml', price: 36000, image: combo3 },
    ],
  },
};
