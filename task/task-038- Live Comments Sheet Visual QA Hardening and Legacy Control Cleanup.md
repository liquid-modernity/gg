# TASK-038 — Live Comments Sheet Visual QA Hardening and Legacy Control Cleanup

## Objective

Harden the live visual behavior of the native Blogger comments sheet after TASK-037.

TASK-037 repaired the main architecture. TASK-038 must not introduce new features. It must verify and polish the live UI across three real comment states:

1. zero comments;
2. normal comments with replies;
3. many comments with load-more.

The comment engine must remain Blogger-native.

---

## Context

TASK-037 already implemented:

- main sheet reply containment;
- replies sheet;
- sticky native composer footer;
- `empty`, `comment`, and `reply` composer modes;
- reply banner: `Replying to @AuthorName ×`;
- native delete hidden from primary row but preserved in DOM;
- More menu delegation;
- no fake composer.

This task is a live visual QA and CSS hardening pass.

---

## Hard Rules

Do not rewrite the comments architecture.

Do not:

- create a fake comment composer;
- create a custom textarea for actual submission;
- create a custom send/publish button for actual submission;
- duplicate `#comment-editor`;
- fetch comments;
- poll comments;
- replace Blogger native reply;
- replace Blogger native delete;
- remove `.comment-delete`, `.item-control`, or `.goog-toggle-button` from DOM;
- inject `@AuthorName` into the Blogger iframe.

Keep these Blogger-native internals intact:

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

---

## Live URLs to Verify

Use these three live posts:

```txt
0 comments:
https://www.pakrpp.com/2026/05/foldable-reusable-bag.html

2 comments:
https://pakrpp.com/2026/05/desk-tray-organizer.html

22 comments:
https://www.pakrpp.com/2026/02/you-ready-one-to-explore.html