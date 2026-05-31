# GG 95% Architecture Task Pack v2

This task pack is the updated 00–12 implementation contract for Codex.

The target is not to "rewrite everything". The target is to remove duplicate sources of truth, reconcile commands/guards/CI, preserve Blogger SSR fallback, split the Store CMS source from the Root CMS source, keep one global behavior/visual contract across `/`, `/landing`, and `/store`, and prevent Worker from drifting into an HTMLRewriter/CMS replacement.

## Public Route Intent

```txt
root    = https://www.pakrpp.com/
landing = https://www.pakrpp.com/landing or https://www.pakrpp.com/landing/
store   = https://www.pakrpp.com/store or https://www.pakrpp.com/store/
```

## CMS Source Intent

```txt
Editorial/root CMS:
  pakrpp.blogspot.com
  public canonical: https://www.pakrpp.com/

Store/product CMS:
  pakrppstore.blogspot.com
  optional source/custom host: https://store.pakrpp.com/
  public canonical: https://www.pakrpp.com/store/
```

`store.pakrpp.com` is a source/backend CMS host, not the public SEO destination. The public canonical Store surface is `www.pakrpp.com/store/`.

## Non-Negotiable Principles

1. Rewrite means remove duplicate sources of truth and replace them with one contract. It does not mean destroying working Blogger structures.
2. Do not add override layers above old override layers.
3. Do not manually patch generated artifacts. Fix canonical source, rebuild, then verify.
4. Do not invent QA script names unless they are mapped in `package.json` and documented in `QA-COMMANDS.md`.
5. Prefer existing commands: `ci:qa`, `ci:store`, `ci:cloudflare`, `ci:85`, and `gaga:verify-*`.
6. All mandatory guards must be read-only.
7. All mutating tools must be classified as build/staging tools.
8. GitHub Actions must call aggregate npm scripts, not duplicate long command lists.
9. Cloudflare deploy must happen only after `npm run ci:cloudflare` passes.
10. Deploy workflow must run strict live smoke after deploy.
11. CSS guards must protect architecture, not micromanage design.
12. Budget/performance warnings are advisory unless strict release mode is explicitly requested.
13. Worker is not HTMLRewriter. Do not use edge mutation as the normal fix for Blogger/source HTML, schema, or readability defects.
14. Update existing contract docs before creating any new competing architecture document.

## Execution Order

```txt
00-architecture-command-contract-lock
01-clean-handoff-source-hygiene
02-qa-guard-tools-reconciliation
03-github-actions-cloudflare-deploy-reconciliation
04-content-source-boundary-contract
05-semantic-readable-content-contract
06-global-sheet-contract-v1
07-sheet-gesture-close-behavior
08-unified-data-contract
09-controller-core-adapters-split
10-css-source-visual-rhythm-split
11-lazy-interaction-advisory-budget
12-release-candidate-95-gate
```

Do not start from controller splitting. The order is deliberate:

```txt
contract → handoff → guards → CI/CD → source boundary → semantic/readable output → behavior → data → split → CSS → performance → release gate
```

## Expected End State

```txt
source clean
commands reconciled
guards classified
CI green
Cloudflare deploy deterministic
SSR fallback intact
schema valid
registry authoritative
one behavior contract
one visual rhythm
no duplicate patch layer
Reader Mode eligible by design for post detail pages
root and store CMS sources separated without splitting the frontend contract
Worker remains edge governance/static routing/source staging, not HTMLRewriter/CMS
existing repo contract docs updated without drift
```

## Reader Mode Target

Do not promise Reader Mode across every browser/device/surface. The correct target is:

```txt
Post detail pages:
  Reader Mode eligible by semantic structure.

Page detail / Landing:
  semantic and readable, not forcibly article-like.

Root:
  semantic, crawlable, accessible, not necessarily Reader Mode.

Store listing:
  semantic catalog, not Reader Mode target.

Product detail:
  readable fallback and valid product schema; Reader Mode is nice-to-have, not a blocker.
```

## CSS Guard Philosophy

Mandatory CSS guards may fail only on architecture-level problems:

```txt
generated CSS edited manually
source CSS missing from declared build path
obvious duplicate override/patch files
forbidden emergency CSS layers
missing required CSS module registration
clearly unused large CSS artifacts
```

Everything else is advisory:

```txt
token consistency
visual rhythm
selector naming
component-level spacing
zero duplication
optimization opportunities
```

Do not create strict rules for every selector, spacing value, border radius, declaration order, or component CSS split.


## Worker Boundary

Cloudflare Worker is allowed to handle routing, static assets, headers, cache/robots policy, diagnostics, flags, Cloudflare deploy staging, and declared source/staging adapters.

It is not allowed to become:

```txt
an HTMLRewriter repair layer for Blogger output
a CMS replacement
a second schema pipeline for healthy pages
a hidden UI renderer
a patch layer that masks source/template defects
```

If the HTML output is wrong, fix source and rebuild.

## Existing Contract Docs First

When tasks update architecture truth, prefer updating existing documents:

```txt
AGENTS.md
ARCHITECTURE.md
ASSET-ARCHITECTURE.md
SOURCE-OF-TRUTH.md
SURFACE-CONTRACT.md
QA-COMMANDS.md
REPO-STRUCTURE.md when path policy changes
```

Do not create a parallel architecture contract that conflicts with these files.
