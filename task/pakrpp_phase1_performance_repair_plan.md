# PakRPP Phase 1 Performance Repair Plan

**Status:** Development mode  
**Scope:** `/`, `/landing`, `/store`, post detail, search no-result, and 404  
**Goal:** Stabilise performance after critical-only extraction without breaking Blogger SSR, Cloudflare Worker routing, SEO, AI discoverability, or accessibility.

---

## 0. Executive Diagnosis

The extraction phase succeeded technically: `index.xml` is no longer a giant all-in-one file, critical CSS/JS has been separated, and `/__gg/assets/css/gg-app.dev.css` plus `/__gg/assets/js/gg-app.dev.js` are now live through Cloudflare.

The current bottleneck has moved from **asset delivery failure** to **route-level performance debt**.

Current baseline:

| Route | Current State | Priority |
|---|---:|---:|
| `/landing` | Lighthouse mobile ~37 | Critical |
| `/` | Lighthouse mobile ~64 | High |
| `/search?q=zzzzzznotfound` | Lighthouse mobile ~65 | Medium |
| `/halaman-yang-tidak-ada` | Lighthouse mobile ~62 | Medium |
| Post detail | Lighthouse mobile ~64 | High |
| `/store` | Lighthouse mobile ~58 | Critical |
| Accessibility | 100 on tested routes | Preserve |

Current asset sizes:

```text
index.xml                  ~72 KB
__gg/assets/css/gg-app.dev.css   ~64 KB
__gg/assets/js/gg-app.dev.js    ~240 KB
dist/assets/css/gg-app.dev.css  ~64 KB
dist/assets/js/gg-app.dev.js   ~240 KB
```

Main conclusion:

```text
The site is no longer failing because CSS/JS cannot load.
It is now slow because some routes still carry too much visual, font, JavaScript, or native Blogger cost too early.
```

---

## 1. Non-Negotiable Architecture Rules

These rules must not be violated during the repair phase.

### 1.1 Blogger remains the SSR truth

Blogger `index.xml` owns:

- main document structure;
- semantic HTML;
- Blog1 SSR listing/detail output;
- canonical, title, meta, schema, author/date/taxonomy;
- stable data hooks.

Do **not** convert primary listing/detail content into JavaScript-rendered HTML.

### 1.2 Cloudflare owns external assets and routing hygiene

Cloudflare Worker/assets own:

- `/__gg/assets/css/gg-app.dev.css`;
- `/__gg/assets/js/gg-app.dev.js`;
- `/flags.json` and selected `__gg` diagnostics;
- `/landing` static route;
- `/store` static route;
- service worker and manifest delivery;
- route redirects and cache headers.

### 1.3 Critical HTML must stay lean

Critical HTML may contain:

- small critical CSS;
- theme preboot;
- body startup state;
- JSON-LD schema;
- SSR content.

Critical HTML must not contain:

- full app JS;
- full CSS system;
- full copy registry;
- full article/store registry;
- QA/debug matrices;
- unnecessary route modules.

### 1.4 Accessibility score must not be sacrificed

Current accessibility score is strong. Preserve:

- visible focus states;
- real buttons and links;
- `aria-controls`, `aria-expanded`, `aria-hidden`, `aria-modal` contracts;
- keyboard Escape close;
- reduced motion support;
- no raw-key UI text.

---

## 2. Phase 1A — Landing Emergency Diet

### 2.1 Problem

`/landing` scores around 37 on mobile. This is unacceptable because landing is the identity/conversion surface and may be the first page reached from search, AI results, direct links, ads, or social sharing.

The important finding: `/landing` does **not** currently load global app assets:

```text
/__gg/assets/css/gg-app.dev.css
/__gg/assets/js/gg-app.dev.js
```

So the problem is not global app delivery. The problem is that `landing.html` itself is too heavy.

Landing currently includes:

- Google Material Symbols font;
- large inline CSS;
- dock, outline, sheet, panel, token, motion, and theme styling;
- `backdrop-filter`, blur, radial gradients, shadows, and `will-change`;
- reveal animation and intersection/scroll logic;
- copy/interaction JavaScript that is too large for first paint.

### 2.2 Target

```text
Landing mobile performance: 37 → 65 first
Landing mobile performance: 65 → 80 after JS/CSS diet
```

### 2.3 Repair Actions

#### Action L1 — Remove Material Symbols from landing critical path

Remove from `/landing` head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" /></noscript>
```

Replace dock/outline icons with one of these:

- inline SVG;
- short text initials;
- local CSS-only symbols.

Do **not** rely on `/` having loaded the icon font before `/landing`. `/landing` must work as a cold-cache entry point.

#### Action L2 — Disable expensive mobile effects

Add this landing mobile override:

```css
@media (max-width: 768px) {
  body {
    background: var(--gg-surface-page) !important;
  }

  .gg-topbar,
  .gg-dock,
  .gg-detail-outline,
  .gg-sheet__scrim {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  .gg-topbar,
  .gg-dock,
  .gg-detail-outline,
  .gg-card,
  .gg-sheet__panel {
    box-shadow: none !important;
  }

  .gg-detail-outline,
  .gg-dock,
  .gg-reveal {
    will-change: auto !important;
  }

  .gg-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

This is an emergency diet. Quiet luxury does not mean GPU-expensive blur everywhere.

#### Action L3 — Kill reveal animation before first paint

Landing content must be visible immediately. Avoid waiting for JavaScript or IntersectionObserver to reveal content.

Preferred first-paint rule:

```css
.gg-reveal {
  opacity: 1;
  transform: none;
  transition: none;
}
```

If reveal is reintroduced later, it must run only after idle or after first interaction.

#### Action L4 — Defer non-critical landing JavaScript

Immediate JS may do only:

- theme preboot;
- minimal click binding for links/buttons if absolutely needed;
- no large copy registry hydration before paint.

Defer:

- command/search result rendering;
- outline scrollspy;
- dock hide-on-scroll logic;
- language switcher;
- theme panel UI;
- sheet gesture logic;
- QA contracts.

Use:

```js
function deferLandingEnhancement(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1200 });
  } else {
    window.setTimeout(callback, 800);
  }
}
```

Then:

```js
deferLandingEnhancement(function () {
  // outline, panels, scroll state, language/theme, command search
});
```

#### Action L5 — Split landing CSS later

Current landing inline CSS is too large. After emergency patch, move toward:

```text
gg-core.css
landing-critical.css
landing-enhanced.css
```

For now, do not overbuild. First remove font/effects/animation and retest.

### 2.4 Acceptance Criteria

Before moving on:

```text
/landing Lighthouse mobile >= 65
No external Material Symbols request on /landing
No critical-path backdrop-filter on mobile
No hidden/reveal content waiting for JS
Accessibility remains 100
```

Test:

```bash
curl -s https://www.pakrpp.com/landing \
  | grep -Eo "(src|href)=['\"][^'\"]+" \
  | sed -E "s/^(src|href)=['\"]//" \
  | sort | uniq
```

Expected: no `fonts.googleapis.com` or `fonts.gstatic.com` unless deliberately reintroduced.

---

## 3. Phase 1B — Global Route-Aware App Boot

### 3.1 Problem

Homepage loads:

```text
/__gg/assets/css/gg-app.dev.css
/__gg/assets/js/gg-app.dev.js
Material Symbols subset
Blogger widgets.js
```

This is expected for the blog surface, but the JavaScript bundle must not activate all controllers on every route.

The current dev JS is around 240 KB raw. Size alone is not fatal, but executing too much before user intent is fatal.

### 3.2 Target

```text
All route controllers must be route-aware.
Unused controllers must not run on first paint.
```

### 3.3 Route Ownership Matrix

| Route | Required immediately | Deferred until intent |
|---|---|---|
| `/` | listing shell, dock, basic route state | discovery index, preview enrichment, share sheet |
| post detail | article, toolbar, outline minimum | comments, native form, share sheet, preview enrichment |
| `/landing` | static content, basic anchors | outline scrollspy, panels, language/theme |
| `/store` | store static grid, first product LCP | saved sheet, preview sheet, filters beyond first use |
| search no-result | search input/result shell | large feed/discovery index |
| 404 | error surface, search link | discovery/fallback fetch |

### 3.4 Repair Actions

#### Action G1 — Add route guard before controller init

Pseudo-rule:

```js
const surface = document.body && document.body.dataset.ggSurface;
const page = document.body && document.body.dataset.ggPage;

if (page === 'landing') {
  initLandingMinimal();
  deferLandingEnhancements();
  return;
}

if (surface === 'post') {
  initPostMinimal();
  deferPostEnhancements();
  return;
}

if (surface === 'listing') {
  initListingMinimal();
  deferListingEnhancements();
  return;
}
```

#### Action G2 — Discovery/search must not fetch before intent

Do not build or fetch full discovery index until:

- user clicks Search;
- user focuses command input;
- user types query;
- route is explicitly `/search`.

#### Action G3 — Preview data must not fetch before click

Article preview sheet can exist in DOM, but fetch/enrichment must happen after user clicks preview/open.

#### Action G4 — Share sheet must not initialize heavy platform logic until click

Share links may be static, but heavy copy/link/platform binding should be deferred.

### 3.5 Acceptance Criteria

Homepage first load should not show early network fetches like:

```text
/feeds/posts/default?alt=json
/search?...max-results=...
```

unless the current route explicitly requires them.

Run:

```bash
curl -s https://www.pakrpp.com/ \
  | grep -Eo "(src|href)=['\"][^'\"]+" \
  | sed -E "s/^(src|href)=['\"]//" \
  | sort | uniq
```

Inspect DevTools Network → Fetch/XHR. If feed requests appear before user interaction, defer them.

---

## 4. Phase 1C — Post Detail: Lazy Native Blogger Comments

### 4.1 Problem

Post mobile baseline is around:

```text
Performance ~64
FCP ~3.2s
LCP ~3.7s
TBT ~827ms
```

Native Blogger comments are likely contributing to main-thread and network cost too early.

### 4.2 Target

```text
Post first load shows comment count and Comments button.
Native comments iframe/form loads only when the user opens the comments panel.
```

### 4.3 Repair Actions

#### Action P1 — Keep comment button and count SSR

Allowed on first paint:

```text
Comments button
Comment count
Comments panel shell
```

#### Action P2 — Delay native comments body

Do not render/load native Blogger comment iframe/form before user action.

Possible strategy:

```html
<div id="gg-comments-native-placeholder" data-comments-lazy="true">
  <button data-gg-load-comments>Load comments</button>
</div>
```

Then load/activate native comments only on:

```text
click Comments
open comments panel
focus comments panel
```

#### Action P3 — Do not break SEO/article SSR

The article body, title, author, date, labels, and schema must stay SSR.

### 4.4 Acceptance Criteria

```text
Post mobile performance >= 75
TBT meaningfully lower than baseline
No comments iframe/script before user opens comments
Article remains fully readable without JS
```

---

## 5. Phase 1D — Store LCP and Image Discipline

### 5.1 Problem

Store mobile baseline is around:

```text
Performance ~58
FCP ~2.6s
LCP ~5.3s
TBT ~678ms
```

Likely causes:

- too many product images near first load;
- remote image redirects/placeholders such as `picsum.photos`;
- Material Symbols/web font cost;
- store grid layout work;
- store JS hydration cost.

### 5.2 Target

```text
Store mobile performance >= 75
Store LCP < 3.0s
```

### 5.3 Repair Actions

#### Action S1 — Only first product image is eager

First product/LCP candidate:

```html
<img loading="eager" fetchpriority="high" decoding="async" width="..." height="...">
```

All other product images:

```html
<img loading="lazy" decoding="async" width="..." height="...">
```

#### Action S2 — Stop preloading multiple product images

Preload only the LCP candidate. Do not preload product gallery images or below-the-fold grid images.

#### Action S3 — Replace dummy image sources before production

`picsum.photos` is acceptable in development only. It must not survive production.

#### Action S4 — Reduce icon font cost on store

Use inline SVG or a tighter Material Symbols subset for store critical icons.

### 5.4 Acceptance Criteria

```text
Only one high-priority product image
No mass eager images
LCP < 3.0s
No production picsum images
Store accessibility remains high
```

---

## 6. Phase 1E — Search and 404 Polish

### 6.1 Problem

Search no-result and 404 are in the 62–65 range. These routes should be cheap.

### 6.2 Target

```text
Search no-result mobile >= 75
404 mobile >= 75
```

### 6.3 Repair Actions

#### Action E1 — Do not load discovery/feed unless needed

Search no-result may show a helpful empty state, but it should not fetch a huge feed immediately.

#### Action E2 — Keep 404 static and light

404 should not load full discovery, preview, comments, or store logic.

#### Action E3 — Search fallback only after user intent

If user types another query, then fetch. Do not fetch before input or action.

---

## 7. CSS Strategy: Shared Core, Not One Giant CSS

### 7.1 Wrong Model

Do not use one giant CSS file for all public surfaces:

```text
/, /landing, /store → same full CSS
```

That creates unused CSS and keeps mobile heavy.

### 7.2 Correct Model

Use shared core plus route-specific CSS:

```text
gg-core.css
  tokens, reset, typography, focus, accessibility, primitive dock/sheet basics

gg-blog.css
  listing, post detail, comments shell, preview, discovery

gg-landing.css
  landing hero, sections, landing dock/outline subset

gg-store.css
  store grid, cards, marketplace CTA, store sheets

gg-error.css
  404 and empty search basics
```

Route mapping:

```text
/                 → gg-core.css + gg-blog.css
/post             → gg-core.css + gg-blog.css
/landing          → gg-core.css + gg-landing.css
/store            → gg-core.css + gg-store.css
/search no-result → gg-core.css + gg-error.css or gg-blog.css minimal
/404              → gg-core.css + gg-error.css
```

### 7.3 Current Phase Decision

Do not split CSS immediately before landing emergency patch. First remove landing font/effects/reveal. Then split CSS after measurable improvement.

---

## 8. JavaScript Strategy: Defer by Intent

### 8.1 Current Rule

JavaScript may bind essential navigation early, but expensive behavior must wait.

### 8.2 Early allowed

```text
theme preboot
body state
basic dock click handling
basic panel open/close only if panel exists
route detection
```

### 8.3 Must defer

```text
discovery index
recent feed
preview data fetch
native comments
share platform enhancement
saved/library state
store filters beyond initial grid
QA/debug runtime
language registry hydration beyond visible labels
```

### 8.4 Standard defer helper

```js
function deferNonCritical(callback, timeout) {
  var wait = typeof timeout === 'number' ? timeout : 1200;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: wait });
  } else {
    window.setTimeout(callback, Math.min(wait, 800));
  }
}
```

---

## 9. CI/CD and QA Gates

The deploy chain is now stable. Preserve it.

### 9.1 Required local checks

```bash
node --check worker.js
node --check tools/preflight.mjs
npm run gaga:preflight
```

### 9.2 Required CI checks

CI must prepare Cloudflare public assets before preflight:

```text
.cloudflare-build/public/__gg/assets/css/gg-app.dev.css
.cloudflare-build/public/__gg/assets/js/gg-app.dev.js
```

### 9.3 Required deploy checks

Deploy workflow must copy `gg-app.dev.css/js` immediately before Wrangler deploy in the GitHub runner.

Do not rely on local `.cloudflare-build/` existing.

### 9.4 Live smoke must include

```text
/
/landing
/store
/sw.js
/flags.json
/__gg/assets/css/gg-app.dev.css
/__gg/assets/js/gg-app.dev.js
/assets/store/store.css
/assets/store/store.js
```

---

## 10. Measurement Protocol

### 10.1 After each fix

Run Lighthouse manual mobile in Chrome DevTools for:

```text
/landing
/
post detail
/store
/search?q=zzzzzznotfound
/halaman-yang-tidak-ada
```

### 10.2 Store reports

Save reports to:

```text
qa/perf-baseline/
qa/perf-after-landing-diet/
qa/perf-after-comments-lazy/
qa/perf-after-store-lcp/
```

### 10.3 Do not trust one run

Run each critical route at least twice:

- one cold-ish run;
- one repeat run.

Use trends, not one lucky number.

---

## 11. Work Order

Follow this order exactly.

### Step 1 — Landing emergency patch

```text
Remove landing Material Symbols
Disable mobile blur/shadow/reveal
Defer non-critical landing JS
Retest /landing mobile
```

### Step 2 — Homepage pagination and first-load cleanup

```text
Confirm max-results=999 is gone
Check homepage Fetch/XHR before interaction
Ensure discovery/feed not fetched early
Retest /
```

### Step 3 — Post comments lazy-load

```text
Keep comment count/button
Delay native comments iframe/form
Retest post mobile
```

### Step 4 — Store LCP cleanup

```text
Only first image eager/high priority
All other product images lazy
Reduce icon/font cost
Retest /store
```

### Step 5 — Search/404 minimalisation

```text
No heavy discovery before user input
Keep static empty/error surface
Retest search and 404
```

### Step 6 — Production bundling

```text
gg-app.dev.css → gg-app.<hash>.min.css
gg-app.dev.js  → gg-app.<hash>.min.js
Update XML references
Update Worker asset routing
Update preflight/smoke expectations
```

---

## 12. Stop Conditions

Stop and investigate if any of these happen:

```text
Accessibility drops below 95
Dock/sheet stops opening
/__gg/assets CSS/JS returns 404
CSS/JS MIME type is wrong
Blogger post body disappears from SSR
Canonical/meta/schema disappear
Worker route class becomes wrong
Production accidentally uses development robots lockdown
```

---

## 13. Current Recommended Next Commit

Commit should be narrow:

```text
feat(perf): reduce landing critical path cost
```

Include only:

```text
landing.html or landing source template
optional landing CSS override
no Worker changes
no global app JS rewrite
no comments changes yet
```

Do not mix landing diet with comments/store/global refactor.

---

## 14. Brutal Final Note

The site is no longer broken at the infrastructure layer. That phase is done.

The next risk is self-inflicted complexity: trying to make every route feel like a premium app surface at first paint. That is the wrong instinct.

The correct instinct:

```text
First paint: simple, readable, semantic, fast.
After interaction: luxurious, animated, app-like.
```

If the first screen is slow, the luxury layer is not luxury. It is tax.
