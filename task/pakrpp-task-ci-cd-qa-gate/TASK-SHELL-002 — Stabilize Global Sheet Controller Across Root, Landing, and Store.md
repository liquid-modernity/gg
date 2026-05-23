# TASK-SHELL-002 — Stabilize Global Sheet Controller Across Root, Landing, and Store

## Status

Development stabilization task.

Run this after:

- TASK-STORE-ISOLATION-001
- TASK-STORE-ISOLATION-JS-001
- TASK-DISCOVERY-002
- TASK-DISCOVERY-003
- TASK-THEME-001
- TASK-SHELL-001
- TASK-CI-CD-001

## Strategic Purpose

The visual shell across `/`, `/landing`, and `/store` is now closer, but the sheet behavior is not yet fully global.

Current problem:

```txt
/        = strongest root sheet controller
/landing = still has local/legacy inline sheet controller behavior
/store   = has store-local controller with separate data attributes

The goal is to stabilize sheet behavior globally so Search, Discovery, More, Store Preview, and related bottom sheets feel and behave consistently across:

/
 /landing
 /store

This task is about function stability, not visual redesign.

Non-Negotiables
Do not touch Blog1 detail rendering.
Do not touch Blogger native comments plumbing.
Do not touch threaded comments behavior.
Do not change Store isolation.
Do not change Discovery taxonomy.
Do not change Theme Light/Dark contract.
Do not change dock order.
Do not change More sheet IA.
Do not change Store product/category data model.
Do not hardblock any post/title/slug.
Do not introduce Playwright.
Do not add heavy dependencies.
Do not weaken existing QA guards.
Required Global Sheet Behavior

Every global sheet must support:

open
close
Escape close
backdrop/scrim close where applicable
focus trap while open
focus restore to trigger after close
drag-to-close from the sheet handle
snap-back when drag distance is below threshold
reduced-motion-safe behavior
stable body scroll lock
no duplicate event listener explosion
Reference Behavior

Use the root / sheet behavior as the reference.

The canonical behavior should be based on the root controller in:

src/js/gg-app.source.js

Specifically, preserve or align with existing concepts such as:

openPanel()
closePanel()
trapFocusWhileOpen()
returnFocusOnClose()
ggSheetGestureController
data-gg-drag-handle
data-gg-close
--gg-sheet-drag-y
Landing Requirements

/landing must stop relying on legacy-only local handle semantics.

Audit and fix landing.html.

The landing sheet handle must not remain only like this:

<button class="gg-sheet__handle" type="button" data-sheet-handle data-close-panel>

Required direction:

<button
  class="gg-sheet__handle"
  type="button"
  data-gg-drag-handle="..."
  data-gg-close="..."
  aria-label="Close sheet">
</button>

or, if click-to-close is handled only by controller:

<button
  class="gg-sheet__handle"
  type="button"
  data-gg-drag-handle="..."
  aria-label="Drag to close">
</button>

Landing must support:

pointerdown
pointermove
pointerup / pointercancel
visual drag movement
threshold close
snap-back
focus trap
focus restore
Escape close
shared state markers

Landing must expose a runtime debug snapshot:

window.LandingSurface.sheetController.snapshot()

Suggested fields:

{
  surface: "landing",
  openSheet: "more" | "discovery" | null,
  sheetCount: number,
  activeHandleCount: number,
  legacyHandleOnlyCount: number,
  dragHandleCount: number,
  closeHandleCount: number,
  focusTrapActive: boolean,
  lastCloseReason: "escape" | "scrim" | "handle" | "drag" | "api" | null
}
Root Requirements

Root / must keep existing stable behavior.

Expose or preserve:

window.GG.sheetController.snapshot()

or equivalent public QA function.

Suggested fields:

{
  surface: "root",
  openSheet: string | null,
  sheetCount: number,
  dragHandleCount: number,
  focusTrapActive: boolean,
  bodyScrollLocked: boolean,
  lastCloseReason: string | null
}

Do not regress existing comments sheet behavior.

Store Requirements

Store may keep its store-local adapter, but it must mirror the global sheet contract.

In Store sheets, keep existing store attributes where needed:

data-store-close="..."
data-store-drag-handle="..."

But add global-compatible mirror attributes:

data-gg-close="..."
data-gg-drag-handle="..."

Store must expose:

window.StoreDiscovery.sheetController.snapshot()

Suggested fields:

{
  surface: "store",
  openSheet: string | null,
  sheetCount: number,
  storeDragHandleCount: number,
  ggDragHandleCount: number,
  focusTrapActive: boolean,
  lastCloseReason: string | null
}

Store Preview and Store Discovery must keep working.

Required Markup Contract

All major bottom sheets should converge toward this contract:

<div
  class="gg-sheet"
  data-gg-panel="..."
  data-gg-state="closed"
  aria-hidden="true"
  inert
  hidden>
  
  <button
    class="gg-sheet__scrim"
    type="button"
    data-gg-close="..."
    aria-label="Close sheet">
  </button>

  <section
    class="gg-sheet__panel"
    role="dialog"
    aria-modal="true"
    tabindex="-1">

    <button
      class="gg-sheet__handle"
      type="button"
      data-gg-drag-handle="..."
      aria-label="Drag to close">
    </button>

    ...
  </section>
</div>

Store-specific sheets may keep store-bottom-sheet, store-preview__handle, and other existing classes, but must expose compatible data-gg-* attributes.

Required Gesture Contract

Implement one consistent drag contract:

dragStartY
dragCurrentY
dragDeltaY
closeThreshold
velocityThreshold optional
snapBack
closeByDrag

Rules:

drag down only
small drag snaps back
drag above threshold closes
pointercancel cleans state
drag must not permanently leave transform applied
drag must not block normal content scroll incorrectly
reduced motion respected

Use CSS variable:

--gg-sheet-drag-y

or equivalent shared variable.

Required Focus Contract

Every global sheet must:

focus first meaningful control or panel on open
trap Tab / Shift+Tab inside active sheet
close on Escape
restore focus to original trigger on close
not leave background controls focusable while modal is open
not create duplicate focus trap listeners

Use inert where safe.

Required QA Guard

Add or update:

qa/shell-interaction-guard.mjs

The guard must fail if:

landing handle still only uses data-sheet-handle
landing handle still only uses data-close-panel without data-gg-drag-handle
landing has no data-gg-drag-handle
store has data-store-drag-handle but no mirrored data-gg-drag-handle
root has no sheet controller snapshot/proof
landing has no sheet controller snapshot/proof
store has no sheet controller snapshot/proof
shared drag CSS variable/contract disappears
focus trap contract disappears
Escape close contract disappears
comments proof is weakened

The guard should not require Playwright.

Required Debug Snippet

After implementation, this snippet must show no legacy-only landing handles:

(() => {
  const sheets = [...document.querySelectorAll('.gg-sheet')].map((sheet) => ({
    id: sheet.id,
    panel: sheet.getAttribute('data-gg-panel') || '',
    state: sheet.getAttribute('data-gg-state'),
    hidden: sheet.hidden,
    inert: sheet.hasAttribute('inert'),
    ariaHidden: sheet.getAttribute('aria-hidden'),
    handles: [...sheet.querySelectorAll('.gg-sheet__handle')].map((h) => ({
      ggDrag: h.getAttribute('data-gg-drag-handle'),
      legacyHandle: h.hasAttribute('data-sheet-handle'),
      closePanel: h.hasAttribute('data-close-panel'),
      ggClose: h.getAttribute('data-gg-close'),
      storeClose: h.getAttribute('data-store-close')
    }))
  }));
  console.table(sheets);
  return sheets;
})();

Bad result:

legacyHandle: true
ggDrag: null
closePanel: true

Expected result:

ggDrag: non-null
legacyHandle: false or compatibility-only
closePanel: false or not the primary close path
Required Manual QA

Test these routes:

/
 /landing
 /store
 one post detail
 one static page
Root /

Test:

Open Search
Close Search with handle
Close Search with Escape
Open More
Close More with handle
Open comments on a post detail
Open replies
Close comments/replies

Required:

no console error
focus returns to trigger
drag works
comments native composer unaffected
/landing

Test:

Open Search/Discovery
Open More
Drag sheet down
Small drag snaps back
Escape closes
Focus trap works
Focus returns to dock trigger

Required:

no landing inline controller error
no legacy-only handle
no stuck inert state
no stuck hidden state
/store

Test:

Open Store Discovery
Open Store Preview
Drag to close
Escape close
Saved filter still visible
Products/Categories/Saved filters still work

Required:

Store controller still works
Store-specific adapter remains intact
global data-gg-* mirrors exist
Required Commands

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

Also run syntax checks:

node --check src/js/gg-app.source.js
node --check src/store/store-discovery.js
node --check qa/shell-interaction-guard.mjs
Acceptance Criteria

This task is accepted only if:

/ sheet open/close/drag/focus is stable
/landing sheet open/close/drag/focus is stable
/store sheet open/close/drag/focus is stable
landing no longer relies on legacy-only handle controller
store mirrors global data-gg handle/close attributes
root controller behavior is preserved
comments proof remains passing
Store isolation remains passing
Discovery taxonomy remains unchanged
Theme Light/Dark remains unchanged
live worker smoke is PASS or PASS_WITH_WARNINGS only
no CONTRACT_FAILURE
Required Final Report
TASK-SHELL-002 completed.

Changed:
- Root controller changed: YES/NO
- Landing controller upgraded/adapted: YES/NO
- Store controller mirrored global attributes: YES/NO
- data-gg-drag-handle standardized: YES/NO
- data-gg-close standardized: YES/NO
- focus trap standardized: YES/NO
- Escape close standardized: YES/NO
- drag-to-close standardized: YES/NO
- runtime snapshots added:
  - GG.sheetController.snapshot(): YES/NO
  - LandingSurface.sheetController.snapshot(): YES/NO
  - StoreDiscovery.sheetController.snapshot(): YES/NO
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
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run gaga:verify-worker-live:strict: PASS/PASS_WITH_WARNINGS/FAIL

Manual QA:
- / Search/More drag close: PASS/FAIL
- /landing Search/More drag close: PASS/FAIL
- /store Discovery/Preview drag close: PASS/FAIL
- Escape close: PASS/FAIL
- Focus trap/restore: PASS/FAIL
- Comments unaffected: PASS/FAIL

Notes:
- Any intentionally retained compatibility aliases.
- Any deferred deeper refactor.
Out of Scope
Blog1 detail rewrite
comment system rewrite
Discovery taxonomy changes
Store isolation changes
Theme redesign
Lighthouse tuning
new search backend
new Saved feature
root listing logic changes