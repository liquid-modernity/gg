# TASK-002F — Public Apps Consume Softcode Config

## Status

COMPLETE — all checks green.

## Implemented scope

Public apps (Blog, Store, Landing) now consume a runtime softcode config contract via a vanilla JS loader.

### Runtime public config artifact

Build tool (`tools/build.mjs`) emits a safe public runtime config into both dev and prod output:

```txt
dist/dev/runtime/public-config.json
dist/prod/runtime/public-config.json
```

Includes only safe public keys:

- `version`, `generatedAt`
- `surfaces`, `navigation`, `seo`, `themeTokens`, `microcopy`, `icons`

Excludes:

- API provider secrets
- Refresh tokens / client secrets
- Cloudflare tokens
- Session secrets
- Admin passwords / raw env values

### Public softcode loader

```txt
src/modules/public-softcode/public-softcode.js (186 lines)
```

Vanilla JS IIFE that:

- Fetches `/runtime/public-config.json` (or equivalent generated path)
- Fails silently — never blanks the page on load failure
- Applies microcopy to elements with `data-copy` and `data-gg-copy` selectors
- Applies navigation labels via `data-nav-label` / `data-gg-nav-label`
- Applies SEO metadata only when safe and surface is detectable
- Applies theme tokens by setting CSS custom properties on `document.documentElement`
- Exposes `window.GG.publicSoftcodeInit(surfaceId)` for entry wiring
- Exposes status via `window.GG.publicSoftcode = { ok, surface }`

### Entry wiring

All three public entries call `publicSoftcodeInit` with the correct surface identifier:

```txt
src/entries/blog.entry.js     → publicSoftcodeInit("blog")
src/entries/store.entry.js    → publicSoftcodeInit("store")
src/entries/landing.entry.js  → publicSoftcodeInit("landing")
```

### Fallback markers in public HTML

Fallback-safe markers were added to public HTML templates without rewriting templates or removing existing fallback text:

| Surface  | File                     | Selectors used        | Count |
|----------|--------------------------|-----------------------|-------|
| Blog     | `apps/blog/index.xml`    | `data-gg-copy`        | 99+   |
| Store    | `apps/store/store.html`  | `data-copy`           | 84    |
| Landing  | `apps/landing/landing.html` | `data-copy`        | 57    |

- Both `[data-copy]` and `[data-gg-copy]` are supported.
- Blogger XML was not broken — markers added to existing `<span>` elements preserving fallback text.

### Check / acceptance support

```txt
checks/public-softcode.check.mjs (175 lines)
npm run check:public-softcode
```

Validates:

- `src/modules/public-softcode` module file exists
- `public-config.json` is emitted by build (both dev/prod)
- `public-config.json` contains no secrets/token/password/key-like sensitive values
- Blog/Store/Landing entries import/wire public-softcode
- Blog supports `data-gg-copy` or `data-copy` markers
- Store/Landing support `data-copy` markers
- `dist/prod/runtime/public-config.json` exists after build
- `.cloudflare-build/public/runtime/public-config.json` exists if deploy output is present

### Acceptance script

```txt
scripts/task002f-acceptance.sh (86 lines)
```

Runs full pipeline: `doctor → build → check → check:softcode → check:public-softcode → console:check → studio:check → deploy:dry → verify + secret scan`

## Files changed

```
tools/build.mjs                                — emitPublicConfig function added
src/modules/public-softcode/public-softcode.js — new loader module (186 lines)
src/entries/blog.entry.js                      — wires publicSoftcodeInit("blog")
src/entries/store.entry.js                     — wires publicSoftcodeInit("store")
src/entries/landing.entry.js                   — wires publicSoftcodeInit("landing")
apps/blog/index.xml                            — data-gg-copy markers added
apps/store/store.html                          — data-copy markers present
apps/landing/landing.html                     — data-copy markers present
checks/public-softcode.check.mjs               — new check script
package.json                                   — "check:public-softcode" added
scripts/task002f-acceptance.sh                — acceptance script
tasks/active/TASK-002F-PUBLIC-APPS-CONSUME-SOFTCODE-CONFIG.md — this note
```

## What is softcoded now

- Microcopy text values applied to `[data-copy]` / `[data-gg-copy]` elements
- Navigation labels via public primary nav contract
- Theme tokens (color, radius, space) as CSS custom properties
- SEO title (when safe and surface-detected)

## What is intentionally still fallback/hardcoded

- Blogger XML template structure (not rewritten — just annotated with markers)
- Store product data pipeline
- Landing static JSON-LD
- Theme color scheme beyond CSS custom property injection
- Console/Studio entries (not wired — softcode applies only to public surfaces)
- Full Blogger feed/sync pipeline
- OAuth / Blogger publish
- Domain/canonical decisions and hreflang
- Legacy JS bridge (not split)

## Non-goals

- No Blogger OAuth
- No Tailwind, shadcn, Tiptap, React, or heavy dependency installed
- No legacy JS bridge split
- No `dist/` or `.cloudflare-build/` manual edits
- No hardcoded Blogger IDs, API keys, tokens, or secrets
- No full HTML/CSS rewrite

## Acceptance commands

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-acceptance.sh
```

## Next recommended task

Wire softcode-driven microcopy into Console Config Editor UI so operators can edit copy values through the Console interface and see them reflected in public apps live.