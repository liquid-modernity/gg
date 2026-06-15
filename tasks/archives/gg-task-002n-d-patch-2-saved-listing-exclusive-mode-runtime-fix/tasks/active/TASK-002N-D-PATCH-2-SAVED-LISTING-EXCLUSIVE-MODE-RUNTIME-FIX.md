# TASK-002N-D-PATCH-2 — Saved Listing Exclusive Mode Runtime Fix

## Objective
Make Saved mode an exclusive listing mode at runtime.

## Contract
When Saved mode is active:

- only saved posts are visible,
- native/latest posts are hidden,
- saved rows are rendered into the active listing surface,
- load-more/pagination are hidden,
- visible mode label must not remain `Latest`,
- saved rows use `gg-template-listing-row`,
- empty state clones `gg-empty-state-saved-articles`,
- no visible raw `Details` text appears in saved rows.

## Non-goals

- Do not extract Popular/Related.
- Do not rewrite comments.
- Do not delete legacy files.
- Do not change generated output manually.
