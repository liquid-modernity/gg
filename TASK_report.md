# TASK_report.md

## TASK SUMMARY
Task ID: FIX-004
Status: DONE

Changes:
- Added edge HTML rewrite for `/?view=blog` to force `data-gg-surface="listing"`.
- Passed through origin HTML while preserving non-HTML responses.

## TASK PROOF
- Full reload on `/?view=blog` now rewrites body surface at the edge.

## FILES TOUCHED
- src/worker.js
- public/assets/dev/main.js
- TASK_report.md
