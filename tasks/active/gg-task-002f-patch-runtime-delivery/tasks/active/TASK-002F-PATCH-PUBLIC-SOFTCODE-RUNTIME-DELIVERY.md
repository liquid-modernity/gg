# TASK-002F-PATCH — Public Softcode Runtime Delivery

## Goal

Patch TASK-002F so public softcode is not only generated, but actually delivered to Blog/Store/Landing runtime outputs.

## Required outcome

- `public-config.json` exists in both `dist/prod/runtime/` and `.cloudflare-build/public/runtime/` after build.
- public JS/CSS assets referenced by Blog/Store/Landing exist in deploy output.
- delivered public JS contains the public-softcode loader marker or `publicSoftcodeInit`.
- check script catches missing asset delivery.
- fallback HTML remains intact.

## Allowed files

- `tools/build.mjs`
- `checks/public-softcode.check.mjs`
- `scripts/task002f-acceptance.sh`
- `scripts/task002f-patch-acceptance.sh`
- `src/modules/public-softcode/**`
- `src/entries/blog.entry.js`
- `src/entries/store.entry.js`
- `src/entries/landing.entry.js`
- `apps/blog/index.xml`
- `apps/store/store.html`
- `apps/landing/landing.html`
- `tasks/active/TASK-002F-PATCH-PUBLIC-SOFTCODE-RUNTIME-DELIVERY.md`

## Forbidden

- Do not implement OAuth.
- Do not implement Blogger publish/sync.
- Do not install Tailwind/shadcn/Tiptap/React.
- Do not split legacy JS bridge.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.
- Do not remove fallback text.
- Do not add secret values.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-patch-acceptance.sh
```
