# TASK-CSS-MODULE-BUNDLE-WIRING-001 — CSS Module to Bundle Source-of-Truth Wiring

## Purpose

Fix the remaining CSS source-of-truth ambiguity after `TASK-CSS-SOURCE-OF-TRUTH-CLEANUP-001`.

The current problem is not merely "unused files". The deeper problem is that some files under `src/css/modules/*.css` or `src/css/components/*.css` may look like canonical editable source files, but are not actually consumed by the CSS sync/build/bundle pipeline. This misleads humans and AI coding agents: they edit a module, all QA may pass, but the visual change does not reach `src/css/gg-app.source.css`, generated assets, Cloudflare artifacts, or the live site.

This task must make the CSS source graph explicit and enforceable.

---

## Scope

Audit and reconcile the CSS module/component source graph for:

- `src/css/modules/*.css`
- `src/css/components/*.css`
- `src/css/gg-app.source.css`
- `src/css/gg-critical.source.css`
- `src/store/store.css`
- `assets/store/store.css`
- `__gg/assets/css/*`
- `dist/assets/css/*`
- `.cloudflare-build/public/__gg/assets/css/*`
- `tools/sync-shared-css-components.mjs`
- `tools/template-pack.mjs`
- asset/source-of-truth guards and docs

---

## Specific Known Case

Investigate this class of issue carefully:

- `src/css/modules/detail-toolbar.css`

If `detail-toolbar.css` exists and is meant to be edited by humans, it must be one of the following:

1. wired into the CSS sync/bundle pipeline so its content reaches `src/css/gg-app.source.css` and generated app CSS;
2. documented as a non-bundled/manual/advisory file that must not be treated as live source;
3. deleted if proven stale/unused.

Do not leave it in a misleading state where it appears canonical but is not consumed by the build.

---

## Definitions

### Canonical CSS source

A CSS file is canonical source only if one of the following is true:

- it is directly consumed by a build/sync/pack script;
- it is directly referenced by runtime HTML/XML;
- it is the manually edited source from which generated assets are derived;
- it is documented in `SOURCE-OF-TRUTH.md` or `ASSET-ARCHITECTURE.md` as intentionally canonical.

### Generated / staged CSS

Generated or staged CSS must not be edited manually. This includes, unless docs say otherwise:

- `__gg/assets/css/*.css`
- `dist/assets/css/*.css`
- `.cloudflare-build/public/__gg/assets/css/*.css`
- `assets/store/store.css` if copied from `src/store/store.css`

### Fake source

A fake source file is a file that looks like an editable source file but is not used by the runtime or build pipeline. Fake sources must be fixed by wiring, documentation, or deletion.

---

## Required Work

### 1. Map the CSS source graph

Create or update a report:

- `CSS-MODULE-BUNDLE-WIRING-REPORT.md`

The report must classify every relevant CSS file as one of:

- `CANONICAL_SOURCE`
- `GENERATED_OUTPUT`
- `STAGED_PUBLIC_ASSET`
- `CRITICAL_INLINE_SOURCE`
- `ROUTE_SPECIFIC_SOURCE`
- `ADVISORY_OR_MANUAL`
- `UNUSED_OR_STALE`
- `UNKNOWN_REQUIRES_REVIEW`

For each CSS module/component file, record:

- file path;
- whether it is referenced by `tools/sync-shared-css-components.mjs`;
- whether it is referenced by another build script;
- whether it appears in `src/css/gg-app.source.css`;
- whether it is referenced by HTML/XML/JS;
- final decision: wire, keep documented, or delete.

### 2. Fix misleading module files

For every CSS module/component that appears canonical but is not consumed:

- wire it into the bundle pipeline, or
- explicitly document it as advisory/manual, or
- delete it only with proof.

No module may remain ambiguous.

### 3. Detail toolbar decision

For `src/css/modules/detail-toolbar.css`, make a clear decision.

Preferred outcome if it is live UI styling:

- wire `src/css/modules/detail-toolbar.css` into the sync/bundle pipeline;
- ensure changes flow to `src/css/gg-app.source.css`;
- ensure generated/staged assets update through `npm run gaga:template:pack`;
- update guards so future edits cannot be silently ignored.

Alternative acceptable outcome:

- if the repo intentionally keeps detail-toolbar styling directly in `src/css/gg-app.source.css`, document `src/css/modules/detail-toolbar.css` as non-canonical or remove it if stale.

Unacceptable outcome:

- leaving `detail-toolbar.css` as a fake source.

### 4. Preserve critical compromises

Do not turn this into a broad refactor.

Keep intentionally inline or Blogger-owned assets where needed:

- critical CSS/JS for SSR/first paint/no-flash boot;
- Blogger `index.xml` SSR ownership;
- schema JSON-LD;
- Blogger-native comments plumbing;
- Blog1-safe schema protections.

### 5. Update documentation

Update, as needed:

- `SOURCE-OF-TRUTH.md`
- `ASSET-ARCHITECTURE.md`
- `QA-COMMANDS.md`
- `CSS-SOURCE-OF-TRUTH-REPORT.md`
- `CLEANUP-REPORT.md`
- new `CSS-MODULE-BUNDLE-WIRING-REPORT.md`

Docs must clearly explain the folder distinction:

- `src/` = human-editable source unless explicitly generated;
- `src/css/modules/` and `src/css/components/` = canonical only when wired or documented;
- `src/css/gg-app.source.css` = app CSS assembly/source-of-truth according to current contract;
- `__gg/assets/` = generated/staged runtime assets, not manual edit targets;
- `assets/` = route/public assets, some may be copied from source;
- `dist/` = build/publish artifacts;
- `.cloudflare-build/` = deploy staging output.

### 6. Add or update guard

Add or update:

- `qa/css-module-bundle-wiring-guard.mjs`

The guard should be read-only and deterministic.

It should fail if:

- a `src/css/modules/*.css` or `src/css/components/*.css` file is neither wired, documented, nor explicitly exempted;
- known fake source files remain ambiguous;
- `src/css/modules/detail-toolbar.css` exists but is not wired or documented;
- generated CSS differs from canonical source after build/pack;
- docs mention a CSS source contract that the build pipeline does not enforce.

It should pass only when each module has a clear status.

Wire the guard into:

- `package.json`
- `ci:qa`
- `qa/ci-reconciliation-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

Suggested script name:

```json
"gaga:verify-css-module-wiring": "node qa/css-module-bundle-wiring-guard.mjs"
```

---

## Hard Constraints

Do not:

- rewrite stable runtime behavior;
- add override-only CSS/JS;
- remove CSS/JS/HTML without proof;
- edit generated files as the primary fix;
- simplify `index.xml` just for aesthetics;
- remove Blogger-native comments plumbing;
- remove Blog1-safe schema protections;
- reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops;
- change route truth:
  - `/landing = Home`
  - `/ = Blog`
  - breadcrumb = `Home(/landing) -> Blog(/) -> current`
- change Worker healthy-route UI behavior;
- modify Store, Discovery, Preview, Shell, Theme, Blog1, or comments runtime behavior unless a CSS source graph defect specifically requires it and the change is justified.

---

## Required Checks Before Editing

Run or inspect:

```bash
git status --short
find src/css -type f | sort
rg -n "detail-toolbar|gg-detail-toolbar" src/css tools qa index.xml landing.html store.html src/js assets package.json ASSET-ARCHITECTURE.md SOURCE-OF-TRUTH.md
rg -n "src/css/modules|src/css/components|gg-app.source.css|sync-shared-css-components" tools qa package.json ASSET-ARCHITECTURE.md SOURCE-OF-TRUTH.md QA-COMMANDS.md
sed -n '1,260p' tools/sync-shared-css-components.mjs
```

---

## Required QA

Run:

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

If a command name differs, add or document the correct package script.

---

## Acceptance Criteria

This task is accepted only if:

- every CSS module/component has a clear status;
- no fake CSS source remains undocumented;
- `detail-toolbar.css` is wired, documented, or deleted with proof;
- generated CSS is not edited as the primary fix;
- any new/updated guard is wired into `ci:qa`;
- `ci:cloudflare` exits `0`;
- `CSS-MODULE-BUNDLE-WIRING-REPORT.md` explains what changed and why;
- the final report lists:
  - files changed;
  - files wired;
  - files deleted with proof, if any;
  - files intentionally kept;
  - source/generated classification changes;
  - guards/scripts changed;
  - QA PASS/FAIL;
  - warnings;
  - intentional non-changes.

---

## Final Report Template

Use this structure in the final response:

```md
Task completed: TASK-CSS-MODULE-BUNDLE-WIRING-001 only.

Working tree:
- Before:
- After:

Files changed:
-

CSS source graph decisions:
- Wired:
- Documented/manual:
- Deleted with proof:
- Intentionally kept:

Known case:
- src/css/modules/detail-toolbar.css:
  - Decision:
  - Evidence:
  - Guard protection:

Guards/scripts changed:
-

QA:
- PASS:
- PASS_WITH_WARNINGS:
- FAIL:

Warnings:
-

Intentional non-changes:
-
```
