TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.5.2
TITLE: Make verify:release actionable

TASK_SUMMARY
- verify:release now prints exact mismatches and missing paths before failing.

CHANGES
- tools/verify-release-aligned.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- Failure message is now "Release not aligned to HEAD (details above)."

VERIFICATION COMMANDS (recommended)
- `node tools/verify-release-aligned.mjs`

RISKS / ROLLBACK
- Risk: low; output clarity only.
- Rollback: revert this commit.
