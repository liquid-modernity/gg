# TASK — Documentation Lifecycle & Root Declutter Phase 1

## Purpose

Make the repository look and behave more professionally without risky runtime restructuring.

This task is Phase 1 of the broader enterprise repository packaging roadmap. The goal is to improve repository clarity, documentation lifecycle, root declutter policy, task lifecycle, and AI/human maintainability while preserving all existing Blogger, Cloudflare Worker, Store, generated-output, QA, CI/CD, and deployment contracts.

This is a LOW-RISK documentation lifecycle task.

Do not treat this task as a folder reshuffle.

---

## Primary References

Use these files as source references:

- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`
- `SOURCE-OF-TRUTH.md`
- `REPO-STRUCTURE.md`
- `QA-COMMANDS.md`
- `docs/ci-guard-policy.md`
- `docs/local-development.md`
- `docs/audits/REPOSITORY_STRUCTURE_INVENTORY.md`
- `docs/audits/REPOSITORY_OWNERSHIP_MAP.md`
- `docs/audits/REPOSITORY_DEPENDENCY_MAP.md`
- `docs/audits/REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md`
- `docs/audits/REPOSITORY_RESTRUCTURE_RISK_REGISTER.md`
- `docs/audits/repository-structure-plan.json`
- `docs/audits/ENTERPRISE_REPOSITORY_PACKAGING_ROADMAP.md` if it already exists
- `docs/audits/enterprise-repository-packaging-roadmap.json` if it already exists

---

## Hard Constraints

Do not move runtime files.

Do not move source files.

Do not move generated files.

Do not move QA or tools.

Do not change package versions.

Do not change `package.json`.

Do not change `package-lock.json`.

Do not change GitHub Actions workflows.

Do not change Wrangler configuration.

Do not change production flags.

Do not edit generated outputs as the primary fix.

Do not rename folders with spaces yet.

Do not move root reports yet unless all guard/docs references are updated and validated.

Do not run deploy.

Do not run production live smoke.

Do not weaken guards.

Local macOS 10.15.x `npm ci` failure is a local environment blocker, not a CI blocker, when GitHub Actions or Linux/Docker Node 20 validation passes.

---

## Protected No-Move Paths

Do not move, rename, delete, or refactor these paths in this task:

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

If any future task proposes touching one of these, it must be a separate dedicated migration task with dependency map, reference updates, guards, rollback plan, and GitHub Actions/Linux Node 20 validation.

---

## Goal

Create a clear documentation lifecycle and root declutter policy so the repository becomes easier to sell, hand off, audit, and maintain.

The output should help humans and AI agents quickly answer:

1. What belongs in the root?
2. What belongs in `docs/audits`?
3. What belongs in `docs/reports`?
4. What belongs in `docs/archive`?
5. What belongs in `docs/policies`?
6. What belongs in `task/`?
7. What belongs outside the repo?
8. What is source?
9. What is generated?
10. What is staging?
11. What is runtime/public?
12. What is protected?
13. What can be safely moved later?
14. What requires a dedicated migration task?
15. What should never be touched by AI without explicit approval?

---

## Required Work

Create or update:

```txt
docs/audits/README.md
docs/reports/README.md
docs/policies/repository-lifecycle.md
docs/policies/archive-retention-policy.md
task/README.md
```

If `docs/policies/` or `docs/reports/` does not exist, create it.

Also update existing source-of-truth docs if needed:

```txt
SOURCE-OF-TRUTH.md
REPO-STRUCTURE.md
QA-COMMANDS.md
docs/ci-guard-policy.md
```

Do not duplicate documentation if an existing source-of-truth file already owns the topic. Link or summarize instead.

---

## Required Content For `docs/audits/README.md`

Explain:

1. purpose of `docs/audits`;
2. which audit files belong here;
3. difference between audit reports and stable source-of-truth docs;
4. suggested future grouping:
   - `docs/audits/repository/`
   - `docs/audits/cleanup/`
   - `docs/audits/ci/`
   - `docs/audits/local/`
   - `docs/audits/architecture/`
5. rule that audit reports are evidence, not automatic permission to change runtime files;
6. rule that generated timestamp-only churn must not be committed as a “fix”;
7. rule that AI agents must cite audit evidence before moving/deleting files;
8. retention policy for audit reports;
9. when an audit should be archived;
10. when an audit should remain active.

---

## Required Content For `docs/reports/README.md`

Explain:

1. purpose of `docs/reports`;
2. difference between reports, audits, policies, architecture docs, and archive docs;
3. which root reports may be future candidates for this folder;
4. warning that some root reports may be guard-pinned and cannot be moved casually;
5. migration rule:
   - search references;
   - update references;
   - update guards if needed;
   - run docs and repo structure guards;
   - preserve rollback path;
6. what belongs in client-facing reports;
7. what does not belong in reports.

Do not move root reports in this task unless the move is clearly low-risk and all references are updated.

---

## Required Content For `docs/policies/repository-lifecycle.md`

Define repository lifecycle policy.

Include:

1. root file policy;
2. source file policy;
3. generated file policy;
4. staging file policy;
5. runtime/public file policy;
6. docs file policy;
7. audit file policy;
8. report file policy;
9. archive file policy;
10. task file policy;
11. ZIP/archive artifact policy;
12. generated timestamp churn policy;
13. file naming policy;
14. path-with-spaces policy;
15. AI agent file classification checklist;
16. human maintainer checklist before moving/deleting files;
17. required validation by risk level;
18. rollback expectations.

Make clear:

- runtime root files may stay in root;
- enterprise-grade does not require textbook folder purity;
- path contracts are API-like contracts;
- every move must preserve build, QA, SEO, Store, Blogger, Worker, and deploy behavior.

---

## Required Content For `docs/policies/archive-retention-policy.md`

Define archive and history retention policy.

Include:

1. what belongs in `docs/archive`;
2. what belongs in `registry/original`;
3. what belongs in `task/archive`;
4. what belongs outside the repo;
5. handling of root ZIP files;
6. handling of task ZIP files;
7. handling of backup XML files;
8. special protection for `task/index-backup.xml`;
9. special protection for `docs/archive/template-deprecated/*`;
10. when archive material can be pruned;
11. who/what must approve archive removal;
12. required search evidence before archive deletion;
13. generated archive artifacts versus historical source archives.

---

## Required Content For `task/README.md`

Define task folder lifecycle.

Include:

1. purpose of `task/`;
2. suggested future structure:
   - `task/active/`
   - `task/completed/`
   - `task/archive/`
3. rule that task files are not runtime source;
4. rule that task files may still contain important human/AI context;
5. rule that `task/index-backup.xml` is protected;
6. rule for task files with spaces;
7. rule for task ZIP archives;
8. how to name new task files;
9. how to mark a task as completed;
10. how to reference task outputs;
11. what AI agents may and may not delete.

Do not move task files in this task unless explicitly low-risk and validated.

---

## Optional Low-Risk Moves

You may create these folders if useful:

```txt
docs/audits/repository/
docs/audits/cleanup/
docs/audits/ci/
docs/audits/local/
docs/audits/architecture/
docs/reports/
docs/policies/
```

You may move only newly created audit files if all references are updated and the diff remains small.

Candidate audit grouping:

### Repository structure audits

```txt
REPOSITORY_STRUCTURE_INVENTORY.md
REPOSITORY_OWNERSHIP_MAP.md
REPOSITORY_DEPENDENCY_MAP.md
REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md
REPOSITORY_RESTRUCTURE_RISK_REGISTER.md
repository-structure-plan.json
```

### Cleanup audits

```txt
UNUSED_CLEANUP_CANDIDATES.md
UNUSED_CLEANUP_REPORT.md
```

### CI/local audits

```txt
GUARD_QA_CI_RECONCILIATION_REPORT.md
LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md
```

### Architecture compliance audits

```txt
SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md
system-architecture-compliance-score.json
```

If moving audit files causes broad reference updates, do not move them in this phase. Only add README/policy docs.

---

## Files Intentionally Not Moved In This Phase

The task report must explicitly say that these are intentionally not moved:

- root runtime files;
- root source files;
- generated outputs;
- Store outputs;
- Worker files;
- `qa/*`;
- `tools/*`;
- `registry/*`;
- `src/registry/*`;
- `src/js/modules/*`;
- `src/css/modules/*`;
- `src/store/*`;
- root reports that may be guard-pinned;
- `docs/archive/template-deprecated/*`;
- `task/index-backup.xml`;
- root ZIP archives unless explicitly handled by a future archive task.

---

## Required Validation

Run:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-ci-reconciliation
```

Do not run deploy.

Do not run production live smoke.

Do not switch production flags.

Do not treat local macOS 10.15.x `npm ci` failure as a CI blocker when GitHub Actions/Linux Node 20 validation passes.

If a validation command fails, stop and report the failure. Do not patch generated output.

---

## Required Report

Create:

```txt
docs/audits/DOCUMENTATION_LIFECYCLE_PHASE_1_REPORT.md
```

The report must include:

1. executive summary;
2. files created;
3. files changed;
4. folders created;
5. files moved, if any;
6. references updated;
7. files intentionally not moved;
8. validation commands run;
9. validation commands failed;
10. remaining root declutter tasks;
11. remaining audit grouping tasks;
12. remaining task lifecycle tasks;
13. risks requiring separate implementation tasks;
14. whether root clarity improved;
15. whether any runtime/source/package/workflow/generated file was changed.

---

## Acceptance Criteria

This task is acceptable only if:

- documentation lifecycle is clearer;
- `docs/audits`, `docs/reports`, `docs/policies`, and `task` have explicit ownership rules;
- no protected runtime/source/generated path was moved;
- no production flag changed;
- no package or workflow changed;
- no guard was weakened;
- docs and repo structure guards pass;
- any moved audit file has references updated;
- task report clearly states what remains for Phase 2.

---

## Final Response

When done, summarize only:

1. files created;
2. files changed;
3. files moved;
4. commands run;
5. commands failed;
6. whether root clarity improved;
7. what remains for Phase 2.
