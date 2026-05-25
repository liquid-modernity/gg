# 00 — Current Baseline Hard Constraints

## PAKRPP 85 Architecture North Star

The goal is to harden pakrpp.com into a Blogger-first, semantic, crawlable, accessible, mobile-first, native-feeling PWA-like site with centralized behavior contracts and minimal edge fallback.

Blogger XML remains the SSR source of truth. Cloudflare Worker must not author normal UI during healthy Blogger rendering. JavaScript enhances behavior but must not be the only source of meaningful content. HTML fallback must remain useful without JavaScript. Structured data must reflect visible page content and route truth. Global components must share one visual rhythm, one public API convention, and one sheet/dialog contract.

This is a rewrite only in the architectural sense: remove duplicated sources of behavior and consolidate them into clear contracts. Do not stack override CSS/JS on top of old override CSS/JS. Do not destroy stable features just to make the code look cleaner.

## Baseline Assumption

Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, comments proof, and current CI/CD hardening are already stable.

Global rule for every task:

```txt
Treat this as hardening/audit/contract work.
Work one task only. Do not start the next task.
Do not rewrite stable Store/Discovery/Shell/Preview/controllers unless a guard proves a real defect.
Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
Do not hardblock post titles, URLs, or slugs.
Do not weaken QA guards.
Do not edit generated output as the only fix.
```

## Rewrite, Not Override/Patch

```txt
Rewrite means:
- remove duplicated behavior sources;
- consolidate repeated patterns into one contract;
- replace fragile local patches with global, documented primitives;
- make behavior easier to reason about for humans and AI coding agents.

Rewrite does NOT mean:
- rebuild the site from scratch;
- replace Blogger-native rendering;
- replace native Blogger comments;
- rewrite stable Store, Discovery, Preview, Shell, Theme, or Comments systems without proof of defect;
- add new override-only CSS or JS;
- hide old code while adding another layer on top.
```

## Current Surface Contract

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface

Breadcrumb/schema route truth:
Home(/landing) -> Blog(/) -> current page/post
```

## Current Stable Contracts

```txt
Root Store isolation: stable
Store isolation JS append guard: stable
Global Discovery: / and /landing
Store Discovery: /store
Discovery filters:
  Global = All | Articles | Topics | Saved
  Store  = All | Products | Categories | Saved
Theme:
  Light | Dark only
More/Search/Discovery sheets:
  global behavior stable
Preview sheets:
  root article preview + store product preview share shell/scroll lifecycle
Live smoke:
  PASS or PASS_WITH_WARNINGS only
```

## Source / Generated Boundary

Expected source files:

```txt
index.xml
landing.html
store.html source/build input where applicable
src/js/gg-app.source.js
src/js/modules/*
src/css/gg-app.source.css
src/css/gg-critical.source.css
src/store/*
src/registry/*
registry/copy/*
qa/*
tools/*
.github/workflows/*
package.json
```

Expected generated outputs:

```txt
__gg/assets/*
dist/assets/*
dist/blogger-template.publish.xml
dist/blogger-template.publish.txt
.cloudflare-build/*
store/data/manifest.json
store category pages
```

Do not edit generated output as the only fix. Change source and rebuild.

## QA / Guard / CI Reconciliation Contract

Every new guard must be wired into the executable QA chain. A guard is not accepted if it only exists as a file.

For every new `qa/*.mjs` guard intended to protect a major contract, the task must update or verify:

```txt
1. package.json scripts
2. ci:qa or the relevant aggregate CI script
3. QA-COMMANDS.md
4. READINESS-85 guard if the guard is part of the 85 readiness gate
5. GitHub Actions only if the aggregate command changes or deploy behavior changes
```

Guard rules:

```txt
Guards must be deterministic.
Guards must be read-only.
Guards must exit non-zero on CONTRACT_FAILURE.
Guards must not silently auto-fix source or generated files.
Guards must not depend on live network unless explicitly marked as live smoke.
Guards must print PASS, PASS_WITH_WARNINGS, or CONTRACT_FAILURE clearly.
Tools/build scripts may write generated files. Guards must verify, not mutate.
GitHub Actions must prefer package.json aggregate scripts instead of duplicating long command lists.
```

## Deployment Artifact Discipline

```txt
Verified artifact should be the deployed artifact, or every rebuild must be proven deterministic.
If a build/proof/deploy step rebuilds generated artifacts multiple times, the task must either keep the process deterministic or document why the repeated build cannot drift.
Cloudflare deploy must verify before deploy and live-smoke after deploy.
Production indexing flags must remain a final release concern; development may keep crawler-blocking flags until release readiness.
```
