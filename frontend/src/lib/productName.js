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

/**
 * 디센더 여유 (px).
 *
 * `g` `y` `p` `q` `j` `340g` 처럼 베이스라인 아래로 내려가는 글자는 자기 **줄 박스보다
 * 아래까지 잉크가 뻗는다.** 이 프로젝트는 Figma 실측대로 line-height 를 글자 크기에
 * 가깝게(예: 16px 글자에 16.5px 줄간격) 잡아 두었기 때문에 그 삐져나옴이 특히 크다.
 * 배너 상품명에서는 2.7px 가량 넘친다.
 *
 * 여기에 `overflow: hidden`(line-clamp 에 필수) 이 겹치면 넘친 잉크가 그대로 잘린다.
 * 그래서 클립 박스에 padding-bottom 을 줘서 **자르는 선만 아래로 내리고**,
 * 같은 크기의 음수 margin-bottom 으로 주변 레이아웃은 원래대로 유지한다.
 * (line-height 를 키우면 글자 위치가 밀려 시안과 어긋난다)
 */
const DESCENDER_ROOM = 4;

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
 * padding/margin 한 쌍은 디센더가 잘리지 않게 자르는 선만 내리는 장치다
 * (DESCENDER_ROOM 주석 참고). 차지하는 높이는 그대로다.
 *
 * @param {number} [lines] 허용 줄 수
 */
export function clampLines(lines = NAME_MAX_LINES) {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
    paddingBottom: DESCENDER_ROOM,
    marginBottom: -DESCENDER_ROOM,
  };
}
