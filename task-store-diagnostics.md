You are working inside my PakRPP / Yellow Cart project.

Current situation:
- store static build passes.
- store proof passes.
- store artifact smoke passes.
- live /store eventually returns HTML and contains static product content.
- But live /store has TTFB around 75 seconds.
- npm run gaga:verify-worker-live fails mostly because its curl timeout is 15 seconds and live responses time out with status 000.
- Development mode intentionally emits noindex/noindex-style X-Robots-Tag.
- Diagnostic endpoints exist:
  /__gg/headers?url=/store&mode=development
  /__gg/headers?url=/store&mode=production
  /__gg/robots?mode=production

Goal:
Fix live smoke logic and diagnose the 75s TTFB. Do not redesign UI. Do not change store static generator unless needed for proof correctness. Do not remove development noindex globally.

TASK 1 — Fix diagnostic endpoint checks in live smoke

qa/live-smoke-worker.sh currently appears to use response headers for /__gg/headers?url=/store&mode=production.

Problem:
curl -I only sees the diagnostic endpoint HTTP headers, which remain x-gg-edge-mode: development. That does not prove the simulated production header body is wrong.

Change live smoke so that for diagnostic endpoints it:
1. Fetches the JSON body with curl -sS, not curl -I.
2. Parses the returned JSON.
3. Checks the simulated production result inside the JSON body.
4. Verifies production simulation for /store does NOT include:
   - noindex
   - nofollow
   - nosnippet
   - noimageindex
   - max-snippet:0
   - max-image-preview:none
5. Verifies development simulation MAY include noindex guard.
6. Prints a clear PASS/WARN/FAIL distinction:
   - FAIL if production simulation says noindex.
   - PASS if production simulation is indexable.
   - WARN if current deployment mode is development.

Do not treat the diagnostic endpoint's own HTTP X-Robots-Tag as the production simulation result.

TASK 2 — Add latency diagnostics to live smoke

Because live /store currently has TTFB around 75s, update qa/live-smoke-worker.sh to report timing clearly.

For each important route:
- /
- /store
- /landing
- /flags.json
- /sw.js
- /__gg/headers?url=/store&mode=production

Record:
- HTTP status
- time_namelookup
- time_connect
- time_appconnect
- time_starttransfer
- time_total
- size_download
- x-gg-edge-mode
- x-gg-route-class
- cf-cache-status if present
- cache-control
- x-gg-release

Use curl -w.

Keep a default timeout, but make it configurable:
GG_LIVE_TIMEOUT_SECONDS default 20
Allow:
GG_LIVE_TIMEOUT_SECONDS=90 npm run gaga:verify-worker-live

If timeout occurs:
- report TIMEOUT
- do not pretend artifact markers are missing unless body was actually fetched.

TASK 3 — Separate “unreachable” from “content missing”

Currently live smoke reports marker missing after curl timeout. That is misleading.

Change logic:
- If curl status is 000 or timeout:
  report route unreachable/timeout.
  skip body marker checks for that route.
- Only check body markers when HTTP status is 200 and body was downloaded.
- This avoids false negatives like “static-grid-snippet missing” when the response never arrived.

TASK 4 — Investigate why /store TTFB is ~75s

Inspect worker.js routing path for /store and static assets.

Find whether /store is served from:
- Cloudflare Assets
- Blogger origin
- Worker fallback
- origin route
- diagnostic/development path

Add a lightweight debug header for /store response if safe:
- x-gg-store-source: assets | blogger-origin | worker-fallback | unknown
- x-gg-store-static: present | missing
- x-gg-store-cache-policy: no-store | cacheable | swr

Do not expose secrets.

TASK 5 — Check whether /store is accidentally bypassing Cloudflare Assets

The artifact smoke confirms:
.cloudflare-build/public/store.html exists and passes proof.

But live /store route class shows origin/development behavior.

Verify:
- Does /store request serve the built .cloudflare-build/public/store.html?
- Or does it pass to Blogger origin?
- Or does Worker fetch another source?

If /store is intended to be Cloudflare Assets-backed, ensure Worker routing serves asset first for /store and does not wait on Blogger origin.

Do not break:
- /
- /landing
- post URLs
- Blogger routes
- /search/label/Store

TASK 6 — /store/ redirect status

Current live /store/ returns 302 to /store.

Keep development 302 if intentional, but production mode should return 301 or 308.

Update production-mode simulation/proof to enforce:
- /store/ -> /store permanent redirect

TASK 7 — robots.txt clarity

Production robots body currently blocks GPTBot, Google-Extended, CCBot, ClaudeBot, anthropic-ai, PerplexityBot, Applebot-Extended, Bytespider, Amazonbot, then allows User-agent: *.

This means OAI-SearchBot and Googlebot are implicitly allowed.

Improve clarity by explicitly adding:

User-agent: Googlebot
Allow: /

User-agent: OAI-SearchBot
Allow: /

Keep GPTBot and Google-Extended blocked if current policy intentionally blocks training/extended AI use.

TASK 8 — Acceptance criteria

After changes:

Local:
- npm run store:build passes
- npm run store:proof passes
- npm run gaga:verify-store-artifact passes
- npm run gaga:verify-worker passes

Live with normal timeout:
- npm run gaga:verify-worker-live should not produce false marker-missing errors after timeout.
- It should report timeout separately if live is too slow.

Live with extended timeout:
- GG_LIVE_TIMEOUT_SECONDS=90 npm run gaga:verify-worker-live should fetch /store and validate static markers if the response still takes ~75s.
- It should report TTFB and total time.

Production simulation:
- /__gg/headers?url=/store&mode=production JSON body must show production /store is indexable.
- /__gg/robots?mode=production must explicitly allow Googlebot and OAI-SearchBot.
- /store/ production simulation must be 301 or 308 to /store.

Performance:
- Identify whether /store is served from Cloudflare Assets or Blogger origin.
- Explain why TTFB is ~75s.
- Propose the smallest safe routing/cache fix to bring TTFB under 2s in development and under 1s in production.

Deliver:
- changed files
- exact diagnosis of /store source path
- exact reason live smoke was failing
- whether verify-worker-live was outdated or simply timing out
- before/after curl timing for /store
- whether OAI-SearchBot is explicitly allowed in production robots