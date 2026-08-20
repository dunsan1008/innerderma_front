<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# store

## Purpose
Zustand stores for all client-side app state. Most stores persist a subset of their state to `localStorage` via `persist` middleware (with `partialize` to select which fields survive, and `merge`/`migrate` to sanitize/reset stale saved shapes so a corrupted or outdated persisted value can't crash rendering).

## Key Files
| File | Description |
|------|-------------|
| `authStore.js` | `useAuthStore` — auth session: `userCode`, `name`, `token`. `setSession()` also calls `api/client.js`'s `setAccessToken()` to keep the axios bearer-token interceptor in sync; `onRehydrateStorage` does the same on reload. `SplashScreen` reads `userCode` to decide gateway (registered → reissue token → `/home`; not registered → `/signup`). `MyPageScreen`'s logout calls `clearSession()`. |
| `careStore.js` | `useCareStore` — care-cycle screen state: current `phase` (`'night'`\|`'morning'`), `selectedDate`, `hasCaptureToday` (drives whether Home shows the first-visit or routine view), `completedDates` (backs calendar green-chip display), `captureDataUrl` (not persisted — too large). Actions: `setPhase`, `setSelectedDate`, `markCaptured`, `markCompleted`/`unmarkCompleted`, `isCompleted`, `startFresh` (resets to pre-capture state after onboarding), `reset`. Has custom `migrate`/`merge` logic to detect and fix a legacy persisted shape that lacked `completedDates` and defaulted `hasCaptureToday` to `false`. |
| `cartStore.js` | `useCartStore` — MY cart state: `items` (with quantity/delivery), `selectedIds` (for bulk purchase/delete). Actions: `toggleSelect`, `toggleSelectAll`, `setQuantity`, `setDelivery`, `setDeliveryForSelected`, `remove`, `removeSelected`, `add` (merges quantity if already present), `selectedTotal()`, `clear`. Local state is always the source of truth for the UI; `add`/`setQuantity`/`remove`/`removeSelected` additionally fire a background sync to `api/cart.js` when the item carries `productCode`+`source` (real backend products only — set by `ProductDetailScreen` from the product it resolved via `findProductByKey`; dummy items, e.g. the combo add, stay local-only). Sync failures are swallowed (console-logged) so cart UI never blocks or errors on network issues. `clear()` never syncs — logout must not delete the user's server-side cart. `mergeFromServer(items)` is the pull side — adds server-known items the local store doesn't have yet (never overwrites/duplicates existing ids, never re-syncs them back out); called by `lib/syncBackendCollections.js` on returning-user Splash. Persisted at version 2 — migration wipes any v1 dummy-seeded cart so real users always start empty. |
| `onboardingStore.js` | `useOnboardingStore` — holds the selected `userType` (`'DIAGNOSIS_ONLY'`\|`'DIAGNOSIS_AND_TREATMENT'`\|`null`) chosen on the signup screen. Not persisted. |
| `uiStore.js` | `useUiStore` — global overlay/modal state (`calendarOpen`, `washCheckOpen`, `langOpen`, `skinAnalysisOpen`, each with open/close actions) plus the display `lang` (one of `SUPPORTED_LANGS = ['ko','zh','ja','en']`), auto-detected from `navigator.languages` on first load. Only `lang` is persisted (modals always start closed on reload). |
| `wishlistStore.js` | `useWishlistStore` — liked-product state as a `keys` array (product identity is the display name, not a Figma node id, since the same product appears under different node ids across market tabs); exports `productKey(product)` helper used by pages to compute the same key consistently. Actions: `has`, `toggle`, `removeMany`, `clear`. Same real-vs-dummy sync pattern as `cartStore.js`: `toggle`/`removeMany` fire a background `api/wishlist.js` call only when the product has `productCode`+`source`; local `keys` always updates immediately regardless of sync success. `mergeFromServer(keys)` is the pull side, same contract as `cartStore.js`'s — called by `lib/syncBackendCollections.js`. Persisted at version 2 — migration empties any legacy wishlist so all products start un-liked. |

## For AI Agents

### Working In This Directory
- When adding a new persisted field, bump `version` and add `migrate`/`merge` handling — every existing store treats malformed/legacy `localStorage` values as untrusted and normalizes them rather than trusting the saved shape directly.
- `wishlistStore`'s `productKey()` (name-based, trimmed, `nameLines`-aware) is the canonical product identity across the app — reuse it rather than inventing another key scheme (e.g. cart/market pages should match it when cross-referencing wishlist state).
- Deliberately-empty defaults (`cartStore` items, `wishlistStore` keys) are a product decision, not an oversight — don't reintroduce Figma's pre-filled sample state as a default.

### Testing Requirements
N/A — no tests currently exist for this directory.

## Dependencies

### Internal
`@/lib/calendar` (`INITIAL_COMPLETED_KEYS`, `TODAY_KEY` used by `careStore.js` defaults); `@/constants/cartItems` (`INITIAL_CART_ITEMS`/`INITIAL_CART_SELECTED` used by `cartStore.js`).

### External
`zustand`, `zustand/middleware` (`persist`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
