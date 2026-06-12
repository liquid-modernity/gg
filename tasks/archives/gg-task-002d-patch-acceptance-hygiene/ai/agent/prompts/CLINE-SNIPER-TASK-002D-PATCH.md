# Cline Sniper Prompt — TASK-002D-PATCH Acceptance + Repo Hygiene Fix

You are working in the GG vNext repo.

## Objective

Patch TASK-002D so the Console Config API MVP can be accepted cleanly.

The previous implementation appears to have working endpoints, but `scripts/task002d-acceptance.sh` can fail falsely because it greps for compact JSON like `"ok":true` while the server returns pretty JSON like `"ok": true`.

Also fix repo hygiene issues that confuse AI agents and syntax checks.

## Hard boundaries

Do not implement:
- Blogger OAuth
- real publish/sync
- full Console UI
- full Studio editor
- Tailwind / shadcn / Tiptap / React
- legacy JS bridge split
- broad refactor
- generated output edits

Do not edit:
- `dist/**`
- `.cloudflare-build/**`
- `*.bundle.js`
- `*.bundle.css`
- `*.min.js`
- `*.min.css`
- `legacy-donor/**` unless absolutely necessary, which it should not be

## Required patch scope

### 1. Fix `scripts/task002d-acceptance.sh`

Make it robust against pretty-printed JSON.

Preferred approach: parse JSON with Node, not fragile grep.

Examples of acceptable robust checks:

```bash
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(data.ok!==true) process.exit(1)' "$TMP_FILE"
```

or:

```bash
grep -Eq '"ok"[[:space:]]*:[[:space:]]*true'
```

Node JSON parsing is preferred.

The script must validate at minimum:
- `GET /api/config-list` returns `ok: true` and includes expected config keys.
- `GET /api/config/surfaces` returns `ok: true` and a data object.
- `GET /api/config/theme-tokens` returns `ok: true` and a data object.
- `GET /api/config/blogger-targets` returns `ok: true` and a data object.
- invalid key is rejected.
- path traversal is rejected.

### 2. Restore or create `.gitignore`

Ensure `.gitignore` includes at least:

```gitignore
.DS_Store
__MACOSX/
._*
Thumbs.db
node_modules/
.env
.env.*
!.env.example
dist/
.cloudflare-build/
tmp/
*.log
```

### 3. Clean macOS junk files from repo

Delete if present:

```txt
__MACOSX/
.DS_Store
._*
Thumbs.db
```

### 4. Remove duplicate workflow folder if appropriate

If both exist:

```txt
.github/workflows/
github/workflows/
```

Keep `.github/workflows/` and remove `github/workflows/` unless there is a strong repo-specific reason not to.

### 5. Restore task note

Create or restore:

```txt
tasks/active/TASK-002D-CONSOLE-CONFIG-API-MVP.md
```

It should summarize:
- TASK-002D goal
- endpoints added
- config whitelist
- acceptance commands
- no UI/OAuth/legacy split in this task

### 6. Add/keep this patch acceptance script

Ensure this file exists and is executable:

```txt
scripts/task002d-patch-acceptance.sh
```

You may update it if needed, but keep it strict and small.

## Required final command

Run this full command and stop only when it passes:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002d-acceptance.sh && bash scripts/task002d-patch-acceptance.sh
```

## Final report format

Return only:

```md
## 🔫 GG vNext TASK-002D-PATCH — ACCEPTANCE + HYGIENE REPORT

Status: ✅ ALL GREEN / ⚠️ PARTIAL / ❌ BLOCKED

### Commands
| Command | Result |
|---|---|
| npm run doctor | ... |
| npm run build | ... |
| npm run check | ... |
| npm run check:softcode | ... |
| npm run console:check | ... |
| npm run studio:check | ... |
| npm run deploy:dry | ... |
| bash scripts/task002d-acceptance.sh | ... |
| bash scripts/task002d-patch-acceptance.sh | ... |

### Files Changed
1. ...

### Implemented
- ...

### Intentionally Not Implemented
- OAuth
- Full UI
- Legacy JS split

### Next Recommended Task
- ...
```
