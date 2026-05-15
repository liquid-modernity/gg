# TASK-048 — Threaded Comments Final Live Proof and Freeze

## Goal

Close the threaded comments feature after final local and live verification. This task must not introduce new UX, new reply behavior, new layout experiments, or new state-machine branches.

## Context

Tasks 029–047 have rebuilt the comments system around native Blogger comments, separated main comments from replies, and guarded the composer/reply targeting flow.

The intended final behavior is:

- `View replies` is read-only.
- `View replies` must not open the composer.
- `View replies` must not set `parentID`.
- Parent `Reply` is an explicit reply action.
- Replies-sheet footer `Add a reply` is an explicit reply action.
- Direct reply inside a reply row is an explicit nested reply action.
- `Cancel reply` clears visual reply mode and native Blogger reply target state.
- Native Blogger remains the authoritative comment engine.
- No fake composer, no custom comment submit flow, no fetch/polling comment system.

## Scope

Allowed:

- Proof script updates only if they clarify existing assertions.
- Minor selector hardening only if required for proof stability.
- Documentation of the final behavior.

Forbidden:

- No new comment UI concepts.
- No new sort controls.
- No new reply layer.
- No new custom comment storage.
- No composer replacement.
- No visual redesign.
- No CSS extraction work in this task.
- No copy registry refactor in this task.

## Required local verification

Run:

```bash
npm run gaga:verify-comments-proof
npm run gaga:template:pack
npm run gaga:template:proof
```

Expected:

- `gaga:verify-comments-proof` passes.
- Template pack completes.
- Template proof completes.
- No crash in comment proof guard.

## Required live proof targets

Use the known live test URLs:

- 0 comments: `https://www.pakrpp.com/2026/05/foldable-reusable-bag.html`
- 2 comments: `https://www.pakrpp.com/2026/05/desk-tray-organizer.html`
- heavy thread: `https://www.pakrpp.com/2026/02/you-ready-one-to-explore.html`

Test at minimum:

- mobile width around 390px
- tablet width around 768px
- desktop width around 1280px

## Manual proof checklist

### Main comments sheet

- Comments sheet opens.
- Only top-level comments appear in the main sheet.
- Nested reply content does not leak into the main sheet.
- Composer is controlled by explicit add/reply actions.
- Sticky footer remains owned by the active sheet.

### Replies sheet

- `View replies` opens replies sheet only.
- Opening replies sheet does not activate reply mode.
- Opening replies sheet does not show `Replying to @...`.
- Original comment context appears above replies.
- `Reply` inside original comment targets the original parent comment.
- `Add a reply` in replies footer targets the original parent comment.
- Direct reply on a reply row targets the selected reply/comment if native Blogger supports that target path.
- `Cancel reply` clears the banner and resets native reply targeting.

### Blogger composer integrity

- There is only one active native `#comment-editor` instance.
- Any duplicate placeholder/source shell must be inert and marked as plumbing only.
- The real native iframe is anchored into the active footer when composer mode is active.
- Native delete, if present, remains Blogger-native.

## `GG.commentsProof()` expected fields

The proof output should continue covering at least:

- visible sheets
- active comments layer
- visible footers
- replies above main
- reply leaks
- native composer count
- `top-ce` count
- add comment controls
- no auto-reply on view replies
- parent reply targeting
- add reply targeting
- direct reply targeting
- cancel reset
- crash guards for mobile replies

## Acceptance criteria

This task is accepted only when:

1. Local proof passes.
2. Live proof passes on the three reference URLs.
3. The implementation does not add new behavior beyond tasks 029–047.
4. The final notes explicitly state that threaded comments are frozen.

## Output required from Codex

Codex must return:

```text
TASK-048 completed.

Local verification:
- npm run gaga:verify-comments-proof: PASS
- npm run gaga:template:pack: PASS
- npm run gaga:template:proof: PASS

Live verification:
- 0 comments URL: PASS/FAIL + notes
- 2 comments URL: PASS/FAIL + notes
- heavy thread URL: PASS/FAIL + notes

Final status:
- Threaded comments behavior frozen: YES/NO
- Remaining work moved to separate copy/asset tasks: YES/NO
```
