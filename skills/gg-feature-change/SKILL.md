---
name: gg-feature-change
description: Use when the owner asks to add, revise, replace, delete, or change a feature at minor or major level in the PakRPP / GG product workspace.
---

# GG Feature Change Skill

Use this skill for any feature-level request, including “add this”, “change that”, “delete this”, “make it like the mockup”, “fix this behavior”, or “replace this feature”.

## Prime Directive

Make changes contract-first, not patch-first.

A feature is complete only when:

1. the intended user experience is implemented;
2. the source of truth is updated;
3. affected registry/config/copy/contracts are reconciled;
4. accessibility and crawlability are preserved;
5. relevant guards pass;
6. handoff states what changed and what did not change.

## Triage

Classify the request before editing:

- `minor`: copy, spacing, label, isolated CSS, one component behavior.
- `medium`: one module/surface, one registry change, one guard update.
- `major`: route, surface, build path, Blogger XML, public contract, store flow, CI, release packaging.

If the request is major, produce a brief plan before editing.

## Impact Map

Identify all affected layers:

- `surface`: root, article, page, landing, store, console, studio.
- `source`: Blogger XML, static HTML, JS module, CSS module, registry, config, copy, worker.
- `runtime`: user-visible DOM, data attributes, route behavior, sheet lifecycle, pagination, save state.
- `contracts`: SEO, schema, a11y, discovery taxonomy, nav order, comments, store source boundary.
- `outputs`: generated assets, template publish files, store artifacts, Cloudflare staging.

Do not start coding until you know the affected layers.

## Implementation Rules

- Prefer source-of-truth changes over overrides.
- Preserve `gg-*` class/data/function/semantic signature unless explicitly migrating it.
- Keep meaningful content available without JavaScript where public surfaces are involved.
- Do not weaken a guard to make a task pass.
- Do not silently remove an existing feature.
- Do not mix unrelated cleanup with feature implementation.
- Do not restructure repository paths unless the active task says repo reconciliation is in scope.

## Safe Workflow

1. Read `AGENTS.md`.
2. Read active task from `tasks/active/` if present.
3. Inspect existing implementation and guards.
4. Create a small change plan.
5. Modify source files.
6. Rebuild generated outputs only via owning tools.
7. Run focused checks.
8. Run broader CI checks when focused checks pass.
9. Produce handoff.

## Validation

Choose focused commands first. For root Blogger UX:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:verify-semantic-ssr
npm run gaga:verify-a11y-static
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-filters
npm run gaga:verify-preview-sheet
```

Then run:

```bash
git diff --check
npm run ci:qa
```

If Cloudflare/Worker/static assets changed:

```bash
npm run ci:cloudflare
```

## Handoff Format

Report:

- feature implemented;
- changed files;
- source/generated distinction;
- commands run;
- PASS/FAIL;
- known warnings;
- what was intentionally not changed;
- next safe task.
