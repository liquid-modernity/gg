# Repo Structure Map

This map records the current repository shape for conservative maintenance. Runtime and build-facing paths are intentionally stable; do not move them unless a future task updates every owner, reference, and guard.

| Path | Role | Editable? | Generated? | Commit? | Owner | Guard | Notes |
|---|---|---:|---:|---:|---|---|---|
| `src/` | canonical source for Blogger app CSS/JS, route assets, Store source, registries, and build libraries | yes | no | yes | humans/CODEX | asset, CSS, registry, Store guards | edit source here first |
| `apps/console/` | local read-only GG Console control-plane dashboard | yes | no | yes | humans/CODEX | `npm run gg:console:check` | not a public runtime dependency; do not turn it into GG Studio/editor UI |
| `assets/` | public runtime asset space | mixed | mixed | yes for current policy | Store build, route asset owners | asset architecture guard | `assets/store/*` is generated; route-specific assets are public runtime files |
| `__gg/` | Blogger runtime app assets | no | yes | yes for current policy | `tools/template-pack.mjs` | asset architecture guard | do not edit manually |
| `dist/` | Blogger publish and build artifacts | no | yes | yes for current policy where tracked | template pack, Store build | asset architecture, template fingerprint | do not edit manually |
| `.cloudflare-build/` | Cloudflare deployment staging | no | yes | no | `tools/cloudflare-prepare.mjs` | asset architecture, ci:cloudflare | ignored staging output |
| `store/` | Store generated data and category route artifacts | no for generated artifacts | yes | yes for current policy | `npm run store:build` | Store proof, asset architecture | edit Store source under `src/store/*` |
| `registry/` | canonical copy/content/store/runtime registry data | yes | no | yes | humans/CODEX and registry tasks | registry and copy guards | preserve route/copy contract |
| `qa/` | read-only guards, smoke scripts, QA docs, legacy snapshots | yes | no for guards | yes | humans/CODEX | CI reconciliation guard | new major guards must be wired into package and docs |
| `tools/` | mutating build/deploy/sync tools | yes | no | yes | humans/CODEX | CI reconciliation, asset guards | tools may write generated artifacts |
| `task/` | task prompts and planning archives | yes | no | yes for task docs; archives ignored | humans/CODEX | repo structure tidy guard | documentation only; not runtime |
| `docs/` | supporting architecture, performance, extraction, and archive docs | yes | no | yes | humans/CODEX | docs guard where listed | documentation only |
| root reports and maintenance docs | current contract/report documents | yes | no | yes | humans/CODEX | docs, cleanup, readiness, repo tidy guards | keep root names unless all references are updated |
| root runtime files | Blogger, Store, Cloudflare, PWA, and public route entry points | yes | no | yes | humans/CODEX/build tools | semantic, schema, asset, Worker, Store guards | includes `index.xml`, `landing.html`, `store.html`, `worker.js`, `_headers`, `robots.txt`, `manifest.webmanifest`, `sw.js` |
| `dashboard.html` | experimental GG Blogger Studio prototype/reference | yes | no | yes | humans/CODEX | Console documentation and task contracts | not the final GG Console UI; extract ideas only |

## Root Reports And Maintenance Docs

Root-level reports are intentionally visible because guards and task contracts reference them by exact path:

- `SOURCE-OF-TRUTH.md`
- `ASSET-ARCHITECTURE.md`
- `CLEANUP-REPORT.md`
- `CSS-SOURCE-OF-TRUTH-REPORT.md`
- `CSS-MODULE-BUNDLE-WIRING-REPORT.md`
- `READINESS-85-REPORT.md`
- `REPO-TIDY-REPORT.md`

Moving these files requires updating `package.json`, `qa/*`, `QA-COMMANDS.md`, `SOURCE-OF-TRUTH.md`, `ASSET-ARCHITECTURE.md`, and any task references that name the old path.

## Edit Policy

- Edit source and docs directly.
- Rebuild generated artifacts with the owning tool.
- Do not manually patch generated or staged output as the primary fix.
- Do not move runtime folders or public asset paths during tidy-only work.
- Keep Blogger native comments, Blog1-safe schema, critical inline CSS/JS, and route truth unchanged.
