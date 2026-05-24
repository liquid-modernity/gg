# TASK-SHEET-COMPONENT-SOURCE-OF-TRUTH

## Purpose

Refactor the shared sheet UI into modular component source-of-truth files so Root, Landing, and Store no longer maintain separate hand-written copies of the same sheet styles/behavior.

This task follows `TASK-SHEET-MODAL-VISUAL-PARITY-HARDENING`.

The current problem is not that the UI is unusable. The problem is that it is still architecturally weak: `.gg-more-sheet`, `.gg-more-body`, `.gg-more-bottom`, `.gg-more-footer`, `.gg-more-profile`, and related utility sheet rules are defined separately in Root, Landing, and Store. They look similar only because they were manually copied/adapted. That is not a component system.

The output must make shared sheet components easier for AI code agents and non-technical vibe-coding review to understand, modify, and verify.

---

## Hard rule

This is a **component source-of-truth refactor**, not another surface parity patch.

Do not solve by:

- appending override CSS at the bottom of files;
- manually tweaking Root, Landing, and Store separately until they look similar;
- keeping three independent `.gg-more-*` implementations;
- changing only generated assets while source modules remain stale;
- using `!important` to overpower stale rules;
- forcing Store Discovery content/layout to match Root/Landing Discovery when the information architecture is intentionally different.

Required approach:

- extract shared component contracts into modular source files;
- make Root, Landing, and Store consume those source contracts;
- keep allowed surface differences as explicit tokens or slots;
- add guards that detect drift across generated/published outputs.

---

## Component ownership model

### 1. Global sheet primitives

Create or formalize modular source files for shared sheet primitives, for example:

```txt
src/css/components/gg-sheet-core.css
src/css/components/gg-sheet-modal.css
```

These own shared contracts for:

- `.gg-sheet`
- `.gg-sheet__scrim`
- `.gg-sheet__panel`
- `.gg-sheet__head`
- `.gg-sheet__handle`
- `data-gg-drag-zone`
- full-bleed mobile sheet width
- dock demotion while modal sheet is active
- common sheet height tokens
- common head/handle tokens

If existing architecture prefers a different folder/name, use it, but the result must clearly expose component source-of-truth files.

### 2. Global More sheet component

Create or formalize:

```txt
src/css/components/gg-more-sheet.css
```

This file must be the source of truth for:

- `.gg-more-sheet`
- `.gg-more-body`
- `.gg-more-bottom`
- `.gg-more-footer`
- `.gg-more-footer__label`
- `.gg-more-footer__social`
- `.gg-more-footer__link`
- `.gg-more-footer__legal`
- `.gg-more-profile`
- `.gg-more-profile__card`
- `.gg-more-profile__avatar`
- `.gg-more-profile__image`
- `.gg-more-profile__copy`
- `.gg-more-profile__name`
- `.gg-more-profile__meta`
- `.gg-more-profile__chevron`
- `.gg-more-section`
- `.gg-more-section__title`
- `.gg-more-list`
- `.gg-more-list__link`
- local More search field/container styles if they are part of the More component shell

Root, Landing, and Store must not maintain independent hand-written copies of these rules.

Allowed surface-specific differences:

- active route indicator;
- profile microcopy text;
- route URL targets;
- share URL;
- optional Store affiliate/commercial note content;
- optional rows shown/hidden by surface.

Not allowed as surface-specific differences:

- body top padding;
- body horizontal padding;
- bottom/footer padding;
- profile card geometry;
- section title rhythm;
- local search visual style;
- footer/social button geometry;
- legal text style;
- safe-area handling.

### 3. Root/Landing Discovery component

Create or formalize:

```txt
src/css/components/gg-discovery-sheet.css
```

This file is the source of truth for the **Root and Landing** Discovery/Search sheet only.

It owns shared contracts for:

- `.gg-discovery`
- `.gg-discovery__body`
- `.gg-discovery__controls`
- `.gg-discovery-search`
- `.gg-discovery-search__field`
- `.gg-discovery-tabs`
- `.gg-discovery-tab`
- `.gg-discovery-results`
- `.gg-discovery-result`
- `.gg-discovery-result__type`
- `.gg-discovery-result__title`
- `.gg-discovery-result__meta`
- `.gg-discovery-context`
- `.gg-discovery-topics`
- `.gg-discovery-topic-group`
- `.gg-discovery-topic`
- empty state styles
- scrollport behavior
- hidden/mobile scrollbar behavior
- softened focus state

Root and Landing must consume the same Discovery component contract.

### 4. Store Discovery is intentionally separate

Store Discovery has different information architecture and content model. Do **not** force it into `gg-discovery-sheet.css`.

Store Discovery may share only:

- global sheet primitives;
- global modal/dock demotion;
- global head/handle tokens;
- global input/tab primitive tokens where useful.

But Store-specific discovery rows, category/product result layout, thumbnail logic, commerce route copy, and product/category tabs remain Store-specific.

Expected Store source remains something like:

```txt
src/store/store.css
src/store/store-discovery.js
```

But Store must not redefine `.gg-more-*` independently.

---

## Build/sync architecture

Implement a clear sync/build path so modular component source is propagated into the files actually used by Blogger/Cloudflare.

Possible acceptable models:

### Preferred model

Add a small build/sync tool, for example:

```txt
tools/sync-shared-css-components.mjs
```

It should compose/inject component CSS into:

- `src/css/gg-app.source.css` or the active Root CSS source;
- `landing.html` inline CSS block, if Landing must remain standalone;
- `src/store/store.css` / generated `assets/store/store.css`, but only for shared primitives and More component;
- relevant critical CSS only when the component affects first paint.

Use explicit generated markers, for example:

```css
/* BEGIN GENERATED: gg-more-sheet */
...
/* END GENERATED: gg-more-sheet */
```

and:

```css
/* BEGIN GENERATED: gg-discovery-sheet */
...
/* END GENERATED: gg-discovery-sheet */
```

Do not silently duplicate blocks without markers.

### Acceptable fallback model

If a new sync tool is too invasive, keep the module files as source-of-truth and update existing build tooling to pull from them. The proof must show that Root, Landing, and Store outputs are generated from the same module source, not manually copied.

---

## JS behavior source-of-truth

This task is primarily CSS/component architecture, but any shared More/Discovery behavior that is duplicated should be reconciled if it is part of the same component contract.

Minimum required:

- shared lifecycle remains centralized through existing sheet lifecycle code;
- More local search reset behavior remains consistent across Root, Landing, and Store;
- More preference panel reset behavior remains consistent;
- Discovery close/reopen reset remains consistent for Root and Landing;
- Store Discovery remains store-specific but still uses global lifecycle primitives.

If behavior is not yet extracted to a JS module, document why and add a guard that prevents further drift.

---

## Specific defects to eliminate

### More sheet drift

Eliminate the current situation where Root, Landing, and Store define different values for:

- `.gg-more-body` padding;
- `.gg-more-bottom` padding;
- `.gg-more-footer` gap/padding;
- `.gg-more-profile__card` geometry;
- section title rhythm;
- footer legal text spacing;
- bottom safe-area handling.

Example of patterns that must disappear from active source/output unless generated from the shared component:

```css
.gg-more-bottom { padding: 10px 0 calc(8px + env(safe-area-inset-bottom)); }
.gg-more-bottom { padding-bottom: 10px; }
.gg-more-bottom { padding-bottom: 16px; }
#gg-more-panel .gg-more-sheet > .gg-sheet__body { display: contents; }
```

The final More component should produce a single visual rhythm across Root, Landing, and Store.

### Discovery root/landing drift

Root and Landing Discovery must share the same component contract for:

- head/body/control structure;
- scrollport behavior;
- hidden mobile scrollbar;
- result row spacing;
- result label/title/meta typography;
- tabs/chips;
- search input focus state.

Landing Discovery must not keep one-off inline CSS that diverges from Root Discovery.

### Store Discovery boundary

Store Discovery should remain content-specific and may keep `STORE DISCOVERY`/commerce-specific content only if that is a deliberate microcopy decision. But shared utility shell tokens must not drift from global sheet primitives.

---

## Visual direction

Use the existing quiet, native-app-like visual language:

- compact sheet head;
- thin visual handle with 44px interactive target;
- full-bleed mobile sheet panel;
- dock can remain visible but inert/dimmed/blurred under modal sheet;
- soft, not harsh, focus rings;
- no visible mobile scrollbar unless explicitly required for desktop;
- calm More profile card/list/footer rhythm.

Do not regress:

- root preview/store preview behavior;
- comments/threaded comments logic;
- native Blogger comments authority;
- Store product/category IA;
- Cloudflare Worker route behavior;
- Blogger XML render stability.

---

## Guard requirements

Add or strengthen a guard, for example:

```txt
qa/component-source-contract-guard.mjs
```

and package script:

```json
"gaga:verify-component-source": "node qa/component-source-contract-guard.mjs"
```

The guard must check at minimum:

1. Component source files exist.
2. Root/Landing/Store consume the generated/shared More component block.
3. Root and Landing consume the same Discovery component block.
4. Store does not consume Root/Landing Discovery content styles except allowed shared primitives.
5. No active source/output contains unmarked manual `.gg-more-*` duplicate blocks outside the generated/shared component region.
6. `.gg-more-bottom` padding is not independently hardcoded per surface.
7. Landing does not use a divergent `.gg-more-bottom` such as horizontal padding `0` when Root/Store use tokenized padding.
8. Store critical CSS does not keep stale sheet width/handle tokens, including:
   - `100vw - 12px`
   - `--gg-panel-handle-width: 62px`
   - `--gg-panel-width: var(--gg-dock-width)`
9. Root/Landing Discovery share result row, tab, search, and scrollport tokens/classes.
10. Generated markers are present and balanced.

The guard should fail loudly with actionable messages.

---

## Required package/CI integration

Update `package.json` so the new guard is included in the CI path.

Required commands after implementation:

```bash
npm run build
npm run store:check:ci
npm run store:check:dev10
npm run gaga:verify-preview-sheet
npm run gaga:verify-sheet-contract
npm run gaga:verify-shell
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-component-source
npm run ci:qa
npm run ci:cloudflare
git diff --check
```

If `deploy:cloudflare:dry` still fails due to the known local Wrangler/esbuild macOS `_SecTrustCopyCertificateChain` issue, report it as environment failure only after build/preflight completed.

---

## Manual QA required

Do not leave all browser QA as `NOT RUN`.

At minimum test these routes/surfaces:

### Root `/`

- Open More sheet.
- Confirm More body/bottom/footer matches Landing and Store spacing.
- Confirm dock is inert/dimmed while More is active.
- Close and reopen; scroll resets correctly.

### Landing `/landing`

- Open More sheet.
- Confirm exact More spacing parity with Root and Store.
- Open Discovery.
- Confirm scroll works, no desktop-like scrollbar on mobile, search focus is soft.

### Store `/store`

- Open More sheet.
- Confirm More component matches Root/Landing.
- Open Store Discovery.
- Confirm Store Discovery remains store-specific but shares global sheet shell/head/width/dock behavior.

### Root and Landing Discovery comparison

- Compare result row typography, section labels, tabs, input, footer controls, and scroll behavior.
- They should feel like the same component with different data, not two separate implementations.

---

## Acceptance report format

Implementer must report:

```txt
TASK-SHEET-COMPONENT-SOURCE-OF-TRUTH completed.

Changed:
- Modular sheet core component source added: YES/NO
- Modular More sheet source-of-truth added: YES/NO
- Modular Root/Landing Discovery source-of-truth added: YES/NO
- Root consumes shared More component: YES/NO
- Landing consumes shared More component: YES/NO
- Store consumes shared More component: YES/NO
- Root consumes shared Discovery component: YES/NO
- Landing consumes shared Discovery component: YES/NO
- Store Discovery intentionally remains content-specific: YES/NO
- Store critical CSS reconciled with sheet tokens: YES/NO
- Manual duplicate `.gg-more-*` blocks removed or generated-marked: YES/NO
- Generated markers added/balanced: YES/NO
- Component guard added: YES/NO
- `ci:qa` includes component guard: YES/NO
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
- npm run ci:qa: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
- npm run deploy:cloudflare:dry: PASS/FAIL/ENVIRONMENT FAILURE

Manual QA:
- Root More parity: PASS/FAIL/NOT RUN
- Landing More parity: PASS/FAIL/NOT RUN
- Store More parity: PASS/FAIL/NOT RUN
- Root/Landing Discovery parity: PASS/FAIL/NOT RUN
- Store Discovery boundary preserved: PASS/FAIL/NOT RUN
- Dock demotion still works globally: PASS/FAIL/NOT RUN
- Mobile full-bleed sheet still works globally: PASS/FAIL/NOT RUN

Notes:
- Explain any intentional surface-specific differences.
- Explain any files that remain surface-specific and why.
```

---

## Done means

This task is done only when:

- More sheet is genuinely one global component contract across Root, Landing, and Store;
- Root and Landing Discovery are genuinely one shared component contract;
- Store Discovery remains intentionally store-specific without copying More/Root Discovery styles;
- Root/Landing/Store no longer drift through hand-written duplicate `.gg-more-*` blocks;
- guards fail if drift is reintroduced;
- manual QA confirms visual parity instead of relying only on script PASS.
