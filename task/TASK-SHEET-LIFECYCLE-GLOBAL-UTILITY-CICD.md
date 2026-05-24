# TASK — Global Utility Sheet Scroll Reset Lifecycle + Handle Hit Target + Source Cleanup

## Task ID
`TASK-SHEET-LIFECYCLE-GLOBAL-UTILITY`
## Hard Constraint — Rewrite, Not Override

This task must be implemented as a source-level rewrite/refactor, not as an override layer.

Do not solve this task by:
- appending new CSS at the bottom to beat old CSS;
- using `!important` unless an existing project convention already requires it and no cleaner source rewrite is possible;
- adding duplicate lifecycle handlers while leaving the old handlers active;
- adding more specific selectors only to overpower stale selectors;
- patching generated assets without reconciling source files;
- creating per-surface one-off fixes that bypass the global lifecycle model;
- leaving stale template partials in active-looking source paths.

Required approach:
- replace stale logic at its source;
- delete or neutralize obsolete handlers after the new lifecycle is installed;
- keep one generic `resetPanelScroll` / sheet lifecycle path, with surface adapters only where necessary;
- keep visual handle size and actual hit target as separate concepts;
- synchronize source CSS and generated/published CSS through the intended build direction;
- archive or remove stale source files instead of overriding them.

Acceptance:
- Searching the codebase must not show old preview-only reset logic as the only active path.
- Searching the CSS must not show a 10px hit target overriding or competing with the 44px hit target.
- No new override-only block is added merely to defeat previous CSS/JS.
- QA passes because the source architecture is correct, not because later code masks earlier code.
## Objective
Unify the scroll reset lifecycle for utility sheets across root `/`, landing `/landing`, and store `/store`, without adding a preview surface to landing.

This task must convert the current sheet behavior from scattered per-surface handlers into a consistent global lifecycle model with surface adapters.

The final result must support:

- Root preview sheet reset lifecycle remains intact.
- Store preview sheet reset lifecycle remains intact.
- Landing remains a valid `no-preview` surface.
- Root command/search/discovery sheet has explicit scroll reset lifecycle.
- Root more sheet has explicit scroll reset lifecycle.
- Landing command/search/discovery sheet has explicit scroll reset lifecycle.
- Landing more sheet has explicit scroll reset lifecycle.
- Store discovery/search sheet has explicit scroll reset lifecycle.
- Store saved sheet has explicit scroll reset lifecycle if present.
- Store more sheet has explicit scroll reset lifecycle.
- Sheet drag/handle visual can remain subtle, but actual touch/click target must be 44px minimum.
- `index.xml` is treated as the final source of truth for the Blogger XML template.
- Old/stale template source files that no longer represent the final source must be removed or clearly deprecated.

---

## Context
The project target is:

- HTML fallback
- semantic HTML
- registry-driven behavior
- JSON-LD/schema integrity
- accessibility
- mobile-first interaction
- native app-like sheet behavior
- easy microcopy/icon/configuration adjustment
- centralized controller JavaScript as source of behavior
- global sheet contract with per-surface adapter
- one visual rhythm in global CSS
- no override code
- no unused CSS/JS/HTML where avoidable
- top-tier performance, SEO, GEO, SEA, GEA, and AI discoverability/searchability

The previous audit found:

1. Root and store preview sheet lifecycle are already mostly implemented.
2. Landing does not have and should not have a preview surface.
3. Root, landing, and store utility sheets still do not share a global scroll reset lifecycle.
4. `more` and `command/search/discovery` sheets open, but their scroll position and transient UI state are not globally reset.
5. Root and store currently duplicate/adapt similar scroll reset helpers instead of using one lifecycle model.
6. Landing has the weakest implementation: panel open/close works, but no scroll reset helper exists.
7. Visual handle height around 10px is acceptable, but actual pointer/touch hit target must remain at least 44px.
8. `index.xml` is now the final source. Stale source files or partials must not remain as misleading source-of-truth.

---

## Non-goals
Do **not** do the following:

- Do not add a preview sheet to landing.
- Do not replace Blogger native comments.
- Do not change Blog1 detail rendering logic.
- Do not change product schema semantics unless required by broken markup.
- Do not introduce Playwright.
- Do not add heavy runtime dependencies.
- Do not make Worker own UI rendering in healthy routes.
- Do not change public IA labels such as Home, Blog, Store, Search, More unless already centralized and required by existing registry.
- Do not hide accessibility focus behavior for visual neatness.

---

## Files to inspect and update

Inspect these files first:

```txt
index.xml
landing.html
store.html
src/js/gg-app.source.js
src/store/store-discovery.js
src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css
src/store/store.css
assets/store/store.css
qa/preview-sheet-contract-guard.mjs
qa/sheet-contract-guard.mjs
package.json
```

Also inspect stale or misleading template files:

```txt
template/index.original.xml
template/partials/17-preview-panel-and-templates.xml
template/partials/
```

If a template file is no longer used as source, remove it or move it to an explicit archive/deprecated location with a short README explaining that `index.xml` is the final source.

---

## Required implementation

### 1. Declare landing as an explicit no-preview surface
Landing must not silently fail preview checks. It should explicitly state that it is a no-preview surface.

Add an explicit marker on the landing document root or main shell, for example:

```html
<body data-gg-surface="landing" data-gg-preview-surface="none">
```

or equivalent existing shell/root node marker:

```html
<div data-gg-surface="landing" data-gg-preview-surface="none">
```

Use the existing project convention if one already exists.

Acceptance:

- QA must not expect a preview panel on landing.
- QA must confirm that landing is intentionally `no-preview`, not accidentally missing preview.

---

### 2. Add consistent scroll container markers to utility sheets
Every scrollable sheet body must have an explicit scroll container marker.

Use:

```html
data-gg-scroll-container
```

Apply to root utility sheets:

```html
<div class="gg-discovery__body" data-gg-scroll-container>
<div class="gg-more-body" data-gg-scroll-container>
```

Apply to landing utility sheets:

```html
<div class="gg-sheet__body ..." data-gg-scroll-container>
<div class="gg-more-body" data-gg-scroll-container>
```

Apply to store utility sheets:

```html
<div class="store-sheet-body store-discovery-body" data-gg-scroll-container>
<div class="store-sheet-body" data-gg-scroll-container>
<div class="store-sheet-body gg-more-body" data-gg-scroll-container>
```

Do not rely only on class selectors for scroll ownership.

Acceptance:

- All command/search/discovery/more/saved sheet scrollable bodies expose `data-gg-scroll-container`.
- Existing preview sheet scroll containers remain intact.
- No duplicate competing scroll containers are introduced inside a single panel unless intentionally nested and documented.

---

### 3. Replace preview-only reset naming with generic panel reset naming
Current naming is too narrow. Replace or wrap preview-specific reset helpers with a generic helper.

Preferred API:

```js
function resetPanelScroll(panelRoot, reason) {
  if (!panelRoot) return;

  var containers = panelRoot.matches('[data-gg-scroll-container]')
    ? [panelRoot]
    : Array.prototype.slice.call(panelRoot.querySelectorAll('[data-gg-scroll-container]'));

  if (!containers.length) {
    containers = [panelRoot];
  }

  containers.forEach(function (node) {
    try {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    } catch (error) {}
  });

  panelRoot.setAttribute('data-gg-scroll-reset-reason', reason || 'reset');
  panelRoot.setAttribute('data-gg-scroll-reset-at', String(Date.now()));
}
```

If a project-level namespace exists, prefer:

```js
GG.sheetLifecycle.resetPanelScroll(panelRoot, reason)
```

or:

```js
GG.resetPanelScroll(panelRoot, reason)
```

Acceptance:

- Preview behavior still works.
- Utility sheets can call the same reset helper.
- No separate duplicated reset functions remain unless strictly required by isolated bundle boundaries.
- If duplicate functions must remain due to bundle isolation, their behavior and data attributes must be byte/logic-aligned and guarded by QA.

---

### 4. Add scroll reset policy per panel definition
Do not hardcode `if (panel.name === 'preview')` as the only reset case.

Each panel should define its scroll reset policy.

Recommended model:

```js
var panelDefs = {
  preview: {
    name: 'preview',
    scrollReset: {
      openBeforeRender: true,
      openAfterRender: true,
      closeBeforeHide: true,
      itemChange: true
    }
  },
  command: {
    name: 'command',
    scrollReset: {
      openBeforeRender: true,
      queryChange: true,
      filterChange: true,
      closeAfterHide: false
    }
  },
  more: {
    name: 'more',
    scrollReset: {
      openBeforeRender: true,
      closeAfterHide: true,
      clearLocalSearchOnClose: true,
      closePreferencePanelOnClose: true
    }
  },
  discovery: {
    name: 'discovery',
    scrollReset: {
      openBeforeRender: true,
      queryChange: true,
      filterChange: true,
      closeAfterHide: false
    }
  },
  saved: {
    name: 'saved',
    scrollReset: {
      openBeforeRender: true,
      filterChange: true,
      closeAfterHide: false
    }
  }
};
```

Use exact panel names already present in each surface. Do not rename public-facing labels unless necessary.

Acceptance:

- Root `command/search/discovery` resets on open and query/filter/tab/context change.
- Root `more` resets on open and close.
- Landing `command/search/discovery` resets on open and query/filter/tab/context change.
- Landing `more` resets on open and close.
- Store `discovery/search` resets on open and query/filter/tab/category change.
- Store `saved` resets on open and filter/sort change if the sheet exists.
- Store `more` resets on open and close.
- Preview item change reset remains intact for root/store.

---

### 5. Apply reset lifecycle events
Use the generic helper in lifecycle events.

Required lifecycle calls:

#### Open
Before rendering or before exposing panel:

```js
if (shouldResetPanel(panel, 'openBeforeRender')) {
  resetPanelScroll(panel.root, 'open-before-render');
}
```

After dynamic render, only if panel policy requires it:

```js
if (shouldResetPanel(panel, 'openAfterRender')) {
  resetPanelScroll(panel.root, 'open-after-render');
}
```

#### Close
Before or after hiding based on policy:

```js
if (shouldResetPanel(panel, 'closeBeforeHide')) {
  resetPanelScroll(panel.root, closeReason || 'close-before-hide');
}

if (shouldResetPanel(panel, 'closeAfterHide')) {
  resetPanelScroll(panel.root, closeReason || 'close-after-hide');
}
```

#### Query change
For command/search/discovery:

```js
if (shouldResetPanel(panel, 'queryChange')) {
  resetPanelScroll(panel.root, 'query-change');
}
```

#### Filter/tab/category/sort change
For discovery/saved/store category flows:

```js
if (shouldResetPanel(panel, 'filterChange')) {
  resetPanelScroll(panel.root, 'filter-change');
}
```

#### Item change
For preview:

```js
if (shouldResetPanel(panel, 'itemChange')) {
  resetPanelScroll(panel.root, 'item-change');
}
```

Acceptance:

- No utility sheet reopens at stale scroll position.
- Changing search query does not leave results scrolled halfway down.
- Changing tab/category/filter/sort does not leave panel scrolled halfway down.
- More sheet does not reopen stuck inside a stale scrolled menu state.
- Preview open/item-change/close behavior remains unchanged or improved.

---

### 6. Reset transient state for More sheet only
More sheet should reset transient UI state on close or open, depending on existing UX convention.

Reset allowed:

- scroll position
- local search input inside More sheet if any
- temporary filtering state
- open preference subpanel
- active temporary disclosure section if not user-persisted

Do not reset persistent user settings:

- theme
- language
- motion setting
- reading preference
- saved preference values

Acceptance:

- Closing and reopening More returns to the top-level More view.
- User preferences remain unchanged.

---

### 7. Preserve accessibility and focus behavior
Do not sacrifice accessibility to make the sheet look cleaner.

Required:

- Focus should move into opened panel if existing behavior already does that.
- Escape/scrim/close button behavior must still close the active panel.
- `aria-hidden`, `inert`, `aria-expanded`, and active panel markers should remain consistent.
- Scroll reset must not cause unexpected focus loss.
- Reduced-motion users should not get unnecessary animation changes.

Acceptance:

- Keyboard opening/closing works for root, landing, and store sheets.
- Focus is not trapped in hidden panels.
- Sheet close buttons remain accessible.

---

### 8. Fix 44px hit target with subtle visual handle
The visual handle may remain approximately 10px/tiny/subtle, but the real hit target must be at least 44px.

Use this pattern or equivalent:

```css
:root {
  --gg-hit-min: 44px;
  --gg-handle-visual-height: 5px;
  --gg-handle-visual-width: 42px;
}

.gg-sheet__handle,
[data-gg-drag-handle] {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--gg-hit-min);
  min-width: var(--gg-hit-min);
  height: var(--gg-hit-min);
  min-height: var(--gg-hit-min);
  margin-inline: auto;
  padding: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: ns-resize;
}

.gg-sheet__handle::before,
[data-gg-drag-handle]::before {
  content: "";
  display: block;
  width: var(--gg-handle-visual-width);
  height: var(--gg-handle-visual-height);
  border-radius: 999px;
  background: var(--gg-panel-handle-tone, currentColor);
  opacity: .45;
}
```

Adapt selector names to existing code. Do not double-render pseudo-elements if a visual child already exists. If the handle has an inner visual span, apply 44px to the button/container and 5–10px visual size to the inner span.

Acceptance:

- Actual handle target area is at least 44px high/wide.
- Visual handle remains subtle.
- No sheet header becomes visually bulky.
- Root, landing, and store use the same hit-target principle.
- `src` CSS and published asset CSS do not drift on this value.

---

### 9. Sync source CSS and asset CSS
Previous guard failed because source and asset CSS drifted.

Required:

- Sync `src/css/gg-app.source.css` with `__gg/assets/css/gg-app.dev.css` according to the project's intended build direction.
- Sync `src/store/store.css` with `assets/store/store.css` according to the project's intended build direction.
- Make sure `--gg-hit-min` is not `10px` in source if asset expects `44px`.
- Visual handle size may be 5–10px, but hit target must be 44px.

Acceptance:

- `npm run gaga:verify-sheet-contract` passes.
- No source/asset drift remains for sheet lifecycle or hit target rules.

---

### 10. Clean stale source files
Since `index.xml` is now the final source, do not leave stale template files that contradict it.

Required:

- Inspect:

```txt
template/index.original.xml
template/partials/17-preview-panel-and-templates.xml
template/partials/
```

- If these are unused source fragments, remove them.
- If they must be retained historically, move them to an explicit archive/deprecated path, for example:

```txt
docs/archive/template-deprecated/
```

- Add a short README:

```md
# Deprecated Template Fragments

These files are retained only for historical reference.
They are not the current source of truth.
The current final Blogger XML source is `index.xml`.
Do not patch these files for production behavior.
```

Acceptance:

- No active-looking stale template partial contradicts `index.xml`.
- AI/code agents will not mistake old partials as current source.
- Build/proof scripts do not depend on removed files.

---

## QA requirements

Update or add QA guards without Playwright.

Preferred guard name:

```txt
qa/sheet-lifecycle-contract-guard.mjs
```

Add npm script:

```json
{
  "scripts": {
    "gaga:verify-sheet-lifecycle": "node qa/sheet-lifecycle-contract-guard.mjs"
  }
}
```

The guard must verify:

1. Landing has explicit `data-gg-preview-surface="none"` or equivalent no-preview marker.
2. Root and store still have preview sheet contracts.
3. Landing is not required to have preview sheet.
4. Root command/search/discovery body has `data-gg-scroll-container`.
5. Root more body has `data-gg-scroll-container`.
6. Landing command/search/discovery body has `data-gg-scroll-container`.
7. Landing more body has `data-gg-scroll-container`.
8. Store discovery/search body has `data-gg-scroll-container`.
9. Store saved body has `data-gg-scroll-container` if the sheet exists.
10. Store more body has `data-gg-scroll-container`.
11. Generic `resetPanelScroll` or project-equivalent helper exists.
12. Preview-only hardcoding is not the only reset pathway.
13. Policy or equivalent logic exists for `command`, `discovery/search`, `more`, and `preview`.
14. Handle hit target uses 44px minimum while visual handle remains separately controlled.
15. Source CSS and asset CSS are synchronized or pass the existing sheet contract guard.
16. Deprecated template files are removed or explicitly archived.

Run at minimum:

```bash
npm run gaga:verify-preview-sheet
npm run gaga:verify-sheet-contract
npm run gaga:verify-shell
npm run gaga:verify-sheet-lifecycle
```

If any script does not exist before this task, create or adjust it minimally.

---

## CI/CD, guard, QA, and Cloudflare deploy reconciliation addendum

This task must also reconcile the local guards, npm scripts, build tools, and GitHub Actions / Cloudflare deploy path so the repository can pass CI/CD after the lifecycle changes.

### 11. Reconcile npm scripts

Inspect `package.json` and update scripts so the new lifecycle guard is included in the project's existing CI chain.

Required changes:

```json
{
  "scripts": {
    "gaga:verify-sheet-lifecycle": "node qa/sheet-lifecycle-contract-guard.mjs"
  }
}
```

Then add `npm run gaga:verify-sheet-lifecycle` into the existing aggregate QA script. If the repository has the current script shape, update `ci:qa` so it includes the lifecycle guard near the other UI contract guards:

```json
{
  "scripts": {
    "ci:qa": "npm run gaga:verify-comments-proof && node qa/copy-registry-guard.mjs && npm run gaga:verify-nav-more && npm run gaga:verify-discovery-contract && npm run gaga:verify-discovery-filters && npm run gaga:verify-store-isolation && npm run gaga:verify-theme && npm run gaga:verify-shell && npm run gaga:verify-preview-sheet && npm run gaga:verify-sheet-lifecycle && node qa/template-fingerprint.mjs --check && node qa/worker-syntax-check.mjs"
  }
}
```

Do not remove existing guards. Only insert the new lifecycle guard and fix broken script ordering if necessary.

Acceptance:

- `npm run gaga:verify-sheet-lifecycle` exists.
- `npm run ci:qa` runs the new lifecycle guard.
- `npm run ci:cloudflare` indirectly runs the new lifecycle guard through `ci:qa`, or directly if the aggregate script differs.
- No duplicate or dead scripts are introduced.

---

### 12. Reconcile existing QA guards

The new lifecycle guard must not conflict with existing guards. Update existing guards only when their assumptions are now stale.

Inspect and reconcile:

```txt
qa/preview-sheet-contract-guard.mjs
qa/sheet-contract-guard.mjs
qa/sheet-contract-smoke.sh
qa/shell-interaction-guard.mjs
qa/nav-more-contract-guard.mjs
qa/discovery-contract-guard.mjs
qa/store-isolation-guard.mjs
qa/worker-syntax-check.mjs
qa/store-artifact-smoke.sh
```

Required reconciliation:

- Preview guard must still require preview on root and store.
- Preview guard must not require preview on landing.
- Lifecycle guard must confirm landing is explicitly no-preview.
- Sheet contract smoke must pass after CSS source/asset sync.
- Nav/more guard must not fail after More sheet transient reset behavior is centralized.
- Discovery guard must not fail after scroll containers are added.
- Store artifact smoke must not fail because of renamed store selectors.
- Worker syntax check must still pass.

Acceptance:

```bash
npm run gaga:verify-preview-sheet
npm run gaga:verify-sheet-contract
npm run gaga:verify-shell
npm run gaga:verify-sheet-lifecycle
npm run ci:qa
npm run ci:cloudflare
```

All commands must pass locally before deployment.

---

### 13. Reconcile build tools and generated assets

The implementation must not make CI green by editing only generated assets or only source files. Reconcile the actual build path.

Inspect:

```txt
tools/cloudflare-prepare.mjs
tools/cloudflare-deploy.mjs
tools/gaga-release.mjs
tools/preflight.mjs
tools/template-pack.mjs
tools/build-store-static.mjs
tools/proof-store-static.mjs
tools/store-build.sh
wrangler.jsonc
```

Required:

- `npm run build` must still complete.
- `npm run store:check:ci` must still complete.
- `npm run store:check:dev10` must still complete unless it is intentionally superseded and package scripts are updated accordingly.
- `npm run deploy:cloudflare:dry` or `npm run gaga:cf:dry` must still complete if Cloudflare credentials are not required for dry run.
- `wrangler.jsonc` must retain `assets.run_worker_first = true` if already required by the current route model.
- Do not move UI rendering ownership to the Worker.

Acceptance:

```bash
npm run build
npm run store:check:ci
npm run ci:cloudflare
npm run deploy:cloudflare:dry
```

Where dry deploy is unavailable without credentials, the implementer must report that explicitly and still prove build and CI guards pass.

---

### 14. GitHub Actions workflow reconciliation

Inspect GitHub Actions workflow files if present:

```txt
.github/workflows/*.yml
.github/workflows/*.yaml
```

If workflow files are absent from the working tree but this repository deploys through GitHub Actions, create or update the appropriate workflow according to the existing project convention. Do not invent unrelated deployment architecture.

The workflow must include, at minimum:

```yaml
- run: npm ci
- run: npm run build
- run: npm run ci:qa
- run: npm run ci:cloudflare
```

For actual Cloudflare deployment, keep the existing deploy command if already used. If the current project uses the package script shape in this repo, the deploy step should call one of the existing scripts rather than raw ad-hoc commands:

```yaml
- run: npm run deploy:cloudflare
```

or:

```yaml
- run: npm run gaga:cf:deploy
```

Use the project's existing Cloudflare secret names. Do not hardcode secrets. Typical required secrets may include Cloudflare API token/account/project values, but the implementer must inspect the current workflow/tool expectations before editing.

Acceptance:

- GitHub Actions does not fail because `gaga:verify-sheet-lifecycle` is missing.
- GitHub Actions does not skip the new lifecycle guard.
- GitHub Actions does not run stale/deleted template partial checks.
- Cloudflare deploy command still points to the existing deployment toolchain.
- Workflow remains compatible with the repo's current Node version and lockfile.

---

### 15. CI failure-class hygiene

Do not make CI falsely green by hiding real regressions. Also do not make CI falsely red because of known transient live-network issues.

Required distinction:

Hard fail:

- missing lifecycle guard
- broken package script
- source/asset CSS drift
- missing scroll containers
- broken template pack
- broken store build/proof
- Worker syntax error
- Cloudflare dry/build failure

Soft/diagnostic only, unless the existing production release process requires strict live proof:

- transient live network timeout
- temporary Cloudflare/Blogger unreachable state
- live smoke classified as `INFRA_UNREACHABLE` by the existing script

If live smoke is included in GitHub Actions, preserve the existing retry/timeout classification behavior in `qa/live-smoke-worker.sh`. Use strict mode only for release workflows where a temporary external outage should block release.

Acceptance:

- CI is strict on repository regressions.
- CI is not randomly red because of transient external connectivity unless the workflow is intentionally strict.
- The final implementer report lists whether live smoke was run in strict or tolerant mode.

---

### 16. Final CI/CD proof report

The implementer must extend the final report with CI/CD evidence:

```txt
CI/CD reconciliation:
- package.json scripts updated: YES/NO
- gaga:verify-sheet-lifecycle added: YES/NO
- ci:qa includes lifecycle guard: YES/NO
- ci:cloudflare includes lifecycle guard directly/indirectly: YES/NO
- GitHub Actions workflow inspected: YES/NO
- GitHub Actions workflow updated: YES/NO/NOT PRESENT
- Cloudflare deploy script preserved: YES/NO
- wrangler.jsonc route/asset behavior preserved: YES/NO
- build tools reconciled: YES/NO

Proof:
- npm run build: PASS/FAIL
- npm run store:check:ci: PASS/FAIL
- npm run gaga:verify-preview-sheet: PASS/FAIL
- npm run gaga:verify-sheet-contract: PASS/FAIL
- npm run gaga:verify-shell: PASS/FAIL
- npm run gaga:verify-sheet-lifecycle: PASS/FAIL
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run deploy:cloudflare:dry or npm run gaga:cf:dry: PASS/FAIL/NOT AVAILABLE
- GitHub Actions run: PASS/FAIL/NOT RUN
- Cloudflare deploy: PASS/FAIL/NOT RUN

Notes:
- List any intentional exception.
- List any live-smoke tolerance mode.
- List any workflow file that was added or changed.
```

---

## Updated Definition of Done for CI/CD

This task is not complete until:

1. All local guards pass.
2. `ci:qa` includes the new lifecycle guard.
3. `ci:cloudflare` includes the new lifecycle guard directly or indirectly.
4. Build and store proof still pass.
5. GitHub Actions workflow is inspected and updated if present.
6. Cloudflare deploy toolchain is not broken.
7. The implementer provides explicit CI/CD proof, not only visual/manual proof.

---

## Manual verification checklist

Test root `/`:

- Open Search/Discovery/Command sheet.
- Scroll down.
- Close.
- Reopen.
- Expected: starts at top.
- Type a query after scrolling.
- Expected: results return to top.
- Change tab/filter/topic if available.
- Expected: results return to top.
- Open More.
- Scroll down.
- Close.
- Reopen.
- Expected: top-level More view starts at top.

Test landing `/landing`:

- Confirm there is no preview sheet and that this is intentional.
- Open Search/Command if available.
- Scroll down.
- Close and reopen.
- Expected: starts at top.
- Open More.
- Scroll down.
- Close and reopen.
- Expected: starts at top/top-level state.

Test store `/store`:

- Open product preview.
- Switch product.
- Expected: preview body resets to top.
- Close/reopen preview.
- Expected: starts at top.
- Open store discovery/search/category sheet.
- Scroll down.
- Change query/category/filter.
- Expected: results return to top.
- Open saved sheet if present.
- Scroll down.
- Change filter/sort if present.
- Expected: starts at top.
- Open More.
- Scroll down.
- Close/reopen.
- Expected: starts at top.

Test handle target:

- Visual handle remains subtle.
- Click/touch target is comfortably clickable around 44px.
- No layout jump in sheet head.

---

## Runtime debug/proof expectations

If runtime proof objects exist, extend them. If not, add a lightweight safe snapshot.

Suggested debug fields:

```js
GG.sheetLifecycleProof && GG.sheetLifecycleProof()
```

Expected output shape can include:

```js
{
  surfaces: {
    root: {
      preview: { scrollContainer: true, policy: true },
      command: { scrollContainer: true, policy: true },
      more: { scrollContainer: true, policy: true }
    },
    landing: {
      previewSurface: 'none',
      command: { scrollContainer: true, policy: true },
      more: { scrollContainer: true, policy: true }
    },
    store: {
      preview: { scrollContainer: true, policy: true },
      discovery: { scrollContainer: true, policy: true },
      saved: { scrollContainer: true, policy: true },
      more: { scrollContainer: true, policy: true }
    }
  },
  hitTarget: {
    min: 44,
    visualHandleSeparated: true
  }
}
```

Do not expose noisy debug UI to normal users.

---

## Expected final report from implementer

The implementer must report:

```txt
TASK-SHEET-LIFECYCLE-GLOBAL-UTILITY completed.

Changed:
- Landing declared as no-preview surface: YES/NO
- Root command/search scroll reset lifecycle: YES/NO
- Root more scroll reset lifecycle: YES/NO
- Landing command/search scroll reset lifecycle: YES/NO
- Landing more scroll reset lifecycle: YES/NO
- Store discovery/search scroll reset lifecycle: YES/NO
- Store saved scroll reset lifecycle: YES/NO/NOT PRESENT
- Store more scroll reset lifecycle: YES/NO
- Root preview lifecycle preserved: YES/NO
- Store preview lifecycle preserved: YES/NO
- Generic resetPanelScroll helper added/centralized: YES/NO
- Per-panel scroll reset policy added: YES/NO
- data-gg-scroll-container normalized: YES/NO
- 44px hit target with subtle visual handle: YES/NO
- Source CSS and asset CSS synchronized: YES/NO
- Stale template files removed/archived: YES/NO
- QA guard added: YES/NO

Proof:
- npm run gaga:verify-preview-sheet: PASS/FAIL
- npm run gaga:verify-sheet-contract: PASS/FAIL
- npm run gaga:verify-shell: PASS/FAIL
- npm run gaga:verify-sheet-lifecycle: PASS/FAIL

Notes:
- Any intentional exception must be listed here.
```

---

## Definition of Done

This task is complete only if:

1. Root and store preview lifecycle still pass existing preview guard.
2. Landing is explicitly marked as no-preview surface.
3. Root, landing, and store utility sheets use explicit scroll containers.
4. Root, landing, and store utility sheets reset scroll according to policy.
5. Search/query/filter/category changes reset relevant result panels to top.
6. More sheet transient state does not leak across close/reopen.
7. Actual handle target is 44px minimum while visual handle remains subtle.
8. Source CSS and published asset CSS do not drift.
9. Stale template source files are removed or clearly deprecated.
10. All listed QA commands pass.

