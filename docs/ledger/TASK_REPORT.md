TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007B.5
TITLE: Deploy checkout before CI verify

TASK_SUMMARY
- Moved checkout before verify-ci-success so the script is present for the target SHA.
- Added a guard to fail with a clear error if the script is missing.

CHANGES
- .github/workflows/deploy.yml
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- Trigger deploy for a SHA with green CI and confirm verify step passes.

NOTES
- CI gate logic unchanged; order fixed to avoid missing file errors.

RISKS / ROLLBACK
- Risk: low; only deploy step ordering.
- Rollback: revert this commit.
