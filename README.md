# GG Agent Skills Pack

Private project skills and an updated `AGENTS.md` contract for the PakRPP / GG product workspace.

Use this pack to make AI agents safer and more consistent when the owner requests feature additions, revisions, deletions, UI reconciliation, Blogger XML edits, repo restructuring, release packaging, CI recovery, production optimization, and GG Console / GG Studio integration.

## Recommended placement

For the current repo before repo-structure reconciliation:

```txt
AGENTS.md
skills/
  gg-feature-change/SKILL.md
  gg-ui-reconciliation/SKILL.md
  gg-blogger-template-safe-edit/SKILL.md
  gg-release-packaging/SKILL.md
  gg-repo-structure-reconciliation/SKILL.md
  gg-console-studio-cms-integration/SKILL.md
  gg-ci-green-reconciliation/SKILL.md
  gg-safe-delete-cleanup/SKILL.md
  gg-production-build-optimization/SKILL.md
  gg-agent-handoff/SKILL.md
```

After dev/product split, keep these in the **dev repo root** unless a future task explicitly packages selected buyer-safe skills into `product/`.

## Important rule

Do not let an AI agent run repo-structure reconciliation before the root blog UX tasks are green. The skills support both phases, but the active task remains the source of scope.

## Included diagram

`docs-internal/architecture-decisions/production-deploy-sequence.puml` contains the production-focused PlantUML sequence diagram.
