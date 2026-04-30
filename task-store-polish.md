TASK: Polish /store to 9+/10 interaction quality: microcopy, accessibility state, sticky preview hero, native carousel, Copy Links, and interactive icon states.

Context:
The /store surface already uses the final Store contract:
- Route: /store
- Canonical: https://www.pakrpp.com/store
- Dock: Store / Contact / Discover / Saved / More
- Blog and Home live inside More
- Products come from Blogger label Store
- Legacy yellowcart/yellowcard only exists as compatibility fallback

Do NOT change:
- Worker route mapping
- sw.js
- canonical route
- feed label architecture
- Store dock vocabulary
- legacy redirects
- /landing or / behavior
- Blog back into dock
- Read the article CTA
- visible close buttons
- autoplay carousel

Files likely involved:
- store.html
- qa/store-artifact-smoke.sh
- qa/live-smoke-worker.sh only if selector checks must be aligned
- package.json only if a new local QA script is strictly needed

Primary goal:
Make /store feel native, premium, mobile-first, touch/gesture centric, keyboard/mouse operable, and accessibility-correct.

Apple-HIG style principle:
Motion and interaction must clarify hierarchy and orientation. Do not add decorative motion. Do not add noisy icons. Every motion and icon change must communicate state or action.

====================================================================
A. MICROCOPY PATCHES
====================================================================

1. WhatsApp contact URL

Find the Store contact CTA.

If current href is relative or incomplete, e.g.:
href="wa.me/628..."

Replace with full HTTPS:
href="https://wa.me/628910111213?text=Halo%20PakRPP%2C%20saya%20ingin%20bertanya%20tentang%20Yellow%20Cart."

Rules:
- Use full https://wa.me/...
- Number must be international format without +, spaces, brackets, or hyphens.
- target="_blank"
- rel="noopener noreferrer"

Expected markup:
<a
  class="store-button store-button--primary"
  href="https://wa.me/628910111213?text=Halo%20PakRPP%2C%20saya%20ingin%20bertanya%20tentang%20Yellow%20Cart."
  target="_blank"
  rel="noopener noreferrer"
  data-copy="contactCta"
>
  WhatsApp
</a>

2. Disclosure separator

Current copy may render like:
Affiliate links may be used Harga dan ketersediaan mengikuti marketplace.

Replace with a cleaner separator:
Affiliate links may be used · Harga dan ketersediaan mengikuti marketplace.

Implementation:
- Either combine into one string
- Or keep two spans but insert a visible separator between them
- Do not let the phrase appear without punctuation/separator

Preferred:
<span data-copy="affiliateDisclosure">Affiliate links may be used · Harga dan ketersediaan mengikuti marketplace.</span>

Update COPY object:
id:
affiliateDisclosure: "Affiliate links may be used · Harga dan ketersediaan mengikuti marketplace."
en:
affiliateDisclosure: "Affiliate links may be used · Prices and availability follow the marketplace."

3. Empty state microcopy

Replace debugging-ish empty state:
Produk belum tersedia.
Coba refresh katalog atau buka arsip label Store.

With:
Belum ada produk yang ditampilkan.
Koleksi Yellow Cart sedang dikurasi.

Button:
Lihat arsip Store

English:
No products are displayed yet.
Yellow Cart is still being curated.

Button:
View Store archive

Do not mention “refresh katalog” in public empty state.

4. Contact copy

Make contact copy more direct.

ID:
Untuk kolaborasi brand, pengajuan produk, koreksi data, atau pertanyaan affiliate, hubungi PakRPP melalui WhatsApp.

EN:
For brand collaborations, product submissions, data corrections, or affiliate questions, contact PakRPP through WhatsApp.

CTA label:
WhatsApp

====================================================================
B. ACCESSIBILITY HIDDEN-STATE CONTRACT
====================================================================

All sheets must be accessibility-correct when closed.

Sheets include:
- preview sheet
- discovery sheet
- saved sheet
- more sheet
- any filter tray expansion if treated as modal/panel

Closed state must have:
- hidden attribute
- aria-hidden="true"
- inert
- data-gg-state="closed"

Open state must have:
- hidden removed
- aria-hidden="false"
- inert removed
- data-gg-state="open"

Body state:
When any sheet is open:
- body[data-gg-panel-active="true"]
- body[data-gg-scroll-lock="true"]
- active dock/filter tray inert or hidden

When all sheets are closed:
- body[data-gg-panel-active="false"]
- body[data-gg-scroll-lock="false"]
- body[data-gg-active-panel=""]

Focus:
- Opening a sheet moves focus into the sheet panel.
- Closing a sheet returns focus to the triggering element.
- Escape closes the active sheet.
- Tab and Shift+Tab are trapped inside the active sheet.
- Do not leave focus in hidden sheet content.

Acceptance:
- Hidden sheets do not enter accessibility tree.
- Keyboard users cannot tab into closed sheets.
- Focus return works after preview, discovery, saved, and more.

====================================================================
C. CLOSE BUTTON VISUAL RULE
====================================================================

Do not show visual close buttons.

Rules:
- Top preview sheet uses footer handle, scrim click, Escape, and drag-up close.
- Bottom sheets use header handle, scrim click, Escape, and drag-down close.
- If a close control is kept for screen readers/keyboard fallback, make it visually hidden using .gg-visually-hidden.
- Do not keep visible .store-preview__close.
- Do not reintroduce visible X icons.

Acceptance:
- No visible close button in preview.
- No visible close button in Discovery/Saved/More.
- Screen reader/keyboard close fallback may exist but must be visually hidden.

====================================================================
D. MOTION CONTRACT
====================================================================

Create or document a Store motion contract in store.html.

Suggested:
var STORE_MOTION_CONTRACT = {
  sheetOpen: '220-260ms transform/opacity',
  sheetClose: '170-200ms transform/opacity',
  press: '80-100ms scale/opacity',
  filterTray: '160-220ms transform/opacity',
  toast: '120-180ms opacity/translate',
  carousel: 'manual snap, no autoplay',
  reducedMotion: 'disable non-essential smooth motion'
};

Rules:
- Use transform and opacity where possible.
- Avoid animating height if it causes jank.
- Motion must communicate direction:
  - top preview opens down from top
  - bottom sheets rise from bottom
  - filter tray attaches to dock, drops to viewport bottom when dock hidden
- Respect prefers-reduced-motion:
  - no animated sheet travel
  - no smooth carousel scroll
  - no excessive sticky/parallax illusion

Acceptance:
- Motion feels consistent and not noisy.
- Reduced motion mode still works without animation dependency.

====================================================================
E. TOUCH AND GESTURE CONTRACT
====================================================================

Touch targets:
- All real buttons must be at least 44px hit target.
- Copy icon button must be 44px min width/height.
- Dots may look 4–5px but tap target must be larger.

Gestures:
Preview top sheet:
- drag upward on footer handle closes preview
- tap scrim closes preview
- vertical scroll moves content layer
- hero image stays/pins during early scroll

Bottom utility sheets:
- drag downward on header handle closes sheet
- tap scrim closes sheet

Carousel:
- horizontal swipe changes image
- vertical scroll must not be hijacked by carousel
- manual only
- no autoplay
- one-slide snap behavior

Implementation guidance:
- Add pointer/touch handling to sheet handles if not already present.
- Use a threshold around 70–100px before closing by drag.
- Do not close sheet on tiny accidental drag.
- Use pointer capture where appropriate.
- Do not break normal scroll inside sheet.

Acceptance:
- Sheet close by drag feels intentional.
- Carousel swipe does not fight vertical scroll.
- Tiny accidental moves do not close sheets.

====================================================================
F. PREVIEW HERO / CONTENT LAYER BEHAVIOR
====================================================================

Goal:
Hero image stays/pins visually during early scroll.
Category/title/meta overlay moves with content layer, not permanently locked to photo.

Mental model:
- Hero image = pinned visual stage
- Overlay text + body content = moving content layer

Requirements:
- On initial preview open, category/title/meta appear visually over hero image.
- On scroll, category/title/meta move upward with summary/price/CTA/notes.
- Hero image remains visually stable during early scroll.
- Title must not remain permanently stuck to image.
- Do not make photo fixed forever until the end of content.
- Do not create unreadable overlay collision.

Suggested implementation:
- Keep carousel/hero layer sticky near top inside preview panel.
- Move overlay text into a content overlay/card layer that starts overlapping the hero.
- Body content should have a panel/card feel with enough contrast.
- Use top margin/negative overlap carefully.
- Keep initial visual close to current design.

Acceptance:
- Initial state still looks like hero overlay.
- Scrolling feels more native/app-like.
- Text moves; image visually holds.
- No layout jump.

====================================================================
G. PREVIEW CAROUSEL DOTS
====================================================================

Add functional dots to preview hero.

Rules:
- If product has 1 image: hide dots.
- If product has 2+ images: show dots.
- Dots position: top-center of hero.
- Dots are small and quiet.
- Dots sync with active carousel slide.
- Tap dot moves to selected slide.
- Dots reset when opening a new product.

Visual:
- visible dot: 4–5px
- gap: 5px
- inactive opacity: .35–.40
- active opacity: .85–.95
- hit target: at least 24px per dot button if possible
- no arrows
- no autoplay

Markup suggestion:
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
- Swipe carousel updates active dot.
- Dot tap updates carousel and active state.
- Dot count matches product image count.
- Hidden for single-image products.

====================================================================
H. STORE CARD DOTS CONSISTENCY
====================================================================

Keep card dots if present, but make them disciplined.

Rules:
- Show card dots only for multi-image products.
- Hide card dots for single-image products.
- Card dots are visual indicators only unless card carousel is explicitly supported.
- Card dots and preview dots must use same image count source.
- Do not add arrows or autoplay.

Acceptance:
- Multi-image products show subtle dots on grid card.
- Single-image products do not show dots.
- Card remains visually calm.

====================================================================
I. CAROUSEL NATIVE-FEEL REFINEMENT
====================================================================

Current problem:
Carousel can feel out of control.

Required behavior:
- Manual only.
- No autoplay.
- Snap one image at a time.
- Horizontal swipe feels stable.
- Vertical scroll does not accidentally slide carousel.
- Active slide index calculated reliably.
- Dot state synced with scroll position.
- Dot tap smooth-scrolls to selected slide unless prefers-reduced-motion.
- Reset to slide 0 when opening a new product.
- Settle correction after scroll if carousel stops between slides.

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
- On carousel scroll:
  - use requestAnimationFrame or debounce
  - activeIndex = Math.round(scrollLeft / carousel.clientWidth)
  - clamp index
  - update dots only when index changes
- On dot click:
  carousel.scrollTo({
    left: index * carousel.clientWidth,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
- On preview open:
  active index = 0
  carousel.scrollLeft = 0
- On scroll end:
  settle to nearest slide
  use native `scrollend` if available
  fallback debounce around 120ms

Acceptance:
- No overshoot feeling.
- No autoplay.
- Dots always match current image.
- Vertical scroll remains comfortable.

====================================================================
J. SAVE / COPY SECONDARY ACTION ROW
====================================================================

Marketplace buttons remain primary:
Shopee | TikTok | Tokopedia

Below marketplace row add secondary actions:
[ Save                              ] [ copy icon ]

Layout:
- Save = dominant flexible button
- Copy = compact icon-only 44px button
- Grid: minmax(0, 1fr) 44px
- Gap: 8px

Suggested markup:
<div class="store-preview__secondary-actions">
  <button
    class="store-button store-preview__save"
    id="store-save"
    type="button"
    aria-pressed="false">
    <span class="gg-icon" aria-hidden="true">bookmark_add</span>
    <span data-store-save-label>Save</span>
  </button>

  <button
    class="store-button store-preview__copy"
    id="store-copy-links"
    type="button"
    aria-label="Copy product links">
    <span class="gg-icon" aria-hidden="true">content_copy</span>
  </button>
</div>

CSS:
.store-preview__secondary-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: 8px;
}

.store-preview__copy {
  min-width: 44px;
  min-height: 44px;
  padding-inline: 0;
}

Acceptance:
- Marketplace buttons visually remain primary.
- Save/Copy feel secondary.
- Copy does not compete with marketplace CTAs.

====================================================================
K. COPY LINKS ACTION
====================================================================

Copy format must be human-readable, not JSON.

Format:
Product Name
Curated via Yellow Cart · PakRPP

Shopee:
https://...

Tokopedia:
https://...

TikTok:
https://...

Rules:
- Include only existing links.
- Omit missing marketplace links.
- Include product title.
- Include Yellow Cart attribution line.
- Do not include empty marketplace labels.
- Do not include JSON quotes.
- Use navigator.clipboard.writeText when available.
- Fallback to temporary textarea + execCommand('copy') if needed.
- On success:
  - icon changes from content_copy to check
  - aria-label becomes "Copied"
  - show small toast "Copied links"
  - revert after 1.5–2 seconds
- On failure:
  - show small toast "Copy failed"
  - do not silently fail

Acceptance:
- Copy links works on modern browsers.
- Fallback works where possible.
- User gets feedback.

====================================================================
L. SAVE / SAVED / REMOVE INTERACTIVE ICON STATES
====================================================================

Add disciplined interactive icon grammar.

Principle:
Icon changes only when state changes.
Filled icons indicate active state.
Do not animate icons excessively.

Preview Save states:
Unsaved:
- icon: bookmark_add
- FILL: 0
- label: Save
- aria-pressed="false"

Saved:
- icon: bookmark
- FILL: 1
- label: Saved
- aria-pressed="true"

Saved sheet remove action:
- icon: bookmark_remove
- FILL: 0
- aria-label: Remove from Saved

Copy Links:
Idle:
- icon: content_copy
- aria-label: Copy product links

Success:
- icon: check
- aria-label: Copied

Filter tray:
Collapsed:
- filter_list
- keyboard_arrow_up

Expanded:
- filter_list
- keyboard_arrow_down

Discovery dock:
- icon: search
- label: Discover

More dock:
- icon: menu
- label: More

CSS guidance:
Use aria-pressed for filled visual state.

Example:
.store-preview__save[aria-pressed="true"] .gg-icon {
  font-variation-settings:
    'FILL' 1,
    'wght' var(--gg-icon-weight-active),
    'GRAD' var(--gg-icon-grade-active),
    'opsz' 24;
}

Acceptance:
- Save icon changes correctly.
- Copy success icon changes temporarily.
- Remove in Saved sheet uses bookmark_remove.
- Filter tray arrow reflects expanded/collapsed state.
- No random decorative icon churn.

====================================================================
M. TOAST FEEDBACK
====================================================================

Add a quiet toast mechanism inside preview/sheet context.

Use for:
- Saved
- Removed from Saved
- Copied links
- Copy failed

Rules:
- Toast duration: 1.4–1.8s
- Small, calm, non-blocking
- Position near secondary action row or lower preview body
- Not global full-width alert
- aria-live="polite"

Suggested markup:
<div class="store-toast" id="store-toast" role="status" aria-live="polite" hidden></div>

Acceptance:
- Save/copy feedback is visible and accessible.
- No alert().

====================================================================
N. SAVED BEHAVIOR MUST REMAIN INTACT
====================================================================

Do not break Saved.

Required:
- Save stores product by stable product ID, preferably URL/slug.
- Saved dock opens saved products.
- Saved products can reopen preview.
- If product already saved, preview opens with Saved state.
- Clicking Saved again may remove from saved, or removal is available in Saved sheet.
- Saved sheet remove uses bookmark_remove.
- Saved state persists through reload via localStorage.
- Empty Saved state is clear:
  "No saved picks yet."
  "Open a product and tap Save."

Acceptance:
- Saved is not a fake feature.
- Save and Copy do not interfere.

====================================================================
O. DISCOVERY RESULT ROWS TEST
====================================================================

Discovery must be tested with dummy products.

Expected behavior:
- Opening Discover shows search field, quick intents, and result rows.
- Typing "canvas" shows Everyday Canvas Tote.
- Typing "skincare" shows skincare product.
- Filter Fashion limits results to Fashion.
- Quick intent Latest or Featured changes result context if implemented.
- Tapping result opens preview, not a page reload.

If there are fewer products, behavior should still be sane:
- show available products
- no broken empty rows
- status text clear

Acceptance:
- Discovery is a command center, not just a decorative sheet.

====================================================================
P. KEYBOARD AND MOUSE SUPPORT
====================================================================

Keyboard:
- Escape closes active sheet.
- Tab/Shift+Tab trapped inside active sheet.
- Enter/Space activates focused product card/buttons.
- ArrowLeft/ArrowRight changes preview carousel image when preview is active.
- Home/End optionally jumps first/last image in carousel.
- Ctrl/Cmd+K opens Discover if no text input/textarea/contenteditable is active.
- Optional "/" focuses/open Discover only if no text input/textarea/contenteditable is active.

Mouse:
- Hover states remain subtle.
- Wheel vertical scroll must not accidentally slide carousel.
- Clicking dots moves image.
- Clicking scrim closes sheet.

Acceptance:
- Desktop feels intentional, not mobile-only.
- Shortcuts do not interfere while typing.

====================================================================
Q. UPDATE QA / ARTIFACT SMOKE
====================================================================

Update qa/store-artifact-smoke.sh to check as much as reasonably possible without brittle visual assertions:

Must check:
- WhatsApp href uses https://wa.me/
- disclosure contains separator "·" or proper punctuation
- no `.store-topbar`
- no `.store-card__quick`
- no visible `.store-preview__close`
- no `store-read-article`
- preview footer handle exists
- preview dots container exists
- copy links button exists
- secondary action row exists
- save button exists with aria-pressed
- saved sheet exists
- remove from saved uses bookmark_remove or relevant hook
- copy icon/content_copy exists
- check icon state support exists or copy success code exists
- marketplace links target="_blank"
- marketplace rel includes sponsored nofollow noopener noreferrer
- dock Store / Contact / Discover / Saved / More remains intact
- More sheet Blog href="/"
- More sheet Home href="/landing"
- hidden sheets include aria-hidden/inert/hidden in closed markup where possible
- Store feed still uses /feeds/posts/default/-/Store

Do not require live production to pass before deploy.

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker

Do not run live smoke as a pre-deploy blocker.

====================================================================
R. UPDATE EMBEDDED CONTRACTS
====================================================================

Update STORE_SURFACE_CONTRACT, STORE_MOTION_CONTRACT, STORE_QA_MATRIX or equivalent embedded docs in store.html.

Must mention:
- Store is a standalone surface
- Dock is Store / Contact / Discover / Saved / More
- Preview hero image pins during early scroll
- Overlay text moves with content layer
- Preview carousel is manual, snap-based, no autoplay
- Preview dots sync with carousel
- Marketplace CTAs are primary
- Save and Copy Links are secondary
- Saved uses localStorage
- Hidden sheets use hidden/aria-hidden/inert
- Reduced motion is respected

Must not mention:
- Blog dock item
- Read the article
- visible close button
- autoplay

====================================================================
FINAL ACCEPTANCE CRITERIA
====================================================================

The task is complete only if:
- /store still builds and passes artifact smoke.
- Store dock remains Store / Contact / Discover / Saved / More.
- Blog/Home remain inside More only.
- WhatsApp link uses full https://wa.me/...
- Disclosure reads cleanly.
- Empty state sounds public/premium, not debugging.
- Closed sheets are hidden from accessibility tree.
- No visible close buttons.
- Preview hero feels pinned during early scroll.
- Overlay text moves with content.
- Preview dots are top-center and synced.
- Carousel feels controlled and native.
- Save/Copy row exists with Save dominant and Copy compact.
- Save/Saved/Remove icons reflect state.
- Copy Links copies human-readable marketplace links.
- Toast feedback exists.
- Saved remains functional.
- Discovery result rows work with dummy products.
- Keyboard/mouse controls work.
- prefers-reduced-motion is respected.