# CI/CD Pipeline
Last updated: 2026-02-06

This repo is main-only. CI is the **primary gate**. Deployments are on `main` only. Wrangler runs in GitHub Actions only (macOS 10.15 local is unsupported).

**Triggers**
- CI workflow name: `CI` (runs on `push` to `main` and `pull_request`).
- Deploy workflow triggers from `CI` via GitHub API dispatch (`deploy.yml`) after `CI` succeeds on `main`.
- Manual deploy uses `workflow_dispatch`, but it still runs the full preflight gate and asserts the dispatch branch is `main` (no bypass).

**CI Gate (Primary)**
- `npm ci` (requires committed `package-lock.json`)
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-theme-diff.mjs` (if present)
- `bash tools/check-links.sh` (if present)
- XML well-formedness check (xmllint if available, else `node tools/validate-xml.js`)
- `node tools/verify-router-contract.mjs`
- `node tools/verify-headers.mjs --mode=config` (deterministic, no network)
- `node tools/verify-budgets.mjs` (deterministic, no network)

**Lockfile Policy**
- `package-lock.json` is mandatory and must be committed.
- CI and deploy both use `npm ci` with no lockfile generation fallback.
- To update dependencies, run: `npm install --package-lock-only --ignore-scripts`, then commit `package-lock.json`.

**Ledger Sync Policy**
- `docs/ledger/GG_CAPSULE.md` contains an AUTOGEN block for release metadata.
- `tools/release.js` updates the AUTOGEN block during `npm run build`.
- Do not edit `RELEASE_ID` manually; CI and deploy run `tools/verify-ledger.mjs` and fail on drift.
- **Release truth:** GG_CAPSULE AUTOGEN is canonical. `docs/ledger/TASK_LOG.md` must not contain `RELEASE_ID` (use `RELEASE_REF: GG_CAPSULE AUTOGEN`), enforced by `tools/verify-ledger.mjs`.

**Performance Budgets**
- Budgets are defined in `tools/perf-budgets.json` and checked by `tools/verify-budgets.mjs`.
- CI runs `node tools/verify-budgets.mjs` after build (deterministic, no network).
- Deploy preflight also runs `node tools/verify-budgets.mjs` to prevent regressions.
- To update budgets, rebuild, measure current sizes, then update `tools/perf-budgets.json` with a 15% buffer and commit.

**Wrangler Policy**
- Wrangler is CI-only; local deploy is unsupported.
- Deploy installs pinned Wrangler CLI via `npm install --no-save wrangler@4.61.1`.
- Deploy runs `./node_modules/.bin/wrangler deploy --config wrangler.jsonc`.

**Preflight Gate (Deploy Workflow)**
Manual dispatch does not bypass gates. It runs the same preflight verifiers.
- `npm ci`
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-theme-diff.mjs` (if present)
- `bash tools/check-links.sh` (if present)
- `node tools/verify-ledger.mjs`
- `node tools/verify-router-contract.mjs`
- `node tools/verify-budgets.mjs`
- `node tools/verify-inline-css.mjs`
- `node tools/verify-crp.mjs`
- `node tools/verify-headers.mjs --mode=config`

**Deploy**
- Uses pinned local Wrangler CLI from `node_modules` with `wrangler.jsonc`.
- Worker name: `gg`.
- After deploy, the workflow runs: `node tools/verify-headers.mjs --mode=live --base=https://www.pakrpp.com`.

**Smoke Tests (Always After Deploy)**
- `https://pakrpp.com/*` returns `301` redirect to `https://www.pakrpp.com/`.
- `https://www.pakrpp.com/__gg_worker_ping` returns `200` and includes `x-gg-worker-version`.
- `https://www.pakrpp.com/gg-flags.json` has `Cache-Control: no-store` (or `max-age=0`).
- `https://www.pakrpp.com/sw.js` has `Cache-Control: no-store` (or `max-age=0`).
- `https://www.pakrpp.com/assets/latest/main.js` returns `200` and is not cached (`no-store` or `max-age=0`).
- `https://www.pakrpp.com/assets/v/<REL>/main.js` returns `200` and is `immutable`.
- `https://www.pakrpp.com/offline.html` returns `200`.

**Concurrency**
- Deploy workflow uses a single `deploy-main` concurrency group to prevent overlapping deploys.
