TASK 001 — Extract Yellow Cart Store CSS/JS Without Behavior Change

Context:
The current Yellow Cart store page is implemented mostly as a single large store.html file. It contains inline CSS, inline runtime JavaScript, store UI, product rendering, preview sheet, discovery sheet, category rail, saved products, JSON-LD, and static product data.

Goal:
Refactor the store system so the large non-critical CSS and runtime JavaScript are moved out of store.html into separate source and asset files, while preserving the current behavior exactly.

This task is only about extraction and modularization.
Do not implement category page generation, pagination, manifest loading, or route changes yet.

Hard requirements:
1. Keep store.html behavior visually and functionally identical after extraction.
2. Keep only a small inline critical CSS block in store.html.
3. Keep the small theme boot script inline in the head.
4. Move the large store CSS into src/store/store.css.
5. Move the runtime JavaScript into src/store/store.js.
6. Create src/store/store.critical.css for the inline critical CSS source.
7. Create src/store/store.template.html only if it can be done safely without changing the current build behavior. If risky, leave template creation for Task 002.
8. Update build-store-static.mjs so it can inject/link the extracted CSS/JS assets.
9. Update proof-store-static.mjs so it verifies the extraction rules.
10. Do not change product data, sorting, category logic, preview logic, discovery logic, JSON-LD structure, feed URL logic, or UI copy in this task.
11. Do not introduce global CSS overrides as patches.
12. Do not change worker.js route behavior.
13. Do not move index.xml or landing.html in this task.
14. Do not remove JSON-LD or static fallback data in this task.
15. Do not change canonical URLs in this task.

Target file structure:
src/
  store/
    store.critical.css
    store.css
    store.js

assets/
  store/
    store.css
    store.js

Existing files to update:
- store.html
- build-store-static.mjs
- proof-store-static.mjs
- package.json only if needed

Extraction rules:
- Inline critical CSS should include only what is needed for first paint:
  - root tokens required before external CSS loads
  - body/html baseline
  - basic surface/background
  - store shell layout
  - hero title baseline
  - skeleton/first grid baseline if needed
  - focus-visible baseline
  - minimal dark/light theme variables if required to avoid flash

- The full external CSS should include:
  - cards
  - preview sheet
  - bottom sheets
  - dock
  - category rail
  - semantic notes
  - responsive rules
  - reduced motion rules
  - forced colors rules
  - all non-critical component styling

- Inline JS allowed in store.html:
  - only the early theme boot script that reads gg:theme from localStorage and sets data-gg-theme

- Runtime JS moved to src/store/store.js:
  - product parsing/rendering
  - preview sheet
  - discovery sheet
  - saved products
  - category rail behavior
  - filter/search
  - copy link
  - toast
  - load more
  - event listeners

Output behavior:
- store.html should link to the external CSS:
  <link rel="stylesheet" href="/assets/store/store.css">

- store.html should load runtime JS with defer:
  <script src="/assets/store/store.js" defer></script>

- Keep the theme boot script inline before CSS loads.

Proof requirements:
Update proof-store-static.mjs to fail if:
1. store.html contains a large inline <style> block beyond the critical CSS budget.
2. critical CSS exceeds 15 KB uncompressed.
3. runtime JavaScript remains inline in store.html, except for the theme boot script.
4. /assets/store/store.css is missing.
5. /assets/store/store.js is missing.
6. store.html does not reference /assets/store/store.css.
7. store.html does not reference /assets/store/store.js with defer.
8. the theme boot script is missing from store.html.
9. JSON-LD is broken.
10. existing store contract marker is missing.
11. existing feed URLs are removed or changed unintentionally.

Size budgets for this task:
- Inline critical CSS: max 15 KB uncompressed.
- Inline runtime JS: 0 KB allowed, except theme boot script.
- store.html should be smaller than before after extraction.
- Do not enforce strict external CSS/JS size budget yet; that comes later.

Commands that must pass:
npm run store:build
npm run store:proof

Deliverables:
1. Created src/store/store.critical.css
2. Created src/store/store.css
3. Created src/store/store.js
4. Created or updated assets/store/store.css
5. Created or updated assets/store/store.js
6. Updated store.html to keep only critical CSS + theme boot inline
7. Updated build-store-static.mjs to copy/inject/link assets
8. Updated proof-store-static.mjs to enforce extraction rules
9. Short summary of changed files
10. Proof output

Important:
This task must not change store UX. It is a structural extraction task only.