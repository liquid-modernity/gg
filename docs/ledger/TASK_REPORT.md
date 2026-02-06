TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006D
TITLE: Fonts non-blocking + inline CSS budget guard

TASK_SUMMARY
- Switched Google Fonts CSS to non-blocking preload+onload with noscript fallback in dev/prod.
- Added deterministic inline CSS budget guard (`tools/critical-inline-budget.json` + `tools/verify-inline-css.mjs`).
- Wired inline CSS budget check into CI.
- Updated CRP plan and ledger state.

FILES_CHANGED
- index.dev.xml
- index.prod.xml
- tools/critical-inline-budget.json
- tools/verify-inline-css.mjs
- .github/workflows/ci.yml
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-inline-css.mjs`
- `npm run build`
- `npm run verify:assets`
- `node tools/verify-budgets.mjs`
- `node tools/verify-ledger.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/validate-xml.js`

PERF MEASUREMENT (DevTools)
1) Network: confirm fonts CSS loads via preload and no blocking stylesheet request.
2) Coverage: inline critical CSS stays minimal; main.css remains async.
3) Performance: cold load, check no FOIT and stable LCP.

BEHAVIOR CHECKS
- DEV: boot.js loads main.js after idle/interaction; fonts swap behavior applied.
- PROD: fonts CSS non-blocking; noscript fallback present; no UI regressions.

RISKS / ROLLBACK
- Risk: brief FOUC if font CSS preload delays on slow networks.
- Rollback: revert this commit.
