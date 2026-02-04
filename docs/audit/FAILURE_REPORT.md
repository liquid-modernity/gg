## 1. Executive Summary (max 10 bullets)
- `/blog` canonicalization is now gated by the Worker ping; when the ping fails or lacks `x-gg-worker-version`, JS keeps `/?view=blog` and avoids forcing `/blog`. (public/assets/v/8f3d67c/main.js; src/worker.js:160-165)
- If the Worker is deployed without the `ASSETS` binding, all static asset endpoints (including `/sw.js`, `/manifest.webmanifest`, `/offline.html`) return 502 from the Worker. (src/worker.js:193-202)
- Service Worker registration is gated by the Worker ping; non-Worker hosts keep SW off and skip `/gg-flags.json`. (public/assets/v/8f3d67c/main.js; index.dev.xml:16-17; index.prod.xml:16-17)
- Canonical host enforcement (www vs apex) is not handled in this repo; both apex and www are routed to the Worker and the Worker has no host-redirect logic. **Underspecified** because Cloudflare redirect rules live outside the repo. (wrangler.jsonc:16-27; src/worker.js:4-55)
- Mobile mode (`?m=1`) is dropped when navigating to blog home via dock or breadcrumbs because `blogHomePath()` omits `m=1` and those links use it directly. (public/assets/v/8f3d67c/main.js:116-123, 2164-2172, 2816-2824)
- The prefetch module writes HTML to `CacheStorage` (`gg-pages-v2`), but neither the router nor the Service Worker reads it, so prefetch provides no navigation/offline benefit. (public/assets/v/8f3d67c/main.js:10335-10405, 1669-1707; public/sw.js:176-221)

## 2. Failure Matrix

| Area | File | Lines | What breaks | Why (root cause) | Failure condition(s) | Severity |
|---|---|---:|---|---|---|---|
| Routing & Navigation | public/assets/v/8f3d67c/main.js; src/worker.js | 112-152; 160-165 | Mitigated: blog home stays on `/?view=blog` when Worker ping fails. | Runtime ping sets `GG.env.worker=false`; `/blog` canonicalization is skipped. | Worker route missing/bypassed (preview, origin/blogspot, CF route removed). | 🟢 |
| Integration (Assets) | src/worker.js | 193-202 | Expected: static assets are served. Actual: Worker returns 502 for asset paths when `ASSETS` is missing. | Worker hard-fails when `env.ASSETS` is undefined. | Worker deployed without `ASSETS` binding. | 🔴 |
| Service Worker (PWA) | public/assets/v/8f3d67c/main.js; index.dev.xml; index.prod.xml | 1492-1637; 16-17; 16-17 | Mitigated: SW registers only when Worker ping succeeds. | Runtime ping gates SW init and `/gg-flags.json` fetch. | **Underspecified**: prod template used on non-Worker host, or Worker routes detached. | 🟢 |
| Integration (Canonical Host) | wrangler.jsonc; src/worker.js | 16-27; 4-55 | Expected: apex redirects to `www` canonical. Actual: both apex and www can serve content. | Routes include both hosts and Worker has no host redirect logic. | **Underspecified**: depends on Cloudflare redirect rules outside the repo. | 🟠 |
| Client-side JS | public/assets/v/8f3d67c/main.js | 116-123, 2164-2172, 2816-2824 | Expected: `?m=1` preserved when navigating to blog home. Actual: dock/breadcrumb links drop `m=1`. | `blogHomePath()` does not include `m=1`; callers use it directly. | Any session on `?m=1` using Home Blog in dock or breadcrumbs. | 🟠 |
| Prefetch / Caching | public/assets/v/8f3d67c/main.js; public/sw.js | 10335-10405, 1669-1707; 176-221 | Expected: prefetch improves navigation/offline. Actual: prefetched HTML is never read. | Prefetch only writes `gg-pages-v2`; router uses `fetch` and SW does not consult that cache. | Always (prefetch cache unused). | 🟡 |

## 3. Hidden Couplings (Critical)
- Worker presence is now checked at runtime; `/blog` canonicalization is enabled only when the ping header is present. (public/assets/v/8f3d67c/main.js; src/worker.js:160-165)
- Canonical host behavior depends on Cloudflare redirect rules not present in the repo. The Worker does not enforce `www`. (wrangler.jsonc:16-27; src/worker.js:4-55)
- PWA depends on Worker-hosted endpoints (`/sw.js`, `/manifest.webmanifest`, `/offline.html`, `/gg-flags.json`). SW/flags are now gated by the Worker ping to avoid non-Worker hosts. (public/assets/v/8f3d67c/main.js; public/sw.js:6-47)
- Prefetch writes to `gg-pages-v2`, but no runtime path reads it (router uses `fetch`, SW ignores it). (public/assets/v/8f3d67c/main.js:10335-10405, 1669-1707; public/sw.js:176-221)

## 4. False Positives
- Missing `gg:mode=dev` in `index.prod.xml` is expected for production; it intentionally enables SW/PWA. (index.dev.xml:16-17; index.prod.xml:16-17)
- The SW intentionally skips missing icon URLs during install (non-fatal) to remain resilient. (public/sw.js:133-149)

## 5. Stop Rule (Non-negotiable failures)
If no fixes are made, the following user actions will ALWAYS fail:
- Navigating to blog home from the dock or breadcrumbs while on `?m=1` will drop mobile mode. (public/assets/v/8f3d67c/main.js:116-123, 2164-2172, 2816-2824)

## 6. Minimal Repro List
1. **Worker bypassed**: disable/bypass the Worker route, then open `https://www.pakrpp.com/?view=blog`. Expected: stays on `/?view=blog` (no `/blog` canonicalization).
2. **Worker bypassed**: open `https://www.pakrpp.com/blog` (if the page loads). Expected: JS replaces to `/?view=blog` after ping failure.
3. **Mobile mode loss**: open `https://www.pakrpp.com/?m=1`, click the dock “Home (Blog)” button. Observe URL no longer contains `m=1`.
4. **Mobile mode loss**: on a post detail URL with `?m=1`, click the breadcrumb blog link. Observe `m=1` is dropped.
5. **Prefetch unused**: open any listing page, hover a post card to trigger prefetch, then go offline and click that post. Observe offline fallback rather than cached page (SW never reads `gg-pages-v2`).
6. **Prod template on non-Worker host** (**Underspecified**): apply `index.prod.xml` on an HTTPS preview/origin host without Worker routes. Observe SW registration is skipped (no `/sw.js` or `/gg-flags.json` requests).
7. **ASSETS binding missing** (**Underspecified**): deploy Worker without `ASSETS` binding, then request `https://www.pakrpp.com/sw.js`. Observe 502 from Worker. (src/worker.js:193-202)
8. **Apex host without redirect** (**Underspecified**): if no redirect rule exists, open `https://pakrpp.com/` and observe no redirect to `https://www.pakrpp.com/`.
9. **Apex + /blog** (**Underspecified**): open `https://pakrpp.com/blog` and note it is served directly (no enforced redirect).
10. **Prefetch cache visibility**: open DevTools → Application → Cache Storage and confirm `gg-pages-v2` entries exist after hover, but navigation still uses network. (public/assets/v/8f3d67c/main.js:10335-10405; public/sw.js:176-221)
