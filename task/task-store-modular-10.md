# TASK 006 — Discovery Sheet Lazy-Loads Manifest

## Context

Task 005 generated the lightweight discovery manifest:

```text
store/data/manifest.json
```

The manifest is intentionally lightweight. It should support fast search/filter/sort without forcing the Discovery sheet to read all product cards from DOM or embed full product detail data in `store.html`.

## Goal

Make the Yellow Cart Discovery sheet lazy-load `store/data/manifest.json` and use it for search, category filtering, price filtering, intent filtering, and sorting.

This task changes discovery runtime behavior only.

## Do Not Do

- Do not add category pages.
- Do not add pagination.
- Do not change Worker routes.
- Do not re-inline runtime JS/CSS.
- Do not change product post structure.
- Do not inject the full manifest into `store.html`.
- Do not fetch full product detail data on initial page load.

## Files to Update

```text
src/store/store.js
assets/store/store.js
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh, only if needed
```

## Runtime Behavior

Discovery flow:

```text
User opens Discovery sheet
↓
store.js checks in-memory manifest cache
↓
if absent, fetch /store/data/manifest.json
↓
validate basic shape
↓
cache in memory for current session
↓
render discovery results from manifest
↓
if fetch fails, fallback to current static products
```

Add a helper such as:

```js
async function loadStoreManifest() {}
```

Validation must check:

- `version`
- `items` array
- `count`
- item `slug`, `name`, `categoryKey`, `categoryLabel`, `url`, `storeUrl`, `image`

Do not crash the page if manifest fetch fails.

## Discovery Filter Model

### Search fields

```text
name
categoryLabel
summary
tags
intent
priceText
```

Search should be case-insensitive. Diacritic-tolerant matching is preferred if simple.

### Category filters

```text
fashion
skincare
workspace
tech
everyday
```

Labels:

```text
Fashion
Skincare
Workspace
Tech
Lainnya
```

No public `Etc`.

### Price bands

```text
under-50k
50k-100k
100k-200k
200k-500k
over-500k
unknown
```

### Sort options

```text
recommended
newest
price-asc
price-desc
az
```

Default sort: `recommended`.

Recommended order:

1. `sort.score` descending if present.
2. `dateModified` or `datePublished` descending.
3. Name ascending.

## UI Requirements

Do not redesign the entire Discovery sheet. Power the existing sheet with manifest data.

Results should show compact rows/cards:

```text
image thumbnail
name
category label
priceText
short summary
primary action to preview/open product
```

Click behavior:

1. Prefer opening the existing preview sheet if the full product exists in static products.
2. Otherwise navigate to `storeUrl` or canonical product `url`.

## Performance Requirements

- Manifest must not block LCP.
- Manifest should load only when Discovery is opened, unless optional idle prefetch is added after first paint.
- Use a single in-memory manifest cache.
- Do not refetch repeatedly.

## Accessibility Requirements

- Search input must have an accessible label.
- Filter chips must expose selected/pressed state.
- Result count should update in an aria-live area if one exists.
- Keyboard navigation must remain usable.

## Proof Updates

Fail if:

1. `store/data/manifest.json` is missing.
2. `store.html` inlines the manifest.
3. `assets/store/store.js` does not reference `/store/data/manifest.json`.
4. `assets/store/store.js` no longer contains discovery hooks.
5. `assets/store/store.js` has no fallback to static products.
6. Any public output contains `Etc`.

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

- Discovery lazy-loads `store/data/manifest.json`.
- Discovery still works if manifest fetch fails.
- Initial `/store` load does not require manifest.
- Existing preview sheet still works.
- Existing saved products still work.
- Existing grid still works.
- No category pages.
- No pagination.
- No Worker route changes.
