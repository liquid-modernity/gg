# Asset Architecture Contract

PakRPP assets are owned by source files, generated artifacts, and deployment staging. Change the owning source first, rebuild with the documented tool, then verify parity.

## Source Files

Edited manually:

- `src/css/gg-app.source.css`, `src/css/gg-critical.source.css`, `src/css/modules/*`, and `src/css/components/*`: Blogger app CSS sources.
- `src/js/gg-app.source.js`, `src/js/modules/*`, and `src/js/boot/*`: Blogger app JavaScript sources.
- `src/store/store.css`, `src/store/store.critical.css`, `src/store/store-core.js`, `src/store/store-discovery.js`, `src/store/store.js`, `src/store/store-categories.config.mjs`, and `src/store/lib/*`: Store source assets and build logic.
- `index.xml`: Blogger template source.
- `landing.html` and `src/landing/*`: Home route source.
- `store.html`: Store root source/build input.
- `worker.js`, `manifest.webmanifest`, `sw.js`, `offline.html`, `robots.txt`, `_headers`, `flags.json`, icons, registries, docs, `qa/*`, `tools/*`, `.github/workflows/*`, and `package.json`.
- `CSS-SOURCE-OF-TRUTH-REPORT.md`: CSS/JS source/generated classification and stale-file deletion proof.

## Generated Files

Never edit manually as the primary fix:

- `__gg/assets/*`: Blogger runtime asset copies from `tools/template-pack.mjs`.
- `dist/assets/*`: Blogger publish asset copies from `tools/template-pack.mjs`.
- `dist/blogger-template.publish.xml` and `dist/blogger-template.publish.txt`: manual Blogger publish output from `tools/template-pack.mjs`.
- `assets/store/*`: Store runtime asset copies from `npm run store:build`.
- `store/data/manifest.json`, `store/data/build-report.json`, and `dist/store/data/*`: Store generated data.
- `store/{category}/index.html`, `store/{category}/page/{n}/index.html`, and transitional `store-*.html`: Store generated category artifacts.
- `.cloudflare-build/*`: Cloudflare deployment staging from `tools/cloudflare-prepare.mjs`.

`assets/` is public runtime space, not a blanket source folder. `assets/store/*` is generated from Store source, while route-specific public assets such as `assets/landing/*`, `assets/dashboard/*`, and `assets/knowledge base/*` are classified in `CSS-SOURCE-OF-TRUTH-REPORT.md`.

Generated files may be committed when the repository expects committed artifacts, but the fix belongs in source plus a rebuild.

## Build Outputs

Template-pack output, store-build output, and cloudflare-prepare output are the only accepted generated asset paths for this phase.

`npm run gaga:template:pack` reads `index.xml`, `src/css/gg-critical.source.css`, `src/css/gg-app.source.css`, and `src/js/gg-app.source.js`. It writes:

- `dist/blogger-template.publish.xml`
- `dist/blogger-template.publish.txt`
- `__gg/assets/css/gg-app.dev.css`
- `__gg/assets/css/gg-app.min.css`
- `__gg/assets/css/gg-critical.css`
- `__gg/assets/js/gg-app.dev.js`
- `__gg/assets/js/gg-app.min.js`
- matching `dist/assets/css/*` and `dist/assets/js/*`

`npm run store:build` reads Store source/config/feed inputs and writes:

- `assets/store/store.css`
- `assets/store/store-core.js`
- `assets/store/store-discovery.js`
- `assets/store/store.js`
- `store.html` guarded generated regions
- `store/data/manifest.json`
- `store/data/build-report.json`
- `dist/store/data/*`
- Store category and transitional flat artifacts
- generated Worker Store category registry blocks

`node tools/cloudflare-prepare.mjs` stages the verified tree into `.cloudflare-build/public` and copies `worker.js` into `.cloudflare-build/worker.js`. It does not deploy.

## Critical And External CSS

Critical CSS purpose: keep the first shell and no-JavaScript fallback readable before external CSS arrives.

Critical CSS is the minimal shell/no-flash CSS required before external app CSS loads. Blogger critical CSS source is `src/css/gg-critical.source.css`; Store critical CSS source is `src/store/store.critical.css`.

Non-critical CSS remains external:

- Blogger app CSS loads through `/__gg/assets/css/gg-app.min.css` in the default publish artifact.
- Store CSS loads through `/assets/store/store.css`.

External CSS purpose: carry the full visual system and route-specific refinements without duplicating that payload inline.

Do not duplicate broad app CSS into critical CSS as a shortcut. Do not patch generated CSS output without changing the source.

## Route Asset Map

`/` (Blog archive):

- Owner: Blogger `index.xml`.
- Critical CSS: `src/css/gg-critical.source.css` inlined into the Blogger publish artifact.
- External CSS: `/__gg/assets/css/gg-app.min.css`.
- JavaScript: `/__gg/assets/js/gg-app.dev.js`.
- Route truth: Blog, not Home.

`/landing` (Home):

- Owner: `landing.html` and static supporting assets.
- Loaded by Cloudflare/static route.
- Route truth: Home, not Blog.

`/store` (Yellow Cart):

- Owner: `store.html` plus `src/store/*`.
- Critical CSS: `src/store/store.critical.css` in guarded Store markup.
- External CSS: `/assets/store/store.css`.
- JavaScript: `/assets/store/store-core.js` with discovery source `/assets/store/store-discovery.js`.
- Data: `/store/data/manifest.json` and `/store/data/build-report.json`.

Post detail:

- Owner: Blogger `index.xml` and Blog1 data.
- Uses the same Blogger critical CSS, external CSS, and app JS as `/`.
- Breadcrumb/schema truth remains `Home(/landing) -> Blog(/) -> current post`.

Static Blogger page detail:

- Owner: Blogger `index.xml` unless the route is an explicit static Cloudflare surface such as `/landing` or `/store`.
- Uses the same Blogger critical CSS, external CSS, and app JS as `/`.
- Breadcrumb/schema truth remains `Home(/landing) -> Blog(/) -> current page`.

Store category:

- Owner: Store source/config and generated category artifacts.
- Canonical output: `store/{category}/index.html` and pagination under `store/{category}/page/{n}/index.html`.
- Transitional flat output remains only when the Store artifact contract requires it.

## Cache And Deployment Discipline

Development/staging cache policy should prefer short-lived or no-store behavior for HTML and diagnostics while still allowing static asset checks to prove parity. Production may use longer static caching only when generated assets remain deterministic and deploy artifacts are prepared from the same verified tree.

Production switch expectations: production may increase static asset caching only after the same source/generated parity guard and Cloudflare staging checks pass.

The verified artifact should be the deployed artifact. When CI, Cloudflare preparation, and deploy wrappers rebuild staging more than once, the rebuild inputs must be deterministic: source files, generated committed artifacts, Store reports, flags, registries, and Worker source must match before deployment.

Do not manually patch `.cloudflare-build`, `dist`, `__gg/assets`, `assets/store`, or `store/data` as the fix.

## Guard

Run the asset contract guard with:

```bash
npm run gaga:verify-asset-architecture
```

The guard is read-only and verifies asset hash parity, Blogger publish parity, Store asset freshness, Cloudflare staging parity when staging exists, package/CI wiring, and the Blog1-safe schema asset boundary.

Run the CSS/JS source-of-truth cleanup guard with:

```bash
npm run gaga:verify-css-sot-cleanup
```

That guard blocks known stale editable-looking files from returning, requires CSS module classification coverage, verifies generated CSS/JS parity, and preserves the Blog1-safe schema boundary.
