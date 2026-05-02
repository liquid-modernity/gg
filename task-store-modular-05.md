TASK 004 — CI/Deploy Store Contract Stabilization

Context:
Task 001 extracted Yellow Cart CSS/JS from store.html into split assets:
- src/store/store.critical.css
- src/store/store.css
- src/store/store.js
- assets/store/store.css
- assets/store/store.js

Task 002 added product normalization, category governance, dummy removal, and stronger proof.

Task 003 made Blogger Store feed extraction work as the preferred source of truth. Local output can produce:
- source=live-feed
- products=20
- itemList=20
- categoryCounts=Fashion:4, Skincare:4, Workspace:4, Tech:4, Lainnya:4
- imageSourceSummary=gg-store-data.images:20

Current CI/deploy failure:
npm run gaga:preflight fails with:
preflight: store.html is missing static store marker: // STORE_LCP_PRODUCT_START

Root cause:
tools/preflight.mjs still assumes the old single-file store contract where runtime JS markers lived inside store.html. After Task 001, runtime markers should live in assets/store/store.js, while store.html should remain a lightweight shell with critical CSS, theme boot script, SEO/static snapshot, and external asset references.

Goal:
Update preflight and CI/deploy workflows so the new split-asset Yellow Cart store contract is accepted and enforced.

This task must not add:
- public manifest generation
- category pages
- pagination
- worker route changes
- new UI behavior
- product model changes beyond what is needed for CI/proof compatibility

Hard requirements:
1. Do not revert runtime JS back into store.html.
2. Do not put // STORE_LCP_PRODUCT_START back into store.html just to satisfy old preflight.
3. Do not re-inline large CSS or runtime JS.
4. Do not change visual UX.
5. Do not change worker route behavior.
6. Do not move index.xml or landing.html.
7. Do not add /store/fashion or pagination yet.
8. Do not add public manifest yet.
9. Make preflight understand the split-asset store contract.
10. Make CI and deploy run store build/proof before preflight, template pack, Cloudflare build, or deploy.

Files to update:
- tools/preflight.mjs
- tools/store-build.sh
- tools/build-store-static.mjs if needed
- tools/proof-store-static.mjs if needed
- package.json
- .github/workflows/ci.yml
- .github/workflows/deploy-cloudflare.yml
- .github/workflows/lighthouse-ci.yml

Part A — Update preflight for split-asset store contract

Old invalid assumption:
store.html must contain:
- // STORE_LCP_PRODUCT_START
- function readStaticProducts(
- function hydrateStaticProducts(
- function loadProducts(

New contract:
store.html must contain:
- name="gg-store-contract" content="store-static-prerender-v1"
- <!-- STORE_LCP_PRELOAD_START -->
- <!-- STORE_STATIC_GRID_START -->
- <!-- STORE_STATIC_PRODUCTS_JSON_START -->
- <script type="application/json" id="store-static-products">
- <!-- STORE_ITEMLIST_JSONLD_START -->
- <script type="application/ld+json" id="store-itemlist-jsonld">
- <!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->
- link to /assets/store/store.css
- deferred script to /assets/store/store.js
- inline theme boot script
- inline critical CSS block only

assets/store/store.js must contain runtime markers:
- STORE_LCP_PRODUCT_START
- function readStaticProducts(
- function hydrateStaticProducts(
- function loadProducts(
- data-store-open-preview
- store-static-products

assets/store/store.css must exist and contain store styling markers:
- .store-app
- .store-card
- .store-preview-sheet
- .store-semantic-category-rail
- .gg-dock

Preflight behavior:
1. Read store.html.
2. Read assets/store/store.js.
3. Read assets/store/store.css.
4. Fail if assets are missing.
5. Fail if store.html does not reference /assets/store/store.css.
6. Fail if store.html does not reference /assets/store/store.js with defer.
7. Fail if large runtime JS has been reintroduced inline into store.html.
8. Fail if store.html contains old runtime functions:
   - function readStaticProducts(
   - function hydrateStaticProducts(
   - function loadProducts(
9. Pass if those runtime markers exist in assets/store/store.js.
10. Keep JSON-LD/static snapshot checks in store.html.
11. Keep existing worker, service worker, index.xml, wrangler, manifest, and template checks unchanged unless directly needed.
12. Make error messages point to the correct file.

Replace this old error style:
"store.html is missing static store marker: // STORE_LCP_PRODUCT_START"

With:
"assets/store/store.js is missing runtime store marker: // STORE_LCP_PRODUCT_START"

Add helper checks if useful:
- assertFileIncludes(relativePath, needle, label)
- assertFileExists(relativePath, label)
- assertAssetReference(storeSource, hrefOrSrc, label)

Part B — Update package scripts

Add or normalize these scripts:

{
  "store:build": "bash tools/store-build.sh",
  "store:proof": "node tools/proof-store-static.mjs",
  "store:check": "npm run store:build && npm run store:proof",
  "store:check:ci": "STORE_CI=1 STORE_REQUIRE_LIVE_FEED=0 STORE_STRICT_IMAGES=0 npm run store:check",
  "store:check:strict": "STORE_CI=1 STORE_REQUIRE_LIVE_FEED=1 STORE_STRICT_IMAGES=1 npm run store:check"
}

Preserve backward compatibility if existing script names are already used.

Part C — Stabilize tools/store-build.sh

tools/store-build.sh must:
1. Be deterministic in CI.
2. Avoid raw curl timeout noise.
3. If a feed probe is diagnostic only, print controlled warnings:
   - "STORE FEED PROBE WARN ..."
4. Support env:
   - STORE_CI=1
   - STORE_REQUIRE_LIVE_FEED=0|1
   - STORE_STRICT_IMAGES=0|1
   - STORE_FEED_TIMEOUT_SECONDS=20
5. If STORE_REQUIRE_LIVE_FEED=0 and feed fails:
   - fallback to existing static snapshot
   - emit warning
   - build should pass
6. If STORE_REQUIRE_LIVE_FEED=1 and feed fails:
   - build must fail
7. Always write a machine-readable report:
   - .store-build-report.json
   or
   - dist/store-build-report.json

Build report must include:
{
  "source": "live-feed | existing-static",
  "products": 20,
  "categoryCounts": {...},
  "feedEntries": 21,
  "validProducts": 20,
  "invalidProducts": 0,
  "imageSourceSummary": {...},
  "warnings": [],
  "strict": false,
  "timestamp": "..."
}

Part D — Update CI workflow

Update .github/workflows/ci.yml.

Expected CI order:
1. checkout
2. setup node
3. npm ci
4. npm run store:check:ci
5. npm run gaga:template:pack
6. npm run gaga:preflight
7. npm run gaga:cf:dry

Add CI steps:
- Build/proof Yellow Cart store:
  npm run store:check:ci

- Verify store split assets:
  - store.html exists
  - assets/store/store.css exists
  - assets/store/store.js exists
  - store.html references /assets/store/store.css
  - store.html references /assets/store/store.js

- Append store build report to GitHub Step Summary.

- Upload store build report as artifact.

Part E — Update Cloudflare deploy workflow

Update .github/workflows/deploy-cloudflare.yml.

Expected deploy order:
1. checkout
2. setup node
3. npm ci
4. npm run store:check:ci
5. verify store split assets
6. npm run gaga:template:pack
7. npm run gaga:preflight
8. npm run build
9. npm run gaga:verify-store-artifact
10. npm run gaga:cf:deploy
11. npm run gaga:verify-worker-live

Important:
Do not use store:check:strict for current deploy yet because current staging images still use picsum.photos.

Current deploy should block on:
- dummy
- Etc
- duplicate slug
- broken JSON-LD
- missing store assets
- inline runtime JS regression
- broken store.html references
- missing static snapshot

Current deploy should warn only on:
- picsum.photos
- temporary live feed fallback

Unless strict env is explicitly enabled.

Part F — Update Lighthouse CI workflow

Update .github/workflows/lighthouse-ci.yml.

Add /store to Lighthouse route list.

Routes should include:
- /
- /landing
- /search
- /store

Do not make Lighthouse deploy-blocking in this task unless it already was deploy-blocking before.

Part G — Proof mode behavior

Make proof support:
- normal mode
- CI mode
- strict mode

Normal / CI:
- picsum.photos = warn
- existing-static fallback = warn
- live feed unreachable = warn if fallback exists

Strict:
- picsum.photos = fail
- existing-static fallback = fail
- live feed unreachable = fail

Acceptance criteria:
1. npm run store:build passes.
2. npm run store:proof passes.
3. npm run store:check:ci passes.
4. npm run gaga:preflight passes.
5. preflight passes with current split-asset architecture.
6. preflight fails if assets/store/store.js is missing.
7. preflight fails if assets/store/store.css is missing.
8. preflight fails if runtime JS is re-inlined into store.html.
9. CI workflow runs store:check:ci before gaga:preflight.
10. Deploy workflow runs store:check:ci before npm run build and Cloudflare deploy.
11. Store asset files are verified before deploy.
12. Store build report is uploaded as GitHub artifact.
13. Store build report appears in GitHub Step Summary.
14. Raw curl timeout noise is replaced by controlled STORE FEED PROBE WARN.
15. No manifest/category/pagination feature work is added.

Deliverables:
- Updated tools/preflight.mjs
- Updated tools/store-build.sh
- Updated package.json scripts
- Updated .github/workflows/ci.yml
- Updated .github/workflows/deploy-cloudflare.yml
- Updated .github/workflows/lighthouse-ci.yml
- Build/proof/preflight output
- Short explanation of changed CI/deploy order