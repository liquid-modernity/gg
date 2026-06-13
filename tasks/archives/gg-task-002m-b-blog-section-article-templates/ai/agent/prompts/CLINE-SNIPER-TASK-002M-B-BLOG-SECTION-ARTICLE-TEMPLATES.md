# CLINE SNIPER TASK — TASK-002M-B Blog Section/Article Template Migration

You are working in the GG vNext repo.

## Goal

Move remaining **Blog public UI `section`/`article` structure generation** out of JavaScript and into `apps/blog/index.xml` templates.

This is a follow-up to `TASK-002L-B`, which found `document.createElement('section')` and `document.createElement('article')` candidates in `src/modules/legacy-app/legacy-app.js`.

Core rule:

> Large public UI structure must live in HTML/XML or `<template>`. JS may clone templates and update state/text/attributes.

## Hard boundaries

Do not implement:
- Blogger OAuth
- Store source layout cleanup
- full legacy JS bridge split
- Tailwind/shadcn/Tiptap
- Console/Studio UI changes
- button migration except if directly needed to preserve a section/article template
- broad code style rewrites

Do not edit:
- `dist/**`
- `.cloudflare-build/**`
- generated bundle/minified files

## Allowed files

Prefer touching only:
- `apps/blog/index.xml`
- `src/modules/legacy-app/legacy-app.js`
- `checks/public-dom.check.mjs`
- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `scripts/task002m-b-acceptance.sh`
- `tasks/active/TASK-002M-B-BLOG-SECTION-ARTICLE-TEMPLATES.md`

## Required implementation steps

### 1. Inspect exact section/article generation

Search in `src/modules/legacy-app/legacy-app.js` for:

```js
document.createElement('section')
document.createElement("section")
document.createElement('article')
document.createElement("article")
```

Do not guess. Identify the function/context for each occurrence.

### 2. Add Blog templates in `apps/blog/index.xml`

For each public Blog `section`/`article` UI structure currently generated in JS, add an equivalent `<template>` in `apps/blog/index.xml`.

Template rules:
- template IDs must start with `gg-template-` or match existing `gg-empty-state-*` conventions when already present.
- include fallback text in the template.
- use `data-gg-copy` on label/text children, not on composite containers that contain icons.
- keep Blogger XML valid.
- do not rewrite the full Blogger template.

Suggested template patterns when applicable:
- saved unavailable empty state
- saved articles empty state
- listing/card fallback article
- discovery/listing section shell

Only add templates that correspond to real existing JS-generated `section`/`article` structures.

### 3. Update JS to clone templates

In `src/modules/legacy-app/legacy-app.js`, replace `document.createElement('section')` and `document.createElement('article')` public UI generation with template cloning.

Use a small helper if useful, for example:

```js
function cloneTemplateElement(id) {
  var template = document.getElementById(id);
  var node;
  if (!template || !template.content) return null;
  node = template.content.cloneNode(true).firstElementChild;
  return node || null;
}
```

JS may still:
- set `hidden`
- set `href/src/alt/aria-*`
- set `textContent` on child nodes
- update `data-*`
- append cloned nodes to fragments

JS should not create `section` or `article` nodes directly after this task.

### 4. Keep small behavior allowed

Do not remove `createElement('span')`, `createDocumentFragment()`, small icon state updates, or textContent state updates. This task is only about `section` and `article` public Blog UI structure.

### 5. Update public DOM check/policy

Update `checks/public-dom.check.mjs` and/or `config/public-dom-generation-policy.json` so the guard catches regression:

- no `document.createElement('section')` in `src/modules/legacy-app/legacy-app.js`
- no `document.createElement('article')` in `src/modules/legacy-app/legacy-app.js`
- required template IDs exist in `apps/blog/index.xml`
- `check:public-dom` still passes

Do not silence the check by broad allowlisting section/article.

### 6. Update docs/task note

Update or create:

```txt
docs/public-dom-generation-audit.md
tasks/active/TASK-002M-B-BLOG-SECTION-ARTICLE-TEMPLATES.md
```

Document:
- before: section/article created in JS
- after: templates in `apps/blog/index.xml`
- remaining createElement candidates such as buttons/divs/etc.
- non-goals

### 7. Run acceptance

Run:

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002m-b-acceptance.sh
```

Final output must report all green.

## Acceptance must prove

- no `document.createElement('section')` remains in `src/modules/legacy-app/legacy-app.js`
- no `document.createElement('article')` remains in `src/modules/legacy-app/legacy-app.js`
- Blog templates required by the migrated code exist in `apps/blog/index.xml`
- runtime build still passes
- public UI/icon/softcode checks still pass

