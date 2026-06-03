# TASK — Audit Local npm ci / esbuild Compatibility

Audit why `npm ci` fails locally with this esbuild error:

`dyld: Symbol not found: _SecTrustCopyCertificateChain`

This is an audit-only task.

Do not change package versions.
Do not edit package.json.
Do not edit package-lock.json.
Do not edit source code.
Do not change GitHub Actions.
Do not weaken QA guards.
Do not change production flags.
Do not fix anything yet.

The goal is to determine whether this is:

1. local macOS version limitation
2. Node version mismatch
3. npm version mismatch
4. esbuild version incompatibility
5. corrupted node_modules/cache
6. package-lock issue
7. CI-only versus local-only difference
8. expected incompatibility with this Mac runtime

GitHub Actions already passed, so compare local environment against CI environment.

## Required Inspection Commands

Run:

```bash
git status --short
node -v
npm -v
sw_vers
uname -a
which node
which npm
npm config list
grep -n "esbuild" package.json package-lock.json
grep -n "node-version" .github/workflows/*.yml
grep -n "setup-node" .github/workflows/*.yml

Also inspect:

cat package.json
ls -la node_modules/esbuild/bin 2>/dev/null || true
node_modules/esbuild/bin/esbuild --version || true

If useful, inspect dependency chain:

npm ls esbuild || true
npm explain esbuild || true

Do not run destructive cache cleanup unless only as a recommendation, not execution.

Required Output

Create:

docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md

The report must include:

Executive verdict
Exact local environment facts
Exact CI environment facts from GitHub workflow files
esbuild version found in package-lock
dependency that pulls esbuild
root cause hypothesis
whether this is local-only or repo-wide
whether GitHub Actions passing is enough for CI authority
safe options
risky options
recommended path
whether package.json/package-lock should be changed or not
whether Docker/Linux dev workflow should be preferred
what to do before future local validation
commands run
failed commands
Classification Rules

Classify the issue as one of:

TRUE REPO BLOCKER
LOCAL ENVIRONMENT BLOCKER
CI NON-BLOCKING LOCAL ISSUE
DEPENDENCY VERSION RISK
UNKNOWN / NEEDS MORE DATA

Do not overstate certainty. If the evidence only proves local failure, say so.

Recommended Options To Evaluate

Evaluate these options, but do not execute them:

Keep package versions and use GitHub Actions as validation authority.
Use a Linux/Docker dev environment for local validation.
Use Node version aligned with CI.
Pin or downgrade esbuild only if safe and justified.
Upgrade local macOS/toolchain if possible.
Add documentation for local Mac compatibility limitation.
Add a non-mutating preflight script that warns about unsupported local macOS.
Final Response

When done, summarize only:

report file created
root cause classification
recommended path
whether repo code/package files were changed