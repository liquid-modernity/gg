# Source Of Truth Contract

This repository separates source, generated output, and deployment staging. Change source first, rebuild artifacts, then verify guards.

## Source Files

Primary source files include:

- `index.xml`: Blogger template source and live-parity carrier.
- `landing.html`: static Home/identity route source.
- `store.html`: Store root source/build input.
- `src/js/gg-app.source.js` and `src/js/modules/*`: Blogger app source JavaScript.
- `src/js/boot/*`: early boot scripts.
- `src/css/gg-app.source.css`, `src/css/gg-critical.source.css`, wired `src/css/modules/*`, and `src/css/components/*`: Blogger app CSS sources. Module files are canonical only when wired or explicitly documented.
- `src/store/*`: Store build/render/static artifact source CSS, JS, config, rendering, validation, manifest, JSON-LD, route, and report logic.
- `src/registry/*`, `registry/copy/*`, `registry/content/*`, and `registry/store/*`: route/copy/action/icon/content/store registries, including `src/registry/gg-source-boundary.registry.js` for root/editorial and Store CMS source boundaries.
- `src/landing/*`, `src/dashboard/*`, and `src/knowledge base/*`: static-surface source assets where applicable.
- `worker.js`: Cloudflare Worker edge governance source, including generated Store registry blocks only when rebuilt by Store tooling.
- `flags.json`, `registry/runtime/*`, and root copy JSON files used as runtime inputs.
- `ASSET-ARCHITECTURE.md`: asset source/generated boundary, loading map, cache/deploy discipline, and parity guard scope.
- `CLEANUP-REPORT.md`: deletion proof, usage checks, regression guards, and intentional non-removals for cleanup tasks.
- `docs/architecture/controller-inventory-v1.md`: Task 09 controller inventory, public API hooks, event listeners, data/CSS/source dependencies, safe helper extraction, adapter facade boundaries, and deferred runtime split notes.
- `CSS-SOURCE-OF-TRUTH-REPORT.md`: CSS/JS folder classification, stale-file deletion proof, and intentionally kept source/generated boundaries.
- `CSS-MODULE-BUNDLE-WIRING-REPORT.md`: module/component CSS wiring status, detail-toolbar decision, and non-canonical manual module map.
- `REPO-STRUCTURE.md`: conservative repository map, edit/generated/commit policy, and runtime path stability notes.
- `REPO-TIDY-REPORT.md`: repo tidy proof, ignored clutter handling, intentionally unmoved runtime folders, and QA record.
- `READINESS-85-REPORT.md`: final crawlability, performance, AI/search discoverability, indexing flag, and deploy readiness gate report.
- `RELEASE-CANDIDATE-95-REPORT.md`: final release-candidate command sequence, deploy parity, blocker/advisory warning policy, and production-indexing readiness report.
- `LAZY-INTERACTION-BUDGET-REPORT.md`: source-owned lazy interaction and advisory budget boundary report.
- `docs/ci-guard-policy.md`: blocker/warning/info guard severity policy, CI authority, local command expectations, and future guard classification rules.
- `docs/local-development.md`: local development caveats, including macOS 10.15.x `npm ci` incompatibility with the current `wrangler -> esbuild` native binary.
- `qa/*`, `tools/*`, `scripts/*`, `.github/workflows/*`, `package.json`, and docs. `qa/handoff-hygiene-guard.mjs` verifies archive handoff contracts, and `tools/handoff-archive.mjs` creates deployable repo archives from git-visible source files.

## Content Source Boundary

Root/editorial CMS and Store/product CMS are separate source domains while preserving one public frontend contract:

- `rootSource`: Blogger source `pakrpp.blogspot.com`, public canonical base `https://www.pakrpp.com/`, root feed/sitemap declarations, and Article/WebPage schema family.
- `storeSource`: Blogger source `pakrppstore.blogspot.com`, optional source-only/backend host `https://store.pakrpp.com/`, public canonical Store base `https://www.pakrpp.com/store/`, Store feed/sitemap declarations, and Product/ItemList schema family.

`/store` remains the public canonical Store surface. `store.html` and `src/store/*` own Store build/render/static artifacts. `pakrppstore.blogspot.com` and `store.pakrpp.com` are Store product/content sources, not competing public SEO destinations. Worker remains a router/stager/edge policy layer and must not become an HTMLRewriter/CMS/schema/readability repair path.

## Generated Files

Generated output includes:

- `__gg/assets/*`
- `dist/assets/*`
- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `dist/store-build-report.json`
- `store/data/manifest.json`
- `store/data/build-report.json`
- generated Store category and pagination pages under `store/*/index.html` and `store/*/page/*/index.html`
- transitional Store flat artifacts such as `store-fashion.html` and `store-fashion-page-2.html` when the artifact contract requires them
- runtime Store asset copies in `assets/store/*` when produced by `npm run store:build`
- generated or copied runtime assets under `assets/` only when their owning source/build tool is documented

Generated files may be committed when the project expects committed artifacts, but they must be produced from source. Do not manually edit them as the primary fix.

## Deployment Artifacts

Deployment/staging artifacts include:

- `.cloudflare-build/*`
- `.cloudflare-build/public/*`
- Wrangler deployment output
- Blogger publish artifacts in `dist/blogger-template.publish.*`

`.cloudflare-build/*` is staging output from `tools/cloudflare-prepare.mjs`. `dist/blogger-template.publish.xml` is the Blogger upload artifact from `tools/template-pack.mjs`.

## Must Not Be Edited Manually

Do not manually patch these as the primary fix:

- `__gg/assets/*`
- `dist/assets/*`
- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `.cloudflare-build/*`
- `store/data/manifest.json`
- `store/data/build-report.json`
- generated Store category/pagination pages
- generated Store runtime config copies or Worker Store category registry output

If one of these files is wrong, fix the owning source and rebuild.

## How To Rebuild

Build Blogger publish artifact and runtime app assets:

```bash
npm run gaga:template:pack
```

Build Store artifacts:

```bash
npm run store:build
npm run store:proof
```

Prepare Cloudflare deployment staging:

```bash
node tools/cloudflare-prepare.mjs
```

Run full local Cloudflare CI gate:

```bash
npm run ci:cloudflare
```

For production Store readiness, use the strict production gate without weakening development gates:

```bash
GG_STORE_PRODUCTION_READINESS=1 npm run store:check:production
```

Run CSS/JS source-of-truth cleanup verification:

```bash
npm run gaga:verify-css-sot-cleanup
```

Run CSS module bundle wiring verification:

```bash
npm run gaga:verify-css-module-wiring
```

Run CSS source visual rhythm ownership verification:

```bash
npm run gaga:verify-css-source-visual-rhythm
```

Run repo structure tidy verification:

```bash
npm run gaga:verify-repo-structure-tidy
```

Run handoff archive hygiene verification:

```bash
npm run gaga:verify-handoff-hygiene
npm run gaga:handoff:audit
```

Run content source boundary verification:

```bash
npm run gaga:verify-content-source-boundary
```

Run unified data contract verification:

```bash
npm run gaga:verify-unified-data-contract
```

Run controller core/adapters verification:

```bash
npm run gaga:verify-controller-core-adapters
```

Run sheet search visual parity verification:

```bash
npm run gaga:verify-sheet-search-visual-parity
```

Run lazy interaction budget verification:

```bash
npm run gaga:verify-lazy-interaction-budget
```

Run release candidate 95 verification:

```bash
npm ci
npm run build
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
npm run ci:85
npm run gaga:verify-95
npm run ci:95
```

Local macOS 10.15.x note: `npm ci` may fail before validation because the current transitive `@esbuild/darwin-x64@0.27.0` binary targets macOS 12.0. This is documented as a `LOCAL ENVIRONMENT BLOCKER` and `CI NON-BLOCKING LOCAL ISSUE` in `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`; use GitHub Actions or Linux/Docker Node 20 for validation authority instead of downgrading package versions.

## Read-Only Guards

Read-only guards verify contracts and must not write source, generated, or deployment artifact files. Mandatory guards are wired through `package.json` and `ci:qa`; advisory/manual guards must be documented in `QA-COMMANDS.md`.

Examples of mandatory read-only guards:

- `qa/ci-reconciliation-guard.mjs`
- `qa/a11y-static-guard.mjs`
- `qa/asset-architecture-guard.mjs`
- `qa/cleanup-regression-guard.mjs`
- `qa/css-module-bundle-wiring-guard.mjs`
- `qa/css-source-visual-rhythm-guard.mjs`
- `qa/lazy-interaction-budget-guard.mjs`
- `qa/css-source-of-truth-cleanup-guard.mjs`
- `qa/repo-structure-tidy-guard.mjs`
- `qa/sheet-search-visual-parity-guard.mjs`
- `qa/global-sheet-contract-guard.mjs`
- `qa/sheet-gesture-close-guard.mjs`
- `qa/readiness-85-guard.mjs`
- `qa/release-candidate-95-guard.mjs`
- `qa/docs-contract-guard.mjs`
- `qa/handoff-hygiene-guard.mjs`
- `qa/content-source-boundary-guard.mjs`
- `qa/unified-data-contract-guard.mjs`
- `qa/controller-core-adapters-guard.mjs`
- `qa/semantic-ssr-guard.mjs`
- `qa/semantic-readable-content-guard.mjs`
- `qa/schema-jsonld-guard.mjs`
- `qa/registry-contract-guard.mjs`
- `qa/comments-proof-guard.mjs`
- `qa/discovery-contract-guard.mjs`
- `qa/discovery-filter-taxonomy-guard.mjs`
- `qa/store-isolation-guard.mjs`
- `qa/theme-contract-guard.mjs`
- `qa/shell-interaction-guard.mjs`
- `qa/preview-sheet-contract-guard.mjs`
- `qa/sheet-lifecycle-contract-guard.mjs`
- `qa/component-source-contract-guard.mjs`
- `qa/visual-system-contract-guard.mjs`
- `qa/sheet-runtime-overflow-viewport-guard.mjs`
- `qa/store-modal-preview-reliability-guard.mjs`
- `qa/template-fingerprint.mjs --check`
- `qa/worker-syntax-check.mjs`

## Mutating Build Tools

These tools intentionally write generated or staging artifacts and must not be treated as read-only guards:

- `tools/sync-shared-css-components.mjs`: syncs shared CSS component source blocks and wired module blocks into app/landing/store CSS targets.
- `tools/build-store-static.mjs`: rebuilds Store HTML, Store data, Store runtime assets, and Store build reports from source/config/feed inputs.
- `tools/template-pack.mjs`: rebuilds Blogger publish artifacts and synchronized app CSS/JS runtime assets.
- `tools/cloudflare-prepare.mjs`: rebuilds `.cloudflare-build/*` deployment staging from source and generated artifacts.
- `tools/cloudflare-deploy.mjs`: runs preflight, prepares the Cloudflare bundle, then invokes Wrangler.
- `tools/handoff-archive.mjs`: creates Handoff Archives from git-visible source files, preserving dotfiles/dotfolders while excluding ignored local OS junk and workspace files.
- `tools/sync-store-lcp.mjs`: syncs the Store LCP product source config into guarded Store markup blocks.
