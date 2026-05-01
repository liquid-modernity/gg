You are working inside my VS Code project for PakRPP / Yellow Cart.

Goal:
Implement a build-time static prerender generator for /store so that store.html contains crawler-readable product content before JavaScript runs.

Context:
- /store is an affiliate product discovery page, not an internal checkout store.
- Checkout happens on external marketplaces such as Shopee, Tokopedia, and TikTok Shop.
- Product source of truth is Blogger posts labeled "Store".
- Each Store post contains an inline JSON block:
  <script type="application/json" class="gg-store-data">...</script>
- Each Store post may also have another editorial/category label such as Fashion, Skincare, Workspace, Tech, or Etc.
- The current store.html already has UI, dock, sheets, preview, filter, saved, discovery, and feed hydration logic.
- Do not redesign the UI.
- Do not replace Picsum images yet.
- Do not change cache: 'no-store' yet unless absolutely required for the static generator.
- Do not build checkout/cart functionality.
- Do not pretend PakRPP is the merchant. PakRPP is the curator/affiliate referrer.

Primary task:
Create a build-time generator that fetches the Blogger Store feed, extracts gg-store-data from each post, validates it, normalizes it, and injects generated static content into store.html.

Required output inside store.html:
1. Static LCP preload generated from the first product.
2. Static product grid HTML.
3. Static product data JSON for hydration.
4. Static ItemList/Product JSON-LD.
5. Static semantic product notes.
6. Existing JS should prefer static products first, then use feed fetch as enhancement/refresh.

Important architecture:
- This is not runtime SSR.
- This is static prerender / build-time snapshot.
- JavaScript enhancement should remain.
- If feed fetch fails but static products exist, the page must still show products and must not show empty state.

Files to inspect first:
- store.html
- store-lcp-product.json if present
- package.json
- worker.js or routing config if /store/ redirect is implemented there
- any existing qa/proof scripts

Implementation requirements:

TASK 1 — Add stable injection markers to store.html
Add or normalize these marker blocks. Preserve current UI classes and visual structure.

Use these markers exactly:

<!-- STORE_LCP_PRELOAD_START -->
<!-- generated preload here -->
<!-- STORE_LCP_PRELOAD_END -->

<!-- STORE_STATIC_GRID_START -->
<!-- generated product cards here -->
<!-- STORE_STATIC_GRID_END -->

<!-- STORE_STATIC_PRODUCTS_JSON_START -->
<script type="application/json" id="store-static-products">
[]
</script>
<!-- STORE_STATIC_PRODUCTS_JSON_END -->

<!-- STORE_ITEMLIST_JSONLD_START -->
<script type="application/ld+json" id="store-itemlist-jsonld">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Yellow Cart product picks",
  "url": "https://www.pakrpp.com/store",
  "itemListElement": []
}
</script>
<!-- STORE_ITEMLIST_JSONLD_END -->

<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->
<!-- generated semantic product notes here -->
<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->

Rules:
- If the current store.html already has STORE_LCP_PRELOAD markers, reuse them.
- Replace the currently empty <script type="application/ld+json" id="store-itemlist-jsonld"></script> with the marker block above.
- The main #store-grid must no longer be empty+hidden after generation.
- Keep the skeleton, but static grid should be visible when static products exist.
- Do not delete the existing skeleton unless it is clearly unused.
- Do not change styling unless necessary for anchor cards.

TASK 2 — Create build script
Create:

tools/build-store-static.mjs

The script must:
1. Fetch:
   https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50

2. Extract each post entry content:
   entry.content.$t

3. Find:
   <script type="application/json" class="gg-store-data">...</script>

4. Parse that JSON safely.

5. Normalize each product into this shape:

{
  id,
  slug,
  name,
  category,
  priceText,
  price,
  priceCurrency,
  availability,
  condition,
  brand,
  summary,
  verdict,
  whyPicked,
  bestFor,
  notes,
  caveat,
  material,
  useCase,
  geoContext,
  tags,
  images,
  links,
  canonicalUrl,
  storeUrl,
  datePublished,
  dateModified
}

Normalization rules:
- id = product.id || product.slug
- slug = product.slug || slug derived from id/name
- name = product.name || product.title
- category = product.category || "Etc"
- images must become an array.
- If product.image exists and product.images is missing, use [product.image].
- canonicalUrl = product.canonicalUrl || Blogger alternate link from entry.
- storeUrl = product.storeUrl || "https://www.pakrpp.com/store?item=" + slug
- datePublished/dateModified should fall back to entry.published.$t and entry.updated.$t.
- bestFor, notes, tags should always become arrays.
- links should preserve marketplace keys: shopee, tokopedia, tiktok, lazada, website if present.

Validation:
Required fields:
- slug
- name
- category
- priceText
- summary
- images[0]
- canonicalUrl

If required fields are missing:
- Do not silently continue.
- Print a clear validation error with product slug/name and missing field.
- Fail the build unless a --soft flag is passed.

Sorting:
- Sort products newest first using dateModified, then datePublished.
- If dates are missing, keep feed order.

TASK 3 — Generate static LCP preload
Generate one preload tag for the first product image:

<link rel="preload" as="image" href="FIRST_IMAGE_URL" fetchpriority="high" />

Only the first product image should get fetchpriority high.
Do not preload all product images.

TASK 4 — Generate static product grid
Inject into STORE_STATIC_GRID markers.

For each product, generate:

<article class="store-card" data-store-product-id="SLUG">
  <a
    class="store-card__button"
    href="CANONICAL_URL"
    aria-label="Buka NAME"
    data-store-open-preview="INDEX"
    data-store-product-slug="SLUG"
  >
    <div class="store-card__media">
      <img
        src="FIRST_IMAGE_URL"
        width="900"
        height="1125"
        alt="NAME"
        loading="eager/lazy"
        decoding="async"
        fetchpriority="high only for first product"
        draggable="false"
      />
      <span class="store-card__shade" aria-hidden="true"></span>
      <div class="store-card__content">
        <span class="store-card__badge">CATEGORY</span>
        <span class="store-card__price">PRICE_TEXT</span>
        <h2 class="store-card__title">NAME</h2>
      </div>
    </div>
  </a>
</article>

Rules:
- First product image: loading="eager" fetchpriority="high"
- Other product images: loading="lazy"
- Use canonicalUrl as href, not marketplace link.
- The link must work without JavaScript.
- Existing JavaScript may intercept the link to open preview sheet, but no-JS must still navigate to the product post.
- Escape HTML text and attributes correctly.

TASK 5 — Generate store-static-products JSON
Inject into STORE_STATIC_PRODUCTS_JSON markers.

Output:
<script type="application/json" id="store-static-products">
[normalized products here]
</script>

Safety:
- Escape closing script tags inside JSON.
- Preserve Unicode.
- Do not minify if readability is useful, but keep it reasonable.

TASK 6 — Generate ItemList/Product JSON-LD
Inject into STORE_ITEMLIST_JSONLD markers.

Use /store as ItemList URL:
https://www.pakrpp.com/store

Each ListItem:
- position
- url = product.canonicalUrl
- item = Product object

Product:
- @type Product
- @id = canonicalUrl + "#product"
- name
- description = summary
- image = images
- brand = Brand with product.brand || "Generic"
- category
- offers only if product.price and at least one specific marketplace/product URL exists.

Important affiliate rule:
- If marketplace link is only a search URL, avoid overclaiming a specific Offer.
- If product.links.shopee/tokopedia/tiktok exists, choose the first available URL as Offer.url.
- If URL contains "/search" or "keyword=" or "?q=", consider it non-specific and either:
  a) omit offers, or
  b) include a conservative AggregateOffer only if implementation is already clean.
Prefer omitting offers for search URLs to avoid false merchant signals.

TASK 7 — Generate static semantic product notes
Inject into STORE_STATIC_SEMANTIC_PRODUCTS markers.

For each product, generate a semantic block using existing classes:

<article class="store-semantic-product" id="store-note-SLUG">
  <div class="store-semantic-product__head">
    <p class="store-semantic-product__category">CATEGORY</p>
    <h3 class="store-semantic-product__title">NAME</h3>
    <p class="store-semantic-product__summary">SUMMARY</p>
  </div>
  <dl class="store-semantic-product__facts">
    <div class="store-semantic-product__fact">
      <dt class="store-semantic-product__label">Why picked</dt>
      <dd class="store-semantic-product__value">WHY_PICKED</dd>
    </div>
    <div class="store-semantic-product__fact">
      <dt class="store-semantic-product__label">Best for</dt>
      <dd class="store-semantic-product__value">BEST_FOR_JOINED</dd>
    </div>
    <div class="store-semantic-product__fact">
      <dt class="store-semantic-product__label">Caveat</dt>
      <dd class="store-semantic-product__value">CAVEAT</dd>
    </div>
  </dl>
  <div class="store-semantic-product__links">
    <a class="store-button store-button--subtle" href="CANONICAL_URL">Editorial detail</a>
    <a class="store-button" href="STORE_URL">Open in Store</a>
  </div>
</article>

Rules:
- Only include fact rows when the value exists.
- Use canonicalUrl for Editorial detail.
- Use storeUrl for Open in Store.
- Do not use marketplace links as the main semantic note links.
- Keep marketplace checkout links inside preview/detail behavior, not as the main SEO path.

TASK 8 — Update store.html JavaScript hydration
Modify existing JS carefully.

Add function:
readStaticProducts()

It should:
- read #store-static-products
- parse JSON
- return [] on error

Boot behavior:
- Before fetch feed, read static products.
- If static products exist:
  - set state.products = staticProducts
  - set state.filtered = staticProducts or equivalent current filtered state
  - set state.feedSource = "static"
  - hide skeleton
  - show #store-grid
  - do not show empty state
  - bind existing preview/open handlers to prerendered cards
  - render count/category context as ready
- Then fetch feed as enhancement.
- If feed succeeds and returns valid products:
  - replace/update state with feed products
  - render dynamic grid if needed
  - update semantic notes if needed
  - update JSON-LD if existing function does this
- If feed fails:
  - keep static products visible
  - do not replace static products with empty state
  - only show empty state if no static products exist.

Do not break:
- preview sheet
- filter
- discovery panel
- saved panel
- theme toggle
- language toggle
- keyboard shortcuts
- dock behavior
- reduced motion
- accessibility states

TASK 9 — Add package.json scripts
Add scripts if package.json exists:

"store:build": "node tools/build-store-static.mjs",
"store:proof": "node tools/proof-store-static.mjs"

If package.json does not exist, create a minimal one only if consistent with the project.

TASK 10 — Create proof script
Create:

tools/proof-store-static.mjs

It should read store.html and fail if:
- STORE_STATIC_GRID markers missing
- STORE_STATIC_PRODUCTS_JSON markers missing
- STORE_ITEMLIST_JSONLD markers missing
- #store-static-products missing
- #store-itemlist-jsonld missing
- static product JSON is empty
- ItemList JSON-LD has empty itemListElement
- #store-grid is hidden while static products exist
- "Product notes will appear here after the curation loads." remains visible in the static semantic product area after generated products exist
- first generated image does not have fetchpriority="high"
- more than one generated image has fetchpriority="high"
- any generated marketplace link lacks rel="sponsored nofollow noopener noreferrer" if marketplace links are generated anywhere

Print a concise PASS/FAIL summary.

TASK 11 — Optional but recommended: /store/ redirect
Inspect worker/routing config.
If /store/ currently returns 404 or is not normalized, add a safe 301 redirect:

/store/ -> /store

Do not alter route truth for:
/landing
/
/blog
/search/label/Store
individual post URLs

TASK 12 — Acceptance criteria
After implementation, these must pass:

1. npm run store:build
2. npm run store:proof
3. Opening store.html without JavaScript still shows product cards and semantic product notes.
4. view-source of /store contains product names.
5. view-source of /store contains ItemList JSON-LD with itemListElement.
6. First product image has exactly one fetchpriority="high".
7. Product card href points to canonical product post, not marketplace.
8. Marketplace links, if generated, use:
   rel="sponsored nofollow noopener noreferrer"
   target="_blank"
9. Feed fetch failure does not produce empty state when static products exist.
10. No visual redesign of the store UI.

Out of scope:
- Replacing Picsum images.
- Changing cache: 'no-store'.
- Building checkout/cart.
- Moving all rendering to Cloudflare Worker.
- Rewriting the whole store app.
- Redesigning dock/sheets/cards.
- Adding new SEO gimmicks such as llms.txt before static HTML product truth is fixed.

Deliverables:
- Summary of changed files.
- Explanation of how to add a new product:
  1. Create Blogger post.
  2. Add label Store plus category label.
  3. Insert valid gg-store-data JSON.
  4. Publish.
  5. Run npm run store:build.
  6. Run npm run store:proof.
  7. Deploy.
- Mention whether /store/ redirect was added or not.
- Mention any validation errors found in existing product data.