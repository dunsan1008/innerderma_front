<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# steering

## Purpose
Project-specific steering rules for AI coding agents (used by editors such as Kiro/Antigravity). These are policy documents, not code — they govern git workflow discipline and the current stance on internationalization work.

## Key Files
| File | Description |
|------|-------------|
| `git-workflow.md` | Commit/push procedure: commit after finishing work without waiting to be asked, but always ask the user before pushing. Commits go straight to `main` (no feature branches unless the user specifies one), split by concern, written in Korean, staged by explicit filename (never `git add -A`), and preceded by a `git status` check for stray unrelated changes. Also requires `npm run build` (and `node scripts/verify.mjs` / `node scripts/verify-i18n.mjs` when present) to pass before committing, and forbids `--amend`/`--force`/`reset --hard`/`--no-verify` unless explicitly requested. |
| `i18n-multilingual.md` | i18n conventions for the 4 supported languages (ko/zh/ja/en) via the custom `src/i18n/` dictionaries and `useT()` hook — **but currently overridden**: as of 2026-08, translation work is paused until publishing/layout work is finished, so new screens should be built with hardcoded Korean text and `useT()` should not be used, unless the user explicitly asks for translation work. |

## For AI Agents

### Working In This Directory
- Treat `git-workflow.md` as the authoritative commit/push procedure for this repo (it's consistent with, and adds detail to, the root `CLAUDE.md` commit policy).
- Treat the `i18n-multilingual.md` **current-policy banner** as binding: do not add `useT()` calls or dictionary entries for new work unless the user explicitly requests translation. The rest of that file is reference material for when translation work resumes.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
