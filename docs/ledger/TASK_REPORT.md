TASK_REPORT
Last updated: 2026-02-05

TASK_ID: TASK-0005
TITLE: Headers contract + deterministic verifier (CI) + live verifier (deploy)

TASK_SUMMARY
- Added a single-source headers contract in `docs/perf/HEADERS_CONTRACT.md` and `tools/headers-contract.json`.
- Implemented `tools/verify-headers.mjs` with config and live modes.
- Wired config-mode into CI and live-mode into deploy workflow.
- Aligned Worker + `_headers` with the contract for manifest/offline caching.

FILES_CHANGED
- docs/perf/HEADERS_CONTRACT.md
- tools/headers-contract.json
- tools/verify-headers.mjs
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- docs/ci/PIPELINE.md
- src/worker.js
- public/_headers
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION COMMANDS
- `node tools/verify-headers.mjs --mode=config`
- `node tools/verify-ledger.mjs`

CI/DEPLOY HOOKS
- CI runs: `node tools/verify-headers.mjs --mode=config` (deterministic, no network).
- Deploy runs: `node tools/verify-headers.mjs --mode=live --base=https://www.pakrpp.com` after deploy.

CONTRACT ENFORCED (HIGHLIGHTS)
- `/assets/latest/*` is no-store.
- `/assets/v/<RELEASE_ID>/*` is public, immutable, max-age>=31536000.
- `/sw.js` and `/gg-flags.json` are no-store.
- `/manifest.webmanifest` and `/offline.html` are no-store.
- Apex must redirect to `https://www.pakrpp.com/`.

HOW TO VERIFY IN ACTIONS
1) CI → step “Verify headers contract (config)” should pass.
2) Deploy → step “Verify headers contract (live)” should pass after publish.

RISKS / ROLLBACK
- Risk: live verification fails if production headers drift.
- Rollback: revert this commit.
