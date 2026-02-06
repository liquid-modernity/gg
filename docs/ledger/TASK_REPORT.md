TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006K.1
TITLE: Router contract hardening (intercept allowlist + no prod logs)

TASK_SUMMARY
- Added router intercept allowlist/denylist to skip assets and static endpoints/extensions.
- Router logs are now dev-only or GG_DEBUG-only; no PROD console noise.
- Added `tools/verify-router-contract.mjs` and wired into CI.

FILES_CHANGED
- public/assets/latest/core.js
- tools/verify-router-contract.mjs
- .github/workflows/ci.yml
- docs/perf/CRP_PLAN.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/45f38c6/*

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-router-contract.mjs`

RISKS / ROLLBACK
- Risk: low; intercept rules are stricter and logs are gated.
- Rollback: revert this commit.
