# GG 95% Architecture Task Pack

Target paket ini adalah menaikkan source/product architecture menuju ±95% tanpa merusak Blog1, tanpa menambah override di atas override, dan tanpa menjadikan performance budget sebagai blocker.

## Prinsip Utama

1. **Blog1 tidak boleh rusak.**
   - Jangan rewrite Blog1 widget.
   - Jangan rewrite Blogger post loop.
   - Jangan ubah native comments source.
   - Jangan ubah `data:post.*`, `data:view.*`, atau canonical Blogger variables kecuali untuk atribut GG-owned `data-gg-*` yang sudah menjadi kontrak.

2. **Rewrite berarti menghapus sumber duplikasi dan menyatukan kontrak.**
   - Bukan menambah patch.
   - Bukan override CSS/JS tambahan.
   - Bukan menambah special-case baru.

3. **Sheet punya dua origin resmi.**
   - Bottom sheets: comments, discovery, more.
   - Top preview sheets: root preview dan store preview.

4. **Gesture harus konsisten.**
   - Bottom sheet: head/handle untuk drag down close.
   - Top preview: footer/handle untuk drag up close.
   - Handler/handle tap harus close.
   - Area luar sheet/backdrop harus close.
   - Body/content tidak boleh menjadi drag zone karena harus tetap scrollable.

5. **Budget adalah advisory.**
   - Budget boleh memberi catatan/warning.
   - Budget tidak boleh menjadi `CONTRACT_FAILURE`.
   - Guard ketat hanya untuk release candidate, bukan setiap revisi kecil.

## Urutan Eksekusi

Jangan mulai dari controller split. Urutan yang benar:

1. Clean Handoff & Source Hygiene
2. Global Sheet Contract v1
3. Sheet Gesture & Close Behavior
4. Unified Data Contract
5. Controller Split: Core + Adapters
6. CSS Split
7. Lazy Interaction & Advisory Budget

Formula kerja:

```text
contract dulu → behavior → data → split → optimize
```

## Output yang Diharapkan

Setelah semua task selesai:

- Blog1 tetap stabil.
- Semua sheet memakai kontrak global yang sama.
- Preview top sheet dan bottom sheet tetap punya grammar animasi berbeda.
- Data preview/listing/store tidak lagi bergantung pada fallback tebak-tebakan.
- JS lebih modular.
- CSS lebih terstruktur.
- Package lebih bersih.
- Budget menjadi catatan, bukan penghambat revisi.
