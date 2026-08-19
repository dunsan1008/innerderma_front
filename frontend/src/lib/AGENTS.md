<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# lib

## Purpose
Small, framework-agnostic utility modules that don't fit under `hooks/` (pure calculations) or belong to a specific domain. Covers calendar/date-key math, product-name display rules, and a mount-transition helper for animated open/close UI.

## Key Files
| File | Description |
|------|-------------|
| `calendar.js` | Date-key (`YYYY-MM-DD` string) based calendar utilities: parsing/formatting (`toDateKey`, `parseDateKey`, `formatDateLabel`), navigation (`shiftMonth`, `shiftYear`, `addDays`), grid building (`buildMonthWeeks` for the full calendar, `buildWeekStrip` for the folded weekly strip that always starts at the reference date), and chip-state logic (`stateOf`: `'record'`\|`'today'`\|`'empty'`\|`'future'`) driven by the `completedDates` list from `careStore`. Also exports `TODAY_KEY` and dummy `INITIAL_COMPLETED_KEYS` for pre-backend seeding. |
| `productName.js` | Product-name display rules for market cards/banners: `joinNameLines` merges a `nameLines` array (or `name`) into one string without truncating; `clampLines(lines)` returns a CSS `-webkit-line-clamp` style object so the browser handles line-count truncation instead of the code guessing by character count (Figma names vary wildly in rendered width across Korean/English/digits). |
| `useMountTransition.js` | `useMountTransition(open, duration)` hook — keeps a component mounted through its CSS exit transition and double-`requestAnimationFrame`s the `entered` flag on open so enter transitions actually animate instead of being skipped by the browser painting the end-state first. |

## For AI Agents

### Working In This Directory
- All dates in this codebase are handled as `dateKey` strings (`YYYY-MM-DD`), not `Date` objects, except internally inside `calendar.js`'s private `toDate`/`fromDate` helpers — keep new date logic consistent with that convention.
- `productName.js` deliberately does not truncate strings itself; truncation is CSS-driven via `clampLines()` because actual rendered line count can't be known without the browser laying out the text.
- `useMountTransition` needs the *double* rAF (not single) to avoid transitions being skipped — don't "simplify" it to one frame.

### Testing Requirements
N/A — no tests currently exist for this directory.

## Dependencies

### Internal
None directly imported here, but `calendar.js` values are widely consumed by `store/careStore.js` and routine/home page components; `productName.js` is used by market card layout constants (`constants/cardLayout.js`, `constants/marketProducts.js`).

### External
React (`useEffect`, `useState` in `useMountTransition.js`); no external libs in `calendar.js`/`productName.js`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
