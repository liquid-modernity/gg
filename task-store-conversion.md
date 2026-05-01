You are working inside my VS Code project for PakRPP / Yellow Cart.

Goal:
Upgrade /store for AI Overviews, ChatGPT Search readiness, and affiliate UX conversion while preserving development safety guards.

Important framing:
- The project is still in development.
- Development mode may intentionally send:
  X-Robots-Tag: noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0
- Do NOT remove the development noindex guard globally.
- Instead, create a clear dev/prod robots contract so production /store can go indexable without accidental noindex.
- Judge AI readiness as if production mode is enabled and development noindex is removed.
- Do not redesign the UI.
- Do not build checkout/cart.
- PakRPP is an affiliate curator/discovery surface, not the merchant or checkout provider.

Current known state:
- Static-first /store prerender is working.
- npm run store:build returns products from feed.
- npm run store:proof passes.
- live curl confirms product names and ItemList exist in HTML.
- /store currently runs in development mode and may intentionally be noindex.

TASK 1 — Create explicit robots mode contract

Inspect worker.js / edge governance config.

Implement or verify a clear mode split:

Development / staging:
- X-Robots-Tag may be:
  noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0

Production /store:
- Must NOT emit noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0
- Either omit X-Robots-Tag entirely or emit:
  index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1

Rules:
- Do not remove development protection.
- Add comments explaining that noindex is allowed only in development/staging.
- Add a QA check that can test both modes:
  1. development mode may contain noindex
  2. production mode for /store must not contain noindex/nofollow/nosnippet/noimageindex

Deliver:
- Explain where the mode is controlled.
- Explain how to verify production /store will be indexable before go-live.

TASK 2 — Keep /store/ canonical redirect as production requirement

Live development may not yet enforce production redirect, but production must.

Requirement:
- /store must be canonical.
- /store/ must 301 or 308 to /store in production mode.

Do not break:
- /store
- /search/label/Store
- product post URLs
- /landing
- /

Add QA check:
- In production-mode smoke, /store/ must redirect to /store.
- In development mode, if redirect is intentionally disabled, print warning not failure.

TASK 3 — Upgrade JSON-LD graph for AI-readability

Do not add fake AI-specific schema. Use standard schema only.

In store.html static output, ensure JSON-LD includes or references:

1. WebSite
- @type: WebSite
- @id: https://www.pakrpp.com/#website
- name: PakRPP
- url: https://www.pakrpp.com

2. Organization
- @type: Organization
- @id: https://www.pakrpp.com/#organization
- name: PakRPP
- url: https://www.pakrpp.com

3. CollectionPage
- @type: CollectionPage
- @id: https://www.pakrpp.com/store#collection
- name: Yellow Cart
- url: https://www.pakrpp.com/store
- isPartOf: https://www.pakrpp.com/#website
- publisher: https://www.pakrpp.com/#organization
- description: concise description of Yellow Cart as an affiliate product curation/discovery page
- mainEntity: ItemList @id

4. ItemList
- @type: ItemList
- @id: https://www.pakrpp.com/store#itemlist
- name: Yellow Cart product picks
- numberOfItems: product count
- itemListOrder: https://schema.org/ItemListOrderDescending
- itemListElement: ListItem[]

5. Product items
Each ListItem:
- position
- url = product canonicalUrl
- item = Product object

Product object:
- @type Product
- @id = canonicalUrl + "#product"
- name
- description = summary
- image = images
- brand = Brand
- category

Affiliate rule:
- Do not emit Offer for marketplace search URLs.
- Treat URLs containing /search, keyword=, ?q=, st=product&q= as non-specific search URLs.
- If only search URLs are available, omit offers.
- If a specific marketplace product URL exists, Offer may be emitted.
- Do not imply PakRPP is the seller.
- If emitting Offer, seller should be the marketplace or external seller when known, not PakRPP.

TASK 4 — Align visible content with JSON-LD

Ensure /store visible HTML contains:
- product name
- category
- priceText as estimate/display text
- summary
- whyPicked
- bestFor
- caveat
- affiliate disclosure

Do not let JSON-LD contain important claims that visible HTML does not show.

TASK 5 — Improve preview conversion hierarchy

In product preview sheet, reorder content as:

1. Product title
2. Price estimate
3. Verdict / one-sentence recommendation
4. Why picked
5. Caveat
6. Marketplace CTA group
7. Footnote disclosure

Marketplace CTA UI:
- Add small heading/label: “Cek harga”
- Buttons should be short:
  Shopee
  Tokopedia
  TikTok
- Do not use long visible button labels like “Cek harga di Shopee”.
- Do not use:
  Checkout
  Add to cart
  Buy now
  Beli sekarang
  Masukkan keranjang

Each marketplace link must have:
- target="_blank"
- rel="sponsored nofollow noopener noreferrer"
- aria-label with full meaning, for example:
  aria-label="Cek harga Dummy Desk Tray Organizer di Shopee"

Footnote directly below CTA group:
“Harga, stok, pengiriman, dan retur mengikuti marketplace masing-masing.”

TASK 6 — Improve product card conversion without clutter

Do not redesign the grid.

Card rules:
- Keep image, category, priceText, name.
- Card href must remain canonical product post.
- JS may intercept to open preview.
- No-JS must navigate to canonical post.
- Do not add long marketplace CTAs to the card itself.

TASK 7 — Improve category/use-case discoverability

Keep existing category filters, but support use-case tags for future filtering/search.

Product data may include:
- bestFor
- useCase
- geoContext
- tags

Ensure static product JSON preserves these fields.
Ensure search/discovery can match them if current search logic allows extension.

Do not redesign category UI yet.

TASK 8 — Verify OAI-SearchBot readiness without enabling production indexing yet

Inspect robots.txt generation or static robots.txt if present.

Development can remain noindex, but report whether production robots.txt would allow:
- OAI-SearchBot
- Googlebot

Do not block OAI-SearchBot in production unless explicitly configured.

Deliver:
- Whether OAI-SearchBot is currently allowed or blocked.
- Where that rule is defined.
- What must change before go-live, if anything.

TASK 9 — Strengthen proof scripts

Update proof scripts to check:

Static/schema:
- #store-static-products exists and has products
- ItemList exists and itemListElement count matches products count
- CollectionPage exists
- WebSite or Organization graph exists, unless already globally present
- Product item URLs point to canonical posts, not marketplace search URLs
- Offer is omitted for marketplace search URLs
- numberOfItems matches product count

LCP:
- exactly one generated product image has fetchpriority="high"
- exactly one preload image has fetchpriority="high"
- both high priority URLs match
- no non-LCP product image has fetchpriority="high"

Affiliate links:
- generated marketplace links have target="_blank"
- generated marketplace links have rel="sponsored nofollow noopener noreferrer"
- visible marketplace labels are short: Shopee, Tokopedia, TikTok
- aria-label contains full meaning

Robots mode:
- dev mode may have noindex
- production mode must not have noindex/nofollow/nosnippet/noimageindex

TASK 10 — Do not change these yet

Out of scope:
- Replacing Picsum images.
- Removing development noindex immediately.
- Changing cache policy immediately.
- Building cart/checkout.
- Moving rendering to Worker runtime SSR.
- Redesigning dock/sheets/cards.
- Adding llms.txt as a substitute for real static HTML.
- Creating fake reviews, fake ratings, fake availability, or fake seller data.

Acceptance criteria:
1. npm run store:build passes.
2. npm run store:proof passes.
3. Static HTML still contains product cards.
4. Static HTML still contains semantic product notes.
5. JSON-LD graph is valid JSON.
6. ItemList count matches product count.
7. No Offer is emitted for search-only marketplace URLs.
8. Marketplace visible CTA labels are short.
9. Marketplace aria-labels are descriptive.
10. Development noindex guard remains allowed.
11. Production mode has a clear path to indexable /store.
12. /store remains usable without JavaScript.

Deliver:
- changed files
- summary of schema changes
- summary of UX conversion changes
- how to verify dev vs production robots behavior
- whether OAI-SearchBot is allowed
- whether /store/ redirect is production-ready