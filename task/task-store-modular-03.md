TASK 003 — Make Blogger Store Feed the Source of Truth

Context:
Task 001 extracted store CSS/JS.
Task 002 added product normalization, validation, category governance, dummy removal, and stronger proof.

Current build output:
- npm run store:build passes
- npm run store:proof passes
- products=20
- itemList=20
- categories are balanced
- dummy removed
- Etc normalized
- BUT build still reports source=existing-static
- live Store feed fails validation because all live feed products are missing image
- build falls back to existing static snapshot

Goal:
Make the live Blogger Store feed the real source of truth for Yellow Cart products.

This task must fix feed extraction/parsing only.
Do not implement category pages, pagination, or public manifest yet.

Hard requirements:
1. Do not change visual UX.
2. Do not change worker.js.
3. Do not change routes.
4. Do not change CSS/JS extraction from Task 001.
5. Do not change category governance from Task 002.
6. Build should prefer live Store feed when valid.
7. Existing static snapshot may remain only as fallback.
8. Build must correctly extract product images from live product posts.
9. Build must correctly extract .gg-store-data JSON from Blogger feed content.
10. If Blogger feed strips or escapes script tags, parser must handle escaped content safely.
11. Product post remains the canonical full-detail source.
12. No pagination/category page generation in this task.

Files to update:
- tools/build-store-static.mjs
- src/store/lib/extract-static-products.mjs
- src/store/lib/normalize-store-product.mjs
- src/store/lib/validate-store-product.mjs
- src/store/lib/store-report.mjs
- Add new helper if needed:
  src/store/lib/extract-feed-products.mjs
  src/store/lib/extract-product-images.mjs
  src/store/lib/decode-blogger-content.mjs

Feed extraction behavior:
1. Fetch all Blogger Store feed entries, not only first page if pagination is available.
2. For each entry, inspect:
   - entry.content.$t
   - entry.summary.$t
   - media$thumbnail
   - enclosure/media links if available
   - link rel alternate for canonical post URL
3. Extract embedded product JSON from:
   <script type="application/json" class="gg-store-data">...</script>
4. Also support escaped Blogger content where script tags become encoded HTML.
5. Decode HTML entities safely before parsing product JSON.
6. If gg-store-data images exist, use them.
7. If gg-store-data images are missing, fallback to:
   - first image inside post content
   - media$thumbnail upgraded when possible
   - existing static image for same slug only as fallback with warning
8. Do not invent image URLs silently.
9. If image cannot be found after all fallbacks, validation should fail for that product.
10. Build should report exactly which extraction path was used per product:
    - gg-store-data.images
    - post-content-img
    - media-thumbnail
    - existing-static-fallback
    - missing

Normalization requirements:
- Keep Task 002 normalized product shape.
- Keep categoryKey rules:
  fashion, skincare, workspace, tech, everyday
- Keep public labels:
  Fashion, Skincare, Workspace, Tech, Lainnya
- Keep dummy/Etc rejection.

Build output target:
After this task, npm run store:build should ideally output:
source=live-feed
products=20
status=updated or unchanged
categoryCounts=Fashion:4, Skincare:4, Workspace:4, Tech:4, Lainnya:4
imageSourceSummary=...

If some feed products still require image fallback from existing static snapshot:
- allow it in non-production with warnings
- fail in production unless explicitly allowed by flag

Proof updates:
Update proof-store-static.mjs to verify:
1. Build report exists.
2. Build report includes source type.
3. Build report includes image source summary.
4. If source=existing-static, proof should WARN in non-production.
5. If source=existing-static in production, proof should FAIL.
6. If any live feed product failed image extraction, proof should WARN in non-production and FAIL in production.
7. Existing rules from Task 001 and Task 002 remain active:
   - no dummy
   - no Etc
   - no duplicate slugs
   - JSON-LD itemList count equals product count
   - no inline runtime JS
   - critical CSS budget respected
   - assets/store/store.css and assets/store/store.js exist
   - production fails on picsum.photos

Debug output:
Add a clear build report section like:

FEED EXTRACTION REPORT
source=live-feed
entries=20
validProducts=20
invalidProducts=0
imageSources:
  gg-store-data.images=20
  post-content-img=0
  media-thumbnail=0
  existing-static-fallback=0
  missing=0

If fallback happens:
imageSources:
  gg-store-data.images=0
  post-content-img=0
  media-thumbnail=0
  existing-static-fallback=20
  missing=0

Commands that must pass:
npm run store:build
npm run store:proof

Expected result:
The build should no longer say:
"live Store feed failed validation: missing image"

The ideal result is:
source=live-feed
products=20
STORE STATIC PROOF PASS

Important:
Do not add manifest.json yet.
Do not generate /store/fashion yet.
Do not generate /store/fashion/page/2 yet.
This task is only about making the product feed reliable as the source of truth.