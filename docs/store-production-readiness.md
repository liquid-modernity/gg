# Store Production Readiness

Yellow Cart production readiness is intentionally stricter than local CI.

## Commands

- `npm run store:check:ci`: local/CI proof, allows static fallback and warns on placeholder images.
- `npm run store:check:strict`: staging proof, requires the live Store feed and strict image validation.
- `npm run store:check:production`: production proof, enables `STORE_PRODUCTION=1`, requires live feed, strict images, and production budgets.

Deploy workflows keep `store:check:ci` as the default gate. Set `GG_STORE_PRODUCTION_READINESS=1` in repository variables to run the production proof in CI/deploy before a real launch. Set `GG_LIVE_PRODUCTION_STRICT=1` to make live worker smoke fail on production cache policy drift even before the edge reports production mode.

## Cache Policy

- Store HTML routes (`/store`, `/store/{category}`, `/store/{category}/page/{n}`): `public, max-age=300, stale-while-revalidate=86400`.
- Store manifest (`/store/data/manifest.json`): `public, max-age=300, stale-while-revalidate=86400`.
- Store CSS/JS under `/assets/store/`: hashed assets are `public, max-age=31536000, immutable`; current non-hashed assets are `public, max-age=300, stale-while-revalidate=86400`.
- Non-production Worker mode still emits `no-store` and development robots lockdown.

## Readiness Checklist

- Live Store feed is reachable and `sourceType` is `live-feed`.
- Product images are absolute HTTPS URLs, not placeholder hosts, data/blob, localhost, or relative URLs.
- No `existing-static` source or `existing-static-fallback` image source is present unless an emergency override is intentionally set.
- `/store/data/manifest.json` is served as JSON and matches the generated product count.
- Store and category routes are indexable in production and do not emit `noindex`, `nofollow`, `nosnippet`, `noimageindex`, `max-snippet:0`, or `max-image-preview:none`.
- Store HTML, CSS, JS, manifest, and visible product counts are within the production budgets in `src/store/store.config.mjs`.
