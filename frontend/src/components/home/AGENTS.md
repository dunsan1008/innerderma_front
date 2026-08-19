<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# home

## Purpose
Components specific to the home/solution screens: the full-month calendar modal, the night/morning cycle segment switch, the dark top header with weekday strip, and the post-capture wash-check confirmation dialog. These implement the "care cycle" concept — one photo capture provides that evening's night solution and the next morning's solution, so several components pair two calendar days together with a capsule outline.

## Key Files
| File | Description |
|------|-------------|
| `CalendarModal.jsx` | Full-screen month calendar overlay (Figma node `870:5803`). Computes date grid via `@/lib/calendar`, supports month/year navigation and a year+month picker, draws a "paired days" capsule around the selected day and the next day, and animates in/out via `entered` prop. |
| `CycleSegment.jsx` | Two-way segment control (tonight / tomorrow morning) with a sliding thumb indicator; has `home` and `routine` visual variants controlled by the `variant` prop (different padding/typography per Figma frame `870:3623` vs `870:3836`). |
| `SolutionHeader.jsx` | Dark rounded-top header for the home/solution screen (Figma `870:3574`) — status bar, InnerDerma logo, language/mypage icon buttons, and a 7-day weekday strip whose background chip color encodes day state (`record`/`empty`/`today`/`future`). Tapping the background opens the calendar modal. |
| `WashCheckModal.jsx` | Confirmation dialog shown whenever the camera/capture button is tapped (Figma `870:3565`), enforcing the "wash face before capture" product rule; backdrop tap or "not yet" link dismisses without confirming. |

## For AI Agents

### Working In This Directory
All layout is absolute-positioned to match Figma pixel offsets — comments at the top of each file cite the exact node IDs and measurements; preserve that structure when editing rather than switching to flex/grid unless the comment says the layout is intentionally non-Figma (e.g. the month/year picker, which has no Figma counterpart). Day-state colors (`record`/`empty`/`today`/`future`) are fixed per app logic, not a UI selection state — don't confuse them with `selected`.

### Testing Requirements
N/A — no test files in this directory; verify visually against Figma via the dev server.

## Dependencies

### Internal
`@/i18n` (`useT`), `@/components/layout/StatusBar`, `@/lib/calendar` (date-grid helpers), `@/assets/figma/calendar-chevron.svg`.

### External
React (`useState`, `useEffect`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
