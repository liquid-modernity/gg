TASK: Refine Store preview micro-interactions: sticky hero, moving content overlay, carousel dots, and Copy Links action.

Context:
The /store surface is already deployed with final dock contract:
Store / Contact / Discover / Saved / More.

Do NOT change route, Worker, service worker, canonical, feed label, or dock vocabulary.

This task only refines the product preview sheet interaction and carousel behavior.

Files likely involved:
- store.html
- qa/store-artifact-smoke.sh
- qa/live-smoke-worker.sh if selector checks need to be updated

Final interaction goal:
The preview top sheet should feel more native/app-like:
- hero image stays/pins visually during early scroll
- category/title/meta overlay moves with the content layer, not permanently fixed to the image
- carousel dots appear at the top-center of the hero
- carousel behavior feels controlled, manual, and snap-based
- Save and Copy Links appear as secondary actions under marketplace CTAs
- Copy Links uses compact icon button beside the dominant Save button

Do not reintroduce:
- Read the article CTA
- visible close button
- topbar
- Blog dock item
- store-card__quick
- autoplay carousel

REQUIREMENTS

1. Preview hero sticky/pinned behavior

Current problem:
When the preview sheet scrolls, the hero image scrolls away too quickly. This makes the preview feel like a normal web page.

Change behavior:
- Hero image should visually stay/pin during the initial scroll phase.
- Body/content layer should scroll/move over or after the hero.
- Category/title/meta overlay should NOT stay permanently pinned with the photo.
- Category/title/meta should move with the content layer.

Desired mental model:
- Image = pinned visual stage.
- Overlay text + summary + price + CTA + notes = moving content layer.

Implementation guidance:
- Keep the preview top sheet as a top sheet.
- Make the image/carousel layer sticky or visually pinned inside the preview panel.
- Move overlay category/title/meta out of the permanently pinned image layer if needed.
- Place overlay text in a content overlay/card layer that scrolls with the body.
- Preserve current visual hierarchy: category, title, meta over the hero area at initial state.

Acceptance:
- On initial open, category/title/meta appear over the hero.
- On scroll, the image stays visually stable during the early scroll.
- Category/title/meta move upward with the body/content layer.
- The title does not remain stuck on the image forever.
- No visible close button is reintroduced.

2. Preview carousel dots

Add functional dots to the preview hero.

Rules:
- If product has only 1 image: hide dots.
- If product has 2+ images: show small dots at top-center of hero.
- Dots must reflect the number of images.
- Active dot must follow the active carousel slide.
- Tapping a dot moves to the corresponding slide.

Visual:
- Position: top-center of hero.
- Tiny and quiet.
- No arrows.
- No autoplay.

Suggested CSS:
- dot size: 4px or 5px
- gap: around 5px
- inactive opacity: around .35–.40
- active opacity: around .85–.95
- active dot may be slightly wider, but keep it subtle

Possible markup:
<div class="store-preview__dots" id="store-preview-dots" aria-label="Product image position"></div>

Each dot:
<button
  class="store-preview__dot"
  type="button"
  aria-label="Show image 1"
  aria-pressed="true"
  data-store-preview-dot="0">
</button>

Acceptance:
- Dots appear in preview only for products with multiple images.
- Dots update when user swipes carousel.
- Dots update when user taps a dot.
- Dots reset correctly when opening a different product.

3. Store card dots consistency

Keep or restore store-card__dots on grid cards if available.

Rules:
- Card dots are visual indicators only unless current code already supports card carousel.
- Show dots only if product has 2+ images.
- Do not show dots for 1-image products.
- Do not add arrows or autoplay.
- Card dots and preview dots must use the same image count source.

Acceptance:
- Multi-image products show dots on card and preview.
- Single-image products do not show dots.
- Card dots do not create visual clutter.

4. Carousel behavior refinement

Current problem:
Preview carousel sliding feels out of control / not native.

Required behavior:
- Manual only.
- No autoplay.
- Snap one image at a time.
- Horizontal swipe must feel stable.
- Vertical scroll should not be hijacked by horizontal carousel.
- Active slide index must be calculated reliably.
- Dot state must sync with scroll position.
- Dot tap must use smooth scroll to the selected slide.
- Reset carousel to slide 0 when opening a new product.

CSS guidance:
.store-preview__carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.store-preview__slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
}

.store-preview__slide img {
  user-select: none;
  -webkit-user-drag: none;
}

JS guidance:
- Track activePreviewImageIndex in state.
- On carousel scroll, use requestAnimationFrame or debounce to calculate:
  Math.round(carousel.scrollLeft / carousel.clientWidth)
- Clamp index between 0 and images.length - 1.
- Update dots only when index changes.
- On dot click:
  carousel.scrollTo({
    left: index * carousel.clientWidth,
    behavior: 'smooth'
  })
- On preview open:
  set active index to 0
  scroll carousel to left 0 without animation

Acceptance:
- Swipe does not overshoot multiple slides too easily.
- Slide snaps cleanly.
- Dots always match the current slide.
- Carousel does not fight vertical scrolling.
- No autoplay.

5. Add Copy Links secondary action

Add a compact Copy Links action beside Save inside preview.

Current desired layout:
Marketplace buttons remain primary:
Shopee | TikTok | Tokopedia

Below marketplace row:
[ Save                              ] [ copy icon ]

Composition:
- Save button = dominant, flexible width
- Copy button = compact icon-only, 44px minimum width
- Ratio should behave like 1fr / 44px, not 90/10

Suggested markup:
<div class="store-preview__secondary-actions">
  <button class="store-button store-preview__save" id="store-save" type="button">
    <span class="gg-icon" aria-hidden="true">bookmark</span>
    <span>Save</span>
  </button>

  <button class="store-button store-preview__copy" id="store-copy-links" type="button" aria-label="Copy product links">
    <span class="gg-icon" aria-hidden="true">content_copy</span>
  </button>
</div>

Suggested CSS:
.store-preview__secondary-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: 8px;
}

.store-preview__copy {
  padding-inline: 0;
  min-width: 44px;
}

Copy format:
When user clicks Copy, write this plain text to clipboard:

Product Name
Curated via Yellow Cart · PakRPP

Shopee:
https://...

Tokopedia:
https://...

TikTok:
https://...

Rules:
- Include only marketplace links that exist.
- Do not include empty marketplace lines.
- Use readable human format, not JSON.
- After successful copy, temporarily change aria-label or visible feedback to “Copied”.
- After 1–2 seconds, revert to “Copy product links”.
- If navigator.clipboard is unavailable, fallback to a temporary textarea copy method.

Acceptance:
- Copy button copies clean formatted product links.
- Missing marketplace links are omitted.
- Save remains dominant.
- Copy remains secondary.
- Marketplace CTAs remain primary.
- No extra Share button is added.

6. Saved behavior must remain intact

Do not break existing Saved localStorage feature.

Acceptance:
- Save still stores product in localStorage.
- Saved dock button still opens saved products.
- Saved products can still reopen preview.
- Copy Links does not interfere with Save.

7. Update embedded Store contract / QA matrix

Update STORE_SURFACE_CONTRACT and STORE_QA_MATRIX in store.html.

They should mention:
- preview hero pinned/sticky during initial scroll
- overlay text moves with content layer
- preview dots sync with carousel
- carousel is manual snap-based, no autoplay
- Save and Copy Links are secondary actions
- marketplace CTAs are primary

They should NOT mention:
- Read the article
- visible close button
- Blog dock item

8. Update artifact smoke QA if needed

Update qa/store-artifact-smoke.sh to check:
- no `store-read-article`
- no visible `.store-preview__close`
- preview footer handle exists
- preview dots container exists
- copy links button exists
- secondary action row exists
- marketplace links still have target="_blank"
- marketplace rel still includes sponsored nofollow noopener noreferrer
- dock contract remains Store / Contact / Discover / Saved / More

Do not make live smoke stricter than artifact smoke unless the selectors are definitely deployed.

9. Run verification

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker

Do not run live smoke as a pre-deploy blocker.

Acceptance criteria:
- /store preview feels more native and controlled.
- Hero image stays/pins visually during early scroll.
- Overlay text moves with content layer.
- Preview dots are top-center and synced.
- Carousel is manual, snap-based, no autoplay.
- Save and Copy links appear in 1fr / 44px layout.
- Copy Links copies clean human-readable marketplace links.
- No Read the article.
- No visible close button.
- Final dock remains Store / Contact / Discover / Saved / More.
- Blog/Home remain inside More only.