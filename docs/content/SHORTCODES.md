# SHORTCODES.md
Last updated: 2026-02-21

Dokumen ini adalah kontrak authoring shortcode untuk transform DOM `GG.modules.ShortcodesV2`.

## Supported Shortcodes
- YouTube block:
  - `[youtube]ID-atau-URL[/youtube]`
  - `[youtube id="ID-atau-URL"]`
- Accordion block:
  - Pembuka: `[accordion title="Judul"]`
  - Penutup: `[/accordion]`

## Authoring Contract (Wajib)
- Block shortcode harus berdiri sendiri dalam satu paragraf/baris (standalone).
- Marker pembuka dan penutup accordion juga harus standalone.
- Isi accordion adalah DOM yang berada di antara marker pembuka dan penutup.
- Isi accordion boleh mengandung HTML (link, list, heading, gambar, dsb).

## Failure Behavior (Aman)
- Jika format kontrak tidak valid, shortcode tidak diubah.
- Konten dibiarkan tetap sebagai teks agar tidak terjadi rewrite destruktif.

## Template Contract
- Transformer membaca template XML berikut:
  - `#gg-tpl-sc-yt-lite`
  - `#gg-tpl-sc-accordion`
- Markup shortcode harus dipelihara dari template XML, bukan dari string HTML di JavaScript.
