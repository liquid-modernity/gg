# Template Release Playbook
**Status:** Operational helper only  
**Who this is for:** Operator non-teknis / vibe coder  
**Purpose:** Menjawab satu hal: setelah `npm run gaga`, apakah masih perlu publish template Blogger manual?

---

## 1. Aturan paling penting

Kalau perubahan menyentuh `index.xml`, maka release **belum selesai** hanya dengan `npm run gaga`.

Kenapa?
Karena:
- `npm run gaga` mengirim code ke GitHub
- GitHub Actions + Cloudflare deploy hanya merilis Worker/assets
- template Blogger tetap publish manual

---

## 2. Kapan saya harus publish template Blogger manual?

Lakukan manual publish kalau:
- `index.xml` berubah
- atau perubahan menyentuh struktur/template SSR

Kalau yang berubah hanya CSS, JS, Worker, asset, atau hal non-template:
- biasanya **tidak perlu** manual publish Blogger

---

## 3. Langkah singkat setelah `npm run gaga`

### A. Kalau `index.xml` **tidak** berubah
1. Jalankan `npm run gaga`
2. Tunggu deploy selesai
3. Cek live
4. Selesai

### B. Kalau `index.xml` **berubah**
1. Jalankan `npm run gaga`
2. Tunggu deploy selesai
3. Jalankan:
   - `npm run gaga:template:pack`
4. Buka Blogger Admin
5. Masuk ke:
   - `Theme` → `Edit HTML`
6. Ambil isi file:
   - `dist/blogger-template.publish.xml`
7. Replace template lama dengan isi file itu
8. Save / publish
9. Jalankan:
   - `npm run gaga:verify-template`
10. Cek live
11. Selesai

---

## 4. Cara cepat tahu release sudah benar atau belum

### Release dianggap selesai kalau:
- deploy GitHub/Cloudflare sukses
- dan, kalau template berubah, template Blogger sudah dipublish manual
- dan live site terlihat benar
- dan `npm run gaga:verify-template` lolos bila template memang berubah

### Release belum selesai kalau:
- `index.xml` berubah tapi Blogger belum dipublish manual
- live site masih menampilkan struktur lama
- fitur/struktur baru hanya muncul di repo tapi belum muncul di Blogger

---

## 5. Aturan anti-bingung

- `npm run gaga` **bukan** publish template Blogger
- Cloudflare deploy **bukan** Blogger template publish
- kalau template berubah, Anda hampir pasti masih punya satu langkah manual
- kalau ragu: anggap release **belum selesai** sampai live site dicek

---

## 6. Versi paling singkat

### Kalau bukan template:
`npm run gaga` → cek live → selesai

### Kalau template:
`npm run gaga` → `npm run gaga:template:pack` → publish manual di Blogger → `npm run gaga:verify-template` → cek live → selesai