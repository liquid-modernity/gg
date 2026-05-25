# Architecture Contract

PakRPP is Blogger-first with static edge supplements. The architecture goal is contract locking and hardening, not a rebuild.

## Blogger XML SSR Role

`index.xml` is the canonical Blogger SSR template source for the Blog surface. Blogger owns normal rendering for:

- root Blog archive at `/`;
- post detail pages;
- static Blogger pages;
- labels, search, archive, pagination, and mobile query handling;
- native comments and threaded replies.

The template must remain meaningful without JavaScript. JavaScript enhances navigation, sheets, discovery, previews, comments presentation, saved state, and PWA behavior after Blogger has rendered useful HTML.

## Cloudflare Worker Role

`worker.js` is the edge governance layer. Its role is to enforce policy and serve explicit static assets, not to become a CMS.

Worker responsibilities:

- canonical host and HTTPS normalization;
- legacy/static route redirects;
- `/landing` and `/store` static route serving;
- Store clean-route normalization and static artifact lookup;
- flags and diagnostics;
- robots/cache/security headers;
- PWA files and static asset gateway;
- development crawler lockdown.

Worker non-goals:

- authoring normal healthy Blogger UI;
- replacing Blogger SSR;
- replacing Blogger-native comments;
- proxying and mutating all posts as a rendering strategy.

## Static Assets Role

Blogger app CSS/JS source lives in `src/css/*` and `src/js/*`. `tools/template-pack.mjs` copies the app bundles into `__gg/assets/*` and `dist/assets/*`. The Blogger publish artifact links runtime CSS/JS through `/__gg/assets/*`.

PWA/static files such as `manifest.webmanifest`, `sw.js`, `offline.html`, `robots.txt`, `_headers`, icons, copy registries, flags, and static route HTML are staged for Cloudflare by `tools/cloudflare-prepare.mjs`.

## Store Static Artifact Role

Yellow Cart is a static Store surface rooted at `/store`. Store source is under `src/store/*` and the root input is `store.html`. `npm run store:build` generates:

- root Store/runtime asset copies;
- category pages under `store/{category}/index.html`;
- paginated category pages under `store/{category}/page/{n}/index.html`;
- transitional flat artifacts when the Store artifact contract requires them;
- `store/data/manifest.json`;
- `store/data/build-report.json`;
- synced Worker Store category registry.

The Worker serves Store clean routes from those artifacts. Category config must be changed at source and rebuilt, not patched into generated pages or Worker output by hand.

## Landing Static Route Role

`/landing` is the Home and identity surface. Its source is `landing.html`, with supporting source under `src/landing/*` and runtime assets under `assets/landing/*` when present. `/landing` is not the Blog archive; `/` remains the Blog surface.

## Registry And Copy Role

Registry and copy files centralize shared labels, routes, actions, icons, filters, and content metadata. Source examples include:

- `src/registry/*`
- `registry/copy/*`
- root copy JSON aliases used for runtime compatibility
- `registry/content/*`
- `registry/store/*`

Do not duplicate copy, route names, icon names, or Store categories inside generated artifacts or one-off runtime patches when an existing registry/source config owns the contract.

## QA Guard Role

QA guards are executable contracts. They must be deterministic, read-only, and wired into `package.json` plus the relevant aggregate script when they protect a major contract. Guards print `PASS`, `PASS_WITH_WARNINGS`, or `CONTRACT_FAILURE`/failure status clearly and exit non-zero on contract failure.

Core guards protect comments, discovery, Store isolation, theme, shell, preview sheets, visual system, source/generated boundaries, Store artifacts, template fingerprints, Worker syntax, and these architecture docs.
