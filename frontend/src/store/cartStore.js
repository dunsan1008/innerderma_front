import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_CART_ITEMS, INITIAL_CART_SELECTED } from '@/constants/cartItems';

/**
 * 장바구니 상태 (Figma 1026:2397 MY 장바구니).
 *  - items: 담긴 상품 목록(수량·배송방법 포함)
 *  - selectedIds: 선택된 상품 id (구매/선택삭제 대상)
 *
 * 새로고침해도 유지되도록 localStorage 에 저장한다.
 * 추후 백엔드 연동 시 `/api/v1/cart` CRUD 로 교체한다.
 */

/**
 * 저장값이 깨져 있어도 화면이 죽지 않게 형태를 맞춘다.
 * 저장값이 없거나 이상하면 **빈 장바구니**로 떨어진다 — 담은 적 없는 상품이
 * 되살아나지 않도록 더미 목록을 폴백으로 쓰지 않는다.
 */
function normalize(saved) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const items = Array.isArray(s.items) ? s.items.filter((it) => it && typeof it.id === 'string') : [];
  const ids = items.map((it) => it.id);
  const selectedIds = Array.isArray(s.selectedIds)
    ? s.selectedIds.filter((id) => ids.includes(id))
    : ids;
  return { items, selectedIds };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: INITIAL_CART_ITEMS,
      selectedIds: INITIAL_CART_SELECTED,

      /** 개별 선택 토글 */
      toggleSelect: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((v) => v !== id)
            : [...state.selectedIds, id],
        })),

      /** 전체 선택 토글 — 하나라도 선택돼 있으면 전부 해제 */
      toggleSelectAll: () =>
        set((state) => ({
          selectedIds: state.selectedIds.length > 0 ? [] : state.items.map((it) => it.id),
        })),

      /** 수량 변경 (1 미만으로는 내려가지 않는다) */
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, quantity) } : it)),
        })),

      /** 배송방법 변경 */
      setDelivery: (id, delivery) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, delivery } : it)),
        })),

      /** 선택된 상품 전체의 배송방법을 한 번에 바꾼다 */
      setDeliveryForSelected: (delivery) =>
        set((state) => ({
          items: state.items.map((it) =>
            state.selectedIds.includes(it.id) ? { ...it, delivery } : it,
          ),
        })),

      /** 상품 한 개 제거 (X 버튼) */
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
          selectedIds: state.selectedIds.filter((v) => v !== id),
        })),

      /** 선택된 상품 제거 (선택삭제) */
      removeSelected: () =>
        set((state) => ({
          items: state.items.filter((it) => !state.selectedIds.includes(it.id)),
          selectedIds: [],
        })),

      /** 상품 추가 — 이미 있으면 수량만 늘린다 */
      add: (product) =>
        set((state) => {
          const found = state.items.find((it) => it.id === product.id);
          if (found) {
            return {
              items: state.items.map((it) =>
                it.id === product.id ? { ...it, quantity: it.quantity + (product.quantity || 1) } : it,
              ),
            };
          }
          return {
            items: [...state.items, { delivery: '기본', quantity: 1, ...product }],
            selectedIds: [...state.selectedIds, product.id],
          };
        }),

      /** 선택된 상품 합계 금액 */
      selectedTotal: () =>
        get()
          .items.filter((it) => get().selectedIds.includes(it.id))
          .reduce((sum, it) => sum + it.price * it.quantity, 0),

      clear: () => set({ items: [], selectedIds: [] }),
    }),
    {
      name: 'innerderma.cart',
      // v2: 더미 3개로 시작하던 옛 저장값을 버리고 빈 장바구니로 출발한다
      version: 2,
      partialize: (state) => ({ items: state.items, selectedIds: state.selectedIds }),

      /** v1→v2 마이그레이션: 사용자가 담지 않은 더미 상품을 비운다 */
      migrate: () => ({ items: [], selectedIds: [] }),

      merge: (saved, current) => ({ ...current, ...normalize(saved) }),
    },
  ),
);
