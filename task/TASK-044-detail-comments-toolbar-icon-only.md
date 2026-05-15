# TASK-044 — Refine Detail Comments Toolbar to Icon-Only Button with Dynamic Badge and Semantic Label

## Objective

Refine the post detail comments toolbar button.

Current UI is visually poor because it stacks:

```txt
7
comment icon
Comments
```

The new toolbar must be icon-only with a dynamic badge:

- `0 comments` → show `add_comment` icon, no badge.
- `1+ comments` → show `comment` icon with count badge.
- comments disabled → show `comments_disabled` icon, no badge.
- visible text label `Comments` must be removed from the visual UI.
- semantic/accessibility text must remain available.

This is a toolbar UI polish task only.

---

## Current Markup

Current toolbar:

```html
<div aria-labelledby="gg-detail-toolbar-title" class="gg-detail-toolbar" role="toolbar">
  <span class="gg-visually-hidden" data-gg-copy="detail.toolbar" id="gg-detail-toolbar-title">
    Detail actions
  </span>

  <button aria-controls="gg-comments-sheet"
          aria-expanded="false"
          class="gg-detail-toolbar__action"
          data-gg-action="comments-open"
          type="button"
          aria-label="Comments">
    <span class="gg-detail-toolbar__count" id="gg-detail-comments-count">7</span>
    <span aria-hidden="true" class="gg-icon">comment</span>
    <span data-gg-copy="comments.launch" id="gg-detail-comments-label">Comments</span>
  </button>
</div>
```

---

## Required Behavior

### State 1 — Zero Comments

If comment count is `0` and comments are enabled:

```txt
icon: add_comment
badge: hidden
visible label: hidden
aria-label: "Add comment"
```

Expected visual:

```txt
[ add_comment icon ]
```

---

### State 2 — One or More Comments

If comment count is greater than `0` and comments are enabled:

```txt
icon: comment
badge: visible
badge text: count
visible label: hidden
aria-label: "7 comments"
```

Expected visual:

```txt
[ comment icon + badge 7 ]
```

Badge placement:

```txt
top-right corner of icon button
```

---

### State 3 — Comments Disabled

If comments are disabled:

```txt
icon: comments_disabled
badge: hidden
visible label: hidden
aria-label: "Comments disabled"
```

Expected visual:

```txt
[ comments_disabled icon ]
```

Button may remain visible but should not open a writable composer if comments are truly disabled. It may open a read-only comments sheet or show disabled state depending on current architecture.

---

## Hard Rules

Do not:

- remove the toolbar;
- remove accessible text;
- rely only on visual icon;
- create fake comment count;
- fetch comments;
- change Blogger native comments engine;
- change comments sheet behavior except the button state/open behavior if needed.

Keep:

- `aria-controls="gg-comments-sheet"` when the sheet can open;
- `aria-expanded`;
- `data-gg-action="comments-open"` if button remains interactive;
- `role="toolbar"`;
- hidden toolbar title.

---

## Markup Direction

Update button markup to support icon-only rendering.

Recommended structure:

```html
<button aria-controls="gg-comments-sheet"
        aria-expanded="false"
        class="gg-detail-toolbar__action gg-detail-toolbar__action--comments"
        data-gg-action="comments-open"
        data-gg-comments-state="has-comments"
        data-gg-comments-count="7"
        type="button"
        aria-label="7 comments"
        title="7 comments">

  <span aria-hidden="true"
        class="gg-icon gg-detail-toolbar__comments-icon"
        data-gg-comments-icon="1">comment</span>

  <span aria-hidden="true"
        class="gg-detail-toolbar__count"
        id="gg-detail-comments-count">7</span>

  <span class="gg-visually-hidden"
        data-gg-copy="comments.launch"
        id="gg-detail-comments-label">7 comments</span>
</button>
```

For zero comments:

```html
<button data-gg-comments-state="empty"
        data-gg-comments-count="0"
        aria-label="Add comment"
        title="Add comment">
  <span class="gg-icon" aria-hidden="true">add_comment</span>
  <span class="gg-detail-toolbar__count" hidden>0</span>
  <span class="gg-visually-hidden">Add comment</span>
</button>
```

For disabled comments:

```html
<button data-gg-comments-state="disabled"
        aria-label="Comments disabled"
        title="Comments disabled">
  <span class="gg-icon" aria-hidden="true">comments_disabled</span>
  <span class="gg-detail-toolbar__count" hidden>0</span>
  <span class="gg-visually-hidden">Comments disabled</span>
</button>
```

---

## Required JS Logic

Wherever the toolbar is hydrated, derive:

```txt
commentCount
commentsEnabled / commentsDisabled
```

Then set:

```js
button.dataset.ggCommentsCount = String(commentCount);
button.dataset.ggCommentsState =
  commentsDisabled ? 'disabled' :
  commentCount > 0 ? 'has-comments' :
  'empty';
```

Set icon text:

```js
icon.textContent =
  commentsDisabled ? 'comments_disabled' :
  commentCount > 0 ? 'comment' :
  'add_comment';
```

Set badge:

```js
if (commentCount > 0 && !commentsDisabled) {
  badge.hidden = false;
  badge.textContent = String(commentCount);
} else {
  badge.hidden = true;
  badge.textContent = '';
}
```

Set accessible label:

```js
const label =
  commentsDisabled ? 'Comments disabled' :
  commentCount > 0 ? `${commentCount} comments` :
  'Add comment';

button.setAttribute('aria-label', label);
button.setAttribute('title', label);
hiddenLabel.textContent = label;
```

---

## Required CSS

### Icon-only comments toolbar button

```css
.gg-detail-toolbar__action--comments {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: 999px;
}
```

### Hide visual text label but keep semantic text

If the existing `#gg-detail-comments-label` remains in markup, make it visually hidden:

```css
#gg-detail-comments-label {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

Prefer using existing `.gg-visually-hidden`.

### Badge

```css
.gg-detail-toolbar__action--comments .gg-detail-toolbar__count {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--gg-accent);
  color: var(--gg-accent-contrast);
  font: 700 10px/1 var(--gg-font-sans);
  pointer-events: none;
}

.gg-detail-toolbar__action--comments .gg-detail-toolbar__count[hidden] {
  display: none !important;
}
```

### Disabled state

```css
.gg-detail-toolbar__action--comments[data-gg-comments-state='disabled'] {
  opacity: .72;
}

.gg-detail-toolbar__action--comments[data-gg-comments-state='disabled'] .gg-icon {
  color: var(--gg-accent-soft);
}
```

---

## Accessibility Requirements

- Button must have meaningful `aria-label`.
- Hidden text must remain in DOM.
- Icon must be `aria-hidden="true"`.
- Badge must be `aria-hidden="true"` because count is already included in `aria-label`.
- `aria-expanded` must update when comments sheet opens/closes.
- Disabled comments state must not mislead screen reader users.

Expected labels:

```txt
0 comments enabled: "Add comment"
7 comments enabled: "7 comments"
comments disabled: "Comments disabled"
```

---

## SEO / Semantic Requirement

Do not worry about visible text label removal.

Search engines and assistive tech can still read:

- `aria-label`;
- visually hidden text;
- structured page content;
- native Blogger comment markup.

The visible toolbar does not need the word `Comments` on screen.

Required:

```html
<span class="gg-visually-hidden">7 comments</span>
```

or equivalent must remain.

---

## Required Visual Proof Additions

Extend proof/QA if available with:

```js
{
  toolbarCommentsIconOnly,
  toolbarCommentsBadgeVisibleWhenCountPositive,
  toolbarCommentsBadgeHiddenWhenZero,
  toolbarCommentsUsesAddIconWhenZero,
  toolbarCommentsUsesDisabledIconWhenDisabled,
  toolbarCommentsSemanticLabelPresent,
  toolbarCommentsVisibleTextHidden
}
```

Expected:

```txt
toolbarCommentsIconOnly === true
toolbarCommentsSemanticLabelPresent === true
toolbarCommentsVisibleTextHidden === true
```

---

## Acceptance Criteria

### Visual

- Toolbar comments button shows only icon.
- No visible `Comments` text label.
- No stacked `7 / icon / Comments` layout.
- Count badge appears only when count > 0.
- Badge is small and attached to top-right of icon button.
- Zero comments shows `add_comment` icon without badge.
- Disabled comments shows `comments_disabled` icon without badge.

### Behavior

- Clicking enabled button still opens comments sheet.
- `aria-expanded` updates correctly.
- Disabled state does not open a writable composer unless comments are actually enabled.
- Comment count still updates if current system updates it.

### Accessibility

- `aria-label` is correct for each state.
- Hidden semantic label exists.
- Icon is `aria-hidden`.
- Badge does not duplicate screen reader output.

### Regression

- Comments sheet still opens.
- Native Blogger composer remains intact.
- No comment engine code is changed.
- Existing comments proof passes.
