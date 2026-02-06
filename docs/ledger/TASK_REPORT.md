TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.8
TITLE: ship: Fail-fast Summary + Next-step Hints

TASK_SUMMARY
- ship now labels each step and prints a short, actionable summary on failure.
- Pattern-based hints cover release mismatch, dirty tree, push rejects, and stash conflicts.
- Added a `--verbose` flag to show full output on failure; default prints last 40 lines.

CHANGES
- tools/ship.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- Success path remains unchanged; no auto-resolve of conflicts.

VERIFICATION COMMANDS (manual)
- `npm run ship -- --verbose`

RISKS / ROLLBACK
- Risk: low; output only.
- Rollback: revert this commit.
