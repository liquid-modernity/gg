# TASK-002M — Move Remaining Legacy UI Generation to HTML/template

## Goal

Move remaining public chrome UI generation from JS string/innerHTML patterns to HTML/XML `<template>` or static fallback markup, starting with the landing discovery command panel.

## Scope

- Landing discovery command panel template.
- Policy/doc updates for public DOM generation.
- `check:public-dom` strengthening.
- Acceptance script.

## Non-goals

- No OAuth.
- No Tailwind/shadcn/Tiptap.
- No full legacy JS split.
- No store restructure.
- No generated output edits.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-acceptance.sh
```
