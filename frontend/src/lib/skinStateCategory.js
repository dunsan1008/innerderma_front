/**
 * 마켓 카테고리 탭(전체 / 수부지 / 피부탄력) ↔ 백엔드 `skinStateTags` 대응.
 *
 * 백엔드 `/products` 에는 "수부지"·"피부탄력" 이라는 카테고리가 없다. 상품마다
 * `skinStateTags`(HYDRATION / BARRIER_RECOVERY / STABLE / ...) 만 달려 오므로
 * 탭 필터를 클라이언트에서 흉내낸다. 대응 기준은 백엔드팀 확인값이다.
 *  - 수부지(oily)   : HYDRATION 포함
 *  - 피부탄력(skin) : BARRIER_RECOVERY 또는 STABLE 포함
 *  - 전체(all)      : 필터 없음
 *
 * 이 판정을 **한 곳에만** 두는 이유: 실상품(`hooks/useMarketProducts.js`)과
 * 더미 카탈로그(`constants/wimProducts.js`)가 같은 규칙으로 갈라져야 백엔드가
 * 붙는 순간 탭 내용이 어긋나지 않는다. 예전에는 실상품 쪽에만 규칙이 있어
 * 더미는 카테고리 개념이 아예 없었다.
 *
 * @param {string[]} skinStateTags
 * @param {'all'|'oily'|'skin'} category
 */
export function matchesSkinStateCategory(skinStateTags, category) {
  const tags = skinStateTags || [];
  if (category === 'oily') return tags.includes('HYDRATION');
  if (category === 'skin') return tags.includes('BARRIER_RECOVERY') || tags.includes('STABLE');
  return true;
}
