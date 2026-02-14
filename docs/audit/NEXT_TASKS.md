# NEXT_TASKS — Prioritized Backlog
Last updated: 2026-02-14

1. P0-01 Runtime mismatch detector for Blogger XML vs Worker release (banner + telemetry). Expected win: prevent silent blank-page/SEO failures from wrong paste. Acceptance test: paste `index.dev.xml` into prod and see visible warning + telemetry event; smoke fails.
2. P0-02 Harden Worker detection (retry/backoff, longer timeout, cache last known good). Expected win: reduce false PWA disable and `/blog` alias flip. Acceptance test: throttle to Slow 3G; `env.worker` remains true and SW registers.
3. P0-03 Add HSTS header at Worker/edge. Expected win: enforce HTTPS and reduce downgrade/MITM risk. Acceptance test: response headers include `Strict-Transport-Security` with >= 6 months.
4. P0-04 CSP enforcement plan (nonce/hash or reduce inline JS) with staged rollout. Expected win: actual XSS mitigation vs report-only. Acceptance test: `Content-Security-Policy` (enforced) passes with no console violations on home/post.
5. P1-01 Self-host `fuse.js` + `idb-keyval` + `instant.page` in `public/assets/latest`. Expected win: remove third-party runtime dependencies and reduce DNS/TLS overhead. Acceptance test: network trace shows no requests to jsdelivr/unpkg/instant.page.
6. P1-02 Add HTML caching strategy for SPA navigation (stale-while-revalidate or in-memory cache). Expected win: faster back/forward and lower TTFB on repeat nav. Acceptance test: repeated nav to same URL hits cache; TTFB improves.
7. P1-03 Add offline cache for last-N pages (HTML) with size cap. Expected win: real offline reading beyond `/offline.html`. Acceptance test: visit 3 pages, go offline, reload and see content for those pages.
8. P1-04 Focus management on SPA navigation (`#gg-main` focus). Expected win: keyboard and screen reader continuity. Acceptance test: after SPA nav, focus moves to main and skiplink works.
9. P1-05 Respect `prefers-reduced-motion` for hero video autoplay and transitions. Expected win: accessibility + battery savings. Acceptance test: reduced-motion users see no autoplay and no motion-heavy transitions.
10. P1-06 Make search index size configurable (`max-results`) and lower default. Expected win: reduce JSON payload and CPU cost. Acceptance test: change config to 100; feed request uses `max-results=100`.
11. P2-01 Add manifest `scope` and `id` (or `start_url` normalization). Expected win: consistent PWA install identity. Acceptance test: Lighthouse reports valid scope and installability.
12. P2-02 Preload `boot.js` or `main.js` for faster startup on fast networks. Expected win: lower time-to-interactive on cold loads. Acceptance test: TTI improves without blocking render.
13. P2-03 Add telemetry sampling + rate limiting server-side. Expected win: avoid log spam and potential PII accumulation. Acceptance test: repeated telemetry bursts are throttled.
14. P2-04 Add CI check for `gg-config` JSON validity and required keys. Expected win: prevent silent feature disable from invalid JSON. Acceptance test: invalid JSON fails verifier.
15. P2-05 Add Worker-side response cache policy for HTML (explicit no-store or edge caching strategy). Expected win: predictable cache behavior; avoid accidental caching. Acceptance test: HTML responses include explicit Cache-Control.
16. P2-06 Add smoke test for `/gg-flags.json` schema and `csp_report_enabled` key. Expected win: guard flag format drift. Acceptance test: CI fails if flags missing keys.
17. P3-01 Add `hreflang` tags if multilingual/geo targeting is required. Expected win: better regional SEO. Acceptance test: pages include `link rel=alternate hreflang=...`.
18. P3-02 Add robots/sitemap verification in smoke (ensure XML and robots served from Blogger). Expected win: avoid search indexing regressions. Acceptance test: smoke confirms HTTP 200 for `/robots.txt` and `/sitemap.xml`.
19. P3-03 Add user-visible offline banner + retry action. Expected win: reduce bounce on flaky networks. Acceptance test: offline banner shown on failed navigation.
20. P3-04 Document Node version pinning for local dev (match CI Node 20) or update CI to match local tooling. Expected win: fewer build surprises. Acceptance test: `node -v` matches CI or tooling notes updated.
