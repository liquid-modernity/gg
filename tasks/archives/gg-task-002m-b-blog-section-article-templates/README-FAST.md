# GG vNext TASK-002M-B — Blog Section/Article Template Migration

Goal: migrate **public Blog listing/empty-state `section`/`article` DOM generation** from JS into `apps/blog/index.xml` templates.

This is a sniper task. Do not broaden into buttons, OAuth, Store restructuring, Console UI, or legacy bridge split.

## Install

```bash
unzip gg-task-002m-b-blog-section-article-templates.zip
cp -R gg-task-002m-b-blog-section-article-templates/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002m-b-acceptance.sh
```

Then paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002m-b-acceptance.sh
```

## Scope

Allowed:
- `apps/blog/index.xml`
- `src/modules/legacy-app/legacy-app.js`
- `checks/public-dom.check.mjs`
- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`
- `scripts/task002m-b-acceptance.sh`
- `tasks/active/TASK-002M-B-BLOG-SECTION-ARTICLE-TEMPLATES.md`

Do not edit generated outputs:
- `dist/**`
- `.cloudflare-build/**`
- `*.bundle.js`
- `*.min.js`
- `*.min.css`

