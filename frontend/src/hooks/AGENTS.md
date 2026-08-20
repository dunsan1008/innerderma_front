<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# hooks

## Purpose
Home for generic, non-i18n custom React hooks: the webcam capture hook and the care-solution data-fetching hook. (The routine-text translation hook, `useRoutineText`, lives in `src/i18n/` instead, since it's i18n-specific.)

## Key Files
| File | Description |
|------|-------------|
| `useCamera.js` | `useCamera({enabled})` — opens the front-facing camera via `getUserMedia`, attaches the stream to a `<video>` ref, and exposes a `capture()` function that grabs a mirrored, square-cropped JPEG data URL from the current frame. Tracks `status` (`idle`/`starting`/`ready`/`denied`/`unsupported`/`error`) and a localized `errorMessage` (via `@/i18n`) so the caller can render camera-permission guidance. |
| `useCareSolution.js` | `useCareSolution(date)` — fetches `GET /users/{userCode}/care-solutions/daily` for the given date via `api/care.js`. Returns `{ solution, loading }`; `solution` stays `null` on any failure (no session, 404 for that date, network error) rather than throwing — callers (`RoutineScreen`) are expected to fall back to `useRoutineText()`'s dummy/i18n data when `solution` is null, never to show an error state. |
| `useMarketProducts.js` | `useMarketProducts(store, category)` — fetches real products for a store (`'pith'`→`source=PIECE_SEOUL` / `'wim'`→`source=WIM_STORE`) via `api/market.js`, filters "수부지"/"피부탄력" tabs client-side by `skinStateTags` (no such category on the backend — `oily`=`HYDRATION` present, `skin`=`BARRIER_RECOVERY` or `STABLE` present, per backend team confirmation), and maps each `ProductResponse` into the exact shape `PostCard`/`FeaturedBanner` render (`toCardProduct`, `formatPrice`, `toCardTags` are also exported for reuse). Every mapped batch is registered into `constants/marketScreens.js`'s `registerDynamicProducts()` so `findProductByKey` (used by the detail/wishlist screens) can resolve real products too. Returns `{ products, frameContentHeight, loading }`; `products` is `null` on failure/empty — callers (`MarketScreen`) fall back to the dummy catalog, same pattern as `useCareSolution`. |
| `useSkinAnalysisScores.js` | `useSkinAnalysisScores(enabled)` — fetches `GET /users/{userCode}/skin-analyses/latest` via `api/skinState.js`'s `getLatestSkinAnalysis` and maps the response's `metricScores` (`pigmentationScore`/`poreTextureScore`/`wrinkleScore`/`rednessScore`, each 0–100, higher = healthier per backend confirmation) into the 4 keys `constants/skinAnalysis.js` expects. Takes an explicit `enabled` flag (not just an argument-less auto-fetch) because its only caller, `routine/SkinAnalysisModal.jsx`, is mounted unconditionally for the app's lifetime via `AppModals.jsx` — fetching should only happen while the modal is actually open, and re-fetch fresh every time it reopens. `scores` stays `null` on no-session/no-analysis-yet/failure, same fallback contract as `useCareSolution`. |

## For AI Agents

### Working In This Directory
- `useCamera` requests `facingMode: 'user'` at up to 1280x1280 and distinguishes "browser doesn't support getUserMedia" from "insecure context (non-HTTPS/non-localhost)" — both surface as `unsupported` but with different messages, since the underlying cause differs.
- `capture()` mirrors the image horizontally (`ctx.scale(-1,1)`) to match the mirrored `<video>` preview, and center-crops to a square before exporting as JPEG (quality 0.92).
- Error messages come from `getT()` (the non-hook i18n accessor) rather than `useT()`, since they're produced inside async callbacks, not render.

### Testing Requirements
N/A — no tests currently exist for this directory.

## Dependencies

### Internal
`@/i18n` (`getT()` for localized error strings).

### External
React (`useCallback`, `useEffect`, `useRef`, `useState`); browser `navigator.mediaDevices.getUserMedia` and `<canvas>` APIs.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
