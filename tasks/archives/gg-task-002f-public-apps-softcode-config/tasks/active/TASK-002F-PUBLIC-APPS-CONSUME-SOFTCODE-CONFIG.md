# TASK-002F — Public Apps Consume Softcode Config

## Status

Planned.

## Goal

Blog, Store, and Landing should start consuming softcode configuration generated from existing registry/config contracts.

This task is a first safe wiring, not a full public UI rewrite.

## Required behavior

- Build emits safe public runtime config.
- Public apps can load the runtime config.
- Fallback HTML remains visible if config load fails.
- Microcopy/navigation/theme/SEO can be consumed incrementally.
- No secrets appear in public runtime config.

## Public runtime config should include

- surfaces
- navigation
- SEO
- theme tokens
- microcopy
- safe icons if useful

## Public runtime config must not include

- API secrets
- client secrets
- refresh tokens
- session secrets
- Cloudflare tokens
- GitHub tokens
- raw env values

## Acceptance

```bash
npm run doctor \
  && npm run build \
  && npm run check \
  && npm run check:softcode \
  && npm run console:check \
  && npm run studio:check \
  && npm run deploy:dry \
  && bash scripts/task002f-acceptance.sh
```

## Boundaries

Do not implement OAuth, publish/sync, Tailwind, shadcn, Tiptap, or legacy JS splitting in this task.
