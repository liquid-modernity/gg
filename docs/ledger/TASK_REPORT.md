TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0006B
TITLE: Boot loader + late-load main.js (Phase 2 step 1)

TASK_SUMMARY
- Added a tiny `boot.js` loader so initial HTML does not reference `main.js` directly.
- Swapped dev/prod themes to load only `boot.js` (defer) and removed `instant.page` from HTML.
- `boot.js` now loads `main.js` after idle/interaction and loads `instant.page` only after `main.js` in PROD.
- Updated release tooling to version `boot.js` and updated asset verification and budgets.
- Updated CRP plan and ledger state.

FILES_CHANGED
- public/assets/latest/boot.js
- index.dev.xml
- index.prod.xml
- tools/release.js
- tools/verify-assets.mjs
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
1) Open Chrome DevTools → Performance.
2) Disable cache, CPU 4x throttle, cold reload.
3) Confirm only `boot.js` loads at first paint.
4) Confirm `main.js` loads after idle/interaction (Network + Timing).
5) Check for no long tasks > 50 ms before `main.js` executes.

BEHAVIOR CHECKS
- DEV: boot.js loads `/assets/latest/main.js` after idle/interaction; SW remains off as before.
- PROD: boot.js loads `/assets/v/<RELEASE_ID>/main.js` after idle/interaction; instant.page loads only after main.js.
- Native Blogger comments still work (no interception added).

RISKS / ROLLBACK
- Risk: initial interactivity is delayed until main.js loads.
- Rollback: revert this commit.
