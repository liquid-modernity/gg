# Readiness 85 Report

This report locks the final crawlability, performance, search/AI discoverability, indexing flag, artifact parity, and deploy readiness gate. It verifies technical readiness only; it does not promise rankings, indexing, AI Overview inclusion, traffic, or search result treatment.

## What Is Complete

- `qa/readiness-85-guard.mjs` is the read-only final readiness guard.
- `npm run gaga:verify-85` runs the readiness guard.
- `npm run gaga:verify-lazy-interaction-budget` verifies lazy interaction and advisory budget boundaries.
- `npm run ci:85` runs `npm run ci:cloudflare` and then the readiness guard.
- `npm run ci:95` runs the full 85 gate and the final release-candidate guard.
- The guard verifies the existing semantic SSR, schema JSON-LD, registry, a11y, asset architecture, cleanup, comments, navigation, Discovery, Store isolation, Theme, Shell, Preview, Store proof, template fingerprint, Worker syntax, and live-smoke script syntax gates.
- Route truth remains `/landing = Home`, `/ = Blog`, and breadcrumb `Home(/landing) -> Blog(/) -> current`.
- Blogger SSR, Blogger native comments, Blog1-safe schema, Store static artifacts, and Cloudflare Worker route policy remain the source-owned contracts.

## What Is Advisory

- Lighthouse is advisory during development and remains non-blocking.
- Performance budgets are practical size checks intended to catch obvious regressions, not force unrealistic score chasing.
- Lazy interaction budgets are advisory unless strict release mode is explicit through a strict/production command or environment flag.
- Store product discoverability is guarded by semantic HTML, Store proof, schema parity, real product links, and artifact parity; live marketplace/image availability remains external.
- AI/search readiness means crawlable, visible, semantic, consistent content when production flags allow it. This task does not add AI-only markup, fake GEO/AI hacks, or new `llms.txt` policy.

## Known Warnings

- `flags.json` is currently in `development` mode, so production indexing is intentionally blocked.
- Development robots behavior is expected to return noindex/nofollow through Worker route policy and static fallback headers.
- Static `robots.txt` stays simple and sitemap-visible; Worker-generated `/robots.txt` is the route truth for environment-specific crawler policy.
- Lighthouse workflow is scheduled/manual and advisory.
- Current asset sizes are noted by the readiness guard. Warnings are acceptable only when the guard still exits successfully.
- `calendar_add_on` remains a legacy cleanup candidate only if future usage proof supports removal; it is not a deploy blocker by itself.

## Intentionally Deferred Items

- No live network smoke is run inside `qa/readiness-85-guard.mjs`; live smoke remains `npm run gaga:verify-worker-live:strict` after deploy.
- No production flag switch is performed by this task.
- No stable Store, Discovery, Preview, Shell, Theme, Blog1, Worker healthy-route UI, or Blogger native comments behavior is rewritten.
- No dynamic root ItemList, `data:schemaPosts`, or filtered `data:posts` schema loops are reintroduced inside root Blog1.
- No override-only CSS/JS and no generated-file primary fixes are introduced.

## What Blocks Production Indexing

- `flags.json` has `"mode": "development"`.
- `robots.developmentLockdown`, `robots.blockSearchBots`, and `robots.blockAiBots` are enabled for development.
- Static fallback headers mark `/robots.txt`, `/__gg/*`, service worker, manifest, flags, offline, ads, `llms.txt`, and runtime assets with noindex behavior.
- Production indexing must not be opened while development flags remain active.

## What Must Be Checked Before Production Mode

- Switch `flags.json` to production only when ready, and ensure `robots.developmentLockdown=false`, `robots.blockSearchBots=false`, and `sw.devAggressiveUpdate=false`.
- Keep the canonical host and HTTPS redirects enabled.
- Confirm Worker diagnostics for `/`, `/landing`, `/store`, Store category routes, post detail, and page detail show production route policy with indexable HTML where intended.
- Run `npm run ci:85`.
- Run `npm run ci:95` for final release-candidate command/deploy parity and blocker/advisory classification.
- Deploy only through the prepared Cloudflare path after `npm run ci:cloudflare` passes.
- After deploy, run `npm run gaga:verify-worker-live:strict` against the production base URL.
- Re-check live `/robots.txt`, `X-Robots-Tag`, canonical URL, schema parity, sitemap visibility, and post/page detail rendering before considering production indexing open.
