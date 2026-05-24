# TASK-SHEET-MODAL-VISUAL-PARITY-HARDENING

## Context

The previous sheet lifecycle and visual parity work improved the architecture, but runtime/manual QA still shows modal sheet UX drift across `/`, `/landing`, and `/store`.

This task is a **source-level hardening/refactor**, not an override patch. The goal is to make the dock sheets and preview sheets feel like one native-app system while keeping accessibility, SEO, performance, and Cloudflare/GitHub CI behavior intact.

This task must fix the remaining issues found after `TASK-SHEET-RUNTIME-VISUAL-PARITY-FIX`:

- Sheet heads and visible handlers are still visually too thick/heavy.
- Top-edge preview affordance must be at the bottom, not visually confused with store carousel dots.
- Store preview dots must not look or behave like a sheet drag handle.
- Root and store preview media/thumbnail aspect ratio and initial frame still do not feel aligned.
- Root preview and store preview differ in dock behavior.
- Modal sheet active state should not necessarily hide the dock, but the dock must be visually demoted and interaction-inert.
- Landing More profile card spacing is not aligned with root/store More sheets.
- Mobile sheet width must be full-bleed: no left/right viewport gap for sheets on mobile.
- Dock may remain floating with side gap, but sheet width and dock width must be separated.
- Drag-to-close must not be limited to the tiny handle mark. The visible handle is only an affordance icon; the actual drag zone must be expanded.
- Root scrim open-state must be audited and fixed if still empty/missing opacity.
- Guards must be strengthened so these regressions cannot pass again.

---

## Hard Rule: Rewrite, Not Override

Implement this as a source-level rewrite/refactor.

Do **not** solve by:

- appending override CSS at the bottom to beat older CSS;
- using `!important` unless already required by an existing project convention and no cleaner rewrite is possible;
- creating duplicate handlers while leaving the old handlers active;
- adding more specific selectors only to overpower stale selectors;
- patching generated/published assets without reconciling source files;
- creating per-surface one-off visual hacks that bypass global tokens;
- coupling sheet width to dock width again;
- hiding dock on one surface and showing it on another as a shortcut;
- treating carousel dots as drag handles;
- binding drag-to-close only to a tiny visible handle.

Required approach:

- Replace stale logic/tokens at source.
- Keep root, landing, and store on the same sheet/dock/handle contract.
- Keep surface differences only as explicit adapters, not hidden one-off CSS/JS behavior.
- Keep visual handle size and actual gesture target separate.
- Keep dock visible if desired, but inert and visually demoted while modal sheets are active.
- Sync source CSS and generated/published CSS through the intended build direction.

---

## Scope

### Surfaces

Must cover all three primary surfaces:

- Root/blog listing: `/` / `index.xml`
- Landing: `/landing` / `landing.html`
- Store: `/store` / `store.html` and store source assets

### Sheet families

Must cover:

- `preview` top-edge sheet on root and store;
- `more` sheet on root, landing, and store;
- `command` / `discovery` sheet on root and landing;
- `discovery` / `saved` sheet on store;
- `comments` and `comment-replies` sheet head/handle visual contract on root detail where applicable.

Do not change Blogger native comment engine behavior.

---

## Required Changes

## 1. Compact global sheet head and visual handle

Current sheet heads still feel too heavy. The 44px hit target is correct, but the visual head must feel thinner and more native.

### Requirement

Create/normalize global tokens across root, landing, and store:

```css
--gg-sheet-head-height: 44px; /* 44–48px acceptable only if consistent */
--gg-sheet-handle-hit: 44px;
--gg-sheet-handle-visual-width: 30px;
--gg-sheet-handle-visual-height: 2.5px;
--gg-sheet-handle-top: 6px;
```

The visible handle must be subtle and thin. The hit target remains 44px.

The 44px hit target must **not** make the header visually bloated. Use absolute positioning or an equivalent source-level structure so the handle target does not consume an oversized visual row.

### Acceptance

- Discovery, More, Comments, Preview footer affordance, root, landing, and store all use the same visual-handle rhythm.
- Visible handle looks like a thin native-app affordance, not a thick button row.
- Hit target remains at least 44px.
- No active source uses a 10px actual hit target for the sheet handle.

---

## 2. Expand drag-to-close target beyond visible handle

The visible handler is only a symbol/icon. Users must not have to grab the tiny visual line.

### Bottom sheets

For bottom sheets such as `More`, `Discovery`, `Saved`, `Comments`, and `Replies`:

- The visible handle remains small.
- The full sheet head must be a drag zone.
- Drag-to-close may start from the full head area.
- Tap/click on the full head must **not** close the sheet unless a drag threshold is crossed.
- Explicit click/tap-to-close remains limited to the handle/dismiss control or explicit close button.

Recommended markup contract:

```html
<header class="gg-sheet__head" data-gg-drag-zone="sheet-head">
  <button class="gg-sheet__handle" data-gg-drag-handle="more" aria-label="Close More"></button>
  <h2>More</h2>
</header>
```

### Top-edge preview sheets

For top-edge preview sheets on root/store:

- The visible drag/close affordance belongs at the bottom footer/affordance area.
- The full bottom footer/affordance area must be a drag zone.
- Drag-to-close may start from the full footer area.
- Tap/click on the footer area must not close unless it is on the explicit handle/dismiss control, or unless a drag threshold is crossed.
- Carousel dots, media, and preview content must not start preview drag-to-close.

Recommended markup contract:

```html
<footer class="gg-preview__footer" data-gg-drag-zone="preview-affordance">
  <button class="gg-sheet__handle gg-preview__handle" data-gg-drag-handle="preview" aria-label="Close preview"></button>
</footer>
```

### Gesture rules

Pointer/touch logic must distinguish tap vs drag:

- `pointerdown` on drag zone begins a drag candidate.
- Movement below threshold does nothing.
- Movement beyond threshold in the allowed close direction starts drag.
- Release beyond close threshold closes the sheet.
- Release below close threshold snaps the sheet back.
- Tap/click on drag zone but not on explicit handle/dismiss control does not close.
- Interactive elements inside the head must still work and must not be hijacked.

### Acceptance

- Drag-to-close is no longer limited to `[data-gg-drag-handle]` only.
- Bottom sheets expose a head-level drag zone.
- Top-edge preview exposes a footer-level drag zone.
- Store carousel dots do not trigger drag-to-close.
- Head tap does not accidentally close the sheet.

---

## 3. Store preview dots must not look or behave like a sheet handler

Store preview carousel dots are currently visually confusing because they appear as a centered top pill, similar to a handler.

### Requirement

`store-preview__dots` must be visually and behaviorally distinct from `gg-sheet__handle store-preview__handle`.

Hard constraints:

- `store-preview__dots` must never include `gg-sheet__handle`.
- `store-preview__dots` must never include `data-gg-drag-handle`.
- `store-preview__dots` must never include `data-gg-drag-zone`.
- `store-preview__dots` must not sit as a centered top pill that resembles a sheet handler.
- `store-preview__handle` remains the only explicit preview drag/close affordance.
- For top-edge preview sheets, the visible drag/close affordance belongs at the bottom footer.

Suggested visual direction:

```css
.store-preview__dots {
  left: auto;
  right: 14px;
  top: max(14px, env(safe-area-inset-top));
  transform: none;
  padding: 0;
  background: transparent;
  backdrop-filter: none;
}

.store-preview__dot {
  width: 18px;
  height: 18px;
}

.store-preview__dot::before {
  width: 4px;
  height: 4px;
}

.store-preview__dot[aria-pressed='true']::before {
  width: 8px;
}
```

Alternative is acceptable if it clearly reads as carousel pagination, not a drag handle.

---

## 4. Mobile sheet width must be full-bleed; dock may remain floating

Current tokens still allow sheet mobile to have left/right viewport gaps. This is wrong for the desired native modal feel.

### Requirement

Separate dock width tokens from sheet width tokens.

Recommended token model:

```css
:root {
  --gg-dock-edge-gap: 10px;
  --gg-sheet-edge-gap: 0px;

  --gg-dock-width: min(calc(100dvw - (var(--gg-dock-edge-gap) * 2)), 600px);
  --gg-panel-width: min(calc(100dvw - (var(--gg-sheet-edge-gap) * 2)), 600px);
}

@media (min-width: 720px) {
  :root {
    --gg-sheet-edge-gap: 10px;
  }
}
```

### Acceptance

- On mobile, bottom sheets and top preview sheets are full-bleed horizontally: no left/right viewport gap.
- Dock can keep a floating capsule gap.
- `--gg-panel-width` must not equal `--gg-dock-width` by default.
- Remove active hardcoded variants such as:
  - `--gg-panel-width: var(--gg-dock-width)`
  - `min(calc(100vw - 12px), 600px)`
  - `min(calc(100vw - 20px), 600px)` for sheet width on mobile
- Root, landing, and store must use the same sheet-width contract.
- Store critical/generated artifacts must not keep stale `100vw - 12px` behavior.

---

## 5. Modal dock demotion instead of inconsistent hide/show behavior

Root preview currently leaves dock active/visible while store preview hides it. The desired behavior is neither inconsistent hiding nor active dock.

### Requirement

When any modal sheet is active, the dock may remain visible, but it must be visually demoted and interaction-inert.

Dock demotion means:

- visually blurred, dimmed, lowered, or otherwise demoted;
- no pointer/click interaction;
- no keyboard focus;
- not above the modal/scrim layer;
- consistent across root, landing, and store;
- consistent for preview, more, discovery/command, saved, comments/replies.

Suggested CSS:

```css
body[data-gg-panel-active='true'] .gg-dock {
  opacity: .42;
  transform: translate3d(-50%, 4px, 0) scale(.985);
  pointer-events: none;
  user-select: none;
}

.gg-dock::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(245, 242, 234, .48);
  backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease;
}

body[data-gg-panel-active='true'] .gg-dock::after {
  opacity: 1;
}
```

Dark-mode equivalent must be added if dark theme exists.

### JS/accessibility requirement

CSS is not enough. When a modal sheet is active:

```js
function setDockInert(isPanelActive) {
  const dock = document.querySelector('.gg-dock');
  if (!dock) return;

  if (isPanelActive) {
    dock.setAttribute('aria-hidden', 'true');
    dock.setAttribute('inert', '');
  } else {
    dock.removeAttribute('aria-hidden');
    dock.removeAttribute('inert');
  }
}
```

Use existing project patterns if a better inert/focus utility already exists.

### Z-index contract

The modal layering must effectively be:

```txt
page content
inactive/demoted dock
scrim
sheet panel
```

### Acceptance

- Root preview and store preview use the same dock demotion behavior.
- No surface hides dock while another leaves it active for the same modal class.
- Dock is not clickable while any modal sheet is active.
- Dock is not keyboard-focusable while any modal sheet is active.
- Dock visual demotion does not harm performance; prefer overlay blur if direct `filter: blur()` is too expensive.

---

## 6. Root and store preview media parity

Root and store preview still do not feel aligned in thumbnail/hero aspect ratio and panel initial frame.

### Requirement

Create a shared preview media/frame contract.

Recommended tokens:

```css
--gg-preview-panel-initial-height: min(72dvh, 720px);
--gg-preview-hero-height: clamp(360px, 58dvh, 540px);
--gg-preview-hero-aspect: 4 / 5;
--gg-preview-media-fit: cover;
--gg-preview-overlay-lift: clamp(108px, 18vw, 148px);
```

Root and store preview sheets must use equivalent tokens for:

- preview panel initial height;
- hero/media frame height;
- image fit;
- overlay lift;
- border radius / surface rhythm;
- footer handle affordance.

Store may keep carousel functionality, but it cannot change the perceived preview media rhythm enough to break parity.

### Acceptance

- Root article preview and store product preview feel like the same component family.
- Root and store preview no longer differ because one relies on panel min-height while the other uses separate store-specific initial height.
- Guard checks actual shared token usage, not only the presence of one token string.

---

## 7. Landing More profile card spacing parity

Landing More profile card is too close to the sheet head compared with root/store.

### Requirement

Normalize More sheet top body spacing across root, landing, and store.

Recommended token:

```css
--gg-more-body-pad-top: 18px;
```

Use it consistently:

```css
.gg-more-body {
  padding-top: var(--gg-more-body-pad-top);
}
```

Avoid using `display: contents` in More body if it causes wrapper spacing/rhythm to be lost. If `display: contents` is required, spacing must still be explicitly preserved through a stable wrapper or equivalent source-level layout.

### Acceptance

- Landing More profile card has the same head-to-card breathing room as root and store.
- Root/store spacing must not regress.
- No per-surface magic number unless expressed through a shared token with explicit adapter rationale.

---

## 8. Root scrim open-state audit and fix

Previous audit found root CSS may contain an empty open-state scrim block.

### Requirement

Ensure root, landing, and store all apply visible scrim state consistently when modal sheets are opening/open/dragging.

Required behavior:

```css
.gg-sheet[data-gg-state='opening'] .gg-sheet__scrim,
.gg-sheet[data-gg-state='open'] .gg-sheet__scrim,
.gg-sheet[data-gg-state='dragging'] .gg-sheet__scrim {
  opacity: 1;
}
```

Use existing token values for opacity if present, but the open-state block must not be empty.

### Acceptance

- Root preview no longer feels like a non-modal floating panel.
- Scrim behavior is consistent across root, landing, and store.
- Guard fails if any open-state scrim selector block is empty or lacks opacity/visibility activation.

---

## 9. Clean duplicate/override-like CSS declarations

Previous source contains duplicate declarations such as repeated padding and source lines that look like override residue.

### Requirement

While touching sheet/dock/more/preview CSS, clean duplicate declarations in affected blocks.

Examples to remove/refactor if still present:

- repeated `padding` followed by another `padding` in same block;
- repeated `padding-top`/`padding-bottom` that merely overrides prior shorthand;
- malformed/minified source fragments such as `scrollbar-width: none;padding: ...` in source CSS;
- source/asset drift around panel width, dock width, sheet head, handle, preview media.

### Acceptance

- Affected CSS blocks read as intentional source, not override residue.
- `npm run gaga:verify-sheet-contract` remains PASS.
- `git diff --check` remains PASS.

---

## 10. Strengthen QA/guard coverage

The current guard passes despite visible/runtime UX issues. Strengthen `qa/sheet-lifecycle-contract-guard.mjs` or add a dedicated guard if cleaner.

### Guard must fail on these regressions

#### Width contract

- `--gg-panel-width: var(--gg-dock-width)`
- active source/generated artifact with `min(calc(100vw - 12px), 600px)` for sheet width
- active source/generated artifact with `min(calc(100vw - 20px), 600px)` for sheet width on mobile
- lack of separate `--gg-dock-edge-gap` and `--gg-sheet-edge-gap`

#### Dock demotion

- `body[data-gg-panel-active='true'] .gg-dock` missing pointer disable or visual demotion
- root/store/landing using different hide/show semantics for active modal sheets without shared demotion rule
- dock remaining focusable/clickable while panel active

#### Drag-zone contract

- drag/close binding only exists on `[data-gg-drag-handle]`
- bottom sheets lack `data-gg-drag-zone` on `.gg-sheet__head` or equivalent head zone
- top preview lacks `data-gg-drag-zone` on footer/affordance
- head tap closes sheet without drag threshold
- interactive controls inside head lose click/focus behavior

#### Dots/handle separation

- `.store-preview__dots` includes `gg-sheet__handle`
- `.store-preview__dots` includes `data-gg-drag-handle`
- `.store-preview__dots` includes `data-gg-drag-zone`
- `.store-preview__dots` remains a centered top pill visually styled like a handle

#### Scrim

- root open-state scrim block is empty
- open/opening/dragging scrim lacks opacity or visibility activation

#### Head/handle visual compactness

- global `--gg-sheet-head-height` remains at `56px` or larger unless explicitly justified in code comment and visually tested
- visual handle height remains too thick or not tokenized
- 44px hit target is absent

#### Preview parity

- root/store preview media tokens drift again
- root/store preview panel initial height token differs without adapter rationale

#### More spacing

- landing More sheet lacks shared More body top spacing token

### CI requirements

Update package scripts if needed so the strengthened guard runs through:

```bash
npm run gaga:verify-sheet-lifecycle
npm run ci:qa
npm run ci:cloudflare
```

If `.github/workflows` are present in the repo, inspect and update them if they call changed scripts. If they are not present in the audit archive, report that honestly as `NOT PRESENT IN ARCHIVE`, not `INSPECTED: YES`.

---

## Manual QA Requirements

Previous manual QA was `NOT RUN`. That is not acceptable for this hardening task.

At minimum, run and report manual/browser QA for:

### Root `/`

- Open Discovery sheet.
- Confirm mobile sheet full-bleed width.
- Confirm head/handle visual is thin/compact.
- Confirm drag-to-close works from full head, not only handle.
- Confirm tap on head does not accidentally close.
- Open More sheet.
- Confirm More body top spacing and visual rhythm.
- Open article preview.
- Confirm dock is demoted/inert, not active.
- Confirm preview footer is the drag zone and visible handle is at bottom.
- Confirm preview media aspect/height aligns with store.

### Landing `/landing`

- Open Discovery/command sheet.
- Confirm it scrolls.
- Confirm mobile sheet full-bleed width.
- Confirm drag-to-close works from full head.
- Open More sheet.
- Confirm profile card top spacing matches root/store.
- Confirm dock demotion while sheet active.

### Store `/store`

- Open Discovery sheet.
- Confirm full-bleed mobile width.
- Confirm drag-to-close works from full head.
- Open Saved sheet.
- Confirm same behavior.
- Open More sheet.
- Confirm same visual rhythm.
- Open product preview.
- Confirm carousel dots do not look like a handle.
- Confirm carousel dots do not drag/close sheet.
- Confirm footer/bottom affordance is the only preview drag/close zone.
- Confirm dock demotion matches root preview.
- Confirm product preview media aligns with root article preview.

### Comments

On a post with comments:

- Open Comments sheet.
- Confirm head/handle visual matches Discovery/More.
- Confirm drag-to-close works from full head.
- Confirm tap on head does not accidentally close.
- Confirm comment scroll behavior is not broken.

---

## Required Proof Output

Implementer must report using this exact checklist:

```txt
TASK-SHEET-MODAL-VISUAL-PARITY-HARDENING completed.

Changed:
- Compact global sheet head implemented: YES/NO
- Thin visual handle with 44px hit target preserved: YES/NO
- Bottom sheet head drag zone implemented globally: YES/NO
- Top preview footer drag zone implemented: YES/NO
- Tap-on-head does not accidentally close sheet: YES/NO
- Store preview dots/handle separation fixed: YES/NO
- Mobile sheet full-bleed width implemented: YES/NO
- Dock and sheet width tokens separated: YES/NO
- Modal dock demotion implemented globally: YES/NO
- Dock inert/focus-disabled while modal active: YES/NO
- Root/store preview dock behavior aligned: YES/NO
- Root/store preview media parity improved: YES/NO
- Landing More profile spacing aligned: YES/NO
- Root scrim open-state fixed/audited: YES/NO
- Duplicate/override-like CSS cleaned in affected blocks: YES/NO
- QA guard strengthened for modal visual parity: YES/NO
- Source CSS and generated/published CSS synchronized: YES/NO
- No override-only CSS/JS added: YES/NO
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
- npm run deploy:cloudflare:dry: PASS/FAIL/NOT RUN
- GitHub Actions workflow inspected: YES/NO/NOT PRESENT IN ARCHIVE
- Cloudflare deploy script preserved: YES/NO

Manual QA:
- Root discovery full-bleed + head drag zone: PASS/FAIL/NOT RUN
- Root more spacing + dock demotion: PASS/FAIL/NOT RUN
- Root preview footer drag zone + dock demotion: PASS/FAIL/NOT RUN
- Root/store preview media parity: PASS/FAIL/NOT RUN
- Landing discovery scroll + full-bleed + head drag zone: PASS/FAIL/NOT RUN
- Landing more profile spacing parity: PASS/FAIL/NOT RUN
- Store discovery full-bleed + head drag zone: PASS/FAIL/NOT RUN
- Store saved full-bleed + head drag zone: PASS/FAIL/NOT RUN
- Store more visual parity: PASS/FAIL/NOT RUN
- Store preview dots not handler + footer drag zone: PASS/FAIL/NOT RUN
- Comments head compactness + head drag zone: PASS/FAIL/NOT RUN
- Global dock inert while modal active: PASS/FAIL/NOT RUN
- Global thin handle visual: PASS/FAIL/NOT RUN
- Global 44px hit target: PASS/FAIL/NOT RUN

Notes:
- ...
```

Manual QA must not be left entirely `NOT RUN`. If manual QA cannot be run locally, say why and provide DOM/CSS proof plus screenshots if possible.

---

## Non-Goals

Do not:

- rewrite Blogger native comments;
- change SEO/schema/JSON-LD content unless touched indirectly by build;
- change store product data model;
- introduce new visual style unrelated to sheets/dock/preview;
- add a new framework;
- add Playwright requirement unless the repo already supports it cleanly;
- hide dock as the only solution to modal active state;
- make body/content pull-to-close globally yet. Body pull-to-close can be a later advanced task only when `scrollTop === 0` is handled safely.

---

## Final Standard

The final result should feel like one coherent native-app sheet system:

- sheet is full-bleed on mobile;
- dock remains elegant but demoted/inert under modal sheets;
- handle looks thin and symbolic;
- drag zone is generous and predictable;
- preview top-sheet affordance is at the bottom;
- store carousel dots are unmistakably carousel dots;
- root, landing, and store share the same visual rhythm;
- guards catch the actual regressions that previously slipped through.
