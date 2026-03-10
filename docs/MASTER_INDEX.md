# MASTER_INDEX
Last updated: 2026-03-11

## 1) Active Source Of Truth
- Live production behavior / final DOM is authoritative.
- Runtime template: `index.prod.xml`
- Worker runtime: `src/worker.js`
- Runtime assets (authoring): `public/assets/latest/**`
- Runtime assets (pinned): `public/assets/v/<release-id>/**`
- Release stamp/sync: `tools/release.js`

## 2) Orchestration Entry Points (active)
- Daily local blocking:
  - `npm run verify:p0`
  - `npm run verify:p1`
- Reference/manual:
  - `npm run verify:p2`
- Final local gate before push:
  - `npm run preflight:ship`
- One-command operator flow:
  - `npm run ship`
- CI:
  - `.github/workflows/ci.yml`
- Deploy:
  - `.github/workflows/deploy.yml`

## 3) Verify Tier Map
### P0 (blocking, 6 checks max)
`npm run verify:p0`
- `npm run verify:release`
- `npm run verify:assets`
- `npm run verify:xml`
- `npm run verify:template-contract`
- `npm run verify:template-hygiene`
- `node tools/verify-postmeta-contract.mjs`

### P1 (runtime quality, load-bearing)
`npm run verify:p1`
- `node tools/verify-runtime-core-features.mjs`
- `node tools/verify-runtime-surface-landing-panels.mjs`
- `node tools/verify-runtime-secondary-features.mjs`
- `node tools/verify-router-contract.mjs`
- `node tools/verify-dock-contract.mjs`
- `node tools/verify-ui-guardrails.mjs`

### P2 (reference / governance, not daily blocker)
`npm run verify:p2`
- `node tools/verify-ledger.mjs`
- `npm run verify:template-fingerprint`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/verify-budgets.mjs`
- `npm run verify-inline-css`
- `node tools/verify-crp.mjs`

## 4) Current Call Graph
### Local
`ship`
-> `preflight:ship`
-> `prep:release` (`npm ci` + `npm run build`)
-> `verify:p0`
-> `verify:p1`
-> `verify:p2`
-> commit/push

### CI
`.github/workflows/ci.yml`
-> `npm ci`
-> `npm run build`
-> `npm run verify:p0`
-> `npm run verify:p1`
-> `npm run verify:p2`
-> build determinism check

### Deploy
`.github/workflows/deploy.yml`
-> trigger: `workflow_run` (`CI` success on `main`) or `workflow_dispatch`
-> `npm ci`
-> quick sanity (`verify:release` + `verify:assets`)
-> `wrangler deploy`
-> `bash tools/gate-release-live.sh`
-> `bash tools/smoke.sh` (strict live mode) + live header/palette checks

## 5) Downranked / Reference-Only Checks
These remain as tools but are not in daily P0/P1:
- `tools/verify-perf-workflow-contract.mjs`
- `tools/verify-perf-history-contract.mjs`
- `tools/verify-perf-urls-ssot.mjs`
- granular `verify-no-*/verify-*-policy` checks previously chained one-by-one in `gate-prod.sh`
- direct ad-hoc long smoke sub-checks replaced by minimal live smoke orchestration

## 6) Operator Runbook
### Daily
1. `npm run verify:p0`
2. `npm run verify:p1`

### Before push
1. `npm run preflight:ship`
2. `npm run ship`

### When auditing governance/perf
1. `npm run verify:p2`
2. Optional: run individual `tools/verify-live-*.mjs` as needed
