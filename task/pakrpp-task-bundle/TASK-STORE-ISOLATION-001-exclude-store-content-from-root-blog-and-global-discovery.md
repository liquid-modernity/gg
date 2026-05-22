# TASK-STORE-ISOLATION-001 — Exclude Store Content from Root Blog and Global Discovery

## Status

Development task.

This task defines the content-domain boundary between Blog/Global surfaces and Store/Commerce surfaces.

## Strategic Purpose

`/`, `/landing`, and `/store` are one product system, but they are not the same content domain.

Correct route truth:

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface
```

Store product posts must not appear as ordinary Blog articles on `/` or as ordinary Articles/Topics inside Global Discovery. Store content should surface through `/store`, Store category pages, Store Discovery, and explicit route links.

## Non-Negotiables

- Do not break Blog1.
- Do not alter Blog1 detail rendering.
- Do not alter post detail canonical URLs.
- Do not alter Blogger native comments.
- Do not alter threaded comments, `parentID`, composer movement, replies sheet, or comment proof semantics.
- Do not rewrite canonical post URLs.
- Do not introduce Worker canonical rewrites in this task.
- Do not hide Store content only with CSS or post-render DOM removal.
- Do not remove Store posts from Blogger itself.
- Do not remove Store content from `/store` or Store category pages.
- Do not expose `Landing` as a public label.

## Core Rule

```txt
Store as a route = allowed globally.
Store as a root Blog article/topic = not allowed.
```

Global/Blog surfaces may include a `Store` route/action link, but must not include Store product posts as normal editorial content.

## Required Content Domain Classifier

Create or centralize a single classifier used by:

- root Blog listing;
- Global Discovery articles;
- Global Discovery topics;
- Store Discovery products;
- Store Discovery categories;
- related/recent global surfaces if applicable;
- root ItemList/schema if applicable.

Suggested functions:

```js
isStoreContent(entry)
isStoreLabel(label)
isStoreChildLabel(label)
hasStoreDataPayload(entry)
getContentDomain(entry)
```

Suggested registry/config:

```js
const STORE_DOMAIN = {
  rootLabel: "Store",
  labelPrefixes: ["Store ", "Store:", "Store/"],
  categorySlugs: ["fashion", "skincare", "workspace", "tech", "everyday"],
  categoryLabels: ["Fashion", "Skincare", "Workspace", "Tech", "Everyday", "Etc", "Lainnya"]
};
```

Classification rules:

```txt
Store root label = Store
Store child label = Store Fashion / Store:Fashion / Store/Fashion, etc.
Store payload = post carries `.gg-store-data` or equivalent product payload
Store category alias = Etc / Everyday / Lainnya if currently mapped by Store builder
```

Do not duplicate label filtering rules in separate adapters.

## Required Root Blog Listing Behavior

On `/`, exclude Store content from the visual Blog listing.

Must exclude:

```txt
Store
Store Fashion
Store Skincare
Store Workspace
Store Tech
Store Everyday
Store Etc
Store Lainnya
Store:* 
Store/*
posts carrying gg-store-data
```

Must not exclude:

```txt
normal editorial posts
non-Store topics/labels
route link to Store
More sheet Store item
Dock/Search Store route/action
```

## Blog1 Safety Boundary

Filtering must apply only to listing/index/domain output.

Safe areas:

```txt
root listing render
root listing schema/ItemList
Global Discovery articles/topics
related/recent global lists if present
```

Do not modify:

```txt
Blog1 detail branch
post detail canonical
comment markup/plumbing
Blogger item page render
native Blogger label behavior unless explicitly guarded
```

If a Store post detail URL is opened directly, it should still render as a valid Blogger post/detail unless a separate future canonical strategy intentionally changes it.

## Required Global Discovery Behavior

Global Discovery on `/`, `/landing`, post detail, and page detail must exclude Store content from:

```txt
Articles
Topics
Saved non-Store, if applicable
```

Global Discovery may still include:

```txt
Store as route
Open Store as action
```

Do not show Store product posts as Global Articles.
Do not show Store labels as Global Topics.

## Required Store Discovery Behavior

Store Discovery on `/store` must include only Store-domain content:

```txt
Store product posts
Store categories
Store routes
Store saved products, if applicable
```

Store Discovery must exclude:

```txt
non-Store editorial articles
non-Store blog topics
landing sections as primary result domain
```

Store may include Home, Blog, and Contact as route/action items.

## Schema / SEO Requirements

If root `/` has ItemList JSON-LD or equivalent structured data, it must match the filtered root listing.

Required:

```txt
visual root listing excludes Store
root ItemList excludes Store
Global Discovery excludes Store article/topic content
Store pages still expose Store products/categories
```

Do not create mismatch where Store products are hidden visually but still present in root schema.

## Pagination Risk Note

Blogger may provide a page of posts where many items are Store-domain posts.

Acceptable short-term result:

```txt
root listing may show fewer items after filtering
```

Not acceptable:

```txt
root listing shows Store products because filtering is avoided
```

If pagination becomes sparse, solve later with a dedicated non-Store listing source/adapter. Do not break Blog1 to solve pagination.

## QA Requirements

Add or strengthen a guard, for example:

```txt
qa/store-isolation-guard.mjs
```

Recommended npm alias:

```txt
npm run gaga:verify-store-isolation
```

Guard must fail if:

- root `/` listing source/artifact contains Store product rows as Blog articles;
- root ItemList/schema contains Store product items;
- Global Discovery Articles contains Store product posts;
- Global Discovery Topics contains Store labels or child labels;
- Store Discovery does not include Store product/category content;
- Store content is removed from `/store`;
- Blog1 detail branch is modified unexpectedly;
- public label `Landing` is introduced.

The guard should prefer source/static artifact checks and avoid brittle exact product counts.

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
git diff --check
```

If added:

```bash
npm run gaga:verify-store-isolation
```

## Manual Proof

Check:

```txt
/
/landing
/store
one Store post detail URL
one normal editorial post detail URL
```

Required:

- `/` does not show Store products as Blog rows.
- `/landing` does not show Store products as Global Articles/Topics.
- `/store` still shows Store products.
- Store route remains available from Dock/More/Discovery.
- Normal editorial post detail works.
- Store post detail still works if opened directly.
- Comments proof remains passing.

## Acceptance Criteria

Task is accepted only if:

- root Blog listing excludes Store-domain content;
- Global Discovery excludes Store articles/topics;
- Store Discovery remains Store-only for products/categories;
- Store remains available as a route/action globally;
- root visual listing and root schema are aligned;
- Blog1 detail branch is not broken;
- comments proof passes;
- CI/CD passes.

## Required Final Report

```txt
TASK-STORE-ISOLATION-001 completed.

Changed:
- Store classifier added/centralized: YES/NO
- Root listing excludes Store content: YES/NO
- Root schema/ItemList excludes Store content: YES/NO
- Global Discovery excludes Store Articles/Topics: YES/NO
- Store Discovery remains Store-only: YES/NO
- Store route/action remains globally available: YES/NO
- Blog1 detail branch changed: NO
- Threaded comments behavior changed: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- npm run gaga:verify-store-isolation if added: PASS/FAIL
- git diff --check: PASS/FAIL

Manual proof:
- `/` no Store product listing: PASS/FAIL
- `/store` products still visible: PASS/FAIL
- Store post detail still renders: PASS/FAIL
- normal post detail still renders: PASS/FAIL
```

## Out of Scope

- Store category redesign.
- Store canonical rewrite.
- Worker label route redirects.
- Blogger API.
- Removing Store posts from Blogger.
- Full search backend.
- Theme/shell visual redesign.
