# GG_CAPSULE (current session)
Last updated: 2026-03-01

NOW:
- TASK-P0-XML-ROUTER-ADDENDUM-HARDENING: router addendum hardening for HTML correctness, mixed-config template contract, and router-context gating across CSS/JS init.

CONSTRAINTS:
- main-only
- preview always www.pakrpp.com
- DEV/PROD via 2 Blogger themes (index.dev.xml / index.prod.xml manual paste)
- Cloudflare Worker name: gg
- assets served via Worker ASSETS binding (same-domain paths)
- local machine macOS 10.15: wrangler CI-only
- apex redirect via Cloudflare Redirect Rule (301) to https://www.pakrpp.com/$1

<!-- GG:AUTOGEN:BEGIN -->
RELEASE_ID: a5e0e8b
RELEASE_HISTORY:
- a5e0e8b
- 2f45508
PROD_PINNED_JS: /assets/v/a5e0e8b/main.js
PROD_PINNED_APP: /assets/v/a5e0e8b/app.js
PROD_PINNED_CSS: /assets/v/a5e0e8b/main.css
<!-- GG:AUTOGEN:END -->

LIVE CONTRACT (must hold):
- apex redirects → https://www.pakrpp.com/
- worker ping: https://www.pakrpp.com/__gg_worker_ping
- latest assets (DEV): https://www.pakrpp.com/assets/latest/main.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/boot.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/app.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/core.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/modules/pwa.js (no-store)
- latest assets (DEV): https://www.pakrpp.com/assets/latest/modules/ui.js (no-store)
- pinned assets (PROD): see AUTOGEN block (immutable)
- sw.js: https://www.pakrpp.com/sw.js (no-store)
- offline: https://www.pakrpp.com/offline.html

NEXT_TASK:
- user-priority

LAST_PATCH:
- 2026-03-01 TASK-P0-XML-ROUTER-ADDENDUM-HARDENING hardened addendum rules: boot script tags switched to non-self-closing HTML form, `gg-mixed-config` converted to homepage-gated `<template>`, mixed module parser made template/script compatible without `innerHTML`, router-context utility added in core for `data-gg-view/device/preview/layout/sb-mode/label/query`, feature init gated by router context, CSS gates updated to prioritize `[data-gg-view]` and `[data-gg-device]`.

RISKS (top 5):
- Manual paste mismatch (dev/prod)
- Worker routes missing on www
- Release ID not bumped alongside assets
- CI-only deploy skipped
- SW cache not updating if VERSION not bumped

FAST VERIFY (60s):
1) view-source → confirm boot.js path matches `/assets/latest/` (DEV) or `/assets/v/<RELEASE_ID>/boot.js` (PROD).
2) https://www.pakrpp.com/__gg_worker_ping returns `X-GG-Worker-Version`.
3) https://www.pakrpp.com/assets/latest/main.js (DEV) and AUTOGEN pinned JS (PROD) return expected cache headers.
4) DevTools → Application → Service Workers: DEV not controlled, PROD controlled.
