# TASK-PREVIEW-001 — Unify Article and Store Preview Sheet Contract and Scroll Lifecycle

## Status

Development stabilization task.

Run this after:

- TASK-STORE-ISOLATION-001
- TASK-STORE-ISOLATION-JS-001
- TASK-DISCOVERY-002
- TASK-DISCOVERY-003
- TASK-THEME-001
- TASK-SHELL-001
- TASK-SHELL-002
- TASK-CI-CD-001

## Strategic Purpose

More, Search, and Discovery sheets are now mostly stable across `/`, `/landing`, and `/store`.

The remaining mismatch is the **Preview Sheet**:

```txt
/      = Article Preview
/store = Product Preview

Both preview sheets are allowed to have context-aware content, but their shell behavior, visual rhythm, drag affordance, footer handler, focus behavior, and scroll lifecycle must become consistent.

Current problem examples:

- / article preview does not fully follow /store preview flow.
- / gg-preview__intro does not scroll naturally with preview body.
- /store preview does not fully mirror sticky global footer/handler affordance.
- Preview scroll position is remembered after close/open.
- If user closes preview at footer, reopening starts at footer instead of top.

This task must unify Preview Sheet behavior without redesigning the content model.

Non-Negotiables
Do not touch Blog1 detail rendering.
Do not touch Blogger native comments plumbing.
Do not change threaded comments behavior.
Do not change Discovery taxonomy.
Do not change Store isolation.
Do not change Theme Light/Dark contract.
Do not change dock order.
Do not change More sheet IA.
Do not change Store product data model.
Do not hardblock post titles, URLs, or slugs.
Do not weaken existing QA guards.
Do not introduce Playwright.
Do not add heavy dependencies.
Required Outcome

Article Preview on / and Product Preview on /store must share one preview content-sheet contract:

- top content sheet
- global data-gg-panel="preview"
- global data-gg-edge="top"
- global data-gg-panel-family="content-sheet"
- shared drag-to-close behavior
- shared sticky footer affordance
- shared handle contract
- shared focus trap
- shared Escape close
- shared focus restore
- shared scroll lifecycle reset
- context-specific content remains different

Article preview remains article/editorial.

Product preview remains product/commerce.

Only the shell contract must be unified.

1. Shared Preview Sheet Markup Contract

Both root and store preview sheets must expose:

data-gg-panel="preview"
data-gg-panel-family="content-sheet"
data-gg-edge="top"
data-gg-state="closed"
aria-hidden="true"
inert
hidden

Preferred base structure:

<div
  class="gg-content-sheet gg-preview"
  data-gg-panel="preview"
  data-gg-panel-family="content-sheet"
  data-gg-edge="top"
  data-gg-state="closed"
  aria-hidden="true"
  inert
  hidden>

  <button
    class="gg-content-sheet__scrim"
    type="button"
    data-gg-close="preview"
    aria-label="Close preview">
  </button>

  <section
    class="gg-content-sheet__panel"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    data-gg-preview-panel>

    <div class="gg-preview__hero">
      ...
    </div>

    <div class="gg-content-sheet__body gg-preview__body" data-gg-scroll-container>
      ...
    </div>

    <footer class="gg-content-sheet__affordance gg-preview__footer">
      <button
        class="gg-sheet__handle gg-preview__handle"
        type="button"
        data-gg-drag-handle="preview"
        data-gg-close="preview"
        aria-label="Drag to close preview">
      </button>
    </footer>
  </section>
</div>

Store-specific preview sheets may keep existing classes such as:

store-preview
store-preview__hero
store-preview__surface
store-bottom-sheet
store-preview__handle

But they must also expose compatible data-gg-* attributes.

2. Root Article Preview Requirements

Root / article preview must be adapted so that gg-preview__intro participates in the scroll/body flow.

Current issue:

gg-preview__intro is too hero-bound and does not behave like a natural scrolling preview header.

Required direction:

<div class="gg-preview__hero">
  <div class="gg-preview__media"></div>
  <div class="gg-preview__shade"></div>
</div>

<div class="gg-content-sheet__body gg-preview__body" data-gg-scroll-container>
  <header class="gg-preview__intro" data-gg-preview-intro-flow="true">
    <p class="gg-preview__eyebrow"></p>
    <h2 class="gg-preview__title"></h2>
    <div class="gg-preview__meta"></div>
  </header>

  <div class="gg-preview__surface">
    ...
  </div>
</div>

Required behavior:

- preview title/meta starts near hero area;
- intro visually remains premium/editorial;
- intro scrolls naturally with preview body;
- article summary, taxonomy, TOC, and CTA remain article-specific;
- sticky footer handler remains visible/reachable;
- CTA remains reachable;
- article preview still feels like a top content sheet.

Do not convert article preview into store product preview. Only unify the shell behavior.

3. Store Product Preview Requirements

Store /store product preview must mirror the global preview affordance.

Required footer pattern:

<footer class="gg-content-sheet__affordance store-preview__footer">
  <button
    class="gg-sheet__handle store-preview__handle"
    type="button"
    data-gg-drag-handle="preview"
    data-gg-close="preview"
    data-store-drag-handle="preview"
    data-store-close="preview"
    aria-label="Drag to close preview">
  </button>
</footer>

Store may retain:

- product image carousel
- dots
- price
- badges
- marketplace buttons
- save button
- copy button
- product notes
- product caveat
- store-specific metadata

But shell behavior must match article preview:

- same top preview behavior
- same sticky footer affordance
- same drag handle contract
- same close contract
- same scroll reset lifecycle
- same focus trap behavior
- same Escape close behavior
4. Required Scroll Lifecycle Contract

Preview sheets must reset scroll state whenever they are:

- opened;
- closed;
- reopened;
- populated with a new item;
- closed by drag;
- closed by Escape;
- closed by scrim/backdrop;
- closed by API/controller.

Required behavior:

open preview item A -> scroll starts at top
scroll to footer -> close preview
open preview item A again -> scroll starts at top
open preview item B -> scroll starts at top
drag close from footer -> next open starts at top
Escape close from footer -> next open starts at top
marketplace/footer area does not become the remembered open position

The reset must target actual sheet scroll containers, not only window.

Potential containers:

.gg-preview
.gg-preview__body
.gg-preview__surface
.gg-content-sheet__body
.gg-content-sheet__panel
.store-preview
.store-preview__body
.store-preview__surface
.store-preview__content
.store-bottom-sheet__body
[data-gg-scroll-container]
[role="dialog"]

Use a shared helper.

Suggested helper:

function resetSheetScroll(sheet, reason) {
  if (!sheet) return;

  const containers = [
    sheet,
    sheet.querySelector('.gg-content-sheet__panel'),
    sheet.querySelector('.gg-content-sheet__body'),
    sheet.querySelector('.gg-preview__body'),
    sheet.querySelector('.gg-preview__surface'),
    sheet.querySelector('.store-preview__body'),
    sheet.querySelector('.store-preview__surface'),
    sheet.querySelector('.store-preview__content'),
    sheet.querySelector('.store-bottom-sheet__body'),
    sheet.querySelector('[data-gg-scroll-container]')
  ].filter(Boolean);

  containers.forEach((node) => {
    if (!node || typeof node.scrollTo !== 'function') return;
    node.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (sheet.dataset) {
    sheet.dataset.ggLastScrollResetReason = reason || 'unknown';
  }
}

Call it:

before opening preview
after preview content is injected
after preview content is rendered
on item switch
on close
after drag-close completes
after Escape close completes
after scrim close completes

Use requestAnimationFrame after dynamic content injection:

resetSheetScroll(sheet, 'open-before-render');

requestAnimationFrame(() => {
  resetSheetScroll(sheet, 'open-after-render');
});

Do not use smooth scroll for lifecycle reset.

behavior: 'auto'
5. Shared Gesture Contract

Both article and store preview must support:

- drag down only
- small drag snaps back
- drag above threshold closes
- pointercancel cleans state
- transform resets after close/open
- drag does not leave sheet stuck
- drag does not break internal scroll
- reduced motion respected

Use shared variable:

--gg-sheet-drag-y

or compatible preview alias:

--gg-preview-drag-y: var(--gg-sheet-drag-y);

Both preview handles must use:

data-gg-drag-handle="preview"

Store may also keep:

data-store-drag-handle="preview"
6. Shared Close Contract

Both preview sheets must support:

- handle close
- drag close
- Escape close
- scrim/backdrop close where applicable
- API/controller close

Both preview handles or close controls must expose:

data-gg-close="preview"

Store may also keep:

data-store-close="preview"
7. Shared Focus Contract

Both preview sheets must:

- focus first meaningful control or panel on open;
- trap Tab / Shift+Tab inside preview while open;
- close on Escape;
- restore focus to original trigger after close;
- not leave background controls focusable while modal is open;
- not create duplicate focus listeners;
- not break comments focus behavior.

Use inert where safe.

8. Shared CSS Contract

Add or align shared preview tokens:

--gg-preview-max-height
--gg-preview-initial-height
--gg-preview-hero-min
--gg-preview-overlay-lift
--gg-preview-footer-height
--gg-preview-footer-safe-area
--gg-preview-radius
--gg-preview-surface
--gg-preview-shadow

Root and Store preview should share:

- panel width rhythm
- top-sheet height rhythm
- hero/media rhythm
- body scroll rhythm
- sticky footer affordance
- handle sizing
- drag affordance
- background/surface rhythm
- light/dark theme compatibility

Store aliases are allowed:

--store-preview-hero-min: var(--gg-preview-hero-min);
--store-preview-footer-height: var(--gg-preview-footer-height);
9. Required Runtime Snapshot Fields

Extend:

GG.sheetController.snapshot()
StoreDiscovery.sheetController.snapshot()

Include preview fields:

{
  previewSheetPresent: true,
  previewOpen: false,
  previewEdge: "top",
  previewFamily: "content-sheet",
  previewDragHandleCount: 1,
  previewCloseHandleCount: 1,
  previewFooterAffordance: true,
  previewIntroInScrollFlow: true,
  previewScrollResetEnabled: true,
  previewScrollTop: 0,
  previewBodyScrollTop: 0,
  previewLastResetReason: "open" | "close" | "item-change" | "drag-close" | "escape" | "scrim" | null
}

For Store:

{
  storePreviewSheetPresent: true,
  storePreviewOpen: false,
  storePreviewGgDragHandleCount: 1,
  storePreviewStoreDragHandleCount: 1,
  storePreviewFooterAffordance: true,
  storePreviewScrollResetEnabled: true,
  storePreviewLastResetReason: "open" | "close" | "item-change" | "drag-close" | "escape" | "scrim" | null
}
10. Required QA Guard

Add or update:

qa/preview-sheet-contract-guard.mjs

or extend:

qa/shell-interaction-guard.mjs

The guard must fail if:

- root preview lacks data-gg-panel="preview";
- store preview lacks data-gg-panel="preview";
- root preview lacks data-gg-edge="top";
- store preview lacks data-gg-edge="top";
- root preview lacks data-gg-panel-family="content-sheet";
- store preview lacks data-gg-panel-family="content-sheet";
- root preview handle lacks data-gg-drag-handle="preview";
- store preview handle lacks data-gg-drag-handle="preview";
- store preview has data-store-drag-handle but no mirrored data-gg-drag-handle;
- root preview handle lacks data-gg-close="preview";
- store preview handle lacks data-gg-close="preview";
- store preview footer lacks gg-content-sheet__affordance;
- store preview handle lacks gg-sheet__handle;
- root preview gg-preview__intro remains hero-only without body flow marker;
- preview scroll reset helper is missing;
- preview open path does not reset scroll;
- preview close path does not reset scroll;
- preview item switch path does not reset scroll;
- scroll reset only targets window and not sheet/body containers;
- preview focus trap contract disappears;
- preview Escape close contract disappears;
- comments proof is weakened.

Add script if needed:

{
  "gaga:verify-preview-sheet": "node qa/preview-sheet-contract-guard.mjs"
}

If added, wire into:

ci:qa
ci:cloudflare
11. Required Manual QA

Test / article preview:

1. open article preview;
2. confirm intro/title/meta appear correctly;
3. scroll to footer;
4. close preview;
5. reopen same preview;
6. preview must start from top;
7. open another article preview;
8. preview must start from top;
9. small drag snaps back;
10. longer drag closes;
11. Escape closes;
12. focus returns to trigger;
13. CTA remains reachable.

Test /store product preview:

1. open product preview;
2. confirm carousel/image/content works;
3. scroll to marketplace/footer;
4. close preview;
5. reopen same product;
6. preview must start from top;
7. open another product;
8. preview must start from top;
9. small drag snaps back;
10. longer drag closes;
11. Escape closes;
12. focus returns to trigger;
13. Save/Copy/marketplace buttons still work.

Test comments unaffected:

1. open post detail;
2. open comments;
3. open replies;
4. confirm native composer still works;
5. confirm no preview changes broke comments sheet.
12. Required Console Debug Snippets
Root /
GG.sheetController.snapshot()

Expected preview fields:

previewSheetPresent: true
previewEdge: "top"
previewFamily: "content-sheet"
previewFooterAffordance: true
previewScrollResetEnabled: true
Store /store
StoreDiscovery.sheetController.snapshot()

Expected preview fields:

storePreviewSheetPresent: true
storePreviewFooterAffordance: true
storePreviewScrollResetEnabled: true
storePreviewGgDragHandleCount > 0
Scroll reset test

After opening preview, scrolling down, closing, and reopening:

(() => {
  const sheet =
    document.querySelector('[data-gg-panel="preview"]') ||
    document.querySelector('.store-preview') ||
    document.querySelector('.gg-preview');

  const containers = [...sheet.querySelectorAll('[data-gg-scroll-container], .gg-content-sheet__body, .gg-preview__body, .store-preview__body, .store-preview__content')];

  return containers.map((node) => ({
    className: node.className,
    scrollTop: node.scrollTop
  }));
})();

Expected after reopen:

scrollTop: 0

or very near 0.

13. Required Commands

Run:

git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run store:build
npm run store:proof
npm run ci:cloudflare
npm run gaga:verify-worker-live:strict

If added:

npm run gaga:verify-preview-sheet

Also run syntax checks:

node --check src/js/gg-app.source.js
node --check src/store/store-discovery.js
node --check qa/preview-sheet-contract-guard.mjs
14. Acceptance Criteria

Accepted only if:

- / article preview and /store product preview share preview sheet shell contract;
- both previews expose data-gg-panel="preview";
- both previews expose data-gg-edge="top";
- both previews expose data-gg-panel-family="content-sheet";
- both previews use data-gg-drag-handle="preview";
- both previews use data-gg-close="preview";
- store preview mirrors data-store-* with data-gg-*;
- / preview intro scrolls naturally with body;
- /store preview has sticky global footer affordance;
- both preview sheets reset scroll on open;
- both preview sheets reset scroll on close;
- both preview sheets reset scroll when item changes;
- both preview sheets support drag close;
- both preview sheets support Escape close;
- both preview sheets support focus trap and focus restore;
- article/product content remains context-aware;
- comments proof remains PASS;
- Store isolation remains PASS;
- Theme remains Light/Dark;
- Discovery filters remain unchanged;
- live smoke is PASS or PASS_WITH_WARNINGS only;
- no CONTRACT_FAILURE.
15. Required Final Report
TASK-PREVIEW-001 completed.

Changed:
- Root article preview shell unified: YES/NO
- Store product preview shell unified: YES/NO
- Root preview intro moved/adapted into scroll flow: YES/NO
- Store preview sticky footer affordance added: YES/NO
- data-gg-panel="preview" unified: YES/NO
- data-gg-edge="top" unified: YES/NO
- data-gg-panel-family="content-sheet" unified: YES/NO
- data-gg-drag-handle="preview" unified: YES/NO
- data-gg-close="preview" unified: YES/NO
- Preview scroll reset on open: YES/NO
- Preview scroll reset on close: YES/NO
- Preview scroll reset on item change: YES/NO
- Runtime preview snapshot fields added: YES/NO
- Preview QA guard added/updated: YES/NO
- Blog1 detail changed: NO
- threaded comments changed: NO
- Discovery taxonomy changed: NO
- Store isolation changed: NO
- Theme contract changed: NO

Verification:
- git diff --check: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run gaga:verify-discovery-filters: PASS/FAIL
- npm run gaga:verify-store-isolation: PASS/FAIL
- npm run gaga:verify-theme: PASS/FAIL
- npm run gaga:verify-shell: PASS/FAIL
- npm run gaga:verify-preview-sheet: PASS/FAIL/NOT ADDED
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run gaga:verify-worker-live:strict: PASS/PASS_WITH_WARNINGS/FAIL

Manual QA:
- / article preview opens/closes: PASS/FAIL
- / article preview drag close: PASS/FAIL
- / article preview scroll reset: PASS/FAIL
- / article preview intro scroll flow: PASS/FAIL
- /store product preview opens/closes: PASS/FAIL
- /store product preview drag close: PASS/FAIL
- /store product preview scroll reset: PASS/FAIL
- /store product preview sticky footer: PASS/FAIL
- Escape close: PASS/FAIL
- Focus trap/restore: PASS/FAIL
- Comments unaffected: PASS/FAIL

Notes:
- Any intentionally retained compatibility aliases.
- Any deferred deeper visual refactor.
16. Out of Scope
Blog1 detail rewrite
comment system rewrite
Discovery taxonomy changes
Store isolation changes
Theme redesign
new Saved feature
new search backend
store checkout
Lighthouse tuning
root listing logic changes
hardblock post/title/slug