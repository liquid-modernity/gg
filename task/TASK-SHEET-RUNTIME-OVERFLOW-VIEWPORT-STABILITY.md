# TASK-SHEET-RUNTIME-OVERFLOW-VIEWPORT-STABILITY

## Status
Ready for implementation.

## Priority
High. This task must be completed before adding new surfaces, new sheet features, new store UX, or new discovery/comment enhancements.

## Strategic Objective
Stabilize sheet runtime behavior, overflow safety, viewport confinement, and dock-attached outline geometry across `/`, `/landing`, and `/store` without using local runtime browser automation such as Playwright. The implementation must advance the original target architecture:

- HTML fallback and semantic HTML remain intact.
- Registry-driven behavior and centralized controller logic remain intact.
- JSON-LD/schema/SEO/GEO/AI discoverability must not regress.
- Accessibility, mobile-first layout, native-app feel, and stable sheet behavior must improve.
- Global sheet contract + surface-aware adapters must remain the model.
- Global CSS/source-of-truth must be preserved.
- No override-only patching, no dead CSS/JS/HTML, no stale generated artifacts.
- CI/QA/Cloudflare deploy chain must remain green, except the known local Wrangler/esbuild macOS environment failure.

## Hard Constraint — Rewrite, Not Override/Patch
This task must be implemented as a source-level rewrite/refactor. Do not solve by adding stronger selectors below old selectors.

### Forbidden
- Do not add `!important` to overpower old layout rules.
- Do not append late CSS blocks that merely mask existing preview/store/outline bugs.
- Do not leave local Store preview frame rules competing with global preview frame rules.
- Do not leave `overflow: auto` on preview panel/sheet where it creates horizontal scroll.
- Do not leave hardcoded outline widths such as `calc(100% - 66px)`, `540px`, or one-off Store/root/landing variants.
- Do not introduce Playwright, Puppeteer, Selenium, Cypress, or any heavy local runtime browser automation.
- Do not create separate root/landing/store fixes when a global token/contract is the correct source.
- Do not edit generated files manually unless the repository convention explicitly makes them source. Prefer fixing source and rebuilding.
- Do not bloat CSS with alias compatibility for obsolete source paths unless it is clearly temporary, documented, and guarded for removal.

### Required
- Replace stale logic at its source.
- Remove or neutralize obsolete Store-local preview frame rules after global preview frame is installed.
- Keep Root and Store preview using the same global preview frame contract, with only content adapters differing.
- Keep Store Discovery content-specific, but not shell-specific unless explicitly justified.
- Tokenize outline width globally using the user-approved target: `min(calc(100% - 70px), 545px)`.
- Keep CI and Cloudflare deploy scripts compatible.
- Strengthen static guards so the same class of bug cannot pass again.

---

## User-Confirmed Constraints

### No heavy local runtime browser tests
Do not add or require Playwright or similar tools. The user device cannot handle that workflow.

Allowed alternatives:
- static guards using Node scripts;
- DOM/string/source contract checks;
- lightweight shell checks;
- optional manual browser QA instructions;
- browser DevTools snippets that the user can paste manually;
- existing npm scripts that do not require heavy browser automation.

### Outline width target
The dock-attached outline ideal width is:

```css
min(calc(100% - 70px), 545px)
```

But this must be tokenized globally. Do not hardcode this separately across Root, Landing, and Store.

Suggested token contract:

```css
:root {
  --gg-outline-viewport-gap: 70px;
  --gg-outline-max-width: 545px;
  --gg-attached-outline-width: min(calc(100% - var(--gg-outline-viewport-gap)), var(--gg-outline-max-width));
}
```

Then consume:

```css
.gg-detail-outline,
.store-filter-outline,
[data-gg-attached-outline] {
  width: var(--gg-attached-outline-width);
}
```

Use a better token name if the project already has a naming convention, but keep the math and global nature.

---

## Confirmed Bugs to Fix

### 1. Store: opening More causes the Store page to auto-scroll toward the middle
Observed behavior: clicking/opening the Store More sheet unexpectedly changes the main Store page scroll position.

Expected behavior:
- Opening any modal sheet must not shift the main document scroll position.
- Store page scroll must remain exactly where it was before opening More/Discovery/Saved/Preview.
- Focus must use `preventScroll` where applicable.
- Scroll lock must not trigger layout/focus side effects that move the main document.

Implementation requirements:
- Add a lightweight scroll preservation helper in the centralized sheet/open path or Store sheet adapter.
- Snapshot `window.scrollX` and `window.scrollY` immediately before opening any Store modal sheet.
- Apply scroll lock and focus behavior.
- Restore scroll position in the next animation frame if the document moved.
- Avoid affecting internal sheet scroll containers.
- Do not use Playwright or runtime automation.

Suggested helper shape:

```js
function preservePageScrollDuring(fn) {
  var x = window.scrollX || window.pageXOffset || 0;
  var y = window.scrollY || window.pageYOffset || 0;
  fn();
  requestAnimationFrame(function () {
    if ((window.scrollX || 0) !== x || (window.scrollY || 0) !== y) {
      window.scrollTo(x, y);
    }
  });
}
```

Integrate cleanly with the existing controller/adapter. Do not create multiple one-off helpers if a global sheet controller already exists.

Static guard expectation:
- Guard must verify Store sheet open path uses page-scroll preservation or a project-approved equivalent.
- Guard must not depend on Playwright.

Manual QA:
- On `/store`, scroll near the top, middle, and lower page.
- Open More.
- Close More.
- Confirm the underlying page remains at the same scroll position.
- Repeat for Store Discovery/Saved/Preview if those open as modal sheets.

---

### 2. Store preview sheet height exceeds viewport and cannot scroll correctly
Observed behavior: Store preview sheet height exceeds viewport, and the content cannot scroll properly.

Likely cause:
- Store preview still has Store-local preview frame rules competing with or overriding global preview frame.
- Store preview hero may be using panel-height tokens such as `--gg-preview-panel-initial-height` instead of hero-height tokens.

Expected behavior:
- Root and Store preview must use the same global preview frame contract.
- Store preview panel must be confined to viewport height.
- Store preview content must scroll vertically when content exceeds available height.
- Store preview must not horizontally scroll.
- Product-specific content may differ, but frame, panel height, overflow, footer affordance, hero/body scroll model must be global.

Implementation requirements:
- Audit and remove Store-local preview frame overrides that duplicate global frame behavior.
- Store preview hero must not use panel-height tokens.
- Store preview panel must use global panel max-height and initial-height tokens.
- Store preview body/surface must be scroll-compatible within the panel.
- Keep product card/content adapter separate from frame contract.

Forbidden stale patterns:

```css
.store-preview__hero {
  min-height: var(--gg-preview-panel-initial-height);
  max-height: var(--gg-preview-panel-max-height);
}
```

```css
.store-preview-sheet .gg-sheet__panel {
  /* long local frame definition that duplicates global preview frame */
}
```

Acceptable direction:

```css
.gg-preview__sheet,
.store-preview-sheet .gg-sheet__panel {
  max-height: var(--gg-preview-panel-max-height);
  min-height: var(--gg-preview-panel-initial-height);
  overflow-y: auto;
  overflow-x: clip;
}

.gg-preview__hero,
.store-preview__hero {
  min-height: var(--gg-preview-hero-height);
  max-height: var(--gg-preview-hero-max-height, none);
}
```

Use existing project tokens if already defined. The important rule is: panel height tokens belong to panel, hero height tokens belong to hero.

---

### 3. Root and Store preview sheet can horizontally scroll
Observed behavior: preview sheet allows horizontal scroll.

Expected behavior:
- No sheet panel should horizontally scroll.
- Preview panels must allow vertical scrolling only.
- Internal horizontal components such as product carousel may scroll horizontally if intentionally designed.

Implementation requirements:
- Replace preview panel/sheet `overflow: auto` with directional overflow.
- Use `overflow-y: auto` and `overflow-x: clip` where supported.
- Provide fallback to `overflow-x: hidden` for browsers without `clip` support.
- Ensure child elements do not exceed `max-width: 100%` / `100dvw`.
- Audit root preview, store preview, preview body, hero media, footer affordance, carousel, CTA rows, price/action rows.

Suggested CSS:

```css
.gg-preview__sheet,
.store-preview-sheet .gg-sheet__panel {
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
```

Guard must fail if active preview frame source contains:

```css
overflow: auto;
```

on preview sheet/panel selectors.

---

### 4. Root/Landing/Store attached outline width must be globally tokenized
Observed behavior: outline attached to dock has visible gap/continuity issue and uses non-global sizing.

Expected behavior:
- Root, Landing, and Store attached outlines use one global token contract.
- The approved visual width is `min(calc(100% - 70px), 545px)`.
- The outline should look attached to the dock without awkward visual disconnection.
- Do not use surface-specific hardcoded widths.

Implementation requirements:
- Add global tokens:

```css
:root {
  --gg-outline-viewport-gap: 70px;
  --gg-outline-max-width: 545px;
  --gg-attached-outline-width: min(calc(100% - var(--gg-outline-viewport-gap)), var(--gg-outline-max-width));
}
```

- Apply the token to root detail outline, landing outline if present, and store filter outline.
- Remove old hardcoded outline width rules.
- If root/landing/store use different outline class names, normalize them via a shared selector or shared component block.

Forbidden stale patterns:

```css
width: min(calc(100% - 66px), var(--gg-detail-outline-width));
width: min(calc(100% - 66px), 540px);
width: min(calc(100% - 70px), 545px); /* if repeated directly instead of tokenized */
```

Accept only tokenized direct usage:

```css
width: var(--gg-attached-outline-width);
```

---

## Additional Cleanup Required

### A. Remove or archive stale preview source files if inactive
Audit files such as:

```txt
src/css/modules/preview.css
```

If the file is no longer part of the active source/build path, move it to archive/deprecated docs or remove it. Do not leave active-looking stale source that contradicts `src/css/components/gg-preview-frame.css`.

If the file is still active, migrate it to consume the global preview frame contract and remove duplicate/contradictory preview rules.

Acceptance:
- There must be only one active preview frame source-of-truth.
- Store-specific product preview content styles may remain, but not duplicate panel/viewport/overflow frame rules.

### B. Strengthen static overflow guards without Playwright
Add or update a Node-based guard, for example:

```txt
qa/sheet-runtime-overflow-viewport-guard.mjs
```

This guard must be static/source-based and must not launch browsers.

Guard must check:
- Store open panel path has page-scroll preservation or an approved equivalent.
- Active preview frame does not use `overflow: auto` on sheet/panel containers.
- Preview sheet/panel has `overflow-y: auto` and `overflow-x: clip` or fallback.
- Store preview hero does not use panel initial/max height tokens.
- Store preview frame is not locally redefined outside global preview frame source.
- Attached outline width uses `--gg-attached-outline-width`.
- No active source keeps `calc(100% - 66px)` or hardcoded `540px` outline width.
- No active source repeats `min(calc(100% - 70px), 545px)` outside token definition.
- Store critical CSS and inline `store.html` do not reintroduce stale width/handle/preview tokens.

Add script to `package.json`:

```json
{
  "gaga:verify-sheet-runtime-overflow": "node qa/sheet-runtime-overflow-viewport-guard.mjs"
}
```

Include it in:

```txt
ci:qa
ci:cloudflare indirectly via ci:qa
```

---

## Files/Areas to Inspect
The implementation agent must inspect and update only as needed:

```txt
src/css/components/gg-preview-frame.css
src/css/components/gg-sheet-core.css
src/css/components/gg-sheet-modal.css
src/css/components/gg-discovery-sheet.css
src/css/components/gg-more-sheet.css
src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css
src/css/modules/preview.css
index.xml
landing.html
src/store/store.css
src/store/store.critical.css
assets/store/store.css
store.html
src/store/store-discovery.js
qa/visual-system-contract-guard.mjs
qa/component-source-contract-guard.mjs
qa/sheet-lifecycle-contract-guard.mjs
qa/sheet-runtime-overflow-viewport-guard.mjs
package.json
tools/sync-shared-css-components.mjs
tools/build-store-static.mjs
.github/workflows/*.yml if present in repository
wrangler.jsonc
```

Do not edit unrelated feature code.

---

## Required QA / Proof

### Required commands
Run and report:

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
npm run ci:qa
npm run ci:cloudflare
git diff --check
npm run deploy:cloudflare:dry
```

Known acceptable local failure:
- `npm run deploy:cloudflare:dry` may fail only at local Wrangler/esbuild startup with `_SecTrustCopyCertificateChain` on the user's old macOS environment, after build/preflight/prepare completed.
- Any source/guard/build failure is not acceptable.

### No Playwright requirement
Do not add Playwright-based QA. Do not require the user to run Playwright.

### Manual QA checklist
Manual QA may be documented, but the implementation must not depend on heavy automation.

Required manual checks:

```txt
Store More:
- Scroll /store page near top, middle, and lower area.
- Open More.
- Confirm underlying page does not jump/auto-scroll.
- Close More.
- Confirm page scroll position remains unchanged.

Store Preview:
- Open product preview.
- Confirm panel does not exceed viewport uncontrollably.
- Confirm preview content scrolls vertically.
- Confirm no horizontal sheet scroll.
- Confirm carousel/dots still work if present.

Root Preview:
- Open article preview.
- Confirm no horizontal sheet scroll.
- Confirm vertical scroll still works.

Attached Outline:
- Root, Landing, and Store outlines use the same visual width.
- Confirm no awkward gap/terputus effect relative to dock.

Light/Dark:
- Confirm fixes do not regress both light and dark modes.
```

---

## Acceptance Criteria

This task is complete only if all are true:

- Opening Store More does not shift Store page scroll position.
- Opening any Store modal sheet does not shift Store page scroll position unless explicitly intended.
- Store preview sheet is viewport-confined and vertically scrollable.
- Store preview hero uses hero height tokens, not panel height tokens.
- Root and Store preview sheets cannot horizontally scroll.
- Internal carousel may scroll horizontally only if intentionally scoped.
- Active preview frame source has no `overflow: auto` on sheet/panel selectors.
- Root/Landing/Store attached outlines use global `--gg-attached-outline-width` token.
- The global outline token implements `min(calc(100% - 70px), 545px)` through variables.
- No active source keeps old outline hardcodes such as `calc(100% - 66px)` or `540px`.
- Store critical CSS and `store.html` inline critical CSS are reconciled.
- There is only one active preview frame source-of-truth.
- No Playwright or similar local runtime automation is added.
- New guard `gaga:verify-sheet-runtime-overflow` passes and is included in `ci:qa`.
- Existing CI/QA scripts remain green, except the known local Wrangler/esbuild environment failure.
- Implementation is rewrite/refactor, not override patch.

---

## Final Report Template
The implementer must report exactly:

```txt
TASK-SHEET-RUNTIME-OVERFLOW-VIEWPORT-STABILITY completed.

Changed:
- Store modal page-scroll preservation implemented: YES/NO
- Store More no longer shifts page scroll: YES/NO
- Store preview viewport confinement fixed: YES/NO
- Store preview vertical scrolling fixed: YES/NO
- Root preview horizontal overflow removed: YES/NO
- Store preview horizontal overflow removed: YES/NO
- Global preview frame source preserved as single active source: YES/NO
- Store-local preview frame overrides removed: YES/NO
- Attached outline width tokenized globally: YES/NO
- Root/Landing/Store outline width aligned: YES/NO
- Store critical CSS reconciled: YES/NO
- store.html inline critical CSS rebuilt/reconciled: YES/NO
- Runtime overflow/static guard added: YES/NO
- No Playwright or heavy browser automation added: YES/NO
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
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
- npm run deploy:cloudflare:dry: PASS/FAIL/ENVIRONMENT FAILURE

Manual QA:
- Store More scroll preservation: PASS/FAIL/NOT RUN
- Store Preview viewport confinement: PASS/FAIL/NOT RUN
- Store Preview vertical scroll: PASS/FAIL/NOT RUN
- Store Preview horizontal overflow absent: PASS/FAIL/NOT RUN
- Root Preview horizontal overflow absent: PASS/FAIL/NOT RUN
- Attached outline width Root/Landing/Store: PASS/FAIL/NOT RUN
- Light/Dark no regression: PASS/FAIL/NOT RUN

Notes:
- ...
```
