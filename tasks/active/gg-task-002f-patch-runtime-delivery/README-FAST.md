# GG vNext TASK-002F-PATCH — Public Softcode Runtime Delivery

Sniper patch for Cline/DeepSeek V4 Pro. This patch is intentionally narrow: make the public softcode loader and runtime config actually deliverable to Blog/Store/Landing public outputs.

## Use

```bash
unzip gg-task-002f-patch-runtime-delivery.zip
cp -R gg-task-002f-patch-runtime-delivery/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002f-patch-acceptance.sh
```

Paste `CLINE-PASTE-ME.txt` into Cline.

## Final acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002f-patch-acceptance.sh
```

Do not implement OAuth, Blogger publish, Tailwind, shadcn, Tiptap, or legacy JS split.
