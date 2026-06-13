# GG vNext TASK-002L — Public DOM/HTML Generation Audit

Use this task pack with Cline + DeepSeek V4 Pro in sniper mode.

Goal: make public Blog/Store/Landing DOM generation auditable, so large UI chrome is not hidden in JavaScript.

This task is an audit + guardrail task, not a broad migration task.

## Install

```bash
unzip gg-task-002l-public-dom-html-generation-audit.zip
cp -R gg-task-002l-public-dom-html-generation-audit/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002l-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Expected final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-acceptance.sh
```

## Non-goals

- Do not implement Blogger OAuth.
- Do not split the legacy JS bridge.
- Do not install Tailwind, shadcn, React, Tiptap, or dependencies.
- Do not rewrite all public HTML/JS.
- Do not remove all `createElement` or `textContent`.
- Do not edit generated `dist/**` or `.cloudflare-build/**` manually.

## Core policy

Large public UI structure must live in HTML/XML or `<template>`.
Small state/behavior may be managed by JS.

Allowed small behavior examples:

- toggle `aria-pressed`
- change `data-gg-icon="bookmark_add"` to `data-gg-icon="bookmark_added"`
- update label text with `textContent`
- show/hide a sheet
- clone an existing `<template>` and fill text/attributes

Restricted patterns:

- `innerHTML`
- `insertAdjacentHTML`
- `outerHTML`
- large UI classes created only inside JS strings
- empty states/cards/sheets created from raw HTML strings
