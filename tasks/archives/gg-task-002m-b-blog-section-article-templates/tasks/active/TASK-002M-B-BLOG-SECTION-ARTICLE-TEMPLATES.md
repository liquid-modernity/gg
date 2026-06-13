# TASK-002M-B — Migrate Blog listing/empty-state section/article to templates

## Status

Planned.

## Goal

Move public Blog UI `section`/`article` structures from `src/modules/legacy-app/legacy-app.js` into explicit templates in `apps/blog/index.xml`.

## Why

The project rule is:

> Large public UI structure must live in HTML/XML or `<template>`. State/behavior can remain in JS.

`TASK-002L-B` identified `document.createElement('section')` and `document.createElement('article')` candidates that should not remain hidden in JS.

## Scope

Allowed:
- Blog empty/listing/card section/article templates
- template cloning helpers
- public DOM guard updates
- docs/task notes

Out of scope:
- button migration
- Store restructuring
- OAuth
- Console/Studio UI
- full legacy bridge split
- generated outputs

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-b-acceptance.sh
```
