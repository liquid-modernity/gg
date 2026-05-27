# TASK-COMMENTS-SHEET-EMPTY-PAGING-PARITY-001

## Scope

Run this focused task only. Do not start any other task.

This task improves the Blogger-native comments sheet empty state and short-list/paging behavior for post/page detail surfaces. It must preserve the existing Blogger comments engine and the current sheet architecture.

## Problem

Live screenshots show two UX issues in the comments sheet:

1. When a post/page has **0 comments**, the comments sheet body looks empty/broken. It needs a minimal intentional empty state, not a blank panel.
2. When a post/page has **1 comment** or the list does not exceed the viewport, the sheet should not show an invalid or misleading `Load more...` affordance unless there is a real Blogger continuation/pagination state.

The sheet height should remain stable. Do not aggressively resize the sheet based on comment count.

## Product Decision

### 0 comments

Add short empty-state microcopy. Keep it quiet and non-marketing.

Preferred English copy:

```text
No comments yet.
Be the first to comment.
```

Preferred Indonesian copy if the active UI/copy registry requires Indonesian:

```text
Belum ada komentar.
Jadilah yang pertama berkomentar.
```

The footer/composer CTA remains available.

### 1 or few comments

Do not shrink the sheet to the comment count. Preserve stable sheet geometry and sticky footer behavior.

If `Load more...` is shown without real comment pagination/continuation, fix the condition so it only appears when valid.

### Many comments

Keep existing scroll behavior. The comments content area may scroll; the composer/footer must remain stable and sticky within the sheet.

## Hard Constraints

- Do not replace Blogger-native comments.
- Do not create a new comments engine.
- Do not create a parallel comments controller.
- Do not add patch/override-only CSS or JS.
- Do not hide native comments by brute force.
- Do not simplify `index.xml` for aesthetics.
- Do not change route truth:
  - `/landing = Home`
  - `/ = Blog`
  - breadcrumb = `Home(/landing) -> Blog(/) -> current`
- Do not touch Blog1-safe schema protections.
- Do not reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops.
- Do not change Worker healthy-route UI behavior.
- Do not change Store product source.
- Do not touch critical inline CSS/JS unless a current guard proves a specific contract defect.

## Implementation Principles

Use existing comments sheet structure, registry/copy source, and shared sheet tokens. If logic is needed, extend existing comments behavior in the existing centralized runtime path. Do not add a standalone comments-sheet script.

Prefer semantic and state-driven implementation:

- Add an explicit comments empty-state element/region if needed.
- Drive visibility from existing comment count/native Blogger state where possible.
- Use existing data attributes and comments proof architecture.
- Keep the footer/composer stable.
- Keep native Blogger plumbing intact.

## Likely Source Areas

Inspect before editing:

- `index.xml`
- `src/js/gg-app.source.js`
- canonical comments/sheet CSS source used by the existing bundle contract
- `src/css/gg-app.source.css` only through the established source/bundle contract
- `registry/copy/*` if empty-state copy should be centralized
- `qa/comments-proof-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

Do not assume every `src/css/modules/*.css` file is live-editable unless the CSS module wiring guard says it is.

## Required Audit

Check representative live/SSR states if possible:

- 0-comment post/page detail
- 1-comment post/page detail
- many-comment post/page detail
- comments sheet open/close
- native composer open state
- reply state if existing comments support replies
- `Load more...` / continuation affordance
- keyboard focus and accessible names
- sticky footer/composer behavior

## Required Behavior

### Empty state

For 0 comments:

- show minimal empty-state microcopy;
- keep Add comment / composer affordance available;
- do not leave a blank body that looks broken;
- do not render the empty state for posts that already have comments.

### Load more / continuation

- show `Load more...` only when there is a real continuation/paging condition;
- do not remove valid Blogger native pagination;
- do not hide continuation globally with CSS;
- if unsure whether Blogger native state is valid, document the condition and avoid destructive changes.

### Sheet height

- do not aggressively set height based on exact comment count;
- preserve stable comments sheet geometry;
- empty state may be centered inside the content area;
- comments list should scroll when content exceeds available space;
- footer/composer stays stable.

## Guards

Prefer updating `qa/comments-proof-guard.mjs` if practical instead of adding another overlapping guard.

Guard should verify, where statically possible:

- comments empty-state copy exists in source/copy contract;
- empty-state element does not replace native Blogger comments plumbing;
- Blogger-native markers remain present;
- `Load more...` is not globally forced visible by static markup/CSS;
- Blog1-safe schema exclusions remain intact;
- comments sheet footer/composer markers remain present.

If a new guard is required, wire it into:

- `package.json`
- `ci:qa`
- `qa/ci-reconciliation-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

## Required QA

Run at minimum:

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
npm run gaga:verify-comments-proof
npm run gaga:verify-85
npm run gaga:template:pack
node qa/copy-registry-guard.mjs
npm run store:proof
npm run ci:cloudflare
```

If script names differ, use the existing package script names and document the difference.

## Final Report Required

Report:

- files changed;
- whether empty-state microcopy was added and where;
- whether copy was centralized or intentionally local;
- `Load more...` behavior decision;
- sheet height decision;
- native Blogger comments plumbing preservation;
- guard/script changes;
- QA commands run;
- PASS/FAIL;
- warnings;
- intentional non-changes.

## Acceptance Criteria

This task is accepted only if:

- 0-comment comments sheet no longer looks broken/blank;
- valid comment composer/Add comment affordance remains;
- 1-comment or short-list sheet does not show invalid `Load more...`;
- comments sheet geometry remains stable;
- native Blogger comments are preserved;
- no duplicate comments engine/controller is introduced;
- no override-only CSS/JS is added;
- relevant guards and CI pass.
