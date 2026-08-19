<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# scripts/

## Purpose
Dev-only Node/Playwright tooling that verifies the implemented app visually and functionally matches the Figma source design. None of this ships in the production build; it drives a headless Chromium instance to screenshot running app routes, pixel-diff them band-by-band against reference PNGs exported from Figma, and gate on a per-screen mismatch-percentage threshold. It also includes smaller one-off inspection utilities (pixel probing, zooming, i18n/feature verification) used while building or debugging a screen.

## Key Files
| File | Description |
|------|-------------|
| `sync.mjs` | The main regression gate. Reads `sync.json`, launches Chromium, navigates to each screen's route on a running server (default `http://localhost:4173`), waits for `[data-frame]` + fonts, screenshots the expanded frame, and runs an in-page (`page.evaluate`) band-diff against the matching PNG in `.figma-ref/`. Prints PASS/FAIL per screen and writes `.shots/sync/results.json`. Exits non-zero if any band exceeds its `max` threshold. `--update-baseline` rewrites `sync.json`'s `max` values to `current worst + 0.5%` (used to register new baselines). |
| `sync.json` | Manifest for `sync.mjs`: global `frameW` (393) / `bandH` (852px, one iPhone screen height), and a `screens` array — each entry has `name`, `route`, `frameH` (full scrollable height), and `max` (allowed mismatch % per band). Currently covers 20 screens spanning onboarding, camera, solution/routine, mypage, and market flows. |
| `diff-band.mjs` | Standalone CLI version of the same band-diff algorithm as `sync.mjs` (usable outside the full sync run): `node scripts/diff-band.mjs <ref.png> <impl.png> <outDir> <frameH> [originX,originY]`. Splits a tall screen into `bandH`-tall chunks, auto-detects the reference image's opaque bounding box to locate the device frame within a raw Figma export, and writes a side-by-side ref/impl/diff PNG per band plus a JSON mismatch summary to stdout. |
| `probe.mjs` | Inspects a reference PNG's opaque/alpha bounding box — used to sanity-check the auto frame-detection logic that `diff-band.mjs`/`sync.mjs` rely on. |
| `px.mjs` | Reads specific `x,y` pixel RGBA values out of a PNG (`node scripts/px.mjs <file> <x,y> ...`) — quick manual color-matching against Figma. |
| `shoot.mjs` | General screenshot utility: `node scripts/shoot.mjs <baseUrl> <outDir> <route:name>...`. Captures both the standard 393×852 frame and a `-full` version for screens taller than one frame height. |
| `shoot-new.mjs` | Screenshots a fixed hardcoded list of 4 specific screens (self-check, solution-loading, cart, product-detail) — a narrower, one-off variant of `shoot.mjs` for newly added screens. |
| `zoom.mjs` | Crops and upscales a specific `y0`–`y1` band of a ref/impl image pair and stacks them for close visual comparison (font weight/letter-spacing checks): `node scripts/zoom.mjs <ref.png> <impl.png> <out.png> <frameHeight> <y0> <y1> [zoom]`. |
| `verify.mjs` | Functional (not pixel) verification script driving a fake-camera-enabled Chromium through a fixed list of behavioral checks across the app, logging PASS/FAIL per check plus screenshots to `.shots/verify`. |
| `verify-i18n.mjs` | Verifies the 4 supported locales across key routes: no raw `{t.xxx}` literals leak, expected translated strings appear (and Korean doesn't leak into other languages), and the selected language persists across a reload. |

## For AI Agents

### Working In This Directory
- These scripts require a running app server to point at — either the Vite dev server or, more commonly, `npm run preview` (production build) since `sync.mjs`/`shoot.mjs` default to `http://localhost:4173`.
- All scripts depend on `playwright` (a devDependency of `frontend/`, not this directory) and are invoked via `node scripts/<file>.mjs`, not through a test runner.
- Reference images live in `.figma-ref/` (gitignored, not present in this listing) — they must be exported from Figma (`get_screenshot`) and placed there matching the `name` in `sync.json` before `sync.mjs` can compare against them; screens without a ref file are skipped (`SKIP` log line), not failed.
- Screenshot/diff output is written under `.shots/` (gitignored): `.shots/sync/`, `.shots/verify`, `.shots/new`, etc., depending on script.
- When adding a new screen to the app that needs regression coverage, add an entry to `sync.json` with its route and full scrollable `frameH`, capture a Figma reference into `.figma-ref/<name>.png`, then run `npm run sync:update` once to register the initial baseline `max`.

### Testing Requirements
This directory *is* the testing/verification tooling for the frontend — there is no separate test suite to run against it. To validate a change to the diff/sync logic itself, run it against at least one screen with a known-good `.figma-ref/` PNG and confirm the reported mismatch % and output band images look sane.

### Common Patterns
- `sync.mjs` and `diff-band.mjs` implement the *same* band-diff algorithm independently (the former inlines it via `page.evaluate` to avoid spawning a subprocess per screen); if the diff algorithm changes, both need updating in tandem.
- Diff visualization convention: red pixels = mismatch beyond the per-pixel channel-delta threshold (90), light blue-tinted pixels = area outside the reference's opaque frame bounding box (excluded from comparison), grayscale = the size of a below-threshold difference.
- Frame origin (where the device frame sits inside a raw Figma export) is auto-detected from the reference PNG's opaque alpha bounding box, not hardcoded — `probe.mjs` exists specifically to debug this detection.

## Dependencies

### Internal
- Targets the running app defined in `frontend/src` (specifically routes registered in `src/App.jsx`) and the `[data-frame]`-marked device frame element from `src/components/layout/DeviceFrame`.
- `sync.json`'s `frameW`/`bandH` (393/852) match `src/theme.js`'s `FRAME` constant (iPhone 16 dimensions).

### External
- `playwright` (Chromium) for headless browser automation and canvas-based pixel diffing.
- Node's built-in `fs`/`path`/`url` modules only — no other npm dependency.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
