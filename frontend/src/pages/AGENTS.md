<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# pages

## Purpose
Route-level screen components (React Router pages), each mapped 1:1 (or 2:1 via a `variant`/`cycle` prop) to a Figma frame from the InnerDerma design. Every screen renders inside the shared `Screen` layout component (`@/components/layout/Screen`) with Figma-exact absolute-positioned children, and carries `data-node-id` attributes tying markup back to the source Figma node for traceability. Screens currently run entirely on dummy data from `src/constants/*.js` and Zustand stores — no screen calls `src/api/*` yet.

## Key Files
| File | Description |
|------|-------------|
| `SplashScreen.jsx` | First screen (Figma 870:3435) — black background, logo, auto-navigates to `/signup` after 1.6s. |
| `SignupScreen.jsx` | Onboarding service-selection screen (Figma 870:3426) — user picks diagnosis-only vs. diagnosis+treatment, sets `onboardingStore.userType`, navigates to `/connecting`. |
| `ConnectingScreen.jsx` | "Linking visit record" loading screen (Figma 870:3454) — auto-navigates to `/connected` after 1.8s (stand-in for awaiting a link API response). |
| `ConnectedScreen.jsx` | "Connection complete" screen (Figma 870:3439) — on continue, resets care state to pre-capture (`careStore.startFresh()`) and navigates to `/home`. |
| `HomeRoute.jsx` | `/home` router — branches between `HomeFirstVisitScreen` (no capture yet) and `RoutineScreen` (has today's capture) based on `careStore.hasCaptureToday`/`phase`. |
| `HomeFirstVisitScreen.jsx` | First-visit home state (Figma 870:3573) — shows a "-"-valued cycle segment and 3 empty routine-card placeholders that open the wash-check modal; no completion records shown. |
| `CameraScreen.jsx` | Face-capture camera screen, implementing two Figma frames (870:3677 disabled / 870:3650 enabled) as one component driven by `useCamera()` status; shoots via `careStore.markCaptured()` then navigates to `/self-check`. |
| `SelfCheckScreen.jsx` | Daily self-check form (Figma 970:1090) — multi-select symptom list from `constants/selfCheck.js` (picking "no issues" clears other selections) plus free-text "other"; saves and navigates to `/solution-loading`. |
| `SolutionLoadingScreen.jsx` | "Deriving solution" loading screen (Figma 970:1129), structurally identical to `ConnectingScreen` — navigates to `/solution-summary` after 1.8s. |
| `SolutionSummaryScreen.jsx` | One-line solution summary (Figma 870:3761) — staggered enter/leave animated headline + 3 keyword tags, auto-navigates to `/solution/night` after ~2.4s. |
| `RoutineScreen.jsx` | Main routine/solution screen (Figma 870:3771 night / 870:4002 morning), the largest page — night/morning cycle toggle, step list, supplement cards, avoid-list, "why this routine" box, and a product-recommendation section; also renders a "no solution for this date" notice for future/unrecorded past dates. Fetches the real `CareSolutionResponse` via `hooks/useCareSolution.js` for `selectedDate` and maps its fields (steps/avoid/supplements/eveningWash/concernTags/whsDiagnosisSummary) onto the display model; whenever a field is missing (no session, no solution generated for that date, request failure), falls back per-field to `i18n/useRoutineText.js`'s translated dummy data from `constants/routines.js` — the screen never shows an error state, only real-or-dummy content. `noSolution` (the "no solution for this date" branch) prioritizes the real fetch: future dates are always `noSolution`, but for other dates a present `solution` overrides the local `careStore` heuristic (future date / not in `completedDates`) — e.g. a past date the backend actually has a solution for renders the real routine even if the local device never recorded a "완료" tap. While the fetch is still loading, `noSolution` avoids flashing the notice and only falls back to the local heuristic once loading finishes with no solution (no session, genuinely no record, or backend-less environment). |
| `MarketScreen.jsx` | Shared market screen for all 4 tabs via `variant` prop (`all`/`oily`/`skin`/`wim`) — store toggle (Pith Seoul ↔ WIM), category tabs, filter row, featured banner carousel, product grid. Pre-solution (no capture yet) shows different banner slides since recommendations need capture/analysis data. |
| `FilterScreen.jsx` | Shared bottom-sheet filter screen for 3 variants via `variant` prop: `gender` (single-select), `age` (multi-select), `diagnosis` (read-only skin-metric bars). |
| `ProductDetailScreen.jsx` | Product detail screen (Figma 1026:2575) — resolves the viewed product via `findProductByKey()` from the route id param (falls back to `constants/productDetail.js` dummy data), shows wishlist toggle, add-to-cart, and an expandable "best combo" card. |
| `CartScreen.jsx` | MY cart screen (Figma 1026:2397) — per-item quantity stepper, delivery-method select, select-all/select-delete, running total; backed entirely by `cartStore`. |
| `WishlistScreen.jsx` | Market wishlist screen (Figma 870:5089) — looks up liked products by key across *all* stores (Pith Seoul + WIM), re-lays them into a 2-column grid, supports select-all/select-delete. |
| `MyPageScreen.jsx` | My page / settings screen (Figma 870:5963) — static grouped menu list (account, treatment management, app settings); logout resets `onboardingStore` and `careStore` and returns to the first screen. |

## For AI Agents

### Working In This Directory
- Preserve the `data-node-id`/Figma-coordinate convention (`absolute left-[Npx] top-[Npx] ...`) when editing these screens — it's how the code stays traceable to the design source, per this repo's Figma-implementation convention (see root `CLAUDE.md` §5).
- Screens sharing a Figma "family" (multiple frames representing states of one flow) are implemented as one component switching on a prop rather than duplicated per-frame: `RoutineScreen` (night/morning via `cycle`), `MarketScreen` (4 store/category variants), `FilterScreen` (3 variants), `CameraScreen` (enabled/disabled via internal `detected` state).
- Loading screens (`ConnectingScreen`, `SolutionLoadingScreen`) are `setTimeout`-based stand-ins for awaiting real API responses — when wiring up `src/api/*`, replace the timer with the actual request/response await, keeping the same navigation target.
- Product identity across screens (cart, wishlist, detail, routine recommendations) is the name-derived key from `store/wishlistStore.js`'s `productKey()`/`constants/marketScreens.js`'s `findProductByKey()` — don't introduce a second identity scheme.

### Testing Requirements
N/A — no automated tests currently exist for this directory. Per root `CLAUDE.md`, UI changes should be verified by running the dev server and exercising the flow in a browser.

### Common Patterns
- Every screen wraps its content in `<Screen>` (from `@/components/layout/Screen`), passing `nodeId`/`name` for traceability and, where applicable, `header`/`headerHeight`/`tabBar`/`tabBarHeight`/`contentBottom` for sticky chrome.
- Text content is pulled from `useT()` (`@/i18n`) rather than hardcoded, for screens that have already been translated (see `src/i18n/AGENTS.md` for the current translation-paused policy on *new* screens).
- Screens reading/writing app state do so via the Zustand stores in `@/store/*`, not local component state, whenever the state must survive navigation or reload (capture status, cart, wishlist, language, modal visibility).

## Dependencies

### Internal
`@/components/layout/*` (`Screen`, `StatusBar`, `TabBar`, `HomeIndicator`), `@/components/home/*`, `@/components/routine/*`, `@/components/market/*`, `@/components/filter/*`, `@/components/ui/*`, `@/store/*` (all 5 stores), `@/constants/*`, `@/lib/calendar`, `@/lib/productName`, `@/hooks/useCamera`, `@/i18n` and `@/i18n/useRoutineText`.

### External
`react-router-dom` (`useNavigate`, `useParams`), React (`useState`, `useEffect`, `useMemo`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
