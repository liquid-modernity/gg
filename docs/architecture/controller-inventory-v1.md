# Controller Inventory v1

Task 09 starts with inventory and safe extraction only. Runtime assembly remains unchanged: `src/js/gg-app.source.js` is still the single Blogger app controller asset, `landing.html` still owns the static landing controller, and `src/store/store-discovery.js` still owns the Store controller surface. No Worker HTMLRewriter, schema repair, CMS repair, or readability repair participates in controller behavior.

## Current Modules And Functions

| Source | Current role | Owned surfaces |
| --- | --- | --- |
| `src/js/gg-app.source.js` | Single Blogger runtime controller asset loaded by `index.xml`. It carries copy, route/surface contracts, shared sheet lifecycle, Discovery, preview, comments, More, dock, detail outline, PWA diagnostics, QA hooks, and public API facades. | Blog root listing, search, label, archive, post detail, page detail, Blogger native comments. |
| `src/js/modules/core/*` | Source fragments for copy/contracts/state/public API/events/QA/boot runtime. They document the intended split but are not a separate runtime assembly path. | Blogger runtime controller internals. |
| `src/js/modules/controllers/*` | Source fragments for dock/util helpers, panel lifecycle, gestures, listing growth, locale/appearance, outline/preview, and Discovery. | Blogger runtime controller internals. |
| `src/js/modules/services/*` | Source fragments for feed preview fallback and PWA client behavior. | Blogger runtime controller internals. |
| `landing.html` inline script | Static landing surface controller with local sheet, Discovery, More, outline, dock, theme, reading, motion, and QA snapshot behavior. | `/landing`. |
| `src/store/store-discovery.js` | Store surface controller with product grid, Store preview, Store Discovery, Saved, More, filters, Store sheet lifecycle, and Store QA snapshot. | `/store` and generated Store category views. |
| `src/store/store-core.js` | Lightweight Store bootstrap/fallback loader around `StoreSurface`. | `/store` bootstrap state only. |

## Public API And Hooks

| API/hook | Owner | Compatibility rule |
| --- | --- | --- |
| `window.GG.copy` | Blogger controller | Keep locale/get/setLocale compatibility. |
| `window.GG.command` | Blogger Discovery adapter | Keep `focus`, `render`, `open`, `close`, and `topics.snapshot`. |
| `window.GG.preview` | Blogger preview adapter | Keep `open(row, trigger)` and `close()`. |
| `window.GG.commentsSheetController` | Blogger comments adapter | Keep `open`, `close`, `toggle`, `openComposer`, `openReplies`, `closeReplies`, `syncHash`, focus/body-lock helpers, and `isOpen`. |
| `window.GG.panelController` and `window.GG.sheetController` | Blogger sheet lifecycle | Keep as the canonical public sheet controller and do not introduce competing controllers. |
| `window.GG.qa` | Blogger QA adapter | Keep `snapshot`, smoke helpers, route matrix, panel helpers, and diagnostics. |
| `window.LandingSurface` | Landing controller | Keep `openDiscovery`, `openMore`, `close`, outline controls, `sheetController`, and `snapshot`. |
| `window.StoreSurface` / `window.StoreDiscovery` | Store controller | Keep preview, Discovery, Saved, More, `sheetController`, and `snapshot`. |

Task 09 adds compatibility facades rather than renaming existing hooks:

```txt
GG.core.helpers
GG.registry
GG.route
GG.sheet
GG.a11y
GG.adapters.preview
GG.adapters.discovery
GG.adapters.comments
GG.adapters.more
GG.adapters.store
GG.adapters.landing
GG.sources.root
GG.sources.store
```

## Event Listeners

| Area | Listener types | Side effects |
| --- | --- | --- |
| Blogger global runtime | `click`, `keydown`, `input`, `submit`, `hashchange`, `scroll`, `resize`, `online`, `offline`, `visibilitychange`, service-worker `controllerchange`/messages. | Opens/closes sheets, updates focus and aria state, grows listings, syncs route state, updates PWA diagnostics, schedules comments enhancement. |
| Blogger comments | Delegated clicks plus one bounded `MutationObserver`. | Moves/wraps Blogger-native comments and composer inside GG sheets without replacing native plumbing or fetching comment feeds. |
| Landing runtime | Local sheet clicks/keys/gestures, Discovery input/filter clicks, preference buttons, section observer, hash handling. | Opens/closes landing sheets, updates copy/theme/reading/motion, scrolls to sections. |
| Store runtime | Product card clicks/keys, sheet close/scrim/gesture keys, filter/sort/search inputs, Saved/preview controls, `popstate`, scroll/resize/visibility. | Opens Store preview/utility sheets, filters product data, updates JSON-LD, manages saved localStorage, controls Store sheet history and focus. |

## Data Dependencies

| Data | Source |
| --- | --- |
| Root/editorial feed | `GG_SOURCE_BOUNDARY.rootSource.feed.endpointPath`; no Store feed fetch on Root. |
| Store feed/source | `src/registry/gg-source-boundary.registry.js` through Store build/config; public Store URLs normalize to `https://www.pakrpp.com/store/`. |
| Copy registry | Inline Blogger `COPY`, Landing inline copy table, Store inline `COPY`, and registry JSON used by guards/build. |
| Route registry | `ROUTE_VOCABULARY_CONTRACT`, `SURFACE_LEDGER`, `GG_GLOBAL_DISCOVERY_CONFIG`, Store category config and routes. |
| Product data | Store manifest/static product extraction and optional Store Blogger feed fallback. |
| Comments data | Blogger-native DOM and iframe/composer plumbing only. |

## CSS/Class Dependencies

Shared controller behavior depends on stable classes and attributes including:

- `.gg-sheet`, `.gg-sheet__panel`, `.gg-sheet__scrim`, `.gg-sheet__head`, `.gg-sheet__handle`, `[data-gg-panel]`, `[data-gg-sheet-origin]`, `[data-gg-drag-zone]`, `[data-gg-drag-handle]`, `[data-gg-close]`
- `.gg-entry-row`, `.gg-article`, `.gg-post-body`, `data-gg-*` unified payload attributes
- `.gg-discovery-*`, `.gg-preview-*`, `.gg-more-*`, `.gg-comments-*`
- Store `.store-*` product, preview, Discovery, Saved, filter, and dock selectors

## Source And Feed Dependencies

- Root source is `pakrpp.blogspot.com` with public canonical base `https://www.pakrpp.com/`.
- Store source is `pakrppstore.blogspot.com` plus optional source-only `https://store.pakrpp.com/`, with public canonical Store route `https://www.pakrpp.com/store/`.
- Source URLs must come from declared source/registry/config values, not hardcoded controller fetch paths.
- Worker must not mutate HTML to repair controller, CMS, schema, or readability behavior.

## Safe Extraction Completed In Task 09

- Pure helper access is now behind `GG.core.helpers` in the Blogger controller while legacy local helper names remain as wrappers.
- Registry/source access is surfaced through `GG.registry`, `GG.sources`, and `GG.route` without changing existing call sites.
- `GG.sheet` and `GG.a11y` alias existing sheet and accessibility lifecycle functions; no second sheet controller is introduced.
- Adapter facades point at the existing preview, Discovery, comments, More, Store, and Landing controllers.
- Store and Landing register their active adapters on `window.GG.adapters.*` while preserving `StoreSurface` and `LandingSurface`.

## Deferred Work

Future extraction may move sheet lifecycle and surface adapters into separate runtime modules only after a guarded assembler proves byte-for-byte or behavior parity. Until then, fragments are source documentation and guard targets, not a second runtime controller.
