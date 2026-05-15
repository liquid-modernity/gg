# TASK-043 — Final Comments Sheet Conversation Polish, Collision-Aware More Menu, Parent Context Card, and Native Composer Well

## Objective

Finalize the native Blogger comments sheet after Task 042.

The comments system must keep Blogger as the native engine, while GG owns the presentation layer:

- Threads-like comment/reply list;
- Blogger-native composer well;
- collision-aware More menu;
- non-sticky parent comment context card in replies sheet;
- polished reply banner;
- quiet, functional Load more;
- no fake composer and no replacement comment engine.

This task is a final interaction and visual polish task. Do not rewrite the comment architecture.

---

## Product Direction

The target is not a literal copy of a native social app mockup. The correct target is:

```txt
Threads-like list + Blogger-native composer well
```

Reason:

- Blogger must remain the comment engine.
- Blogger iframe composer cannot be fully restyled internally.
- GG can polish the surrounding sheet, rows, menus, reply context, and composer wrapper.
- GG must not replace Blogger submit/auth/reCAPTCHA behavior.

---

## Hard Rules

Do not:

- create a fake composer;
- duplicate `#top-ce`;
- duplicate `#comment-editor`;
- create custom submit UI;
- inject text into Blogger iframe;
- access or modify iframe internals;
- fetch comments;
- poll comments;
- replace Blogger native reply/delete;
- remove native Blogger controls from DOM.

Keep Blogger-native internals intact:

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

## Problem 1 — More Menu Needs Collision-Aware Placement

Current risk:

```txt
More menu can be clipped by sheet header/footer or overflow outside the sheet viewport.
```

Expected behavior:

```txt
If enough room below:
  open menu downward.

If near footer:
  open menu upward.

If near header:
  open menu downward with safe offset.

If near right edge:
  align right but remain inside sheet.

If constrained:
  use a centered floating mini popover within the sheet.
```

### Required Behavior

More menu placement must be collision-aware.

Use button, sheet panel, header, footer, and viewport geometry to choose placement.

Recommended placement states:

```txt
bottom-end
top-end
center
```

Example attribute:

```html
<span class="gg-comment-more" data-gg-menu-placement="top-end">
```

or:

```html
<div class="gg-comment-more__menu" data-gg-menu-placement="top-end">
```

### Placement Rules

- Menu must not be clipped by sticky header.
- Menu must not be clipped by sticky footer/composer.
- Menu must not overflow beyond sheet panel right/left edges.
- Menu must stay visually attached to the active More button.
- Only one More menu may be open at a time.
- Escape/click outside should close the menu.

### Acceptance Check

```js
(() => {
  const menu = document.querySelector('.gg-comment-more__menu:not([hidden])');
  const panel = menu?.closest('.gg-sheet__panel');
  if (!menu || !panel) return null;
  const m = menu.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  return {
    placement: menu.dataset.ggMenuPlacement || menu.closest('.gg-comment-more')?.dataset.ggMenuPlacement,
    insideLeft: m.left >= p.left,
    insideRight: m.right <= p.right,
    insideTop: m.top >= p.top,
    insideBottom: m.bottom <= p.bottom
  };
})();
```

Expected:

```txt
insideLeft: true
insideRight: true
insideTop: true
insideBottom: true
```

---

## Problem 2 — More Menu Needs Icons and Danger Color

Current menu is too plain.

Expected:

```txt
🔗  Copy link
🗑  Delete comment
```

Use project icon system if available, preferably Material Symbols:

```txt
link
delete
```

### Required Visual

Copy link:

- link icon;
- normal text color;
- subtle hover background.

Delete comment:

- trash/delete icon;
- danger/red text;
- subtle red hover background.

### CSS Direction

```css
:root {
  --gg-danger: #ff6b6b;
  --gg-danger-soft: rgba(255, 107, 107, .12);
}

.gg-comment-more__item {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.gg-comment-more__item[data-gg-comment-action='delete'] {
  color: var(--gg-danger);
}

.gg-comment-more__item[data-gg-comment-action='delete']:hover,
.gg-comment-more__item[data-gg-comment-action='delete']:focus-visible {
  background: var(--gg-danger-soft);
}
```

Use actual selectors/attributes in the project.

### Rules

- Delete comment appears only when native Blogger delete affordance exists.
- Delete delegates to native Blogger delete.
- Do not invent delete permission.
- Do not remove native `.comment-delete` / `.item-control` from DOM.

---

## Problem 3 — Replies Sheet Needs Non-Sticky Parent Context Card

Parent context must be clearer, but it must not be sticky.

Do not add a third sticky layer. Sticky header + sticky composer are enough.

Expected:

```txt
handle
← Replies

Parent comment
[avatar] Pak RPP    May 14, 2026 at 1:12 AM
Tes komen level 1
5 replies

[reply list]
```

### Rules

- Parent context appears at the top of replies sheet.
- Parent context is not sticky.
- Parent context is compact.
- Parent context should feel like a subtle card/well, not a heavy card.
- Header remains sticky.
- Composer footer remains sticky.
- Parent context may scroll away.

### CSS Direction

```css
.gg-comment-replies__context {
  display: grid;
  gap: 6px;
  margin: 8px 0 10px;
  padding: 12px;
  border: 1px solid var(--gg-divider);
  border-radius: 16px;
  background: var(--gg-surface-quiet);
}

.gg-comment-replies__context::before {
  content: 'Parent comment';
  color: var(--gg-accent-soft);
  font: 650 10px/1.2 var(--gg-font-sans);
  letter-spacing: .08em;
  text-transform: uppercase;
}
```

If copy registry is used, prefer registry-driven text over hard-coded copy.

### Acceptance

- User immediately understands which parent comment the replies belong to.
- Parent context does not consume excessive viewport height.
- Parent context scrolls with content and is not sticky.

---

## Problem 4 — Reply Banner Needs Left Text + Right Cancel

Current reply banner should follow Instagram-like layout.

Expected:

```txt
Replying to @gaga                                      ×
[native Blogger composer]
```

### Rules

- Text is aligned left.
- Cancel `×` is aligned right.
- Cancel button must have `aria-label="Cancel reply"`.
- Banner appears only in reply mode.
- Banner and native composer must share the same active footer.
- Clicking `×` exits reply mode.
- Do not clear text inside Blogger iframe.

### CSS Direction

```css
.gg-comments__reply-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.gg-comments__reply-clear {
  justify-self: end;
}
```

### Acceptance

- `Replying to @Author` is on the left.
- `×` is on the right.
- Banner is not cramped.
- Banner does not detach from composer.

---

## Problem 5 — Load More Must Stay Functional and Quiet

`Load more...` is important for posts with many comments. Do not remove it.

### Purpose

Load more is native Blogger pagination/loading for comments beyond the initially rendered batch.

If removed incorrectly:

- older comments may become inaccessible;
- large threads may appear incomplete;
- user cannot read the full conversation.

### Rules

- Keep Load more functional.
- Style it as a quiet pill/button.
- Place it above the sticky footer.
- It must not appear between launcher and composer.
- It must not appear inside replies sheet unless replies pagination is explicitly supported.

Expected:

```txt
[comment list]

Load more...

[sticky footer]
```

---

## Problem 6 — Final Conversation Row Alignment

Rows must follow the conversation pattern:

```txt
[avatar] Author        Timestamp        …
         Body
         Reply
         View X replies
```

Rules:

- Header/body/actions align to the same content column.
- Avatar/content gap is natural and compact.
- Body is close to header.
- Reply is close to body.
- View replies is close to Reply.
- No large empty bands.
- Do not make rows card-like.

---

## Problem 7 — Native Composer Well Presentation

The native Blogger iframe remains unavoidable. Host it better.

Rules:

- Do not modify iframe internals.
- Style only wrapper/slot.
- Composer well should feel intentional.
- Do not clip Blogger Publish, account selector, Notify Me, or reCAPTCHA.
- Do not turn launcher into fake input.

Expected states:

Collapsed:

```txt
[Add comment]
```

Expanded:

```txt
Composer
[native Blogger iframe]
```

Reply:

```txt
Replying to @gaga                                      ×
[native Blogger iframe]
```

---

## Required Visual Proof Additions

Extend `GG.commentsProof()` or focused visual QA with:

```js
{
  moreMenuInsideSheet,
  moreMenuPlacement,
  moreMenuHasIcons,
  deleteMenuUsesDangerStyle,
  repliesParentContextCardVisible,
  repliesParentContextSticky,
  replyBannerSplitLayout,
  loadMoreFunctionalAndAboveFooter,
  composerWellVisibleWhenOpen
}
```

Expected:

```txt
moreMenuInsideSheet === true
moreMenuHasIcons === true
deleteMenuUsesDangerStyle === true
repliesParentContextCardVisible === true
repliesParentContextSticky === false
replyBannerSplitLayout === true
loadMoreFunctionalAndAboveFooter === true
```

---

## Required Screenshots

Capture:

1. Main comments sheet collapsed composer.
2. Main comments sheet expanded native composer.
3. Main comments sheet reply mode.
4. Replies sheet normal with parent context card.
5. Replies sheet reply mode.
6. More menu near top comment.
7. More menu near bottom/footer comment.
8. More menu with Copy link icon and Delete red icon.
9. 22-comment sheet with Load more above footer.
10. Zero-comment sheet.

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

If `npm run gaga:verify-sheet-contract` fails only due to store CSS drift, report it separately and do not treat it as comments failure.

---

## Acceptance Criteria

### More Menu

- Menu is collision-aware.
- Menu does not clip against header/footer/sheet edges.
- Menu uses icons.
- Delete uses danger color.
- Delete appears only when native delete exists.
- Copy link still works.

### Replies Sheet

- Parent context appears as a subtle non-sticky context card.
- Header remains sticky.
- Composer remains sticky.
- Parent context scrolls away with replies content.

### Reply Banner

- Text left, cancel right.
- Cancel button accessible.
- Banner and native composer share active footer.

### Load More

- Still functional.
- Quiet visual style.
- Above footer.
- Not mixed with composer/launcher.

### Composer

- Native iframe remains usable.
- No fake composer.
- Wrapper presentation is polished.

### Regression

- No composer in list.
- No duplicate launcher/composer.
- No vertical Reply.
- No raw native Replies label.
- Existing comments proof passes.
