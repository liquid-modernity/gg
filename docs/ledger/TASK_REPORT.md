TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-AUTOMEASURE-CI-20260222
TITLE: Add Lighthouse CI live perf workflow + summary + artifacts

SUMMARY
- Added live Lighthouse CI workflow with deterministic triggers:
  - `workflow_run` after deploy workflow (`Deploy to Cloudflare Workers`) completes successfully on `main`
  - daily `schedule` (02:30 Asia/Jakarta)
  - `workflow_dispatch` manual run
- Added Lighthouse CI config that reads hard ceilings from `docs/perf/BUDGETS.json` and URLs from `docs/perf/URLS.json`.
- Added summary generator that parses `.lighthouseci/*.report.json` and writes markdown table to stdout + GitHub Step Summary.
- Added optional temporary public storage upload step for quick links, while keeping `.lighthouseci` artifact upload as source-of-truth evidence.
- Added verifier contract and wired it into `gate:prod`.

FILES CHANGED
- .github/workflows/perf-lighthouse.yml
- lighthouse/lighthouserc.ci.js
- tools/perf/lhci-summary.mjs
- tools/verify-perf-workflow-contract.mjs
- tools/gate-prod.sh
- docs/perf/CI_LIGHTHOUSE.md
- docs/perf/URLS.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/<RELEASE_ID>/*

TRIGGER CONTRACT
- `workflow_run`: references exact deploy workflow name `Deploy to Cloudflare Workers`.
- `schedule`: `30 19 * * *` UTC (02:30 Asia/Jakarta).
- `workflow_dispatch`: manual ad-hoc run.

VERIFICATION OUTPUTS
- `node tools/verify-perf-workflow-contract.mjs`
```text
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
```

- `npm run gate:prod`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

MANUAL NOTES
- Live Lighthouse execution is performed by GitHub Actions workflow on live URLs.
- Local sandbox cannot resolve live DNS in this environment, so live-run proof is produced in CI artifacts/summary.
