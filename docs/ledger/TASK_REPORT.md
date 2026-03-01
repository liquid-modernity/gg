TASK_REPORT
Last updated: 2026-03-01

TASK_ID: TASK-P0-TAXONOMY-NORMALIZATION
PARENT: TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING
TITLE: Taxonomy normalization for mixed-init gating + search/label attrs

SYMPTOM
- `/blog` could still be treated as `home` by mixed lazy-init path because the gate used `view==='home'`.
- `data-gg-query` and `data-gg-label` were sourced from `data:view.title`, so label/search semantics were ambiguous.
- Label pages could carry `data-gg-query`, which is semantically wrong for taxonomy routing.

ROOT CAUSE
- Mixed module gate in listing bucket depended on `routerCtx.view` and `data-gg-view`, not `surface`.
- Template attrs on `<body>` and `#gg-main` used broad conditions and title fallback instead of `data:view.search.query` and `data:view.search.label`.
- Router verifier had no explicit assertion for these taxonomy semantics, so regressions were not blocked.

PATCH
- `public/assets/latest/modules/ui.bucket.listing.js`
  - Changed mixed init gate to key off `surface` (`routerCtx.surface` + `data-gg-surface`) and allow only `landing/home`.
  - Removed dependency on `view==='home'` / `data-gg-view` for mixed bootstrap.
- `index.prod.xml`, `index.dev.xml`
  - `data-gg-label` now set only when label search and sourced from `data:view.search.label`.
  - `data-gg-query` now set only when search AND NOT label search, sourced from `data:view.search.query`.
  - Applied on both `<body>` and `<main id='gg-main'>`.
- `tools/verify-router-contract.mjs`
  - Added mixed-gate assertions: surface-based, no view-based mixed gate.
  - Added taxonomy assertions: `gg-label` and `gg-query` must use search object semantics; legacy `data:view.title` mapping is rejected.

PROOF
- `node tools/verify-router-contract.mjs` → `VERIFY_ROUTER_CONTRACT: PASS`
- `npm run verify:xml` → `OK index.dev.xml`, `OK index.prod.xml`
- `npm run verify:assets` → `VERIFY_ASSETS: PASS`
- `./scripts/gg auto` → `GG_VERIFY: PASSED`, `PASS: smoke tests`, `PASS: gate:prod`
- Perf budget remained green after optimization:
  - `modules/ui.bucket.listing.js` raw `86271` (budget `86400`) via `node tools/verify-budgets.mjs`

NOTES
- Asset retention gate tripped during release (`public/assets/v` > 5); oldest release dir was pruned to restore contract before rerun.
- Live smoke currently tracks deployed worker release (`ff41e6d`); new release pin is generated locally (`a5e0e8b`) and awaits deployment propagation.
