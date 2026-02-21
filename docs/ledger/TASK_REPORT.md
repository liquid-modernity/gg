TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-BASELINE-SYNC-URLS-SSOT-20260222
TITLE: Add URLS SSOT and enforce baseline/CI alignment

SUMMARY
- Converted `docs/perf/URLS.json` into strict SSOT schema using `urls.home`, `urls.listing`, and `urls.post`.
- Updated `docs/perf/BASELINE.md` to explicitly declare SSOT and include the exact URLs from `URLS.json`.
- Updated `lighthouse/lighthouserc.ci.js` to read `docs/perf/URLS.json` only (removed BASELINE fallback parsing).
- Added `tools/verify-perf-urls-ssot.mjs` to fail on drift across URLS/BASELINE/LHCI config.
- Wired SSOT verifier into `tools/gate-prod.sh`.
- Updated `docs/perf/CI_LIGHTHOUSE.md` with SSOT usage guidance.

FILES CHANGED
- docs/perf/URLS.json
- docs/perf/BASELINE.md
- lighthouse/lighthouserc.ci.js
- tools/verify-perf-urls-ssot.mjs
- tools/gate-prod.sh
- docs/perf/CI_LIGHTHOUSE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/verify-perf-urls-ssot.mjs`
```text
PASS: perf URLs SSOT aligned
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
PASS: perf URLs SSOT aligned
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- `docs/perf/URLS.json` post URL is now pinned to `https://www.pakrpp.com/2026/02/todo.html` per SSOT contract for baseline and CI.
