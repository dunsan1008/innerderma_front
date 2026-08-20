import { getCart } from '@/api/cart';
import { getWishlist } from '@/api/wishlist';
import { getProduct } from '@/api/market';
import { useCartStore } from '@/store/cartStore';
import { productKey, useWishlistStore } from '@/store/wishlistStore';
import { toCardProduct } from '@/hooks/useMarketProducts';

/**
 * 재방문(SplashScreen에서 저장된 userCode로 토큰 재발급 성공) 시 서버 장바구니·찜을
 * 가져와 로컬 스토어에 병합한다 — "쓰기만 동기화되고 새 세션에서는 서버 저장분을
 * 못 불러온다"던 갭을 메운다.
 *
 * 서버 응답(CartResponse/WishlistResponse)에는 productId/productSource/quantity
 * 뿐이라 이름·가격·이미지가 없다 — 각 productId로 `GET /products/{productCode}`를
 * 한 번씩만 불러 채운다(카트·찜에 같은 상품이 있으면 한 번만 조회).
 *
 * 화면을 막지 않는다 — SplashScreen이 await 하지 않고 그냥 호출만 한다.
 * 실패해도 조용히 콘솔에만 남긴다(로컬 상태는 항상 그대로 동작해야 하므로).
 */
export async function syncBackendCollections(userCode) {
  try {
    const [cartItems, wishlistItems] = await Promise.all([
      getCart(userCode).catch(() => []),
      getWishlist(userCode).catch(() => []),
    ]);
    if (!cartItems?.length && !wishlistItems?.length) return;

    const codes = new Set([...(cartItems ?? []), ...(wishlistItems ?? [])].map((it) => it.productId));
    const products = await Promise.all(
      [...codes].map((code) => getProduct(code).catch((err) => {
        console.error('[syncBackendCollections] product lookup failed', code, err);
        return null;
      })),
    );
    const byCode = new Map(products.filter(Boolean).map((p) => [p.productCode, p]));

    if (cartItems?.length) {
      const localCartItems = cartItems
        .map((ci) => {
          const p = byCode.get(ci.productId);
          if (!p) return null;
          const card = toCardProduct(p);
          return {
            id: productKey(card),
            name: card.name,
            option: card.name,
            price: p.price ?? 0,
            image: card.layers[0]?.srcs?.[0],
            quantity: ci.quantity ?? 1,
            delivery: '기본',
            productCode: p.productCode,
            source: p.source,
          };
        })
        .filter(Boolean);
      if (localCartItems.length) useCartStore.getState().mergeFromServer(localCartItems);
    }

    if (wishlistItems?.length) {
      const keys = wishlistItems
        .map((wi) => {
          const p = byCode.get(wi.productId);
          return p ? productKey(toCardProduct(p)) : null;
        })
        .filter(Boolean);
      if (keys.length) useWishlistStore.getState().mergeFromServer(keys);
    }
  } catch (err) {
    console.error('[syncBackendCollections] failed', err);
  }
}
