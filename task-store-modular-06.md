TASK 004C — Update Live Smoke Worker for Split-Asset Store Contract

Context:
Task 001 extracted Yellow Cart CSS/JS from store.html into:
- assets/store/store.css
- assets/store/store.js
- src/store/store.css
- src/store/store.js

Task 004 updated tools/preflight.mjs and CI/deploy workflow so local preflight understands the split-asset store contract.

Current deploy still fails at:
npm run gaga:verify-worker-live
which runs:
bash qa/live-smoke-worker.sh "${GG_LIVE_BASE_URL:-https://www.pakrpp.com}"

Current failure:
FAIL: /store LCP product seed marker is missing
FAIL: /store preview sheet CSS block is missing

Root cause:
qa/live-smoke-worker.sh still assumes the old single-file store contract. It checks runtime JS markers and CSS rules directly inside the /store HTML body. After Task 001, those markers must live in external assets:
- /assets/store/store.js
- /assets/store/store.css

Goal:
Update qa/live-smoke-worker.sh so live smoke validates the new split-asset store contract correctly.

This task must not:
- re-inline runtime JS into store.html
- re-inline full CSS into store.html
- change worker routes
- change store UI
- add manifest
- add category pages
- add pagination

Hard requirements:
1. Keep /store HTML checks for static/SEO/shell markers.
2. Move runtime JS marker validation from /store body to /assets/store/store.js.
3. Move full CSS marker validation from /store body to /assets/store/store.css.
4. Keep critical CSS / first-paint checks in /store body where appropriate.
5. Keep proof-store-static validation on fetched /store body.
6. Keep route/header/diagnostic checks unchanged unless directly related to store split assets.

Update qa/live-smoke-worker.sh:

In check_store_route:
- Keep these /store HTML checks:
  - canonical title
  - canonical /store
  - gg-store-contract
  - H1 Yellow Cart
  - affiliate disclosure
  - STORE_LCP_PRELOAD_START / END
  - STORE_STATIC_GRID_START / END
  - STORE_STATIC_PRODUCTS_JSON_START
  - STORE_ITEMLIST_JSONLD_START
  - STORE_STATIC_SEMANTIC_PRODUCTS_START
  - static grid exists
  - static products payload exists
  - ItemList JSON-LD exists
  - sheets exist
  - dock exists
  - CTA rel/target contracts
  - no stale copy

- Add HTML checks:
  - /store references /assets/store/store.css
  - /store references /assets/store/store.js
  - /assets/store/store.js is loaded with defer
  - /store does NOT contain large runtime functions:
    - function readStaticProducts(
    - function hydrateStaticProducts(
    - function loadProducts(

- Remove/replace these old /store body checks:
  - grep -Fq 'STORE_LCP_PRODUCT_START' "$body_file"
  - grep -Eq '\.store-preview-sheet\s*\{' "$body_file"
  - grep -Eq 'align-items:\s*start;' "$body_file" as a body-only CSS check
  - grep -Eq 'aspect-ratio:\s*var\(--store-card-aspect\)' "$body_file" as a body-only full CSS check
  - any other full CSS/running JS marker check that now belongs in external assets

Add new function:
check_store_split_assets()

This function should:
1. Fetch /assets/store/store.js into a temp file.
2. Fetch /assets/store/store.css into a temp file.
3. Validate both return HTTP 200.
4. Log route timing for each asset.
5. Validate JS asset contains:
   - STORE_LCP_PRODUCT_START
   - function readStaticProducts(
   - function hydrateStaticProducts(
   - function loadProducts(
   - data-store-open-preview
   - store-static-products
6. Validate CSS asset contains:
   - .store-app
   - .store-card
   - .store-preview-sheet
   - align-items: start;
   - .store-semantic-category-rail
   - .gg-dock
   - aspect-ratio: var(--store-card-aspect)
7. Validate CSS asset contains card/media radius token if still part of contract:
   - border-radius: 10px;
8. Validate content-type warnings:
   - JS should look like javascript/text/plain
   - CSS should look like text/css/text/plain
   Do not hard-fail on unusual content-type unless the body is empty or non-200.
9. Fail if either asset is missing or empty.

Call check_store_split_assets after check_store_route, or inside check_store_route after confirming /store references the assets.

Error message updates:
Old:
FAIL: /store LCP product seed marker is missing
New:
FAIL: /assets/store/store.js missing runtime marker: STORE_LCP_PRODUCT_START

Old:
FAIL: /store preview sheet CSS block is missing
New:
FAIL: /assets/store/store.css missing style marker: .store-preview-sheet

Acceptance criteria:
1. npm run gaga:verify-worker-live passes on the current split-asset deployment.
2. The script still fails if /assets/store/store.js is missing.
3. The script still fails if /assets/store/store.css is missing.
4. The script still fails if /store does not reference /assets/store/store.css.
5. The script still fails if /store does not reference /assets/store/store.js with defer.
6. The script fails if runtime JS functions are re-inlined into /store.
7. The script still runs proof-store-static against fetched /store body.
8. No manifest/category/pagination feature work is added.
9. CI deploy can pass beyond gaga:verify-worker-live.

Commands to run:
npm run store:check:ci
npm run gaga:preflight
bash qa/live-smoke-worker.sh https://www.pakrpp.com
npm run gaga:verify-worker-live