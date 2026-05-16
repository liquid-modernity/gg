
# TASK-DISCOVERY-001 — Unify Global Discovery for Home and Blog, Keep Store Discovery Independent

## Status

Development task.

This task must be executed **after** `TASK-REGISTRY-001` has passed.

## Strategic Purpose

The dock and More sheet are now unified, but Discovery still risks drifting into separate systems per surface.

The correct model is:

```txt
/ and /landing = one Global Discovery
/store = independent Store Discovery
```

This task must unify Discovery for Home and Blog as one ecosystem while keeping Store Discovery independent as a commerce/product surface. The visual rhythm must remain shared across both domains.

This is not a redesign task. This is a contract, shell, resolver, and source-normalization task.

## Current Problem

Current or recent behavior shows three risks:

* `/` and `/landing` can behave like different discovery systems.
* `/` can become article/topic-first while `/landing` becomes section/route-first.
* `/store` can either drift visually or accidentally inherit global landing/blog discovery.

That is the wrong mental model.

The user pressing Search on `/` and `/landing` must feel they entered the same Global Discovery surface. The user pressing Search on `/store` must feel they entered Store Discovery, with the same native-app rhythm but a different commerce domain.

## Non-Negotiables

* Do not modify threaded comments.
* Do not modify Blogger native comment plumbing.
* Do not modify `parentID`, composer movement, replies sheet behavior, or comments proof semantics.
* Do not modify More sheet except for unavoidable shared copy/token conflicts.
* Do not change dock order.
* Do not change public route truth:

  * `/landing` = Home / Beranda
  * `/` = Blog
  * `/store` = Store
  * `/landing#contact` = Contact / Kontak
* Do not expose `Landing` as a public label.
* Do not merge Store Discovery into Global Discovery.
* Do not make `/landing` a sections-only discovery surface.
* Do not make `/` an articles-only discovery surface.
* Do not create a second independent Global Discovery implementation for `landing.html`.
* Do not maintain separate landing-only and blog-only discovery arrays that merely look similar.
* Do not move mobile search input to the top as the default pattern.
* Do not introduce a remote search backend.
* Do not add heavy dependencies.
* Do not weaken CI/CD or live smoke guards.
* Do not make browser visual proof the only acceptance proof.

## Core Decision

Use two domains:

```txt
Global Discovery
- surfaces: /landing, /, post detail, static page detail
- content: articles, topics, routes, landing sections, actions

Store Discovery
- surfaces: /store and store category/detail-like states
- content: products, categories, store routes, store actions
```

Use one shared visual grammar:

```txt
handle
centered title
scrollable result area
sticky bottom command area
keyboard-safe input
segmented filters
same result row rhythm
same empty state rhythm
same safe-area behavior
```

Use the registry as the contract source for Discovery behavior.

The registry must not be decorative. Existing rendered HTML may remain during transition, but rendered output and runtime behavior must be checked against the registry.

## Registry Dependency

This task must use the registry created in `TASK-REGISTRY-001`, especially:

```txt
src/registry/gg-routes.registry.js
src/registry/gg-dock.registry.js
src/registry/gg-actions.registry.js
src/registry/gg-more.registry.js
src/registry/gg-discovery.registry.js
```

If filenames differ, use the current equivalent registry files.

Required registry truth:

```txt
landing -> Global Discovery
blog -> Global Discovery
detail -> Global Discovery
page -> Global Discovery
store -> Store Discovery
```

`/` and `/landing` must consume the same Global Discovery index.

Do not generate one index for `/` and another similar-looking index for `/landing`.

## Required Discovery Shell Grammar

Both Global Discovery and Store Discovery must use this shell:

```txt
Sheet handle
Centered title
Scrollable result area
Sticky bottom command area:
  segmented filters
  search input
```

The search input is intentionally bottom-positioned for mobile-first usability.

Reason:

* thumb reach is better;
* browsing can happen before typing;
* the result-first model fits bottom sheets;
* the pattern feels closer to a native command surface.

## Bottom Command Contract

Global and Store Discovery must use:

```txt
commandPlacement: "bottom"
```

Required:

* `/landing` must not keep a separate top-search Discovery shell.
* `/` must not use a different bottom command grammar from `/landing`.
* `/store` may have store-specific filters and sources, but its command area must share the same rhythm.

## Keyboard-Safe Behavior

Bottom search is accepted only if keyboard behavior is robust.

Required behavior:

* input remains visible when the keyboard opens;
* sticky command area moves above the keyboard where supported;
* results area shrinks instead of being covered;
* body and sheet must not create conflicting double-scroll behavior;
* safe-area inset is respected;
* reduced motion is respected;
* sheet height adapts to result count but respects max-height;
* result area bottom padding accounts for command area height;
* closing keyboard must not leave stale bottom offsets;
* rotating/resizing viewport must not break sheet placement.

Implementation should consider:

```txt
visualViewport
safe-area-inset-bottom
100dvh
max-height
scrollable body inside sheet
sticky footer inside sheet
```

Do not use a naive `position: fixed; bottom: 0` pattern that fails on iOS Safari.

If `visualViewport` is unavailable, provide a safe fallback that keeps the input accessible.

## Global Discovery Content Contract

Global Discovery must be identical for `/` and `/landing`.

Same:

```txt
same shell
same title
same filters
same bottom search command
same default result index
same result types
same ordering logic
same empty state
same copy
same normalized item model
```

The same Global Discovery index must be generated once and consumed by both `/` and `/landing`.

Do not maintain separate landing-only and blog-only discovery arrays that merely look similar.

Required Global Discovery item types:

```txt
article
topic
route
section
action
```

Required filters:

EN:

```txt
All
Articles
Topics
Routes
Sections
Actions
```

ID:

```txt
Semua
Artikel
Topik
Rute
Bagian
Aksi
```

Required Global Discovery index must include at minimum:

### Routes

```txt
Home -> /landing
Blog -> /
Store -> /store
Contact -> /landing#contact
```

### Landing Sections

Use actual landing section IDs available in the current landing surface.

Expected sections if present:

```txt
Intro / Hero
Structure
Routes
Interaction
Discoverability
Contact
```

Do not expose `Landing` as a label. Use Home / Beranda.

### Articles

Use the current article/post source already available to `/` discovery. Do not invent a new feed system.

### Topics

Use existing labels/topics source if available.

### Actions

Minimum actions:

```txt
Contact PakRPP
Open More
Open Store
Open Blog
```

Actions may resolve to routes or internal sheet actions.

## Contextual Resolver for Same Global Items

Global Discovery items must be the same across `/` and `/landing`, but item resolution may be surface-aware.

Example: `Contact`

* from `/landing`: scroll to `#contact`;
* from `/`: navigate to `/landing#contact`;
* from post/detail: navigate to `/landing#contact`.

Example: `Home`

* from `/landing`: scroll to top;
* from `/`: navigate to `/landing`;
* from post/detail: navigate to `/landing`.

Example: `Blog`

* from `/`: scroll to top;
* from `/landing`: navigate to `/`;
* from post/detail: navigate to `/`.

This must be implemented through the action resolver or equivalent centralized resolver.

Do not duplicate route-specific click handlers inside separate discovery renderers.

## Store Discovery Content Contract

Store Discovery remains independent.

Required Store Discovery item types:

```txt
product
category
route
action
```

Required filters:

EN:

```txt
All
Products
Categories
Routes
```

ID:

```txt
Semua
Produk
Kategori
Rute
```

Required Store sources:

* static store product manifest or existing store product source;
* generated category pages;
* store routes;
* optional store actions.

Required Store routes:

```txt
All products -> /store
Fashion -> /store/fashion
Skincare -> /store/skincare
Workspace -> /store/workspace
Tech -> /store/tech
Everyday -> /store/everyday
Blog -> /
Home -> /landing
Contact -> /landing#contact
```

Store Discovery must not show landing sections as first-class default results.

Store may include Home, Blog, and Contact as route/action items, but not landing section browsing as a primary store result domain.

## Titles and Copy

Dock label remains:

EN:

```txt
Search
```

ID:

```txt
Cari
```

Global sheet title:

EN:

```txt
Discovery
```

ID:

```txt
Jelajah
```

Store sheet title:

EN:

```txt
Store Discovery
```

ID:

```txt
Jelajah Store
```

If visual simplicity is preferred, both sheets may display `Discovery` / `Jelajah`, but the store placeholder and result types must clearly indicate the store domain.

Global placeholder:

EN:

```txt
Search articles, topics, routes, sections, or actions
```

ID:

```txt
Cari artikel, topik, rute, bagian, atau aksi
```

Store placeholder:

EN:

```txt
Search products, categories, or store routes
```

ID:

```txt
Cari produk, kategori, atau rute Store
```

Empty state:

EN:

```txt
No results
Try another keyword.
```

ID:

```txt
Tidak ada hasil
Coba kata kunci lain.
```

## Required Copy Keys

Add or normalize in EN/ID registries:

```txt
discovery.title
discovery.store.title
discovery.global.placeholder
discovery.store.placeholder
discovery.filter.all
discovery.filter.articles
discovery.filter.topics
discovery.filter.routes
discovery.filter.sections
discovery.filter.actions
discovery.filter.products
discovery.filter.categories
discovery.type.article
discovery.type.topic
discovery.type.route
discovery.type.section
discovery.type.action
discovery.type.product
discovery.type.category
discovery.empty.title
discovery.empty.body
```

Correct ID values must use natural Indonesian UI language:

```txt
discovery.title = Jelajah
discovery.store.title = Jelajah Store
discovery.filter.sections = Bagian
discovery.global.placeholder = Cari artikel, topik, rute, bagian, atau aksi
```

Do not leave Indonesian copy as English such as `Discovery`, `Store Discovery`, or `Section` unless intentionally used as a brand noun.

## Result Item Normal Form

All discovery sources must normalize to one item shape or a clearly equivalent abstraction.

Suggested model:

```js
{
  id: "string",
  domain: "global" | "store",
  type: "article" | "topic" | "route" | "section" | "action" | "product" | "category",
  title: "string",
  meta: "string",
  href: "string optional",
  action: "actionId optional",
  target: "string optional",
  keywords: ["string"],
  priority: 0
}
```

Renderer must read normalized items.

Renderer should not need to know whether an item came from landing internals, blog internals, or store internals.

## Source Adapters

Create or normalize adapters:

```txt
globalArticlesAdapter
globalTopicsAdapter
globalRoutesAdapter
globalLandingSectionsAdapter
globalActionsAdapter
storeProductsAdapter
storeCategoriesAdapter
storeRoutesAdapter
storeActionsAdapter
```

Adapters may live in fewer files if project structure prefers it, but the conceptual separation must remain.

Do not duplicate the same Global Discovery data inside both `index.xml` and `landing.html` as separate manual arrays.

## Filtering and Search Behavior

Required:

* case-insensitive search;
* title/meta/keywords searchable;
* filter chips or segmented controls update visible result types;
* empty state appears when no result matches;
* clearing search restores default index;
* current filter state is visible;
* keyboard Enter on a focused result activates it;
* Escape/back closes sheet or clears input according to existing sheet behavior;
* opening the sheet repeatedly must not duplicate result rows or event listeners;
* switching filters must not destroy input value unless intentionally cleared;
* clearing input must not reset active filter unless intentionally designed and documented.

Do not implement remote search in this task.

## Visual Contract

Global Discovery and Store Discovery must share:

* same handle;
* same title rhythm;
* same sheet width target;
* same result row padding;
* same result type label style;
* same divider rhythm;
* same sticky bottom command style;
* same input height and radius;
* same segmented filter rhythm;
* same footer safe-area spacing;
* same light/dark theme behavior;
* same focus-visible behavior;
* same disabled/empty state behavior.

Store may use product/category item content, but not a different shell language.

## Route Behavior

### `/landing`

Dock Search opens Global Discovery.

Expected:

* same content as `/` Global Discovery;
* same filters;
* same bottom command placement;
* Home result scrolls top;
* Contact result scrolls to `#contact`;
* Blog result navigates to `/`;
* Store result navigates to `/store`.

### `/`

Dock Search opens Global Discovery.

Expected:

* same content as `/landing` Global Discovery;
* same filters;
* same bottom command placement;
* Blog result scrolls top;
* Home result navigates to `/landing`;
* Contact result navigates to `/landing#contact`;
* Store result navigates to `/store`.

### Post Detail / Static Page Detail

Dock Search opens Global Discovery.

Expected:

* same Global Discovery content;
* Blog result navigates to `/`;
* Home result navigates to `/landing`;
* Contact result navigates to `/landing#contact`;
* Store result navigates to `/store`.

### `/store`

Dock Search opens Store Discovery.

Expected:

* product results available;
* category results available;
* store route results available;
* Home/Blog/Contact routes available as store navigation routes;
* landing sections are not presented as primary store results;
* shell rhythm matches Global Discovery.

## Static / Source Parity Requirements

Browser visual proof is not enough.

Required:

* source/static artifact proof must show the same Discovery contract markers for `/` and `/landing`;
* live/static source proof must not show separate top-search landing shell as the default mobile pattern;
* registry proof must confirm `/` and `/landing` share the same Global Discovery domain;
* `/store` source proof must confirm Store Discovery domain markers;
* rendered output must not depend on a hidden post-hydration rewrite to look correct.

Acceptable transitional state:

* existing static HTML contains shell markup;
* runtime hydrates/enhances behavior;
* QA proves the shell and contract markers match registry.

Unacceptable state:

* visual browser looks correct but `curl` / artifact source shows a different Discovery IA;
* `/landing` only becomes correct after an unguarded runtime rewrite;
* `/` and `/landing` have separate hardcoded arrays that can drift.

## QA Requirements

Update or add:

```txt
qa/discovery-contract-guard.mjs
```

Recommended npm alias:

```txt
npm run gaga:verify-discovery-contract
```

Guard must check:

* `/` and `/landing` are mapped to Global Discovery;
* `/store` is mapped to Store Discovery;
* Global Discovery filters include all required filters;
* Store Discovery filters include all required filters;
* Global Discovery sources include articles, topics, routes, landing sections, and actions;
* Store Discovery sources include products, categories, and store routes;
* Global and Store Discovery use `commandPlacement: "bottom"`;
* no mobile default top-search variant is introduced;
* `/landing` does not keep a separate top-search Discovery shell;
* copy keys exist in EN and ID;
* ID copy uses `Jelajah`, `Bagian`, and natural Indonesian placeholders;
* public `Landing` label is not used;
* More sheet registry remains intact;
* Dock registry remains intact;
* threaded comments proof remains separate and passing.

Update live smoke only if necessary, but do not make it brittle against content count changes.

Live smoke should validate contract markers and essential behavior, not exact product/article counts unless the count is part of a store artifact proof.

## Required Commands

Run:

```bash
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

If syntax guards exist, also run them.

## Manual Proof Matrix

Routes:

```txt
/
/landing
/store
one post detail
one static page detail
```

Viewports:

```txt
mobile 390
tablet 768
desktop 1280
```

Manual proof for `/` and `/landing`:

* Search opens Global Discovery.
* Shell is visually identical.
* Content set is identical.
* Filters are identical.
* Search input is in sticky bottom command area.
* There is no default mobile top-search shell on `/landing`.
* Keyboard does not cover input.
* Results area remains scrollable.
* Contact resolves correctly by current route.
* Home resolves correctly by current route.
* Blog resolves correctly by current route.
* Store resolves to `/store`.
* Reopening the sheet does not duplicate rows or handlers.

Manual proof for `/store`:

* Search opens Store Discovery.
* Shell rhythm matches Global Discovery.
* Product/category results appear.
* Store routes appear.
* Global landing sections do not dominate Store Discovery.
* Keyboard does not cover input.
* Reopening the sheet does not duplicate rows or handlers.

Manual source proof:

Use curl or equivalent source inspection for:

```txt
/
/landing
/store
```

Check:

* `/` and `/landing` expose Global Discovery contract markers;
* `/store` exposes Store Discovery contract markers;
* public `Landing` label is not exposed as nav/discovery label;
* bottom command markers exist.

## Acceptance Criteria

Task is accepted only if:

* `/` and `/landing` use the same Global Discovery shell and content;
* `/` and `/landing` consume the same Global Discovery index or a centrally generated equivalent;
* `/landing` does not retain a separate top-search Discovery implementation;
* `/store` uses independent Store Discovery;
* all Discovery sheets use bottom search command;
* keyboard behavior is safe on mobile;
* result rendering uses normalized item shape or equivalent abstraction;
* route-aware resolver handles same Global Discovery items correctly;
* copy registry EN/ID is complete and natural;
* source/static proof matches browser visual proof;
* CI/CD passes;
* threaded comments remain untouched;
* More sheet remains stable.

## Required Final Report

```txt
TASK-DISCOVERY-001 completed.

Changed:
- Global Discovery unified across / and /landing: YES/NO
- Global Discovery content identical across / and /landing: YES/NO
- Shared Global Discovery index/source used: YES/NO
- Store Discovery kept independent: YES/NO
- Bottom search command implemented consistently: YES/NO
- Landing top-search default shell removed/neutralized: YES/NO
- Keyboard-safe behavior added/verified: YES/NO
- Normalized discovery item model added/used: YES/NO
- Registry used as Discovery contract source: YES/NO
- Copy registry updated with natural EN/ID: YES/NO
- Discovery QA guard added/updated: YES/NO
- Source/static parity proof added/verified: YES/NO
- Threaded comments behavior changed: NO
- More sheet behavior changed intentionally: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL

Manual proof:
- / mobile/tablet/desktop: PASS/FAIL
- /landing mobile/tablet/desktop: PASS/FAIL
- /store mobile/tablet/desktop: PASS/FAIL
- post detail mobile/tablet/desktop: PASS/FAIL
- static page detail mobile/tablet/desktop: PASS/FAIL
- source/static proof for /, /landing, /store: PASS/FAIL

Notes:
- Any intentionally deferred ranking/search improvements.
- Any known iOS Safari keyboard limitation.
- Any compatibility aliases retained.
```

## Out of Scope

* Remote/full-text search backend.
* AI search.
* Store checkout.
* New Discovery visual identity.
* More sheet redesign.
* Dock redesign.
* Threaded comments.
* Control plane.
* Lighthouse gate.
* Worker canonical rewrites.
* Store category redesign.
