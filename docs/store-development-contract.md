# Store Development Contract

This contract defines the Yellow Cart Store development gate. It keeps local and CI Store work clean while leaving production readiness as a stricter, separate proof.

## Source Of Truth

- Category configuration lives in `src/store/store-categories.config.mjs`.
- `src/store/lib/category-config.mjs` derives normalized category order, labels, aliases, and fallback behavior from that source.
- `src/store/lib/store-routes.mjs` derives public category routes and generated artifact paths.
- `tools/build-store-static.mjs` syncs the same registry into the runtime Store config and Worker registry during `npm run store:build`.

Do not add category copies in generated HTML, Worker routing, or runtime JavaScript by hand. Rebuild the Store after any category change.

## Category Changes

To add a category:

1. Add one entry to `RAW_STORE_CATEGORIES` in `src/store/store-categories.config.mjs`.
2. Set `key`, `slug`, `path`, `title`, `h1`, `description`, `intro`, aliases, and `runtime` copy.
3. Keep exactly one fallback category. The current fallback is `everyday`, with aliases for `etc` and `lainnya`.
4. Update product data to use the new `categoryKey` or an alias.
5. Run `npm run store:check:dev10`.

To remove a category, remove it from `RAW_STORE_CATEGORIES`, migrate existing products to a remaining category, rebuild, and verify no `/store/{removed}` routes or flat artifacts remain in the build report contract.

## Route Contract

- Root Store route: `/store`, generated from `store.html`.
- Canonical category route: `/store/{category}`.
- Canonical paginated route: `/store/{category}/page/{n}`.
- Generated nested artifacts are canonical: `store/{category}/index.html` and `store/{category}/page/{n}/index.html`.
- Transitional flat artifacts are compatibility only: `store-{category}.html` and `store-{category}-page-{n}.html`.
- Flat artifacts are controlled by `GG_STORE_REQUIRE_FLAT_TRANSITIONAL` through `STORE_REQUIRE_FLAT_TRANSITIONAL`.
- Public category routes must come from `storeCategoryRoutes()` and the Store artifact contract in `store/data/build-report.json`.

The `everyday` category replaces legacy public `etc` routing. Public `/store/etc` output must not be generated.

## Pagination

- Page size is `STORE_CATEGORY_PAGE_SIZE` in `src/store/store.config.mjs`.
- Category pages are generated only for pages that have products.
- Page 1 uses `/store/{category}`.
- Page 2 and later use `/store/{category}/page/{n}`.
- Generated pages must include correct canonical URLs, `rel="prev"` and `rel="next"` links where applicable, per-page ItemList JSON-LD, and matching static product JSON.

## Image Policy

- Development and CI may reuse the existing static snapshot when the live feed is unavailable.
- Development and CI may emit one concise `NOTE` for placeholder/static-fallback image state. Per-product placeholder warning spam is not part of the dev10 gate.
- Strict mode requires the live feed and strict image validation.
- Production readiness is separate and must fail if generated Store output still uses `existing-static`, `existing-static-fallback`, placeholder image hosts, malformed URLs, data/blob URLs, localhost URLs, or relative image URLs.

## CSS Strategy

- Inline critical CSS is required in every generated Store HTML page.
- Critical CSS is budgeted by `CRITICAL_CSS_BUDGET_BYTES` and must stay at or under 14 KB.
- Full Store CSS remains external at `/assets/store/store.css` and must be referenced once by every Store HTML page.
- Google Fonts and Material Symbols stylesheet references must not be duplicated.
- Route-specific CSS should not be added unless there is a clear route-specific need.

## JS Strategy

- Generated Store HTML loads `/assets/store/store-core.js` with `defer`.
- The core script declares `data-store-discovery-src="/assets/store/store-discovery.js"` and lazy-loads Discovery behavior.
- `/assets/store/store.js` remains a compatibility alias and must not be referenced directly by generated Store HTML.
- Runtime category config is generated from `src/store/store-categories.config.mjs`.
- Inline runtime JavaScript is not allowed except the approved theme boot script and JSON/JSON-LD data blocks.

## Cloudflare Staging And Smoke

`node tools/cloudflare-prepare.mjs` stages the Worker bundle and the Store artifacts into `.cloudflare-build/public` using the artifact contract from `store/data/build-report.json`.

`bash qa/store-artifact-smoke.sh` verifies:

- required Store artifacts and assets exist in `.cloudflare-build/public`;
- staged files are not stale against source artifacts;
- root, nested, and transitional Store artifacts match the build report contract;
- critical CSS, external CSS, split runtime JS, manifest, build report metadata, JSON-LD, semantic products, and route diagnostics are present;
- production robots and cache policy contracts remain intact.

## Development Gates

Use these commands for development:

- `npm run store:build`: rebuild Store artifacts.
- `npm run store:proof`: prove the generated Store page and category artifacts.
- `npm run store:check:ci`: run build and proof in CI mode with development image notes allowed.
- `npm run store:check:dev10`: run the final development gate, including CI check, Cloudflare staging, and artifact smoke.
- `npm run gaga:verify-store-artifact`: alias for `npm run store:check:dev10`.
- `npm run gaga:preflight`: broader repository preflight that includes the Store artifact gate.

The dev10 standard is:

- build passes;
- proof passes;
- Cloudflare staging passes;
- artifact smoke passes;
- no `FAIL`;
- no noisy development `WARN`;
- only intentional concise `NOTE` output for offline feed/static-placeholder development state;
- no stale staged artifacts;
- no category drift between config, generated pages, Worker registry, manifest, and build report.

## Production Gate

Production readiness remains strict and separate:

```bash
GG_STORE_PRODUCTION_READINESS=1 npm run store:check:production
```

This command may fail while development placeholder/static fallback images remain. That failure is expected and must not be weakened to make the development gate pass.
