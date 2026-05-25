# TASK-STORE-MODAL-SCROLLLOCK-PREVIEW-RELIABILITY

## Status

Priority: **P0 corrective stability task**  
Type: **Runtime interaction + preview visual contract hardening**  
Scope: **Store modal scroll lock, Store preview open reliability, Root/Store preview intro/content-lift refinement**  
Surfaces affected: `/store`, `/`, and shared preview frame source  
Do **not** use Playwright, Puppeteer, Cypress, or heavy local browser automation.

---

## Context

The previous task improved static visual contracts and guards, but manual QA still found real runtime issues on the live site:

1. On `/store`, opening `More` or `Discovery` can shift the underlying Store page scroll position downward.
2. On `/store`, while a modal sheet is open, the Store page behind the sheet can still be scrolled. This is wrong.
3. On `/store`, clicking a product preview sometimes opens the preview sheet and sometimes follows the product/detail link.
4. Store preview vertical scrolling is now working.
5. Root preview horizontal overflow is now fixed.
6. Attached outline width is now correct.
7. Light/dark theme is now acceptable.
8. Root and Store preview intro/content lift are not visually ideal yet. The provided mockup should be treated as the visual target: dominant hero, title/meta inside hero, lifted content surface/card, no excessive lift, viewport-safe.

This task must fix the remaining runtime and preview-frame issues without bloating the codebase.

---

## Strategic Goal

Move the project closer to the original target:

> HTML fallback, semantic HTML, registry-driven behavior, JSON-LD/schema readiness, accessibility, mobile-first native-app feel, easy configuration of microcopy/icons/tokens, centralized controller/source of behavior, global sheet contract with surface-aware adapters, one global visual rhythm, efficient for AI code agents/non-technical maintainers, stable global functionality at `/`, `/landing`, and `/store`, no override code, no unused CSS/JS/HTML, CI/CD and Cloudflare deploy readiness, top-tier SEO/GEO/AI discoverability.

This task is specifically about **runtime modal stability and preview reliability**. Do not reopen unrelated visual systems unless required to prevent regression.

---

## Hard Constraint — Rewrite, Not Override/Patch

This task must be implemented as a source-level rewrite/refactor, not an override layer.

Do **not** solve by:

- appending new CSS at the bottom merely to defeat old CSS;
- using `!important`;
- creating duplicate scroll-lock handlers while leaving old handlers active;
- creating second/third preview click interception paths;
- patching `store.html` inline artifact manually without updating source/build input;
- leaving stale local Store preview frame rules that compete with the global preview frame;
- weakening HTML fallback by removing real anchors;
- blocking all anchors permanently just to force preview behavior;
- adding Playwright/Puppeteer/Cypress/heavy browser automation.

Required approach:

- fix the active source of behavior;
- preserve semantic/fallback anchors;
- add JS-ready gating only when JS is actually booting/ready;
- keep one global preview frame source;
- use Store only as a content adapter, not as a competing frame system;
- keep scroll lock centralized and predictable;
- update guards to prevent this exact regression from returning.

---

## Non-goals

Do not touch unless directly necessary:

- More sheet global component styling, except Store scroll-lock interaction;
- Root/Landing Discovery parity;
- Store Discovery content design;
- dark/light theme tokens, unless required for preview lift token consistency;
- outline width, unless preventing regression;
- comments UI;
- dock design;
- SEO/schema content, except preserving anchors/fallback.

---

# Part A — Store Modal Scroll Lock

## Problem

Manual QA found:

> `/store` → scroll to middle → click `More`/`Discovery` → sheet opens, but the Store page behind it can still scroll.

This breaks modal behavior. When a modal sheet is active, the underlying Store surface must not move, receive scroll gestures, or react to interaction.

## Required Behavior

When any Store modal sheet is active, including:

- Store More
- Store Discovery
- Store Saved
- Store Preview

then:

- document/page scroll must be locked;
- Store background must not respond to wheel/touchmove;
- Store background must not receive pointer/click;
- Store background must not receive keyboard focus;
- the active sheet body/panel must remain vertically scrollable;
- dock remains demoted/inert according to the existing modal dock demotion contract;
- closing the modal restores the page exactly to its previous scroll position.

## Implementation Requirements

### 1. Centralize Store modal background lock

Create or update a single Store modal background-lock helper, for example:

```js
function setStoreModalBackgroundLocked(isLocked) {
  // one source of truth for background lock
}
```

It should coordinate:

- `body[data-gg-scroll-lock]`;
- Store surface/root inert state;
- dock inert state;
- filter outline inert state;
- pointer/focus disabling for Store background;
- scroll restoration.

Do not scatter lock logic across each individual sheet.

### 2. Prevent background touch/wheel scroll

CSS alone may not be enough on mobile/touch devices.

Use a combination of:

```css
body[data-gg-scroll-lock='true'] {
  overflow: hidden;
  overscroll-behavior: none;
}

body[data-gg-panel-active='true'] .store-shell,
body[data-gg-panel-active='true'] .store-grid,
body[data-gg-panel-active='true'] [data-store-background] {
  pointer-events: none;
  user-select: none;
}
```

Exact selectors may differ depending on existing Store structure. Use the active Store background container(s), not broad random selectors.

If JS event-level guarding is needed, use a minimal passive-safe handler:

```js
function preventBackgroundScroll(event) {
  if (!isStoreModalActive()) return;
  if (event.target && event.target.closest('.gg-sheet__panel, [data-gg-scroll-container]')) return;
  event.preventDefault();
}
```

Only attach while modal is active. Remove it on close.

Do not prevent scrolling inside the active sheet.

### 3. Keep active sheet scrollable

Store preview and Store Discovery must still scroll vertically inside the sheet. Do not solve background scroll by disabling all touch/wheel globally.

Acceptance:

- background cannot scroll;
- active sheet can scroll vertically;
- no horizontal preview scroll.

---

# Part B — Store Page Scroll Preservation

## Problem

Manual QA found:

> `/store` → click `More`/`Discovery` → sheet opens → the Store page position shifts downward.

Current scroll preservation is likely too shallow.

## Required Behavior

Opening any Store sheet must not change the background page scroll position.

This applies to:

- More
- Discovery
- Saved
- Preview

## Implementation Requirements

### 1. Harden `preservePageScrollDuring()`

If a helper already exists, rewrite it properly instead of layering another helper.

Expected behavior:

```js
function preservePageScrollDuring(operation) {
  const x = window.scrollX || document.documentElement.scrollLeft || 0;
  const y = window.scrollY || document.documentElement.scrollTop || 0;

  const restore = () => {
    window.scrollTo(x, y);
    document.documentElement.scrollLeft = x;
    document.documentElement.scrollTop = y;
    document.body.scrollLeft = x;
    document.body.scrollTop = y;
  };

  restore();

  const result = operation();

  restore();

  window.requestAnimationFrame(() => {
    restore();
    window.requestAnimationFrame(restore);
  });

  window.setTimeout(restore, 90);

  return result;
}
```

Adjust to existing style/conventions. The point is **multi-phase restore**, not one rAF only.

### 2. Use it for all Store sheet openings

Opening these panels must be wrapped:

- `openPanel('more')`
- `openPanel('discovery')`
- `openPanel('saved')`
- Store preview open path

Do not wrap only More.

### 3. Focus must not scroll

Every modal focus call must use:

```js
target.focus({ preventScroll: true });
```

If fallback focus is needed, it must also avoid scroll where supported.

Acceptance:

- Opening Store More does not move background page.
- Opening Store Discovery does not move background page.
- Opening Store Preview does not move background page.
- Closing any Store sheet restores previous background position.

---

# Part C — Store Product Preview Open Reliability

## Problem

Manual QA found:

> `/store` → click product card → sometimes preview opens, sometimes browser enters product/detail page.

This is likely a race between semantic fallback anchor navigation and JS preview interception/hydration.

## Required Behavior

- With JS disabled or not loaded: product anchor remains real and navigates to detail page. This preserves HTML fallback and crawlability.
- With JS enabled but not ready: prevent accidental navigation during the brief booting window.
- With JS ready: clicking/tapping the product card opens Store preview consistently.
- Keyboard activation should also open preview when JS is ready.
- Modifier clicks should preserve expected browser behavior if the user intentionally opens a new tab/window.

## Implementation Requirements

### 1. Do not remove semantic anchors

Product cards must keep real `href`s for:

- crawlability;
- fallback;
- SEO;
- accessibility;
- long-press/copy-link behavior.

### 2. Add JS boot/ready state

Use a lightweight state on the document root:

```html
<script>
document.documentElement.setAttribute('data-store-js', 'booting');
</script>
```

or equivalent early in Store boot path.

When Store runtime has attached all preview click/key handlers:

```js
document.documentElement.setAttribute('data-store-js', 'ready');
```

If JS is disabled, no booting attribute should block fallback links.

### 3. Gate product preview interaction only during booting

CSS example:

```css
html[data-store-js='booting'] [data-store-open-preview] {
  pointer-events: none;
}
```

Do not permanently disable anchors.

### 4. Robust click interceptor

When JS is ready, product preview click handler must:

- ignore modified clicks: `metaKey`, `ctrlKey`, `shiftKey`, `altKey`, middle click;
- ignore explicit external CTA links;
- prevent default for standard product card preview clicks;
- open preview consistently;
- preserve anchor href and ARIA semantics.

Pseudo-behavior:

```js
function onStorePreviewTrigger(event) {
  if (event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.button && event.button !== 0) return;
  const trigger = event.target.closest('[data-store-open-preview]');
  if (!trigger) return;

  event.preventDefault();
  openStorePreview(trigger);
}
```

Keyboard:

```js
if ((event.key === 'Enter' || event.key === ' ') && trigger) {
  event.preventDefault();
  openStorePreview(trigger);
}
```

### 5. Ensure event binding happens once

Do not bind duplicate interceptors after rerenders.

Use event delegation on a stable Store container.

Acceptance:

- repeated tapping product cards opens preview reliably;
- no random navigation to detail page when JS is ready;
- direct anchor fallback still works when JS is absent;
- modifier-click can still open link normally.

---

# Part D — Preview Intro / Content Lift Contract

## Visual Target

Use the supplied mockup as the target:

- dominant hero;
- label/title/meta inside hero;
- content surface/card lifted into hero;
- content lift compact, not excessive;
- preview body reads like an app sheet, not a raw webpage;
- root article preview and store product preview share the same frame language;
- Store product content remains product-specific.

## Current Problem

Current `gg-preview__intro` / content-lift is not ideal. Existing tokens may make hero/card relation too tall, too low, or too aggressive.

The previous `aspect-ratio: 4 / 5` direction must be handled carefully. It is a **visual intent**, not an unconstrained height driver.

## Hard Requirements

- `aspect-ratio: 4 / 5` must not make the preview sheet exceed viewport height.
- Do not use panel height tokens as hero height tokens.
- Do not let Store define competing preview frame height locally.
- Root and Store must use one global preview frame.
- Store may have slightly different content lift only through global adapter tokens.
- Preview sheet must scroll vertically and never horizontally.
- Content surface must lift into hero by approximately `48px–88px`, not the old aggressive `108px–148px`.
- Hero/title/meta must remain readable through consistent gradient overlay.
- Root preview and Store preview should feel like the same family, even though one is article and one is product.

## Suggested Token Direction

Use equivalent names if the existing token system differs, but preserve the intent:

```css
:root {
  --gg-preview-panel-max-height: min(94dvh, 920px);

  /* visual intent, not layout ruler */
  --gg-preview-hero-aspect: 4 / 5;

  /* viewport-safe hero */
  --gg-preview-hero-height: clamp(300px, 50dvh, 500px);
  --gg-preview-hero-max-height: calc(var(--gg-preview-panel-max-height) * .62);

  /* compact content lift */
  --gg-preview-content-lift: clamp(56px, 10vw, 88px);
  --gg-preview-store-content-lift: clamp(48px, 9vw, 76px);

  --gg-preview-surface-radius: 28px;
}
```

## Required CSS Direction

Global preview frame should look conceptually like:

```css
.gg-preview__sheet,
.store-preview-sheet .gg-sheet__panel {
  max-height: var(--gg-preview-panel-max-height);
  overflow-y: auto;
  overflow-x: clip;
  max-width: 100dvw;
}

@supports not (overflow-x: clip) {
  .gg-preview__sheet,
  .store-preview-sheet .gg-sheet__panel {
    overflow-x: hidden;
  }
}

.gg-preview__hero,
.store-preview__hero {
  height: min(var(--gg-preview-hero-height), var(--gg-preview-hero-max-height));
  min-height: 0;
  max-height: var(--gg-preview-hero-max-height);
  aspect-ratio: auto;
  overflow: hidden;
}

.gg-preview__media,
.store-preview__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gg-preview__body {
  margin-top: calc(-1 * var(--gg-preview-content-lift));
}

.store-preview__body {
  margin-top: calc(-1 * var(--gg-preview-store-content-lift));
}
```

Do not blindly paste this if existing selectors differ. Rewrite the active global preview frame source.

## Acceptance

- Root preview resembles the supplied mockup frame: hero dominant, intro in hero, content card lifted.
- Store preview resembles the supplied mockup product frame: product title/meta in hero, price/surface lifted compactly.
- Store preview does not exceed viewport in a way that blocks scrolling.
- Store preview scrolls vertically inside the panel.
- Preview sheet has no horizontal scroll.

---

# Part E — Static Guards Without Heavy Browser Automation

The user explicitly does not want Playwright/Puppeteer/Cypress/heavy local runtime automation because of device limitations.

Therefore, update guards as static/source-contract checks only.

## Required Guard Updates

Add/update a script such as:

```txt
qa/store-modal-preview-reliability-guard.mjs
```

and add script:

```json
"gaga:verify-store-modal-preview": "node qa/store-modal-preview-reliability-guard.mjs"
```

Include it in:

```json
"ci:qa"
"ci:cloudflare"
```

## Guard must fail if:

### Store modal scroll lock

- `preservePageScrollDuring` does not exist;
- it restores only once and has no multi-phase restore;
- Store modal open paths do not call it;
- Store background lock does not exist;
- modal-active background is not inert/pointer-disabled;
- Store sheet panel is not exempted from background scroll prevention.

### Store preview reliability

- no `data-store-js="booting"` / `ready` state or equivalent exists;
- `[data-store-open-preview]` is permanently disabled;
- product card anchors lose real `href`;
- click interceptor does not use `preventDefault()` for standard JS-ready preview open;
- click interceptor does not preserve modifier-click behavior.

### Preview frame

- global preview frame contains `overflow: auto` on preview panel;
- preview panel lacks `overflow-x: clip` or fallback hidden;
- Store preview hero uses panel height tokens;
- Store local CSS defines competing preview frame height outside global preview source;
- `aspect-ratio: 4 / 5` is used as unconstrained height driver on hero;
- content lift still uses old aggressive range like `108px–148px`.

### Regression protection

- outline width token remains untouched;
- no `100vw - 12px` / stale width token returns;
- no handle `62px` stale token returns;
- no Playwright/Puppeteer/Cypress dependency is added.

---

# Part F — Manual QA Required

Manual QA is required because no heavy browser automation is allowed.

Do not report this task as completed with all manual QA items as `NOT RUN`.

## Required Manual QA Matrix

Run manually on live/staging or a faithful browser environment:

### Store scroll lock

- `/store` → scroll to middle → open More → background does not scroll.
- Close More → page remains at same position.
- `/store` → scroll to middle → open Discovery → background does not scroll.
- Close Discovery → page remains at same position.
- `/store` → scroll to middle → open Preview → background does not scroll.
- Close Preview → page remains at same position.

### Store preview reliability

- Tap/click product card 10 times across different products.
- Expected: preview opens consistently.
- No unexpected navigation to product detail when JS is ready.
- Modifier-click/open-new-tab behavior is preserved where applicable.

### Preview frame

- Open Root preview.
- Confirm no horizontal scroll.
- Confirm hero/content-lift resembles supplied mockup.
- Open Store preview.
- Confirm vertical scroll works.
- Confirm no horizontal scroll.
- Confirm preview does not trap content below viewport without scroll.
- Confirm hero/content-lift resembles supplied mockup.

### Regression

- Check outline width still correct.
- Check light/dark still acceptable.
- Check Store More/Discovery still visually aligned.
- Check root/landing unaffected.

Manual QA output must include:

```txt
Store More scroll lock: PASS/FAIL
Store Discovery scroll lock: PASS/FAIL
Store Preview scroll lock: PASS/FAIL
Store preview click reliability: PASS/FAIL
Root preview frame/lift: PASS/FAIL
Store preview frame/lift: PASS/FAIL
Root/Store horizontal overflow absent: PASS/FAIL
Light/Dark regression: PASS/FAIL
Notes:
```

If a manual item is not run, say **NOT RUN** honestly, but then do not mark the task as fully completed.

---

# Part G — Build / QA / CI Requirements

Run:

```bash
npm run build
npm run store:check:ci
npm run store:check:dev10
npm run gaga:verify-preview-sheet
npm run gaga:verify-sheet-contract
npm run gaga:verify-shell
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-component-source
npm run gaga:verify-sheet-core-source
npm run gaga:verify-visual-system
npm run gaga:verify-sheet-runtime-overflow
npm run gaga:verify-store-modal-preview
npm run ci:qa
npm run ci:cloudflare
git diff --check
npm run deploy:cloudflare:dry
```

Known acceptable local environment failure:

- `deploy:cloudflare:dry` may fail only at local Wrangler/esbuild startup with `_SecTrustCopyCertificateChain`.
- Build/preflight/prepare must complete before that failure.
- Any source/contract/build failure is not acceptable.

---

# Final Report Format

The implementer must report:

```txt
TASK-STORE-MODAL-SCROLLLOCK-PREVIEW-RELIABILITY completed.

Changed:
- Store modal background scroll lock hardened: YES/NO
- Store More/Discovery/Saved/Preview page-scroll preservation hardened: YES/NO
- Store product preview open reliability fixed: YES/NO
- JS-ready preview interaction gate added without breaking fallback anchors: YES/NO
- Global preview intro/content-lift refined to supplied mockup: YES/NO
- Root/Store preview frame still global single source: YES/NO
- Store-local competing preview frame removed: YES/NO
- Preview horizontal overflow remains removed: YES/NO
- Store preview vertical scroll preserved: YES/NO
- Guards added/updated without Playwright/Puppeteer/Cypress: YES/NO
- No override-only CSS/JS added: YES/NO
- Cloudflare deploy behavior preserved: YES/NO

Proof:
- npm run build: PASS/FAIL
- npm run store:check:ci: PASS/FAIL
- npm run store:check:dev10: PASS/FAIL
- npm run gaga:verify-preview-sheet: PASS/FAIL
- npm run gaga:verify-sheet-contract: PASS/FAIL
- npm run gaga:verify-shell: PASS/FAIL
- npm run gaga:verify-sheet-lifecycle: PASS/FAIL
- npm run gaga:verify-component-source: PASS/FAIL
- npm run gaga:verify-sheet-core-source: PASS/FAIL
- npm run gaga:verify-visual-system: PASS/FAIL
- npm run gaga:verify-sheet-runtime-overflow: PASS/FAIL
- npm run gaga:verify-store-modal-preview: PASS/FAIL
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
- npm run deploy:cloudflare:dry: PASS/FAIL/ENVIRONMENT FAILURE

Manual QA:
- Store More scroll lock: PASS/FAIL/NOT RUN
- Store Discovery scroll lock: PASS/FAIL/NOT RUN
- Store Preview scroll lock: PASS/FAIL/NOT RUN
- Store preview click reliability: PASS/FAIL/NOT RUN
- Root preview frame/lift: PASS/FAIL/NOT RUN
- Store preview frame/lift: PASS/FAIL/NOT RUN
- Root/Store horizontal overflow absent: PASS/FAIL/NOT RUN
- Light/Dark regression: PASS/FAIL/NOT RUN

Notes:
- ...
```

---

## Acceptance Summary

This task is complete only when:

- Store background cannot scroll while any modal sheet is active.
- Opening Store sheets does not shift the page.
- Store preview opens reliably when JS is ready.
- Semantic fallback anchors remain valid.
- Root and Store preview intro/content lift visually follow the supplied mockup.
- Store preview scrolls vertically and never horizontally.
- Guards pass.
- Manual QA is not skipped.
- No override-only patching is introduced.
