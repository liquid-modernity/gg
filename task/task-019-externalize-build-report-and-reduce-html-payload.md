# Task 019 — Externalize Build Report and Reduce HTML Payload

## Objective

Move Store build-report/debug metadata out of public HTML where possible, while preserving developer proof, diagnostics, and build traceability.

Build reports are for developers. They should not unnecessarily bloat Store HTML.

## Scope

Likely files:

```txt
src/store/lib/store-report.mjs
src/store/lib/render-store-page.mjs
src/store/lib/render-category-page.mjs
tools/build-store-static.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
store.html
store/*/index.html
```

Generated files may change.

## Required Changes

1. Generate external build report JSON:

   ```txt
   store/data/build-report.json
   dist/store/data/build-report.json
   ```

   Use existing output directories if the repo has a different convention.

2. Public HTML should not inline large build report blocks by default.

3. Keep only minimal metadata in HTML if needed, for example:

   ```html
   <meta name="gg-store-build-id" content="...">
   ```

   Or a small data attribute if existing proof requires it.

4. Allow optional inline build report only behind a development flag, for example:

   ```txt
   GG_STORE_INLINE_BUILD_REPORT=1
   ```

5. Proof should read the external report when needed.

6. Runtime Store behavior must not depend on the build report.

7. Keep required SEO/runtime payloads:
   - JSON-LD
   - static product subset for the current page
   - essential route/category metadata

8. HTML size should decrease or not increase.

## Acceptance Criteria

Run and pass:

```bash
npm run store:build
npm run store:proof
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Verify:

```bash
test -f store/data/build-report.json
test -f .cloudflare-build/public/store/data/build-report.json
```

Check that `store.html` and category HTML do not contain a large inline build report block unless explicitly enabled.

## Non-Goals

Do not:
- remove JSON-LD
- remove static product data needed for no-JS rendering
- change product extraction logic
- split JS or CSS
