# TASK-046 — Fix Reply Cancel to Reset Native Blogger Composer to Top-Level Comment Mode

## Objective

Fix a functional bug in the native Blogger comments UI.

Current behavior:
- User clicks Reply on `@gaga`.
- Footer shows `Replying to @gaga`.
- User clicks cancel `×`.
- Reply banner disappears.
- User writes a comment.
- The submitted comment still becomes a reply to `@gaga`.

This is wrong.

Expected behavior:
- Clicking cancel must fully exit reply mode both visually and natively.
- The next submitted comment must become a top-level/parent comment, not a reply.

This is a functional correctness patch, not a visual polish task.

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
- replace Blogger native reply/delete behavior.

Keep native Blogger internals intact:

- `#top-ce`
- `#comment-editor-src`
- `#comment-editor`
- `BLOG_CMT_createIframe(...)`
- `data:post.cmtfpIframe`
- `.comment-reply`

---

## Bug to Fix

Cancel currently clears the visual reply banner but does not fully reset the native Blogger reply target.

The native iframe may still contain a reply URL with:

```txt
parentID=<comment-id>

or Blogger's internal reply state may still target the previously selected comment.

This causes the next comment to submit as a reply even after the UI says reply mode is cancelled.

Required Behavior
When entering reply mode

After clicking Reply on a comment:

footer mode becomes reply;
banner shows Replying to @Author ×;
native Blogger composer targets the direct reply parent;
iframe URL may contain parentID=<comment-id>.
When cancelling reply mode

After clicking ×:

Hide reply banner.
Clear GG reply state.
Clear active reply parent/comment ID.
Reset footer mode to:
comment if comments exist;
empty if zero-comment state.
Reset native Blogger composer to top-level comment mode.
Ensure #comment-editor.src no longer contains parentID.
Ensure the next submission becomes a top-level comment.
Required Implementation

Add or repair a dedicated function such as:

resetNativeComposerToTopLevel()

It must:

locate the single #comment-editor;
locate #comment-editor-src;
derive the base top-level comment iframe URL;
remove any parentID query parameter;
update the iframe src only if needed;
preserve the native Blogger iframe;
preserve one #top-ce;
avoid duplicate composer creation.

Possible direction:

function stripParentIdFromCommentSrc(src) {
  if (!src) return src;
  try {
    const url = new URL(src, window.location.href);
    url.searchParams.delete('parentID');
    return url.toString();
  } catch (_) {
    return String(src)
      .replace(/([?&])parentID=[^&#]+&?/g, '$1')
      .replace(/[?&]$/, '');
  }
}

Then on cancel:

function cancelCommentReplyMode() {
  clearVisualReplyState();
  resetNativeComposerToTopLevel();
  syncCommentComposerMode();
}

If the project already stores a canonical top-level composer src, use that instead of reconstructing from current iframe src.

Acceptance Criteria
Functional
Click Reply on @gaga.
Footer shows Replying to @gaga ×.
Click ×.
Banner disappears.
Composer remains available.
Write and publish comment.
Submitted comment appears as top-level parent comment, not under @gaga.
DOM / State

After cancel:

document.querySelector('.gg-comments__reply-banner') === null

or banner is hidden.

document.querySelector('#comment-editor')?.src.includes('parentID') === false

Footer mode is no longer reply.

document.querySelector('.gg-comments__footer[data-gg-comment-composer-mode="reply"]') === null

There is still only one native editor:

document.querySelectorAll('#comment-editor').length === 1
document.querySelectorAll('#top-ce').length === 1
Regression
Reply mode still works after patch.
Cancelling reply does not destroy composer.
Opening reply again retargets the correct author/comment.
Native Blogger Publish still works.
No fake composer is introduced.
Existing npm run gaga:verify-comments-proof passes.
Manual Test Flow

Use:

https://www.pakrpp.com/2026/05/desk-tray-organizer.html

Test 1 — reply then cancel:

Open comments.
Click Reply on @gaga.
Confirm banner: Replying to @gaga.
Click ×.
Confirm banner disappears.
Type a new comment.
Publish.
Confirm new comment is top-level.

Test 2 — reply after cancel:

Click Reply on Pak RPP.
Confirm banner: Replying to @PakRPP.
Publish.
Confirm comment becomes reply to Pak RPP.

Test 3 — repeated switching:

Reply to @gaga.
Cancel.
Reply to @PakRPP.
Cancel.
Add top-level comment.
Confirm it is top-level.
Proof Additions

Extend GG.commentsProof() or focused proof with fields:

{
  replyCancelResetsNativeParent,
  editorSrcHasNoParentIdAfterCancel,
  replyModeClearsNativeTarget
}

Expected:

replyCancelResetsNativeParent === true
editorSrcHasNoParentIdAfterCancel === true
replyModeClearsNativeTarget === true