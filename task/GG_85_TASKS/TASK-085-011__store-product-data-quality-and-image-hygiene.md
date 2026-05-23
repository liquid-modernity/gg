# TASK-085-011 — Store Product Data Quality and Image Hygiene

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make Store data credible enough for SEO, product discovery, and user trust. In development, placeholder images may exist, but the system must quarantine them and prove they cannot pass production checks.

## Current evidence from audit ZIP
Store build report shows 20 valid products and live feed source, but all products still warn about placeholder image URLs in non-production data. `store:check:production` is expected to fail while placeholders remain.

## Scope
Improve product manifest quality, image rules, category config, and production image strictness without opening production crawler/indexing flags.

## Likely files / areas
- `registry/store/gg-store.json`
- `gg-store.json`
- `src/store/store.config.mjs`
- `src/store/store-categories.config.mjs`
- `tools/store-build.sh`
- Store build/proof tooling
- `qa/store-artifact-smoke.sh`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Keep placeholder images allowed only in development mode.
2. Add explicit placeholder detector list/patterns.
3. Require product image width/height/alt/canonical product URL fields where available.
4. Ensure category paths are generated from config only.
5. Keep Store-labelled posts isolated from root, landing, and general discovery.
6. Production strict image check must fail until real images exist.

## Acceptance criteria
- `npm run store:check:ci` passes with warnings allowed.
- `npm run store:check:production` fails if placeholder images remain.
- Once real images are supplied, production image check can pass without code changes.
- Product/category config is easy to adjust from one place.

## Required QA / proof
```bash
npm run store:check:ci
npm run gaga:verify-store-isolation
npm run store:check:production  # expected to fail until real images exist
```

## Notes
This is not merely cosmetic. Fake product imagery weakens Store credibility and search/product trust.
