# TASK-045 — Final Micro-Polish for Comments UI: Menu Alignment, Parent Context, Reply Banner, Hidden Scrollbars, and Visual Tightening

## Objective

Apply a final micro-polish pass to the native Blogger comments UI after Tasks 043–044.

This task must **not** change the comments architecture. It must only refine visual alignment, menu presentation, parent context clarity, reply banner layout, and sheet scroll aesthetics.

The goal is to close the remaining visual roughness without introducing new features or destabilizing the native Blogger comment engine.

---

## Scope

This is a small visual-only task.

Focus only on:

1. Comment More menu icon/label alignment.
2. Comment More menu danger styling.
3. Collision-aware More menu must remain intact.
4. Parent context card refinement in Replies sheet.
5. Reply banner layout with Material Symbols `reply` icon.
6. Hidden scrollbars inside comments/replies sheet content only.
7. Final alignment utilities for icon buttons, badges, and menu rows.
8. Minor visual polish for deleted comments and composer well if needed.

---

## Hard Rules

Do not:

- create a fake composer;
- duplicate `#top-ce`;
- duplicate `#comment-editor`;
- create a custom textarea for actual submission;
- create a custom Send/Publish button;
- inject text into the Blogger iframe;
- access or modify iframe internals;
- fetch comments;
- poll comments;
- replace Blogger native reply behavior;
- replace Blogger native delete behavior;
- remove native Blogger controls from DOM permanently;
- reintroduce comment sorting;
- add newest/oldest controls;
- add likes/reactions;
- add realtime behavior.

Keep Blogger native internals intact:

- `data:post.commentHtml`
- `li.comment`
- `.comment-thread`
- `.comment-replies`
- `.continue`
- `.comment-reply`
- `.item-control`
- `.comment-delete`
- `.goog-toggle-button`
- `#top-ce`
- `#comment-editor-src`
- `#comment-editor`
- `BLOG_CMT_createIframe(...)`
- `data:post.cmtfpIframe`

---

## Current Visual Issues to Fix

### Issue 1 — More menu icon/text alignment is still imperfect

Observed problem:

```txt
icon Copy link
DELETE Delete comment
```

or icon and label appear visually misaligned/overlapping.

Expected:

```txt
[link icon]    Copy link
[trash icon]   Delete comment
```

Rules:

- Each menu row must use horizontal flex layout.
- Icon must have a fixed box.
- Label must not overlap icon.
- Menu must have enough width for `Delete comment`.
- Delete row must use danger color.
- Copy row must use normal text color.
- Menu must remain collision-aware from Task 043.

Recommended CSS direction:

```css
.gg-comment-more__menu {
  min-width: 176px;
  padding: 6px;
}

.gg-comment-more__item {
  min-height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.gg-comment-more__item-icon,
.gg-comment-more__item .gg-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.gg-comment-more__item-label {
  flex: 1 1 auto;
  min-width: 0;
}

.gg-comment-more__item--danger {
  color: var(--gg-danger, #ff6b6b);
}

.gg-comment-more__item--danger:hover,
.gg-comment-more__item--danger:focus-visible {
  background: var(--gg-danger-soft, rgba(255, 107, 107, .12));
}
```

Acceptance:

- `Copy link` row aligns cleanly.
- `Delete comment` row aligns cleanly.
- Delete icon and label are red/danger.
- Menu text does not overlap icons.
- Menu does not clip near sheet header/footer.

---

### Issue 2 — Parent context card needs final refinement

Current parent context direction is correct, but it should feel more intentional and less technical.

Rules:

- Parent context must remain **non-sticky**.
- Parent context should include avatar if available.
- Avatar should be compact: approximately `28–32px`.
- Rename visual label from `Parent comment` to `Original comment`.
- Keep the card compact.
- Do not make the parent context card heavy or dominant.

Expected visual:

```txt
ORIGINAL COMMENT

[avatar] Pak RPP       May 14, 2026 at 1:12 AM
         Tes komen level 1
         5 replies
```

Markup direction, adapt to existing DOM:

```html
<div class="gg-comment-replies__context">
  <div class="gg-comment-replies__context-label">Original comment</div>
  <div class="gg-comment-replies__context-row">
    <img class="gg-comment-replies__context-avatar" alt="" />
    <div class="gg-comment-replies__context-copy">
      <div class="gg-comment-replies__context-meta">
        <strong>Pak RPP</strong>
        <span>May 14, 2026 at 1:12 AM</span>
      </div>
      <div class="gg-comment-replies__context-body">Tes komen level 1</div>
      <div class="gg-comment-replies__context-count">5 replies</div>
    </div>
  </div>
</div>
```

CSS direction:

```css
.gg-comment-replies__context {
  margin: 4px 16px 12px;
  padding: 10px 12px;
  border: 1px solid var(--gg-divider);
  border-radius: 14px;
  background: var(--gg-surface-subtle);
}

.gg-comment-replies__context-label {
  margin-bottom: 8px;
  color: var(--gg-ink-muted);
  font: 700 10px/1.2 var(--gg-font-sans);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.gg-comment-replies__context-row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.gg-comment-replies__context-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  object-fit: cover;
}

.gg-comment-replies__context-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.gg-comment-replies__context-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

Acceptance:

- Parent context card includes avatar when available.
- Visual label says `Original comment`.
- Card is compact and readable.
- Card is non-sticky.
- It does not consume too much vertical space.

---

### Issue 3 — Reply banner should use Material Symbols `reply` icon

The `reply` icon is a context/status icon, not a back arrow and not a navigation control.

Expected:

```txt
[reply icon] Replying to @gaga                                      ×
[native Blogger composer]
```

Rules:

- Icon `reply` appears on the left of the reply banner.
- Icon is decorative/status only.
- Icon must use `aria-hidden="true"`.
- Text remains visible: `Replying to @AuthorName`.
- Cancel `×` stays on the right.
- `×` is the only cancel action.
- Do not add a back arrow to the reply banner.
- Back arrow remains only in the Replies sheet header.
- Reply banner and native composer must remain in the same active footer.

Markup direction:

```html
<div class="gg-comments__reply-banner" role="status">
  <span class="gg-comments__reply-context">
    <span class="gg-icon gg-comments__reply-icon" aria-hidden="true">reply</span>
    <span>Replying to <strong>@gaga</strong></span>
  </span>

  <button
    type="button"
    class="gg-comments__reply-clear"
    data-gg-action="comments-reply-cancel"
    aria-label="Cancel reply">×</button>
</div>
```

CSS direction:

```css
.gg-comments__reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 0 12px;
  border-bottom: 1px solid var(--gg-divider);
}

.gg-comments__reply-context {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.gg-comments__reply-icon {
  font-size: 20px;
  line-height: 1;
  opacity: .78;
}

.gg-comments__reply-context span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gg-comments__reply-clear {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
}
```

Acceptance:

- Reply banner reads clearly.
- Reply icon appears correctly.
- Icon does not behave like a back button.
- Cancel button remains accessible.
- Banner and composer remain visually one unit.

---

### Issue 4 — Hide visual scrollbars only inside comments sheet scroll containers

For a native-app-like sheet feel, visual scrollbars may be hidden inside comment sheet content containers while preserving scroll behavior.

Rules:

- Apply only to comments/replies sheet scroll containers.
- Do not apply globally.
- Do not disable scrolling.
- Preserve touch momentum scrolling.
- Preserve `overscroll-behavior: contain`.

CSS direction:

```css
#gg-comments-sheet .gg-comments__content,
#gg-comment-replies-sheet .gg-comments__content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#gg-comments-sheet .gg-comments__content::-webkit-scrollbar,
#gg-comment-replies-sheet .gg-comments__content::-webkit-scrollbar {
  display: none;
}
```

Acceptance:

- Sheet content still scrolls.
- Scrollbar is visually hidden in Chrome/Safari/Firefox.
- No global scrollbar rules are added.
- Page/body scrollbar behavior is unaffected.

---

### Issue 5 — Alignment utilities for icon-only controls and badges

Some UI parts need centered alignment:

- toolbar icon-only comments button;
- count badge;
- More menu icon box;
- reply banner cancel button;
- icon-only buttons.

Rules:

- Use `place-items: center` for icon-only buttons.
- Use `align-items: center; justify-content: center` for badges and icon boxes.
- Do not center-align full menu row text.
- Menu rows must be left-aligned.

CSS direction:

```css
.gg-detail-toolbar__action--comments,
.gg-comments__reply-clear,
.gg-comment-more__button {
  display: inline-grid;
  place-items: center;
}

.gg-detail-toolbar__count,
.gg-comment-more__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Acceptance:

- Icon-only buttons are optically centered.
- Badge count is centered.
- More menu icons are centered in fixed icon boxes.
- Menu text remains left-aligned.

---

### Issue 6 — Deleted comments should remain readable but muted

Deleted comments should remain visible when Blogger renders them, but they should not look like active comments.

Rules:

- Do not hide deleted comments.
- Do not remove native text.
- Muted style only.
- Keep readable.

CSS direction:

```css
.gg-comments .deleted-comment,
.gg-comments .comment-content:has(.deleted-comment) {
  color: var(--gg-ink-muted);
  font-style: italic;
}
```

If `:has()` support is a concern, use a JS-added class only if already available or safe.

Acceptance:

- Deleted comments remain visible.
- Deleted comments are visually quieter.
- No native Blogger delete semantics are broken.

---

## Proof / QA Additions

Extend `GG.commentsProof()` or focused visual proof with:

```js
{
  moreMenuItemsAligned,
  parentContextHasAvatar,
  parentContextLabelIsOriginalComment,
  replyBannerHasReplyIcon,
  replyBannerCancelRightAligned,
  sheetScrollbarsHidden,
  iconButtonsCentered
}
```

Expected:

```txt
moreMenuItemsAligned === true
parentContextHasAvatar === true when avatar exists
parentContextLabelIsOriginalComment === true
replyBannerHasReplyIcon === true
replyBannerCancelRightAligned === true
sheetScrollbarsHidden === true
iconButtonsCentered === true
```

---

## Required Screenshots

Capture after changes:

1. More menu open near top of sheet.
2. More menu open near bottom/footer of sheet.
3. Replies sheet parent context card.
4. Reply mode banner with reply icon and cancel right.
5. Main sheet scroll container with hidden scrollbar.
6. Replies sheet scroll container with hidden scrollbar.
7. Toolbar comments icon with badge.
8. Toolbar zero-comment add icon.

---

## Required Commands

Run:

```bash
node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack
```

If `npm run gaga:verify-sheet-contract` fails only due to existing store CSS drift, report it separately and do not treat it as comments failure.

---

## Acceptance Criteria

### More Menu

- Copy link and Delete comment rows align cleanly.
- Icons do not overlap labels.
- Delete comment uses danger color.
- Menu remains collision-aware.
- Menu does not clip against header/footer.

### Parent Context

- Label says `Original comment`.
- Avatar appears when available.
- Card is compact and non-sticky.
- Parent context is visually clear but not dominant.

### Reply Banner

- Material Symbols `reply` icon appears on the left.
- Icon is `aria-hidden`.
- Text says `Replying to @AuthorName`.
- Cancel `×` is right-aligned.
- Cancel button has `aria-label="Cancel reply"`.
- Banner and composer remain in the same active footer.

### Scroll Containers

- Comments sheet content scrolls normally.
- Replies sheet content scrolls normally.
- Visual scrollbars are hidden only inside sheet content containers.
- No global scrollbar behavior is changed.

### Alignment

- Icon-only buttons are centered.
- Badge count is centered.
- More menu icon boxes are centered.
- Menu text remains left-aligned.

### Regression

- No fake composer.
- No duplicated `#top-ce`.
- No duplicated `#comment-editor`.
- No vertical Reply.
- No raw native Replies label.
- Native Blogger Publish remains usable.
- Existing comments proof passes.
