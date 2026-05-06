# Task 020 — Split Store JS into Core + Lazy Discovery

## Objective

Reduce initial Store JavaScript by splitting runtime into a small core script and a lazy-loaded Discovery module.

The Store must remain static-first. HTML should render and remain useful even if JavaScript fails.

## Scope

Likely files:

```txt
src/store/store.js
src/store/store-core.js
src/store/store-discovery.js
assets/store/store.js
assets/store/store-core.js
assets/store/store-discovery.js
tools/build-store-static.mjs
src/store/lib/render-store-page.mjs
src/store/lib/render-category-page.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
```

## Required Split

### `store-core.js`

Should handle:
- basic UI activation
- safe event binding
- theme/bootstrap integration if currently handled by Store runtime
- category page state
- opening/closing sheets or panels if lightweight
- lazy loader for Discovery module
- graceful no-JS fallback behavior

### `store-discovery.js`

Should handle:
- manifest fetch
- manifest validation
- Discovery search
- category/filter controls
- price-band controls
- sorting
- Discovery rendering/status
- fallback to static products if manifest fetch fails

## Required Behavior

1. Generated HTML should load only the core script initially:

   ```html
   <script src="/assets/store/store-core.js" defer></script>
   ```

2. Discovery script should load only when Discovery is opened or first needed.

3. Keep manifest external and lazy-loaded:

   ```txt
   /store/data/manifest.json
   ```

4. Static products should remain visible without JS.

5. If Discovery JS fails to load, the page should degrade gracefully.

6. Update build/copy logic so both JS files are generated/staged.

7. Update proof/smoke:
   - external core JS exists
   - external discovery JS exists
   - generated HTML references core JS
   - no broken reference to old JS remains unless intentionally kept as compatibility alias

## Acceptance Criteria

Run and pass:

```bash
node --check src/store/store-core.js
node --check src/store/store-discovery.js
npm run store:build
npm run store:proof
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Manual sanity check:
- Store page renders static product cards without waiting for Discovery.
- Opening Discovery loads the Discovery module and manifest.
- If manifest fetch fails, fallback static products are used.

## Non-Goals

Do not:
- redesign UI
- change category routes
- remove static product HTML
- move CSS in this task
