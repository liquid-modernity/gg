# GitHub Actions Cloudflare Deploy
**Status:** Operational companion only, not a binding governance law  
**Role:** Deployment and release-playbook guidance for GitHub-first shipping, Cloudflare Worker/static deploy, smoke interpretation, and Blogger publish coordination.

---

## 0. Authority and relationship to repo law

### 0.1 Operational-only status
This document is an **operations companion**.
It explains how shipping works in practice.

It does **not** override:
- `gg_master.md`
- `gg_rules_of_xml.md`
- `gg_rules_of_css.md`
- `gg_rules_of_js.md`
- `gg_rules_of_worker.md`

### 0.2 Source of truth
Repo governance, ownership, and release discipline come from the binding GG documents above.
This file explains deployment flow only.

### 0.3 Core rule
If this document appears to conflict with the repo constitutional set, the constitutional set wins.

---

## 1. Canonical shipping path

### 1.1 One true ship command
`npm run gaga` is the **GitHub-first canonical shipping command**.

### 1.2 Canonical shipping rule
Default shipping path is:

1. local lightweight preflight
2. commit and push to `origin/main`
3. GitHub Actions CI
4. GitHub Actions deploy
5. Worker rollout/version checks
6. smoke result interpretation
7. Blogger manual publish only when template parity requires it

### 1.3 No-shortcut rule
Direct local Cloudflare deploy is **exception-only**, not the default release path.

That means:
- GitHub-first shipping remains canonical
- local direct deploy is for exceptional operational use only
- a faster path is not automatically the correct path

---

## 2. What `npm run gaga` does

### 2.1 Local actions
`npm run gaga` locally:
- verifies Git is installed
- verifies branch is `main`
- verifies `origin` exists
- runs lightweight preflight only
- stages changes
- creates a release commit
- pushes to `origin/main`

Default release commit:
- `chore(release): ship latest GG changes`

### 2.2 What it does not do locally
`npm run gaga` does **not** do:
- local Wrangler deploy
- local Playwright/browser proof
- Blogger template publish

### 2.3 Intent
The command is designed to reduce manual release variance and push shipping into a repeatable build environment.

---

## 3. Script contract

The release-related script contract is:

- `npm run gaga`
  - GitHub-first ship to `origin/main`

- `npm run gaga:preflight`
  - lightweight local preflight only

- `npm run gaga:push`
  - same release orchestrator as `gaga`

- `npm run gaga:cf:deploy`
  - local direct Cloudflare deploy for exception-capable machines only

- `npm run gaga:cf:dry`
  - local direct Cloudflare dry-run

- `npm run gaga:verify-worker`
  - worker-scope live smoke lane

- `npm run gaga:verify-template`
  - strict full public/template-sensitive lane

---

## 4. Workflow scope

### 4.1 CI workflow
`.github/workflows/ci.yml`:
- installs dependencies
- builds Blogger publish artifact
- runs `npm run gaga:preflight`
- runs `npm run gaga:cf:dry`

### 4.2 Deploy workflow
`.github/workflows/deploy.yml`:
- runs after CI success on `main`
- may also run by manual `workflow_dispatch`
- deploys Cloudflare Worker and static assets
- does **not** publish Blogger template/theme

### 4.3 Platform boundary
Cloudflare deploy and Blogger template publish are separate responsibilities.
Do not confuse them.

---

## 5. Deploy lanes and hard gates

### 5.1 Always hard-gated
These are always release-blocking:
- Cloudflare deploy
- worker rollout/version checks
- worker-scope smoke (`qa/live-smoke-worker.sh`)

### 5.2 Full public/template-sensitive smoke
`qa/live-smoke.sh` behaves as follows:

- if `index.prod.xml` did **not** change  
  - runs as hard gate

- if `index.prod.xml` changed and no strict mode is requested  
  - skipped by design because Blogger publish is out of scope for GitHub deploy

- manual dispatch with `strict_template_parity=true`  
  - runs as hard gate

- manual dispatch with `run_full_public_smoke=true`  
  - runs as warning lane only

### 5.3 Release honesty rule
A successful Worker release is not the same thing as full public parity when Blogger template publish is still pending.

---

## 6. Required GitHub configuration

Required:
- secret `CLOUDFLARE_API_TOKEN`
- secret `CLOUDFLARE_ACCOUNT_ID`

Recommended:
- variable `GG_LIVE_BASE_URL`
  - recommended value: `https://www.pakrpp.com`

If required secrets or variables are missing, release confidence is degraded or blocked depending on workflow requirements.

---

## 7. Blogger manual publish responsibilities

### 7.1 When manual publish is required
If `index.prod.xml` changes, Blogger template publish remains manual.

### 7.2 Required operational references
Use:
- `qa/template-release-playbook.md`
- post-publish strict verify: `npm run gaga:verify-template`

### 7.3 Release truth rule
A Cloudflare release can be green while Blogger parity is still pending.
That is not failure, but it is not full completion either.

---

## 8. Failure response protocol

### 8.1 If CI fails
Do not ship.
Fix CI failure first.

### 8.2 If deploy fails
Treat the release as failed.
Inspect in this order:
1. deploy log
2. rollout/version check result
3. worker-scope smoke result

### 8.3 If worker smoke fails
Treat as hard failure.
Do not claim release success.

### 8.4 If template-sensitive strict smoke fails
Treat as release-blocking when running in strict lane.

### 8.5 If release is green but template parity is pending
Next action is not “celebrate.”
Next action is:
1. perform Blogger manual publish if needed
2. run strict template verification
3. confirm parity is complete

### 8.6 If warning lane reports weakness
Do not confuse warning-only output with release proof.
A warning lane informs; it does not certify.

---

## 9. Required release evidence

Every serious ship should preserve at minimum:

- release commit SHA
- GitHub Actions run ID or run URL
- deployed Worker version
- worker rollout/version-check result
- worker smoke result
- template-sensitive smoke result if applicable
- template parity status
- `Blogger manual publish pending=yes/no`

If these are not captured, release accountability is weaker than it should be.

---

## 10. Interpreting deploy status

### 10.1 Green + `Blogger manual publish pending=yes`
Meaning:
- Worker release succeeded
- public template parity is still pending

Action:
- perform manual Blogger publish if required
- run strict template verify after publish

### 10.2 Green + `Blogger manual publish pending=no`
Meaning:
- Worker release succeeded
- full public parity is verified

Action:
- release can be treated as fully verified for the current scope

### 10.3 Red
Meaning:
- a hard gate failed

Possible causes:
- Cloudflare deploy failure
- worker rollout/version-check failure
- worker smoke failure
- strict full public smoke failure

Action:
- treat the release as failed
- investigate and resolve before claiming success

---

## 11. Operator guidance

### 11.1 What this document is for
Use this document when deciding:
- how to ship
- how to interpret GitHub Actions results
- whether Blogger manual publish is still required
- whether a release is partially complete or fully complete

### 11.2 What this document is not for
Do not use this document to:
- redefine ownership between XML/CSS/JS/Worker
- justify architectural shortcuts
- treat deploy convenience as product truth
- bypass constitutional repo law

---

## 12. Closing rule

This deployment flow is correct only if it remains:
- GitHub-first
- repeatable
- auditable
- honest about Blogger parity
- strict on hard gates
- explicit about warning lanes
- clear about next action after each release outcome

A release process that feels faster but hides parity truth, skips accountability, or weakens repeatability is not better.
It is just sloppier.