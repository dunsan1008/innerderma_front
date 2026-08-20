<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# market

## Purpose
Components for the Market tab: category filter chips, a header with wishlist/cart icons, a sort/filter dropdown row, an auto-rotating featured product banner carousel, individual product cards, and the Pith Seoul ↔ WIM Store brand toggle. Recently reworked (see git history: "마켓 탭 개선 9건" — a batch of market-tab fixes covering product name wrapping, price line-breaks, tag overflow, and slide-index safety).

## Key Files
| File | Description |
|------|-------------|
| `CategoryTabs.jsx` | Pill-shaped category filter tabs (전체/수부지/피부탄력, Figma `870:4935`); supports a `staticKeys` list to make specific tabs non-interactive when the active store has no matching screen for that category. |
| `FeaturedBanner.jsx` | Auto-rotating (4s interval) hero product banner with swipe support, dot indicators, and pause-on-hover; tap opens product detail via `onOpen`. Resets `index` to 0 whenever the `slides` array identity/length changes to avoid reading past the end when switching between stores with different slide counts. |
| `FilterRow.jsx` | Row of absolutely-positioned sort/filter dropdown labels (성별/나이대/데일리 스킨 분석) with a caret icon; positions vary per screen via the `top`/`items` props. |
| `MarketHeader.jsx` | Dark market-tab header (Figma `Group 4` 870:5079) with logo, wishlist and cart icon buttons; `showHeart` toggles an extra (empty, per Figma) heart frame used on some market screens. |
| `PostCard.jsx` | Product card (167×272, Figma `PostCard`) rendering layered product images, a wishlist heart toggle backed by `useWishlistStore`, an optional multi-select checkbox (wishlist screen only), name/price/tag text with CSS line-clamp, and a full-card tap target for opening the detail screen. |
| `StoreToggle.jsx` | Pith Seoul / WIM Store segmented toggle (Figma `StoreToggle` 1104:1645) driven by a single `wim` boolean; the active pill slides via `translateX` and logos invert color via CSS `filter` rather than swapping image assets. |

## For AI Agents

### Working In This Directory
Several components carry explicit "don't regress this" comments documenting prior bugs (name box overflowing into price/heart area, price wrapping to two lines, tag chips overlapping, banner reading `items[index]` out of bounds after a slide-count change) — read those comments before touching name/price/tag layout, they encode real regressions that were fixed. Product name/price formatting helpers live in `@/lib/productName` (`clampLines`, `joinNameLines`, `displayProductName`) — reuse them rather than re-implementing line-clamp logic.

### Testing Requirements
N/A — no test files in this directory; there is a separate pixel-diff/sync-rate regression gate for visual changes (see recent commit "밴드 분할 픽셀 diff와 싱크로율 회귀 게이트 추가").

### Common Patterns
Coordinates/sizes are Figma-measured and documented in top-of-file comments referencing specific node IDs; product data objects passed as props (`banner`, `product`) carry their own Figma-derived `frame`/`box`/`sizes` fields consumed positionally by these components rather than the components owning layout constants themselves.

## Dependencies

### Internal
`@/lib/productName`, `@/store/wishlistStore`, `@/assets/figma/*` (caret, heart, cart icons, pith/wim logos).

### External
React (`useState`, `useEffect`, `useRef`, `useCallback`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
