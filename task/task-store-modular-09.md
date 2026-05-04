TASK 005 — Generate Lightweight Yellow Cart Discovery Manifest

Context:
Task 001 extracted Yellow Cart CSS/JS into split assets.
Task 002 added product data governance, normalization, category cleanup, dummy removal, and stronger proof.
Task 003 made Blogger Store feed extraction work as the preferred source of truth when reachable.
Task 004 stabilized preflight, CI/deploy order, split-asset live smoke, and local/strict live smoke modes.

Current status:
- npm run store:check:ci passes
- npm run gaga:preflight passes
- npm run gaga:verify-worker-live:local exits 0 on INFRA_UNREACHABLE_WARN
- strict live smoke still fails when the host is unreachable, by design
- store currently has 20 normalized products
- categories are balanced:
  Fashion: 4
  Skincare: 4
  Workspace: 4
  Tech: 4
  Lainnya: 4
- current non-production mode may warn on existing-static fallback and picsum.photos

Goal:
Generate a lightweight discovery manifest for Yellow Cart so the future discovery sheet can search/filter products quickly without reading product cards from DOM or embedding all product detail data in store.html.

This task generates the manifest only.

Do not:
- make discovery sheet consume the manifest yet
- add category pages
- add pagination
- change worker routes
- change visual UX
- re-inline JS/CSS
- change product post structure

Hard requirements:
1. Do not change current /store UI behavior.
2. Do not change worker.js.
3. Do not add /store/fashion or pagination yet.
4. Do not make discovery sheet load the manifest yet.
5. Do not re-inline runtime JS into store.html.
6. Do not add full product detail fields to the manifest.
7. Do not include marketplace link maps in the manifest.
8. Do not include long editorial fields such as whyPicked, bestFor, notes, caveat, geoContext, or full verdict.
9. Keep product posts as the canonical full-detail source.
10. Keep existing store build/proof/preflight behavior green.

Create:
- src/store/lib/build-store-manifest.mjs

Update:
- tools/build-store-static.mjs
- tools/proof-store-static.mjs
- qa/store-artifact-smoke.sh
- package.json only if needed

Output:
Generate:

- store/data/manifest.json

If dist output exists or is used by current build/deploy, also mirror:

- dist/store/data/manifest.json

Manifest shape:

{
  "version": "store-manifest-v1",
  "generatedAt": "ISO timestamp",
  "source": "live-feed | existing-static",
  "count": 20,
  "categories": [
    {
      "key": "fashion",
      "label": "Fashion",
      "count": 4,
      "path": "/store/fashion"
    },
    {
      "key": "skincare",
      "label": "Skincare",
      "count": 4,
      "path": "/store/skincare"
    },
    {
      "key": "workspace",
      "label": "Workspace",
      "count": 4,
      "path": "/store/workspace"
    },
    {
      "key": "tech",
      "label": "Tech",
      "count": 4,
      "path": "/store/tech"
    },
    {
      "key": "everyday",
      "label": "Lainnya",
      "count": 4,
      "path": "/store/everyday"
    }
  ],
  "items": [
    {
      "slug": "neutral-linen-overshirt",
      "name": "Neutral Linen Overshirt",
      "categoryKey": "fashion",
      "categoryLabel": "Fashion",
      "price": 159000,
      "priceText": "Rp159.000",
      "priceBand": "100k-200k",
      "summary": "Overshirt linen bernuansa netral untuk tampilan ringan.",
      "image": "https://...",
      "url": "https://www.pakrpp.com/2026/04/neutral-linen-overshirt.html",
      "storeUrl": "https://www.pakrpp.com/store?item=neutral-linen-overshirt",
      "tags": ["linen", "neutral", "layering"],
      "intent": ["workwear", "travel"],
      "datePublished": "2026-04-27",
      "dateModified": "2026-05-04",
      "sort": {
        "name": "neutral linen overshirt",
        "date": "2026-05-04",
        "price": 159000,
        "score": 0
      }
    }
  ]
}

Allowed manifest item fields:
- slug
- name
- categoryKey
- categoryLabel
- price
- priceText
- priceBand
- summary
- image
- url
- storeUrl
- tags
- intent
- datePublished
- dateModified
- sort

Forbidden manifest item fields:
- whyPicked
- bestFor
- notes
- caveat
- geoContext
- links
- shopee
- tokopedia
- tiktok
- full marketplace URL maps
- long verdict

Price band rules:
Use these bands:
- under-50k
- 50k-100k
- 100k-200k
- 200k-500k
- over-500k
- unknown

Intent rules:
Build intent from tags, useCase, bestFor, and category, but keep it short.

Normalize intent values to lowercase kebab-case where possible:
- workwear
- travel
- daily
- study
- workspace
- wfh
- skincare-routine
- hydration
- cable-management
- portable
- campus
- compact
- gift

Do not include more than 8 intent values per product.

Summary rule:
Manifest summary must be short.
Target max 140 characters.
If product summary is longer, trim safely without breaking words.

Image rule:
Use only one image per manifest item:
- the first normalized product image

URL rule:
- url must point to the canonical product post
- storeUrl must point to /store?item={slug}

Category rule:
- No public "Etc"
- categoryKey "everyday" should display as "Lainnya"
- future route path should be /store/everyday

Build behavior:
1. Use the same normalized governed product set from Task 002/003.
2. Build manifest after products are normalized and deduped.
3. Write manifest to store/data/manifest.json.
4. Mirror to dist/store/data/manifest.json if dist output exists.
5. Include manifest summary in the existing store build report:
   - manifestPath
   - manifestBytes
   - manifestItems
   - manifestCategories
6. Do not inject the full manifest into store.html.
7. Do not make store.js load it yet.

Proof behavior:
Update proof-store-static.mjs to fail if:
1. store/data/manifest.json is missing.
2. manifest is invalid JSON.
3. manifest.version is missing.
4. manifest.items.length does not equal normalized product count.
5. manifest has duplicate slugs.
6. manifest contains "dummy".
7. manifest contains public category "Etc".
8. any manifest item contains forbidden long fields:
   - whyPicked
   - bestFor
   - notes
   - caveat
   - geoContext
   - links
9. any manifest item is missing:
   - slug
   - name
   - categoryKey
   - categoryLabel
   - priceText
   - summary
   - image
   - url
   - storeUrl
10. any manifest item has more than 8 intent values.
11. any manifest summary exceeds 180 characters.
12. manifest source/count disagree with build report.
13. manifest is injected inline into store.html.
14. manifest references /store/etc or categoryKey "etc".

Proof should warn, not fail in non-production, if:
- manifest image uses picsum.photos
- manifest source is existing-static

Strict mode should fail if:
- manifest image uses picsum.photos
- build source is existing-static
- feed fallback image source is existing-static-fallback

qa/store-artifact-smoke.sh:
Update smoke test to verify:
- store/data/manifest.json exists
- manifest JSON parses
- item count > 0
- no dummy
- no Etc
- store.html does not inline the manifest
- store.html still references assets/store/store.css
- store.html still references assets/store/store.js

CI/deploy:
Do not change workflow order unless needed.
The existing sequence should remain:
- npm run store:check:ci
- verify store split assets
- template pack
- preflight
- build/deploy

Commands that must pass:
npm run store:build
npm run store:proof
npm run store:check:ci
bash qa/store-artifact-smoke.sh
npm run gaga:preflight
npm run gaga:verify-worker-live:local

Expected result:
- store/data/manifest.json generated
- manifest contains 20 items
- manifest category counts match store build report
- no UX change
- no category pages yet
- no pagination yet
- no discovery runtime change yet

Deliverables:
1. Created src/store/lib/build-store-manifest.mjs
2. Updated tools/build-store-static.mjs
3. Updated tools/proof-store-static.mjs
4. Updated qa/store-artifact-smoke.sh
5. Generated store/data/manifest.json
6. Updated build report with manifest summary
7. Build/proof/preflight/local-live-smoke output