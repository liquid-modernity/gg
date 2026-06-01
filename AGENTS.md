# Agent Contract

This repository is the PakRPP 85 hardening workspace. Treat it as a Blogger-first, semantic, crawlable, accessible, mobile-first PWA-like site with explicit contracts and minimal edge fallback.

## Project Purpose

PakRPP serves three public surfaces:

- `/landing`: Home and identity surface.
- `/`: Blog and editorial archive.
- `/store`: Yellow Cart commerce surface.

Blogger XML is the canonical SSR source for Blog listing, post detail, page detail, labels, search, archive, and Blogger-native comments. Root/editorial CMS source is `pakrpp.blogspot.com` with public canonical base `https://www.pakrpp.com/`. Store product/content CMS source is `pakrppstore.blogspot.com`; optional `https://store.pakrpp.com/` is a source-only/backend host, while the public canonical Store route remains `https://www.pakrpp.com/store/`. Cloudflare Worker serves edge policy, static assets, static landing, static Store, redirects, headers, diagnostics, and development crawler lockdown. JavaScript enhances stable markup; it must not be the only source of meaningful content.

## Surface Route Meaning

- `/landing` means Home.
- `/` means Blog.
- `/store` means Store.
- Breadcrumb and schema route truth is `Home(/landing) -> Blog(/) -> current page/post`.
- Do not change this route truth unless a future explicit architecture task changes the contract.

## Hard No-Touch Areas

Do not rewrite or replace stable Store, Discovery, Shell, Preview, Theme, or Comments systems unless a guard proves a real defect. Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.

Do not:

- add override-only CSS or JS;
- patch over old patches;
- remove code without usage proof;
- hardblock post titles, URLs, or slugs;
- weaken QA guards;
- replace Blogger-native rendering or comments;
- let Worker author normal healthy Blogger UI;
- edit generated output as the only fix.

## Source Vs Generated Files

Change source files and rebuild artifacts. Generated files may change as build output, but they must not be the primary fix.

Primary source examples:

- `index.xml`
- `landing.html`
- `store.html`
- `src/js/gg-app.source.js`
- `src/js/modules/*`
- `src/css/gg-app.source.css`
- `src/css/gg-critical.source.css`
- `src/css/modules/*`
- `src/css/components/*`
- `src/store/*`
- `src/registry/*`
- `registry/copy/*`
- `qa/*`
- `tools/*`
- `.github/workflows/*`
- `package.json`

Generated or staged output examples:

- `__gg/assets/*`
- `dist/assets/*`
- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `.cloudflare-build/*`
- `store/data/manifest.json`
- `store/data/build-report.json`
- generated Store category pages such as `store/fashion/index.html` and transitional `store-fashion.html`

## How To Run QA

Use `QA-COMMANDS.md` as the command index. For routine local hardening, run at least:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
npm run ci:qa
npm run ci:cloudflare
```

Run live smoke only after deploy or when a task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.

## Blogger XML

`index.xml` is the live-parity Blogger template source. `tools/template-pack.mjs` builds `dist/blogger-template.publish.xml`, injects critical CSS from `src/css/gg-critical.source.css`, and syncs app CSS/JS assets from source into runtime output locations. Do not manually patch the publish artifact as the primary fix.

Blogger post/page rendering, native comments, threaded replies, labels, search, archives, canonical post URLs, and Blogger data expressions must remain Blogger-owned unless a guard-backed task explicitly changes that contract.

## Cloudflare Worker And Assets

`worker.js` is an edge governance layer, not a replacement CMS and not an HTMLRewriter repair path. It handles canonical host/HTTPS policy, static route serving, static Store routing, headers, cache/robots policy, diagnostics, flags, and PWA/static assets. It must not proxy or mutate all Blogger posts to hide Blogger, and it must not author normal healthy Blogger UI.

`tools/cloudflare-prepare.mjs` stages the Worker and static assets into `.cloudflare-build/public`. Treat `.cloudflare-build/*` as deploy staging output.

## Store Static Build

Store build/render/static source lives under `src/store/*`, with category route truth in `src/store/store-categories.config.mjs` and route derivation in `src/store/lib/store-routes.mjs`. Store product/content source is declared in `src/registry/gg-source-boundary.registry.js`: `pakrppstore.blogspot.com` and optional source-only `https://store.pakrpp.com/` feed the public canonical Store surface at `https://www.pakrpp.com/store/`. `npm run store:build` generates Store HTML/data artifacts and syncs Store runtime assets. Do not hand-edit generated Store category pages, Store data output, Worker category registry output, or runtime category config copies.

Use:

```bash
npm run store:build
npm run store:proof
npm run store:check:dev10
```

## Comments

Blogger native comments and threaded replies are protected surfaces. Enhancements may wrap, organize, and control sheets around native plumbing, but must not replace the native comment system, fetch/poll comment feeds as a substitute, duplicate composers, or break the single native iframe/composer contract.

Use:

```bash
npm run gaga:verify-comments-proof
```

## Sheets And Previews

Global More/Search/Discovery sheets, the global sheet controller, root article preview, and Store product preview share stable lifecycle expectations: one active foreground sheet, focus trapping, Escape close, drag handle semantics, and scroll reset on open/item-change/close. Do not fork sheet behavior into route-specific override controllers.

Use:

```bash
npm run gaga:verify-sheet-contract
npm run gaga:verify-preview-sheet
```

## Commit And Checkpoint Policy

Keep changes scoped to the active task. Do not start the next task. Before commit or handoff, report changed files, source/generated distinction, guards, package scripts, CI/GitHub Actions changes, exact QA commands, PASS/FAIL, warnings, and intentional non-changes.
