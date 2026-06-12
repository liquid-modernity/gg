You are DeepSeek V4 Pro running inside Cline in VS Code.

Work in SNIPER MODE: fast, precise, minimal file reads, minimal edits, no broad refactor.

Goal: complete GG vNext Batch 1 only.

Batch 1 scope:
1. Softcode registry contract
2. Module source contract
3. Build dev/prod bundle contract
4. Cloudflare cache policy contract
5. Minimal guards green

Final commands must pass:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
```

Hard rules:
- Do not edit `dist/**` or `.cloudflare-build/**` as source fixes.
- Do not edit `*.bundle.js`, `*.bundle.css`, `*.min.js`, or `*.min.css` manually.
- Do not install Tailwind, shadcn, Tiptap, React, Vue, or any large framework in Batch 1.
- Do not build full Console UI.
- Do not build full Studio editor.
- Do not implement real Blogger publish API yet.
- Do not implement real Cloudflare production deploy yet.
- Do not split the whole legacy JS bridge yet.
- Do not rename the whole repo structure unless required by failing checks.
- Do not create many new guard scripts. Keep guards minimal.

Allowed source edits:
- `registry/**`
- `config/**`
- `src/modules/**`
- `src/entries/**`
- `apps/**`
- `tools/**`
- `checks/**`
- `public/**`
- `package.json`
- `AGENTS.md`
- `tasks/**`

Execution protocol:
1. First inspect only these files/folders:
   - `package.json`
   - `AGENTS.md`
   - `registry/`
   - `config/`
   - `src/modules/`
   - `src/entries/`
   - `tools/`
   - `checks/`
   - `apps/console/`
   - `apps/studio/`
2. Run:
   ```bash
   npm run doctor
   npm run build
   npm run check
   npm run console:check
   npm run studio:check
   npm run deploy:dry
   ```
3. Fix only the first failing category.
4. Re-run the smallest related command.
5. Continue until final commands pass.

Expected contracts:

Registry should include:
- `registry/modules.json`
- `registry/routes.json`
- `registry/microcopy.id.json`
- `registry/microcopy.en.json`
- `registry/icons.json`
- `registry/api-providers.json`

Config should include:
- `config/blogger.targets.json`
- `config/domains.config.json`
- `config/secrets.schema.json`
- `config/cache-policy.json`
- `config/app.config.json`
- `config/build.config.json`

Module contract:
Each module in `registry/modules.json` should resolve to a real path under `src/modules/<module>/`.
A module may have CSS only, JS only, or both.
Do not force legacy JS fragments to become valid ESM in Batch 1.
Keep `legacy-app` as temporary bridge if needed.

Build contract:
- Dev output goes to `dist/dev/`
- Prod output goes to `dist/prod/`
- Dev assets are readable/unminified
- Prod assets are minified
- Bundle output is generated only

Cache policy contract:
Public surfaces are cache-first:
- Blog
- Store
- Landing

Private surfaces are no-store:
- Console
- Studio

Suggested cache behavior:
- fingerprinted/minified assets: long cache + immutable
- registry JSON: short cache + stale-while-revalidate
- public HTML: controlled public cache
- console/studio/API/private routes: no-store

Console/Studio Batch 1 requirement:
They only need to pass health/check mode.
Do not implement full UI.

When done, provide a concise final report:
- files changed
- checks passed
- unresolved issues, if any
- next recommended task
