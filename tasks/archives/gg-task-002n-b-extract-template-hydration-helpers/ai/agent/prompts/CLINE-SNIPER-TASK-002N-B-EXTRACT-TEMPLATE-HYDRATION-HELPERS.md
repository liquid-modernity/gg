# CLINE SNIPER — TASK-002N-B — Extract Template Hydration Helpers from legacy-app

You are editing the GG/PakRPP repo.

## Mission

Extract the stable template hydration helper seam from:

```txt
src/modules/legacy-app/legacy-app.js
```

into a focused module:

```txt
src/modules/template-hydration/template-hydration.js
```

This is a low-risk modularization task. It must not change public UI behavior.

## Background

Recent tasks established a template-first public DOM contract:

- `needsTemplate=0`
- `unclassified=0`
- user-visible UI/chrome structure is now in XML/HTML templates
- JS should clone templates, hydrate state/text/aria/icon, and wire behavior

TASK-002N created a bridge inventory and guard for `legacy-app.js`.

This task begins reducing the bridge by extracting only the stable helper layer.

## Do Not Overread

Start by reading only:

```txt
src/modules/legacy-app/legacy-app.js
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
docs/legacy-app-bridge-inventory.md
checks/legacy-bridge.check.mjs
checks/public-dom.check.mjs
package.json
```

Then search narrowly for:

```txt
cloneTemplateElement
template
content.cloneNode
firstElementChild
data-gg-copy
data-gg-icon
```

Do not perform a broad rewrite.

## Required Extraction

Create:

```txt
src/modules/template-hydration/template-hydration.js
```

Export at minimum:

```js
export function cloneTemplateElement(id, options = {}) { ... }
```

The helper should:

- find a `<template>` by id,
- clone `template.content`,
- return the first element child,
- fail safely with `null` unless the current legacy behavior throws,
- preserve the current behavior of all existing call sites,
- avoid `innerHTML`,
- avoid generating user-visible structure via `createElement`.

Optional exports are allowed only if directly useful and low-risk:

```js
export function getTemplateElement(id) { ... }
export function requireTemplateElement(id) { ... }
export function setText(node, selector, value) { ... }
export function setIcon(node, selector, iconName) { ... }
```

Do not create a large framework. Keep this module small and boring.

## Update legacy-app.js

Replace inline helper code with imports from the new module.

Preferred:

```js
import { cloneTemplateElement } from '../template-hydration/template-hydration.js';
```

Adapt the relative import based on actual file location.

If `legacy-app.js` already has import style, follow it. If the build does not support imports in this source file, stop and explain in the final output rather than forcing a global.

## Guardrails

Do not touch generated files:

```txt
dist/**
.cloudflare-build/**
```

Do not delete:

```txt
legacy-donor/**
src/modules/legacy-app/**
```

Do not split business logic:

- comments/replies logic stays in legacy-app
- saved listing logic stays in legacy-app
- popular controls stays in legacy-app
- related posts stays in legacy-app
- parsing helpers stay in legacy-app

No OAuth. No store restructure. No dependency install.

## Documentation Updates

Update:

```txt
src/modules/legacy-app/bridge-map.json
docs/legacy-app-bridge-inventory.md
config/legacy-app-bridge-policy.json
```

Document that the template hydration seam has been extracted and that `legacy-app.js` now depends on the new helper module.

## Acceptance Script

Create:

```txt
scripts/task002n-b-acceptance.sh
```

The script must:

1. Run the full pipeline or be compatible with the full pipeline.
2. Verify `src/modules/template-hydration/template-hydration.js` exists.
3. Verify it exports `cloneTemplateElement`.
4. Verify `legacy-app.js` imports/uses the new helper module.
5. Verify `legacy-app.js` no longer contains an inline `function cloneTemplateElement`.
6. Verify `npm run check:public-dom` still passes with `needsTemplate=0` and `unclassified=0`.
7. Verify `npm run check:legacy-bridge` passes.
8. Verify no generic template was introduced.

## Required Final Command

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-b-acceptance.sh
```

## Final Response Format

Return:

```txt
TASK-002N-B complete.

Files changed:
- ...

Extraction:
- cloneTemplateElement moved to ...
- legacy-app now imports ...

Counts:
- legacy-app bytes/lines before/after if available
- check:public-dom summary
- check:legacy-bridge summary

No runtime behavior intentionally changed.
```
