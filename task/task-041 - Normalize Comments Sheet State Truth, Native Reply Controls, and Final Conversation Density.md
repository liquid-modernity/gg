# TASK-041 — Normalize Comments Sheet State Truth, Native Reply Controls, and Final Conversation Density

## Objective

Fix remaining post-TASK-040 contradictions and final UI polish issues in the native Blogger comments sheet.

TASK-040 improved composer placement, but live screenshots and rendered HTML still show:

- composer state contradiction: `data-gg-composer-open="false"` while native `#comment-editor` is visible;
- main comments sheet and replies sheet both marked active/open/aria-visible;
- native Blogger `thread-toggle/thread-count` appears as raw `Replies` label inside replies sheet;
- `.continue.gg-comment-inline-reply` is still treated like a generic native continue/load-more control, causing reply layout risks;
- comment row vertical density still feels too loose;
- zero/comment/reply modes need a single source of truth.

This task must not add new features. It must make the existing comments UI internally consistent, visually clean, and user-friendly.

---

## Hard Rules

Do not:

- create a fake composer;
- duplicate `#top-ce`;
- duplicate `#comment-editor`;
- create custom submit UI;
- inject text into the Blogger iframe;
- access iframe internals;
- fetch comments;
- poll comments;
- replace Blogger native reply behavior;
- replace Blogger native delete behavior;
- remove native Blogger controls from DOM permanently.

Keep native Blogger internals intact:

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

## Current Problems to Fix

### Problem 1 — Composer state contradiction

Observed rendered HTML:

```html
<footer data-gg-composer-open="false">
  ...
  <div id="top-ce">
    <iframe id="comment-editor" style="display: block;">

This is invalid state.

Rules:

If native composer is visible, data-gg-composer-open must be "true".
If data-gg-composer-open is "false", native composer slot/wrapper must not be visually visible.
The composer state must be derived from actual active footer visibility, not stale intent.

Acceptance check:

(() => {
  const footer = document.querySelector('.gg-comments__footer:not([hidden])');
  const editor = document.querySelector('#comment-editor');
  const editorVisible = !!editor &&
    getComputedStyle(editor).display !== 'none' &&
    editor.getBoundingClientRect().height > 0;

  return {
    composerOpen: footer?.dataset.ggComposerOpen,
    editorVisible
  };
})();

Expected:

editorVisible === true  => composerOpen === "true"
editorVisible === false => composerOpen === "false"
Problem 2 — Two sheets semantically active at once

Observed:

#gg-comments-sheet aria-hidden="false" data-gg-state="open" data-gg-active="true"
#gg-comment-replies-sheet aria-hidden="false" data-gg-state="open" data-gg-active="true"

This is not acceptable for dialog semantics.

Rules:

When replies sheet is active, main comments sheet may remain structurally open but must not be semantically active.
Only the foreground sheet may have data-gg-active="true".
Only the foreground dialog should be focus-active.
Background sheet should be inert or marked inactive.
Do not create two active aria-modal experiences at the same time.

Acceptance:

[...document.querySelectorAll('#gg-comments-sheet, #gg-comment-replies-sheet')]
  .map(sheet => ({
    id: sheet.id,
    state: sheet.dataset.ggState,
    active: sheet.dataset.ggActive,
    ariaHidden: sheet.getAttribute('aria-hidden'),
    inert: sheet.hasAttribute('inert')
  }));

Expected when replies sheet is active:

#gg-comment-replies-sheet active=true
#gg-comments-sheet active=false or inert=true / background=true
Problem 3 — Native thread toggle appears as raw “Replies”

Native Blogger thread controls are still visible in replies sheet:

<span class="thread-count"><a>Replies</a></span>

Rules:

Hide native .thread-toggle, .thread-count, .thread-arrow inside the replies sheet.
Use GG-owned section label for replies count/context.
Do not remove native nodes from DOM.
Do not let native Replies label appear as visual content in the replies list.

Expected visual:

Parent context
Pak RPP
Tes komen level 1
5 replies

[reply comments...]

Not:

Replies
[reply comments...]

CSS direction:

#gg-comment-replies-sheet .thread-toggle,
#gg-comment-replies-sheet .thread-count,
#gg-comment-replies-sheet .thread-arrow {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
}
Problem 4 — Inline reply controls need their own class behavior

In replies sheet, reply links may appear inside:

<div class="continue gg-comment-inline-reply">
  <a class="comment-reply">Reply</a>
</div>

This must not behave like load-more or thread continue.

Rules:

.gg-comment-inline-reply is an action-row control.
It must be styled like Reply, not like Load more, not like thread toggle.
It must live in the content column.
It must render horizontally.
It must not create vertical R e p l y.

CSS direction:

.gg-comments .gg-comment-inline-reply {
  grid-column: 2;
  display: inline-flex;
  width: max-content;
  min-width: 44px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  writing-mode: horizontal-tb;
}

.gg-comments .gg-comment-inline-reply a.comment-reply {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  white-space: nowrap;
  writing-mode: horizontal-tb;
}
Problem 5 — Load more and Add comment must be different concepts

Do not treat all .continue elements the same.

There are at least three different native control types:

top-level add comment:
#top-continue
inline reply:
.gg-comment-inline-reply
load more:
.loadmore

Rules:

#top-continue should be hidden/replaced by GG launcher.
.gg-comment-inline-reply should be visible as quiet text action.
.loadmore should be styled as a list row above footer.
Do not apply the same pill style to all .continue.

Acceptance:

({
  topContinueVisible: isVisible(document.querySelector('#top-continue')),
  inlineReplyVertical: [...document.querySelectorAll('.gg-comment-inline-reply')]
    .some(el => el.getBoundingClientRect().height > el.getBoundingClientRect().width),
  loadMoreInsideFooter: !!document.querySelector('.loadmore')?.closest('.gg-comments__footer')
});

Expected:

topContinueVisible: false
inlineReplyVertical: false
loadMoreInsideFooter: false
Problem 6 — Final density pass

Comment row must feel compact and conversation-like.

Rules:

Reduce excessive vertical gap.
Do not use 44px min-height as visible vertical spacing for Reply action.
Keep tap target through padding/container if needed, but visual rhythm must stay compact.
Body → Reply → View replies should be close.

Recommended CSS tokens:

.gg-comments {
  --gg-comment-pad-y: 10px;
  --gg-comment-body-gap: 4px;
  --gg-comment-action-gap: 8px;
}

.gg-comments .comment-block {
  gap: 4px;
}

.gg-comments .comment-actions,
.gg-comments .comment .comment-footer {
  margin-top: 0;
}

.gg-comments a.comment-reply {
  min-height: 30px;
}

.gg-comments [data-gg-action='comments-open-replies'] {
  min-height: 32px;
  margin-top: 0;
  margin-bottom: 6px;
}

Acceptance:

No large empty band between body and Reply.
No large empty band between Reply and View replies.
Main sheet shows more content per screen.
Replies sheet feels like a thread, not spaced cards.
Problem 7 — Zero/comment/reply mode naming cleanup

Avoid external duplicate copy.

Rules:

For zero comments, choose one external copy:
Post a comment
or No comments yet
Do not show Post a comment, Add comment, and Post a Comment as three external labels.
Native iframe internal text may remain.
External GG launcher/copy must not duplicate native iframe title if iframe is already open.

Acceptance:

[...document.querySelectorAll('#gg-comments-sheet, #gg-comment-replies-sheet')]
  .map(el => el.innerText)

Manual expectation:

no duplicate external Add comment / Post a Comment labels;
iframe labels are tolerated only if inside native iframe.
Required Proof Extension

Extend GG.commentsProof() or focused QA with:

{
  composerStateMatchesVisibility,
  onlyOneActiveSheet,
  nativeThreadToggleHiddenInReplies,
  inlineReplyVertical,
  topContinueVisible,
  loadMoreInsideFooter,
  excessiveVerticalGap,
  duplicateExternalComposerLabels
}

Expected:

composerStateMatchesVisibility === true
onlyOneActiveSheet === true
nativeThreadToggleHiddenInReplies === true
inlineReplyVertical === false
topContinueVisible === false
loadMoreInsideFooter === false
excessiveVerticalGap === false
duplicateExternalComposerLabels === false
Live Test URLs

Test:

0 comments:
https://www.pakrpp.com/2026/05/foldable-reusable-bag.html

2 comments:
https://pakrpp.com/2026/05/desk-tray-organizer.html

22 comments:
https://www.pakrpp.com/2026/02/you-ready-one-to-explore.html
Required Screenshots

Capture:

Main comments sheet collapsed composer.
Main comments sheet expanded native composer.
Main comments sheet after clicking Reply.
Replies sheet normal state.
Replies sheet after clicking Reply.
Zero-comment state.
22-comment state with load-more.
Required Commands

Run:

node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack

If npm run gaga:verify-sheet-contract fails only due to store CSS drift, report it separately and do not treat it as comments failure.

Acceptance Criteria
State Truth
Composer open state matches actual native composer visibility.
Only one sheet is semantically active.
Replies sheet foreground state does not leave main sheet active.
Composer
Exactly one #top-ce.
Exactly one #comment-editor.
Native composer remains in active footer.
Reply banner and composer share the same footer.
No fake composer.
Native Controls
Native thread toggle/count are not visually exposed in replies sheet.
Inline reply controls are horizontal.
Top-level native add-comment control is hidden/replaced by GG launcher.
Load more is distinct from reply controls.
Visual Density
Compact conversation rows.
No vertical Reply.
No excessive empty bands.
View replies trigger sits close to action row.
Zero State
No duplicate external labels.
Native Blogger composer remains usable.