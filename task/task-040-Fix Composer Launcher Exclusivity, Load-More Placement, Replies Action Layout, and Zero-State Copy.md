# TASK-040 — Lock Native Blogger Composer to Active Sticky Footer, Fix Reply Layout, Load-More Ownership, and Sheet Density

## Objective

Fix the remaining live visual failures after TASK-039.

TASK-039 fixed sheet layering, but live screenshots still show:

- native Blogger composer leaking into comment/reply list;
- reply banner detached from the native composer;
- duplicate `Add comment` launcher and native composer visible together;
- `Load more...` appearing between footer/composer layers;
- reply/action text rendering vertically;
- comment rows having excessive vertical whitespace;
- replies sheet header missing the same sheet handle affordance as the main comments sheet;
- zero-comment state showing duplicate/conflicting comment labels.

This task must lock the single native Blogger composer to the active sticky footer, make launcher/composer mutually exclusive, fix load-more placement, fix reply/action row layout, tighten comment density, and normalize sheet headers.

This is not a new feature task.

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
- replace Blogger native reply;
- replace Blogger native delete;
- remove native Blogger controls from DOM.

Keep these native Blogger internals intact:

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

## Current Visual Failures

### Failure 1 — Native Blogger composer leaks into comment list

Observed:

```txt
Replies list
Reply
[native Blogger iframe composer appears inside the thread/list]
...
Replying to @Author ×

Expected:

Replies list
...
────────────────────────
Replying to @Author ×
[native Blogger iframe composer]

The native composer must never visually appear inside a comment row, comment thread, reply body, or scrollable comments list.

Failure 2 — Reply banner detached from composer

Observed:

[native composer iframe appears in list]
...
Replying to @Author × appears at bottom

Expected:

Replying to @Author ×
[native Blogger iframe composer]

Reply banner and native composer must be siblings inside the same active sticky footer.

Failure 3 — Duplicate composer affordances

Observed:

Add comment
Load more...
Add comment
Replying to @Author ×
[native Blogger composer]

Expected collapsed state:

Add comment

Expected expanded comment state:

[native Blogger composer]

Expected reply state:

Replying to @Author ×
[native Blogger composer]

Launcher and native composer must not be visible at the same time.

Failure 4 — Reply/action text renders vertically

Observed:

R
e
p
l
y

or:

R
e
p
l
i
e
s

Expected:

Reply

Reply/action controls must stay horizontal under the comment body, not inside the thread-guide column.

Failure 5 — Load more appears between footer/composer layers

Observed:

Add comment
Load more...
Add comment
[native composer]

Expected:

[comment list]

Load more comments

[sticky footer]
Add comment OR native composer
Failure 6 — Comment row vertical spacing is too loose

Observed:

Author      Timestamp      …

Comment body


Reply


View 1 reply

Expected:

Author      Timestamp      …
Comment body
Reply
View 1 reply

Rows should feel like a calm conversation list, not sparse cards.

Failure 7 — Reply action looks like an unwanted chip

Observed:

[ Reply ]

Expected default state:

Reply

The Reply action should be quiet text by default, with background only on hover/focus/active if needed.

Failure 8 — Replies sheet header lacks sheet handle

Observed:

← Replies

Expected:

      ─────
←     Replies

Replies sheet is still a sheet. It must have the same drag/handle affordance as the main comments sheet.

Failure 9 — Zero-comment state has duplicate microcopy

Observed:

Post a comment
Add comment
Post a Comment
[native composer]

Expected one clean external state, for example:

Post a comment
[native Blogger composer]

or:

No comments yet
Be the first to add one.
Add comment

Do not show multiple competing external labels.

Required Fix 1 — Composer Must Always Be Portaled to Active Sticky Footer

Blogger may generate or move the native reply composer near the comment being replied to, for example:

.comment-replybox-thread#top-ce

GG must adopt this generated/native composer back into the active sticky footer.

Rules:

The single native composer must live visually inside the active footer.
If Blogger moves #top-ce into a comment row, GG must move it back into:
main comments footer when main sheet is active;
replies footer when replies sheet is active.
The composer must not remain visible inside:
.comment;
.comment-thread;
.comment-replies;
#gg-comments-list;
#gg-comment-replies-list.
Do not duplicate #top-ce.
Do not duplicate #comment-editor.

Acceptance check:

({
  topCeCount: document.querySelectorAll('#top-ce').length,
  editorCount: document.querySelectorAll('#comment-editor').length,
  topCeInsideFooter: !!document.querySelector('#top-ce')?.closest('.gg-comments__footer'),
  topCeInsideComment: !!document.querySelector('#top-ce')?.closest('li.comment, .comment-thread, .comment-replies'),
  topCeInsideMainList: !!document.querySelector('#top-ce')?.closest('#gg-comments-list'),
  topCeInsideRepliesList: !!document.querySelector('#top-ce')?.closest('#gg-comment-replies-list')
});

Expected:

topCeCount: 1
editorCount: 1
topCeInsideFooter: true
topCeInsideComment: false
topCeInsideMainList: false
topCeInsideRepliesList: false
Required Fix 2 — Reply Banner and Composer Must Share Same Footer

In reply mode, footer structure must be equivalent to:

.gg-comments__footer[data-gg-comment-composer-mode="reply"]
  .gg-comments__reply-banner
  #gg-comments-composer-slot
    #top-ce
      #comment-editor

Rules:

Reply banner must be immediately above the native composer.
Reply banner must not appear detached below the sheet while composer is elsewhere.
Clicking × exits reply mode but must not destroy the native composer.
Reply mode target must be the direct comment being replied to.

Acceptance check:

({
  mode: document.querySelector('.gg-comments__footer[data-gg-comment-composer-mode="reply"]')?.dataset.ggCommentComposerMode,
  bannerFooter: document.querySelector('.gg-comments__reply-banner')?.closest('.gg-comments__footer')?.id || null,
  composerFooter: document.querySelector('#top-ce')?.closest('.gg-comments__footer')?.id || null
});

Expected:

bannerFooter === composerFooter
Required Fix 3 — Launcher and Native Composer Must Be Mutually Exclusive

Add or repair explicit composer open state.

Example:

<footer class="gg-comments__footer"
        data-gg-comment-composer-mode="comment"
        data-gg-composer-open="false">

When native composer is visible:

data-gg-composer-open="true"

Rules:

If data-gg-composer-open="true", hide the launcher button.
If data-gg-composer-open="false", hide the native composer slot/wrapper.
Reply mode should normally imply composer open unless intentionally collapsed.
Never show launcher and native composer at the same time.
Never show more than one visible Add comment launcher in the active sheet.

CSS direction:

.gg-comments__footer[data-gg-composer-open="true"]
[data-gg-action="comments-open-composer"] {
  display: none !important;
}

.gg-comments__footer[data-gg-composer-open="false"]
#gg-comments-composer-slot {
  display: none !important;
}

Adjust selectors to actual DOM.

Acceptance check:

[...document.querySelectorAll('.gg-comments__footer')]
  .filter(el => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
           cs.visibility !== 'hidden' &&
           el.getBoundingClientRect().height > 0;
  })
  .map(footer => ({
    mode: footer.dataset.ggCommentComposerMode,
    open: footer.dataset.ggComposerOpen,
    visibleLaunchers: [...footer.querySelectorAll('[data-gg-action="comments-open-composer"]')]
      .filter(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0).length,
    visibleComposer: !!footer.querySelector('#top-ce') &&
      getComputedStyle(footer.querySelector('#top-ce')).display !== 'none' &&
      footer.querySelector('#top-ce').getBoundingClientRect().height > 0
  }));

Expected:

if visibleComposer === true, visibleLaunchers === 0;
if visibleLaunchers > 0, visibleComposer === false.
Required Fix 4 — Move Load More Into Scrollable Comment Content, Never Footer

Load more... belongs to comment content, not footer.

Rules:

Load more must be inside:
.gg-comments__content, #gg-comments-list, or equivalent scrollable content container.
Load more must not be inside:
.gg-comments__footer;
composer wrapper;
reply banner area.
Load more must be above the sticky footer.
Load more must be hidden while replies sheet is active unless replies pagination is explicitly supported.
It must not appear between launcher and native composer.

Acceptance check:

[...document.querySelectorAll('#gg-comments-sheet *')]
  .filter(el => /load more/i.test(el.textContent || ''))
  .map(el => ({
    insideContent: !!el.closest('.gg-comments__content, #gg-comments-list'),
    insideFooter: !!el.closest('.gg-comments__footer'),
    visible: getComputedStyle(el).display !== 'none' &&
             getComputedStyle(el).visibility !== 'hidden' &&
             el.getBoundingClientRect().height > 0
  }));

Expected for visible load-more:

insideContent: true
insideFooter: false
Required Fix 5 — Fix Reply/Action Row Vertical Text

All reply/action controls must render horizontally.

Affected controls may include:

a.comment-reply
.comment-actions
.comment-footer
.continue
.thread-toggle
generated GG reply buttons
moved native reply controls

Rules:

Action controls must occupy the content column, not thread-guide column.
Action controls must use horizontal writing mode.
Action controls must have sufficient width.
Do not allow text to wrap one letter per line.
Thread guide must remain decorative.
If a control is inside the wrong DOM container, move it to the comment content column.

CSS direction:

#gg-comment-replies-sheet .comment-actions,
#gg-comment-replies-sheet .comment .comment-footer,
#gg-comment-replies-sheet a.comment-reply,
#gg-comment-replies-sheet .continue,
#gg-comment-replies-sheet .thread-toggle,
#gg-comments-sheet .comment-actions,
#gg-comments-sheet .comment .comment-footer,
#gg-comments-sheet a.comment-reply {
  grid-column: 2;
  min-width: 0;
  width: auto;
  max-width: 100%;
  white-space: nowrap;
  writing-mode: horizontal-tb;
  word-break: normal;
}

Acceptance check:

[...document.querySelectorAll('#gg-comment-replies-sheet a.comment-reply, #gg-comment-replies-sheet .thread-toggle, #gg-comment-replies-sheet .continue')]
  .filter(el => getComputedStyle(el).display !== 'none' &&
                getComputedStyle(el).visibility !== 'hidden' &&
                el.getBoundingClientRect().height > 0)
  .map(el => {
    const rect = el.getBoundingClientRect();
    return {
      text: el.textContent.trim(),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      writingMode: getComputedStyle(el).writingMode,
      whiteSpace: getComputedStyle(el).whiteSpace
    };
  });

Expected:

writingMode: horizontal-tb
width > height
text is not split vertically
Required Fix 6 — Tighten Comment Row Visual Density

Comment rows must be compact, calm, and conversation-like.

Current bad spacing:

Author      Timestamp      …

Comment body


Reply


View 1 reply

Expected:

Author      Timestamp      …
Comment body
Reply
View 1 reply

Rules:

Do not create large vertical gaps between:
author/timestamp row;
comment body;
Reply action;
View replies trigger.
Keep readability, but remove excessive empty vertical space.
Avoid card-like spacing.
Use row-based conversation layout.
Main sheet and replies sheet should both use compact density.
View X replies should not float far below the Reply action.

Recommended direction:

.gg-comments {
  --gg-comment-pad-y: 12px;
  --gg-comment-body-gap: 5px;
  --gg-comment-action-gap: 8px;
}

.gg-comments .comment-block {
  gap: 5px;
}

.gg-comments .comment-actions,
.gg-comments .comment .comment-footer {
  margin-top: 0;
}

.gg-comments [data-gg-action='comments-open-replies'] {
  margin-top: 2px;
  margin-bottom: 8px;
}

Adjust actual values after visual testing.

Acceptance:

Comment body appears close to author row.
Reply action appears close to comment body.
View replies trigger appears close to Reply action.
No large empty band exists between comment body, Reply, and View replies.
The row feels like a conversation item, not a spaced-out card.
Required Fix 7 — Make Reply Action a Quiet Text Action

The Reply action should not look like a permanent filled chip.

Default expected:

Reply

Rules:

Reply action should be quiet text by default.
Do not show a filled pill/chip background in default state.
Background may appear only on hover, focus-visible, or active press state.
Reply action must remain tappable.
Use hit-area padding or container spacing without making it visually heavy.

CSS direction:

.gg-comments a.comment-reply,
.gg-comments .comment-actions a {
  background: transparent;
  border-radius: 0;
  min-height: 32px;
  padding: 0;
}

.gg-comments a.comment-reply:hover,
.gg-comments a.comment-reply:focus-visible {
  background: var(--gg-comment-action-hover-bg);
  border-radius: 10px;
  padding-inline: 8px;
}

Acceptance:

Reply does not look like a permanent button/chip.
Reply remains tappable.
Hover/focus style still exists.
No vertical Reply text.
Required Fix 8 — Replies Sheet Header Must Have Sheet Handle

The replies sheet is still a sheet, not a regular page.

Expected:

      ─────
←     Replies

Rules:

Replies sheet head must include a small centered handle.
Handle style must match the main .gg-sheet__handle.
Back button remains available.
Title remains centered or visually balanced.
Header height should not become bulky.
Header must stay sticky at top of replies sheet.
Handle must not interfere with the back button tap area.
Main comments sheet and replies sheet must feel like the same sheet system.

Markup direction:

<header class="gg-sheet__head gg-comments-sheet__head">
  <button class="gg-sheet__handle" type="button" aria-label="Drag sheet"></button>
  <button class="gg-comments-sheet__back" type="button">←</button>
  <h2>Replies</h2>
</header>

Use actual project markup, but preserve this behavior.

Acceptance:

Main comments sheet and replies sheet both show the sheet handle.
Replies sheet back button still works.
Replies sheet header does not overlap content.
Header remains sticky.
Header is visually consistent with comments sheet.
Required Fix 9 — Normalize Zero-Comment State

Zero-comment state must not show duplicate external labels.

Bad:

Post a comment
Add comment
Post a Comment
[native composer]

Acceptable:

Post a comment
[native Blogger composer]

or:

No comments yet
Be the first to add one.
Add comment

Rules:

Do not show multiple external action labels.
Native iframe labels may remain because they are Blogger-owned.
Prefer one calm external label only.
Do not hide Blogger iframe internals.
Do not create fake submit UI.
Required Fix 10 — Extend Visual Proof

Extend GG.commentsProof() or focused visual proof to catch:

{
  topCeInsideFooter,
  topCeInsideComment,
  bannerFooterMatchesComposerFooter,
  composerLauncherConflict,
  visibleAddCommentControls,
  loadMoreInsideFooter,
  replyActionsVertical,
  zeroStateDuplicateLabels,
  excessiveCommentVerticalGap,
  repliesSheetHasHandle
}

Acceptance:

topCeInsideFooter === true
topCeInsideComment === false
bannerFooterMatchesComposerFooter === true
composerLauncherConflict === false
visibleAddCommentControls <= 1
loadMoreInsideFooter === false
replyActionsVertical === false
zeroStateDuplicateLabels === false
excessiveCommentVerticalGap === false
repliesSheetHasHandle === true
Live Test URLs

Test:

0 comments:
https://www.pakrpp.com/2026/05/foldable-reusable-bag.html

2 comments:
https://pakrpp.com/2026/05/desk-tray-organizer.html

22 comments:
https://www.pakrpp.com/2026/02/you-ready-one-to-explore.html
Required Manual Screenshots

Capture:

Main sheet collapsed composer.
Main sheet expanded native composer.
Main sheet reply mode.
Replies sheet normal state.
Replies sheet reply mode.
Zero-comment state.
22-comment state with load-more.
Replies sheet header showing handle.
Compact comment row showing body, Reply, and View replies without excessive vertical gaps.
Required Commands

Run:

node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack

If npm run gaga:verify-sheet-contract still fails only due to store CSS drift, report it separately and do not treat it as comments failure.

Acceptance Criteria
Composer
Exactly one #top-ce.
Exactly one #comment-editor.
#top-ce is visually inside active sticky footer.
#top-ce is not inside comment row/list/replies body.
Reply banner and composer share the same footer.
Launcher and composer are mutually exclusive.
Native Blogger Publish remains usable.
No fake composer is introduced.
Reply Mode
Replying to Author B shows Replying to @AuthorB ×.
Banner appears above native composer.
Clicking × exits reply mode.
No text is injected into iframe.
Load More
Load more is above sticky footer.
Load more is not inside footer.
Load more is hidden in replies sheet unless explicitly supported.
Load more is styled as a quiet row/button.
Replies Sheet
Reply/action controls are horizontal.
No vertical R e p l y.
Thread guide remains decorative.
More menu remains in header row.
Replies sheet has the same handle affordance as main comments sheet.
Back button remains usable.
Header stays sticky.
Visual Density
Comment rows are compact and conversation-like.
No excessive vertical whitespace between body, Reply, and View replies.
Reply action is a quiet text action, not a permanent chip.
View replies trigger is close to the action row and does not float far below.
Zero Comment
No duplicate external Add/Post comment labels.
Native composer remains usable.
No fake composer.
Native Integrity
Native Blogger account selector remains usable.
Native Blogger Publish remains usable.
Native Blogger Notify Me remains usable when provided.
Native Blogger reCAPTCHA notice remains visible/usable when provided.
Native delete remains delegated through More menu only.
Proof
comments proof catches composer-in-list leakage;
comments proof catches launcher/composer conflict;
comments proof catches vertical reply action regression;
comments proof catches excessive row spacing;
comments proof catches missing replies sheet handle.