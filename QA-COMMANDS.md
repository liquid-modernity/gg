# QA Commands

This file is the command index for local hardening, deploy preparation, and live smoke. Run commands from the repository root.

## Standard Local Contract Set

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:qa
```

## Store Development Set

```bash
npm run store:build
npm run store:proof
npm run store:check:ci
npm run store:check:dev10
npm run gaga:verify-store-artifact
```

## Blogger Template Set

```bash
npm run gaga:template:pack
npm run gaga:template:proof
npm run gaga:template:status
```

`npm run gaga:template:pack` writes `dist/blogger-template.publish.xml`, `dist/blogger-template.publish.txt`, `__gg/assets/*`, and `dist/assets/*` from source. Do not edit those generated outputs as the primary fix.

## Cloudflare Deploy Preparation Set

```bash
npm run build
npm run ci:cloudflare
npm run deploy:cloudflare:dry
```

`npm run ci:cloudflare` runs Store CI, the aggregate QA guard chain, and Worker shell syntax validation. It prepares static artifacts through build/staging scripts but does not deploy.

## Cloudflare Deploy Set

```bash
npm run deploy:cloudflare
```

Deploy only after local contract and Cloudflare CI gates pass.

## Live Smoke Set

Run live smoke after deploy or when a task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

For a local/live smoke variant that allows the known global timeout warning:

```bash
npm run gaga:verify-worker-live:local
```

Set a different target with:

```bash
GG_LIVE_BASE_URL=https://www.pakrpp.com npm run gaga:verify-worker-live:strict
```

## Aggregate Commands

```bash
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` or command exit failure must be treated as failing.
