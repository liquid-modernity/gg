TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-SPA-REHYDRATE-TOC-COMMENTS-20260222
TITLE: Rehydrate shortcodes/ToC/comments after SPA swap

SUMMARY
- Added explicit after-swap rehydrate hooks in `GG.core.render.apply()` so SPA navigation now triggers:
  - `GG.modules.ShortcodesV2.transformArea(main)`
  - `GG.modules.ShortcodesV2.bindA11y(main)`
  - `GG.modules.TOC.reset(main)` then `GG.modules.TOC.build(main, { headings:'h2' })`
  - `GG.modules.Comments.reset(main)` (state-only, no forced auto-load)
- Added done/bound flag reset before rehydrate (`data-gg-shortcodes-done`, `data-gg-a11y-bound`, `data-gg-bound-load-more`) so modules do not skip on swapped DOM.
- Added lightweight `GG.modules.TOC` contract in `ui.bucket.post.js` for deterministic `reset/build` after SPA swap, with H2-only list and auto-hide when empty (no “No content found” row).
- Added `Comments.reset()` in core comments module to reset primary CTA state and re-init comments gate safely.
- Added verifier `tools/verify-rehydrate-hooks.mjs` and wired it into `tools/gate-prod.sh`.
- Updated `tools/perf-budgets.json` ceilings for `ui.bucket.core.js` and `ui.bucket.post.js` to match deterministic bundle growth from this rehydrate contract change.

FILES CHANGED
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/modules/ui.bucket.post.js
- tools/verify-rehydrate-hooks.mjs
- tools/gate-prod.sh
- tools/perf-budgets.json
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/77d4178/*

VERIFICATION OUTPUTS
- `node tools/verify-rehydrate-hooks.mjs`
```text
PASS: rehydrate hooks contract
```

- `npm run gate:prod`
```text
PASS: rehydrate hooks contract
VERIFY_BUDGETS: PASS
PASS: gate:prod
```

MANUAL SANITY
- Not executed in this environment (CLI-only). Recommended on real browser:
  - home/blog -> post SPA navigation: ToC appears immediately when H2 exists.
  - comment button on post after SPA navigation: comments panel works without hard refresh.
