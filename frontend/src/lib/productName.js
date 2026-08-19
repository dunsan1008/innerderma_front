/**
 * 상품명 표시 규칙.
 *
 * 마켓 카드·배너는 상품마다 이름 길이가 크게 달라 그대로 두면 카드 높이가
 * 들쭉날쭉해지고 태그 줄이 밀려난다. 그래서 **두 줄까지만 보여주고 넘치는 부분은
 * `…` 으로 잘라낸다.**
 *
 * 글자 수로 자르지 않는다. 같은 글자 수라도 한글·영문·숫자·괄호의 실제 폭이 달라
 * 어떤 이름은 두 줄이 채 안 차는데 잘리고 어떤 이름은 세 줄로 넘쳤다.
 * 실제 줄 수는 브라우저가 렌더링해 봐야 알 수 있으므로 CSS `line-clamp: 2` 에 맡긴다.
 * (`clampLines` 헬퍼가 그 스타일을 만들어 준다)
 *
 * 그래서 이 파일의 함수는 이름을 **자르지 않고 합치기만** 한다.
 */

/** 카드·배너 이름에 허용하는 줄 수 */
export const NAME_MAX_LINES = 2;

/** 줄 배열로 쪼개져 있는 이름을 한 문자열로 되돌린다 */
export function joinNameLines(product) {
  if (!product) return '';
  const raw = product.nameLines ? product.nameLines.join('') : (product.name ?? '');
  // Figma 에서 줄을 손으로 쪼개며 생긴 이중 공백을 정리한다
  return raw.replace(/\s+/g, ' ').trim();
}

/** 상품 객체에서 표시용 이름을 얻는다 (자르지 않는다 — 줄 수 제한은 CSS 가 한다) */
export function displayProductName(product) {
  return joinNameLines(product);
}

/**
 * `line-clamp` 스타일 객체.
 * 지정한 줄 수를 넘으면 마지막 줄 끝에 `…` 이 붙는다.
 *
 * @param {number} [lines] 허용 줄 수
 */
export function clampLines(lines = NAME_MAX_LINES) {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
  };
}
