# TASK-SHEET-SEARCH-VISUAL-PARITY-001

## Purpose

Unify sheet searchbar visual language, hover/focus behavior, Saved sheet parity, and More sheet search behavior across `/`, `/landing`, and `/store` without introducing patches, override layers, duplicate controllers, or new one-off visual systems.

This task is a focused UI/behavior parity task. It is not a redesign, not a route restructure, and not a runtime architecture rewrite.

## Current Live Issues

1. Saved sheet differs in height/content behavior between root `/` and `/landing`.
2. Discovery searchbar visual treatment differs between root, landing, and store.
3. Searchbar hover/focus border is too thick and inconsistent across surfaces.
4. More sheet searchbar visually differs from Discovery/root/landing searchbars.
5. More sheet searchbar does not filter/search visible More sheet contents.
6. More sheet searchbar hover/focus does not share the same visual contract as root/landing/store searchbars.
7. The post titled `todo` is a valid post and must not be removed, hidden, or treated as dummy content.

## Hard Constraints

Do not:

- add patch/override-only CSS;
- add a second searchbar visual system;
- create a parallel More-only search controller;
- create new random CSS/JS files outside the established source-of-truth flow;
- duplicate behavior already owned by an existing sheet/search/discovery controller;
- change route truth: `/landing = Home`, `/ = Blog`, breadcrumb `Home(/landing) -> Blog(/) -> current`;
- touch Blogger-native comments plumbing;
- touch Blog1-safe schema protections;
- reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops;
- change Store product source, Worker healthy-route UI, or critical inline CSS/JS unless an existing contract defect requires it;
- treat `todo` as dummy content.

## Implementation Principle

Use existing source-of-truth files, shared sheet/searchbar tokens, shared component classes, registry-driven labels, and existing centralized sheet/search/filter behavior.

If More sheet search requires logic, extend the existing centralized sheet/search/filter behavior instead of creating a new standalone More search controller.

The desired architecture is:

```text
shared searchbar visual contract
        -> Discovery / Saved / More adapters
shared sheet filter/search behavior
        -> surface-specific data scope only
```

## Required Audit

Audit these surfaces:

- `/`
- `/landing`
- `/store`
- Discovery sheet
- Saved tab/sheet state
- More sheet
- searchbar hover/focus/active states
- keyboard accessibility and accessible names

Audit likely source areas:

- `src/css/components/gg-more-sheet.css`
- `src/css/components/gg-discovery-sheet.css`
- wired/canonical `src/css/modules/*.css` only where applicable
- `src/css/gg-app.source.css` only through established bundle/source contract
- `src/js/gg-app.source.js` only if extending existing centralized sheet/search behavior
- `registry/copy/*` only if labels/microcopy need source-of-truth updates
- `index.xml`, `landing.html`, `store.html` only if existing markup lacks required semantic hooks; do not aesthetic-rewrite them

## Expected Result

- One shared searchbar visual language across root, landing, store, Discovery, Saved, and More.
- Thin consistent hover/focus border.
- More sheet search filters visible More sheet actions/sections.
- Saved sheet height/content behavior is consistent across root and landing.
- Root, landing, and store share the same visual rhythm for sheet searchbars.
- No duplicate controller, no override-only CSS, and no one-off surface patch.

## Guarding

If practical, add a read-only guard:

```text
qa/sheet-search-visual-parity-guard.mjs
```

The guard should check, where statically feasible:

- shared searchbar class/token contract exists;
- More sheet search input exists and has accessible name/placeholder from registry or existing copy source;
- More sheet searchable rows/actions expose filterable text/data hooks;
- Discovery/Saved/More searchbars do not use divergent one-off hover/focus classes;
- no new parallel More-only search controller file is introduced;
- no dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops return;
- `todo` is not blocked by cleanup/root-listing logic.

If adding/updating this guard, wire it into:

- `package.json`
- `ci:qa`
- `qa/ci-reconciliation-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

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
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-85
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run store:proof
npm run ci:cloudflare
```

If a new guard is added, also run it directly.

## Final Report Must Include

- files changed;
- whether More search now filters More sheet contents;
- whether Saved sheet root/landing parity is fixed;
- whether searchbar visual parity is fixed across root/landing/store;
- whether hover/focus border is now thin and consistent;
- guards/scripts changed;
- QA PASS/FAIL;
- warnings;
- intentional non-changes.
