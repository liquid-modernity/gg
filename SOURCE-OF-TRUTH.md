# Source Of Truth Contract

This repository separates source, generated output, and deployment staging. Change source first, rebuild artifacts, then verify guards.

## Source Files

Primary source files include:

- `index.xml`: Blogger template source and live-parity carrier.
- `landing.html`: static Home/identity route source.
- `store.html`: Store root source/build input.
- `src/js/gg-app.source.js` and `src/js/modules/*`: Blogger app source JavaScript.
- `src/js/boot/*`: early boot scripts.
- `src/css/gg-app.source.css`, `src/css/gg-critical.source.css`, `src/css/modules/*`, and `src/css/components/*`: Blogger app CSS sources.
- `src/store/*`: Store source CSS, JS, config, rendering, validation, manifest, JSON-LD, route, and report logic.
- `src/registry/*`, `registry/copy/*`, `registry/content/*`, and `registry/store/*`: route/copy/action/icon/content/store registries.
- `src/landing/*`, `src/dashboard/*`, and `src/knowledge base/*`: static-surface source assets where applicable.
- `worker.js`: Cloudflare Worker edge governance source, including generated Store registry blocks only when rebuilt by Store tooling.
- `flags.json`, `registry/runtime/*`, and root copy JSON files used as runtime inputs.
- `qa/*`, `tools/*`, `scripts/*`, `.github/workflows/*`, `package.json`, and docs.

## Generated Files

Generated output includes:

- `__gg/assets/*`
- `dist/assets/*`
- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `dist/store-build-report.json`
- `store/data/manifest.json`
- `store/data/build-report.json`
- generated Store category and pagination pages under `store/*/index.html` and `store/*/page/*/index.html`
- transitional Store flat artifacts such as `store-fashion.html` and `store-fashion-page-2.html` when the artifact contract requires them
- runtime Store asset copies in `assets/store/*` when produced by `npm run store:build`

Generated files may be committed when the project expects committed artifacts, but they must be produced from source. Do not manually edit them as the primary fix.

## Deployment Artifacts

Deployment/staging artifacts include:

- `.cloudflare-build/*`
- `.cloudflare-build/public/*`
- Wrangler deployment output
- Blogger publish artifacts in `dist/blogger-template.publish.*`

`.cloudflare-build/*` is staging output from `tools/cloudflare-prepare.mjs`. `dist/blogger-template.publish.xml` is the Blogger upload artifact from `tools/template-pack.mjs`.

## Must Not Be Edited Manually

Do not manually patch these as the primary fix:

- `__gg/assets/*`
- `dist/assets/*`
- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `.cloudflare-build/*`
- `store/data/manifest.json`
- `store/data/build-report.json`
- generated Store category/pagination pages
- generated Store runtime config copies or Worker Store category registry output

If one of these files is wrong, fix the owning source and rebuild.

## How To Rebuild

Build Blogger publish artifact and runtime app assets:

```bash
npm run gaga:template:pack
```

Build Store artifacts:

```bash
npm run store:build
npm run store:proof
```

Prepare Cloudflare deployment staging:

```bash
node tools/cloudflare-prepare.mjs
```

Run full local Cloudflare CI gate:

```bash
npm run ci:cloudflare
```

For production Store readiness, use the strict production gate without weakening development gates:

```bash
GG_STORE_PRODUCTION_READINESS=1 npm run store:check:production
```
