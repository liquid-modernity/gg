# GG vNext — unified dev + product repo

This repository is a clean handoff-ready rebuild of the PakRPP / GG stack.
It intentionally combines development and product code in one repo while keeping a strict source/output boundary.

## Core rule

```txt
Human + AI edit: src/modules/*, apps/*, registry/*, config/*, public/*
Generated output: dist/*, .cloudflare-build/*
Never edit generated bundles as source.
```

## Surfaces

| Surface | URL | Purpose |
|---|---|---|
| Blog | `pakrpp.com` / `pakrpp.blogspot.com` | Public blog/root surface |
| Landing | `pakrpp.com/landing` | Marketing/landing surface |
| Store | `pakrpp.com/store`, `store.pakrpp.com`, `pakrppstore.blogspot.com` | Public store + Blogger source |
| Console | `console.pakrpp.com` or local | Admin/config/control plane |
| Studio | `studio.pakrpp.com` or local | Content/editor/publishing workspace |

## Quick start

```bash
npm install
npm run doctor
npm run build
npm run check
npm run console
npm run studio
```

Local Console: `http://127.0.0.1:8789`  
Local Studio: `http://127.0.0.1:8790`

## Source model

- `src/modules/<module>/` is the shared source edit area for both human and AI.
- `registry/modules.json` declares which module files are bundled.
- `registry/microcopy.*.json`, `registry/icons.json`, `config/blogger.targets.json`, and `config/domains.config.json` are Console-owned configuration files.
- `apps/console` is the control plane.
- `apps/studio` consumes Console config for Blogger Blog ID / Store Blog ID and publishing target selection.

## Build model

```txt
src/modules + apps + registry + config + public
  -> tools/build.mjs
  -> dist/dev       readable bundle
  -> dist/prod      minified bundle
  -> .cloudflare-build/public
```

## Important note about legacy JS

The uploaded legacy repo had many `*.fragment.js` files that are not standalone syntax-valid modules.
To keep this repo immediately green for npm checks, the valid legacy aggregate app is preserved as `src/modules/legacy-app/legacy-app.js`.
Code Agent should gradually extract that bridge into proper per-module JS files under `src/modules/*`.
See `tasks/active/TASK-001-split-legacy-js-bridge.md`.
