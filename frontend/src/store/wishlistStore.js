import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MARKET_ALL_PRODUCTS } from '@/constants/marketProducts';

/**
 * 찜(하트) 상태.
 * 상품 카드의 하트를 누르면 등록/삭제되고, 마켓-찜 화면은 이 목록만 보여준다.
 * 새로고침해도 유지되도록 localStorage 에 저장한다.
 *
 * 상품 식별자는 Figma 노드 id 가 화면마다 달라 이름으로 잡는다.
 * (같은 제품이 마켓 1·2·3 에 각각 다른 노드로 존재하므로 이름이 더 안정적이다)
 * 추후 백엔드 연동 시 productId 로 바꾸고 api/market.js 의 toggleWishlist 를 호출한다.
 */

/** 상품 키 — 이름 기준 (여러 줄 이름은 합쳐서 비교) */
export function productKey(product) {
  return product.nameLines ? product.nameLines.join('').trim() : product.name;
}

/** Figma 디자인에서 하트가 채워져 있던(=이미 찜한) 상품을 초기값으로 쓴다 */
const INITIAL_KEYS = MARKET_ALL_PRODUCTS.filter((p) => p.wishedInDesign ?? false).map(productKey);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      /** 찜한 상품 키 목록 */
      keys: INITIAL_KEYS,

      has: (product) => get().keys.includes(productKey(product)),

      toggle: (product) =>
        set((state) => {
          const key = productKey(product);
          return {
            keys: state.keys.includes(key) ? state.keys.filter((k) => k !== key) : [...state.keys, key],
          };
        }),

      /** 찜 목록에서 여러 개 한 번에 제거 (선택삭제) */
      removeMany: (products) =>
        set((state) => {
          const targets = products.map(productKey);
          return { keys: state.keys.filter((k) => !targets.includes(k)) };
        }),

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
