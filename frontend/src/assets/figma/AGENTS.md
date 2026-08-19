<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# figma

## Purpose
Flat dump of image assets exported directly from the Figma design file — icons, UI chrome (status bar, tab bar, camera button), badges, and a handful of product photos used outside the main product catalog (cart thumbnails, hero/combo shots). Filenames mirror their Figma layer names, not a curated naming scheme. One subdirectory, `products/`, holds the bulk of catalog product photography separately.

## Key Files
Not itemized individually (52 top-level files) — grouped by pattern:

| Pattern | Type | Examples |
|---------|------|----------|
| `*.svg` (42 files) | Vector icons/UI chrome — status bar glyphs, cart/heart/chevron/caret icons, tab bar art, loading spinner pieces | `status-time-white.svg`, `market-cart-icon.svg`, `tabbar-center.svg`, `loading-arc.svg` |
| `*.jpg` (7 files) | Raster photos re-encoded from PNG for size (commit "이미지 에셋 최적화 — 40MB → 1.1MB") — cart product thumbnails, product-detail hero/combo shots | `cart-cleanser.jpg`, `pd-hero.jpg`, `pd-combo-1.jpg` |
| `*.png` (3 files) | Remaining raster PNGs — brand logos and a camera-effect overlay, not touched by the JPG optimization pass | `pith-logo.png`, `wim-logo-white.png`, `camera-noise.png` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `products/` | Market/product-catalog photography (see `products/AGENTS.md`) |

## For AI Agents

### Working In This Directory
Treat every file here as an opaque exported asset — do not hand-edit SVGs/PNGs; re-export from Figma instead (see the Figma-related skills for pulling design assets). Assets are consumed via static `import` in component files (Vite resolves them to hashed URLs at build time), always through the `@/assets/figma/...` alias — grep for a filename before removing one, since components reference these by exact path.

### Testing Requirements
N/A — binary assets, not tested directly. Visual regressions involving these assets are caught by the repo's pixel-diff/sync-rate gate (see commit "밴드 분할 픽셀 diff와 싱크로율 회귀 게이트 추가").

## Dependencies

### Internal
Consumed by components throughout `frontend/src/components/**`.

### External
None (static files).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
