import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '@/api/market';
import { CARD_IMAGE_BLEED, CARD_SIZES, buildSlots } from '@/constants/cardLayout';
import { registerDynamicProducts } from '@/constants/marketScreens';
import { matchesSkinStateCategory } from '@/lib/skinStateCategory';

const SOURCE_BY_STORE = { pith: 'PIECE_SEOUL', wim: 'WIM_STORE' };

/** 백엔드 skinStateTags(enum) → 화면에 보여줄 한글 태그 */
const TAG_LABELS = {
  HYDRATION: '수분 공급',
  BARRIER_RECOVERY: '장벽 회복',
  IRRITATION: '자극 진정',
  STABLE: '피부 안정',
  REDNESS: '홍조 케어',
  SWELLING: '붓기 케어',
  PIGMENTATION: '미백',
  ACNE: '트러블 케어',
  SEBUM: '피지 케어',
};

export function toCardTags(product) {
  return (product.skinStateTags || []).slice(0, 3).map((tag) => TAG_LABELS[tag] || tag);
}

export function formatPrice(price) {
  if (typeof price !== 'number') return price ?? '';
  return `${price.toLocaleString('ko-KR')}원`;
}

/** ProductResponse → PostCard/FeaturedBanner 가 그대로 쓸 수 있는 카드 모양으로 변환 */
export function toCardProduct(product, slot) {
  return {
    nodeId: product.productCode,
    productCode: product.productCode,
    source: product.source,
    left: slot?.left,
    top: slot?.top,
    layers: [{ box: CARD_IMAGE_BLEED, srcs: product.imageUrl ? [product.imageUrl] : [] }],
    name: product.name,
    price: formatPrice(product.price),
    tags: toCardTags(product),
    sizes: CARD_SIZES,
  };
}

/**
 * 스토어(피쓰 서울/윔 스토어)의 실제 상품 목록을 가져와 카테고리 탭으로 거르고
 * 화면이 바로 쓸 수 있는 카드 배열로 변환한다.
 *
 * 세션이 없거나, 요청이 실패하거나, 그 스토어에 상품이 하나도 없으면 `products`가
 * `null`로 남는다 — 화면단에서 기존 더미 카탈로그로 자연스럽게 폴백하는 걸 전제로 한다
 * (RoutineScreen의 useCareSolution과 같은 패턴).
 *
 * @param {'pith'|'wim'} store
 * @param {'all'|'oily'|'skin'} category 두 스토어 모두 같은 세 카테고리를 갖는다.
 *   판정은 `lib/skinStateCategory.js` 한 곳에 있고, 더미 카탈로그(wimProducts.js)도
 *   같은 규칙으로 갈라 놨다 — 실상품으로 바뀌는 순간 탭 내용이 어긋나지 않게.
 */
export function useMarketProducts(store, category) {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ source: SOURCE_BY_STORE[store] })
      .then((data) => {
        if (!cancelled) setRaw(Array.isArray(data) && data.length ? data : null);
      })
      .catch((err) => {
        console.error('[useMarketProducts] fetch failed', err);
        if (!cancelled) setRaw(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const filtered = useMemo(() => {
    if (!raw) return null;
    /* 스토어 구분 없이 같은 판정을 쓴다 — 예전엔 윔만 필터를 건너뛰어(전체 탭만 있었다)
       윔 카테고리 탭이 생기면 전체와 같은 목록이 나왔다 */
    const list = raw.filter((p) => matchesSkinStateCategory(p.skinStateTags, category));
    return list.length ? list : null;
  }, [raw, category]);

  const cards = useMemo(() => {
    if (!filtered) return null;
    const slots = buildSlots(filtered.length);
    return filtered.map((p, i) => toCardProduct(p, slots[i]));
  }, [filtered]);

  /** 상세·찜 화면이 이름으로 다시 찾을 수 있도록 등록 (findProductByKey 참고) */
  useEffect(() => {
    if (cards?.length) registerDynamicProducts(cards);
  }, [cards]);

  /** 마지막 카드 top + 카드 높이(272) + 하단 여백(107) — constants/marketScreens.js의 동적 높이 공식과 동일 */
  const frameContentHeight = cards ? cards[cards.length - 1].top + 272 + 107 : null;

  return { products: cards, frameContentHeight, loading };
}
