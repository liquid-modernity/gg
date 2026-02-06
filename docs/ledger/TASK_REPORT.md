TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006F
TITLE: Entrypoint split (main.js loader + app.js heavy)

TASK_SUMMARY
- main.js is now a tiny loader that derives app.js from its own script URL and async-loads it (dev-only info log).
- The previous heavy main.js bundle was moved to public/assets/latest/app.js with no functional changes.
- Release/build now versions app.js; budgets and header contract enforce app.js caching and smaller main.js limits.

FILES_CHANGED
- public/assets/latest/main.js
- public/assets/latest/app.js
- tools/release.js
- tools/perf-budgets.json
- tools/headers-contract.json
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-budgets.mjs`
- `node tools/verify-headers.mjs --mode=config`

MANUAL SMOKE (POST-DEPLOY)
1) Load page → confirm main.js injects app.js (Network panel shows app.js requested).
2) Interact once → confirm app features initialize normally.
3) Check headers: latest app.js no-store; versioned app.js immutable.

RISKS / ROLLBACK
- Risk: app.js load failure delays app init; loader is intentionally minimal.
- Rollback: revert this commit.
