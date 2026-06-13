# TASK-002M-D — Store Discovery Button Templates

## Objective

Move Store discovery button chrome structure out of JavaScript and into purpose-specific `<template>` elements in `apps/store/store.html`.

This is a continuation of the public DOM/HTML generation cleanup:

```txt
TASK-002L   — restricted DOM API audit
TASK-002L-B — createElement SRC audit
TASK-002M-B — Blog section/article templates
TASK-002M-C — Blog button chrome templates
TASK-002M-D — Store discovery button templates
```

## Why

`document.createElement('button')` is not automatically dangerous, but for Store public chrome it hides UI structure in JS.

Project rule:

```txt
Struktur UI besar jangan tersembunyi di JS.
State/behavior kecil boleh dikelola JS.
```

## Scope

In scope:

- `src/modules/store/store-discovery.js`
- `apps/store/store.html`
- public DOM generation audit docs/policy as needed
- task acceptance script

Out of scope:

- Blog template/runtime migration
- Landing command panel migration
- Store folder restructuring
- OAuth/Blogger API
- Console/Studio UI rewrite
- legacy-app split
- deleting `legacy-donor/`
- editing generated output
- installing dependencies

## Required work

### 1. Inventory current Store button generation

Find all button creation in:

```txt
src/modules/store/store-discovery.js
```

Identify semantic family, for example:

```txt
semantic category chip
semantic more button
```

Use current repo findings as source of truth.

### 2. Add purpose-specific templates

Add templates to `apps/store/store.html`.

Recommended IDs:

```txt
store-semantic-category-chip-template
store-semantic-more-button-template
```

Do not create one generic `store-button-template` or `gg-template-button`.

### 3. Hydrate from JS

Replace `document.createElement('button')` structures with template cloning.

JS may still update:

```txt
id
aria-selected
aria-controls
data attributes
icon text/state
label text
count text
hidden/disabled/type
```

### 4. Preserve behavior

Do not change user behavior:

```txt
semantic category rail selection
semantic panel tab aria contract
semantic more/less reveal behavior
```

### 5. Update audit docs

Update `docs/public-dom-generation-audit.md` with before/after Store button count and template IDs.

Update `config/public-dom-generation-policy.json` only if required to keep the policy accurate.

## Acceptance

Must pass:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-d-acceptance.sh
```

## Definition of done

- No `createElement('button')` remains in `src/modules/store/store-discovery.js`.
- Store button templates are purpose-specific.
- No universal Store button template is introduced.
- Blog templates/runtime remain untouched except for unavoidable policy line maintenance.
- Build/check/deploy dry-run remain green.
