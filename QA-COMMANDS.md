# QA Commands

This file is the command index for local hardening, deploy preparation, and live smoke. Run commands from the repository root.

## Standard Local Contract Set

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-handoff-hygiene
npm run gaga:verify-content-source-boundary
npm run gaga:verify-semantic-ssr
npm run gaga:verify-semantic-readable-content
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

## GitHub Actions And Cloudflare Environment Contract

GitHub Actions must call aggregate package scripts instead of duplicating long guard chains. The deploy workflow order is checkout, setup Node, `npm ci`, `npm run ci:cloudflare`, `npm run deploy:cloudflare:prepared`, `npm run gaga:verify-worker-live:strict`, then failure-only diagnostics upload.

Required workflow files in a deployable repo/archive are:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-cloudflare.yml`
- `.github/workflows/lighthouse-ci.yml`

Limited task packs may omit workflows only when `HANDOFF-MANIFEST.md` explicitly declares that the archive is not a deployable repo archive.

Required workflow and deploy environment variables:

- `GG_LIVE_BASE_URL`: live base URL for strict Worker smoke; defaults to `https://www.pakrpp.com`.
- `GG_LIVE_RETRIES`: live smoke retry count.
- `GG_LIVE_RETRY_DELAY_SECONDS`: delay between live smoke retries.
- `GG_LIVE_TIMEOUT_SECONDS`: live smoke total request timeout.
- `GG_LIVE_CONNECT_TIMEOUT_SECONDS`: live smoke connection timeout.
- `GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN`: must be `0` for strict deploy smoke; local smoke may set `1`.
- `STORE_CI`: enables Store CI mode for generated Store proof.
- `GG_STORE_MODE`: explicit Store build/proof mode such as `ci`, `strict`, or `production`.
- `STORE_REQUIRE_LIVE_FEED`: requires a live Store feed when set to `1`.
- `STORE_STRICT_IMAGES`: enables strict Store image checks when set to `1`.
- `CLOUDFLARE_API_TOKEN`: GitHub Actions secret consumed by the Cloudflare deploy wrapper.
- `CLOUDFLARE_ACCOUNT_ID`: GitHub Actions secret consumed by Wrangler through the deploy wrapper.

Workflow boundaries:

- `ci.yml` runs `npm ci` and `npm run ci:cloudflare`.
- `deploy-cloudflare.yml` runs `npm ci`, `npm run ci:cloudflare`, `npm run deploy:cloudflare:prepared`, and `npm run gaga:verify-worker-live:strict`.
- `lighthouse-ci.yml` is scheduled/manual and advisory; it must remain non-blocking during development and must not deploy or publish Blogger artifacts.
- Workflows must not introduce ad-hoc `wrangler deploy` calls or HTMLRewriter-based post/page repair paths. Worker deploy remains governance/static routing/staging only.

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

## Script Inventory

All script names in this table are mapped in `package.json`. Read-only commands must not write source, generated, or staging files. Mutating commands are build, package, staging, or deploy tools and must not be described as verifiers.

| Script | Purpose | Mode | Gate | CI | Deploy | Expected output / failure class |
| --- | --- | --- | --- | --- | --- | --- |
| `build` | Sync shared CSS, rebuild Store, rebuild Blogger template assets, and prepare Cloudflare staging. | Mutating | Blocking build | Indirect via `ci:store` | Yes, before prepared deploy paths | Build tool output; failures are `BUILD_FAILURE`/command failure. |
| `store:build` | Generate Store HTML/data/runtime assets from source/config/feed inputs. | Mutating | Blocking build | Yes via `store:check:*` | Yes via `build` | `STORE STATIC BUILD OK`; failures are `BUILD_FAILURE`/command failure. |
| `store:proof` | Verify generated Store static artifacts. | Read-only | Blocking contract | Yes via `store:check:*` | Yes via `ci:cloudflare` | `STORE STATIC PROOF PASS`; failures are `CONTRACT_FAILURE`/command failure. |
| `store:check` | Build Store then run Store proof. | Mutating aggregate | Blocking build + contract | No direct CI call | No direct deploy call | Store build/proof output; `BUILD_FAILURE` or `CONTRACT_FAILURE`. |
| `store:check:ci` | Store CI mode with live-feed optional and strict image checks disabled. | Mutating aggregate | Blocking build + contract | Yes via `ci:store` | Yes via `ci:cloudflare` | Store build/proof output; `BUILD_FAILURE` or `CONTRACT_FAILURE`. |
| `store:check:dev10` | Store CI check, full build, Store artifact smoke, and sheet contract smoke. | Mutating aggregate | Blocking build + contract | No direct CI call | No direct deploy call | Smoke/proof `PASS`; failures are `CONTRACT_FAILURE`/command failure. |
| `store:check:strict` | Strict Store CI requiring live feed and strict images. | Mutating aggregate | Blocking strict contract | No | Manual pre-release only | Store build/proof output; `BUILD_FAILURE` or `CONTRACT_FAILURE`. |
| `store:check:production` | Production Store readiness with strict images and production mode. | Mutating aggregate | Blocking production contract | No | Manual pre-release only | Store build/proof output; `BUILD_FAILURE` or `CONTRACT_FAILURE`. |
| `gaga:template:pack` | Generate Blogger publish XML/text and synced app assets from source. | Mutating | Blocking build | Indirect via `build` | Yes via `build` | `TEMPLATE PACK OK`; failures are `BUILD_FAILURE`/command failure. |
| `gaga:sync-components` | Sync shared CSS component/module blocks into declared source targets. | Mutating | Blocking build | Indirect via `build` | Yes via `build` | Sync output; failures are `BUILD_FAILURE`/command failure. |
| `gaga:cf:prepare` | Alias for `build`. | Mutating aggregate | Blocking build | No | Manual staging | Build output; failures are `BUILD_FAILURE`/command failure. |
| `gaga:cf:dry` | Build then run Cloudflare deploy wrapper in dry-run mode. | Mutating aggregate | Blocking deploy rehearsal | No | Manual deploy rehearsal | Deploy wrapper output; failures are `BUILD_FAILURE`/`CI_FAILURE`. |
| `gaga:cf:deploy` | Build then deploy through the Cloudflare wrapper. | Mutating deploy | Blocking deploy | No | Manual deploy | Deploy wrapper output; failures are `BUILD_FAILURE`/`CI_FAILURE`. |
| `deploy:cloudflare` | Build then deploy through the Cloudflare wrapper. | Mutating deploy | Blocking deploy | No | Manual deploy | Deploy wrapper output; failures are `BUILD_FAILURE`/`CI_FAILURE`. |
| `deploy:cloudflare:prepared` | Deploy the already verified prepared artifact path. | Mutating deploy | Blocking deploy | No | Yes in deploy workflow | Deploy wrapper output; failures are `CI_FAILURE`/command failure. |
| `deploy:cloudflare:dry` | Build then dry-run Cloudflare deploy wrapper. | Mutating aggregate | Blocking deploy rehearsal | No | Manual deploy rehearsal | Deploy wrapper output; failures are `BUILD_FAILURE`/`CI_FAILURE`. |
| `ci:qa` | Aggregate read-only contract guard chain. | Read-only aggregate | Blocking contracts, advisory warnings allowed | Yes via `ci:cloudflare` | Yes via `ci:cloudflare` | Guard `PASS`/`PASS_WITH_WARNINGS`; failures use `CONTRACT_FAILURE`, `SCHEMA_FAILURE`, `SSR_FAILURE`, or command failure. |
| `ci:store` | Store CI, full build, Store artifact smoke, and sheet contract smoke. | Mutating aggregate | Blocking build + contract | Yes via `ci:cloudflare` | Yes via `ci:cloudflare` | Store/smoke `PASS`; failures are `BUILD_FAILURE`/`CONTRACT_FAILURE`. |
| `ci:cloudflare` | Store CI, aggregate QA, and Worker smoke script syntax check. | Mutating aggregate | Blocking CI | Yes in `.github/workflows/ci.yml` | Yes before deploy | `ci:store` + `ci:qa` output; failures are `CI_FAILURE`/command failure. |
| `ci:85` | Full Cloudflare CI plus final readiness guard. | Mutating aggregate | Blocking release readiness, advisory warnings allowed | Manual/optional | Manual pre-release | `PASS`/`PASS_WITH_WARNINGS`; failures are `CONTRACT_FAILURE`/`CI_FAILURE`. |
| `gaga:verify-store-artifact` / `gaga:verify-worker` | Legacy verify-named aggregate that runs Store artifact build/proof/smoke checks. | Mutating aggregate | Blocking build + contract | No direct CI call | Manual/legacy | Store artifact/sheet smoke `PASS`; failures are `BUILD_FAILURE`/`CONTRACT_FAILURE`. |
| `gaga` / `gaga:dry` / `gaga:push` | Release wrapper aliases. | Mutating release | Blocking release wrapper | No | Manual release | Release wrapper output; failures are `CI_FAILURE`/command failure. |
| `gaga:preflight` | Local preflight for release/deploy wrapper prerequisites. | Read-only | Blocking preflight | No | Indirect through deploy wrapper | Preflight output; failures are `CI_FAILURE`/command failure. |
| `gaga:audit` | Audit an existing ZIP/archive. | Read-only | Blocking when explicitly invoked, otherwise manual | No | Handoff/manual | `ZIP AUDIT` `PASS`; failures are `HANDOFF_FAILURE` or `CONTRACT_FAILURE`. |
| `gaga:audit:pack` | Create a task-scoped audit ZIP from an audit manifest. | Mutating package tool | Blocking handoff package | No | Handoff/manual | Audit pack output; failures are `HANDOFF_FAILURE`/command failure. |
| `gaga:handoff:pack` | Create deployable repo handoff ZIP from git-visible source files. | Mutating package tool | Blocking handoff package | No | Handoff/manual | `HANDOFF PACK PASS`; failures are `HANDOFF_FAILURE`. |
| `gaga:handoff:audit` | Pack deployable repo archive and audit it. | Mutating aggregate | Blocking handoff package + contract | No | Handoff/manual | Handoff pack + ZIP audit `PASS`; failures are `HANDOFF_FAILURE` or `CONTRACT_FAILURE`. |

### Read-Only Verifier Scripts

| Script | Purpose | Gate | CI | Deploy | Expected output / failure class |
| --- | --- | --- | --- | --- | --- |
| `gaga:verify-docs-contract` | Verify source/generated/deploy documentation contracts. | Blocking contract | Yes | Yes via `ci:cloudflare` | `DOCS CONTRACT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-ci-reconciliation` | Verify QA script wiring, workflow aggregation, and guard classification docs. | Blocking contract | Yes | Yes via `ci:cloudflare` | `CI RECONCILIATION GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-handoff-hygiene` | Verify handoff/archive hygiene docs, ignores, and package mappings. | Blocking handoff contract | Yes | Yes via `ci:cloudflare` | `HANDOFF HYGIENE GUARD PASS`; failures are `HANDOFF_FAILURE` or `CONTRACT_FAILURE`. |
| `gaga:verify-content-source-boundary` | Verify root/editorial CMS and Store/product CMS source boundary, public canonical Store route, and Worker non-HTMLRewriter contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `CONTENT SOURCE BOUNDARY GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-semantic-ssr` | Verify Blogger SSR semantics and fallback contracts. | Blocking SSR contract | Yes | Yes via `ci:cloudflare` | `SEMANTIC SSR GUARD PASS`; failures are `SSR_FAILURE`/`CONTRACT_FAILURE`. |
| `gaga:verify-semantic-readable-content` | Verify post-readable semantic structure, post-scoped JSON-LD placement, unresolved substitution boundaries, and Worker non-readability repair contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `SEMANTIC READABLE CONTENT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-schema-jsonld` | Verify JSON-LD/schema route truth and validity. | Blocking schema contract, advisory warnings allowed | Yes | Yes via `ci:cloudflare` | `SCHEMA JSON-LD GUARD PASS`; failures are `SCHEMA_FAILURE`/`CONTRACT_FAILURE`. |
| `gaga:verify-registry-contract` | Verify runtime/content registry contracts. | Blocking contract, advisory warnings allowed | Yes | Yes via `ci:cloudflare` | `REGISTRY CONTRACT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-a11y-static` | Static accessibility contract with non-blocking advisory warnings. | Blocking contract, advisory warnings allowed | Yes | Yes via `ci:cloudflare` | `A11Y STATIC GUARD PASS`; failures are `CONTRACT_FAILURE`; warnings are `ADVISORY_WARNING`. |
| `gaga:verify-asset-architecture` | Verify source/generated asset parity, generated artifact boundaries, and architecture-level CSS wiring. | Blocking contract, advisory warnings allowed | Yes | Yes via `ci:cloudflare` | `ASSET ARCHITECTURE GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-cleanup` | Verify cleanup regression boundaries and intentional non-removals. | Blocking contract, advisory warnings allowed | Yes | Yes via `ci:cloudflare` | `CLEANUP REGRESSION GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-css-sot-cleanup` | Verify CSS source-of-truth cleanup boundaries. | Blocking architecture contract | Yes | Yes via `ci:cloudflare` | `CSS SOURCE OF TRUTH CLEANUP GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-css-module-wiring` | Verify required CSS module registration and generated bundle parity. | Blocking architecture contract | Yes | Yes via `ci:cloudflare` | `CSS MODULE BUNDLE WIRING GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-repo-structure-tidy` | Verify repo structure tidy contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `REPO STRUCTURE TIDY GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-sheet-search-visual-parity` | Verify Search/More sheet visual parity contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `SHEET SEARCH VISUAL PARITY GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-comments-proof` | Verify Blogger native comments/threaded composer contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `COMMENTS PROOF GUARD RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-nav-more` / `gaga:verify-more-global` | Verify global More navigation and sheet contract. | Blocking contract | Yes for `gaga:verify-nav-more` | Yes via `ci:cloudflare` | `NAV MORE CONTRACT GUARD RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-discovery-contract` | Verify Discovery contract and taxonomy ownership. | Blocking contract | Yes | Yes via `ci:cloudflare` | `DISCOVERY CONTRACT GUARD RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-discovery-filters` | Verify Discovery filter taxonomy contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `DISCOVERY FILTER TAXONOMY GUARD RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-store-isolation` | Verify Store isolation from Blog/shell systems. | Blocking contract | Yes | Yes via `ci:cloudflare` | `STORE ISOLATION GUARD RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-theme` / `gaga:verify-theme-contract` | Verify Light/Dark theme contract and no system-mode public UI. | Blocking contract | Yes for `gaga:verify-theme` | Yes via `ci:cloudflare` | `THEME CONTRACT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-shell` / `gaga:verify-shell-contract` | Verify shell interaction contract. | Blocking contract | Yes for `gaga:verify-shell` | Yes via `ci:cloudflare` | `SHELL INTERACTION GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-preview-sheet` | Verify root article preview sheet contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `PREVIEW SHEET CONTRACT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-sheet-lifecycle` | Verify sheet lifecycle, preview lift, and token contracts. | Blocking contract | Yes | Yes via `ci:cloudflare` | `SHEET LIFECYCLE CONTRACT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-component-source` / `gaga:verify-sheet-core-source` | Verify component/source ownership for shared sheet core. | Blocking contract | Yes | Yes via `ci:cloudflare` | Component source guard `PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-visual-system` | Verify visual-system source contracts. | Blocking contract | Yes | Yes via `ci:cloudflare` | Visual-system guard `PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-sheet-runtime-overflow` | Verify viewport-safe sheet overflow behavior. | Blocking contract | Yes | Yes via `ci:cloudflare` | `SHEET RUNTIME OVERFLOW VIEWPORT GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-store-modal-preview` | Verify Store modal preview reliability contract. | Blocking contract | Yes | Yes via `ci:cloudflare` | `STORE MODAL PREVIEW RELIABILITY GUARD PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-sheet-contract` | Browserless sheet contract smoke. | Blocking contract | Yes via `ci:store` | Yes via `ci:cloudflare` | `SHEET CONTRACT SMOKE RESULT: PASS`; failures are `CONTRACT_FAILURE`. |
| `gaga:verify-worker-live` / `gaga:verify-worker-live:local` / `gaga:verify-worker-live:strict` | Live Worker smoke after deploy or Worker/static route changes. | Read-only live smoke | No normal CI | Yes after deploy for strict variant | `LIVE SMOKE WORKER RESULT: PASS`; failures are `CONTRACT_FAILURE`; local variant may allow known timeout warnings. |

### Failure Labels

Use these labels for command failures:

- `CONTRACT_FAILURE`: source, architecture, route truth, ownership, CSS boundary, comments, sheet, Store isolation, Worker contract, or deploy contract violation.
- `HANDOFF_FAILURE`: archive, ZIP, package, ignored junk, missing workflow/dotfile, or handoff manifest violation.
- `BUILD_FAILURE`: mutating build, bundling, template generation, Store generation, or staging failure.
- `SCHEMA_FAILURE`: JSON-LD/schema validity or route-truth schema failure.
- `SSR_FAILURE`: Blogger SSR/fallback semantic rendering failure.
- `CI_FAILURE`: workflow/deploy wrapper/preflight failure that is not a source contract defect.
- `ADVISORY_WARNING`: non-blocking budget, Lighthouse, token consistency, naming, rhythm, or optimization warning.

## CSS Guard Scope

Mandatory CSS guards are architecture-level. They may fail normal CI only for generated CSS edited manually, source CSS missing from a declared build path, obvious duplicate override/patch files, forbidden emergency CSS layers, missing required CSS module registration, or clearly unused large CSS artifacts.

CSS checks for selector style, spacing tokens, border-radius preferences, color values, component file granularity, declaration order, and otherwise valid manual edits under `src/css/*` or `src/store/*` are advisory only. Advisory CSS findings must emit `ADVISORY_WARNING`, `WARN`, or `PASS_WITH_WARNINGS` and must not block `ci:qa`.

## Handoff And Archive Hygiene Set

```bash
npm run gaga:verify-handoff-hygiene
npm run gaga:handoff:pack
npm run gaga:handoff:audit
npm run gaga:audit -- dist/gg-handoff.zip
npm run gaga:audit:pack -- <task-id> --zip dist/gg-audit.zip
```

`npm run gaga:handoff:pack` creates `dist/gg-handoff.zip` from git-visible source files with `tools/handoff-archive.mjs`, including non-ignored untracked files during pre-commit handoff. The CLI packer preserves dotfiles and dotfolders such as `.github/workflows/*` and `.gitignore`, excludes ignored local files, strips ZIP extra metadata with `zip -X`, and fails if macOS/OS junk such as `__MACOSX/`, `.DS_Store`, or `._*` appears in the archive.

`npm run gaga:handoff:audit` packs the deployable repo archive and audits it with `qa/gaga-audit.mjs`. Use `HANDOFF_FAILURE` for archive/package problems such as missing workflows in deployable archive mode, missing `.gitignore`, missing `package-lock.json`, or OS junk in package output. Use `CONTRACT_FAILURE` for source/architecture problems. A limited task pack may omit `.github/workflows/*` only when its `HANDOFF-MANIFEST.md` explicitly declares that it is not a deployable repo archive.

`npm run gaga:audit:pack` creates task-scoped audit ZIPs from a manifest in `qa/audit-output/*`. It is not the deployable repo archive path.

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
- `qa/handoff-hygiene-guard.mjs`
- `qa/content-source-boundary-guard.mjs`
- `qa/semantic-ssr-guard.mjs`
- `qa/semantic-readable-content-guard.mjs`
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
