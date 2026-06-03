# Local Development Notes

## macOS 10.15 / esbuild / Wrangler Compatibility

This repository currently uses this dependency chain:

```txt
wrangler@4.61.1 -> esbuild@0.27.0 -> @esbuild/darwin-x64@0.27.0
```

The Darwin x64 esbuild binary used by this chain requires macOS 12.0 or newer. On macOS 10.15.x, `npm ci` may fail with:

```txt
dyld: Symbol not found: _SecTrustCopyCertificateChain
```

This is classified as:

- `LOCAL ENVIRONMENT BLOCKER`
- `CI NON-BLOCKING LOCAL ISSUE`

It is not currently proven to be a repository-wide blocker.

## Validation Authority

GitHub Actions is the validation authority for CI/deploy readiness:

```txt
ubuntu-latest
Node 20
npm ci
```

The current CI/deploy workflows run dependency installation and guard validation on Linux with Node 20, not on macOS 10.15.x.

## Recommended Local Validation Path

Use one of these for full local validation:

- GitHub Actions
- Linux environment
- Docker environment with Node 20
- Newer macOS version that supports the current esbuild native binary

Do not downgrade `wrangler`, force an `esbuild` override, or manually patch `node_modules` only to support macOS 10.15.x. That would risk Cloudflare deploy behavior and diverge from CI.

## Local Validation Caveat

On macOS 10.15.x, these commands may fail because of the native esbuild binary:

```bash
npm ci
npm run build
npm run ci:qa
npm run ci:85
npm run ci:95
```

When this happens, use GitHub Actions or Linux/Docker Node 20 instead and classify the failure as a local environment blocker unless new evidence shows a repo-wide dependency issue.

## Future Diagnostic Option

A future non-blocking local diagnostic command may be added:

```bash
npm run doctor:local
```

That command should only warn about unsupported local environments. It must not weaken CI, change dependency versions, skip install scripts, bypass QA guards, or alter production flags.
