# Release Candidate 95 Report

This report defines the final 95% release-candidate gate for the PakRPP hardening track. It is a verification gate, not a feature task or refactor.

## Gate Command Sequence

Run the release-candidate sequence from a clean source tree:

```bash
npm ci
npm run build
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
npm run ci:85
npm run gaga:verify-95
```

`npm run ci:95` is the package aggregate for the final local release-candidate gate. It runs `npm run ci:85` and then `npm run gaga:verify-95`. `npm ci` stays outside the package aggregate because dependency installation is an environment step.

## Deploy Sequence

Deploy only after `npm run ci:cloudflare` passes:

```bash
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

The Cloudflare deploy workflow reflects that sequence with checkout, setup Node, `npm ci`, `npm run ci:cloudflare`, `npm run deploy:cloudflare:prepared`, strict live smoke, and failure-only diagnostics.

## Guard Scope

`npm run gaga:verify-95` is read-only and checks:

- RC95 package script wiring and aggregate command ownership.
- GitHub Actions deploy order and prepared Cloudflare deploy path.
- Required source, guard, generated, and staged artifact presence after build.
- Documentation of blockers vs advisory warnings.
- Worker remains governance/static routing only and is not an HTMLRewriter, CMS, schema, or readability repair layer.
- Production/indexing flags were not switched by this gate.

## Blocking Conditions

The release-candidate gate blocks on command failure, `CONTRACT_FAILURE`, `SSR_FAILURE`, `SCHEMA_FAILURE`, `BUILD_FAILURE`, `HANDOFF_FAILURE`, or `CI_FAILURE`.

Production deployment is blocked until `npm run ci:cloudflare` passes. Production indexing is blocked while `flags.json` remains in development lockdown or crawler blocking mode.

## Advisory Warnings

Performance, Lighthouse, CSS visual rhythm, lazy interaction budget, and token/rhythm warnings are advisory unless strict release mode is explicit. The RC95 guard may emit `PASS_WITH_WARNINGS` for development/indexing lockdown and advisory budget status.

Set `GG_RC95_STRICT_RELEASE=1` only when a production-indexing release is being promoted and advisory release blockers should be treated as failures.

## Manual production checklist

Before opening production indexing, manually verify:

- `/`, `/landing`, and `/store` render the correct public surfaces.
- Post detail and page detail keep Blogger SSR, readable content, native comments, canonical URL, and JSON-LD route truth.
- Root/editorial and Store CMS feeds remain separated by the source-boundary registry.
- Reader Mode sees visible article body content without JavaScript-only substitution.
- Global sheets, preview sheets, bottom-sheet drag close, top-preview drag close, keyboard Escape, and focus restoration work on mobile and desktop.
- Live `/robots.txt`, `X-Robots-Tag`, sitemap visibility, canonical URL, and schema parity match the intended production flag state.

## Intentional Non-Changes

- No generated artifact is patched as the primary fix.
- No Worker HTMLRewriter/content repair path is introduced.
- No production/indexing flag is switched by this task.
- No Store, Discovery, Shell, Preview, Theme, Blog1, comments, or Blogger-native rendering system is replaced.
