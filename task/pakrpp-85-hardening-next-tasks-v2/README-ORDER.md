# PakRPP 85% Hardening — Next Task Pack v2

This ZIP contains the revised architecture-hardening task pack after the latest stable milestone.

The v2 revision adds one missing protection layer: QA / guard / tool / package-script / GitHub Actions reconciliation. Without that layer, new guards can become decorative files that never run in CI.

## Recommended Order

```txt
0. 00-CURRENT-BASELINE-HARD-CONSTRAINTS.md
1. 01-PAKRPP-85-ARCHITECTURE-NORTH-STAR.md
2. TASK-ARCH-LOCK-001-document-contracts-and-agents.md
3. TASK-QA-CI-RECONCILIATION-001-guard-tool-package-workflow-contract.md
4. TASK-SEMANTIC-SSR-001-meaningful-html-fallback.md
5. TASK-SCHEMA-JSONLD-001-rendered-schema-parity.md
6. TASK-REGISTRY-HARDENING-001-centralize-config-copy-icon-routes.md
7. TASK-A11Y-001-accessibility-keyboard-mobile-gesture-hardening.md
8. TASK-ASSET-ARCHITECTURE-001-source-generated-asset-contract.md
9. TASK-CLEANUP-001-remove-unused-overrides-after-asset-contract.md
10. TASK-PERFORMANCE-SEO-AI-GATE-001-final-crawlability-performance-ai-readiness.md
```

Run these as:

```txt
GG 85 Hardening Phase
```

Not as:

```txt
Build ulang architecture dari nol
```

## Execution Rule

```txt
Work one task only.
Do not start the next task.
Do not rewrite stable systems unless a guard proves a real defect.
Do not add override-only CSS/JS.
Do not patch over old patches.
Do not remove code without usage proof.
Do not edit generated outputs as the only fix.
Do not replace Blogger-native comments.
Do not let Worker author normal healthy UI.
Do not change route truth:
- /landing = Home
- / = Blog
- breadcrumb = Home(/landing) -> Blog(/) -> current
```

## Minimum QA After Every Task

Before `TASK-QA-CI-RECONCILIATION-001` lands, run the existing baseline QA. After that task lands, the CI reconciliation guard must also be part of the chain.

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
npm run ci:qa
npm run ci:cloudflare
```

After `TASK-QA-CI-RECONCILIATION-001`, this command must exist and pass:

```bash
npm run gaga:verify-ci-reconciliation
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.

## Final Report Required From Codex

```txt
Task completed:
Files changed:
Source files changed:
Generated files changed only by build:
Contracts added/updated:
Guards added/updated:
package.json scripts added/updated:
CI/GitHub Actions changed: yes/no + why
Exact QA commands run:
PASS/FAIL result:
Warnings:
What was intentionally not changed:
```
