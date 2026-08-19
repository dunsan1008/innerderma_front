import banner53 from '@/assets/figma/products/banner-53.jpg';
import banner58 from '@/assets/figma/products/banner-58.jpg';
import banner59 from '@/assets/figma/products/banner-59.jpg';
import img17 from '@/assets/figma/products/img-17.jpg';
import img19 from '@/assets/figma/products/img-19.jpg';
import { CARD_IMAGE_BLEED, CARD_SIZES } from '@/constants/cardLayout';
import { MARKET_ALL_PRODUCTS, MARKET_OILY_PRODUCTS, MARKET_SKIN_PRODUCTS } from '@/constants/marketProducts';
import { WIM_BANNER_SLIDE, WIM_PRE_SOLUTION_SLIDE, WIM_PRODUCTS } from '@/constants/wimProducts';

/**
 * 추천 배너 슬라이드.
 * Figma 마켓 1·2·3 배너에 쓰인 사진과 상품 정보를 모아 자동 전환용으로 쓴다.
 * (디자인에 없는 이미지를 새로 만들지 않고, 세 화면의 배너를 그대로 돌린다)
 */
const BANNER_TAGS = ['피부재생', '수부지', '저자극 인증'];

const SLIDE_TONER = {
  image: banner53,
  name: '피쓰 클래리파이 겔 토너 340g',
  price: '54,000원',
  tags: BANNER_TAGS,
};
const SLIDE_SUN_ESSENCE = {
  image: banner58,
  name: '피쓰 판테티놀 선 에센스 30ml',
  price: '34,000원',
  tags: BANNER_TAGS,
};
const SLIDE_CORE_CREAM = {
  image: banner59,
  /** image 59 는 프레임 안에서 사진을 세로로 확대·이동시켜 쓴다 */
  imageInner: { w: '100%', h: '160.09%', top: '-30.04%' },
  name: '피쓰 코어 리빌드 크림 50ml',
  price: '54,000원',
  tags: BANNER_TAGS,
};

/**
 * 촬영·자가진단 **이전**에 보여주는 추천 배너 (피쓰 서울).
 *
 * 오프라인에서 받은 정밀진단·시술 데이터만으로도 제품을 추천·판매할 수 있으므로
 * 촬영 전에도 마켓은 정상적으로 열린다. 다만 데일리 분석 결과가 아직 반영되지 않은
 * 상태라, 촬영 후에 뜨는 배너와는 **다른 상품**을 내보내 추천 근거의 차이를 드러낸다.
 * (촬영 후에는 SLIDE_TONER 등 데일리 분석 기반 추천으로 바뀐다)
 */
const PRE_SOLUTION_TAGS = ['시술케어', '피부과전용', '정밀진단'];

export const PITH_PRE_SOLUTION_SLIDES = [
  {
    image: img19,
    name: '클리바 르 클레어 크렘 50ml',
    price: '48,000원',
    tags: PRE_SOLUTION_TAGS,
  },
  {
    image: img17,
    name: 'NaDC 크림 (#120도크림)',
    price: '43,000원',
    tags: PRE_SOLUTION_TAGS,
  },
];

/**
 * 마켓 화면 3종의 배치값. 모두 Figma 프레임 실측 절대 좌표다.
 *  - all  : 마켓 1 (870:6067 / 사후관리-전체)   — 배너 텍스트가 프레임 밖 형제 노드
 *  - oily : 마켓 2 (870:6068 / 사후관리-수부지) — 배너 텍스트가 프레임 안 자식 노드
 *  - skin : 마켓 3 (870:6070 / 사후관리-피부)   — 배너 사진에 추가 크롭이 있다
 *
 * 마켓 2·3 헤더에는 boxicons:heart 아이콘이 하나 더 있다(showHeart).
 */
export const MARKET_SCREENS = {
  all: {
    frameHeight: 1637,
    nodeId: '870:6067',
    name: '마켓 1',
    category: 'all',
    showHeart: false,
    title: { x: 19, y: 161, width: 345, height: 24 },
    banner: {
      nodeId: '870:5061',
      image: banner53,
      frame: [14, 214, 365, 316],
      stripHeight: 88,
      name: '피쓰 클래리파이 겔 토너 340g',
      nameAt: [14 + 21, 214 + 225],
      price: '54,000원',
      priceAt: [14 + 279, 214 + 244],
      tags: [
        { label: '피부재생', x: 14 + 21, y: 214 + 274, width: 61, textWidth: 45 },
        { label: '수부지', x: 14 + 88, y: 214 + 274, width: 61, textWidth: 40 },
        { label: '저자극 인증', x: 14 + 155, y: 214 + 274, width: 68, textWidth: 54 },
      ],
    },
    tabs: { x: 3, y: 543, width: 393 },
    filters: {
      top: 609,
      items: [
        { label: '성별', x: 191, caretX: 219, width: 25 },
        { label: '나이대', x: 244, caretX: 282, width: 35 },
        { label: '맞춤형 진단', x: 303, caretX: 365, width: 58 },
      ],
    },
    products: MARKET_ALL_PRODUCTS,
    bannerSlides: [SLIDE_TONER, SLIDE_SUN_ESSENCE, SLIDE_CORE_CREAM],
    preSolutionSlides: PITH_PRE_SOLUTION_SLIDES,
    tabBarTop: 1541,
  },

  oily: {
    frameHeight: 1637,
    nodeId: '870:6068',
    name: '마켓 2',
    category: 'oily',
    showHeart: true,
    title: { x: 19, y: 161, width: 345, height: 24 },
    banner: {
      nodeId: '870:5523',
      image: banner58,
      frame: [14, 214, 365, 316],
      stripHeight: 88,
      name: '피쓰 판테티놀 선 에센스 30ml',
      nameAt: [14 + 21, 214 + 225],
      price: '34,000원',
      priceAt: [14 + 279, 214 + 244],
      tags: [
        { label: '피부재생', x: 14 + 21, y: 214 + 274, width: 61, textWidth: 45 },
        { label: '수부지', x: 14 + 88, y: 214 + 274, width: 61, textWidth: 40 },
        { label: '저자극 인증', x: 14 + 155, y: 214 + 274, width: 68, textWidth: 54 },
      ],
    },
    tabs: { x: 3, y: 543, width: 393 },
    filters: {
      top: 609,
      items: [
        { label: '성별', x: 191, caretX: 219, width: 25 },
        { label: '나이대', x: 244, caretX: 282, width: 35 },
        { label: '맞춤형 진단', x: 303, caretX: 365, width: 58 },
      ],
    },
    products: MARKET_OILY_PRODUCTS,
    bannerSlides: [SLIDE_SUN_ESSENCE, SLIDE_CORE_CREAM, SLIDE_TONER],
    preSolutionSlides: PITH_PRE_SOLUTION_SLIDES,
    tabBarTop: 1541,
  },

  skin: {
    frameHeight: 1637,
    nodeId: '870:6070',
    name: '마켓 3',
    category: 'skin',
    showHeart: true,
    title: { x: 19, y: 161, width: 345, height: 24 },
    banner: {
      nodeId: '870:5342',
      image: banner59,
      /** image 59 는 프레임 안에서 사진을 세로로 확대·이동시켜 쓴다 */
      imageInner: { w: '100%', h: '160.09%', top: '-30.04%' },
      frame: [14, 214, 365, 316],
      stripHeight: 88,
      name: '피쓰 코어 리빌드 크림 50ml',
      nameAt: [14 + 21, 214 + 225],
      price: '54,000원',
      priceAt: [14 + 279, 214 + 244],
      tags: [
        { label: '피부재생', x: 14 + 21, y: 214 + 274, width: 61, textWidth: 45 },
        { label: '수부지', x: 14 + 88, y: 214 + 274, width: 61, textWidth: 40 },
        { label: '저자극 인증', x: 14 + 155, y: 214 + 274, width: 68, textWidth: 54 },
      ],
    },
    tabs: { x: 3, y: 543, width: 393 },
    filters: {
      top: 609,
      items: [
        { label: '성별', x: 191, caretX: 219, width: 25 },
        { label: '나이대', x: 244, caretX: 282, width: 35 },
        { label: '맞춤형 진단', x: 303, caretX: 365, width: 58 },
      ],
    },
    products: MARKET_SKIN_PRODUCTS,
    bannerSlides: [SLIDE_CORE_CREAM, SLIDE_TONER, SLIDE_SUN_ESSENCE],
    preSolutionSlides: PITH_PRE_SOLUTION_SLIDES,
    tabBarTop: 1541,
  },

  /**
   * 윔 스토어 (Figma 마켓 4 / 1117:1689).
   * 상품 데이터만 마켓 4 것이고, 좌표·규격은 위 마켓 1 과 완전히 동일하다.
   * (탭 전환 시 배너·탭·카드가 제자리에서 내용만 바뀌게 하기 위함)
   */
  wim: {
    frameHeight: 1637,
    nodeId: '1117:1689',
    name: '마켓 4 - wim store',
    store: 'wim',
    category: 'all',
    showHeart: false,
    title: { x: 19, y: 161, width: 345, height: 24 },
    banner: {
      nodeId: '1104:1409',
      image: WIM_BANNER_SLIDE.image,
      frame: [14, 214, 365, 316],
      stripHeight: 88,
      name: WIM_BANNER_SLIDE.name,
      nameAt: [14 + 21, 214 + 225],
      price: WIM_BANNER_SLIDE.price,
      priceAt: [14 + 279, 214 + 244],
      tags: [
        { label: '피부재생', x: 14 + 21, y: 214 + 274, width: 61, textWidth: 45 },
        { label: '수부지', x: 14 + 88, y: 214 + 274, width: 61, textWidth: 40 },
        { label: '저자극 인증', x: 14 + 155, y: 214 + 274, width: 68, textWidth: 54 },
      ],
    },
    tabs: { x: 3, y: 543, width: 393 },
    filters: {
      top: 609,
      items: [
        { label: '성별', x: 191, caretX: 219, width: 25 },
        { label: '나이대', x: 244, caretX: 282, width: 35 },
        { label: '맞춤형 진단', x: 303, caretX: 365, width: 58 },
      ],
    },
    products: WIM_PRODUCTS,
    bannerSlides: [WIM_BANNER_SLIDE],
    preSolutionSlides: [WIM_PRE_SOLUTION_SLIDE],
    tabBarTop: 1541,
  },
};

/**
 * 상품 키(이름)로 상품을 찾는다.
 * 상세 페이지가 라우트 파라미터만 받고 상품 객체는 모르기 때문에,
 * 목록과 같은 객체를 되돌려 줘야 찜 상태·이미지가 어긋나지 않는다.
 */
const ALL_KNOWN_PRODUCTS = [
  ...MARKET_ALL_PRODUCTS,
  ...MARKET_OILY_PRODUCTS,
  ...MARKET_SKIN_PRODUCTS,
  ...WIM_PRODUCTS,
];

/**
 * 배너 상품도 상세·찜 목록으로 들어올 수 있어 같은 목록에 넣어 둔다.
 * 레이어 박스는 상품 카드와 같은 CARD_IMAGE_BLEED 를 쓴다 — 배너 크기(393x362)로
 * 두면 찜 화면에서 카드 슬롯을 넘겨 사진 왼쪽 위 조각만 보인다.
 */
const BANNER_PRODUCTS = [
  SLIDE_TONER,
  SLIDE_SUN_ESSENCE,
  SLIDE_CORE_CREAM,
  WIM_BANNER_SLIDE,
  ...PITH_PRE_SOLUTION_SLIDES,
  WIM_PRE_SOLUTION_SLIDE,
].map((slide) => ({
  name: slide.name,
  price: slide.price,
  tags: slide.tags,
  layers: [{ box: CARD_IMAGE_BLEED, srcs: [slide.image] }],
  sizes: CARD_SIZES,
}));

const keyOf = (p) => (p.nameLines ? p.nameLines.join('').trim() : (p.name ?? '').trim());

export function findProductByKey(key) {
  if (!key) return null;
  const target = String(key).trim();
  return (
    ALL_KNOWN_PRODUCTS.find((p) => keyOf(p) === target) ||
    BANNER_PRODUCTS.find((p) => keyOf(p) === target) ||
    null
  );
}
