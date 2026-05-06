# Task 015 — Normalize Store Artifact Verification Pipeline

## Objective

Make Store artifact verification deterministic by ensuring the Cloudflare staging bundle is rebuilt before artifact smoke runs.

The current problem is that `store:check` can validate generated source artifacts, while `qa/store-artifact-smoke.sh` checks `.cloudflare-build/public`. If `.cloudflare-build/public` is stale or incomplete, CI can fail even though local store build/proof passed. This task must remove that ambiguity.

## Scope

Likely files:

```txt
package.json
tools/cloudflare-prepare.mjs
qa/store-artifact-smoke.sh
.github/workflows/deploy-cloudflare.yml
```

Do not refactor unrelated Store runtime, category generation, CSS, JS, or Worker routing in this task.

## Required Changes

1. Update `package.json` so `gaga:verify-store-artifact` runs the full artifact verification chain:

   ```bash
   npm run store:check
   node tools/cloudflare-prepare.mjs
   bash qa/store-artifact-smoke.sh
   ```

2. Ensure `qa/store-artifact-smoke.sh` validates the final Cloudflare bundle under:

   ```txt
   .cloudflare-build/public
   ```

3. If `.cloudflare-build/public` is missing, the smoke script should fail with a clear message telling the developer to run the Cloudflare prepare step.

4. The smoke script must not silently fall back to source-root artifacts.

5. Keep deploy workflow strict by default.

6. Do not weaken real contract failures:
   - missing `store.html` must fail
   - missing CSS/JS assets must fail
   - missing manifest must fail
   - missing category artifacts must fail according to the current contract

## Acceptance Criteria

Run and pass:

```bash
npm run store:check
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Expected result:

```txt
STORE ARTIFACT SMOKE RESULT: PASS
```

No stale bundle behavior should remain.

## Non-Goals

Do not:
- change category config
- change image warning policy
- split JS
- change CSS strategy
- remove transitional flat artifacts
- relax production strictness
