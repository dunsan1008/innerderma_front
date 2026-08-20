import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addToWishlist, removeFromWishlist } from '@/api/wishlist';
import { useAuthStore } from '@/store/authStore';

/**
 * 찜(하트) 상태.
 * 상품 카드의 하트를 누르면 등록/삭제되고, 마켓-찜 화면은 이 목록만 보여준다.
 * 새로고침해도 유지되도록 localStorage 에 저장한다.
 *
 * **초기값은 항상 비어 있다.** Figma 시안에는 하트가 채워진 카드가 있지만,
 * 사용자가 직접 누르지 않은 상품이 찜 목록에 들어 있으면 담은 적 없는 항목이
 * 있는 것처럼 보인다. 그래서 시안의 채워진 하트는 재현하지 않는다.
 *
 * 상품 식별자는 Figma 노드 id 가 화면마다 달라 이름으로 잡는다.
 * (같은 제품이 마켓 1·2·3 에 각각 다른 노드로 존재하므로 이름이 더 안정적이다)
 * 피쓰 서울·윔 스토어 상품이 같은 목록에 섞이므로 이름이 스토어를 가로질러 유일해야 한다.
 *
 * 로컬 상태(keys)가 항상 즉시 UI를 반영하는 진실 소스다. 상품에 productCode/source가
 * 있으면(= 실제 백엔드 상품, hooks/useMarketProducts.js가 붙여준다) 백그라운드로
 * 서버에도 반영한다 — 실패해도 로컬 상태는 그대로 두고 콘솔에만 남긴다(대회 시연 중
 * 흐름이 끊기지 않게). 더미 상품(productCode 없음)은 예전처럼 로컬 전용으로 동작한다.
 * 앱 시작 시 서버 찜 목록을 가져와 로컬과 합치는 건 아직 안 함(다음 과제).
 */
function syncToggle(product, nowWished) {
  const userCode = useAuthStore.getState().userCode;
  if (!userCode || !product.productCode || !product.source) return;
  const call = nowWished
    ? addToWishlist(userCode, { productId: product.productCode, productSource: product.source })
    : removeFromWishlist(userCode, product.productCode);
  call.catch((err) => console.error('[wishlistStore] sync failed', err));
}

/** 상품 키 — 이름 기준 (여러 줄 이름은 합쳐서 비교) */
export function productKey(product) {
  return product.nameLines ? product.nameLines.join('').trim() : product.name;
}

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      /** 찜한 상품 키 목록 — 최초 접속 시 비어 있다 */
      keys: [],

      has: (product) => get().keys.includes(productKey(product)),

      toggle: (product) => {
        const key = productKey(product);
        const nowWished = !get().keys.includes(key);
        set((state) => ({
          keys: nowWished ? [...state.keys, key] : state.keys.filter((k) => k !== key),
        }));
        syncToggle(product, nowWished);
      },

      /** 찜 목록에서 여러 개 한 번에 제거 (선택삭제) */
      removeMany: (products) => {
        const targets = products.map(productKey);
        set((state) => ({ keys: state.keys.filter((k) => !targets.includes(k)) }));
        for (const product of products) syncToggle(product, false);
      },

      clear: () => set({ keys: [] }),
    }),
    {
      name: 'innerderma.wishlist',
      version: 2, // v2: 모든 상품이 기본 미찜 상태로 출발한다 (이전 저장값은 무시)
      partialize: (state) => ({ keys: state.keys }),

      /** v1→v2 마이그레이션: 옛 찜 목록을 비운다 */
      migrate: () => ({ keys: [] }),

      /** 저장값이 깨져 있어도(배열이 아님) 화면이 죽지 않게 한다 */
      merge: (saved, current) => ({
        ...current,
        keys: Array.isArray(saved?.keys) ? saved.keys.filter((k) => typeof k === 'string') : current.keys,
      }),
    },
  ),
);
