# FEATURE_WIRING_MAP
Last updated: 2026-02-08

Scope: wiring map for UI features in `public/assets/latest`.

**Wiring Flow**
- `boot.js` waits for first interaction or idle and loads `main.js`.
- `main.js` loads `core.js`.
- `core.js` defines `GG.boot` and calls `GG.boot.requestUi()` to load `modules/ui.js`.
- `modules/ui.js` loads `ui.bucket.core.js` and conditionally loads `ui.bucket.listing.js` and `ui.bucket.post.js` based on DOM.
- `ui.bucket.*` modules register feature init functions and `GG.app.plan` runs them when required selectors exist.

**Flags And Config**
- `public/__gg/flags.json`: only `sw.enabled` is read by `public/assets/latest/modules/pwa.js` (service worker on/off). Default is enabled when the flag is missing or fetch fails.
- UI modules mostly gate themselves by DOM presence and `GG.app.plan` selectors.
- Config overrides exist but are not hard flags, for example `GG.config.library.selectors` and `GG.store.config.searchCacheTTL`.

**Entrypoint Inventory**
- `public/assets/latest/boot.js`: loads `main.js` on `pointerdown` or `keydown`, or idle after load; sets `data-gg-boot=1`; warns on `main.js` failure.
- `public/assets/latest/main.js`: loads `core.js`; sets `data-gg-boot=2`; warns on `core.js` failure.
- `public/assets/latest/core.js`: defines `GG.boot` helpers; binds first-interaction UI request; schedules UI prefetch; `GG.boot.requestUi()` loads `modules/ui.js` and sets `data-gg-boot=3`.
- `public/assets/latest/modules/ui.js`: `GG.modules.ui.init` loads `ui.bucket.core.js` and conditionally `ui.bucket.listing.js` or `ui.bucket.post.js`; binds search triggers and Ctrl/Cmd+K.
- `public/assets/latest/modules/ui.bucket.core.js`: core UI runtime; defines `GG.services.actions`, `GG.modules.Dock`, `GG.modules.Panels`, `GG.modules.InfoPanel`, `GG.modules.PostDetail`, `GG.modules.LeftNav`, `GG.modules.library`, `GG.modules.Shortcodes`, and `GG.app.plan` for selector-driven init.
- `public/assets/latest/modules/ui.bucket.listing.js`: listing modules: `GG.modules.labelTree`, `GG.modules.feed`, `GG.modules.sitemap`, `GG.modules.tagDirectory`, `GG.modules.tagHubPage`, `GG.modules.prefetch`.
- `public/assets/latest/modules/ui.bucket.post.js`: post modules: `GG.modules.breadcrumbs`, `GG.modules.readTime`, TOC boot on `#gg-toc`, `GG.modules.postTagsInline`.
- `public/assets/latest/modules/ui.bucket.search.js`: search dialog; builds UI in `#gg-dialog` or `.gg-dialog-host`; lazy-loads Fuse.js and idb-keyval.
- `public/assets/latest/modules/ui.bucket.poster.js`: share sheet and poster pipeline; expects `#gg-share-sheet` or `#pc-poster-sheet`.
- `public/assets/latest/modules/pwa.js`: manifest + SW registration; reads `/gg-flags.json` and `sw.enabled`.

**Feature Matrix**
| Feature | Purpose | Surfaces | Flags | Module owner | Required DOM hooks | Failure modes | Manual verify |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Smartdock (`gg-dock`) | Primary dock nav, search entry, home/blog anchors | landing, listing, post, page | none | `GG.modules.Dock` (`public/assets/latest/modules/ui.bucket.core.js`) | `nav.gg-dock[data-gg-module="dock"]`<br>`.gg-dock__item`<br>`.gg-dock__search form/input`<br>`data-gg-action` on buttons<br>`main.gg-main[data-gg-surface]` | Dock missing or hidden<br>`data-gg-action` missing on buttons<br>`main.gg-main` missing so home/blog state cannot update | Click Home/Blog/Search in dock; active state and search mode should toggle |
| Command palette (search dialog) | Ctrl/Cmd+K site search overlay | all | none | `GG.modules.search` (`public/assets/latest/modules/ui.bucket.search.js`) + triggers in `public/assets/latest/modules/ui.js` | Triggers: `[data-gg-search]`, `.gg-search-trigger`<br>Dialog host: `#gg-dialog` or `.gg-dialog-host` or `[data-gg-ui="dialog"]` | Dialog host missing<br>External imports blocked (Fuse.js/idb-keyval)<br>`GG.services.api.getFeed` missing | Press Ctrl/Cmd+K; dialog appears; typing shows results |
| Post toolbar | Post detail actions (back, info, focus, save, comments, share) | post, page | none | `GG.modules.PostDetail` (`public/assets/latest/modules/ui.bucket.core.js`) | `article.gg-post[data-gg-module="post-detail"]`<br>`[data-gg-module="post-toolbar"]`<br>`data-gg-postbar` buttons (`back`, `info`, `focus`, `save`, `comments`, `share`)<br>`main.gg-main[data-gg-surface]` | Toolbar missing or not inside `article.gg-post`<br>Panels missing so info/comments toggles do nothing | Open a post and click toolbar buttons; info/comments panels toggle; share opens sheet or fallback |
| Panels (left/right) | Left sidebar + right info/comments panels with backdrop | listing, post, page | none | `GG.modules.Panels` + `GG.modules.InfoPanel` (`public/assets/latest/modules/ui.bucket.core.js`) | `main.gg-main[data-gg-surface]`<br>`.gg-blog-sidebar--left` and `.gg-blog-sidebar--right`<br>`.gg-info-panel[data-gg-panel="info"]`<br>`.gg-comments-panel[data-gg-panel="comments"] [data-gg-slot="comments"]`<br>`data-gg-action="left-toggle"`, `info-close`, `tree-toggle` | Sidebars missing<br>Info/comments panel missing<br>`data-gg-surface` missing -> wrong default states | Toggle left sidebar on mobile; click info on a card; comments panel opens on posts |
| Library (bookmark) | Save posts and render library list | listing, post, page (library view) | none | `GG.modules.library` (`public/assets/latest/modules/ui.bucket.core.js`) | `.gg-post-card__action--bookmark` and `.gg-post__action--bookmark`<br>`#gg-library-list` or `.gg-library-list` + `#gg-library-empty` | Buttons missing<br>LocalStorage blocked<br>Missing `data-*` on card reduces metadata | Click bookmark on a card and check toast; library list updates if present |
| Share (sheet + poster) | Share posts with sheet/poster or native share fallback | listing, post | none | `GG.modules.shareSheet` (`public/assets/latest/modules/ui.bucket.poster.js`) + action bridge in `ui.bucket.core.js` | `#gg-share-sheet` or `#pc-poster-sheet`<br>`.gg-share-sheet__overlay`, `.gg-share-sheet__close-btn`, `.gg-share-sheet__mode-btn`, `.gg-share-sheet__social-btn`, `[data-role="gg-share-cta"]`<br>Triggers: `.gg-post-card__action--share`, `.gg-post__action--share`, `[data-gg-action="share"]` | Share sheet host missing -> fallback to native share/clipboard only<br>Poster module not loaded until first share action | Click Share; sheet opens and CTA works; without host, native share/clipboard runs |
| Sidebars (left/right markup) | Left nav styling + right sidebar sections | listing, post, page | none | `GG.modules.LeftNav` + `GG.modules.Panels` (`public/assets/latest/modules/ui.bucket.core.js`) | `.gg-blog-sidebar--left` with `.PageList`, `.LinkList`, `.Label` lists<br>`.gg-blog-sidebar--right` | Sidebar markup missing -> no decorations, no tree toggle | On listing, left nav links show icons and tree toggles |
| Postcard toolbar (card actions) | Card-level actions: comments badge, bookmark, like, share, info | listing/feed | none | `GG.services.actions` + `GG.modules.InfoPanel` + `GG.modules.library` (`public/assets/latest/modules/ui.bucket.core.js`) | `article.gg-post-card[data-gg-module="post-card"]`<br>`.gg-post-card__toolbar`<br>`data-gg-action="bookmark|like|share|info"` buttons | `GG.services.actions.init` not called -> actions not bound | Click card toolbar buttons; bookmark and info should respond; share should open sheet/fallback |
| Mobile footer accordion | Collapsible footer sections (if intended) | landing, listing, post, page | none | Not found in `public/assets/latest` JS; only shortcode accordion exists (`GG.modules.Shortcodes` uses `.gg-sc-accordion`) | Footer markup in `index.prod.xml` has no accordion hooks | Not implemented in JS or markup | n/a |

**Notable Inactive Or Missing Wiring**
- Postcard kebab menu is not implemented and no wiring hook exists yet.
