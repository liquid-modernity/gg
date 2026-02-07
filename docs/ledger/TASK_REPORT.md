TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008A.1.2
TITLE: Implement focus-ring fallback + reduced-motion scroll disable + remove orphan assets/v/59ac756

TASK_SUMMARY
- Set focus ring tokens to a safe baseline and added a color-mix enhancement behind @supports.
- Extended reduced-motion overrides to disable smooth scrolling globally.
- Removed orphan release folder public/assets/v/59ac756.

VISIBLE CHANGES
- Focus ring stays visible even without color-mix support.
- Reduced-motion users no longer get smooth scrolling.

CONSTRAINTS CONFIRMED
- CSS-only changes.
- No new JS.
- No new resources.
- No HTML edits.

CHANGES
- public/assets/latest/main.css
- public/assets/v/59ac756 (deleted)
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run ship` (FAILED: .git/index.lock permission in this environment)

RISKS / ROLLBACK
- Risk: low; CSS-only + cleanup.
- Rollback: revert this commit.
