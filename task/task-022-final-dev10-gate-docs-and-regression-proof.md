# Task 022 — Final Dev 10/10 Gate, Docs, and Regression Proof

## Objective

Create the final clean development gate for the Store system and document the contract so future work does not regress.

Development 10/10 means:
- clean build
- clean proof
- clean Cloudflare staging
- clean artifact smoke
- no noisy placeholder warnings
- production strict gate remains separate and hard

## Scope

Likely files:

```txt
package.json
docs/store-development-contract.md
docs/store-production-readiness.md
qa/store-artifact-smoke.sh
tools/proof-store-static.mjs
.github/workflows/deploy-cloudflare.yml
```

## Required Changes

1. Add or update:

   ```txt
   docs/store-development-contract.md
   ```

2. Document:
   - category config source of truth
   - how to add/remove categories
   - route contract
   - nested canonical artifacts
   - transitional flat artifact policy
   - pagination behavior
   - image policy by mode
   - CSS strategy
   - JS strategy
   - Cloudflare staging and smoke flow
   - development vs production gates

3. Add final package script if useful:

   ```json
   {
     "store:check:dev10": "npm run store:check:ci && node tools/cloudflare-prepare.mjs && bash qa/store-artifact-smoke.sh"
   }
   ```

   Adjust command names to match the repo conventions.

4. Ensure `gaga:verify-store-artifact` and `store:check:dev10` are aligned or clearly documented.

5. Development output should be clean:
   - `0 FAIL`
   - `0 noisy WARN`
   - concise `INFO`/`NOTE` allowed only if intentional

6. Production readiness command must remain strict and separate.

## Required Verification

Run and pass:

```bash
npm run store:build
npm run store:proof
npm run store:check:ci
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
npm run gaga:preflight
```

If added:

```bash
npm run store:check:dev10
```

Production check should remain strict:

```bash
GG_STORE_PRODUCTION_READINESS=1 npm run store:check:production
```

If placeholder images remain, production check may fail. That is acceptable and expected.

## Final Acceptance Standard

The Store development gate should represent a true 10/10 development state:

```txt
PASS: build
PASS: proof
PASS: Cloudflare prepare
PASS: artifact smoke
PASS: dev10 gate
PASS: preflight
NO noisy development placeholder warnings
NO stale artifact verification
NO hidden category drift
NO missing generated/staged files
```

## Non-Goals

Do not:
- force production readiness if placeholder development images still exist
- remove production strictness
- add new Store features
- change product catalog content unless needed for tests
