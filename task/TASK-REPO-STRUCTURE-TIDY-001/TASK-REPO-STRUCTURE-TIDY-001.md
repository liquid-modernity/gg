# TASK-REPO-STRUCTURE-TIDY-001 — Conservative Repo Folder Tidy

## Purpose

Tidy the repository structure without breaking build, Blogger SSR, Cloudflare deployment, Store generation, or CI guards.

This task is intentionally conservative. It is not a full repo restructure.

The goal is to reduce visible clutter, remove or quarantine obvious non-runtime clutter, and create clearer locations for task files, reports, and maintenance docs while preserving all runtime/build paths unless explicitly proven safe.

## Prerequisite

Before running this task, confirm whether `REPO-STRUCTURE.md` already exists.

If `REPO-STRUCTURE.md` does not exist, create it first in this task as a minimal repo map. Do not move runtime folders before the map exists.

The map must explain:

- `src/`
- `assets/`
- `__gg/`
- `dist/`
- `.cloudflare-build/`
- `store/`
- `registry/`
- `qa/`
- `tools/`
- `task/`
- root reports and maintenance docs

For each folder, document:

- purpose;
- editable or generated;
- whether it should be committed;
- build/sync owner;
- guard owner;
- whether humans/CODEX may edit directly.

## Scope

Allowed tidy actions:

1. Create or normalize documentation folders only if safe:
   - `task/`
   - `docs/`
   - `docs/reports/`
   - `docs/architecture/`
   - `docs/tasks/`
   - or a smaller equivalent if the repo already has a convention.

2. Move task `.md` files into `task/` or `docs/tasks/` only if:
   - no package/tool/QA script references their old path, or
   - references are updated safely.

3. Move purely documentary reports into `docs/reports/` only if:
   - package/QA/docs guards are updated;
   - links in `QA-COMMANDS.md`, `SOURCE-OF-TRUTH.md`, `ASSET-ARCHITECTURE.md`, and docs guards still pass.

4. Add `.gitignore` entries for local OS/archive clutter if missing:
   - `.DS_Store`
   - `__MACOSX/`
   - `*.zip`
   - `*.bak`
   - optional local scratch folders, only if clearly not runtime.

5. Remove tracked OS/archive clutter only if proven tracked and unused:
   - `.DS_Store`
   - `__MACOSX/`
   - old extracted task ZIP folders
   - stale local backup/snapshot files

6. Create a `REPO-TIDY-REPORT.md` documenting every move, deletion, and intentionally deferred item.

## Hard Non-Goals

Do not do these in this task:

- Do not move `src/`, `assets/`, `__gg/`, `dist/`, `.cloudflare-build/`, `store/`, `qa/`, `tools/`, or `registry/` unless the move is explicitly proven safe and all scripts/guards are updated.
- Do not move `index.xml`, `landing.html`, `store.html`, `worker.js`, `_headers`, `robots.txt`, `manifest.webmanifest`, or Cloudflare/Blogger-facing root files.
- Do not rename public asset paths.
- Do not change import paths unless the moved file is documentation-only.
- Do not rewrite build tooling.
- Do not simplify `index.xml` for aesthetics.
- Do not remove critical inline CSS/JS used for SSR, no-flash boot, Blogger fallback, schema, or first paint.
- Do not touch Blogger-native comments plumbing.
- Do not touch Blog1-safe schema protections.
- Do not reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops.
- Do not change route truth:
  - `/landing = Home`
  - `/ = Blog`
  - breadcrumb = `Home(/landing) -> Blog(/) -> current`

## Required Audit

Before moving or deleting anything, run repository searches for:

```bash
git status --short
find . -maxdepth 3 -type f | sort
git ls-files | sort
git ls-files | grep -E '(^|/)\.DS_Store$|^__MACOSX/'
rg -n "CLEANUP-REPORT|CSS-SOURCE-OF-TRUTH-REPORT|CSS-MODULE-BUNDLE-WIRING-REPORT|READINESS-85-REPORT|ASSET-ARCHITECTURE|SOURCE-OF-TRUTH|QA-COMMANDS|REPO-STRUCTURE" .
rg -n "task/|docs/reports|docs/tasks" package.json qa tools .github 2>/dev/null || true
```

If `.github/` is absent in the local archive, say so explicitly and do not claim workflow verification beyond the current repo contents.

## Required Classification

Create or update `REPO-STRUCTURE.md` with a table like this:

| Path | Role | Editable? | Generated? | Commit? | Owner | Guard | Notes |
|---|---|---:|---:|---:|---|---|---|
| `src/` | canonical source | yes | no | yes | humans/CODEX | asset/source guards | edit here |
| `__gg/` | staged generated public app assets | no | yes | depends on current repo policy | template pack | asset guard | do not edit manually |
| `dist/` | publish/build artifacts | no | yes | depends on current repo policy | build/template pack | asset guard | do not edit manually |

If a file/folder cannot be classified confidently, do not move it.

## Required Report

Create `REPO-TIDY-REPORT.md`.

It must include:

- before working tree status;
- after working tree status;
- moved files and old/new paths;
- deleted files with proof;
- `.gitignore` changes;
- docs/guard updates;
- files intentionally not moved;
- runtime folders intentionally not moved;
- known risks;
- exact QA commands run.

## Guard Requirements

Add or update a read-only guard if useful:

```txt
qa/repo-structure-tidy-guard.mjs
```

The guard should check:

- `REPO-STRUCTURE.md` exists;
- `REPO-TIDY-REPORT.md` exists;
- tracked `.DS_Store` and `__MACOSX/` are absent;
- root-level stale backup patterns are absent unless explicitly allowed:
  - `*.bak`
  - `*.bak.*`
  - `*.tmp`
  - `*.old`
- known deleted stale files do not return:
  - `_headers.bak.20260504-164650`
  - `_headers.bak.clean-20260504-165904`
  - `index.html.css.js.xml`
- documentation/report moves, if any, are referenced consistently by docs guards;
- no runtime folder was moved by this task.

If adding the guard, wire it into:

- `package.json`;
- `ci:qa`;
- `qa/ci-reconciliation-guard.mjs`;
- `QA-COMMANDS.md`;
- `SOURCE-OF-TRUTH.md`.

## Acceptance Criteria

This task is accepted only if:

- no runtime route behavior changes;
- no public asset path changes;
- no Blogger/Worker route truth changes;
- no generated-file primary fix is introduced;
- all moves/deletions are documented with proof;
- docs and guards agree on new locations;
- CI still passes;
- task does not become a broad repo rewrite.

## Required QA

Run the available equivalent commands. At minimum:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-semantic-ssr
npm run gaga:verify-schema-jsonld
npm run gaga:verify-registry-contract
npm run gaga:verify-a11y-static
npm run gaga:verify-asset-architecture
npm run gaga:verify-cleanup
npm run gaga:verify-css-sot-cleanup
npm run gaga:verify-css-module-wiring
npm run gaga:verify-85
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run store:proof
npm run ci:cloudflare
```

If a new guard is added:

```bash
npm run gaga:verify-repo-structure-tidy
```

## Final Report Required From CODEX

Report:

- task completed;
- whether `REPO-STRUCTURE.md` existed or was created;
- files moved;
- files deleted with proof;
- `.gitignore` changes;
- docs/guards/scripts changed;
- runtime folders intentionally not moved;
- QA commands run;
- PASS/FAIL;
- warnings;
- intentional non-changes.
