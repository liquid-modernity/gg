# Task 03 — GitHub Actions & Cloudflare Deploy Reconciliation

## Objective

Ensure GitHub Actions, Cloudflare deployment, and live smoke testing are deterministic, documented, and aligned with aggregate npm scripts.

## Current Known Workflows

The repo should include these workflows:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
```

Known intended behavior:

```txt
ci.yml:
  npm ci
  npm run ci:cloudflare

deploy-cloudflare.yml:
  npm ci
  npm run ci:cloudflare
  npm run deploy:cloudflare:prepared
  npm run gaga:verify-worker-live:strict

lighthouse-ci.yml:
  scheduled/manual performance check
  advisory/non-blocking
```

## Hard Constraints

- GitHub Actions must call aggregate npm scripts, not duplicate long command lists.
- Cloudflare deploy must run only after `npm run ci:cloudflare` passes.
- Live strict smoke must run after deploy.
- Lighthouse/performance checks are advisory unless strict release mode is explicitly requested.
- Missing workflow files must be treated as `CONTRACT_FAILURE` after this task is complete in repo/deployable-archive mode.
- Do not expose secrets.
- Do not replace deploy command with ad-hoc Wrangler commands inside workflow unless package scripts are updated and documented.
- Do not introduce Worker HTMLRewriter deployment paths as a fix for Blogger/source output defects.

## Required Work

### 1. Verify Workflow Presence

In repo/deployable archive mode, require:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
```

If absent, fail with:

```txt
CONTRACT_FAILURE: required GitHub workflow missing
```

If this is a limited task pack, workflows may be omitted only with explicit `HANDOFF-MANIFEST.md` declaration.

### 2. Verify Aggregate Script Usage

The workflows must use:

```txt
npm ci
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

Do not duplicate tool chains inside YAML.

### 3. Verify Deploy Ordering

Required order:

```txt
checkout
setup node
npm ci
npm run ci:cloudflare
deploy prepared Cloudflare build
strict live smoke
upload diagnostics on failure
```

### 4. Verify Environment Contract

Ensure documented env vars include:

```txt
GG_LIVE_BASE_URL
GG_LIVE_RETRIES
GG_LIVE_RETRY_DELAY_SECONDS
GG_LIVE_TIMEOUT_SECONDS
GG_LIVE_CONNECT_TIMEOUT_SECONDS
GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN
STORE_CI
GG_STORE_MODE
STORE_REQUIRE_LIVE_FEED
STORE_STRICT_IMAGES
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

### 5. Handoff Packaging

Ensure deployable archives preserve `.github` dotfolder.

## Acceptance Criteria

- Workflow files exist in deployable repo/archive.
- CI calls `npm run ci:cloudflare`.
- Deploy calls `npm run ci:cloudflare` before Cloudflare deploy.
- Deploy uses `npm run deploy:cloudflare:prepared`.
- Deploy runs `npm run gaga:verify-worker-live:strict` after deployment.
- Lighthouse is advisory/non-blocking during development.
- Missing workflows fail only in repo/deployable mode, not in task-pack-only mode.


## Worker Deploy Boundary

Deployment may stage and deploy the Worker, but the workflow must not normalize broken Blogger/source HTML by edge rewriting. `deploy-cloudflare.yml` should deploy verified artifacts produced from source; it should not become a hidden second rendering pipeline.

Acceptance addition:

```txt
Worker deploy path remains governance/static routing/staging only.
No workflow step introduces HTMLRewriter-based post/page repair.
```
