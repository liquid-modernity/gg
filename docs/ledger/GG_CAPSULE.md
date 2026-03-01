# GG_CAPSULE (current session)
Last updated: 2026-03-01

NOW:
- TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING: SSR router taxonomy/gating is now handled first in Blogger conditionals with backward-compatible contract attrs retained.

CONSTRAINTS:
- main-only
- preview always www.pakrpp.com
- DEV/PROD via 2 Blogger themes (index.dev.xml / index.prod.xml manual paste)
- Cloudflare Worker name: gg
- assets served via Worker ASSETS binding (same-domain paths)
- local machine macOS 10.15: wrangler CI-only
- apex redirect via Cloudflare Redirect Rule (301) to https://www.pakrpp.com/$1

<!-- GG:AUTOGEN:BEGIN -->
RELEASE_ID: 2fbdd83
RELEASE_HISTORY:
- 2fbdd83
- cf094be
PROD_PINNED_JS: /assets/v/2fbdd83/main.js
PROD_PINNED_APP: /assets/v/2fbdd83/app.js
PROD_PINNED_CSS: /assets/v/2fbdd83/main.css
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
- 2026-03-01 TASK-P0-XML-ROUTER-TAXONOMY-AND-GATING added SSR router `b:with` taxonomy (`error/home/label/search/archive/post/page/listing`), mirrored `data-gg-view/device/preview/layout` on `<body>` and `#gg-main`, tightened Load More gating for non-search/non-label/non-archive listings, homepage-scoped `gg-mixed-config`, upgraded sidebar mode to `post|list|system`, removed custom inline diagnostic script from prod template, and released `cf094be`.

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
