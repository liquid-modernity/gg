# TASK 007 — Generate Store Category Pages

## Context

The store currently has `/store` as the public listing page. Category filtering exists in UI, but category pages are not yet generated as separate crawlable pages.

## Goal

Generate static category landing pages:

```text
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
```

This task generates category page artifacts only. It must not add pagination yet. If a category exceeds the page size, render the first page worth of products and report that pagination is needed, but do not create `/page/2` yet.

## Do Not Do

- Do not change Worker route behavior yet.
- Do not add pagination.
- Do not break `/store`.
- Do not re-inline full CSS/JS.
- Do not dump all products into category pages.

## Files to Create or Update

```text
src/store/lib/render-store-page.mjs
src/store/lib/render-category-page.mjs
src/store/lib/store-routes.mjs
src/store/lib/build-store-jsonld.mjs
tools/build-store-static.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
```

## Output Paths

Preferred nested artifacts:

```text
store/fashion/index.html
store/skincare/index.html
store/workspace/index.html
store/tech/index.html
store/everyday/index.html
```

If flat deployment still needs transitional files, also generate:

```text
store-fashion.html
store-skincare.html
store-workspace.html
store-tech.html
store-everyday.html
```

Canonical URLs must be clean:

```text
https://www.pakrpp.com/store/fashion
https://www.pakrpp.com/store/skincare
https://www.pakrpp.com/store/workspace
https://www.pakrpp.com/store/tech
https://www.pakrpp.com/store/everyday
```

## Category Config

Use governed category keys:

```text
fashion   → label Fashion   → /store/fashion
skincare  → label Skincare  → /store/skincare
workspace → label Workspace → /store/workspace
tech      → label Tech      → /store/tech
everyday  → label Lainnya   → /store/everyday
```

No public `Etc`.

## Page Content Requirements

Each category page must include:

1. Unique `<title>`.
2. Unique meta description.
3. Self canonical URL.
4. OG/Twitter metadata.
5. H1 for the category.
6. Short editorial intro.
7. Category rail linking category pages.
8. Static grid for that category only.
9. Static product JSON for visible category products only.
10. Semantic notes for visible category products only.
11. ItemList JSON-LD for visible category products only.
12. Link back to `/store`.
13. External `/assets/store/store.css` and deferred `/assets/store/store.js`.

## Example Titles

```text
Fashion Picks · Yellow Cart
Skincare Picks · Yellow Cart
Workspace Picks · Yellow Cart
Tech Picks · Yellow Cart
Everyday Picks · Yellow Cart
```

## Product Limits

Use:

```text
CATEGORY_PAGE_SIZE = 48
```

For current 20 products, all categories should fit.

Future rule: do not render more than 48 products in a category page in this task.

## JSON-LD Rules

Category page JSON-LD must include:

```text
CollectionPage
ItemList
Product entries for visible products only
```

`numberOfItems` must equal visible products on that category page.

Do not add Offer markup for marketplace search URLs.

## Proof Updates

Fail if:

1. Category artifact is missing.
2. Category page canonical is wrong.
3. Category title is duplicated from `/store` without category context.
4. Category ItemList count mismatches visible products.
5. Category page contains products from the wrong category.
6. Category page contains `Etc`.
7. Category page contains `dummy`.
8. Category page inlines full CSS/JS.
9. Category page misses `/assets/store/store.css`.
10. Category page misses deferred `/assets/store/store.js`.
11. Category page includes more than 48 products.
12. Product slug duplicates exist across pages.

## Smoke Updates

Artifact smoke should verify category artifacts exist and parse.

Do not require live Worker route checks yet; Worker mapping is Task 009.

## Commands That Must Pass

```bash
npm run store:build
npm run store:proof
npm run store:check:ci
bash qa/store-artifact-smoke.sh
npm run gaga:preflight
npm run gaga:verify-worker-live:local
```

## Acceptance Criteria

- `/store` still works.
- Category artifacts are generated.
- Each category page has correct canonical, title, and product subset.
- Category pages use split CSS/JS assets.
- No pagination yet.
- No Worker route changes yet.
