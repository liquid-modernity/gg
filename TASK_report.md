# TASK_report.md

## TASK SUMMARY
Task ID: R-002
Status: DONE

Changes:
- Added `./scripts/gg bump` to automate `GG_ASSET_VER` + `?v=` updates in `index.dev.xml` and `index.prod.xml`.
- Updated `tech-stack.md` to document the automated bump workflow.
- Fixed previous bump output and re-synced asset query strings.

## TASK PROOF
- `tools/scripts:gg` now includes a `bump` command that updates both XML files.
- `index.dev.xml` and `index.prod.xml` have matching `GG_ASSET_VER` and `?v=` values.

## FILES TOUCHED
- tools/scripts:gg
- index.dev.xml
- index.prod.xml
- tech-stack.md
- public/assets/dev/main.js
- TASK_report.md
