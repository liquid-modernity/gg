# TASK — Enterprise Repository Packaging Roadmap

## Purpose

Prepare this repository to look, read, and operate like an enterprise-grade, client-ready product repository without breaking the existing Blogger, Cloudflare Worker, Store, QA, generated-output, and deployment contracts.

The goal is not cosmetic folder shuffling.

The goal is to make the repository:

- professional enough to sell or hand over to another party;
- easy for human maintainers to understand;
- easy for AI code agents to modify safely;
- clear about source, generated, staging, runtime, archive, task, and documentation ownership;
- clean at the root level without breaking runtime/deploy paths;
- guard-backed before and after every move;
- ready for a future client-facing distribution package.

---

## Context

Use these files as primary references:

- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`
- `SOURCE-OF-TRUTH.md`
- `REPO-STRUCTURE.md`
- `QA-COMMANDS.md`
- `docs/ci-guard-policy.md`
- `docs/local-development.md`
- `docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md`
- `docs/audits/system-architecture-compliance-score.json`
- `docs/audits/UNUSED_CLEANUP_CANDIDATES.md`
- `docs/audits/UNUSED_CLEANUP_REPORT.md`
- `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`
- `docs/audits/GUARD_QA_CI_RECONCILIATION_REPORT.md`
- `docs/audits/REPOSITORY_STRUCTURE_INVENTORY.md`
- `docs/audits/REPOSITORY_OWNERSHIP_MAP.md`
- `docs/audits/REPOSITORY_DEPENDENCY_MAP.md`
- `docs/audits/REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md`
- `docs/audits/REPOSITORY_RESTRUCTURE_RISK_REGISTER.md`
- `docs/audits/repository-structure-plan.json`

The current structure plan shows that the repository is structurally functional and well guarded, but root clarity and visual professionalism still need improvement.

This task is a roadmap/planning task. It may create documentation, policies, and phased implementation tasks. It must not perform risky moves directly.

---

## Hard Constraints

Do not move, rename, delete, refactor, or rewrite these paths in this roadmap task:

```txt
index.xml
worker.js
store.html
landing.html
flags.json
gg-flags.json
package.json
package-lock.json
.github/workflows/*
wrangler.jsonc
store/data/*
dist/store/data/*
dist/blogger-template.publish.*
.cloudflare-build/*
__gg/assets/*
assets/store/*
registry/*
src/registry/*
src/js/modules/*
src/css/modules/*
src/store/*
qa/*
tools/*
task/index-backup.xml
docs/archive/template-deprecated/*
```

Do not change:

- package versions;
- `package.json`;
- `package-lock.json`;
- GitHub Actions;
- Wrangler/esbuild versions;
- production flags;
- generated outputs;
- runtime behavior;
- public route behavior;
- Store source/runtime behavior;
- Cloudflare deploy behavior.

Local macOS 10.15.x `npm ci` failure is a local environment blocker, not a CI blocker, when GitHub Actions or Linux/Docker Node 20 validation passes.

---

## Enterprise-Grade Target

The long-term client-ready repository should look conceptually like this:

```txt
/
  README.md
  AGENTS.md
  SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md
  package.json
  package-lock.json
  wrangler.jsonc

  index.xml
  landing.html
  store.html
  worker.js
  flags.json
  gg-flags.json

  /src
  /registry
  /assets
  /store
  /dist
  /qa
  /tools
  /scripts

  /docs
    /architecture
    /policies
    /reports
    /audits
      /repository
      /cleanup
      /ci
      /local
    /archive
    /handoff

  /task
    /active
    /completed
    /archive
    README.md

  /.github
    /workflows
```

This is a target direction, not permission to move files in this task.

Runtime root files may remain in root because Blogger, Cloudflare, PWA, Worker, and public static route constraints require stable paths.

---

## Roadmap Phases

### Phase 1 — Documentation Lifecycle and Root Declutter Policy

Goal: make ownership obvious before moving anything.

Create or update:

- `docs/audits/README.md`
- `docs/reports/README.md`
- `docs/policies/repository-lifecycle.md`
- `docs/policies/archive-retention-policy.md`
- `task/README.md`

Define:

- what belongs in root;
- what belongs in `docs/audits`;
- what belongs in `docs/reports`;
- what belongs in `docs/archive`;
- what belongs in `task`;
- what belongs outside the repo;
- which files are protected;
- which files may be moved only through dedicated migration tasks;
- how generated files should be reviewed;
- how AI agents should classify files before moving/deleting them.

Do not move files unless the move is explicitly low-risk and all references are updated.

---

### Phase 2 — Audit and Report Grouping

Goal: make `docs/audits` readable and professional.

Candidate target folders:

```txt
docs/audits/repository/
docs/audits/cleanup/
docs/audits/ci/
docs/audits/local/
docs/audits/architecture/
```

Candidate grouping:

Repository structure:

- `REPOSITORY_STRUCTURE_INVENTORY.md`
- `REPOSITORY_OWNERSHIP_MAP.md`
- `REPOSITORY_DEPENDENCY_MAP.md`
- `REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md`
- `REPOSITORY_RESTRUCTURE_RISK_REGISTER.md`
- `repository-structure-plan.json`

Cleanup:

- `UNUSED_CLEANUP_CANDIDATES.md`
- `UNUSED_CLEANUP_REPORT.md`

CI/local:

- `GUARD_QA_CI_RECONCILIATION_REPORT.md`
- `LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`

Architecture compliance:

- `SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md`
- `system-architecture-compliance-score.json`

Rules:

- update all references;
- do not break docs guards;
- do not hide audit history;
- do not move generated output;
- do not move runtime/source files.

---

### Phase 3 — Root Report Consolidation

Goal: move eligible root reports into `docs/reports/` without breaking guards.

Candidate root reports may include:

```txt
CLEANUP-REPORT.md
REPO-STRUCTURE.md
REPO-TIDY-REPORT.md
READINESS-85-REPORT.md
RELEASE-CANDIDATE-95-REPORT.md
CSS-SOURCE-OF-TRUTH-REPORT.md
CSS-MODULE-BUNDLE-WIRING-REPORT.md
LAZY-INTERACTION-BUDGET-REPORT.md
```

This phase is medium-risk because guards and docs may reference exact root paths.

Before moving any report:

1. identify every reference;
2. classify whether the report is a source-of-truth document, historical report, guard fixture, or stable client-facing document;
3. update references in docs and guards;
4. run docs and repo structure guards;
5. keep a migration note.

If a report is guard-pinned at root, either keep it or update the guard in the same dedicated task.

---

### Phase 4 — Task Folder Lifecycle

Goal: make `task/` look like a professional task history instead of a dump folder.

Target:

```txt
task/
  README.md
  active/
  completed/
  archive/
```

Rules:

- do not move `task/index-backup.xml` without explicit approval;
- do not delete task history;
- do not move task ZIPs unless archive policy approves it;
- rename task files with spaces only after exhaustive reference update;
- preserve chronology and task IDs.

Candidate rename:

```txt
task/task-004-audit local npm ci esbuild compatibility.md
```

to:

```txt
task/task-004-audit-local-npm-ci-esbuild-compatibility.md
```

This requires reference updates.

---

### Phase 5 — Archive and ZIP Externalization

Goal: remove amateur-looking archive clutter from the working repo.

Candidate local files:

```txt
Archive.zip
Archive backup 1.zip
Archive backup 2.zip
Archive backup 3.zip
task/*.zip
dist/gg-handoff.zip
```

Rules:

- do not delete anything that has handoff value until owner confirms;
- prefer moving external archive files outside the repo;
- keep generated ZIPs regenerable through documented commands;
- update `.gitignore` and handoff docs if needed;
- do not commit new ZIP backups.

---

### Phase 6 — Naming Cleanup for Spaces and Ambiguous Paths

Goal: remove shell-hostile naming without breaking route/build/static references.

Candidate paths:

```txt
src/knowledge base
assets/knowledge base
task/task-004-audit local npm ci esbuild compatibility.md
```

Rules:

- handle one rename task at a time;
- search references before and after;
- update docs, tools, guards, static route references, and assets;
- validate via GitHub Actions/Linux Node 20;
- do not rename public asset paths if they are already contract-bound without a compatibility strategy.

---

### Phase 7 — Client-Ready Distribution Package

Goal: create a polished distribution/handoff package for selling the system.

Create or update:

- `README.md`
- `docs/quick-start.md`
- `docs/setup-blogger.md`
- `docs/setup-cloudflare.md`
- `docs/setup-store.md`
- `docs/customization-guide.md`
- `docs/deployment-guide.md`
- `docs/troubleshooting.md`
- `docs/security-and-secrets.md`
- `docs/handoff/client-handoff-checklist.md`
- `CHANGELOG.md`
- `LICENSE.md` or commercial license placeholder

The client-ready package should not expose unnecessary internal task clutter, temporary ZIPs, or stale audit noise.

---

## Required Deliverables For This Roadmap Task

Create:

```txt
docs/audits/ENTERPRISE_REPOSITORY_PACKAGING_ROADMAP.md
docs/audits/enterprise-repository-packaging-roadmap.json
```

Optional:

```txt
task/task-006-documentation-lifecycle-root-declutter-phase-1.md
task/task-007-audit-report-grouping.md
task/task-008-root-report-consolidation-plan.md
task/task-009-task-folder-lifecycle-plan.md
task/task-010-client-ready-distribution-package-plan.md
```

Do not implement the phases unless explicitly requested.

---

## Required Roadmap Report Structure

`docs/audits/ENTERPRISE_REPOSITORY_PACKAGING_ROADMAP.md` must include:

1. Executive verdict
2. Why the current repo still looks amateur
3. What is already enterprise-grade
4. What must remain in root
5. What can be moved later
6. What must not be moved
7. Proposed enterprise target structure
8. Phase-by-phase roadmap
9. Risk register summary
10. Client-ready distribution strategy
11. Recommended next task
12. Acceptance checklist for future implementation tasks

---

## Required JSON Structure

Create:

`docs/audits/enterprise-repository-packaging-roadmap.json`

Use this structure:

```json
{
  "task": "enterprise-repository-packaging-roadmap",
  "status": "planning-only",
  "goal": "client-ready enterprise-grade repository structure and packaging",
  "runtimePathsProtected": true,
  "packageWorkflowProtected": true,
  "productionFlagsProtected": true,
  "phases": [
    {
      "id": "phase-1",
      "name": "Documentation Lifecycle and Root Declutter Policy",
      "risk": "low",
      "implementationTaskRequired": true
    }
  ],
  "doNotMove": [],
  "candidateMoves": [],
  "candidateRenames": [],
  "recommendedNextTask": ""
}
```

---

## Validation

Run:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-ci-reconciliation
```

Do not run deploy.
Do not change production flags.
Do not treat local macOS 10.15.x `npm ci` failure as a CI blocker when GitHub Actions/Linux Node 20 passes.

---

## Final Response

When done, summarize:

1. files created
2. files changed
3. commands run
4. commands failed
5. recommended next implementation task
6. whether any runtime/source/package/workflow/generated file was changed
