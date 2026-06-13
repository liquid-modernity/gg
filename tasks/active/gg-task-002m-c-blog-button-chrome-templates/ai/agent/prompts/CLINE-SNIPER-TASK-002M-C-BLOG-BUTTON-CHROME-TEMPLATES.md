# CLINE SNIPER — TASK-002M-C Blog Button Chrome Templates

## Mission

Migrate remaining Blog button chrome generation from JavaScript into purpose-specific XML templates.

The project rule is:

```txt
Struktur UI besar jangan tersembunyi di JS.
State/behavior kecil boleh dikelola JS.
```

TASK-002L-B found `createElement('button')` candidates in `src/modules/legacy-app/legacy-app.js`. TASK-002M-C must migrate the Blog legacy-app button chrome to `<template>` elements in `apps/blog/index.xml`.

## Scope

Only touch what is needed for Blog button chrome templates:

- `apps/blog/index.xml`
- `src/modules/legacy-app/legacy-app.js`
- `docs/public-dom-generation-audit.md`
- `config/public-dom-generation-policy.json` if the createElement audit needs clearer classification/allowlist updates
- `scripts/task002m-c-acceptance.sh`
- task docs if needed

Do not touch generated outputs:

- `dist/**`
- `.cloudflare-build/**`
- `.wrangler/**`

Do not migrate Store discovery buttons here. Store discovery button templates should be a later task.

## Required principle

Do not create one generic template for every button.

Forbidden examples:

```html
<template id="gg-template-button">
<template id="gg-template-generic-button">
<template id="gg-template-public-button">
```

Correct approach:

```txt
1 template = 1 UI family / 1 semantic purpose.
```

A template may be reused only when the buttons share the same UI family, semantic role, expected class contract, and behavior contract.

## Button candidates to migrate

Inspect all `document.createElement('button')` occurrences in:

```txt
src/modules/legacy-app/legacy-app.js
```

Expected candidates are around Blog comment/sheet chrome, such as:

- sheet drag handles
- replies sheet handle
- comment reply button
- comment more button
- comment like button
- comment copy link button
- comment delete button

Use exact findings from the current repo, not guesses.

## Required template IDs

Add purpose-specific templates in `apps/blog/index.xml`. Use these IDs when relevant to the matching code path:

```txt
gg-template-comments-sheet-handle
gg-template-comment-reply-button
gg-template-comment-more-button
gg-template-comment-like-button
gg-template-comment-copy-link-button
gg-template-comment-delete-button
```

If the current code has another button family, add another purpose-specific template. Do not merge unrelated button families.

## Template design requirements

Each template should include structural markup only, with safe fallback content.

Recommended patterns:

```html
<template id="gg-template-comments-sheet-handle">
  <button type="button" class="gg-comments-sheet__handle gg-sheet__handle">
    <span class="gg-visually-hidden" data-gg-copy="comments.replies.drag">Drag replies sheet</span>
  </button>
</template>
```

```html
<template id="gg-template-comment-like-button">
  <button type="button" class="gg-comment-action" data-gg-comment-like="">
    <span class="gg-icon" data-gg-icon="favorite" aria-hidden="true"></span>
    <span class="gg-comment-action__label" data-gg-copy="comments.like">Like</span>
  </button>
</template>
```

Use current class names/attributes from `legacy-app.js`. Do not invent styling contracts that break CSS.

## JavaScript requirements

Use the existing `cloneTemplateElement(id)` helper if present. If not present, add a tiny helper close to existing template helpers.

After cloning, JS may still update:

- `aria-label`
- `aria-pressed`
- `data-*`
- `hidden`
- `disabled`
- `type`
- icon state via `.dataset.ggIcon`
- text via `.textContent`
- href only on anchors, not relevant here

JS must not build the button structure with `createElement('button')`.

Allowed small behavior remains allowed:

```js
button.setAttribute('aria-pressed', 'true');
icon.dataset.ggIcon = 'bookmark_added';
label.textContent = getCopy('...');
```

## Acceptance criteria

1. `src/modules/legacy-app/legacy-app.js` has no `document.createElement('button')` or equivalent `createElement("button")` calls.
2. `apps/blog/index.xml` contains purpose-specific templates for migrated Blog buttons.
3. No universal/generic all-purpose button template is introduced.
4. `npm run check:public-dom` passes.
5. Full pipeline passes.
6. `bash scripts/task002m-c-acceptance.sh` passes.

## Final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-c-acceptance.sh
```

## Report back

Report:

- exact `createElement('button')` count before and after in `legacy-app.js`
- template IDs added
- any button family intentionally left unmigrated and why
- updated `check:public-dom` summary
