TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-PERF-TREND-HISTORY-BRANCH-20260222
TITLE: Add perf-history branch writer + dashboard builder

SUMMARY
- Added CI history persistence scripts:
  - `tools/perf/perf-history-append.mjs`
  - `tools/perf/perf-history-build.mjs`
- Updated `perf-lighthouse` workflow to persist trend to append-only branch `perf-history`:
  - fetch/switch worktree for `perf-history`
  - append one NDJSON record per run (`perf/history.ndjson`)
  - build `perf/latest.json` and `perf/index.html`
  - commit + push to `perf-history`
- Added append-only guard in workflow (`history.ndjson` must grow).
- Added contract verifier `tools/verify-perf-history-contract.mjs` and wired it into `gate:prod`.
- Updated docs with branch/data model and viewing guidance in `docs/perf/PERF_HISTORY.md` and `docs/perf/CI_LIGHTHOUSE.md`.

ARTIFACTS / DATA TARGET
- `perf-history` branch files:
  - `perf/history.ndjson`
  - `perf/latest.json`
  - `perf/index.html`
- Existing workflow artifacts remain:
  - `.lighthouseci` bundle
  - `.lighthouseci/trend.json`

FILES CHANGED
- tools/perf/perf-history-append.mjs
- tools/perf/perf-history-build.mjs
- .github/workflows/perf-lighthouse.yml
- docs/perf/PERF_HISTORY.md
- tools/verify-perf-history-contract.mjs
- tools/verify-perf-workflow-contract.mjs
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
VERIFY_RULEBOOKS: PASS
VERIFY_RELEASE_ALIGNED: PASS
VERIFY_PERF_WORKFLOW_CONTRACT: PASS
VERIFY_PERF_HISTORY_CONTRACT: PASS
PASS: perf URLs SSOT aligned
VERIFY_BUDGETS: PASS
PASS: smoke tests (offline fallback)
PASS: gate:prod
```

WORKFLOW DRY-RUN SANITY (STATIC)
- Workflow includes:
  - `permissions: contents: write`
  - `git fetch origin perf-history:perf-history`
  - `git push origin perf-history`
  - trend append + build steps
- Local environment cannot execute GitHub-token push to remote branch; this is validated in CI run context.
