TASK: Upgrade /store for SEO, GEO, GEA, AI discoverability, and semantic product aggregation without changing the final UX architecture.

Context:
The /store surface is already stable:
- Canonical route: /store
- Dock: Store / Contact / Discover / Saved / More
- Product source: Blogger posts with label Store
- Dynamic UI uses <template> clones
- i18n ID/EN is normalized
- Product content is parsed from script.gg-store-data inside product posts

Goal:
Raise /store from a beautiful interactive catalog into a semantic, crawlable, AI-discoverable curated product hub.

Do NOT change:
- Worker route mapping
- sw.js
- dock vocabulary
- preview top sheet architecture
- Discovery/Saved/More sheet architecture
- template rendering architecture
- marketplace CTA hierarchy
- i18n system
- visual layout except minor semantic layer styling

============================================================
A. EXTEND PRODUCT DATA MODEL PARSER
============================================================

Extend parser to support richer fields from script.gg-store-data:

Required/known fields:
- id
- slug
- name
- category
- priceText
- price
- priceCurrency
- availability
- condition
- brand
- summary
- verdict
- whyPicked
- bestFor
- notes
- caveat
- material
- useCase
- geoContext
- tags
- images
- links
- canonicalUrl
- storeUrl
- datePublished
- dateModified

Rules:
- Keep backward compatibility with existing dummy products.
- If slug is missing, derive slug from post URL or title.
- If canonicalUrl is missing, use Blogger post URL.
- If storeUrl is missing, use /store?item={slug}.
- Product editorial content remains as authored.
- Do not auto-translate product content.

Acceptance:
- Existing posts still render.
- New richer product posts render more semantic detail.

============================================================
B. ADD EASY CATEGORY CONFIG
============================================================

Add a single easy-to-edit config object near constants:

var STORE_CATEGORY_CONFIG = {
  all: {
    labelKey: 'filterAllLabel',
    icon: 'filter_list',
    title: {
      id: 'Semua Kurasi',
      en: 'All Picks'
    },
    description: {
      id: 'Kumpulan produk pilihan Yellow Cart untuk gaya hidup, kerja, dan kebutuhan harian yang dikurasi secara editorial.',
      en: 'A curated Yellow Cart selection for lifestyle, work, and everyday use.'
    },
    keywords: ['yellow cart', 'kurasi produk', 'affiliate store']
  },
  fashion: {
    labelKey: 'filterFashionLabel',
    icon: 'checkroom',
    title: {
      id: 'Fashion',
      en: 'Fashion'
    },
    description: {
      id: 'Pilihan fashion dengan tampilan bersih, netral, dan mudah dipadukan untuk kerja, perjalanan, dan gaya harian.',
      en: 'Clean, neutral, and wearable fashion picks for work, travel, and daily style.'
    },
    keywords: ['fashion minimalis', 'daily wear', 'workwear']
  },
  skincare: {
    labelKey: 'filterSkincareLabel',
    icon: 'spa',
    title: {
      id: 'Skincare',
      en: 'Skincare'
    },
    description: {
      id: 'Kurasi skincare sederhana untuk rutinitas yang realistis, termasuk kebutuhan dasar kulit di iklim tropis.',
      en: 'Simple skincare picks for realistic routines, including basic needs in tropical climates.'
    },
    keywords: ['skincare tropis', 'skin barrier', 'daily skincare']
  },
  workspace: {
    labelKey: 'filterWorkspaceLabel',
    icon: 'desktop_windows',
    title: {
      id: 'Workspace',
      en: 'Workspace'
    },
    description: {
      id: 'Produk untuk setup kerja remote, meja kecil, dan ruang kerja yang rapi tanpa terasa berlebihan.',
      en: 'Products for remote work setups, small desks, and calm workspaces.'
    },
    keywords: ['remote work setup', 'workspace minimalis', 'WFH']
  },
  tech: {
    labelKey: 'filterTechLabel',
    icon: 'devices',
    title: {
      id: 'Tech',
      en: 'Tech'
    },
    description: {
      id: 'Perangkat dan aksesori teknologi yang dipilih untuk fungsi, kerapian, dan kemudahan penggunaan harian.',
      en: 'Tech devices and accessories selected for function, neatness, and everyday usability.'
    },
    keywords: ['tech accessories', 'minimal setup', 'daily tech']
  },
  etc: {
    labelKey: 'filterEtcLabel',
    icon: 'category',
    title: {
      id: 'Lainnya',
      en: 'Other'
    },
    description: {
      id: 'Produk lintas kategori yang tetap relevan dengan prinsip kurasi Yellow Cart.',
      en: 'Cross-category products that still fit the Yellow Cart curation logic.'
    },
    keywords: ['daily essentials', 'curated picks']
  }
};

Requirements:
- Filter icon map may derive from STORE_CATEGORY_CONFIG.
- Category descriptions must be rendered from this config.
- Changing category copy should not require touching render logic.

Acceptance:
- Category descriptions are easy to configure.
- No category explanation is hardcoded inside render functions.

============================================================
C. ADD CATEGORY SEMANTIC SECTION
============================================================

Add a crawlable visible semantic section in the Store body.

Markup:
<section class="store-category-context" id="store-category-context" aria-live="polite">
  <h2 id="store-category-title"></h2>
  <p id="store-category-description"></p>
</section>

Placement:
- After store-meta-row and before store-grid.
- Keep it visually quiet, not big hero copy.
- It must be visible, not hidden, not display:none.

Behavior:
- Default uses STORE_CATEGORY_CONFIG.all.
- When filter changes, update title/description.
- Respect active locale.
- Product content remains unchanged.

Acceptance:
- Search engines and AI can read category context.
- Users get a subtle explanation of each category.
- Config is easy to edit.

============================================================
D. ADD PRODUCT SEMANTIC SUMMARY LAYER
============================================================

Add a crawlable semantic product summary layer.

Markup:
<section class="store-semantic-products" id="store-semantic-products" aria-labelledby="store-semantic-title">
  <h2 id="store-semantic-title">Yellow Cart product notes</h2>
  <div id="store-semantic-product-list"></div>
</section>

Use templates, not HTML strings.

Templates:
- store-semantic-product-template
- store-semantic-tag-template or simple spans

Each semantic product entry should include:
- product name
- category
- short summary/verdict
- why picked
- best for
- caveat if available
- subtle internal detail link to canonical product post
- store deep link

Important:
- This section must be visible and crawlable.
- It can be visually quiet/compact.
- Do not hide it with display:none.
- Do not stuff keywords.
- Do not duplicate entire long post body.

Acceptance:
- AI/crawlers can read the reason products are curated.
- Human users can skim product notes without opening every preview.
- No spammy hidden text.

============================================================
E. ADD DEEP LINK PER PRODUCT
============================================================

Implement product deep linking.

Supported forms:
- /store?item={slug}
- /store#item-{slug}

Behavior:
- On load, after products are available:
  - detect item slug from query or hash
  - find matching product
  - open preview for that product
- When preview opens:
  - update URL to /store?item={slug} using history.replaceState or pushState
- When preview closes:
  - return URL to /store unless user arrived from a specific deep link and browser history should preserve it
- Copy Links should include store deep link if desired:
  Product Name
  Curated via Yellow Cart · PakRPP
  Store:
  https://www.pakrpp.com/store?item=slug
  Shopee:
  ...

Acceptance:
- Shared /store?item=slug opens directly to product preview.
- Invalid slug falls back to normal /store.
- Closing preview does not break navigation.
- Reduced motion respected.

============================================================
F. ADD ITEMLIST / COLLECTION JSON-LD FOR /store
============================================================

Keep existing CollectionPage JSON-LD in <head>.
Add a dynamic JSON-LD block for the product list after products load.

Use:
<script type="application/ld+json" id="store-itemlist-jsonld"></script>

Generate:
- @context: https://schema.org
- @type: ItemList
- name: Yellow Cart
- url: https://www.pakrpp.com/store
- itemListElement:
  - @type: ListItem
  - position
  - url: canonical product post URL, or /store?item=slug fallback
  - item:
    - @type: Product
    - name
    - image
    - description
    - brand if available
    - category
    - offers only if price/priceCurrency/url are reliable

Rules:
- Only include data visible on /store.
- Do not fabricate ratings, reviews, availability, shipping, return policy, or brand.
- If price is only priceText and cannot be parsed cleanly, omit numeric price Offer.
- If offer URL is an affiliate marketplace URL, include it only when clear and stable.
- Prefer canonical product post URL for ListItem.url.
- Validate JSON-LD with Rich Results Test after deploy.

Important:
Google can process structured data in the rendered DOM, but Product markup generated dynamically can be less reliable for fast-changing price/availability. Therefore, store-level JSON-LD is aggregate/supporting, not the only source of product truth.

Acceptance:
- JSON-LD is valid JSON.
- It updates after feed load.
- It does not mismatch visible content.
- It does not inject raw HTML.

============================================================
G. INTERNAL LINKING
============================================================

Add internal links without making marketplace CTAs less primary.

From /store:
- Each semantic product entry includes a subtle link to the canonical product post:
  "Detail editorial" / "Editorial detail"
- Each entry also has a store deep link:
  /store?item=slug

From product post:
Handled separately in the product post template.

Acceptance:
- Product posts are not orphaned.
- Marketplace buttons remain primary in preview.
- Internal detail link is visible but secondary.

============================================================
H. QA UPDATES
============================================================

Update qa/store-artifact-smoke.sh:

Check:
- STORE_CATEGORY_CONFIG exists
- store-category-context exists
- store-semantic-products exists
- store-itemlist-jsonld exists
- /store?item deep-link logic exists
- Product parser supports slug, canonicalUrl, whyPicked, bestFor, caveat
- ItemList JSON-LD generator exists
- No fabricated aggregateRating/reviewCount
- No hidden SEO text via display:none on semantic section
- Existing template/no-innerHTML rules still pass
- Existing i18n rules still pass

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker
git diff --check

Do not run live smoke before deploy.

Final acceptance:
- /store remains visually premium.
- /store becomes a crawlable semantic hub.
- Category descriptions are configurable.
- Product deep links work.
- ItemList JSON-LD is generated safely.
- Product posts remain source of truth.