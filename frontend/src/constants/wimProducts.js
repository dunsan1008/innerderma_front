import wimBanner from '@/assets/figma/products/wim-banner.png';
import wim1 from '@/assets/figma/products/wim-1.png';
import wim2 from '@/assets/figma/products/wim-2.png';
import wim3 from '@/assets/figma/products/wim-3.png';
import wim4 from '@/assets/figma/products/wim-4.png';
import wim5 from '@/assets/figma/products/wim-5.png';
import wim6 from '@/assets/figma/products/wim-6.png';

/**
 * 윔 스토어 상품 (Figma 마켓 4 / 1117:1689).
 *
 * 상품 정보(이름·가격·태그·이미지)는 마켓 4 실측 그대로 쓰지만
 * **좌표와 카드 규격은 마켓 1 기준으로 통일**한다.
 * 마켓 4 는 카드가 173x256.5 / 2열 그리드로 따로 그려져 있어 그대로 옮기면
 * 피쓰 서울 탭과 카드 크기·간격이 달라 보인다. 그래서 마켓 1 의
 * PostCard 규격(167x272)과 배치 좌표를 그대로 재사용했다.
 *
 * 이미지는 마켓 4 의 각 카드 이미지 프레임을 2배 해상도로 내보낸 것이다
 * (166x143 슬롯에 332x286 을 넣어 선명하게 보이게 했다).
 *
 * 추후 백엔드 연동 시 `GET /api/v1/wim-store/products` 응답으로 교체한다.
 */

/** 마켓 1 Group 54 와 같은 6칸 배치 */
const SLOTS = [
  { left: 20, top: 670 },
  { left: 204, top: 670 },
  { left: 18, top: 964 },
  { left: 204, top: 964 },
  { left: 20, top: 1258 },
  { left: 205, top: 1258 },
];

/** 카드 본문 규격 — 이름을 18자로 자르므로 6칸 모두 같은 높이를 쓴다 */
const CARD_SIZES = {
  nameSize: 11,
  nameHeight: 33,
  priceSize: 13,
  priceWidth: '100%',
  tagBox: 46,
};

/** 이미지는 이미 카드 슬롯(166x143)에 맞게 잘라 내보냈다 */
const layersOf = (src) => [{ box: [0, 0, 166, 143], srcs: [src] }];

const ITEMS = [
  {
    nodeId: '1104:1458',
    name: '[내과전문의 설계] 마시는 식이섬유 비포밀 (30포/BOX)',
    price: '34,000원',
    tags: ['피부보호', '수부지', '저자극 인증'],
    image: wim1,
  },
  {
    nodeId: '1104:1483',
    name: '[내과전문의 설계] 마시는 식이섬유 비포밀 스위치 (30포/BOX)',
    price: '36,000원',
    tags: ['피부보호', '수부지', '저탄탁'],
    image: wim2,
  },
  {
    nodeId: '1104:1508',
    name: '저당, 저탄수, 고단백 윔쉐이크 검은콩 대용량 800g',
    price: '56,000원',
    tags: ['지방재생', '수부지', '저자극 인증'],
    image: wim3,
  },
  {
    nodeId: '1104:1533',
    name: '저당, 저탄수, 고단백 윔쉐이크 말차 420g',
    price: '36,000원',
    tags: ['피부보호', '수부지', '저탄탁'],
    image: wim4,
  },
  {
    nodeId: '1104:1558',
    name: '윔도시락 소불고기 곤드레밥 외 6종(최소구매2개) / (냉동/택배배송)',
    price: '10,900원',
    tags: ['피부보호', '수부지', '저자극 인증'],
    image: wim5,
  },
  {
    nodeId: '1104:1582',
    name: '저당, 저탄수, 고단백 윔쉐이크 초코 30g x 5개입',
    price: '17,000원',
    tags: ['피부재생', '수부지', '저자극 인증'],
    image: wim6,
  },
];

export const WIM_PRODUCTS = ITEMS.map((item, i) => ({
  nodeId: item.nodeId,
  left: SLOTS[i].left,
  top: SLOTS[i].top,
  layers: layersOf(item.image),
  name: item.name,
  price: item.price,
  tags: item.tags,
  sizes: CARD_SIZES,
}));

/** 추천 배너 (Figma 1104:1409 / 1104:1411) — 좌표는 마켓 1 배너와 동일 */
export const WIM_BANNER_SLIDE = {
  image: wimBanner,
  name: '저당, 저탄수, 고단백 윔쉐이크 초코 대용량 800g',
  price: '56,000원',
  tags: ['피부재생', '수부지', '저자극 인증'],
};
