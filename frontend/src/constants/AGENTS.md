<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# constants

## Purpose
Dummy/design-derived data that screens render before the backend exists, plus shared layout constants that keep visually-inconsistent Figma frames rendering as one consistent grid. Every file is meant to be swapped for a real API response later (each carries a comment noting the intended endpoint); layout constants (`cardLayout.js`) are the exception and stay permanent.

## Key Files
| File | Description |
|------|-------------|
| `cardLayout.js` | Shared market product-card geometry (`CARD_WIDTH`, `CARD_IMAGE_HEIGHT`, `CARD_IMAGE_BLEED`, `CARD_SIZES`, `CARD_SLOTS` for the 2-col/6-slot grid) derived from the "마켓 1 (전체)" Figma frame, reused by every market screen and the WIM store so cards line up identically across tabs instead of drifting 1-5px per screen as in the original Figma. |
| `cartItems.js` | Cart domain dummy data: `INITIAL_CART_ITEMS`/`INITIAL_CART_SELECTED` (both empty — cart starts empty by design, not pre-filled), `CART_DESIGN_SAMPLE` (Figma reference only, not used as a default), `DELIVERY_OPTIONS`, `formatPrice`. |
| `marketProducts.js` | Product card data for the three Pith Seoul market tabs (`MARKET_ALL_PRODUCTS`, `MARKET_OILY_PRODUCTS`, `MARKET_SKIN_PRODUCTS`), built via a `toCards()` helper that merges real Figma product info with the shared `cardLayout.js` geometry; also exports `SOLUTION_RECOMMEND_NAMES` for the "recommended alongside today's solution" section on the routine screen. |
| `marketScreens.js` | Per-screen configuration (`MARKET_SCREENS.all/oily/skin/wim`) tying together banner slides, tabs, filters, and product lists for each market tab, plus `findProductByKey()` — the single lookup used by detail/wishlist/routine screens to resolve a product by its name-derived key across all known products and banner-only products. |
| `productDetail.js` | `PRODUCT_DETAIL` — fallback dummy data for the product detail screen when no specific product is passed via route param. |
| `routines.js` | `NIGHT_STEPS`/`MORNING_STEPS`/`SUPPLEMENT_CARDS`/`NIGHT_AVOID`/`MORNING_AVOID`/`WHY_TEXT`/`WHY_TAGS`/`EVENING_WASH` — routine screen layout + Korean copy pulled directly from Figma; text is intentionally not paraphrased (product policy: safety copy must come from pre-reviewed resources). Layout fields (`nodeId`, `titleFlex`) are consumed by `i18n/useRoutineText.js`, which overlays translated text on top. |
| `selfCheck.js` | `SELF_CHECK_ITEMS` (5 selectable symptom options) and `SELF_CHECK_OTHER` (free-text "other" option) for the daily self-check screen. |
| `wimProducts.js` | WIM store product data (`WIM_PRODUCTS`, `WIM_BANNER_SLIDE`, `WIM_PRE_SOLUTION_SLIDE`), sharing the same `cardLayout.js` geometry as the Pith Seoul cards so switching stores doesn't change card size/spacing. |

## For AI Agents

### Working In This Directory
- These are dummy/placeholder data files standing in for backend responses — when wiring up real APIs (see `src/api/`), replace the data here but keep the shape/field names consumers expect.
- `routines.js` copy must not be reworded freely — it's pre-reviewed safety-adjacent skincare guidance per project policy.
- Card layout changes belong in `cardLayout.js` only; don't hardcode per-screen coordinates elsewhere, since `marketProducts.js`, `marketScreens.js`, and `wimProducts.js` all depend on that single shared geometry to stay visually aligned.
- `findProductByKey()` in `marketScreens.js` is the canonical cross-store product lookup — new screens that need to resolve a product by name should use it rather than re-searching individual product arrays.

### Testing Requirements
N/A — no tests currently exist for this directory.

## Dependencies

### Internal
`@/assets/figma/**` (product/banner images), `@/constants/cardLayout` (shared by `marketProducts.js`, `marketScreens.js`, `wimProducts.js`).

### External
None (plain JS data modules).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
