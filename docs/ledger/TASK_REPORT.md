TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006E
TITLE: Boot policy tuning + CRP regression guard

TASK_SUMMARY
- Tuned `boot.js` so PROD waits for `window.load` then idle (timeout 5000) before auto-loading `main.js`; user interaction still triggers immediate load.
- Added deterministic CRP regression verifier `tools/verify-crp.mjs` and wired it into CI.
- Updated CRP plan and ledger state.

FILES_CHANGED
- public/assets/latest/boot.js
- tools/verify-crp.mjs
- .github/workflows/ci.yml
- docs/perf/CRP_PLAN.md
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-inline-css.mjs`
- `node tools/verify-crp.mjs`
- `npm run verify:assets`
- `node tools/verify-budgets.mjs`
- `node tools/verify-ledger.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/validate-xml.js`

PERF MEASUREMENT (DevTools)
1) Performance: cold reload and confirm `main.js` auto-load waits for `window.load` + idle in PROD.
2) Interaction: pointerdown/keydown should load `main.js` immediately.
3) Coverage: ensure no main.js in HTML and no blocking font CSS.

RISKS / ROLLBACK
- Risk: main.js may load later on slow pages if no interaction occurs.
- Rollback: revert this commit.
