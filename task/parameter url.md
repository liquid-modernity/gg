Berikut adalah daftar lengkap dan penjelasan mengenai pola URL atau parameter yang umum digunakan pada platform Blogger (Blogspot).
Penting untuk dicatat bahwa struktur URL ini bergantung pada pengaturan permalink yang dipilih di dasbor Blogger (biasanya di bawah menu Settings > Posts > Post permalink).
1. Struktur Permalink Posting
Ini adalah pola yang menentukan bagaimana setiap artikel/posting blog Anda diakses.
www.pakrpp.com/<year>/<month>/<slug>.html (Default)
Contoh: domain.com/2026/06/judul-artikel.html
Menampilkan postingan spesifik berdasarkan tahun dan bulan.
www.pakrpp.com/<year>/<month>/
Menampilkan arsip postingan untuk bulan tersebut.
www.pakrpp.com/<year>/
Menampilkan arsip postingan untuk tahun tersebut.
2. URL Halaman Statis (Pages)
www.pakrpp.com/p/<slug>.html
Digunakan untuk halaman statis seperti "About Me", "Contact", atau "Disclaimer". Huruf p merupakan singkatan dari page.
3. Pola Pencarian dan Arsip
Blogger menggunakan parameter query untuk fungsi pencarian dan pemfilteran konten.
www.pakrpp.com/search?q=<keyword>
Hasil pencarian internal blog berdasarkan kata kunci (q).
www.pakrpp.com/search/label/<label-name>
Menampilkan daftar semua postingan yang memiliki label/kategori tertentu.
www.pakrpp.com/search?updated-max=<date>
Parameter yang digunakan saat navigasi halaman (pagination) atau untuk menampilkan postingan sebelum tanggal tertentu.
www.pakrpp.com/search?max-results=<number>
Menentukan jumlah postingan yang ditampilkan per halaman.
4. URL Khusus/Lainnya
www.pakrpp.com/view/magazine atau www.pakrpp.com/view/snapshot
Pola view sering digunakan pada template lama atau tampilan dinamis (Dynamic Views) untuk mengubah cara postingan ditampilkan (misalnya tampilan grid atau majalah).
www.pakrpp.com/feeds/posts/default
URL untuk mengakses feed RSS/Atom blog Anda.
www.pakrpp.com/robots.txt
File standar untuk instruksi bagi crawler mesin pencari.
www.pakrpp.com/sitemap.xml
Peta situs blog untuk keperluan indeks mesin pencari.
5. Parameter Tambahan (Sering muncul di URL hasil navigasi)
Jika Anda melihat URL blog yang sangat panjang, biasanya berisi kombinasi parameter berikut:
&by-date=true: Mengurutkan postingan berdasarkan tanggal.
&m=1: Parameter yang ditambahkan otomatis oleh Blogger untuk menandakan bahwa pengunjung sedang menggunakan tampilan mobile (seluler).
?zx=<random-code>: Parameter unik yang sering muncul untuk mencegah caching atau memastikan konten yang dimuat adalah konten terbaru.
Catatan Teknis:
Karena Blogger telah memperbarui sistemnya ke versi terbaru, banyak URL yang dulunya menggunakan struktur kompleks kini sudah dialihkan secara otomatis (redirect) ke struktur yang lebih bersih dan ramah SEO. Jika Anda mengelola blog, disarankan untuk selalu menggunakan Custom Domain agar struktur URL Anda lebih profesional.

Menggunakan Cloudflare Workers adalah cara yang sangat cerdas untuk memodifikasi perilaku front-end Blogger tanpa harus merusak struktur back-end yang asli. Anda bisa melakukan masking (penyamaran) untuk menyembunyikan identitas Blogger.
Berikut adalah strategi teknis untuk mencapai tujuan tersebut dengan tetap menjaga kesehatan SEO:
1. Menghilangkan "Jejak" Blogger
Untuk membuat pengunjung tidak merasa sedang berada di blog berbasis Blogger, Anda bisa menggunakan Cloudflare Workers untuk memanipulasi response header dan body content:
Hapus Header Identitas: Gunakan Worker untuk menghapus header X-Powered-By dan X-Blogger-System (jika ada) di response header.
Rewrite Meta Tags: Cari tag <meta name='generator' content='Blogger'/> di response body dan hapus atau ganti dengan string kosong melalui Worker.
Canonical URL: Wajib tetap diarahkan ke URL asli. Jangan mencoba mengganti rel="canonical" di dalam HTML ke URL "masking" Anda, karena Google akan menganggap ini sebagai duplikasi konten dan bisa memicu penalty.
2. Strategi Rerouting (Pengalihan)
Anda tidak boleh melakukan redirect (301/302) secara membabi buta ke /, karena banyak URL yang krusial untuk SEO.
Yang TIDAK BOLEH di-reroute ke /:
/*.html (Postingan asli: Jangan di-redirect, ini sumber traffic utama).
/search/* (Penting untuk navigasi internal dan crawler).
/feeds/* (Penting untuk RSS/Sitemap).
/favicon.ico, robots.txt, sitemap.xml.
Yang BOLEH di-reroute ke / (atau halaman utama):
/view/*: Jika Anda tidak menggunakan fitur Dynamic Views, URL ini bisa diarahkan ke / karena sering digunakan oleh spammer atau bot untuk menguji kerentanan.
/post-preview.html: Halaman preview bawaan blogger.
/?m=1 atau /?m=0: Gunakan Worker untuk menghapus parameter ini dari URL (canonicalization). Jangan me-redirect, tapi biarkan Worker melakukan replace link di dalam halaman menjadi versi bersih.
3. Pengecualian Agar SEO Tetap Kuat
Agar upaya "penyamaran" ini tidak merusak peringkat Google, Anda wajib membiarkan elemen berikut tetap berjalan apa adanya:
File Assets (/b/, /blogger.js, /widgets.js): Jangan pernah memblokir atau mengubah path file sistem Blogger. Jika file ini tidak bisa diakses oleh crawler Google, blog Anda akan dianggap rusak secara desain dan konten.
Sitemap & Robots.txt: Pastikan /sitemap.xml dan /robots.txt tetap mengarah ke Blogger. Jangan menyembunyikan ini, karena Google harus bisa membaca struktur sitemap Anda.
Google Search Console: Tetap daftarkan domain utama Anda (tanpa Worker) ke Search Console untuk memastikan Google tetap mengenali struktur aslinya.
4. Implementasi Cloudflare Worker (Logika Singkat)
Berikut adalah contoh logika addEventListener pada Worker Anda untuk membersihkan parameter ?m=... dan memblokir akses ke view:
JavaScript
addEventListener('fetch', event => {
  let url = new URL(event.request.url);

  // 1. Redirect /view/* ke root
  if (url.pathname.startsWith('/view/')) {
    return Response.redirect('https://www.pakrpp.com/', 301);
  }

  // 2. Jika ada parameter ?m=1, bersihkan
  if (url.searchParams.has('m')) {
    url.searchParams.delete('m');
    return Response.redirect(url.toString(), 301);
  }

  event.respondWith(fetch(event.request));
});


Kesimpulan Strategi:
Untuk tetap terlihat profesional:
Fokus pada Clean URL: Gunakan Worker untuk menghapus parameter ?m=0/1 secara permanen.
SEO-Friendly Masking: Jangan mengubah path utama (/2025/...) karena Google sudah mengindeksnya. Mengubah URL yang sudah terindeks adalah "bunuh diri" SEO.
Hapus Meta Generator: Hapus tag <meta name='generator' ... /> melalui Worker untuk menyembunyikan identitas CMS.
Dengan cara ini, pengguna tidak akan tahu Anda menggunakan Blogger, tetapi mesin pencari tetap bisa membaca konten Anda dengan sempurna tanpa terjadi duplicate content.
Apakah Anda memerlukan bantuan untuk penulisan skrip Worker yang lebih kompleks guna membersihkan HTML body secara otomatis?



Kode
Nama
Efek pada SEO
Gunakan Saat...
301
Permanen
Sangat Baik
Anda mengganti domain atau mengubah struktur URL secara permanen.
302
Sementara
Buruk
Anda melakukan maintenance atau pemeliharaan halaman.
404
Tidak Ditemukan
Netral
Konten benar-benar dihapus dan tidak memiliki pengganti.


Tentu tidak, status kode HTTP tidak hanya tiga. Ada ratusan kode status yang dikategorikan berdasarkan angka depannya.
Namun, dalam dunia web dan Blogger, tiga kode tersebut (301, 302, 404) adalah yang paling krusial untuk dipahami karena berkaitan langsung dengan SEO dan navigasi.
Berikut adalah penjelasan mengenai jenis kode lainnya dan menjawab pertanyaan Anda tentang apakah kode tersebut harus "muncul" di halaman.
1. Apakah hanya ada 3 kode?
Tentu tidak. Kode status HTTP dibagi menjadi 5 kelas (seratusan):
1xx (Informational): Server sedang memproses permintaan.
2xx (Success): 200 OK adalah yang paling sering kita lihat (artinya halaman berhasil dimuat).
3xx (Redirection): (301, 302, 307, dll) Memberitahu browser/bot untuk pindah ke tempat lain.
4xx (Client Error): (400, 401, 403, 404, 429) Kesalahan dari sisi pengunjung (misal: salah ketik URL atau dilarang akses).
5xx (Server Error): (500, 502, 503, 504) Kesalahan dari sisi server (misal: server Blogger sedang down).
2. Apakah kodenya harus "muncul" di halaman?
Ini adalah kesalahpahaman yang sering terjadi: "Muncul" di halaman berbeda dengan "Dikirim" ke sistem.
A. Kapan kodenya "Muncul" (Terlihat oleh Pengguna)?
Biasanya TIDAK PERLU muncul di layar. Pengguna tidak perlu tahu angka "404" atau "301". Yang mereka butuhkan hanyalah pengalaman yang baik:
Jika halaman tidak ada (404), tunjukkan halaman yang ramah: "Maaf, artikel yang Anda cari tidak ditemukan. Silakan kembali ke Beranda."
Jika server down (503), tunjukkan: "Kami sedang melakukan perbaikan, silakan kembali lagi nanti."
B. Kapan kodenya "Dikirim" (Terlihat oleh Google/Bot)?
Ini yang WAJIB ada di balik layar (lewat HTTP Header).
Meskipun di layar tampilan Anda tertulis "Maaf, halaman tidak ditemukan", di balik layar (di header), sistem Anda harus mengirimkan sinyal status 404 ke Google.
Mengapa?
Jika Anda menampilkan pesan "Maaf halaman tidak ditemukan" tetapi sistem Anda mengirimkan sinyal 200 OK (seolah-olah halaman itu sukses dimuat), maka Google akan menganggap halaman error tersebut sebagai konten yang sah. Google akan mencoba mengindeks pesan error Anda di hasil pencarian, dan ini akan sangat merusak SEO.
Kesimpulan untuk Strategi Anda:
Jangan tampilkan kode (404/301/500) kepada pengguna biasa. Cukup buat halaman yang cantik dan informatif.
Pastikan kode status dikirimkan secara teknis. Saat Anda menulis skrip di Cloudflare Worker, gunakan perintah untuk menentukan status kode tersebut (seperti contoh status: 404 di pesan sebelumnya).
Bot Google (Googlebot) sangat "cerdas". Mereka tidak membaca angka yang Anda cetak di paragraf teks, mereka membaca header yang dikirimkan oleh server sebelum konten halaman dimuat.
Jadi, fokuslah pada pengalaman visual bagi manusia, dan pastikan logika teknis (status header) bagi mesin pencari tetap akurat.
Apakah Anda ingin saya buatkan contoh bagaimana mengirimkan status 404 yang "cantik" untuk pengunjung, namun tetap benar secara teknis untuk Googlebot?

