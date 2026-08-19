<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# workflows

## Purpose
GitHub Actions workflow definitions for this repo. Currently a single workflow that builds the frontend and deploys the static output to the InnerDerma production server.

## Key Files
| File | Description |
|------|-------------|
| `deploy.yml` | "Deploy Frontend" workflow, triggered on push to `main` or manually via `workflow_dispatch`. Split into two jobs: `build` (checkout, Node 20 setup with npm cache keyed on `frontend/package-lock.json`, `npm ci` and `npm run build` in `frontend/`, then uploads `frontend/dist/` as an artifact retained 7 days) and `deploy` (`needs: build`; downloads the artifact, `rsync`s it with `--delete` to `/opt/innerderma-frontend/dist/` on the server via `burnett01/rsync-deployments`, then SSHes in via `appleboy/ssh-action` to run `docker compose restart frontend` in `/opt/innerderma`). Uses repo secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`. |

## For AI Agents

### Working In This Directory
- The build happens entirely on the GitHub Actions runner — the production server never runs Node/npm/vite, only receives the built `dist/` via rsync. Do not "fix" deploy issues by trying to install Node on the server.
- `build` and `deploy` are separate jobs (split out in commit `a554c78`, "Split deploy workflow into separate build and deploy jobs") so their logs are distinct in the Actions tab; `deploy` only runs if `build` succeeds.
- This workflow is the CI/CD counterpart to the manual procedures documented in the root `DEPLOY_GUIDE.md`, and touches infrastructure owned by the separate InnerDerma backend repo (`docker compose restart frontend`, described fully in `INNERDERMA_DEPLOY_GUIDE.md`). Changes here that affect what gets restarted, where files land on the server, or which secrets are required should be treated as infra changes — confirm with the user per the root `CLAUDE.md` policy before altering the deploy target or restart behavior.
- Do not add steps that run other `docker compose` commands (e.g. affecting SkinAge, app-api, or MySQL) — those are out of this repo's deploy scope.

### Testing Requirements
No automated test job in this workflow. Verifying a workflow change means confirming the `build` job produces `frontend/dist/` successfully (e.g. by running `npm run build` locally) and, for deploy-step changes, reviewing the rsync/SSH steps carefully since they act on the production server via `workflow_dispatch` or a push to `main`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
