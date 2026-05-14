# TASK-042 — Final Comments Sheet Visual Polish, Density, Native Composer Presentation, and Empty-State Refinement

## Objective

Polish the native Blogger comments sheet after Task 041.

Do not change the comment architecture. Do not touch native Blogger engine behavior. This task only improves visual density, spacing, composer presentation, empty state, and final conversation feel.

## Hard Rules

Do not:
- create a fake composer;
- duplicate `#top-ce`;
- duplicate `#comment-editor`;
- inject text into Blogger iframe;
- access iframe internals;
- fetch comments;
- poll comments;
- replace Blogger native reply/delete;
- remove native controls from DOM.

Keep Blogger native composer and comment engine intact.

## Problems to Fix

1. Comment rows still have excessive vertical spacing.
2. Avatar/content alignment feels too wide and unnatural.
3. Reply/View replies actions need tighter vertical rhythm.
4. Replies sheet thread guide is too technical/dominant.
5. `@Author` visual prefix needs softer spacing and tone.
6. Native iframe composer presentation is visually harsh against dark sheet.
7. Zero-comment state has too much empty space.
8. Add comment launcher is too plain and not polished.
9. Deleted comments need muted styling.
10. Final screenshots must prove 0-comment, main comments, replies, reply mode, load-more, and composer states.

## Required Visual Fixes

### 1. Tighten Comment Row Density

Target:

```txt
[avatar] Author      Timestamp       …
         Comment body
         Reply
         View X replies

Rules:

Body must sit close to header.
Reply must sit close to body.
View replies must sit close to Reply.
No large empty bands.
Main sheet should show more than one comment comfortably.

Recommended CSS direction:

.gg-comments {
  --gg-comment-pad-y: 10px;
  --gg-comment-body-gap: 3px;
  --gg-comment-action-gap: 6px;
}

.gg-comments .comment-block {
  gap: 3px;
}

.gg-comments .comment-body,
.gg-comments .comment-content {
  line-height: 1.45;
}

.gg-comments .comment-actions,
.gg-comments .comment .comment-footer {
  margin-top: 0;
}

.gg-comments a.comment-reply {
  min-height: 28px;
}
2. Improve Avatar/Content Alignment

Rules:

Content column must start naturally after avatar.
Header, body, Reply, and View replies should align to the same content column.
Avoid content appearing centered or detached from avatar.
3. Make Reply and View Replies Quiet Text Actions

Rules:

Reply should not appear as a permanent chip.
View replies should be visible but understated.
Hover/focus can show background.
Default state should be text-like.
4. Soften Replies Thread Guide

Rules:

Thread guide should be subtle.
It must not dominate the sheet.
Reduce opacity.
Avoid long heavy vertical lines that feel like a debug tree.
5. Polish @Author Prefix

Rules:

Prefix is UI-only.
Prefix should have slight spacing after it.
Prefix should use accent-soft tone, not overpower body text.
Do not duplicate prefix.
6. Polish Native Composer Presentation

Rules:

Do not edit iframe internals.
Style only wrapper/slot around native iframe.
Reduce visual harshness of white iframe against dark sheet.
Add sensible spacing above iframe.
Ensure footer feels intentional, not like raw iframe pasted in.
Composer should never cover comment content.
7. Refine Empty State

Zero-comment sheet should not show large empty dead space.

Preferred:

Post a comment
Be the first to add one.

[native composer or Add comment launcher]

Rules:

Keep copy minimal.
Avoid duplicate Add comment / Post a Comment labels.
If native iframe already shows internal title, avoid extra duplicate external title.
8. Add Comment Launcher Polish

Rules:

Launcher should feel like a sticky composer affordance.
It may be a quiet pill.
It must not look like raw text.
It must not become a fake input.
It only opens/reveals native composer.
9. Deleted Comment Styling

Rules:

Deleted comment body should be muted.
Keep it readable.
Do not hide it unless Blogger hides it.
Do not remove delete metadata.
Required Screenshots

Capture after changes:

Zero-comment collapsed state.
Zero-comment native composer open.
Main comments sheet collapsed composer.
Main comments sheet native composer open.
Main comments sheet reply mode.
Replies sheet normal state.
Replies sheet reply mode.
22-comment sheet with load-more.
More menu open.
Acceptance Criteria
UI feels compact, calm, and conversation-like.
No composer leaks into list.
No duplicate composer launcher.
No vertical Reply.
No raw native Replies label.
No excessive empty space.
Replies sheet has handle.
Load more is above footer.
Native iframe remains usable.
Existing comments proof passes.