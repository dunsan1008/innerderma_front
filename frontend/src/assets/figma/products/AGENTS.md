<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# products

## Purpose
Product-catalog photography for the Market tab — banners, listing thumbnails, and store-specific product shots exported from Figma. All 31 files are JPGs (re-encoded from PNG for size in commit "이미지 에셋 최적화 — 40MB → 1.1MB") grouped by a filename prefix that maps to a product/brand family rather than by directory.

## Key Files
Not itemized individually (31 files, all `.jpg`) — grouped by filename prefix:

| Prefix | Count | Likely use |
|--------|-------|-----------|
| `banner-*` (banner-53/58/59) | 3 | Featured banner carousel slide images (see `components/market/FeaturedBanner.jsx`) |
| `img-*` (img-15…21) | 7 | General product listing images |
| `m2-*` (m2-15…20) | 6 | Product family/variant set "m2" (likely a second market/product screen's card images) |
| `m3-*` (m3-15…22) | 8 | Product family/variant set "m3" |
| `wim-*` (wim-1…6, wim-banner) | 7 | WIM Store product photos + its banner |

## For AI Agents

### Working In This Directory
Treat as opaque exported assets — re-export from Figma rather than hand-editing. Numeric suffixes correspond to Figma layer/frame numbering, not a guaranteed display order; check the consuming product-data module (product lists referenced from `components/market/PostCard.jsx` and `FeaturedBanner.jsx`) before assuming sequence.

### Testing Requirements
N/A — binary assets. Covered indirectly by the repo's pixel-diff/sync-rate visual regression gate.

## Dependencies

### Internal
Consumed by `frontend/src/components/market/*` (product cards, featured banner) via static imports.

### External
None (static files).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
