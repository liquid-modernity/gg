TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0004.2
TITLE: Wrangler CI-only + local npm ci fix

TASK_SUMMARY
- Removed `wrangler` from repo dependencies and updated the lockfile accordingly.
- Ensured workflows enforce lockfile presence and use `npm ci` only (no on-the-fly lockfile generation).
- Documented Wrangler CI-only policy and local npm ci behavior.

FILES_CHANGED
- package.json
- package-lock.json
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- docs/LOCAL_DEV.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

COMMANDS RUN
- `npm install --package-lock-only --ignore-scripts`

CI/DEPLOY EXPECTATIONS
- CI fails fast if `package-lock.json` is missing, then runs `npm ci` + build/verifiers.
- Deploy workflow also fails fast if lockfile is missing and uses `npm ci` only.
- Deploy uses `cloudflare/wrangler-action` with pinned `wranglerVersion` in `.github/workflows/deploy.yml`.

LOCAL EXPECTATION (macOS 10.15)
- `npm ci` should succeed (no local wrangler/esbuild install).

HOW TO VERIFY IN GITHUB ACTIONS
1) Open Actions → `CI` workflow.
2) Confirm “Guard lockfile” step exists and fails if lockfile is removed.
3) Confirm “Install deps (npm ci)” runs without lockfile generation.
4) Confirm deploy workflow still runs only after CI success and smoke tests are mandatory.

RISKS / ROLLBACK
- Risk: none (tooling + docs only).
- Rollback: revert this commit.
