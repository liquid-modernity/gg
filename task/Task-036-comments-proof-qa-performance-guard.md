# Task 036 — Add comments proof, QA smoke, and performance guard

## Objective

Add a lightweight proof/smoke system that verifies the native Blogger comments UI is structurally valid after the migration.

## Target files

- `gg-app.dev.js`
- QA scripts if present
- package scripts if present
- documentation if tracked

## Required browser proof function

Expose a development-safe diagnostic function:

```js
window.GG = window.GG || {};
window.GG.commentsProof = function commentsProof() {
  const sheet = document.querySelector('#gg-comments-sheet, #gg-comments-panel, #ggPanelComments');
  const root = document.querySelector('#gg-comments-root, #comments');
  const list = document.querySelector('#gg-comments-list, #comment-holder, #cmt2-holder');
  const editor = document.querySelector('#comment-editor');
  const editorSrc = document.querySelector('#comment-editor-src');
  const composer = document.querySelector('#top-ce');

  const result = {
    sheet: !!sheet,
    root: !!root,
    list: !!list,
    editor: !!editor,
    editorSrc: !!editorSrc,
    composer: !!composer,
    commentsRootCount: document.querySelectorAll('#comments').length,
    editorCount: document.querySelectorAll('#comment-editor').length,
    nativeDeleteCount: document.querySelectorAll('.item-control, .comment-delete, .goog-toggle-button').length,
    replyStructureCount: document.querySelectorAll('.comment-replies, .thread-toggle, .thread-count').length,
  };

  result.ok = !!(
    result.sheet &&
    result.root &&
    result.list &&
    result.editorCount <= 1 &&
    result.commentsRootCount <= 1
  );

  document.documentElement.setAttribute('data-gg-comments-proof', result.ok ? 'ok' : 'fail');
  document.documentElement.setAttribute('data-gg-comments-proof-count', String(Object.values(result).filter(v => v === false).length));

  return result;
};
```

## Required checks

Verify:

```txt
- one comments sheet
- one comments root/hash anchor
- one native composer iframe
- native comment list exists
- native delete controls are preserved when available
- reply structures are preserved
- no fallback composer is treated as real submit
```

## Manual QA checklist

Run on a post with comments enabled:

```txt
1. Open comments sheet from toolbar/dock.
2. Close via handle, scrim, close action, Escape.
3. Open via #comments hash.
4. Open a top-level comment's replies sheet.
5. Reply to level 1, level 2, and level 3 comments.
6. Confirm banner says Replying to @DirectParent.
7. Submit a reply using Blogger iframe.
8. Confirm visual @ prefix appears after render.
9. Copy comment link from More menu.
10. Delete appears only when Blogger native delete exists.
11. Close replies sheet and confirm DOM is restored.
12. Reopen comments and ensure no duplicate iframe exists.
```

## Performance guard

Do not allow:

```txt
- polling comments feed
- loading fallback feed on initial render
- more than one MutationObserver running indefinitely
- duplicate comment enhancement listeners after route swaps
- layout-thrashing loops during sheet open
```

## Acceptance criteria

- `GG.commentsProof().ok === true` on valid post pages.
- No uncaught errors on listing, page, and 404 surfaces.
- Initial comments enhancement does not block first render.
- Comments enhancement runs only on comments interaction/hash or post page hydration.
