TASK: Make /store LCP featured product single-source and verify live freshness before judging Lighthouse.

Context:
Current issue:
- Lighthouse live still shows old /store behavior or stale HTML risk.
- We added LCP preload + static initial LCP card + STORE_LCP_PRODUCT manually.
- Manual sync across 3 places is fragile:
  1. <link rel="preload" as="image" ...>
  2. static initial LCP card in body
  3. STORE_LCP_PRODUCT JS config

Goal:
Create one source of truth for the LCP featured product and generate/sync all three locations from it. Also make live smoke verify that production is actually serving the new Store contract before running Lighthouse.

Do NOT change:
- /store route/canonical
- Worker route mapping
- sw.js behavior unless live smoke needs selector checks
- dock vocabulary
- i18n system
- template rendering architecture
- marketplace CTA hierarchy
- Store visual direction
- product feed as source of truth after hydration

============================================================
A. ADD SINGLE SOURCE CONFIG
============================================================

Create a config file:

config/store-lcp-product.json

Content example:

{
  "slug": "neutral-linen-overshirt",
  "name": "Neutral Linen Overshirt",
  "category": "Fashion",
  "priceText": "Rp429.000",
  "image": "https://picsum.photos/seed/yellowcart-linen-1/900/1125",
  "alt": "Neutral Linen Overshirt"
}

Rules:
- This config is only for LCP discovery/performance.
- Blogger feed / gg-store-data remains the source of truth after hydration.
- If the feed product with the same slug exists, feed data wins.
- The config must be easy to edit when the featured product changes.
- Do not add multiple LCP products.
- Do not preload multiple product images.

Acceptance:
- One file controls the LCP product.
- No manual editing of three separate LCP locations is needed.

============================================================
B. ADD SYNC SCRIPT
============================================================

Create:

tools/sync-store-lcp.mjs

The script must:
1. Read config/store-lcp-product.json.
2. Validate required fields:
   - slug
   - name
   - category
   - priceText
   - image
   - alt
3. Update guarded regions in store.html:
   - LCP preload block in <head>
   - initial static LCP card in body
   - STORE_LCP_PRODUCT JS config

Use explicit markers in store.html:

HEAD:
<!-- STORE_LCP_PRELOAD_START -->
<link rel="preload" as="image" href="..." fetchpriority="high" />
<!-- STORE_LCP_PRELOAD_END -->

BODY:
<!-- STORE_LCP_CARD_START -->
... static initial LCP card ...
<!-- STORE_LCP_CARD_END -->

SCRIPT:
  // STORE_LCP_PRODUCT_START
  var STORE_LCP_PRODUCT = {...};
  // STORE_LCP_PRODUCT_END

The script should replace only the content between markers.

Security/safety:
- Escape HTML attributes.
- Escape JS string values safely using JSON.stringify.
- Fail loudly if markers are missing.
- Fail loudly if required config fields are empty.
- Do not use regex that can accidentally rewrite unrelated blocks.

Acceptance:
- Running `node tools/sync-store-lcp.mjs` updates store.html deterministically.
- Re-running it without config changes produces no diff.
- Generated preload/card/config all match the same image/slug/name.

============================================================
C. UPDATE PACKAGE SCRIPTS / BUILD FLOW
============================================================

Update package.json scripts so LCP sync runs before verification/build.

Add:

"gaga:sync-store-lcp": "node tools/sync-store-lcp.mjs"

Ensure these flows run sync before artifact smoke/build:
- npm run build
- npm run gaga:verify-store-artifact
- npm run gaga:verify-worker if it depends on artifact smoke

If existing build script is:
"build": "node tools/cloudflare-prepare.mjs"

Change to something like:
"build": "npm run gaga:sync-store-lcp && node tools/cloudflare-prepare.mjs"

If existing verify script can safely call sync first:
"gaga:verify-store-artifact": "npm run gaga:sync-store-lcp && bash qa/store-artifact-smoke.sh"

Do not create circular npm scripts.

Acceptance:
- Build always uses latest config.
- Artifact smoke always checks synced source.
- CI cannot accidentally deploy stale LCP card/preload.

============================================================
D. UPDATE STORE.HTML TO USE GENERATED BLOCKS
============================================================

Replace current hardcoded LCP preload with marked generated block.

Expected generated preload:

<!-- STORE_LCP_PRELOAD_START -->
<link rel="preload" as="image" href="https://picsum.photos/seed/yellowcart-linen-1/900/1125" fetchpriority="high" />
<!-- STORE_LCP_PRELOAD_END -->

Replace current static first LCP card with marked generated block.

Generated body card must include:
- data-store-initial-lcp-card
- data-store-initial-lcp-image
- img src = config.image
- alt = config.alt
- loading="eager"
- decoding="async"
- fetchpriority="high"
- category, priceText, title from config
- no interactive button before hydration
- same card aspect ratio/layout as real cards

Replace current STORE_LCP_PRODUCT object with marked generated block.

Expected JS:
var STORE_LCP_PRODUCT = {
  slug: "...",
  name: "...",
  category: "...",
  priceText: "...",
  image: "...",
  alt: "..."
};

Acceptance:
- Preload, body card, and JS config are visibly generated from the same config.
- Static card remains non-interactive.
- Feed hydration still promotes matching slug to first hydrated slot.

============================================================
E. STORE RENDERING MUST STILL PROMOTE CONFIGURED SLUG
============================================================

Keep or verify existing logic:

- Default unfiltered view promotes STORE_LCP_PRODUCT.slug to the first visible hydrated slot if found in feed.
- Filtered views should not force the LCP product if it does not match filter.
- Search result ordering should remain user-intent based.
- Feed data wins after hydration.

Acceptance:
- Initial static LCP card and hydrated first card match in default view.
- No CLS from replacing static LCP card with hydrated card.
- Filtering Fashion/Skincare/etc still behaves correctly.

============================================================
F. UPDATE ARTIFACT SMOKE
============================================================

Update qa/store-artifact-smoke.sh.

Add checks:
- config/store-lcp-product.json exists
- tools/sync-store-lcp.mjs exists
- store.html contains STORE_LCP_PRELOAD_START/END markers
- store.html contains STORE_LCP_CARD_START/END markers
- store.html contains STORE_LCP_PRODUCT_START/END markers
- preload href matches config image
- preload has rel="preload"
- preload has as="image"
- preload has fetchpriority="high"
- initial LCP card img src matches config image
- initial LCP card alt matches config alt
- initial LCP card has loading="eager"
- initial LCP card has fetchpriority="high"
- STORE_LCP_PRODUCT.slug matches config slug
- STORE_LCP_PRODUCT.image matches config image
- no second product image preload exists
- first visible image priority logic still exists
- no fetchPriority low is applied to index 0 or first viewport

Keep existing checks:
- no #home regression
- no innerHTML UI rendering
- no insertAdjacentHTML
- no JS inline visual styling
- i18n hooks remain
- semantic sections remain
- ItemList JSON-LD target remains
- hidden sheets use hidden/aria-hidden/inert
- WhatsApp href uses https://wa.me/
- overflow-x guard exists
- debugVitals/debugOverflow gated

Acceptance:
- Smoke fails if LCP config/preload/card/JS drift out of sync.

============================================================
G. UPDATE LIVE SMOKE FOR FRESHNESS
============================================================

Update qa/live-smoke-worker.sh.

For live /store, check:
- response contains `data-store-initial-lcp-card`
- response contains `data-store-initial-lcp-image`
- response contains `fetchpriority="high"`
- response contains LCP preload:
  rel="preload"
  as="image"
  fetchpriority="high"
- response contains STORE_LCP_PRODUCT slug or image
- response no longer contains known stale strings:
  - "Coba refresh katalog"
  - "calendar_add_on"
  - "Affiliate links may be used Harga"
  - "href=\"wa.me/"
- response contains current contract strings/hooks:
  - `id="store-grid-skeleton"`
  - `id="store-category-context"`
  - `id="store-semantic-products"`
  - `id="store-itemlist-jsonld"`

Also print freshness diagnostics:
- x-gg-release if present
- x-gg-template-fingerprint if present
- snippet around STORE_LCP_PRELOAD_START
- snippet around data-store-initial-lcp-card

Acceptance:
- Live smoke clearly distinguishes stale production HTML from current source.
- Lighthouse is only trusted after live smoke passes.

============================================================
H. OPTIONAL: STORE VERSION MARKER
============================================================

Add a small version marker to store.html to help freshness diagnostics.

Example:
<meta name="gg-store-contract" content="store-lcp-single-source-v1" />

or body:
data-store-contract="store-lcp-single-source-v1"

If added, live smoke should check it.

Acceptance:
- Easy to confirm live page is the expected Store generation.

============================================================
I. MANUAL COMMANDS
============================================================

Run locally:

node tools/sync-store-lcp.mjs
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker
git diff --check

After deploy:

npm run gaga:verify-worker-live

Then open live source or curl and confirm:
- LCP preload is present.
- Static initial LCP card is present.
- No stale strings remain.

Then run Lighthouse.

============================================================
J. LIGHTHOUSE ACCEPTANCE
============================================================

In Lighthouse, LCP request discovery should pass:

- lazy load not applied ✅
- fetchpriority=high applied ✅
- request discoverable in initial document ✅

Targets:
Mobile:
- FCP < 2s
- LCP < 2.5–3s
- CLS < 0.1
- Speed Index < 3.4s
- TBT low

Desktop:
- FCP < 1.5–2s preferred
- LCP < 2.5s
- CLS < 0.1
- Speed Index < 2.5–3s
- TBT low

Final acceptance:
- LCP config is single-source.
- Preload, static card, and JS config cannot drift silently.
- Live smoke catches stale deployment.
- Lighthouse evaluates the actual current Store HTML, not stale production.