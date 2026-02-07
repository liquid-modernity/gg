TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0007B.4
TITLE: Deploy CI success check (retry + diagnostics)

TASK_SUMMARY
- Deploy now waits for CI to complete using the correct workflow runs API and retries before failing.
- Diagnostics show recent run status/conclusion and links for fast triage.

CHANGES
- .github/workflows/deploy.yml
- tools/verify-ci-success.py
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- Trigger deploy for a SHA with running CI and confirm it waits.
- Trigger deploy for a SHA with failed CI and confirm it fails with run URLs.

NOTES
- Removed the incorrect `status=success` filter.

RISKS / ROLLBACK
- Risk: low; only gate behavior changes.
- Rollback: revert this commit.
