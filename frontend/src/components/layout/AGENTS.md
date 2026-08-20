<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# layout

## Purpose
App-shell scaffolding shared across every screen: the scaled iPhone device frame, the per-screen scroll wrapper, the fixed status bar and bottom tab bar, the global overlay/modal host, the home-indicator pill, and a render-error safety net. Everything here is route-agnostic and reused by every feature screen.

## Key Files
| File | Description |
|------|-------------|
| `AppModals.jsx` | Global overlay host mounted once at the top of `DeviceFrame`. Reads `useUiStore`/`useCareStore` to conditionally render `CalendarModal`, `WashCheckModal`, `LanguageModal`, and `routine/SkinAnalysisModal`; owns the "pick a date → navigate to that day's solution" logic and keeps modals mounted through their exit animation via `useMountTransition` (`SkinAnalysisModal` manages its own mount transition internally, so it's passed `open`/`onClose` directly rather than a precomputed `entered` flag). |
| `DeviceFrame.jsx` | Web-shell wrapper that centers a fixed 393×852 iPhone-16-sized frame on the page and scales it down (via CSS `transform: scale`, never by resizing) to fit the viewport, so internal absolute coordinates never need to change. |
| `ErrorBoundary.jsx` | Class-based React render-error boundary wrapping the frame's contents; shows an inline error message + "다시 시도" retry button instead of leaving a blank frame, logs to `console.error` for Playwright capture, and auto-resets when `resetKey` (route) changes. |
| `HomeIndicator.jsx` | Static bottom home-indicator pill matching Figma component `Home Indicator/Light` (`38:1660`). |
| `LanguageModal.jsx` | Language-picker modal (한국어/中文/日本語/English) opened from the globe icon; selection-only prototype, does not actually apply translations beyond storing the choice via `onSelect`. |
| `Screen.jsx` | Per-screen wrapper implementing the fixed-header / scrollable-middle / fixed-tabbar layout pattern; shifts child content up by `headerHeight` so Figma-frame-relative absolute coordinates still line up inside the scroll container. |
| `StatusBar.jsx` | iOS-style status bar image swap component (time + signal/wifi/battery icons) matching Figma component `38:1635`; `tone` prop picks the ink/white asset pair. Notch layer intentionally omitted (hidden in the source Figma component). |
| `TabBar.jsx` | Bottom navigation bar with Home / center capture / Market buttons; active tab highlighted by current route via `isHomeActive`/`isMarketActive`; icons are inline SVG using `currentColor` for active/inactive tinting; center capture button opens the wash-check modal via `useUiStore`. |

## For AI Agents

### Working In This Directory
`Screen.jsx` is the layout contract every feature screen builds on — read it before adding a new route/screen so header/tabbar/scroll offsets stay consistent. Coordinate math here is load-bearing (`DeviceFrame`'s scale-only resize, `Screen`'s `headerHeight` offset compensation) — don't "simplify" without checking how dependents pass `headerHeight`/`contentBottom`.

### Testing Requirements
N/A — no test files; `ErrorBoundary` is designed to be caught by Playwright's `pageerror`/console listeners in E2E runs (see its top-of-file comment).

## Dependencies

### Internal
`@/theme` (`FRAME` constants), `@/i18n`, `@/store/uiStore`, `@/store/careStore`, `@/lib/useMountTransition`, `@/components/home/CalendarModal`, `@/components/home/WashCheckModal`, `@/assets/figma/*` (status bar and tab bar icon assets).

### External
`react-router-dom` (`useLocation`, `useNavigate`), React (`Component`, `useState`, `useEffect`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
