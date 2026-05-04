      window.GG = window.GG || {};
      (function (GG) {
        var COPY = {
          en: {
            navigation: {
              primary: 'Primary navigation'
            },
            detail: {
              toolbar: 'Detail actions'
            },
            outline: {
              title: 'Contents',
              currentFallback: 'Start here',
              empty: 'This article has no clean outline yet.',
              peek: 'Show contents',
              expand: 'Expand contents outline',
              collapse: 'Collapse contents outline'
            },
            command: {
              inputLabel: 'Search articles and topics',
              placeholder: 'Search articles and topics',
              title: 'Discover',
              dismiss: 'Dismiss discovery sheet',
              tabs: {
                label: 'Discovery modes',
                results: 'Results',
                topics: 'Topics'
              },
              results: {
                search: 'Search',
                openSearchResults: 'Open search results for “{query}”',
                noDirectMatch: 'No direct match found',
                allPosts: 'all posts',
                article: 'Article',
                postType: 'Article',
                activeTopic: 'Topic',
                backToTopics: 'Back to topics',
                clearTopic: 'Clear topic',
                openArchive: 'Open archive',
                empty: 'No matching articles yet.'
              },
              topics: {
                empty: 'No matching topics yet.',
                showResults: 'Show results',
                openArchive: 'Archive',
                countLabel: '{count} articles'
              }
            },
            dock: {
              home: 'Home',
              contact: 'Contact',
              search: 'Search',
              blog: 'Blog',
              more: 'More'
            },
            listing: {
              details: 'Details'
            },
            pagination: {
              moreEntries: 'More entries',
              moreResults: 'More results'
            },
            searchEmpty: {
              title: 'No results',
              echo: 'No articles found for “{query}”.',
              trySearch: 'Try another search',
              browseTopics: 'Browse topics',
              goBlog: 'Go to Blog',
              fallbackTitle: 'Recent articles',
              loadingFallback: 'Loading a few recent articles…',
              fallbackUnavailable: 'Recent articles are unavailable right now.'
            },
            error404: {
              eyebrow: '404',
              title: 'Page not found',
              summary: 'The page you’re looking for isn’t available.',
              goHome: 'Go Home',
              searchSite: 'Search site',
              fallbackTitle: 'Recent articles',
              loadingFallback: 'Loading a few recent articles…',
              fallbackUnavailable: 'Recent articles are unavailable right now.'
            },
            comments: {
              launch: 'Comments',
              title: 'Comments',
              dismiss: 'Dismiss comments panel',
              actionZero: 'Post a comment',
              actionOne: 'Comment',
              actionMany: 'Comments',
              titleZero: 'Post a comment',
              titleOne: '{count} Comment',
              titleMany: '{count} Comments'
            },
            post: {
              breadcrumb: 'Breadcrumb',
              blog: 'Blog',
              by: 'By',
              in: 'In',
              published: 'Published',
              updated: 'Updated'
            },
            preview: {
              titleFallback: 'Article preview',
              dismiss: 'Dismiss article preview',
              contents: 'Contents',
              preparing: 'Preparing preview…',
              openArticle: 'Open full article',
              loadingSummary: 'Loading preview details…',
              loadingMeta: 'Loading article details…',
              loadingHeadings: 'Loading headings and preview cues…',
              noSummary: 'No summary is available yet.',
              sectionMap: 'Section map',
              noHeadings: 'No clean heading structure found yet. This article needs real H2/H3 discipline if you want a strong automatic TOC.',
              fetchFailed: 'Preview fetch failed. The CTA below still works, but the preview needs a safer same-origin parse pass.',
              readLabel: 'Read',
              readMinutes: '{count} min'
            },
            more: {
              title: 'More',
              dismiss: 'Dismiss more panel',
              blog: 'Blog',
              search: 'Search',
              sitemap: 'Sitemap',
              rss: 'RSS',
              channelsLabel: 'Share site',
              shareX: 'Share on X',
              shareFacebook: 'Share on Facebook',
              shareWhatsApp: 'Share on WhatsApp',
              rights: 'Copyright © 2026 PakRPP. All rights reserved.'
            },
            language: {
              label: 'Language',
              en: 'EN',
              id: 'ID'
            },
            appearance: {
              label: 'Appearance',
              system: 'System',
              light: 'Light',
              dark: 'Dark'
            },
          },
          id: {
            navigation: {
              primary: 'Navigasi utama'
            },
            detail: {
              toolbar: 'Aksi detail'
            },
            outline: {
              title: 'Daftar isi',
              currentFallback: 'Mulai di sini',
              empty: 'Artikel ini belum punya struktur isi yang rapi.',
              peek: 'Tampilkan daftar isi',
              expand: 'Buka daftar isi',
              collapse: 'Tutup daftar isi'
            },
            command: {
              inputLabel: 'Cari artikel dan topik',
              placeholder: 'Cari artikel dan topik',
              title: 'Jelajah',
              dismiss: 'Tutup lembar jelajah',
              tabs: {
                label: 'Mode jelajah',
                results: 'Hasil',
                topics: 'Topik'
              },
              results: {
                search: 'Cari',
                openSearchResults: 'Buka hasil pencarian untuk “{query}”',
                noDirectMatch: 'Tidak ada hasil langsung',
                allPosts: 'semua artikel',
                article: 'Artikel',
                postType: 'Artikel',
                activeTopic: 'Topik',
                backToTopics: 'Kembali ke topik',
                clearTopic: 'Hapus topik',
                openArchive: 'Buka arsip',
                empty: 'Belum ada artikel yang cocok.'
              },
              topics: {
                empty: 'Belum ada topik yang cocok.',
                showResults: 'Lihat hasil',
                openArchive: 'Arsip',
                countLabel: '{count} artikel'
              }
            },
            dock: {
              home: 'Beranda',
              contact: 'Kontak',
              search: 'Cari',
              blog: 'Blog',
              more: 'Lainnya'
            },
            listing: {
              details: 'Detail'
            },
            pagination: {
              moreEntries: 'Artikel berikutnya',
              moreResults: 'Hasil berikutnya'
            },
            searchEmpty: {
              title: 'Tidak ada hasil',
              echo: 'Tidak ada artikel untuk “{query}”.',
              trySearch: 'Coba pencarian lain',
              browseTopics: 'Jelajahi topik',
              goBlog: 'Ke Blog',
              fallbackTitle: 'Artikel terbaru',
              loadingFallback: 'Memuat beberapa artikel terbaru…',
              fallbackUnavailable: 'Artikel terbaru belum tersedia saat ini.'
            },
            error404: {
              eyebrow: '404',
              title: 'Halaman tidak ditemukan',
              summary: 'Halaman yang Anda cari tidak tersedia.',
              goHome: 'Ke Beranda',
              searchSite: 'Cari situs',
              fallbackTitle: 'Artikel terbaru',
              loadingFallback: 'Memuat beberapa artikel terbaru…',
              fallbackUnavailable: 'Artikel terbaru belum tersedia saat ini.'
            },
            comments: {
              launch: 'Komentar',
              title: 'Komentar',
              dismiss: 'Tutup panel komentar',
              actionZero: 'Tulis komentar',
              actionOne: 'Komentar',
              actionMany: 'Komentar',
              titleZero: 'Tulis komentar',
              titleOne: '{count} Komentar',
              titleMany: '{count} Komentar'
            },
            post: {
              breadcrumb: 'Jejak navigasi',
              blog: 'Blog',
              by: 'Oleh',
              in: 'Di',
              published: 'Terbit',
              updated: 'Diperbarui'
            },
            preview: {
              titleFallback: 'Pratinjau artikel',
              dismiss: 'Tutup pratinjau artikel',
              contents: 'Daftar isi',
              preparing: 'Menyiapkan pratinjau…',
              openArticle: 'Buka artikel penuh',
              loadingSummary: 'Memuat detail pratinjau…',
              loadingMeta: 'Memuat detail artikel…',
              loadingHeadings: 'Memuat heading dan sinyal pratinjau…',
              noSummary: 'Ringkasan belum tersedia.',
              sectionMap: 'Peta bagian',
              noHeadings: 'Struktur heading bersih belum ditemukan. Artikel ini perlu disiplin H2/H3 jika ingin TOC otomatis yang kuat.',
              fetchFailed: 'Pengambilan pratinjau gagal. CTA di bawah tetap berfungsi, tetapi pratinjau perlu parse same-origin yang lebih aman.',
              readLabel: 'Baca',
              readMinutes: '{count} mnt'
            },
            more: {
              title: 'Lainnya',
              dismiss: 'Tutup panel lainnya',
              blog: 'Blog',
              search: 'Cari',
              sitemap: 'Peta situs',
              rss: 'RSS',
              channelsLabel: 'Bagikan situs',
              shareX: 'Bagikan ke X',
              shareFacebook: 'Bagikan ke Facebook',
              shareWhatsApp: 'Bagikan ke WhatsApp',
              rights: 'Hak Cipta © 2026 PakRPP. Seluruh hak dilindungi undang-undang.'
            },
            language: {
              label: 'Bahasa',
              en: 'EN',
              id: 'ID'
            },
            appearance: {
              label: 'Tampilan',
              system: 'Sistem',
              light: 'Terang',
              dark: 'Gelap'
            },
          }
        };

