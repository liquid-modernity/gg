TASK 002 — Product Data Governance, Normalization, and Proof Hardening

Context:
Task 001 successfully extracted the Yellow Cart store CSS and JS from store.html into:
- src/store/store.critical.css
- src/store/store.css
- src/store/store.js
- assets/store/store.css
- assets/store/store.js

The build currently still reports:
source=existing-static
products=21
itemList=21

This means the store build is still relying on the existing static snapshot in store.html. Before adding category pages, pagination, or manifest generation, we need to make the product data layer clean, normalized, deduplicated, and proofed.

Goal:
Create a clean product-data governance layer for Yellow Cart without changing the current UX, routes, or pagination behavior yet.

This task must not implement category pages or pagination yet.
This task prepares the data layer so future tasks can safely generate /store/category and /page/2 outputs.

Hard requirements:
1. Do not change the visual UX of /store.
2. Do not change route behavior.
3. Do not change worker.js.
4. Do not move index.xml or landing.html.
5. Do not implement category pages or pagination yet.
6. Do not add manifest.json yet unless only as an internal proof artifact. Public manifest generation is Task 003.
7. Keep external CSS/JS extraction from Task 001 intact.
8. Preserve current preview sheet, discovery sheet, category rail, saved products, copy links, and feed fallback behavior.
9. Strengthen data normalization and proof rules.

Create these files:
- src/store/store.config.mjs
- src/store/lib/normalize-store-product.mjs
- src/store/lib/validate-store-product.mjs
- src/store/lib/category-config.mjs
- src/store/lib/build-store-jsonld.mjs
- src/store/lib/extract-static-products.mjs
- src/store/lib/store-report.mjs

Update:
- tools/build-store-static.mjs
- tools/proof-store-static.mjs

Product normalization rules:
Each product must normalize to this shape:

{
  id,
  slug,
  name,
  category,
  categoryKey,
  priceText,
  price,
  priceCurrency,
  brand,
  summary,
  verdict,
  whyPicked,
  bestFor,
  notes,
  caveat,
  material,
  useCase,
  geoContext,
  tags,
  images,
  links,
  canonicalUrl,
  storeUrl,
  datePublished,
  dateModified
}

Category rules:
Use canonical internal category keys:
- fashion
- skincare
- workspace
- tech
- everyday

Public display labels:
- Fashion
- Skincare
- Workspace
- Tech
- Lainnya

SEO route labels for future tasks:
- /store/fashion
- /store/skincare
- /store/workspace
- /store/tech
- /store/everyday

Normalize these legacy values:
- "Etc" → categoryKey "everyday", display label "Lainnya"
- "Lainnya" → categoryKey "everyday", display label "Lainnya"
- "Everyday" → categoryKey "everyday", display label "Lainnya"

Hard fail if public output still contains category "Etc".

Slug rules:
- slug must be lowercase kebab-case
- slug must not contain "dummy"
- slug must not look like a URL
- slug must not contain spaces
- slug must not end with .html
- slug must be unique

Name rules:
- name must not contain "dummy"
- name must not be empty
- name should be human-readable

Image rules:
- product must have at least one image
- first image is used for card/LCP selection when relevant
- production proof must fail on picsum.photos, but non-production proof may warn only

Current cleanup:
- Remove "Dummy Desk Tray Organizer" from generated public output.
- If "Minimal Desk Tray Organizer" exists, keep it and use it as the real replacement.
- Ensure total product count becomes 20 if the only extra item is the legacy dummy product.
- Normalize "Everyday Canvas Tote" from "Etc" to "Lainnya"/categoryKey "everyday".

JSON-LD rules:
- JSON-LD ItemList numberOfItems must equal the visible/static product count on the current /store page.
- JSON-LD must not contain dummy products.
- JSON-LD must not contain public category "Etc".
- Do not add Offer markup for marketplace search URLs.
- Keep Product markup simple unless product post has real offer details.

Build behavior:
1. Extract current static products from store.html or feed fallback as before.
2. Normalize all products with normalize-store-product.mjs.
3. Validate all products with validate-store-product.mjs.
4. Dedupe by slug.
5. Remove invalid legacy dummy products.
6. Rebuild the static snapshot, grid, semantic notes, and JSON-LD using normalized products.
7. Keep output behavior as a single /store page for now.
8. Write a build report:
   - product count
   - category counts
   - removed invalid products
   - duplicate slugs
   - warnings
   - source type

Proof behavior:
Update proof-store-static.mjs to fail if:
1. Any output contains "Dummy" or "dummy".
2. Any public output contains category "Etc".
3. Any duplicate slug exists.
4. Any slug looks like a URL.
5. Any slug ends with .html.
6. Any product is missing name, slug, categoryKey, canonicalUrl, or image.
7. JSON-LD ItemList count differs from normalized product count.
8. JSON-LD contains dummy product.
9. JSON-LD contains public category "Etc".
10. store.html references missing /assets/store/store.css or /assets/store/store.js.
11. inline runtime JS has returned to store.html.
12. critical CSS exceeds the existing Task 001 budget.
13. production mode contains picsum.photos.

Commands that must pass:
npm run store:build
npm run store:proof

Expected proof after cleanup:
- products=20 if the only extra product was Dummy Desk Tray Organizer
- category counts should roughly be:
  Fashion: 4
  Skincare: 4
  Workspace: 4
  Tech: 4
  Lainnya/everyday: 4
- itemList must equal normalized visible product count
- no Dummy
- no Etc in public output

Deliverables:
1. Created src/store/store.config.mjs
2. Created category config module
3. Created normalize-store-product.mjs
4. Created validate-store-product.mjs
5. Created build-store-jsonld.mjs
6. Created extract-static-products.mjs
7. Updated tools/build-store-static.mjs
8. Updated tools/proof-store-static.mjs
9. Cleaned generated store.html output
10. Build report
11. Proof output

Important:
Do not implement category pages, pagination, public manifest, or route mapping in this task. This is a data cleanliness and governance task only.