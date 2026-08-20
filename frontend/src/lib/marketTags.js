/**
 * 더미 상품 카탈로그(marketProducts.js/wimProducts.js/productDetail.js/marketScreens.js)의
 * 태그는 한국어 문자열이 그대로 데이터 값이다. 표시 시점에 현재 언어 사전
 * (`i18n/*.js`의 `marketTagLabels`)에서 그 값을 찾아 번역된 라벨로 바꾼다.
 * 사전에 없는 값(예상 밖의 태그)은 원문을 그대로 보여준다.
 */
export function translateTag(tag, t) {
  return t.marketTagLabels?.[tag] ?? tag;
}
