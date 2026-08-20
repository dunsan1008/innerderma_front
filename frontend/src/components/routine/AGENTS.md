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
| `StepList.jsx` | Renders the ordered list of routine step cards (numbered badge, title, category tag, description) separated by a chevron divider image; category tag colors are fixed per category via the `TAG_STYLE` map. Title uses `flex-1 min-w-0` + `flexGrow: step.titleFlex` so a long real-data title wraps and shrinks the category tag instead of overflowing (`titleFlex` is optional — falls back to the `flex-1` default when a real step lacks it). |
| `SkinRadarChart.jsx` | Generic N-axis (≥3) SVG radar/polygon chart — draws grid rings, axis spokes, a filled score polygon, and outward-anchored axis labels (so left/right labels don't clip off the SVG edge). Not tied to skin-analysis specifically; any `{key, score, label}[]` works. |
| `SkinAnalysisModal.jsx` | "데일리 스킨 분석" modal (Figma `1252:493`) — replaces a static WHS-app screenshot pasted into that Figma frame with a real vector `SkinRadarChart` in the app's own accent color (not WHS's yellow) over the 5 AI-photo-analysis factors from `AAC_AI_Skin_Care_Service_Planning.md` §8.1 (pigmentation/pore/wrinkle/redness/texture — stays a pentagon since that's still exactly 5; add to `constants/skinAnalysis.js` and it becomes a hexagon+ automatically). Scores are dummy pending a real per-factor numeric field from the backend (today's analysis only returns qualitative IMPROVED/STABLE/WORSENED/NEEDS_ATTENTION grades). Driven by `uiStore`'s `skinAnalysisOpen`; mounted globally in `layout/AppModals.jsx`. `RoutineScreen.jsx` auto-opens it once via router `location.state.showSkinAnalysis` right after the solution-generation flow, and offers a floating reopen button (no Figma spec — ad hoc placement) for later. |

## For AI Agents

### Working In This Directory
`RoutineSections.jsx` exports multiple named components (not a default export) meant to be composed together per screen — import only what a given routine frame needs. `SupplementCards`' "no dosage judgment" behavior is a deliberate product-safety constraint per its comment — don't add computed/recommended dosage logic here.

### Testing Requirements
N/A — no test files in this directory.

## Dependencies

### Internal
`@/i18n` (`useT`), `@/lib/useMountTransition`, `@/store/uiStore` (`skinAnalysisOpen`), `@/constants/skinAnalysis` (`SKIN_ANALYSIS_FACTORS`), `@/assets/figma/routine-notch.svg`, `@/assets/figma/routine-right.svg`, `@/assets/figma/routine-time.svg`, `@/assets/figma/step-divider.svg`.

### External
None beyond React itself.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
