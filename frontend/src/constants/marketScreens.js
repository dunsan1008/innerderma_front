import banner53 from '@/assets/figma/products/banner-53.jpg';
import banner58 from '@/assets/figma/products/banner-58.jpg';
import banner59 from '@/assets/figma/products/banner-59.jpg';
import img17 from '@/assets/figma/products/img-17.jpg';
import img19 from '@/assets/figma/products/img-19.jpg';
import { CARD_IMAGE_BLEED, CARD_SIZES } from '@/constants/cardLayout';
import { MARKET_ALL_COMBINED, MARKET_ALL_PRODUCTS, MARKET_OILY_PRODUCTS, MARKET_SKIN_PRODUCTS } from '@/constants/marketProducts';
import {
  WIM_BANNER_SLIDE,
  WIM_BANNER_SLIDES,
  WIM_OILY_BANNER_SLIDES,
  WIM_OILY_PRODUCTS,
  WIM_PRE_SOLUTION_SLIDE,
  WIM_PRE_SOLUTION_SLIDES,
  WIM_PRODUCTS,
  WIM_SKIN_BANNER_SLIDES,
  WIM_SKIN_PRODUCTS,
} from '@/constants/wimProducts';

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
 * 필터 행의 세 드롭다운. 네 화면(마켓 1/2/3/윔) 모두 같은 순서를 쓴다.
 * `label` 대신 안정적인 `key` 를 쓴다 — 라벨은 `t.filter[key]` 로 언어별로 번역되므로,
 * 번역된 문자열을 라우팅 키로 쓰면 한국어 외 언어에서 매칭이 깨진다.
 * 좌표는 FilterRow 가 오른쪽 정렬로 직접 잡으므로 여기서 갖지 않는다.
 */
const FILTER_ITEMS = [{ key: 'gender' }, { key: 'age' }, { key: 'diagnosis' }];

/**
 * 윔 스토어 3탭 (Figma 마켓 4 / 1117:1689).
 *
 * Figma 에는 윔 화면이 한 장(전체)뿐이라 카테고리별 프레임이 없다. 그래서 세 탭이
 * 같은 nodeId 를 공유하고, **좌표·규격은 마켓 1 기준으로 통일**한다는 기존 결정을
 * 그대로 따른다(상품 목록과 배너 슬라이드만 카테고리별로 다르다). 덕분에 탭을 눌러도
 * 배너·필터 행·카드 격자가 제자리에서 내용만 바뀐다.
 *
 * `showHeart` 는 세 탭 모두 false 다 — 피쓰는 Figma 마켓 2·3 에 하트가 하나 더 있어
 * 탭마다 헤더가 달라지지만, 윔은 근거가 되는 프레임이 없으므로 헤더를 고정해
 * 탭 전환 시 상단바가 흔들리지 않게 둔다.
 */
const wimScreen = ({ category, name, products, bannerSlides }) => ({
  /** 상품 수가 카테고리마다 다르므로 마지막 카드 위치에서 높이를 구한다 */
  get frameHeight() {
    const last = products[products.length - 1];
    return last ? last.top + 272 + 107 : 1637;
  },
  nodeId: '1117:1689',
  name,
  store: 'wim',
  category,
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
    items: FILTER_ITEMS,
  },
  products,
  bannerSlides,
  preSolutionSlides: WIM_PRE_SOLUTION_SLIDES,
  get tabBarTop() {
    return this.frameHeight - 96;
  },
});

const WIM_SCREENS = {
  wim: wimScreen({
    category: 'all',
    name: '마켓 4 - wim store',
    products: WIM_PRODUCTS,
    bannerSlides: WIM_BANNER_SLIDES,
  }),
  wimOily: wimScreen({
    category: 'oily',
    name: '마켓 4 - wim store (수부지)',
    products: WIM_OILY_PRODUCTS,
    bannerSlides: WIM_OILY_BANNER_SLIDES,
  }),
  wimSkin: wimScreen({
    category: 'skin',
    name: '마켓 4 - wim store (피부탄력)',
    products: WIM_SKIN_PRODUCTS,
    bannerSlides: WIM_SKIN_BANNER_SLIDES,
  }),
};

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
    /** frameHeight 는 상품 수에 따라 동적으로 계산한다 */
    get frameHeight() {
      const last = MARKET_ALL_COMBINED[MARKET_ALL_COMBINED.length - 1];
      return last ? last.top + 272 + 107 : 1637; // 마지막 카드 top + 카드 높이 + 하단 여백
    },
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
      items: FILTER_ITEMS,
    },
    products: MARKET_ALL_COMBINED,
    bannerSlides: [SLIDE_TONER, SLIDE_SUN_ESSENCE, SLIDE_CORE_CREAM],
    preSolutionSlides: PITH_PRE_SOLUTION_SLIDES,
    get tabBarTop() { return this.frameHeight - 96; },
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
      items: FILTER_ITEMS,
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
      items: FILTER_ITEMS,
    },
    products: MARKET_SKIN_PRODUCTS,
    bannerSlides: [SLIDE_CORE_CREAM, SLIDE_TONER, SLIDE_SUN_ESSENCE],
    preSolutionSlides: PITH_PRE_SOLUTION_SLIDES,
    tabBarTop: 1541,
  },

  ...WIM_SCREENS,
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

/**
 * 실제 백엔드에서 불러온 상품(런타임에 fetch됨)을 등록해 findProductByKey 로
 * 찾을 수 있게 한다. 이 파일의 다른 목록(ALL_KNOWN_PRODUCTS 등)은 모듈 로드
 * 시점에 고정된 더미 데이터라 fetch로 받은 실상품을 담을 수 없어서, 별도
 * 런타임 레지스트리를 둔다. `hooks/useMarketProducts.js`가 상품을 받을 때마다 호출한다.
 */
const dynamicProducts = new Map();

export function registerDynamicProducts(products) {
  for (const p of products) {
    const key = keyOf(p);
    if (key) dynamicProducts.set(key, p);
  }
}

export function findProductByKey(key) {
  if (!key) return null;
  const target = String(key).trim();
  return (
    dynamicProducts.get(target) ||
    ALL_KNOWN_PRODUCTS.find((p) => keyOf(p) === target) ||
    BANNER_PRODUCTS.find((p) => keyOf(p) === target) ||
    null
  );
}
