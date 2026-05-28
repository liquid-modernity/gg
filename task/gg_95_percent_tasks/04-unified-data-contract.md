# Task 04 — Unified Data Contract

## Objective

Normalize the data contract for listing, preview, detail, and store surfaces so preview/snippet behavior no longer depends on fragile fallback guessing.

This task prevents recurring bugs like:

```text
all snippets show the same dummy meta description
preview displays "No summary is available yet"
parser reads the wrong meta description
store preview and root preview use different payload assumptions
```

## Hard Constraints

- Do not rewrite Blog1.
- Do not rewrite Blogger post loop structure.
- Do not change Blogger-owned data expressions except safe GG-owned `data-gg-*` attributes.
- Do not break SSR visible content.
- Do not make meta description the primary preview source.
- Do not remove valid SEO meta description.

## Required Data Contract

Every GG-owned row/card/detail surface that can open a preview should expose as many of these as available:

```html
data-gg-title
data-gg-url
data-gg-summary
data-gg-image
data-gg-date
data-gg-author
data-gg-type
data-gg-surface
```

Recommended examples:

### Blog Listing Row

```html
<article
  class="gg-entry-row"
  expr:data-gg-title="data:post.title.escaped"
  expr:data-gg-url="data:post.url"
  expr:data-gg-summary="data:post.snippet.escaped"
  expr:data-gg-image="data:post.featuredImage"
  expr:data-gg-date="data:post.date.iso8601"
  expr:data-gg-author="data:post.author.name"
  data-gg-type="post"
  data-gg-surface="blog-listing">
</article>
```

Use actual Blogger-safe expressions already compatible with the project. The example above is conceptual; do not introduce unsafe expressions that can break Blog1.

### Store Card

```html
<article
  class="store-card"
  data-gg-title=""
  data-gg-url=""
  data-gg-summary=""
  data-gg-image=""
  data-gg-type="product"
  data-gg-surface="store">
</article>
```

## Preview Source Priority

Preview rendering should use this order:

```text
1. data-gg-* payload from clicked row/card
2. JSON-LD description from fetched detail if needed
3. visible content excerpt from fetched detail if needed
4. meta description as last fallback
5. registry copy fallback only if no real summary exists
```

Meta description must not be the primary preview source because it can be global, fallback, or route-level.

## SEO Meta Description Rule

Keep one valid non-empty meta description per route.

Do not restore dummy descriptions like:

```text
Mary's simple recipe...
```

Use a dynamic route-aware description plus a non-empty fallback.

## Required Work

### 1. Normalize payload extraction

Create or normalize a function similar to:

```js
function getSurfacePayload(el) {
  return {
    title: readData(el, "ggTitle"),
    url: readData(el, "ggUrl"),
    summary: readData(el, "ggSummary"),
    image: readData(el, "ggImage"),
    date: readData(el, "ggDate"),
    author: readData(el, "ggAuthor"),
    type: readData(el, "ggType"),
    surface: readData(el, "ggSurface")
  };
}
```

Use the project’s existing style and naming.

### 2. Make preview renderer payload-first

Preview should render summary from payload before fetch fallback.

### 3. Keep fetch parser as fallback only

Fetched document parser is still useful, but it must not override a valid payload summary with dummy or empty data.

### 4. Keep JSON-LD and visible HTML aligned

If JSON-LD says one description and visible content says another, prefer visible content/payload for UI preview unless SEO contract says otherwise.

## Acceptance Criteria

- Root listing preview shows article-specific summary.
- Store preview shows product-specific summary.
- Dummy meta description never appears in preview.
- `No summary is available yet` only appears when no real summary exists.
- SEO meta description remains present and non-empty.
- Blog1 does not break.
- No native comments source rewrite.

## Suggested Verification

```bash
npm run build
npm run qa:contract
```

Manual:

```text
1. Open several root listing previews.
2. Confirm summaries are not identical unless source content is identical.
3. Open store preview.
4. Confirm store-specific product summary appears.
5. Check rendered head has one valid non-empty meta description.
```
