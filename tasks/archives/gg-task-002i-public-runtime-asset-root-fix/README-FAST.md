# TASK-002I — Public Runtime Asset Root Fix

Purpose: fix production runtime delivery after deploy. Public config is deployed, but public JS/CSS/store runtime assets are not consistently available from the Cloudflare assets root.

Use this pack with Cline/DeepSeek V4 Pro in sniper mode.

## Install into repo

```bash
unzip gg-task-002i-public-runtime-asset-root-fix.zip
cp -R gg-task-002i-public-runtime-asset-root-fix/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002i-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002i-acceptance.sh
```

## Scope

Fix only runtime asset delivery:

- Ensure `dist/dev/public/**` and `dist/prod/public/**` are the public serve roots.
- Ensure `.cloudflare-build/public/**` receives all public runtime assets.
- Ensure Blog compatibility paths under `/__gg/assets/**` exist.
- Ensure Store runtime files under `/assets/store/**` exist.
- Ensure Worker treats `/runtime/`, `/assets/`, `/__gg/assets/`, `/icons/`, `/manifest.webmanifest`, `/sw.js`, `/offline.html` as host-agnostic static assets before surface routing.
- Strengthen checks so a false green cannot happen again.

## Non-goals

- Do not implement OAuth.
- Do not split legacy JS bridge.
- Do not restructure the whole store app.
- Do not install Tailwind/shadcn/Tiptap/React.
- Do not manually edit `dist/` or `.cloudflare-build/` as source fixes.
