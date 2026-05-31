# Task 08 — Unified Data Contract

## Objective

Normalize data payloads across listing, preview, detail, landing, and Store surfaces so the UI no longer depends on fragile fallback guessing.

This task prevents recurring bugs such as:

```txt
all previews show the same dummy meta description
preview shows "No summary is available yet"
parser reads global meta description instead of item excerpt
root preview and store preview expect different payload shapes
```

## Hard Constraints

- Do not make meta description the primary preview source.
- Do not remove valid SEO meta descriptions.
- Do not break SSR visible content.
- Do not hardcode source feed URLs inside controller.
- Do not mix Article and Product payloads without declared type.
- Do not fetch Store feed on Root unless explicitly requested.
- Do not use Worker HTMLRewriter to synthesize missing `data-gg-*` payloads on healthy Blogger pages.

## Required Data Attributes

GG-owned row/card/detail surfaces that can open a preview should expose as many as available:

```html
data-gg-title
data-gg-url
data-gg-summary
data-gg-image
data-gg-date
data-gg-author
data-gg-type
data-gg-surface
data-gg-source
```

Expected types:

```txt
post
page
product
listing
landing
```

Expected surfaces:

```txt
root-listing
post-detail
page-detail
landing
store-listing
product-detail
search
```

## Preview Source Priority

Preview rendering should use this priority:

```txt
1. data-gg-* payload from clicked row/card
2. route/source registry payload if already loaded
3. fetched detail JSON-LD description/headline if needed
4. visible excerpt/body fallback from fetched detail
5. route-specific registry copy only when no real content exists
6. global meta description last, and never as repeated item preview text
```

## Source Registry Contract

Data source URLs must live in config/registry, not controller internals.

```txt
rootSource.feed
rootSource.sitemap
storeSource.feed
storeSource.sitemap
storeSource.publicCanonicalBase
storeSource.sourceHost
```

## Canonical URL Mapping

Store source URLs must be normalized to public canonical Store routes when displayed publicly:

```txt
source/backend: pakrppstore.blogspot.com or store.pakrpp.com
public canonical: https://www.pakrpp.com/store/...
```

Root/editorial URLs should remain under:

```txt
https://www.pakrpp.com/...
```

## Validation

Add or update a read-only data contract guard to check:

```txt
previewable cards/rows have declared data type/surface
Store cards do not masquerade as posts
Root articles do not masquerade as products
meta description is not used as repeated preview summary
source config is centralized
no hardcoded Blogspot feed URL inside controller modules
```

## Acceptance Criteria

- Root preview and Store preview consume a compatible payload shape.
- Store canonical links point to `www.pakrpp.com/store/...`.
- Root does not require Store feed to render.
- Store does not require Root feed to render.
- Meta description remains SEO meta, not primary preview data.
- Data source URLs are centralized.


## No Edge Data Patch

If preview/detail payloads are missing, add them to source markup, registry output, Store build output, or declared source adapters. Do not depend on Worker HTMLRewriter to inject `data-gg-*` attributes into already-rendered Blogger HTML as the normal data contract.
