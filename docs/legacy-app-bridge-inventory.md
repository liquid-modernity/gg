# Legacy App Bridge Inventory

## Purpose

`src/modules/legacy-app/legacy-app.js` is the temporary runtime bridge that keeps the public Blog experience working while behavior is moved into smaller purpose-specific modules. The bridge may coordinate state, clone templates, set text/attributes/ARIA, and wire behavior. It must not become the place where visible public UI structure is authored.

## Current Runtime Role

The bridge is currently first in `registry/modules.json` bundle order and owns the public `window.GG` runtime surface. It initializes route and surface state, hydrates Blog templates from `apps/blog/index.xml`, coordinates sheets and docks, preserves Blogger native compatibility, and exposes QA/debug helpers used by local smoke checks.

Current bridge size at TASK-002N start:

- `src/modules/legacy-app/legacy-app.js`: 472767 bytes, 11217 lines.
- `src/modules/legacy-app/legacy-app.css`: 119 bytes, 2 lines.
- Public DOM status: `createElement=6`, `allowedSmall=0`, `allowedReviewed=6`, `needsTemplate=0`, `unclassified=0`.

## Domain Buckets

| Bucket | Current owner | Future target | Notes |
|---|---|---|---|
| boot/runtime wiring | `legacy-app.js`, `registry/modules.json` | `src/modules/runtime/runtime.js` or existing shell module | Initializes `GG`, state, route contracts, panel APIs, QA exports, and idle boot sequence. |
| template cloning / DOM hydration glue | `legacy-app.js`, `apps/blog/index.xml` | template hydration helper module | Keeps visible UI template-first through `cloneTemplateElement()` and part mutation. |
| comments sheet / replies | `legacy-app.js`, comments templates/CSS | `src/modules/comments/comments.js` | Largest runtime bucket: sheet open/close, native Blogger wrapping, replies, composer, copy/delete, status, menus. |
| saved listing / saved state | `legacy-app.js`, listing templates | `src/modules/listing/listing.js` | LocalStorage reads/writes, saved article state, saved listing route/hash, unavailable fallbacks. |
| popular controls | `legacy-app.js`, listing templates | `src/modules/listing/listing.js` | Popular range state, Blogger popular widget parsing, range link hydration. |
| related posts / prev-next / dots | `legacy-app.js`, detail templates | `src/modules/detail/detail.js` | Related scoring, related card hydration, dot pagination, detail context use. |
| offline/error/fallback behavior | `legacy-app.js`, feedback/landing templates | `src/modules/feedback/feedback.js` | Search empty, 404 recovery, preview fetch failure, PWA/offline cache helpers. |
| parsing/extraction helpers | `legacy-app.js` | `src/modules/parsing/parsing.js` | HTML strip/read helpers, feed parsing, date/label extraction, text normalization. |
| store or landing cross-surface references if any | `legacy-app.js`, store runtime loaders, landing HTML | `src/modules/shell/shell.js` | Route vocabulary includes `/store`, `/landing`, contact anchors, store exclusion, and cross-surface discovery actions. |

## Extraction Order

1. Comments bridge module.
2. Saved listing bridge module.
3. Related posts bridge module.
4. Popular controls bridge module.
5. Parsing helpers module.
6. Offline/error/fallback module.
7. Boot/runtime wiring and public `GG` API map.
8. Final legacy bridge deletion.

Each extraction should be small, preserve public behavior, keep `check:public-dom` at `needsTemplate=0` and `unclassified=0`, and move visible UI only by using existing or purpose-specific templates.

## Do Not Delete Yet

Do not delete `legacy-donor/`; it remains reference-only and must not be imported into public runtime code. Do not delete `src/modules/legacy-app/`; the active bridge is still bundled and owns runtime behavior. Do not remove `legacy-app` from `registry/modules.json` until equivalent module JS passes build checks, public DOM checks, and runtime smoke.

## Done Criteria For Removing legacy-app

`legacy-app` can be removed only when all bridge buckets have been extracted into purpose-specific modules, public `GG` compatibility exports have documented owners, Blogger native comments/listing/detail behavior is covered by checks or smoke, no runtime source imports from `legacy-donor/`, and the full validation chain including `check:legacy-bridge` has been replaced with a deletion-ready guard.
