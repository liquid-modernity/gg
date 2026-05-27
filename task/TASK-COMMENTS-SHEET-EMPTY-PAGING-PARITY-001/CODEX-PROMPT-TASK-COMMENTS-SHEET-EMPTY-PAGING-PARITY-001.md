Run focused task only: TASK-COMMENTS-SHEET-EMPTY-PAGING-PARITY-001.md. Do not start any other task.

Goal: improve comments sheet empty state and short-list/paging behavior for post/page detail without replacing Blogger-native comments.

Issues: 0-comment sheet looks empty/broken; add minimal empty-state copy. 1-comment/short-list sheet should not show invalid `Load more...` unless real Blogger pagination/continuation exists. Do not resize sheet aggressively by comment count; preserve stable sheet geometry and sticky footer/composer.

Preferred copy: "No comments yet. Be the first to comment." Use registry/copy if appropriate. Preserve Add comment/composer CTA. Do not remove/hide valid native Blogger pagination.

Hard constraints: no new comments engine, no parallel comments controller, no patch/override-only CSS/JS, no route truth change, no Blogger comments plumbing removal, no Blog1-safe schema changes, no Worker healthy-route UI change, no Store product source change, no dynamic root ItemList/data:schemaPosts/filtered root data:posts schema loops.

Likely areas: index.xml, src/js/gg-app.source.js existing comments behavior only if needed, canonical comments/sheet CSS source, registry/copy if copy must be centralized, qa/comments-proof-guard.mjs.

Prefer updating qa/comments-proof-guard.mjs over adding another overlapping guard. Wire any guard/docs changes into package.json, ci:qa, ci reconciliation, QA-COMMANDS.md, and SOURCE-OF-TRUTH.md.

Run git diff --check, docs guard, ci reconciliation, semantic SSR, schema, registry, a11y, asset architecture, cleanup, css sot cleanup, css module wiring, repo structure tidy, comments proof, readiness, template pack, copy registry guard, store proof, and ci:cloudflare.

Report files changed, empty-state behavior, Load more behavior, sheet height decision, Blogger-native preservation, guards/scripts changed, QA PASS/FAIL, warnings, and intentional non-changes.
