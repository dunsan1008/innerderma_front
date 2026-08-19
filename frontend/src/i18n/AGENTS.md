<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# i18n

## Purpose
Self-built i18n system (no external library) for 4 supported languages: Korean (`ko`, default), English (`en`), Chinese (`zh`), Japanese (`ja`). Reads the active language from `useUiStore`'s `lang` field and returns the matching dictionary object. See `.kiro/steering/i18n-multilingual.md` at the repo root for the full project convention doc (language list, storage rules, screen-addition checklist) — this AGENTS.md summarizes the code structure here, not the policy.

**Current project directive (as of 2026-08, see the steering doc):** translation work is paused until publishing is complete. New screens/features should be built with hardcoded Korean and should *not* register into `useT()`/the dictionaries; existing already-translated components are left as-is. Only apply the "everything through `t.xxx.yyy`" rule below when the user explicitly requests translation work.

## Key Files
| File | Description |
|------|-------------|
| `index.js` | Core i18n module: `dictionaries = {ko, en, zh, ja}`; `useT()` hook for use inside components (subscribes to `useUiStore`'s `lang`, re-renders on language change); `getT()` for reading the current dictionary outside components (e.g. in `hooks/useCamera.js`'s async error handling) — does not auto-rerender. |
| `ko.js` | Korean dictionary (default/base language). Keyed by screen/area, e.g. `common`, `weekdays`, `onboarding`, `home`, `calendar`, `solution`, `nightSteps`, `morningSteps`, `camera`, `market`, `filter`, `mypage`, `lang` (language modal). Some values are functions (e.g. `calendar.yearMonth(y, m)`) for locale-specific formatting. |
| `en.js` | English dictionary — same key structure as `ko.js`. |
| `zh.js` | Simplified Chinese dictionary — same key structure as `ko.js`. |
| `ja.js` | Japanese dictionary — same key structure as `ko.js`. |
| `useRoutineText.js` | `useRoutineText()` hook — merges the layout-only data in `constants/routines.js` (nodeId, titleFlex, step order) with translated text pulled from the current dictionary's `nightSteps`/`morningSteps`/`supplements`/`eveningWash`/`solution`/`whyTags`/`nightAvoid`/`morningAvoid` keys, so the Routine screen never renders hardcoded Korean text directly. |

## For AI Agents

### Working In This Directory
- All four dictionaries must stay structurally parallel — adding a key to `ko.js` requires the same key in `en.js`, `zh.js`, `ja.js` (per the steering doc's "add all 4 languages together" rule), except during the current translation-paused period noted above.
- Use `useT()` inside React components (reactive); use `getT()` only outside component render (e.g. inside async callbacks/non-hook utility code).
- Brand names (InnerDerma, WIM, WHS) and ingredient/technical abbreviations (SPF, UV) are never translated, per the steering doc. Product names are currently dummy data and also left untranslated (backend will eventually supply per-locale names).
- `useRoutineText.js` is the pattern to follow when layout constants (with nodeId/coordinates) need translated text overlaid — keep layout and copy separated the same way for any new similarly-structured screen.

### Testing Requirements
N/A — no tests currently exist for this directory.

## Dependencies

### Internal
`@/store/uiStore` (`lang` state, persisted to `localStorage` under `innerderma.ui`); `@/constants/routines` (layout data consumed by `useRoutineText.js`).

### External
None (no i18n library — hand-rolled).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
