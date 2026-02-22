TASK_REPORT
Last updated: 2026-02-22

TASK_ID: TASK-UX-SIDEBARS-FULLHEIGHT-SCROLL-20260222
TITLE: Sticky full-height sidebars with isolated scroll regions

SUMMARY
- Reworked sidebar containers in `public/assets/latest/main.css` from fixed-drawer behavior to sticky full-height viewport behavior.
- Removed sidebar fixed-position rules from listing/post/mobile sidebar blocks and standardized sticky dimensions with `height/max-height` + `min-height:0`.
- Ensured sidebars stay inside layout container flow so they stop before footer/container end.
- Isolated scroll regions:
  - Left sidebar: `#gg-left-sidebar-list` (and sidebar section variants) now uses `min-height:0 + overflow:auto + overscroll-behavior:contain`.
  - ToC: `#gg-toc` now uses flex column structure; only `.gg-toc__list` scrolls (`overflow:auto`, `min-height:0`).
- Aligned post layout container behavior closer to listing/home alignment by using sticky side columns in `.gg-blog-layout--post` (no fixed side drawers).
- Added verifier `tools/verify-sidebar-sticky-contract.mjs` and wired into `tools/gate-prod.sh`.

FILES CHANGED
- public/assets/latest/main.css
- tools/verify-sidebar-sticky-contract.mjs
- tools/gate-prod.sh
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- docs/ledger/GG_CAPSULE.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/cc3ed54/*

VERIFICATION OUTPUTS
- `node tools/verify-sidebar-sticky-contract.mjs`
```text
PASS: sidebar sticky contract
```

- `npm run gate:prod`
```text
PASS: sidebar sticky contract
PASS: gate:prod
```

MANUAL SANITY
- Not executed in this CLI-only environment.
- Recommended browser checks:
  - Post/listing desktop: sidebars are full-height sticky and stop at layout end (no footer overlap).
  - Left sidebar: only pages-list region scrolls.
  - ToC: header stays, ToC list scrolls independently.
