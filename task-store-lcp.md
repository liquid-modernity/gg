TASK: Patch /store LCP request discovery, horizontal overflow, and small architecture cleanup.

Context:
Recent Lighthouse shows:
- Mobile FCP/SI/CLS are now good.
- Mobile LCP is still ~22.6s.
- Lighthouse identifies the LCP element as the first product image:
  Neutral Linen Overshirt
  src="https://picsum.photos/seed/yellowcart-linen-1/900/1125"
  loading="eager"
  fetchpriority="low"

Lighthouse also reports:
- lazy load not applied ✅
- fetchpriority=high should be applied ❌
- request is discoverable in initial document ❌

Interpretation:
The LCP image is discovered too late because product images come from Blogger feed + JS render.
Skeleton solved FCP/SI/CLS, but not LCP.
Now the fix must make the LCP candidate image discoverable in the initial HTML and high priority.

Do NOT change:
- /store route/canonical
- Worker route mapping
- sw.js
- dock vocabulary
- i18n system
- template-rendering architecture
- marketplace CTA hierarchy
- product semantic/data model
- visible design direction

Goal:
Make the first/featured product image discoverable from initial HTML, give it high fetch priority, prevent unnecessary horizontal scroll, and clean the remaining semantic-template debt.

============================================================
A. ADD STATIC LCP FEATURED PRODUCT CONFIG
============================================================

Add an easy-to-edit LCP config near constants or in body data attributes.

Preferred JS config:

var STORE_LCP_PRODUCT = {
  slug: 'neutral-linen-overshirt',
  name: 'Neutral Linen Overshirt',
  image: 'https://picsum.photos/seed/yellowcart-linen-1/900/1125',
  category: 'Fashion',
  priceText: 'Rp429.000'
};

Rules:
- This config is only for performance/LCP discovery, not the source of truth for the product.
- The real product still comes from Blogger feed / gg-store-data.
- If feed product with same slug exists, use feed data after hydration.
- If feed product differs, feed data wins for actual content.
- Keep config easy to edit when featured product changes.

Acceptance:
- There is one obvious place to configure the LCP product.
- No business logic depends permanently on this config.

============================================================
B. MAKE LCP IMAGE DISCOVERABLE IN INITIAL DOCUMENT
============================================================

Add preload in <head> for the configured LCP image:

<link
  rel="preload"
  as="image"
  href="https://picsum.photos/seed/yellowcart-linen-1/900/1125"
  fetchpriority="high"
  imagesrcset="..."
  imagesizes="..."
/>

If not using srcset, at minimum use:
<link rel="preload" as="image" href="..." fetchpriority="high">

Important:
- The href must match the actual first card image src after hydration.
- If using responsive images later, use imagesrcset/imagesizes correctly.
- Do not preload more than 1 product image.
- Do not preload all product images.

Acceptance:
- Lighthouse no longer says “Request is discoverable in initial document” for the LCP image.
- Browser discovers LCP image from HTML/head immediately.

============================================================
C. ADD INITIAL STATIC FEATURED CARD / LCP CARD SHELL
============================================================

Replace or augment the first skeleton card with a real initial featured card in HTML, using the configured LCP product.

Markup idea:
<section class="store-grid store-grid--initial" id="store-grid-initial" aria-hidden="true">
  <article class="store-card store-card--initial-lcp" data-store-initial-lcp-card>
    <div class="store-card__media">
      <img
        src="https://picsum.photos/seed/yellowcart-linen-1/900/1125"
        alt="Neutral Linen Overshirt"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        draggable="false"
      />
      <span class="store-card__shade" aria-hidden="true"></span>
      <div class="store-card__content">
        <span class="store-card__badge">Fashion</span>
        <span class="store-card__price">Rp429.000</span>
        <h2 class="store-card__title">Neutral Linen Overshirt</h2>
      </div>
    </div>
  </article>
  remaining skeleton cards...
</section>

Rules:
- It may be aria-hidden initially to avoid duplicate accessible card before JS hydrates.
- It must visually occupy the same grid position/size as the real first card.
- When real grid hydrates, replace it without CLS.
- Do not make this card open preview unless JS hydrates it safely.
- Do not duplicate interactive controls in initial static card.
- Keep the same 4:5 card aspect ratio.

Alternative:
If keeping #store-grid-skeleton, make its first card a real LCP image card and the rest skeleton.

Acceptance:
- Initial document contains the actual LCP image <img>.
- The first LCP image has loading="eager" and fetchpriority="high".
- Layout remains stable when real grid replaces initial/skeleton grid.
- No duplicate interactive product card is exposed to assistive tech.

============================================================
D. FIX IMAGE PRIORITY LOGIC BUG
============================================================

Current Lighthouse shows first product image rendered with fetchpriority="low".
This is wrong.

Update renderCardNode / image binding:
- index 0:
  loading="eager"
  fetchPriority="high"
  decoding="async"
- index 1:
  loading="eager"
  fetchPriority="high" or "auto"
- index 2-3:
  loading="lazy" or eager only if truly first viewport
  fetchPriority="auto"
- rest:
  loading="lazy"
  fetchPriority="auto"

Never set fetchPriority="low" on a product card that can appear above the fold.

Acceptance:
- Rendered first visible product image has fetchpriority="high".
- Lighthouse no longer reports high priority missing for the LCP image.
- Only the first 1–2 images get high priority.

============================================================
E. OPTIONAL: TWO-STAGE FEED FETCH, BUT DO NOT RELY ON IT FOR LCP
============================================================

The previous task proposed two-stage feed.
Keep it only as progressive hydration improvement.

Implement or keep:
- initial feed max-results=8
- full feed max-results=50 later

But make clear:
- Two-stage feed alone does not solve LCP if the LCP image is not in initial HTML.
- Initial LCP image preload/static card is the actual LCP fix.

Acceptance:
- Store can hydrate quickly from smaller feed.
- Deep links still trigger full feed if needed.
- LCP image discovery does not depend on feed completion.

============================================================
F. HORIZONTAL OVERFLOW AUDIT AND FIX
============================================================

There must be no unnecessary horizontal scroll on mobile or desktop.

Add or verify CSS guard:
html, body {
  max-width: 100%;
  overflow-x: clip;
}

@supports not (overflow-x: clip) {
  html, body { overflow-x: hidden; }
}

But do not rely only on clipping. Fix offenders.

Add dev-only overflow audit:
- enabled only by /store?debugOverflow=1
- logs elements whose bounding rect exceeds viewport width by >1px
- run after DOMContentLoaded
- run after initial feed render
- run after full feed render
- run on resize with debounce

Likely offenders to inspect:
- fixed dock width
- filter outline width
- preview/bottom sheet width + border
- store-grid wide minmax columns
- semantic product cards/links
- any 100vw
- long unbroken URLs/text

Fix patterns:
- min-width: 0 on grid children
- max-width: 100%
- overflow-wrap: anywhere for URL-like text
- avoid width: 100vw unless justified
- fixed elements use width: min(calc(100% - Xpx), max)

Acceptance:
- No horizontal scroll on mobile.
- No horizontal scroll on desktop.
- debugOverflow=1 reports no offender after hydration.

============================================================
G. DEBUG VITALS MODE
============================================================

Add debugVitals only as verification, not as the main fix.

Enable with:
/store?debugVitals=1

Log:
- LCP element tag/id/class/currentSrc/text snippet
- paint entries
- CLS sources
- load timing

Acceptance:
- Confirms whether LCP candidate is initial featured image or another element.
- Normal page has no console logs.

============================================================
H. CLEANUP: SEMANTIC TEMPLATES ONLY
============================================================

Add templates:
- store-semantic-empty-template
- store-semantic-tag-template

Replace:
- document.createElement('p') for semantic empty UI
- document.createElement('span') for semantic tag UI

with cloneTemplate().

Acceptance:
- Dynamic UI structure remains template-based.
- JS remains behavior/data-binding/state only.

============================================================
I. CLEANUP: CSS FORMATTING
============================================================

Fix indentation:

.store-contact__inner {
  display: grid;
  justify-items: center;
  gap: 14px;
  max-width: 60ch;
  text-align: center;
  align-items: end;
}

Acceptance:
- No visual change.
- CSS formatting is clean.

============================================================
J. QA UPDATES
============================================================

Update qa/store-artifact-smoke.sh.

Add checks:
- STORE_LCP_PRODUCT exists
- LCP image preload exists with rel="preload" as="image" fetchpriority="high"
- initial HTML contains data-store-initial-lcp-card or equivalent first LCP image card
- initial LCP image has loading="eager"
- initial LCP image has fetchpriority="high"
- rendered image priority logic does not set first visible image to fetchPriority low
- if fetchPriority low exists, ensure it is not applied to index 0 or first viewport
- data-store-feed-initial-url exists if two-stage feed is retained
- debugVitals is gated behind debugVitals=1
- debugOverflow is gated behind debugOverflow=1
- html/body overflow-x guard exists
- semantic empty/tag templates exist
- no document.createElement('p') for semantic empty UI
- no document.createElement('span') for semantic tag UI

Keep existing checks:
- Store dock href remains /store
- i18n hooks remain
- semantic sections remain
- ItemList JSON-LD target remains
- hidden sheets use hidden/aria-hidden/inert
- WhatsApp href uses https://wa.me/
- no #home regression
- no innerHTML UI rendering
- no insertAdjacentHTML
- no JS inline visual styling

============================================================
K. MANUAL TESTS
============================================================

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker
git diff --check

Runtime:
- /store
- /store?debugVitals=1
- /store?debugOverflow=1
- /store?item=neutral-linen-overshirt
- invalid item slug fallback

Lighthouse after deploy:
Mobile:
- LCP request discovery should pass:
  - lazy load not applied
  - fetchpriority=high applied
  - request discoverable in initial document
- LCP < 2.5–3s target
- CLS remains < 0.1
- FCP/SI remain good

Desktop:
- FCP/SI/LCP improve
- no horizontal overflow

Final acceptance:
- LCP image is discoverable from initial HTML.
- LCP image gets fetchpriority high.
- Feed/JS no longer delays LCP image request.
- No unnecessary horizontal scroll.
- HTML/CSS/JS separation remains intact.