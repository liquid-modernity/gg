TASK_REPORT
Last updated: 2026-03-01

TASK_ID: TASK-P0-XML-ROUTER-ADDENDUM-HARDENING
PARENT: TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING
TITLE: Router addendum hardening (HTML correctness + no inline config script + context-gated init)

SUMMARY
- Hardened XML script correctness by converting self-closing boot script tags to standard closing form in both templates.
- Kept prod template free from the custom inline diagnostic script block (none present).
- Confirmed head has no `<style>` blocks; critical CSS remains in `<b:skin>`.
- Converted `gg-mixed-config` from inline JSON `<script>` to homepage-gated `<template id="gg-mixed-config">` in both templates.
- Updated mixed module parser to read config safely from template/script text without `innerHTML`.
- Added router-context utility in core runtime to read and normalize:
  - `data-gg-view`
  - `data-gg-device`
  - `data-gg-preview`
  - `data-gg-layout`
  - `data-gg-sb-mode`
  - `data-gg-label`
  - `data-gg-query`
- Applied router-context gating (`when`) to feature init/rehydrate so modules run only on intended view contexts:
  - home-only: home state
  - listing-like: loadmore/prefetch/skeleton/popular/info panel
  - post/page: post detail, TOC/readtime/breadcrumbs/related/shortcodes/share
  - system pages: sitemap/tag directory/hub
- Updated listing mixed lazy-init so mixed module mounts only on `view=home`.
- Updated CSS gating to prioritize `[data-gg-view]` and `[data-gg-device]` while preserving backward compatibility with `data-gg-page` and `data-gg-surface`.
- Updated `verify-ui-guardrails` parser to accept both `<template>` and legacy `<script>` for `gg-mixed-config` JSON contract.

FILES CHANGED
- index.prod.xml
- index.dev.xml
- public/assets/latest/modules/ui.bucket.mixed.js
- public/assets/latest/modules/ui.bucket.core.js
- public/assets/latest/modules/ui.bucket.listing.js
- public/assets/latest/main.css
- tools/verify-ui-guardrails.mjs
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md

VERIFICATION OUTPUTS
- `npm run verify:xml`
```text
OK index.dev.xml
OK index.prod.xml
```

- `node tools/verify-template-contract.mjs`
```text
VERIFY_TEMPLATE_CONTRACT: PASS
```

- `npm run verify:template-fingerprint`
```text
VERIFY_TEMPLATE_FINGERPRINT: PASS
```

- `node tools/verify-inline-css.mjs`
```text
VERIFY_INLINE_CSS: PASS
```

- `node tools/verify-router-contract.mjs`
```text
VERIFY_ROUTER_CONTRACT: PASS
```

- `node tools/verify-mixed-no-innerhtml.mjs`
```text
PASS: mixed.js has no innerHTML
```

- `node tools/verify-mixed-no-trivial-htmljs.mjs`
```text
PASS: mixed.js trivial htmljs blocked
```

- `node tools/verify-ui-guardrails.mjs`
```text
VERIFY_UI_GUARDRAILS: PASS
```

- `SMOKE_LIVE_HTML=1 tools/smoke.sh`
```text
PASS: smoke tests
```

NOTES
- Initial smoke failure occurred because `verify-ui-guardrails` expected only `<script id='gg-mixed-config'>`; this verifier was patched to parse both `<template>` and `<script>` formats.
- Backward compatibility is preserved: `expr:data-gg-page` and `expr:data-gg-surface` remain unchanged in template contracts.
