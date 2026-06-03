# Enterprise Repository Packaging Roadmap

Scope: planning-only roadmap for `task/task-006-enterprise-repository-packaging-roadmap.md`.

This roadmap does not move, rename, delete, refactor, edit generated output, change package files, change workflows, change production flags, or change runtime behavior. It builds on the repository structure inventory, ownership map, dependency map, professionalization plan, and restructure risk register created for task 005.

## 1. Executive Verdict

The repository is close to enterprise-operable because its architecture contracts, guard coverage, CI command map, and source/generated boundaries are already explicit. It is not yet client-ready as a packaged product because the root still looks like a hardening workspace: reports, task history, archive ZIPs, generated artifacts, runtime files, copy aliases, and handoff context all sit at similar visual priority.

The right enterprise path is a phased packaging roadmap, not a broad restructure. Runtime root paths must remain stable. Generated outputs must remain build-owned. Root reports and task history can be made professional only after lifecycle policy exists and guards are updated in dedicated implementation tasks.

## 2. Why The Current Repo Still Looks Amateur

- Root-level report files compete visually with runtime entry points like `index.xml`, `landing.html`, `store.html`, and `worker.js`.
- Root ZIP archives such as `Archive*.zip` look like local backup clutter even when ignored.
- `docs/audits/*` is useful but flat; architecture, cleanup, CI, local, and repository audits are not grouped.
- `task/*` mixes active prompts, completed prompts, historical task packs, protected backup files, and archive ZIPs.
- Some names include spaces, including `src/knowledge base`, `assets/knowledge base`, and one task markdown file.
- Copy registry data appears in root aliases and `registry/*`, which is guard-backed but not immediately obvious to a client or new maintainer.
- Generated artifacts are committed by current policy, which is valid but needs clearer client-facing review guidance.

## 3. What Is Already Enterprise-Grade

- `AGENTS.md`, `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`, `SOURCE-OF-TRUTH.md`, `REPO-STRUCTURE.md`, `ASSET-ARCHITECTURE.md`, and `QA-COMMANDS.md` define strong operating contracts.
- GitHub Actions/Linux Node 20 is documented as the validation authority.
- The macOS 10.15.8 `npm ci` failure is classified as `LOCAL ENVIRONMENT BLOCKER` and `CI NON-BLOCKING LOCAL ISSUE`.
- Blogger SSR, native comments, Store isolation, Worker governance, route truth, schema, CSS ownership, and generated artifact boundaries are protected by guards.
- `package.json` centralizes build, verification, deploy, handoff, Store, and Cloudflare commands.
- Task 005 produced a repository inventory, ownership map, dependency map, professionalization plan, risk register, and machine-readable structure plan.

## 4. What Must Remain In Root

These paths are root contracts and should remain root-level unless a dedicated architecture task updates tools, guards, docs, workflows, and public contracts:

- `index.xml`
- `landing.html`
- `store.html`
- `worker.js`
- `flags.json`
- `gg-flags.json`
- `_headers`
- `robots.txt`
- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `package.json`
- `package-lock.json`
- `wrangler.jsonc`
- `AGENTS.md`
- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`

Root may also keep selected high-signal client docs such as a future `README.md`, `CHANGELOG.md`, and license file.

## 5. What Can Be Moved Later

Candidate moves for later implementation tasks:

| Current Area | Candidate Target | Risk | Required Precondition |
|---|---|---:|---|
| Root reports | `docs/reports/` | MEDIUM | Report classification, reference scan, guard updates, migration note. |
| `docs/audits/*` flat files | `docs/audits/repository/`, `cleanup/`, `ci/`, `local/`, `architecture/` | LOW/MEDIUM | Audit README, reference updates, no hidden audit history. |
| `task/*` markdown history | `task/active/`, `task/completed/`, `task/archive/` | MEDIUM | Task README, chronology rules, reference updates, protected-file list. |
| Root ZIP archives | External archive outside repo or documented ignored archive location | LOW/MEDIUM | Owner confirmation and handoff value check. |
| Task ZIP archives | External archive outside repo or `task/archive/` only after policy | LOW/MEDIUM | Archive-retention policy and no active references. |
| `registry/original/*` | `docs/archive/registry-original/` | MEDIUM/HIGH | Registry guard proof and owner approval. |

## 6. What Must Not Be Moved

Do not move these in packaging work:

- `index.xml`
- `worker.js`
- `store.html`
- `landing.html`
- `flags.json`
- `gg-flags.json`
- `package.json`
- `package-lock.json`
- `.github/workflows/*`
- `wrangler.jsonc`
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

## 7. Proposed Enterprise Target Structure

Target direction, not an implementation change in this task:

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
      /architecture
    /archive
    /handoff

  /task
    README.md
    /active
    /completed
    /archive

  /.github
    /workflows
```

## 8. Phase-By-Phase Roadmap

| Phase | Name | Risk | Output | Validation |
|---|---|---:|---|---|
| Phase 1 | Documentation Lifecycle and Root Declutter Policy | LOW | `docs/audits/README.md`, `docs/reports/README.md`, `docs/policies/repository-lifecycle.md`, `docs/policies/archive-retention-policy.md`, `task/README.md` | `git diff --check`, docs/repo tidy guards |
| Phase 2 | Audit and Report Grouping | LOW/MEDIUM | Group `docs/audits/*` into `repository`, `cleanup`, `ci`, `local`, and `architecture` | Reference scan, docs contract, repo tidy |
| Phase 3 | Root Report Consolidation | MEDIUM | Move eligible root reports into `docs/reports/` with migration notes | Reference updates, docs contract, repo tidy, CI reconciliation |
| Phase 4 | Task Folder Lifecycle | MEDIUM | Introduce `task/active`, `task/completed`, `task/archive`; preserve chronology | Reference scan, task README, repo tidy |
| Phase 5 | Archive and ZIP Externalization | LOW/MEDIUM | Remove or externalize confirmed local/archive ZIP clutter under policy | Cleanup guard, handoff hygiene, git status proof |
| Phase 6 | Naming Cleanup for Spaces and Ambiguous Paths | MEDIUM/HIGH | Rename one candidate path per task after exhaustive reference updates | Full affected guard set plus GitHub Actions/Linux Node 20 |
| Phase 7 | Client-Ready Distribution Package | MEDIUM | `README.md`, setup guides, handoff checklist, changelog, license placeholder | Docs contract, CI guard set, client handoff checklist |

## 9. Risk Register Summary

- Moving root runtime files is `DO NOT MOVE`; it can break Blogger SSR, public routes, Store, Worker, schema, PWA, and deployment.
- Moving generated folders is `DO NOT MOVE`; build tools, guards, workflows, and public/static URLs depend on current paths.
- Moving registry paths is high risk; source boundary, copy registry, Store config, and route contracts depend on them.
- Moving `qa/*` or `tools/*` is high risk because package scripts and CI reconciliation encode exact paths.
- Root report consolidation is useful but medium risk because guards and source-of-truth docs reference root report paths.
- Renaming paths with spaces is worthwhile only when isolated to one path per task with a complete reference update.
- ZIP cleanup is lower risk only after owner confirmation and proof that files are ignored, untracked, or regenerable.

## 10. Client-Ready Distribution Strategy

A client-ready package should present stable product entry points and setup docs while hiding hardening noise from the primary reading path. The package should include:

- `README.md` with product purpose, surfaces, architecture summary, and safe command set.
- `docs/quick-start.md` for local/Linux/Docker Node 20 validation.
- `docs/setup-blogger.md` for Blogger template publishing boundaries.
- `docs/setup-cloudflare.md` for Worker, Wrangler, secrets, deploy, and staging.
- `docs/setup-store.md` for Store source CMS, Store build, and canonical `/store` route.
- `docs/customization-guide.md` for safe CSS/JS/copy/registry edits.
- `docs/deployment-guide.md` for CI authority, deploy flow, and live smoke.
- `docs/troubleshooting.md` for known local blockers such as macOS 10.15.8 esbuild binary incompatibility.
- `docs/security-and-secrets.md` for Cloudflare secrets and production flag discipline.
- `docs/handoff/client-handoff-checklist.md` for final delivery.
- `CHANGELOG.md` and `LICENSE.md` or a commercial license placeholder.

The client package should not expose temporary ZIPs, stale local output, or unclassified task clutter as first-level reading material.

## 11. Recommended Next Task

Run Phase 1 only: Documentation Lifecycle and Root Declutter Policy.

Recommended implementation task: create `docs/audits/README.md`, `docs/reports/README.md`, `docs/policies/repository-lifecycle.md`, `docs/policies/archive-retention-policy.md`, and `task/README.md`. Do not move files in that phase unless a file is explicitly classified as low-risk and every reference is updated in the same task.

## 12. Acceptance Checklist For Future Implementation Tasks

Every future implementation task should prove:

- Runtime root paths remain unchanged unless the task is a dedicated architecture migration.
- No generated output is manually edited as the primary fix.
- `package.json`, `package-lock.json`, workflows, Wrangler/esbuild versions, and production flags remain unchanged unless explicitly in scope.
- Every moved or renamed file has a before/after reference scan.
- Guards that encode old paths are updated in the same change.
- `git diff --check` passes.
- `npm run gaga:verify-docs-contract` passes.
- `npm run gaga:verify-repo-structure-tidy` passes.
- `npm run gaga:verify-ci-reconciliation` passes when command/path ownership changes.
- GitHub Actions/Linux Node 20 or Docker/Linux Node 20 is used as validation authority for CI-sensitive changes.
- Local macOS 10.15.x `npm ci` failures are treated according to the documented local environment blocker classification, not as a reason to downgrade packages.
