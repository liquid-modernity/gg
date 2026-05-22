# TASK-DISCOVERY-003 — Remap Discovery Filters to Visitor-Friendly Taxonomy

## Status

Development task.

Run after:

1. `TASK-STORE-ISOLATION-001`
2. `TASK-DISCOVERY-002`

## Strategic Purpose

The current Discovery filters are developer-facing:

```txt
All | Articles | Topics | Routes | Sections | Actions
```

This is useful for architecture and QA, but not ideal for visitors. Users do not think in terms of Routes, Sections, and Actions. They think in content, topics, and saved items.

This task remaps visible Discovery filters to a visitor-friendly taxonomy while keeping internal item types intact.

## Non-Negotiables

- Do not redesign the Discovery sheet.
- Do not move the search input to the top.
- Do not change bottom command placement.
- Do not break shared Global Discovery builder.
- Do not merge Store Discovery into Global Discovery.
- Do not expose Store product content as Global Articles/Topics.
- Do not expose non-Store editorial content as Store Products/Categories.
- Do not change dock order.
- Do not change More sheet IA.
- Do not touch threaded comments.
- Do not break Blog1.
- Do not create fake Saved functionality that cannot actually show saved items.

## Final Visible Filter Taxonomy

### Global Discovery

Visible filters:

EN:

```txt
All | Articles | Topics | Saved
```

ID:

```txt
Semua | Artikel | Topik | Tersimpan
```

Internal mapping:

```txt
All      = non-Store articles + non-Store topics + routes + sections + actions
Articles = non-Store articles only
Topics   = non-Store topics only
Saved    = saved non-Store items only
```

Routes, Sections, and Actions remain searchable and present in `All`, but they are not top-level visible filters.

### Store Discovery

Visible filters:

EN:

```txt
All | Products | Categories | Saved
```

ID:

```txt
Semua | Produk | Kategori | Tersimpan
```

Internal mapping:

```txt
All        = products + categories + store routes + store actions
Products   = Store product posts only
Categories = Store categories only
Saved      = saved Store products only
```

Routes/actions remain searchable in `All`, but they are not top-level visible filters.

## Saved / Bookmark Policy

Use `Saved`, not `Bookmark`, for visible UI copy.

Reason:

```txt
Saved = native app feel
Bookmark = browser-like feel
```

Saved must be real.

Acceptable minimum implementation:

```txt
localStorage-based saved items
```

If a saving mechanism already exists for Store products, reuse it and extend carefully.

If no global saved mechanism exists yet, choose one of these:

### Option A — Implement minimal Saved now

Add a minimal, safe localStorage saved registry for:

```txt
articles
Store products
```

Saved filter shows real saved items.

### Option B — Keep Saved filter hidden until saving exists

Visible filters become:

Global:

```txt
All | Articles | Topics
```

Store:

```txt
All | Products | Categories
```

Then add Saved in a future task.

### Option C — Show Saved with honest empty state

Allowed only if users have a clear way to save items somewhere else in the UI.

Empty state copy:

EN:

```txt
No saved items yet.
Save articles or products to find them here.
```

ID:

```txt
Belum ada item tersimpan.
Simpan artikel atau produk untuk menemukannya di sini.
```

Do not show a Saved filter that is permanently empty and has no path to populate it.

## Content Domain Rules

Global Discovery:

- Articles filter must exclude Store content.
- Topics filter must exclude Store labels and Store child labels.
- All filter may include Store only as route/action.

Store Discovery:

- Products filter must include Store products only.
- Categories filter must include Store categories only.
- All filter may include Home/Blog/Contact as store route/action items.

## Copy Requirements

Add or normalize keys:

```txt
discovery.filter.all
discovery.filter.articles
discovery.filter.topics
discovery.filter.saved
discovery.filter.products
discovery.filter.categories
discovery.saved.empty.title
discovery.saved.empty.body
```

EN:

```txt
All
Articles
Topics
Saved
Products
Categories
No saved items yet.
Save articles or products to find them here.
```

ID:

```txt
Semua
Artikel
Topik
Tersimpan
Produk
Kategori
Belum ada item tersimpan.
Simpan artikel atau produk untuk menemukannya di sini.
```

Remove or hide from visible UI:

```txt
Routes
Sections
Actions
```

But keep internal item types and copy keys if still used by accessibility, debug, or result type labels.

## Result Type Labels

Even when filters are simplified, result rows may still show type labels.

Allowed Global result type labels:

```txt
Article / Artikel
Topic / Topik
Route / Rute
Section / Bagian
Action / Aksi
```

Allowed Store result type labels:

```txt
Product / Produk
Category / Kategori
Route / Rute
Action / Aksi
```

This means Routes/Sections/Actions may remain as row metadata, not as primary filters.

## QA Requirements

Update or add:

```txt
qa/discovery-filter-taxonomy-guard.mjs
```

Recommended alias:

```txt
npm run gaga:verify-discovery-filters
```

Guard must check:

- Global visible filters are only `all/articles/topics/saved` if Saved is enabled;
- Global visible filters are only `all/articles/topics` if Saved is intentionally deferred;
- Store visible filters are only `all/products/categories/saved` if Saved is enabled;
- Store visible filters are only `all/products/categories` if Saved is intentionally deferred;
- Routes/Sections/Actions are not visible top-level filters;
- Routes/Sections/Actions still exist as searchable item types under All;
- Global Articles exclude Store content;
- Global Topics exclude Store labels;
- Store Products include only Store products;
- Store Categories include only Store categories;
- copy keys exist in EN/ID.

## Required Commands

Run:

```bash
npm run gaga:verify-discovery-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run store:build
npm run store:proof
npm run ci:cloudflare
git diff --check
```

If added:

```bash
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
```

## Manual Proof

Routes:

```txt
/
/landing
/store
```

### Global Discovery `/` and `/landing`

Required:

- visible filters use visitor taxonomy;
- Articles shows non-Store articles;
- Topics shows non-Store topics;
- All still includes routes/sections/actions;
- Saved works or is intentionally absent/empty with honest UI;
- Store route remains discoverable;
- Store product posts do not appear as Global Articles.

### Store Discovery `/store`

Required:

- visible filters use Store taxonomy;
- Products shows Store products;
- Categories shows Store categories;
- All includes Store routes/actions;
- Saved works or is intentionally absent/empty with honest UI;
- non-Store editorial posts do not appear as Store Products.

## Acceptance Criteria

Task is accepted only if:

- visible filters are visitor-friendly;
- internal discovery item taxonomy remains intact;
- Global and Store domain clustering remains strict;
- Saved is either real or intentionally deferred;
- shell/visual rhythm remains unchanged;
- bottom command remains bottom-positioned;
- comments proof passes;
- CI/CD passes.

## Required Final Report

```txt
TASK-DISCOVERY-003 completed.

Changed:
- Global visible filters remapped: YES/NO
- Store visible filters remapped: YES/NO
- Routes/Sections/Actions hidden from primary filters: YES/NO
- Routes/Sections/Actions still searchable under All: YES/NO
- Saved implemented or intentionally deferred: IMPLEMENTED/DEFERRED
- Store content excluded from Global Articles/Topics: YES/NO
- non-Store content excluded from Store Products/Categories: YES/NO
- Threaded comments behavior changed: NO
- Blog1 detail branch changed: NO

Verification:
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run gaga:verify-discovery-filters if added: PASS/FAIL
- npm run gaga:verify-store-isolation if added: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- git diff --check: PASS/FAIL
```

## Out of Scope

- Search ranking redesign.
- Remote search backend.
- New visual identity.
- Shell focus trap/drag-to-close.
- Theme collapse.
- More sheet redesign.
- Dock redesign.
