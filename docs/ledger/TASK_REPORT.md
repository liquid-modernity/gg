TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.4
TITLE: Deploy Trigger Hygiene (no fake green deploy)

TASK_SUMMARY
- Deploy workflow now only runs on manual dispatch with a required `sha` input.
- CI dispatches deploy on success for main, passing the exact SHA.
- Deploy preflight verifies the provided SHA has a successful CI run before proceeding.

CHANGES
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- Manual dispatch is still allowed but fails fast if CI is not green for the SHA.

VERIFICATION COMMANDS (recommended)
- n/a (workflow-level behavior)

RISKS / ROLLBACK
- Risk: low; deploy is now strictly gated to green CI SHAs.
- Rollback: revert this commit.
