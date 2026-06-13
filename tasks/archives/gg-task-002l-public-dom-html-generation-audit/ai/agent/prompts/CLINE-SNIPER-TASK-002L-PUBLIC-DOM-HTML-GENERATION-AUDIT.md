# CLINE SNIPER TASK — GG vNext TASK-002L Public DOM/HTML Generation Audit

You are working in the GG vNext repository.

## Goal

Create an auditable public DOM/HTML generation policy and check.

The user does not want large public UI structures hidden in JavaScript. Blog/Store/Landing public chrome should live in HTML/XML or `<template>`. JavaScript may still manage small state/behavior.

## Important distinction

Allowed small JS behavior:

- `createElement`, `textContent`, `setAttribute`, `appendChild`, `classList`, `dataset` for small UI state, icon toggles, labels, or template hydration.
- Example: bookmark icon state `bookmark_add` -> `bookmark_added` by changing `data-gg-icon`.
- Clone existing `<template>` and fill text/attributes.

Restricted / must be audited:

- `innerHTML`
- `insertAdjacentHTML`
- `outerHTML`
- JavaScript strings containing large public UI chrome markup.
- Empty states, cards, sheets, dock, preview actions, saved listing empty, comment empty, search empty, and store cards generated only in JS.

## Required files to create/update

1. `config/public-dom-generation-policy.json`
   - Define allowed APIs, restricted APIs, public surfaces, source globs, and explicit allowlist entries.
   - Include the policy phrase: `largePublicUiMustLiveInHtmlOrTemplate`.
   - Include `allowedSmallBehaviorApis` with `createElement`, `textContent`, `setAttribute`, `appendChild`, `classList`, `dataset`.
   - Include `restrictedHtmlGenerationApis` with `innerHTML`, `insertAdjacentHTML`, `outerHTML`.
   - Include allowlist entries only for cases found in the repo that are clearly acceptable or temporary legacy bridge cases. Each allowlist entry must include file, api, reason, and status.

2. `docs/public-dom-generation-audit.md`
   - Summarize the policy in human-friendly language.
   - Include sections:
     - Rule
     - Allowed small behavior
     - Restricted patterns
     - Current findings
     - Recommended next migration task
   - Mention that `gg-saved-listing-empty`-style empty states should live in Blog `index.xml` or `<template>`, not be fully generated from JS.

3. `checks/public-dom.check.mjs`
   - Scan public source files, not generated output.
   - Must scan at least:
     - `apps/blog/index.xml`
     - `apps/store/**/*.html`
     - `apps/landing/**/*.html`
     - `src/modules/**/*.js`
     - `src/entries/**/*.js`
   - Detect restricted API occurrences: `innerHTML`, `insertAdjacentHTML`, `outerHTML`.
   - Require every restricted occurrence to be covered by `config/public-dom-generation-policy.json` allowlist, OR fail.
   - Detect obvious large UI HTML strings in public JS, e.g. strings containing `<section`, `<article`, `<button`, `<template`, `<div` together with `gg-` class names. These should be reported as findings. They may be warn-only in this task if too many legacy cases exist, but the check must print them clearly.
   - Validate that the policy JSON exists and has required keys.
   - Validate that no public JS uses `material-symbols-` as a canonical contract if such a check already exists in public-ui check; do not duplicate too much.
   - Print a concise summary like: `public-dom ok: restricted=3 allowlisted=3 findings=7`.
   - Exit non-zero for malformed policy or unallowlisted restricted API usage.

4. `package.json`
   - Add npm script:
     - `"check:public-dom": "node checks/public-dom.check.mjs"`

5. `scripts/task002l-acceptance.sh`
   - Run:
     - `npm run doctor`
     - `npm run build`
     - `npm run check`
     - `npm run check:softcode`
     - `npm run check:public-softcode`
     - `npm run check:public-ui`
     - `npm run check:public-dom`
     - `npm run console:check`
     - `npm run studio:check`
     - `npm run deploy:dry`
   - Verify these files exist:
     - `config/public-dom-generation-policy.json`
     - `docs/public-dom-generation-audit.md`
     - `checks/public-dom.check.mjs`
   - Verify policy contains `largePublicUiMustLiveInHtmlOrTemplate`.
   - Verify docs mention `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `createElement`, and `textContent`.

6. `tasks/active/TASK-002L-PUBLIC-DOM-HTML-GENERATION-AUDIT.md`
   - Document task scope, files changed, policy, commands, and non-goals.

## Boundaries

Do not make a broad migration in this task.
Do not rewrite entire Blog XML, Store HTML, or legacy JS.
Do not delete all `createElement` or `textContent` usage.
Do not move store folders in this task.
Do not implement OAuth.
Do not install dependencies.
Do not edit `dist/**` or `.cloudflare-build/**` manually.

## Expected final command

Run this and stop when green:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002l-acceptance.sh
```

## Final report format

Return:

- Status
- Files changed
- Restricted APIs found + allowlisted count
- Large UI generation findings count
- What is intentionally not migrated
- Next recommended task
