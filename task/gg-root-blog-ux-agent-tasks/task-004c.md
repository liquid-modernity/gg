# TASK 004C Addendum — Preview Footer, Saved Empty State, Detail Pagination, and Contact Copy Cleanup

## A. Preview Sheet CTA Must Live in Footer

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

Do not render CTA buttons from JavaScript HTML strings.

CTA shell must exist in `index.xml`.

JavaScript may only:

* update saved state
* update button text/icon state
* update aria-pressed
* update href
* toggle disabled/hidden state

---

## B. Saved Empty State Must Replace Listing Content

Current issue:

When clicking Saved, the root listing still shows normal article rows, while “No saved articles yet” appears at the bottom. This is incorrect.

Required behavior:

* When Saved mode is active, normal/latest listing rows must be hidden or replaced.
* Empty saved state must appear at the top of the listing content area, not below existing normal rows.
* The saved empty state must feel like the current listing state, not an appended footer message.

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

Required empty state copy:

```txt
No saved articles yet.
Save articles from previews or article pages to find them here.
```

Allowed layout:

```txt
gg-entry-list[data-gg-listing-mode="saved"]
├─ gg-listing-empty-state
```

Do not append empty state after old listing rows.

Do not render saved empty state from JavaScript HTML strings.

Empty state shell must exist in `index.xml`.

---

## C. Detail Page Uses Pagination + Related Posts, Not Dock TOC

Correction:

Post/page detail should use article navigation/pagination plus Related Posts for retention. Do not treat the detail page as a dock TOC surface.

Root/listing surfaces:

```txt
.gg-detail-outline
→ data-gg-outline-mode="pagination"
→ attached to global dock
→ Back left, page/range center, Next right
```

Post/page detail surfaces:

```txt
detail page
→ article pagination / adjacent navigation
→ related posts retention card
→ no dock TOC as the primary treatment
```

Required detail behavior:

* Detail page must not show the root listing dock pagination treatment.
* Detail page must not use dock TOC as the primary navigation pattern.
* Related Posts remains visible as the main retention module.
* Previous/next article navigation is allowed and preferred in the body area.
* Previous/next article navigation must have a different visual treatment from root listing pagination.
* The component name may be:

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

Rules:

* Root listing pagination may stay attached to dock.
* Detail page pagination must be body-level, not dock-attached.
* Detail page pagination must not reuse the exact visual treatment of root pagination.
* Do not replace Related Posts with TOC.
* Do not create a dock TOC for detail page unless explicitly requested later as an optional reading aid.


## D. Contact Sheet Technical Plumbing Text Must Be Removed

Current issue:

The Contact sheet shows technical implementation copy such as:

```txt
Ready to send through Blogger contact form plumbing.
Native Blogger ContactForm plumbing detected.
Fallback: open the contact page.
```

This must not be visible to users.

Required behavior:

* Remove technical plumbing/debug text from visible Contact sheet UI.
* Do not expose implementation details such as “plumbing”, “native Blogger ContactForm detected”, or “fallback”.
* Keep technical status only in hidden diagnostics, console debug, or a non-user-facing data attribute if needed.
* Contact sheet must show user-facing copy only.

Allowed user-facing copy:

```txt
Write Message
Send your message through the available contact options.
```

or simply no status copy.

Contact provider behavior:

* Do not fake Blogger ContactForm success.
* If native Blogger ContactForm is unavailable or unreliable, expose clear action buttons:

  * Send via WhatsApp
  * Send via Email
  * Open contact page, only if the route exists and works
* Static landing/store must not point to broken local anchors.
* Contact sheet must remain consistent across root, landing, and store where supported.

---

## E. Guard Updates Required

Update `qa/public-surface-static-markup-guard.mjs` or `qa/root-ux-polish-guard.mjs` to fail when:

* `gg-preview__cta-row` is not inside the preview footer/sheet footer contract.
* Preview CTA appears duplicated outside the footer.
* Saved empty state appears after normal listing rows.
* Saved mode does not hide/replace normal rows.
* Root pagination treatment appears on post/page detail.
* Post/page detail `.gg-detail-outline` is not explicit TOC mode.
* Visible Contact sheet copy contains:

  * `plumbing`
  * `Native Blogger ContactForm plumbing detected`
  * `Fallback:`
  * `Ready to send through Blogger contact form`
* Contact sheet lacks safe user-facing fallback actions when native ContactForm is unavailable.

---

## F. Additional Validation

After changes, run:

```bash
git diff --check
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:verify-public-surface-static-markup
npm run gaga:verify-root-ux-polish
npm run gaga:verify-preview-sheet
npm run gaga:verify-nav-more
npm run gaga:verify-theme
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
