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
