# CLINE SNIPER — TASK-002M-F — Blog div/link Structural UI Templates

You are working in the GG vNext / PakRPP repo.

## Mission
Migrate the remaining Blog structural UI that is currently created with `document.createElement('div')` and `document.createElement('a')` in `src/modules/legacy-app/legacy-app.js` into purpose-specific `<template>` elements in `apps/blog/index.xml`.

This is a narrow migration task. Do not broaden scope.

## Project rule

Public Blog/Store/Landing must keep large/chrome UI structure visible in HTML/XML or `<template>`:

- HTML/XML/template = visible public UI structure
- JS = state, behavior, clone template, fill text/aria/href/data/icon
- JS must not hide structural UI behind createElement chains

## Target candidates
Migrate only these TASK-002M-E needsTemplate candidates:

1. Reply banner `div` around `gg-comments__reply-banner`
2. Comment more menu `div` around `gg-comment-more__menu`
3. Replies context label `div`
4. Replies context row `div`
5. Replies context copy `div`
6. Replies context meta `div`
7. Replies context body `div`
8. Replies context count `div`
9. Popular range navigation link `a` around `gg-popular-controls__range`

Read `docs/public-dom-generation-audit.md` and `config/public-dom-generation-policy.json` first to locate the exact occurrences and classification.

## Required implementation

### 1. Add purpose-specific templates to `apps/blog/index.xml`
Add templates for the migrated structural UI. Use purpose-specific IDs. Examples of acceptable IDs:

- `gg-template-comment-reply-banner`
- `gg-template-comment-more-menu`
- `gg-template-comment-replies-context`
- `gg-template-popular-range-link`

The exact set may differ if the existing code needs finer granularity, but obey this rule:

> One template per UI purpose / structural family. Do not create one template to cover unrelated elements.

### 2. Replace createElement structural UI in `legacy-app.js`
Use the existing `cloneTemplateElement(id)` helper if present. If a similar helper already exists, reuse it.

JS may still do:

- `textContent = ...`
- `setAttribute(...)`
- `dataset... = ...`
- `classList.toggle(...)`
- `hidden = ...`
- `href = ...`
- `appendChild(...)` for already-cloned nodes

JS should not create the target structural elements directly anymore.

### 3. No generic template
Do NOT add any of these or similar:

- `gg-template-div`
- `gg-template-link`
- `gg-template-element`
- `gg-template-generic`
- `gg-template-button`
- `gg-template-action`

### 4. Update audit/policy/docs
Update `docs/public-dom-generation-audit.md` with before/after status for TASK-002M-F.

Update `config/public-dom-generation-policy.json` if needed so the migrated 9 occurrences are no longer tracked as needsTemplate. Do not weaken the policy.

`npm run check:public-dom` should report `needsTemplate=0` after this task unless there is a legitimate newly discovered candidate. If a new candidate appears, document it instead of hiding it.

### 5. Acceptance script
Create `scripts/task002m-f-acceptance.sh`.

It must run the full validation pipeline and artifact checks.

Minimum artifact checks:

- No `createElement('div')` occurrence remains for the known Blog structural classes:
  - `gg-comments__reply-banner`
  - `gg-comment-more__menu`
  - replies context structural classes/markers identified in audit
- No `createElement('a')` occurrence remains for `gg-popular-controls__range`
- Required purpose-specific template IDs exist in `apps/blog/index.xml`
- No generic universal template IDs exist
- `npm run check:public-dom` passes and does not report unclassified elements

Use robust grep/node parsing where practical. Do not rely only on fragile line numbers.

## Commands to pass

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-f-acceptance.sh
```

## Boundaries

Do not:

- rewrite unrelated legacy code
- migrate allowedSmall or allowedReviewed occurrences
- delete legacy-donor
- restructure Store folders
- implement OAuth/Blogger API
- install dependencies
- edit generated output under `dist/**` or `.cloudflare-build/**`

## Final response expected from Cline
Report:

- before/after counts for `createElement('div')` and `createElement('a')` needsTemplate candidates
- template IDs added
- files changed
- `check:public-dom` final summary
- confirmation that no universal/generic template was created
