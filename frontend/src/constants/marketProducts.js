import img15 from '@/assets/figma/products/img-15.jpg';
import img16 from '@/assets/figma/products/img-16.jpg';
import img17 from '@/assets/figma/products/img-17.jpg';
import img19 from '@/assets/figma/products/img-19.jpg';
import img20 from '@/assets/figma/products/img-20.jpg';
import img21 from '@/assets/figma/products/img-21.jpg';
import m215 from '@/assets/figma/products/m2-15.jpg';
import m216 from '@/assets/figma/products/m2-16.jpg';
import m217 from '@/assets/figma/products/m2-17.jpg';
import m218 from '@/assets/figma/products/m2-18.jpg';
import m219 from '@/assets/figma/products/m2-19.jpg';
import m220 from '@/assets/figma/products/m2-20.jpg';
import m315 from '@/assets/figma/products/m3-15.jpg';
import m316 from '@/assets/figma/products/m3-16.jpg';
import m317 from '@/assets/figma/products/m3-17.jpg';
import m320 from '@/assets/figma/products/m3-20.jpg';
import m321 from '@/assets/figma/products/m3-21.jpg';
import m322 from '@/assets/figma/products/m3-22.jpg';
import { CARD_IMAGE_BLEED, CARD_SIZES, CARD_SLOTS, buildSlots } from '@/constants/cardLayout';

/**
 * 마켓 상품 카드 데이터.
 *
 * 상품 정보(이름·가격·태그·이미지)는 Figma 실측 그대로지만, **레이아웃은
 * 마켓 1(전체) 기준으로 통일**한다. Figma 는 화면마다 카드 좌표가 1~5px 씩 흔들리고
 * (좌열 x 가 17/18/19/20/21/22, 우열이 202~217 로 제각각) 카드별 사진 크롭 박스와
 * 빈 Paragraph 높이도 달라서, 그대로 옮기면 같은 마켓인데 탭마다 격자가 어긋나 보였다.
 * 좌표는 CARD_SLOTS, 사진은 CARD_IMAGE_BLEED, 본문은 CARD_SIZES 를 공유한다.
 *
 * 카드는 **격자 순서(좌→우, 위→아래)** 로 나열한다. Figma 의 레이어 순서는
 * 화면마다 뒤죽박죽이어서 좌표 대신 순서로 슬롯을 정한다.
 *
 * Figma 에서 사진을 두 겹으로 쌓아 둔 카드가 몇 개 있는데(예: 마켓 1 의 870:5004),
 * 위에 얹힌 사진만 실제로 보이므로 그 **마지막 이미지**를 카드 사진으로 쓴다.
 *
 * 추후 백엔드 연동 시 상품 정보는 API 응답으로 바꾸고 레이아웃 값은 그대로 둔다.
 */

/** 상품 정보 + 격자 순서 → 공통 레이아웃이 적용된 카드 데이터 */
const toCards = (items) =>
  items.map((item, i) => ({
    nodeId: item.nodeId,
    left: CARD_SLOTS[i].left,
    top: CARD_SLOTS[i].top,
    layers: [{ box: CARD_IMAGE_BLEED, srcs: [item.src] }],
    ...(item.nameLines ? { nameLines: item.nameLines } : { name: item.name }),
    price: item.price,
    tags: item.tags,
    sizes: CARD_SIZES,
  }));

/** 마켓 1 (사후관리-전체) Group 54 — 6개 카드 */
export const MARKET_ALL_PRODUCTS = toCards([
  {
    nodeId: '870:4951',
    src: img15,
    name: '피쓰 코어 리빌드 크림 50ml',
    price: '54,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
  },
  {
    nodeId: '870:4986',
    src: img17,
    name: 'NaDC 크림 (#120도크림)',
    price: '43,000원',
    tags: ['지방파괴', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5040',
    src: img19,
    name: '클리바 르 클레어 크렘 50ml',
    price: '48,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
  },
  {
    nodeId: '870:5004',
    src: img20,
    name: '피쓰 판테티놀 선 에센스 30ml',
    price: '36,000원',
    tags: ['피부재생', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:4968',
    src: img16,
    nameLines: ['하이알차저™ 온리 ', '(#일자형 고분자 히알루론산)'],
    price: '27,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5022',
    src: img21,
    nameLines: ['닥터펩티 센텔라 모이스트 ', '수딩 젤 크림 EX 70ml'],
    price: '31,000원',
    tags: ['미백개선', '주름개선', '수부지'],
  },
]);

/* ------------------------------------------------------------------ */
/* 마켓 2 (사후관리-수부지) Group 53 870:5391 — 6개 카드                  */
/* ------------------------------------------------------------------ */

export const MARKET_OILY_PRODUCTS = toCards([
  {
    nodeId: '870:5445',
    src: m218,
    name: '큐리페어 더마 앰플',
    price: '47,600원',
    tags: ['피부재생', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5409',
    src: m216,
    nameLines: ['하이알차저™ 온리 ', '(#일자형 고분자 히알루론산)'],
    price: '27,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5392',
    src: m215,
    nameLines: ['닥터펩티 펩타이드 볼륨 ', '에센스 2.0 100ml'],
    price: '41,000원',
    tags: ['피부재생', '피부탄력', '수부지'],
  },
  {
    nodeId: '870:5426',
    src: m217,
    name: '피쓰 블루 리페어 솔루션 1매',
    price: '18,000원',
    tags: ['피부재생', '수부지', '건성'],
  },
  {
    nodeId: '870:5482',
    src: m220,
    name: '피쓰 코어 리빌드 크림 50ml',
    price: '54,000원',
    tags: ['피부재생', '수부지', '피부과전용'],
  },
  {
    /** Figma 에 같은 이름·다른 가격으로 그려진 카드 (시안 그대로 유지) */
    nodeId: '870:5463',
    src: m219,
    name: '피쓰 코어 리빌드 크림 50ml (수부지 패키지)',
    price: '33,600원',
    tags: ['지방파괴', '수부지', '피부탄력'],
  },
]);

/* ------------------------------------------------------------------ */
/* 마켓 3 (사후관리-피부) Group 55 870:5229 + Frame 80 870:5371 — 6개    */
/* ------------------------------------------------------------------ */

export const MARKET_SKIN_PRODUCTS = toCards([
  {
    nodeId: '870:5285',
    src: m320,
    name: '피쓰 판테티놀 선 에센스 30ml',
    price: '34,000원',
    tags: ['피부재생', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5230',
    src: m315,
    name: '하이니컬 딥프팅 앰플',
    price: '29,900원',
    tags: ['피부보습', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5303',
    src: m321,
    name: 'NaDC 크림 (#120도크림)',
    price: '43,000원',
    tags: ['지방파괴', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5248',
    src: m316,
    name: '[대용량 80ml] 칼슘 본딩 세럼',
    price: '29,800원',
    tags: ['피부보습', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5266',
    src: m317,
    nameLines: ['[대용량 100ml] 칼슘 본딩 ', '페이셜 크림'],
    price: '54,000원',
    tags: ['피부보습', '수부지', '피부탄력'],
  },
  {
    nodeId: '870:5373',
    src: m322,
    nameLines: ['닥터펩티 펩타이드 볼륨 ', '에센스 2.0 100ml'],
    price: '41,000원',
    tags: ['피부재생', '피부탄력', '수부지'],
  },
]);

/**
 * 피쓰 서울 '전체' 탭 — 수부지·피부탄력 제품을 모두 포함한다.
 * 이름이 같은 제품은 첫 등장만 남기고 중복 제거한다(찜 키가 이름이라 겹치면 안 된다).
 * 격자 좌표는 상품 수에 따라 동적으로 생성한다.
 */
const allRaw = [...MARKET_ALL_PRODUCTS, ...MARKET_OILY_PRODUCTS, ...MARKET_SKIN_PRODUCTS];
const seenNames = new Set();
const uniqueProducts = allRaw.filter((p) => {
  const key = p.nameLines ? p.nameLines.join('').trim() : p.name;
  if (seenNames.has(key)) return false;
  seenNames.add(key);
  return true;
});
const allSlots = buildSlots(uniqueProducts.length);
export const MARKET_ALL_COMBINED = uniqueProducts.map((p, i) => ({
  ...p,
  left: allSlots[i].left,
  top: allSlots[i].top,
}));

/**
 * 솔루션 화면 하단 "오늘의 솔루션과 어울리는 제품 추천" 4칸
 * (Figma 833:3029 의 Group 85 / Frame 88).
 *
 * Figma 는 피쓰 서울 제품 2개 + 윔 스토어 제품 2개를 섞어 놓았다.
 * 마켓 목록에 이미 있는 상품을 그대로 참조해야 찜 상태가 목록·상세와 함께 움직인다.
 * (좌표는 RoutineScreen 이 그리드에 맞춰 덮어쓴다)
 *
 * 추후 백엔드 연동 시 `GET /api/v1/care/{date}/recommendations` 응답으로 교체한다.
 */
export const SOLUTION_RECOMMEND_NAMES = [
  '피쓰 코어 리빌드 크림 50ml',
  'NaDC 크림 (#120도크림)',
  '저당, 저탄수, 고단백 윔쉐이크 말차 420g',
  '[내과전문의 설계] 마시는 식이섬유 비포밀 스위치 (30포/BOX)',
];
