<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# innerderma_front

## Purpose
Frontend repository for **InnerDerma**, an AI-based post-care skin service. The repo root holds planning and deployment documentation; the actual React application lives under `frontend/`. This repo has no container or backend of its own — it is a static site whose `frontend/dist` build output is served by nginx from the separate `InnerDerma` backend repository.

## Key Files
| File | Description |
|------|-------------|
| `README.md` | Single-line placeholder (`# innerderma_front`) — no project overview here; see this file and `frontend/AGENTS.md` instead. |
| `CLAUDE.md` | Claude Code working preferences for this repo: commit/push policy, Korean-only responses, Antigravity task-splitting policy, Figma workflow scoping rules. |
| `DEPLOY_GUIDE.md` | This repo's slice of deployment: local build, manual update deploy, and the GitHub Actions CI/CD pipeline (build + rsync + nginx restart on the backend server). |
| `INNERDERMA_DEPLOY_GUIDE.md` | Full-stack deployment guide from the InnerDerma **backend** repo's point of view — nginx routing, certs, MySQL, SkinAge, and all containers this repo does not own. |
| `AAC_AI_Skin_Care_Service_Planning.md` | Product/service planning document for the "귀국 후 사후관리" (post-return skin care) feature — care cycles, user segmentation, service scope. Korean. |
| `백오피스-프론트엔드-스택-정리.md` | **Not this repo's stack.** A separate mentoring/reference write-up about a different internal backoffice project's frontend stack (TypeScript, Yarn, Chart.js, Cloudflare Pages) and its AI-coding team conventions. Useful only as general reference, not as documentation of this codebase. |
| `.gitignore` | Ignores `node_modules/`, `frontend/dist/`, `frontend/.shots/`, `.env*` (except `.env.example`), logs, IDE files. |
| `.gitattributes` | Git LFS tracking for PNG/JPG assets, notably `frontend/src/assets/figma/**`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `frontend/` | The actual React 18 + Vite + Tailwind + Zustand SPA (see `frontend/AGENTS.md`). |
| `.kiro/` | AI steering rules consumed by editors like Kiro/Antigravity (see `.kiro/AGENTS.md`). |
| `.github/` | GitHub Actions CI/CD (see `.github/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- This repo has **no container of its own**. It produces a static build (`frontend/dist`) that is deployed by `.github/workflows/deploy.yml`: build on a GitHub Actions runner, then `rsync` the `dist/` output to `/opt/innerderma-frontend/dist/` on the backend server, then restart the `frontend` container defined in the separate InnerDerma backend repo.
- If a task appears to require changing backend/infra concerns — nginx config, TLS certificates, other service containers (app-api, SkinAge, MySQL) — **check with the user first** before acting; those live in the InnerDerma backend repo, not here.
- Commit/push policy (from `CLAUDE.md`): only commit after verifying the change (tests pass, build succeeds, or the feature demonstrably works), and always get explicit user confirmation before pushing — never auto-push.
- All responses to the user must be written in **Korean**, unless the user explicitly asks for another language.
- Simple/routine/mechanical tasks are preferably split off to the Antigravity agent (via oh-my-claudecode's `/ask antigravity`); Claude handles complex or judgment-heavy work directly.
- Figma work: if the user gives a specific node-id link, implement only that scope. If scope is ambiguous, ask the user which screen to work on rather than exploring the whole file tree with `get_metadata` (past attempts produced huge dumps that were hard to parse).
- Most documentation in this repo is written in Korean.

### Testing Requirements
N/A at the root — see `frontend/AGENTS.md` for the app's build/verification scripts.

## Dependencies

### Internal
- Depends on the separate `InnerDerma` backend repository for the nginx container, TLS certs, API server, and domain routing that actually serve this repo's build output in production.

### External
- GitHub Actions (CI/CD), rsync + SSH (deployment transport), Git LFS (binary asset storage).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
