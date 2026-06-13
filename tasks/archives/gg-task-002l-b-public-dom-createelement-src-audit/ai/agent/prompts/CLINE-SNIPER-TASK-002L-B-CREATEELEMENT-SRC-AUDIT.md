# CLINE SNIPER TASK — TASK-002L-B Public DOM Audit CreateElement Pass (SRC Scope)

You are working in GG vNext repo. Execute only this task. Be fast and precise.

## Goal

Extend the existing Public DOM/HTML Generation Audit so it detects and classifies `document.createElement(...)` usage across **all `src/**`**, not only `src/modules/legacy-app/**`.

This is an **audit + policy + guardrail** pass. Do not migrate UI yet.

Core principle:

> Large public UI structure must live in HTML/XML or `<template>`. Small state/behavior may use JS.

## Scope

Read/modify only if needed:

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `package.json` only if script wiring is missing
- `scripts/task002l-b-acceptance.sh`
- `tasks/active/TASK-002L-B-PUBLIC-DOM-CREATEELEMENT-SRC-AUDIT.md`

Do not edit public templates or JS feature code unless absolutely required to make the check accurate. Prefer policy/check/doc updates only.

## Required behavior

Update `check:public-dom` so it:

1. Scans **all `src/**/*.js` and `src/**/*.mjs`**.
2. Does not limit findings to `legacy-app`.
3. Detects `document.createElement('tag')` and `document.createElement("tag")`.
4. Classifies createElement findings into:
   - `allowedSmallBehavior`
   - `needsTemplateCandidate`
   - `allowedLegacyOrParsing`
5. Emits a summary count in the console output.
6. Fails only for **unclassified high-risk createElement usage**, not for every createElement.
7. Writes or updates an audit report section listing candidates for future migration.

## Classification rules

### Allowed small behavior

Usually allowed:

- `span`
- `option`
- `fragment` via `createDocumentFragment`
- small icon state nodes
- visually hidden labels only when attached to existing static UI
- text-only utility nodes

Still inventory them, but do not fail unless suspicious.

### Needs template candidate

Classify as `needsTemplateCandidate` when `createElement` creates large public UI/chrome structures, especially:

- `section`
- `article`
- `button`
- `nav`
- `header`
- `footer`
- `dialog`
- `form`
- `aside`
- `main`
- `ul`
- `ol`
- `li` when used as a row/card/list item structure

Examples that should become migration candidates, not immediate failures if allowlisted/classified:

- saved empty state
- unavailable empty state
- replies sheet handle button
- listing row/card templates
- command panel rows
- sheet/chrome buttons

### Restricted APIs remain restricted

Keep existing behavior for:

- `innerHTML`
- `insertAdjacentHTML`
- `outerHTML`
- large HTML strings in JS

Existing allowlisted parsing cases may remain allowlisted. Do not broaden allowlists unnecessarily.

## Policy file expectations

Update `config/public-dom-generation-policy.json` to include a `createElementAudit` section similar to:

```json
{
  "createElementAudit": {
    "scope": ["src/**/*.js", "src/**/*.mjs"],
    "principle": "Large public UI structure must live in HTML/XML or template. Small state/behavior may use JS.",
    "allowedSmallTags": ["span", "option"],
    "needsTemplateTags": ["section", "article", "button", "nav", "header", "footer", "dialog", "form", "aside", "main", "ul", "ol", "li"],
    "allowlist": []
  }
}
```

Use the repo's existing JSON style. If existing policy already has a different shape, extend it cleanly rather than replacing everything.

## Audit doc expectations

Update `docs/public-dom-generation-audit.md` with a clear section:

- `CreateElement SRC Audit`
- explain allowed vs needs-template
- list findings grouped by file
- list recommended migration order

Recommended migration order must place UI/chrome first, parsing helpers later.

## Check script expectations

`checks/public-dom.check.mjs` should be deterministic and dependency-free.

It should output something like:

```txt
public-dom ok: restricted=5 allowlisted=5 createElement=NN allowedSmall=NN needsTemplate=NN unclassified=0
```

If unclassified high-risk createElement usage exists, fail with exit 1 and show file/line/tag/context.

## Acceptance script

Create `scripts/task002l-b-acceptance.sh`.

It must run:

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
```

Then verify:

- `config/public-dom-generation-policy.json` contains `createElementAudit`.
- `docs/public-dom-generation-audit.md` contains `CreateElement SRC Audit`.
- `checks/public-dom.check.mjs` references `createElement`.
- `tasks/active/TASK-002L-B-PUBLIC-DOM-CREATEELEMENT-SRC-AUDIT.md` exists.

## Task note

Create `tasks/active/TASK-002L-B-PUBLIC-DOM-CREATEELEMENT-SRC-AUDIT.md` with:

- goal
- scope
- files changed
- classification summary
- candidate migration list
- non-goals
- acceptance commands

## Hard boundaries

- Do not migrate UI templates in this task.
- Do not delete `createElement`/`textContent` usages.
- Do not disable checks to make them pass.
- Do not install dependencies.
- Do not edit generated output.
- Do not implement OAuth.
- Do not split legacy bridge.

## Final response expected from you

Report:

- files changed
- createElement scan scope
- count of findings grouped by allowed / needs-template / unclassified
- acceptance results
