# TASK_report.md

## TASK SUMMARY
Task ID: FIX-009
Status: DONE

Changes:
- Normalized footer links in `index.dev.xml` and `index.prod.xml` to use `https://www.pakrpp.com`, plus `target="_blank"` and `rel="noopener noreferrer"` for external anchors.
- Added `tools/check-links.sh` linter and wired it into `tools/smoke.sh`.

## TASK PROOF
- `tools/check-links.sh` passes and `tools/smoke.sh` now includes link hygiene validation.

## FILES TOUCHED
- index.dev.xml
- index.prod.xml
- tools/check-links.sh
- tools/smoke.sh
- TASK_report.md
