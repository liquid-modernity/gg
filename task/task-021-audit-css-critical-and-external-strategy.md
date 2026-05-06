# Task 021 — Audit CSS Critical/External Strategy

## Objective

Keep Store CSS efficient and predictable: small inline critical CSS for above-the-fold rendering, external full CSS for caching, and no duplicate font/style links.

Do not over-split CSS unless there is a real route-specific reason.

## Scope

Likely files:

```txt
src/store/store.css
assets/store/store.css
src/store/lib/render-store-page.mjs
src/store/lib/render-category-page.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
```

## Required Strategy

Use this CSS model:

```txt
1. Inline critical CSS
   - only above-the-fold
   - small and budgeted
   - included in generated HTML

2. External full Store CSS
   - /assets/store/store.css
   - browser-cacheable
   - referenced by every Store HTML page

3. Optional route-specific CSS
   - only if there is a strong reason
   - avoid for minor differences
```

## Required Changes

1. Ensure critical CSS is not bloated.

2. Add or enforce a development budget, recommended:

   ```txt
   inline critical CSS <= 14 KB
   ```

   Use a config constant or documented threshold if the repo has a budget pattern.

3. Keep full Store CSS external:

   ```html
   <link rel="stylesheet" href="/assets/store/store.css">
   ```

4. Remove duplicate Google Fonts / Material Symbols stylesheet references if present.

5. Add proof/smoke checks:
   - external CSS exists
   - generated HTML references external CSS
   - critical CSS exists
   - critical CSS is under budget
   - duplicate font stylesheet links are not present

6. Do not break no-JS static rendering.

## Acceptance Criteria

Run and pass:

```bash
npm run store:build
npm run store:proof
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Proof should fail if:
- Store CSS file is missing
- generated HTML does not reference Store CSS
- critical CSS exceeds the budget
- duplicate Google Fonts / Material Symbols links are present

## Non-Goals

Do not:
- split JS
- redesign visual system
- introduce many route-specific CSS files
- remove critical CSS entirely
