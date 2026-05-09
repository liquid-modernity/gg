# GG Native Blogger Comments — Threads-like UI/UX Task Pack

## Final direction

Build a Threads-like comment experience while keeping Blogger as the only comment engine.

Blogger owns:
- comment data and threaded structure
- reply target and submission
- login/auth/moderation behavior
- delete permissions and native delete affordances
- composer iframe plumbing

GG owns:
- bottom sheet and replies sheet shell
- visual hierarchy, spacing, action menu, and motion
- focus/scroll behavior
- visual reply context banner
- visual `@Author` reply prefix
- copy link helper and native delete delegation
- QA proof diagnostics

## Non-negotiable native Blogger internals

Do not rename, remove, duplicate, or reimplement:
- `#comments`
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
- `data:post.commentHtml`

## UX target

Main comments sheet:
- shows top-level comments only
- each top-level comment shows `Lihat X balasan` / `View X replies`
- sticky native composer footer

Replies sheet:
- opens above main sheet for one parent comment
- shows parent context at top
- shows replies up to 3 visual levels
- uses the same native Blogger composer, portaled into active sheet footer

Reply behavior:
- user taps Reply on Author C
- composer banner says `Replying to @AuthorC`
- user only types `halo author c`
- after render, GG visually displays `@AuthorC halo author c`
- GG does not inject `@AuthorC` into Blogger iframe content
