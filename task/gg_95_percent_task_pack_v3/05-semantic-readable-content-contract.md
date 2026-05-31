# Task 05 — Semantic Readable Content Contract

## Objective

Make rendered HTML semantically readable, crawlable, accessible, and Reader Mode eligible by design where appropriate, especially for Blogger post detail pages.

This task also fixes unresolved Blogger substitutions such as:

```html
<!--Can't find substitution for tag [post.title.escaped]-->
```

Known current behavior: the unresolved `post.title.escaped` issue appears on post detail pages, not page detail pages.

## Hard Constraints

- Do not promise Reader Mode activation across all browsers/devices.
- Do not force homepage, Store listing, or app-like surfaces to become article-like just to trigger Reader Mode.
- Do not hide unresolved Blogger comments with CSS, JS, or Worker HTMLRewriter.
- Do not use `data:post.*` in global head if Blogger cannot resolve it there.
- Do not manually patch generated output.
- Do not repair semantic/schema/readability defects at the edge; fix Blogger/source template scope and rebuild.
- Do not make JSON-LD replace visible semantic HTML.

## Surface Targets

```txt
Post detail:
  Reader Mode eligible by semantic structure.
  Must be free from unresolved Blogger substitution comments.
  Must emit valid Article/BlogPosting schema.

Page detail:
  Semantic readable output.
  Must be free from unresolved substitutions.
  Does not need post schema unless it is actually a post.

Landing:
  Semantic, crawlable, accessible, readable.
  Reader Mode nice-to-have, not blocker.

Root:
  Semantic, crawlable, accessible listing/home.
  Reader Mode not required.

Store listing:
  Semantic catalog/listing.
  Product/ItemList schema where valid.
  Reader Mode not target.

Product detail:
  Readable fallback and valid product schema.
  Reader Mode nice-to-have, not blocker.
```

## Required Semantic Structure for Post Detail

Rendered post detail should contain:

```txt
one main content landmark
one article element for the main post
one h1 for the post title
real paragraph content available in SSR HTML
author/byline where available
time datetime where available
ordered headings
main image with useful alt where available
clean separation between article content and boilerplate UI
```

Boilerplate must be isolated from the main article:

```txt
navigation
dock
bottom sheets
preview sheets
related posts
comments
store widgets
ads/sponsor areas
share UI
```

## JSON-LD Scope Validity

Post-specific JSON-LD must be emitted only where post-scoped data is available. If `data:post.*` is not available in global `<head>`, move the Article/BlogPosting JSON-LD into a valid Blogger post/widget scope.

JSON-LD may be emitted in `<body>` when that is the safest way to access post-scoped Blogger data.

Global head may use global data only, such as view/blog-level variables known to resolve safely.

## Unresolved Blogger Substitution Guard

Mandatory guard must fail rendered/generated output if it contains:

```txt
Can't find substitution for tag
<data:
expr: unresolved in final output
post.title.escaped unresolved comments
```

Do not create a naive source grep that bans all `data:post.*`; `data:post.*` is valid inside the correct post scope. The guard should focus on final rendered/generated output and unsafe global-head usage.

## Schema Boundary After Store Split

After Store CMS split:

```txt
Root/editorial CMS:
  Article/BlogPosting/WebPage/BreadcrumbList as appropriate.
  Must not infer Product schema from Store labels.

Store CMS/source adapter:
  Product/ItemList/BreadcrumbList as appropriate.
```

## Acceptance Criteria

- Post detail output contains no `Can't find substitution for tag` comments.
- Post detail Article/BlogPosting JSON-LD uses valid resolved data.
- Page detail remains semantic and is not incorrectly forced into post schema.
- Landing/root/store are semantic according to their surface, not forced into fake article structure.
- Main content is available in SSR HTML.
- Boilerplate UI is structurally isolated from main content.
- Schema validates for the relevant route family.


## Worker Non-Fix Rule

Reader/readability/schema problems must be fixed in source, not masked at the edge.

Forbidden fixes:

```txt
Cloudflare HTMLRewriter removes unresolved Blogger comments
Worker injects post titles into broken schema
Worker rewrites article/main/headings for healthy Blogger pages
Worker mutates JSON-LD as the normal schema pipeline
```

Allowed direction:

```txt
move post-specific JSON-LD into valid Blogger post scope
fix index.xml/source registries/build tools
rebuild generated publish artifacts
verify rendered output is clean
```
