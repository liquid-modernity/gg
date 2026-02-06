TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.9
TITLE: ship Two-Stage Commits (work + release)

TASK_SUMMARY
- ship now commits work changes before running prep:release, ensuring the tree is clean for release.js.
- After prep:release, ship commits release artifacts separately (or skips if no changes).

CHANGES
- tools/ship.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- Work commit message defaults to "chore: update work" and can be overridden via `--work-msg` or `SHIP_WORK_MSG`.

VERIFICATION COMMANDS (manual)
- `npm run ship`
- `npm run ship -- --work-msg "chore: work"`

RISKS / ROLLBACK
- Risk: low; behavior is deterministic and avoids dirty-tree release failures.
- Rollback: revert this commit.
