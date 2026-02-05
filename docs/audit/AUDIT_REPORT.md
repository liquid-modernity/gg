**Executive Summary**
- Manual paste is the release gate: `index.dev.xml` vs `index.prod.xml` drive asset origins and PWA behavior, but CI cannot verify which XML is actually pasted into Blogger, so a wrong paste can fully break CSS/JS or silently disable PWA/SW. `index.dev.xml:16` `index.dev.xml:19` `index.dev.xml:2792` `index.prod.xml:17` `index.prod.xml:2789` `.github/workflows/ci.yml:17` `.github/workflows/ci.yml:24`
- Production assets and `/blog` routing depend on the Cloudflare Worker being active on the host; if Worker routes are missing (especially apex), assets 404 and `/blog` aliasing breaks. `src/worker.js:146` `src/worker.js:193` `src/worker.js:160` `wrangler.jsonc:16` `.github/workflows/deploy.yml:119`
- `GG.core.ensureWorker` hard-fails after 1200ms; a slow or missing Worker yields `env.worker=false`, disabling `/blog` canonicalization and SW registration. `public/assets/v/1ce85ce/main.js:419` `public/assets/v/1ce85ce/main.js:435`
- SW updates are version-pinned; if `public/sw.js` VERSION is not bumped with assets (release script not run), users can stay on stale caches, making new deploys “not visible.” `public/sw.js:2` `tools/release.js:31`
- SW install fails if `/offline.html` is unavailable, preventing new SW activation and leaving old caches in control. `public/sw.js:133` `public/sw.js:144`
- Poster image proxy only allows Blogspot/Googleusercontent; external image covers fail to proxy, degrading poster/Share UX. `src/worker.js:95` `public/assets/v/1ce85ce/main.js:8510`
- SPA navigation is tightly coupled to template hooks (`main.gg-main`, `data-gg-home-*`, `#gg-share-sheet`, `#gg-config`); changes or partial pastes silently disable modules. `public/assets/v/1ce85ce/main.js:279` `public/assets/v/1ce85ce/main.js:5096` `index.prod.xml:206` `index.prod.xml:254` `index.prod.xml:2736` `index.prod.xml:2783`
- Prefetch cache uses `gg-pages-v2` but SW does not manage/clean it; potential cache bloat and prefetch inefficiency. `public/assets/v/1ce85ce/main.js:10395`
- Deploy is manual-only (`workflow_dispatch`), so commits won’t reach pakrpp.com unless the workflow is explicitly run. `.github/workflows/deploy.yml:3`

**System Map**
Request flow: Browser → Cloudflare Worker → Blogger HTML/XML → Client JS → SW → Assets
- Browser requests `https://www.pakrpp.com/*`. Worker responds for all routes when correctly bound. `wrangler.jsonc:16`
- Worker serves static assets (`/assets/*`, `/sw.js`, `/manifest.webmanifest`, `/offline.html`) from `ASSETS` and reverse-proxies all other paths to Blogger. `src/worker.js:146` `src/worker.js:154`
- Blogger HTML/XML comes from whichever theme XML the user manually pastes (`index.dev.xml` or `index.prod.xml`). `index.dev.xml:1` `index.prod.xml:1`
- Client JS (`main.js`) bootstraps router, state, and modules; SPA rendering swaps the `main` container and rehydrates modules. `public/assets/v/1ce85ce/main.js:271` `public/assets/v/1ce85ce/main.js:319`
- SW (`/sw.js`) is registered only when Worker is detected and not in dev mode; it controls caching and offline behavior. `public/assets/v/1ce85ce/main.js:1535` `public/assets/v/1ce85ce/main.js:1682`
- Manual paste sits between Worker and Client JS: the chosen XML determines asset origins, PWA enablement, and DOM hooks. A wrong paste breaks the chain even if CI is green. `index.dev.xml:16` `index.prod.xml:17`

**Failure Matrix**
| Area | File | Lines | What breaks | Why (root cause) | Failure condition(s) | CI-detectable? | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Main-only release contract | `index.dev.xml:16` `index.dev.xml:19` `index.prod.xml:17` `public/assets/v/1ce85ce/main.js:1684` | `index.dev.xml:16` `index.dev.xml:19` `index.prod.xml:17` `public/assets/v/1ce85ce/main.js:1684` | Preview or prod loads wrong assets / PWA disabled | Dev XML points to jsdelivr + sets `gg:mode=dev` (PWA disabled); prod XML points to `/assets/v/...` and expects Worker-hosted assets | Pasting `index.prod.xml` into a non-Worker environment (assets 404) or pasting `index.dev.xml` into prod (PWA/SW disabled) | NO | 🔴 core break |
| Main-only release contract | `tools/release.js:22` `public/sw.js:2` `src/worker.js:6` `index.prod.xml:17` | `tools/release.js:22` `public/sw.js:2` `src/worker.js:6` `index.prod.xml:17` | Stale assets or 404s after deploy | Multiple version strings must be updated together; release script is the only sync mechanism | Skipping `tools/release.js` or manual edits cause `sw.js`/Worker/index to diverge from `/assets/v/<id>` | NO | 🟠 UX break |
| Routing & Navigation | `src/worker.js:160` `public/assets/v/1ce85ce/main.js:119` `public/assets/v/1ce85ce/main.js:138` | `src/worker.js:160` `public/assets/v/1ce85ce/main.js:119` `public/assets/v/1ce85ce/main.js:138` | `/blog` alias and canonicalization unstable | `/blog` only works when Worker is active; JS toggles between `/blog` and `/?view=blog` based on Worker detection | Worker route missing, Worker ping fails, or host not `pakrpp.com` | NO | 🟠 UX break |
| Routing & Navigation | `public/assets/v/1ce85ce/main.js:419` `public/assets/v/1ce85ce/main.js:435` | `public/assets/v/1ce85ce/main.js:419` `public/assets/v/1ce85ce/main.js:435` | SW and blog alias disabled on slow/failed ping | `ensureWorker` hard-times out at 1200ms and flips `env.worker=false` | Slow edge response or blocked `/__gg_worker_ping` | NO | 🟡 fragile |
| Cloudflare Worker | `src/worker.js:146` `src/worker.js:193` `index.prod.xml:17` | `src/worker.js:146` `src/worker.js:193` `index.prod.xml:17` | CSS/JS 404 if Worker not bound | `/assets/*` only served via Worker Static Assets binding | Worker not routed to host, or `ASSETS` binding misconfigured | NO | 🔴 core break |
| Cloudflare Worker + CI/CD | `wrangler.jsonc:16` `.github/workflows/deploy.yml:119` | `wrangler.jsonc:16` `.github/workflows/deploy.yml:119` | Apex host can bypass Worker without CI failure | Deploy route audit checks only `www.pakrpp.com/*`; apex is not verified | `pakrpp.com/*` route missing or misconfigured | NO | 🟠 UX break |
| Client-side JS | `public/assets/v/1ce85ce/main.js:279` `public/assets/v/1ce85ce/main.js:325` | `public/assets/v/1ce85ce/main.js:279` `public/assets/v/1ce85ce/main.js:325` | Soft-nav fails (full reload fallback) | SPA render requires specific container selectors to exist in both current DOM and fetched HTML | Template edits remove `.gg-blog-main`/`main.gg-main`/`#main` | NO | 🟡 fragile |
| Client-side JS | `public/assets/v/1ce85ce/main.js:298` `public/assets/v/1ce85ce/main.js:319` | `public/assets/v/1ce85ce/main.js:298` `public/assets/v/1ce85ce/main.js:319` | Widgets relying on inline scripts fail after SPA nav | SPA swaps innerHTML; only Blogger comment scripts are rehydrated | Soft navigation to pages that need inline scripts beyond comments | NO | 🟠 UX break |
| Service Worker | `public/assets/v/1ce85ce/main.js:1535` `public/assets/v/1ce85ce/main.js:1552` | `public/assets/v/1ce85ce/main.js:1535` `public/assets/v/1ce85ce/main.js:1552` | SW never registers | SW registration requires `env.worker=true` and not `GG_IS_DEV` | Worker ping fails, or dev XML pasted into prod | NO | 🟠 UX break |
| Service Worker | `public/sw.js:133` `public/sw.js:144` | `public/sw.js:133` `public/sw.js:144` | New SW fails to install, old caches persist | Install throws if `/offline.html` fetch fails | Offline file missing or Worker not serving it | NO | 🟠 UX break |
| Service Worker | `public/sw.js:2` `tools/release.js:31` | `public/sw.js:2` `tools/release.js:31` | “Deploy not visible” due to cache pinning | Cache names use VERSION; stale VERSION keeps old caches alive | VERSION not bumped with assets | NO | 🟠 UX break |
| Worker + Client JS | `src/worker.js:95` `public/assets/v/1ce85ce/main.js:8510` | `src/worker.js:95` `public/assets/v/1ce85ce/main.js:8510` | Share poster image missing | Worker proxy allowlist blocks non-blogspot images | Post cover hosted outside allowlist | NO | 🟡 fragile |
| CI/CD | `.github/workflows/deploy.yml:3` | `.github/workflows/deploy.yml:3` | Deploy never runs automatically | Deploy workflow is manual-only (`workflow_dispatch`) | Commit merged to main without manually running deploy | NO | 🟡 fragile |
| Routing/Back Policy | `public/assets/v/1ce85ce/main.js:6427` `public/assets/v/1ce85ce/main.js:6470` | `public/assets/v/1ce85ce/main.js:6427` `public/assets/v/1ce85ce/main.js:6470` | Smart back breaks in storage-restricted contexts | `sessionStorage` used without guard; throws can break tracking/back policy | Storage disabled (privacy mode, blocked cookies) | NO | 🟡 fragile |
| Performance/Cache | `public/assets/v/1ce85ce/main.js:10395` | `public/assets/v/1ce85ce/main.js:10395` | Prefetch cache never cleaned by SW | `CACHE_PAGES` referenced in JS but absent in SW | Long browsing sessions; storage bloat | NO | 🟡 fragile |

**Manual-Paste Risk Register**
| Risk | Why it happens | Symptom on pakrpp.com | How to detect quickly (visible markers/logs) | Severity |
| --- | --- | --- | --- | --- |
| Prod XML pasted into preview/non-Worker host | Prod template references `/assets/v/...` that only Worker serves | CSS/JS missing, blank or unstyled page | Network tab: 404 on `/assets/v/.../main.css` and `/assets/v/.../main.js` | 🔴 core break |
| Dev XML pasted into prod | `gg:mode=dev` disables PWA/SW; assets served from jsdelivr | No SW/manifest; PWA prompt missing; no offline | Console: `[GG_SW] pwa disabled in dev mode` if `ggdebug=1` | 🟠 UX break |
| Dev jsdelivr hash not updated | Dev XML pins to full git hash | 404 from jsdelivr; assets missing | Network tab: 404 from `cdn.jsdelivr.net/...@<hash>/public/...` | 🔴 core break |
| Release ID mismatch | `tools/release.js` not run or partially applied | Old assets cached; deploy appears unchanged | `/__gg_worker_ping` header version differs from `/assets/v/...` paths | 🟠 UX break |
| DOM hooks removed in manual edits | Template edits remove required IDs/attrs | Features silently missing (share sheet, toast, panels, home toggle) | `window.GG_DIAG.modules` shows `skip` for modules | 🟡 fragile |

**Hidden Couplings (Critical)**
- `/blog` behavior depends on Worker rewrite + JS normalization + home-state logic; if any leg is missing, canonicalization and smart back break. `src/worker.js:160` `public/assets/v/1ce85ce/main.js:119` `public/assets/v/1ce85ce/main.js:2580`
- SPA render requires `main` container selectors from the template; mismatches fall back to full reload and rehydration gaps. `public/assets/v/1ce85ce/main.js:279` `index.prod.xml:206`
- Home surface requires `data-gg-home-root` and `data-gg-home-layer` elements; missing either disables landing/blog toggling. `index.prod.xml:206` `index.prod.xml:254` `public/assets/v/1ce85ce/main.js:2703`
- PWA pathing relies on `gg:mode` and `gg:asset-base` meta; wrong XML flips PWA/SW behavior. `index.dev.xml:16` `public/assets/v/1ce85ce/main.js:416` `public/assets/v/1ce85ce/main.js:1684`
- Share poster depends on Worker `/api/proxy` allowlist; non-Blogger images silently fail. `src/worker.js:95` `public/assets/v/1ce85ce/main.js:8510`
- `#gg-config` JSON feeds runtime config; invalid JSON degrades features without blocking boot. `index.prod.xml:2783` `public/assets/v/1ce85ce/main.js:1794`

**False Positives**
- Missing manifest link in dev XML is expected; PWA is intentionally disabled in dev mode. `index.dev.xml:16` `public/assets/v/1ce85ce/main.js:1684`
- `/assets/dev/*` cache headers are no-store by design for dev assets. `src/worker.js:220`
- Dummy hero video source in template is intentionally non-functional. `index.prod.xml:267`

**Stop Rule**
- If `index.prod.xml` is pasted into a host without the Worker (or Worker routing is missing), `/assets/v/...` will 404 and the site will not render. `index.prod.xml:17` `src/worker.js:146` `wrangler.jsonc:16`
- If `index.dev.xml` is pasted into production, SW/PWA will always stay off (by design), and prod will never behave like real prod. `index.dev.xml:16` `public/assets/v/1ce85ce/main.js:1552`
- If `public/sw.js` VERSION is not updated alongside assets, users already controlled by SW will keep stale caches; deploy appears invisible until SW updates. `public/sw.js:2` `tools/release.js:31`
- If `/offline.html` cannot be fetched at install time, new SW versions will not activate. `public/sw.js:133` `public/sw.js:144`
- If Cloudflare routes omit `www.pakrpp.com/*` or `pakrpp.com/*`, Worker is bypassed and assets/`/blog` aliasing fail. `wrangler.jsonc:16` `.github/workflows/deploy.yml:119`

**Minimal Repro List**
1. Visit `https://www.pakrpp.com/__gg_worker_ping?x=1` and confirm `X-GG-Worker-Version` header exists (Worker bound).
2. Visit `https://www.pakrpp.com/assets/v/1ce85ce/main.js` and confirm 200; then visit `https://www.pakrpp.com/assets/v/1ce85ce/main.css` and confirm 200.
3. Visit `https://www.pakrpp.com/blog` and verify it renders listing (no 404) and URL remains `/blog` after load.
4. Visit `https://www.pakrpp.com/?view=blog` and confirm it normalizes to `/blog` (history replace) when Worker is detected.
5. Visit `https://www.pakrpp.com/gg-flags.json` and confirm JSON + `Cache-Control: no-store`.
6. Open DevTools > Application > Service Workers and confirm `/sw.js` is registered on prod (not in dev mode).
7. With SW registered, hard-refresh; check that `/sw.js` is served with `Cache-Control: no-store` and `X-GG-Worker-Version` header.
8. Go offline and refresh a previously visited page; verify offline fallback (`/offline.html`) displays.
9. Navigate between two posts using in-page links; verify soft-nav updates content and scroll restoration works (no full reload spinner).
10. Click a link to `/feeds/posts/default?alt=json`; verify it falls back to full navigation (not SPA render).
11. On a post with non-blogspot cover image, open Share Sheet and attempt poster export; verify whether cover loads (proxy allowlist).
12. From a content page, use the back button and verify it returns to listing/home according to `gg_last_listing` behavior.
13. In Blogger preview with dev XML, verify assets load from jsdelivr; then switch to prod XML and observe asset 404s.
14. In prod, temporarily remove `/assets/v/1ce85ce` folder and run deploy preflight; confirm deploy fails on missing assets.

