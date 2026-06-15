# CLINE SNIPER — TASK-002M-G Public DOM Template Completeness Pass

You are working on the GG vNext repo.

## Mission

Perform a template completeness pass over remaining `allowedSmall` and `allowedReviewed` `createElement(...)` occurrences.

The project has adopted this stronger rule:

```txt
Public UI should be template-first, editability-aware, scalability-aware, AI-agent-friendly, and friendly to humans who do not understand JavaScript.
```

`allowedSmall` and `allowedReviewed` do not mean “never migrate”. They mean “not a current violation”. If moving the element into a template improves editability and maintainability, do it.

## Read first

Open only these files first:

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `checks/public-dom.check.mjs`
- `tasks/active/TASK-002M-G-PUBLIC-DOM-TEMPLATE-COMPLETENESS-PASS.md`

Then run:

```bash
npm run check:public-dom
```

Use that output to inspect only the relevant files/lines.

## Classification decision

For every remaining `allowedSmall` and `allowedReviewed` occurrence, classify as one of:

- `templateMigrated`
- `allowedRuntime`
- `allowedParsing`
- `allowedDynamicData`
- `allowedSmallBehavior`

If user-visible UI is being assembled with createElement and it naturally belongs to a component/chrome template, migrate it into a purpose-specific template.

If it is a parsing helper, script loader, iframe loader, select option, temporary DOM, or data-only runtime node, keep it in JS and document the rationale.

## Migration pattern

Preferred:

```js
const template = document.getElementById('purpose-specific-template-id');
const node = template.content.cloneNode(true).firstElementChild;
// JS fills textContent/aria/data/state/icon and wires behavior.
```

Avoid creating visible UI structure in JS when that structure can live in HTML/XML.

## Template naming

Do not create generic templates.

Forbidden:

```txt
gg-template-div
gg-template-link
gg-template-element
gg-template-button
gg-template-generic
```

Use purpose-specific names only.

## Required output changes

Update:

- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- code/templates only if migration is justified
- `scripts/task002m-g-acceptance.sh` if missing or needing repo-specific adjustment

Do not modify generated outputs manually.

## Required final checks

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-g-acceptance.sh
```

## Final response

Report:

- before/after createElement counts
- migrated items and template IDs
- kept items and exact rationale category
- confirmation `needsTemplate=0` and `unclassified=0`
- no universal template introduced
