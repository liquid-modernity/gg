# TASK_report.md

## TASK SUMMARY
Task ID: PIPE-001
Status: DONE

Changes:
- Made `./scripts/gg verify` local-only by removing production smoke calls.
- Added `verify:prod` and `autodeploy` flows to run prod checks and deploy in order.
- Decoupled `tools/smoke.sh` from `verify-worker` to avoid duplication.

## TASK PROOF
- Local verify no longer hits production; prod checks are explicit via `verify:prod`.

## FILES TOUCHED
- tools/scripts:gg
- tools/smoke.sh
- TASK_report.md
