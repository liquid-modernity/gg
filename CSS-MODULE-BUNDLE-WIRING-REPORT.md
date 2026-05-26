# CSS Module Bundle Wiring Report

Scope: `TASK-CSS-MODULE-BUNDLE-WIRING-001` only.

## Result

Every `src/css/modules/*.css` and `src/css/components/*.css` file now has one explicit status:

- wired canonical source;
- generated mirror output from a canonical component source;
- documented advisory/manual map that must not be treated as live bundle input.

No files were deleted in this task.

detail-toolbar decision: wired. `src/css/modules/detail-toolbar.css` is live editable source for the Blogger post-detail toolbar. `tools/sync-shared-css-components.mjs` reads it, writes a `module-detail-toolbar` generated block into `src/css/gg-app.source.css`, and `tools/template-pack.mjs` copies the assembled app CSS into `__gg/assets/css/*` and `dist/assets/css/*`.

## Bundle Flow

```txt
src/css/components/*.css
  -> tools/sync-shared-css-components.mjs
  -> generated blocks in src/css/gg-app.source.css, landing.html, src/store/store.css, and selected module mirrors

src/css/modules/detail-toolbar.css
  -> tools/sync-shared-css-components.mjs
  -> /* BEGIN GENERATED: module-detail-toolbar */ in src/css/gg-app.source.css
  -> npm run gaga:template:pack
  -> __gg/assets/css/gg-app.dev.css, __gg/assets/css/gg-app.min.css, dist/assets/css/*

src/css/gg-app.source.css
  -> tools/template-pack.mjs
  -> Blogger app CSS runtime/publish assets
```

## Module And Component Classification

| Path | Classification | Sync tool references it | Build script references it | Appears in `src/css/gg-app.source.css` | HTML/XML/JS reference | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `src/css/components/gg-discovery-sheet.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | indirectly through Discovery markup/classes | wire as component source |
| `src/css/components/gg-more-sheet.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | indirectly through More sheet markup/classes | wire as component source |
| `src/css/components/gg-preview-frame.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | indirectly through Preview markup/classes | wire as component source |
| `src/css/components/gg-sheet-core.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | indirectly through sheet markup/classes | wire as component source |
| `src/css/components/gg-sheet-modal.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | indirectly through modal/dock state classes | wire as component source |
| `src/css/components/gg-visual-tokens.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated block | token-only CSS | wire as component source |
| `src/css/modules/detail-toolbar.css` | CANONICAL_SOURCE | yes, read | yes, via `tools/sync-shared-css-components.mjs` | yes, generated `module-detail-toolbar` block | `index.xml`, `src/js/gg-app.source.js`, JS fragments | wire as module source |
| `src/css/modules/discovery.css` | GENERATED_OUTPUT | yes, written | yes, generated mirror of component | yes, via component block | Discovery classes in markup/runtime | keep generated mirror; do not edit manually |
| `src/css/modules/more.css` | GENERATED_OUTPUT | yes, written | yes, generated mirror of component | yes, via component block | More sheet classes in markup/runtime | keep generated mirror; do not edit manually |
| `src/css/modules/preview-frame.css` | GENERATED_OUTPUT | yes, written | yes, generated mirror of component | yes, via component block | Preview classes in markup/runtime | keep generated mirror; do not edit manually |
| `src/css/modules/sheets.css` | GENERATED_OUTPUT | yes, written | yes, generated mirror of component | yes, via component block | Sheet classes in markup/runtime | keep generated mirror; do not edit manually |
| `src/css/modules/visual-tokens.css` | GENERATED_OUTPUT | yes, written | yes, generated mirror of component | yes, via component block | token-only CSS | keep generated mirror; do not edit manually |
| `src/css/modules/base.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | global element classes | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/comments.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | Blogger-native comments markup/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/detail-outline.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | detail outline markup/runtime and guards | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/detail.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | detail article markup/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/dock.css` | ADVISORY_OR_MANUAL | yes, partial generated modal block only | no full-module bundle input | yes, current app CSS section | dock markup/runtime and shell guard | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/feedback.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | search/404 feedback markup/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/listing.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | listing markup/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/motion.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | global motion preferences | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/responsive.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | responsive app CSS | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/shell.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | shell markup/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/theme.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | theme guard/runtime | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |
| `src/css/modules/tokens.css` | ADVISORY_OR_MANUAL | no | no | yes, current app CSS section | token definitions | keep as manual map; edit `src/css/gg-app.source.css` for live bundle changes |

## Generated And Staged CSS

| Path | Classification | Owner |
| --- | --- | --- |
| `src/css/gg-app.source.css` | CANONICAL_SOURCE | assembled app CSS source copied by `tools/template-pack.mjs` |
| `src/css/gg-critical.source.css` | CRITICAL_INLINE_SOURCE | Blogger first-paint CSS inlined by `tools/template-pack.mjs` |
| `src/store/store.css` | ROUTE_SPECIFIC_SOURCE | Store source copied by `npm run store:build` |
| `assets/store/store.css` | GENERATED_OUTPUT | Store runtime CSS generated from `src/store/store.css` |
| `__gg/assets/css/gg-app.dev.css` | GENERATED_OUTPUT | copied from `src/css/gg-app.source.css` |
| `__gg/assets/css/gg-app.min.css` | GENERATED_OUTPUT | copied from `src/css/gg-app.source.css` |
| `__gg/assets/css/gg-critical.css` | GENERATED_OUTPUT | copied from `src/css/gg-critical.source.css` |
| `dist/assets/css/*` | GENERATED_OUTPUT | Blogger publish asset copies |
| `.cloudflare-build/public/__gg/assets/css/*` | STAGED_PUBLIC_ASSET | Cloudflare deployment staging from generated assets |

## Guard

`qa/css-module-bundle-wiring-guard.mjs` enforces this report. It fails if:

- any CSS module/component exists without an explicit status;
- `src/css/modules/detail-toolbar.css` is not wired into the sync tool and app CSS generated block;
- generated module mirrors drift from component source;
- generated CSS assets drift from source;
- docs or package scripts stop wiring `npm run gaga:verify-css-module-wiring`;
- Blog1-safe schema protections regress.

## Intentional Non-Changes

- No CSS/JS/HTML file was deleted.
- Blogger-native comments CSS and plumbing remain intact.
- Critical inline CSS/JS remains intact.
- `index.xml` was not simplified for aesthetics.
- Blog1-safe schema protections remain intact: no `data:schemaPosts`, no dynamic root `ItemList`, and no filtered root `data:posts` schema loop.
- Route truth remains `/landing = Home`, `/ = Blog`, and breadcrumb `Home(/landing) -> Blog(/) -> current`.
