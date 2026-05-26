# QA Commands

This file is the command index for local hardening, deploy preparation, and live smoke. Run commands from the repository root.

## Standard Local Contract Set

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-semantic-ssr
npm run gaga:verify-schema-jsonld
npm run gaga:verify-registry-contract
npm run gaga:verify-a11y-static
npm run gaga:verify-asset-architecture
npm run gaga:verify-cleanup
npm run gaga:verify-css-sot-cleanup
npm run gaga:verify-css-module-wiring
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-sheet-search-visual-parity
npm run gaga:verify-85
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
npm run ci:85
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
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

Deploy only after local contract and Cloudflare CI gates pass. `deploy:cloudflare:prepared` uses the Cloudflare deploy wrapper without rebuilding Store/template artifacts first; this keeps the deploy workflow tied to the artifact state verified by `ci:cloudflare`. The deploy wrapper still reruns preflight and Cloudflare preparation from the verified source/artifact tree.

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
npm run ci:85
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` or command exit failure must be treated as failing.

`npm run gaga:verify-85` is the final readiness gate for crawlability, production/development indexing flags, route truth, performance budget notes, artifact parity, and deploy readiness. It is read-only and may return `PASS_WITH_WARNINGS` for documented development-mode or advisory Lighthouse/performance warnings.

## Mandatory Guards

These read-only guards are mandatory and must remain wired through `package.json` and the aggregate `ci:qa`/`ci:cloudflare` chain:

- `qa/ci-reconciliation-guard.mjs`
- `qa/a11y-static-guard.mjs`
- `qa/asset-architecture-guard.mjs`
- `qa/cleanup-regression-guard.mjs`
- `qa/comments-proof-guard.mjs`
- `qa/component-source-contract-guard.mjs`
- `qa/copy-registry-guard.mjs`
- `qa/css-module-bundle-wiring-guard.mjs`
- `qa/css-source-of-truth-cleanup-guard.mjs`
- `qa/discovery-contract-guard.mjs`
- `qa/discovery-filter-taxonomy-guard.mjs`
- `qa/docs-contract-guard.mjs`
- `qa/semantic-ssr-guard.mjs`
- `qa/schema-jsonld-guard.mjs`
- `qa/registry-contract-guard.mjs`
- `qa/repo-structure-tidy-guard.mjs`
- `qa/sheet-search-visual-parity-guard.mjs`
- `qa/nav-more-contract-guard.mjs`
- `qa/preview-sheet-contract-guard.mjs`
- `qa/readiness-85-guard.mjs`
- `qa/sheet-lifecycle-contract-guard.mjs`
- `qa/sheet-runtime-overflow-viewport-guard.mjs`
- `qa/shell-interaction-guard.mjs`
- `qa/store-isolation-guard.mjs`
- `qa/store-modal-preview-reliability-guard.mjs`
- `qa/template-fingerprint.mjs --check`
- `qa/theme-contract-guard.mjs`
- `qa/visual-system-contract-guard.mjs`
- `qa/worker-syntax-check.mjs`

## Advisory And Manual QA

These QA helpers are advisory/manual unless a future task wires them into a package aggregate:

- `qa/gaga-audit.mjs`: ZIP/package audit helper.
- `qa/generate-audit-zip.js`: audit artifact helper.
- `qa/package-audit.mjs`: package/archive inspection helper.
- `qa/verify-copy-registry.mjs`: legacy copy registry verifier.
- `qa/verify-css-map.mjs`: legacy CSS map verifier.
- `qa/verify-css-sot.mjs`: legacy CSS source-of-truth verifier.
