TASK: Refactor /store rendering architecture so HTML templates live in <body>, CSS owns all visual styling, and JavaScript only handles behavior/state/data binding.

Context:
The /store surface already has the final Store contract:
- Route: /store
- Dock: Store / Contact / Discover / Saved / More
- Blog/Home inside More
- Preview top sheet
- Discovery/Saved/More bottom sheets
- Saved via localStorage
- Copy Links
- Carousel dots
- Filter tray
- Hidden-state accessibility contract

This task is an engineering hygiene refactor.

Do NOT change:
- Worker route mapping
- sw.js
- canonical /store
- feed label architecture
- dock vocabulary
- visual design intentionally
- preview behavior intentionally
- carousel behavior intentionally
- Saved behavior intentionally
- Discovery behavior intentionally
- marketplace CTA hierarchy
- copy/microcopy unless required by hook changes

Goal:
Move all UI markup skeletons into <body> using <template>.
Move all visual styling into CSS.
Make JavaScript behavior-only:
- clone templates
- fill text/src/href/alt/aria
- toggle data attributes/classes
- manage state/events
- never build UI using HTML strings
- never inject CSS or own visual styling directly

====================================================================
A. ARCHITECTURAL RULES
====================================================================

Final separation of concerns:

1. HTML / body:
- static shell markup
- dock
- filter tray
- preview sheet
- discovery sheet
- saved sheet
- more sheet
- toast containers
- all reusable <template> skeletons

2. CSS:
- all layout
- all spacing
- all colors
- all typography
- all motion
- all responsive rules
- all hidden/open/active visual states
- all icon fill visual states

3. JavaScript:
- fetch/parse feed data
- clone <template>
- bind content into cloned nodes
- set safe attributes
- manage state
- attach event handlers
- toggle class/data/aria/hidden/inert
- no UI HTML strings
- no inline visual styles
- no injected CSS

Acceptance:
- A reviewer can inspect <body> and see all structural UI templates.
- A reviewer can inspect <style> and see all styling/motion logic.
- <script> contains no UI string templates and no design styling.

====================================================================
B. ADD BODY TEMPLATES
====================================================================

Add these templates inside <body>, before the main <script>.

Use stable IDs and data hooks.

Required templates:

1. Product card:
<template id="store-card-template">
  <article class="store-card" data-store-card>
    <button class="store-card__button" type="button" data-store-open-preview aria-label="">
      <div class="store-card__media">
        <img loading="lazy" decoding="async" src="" alt="" draggable="false" />
        <span class="store-card__shade" aria-hidden="true"></span>
        <div class="store-card__content">
          <span class="store-card__badge" data-store-card-badge></span>
          <span class="store-card__price" data-store-card-price></span>
          <h2 class="store-card__title" data-store-card-title></h2>
          <span class="store-card__dots" data-store-card-dots aria-hidden="true" hidden></span>
        </div>
      </div>
    </button>
  </article>
</template>

2. Card dot:
<template id="store-card-dot-template">
  <span class="store-card__dot"></span>
</template>

3. Preview slide:
<template id="store-preview-slide-template">
  <div class="store-preview__slide">
    <img src="" alt="" draggable="false" />
  </div>
</template>

4. Preview dot:
<template id="store-preview-dot-template">
  <button class="store-preview__dot" type="button" aria-label="" aria-pressed="false" data-store-preview-dot></button>
</template>

5. Discovery/result row:
<template id="store-result-row-template">
  <button class="store-result-row" type="button" data-store-result-index>
    <span class="store-result-row__thumb">
      <img src="" alt="" loading="lazy" decoding="async" draggable="false" />
    </span>
    <span class="store-result-row__body">
      <span class="store-result-row__title" data-store-result-title></span>
      <span class="store-result-row__meta" data-store-result-meta></span>
    </span>
    <span class="gg-icon" aria-hidden="true">north_east</span>
  </button>
</template>

6. Saved row:
<template id="store-saved-row-template">
  <div class="store-result-row-group" data-store-saved-row>
    <button class="store-result-row" type="button" data-store-result-index>
      <span class="store-result-row__thumb">
        <img src="" alt="" loading="lazy" decoding="async" draggable="false" />
      </span>
      <span class="store-result-row__body">
        <span class="store-result-row__title" data-store-result-title></span>
        <span class="store-result-row__meta" data-store-result-meta></span>
      </span>
    </button>
    <button class="store-result-row__remove" type="button" data-store-remove-saved aria-label="">
      <span class="gg-icon" aria-hidden="true">bookmark_remove</span>
    </button>
  </div>
</template>

7. Empty row:
<template id="store-empty-row-template">
  <p class="store-result-row__empty" data-store-empty-row></p>
</template>

8. Notes item:
<template id="store-preview-note-template">
  <li data-store-preview-note></li>
</template>

Do not use <template> for static shell already present unless useful.
Do not create duplicate IDs inside templates except template IDs themselves.

Acceptance:
- All repeatable/dynamic UI structures have body templates.
- No dynamic UI structure exists only as a JS string.

====================================================================
C. REPLACE HTML STRING RENDERERS
====================================================================

Find and refactor all functions that build UI via string HTML.

Likely targets:
- renderCard()
- renderCards()
- renderDiscoveryResults()
- renderSavedResults()
- renderPreview carousel slides
- renderPreview dots
- render notes list
- empty result rows

Remove patterns like:
- grid.innerHTML = ...
- container.innerHTML = ...
- return '<article ...>'
- template literals containing HTML markup
- insertAdjacentHTML for UI

Replace with:
- template.content.firstElementChild.cloneNode(true)
- document.createDocumentFragment()
- node.querySelector(...)
- textContent
- setAttribute
- classList.toggle
- hidden
- replaceChildren(fragment)

Add helper:

function cloneTemplate(id) {
  var template = document.getElementById(id);
  if (!template || !template.content || !template.content.firstElementChild) {
    throw new Error('Missing template: ' + id);
  }
  return template.content.firstElementChild.cloneNode(true);
}

Acceptance:
- `grep -n "innerHTML\\|insertAdjacentHTML\\|outerHTML" store.html` has no UI-rendering hits.
- If DOMParser uses `.innerHTML` internally because browser parses feed content, do not use it to insert UI.
- No UI markup is produced through template string HTML.

====================================================================
D. SAFE DATA BINDING RULES
====================================================================

When filling template nodes:

Use:
- textContent for titles, category, summary, price, meta, notes
- img.src for trusted image URL after normalization
- img.alt for product title
- a.href for marketplace links after validation
- aria-label for accessible labels
- hidden for visibility
- dataset for indexes/IDs
- classList.toggle for active state

Do not use:
- innerHTML for product title/summary/notes
- raw feed HTML inserted into DOM
- unvalidated hrefs
- inline event handlers

Product card example:

function renderCardNode(item, index) {
  var node = cloneTemplate('store-card-template');
  var button = node.querySelector('[data-store-open-preview]');
  var img = node.querySelector('img');
  var badge = node.querySelector('[data-store-card-badge]');
  var price = node.querySelector('[data-store-card-price]');
  var title = node.querySelector('[data-store-card-title]');
  var dots = node.querySelector('[data-store-card-dots]');

  node.dataset.storeCardIndex = String(index);
  button.dataset.storeOpenPreview = String(index);
  button.setAttribute('aria-label', 'Preview ' + item.title);

  img.src = item.images[0] || PLACEHOLDER_IMAGE;
  img.alt = item.title;

  badge.textContent = item.badge || item.category || 'Curated';
  price.textContent = item.priceText || 'Rp—';
  title.textContent = item.title || 'Untitled product';

  renderCardDots(dots, item.images.length);

  return node;
}

Acceptance:
- Product content is bound safely.
- Feed HTML is never injected into live page.

====================================================================
E. CSS MUST OWN VISUAL DESIGN
====================================================================

Search and remove visual style manipulation from JavaScript.

Forbidden JS patterns:
- element.style.transform = ...
- element.style.opacity = ...
- element.style.height = ...
- element.style.display = ...
- element.style.pointerEvents = ...
- document.createElement('style')
- style.textContent = ...
- CSS string injection
- setting CSS variables from JS for ordinary state, unless strictly required for measured values

Allowed JS state toggles:
- node.hidden = true/false
- node.setAttribute('aria-hidden', ...)
- node.toggleAttribute('inert', ...)
- node.setAttribute('data-gg-state', 'open/closed')
- node.setAttribute('data-store-filter-state', 'expanded/micro')
- classList.add/remove/toggle('is-active')
- aria-pressed true/false
- aria-expanded true/false
- data-copy-state idle/copied/failed

If the code currently sets style for drag transform:
- Prefer CSS class/data-state transitions.
- During active drag, if absolutely necessary, setting a CSS variable like `--store-drag-offset` is acceptable only for real-time pointer feedback.
- But default visual states must be defined in CSS.

Preferred CSS pattern:
[data-gg-state='open'] .gg-sheet__panel { transform: ... }
[data-store-filter-state='expanded'] .store-filter-outline__panel { display: block; }
.store-preview__save[aria-pressed='true'] .gg-icon { font-variation-settings: ...; }

Acceptance:
- JS does not own visual design.
- Visual behavior is inspectable in CSS.
- JS only changes state attributes/classes.

====================================================================
F. STYLE HOOKS: DATA ATTRIBUTES OVER JS STYLES
====================================================================

If a visual state is needed, create a semantic state hook.

Examples:
- data-gg-state="open|closed"
- data-store-filter-state="micro|expanded"
- data-copy-state="idle|copied|failed"
- data-store-carousel-state="idle|dragging|settling" if needed
- aria-pressed="true|false" for toggle buttons

CSS responds to these states.

Do not create classes like random generated names.
Do not toggle multiple redundant states unless needed.

Acceptance:
- State naming is semantic and stable.
- CSS reacts to state hooks.
- JS remains behavior-only.

====================================================================
G. EVENT HANDLING AFTER TEMPLATE CLONING
====================================================================

Because dynamic nodes are cloned, use one of these approaches:

Preferred:
Event delegation on stable containers.

Examples:
- grid.addEventListener('click', ...)
- discoveryResults.addEventListener('click', ...)
- savedResults.addEventListener('click', ...)
- previewDots.addEventListener('click', ...)

Use dataset attributes to find index.

Avoid attaching many individual listeners to every cloned card unless necessary.

Acceptance:
- New rendered products work after filtering/searching/load-more.
- Preview opens from card click.
- Discovery result opens preview.
- Saved row opens preview.
- Remove saved works.
- Dot click works.
- Re-rendering does not leak duplicated listeners.

====================================================================
H. TEMPLATE-BASED PREVIEW CAROUSEL
====================================================================

Preview carousel must be rendered from templates.

Use:
- store-preview-slide-template
- store-preview-dot-template

Requirements:
- Reset carousel to slide 0 when product changes.
- Dots hidden for one image.
- Dots render with buttons for multi-image.
- Dot click scrolls carousel.
- Active dot updates through state/class/aria-pressed.
- No slide HTML strings.

Acceptance:
- `preview.carousel.replaceChildren(fragment)` uses template clones.
- `preview.dots.replaceChildren(fragment)` uses template clones.
- No `preview.carousel.innerHTML = ...`.

====================================================================
I. TEMPLATE-BASED NOTES
====================================================================

Render product notes with `store-preview-note-template`.

Rules:
- If no notes, hide notes section.
- If notes exist, clone li template per note.
- Use textContent only.
- No notes innerHTML.

Acceptance:
- Notes are safe and template-based.

====================================================================
J. TEMPLATE-BASED DISCOVERY AND SAVED RESULTS
====================================================================

Discovery:
- Use `store-result-row-template`.
- Empty state uses `store-empty-row-template`.

Saved:
- Use `store-saved-row-template`.
- Remove button has `bookmark_remove`.
- Empty state uses `store-empty-row-template`.

Acceptance:
- Discovery results are template-based.
- Saved rows are template-based.
- Empty rows are template-based.
- No result-row HTML strings remain.

====================================================================
K. TOASTS AND FILTER TRAY STILL WORK
====================================================================

Preserve existing polish:
- single-line filter tray
- dynamic filter icon
- no duplicate store-filter-current ID
- contextual inline toast placement
- preview toast near secondary actions
- saved toast inside saved sheet
- copy/save/remove feedback
- hidden-state accessibility

Do not regress:
- WhatsApp href
- disclosure separator
- empty state
- Save/Copy
- Saved
- Discovery
- carousel dots
- keyboard support
- drag close

Acceptance:
- All behavior remains visually same after refactor.

====================================================================
L. QA / GREP ASSERTIONS
====================================================================

Update qa/store-artifact-smoke.sh to enforce this architecture.

Add checks:
- templates exist:
  - store-card-template
  - store-card-dot-template
  - store-preview-slide-template
  - store-preview-dot-template
  - store-result-row-template
  - store-saved-row-template
  - store-empty-row-template
  - store-preview-note-template
- no duplicate id="store-filter-current"
- no `store-card__quick`
- no `store-read-article`
- no visible `.store-preview__close`
- no `grid.innerHTML`
- no `discoveryResults.innerHTML`
- no `savedResults.innerHTML`
- no `preview.carousel.innerHTML`
- no `preview.dots.innerHTML`
- no `notesList.innerHTML`
- no `insertAdjacentHTML`
- no `document.createElement('style')`
- no `.style.transform`
- no `.style.opacity`
- no `.style.height`
- no `.style.display`
- no `.style.pointerEvents`
- allow DOMParser for parsing feed content if present

Important:
Do not fail on string text that is not UI markup.
Do not fail on legitimate `<script type="application/ld+json">`.

Acceptance:
- Artifact smoke catches future regressions back to string-rendering.

====================================================================
M. MANUAL TEST CHECKLIST AFTER REFACTOR
====================================================================

After implementation, verify manually:

1. Store grid renders products.
2. Product cards open preview.
3. Carousel slides and dots work.
4. Card dots show only for multi-image products.
5. Save toggles Save/Saved.
6. Saved sheet lists saved products.
7. Remove saved works.
8. Copy links works and toast appears.
9. Discovery search returns rows.
10. Discovery result opens preview.
11. Filter tray changes grid.
12. WhatsApp link unchanged.
13. More sheet links unchanged.
14. Keyboard Escape closes sheets.
15. Tab trap still works.
16. Reduced motion still works.

====================================================================
N. RUN COMMANDS
====================================================================

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker
git diff --check

Do not run live smoke as pre-deploy blocker.

====================================================================
FINAL ACCEPTANCE
====================================================================

Task is complete only if:
- All dynamic UI rendering uses <template> clones.
- <body> contains all structural hooks/templates.
- JavaScript does not build UI through HTML strings.
- JavaScript does not own styling.
- CSS owns all visual and motion states.
- JS only handles behavior/state/data binding.
- No visual or behavioral regression.
- Artifact smoke passes.