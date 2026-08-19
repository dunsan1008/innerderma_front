/**
 * 마켓 상품 카드의 공통 레이아웃 규격.
 *
 * 피쓰 서울 마켓 1(전체) / 2(수부지) / 3(피부탄력) 과 윔 스토어는 Figma 에서 각각
 * 따로 그려져 있어 카드 좌표·이미지 박스·본문 높이가 화면마다 조금씩 달랐다.
 * (좌열 x 가 17~22 로 흔들리고, 이미지가 어떤 카드는 카드 상단까지 차고 어떤 카드는
 * 위에 흰 여백이 남고, 이름 박스 높이가 카드마다 달라 태그 줄이 밀렸다)
 *
 * 그래서 **마켓 1(전체) 프레임을 기준**으로 아래 세 값을 뽑아 네 화면이 공유한다.
 */

/** 카드 실측 크기 (Figma PostCard) */
export const CARD_WIDTH = 167;
/** 카드 안 이미지 슬롯 높이 */
export const CARD_IMAGE_HEIGHT = 143;
/** 카드 상단 패딩 — 이미지가 이 위로 올라가야 카드 상단까지 채워진다 */
export const CARD_PADDING_TOP = 20;

/**
 * 이미지 레이어 박스 `[left, top, width, height]`.
 *
 * 마켓 1 에서 가장 많이 쓰인 박스(≈189x163, 좌우로 카드 밖까지 넘김)를 기준으로 삼았다.
 *  - `top: -20` → 카드 `pt-20` 을 밀고 올라가 카드 상단 라운드까지 사진이 닿는다
 *  - `width: 189` (카드 167 보다 22 넓게, 좌측 -11) → 좌우 여백 없이 꽉 차고 살짝 확대된다
 *  - `height: 163` → 카드 상단부터 이미지 슬롯 끝까지 채운다
 *
 * 이 박스 안에서 사진은 `object-cover` 로 채워지므로 원본 비율이 정사각(피쓰)이든
 * 가로형(윔)이든 같은 밀도로 보인다.
 */
export const CARD_IMAGE_BLEED = [-11, -CARD_PADDING_TOP, 189, CARD_IMAGE_HEIGHT + CARD_PADDING_TOP];

/**
 * 카드 본문(이름·가격·태그) 규격.
 * 이름은 두 줄까지 허용하고 넘치면 `…` 으로 잘리므로(lib/productName.js) 높이가 항상 같다.
 * 덕분에 이름 길이가 달라도 가격·태그 줄이 밀리지 않는다.
 */
export const CARD_SIZES = {
  nameSize: 12,
  /** 줄간격 16.5 × 두 줄 = 33 */
  nameLeading: 16.5,
  nameHeight: 33,
  priceSize: 14,
  /** 가격 줄 높이 — 이름과 태그 사이 간격까지 겸한다 */
  priceBox: 22,
  tagBox: 29,
};


/** 2열 6칸 배치 — 마켓 1 Group 54 기준으로 좌열/우열을 정렬했다 */
export const CARD_SLOTS = [
  { left: 20, top: 670 },
  { left: 204, top: 670 },
  { left: 20, top: 964 },
  { left: 204, top: 964 },
  { left: 20, top: 1258 },
  { left: 204, top: 1258 },
];

/** 2열 격자 좌표 */
const COL_LEFT = [20, 204];
const FIRST_ROW_TOP = 670;
const ROW_GAP = 294;

/**
 * 상품 개수에 맞춰 2열 격자 좌표를 생성한다.
 * 6개까지는 CARD_SLOTS 과 동일하고, 7개 이상이면 행이 늘어난다.
 *
 * @param {number} count 상품 수
 * @returns {{ left: number, top: number }[]}
 */
export function buildSlots(count) {
  return Array.from({ length: count }, (_, i) => ({
    left: COL_LEFT[i % 2],
    top: FIRST_ROW_TOP + Math.floor(i / 2) * ROW_GAP,
  }));
}
