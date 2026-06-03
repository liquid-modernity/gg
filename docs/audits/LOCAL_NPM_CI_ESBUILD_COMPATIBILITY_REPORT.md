# Local npm ci / esbuild Compatibility Report

Audit date: 2026-06-03
Task: `task/task-004-audit local npm ci esbuild compatibility.md`

## Executive Verdict

Classification: **LOCAL ENVIRONMENT BLOCKER**

`npm ci` fails on this Mac because `wrangler@4.61.1` pulls `esbuild@0.27.0`, which installs `@esbuild/darwin-x64@0.27.0`. That native binary is built with macOS minimum version `12.0` and imports `_SecTrustCopyCertificateChain`. The local machine is macOS `10.15.8`, whose Security framework does not provide that symbol.

This is not proven to be a repo-wide blocker. GitHub Actions runs on `ubuntu-latest` with Node `20`, so CI is not using the failing Darwin x64 binary path.

No package versions, package files, source code, workflows, QA guards, or production flags were changed.

## Exact Local Environment Facts

| Fact | Value |
|---|---|
| `node -v` | `v22.19.0` |
| `npm -v` | `10.9.3` |
| `which node` | `/usr/local/bin/node` |
| `which npm` | `/usr/local/bin/npm` |
| `sw_vers` | `ProductName: Mac OS X`, `ProductVersion: 10.15.8`, `BuildVersion: 19H2036` |
| `uname -a` | `Darwin ... 19.6.0 ... RELEASE_X86_64 x86_64` |
| Node platform | `darwin x64` |
| npm local prefix | `/Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg` |

`npm config list` confirms npm is using local prefix in this repo and Node `v22.19.0`.

## Exact CI Environment Facts

From GitHub workflow files:

| File | Evidence |
|---|---|
| `.github/workflows/ci.yml` | `runs-on: ubuntu-latest`; `actions/setup-node@v4`; `node-version: '20'`; runs `npm ci`; runs `npm run ci:cloudflare`. |
| `.github/workflows/deploy-cloudflare.yml` | `runs-on: ubuntu-latest`; `actions/setup-node@v4`; `node-version: '20'`; runs `npm ci`, `npm run ci:cloudflare`, deploy, and strict live smoke. |
| `.github/workflows/lighthouse-ci.yml` | `runs-on: ubuntu-latest`. |

CI does not use local macOS `10.15.8` or Darwin x64 `@esbuild/darwin-x64`.

## esbuild Version Found In package-lock

`package-lock.json` contains:

- `node_modules/esbuild`: `0.27.0`
- `node_modules/@esbuild/darwin-x64`: `0.27.0`
- `node_modules/wrangler`: `4.61.1`

`package-lock.json` shows `esbuild` has optional platform packages, including `@esbuild/darwin-x64: 0.27.0`.

## Dependency That Pulls esbuild

The root project has only one devDependency:

```json
{
  "wrangler": "4.61.1"
}
```

`npm ls esbuild` and `npm explain esbuild` both show:

```text
gg
└─┬ wrangler@4.61.1
  └── esbuild@0.27.0
```

So `esbuild` is pulled by `wrangler`, not directly by this project.

## Binary Evidence

After `npm ci --ignore-scripts`, the package tree can be extracted and inspected.

`node_modules/esbuild/bin/esbuild --version` fails with:

```text
dyld: Symbol not found: _SecTrustCopyCertificateChain
Referenced from: .../node_modules/esbuild/bin/esbuild (which was built for Mac OS X 12.0)
Expected in: /System/Library/Frameworks/Security.framework/Versions/A/Security
```

`file` reports:

```text
node_modules/esbuild/bin/esbuild: Mach-O 64-bit executable x86_64
node_modules/@esbuild/darwin-x64/bin/esbuild: Mach-O 64-bit executable x86_64
```

`otool -l node_modules/@esbuild/darwin-x64/bin/esbuild` reports:

```text
LC_BUILD_VERSION
minos 12.0
sdk 12.0
```

`otool -Iv node_modules/@esbuild/darwin-x64/bin/esbuild` shows imports including:

```text
_SecTrustEvaluateWithError
_SecTrustCopyCertificateChain
```

This directly matches the failing dyld symbol.

## Root Cause Hypothesis

High-confidence hypothesis:

The local macOS runtime is too old for the native `@esbuild/darwin-x64@0.27.0` binary pulled by `wrangler@4.61.1`. The binary targets macOS 12.0 and imports a Security.framework symbol unavailable on macOS 10.15.8.

Evidence against other causes:

- Corrupted `node_modules` or package extraction is unlikely because `npm ci --ignore-scripts` completes successfully.
- Package-lock corruption is unlikely because dependency resolution is consistent and `npm ls`/`npm explain` identify a normal dependency chain.
- npm version mismatch is not the primary evidence; npm extracts the package successfully when lifecycle scripts are disabled.
- Node version mismatch may be a secondary local mismatch because CI uses Node 20 and local uses Node 22, but the observed crash is from dyld loading a native macOS binary before esbuild can report a version.

## Local-only Or Repo-wide

This is currently proven as a local-only blocker for macOS 10.15.8 x64. It is not proven as a repo-wide blocker because:

- CI uses Linux, not macOS.
- CI uses Node 20 and `ubuntu-latest`.
- The failing binary is the Darwin x64 optional package.
- Prior aggregate QA passed after dependencies were already available/usable in this workspace except for clean local `npm ci`.

## Is GitHub Actions Passing Enough For CI Authority?

Yes for CI authority, with one caveat:

- GitHub Actions is the canonical reproducible CI environment for this repo because workflows explicitly install dependencies with `npm ci` on Ubuntu Node 20.
- Passing GitHub Actions proves the repository can install and validate in CI.
- It does not prove this older local Mac can run the current native dependency stack.

## Safe Options

1. Keep package versions unchanged and use GitHub Actions as validation authority for CI/deploy.
2. Use a Linux or Docker dev environment for local validation, aligned with `ubuntu-latest` plus Node 20.
3. Use Node 20 locally to match CI. This may not fix the macOS 10.15 native binary issue, but it removes one environment mismatch.
4. Document the local macOS 10.15 limitation.
5. Add a future non-mutating preflight warning that detects macOS below 12 when `wrangler@4.61.1`/`esbuild@0.27.0` is installed.
6. Upgrade local macOS/toolchain where possible.

## Risky Options

1. Pinning or downgrading `esbuild` through overrides. Risk: `wrangler@4.61.1` explicitly depends on `esbuild@0.27.0`; forcing a different binary may break Wrangler or CI.
2. Downgrading `wrangler`. Risk: Cloudflare deploy behavior and Worker compatibility may change.
3. Replacing native `esbuild` with `esbuild-wasm`. Risk: `wrangler` may not honor that substitution and performance/compatibility may differ.
4. Manually patching `node_modules` or bypassing install scripts. Risk: non-reproducible, not acceptable as repo fix.
5. Cleaning npm cache as a fix. Risk: no evidence of cache corruption; this would not address macOS symbol incompatibility.

## Recommended Path

Recommended:

1. Do not change `package.json` or `package-lock.json` for this issue yet.
2. Treat this as a CI non-blocking local environment issue.
3. Prefer GitHub Actions or a Linux/Docker Node 20 environment for full validation.
4. If local validation must run on this Mac, test Node 20 first for CI alignment, but expect the macOS 10.15 binary incompatibility to remain.
5. Add documentation or a future preflight warning for macOS 10.15 plus `esbuild@0.27.0`.

## Should package.json/package-lock Be Changed?

No, not based on current evidence.

The failing dependency is transitive from `wrangler@4.61.1`, and the failure is tied to this local macOS runtime. Changing package versions would risk CI/deploy behavior to solve a local-only native binary compatibility problem.

## Should Docker/Linux Dev Workflow Be Preferred?

Yes. For this machine, a Linux/Docker workflow that mirrors GitHub Actions (`ubuntu-latest`, Node 20, npm ci) is the safest local validation path.

## What To Do Before Future Local Validation

1. Decide whether local validation must happen on this macOS 10.15 host.
2. If yes, try Node 20 to match CI, but do not assume it fixes the native binary.
3. Prefer Linux/Docker for `npm ci`, `npm run build`, `npm run ci:qa`, `npm run ci:85`, and `npm run ci:95`.
4. Keep GitHub Actions as authority when local Mac install fails for this known native binary reason.
5. Avoid npm cache cleanup unless future evidence shows corrupted cache.

## Commands Run

| Command | Result |
|---|---|
| `git status --short` | Pass; task file is untracked. |
| `node -v` | `v22.19.0` |
| `npm -v` | `10.9.3` |
| `sw_vers` | macOS `10.15.8` |
| `uname -a` | Darwin `19.6.0`, x86_64 |
| `which node` | `/usr/local/bin/node` |
| `which npm` | `/usr/local/bin/npm` |
| `npm config list` | Pass |
| `grep -n "esbuild" package.json package-lock.json` | Pass; found `esbuild@0.27.0` in lockfile and no direct package.json dependency. |
| `grep -n "node-version" .github/workflows/*.yml` | Pass; CI/deploy use Node 20. |
| `grep -n "setup-node" .github/workflows/*.yml` | Pass; CI/deploy use `actions/setup-node@v4`. |
| `cat package.json` | Pass |
| `ls -la node_modules/esbuild/bin 2>/dev/null || true` | Pass |
| `node_modules/esbuild/bin/esbuild --version || true` | Reproduced dyld failure; command returned 0 due `|| true`. |
| `npm ls esbuild || true` | Pass; `wrangler@4.61.1 -> esbuild@0.27.0`. |
| `npm explain esbuild || true` | Pass; `wrangler@4.61.1` pulls `esbuild@0.27.0`. |
| `npm ci --ignore-scripts` | Pass; dependency extraction works when lifecycle scripts are skipped. |
| `file node_modules/esbuild/bin/esbuild node_modules/@esbuild/darwin-x64/bin/esbuild` | Pass; both are Mach-O x86_64 after install script replaced wrapper. |
| `otool -l node_modules/@esbuild/darwin-x64/bin/esbuild | grep -A4 LC_BUILD_VERSION` | Pass; `minos 12.0`. |
| `otool -Iv node_modules/@esbuild/darwin-x64/bin/esbuild | grep SecTrust` | Pass; imports `_SecTrustCopyCertificateChain`. |

## Failed Commands

| Command | Failure |
|---|---|
| `npm ci` | Failed during `node_modules/esbuild/install.js` when executing `node_modules/esbuild/bin/esbuild --version`; dyld could not find `_SecTrustCopyCertificateChain` on macOS 10.15.8. |
| `node_modules/esbuild/bin/esbuild --version` | Failed with the same dyld symbol error. |
| `node node_modules/esbuild/install.js` | Failed with the same dyld symbol error. |

## Final Classification

**LOCAL ENVIRONMENT BLOCKER** with **CI NON-BLOCKING LOCAL ISSUE** behavior.

Not enough evidence to classify as a true repo blocker. There is a dependency version risk for old macOS hosts, but the recommended path is environment/documentation, not package changes.
