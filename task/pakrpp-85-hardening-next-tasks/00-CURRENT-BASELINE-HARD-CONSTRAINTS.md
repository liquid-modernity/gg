# 00 — Current Baseline Hard Constraints


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


## Current Surface Contract

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface
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
