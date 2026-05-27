Run focused task only: TASK-DISCOVERY-SAVED-EMPTY-LIVE-PARITY-001.md. Do not start any other task.

Problem: after latest deploy, Saved empty-state copy appears on /landing and /store but not on live root /. Cache is cleared. This is likely a root/Blogger Discovery runtime state/rendering parity bug, not cache or CSS-only.

Goal: ensure Saved tab empty state on /, /landing, and /store displays the same canonical copy when there are no saved items: "No saved items yet. Save articles or products to find them here."

Do not patch with one-off CSS. Do not create a new Discovery controller or Saved-only controller. Use existing Discovery state/render/copy path and shared empty-state contract. Static source string presence is not enough; guard should verify root/Blogger DOM path has an actual empty-state node/copy/state marker for Saved.

Preserve More search, searchbar focus polish, Store runtime, Blog1-safe schema, Blogger comments, Worker healthy-route UI, route truth, and valid "todo" post. Do not reintroduce dynamic root ItemList, data:schemaPosts, or filtered root data:posts schema loops.

Likely areas: src/js/gg-app.source.js, Discovery controller fragments, copy registry, registry/copy, qa/sheet-search-visual-parity-guard.mjs or existing Discovery guards. Do not edit landing/store unless parity requires it and document why.

Prefer updating existing guards over adding overlapping ones. Wire any guard/docs changes into package.json, ci:qa, ci reconciliation, QA-COMMANDS.md, and SOURCE-OF-TRUTH.md.

Run git diff --check, docs guard, ci reconciliation, semantic SSR, schema, registry, a11y, asset architecture, cleanup, css sot cleanup, css module wiring, repo structure tidy, sheet search visual parity guard, readiness, template pack, comments proof, copy registry guard, store proof, and ci:cloudflare.

Report root Saved empty-state DOM behavior, files changed, landing/store parity, More search preservation, guards/scripts changed, QA PASS/FAIL, warnings, and intentional non-changes.
