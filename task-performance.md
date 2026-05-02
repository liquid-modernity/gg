TASK: Fix PakRPP development performance-audit path without switching site to production

CONTEXT
Current live /landing is still in development mode. That is intentional. Do NOT switch the site to production and do NOT remove noindex protection globally.

Current problem:
- Lighthouse/mobile performance shows FCP 22.0s, LCP 22.0s, Speed Index 22.0s, TBT 0ms, CLS 0.001.
- curl headers show:
  x-gg-edge-mode: development
  cache-control: no-store
  x-robots-tag: noindex, nofollow...
  x-gg-static-policy: development-safe
- curl timing shows connect/tls/ttfb are abnormally high from local machine, but route policy still needs fixing because no-store makes performance audit unrealistic.

GOAL
Create a safe "performance audit" mode for development/staging:
- Site remains noindex/nofollow.
- /landing and /store can be cacheable enough for Lighthouse/performance testing.
- Worker/repo remains the source of truth.
- No Cloudflare Dashboard workaround as primary fix.
- Do not change visual UI unless strictly necessary.

FILES TO REVIEW
- worker.js
- sw.js
- _headers
- wrangler.jsonc
- public/__gg/flags.json or .cloudflare-build/public/__gg/flags.json
- any build script that copies flags/headers into .cloudflare-build/public

PRIMARY PATCH REQUIREMENTS

1. Update worker flags contract

In worker.js, extend DEFAULT_FLAGS.edge with:

  performanceAudit: false

Make sure normalizeFlags merges this into flags.edge.

Add helper:

  function isPerformanceAuditMode(flags) {
    return flags.mode === "staging" || flags.edge?.performanceAudit === true;
  }

Do NOT treat performanceAudit as production.
Do NOT make robots indexable in performanceAudit mode.

2. Fix cacheControlForRoute(route, flags)

Current non-production behavior returns no-store for nearly everything. Keep that behavior for normal development, but allow a performance-audit exception.

Expected behavior:

- If flags.mode !== "production" AND performanceAudit is false:
  - keep existing safe behavior:
    - versioned-asset/icon may be short-cacheable
    - everything else no-store

- If flags.mode !== "production" AND performanceAudit is true:
  - landing:
      public, max-age=60, s-maxage=3600, stale-while-revalidate=86400
  - store:
      public, max-age=60, s-maxage=3600, stale-while-revalidate=86400
  - versioned-asset:
      public, max-age=31536000, immutable
  - icon:
      public, max-age=604800
  - service-worker, manifest, flags, diagnostic, robots, offline:
      no-cache, must-revalidate
  - root listing, post, static-page, label, search, html, origin:
      no-store
    Reason: development audit should not accidentally cache Blogger-origin/dynamic pages.

- If flags.mode === "production":
  - landing and store:
      public, max-age=300, s-maxage=86400, stale-while-revalidate=604800
  - versioned-asset:
      public, max-age=31536000, immutable
  - icon:
      public, max-age=604800
  - service-worker, manifest, flags, diagnostic, robots, offline:
      no-cache, must-revalidate
  - Blogger-backed/dynamic routes:
      no-cache, must-revalidate

3. Preserve robots lockdown

Do NOT change routeRobotsTag behavior for non-production.

In development/staging/performanceAudit:
  X-Robots-Tag must remain:
  noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0

In production only:
  /landing, /store, /, posts, static pages may become index, follow.

4. Add explicit debug headers

In withResponsePolicy(), add:

  X-GG-Performance-Audit: true

only when isPerformanceAuditMode(flags) is true.

Also add a route policy reason header, for example:

  X-GG-Cache-Policy-Reason: performance-audit-static-surface

for /landing and /store when performanceAudit is active.

Keep it simple. Do not spam headers on every route unless useful.

5. Update diagnostics

Update /__gg/headers?url=/landing&mode=staging so it reflects:
- mode
- route
- robots
- cacheControl
- performanceAudit boolean
- redirect preview if any

If diagnosticsFlagsForMode() currently only changes mode, extend it carefully so staging implies performanceAudit true OR allow a query parameter:

  /__gg/headers?url=/landing&mode=development&performanceAudit=1

Preferred:
- staging => performanceAudit true
- development => performanceAudit false unless explicit param is passed

6. Update flags asset

Find the actual flags file used by Worker assets:
- public/__gg/flags.json
- .cloudflare-build/public/__gg/flags.json
- gg-flags.json
- __gg/flags.json

Create or update staging/audit flags so development audit can be enabled without production:

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

Do not set mode production.

7. Update _headers carefully

Current _headers is development-safe and uses no-store broadly. Keep the safe baseline, but add comments or split strategy if the repo supports it.

Preferred structure:
- _headers.dev
- _headers.staging
- _headers.production

If build pipeline does not support variants yet, do not overengineer. Instead:
- Keep _headers conservative.
- Let worker.js override route policy because run_worker_first is already true in wrangler.jsonc.
- Do not make dashboard-only cache rules the source of truth.

8. Review sw.js for audit interference

Do not rewrite the service worker.

But ensure:
- devAggressiveUpdate remains false for audit.
- navigation fetch with no-store is acceptable only for normal navigation correctness.
- Add a clear comment that curl is not affected by service worker.
- If there is an easy guard, make performance audit mode avoid unnecessary cache deletion or aggressive skipWaiting behavior.

Do NOT break offline fallback.
Do NOT cache error pages or redirected HTML.

9. Do not edit landing visual design in this task

landing.html already has semantic content, no-JS readable sections, metadata, route links, and machine-readable summary. This task is delivery policy, not UI redesign.

ACCEPTANCE CRITERIA

After deploy in staging/performanceAudit mode:

A. Header test

Run:

curl -I https://www.pakrpp.com/landing | egrep -i 'cf-cache-status|cache-control|age|x-gg|x-robots-tag|content-type|location'

Expected:
- x-gg-edge-mode: staging OR development with X-GG-Performance-Audit: true
- x-gg-performance-audit: true
- x-gg-route-class: landing
- cache-control contains:
  public
  s-maxage
  stale-while-revalidate
- x-robots-tag still contains noindex, nofollow
- content-type: text/html
- no redirect loop

B. Store test

curl -I https://www.pakrpp.com/store | egrep -i 'cf-cache-status|cache-control|age|x-gg|x-robots-tag|content-type|location'

Expected:
- route class store
- performance audit true
- cache-control SWR/cacheable
- x-robots-tag noindex/nofollow
- x-gg-store-cache-policy: swr or cacheable

C. Dynamic route safety test

curl -I https://www.pakrpp.com/ | egrep -i 'cache-control|x-gg|x-robots-tag'

Expected in staging/performanceAudit:
- still no-store or no-cache conservative
- still noindex/nofollow
- do not cache Blogger-backed root listing aggressively

D. Diagnostics test

curl -s 'https://www.pakrpp.com/__gg/headers?url=/landing&mode=staging' | jq .

Expected:
- route: landing
- cacheControl includes stale-while-revalidate
- robots includes noindex
- performanceAudit true

E. Local network separation test

Run this manually, but do not treat it as Worker bug:

for v in -4 -6; do
  echo "=== $v ==="
  curl $v -s -o /dev/null \
    -w 'dns:%{time_namelookup} connect:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\n' \
    https://www.pakrpp.com/landing
done

If -4 is fast and -6 is slow, report that this is Cloudflare/network/IPv6 path, not Worker rendering.

NON-GOALS
- Do not switch to production.
- Do not remove development noindex.
- Do not redesign landing.
- Do not make Cloudflare Dashboard cache rules the primary fix.
- Do not disable Worker route governance.
- Do not change canonical route truth:
  /landing = Home/identity
  / = Blog listing
  /store = Store

DELIVERABLE
Return:
1. Changed files.
2. Summary of exact policy changes.
3. Before/after header output for /landing and /store.
4. Confirmation that robots remains noindex in staging/performanceAudit.
5. Confirmation that dynamic Blogger-backed routes are not aggressively cached.
6. Any remaining issue separated into:
   - repo/worker issue
   - Cloudflare dashboard/network issue