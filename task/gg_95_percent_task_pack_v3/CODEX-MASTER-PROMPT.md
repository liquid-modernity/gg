# Codex Master Prompt — GG 95% Architecture v2

Implement the GG 95% architecture tasks sequentially from `00` to `12`.

Do not optimize by adding override layers. Do not manually patch generated artifacts. Fix canonical source, rebuild, then verify.

Do not invent new script names unless they are added to `package.json` and documented in `QA-COMMANDS.md`.

Mandatory guards must be read-only. Mutating tools must be classified as build/staging tools.

Worker is not HTMLRewriter. Do not use Cloudflare Worker as a normal HTML mutation/rendering layer, CMS replacement, schema patcher, or readability repair layer for healthy Blogger pages. Fix canonical source, rebuild, and verify.

Prefer updating existing contract docs (`AGENTS.md`, `ARCHITECTURE.md`, `ASSET-ARCHITECTURE.md`, `SOURCE-OF-TRUTH.md`, `SURFACE-CONTRACT.md`, `QA-COMMANDS.md`) instead of creating a competing architecture contract.

CSS guards must protect architecture, not micromanage design. Performance budgets are advisory unless strict release mode is explicitly requested.

The Store CMS is a separate Blogger source from the Root CMS:

```txt
Root/editorial CMS:
  pakrpp.blogspot.com
  public canonical: https://www.pakrpp.com/

Store/product CMS:
  pakrppstore.blogspot.com
  source-only optional host: https://store.pakrpp.com/
  public canonical: https://www.pakrpp.com/store/
```

`store.pakrpp.com` is source-only/backend CMS host. `www.pakrpp.com/store/` is the public canonical Store surface.

Do not split the frontend contract. Keep one global behavior contract, one registry pattern, one visual rhythm, and adapters per surface/source.

Post detail pages must be semantically structured and Reader Mode eligible by design. Do not promise Reader Mode activation across every browser/device. Fix unresolved Blogger substitutions such as `Can't find substitution for tag [post.title.escaped]` by moving post-specific data/schema into a valid post scope, not by hiding errors with CSS/JS.

Cloudflare deploy must happen only after `npm run ci:cloudflare` passes and must be followed by `npm run gaga:verify-worker-live:strict`.

Work in this order:

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

Before making changes for a task, read its `.md` file and produce a short implementation plan. After making changes, run only mapped package scripts and report exact pass/fail results.
