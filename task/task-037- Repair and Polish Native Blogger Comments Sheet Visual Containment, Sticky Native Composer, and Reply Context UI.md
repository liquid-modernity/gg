# TASK-037 — Repair and Polish Native Blogger Comments Sheet Visual Containment, Sticky Native Composer Modes, and Reply Context UI

## Objective

Repair the visual containment and UI/UX of the native Blogger comments system after Tasks 029–036.

The comments system must remain Blogger-native, but the visible experience must feel like a modern Threads/Instagram-style conversation sheet:

- Main comments sheet shows only top-level comments.
- Replies are opened in a dedicated replies sheet.
- The native Blogger composer is always available from the sticky footer of the active sheet.
- The native Blogger composer has three UI modes:
  1. empty-state post comment;
  2. add top-level comment;
  3. reply to comment.
- Reply mode shows a footer banner: `Replying to @AuthorName ×`.
- Native Blogger internals remain untouched and functional.

This is a repair/polish task, not a rewrite.

---

## Current Problems Observed

1. Nested reply avatar/body leaks into the main comments sheet after `View X replies`.
2. Native inline `Add comment` / `.continue` appears inside comment rows near timestamp/body.
3. Native `Delete` appears as a primary row action, even though delete should be exposed through GG More menu.
4. GG More button can fall onto its own row instead of staying aligned with author/timestamp.
5. Native `Load more...` appears visually unstyled.
6. Composer footer behavior must be unified for:
   - empty comment state;
   - new top-level comment;
   - reply to top-level comment;
   - reply to level-1, level-2, or level-3 comment.
7. Reply context must appear above the native composer as:
   - `Replying to @AuthorName ×`
   - only when replying.
8. The visual `@AuthorName` prefix after posting must be UI-only, not injected into Blogger iframe text.
9. The footer composer must not become a fake custom textarea/send system.

---

## Hard Architecture Rules

Do not violate these rules.

### Blogger remains the native comment engine

Do not remove, rename, replace, or fake these native Blogger internals:

- `data:post.commentHtml`
- `li.comment`
- `.comment-thread`
- `.comment-replies`
- `.thread-toggle`
- `.thread-count`
- `.item-control`
- `.comment-delete`
- `.goog-toggle-button`
- `#top-ce`
- `#comment-editor-src`
- `#comment-editor`
- `BLOG_CMT_createIframe(...)`
- `data:post.cmtfpIframe`

### No fake comment engine

Do not:

- fetch comments;
- poll comments;
- create a second comment editor;
- create a fake submit flow;
- inject text into the Blogger iframe;
- clone native comment nodes for active reply/delete behavior;
- permanently remove native delete controls from DOM;
- create a custom textarea as the actual submit composer;
- create a custom Send/Publish button as the actual submit action;
- replace Blogger account, Notify Me, reCAPTCHA, or Publish controls.

### One composer only

There must be only one native Blogger composer:

- `#top-ce`
- `#comment-editor-src`
- `#comment-editor`

The same composer may be visually portaled/moved into the footer of the currently active sheet, but do not duplicate it.

---

## Native Blogger Composer Reality Check

The footer composer must **not** be implemented as a fake custom input.

Any visual mockup text such as:

```txt
[avatar] Add comment... Send
[avatar] Add a reply... Send