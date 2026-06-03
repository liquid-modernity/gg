# Repository Structure Professionalization Plan

Scope: planning-only plan for `task/task-005-repository-structure-professionalization-plan.md`.

This plan does not move, rename, delete, refactor, edit generated output, change packages, change workflows, change flags, or change runtime behavior.

## 1. Executive Verdict

The repository is structurally functional and unusually well guarded, but not yet clean in a professional maintenance sense. The correct path is conservative professionalization, not folder reshuffling. Root runtime files must stay in place, generated outputs must stay under their current contracts, and any future move must be implemented as a separate task with guard and workflow updates.

| Area | Current Score | Target Score | Notes |
|---|---:|---:|---|
| Root clarity | 72 | 90 | Root contains required runtime files plus reports, copy aliases, archives, and generated artifacts. |
| Source/generated clarity | 86 | 94 | Strong documentation exists; complexity remains in mixed CSS modules, Store outputs, and committed generated artifacts. |
| Folder ownership | 84 | 94 | Major folders are documented, but root reports, copy aliases, and archive/history folders need clearer retention policy. |
| Human maintainability | 84 | 93 | Maintainers can work safely with docs/guards, but noisy root and path names with spaces slow routine work. |
| AI-agent readability | 86 | 94 | Agent contracts are strong; the remaining risk is confusing root clutter and duplicate-looking registry/copy files. |
| CI/deploy safety | 90 | 95 | GitHub Actions/Linux Node 20 path is clear; local macOS 10.15.8 install blocker must remain documented as local-only. |

## 2. What Is Already Professional

- The repo has explicit architecture contracts in `AGENTS.md`, `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`, `SOURCE-OF-TRUTH.md`, `REPO-STRUCTURE.md`, `ASSET-ARCHITECTURE.md`, and `QA-COMMANDS.md`.
- Source/generated/staging boundaries are documented and guarded.
- CI uses GitHub Actions on Linux Node 20 as validation authority.
- Blogger SSR, native comments, Store isolation, route truth, Worker role, and generated artifact ownership have guards.
- Build/deploy commands are centralized through `package.json`.
- The local macOS 10.15.8 `npm ci` blocker is classified as a local environment issue, not a CI blocker.

## 3. What Is Not Professional Yet

- The root mixes stable runtime files with historical reports, task artifacts, root copy JSON aliases, and ignored archive ZIPs.
- Some folders and task files contain spaces, which is brittle for shell usage and agent automation.
- Copy/content registry ownership appears duplicated between root JSON aliases and `registry/*` paths.
- `docs/audits` is becoming a flat accumulation of task outputs without lifecycle grouping.
- Some generated artifacts are committed by current policy; this is valid but raises review noise and timestamp churn.
- Archive retention policy is implicit across `docs/archive`, `registry/original`, root ZIP files, and `task/*`.

## 4. Root Clutter Analysis

Required root runtime/build files include `index.xml`, `landing.html`, `store.html`, `worker.js`, `_headers`, `robots.txt`, `manifest.webmanifest`, `sw.js`, `offline.html`, flags, package files, and Wrangler config. These should stay at root.

Root clutter candidates are root report markdown files, root copy JSON aliases, root archive ZIPs, and unclear duplicate guard files. Root reports cannot be moved casually because guards and docs reference exact paths. Root copy JSON aliases cannot be consolidated until the copy registry contract is redesigned. Root ZIP files are the safest future cleanup candidate if confirmed ignored/untracked and not required by task history.

## 5. Folder Ownership Gaps

- `registry/original/*` needs a documented retention policy: history fixture, backup, or removable archive.
- Root copy JSON files need an explicit owner relationship to `registry/copy/*`, `registry/content/*`, and `registry/store/*`.
- `docs/audits/*` needs a lifecycle policy once task audit files grow further.
- `task/*` needs a policy for active tasks, completed tasks, protected backups, and external archive packs.
- `schema-jsonld-guard.mjs` at root needs usage proof against `qa/schema-jsonld-guard.mjs`.

## 6. Naming Consistency Issues

- `src/knowledge base` and `assets/knowledge base` should eventually become `knowledge-base` only if build, static route, guard, and docs references are updated together.
- `task/task-004-audit local npm ci esbuild compatibility.md` should eventually become a slug filename only if all references are updated.
- Root files named `Archive backup *.zip` and `Archive.zip` are not professional repository names; they are cleanup/archive-policy candidates.
- Generated names containing `final` in `dist/index.final*.xml` are build-owned and should not be renamed for aesthetics.

## 7. Source/Generated/Staging Clarity Issues

The current clarity is good but not perfect. `src/css/modules/*` has mixed statuses: generated mirrors, one wired module, and manual/advisory maps. Store artifacts are split across `store.html`, `store/data/*`, `dist/store/data/*`, `assets/store/*`, category directories, and transitional flat files. `.cloudflare-build/*` is staging and ignored, but is still critical because `wrangler.jsonc` points at it.

Future docs should keep repeating the rule: fix source first, rebuild artifacts, and never patch generated output as the primary fix.

## 8. Docs/Archive/Task Structure Issues

`docs/archive/template-deprecated/*` is intentionally historical and should not be deleted. `docs/audits/*` is now useful but flat. `task/*` contains current task prompts, older task packs, a protected backup XML, and task archive ZIPs. A future task can introduce a documentation lifecycle such as active audit docs, stable reports, archived task outputs, and external-only ZIP retention.

## 9. Human Maintainability Issues

Humans must know which root files are public runtime contracts and which are historical artifacts. The current docs help, but the root still presents too many equally important-looking files. Reviewers also need a better quick map for committed generated files and root reports.

## 10. AI-Agent Readability Issues

Agents are likely to over-clean root files, move generated folders, or treat duplicate-looking copy registries as redundant without proof. The no-move list and risk register should be used before any future cleanup task. Filenames with spaces increase command quoting risk.

## 11. Proposed Future Target Structure

Conservative target, preserving runtime/build constraints:

```txt
/
  index.xml
  landing.html
  store.html
  worker.js
  flags.json
  gg-flags.json
  package.json
  package-lock.json
  wrangler.jsonc

  /src
  /registry
  /assets
  /store
  /dist
  /qa
  /tools
  /scripts
  /docs
    /audits
    /architecture
    /performance
    /reports
    /archive
  /task
  /.github
```

Optional future refinements: move eligible root reports into `docs/reports/`, group completed audit outputs under `docs/audits/YYYY-MM-*` or `docs/audits/repository/`, and externalize ignored ZIP archives outside the repo. These are not part of this task.

## 12. No-Move List

Do not move these without a dedicated architecture task:

- `index.xml`
- `worker.js`
- `store.html`
- `landing.html`
- `flags.json`
- `gg-flags.json`
- `package.json`
- `package-lock.json`
- `.github/workflows/*`
- `wrangler.toml` if introduced, and current `wrangler.jsonc`
- `store/data/*`
- `dist/store/data/*`
- `dist/blogger-template.publish.*`
- `.cloudflare-build/*`
- `__gg/assets/*`
- `assets/store/*`
- `registry/*`
- `src/registry/*`
- `src/js/modules/*`
- `src/css/modules/*`
- `src/store/*`
- `qa/*`
- `tools/*`
- `task/index-backup.xml`
- `docs/archive/template-deprecated/*`

## 13. Candidate Move List

| Candidate | Target | Risk | Conditions |
|---|---|---:|---|
| Root reports not guard-pinned | `docs/reports/` | MEDIUM | Update docs, guards, task references, and `SOURCE-OF-TRUTH.md`. |
| Completed audit groupings | `docs/audits/repository/` or date/task subfolders | LOW/MEDIUM | Update references from task docs and index docs. |
| Root ZIP archives | External archive location or ignored archive retention area | LOW/MEDIUM | Confirm untracked/ignored and not required by handoff history. |
| Task ZIP archives | External archive location | LOW/MEDIUM | Preserve task markdown and protected backup XML. |
| `registry/original/*` | `docs/archive/registry-original/` | MEDIUM/HIGH | Only after registry guard proves no runtime/build dependency. |

## 14. Candidate Rename List

| Candidate | Proposed Name | Risk | Conditions |
|---|---|---:|---|
| `src/knowledge base` | `src/knowledge-base` | MEDIUM/HIGH | Update source, asset sync, docs, references, and any Apps Script/static route coupling. |
| `assets/knowledge base` | `assets/knowledge-base` | HIGH | Public asset URLs and staging references must be updated; avoid unless necessary. |
| `task/task-004-audit local npm ci esbuild compatibility.md` | `task/task-004-audit-local-npm-ci-esbuild-compatibility.md` | MEDIUM | Update task references and audit docs. |
| Root `Archive*.zip` names | Remove or externalize, not rename in repo | LOW/MEDIUM | Confirm ignored/untracked and nonessential. |
| Root `schema-jsonld-guard.mjs` | Remove or move only after proof | MEDIUM/HIGH | Prove no package, docs, or manual workflow depends on it. |

## 15. Candidate Documentation Updates

- Add a short `docs/reports/README.md` before moving any root reports.
- Add `docs/audits/README.md` with audit lifecycle rules.
- Add a task archive policy for `task/*`, including protected files.
- Add a registry ownership note explaining root JSON aliases versus `registry/*`.
- Add a generated artifact review note explaining expected timestamp churn and generated output diffs.

## 16. Required Guard Updates If Restructuring Happens

- Update `qa/repo-structure-tidy-guard.mjs` for any path moves.
- Update `qa/docs-contract-guard.mjs` if root docs move.
- Update `qa/ci-reconciliation-guard.mjs` if guard paths or command classifications change.
- Update `qa/schema-jsonld-guard.mjs`, Store guards, asset guards, CSS guards, registry guards, and copy guards for any source/runtime path changes.
- Update any guard that reads literal root paths or checks generated output folders.

## 17. Required Workflow/Package Updates If Restructuring Happens

- Update `package.json` scripts for moved `qa/*`, `tools/*`, or `scripts/*` paths.
- Update `.github/workflows/*` only in the same dedicated task if command names or artifact upload paths change.
- Update `wrangler.jsonc` if `.cloudflare-build/*` layout ever changes.
- Update `QA-COMMANDS.md`, `SOURCE-OF-TRUTH.md`, `REPO-STRUCTURE.md`, and `docs/ci-guard-policy.md` with any command or authority changes.
- Do not change Node version, Wrangler version, esbuild version, package lock, or production flags to solve structure issues.

## 18. Step-by-Step Execution Phases

1. Documentation-only preparation: add/refresh maps, no-move list, risk register, and audit lifecycle docs.
2. Low-risk cleanup: remove ignored OS junk and confirmed regenerable ZIP/cache output only under a separate cleanup task.
3. Root report consolidation: move only reports with updated guard/docs references and a small diff.
4. Archive policy implementation: decide whether task ZIPs and registry originals remain in-repo or move to documented archive paths.
5. Naming cleanup: rename files with spaces only after exhaustive reference search and guard updates.
6. Registry/copy consolidation: redesign root aliases versus `registry/*` only with copy-registry guard changes.
7. Full validation: run GitHub Actions/Linux Node 20 or Docker/Linux Node 20 validation, then full CI guard set.

## 19. Rollback Plan

- Use a dedicated branch for every implementation phase.
- Keep each move/rename in a small commit with guard updates in the same commit.
- If a guard fails, revert the move commit rather than patching generated output.
- Preserve `git diff --check` and non-mutating docs/structure guards before broad QA.
- For high-risk source/runtime moves, require a pre-change path dependency report and a post-change parity report.

## 20. Final Recommendation

Do not restructure runtime, Store, Worker, registry, QA, tooling, generated, package, workflow, or flag paths now. The next safe improvement is documentation lifecycle cleanup plus a separate low-risk ignored-artifact cleanup. Any root report move, file rename with spaces, or registry/copy consolidation should be a dedicated task with explicit guard updates and GitHub Actions/Linux Node 20 validation.
