# GG Repo Failure Audit Report

## 1. Executive Summary (max 10 bullets)
- `/blog` is treated as the canonical blog home in JS/UI, but it only works when the Cloudflare Worker rewrites it to `/?view=blog`. Without the Worker, `/blog` is passed to origin unchanged and navigation can fail.
- The footer contains dozens of protocol-less or malformed links (`href='www.pakrpp.com'`, `href='www.pakrpp.com#'`, `href='#www.pakrpp.com'`), which resolve to wrong in-site paths or no-op hashes instead of the intended external site.
- PWA install/offline depends on Worker-served assets (`/sw.js`, `/manifest.webmanifest`, `/offline.html`, `/gg-pwa-icon/*`). If the Worker is bypassed or missing, the SW precache fails and offline features do not work.
- `main.js` schedules a lazy-load of `/assets/main.js`, but the deployed entrypoint is `/assets/v/<release>/main.js`; the lazy-load requests a different path and results in a failed fetch if `/assets/main.js` is not separately deployed.

## 2. Failure Matrix

| Area | File | Lines | What breaks | Why (root cause) | Failure condition(s) | Severity |
|---|---|---:|---|---|---|---|
| Routing & Navigation | public/assets/v/8f3d67c/main.js; index.prod.xml; src/worker.js | 112-124, 2779-2785; 1640-1671; 149-153 | Expected `/blog` to render the blog listing; actual behavior is a Worker-dependent rewrite (`/blog` → `/?view=blog`) and no fallback if the rewrite is absent. | UI hardcodes `/blog`, but only the Worker rewrites `/blog` to `/?view=blog`. No non-Worker fallback exists. | Worker inactive/bypassed (preview, origin/blogspot, CF route missing) or no real `/blog` page on origin. | 🔴 |
| Static HTML/XML + Client-side JS | index.prod.xml; index.dev.xml; public/assets/v/8f3d67c/main.js | 2518-2584; 2521-2587; 929-950 | Expected footer links to open the external site; actual behavior resolves them to same-origin paths (e.g., `/www.pakrpp.com`) or hash-only no-ops. | `href` values omit scheme or use hash (`#www...`), so they resolve as relative in-site paths and are SPA-intercepted. | Always on click (JS on: router intercepts; JS off: browser resolves relative). | 🟠 |
| Service Worker (PWA) | public/sw.js; src/worker.js; index.prod.xml | 6-47, 133-138, 167-195; 135-141; 134-135 | Expected SW install/offline to work; actual behavior fails when precache URLs are not served. | SW precaches `/offline.html`, `/manifest.webmanifest`, `/gg-pwa-icon/*` but those assets are only served via Worker static assets. | Worker inactive/bypassed (apex without route, preview, CF misrouting). | 🟠 |
| Client-side JS | public/assets/v/8f3d67c/main.js; index.prod.xml | 10253-10318; 2788-2790 | Expected lazy-load to target the deployed entrypoint; actual request targets `/assets/main.js` (different from `/assets/v/<release>/main.js`). | Lazy-loader hardcodes `/assets/main.js` while deployed entrypoint is versioned `/assets/v/<release>/main.js`. | Always after idle timeout or first user interaction; request fails if `/assets/main.js` is not separately deployed. | 🟡 |

## 3. Hidden Couplings (Critical)
- JS and UI assume `/blog` is canonical; it only works if the Worker rewrites `/blog` → `/?view=blog`. Without the Worker, core navigation fails. (public/assets/v/8f3d67c/main.js:112-124, 2779-2785; src/worker.js:149-153)
- PWA assets (`/sw.js`, `/manifest.webmanifest`, `/offline.html`, `/gg-pwa-icon/*`) only exist when the Worker static-asset binding is active. (public/sw.js:6-47, 133-138; src/worker.js:135-141)
- SPA click interception treats protocol-less links as same-origin, so HTML link mistakes become routing failures. (public/assets/v/8f3d67c/main.js:929-950; index.prod.xml:2518-2584; index.dev.xml:2521-2587)

## 4. False Positives
- Hero video source appears invalid but is explicitly marked as dummy content and “must remain,” so playback failure is intentional. (index.prod.xml:266-269)

## 5. Stop Rule (Non-negotiable failures)
If no fixes are made, the following user actions will ALWAYS fail:
- Clicking any footer link that uses `href='www.pakrpp.com'` or `href='www.pakrpp.com#'` will navigate to an internal path like `/www.pakrpp.com` instead of the external site. (index.prod.xml:2518-2584)
- Clicking the footer “Education” link (`href='#www.pakrpp.com'`) does not navigate away from the current page; it only changes the hash. (index.prod.xml:2580)

## 6. Minimal Repro List
1. Open `https://www.pakrpp.com/` and scroll to the footer.
2. Click **pakrpp Store** (href `www.pakrpp.com`). Expected: external site. Observed: navigation to `/www.pakrpp.com` on the same origin.
3. Click **Shopping Help** (href `www.pakrpp.com#`). Expected: external site. Observed: navigation to `/www.pakrpp.com#` on the same origin.
4. Click **Education** (href `#www.pakrpp.com`). Expected: external site. Observed: hash change only, no navigation.
5. Open DevTools → Network, reload any page, wait ~2.5 seconds. Observe request to `/assets/main.js` (lazy loader) and note it does not match the deployed `/assets/v/<release>/main.js` entrypoint.
6. Open any post detail page and click breadcrumb **Home** (the blog breadcrumb). Expected: blog listing. Observed: `/blog` navigation.
7. With Worker bypassed (e.g., preview/origin without CF), open `https://www.pakrpp.com/blog`. Expected: blog listing. Observed: origin handles `/blog` unchanged.
8. With Worker bypassed, open `https://www.pakrpp.com/manifest.webmanifest`. Expected: JSON manifest. Observed: origin handles the request (Worker not serving assets).
9. With Worker bypassed, open `https://www.pakrpp.com/sw.js`. Expected: service worker JS. Observed: origin handles the request (Worker not serving assets).
10. With Worker bypassed, attempt PWA install; SW precache fails because required asset URLs are not served.
