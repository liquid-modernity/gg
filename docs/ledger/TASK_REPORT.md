TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.5.1
TITLE: Hook UX + CI Fail-Fast

TASK_SUMMARY
- Added `install:hooks` npm script for one-command hook setup.
- Documented local workflow in `docs/ci/LOCAL_WORKFLOW.md`.
- CI now fails before build if release artifacts are not aligned to HEAD.

CHANGES
- package.json
- tools/install-hooks.mjs
- tools/verify-release-aligned.mjs
- docs/ci/LOCAL_WORKFLOW.md
- .github/workflows/ci.yml
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- CI prints a clear remediation message when alignment fails.

VERIFICATION COMMANDS (recommended)
- `npm run install:hooks`
- `npm run verify:release`
- `npm run prep:release`

RISKS / ROLLBACK
- Risk: low; failures indicate release artifacts not committed.
- Rollback: revert this commit.
