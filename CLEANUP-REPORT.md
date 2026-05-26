# Cleanup Report

This report documents removals made under `TASK-CLEANUP-001`. No cleanup item is accepted without evidence.

## Removed

### `_headers.bak.20260504-164650`

Removed block/file: entire tracked backup header file.

Why it was unused/stale:

- The canonical Cloudflare Pages header source is `_headers`.
- `tools/cloudflare-prepare.mjs` requires and stages `_headers`, not timestamped backup files.
- `package.json`, `tools/*`, `qa/*`, `index.xml`, `landing.html`, `store.html`, Store build tools, Cloudflare prepare, and runtime JS/CSS do not reference this backup file.
- `diff -u _headers _headers.bak.20260504-164650` showed an older divergent header snapshot with stale `X-GG-Assets` markers.

How usage was checked:

- `git ls-files _headers.bak.20260504-164650 _headers` confirmed the backup and canonical files were tracked before removal.
- `rg -n -F "_headers.bak.20260504-164650" . --glob '!node_modules/**'` returned only the focused task file before removal.
- `diff -u _headers _headers.bak.20260504-164650` confirmed it was not equivalent to the current canonical header file.

Regression protection:

- `qa/css-source-of-truth-cleanup-guard.mjs` fails if `_headers.bak.20260504-164650` returns or if active build/runtime/source/docs files reference it.
- `npm run gaga:verify-css-sot-cleanup` is wired into `ci:qa`.
- Cloudflare staging still requires canonical `_headers`.

### `_headers.bak.clean-20260504-165904`

Removed block/file: entire tracked backup header file.

Why it was unused/stale:

- The canonical Cloudflare Pages header source is `_headers`.
- `tools/cloudflare-prepare.mjs` requires and stages `_headers`, not cleanup backup files.
- `package.json`, `tools/*`, `qa/*`, `index.xml`, `landing.html`, `store.html`, Store build tools, Cloudflare prepare, and runtime JS/CSS do not reference this backup file.
- `diff -u _headers _headers.bak.clean-20260504-165904` showed duplicated stale `__gg` sections and old `X-GG-Assets` markers.

How usage was checked:

- `git ls-files _headers.bak.clean-20260504-165904 _headers` confirmed the backup and canonical files were tracked before removal.
- `rg -n -F "_headers.bak.clean-20260504-165904" . --glob '!node_modules/**'` returned only the focused task file before removal.
- `diff -u _headers _headers.bak.clean-20260504-165904` confirmed it was not equivalent to the current canonical header file.

Regression protection:

- `qa/css-source-of-truth-cleanup-guard.mjs` fails if `_headers.bak.clean-20260504-165904` returns or if active build/runtime/source/docs files reference it.
- `npm run gaga:verify-css-sot-cleanup` is wired into `ci:qa`.
- Cloudflare staging still requires canonical `_headers`.

### `index.html.css.js.xml`

Removed block/file: entire tracked XML snapshot.

Why it was unused/stale:

- The canonical Blogger template source is `index.xml`.
- `tools/template-pack.mjs` reads `index.xml`, `src/css/gg-critical.source.css`, `src/css/gg-app.source.css`, and `src/js/gg-app.source.js`; it does not read `index.html.css.js.xml`.
- `package.json`, `tools/*`, `qa/*`, `landing.html`, `store.html`, Store build tools, Cloudflare prepare, and runtime JS/CSS do not reference this file.
- `diff -u index.xml index.html.css.js.xml` showed an older divergent Blogger template snapshot with stale title, schema, theme, listing, comment, and sheet behavior.

How usage was checked:

- `git ls-files index.html.css.js.xml index.xml` confirmed the snapshot and canonical source were tracked before removal.
- `rg -n -F "index.html.css.js.xml" . --glob '!node_modules/**'` returned only the focused task file before removal.
- `diff -u index.xml index.html.css.js.xml` confirmed it was not equivalent to the current canonical template.

Regression protection:

- `qa/css-source-of-truth-cleanup-guard.mjs` fails if `index.html.css.js.xml` returns or if active build/runtime/source/docs files reference it.
- `npm run gaga:verify-css-sot-cleanup` is wired into `ci:qa`.
- `npm run gaga:template:pack` and `qa/asset-architecture-guard.mjs` keep Blogger publish artifacts tied to canonical `index.xml`.

### `qa/live-smoke-worker 2.sh`

Removed block/file: entire tracked shell script.

Why it was unused/stale:

- The canonical worker live-smoke script is `qa/live-smoke-worker.sh`.
- `package.json` scripts route worker live smoke through `qa/live-smoke-worker.sh`.
- `QA-COMMANDS.md` documents `npm run gaga:verify-worker-live:strict`, which also resolves to `qa/live-smoke-worker.sh`.
- `qa/ci-reconciliation-guard.mjs` requires `gaga:verify-worker-live:strict`, not the space-suffixed script.
- `qa/live-smoke-worker 2.sh` was a shorter April worker-scope script and did not contain the current Store/static asset, retry, timeout, and aggregate contract checks in the canonical May script.

How usage was checked:

- `git ls-files 'qa/live-smoke-worker 2.sh' qa/live-smoke-worker.sh` confirmed both files were tracked before removal.
- `rg -F "live-smoke-worker 2.sh" . --glob '!qa/perf-baseline/**' --glob '!node_modules/**' --glob '!dist/**' --glob '!.cloudflare-build/**'` returned no references.
- `diff -u qa/live-smoke-worker.sh 'qa/live-smoke-worker 2.sh'` showed the removed file was an older divergent worker-scope implementation, not the current canonical script.
- `git log --oneline --follow -- 'qa/live-smoke-worker 2.sh'` showed the removed file was introduced as an old health/version validation helper, while `qa/live-smoke-worker.sh` has the subsequent live-smoke contract history.

Regression protection:

- `qa/cleanup-regression-guard.mjs` fails if `qa/live-smoke-worker 2.sh` returns or if package/QA docs reference it.
- `qa/ci-reconciliation-guard.mjs` keeps the canonical aggregate script wiring in place.
- `bash -n qa/live-smoke-worker.sh` is part of `npm run ci:cloudflare`.
- `npm run gaga:verify-worker-live:strict` remains the documented live smoke command.

## Intentionally Not Removed

- Blogger-native comments plumbing in `index.xml`, `src/js/gg-app.source.js`, and comments CSS remains intact.
- Blog1-safe schema protections remain intact; dynamic root `ItemList`, `data:schemaPosts`, and filtered root `data:posts` schema loops were not added.
- `calendar_add_on` remains because it is used by the dock contact icon registry and route surfaces.
- `appearance.system` runtime copy remnants were not removed in this task because no deletion proof showed they are unreachable in every runtime copy path; guards already protect public Light/Dark-only UI.
- Landing, Store, Discovery, Preview, Shell, Theme, and Worker route behavior were not changed.
- `CSS-SOURCE-OF-TRUTH-REPORT.md` documents current CSS/JS source/generated classifications and files intentionally kept for future cleanup discipline.
