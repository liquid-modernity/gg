# TASK-DISCOVERY-001 — Unify Global Discovery for Home and Blog, Keep Store Discovery Independent

## Status

Development task.

Must be done after `TASK-REGISTRY-001`.

## Strategic Purpose

The dock and More sheet have been unified, but Discovery is still inconsistent across surfaces.

Current issue:

- `/` and `/landing` still behave like different discovery systems.
- `/` uses a result-first pattern with bottom controls.
- `/landing` uses a different top-search structure and route/section list.
- `/store` has a store-specific discovery domain, which should remain independent.

Correct architecture:

```txt
/ and /landing = one Global Discovery
/store = independent Store Discovery
```

The shell rhythm should be shared across all surfaces, but content/domain must follow the split above.

## Non-Negotiables

- Do not modify threaded comments.
- Do not modify More sheet except for copy/token conflicts.
- Do not change dock order.
- Do not change route truth.
- Do not expose `Landing` as a public label.
- Do not merge Store Discovery into Global Discovery.
- Do not make `/landing` a sections-only discovery surface.
- Do not make `/` an articles-only discovery surface.
- Do not move mobile search input to the top as the default pattern.
- Do not introduce a new backend search service.
- Do not add heavy dependencies.

## Core Decision

Use two discovery domains:

```txt
Global Discovery:
- surfaces: /landing, /, post detail, static page detail
- content: articles, topics, routes, landing sections, actions

Store Discovery:
- surfaces: /store and store category/detail-like states
- content: products, categories, store routes, store actions
```

Use one shared visual grammar:

```txt
handle
title
scrollable result area
sticky bottom command area
keyboard-safe input
segmented filters
same result row rhythm
same empty state rhythm
```

## Required Discovery Shell Grammar

Use this structure for both Global Discovery and Store Discovery:

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

- easier thumb reach;
- avoids forcing typing before browsing;
- supports result-first discovery;
- aligns with native-app bottom sheet behavior.

## Keyboard-Safe Behavior

Bottom search is accepted only if keyboard behavior is robust.

Required behavior:

- input remains visible when keyboard opens;
- sticky command area moves above keyboard if supported;
- results area shrinks instead of being covered;
- no double body/sheet scroll conflict;
- safe-area inset is respected;
- reduced motion is respected;
- sheet height adapts to result count but respects a max-height;
- bottom padding of results accounts for the sticky command area.

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

## Global Discovery Content Contract

Global Discovery must be identical for `/` and `/landing`.

Same:

```txt
same shell
same title
same filters
same search input
same default result index
same result types
same ordering logic
same empty state
same copy
```

Required Global Discovery item types:

```txt
article
topic
route
section
action
```

Required filters:

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

Required default index should include at minimum:

### Routes

```txt
Home -> /landing
Blog -> /
Store -> /store
Contact -> /landing#contact
```

### Landing Sections

Use the actual landing section IDs available in the current landing surface.

Minimum expected sections if present:

```txt
Intro / Hero
Structure
Routes
Interaction
Discoverability
Contact
```

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

The Global Discovery index must be the same for `/` and `/landing`, but item resolution may be surface-aware.

Example:

`Contact` item:

- from `/landing`: scroll to `#contact`;
- from `/`: navigate to `/landing#contact`;
- from post/detail: navigate to `/landing#contact`.

`Home` item:

- from `/landing`: scroll to top;
- from `/`: navigate to `/landing`.

`Blog` item:

- from `/`: scroll to top;
- from `/landing`: navigate to `/`.

This must be implemented through the action resolver, not duplicated hardcoded click handlers.

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

- static store product manifest / existing store product source;
- generated category pages;
- store routes;
- optional store actions.

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

Store Discovery must not show landing sections as first-class default results unless they appear only as global navigation routes/actions.

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

Sheet title:

EN:

```txt
Discovery
```

ID:

```txt
Jelajah
```

Store sheet title may be:

EN:

```txt
Store Discovery
```

ID:

```txt
Jelajah Store
```

If visual simplicity is preferred, both can use `Discovery` / `Jelajah`, while store-specific placeholder clarifies the domain.

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

## Result Item Normal Form

All discovery sources must normalize to one item shape.

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

Renderer must read normalized items. Renderer should not need to know whether the item came from landing, blog, or store internals.

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

## Filtering and Search Behavior

Required:

- case-insensitive search;
- title/meta/keywords searchable;
- filter chips/segmented controls update visible result types;
- empty state appears when no result matches;
- clearing search restores default index;
- current filter state is visible;
- keyboard Enter on a focused result activates it;
- Escape/back closes sheet or clears input according to existing sheet behavior.

Do not implement remote search in this task.

## Visual Contract

Global Discovery and Store Discovery must share:

- same handle;
- same title rhythm;
- same sheet width target;
- same result row padding;
- same section/type label style;
- same divider rhythm;
- same sticky bottom command style;
- same input height/radius;
- same segmented filter rhythm;
- same footer safe-area spacing;
- same light/dark theme behavior.

Store may use product/category item content, but not a different shell language.

## Route Behavior

### `/landing`

Dock Search opens Global Discovery.

Expected:

- same content as `/` Global Discovery;
- same filters;
- Home result scrolls top;
- Contact result scrolls to `#contact`;
- Blog result navigates to `/`;
- Store result navigates to `/store`.

### `/`

Dock Search opens Global Discovery.

Expected:

- same content as `/landing` Global Discovery;
- same filters;
- Blog result scrolls top;
- Home result navigates to `/landing`;
- Contact result navigates to `/landing#contact`;
- Store result navigates to `/store`.

### Post Detail / Static Page Detail

Dock Search opens Global Discovery.

Expected:

- same Global Discovery content;
- Blog result navigates to `/`;
- Home result navigates to `/landing`;
- Contact result navigates to `/landing#contact`.

### `/store`

Dock Search opens Store Discovery.

Expected:

- product results available;
- category results available;
- store route results available;
- Home/Blog/Contact routes available as store navigation routes;
- landing sections are not presented as primary store results.

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

- `/` and `/landing` are mapped to Global Discovery;
- `/store` is mapped to Store Discovery;
- Global Discovery filters include all required filters;
- Store Discovery filters include all required filters;
- Global Discovery sources include articles, topics, routes, landing sections, and actions;
- Store Discovery sources include products, categories, and store routes;
- bottom command placement is configured for both;
- copy keys exist in EN and ID;
- public `Landing` label is not used;
- More sheet registry remains intact.

Update live smoke only if necessary, but do not make it brittle against content count changes.

## Required Commands

Run:

```bash
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

If added:

```bash
npm run gaga:verify-discovery-contract
```

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

- Search opens Global Discovery.
- Shell is visually identical.
- Content set is identical.
- Filters are identical.
- Search input is in sticky bottom command area.
- Keyboard does not cover input.
- Results area remains scrollable.
- Contact resolves correctly by current route.
- Home resolves correctly by current route.
- Blog resolves correctly by current route.
- Store resolves to `/store`.

Manual proof for `/store`:

- Search opens Store Discovery.
- Shell rhythm matches Global Discovery.
- Product/category results appear.
- Store routes appear.
- Global landing sections do not dominate Store Discovery.
- Keyboard does not cover input.

## Acceptance Criteria

Task is accepted only if:

- `/` and `/landing` use the same Global Discovery shell and content;
- `/store` uses independent Store Discovery;
- all Discovery sheets use bottom search command;
- keyboard behavior is safe on mobile;
- result rendering uses normalized item shape or equivalent abstraction;
- route-aware resolver handles same Global Discovery items correctly;
- copy registry EN/ID is complete;
- CI/CD passes;
- threaded comments remain untouched.

## Required Final Report

```txt
TASK-DISCOVERY-001 completed.

Changed:
- Global Discovery unified across / and /landing: YES/NO
- Global Discovery content identical across / and /landing: YES/NO
- Store Discovery kept independent: YES/NO
- Bottom search command implemented consistently: YES/NO
- Keyboard-safe behavior added/verified: YES/NO
- Normalized discovery item model added/used: YES/NO
- Copy registry updated: YES/NO
- Discovery QA guard added/updated: YES/NO
- Threaded comments behavior changed: NO
- More sheet behavior changed intentionally: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run gaga:verify-discovery-contract if added: PASS/FAIL

Manual proof:
- / mobile/tablet/desktop: PASS/FAIL
- /landing mobile/tablet/desktop: PASS/FAIL
- /store mobile/tablet/desktop: PASS/FAIL
- post detail mobile/tablet/desktop: PASS/FAIL
- static page detail mobile/tablet/desktop: PASS/FAIL

Notes:
- Any intentionally deferred ranking/search improvements.
- Any known iOS Safari keyboard limitation.
```

## Out of Scope

- Remote/full-text search backend.
- AI search.
- Store checkout.
- New Discovery visual identity.
- More sheet redesign.
- Dock redesign.
- Threaded comments.
- Control plane.
- Lighthouse gate.

