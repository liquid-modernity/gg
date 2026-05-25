# Cleanup Report

This report documents removals made under `TASK-CLEANUP-001`. No cleanup item is accepted without evidence.

## Removed

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
