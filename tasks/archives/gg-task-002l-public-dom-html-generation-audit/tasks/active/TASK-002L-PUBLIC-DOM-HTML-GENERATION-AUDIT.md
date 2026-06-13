# TASK-002L — Public DOM/HTML Generation Audit

## Goal

Make public DOM/HTML generation auditable.

Large public UI structure must live in HTML/XML or `<template>`. JavaScript may manage small behavior and state.

## Required implementation

- Create `config/public-dom-generation-policy.json`.
- Create `docs/public-dom-generation-audit.md`.
- Create `checks/public-dom.check.mjs`.
- Add `npm run check:public-dom`.
- Create `scripts/task002l-acceptance.sh`.

## Policy

Allowed small behavior:

- `createElement`
- `textContent`
- `setAttribute`
- `appendChild`
- `classList`
- `dataset`

Restricted HTML generation:

- `innerHTML`
- `insertAdjacentHTML`
- `outerHTML`

Restricted usage must be explicitly allowlisted with file, API, reason, and status.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-acceptance.sh
```

## Non-goals

- No OAuth.
- No legacy JS split.
- No broad HTML/XML rewrite.
- No store source-layout restructure.
- No dependency installation.
