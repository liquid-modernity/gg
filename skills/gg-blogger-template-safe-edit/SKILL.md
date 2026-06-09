---
name: gg-blogger-template-safe-edit
description: Use for any edit to Blogger XML templates, index.xml, Blogger conditional tags, Blogger comments, Blogger contact form plumbing, or template fingerprint changes.
---

# GG Blogger Template Safe Edit Skill

Use this skill before touching `index.xml`, Blogger XML templates, Blogger-native comments, contact form plumbing, or template publish artifacts.

## Prime Directive

Never treat Blogger XML as ordinary HTML. Preserve Blogger data expressions, conditional tags, Blog1 rendering, comments, canonical metadata, and template fingerprint integrity.

## Protected Contracts

Preserve:

- Blogger-native rendering;
- Blog1 post/page detail;
- Blogger-native comments and threaded replies;
- label/search/archive behavior;
- canonical URLs;
- schema and breadcrumbs;
- preview sheet contract;
- global dock/nav order;
- discovery taxonomy contract;
- contact form official Blogger plumbing when implemented;
- template fingerprint.

## Safe Merge Procedure

When the owner provides a new XML/mockup/template file:

1. Do not overwrite `index.xml` directly.
2. Parse both baseline and incoming file as XML if possible.
3. Diff features, not only lines.
4. Identify new CSS, markup, data hooks, copy keys, IDs, and scripts.
5. Merge from stable baseline into source template.
6. Fix a11y, duplicate IDs, invalid CSS, and guard contract issues before fingerprinting.
7. Update fingerprint only after final content is stable.
8. Run focused guards.

## Blogger XML Hazards

Check for:

- malformed XML;
- duplicate IDs;
- invalid CSS values;
- missing `aria-label` on icon-only buttons;
- duplicate `data-gg-nav` inside comments;
- broken `data-gg-command-tab` values;
- schema/breadcrumb route mismatch;
- copy keys moved without registry update;
- hard-coded buyer-specific domains that should come from config in future phases;
- over-minified XML breaking Blogger expressions.

## Contact Sheet Rule

For root Blogger surface, official contact sheet should use Blogger Contact Form plumbing when available.

For static landing/store surfaces, use safe fallback route until a shared contact adapter is implemented.

Do not fake a contact form that silently fails.

## Required Focused Checks

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:verify-semantic-ssr
npm run gaga:verify-a11y-static
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-filters
npm run gaga:verify-preview-sheet
```

Then:

```bash
npm run ci:qa
```

If generated publish artifacts are expected:

```bash
npm run gaga:template:pack
```

## Completion Criteria

- XML parses.
- Focused guards pass.
- Fingerprint is current.
- No generated artifact is the only fix.
- Handoff lists any warnings clearly.
