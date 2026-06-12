# CLINE SNIPER TASK — GG vNext Batch 2A

You are working in the GG vNext repo.

## Mission

Implement **TASK-002 — Console/Studio Blogger Config MVP**.

Goal:

```txt
Console owns Blogger target configuration.
Studio reads Blogger target configuration.
No Blogger target should be hardcoded inside Studio code.
No secret value should be stored in repo.
All existing npm checks must remain green.
```

## Mandatory current context

The repo is a unified dev + product repo for PakRPP/GG.

Public apps:

```txt
pakrpp.com                 -> Blog public surface
pakrpp.blogspot.com        -> Blogger source for main blog
pakrpp.com/landing         -> Landing surface
pakrpp.com/store           -> Store canonical or route
store.pakrpp.com           -> Store alias/app surface
pakrppstore.blogspot.com   -> Blogger source for store
```

Private apps:

```txt
console.pakrpp.com         -> Control plane / config admin
studio.pakrpp.com          -> Content/editor/publishing workspace
```

Console local mode writes repo config files.
Console production mode must not write directly to local filesystem.
Studio reads config and uses it to choose Blogger target.

## Exact task

Implement the smallest useful MVP so that:

1. `config/blogger.targets.json` is the single source of truth for Blogger targets.
2. There are two target keys:

```txt
mainBlog
storeBlog
```

3. Each target has at least:

```txt
label
kind
enabled
blogId
sourceUrl
canonicalUrl
aliasUrl
contentType
defaultStatus
```

4. Console can read this config in local mode.
5. Console can validate this config.
6. Console exposes a minimal internal route/API/helper for Blogger target config if the existing server architecture supports it.
7. Studio reads the same config and reports both `mainBlog` and `storeBlog` in `npm run studio:check`.
8. No hardcoded Blogger IDs inside Studio server code, except safe fallback placeholders loaded from config.
9. Secret values are not added to repo.
10. All final acceptance commands pass.

## Preferred config shape

If `config/blogger.targets.json` already exists, update it minimally instead of replacing everything.

Recommended shape:

```json
{
  "version": 1,
  "defaultTarget": "mainBlog",
  "targets": {
    "mainBlog": {
      "label": "PAKRPP Blog",
      "kind": "blogger",
      "enabled": true,
      "blogId": "BLOGGER_MAIN_BLOG_ID",
      "sourceUrl": "https://pakrpp.blogspot.com",
      "canonicalUrl": "https://pakrpp.com",
      "aliasUrl": null,
      "contentType": "article",
      "defaultStatus": "draft"
    },
    "storeBlog": {
      "label": "PAKRPP Store",
      "kind": "blogger",
      "enabled": true,
      "blogId": "BLOGGER_STORE_BLOG_ID",
      "sourceUrl": "https://pakrppstore.blogspot.com",
      "canonicalUrl": "https://pakrpp.com/store",
      "aliasUrl": "https://store.pakrpp.com",
      "contentType": "product",
      "defaultStatus": "draft"
    }
  }
}
```

`BLOGGER_MAIN_BLOG_ID` and `BLOGGER_STORE_BLOG_ID` may remain placeholders until real values are configured.

## Optional API/provider config

If `registry/api-providers.json` or `config/secrets.schema.json` already contains Blogger provider refs, preserve them.

If missing and needed by existing checks, add only env-name references, not secret values:

```txt
GOOGLE_BLOGGER_CLIENT_ID
GOOGLE_BLOGGER_CLIENT_SECRET
GOOGLE_BLOGGER_REFRESH_TOKEN
```

Do not store actual OAuth secret, refresh token, or API token.

## Allowed files

Touch only what is necessary:

```txt
apps/console/**
apps/studio/**
config/blogger.targets.json
config/secrets.schema.json
registry/api-providers.json
checks/**
tools/**
tasks/active/TASK-BATCH2A-BLOGGER-CONFIG-MVP.md
```

You may create tiny shared helper files only if they reduce duplication and fit existing repo style, for example:

```txt
apps/_shared/blogger-targets.mjs
```

Do not create a large new framework.

## Forbidden files / forbidden work

Do not edit generated output:

```txt
dist/**
.cloudflare-build/**
*.bundle.js
*.bundle.css
*.min.js
*.min.css
```

Do not do these in this task:

```txt
install Tailwind
install shadcn/ui
install Tiptap
build full Console UI
build full Studio editor
implement real Blogger OAuth
implement real publish/sync
split legacy JS bridge
refactor all apps
rename module system
change public Blog/Store/Landing design
change package manager
```

Do not run broad file scans unless necessary.

## Implementation hints

Prefer small functions:

```txt
readBloggerTargetsConfig(rootDir)
validateBloggerTargetsConfig(config)
getEnabledBloggerTargets(config)
getBloggerTarget(config, key)
```

Validation rules:

```txt
- config must be JSON object
- targets must contain mainBlog and storeBlog
- each target must have label, kind, enabled, blogId, sourceUrl, canonicalUrl, contentType, defaultStatus
- sourceUrl and canonicalUrl must start with https://
- contentType for mainBlog should be article
- contentType for storeBlog should be product
- defaultStatus should be draft or publish
- no field name should imply raw secret value storage such as clientSecretValue, refreshTokenValue, apiTokenValue
```

Console check expected output can be simple, for example:

```txt
console ok, mode=local, bloggerTargets=mainBlog,storeBlog
```

Studio check expected output can be simple, for example:

```txt
studio ok, targets=mainBlog,storeBlog
```

Do not over-optimize output wording if existing checks already expect a format. Preserve compatibility.

## Final acceptance commands

Run exactly:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
```

If all pass, stop and report:

```txt
## GG vNext Batch 2A — SNIPER REPORT
Status: ALL GREEN or BLOCKED
Files changed:
Commands:
What was implemented:
What was intentionally not implemented:
Next recommended task:
```
