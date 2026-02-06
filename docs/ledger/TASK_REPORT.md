TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006G
TITLE: Modular split app.js (core + modules on-demand)

TASK_SUMMARY
- Added `core.js` as the small must-load runtime and moved heavy code into modules (`modules/ui.js`, `modules/pwa.js`).
- main.js loader now loads `core.js`; app.js is a compatibility shim.
- Release, headers contract, and perf budgets updated for core and modules.

FILES_CHANGED
- public/assets/latest/main.js
- public/assets/latest/app.js
- public/assets/latest/core.js
- public/assets/latest/modules/pwa.js
- public/assets/latest/modules/ui.js
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

MANUAL SMOKE
1) Load page, interact once → router interception works and UI module loads without console errors.
2) After load, check Network → `core.js` loaded from main.js; `modules/ui.js` and `modules/pwa.js` load on idle/interaction.
3) Headers: latest core/modules no-store; versioned core/modules immutable.

RISKS / ROLLBACK
- Risk: missing module init delays UI/PWA features.
- Rollback: revert this commit.
