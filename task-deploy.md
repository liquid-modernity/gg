# TASK-P0.RELEASE-PIPELINE.RESET.10X
GG RELEASE PIPELINE RESET — ONE TRUE SHIP COMMAND, HONEST DEPLOY STATUS, WORKER/BLOGGER DECOUPLING

MODE
You are performing a production-grade release-pipeline reset for the GG repo.
Do not patch symptoms.
Do not preserve ambiguous legacy behavior.
Do not add fake green states.
Do not weaken real quality gates.
Make the operator contract truthful, deterministic, and low-friction.

CORE PROBLEM
The repo currently has a dishonest release model:
1. `npm run gaga` still means local Wrangler deploy, which is incompatible with the operator device and contradicts the desired GitHub-first shipping model.
2. GitHub Actions deploy admits Blogger template publish is out of scope, yet still runs a full public smoke that can hard-fail on template-sensitive contracts.
3. Worker deploy success and Blogger public parity are conflated into a single red/green deploy result.
4. The repo lacks one true end-to-end operator command for shipping.
5. Workflow summaries and referenced docs do not fully match actual behavior.

MANDATE
Reset the release pipeline so that:
- `npm run gaga` becomes the one true local ship command that pushes code to GitHub and lets GitHub Actions handle CI + deploy.
- local operator execution must NOT require Wrangler or Playwright.
- Cloudflare Worker/assets deploy remains a hard gate.
- Worker-scope runtime verification remains a hard gate.
- Blogger template-sensitive public verification remains strict, but is moved out of the default Worker deploy hard gate unless explicitly requested.
- GitHub Actions summaries must tell the truth about what passed, what was skipped, what is pending, and why.

NON-NEGOTIABLE TARGET OPERATOR EXPERIENCE
On a low-capability device, the operator runs:
  npm run gaga

That command must:
- require only git + node + npm
- not require local wrangler
- not require local playwright
- run lightweight local preflight only
- stage changes
- create a deterministic commit if needed
- push to origin/main
- clearly instruct the operator what GitHub Actions will do next
- exit non-zero on real failure

AFTER THIS RESET, THESE COMMANDS MUST MEAN EXACTLY THIS
- `npm run gaga`
  GitHub-based shipping command. No local Wrangler deploy. No local browser proof.
- `npm run gaga:preflight`
  Lightweight local preflight only. Cheap and deterministic.
- `npm run gaga:push`
  Explicit push/release orchestrator entrypoint if separated from `gaga`.
- `npm run gaga:cf:deploy`
  Local direct Cloudflare deploy for capable machines only.
- `npm run gaga:cf:dry`
  Local direct Cloudflare dry-run for capable machines only.
- `npm run gaga:verify-worker`
  Worker-scope verification only.
- `npm run gaga:verify-template`
  Full public/template-sensitive verification. This remains strict.
- `npm run gaga:template:pack`
  Preserve existing template packaging contract if already valid.

STRICT IMPLEMENTATION ORDER
Follow this order exactly. Do not jump around randomly.

PHASE 1 — AUDIT AND CONTRACT DECLARATION
1. Audit current scripts in `package.json`.
2. Audit `.github/workflows/ci.yml`.
3. Audit `.github/workflows/deploy.yml`.
4. Audit `qa/live-smoke.sh`.
5. Audit any helper scripts invoked by deploy/smoke/verify.
6. Produce a root-cause note inside the implementation log or final output:
   - what `npm run gaga` means today
   - why that is wrong
   - which checks are truly worker-scope
   - which checks are template-scope
   - where false-red deploys come from

PHASE 2 — RESET PACKAGE SCRIPT CONTRACT
Edit `package.json` so the script contract becomes truthful.

Required script outcomes:
- `gaga` must call a Node-based release orchestrator, not Wrangler.
- `gaga:preflight` must run only cheap local checks.
- `gaga:push` may alias the same orchestrator or a push-only subcommand.
- current Wrangler deploy behavior must move behind `gaga:cf:deploy`.
- current Wrangler dry-run behavior must move behind `gaga:cf:dry`.
- keep template-related scripts that are still valid.
- add missing verify entrypoints if needed.

Dependency rules:
- add `wrangler` as pinned `devDependency`
- keep `playwright` in `devDependencies`
- do not rely on global local installs
- `npm ci` must be sufficient for CI and capable local machines

PHASE 3 — CREATE LOCAL RELEASE ORCHESTRATOR
Create `tools/gaga-release.mjs` or equivalent.

This script must:
1. verify `git` exists
2. verify current branch is `main`
3. verify `origin` exists
4. detect whether there are changes to ship
5. if no changes, exit cleanly with a truthful message
6. run lightweight local preflight only:
   - `node --check src/worker.js`
   - `node qa/template-fingerprint.mjs --check`
   - optional cheap template pack/status check only if very fast and deterministic
7. auto-stage changes
8. create commit with deterministic message if there is no supplied message
   Example:
   `chore(release): ship latest GG changes`
9. push to `origin main`
10. print concise post-push guidance:
    - push done
    - GitHub Actions CI/deploy will run
    - where to inspect runs
11. fail hard on real push/preflight errors

Constraints:
- do not invoke Wrangler
- do not invoke Playwright
- do not assume GitHub CLI
- do not open browsers
- do not mutate unrelated files

PHASE 4 — SPLIT POST-DEPLOY VERIFICATION INTO HONEST LANES
Refactor deployment verification into two distinct scopes.

LANE A — WORKER-SCOPE SMOKE
Create `qa/live-smoke-worker.sh` if needed.
This is the default hard gate after Worker deploy.

It may check only things that are valid to verify immediately after Worker/assets deploy, such as:
- `__gg_worker_ping`
- worker version parity / rollout contract
- key versioned asset reachability
- root/home HTTP success if not template-sensitive
- edge routing/headers/cache behaviors that depend on Worker, not Blogger template parity

This lane MUST hard-fail deploy if broken.

LANE B — FULL PUBLIC / TEMPLATE-SENSITIVE SMOKE
Preserve strict full public verification in `qa/live-smoke.sh` or refactor into equivalent strict entrypoint.

This lane includes checks like:
- template fingerprint parity
- homepage/listing/detail structural contracts tied to live Blogger template
- mixed media SSR/runtime contracts tied to template markup
- editorial preview contracts tied to live template
- comments-owner browser proof if template-sensitive
- other surface-level public checks that can legitimately fail until Blogger template is manually published

This lane MUST remain strict when explicitly requested.
But it MUST NOT be the default hard gate for every Worker deploy when template changed and Blogger publish is known to be out of scope.

PHASE 5 — MAKE DEPLOY WORKFLOW TELL THE TRUTH
Refactor `.github/workflows/deploy.yml`.

Required behavior:
1. keep Cloudflare deploy as hard gate
2. keep worker rollout/version contract as hard gate
3. run Worker-scope smoke as hard gate after deploy
4. run full public/template-sensitive smoke only when appropriate

Truthful execution rules:
- If `index.prod.xml` did NOT change:
  full public smoke may run as default hard gate
- If `index.prod.xml` DID change and the workflow does NOT publish Blogger template:
  full public smoke must NOT hard-fail the default Worker deploy unless strict/full mode is explicitly requested
- If `strict_template_parity=true` or equivalent manual input is enabled:
  full public smoke must run and may hard-fail
- If push-triggered deploy occurs with template change:
  workflow summary must clearly say Blogger parity is pending and full public smoke was skipped or downgraded by design

Add or preserve workflow inputs:
- `strict_template_parity`
- `run_full_public_smoke`
- optional `release_note`

Default semantics:
- push to main:
  worker deploy + worker smoke hard gate
  template-sensitive smoke skip/warn when template changed
- workflow_dispatch strict mode:
  can enforce full public/template-sensitive hard gate

PHASE 6 — CLASSIFY CHECKS EXPLICITLY
Inside QA scripts, classify every major check as one of:
- WORKER_SCOPE
- TEMPLATE_SCOPE
- MIXED_SCOPE only if unavoidable, but then justify and split if possible

Do not leave responsibility ambiguous.

If a check is template-sensitive, it must not kill default Worker deploy when:
- `GG_TEMPLATE_CHANGED_IN_REV=1`
- Blogger template publish is out of scope
- strict template parity is off

Worker/version/asset checks remain hard-fail always.

PHASE 7 — FIX DOCUMENTATION DEBT
Add the docs that the workflow references, and make them accurate:
- `qa/template-release-playbook.md`
- `docs/github-actions-cloudflare.md`

These docs must explain:
- what `npm run gaga` now means
- what deploy workflow covers
- what it does NOT cover
- when operator must manually publish Blogger template
- when to run strict full public smoke
- how to interpret green vs warning vs red states

Do not write fantasy docs.
Write docs that match the code after this task.

PHASE 8 — ACTIONS SUMMARY MUST BE HONEST
Update workflow summary output so it explicitly reports:
- CI status
- Cloudflare deploy status
- worker rollout/version status
- worker-scope smoke status
- whether template changed in revision
- whether full public smoke ran / skipped / warned / failed
- whether Blogger manual publish is pending
- whether current green means:
  “Worker release successful, public template parity pending”
  or
  “Full public parity verified”

PHASE 9 — DO NOT BREAK EXISTING HARD QUALITY WHERE IT STILL BELONGS
Preserve strictness where it is legitimate:
- broken Worker deploy must still go red
- broken asset/version rollout must still go red
- broken worker-scope smoke must still go red
- explicit template verification after publish must still go red when wrong

You are not allowed to turn genuine defects into warnings just to get green.

EXPECTED FILE CHANGES
At minimum, expect to change:
- `package.json`
- `package-lock.json`
- `.github/workflows/deploy.yml`
- `.github/workflows/ci.yml` if needed for contract alignment
- `qa/live-smoke.sh`
- `qa/live-smoke-worker.sh` (new if needed)
- `tools/gaga-release.mjs` (new)
- `qa/template-release-playbook.md` (new)
- `docs/github-actions-cloudflare.md` (new)

You may add small helper files if justified.
Do not create unnecessary abstraction layers.

VERIFICATION MATRIX — REQUIRED
You must execute and report PASS/FAIL for each relevant item.

LOCAL / STATIC VERIFY
1. `npm ci`
2. `npm run gaga:preflight`
3. `node --check src/worker.js`
4. `node qa/template-fingerprint.mjs --check`
5. `npm run gaga -- --dry-run` if you implement dry-run for the release orchestrator
   or equivalent safe no-push validation mode

SCRIPT CONTRACT VERIFY
6. `npm run gaga` no longer calls wrangler
7. `npm run gaga:cf:deploy` is the only local direct Worker deploy command
8. `npm run gaga:cf:dry` is the only local direct Worker dry-run command

WORKFLOW / LOGIC VERIFY
9. Push-triggered deploy with Worker-only change:
   expected result = deploy green if Worker path is healthy
10. Push-triggered deploy with `index.prod.xml` changed but no Blogger publish:
   expected result = Worker deploy not false-red solely due to template-sensitive drift
11. Manual strict workflow run with template drift still present:
   expected result = full public smoke hard-fails
12. Deliberately broken Worker version/route/asset:
   expected result = deploy hard-fails

OUTPUT FORMAT — MANDATORY
Return your implementation report exactly in this structure:

1. Objective
2. Root-cause model
3. Files changed
4. Script contract before vs after
5. Workflow contract before vs after
6. QA scope split: worker-scope vs template-scope
7. Verify evidence with PASS/FAIL
8. Residual risks
9. Final operator instructions

HARD RULES
- No fake completion claims
- No “likely fixed” language without evidence
- No silent contract changes
- No preserving ambiguous legacy semantics
- No weakening strict template verification in its proper lane
- No reliance on global installs for repo correctness
- No hidden manual steps except Blogger publish, which must be stated explicitly and honestly

SUCCESS CONDITION
This task is successful only if:
- `npm run gaga` becomes the one true GitHub-based shipping command
- deploy red no longer happens falsely because of known out-of-scope Blogger template drift
- real Worker/runtime regressions still fail hard
- strict public/template verification still exists and remains meaningful
- the repo finally has one coherent release story instead of overlapping lies
IMPLEMENTATION PRIORITY NOTE
Do not start from CSS, UI, or template cosmetics.
Start from release semantics and script/workflow contracts first.
If the pipeline contract stays broken, every future task remains high-friction and untrustworthy.
OPERATOR INTENT NOTE
The operator device is low-capability.
Design for GitHub-first shipping.
Local environment must not be treated as a full deploy workstation.