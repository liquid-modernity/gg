# TASK-002M-C — Blog Button Chrome Templates

## Objective

Move Blog button chrome structure out of JavaScript and into purpose-specific `<template>` elements in `apps/blog/index.xml`.

This is a continuation of the public DOM/HTML generation cleanup:

```txt
TASK-002L   — restricted DOM API audit
TASK-002L-B — createElement SRC audit
TASK-002M-B — Blog section/article templates
TASK-002M-C — Blog button chrome templates
```

## Why

`document.createElement('button')` is not automatically dangerous, but for Blog public chrome it hides UI structure in JS.

Project rule:

```txt
Struktur UI besar jangan tersembunyi di JS.
State/behavior kecil boleh dikelola JS.
```

## Scope

In scope:

- `src/modules/legacy-app/legacy-app.js`
- `apps/blog/index.xml`
- public DOM generation audit docs/policy as needed
- task acceptance script

Out of scope:

- Store discovery button templates
- Landing command panel migration
- OAuth/Blogger API
- Console/Studio UI rewrite
- legacy-app split
- deleting `legacy-donor/`
- editing generated output
- installing dependencies

## Required work

### 1. Inventory current Blog button generation

Find all button creation in:

```txt
src/modules/legacy-app/legacy-app.js
```

Identify semantic family, for example:

```txt
sheet handle
comment reply
comment more
comment like
comment copy link
comment delete
```

### 2. Add purpose-specific templates

Add templates to `apps/blog/index.xml`.

Recommended IDs:

```txt
gg-template-comments-sheet-handle
gg-template-comment-reply-button
gg-template-comment-more-button
gg-template-comment-like-button
gg-template-comment-copy-link-button
gg-template-comment-delete-button
```

Do not create one generic `gg-template-button`.

### 3. Hydrate from JS

Replace `document.createElement('button')` structures with template cloning.

JS may still update:

```txt
aria-label
aria-pressed
data attributes
icon state
label text
hidden/disabled/type
```

### 4. Preserve behavior

Do not change user behavior:

```txt
comment reply
comment more
comment like
comment copy link
comment delete
sheet drag handle
```

### 5. Update audit docs

Update `docs/public-dom-generation-audit.md` with the before/after button count and template IDs.

Update `config/public-dom-generation-policy.json` only if required to keep the policy accurate.

## Acceptance

Must pass:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-c-acceptance.sh
```

## Definition of done

- No `createElement('button')` remains in `src/modules/legacy-app/legacy-app.js`.
- Button templates are purpose-specific.
- No universal button template is introduced.
- Store discovery button migration remains untouched for later task.
- Build/check/deploy dry-run remain green.
