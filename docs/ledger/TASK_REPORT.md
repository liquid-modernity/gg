TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A.3
TITLE: Repo Truthfulness + Lockfile Policy Alignment

TASK_SUMMARY
- Stop ignoring package-lock.json so lockfile policy matches CI guard.
- Correct GG_CAPSULE NOW/NEXT/LAST_PATCH to reflect current state (idle-only UI prefetch + 7A.3).
- Added capsule truth verifier and wired it into verify-ledger.

CHANGES
- .gitignore
- docs/ledger/GG_CAPSULE.md
- tools/verify-capsule-truth.mjs
- tools/verify-ledger.mjs
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

NOTES
- No build run for this task.
- Capsule truth check only applies if GG_CAPSULE claims "no auto-init UI"; it will fail if core.js calls requestUi('idle').

VERIFICATION COMMANDS (recommended)
- `node tools/verify-ledger.mjs`
- `node tools/verify-capsule-truth.mjs`

RISKS / ROLLBACK
- Risk: low; failures indicate doc/code mismatch.
- Rollback: revert this commit.
