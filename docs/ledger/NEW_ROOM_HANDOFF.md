# NEW ROOM HANDOFF — GG / pakrpp.com
Last updated: 2026-02-21

## Distribution Contract (Mandatory)
- Handoff/share resmi hanya lewat `dist/gg-audit.zip`.
- Wajib generate dengan `npm run zip:audit` (git archive path, bukan zip manual).
- Dilarang share folder kerja mentah atau zip buatan manual.

## Handoff Steps
1) Pastikan branch `main` dan working tree bersih.
2) Jalankan `npm run zip:audit`.
3) Verifikasi file ada: `dist/gg-audit.zip`.
4) Share hanya file itu.

## Notes
- `dist/` adalah output sementara distribusi dan tidak di-commit.
- Referensi kontrak: `docs/release/DISTRIBUTION.md`.
