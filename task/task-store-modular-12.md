# TASK 008 — Generate Store Pagination

## Context

Task 007 generated static category page artifacts. Category pages still need build-time pagination for large product counts.

## Goal

Generate static crawlable pagination for each category:

```text
/store/fashion/page/2
/store/fashion/page/3
/store/skincare/page/2
...
```

Do not add Worker clean route mapping yet unless temporary internal artifact paths require it. Public route mapping is Task 009.

## Hard Requirements

1. Do not change Worker route behavior yet.
2. Pagination must be static and crawlable.
3. Page 2 and later must have self-canonical URLs.
4. Page 2 and later must not canonicalize to page 1.
5. JSON-LD ItemList must include only visible products on that page.
6. Each page must include crawlable previous/next links.
7. Do not include all category products on page 1.
8. Do not include all products in `/store`.

## Files to Update

```text
src/store/store.config.mjs
src/store/lib/paginate-products.mjs
src/store/lib/render-category-page.mjs
src/store/lib/store-routes.mjs
src/store/lib/build-store-jsonld.mjs
tools/build-store-static.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
```

## Config

Use:

```js
export const STORE_CATEGORY_PAGE_SIZE = 48;
```

## Output Example

For Fashion with 130 products:

```text
/store/fashion              → items 1–48
/store/fashion/page/2       → items 49–96
/store/fashion/page/3       → items 97–130
```

Nested artifacts:

```text
store/fashion/index.html
store/fashion/page/2/index.html
store/fashion/page/3/index.html
```

Transitional flat artifacts may also be generated if needed:

```text
store-fashion.html
store-fashion-page-2.html
store-fashion-page-3.html
```

## Metadata

Page 1 canonical:

```text
https://www.pakrpp.com/store/fashion
```

Page 2 canonical:

```text
https://www.pakrpp.com/store/fashion/page/2
```

Page 2 title:

```text
Fashion Picks · Page 2 · Yellow Cart
```

## Crawlable Links

Use normal anchors.

Page 1:

```html
<a rel="next" href="/store/fashion/page/2">Next</a>
```

Page 2:

```html
<a rel="prev" href="/store/fashion">Previous</a>
<a rel="next" href="/store/fashion/page/3">Next</a>
```

Last page:

```html
<a rel="prev" href="/store/fashion/page/2">Previous</a>
```

## JSON-LD Rules

Each paginated page must have page-specific JSON-LD:

```text
CollectionPage
ItemList
ListItem entries for visible products only
```

Use global category positions if possible:

```text
Page 2 first item position = 49
```

`numberOfItems` must equal visible products on the page.

## Static Product Data and Semantic Notes

Each paginated page should include only visible products for:

```text
static product JSON
static grid
semantic notes
ItemList JSON-LD
```

Do not include the entire category product list on every page.

## Proof Updates

Fail if:

1. Category with more than page size does not generate page 2.
2. A page has more than page size items.
3. Page 2 canonical points to page 1.
4. Page 2 ItemList count mismatches visible products.
5. Page 2 has products from wrong category.
6. Page 2 has no crawlable previous link.
7. Non-last pages have no crawlable next link.
8. `/store` contains all products.
9. Any page contains `dummy`.
10. Any page contains public `Etc`.
11. Any page inlines full JS/CSS.
12. Any route path uses `/store/etc`.

Because the current dataset may not exceed 48 products/category, add a synthetic pagination fixture or proof mode that can validate pagination logic without polluting production output.

## Build Report

Add pagination summary:

```json
{
  "pagination": {
    "pageSize": 48,
    "categories": {
      "fashion": {
        "total": 130,
        "pages": 3,
        "paths": ["/store/fashion", "/store/fashion/page/2", "/store/fashion/page/3"]
      }
    }
  }
}
```

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

- Pagination generation exists and is tested.
- Current 20-product dataset may generate no page 2; acceptable.
- Synthetic pagination proof validates page 2/page 3 behavior.
- Page 2+ have self-canonical URLs.
- Crawlable previous/next links exist.
- JSON-LD is page-specific.
- No Worker route changes yet.
