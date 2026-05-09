# TASK 000 — Implement performance-audit mode without switching production

## Context

The site is intentionally still in development mode. That is correct. However, normal development mode currently uses broad `no-store`, making Lighthouse/performance audit results less useful for selected static surfaces such as `/landing` and `/store`.

Do **not** switch the site to production. Do **not** remove non-production robots lockdown.

## Goal

Create a safe `performanceAudit` mode for staging/development testing:

```text
- /landing and /store become cacheable enough for performance audit
- robots remain noindex/nofollow outside production
- Blogger-backed dynamic routes remain conservative
- Worker/repo remains source of truth
- Cloudflare Dashboard cache rules are not the primary fix
```

## Files to inspect

```text
worker.js
sw.js
_headers
wrangler.jsonc
public/__gg/flags.json
.cloudflare-build/public/__gg/flags.json
any script that copies flags/headers into .cloudflare-build/public
```

## Required changes

### 1. Extend flags contract

In `worker.js`, extend `DEFAULT_FLAGS.edge`:

```js
performanceAudit: false
```

Make sure `normalizeFlags()` preserves and merges this value.

Add helper:

```js
function isPerformanceAuditMode(flags) {
  return flags.mode === "staging" || flags.edge?.performanceAudit === true;
}
```

Rules:

```text
performanceAudit is not production.
performanceAudit must not make robots indexable.
staging implies performanceAudit true.
development implies performanceAudit false unless explicitly configured or diagnostics query asks for it.
```

### 2. Update `cacheControlForRoute(route, flags)`

Expected behavior:

#### Normal non-production without performance audit

```text
if flags.mode !== "production" AND performanceAudit is false:
- keep current development-safe behavior
- versioned assets/icons may be short-cacheable if already allowed
- everything else remains no-store/conservative
```

#### Non-production with performance audit

```text
landing:
  public, max-age=60, s-maxage=3600, stale-while-revalidate=86400

store:
  public, max-age=60, s-maxage=3600, stale-while-revalidate=86400

versioned-asset:
  public, max-age=31536000, immutable

icon:
  public, max-age=604800

service-worker, manifest, flags, diagnostic, robots, offline:
  no-cache, must-revalidate

root listing, post, static-page, label, search, html, origin:
  no-store
```

Reason: development audit should not accidentally cache Blogger-origin/dynamic pages.

#### Production

```text
landing/store:
  public, max-age=300, s-maxage=86400, stale-while-revalidate=604800

versioned-asset:
  public, max-age=31536000, immutable

icon:
  public, max-age=604800

service-worker, manifest, flags, diagnostic, robots, offline:
  no-cache, must-revalidate

Blogger-backed/dynamic routes:
  no-cache, must-revalidate
```

### 3. Preserve robots lockdown

Non-production, staging, and performanceAudit must still emit:

```text
X-Robots-Tag: noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0
```

Production only may become indexable according to existing route rules.

### 4. Add debug headers

In response policy code, add:

```text
X-GG-Performance-Audit: true
```

only when `isPerformanceAuditMode(flags)` is true.

For `/landing` and `/store` in performance audit mode, add a useful reason header:

```text
X-GG-Cache-Policy-Reason: performance-audit-static-surface
```

Do not spam unnecessary headers everywhere.

### 5. Update diagnostics

Update `/__gg/headers` diagnostics so it reports:

```json
{
  "mode": "staging",
  "route": "landing",
  "robots": "...",
  "cacheControl": "...",
  "performanceAudit": true,
  "redirectPreview": "..."
}
```

Support:

```text
/__gg/headers?url=/landing&mode=staging
/__gg/headers?url=/landing&mode=development&performanceAudit=1
```

Preferred behavior:

```text
staging => performanceAudit true
development => performanceAudit false unless performanceAudit=1
```

### 6. Update flags asset

Create/update staging/audit flags without setting production:

```json
{
  "mode": "staging",
  "edge": {
    "performanceAudit": true,
    "canonicalHost": true,
    "httpsRedirect": true,
    "normalizeMobileQuery": true,
    "redirectLegacyViews": true,
    "annotateTemplateContract": true,
    "mutateLandingContactAnchor": true,
    "hardBlockKnownBotsInDevelopment": false
  },
  "robots": {
    "developmentLockdown": true,
    "blockAiBots": true,
    "blockSearchBots": true
  },
  "sw": {
    "enabled": true,
    "navigationPreload": true,
    "htmlQualityGate": true,
    "offlineSearch": true,
    "savedReading": true,
    "contentIndex": false,
    "backgroundSync": false,
    "devAggressiveUpdate": false,
    "debug": false
  }
}
```

Do not set `mode: "production"`.

### 7. `_headers` policy

Do not overbuild if the current build pipeline does not support `_headers.dev`, `_headers.staging`, `_headers.production`.

Preferred now:

```text
- keep _headers conservative
- let worker.js override route policy because wrangler run_worker_first is the governance layer
- do not rely on dashboard-only Cloudflare cache rules
```

### 8. Service worker

Do not rewrite `sw.js`.

Check only:

```text
- devAggressiveUpdate is false for audit
- no aggressive cache deletion in performance audit mode
- offline fallback remains intact
- curl is not affected by service worker; add comment if useful
```

## Non-goals

- Do not redesign landing.
- Do not touch Material Symbols yet.
- Do not optimize images yet.
- Do not lazy-load comments yet.
- Do not switch production.
- Do not remove `noindex` outside production.

## Acceptance tests

### `/landing`

```bash
curl -I https://www.pakrpp.com/landing | egrep -i 'cf-cache-status|cache-control|age|x-gg|x-robots-tag|content-type|location'
```

Expected:

```text
x-gg-edge-mode: staging OR development with x-gg-performance-audit: true
x-gg-performance-audit: true
x-gg-route-class: landing
cache-control includes public, s-maxage, stale-while-revalidate
x-robots-tag includes noindex,nofollow
content-type: text/html
no redirect loop
```

### `/store`

```bash
curl -I https://www.pakrpp.com/store | egrep -i 'cf-cache-status|cache-control|age|x-gg|x-robots-tag|content-type|location'
```

Expected:

```text
x-gg-route-class: store
x-gg-performance-audit: true
cache-control includes SWR/cacheable
x-robots-tag includes noindex,nofollow
```

### Dynamic route safety

```bash
curl -I https://www.pakrpp.com/ | egrep -i 'cache-control|x-gg|x-robots-tag'
```

Expected in staging/performanceAudit:

```text
root listing remains no-store or conservative no-cache
robots remain noindex,nofollow
Blogger-backed routes are not aggressively cached
```

### Diagnostics

```bash
curl -s 'https://www.pakrpp.com/__gg/headers?url=/landing&mode=staging' | jq .
```

Expected:

```text
route: landing
cacheControl includes stale-while-revalidate
robots includes noindex
performanceAudit: true
```

### Local network separation

```bash
for v in -4 -6; do
  echo "=== $v ==="
  curl $v -s -o /dev/null \
    -w 'dns:%{time_namelookup} connect:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\n' \
    https://www.pakrpp.com/landing
done
```

If IPv4 is fast and IPv6 is slow, report it as Cloudflare/network/IPv6 path, not Worker rendering.

## Deliverable

Return:

1. Changed files.
2. Exact cache/robots policy changes.
3. Before/after headers for `/landing` and `/store`.
4. Confirmation robots remain noindex in performance audit.
5. Confirmation Blogger-backed dynamic routes are not aggressively cached.
6. Any remaining issue classified as:
   - repo/worker issue
   - Cloudflare dashboard/network issue
