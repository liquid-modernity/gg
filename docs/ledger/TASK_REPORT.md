TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.3.1
TITLE: Listing surface heading normalization: remove/demote landing H1 and inject H1 Blog (worker-only)

TASK_SUMMARY
- Normalize listing H1 in the worker: remove landing hero wrapper, demote landing H1 if present, and inject a single Blog H1 in main.
- Keep home (landing) behavior unchanged by scoping to listing-only HTML rewrite.

RATIONALE
- Blogger can surface the landing hero H1 on listing views; enforcing a single, stable H1 for /blog prevents multiple H1s and keeps headings consistent.

BEHAVIOR
- Listing HTML always has exactly one H1: "Blog".
- Landing hero H1 is removed/demoted on listing responses only.
- Post/page/home surfaces are untouched by this change.

CHANGES
- src/worker.js
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `SMOKE_LIVE_HTML=1 tools/smoke.sh`

RISKS / ROLLBACK
- Risk: low; listing-only HTML rewrite.
- Rollback: revert this commit.
