TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008B.1
TITLE: XML A11y baseline: semantic landmarks + skip link + main target

TASK_SUMMARY
- Added a skip link immediately after <body> and made the main region focusable.
- Labeled primary navigation and kept existing landmarks intact.
- Extended critical inline CSS to support skip link visibility/focus.
- Updated inline CSS budget with minimal headroom.

A11Y CHECKLIST
- Skip link present and visible on focus.
- Main content targetable via id="gg-main" and tabindex="-1".
- Primary nav has aria-label="Primary".

INLINE BUDGET
- Before: 2455 bytes max (prod/dev).
- After: 2725 bytes max (prod/dev).
- Current inline bytes: 2629 (style=812, skin=1817).
- Headroom: +96 bytes to avoid micro-drift failures.

CONSTRAINTS CONFIRMED
- No new JS.
- No new fonts/resources.
- Blogger comments untouched.

CHANGES
- index.prod.xml
- index.dev.xml
- tools/critical-inline-budget.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `node tools/verify-inline-css.mjs`
- `npm run verify:xml`
- `node tools/verify-budgets.mjs`
- `npm run verify:assets`

RISKS / ROLLBACK
- Risk: low; minimal markup + inline CSS.
- Rollback: revert this commit.
