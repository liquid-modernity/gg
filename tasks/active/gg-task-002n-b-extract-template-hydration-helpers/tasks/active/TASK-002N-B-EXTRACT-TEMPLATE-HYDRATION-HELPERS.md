# TASK-002N-B — Extract Template Hydration Helpers from legacy-app

## Status

Ready for Cline.

## Problem

`src/modules/legacy-app/legacy-app.js` is still a large bridge file. TASK-002N documented it and added a guard, but did not reduce the file.

After the public DOM template-first cleanup, many legacy call sites now depend on template cloning/hydration. This helper seam is stable enough to extract first.

## Goal

Move stable template hydration helper code from `legacy-app.js` into:

```txt
src/modules/template-hydration/template-hydration.js
```

without changing runtime behavior.

## Non-Goals

- No comments/replies split.
- No saved listing split.
- No popular/related split.
- No parsing helper split.
- No OAuth.
- No Store restructure.
- No deletion of `legacy-donor/`.
- No deletion of `legacy-app.js`.

## Acceptance Criteria

- New helper module exists.
- `cloneTemplateElement` is exported from the helper module.
- `legacy-app.js` imports/uses the helper module.
- Inline `function cloneTemplateElement` is removed from `legacy-app.js`.
- `check:public-dom` remains green with `needsTemplate=0` and `unclassified=0`.
- `check:legacy-bridge` remains green.
- Full pipeline passes.
- No generated output is edited manually.

## Command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-b-acceptance.sh
```
