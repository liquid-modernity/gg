# TASK-VISUAL-SYSTEM-CONTRACT-FREEZE

## Status

Blocking corrective architecture task after:

- `TASK-SHEET-MODAL-VISUAL-PARITY-HARDENING`
- `TASK-SHEET-COMPONENT-SOURCE-OF-TRUTH`
- `TASK-SHEET-CORE-SOT-STORE-CRITICAL-FIX`

This task exists because previous tasks made the repo appear green while visual/runtime drift still survived across `/`, `/landing`, and `/store`.

## Main Objective

Freeze the global visual system for sheets and related modal surfaces so the project finally moves from “locally patched parity” to a real component/design-system source of truth.

The final result must support the original direction:

- HTML fallback
- semantic HTML
- registry-driven rendering/configuration
- JSON-LD/schema readiness
- accessibility
- mobile-first behavior
- native-app feel
- easy microcopy/icon/configuration adjustment
- centralized controller JavaScript/source of behavior
- global sheet contract with context-aware surface adapters
- one global visual rhythm
- AI-code-agent friendly source layout
- stable behavior across `/`, `/landing`, and `/store`
- standardized public API/style/class contract
- no override code
- no unused CSS/JS/HTML
- CI/CD guard reconciliation for GitHub Actions and Cloudflare deployment

This is a **rewrite/refactor task**, not a visual patch task.

---

## Current Known Failures / Findings to Fix

### 1. Store Preview height/frame is broken

Root preview is visually closer to correct. Store preview still has store-specific frame/height logic and can render with wrong height.

Fix by creating one global preview frame contract consumed by root and store, with article/product content adapters.

### 2. Landing Discovery is not global with Root Discovery

Root Discovery is the canonical version. Landing still visually drifts and may still rely on legacy class/markup patterns.

Fix by migrating Landing Discovery to the same canonical component contract as Root Discovery.

### 3. Store Discovery is allowed to be content-specific, but its shell must be global

Store Discovery may keep product/category/saved-specific content. However, its sheet head, modal frame, footer/control rhythm, tabs, input, scroll behavior, dark/light tones, and spacing must consume global shell tokens.

### 4. Light/Dark theme visual rhythm is not globally consistent

Root, Landing, and Store must use the same global theme tokens for:

- background
- sheet surface
- cards
- border/hairline
- muted text
- active row
- tab state
- input state
- dock demotion
- scrim
- dark-mode row/list contrast

No surface may keep its own separate dark/light palette unless explicitly tokenized as a context adapter.

### 5. Critical CSS and inline artifacts must not be stale

Full CSS being correct is not enough. Critical CSS and `store.html` inline critical CSS must match the global token contract.

Guards must inspect both source CSS and generated/inline artifacts.

### 6. Guard/QA currently passes while visual drift remains

The new guard must fail on the actual drift patterns that previously slipped through.

---

# HARD CONSTRAINT — REWRITE, NOT OVERRIDE/PATCH

Do not solve this task by adding another layer of CSS/JS override.

## Forbidden

Do not:

- append new CSS at the bottom merely to overpower old CSS;
- use `!important` except when preserving an existing project convention and documented in the task report;
- leave old active selectors in place and mask them with more specific selectors;
- maintain two active class contracts for the same component;
- keep Landing Discovery on legacy class hooks while Root uses canonical hooks;
- keep Store Preview on store-specific frame/height rules;
- keep Store Discovery shell fully separate when only the content body is store-specific;
- patch generated artifacts without reconciling the source component;
- manually edit `store.html` inline critical CSS without updating the source/build path;
- let `ci:qa` pass while source/critical/inline artifacts disagree;
- add unused compatibility CSS “just in case.”

## Required

Do:

- replace stale source logic at its origin;
- delete or archive obsolete active selectors/classes where safe;
- keep compatibility aliases only if they are transitional, documented, and not the primary active path;
- use shared component sources as the single source of truth;
- regenerate surfaces/artifacts from shared sources;
- make Root/Landing/Store consume the same global primitives;
- preserve only context-aware adapters where the content model genuinely differs;
- strengthen guards so the same drift cannot reappear.

---

# Required Architecture

## A. Global Visual Token Source

Create or finalize one modular source for global visual tokens, for example:

```txt
src/css/components/gg-visual-tokens.css
```

It must define global tokens for:

```css
--gg-color-bg
--gg-color-surface
--gg-color-surface-elevated
--gg-color-text
--gg-color-muted
--gg-color-hairline
--gg-color-active-row
--gg-color-scrim

--gg-sheet-edge-gap
--gg-dock-edge-gap
--gg-panel-width
--gg-dock-width

--gg-sheet-head-height
--gg-sheet-handle-hit
--gg-sheet-handle-visual-width
--gg-sheet-handle-visual-height

--gg-sheet-radius
--gg-sheet-max-height
--gg-sheet-utility-max-height
--gg-sheet-content-max-height

--gg-discovery-control-height
--gg-discovery-row-min-height
--gg-discovery-input-height

--gg-preview-panel-initial-height
--gg-preview-panel-max-height
--gg-preview-hero-height
--gg-preview-hero-aspect
--gg-preview-content-lift
```

Light and dark modes must be defined through the same token system.

Surface-specific values are allowed only as named adapter tokens, not arbitrary local CSS.

---

## B. Global Sheet Core Contract

The global sheet core must remain the source for:

- `.gg-sheet`
- `.gg-sheet__scrim`
- `.gg-sheet__panel`
- `.gg-sheet__head`
- `.gg-sheet__title`
- `.gg-sheet__handle`
- `[data-gg-drag-zone]`
- `[data-gg-panel-active]` dock demotion
- full-bleed mobile sheet width
- max-height/min-height policy
- light/dark surface tones

Root, Landing, and Store must all consume this core. Store must not keep a local `.gg-sheet__title`/`.gg-sheet__head`/`.gg-sheet__panel` fork that changes global visual rhythm.

---

## C. Global Preview Frame Contract

Create/finalize a global preview frame component, for example:

```txt
src/css/components/gg-preview-frame.css
```

Root article preview and Store product preview must share the same frame primitives:

```txt
preview sheet edge behavior
preview panel initial height
preview panel max height
hero image height/aspect/crop
overlay gradient
content-card lift
bottom affordance/footer handle zone
dock demotion behavior
scrim behavior
```

Allowed differences:

- article metadata vs product metadata;
- article CTA vs commerce CTA;
- product price/marketplace actions;
- product carousel dots, as long as they are not handle/drag affordances.

Forbidden active drift:

```txt
--store-preview-initial-height as the primary frame token
.store-preview-sheet .gg-sheet__panel using independent min/max height
root preview and store preview using unrelated hero dimensions
store carousel dots visually acting like the drag handle
```

The top-edge preview visible drag/close affordance belongs at the bottom footer/affordance area.

---

## D. Root/Landing Discovery Canonicalization

Root Discovery is the canonical component contract. Landing must migrate to the same markup/class schema.

Canonical structure:

```html
<div class="gg-discovery">
  <header class="gg-sheet__head" data-gg-drag-zone="sheet-head">
    <button class="gg-sheet__handle" data-gg-drag-handle="command" ...></button>
    <h2 class="gg-sheet__title">Discovery</h2>
  </header>

  <div class="gg-discovery__body" data-gg-scroll-container>
    <section class="gg-discovery-view gg-discovery-view--results">
      <div class="gg-discovery-results"></div>
    </section>
  </div>

  <footer class="gg-discovery__controls">
    <div class="gg-discovery-tabs" role="tablist">
      <button class="gg-discovery-tab">All</button>
      <button class="gg-discovery-tab">Articles</button>
      <button class="gg-discovery-tab">Topics</button>
      <button class="gg-discovery-tab">Saved</button>
    </div>

    <div class="gg-discovery-search">
      <input class="gg-discovery-search__field" />
    </div>
  </footer>
</div>
```

Landing must not rely on legacy hooks as the active primary structure:

```txt
.gg-discovery-body
.gg-discovery-command
.gg-discovery-filters
.gg-control
.gg-field
.gg-results
```

If any of these remain for compatibility, they must be clearly marked as transitional and not carry primary styling.

---

## E. Store Discovery Boundary

Store Discovery remains content-specific by design, but only the content/body rows may be store-specific.

Store must consume global shell/tokens for:

- sheet head/title/handle
- panel width/height/radius
- discovery footer/control rhythm
- tabs
- search input
- scroll container behavior
- light/dark tone
- hairlines
- dock demotion
- drag zone

Store-specific content is allowed inside an adapter area, for example:

```html
<div class="gg-discovery store-discovery">
  ...
  <div class="gg-discovery__body store-discovery__body">
    <!-- store category/product/saved rows -->
  </div>
  <footer class="gg-discovery__controls store-discovery__controls">
    ...
  </footer>
</div>
```

The title may be `Store Discovery` if desired, but it must use the same title style as other sheets. No all-caps/letter-spaced local title fork.

---

## F. More Sheet Preservation

The global More component from the previous task must remain intact.

Root, Landing, and Store must keep using the same:

- `.gg-more-sheet`
- `.gg-more-body`
- `.gg-more-bottom`
- `.gg-more-footer`
- `.gg-more-profile`
- profile card geometry
- section headings
- local search
- share buttons
- copyright/notes rhythm

Store-specific affiliate/commercial note may remain content-specific but must use the global bottom/footer rhythm.

---

## G. Critical CSS and Inline Artifact Parity

The guard must inspect all active source/generated layers:

```txt
src/css/components/*.css
src/css/gg-app.source.css
__gg/assets/css/gg-app.dev.css
landing.html inline generated CSS blocks
src/store/store.css
assets/store/store.css
src/store/store.critical.css
store.html inline critical CSS
store.html store full/critical style blocks
```

Hard fail if active source or generated/inline artifacts contain stale visual tokens/patterns such as:

```txt
--gg-panel-handle-width: 62px
--gg-panel-handle-height: 3px
--gg-panel-width: min(calc(100vw - 12px), 600px)
--gg-panel-width: var(--gg-dock-width)
--store-preview-initial-height as primary frame source
.store-preview-sheet .gg-sheet__panel with independent min/max height
.gg-sheet__title { text-transform: uppercase; } outside an intentional non-sheet context
legacy Landing Discovery hooks as primary active structure
```

---

# Required Tools / Build Updates

Update or create the component sync tool as needed, likely:

```txt
tools/sync-shared-css-components.mjs
```

It must generate or synchronize:

```txt
gg-visual-tokens
gg-sheet-core
gg-sheet-modal
gg-preview-frame
gg-more-sheet
gg-discovery-shell
```

into the correct targets:

```txt
src/css/gg-app.source.css
landing.html inline generated CSS blocks
src/store/store.css
src/store/store.critical.css where critical tokens are required
store.html inline critical CSS through build output
```

Generated blocks must have balanced markers:

```txt
/* BEGIN GENERATED: component-name */
/* END GENERATED: component-name */
```

Do not leave manually edited generated blocks.

---

# Required Guards / QA Scripts

Add or strengthen:

```txt
qa/visual-system-contract-guard.mjs
qa/component-source-contract-guard.mjs
qa/sheet-lifecycle-contract-guard.mjs
```

Add npm script:

```json
"gaga:verify-visual-system": "node qa/visual-system-contract-guard.mjs"
```

Ensure:

```txt
npm run ci:qa
npm run ci:cloudflare
```

include the new visual-system guard directly or indirectly.

## Guard must verify

1. Root/Landing/Store consume global sheet core.
2. Store critical CSS and `store.html` inline critical CSS do not contain stale width/handle tokens.
3. Root and Store preview consume global preview-frame component.
4. Store Preview does not use independent height/frame rules.
5. Landing Discovery uses canonical Root Discovery structure.
6. Landing does not rely on legacy discovery hooks as active primary styling.
7. Store Discovery consumes global discovery shell tokens while keeping store-specific content adapter.
8. Light/dark tokens are shared, not separately redefined by surface.
9. More global component remains synchronized across Root/Landing/Store.
10. Generated markers are balanced.
11. No override-only CSS blocks added.
12. No unused compatibility blocks introduced without explicit comment and guard exemption.

---

# Manual Visual QA Matrix

Manual browser QA is mandatory. `NOT RUN` is a task failure.

If `index.xml` cannot boot faithfully as static HTML, run Root QA on live/staging Blogger pages.

## Required screenshots/proof

Run in **light and dark mode**:

### Root `/`

- More sheet
- Discovery sheet
- Article preview sheet
- Comments main sheet
- Comment replies sheet if accessible

### Landing `/landing`

- More sheet
- Discovery sheet

### Store `/store`

- More sheet
- Store Discovery sheet
- Product preview sheet

## Required checks

For each checked sheet:

```txt
full-bleed mobile width
same sheet head height/rhythm
same title style
same handle visual
same drag zone behavior
same dock demotion behavior
same light/dark palette family
same footer/control rhythm where globally shared
scroll reset still works
no visible desktop scrollbar on mobile
focus state is accessible but not visually crude
```

For preview:

```txt
root preview height/frame correct
store preview height/frame correct
hero aspect/crop aligned
content-card lift aligned
footer handle zone aligned
dock demotion aligned
```

For Discovery:

```txt
Root and Landing Discovery are visually identical except data/content.
Store Discovery shell feels from the same family; only rows/content differ.
```

---

# Acceptance Criteria

The task is complete only when:

```txt
npm run build: PASS
npm run store:check:ci: PASS
npm run store:check:dev10: PASS
npm run gaga:verify-preview-sheet: PASS
npm run gaga:verify-sheet-contract: PASS
npm run gaga:verify-shell: PASS
npm run gaga:verify-sheet-lifecycle: PASS
npm run gaga:verify-component-source: PASS
npm run gaga:verify-sheet-core-source: PASS
npm run gaga:verify-visual-system: PASS
npm run ci:qa: PASS
npm run ci:cloudflare: PASS
git diff --check: PASS
```

`npm run deploy:cloudflare:dry` may fail only for the known local Wrangler/esbuild `_SecTrustCopyCertificateChain` environment issue after build/preflight/prepare complete. Any source/build/preflight failure is not acceptable.

Manual QA must not show `NOT RUN` for the required matrix above.

---

# Required Final Report Format

The implementer must report exactly:

```txt
TASK-VISUAL-SYSTEM-CONTRACT-FREEZE completed.

Changed:
- Global visual token source created/reconciled: YES/NO
- Global sheet core preserved across Root/Landing/Store: YES/NO
- Global preview frame added and consumed by Root/Store: YES/NO
- Store preview height/frame fixed: YES/NO
- Landing Discovery canonicalized to Root contract: YES/NO
- Legacy Landing Discovery active hooks removed/neutralized: YES/NO
- Store Discovery shell uses global discovery tokens: YES/NO
- Store Discovery content-specific boundary preserved: YES/NO
- More global component preserved: YES/NO
- Light/dark theme tokens reconciled globally: YES/NO
- Store critical CSS reconciled: YES/NO
- store.html inline critical CSS rebuilt/reconciled: YES/NO
- Generated markers added/balanced: YES/NO
- No override-only CSS/JS added: YES/NO
- Visual system guard added/strengthened: YES/NO
- CI scripts updated/reconciled: YES/NO
- GitHub Actions workflow inspected: YES/NO
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
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
- npm run deploy:cloudflare:dry: PASS/FAIL/ENVIRONMENT FAILURE

Manual QA:
- Root More light/dark: PASS/FAIL
- Root Discovery light/dark: PASS/FAIL
- Root Preview light/dark: PASS/FAIL
- Root Comments light/dark: PASS/FAIL
- Landing More light/dark: PASS/FAIL
- Landing Discovery light/dark: PASS/FAIL
- Store More light/dark: PASS/FAIL
- Store Discovery light/dark: PASS/FAIL
- Store Preview light/dark: PASS/FAIL
- Dock demotion global light/dark: PASS/FAIL
- Mobile full-bleed sheets global: PASS/FAIL
- Visual screenshots attached or documented: YES/NO

Notes:
- Any NOT RUN manual QA must be treated as task failure, not success.
```

---

# Strategic Reminder

This task is not about making screenshots “look close enough.”

It is about making the repository structurally incapable of drifting again.

If the final code gets larger because old selectors remain and new selectors are layered above them, the task failed.

If CI passes but Root/Landing/Store still feel like three design systems, the task failed.

If the Store preview height is fixed by local Store CSS instead of a global preview frame contract, the task failed.

If Landing Discovery is made to look like Root through alias CSS while keeping legacy structure, the task failed.

Rewrite the source contract. Do not patch symptoms.
