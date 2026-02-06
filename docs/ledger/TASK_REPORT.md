TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006K
TITLE: Decouple router from UI (no await UI on click)

TASK_SUMMARY
- Internal click interception now routes immediately without awaiting or loading `modules/ui.js`.
- Added DEV-only intercept/fallback logs and kept routing fallback to hard navigation when router is unavailable.
- Updated CRP plan and ledger entries; built release artifacts.

FILES_CHANGED
- public/assets/latest/core.js
- docs/perf/CRP_PLAN.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/847ce8a/*

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-budgets.mjs`
- `node tools/verify-headers.mjs --mode=config`

RISKS / ROLLBACK
- Risk: low; routing no longer waits on UI and hard-nav fallback is preserved.
- Rollback: revert this commit.
