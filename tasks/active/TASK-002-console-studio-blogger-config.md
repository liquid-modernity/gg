# TASK-002 — Console + Studio Blogger config wiring

## Goal
Make Console the owner of two Blogger targets and make Studio consume them:

- `mainBlog` → `pakrpp.blogspot.com` / `pakrpp.com`
- `storeBlog` → `pakrppstore.blogspot.com` / `pakrpp.com/store` / `store.pakrpp.com`

## Source of truth

```txt
config/blogger.targets.json
registry/api-providers.json
config/secrets.schema.json
```

## Security rule
Do not store real API keys or secret values in repo. Store env key names only.

## Validation

```bash
npm run console:check
npm run studio:check
npm run doctor
```
