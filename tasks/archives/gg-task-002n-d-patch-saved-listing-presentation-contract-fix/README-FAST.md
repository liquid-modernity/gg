# TASK-002N-D-PATCH — Saved Listing Presentation Contract Fix

Patch task untuk memperbaiki UX saved listing setelah `TASK-002N-D`.

Masalah yang terlihat dari smoke test:

- Mode Saved berfungsi, tetapi saved rows muncul di bagian bawah list normal/latest.
- Native/latest posts masih terlihat ketika saved mode aktif.
- Teks mentah `Details` masih terlihat pada saved rows.
- Saved rows belum selaras secara visual dengan listing row utama.

Keputusan produk:

> Saved mode adalah exclusive listing mode. Saat Saved aktif, hanya artikel yang disimpan yang tampil. Post lain tidak perlu muncul.

## Cara pakai

```bash
unzip gg-task-002n-d-patch-saved-listing-presentation-contract-fix.zip
cp -R gg-task-002n-d-patch-saved-listing-presentation-contract-fix/* /path/to/gg/
cd /path/to/gg
chmod +x scripts/task002n-d-patch-acceptance.sh
```

Paste isi `CLINE-PASTE-ME.txt` ke Cline.

## Target akhir

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-patch-acceptance.sh
```

## Scope

In scope:

- Fix saved listing presentation contract.
- Saved mode must hide native/latest rows and pagination/load-more.
- Saved mode must render only saved rows, using existing listing row template/structure.
- Remove or hide raw visible `Details` text from saved rows.
- Empty saved state must render from template.
- Unsave while in saved mode should remove row or refresh saved listing immediately.
- Add contract doc/config/check where useful.

Out of scope:

- No popular/related extraction.
- No comments/replies rewrite.
- No Store/Landing restructure.
- No OAuth.
- No deletion of `legacy-app` or `legacy-donor`.
- No generated output edits under `dist/**` or `.cloudflare-build/**`.
