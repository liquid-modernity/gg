# AUDIT_REPORT — BLOG GAGA-ish (pakrpp.com)
Last updated: 2026-02-14
Release ID: 697775d

**Executive Summary**
- Target “100/0ms” for post + native Blogger comments is **not realistic** because comments are third-party, network-bound, and outside Worker/SW control. Best-effort is possible with defers and caching, but hard zero is unrealistic. (Evidence: index.prod.xml:L221-L2834, public/assets/latest/core.js:L211-L259)
- The system **depends on Cloudflare Worker availability** and correct Blogger template paste; if Worker is bypassed or wrong XML is pasted, assets can 404 or SEO can deindex. (Evidence: wrangler.jsonc:L14-L24, index.dev.xml:L16-L172, index.prod.xml:L25-L26, .github/workflows/deploy.yml:L370-L373)
- PWA and `/blog` canonicalization are **gated on Worker detection** with a strict 1200ms timeout; slow networks can disable PWA and alias normalization. (Evidence: public/assets/latest/core.js:L327-L353, public/assets/latest/modules/pwa.js:L76-L95)
- Security posture is **report-only CSP** with `unsafe-inline`; this is visibility, not protection. (Evidence: src/worker.js:L109-L146)
- Performance risks are centered around **external dependencies**, **search index size**, **HTML fetch on every SPA navigation**, and **hero video autoplay**. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L45-L151, public/assets/latest/core.js:L688-L721, public/assets/latest/modules/ui.bucket.listing.js:L10-L19, index.prod.xml:L320-L325)
- Page-type realism: **home/listing** can approach fast-first-interaction with defers; **post without comments** is best-effort; **post with native comments** cannot reach 100/0ms due to third-party scripts. (Evidence: index.prod.xml:L221-L2834, public/assets/latest/core.js:L211-L259)

**Architecture**
- Runtime flow: Browser -> Cloudflare Worker -> Blogger HTML/XML -> Client JS (boot/main/core/modules) -> Service Worker -> Assets. (Evidence: src/worker.js:L149-L763, index.prod.xml:L25-L2834, public/assets/latest/boot.js:L1-L155, public/sw.js:L1-L220)
- Worker responsibilities: route proxy, HTML rewrite for `/blog`, security headers, flags, proxy, telemetry, CSP reporting, asset caching. (Evidence: src/worker.js:L109-L763)
- Template responsibilities: DOM hooks, schema in HTML, asset pins, manifest link, boot loader. (Evidence: index.prod.xml:L25-L2834)
- Client JS responsibilities: router, DOM swap, feed APIs, module loading, PWA registration. (Evidence: public/assets/latest/core.js:L184-L980, public/assets/latest/modules/pwa.js:L76-L235)
- Service Worker responsibilities: cache assets, offline fallback, update flow. (Evidence: public/sw.js:L1-L220)

**Orchestration**
- Build/release is deterministic but **requires clean git tree**; `tools/release.js` updates `public/sw.js`, `src/worker.js`, `index.prod.xml`, and asset versioning. (Evidence: tools/release.js:L11-L185)
- CI runs build + multiple verifiers and enforces determinism; deploy is triggered by API dispatch after CI success. (Evidence: .github/workflows/ci.yml:L24-L126)
- Deploy does preflight, verifies Cloudflare routes, deploys via Wrangler, then runs live header and HTML smoke tests; still requires manual Blogger paste. (Evidence: .github/workflows/deploy.yml:L65-L377)
- Gap: dispatch-based deploy is a single point of failure; no retry/backoff if GitHub API fails. (Evidence: .github/workflows/ci.yml:L106-L126)
- Gap: local Node version (v22) differs from CI (Node 20), risking environment drift. (Evidence: .github/workflows/ci.yml:L18-L22; Appendix: node -v)
- Scripts inventory (release/verify): `build`, `verify:assets`, `verify:xml`, `verify:release`, `prep:release`, `ship`, `zip:audit`. (Evidence: package.json:L1-L15; Appendix: `npm run` output)

**Bugs**
- P0: DEV template contains `noindex,nofollow`; accidental prod paste can deindex entire site. (Evidence: index.dev.xml:L16-L172)
- P1: Worker-gated `/blog` canonicalization fails if Worker is bypassed, creating duplicate `/blog` vs `/?view=blog`. (Evidence: src/worker.js:L409-L477, wrangler.jsonc:L14-L24)
- P1: SW version depends on release script; if release not run, users stay on stale caches. (Evidence: public/sw.js:L1-L4, tools/release.js:L160-L185)
- P2: Router timeout triggers hard reload on slow networks; double-load/jank risk. (Evidence: public/assets/latest/core.js:L707-L721)
- P2: Search/Poster depend on external services and allowlists; failures degrade key UI features. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L45-L151, src/worker.js:L348-L356)

**Mitigations / Recommendations / Progressive Enhancement (Human Behavior)**
- Add mismatch detection banner for dev/prod template to prevent silent failures and deindex. (Evidence: index.dev.xml:L16-L172, index.prod.xml:L25-L26)
- Harden Worker detection (retry/backoff, cached last-known-good) to avoid false negatives on slow networks. (Evidence: public/assets/latest/core.js:L327-L353)
- Replace CDN dependencies with same-origin assets to reduce latency and improve reliability. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L45-L54, public/assets/latest/boot.js:L77-L85)
- Add focus management after SPA navigation for keyboard users; move focus to `#gg-main`. (Evidence: public/assets/latest/core.js:L232-L265, index.prod.xml:L221-L263)
- Respect `prefers-reduced-motion` for hero video autoplay to reduce motion/battery issues. (Evidence: public/assets/latest/modules/ui.bucket.listing.js:L10-L19, index.prod.xml:L195-L197)
- Improve offline UX with retry banner and cached last-N pages for real reading offline. (Evidence: public/sw.js:L197-L220, public/offline.html:L1-L18)
- Guard view transitions with reduced-motion preference to avoid unwanted animations. (Evidence: public/assets/latest/core.js:L264-L265, public/assets/latest/modules/ui.bucket.core.js:L5427-L5435)
- Add `aria-busy`/announcements during SPA navigation to improve screen-reader feedback. (Evidence: public/assets/latest/core.js:L675-L685, public/assets/latest/modules/ui.bucket.core.js:L5430-L5436)
- Suggested perf budgets (best-effort, not measured):\n  - Home: JS <= 180KB, CSS <= 80KB\n  - Listing (/blog): JS <= 220KB, CSS <= 90KB\n  - Post (no comments): JS <= 240KB, CSS <= 90KB\n  - Post (with comments): JS <= 240KB + comments script (external, uncontrolled)

**Reductions (If Required)**
- See `docs/audit/REDUCTIONS.md`.

**Prioritized Next Tasks**
- See `docs/audit/NEXT_TASKS.md`.

**Appendix — Command Outputs (abridged)**

```bash
$ ls -1
docs
index.dev.xml
index.prod.xml
package-lock.json
package.json
public
scripts
src
tools
wrangler.jsonc
```

```bash
$ node -v
v22.19.0

$ npm -v
10.9.3
```

```bash
$ npm run
Scripts available in gg via `npm run-script`:
  build
    node tools/release.js
  build:xml
    node tools/validate-xml.js
  release
    node tools/release.js
  verify:assets
    node tools/verify-assets.mjs
  verify:xml
    node tools/validate-xml.js
  verify:release
    node tools/verify-release-aligned.mjs
  prep:release
    npm ci && npm run build && npm run verify:release
  install:hooks
    node tools/install-hooks.mjs
  ship
    node tools/ship.mjs
  zip:audit
    bash tools/zip-audit.sh
  ship:1
    npm run ship && npm run zip:audit
```

```bash
$ rg -n "hreflang" index.prod.xml index.dev.xml
(no matches)
```

**Appendix — External Runtime Dependencies**
- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`. (Evidence: index.prod.xml:L146-L149)
- instant.page: `https://instant.page/5.2.0`. (Evidence: public/assets/latest/boot.js:L77-L85)
- Fuse.js: `https://cdn.jsdelivr.net/.../fuse.mjs`. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L45-L49)
- idb-keyval: `https://unpkg.com/.../index.js`. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L49-L54)
