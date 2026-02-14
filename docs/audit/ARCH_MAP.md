# ARCH_MAP — BLOG GAGA-ish (pakrpp.com)
Last updated: 2026-02-14
Release ID: 697775d

**Repo Summary**
- Top-level: docs, index.dev.xml, index.prod.xml, package.json, public, scripts, src, tools, wrangler.jsonc. (Command: `ls -1`)
- Worker entrypoint: `src/worker.js` (Cloudflare Worker fetch handler). (Evidence: src/worker.js:L149-L763)
- Blogger templates: `index.dev.xml` and `index.prod.xml`. (Evidence: index.dev.xml:L1-L120, index.prod.xml:L1-L220)
- Service Worker: `public/sw.js`. (Evidence: public/sw.js:L1-L220)
- Assets: `public/assets/latest/*` for DEV and `public/assets/v/697775d/*` for PROD. (Evidence: index.dev.xml:L75-L76, index.prod.xml:L25-L26, tools/release.js:L111-L186)
- CI/CD: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`. (Evidence: .github/workflows/ci.yml:L1-L126, .github/workflows/deploy.yml:L1-L377)
- Worker config/routes: `wrangler.jsonc`. (Evidence: wrangler.jsonc:L1-L25)

**Boundaries (Contract Surfaces)**
- Blogger Template Surface: HTML/DOM hooks, schema, manifest link, boot loader, comments. (Evidence: index.prod.xml:L25-L116, L221-L2834)
- Cloudflare Worker Surface: routing, HTML rewrite, asset serving, security headers, flags, proxy, telemetry, CSP reporting. (Evidence: src/worker.js:L109-L763)
- Client JS Surface: boot/main/core modules, router, API, UI buckets. (Evidence: public/assets/latest/boot.js:L1-L155, public/assets/latest/core.js:L160-L980)
- Service Worker Surface: caching, offline fallback, update behavior. (Evidence: public/sw.js:L1-L220)
- Assets Surface: cache headers for latest vs pinned. (Evidence: public/_headers:L1-L23, src/worker.js:L741-L755)
- CI/CD Surface: build, verify, deploy, smoke. (Evidence: .github/workflows/ci.yml:L24-L105, .github/workflows/deploy.yml:L65-L377)

**Request Flow (Runtime)**
- Browser requests `https://www.pakrpp.com/*`.
- Cloudflare Worker routes the request, serves static assets or proxies to Blogger HTML. (Evidence: wrangler.jsonc:L14-L24, src/worker.js:L399-L705)
- Worker optionally rewrites HTML for `/blog` canonicalization and schema injection. (Evidence: src/worker.js:L407-L702)
- Blogger template provides DOM hooks and boot script references. (Evidence: index.prod.xml:L221-L2834)
- Boot loader requests `main.js` then `core.js` and modules. (Evidence: public/assets/latest/boot.js:L73-L105, public/assets/latest/main.js:L1-L40, public/assets/latest/core.js:L864-L980)
- Service Worker registers only when Worker is detected and not in dev mode. (Evidence: public/assets/latest/core.js:L327-L353, public/assets/latest/modules/pwa.js:L76-L235)
- SW caches assets; navigation uses network-first with offline fallback. (Evidence: public/sw.js:L176-L220)

**Entrypoints**
- Worker fetch handler: `export default { async fetch(...) { ... } }`. (Evidence: src/worker.js:L149-L763)
- HTML transform pipeline: `HTMLRewriter` in worker. (Evidence: src/worker.js:L580-L702)
- Boot loader: `public/assets/latest/boot.js`. (Evidence: public/assets/latest/boot.js:L1-L155)
- Router + render: `public/assets/latest/core.js` (`GG.core.router`, `GG.core.render`). (Evidence: public/assets/latest/core.js:L184-L814)
- Service worker: `public/sw.js`. (Evidence: public/sw.js:L1-L220)

**Runtime Config Endpoints**
- `/__gg_worker_ping`: Worker health + version header. (Evidence: src/worker.js:L179-L183)
- `/gg-flags.json`: feature flags (sw + CSP). (Evidence: src/worker.js:L185-L199, public/__gg/flags.json:L1-L6)
- `/api/telemetry`: client telemetry sink. (Evidence: src/worker.js:L214-L228)
- `/api/proxy`: image proxy with allowlist. (Evidence: src/worker.js:L325-L397)
- `/api/csp-report`: CSP report receiver. (Evidence: src/worker.js:L231-L323)

**Key Contracts**
- DEV/PROD split: `index.dev.xml` uses `/assets/latest/*` and `gg:mode=dev`; `index.prod.xml` uses `/assets/v/<release>/*`. (Evidence: index.dev.xml:L16-L76, index.prod.xml:L25-L26, L2833)
- DOM hooks: `#gg-main`, `#gg-dialog`, `#gg-share-sheet`, `#gg-config`. (Evidence: index.prod.xml:L262-L2834, public/assets/latest/modules/ui.bucket.core.js:L1173-L1184)
- Cache headers: latest no-store vs pinned immutable. (Evidence: public/_headers:L1-L23, src/worker.js:L741-L755)
