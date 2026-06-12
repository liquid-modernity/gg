# CLINE SNIPER TASK — 002F-PATCH Public Softcode Runtime Delivery

You are working in GG vNext. The repository is already green after TASK-002F, but there is one remaining risk: `public-config.json` and `public-softcode` may exist, yet Blog/Store/Landing may not actually load the JS/CSS/runtime assets from deploy output.

## Goal

Make public softcode **runtime delivery** verifiable:

- public config is generated to `dist/prod/runtime/public-config.json`.
- public config is copied to `.cloudflare-build/public/runtime/public-config.json`.
- public JS/CSS bundles are copied to the public deploy path used by Blog/Store/Landing.
- Blog/Store/Landing templates/pages reference JS/CSS paths that exist after build.
- `publicSoftcodeInit` is in the delivered public JS bundle.
- fallback HTML remains intact.
- checks catch missing runtime delivery in the future.

## Work style

Sniper mode only:

1. Inspect only these files first:
   - `tools/build.mjs`
   - `checks/public-softcode.check.mjs`
   - `scripts/task002f-acceptance.sh`
   - `src/modules/public-softcode/public-softcode.js`
   - `src/entries/blog.entry.js`
   - `src/entries/store.entry.js`
   - `src/entries/landing.entry.js`
   - `apps/blog/index.xml`
   - `apps/store/store.html`
   - `apps/landing/landing.html`
   - `package.json`
2. Do not reread the entire repo.
3. Do not rewrite templates broadly.
4. Do not change product direction.
5. Do not edit `dist/**` or `.cloudflare-build/**` manually; only build scripts may generate them.

## Required implementation

### 1. Build output delivery

Update `tools/build.mjs` if needed so the production deploy output contains the actual public JS/CSS assets at the paths referenced by Blog/Store/Landing.

Acceptable patterns:

- Prefer one canonical path if already used consistently, for example:
  - `/assets/gg-app.min.js`
  - `/assets/gg-app.min.css`

- If the Blogger XML currently uses legacy paths like:
  - `/__gg/assets/js/gg-app.dev.js`
  - `/__gg/assets/css/gg-app.min.css`

  then either:
  - copy the generated assets to those paths too, OR
  - update only the minimum references needed so the referenced path exists after build.

Do not break Blogger XML syntax.

### 2. Runtime config delivery

Ensure build output contains:

- `dist/prod/runtime/public-config.json`
- `.cloudflare-build/public/runtime/public-config.json`

### 3. Public loader delivery

Ensure the delivered public JS bundle includes the public softcode loader and calls/wires `publicSoftcodeInit` for Blog/Store/Landing entries.

Do not duplicate loader logic inside HTML.

### 4. Check script hardening

Update `checks/public-softcode.check.mjs` so it validates real runtime delivery, not just source wiring:

- `src/modules/public-softcode/public-softcode.js` exists.
- `dist/prod/runtime/public-config.json` exists after build.
- `.cloudflare-build/public/runtime/public-config.json` exists after build.
- production JS asset exists in deploy output at the path referenced by public pages.
- production CSS asset exists in deploy output at the path referenced by public pages, if CSS reference exists.
- delivered JS contains `publicSoftcodeInit` or a stable public-softcode marker.
- Blog supports `[data-gg-copy]` or `[data-copy]`.
- Store and Landing support `[data-copy]`.
- `public-config.json` contains no obvious secret values. Keep the safe whitelist for names/refs such as `secretsSchema`, env key names, token field names in schema, and theme token values.

### 5. Acceptance script

Create or update `scripts/task002f-patch-acceptance.sh`.

It must:

- run `npm run build` first,
- run `npm run check:public-softcode`,
- verify runtime config exists in both `dist/prod/runtime/` and `.cloudflare-build/public/runtime/`,
- verify deployed public JS/CSS assets exist at referenced path(s),
- verify deployed JS contains public softcode marker,
- verify no macOS junk files are present,
- exit non-zero on failure.

### 6. Task note

Create/update:

`tasks/active/TASK-002F-PATCH-PUBLIC-SOFTCODE-RUNTIME-DELIVERY.md`

Include:

- goal,
- files changed,
- acceptance commands,
- non-goals,
- known remaining limitations.

## Hard boundaries

Do NOT implement:

- Blogger OAuth,
- Blogger publish/sync,
- refresh token generation,
- Tailwind,
- shadcn/ui,
- Tiptap,
- React,
- full Console redesign,
- full Studio editor,
- legacy JS bridge split.

Do NOT edit:

- `dist/**` directly,
- `.cloudflare-build/**` directly,
- `legacy-donor/**`,
- secret values.

## Final acceptance command

Run exactly:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-patch-acceptance.sh
```

Return a concise report with:

- status,
- files changed,
- exact commands passed,
- what was intentionally not implemented.
