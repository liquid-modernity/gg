TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-TREND-ARTIFACTS-20260222
TITLE: Add perf trend.json artifact and ratchet diff summary

SUMMARY
- Added `tools/perf/lhci-trend.mjs` to produce `.lighthouseci/trend.json` from Lighthouse LHR files.
- Trend output stores one aggregated record per URL key (`home`, `listing`, `post`) with:
  - performance score, LCP, CLS, INP, TBT, transfer KB
  - timestamp + short commit
  - ratchet pass/fail + reasons against `docs/perf/BUDGETS.json`.
- Updated `.github/workflows/perf-lighthouse.yml`:
  - run trend step after summary step
  - upload dedicated artifact `.lighthouseci/trend.json`
  - keep full `.lighthouseci` artifact upload.
- Updated perf workflow contract verifier to enforce trend step and trend artifact upload.
- Updated `docs/perf/CI_LIGHTHOUSE.md` with trend artifact location/fields and comparison guidance.

ARTIFACT PATHS
- `.lighthouseci/trend.json` (generated in workflow)
- GitHub Actions artifacts:
  - `lighthouseci-<run_id>` (full reports)
  - `lighthouse-trend-<run_id>` (trend JSON only)

FILES CHANGED
- tools/perf/lhci-trend.mjs
- .github/workflows/perf-lighthouse.yml
- tools/verify-perf-workflow-contract.mjs
- docs/perf/CI_LIGHTHOUSE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

VERIFICATION OUTPUTS
- `node tools/perf/lhci-trend.mjs` (local fixture execution)
```text
PASS: lhci trend artifact -> .lighthouseci/trend.json
```

- `node tools/verify-perf-workflow-contract.mjs`
```text
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
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
- Trend step is CI tooling only; no runtime JS/CSS behavior was changed.
