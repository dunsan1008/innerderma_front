import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_CART_ITEMS, INITIAL_CART_SELECTED } from '@/constants/cartItems';
import { addToCart, removeFromCart, updateCartQuantity } from '@/api/cart';
import { useAuthStore } from '@/store/authStore';

/**
 * 장바구니 상태 (Figma 1026:2397 MY 장바구니).
 *  - items: 담긴 상품 목록(수량·배송방법 포함)
 *  - selectedIds: 선택된 상품 id (구매/선택삭제 대상)
 *
 * 새로고침해도 유지되도록 localStorage 에 저장한다.
 *
 * 로컬 상태가 항상 즉시 UI를 반영하는 진실 소스다. 담기는 상품에 productCode/source가
 * 있으면(실제 백엔드 상품 — ProductDetailScreen이 붙여준다) 백그라운드로 서버 장바구니에도
 * 반영한다(추가/수량변경/삭제). 실패해도 로컬 상태는 그대로 둔다(대회 시연 흐름 유지).
 * 더미 상품(productCode 없음, 예: 베스트 조합)은 예전처럼 로컬 전용이다.
 * 로그아웃 시 clear()는 서버 장바구니를 지우지 않는다 — 다음 로그인 때 되찾아야 하므로
 * 로컬 표시만 비운다. 앱 시작 시 서버 장바구니를 가져와 로컬과 합치는 것도 아직 안 함(다음 과제).
 */
function syncAdd(product, quantity) {
  const userCode = useAuthStore.getState().userCode;
  if (!userCode || !product.productCode || !product.source) return;
  addToCart(userCode, { productId: product.productCode, productSource: product.source, quantity })
    .catch((err) => console.error('[cartStore] add sync failed', err));
}
function syncQuantity(item, quantity) {
  const userCode = useAuthStore.getState().userCode;
  if (!userCode || !item?.productCode || !item?.source) return;
  updateCartQuantity(userCode, item.productCode, quantity)
    .catch((err) => console.error('[cartStore] quantity sync failed', err));
}
function syncRemove(item) {
  const userCode = useAuthStore.getState().userCode;
  if (!userCode || !item?.productCode || !item?.source) return;
  removeFromCart(userCode, item.productCode)
    .catch((err) => console.error('[cartStore] remove sync failed', err));
}

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
      setQuantity: (id, quantity) => {
        const q = Math.max(1, quantity);
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, quantity: q } : it)),
        }));
        syncQuantity(get().items.find((it) => it.id === id), q);
      },

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
      remove: (id) => {
        const item = get().items.find((it) => it.id === id);
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
          selectedIds: state.selectedIds.filter((v) => v !== id),
        }));
        syncRemove(item);
      },

      /** 선택된 상품 제거 (선택삭제) */
      removeSelected: () => {
        const { items, selectedIds } = get();
        const removed = items.filter((it) => selectedIds.includes(it.id));
        set({ items: items.filter((it) => !selectedIds.includes(it.id)), selectedIds: [] });
        removed.forEach(syncRemove);
      },

      /** 상품 추가 — 이미 있으면 수량만 늘린다 */
      add: (product) => {
        const found = get().items.find((it) => it.id === product.id);
        const addedQuantity = product.quantity || 1;
        set((state) => {
          if (found) {
            return {
              items: state.items.map((it) =>
                it.id === product.id ? { ...it, quantity: it.quantity + addedQuantity } : it,
              ),
            };
          }
          return {
            items: [...state.items, { delivery: '기본', quantity: 1, ...product }],
            selectedIds: [...state.selectedIds, product.id],
          };
        });
        if (found) {
          syncQuantity(get().items.find((it) => it.id === product.id), found.quantity + addedQuantity);
        } else {
          syncAdd(product, addedQuantity);
        }
      },

      /** 선택된 상품 합계 금액 */
      selectedTotal: () =>
        get()
          .items.filter((it) => get().selectedIds.includes(it.id))
          .reduce((sum, it) => sum + it.price * it.quantity, 0),

      clear: () => set({ items: [], selectedIds: [] }),
    }),
    {
      name: 'innerderma.cart',
      /**
       * v2: 더미 3개로 시작하던 옛 저장값을 버리고 빈 장바구니로 출발.
       * v3: 로그아웃이 장바구니를 비우지 않던 동안 남은 저장값을 정리한다.
       *     (최초 접속 상태로 돌아왔는데도 담아 둔 상품이 남아 있었다)
       */
      version: 3,
      partialize: (state) => ({ items: state.items, selectedIds: state.selectedIds }),

      /** 옛 버전에서 올라올 때는 사용자가 담지 않았을 수 있는 상품을 비운다 */
      migrate: () => ({ items: [], selectedIds: [] }),

      merge: (saved, current) => ({ ...current, ...normalize(saved) }),
    },
  ),
);
