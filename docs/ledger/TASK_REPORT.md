TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006F.1
TITLE: Late-load safe onReady + boot.js header contract

TASK_SUMMARY
- GG.boot.onReady now queues callbacks and flushes asynchronously even when app.js loads after DOMContentLoaded.
- Headers contract explicitly includes boot.js for both latest (no-store) and versioned (immutable) assets.
- CRP plan and ledger updated to reflect the boot → main(loader) → app chain.

FILES_CHANGED
- public/assets/latest/app.js
- tools/headers-contract.json
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-headers.mjs --mode=config`

MANUAL SMOKE
1) After load, run: `GG.boot.onReady(()=>console.log('READY_OK'))` → logs immediately.
2) Validate headers contract includes `/assets/latest/boot.js` and `/assets/v/<REL>/boot.js`.

RISKS / ROLLBACK
- Risk: minimal; onReady now uses microtask/timeout flush for late-loaded app.
- Rollback: revert this commit.
