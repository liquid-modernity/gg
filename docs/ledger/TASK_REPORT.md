TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0006I
TITLE: True idle UI prefetch (no timeout) with connection heuristics

TASK_SUMMARY
- Added idle-only UI prefetch scheduling in core.js with connection/visibility heuristics and no timeout.
- Prefetch is idempotent and DEV-only logs explain schedule/skip reasons; click-triggered UI load remains the primary path.
- Updated CRP plan to document Phase 2I prefetch strategy.

FILES_CHANGED
- public/assets/latest/core.js
- docs/perf/CRP_PLAN.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/40009c1/*

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-budgets.mjs`
- `node tools/verify-headers.mjs --mode=config`

RISKS / ROLLBACK
- Risk: low; idle prefetch is gated and does not block interaction.
- Rollback: revert this commit.
