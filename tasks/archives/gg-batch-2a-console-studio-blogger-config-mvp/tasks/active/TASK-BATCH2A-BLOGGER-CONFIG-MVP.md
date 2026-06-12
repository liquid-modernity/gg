# TASK-BATCH2A — Console/Studio Blogger Config MVP

## Status

Ready for Cline sniper execution.

## Goal

Make Blogger target configuration owned by Console and consumed by Studio.

The repo must support two Blogger targets:

```txt
mainBlog  -> pakrpp.blogspot.com / pakrpp.com
storeBlog -> pakrppstore.blogspot.com / pakrpp.com/store / store.pakrpp.com
```

## Required behavior

- `config/blogger.targets.json` is the source of truth.
- Console reads and validates Blogger target config.
- Studio reads the same config.
- Studio does not hardcode Blogger IDs.
- No secret value is stored in repo.
- Local mode can use file-based config.
- Production mode is prepared for remote-backed config, but real remote adapter is not required in this task.

## Minimum config shape

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

## Allowed files

```txt
apps/console/**
apps/studio/**
apps/_shared/**
config/blogger.targets.json
config/secrets.schema.json
registry/api-providers.json
checks/**
tools/**
```

## Forbidden work

```txt
Do not install Tailwind/shadcn/Tiptap.
Do not build full Console UI.
Do not build full Studio editor.
Do not implement Blogger OAuth or publish.
Do not split legacy JS.
Do not edit dist/ or .cloudflare-build/.
```

## Acceptance

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
```

All commands must pass.
