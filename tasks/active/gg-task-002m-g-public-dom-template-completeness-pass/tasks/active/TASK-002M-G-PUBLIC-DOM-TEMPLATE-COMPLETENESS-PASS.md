# TASK-002M-G — Public DOM Template Completeness Pass

## Status
Pending.

## Context

After TASK-002M-F, structural public UI generation was migrated to HTML/XML templates. `check:public-dom` should now show no obvious structural DOM violations:

```txt
needsTemplate=0
unclassified=0
```

But some `document.createElement(...)` occurrences remain as `allowedSmall` and `allowedReviewed`.

This task is a **template completeness pass**: do not assume allowed means ideal. If an allowed element is user-visible UI that would be easier for humans and AI agents to edit as template markup, move it into a purpose-specific template.

## Product principle

Public UI should be:

```txt
template-first
editability-aware
scalability-aware
AI-agent-friendly
non-JS-human-friendly
```

JavaScript should own behavior and state, not hide user-visible structure.

## Scope

Public surfaces and public runtime code:

- `apps/blog/index.xml`
- `apps/store/store.html`
- `apps/landing/landing.html`
- `src/modules/**/*.js`
- `src/modules/**/*.mjs`
- `src/entries/**/*.js`
- `src/entries/**/*.mjs`
- existing public DOM policy/check/docs

## Required work

1. Run `npm run check:public-dom` and record the current summary.
2. Inspect all remaining `allowedSmall` occurrences.
3. Inspect all remaining `allowedReviewed` occurrences.
4. For each occurrence decide:
   - `templateMigrated` — moved into an existing or new purpose-specific template.
   - `allowedRuntime` — runtime-only/infrastructure-only, should stay JS.
   - `allowedParsing` — parsing/extraction/temporary DOM, should stay JS.
   - `allowedDynamicData` — dynamic image/iframe/script/select/option/data-driven element, should stay JS.
   - `allowedSmallBehavior` — tiny state/label/icon helper, should stay JS.
5. If an occurrence is user-visible and part of a component/chrome structure, migrate it into the template for that component.
6. Update `config/public-dom-generation-policy.json` with a `templateCompletenessAudit` section or equivalent reviewed occurrence rationale.
7. Update `docs/public-dom-generation-audit.md` with a TASK-002M-G section listing decisions and before/after counts.
8. Keep `check:public-dom` green with:

```txt
needsTemplate=0
unclassified=0
```

## Template rules

Use purpose-specific templates only.

Allowed examples:

```txt
gg-template-comment-reply-banner
gg-template-comment-more-menu
gg-template-comment-replies-context-row
gg-template-popular-range-link
store-semantic-category-chip-template
```

Forbidden generic examples:

```txt
gg-template-div
gg-template-link
gg-template-element
gg-template-button
gg-template-generic
```

## What should remain in JS

Do not migrate these merely to reduce the count:

- temporary parsing DOM
- HTML strip helpers
- script loader nodes
- iframe embed nodes when truly dynamic infrastructure
- select options generated from dynamic data
- dynamic image nodes where no stable template improves editability
- tiny span/label nodes that are not part of a visible templateable component

## Out of scope

- OAuth/auth/Blogger API implementation
- Console redesign
- Studio redesign
- Store folder restructure
- deleting `legacy-donor/`
- deleting `legacy-app` bridge
- dependency installs
- manual edits to `dist/**` or `.cloudflare-build/**`

## Acceptance command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-g-acceptance.sh
```

## Expected final report

The final report must include:

- before/after `createElement` count
- before/after `allowedSmall` count
- before/after `allowedReviewed` count
- migrated items and target template IDs
- kept items and rationale
- confirmation `needsTemplate=0` and `unclassified=0`
