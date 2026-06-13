# CLINE SNIPER — TASK-002M-D Store Discovery Button Templates

## Mission

Migrate remaining Store discovery button chrome generation from JavaScript into purpose-specific HTML templates.

The project rule is:

```txt
Struktur UI besar jangan tersembunyi di JS.
State/behavior kecil boleh dikelola JS.
```

TASK-002M-B and TASK-002M-C moved Blog `section`, `article`, and `button` chrome from JS into `apps/blog/index.xml` templates. TASK-002M-D does the same for the remaining Store discovery button generation in `src/modules/store/store-discovery.js`.

## Scope

Only touch what is needed for Store discovery button templates:

- `apps/store/store.html`
- `src/modules/store/store-discovery.js`
- `docs/public-dom-generation-audit.md`
- `config/public-dom-generation-policy.json` if the createElement audit needs clearer classification/allowlist updates
- `scripts/task002m-d-acceptance.sh`
- task docs if needed

Do not touch generated outputs:

- `dist/**`
- `.cloudflare-build/**`
- `.wrangler/**`

Do not touch Blog templates/runtime unless absolutely necessary for line-number policy maintenance. This task is Store-only.

## Required principle

Do not create one generic template for every Store button.

Forbidden examples:

```html
<template id="store-button-template">
<template id="store-generic-button-template">
<template id="gg-template-button">
<template id="gg-template-store-button">
```

Correct approach:

```txt
1 template = 1 UI family / 1 semantic purpose.
```

A template may be reused only when the buttons share the same UI family, semantic role, expected class contract, and behavior contract.

## Button candidates to migrate

Inspect all `document.createElement('button')` occurrences in:

```txt
src/modules/store/store-discovery.js
```

Expected current candidates are likely:

1. Semantic category rail chip button in `renderSemanticRail(...)`.
2. Semantic "more" button in `renderSemanticMoreButton(...)`.

Use exact findings from the current repo, not guesses.

## Required template IDs

Add purpose-specific templates in `apps/store/store.html` when they match the current code paths:

```txt
store-semantic-category-chip-template
store-semantic-more-button-template
```

If the current code has another Store discovery button family, add another purpose-specific template. Do not merge unrelated button families.

## Template design requirements

Each template should include structural markup only, with safe fallback content.

Recommended patterns:

```html
<template id="store-semantic-category-chip-template">
  <button type="button" class="store-semantic-category-chip" role="tab" aria-selected="false" data-store-semantic-category="">
    <span class="gg-icon store-semantic-category-chip__icon" aria-hidden="true">category</span>
    <span data-store-semantic-category-label></span>
    <span class="store-semantic-category-chip__count" data-store-semantic-category-count>0</span>
  </button>
</template>
```

```html
<template id="store-semantic-more-button-template">
  <button type="button" class="store-button store-semantic-more" data-store-semantic-more="">
    <span data-store-semantic-more-label>See more</span>
  </button>
</template>
```

Use current class names/attributes from `store-discovery.js`. Do not invent styling contracts that break CSS.

## JavaScript requirements

Use the existing `cloneTemplate(id)` helper in `src/modules/store/store-discovery.js` if present. If the helper name is different in the current repo, use the existing helper.

After cloning, JS may still update:

- `id`
- `aria-selected`
- `aria-controls`
- `data-*`
- `hidden`
- `disabled`
- `type`
- icon state/text via `.dataset.ggIcon` or `.textContent`
- label/count text via `.textContent`

JS must not build Store discovery button structure with `createElement('button')`.

Allowed small behavior remains allowed:

```js
button.setAttribute('aria-selected', selected ? 'true' : 'false');
icon.textContent = semanticCategoryIcon(key);
label.textContent = semanticCategoryTitle(key);
count.textContent = String((groups[key] || []).length);
```

## Acceptance criteria

1. `src/modules/store/store-discovery.js` has no `document.createElement('button')` or equivalent `createElement("button")` calls.
2. `apps/store/store.html` contains purpose-specific templates for migrated Store discovery buttons.
3. No universal/generic all-purpose Store button template is introduced.
4. `npm run check:public-dom` passes.
5. Full pipeline passes.
6. `bash scripts/task002m-d-acceptance.sh` passes.

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-d-acceptance.sh
```

## Report back

Report:

- exact `createElement('button')` count before and after in `store-discovery.js`
- template IDs added
- whether any Store discovery button family was intentionally left unmigrated and why
- updated `check:public-dom` summary
