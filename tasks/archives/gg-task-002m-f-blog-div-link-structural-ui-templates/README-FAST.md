# TASK-002M-F — Blog div/link Structural UI Templates

## Goal
Migrate the remaining Blog legacy structural UI created with `document.createElement('div')` and `document.createElement('a')` into purpose-specific `<template>` elements in `apps/blog/index.xml`.

This follows the project rule:

> Struktur UI besar jangan tersembunyi di JS. State/behavior kecil boleh dikelola JS.

## Scope
Only migrate the 9 `needsTemplate` candidates already identified by TASK-002M-E in `src/modules/legacy-app/legacy-app.js`:

1. Reply banner `div` — `gg-comments__reply-banner`
2. Comment more menu `div` — `gg-comment-more__menu`
3. Replies context label `div`
4. Replies context row `div`
5. Replies context copy `div`
6. Replies context meta `div`
7. Replies context body `div`
8. Replies context count `div`
9. Popular range navigation link `a` — `gg-popular-controls__range`

## Non-goals
- Do not migrate allowedSmall occurrences.
- Do not migrate allowedReviewed occurrences.
- Do not delete `createElement` globally.
- Do not refactor Store, Console, Studio, OAuth, deployment, or folder layout.
- Do not edit `dist/**` or `.cloudflare-build/**` manually.
- Do not create universal templates like `gg-template-div`, `gg-template-link`, or `gg-template-element`.

## Run
Copy this task pack into repo root, then paste `CLINE-PASTE-ME.txt` into Cline.

Final command:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-f-acceptance.sh
```
