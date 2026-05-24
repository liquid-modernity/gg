# PakRPP 85% Hardening — Next Task Pack

This ZIP contains the next architecture-hardening tasks after the latest stable milestone.

## Recommended Order

```txt
0. 00-CURRENT-BASELINE-HARD-CONSTRAINTS.md
1. TASK-ARCH-LOCK-001-document-contracts-and-agents.md
2. TASK-SEMANTIC-SSR-001-meaningful-html-fallback.md
3. TASK-SCHEMA-JSONLD-001-rendered-schema-parity.md
4. TASK-REGISTRY-HARDENING-001-centralize-config-copy-icon-routes.md
5. TASK-A11Y-001-accessibility-keyboard-mobile-gesture-hardening.md
6. TASK-ASSET-ARCHITECTURE-001-source-generated-asset-contract.md
7. TASK-CLEANUP-001-remove-unused-overrides-after-asset-contract.md
8. TASK-PERFORMANCE-SEO-AI-GATE-001-final-crawlability-performance-ai-readiness.md
```

Run these as:

```txt
GG 85 Hardening Phase
```

Not as:

```txt
Build ulang architecture dari nol
```


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.



Minimum QA after every task:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
