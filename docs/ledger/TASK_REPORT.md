TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.5
TITLE: Local Push Guard + One-Command Release Prep

TASK_SUMMARY
- Added `verify-release-aligned` to assert pinned release artifacts match HEAD.
- Added `prep:release` to run build + alignment verification in one command.
- Added opt-in `install-hooks` to install a pre-push hook that blocks misaligned releases.

CHANGES
- tools/verify-release-aligned.mjs
- tools/install-hooks.mjs
- package.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- `prep:release` runs `tools/release.js` and therefore requires a clean tree.

VERIFICATION COMMANDS (recommended)
- `npm run verify:release`
- `npm run prep:release`
- `node tools/install-hooks.mjs`

RISKS / ROLLBACK
- Risk: low; failures indicate release artifacts do not match HEAD.
- Rollback: revert this commit.
