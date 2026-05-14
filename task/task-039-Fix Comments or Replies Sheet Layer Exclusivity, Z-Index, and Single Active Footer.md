# TASK-039 — Fix Comments/Replies Sheet Layer Exclusivity, Z-Index, and Single Active Footer

## Objective

Fix the visual stacking and active-state behavior of the comments sheet and replies sheet after TASK-038.

TASK-038 passed structural proof, but live visual output still shows the replies sheet and main comments sheet visible at the same time, with duplicate footer affordances and wrong stacking.

This task must fix sheet layer exclusivity, z-index order, active footer ownership, and visual proof checks.

This is not a new feature task.

---

## Current Visual Failure

Observed output:

```txt
Replies sheet visible in the background:
← Replies
Tes komen level 1
1 reply
Replies

Comments sheet visible in the foreground:
2 Comments
Pak RPP ...
Reply
View 1 reply
Add comment

Load more...
Add comment

This is wrong.

Expected behavior:

When replies sheet is open:
- replies sheet is the active visible sheet;
- main comments sheet must not visually overlay it;
- only the active sheet has visible composer/footer;
- Load more must not appear between duplicated footers.
Hard Rules

Do not:

create a fake composer;
duplicate #top-ce;
duplicate #comment-editor;
rewrite Blogger native reply;
fetch comments;
poll comments;
create a new comment engine;
remove native Blogger delete/reply controls from DOM.

Keep Blogger native internals intact:

data:post.commentHtml
li.comment
.comment-thread
.comment-replies
.item-control
.comment-delete
#top-ce
#comment-editor-src
#comment-editor
BLOG_CMT_createIframe(...)
Required Fixes
1. Replies Sheet Must Be Above Comments Sheet

Ensure replies sheet has higher stacking order than comments sheet.

Required behavior:

comments sheet z-index < replies sheet z-index

Example:

#gg-comments-sheet {
  z-index: 92;
}

#gg-comment-replies-sheet {
  z-index: 96;
}

Use actual selectors in the project.

Acceptance:

Number(getComputedStyle(document.querySelector('#gg-comment-replies-sheet')).zIndex)
>
Number(getComputedStyle(document.querySelector('#gg-comments-sheet')).zIndex)

when both are open.

2. Only One Sheet Is Visually Active

When replies sheet opens, main comments sheet must not appear as a foreground panel.

Choose one strategy:

Strategy A — Replace

Hide the main comments panel while replies sheet is open.

body[data-gg-comments-layer='replies'] #gg-comments-sheet .gg-sheet__panel {
  opacity: 0;
  pointer-events: none;
}
Strategy B — Stack

Keep main comments sheet behind, but replies sheet must fully cover it and main comments sheet must be inert.

Do not allow both panels to appear equally active.

Recommended: Strategy A for simplicity and visual clarity.

3. Add Explicit Comments Layer State

Add a reliable state attribute when opening/closing replies sheet.

Example:

<body data-gg-comments-layer="main">
<body data-gg-comments-layer="replies">

Rules:

opening comments sheet sets data-gg-comments-layer="main";
opening replies sheet sets data-gg-comments-layer="replies";
closing replies sheet restores data-gg-comments-layer="main" if comments sheet remains open;
closing all comments UI removes the attribute or sets closed.
4. Only Active Sheet Footer Is Visible

When replies sheet is active:

replies sheet footer may be visible;
main comments sheet footer must not be visible;
no duplicate Add comment launcher may appear.

When main comments sheet is active:

main footer may be visible;
replies footer must not be visible.

CSS example:

body[data-gg-comments-layer='replies'] #gg-comments-footer {
  visibility: hidden;
  pointer-events: none;
}

body[data-gg-comments-layer='main'] #gg-comment-replies-footer {
  visibility: hidden;
  pointer-events: none;
}

Use actual selectors.

Acceptance:

[...document.querySelectorAll('.gg-comments__footer')]
  .filter(el => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
  }).length

Expected:

1
5. Load More Must Belong to Main Comments List Only

Load more... must not appear between sheet layers or below active footer.

Rules:

Load more belongs to main comments sheet only.
Hide or suppress load-more visually when replies sheet is active.
It must appear above the main sticky footer when main sheet is active.
It must not appear in replies sheet unless the replies sheet specifically owns pagination.

Acceptance when replies sheet active:

[...document.querySelectorAll('#gg-comment-replies-sheet *')]
  .filter(el => /load more/i.test(el.textContent || ''))
  .length

Expected:

0

Acceptance when main sheet active:

Load more appears above sticky footer, not under it.
6. More Button Must Be in Header Row

Current screenshot still shows ... below Reply.

Fix DOM placement or CSS so More is in the author/timestamp row.

Expected:

Author    timestamp                 …
comment body
Reply
View X replies

Not:

Reply

...

Required diagnostic:

[...document.querySelectorAll('.gg-comment-more')].map(btn => ({
  parent: btn.parentElement?.className,
  comment: btn.closest('li.comment')?.id,
  yButton: Math.round(btn.getBoundingClientRect().top),
  yAuthor: Math.round(btn.closest('li.comment')?.querySelector('.comment-author, .comment-header')?.getBoundingClientRect().top || 0)
}));

Expected:

yButton approximately equals yAuthor
7. Visual Proof Must Catch This Regression

Extend GG.commentsProof() or add a focused live visual diagnostic to catch:

both sheets visible as active panels;
more than one visible comments footer;
replies sheet z-index lower than comments sheet;
visible reply leaks in main sheet;
More button outside header row.

Suggested proof fields:

{
  visibleSheets,
  activeCommentsLayer,
  visibleFooters,
  repliesAboveMain,
  visibleReplyLeaks,
  moreButtonsInHeader
}

Acceptance:

visibleSheets <= 1 active foreground sheet
visibleFooters === 1
repliesAboveMain === true when replies open
visibleReplyLeaks === 0
moreButtonsInHeader === true
Required Live Test Flow

Use the 2-comment URL first:

https://pakrpp.com/2026/05/desk-tray-organizer.html

Steps:

Open comments sheet.
Confirm main sheet only.
Click View 1 reply.
Confirm replies sheet is active and foreground.
Confirm main sheet is not foreground-visible.
Confirm only one footer is visible.
Click back.
Confirm main sheet returns cleanly.

Then test 22-comment URL:

https://www.pakrpp.com/2026/02/you-ready-one-to-explore.html

Steps:

Open comments sheet.
Confirm Load more... appears above footer.
Open replies sheet.
Confirm Load more... is not visible in replies sheet.
Confirm only one footer.

Then test 0-comment URL:

https://www.pakrpp.com/2026/05/foldable-reusable-bag.html

Steps:

Open comments sheet.
Confirm empty state.
Confirm one sticky footer.
Confirm one native composer.
Required Commands

Run:

node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack

If npm run gaga:verify-sheet-contract still fails only because of store CSS drift, report it separately and do not treat it as comments failure.

Acceptance Criteria
Sheet Layering
Replies sheet appears above main comments sheet.
Main comments sheet does not appear as foreground overlay when replies sheet is active.
Back from replies sheet restores main comments sheet cleanly.
Closing comments UI clears layer state.
Footer
Only one visible comments footer at a time.
No duplicate Add comment.
No footer from inactive sheet is visible.
Native composer remains single.
Load More
Load more... appears only in main comments context.
It is above the sticky footer.
It is hidden/suppressed during replies sheet view.
More Button
More button appears in the author/timestamp header row.
More button does not appear below Reply.
More menu still opens.
Copy link still works.
Delete appears only when native delete exists.
Native Integrity
Exactly one #top-ce.
Exactly one #comment-editor.
Native Blogger Publish still works.
Native Blogger reply still works.
No fake composer is introduced.
Proof
Existing comments proof passes.
New visual proof catches sheet overlap and duplicate footer regressions.

## Kesimpulan

Output TASK-038 **bukan gagal total**. Ia memperbaiki composer identity dan proof struktural. Tapi screenshot membuktikan **state layer-nya gagal**.

Jadi task berikutnya bukan “lebih banyak styling”. Task berikutnya adalah:

> **TASK-039 — Fix Comments/Replies Sheet Layer Exclusivity, Z-Index, and Single Active Footer.**

Kalau ini tidak dibereskan, semua polish berikutnya percuma, karena user akan melihat dua sheet bertumpuk d