Run focused task only: TASK-SHEET-SEARCH-FOCUS-EMPTY-STATE-POLISH-001.md. Do not start any other task.

Goal: refine sheet searchbar focus/hover visual and fix Saved empty-state parity across /, /landing, and /store.

Issues: searchbar focus/hover border is too thick/harsh; it should use subtle 1px shared token treatment and a soft accessible focus ring. Root Saved Discovery state does not show the same empty copy as landing: "No saved items yet. Save articles or products to find them here." More search works; preserve it. Post "todo" is valid content; do not remove/hide it.

Hard constraints: no patch/override-only CSS, no duplicate searchbar visual system, no parallel search controller, no random new CSS/JS layer. Use existing --gg-sheet-search-* tokens and source-of-truth files. Keep route truth /landing = Home, / = Blog. Do not touch Blogger comments, Blog1-safe schema, Store product source, Worker healthy-route UI, or critical inline CSS/JS. Do not reintroduce dynamic root ItemList, data:schemaPosts, or filtered root data:posts schema loops.

Likely areas: src/css/components/gg-visual-tokens.css, src/css/components/gg-discovery-sheet.css, src/css/components/gg-more-sheet.css, src/store/store.css, src/js/gg-app.source.js / landing/store only if empty-state copy binding needs existing behavior alignment, registry/copy if copy must be centralized.

Prefer updating qa/sheet-search-visual-parity-guard.mjs rather than adding another overlapping guard. Keep it wired into package.json, ci:qa, ci reconciliation, QA-COMMANDS.md, and SOURCE-OF-TRUTH.md.

Run git diff --check, docs guard, ci reconciliation, semantic SSR, schema, registry, a11y, asset architecture, cleanup, css sot cleanup, css module wiring, repo structure tidy, sheet search visual parity guard, readiness, template pack, comments proof, copy registry guard, store proof, and ci:cloudflare.

Report files changed, token/focus changes, Saved empty-state parity, More search preserved, guards/scripts changed, QA PASS/FAIL, warnings, and intentional non-changes.
