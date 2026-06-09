# Agent Contract

This repository is the PakRPP / GG product engineering workspace. Treat it as a Blogger-first, HTML-first, semantic, crawlable, accessible, registry-driven, mobile-first, product-grade web system with explicit source/generated boundaries.

The owner is a product-oriented vibe coder. Agents must reduce technical ambiguity, avoid hidden scope creep, and protect working contracts.

## Project Purpose

The product serves three public surfaces:

- `/landing` = Home / identity / landing surface.
- `/` = Blog / editorial archive / root listing / post detail / page detail.
- `/store` = Yellow Cart commerce surface.

Blogger XML is the canonical SSR source for the blog/root CMS surface: listing, post detail, page detail, labels, search, archive, and Blogger-native comments.

Root/editorial CMS source:

- `pakrpp.blogspot.com`
- public canonical base: `https://www.pakrpp.com/`

Store/product CMS source:

- `pakrppstore.blogspot.com`
- optional source-only/custom host: `https://store.pakrpp.com/`
- public canonical Store route remains: `https://www.pakrpp.com/store/`

Cloudflare Worker is an edge governance and static delivery layer. It must not replace Blogger as the normal CMS, must not use HTMLRewriter as CMS repair, and must not author normal healthy Blogger UI.

## Product Modules

- `GG Console` = configuration, CMS setup, registry inspection, source boundary validation, build, deploy, checks, and health dashboard.
- `GG Studio` = editorial workspace for posts, pages, products, drafts, editor, preview, publish, media, and gate validation.
- `Yellow Cart` = Store brand/module.
- `gg-*` = engine signature namespace. Preserve it as the public semantic/class/data hook signature.

Do not collapse GG Console and GG Studio into one confused dashboard. Console is control-plane-first. Studio is editor-first.

## Structure Mode

There are two valid structure modes.

### Current / legacy mode

Use current paths such as:

- `index.xml`
- `landing.html`
- `store.html`
- `worker.js`
- `src/`
- `registry/`
- `qa/`
- `tools/`
- `.github/workflows/`

Do not move files into `product/` unless the active task explicitly says repo-structure reconciliation is in scope.

### Target dev/product mode

After explicit repo-structure reconciliation, the dev repo root contains internal engineering systems, and `product/` contains the clean buyer repo.

Dev-only examples:

- `qa/`
- `tools/`
- `tasks/`
- `docs-internal/`
- `experiments/`
- `archives/`
- `release/`
- `tmp/`

Buyer/product examples:

- `product/apps/console/`
- `product/apps/studio/`
- `product/config/`
- `product/content/`
- `product/registry/`
- `product/src/`
- `product/templates/`
- `product/public/`
- `product/scripts/`
- `product/checks/`
- `product/docs/`
- `product/examples/`

## Surface Route Contract

Surface route meaning:

- `/landing` means Home.
- `/` means Blog.
- `/store` means Store.
- Breadcrumb and schema truth: `Home(/landing) -> Blog(/) -> current page/post`.
- Do not change route truth without an explicit architecture task.

## Hard No-Touch Areas

Do not rewrite or replace stable Store, Discovery, Shell, Preview, Theme, Comments, Blogger native rendering, or Worker behavior unless the active task demands it and a guard proves the defect.

Do not:

- add override-only CSS or JS;
- patch over old patches;
- remove code without usage proof;
- hardblock post titles, URLs, or slugs;
- weaken QA guards;
- replace Blogger-native rendering or comments;
- let Worker author normal healthy Blogger UI;
- edit generated output as the only fix;
- directly overwrite `index.xml` with an external version without a diff-based merge;
- restructure the repo while feature rescue tasks are still active.

## Source Vs Generated Files

Change source files and rebuild artifacts. Generated files may change as build output, but they must not be the primary fix.

Primary source examples:

- `index.xml`
- `landing.html`
- `store.html`
- `worker.js`
- `src/**/*`
- `registry/**/*`
- `config/**/*`
- `content/**/*`
- `templates/**/*`
- `qa/**/*`
- `tools/**/*`
- `scripts/**/*`
- `.github/workflows/*`
- `package.json`

Generated/staged examples:

- `__gg/assets/*`
- `dist/*`
- `.cloudflare-build/*`
- `store/data/*`
- generated Store category pages
- release packages and zips

## Skill Selection

Use private skills from `skills/*/SKILL.md` when the task matches:

- Feature add/revise/delete/change: `gg-feature-change`.
- Mockup-to-implementation or bad UI repair: `gg-ui-reconciliation`.
- Blogger XML / `index.xml` work: `gg-blogger-template-safe-edit`.
- GG Console / Studio / Blogger API setup: `gg-console-studio-cms-integration`.
- CI or GitHub Actions failures: `gg-ci-green-reconciliation`.
- Cleanup or deletion: `gg-safe-delete-cleanup`.
- Dev/product split or path migration: `gg-repo-structure-reconciliation`.
- Buyer package/release: `gg-release-packaging`.
- Minify/compress/source-map/output optimization: `gg-production-build-optimization`.
- Handoff to owner: `gg-agent-handoff`.

If multiple skills apply, use the most specific one first, then use `gg-ci-green-reconciliation` before handoff.

## How To Work

For minor safe changes, proceed directly but stay scoped.

For major changes, first produce a short plan:

1. goal;
2. files likely touched;
3. contracts at risk;
4. validation commands;
5. rollback plan.

Then implement only after the plan is consistent with the active task.

## Routine QA

How to run QA:

Use `QA-COMMANDS.md` as the current command index when present.

Routine local validation should include at least:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
npm run ci:qa
npm run ci:cloudflare
```

For root blog UX changes, prefer focused guards first:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:verify-semantic-ssr
npm run gaga:verify-a11y-static
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-filters
npm run gaga:verify-preview-sheet
npm run ci:qa
```

For future buyer/product repo validation, use buyer-safe commands:

```bash
npm run doctor
npm run build
npm run preview
```

From the dev root after product split:

```bash
npm --prefix product run doctor
npm --prefix product run build
```

## Store Static Build

Store static build remains owned by repo scripts such as `npm run store:build`, `npm run store:proof`, and aggregate CI commands. Do not hand-edit generated Store output as the primary fix.

## Sheets And Previews

Sheets and previews include global sheets, Blogger preview, Store preview, focus handling, drag handles, Escape close, and scroll reset contracts. Preserve shared sheet behavior unless an active task and guard prove a change is required.

## Commit And Checkpoint Policy

Commit and checkpoint policy: keep changes scoped to the active task, report source/generated changes and exact validation results, and do not claim green status unless the command actually passed.

## Pre-Commit Policy

A local pre-commit hook may run only fast, shell-only checks such as conflict markers, accidental secrets, large files, `.env`, debug files, and generated artifacts.

Do not move full linting, testing, build, Lighthouse, or deploy checks into pre-commit. CI remains the real gate.

## Production Build Policy

Production `dist/` should be generated, minified where safe, compressed where deploy supports it, and reproducible.

Do not rely on VS Code minifier extensions as the official production pipeline. Official output must come from repo scripts and CI.

Source maps may be generated for debugging, but must not be deployed publicly unless the active release policy explicitly permits it. Prefer private release artifacts for `.map` files.

Obfuscation is optional and never a security boundary. Do not place secrets in frontend code.

## Handoff Policy

Before handoff, report:

- changed files;
- source vs generated distinction;
- commands run;
- PASS/FAIL results;
- warnings;
- intentional non-changes;
- remaining blockers;
- next recommended action.

Do not claim green status unless the command actually passed.
