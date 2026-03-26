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
# TASK-P0.RELEASE-PIPELINE.CLOSURE.10X
GG RELEASE PIPELINE CLOSURE — COMPLETE THE MISSING ARTIFACTS, FIX PRELIGHT, MAKE STRICT MODE ACTUALLY STRICT

MODE
This is a closure task, not a redesign task.
Do not reopen architecture debates.
Do not rename contracts again.
Do not add new abstractions unless strictly necessary.
Finish the reset that was claimed but not completed.

AUDIT FACTS THAT MUST BE TREATED AS TRUE
The current implementation is incomplete and fails its own repo contract:
1. `package.json` now points `gaga` and `gaga:preflight` to `tools/gaga-release.mjs`, but that file does not exist.
2. `package.json` now points `gaga:verify-worker` to `qa/live-smoke-worker.sh`, but that file does not exist.
3. workflow summaries reference:
   - `qa/template-release-playbook.md`
   - `docs/github-actions-cloudflare.md`
   but both files do not exist.
4. the intended local preflight command `node --check src/worker.js` is invalid for this repo because `src/worker.js` uses ESM syntax and the repo is not configured with `"type": "module"`.
5. strict/full template verification is still diluted because template-sensitive checks can remain warning-level even when strict mode should hard-fail.
6. the public repo must end in a state where the new contract is actually runnable, not just described.

MANDATE
Close the reset by implementing the missing artifacts and fixing the broken contract so that:
- `npm run gaga:preflight` works
- `npm run gaga` works as a GitHub-first ship command
- `npm run gaga:verify-worker` works
- workflow-referenced docs exist
- strict template verification can truly hard-fail
- no fake-complete state remains

DO NOT CHANGE THESE HIGH-LEVEL DECISIONS
Keep these decisions exactly as already chosen:
- `npm run gaga` = GitHub-first ship command
- `npm run gaga:cf:deploy` = local direct Wrangler deploy
- `npm run gaga:cf:dry` = local direct Wrangler dry-run
- Worker deploy and Blogger template parity remain decoupled
- Worker-scope smoke remains hard gate
- Full public/template-sensitive smoke remains a separate strict lane

IMPLEMENTATION ORDER — FOLLOW EXACTLY

PHASE 1 — CREATE THE MISSING FILES
Create these files for real:
1. `tools/gaga-release.mjs`
2. `qa/live-smoke-worker.sh`
3. `qa/template-release-playbook.md`
4. `docs/github-actions-cloudflare.md`

Do not leave stubs.
Do not leave TODO placeholders.
Each file must be minimally complete and usable.

PHASE 2 — IMPLEMENT `tools/gaga-release.mjs`
This script must support at least:
- `preflight`
- `ship`

Required behavior for `preflight`:
1. verify git exists
2. verify repo is on branch `main`
3. verify remote `origin` exists
4. run lightweight local checks only
5. exit non-zero on failure

Required behavior for `ship`:
1. perform the same preflight
2. detect whether there are changes to ship
3. if no changes, exit cleanly and truthfully
4. auto-stage changes
5. create deterministic commit message if none supplied:
   `chore(release): ship latest GG changes`
6. push to `origin main`
7. print truthful next-step message that GitHub Actions will run CI + deploy
8. do not invoke Wrangler
9. do not invoke Playwright

Required CLI contract:
- `npm run gaga:preflight` must call `preflight`
- `npm run gaga` and `npm run gaga:push` must call `ship`

PHASE 3 — FIX THE PREFLIGHT CHECK FOR `src/worker.js`
Do NOT keep `node --check src/worker.js` if it is invalid for the repo’s module mode.

Replace it with one of these valid approaches:
- a small Node script that parses/imports Worker syntax safely in ESM mode
- a syntactic validation call that actually works with the current repo setup
- another deterministic and cheap Worker syntax validation that does not require Wrangler

Hard rule:
The final preflight must be truthful and executable on this repo as it exists.
Do not keep a check that is known to fail for structural reasons unrelated to code validity.

PHASE 4 — IMPLEMENT `qa/live-smoke-worker.sh`
This file must exist and run.

It must verify only Worker-scope things that are valid immediately after Worker/assets deploy.
At minimum include:
1. base URL normalization
2. `__gg_worker_ping`
3. expected worker version check
4. key static asset reachability
5. failure on true Worker/runtime mismatch
6. concise PASS/FAIL logging

It must NOT depend on Blogger template parity.
It must NOT run browser proof that belongs to template-sensitive full smoke.
It must be safe as the default post-deploy hard gate.

PHASE 5 — MAKE STRICT TEMPLATE MODE ACTUALLY STRICT
Audit `qa/live-smoke.sh` and deploy workflow env wiring.

Requirement:
When full public smoke is enabled as a hard gate, template-sensitive checks must be able to hard-fail.
Do not leave things like comments-owner or other template-sensitive proof in permanent `warn` mode during strict runs.

Implement exact behavior:
- default Worker deploy lane:
  template-sensitive checks may be skipped or warning-level when Blogger publish is out of scope
- strict full public lane:
  template-sensitive checks must fail hard when broken

Do not fake strictness.

PHASE 6 — VERIFY PACKAGE SCRIPT CONTRACT AGAINST REAL FILES
After creating the missing artifacts, ensure `package.json` script targets are real and runnable.

At minimum the following must execute:
- `npm run gaga:preflight`
- `npm run gaga -- --dry-run` OR equivalent safe ship validation mode if you add one
- `npm run gaga:verify-worker`
- `npm run gaga:verify-template`

If you add a dry-run mode to `tools/gaga-release.mjs`, wire it properly.
If you do not add dry-run, state that clearly and verify `preflight` instead.

PHASE 7 — WRITE THE MISSING DOCS HONESTLY
Create the two missing docs and make them match the code, not fantasy.

`qa/template-release-playbook.md` must explain:
- when Blogger manual publish is required
- when to run full public strict smoke
- how to interpret template drift and post-publish verification

`docs/github-actions-cloudflare.md` must explain:
- what `npm run gaga` means now
- what deploy workflow does
- what deploy workflow does not do
- what green means
- what warning means
- when a red deploy is real versus false-red now eliminated

PHASE 8 — DO NOT LEAVE PUBLIC REPO CONTRACT HALF-MIGRATED
Make sure the final committed repo state actually contains:
- the new scripts
- the new files
- the fixed workflow/doc references
- the corrected preflight logic

This task is not complete if the branch only contains renamed scripts and missing targets.

REQUIRED FILES TO CHANGE
At minimum, expect to change:
- `package.json`
- `package-lock.json` if needed
- `tools/gaga-release.mjs` (new)
- `qa/live-smoke-worker.sh` (new)
- `qa/live-smoke.sh`
- `.github/workflows/deploy.yml`
- `qa/template-release-playbook.md` (new)
- `docs/github-actions-cloudflare.md` (new)

You may add tiny helper files if justified.
Do not create unnecessary framework sprawl.

REQUIRED VERIFY MATRIX
Report PASS/FAIL for each item with evidence.

LOCAL CONTRACT VERIFY
1. `npm ci`
2. `npm run gaga:preflight`
3. Worker syntax/preflight validation passes using the corrected method
4. `node qa/template-fingerprint.mjs --check`
5. `npm run gaga:verify-worker` executes the real worker-smoke entrypoint
6. `npm run gaga:verify-template` still executes full public smoke

SHIP CONTRACT VERIFY
7. `npm run gaga` no longer calls Wrangler directly
8. `npm run gaga:cf:deploy` remains the only local direct Worker deploy command
9. `npm run gaga:cf:dry` remains the only local direct Worker dry-run command

STRICTNESS VERIFY
10. Default deploy lane does not hard-fail on known out-of-scope Blogger drift
11. Strict full public lane can hard-fail template-sensitive checks
12. Worker-scope failures still hard-fail

ARTIFACT VERIFY
13. `tools/gaga-release.mjs` exists
14. `qa/live-smoke-worker.sh` exists
15. `qa/template-release-playbook.md` exists
16. `docs/github-actions-cloudflare.md` exists

OUTPUT FORMAT — MANDATORY
Return the implementation report exactly in this structure:

1. Objective
2. Remaining gaps from prior audit
3. Files changed
4. What was implemented in `tools/gaga-release.mjs`
5. What was implemented in `qa/live-smoke-worker.sh`
6. How preflight was corrected for ESM Worker syntax
7. How strict full-smoke behavior was fixed
8. Verify evidence with PASS/FAIL
9. Residual risks
10. Final operator instructions

HARD RULES
- Do not claim completion if any referenced file is still missing
- Do not keep invalid `node --check src/worker.js` logic unless repo module mode was deliberately corrected and verified
- Do not leave strict mode cosmetically strict but operationally warning-only
- Do not change the high-level release model again
- Do not widen scope into unrelated UI/template work

SUCCESS CONDITION
This closure task is successful only if the repo stops lying:
- script targets exist
- preflight is executable
- worker-smoke entrypoint exists
- strict mode is actually strict
- docs referenced by workflow exist
- the new release contract is runnable, not just described

# TASK-P0.AUDIT-EVIDENCE.CLOSURE.10X
GG AUDIT EVIDENCE CLOSURE — PRODUCE THE CORRECT PROOF PACK FOR RELEASE PIPELINE CLOSURE

MODE
This is not another pipeline redesign task.
Do not touch unrelated UI, template, routing, or feature work.
Do not rename the release model again.
Do not reopen architecture debates.
Your only job is to produce truthful, auditable evidence for the already-implemented closure work.

PROBLEM TO SOLVE
The closure implementation may exist, but the audit evidence is wrong.
The current audit ZIP packaged the wrong task manifest (`TASK-P1.08C`) and did not prove the actual closure artifacts.
That makes the audit unusable.

MANDATE
Produce a correct, self-contained audit pack for:
`TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`

The new audit pack must prove, not merely claim, that the closure task exists and is runnable.

NON-NEGOTIABLE OUTCOME
After this task:
1. There is a dedicated closure audit manifest for `TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`.
2. The audit ZIP includes the actual closure files.
3. The audit pack is generated from the closure manifest, not from some older task.
4. The audit report shows exact PASS/FAIL evidence for the closure contract.
5. If commit/push to `main` really happened, the output must state the exact commit and branch truthfully.

DO NOT
- do not modify release architecture again
- do not create a new task family
- do not package the “latest available manifest” blindly
- do not claim success if the ZIP contents do not match the closure task
- do not hide missing files behind “environment issue” language

IMPLEMENTATION ORDER

PHASE 1 — CREATE A DEDICATED CLOSURE AUDIT MANIFEST
Create a new manifest file under `qa/audit-output/` specifically for:
`TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`

Suggested filename:
`qa/audit-output/task-p0-release-pipeline-closure-10x.json`

The manifest must identify the correct task id and must list the exact files that prove the closure work.

At minimum, the manifest must include these files if they truly exist:
- `package.json`
- `.github/workflows/deploy.yml`
- `qa/live-smoke.sh`
- `qa/worker-syntax-check.mjs`
- `tools/gaga-release.mjs`
- `qa/live-smoke-worker.sh`
- `qa/template-release-playbook.md`
- `docs/github-actions-cloudflare.md`

If any of these files do not exist, do not fake the manifest.
Fix that first or fail honestly.

PHASE 2 — FIX AUDIT PACK SELECTION LOGIC
Audit the packer logic in `qa/package-audit.mjs`.

Current behavior is unacceptable if it silently packages the wrong task manifest.
Change it so that one of these must be true:
A. it requires an explicit task id / manifest path for packing, or
B. it deterministically prefers the closure manifest when that task is requested, or
C. it hard-fails if multiple unrelated manifests exist and no explicit task is provided.

Hard rule:
It must become impossible for `TASK-P0.RELEASE-PIPELINE.CLOSURE.10X` evidence packing to silently export `TASK-P1.08C` again.

PHASE 3 — ADD AN EXPLICIT AUDIT PACK ENTRYPOINT
Create or update a script so the closure audit can be packed explicitly and repeatably.

Preferred result:
- `npm run gaga:audit:pack -- TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`
or
- `node qa/package-audit.mjs TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`

The exact interface may vary, but it must support explicit closure-task packing.
Do not rely on “latest manifest wins”.

PHASE 4 — VERIFY FILE EXISTENCE BEFORE PACKING
Before generating the ZIP, verify that the closure proof files actually exist in the working tree.

At minimum, verify existence of:
- `tools/gaga-release.mjs`
- `qa/live-smoke-worker.sh`
- `qa/worker-syntax-check.mjs`
- `qa/template-release-playbook.md`
- `docs/github-actions-cloudflare.md`

If any are missing, fail before packing.
Do not generate a misleading ZIP.

PHASE 5 — RUN THE CLOSURE VERIFY SET
Run and capture evidence for these commands, with truthful PASS/FAIL:
1. `npm run gaga:preflight`
2. `node qa/worker-syntax-check.mjs`
3. `node qa/template-fingerprint.mjs --check`
4. `npm run gaga -- --dry-run` if supported, otherwise explain and use the safe equivalent
5. `npm run gaga:verify-worker`
6. `npm run gaga:verify-template`

Important:
If environment limitations cause a command to fail, record the failure honestly.
But the audit pack must still prove that the correct entrypoints and files exist.
Do not confuse “environment runtime failure” with “file missing”.

PHASE 6 — PROVE GIT STATE TRUTHFULLY
Capture and include:
- current branch
- current HEAD commit
- whether working tree is clean or dirty
- whether the closure files are tracked by git

At minimum gather evidence with commands equivalent to:
- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git ls-files` for the closure artifact paths

If the claim is that closure was pushed to `main`, show the exact commit hash in the report.
Do not claim public GitHub visibility unless it is actually confirmed by the repo state you have.

PHASE 7 — GENERATE THE CORRECT ZIP
Produce a new ZIP whose manifest and contents are explicitly tied to:
`TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`

The ZIP must include:
- the closure manifest
- the changed closure files
- the verify report/evidence
- no misleading primary manifest for unrelated tasks

The ZIP filename should make the task obvious.
Suggested:
`dist/gg-audit-task-p0-release-pipeline-closure-10x.zip`

PHASE 8 — OUTPUT A TRUTHFUL IMPLEMENTATION REPORT
Return the implementation report exactly in this structure:

1. Objective
2. Why the previous audit pack was invalid
3. Files added or changed
4. How audit pack selection was fixed
5. Closure proof files included in the new ZIP
6. Verify evidence with PASS/FAIL
7. Git state evidence
8. ZIP output path
9. Residual limitations
10. Final audit command to reproduce the pack

REQUIRED ACCEPTANCE CRITERIA
This task is successful only if all of the following are true:
1. A dedicated manifest exists for `TASK-P0.RELEASE-PIPELINE.CLOSURE.10X`
2. Audit packing no longer silently selects an unrelated task
3. The generated ZIP contains the actual closure proof files
4. The report includes truthful PASS/FAIL results for closure verification commands
5. The report includes truthful git branch and commit evidence
6. No unrelated task manifest is presented as the primary proof for closure

HARD RULES
- no fake “AUDIT PACK OK” if the wrong task is packed
- no fake completion if required proof files are missing
- no architecture drift
- no widening into unrelated code
- no hiding behind generic environment excuses when the real issue is wrong evidence selection

SUCCESS CONDITION
The repo stops lying about evidence.
The closure task is proven with the correct manifest, the correct files, and the correct ZIP.