---
name: gg-release-packaging
description: Use when preparing buyer packages, release zips, product artifacts, checksums, release notes, or dev-to-prod packaging.
---

# GG Release Packaging Skill

Use this skill when producing a buyer-ready package or release artifact.

## Prime Directive

The buyer package must be lean, polished, reproducible, CI-safe, and free from internal development clutter.

## Release Inputs

Confirm:

- version;
- release channel: internal, staging, buyer, production;
- source branch/commit;
- active product profile;
- production build policy;
- source-map policy;
- minification/compression policy;
- expected public surfaces.

## Package Boundary

Dev-only materials must not ship in buyer package unless explicitly selected:

- `qa/` heavy internal guards;
- `tools/` internal migration/audit/release tools;
- `tasks/` AI task prompts;
- `docs-internal/`;
- `experiments/`;
- `archives/`;
- `tmp/`;
- debug logs;
- local tokens;
- `.env`;
- old zips;
- snapshots.

Buyer-safe package may include:

- `apps/console/`;
- optional `apps/studio/`;
- `config/`;
- `content/`;
- `registry/`;
- `src/`;
- `templates/`;
- `public/`;
- `scripts/`;
- `checks/`;
- `docs/`;
- `examples/`;
- `.github/workflows/validate.yml`;
- `.github/workflows/deploy.yml`;
- package metadata.

## Release Procedure

1. Ensure active source branch is clean or record dirty state.
2. Run focused product checks.
3. Build production output from source.
4. Generate dist artifacts.
5. Minify where safe.
6. Generate private source maps if policy allows.
7. Exclude public `.map` files unless explicitly allowed.
8. Generate release manifest.
9. Generate checksums.
10. Package buyer zip.
11. Test buyer package in a clean temporary directory.
12. Produce release notes.

## Buyer Package Validation

In clean extracted package:

```bash
npm ci
npm run doctor
npm run build
```

If deploy is configured:

```bash
npm run preview
```

Do not claim buyer package readiness until clean-package validation passes.

## Output Manifest

Each release should include machine-readable metadata:

```json
{
  "version": "x.y.z",
  "sourceCommit": "...",
  "createdAt": "...",
  "profile": "...",
  "included": [],
  "excluded": [],
  "checks": [],
  "artifacts": [],
  "sourceMaps": "private|excluded|public",
  "minified": true
}
```

## Handoff Format

Report:

- release version;
- package path;
- manifest path;
- checksums;
- excluded internal folders;
- validation commands and results;
- source-map policy;
- known limitations.
