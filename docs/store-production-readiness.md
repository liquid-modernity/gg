# Store Production Readiness

Yellow Cart production readiness is intentionally stricter than local CI.

## Commands

- `npm run store:proof`: development proof, allows known placeholder/static-fallback image details without per-product warning spam.
- `npm run store:check:ci`: CI proof (`GG_STORE_MODE=ci`), allows the same development-only placeholder/static fallback policy while still failing malformed product data and artifact contract errors.
- `npm run store:check:strict`: staging proof, requires the live Store feed and strict image validation.
- `npm run store:check:production`: production readiness proof (`GG_STORE_MODE=production`), enables `STORE_PRODUCTION=1`, strict images, and production budgets. Static fallback can be used to complete the local build step, but the proof must fail if the generated Store is still `existing-static`, uses `existing-static-fallback`, or contains placeholder image hosts.

Deploy workflows keep `store:check:ci` as the default gate. Set `GG_STORE_MODE=production` or `GG_STORE_PRODUCTION_READINESS=1` in repository variables to run the production proof in CI/deploy before a real launch. Set `GG_LIVE_PRODUCTION_STRICT=1` to make live worker smoke fail on production cache policy drift even before the edge reports production mode.

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
