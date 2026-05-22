# TASK-CI-CD-001 — Reconcile QA, Tools, and GitHub Actions After Store/Discovery/Shell/Theme Changes

## Status

Development hardening task.

Run this after:

1. `TASK-STORE-ISOLATION-001`
2. `TASK-DISCOVERY-002`
3. `TASK-DISCOVERY-003`
4. `TASK-THEME-001`
5. `TASK-SHELL-001`

Also run the basic QA chain after each earlier task, but use this task as the final CI/CD contract reconciliation before pushing/deploying.

## Strategic Purpose

The next tasks will change domain isolation, Discovery filters, global sheet behavior, focus trapping, drag-to-close behavior, and theme states.

Those changes will affect:

- QA guards;
- store artifact smoke;
- live smoke worker;
- template pack/proof;
- copy registry checks;
- sheet contract checks;
- GitHub Actions CI;
- Cloudflare deploy workflow;
- Lighthouse workflow, if enabled.

The goal of this task is to ensure the repo, static artifacts, Cloudflare build, and GitHub Actions workflows all agree on the new contracts.

This is not a feature task. This is a QA/tooling synchronization task.

## Non-Negotiables

- Do not weaken QA just to make CI green.
- Do not delete meaningful guards without replacing them.
- Do not reintroduce stale pre-NAV/pre-DISCOVERY contracts.
- Do not change threaded comments behavior.
- Do not modify Blogger native comment plumbing.
- Do not change Blog1 detail rendering.
- Do not change canonical post detail logic.
- Do not force production indexing while the project is still in development mode.
- Do not make Blogger template live fingerprint drift block Cloudflare asset/Worker deploy unless the workflow is explicitly publishing Blogger template.
- Do not hide failures by adding `|| true`.
- Do not turn hard failures into warnings unless the contract is genuinely non-blocking and documented.

## Key Principle

QA must validate the **current architecture**, not old assumptions.

Expected current architecture:

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface
```

Expected domain split:

```txt
Root Blog listing:
- excludes Store content and Store descendants

Global Discovery:
- used by /, /landing, post detail, static page detail
- excludes Store content from Articles/Topics
- may include Store only as route/action

Store Discovery:
- used by /store
- includes only Store products, Store categories, Store routes/actions
```

Expected UI shell:

```txt
Dock:
Home | Contact | Search | Blog | More

More sheet:
Navigation / Discover / Info / Language / Appearance

Discovery filters after remap:
Global: All | Articles | Topics | Saved
Store : All | Products | Categories | Saved

Theme:
Light | Dark only
```

Expected global sheet behavior:

```txt
- focus trap
- focus restore on close
- Escape/back/outside-close where supported
- drag-to-close from each sheet handle
- keyboard-safe bottom command/input behavior
```

## Files Likely In Scope

Inspect repo first. Likely files:

```txt
package.json
qa/discovery-contract-guard.mjs
qa/nav-more-contract-guard.mjs
qa/comments-proof-guard.mjs
qa/store-artifact-smoke.sh
qa/live-smoke-worker.sh
qa/sheet-contract-smoke.sh
qa/template-proof.sh
qa/template-proof.mjs
qa/worker-syntax-check.mjs
tools/template-pack.mjs
tools/cloudflare-prepare.mjs
tools/proof-store-static.mjs
tools/build-store-static.mjs
tools/store-build.sh
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
src/registry/*
registry/copy/gg-copy-en.json
registry/copy/gg-copy-id.json
```

Do not edit unrelated feature code unless a QA/tool proof reveals a real contract mismatch.

## Required QA Updates

### 1. Store Isolation Guard

Update or add proof that Store content is excluded from the root Blog listing and Global Discovery.

Guard must check:

- root `/` visual/static listing does not include Store product cards/posts;
- root `/` ItemList/structured listing does not include Store product posts;
- Global Discovery Articles excludes Store product posts;
- Global Discovery Topics excludes Store labels and Store child labels;
- Store route/action may still exist in Global Discovery;
- Store Discovery includes Store products/categories.

Guard must fail if Store product labels appear as Global Topics.

### 2. Discovery Contract Guard

Update `qa/discovery-contract-guard.mjs` after `TASK-DISCOVERY-002` and `TASK-DISCOVERY-003`.

Guard must check:

- `/` and `/landing` share the same Global Discovery source/config/builder or generated manifest;
- Global Discovery excludes Store content from Articles/Topics;
- Store Discovery excludes non-Store editorial content;
- Global filters are `all, articles, topics, saved`;
- Store filters are `all, products, categories, saved`;
- deprecated visitor-facing filters are not exposed:
  - routes
  - sections
  - actions
  - categories in Global Discovery
  - articles/topics in Store Discovery
- static base items still prevent blank first render;
- `searchText(` undefined-helper bug does not return;
- no public `Landing` nav/discovery label is exposed.

Internal item types may still include route/section/action, but those must not appear as primary visitor-facing filters after `TASK-DISCOVERY-003`.

### 3. Shell Contract Guard

Update `qa/sheet-contract-smoke.sh` or add a dedicated shell guard.

Guard must check:

- global dock uses the same style contract across `/`, `/landing`, `/store`, detail, and page surfaces;
- global dock does not regress to thick borders or stale bordered surface;
- global outline follows `/` flat/glass visual rhythm;
- sheet handle exists as an interactive control;
- all global sheets use a shared handle/drag contract marker;
- More sheet, Discovery sheet, Store preview sheet, Comments sheet, Replies sheet, and other bottom sheets have focus-trap markers or shared controller wiring;
- Escape/focus restore contract markers exist if implemented statically;
- reduced motion and safe-area markers are preserved.

### 4. Theme Guard

Update copy/config guards after `TASK-THEME-001`.

Guard must check:

- UI exposes only Light/Dark;
- System is not exposed in the More sheet or theme picker;
- legacy `theme.system` / `appearance.system` does not appear in active UI copy;
- compatibility aliases may exist internally but not as visible options;
- Light/Dark tokens exist;
- paperwhite/paperblack token names or equivalent canonical token mapping exists;
- selected theme persists consistently.

### 5. Copy Registry Guard

Update `node qa/copy-registry-guard.mjs`.

Required checks:

- Global Discovery filters:
  - EN: All, Articles, Topics, Saved
  - ID: Semua, Artikel, Topik, Tersimpan
- Store Discovery filters:
  - EN: All, Products, Categories, Saved
  - ID: Semua, Produk, Kategori, Tersimpan
- Theme:
  - EN: Light, Dark
  - ID: Terang, Gelap
- Remove or deprecate visible System copy.
- No public `Landing` label.
- No stale `Routes / Sections / Actions` as visitor-facing filter labels after remap.

### 6. Store Artifact Smoke

Update `qa/store-artifact-smoke.sh`.

Guard must check:

- Store dock contract remains:
  - Home -> `/landing`
  - Contact -> `/landing#contact`
  - Search -> Store Discovery
  - Blog -> `/`
  - More -> More sheet
- Store Discovery filters match:
  - All / Products / Categories / Saved
- Store More remains aligned with More IA;
- store-only commerce note still appears only on `/store`;
- Store product grid/proof still passes;
- Store category pages still generate correctly.

Do not reintroduce old Store dock assumptions such as `Store | Discover | Saved`.

### 7. Live Smoke Worker

Update `qa/live-smoke-worker.sh`.

Live smoke must validate current contracts without being brittle about exact content counts.

Required:

- `/` reachable;
- `/landing` reachable;
- `/store` reachable;
- `/` root route excludes visible Store product listing after isolation;
- `/store` includes Store product/category indicators;
- `/store` has Store Discovery contract markers;
- `/` and `/landing` have Global Discovery contract markers;
- development robots lockdown remains active in development mode;
- production diagnostics preview remains indexable when explicitly simulated;
- failure classification is accurate:
  - INFRA_UNREACHABLE
  - CONTRACT_FAILURE
  - STALE_DEPLOYMENT
  - PASS

Do not make live Blogger template fingerprint drift block Cloudflare deploy unless the workflow explicitly publishes the Blogger template.

### 8. GitHub Actions Workflows

Review and update:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
```

Required:

- `npm run ci:cloudflare` must run in CI before deploy;
- deploy workflow must build from the same source and generated artifacts that local CI checks;
- workflow must not skip QA after generated asset changes;
- workflow must use stable checkout/action versions;
- workflow must not rely on local machine paths;
- workflow must not require Blogger live template fingerprint to match unless the workflow actually publishes the Blogger template;
- workflow should upload relevant artifacts/logs when CI fails, if feasible.

## Required Package Scripts

Ensure package scripts include or preserve:

```json
{
  "ci:cloudflare": "npm run ci:store && npm run ci:qa && bash -n qa/live-smoke-worker.sh",
  "ci:qa": "npm run gaga:verify-comments-proof && node qa/copy-registry-guard.mjs && npm run gaga:verify-nav-more && npm run gaga:verify-discovery-contract && node qa/template-fingerprint.mjs --check && node qa/worker-syntax-check.mjs",
  "gaga:verify-discovery-contract": "node qa/discovery-contract-guard.mjs"
}
```

Adjust if the project has evolved, but do not remove coverage.

Add scripts only if needed, for example:

```json
{
  "gaga:verify-store-isolation": "node qa/store-isolation-contract-guard.mjs",
  "gaga:verify-shell-contract": "node qa/shell-contract-guard.mjs",
  "gaga:verify-theme-contract": "node qa/theme-contract-guard.mjs"
}
```

If added, wire them into `ci:qa`.

## Required Local Verification

Run:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run store:build
npm run store:proof
npm run ci:cloudflare
```

If added:

```bash
npm run gaga:verify-store-isolation
npm run gaga:verify-shell-contract
npm run gaga:verify-theme-contract
```

## Required GitHub Actions Verification

After push, GitHub Actions must be green for:

```txt
CI
Deploy to Cloudflare
Lighthouse CI, if enabled/non-blocking
```

If Lighthouse is intentionally advisory during development, mark it explicitly as advisory/non-blocking. Do not let a stale Lighthouse threshold block deploy unless that is intentional.

## Manual Live Verification After Deploy

Check:

```txt
https://www.pakrpp.com/
https://www.pakrpp.com/landing
https://www.pakrpp.com/store
```

Required:

### `/`

- root listing does not show Store product content;
- Search opens Global Discovery;
- Global Discovery does not show Store product posts under Articles;
- Global Discovery does not show Store labels under Topics;
- Store appears only as route/action/More item;
- dock and outline follow global flat/glass rhythm.

### `/landing`

- Search opens same Global Discovery domain;
- Global Discovery does not show Store products as Articles;
- Store appears as route/action only;
- More sheet remains correct;
- theme Light/Dark works.

### `/store`

- Store Discovery opens;
- Store products/categories appear;
- non-Store editorial articles do not appear as product/category results;
- Store More shows commerce note;
- dock rhythm matches global system.

### Sheets

- More sheet focus trap works;
- Discovery sheet focus trap works;
- Store preview sheet focus trap works;
- Comments/replies sheet behavior is not broken;
- drag-to-close works from sheet handles;
- Escape/back close behavior remains sane;
- focus returns to trigger when sheet closes.

## Acceptance Criteria

Task is accepted only if:

- all updated QA/tools match the new architecture;
- stale contracts are removed or rewritten;
- local `npm run ci:cloudflare` passes;
- GitHub Actions CI passes;
- GitHub Actions Cloudflare deploy passes;
- no Blog1/detail/canonical behavior is changed;
- no threaded comments behavior is changed;
- live smoke reflects current contracts;
- no guard is weakened merely to get green CI.

## Required Final Report

```txt
TASK-CI-CD-001 completed.

Changed:
- Store isolation QA updated: YES/NO
- Discovery QA updated: YES/NO
- Shell/focus/drag QA updated: YES/NO
- Theme QA updated: YES/NO
- Copy registry guard updated: YES/NO
- Store artifact smoke updated: YES/NO
- Live smoke worker updated: YES/NO
- GitHub Actions CI updated: YES/NO
- GitHub Actions Cloudflare deploy updated: YES/NO
- Threaded comments behavior changed: NO
- Blog1/detail/canonical behavior changed: NO

Local verification:
- git diff --check: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- npm run gaga:verify-nav-more: PASS/FAIL
- npm run gaga:verify-discovery-contract: PASS/FAIL
- npm run store:build: PASS/FAIL
- npm run store:proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
- additional guards: PASS/FAIL

GitHub Actions:
- CI: PASS/FAIL
- Deploy to Cloudflare: PASS/FAIL
- Lighthouse CI: PASS/FAIL/ADVISORY

Live verification:
- /: PASS/FAIL
- /landing: PASS/FAIL
- /store: PASS/FAIL

Notes:
- Any intentionally advisory checks.
- Any known live Blogger template drift not blocking Cloudflare deploy.
- Any intentionally deferred Playwright/browser automation due to local device constraints.
```

## Out of Scope

- New feature work.
- More Discovery redesign.
- New search backend.
- Blogger template publishing automation.
- Comment system redesign.
- Blog1/detail rewrite.
- Control plane/dashboard.
