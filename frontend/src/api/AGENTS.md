<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# api

## Purpose
Domain-scoped axios wrappers for talking to the InnerDerma backend. Every network call in the app is required to go through one of these modules — components never call `axios`/`fetch` directly. The backend contract uses camelCase field names, is rooted at `/api` (no version segment), wraps every response as `{ success, data }` (unwrapped automatically by `client.js`'s response interceptor), and identifies a user by a client-generated `userCode` path segment on almost every endpoint — most functions here take `userCode` as their first argument. Auth (`auth.js`) and the onboarding flow (`SplashScreen`/`ConnectingScreen`) are wired to real calls; the rest of these modules exist as the swap-in point for screens that still run on dummy data from `src/constants/*.js`.

## Key Files
| File | Description |
|------|-------------|
| `client.js` | Shared axios instance: base URL from `VITE_API_BASE_URL` (falls back to `/api`), 15s timeout, JSON headers, bearer-token request interceptor backed by `localStorage` (`innerderma.accessToken`), and a response interceptor that unwraps the `{success,data}` envelope and clears the token on 401. |
| `auth.js` | `register({userCode,name,phoneNumber})`, `issueToken(userCode)` — no password, userCode alone is the credential. Wired into `SplashScreen`/`ConnectingScreen`; see `store/authStore.js`. |
| `users.js` | `getUser`, `updateProfile`, `getPreference`/`updatePreference` (preference is just `{locale}` — no field for the onboarding "진단만/진단+시술" choice, which stays local-only in `onboardingStore` for now). |
| `care.js` | Care cycles/solutions/completions/history: `getDailyCareCycle`, `createCareCycle`, `getDailyCareSolution`, `createCareSolution`, `getCareCompletions`, `saveCareCompletion`, `getCareCompletionHistory`, `getCareCompletionSummary`, `getDailyCare`, `getCareHistory`, `getCareHistoryDetail`, `createAiCare`. |
| `skinCapture.js` | `uploadSkinCapture`, `uploadAndAnalyzeSkinCapture` (multipart, single `file` field — server infers the date), `getTodaySkinCapture`, `getLatestSkinCapture`, `getSkinCaptureHistory`. |
| `selfCheck.js` | `submitSelfCheck`, `getLatestSelfCheck`, `getSelfCheckHistory`. **Shape mismatch flagged in-file**: backend wants 11 named symptom fields at 4-level severity (`NONE`/`MILD`/`MODERATE`/`SEVERE`), current `SelfCheckScreen` UI is a 5-item multi-select — needs a mapping decision before wiring. |
| `skinState.js` | Snapshots/trend/diagnosis/analyses: `createSkinStateSnapshot`, `getLatestSkinStateSnapshot`, `getSkinStateTrend`, `getLatestSkinDiagnosis`, `getSkinDiagnosisHistory`, `analyzeSkin`, `getLatestSkinAnalysis`, `getSkinAnalysisHistory`. |
| `procedures.js` | `getProcedures`, `getProcedure`, `getTreatmentContext` — backs RoutineScreen's "시술 후 N일차" and MyPage's 시술 관리. |
| `market.js` | `getProducts({category,concern,source})`, `getProduct`, `getDailyProductRecommendations`. `source` (`'PIECE_SEOUL'`\|`'WIM_STORE'`) is the real store filter — confirmed and wired via `hooks/useMarketProducts.js`. `/knowledge-products` was removed backend-side and merged into `/products`; `getKnowledgeProduct(s)` no longer exist here. Recommendations still aren't split per store/category tab (client-side filtering only). |
| `cart.js` | `getCart`, `addToCart`, `updateCartQuantity`, `removeFromCart`, `clearCart`. No delivery-method field in the backend schema — `cartStore`'s delivery state stays frontend-only. |
| `wishlist.js` | `getWishlist`, `addToWishlist`, `removeFromWishlist` — no toggle endpoint; compose add/remove client-side. |
| `facilities.js` | `getFacilities`, `getFacility` — unused by any screen; response is just `{id,facilityCode,name}`, not the visit-linking data the onboarding flow was originally guessed to need. |
| `aiRules.js` | `getAiRules`, `getEnabledAiRules`, `toggleAiRule` — admin/ops surface, not user-facing. |

## For AI Agents

### Working In This Directory
- Add new endpoints as functions in the domain file that matches the feature area; create a new domain file only for a genuinely new domain, following the same `client`-import, userCode-first-argument pattern.
- Never call `axios`/`fetch` from a page or component — route everything through here.
- Because the response interceptor already unwraps `{success,data}` to just `data`, callers receive the parsed payload directly, not an axios response object and not the envelope.
- There is **no backend endpoint for "WHS 방문 기록 연결"** (linking a visit) — the auth structure is client-generates-userCode + register, and `ConnectingScreen` repurposes that loading screen to actually do the registration call. Don't reintroduce a guessed `/visit-records` style call.
- Confirm real response shapes against the live OpenAPI spec (`/api-docs` on the deployed backend) before wiring a new screen — several fields here are typed from the schema but not yet exercised end-to-end (only auth has been). `productSource` on cart/wishlist requests is a guess at "which store" pending real data.

### Testing Requirements
N/A — no automated tests exist for this directory yet. Verify by running the dev server against a real backend (see root `DEPLOY_GUIDE.md`/`INNERDERMA_DEPLOY_GUIDE.md` for how to point `VITE_API_PROXY_TARGET` at one) and exercising the flow in a browser.

## Dependencies

### Internal
`store/authStore.js` (token/userCode session, synced with `client.js`'s token storage).

### External
`axios` (via `client.js`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
