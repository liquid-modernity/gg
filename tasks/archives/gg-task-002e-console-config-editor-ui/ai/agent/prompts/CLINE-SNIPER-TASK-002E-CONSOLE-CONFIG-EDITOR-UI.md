# CLINE SNIPER TASK — GG vNext TASK-002E Console Config Editor Minimal UI

You are working in the GG vNext repo.

## Current status

The repo already has:
- Batch 1 green
- Batch 2A green
- TASK-002B green
- TASK-002C green
- TASK-002D green + patch green
- Console config API already available:
  - `GET /api/config-list`
  - `GET /api/config/:key`
  - `PUT /api/config/:key`
  - `GET /api/blogger-targets`
  - `PUT /api/blogger-targets`
- Whitelisted config keys include:
  - `blogger-targets`
  - `cache-policy`
  - `softcode-inventory`
  - `surfaces`
  - `theme-tokens`
  - `navigation`
  - `seo`

The user has two Blogger CMS targets:
- `mainBlog` = pakrpp / pakrpp.blogspot.com
- `storeBlog` = pakrpp store / pakrppstore.blogspot.com

Both are under the same Google account, so do NOT create separate OAuth credential architecture now.
Use one future credential set only:
- `GOOGLE_BLOGGER_CLIENT_ID`
- `GOOGLE_BLOGGER_CLIENT_SECRET`
- `GOOGLE_BLOGGER_REFRESH_TOKEN`

Do not implement OAuth in this task.

---

## Goal

Create a minimal Console Config Editor UI using existing Console API endpoints.

The UI should allow local admin to:
1. View config key list.
2. Load a whitelisted config JSON.
3. Edit JSON in a textarea.
4. Validate JSON before save.
5. Save via `PUT /api/config/:key` in local mode.
6. Display status/errors clearly.
7. Expose Blogger targets as config, but never ask for or display raw secret values.

This is NOT a full product UI. It is a minimal operational editor.

---

## Allowed files

You may edit/create only if needed:

```txt
apps/console/**
apps/_shared/**
public/** only if console already serves it intentionally
checks/** only if a tiny check is necessary
scripts/task002e-acceptance.sh
package.json only if adding a small npm script is necessary
```

You may read:

```txt
config/**
registry/**
apps/studio/**
tools/**
checks/**
```

---

## Forbidden

Do NOT:

```txt
install Tailwind, shadcn/ui, Tiptap, React, Vite, Next, Astro, Svelte, Vue
implement Blogger OAuth
ask user for refresh token in UI
store secret values in config JSON
create production remote adapter
split legacy JS bridge
edit dist/**
edit .cloudflare-build/**
edit *.bundle.js / *.bundle.css / *.min.js / *.min.css
perform broad refactor
rename existing endpoints
break TASK-002D API
```

---

## Implementation requirements

### 1. Minimal Console UI route

Ensure `apps/console/server.mjs` serves a minimal HTML page at `/`.

The page should include:
- title: `GG Console Config Editor`
- environment/mode display if available
- config key selector/list
- `Load` button
- textarea for JSON
- `Validate JSON` button
- `Save` button
- status area
- note: `Secrets are never stored here. Use .env.local locally and GitHub/Cloudflare Secrets in production.`

Use simple inline HTML or small static files. Keep it lightweight.

### 2. Minimal client JS

Implement vanilla JS only.

Client behavior:
- Fetch `/api/config-list` on page load.
- Render available keys.
- Load selected key with `/api/config/:key`.
- Pretty print JSON with 2 spaces.
- Validate JSON locally before save.
- Save via `PUT /api/config/:key` with JSON body.
- Show success/error message.
- Do not send invalid JSON.

### 3. Config API compatibility

Do not break:

```txt
GET /api/config-list
GET /api/config/:key
PUT /api/config/:key
GET /api/blogger-targets
PUT /api/blogger-targets
```

### 4. Blogger target handling

For `blogger-targets`, UI may remain JSON textarea-based.
Do not create token fields.
It is OK if config uses placeholders for `blogId`.

Make sure UI text clearly says:

```txt
Both mainBlog and storeBlog can use the same GOOGLE_BLOGGER_REFRESH_TOKEN when both Blogger blogs are under the same Google account.
```

### 5. Production mode behavior

If the server/API already rejects PUT in production mode, preserve it.
If UI can detect production mode, show read-only note. Do not implement remote write.

---

## Acceptance commands

Run all:

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002e-acceptance.sh
```

All must pass.

---

## Final report format

Return a concise report:

```md
## TASK-002E — COMPLETE
Status: ✅ ALL GREEN / ⚠️ PARTIAL

### Files Changed
- ...

### Implemented
- Minimal Console Config Editor UI
- Config list/load/save/validate
- Blogger target note with single shared Google credential set

### Not Implemented
- Blogger OAuth
- Tailwind/shadcn/Tiptap
- Full Console UI
- Studio editor
- Legacy JS split

### Commands
- npm run doctor ✅
- npm run build ✅
- npm run check ✅
- npm run check:softcode ✅
- npm run console:check ✅
- npm run studio:check ✅
- npm run deploy:dry ✅
- bash scripts/task002e-acceptance.sh ✅
```
