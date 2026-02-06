TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.6
TITLE: Deterministic Release ID (content digest)

TASK_SUMMARY
- Release id is now computed from a normalized content digest (not git HEAD).
- release.js uses compute-release-id; verify-release-aligned expects the digest.

CHANGES
- tools/compute-release-id.mjs
- tools/release.js
- tools/verify-release-aligned.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- Build should be idempotent when inputs are unchanged.

VERIFICATION COMMANDS (recommended)
- `npm run build` (twice; expect no diffs on second run)
- `node tools/verify-release-aligned.mjs`

RISKS / ROLLBACK
- Risk: low; normalization bugs could change release id unexpectedly.
- Rollback: revert this commit.
