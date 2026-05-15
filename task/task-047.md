# TASK-047 — Explicit Replies Sheet Reply Entry: No Auto-Reply on View Replies, Add Parent Reply Action

## Objective

Refine replies sheet behavior so opening replies is a reading action, not an automatic reply action.

Current desired behavior:

- Clicking `View X replies` opens the replies sheet.
- It must not automatically open the composer.
- It must not automatically enter `Replying to @Parent`.
- User must explicitly click `Reply` or `Add a reply` before native Blogger composer targets the parent comment or a specific reply.

This task depends on TASK-046 because reply cancel must correctly reset the native Blogger composer target.

---

## Hard Rules

Do not:

- create a fake composer;
- duplicate `#top-ce`;
- duplicate `#comment-editor`;
- create a custom submit flow;
- inject text into Blogger iframe;
- access iframe internals;
- fetch comments;
- poll comments;
- replace Blogger native reply behavior;
- replace Blogger native delete behavior.

Keep native Blogger internals intact:

- `data:post.commentHtml`
- `li.comment`
- `.comment-thread`
- `.comment-replies`
- `.continue`
- `.comment-reply`
- `.item-control`
- `.comment-delete`
- `#top-ce`
- `#comment-editor-src`
- `#comment-editor`
- `BLOG_CMT_createIframe(...)`
- `data:post.cmtfpIframe`

---

## Current UX Principle

Opening replies means:

```txt
I want to read replies.

It does not mean:

I want to reply to the parent comment.

Therefore, View X replies must never auto-open reply mode.

Required Behavior
1. Click View X replies

When user clicks:

View 5 replies

Expected:

Replies sheet opens.
Original comment card appears.
Replies list appears.
Composer remains collapsed/inactive.
No reply banner appears.
No `Replying to @Parent` state appears.
Native composer target must not be changed automatically.

Acceptance:

({
  repliesOpen: document.querySelector('#gg-comment-replies-sheet')?.dataset.ggState === 'open',
  hasReplyBanner: !!document.querySelector('#gg-comment-replies-sheet .gg-comments__reply-banner'),
  composerMode: document.querySelector('#gg-comment-replies-footer')?.dataset.ggCommentComposerMode,
  composerOpen: document.querySelector('#gg-comment-replies-footer')?.dataset.ggComposerOpen,
  editorHasParentId: document.querySelector('#comment-editor')?.src.includes('parentID') || false
});

Expected immediately after opening replies sheet:

repliesOpen: true
hasReplyBanner: false
composerMode: comment | inactive | collapsed
composerOpen: false
editorHasParentId: false

If the implementation keeps composer hidden/collapsed, #comment-editor may exist but must not be retargeted to parent automatically.

2. Parent context card gets explicit Reply action

The Original comment card should include a quiet text action:

ORIGINAL COMMENT

[avatar] Pak RPP     May 14, 2026 at 1:12 AM
         Tes komen level 1
         5 replies

Reply

Rules:

Reply action is visually quiet.
It is not a filled chip by default.
It has accessible tap target.
Clicking it explicitly targets the original/parent comment.
Only then show Replying to @Parent ×.
Only then open/show the native Blogger composer.

Expected after clicking parent context Reply:

Replying to @PakRPP                         ×
[native Blogger composer]
3. Replies sheet footer may show collapsed Add a reply

When replies sheet opens, footer may show:

Add a reply

Rules:

Add a reply is a launcher only.
It does not submit anything.
It does not behave like fake composer.
Clicking Add a reply explicitly targets the original parent comment.
After click, show:
Replying to @Parent                         ×
[native Blogger composer]

Recommended:

Replies sheet collapsed footer:
Add a reply

After click:
Replying to @PakRPP                         ×
[native Blogger composer]
4. Reply on specific reply targets that reply directly

If user clicks Reply on Author B inside replies sheet:

Author B
Reply

Expected:

Replying to @AuthorB                        ×
[native Blogger composer]

Rules:

Target is the direct clicked comment.
Do not target the original parent unless the user clicked parent context Reply / Add a reply.
Visual @AuthorB prefix after submit remains UI-only.
Do not inject @AuthorB into iframe.
5. Cancel reply mode

When user clicks ×:

Expected:

Reply banner disappears.
Composer returns to collapsed replies footer.
Native Blogger composer target is reset.
No parentID remains if user then writes a top-level post comment later.

This depends on TASK-046.

Rules:

Cancel from reply to parent must clear parent target.
Cancel from reply to nested reply must clear that nested target.
Composer must not silently keep the old parentID.
No reply target may remain hidden.
Required JS Changes
1. Do not enter reply mode in openRepliesSheet()

If there is a function similar to:

openCommentReplies(...)

or:

openRepliesSheet(parentComment)

it must only:

open replies sheet;
render/adopt replies list;
render parent context;
set active comments layer to replies;
keep composer collapsed;
clear visual reply banner unless user was already intentionally replying.

It must not:

call native reply action;
set parentID;
set mode to reply;
open composer;
show Replying to @Parent.
2. Add explicit parent reply launcher

Add handler for parent context reply action:

[data-gg-action="comments-reply-parent"]

Expected behavior:

enterCommentReplyMode(parentCommentId, parentAuthorName)

This should use the same safe path as clicking native Blogger Reply, not a fake reply engine.

3. Add explicit replies footer launcher

Add or repair handler for:

[data-gg-action="comments-add-reply"]

Expected behavior:

target original parent comment;
show Replying to @Parent;
open native Blogger composer in replies footer;
keep one #comment-editor.
Required CSS
Parent context Reply action
.gg-comment-replies__context-reply {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  margin-top: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gg-ink-muted);
  font: 650 12px/1.2 var(--gg-font-sans);
  cursor: pointer;
}

.gg-comment-replies__context-reply:hover,
.gg-comment-replies__context-reply:focus-visible {
  color: var(--gg-ink);
}
Replies footer collapsed launcher
#gg-comment-replies-footer [data-gg-action="comments-add-reply"],
#gg-comment-replies-footer [data-gg-action="comments-open-composer"] {
  /* quiet pill or quiet text launcher */
}

Rules:

Keep launcher visually distinct from native iframe.
Launcher and composer remain mutually exclusive.
No fake input.
Accessibility Requirements
Parent context Reply button must have clear accessible label:
Reply to original comment
Footer Add a reply button must have clear accessible label:
Add a reply to original comment
Reply banner cancel remains:
Cancel reply
Opening replies sheet should not move focus directly into composer.
Opening replies sheet should focus the replies sheet/dialog or heading.
Proof Additions

Extend GG.commentsProof() or focused QA with:

{
  viewRepliesDoesNotAutoReply,
  parentReplyActionExists,
  addReplyLauncherTargetsParent,
  replySpecificCommentTargetsDirectComment,
  cancelReplyClearsNativeTarget
}

Expected:

viewRepliesDoesNotAutoReply === true
parentReplyActionExists === true
addReplyLauncherTargetsParent === true
replySpecificCommentTargetsDirectComment === true
cancelReplyClearsNativeTarget === true
Manual Test Flow

Use:

https://www.pakrpp.com/2026/05/desk-tray-organizer.html
Test 1 — View replies only
Open comments sheet.
Click View 5 replies.
Confirm replies sheet opens.
Confirm no Replying to @PakRPP banner appears.
Confirm composer does not auto-open.
Confirm iframe src does not contain parentID.
Test 2 — Parent context Reply
In replies sheet, click Reply inside Original comment card.
Confirm banner says Replying to @PakRPP.
Confirm composer opens in replies footer.
Publish test comment.
Confirm it appears as reply to the original parent comment.
Test 3 — Add a reply launcher
Open replies sheet.
Click footer Add a reply.
Confirm banner says Replying to @PakRPP.
Cancel.
Confirm banner disappears and native target clears.
Test 4 — Reply to specific reply
Click Reply on @gaga.
Confirm banner says Replying to @gaga.
Publish test comment.
Confirm it appears under/directly associated with @gaga, not automatically under parent unless Blogger threading depth forces it.
Test 5 — Cancel then top-level comment
Click Reply on @gaga.
Click cancel ×.
Return to main comments sheet.
Add comment.
Confirm the comment is top-level, not reply to @gaga.
Required Commands

Run:

node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack

If npm run gaga:verify-sheet-contract fails only due to store CSS drift, report it separately and do not treat it as comments failure.

Acceptance Criteria
View Replies
Opening replies sheet does not auto-enter reply mode.
No reply banner appears automatically.
Composer does not auto-open automatically.
Native iframe does not silently target parent comment.
Parent Reply
Original comment card has explicit Reply action.
Clicking it targets original parent comment.
Banner shows Replying to @Parent.
Composer opens in replies footer.
Add Reply
Footer Add a reply launcher exists or existing launcher behaves clearly.
Clicking it targets original parent comment.
It does not submit anything.
It does not create fake composer.
Specific Reply
Clicking Reply on a reply targets that direct reply.
Banner shows the direct author.
No hidden mismatch between UI target and native target.
Cancel
Cancel clears UI reply state.
Cancel clears native Blogger parent target.
Next top-level comment is not accidentally submitted as reply.
Regression
One #top-ce.
One #comment-editor.
No fake composer.
No composer in list.
Existing comments proof passes.