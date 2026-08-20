<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# ui

## Purpose
Small, generic, feature-agnostic UI primitives shared across screens: a variant-based button and a loading spinner. Both are direct ports of Figma components rather than app-specific widgets.

## Key Files
| File | Description |
|------|-------------|
| `Button.jsx` | Shared button matching Figma component set `Button` (`643:1189`) with three variants — `enabled` (black), `enabled2` (white/outlined), `disable` (grey, non-interactive); default size 353×52 with radius 14, overridable via `className`. |
| `Spinner.jsx` | Loading spinner composed of two stacked Figma image assets (a static base ring + a rotating arc); rotation is applied via CSS `animate-[spin_2s_linear_infinite]` on the arc's wrapper (2s per revolution — halved from the original 1s because it read as too hurried). Shared by every loading screen, so changing the duration here covers all of them. |

## For AI Agents

### Working In This Directory
Keep new additions here limited to truly generic, reusable primitives (no feature/domain logic) — feature-specific UI belongs in `home/`, `market/`, `routine/`, etc. `Button`'s `VARIANTS` map is the single source of styling per variant; add new variants there rather than overriding classes ad hoc at call sites.

### Testing Requirements
N/A — no test files in this directory.

## Dependencies

### Internal
`@/assets/figma/loading-base.svg`, `@/assets/figma/loading-arc.svg` (Spinner only).

### External
None.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
