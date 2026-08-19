<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# components

## Purpose
React component library for the InnerDerma frontend, grouped by feature area. All components are absolutely-positioned inside a fixed 393×852 device frame (see `frontend/src/theme`) and reproduce Figma layouts pixel-for-pixel — most files carry `data-node-id`/`data-name` attributes pointing back to the source Figma node and comments documenting exact measurements.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `filter/` | Market filter bottom-sheet shell (gender/age/diagnosis tabs) (see `filter/AGENTS.md`) |
| `home/` | Home/solution screen widgets — calendar modal, day-cycle segment control, dark header, wash-check confirmation modal (see `home/AGENTS.md`) |
| `layout/` | App shell primitives — device frame, screen scroll wrapper, status bar, tab bar, modal host, error boundary (see `layout/AGENTS.md`) |
| `market/` | Market tab widgets — category tabs, featured banner carousel, filter row, header, product card, store toggle (see `market/AGENTS.md`) |
| `routine/` | Routine (night/morning solution) screen sections — header, step list, care sections, no-solution notice (see `routine/AGENTS.md`) |
| `ui/` | Small generic UI primitives — Button, Spinner (see `ui/AGENTS.md`) |

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
