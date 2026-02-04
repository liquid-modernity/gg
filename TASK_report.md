# TASK_report.md

## TASK SUMMARY
Task ID: FIX-005
Status: DONE

Changes:
- Replaced hash-based Home Blog navigation with strict `/?view=blog` routing.
- Added router-driven hero toggle for query-based listing view.
- Updated breadcrumb and dock handlers to use Router navigation.

## TASK PROOF
- PJAX navigation to `/?view=blog` now forces listing surface and hides Hero immediately.

## FILES TOUCHED
- public/assets/dev/main.js
- index.dev.xml
- index.prod.xml
- TASK_report.md
