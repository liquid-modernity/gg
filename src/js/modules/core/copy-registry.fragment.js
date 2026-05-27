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
              inputLabel: 'Search articles, topics, routes, sections, or actions',
              placeholder: 'Search articles, topics, routes, sections, or actions',
              title: 'Discovery',
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
            discovery: {
              title: 'Discovery',
              store: {
                title: 'Store Discovery',
                placeholder: 'Search products, categories, or store routes'
              },
              global: {
                placeholder: 'Search articles, topics, routes, sections, or actions'
              },
              filter: {
                all: 'All',
                articles: 'Articles',
                topics: 'Topics',
                routes: 'Routes',
                sections: 'Sections',
                actions: 'Actions',
                products: 'Products',
                categories: 'Categories'
              },
              type: {
                article: 'Article',
                topic: 'Topic',
                route: 'Route',
                section: 'Section',
                action: 'Action',
                product: 'Product',
                category: 'Category'
              },
              empty: {
                title: 'No results',
                body: 'Try another keyword.'
              }
            },
            dock: {
              home: 'Home',
              contact: 'Contact',
              search: 'Search',
              blog: 'Blog',
              more: 'More'
            },
            nav: {
              home: 'Home',
              blog: 'Blog',
              store: 'Store',
              contact: 'Contact',
              search: 'Search',
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
              action: {
                add: 'Add comment',
                addReply: 'Add a reply',
                addReplyToOriginal: 'Add a reply to original comment',
                cancelReply: 'Cancel reply',
                copyLink: 'Copy link',
                delete: 'Delete comment',
                more: 'More comment actions',
                reply: 'Reply',
                replyToOriginal: 'Reply to original comment'
              },
              actionZero: 'Post a comment',
              actionOne: 'Comment',
              actionMany: 'Comments',
              empty: {
                body: 'Be the first to comment.',
                title: 'No comments yet.'
              },
              loadMore: 'Load more comments',
              loadMoreReplies: 'Load more replies',
              originalComment: 'Original comment',
              replies: {
                count: {
                  one: '1 reply',
                  many: '{count} replies'
                },
                dismiss: 'Dismiss replies',
                drag: 'Drag replies sheet',
                title: 'Replies',
                view: {
                  one: 'View 1 reply',
                  many: 'View {count} replies'
                }
              },
              replyingTo: 'Replying to',
              status: {
                copied: 'Comment link copied',
                copying: 'Copying comment link...',
                failed: 'Comment action failed'
              },
              titleZero: 'Post a comment',
              titleOne: '{count} Comment',
              titleMany: '{count} Comments',
              toolbar: {
                add: 'Add comment',
                count: {
                  one: '1 comment',
                  many: '{count} comments'
                },
                disabled: 'Comments disabled'
              }
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
              section: {
                navigation: 'Navigation',
                discover: 'Discover',
                info: 'Info',
                language: 'Language',
                appearance: 'Appearance'
              },
              home: 'Home',
              blog: 'Blog',
              store: 'Store',
              contact: 'Contact',
              search: 'Search',
              sitemap: 'Sitemap',
              rss: 'RSS',
              about: 'About PakRPP',
              privacy: 'Privacy Policy',
              terms: 'Terms of Use',
              disclaimer: 'Disclaimer',
              shareSite: 'Share site',
              commerceNote: 'Some outbound links may be affiliate links. Prices and availability may change.',
              channelsLabel: 'Share site',
              shareX: 'Share on X',
              shareFacebook: 'Share on Facebook',
              shareWhatsApp: 'Share on WhatsApp',
              rights: 'Copyright © 2026 PakRPP. All rights reserved.'
            },
            language: {
              label: 'Language',
              en: 'English',
              id: 'Indonesia',
              english: 'English',
              indonesia: 'Indonesia'
            },
            appearance: {
              label: 'Appearance',
              system: 'System',
              light: 'Light',
              dark: 'Dark'
            },
            footer: {
              copyright: 'Copyright © 2026 PakRPP. All rights reserved.'
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
              inputLabel: 'Cari artikel, topik, rute, bagian, atau aksi',
              placeholder: 'Cari artikel, topik, rute, bagian, atau aksi',
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
            discovery: {
              title: 'Jelajah',
              store: {
                title: 'Jelajah Store',
                placeholder: 'Cari produk, kategori, atau rute Store'
              },
              global: {
                placeholder: 'Cari artikel, topik, rute, bagian, atau aksi'
              },
              filter: {
                all: 'Semua',
                articles: 'Artikel',
                topics: 'Topik',
                routes: 'Rute',
                sections: 'Bagian',
                actions: 'Aksi',
                products: 'Produk',
                categories: 'Kategori'
              },
              type: {
                article: 'Artikel',
                topic: 'Topik',
                route: 'Rute',
                section: 'Bagian',
                action: 'Aksi',
                product: 'Produk',
                category: 'Kategori'
              },
              empty: {
                title: 'Tidak ada hasil',
                body: 'Coba kata kunci lain.'
              }
            },
            dock: {
              home: 'Beranda',
              contact: 'Kontak',
              search: 'Cari',
              blog: 'Blog',
              more: 'Lainnya'
            },
            nav: {
              home: 'Beranda',
              blog: 'Blog',
              store: 'Store',
              contact: 'Kontak',
              search: 'Cari',
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
              action: {
                add: 'Tambah komentar',
                addReply: 'Tambah balasan',
                addReplyToOriginal: 'Tambah balasan ke komentar awal',
                cancelReply: 'Batalkan balasan',
                copyLink: 'Salin tautan',
                delete: 'Hapus komentar',
                more: 'Aksi komentar lainnya',
                reply: 'Balas',
                replyToOriginal: 'Balas komentar awal'
              },
              actionZero: 'Tulis komentar',
              actionOne: 'Komentar',
              actionMany: 'Komentar',
              empty: {
                body: 'Jadilah yang pertama berkomentar.',
                title: 'Belum ada komentar.'
              },
              loadMore: 'Muat komentar lainnya',
              loadMoreReplies: 'Muat balasan lainnya',
              originalComment: 'Komentar awal',
              replies: {
                count: {
                  one: '1 balasan',
                  many: '{count} balasan'
                },
                dismiss: 'Tutup balasan',
                drag: 'Geser lembar balasan',
                title: 'Balasan',
                view: {
                  one: 'Lihat 1 balasan',
                  many: 'Lihat {count} balasan'
                }
              },
              replyingTo: 'Membalas',
              status: {
                copied: 'Tautan komentar disalin',
                copying: 'Menyalin tautan komentar...',
                failed: 'Aksi komentar gagal'
              },
              titleZero: 'Tulis komentar',
              titleOne: '{count} Komentar',
              titleMany: '{count} Komentar',
              toolbar: {
                add: 'Tambah komentar',
                count: {
                  one: '1 komentar',
                  many: '{count} komentar'
                },
                disabled: 'Komentar dinonaktifkan'
              }
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
              section: {
                navigation: 'Navigasi',
                discover: 'Jelajah',
                info: 'Info',
                language: 'Bahasa',
                appearance: 'Tampilan'
              },
              home: 'Beranda',
              blog: 'Blog',
              store: 'Store',
              contact: 'Kontak',
              search: 'Cari',
              sitemap: 'Peta situs',
              rss: 'RSS',
              about: 'Tentang PakRPP',
              privacy: 'Kebijakan Privasi',
              terms: 'Syarat Penggunaan',
              disclaimer: 'Disclaimer',
              shareSite: 'Bagikan situs',
              commerceNote: 'Beberapa tautan keluar dapat bersifat afiliasi. Harga dan ketersediaan dapat berubah.',
              channelsLabel: 'Bagikan situs',
              shareX: 'Bagikan ke X',
              shareFacebook: 'Bagikan ke Facebook',
              shareWhatsApp: 'Bagikan ke WhatsApp',
              rights: 'Hak Cipta © 2026 PakRPP. Semua hak dilindungi.'
            },
            language: {
              label: 'Bahasa',
              en: 'English',
              id: 'Indonesia',
              english: 'English',
              indonesia: 'Indonesia'
            },
            appearance: {
              label: 'Tampilan',
              system: 'Sistem',
              light: 'Terang',
              dark: 'Gelap'
            },
            footer: {
              copyright: 'Hak Cipta © 2026 PakRPP. Semua hak dilindungi.'
            },
          }
        };
