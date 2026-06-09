---
name: gg-repo-structure-reconciliation
description: Use for dev/product split, path migration, folder moves, import rewiring, package script migration, and repository structure cleanup.
---

# GG Repo Structure Reconciliation Skill

Use this skill only when an active task explicitly authorizes repo structure reconciliation.

## Prime Directive

Repo reconciliation is not moving folders. It is path and contract migration.

Every moved file must have its imports, scripts, workflows, docs, guards, generated outputs, and release packaging contracts reconciled.

## Do Not Run During Feature Rescue

Do not run this skill while root blog UX rescue, Blogger XML feature merging, or CI green recovery is still incomplete unless explicitly instructed.

## Target Shape

Dev repo:

```txt
repo-dev/
├─ product/
├─ qa/
├─ tools/
├─ tasks/
├─ docs-internal/
├─ experiments/
├─ archives/
├─ release/
└─ tmp/
```

Buyer/product repo lives inside `product/` and contains the clean repo.

## Migration Map

Before moving files, create a migration map:

```txt
old path -> new path -> owner -> generated/source -> commands affected -> guards affected
```

No move should happen without a map.

## Required Reconciliation Areas

Update all affected:

- import paths;
- package scripts;
- GitHub Actions `working-directory`;
- wrangler/deploy paths;
- build scripts;
- template paths;
- registry/config/content paths;
- checks/guards;
- documentation links;
- release packaging include/exclude rules;
- `.gitignore`;
- source map and dist policy;
- CI artifact paths.

## Workflow

1. Freeze a green baseline.
2. Generate file inventory.
3. Produce migration map.
4. Move files in small groups.
5. Rewire paths immediately after each group.
6. Run focused checks.
7. Run full current CI.
8. Validate `product/` as clean buyer root.
9. Validate release packager.
10. Report final structure.

## Validation

Before reconciliation:

```bash
git diff --check
npm run ci:qa
npm run ci:cloudflare
```

After dev/product split:

```bash
npm --prefix product ci
npm --prefix product run doctor
npm --prefix product run build
```

From dev root:

```bash
npm run dev:product:doctor
npm run dev:product:build
npm run dev:release:buyer
```

Use actual script names if different, but do not leave broken old commands undocumented.

## Completion Criteria

- Repo tree matches target structure.
- Current CI passes.
- Product/buyer package validates from clean extraction.
- No stale paths remain in scripts/docs/workflows.
- Generated output policy is documented.
