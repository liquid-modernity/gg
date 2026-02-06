# TASK LOG (append-only)
Last updated: 2026-02-06

> Purpose: immutable-ish history for AI context + audit trail.
> Rule: NEVER rewrite old entries. Only append.
> Timezone: Asia/Jakarta (UTC+7)

---

## ENTRY TEMPLATE (DO NOT DELETE)
- DATE:
- TASK_ID:
- TITLE:
- MODE (DEV/PROD impact):
- RELEASE_ID:
- SCOPE:
- CHANGES (files touched):
- COMMANDS RUN (local):
- CI STATUS:
- DEPLOY STATUS:
- VERIFY (URLs + expected):
- NOTES (gotchas):
- RISKS:
- NEXT:

---

## 2026-02-05 — TASK-0001 — Audit Report
- DATE: 2026-02-05
- TASK_ID: TASK-0001
- TITLE: System audit (Worker + assets + XML + SW + CI)
- MODE (DEV/PROD impact): none (report only)
- RELEASE_ID: n/a
- SCOPE: audit only
- CHANGES (files touched): docs/audit/AUDIT_REPORT.md
- COMMANDS RUN (local): n/a
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): macOS 10.15 cannot run wrangler locally → deploy must be CI-only
- RISKS: manual paste XML can desync live vs repo
- NEXT: TASK-0002 (asset contract latest vs pinned)
---

## 2026-02-05 — TASK-0001.5 — Docs Harmonization Freeze
- DATE: 2026-02-05
- TASK_ID: TASK-0001.5
- TITLE: Docs harmonization freeze (resolve contradictions before implementation)
- MODE (DEV/PROD impact): docs-only (contract clarified)
- RELEASE_ID: 1ce85ce
- SCOPE: documentation only (no runtime changes)
- CHANGES (files touched): docs/AI/CONTEXT_PACK.md; docs/AGENTS.md; docs/DOCUMENTATION.md; docs/CLOUDFLARE_SETUP.md; docs/LOCAL_DEV.md; docs/roadmap.md; docs/tech-stack.md; docs/clustering-todo.md; docs/note for gaga.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): rg, nl, cat, ls (read-only)
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a (docs-only)
- NOTES (gotchas): CI-only deploy (macOS 10.15 cannot run wrangler); apex redirect via Cloudflare Redirect Rule (301)
- RISKS: docs may lead runtime implementation until code aligns with the new asset contract
- NEXT: TASK-0002
---

## 2026-02-05 — TASK-0001.5 — Verification Addendum
- DATE: 2026-02-05
- TASK_ID: TASK-0001.5
- TITLE: Verification (docs-only)
- MODE (DEV/PROD impact): none
- RELEASE_ID: 1ce85ce
- SCOPE: verification
- CHANGES (files touched): n/a
- COMMANDS RUN (local): ./scripts/gg verify
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): Warnings: main.js/main.css not found (root or public/assets/latest); TASK_report.md missing (not fatal)
- RISKS: none
- NEXT: TASK-0002
---

## 2026-02-05 — TASK-0001.6 — gg verify path updates
- DATE: 2026-02-05
- TASK_ID: TASK-0001.6
- TITLE: Update gg verify paths after dev→latest rename and TASK_REPORT rename
- MODE (DEV/PROD impact): tooling only
- RELEASE_ID: 1ce85ce
- SCOPE: tools/scripts:gg + ledger updates
- CHANGES (files touched): tools/scripts:gg; docs/ledger/TASK_REPORT.md; docs/ledger/TASK_LOG.md; docs/ledger/GG_CAPSULE.md
- COMMANDS RUN (local): ./scripts/gg verify
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): verify now checks public/assets/latest and TASK_REPORT.md
- RISKS: none
- NEXT: TASK-0002
---

## 2026-02-05 — TASK-0002 — Asset Release Contract (latest vs pinned)
- DATE: 2026-02-05
- TASK_ID: TASK-0002
- TITLE: Implement asset release contract (latest vs pinned)
- MODE (DEV/PROD impact): both (assets + cache policy + build)
- RELEASE_ID: c21421c
- SCOPE: worker cache policy, build outputs, asset verification, docs
- CHANGES (files touched): index.dev.xml; index.prod.xml; package.json; public/_headers; public/sw.js; src/worker.js; tools/release.js; tools/verify-assets.mjs; docs/release/ASSET_CONTRACT.md; public/assets/v/c21421c/main.js; public/assets/v/c21421c/main.css; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build; npm run verify:assets
- CI STATUS: n/a
- DEPLOY STATUS: n/a (CI-only wrangler)
- VERIFY (URLs + expected): n/a (local tooling only)
- NOTES (gotchas): DEV now uses same-domain /assets/latest; jsdelivr removed; build derives RELEASE_ID from git short SHA.
- RISKS: manual paste can still desync DEV/PROD if wrong XML is used.
- NEXT: TASK-0003
---

## 2026-02-05 — TASK-0002A — Contract cleanup (main-only + GG_CAPSULE md-only)
- DATE: 2026-02-05
- TASK_ID: TASK-0002A
- TITLE: Contract cleanup (main-only, GG_CAPSULE md-only, asset path consistency)
- MODE (DEV/PROD impact): tooling + docs only
- RELEASE_ID: c21421c
- SCOPE: scripts, verification, docs cleanup
- CHANGES (files touched): docs/AGENTS.md; docs/tech-stack.md; docs/roadmap.md; docs/note for gaga.md; tools/scripts:gg; tools/verify-worker.sh; docs/audit/AUDIT_REPORT.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): bash tools/check-links.sh; node tools/validate-xml.js; node tools/verify-assets.mjs
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): gg task now reads NEXT_TASK from docs/ledger/GG_CAPSULE.md; verify-worker uses /assets/latest
- RISKS: none
- NEXT: TASK-0003

---

## 2026-02-05 — TASK-0003 — Update deploy workflow (auto after CI + manual gated + smoke always)
- DATE: 2026-02-05
- TASK_ID: TASK-0003
- TITLE: Update deploy workflow (auto after CI + manual gated + smoke always)
- MODE (DEV/PROD impact): CI/CD workflow only
- RELEASE_ID: c21421c
- SCOPE: deploy workflow triggers, preflight gate, smoke tests, pipeline docs
- CHANGES (files touched): .github/workflows/deploy.yml; docs/ci/PIPELINE.md; package.json; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): bash tools/check-links.sh; node tools/validate-xml.js; node tools/verify-assets.mjs
- CI STATUS: n/a (local)
- DEPLOY STATUS: n/a (CI-only wrangler)
- VERIFY (URLs + expected): n/a (runs in Actions smoke)
- NOTES (gotchas): deploy workflow now triggers on CI workflow_run; manual dispatch enforces main and full preflight.
- RISKS: smoke relies on live endpoints; failures will block deploy.
- NEXT: TASK-0004

---

## 2026-02-05 — TASK-0001.5 — Doc contract normalization freeze
- DATE: 2026-02-05
- TASK_ID: TASK-0001.5
- TITLE: Doc contract normalization freeze (single truth + no drift)
- MODE (DEV/PROD impact): docs only
- RELEASE_ID: c21421c
- SCOPE: documentation authority ladder, context pack, audit snapshot handling
- CHANGES (files touched): docs/AI/CONTEXT_PACK.md; docs/DOCUMENTATION.md; docs/audit/AUDIT_REPORT.md; docs/audit/AUDIT_REPORT_2026-02-05.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a (docs-only)
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): audit report is now a snapshot; live state is only in GG_CAPSULE + index.prod.xml.
- RISKS: none
- NEXT: TASK-0004

---

## 2026-02-05 — TASK-0004 — CI gate upgrade (build + verifiers)
- DATE: 2026-02-05
- TASK_ID: TASK-0004
- TITLE: CI gate upgrade (build + verifiers)
- MODE (DEV/PROD impact): CI workflow only
- RELEASE_ID: c21421c
- SCOPE: CI workflow steps and pipeline docs
- CHANGES (files touched): .github/workflows/ci.yml; docs/ci/PIPELINE.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a (workflow + docs only)
- CI STATUS: n/a
- DEPLOY STATUS: n/a
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): CI now runs build + verifiers; package-lock is generated in CI if missing to allow npm ci.
- RISKS: CI time slightly increased due to build step.
- NEXT: TASK-0004A

---

## 2026-02-05 — TASK-0004.1 — Lockfile policy fix (npm ci deterministic)
- DATE: 2026-02-05
- TASK_ID: TASK-0004.1
- TITLE: Lockfile policy fix (commit lockfile + enforce npm ci)
- MODE (DEV/PROD impact): CI/deploy workflow only
- RELEASE_ID: c21421c
- SCOPE: lockfile commit, CI/deploy guards, pipeline docs
- CHANGES (files touched): package-lock.json; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm install --package-lock-only --ignore-scripts
- CI STATUS: expected green if lockfile present + build/verifiers pass
- DEPLOY STATUS: expected green if CI passes + smoke passes
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): CI/deploy now hard-fail if package-lock.json is missing.
- RISKS: none
- NEXT: TASK-0004A

---

## 2026-02-05 — TASK-0004.2 — Wrangler CI-only + local npm ci fix
- DATE: 2026-02-05
- TASK_ID: TASK-0004.2
- TITLE: Wrangler CI-only + local npm ci fix
- MODE (DEV/PROD impact): build/release tooling only
- RELEASE_ID: c21421c
- SCOPE: remove wrangler dependency, update workflows, update docs
- CHANGES (files touched): package.json; package-lock.json; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/LOCAL_DEV.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm install --package-lock-only --ignore-scripts
- CI STATUS: expected green (npm ci + build/verifiers)
- DEPLOY STATUS: expected green (wrangler-action with pinned version + smoke)
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): wrangler removed from repo deps; local deploy unsupported; npm ci should now work on macOS 10.15.
- RISKS: none
- NEXT: TASK-0004A

---

## 2026-02-05 — TASK-0004A — Remove apex route from wrangler config
- DATE: 2026-02-05
- TASK_ID: TASK-0004A
- TITLE: Remove apex route from wrangler config
- MODE (DEV/PROD impact): routing config + docs only
- RELEASE_ID: c21421c
- SCOPE: wrangler.jsonc routes, Cloudflare setup docs, ledger
- CHANGES (files touched): wrangler.jsonc; docs/CLOUDFLARE_SETUP.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/validate-xml.js; node tools/verify-assets.mjs
- CI STATUS: n/a (local)
- DEPLOY STATUS: n/a (CI-only)
- VERIFY (URLs + expected): curl -I https://pakrpp.com/ -> 301 Location: https://www.pakrpp.com/ ; curl -I https://www.pakrpp.com/__gg_worker_ping -> 200 + x-gg-worker-version
- NOTES (gotchas): apex must redirect via Cloudflare Redirect Rule; remove any existing `pakrpp.com/*` Worker route in dashboard.
- RISKS: none
- NEXT: TASK-0004B

---

## 2026-02-05 — TASK-0004B — DEV SW poisoning fix + /assets/latest SW rules
- DATE: 2026-02-05
- TASK_ID: TASK-0004B
- TITLE: DEV SW poisoning fix + /assets/latest SW alignment
- MODE (DEV/PROD impact): SW + client JS + docs
- RELEASE_ID: c21421c
- SCOPE: sw.js fetch rules, dev cleanup in main.js, SW strategy docs, ledger
- CHANGES (files touched): public/sw.js; public/assets/latest/main.js; docs/sw/SW_STRATEGY.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/validate-xml.js; node tools/verify-assets.mjs
- CI STATUS: n/a (local)
- DEPLOY STATUS: n/a (CI-only)
- VERIFY (URLs + expected): curl -I https://pakrpp.com/ -> 301 Location: https://www.pakrpp.com/ ; curl -I https://www.pakrpp.com/__gg_worker_ping -> 200 + x-gg-worker-version
- NOTES (gotchas): DEV cleanup runs on load and triggers one guarded reload if a controller existed.
- RISKS: none
- NEXT: TASK-0005

---

## 2026-02-05 — TASK-0004B.1 — Resilient SW install + inline DEV kill-switch
- DATE: 2026-02-05
- TASK_ID: TASK-0004B.1
- TITLE: Resilient SW install + inline DEV kill-switch
- MODE (DEV/PROD impact): SW + dev template + docs
- RELEASE_ID: 7ca1211
- SCOPE: sw.js install resilience, DEV inline cleanup in index.dev.xml, SW strategy docs, ledger
- CHANGES (files touched): public/sw.js; index.dev.xml; docs/sw/SW_STRATEGY.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/validate-xml.js; node tools/verify-assets.mjs
- CI STATUS: n/a (local)
- DEPLOY STATUS: n/a (CI-only)
- VERIFY (URLs + expected): curl -I https://pakrpp.com/ -> 301 Location: https://www.pakrpp.com/ ; curl -I https://www.pakrpp.com/__gg_worker_ping -> 200 + x-gg-worker-version
- NOTES (gotchas): DEV inline script runs before external JS to unregister SW + clear caches; one reload guarded by sessionStorage.
- RISKS: none
- NEXT: TASK-0005

---

## 2026-02-05 — TASK-0004B.2 — Auto-sync GG_CAPSULE release id + enforce ledger consistency
- DATE: 2026-02-05
- TASK_ID: TASK-0004B.2
- TITLE: Auto-sync GG_CAPSULE release id + enforce ledger consistency
- MODE (DEV/PROD impact): tooling + CI/deploy verification + docs
- RELEASE_ID: 7ca1211
- SCOPE: GG_CAPSULE AUTOGEN, release.js sync, verify-ledger, CI/deploy checks, pipeline docs
- CHANGES (files touched): docs/ledger/GG_CAPSULE.md; tools/release.js; tools/verify-ledger.mjs; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/verify-ledger.mjs
- CI STATUS: expected green if ledger matches build outputs
- DEPLOY STATUS: expected green if ledger matches build outputs
- VERIFY (URLs + expected): n/a
- NOTES (gotchas): run `npm run build` to sync release id and autogen block before commit.
- CORRECTION: /assets/dev is retired; current dev path is /assets/latest.
- RISKS: none
- NEXT: TASK-0005

---

## 2026-02-05 — TASK-0005 — Headers contract + deterministic verifier (CI) + live verifier (deploy)
- DATE: 2026-02-05
- TASK_ID: TASK-0005
- TITLE: Headers contract + deterministic verifier (CI) + live verifier (deploy)
- MODE (DEV/PROD impact): caching headers + CI/deploy verification
- RELEASE_ID: 40583c4
- SCOPE: headers contract docs, contract JSON, verify-headers script, CI/deploy hooks, worker/_headers alignment
- CHANGES (files touched): docs/perf/HEADERS_CONTRACT.md; tools/headers-contract.json; tools/verify-headers.mjs; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; src/worker.js; public/_headers; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/verify-headers.mjs --mode=config; node tools/verify-ledger.mjs
- CI STATUS: expected green if worker headers match contract
- DEPLOY STATUS: expected green if live headers match contract
- VERIFY (URLs + expected): see tools/headers-contract.json + live mode check in deploy
- NOTES (gotchas): `/manifest.webmanifest` and `/offline.html` now no-store; live checks run after deploy.
- RISKS: none
- NEXT: TASK-0006

---

## 2026-02-05 — TASK-0006 — CRP plan + perf budgets + CI budget guard
- DATE: 2026-02-05
- TASK_ID: TASK-0006
- TITLE: CRP plan + perf budgets + CI budget guard
- MODE (DEV/PROD impact): docs + deterministic budget verification (no runtime changes)
- RELEASE_ID: cab6705
- SCOPE: CRP plan doc, perf budgets JSON, verify-budgets script, CI/deploy hooks, pipeline docs, ledger updates
- CHANGES (files touched): docs/perf/CRP_PLAN.md; tools/perf-budgets.json; tools/verify-budgets.mjs; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/verify-budgets.mjs
- CI STATUS: expected green if budgets match built artifacts
- DEPLOY STATUS: expected green if preflight budgets match built artifacts
- VERIFY (URLs + expected): n/a (deterministic, no network)
- NOTES (gotchas): budgets are based on current artifact sizes with a 15% buffer; update budgets intentionally when assets grow.
- RISKS: overly tight budgets can block releases if not updated intentionally.
- NEXT: TASK-0006A

---

## 2026-02-05 — TASK-0006A — CRP Phase 1 (defer + idle bootstrap)
- DATE: 2026-02-05
- TASK_ID: TASK-0006A
- TITLE: CRP Phase 1 (defer + idle bootstrap)
- MODE (DEV/PROD impact): main.js boot sequencing + docs
- RELEASE_ID: 72ae928
- SCOPE: main.js Stage0/Stage1 bootstrap, deferred router binding, idle init, CRP plan update, ledger updates
- CHANGES (files touched): public/assets/latest/main.js; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build; node tools/verify-budgets.mjs; node tools/verify-ledger.mjs; node tools/verify-headers.mjs --mode=config; node tools/validate-xml.js
- CI STATUS: expected green if budgets and headers remain within contract
- DEPLOY STATUS: expected green (no deploy changes)
- VERIFY (perf steps): Chrome DevTools Performance → record cold load → confirm no long tasks >50ms during Stage 0 window
- NOTES (gotchas): router click interception now binds after DOMContentLoaded; app init is idle-deferred.
- RISKS: delaying app init may postpone some non-critical UI hydration.
- NEXT: TASK-0006B

---

## 2026-02-05 — TASK-0006B — Boot loader + late-load main.js (Phase 2 step 1)
- DATE: 2026-02-05
- TASK_ID: TASK-0006B
- TITLE: Boot loader + late-load main.js (Phase 2 step 1)
- MODE (DEV/PROD impact): boot.js loader + asset contract + docs
- RELEASE_ID: 8eb881b
- SCOPE: boot.js loader, release.js versioning for boot.js, HTML script swap, budgets, verifiers, CRP plan, ledger updates
- CHANGES (files touched): public/assets/latest/boot.js; index.dev.xml; index.prod.xml; tools/release.js; tools/perf-budgets.json; tools/verify-budgets.mjs; tools/verify-assets.mjs; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build; npm run verify:assets; node tools/verify-budgets.mjs; node tools/verify-ledger.mjs; node tools/verify-headers.mjs --mode=config; node tools/validate-xml.js
- CI STATUS: expected green if budgets and verifiers remain within contract
- DEPLOY STATUS: expected green (no deploy changes)
- VERIFY (perf steps): Chrome DevTools Performance → cold load → confirm main.js loads after idle/interaction and no long tasks >50ms before boot triggers.
- NOTES (gotchas): boot.js is the only initial script; instant.page now loads only after main.js and only in PROD.
- RISKS: delayed main.js may postpone non-critical interactivity until idle/first input.
- NEXT: TASK-0006C

---

## 2026-02-05 — TASK-0006C — CSS/fonts CRP stabilization
- DATE: 2026-02-05
- TASK_ID: TASK-0006C
- TITLE: CSS/fonts CRP stabilization
- MODE (DEV/PROD impact): HTML head changes + docs
- RELEASE_ID: d5a84a3
- SCOPE: font swap, remove unused font request, non-blocking CSS load + inline critical CSS, CRP plan update, ledger updates
- CHANGES (files touched): index.dev.xml; index.prod.xml; tools/perf-budgets.json; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build; npm run verify:assets; node tools/verify-budgets.mjs; node tools/verify-ledger.mjs; node tools/verify-headers.mjs --mode=config; node tools/validate-xml.js
- CI STATUS: expected green if budgets and verifiers remain within contract
- DEPLOY STATUS: expected green (no deploy changes)
- VERIFY (perf steps): DevTools Performance + Coverage → confirm only boot.js and critical CSS at first paint, main.css loads via preload/onload, no FOIT.
- NOTES (gotchas): only Material Symbols Rounded requested with display=swap; main.css now non-blocking.
- RISKS: brief FOUC possible if CSS preload delays on slow network.
- NEXT: TASK-0006D

---

## 2026-02-05 — TASK-0006D — Fonts non-blocking + inline CSS budget guard
- DATE: 2026-02-05
- TASK_ID: TASK-0006D
- TITLE: Fonts non-blocking + inline CSS budget guard
- MODE (DEV/PROD impact): HTML head changes + CI guard
- RELEASE_ID: a43be61
- SCOPE: font CSS preload+onload, inline CSS budget files + verifier, CI step, CRP plan + ledger updates
- CHANGES (files touched): index.dev.xml; index.prod.xml; tools/critical-inline-budget.json; tools/verify-inline-css.mjs; .github/workflows/ci.yml; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/verify-inline-css.mjs; npm run build; npm run verify:assets; node tools/verify-budgets.mjs; node tools/verify-ledger.mjs; node tools/verify-headers.mjs --mode=config; node tools/validate-xml.js
- CI STATUS: expected green if inline CSS budget stays within limits
- DEPLOY STATUS: expected green (no deploy changes)
- VERIFY (perf steps): DevTools Performance + Coverage → confirm font CSS is preload+onload and inline CSS stays minimal; no FOIT.
- NOTES (gotchas): inline CSS budget counts <style> blocks before main.css preload and <b:skin> CDATA.
- RISKS: small FOUC possible if font CSS preload is slow.
- NEXT: TASK-0006E

---

## 2026-02-05 — TASK-0006E — Boot policy tuning + CRP regression guard
- DATE: 2026-02-05
- TASK_ID: TASK-0006E
- TITLE: Boot policy tuning + CRP regression guard
- MODE (DEV/PROD impact): boot loader timing + CI guard
- RELEASE_ID: a60693d
- SCOPE: boot.js conservative auto-load in PROD, CRP regression verifier, CI hook, CRP plan + ledger updates
- CHANGES (files touched): public/assets/latest/boot.js; tools/verify-crp.mjs; .github/workflows/ci.yml; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build; node tools/verify-inline-css.mjs; node tools/verify-crp.mjs; npm run verify:assets; node tools/verify-budgets.mjs; node tools/verify-ledger.mjs; node tools/verify-headers.mjs --mode=config; node tools/validate-xml.js
- CI STATUS: expected green if CRP checks pass
- DEPLOY STATUS: expected green (no deploy changes)
- VERIFY (perf steps): DevTools Performance → cold load → confirm main.js auto-load waits for window load + idle (PROD) and no long tasks early; verify interaction still triggers immediate load.
- NOTES (gotchas): DEV remains more eager via afterPaint; PROD waits until load+idle(5s) unless user interacts.
- RISKS: main.js may load later on slow pages if no interaction occurs.
- NEXT: TASK-0006F

---

## 2026-02-05 — TASK-0006E.1 — Deploy parity (no manual bypass)
- DATE: 2026-02-05
- TASK_ID: TASK-0006E.1
- TITLE: Deploy parity (no manual bypass)
- MODE (DEV/PROD impact): deploy workflow gate parity
- RELEASE_ID: f7debf0
- SCOPE: deploy preflight adds CRP/inline/headers config checks, pipeline docs update, ledger updates
- CHANGES (files touched): .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): node tools/verify-inline-css.mjs; node tools/verify-crp.mjs
- CI STATUS: expected green if CRP/inline checks pass
- DEPLOY STATUS: expected green; manual dispatch blocked by CRP/inline/ledger/budgets
- VERIFY (dry run): introduce a temporary CRP violation (e.g., add `rel='stylesheet'` for fonts in index.prod.xml) and confirm deploy preflight fails at verify-crp.
- NOTES (gotchas): deploy now repeats CI guards for defense in depth.
- RISKS: stricter preflight can block deploy if CRP rules are violated.
- NEXT: TASK-0006F

---

## 2026-02-06 — TASK-0006F — Entrypoint split (main loader + app heavy)
- DATE: 2026-02-06
- TASK_ID: TASK-0006F
- TITLE: Entrypoint split (main.js loader + app.js heavy)
- MODE (DEV/PROD impact): both (assets + budgets + headers + build)
- RELEASE_ID: dff9437
- SCOPE: entrypoint split, release copy, budgets, header contract, CRP plan + ledger updates
- CHANGES (files touched): public/assets/latest/main.js; public/assets/latest/app.js; tools/release.js; tools/perf-budgets.json; tools/headers-contract.json; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): wc -c public/assets/latest/main.js; gzip -c public/assets/latest/main.js | wc -c
- CI STATUS: expected green if budgets + header contract align and release.js copies app.js
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (URLs + expected): load page → app.js requested by main.js; /assets/latest/app.js no-store; /assets/v/<REL>/app.js immutable
- NOTES (gotchas): main.js is now a tiny loader; app.js holds previous heavy bundle.
- RISKS: app.js load failure delays app init; keep main.js within 20KB gzip / 60KB raw.
- NEXT: TASK-0006G

---

## 2026-02-06 — TASK-0006F.1 — Late-load safe onReady + boot.js header contract
- DATE: 2026-02-06
- TASK_ID: TASK-0006F.1
- TITLE: Late-load safe onReady + boot.js header contract
- MODE (DEV/PROD impact): both (runtime readiness + header contract)
- RELEASE_ID: 3a28d18
- SCOPE: GG.boot.onReady late-load safety, headers contract for boot.js, CRP plan + ledger updates
- CHANGES (files touched): public/assets/latest/app.js; tools/headers-contract.json; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a
- CI STATUS: expected green if header contract passes and budgets unchanged
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): in console after load run GG.boot.onReady(()=>console.log('READY_OK')) → logs immediately; headers contract includes boot.js latest + v/ immutable rules
- NOTES (gotchas): onReady now flushes queue asynchronously when DOM is already ready.
- RISKS: low; only readiness behavior for late-loaded app.
- NEXT: TASK-0006G

---

## 2026-02-06 — TASK-0006G — Modular split app.js (core + modules)
- DATE: 2026-02-06
- TASK_ID: TASK-0006G
- TITLE: Modular split app.js (core + modules on-demand)
- MODE (DEV/PROD impact): both (assets + budgets + headers + runtime)
- RELEASE_ID: 6c478ea
- SCOPE: core.js + modules split, main.js loader update, app.js shim, release/budget/header updates, CRP + ledger
- CHANGES (files touched): public/assets/latest/main.js; public/assets/latest/app.js; public/assets/latest/core.js; public/assets/latest/modules/pwa.js; public/assets/latest/modules/ui.js; tools/release.js; tools/perf-budgets.json; tools/headers-contract.json; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): wc -c public/assets/latest/{main.js,app.js,core.js}; gzip -c public/assets/latest/* | wc -c
- CI STATUS: expected green if budgets/headers/release assets align
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): first interaction still intercepts; modules load after idle; /assets/latest/core.js + /assets/latest/modules/*.js no-store; versioned modules immutable
- NOTES (gotchas): app.js now shim; heavy code moved to modules/ui.js; pwa logic moved to modules/pwa.js.
- RISKS: any missing module init could delay UI/pwa features; keep core under 25KB gzip.
- NEXT: TASK-0006H

---

## 2026-02-06 — TASK-0006H — True lazy UI (no forced timeout)
- DATE: 2026-02-06
- TASK_ID: TASK-0006H
- TITLE: True lazy UI (no forced timeout, no import auto-init)
- MODE (DEV/PROD impact): both (runtime orchestration)
- RELEASE_ID: 5492b7d
- SCOPE: core click-triggered UI load, remove generic triggers, ui init idempotent + no auto-init, CRP + ledger
- CHANGES (files touched): public/assets/latest/core.js; public/assets/latest/modules/ui.js; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): npm run build
- CI STATUS: expected green if budgets/headers/ledger align
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): internal link click requests UI module; no pointerdown/keydown trigger; dev log shows UI module requested by internal click
- NOTES (gotchas): UI module only loads on interceptable internal clicks; fallback navigation after short delay if module not ready.
- RISKS: first internal click may fallback to full navigation if module load is slow.
- NEXT: TASK-0006I

---

## 2026-02-06 — TASK-0006H.1 — Ledger contract fix (single release truth)
- DATE: 2026-02-06
- TASK_ID: TASK-0006H.1
- TITLE: Ledger contract fix (single release truth)
- MODE (DEV/PROD impact): docs + verifier (CI guard)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: TASK_LOG policy change, verify-ledger enforcement, CI/deploy workflow naming, pipeline docs
- CHANGES (files touched): docs/ledger/TASK_LOG.md; docs/ledger/TASK_LOG_POLICY.md; tools/verify-ledger.mjs; .github/workflows/ci.yml; .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a
- CI STATUS: expected green if TASK_LOG contains no RELEASE_ID after policy marker
- DEPLOY STATUS: expected green
- VERIFY: `node tools/verify-ledger.mjs`
- NOTES: POLICY CHANGE: TASK_LOG no longer records RELEASE_ID. Canonical source is GG_CAPSULE AUTOGEN.
- RISKS: none
- NEXT: TASK-0006I

---

## 2026-02-06 — TASK-0006I — True idle UI prefetch (no timeout) with connection heuristics
- DATE: 2026-02-06
- TASK_ID: TASK-0006I
- TITLE: True idle UI prefetch (no timeout) with connection heuristics
- MODE (DEV/PROD impact): both (runtime orchestration)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: idle-only UI prefetch gated by connection/visibility, CRP plan + ledger update
- CHANGES (files touched): public/assets/latest/core.js; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md; index.prod.xml; public/sw.js; src/worker.js; public/assets/v/<REL>/*
- COMMANDS RUN (local): npm run build; node tools/verify-budgets.mjs; node tools/verify-headers.mjs --mode=config
- CI STATUS: expected green if budgets/headers/ledger align
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): internal click still triggers UI module; idle prefetch only when visible + good connection; no prefetch on saveData/2g/hidden
- NOTES (gotchas): UI prefetch uses requestIdleCallback with no timeout; skipped when unsupported.
- RISKS: low; idle prefetch is additive and gated.
- NEXT: TBD

---

## 2026-02-06 — TASK-0006K — Decouple router from UI (no await UI on click)
- DATE: 2026-02-06
- TASK_ID: TASK-0006K
- TITLE: Decouple router from UI (no await UI on click)
- MODE (DEV/PROD impact): both (routing reliability)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: immediate router interception without UI dependency, CRP plan + ledger update
- CHANGES (files touched): public/assets/latest/core.js; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md; index.prod.xml; public/sw.js; src/worker.js; public/assets/v/<REL>/*
- COMMANDS RUN (local): npm run build
- CI STATUS: expected green if budgets/headers/ledger align
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): internal link click routes immediately without loading modules/ui.js; fallback to hard nav if router unavailable.
- NOTES (gotchas): UI module remains optional and loads only via idle prefetch.
- RISKS: low; routing no longer waits on UI.
- NEXT: TBD

---

## 2026-02-06 — TASK-0006K.1 — Router contract hardening (intercept allowlist + no prod logs)
- DATE: 2026-02-06
- TASK_ID: TASK-0006K.1
- TITLE: Router contract hardening (intercept allowlist + no prod logs)
- MODE (DEV/PROD impact): both (routing reliability + logging)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: intercept allow/deny rules, dev-only router logs, router contract verifier, CRP + ledger updates
- CHANGES (files touched): public/assets/latest/core.js; tools/verify-router-contract.mjs; .github/workflows/ci.yml; docs/perf/CRP_PLAN.md; docs/ledger/GG_CAPSULE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md; index.prod.xml; public/sw.js; src/worker.js; public/assets/v/<REL>/*
- COMMANDS RUN (local): npm run build
- CI STATUS: expected green if router verifier passes
- DEPLOY STATUS: expected green (no workflow change)
- VERIFY (manual): /assets/* links not intercepted; page links intercepted; router logs silent in PROD by default
- NOTES (gotchas): router interception now explicitly skips static endpoints/extensions.
- RISKS: low; interception is now stricter for non-page URLs.
- NEXT: TBD

---

## 2026-02-06 — TASK-0006K.2 — Deploy gate parity proof (router verifier)
- DATE: 2026-02-06
- TASK_ID: TASK-0006K.2
- TITLE: Deploy gate parity proof (router verifier)
- MODE (DEV/PROD impact): docs + deploy gate parity
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: deploy preflight runs router verifier for workflow_run + manual dispatch; pipeline docs + negative test proof
- CHANGES (files touched): .github/workflows/deploy.yml; docs/ci/PIPELINE.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a
- CI STATUS: expected green (verifier already present in CI; deploy preflight parity documented)
- DEPLOY STATUS: expected green (manual dispatch does not bypass verifiers)
- VERIFY (manual): run `node tools/verify-router-contract.mjs` before deploy; see TASK_REPORT negative-test proof
- NOTES (gotchas): deploy preflight now explicitly documents router verifier parity for manual dispatch.
- RISKS: none; docs + gate parity only.
- NEXT: TBD

---

## 2026-02-06 — TASK-0007A — UI Module Diet (reduce parse/exec + keep luxury feel)
- DATE: 2026-02-06
- TASK_ID: TASK-0007A
- TITLE: UI Module Diet (reduce parse/exec + keep luxury feel)
- MODE (DEV/PROD impact): both (UI performance + lazy loading)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: split monolithic UI into buckets; on-demand loading; budgets + header contract coverage; CRP plan update
- CHANGES (files touched): public/assets/latest/core.js; public/assets/latest/modules/ui.js; public/assets/latest/modules/ui.bucket.core.js; public/assets/latest/modules/ui.bucket.listing.js; public/assets/latest/modules/ui.bucket.post.js; public/assets/latest/modules/ui.bucket.poster.js; public/assets/latest/modules/ui.bucket.search.js; tools/perf-budgets.json; tools/headers-contract.json; docs/perf/CRP_PLAN.md; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md; index.prod.xml; public/sw.js; src/worker.js; docs/ledger/GG_CAPSULE.md; public/assets/v/<REL>/*
- COMMANDS RUN (local): npm run build; node tools/verify-router-contract.mjs; npm run verify:assets; npm run build:xml; npm run verify:xml; node tools/verify-budgets.mjs; node tools/verify-headers.mjs --mode=config; node tools/verify-inline-css.mjs; node tools/verify-crp.mjs; node tools/verify-ledger.mjs
- CI STATUS: expected green (verifiers pass)
- DEPLOY STATUS: expected green (manual dispatch remains gated)
- VERIFY (manual): internal routing works without UI; listing/post enhancements load via buckets; share/poster action lazy-loads poster bucket
- NOTES (gotchas): `modules/ui.js` is now a thin orchestrator; `ui.bucket.core.js` still largest and can be further trimmed
- RISKS: low/medium; bucket mapping mistakes would delay a feature until bucket loads
- NEXT: consider extracting more optional features from `ui.bucket.core.js`

---

## 2026-02-06 — TASK-0007A.1 — Immutable release enforcement + pinned-asset verification
- DATE: 2026-02-06
- TASK_ID: TASK-0007A.1
- TITLE: Immutable release enforcement + pinned-asset verification
- MODE (DEV/PROD impact): both (release discipline + verifier scope)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: release preflight for clean tree + no overwrite; verify pinned v/<REL> artifacts
- CHANGES (files touched): tools/release.js; tools/verify-assets.mjs; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md; index.prod.xml; public/sw.js; src/worker.js; docs/ledger/GG_CAPSULE.md; public/assets/v/<REL>/*
- COMMANDS RUN (local): npm run build; npm run verify:assets; node tools/verify-router-contract.mjs; node tools/verify-headers.mjs --mode=config; node tools/verify-budgets.mjs
- CI STATUS: expected green (pinned artifacts now validated)
- DEPLOY STATUS: expected green (manual dispatch remains gated)
- VERIFY (manual): n/a (browser checks required)
- NOTES (gotchas): release now fails on dirty tree unless ALLOW_DIRTY_RELEASE=1; existing v/<REL> cannot be overwritten if different
- RISKS: low; safeguards reduce release drift
- NEXT: none

---

## 2026-02-06 — TASK-0007A.2 — CI determinism gate + pinned router contract
- DATE: 2026-02-06
- TASK_ID: TASK-0007A.2
- TITLE: CI determinism gate + pinned router contract
- MODE (DEV/PROD impact): both (CI/deploy gating + verifier scope)
- RELEASE_REF: GG_CAPSULE AUTOGEN
- SCOPE: fail CI/deploy if build modifies tracked files; verify router contract against pinned v/<REL>/core.js; add VSCode recommendations
- CHANGES (files touched): .github/workflows/ci.yml; .github/workflows/deploy.yml; tools/verify-router-contract.mjs; .vscode/extensions.json; docs/ledger/TASK_LOG.md; docs/ledger/TASK_REPORT.md
- COMMANDS RUN (local): n/a (no build)
- CI STATUS: expected green (determinism gate passes with committed artifacts)
- DEPLOY STATUS: expected green (manual dispatch remains gated)
- VERIFY (manual): n/a
- NOTES (gotchas): determinism gate runs after build; router contract now checks pinned release core.js
- RISKS: low; failures indicate uncommitted build output
- NEXT: run build locally before release if artifacts are missing
