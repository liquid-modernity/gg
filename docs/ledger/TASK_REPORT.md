TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006C
TITLE: CSS/fonts CRP stabilization

TASK_SUMMARY
- Reduced font render-blocking by using `display=swap` and removing the unused Material Symbols Outlined request.
- Switched `main.css` to non-blocking load via `preload` + `onload`, with a minimal inline critical CSS fallback.
- Updated CRP plan and ledger state.

FILES_CHANGED
- index.dev.xml
- index.prod.xml
- tools/perf-budgets.json
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `npm run build`
- `npm run verify:assets`
- `node tools/verify-budgets.mjs`
- `node tools/verify-ledger.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/validate-xml.js`

PERF MEASUREMENT (DevTools)
1) Performance: cold reload, CPU 4x throttle, verify no FOIT and reduced blocking before `main.css` loads.
2) Coverage: confirm inline critical CSS is small and `main.css` loads via `preload` then `stylesheet`.
3) Network: confirm only Material Symbols Rounded font CSS request and it includes `display=swap`.

BEHAVIOR CHECKS
- DEV: boot.js loads main.js after idle/interaction; CSS applies after preload with minimal FOUC.
- PROD: same as DEV, with font swap behavior; visuals remain consistent.

RISKS / ROLLBACK
- Risk: brief FOUC possible if preload is delayed on very slow networks.
- Rollback: revert this commit.
