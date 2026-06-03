# Unused Cleanup Candidates

Audit date: 2026-06-03

This is an audit-only candidate list. No files were deleted. Each item needs confirmation before removal, especially tracked files or historical archives.

| Path | Type | Evidence | Risk | Suggested Action |
|---|---|---|---|---|
| `./.DS_Store` | macOS/system junk | `find . -name ".DS_Store" -o -name "__MACOSX"` found it; `.gitignore:2` ignores `.DS_Store`. | Low | Delete after approval. |
| `./tools/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./__gg/.DS_Store` | macOS/system junk in generated/runtime output | Found by required `find`; `__gg/` is generated/runtime asset space per `ASSET-ARCHITECTURE.md:24`. | Low | Delete after approval; regenerate assets if needed. |
| `./__gg/assets/.DS_Store` | macOS/system junk in generated/runtime output | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./dist/.DS_Store` | macOS/system junk in generated output | Found by required `find`; `dist/` is generated per `ASSET-ARCHITECTURE.md:25-28`. | Low | Delete after approval. |
| `./.cloudflare-build/public/__gg/assets/.DS_Store` | macOS/system junk in Cloudflare staging | Found by required `find`; `.cloudflare-build/*` is staging per `ASSET-ARCHITECTURE.md:30`. | Low | Delete or rebuild staging after approval. |
| `./.cloudflare-build/public/assets/.DS_Store` | macOS/system junk in Cloudflare staging | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete or rebuild staging after approval. |
| `./.cloudflare-build/public/store/.DS_Store` | macOS/system junk in Cloudflare staging | Found by required `find`; staging output. | Low | Delete or rebuild staging after approval. |
| `./qa/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./docs/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./pwa/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./task/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./.github/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./views/.DS_Store` | macOS/system junk | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./assets/.DS_Store` | macOS/system junk in public asset tree | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./store/.DS_Store` | macOS/system junk in Store output tree | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./src/.DS_Store` | macOS/system junk in source tree | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `./src/css/modules/.DS_Store` | macOS/system junk in source CSS module tree | Found by required `find`; ignored by `.gitignore:2`. | Low | Delete after approval. |
| `Archive backup 1.zip` | Ignored local archive | `find` found it; `du -sh` shows 4.6M; `git check-ignore -v` maps it to `.gitignore:49 (*.zip)`. | Low to medium | Delete after owner confirms no off-git handoff value. |
| `Archive backup 2.zip` | Ignored local archive | `find` found it; `du -sh` shows 8.5M; ZIP files are ignored by `.gitignore:49`. | Low to medium | Delete after owner confirms no off-git handoff value. |
| `Archive backup 3.zip` | Ignored local archive | `find` found it; `du -sh` shows 8.5M; ZIP files are ignored by `.gitignore:49`. | Low to medium | Delete after owner confirms no off-git handoff value. |
| `Archive.zip` | Ignored local archive | `find` found it; `du -sh` shows 9.0M; `git check-ignore -v` maps it to `.gitignore:49 (*.zip)`. | Low to medium | Delete after owner confirms no off-git handoff value. |
| `dist/gg-handoff.zip` | Generated handoff archive | `find` found it; `du -sh` shows 5.0M; `git check-ignore -v` maps it to `.gitignore:52 (dist/*.zip)`; `package.json` creates handoff ZIP via `gaga:handoff:pack`. | Low | Delete after approval; regenerate with `npm run gaga:handoff:pack` when needed. |
| `task/gg-95-percent-task-pack-v3-worker-boundary-updated.zip` | Ignored task-pack archive | `find` found it; `du -sh` shows 28K; ignored by `.gitignore:49`; extracted task folder exists under `task/gg_95_percent_task_pack_v3/`. | Medium | Keep until task-pack history is confirmed, then delete or move outside repo. |
| `task/index-backup.xml` | Tracked backup XML | `git ls-files` shows it is tracked; `rg` found no active build/QA references; `du -sh` shows 96K. | High | Do not delete automatically. Confirm whether it is still needed as recovery history. |
| `docs/archive/template-deprecated/*` | Tracked deprecated template archive | `docs/archive/template-deprecated/README.md` says files are retained only for historical reference and `index.xml` is current source of truth; `git ls-files` shows many tracked XML partials. | High | Keep unless an explicit archive-retention task approves pruning. |
| `qa/audit-output/zip-audit.latest.*` | Generated/advisory audit output | Listed by `find . -maxdepth 3 -type f`; `.gitignore:34` ignores `qa/audit-output/`; not part of runtime source. | Low | Delete if stale and regenerate when package audit is needed. |
| `qa/audit/asset-size.txt` and `qa/audit/first-paint-risk-grep.txt` | Generated/advisory audit output | Listed by repository inventory; used as audit evidence snapshots, not runtime. | Medium | Keep unless newer audit process replaces them; do not delete without QA owner approval. |
| `test-results/.last-run.json` | Local test runner output | Listed by repository inventory; `.gitignore:36` ignores `test-results/`; not source. | Low | Delete after approval. |
| `docs/archive/template-deprecated/template/partials/*.xml` | Deprecated HTML/XML fragments | README says not current source of truth and not to patch for production behavior. | High | Treat as historical archive, not active source; remove only with explicit archival decision. |

## Non-Candidates Confirmed During Audit

These looked cleanup-adjacent but have usage proof and should not be removed in a cleanup pass without a separate architecture decision:

| Path | Type | Evidence | Risk | Suggested Action |
|---|---|---|---|---|
| `registry/copy/gg-copy-en.json`, `registry/copy/gg-copy-id.json` | Copy registries | Referenced by multiple guards and scripts, including `qa/comments-proof-guard.mjs`, `qa/registry-contract-guard.mjs`, `qa/theme-contract-guard.mjs`, and `scripts/validate-package.py`. | High | Keep. |
| Root `gg-copy-en.json`, `gg-copy-id.json` | Runtime/QA copy wrapper | `qa/copy-registry-guard.mjs` parses root copy and registry copy together. | High | Keep until copy registry architecture changes. |
| `assets/dashboard/*`, `assets/knowledge base/*`, `assets/landing/*` | Route-specific public assets | Classified in `CSS-SOURCE-OF-TRUTH-REPORT.md` and guarded by `qa/css-source-visual-rhythm-guard.mjs`. | Medium | Keep unless those static routes are explicitly retired. |
| `src/js/modules/*` | Modular JS fragments | Documented as source in `ASSET-ARCHITECTURE.md:10`; several fragments are directly inspected by guards. | High | Keep. |
| `store/data/manifest.json`, `dist/store/data/manifest.json` | Generated Store data | Generated by Store build and verified by asset architecture guard. | High | Do not manually delete; regenerate from Store build if needed. |
