output task:
Added the local/strict live-smoke split in [package.json](/Users/macbookpromid2012/Documents/BLOG-MIGRASI%20CDN%20DAN%20PWA/gg/package.json:23), changed the worker’s infra-warn branch in [qa/live-smoke-worker.sh](/Users/macbookpromid2012/Documents/BLOG-MIGRASI%20CDN%20DAN%20PWA/gg/qa/live-smoke-worker.sh:1095), and updated deploy to stay strict by default while still allowing an explicit workflow override in [.github/workflows/deploy-cloudflare.yml](/Users/macbookpromid2012/Documents/BLOG-MIGRASI%20CDN%20DAN%20PWA/gg/.github/workflows/deploy-cloudflare.yml:140).

Verification:
- `bash -n qa/live-smoke-worker.sh` passed
- `npm run store:check:ci` passed
- `npm run gaga:preflight` passed
- With `GG_LIVE_TIMEOUT_SECONDS=5 GG_LIVE_CONNECT_TIMEOUT_SECONDS=5 GG_LIVE_RETRIES=1`:
  `npm run gaga:verify-worker-live` exited non-zero with `LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE`
  `npm run gaga:verify-worker-live:strict` exited non-zero with `LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE`
  `npm run gaga:verify-worker-live:local` exited `0` with `LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE_WARN`
- Against a local mock server with a deliberately broken `/store` title, both `gaga:verify-worker-live:strict` and `gaga:verify-worker-live:local` failed with `LIVE SMOKE WORKER RESULT: CONTRACT_FAILURE`, so reachable contract failures are still hard failures in both modes.

Current worktree is limited to `package.json`, `qa/live-smoke-worker.sh`, `.github/workflows/deploy-cloudflare.yml`, and the untracked task file.

Implemented Task 009. The new discovery manifest builder lives in [src/store/lib/build-store-manifest.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/build-store-manifest.mjs:1>), and [tools/build-store-static.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/build-store-static.mjs:46>) now generates and reports [store/data/manifest.json](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/store/data/manifest.json:1>) plus [dist/store/data/manifest.json](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/dist/store/data/manifest.json:1>). The build report summary was extended in [src/store/lib/store-report.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/store-report.mjs:57>), and [store.html](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/store.html:3489>) now carries the regenerated report block with manifest metadata only; the manifest is not inlined and `store.js` still does not consume it.

Proof and packaging were tightened in [tools/proof-store-static.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/proof-store-static.mjs:26>), [qa/store-artifact-smoke.sh](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/qa/store-artifact-smoke.sh:21>), and [tools/cloudflare-prepare.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/cloudflare-prepare.mjs:47>) so the Cloudflare bundle now stages both `store/data/manifest.json` and `__gg/assets/*`. I also updated [qa/live-smoke-worker.sh](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/qa/live-smoke-worker.sh:10>) to stage the local manifest for proof and allow live-only build-report drift warnings, which was necessary because the current live deployment is still serving a pre-Task-009 build report block.

Verification:
- `npm run store:build` passed
- `npm run store:proof` passed
- `npm run store:check:ci` passed
- `bash qa/store-artifact-smoke.sh` passed
- `npm run build` passed
- `npm run gaga:preflight` passed
- `GG_LIVE_TIMEOUT_SECONDS=5 GG_LIVE_CONNECT_TIMEOUT_SECONDS=5 GG_LIVE_RETRIES=1 npm run gaga:verify-worker-live:local` passed with `LIVE SMOKE WORKER RESULT: PASS_WITH_WARNINGS (1)`

Current non-production warnings remain expected: the build is still falling back to `existing-static` because this sandbox cannot resolve `www.pakrpp.com`, and manifest images still point at `picsum.photos`. Unrelated untracked `qa/audit/`, `qa/perf-baseline/`, and `task/pakrpp_phase1_performance_repair_plan.md` were left untouched.

Executed `task/task-store-modular-10.md` / TASK 006.

Implemented manifest-backed Discovery in [src/store/store.js](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/store.js:1501>) and rebuilt [assets/store/store.js](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/assets/store/store.js:1501>). Discovery now lazy-loads `/store/data/manifest.json` only when opened, validates/cache it in memory, filters/sorts manifest rows, and falls back to static products if the fetch fails. I also added price-band and sort controls plus accessible Discovery search/status markup in [store.html](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/store.html:2230>).

Updated proof/smoke coverage in [tools/proof-store-static.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/proof-store-static.mjs:253>) and [qa/store-artifact-smoke.sh](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/qa/store-artifact-smoke.sh:113>) for manifest loading, static fallback, Discovery hooks, and no inline manifest.

Verification:
- `node --check src/store/store.js` passed
- `node --check assets/store/store.js` passed
- `npm run store:build` passed, with expected sandbox DNS/static-snapshot warnings
- `npm run store:proof` passed
- `npm run store:check:ci` passed
- `bash qa/store-artifact-smoke.sh` passed
- `npm run gaga:preflight` passed
- `npm run gaga:verify-worker-live:local` passed as `PASS_WITH_WARNINGS` after network escalation; warning is because live `/store` is still older than these local changes

Note: the worktree already had unrelated dirty/untracked files from earlier store tasks; I left them intact.

Done. TASK 007 is implemented.

Added category generation for:

`store/fashion/index.html`, `store/skincare/index.html`, `store/workspace/index.html`, `store/tech/index.html`, `store/everyday/index.html`

Also generated transitional flat files:

`store-fashion.html`, `store-skincare.html`, `store-workspace.html`, `store-tech.html`, `store-everyday.html`

Main changes:
- Added route/render helpers in [store-routes.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/store-routes.mjs:1>), [render-store-page.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/render-store-page.mjs:1>), and [render-category-page.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/render-category-page.mjs:1>).
- Updated build output in [tools/build-store-static.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/build-store-static.mjs:1>) to emit category pages with category-only grid, static JSON, semantic notes, and JSON-LD.
- Updated [build-store-jsonld.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/build-store-jsonld.mjs:1>) to support category-specific canonical URLs and ItemList IDs.
- Updated runtime filtering so category pages stay category-scoped via `data-store-category-key`.
- Extended [tools/proof-store-static.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/tools/proof-store-static.mjs:1>) and [qa/store-artifact-smoke.sh](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/qa/store-artifact-smoke.sh:1>) to verify category artifacts.

Verification passed:
- `npm run store:build`
- `npm run store:proof`
- `npm run store:check:ci`
- `bash qa/store-artifact-smoke.sh`
- `npm run gaga:preflight`
- `npm run gaga:verify-worker-live:local` passed as `PASS_WITH_WARNINGS`

Warnings are expected in this environment: local build falls back to the existing static snapshot because DNS for the feed is unavailable, and live verification warns that deployed `/store` does not yet include these new local category artifacts. No Worker route behavior was changed.

Implemented `task-store-modular-12.md`.

Added static category pagination support through [paginate-products.mjs](</Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/src/store/lib/paginate-products.mjs>), wired `STORE_CATEGORY_PAGE_SIZE = 48`, page-specific canonicals/titles/prev-next anchors, JSON-LD position offsets, and build-report `pagination` summaries. Proof and smoke now validate paginated category artifacts, including an in-memory synthetic >48-product fixture without generating production page-2 files.

Current dataset is still 20 products, 4 per category, so no `store/*/page/2/index.html` files are generated yet.

Verification:
- `npm run store:build` PASS, with expected DNS/static-snapshot warnings
- `npm run store:proof` PASS, with existing-static/picsum warnings
- `npm run store:check:ci` PASS
- `bash qa/store-artifact-smoke.sh` PASS
- `npm run gaga:preflight` PASS
- `npm run gaga:verify-worker-live:local` PASS_WITH_WARNINGS because deployed live output has not picked up this local pagination report/category artifact change yet

I left the pre-existing unrelated worktree entries untouched: deleted `index.extracted.development.xml` and untracked `index.html.css.js.xml`.

Implemented `task-store-modular-13.md`.

Implemented task 14 production-readiness tightening.

What changed:
- Added production readiness docs at `docs/store-production-readiness.md`.
- Added optional CI/deploy production proof gate via `GG_STORE_PRODUCTION_READINESS=1`.
- Extended live worker smoke to check production cache policy for `/store`, manifest, and store CSS/JS, while keeping local/development drift as warnings.
- Tightened image validation for IPv6 localhost and generalized placeholder wording.
- Build reports/generated store pages now include production budget metadata and broader placeholder warnings.

Verification:
- `npm run store:check:ci` passed with expected static/placeholder warnings.
- `bash qa/store-artifact-smoke.sh` passed.
- `npm run gaga:preflight` passed.
- `npm run gaga:verify-worker-live:local` passed with warnings because the current live deployment is still development mode and does not yet serve the new clean category/manifest route contract.
- `npm run store:check:strict` failed as expected: live feed DNS unavailable, static fallback blocked.
- `npm run store:check:production` failed as expected for the same live-feed requirement.
- Direct strict image proof failed as expected on `existing-static`, fallback images, and placeholder hosts.
Added centralized clean Store route mapping in [worker.js](/Users/macbookpromid2012/Documents/BLOG-MIGRASI%20CDN%20DAN%20PWA/gg/worker.js):
- `/store/{category}` maps to nested category artifacts with flat fallback.
- `/store/{category}/page/N` maps to generated pagination artifacts only.
- `/store/`, `/store.html`, category trailing slashes, page `1`, page `02`, `/store/etc`, and `/store/lainnya` normalize as specified.
- Invalid categories and missing pagination pages return controlled 404s.
- Store diagnostics now include `X-GG-Store-Route`, `X-GG-Store-Category`, and `X-GG-Store-Page`.

Updated live smoke/preflight/artifact smoke to validate the new route contract and diagnostics.

Verification:
- `npm run store:build` PASS
- `npm run store:proof` PASS
- `npm run store:check:ci` PASS
- `bash qa/store-artifact-smoke.sh` PASS
- `npm run gaga:preflight` PASS
- Local Worker probe PASS for `/store/fashion`, redirects, invalid routes, and missing page 2
- `npm run gaga:verify-worker-live:local` PASS_WITH_WARNINGS, because live deployment has not picked up these Worker/category route changes yet
- `npm run gaga:verify-worker-live:strict` was attempted twice but failed on DNS resolution for every endpoint (`curl_exit=6`), so that result is infra/DNS, not a route-specific failure

Unrelated existing worktree entries remain untouched: deleted `index.extracted.development.xml` and untracked `index.html.css.js.xml`.