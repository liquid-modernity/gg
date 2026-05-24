# TASK-SHEET-CORE-SOT-STORE-CRITICAL-FIX

## Mission

Finish the sheet component source-of-truth architecture after `TASK-SHEET-COMPONENT-SOURCE-OF-TRUTH`.

The previous task correctly moved More and root/landing Discovery closer to modular component ownership, but the implementation is still not final because the Store surface still carries local sheet-core styling and stale critical CSS. This creates visible drift such as Store sheet titles rendering as `MORE` while root/landing render as `More`, and it allows old first-paint tokens like `100vw - 12px` and 62px handle width to survive in critical CSS.

This task must close that gap by making the global sheet core contract truly shared across root, landing, and store, while preserving the intentional content-specific boundary of Store Discovery.

The final result must continue the original project goal:

- HTML fallback and semantic HTML remain intact.
- Registry-driven behavior remains intact.
- JSON-LD/schema/search discoverability remain intact.
- Accessibility remains first-class.
- Mobile-first native-app feel is preserved.
- Microcopy/icon/configuration remain easy to adjust.
- Centralized controller JavaScript remains source of behavior.
- Global sheet contract + context-aware adapters remain the model.
- Global style/CSS has one visual rhythm.
- Root `/`, landing `/landing`, and store `/store` remain stable.
- Public API, style tokens, controller behavior, QA, and CI/CD contracts remain standardized.
- No override code. No unused CSS/JS/HTML. No source ambiguity.

---

## Hard Constraint — Rewrite, Not Override/Patch

This task must be implemented as a source-level rewrite/refactor, not as an override layer.

Do **not** solve this task by:

- appending new CSS at the bottom to overpower old CSS;
- adding `!important` unless there is an existing project convention and no cleaner rewrite path;
- keeping stale Store `.gg-sheet__title`, `.gg-sheet__head`, `.gg-sheet__handle`, `.gg-sheet__panel`, `.gg-sheet__scrim`, or sheet-width logic active outside the shared generated sheet-core contract;
- masking Store title casing by adding a later selector instead of removing/replacing the local source of drift;
- patching `store.html` manually without reconciling the source file that generates it;
- patching generated/published assets while source files remain stale;
- allowing both old and new sheet-core contracts to coexist;
- creating per-surface one-off Store fixes that bypass the global component source-of-truth;
- leaving stale critical CSS tokens in `src/store/store.critical.css` or generated inline critical CSS;
- weakening, skipping, or deleting existing QA to make CI pass.

Required approach:

- Replace stale logic at its source.
- Make Store consume the shared `gg-sheet-core` component contract.
- Remove or neutralize obsolete Store sheet-core selectors after the global source is installed.
- Keep Store-specific differences as tokens or explicit content adapters only.
- Rebuild generated/published assets through the intended build path.
- Strengthen guards so this exact drift cannot return.

Acceptance principle:

> CI must pass because the architecture is correct, not because later code masks earlier code.

---

## Current Known Problems To Fix

### 1. Store sheet core is still local

Store currently has local sheet core styling that overrides or diverges from the shared component source.

Visible symptom:

- Root More title: `More`
- Landing More title: `More`
- Store More title: `M O R E` / uppercase letter-spaced

This means More may be globally generated, but its sheet head/title is still not globally owned on Store.

### 2. Store does not consume shared `gg-sheet-core`

`tools/sync-shared-css-components.mjs` must generate/sync the shared sheet core into Store as well, not only root and landing.

Expected shared component participation:

- Root consumes `gg-sheet-core`.
- Landing consumes `gg-sheet-core`.
- Store consumes `gg-sheet-core`.

Store may still consume its own Store-specific discovery/content styling, but core sheet primitives must be global.

### 3. Store critical CSS is stale

`src/store/store.critical.css` and generated inline critical CSS in `store.html` must not contain old sheet tokens such as:

```css
--gg-panel-handle-width: 62px;
--gg-panel-handle-height: 3px;
--gg-panel-width: min(calc(100vw - 12px), 600px);
```

These contradict the current contract:

- mobile sheet full-bleed;
- separate dock width and sheet width;
- thin visual handle with 44px hit target;
- global sheet core primitives.

### 4. Guard is currently too narrow

`gaga:verify-component-source` must check Store full CSS, Store critical CSS, and generated inline critical CSS in `store.html`.

The guard must not only prove that generated blocks exist. It must also prove that stale local Store sheet-core and stale critical tokens are gone.

---

## Scope

### In scope

1. Shared sheet core component source-of-truth.
2. Store consumption of shared sheet core.
3. Removal/reconciliation of Store-local sheet core drift.
4. Store critical CSS reconciliation.
5. Generated Store HTML critical CSS reconciliation.
6. Guard, QA, tools, and CI script updates.
7. Verification that root/landing/store More sheet visual rhythm is globally standardized.
8. Verification that root/landing Discovery remains shared, while Store Discovery remains content-specific by design.
9. Verification that Cloudflare/GitHub Actions deploy behavior remains preserved.

### Out of scope

Do not redesign:

- Blogger native comment engine;
- Store product IA/content model;
- JSON-LD payload semantics;
- route architecture;
- Worker route handling;
- schema generation;
- full visual redesign of preview cards;
- new features unrelated to sheet component source-of-truth.

---

## Required Architecture

### Component source layout

Use modular component source files as the authoritative source. The exact paths may follow the current repo convention, but the intended ownership is:

```txt
src/css/components/gg-sheet-core.css        = global sheet primitive source
src/css/components/gg-sheet-modal.css       = global modal/scrim/dock demotion source
src/css/components/gg-more-sheet.css        = global More component source
src/css/components/gg-discovery-sheet.css   = root/landing Discovery component source
```

The sync/build tooling must generate or insert these blocks into the relevant targets.

### Required consumption matrix

| Component | Root | Landing | Store |
|---|---:|---:|---:|
| `gg-sheet-core` | YES | YES | YES |
| `gg-sheet-modal` | YES | YES | YES |
| `gg-more-sheet` | YES | YES | YES |
| `gg-discovery-sheet` | YES | YES | NO, Store Discovery remains content-specific |

Store Discovery is content-specific, but it must still sit on top of the global sheet core/modal primitives.

---

## Implementation Requirements

### 1. Make Store consume shared `gg-sheet-core`

Update the component sync/build tooling so Store receives the same generated sheet core block as root and landing.

Expected outcome:

- `src/store/store.css` contains generated/shared `gg-sheet-core` block.
- Store no longer owns divergent core definitions for:
  - `.gg-sheet__head`
  - `.gg-sheet__title`
  - `.gg-sheet__handle`
  - `.gg-sheet__panel`
  - `.gg-sheet__scrim`
  - shared sheet width/height tokens
  - shared drag-zone tokens

If Store needs a Store-specific exception, express it as a token or a clearly scoped adapter that does not override global primitive behavior.

### 2. Remove Store-local title drift

Store utility sheet titles must use the same base style as root and landing.

Expected:

```txt
More
Discovery or Store Discovery, if intentionally worded
Comments, if present
```

Not expected:

```txt
M O R E
STORE DISCOVERY as a consequence of local uppercase CSS
```

Do not fix this by adding a later selector. Remove the local source of uppercase/letter-spacing drift from active Store sheet-core styling.

### 3. Reconcile Store critical CSS

Update `src/store/store.critical.css` so it reflects the current global sheet core tokens.

The critical CSS must not contain:

```txt
--gg-panel-handle-width: 62px
--gg-panel-handle-height: 3px
--gg-panel-width: min(calc(100vw - 12px), 600px)
--gg-panel-width: var(--gg-dock-width)
```

The critical CSS must contain the current conceptual contract, using repo-appropriate naming:

```css
--gg-dock-edge-gap: 10px;
--gg-sheet-edge-gap: 0px;
--gg-dock-width: min(calc(100dvw - (var(--gg-dock-edge-gap) * 2)), 600px);
--gg-panel-width: min(calc(100dvw - (var(--gg-sheet-edge-gap) * 2)), 600px);
--gg-sheet-handle-hit: 44px;
--gg-sheet-handle-visual-width: 30px;
--gg-sheet-handle-visual-height: 2.5px;
```

Use the existing project token names if they differ, but the semantics must match.

### 4. Rebuild Store HTML, do not patch it manually

`store.html` inline critical CSS must be regenerated from the corrected source path.

Manual edits to generated `store.html` are not acceptable unless the repo has no generator path and the task explicitly documents why. Preferred path:

```bash
npm run build
# or existing store/static build command used by the repo
```

### 5. Keep Store Discovery content-specific but shell-global

Store Discovery may keep:

- product/category/saved semantics;
- Store route list;
- thumbnails/placeholders;
- product-specific tabs/search microcopy;
- Store-specific content rows.

Store Discovery must not keep:

- independent sheet title casing system;
- independent core head/handle geometry;
- independent sheet width contract;
- independent modal/dock behavior;
- independent stale critical first-paint primitives.

### 6. Preserve More and root/landing Discovery component source-of-truth

Do not regress the previous task.

Root, landing, and store More must continue to consume shared `gg-more-sheet`.

Root and landing Discovery must continue to consume shared `gg-discovery-sheet`.

### 7. Clean duplicate/override-like CSS

Search the affected files and remove stale duplicate declarations rather than overriding them.

Pay attention to repeated padding, width, head, handle, title, and panel selectors such as:

```css
.gg-more-body { ... padding ... padding-top ... padding-bottom ... }
.gg-sheet__title { text-transform: uppercase; }
.gg-sheet__head { ... }
.gg-sheet__handle { ... }
```

There may be generated blocks and source blocks. Do not delete generated blocks blindly. Delete or rewrite stale manual drift outside the proper generated/source contract.

---

## Guard / QA Requirements

### Update or add guard

Strengthen `qa/component-source-contract-guard.mjs` or add a focused guard such as:

```txt
qa/sheet-core-source-contract-guard.mjs
```

The guard must verify all of the following.

#### Shared component generation

- Root contains generated/shared `gg-sheet-core` block.
- Landing contains generated/shared `gg-sheet-core` block.
- Store contains generated/shared `gg-sheet-core` block.
- Root, landing, and store contain shared `gg-sheet-modal` block.
- Root, landing, and store contain shared `gg-more-sheet` block.
- Root and landing contain shared `gg-discovery-sheet` block.
- Store does **not** consume root/landing `gg-discovery-sheet`; Store Discovery remains content-specific.

#### Store-local drift removal

Fail if active Store CSS outside generated shared core contains local divergent primitive selectors such as:

```txt
.gg-sheet__title with text-transform: uppercase
.gg-sheet__title with letter-spacing: .12em
.gg-sheet__head local geometry overriding generated core
.gg-sheet__handle local geometry overriding generated core
.gg-sheet__panel local width overriding generated core
```

The guard should not simply grep the whole file and fail on generated component source if generated source legitimately contains these words for comments or docs. It should distinguish active manual drift outside generated markers where possible.

#### Store critical CSS

Fail if `src/store/store.critical.css` contains:

```txt
100vw - 12px
--gg-panel-handle-width: 62px
--gg-panel-handle-height: 3px
--gg-panel-width: var(--gg-dock-width)
```

Fail if `store.html` inline critical CSS contains the same stale patterns.

#### Title style parity

Guard must detect that Store utility sheet title styling does not force uppercase/letter-spaced casing when root/landing do not.

At minimum, fail on active Store rule:

```css
.gg-sheet__title { text-transform: uppercase; }
```

unless that rule is part of an explicit, documented global source decision applied to all surfaces. The current desired direction is title case, not uppercase.

### Package scripts

Add/ensure npm scripts:

```json
{
  "gaga:verify-component-source": "node qa/component-source-contract-guard.mjs",
  "gaga:verify-sheet-core-source": "node qa/sheet-core-source-contract-guard.mjs"
}
```

If using only one guard, ensure `gaga:verify-component-source` covers all requirements above.

Ensure `ci:qa` includes the guard.

Ensure `ci:cloudflare` includes it directly or indirectly through `ci:qa`.

---

## Manual QA Requirements

Manual QA must not be skipped for root/store/landing sheet parity.

Run at least the following routes/surfaces:

```txt
/              root
/landing       landing
/store         store
```

If local static rendering cannot faithfully boot `index.xml`, use staging/live Blogger route and document the URL used.

Manual checks:

### Root More

- Title is `More`, not uppercase letter-spaced.
- Head height/handle match landing/store.
- Profile card top spacing matches landing/store.
- More bottom/search/share/copyright rhythm matches landing/store.

### Landing More

- Same as root.
- No landing-only bottom spacing drift.

### Store More

- Title is visually aligned with root/landing.
- No uppercase letter-spaced `MORE` unless the same global style is intentionally applied everywhere.
- Affiliate/store note may exist, but it must use a global slot/rhythm.

### Root/Landing Discovery

- Shared title/head/body/tab/search rhythm.
- Scroll behavior works.
- No visible desktop-style scrollbar on mobile.

### Store Discovery

- Store content remains Store-specific.
- Sheet head/title/handle/width/modal behavior matches global core.
- Store Discovery is not accidentally converted into root/landing Discovery.

### Critical first paint

- Store sheet full-bleed width appears correct before full CSS hydration.
- No first-paint horizontal gap caused by stale `100vw - 12px` critical CSS.
- No first-paint 62px handle visual width.

---

## Required Proof Commands

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
npm run ci:qa
npm run ci:cloudflare
git diff --check
npm run deploy:cloudflare:dry
```

If a command does not exist before implementation, add it or explain why the existing equivalent command was used.

If `deploy:cloudflare:dry` fails because of the known local Wrangler/esbuild macOS `_SecTrustCopyCertificateChain` issue, classify it as environment failure only after build/preflight and all source guards pass.

---

## GitHub Actions / Cloudflare CI-CD Reconciliation

Inspect:

```txt
.github/workflows/*.yml
package.json
wrangler.jsonc
tools/cloudflare-prepare.mjs
tools/cloudflare-deploy.mjs
```

Preserve:

- Cloudflare route behavior.
- `assets.run_worker_first = true` if currently required by the repo.
- Worker route/asset behavior.
- Store static build/check flow.
- Existing SEO/schema/robots behavior.

Update workflows only if needed so the new component/source guard runs in CI.

Report:

```txt
GitHub Actions workflow inspected: YES/NO
GitHub Actions workflow updated: YES/NO/NOT REQUIRED
Cloudflare deploy behavior preserved: YES/NO
wrangler.jsonc route/asset behavior preserved: YES/NO
```

If `.github/workflows` is not present in the local archive, say so explicitly instead of claiming it was inspected.

---

## Files Likely To Touch

Likely:

```txt
src/css/components/gg-sheet-core.css
src/css/components/gg-sheet-modal.css
src/css/components/gg-more-sheet.css
src/css/components/gg-discovery-sheet.css
tools/sync-shared-css-components.mjs
src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css
landing.html
src/store/store.css
assets/store/store.css
src/store/store.critical.css
store.html
qa/component-source-contract-guard.mjs
qa/sheet-core-source-contract-guard.mjs
package.json
.github/workflows/*.yml
```

Do not touch unrelated application logic unless necessary for guard/build integration.

---

## Acceptance Criteria

The task is complete only if all are true:

- Store consumes shared `gg-sheet-core` source.
- Root, landing, and store sheet titles use the same global base title style.
- Store More no longer renders uppercase letter-spaced because of local Store sheet-core CSS.
- Store critical CSS no longer contains stale `100vw - 12px` or 62px handle tokens.
- Generated `store.html` inline critical CSS no longer contains stale patterns.
- More sheet remains shared across root/landing/store.
- Root/landing Discovery remains shared.
- Store Discovery remains content-specific but uses global shell/core/modal primitives.
- No override-only CSS/JS added.
- Duplicate/manual drift CSS removed or rewritten at source.
- Guard fails if the old Store title/critical CSS drift returns.
- `ci:qa` and `ci:cloudflare` include the new guard path.
- Manual QA is run and reported for root, landing, and store.
- No regression to HTML fallback, semantic structure, schema/JSON-LD, accessibility, mobile-first behavior, or Cloudflare deploy routing.

---

## Final Report Format

Use this exact report structure:

```txt
TASK-SHEET-CORE-SOT-STORE-CRITICAL-FIX completed.

Changed:
- Store consumes shared gg-sheet-core: YES/NO
- Store-local sheet title drift removed: YES/NO
- Root/Landing/Store sheet title style aligned: YES/NO
- Store critical CSS reconciled: YES/NO
- store.html inline critical CSS rebuilt/reconciled: YES/NO
- More sheet source-of-truth preserved: YES/NO
- Root/Landing Discovery source-of-truth preserved: YES/NO
- Store Discovery content-specific boundary preserved: YES/NO
- Duplicate/override-like Store sheet core CSS removed: YES/NO
- Component/source guard strengthened: YES/NO
- Store critical CSS guard added: YES/NO
- CI scripts updated/reconciled: YES/NO
- GitHub Actions workflow inspected: YES/NO
- Cloudflare deploy behavior preserved: YES/NO
- No override-only CSS/JS added: YES/NO

Proof:
- npm run build: PASS/FAIL
- npm run store:check:ci: PASS/FAIL
- npm run store:check:dev10: PASS/FAIL
- npm run gaga:verify-preview-sheet: PASS/FAIL
- npm run gaga:verify-sheet-contract: PASS/FAIL
- npm run gaga:verify-shell: PASS/FAIL
- npm run gaga:verify-sheet-lifecycle: PASS/FAIL
- npm run gaga:verify-component-source: PASS/FAIL
- npm run gaga:verify-sheet-core-source: PASS/FAIL/NOT APPLICABLE
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
- npm run deploy:cloudflare:dry: PASS/FAIL/ENVIRONMENT FAILURE

Manual QA:
- Root More title/head/body/bottom parity: PASS/FAIL/NOT RUN
- Landing More title/head/body/bottom parity: PASS/FAIL/NOT RUN
- Store More title/head/body/bottom parity: PASS/FAIL/NOT RUN
- Root/Landing Discovery parity: PASS/FAIL/NOT RUN
- Store Discovery shell-global/content-specific boundary: PASS/FAIL/NOT RUN
- Store critical first paint full-bleed/handle check: PASS/FAIL/NOT RUN

Notes:
- ...
```
