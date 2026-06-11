# TASK 004C — Public Surface Static Markup Reconciliation

## Status

Run this task after Task 004B and before repo structure reconciliation.

Do not start repo structure reconciliation.

Do not move files into `product/`.

Do not introduce new UX features unless required to complete this markup/static-surface contract.

---

## Context

Tasks 001–004B are functionally green, but the public Blogger surface still has technical debt: some runtime JavaScript creates HTML structures for public UI.

For this product, public Blogger surfaces must be Gaga Design System surfaces. The source of truth for public semantic structure, hooks, reusable UI shells, empty states, and UI microcopy must be `index.xml`, not JavaScript.

Final rule:

```txt
index.xml = semantic/template/hook/microcopy source of truth
CSS       = visual system source of truth
JS        = behavior/state/data binding only
```

---

## Product Law

Public Blogger surfaces must use Gaga Design System only.

Allowed for public root/store/landing:

* `gg-*` classes
* `gg-*` data attributes
* Gaga CSS tokens
* Gaga components
* Blogger XML/template primitives
* vanilla JavaScript for behavior only

Not allowed for public root/store/landing:

* React
* shadcn/ui
* Vue
* Svelte
* Tailwind runtime dependency
* Bootstrap
* Radix runtime dependency
* third-party UI component framework
* JavaScript rendering large UI HTML from strings
* `innerHTML` for public UI construction
* template-string HTML card/list rendering
* Worker HTMLRewriter as CMS repair layer

---

## Goal

Reconcile the public surface so runtime JavaScript no longer acts as the main HTML renderer.

All public UI structures needed for:

* root listing
* saved listing
* popular listing
* related posts
* root pagination
* detail page adjacent pagination
* preview sheet CTA
* contact sheet
* more sheet
* empty/error states

must have their semantic shells, hooks, and templates in `index.xml`.

JavaScript may only:

* bind events
* toggle classes
* toggle `hidden`
* update `aria-*`
* update `textContent`
* update `href`, `src`, `alt`, `aria-label`, `data-*`
* clone existing `<template>` nodes from `index.xml`
* populate cloned templates using safe DOM APIs
* reorder or filter existing nodes when contract-safe

---

# 1. Audit JavaScript HTML Creation

Audit public runtime JavaScript, especially:

```txt
src/js/gg-app.source.js
src/js/modules/*
src/js/components/*
```

Find all public-surface patterns like:

```js
element.innerHTML = `...`;
container.insertAdjacentHTML(...);
document.createElement(... large UI tree ...);
template string cards/lists/buttons;
runtime-generated related posts markup;
runtime-generated saved listing markup;
runtime-generated popular posts markup;
runtime-generated empty states;
runtime-generated pagination markup;
```

Classify each occurrence:

```txt
A. Allowed small text/attribute update
B. Allowed template clone from index.xml
C. Must migrate to index.xml template
D. Internal/non-public console behavior
```

Do not rewrite GG Console internals in this task unless the code is shared into public runtime.

---

# 2. Move Public UI Shells to `index.xml`

Add or confirm static semantic shells/templates in `index.xml`.

Required template/shell coverage:

```txt
[ ] saved listing row template
[ ] popular listing row template
[ ] popular range selector/template
[ ] related posts card template
[ ] related posts dot template
[ ] listing empty state template
[ ] saved empty state template
[ ] comments empty state template
[ ] search empty state template
[ ] recent articles error state template
[ ] offline state template
[ ] 404 state template
[ ] popular unavailable empty state template
[ ] root pagination shell
[ ] detail page adjacent pagination shell
[ ] preview sheet footer shell
[ ] preview sheet CTA row shell
[ ] contact social shell
```

Preferred pattern:

```html
<template id="gg-template-related-post-card">
  ...
</template>
```

or Blogger-compatible hidden shell if `<template>` is unsafe in the current XML/template context.

All template IDs must be unique.

All hooks must use `gg-*` class/data naming.

All icons must be present in markup or registered as data-driven icon slots, not generated as raw HTML strings.

---

# 3. Public Empty/Error Microcopy Contract

Use this microcopy pattern:

```txt
Headline = short, bold
Subcopy  = one sentence explaining the next action
```

Required copy:

## Saved empty — general

```txt
No saved items yet.
Save articles or products to find them here.
```

## Saved empty — articles only

```txt
No saved articles yet.
Save articles from previews or article pages to find them here.
```

## Comments empty

```txt
No comments yet.
Be the first to comment.
```

## Search empty

```txt
No results found.
Try another keyword.
```

## Recent articles error

```txt
Recent articles are unavailable right now.
Please try again later.
```

## Offline

```txt
Connection unavailable.
The requested page cannot be loaded because the network is unavailable. Saved pages may still be available.
```

## 404

```txt
Page not found.
The page may have been moved, deleted, or is no longer available.
```

Implementation rules:

* Headline must be visually stronger/bold.
* Subcopy must be one sentence.
* Empty/error state shells must exist in `index.xml`.
* JavaScript may only select/show/update the appropriate state.
* Do not append empty states after unrelated content.
* Do not create empty/error state HTML from JavaScript strings.

Suggested structure:

```html
<section class="gg-empty-state" data-gg-empty-state="saved-articles" hidden>
  <strong class="gg-empty-state__headline">No saved articles yet.</strong>
  <p class="gg-empty-state__copy">Save articles from previews or article pages to find them here.</p>
</section>
```

---

# 4. JavaScript Rendering Rules

After this task, public runtime JS must follow this rule:

Allowed:

```js
node.textContent = title;
node.setAttribute("href", url);
node.hidden = false;
node.classList.toggle("gg-is-active", active);
template.content.cloneNode(true);
```

Avoid or remove for public UI:

```js
node.innerHTML = html;
node.insertAdjacentHTML("beforeend", html);
container.innerHTML = cards.map(...).join("");
```

Exception:

Sanitized article body/content handling may keep its existing safe contract only if it is not creating Gaga UI chrome. If used, document the exception clearly.

---

# 5. Root Pagination Contract

Root/listing surfaces use dock-attached pagination.

Canonical root pagination visual family:

```html
<nav class="gg-detail-outline" data-gg-outline-mode="pagination">
```

For root/listing surfaces:

```txt
.gg-detail-outline
→ data-gg-outline-mode="pagination"
→ attached visually to global dock
→ Back left
→ page/range center
→ Next right
```

Rules:

* Pagination must not show visible labels like:

  * `Pagination`
  * `Browse entries`
* Back action appears on the left.
* Current page/range appears centered.
* Next action appears on the right.
* Pagination must feel attached to the global dock/dock-tail.
* Keep olderPageUrl/newerPageUrl fallback intact.
* Pagination must be accessible by keyboard and screen reader.
* Do not generate pagination markup from JavaScript HTML strings.

---

# 6. Detail Page Pagination + Related Posts Contract

Correction:

Detail page should use article pagination plus Related Posts for retention.

Do not treat the detail page as a dock TOC surface.

Post/page detail surfaces:

```txt
detail page
→ body-level article pagination / adjacent navigation
→ related posts retention card
→ comments
```

Required behavior:

* Detail page must not show the root listing dock pagination treatment.
* Detail page must not use dock TOC as the primary navigation pattern.
* Related Posts remains visible as the main retention module.
* Previous/next article navigation is allowed and preferred in the body area.
* Previous/next article navigation must have a different visual treatment from root listing pagination.
* Do not attach detail page previous/next navigation to the global dock.
* Do not replace Related Posts with TOC.

Preferred detail component:

```html
<nav class="gg-entry-adjacent" aria-label="Adjacent articles">
  <a class="gg-entry-adjacent__link gg-entry-adjacent__link--prev">Newer article</a>
  <a class="gg-entry-adjacent__link gg-entry-adjacent__link--next">Older article</a>
</nav>
```

Preferred detail layout:

```txt
Article content
→ Save / share / open actions
→ Newer article / Older article
→ Related Posts
→ Comments
```

Optional reading TOC may be added later only as a secondary reading aid if explicitly requested. It is not part of this task.

---

# 7. Preview Sheet Footer Contract

Current issue:

The Preview Sheet CTA row can appear inside the content/body area or visually duplicate/stack awkwardly on small viewport.

Required behavior:

* `gg-preview__cta-row` must live inside the Preview Sheet footer area.
* CTA row must not appear as a floating duplicate inside preview content.
* CTA footer must remain visually attached to the bottom of the sheet.
* CTA footer should use `position: sticky` only within the sheet scroll context.
* CTA footer must respect mobile safe-area padding.
* CTA footer must use `display: flex`.
* On narrow screens, buttons may shrink or stack only if necessary, but must remain inside the footer area.
* CTA shell must exist in `index.xml`.
* Do not render CTA buttons from JavaScript HTML strings.

Required CTA structure:

```txt
Preview Sheet
├─ header/meta
├─ preview body/content
└─ footer
   └─ gg-preview__cta-row
      ├─ Save / Saved
      └─ Open full article
```

Target visual:

```txt
[ Save / Saved ]          [ Open full article  read_more ]
```

JavaScript may only:

* update saved state
* update button text/icon state
* update `aria-pressed`
* update `href`
* toggle disabled/hidden state

---

# 8. Saved Listing Contract

Saved behavior from Task 004B must remain intact, with corrected empty state behavior.

Source:

```txt
localStorage key: gg:saved:v1
```

Required behavior:

* Saved menu item switches to saved listing mode.
* If saved articles exist, show saved rows.
* If no saved articles exist, show saved empty state.
* Normal/latest listing rows must be hidden or replaced in saved mode.
* Saved empty state must appear at the top/center of the listing content area.
* Saved empty state must not appear below normal listing rows.
* Save/Saved state sync remains active.
* localStorage unavailable does not throw.
* UI rows are populated via existing template/shell, not HTML strings.

Required saved-articles empty copy:

```txt
No saved articles yet.
Save articles from previews or article pages to find them here.
```

Correct behavior:

```txt
Click Saved
→ listing mode = saved
→ if saved articles exist:
     show saved rows
→ if no saved articles:
     show empty state at top/center of listing area
→ do not show normal Latest rows underneath or above it
```

Allowed layout:

```html
<section class="gg-entry-list" data-gg-listing-mode="saved">
  <section class="gg-empty-state" data-gg-empty-state="saved-articles">
    <strong class="gg-empty-state__headline">No saved articles yet.</strong>
    <p class="gg-empty-state__copy">Save articles from previews or article pages to find them here.</p>
  </section>
</section>
```

---

# 9. Popular Posts Native Source Contract

Popular Posts behavior from Task 004B must remain intact.

Do not fake popularity.

Use native Blogger PopularPosts widgets as first-class data source.

Required native source IDs/time ranges:

```txt
PopularPosts1 = ALL_TIME
PopularPosts3 = LAST_YEAR
PopularPosts2 = LAST_MONTH
PopularPosts4 = LAST_WEEK
```

Required behavior:

* Popular Posts menu item switches to popular listing mode.
* Popular listing uses native Blogger PopularPosts data when available.
* Popular mode supports:

  * All time
  * Last year
  * Last 30 days
  * Last 7 days
* Public display must use Gaga listing/card templates.
* Native Blogger widget output may remain hidden/source-only.
* Preserve thumbnails/snippets if available.
* Exclude Store products.
* If native popular data is unavailable, show clear empty state.
* Do not synthesize fake popular ranking from latest posts.
* Do not render popular rows from JavaScript HTML strings.

Suggested unavailable copy may use the general empty/error pattern.

---

# 10. Related Posts Contract

Related posts behavior from Task 004B must remain intact.

Required behavior:

* render only on post/page detail
* exclude Store products
* show maximum 3 visible cards
* dots appear only when item count > 3
* no external carousel library
* use Gaga retention-card template from `index.xml`
* no string-generated card HTML
* thumbnail or subtle Gaga placeholder
* accessible carousel dots/controls

Target visual:

```txt
Related Posts >
────────────────────────
[Label] Title                         [thumb]
[Label] Title                         [thumb]
[Label] Title                         [thumb]

•  ○  ○
```

---

# 11. Preview Sheet Metadata Contract

Required behavior:

* Replace “Article preview” text with current article/post label meta.
* Remove redundant `gg-preview__taxonomy` / meta cue if it duplicates the label/meta.
* Keep Save/Saved button visible.
* Keep Open full article button visible.
* Add/readjust dynamic saved icon.
* Add/readjust `read_more` icon for Open full article.
* Icons should appear on the right side where visually appropriate.
* Buttons must keep accessible names.
* Preview sheet must remain keyboard accessible.

---

# 12. Contact and More Sheet Contract

Keep Task 004B behavior, with copy cleanup.

Required behavior:

* Social links are in Contact sheet, not More sheet.
* More sheet does not contain `gg-more-footer__social`.
* Contact sheet contains `gg-contact-social`.
* Native Blogger ContactForm remains experimental/root-only best effort.
* WhatsApp/email fallback remains safe.
* No fake success.

Remove visible technical plumbing/debug text from Contact sheet UI.

Do not show user-visible text like:

```txt
Ready to send through Blogger contact form plumbing.
Native Blogger ContactForm plumbing detected.
Fallback:
Ready to send through Blogger contact form
```

Allowed user-facing copy:

```txt
Write Message
Send your message through the available contact options.
```

or no status copy.

Technical status may exist only in hidden diagnostics, console debug, or non-user-facing data attributes if needed.

Contact provider behavior:

* If native Blogger ContactForm is unavailable or unreliable, expose clear action buttons:

  * Send via WhatsApp
  * Send via Email
  * Open contact page, only if the route exists and works
* Static landing/store must not point to broken local anchors.
* Contact sheet must remain consistent across root, landing, and store where supported.

---

# 13. Theme Parity Pass

Harmonize light and dark theme for all Task 001–004B features.

Audit and fix:

```txt
[ ] gg-site-head
[ ] root listing rows
[ ] label icons
[ ] filter menu
[ ] saved listing mode
[ ] popular listing mode
[ ] related posts card/carousel
[ ] related posts dots
[ ] preview sheet sticky CTA/footer
[ ] contact sheet social links
[ ] more sheet after social removal
[ ] gg-detail-outline pagination mode
[ ] detail adjacent pagination
[ ] dock-tail / dock companion
[ ] empty/error states
```

Rules:

* Use Gaga tokens.
* Avoid hard-coded light-only colors.
* Avoid duplicated dark theme overrides unless necessary.
* Do not break existing visual rhythm.
* Update critical CSS if above-the-fold rendering depends on it.

---

# 14. CSS Source-of-Truth

Do not edit generated output directly.

Allowed source files:

```txt
src/css/gg-app.source.css
src/css/gg-critical.source.css
src/css/modules/*
src/css/components/*
```

Generated files must only be refreshed by pipeline:

```txt
__gg/assets/*
dist/*
.cloudflare-build/*
```

If editing module CSS, ensure the CSS is actually included in the final public bundle.

Run or update wiring checks if needed.

---

# 15. Public Surface Static Markup Guard

Add or update a focused guard:

```txt
qa/public-surface-static-markup-guard.mjs
```

Wire it to package scripts:

```txt
gaga:verify-public-surface-static-markup
ci:qa
```

The guard should fail when:

* public runtime JS creates Gaga UI cards/lists via HTML strings
* related posts are rendered from string HTML
* saved listing rows are rendered from string HTML
* popular listing rows are rendered from string HTML
* pagination markup is generated from string HTML
* preview CTA buttons are generated from string HTML
* empty/error state markup is generated from string HTML
* required `index.xml` templates/hooks are missing
* duplicate template IDs exist
* root/listing has duplicate header containers
* saved empty state appears after normal listing rows
* saved mode does not hide/replace normal rows
* root pagination visible text contains `Pagination` or `Browse entries`
* root pagination treatment appears on post/page detail
* detail page renders dock TOC as primary navigation
* `gg-preview__cta-row` is not inside preview footer/sheet footer contract
* preview CTA appears duplicated outside the footer
* visible Contact sheet copy contains:

  * `plumbing`
  * `Native Blogger ContactForm plumbing detected`
  * `Fallback:`
  * `Ready to send through Blogger contact form`
* contact sheet lacks safe user-facing fallback actions when native ContactForm is unavailable
* required empty/error microcopy is missing or changed unintentionally

Allow carefully documented exceptions for non-public GG Console code and safe sanitized article body handling.

---

# 16. Keep GG Console Out of This Reconciliation

GG Console is not the target of this static public-surface reconciliation unless it shares code with public runtime.

Rules:

* Do not migrate GG Console to another framework in this task.
* Do not introduce shadcn/ui or React into public Blogger surface.
* `dashboard.html` remains GG Blogger Studio prototype/reference only.
* `apps/console` remains read-only control plane.

Still run:

```bash
npm run gg:console:check
```

to ensure nothing regressed.

---

# 17. Validation Commands

Run and report exact results:

```bash
git status --short
git diff --check
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:verify-public-surface-static-markup
npm run gaga:verify-root-ux-polish
npm run gaga:verify-preview-sheet
npm run gaga:verify-nav-more
npm run gaga:verify-theme
npm run gg:console:check
npm run gaga:template:pack
npm run build
npm run ci:qa
npm run ci:cloudflare
```

If `index.xml` changes, update fingerprint only after source is stable:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
```

---

# 18. Required Handoff Report

Report:

```txt
1. Changed files grouped by area
2. JS HTML creation audit summary
3. Remaining allowed exceptions, if any
4. New/updated index.xml templates/hooks
5. Empty/error microcopy implementation status
6. Root pagination contract status
7. Detail page pagination + related posts contract status
8. Saved empty state behavior
9. Popular Posts behavior
10. Preview Sheet footer behavior
11. Contact sheet copy cleanup
12. Theme parity fixes
13. Final template fingerprint
14. Console check result
15. ci:qa result
16. ci:cloudflare result
17. Advisory warnings
18. Remaining blockers
```

Classify remaining issues as:

```txt
BLOCKER
SHOULD FIX BEFORE RESTRUCTURE
ADVISORY
BACKLOG
```

---

# Acceptance Criteria

Task 004C is complete only when:

* Public Gaga UI chrome is not generated from JavaScript HTML strings.
* Required public UI shells/templates exist in `index.xml`.
* Required empty/error microcopy exists in public templates/copy source.
* Saved listing works and empty state replaces normal rows.
* Popular Posts listing works from native Blogger PopularPosts source.
* Related posts work as retention card/carousel.
* Root pagination is dock-attached and label-free.
* Detail page has body-level article pagination/adjacent navigation plus Related Posts.
* Detail page does not use dock TOC as primary navigation.
* Preview sheet CTA lives in footer, not body.
* Contact sheet no longer shows technical plumbing/debug text.
* Contact/More sheet cleanup remains intact.
* Light/dark theme parity is improved for all new Task 001–004B components.
* Generated assets are refreshed through the normal build/template pipeline.
* `ci:qa` and `ci:cloudflare` pass or pass with documented existing advisory warnings only.

---

# Do Not Proceed

Do not proceed to repo structure reconciliation until this task is accepted.
