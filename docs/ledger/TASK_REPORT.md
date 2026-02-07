TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007A.10
TITLE: ship Summary + Dirty-Tree Guard

TASK_SUMMARY
- ship now prints a final summary with work/release commit SHAs and release id.
- ship fails if the working tree is dirty after completion.

CHANGES
- tools/ship.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run ship`

NOTES
- RELEASE_ID is read from the capsule AUTOGEN block, with index.prod.xml fallback.

RISKS / ROLLBACK
- Risk: low; adds a hard guard to prevent dirty release state.
- Rollback: revert this commit.
