/**
 * 상품명 표시 규칙.
 *
 * 마켓 프레임의 상품 카드·배너는 이름 길이가 제품마다 크게 달라
 * 그대로 두면 카드 높이가 들쭉날쭉해지고 태그 줄이 밀려난다.
 * 그래서 **공백 포함 18자**로 자르고, 넘치는 부분은 `…` 한 글자로 대체한다.
 *
 * - 18자 이하: 그대로 출력
 * - 19자 이상: 앞 18자 + `…`
 * - 자를 위치가 공백이면 공백을 떼고 붙인다(" …" 처럼 벌어지지 않게)
 */

/** 공백 포함 최대 글자 수 */
export const NAME_MAX_LENGTH = 18;

/** 줄 배열로 쪼개져 있는 이름을 한 문자열로 되돌린다 */
export function joinNameLines(product) {
  if (!product) return '';
  return product.nameLines ? product.nameLines.join('') : (product.name ?? '');
}

/**
 * @param {string} text 원본 상품명
 * @param {number} [max] 최대 글자 수
 * @returns {string} 18자 이내로 자른 이름 (초과분은 …)
 */
export function truncateProductName(text, max = NAME_MAX_LENGTH) {
  if (typeof text !== 'string') return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trimEnd()}…`;
}

/** 상품 객체에서 바로 표시용 이름을 얻는다 */
export function displayProductName(product, max = NAME_MAX_LENGTH) {
  return truncateProductName(joinNameLines(product), max);
}
