<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# frontend/

## Purpose
The actual InnerDerma frontend application: a React 18 + Vite 6 single-page app that renders as a mobile app frame (iPhone-sized `DeviceFrame`) inside a browser viewport. It is a static build target — no server-side code lives here — deployed as pre-built static assets per the repo's deploy guides. Styling is Tailwind, driven by a single design-token source (`src/theme.js`). The app also ships an internal Playwright-based pixel-diff/sync-regression toolchain (`scripts/`) used to verify implemented screens against Figma reference screenshots.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Scripts (`dev`, `build`, `preview`, `lint`, `sync`, `sync:update`, `diff:band`) and deps: React 18.3, react-router-dom 7, zustand 5, axios, Tailwind 3, Vite 6, Playwright (dev). |
| `vite.config.js` | Vite config: `@` alias → `src/`, dev server on port 5173, optional self-signed HTTPS mode (`HTTPS=1`, needed for `getUserMedia`/camera on non-localhost hosts), and a `/api` dev proxy to `VITE_API_PROXY_TARGET`. |
| `tailwind.config.js` | Tailwind config; colors/fonts are injected from `src/theme.js` (single source of truth) rather than duplicated here. Adds a `fade-in` keyframe/animation used for night/morning content-swap transitions. |
| `postcss.config.js` | Standard `tailwindcss` + `autoprefixer` plugin setup. |
| `index.html` | Vite entry HTML. Loads Google Fonts (Noto Sans KR for body text, 42dot Sans for large display copy) matching the Figma source design, mounts `#root`, loads `src/main.jsx`. |
| `.env.example` | `VITE_API_BASE_URL` (backend API base; falls back to relative `/api/v1` through the vite dev proxy when unset) and `VITE_API_PROXY_TARGET` (dev proxy backend target, default `http://localhost:8080`). |
| `no-solution.html` | Standalone static mockup HTML (not wired into the app/router) rendering the "solution not yet generated" empty-state screen at full fidelity — inline CSS, iPhone frame chrome, status bar, day-strip, tab bar. Appears to be a Figma-to-HTML reference/prototype artifact kept for visual reference, not imported by any app code. |
| `600` | Empty file (0 bytes) sitting at the frontend root. No content, purpose undetermined — likely stray/accidental. |
| `package-lock.json` | npm lockfile. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | React application source — entry point, routes, components, pages, state stores, API clients, i18n (see `src/AGENTS.md`). |
| `scripts/` | Playwright-based dev-only tooling for screenshotting the app and diffing it against Figma reference images, band-by-band, to gate visual regressions (see `scripts/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- This is a Vite + React + Tailwind SPA. Run dev server with `npm run dev` (plain HTTP, `localhost:5173`) or `npm run dev:https` (self-signed HTTPS, needed to test camera capture from another device on the LAN). Build production assets with `npm run build`; preview the build with `npm run preview` (or `npm run preview:https`).
- This repo has **no backend container of its own** — it produces a static build. Backend/infra changes (nginx, certs, other service containers) belong to the InnerDerma backend repo; confirm with the user before touching anything outside this static frontend, per the root `CLAUDE.md`.
- Do not hardcode color literals in components — pull colors/fonts from `src/theme.js`, which Tailwind consumes directly (see `tailwind.config.js`).
- The `sync` / `sync:update` / `diff:band` npm scripts are the pixel-diff/sync-regression system implemented in `scripts/` (see `scripts/AGENTS.md`); they compare rendered screens against Figma reference PNGs in `.figma-ref/` (gitignored) using a band-split mismatch percentage gated by `scripts/sync.json`. Recent commit history (`eed1cff` "밴드 분할 픽셀 diff와 싱크로율 회귀 게이트 추가") added this system specifically to catch visual drift from the Figma source of truth.

### Testing Requirements
No unit/integration test runner is configured (no Jest/Vitest in `package.json`). Verification is done via:
- `npm run lint` (ESLint) for static checks.
- The custom Playwright scripts in `scripts/` for visual/functional verification against a running `preview` server — see `scripts/AGENTS.md` for exact invocation.

### Common Patterns
- Path alias `@/...` resolves to `src/` (configured in `vite.config.js`); used throughout for imports instead of relative paths.
- All design values (colors, fonts, frame dimensions) are centralized in `src/theme.js` and consumed by both Tailwind and raw JS/CSS — never redefine a color literal per component.

## Dependencies

### Internal
- `src/theme.js` is read by `tailwind.config.js` at build time — any component styling ultimately depends on this file staying in sync with Figma.

### External
- React 18.3.1, react-dom 18.3.1, react-router-dom 7.1.5, zustand 5.0.3, axios 1.7.9 (runtime).
- Vite 6.0.11, @vitejs/plugin-react, @vitejs/plugin-basic-ssl, Tailwind 3.4.17, autoprefixer, postcss, Playwright (dev/tooling only).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
