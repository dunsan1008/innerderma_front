<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# routine

## Purpose
Components for the routine (night/morning solution) screens: the dark header with weekday strip, the step-by-step skincare routine card list, the derma-care/inner-care section blocks (supplement cards, avoid-today warnings, "why this routine" evidence box), and a placeholder shown for future dates that have no solution yet.

## Key Files
| File | Description |
|------|-------------|
| `NoSolutionNotice.jsx` | Placeholder card shown when a future date is selected, since solutions only exist after that day's capture+analysis; matches the empty-state card styling from the first-visit home screen (Figma `870:3634`). |
| `RoutineHeader.jsx` | Dark rounded-top header for routine screens (Figma `870:3773`) — distinct from `home/SolutionHeader.jsx`: status bar here is a plain frame (so the notch is visible) rather than a component instance, and the weekday strip highlights recorded days in green (`#327145`) instead of the home screen's dark chip. |
| `RoutineSections.jsx` | Collection of shared section blocks reused by both night and morning routine frames: `SectionHeader` (DERMA CARE), `InnerCareHeader` (two-line INNER CARE title), `SupplementCards` (intake recommendation cards — intentionally shows only the manufacturer's official dosage text, no dosage judgment, per product safety policy), `AvoidBox` ("오늘은 피해주세요" warning list), and `WhyBox` (routine rationale + evidence source tags). |
| `StepList.jsx` | Renders the ordered list of routine step cards (numbered badge, title, category tag, description) separated by a chevron divider image; category tag colors are fixed per category via the `TAG_STYLE` map. Accepts an explicit `height` because some Figma frames (e.g. morning `870:4086`) reserve more height than the cards sum to. |

## For AI Agents

### Working In This Directory
`RoutineSections.jsx` exports multiple named components (not a default export) meant to be composed together per screen — import only what a given routine frame needs. `SupplementCards`' "no dosage judgment" behavior is a deliberate product-safety constraint per its comment — don't add computed/recommended dosage logic here.

### Testing Requirements
N/A — no test files in this directory.

## Dependencies

### Internal
`@/i18n` (`useT`), `@/assets/figma/routine-notch.svg`, `@/assets/figma/routine-right.svg`, `@/assets/figma/routine-time.svg`, `@/assets/figma/step-divider.svg`.

### External
None beyond React itself.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
