import img15 from '@/assets/figma/products/img-15.png';
import img16 from '@/assets/figma/products/img-16.png';
import img17 from '@/assets/figma/products/img-17.png';
import img18 from '@/assets/figma/products/img-18.png';
import img19 from '@/assets/figma/products/img-19.png';
import img20 from '@/assets/figma/products/img-20.png';
import img21 from '@/assets/figma/products/img-21.png';
import m215 from '@/assets/figma/products/m2-15.png';
import m216 from '@/assets/figma/products/m2-16.png';
import m217 from '@/assets/figma/products/m2-17.png';
import m218 from '@/assets/figma/products/m2-18.png';
import m219 from '@/assets/figma/products/m2-19.png';
import m220 from '@/assets/figma/products/m2-20.png';
import m315 from '@/assets/figma/products/m3-15.png';
import m316 from '@/assets/figma/products/m3-16.png';
import m317 from '@/assets/figma/products/m3-17.png';
import m318 from '@/assets/figma/products/m3-18.png';
import m319 from '@/assets/figma/products/m3-19.png';
import m320 from '@/assets/figma/products/m3-20.png';
import m321 from '@/assets/figma/products/m3-21.png';
import m322 from '@/assets/figma/products/m3-22.png';

/**
 * 마켓 상품 카드 데이터.
 * 이미지·좌표·글자 크기 모두 Figma 실측치이며 임의로 바꾸지 않는다.
 * (Figma 에서 카드마다 사진 크롭 박스와 빈 Paragraph 높이가 달라 그 값을 그대로 담는다)
 *
 * 추후 백엔드 연동 시 상품 정보(name/price/tags/imageUrl)는 API 응답으로 바꾸고
 * box·sizes 같은 레이아웃 값은 카드 컴포넌트 기본값으로 정리한다.
 */

/** 마켓 1 (사후관리-전체) Group 54 — 6개 카드 */
export const MARKET_ALL_PRODUCTS = [
  {
    nodeId: '870:4951',
    left: 20,
    top: 670,
    imageWidth: 155,
    layers: [{ box: [-34.67, -20.67, 199, 184], srcs: [img15], inner: { w: '106.26%', h: '115.38%', top: '-7.69%' } }],
    name: '피쓰 코어 리빌드 크림 50ml',
    price: '54,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
    sizes: { nameBox: 34, nameSize: 12, priceBox: 23, priceSize: 14, priceWidth: 65, tagBox: 29 },
  },
  {
    nodeId: '870:4968',
    left: 20,
    top: 1258,
    layers: [{ box: [-10.67, -19.67, 187, 162], srcs: [img16] }],
    nameLines: ['하이알차저™ 온리 ', '(#일자형 고분자 히알루론산)'],
    price: '27,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
    sizes: { nameSize: 11, nameHeight: 33, spacer: 0, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:4986',
    left: 204,
    top: 670,
    layers: [{ box: [-13.67, -20.67, 189, 163], srcs: [img17] }],
    name: 'NaDC 크림 (#120도크림)',
    price: '43,000원',
    tags: ['지방파괴', '수부지', '피부탄력'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 14, priceWidth: 68, tagBox: 46 },
  },
  {
    nodeId: '870:5004',
    left: 204,
    top: 964,
    layers: [
      { box: [-13.67, -20.67, 189, 163], srcs: [img18] },
      { box: [-17.67, -27.67, 197, 171], srcs: [img19, img20] },
    ],
    name: '피쓰 판테티놀 선 에센스 30ml',
    price: '36,000원',
    tags: ['피부재생', '수부지', '피부탄력'],
    sizes: { nameSize: 11, nameHeight: 37, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5022',
    left: 205,
    top: 1258,
    layers: [
      { box: [-48.67, -27.67, 228.462, 198], srcs: [img15] },
      { box: [-48.67, -27.67, 228.462, 198], srcs: [img21] },
    ],
    nameLines: ['닥터펩티 센텔라 모이스트 ', '수딩 젤 크림 EX 70ml'],
    price: '31,000원',
    tags: ['미백개선', '주름개선', '수부지'],
    sizes: { nameSize: 11, nameHeight: 39, priceSize: 13, priceWidth: '100%', tagBox: 35 },
  },
  {
    nodeId: '870:5040',
    left: 18,
    top: 964,
    layers: [{ box: [-17.67, -27.67, 197, 171], srcs: [img19] }],
    name: '클리바 르 클레어 크렘 50ml',
    price: '48,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 39 },
  },
];

/* ------------------------------------------------------------------ */
/* 마켓 2 (사후관리-수부지) Group 53 870:5391 — 6개 카드                  */
/* ------------------------------------------------------------------ */

export const MARKET_OILY_PRODUCTS = [
  {
    nodeId: '870:5392',
    wishedInDesign: false,
    left: 19,
    top: 964,
    layers: [{ box: [-48.67, -27.67, 228.462, 198], srcs: [m215] }],
    nameLines: ['닥터펩티 펩타이드 볼륨 ', '에센스 2.0 100ml'],
    price: '41,000원',
    tags: ['피부재생', '피부탄력', '수부지'],
    sizes: { nameBox: 35, nameSize: 12, nameLeading: 14, priceBox: 25, priceSize: 13, priceWidth: '100%', tagBox: 28 },
  },
  {
    nodeId: '870:5409',
    wishedInDesign: false,
    left: 203,
    top: 670,
    layers: [{ box: [-10.67, -19.67, 187, 162], srcs: [m216] }],
    nameLines: ['하이알차저™ 온리 ', '(#일자형 고분자 히알루론산)'],
    price: '27,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
    sizes: { nameBox: 39, nameSize: 11, priceBox: 24, priceSize: 13, priceWidth: '100%', tagBox: 20 },
  },
  {
    nodeId: '870:5426',
    wishedInDesign: false,
    left: 203,
    top: 964,
    layers: [{ box: [-13.67, -20.67, 189, 163], srcs: [m217] }],
    name: '피쓰 블루 리페어 솔루션 1매',
    price: '18,000원',
    tags: ['피부재생', '수부지', '건성'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5445',
    wishedInDesign: false,
    left: 17,
    top: 670,
    layers: [
      { box: [-13.67, -20.67, 189, 163], srcs: [m217] },
      { box: [-17.67, -27.67, 197, 171], srcs: [m218] },
    ],
    name: '큐리페어 더마 앰플',
    price: '47,600원',
    tags: ['피부재생', '수부지', '피부탄력'],
    sizes: { nameSize: 11, nameHeight: 37, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5463',
    wishedInDesign: false,
    left: 202,
    top: 1258,
    layers: [{ box: [-13.67, -20.67, 189, 163], srcs: [m219] }],
    name: '피쓰 코어 리빌드 크림 50ml',
    price: '33,600원',
    tags: ['지방파괴', '수부지', '피부탄력'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5482',
    wishedInDesign: false,
    left: 20,
    top: 1258,
    imageWidth: 155,
    layers: [{ box: [-34.67, -20.67, 199, 184], srcs: [m220], inner: { w: '106.26%', h: '115.38%', top: '-7.69%' } }],
    name: '피쓰 코어 리빌드 크림 50ml',
    price: '54,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
    sizes: { nameBox: 34, nameSize: 12, priceBox: 23, priceSize: 13, priceWidth: '100%', tagBox: 29 },
  },
];

/* ------------------------------------------------------------------ */
/* 마켓 3 (사후관리-피부) Group 55 870:5229 + Frame 80 870:5371 — 6개    */
/* Group 55 는 (21, 675) 에 놓여 있어 자식 좌표에 그 값을 더한다.          */
/* ------------------------------------------------------------------ */

export const MARKET_SKIN_PRODUCTS = [
  {
    nodeId: '870:5230',
    wishedInDesign: false,
    left: 21 + 185,
    top: 675 + 0,
    layers: [{ box: [-10.67, -19.67, 187, 162], srcs: [m315] }],
    name: '하이니컬 딥프팅 앰플',
    price: '29,900원',
    tags: ['피부보습', '수부지', '피부탄력'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5248',
    wishedInDesign: false,
    left: 21 + 185,
    top: 675 + 294,
    layers: [{ box: [-10.67, -19.67, 187, 162], srcs: [m316] }],
    name: '[대용량 80ml] 칼슘 본딩 세럼',
    price: '29,800원',
    tags: ['피부보습', '수부지', '피부탄력'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5266',
    wishedInDesign: false,
    left: 21 + 0,
    top: 675 + 588,
    layers: [{ box: [-10.67, -19.67, 187, 162], srcs: [m317] }],
    nameLines: ['[대용량 100ml] 칼슘 본딩 ', '페이셜 크림'],
    price: '54,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
    /** Figma 에서 가격이 먼저 오고 그 아래 h3 짜리 빈 Paragraph 가 붙는다 */
    sizes: { nameSize: 11, priceSize: 13, priceWidth: '100%', spacerAfterPrice: 3, tagBox: 42 },
  },
  {
    nodeId: '870:5285',
    wishedInDesign: false,
    left: 21 + 1,
    top: 675 + 0,
    layers: [
      { box: [-13.67, -20.67, 189, 163], srcs: [m318] },
      { box: [-17.67, -27.67, 197, 171], srcs: [m319, m320] },
    ],
    name: '피쓰 판테티놀 선 에센스 30ml',
    price: '34,000원',
    tags: ['피부재생', '수부지', '피부탄력'],
    sizes: { nameSize: 11, nameHeight: 37, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    nodeId: '870:5303',
    wishedInDesign: false,
    left: 21 + 1,
    top: 675 + 294,
    layers: [{ box: [-13.67, -20.67, 189, 163], srcs: [m321] }],
    name: 'NaDC 크림 (#120도크림)',
    price: '43,000원',
    tags: ['지방파괴', '수부지', '피부탄력'],
    sizes: { nameSize: 11, spacer: 20, priceSize: 13, priceWidth: '100%', tagBox: 46 },
  },
  {
    /** Frame 80 (217,1127) 안의 PostCard 가 (0,137) 에 놓여 있다 */
    nodeId: '870:5373',
    wishedInDesign: false,
    left: 217,
    top: 1127 + 137,
    layers: [{ box: [-48.67, -27.67, 228.462, 198], srcs: [m322] }],
    nameLines: ['닥터펩티 펩타이드 볼륨 ', '에센스 2.0 100ml'],
    price: '41,000원',
    tags: ['피부재생', '피부탄력', '수부지'],
    sizes: { nameBox: 35, nameSize: 12, nameLeading: 14, priceBox: 25, priceSize: 13, priceWidth: '100%', tagBox: 28 },
  },
];
