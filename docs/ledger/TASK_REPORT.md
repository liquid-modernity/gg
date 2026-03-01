TASK_REPORT
Last updated: 2026-03-01

TASK_ID: TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING
TITLE: Blogger-first SSR router taxonomy and gating with backward-compatible contracts

SUMMARY
- Added a single SSR router taxonomy layer in both templates (`index.prod.xml`, `index.dev.xml`) using nested `b:with` variables:
  `ggIsError`, `ggIsMobile`, `ggIsHome`, `ggIsListing`, `ggIsPost`, `ggIsPage`, `ggIsSingle`, `ggIsSearch`, `ggIsLabel`, `ggIsArchive`, `ggIsLayout`, `ggIsSystemPage`, `ggViewKind`.
- Preserved required template contract markers:
  - `<body>` still keeps original `expr:data-gg-page` and `expr:data-gg-surface`.
  - `<main id="gg-main">` still keeps original `expr:data-gg-page` and `expr:data-gg-surface`.
- Added new SSR router attrs on both `<body>` and `#gg-main`:
  - `expr:data-gg-view='data:ggViewKind'`
  - `expr:data-gg-device='data:ggIsMobile ? "mobile" : "desktop"'`
  - `expr:data-gg-preview='data:view.isPreview ? "1" : "0"'`
  - `expr:data-gg-layout='data:ggIsLayout ? "1" : "0"'`
  - conditional `data-gg-label` / `data-gg-query` attrs for label/search views.
- Tightened Load More SSR gating:
  - now rendered only when `isMultipleItems` AND not search/label/archive AND `olderPageUrl` exists.
- Scoped `gg-mixed-config` to homepage only so it does not render on post/page/error.
- Upgraded left sidebar mode contract:
  - `expr:data-gg-sb-mode='post|list|system'` using `ggIsSystemPage` URL matching.
- Removed the custom inline diagnostic script block near end of `index.prod.xml`.
- Moved custom critical head style blocks into `<b:skin>` in both templates (no additional head `<style>` block left).
- Release artifacts were realigned to `RELEASE_ID=cf094be` and oldest release dir was pruned to satisfy `verify:assets` cap.

NEW IDENTIFIERS (NAMING CHECK)
- `data-gg-view`
- `data-gg-device`
- `data-gg-preview`
- `data-gg-layout`
- `ggIsSystemPage` (template variable)
- `ggViewKind` (template variable)

All identifiers follow `docs/NAMING.md` (`data-gg-*` / `gg*` internal template vars).

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/sw.js
- src/worker.js
- public/assets/v/cf094be/*
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- removed: public/assets/v/4c69317/*

VERIFICATION OUTPUTS
- `npm run verify:xml`
```text
OK index.dev.xml
OK index.prod.xml
```

- `npm run verify:assets`
```text
VERIFY_ASSETS: PASS
RELEASE_ID=cf094be
```

- `npm run verify:release`
```text
VERIFY_RULEBOOKS: PASS
VERIFY_AUTHORS_DIR_CONTRACT: PASS
VERIFY_RELEASE_ALIGNED: PASS
```

- `node tools/verify-template-contract.mjs`
```text
VERIFY_TEMPLATE_CONTRACT: PASS
```

- `node tools/verify-router-contract.mjs`
```text
VERIFY_ROUTER_CONTRACT: PASS
```

- `node tools/verify-budgets.mjs`
```text
VERIFY_BUDGETS: PASS
```

- `node tools/verify-inline-css.mjs`
```text
VERIFY_INLINE_CSS: PASS
```

- `node tools/verify-crp.mjs`
```text
VERIFY_CRP: PASS
```

- `./scripts/gg auto`
```text
GG_VERIFY: PASSED
```
Note: in sandbox, final stage uses offline smoke fallback because DNS to `www.pakrpp.com` is blocked.

BACKWARD COMPATIBILITY NOTES
- Existing consumers of `data-gg-page` and `data-gg-surface` remain unaffected because the original expressions were preserved.
- New attrs (`data-gg-view/device/preview/layout`) are additive and safe for progressive adoption.
- Sidebar mode upgrade is additive (`system` mode added without breaking prior `post/list` usage).

DEPLOY NOTES
- Local environment cannot validate live DNS (`www.pakrpp.com`) from sandbox; CI/live smoke is still required for full live confirmation after template paste/deploy.
