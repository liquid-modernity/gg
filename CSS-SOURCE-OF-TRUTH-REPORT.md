# CSS/JS Source Of Truth Cleanup Report

Scope: `TASK-CSS-SOURCE-OF-TRUTH-CLEANUP-001` only.

## Folder Role Map

- `src/`: canonical human-editable source. CSS/JS changes start here unless a route file is explicitly standalone.
- `assets/`: public route/runtime assets. `assets/store/*` is Store runtime output from `src/store/*`; `assets/landing/*`, `assets/dashboard/*`, and `assets/knowledge base/*` are route-specific public assets.
- `__gg/`: generated/staged Blogger app runtime assets from `tools/template-pack.mjs`.
- `dist/`: generated publish/build artifacts from template and Store tools.
- `.cloudflare-build/`: temporary deployment staging from `tools/cloudflare-prepare.mjs`.
- `store/`: generated Store HTML/data route artifacts, except Store source remains under `src/store/*`.
- `tools/`: mutating build/deploy tools.
- `qa/`: read-only guards, live smoke scripts, and advisory/manual audit helpers.

## CSS Classification

## Task 10 Visual Rhythm Ownership

Global visual rhythm is owned by shared tokens, source-owned component contracts, and route/surface adapters. It does not require every route to load every rule, and it does not require every component to live in its own CSS file.

| Task 10 category | Active files | Ownership and build path |
| --- | --- | --- |
| `critical` | `src/css/gg-critical.source.css`, `src/store/store.critical.css` | First-paint source only. Blogger critical CSS is inlined by `tools/template-pack.mjs`; Store critical CSS is consumed by the Store build. |
| `tokens/base` | `src/css/components/gg-visual-tokens.css`, `src/css/modules/visual-tokens.css`, `src/css/modules/tokens.css`, `src/css/modules/base.css`, token/base sections inside `src/css/gg-app.source.css`, `landing.html`, and `src/store/store.css` | Visual-token component source is synced by `tools/sync-shared-css-components.mjs`; manual module maps remain advisory unless explicitly wired. |
| `shared component` | `src/css/components/gg-sheet-core.css`, `src/css/components/gg-sheet-modal.css`, `src/css/components/gg-preview-frame.css`, `src/css/components/gg-more-sheet.css`, `src/css/components/gg-discovery-sheet.css`, `src/css/modules/detail-toolbar.css` | Shared component/module sources are registered in `tools/sync-shared-css-components.mjs` and then copied into app, landing, Store, or generated module mirror outputs. |
| `surface-specific` | `src/css/modules/comments.css`, `src/css/modules/discovery.css`, `src/css/modules/more.css`, `src/css/modules/preview-frame.css`, `src/css/modules/sheets.css`, `src/css/modules/detail-outline.css`, `src/css/modules/detail.css`, `src/css/modules/dock.css`, `src/css/modules/feedback.css`, `src/css/modules/listing.css`, `src/css/modules/motion.css`, `src/css/modules/responsive.css`, `src/css/modules/shell.css`, `src/css/modules/theme.css` | Surface files are either generated mirrors from shared component source or advisory/manual maps for the current app bundle. Live Blogger bundle edits still land in `src/css/gg-app.source.css` unless a module is explicitly wired. |
| `route-specific` | `src/css/gg-app.source.css`, `src/store/store.css`, `src/landing/landing.css`, `src/dashboard/dashboard.css`, `src/knowledge base/knowledgebase.css`, `assets/landing/landing.css`, `assets/dashboard/dashboard.css`, `assets/knowledge base/knowledgebase.css` | Blogger app CSS is copied by `tools/template-pack.mjs`; Store CSS is copied by `npm run store:build`; static route CSS under `assets/*` is a public route mirror and must remain byte-identical with its `src/*` counterpart. |
| `generated` | `src/css/modules/discovery.css`, `src/css/modules/more.css`, `src/css/modules/preview-frame.css`, `src/css/modules/sheets.css`, `src/css/modules/visual-tokens.css`, `assets/store/store.css`, `__gg/assets/css/*`, `dist/assets/css/*`, `.cloudflare-build/public/**/css/*`, Store route HTML | Generated or staged outputs must be rebuilt from source, not patched manually. |
| `dead/legacy` | No active CSS source is intentionally classified as dead. Deleted stale editable-looking files remain listed below with proof. | Any future dead/legacy CSS file needs usage proof before removal and must stay out of runtime/build paths. |
| `forbidden patch/override` | No active CSS patch, override, hotfix, or emergency layer is allowed. | Fix the owning source file or registered component instead of adding an override layer. |

Mandatory CSS guards stay architecture-level: generated CSS parity, declared build paths, registered modules/components, obvious patch/override layers, and clearly unused large CSS artifacts. Detailed style checks such as token consistency, visual rhythm drift, selector naming, component spacing, zero-duplication goals, optimization opportunities, and non-critical size warnings are advisory only.

Task 10 guard command:

```bash
npm run gaga:verify-css-source-visual-rhythm
```

| Path | Classification | Build/runtime proof |
| --- | --- | --- |
| `src/css/gg-app.source.css` | CANONICAL_SOURCE | Copied by `tools/template-pack.mjs` to `__gg/assets/css/*` and `dist/assets/css/*`; linked by `index.xml`. |
| `src/css/gg-critical.source.css` | CRITICAL_INLINE_SOURCE | Inlined into Blogger publish artifact by `tools/template-pack.mjs`; copied to generated critical CSS outputs. |
| `src/css/components/gg-discovery-sheet.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; guarded by component and cleanup guards. |
| `src/css/components/gg-more-sheet.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; guarded by component and cleanup guards. |
| `src/css/components/gg-preview-frame.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; guarded by component, preview, and cleanup guards. |
| `src/css/components/gg-sheet-core.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; mirrored to `src/css/modules/sheets.css`. |
| `src/css/components/gg-sheet-modal.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; injected into app, landing, Store, and dock CSS. |
| `src/css/components/gg-visual-tokens.css` | CANONICAL_SOURCE | Read by `tools/sync-shared-css-components.mjs`; mirrored to `src/css/modules/visual-tokens.css`. |
| `src/css/modules/base.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of the app CSS base section; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/comments.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of Blogger-native comments styling; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/detail-outline.css` | ADVISORY_OR_MANUAL | Non-canonical manual map read by focused guards; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/detail-toolbar.css` | CANONICAL_SOURCE | Wired by `tools/sync-shared-css-components.mjs` into `src/css/gg-app.source.css` as `module-detail-toolbar`; edits reach generated app CSS after `npm run gaga:template:pack`. |
| `src/css/modules/detail.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of detail article CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/discovery.css` | GENERATED_OUTPUT | Generated mirror of `src/css/components/gg-discovery-sheet.css`; do not edit manually. |
| `src/css/modules/dock.css` | ADVISORY_OR_MANUAL | Non-canonical manual map with a generated modal sub-block; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/feedback.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of search/404 feedback CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/listing.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of listing CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/more.css` | GENERATED_OUTPUT | Generated mirror of `src/css/components/gg-more-sheet.css`; do not edit manually. |
| `src/css/modules/motion.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of motion/reduced-motion CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/preview-frame.css` | GENERATED_OUTPUT | Generated mirror of `src/css/components/gg-preview-frame.css`; do not edit manually. |
| `src/css/modules/responsive.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of responsive CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/sheets.css` | GENERATED_OUTPUT | Generated mirror of `src/css/components/gg-sheet-core.css`; do not edit manually. |
| `src/css/modules/shell.css` | ADVISORY_OR_MANUAL | Non-canonical manual map of shell/layout CSS; edit `src/css/gg-app.source.css` for live bundle changes. |
| `src/css/modules/theme.css` | ADVISORY_OR_MANUAL | Non-canonical manual map read by theme guard; edit `src/css/gg-app.source.css` and critical CSS for live theme changes. |
| `src/css/modules/tokens.css` | ADVISORY_OR_MANUAL | Non-canonical manual token map; edit `src/css/gg-app.source.css` and route critical CSS for live token changes. |
| `src/css/modules/visual-tokens.css` | GENERATED_OUTPUT | Generated mirror of `src/css/components/gg-visual-tokens.css`; do not edit manually. |
| `src/store/store.css` | ROUTE_SPECIFIC_SOURCE | Store source CSS; copied to `assets/store/store.css` by `npm run store:build`. |
| `src/store/store.critical.css` | CRITICAL_INLINE_SOURCE | Store first-paint CSS; injected into guarded Store markup by Store build. |
| `assets/store/store.css` | PUBLIC_RUNTIME_ASSET | Generated Store runtime asset from `src/store/store.css`; do not edit manually. |
| `src/dashboard/dashboard.css` | ROUTE_SPECIFIC_SOURCE | Dashboard static route CSS source; guarded to match the public route mirror. |
| `src/knowledge base/knowledgebase.css` | ROUTE_SPECIFIC_SOURCE | Knowledge base static route CSS source; guarded to match the public route mirror. |
| `src/landing/landing.css` | ROUTE_SPECIFIC_SOURCE | Landing static route CSS source; guarded to match the public route mirror. |
| `assets/dashboard/dashboard.css` | PUBLIC_RUNTIME_ASSET | Dashboard public route mirror from `src/dashboard/dashboard.css`; do not diverge manually. |
| `assets/knowledge base/knowledgebase.css` | PUBLIC_RUNTIME_ASSET | Knowledge base public route mirror from `src/knowledge base/knowledgebase.css`; do not diverge manually. |
| `assets/landing/landing.css` | PUBLIC_RUNTIME_ASSET | Landing public route mirror from `src/landing/landing.css`; do not diverge manually. |
| `__gg/assets/css/gg-app.dev.css` | GENERATED_OUTPUT | Copied from `src/css/gg-app.source.css` by `tools/template-pack.mjs`. |
| `__gg/assets/css/gg-app.min.css` | GENERATED_OUTPUT | Copied from `src/css/gg-app.source.css` by `tools/template-pack.mjs`. |
| `__gg/assets/css/gg-critical.css` | GENERATED_OUTPUT | Copied from `src/css/gg-critical.source.css` by `tools/template-pack.mjs`. |
| `dist/assets/css/gg-app.dev.css` | GENERATED_OUTPUT | Copied from `src/css/gg-app.source.css` by `tools/template-pack.mjs`. |
| `dist/assets/css/gg-app.min.css` | GENERATED_OUTPUT | Copied from `src/css/gg-app.source.css` by `tools/template-pack.mjs`. |
| `dist/assets/css/gg-critical.css` | GENERATED_OUTPUT | Copied from `src/css/gg-critical.source.css` by `tools/template-pack.mjs`. |
| `store/*/index.html` and `store-*.html` | GENERATED_OUTPUT | Store generated route artifacts; CSS is embedded from Store build source. |

## JS Classification

| Path | Classification | Build/runtime proof |
| --- | --- | --- |
| `src/js/gg-app.source.js` | CANONICAL_SOURCE | Copied by `tools/template-pack.mjs` to `__gg/assets/js/*` and `dist/assets/js/*`; linked by `index.xml`. |
| `src/js/boot/theme-preboot.js` | CRITICAL_INLINE_SOURCE | Early theme/no-flash source; intentionally kept for SSR boot behavior. |
| `src/js/boot/body-startup.js` | CRITICAL_INLINE_SOURCE | Early body startup source; intentionally kept for first-paint/boot behavior. |
| `src/js/modules/*` | CANONICAL_SOURCE | Blogger app fragment source/reference slices for `src/js/gg-app.source.js`; protected by source docs and JS/runtime guards. |
| `src/store/store-core.js` | ROUTE_SPECIFIC_SOURCE | Store runtime source; copied to `assets/store/store-core.js` by Store build. |
| `src/store/store-discovery.js` | ROUTE_SPECIFIC_SOURCE | Store discovery source with generated config/LCP seed in output. |
| `src/store/store.js` | ROUTE_SPECIFIC_SOURCE | Store legacy/runtime source; copied by Store build. |
| `src/store/*.config.mjs` and `src/store/lib/*.mjs` | BUILD_TOOL | Store config and build/render/validation modules used by Store build/proof. |
| `assets/store/store-core.js` | PUBLIC_RUNTIME_ASSET | Generated Store runtime asset from `src/store/store-core.js`. |
| `assets/store/store-discovery.js` | PUBLIC_RUNTIME_ASSET | Generated Store runtime asset from `src/store/store-discovery.js` plus generated config. |
| `assets/store/store.js` | PUBLIC_RUNTIME_ASSET | Generated Store runtime asset from `src/store/store.js`. |
| `assets/dashboard/dashboard.js` | ROUTE_SPECIFIC_SOURCE | Dashboard static route asset. |
| `assets/knowledge base/knowledgebase.js` | ROUTE_SPECIFIC_SOURCE | Knowledge base static route asset. |
| `assets/landing/landing.js` | ROUTE_SPECIFIC_SOURCE | Landing static route asset. |
| `__gg/assets/js/gg-app.dev.js` | GENERATED_OUTPUT | Copied from `src/js/gg-app.source.js` by `tools/template-pack.mjs`. |
| `__gg/assets/js/gg-app.min.js` | GENERATED_OUTPUT | Copied from `src/js/gg-app.source.js` by `tools/template-pack.mjs`. |
| `dist/assets/js/gg-app.dev.js` | GENERATED_OUTPUT | Copied from `src/js/gg-app.source.js` by `tools/template-pack.mjs`. |
| `dist/assets/js/gg-app.min.js` | GENERATED_OUTPUT | Copied from `src/js/gg-app.source.js` by `tools/template-pack.mjs`. |
| `tools/*.mjs` and `tools/store-build.sh` | BUILD_TOOL | Build/deploy/template/Store tooling. |
| `qa/*-guard.mjs`, `qa/*smoke*.sh`, `qa/template-*.mjs`, `qa/worker-syntax-check.mjs` | READ_ONLY_GUARD | Mandatory or focused guard/smoke files wired through package scripts or documented command sets. |
| `qa/gaga-audit.mjs`, `qa/generate-audit-zip.js`, `qa/package-audit.mjs`, `qa/verify-copy-registry.mjs`, `qa/verify-css-map.mjs`, `qa/verify-css-sot.mjs` | ADVISORY_OR_MANUAL | Documented advisory/manual helpers; not deleted. |

## Deleted Stale Files With Proof

### `_headers.bak.20260504-164650`

- Removed path/block: entire file.
- Usage searched: `rg -n -F "_headers.bak.20260504-164650" . --glob '!node_modules/**'`.
- Result: only the task file referenced the path before deletion.
- Package/tools/QA/template/Cloudflare/runtime references: none found.
- Build proof: `tools/cloudflare-prepare.mjs` requires `_headers`, not backup snapshots.
- Diff proof: `diff -u _headers _headers.bak.20260504-164650` showed old divergent `X-GG-Assets` headers and missing current header parity.
- Why unused/stale: timestamped backup file, not part of source, build, staging, or runtime graph.
- Regression guard: `qa/css-source-of-truth-cleanup-guard.mjs` fails if the file returns or active files reference it.

### `_headers.bak.clean-20260504-165904`

- Removed path/block: entire file.
- Usage searched: `rg -n -F "_headers.bak.clean-20260504-165904" . --glob '!node_modules/**'`.
- Result: only the task file referenced the path before deletion.
- Package/tools/QA/template/Cloudflare/runtime references: none found.
- Build proof: `tools/cloudflare-prepare.mjs` requires `_headers`, not backup snapshots.
- Diff proof: `diff -u _headers _headers.bak.clean-20260504-165904` showed duplicated stale `__gg` sections and old `X-GG-Assets` headers.
- Why unused/stale: cleanup backup file, not part of source, build, staging, or runtime graph.
- Regression guard: `qa/css-source-of-truth-cleanup-guard.mjs` fails if the file returns or active files reference it.

### `index.html.css.js.xml`

- Removed path/block: entire file.
- Usage searched: `rg -n -F "index.html.css.js.xml" . --glob '!node_modules/**'`.
- Result: only the task file referenced the path before deletion.
- Package/tools/QA/template/Cloudflare/runtime references: none found.
- Build proof: `tools/template-pack.mjs` reads `index.xml`; no build tool reads `index.html.css.js.xml`.
- Diff proof: `diff -u index.xml index.html.css.js.xml` showed an older divergent Blogger template with stale title/schema/theme/Store-filter/comment/sheet behavior.
- Why unused/stale: old template snapshot that looked editable but was not canonical SSR source.
- Regression guard: `qa/css-source-of-truth-cleanup-guard.mjs` fails if the file returns or active files reference it.

## Intentionally Kept Files

- `index.xml`: canonical Blogger SSR/template source; not simplified for aesthetics.
- `src/css/gg-critical.source.css`, Store critical CSS, inline theme boot, and body startup scripts: kept for SSR, no-flash boot, Blogger fallback, schema, and first paint.
- `src/css/modules/comments.css`, Blogger comments markup in `index.xml`, and comments runtime in `src/js/gg-app.source.js`: kept to preserve Blogger-native comments/threaded replies.
- Blog1-safe schema protections in `index.xml` and guards: kept; no `data:schemaPosts`, dynamic root `ItemList`, or filtered root `data:posts` schema loop was added.
- Generated outputs in `__gg/assets/*`, `dist/assets/*`, `dist/blogger-template.publish.*`, `.cloudflare-build/*`, `assets/store/*`, and `store/data/*`: not hand-edited as the primary fix.

## Suspicious But Not Deleted

- `src/js/modules/*`: fragment/reference source is not currently built by an automated JS concatenator. It is retained as documented Blogger app source and future cleanup should either add a deterministic JS fragment packer or collapse the fragments after proof.
- Non-canonical manual CSS module maps under `src/css/modules/*`: retained only where `CSS-MODULE-BUNDLE-WIRING-REPORT.md` and `qa/css-module-bundle-wiring-guard.mjs` explicitly classify them. They are not live bundle inputs unless wired by `tools/sync-shared-css-components.mjs`.
- Advisory/manual QA helpers: retained because `QA-COMMANDS.md` and `SOURCE-OF-TRUTH.md` classify them as advisory/manual.

## Commands Used For Verification

- `git status --short`
- `git ls-files _headers.bak.20260504-164650 _headers.bak.clean-20260504-165904 index.html.css.js.xml _headers index.xml`
- `rg -n -F "_headers.bak.20260504-164650" . --glob '!node_modules/**'`
- `rg -n -F "_headers.bak.clean-20260504-165904" . --glob '!node_modules/**'`
- `rg -n -F "index.html.css.js.xml" . --glob '!node_modules/**'`
- `diff -u _headers _headers.bak.20260504-164650`
- `diff -u _headers _headers.bak.clean-20260504-165904`
- `diff -u index.xml index.html.css.js.xml`
- `npm run gaga:verify-css-sot-cleanup`

## Future Cleanup Candidates

- Add a deterministic JS fragment packer if `src/js/modules/*` should become the executable source of `src/js/gg-app.source.js`.
- Add a deterministic CSS module packer if every `src/css/modules/*` file should become mechanically assembled into `src/css/gg-app.source.css`; until then, only `src/css/modules/detail-toolbar.css` and generated component mirrors are wired.
- Revisit advisory/manual QA helpers only with proof that current package/CI guards fully supersede them.
