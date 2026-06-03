# Repository Dependency Map

Scope: planning-only dependency map for structure professionalization. Move risk here means risk of changing the path, not risk of normal source edits.

| Path/Script | Depends On | Writes To | Referenced By | Move Risk | Notes |
|---|---|---|---|---|---|
| `npm run build` | `gaga:sync-components`, `store:build`, `gaga:template:pack`, `tools/cloudflare-prepare.mjs` | `src/css/*` generated blocks, `landing.html` generated blocks, `src/store/store.css` generated blocks, `store/*`, `assets/store/*`, `dist/*`, `__gg/*`, `.cloudflare-build/*` | `package.json`, deploy scripts, CI docs | DO NOT MOVE | Aggregate mutating build path |
| `npm run ci:qa` | Many `qa/*` guards, `qa/template-fingerprint.mjs`, `qa/worker-syntax-check.mjs` | Read-only by contract | `package.json`, `.github/workflows/ci.yml`, `npm run ci:cloudflare` | HIGH | Package string contains many literal guard paths |
| `npm run ci:cloudflare` | `ci:store`, `ci:qa`, `qa/live-smoke-worker.sh` syntax check | Generated outputs through build subcommands | CI and deploy workflows | HIGH | GitHub Actions/Linux Node 20 is validation authority |
| `.github/workflows/ci.yml` | `npm ci`, `npm run ci:cloudflare`, Node 20 | Uploads artifacts on failure | GitHub Actions | DO NOT MOVE | Do not change for local macOS blocker |
| `.github/workflows/deploy-cloudflare.yml` | `npm ci`, `npm run ci:cloudflare`, `npm run deploy:cloudflare:prepared`, live smoke | Cloudflare deploy and artifacts | GitHub Actions | DO NOT MOVE | Production deploy workflow; structure changes require dedicated task |
| `.github/workflows/lighthouse-ci.yml` | Live routes `/`, `/landing`, `/search`, `/store` | Lighthouse uploaded artifacts | GitHub Actions schedule/manual | MEDIUM | Advisory workflow, still route-sensitive |
| `tools/template-pack.mjs` | `index.xml`, `src/css/gg-app.source.css`, `src/css/gg-critical.source.css`, `src/js/gg-app.source.js` | `dist/blogger-template.publish.*`, `__gg/assets/*`, `dist/assets/*` | `gaga:template:pack`, build, docs, guards | DO NOT MOVE | Hardcoded source/output paths |
| `tools/sync-shared-css-components.mjs` | `src/css/components/*`, `src/css/modules/detail-toolbar.css` | `src/css/modules/*` generated mirrors, generated CSS blocks in `src/css/gg-app.source.css`, `landing.html`, `src/store/store.css` | `gaga:sync-components`, build, CSS guards | HIGH | Mutates source files by design; path changes are broad |
| `tools/store-build.sh` | `src/registry/gg-source-boundary.registry.js`, `tools/build-store-static.mjs`, Store feed config | Store generated outputs | `store:build`, build, Store scripts | HIGH | Shell and Node path assumptions |
| `tools/build-store-static.mjs` | `store.html`, `worker.js`, `src/store/*`, `src/registry/*`, `assets/store` paths | `store.html` guarded regions, `worker.js` generated registry blocks, `assets/store/*`, `store/data/*`, `dist/store/data/*`, category pages | `store:build`, Store proof, preflight | DO NOT MOVE | Central Store generator; path literals are runtime-facing |
| `tools/proof-store-static.mjs` | `store.html`, `worker.js`, `assets/store/*`, `store/data/manifest.json`, `src/store/*` | Read-only | `store:proof`, Store check scripts | HIGH | Guard reads generated outputs by exact path |
| `tools/cloudflare-prepare.mjs` | `worker.js`, `_headers`, static public files, flags, generated Store/Blogger assets | `.cloudflare-build/*` | build, deploy tools, wrangler config | DO NOT MOVE | Staging path is hardcoded in `wrangler.jsonc` |
| `tools/cloudflare-deploy.mjs` | `.cloudflare-build/worker.js`, `.cloudflare-build/public/*`, Wrangler | Cloudflare deployment | deploy scripts/workflow | DO NOT MOVE | Requires prepared build layout |
| `tools/handoff-archive.mjs` | Git-visible files, `.gitignore`, `QA-COMMANDS.md` | `dist/gg-handoff.zip` by default | handoff scripts/docs | MEDIUM/HIGH | Archive output path and ignore policy are guarded |
| `qa/docs-contract-guard.mjs` | Root docs and `package.json` | Read-only | `gaga:verify-docs-contract`, `ci:qa` | MEDIUM | Root doc paths are exact |
| `qa/repo-structure-tidy-guard.mjs` | `REPO-STRUCTURE.md`, `REPO-TIDY-REPORT.md`, `.gitignore`, `package.json`, `qa/ci-reconciliation-guard.mjs`, `QA-COMMANDS.md`, `SOURCE-OF-TRUTH.md`, `index.xml` | Read-only | `gaga:verify-repo-structure-tidy`, `ci:qa` | HIGH | Locks current root/runtime layout |
| `qa/asset-architecture-guard.mjs` and CSS guards | `src/css/*`, `assets/*`, `__gg/*`, `dist/*`, `ASSET-ARCHITECTURE.md`, CSS reports | Read-only | `ci:qa` | HIGH | Source/generated parity relies on current paths |
| `qa/content-source-boundary-guard.mjs` | `src/registry/gg-source-boundary.registry.js`, Store/root source docs | Read-only | `ci:qa` | HIGH | Protects source domain split |
| `qa/copy-registry-guard.mjs` | Root copy JSON and `registry/copy/*` | Read-only | `ci:qa` | HIGH | Consolidation requires guard rewrite |
| `qa/schema-jsonld-guard.mjs` | `index.xml`, `landing.html`, `store.html`, `src/js/gg-app.source.js`, `store/data/manifest.json`, `QA-COMMANDS.md`, `SOURCE-OF-TRUTH.md` | Read-only | `ci:qa` | DO NOT MOVE for root files | Schema paths are literal |
| `qa/worker-syntax-check.mjs` | `worker.js` | Read-only | `ci:qa` | DO NOT MOVE | Worker root path is assumed |
| `worker.js` | Flags, static assets, Store route registry blocks, generated Store data, public route truth | Runtime responses only | Cloudflare Worker, preflight, Store proof, deploy | DO NOT MOVE | Worker must remain edge governance, not HTML repair layer |
| `index.xml` | Blogger data expressions, `__gg/assets/*`, CSS/JS generated assets, schema/comments contracts | Publish artifact through template pack | Template pack, preflight, schema, semantic guards | DO NOT MOVE | Blogger canonical SSR source |
| `landing.html` | Route CSS/JS, shared generated CSS blocks, schema | `.cloudflare-build/public/landing.html` through staging | Worker/static route, docs/guards | DO NOT MOVE | Public Home route contract |
| `store.html` | Store generated regions, `assets/store/*`, `store/data/build-report.json` | Store guarded regions | Store build/proof, Worker, preflight | DO NOT MOVE | Store public route root |
| `registry/*` | Copy/content/store/runtime data | Staged registry copies | Copy/registry guards, Worker/staging tools | DO NOT MOVE | Registry contract and root aliases need separate design |
| `src/registry/*` | Route/source/action/discovery registries | Runtime/build artifacts indirectly | Store build, app source, guards | DO NOT MOVE | High risk for source-domain and route truth |
| `src/js/modules/*` | App fragment references and controller/core/service ownership docs | None directly unless manually synced | Docs, guards, source maps | DO NOT MOVE | No deterministic JS fragment packer currently owns relocation |
| `src/css/modules/*` | Generated mirrors, wired module source, manual/advisory maps | Some files written by CSS sync tool | CSS sync, CSS guards, docs | DO NOT MOVE | Mixed status makes structure changes risky |
| `src/store/*` | Store build/render/runtime source | Store generated outputs | Store build/proof, docs, guards | DO NOT MOVE | Store route truth and generated artifacts depend on exact paths |
| `assets/store/*` | Generated Store runtime public assets | Written by Store build | Store HTML, preflight, Store proof, Worker static serving | DO NOT MOVE | Public URLs under `/assets/store/*` |
| `store/data/*` and `dist/store/data/*` | Store generated manifest/report data | Written by Store build | Store runtime/proof/workflow artifact upload | DO NOT MOVE | Public/debug artifacts and CI diagnostics |
| `dist/*` | Blogger/Store generated artifacts and publish output | Written by template pack/Store build | Build docs, guards, artifact upload, handoff tools | DO NOT MOVE | Generated output path is contract-bound |
| `.cloudflare-build/*` | Wrangler staging layout | Written by Cloudflare prepare | `wrangler.jsonc`, deploy tool/workflow | DO NOT MOVE | Staging layout is deploy config |
| `docs/archive/*` | Historical docs/templates | None | Docs, audit context | MEDIUM | Can be reorganized only with archive policy |
| `task/*` | Task prompts/history and backup XML | None | Human/Codex task workflow | MEDIUM | Spaces and archives are cleanup candidates, but protect `task/index-backup.xml` |

## Dynamic Path References

Static imports do not capture all path dependencies. Several guards and tools use literal strings, regex checks, route URLs, generated block markers, shell variables, and Cloudflare asset paths. Any future restructure must search both code and docs, then run the full guard set in GitHub Actions/Linux Node 20 or Docker/Linux Node 20.
