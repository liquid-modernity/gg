# TASK-046A — Fix Mobile Renderer Crash When Opening Replies Sheet

## Objective

Fix a mobile/tablet renderer crash where Chrome shows **“Aw, Snap!”** around 3–5 seconds after clicking `View replies`.

Desktop does not crash, but mobile/tablet does. Treat this as a **production blocker**.

This task must be completed **after TASK-046** and **before TASK-047**.

TASK-047 must not be implemented until this crash is fixed, because adding reply-entry behavior on top of an unstable replies sheet will hide the real cause and increase risk.

---

## Current Situation

TASK-046 fixed a functional issue:

- clicking Reply sets native Blogger iframe to reply mode;
- clicking cancel removes `parentID`;
- the next comment can become top-level again.

However, after TASK-046, on mobile/tablet:

1. open comments;
2. click `View replies`;
3. wait around 3–5 seconds;
4. Chrome crashes with **“Aw, Snap!”**.

This suggests a renderer crash caused by one or more of:

- runaway MutationObserver loop;
- repeated comment enhancement loop;
- repeated native composer adoption/move;
- repeated iframe `src` changes/reloads;
- repeated replies DOM move/portal;
- duplicated More menu / inline reply controls;
- layout/paint thrashing on mobile.

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
- add newest/oldest sorting;
- add parent reply action;
- add `Add a reply` behavior;
- implement TASK-047 in this task.

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

## Key Principle

Opening replies must be a **read-only operation**.

Clicking `View replies` must only:

- open the replies sheet;
- render/adopt the replies list;
- render the original/parent context;
- set active layer to replies;
- keep composer collapsed/inactive.

Clicking `View replies` must **not**:

- open the composer;
- enter reply mode;
- show `Replying to @Parent`;
- add `parentID`;
- reset iframe `src`;
- reload the Blogger iframe;
- repeatedly move `#top-ce`;
- trigger repeated enhancement loops.

---

## Required Debug Instrumentation

Add temporary debug counters behind a safe dev flag.

Example:

```js
window.__GG_COMMENTS_DEBUG__ = window.__GG_COMMENTS_DEBUG__ || {
  mutations: 0,
  enhanceRuns: 0,
  composerMoves: 0,
  iframeSrcChanges: 0,
  repliesOpens: 0,
  moreMenuEnhancements: 0,
  inlineReplyEnhancements: 0
};
```

Track:

- MutationObserver callback count;
- comment enhancement run count;
- composer adoption/move count;
- iframe `src` change count;
- replies sheet open count;
- More menu enhancement count;
- inline reply cleanup/enhancement count.

After opening replies sheet and waiting 10 seconds on mobile emulation:

```txt
repliesOpens: 1
composerMoves: 0 or <= 1 if unavoidable
iframeSrcChanges: 0 if user only clicked View replies
enhanceRuns: bounded, not continuously increasing
mutations: bounded, not continuously increasing
moreMenuEnhancements: bounded, not continuously increasing
inlineReplyEnhancements: bounded, not continuously increasing
```

If any counter keeps increasing without user action, find and fix that loop.

---

## Required Fix 1 — View Replies Must Not Touch Native Composer/Iframe

When user only clicks `View replies`, `#comment-editor.src` must not change.

Add a guard so replies opening never calls:

- native reply activation;
- `resetNativeComposerToTopLevel()`;
- iframe `src` mutation;
- composer open routine;
- reply banner routine.

Acceptance check:

```js
window.__beforeCommentEditorSrc = document.querySelector('#comment-editor')?.src || '';
```

Click `View replies`, wait 5 seconds, then run:

```js
({
  before: window.__beforeCommentEditorSrc,
  after: document.querySelector('#comment-editor')?.src || '',
  changed: window.__beforeCommentEditorSrc !== (document.querySelector('#comment-editor')?.src || ''),
  hasParentId: (document.querySelector('#comment-editor')?.src || '').includes('parentID'),
  hasReplyBanner: !!document.querySelector('#gg-comment-replies-sheet .gg-comments__reply-banner'),
  composerOpen: document.querySelector('#gg-comment-replies-footer')?.dataset.ggComposerOpen,
  composerMode: document.querySelector('#gg-comment-replies-footer')?.dataset.ggCommentComposerMode
});
```

Expected after only clicking `View replies`:

```txt
changed: false
hasParentId: false
hasReplyBanner: false
composerOpen: false
composerMode: comment | inactive | collapsed
```

---

## Required Fix 2 — Composer Adoption Must Be Idempotent

If `#top-ce` is already in the correct active footer, do nothing.

Do not move the composer node repeatedly.

Required guard:

```js
function moveComposerToFooter(activeFooter) {
  const topCe = document.querySelector('#top-ce');
  const slot = activeFooter?.querySelector('#gg-comments-composer-slot');

  if (!topCe || !slot) return;

  if (topCe.parentElement === slot || topCe.closest('.gg-comments__footer') === activeFooter) {
    return;
  }

  slot.prepend(topCe);
}
```

Adjust to actual project function names.

Acceptance after opening replies and waiting 10 seconds:

```js
({
  topCeCount: document.querySelectorAll('#top-ce').length,
  editorCount: document.querySelectorAll('#comment-editor').length,
  topCeInsideFooter: !!document.querySelector('#top-ce')?.closest('.gg-comments__footer'),
  topCeInsideList: !!document.querySelector('#top-ce')?.closest('#gg-comments-list, #gg-comment-replies-list, li.comment, .comment-thread, .comment-replies')
});
```

Expected:

```txt
topCeCount: 1
editorCount: 1
topCeInsideFooter: true
topCeInsideList: false
```

---

## Required Fix 3 — MutationObserver Must Not Loop

The comments MutationObserver must be:

- scoped;
- debounced;
- idempotent;
- unable to trigger itself endlessly through its own DOM patches.

If the current observer watches the full document, reduce scope if possible.

Use a scheduler guard:

```js
let commentsEnhanceScheduled = false;

function scheduleCommentsEnhance() {
  if (commentsEnhanceScheduled) return;

  commentsEnhanceScheduled = true;

  requestAnimationFrame(() => {
    commentsEnhanceScheduled = false;
    enhanceCommentsOnce();
  });
}
```

`enhanceCommentsOnce()` must not mutate DOM if the target node is already enhanced.

Acceptance:

- `enhanceRuns` does not keep increasing;
- `mutations` does not keep increasing rapidly;
- DOM node counts stay stable;
- Chrome mobile does not crash.

---

## Required Fix 4 — Prevent Duplicate Enhancement

Repeated enhancement must not create duplicate nodes.

Prevent duplicates of:

- `.gg-comment-more`;
- `.gg-comment-more__button`;
- `.gg-comment-inline-reply`;
- `.gg-comment-reply-prefix`;
- `.gg-comments__reply-banner`;
- `.gg-comment-replies__context`;
- `#gg-comments-composer-slot`;
- `#gg-comments-reply-slot`;
- `#top-ce`;
- `#comment-editor`.

Acceptance check before opening replies:

```js
window.__beforeRepliesCounts = {
  moreButtons: document.querySelectorAll('.gg-comment-more__button').length,
  inlineReplies: document.querySelectorAll('.gg-comment-inline-reply').length,
  replyPrefixes: document.querySelectorAll('.gg-comment-reply-prefix').length,
  contextCards: document.querySelectorAll('.gg-comment-replies__context').length,
  topCe: document.querySelectorAll('#top-ce').length,
  editor: document.querySelectorAll('#comment-editor').length
};
```

Click `View replies`, wait 10 seconds, then run:

```js
({
  before: window.__beforeRepliesCounts,
  after: {
    moreButtons: document.querySelectorAll('.gg-comment-more__button').length,
    inlineReplies: document.querySelectorAll('.gg-comment-inline-reply').length,
    replyPrefixes: document.querySelectorAll('.gg-comment-reply-prefix').length,
    contextCards: document.querySelectorAll('.gg-comment-replies__context').length,
    topCe: document.querySelectorAll('#top-ce').length,
    editor: document.querySelectorAll('#comment-editor').length
  }
});
```

Expected:

- counts may increase once because replies are now shown;
- counts must not continue increasing after waiting;
- `topCe` remains `1`;
- `editor` remains `1`;
- context card remains `1`.

---

## Required Fix 5 — Replies Sheet Open Must Be Idempotent

Clicking `View replies` multiple times should not repeatedly rebuild the same replies sheet in a way that grows DOM or restarts loops.

Rules:

- If replies sheet is already open for the same parent, do not re-open/rebuild unnecessarily.
- If switching parent, restore previous replies DOM safely before adopting a new one.
- Do not clone native comment nodes repeatedly.
- Do not duplicate IDs.

Acceptance manual flow:

1. Open comments.
2. Click `View 5 replies`.
3. Close replies.
4. Click `View 5 replies` again.
5. Repeat 3 times.

Expected:

- no crash;
- no duplicate comments;
- no duplicate More buttons;
- no duplicate composer;
- no increasing DOM counts.

---

## Required Fix 6 — Mobile Layout/Paint Safety

Avoid expensive mobile rendering patterns during replies open.

Rules:

- Do not animate layout-heavy properties such as `height`, `top`, `left`, or `box-shadow` repeatedly.
- Prefer `transform` and `opacity` for sheet motion.
- Do not force repeated synchronous `getBoundingClientRect()` in loops.
- Batch reads before writes.
- Do not run collision-aware More menu placement until a More menu is actually opened.
- Do not compute menu placement for every comment during replies open.

Acceptance:

- opening replies does not trigger visible freeze;
- opening replies does not crash mobile Chrome.

---

## Mobile QA Matrix

Test this URL:

```txt
https://www.pakrpp.com/2026/05/desk-tray-organizer.html
```

Minimum devices / viewports:

```txt
Android Chrome mobile: 360–390px width
Android Chrome tablet: 768px width
Desktop Chrome: control
```

### Flow A — Read-only replies open

1. Open comments sheet.
2. Click `View 5 replies`.
3. Do not click composer.
4. Wait 10 seconds.
5. Scroll replies sheet.
6. Open More menu.
7. Close More menu.
8. Close replies sheet.
9. Repeat 3 times.

Expected:

- no “Aw, Snap!”;
- no renderer crash;
- no runaway memory;
- no duplicate composer;
- no duplicate More buttons;
- no iframe `src` change after just opening replies.

### Flow B — Replies open then cancel/close

1. Open replies.
2. Wait 5 seconds.
3. Close replies.
4. Reopen replies.
5. Wait 5 seconds.

Expected:

- no crash;
- state remains stable;
- only one semantically active sheet.

### Flow C — Desktop control

Run the same flow on desktop to confirm no regression.

---

## Required Proof Additions

Extend `GG.commentsProof()` or focused QA with fields such as:

```js
{
  viewRepliesDoesNotChangeIframeSrc,
  composerMoveCountBounded,
  commentsEnhanceRunsBounded,
  repliesNodeCountsStable,
  noDuplicateMoreButtonsAfterRepliesOpen,
  repliesOpenIsIdempotent
}
```

Expected:

```txt
viewRepliesDoesNotChangeIframeSrc === true
composerMoveCountBounded === true
commentsEnhanceRunsBounded === true
repliesNodeCountsStable === true
noDuplicateMoreButtonsAfterRepliesOpen === true
repliesOpenIsIdempotent === true
```

---

## Required Commands

Run:

```bash
node --check src/js/gg-app.source.js
node --check __gg/assets/js/gg-app.dev.js
node --check __gg/assets/js/gg-app.min.js
npm run gaga:verify-comments-proof
npm run gaga:template:pack
```

If `npm run gaga:verify-sheet-contract` fails only due to known store CSS drift, report it separately and do not treat it as comments failure.

---

## Acceptance Criteria

### Crash

- Mobile/tablet Chrome no longer shows “Aw, Snap!” after opening replies.
- Replies sheet survives at least 10 seconds open on mobile.
- Repeated open/close replies does not crash.

### Composer / Iframe

- View replies does not change `#comment-editor.src`.
- View replies does not add `parentID`.
- View replies does not open composer.
- One `#top-ce`.
- One `#comment-editor`.

### Observer / Enhancement

- MutationObserver does not loop.
- Enhancement does not run continuously.
- DOM counts remain stable.
- Composer adoption is idempotent.

### Replies Sheet

- Replies sheet opens normally.
- Replies sheet scrolls normally.
- More menu still works.
- Parent context remains visible.
- No duplicate replies.

### Regression

- Existing reply mode still works after this patch.
- TASK-046 cancel reset still works.
- Existing `npm run gaga:verify-comments-proof` passes.
