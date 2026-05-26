Run focused task only: TASK-SHEET-SEARCH-VISUAL-PARITY-001.md. Do not start any other task.

Goal: unify sheet searchbar visual language, hover/focus border behavior, Saved sheet root/landing parity, and More sheet search behavior across /, /landing, and /store.

Known issues: Saved sheet differs between root and landing; Discovery searchbar visual differs across root/landing/store; hover/focus border is too thick and inconsistent; More sheet searchbar differs visually and does not filter More sheet contents. The post titled "todo" is valid content and must not be removed or hidden.

Hard constraints: no patch/override-only CSS, no duplicate searchbar visual system, no parallel More-only search controller, no random new CSS/JS layer. Use existing source-of-truth files, shared sheet/searchbar tokens, registry-driven labels, and existing centralized sheet/search/filter behavior. If More search needs logic, extend the existing centralized behavior, not a standalone controller.

Do not change route truth: /landing = Home, / = Blog, breadcrumb = Home(/landing) -> Blog(/) -> current. Do not touch Blogger-native comments, Blog1-safe schema, Store product source, Worker healthy-route UI, or critical inline CSS/JS unless required by an existing contract defect. Do not reintroduce dynamic root ItemList, data:schemaPosts, or filtered root data:posts schema loops.

Likely areas: src/css/components/gg-more-sheet.css, src/css/components/gg-discovery-sheet.css, wired/canonical CSS modules, src/css/gg-app.source.css through source/bundle contract, src/js/gg-app.source.js only for existing centralized behavior, registry/copy only for labels.

Add/update a read-only sheet search visual parity guard if practical and wire it into package.json, ci:qa, ci reconciliation, QA-COMMANDS.md, and SOURCE-OF-TRUTH.md.

Run git diff --check, docs guard, ci reconciliation, semantic SSR, schema, registry, a11y, asset architecture, cleanup, css sot cleanup, css module wiring, repo structure tidy, readiness, template pack, comments proof, copy registry guard, store proof, and ci:cloudflare.

Report files changed, More search behavior, Saved sheet parity, searchbar visual parity, guards/scripts changed, QA PASS/FAIL, warnings, and intentional non-changes.
