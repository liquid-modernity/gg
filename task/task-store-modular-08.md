TASK 004E — Split Local and Deploy Live Smoke Modes

Context:
Task 004D hardened qa/live-smoke-worker.sh with retry/backoff and INFRA_UNREACHABLE classification.

Current local output:
npm run gaga:verify-worker-live
→ LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE
because all core endpoints timed out:
- /
- /flags.json
- /sw.js
- /landing
- /store

This is not a store contract failure. It is a network/infra reachability failure from the current machine/runner.

Problem:
The same command is used as a hard deploy gate. Locally, this blocks development even when the code contract is valid. In deploy CI, we still want strict behavior unless explicitly configured.

Goal:
Separate local/dev live-smoke behavior from strict deploy live-smoke behavior.

Hard requirements:
1. Do not weaken contract checks when endpoints are reachable.
2. Do not hide real /store contract failures.
3. Do not change store UI.
4. Do not change worker routes.
5. Do not add manifest/category/pagination.
6. Keep deploy strict by default.
7. Add a local/dev convenience command that allows INFRA_UNREACHABLE as warning.

Update package.json scripts:

Keep strict command:
"gaga:verify-worker-live": "bash qa/live-smoke-worker.sh \"${GG_LIVE_BASE_URL:-https://www.pakrpp.com}\""

Add local/dev command:
"gaga:verify-worker-live:local": "GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN=1 bash qa/live-smoke-worker.sh \"${GG_LIVE_BASE_URL:-https://www.pakrpp.com}\""

Add optional CI explicit command:
"gaga:verify-worker-live:strict": "GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN=0 bash qa/live-smoke-worker.sh \"${GG_LIVE_BASE_URL:-https://www.pakrpp.com}\""

Update deploy-cloudflare.yml:
- Use npm run gaga:verify-worker-live:strict
- Do not allow global timeout warning in deploy unless a workflow variable explicitly says so.

Optional:
Add workflow env override:
GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN: ${{ vars.GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN || '0' }}

But default must remain strict.

Update qa/live-smoke-worker.sh output:
If INFRA_UNREACHABLE and GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN=1:
- print LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE_WARN
- exit 0
If INFRA_UNREACHABLE and GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN=0:
- print LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE
- exit 1

Acceptance criteria:
1. npm run gaga:verify-worker-live still exits non-zero on INFRA_UNREACHABLE.
2. npm run gaga:verify-worker-live:local exits 0 on INFRA_UNREACHABLE.
3. npm run gaga:verify-worker-live:strict exits non-zero on INFRA_UNREACHABLE.
4. If /store is reachable but contract markers are wrong, both local and strict modes must fail.
5. Deploy workflow uses strict mode.
6. No manifest/category/pagination work added.