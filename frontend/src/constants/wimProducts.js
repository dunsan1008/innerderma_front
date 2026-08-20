import wimBanner from '@/assets/figma/products/wim-banner.jpg';
import wim1 from '@/assets/figma/products/wim-1.jpg';
import wim2 from '@/assets/figma/products/wim-2.jpg';
import wim3 from '@/assets/figma/products/wim-3.jpg';
import wim4 from '@/assets/figma/products/wim-4.jpg';
import wim5 from '@/assets/figma/products/wim-5.jpg';
import wim6 from '@/assets/figma/products/wim-6.jpg';
import { CARD_IMAGE_BLEED, CARD_SIZES, buildSlots } from '@/constants/cardLayout';
import { matchesSkinStateCategory } from '@/lib/skinStateCategory';

/**
 * 윔 스토어 상품 (Figma 마켓 4 / 1117:1689).
 *
 * 상품 정보(이름·가격·태그·이미지)는 마켓 4 실측 그대로 쓰지만
 * **좌표와 카드 규격은 마켓 1 기준으로 통일**한다.
 * 마켓 4 는 카드가 173x256.5 / 2열 그리드로 따로 그려져 있어 그대로 옮기면
 * 피쓰 서울 탭과 카드 크기·간격이 달라 보인다. 그래서 피쓰 서울과 같은
 * CARD_SLOTS / CARD_IMAGE_BLEED / CARD_SIZES 를 공유한다.
 *
 * 이미지는 마켓 4 의 각 카드 이미지 프레임을 2배 해상도로 내보낸 것이다(332x286).
 *
 * 추후 백엔드 연동 시 `GET /api/v1/wim-store/products` 응답으로 교체한다.
 */

/**
 * 이미지 레이어 — 피쓰 서울 카드와 같은 bleed 규격을 쓴다.
 *
 * 예전에는 `box: [0, 0, 166, 143]` 으로 카드 슬롯에 정확히 맞췄는데, 그러면
 *  - 카드의 `pt-20` 때문에 사진 위에 흰 여백 20px 이 남고
 *  - 폭이 166 이라 카드(167) 우측에 1px 이 비고
 *  - 사진이 슬롯을 꽉 채워 제품이 프레임 가장자리에 닿아 "정사각형으로 잘린" 것처럼 보였다.
 * 피쓰 카드는 박스를 카드보다 크게 잡고 음수 오프셋으로 얹어 상단·좌우를 채운다.
 * 그 규격(CARD_IMAGE_BLEED)을 그대로 공유해 두 스토어의 사진이 같은 밀도로 보이게 한다.
 */
const layersOf = (src) => [{ box: CARD_IMAGE_BLEED, srcs: [src] }];

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
    tags: ['피부보호', '수부지', '저탄수'],
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
    tags: ['피부보호', '수부지', '저탄수'],
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

/**
 * 한글 태그 → 백엔드 `skinStateTags` enum.
 *
 * 카테고리 탭을 가르는 기준을 정해야 했는데, 태그를 그대로 쓸 수 없었다.
 * `수부지` 태그는 **6개 상품 전부**가 갖고 있어 정보량이 0 이다(그 태그로 나누면
 * 수부지 탭 = 전체 탭이 되어 탭이 있는 의미가 없다). `저자극 인증` 도 판정에서
 * 뺐다 — 원료·제조 인증 표기라 피부 상태가 아니고, 4/6 에 붙어 있어 이것까지
 * STABLE 로 보면 피부탄력 탭이 전체와 같아진다.
 *
 * 그래서 **피부 기능을 가리키는 태그만** 백엔드 enum 으로 옮겨 `skinStates` 를
 * 만들고, 실상품과 똑같은 판정(`matchesSkinStateCategory`)으로 탭을 나눈다.
 * 이렇게 두면 `/products` 가 붙어 실제 `skinStateTags` 가 내려올 때 더미와
 * 같은 규칙으로 갈라지므로 탭 내용이 갑자기 달라지지 않는다.
 *
 *  - 피부보호·피부재생 → BARRIER_RECOVERY (장벽을 지키고 되돌리는 축)
 *  - 지방재생·저탄수   → HYDRATION (유·수분 균형 = 수분부족형 지성의 축)
 */
const SKIN_STATE_BY_TAG = {
  피부보호: 'BARRIER_RECOVERY',
  피부재생: 'BARRIER_RECOVERY',
  지방재생: 'HYDRATION',
  저탄수: 'HYDRATION',
};

const skinStatesOf = (item) => [
  ...new Set(item.tags.map((tag) => SKIN_STATE_BY_TAG[tag]).filter(Boolean)),
];

/**
 * 카드 배열로 변환. 좌표는 상품 수에 맞춰 `buildSlots` 로 다시 잡는다 —
 * 카테고리별로 상품 수가 달라지므로 6칸 고정(CARD_SLOTS)을 쓰면 3개짜리 탭에서
 * 빈 자리가 남거나 프레임 높이가 어긋난다. 6개까지는 CARD_SLOTS 와 같은 값이다.
 */
const toCards = (items) => {
  const slots = buildSlots(items.length);
  return items.map((item, i) => ({
    nodeId: item.nodeId,
    left: slots[i].left,
    top: slots[i].top,
    layers: layersOf(item.image),
    name: item.name,
    price: item.price,
    tags: item.tags,
    sizes: CARD_SIZES,
  }));
};

const itemsOf = (category) =>
  ITEMS.filter((item) => matchesSkinStateCategory(skinStatesOf(item), category));

const OILY_ITEMS = itemsOf('oily');
const SKIN_ITEMS = itemsOf('skin');

/**
 * 전체 탭 — 6개 전부. "전체 탭에는 말 그대로 모든 제품이 드러나야 한다"는 규칙을 지킨다.
 * 카테고리 탭은 그 부분집합이고, 두 카테고리에 걸치는 상품(피부보호 + 저탄수)은
 * 양쪽에 다 나온다 — 실상품도 `skinStateTags` 를 여러 개 갖고 있으면 그렇게 동작한다.
 *
 * 현재 갈림: 수부지 3개(스위치·검은콩·말차) / 피부탄력 5개(비포밀·스위치·말차·도시락·초코)
 */
export const WIM_PRODUCTS = toCards(ITEMS);
export const WIM_OILY_PRODUCTS = toCards(OILY_ITEMS);
export const WIM_SKIN_PRODUCTS = toCards(SKIN_ITEMS);

/** 추천 배너 (Figma 1104:1409 / 1104:1411) — 좌표는 마켓 1 배너와 동일 */
export const WIM_BANNER_SLIDE = {
  image: wimBanner,
  name: '저당, 저탄수, 고단백 윔쉐이크 초코 대용량 800g',
  price: '56,000원',
  tags: ['피부재생', '수부지', '저자극 인증'],
};

/**
 * 윔 스토어 추천 배너 슬라이드 3장.
 *
 * Figma 마켓 4 에는 배너가 한 장뿐이라 자동 전환이 멈춰 화면이 정적이었다.
 * 피쓰 서울(3장 자동 전환)과 같은 리듬을 주려고 아래 진열 상품에서 두 개를
 * 가져와 붙였다. 상품 정보는 ITEMS 를 그대로 참조하므로 배너를 눌러 들어간
 * 상세와 카드의 찜 상태가 어긋나지 않는다.
 */
const slideOf = (nodeId) => {
  const item = ITEMS.find((it) => it.nodeId === nodeId);
  return { image: item.image, name: item.name, price: item.price, tags: item.tags };
};

export const WIM_BANNER_SLIDES = [
  WIM_BANNER_SLIDE,
  slideOf('1104:1508'), // 윔쉐이크 검은콩 대용량 800g
  slideOf('1104:1533'), // 윔쉐이크 말차 420g
];

/**
 * 촬영·자가진단 **이전**에 보여주는 추천 배너 (윔 스토어).
 * 오프라인 정밀진단·시술 데이터만으로 추천하는 단계라 촬영 후 배너와 다른 상품을 쓴다.
 */
export const WIM_PRE_SOLUTION_SLIDE = {
  image: wim1,
  name: '[내과전문의 설계] 마시는 식이섬유 비포밀 (30포/BOX)',
  price: '34,000원',
  tags: ['시술케어', '장내환경', '정밀진단'],
};

/**
 * 촬영 전 윔 스토어 배너 슬라이드 2장.
 *
 * 피쓰 서울 촬영 전 배너(PITH_PRE_SOLUTION_SLIDES)가 2장인 것처럼 윔도 2장으로 맞춘다.
 * 두 번째 슬라이드는 ITEMS 에 있는 스위치 제품을 가져와 찜·상세 연동이 유지되게 했다.
 */
export const WIM_PRE_SOLUTION_SLIDES = [
  WIM_PRE_SOLUTION_SLIDE,
  slideOf('1104:1483'), // 마시는 식이섬유 비포밀 스위치 (30포/BOX)
];

/**
 * 카테고리 탭(수부지 · 피부탄력)의 추천 배너.
 *
 * 그 탭에 실제로 진열된 상품에서만 뽑는다 — 배너를 눌러 들어간 상세가 탭 목록에
 * 없는 상품이면 추천 근거가 어긋나 보인다. 최대 3장으로 피쓰 서울과 같은 리듬을 맞춘다.
 *
 * 피부탄력은 목록을 **뒤에서부터** 가져온다. 앞에서부터 자르면 첫 장이 촬영 전
 * 배너(비포밀)와 같은 상품이 되어 촬영 전/후 배너가 구분되지 않는다.
 */
const slidesOf = (items) =>
  items.slice(0, 3).map((item) => ({
    image: item.image,
    name: item.name,
    price: item.price,
    tags: item.tags,
  }));

export const WIM_OILY_BANNER_SLIDES = slidesOf(OILY_ITEMS);
export const WIM_SKIN_BANNER_SLIDES = slidesOf([...SKIN_ITEMS].reverse());
