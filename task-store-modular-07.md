TASK 004D — Harden Live Smoke Against Transient Network Timeout

Context:
Task 004C updated qa/live-smoke-worker.sh to understand the split-asset Yellow Cart store contract. It now validates /store as an HTML shell and validates runtime/style markers in:
- /assets/store/store.js
- /assets/store/store.css

Local checks pass:
- bash -n qa/live-smoke-worker.sh
- npm run store:check:ci
- npm run gaga:preflight

But running:
bash qa/live-smoke-worker.sh https://www.pakrpp.com
failed because the live host timed out across multiple endpoints:
- /
- /flags.json
- /sw.js
- /landing
- /store
- /assets/store/store.js
- /assets/store/store.css

This is no longer a store contract failure. It is a live smoke reliability problem.

Goal:
Make live smoke resilient to transient network/Cloudflare timeouts without hiding real contract failures.

This task must not:
- change store UI
- change worker routes
- change store build/proof
- add manifest
- add category pages
- add pagination
- weaken split-asset contract checks when the route body is reachable

Hard requirements:
1. Add retry/backoff to live smoke fetch helpers.
2. Keep hard failures for reachable route contract mismatches.
3. Treat global network outage differently from route-specific contract failures.
4. If most/all core endpoints are unreachable due to timeout, report a clear INFRA/NETWORK failure summary.
5. Allow configurable timeout/retry behavior through env.
6. Do not silently pass if /store is reachable but split-asset markers are missing.
7. Do not silently pass if assets are reachable but required JS/CSS markers are missing.

Update qa/live-smoke-worker.sh:

Add env variables:
- GG_LIVE_RETRIES default 3
- GG_LIVE_RETRY_DELAY_SECONDS default 3
- GG_LIVE_TIMEOUT_SECONDS default 30
- GG_LIVE_CONNECT_TIMEOUT_SECONDS default 15
- GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN default 0

Retry behavior:
1. fetch_body, fetch_headers, fetch_headers_nofollow should retry on:
   - curl exit 28 timeout
   - status 000
   - temporary connect/TLS failures
2. Do not retry on stable HTTP contract status like 404, 500, 301 unless current logic already follows redirects.
3. Log attempts clearly:
   INFO: fetch retry path=/store attempt=2/3 reason=timeout
4. Keep final timing log for the final attempt.

Global timeout classification:
Track core endpoint reachability:
- /
- /flags.json
- /sw.js
- /landing
- /store

If 4 or more of these 5 are unreachable due to timeout/connect failure:
- classify as LIVE_SMOKE_INFRA_UNREACHABLE
- print:
  LIVE SMOKE WORKER RESULT: INFRA_UNREACHABLE
- exit non-zero by default
- but if GG_LIVE_ALLOW_GLOBAL_TIMEOUT_WARN=1, exit 0 with warning

This lets CI/deploy choose strict behavior while local/debug runs can avoid false negatives.

Route-specific behavior:
- If /store is reachable, all /store shell checks must run and fail on contract mismatch.
- If /assets/store/store.js is reachable, JS marker checks must run and fail on mismatch.
- If /assets/store/store.css is reachable, CSS marker checks must run and fail on mismatch.
- If /store references assets but an asset is unreachable while /store is reachable, fail as a store asset availability issue, not global outage.

Add summary:
At end, print:
- reachable core endpoints count
- unreachable core endpoints count
- asset checks attempted
- asset checks passed/failed
- failure class:
  - CONTRACT_FAILURE
  - ROUTE_FAILURE
  - STORE_ASSET_FAILURE
  - INFRA_UNREACHABLE
  - PASS
  - PASS_WITH_WARNINGS

CI workflow:
Do not change deploy behavior yet unless needed.
But make sure deploy-cloudflare.yml can pass env:
- GG_LIVE_RETRIES=3
- GG_LIVE_TIMEOUT_SECONDS=30
- GG_LIVE_CONNECT_TIMEOUT_SECONDS=15

Acceptance criteria:
1. bash -n qa/live-smoke-worker.sh passes.
2. npm run store:check:ci passes.
3. npm run gaga:preflight passes.
4. bash qa/live-smoke-worker.sh https://www.pakrpp.com either:
   - passes when host reachable, or
   - fails with clear INFRA_UNREACHABLE when most endpoints timeout.
5. If /store is reachable but /assets/store/store.js is missing markers, script fails.
6. If /store is reachable but /assets/store/store.css is missing markers, script fails.
7. If all endpoints timeout, script does not misleadingly report store contract failures.
8. No manifest/category/pagination feature work is added.