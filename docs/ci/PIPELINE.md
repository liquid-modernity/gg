# CI/CD Pipeline
Last updated: 2026-02-05

This repo is main-only. CI is the **primary gate**. Deployments are on `main` only. Wrangler runs in GitHub Actions only (macOS 10.15 local is unsupported).

**Triggers**
- CI workflow name: `CI` (runs on `push` to `main` and `pull_request`).
- Deploy workflow triggers automatically on `workflow_run` when `CI` completes successfully on `main`.
- Manual deploy uses `workflow_dispatch`, but it still runs the full preflight gate and asserts the dispatch branch is `main`.

**CI Gate (Primary)**
- `npm ci` (requires committed `package-lock.json`)
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-theme-diff.mjs` (if present)
- `bash tools/check-links.sh` (if present)
- XML well-formedness check (xmllint if available, else `node tools/validate-xml.js`)
- `node tools/verify-headers.mjs --mode=config` (deterministic, no network)

**Lockfile Policy**
- `package-lock.json` is mandatory and must be committed.
- CI and deploy both use `npm ci` with no lockfile generation fallback.
- To update dependencies, run: `npm install --package-lock-only --ignore-scripts`, then commit `package-lock.json`.

**Ledger Sync Policy**
- `docs/ledger/GG_CAPSULE.md` contains an AUTOGEN block for release metadata.
- `tools/release.js` updates the AUTOGEN block during `npm run build`.
- Do not edit `RELEASE_ID` manually; CI and deploy run `tools/verify-ledger.mjs` and fail on drift.

**Wrangler Policy**
- Wrangler is CI-only; local deploy is unsupported.
- Deploy uses `cloudflare/wrangler-action` with a pinned version.
- Pinned version is defined in `.github/workflows/deploy.yml` (`wranglerVersion`).

**Preflight Gate (Deploy Workflow)**
- `npm ci`
- `npm run build`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-theme-diff.mjs` (if present)
- `bash tools/check-links.sh` (if present)

**Deploy**
- Uses `cloudflare/wrangler-action` with `wrangler.jsonc`.
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
