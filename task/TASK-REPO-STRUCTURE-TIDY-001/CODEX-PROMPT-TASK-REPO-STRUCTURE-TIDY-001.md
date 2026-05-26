Run focused task only: TASK-REPO-STRUCTURE-TIDY-001.md. Do not start any other task.

Goal: conservatively tidy repo structure without moving runtime/build folders or breaking Blogger, Store, Cloudflare, or CI paths.

If REPO-STRUCTURE.md does not exist, create a minimal repo map first. Do not restructure runtime folders before the map exists.

Allowed: organize task/docs/report files if references and guards are updated; add .gitignore entries for .DS_Store, __MACOSX/, *.zip, *.bak; remove tracked OS/archive/backup clutter only with proof; create REPO-TIDY-REPORT.md.

Do not move src, assets, __gg, dist, .cloudflare-build, store, qa, tools, registry, index.xml, landing.html, store.html, worker.js, _headers, robots.txt, manifest, or public asset paths. Do not simplify index.xml for aesthetics. Do not touch Blogger-native comments, Blog1-safe schema, critical inline CSS/JS, Store/Discovery/Preview/Shell/Theme runtime, or route truth. Do not reintroduce dynamic root ItemList, data:schemaPosts, or filtered data:posts schema loops.

For every move/deletion, document proof: usage search, old/new path or deletion reason, affected docs/scripts/guards, and regression guard.

Add/update qa/repo-structure-tidy-guard.mjs if useful, and wire it into package.json, ci:qa, ci reconciliation, QA-COMMANDS.md, and SOURCE-OF-TRUTH.md.

Run git diff --check, docs guard, ci reconciliation, semantic SSR, schema, registry, a11y, asset architecture, cleanup, css sot cleanup, css module wiring, readiness, template pack, comments proof, copy registry guard, store proof, and ci:cloudflare.

Report files moved/deleted, REPO-STRUCTURE status, .gitignore changes, docs/guards/scripts changed, runtime folders intentionally not moved, QA PASS/FAIL, warnings, and intentional non-changes.
