<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# src/

## Purpose
The React application source root. Renders the InnerDerma mobile app inside a fixed-size `DeviceFrame` (an iPhone-shaped viewport), routed with react-router-dom across the onboarding → camera capture → solution/routine → market flow described in `App.jsx`. State is split across per-feature Zustand stores, styling comes from a single Tailwind/theme token source, and the UI supports 4 locales via a lightweight custom i18n layer.

## Key Files
| File | Description |
|------|-------------|
| `main.jsx` | Entry point. Mounts `<App />` into `#root` under `React.StrictMode`, imports global `index.css`. |
| `App.jsx` | Top-level route table (`BrowserRouter` + `Routes`) wrapped in `DeviceFrame` and an `ErrorBoundary` keyed on the current route path so a render error doesn't blank the whole frame. Route order mirrors the Figma flow: splash → signup → connecting/connected → home → camera → solution summary → solution `/:cycle` (night/morning share one route so the segment toggle doesn't remount) → self-check → solution loading → mypage → market (+ oily/elasticity/wim variants, wishlist, cart, product detail, filters). Calendar and 세안 확인(cleansing check) are overlays via `AppModals`/`uiStore`, not routes. |
| `theme.js` | Single source of truth for design tokens: `COLORS` (extensively annotated, mapped to specific Figma frames/components), `FONTS` (logo/sans/display families), and `FRAME` (iPhone 16 dimensions: 393×852, 44px radius). Consumed directly by `tailwind.config.js`. |
| `index.css` | Global stylesheet: Tailwind directives, CSS reset for headings/buttons matching Figma's absolute-coordinate layout style, shell background color, and hidden-scrollbar utility class (`.app-scroll`) used inside the device frame to preserve a native-app feel. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `api/` | HTTP client and per-domain API call modules (`client.js`, `care.js`, `market.js`) (see `api/AGENTS.md`). |
| `assets/` | Static assets, including a `figma/` subfolder of design-sourced images/icons (see `assets/AGENTS.md`). |
| `components/` | Reusable UI building blocks, grouped by feature area (`filter/`, `home/`, `layout/`, `market/`, `routine/`, `ui/`) (see `components/AGENTS.md`). |
| `constants/` | Static data/config modules — product catalogs, card layouts, routine definitions, self-check questions, etc. (see `constants/AGENTS.md`). |
| `hooks/` | Shared React hooks; currently just camera access (`useCamera.js`) (see `hooks/AGENTS.md`). |
| `i18n/` | Custom i18n implementation — per-locale dictionaries (`en`, `ja`, `ko`, `zh`) plus an index and a routine-specific text hook (see `i18n/AGENTS.md`). |
| `lib/` | Small framework-agnostic utilities — calendar math, product naming, a mount-transition hook (see `lib/AGENTS.md`). |
| `pages/` | Top-level screen components, one per route registered in `App.jsx` (see `pages/AGENTS.md`). |
| `store/` | Zustand state stores, one per domain: care, cart, onboarding, UI (modals/overlays), wishlist (see `store/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Import via the `@/` alias (resolves to `src/`, configured in `../vite.config.js`) rather than deep relative paths.
- Never hardcode a color or font literal in a component — add/reuse a named token in `theme.js` and reference it through Tailwind utility classes (`tailwind.config.js` injects `theme.js`'s `COLORS`/`FONTS` directly).
- The device frame element carries a `[data-frame]` attribute — this is a load-bearing hook for the `../scripts/` Playwright tooling (screenshotting/diffing), not just a styling detail; don't remove or rename it casually.
- Night/morning solution views intentionally share the single `/solution/:cycle` route (see comment in `App.jsx`) to avoid remounting on toggle — don't split this into two routes without preserving that behavior.

### Testing Requirements
No unit test runner is configured in this project. Verify UI changes by running the app (`npm run dev` from `frontend/`) and, for visual-fidelity or route-behavior checks, the Playwright scripts in `../scripts/` (see `scripts/AGENTS.md`).

### Common Patterns
- Feature-area subdivision is consistent across `components/`, and mirrored loosely by `pages/` (one screen component per route) and `store/` (one store per domain).
- Design values trace back to specific Figma frame IDs, referenced in comments throughout `theme.js` and constants — when in doubt about a value's origin, check for a Figma node-id comment nearby before changing it.

## Dependencies

### Internal
- Every subdirectory ultimately depends on `theme.js` for styling tokens and `App.jsx`'s route table for how pages are reached.

### External
- react-router-dom (routing), zustand (state), axios (HTTP, via `api/`), react/react-dom 18.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
