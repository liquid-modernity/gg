# CLINE SNIPER — TASK-002N-C — Extract Comments/Replies Bridge Seam

You are editing the GG/PakRPP repo.

## Mission

Extract a small, safe comments/replies helper seam from:

```txt
src/modules/legacy-app/legacy-app.js
```

into:

```txt
src/modules/comments-bridge/comments-bridge.js
src/modules/comments-bridge/comments-bridge.contract.json
```

This task is a **bridge seam extraction**, not a comments rewrite.

## Background

Recent tasks established:

- template-first public DOM
- `needsTemplate=0`
- `unclassified=0`
- a `template-hydration` helper module
- `check:legacy-bridge` baseline and guard

`legacy-app.js` is still large. This task starts moving comments/replies helper code into a dedicated module while keeping legacy-app as the orchestrator.

## Do Not Overread

Start by reading only:

```txt
src/modules/legacy-app/legacy-app.js
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
src/modules/template-hydration/template-hydration.js
config/legacy-app-bridge-policy.json
docs/legacy-app-bridge-inventory.md
checks/legacy-bridge.check.mjs
checks/public-dom.check.mjs
registry/modules.json
tools/build.mjs
package.json
```

Then search narrowly for:

```txt
comment
reply
replies
commentId
parentId
hash
permalink
comment URL
replies context
comment sheet
```

Do not perform a broad rewrite.

## Required New Module

Create:

```txt
src/modules/comments-bridge/comments-bridge.js
src/modules/comments-bridge/comments-bridge.contract.json
```

The module should expose a small namespace, preferably:

```js
GG.commentsBridge
```

and may also use `export` only if the existing build system handles it like `template-hydration`.

Good helper candidates are **pure or nearly pure** functions such as:

- normalize comment ID / reply ID
- derive URL hash or permalink fragment
- test direct comment/reply target shape
- build safe selector strings or selector suffixes
- normalize reply context data shape
- set small aria/class state helpers only if already isolated
- safe text fallback helpers for comments/replies

The exact function names should match the existing code. Do not invent a parallel comments framework.

## Required Extraction Signal

`legacy-app.js` must call at least two distinct helpers through:

```txt
GG.commentsBridge.*
```

This ensures the seam is real while keeping scope small.

## Keep in legacy-app.js

Do **not** move these yet:

- full comments/replies state machine
- event binding lifecycle
- sheet open/close orchestration
- Blogger comment iframe/form behavior
- direct URL resolver orchestration
- mutation-heavy UI rendering flows
- saved listing logic
- popular controls
- related posts
- parsing helpers outside comments/replies

## Public DOM / Template Contract

Do not add:

```txt
innerHTML
insertAdjacentHTML
outerHTML
```

Do not add new user-visible `createElement` calls.

`check:public-dom` must remain:

```txt
needsTemplate=0
unclassified=0
```

## Build Contract

The public build is currently a classic browser bundle. Follow the `template-hydration` precedent:

- ensure `comments-bridge` is bundled before `legacy-app`,
- use the global namespace in `legacy-app` if needed,
- update `tools/build.mjs` and/or `registry/modules.json` carefully,
- do not force static ESM imports into `legacy-app.js` if that breaks the bundle.

## Documentation Updates

Update:

```txt
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
docs/legacy-app-bridge-inventory.md
registry/modules.json
```

Document that comments/replies now has an extracted bridge seam and that `legacy-app.js` still owns orchestration.

## Acceptance Script

Create:

```txt
scripts/task002n-c-acceptance.sh
```

The script must verify:

1. `src/modules/comments-bridge/comments-bridge.js` exists.
2. `src/modules/comments-bridge/comments-bridge.contract.json` exists.
3. `comments-bridge.js` exposes/defines `commentsBridge`.
4. `legacy-app.js` calls at least two distinct `GG.commentsBridge.*` helpers.
5. Build metadata references `comments-bridge` before or alongside `legacy-app`.
6. `comments-bridge.js` does not use `innerHTML`, `insertAdjacentHTML`, `outerHTML`.
7. `comments-bridge.js` does not use `document.createElement` for user-visible UI.
8. `npm run check:public-dom` reports `needsTemplate=0` and `unclassified=0`.
9. `npm run check:legacy-bridge` passes.
10. No generated output under `dist/**` or `.cloudflare-build/**` is edited manually.

## Required Final Command

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-c-acceptance.sh
```

## Final Response Format

Return:

```txt
TASK-002N-C complete.

Files changed:
- ...

Extraction:
- commentsBridge helpers exposed: ...
- legacy-app now uses GG.commentsBridge.* for ...

Counts:
- legacy-app bytes/lines before/after if available
- check:public-dom summary
- check:legacy-bridge summary

No runtime behavior intentionally changed.
```
