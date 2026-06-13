# CLINE SNIPER TASK — TASK-002M Move Remaining Legacy UI Generation to HTML/template

You are working in GG vNext repo. Execute only TASK-002M.

## Current project rule

Public Blog/Store/Landing must follow this contract:

- Large public UI/chrome structure must live in HTML/XML or `<template>`.
- JS may manage state/behavior: clone templates, toggle `hidden`, update `aria-*`, set classes, set `textContent`, set `data-gg-icon`.
- `innerHTML`, `insertAdjacentHTML`, and `outerHTML` are restricted for public chrome UI.
- `createElement` and `textContent` are allowed for small behavior only.

## Inputs from previous task

TASK-002L created:

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `npm run check:public-dom`

The audit found 5 allowlisted restricted usages:

1. `src/modules/legacy-app/legacy-app.js` line around 1787 — legacy HTML strip helper.
2. `src/modules/legacy-app/legacy-app.js` line around 6289 — legacy HTML parsing fallback for Blogger post body.
3. `src/modules/legacy-app/legacy-app.js` line around 7644 — legacy outline preview text extraction.
4. `apps/landing/landing.html` line around 3302 — legacy HTML strip helper in inline script.
5. `apps/landing/landing.html` line around 3362 — landing discovery command panel render.

This task should prioritize the UI/chrome case, especially the landing discovery command panel. Do not force risky rewrites for text-extraction helpers.

## Goal

Move public UI/chrome generation patterns to HTML/template and tighten the DOM policy/check so future large UI hidden in JS is caught.

## Files likely to inspect/edit

Read only what is needed:

- `apps/landing/landing.html`
- `src/modules/legacy-app/legacy-app.js`
- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `package.json`
- `scripts/task002m-acceptance.sh` (create)
- `tasks/active/TASK-002M-MOVE-LEGACY-UI-GENERATION-TO-TEMPLATE.md` (create)

Optional if needed:

- `apps/blog/index.xml`
- `apps/store/store.html`
- `src/modules/public-softcode/public-softcode.js`

## Required implementation

### 1. Landing discovery command panel

Find the landing inline script that renders the discovery command panel and uses `innerHTML` or string HTML.

Move the command row/item structure into an HTML `<template>` in `apps/landing/landing.html`.

Recommended template shape:

```html
<template id="gg-landing-discovery-command-template">
  <button class="gg-landing-discovery-command" type="button" data-gg-discovery-command>
    <span class="gg-icon" data-gg-icon="search" aria-hidden="true"></span>
    <span class="gg-landing-discovery-command__label" data-gg-command-label></span>
  </button>
</template>
```

Actual class names may follow existing landing naming. Preserve current visual behavior.

JS should:

- Query the template.
- Clone it.
- Fill label via `textContent`.
- Set `data-*`, `aria-*`, classes as needed.
- Use `replaceChildren()` or safe remove/append patterns to clear and render the list.
- Avoid `innerHTML` for this UI.

Do not break landing page.

### 2. Keep text extraction helpers allowlisted if safe

Do not do risky rewrites for helpers that use `innerHTML` only to strip/parse HTML from Blogger content or read-only preview extraction. Keep allowlisted with clear reasons.

But update policy/docs to distinguish:

- `uiGeneration`: must use HTML/template.
- `textExtraction`: temporary allowlist, not UI rendering.
- `bloggerBodyParsing`: temporary allowlist, not public chrome generation.

### 3. Empty-state/template inventory

Add a small documented inventory of UI structures that should live in HTML/XML or templates. This can be in:

- `docs/public-dom-generation-audit.md`, and/or
- `config/public-dom-generation-policy.json`

Include at least:

- saved empty state
- comments empty state
- search empty/no results
- offline fallback
- discovery command panel
- preview/action buttons

Do not migrate all of them now. Inventory only, except the landing discovery command panel.

### 4. Strengthen `check:public-dom`

Update `checks/public-dom.check.mjs` so it verifies:

- The landing discovery command panel template exists.
- The landing discovery command panel no longer has unallowlisted `innerHTML` UI rendering.
- Any remaining restricted APIs are allowlisted with a `reason` and `category`.
- There are no `insertAdjacentHTML` or `outerHTML` usages in public Blog/Store/Landing modules unless allowlisted.
- `check:public-dom` still passes.

Do not overfit line numbers that will drift. Prefer stable pattern/file checks.

### 5. Acceptance script

Create `scripts/task002m-acceptance.sh`.

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

Then verify with lightweight grep/node checks:

- `apps/landing/landing.html` contains `<template` and `gg-landing-discovery-command` or an equivalent task-specific discovery command template marker.
- `apps/landing/landing.html` does not use `innerHTML` for the discovery command render path.
- `config/public-dom-generation-policy.json` contains template/HTML policy and allowlist categories.
- `docs/public-dom-generation-audit.md` mentions the rule: large public UI must live in HTML/XML or templates.

### 6. Task note

Create:

`tasks/active/TASK-002M-MOVE-LEGACY-UI-GENERATION-TO-TEMPLATE.md`

Include:

- Goal
- Files changed
- What was migrated
- What remains allowlisted
- Non-goals
- Acceptance commands
- Next recommended task

## Hard boundaries

- Do not implement Blogger OAuth.
- Do not install Tailwind/shadcn/Tiptap/React.
- Do not split all legacy JS.
- Do not restructure Store folder.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.
- Do not delete all `createElement` or `textContent` usage.
- Do not remove fallback text from HTML/XML/templates.
- Do not use `material-symbols-*` as public icon contract. Use `gg-icon` if touching icon markup.

## Final acceptance command

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-acceptance.sh
```

Return a concise report: status, files changed, remaining allowlisted restricted API uses, and non-goals.
