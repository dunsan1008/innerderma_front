<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-20 | Updated: 2026-08-20 -->

# api

## Purpose
Domain-scoped axios wrappers for talking to the InnerDerma backend. Every network call in the app is required to go through one of these modules — components never call `axios`/`fetch` directly. The backend contract uses camelCase field names and a default `/api/v1` namespace. Right now none of these functions are actually invoked by any screen; all pages run on dummy data from `src/constants/*.js`, and these functions exist as the pre-wired swap-in point for when the backend is ready.

## Key Files
| File | Description |
|------|-------------|
| `client.js` | Shared axios instance: base URL from `VITE_API_BASE_URL` (falls back to `/api/v1`), 15s timeout, JSON headers, bearer-token request interceptor backed by `localStorage` (`innerderma.accessToken`), and a response interceptor that unwraps `response.data` and clears the token on 401. |
| `care.js` | Care-cycle domain: `linkVisitRecord`, `uploadSkinCapture` (multipart image + captured date/timezone), `submitSelfCheck`, `getCareCycle(date)`, `getCareRecords(month)`, `completeRoutine({cycleId, phase})`. |
| `market.js` | Market domain: `getRecommendedProducts({category, filters})`, `getWishlist`, `toggleWishlist(productId)`, `removeFromWishlist(productIds)`. |

## For AI Agents

### Working In This Directory
- Add new endpoints as functions in the domain file that matches the feature area (care vs. market); create a new domain file only for a genuinely new domain, following the same `client`-import pattern.
- Never call `axios`/`fetch` from a page or component — route everything through here.
- Because the response interceptor already unwraps to `response.data`, callers receive the parsed body directly, not an axios response object.
- Field/path names should match the backend's camelCase, `/api/v1`-rooted contract even though nothing calls these yet.

### Testing Requirements
N/A — no tests currently exist for this directory, and no screen calls these functions yet (all UI reads from `src/constants/*.js` dummy data).

## Dependencies

### Internal
None (this is the lowest-level network layer other domains build on).

### External
`axios` (via `client.js`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
