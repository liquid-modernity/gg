# GG vNext TASK-002D — Console Config API MVP

Sniper pack untuk Cline + DeepSeek V4 Pro.

Tujuan: membuat Console memiliki API read/write config softcode yang aman, whitelist-based, validated-before-save, dan tetap hijau di semua npm checks.

## Cara pakai

```bash
unzip gg-task-002d-console-config-api.zip
cp -R gg-task-002d-console-config-api/* /path/to/gg-vnext/
cd /path/to/gg-vnext
chmod +x scripts/task002d-acceptance.sh
```

Lalu paste isi `CLINE-PASTE-ME.txt` ke Cline.

## Target akhir

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002d-acceptance.sh
```

## Jangan lakukan

- Jangan install Tailwind/shadcn/Tiptap/React.
- Jangan buat full Console UI.
- Jangan implement Blogger OAuth/publish.
- Jangan split legacy JS bridge.
- Jangan edit `dist/`, `.cloudflare-build/`, `*.bundle.*`, `*.min.*`.
