# TASK-002F — Public Apps Consume Softcode Config

## Status
✅ **COMPLETED** — All acceptance checks pass.

## Implemented scope

### Runtime public config artifact
- Build tool (`tools/build.mjs`) emits `public-config.json` into:
  - `dist/dev/runtime/public-config.json`
  - `dist/prod/runtime/public-config.json`
  - `.cloudflare-build/public/runtime/public-config.json`
- Contains only safe public fields: `version`, `generatedAt`, `surfaces`, `navigation`, `seo`, `themeTokens`, `microcopy`, `icons`
- Does NOT include: API provider secrets, tokens, passwords, session secrets, raw env values

### Public softcode loader module
- `src/modules/public-softcode/public-softcode.js` — vanilla JS module
- `src/modules/public-softcode/public-softcode.css`
- `src/modules/public-softcode/base.contract.json`
- Fetches `/runtime/public-config.json`
- Applies microcopy to `[data-copy]` and `[data-gg-copy]` elements
- Applies theme tokens as CSS custom properties on `document.documentElement`
- Fails silently — never blanks the page if config load fails

### Entry wiring
All three public surface entries import public-softcode:
- `src/entries/blog.entry.js` — calls `publicSoftcodeInit("blog")`
- `src/entries/store.entry.js` — calls `publicSoftcodeInit("store")`
- `src/entries/landing.entry.js` — calls `publicSoftcodeInit("landing")`

### Fallback markers
- Blog (`apps/blog/index.xml`): Extensive `data-gg-copy` markers (~99 matches) with Blogger fallback text preserved
- Store (`apps/store/store.html`): `data-copy` markers (~103 matches) with fallback text preserved
- Landing (`apps/landing/landing.html`): `data-copy` markers with fallback text preserved
- Both `[data-copy]` and `[data-gg-copy]` selectors are supported by the loader

### Check script
- `checks/public-softcode.check.mjs` validates:
  - `src/modules/public-softcode` module exists
  - `public-config.json` emitted after build
  - No secret/token/password/key-like values in config
  - Entries wire public-softcode for each surface
  - Blog supports `data-gg-copy` or `data-copy`
  - Store/Landing support `data-copy`
  - Expected top-level config keys present
  - Cloudflare deploy output if `.cloudflare-build/public` exists
- npm script: `npm run check:public-softcode`

### Acceptance script
- `scripts/task002f-acceptance.sh` runs full pipeline:
  - `npm run doctor`
  - `npm run build`
  - `npm run check`
  - `npm run check:softcode`
  - `npm run check:public-softcode`
  - `npm run console:check`
  - `npm run studio:check`
  - `npm run deploy:dry`
  - Verifies `dist/prod/runtime/public-config.json` exists
  - Verifies config has no obvious secret keys

## Files changed
| File | Change |
|------|--------|
| `tools/build.mjs` | Added `emitPublicConfig()` — generates runtime public-config.json |
| `src/modules/public-softcode/public-softcode.js` | New — public softcode loader module |
| `src/modules/public-softcode/public-softcode.css` | New — softcode module styles |
| `src/modules/public-softcode/base.contract.json` | New — module registry contract |
| `src/entries/blog.entry.js` | Wired to call `publicSoftcodeInit("blog")` |
| `src/entries/store.entry.js` | Wired to call `publicSoftcodeInit("store")` |
| `src/entries/landing.entry.js` | Wired to call `publicSoftcodeInit("landing")` |
| `checks/public-softcode.check.mjs` | New — validation check script |
| `package.json` | Added `check:public-softcode` npm script |
| `scripts/task002f-acceptance.sh` | New — acceptance pipeline script |
| `tasks/active/TASK-002F-PUBLIC-APPS-CONSUME-SOFTCODE-CONFIG.md` | This file |

## What is softcoded now
- Microcopy text via `data-copy` / `data-gg-copy` attributes
- Theme tokens (CSS custom properties)
- Surfaces, navigation, SEO metadata in runtime config
- Icons registry included in public config

## What is intentionally still fallback/hardcoded
- HTML fallback text preserved in all templates (no text removed)
- Blogger XML template structure untouched
- Legacy JS bridge not split
- No Blogger API/auth integration
- No Admin/Console UI auto-apply (wired only to Blog/Store/Landing)
- Store product data hardcoded (not from microcopy)
- No dynamic page title/description injection (SEO via templates)

## Non-goals (not implemented)
- Blogger OAuth
- Tailwind, shadcn, Tiptap, React, or any heavy dependency
- Splitting legacy JS bridge
- Editing `dist/` or `.cloudflare-build/` manually
- Removing fallback HTML text
- Hardcoding Blogger IDs, API keys, tokens, or secrets
- Refactoring all public HTML/CSS/JS

## Acceptance commands
```bash
# Full pipeline
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-acceptance.sh

# Individual checks
npm run check:public-softcode
bash scripts/task002f-acceptance.sh
```

## Next recommended task
- Migrate more hardcoded microcopy strings to the softcode contract
- Add missing microcopy keys from Blog/Store/Landing HTML to registry
- Implement per-surface config injection (only load relevant microcopy subset)