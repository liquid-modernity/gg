## Parent architecture contract

This task is subordinate to:

`gg_performance_phase_plan_final_asset_architecture.md`

If there is any conflict:
1. Ownership model from the parent architecture wins.
2. Public route `/landing` remains canonical.
3. Root `flags.json` is the only editable source of truth.
4. Files under `.cloudflare-build/public/` are generated artifacts and must not be manually edited.
5. Any client-side PWA redirect is fallback-only and must not replace Worker/manifest route governance.
6. `devAggressiveUpdate` is forbidden in production mode.

# TASK-043 — Revised Mobile PWA Launch Stability After Live Curl + Repo Audit

## Revision reason

Live `curl` proves Cloudflare Worker is now active on `www.pakrpp.com/*` because responses include:

```txt
X-GG-Worker: edge-governance-v10.2
X-GG-Edge-Mode: development
X-GG-Route-Class: home / landing / diagnostic
```

So this is no longer primarily a Cloudflare route-trigger problem.

The new confirmed issues are:

1. `?m=1` and `?m=0` still return `HTTP/2 200`, not redirect.
2. `/__gg/health` reports `flags.edge.normalizeMobileQuery: false`.
3. Repo contains divergent flags: root `flags.json` and `__gg/flags.json` are not consistent.
4. `manifest.webmanifest` already has `start_url: /landing?source=pwa`, so PWA launch-to-landing is mostly a verification/cache/reinstall issue, not a missing manifest feature.
5. Current `sw.js` is still below the requested PWA freshness contract: no explicit `GG_SW_VERSION`, no robust update governance, no visible reset API, no startup cache-mode diagnostics.
6. `index.xml` does not yet expose early boot instrumentation such as `data-gg-boot`, `data-gg-display-mode`, `data-gg-hydration`, or `window.GG.qa.startup()`.

This revised task replaces the earlier generic version and focuses on the actual repo/live-state mismatch.

---

## Objective

Make PakRPP mobile browser and installed PWA launch route-clean, cache-fresh, and immediately interactive by fixing four issues:

1. Normalize Blogger mobile query parameters `?m=1` and `?m=0`.
2. Ensure installed PWA opens to `/landing` where possible and does not require double tap.
3. Prevent stale service worker/cache from controlling the mobile PWA after major releases.
4. Prevent startup JS from blocking first interaction.

## Non-negotiable architecture

```txt
Blogger SSR = canonical content source
Cloudflare Worker = route/header/PWA governance layer
Service Worker = offline/cache reliability layer
Client JS = progressive enhancement layer
```

Do not convert PakRPP into a SPA. Do not mutate `Blog1`. Do not break Blogger canonical post URLs.

---

# P0 — Fix flags source of truth

## Problem

Live `/__gg/health` reports:

```json
"normalizeMobileQuery": false
```

The repository also shows inconsistency between root flags and `__gg/flags.json`.

This is unacceptable. The Worker cannot behave predictably if flags are divergent or stale.

## Requirements

### 1. Use root `flags.json` as canonical source during build

`cloudflare-prepare.mjs` must read only root:

```txt
flags.json
```

Then write identical copies to:

```txt
.cloudflare-build/public/__gg/flags.json
.cloudflare-build/public/gg-flags.json
.cloudflare-build/public/flags.json
```

### 2. Add a checksum/consistency check

After writing, verify the three files are byte-identical.

Fail build if not.

### 3. Update root `flags.json`

Set:

```json
{
  "mode": "development",
  "edge": {
    "normalizeMobileQuery": true
  },
  "sw": {
    "devAggressiveUpdate": true
  }
}
```

Keep the full existing flags object; do not shrink it.

### 4. Worker fallback default should match the intended policy

In `worker.js`, update `DEFAULT_FLAGS.edge.normalizeMobileQuery` to:

```js
normalizeMobileQuery: true
```

Reason: if flags fail to load, the safer policy for Blogger mobile fingerprint is still to normalize `?m=1` and `?m=0`.

## Acceptance Criteria

```bash
node tools/cloudflare-prepare.mjs
cmp .cloudflare-build/public/__gg/flags.json .cloudflare-build/public/gg-flags.json
cmp .cloudflare-build/public/__gg/flags.json .cloudflare-build/public/flags.json
```

Live:

```bash
curl https://www.pakrpp.com/__gg/health
```

must show:

```json
"normalizeMobileQuery": true
```

---

# P0 — Normalize `?m=1` and `?m=0`

## Problem

Current live output shows:

```txt
curl -I "https://www.pakrpp.com/?m=1"        -> HTTP/2 200
curl -I "https://www.pakrpp.com/?m=0"        -> HTTP/2 200
curl -I "https://www.pakrpp.com/landing?m=1" -> HTTP/2 200
```

This means the normalization contract is not active.

## Requirements

Worker must redirect only exact Blogger mobile values:

```txt
?m=1
?m=0
```

Expected redirects:

```txt
/?m=1                  -> /
/?m=0                  -> /
/landing?m=1           -> /landing
/landing?m=0           -> /landing
/YYYY/MM/post.html?m=1 -> /YYYY/MM/post.html
/YYYY/MM/post.html?m=0 -> /YYYY/MM/post.html
```

Status:

```txt
development/staging -> 302
production           -> 301
```

## Important negative case

Do **not** normalize malformed values such as:

```txt
/?m=1landing
```

That must remain unmodified because `m` is not exactly `1` or `0`.

## Acceptance Criteria

```bash
curl -I "https://www.pakrpp.com/?m=1"
curl -I "https://www.pakrpp.com/?m=0"
curl -I "https://www.pakrpp.com/landing?m=1"
curl -I "https://www.pakrpp.com/landing?m=0"
```

Expected in development:

```txt
HTTP/2 302
location: https://www.pakrpp.com/
```

or:

```txt
HTTP/2 302
location: https://www.pakrpp.com/landing
```

Malformed test:

```bash
curl -I "https://www.pakrpp.com/?m=1landing"
```

Expected:

```txt
HTTP/2 200 or normal route behavior
```

not a redirect caused by mobile normalization.

---

# P0 — Verify installed PWA opens `/landing`

## Current finding

`manifest.webmanifest` already contains:

```json
"start_url": "/landing?source=pwa",
"scope": "/",
"display": "standalone"
```

So the task is not primarily to add `start_url`; it is to verify the installed app receives the updated manifest and is not stuck on an older install/cache.

## Requirements

### 1. Keep manifest contract

Manifest must retain:

```json
{
  "start_url": "/landing?source=pwa",
  "scope": "/",
  "display": "standalone",
  "background_color": "#f4eeef",
  "theme_color": "#f4eeef"
}
```

### 2. Do not strip `source=pwa`

Worker must not remove:

```txt
?source=pwa
?source=pwa-launch
?source=pwa-shortcut
```

### 3. Add optional standalone fallback redirect

If and only if all conditions are true:

```txt
- display mode is standalone
- current path is `/`
- no `m=1` or `m=0` remains after Worker normalization
- no admin/preview/draft/edit/token state
- no session redirect already happened
```

then client may run:

```js
if (standalone && location.pathname === "/" && !sessionStorage.getItem("gg:pwa:landing-redirected")) {
  sessionStorage.setItem("gg:pwa:landing-redirected", "1");
  location.replace("/landing?source=pwa-launch");
}
```

## Acceptance Criteria

```txt
- Fresh install opens /landing?source=pwa or /landing.
- Mobile browser root / still opens / as normal browser route.
- No redirect loop.
- No double tap required.
```

## Manual test

```txt
1. Purge Cloudflare cache.
2. Clear mobile site data.
3. Uninstall existing PakRPP PWA.
4. Reopen site in mobile browser.
5. Install via Add to Home Screen.
6. Launch installed PWA.
7. Confirm location is /landing or /landing?source=pwa.
```

---

# P0 — Service worker/cache freshness governance

## Current finding

Current `sw.js` still does not meet the requested freshness contract. It has cache names and precache URLs, but it lacks the stronger Level 5 PWA governance:

```txt
- no explicit GG_SW_VERSION constant
- no clear GG_SW_NAME
- no robust GG_SW_UPDATE_AVAILABLE flow
- no exposed window.GG.pwa.reset()
- no window.GG.qa.cache()
- no body data-gg-cache-mode contract
- navigationPreload flag exists in Worker diagnostics but SW must actually enable and consume event.preloadResponse
```

## Requirements

### 1. Add explicit SW identity

In `sw.js`:

```js
const GG_SW_NAME = "pakrpp-editorial-pwa";
const GG_SW_VERSION = `${RELEASE}-${TEMPLATE_FINGERPRINT}`;
```

### 2. Navigation preload must be real

In `activate`:

```js
if (self.registration.navigationPreload) {
  await self.registration.navigationPreload.enable();
}
```

In navigation fetch:

```js
const preload = await event.preloadResponse;
if (preload) {
  // validate/cache if needed, then return
}
```

Do not merely expose a flag.

### 3. Development aggressive update

If flags say:

```json
"mode": "development",
"sw": {
  "devAggressiveUpdate": true
}
```

then allow:

```js
self.skipWaiting();
clients.claim();
```

In production, avoid forced reload loops.

### 4. Cache cleanup

On activate:

```txt
- delete old gg-static-* except current
- delete old gg-pages-* except current
- delete old gg-feeds-* except current
- delete old gg-images-* except current
- delete old gg-runtime-* except current
- preserve gg-saved-* unless hard reset
```

### 5. Client reset API

Expose:

```js
window.GG.pwa.clearCaches()
window.GG.pwa.unregister()
window.GG.pwa.reset()
```

Development/staging: allowed.

Production: require `?ggdebug=1`.

### 6. QA diagnostics

Expose:

```js
window.GG.qa.pwa()
window.GG.qa.cache()
```

Minimum output:

```js
{
  supported: true,
  registered: true,
  controlling: true,
  version: "...",
  cacheNames: [...],
  offlineCached: true,
  landingCached: true,
  lastCacheMode: "network-fresh|page-cache-hit|saved-cache-hit|offline-fallback|cache-miss"
}
```

## Acceptance Criteria

```txt
- Installed PWA reports current SW version.
- Old GG cache namespaces are removed after activation.
- /landing cached status is visible in QA.
- window.GG.pwa.reset() clears stale installed-PWA state in development.
- No production reload loop.
```

---

# P0 — Startup JS and first-interaction responsiveness

## Current finding

`index.xml` still does not expose early boot/startup instrumentation such as:

```txt
data-gg-boot
data-gg-display-mode
data-gg-hydration
window.GG.qa.startup()
ggIdle
performance.mark("gg:boot:start")
```

So the “freeze/stuck” feeling cannot yet be measured or controlled.

## Requirements

### 1. Add early body state

```html
<body
  data-gg-boot="starting"
  data-gg-network="unknown"
  data-gg-display-mode="browser"
  data-gg-hydration="critical"
>
```

### 2. Add early boot script before heavy runtime

```js
(function () {
  var body = document.body;
  if (!body) return;

  try { performance.mark("gg:boot:start"); } catch (_) {}

  body.setAttribute("data-gg-boot", "starting");
  body.setAttribute("data-gg-hydration", "critical");
  body.setAttribute("data-gg-network", navigator.onLine ? "online" : "offline");

  var standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  body.setAttribute("data-gg-display-mode", standalone ? "standalone" : "browser");
  body.setAttribute("data-gg-launch-path", location.pathname || "/");
})();
```

### 3. Critical shell boot must happen before heavy hydration

Critical phase:

```txt
- set route/surface state
- bind dock/basic navigation
- bind retry buttons
- set network state
- register SW non-blocking
```

Defer:

```txt
- feed fetch
- discovery index build
- topic grouping
- preview TOC generation
- comments enhancement
- analytics
- non-critical observers
```

### 4. Add idle scheduler

```js
function ggIdle(fn, timeout) {
  var limit = typeof timeout === "number" ? timeout : 1200;
  if ("requestIdleCallback" in window) {
    return requestIdleCallback(fn, { timeout: limit });
  }
  return setTimeout(fn, 64);
}
```

### 5. Add startup diagnostics

Expose:

```js
window.GG.qa.startup()
```

Expected output:

```js
{
  bootState: "hydrated",
  hydration: "complete",
  displayMode: "standalone",
  launchPath: "/landing",
  shellReadyMs: 84,
  firstInteractionReadyMs: 140,
  hydrationCompleteMs: 1200,
  longTasks: []
}
```

### 6. Long task observer

Add `PerformanceObserver` for `longtask` if supported and expose through startup QA.

## Acceptance Criteria

```txt
- Installed PWA shell appears immediately.
- /landing link works on first tap.
- Dock/basic navigation works before feed/discovery hydration.
- window.GG.qa.startup() reports boot timings.
- Material Symbols failure does not block first interaction.
```

---

# Revised combined test plan

## Worker/flags tests

```bash
curl https://www.pakrpp.com/__gg/health
curl https://www.pakrpp.com/__gg/pwa
curl "https://www.pakrpp.com/__gg/headers?url=/?m=1"
```

Expected:

```json
"normalizeMobileQuery": true
```

## Mobile query tests

```bash
curl -I "https://www.pakrpp.com/?m=1"
curl -I "https://www.pakrpp.com/?m=0"
curl -I "https://www.pakrpp.com/landing?m=1"
curl -I "https://www.pakrpp.com/landing?m=0"
curl -I "https://www.pakrpp.com/?m=1landing"
```

Expected:

```txt
?m=1 and ?m=0     -> redirect
?m=1landing       -> no mobile normalization redirect
```

## Installed PWA tests

```js
document.body.dataset.ggDisplayMode
document.body.dataset.ggLaunchPath
document.body.dataset.ggBoot
document.body.dataset.ggHydration
window.GG.qa.startup()
window.GG.qa.pwa()
window.GG.qa.cache()
```

## Manual mobile reset test

```txt
1. Deploy.
2. Purge Cloudflare.
3. Clear mobile site data.
4. Uninstall existing PWA.
5. Reinstall.
6. Launch.
7. Confirm /landing opens directly.
8. Confirm first tap works.
```

---

# Definition of done

```txt
- Worker is active and reports edge-governance-v10.2 or newer.
- /__gg/health reports normalizeMobileQuery=true.
- ?m=1 and ?m=0 redirect to clean URLs.
- malformed ?m=1landing does not redirect as mobile normalization.
- manifest start_url remains /landing?source=pwa.
- installed PWA opens /landing after reinstall.
- stale SW/cache can be reset via window.GG.pwa.reset().
- startup state and timings are visible via window.GG.qa.startup().
- first tap works; no fake loader used to mask slow boot.
```

