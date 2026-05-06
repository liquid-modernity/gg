# Task 017 — Clean Development Warning Policy

## Objective

Make development checks clean by suppressing or downgrading known acceptable development-only placeholder warnings, while keeping production and strict checks hard.

Development 10/10 means:
- no noisy false warnings
- real contract issues still fail
- production readiness remains strict

## Scope

Likely files:

```txt
tools/proof-store-static.mjs
src/store/lib/store-report.mjs
tools/build-store-static.mjs
qa/store-artifact-smoke.sh
package.json
docs/store-production-readiness.md
```

## Required Policy

Implement clear Store check modes:

```txt
development
ci
strict
production
```

Recommended environment variables:

```txt
GG_STORE_MODE=development
GG_STORE_MODE=ci
GG_STORE_MODE=strict
GG_STORE_MODE=production
GG_STORE_PRODUCTION_READINESS=1
```

Use existing mode conventions if they already exist.

## Image Warning Behavior

### Development Mode

Allowed:
- `picsum.photos`
- known placeholder image hosts
- placeholder image details in build report

Should not spam terminal `WARN` lines for intentional placeholders.

Still fail:
- invalid image URL syntax
- missing required product fields
- invalid product JSON
- invalid manifest JSON
- invalid JSON-LD
- missing required artifacts

### CI Mode

Same as development unless the repo already defines stricter CI behavior.

### Strict / Production Mode

Must fail:
- `picsum.photos`
- placeholder image hosts
- missing product images
- fallback/static placeholder images
- invalid image URL syntax
- missing required image metadata if production gate requires it

Blogger-hosted uploaded images must pass.

## Required Output Behavior

Development output should be concise. Acceptable:

```txt
STORE STATIC PROOF PASS mode=development path=store.html products=20 itemList=20
```

Optional concise note is acceptable:

```txt
STORE STATIC PROOF NOTE placeholderImages=20 allowedInDevelopment=true
```

Not acceptable in development:

```txt
STORE STATIC PROOF WARN product-a: placeholder image URL remains in non-production data
STORE STATIC PROOF WARN product-b: placeholder image URL remains in non-production data
...
```

## Acceptance Criteria

Run and pass cleanly:

```bash
npm run store:proof
npm run store:check:ci
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Run and confirm strictness remains:

```bash
GG_STORE_PRODUCTION_READINESS=1 npm run store:check:production
```

If placeholder images remain, production check should fail.

## Non-Goals

Do not:
- replace actual images
- change product data
- weaken production strictness
- remove image validation entirely
