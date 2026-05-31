# Changelog v3 — Worker Boundary Update

Updated from v2 after reviewing the existing repo contract documents.

## Added

- Explicit rule: Worker is not HTMLRewriter.
- Explicit rule: Worker must not become CMS replacement, schema patcher, readability repair layer, or hidden UI renderer.
- Task 04 now requires updating existing contract docs: `AGENTS.md`, `ARCHITECTURE.md`, `ASSET-ARCHITECTURE.md`, `SOURCE-OF-TRUTH.md`, `SURFACE-CONTRACT.md`, and `QA-COMMANDS.md` if new commands are added.
- Store source boundary now states that `store.html + src/store/*` can remain build/render/static artifact owners while `pakrppstore.blogspot.com` / `store.pakrpp.com` provide Store product/content source.
- Task 05 now forbids using Worker HTMLRewriter to hide unresolved Blogger substitutions.
- Task 08 now forbids using Worker HTMLRewriter to synthesize missing `data-gg-*` payloads as the normal data contract.

## Preserved

- Task order remains 00–12.
- `/landing = Home`, `/ = Blog`, `/store = Store`.
- Blogger-first SSR remains protected.
- Cloudflare Worker remains edge governance/static routing/staging policy.
- One frontend behavior contract and one visual rhythm remain mandatory.
