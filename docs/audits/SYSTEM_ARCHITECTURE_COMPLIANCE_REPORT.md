# System Architecture Compliance Report

Audit date: 2026-06-03
Reference: `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`
Task: `task/task-001-audit.md`

## Executive Verdict

Overall score: 86%

Development-readiness status: ready with warnings. The architecture is strongly aligned with the HTML-first, registry-driven, source/generated-boundary contract. Required build and aggregate QA commands passed, except local clean install.

Production-readiness status: not ready. Production indexing is intentionally locked by development flags, live Store feed was unavailable in this environment, Store images are still static fallback/placeholder images, Lighthouse remains advisory, and no post-deploy strict live smoke was run.

This audit did not refactor, delete, or fix source/runtime code. Running build/QA regenerated timestamp-only Store/template artifacts.

## Score Table By Category

| Category | Score | Status | Evidence |
|---|---:|---|---|
| HTML fallback and SEO | 92 | Pass with warning | `npm run gaga:verify-semantic-ssr`, `npm run gaga:verify-semantic-readable-content`, and `npm run gaga:verify-schema-jsonld` passed. Production indexing is locked by `flags.json:2`, `flags.json:15-18`. |
| Source of truth | 90 | Pass | Registry/copy/source-boundary guards passed; `ASSET-ARCHITECTURE.md:5-18` documents source ownership. |
| Registry architecture | 95 | Pass | `npm run gaga:verify-registry-contract` passed; route/copy/discovery/store category contracts are guard-backed. |
| JavaScript controller | 90 | Pass with warning | `npm run gaga:verify-controller-core-adapters` passed. JS source is within hard budget but above advisory budget: 427539 bytes versus 409600 advisory. |
| CSS visual system | 84 | Pass with warning | CSS source/visual rhythm and module wiring guards passed; visual rhythm guard is `PASS_WITH_WARNINGS`. |
| Accessibility | 86 | Pass with warning | `npm run gaga:verify-a11y-static` passed with a Blogger-native dynamic share-button warning. |
| Performance | 78 | Warning | Lazy interaction budget passed with warnings; CSS/JS advisory budgets exceeded; Lighthouse workflow remains advisory. |
| Route stability | 94 | Pass | Route truth guarded across `/`, `/landing`, `/store`; schema guard confirms breadcrumb route truth. |
| Repo structure | 84 | Warning | Repo tidy guard passed, but local ignored junk/archive files exist. |
| Source/generated boundary | 91 | Pass with warning | Asset architecture guard passed; build changed timestamp-only generated files. |
| CI and QA guards | 88 | Pass with warning | `ci:qa`, `ci:85`, `ci:95` passed with warnings; local `npm ci` failed. |
| Cloudflare deploy | 82 | Warning | Workflow exists and verifies before deploy, but production flags remain development and strict live smoke was not run. |
| Store readiness | 78 | Warning | Store proof passed in CI/development mode, but live feed DNS failed and build reused static snapshot with 5 placeholder/fallback images. |
| Repo hygiene | 68 | Warning | `.gitignore` covers junk/archive files, but `.DS_Store` and ZIP/archive files are present locally. |
| AI-agent readability | 88 | Pass with warning | `AGENTS.md`, source-of-truth, QA command index, asset contract, and controller inventory are present and guard-backed. |
| Human maintainability | 84 | Warning | Strong docs exist, but root/archive clutter and generated timestamp churn reduce clarity. |

## Pass Evidence

- Build passed: `npm run build` exited 0. It generated Blogger template output, synced CSS/JS assets, staged Cloudflare assets, and reported `CLOUDFLARE PREPARE OK`.
- Aggregate QA passed: `npm run ci:qa` exited 0.
- 85 readiness passed with warnings: `npm run ci:85` exited 0 and reported `READINESS 85 GUARD PASS_WITH_WARNINGS`.
- 95 release-candidate gate passed with warnings: `npm run ci:95` exited 0 and reported `RELEASE CANDIDATE 95 GUARD PASS_WITH_WARNINGS`.
- Repo structure tidy passed: `npm run gaga:verify-repo-structure-tidy` exited 0.
- CI reconciliation passed: `npm run gaga:verify-ci-reconciliation` exited 0 and confirmed `.github/workflows/ci.yml`, `.github/workflows/deploy-cloudflare.yml`, and `.github/workflows/lighthouse-ci.yml`.
- Comments proof passed: `npm run gaga:verify-comments-proof` exited 0 with 187 checks.
- `git diff --check` exited 0.

## Warning Evidence

- `npm ci` failed locally during `esbuild` install/validation because the installed binary expects macOS symbol `_SecTrustCopyCertificateChain`; command output referenced `node_modules/esbuild/bin/esbuild` built for Mac OS X 12.0.
- Store build could not resolve `pakrppstore.blogspot.com`; it reused existing static snapshot with 5 products.
- Store build/proof reported `existingStaticFallbackImages=5` and `placeholderImages=5`.
- `flags.json` is development mode and blocks indexing: `flags.json:2`, `flags.json:15-18`, `flags.json:28`.
- Advisory budgets exceeded in readiness output: `src/css/gg-app.source.css` 104364 bytes above 92160 advisory, `src/js/gg-app.source.js` 427539 bytes above 409600 advisory, `src/store/store.css` 81924 bytes above 76800 advisory, `assets/store/store-discovery.js` 173396 bytes above 153600 advisory.
- A11y static guard warned that one native Blogger dynamic sharing button type cannot be statically enforced.
- CSS visual rhythm guard and lazy interaction budget guard passed with advisory warnings.
- `.DS_Store` exists in root and multiple source/generated/staging folders despite `.gitignore:2`.
- ZIP/archive files exist locally despite `.gitignore:49` and `dist/*.zip` ignore at `.gitignore:52`.

## Exact Commands Run

| Command | Result |
|---|---|
| `git status --short` | Initial: clean output. Final: generated timestamp artifacts modified. |
| `find . -name ".DS_Store" -o -name "__MACOSX"` | Found `.DS_Store` files; no `__MACOSX` reported. |
| `find . -maxdepth 3 -type f \| sort` | Completed; used for repository inventory. |
| `npm ci` | Failed locally. See failed commands. |
| `npm run build` | Pass. |
| `npm run gaga:verify-repo-structure-tidy` | Pass. |
| `npm run gaga:verify-ci-reconciliation` | Pass. |
| `npm run ci:qa` | Pass with warnings. |
| `npm run ci:85` | Pass with warnings. |
| `npm run ci:95` | Pass with warnings. |
| `npm run gaga:verify-docs-contract` | Pass. |
| `npm run gaga:verify-comments-proof` | Pass. |
| `git diff --check` | Pass. |

Additional read-only inspection commands used: `sed`, `nl`, `ls`, `du`, `rg`, `find`, `git diff --stat`, `git diff`, `git ls-files`, and `git check-ignore`.

## Exact Failed Commands

| Command | Exit | Evidence |
|---|---:|---|
| `npm ci` | 1 | `node_modules/esbuild/bin/esbuild --version` failed with `dyld: Symbol not found: _SecTrustCopyCertificateChain`; expected in macOS Security framework. No npm log was written because `/Users/macbookpromid2012/.npm/_logs` was not writable. |

## Missing Files Or Folders

No required architecture/QA/deploy folders were missing. Confirmed present:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-cloudflare.yml`
- `.github/workflows/lighthouse-ci.yml`
- `.gitignore`
- `QA-COMMANDS.md`
- `AGENTS.md`
- `SOURCE-OF-TRUTH.md`
- `ASSET-ARCHITECTURE.md`
- `src/`, `assets/`, `__gg/`, `dist/`, `.cloudflare-build/`, `store/`, `registry/`, `qa/`, `tools/`, `task/`

## Source/Generated Boundary Findings

Pass:

- `ASSET-ARCHITECTURE.md:20-30` explicitly lists generated files.
- `ASSET-ARCHITECTURE.md:42-66` maps template pack, Store build, and Cloudflare staging outputs to their build tools.
- `ASSET-ARCHITECTURE.md:133` forbids manual patching of `.cloudflare-build`, `dist`, `__gg/assets`, `assets/store`, and `store/data`.
- Asset architecture guard passed and verified source/generated parity.

Warnings:

- Running build changed generated timestamps only:
  - `dist/blogger-template.publish.txt`
  - `dist/store-build-report.json`
  - `dist/store/data/manifest.json`
  - `store/data/manifest.json`
- These should be treated as audit-run generated churn, not source fixes.

## CI/CD And GitHub Actions Findings

Pass:

- CI workflow installs with `npm ci` and runs `npm run ci:cloudflare`: `.github/workflows/ci.yml:42-46`.
- Deploy workflow installs with `npm ci`, runs `npm run ci:cloudflare`, deploys prepared Cloudflare artifacts, then runs strict live smoke: `.github/workflows/deploy-cloudflare.yml:50-60`.
- Deploy workflow references expected Cloudflare secret names only, without exposing values: `.github/workflows/deploy-cloudflare.yml:37-38`.

Warnings:

- Local `npm ci` failed due platform/runtime dependency incompatibility; CI uses Node 20 on Ubuntu, so this may be local-machine-specific but still blocks the clean local install requirement.
- Live deploy proof was not run in this audit. `npm run gaga:verify-worker-live:strict` is only appropriate after deploy.

## Guard/QA/Tooling Findings

Pass:

- `package.json` wires a broad guard suite for docs, CI reconciliation, handoff hygiene, source boundary, unified data, controller adapters, semantic SSR/readable content, schema, registry, a11y, asset architecture, cleanup, CSS, lazy interaction, sheets, comments, nav/more, discovery, store isolation, theme, shell, preview, template fingerprint, worker syntax, and readiness.
- `ci:qa`, `ci:85`, and `ci:95` all exited 0.

Warnings:

- Several readiness checks are advisory by policy: Lighthouse, detailed CSS visual findings, lazy interaction budgets, a11y static warning, and production budget promotion.

## Accessibility Findings

Pass:

- Static a11y guard found dialog semantics, closed-state inert/hidden contracts, button names, `aria-controls` targets, reduced-motion CSS, focus/keyboard markers, and sheet close controls.

Warning:

- Native Blogger sharing button type is not statically enforced; the guard treats this as a documented warning, not a blocking defect.

## Performance Findings

Pass:

- Critical CSS is within readiness budget: `src/css/gg-critical.source.css` 5999 bytes versus 14336 budget.
- Lazy interaction guard confirms Blogger SSR, route-critical JSON-LD, Store static product cards, idle-gated PWA registration, intent-gated discovery, and static-first Store hydration.

Warnings:

- Advisory budgets are exceeded for app CSS, app JS, Store CSS, and Store discovery JS.
- Lighthouse remains advisory/non-blocking.
- Store build used existing static fallback because live feed DNS failed.

## Store Readiness Findings

Pass:

- `store:proof`, Store artifact smoke, Store isolation guard, Store modal preview reliability guard, Store manifest/schema checks, and generated category page checks passed.

Warnings:

- Live Store feed probe failed: `curl: (6) Could not resolve host: pakrppstore.blogspot.com`.
- Store used existing static snapshot and reported 5 products.
- Store image source summary used `existing-static-fallback:5`; proof noted `placeholderImages=5`.

## Repo Hygiene Findings

Pass:

- `.gitignore` covers OS junk and archive files: `.gitignore:1-5`, `.gitignore:40-52`.
- Repo tidy guard and handoff hygiene guard passed.

Warnings:

- `.DS_Store` files exist under root, source, generated, staging, docs, task, assets, Store, and QA folders.
- Ignored ZIP/archive files exist at root, `dist/`, and `task/`.
- `task/index-backup.xml` is tracked and not referenced by active build/guard commands.
- `docs/archive/template-deprecated/*` is tracked historical material; its README says it is retained only for reference and not current source of truth.

## AI-Agent Maintainability Findings

Pass:

- `AGENTS.md`, `SOURCE-OF-TRUTH.md`, `ASSET-ARCHITECTURE.md`, `REPO-STRUCTURE.md`, `QA-COMMANDS.md`, and guard reports make source/generated ownership and operational rules discoverable.
- `ASSET-ARCHITECTURE.md:83-123` maps public routes to owners.

Warnings:

- Local ignored junk and archive backups increase search noise.
- Several old reports and archive folders remain in root/docs; they are documented, but still create cognitive overhead for new agents.

## Human Maintainability Findings

Pass:

- Major source folders and generated folders are documented.
- CI and deploy workflows are deterministic and guard-backed.

Warnings:

- Root folder contains many reports plus multiple local archive backups.
- The clean install failure means a new maintainer on this machine cannot reproduce CI from scratch without addressing platform/toolchain compatibility.

## Top 10 Blockers

1. Local `npm ci` fails, so clean local install is not proven.
2. `flags.json` remains in development mode; production indexing is intentionally blocked.
3. `robots.developmentLockdown`, `blockAiBots`, and `blockSearchBots` are true in `flags.json`.
4. Store live feed was unreachable in this environment.
5. Store output depends on existing static fallback snapshot in this audit run.
6. Store product images are placeholder/static fallback images.
7. Strict live worker smoke was not run after deploy.
8. Production deploy proof is absent for this audit.
9. Advisory performance budgets are exceeded for key CSS/JS assets.
10. Local repo hygiene contains `.DS_Store` and archive clutter.

## Top 10 Warnings

1. CSS visual rhythm guard is `PASS_WITH_WARNINGS`.
2. Lazy interaction budget guard is `PASS_WITH_WARNINGS`.
3. A11y static guard is `PASS_WITH_WARNINGS`.
4. Readiness 85 gate is `PASS_WITH_WARNINGS`.
5. RC95 gate is `PASS_WITH_WARNINGS`.
6. Lighthouse workflow remains advisory/non-blocking.
7. Static `robots.txt` is permissive while Worker development policy controls lockdown.
8. Generated manifests/reports churn timestamps on build.
9. Historical deprecated template fragments remain tracked.
10. Root/top-level reports and ignored archives make repository scanning noisier.

## Top 10 Recommended Fixes

1. Fix local clean install compatibility or pin/toolchain a working local path for this machine.
2. Remove ignored `.DS_Store` files after approval.
3. Remove or move ignored root/task/dist ZIP archives after approval.
4. Decide whether `task/index-backup.xml` should remain tracked.
5. Replace Store placeholder/static fallback images with production product images.
6. Confirm live Store feed resolution in a network-enabled environment.
7. Promote strict Store mode only after live feed and image requirements are ready.
8. Reduce app JS/CSS and Store discovery asset sizes below advisory budgets.
9. Run production/deploy checklist and strict live smoke after deploy.
10. Keep generated timestamp churn out of source-only changes unless build artifacts are intentionally part of the handoff.

## Recommended Next Task Order

1. Repo hygiene cleanup: remove ignored `.DS_Store`, local ZIPs, and stale backup candidates with approval.
2. Clean install/toolchain reconciliation for local `npm ci`.
3. Store production readiness: live feed access, non-placeholder images, strict Store proof.
4. Performance budget tightening for large CSS/JS assets.
5. Production flag/deploy readiness and strict live smoke after deployment.

## Do Not Fix Yet

These changes require explicit approval because they affect production behavior, tracked history, or generated/runtime assets:

- Switching `flags.json` to production.
- Removing or editing Blogger-native comments, Blogger template structures, Store generated artifacts, or Worker route policy.
- Deleting tracked `docs/archive/template-deprecated/*` or `task/index-backup.xml`.
- Removing root archive files if they are needed for handoff/history outside git.
- Editing generated outputs as the primary fix.
- Promoting live feed/image strictness without confirming Store source readiness.
- Running deploy or strict live smoke against production without deploy approval.
