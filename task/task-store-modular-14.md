# TASK 010 — Production Strict Image and Cache Budgets

## Context

Yellow Cart now has split assets, governed product data, feed extraction, manifest discovery, category pages, pagination, and Worker clean routes.

Current non-production mode may still warn on:

```text
picsum.photos
existing-static fallback
existing-static-fallback images
development noindex lockdown
no-store cache policy
```

That is acceptable during staging. It is not acceptable for production launch.

## Goal

Add strict production checks for image source, cache policy, indexability, file size budgets, manifest safety, JSON-LD integrity, and store route readiness.

## Hard Requirements

1. Do not add new features.
2. Do not weaken proof.
3. Production mode must fail on placeholder images.
4. Production mode must fail on `existing-static` source unless explicitly approved.
5. Production mode must fail on static image fallback unless explicitly approved.
6. Production mode must enforce cache policy for assets.
7. Production mode must enforce indexability for store/category/pagination routes.
8. Development mode may continue warning.

## Production Strict Environment

Support:

```text
STORE_STRICT_IMAGES=1
STORE_REQUIRE_LIVE_FEED=1
STORE_PRODUCTION=1
GG_EDGE_MODE=production
```

## Image Rules

Production must fail if any product image uses:

```text
picsum.photos
placehold.co
placeholder.com
dummyimage.com
via.placeholder.com
```

Production must fail if any image URL is:

```text
empty
non-HTTPS
data URI
blob URL
localhost
relative when absolute is required
```

## Product Source Rules

Production strict must fail if:

```text
source=existing-static
imageSourceSummary.existing-static-fallback > 0
validProducts = 0
products count mismatches manifest count
```

Allowed production source:

```text
live-feed
```

Optional emergency override may exist, but default must fail.

## Cache Policy Rules

### HTML store routes

Recommended production:

```text
Cache-Control: public, max-age=300, stale-while-revalidate=86400
```

Routes:

```text
/store
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
/store/{category}/page/{n}
```

### CSS/JS assets

Preferred hashed assets:

```text
/assets/store/store.[hash].css
/assets/store/store.[hash].js
```

If hashed:

```text
Cache-Control: public, max-age=31536000, immutable
```

If non-hashed:

```text
Cache-Control: public, max-age=300, stale-while-revalidate=86400
```

### Manifest

```text
/store/data/manifest.json
```

Recommended:

```text
Cache-Control: public, max-age=300, stale-while-revalidate=86400
```

Do not cache manifest as immutable unless hashed/versioned.

## Size Budgets

Production proof budgets:

```text
/store HTML: max 250 KB uncompressed
category HTML: max 350 KB uncompressed per page
inline critical CSS: max 15 KB
external store.css gzip: warn above 70 KB, fail above 120 KB
external store.js gzip: warn above 90 KB, fail above 150 KB
manifest gzip: warn above 250 KB, fail above 500 KB
products visible in /store: max 50
products visible per category page: max 60
```

## SEO/Robots Production Rules

Production must not include:

```text
noindex
nofollow
nosnippet
noimageindex
max-snippet:0
max-image-preview:none
```

Routes that should be indexable:

```text
/store
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
pagination pages, unless intentionally noindexed
```

## JSON-LD Production Rules

Fail if:

1. JSON-LD invalid.
2. ItemList count mismatches visible product count.
3. Product entries contain dummy data.
4. Product entries contain `Etc`.
5. Product entries include Offer markup for marketplace search URLs.
6. Page 2 canonical points to page 1.
7. Category page contains products outside its category.
8. JSON-LD contains more products than visible HTML.

## Manifest Production Rules

Fail if:

1. Manifest missing.
2. Manifest invalid JSON.
3. Manifest inlined in HTML.
4. Manifest has forbidden long fields.
5. Manifest has dummy.
6. Manifest has `Etc`.
7. Manifest count mismatches governed products.
8. Manifest image uses placeholder domain.
9. Manifest is too large.
10. Manifest contains marketplace link maps.

## CI/Deploy Scripts

Recommended:

```json
{
  "store:check:ci": "STORE_CI=1 STORE_REQUIRE_LIVE_FEED=0 STORE_STRICT_IMAGES=0 npm run store:check",
  "store:check:strict": "STORE_CI=1 STORE_REQUIRE_LIVE_FEED=1 STORE_STRICT_IMAGES=1 npm run store:check",
  "store:check:production": "STORE_CI=1 STORE_PRODUCTION=1 STORE_REQUIRE_LIVE_FEED=1 STORE_STRICT_IMAGES=1 npm run store:check"
}
```

Do not switch deploy to production strict until real product images are ready.

## Proof Updates

Update `tools/proof-store-static.mjs` to support:

```text
development
ci
strict
production
```

Production fail conditions include:

- placeholder image domains
- existing-static source
- existing-static-fallback images
- dummy
- Etc
- broken category/pagination canonical
- oversized HTML/assets/manifest
- manifest inline
- runtime JS inline
- full CSS inline
- too many products in `/store`
- too many products in category page
- invalid JSON-LD
- incorrect robots production preview if available

## Live Smoke Updates

Production strict live smoke should check:

1. `/store`.
2. Each category route.
3. Generated pagination routes if any.
4. `/assets/store/store.css`.
5. `/assets/store/store.js`.
6. `/store/data/manifest.json`.
7. Cache-control headers.
8. Robots headers.
9. Diagnostic production mode.

## Acceptance Criteria

Development must still pass or warn:

```bash
npm run store:check:ci
npm run gaga:preflight
npm run gaga:verify-worker-live:local
```

Strict staging should fail until real live feed and real images are ready:

```bash
npm run store:check:strict
```

Production readiness must pass only when:

1. live feed is reachable,
2. images are real,
3. store/category/pagination routes are generated,
4. cache policies are production-ready,
5. robots/indexability is correct.

## Deliverables

- Updated proof mode handling.
- Updated build report budgets.
- Updated live smoke production checks.
- Updated CI/deploy production scripts.
- Cache policy documentation.
- Production readiness checklist.
