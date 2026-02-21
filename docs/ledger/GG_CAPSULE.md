# GG_CAPSULE (current session)
Last updated: 2026-02-21

NOW:
- TASK-PHASE6-TRIVIAL-REMAINS-LISTING-POST-CMD-20260221: Remove remaining trivial innerHTML assignments in listing/post/cmd, add module-level verifier, and tighten allowlist ratchet to 16.

CONSTRAINTS:
- main-only
- preview always www.pakrpp.com
- DEV/PROD via 2 Blogger themes (index.dev.xml / index.prod.xml manual paste)
- Cloudflare Worker name: gg
- assets served via Worker ASSETS binding (same-domain paths)
- local machine macOS 10.15: wrangler CI-only
- apex redirect via Cloudflare Redirect Rule (301) to https://www.pakrpp.com/$1

<!-- GG:AUTOGEN:BEGIN -->
RELEASE_ID: 0fd3deb
RELEASE_HISTORY:
- 0fd3deb
- fe087d1
PROD_PINNED_JS: /assets/v/0fd3deb/main.js
PROD_PINNED_APP: /assets/v/0fd3deb/app.js
PROD_PINNED_CSS: /assets/v/0fd3deb/main.css
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
- TASK-PHASE6-CORE-QUICK-WINS-20260221

LAST_PATCH:
- 2026-02-21 TASK-PHASE6-TRIVIAL-REMAINS-LISTING-POST-CMD-20260221 removed LEGACY-0012/0044/0051/0060/0071/0072 via DOM API refactors in listing/post/cmd, added `verify-no-innerhtml-assign-modules`, and set allowlist `max_allow=16`.

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
