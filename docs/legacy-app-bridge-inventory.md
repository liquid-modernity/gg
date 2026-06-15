# Legacy App Bridge Inventory

## Purpose

`src/modules/legacy-app/legacy-app.js` is the temporary runtime bridge that keeps the public Blog experience working while behavior is moved into smaller purpose-specific modules. The bridge may coordinate state, clone templates, set text/attributes/ARIA, and wire behavior. It must not become the place where visible public UI structure is authored.

## Current Runtime Role

The bridge is currently first in `registry/modules.json` bundle order and owns the public `window.GG` runtime surface. It initializes route and surface state, hydrates Blog templates from `apps/blog/index.xml`, coordinates sheets and docks, preserves Blogger native compatibility, and exposes QA/debug helpers used by local smoke checks.

Current bridge size at TASK-002N start:

- `src/modules/legacy-app/legacy-app.js`: 472767 bytes, 11217 lines.
- `src/modules/legacy-app/legacy-app.css`: 119 bytes, 2 lines.
- Public DOM status: `createElement=6`, `allowedSmall=0`, `allowedReviewed=6`, `needsTemplate=0`, `unclassified=0`.

TASK-002N-B extracted the first helper seam:

- `src/modules/template-hydration/template-hydration.js` now owns `getTemplateElement()` and `cloneTemplateElement()`.
- `src/modules/legacy-app/legacy-app.js` consumes `GG.templateHydration.cloneTemplateElement` and no longer defines inline `function cloneTemplateElement`.
- After extraction, `src/modules/legacy-app/legacy-app.js` is 472631 bytes and 11213 lines.

TASK-002N-C extracted a comments/replies helper seam:

- `src/modules/comments-bridge/comments-bridge.js` owns low-risk URL/hash/permalink/reply-handle helpers.
- `src/modules/legacy-app/legacy-app.js` consumes the seam through `GG.commentsBridge` while keeping comments sheet orchestration, Blogger native reply behavior, event lifecycle, and mutation-heavy UI flows inside the bridge.
- After extraction, `src/modules/legacy-app/legacy-app.js` is 469827 bytes and 11119 lines.

TASK-002N-D extracted a saved listing helper seam:

- `src/modules/saved-listing-bridge/saved-listing-bridge.js` owns saved article URL normalization, saved item sanitization, JSON parse/stringify, localStorage read/write wrappers, saved lookup, and saved-list toggle calculation.
- `src/modules/legacy-app/legacy-app.js` consumes the seam through `GG.savedListingBridge` while keeping saved listing rendering, save/unsave event lifecycle, preview/detail payload sourcing, and route orchestration inside the bridge.
- After extraction, `src/modules/legacy-app/legacy-app.js` is 468262 bytes and 11063 lines.

TASK-002N-D-PATCH-2 tightened the saved listing runtime presentation contract:

- `src/modules/legacy-app/legacy-app.js` still owns saved listing orchestration, but now marks native listing rows with `data-gg-native-row="true"` before hiding them.
- Saved and Popular listing modes set `data-gg-listing-mode` on the listing root, hide native rows, hide load-more/pagination, and render dynamic rows as the active listing surface.
- The listing toolbar label is synchronized to `Saved` while Saved mode is active so the visible mode control no longer remains on `Latest`.
- After PATCH-2, `src/modules/legacy-app/legacy-app.js` is 471418 bytes and 11131 lines.

TASK-002N-E extracted a Popular/Related helper seam:

- `src/modules/popular-related-bridge/popular-related-bridge.js` owns low-risk Popular range normalization, href, label helpers, Related date scoring, related post normalization, page state, and dot state helpers.
- `src/modules/legacy-app/legacy-app.js` consumes the seam through `GG.popularRelatedBridge` while keeping Popular rendering, Blogger widget parsing, Related rendering, template hydration, and event orchestration inside the bridge.
- After extraction, `src/modules/legacy-app/legacy-app.js` is 471314 bytes and 11128 lines.

## Domain Buckets

| Bucket | Current owner | Future target | Notes |
|---|---|---|---|
| boot/runtime wiring | `legacy-app.js`, `registry/modules.json` | `src/modules/runtime/runtime.js` or existing shell module | Initializes `GG`, state, route contracts, panel APIs, QA exports, and idle boot sequence. |
| template cloning / DOM hydration glue | `src/modules/template-hydration/template-hydration.js`, `legacy-app.js`, `apps/blog/index.xml` | `src/modules/template-hydration/template-hydration.js` | TASK-002N-B extracted template lookup and first-element cloning. Legacy business logic still calls the helper while hydrating templates. |
| comments sheet / replies | `src/modules/comments-bridge/comments-bridge.js`, `legacy-app.js`, comments templates/CSS | `src/modules/comments/comments.js` | TASK-002N-C extracted URL/hash/permalink/reply-handle helpers. Sheet open/close, native Blogger wrapping, replies, composer, copy/delete, status, and menus remain in `legacy-app.js`. |
| saved listing / saved state | `src/modules/saved-listing-bridge/saved-listing-bridge.js`, `legacy-app.js`, listing templates | `src/modules/listing/listing.js` | TASK-002N-D extracted saved data/storage/toggle helpers. PATCH-2 keeps saved listing render, mode exclusivity, native row hiding, toolbar label sync, save/unsave event lifecycle, preview/detail payload sourcing, and route orchestration in `legacy-app.js`. |
| popular controls | `src/modules/popular-related-bridge/popular-related-bridge.js`, `legacy-app.js`, listing templates | `src/modules/listing/listing.js` | TASK-002N-E extracted range normalization, href, and label helpers. Popular rendering, Blogger popular widget parsing, and range template hydration remain in `legacy-app.js`. |
| related posts / prev-next / dots | `src/modules/popular-related-bridge/popular-related-bridge.js`, `legacy-app.js`, detail templates | `src/modules/detail/detail.js` | TASK-002N-E extracted related date scoring, post normalization, page state, and dot state helpers. Related rendering, card hydration, and detail context use remain in `legacy-app.js`. |
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
