TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-GH-PAGES-PERF-DASHBOARD-20260222
TITLE: Link perf dashboard + perf-history branch

SUMMARY
- Added GitHub Pages handoff pointers in `docs/perf/PERF_HISTORY.md` with explicit placeholder `DASHBOARD_URL: XXX` until Pages publish URL is confirmed.
- Added CI Step Summary pointer block in `.github/workflows/perf-lighthouse.yml` so every run prints:
  - dashboard URL (or setup hint if still placeholder)
  - latest snapshot path (`perf-history/perf/latest.json`)
  - history log path (`perf-history/perf/history.ndjson`)
- Kept dashboard output path Pages-friendly and unchanged (`perf/index.html` on `perf-history`).

MANUAL ACTION REQUIRED (GITHUB SETTINGS)
- Enable GitHub Pages in repository settings:
  1) Source: Deploy from a branch
  2) Branch: perf-history
  3) Folder: /perf
- After GitHub confirms published URL, replace `DASHBOARD_URL: XXX` in `docs/perf/PERF_HISTORY.md`.

FILES CHANGED
- docs/perf/PERF_HISTORY.md
- .github/workflows/perf-lighthouse.yml
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/43b6882/*

VERIFICATION OUTPUTS
- `node tools/verify-perf-history-contract.mjs`
```text
VERIFY_PERF_HISTORY_CONTRACT: PASS
```

- `node tools/verify-perf-workflow-contract.mjs`
```text
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
```

- `npm run gate:prod`
```text
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
VERIFY_PERF_HISTORY_CONTRACT: PASS
PASS: perf URLs SSOT aligned
PASS: font policy
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

NOTES
- Local environment cannot perform repository Settings -> Pages operations, so this task ships with explicit manual setup guidance and placeholder URL contract.
