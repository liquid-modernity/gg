TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0001.6
TITLE: Update gg verify paths after dev→latest rename and TASK_REPORT rename

TASK_SUMMARY
- Updated `tools/scripts:gg` to look for assets in `public/assets/latest/` instead of `public/assets/dev/`.
- Updated task report discovery to accept `TASK_REPORT.md` (and `docs/ledger/TASK_REPORT.md`).
- Updated verify warnings/help text to reference the new names.

FILES_CHANGED
- tools/scripts:gg
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION
- Ran: `./scripts/gg verify`
- Result: PASSED

RISKS / ROLLBACK
- Risk: none (path detection only).
- Rollback: revert `tools/scripts:gg` changes.
