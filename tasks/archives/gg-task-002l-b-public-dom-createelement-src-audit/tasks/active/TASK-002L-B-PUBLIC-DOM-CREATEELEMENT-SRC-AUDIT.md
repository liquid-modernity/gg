# TASK-002L-B — Public DOM Audit CreateElement Pass (SRC Scope)

## Goal

Extend the Public DOM/HTML Generation Audit so it inventories and classifies `document.createElement(...)` usage across all `src/**`, not only legacy.

## Principle

Large public UI structure must live in HTML/XML or `<template>`. Small state/behavior may use JavaScript.

## Scope

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `scripts/task002l-b-acceptance.sh`
- this task note

## Non-goals

- No UI migration yet.
- No OAuth.
- No legacy bridge split.
- No dependency install.
- No generated output edits.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-b-acceptance.sh
```
