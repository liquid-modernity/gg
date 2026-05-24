# TASK-SHEET-RUNTIME-VISUAL-PARITY-FIX

## Purpose

Fix the remaining runtime and visual parity regressions after `TASK-SHEET-LIFECYCLE-GLOBAL-UTILITY`.

The previous task made the guard scripts pass, but the actual runtime UX is still not acceptable:

- Landing `Discovery`/command sheet cannot scroll reliably.
- Dock sheet content does not consistently reset after close and reopen.
- Sheet height is not globally tokenized across root, landing, and store.
- Sheet handle/header is visually too tall and inconsistent across preview, more, discovery, comments, root, landing, and store.
- Root preview thumbnail/hero sizing does not visually match store preview.
- Landing and store dock style still does not match root.
- Existing lifecycle guard is too shallow and can pass while runtime structure is still wrong.

This task is a **corrective integration/refactor**, not a new feature.

---

## Hard Constraint — Rewrite, Not Override

Do **not** solve this by appending override CSS/JS at the bottom of files.

Do **not** use:
- new late-loaded CSS blocks just to beat old CSS;
- `!important`, unless an existing project convention absolutely requires it and there is no cleaner source rewrite;
- duplicate lifecycle handlers that leave old handlers active;
- more-specific selectors only to overpower stale selectors;
- generated asset edits without reconciling the source file;
- one-off per-surface patches that bypass the global sheet/dock contract.

Required approach:
- replace stale logic at its source;
- remove or neutralize obsolete handlers after the new lifecycle is installed;
- keep one generic sheet reset/lifecycle model with surface adapters only where necessary;
- keep visual handle size and actual hit target as separate concepts;
- synchronize source CSS and generated/published CSS through the intended build direction;
- strengthen QA so the current bugs cannot pass again.

---

## Source-of-Truth Rules

### XML / HTML

- `index.xml` is the final root source.
- Landing source is `landing.html`.
- Store shell source is `store.html`.
- Archived template files under `docs/archive/template-deprecated/` must remain archived and must not be reintroduced as active source.

### CSS

Root:
- Source: `src/css/gg-app.source.css`
- Published/dev asset: `__gg/assets/css/gg-app.dev.css`

Store:
- Source: `src/store/store.css`
- Published asset: `assets/store/store.css`

Landing:
- Inline CSS in `landing.html` must be reconciled with the same global tokens and contract.

Do not edit only the generated/published asset while leaving source stale.

### JavaScript

Root:
- `src/js/gg-app.source.js`

Landing:
- Inline JS in `landing.html`

Store:
- `src/store/store-discovery.js`

---

## Required Fixes

## 1. Fix Landing Discovery / Command Sheet Scroll

### Problem

Landing command/discovery sheet has `overflow: hidden` at the panel level, but the body does not receive a proper grid row allocation. As a result, `data-gg-scroll-container` can exist while the body is not a reliable scrollport.

### Required implementation

Make the landing command panel follow the same structural contract as root discovery:

```css
#gg-command-panel .gg-sheet__panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}

#gg-command-panel [data-gg-scroll-container],
#gg-command-panel .gg-discovery-body {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
```

Adjust selector names to match actual markup, but the contract must be this:

```txt
head = auto
body = minmax(0, 1fr), scrollport
footer/search/command = auto
```

### Acceptance

- Landing `Discovery` sheet scrolls with long content.
- Search/command footer remains usable.
- No body-page scroll leak while the sheet is open.
- This must work on mobile viewport sizes.

---

## 2. Fix `resetPanelScroll()` So It Resets the Real Scrollports

### Problem

The current helper can reset only `[data-gg-scroll-container]`, while actual scrolling may happen on `.gg-sheet__panel` or a content panel such as `.gg-preview__sheet`.

### Required implementation

Refactor the helper on root, landing, and store so that it resets **all actual scroll candidates**:

```js
function collectPanelScrollTargets(root) {
  const targets = [];

  if (!root) return targets;

  const directPanel = root.matches && root.matches('.gg-sheet__panel, .gg-content-sheet__panel')
    ? root
    : root.querySelector && root.querySelector('.gg-sheet__panel, .gg-content-sheet__panel');

  if (directPanel) targets.push(directPanel);

  root.querySelectorAll?.('[data-gg-scroll-container], .gg-sheet__panel, .gg-content-sheet__panel')
    .forEach((node) => targets.push(node));

  return Array.from(new Set(targets)).filter(Boolean);
}

function resetPanelScroll(root, reason) {
  collectPanelScrollTargets(root).forEach((node) => {
    try {
      node.scrollTop = 0;
      node.scrollLeft = 0;
      if (typeof node.scrollTo === 'function') {
        node.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    } catch (_) {}
  });
}
```

The exact implementation can differ, but it must reset:
- sheet root if scrollable;
- `.gg-sheet__panel`;
- `.gg-content-sheet__panel`;
- every `[data-gg-scroll-container]`.

### Acceptance

- Closing and reopening `More`, `Discovery`, `Saved`, `Preview`, and root/store preview returns content to the top.
- Reset works even if the browser uses the panel itself as scroll container.
- No preview-only helper remains as the only active reset path.
- Guard must detect if `.gg-sheet__panel` or `.gg-content-sheet__panel` is not included in reset candidates.

---

## 3. Expand Scroll Reset Policy

### Problem

Some panels reset only on open, not on close/reopen. This leaks previous scroll position and makes the UX feel stale.

### Required policy

Apply this policy consistently.

#### `preview`

Root and store only.

```js
{
  openBeforeRender: true,
  openAfterRender: true,
  closeBeforeHide: true,
  closeAfterHide: true,
  itemChange: true
}
```

#### `command` / `discovery`

Root command/search, landing command/search, store discovery/search.

```js
{
  openBeforeRender: true,
  openAfterRender: true,
  closeAfterHide: true,
  queryChange: true,
  filterChange: true
}
```

#### `saved`

Store only.

```js
{
  openBeforeRender: true,
  openAfterRender: true,
  closeAfterHide: true,
  filterChange: true
}
```

#### `more`

Root, landing, store.

```js
{
  openBeforeRender: true,
  openAfterRender: true,
  closeAfterHide: true,
  clearLocalSearchOnClose: true,
  closePreferencePanelOnClose: true
}
```

#### `comments`

Do not aggressively reset comments by default. Comments may preserve reading position unless a specific existing behavior requires otherwise.

### Acceptance

- Policy exists in one visible/central place per runtime bundle.
- No `if (panel.name === 'preview')` hardcoding remains as the only lifecycle behavior.
- Utility sheets reset on close/reopen.
- Comments are not accidentally made hostile by aggressive reset.

---

## 4. Globalize Sheet Height Tokens

### Problem

Root, landing, and store currently use different max-height values and different dock/panel width offsets.

### Required tokens

Introduce or reconcile these global design tokens across root, landing, and store:

```css
:root {
  --gg-shell-edge-gap: 10px;

  --gg-dock-width: min(calc(100vw - (var(--gg-shell-edge-gap) * 2)), 600px);
  --gg-panel-width: var(--gg-dock-width);

  --gg-sheet-max-height: min(94dvh, 920px);
  --gg-sheet-utility-max-height: min(94dvh, 780px);
  --gg-sheet-content-max-height: min(94dvh, 920px);
  --gg-sheet-compact-max-height: min(86dvh, 680px);
}
```

Use project naming conventions if equivalent tokens already exist. Do not create duplicate competing tokens.

### Required mapping

- Dock width must use `--gg-dock-width`.
- Sheet width must use `--gg-panel-width`.
- Preview/content sheets must use `--gg-sheet-content-max-height`.
- More/discovery/utility sheets must use `--gg-sheet-utility-max-height`, unless an existing explicit reason requires full content height.
- Avoid hardcoded `min(92dvh, 780px)`, `min(94dvh, 920px)`, `calc(100vw - 0px)`, `calc(100vw - 12px)`, `calc(100vw - 20px)` scattered across surfaces.

### Acceptance

- Root, landing, and store share the same width and height rhythm.
- Search results for old hardcoded viewport gap/height values are either removed or justified.
- Guard verifies common token usage.

---

## 5. Fix Sheet Head / Handle: 44px Hit Target Without Tall Visual Head

### Problem

The current handle implementation uses a 44px hit target as a normal layout row. This makes the sheet head visually too tall and not native-app-like.

### Required behavior

- Actual touch/click target must remain at least 44px.
- Visual handle must look subtle and thin, approximately native sheet style.
- The 44px target must not visually inflate the header.

### Required CSS contract

Use this model or equivalent:

```css
:root {
  --gg-sheet-head-height: 56px;
  --gg-sheet-handle-hit: 44px;
  --gg-sheet-handle-visual-width: 34px;
  --gg-sheet-handle-visual-height: 3px;
  --gg-sheet-handle-top: 4px;
}

.gg-sheet__head,
.gg-content-sheet__head {
  position: sticky;
  top: 0;
  min-height: var(--gg-sheet-head-height);
  padding: 18px var(--gg-panel-pad-x, 18px) 8px;
}

.gg-sheet__handle,
.gg-content-sheet__handle {
  position: absolute;
  top: var(--gg-sheet-handle-top);
  left: 50%;
  width: var(--gg-sheet-handle-hit);
  height: var(--gg-sheet-handle-hit);
  min-width: var(--gg-sheet-handle-hit);
  min-height: var(--gg-sheet-handle-hit);
  transform: translateX(-50%);
  display: grid;
  place-items: start center;
  padding-top: 0;
  background: transparent;
  border: 0;
}

.gg-sheet__handle::before,
.gg-content-sheet__handle::before {
  content: "";
  width: var(--gg-sheet-handle-visual-width);
  height: var(--gg-sheet-handle-visual-height);
  border-radius: 999px;
}
```

The final CSS can differ, but it must preserve the principle:

```txt
44px invisible hit target
3px-ish visual handle
compact head
same across preview, more, discovery, comments, root, landing, store
```

### Acceptance

- Screenshot of `More` and `Discovery` no longer shows a bloated handle area.
- Handle appears visually subtle and consistent across sheet families.
- Tap/click target remains accessible.
- No `--gg-hit-min: 10px` is used as the actual hit target.
- Guard detects accidental reintroduction of 10px actual hit target.

---

## 6. Align Root Preview Media With Store Preview Media

### Problem

Root and store preview hero/thumbnail sizing use different variables and feel visually unrelated.

### Required tokens

Create/reconcile common preview media tokens:

```css
:root {
  --gg-preview-hero-min: clamp(300px, 58dvh, 540px);
  --gg-preview-overlay-lift: clamp(108px, 18vw, 148px);
  --gg-preview-media-fit: cover;
  --gg-preview-surface-radius: 24px;
}
```

Use project naming conventions if equivalent variables already exist.

### Required behavior

- Root preview and store preview must share hero height/overlay lift rhythm.
- Store may keep carousel/product-specific content, but base media sizing must feel like the same component family.
- Root preview thumbnails/cards must not look smaller or visually weaker than store preview without design reason.

### Acceptance

- Root preview image/media and store preview image/media feel visually aligned.
- Guard checks both root CSS and store CSS for common preview media token usage.
- No isolated root-only/store-only preview hero sizing remains unless explicitly commented.

---

## 7. Align Dock Style Across Root, Landing, and Store

### Problem

Dock width and visual rhythm differ:
- root uses one viewport gap;
- landing uses another;
- store uses another.

### Required behavior

- Root, landing, and store dock width must use the same token.
- Dock visual weight, radius, blur/surface, gap, active state, and item minimum hit target must be visibly one system.
- Surface-specific labels/actions may differ, but the dock shell must be the same family.

### Required tokens

Reuse or reconcile:

```css
--gg-shell-edge-gap
--gg-dock-width
--gg-dock-radius
--gg-dock-height
--gg-dock-item-hit
--gg-dock-surface
--gg-dock-border
--gg-dock-shadow
```

Do not duplicate competing variables if existing project tokens already cover these.

### Acceptance

- Landing dock no longer looks wider/flatter than root.
- Store dock no longer has a different edge rhythm from root.
- Root, landing, and store use the same width formula.
- Guard verifies dock width token usage in root, landing, and store.

---

## 8. Strengthen `qa/sheet-lifecycle-contract-guard.mjs`

### Problem

Current guard passes by finding strings, even when runtime structure is wrong.

### Required guard upgrades

Extend the guard to fail if any of the following regressions exist:

#### Scroll structure

- Landing command/discovery panel lacks `grid-template-rows: auto minmax(0, 1fr) auto`.
- Landing discovery body lacks scrollport semantics.
- Root/store/landing scroll reset helper does not include `.gg-sheet__panel` or `.gg-content-sheet__panel`.
- `[data-gg-scroll-container]` is not normalized on relevant sheet bodies.

#### Policy

- `command`/`discovery` policy lacks `closeAfterHide`.
- `saved` policy lacks `closeAfterHide`.
- `more` policy lacks `openBeforeRender`, `openAfterRender`, and `closeAfterHide`.
- `preview` policy lacks `closeAfterHide`.

#### Visual handle

- Actual hit target is set to 10px.
- Visual handle height is not tokenized.
- Handle target and visual height are not separated.

#### Height/width parity

- Root/landing/store do not use the same dock width token.
- Utility/content sheet heights are not tokenized.
- Old hardcoded width gaps remain as active contract.

#### Preview media parity

- Root and store preview media do not use common preview tokens.

### Acceptance

- `npm run gaga:verify-sheet-lifecycle` fails before the fix and passes after the fix.
- Guard must not be purely string theater; it must check specific contract patterns.
- Keep guard lightweight. Do not introduce Playwright.

---

## 9. Reconcile Package Scripts / CI / Cloudflare Checks

### Required

Update scripts only if needed, but verify these remain valid:

```bash
npm run build
npm run store:check:ci
npm run store:check:dev10
npm run gaga:verify-preview-sheet
npm run gaga:verify-sheet-contract
npm run gaga:verify-shell
npm run gaga:verify-sheet-lifecycle
npm run ci:qa
npm run ci:cloudflare
git diff --check
```

If `.github/workflows/*.yml` exists in the repo, inspect it and ensure the lifecycle guard remains included in CI. If the uploaded/audit archive does not include `.github`, report that workflow verification is not possible from the artifact.

Do not break:
- `wrangler.jsonc`
- `assets.run_worker_first = true`
- Cloudflare route/asset behavior
- Blogger root/store/landing route semantics

### Local Wrangler note

If `npm run deploy:cloudflare:dry` fails locally because of macOS Security framework / Wrangler / esbuild binary compatibility, report it as an environment failure, not a source contract failure. Do not hide it.

---

## Files Likely To Change

Expected:

```txt
index.xml
landing.html
store.html

src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css

src/js/gg-app.source.js

src/store/store.css
assets/store/store.css
src/store/store-discovery.js

qa/sheet-lifecycle-contract-guard.mjs
package.json
```

Possible:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
docs/archive/template-deprecated/*
```

Do not modify unrelated features.

---

## Non-Goals

Do not:
- redesign threaded comments;
- redesign store taxonomy;
- change Blogger native comments ownership;
- change route/canonical semantics;
- change `/landing` versus `/` meaning;
- change product data schema unless required for preview media parity;
- introduce Playwright;
- add large dependencies;
- add CSS frameworks;
- replace Blogger/Cloudflare architecture.

---

## Manual QA Checklist

Run through these surfaces manually after local build:

### Root `/`

- Open dock `Discovery`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Type a search query.
- Results start at top.
- Clear/change query.
- Results start at top.
- Open `More`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Open preview.
- Scroll down.
- Close.
- Reopen another item.
- It starts at top.
- Preview media rhythm matches store.

### Landing `/landing`

- Open `Discovery`.
- Long content scrolls.
- Close.
- Reopen.
- It starts at top.
- Open `More`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Dock width/radius/weight matches root.

### Store `/store`

- Open `Discovery`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Open `Saved`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Open `More`.
- Scroll down.
- Close.
- Reopen.
- It starts at top.
- Open product preview.
- Scroll down.
- Close.
- Open another preview.
- It starts at top.
- Preview media rhythm matches root.
- Dock width/radius/weight matches root.

### Global visual check

- `More`, `Discovery`, `Saved`, `Preview`, and `Comments` heads use a subtle thin handle.
- Header does not look bloated.
- Touch/click target remains at least 44px.
- No visible 44px bar is presented as the handle.
- Sheet height and dock width feel identical across root, landing, and store.

---

## Required Final Report Format

When completed, report exactly:

```txt
TASK-SHEET-RUNTIME-VISUAL-PARITY-FIX completed.

Changed:
- Landing discovery scroll fixed: YES/NO
- Root command/search reset after close/reopen: YES/NO
- Root more reset after close/reopen: YES/NO
- Root preview reset preserved: YES/NO
- Landing command/search reset after close/reopen: YES/NO
- Landing more reset after close/reopen: YES/NO
- Store discovery/search reset after close/reopen: YES/NO
- Store saved reset after close/reopen: YES/NO
- Store more reset after close/reopen: YES/NO
- Store preview reset preserved: YES/NO
- resetPanelScroll resets sheet panel + scroll containers: YES/NO
- closeAfterHide policy added where required: YES/NO
- Global sheet height tokens reconciled: YES/NO
- 44px hit target with thin visual handle implemented globally: YES/NO
- Root/store preview media tokens aligned: YES/NO
- Root/landing/store dock style tokens aligned: YES/NO
- QA guard strengthened beyond string checks: YES/NO
- Source CSS and asset CSS synchronized: YES/NO
- No override-only CSS/JS added: YES/NO
- Stale template archive preserved: YES/NO
- GitHub Actions workflow inspected: YES/NO/NOT PRESENT
- Cloudflare deploy behavior preserved: YES/NO

Proof:
- npm run build: PASS/FAIL/NOT RUN
- npm run store:check:ci: PASS/FAIL/NOT RUN
- npm run store:check:dev10: PASS/FAIL/NOT RUN
- npm run gaga:verify-preview-sheet: PASS/FAIL/NOT RUN
- npm run gaga:verify-sheet-contract: PASS/FAIL/NOT RUN
- npm run gaga:verify-shell: PASS/FAIL/NOT RUN
- npm run gaga:verify-sheet-lifecycle: PASS/FAIL/NOT RUN
- npm run ci:qa: PASS/FAIL/NOT RUN
- npm run ci:cloudflare: PASS/FAIL/NOT RUN
- git diff --check: PASS/FAIL/NOT RUN
- npm run deploy:cloudflare:dry: PASS/FAIL/NOT RUN + reason if fail

Manual QA:
- Root discovery close/reopen reset: PASS/FAIL/NOT RUN
- Root more close/reopen reset: PASS/FAIL/NOT RUN
- Root preview media parity: PASS/FAIL/NOT RUN
- Landing discovery scroll: PASS/FAIL/NOT RUN
- Landing discovery close/reopen reset: PASS/FAIL/NOT RUN
- Landing more close/reopen reset: PASS/FAIL/NOT RUN
- Landing dock parity: PASS/FAIL/NOT RUN
- Store discovery close/reopen reset: PASS/FAIL/NOT RUN
- Store saved close/reopen reset: PASS/FAIL/NOT RUN
- Store more close/reopen reset: PASS/FAIL/NOT RUN
- Store preview close/reopen reset: PASS/FAIL/NOT RUN
- Store/root preview media parity: PASS/FAIL/NOT RUN
- Global thin handle visual: PASS/FAIL/NOT RUN
- Global 44px hit target: PASS/FAIL/NOT RUN

Notes:
- [List anything not run and why.]
```

---

## Final Acceptance Gate

This task is complete only if:

1. The user's reported bugs are fixed.
2. The strengthened guard would catch those bugs if they came back.
3. Root, landing, and store feel like one sheet/dock system.
4. CI scripts remain green locally except for explicitly explained environment-only Wrangler failures.
5. No override-only code was added.
