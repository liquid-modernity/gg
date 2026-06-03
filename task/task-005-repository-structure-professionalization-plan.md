# TASK — Repository Structure Professionalization Plan

Create a professional repository structure plan for this repo.

This is a **PLANNING-ONLY** task.

Do **not** move files.  
Do **not** rename files.  
Do **not** delete files.  
Do **not** refactor code.  
Do **not** edit generated outputs.  
Do **not** change `package.json`.  
Do **not** change `package-lock.json`.  
Do **not** change GitHub Actions.  
Do **not** change production flags.  
Do **not** modify runtime behavior.  
Do **not** fix anything yet.

Your job is to audit the current repository structure, map ownership and dependencies, identify professionalization opportunities, and produce a safe restructure plan with risk levels.

Use these files as primary references:

- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`
- `SOURCE-OF-TRUTH.md`
- `REPO-STRUCTURE.md`
- `QA-COMMANDS.md`
- `docs/ci-guard-policy.md`
- `docs/local-development.md`
- `docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md`
- `docs/audits/system-architecture-compliance-score.json`
- `docs/audits/UNUSED_CLEANUP_REPORT.md`
- `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`
- `docs/audits/GUARD_QA_CI_RECONCILIATION_REPORT.md`

The current architecture audit scored repo structure around 84 and human maintainability around 84, with warnings around root/archive clutter, generated timestamp churn, and local install limitations. Treat this as a structure professionalization task, not a cosmetic folder shuffle.

---

## Core Goal

Produce a safe, evidence-based plan to make the repository more professional, easier for humans to maintain, easier for AI agents to modify, and safer for CI/CD.

The plan must preserve:

- Blogger template/runtime constraints
- Cloudflare Worker/deploy constraints
- source/generated boundary
- registry contracts
- Store build output contracts
- QA/guard paths
- GitHub Actions workflow behavior
- generated artifact ownership
- public route stability
- SEO/schema/accessibility contracts

---

## Required Inspection Commands

Run these read-only commands:

```bash
git status --short
git diff --stat
git diff --check
find . -maxdepth 3 -type d | sort
find . -maxdepth 3 -type f | sort
git ls-files | sort
```

Inspect package/workflow/tooling references:

```bash
cat package.json
find .github/workflows -maxdepth 2 -type f -print -exec sed -n '1,220p' {} \;
find qa -maxdepth 2 -type f | sort
find tools -maxdepth 2 -type f | sort
find scripts -maxdepth 2 -type f | sort 2>/dev/null || true
```

Search for path dependencies:

```bash
rg -n "index\.xml|landing\.html|store\.html|worker\.js|dist/|store/data|assets/store|__gg/|\.cloudflare-build|registry/|src/registry|src/js|src/css|src/store|QA-COMMANDS|SOURCE-OF-TRUTH|REPO-STRUCTURE|docs/archive|task/" .
```

Search for problematic naming and clutter patterns:

```bash
find . -name "* *" -o -name "*copy*" -o -name "*backup*" -o -name "*old*" -o -name "*final*" -o -name "*fixed*" -o -name "*.zip"
```

Search for generated-output references:

```bash
rg -n "GENERATED|generated|do not edit|DO NOT EDIT|dist/|store/data|cloudflare-build|template-pack|store:build|handoff" .
```

Do not run mutating commands unless explicitly needed for validation.  
Do not run deploy.  
Do not run production smoke.  
Do not run `npm ci` as a blocker on macOS 10.15.x; this local failure is already documented as a local environment blocker, not a CI blocker when GitHub Actions/Linux Node 20 passes.

---

## Required Output Files

Create these files:

```txt
docs/audits/REPOSITORY_STRUCTURE_INVENTORY.md
docs/audits/REPOSITORY_OWNERSHIP_MAP.md
docs/audits/REPOSITORY_DEPENDENCY_MAP.md
docs/audits/REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md
docs/audits/REPOSITORY_RESTRUCTURE_RISK_REGISTER.md
```

Optional but recommended:

```txt
docs/audits/repository-structure-plan.json
```

Do not change runtime/source files.

---

## 1. Repository Inventory

Create:

`docs/audits/REPOSITORY_STRUCTURE_INVENTORY.md`

Classify every major folder/file group into:

- source
- generated
- deployment/staging
- runtime/public
- QA/guard
- tooling/build
- docs/source-of-truth
- docs/archive/history
- task/handoff
- local/ignored artifact
- unclear ownership

Use this table:

| Path | Current Role | Source/Generated/Staging/Runtime/Docs/QA/Tools | Owner | Commit Policy | Risk |
|---|---|---|---|---|---|

Include root-level file analysis separately.

Pay special attention to:

- `index.xml`
- `landing.html`
- `store.html`
- `worker.js`
- `flags.json`
- `registry/*`
- `src/*`
- `assets/*`
- `__gg/*`
- `dist/*`
- `.cloudflare-build/*`
- `store/*`
- `qa/*`
- `tools/*`
- `docs/*`
- `docs/archive/*`
- `task/*`
- root reports
- root copy JSON files
- ZIP/archive files
- files with spaces in names

---

## 2. Ownership Map

Create:

`docs/audits/REPOSITORY_OWNERSHIP_MAP.md`

Map each responsibility to the file/folder that owns it.

Required responsibilities:

- Blogger template source
- root/landing route source
- Store route source
- Store generated output
- Store product/content source
- Cloudflare Worker routing/governance
- route registry
- copy/microcopy registry
- icon/action registry
- schema/JSON-LD
- CSS global contract
- CSS modules/components
- JS controller core
- JS adapters/modules
- PWA/service worker assets if any
- QA guards
- build tools
- deploy tools
- handoff/archive tools
- source/generated documentation
- local development documentation
- CI guard policy
- task history

Use this table:

| Responsibility | Current Owner | Supporting Files | Generated Outputs | Guard/Validation | Risk/Notes |
|---|---|---|---|---|---|

Flag duplicate ownership or unclear ownership.

---

## 3. Dependency Map

Create:

`docs/audits/REPOSITORY_DEPENDENCY_MAP.md`

Map file/folder dependencies that make restructuring risky.

Include:

- package scripts that reference paths
- tools that write generated outputs
- QA guards that read specific files
- workflows that run commands
- Worker dependencies
- Store build dependencies
- Blogger template pack dependencies
- root file constraints
- generated output dependencies
- dynamic string/path references that static import tools may miss

Use this table:

| Path/Script | Depends On | Writes To | Referenced By | Move Risk | Notes |
|---|---|---|---|---|---|

Move risk levels:

- `LOW`: docs-only or isolated artifact
- `MEDIUM`: referenced by docs/guards but not runtime
- `HIGH`: build/QA/runtime/deploy path
- `DO NOT MOVE`: root/runtime/public/generated constraint unless architecture is redesigned

---

## 4. Professionalization Plan

Create:

`docs/audits/REPOSITORY_STRUCTURE_PROFESSIONALIZATION_PLAN.md`

The plan must include:

1. Executive verdict
2. What is already professional
3. What is not professional yet
4. Root clutter analysis
5. Folder ownership gaps
6. Naming consistency issues
7. Source/generated/staging clarity issues
8. Docs/archive/task structure issues
9. Human maintainability issues
10. AI-agent readability issues
11. Proposed future target structure
12. No-move list
13. Candidate move list
14. Candidate rename list
15. Candidate documentation updates
16. Required guard updates if restructuring happens
17. Required workflow/package updates if restructuring happens
18. Step-by-step execution phases
19. Rollback plan
20. Final recommendation

Use this scoring:

| Area | Current Score | Target Score | Notes |
|---|---:|---:|---|
| Root clarity | 0-100 | 0-100 | ... |
| Source/generated clarity | 0-100 | 0-100 | ... |
| Folder ownership | 0-100 | 0-100 | ... |
| Human maintainability | 0-100 | 0-100 | ... |
| AI-agent readability | 0-100 | 0-100 | ... |
| CI/deploy safety | 0-100 | 0-100 | ... |

---

## 5. Risk Register

Create:

`docs/audits/REPOSITORY_RESTRUCTURE_RISK_REGISTER.md`

Use this table:

| Proposed Change | Risk | What Could Break | Required Reference Updates | Required Guards | Recommendation |
|---|---|---|---|---|---|

Include risk analysis for at least:

- moving `registry/*`
- moving `src/registry/*`
- moving `src/js/modules/*`
- moving `src/css/modules/*`
- moving `src/store/*`
- moving `qa/*`
- moving `tools/*`
- moving `docs/archive/*`
- moving `task/*`
- moving root reports into `docs/reports/`
- renaming task files with spaces
- removing root ZIP/archive files
- changing generated output folders
- changing `dist/*`
- changing `store/data/*`
- changing `.cloudflare-build/*`
- changing `index.xml`
- changing `worker.js`
- changing `store.html`
- changing `landing.html`

---

## Required No-Move List

The plan must explicitly identify files/folders that should not be moved without a dedicated architecture task.

At minimum:

```txt
index.xml
worker.js
store.html
landing.html
flags.json
package.json
package-lock.json
.github/workflows/*
wrangler.toml
store/data/*
dist/store/data/*
dist/blogger-template.publish.*
.cloudflare-build/*
__gg/assets/*
assets/store/*
registry/*
src/registry/*
src/js/modules/*
src/store/*
qa/*
tools/*
```

If the plan recommends moving any of these, it must mark the recommendation as high-risk and require a separate implementation task.

---

## Recommended Target Structure

Propose a conservative target structure.

Do not force textbook purity if Blogger/Cloudflare constraints require root files.

Suggested structure may include:

```txt
/
  index.xml
  landing.html
  store.html
  worker.js
  flags.json
  package.json
  package-lock.json
  wrangler.toml

  /src
  /registry
  /assets
  /store
  /dist
  /qa
  /tools
  /docs
    /audits
    /architecture
    /reports
    /archive
  /task
  /.github
```

If a folder should stay where it is for runtime/build reasons, say so.

---

## Validation

Because this is planning-only, validate only docs and non-mutating checks.

Run:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-repo-structure-tidy
```

If local `npm ci` fails on macOS 10.15.x, do not treat it as a repo blocker. Reference:

- `docs/local-development.md`
- `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`

Do not run deploy.  
Do not switch production flags.  
Do not edit generated output.

---

## Final Response

When done, summarize only:

1. files created
2. commands run
3. commands failed
4. top 5 structure risks
5. top 5 recommended structure improvements
6. whether any source/runtime/package/workflow file was changed
