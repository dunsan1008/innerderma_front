<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# filter

## Purpose
Holds the shared shell for the market filter bottom sheet — the dimmed overlay, sheet header, three-tab switcher (gender / age group / custom diagnosis), reset link, and apply button that wrap around each filter screen's own content.

## Key Files
| File | Description |
|------|-------------|
| `FilterSheet.jsx` | Reusable bottom-sheet chrome for `/market/filter/*` routes; renders the dim/close backdrop, tab row, reset button (disabled until `hasChanges`), apply button, and passes `children` through for the tab-specific list content. Also exports `SheetLine`, a thin `#bcbcbc` divider matching a recurring Figma line asset. |

## For AI Agents

### Working In This Directory
Positions and sizes are hard-measured from Figma node `870:4855` (comment at the top of the file documents every offset); keep new elements aligned to that coordinate system rather than reflowing with normal layout. Navigation between tabs uses `useNavigate` to `/market/filter/{gender,age,diagnosis}` — `active` prop must match one of `TABS[].key` for tab highlighting to work.

### Testing Requirements
N/A — no test files in this directory.

## Dependencies

### Internal
`@/i18n` (`useT`) for the reset/apply button labels; `@/assets/figma/filter-line.svg`.

### External
`react-router-dom` (`useNavigate`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
