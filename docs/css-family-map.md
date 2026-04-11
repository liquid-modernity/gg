# CSS Family Map

Status: active bridge ownership map, not a split plan.

CSS_MAP_SOURCE: public/assets/v/ac33998/main.css
CSS_MAP_MIRROR: public/assets/latest/main.css
CSS_MAP_MANIFEST: qa/css-family-map.json
CSS_MAP_VERIFIER: qa/verify-css-map.mjs
CSS_MAP_ENTRY_COUNT: 32
CSS_MAP_SOURCE_MODE: temporary-runtime-bridge

## Purpose

This map records the current family and section ownership found in the temporary CSS authoring bridge. It exists because the project does not yet have a real source CSS tree or build pipeline, and future split work needs explicit ownership truth before moving selectors.

The mapping source is `public/assets/v/ac33998/main.css`. `public/assets/latest/main.css` is only a runtime mirror and must stay byte-identical to the active versioned CSS.

This file does not authorize runtime CSS edits, selector renames, visual changes, or a CSS split. Legacy and ambiguous areas remain debt until a future task migrates them through the CSS law.

## Current Verdict

- Pipeline classification: absent.
- Current manual authoring bridge: `public/assets/v/ac33998/main.css`.
- Runtime mirror: `public/assets/latest/main.css`.
- Families/sections mapped: 32.
- Stable entries: 12.
- Legacy bridge entries: 8.
- Ambiguous debt entries: 12.

## Mapped Families And Sections

| ID | Family/Section | Category | Owner Type | Surfaces | Anchors | Span Markers | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tokens-settings-root | tokens/settings-root | tokens/settings | global CSS settings | global | `:root{`<br>`--gg-bg:`<br>`--z-dock:` | start: `:root{`<br>end: `@supports (color: color-mix(in srgb, black 50%, white)){` | stable | Global token/root settings for color, spacing, layout columns, z-index, and dock variables. This is mapped as settings, not a component family. |
| base-reset-focus | base/reset-focus | base | global CSS base | global | `*::after{ box-sizing: border-box; }`<br>`html, body{`<br>`:where(a, button, input, textarea, select, summary, [role="button"], [tabindex]):focus-visible{` | start: `*::after{ box-sizing: border-box; }`<br>end: `:where(a, button, input, textarea, select, summary, [role="button"], [tabindex]):focus-visible{` | stable | Global reset and keyboard focus-visible rules. Must remain cross-surface and not become a route router. |
| primitive-icon-chip | gg-icon/gg-chip primitives | primitive | shared primitive CSS | global | `.gg-visually-hidden{`<br>`.gg-icon{`<br>`.gg-chip{` | start: `.gg-visually-hidden{`<br>end: `.gg-chip{` | stable | Small shared primitive cluster for visually hidden text, icons, icon buttons, and chips. Contains one legacy touch selector for info-panel icon meta. |
| gg-dock | gg-dock | component | global dock component | global, listing, post, page, landing | `nav.gg-dock[data-gg-module="dock"]{`<br>`nav.gg-dock[data-gg-state~="search"]{`<br>`nav.gg-dock .gg-dock__progress{` | start: `nav.gg-dock[data-gg-module="dock"]{`<br>end: `nav.gg-dock .gg-dock__progress{` | stable | Global dock family, including search/autohide state and later progress bar rules. Later progress rules are separated in file order but still dock-owned. |
| dock-more-sheet | gg-drawer-more | component | dock more sheet component | global, listing, post, page, landing | `#gg-dock-more{`<br>`#gg-dock-more .gg-dock-more__sheet{`<br>`#gg-dock-more .gg-dock-more__action{` | start: `#gg-dock-more{`<br>end: `#gg-dock-more .gg-dock-more__list--footer .gg-dock-more__action{` | legacy_bridge | Dock-owned more sheet. It behaves like the intended gg-drawer-more family but is still anchored by #gg-dock-more and dock-more element names. |
| home-shell-routing | gg-home-shell | layout | home shell layout | landing, home, listing | `html[data-gg-prehome="blog"] [data-gg-home-root="1"] [data-gg-home-layer="landing"]`<br>`.gg-home-landing`<br>`.gg-home-blog` | start: `html[data-gg-prehome="blog"] [data-gg-home-root="1"] [data-gg-home-layer="landing"]`<br>end: `main.gg-main:is([data-gg-view="post"],[data-gg-surface="post"]) .gg-home-blog{` | ambiguous_debt | Home/landing/blog visibility bridge. It is CSS state plumbing over XML-owned surfaces, so keep it visible as debt before split work. |
| blog-layout-shell | gg-blog-layout | layout | shared layout shell | listing, home, post, page | `.gg-blog-layout{`<br>`.gg-blog-layout--list{`<br>`main.gg-main[data-gg-info-panel="open"] .gg-blog-layout--list .gg-blog-sidebar--right` | start: `.gg-blog-layout{`<br>end: `main.gg-main[data-gg-info-panel="open"] .gg-blog-layout--list .gg-blog-sidebar--right` | ambiguous_debt | Shared listing/post layout shell with right-panel state coupling. It is layout-owned but mixed across surfaces. |
| leftnav-navtree | gg-leftnav/gg-navtree | component | left navigation component | listing, post, page | `.gg-leftnav{`<br>`.gg-leftnav .gg-navtree{`<br>`.gg-navtree__summary{` | start: `.gg-leftnav{`<br>end: `.gg-leftnav__note{` | ambiguous_debt | Left navigation and navtree base. Later editorial-unification rules restyle this same ownership area, so it is not split-ready. |
| search-assist | gg-search-surface | surface-specific | search/listing assist surface | listing, search | `#gg-search-assist.gg-search-assist{`<br>`a.gg-search-assist__item{`<br>`#gg-search-assist .e{` | start: `#gg-search-assist.gg-search-assist{`<br>end: `#gg-search-assist .f{` | stable | Inline search-assist surface. It is separate from the command palette search-result surface mapped later. |
| featured-card-legacy | gg-featured-card | card | listing featured card bridge | listing, home | `#gg-featuredpost1{`<br>`#gg-featuredpost1 article.post{`<br>`#gg-featuredpost1 .post-title{` | start: `#gg-featuredpost1{`<br>end: `#gg-featuredpost1 article.post{` | legacy_bridge | Featured card styling is still anchored to Blogger FeaturedPost widget IDs and article.post. Treat as gg-featured-card bridge, not final naming. |
| gg-post-card | gg-post-card | card | listing post card component | listing, home, search, label | `.gg-post-card{`<br>`.gg-post-card__toolbar{`<br>`.gg-post-card__tool--info{` | start: `.gg-post-card{`<br>end: `.gg-post-card__tool--info{` | ambiguous_debt | Official post-card family exists, but late repeated thumb/tool refinements make this family not cleanly split-ready yet. |
| panel-card-legacy | gg-panel-card | card | sidebar panel card bridge | listing, post, page | `.gg-panelcard{`<br>`main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb > :is(.gg-sb__top,.gg-sb__body,.gg-sb__bot).gg-panelcard` | start: `.gg-panelcard{`<br>end: `main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb > :is(.gg-sb__top,.gg-sb__body,.gg-sb__bot).gg-panelcard` | legacy_bridge | Panel card is currently spelled .gg-panelcard. Map it as the intended gg-panel-card bridge and do not treat the old spelling as final family law. |
| gg-labeltree | gg-labeltree | component | label tree navigation component | listing, post, page | `#gg-left-sb-body-list .gg-lt[data-gg-module="labeltree"] .gg-lt__head{`<br>`.gg-lt[data-gg-module="labeltree"]{`<br>`main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb .gg-lt[data-gg-module="labeltree"] .gg-lt__muted` | start: `#gg-left-sb-body-list .gg-lt[data-gg-module="labeltree"] .gg-lt__head{`<br>end: `main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb .gg-lt[data-gg-module="labeltree"] .gg-lt__muted` | ambiguous_debt | Labeltree exists but has duplicate base blocks, panel-specific overrides, and later leftnav unification with !important debt inherited from the bridge. |
| gg-mixed-media | gg-mixed-media | component | listing mixed media rail component | listing, home | `.gg-mixed{`<br>`.gg-mixed__rail{`<br>`.gg-mixed[data-type="newsdeck"]` | start: `.gg-mixed{`<br>end: `.gg-newsdeck{` | stable | Mixed-media rails, including bookish/featured/instagram/youtube/shorts/podcast/popular/newsdeck variants. |
| listing-surface-grid | gg-listing-surface | surface-specific | listing surface layout | listing, home, label, search | `main.gg-main[data-gg-surface="listing"]{`<br>`main.gg-main[data-gg-surface="listing"] .gg-blog-main #postcards{`<br>`main.gg-main[data-gg-surface="listing"] .gg-loadmore-wrap{` | start: `main.gg-main[data-gg-surface="listing"]{`<br>end: `main.gg-main[data-gg-surface="listing"] .gg-loadmore-wrap{` | stable | Listing surface placement and post-card/mixed-widget flow. Surface-owned context only; it should not own card internals. |
| label-channel | gg-label-channel | surface-specific | label/search channel surface | listing, label, search | `#gg-label-channel{`<br>`#gg-label-channel .gg-label-channel__rail{`<br>`#gg-label-channel .gg-label-channel__error{` | start: `#gg-label-channel{`<br>end: `#gg-label-channel .gg-label-channel__error{` | stable | Label channel rail/masonry surface block. |
| gg-editorial-preview | gg-editorial-preview | component | listing editorial preview component | listing, home | `.gg-blog-layout--list .gg-info-panel{`<br>`.gg-editorial-preview{`<br>`.gg-editorial-preview .gg-info-panel__toclist{` | start: `.gg-blog-layout--list .gg-info-panel{`<br>end: `.gg-editorial-preview .gg-info-panel__tochint{` | legacy_bridge | Listing-owned editorial preview exists, but its selector cluster still bridges through .gg-info-panel and .gg-info-panel__* descendants. |
| gg-info-panel-legacy | gg-info-panel | legacy bridge debt | legacy right-panel bridge | listing, home, post, page | `.gg-blog-sidebar--right > .gg-info-panel`<br>`.gg-info-panel__fallback{`<br>`main.gg-main:is([data-gg-surface="post"],[data-gg-surface="page"]) .gg-blog-layout--post .gg-info-panel{` | start: `.gg-blog-sidebar--right > .gg-info-panel`<br>end: `main.gg-main:is([data-gg-surface="post"],[data-gg-surface="page"]) .gg-blog-layout--post .gg-info-panel{` | legacy_bridge | Master-level debt: gg-info-panel must split into listing gg-editorial-preview and detail gg-detail-info-sheet. It remains bridge-only. |
| sidebar-panel-state | gg-sidebar-panel-state | layout | right sidebar state layout | listing, post, page | `/* Sidebar state: layout mode */`<br>`.gg-infopanel-backdrop,`<br>`/* Sidebar state: comments mode */` | start: `/* Sidebar state: layout mode */`<br>end: `/* Sidebar state: comments mode */` | ambiguous_debt | Right-panel and backdrop state wiring spans info/comments modes. It is layout state, not a final component family. |
| detail-layout-shell | gg-detail-layout | layout | post/page detail layout shell | post, page | `.gg-blog-layout--post{`<br>`.gg-blog-layout--post .gg-blog-main{`<br>`.gg-blog-layout--post #postcards{` | start: `.gg-blog-layout--post{`<br>end: `.gg-blog-layout--post #postcards{` | ambiguous_debt | Detail shell for post/page. Mixed with legacy right-panel and info-sheet bridge nearby. |
| detail-toolbar-legacy | gg-detail-toolbar | legacy bridge debt | post/page detail toolbar bridge | post, page | `.gg-post__toolbar{`<br>`.gg-post__tool{`<br>`.gg-post__toolbar{ display: none; }` | start: `.gg-post__toolbar{`<br>end: `.gg-post__tool[data-gg-state~="active"] .gg-icon.material-symbols-rounded{` | legacy_bridge | Master-level bridge: .gg-post__toolbar should converge to gg-detail-toolbar. Current selectors are legacy contract selectors. |
| detail-info-sheet-legacy | gg-detail-info-sheet | legacy bridge debt | post/page detail metadata bridge | post, page | `#gg-postinfo,`<br>`#gg-postinfo .gg-pi__body{`<br>`#gg-postinfo .gg-pi__hint{` | start: `#gg-postinfo,`<br>end: `#gg-postinfo .gg-pi__hint{` | legacy_bridge | Detail metadata family is intended to be gg-detail-info-sheet, but the active bridge still uses #gg-postinfo and gg-pi selectors. |
| gg-toc | gg-toc | component | detail table-of-contents component | post, page | `#gg-toc{`<br>`#gg-toc .gg-toc__body{`<br>`#gg-toc [data-gg-state~="active"] > .gg-toc__link{` | start: `#gg-toc{`<br>end: `#gg-toc [data-gg-state~="active"] > .gg-toc__link{` | ambiguous_debt | Detail TOC family exists, but it is later restyled inside left-sidebar editorial unification, so ownership is not cleanly isolated. |
| gg-comments | gg-comments | component | comments component | post, page | `.gg-comments {`<br>`#comments > .gg-comments__head {`<br>`.gg-comments #cmt2-holder li.comment {` | start: `.gg-comments {`<br>end: `#comments .gg-comments__footer{` | stable | Main comments contract, including Blogger/CMT2 normalized comment list and footer composer support. |
| gg-comments-panel | gg-comments-panel | component | comments side panel component | post, page | `.gg-comments-panel {`<br>`/* COMMENTS PANEL RAIL`<br>`#ggPanelComments{` | start: `.gg-comments-panel {`<br>end: `#ggPanelComments{` | ambiguous_debt | Comments panel has base panel rules, compact rail rules, and late visual reset rules. It is real but not split-clean yet. |
| landing-shell | gg-landing-shell | surface-specific | landing/home surface shell | landing, home | `#gg-landing{`<br>`.gg-topbar{`<br>`.gg-hero{` | start: `#gg-landing{`<br>end: `.gg-hero__stats{` | stable | Landing surface shell, topbar, hero, sections, and CTA structure. |
| landing-card-legacy | gg-landing-card | card | landing card bridge | landing, home | `.gg-card{`<br>`.gg-card--featured{`<br>`.gg-card--contact{ box-shadow: none; }` | start: `.gg-card{`<br>end: `.gg-card--contact{ box-shadow: none; }` | legacy_bridge | Landing cards use .gg-card, .gg-card--featured, and hero-card selectors. There is no explicit gg-landing-card selector yet. |
| gg-skeleton | gg-skeleton | primitive | shared loading skeleton primitive | global, listing, special | `.gg-skeleton-grid{`<br>`.gg-skeleton{`<br>`.gg-skeleton__hero{ height:180px; }` | start: `.gg-skeleton-grid{`<br>end: `.gg-skeleton__hero{ height:180px; }` | ambiguous_debt | Skeleton family is split between grid/card skeleton and a later generic .gg-skeleton block; map as one primitive with debt. |
| special-pages-legacy | gg-special-pages | surface-specific | special page surface cluster | special, page | `#gg-sitemap`<br>`#gg-feed`<br>`.gg-library {`<br>`.gg-authorpage-grid{` | start: `#gg-sitemap`<br>end: `.gg-authorpage-card{` | ambiguous_debt | Sitemap, feed, tags, library, and author-page CSS are clustered together and should remain visible as future split debt. |
| share-sheet | gg-share-sheet | component | share sheet and poster card component | listing, post, page | `.gg-share-card {`<br>`#gg-share-sheet{`<br>`#gg-share-sheet .gg-share-sheet__hint{` | start: `.gg-share-card {`<br>end: `.gg-share-sheet__hint{` | stable | Share-card preview plus share-sheet modal/panel rules, including poster-sheet compatibility selectors. |
| command-search-surface | gg-command-palette | component | command palette search component | global, search | `.gg-dialog {`<br>`#gg-palette-list{`<br>`#gg-palette-list .gg-search__result{` | start: `.gg-dialog {`<br>end: `#gg-palette-list > .gg-search__hint:last-child{` | stable | Command palette/search result surface. This covers the overlay search result list, not inline search assist. |
| left-sidebar-editorial-unification | gg-left-sidebar-editorial-unification | ambiguous/unresolved debt | mixed left-sidebar unification bridge | listing, post, page | `/* Editorial unification for left sidebar tree, page nav, and TOC. */`<br>`main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb{`<br>`main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb #gg-toc .gg-toc__heading{` | start: `/* Editorial unification for left sidebar tree, page nav, and TOC. */`<br>end: `main.gg-main .gg-blog-sidebar--left .gg-leftnav.gg-sb #gg-toc [data-gg-state~="active"] > .gg-toc__link .gg-toc__num{` | ambiguous_debt | Explicit mixed bridge over leftnav, navtree, labeltree, page nav, and TOC. This must be untangled before any clean CSS split. |

## Legacy Bridge Areas

- dock-more-sheet
- featured-card-legacy
- panel-card-legacy
- gg-editorial-preview
- gg-info-panel-legacy
- detail-toolbar-legacy
- detail-info-sheet-legacy
- landing-card-legacy

## Ambiguous Debt Areas

- home-shell-routing
- blog-layout-shell
- leftnav-navtree
- gg-post-card
- gg-labeltree
- sidebar-panel-state
- detail-layout-shell
- gg-toc
- gg-comments-panel
- gg-skeleton
- special-pages-legacy
- left-sidebar-editorial-unification

## Verification Rule

Run `npm run gaga:verify-css-map` after changing this map. The verifier checks that every mapped anchor exists in `public/assets/v/ac33998/main.css`, that `public/assets/latest/main.css` remains byte-identical to the active bridge, that required families are represented, and that this document stays consistent with `qa/css-family-map.json`.
