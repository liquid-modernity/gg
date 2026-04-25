# GG Performance Phase Plan + Final Asset Architecture

## Quick answer first

### 1) Can `/landing.html` be exposed as `/landing`?
Yes.

For this stack, the clean way is:
- keep the physical asset as `landing.html` in the Cloudflare-served layer if that is operationally easiest
- expose it publicly as `/landing`
- make `/landing` the canonical public URL
- do not expose `/landing.html` publicly unless needed for maintenance/debug
- redirect `/landing.html` -> `/landing` or internally rewrite `/landing` -> `landing.html`

Recommended preference:
- public route: `/landing`
- internal asset: either `landing.html` or `landing/index.html`
- edge behavior:
  - request `/landing` -> serve landing asset
  - request `/landing.html` -> 301 redirect to `/landing`

This keeps the URL clean without changing your operational convenience.

---

## Non-negotiable architecture rules

### A. Publishing model
What gets published to Blogger remains primarily:
- `index.xml`

What lives outside Blogger and is delivered by Cloudflare:
- built CSS
- built JS
- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `landing.html` or `landing/index.html`
- PWA icons
- worker logic
- cache headers
- feature flags

### B. Ownership model
- Blogger template owns markup/hook structure
- `b:skin` owns visual state and styling rules
- JS owns controller/binder/state/focus/gesture only
- Cloudflare owns asset delivery, caching, route cleanup, and PWA files

### C. Compromises already accepted
These are allowed residuals and should not block freeze:
- transient gesture physics style writes
- QA iframe inline styles
- parse-only HTML handling that does not author user-facing UI
- native Blogger `widgets.js` as a platform compromise unless a safe isolation path is proven

---

# Phase order that should be followed

## Phase 0 — Baseline and truth
Purpose:
- stop guessing
- create repeatable performance evidence

Tasks:
- capture baseline reports for:
  - `/`
  - `/landing`
  - one post detail route
  - one search no-result route
  - one 404 route
- store:
  - mobile Lighthouse HTML/JSON
  - desktop Lighthouse HTML/JSON
  - short markdown summary
- record:
  - LCP
  - CLS
  - TBT
  - render-blocking requests
  - critical request chain
  - third-party cost
  - main-thread cost

Exit condition:
- `qa/perf-baseline/` exists and becomes the reference point for all future changes

---

## Phase 1 — Kill non-essential critical-path work
Purpose:
- improve mobile first
- remove obvious self-inflicted delay before new features add weight

Priority order:
1. remove secondary content fetches from the initial render path
   - especially discovery/recent/fallback fetches
   - no early `/search?updated-max=...&max-results=999` on first paint
2. keep initial render focused only on:
   - shell
   - listing/article content already needed for the route
   - minimum route-aware state
3. move discovery/recent/fallback loading to one of:
   - after first paint
   - requestIdleCallback / equivalent delayed path
   - explicit user intent
4. audit whether any preview/share/comments bootstraps are still doing early work unnecessarily

Exit condition:
- critical request chain no longer includes heavy secondary content fetches that are not required for first paint

---

## Phase 2 — Asset modularization in source
Purpose:
- make the codebase maintainable without turning runtime into a file waterfall

Principle:
- modular in source
- bundled in release

### CSS source modules
Use domain-based modules, not atomized trivia:
- `tokens.css`
- `base.css`
- `shell.css`
- `dock.css`
- `sheets.css`
- `listing.css`
- `feedback.css`
- `discovery.css`
- `preview.css`
- `detail.css`
- `comments.css`
- `more.css`
- `elements.css`
- `share.css`

### JS source modules
Use controller/service/adapter boundaries:
- `boot.js`
- `core/state.js`
- `core/dom.js`
- `core/copy.js`
- `core/routes.js`
- `core/qa.js`
- `core/utils.js`
- `controllers/panel-controller.js`
- `controllers/discovery-controller.js`
- `controllers/preview-controller.js`
- `controllers/feedback-controller.js`
- `controllers/detail-outline-controller.js`
- `controllers/comments-controller.js`
- `controllers/share-controller.js`
- `controllers/site-head-controller.js`
- `controllers/dock-controller.js`
- `services/discovery-index-service.js`
- `services/feed-service.js`
- `services/preview-data-service.js`
- `services/share-service.js`
- `services/cache-service.js`
- `adapters/blogger-comments-adapter.js`
- `adapters/blogger-feed-adapter.js`
- `adapters/template-adapter.js`

Exit condition:
- source is modular by domain, not trapped in one giant template blob

---

## Phase 3 — Production build, minify, and versioning
Purpose:
- stop shipping large readable source to production
- make asset delivery deterministic

### Release output target
Initial production bundles:
- `gg-app.min.css`
- `gg-app.min.js`
- `gg-boot.min.js` if needed as a very small bootstrap
- optional later:
  - `gg-comments.min.js`
  - `gg-share.min.js`
  - `gg-elements.min.css`

### Rules
- keep output bundles few and strategic
- do not split files unless the split reduces runtime cost or defers non-critical work
- use content hash or release fingerprint in file naming/versioning
- treat build output as immutable

Exit condition:
- every production asset is minified, versioned, and reproducible through CI

---

## Phase 4 — Cloudflare asset delivery and route hygiene
Purpose:
- use the PWA/edge foundation correctly instead of treating Cloudflare as just a CDN logo

### Use Cloudflare for
- serving built CSS/JS
- serving PWA assets
- serving `manifest.webmanifest`
- serving `sw.js`
- serving `offline.html`
- serving landing asset on `/landing`
- cache headers and immutable asset strategy
- optional cached secondary JSON endpoints for discovery/recent

### Route hygiene decisions
- `/landing` is the public route
- `/landing.html` should redirect to `/landing` or not be public
- `/offline.html` stays internal but accessible for SW fallback
- only clean public URLs should appear in navigation, canonical, and user-facing links

### What Cloudflare should not be expected to magically solve
- native Blogger `widgets.js`
- poor first-paint architecture
- bad early fetch decisions
- bloated app logic

Exit condition:
- assets and PWA files are delivered via Cloudflare with strong cache strategy and clean public routes

---

## Phase 5 — Lighthouse and regression gate
Purpose:
- make performance a controlled quality gate, not a panic ritual at the end

### Workflow
- manual Lighthouse in Chrome DevTools during debugging
- CLI Lighthouse in local scripts
- Lighthouse CI in GitHub Actions for regression control

### Suggested starting thresholds
Do not start with fantasy targets.
Start here:
- mobile performance >= 85
- desktop performance >= 95
- accessibility >= 95
- best practices >= 95
- SEO = 100 if possible

Then ratchet upward when stable.

### Important principle
- 100/100 is a stretch bonus, not the baseline promise
- stable green is more valuable than random perfect runs

Exit condition:
- performance regressions are visible and caught before release

---

## Phase 6 — Feature phases after performance groundwork
Only after Phase 1–5 are in place.

Recommended order:
1. `THREAD COMMENTS`
2. `SHARE`
3. `EDITORIAL PIPELINE / ELEMENTS hardening`
4. `SAVE / BOOKMARK / LIBRARY`

### Why this order
#### Comments first
- highest dependency on Blogger native behavior
- highest risk of UX breakage if handled late
- needs stable shell/controller primitives already in place

#### Share second
- can reuse existing article metadata contracts
- lower platform risk than comments
- easier to unify as one sheet after comments shell work is stable

#### Editorial Pipeline / Elements after that
- must remain body-scoped
- should not be allowed to mutate app shell behavior
- easier once comments/share are not moving the shell anymore

#### Library last
- highest risk of becoming a shadow system
- depends on discovery/share/data identity decisions
- easy to overbuild too early

---

# Final folder structure

```text
gg/
├─ template/
│  ├─ index.xml
│  ├─ partials/
│  │  ├─ head.xml
│  │  ├─ shell.xml
│  │  ├─ dock.xml
│  │  ├─ panels.xml
│  │  ├─ discovery.xml
│  │  ├─ preview.xml
│  │  ├─ feedback.xml
│  │  ├─ detail.xml
│  │  ├─ comments.xml
│  │  └─ more.xml
│  └─ templates/
│     ├─ discovery-templates.xml
│     ├─ preview-templates.xml
│     ├─ feedback-templates.xml
│     └─ outline-templates.xml
│
├─ src/
│  ├─ css/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  ├─ shell.css
│  │  ├─ dock.css
│  │  ├─ sheets.css
│  │  ├─ listing.css
│  │  ├─ feedback.css
│  │  ├─ discovery.css
│  │  ├─ preview.css
│  │  ├─ detail.css
│  │  ├─ comments.css
│  │  ├─ more.css
│  │  ├─ elements.css
│  │  └─ share.css
│  └─ js/
│     ├─ boot.js
│     ├─ core/
│     │  ├─ state.js
│     │  ├─ dom.js
│     │  ├─ copy.js
│     │  ├─ routes.js
│     │  ├─ qa.js
│     │  └─ utils.js
│     ├─ controllers/
│     │  ├─ panel-controller.js
│     │  ├─ discovery-controller.js
│     │  ├─ preview-controller.js
│     │  ├─ feedback-controller.js
│     │  ├─ detail-outline-controller.js
│     │  ├─ comments-controller.js
│     │  ├─ share-controller.js
│     │  ├─ site-head-controller.js
│     │  └─ dock-controller.js
│     ├─ services/
│     │  ├─ discovery-index-service.js
│     │  ├─ feed-service.js
│     │  ├─ preview-data-service.js
│     │  ├─ share-service.js
│     │  └─ cache-service.js
│     └─ adapters/
│        ├─ blogger-comments-adapter.js
│        ├─ blogger-feed-adapter.js
│        └─ template-adapter.js
│
├─ pwa/
│  ├─ worker/
│  │  ├─ worker.js
│  │  └─ routes/
│  │     ├─ landing-route.js
│  │     ├─ pwa-route.js
│  │     ├─ asset-route.js
│  │     └─ proxy-route.js
│  ├─ public/
│  │  ├─ manifest.webmanifest
│  │  ├─ sw.js
│  │  ├─ offline.html
│  │  ├─ landing.html
│  │  ├─ robots.txt
│  │  ├─ ads.txt
│  │  ├─ llms.txt
│  │  ├─ __gg/
│  │  │  └─ flags.json
│  │  └─ gg-pwa-icon/
│  ├─ registry/
│  │  ├─ gg-copy-en.json
│  │  ├─ gg-copy-id.json
│  │  ├─ gg-copy-manifest.json
│  │  └─ gg-copy-meta.json
│  ├─ wrangler.jsonc
│  ├─ _headers
│  └─ package.json
│
├─ dist/
│  ├─ css/
│  │  ├─ gg-app.min.css
│  │  ├─ gg-elements.min.css
│  │  └─ gg-critical.css
│  └─ js/
│     ├─ gg-app.min.js
│     ├─ gg-comments.min.js
│     ├─ gg-share.min.js
│     └─ gg-boot.min.js
│
├─ scripts/
│  ├─ build-css.mjs
│  ├─ build-js.mjs
│  ├─ inject-assets.mjs
│  ├─ template-proof.mjs
│  ├─ perf-run.mjs
│  └─ publish-template.mjs
│
├─ qa/
│  ├─ lighthouse/
│  ├─ perf-baseline/
│  ├─ smoke/
│  └─ route-matrix/
│
├─ docs/
│  ├─ architecture/
│  ├─ performance/
│  ├─ comments/
│  ├─ discovery/
│  ├─ elements/
│  └─ share/
│
└─ .github/
   └─ workflows/
      ├─ build.yml
      ├─ deploy-cloudflare.yml
      ├─ lighthouse-ci.yml
      └─ template-proof.yml
```

---

# Naming convention final

## CSS
- files: `kebab-case`
- classes: prefix `gg-`
- state via attributes first:
  - `data-gg-state`
  - `data-gg-surface`
  - `data-gg-mode`
  - `data-gg-active`
- keep utility classes minimal
- do not use historical suffixes like `v2`, `v3`, `latest`, `final`, `new`

Examples:
- `feedback.css`
- `detail-outline.css` is acceptable only if detail gets split later
- `.gg-search-empty`
- `[data-gg-outline-state='micro-peek']`

## JS
- files: `kebab-case`
- group by role:
  - `*-controller.js`
  - `*-service.js`
  - `*-adapter.js`
- function names: verb-first
  - `syncSiteHeadTitle`
  - `buildDiscoveryIndex`
  - `loadRecentArticles`
  - `resolvePreviewData`
  - `bindFeedbackSurface`
- global namespace stays under `GG`
- forbid names like:
  - `temp`
  - `fix2`
  - `newLogic`
  - `finalFix`
  - `superSmartLatest`

## Template XML
- ids and data hooks stay `gg-*`
- template block names describe function, not task history
- wrapper-level conditionals preferred over rendering empty wrappers and hiding later

## PWA / Worker
- route files named by responsibility:
  - `landing-route.js`
  - `pwa-route.js`
  - `asset-route.js`
- public files named by clean public responsibility, not experiment history

---

# Working principles so this does not collapse later

## 1. Template remains the source of markup truth
Do not let JS drift back into writing user-facing markup strings.

## 2. `b:skin` remains the source of visual state truth
Do not move display/background/layout authorship back into JS.

## 3. Modular in source, bundled in release
Do not ship 15 CSS files and 12 JS files to first paint just because the repo is modular.

## 4. Cloudflare is an amplifier, not a magician
It improves delivery and caching.
It does not excuse bad critical-path decisions.

## 5. Performance work comes before heavy feature expansion
Do not open comments/share/library expansion while the critical path is still sick.

---

# Immediate next actions

## Sprint A
- create baseline reports
- isolate and remove secondary early fetches from critical path
- verify improved mobile request chain

## Sprint B
- move GG CSS/JS source into modular folders
- create production build output
- keep Blogger publishing centered on `index.xml`

## Sprint C
- connect build output to Cloudflare delivery
- wire versioned assets into template
- add Lighthouse CI thresholds

## Sprint D
- begin `THREAD COMMENTS`

---

# Final note for a vibe coder

You do not need to understand every low-level mechanism.
You do need to keep these mental rules simple:
- Blogger publishes the template
- Cloudflare serves the assets and PWA files
- repo source should be modular
- release output should stay lean
- performance is fixed before feature sprawl
- `/landing` is the clean public URL, regardless of whether the physical file is `landing.html`

