# DISTRIBUTION.md — GG Audit Distribution Contract
Last updated: 2026-02-21

## Contract (Mandatory)
- Semua handoff/share artefak HARUS memakai `dist/gg-audit.zip`.
- File `dist/gg-audit.zip` HARUS dibuat via `npm run zip:audit` (wrapper `tools/zip-audit.sh`).
- Zip manual (Finder/Explorer/GUI/compress ad-hoc) DILARANG untuk handoff resmi.
- `dist/` tidak boleh di-commit ke git.

## Operator Steps
1) Pastikan working tree bersih.
2) Jalankan `npm run zip:audit`.
3) Share hanya file `dist/gg-audit.zip`.

## Guardrails
- `tools/zip-audit.sh` hard-fail jika working tree tidak bersih.
- Nama output dikunci: `dist/gg-audit.zip`.
- CI deploy workflow membangun dan meng-upload artifact `dist/gg-audit.zip` untuk distribusi standar.

## Perf Baseline Discipline
- Setiap perubahan yang berpotensi memengaruhi performa wajib meng-update `docs/perf/BASELINE.md` atau menuliskan alasan kenapa baseline tidak berubah.
- `docs/perf/BUDGETS.json` adalah budget aktif, `docs/perf/BUDGETS.lock.json` adalah ratchet terkunci.
- Ratchet tidak boleh dilonggarkan (nilai `max_*` naik) tanpa task eksplisit “perf regression acceptance”.

## Release Gate Modes
- Local (default): wajib lulus `npm run gate:prod` + `bash tools/gate-release.sh` (mode local, non-live).
- CI (authoritative proof): wajib menjalankan `bash tools/gate-release-live.sh` setelah deploy.
- Live checks (`verify-headers --mode=live` + `verify-palette-a11y --mode=live`) hanya mandatory proof di CI atau saat dipaksa dengan `GG_GATE_RELEASE_LIVE=1`.
