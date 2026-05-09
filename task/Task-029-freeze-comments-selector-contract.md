# Task 029 — Freeze native Blogger comments sheet selector contract

## Objective

Freeze the final selector contract for the comments system before any visual or JS enhancement continues.

The current codebase has legacy right-panel naming and newer bottom-sheet naming mixed together. This task must make the bottom-sheet contract the primary contract while preserving legacy support only as a temporary bridge.

## Target files

- `index.xml`
- `gg-app.dev.css`
- `gg-app.dev.js`
- any comment-specific JS module if present
- comment documentation files if they are tracked in the repo

## Final official selectors

Use these as the primary contract:

```txt
#gg-comments-sheet
.gg-comments-sheet
[data-gg-sheet="comments"]
#gg-comments-root
#gg-comments-list
#gg-comments-footer
#gg-comments-reply-slot
#gg-comments-composer-slot
#gg-comments-composer
[data-gg-action="comments-open"]
[data-gg-action="comments-close"]
[data-gg-action="comments-open-composer"]
```

Legacy selectors may remain only as compatibility bridges:

```txt
#ggPanelComments
.gg-comments-panel
[data-gg-panel="comments"]
#cmt2-holder
#gg-addslot
#gg-composer-slot
[data-gg-postbar="comments"]
```

## Native Blogger internals that must remain untouched

Do not rename, remove, duplicate, or recreate:

```txt
#comments
li.comment
.comment-thread
.comment-replies
.thread-toggle
.thread-count
.item-control
.comment-delete
.goog-toggle-button
#top-ce
#comment-editor-src
#comment-editor
BLOG_CMT_createIframe(...)
data:post.cmtfpIframe
data:post.commentHtml
```

## Implementation notes

1. Update all primary XML/CSS/JS references to the official selector contract.
2. Keep a small compatibility resolver in JS during migration:

```js
function getCommentsSheet(root = document) {
  return root.querySelector('#gg-comments-sheet, #ggPanelComments, #gg-comments-panel, [data-gg-sheet="comments"], [data-gg-panel="comments"]');
}
```

3. Do not introduce sort, width toggle, feed fallback, or custom comment engine in this task.
4. Add comments in code stating that legacy selectors are temporary migration bridges.

## Acceptance criteria

- A single primary comments sheet exists on post pages.
- `#gg-comments-sheet` is the preferred selector.
- `#comments` remains only as Blogger/hash compatibility anchor, not the GG-owned shell.
- No duplicate `#comment-editor` exists.
- No duplicate `#comments` exists.
- Existing toolbar/comment buttons can open the comments sheet.
- Legacy selector support does not become the new official contract.
