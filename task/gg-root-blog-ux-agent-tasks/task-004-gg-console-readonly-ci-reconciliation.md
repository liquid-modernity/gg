# TASK 004 — GG Console Read-Only MVP + Focused CI Reconciliation

## Status

Development only. This task starts after the Root Blog UX Pack and Blog Retention Pack are stable enough that their contracts are no longer moving daily.

This task is the focused replacement for running old `task-002-reconcile.md` broadly. Use old `task-002-reconcile.md` only as policy reference. Do not execute it as a separate wide refactor unless CI failures remain outside this pack.

## Goal

Create a local, scalable, read-only dashboard called GG Console for inspecting:

- active profile/config values
- surface registry
- route registry
- copy registry
- a11y status
- guard/build status
- GitHub Actions readiness

The dashboard must reduce overwhelm during development. It must not become a runtime dependency for public surfaces.

## Product Intent

GG Console is a local build/config dashboard, not a CMS.

It should help a developer or buyer understand:

- what brand/profile is active
- what source feeds are configured
- what public surfaces exist
- what navigation/copy/filter contracts exist
- which guard is failing
- whether GitHub Actions deploy path should be green

## Scope

### Include

- Local read-only dashboard.
- Safe local server.
- Inspect repo config/registry/copy files.
- Show QA command status.
- Show GitHub Actions readiness summary.
- Add minimal documentation.
- Reconcile scripts/workflows/guards needed for CI green after Tasks 001-003.

### Exclude

- Editable dashboard in MVP.
- Database.
- Authentication.
- Remote hosted console.
- Arbitrary shell command execution from browser.
- Full stack-agnostic migration.

## Suggested File Structure

```txt
apps/
  console/
    server.mjs
    index.html
    app.js
    styles.css
```

If the repo already has `dashboard.html`, decide whether to:

1. keep it as legacy/static dashboard, or
2. migrate it into `apps/console`, or
3. leave it untouched and build GG Console separately.

Document the decision.

## Package Scripts

Add scripts without breaking existing ones:

```json
{
  "scripts": {
    "gg:console": "node apps/console/server.mjs",
    "gg:console:check": "node apps/console/server.mjs --check"
  }
}
```

Do not rename existing build/CI scripts.

## Console MVP Tabs

### 1. Profile

Show:

- site name
- canonical base
- root Blogger source
- store Blogger source
- landing surface URL
- store canonical URL
- environment
- release/fingerprint if available

If no formal profile config exists yet, infer read-only values from existing files and mark them as `legacy-derived`.

### 2. Surfaces

Show:

- root blog
- landing static
- store static
- Blogger root source
- Blogger store source

Recommended display columns:

```txt
id | type | renderer | source | canonical | status
```

### 3. Navigation

Show:

- global dock items
- More sheet links
- listing filters
- contact route/mode

### 4. Copy

Show loaded copy files:

- `gg-copy-en.json`
- `gg-copy-id.json`
- `gg-copy-manifest.json`
- `gg-copy-meta.json`

Report missing keys, but do not auto-edit.

### 5. A11y

Show result of a safe read-only check, for example:

- duplicate ID count
- buttons without names count
- missing form labels count
- sheet trigger/panel mismatch count

This may call existing guard scripts from a whitelist, or read precomputed JSON if safer.

### 6. Build / CI

Show command checklist:

- `npm run build`
- `npm run ci:cloudflare`
- `npm run ci:qa`
- `npm run ci:85`
- `npm run ci:95`

MVP may show instructions only. Running commands from the dashboard is optional and should be disabled unless implemented through a strict whitelist.

## Server Safety Rules

- Bind to localhost by default.
- Do not expose beyond local machine unless explicitly configured.
- Do not allow arbitrary file reads.
- Do not allow arbitrary shell commands.
- Only read whitelisted files.
- Only run whitelisted commands if command execution is added.
- Do not write files in MVP.

Suggested local URL:

```txt
http://127.0.0.1:8789
```

## Whitelisted Files For Read-Only MVP

Read only if present:

```txt
package.json
SOURCE-OF-TRUTH.md
SURFACE-CONTRACT.md
REPO-STRUCTURE.md
QA-COMMANDS.md
docs/ci-guard-policy.md
gg-copy-en.json
gg-copy-id.json
gg-copy-manifest.json
gg-copy-meta.json
index.xml
landing.html
store.html
wrangler.jsonc
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
```

Do not fail hard if a file is intentionally absent. Report status.

## Focused CI Reconciliation

This task must reconcile the repo after Tasks 001-003 so GitHub Actions should be green.

Check:

- `.github/workflows/ci.yml` exists in the actual repo.
- `.github/workflows/deploy-cloudflare.yml` exists in the actual repo.
- `.github/workflows/lighthouse-ci.yml` exists in the actual repo.
- `.gitignore` exists in the actual repo.
- CI uses Node 20.
- CI runs `npm ci`.
- CI runs `npm run ci:cloudflare`.
- Deploy workflow runs verification before deploy.
- Deploy workflow uses `npm run deploy:cloudflare:prepared` after preparation.
- Lighthouse is advisory during development.
- Dotfiles are included in source archives using `git archive` or equivalent.

Do not change working GitHub Actions just because they were missing from a prior ZIP export.

## Guard Tier Policy

Keep the 3-tier model from the old reconciliation task:

- BLOCKER: must fail CI
- WARNING: reported but not hard-fail in development
- INFO: trend/report only

But apply it narrowly.

Examples of blockers in this pack:

- broken build
- invalid Blogger XML
- missing accessible names on new sheet buttons
- duplicate IDs introduced by new UI
- broken sheet lifecycle
- broken nav/more contract
- broken preview save contract
- broken related posts contract if wired as required
- template fingerprint mismatch
- Worker syntax failure
- generated/public route mismatch that breaks Cloudflare deploy

Examples of warnings:

- visual rhythm not pixel-perfect
- Lighthouse score below target during development
- non-critical unused CSS warning
- advisory bundle growth

## Documentation Updates

Create or update:

```txt
docs/gg-console.md
```

Update if needed:

```txt
QA-COMMANDS.md
docs/ci-guard-policy.md
SURFACE-CONTRACT.md
REPO-STRUCTURE.md
AGENTS.md
```

Do not duplicate documentation. Update the existing source-of-truth when one already owns the topic.

## Required Commands

Run after implementation:

```bash
npm run gg:console:check
npm run build
npm run ci:cloudflare
npm run ci:qa
npm run ci:85
npm run ci:95
```

If `ci:85` or `ci:95` fails because of advisory thresholds unrelated to this pack, classify clearly and reconcile policy if needed.

## GitHub Actions Green Requirement

Expected green path:

```txt
GitHub CI:
  npm ci
  npm run ci:cloudflare

GitHub Deploy:
  npm ci
  npm run ci:cloudflare
  npm run deploy:cloudflare:prepared
  npm run gaga:verify-worker-live:strict
```

Local completion does not require Cloudflare secrets. Deploy step requiring secrets must be documented separately.

## Acceptance Criteria

- `npm run gg:console` starts a local read-only dashboard.
- `npm run gg:console:check` validates console file wiring without launching a long-running server.
- Console displays profile/surface/navigation/copy/a11y/build readiness info.
- Console does not write files in MVP.
- Console does not expose arbitrary shell execution.
- GitHub workflow presence is validated against the real repo, not a ZIP artifact.
- Dotfile packaging guidance is documented.
- `npm run build` passes.
- `npm run ci:cloudflare` passes.
- `npm run ci:qa` passes.
- `npm run ci:85` and `npm run ci:95` pass or their failures are correctly classified and reconciled.

## Stop Rule

If dashboard editing becomes necessary, stop. Editable config/profile dashboard is a later phase after read-only GG Console proves useful.
