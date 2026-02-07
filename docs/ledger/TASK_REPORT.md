TASK_REPORT
Last updated: 2026-02-07

TASK_ID: TASK-0008A.2
TITLE: Add minimal Critical CSS in b:skin (shell + surface control + ATF baseline)

TASK_SUMMARY
- Added a tiny GG_CRITICAL_CSS v1 block in b:skin for shell layout, baseline typography, focus ring, and reduced-motion scroll disable.
- Added surface anti-flash rules for landing wrapper based on data-gg-surface.
- Updated inline CSS budget to the minimal required size.

VISIBLE CHANGES
- Less layout shift before main.css loads (container and header baseline).
- Landing surface no longer flashes on non-landing surfaces.
- Keyboard focus ring visible before main.css.

INLINE BUDGET
- Before: 1467 bytes max (prod/dev).
- After: 2359 bytes max (prod/dev).
- Current inline bytes: 2359 (style=812, skin=1547).

CONSTRAINTS CONFIRMED
- No new JS.
- No new external fonts.
- No template structure changes beyond inline CSS.
- Blogger comments untouched.

CHANGES
- index.prod.xml
- index.dev.xml
- tools/critical-inline-budget.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS (manual)
- `npm run build`
- `npm run verify-inline-css`
- `npm run verify:xml`
- `npm run verify:budgets`
- `npm run verify:assets`

RISKS / ROLLBACK
- Risk: low; inline CSS only.
- Rollback: revert this commit.
