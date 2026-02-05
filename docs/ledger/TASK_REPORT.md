TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006A
TITLE: CRP Phase 1 (defer + idle bootstrap)

TASK_SUMMARY
- Split boot into Stage 0 (minimal) and Stage 1 (idle) in `public/assets/latest/main.js`.
- Deferred app init, router init, and a11y init to idle; router click binding occurs after DOMContentLoaded.
- Deferred root-state sync and hero video observer to idle.
- Added DEV-only Stage 0 performance mark with a single console info line.
- Updated CRP plan to mark Phase 1 completed.

FILES_CHANGED
- public/assets/latest/main.js
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-budgets.mjs`
- `node tools/verify-ledger.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/validate-xml.js`

PERF MEASUREMENT (DevTools)
1) Open Chrome DevTools → Performance.
2) Enable CPU throttling (4x), Disable cache, Cold reload.
3) Record from navigation start.
4) Confirm Stage 0 has no long tasks > 50 ms and Stage 1 runs via idle.

BEHAVIOR CHECKS
- DEV: no SW controller, no reload loops, main.js still loads with `defer`.
- PROD: navigation still works; SW unaffected; no functional regressions observed.

RISKS / ROLLBACK
- Risk: delayed app init may postpone non-critical UI hydration.
- Rollback: revert this commit.
