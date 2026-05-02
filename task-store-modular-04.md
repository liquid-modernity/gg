TASK 004A — Update Preflight for Split-Asset Store Contract

Context:
Task 001 extracted Yellow Cart runtime JS and non-critical CSS out of store.html into:
- assets/store/store.css
- assets/store/store.js
- src/store/store.css
- src/store/store.js
- src/store/store.critical.css

Task 003 made store build/proof pass with:
- source=live-feed
- products=20
- itemList=20
- imageSourceSummary=gg-store-data.images:20

CI currently fails at:
npm run gaga:preflight
preflight: store.html is missing static store marker: // STORE_LCP_PRODUCT_START

Root cause:
tools/preflight.mjs still assumes the old single-file store contract where runtime JS markers existed inside store.html. After Task 001, those markers may live in assets/store/store.js or src/store/store.js instead.

Goal:
Update tools/preflight.mjs so it validates the new split-asset store architecture correctly.

Hard requirements:
1. Do not revert runtime JS back into store.html.
2. Do not put // STORE_LCP_PRODUCT_START back into store.html just to satisfy preflight.
3. Do not re-inline large JS.
4. Do not change store UI behavior.
5. Do not change worker routes.
6. Do not implement manifest/category/pagination yet.
7. Update preflight to understand split-asset store architecture.

Update tools/preflight.mjs:

Old invalid assumption:
- store.html must contain:
  - // STORE_LCP_PRODUCT_START
  - function readStaticProducts(
  - function hydrateStaticProducts(

New contract:
- store.html must contain HTML/static/SEO markers:
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

- assets/store/store.js must contain runtime markers:
  - STORE_LCP_PRODUCT_START
  - function readStaticProducts(
  - function hydrateStaticProducts(
  - function loadProducts(
  - data-store-open-preview
  - store-static-products

- assets/store/store.css must exist and contain store styling markers:
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
8. Fail if store.html still contains old full runtime functions:
   - function readStaticProducts(
   - function hydrateStaticProducts(
   - function loadProducts(
9. Pass if those runtime markers exist in assets/store/store.js instead.
10. Keep JSON-LD/static snapshot checks in store.html.
11. Keep contract marker checks.
12. Keep worker, SW, index.xml, wrangler, manifest checks unchanged unless needed.
13. Keep preflight fast and deterministic.

Add helper checks if useful:
- assertFileIncludes(relativePath, needle, label)
- assertAssetReference(storeSource, hrefOrSrc, label)

Also update error messages:
Instead of:
"store.html is missing static store marker: // STORE_LCP_PRODUCT_START"

Use:
"assets/store/store.js is missing runtime store marker: // STORE_LCP_PRODUCT_START"

Acceptance criteria:
1. npm run store:build passes.
2. npm run store:proof passes.
3. npm run gaga:preflight passes.
4. preflight still fails if assets/store/store.js is missing.
5. preflight still fails if assets/store/store.css is missing.
6. preflight fails if runtime JS is re-inlined into store.html.
7. preflight passes with current split-asset architecture.
8. CI can proceed past gaga:preflight.

Important:
This task is not allowed to add manifest, category pages, pagination, or worker route mapping.
This is only a preflight contract update for the already-completed CSS/JS extraction.