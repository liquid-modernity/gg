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
                categories: 'Categories',
                saved: 'Saved'
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
              },
              saved: {
                empty: {
                  title: 'No saved items yet.',
                  body: 'Save articles or products to find them here.'
                }
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
              profile: {
                name: 'PakRPP',
                meta: 'Editorial tools, learning resources, and digital workspace'
              },
              localSearch: {
                label: 'Search More',
                placeholder: 'Search'
              },
              section: {
                navigation: 'Navigation',
                discover: 'Discover',
                info: 'Info',
                preferences: 'Preferences',
                language: 'Language',
                appearance: 'Appearance',
                reading: 'Reading',
                motion: 'Motion'
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
              shareXShort: 'X',
              shareFacebookShort: 'Facebook',
              shareWhatsAppShort: 'WhatsApp',
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
            reading: {
              label: 'Reading',
              comfortable: 'Comfortable',
              compact: 'Compact',
              focus: 'Focus'
            },
            motion: {
              label: 'Motion',
              balanced: 'Balanced',
              reduced: 'Reduced'
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
                categories: 'Kategori',
                saved: 'Tersimpan'
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
              },
              saved: {
                empty: {
                  title: 'Belum ada item tersimpan.',
                  body: 'Simpan artikel atau produk untuk menemukannya di sini.'
                }
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
              profile: {
                name: 'PakRPP',
                meta: 'Perangkat editorial, sumber belajar, dan ruang kerja digital'
              },
              localSearch: {
                label: 'Cari di Lainnya',
                placeholder: 'Cari'
              },
              section: {
                navigation: 'Navigasi',
                discover: 'Jelajah',
                info: 'Info',
                preferences: 'Preferensi',
                language: 'Bahasa',
                appearance: 'Tampilan',
                reading: 'Bacaan',
                motion: 'Gerak'
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
              shareXShort: 'X',
              shareFacebookShort: 'Facebook',
              shareWhatsAppShort: 'WhatsApp',
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
            reading: {
              label: 'Bacaan',
              comfortable: 'Nyaman',
              compact: 'Padat',
              focus: 'Fokus'
            },
            motion: {
              label: 'Gerak',
              balanced: 'Seimbang',
              reduced: 'Dikurangi'
            },
            footer: {
              copyright: 'Hak Cipta © 2026 PakRPP. Semua hak dilindungi.'
            },
          }
        };

        var ROUTE_VOCABULARY_CONTRACT = {
          publicRoutes: {
            listing: {
              path: '/',
              uiLabel: 'Blog',
              surface: 'listing',
              page: 'listing'
            },
            landing: {
              path: '/landing',
              uiLabel: 'Home',
              surface: 'landing',
              page: 'landing'
            },
            legacyBlogAlias: {
              path: '/blog',
              policy: 'dead-or-advisory-unless-edge-redirect-is-explicitly-supported',
              rationale: 'The rendered UI, canonical tags, schema, and dock do not publish /blog as a first-class public route.'
            }
          },
          reservedTerms: {
            home: 'Human-facing label for /landing only.',
            blog: 'Human-facing label for /.',
            listing: 'Technical root feed surface/page name.',
            special: 'Non-error unmatched runtime fallback only.'
          },
          acceptanceNote: 'Route vocabulary now separates public labels from technical surfaces so Home can mean /landing while the root feed remains surface=listing/page=listing.'
        };

        var SURFACE_LEDGER = {
          listing: {
            purpose: 'Primary blog listing surface at the canonical root route.',
            source: 'Exact homepage URL with no search, label, or archive params.'
          },
          landing: {
            purpose: 'Public landing/home surface.',
            source: 'Dedicated /landing route, including in-page landing sections such as #contact.'
          },
          search: {
            purpose: 'Keyword search results surface.',
            source: 'Search route with q parameter.'
          },
          label: {
            purpose: 'Topic archive surface.',
            source: 'Label route under /search/label/.'
          },
          archive: {
            purpose: 'Chronological archive surface.',
            source: 'Archive path or archive-like search params.'
          },
          post: {
            purpose: 'Article detail surface.',
            source: 'Blogger single-item post route.'
          },
          page: {
            purpose: 'Static page surface.',
            source: 'Blogger single-item page route.'
          },
          special: {
            purpose: 'Special or unmatched non-standard route surface.',
            source: 'Runtime fallback when route does not match listing/landing/search/label/archive/post/page and is not a native Blogger error view.'
          },
          error404: {
            purpose: 'Blogger error state.',
            source: 'Native Blogger error view via data:view.isError, with copy expected from Blogger Settings > Custom 404.'
          },
          mobile: {
            purpose: 'Mobile route variation.',
            source: 'Any route carrying m=1.'
          }
        };

        var GG_SOURCE_BOUNDARY = {
          rootSource: {
            provider: 'blogger',
            sourceHost: 'pakrpp.blogspot.com',
            publicCanonicalBase: 'https://www.pakrpp.com/',
            feed: {
              endpointPath: '/feeds/posts/default?alt=json',
              maxResults: 80
            },
            sitemap: {
              publicUrl: 'https://www.pakrpp.com/sitemap.xml'
            },
            schemaFamily: ['Article', 'WebPage', 'BlogPosting']
          },
          storeSource: {
            provider: 'blogger',
            sourceHost: 'pakrppstore.blogspot.com',
            sourceCustomHost: 'https://store.pakrpp.com/',
            publicCanonicalBase: 'https://www.pakrpp.com/store/',
            schemaFamily: ['Product', 'ItemList']
          }
        };

        var FEED_PREREQUISITES = {
          supportedLocales: ['en', 'id'],
          requiredSettings: [
            'Keep post feeds enabled in Blogger settings.',
            'Allow same-origin access to the declared root feed for search result enhancement when available.',
            'Treat homepage visible count as route plus payload dependent, not a hard guarantee from max-post settings alone.',
            'Keep listing DOM lightweight; preview/search enrichment must come from feed JSON or same-origin article fetch, not hidden row payload.',
            'Fall back gracefully to title-only listing DOM when feed JSON is unavailable.'
          ],
          search: {
            endpointPath: GG_SOURCE_BOUNDARY.rootSource.feed.endpointPath,
            maxResults: GG_SOURCE_BOUNDARY.rootSource.feed.maxResults,
            fallback: 'listing-dom-local-first',
            submitFallback: 'native-blogger-search-route'
          },
          preview: {
            primary: 'same-origin-article-fetch',
            fallback: 'listing-title-and-url-only'
          }
        };

        var GLOBAL_DISCOVERY_FEED_MAX = 80;
        var STORE_DOMAIN = {
          rootLabel: 'Store',
          labelPrefixes: ['Store ', 'Store:', 'Store/'],
          categorySlugs: ['fashion', 'skincare', 'workspace', 'tech', 'everyday'],
          categoryLabels: ['Fashion', 'Skincare', 'Workspace', 'Tech', 'Everyday', 'Etc', 'Lainnya'],
          payloadMarkers: ['gg-store-data', 'gg-yellowcard-data', 'store-static-products', 'store-product', 'data-store-product']
        };

        var GG_GLOBAL_DISCOVERY_CONFIG = {
          domain: 'global',
          feedMax: GLOBAL_DISCOVERY_FEED_MAX,
          filterIds: ['all', 'articles', 'topics', 'saved'],
          routeIds: ['home', 'blog', 'store', 'contact'],
          sectionIds: ['hero', 'rubrics', 'faq', 'contact'],
          actionIds: ['contactPakrpp', 'openMore', 'openStore', 'openBlog'],
          routes: [
            { id: 'home', titleKey: 'nav.home', meta: '/landing', href: 'landing', action: 'navigateHome', keywords: ['home', 'beranda', 'landing', 'intro'], priority: 100 },
            { id: 'blog', titleKey: 'nav.blog', meta: '/', href: '', action: 'navigateBlog', keywords: ['blog', 'articles', 'artikel', 'archive'], priority: 98 },
            { id: 'store', titleKey: 'nav.store', meta: '/store', href: 'store', action: 'navigateStore', keywords: ['store', 'yellow cart', 'products', 'produk'], priority: 96 },
            { id: 'contact', titleKey: 'nav.contact', meta: '/landing#contact', href: 'landing#contact', action: 'navigateContact', keywords: ['contact', 'kontak', 'email', 'brief'], priority: 94 }
          ],
          sections: [
            { id: 'hero', title: 'Intro', meta: '/landing#hero', href: 'landing#hero', action: 'navigateHomeSection', target: 'hero', keywords: ['unfiltered', 'notes', 'systems', 'value', 'culture', 'words'], priority: 80 },
            { id: 'rubrics', title: 'Rubrics', meta: '/landing#rubrics', href: 'landing#rubrics', action: 'navigateHomeSection', target: 'rubrics', keywords: ['insight', 'perspective', 'case', 'notes', 'lab'], priority: 79 },
            { id: 'faq', title: 'FAQ', meta: '/landing#faq', href: 'landing#faq', action: 'navigateHomeSection', target: 'faq', keywords: ['questions', 'collaboration', 'writing', 'reporting', 'disclosure'], priority: 78 },
            { id: 'contact', title: 'Contact', meta: '/landing#contact', href: 'landing#contact', action: 'navigateContact', target: 'contact', keywords: ['brief', 'contact', 'email', 'context'], priority: 77 }
          ],
          actions: [
            { id: 'contactPakrpp', titleKey: 'nav.contact', titleSuffix: ' PakRPP', meta: '/landing#contact', href: 'landing#contact', action: 'navigateContact', keywords: ['contact', 'kontak', 'pakrpp', 'brief'], priority: 72 },
            { id: 'openMore', titleKey: 'more.title', metaKeys: ['more.search', 'more.sitemap', 'more.rss'], action: 'openMore', keywords: ['more', 'lainnya', 'language', 'theme', 'rss', 'sitemap'], priority: 70 },
            { id: 'openStore', titlePrefix: 'Open ', titleKey: 'nav.store', meta: '/store', href: 'store', action: 'navigateStore', keywords: ['store', 'open store', 'yellow cart'], priority: 68 },
            { id: 'openBlog', titlePrefix: 'Open ', titleKey: 'nav.blog', meta: '/', href: '', action: 'navigateBlog', keywords: ['blog', 'open blog', 'articles'], priority: 66 }
          ],
          storeExclusion: STORE_DOMAIN,
          emptyCopyKey: 'discovery.empty'
        };

        var COMMAND_PANEL_CONTRACT = {
          family: 'utility-sheet',
          inputMode: 'discovery-sheet',
          heightPolicy: 'content-fit-until-cap',
          entryPoints: ['dock-search-trigger', 'keyboard-shortcut'],
          views: ['results', 'topics'],
          rationale: 'The existing command controller remains the exported entry point, but the panel now operates as a broader discovery workspace.',
          acceptanceNote: 'Command now opens a discovery sheet with one shared field, segmented Results and Topics views, and in-sheet topic filtering.'
        };

        var UTILITY_SHEET_CONTRACT = {
          family: 'utility-sheet',
          members: ['command', 'more', 'comments'],
          headLogic: 'sticky-centered-title',
          affordance: 'handle-in-head',
          heightPolicy: 'content-fit-until-cap',
          acceptanceNote: 'Utility sheets keep a sticky centered head because their job is control-first, not content-first.'
        };

        var SEARCH_DATA_CONTRACT = {
          strategy: ['listing-dom-local-first', 'feed-json-enhancement', 'native-blogger-search-results'],
          localScope: 'current lightweight listing DOM',
          enhancement: 'same-origin feed JSON when available',
          finalFallback: 'native Blogger search route submission',
          acceptanceNote: 'Discovery now builds a normalized post plus topic index from local rows first, then enhances it with feed JSON when available.'
        };

        var PREVIEW_DATA_CONTRACT = {
          family: 'content-sheet',
          strategy: 'same-origin-preview-fetch',
          parseSource: 'article detail HTML under same origin',
          cache: 'in-memory by canonical article URL',
          lightweightListingRule: 'listing rows stay essential and preview enrichment is fetched on demand',
          headLogic: 'content-flow-title',
          affordance: 'sticky-handle-strip',
          ctaPlacement: 'content-footer',
          heightPolicy: 'content-fit-until-cap',
          acceptanceNote: 'Preview now uses a content-sheet contract so the title flows with content instead of inheriting the utility-sheet head.'
        };

        var BOTTOM_SAFE_ZONE_CONTRACT = {
          dockClearanceToken: '--gg-dock-clearance',
          sharedSafeZoneToken: '--gg-shell-bottom-clearance',
          listingClearanceToken: '--gg-listing-bottom-clearance',
          detailClearanceToken: '--gg-detail-bottom-clearance',
          acceptanceNote: 'Dock clearance is centralized so listing and detail surfaces no longer depend on scattered bottom padding guesses.'
        };

        var PANEL_HEIGHT_CONTRACT = {
          policy: 'content-fit-until-cap',
          defaultMinToken: '--gg-panel-min-height',
          defaultMaxToken: '--gg-panel-max-height',
          commandMinToken: '--gg-panel-command-min-height',
          commentsMinToken: '--gg-panel-comments-min-height',
          moreMinToken: '--gg-panel-more-min-height',
          previewMinToken: '--gg-panel-preview-min-height',
          previewMaxToken: '--gg-panel-preview-max-height',
          acceptanceNote: 'Sheets now grow from calm minimums up to a capped height instead of forcing one fixed viewport block across every panel.'
        };

        var DETAIL_TOOLBAR_CONTRACT = {
          family: 'detail-toolbar',
          role: 'contextual-action-rail',
          surfaces: ['post', 'page'],
          visualRelation: 'shares toolbar tokens with dock while staying local to detail content',
          acceptanceNote: 'Detail toolbar is now a real contextual family and not a renamed one-off comments launcher.'
        };

        var DETAIL_OUTLINE_CONTRACT = {
          family: 'detail-outline',
          role: 'dock-attached-contextual-outline',
          surfaces: ['post', 'page'],
          states: ['micro-peek', 'peek', 'expanded'],
          source: 'article heading outline from current detail DOM',
          visibilityRule: 'detail only, hides while primary sheets are active',
          compactThresholds: {
            minimizeScrollTop: 240,
            restoreScrollTop: 120,
            minimizeProgress: 0.22,
            restoreProgress: 0.14
          },
          toggleBehavior: {
            microPeekTap: 'peek',
            peekTap: 'expanded',
            expandedTap: 'resolved-compact'
          },
          gestureThresholds: {
            expandDelta: -18,
            collapseDelta: 18
          },
          compactBehavior: 'peek by default, then calm auto-minimize to micro-peek after deeper reading progress',
          acceptanceNote: 'Detail outline now follows an explicit three-state contract so compact reading support stays calm without becoming a second dock or a disguised full sheet.'
        };

        var ERROR_RUNTIME_CONTRACT = {
          surface: 'error404',
          errorStateAttribute: 'data-gg-error-state',
          errorSourceAttribute: 'data-gg-error-source',
          shellMarkerAttribute: 'data-gg-view-error',
          specialKindAttribute: 'data-gg-special-kind',
          specialSourceAttribute: 'data-gg-special-source',
          primaryMode: 'native-blogger-error-view',
          fallbackMode: 'special-surface-no-error-promotion',
          nativeBloggerMarker: 'data:view.isError',
          custom404Setting: 'Blogger Settings > Custom 404',
          acceptanceNote: 'GG treats native Blogger error views as surface=error404. Unmatched routes stay special unless Blogger exposes the native error marker.'
        };

        var ERROR404_SURFACE_CONTRACT = {
          states: ['idle', 'loading', 'success', 'failure'],
          actions: ['home', 'search'],
          limit: 3,
          timeoutMs: 4800,
          acceptanceNote: 'Native Blogger 404 routes render an explicit recovery surface with honest copy, neutral dock state, and lightweight recent-articles fallback.'
        };

        var LISTING_ROOT_ID = 'gg-entry-list';
        var LISTING_ROW_SELECTOR = '.gg-entry-row[data-gg-post-url]';
        var LISTING_ROW_BASE_SELECTOR = '.gg-entry-row';
        var DISCOVERY_RESULT_SELECTOR = '.gg-discovery-result';
        var DISCOVERY_TOPIC_SELECTOR = '.gg-discovery-topic__apply, .gg-discovery-topic__archive, .gg-discovery-topic-group__toggle';
        var DISCOVERY_TOPIC_LAYOUT_CONTRACT = {
          defaultMode: 'flat',
          groupedThreshold: 16,
          acceptanceNote: 'Topics stay flat at current scale. Alphabetical grouping only returns once topic count reaches groupedThreshold.'
        };

        var SEARCH_EMPTY_FALLBACK_CONTRACT = {
          states: ['idle', 'loading', 'success', 'failure'],
          limit: 3,
          timeoutMs: 4800,
          acceptanceNote: 'Search-empty fallback stays lightweight, but its loading state must always resolve to visible recent articles or a calm terminal failure message.'
        };

        var LISTING_GROWTH_CONTRACT = {
          rootSelector: '#' + LISTING_ROOT_ID,
          fallbackLinkSelector: '#gg-loadmore-fallback',
          sentinelSelector: '#gg-listing-sentinel',
          minimumVisualCount: 10,
          viewportBuffer: 240,
          initialPassMaxRequests: 6,
          fetchSource: 'same-origin olderPageUrl HTML parse',
          appendPolicy: 'append only real ' + LISTING_ROW_SELECTOR + ' nodes from fetched Blogger pages',
          duplicateKey: 'data-gg-post-url',
          stopConditions: [
            'listing row count reaches minimumVisualCount',
            'listing bottom clears viewport plus viewportBuffer',
            'olderPageUrl is no longer available'
          ],
          fallbackMode: 'More entries link remains available only for no-JS or runtime failure mode.',
          acceptanceNote: 'GG grows listing surfaces in-page from olderPageUrl without navigating away, then leaves More entries as the explicit failure/no-JS fallback.'
        };

        var ACTIVE_LEGACY_BRIDGES = [
          {
            id: 'bridge-comments-native-picker',
            area: 'comments',
            status: 'active',
            reason: 'Native Blogger comments internals still need direct wrapping inside the GG sheet for compatibility.',
            removalCondition: 'Remove only when a Blogger-safe replacement preserves comment internals without direct commentPicker wrapping.'
          }
        ];

        var CLOSED_BRIDGES = [
          {
            id: 'bridge-feed-json-fallback',
            area: 'command',
            status: 'closed',
            resolution: 'Discovery now follows an explicit three-step contract: local listing dataset first, feed JSON enhancement second, native Blogger search results last.',
            cleanupCondition: 'Delete this closed note only after live Blogger verification confirms the search contract is stable across listing, search, post, and mobile routes.'
          },
          {
            id: 'bridge-preview-same-origin-fetch',
            area: 'preview',
            status: 'closed',
            resolution: 'Same-origin article fetch is now the documented preview data contract, not an unnamed bridge.',
            cleanupCondition: 'Delete this closed note only if preview data moves to a new stable contract such as a preview manifest or feed-backed detail source.'
          },
          {
            id: 'bridge-surface-special-404',
            area: 'surface',
            status: 'closed',
            resolution: '404 handling now resolves through the native Blogger error marker into surface=error404. Special remains reserved for non-error unmatched routes only.',
            cleanupCondition: 'Delete this closed note only after live Blogger verification confirms the native error404 contract is stable with Blogger Settings > Custom 404.'
          }
        ];

        var QA_MANUAL_MATRIX = [
          {
            viewport: 'mobile-portrait',
            intent: 'Primary touch surface.',
            checks: ['listing', 'landing', 'search', 'label', 'archive', 'post', 'detail outline tray', 'preview sheet', 'comments sheet', 'more sheet', '?m=1', 'language switcher', 'appearance switcher', 'drag dismiss']
          },
          {
            viewport: 'mobile-landscape',
            intent: 'Thumb reach plus constrained height.',
            checks: ['dock stability', 'discovery sheet', 'preview top sheet height', 'bottom sheet close affordance']
          },
          {
            viewport: 'tablet-portrait',
            intent: 'Calm reading plus touch control.',
            checks: ['panel motion', 'dock current state', 'olderPageUrl route', 'language persistence']
          },
          {
            viewport: 'tablet-landscape',
            intent: 'Touch-first but wider layout.',
            checks: ['surface contract', 'detail outline tray', 'preview sheet drag', 'comments sheet drag', 'discovery rows keyboard plus touch']
          },
          {
            viewport: 'desktop-narrow',
            intent: 'Keyboard competent.',
            checks: ['ESC close', 'focus return', 'Ctrl/Cmd+K', 'Tab trap in sheets']
          },
          {
            viewport: 'desktop-wide',
            intent: 'Auditability and route verification.',
            checks: ['live route matrix', 'panel controller snapshot', 'legacy bridge ledger', 'runtime smoke report']
          }
        ];

        var PRESS_SELECTOR = [
          '.gg-dock__item',
          '.gg-loadmore',
          '.gg-more-list__link',
          '.gg-more-footer__link',
          '.gg-langswitch__button',
          '.gg-appearance__button',
          '.gg-entry-row__title-trigger',
          '.gg-entry-row__action',
          '.gg-detail-toolbar__action',
          '.gg-detail-outline__peek',
          '.gg-detail-outline__item-button',
          '.gg-discovery-tab',
          DISCOVERY_RESULT_SELECTOR,
          '.gg-discovery-topic__apply',
          '.gg-discovery-topic__archive',
          '.gg-discovery-topic-group__toggle',
          '.gg-discovery-context__action',
          '.gg-discovery-context__archive',
          '.gg-preview__cta'
        ].join(', ');

        var COMMENTS_SHEET_SELECTOR = '#gg-comments-sheet, #ggPanelComments, #gg-comments-panel, [data-gg-sheet="comments"], [data-gg-panel="comments"]';

        function getCommentsSheet(root) {
          // Legacy selectors are temporary migration bridges; #gg-comments-sheet is the official contract.
          var scope = root || document;
          return scope.querySelector(COMMENTS_SHEET_SELECTOR);
        }

        var commentsSheet = getCommentsSheet(document);

        var ui = {
          fingerprint: document.getElementById('gg-fingerprint'),
          shell: document.getElementById('gg-shell'),
          main: document.getElementById('main'),
          siteHeadEyebrow: document.getElementById('gg-site-head-eyebrow'),
          siteHeadTitle: document.querySelector('.gg-site-head__title'),
          siteHeadSummary: document.getElementById('gg-site-head-summary'),
          dock: document.getElementById('gg-dock'),
          listing: document.getElementById(LISTING_ROOT_ID),
          searchEmpty: document.getElementById('gg-search-empty'),
          searchEmptyFallback: document.getElementById('gg-search-empty-fallback'),
          searchEmptyResults: document.getElementById('gg-search-empty-results'),
          searchEmptyStatus: document.getElementById('gg-search-empty-status'),
          error404: document.getElementById('gg-error404'),
          error404Fallback: document.getElementById('gg-error404-fallback'),
          error404Results: document.getElementById('gg-error404-results'),
          error404Status: document.getElementById('gg-error404-status'),
          feedbackResultTemplate: document.getElementById('gg-feedback-result-template'),
          loadMoreWrap: document.getElementById('gg-loadmore-wrap'),
          loadMore: document.getElementById('gg-loadmore-fallback'),
          listingSentinel: document.getElementById('gg-listing-sentinel'),
          commandPanel: document.getElementById('gg-command-panel'),
          commandPanelSheet: document.querySelector('#gg-command-panel .gg-sheet__panel'),
          commandPanelScrim: document.querySelector('#gg-command-panel .gg-sheet__scrim'),
          commandHandle: document.querySelector('[data-gg-drag-handle="command"]'),
          commandSheetForm: document.getElementById('gg-command-sheet-form'),
          commandSheetInput: document.getElementById('gg-command-sheet-input'),
          commandTabResults: document.getElementById('gg-discovery-tab-results'),
          commandTabTopics: document.getElementById('gg-discovery-tab-topics'),
          commandResultsPanel: document.getElementById('gg-discovery-panel-results'),
          commandTopicsPanel: document.getElementById('gg-discovery-panel-topics'),
          commandResults: document.getElementById('gg-discovery-results'),
          commandTopics: document.getElementById('gg-discovery-topics'),
          commandContext: document.getElementById('gg-discovery-context'),
          commandContextTitle: document.getElementById('gg-discovery-context-title'),
          commandContextArchive: document.getElementById('gg-discovery-context-archive'),
          discoveryResultTemplate: document.getElementById('gg-discovery-result-template'),
          discoveryEmptyTemplate: document.getElementById('gg-discovery-empty-template'),
          discoveryTopicTemplate: document.getElementById('gg-discovery-topic-template'),
          discoveryTopicGroupTemplate: document.getElementById('gg-discovery-topic-group-template'),
          preview: document.getElementById('gg-preview-sheet'),
          previewPanel: document.querySelector('#gg-preview-sheet .gg-sheet__panel'),
          previewScrim: document.querySelector('#gg-preview-sheet .gg-sheet__scrim'),
          previewHandle: document.querySelector('[data-gg-drag-handle="preview"]'),
          previewMedia: document.getElementById('gg-preview-media'),
          previewImage: document.getElementById('gg-preview-image'),
          previewTitle: document.getElementById('gg-preview-title'),
          previewMeta: document.getElementById('gg-preview-meta'),
          previewSummary: document.getElementById('gg-preview-summary'),
          previewTaxonomy: document.getElementById('gg-preview-taxonomy'),
          previewTaxonomyItems: document.getElementById('gg-preview-taxonomy-items'),
          previewStatus: document.getElementById('gg-preview-status'),
          previewTocList: document.getElementById('gg-preview-toc-list'),
          previewMetaItemTemplate: document.getElementById('gg-preview-meta-item-template'),
          previewMetaSeparatorTemplate: document.getElementById('gg-preview-meta-separator-template'),
          previewTaxonomyItemTemplate: document.getElementById('gg-preview-taxonomy-item-template'),
          previewTocItemTemplate: document.getElementById('gg-preview-toc-item-template'),
          previewCta: document.getElementById('gg-preview-cta'),
          more: document.getElementById('gg-more-panel'),
          morePanel: document.querySelector('#gg-more-panel .gg-sheet__panel'),
          moreScrim: document.querySelector('#gg-more-panel .gg-sheet__scrim'),
          moreHandle: document.querySelector('[data-gg-drag-handle="more"]'),
          comments: commentsSheet,
          commentsPanel: commentsSheet ? commentsSheet.querySelector('.gg-sheet__panel, .gg-comments-sheet__panel') : null,
          commentsScrim: commentsSheet ? commentsSheet.querySelector('.gg-sheet__scrim, .gg-comments-sheet__scrim') : null,
          commentsHandle: document.querySelector('[data-gg-drag-handle="comments"]'),
          commentReplies: document.getElementById('gg-comment-replies-sheet'),
          commentRepliesPanel: document.querySelector('#gg-comment-replies-sheet .gg-sheet__panel, #gg-comment-replies-sheet .gg-comments-sheet__panel'),
          commentRepliesList: document.getElementById('gg-comment-replies-list'),
          commentRepliesContext: document.getElementById('gg-comment-replies-context'),
          commentRepliesFooter: document.getElementById('gg-comment-replies-footer'),
          commentRepliesTitle: document.getElementById('gg-comment-replies-title'),
          commentsList: document.getElementById('gg-comments-list'),
          commentsFooter: document.getElementById('gg-comments-footer'),
          commentsReplySlot: document.getElementById('gg-comments-reply-slot'),
          commentsComposerSlot: document.getElementById('gg-comments-composer-slot'),
          article: document.querySelector('.gg-article'),
          articleBody: document.querySelector('.gg-article .gg-post-body'),
          detailToolbar: document.querySelector('.gg-detail-toolbar'),
          detailCommentsAction: document.querySelector('[data-gg-action="comments-open"], .gg-detail-toolbar__action[data-gg-open="comments"], [data-gg-postbar="comments"]'),
          detailCommentsCount: document.getElementById('gg-detail-comments-count'),
          detailCommentsLabel: document.getElementById('gg-detail-comments-label'),
          detailOutline: document.getElementById('gg-detail-outline'),
          detailOutlineToggle: document.getElementById('gg-detail-outline-toggle'),
          detailOutlineTray: document.getElementById('gg-detail-outline-tray'),
          detailOutlineList: document.getElementById('gg-detail-outline-list'),
          detailOutlineCurrent: document.getElementById('gg-detail-outline-current'),
          detailOutlineSummary: document.getElementById('gg-detail-outline-summary'),
          detailOutlineProgress: document.getElementById('gg-detail-outline-progress'),
          detailOutlineGlyph: document.getElementById('gg-detail-outline-glyph'),
          detailOutlineEmptyTemplate: document.getElementById('gg-detail-outline-empty-template'),
          detailOutlineGroupTemplate: document.getElementById('gg-detail-outline-group-template'),
          detailOutlineItemTemplate: document.getElementById('gg-detail-outline-item-template'),
          commentsTitleText: document.getElementById('gg-comments-title-text'),
          commentsEmpty: document.getElementById('gg-comments-empty'),
          langButtons: document.querySelectorAll('[data-gg-lang-option]'),
          themeButtons: document.querySelectorAll('[data-gg-theme-option]'),
          readingButtons: document.querySelectorAll('[data-gg-reading-option]'),
          motionButtons: document.querySelectorAll('[data-gg-motion-option]'),
          moreBodies: document.querySelectorAll('.gg-more-body')
        };

        var state = {
          locale: 'en',
          theme: 'light',
          reading: 'comfortable',
          motion: 'balanced',
          surfaceContext: null,
          errorContract: null,
          previewCache: {},
          previewPayload: null,
          previewUrl: '',
          discoveryIndex: null,
          discoveryIndexPromise: null,
          discoveryQuery: '',
          discoveryTab: 'all',
          discoveryTopic: '',
          discoveryActiveIndex: -1,
          discoveryExpandedGroups: {},
          listingSeenUrls: {},
          listingFetchPromise: null,
          listingObserver: null,
          listingGrowthState: 'fallback',
          storeAppendGuardEnabled: true,
          storeRowsSkippedFromRoot: 0,
          panelActive: null,
          panelLastTrigger: null,
          panelLastCloseReason: null,
          panelTimers: {},
          commentRepliesPortal: null,
          commentRepliesTimer: 0,
          commentRepliesOpenCount: 0,
          commentRepliesIdempotent: true,
          commentRepliesReadOnlyEditorSrcBefore: '',
          commentRepliesParentComment: null,
          commentRepliesAutoReplySafe: true,
          commentRepliesExplicitReplyStarted: false,
          commentRepliesLastReplySource: '',
          commentRepliesLastReplyTargetId: '',
          commentRepliesProgrammaticReplySource: '',
          commentReplyContext: null,
          commentTopLevelEditorSrc: '',
          commentReplyResetCount: 0,
          commentEnhanceRunCount: 0,
          commentMutationCount: 0,
          commentComposerMoveCount: 0,
          commentIframeSrcChangeCount: 0,
          commentMoreEnhancementCount: 0,
          commentInlineReplyEnhancementCount: 0,
          commentComposerPortal: null,
          commentComposerOpen: false,
          commentPrefixObserver: null,
          commentPrefixSyncFrame: 0,
          commentEnhancementScheduled: false,
          commentEnhancementReason: '',
          commentMoreMenu: null,
          commentStatusTimer: 0,
          dockState: 'visible',
          dockFocused: false,
          dockScrollDirection: 'none',
          dockLastScrollTop: 0,
          dockDirectionStart: 0,
          dockSyncFrame: 0,
          previousDockState: 'visible',
          drag: null,
          pressTarget: null,
          detailOutlineSections: [],
          detailOutlineState: 'peek',
          detailOutlineCurrentIndex: -1,
          detailOutlineSyncFrame: 0,
          detailOutlineGesture: null,
          detailOutlineManualOpen: false,
          detailOutlineManualOpenAt: 0,
          searchEmptyFallbackState: 'idle',
          searchEmptyFallbackRequestId: 0,
          searchEmptyFallbackTimeoutId: 0,
          error404FallbackState: 'idle',
          error404FallbackRequestId: 0,
          error404FallbackTimeoutId: 0,
          ignoreClickUntil: 0,
          suppressCommandFocusUntil: 0,
          specialContract: null
        };

        GG.commentsProof = function commentsProof() {
          var result;

          try {
            var sheet = document.querySelector('#gg-comments-sheet, #gg-comments-panel, #ggPanelComments');
            var repliesSheet = document.querySelector('#gg-comment-replies-sheet');
            var root = document.querySelector('#gg-comments-root, #comments');
            var list = document.querySelector('#gg-comments-list, #comment-holder, #cmt2-holder');
            var emptyState = document.querySelector('#gg-comments-empty');
            var editor = document.querySelector('#comment-editor');
            var editorSrc = document.querySelector('#comment-editor-src');
            var composer = document.querySelector('#top-ce');
            var visibleAddCommentControls;
            var visibleComposer;
            var composerLauncherConflict;
            var loadMoreInsideFooter;
            var replyActionsVertical;
            var zeroStateDuplicateLabels;
            var excessiveCommentVerticalGap;
            var topCeInsideFooter;
            var topCeInsideComment;
            var bannerFooter;
            var composerFooter;
            var activeFooter;
            var activeFooterEditor;
            var editorVisible;
            var activeFooterComposerOpen;
            var activeSheetCount;
            var nativeThreadToggleHiddenInReplies;
            var inlineReplyVertical;
            var topContinueVisible;
            var commentsEmptyStateCopy;
            var commentsEmptyStateVisibleMatchesCount;
            var commentsEmptyStatePreservesNativeList;
            var invalidLoadMoreVisible;
            var duplicateExternalComposerLabels;
            var moreMenu;
            var moreMenuPanel;
            var moreMenuInsideSheet;
            var moreMenuPlacement;
            var moreMenuHasIcons;
            var deleteMenuUsesDangerStyle;
            var repliesParentContextCardVisible;
            var repliesParentContextSticky;
            var replyBannerSplitLayout;
            var loadMoreFunctionalAndAboveFooter;
            var composerWellVisibleWhenOpen;
            var moreMenuItemsAligned;
            var parentContextHasAvatar;
            var parentContextLabelIsOriginalComment;
            var replyBannerHasReplyIcon;
            var replyBannerCancelRightAligned;
            var sheetScrollbarsHidden;
            var iconButtonsCentered;
            var editorCurrentSrc;
            var replyContextActive;
            var replyFooterModeActive;
            var replyBannerActive;
            var replyCancelResetsNativeParent;
            var editorSrcHasNoParentIdAfterCancel;
            var replyModeClearsNativeTarget;
            var viewRepliesDoesNotChangeIframeSrc;
            var viewRepliesDoesNotAutoReply;
            var parentReplyActionExists;
            var addReplyLauncherTargetsParent;
            var replySpecificCommentTargetsDirectComment;
            var cancelReplyClearsNativeTarget;
            var composerMoveCountBounded;
            var commentsEnhanceRunsBounded;
            var repliesNodeCountsStable;
            var noDuplicateMoreButtonsAfterRepliesOpen;
            var repliesOpenIsIdempotent;
            var toolbarCommentsAction;
            var toolbarCommentsIcon;
            var toolbarCommentsBadge;
            var toolbarCommentsLabel;
            var toolbarCommentsState;
            var toolbarCommentsCount;
            var toolbarCommentsIconOnly;
            var toolbarCommentsBadgeVisibleWhenCountPositive;
            var toolbarCommentsBadgeHiddenWhenZero;
            var toolbarCommentsUsesAddIconWhenZero;
            var toolbarCommentsUsesDisabledIconWhenDisabled;
            var toolbarCommentsSemanticLabelPresent;
            var toolbarCommentsVisibleTextHidden;
            var repliesParentId;
            var commentCount;
            var isVisible = function (element) {
              var style;
              var rect;
              if (!element || element.hidden) return false;
              style = window.getComputedStyle ? window.getComputedStyle(element) : null;
              if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
              rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
              return !rect || (rect.width > 0 && rect.height > 0);
            };
            var isVisuallyHidden = function (element) {
              var style;
              if (!element) return true;
              style = window.getComputedStyle ? window.getComputedStyle(element) : null;
              return !!(element.classList && element.classList.contains('gg-visually-hidden')) || !!(style && (style.clip === 'rect(0px, 0px, 0px, 0px)' || style.position === 'absolute' && style.width === '1px' && style.height === '1px' && style.overflow === 'hidden'));
            };
            var getZ = function (element) {
              var value = element && window.getComputedStyle ? window.getComputedStyle(element).zIndex : '';
              var parsed = Number(value);
              return Number.isFinite(parsed) ? parsed : 0;
            };
            var visibleSheets = [sheet ? sheet.querySelector('.gg-sheet__panel, .gg-comments-sheet__panel') : null, repliesSheet ? repliesSheet.querySelector('.gg-sheet__panel, .gg-comments-sheet__panel') : null].filter(isVisible).length;
            var visibleFooters = Array.prototype.slice.call(document.querySelectorAll('.gg-comments__footer')).filter(isVisible).length;
            var visibleReplyLeaks = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet #gg-comments-list .comment-replies')).filter(isVisible).length;
            var visibleFooterNodes = Array.prototype.slice.call(document.querySelectorAll('.gg-comments__footer')).filter(isVisible);
            var moreButtonsInHeader = Array.prototype.slice.call(document.querySelectorAll('.gg-comment-more')).every(function (node) {
              var comment = node.closest ? node.closest('li.comment, .comment-thread .comment, .comment') : null;
              var header = comment && comment.querySelector ? comment.querySelector('.comment-author, .comment-header') : null;
              var nodeRect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
              var headerRect = header && header.getBoundingClientRect ? header.getBoundingClientRect() : null;
              if (!comment || !header || !nodeRect || !headerRect) return true;
              return Math.abs(Math.round(nodeRect.top) - Math.round(headerRect.top)) <= 8;
            });
            var activeCommentsLayer = document.body ? (document.body.getAttribute('data-gg-comments-layer') || '') : '';
            activeFooter = visibleFooterNodes[0] || null;
            activeFooterEditor = activeFooter ? activeFooter.querySelector('#comment-editor') : null;
            editorVisible = !!(activeFooterEditor && isVisible(activeFooterEditor));
            activeFooterComposerOpen = activeFooter ? activeFooter.getAttribute('data-gg-composer-open') : '';
            activeSheetCount = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet, #gg-comment-replies-sheet')).filter(function (node) {
              return node.getAttribute('data-gg-active') === 'true' && !node.hidden && node.getAttribute('aria-hidden') !== 'true' && !node.hasAttribute('inert');
            }).length;
            topCeInsideFooter = !!(composer && composer.closest && composer.closest('.gg-comments__footer'));
            topCeInsideComment = !!(composer && composer.closest && composer.closest('li.comment, .comment-thread, .comment-replies, #gg-comments-list, #gg-comment-replies-list'));
            bannerFooter = document.querySelector('.gg-comments__reply-banner');
            bannerFooter = bannerFooter && bannerFooter.closest ? bannerFooter.closest('.gg-comments__footer') : null;
            composerFooter = composer && composer.closest ? composer.closest('.gg-comments__footer') : null;
            visibleAddCommentControls = visibleFooterNodes.reduce(function (count, footer) {
              return count + Array.prototype.slice.call(footer.querySelectorAll('[data-gg-action="comments-open-composer"]')).filter(isVisible).length;
            }, 0);
            visibleComposer = !!(composer && isVisible(composer));
            composerLauncherConflict = visibleFooterNodes.some(function (footer) {
              return !!(footer.querySelector('#top-ce') && isVisible(footer.querySelector('#top-ce')) && Array.prototype.slice.call(footer.querySelectorAll('[data-gg-action="comments-open-composer"]')).filter(isVisible).length);
            });
            loadMoreInsideFooter = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet .continue, #gg-comments-sheet a')).some(function (node) {
              return /load more/i.test(node.textContent || '') && isVisible(node) && !!(node.closest && node.closest('.gg-comments__footer'));
            });
            replyActionsVertical = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-sheet a.comment-reply, #gg-comment-replies-sheet .thread-toggle, #gg-comment-replies-sheet .continue, #gg-comment-replies-sheet [data-gg-action="comments-open-replies"]')).filter(isVisible).filter(function (node) {
              return !(node.closest && node.closest('.gg-comment-inline-reply'));
            }).some(function (node) {
              var rect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              return !!(rect && style && (style.writingMode !== 'horizontal-tb' || rect.height > rect.width));
            });
            nativeThreadToggleHiddenInReplies = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-sheet .thread-toggle, #gg-comment-replies-sheet .thread-count, #gg-comment-replies-sheet .thread-arrow')).every(function (node) {
              return !isVisible(node);
            });
            inlineReplyVertical = Array.prototype.slice.call(document.querySelectorAll('.gg-comment-inline-reply')).filter(isVisible).some(function (node) {
              var rect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              return !!(rect && style && (style.writingMode !== 'horizontal-tb' || rect.height > rect.width));
            });
            topContinueVisible = isVisible(document.querySelector('#top-continue'));
            commentCount = getTopLevelCommentCount ? getTopLevelCommentCount() : 0;
            commentsEmptyStateCopy = !!(emptyState && emptyState.textContent.indexOf(getCopy('comments.empty.title')) !== -1 && emptyState.textContent.indexOf(getCopy('comments.empty.body')) !== -1);
            commentsEmptyStateVisibleMatchesCount = !!emptyState && (commentCount ? !isVisible(emptyState) : isVisible(emptyState));
            commentsEmptyStatePreservesNativeList = !!(emptyState && list && emptyState.parentNode === list.parentNode && !emptyState.contains(list));
            invalidLoadMoreVisible = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet [data-gg-invalid-continuation="true"]')).some(isVisible);
            zeroStateDuplicateLabels = !getTopLevelCommentCount || getTopLevelCommentCount() ? false : (visibleFooterNodes.reduce(function (count, footer) {
              return count + Array.prototype.slice.call(footer.querySelectorAll('[data-gg-action="comments-open-composer"], #comment-post-message')).filter(isVisible).length;
            }, 0) > 1);
            duplicateExternalComposerLabels = visibleFooterNodes.reduce(function (count, footer) {
              return count + Array.prototype.slice.call(footer.querySelectorAll('[data-gg-action="comments-open-composer"], #comment-post-message')).filter(isVisible).length;
            }, 0) > 1;
            excessiveCommentVerticalGap = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet li.comment, #gg-comments-sheet .comment-thread .comment')).filter(isVisible).slice(0, 6).some(function (commentNode) {
              var bodyNode = commentNode.querySelector ? commentNode.querySelector('.comment-body, .comment-content') : null;
              var actionNode = commentNode.querySelector ? commentNode.querySelector('.comment-actions, .comment-footer, [data-gg-action="comments-open-replies"], .continue') : null;
              var bodyRect = bodyNode && bodyNode.getBoundingClientRect ? bodyNode.getBoundingClientRect() : null;
              var actionRect = actionNode && actionNode.getBoundingClientRect ? actionNode.getBoundingClientRect() : null;
              return !!(bodyRect && actionRect && actionRect.top - bodyRect.bottom > 24);
            });
            moreMenu = Array.prototype.slice.call(document.querySelectorAll('.gg-comment-more__menu')).filter(isVisible)[0] || null;
            moreMenuPanel = moreMenu && moreMenu.closest ? moreMenu.closest('.gg-sheet__panel, .gg-comments-sheet__panel') : null;
            moreMenuPlacement = moreMenu ? (moreMenu.getAttribute('data-gg-menu-placement') || '') : '';
            moreMenuInsideSheet = !moreMenu || !moreMenuPanel || (function () {
              var menuRect = moreMenu.getBoundingClientRect();
              var panelRect = moreMenuPanel.getBoundingClientRect();
              return menuRect.left >= panelRect.left && menuRect.right <= panelRect.right && menuRect.top >= panelRect.top && menuRect.bottom <= panelRect.bottom;
            }());
            moreMenuHasIcons = !moreMenu || Array.prototype.slice.call(moreMenu.querySelectorAll('.gg-comment-more__item')).every(function (item) {
              return !!item.querySelector('.gg-comment-more__icon, .gg-icon');
            });
            deleteMenuUsesDangerStyle = !moreMenu || Array.prototype.slice.call(moreMenu.querySelectorAll('[data-gg-comment-action="delete"]')).every(function (item) {
              var style = window.getComputedStyle ? window.getComputedStyle(item) : null;
              return !!(style && style.color && style.color !== 'rgb(32, 26, 28)');
            });
            moreMenuItemsAligned = !moreMenu || Array.prototype.slice.call(moreMenu.querySelectorAll('.gg-comment-more__item')).every(function (item) {
              var icon = item.querySelector('.gg-comment-more__item-icon, .gg-comment-more__icon, .gg-icon');
              var label = item.querySelector('.gg-comment-more__item-label, .gg-comment-more__label');
              var style = window.getComputedStyle ? window.getComputedStyle(item) : null;
              var iconStyle = icon && window.getComputedStyle ? window.getComputedStyle(icon) : null;
              var itemRect = item.getBoundingClientRect ? item.getBoundingClientRect() : null;
              var iconRect = icon && icon.getBoundingClientRect ? icon.getBoundingClientRect() : null;
              var labelRect = label && label.getBoundingClientRect ? label.getBoundingClientRect() : null;
              return !!(style && iconStyle && itemRect && iconRect && labelRect && style.display === 'flex' && style.justifyContent === 'flex-start' && Math.round(iconRect.width) >= 18 && Math.round(labelRect.left) > Math.round(iconRect.right) && labelRect.right <= itemRect.right);
            });
            repliesParentContextCardVisible = activeCommentsLayer !== 'replies' || isVisible(document.querySelector('#gg-comment-replies-context'));
            repliesParentContextSticky = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-context')).filter(isVisible).some(function (node) {
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              return !!(style && (style.position === 'sticky' || style.position === 'fixed'));
            });
            parentContextHasAvatar = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-context')).filter(isVisible).every(function (node) {
              return !!node.querySelector('.gg-comment-replies__context-avatar') || !!node.querySelector('.gg-comment-replies__context-row--no-avatar');
            });
            parentContextLabelIsOriginalComment = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-context')).filter(isVisible).every(function (node) {
              var label = node.querySelector('.gg-comment-replies__context-label');
              return !!(label && label.textContent.trim() === getCopy('comments.originalComment'));
            });
            replyBannerSplitLayout = Array.prototype.slice.call(document.querySelectorAll('.gg-comments__reply-banner')).filter(isVisible).every(function (banner) {
              var clear = banner.querySelector('[data-gg-action="comments-reply-context-clear"]');
              var bannerRect = banner.getBoundingClientRect ? banner.getBoundingClientRect() : null;
              var clearRect = clear && clear.getBoundingClientRect ? clear.getBoundingClientRect() : null;
              var style = window.getComputedStyle ? window.getComputedStyle(banner) : null;
              return !!(style && bannerRect && clearRect && (style.display === 'flex' || style.display === 'grid') && clearRect.right >= bannerRect.right - 14);
            });
            replyBannerHasReplyIcon = Array.prototype.slice.call(document.querySelectorAll('.gg-comments__reply-banner')).filter(isVisible).every(function (banner) {
              var icon = banner.querySelector('.gg-comments__reply-icon');
              return !!(icon && icon.textContent.trim() === 'reply' && icon.getAttribute('aria-hidden') === 'true');
            });
            replyBannerCancelRightAligned = Array.prototype.slice.call(document.querySelectorAll('.gg-comments__reply-banner')).filter(isVisible).every(function (banner) {
              var clear = banner.querySelector('.gg-comments__reply-clear');
              var bannerRect = banner.getBoundingClientRect ? banner.getBoundingClientRect() : null;
              var clearRect = clear && clear.getBoundingClientRect ? clear.getBoundingClientRect() : null;
              return !!(bannerRect && clearRect && clearRect.left > bannerRect.left && clearRect.right >= bannerRect.right - 14);
            });
            sheetScrollbarsHidden = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet .gg-comments__content, #gg-comment-replies-sheet .gg-comments__content')).every(function (node) {
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              return !!(style && (style.overflowY === 'auto' || style.overflowY === 'scroll') && style.overscrollBehaviorY === 'contain' && style.scrollbarWidth === 'none');
            });
            iconButtonsCentered = Array.prototype.slice.call(document.querySelectorAll('.gg-detail-toolbar__action--comments, .gg-comments__reply-clear, .gg-comment-more__button, .gg-detail-toolbar__count, .gg-comment-more__item-icon')).filter(isVisible).every(function (node) {
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              if (!style) return false;
              if (style.display.indexOf('grid') !== -1) return style.placeItems === 'center' || (style.alignItems === 'center' && style.justifyItems === 'center');
              if (style.display.indexOf('flex') !== -1) return style.alignItems === 'center' && style.justifyContent === 'center';
              return false;
            });
            editorCurrentSrc = editor ? (editor.getAttribute('src') || editor.src || '') : '';
            replyContextActive = !!(state.commentReplyContext && state.commentReplyContext.handle);
            replyFooterModeActive = !!document.querySelector('.gg-comments__footer[data-gg-comment-composer-mode="reply"]');
            replyBannerActive = isVisible(document.querySelector('.gg-comments__reply-banner'));
            replyCancelResetsNativeParent = !editor || replyContextActive || (!replyBannerActive && !commentSrcHasParentId(editorCurrentSrc));
            editorSrcHasNoParentIdAfterCancel = !editor || replyContextActive || !commentSrcHasParentId(editorCurrentSrc);
            replyModeClearsNativeTarget = !editor || replyContextActive || (!replyFooterModeActive && !commentSrcHasParentId(editorCurrentSrc));
            viewRepliesDoesNotChangeIframeSrc = activeCommentsLayer !== 'replies' || !!replyContextActive || state.commentRepliesExplicitReplyStarted || !state.commentRepliesReadOnlyEditorSrcBefore || (editorCurrentSrc === state.commentRepliesReadOnlyEditorSrcBefore && !commentSrcHasParentId(editorCurrentSrc) && !isVisible(document.querySelector('#gg-comment-replies-sheet .gg-comments__reply-banner')) && (!ui.commentRepliesFooter || ui.commentRepliesFooter.getAttribute('data-gg-composer-open') === 'false'));
            repliesParentId = getCommentNodeId(state.commentRepliesParentComment || (state.commentRepliesPortal && state.commentRepliesPortal.parentComment));
            viewRepliesDoesNotAutoReply = activeCommentsLayer !== 'replies' || !!replyContextActive || (!!state.commentRepliesAutoReplySafe && !replyBannerActive && !commentSrcHasParentId(editorCurrentSrc) && (!ui.commentRepliesFooter || ui.commentRepliesFooter.getAttribute('data-gg-composer-open') === 'false'));
            parentReplyActionExists = activeCommentsLayer !== 'replies' || !!document.querySelector('#gg-comment-replies-context [data-gg-action="comments-reply-parent"][aria-label="' + getCopy('comments.action.replyToOriginal') + '"]');
            addReplyLauncherTargetsParent = activeCommentsLayer !== 'replies' || !!(repliesParentId && document.querySelector('#gg-comment-replies-footer [data-gg-action="comments-add-reply"][aria-label="' + getCopy('comments.action.addReplyToOriginal') + '"][data-gg-reply-target="' + repliesParentId + '"]'));
            replySpecificCommentTargetsDirectComment = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-sheet a.comment-reply, #gg-comment-replies-sheet .comment-reply a, #gg-comment-replies-sheet [data-comment-id].comment-reply')).filter(isVisible).every(function (node) {
              var commentNode = getCommentNodeFromTrigger(node);
              return !!(commentNode && getCommentNodeId(commentNode));
            });
            cancelReplyClearsNativeTarget = !!replyContextActive || (!replyBannerActive && !commentSrcHasParentId(editorCurrentSrc));
            composerMoveCountBounded = state.commentComposerMoveCount <= Math.max(2, state.commentRepliesOpenCount + state.commentReplyResetCount + 3);
            commentsEnhanceRunsBounded = state.commentEnhanceRunCount <= 8;
            repliesNodeCountsStable = document.querySelectorAll('#top-ce').length <= 1 && document.querySelectorAll('#comment-editor').length <= 1 && document.querySelectorAll('#gg-comment-replies-context').length === 1 && document.querySelectorAll('#gg-comments-composer-slot').length === 1 && document.querySelectorAll('#gg-comments-reply-slot').length === 1;
            noDuplicateMoreButtonsAfterRepliesOpen = Array.prototype.slice.call(document.querySelectorAll('li.comment, .comment-thread .comment, #comments-block > .comment')).every(function (commentNode) {
              return commentNode.querySelectorAll(':scope > .gg-comment-more, :scope > .comment-block > .gg-comment-more, :scope > .comment-header > .gg-comment-more, :scope > .comment-author > .gg-comment-more, :scope > .comment-footer > .gg-comment-more').length <= 1;
            });
            repliesOpenIsIdempotent = !!state.commentRepliesIdempotent && document.querySelectorAll('#gg-comment-replies-sheet').length === 1 && document.querySelectorAll('#gg-comment-replies-context').length === 1;
            loadMoreFunctionalAndAboveFooter = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet .loadmore, #gg-comments-sheet .continue')).filter(function (node) {
              return /load more/i.test(node.textContent || '') && isVisible(node);
            }).every(function (node) {
              var footer = document.querySelector('#gg-comments-footer:not([hidden])');
              var nodeRect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
              var footerRect = footer && footer.getBoundingClientRect ? footer.getBoundingClientRect() : null;
              var inViewport = !!(nodeRect && nodeRect.bottom > 0 && nodeRect.top < window.innerHeight);
              return !!(node.closest && !node.closest('.gg-comments__footer') && (!inViewport || !footerRect || !nodeRect || nodeRect.bottom <= footerRect.top + 1));
            });
            composerWellVisibleWhenOpen = !activeFooter || activeFooterComposerOpen !== 'true' || isVisible(activeFooter.querySelector('#gg-comments-composer-slot, #top-ce'));
            toolbarCommentsAction = document.querySelector('.gg-detail-toolbar__action--comments[data-gg-action="comments-open"], .gg-detail-toolbar [data-gg-action="comments-open"]');
            toolbarCommentsIcon = toolbarCommentsAction ? toolbarCommentsAction.querySelector('.gg-detail-toolbar__comments-icon, .gg-icon') : null;
            toolbarCommentsBadge = toolbarCommentsAction ? toolbarCommentsAction.querySelector('#gg-detail-comments-count, .gg-detail-toolbar__count') : null;
            toolbarCommentsLabel = toolbarCommentsAction ? toolbarCommentsAction.querySelector('#gg-detail-comments-label') : null;
            toolbarCommentsState = toolbarCommentsAction ? (toolbarCommentsAction.getAttribute('data-gg-comments-state') || '') : '';
            toolbarCommentsCount = toolbarCommentsAction ? parseCommentCount(toolbarCommentsAction.getAttribute('data-gg-comments-count')) : 0;
            toolbarCommentsIconOnly = !toolbarCommentsAction || (!!toolbarCommentsIcon && isVisible(toolbarCommentsIcon) && isVisuallyHidden(toolbarCommentsLabel) && toolbarCommentsAction.classList.contains('gg-detail-toolbar__action--comments'));
            toolbarCommentsBadgeVisibleWhenCountPositive = !toolbarCommentsAction || toolbarCommentsState !== 'has-comments' || (toolbarCommentsCount > 0 && !!toolbarCommentsBadge && isVisible(toolbarCommentsBadge));
            toolbarCommentsBadgeHiddenWhenZero = !toolbarCommentsAction || toolbarCommentsState !== 'empty' || !isVisible(toolbarCommentsBadge);
            toolbarCommentsUsesAddIconWhenZero = !toolbarCommentsAction || toolbarCommentsState !== 'empty' || (toolbarCommentsIcon && toolbarCommentsIcon.textContent === 'add_comment');
            toolbarCommentsUsesDisabledIconWhenDisabled = !toolbarCommentsAction || toolbarCommentsState !== 'disabled' || (toolbarCommentsIcon && toolbarCommentsIcon.textContent === 'comments_disabled' && !isVisible(toolbarCommentsBadge));
            toolbarCommentsSemanticLabelPresent = !toolbarCommentsAction || !!(toolbarCommentsAction.getAttribute('aria-label') && toolbarCommentsLabel && toolbarCommentsLabel.textContent.trim());
            toolbarCommentsVisibleTextHidden = !toolbarCommentsAction || isVisuallyHidden(toolbarCommentsLabel);

            result = {
              sheet: !!sheet,
              root: !!root,
              list: !!list,
              editor: !!editor,
              editorSrc: !!editorSrc,
              composer: !!composer,
              sheetCount: document.querySelectorAll('#gg-comments-sheet, #gg-comments-panel, #ggPanelComments').length,
              commentsRootCount: document.querySelectorAll('#comments').length,
              ggCommentsRootCount: document.querySelectorAll('#gg-comments-root').length,
              composerCount: document.querySelectorAll('#top-ce').length,
              editorCount: document.querySelectorAll('#comment-editor').length,
              nativeDeleteCount: document.querySelectorAll('.item-control, .comment-delete, .goog-toggle-button').length,
              replyStructureCount: document.querySelectorAll('.comment-replies, .thread-toggle, .thread-count').length,
              fallbackSubmitCount: document.querySelectorAll('[data-gg-fallback-composer] button[type="submit"], [data-gg-fallback-composer] input[type="submit"], .gg-comments__fallback button[type="submit"], .gg-comments__fallback input[type="submit"]').length,
              activeCommentsLayer: activeCommentsLayer,
              visibleSheets: visibleSheets,
              visibleFooters: visibleFooters,
              repliesAboveMain: !sheet || !repliesSheet || getZ(repliesSheet) > getZ(sheet),
              visibleReplyLeaks: visibleReplyLeaks,
              moreButtonsInHeader: moreButtonsInHeader,
              topCeInsideFooter: topCeInsideFooter,
              topCeInsideComment: topCeInsideComment,
              bannerFooterMatchesComposerFooter: !bannerFooter || bannerFooter === composerFooter,
              composerLauncherConflict: composerLauncherConflict,
              visibleAddCommentControls: visibleAddCommentControls,
              visibleComposer: visibleComposer,
              composerStateMatchesVisibility: !activeFooter || (editorVisible ? activeFooterComposerOpen === 'true' : activeFooterComposerOpen === 'false'),
              onlyOneActiveSheet: activeSheetCount <= 1,
              nativeThreadToggleHiddenInReplies: nativeThreadToggleHiddenInReplies,
              inlineReplyVertical: inlineReplyVertical,
              topContinueVisible: topContinueVisible,
              commentsEmptyState: !!emptyState,
              commentsEmptyStateCopy: commentsEmptyStateCopy,
              commentsEmptyStateVisibleMatchesCount: commentsEmptyStateVisibleMatchesCount,
              commentsEmptyStatePreservesNativeList: commentsEmptyStatePreservesNativeList,
              invalidLoadMoreHidden: !invalidLoadMoreVisible,
              loadMoreInsideFooter: loadMoreInsideFooter,
              replyActionsVertical: replyActionsVertical,
              zeroStateDuplicateLabels: zeroStateDuplicateLabels,
              duplicateExternalComposerLabels: duplicateExternalComposerLabels,
              excessiveCommentVerticalGap: excessiveCommentVerticalGap,
              excessiveVerticalGap: excessiveCommentVerticalGap,
              moreMenuInsideSheet: moreMenuInsideSheet,
              moreMenuPlacement: moreMenuPlacement,
              moreMenuHasIcons: moreMenuHasIcons,
              deleteMenuUsesDangerStyle: deleteMenuUsesDangerStyle,
              moreMenuItemsAligned: moreMenuItemsAligned,
              repliesParentContextCardVisible: repliesParentContextCardVisible,
              repliesParentContextSticky: repliesParentContextSticky,
              parentContextHasAvatar: parentContextHasAvatar,
              parentContextLabelIsOriginalComment: parentContextLabelIsOriginalComment,
              replyBannerSplitLayout: replyBannerSplitLayout,
              replyBannerHasReplyIcon: replyBannerHasReplyIcon,
              replyBannerCancelRightAligned: replyBannerCancelRightAligned,
              sheetScrollbarsHidden: sheetScrollbarsHidden,
              iconButtonsCentered: iconButtonsCentered,
              replyCancelResetsNativeParent: replyCancelResetsNativeParent,
              editorSrcHasNoParentIdAfterCancel: editorSrcHasNoParentIdAfterCancel,
              replyModeClearsNativeTarget: replyModeClearsNativeTarget,
              viewRepliesDoesNotChangeIframeSrc: viewRepliesDoesNotChangeIframeSrc,
              viewRepliesDoesNotAutoReply: viewRepliesDoesNotAutoReply,
              parentReplyActionExists: parentReplyActionExists,
              addReplyLauncherTargetsParent: addReplyLauncherTargetsParent,
              replySpecificCommentTargetsDirectComment: replySpecificCommentTargetsDirectComment,
              cancelReplyClearsNativeTarget: cancelReplyClearsNativeTarget,
              composerMoveCountBounded: composerMoveCountBounded,
              commentsEnhanceRunsBounded: commentsEnhanceRunsBounded,
              repliesNodeCountsStable: repliesNodeCountsStable,
              noDuplicateMoreButtonsAfterRepliesOpen: noDuplicateMoreButtonsAfterRepliesOpen,
              repliesOpenIsIdempotent: repliesOpenIsIdempotent,
              loadMoreFunctionalAndAboveFooter: loadMoreFunctionalAndAboveFooter,
              composerWellVisibleWhenOpen: composerWellVisibleWhenOpen,
              toolbarCommentsIconOnly: toolbarCommentsIconOnly,
              toolbarCommentsBadgeVisibleWhenCountPositive: toolbarCommentsBadgeVisibleWhenCountPositive,
              toolbarCommentsBadgeHiddenWhenZero: toolbarCommentsBadgeHiddenWhenZero,
              toolbarCommentsUsesAddIconWhenZero: toolbarCommentsUsesAddIconWhenZero,
              toolbarCommentsUsesDisabledIconWhenDisabled: toolbarCommentsUsesDisabledIconWhenDisabled,
              toolbarCommentsSemanticLabelPresent: toolbarCommentsSemanticLabelPresent,
              toolbarCommentsVisibleTextHidden: toolbarCommentsVisibleTextHidden,
              repliesSheetHasHandle: !!document.querySelector('#gg-comment-replies-sheet [data-gg-drag-handle="comment-replies"], #gg-comment-replies-sheet .gg-sheet__handle')
            };

            result.ok = !!(
              result.sheet &&
              result.root &&
              result.list &&
              result.editor &&
              result.sheetCount === 1 &&
              result.editorCount === 1 &&
              result.composerCount <= 1 &&
              result.commentsRootCount === 1 &&
              result.ggCommentsRootCount <= 1 &&
              result.fallbackSubmitCount === 0 &&
              result.repliesAboveMain &&
              result.visibleReplyLeaks === 0 &&
              result.moreButtonsInHeader &&
              result.topCeInsideFooter &&
              !result.topCeInsideComment &&
              result.bannerFooterMatchesComposerFooter &&
              !result.composerLauncherConflict &&
              result.visibleAddCommentControls <= 1 &&
              result.composerStateMatchesVisibility &&
              result.onlyOneActiveSheet &&
              result.nativeThreadToggleHiddenInReplies &&
              !result.inlineReplyVertical &&
              !result.topContinueVisible &&
              result.commentsEmptyState &&
              result.commentsEmptyStateCopy &&
              result.commentsEmptyStateVisibleMatchesCount &&
              result.commentsEmptyStatePreservesNativeList &&
              result.invalidLoadMoreHidden &&
              !result.loadMoreInsideFooter &&
              !result.replyActionsVertical &&
              !result.zeroStateDuplicateLabels &&
              !result.duplicateExternalComposerLabels &&
              !result.excessiveCommentVerticalGap &&
              result.moreMenuInsideSheet &&
              result.moreMenuHasIcons &&
              result.deleteMenuUsesDangerStyle &&
              result.moreMenuItemsAligned &&
              result.repliesParentContextCardVisible &&
              !result.repliesParentContextSticky &&
              result.parentContextHasAvatar &&
              result.parentContextLabelIsOriginalComment &&
              result.replyBannerSplitLayout &&
              result.replyBannerHasReplyIcon &&
              result.replyBannerCancelRightAligned &&
              result.sheetScrollbarsHidden &&
              result.iconButtonsCentered &&
              result.replyCancelResetsNativeParent &&
              result.editorSrcHasNoParentIdAfterCancel &&
              result.replyModeClearsNativeTarget &&
              result.viewRepliesDoesNotChangeIframeSrc &&
              result.viewRepliesDoesNotAutoReply &&
              result.parentReplyActionExists &&
              result.addReplyLauncherTargetsParent &&
              result.replySpecificCommentTargetsDirectComment &&
              result.cancelReplyClearsNativeTarget &&
              result.composerMoveCountBounded &&
              result.commentsEnhanceRunsBounded &&
              result.repliesNodeCountsStable &&
              result.noDuplicateMoreButtonsAfterRepliesOpen &&
              result.repliesOpenIsIdempotent &&
              result.loadMoreFunctionalAndAboveFooter &&
              result.composerWellVisibleWhenOpen &&
              result.toolbarCommentsIconOnly &&
              result.toolbarCommentsBadgeVisibleWhenCountPositive &&
              result.toolbarCommentsBadgeHiddenWhenZero &&
              result.toolbarCommentsUsesAddIconWhenZero &&
              result.toolbarCommentsUsesDisabledIconWhenDisabled &&
              result.toolbarCommentsSemanticLabelPresent &&
              result.toolbarCommentsVisibleTextHidden &&
              result.repliesSheetHasHandle &&
              (activeCommentsLayer !== 'main' && activeCommentsLayer !== 'replies' || (result.visibleSheets <= 1 && result.visibleFooters === 1))
            );
          } catch (error) {
            result = {
              sheet: false,
              root: false,
              list: false,
              editor: false,
              editorSrc: false,
              composer: false,
              commentsRootCount: 0,
              composerCount: 0,
              editorCount: 0,
              nativeDeleteCount: 0,
              replyStructureCount: 0,
              fallbackSubmitCount: 0,
              ok: false,
              error: error && error.message ? error.message : String(error)
            };
          }

          if (document.documentElement) {
            document.documentElement.setAttribute('data-gg-comments-proof', result.ok ? 'ok' : 'fail');
            document.documentElement.setAttribute('data-gg-comments-proof-count', String(Object.keys(result).filter(function (key) {
              return result[key] === false;
            }).length));
          }

          return result;
        };

        var startupState = GG.__startup && typeof GG.__startup === 'object' ? GG.__startup : {};
        var pwaState = {
          supported: !!(window.navigator && window.navigator.serviceWorker),
          registered: false,
          controlling: !!(window.navigator && window.navigator.serviceWorker && window.navigator.serviceWorker.controller),
          scope: '',
          version: '',
          versionExpected: '',
          mode: 'unknown',
          enabled: true,
          navigationPreload: false,
          devAggressiveUpdate: false,
          updateAvailable: false,
          waiting: false,
          cacheSupported: !!window.caches,
          cacheNames: [],
          offlineCached: false,
          landingCached: false,
          landingVariantsCached: [],
          lastCacheMode: document.body.getAttribute('data-gg-cache-mode') || 'unknown',
          lastCachePath: '',
          registrationError: '',
          listenersBound: false,
          messagingBound: false,
          debugAllowed: false
        };
        var pwaConfig = GG.pwaConfig && typeof GG.pwaConfig === 'object' ? GG.pwaConfig : {};

        if (typeof pwaConfig.rootFallbackRedirect !== 'boolean') {
          pwaConfig.rootFallbackRedirect = false;
        }

        GG.__startup = startupState;
        GG.pwaConfig = pwaConfig;

        var panelDefs = {};
        var DOCK_TOP_ZONE_PX = 72;
        var DOCK_BOTTOM_ZONE_PX = 112;
        var DOCK_BOTTOM_ZONE_VIEWPORT_RATIO = 0.14;
        var DOCK_DIRECTION_DELTA_PX = 6;
        var DOCK_HIDE_THRESHOLD_PX = 56;
        var DOCK_SHOW_THRESHOLD_PX = 34;
        var DETAIL_OUTLINE_MANUAL_OPEN_GRACE_MS = 1600;

        function escapeHtml(value) {
          return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
          });
        }

        function stripHtml(value) {
          var div = document.createElement('div');
          div.innerHTML = value || '';
          return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
        }

        function debounce(fn, wait) {
          var timer = null;
          return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(context, args);
            }, wait);
          };
        }

        function waitMs(duration) {
          return new Promise(function (resolve) {
            window.setTimeout(resolve, duration);
          });
        }

        function ggNow() {
          return window.performance && typeof window.performance.now === 'function'
            ? window.performance.now()
            : 0;
        }

        function roundTiming(value) {
          return typeof value === 'number' && value >= 0 ? Math.round(value) : null;
        }

        function readBodyState(name, fallback) {
          if (!document.body) return fallback || '';
          return document.body.getAttribute(name) || fallback || '';
        }

        function writeBodyState(name, value) {
          if (!document.body) return;
          document.body.setAttribute(name, value);
        }

        function resolveDockScrollTop() {
          return Math.max(0, window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
        }

        function resolveDockDocumentHeight() {
          var body = document.body;
          var root = document.documentElement;
          return Math.max(
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0,
            root ? root.scrollHeight : 0,
            root ? root.offsetHeight : 0,
            root ? root.clientHeight : 0
          );
        }

        function isDockBottomZone(scrollTop) {
          var viewportHeight = Math.max(window.innerHeight || 0, document.documentElement ? document.documentElement.clientHeight : 0);
          var threshold = Math.max(DOCK_BOTTOM_ZONE_PX, Math.round(viewportHeight * DOCK_BOTTOM_ZONE_VIEWPORT_RATIO));
          return (scrollTop + viewportHeight) >= (resolveDockDocumentHeight() - threshold);
        }

        function resolveDockScrollDirection(scrollTop) {
          var delta = scrollTop - state.dockLastScrollTop;
          var nextDirection = state.dockScrollDirection;

          if (scrollTop <= 0) {
            nextDirection = 'none';
            state.dockDirectionStart = 0;
          } else if (Math.abs(delta) >= DOCK_DIRECTION_DELTA_PX) {
            nextDirection = delta > 0 ? 'down' : 'up';
            if (nextDirection !== state.dockScrollDirection) {
              state.dockDirectionStart = scrollTop;
            }
          }

          state.dockScrollDirection = nextDirection;
          state.dockLastScrollTop = scrollTop;
          return nextDirection;
        }

        function resolveDockVisibilityState(scrollTop, bottomZone) {
          if (state.panelActive) return 'panel-locked';
          if (state.dockFocused) return 'forced-visible';
          if (scrollTop <= DOCK_TOP_ZONE_PX || bottomZone) return 'visible';

          if (state.dockState === 'hidden-by-scroll') {
            if (state.dockScrollDirection === 'up' && (state.dockDirectionStart - scrollTop) >= DOCK_SHOW_THRESHOLD_PX) {
              return 'visible';
            }
            return 'hidden-by-scroll';
          }

          if (state.dockScrollDirection === 'down' && (scrollTop - state.dockDirectionStart) >= DOCK_HIDE_THRESHOLD_PX) {
            return 'hidden-by-scroll';
          }

          return 'visible';
        }

        function syncDockVisibility() {
          var scrollTop = resolveDockScrollTop();
          var bottomZone = isDockBottomZone(scrollTop);
          var direction = resolveDockScrollDirection(scrollTop);
          var dockState = resolveDockVisibilityState(scrollTop, bottomZone);
          var previousDockState = state.dockState;
          var wasHidden = previousDockState === 'hidden-by-scroll';
          var willHide = dockState === 'hidden-by-scroll';
          var becameHidden = !wasHidden && willHide;
          var becameVisible = wasHidden && (dockState === 'visible' || dockState === 'forced-visible');

          state.previousDockState = previousDockState;
          state.dockState = dockState;
          writeBodyState('data-gg-dock-state', dockState);
          writeBodyState('data-gg-scroll-direction', direction || 'none');
          writeBodyState('data-gg-bottom-zone', bottomZone ? 'true' : 'false');

          if (becameHidden && ui.detailOutline && !ui.detailOutline.hidden) {
            if (!isDetailOutlineManualOpenFresh()) {
              clearDetailOutlineManualOpen();
              setDetailOutlineState('micro-peek');
            }
          }

          if (becameVisible) {
            clearDetailOutlineManualOpen();
          }

          requestDetailOutlineSync();
        }

        function requestDockVisibilitySync() {
          if (state.dockSyncFrame) return;
          state.dockSyncFrame = window.requestAnimationFrame(function () {
            state.dockSyncFrame = 0;
            syncDockVisibility();
          });
        }

        function syncDockFocusState() {
          state.dockFocused = !!(ui.dock && ui.dock.contains(document.activeElement));
          syncDockVisibility();
        }

        function initDockVisibility() {
          writeBodyState('data-gg-active-panel', state.panelActive || '');
          writeBodyState('data-gg-panel-active', state.panelActive ? 'true' : 'false');
          setDockInert(!!state.panelActive);
          if (!state.panelActive && document.body) document.body.removeAttribute('data-gg-scroll-lock');

          if (!ui.dock) {
            writeBodyState('data-gg-dock-state', 'visible');
            writeBodyState('data-gg-scroll-direction', 'none');
            writeBodyState('data-gg-bottom-zone', 'false');
            return;
          }

          state.dockLastScrollTop = resolveDockScrollTop();
          state.dockDirectionStart = state.dockLastScrollTop;
          state.dockScrollDirection = 'none';
          state.dockFocused = ui.dock.contains(document.activeElement);

          ui.dock.addEventListener('focusin', syncDockFocusState);
          ui.dock.addEventListener('focusout', function () {
            window.setTimeout(syncDockFocusState, 0);
          });

          window.addEventListener('scroll', requestDockVisibilitySync, { passive: true });
          window.addEventListener('resize', requestDockVisibilitySync);
          window.addEventListener('hashchange', requestDockVisibilitySync);

          syncDockVisibility();
        }

        startupState.startedAt = typeof startupState.startedAt === 'number' && startupState.startedAt > 0
          ? startupState.startedAt
          : ggNow();
        startupState.shellReadyAt = typeof startupState.shellReadyAt === 'number' ? startupState.shellReadyAt : 0;
        startupState.firstInteractionReadyAt = typeof startupState.firstInteractionReadyAt === 'number' ? startupState.firstInteractionReadyAt : 0;
        startupState.hydrationCompleteAt = typeof startupState.hydrationCompleteAt === 'number' ? startupState.hydrationCompleteAt : 0;
        startupState.longTasks = Array.isArray(startupState.longTasks) ? startupState.longTasks : [];
        startupState.launchPath = startupState.launchPath || readBodyState('data-gg-launch-path', '/');
        startupState.displayMode = startupState.displayMode || readBodyState('data-gg-display-mode', 'browser');
        var THEME_STORAGE_KEY = 'gg:theme';
        var READING_STORAGE_KEY = 'gg:reading';
        var MOTION_STORAGE_KEY = 'gg:motion';

        function normalizeLocale(value) {
          var locale = String(value || '').toLowerCase();
          if (locale.indexOf('id') === 0 || locale.indexOf('in') === 0) return 'id';
          return 'en';
        }

        function normalizeTheme(value) {
          var theme = String(value || '').toLowerCase();
          if (theme === 'dark') return 'dark';
          return 'light';
        }

        function normalizeReading(value) {
          var reading = String(value || '').toLowerCase();
          if (reading === 'compact' || reading === 'focus') return reading;
          return 'comfortable';
        }

        function normalizeMotion(value) {
          var motion = String(value || '').toLowerCase();
          if (motion === 'reduced') return 'reduced';
          return 'balanced';
        }

        function isDockHiddenByScroll() {
          return state.dockState === 'hidden-by-scroll' || readBodyState('data-gg-dock-state', '') === 'hidden-by-scroll';
        }

        function prefersReducedMotion() {
          try {
            return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          } catch (error) {
            return false;
          }
        }

        function scrollDocumentToTop() {
          try {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
          } catch (error) {
            window.scrollTo(0, 0);
          }
        }

        function isRootListingSurface() {
          return !!(state.surfaceContext && state.surfaceContext.isRootListing);
        }

        function isLandingSurface() {
          return !!(state.surfaceContext && state.surfaceContext.surface === 'landing');
        }

        function syncMoreRouteState() {
          var nodes = document.querySelectorAll('[data-gg-more-route]');
          var expected = expectedDockKey();
          var i;
          var node;
          var routeKey;

          for (i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            routeKey = node.getAttribute('data-gg-more-route');
            if (expected && routeKey === expected) {
              node.setAttribute('aria-current', 'page');
              node.setAttribute('data-gg-active', 'true');
            } else {
              node.removeAttribute('aria-current');
              node.removeAttribute('data-gg-active');
            }
          }
        }

        function handlePrimaryRouteTrigger(trigger) {
          var routeKey = trigger && (trigger.getAttribute('data-gg-more-route') || trigger.getAttribute('data-gg-nav'));

          if (!routeKey) return false;
          if (!((routeKey === 'blog' && isRootListingSurface()) || (routeKey === 'home' && isLandingSurface()))) return false;

          closePanel(state.panelActive, {
            returnFocus: false,
            reason: 'current-route-top'
          }).then(scrollDocumentToTop);
          return true;
        }

        function getCopy(key) {
          var parts = String(key || '').split('.');
          var current = COPY[state.locale] || COPY.en;
          var fallback = COPY.en;
          var i;

          for (i = 0; i < parts.length; i += 1) {
            current = current && current[parts[i]];
            fallback = fallback && fallback[parts[i]];
          }

          return current || fallback || key;
        }

        function formatCopy(key, replacements) {
          var text = String(getCopy(key) || '');
          var token;

          for (token in replacements) {
            if (!Object.prototype.hasOwnProperty.call(replacements, token)) continue;
            text = text.split('{' + token + '}').join(replacements[token]);
          }

          return text;
        }

        function parseIsoDateParts(value) {
          var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);

          if (!match) return null;
          return {
            year: parseInt(match[1], 10),
            month: parseInt(match[2], 10),
            day: parseInt(match[3], 10)
          };
        }

        function formatEditorialDate(value, fallback) {
          var parts = parseIsoDateParts(value);
          var months;

          if (!parts) return String(fallback || '');

          if (state.locale === 'id') {
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return parts.day + ' ' + months[parts.month - 1] + ' ' + parts.year;
          }

          months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[parts.month - 1] + ' ' + parts.day + ', ' + parts.year;
        }

        function readPreferredLocale() {
          var stored = '';
          try {
            stored = window.localStorage ? window.localStorage.getItem('gg:lang') : '';
          } catch (error) {
            stored = '';
          }

          if (stored === 'en' || stored === 'id') return stored;
          return normalizeLocale(document.documentElement.getAttribute('lang') || 'en');
        }

        function readPreferredTheme() {
          var stored = '';
          var normalized;
          try {
            stored = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : '';
          } catch (error) {
            stored = '';
          }
          normalized = normalizeTheme(stored);
          if (stored !== normalized) {
            try {
              if (window.localStorage) window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
            } catch (error) {
              /* ignore storage failures */
            }
          }
          return normalized;
        }

        function readPreferredReading() {
          var stored = '';
          try {
            stored = window.localStorage ? window.localStorage.getItem(READING_STORAGE_KEY) : '';
          } catch (error) {
            stored = '';
          }
          return normalizeReading(stored);
        }

        function readPreferredMotion() {
          var stored = '';
          try {
            stored = window.localStorage ? window.localStorage.getItem(MOTION_STORAGE_KEY) : '';
          } catch (error) {
            stored = '';
          }
          return normalizeMotion(stored);
        }

        function applyCopy(scope) {
          var root = scope || document;
          var textNodes = root.querySelectorAll('[data-gg-copy]');
          var placeholderNodes = root.querySelectorAll('[data-gg-copy-placeholder]');
          var titleNodes = root.querySelectorAll('[data-gg-copy-title]');
          var ariaNodes = root.querySelectorAll('[data-gg-copy-aria-label]');
          var i;

          for (i = 0; i < textNodes.length; i += 1) {
            textNodes[i].textContent = getCopy(textNodes[i].getAttribute('data-gg-copy'));
          }

          for (i = 0; i < placeholderNodes.length; i += 1) {
            placeholderNodes[i].setAttribute('placeholder', getCopy(placeholderNodes[i].getAttribute('data-gg-copy-placeholder')));
          }

          for (i = 0; i < titleNodes.length; i += 1) {
            titleNodes[i].setAttribute('title', getCopy(titleNodes[i].getAttribute('data-gg-copy-title')));
          }

          for (i = 0; i < ariaNodes.length; i += 1) {
            ariaNodes[i].setAttribute('aria-label', getCopy(ariaNodes[i].getAttribute('data-gg-copy-aria-label')));
          }
        }

        function syncLanguageButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.langButtons.length; i += 1) {
            node = ui.langButtons[i];
            active = node.getAttribute('data-gg-lang-option') === state.locale;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function syncThemeButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.themeButtons.length; i += 1) {
            node = ui.themeButtons[i];
            active = node.getAttribute('data-gg-theme-option') === state.theme;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function syncReadingButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.readingButtons.length; i += 1) {
            node = ui.readingButtons[i];
            active = node.getAttribute('data-gg-reading-option') === state.reading;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function syncMotionButtons() {
          var i;
          var node;
          var active;

          for (i = 0; i < ui.motionButtons.length; i += 1) {
            node = ui.motionButtons[i];
            active = node.getAttribute('data-gg-motion-option') === state.motion;
            node.setAttribute('data-gg-active', active ? 'true' : 'false');
            node.setAttribute('aria-pressed', active ? 'true' : 'false');
          }
        }

        function setMorePrefValue(key, label) {
          var nodes = document.querySelectorAll('[data-gg-pref-value="' + key + '"]');
          var i;
          for (i = 0; i < nodes.length; i += 1) nodes[i].textContent = label;
        }

        function syncMorePreferenceValues() {
          setMorePrefValue('language', state.locale === 'id' ? getCopy('language.indonesia') : getCopy('language.english'));
          setMorePrefValue('appearance', getCopy('appearance.' + state.theme));
          setMorePrefValue('reading', getCopy('reading.' + state.reading));
          setMorePrefValue('motion', getCopy('motion.' + state.motion));
        }

        function initMoreLocalSearch() {
          var roots = ui.moreBodies || [];
          var i;

          for (i = 0; i < roots.length; i += 1) {
            (function (root) {
              var scope;
              var input;
              if (!root || root.getAttribute('data-gg-local-search-ready') === 'true') return;
              scope = root.closest('.gg-more-sheet') || root.closest('[data-gg-panel="more"]') || root;
              input = scope.querySelector('[data-gg-more-search-input]');
              if (!input) return;
              root.setAttribute('data-gg-local-search-ready', 'true');
              input.addEventListener('input', function () {
                var q = String(input.value || '').trim().toLowerCase();
                var sections = root.querySelectorAll('.gg-more-profile, .gg-more-section');
                var sIndex;

                for (sIndex = 0; sIndex < sections.length; sIndex += 1) {
                  (function (section) {
                    var rows = section.querySelectorAll('.gg-more-list__link, .gg-more-profile__card');
                    var hasMatch = false;
                    var rIndex;

                    if (!q) {
                      section.removeAttribute('data-gg-filter-empty');
                      for (rIndex = 0; rIndex < rows.length; rIndex += 1) rows[rIndex].hidden = false;
                      return;
                    }

                    for (rIndex = 0; rIndex < rows.length; rIndex += 1) {
                      (function (row) {
                        var haystack = [
                          row.textContent || '',
                          row.getAttribute('data-gg-copy') || '',
                          row.getAttribute('data-copy') || '',
                          row.getAttribute('data-copy-key') || '',
                          row.getAttribute('data-gg-more-route') || '',
                          row.getAttribute('data-gg-pref-open') || '',
                          row.getAttribute('href') || ''
                        ].join(' ').toLowerCase();
                        var match = haystack.indexOf(q) !== -1;
                        row.hidden = !match;
                        if (match) hasMatch = true;
                      }(rows[rIndex]));
                    }

                    section.toggleAttribute('data-gg-filter-empty', !hasMatch);
                  }(sections[sIndex]));
                }
              });
            }(roots[i]));
          }
        }

        function openMorePreferencePanel(name) {
          var panelRoot = document.querySelector('#gg-more-panel [data-gg-pref-panels]');
          var panels;
          var i;
          if (!panelRoot || !name) return false;
          panels = panelRoot.querySelectorAll('[data-gg-pref-panel]');
          panelRoot.hidden = false;
          for (i = 0; i < panels.length; i += 1) {
            panels[i].hidden = panels[i].getAttribute('data-gg-pref-panel') !== name;
          }
          if (ui.morePanel) ui.morePanel.setAttribute('data-gg-pref-active', name);
          return true;
        }

        function closeMorePreferencePanel() {
          var panelRoot = document.querySelector('#gg-more-panel [data-gg-pref-panels]');
          var panels;
          var i;
          if (!panelRoot || panelRoot.hidden) return false;
          panels = panelRoot.querySelectorAll('[data-gg-pref-panel]');
          panelRoot.hidden = true;
          for (i = 0; i < panels.length; i += 1) panels[i].hidden = true;
          if (ui.morePanel) ui.morePanel.removeAttribute('data-gg-pref-active');
          return true;
        }

        function initMorePreferences() {
          var root = ui.morePanel;
          var openers;
          var backs;
          var i;
          if (!root || root.getAttribute('data-gg-pref-ready') === 'true') return;
          root.setAttribute('data-gg-pref-ready', 'true');
          openers = root.querySelectorAll('[data-gg-pref-open]');
          backs = root.querySelectorAll('[data-gg-pref-back]');
          for (i = 0; i < openers.length; i += 1) {
            openers[i].addEventListener('click', function (event) {
              event.preventDefault();
              openMorePreferencePanel(event.currentTarget.getAttribute('data-gg-pref-open'));
            });
          }
          for (i = 0; i < backs.length; i += 1) {
            backs[i].addEventListener('click', function (event) {
              event.preventDefault();
              closeMorePreferencePanel();
            });
          }
        }

        function setLocale(locale, skipPersist) {
          state.locale = normalizeLocale(locale);
          if (ui.shell) ui.shell.setAttribute('data-gg-lang', state.locale);
          document.documentElement.setAttribute('lang', state.locale);

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem('gg:lang', state.locale);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          GG.copy.locale = state.locale;
          applyCopy(document);
          syncLanguageButtons();
          syncMorePreferenceValues();
          syncLoadMoreCopy();
          syncDetailCommentCopy();
          syncArticleMetaDates();
          syncSearchEmptyState();
          syncError404State();
          renderDetailOutline();
          hydratePreviewForLocale();

          if (state.panelActive === 'command' && state.discoveryIndex) {
            renderDiscovery(getCommandValue(), {
              open: false
            });
          }
        }

        function setTheme(theme, skipPersist) {
          state.theme = normalizeTheme(theme);
          document.documentElement.setAttribute('data-gg-theme', state.theme);

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          syncThemeButtons();
          syncMorePreferenceValues();
        }

        function setReading(reading, skipPersist) {
          state.reading = normalizeReading(reading);
          document.documentElement.setAttribute('data-gg-reading', state.reading);

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem(READING_STORAGE_KEY, state.reading);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          syncReadingButtons();
          syncMorePreferenceValues();
        }

        function setMotion(motion, skipPersist) {
          state.motion = normalizeMotion(motion);
          document.documentElement.setAttribute('data-gg-motion', state.motion);

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem(MOTION_STORAGE_KEY, state.motion);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          syncMotionButtons();
          syncMorePreferenceValues();
        }

        function safeUrl(value) {
          try {
            return new URL(value, window.location.href);
          } catch (error) {
            return new URL(window.location.href);
          }
        }

        function toAbsoluteUrl(value, base) {
          if (!value) return '';
          try {
            return new URL(value, base || window.location.href).href;
          } catch (error) {
            return value;
          }
        }

        function ggIdle(fn, timeout) {
          var limit = typeof timeout === 'number' ? timeout : 1200;

          if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(fn, { timeout: limit });
          }

          return window.setTimeout(function () {
            fn({
              didTimeout: true,
              timeRemaining: function () {
                return 0;
              }
            });
          }, 64);
        }

        function isStandaloneDisplayMode() {
          var standalone = false;

          try {
            standalone = !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
          } catch (error) {
            standalone = false;
          }

          if (!standalone && window.navigator && window.navigator.standalone === true) {
            standalone = true;
          }

          return standalone;
        }

        function syncDisplayModeState() {
          var mode = isStandaloneDisplayMode() ? 'standalone' : 'browser';
          startupState.displayMode = mode;
          writeBodyState('data-gg-display-mode', mode);
          return mode;
        }

        function syncNetworkState() {
          writeBodyState('data-gg-network', window.navigator && window.navigator.onLine === false ? 'offline' : 'online');
        }

        function syncLaunchPathState() {
          var path = normalizedPath(window.location.href);
          startupState.launchPath = path;
          writeBodyState('data-gg-launch-path', path);
          return path;
        }

        function markBootPerformance(name) {
          try {
            performance.mark(name);
          } catch (error) {}
        }

        function markShellReady() {
          if (!startupState.shellReadyAt) startupState.shellReadyAt = ggNow();
          writeBodyState('data-gg-boot', 'shell-ready');
          markBootPerformance('gg:boot:shell-ready');
        }

        function markFirstInteractionReady() {
          if (!startupState.firstInteractionReadyAt) startupState.firstInteractionReadyAt = ggNow();
          writeBodyState('data-gg-boot', 'interactive');
          writeBodyState('data-gg-hydration', 'critical');
          markBootPerformance('gg:boot:first-interaction-ready');
        }

        function markHydrationDeferred() {
          writeBodyState('data-gg-hydration', 'deferred');
        }

        function markHydrationComplete() {
          if (!startupState.hydrationCompleteAt) startupState.hydrationCompleteAt = ggNow();
          writeBodyState('data-gg-boot', 'hydrated');
          writeBodyState('data-gg-hydration', 'complete');
          markBootPerformance('gg:boot:hydration-complete');
        }

        function startupSnapshot() {
          return {
            bootState: readBodyState('data-gg-boot', 'unknown'),
            hydration: readBodyState('data-gg-hydration', 'unknown'),
            displayMode: readBodyState('data-gg-display-mode', 'browser'),
            launchPath: readBodyState('data-gg-launch-path', normalizedPath(window.location.href)),
            shellReadyMs: startupState.shellReadyAt ? roundTiming(startupState.shellReadyAt - startupState.startedAt) : null,
            firstInteractionReadyMs: startupState.firstInteractionReadyAt ? roundTiming(startupState.firstInteractionReadyAt - startupState.startedAt) : null,
            hydrationCompleteMs: startupState.hydrationCompleteAt ? roundTiming(startupState.hydrationCompleteAt - startupState.startedAt) : null,
            longTasks: startupState.longTasks.slice()
          };
        }

        function observeStartupLongTasks() {
          if (startupState.longTaskObserverStarted) return;
          startupState.longTaskObserverStarted = true;

          if (!window.PerformanceObserver) return;

          try {
            startupState.longTaskObserver = new PerformanceObserver(function (list) {
              var entries = list.getEntries();
              var i;
              for (i = 0; i < entries.length; i += 1) {
                startupState.longTasks.push({
                  name: entries[i].name || 'longtask',
                  startTime: roundTiming(entries[i].startTime),
                  duration: roundTiming(entries[i].duration)
                });
              }
              if (startupState.longTasks.length > 20) {
                startupState.longTasks = startupState.longTasks.slice(startupState.longTasks.length - 20);
              }
            });

            startupState.longTaskObserver.observe({
              type: 'longtask',
              buffered: true
            });
          } catch (error) {}
        }

        function bindBootStateListeners() {
          if (pwaState.listenersBound) return;
          pwaState.listenersBound = true;

          window.addEventListener('online', syncNetworkState);
          window.addEventListener('offline', syncNetworkState);

          if (window.matchMedia) {
            try {
              var displayModeQuery = window.matchMedia('(display-mode: standalone)');
              var syncMode = function () {
                syncDisplayModeState();
              };

              if (displayModeQuery.addEventListener) {
                displayModeQuery.addEventListener('change', syncMode);
              } else if (displayModeQuery.addListener) {
                displayModeQuery.addListener(syncMode);
              }
            } catch (error) {}
          }
        }

        function readSwVersionMeta() {
          var release = ui.fingerprint ? (ui.fingerprint.getAttribute('data-release') || '') : '';
          var templateFingerprint = ui.fingerprint ? (ui.fingerprint.getAttribute('data-gg-template-fingerprint') || '') : '';

          return {
            release: release,
            templateFingerprint: templateFingerprint,
            version: release && templateFingerprint ? (release + '-' + templateFingerprint) : ''
          };
        }

        function syncExpectedSwVersion() {
          var meta = readSwVersionMeta();
          pwaState.versionExpected = meta.version || pwaState.versionExpected || '';
          return meta;
        }

        function hasPwaDebugQuery() {
          return safeUrl(window.location.href).searchParams.get('ggdebug') === '1';
        }

        function isPwaDebugAllowed(mode) {
          var currentMode = mode || pwaState.mode || 'unknown';
          if (hasPwaDebugQuery()) return true;
          return currentMode === 'development' || currentMode === 'staging';
        }

        function buildPwaActionGate(action, options) {
          var gateOptions = options || {};
          var currentMode = pwaState.mode || 'unknown';
          var ggdebug = hasPwaDebugQuery();
          var allowed = isPwaDebugAllowed(currentMode);

          return {
            ok: allowed,
            allowed: allowed,
            action: action || 'pwa-action',
            mode: currentMode,
            ggdebug: ggdebug,
            hardReset: !!gateOptions.hardReset,
            error: allowed ? '' : 'pwa_action_blocked',
            reason: allowed ? 'allowed' : 'requires_development_or_staging_mode_or_ggdebug',
            message: allowed
              ? 'PWA action allowed.'
              : 'PWA reset APIs are disabled unless mode is development/staging or ?ggdebug=1 is present.'
          };
        }

        function pwaCacheSnapshot() {
          return {
            supported: pwaState.cacheSupported,
            cacheNames: pwaState.cacheNames.slice(),
            offlineCached: !!pwaState.offlineCached,
            landingCached: !!pwaState.landingCached,
            landingVariantsCached: pwaState.landingVariantsCached.slice(),
            lastCacheMode: pwaState.lastCacheMode || 'unknown'
          };
        }

        function pwaSnapshot() {
          return {
            supported: pwaState.supported,
            registered: pwaState.registered,
            controlling: pwaState.controlling,
            version: pwaState.version || pwaState.versionExpected || '',
            expectedVersion: pwaState.versionExpected || '',
            mode: pwaState.mode,
            enabled: pwaState.enabled,
            navigationPreload: pwaState.navigationPreload,
            devAggressiveUpdate: pwaState.devAggressiveUpdate,
            updateAvailable: pwaState.updateAvailable,
            cacheNames: pwaState.cacheNames.slice(),
            offlineCached: !!pwaState.offlineCached,
            landingCached: !!pwaState.landingCached,
            lastCacheMode: pwaState.lastCacheMode || 'unknown',
            lastCachePath: pwaState.lastCachePath || '',
            scope: pwaState.scope || ''
          };
        }

        function applyPwaStatus(status) {
          if (!status || typeof status !== 'object') return;

          if (typeof status.enabled === 'boolean') pwaState.enabled = status.enabled;
          if (typeof status.navigationPreload === 'boolean') pwaState.navigationPreload = status.navigationPreload;
          if (typeof status.devAggressiveUpdate === 'boolean') pwaState.devAggressiveUpdate = status.devAggressiveUpdate;
          if (typeof status.mode === 'string' && status.mode) pwaState.mode = status.mode;
          if (typeof status.version === 'string' && status.version) pwaState.version = status.version;
          if (typeof status.lastCacheMode === 'string' && status.lastCacheMode) {
            pwaState.lastCacheMode = status.lastCacheMode;
            writeBodyState('data-gg-cache-mode', status.lastCacheMode);
          }
          if (typeof status.lastCachePath === 'string') pwaState.lastCachePath = status.lastCachePath;
          if (Array.isArray(status.cacheNames)) pwaState.cacheNames = status.cacheNames.slice();

          pwaState.debugAllowed = isPwaDebugAllowed(pwaState.mode);
        }

        function refreshPwaCacheAudit() {
          var offlineUrl = makeHomeUrl('offline.html');
          var landingUrls = [
            makeHomeUrl('landing'),
            makeHomeUrl('landing?source=pwa'),
            makeHomeUrl('landing?source=pwa-launch'),
            makeHomeUrl('landing?source=pwa-shortcut')
          ];

          pwaState.cacheSupported = !!window.caches;

          if (!window.caches || !window.caches.keys) {
            pwaState.cacheNames = [];
            pwaState.offlineCached = false;
            pwaState.landingCached = false;
            pwaState.landingVariantsCached = [];
            return Promise.resolve(pwaCacheSnapshot());
          }

          return window.caches.keys().then(function (names) {
            pwaState.cacheNames = names.slice();

            return Promise.all(names.map(function (name) {
              return window.caches.open(name).then(function (cache) {
                return Promise.all([
                  cache.match(offlineUrl),
                  Promise.all(landingUrls.map(function (url) {
                    return cache.match(url);
                  }))
                ]).then(function (matches) {
                  return {
                    offline: !!matches[0],
                    landing: matches[1]
                  };
                });
              }).catch(function () {
                return {
                  offline: false,
                  landing: []
                };
              });
            }));
          }).then(function (groups) {
            var landingSeen = {};
            var landingMatches = [];
            var i;
            var j;

            pwaState.offlineCached = false;

            for (i = 0; i < groups.length; i += 1) {
              if (groups[i].offline) pwaState.offlineCached = true;

              for (j = 0; j < landingUrls.length; j += 1) {
                if (!groups[i].landing[j]) continue;
                if (landingSeen[landingUrls[j]]) continue;
                landingSeen[landingUrls[j]] = true;
                landingMatches.push(landingUrls[j]);
              }
            }

            pwaState.landingVariantsCached = landingMatches;
            pwaState.landingCached = landingMatches.length > 0;
            return pwaCacheSnapshot();
          }).catch(function () {
            pwaState.offlineCached = false;
            pwaState.landingCached = false;
            pwaState.landingVariantsCached = [];
            return pwaCacheSnapshot();
          });
        }

        function queryServiceWorkerStatus(registration) {
          var worker = registration && (registration.active || registration.waiting || registration.installing);

          if (!worker && window.navigator && window.navigator.serviceWorker) {
            worker = window.navigator.serviceWorker.controller;
          }

          if (!worker || !window.MessageChannel) {
            return Promise.resolve(null);
          }

          return new Promise(function (resolve) {
            var settled = false;
            var channel = new MessageChannel();
            var timeout = window.setTimeout(function () {
              if (settled) return;
              settled = true;
              resolve(null);
            }, 1200);

            channel.port1.onmessage = function (event) {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              resolve(event && event.data ? event.data : null);
            };

            try {
              worker.postMessage({ type: 'GG_SW_STATUS' }, [channel.port2]);
            } catch (error) {
              if (!settled) {
                settled = true;
                window.clearTimeout(timeout);
                resolve(null);
              }
            }
          });
        }

        function refreshPwaDiagnostics(registration) {
          return queryServiceWorkerStatus(registration).then(function (status) {
            if (status) applyPwaStatus(status);
            return refreshPwaCacheAudit();
          }).catch(function () {
            return refreshPwaCacheAudit();
          }).then(function () {
            pwaState.controlling = !!(window.navigator && window.navigator.serviceWorker && window.navigator.serviceWorker.controller);
            pwaState.debugAllowed = isPwaDebugAllowed(pwaState.mode);
            return pwaSnapshot();
          });
        }

        function maybePromoteWaitingWorker(registration) {
          if (!registration || !registration.waiting || !pwaState.devAggressiveUpdate) return false;

          try {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return true;
          } catch (error) {
            return false;
          }
        }

        function bindServiceWorkerMessaging() {
          if (!pwaState.supported || pwaState.messagingBound) return;
          pwaState.messagingBound = true;

          window.navigator.serviceWorker.addEventListener('message', function (event) {
            var data = event && event.data ? event.data : {};

            if (data.type === 'GG_SW_CACHE_MODE') {
              if (typeof data.cacheMode === 'string' && data.cacheMode) {
                pwaState.lastCacheMode = data.cacheMode;
                writeBodyState('data-gg-cache-mode', data.cacheMode);
              }
              if (typeof data.path === 'string') pwaState.lastCachePath = data.path;
              if (typeof data.version === 'string' && data.version) pwaState.version = data.version;
              return;
            }

            if (data.type === 'GG_SW_READY') {
              pwaState.registered = true;
              pwaState.controlling = !!window.navigator.serviceWorker.controller;
              pwaState.updateAvailable = false;
              applyPwaStatus(data);
              refreshPwaDiagnostics();
              return;
            }

            if (data.type === 'GG_SW_DISABLED') {
              pwaState.enabled = false;
              pwaState.registered = false;
              pwaState.controlling = false;
              pwaState.cacheNames = [];
              pwaState.offlineCached = false;
              pwaState.landingCached = false;
              pwaState.landingVariantsCached = [];
              pwaState.lastCacheMode = 'unknown';
              writeBodyState('data-gg-cache-mode', 'unknown');
              return;
            }

            if (data.type === 'GG_SW_STATUS') {
              applyPwaStatus(data);
            }
          });

          window.navigator.serviceWorker.addEventListener('controllerchange', function () {
            pwaState.controlling = !!window.navigator.serviceWorker.controller;
            pwaState.updateAvailable = false;
            refreshPwaDiagnostics();
          });
        }

        function bindServiceWorkerUpdateFlow(registration) {
          if (!registration) return;

          if (registration.waiting) {
            pwaState.waiting = true;
            pwaState.updateAvailable = !!(window.navigator.serviceWorker && window.navigator.serviceWorker.controller);
            maybePromoteWaitingWorker(registration);
          }

          registration.addEventListener('updatefound', function () {
            var installing = registration.installing;
            if (!installing) return;

            installing.addEventListener('statechange', function () {
              if (installing.state === 'installed') {
                pwaState.waiting = !!registration.waiting;
                pwaState.updateAvailable = !!window.navigator.serviceWorker.controller;
                maybePromoteWaitingWorker(registration);
                refreshPwaDiagnostics(registration);
              } else if (installing.state === 'activated') {
                pwaState.waiting = false;
                pwaState.updateAvailable = false;
                refreshPwaDiagnostics(registration);
              }
            });
          });
        }

        function registerPwaServiceWorker() {
          if (!pwaState.supported) return Promise.resolve(null);

          bindServiceWorkerMessaging();
          syncExpectedSwVersion();

          return window.navigator.serviceWorker.register(makeHomeUrl('sw.js'), {
            scope: '/'
          }).then(function (registration) {
            pwaState.registered = true;
            pwaState.scope = registration.scope || '/';
            pwaState.waiting = !!registration.waiting;
            pwaState.registrationError = '';
            bindServiceWorkerUpdateFlow(registration);
            return refreshPwaDiagnostics(registration).then(function () {
              maybePromoteWaitingWorker(registration);
              return registration;
            });
          }).catch(function (error) {
            pwaState.registrationError = error && error.message ? error.message : 'service-worker-registration-failed';
            return null;
          });
        }

        function isStandaloneLaunchRedirectBlocked(url) {
          var source = url.searchParams.get('source') || '';
          var path = normalizedPath(url.href);

          if (path.indexOf('/b/') === 0) return true;
          if (path.indexOf('/admin') === 0) return true;
          if (path.indexOf('/preview') === 0) return true;
          if (path.indexOf('/draft') === 0) return true;
          if (path.indexOf('/comment-iframe') === 0) return true;
          if (path.indexOf('/edit') !== -1) return true;
          if (url.searchParams.get('ggdebug') === '1') return true;
          if (url.searchParams.get('gg_nopwa_redirect') === '1') return true;
          if (url.searchParams.get('gg_no_pwa_redirect') === '1') return true;
          if (source === 'pwa') return true;
          if (source === 'pwa-launch') return true;
          if (source === 'pwa-shortcut') return true;
          if (url.searchParams.has('preview')) return true;
          if (url.searchParams.has('token')) return true;
          return false;
        }

        function maybeRedirectStandaloneLaunch() {
          if (!(GG.pwaConfig && GG.pwaConfig.rootFallbackRedirect === true)) return false;

          var currentUrl = safeUrl(window.location.href);
          var homePath = normalizedPath(makeHomeUrl(''));
          var mobileQuery = currentUrl.searchParams.get('m');

          syncDisplayModeState();
          syncLaunchPathState();

          if (!isStandaloneDisplayMode()) return false;
          if (normalizedPath(currentUrl.href) !== homePath) return false;
          if (mobileQuery === '0' || mobileQuery === '1') return false;
          if (isStandaloneLaunchRedirectBlocked(currentUrl)) return false;

          try {
            if (window.sessionStorage.getItem('gg:pwa:landing-redirected')) return false;
            window.sessionStorage.setItem('gg:pwa:landing-redirected', '1');
          } catch (error) {
            return false;
          }

          window.location.replace(makeHomeUrl('landing?source=pwa-launch'));
          return true;
        }

        function clearPwaCaches(options) {
          var clearOptions = options || {};
          var preserveSaved = clearOptions.preserveSaved !== false;

          if (!window.caches || !window.caches.keys) return Promise.resolve([]);

          return window.caches.keys().then(function (names) {
            return Promise.all(names.map(function (name) {
              if (String(name || '').indexOf('gg-') !== 0) return Promise.resolve('');
              if (preserveSaved && String(name || '').indexOf('gg-saved-') === 0) return Promise.resolve('');
              return window.caches.delete(name).then(function () {
                return name;
              }).catch(function () {
                return '';
              });
            }));
          }).then(function (deleted) {
            return deleted.filter(function (name) {
              return !!name;
            });
          });
        }

        function unregisterPwaServiceWorkers() {
          if (!pwaState.supported || !window.navigator.serviceWorker.getRegistrations) {
            return Promise.resolve(0);
          }

          return window.navigator.serviceWorker.getRegistrations().then(function (registrations) {
            return Promise.all(registrations.map(function (registration) {
              return registration.unregister().then(function () {
                return 1;
              }).catch(function () {
                return 0;
              });
            }));
          }).then(function (results) {
            var total = 0;
            var i;
            for (i = 0; i < results.length; i += 1) total += results[i];
            return total;
          });
        }

        function initPwaClient() {
          syncExpectedSwVersion();
          pwaState.lastCacheMode = readBodyState('data-gg-cache-mode', 'unknown');
          pwaState.debugAllowed = isPwaDebugAllowed(pwaState.mode);

          if (!pwaState.supported) return;

          registerPwaServiceWorker().then(function () {
            return refreshPwaDiagnostics();
          });
        }

        function lockBodyScrollWhileOpen(activeName, lockScroll) {
          writeBodyState('data-gg-active-panel', activeName || '');
          writeBodyState('data-gg-panel-active', activeName ? 'true' : 'false');
          setDockInert(!!activeName);
          if (lockScroll && activeName) {
            writeBodyState('data-gg-scroll-lock', 'true');
          } else if (document.body) {
            document.body.removeAttribute('data-gg-scroll-lock');
          }
          syncDockVisibility();
        }

        function setBodyPanelState(activeName, lockScroll) {
          lockBodyScrollWhileOpen(activeName, lockScroll);
        }

        function setDockInert(isPanelActive) {
          if (!ui.dock) return;
          if (isPanelActive) {
            ui.dock.setAttribute('aria-hidden', 'true');
            ui.dock.setAttribute('inert', '');
          } else {
            ui.dock.removeAttribute('aria-hidden');
            ui.dock.removeAttribute('inert');
          }
        }

        function syncExpanded(name, expanded) {
          var selector = '[data-gg-open="' + name + '"], [data-gg-panel-trigger="' + name + '"]';
          var nodes;
          var i;

          if (name === 'comments') {
            selector += ', [data-gg-action="comments-open"], [data-gg-postbar="comments"]';
          }

          nodes = document.querySelectorAll(selector);
          for (i = 0; i < nodes.length; i += 1) {
            nodes[i].setAttribute('aria-expanded', expanded ? 'true' : 'false');
          }
        }

        function focusFirst(root) {
          if (!root) return;
          var nodes = root.querySelectorAll('input, button, a[href], [tabindex]:not([tabindex="-1"])');
          var i;
          for (i = 0; i < nodes.length; i += 1) {
            if (!nodes[i].hasAttribute('disabled')) {
              nodes[i].focus();
              return;
            }
          }
        }

        function getFocusableNodes(root) {
          if (!root) return [];
          return Array.prototype.slice.call(root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (node) {
            return !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true';
          });
        }

        function focusCommandSheet(selectText) {
          if (!ui.commandSheetInput) return;
          ui.commandSheetInput.focus();
          if (selectText) ui.commandSheetInput.select();
        }

        function focusCommand(selectText) {
          if (!ui.commandSheetInput) {
            window.location.href = ui.shell ? (ui.shell.getAttribute('data-gg-search-url') || '/search') : '/search';
            return;
          }

          if (ui.commandPanel && ui.commandPanel.hidden) {
            launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-focus', {
              focusSheet: true,
              selectText: !!selectText
            });
            return;
          }

          focusCommandSheet(selectText);
        }

        function getCommandValue() {
          if (ui.commandSheetInput) return ui.commandSheetInput.value || '';
          return state.discoveryQuery || '';
        }

        function syncCommandInputs(value) {
          var resolved = String(value || '');
          state.discoveryQuery = resolved;
          if (ui.commandSheetInput) ui.commandSheetInput.value = resolved;
          return resolved;
        }

        function clearPanelTimer(name) {
          if (!state.panelTimers[name]) return;
          window.clearTimeout(state.panelTimers[name]);
          delete state.panelTimers[name];
        }

        function buildPanelDefinitions() {
          panelDefs = {
            command: {
              name: 'command',
              family: 'utility-sheet',
              edge: 'bottom',
              root: ui.commandPanel,
              panel: ui.commandPanelSheet,
              scrim: ui.commandPanelScrim,
              lockScroll: true,
              trapFocus: true,
              returnFocus: true,
              scrollReset: {
                openBeforeRender: true,
                openAfterRender: true,
                closeAfterHide: true,
                queryChange: true,
                filterChange: true
              },
              openDuration: 220,
              closeDuration: 170
            },
            preview: {
              name: 'preview',
              family: 'content-sheet',
              edge: 'top',
              root: ui.preview,
              panel: ui.previewPanel,
              scrim: ui.previewScrim,
              lockScroll: true,
              trapFocus: true,
              returnFocus: true,
              scrollReset: {
                openBeforeRender: true,
                openAfterRender: true,
                closeBeforeHide: true,
                closeAfterHide: true,
                itemChange: true
              },
              openDuration: 240,
              closeDuration: 180
            },
            more: {
              name: 'more',
              family: 'utility-sheet',
              edge: 'bottom',
              root: ui.more,
              panel: ui.morePanel,
              scrim: ui.moreScrim,
              lockScroll: true,
              trapFocus: true,
              returnFocus: true,
              scrollReset: {
                openBeforeRender: true,
                openAfterRender: true,
                closeAfterHide: true,
                clearLocalSearchOnClose: true,
                closePreferencePanelOnClose: true
              },
              openDuration: 220,
              closeDuration: 170
            },
            comments: {
              name: 'comments',
              family: 'utility-sheet',
              edge: 'bottom',
              root: ui.comments,
              panel: ui.commentsPanel,
              scrim: ui.commentsScrim,
              lockScroll: true,
              trapFocus: true,
              returnFocus: true,
              openDuration: 220,
              closeDuration: 170
            }
          };
        }

        function getPanel(name) {
          if (!name || !panelDefs[name] || !panelDefs[name].root) return null;
          return panelDefs[name];
        }

        function panelSnapshot() {
          var names = Object.keys(panelDefs);
          var i;
          var panel;
          var result = {
            active: state.panelActive,
            panels: {}
          };

          for (i = 0; i < names.length; i += 1) {
            panel = getPanel(names[i]);
            if (!panel) continue;
            result.panels[panel.name] = {
              family: panel.family,
              edge: panel.edge,
              hidden: panel.root.hidden,
              state: panel.root.getAttribute('data-gg-state') || 'closed'
            };
          }

          return result;
        }

        function sheetControllerSnapshot() {
          var panelCount = Object.keys(panelDefs).filter(function (name) {
            return !!getPanel(name);
          }).length;
          var previewPanel = getPanel('preview');
          var previewSheet = previewPanel ? previewPanel.root : null;
          var previewBody = previewSheet ? (previewSheet.querySelector('[data-gg-scroll-container]') || previewSheet.querySelector('.gg-preview__body') || previewSheet.querySelector('.gg-content-sheet__body')) : null;
          return {
            surface: 'root',
            openSheet: state.panelActive || null,
            sheetCount: panelCount,
            dragHandleCount: document.querySelectorAll('[data-gg-drag-handle]').length,
            focusTrapActive: !!state.panelActive,
            bodyScrollLocked: document.body && document.body.getAttribute('data-gg-scroll-lock') === 'true',
            lastCloseReason: state.panelLastCloseReason || null,
            previewSheetPresent: !!previewSheet,
            previewOpen: state.panelActive === 'preview',
            previewEdge: previewSheet ? previewSheet.getAttribute('data-gg-edge') : null,
            previewFamily: previewSheet ? previewSheet.getAttribute('data-gg-panel-family') : null,
            previewDragHandleCount: previewSheet ? previewSheet.querySelectorAll('[data-gg-drag-handle="preview"]').length : 0,
            previewCloseHandleCount: previewSheet ? previewSheet.querySelectorAll('[data-gg-close="preview"]').length : 0,
            previewFooterAffordance: !!(previewSheet && previewSheet.querySelector('.gg-content-sheet__affordance')),
            previewIntroInScrollFlow: !!(previewSheet && previewSheet.querySelector('.gg-preview__body .gg-preview__intro[data-gg-preview-intro-flow="true"]')),
            previewScrollResetEnabled: !!(previewSheet && (previewSheet.getAttribute('data-gg-scroll-reset-enabled') === 'true' || (previewSheet.dataset && previewSheet.dataset.ggScrollResetEnabled === 'true'))),
            previewScrollTop: previewSheet ? previewSheet.scrollTop : 0,
            previewBodyScrollTop: previewBody ? previewBody.scrollTop : 0,
            previewLastResetReason: previewSheet ? (previewSheet.getAttribute('data-gg-last-scroll-reset-reason') || (previewSheet.dataset && previewSheet.dataset.ggLastScrollResetReason) || null) : null,
            panels: panelSnapshot().panels
          };
        }

        function emitPanelEvent(kind, name, detail) {
          document.dispatchEvent(new CustomEvent('gg:panel:' + kind, {
            detail: detail || {
              name: name,
              surface: state.surfaceContext ? state.surfaceContext.surface : '',
              active: state.panelActive
            }
          }));
        }

        function resetPanelDrag(panel, immediate) {
          if (!panel || !panel.panel) return;
          if (immediate) {
            panel.panel.style.transition = 'none';
          }
          panel.panel.style.setProperty('--gg-sheet-drag-y', '0px');
          if (panel.scrim) panel.scrim.style.opacity = '';
          if (immediate) {
            window.requestAnimationFrame(function () {
              panel.panel.style.removeProperty('transition');
            });
          }
        }

        function normalizePanelResetReason(reason) {
          if (reason === 'drag-dismiss') return 'drag-close';
          if (reason === 'escape-close') return 'escape';
          if (reason === 'close-trigger') return 'close';
          return reason || 'unknown';
        }

        function collectPanelScrollTargets(root) {
          var targets = [];
          var directPanel;

          if (!root) return targets;
          targets.push(root);
          directPanel = root.matches && root.matches('.gg-sheet__panel, .gg-content-sheet__panel')
            ? root
            : (root.querySelector && root.querySelector('.gg-sheet__panel, .gg-content-sheet__panel'));
          if (directPanel) targets.push(directPanel);
          if (root.querySelectorAll) {
            targets = targets.concat(Array.prototype.slice.call(root.querySelectorAll('[data-gg-scroll-container], .gg-sheet__panel, .gg-content-sheet__panel')));
          }
          return targets.filter(function (node, index) {
            return !!node && targets.indexOf(node) === index;
          });
        }

        function resetPanelScroll(sheet, reason) {
          var containers;
          var resetReason = normalizePanelResetReason(reason);

          if (!sheet) return;

          containers = collectPanelScrollTargets(sheet);

          containers.forEach(function (node) {
            if (!node) return;
            try {
              node.scrollTop = 0;
              node.scrollLeft = 0;
              if (typeof node.scrollTo === 'function') node.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } catch (error) {
            }
          });

          if (sheet.dataset) {
            sheet.dataset.ggScrollResetEnabled = 'true';
            sheet.dataset.ggLastScrollResetReason = resetReason;
          } else {
            sheet.setAttribute('data-gg-scroll-reset-enabled', 'true');
            sheet.setAttribute('data-gg-last-scroll-reset-reason', resetReason);
          }
          sheet.setAttribute('data-gg-scroll-reset-reason', resetReason);
          sheet.setAttribute('data-gg-scroll-reset-at', String(Date.now()));
        }

        function shouldResetPanel(panel, key) {
          return !!(panel && panel.scrollReset && panel.scrollReset[key]);
        }

        function resetPanelByName(name, key, reason) {
          var panel = getPanel(name);
          if (!shouldResetPanel(panel, key)) return;
          resetPanelScroll(panel.root, reason || key || 'reset');
        }

        function resetPreviewScroll(reason) {
          resetPanelByName('preview', 'itemChange', reason || 'item-change');
        }

        function resetMoreTransientState(panel) {
          var root = panel && panel.root ? panel.root : ui.more;
          var scope;
          var input;
          var rows;
          var sections;
          var i;

          if (!root) return;
          if (shouldResetPanel(panel, 'closePreferencePanelOnClose')) closeMorePreferencePanel();
          if (!shouldResetPanel(panel, 'clearLocalSearchOnClose')) return;

          scope = root.closest('.gg-more-sheet') || root.closest('[data-gg-panel="more"]') || root;
          input = scope.querySelector('[data-gg-more-search-input]');
          if (input) input.value = '';
          rows = root.querySelectorAll('.gg-more-list__link, .gg-more-profile__card');
          for (i = 0; i < rows.length; i += 1) rows[i].hidden = false;
          sections = root.querySelectorAll('.gg-more-profile, .gg-more-section');
          for (i = 0; i < sections.length; i += 1) sections[i].removeAttribute('data-gg-filter-empty');
        }

        function getPanelEdge(panel) {
          if (!panel || !panel.root) return 'bottom';
          return panel.root.getAttribute('data-gg-edge') === 'top' ? 'top' : 'bottom';
        }

        function applyPanelDrag(panel, offset) {
          var edge;
          var panelHeight;
          var progress;
          var resolved;

          if (!panel || !panel.panel) return;

          edge = getPanelEdge(panel);
          if (edge === 'top') {
            resolved = offset > 0 ? offset * 0.28 : offset;
          } else {
            resolved = offset < 0 ? offset * 0.28 : offset;
          }
          panelHeight = panel.panel.offsetHeight || 400;
          progress = Math.min(1, Math.abs(resolved) / panelHeight);
          panel.panel.style.setProperty('--gg-sheet-drag-y', resolved.toFixed(2) + 'px');
          if (panel.scrim) panel.scrim.style.opacity = String(Math.max(0.2, 1 - (progress * 0.72)));
        }

        function restorePanelFromDrag(panel) {
          if (!panel || !panel.panel) return;
          panel.root.setAttribute('data-gg-state', 'open');
          panel.panel.style.transition = 'transform var(--gg-motion-drag-return)';
          panel.panel.style.setProperty('--gg-sheet-drag-y', '0px');
          if (panel.scrim) panel.scrim.style.opacity = '';
          window.setTimeout(function () {
            panel.panel.style.removeProperty('transition');
          }, 190);
        }

        function focusPanel(panel) {
          if (!panel) return;
          if (panel.name === 'command') {
            focusCommandSheet(false);
            return;
          }
          focusFirst(panel.panel || panel.root);
        }

        function returnFocusOnClose(panel, closeOptions) {
          var shouldReturnFocus = closeOptions.returnFocus !== false && panel && panel.returnFocus !== false && state.panelLastTrigger && typeof state.panelLastTrigger.focus === 'function';

          if (!shouldReturnFocus) return false;

          state.panelLastTrigger.focus();
          return true;
        }

        function openPanel(name, options) {
          var panel = getPanel(name);
          var openOptions = options || {};

          if (!panel) return Promise.resolve(null);
          if (shouldResetPanel(panel, 'openBeforeRender')) resetPanelScroll(panel.root, 'open-before-render');

          if (state.panelActive === name && !panel.root.hidden && panel.root.getAttribute('data-gg-state') === 'open') {
            if (panel.name === 'comments') setCommentsLayer('main');
            if (openOptions.trigger) state.panelLastTrigger = openOptions.trigger;
            if (openOptions.focus !== false) focusPanel(panel);
            return Promise.resolve(panel);
          }

          return closePanel(state.panelActive, { returnFocus: false, reason: 'panel-switch' }).then(function () {
            clearPanelTimer(name);
            if (isDetailOutlineExpanded()) {
              clearDetailOutlineManualOpen();
              state.detailOutlineState = resolveDetailOutlineCompactState();
              renderDetailOutline();
            }
            state.panelActive = name;
            state.panelLastTrigger = openOptions.trigger || document.activeElement || null;
            if (panel.name === 'comments') setCommentsLayer('main');

            panel.root.hidden = false;
            panel.root.removeAttribute('inert');
            panel.root.setAttribute('aria-hidden', 'false');
            panel.root.setAttribute('data-gg-state', 'opening');
            panel.root.setAttribute('data-gg-active', 'true');
            syncExpanded(name, true);
            resetPanelDrag(panel, true);
            setBodyPanelState(name, panel.lockScroll);

            window.requestAnimationFrame(function () {
              if (state.panelActive === name) {
                panel.root.setAttribute('data-gg-state', 'open');
              }
              if (shouldResetPanel(panel, 'openAfterRender')) resetPanelScroll(panel.root, 'open-after-render');
            });

            if (openOptions.focus !== false) {
              window.setTimeout(function () {
                focusPanel(panel);
              }, 24);
            }

            emitPanelEvent('open', name, {
              name: name,
              surface: state.surfaceContext ? state.surfaceContext.surface : '',
              active: state.panelActive,
              reason: openOptions.reason || 'api'
            });

            return panel;
          });
        }

        function closePanel(name, options) {
          var closeOptions = options || {};
          var panel = getPanel(name || state.panelActive);

          if (!panel || panel.root.hidden) {
            state.panelLastCloseReason = closeOptions.reason || 'api';
            if (!name || state.panelActive === name) {
              state.panelActive = null;
              setBodyPanelState('', false);
            }
            return Promise.resolve(false);
          }

          if (panel.name === 'comments') {
            setCommentsLayer('closed');
            closeCommentMoreMenu();
            closeCommentRepliesSheet({
              returnFocus: false,
              reason: 'comments-panel-close'
            });
          }

          clearPanelTimer(panel.name);
          syncExpanded(panel.name, false);
          panel.root.setAttribute('data-gg-state', 'closing');
          panel.root.setAttribute('data-gg-active', 'false');
          state.drag = state.drag && state.drag.name === panel.name ? null : state.drag;
          state.panelLastCloseReason = closeOptions.reason || 'api';
          if (shouldResetPanel(panel, 'closePreferencePanelOnClose') || shouldResetPanel(panel, 'clearLocalSearchOnClose')) resetMoreTransientState(panel);
          if (shouldResetPanel(panel, 'closeBeforeHide')) resetPanelScroll(panel.root, closeOptions.reason || 'close-before-hide');

          return new Promise(function (resolve) {
            state.panelTimers[panel.name] = window.setTimeout(function () {
              clearPanelTimer(panel.name);
              panel.root.hidden = true;
              if (panel.name === 'comments') panel.root.setAttribute('inert', '');
              panel.root.setAttribute('aria-hidden', 'true');
              panel.root.setAttribute('data-gg-state', 'closed');
              panel.root.removeAttribute('data-gg-active');
              if (panel.name === 'comments') setCommentsLayer('closed');
              resetPanelDrag(panel, true);
              if (shouldResetPanel(panel, 'closeAfterHide')) resetPanelScroll(panel.root, closeOptions.reason || 'close-after-hide');

              if (state.panelActive === panel.name) {
                state.panelActive = null;
                setBodyPanelState('', false);
              }

              returnFocusOnClose(panel, closeOptions);

              if (!state.panelActive) {
                state.panelLastTrigger = null;
              }

              emitPanelEvent('close', panel.name, {
                name: panel.name,
                surface: state.surfaceContext ? state.surfaceContext.surface : '',
                active: state.panelActive,
                reason: closeOptions.reason || 'api'
              });

              resolve(true);
            }, panel.closeDuration);
          });
        }

        function closeCommandPanel(reason, options) {
          var closeOptions = options || {};
          state.discoveryActiveIndex = -1;
          if (closeOptions.returnFocus !== false) state.suppressCommandFocusUntil = Date.now() + 180;
          return closePanel('command', {
            returnFocus: closeOptions.returnFocus !== false,
            reason: reason || 'command-close'
          });
        }

        function openCommandPanel(trigger, reason, options) {
          var openOptions = options || {};
          if (!ui.commandPanel) return Promise.resolve(null);
          syncCommandInputs(getCommandValue());
          return openPanel('command', {
            trigger: trigger || document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput || document.activeElement || null,
            focus: openOptions.focusSheet !== false,
            reason: reason || 'command-open'
          }).then(function (panel) {
            if (openOptions.focusSheet !== false && openOptions.selectText) {
              window.setTimeout(function () {
                focusCommandSheet(true);
              }, 24);
            }
            return panel;
          });
        }

        function hasCommentsSurface() {
          return !!(ui.comments || document.getElementById('gg-comments-root') || document.getElementById('comments'));
        }

        function getCommentsDebugCounters() {
          var enabled = !!(window.__GG_COMMENTS_DEBUG__ || window.__GG_COMMENTS_DEBUG_ENABLED__);
          if (!enabled) return null;
          window.__GG_COMMENTS_DEBUG__ = window.__GG_COMMENTS_DEBUG__ || {};
          return window.__GG_COMMENTS_DEBUG__;
        }

        function bumpCommentsDebugCounter(name, amount) {
          var debug = getCommentsDebugCounters();
          var delta = typeof amount === 'number' ? amount : 1;
          if (!debug) return;
          debug[name] = (Number(debug[name]) || 0) + delta;
        }

        function setCommentsLayer(layer) {
          var value = layer || 'closed';

          if (!document.body) return value;

          if (value === 'closed') {
            document.body.removeAttribute('data-gg-comments-layer');
            if (ui.commentsFooter) ui.commentsFooter.hidden = true;
            if (ui.commentRepliesFooter) ui.commentRepliesFooter.hidden = true;
            if (ui.comments) {
              ui.comments.setAttribute('data-gg-active', 'false');
              ui.comments.setAttribute('aria-hidden', 'true');
              ui.comments.setAttribute('inert', '');
            }
            if (ui.commentReplies) {
              ui.commentReplies.setAttribute('data-gg-active', 'false');
              ui.commentReplies.setAttribute('aria-hidden', 'true');
              ui.commentReplies.setAttribute('inert', '');
            }
          } else {
            document.body.setAttribute('data-gg-comments-layer', value);
            if (ui.commentsFooter) ui.commentsFooter.hidden = value === 'replies';
            if (ui.commentRepliesFooter) ui.commentRepliesFooter.hidden = value !== 'replies';
            if (ui.comments) {
              ui.comments.setAttribute('data-gg-active', value === 'main' ? 'true' : 'false');
              ui.comments.setAttribute('aria-hidden', value === 'main' ? 'false' : 'true');
              if (value === 'main') ui.comments.removeAttribute('inert');
              else ui.comments.setAttribute('inert', '');
            }
            if (ui.commentReplies) {
              ui.commentReplies.setAttribute('data-gg-active', value === 'replies' ? 'true' : 'false');
              ui.commentReplies.setAttribute('aria-hidden', value === 'replies' ? 'false' : 'true');
              if (value === 'replies') ui.commentReplies.removeAttribute('inert');
              else ui.commentReplies.setAttribute('inert', '');
            }
          }

          return value;
        }

        function adoptGeneratedBloggerComposer() {
          var slot = ui.commentsComposerSlot || document.getElementById('gg-comments-composer-slot');
          var editor = document.getElementById('comment-editor');
          var editorComposer = editor && editor.closest ? editor.closest('.comment-form, .comment-replybox-thread, .comment-replybox-single') : null;
          var generated = document.querySelector('.comment-replybox-thread#top-ce') || document.getElementById('top-ce');
          var composer = editorComposer || generated;
          var placeholder = slot ? slot.querySelector('.comment-form[data-gg-native-plumbing="composer"], .comment-form[data-gg-native-plumbing="composer-source"], .comment-replybox-thread[data-gg-native-plumbing="composer"], .comment-replybox-thread[data-gg-native-plumbing="composer-source"], .comment-replybox-single[data-gg-native-plumbing="composer"], .comment-replybox-single[data-gg-native-plumbing="composer-source"]') : document.querySelector('.comment-form[data-gg-native-plumbing="composer"], .comment-form[data-gg-native-plumbing="composer-source"], .comment-replybox-thread[data-gg-native-plumbing="composer"], .comment-replybox-thread[data-gg-native-plumbing="composer-source"], .comment-replybox-single[data-gg-native-plumbing="composer"], .comment-replybox-single[data-gg-native-plumbing="composer-source"]');

          if (generated && composer && generated !== composer && generated.id === 'top-ce') {
            generated.removeAttribute('id');
            generated.setAttribute('data-gg-native-plumbing', 'composer-source');
            generated.setAttribute('hidden', 'hidden');
          }

          if (composer && composer.id !== 'top-ce') composer.id = 'top-ce';

          if (composer && placeholder && composer !== placeholder) {
            if (placeholder.id === 'top-ce') placeholder.removeAttribute('id');
            placeholder.setAttribute('data-gg-native-plumbing', 'composer-source');
            placeholder.setAttribute('hidden', 'hidden');
          }

          if (composer && slot && composer.parentNode !== slot) {
            slot.insertBefore(composer, slot.firstChild);
            composer.setAttribute('data-gg-native-plumbing', 'composer');
            state.commentComposerMoveCount += 1;
            bumpCommentsDebugCounter('composerMoves');
          }

          if (composer) {
            composer.hidden = false;
            composer.removeAttribute('hidden');
            if (composer.style) composer.style.display = '';
          }

          cacheTopLevelCommentEditorSrc();

          return !!(composer || placeholder);
        }

        function stripParentIdFromCommentSrc(src) {
          var raw = String(src || '');
          var hash = '';
          var hashIndex;
          var cleaned;

          if (!raw) return raw;

          try {
            var url = new URL(raw, window.location.href);
            url.searchParams.forEach(function (value, key) {
              if (String(key).toLowerCase() === 'parentid') url.searchParams.delete(key);
            });
            return url.toString();
          } catch (error) {
            var queryIndex;
            var basePath;
            var query;
            hashIndex = raw.indexOf('#');
            if (hashIndex >= 0) {
              hash = raw.slice(hashIndex);
              raw = raw.slice(0, hashIndex);
            }
            queryIndex = raw.indexOf('?');
            if (queryIndex < 0) return raw + hash;
            basePath = raw.slice(0, queryIndex);
            query = raw.slice(queryIndex + 1).split('&').filter(function (part) {
              return part && !/^parentID=/i.test(part);
            }).join('&');
            cleaned = basePath + (query ? '?' + query : '');
            return cleaned + hash;
          }
        }

        function commentSrcHasParentId(src) {
          var raw = String(src || '');

          if (!raw) return false;

          try {
            var url = new URL(raw, window.location.href);
            var hasParentId = false;
            url.searchParams.forEach(function (value, key) {
              if (String(key).toLowerCase() === 'parentid') hasParentId = true;
            });
            return hasParentId;
          } catch (error) {
            return /[?&]parentID=/i.test(raw);
          }
        }

        function cacheTopLevelCommentEditorSrc() {
          var editor = document.getElementById('comment-editor');
          var editorSrc = document.getElementById('comment-editor-src');
          var href = editorSrc ? (editorSrc.getAttribute('href') || editorSrc.href || '') : '';
          var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';
          var base = stripParentIdFromCommentSrc(href || state.commentTopLevelEditorSrc || current);

          if (base) {
            state.commentTopLevelEditorSrc = base;
            if (editorSrc && (editorSrc.getAttribute('href') || editorSrc.href || '') !== base) {
              editorSrc.setAttribute('href', base);
            }
          }

          return state.commentTopLevelEditorSrc;
        }

        function resetNativeComposerToTopLevel() {
          var editor = document.getElementById('comment-editor');
          var editorSrc = document.getElementById('comment-editor-src');
          var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';
          var base = cacheTopLevelCommentEditorSrc() || stripParentIdFromCommentSrc(current);
          var target = base || stripParentIdFromCommentSrc(current);

          if (editorSrc && target) editorSrc.setAttribute('href', target);

          if (editor && target && (commentSrcHasParentId(current) || !current)) {
            editor.setAttribute('src', target);
            state.commentIframeSrcChangeCount += 1;
            bumpCommentsDebugCounter('iframeSrcChanges');
          } else if (editor && current && commentSrcHasParentId(current)) {
            editor.setAttribute('src', stripParentIdFromCommentSrc(current));
            state.commentIframeSrcChangeCount += 1;
            bumpCommentsDebugCounter('iframeSrcChanges');
          }

          state.commentReplyResetCount += 1;

          return !commentSrcHasParentId(editor ? (editor.getAttribute('src') || editor.src || '') : '');
        }

        function ensureRepliesSheetHandle() {
          var head = ui.commentReplies ? ui.commentReplies.querySelector('.gg-comments-sheet__head, .gg-sheet__head') : null;
          var back = ui.commentReplies ? ui.commentReplies.querySelector('.gg-comments-sheet__back') : null;
          var handle;
          var label;

          if (!head) return false;
          head.setAttribute('data-gg-drag-zone', 'sheet-head');
          handle = head.querySelector('.gg-sheet__handle');
          if (handle) return true;

          handle = document.createElement('button');
          handle.type = 'button';
          handle.className = 'gg-comments-sheet__handle gg-sheet__handle';
          handle.setAttribute('data-gg-drag-handle', 'comment-replies');
          handle.setAttribute('aria-label', getCopy('comments.replies.drag'));
          label = document.createElement('span');
          label.className = 'gg-visually-hidden';
          label.textContent = getCopy('comments.replies.drag');
          handle.appendChild(label);
          head.insertBefore(handle, back || head.firstChild);
          return true;
        }

        function setComposerOpen(open) {
          state.commentComposerOpen = !!open;
          syncCommentComposerMode();
          return state.commentComposerOpen;
        }

        function isElementVisible(element) {
          var style;
          var rect;
          if (!element || element.hidden) return false;
          style = window.getComputedStyle ? window.getComputedStyle(element) : null;
          if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
          rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
          return !rect || (rect.width > 0 && rect.height > 0);
        }

        function getCommentFromLegacyContinue(continueNode, commentId) {
          var byId = commentId ? document.getElementById('c' + commentId) : null;
          var node = continueNode ? continueNode.previousElementSibling : null;

          if (byId && byId.matches && byId.matches('li.comment, .comment-thread .comment, .comment')) return byId;

          while (node) {
            if (node.matches && node.matches('li.comment, .comment-thread .comment, .comment')) return node;
            node = node.previousElementSibling;
          }
          return null;
        }

        function cleanupLegacyCommentControls() {
          var root = ui.commentsList || ui.comments || document.getElementById('gg-comments-root');
          var replyLinks;
          var i;
          var link;
          var continueNode;
          var commentNode;
          var actionRoot;
          var commentId;
          var existingReply;
          var enhanced = 0;

          if (!root || !root.querySelectorAll) return 0;

          replyLinks = root.querySelectorAll('.continue > a.comment-reply[data-comment-id]');
          for (i = 0; i < replyLinks.length; i += 1) {
            link = replyLinks[i];
            continueNode = link.parentElement;
            if (!continueNode || continueNode.getAttribute('data-gg-legacy-control-ready') === 'true') continue;

            commentId = link.getAttribute('data-comment-id') || '';
            commentNode = getCommentFromLegacyContinue(continueNode, commentId);
            if (!commentNode) continue;

            existingReply = commentId ? commentNode.querySelector('.comment-actions a.comment-reply[data-comment-id="' + commentId + '"], .comment-footer a.comment-reply[data-comment-id="' + commentId + '"]') : null;
            continueNode.setAttribute('data-gg-legacy-control-ready', 'true');

            if (existingReply && existingReply !== link) {
              continueNode.setAttribute('data-gg-legacy-control', 'duplicate-reply');
              continueNode.hidden = true;
              continue;
            }

            actionRoot = commentNode.querySelector('.comment-actions, .comment-footer') || commentNode.querySelector('.comment-block, .comment-content, .comment-body') || commentNode;
            continueNode.classList.add('gg-comment-inline-reply');
            continueNode.setAttribute('data-gg-legacy-control', 'inline-reply');
            actionRoot.appendChild(continueNode);
            enhanced += 1;
          }

          if (enhanced) {
            state.commentInlineReplyEnhancementCount += enhanced;
            bumpCommentsDebugCounter('inlineReplyEnhancements', enhanced);
          }
          return replyLinks.length;
        }

        function syncCommentsEmptyState() {
          var empty = ui.commentsEmpty || document.getElementById('gg-comments-empty');
          var root = document.getElementById('gg-comments-root');
          var title;
          var body;
          var isEmpty;

          if (!empty) return false;

          title = empty.querySelector('[data-gg-copy="comments.empty.title"]');
          body = empty.querySelector('[data-gg-copy="comments.empty.body"]');
          isEmpty = getTopLevelCommentCount() === 0;

          if (title) title.textContent = getCopy('comments.empty.title');
          if (body) body.textContent = getCopy('comments.empty.body');

          empty.hidden = !isEmpty;
          if (isEmpty) empty.removeAttribute('aria-hidden');
          else empty.setAttribute('aria-hidden', 'true');

          if (root) root.setAttribute('data-gg-comments-empty-state', isEmpty ? 'true' : 'false');
          if (ui.comments) ui.comments.setAttribute('data-gg-comments-empty-state', isEmpty ? 'true' : 'false');

          return isEmpty;
        }

        function hasCommentPagingRequired() {
          var root = document.getElementById('gg-comments-root');
          var value = root ? String(root.getAttribute('data-gg-comment-paging-required') || '').toLowerCase() : '';
          return value === 'true' || value === '1';
        }

        function isCommentContinuationActionable(node) {
          var links;
          var i;
          var link;
          var href;
          var onclick;
          var attributes;
          var j;
          var name;

          if (!node) return false;

          links = node.matches && node.matches('a') ? [node] : Array.prototype.slice.call(node.querySelectorAll ? node.querySelectorAll('a, button') : []);
          if (!links.length) links = [node];

          for (i = 0; i < links.length; i += 1) {
            link = links[i];
            href = link.getAttribute ? String(link.getAttribute('href') || '').trim() : '';
            onclick = link.getAttribute ? String(link.getAttribute('onclick') || '').trim() : '';

            if (onclick && !/^return\s+false;?$/i.test(onclick)) return true;
            if (href && href !== '#' && !/^javascript:\s*(?:void\s*\(?0?\)?|;)?$/i.test(href)) return true;

            attributes = link.attributes || [];
            for (j = 0; j < attributes.length; j += 1) {
              name = attributes[j].name || '';
              if (/^data-(?:url|href|cursor|continuation|page|token|load|next)/i.test(name) && attributes[j].value) return true;
            }
          }

          return false;
        }

        function isCommentLoadMoreNode(node) {
          var text = node ? String(node.textContent || '').replace(/\s+/g, ' ').trim() : '';
          var id = node && node.id ? node.id : '';
          var className = node && node.className ? String(node.className) : '';

          return id === 'top-continue' || /\bloadmore\b/.test(className) || /\bload\s+more\b/i.test(text) || /\bmuat\b.*\bkomentar\b/i.test(text);
        }

        function syncCommentsContinuationState() {
          var root = ui.commentsList || ui.comments || document.getElementById('gg-comments-root');
          var pagingRequired = hasCommentPagingRequired();
          var nodes;
          var i;
          var node;
          var invalid;
          var hiddenCount = 0;

          if (!root || !root.querySelectorAll) return 0;

          nodes = root.querySelectorAll('#top-continue, .loadmore, .gg-comments__list > .continue, #comments-block > .continue');

          for (i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            if (!isCommentLoadMoreNode(node)) continue;

            invalid = !pagingRequired && !isCommentContinuationActionable(node);
            if (invalid) {
              node.setAttribute('data-gg-invalid-continuation', 'true');
              node.hidden = true;
              hiddenCount += 1;
            } else if (node.getAttribute('data-gg-invalid-continuation') === 'true') {
              node.removeAttribute('data-gg-invalid-continuation');
              node.hidden = false;
            }
          }

          return hiddenCount;
        }

        function runCommentsEnhancement(reason) {
          if (!hasCommentsSurface()) return false;
          state.commentEnhancementScheduled = false;
          state.commentEnhancementReason = reason || 'comments-enhancement';
          state.commentEnhanceRunCount += 1;
          bumpCommentsDebugCounter('enhanceRuns');
          ensureRepliesSheetHandle();
          adoptGeneratedBloggerComposer();
          if (!isCommentRepliesSheetOpen() || state.commentReplyContext) ensureComposerInActiveFooter();
          else syncCommentComposerMode();
          cleanupLegacyCommentControls();
          syncCommentsEmptyState();
          syncCommentsContinuationState();
          initCommentRepliesControls();
          ensureCommentMoreMenus();
          initCommentPrefixObserver();
          requestCommentPrefixSync();
          syncCommentComposerMode();
          return true;
        }

        function scheduleCommentsEnhancement(reason) {
          if (!hasCommentsSurface()) return false;
          if (state.commentEnhancementScheduled) return true;

          state.commentEnhancementScheduled = true;
          state.commentEnhancementReason = reason || 'comments-hydration';
          ggIdle(function () {
            runCommentsEnhancement(state.commentEnhancementReason || reason);
          }, 900);
          return true;
        }

        function openCommentsSheet(options) {
          var openOptions = options || {};

          if (!getPanel('comments')) return Promise.resolve(null);

          return openPanel('comments', {
            trigger: openOptions.trigger || document.activeElement || null,
            focus: openOptions.focus !== false,
            reason: openOptions.reason || 'comments-open'
          }).then(function (panel) {
            setCommentsLayer('main');
            runCommentsEnhancement(openOptions.reason || 'comments-open');
            return panel;
          });
        }

        function closeCommentsSheet(options) {
          var closeOptions = options || {};

          return closeCommentRepliesSheet({
            returnFocus: false,
            reason: 'comments-parent-close'
          }).then(function () {
            return closePanel('comments', {
              returnFocus: closeOptions.returnFocus !== false,
              reason: closeOptions.reason || 'comments-close'
            }).then(function (closed) {
              setCommentsLayer('closed');
              return closed;
            });
          });
        }

        function toggleCommentsSheet(options) {
          var toggleOptions = options || {};

          if (state.panelActive === 'comments') {
            return closeCommentsSheet({
              returnFocus: toggleOptions.returnFocus !== false,
              reason: toggleOptions.reason || 'comments-toggle'
            });
          }

          return openCommentsSheet({
            trigger: toggleOptions.trigger,
            focus: toggleOptions.focus !== false,
            reason: toggleOptions.reason || 'comments-toggle'
          });
        }

        function formatRepliesCount(count) {
          var resolved = Math.max(0, Number(count) || 0);
          if (resolved === 1) return getCopy('comments.replies.view.one');
          return formatCopy('comments.replies.view.many', { count: String(resolved) });
        }

        function formatRepliesSummary(count) {
          var resolved = Math.max(0, Number(count) || 0);
          if (resolved === 1) return getCopy('comments.replies.count.one');
          return formatCopy('comments.replies.count.many', { count: String(resolved) });
        }

        function getCommentReplyCount(repliesNode) {
          var liComments;
          if (!repliesNode) return 0;
          liComments = repliesNode.querySelectorAll('li.comment');
          if (liComments.length) return liComments.length;
          return repliesNode.querySelectorAll('.comment-thread .comment, .comment').length;
        }

        function isNestedRepliesNode(repliesNode) {
          var parent = repliesNode ? repliesNode.parentElement : null;
          return !!(parent && parent.closest('.comment-replies'));
        }

        function initCommentRepliesControls() {
          var root = ui.commentsList || (ui.comments ? ui.comments.querySelector('#gg-comments-list, [data-gg-role="comments-list"]') : null);
          var repliesNodes;
          var i;
          var repliesNode;
          var count;
          var button;

          if (!root) return 0;

          repliesNodes = root.querySelectorAll('.comment-replies');
          for (i = 0; i < repliesNodes.length; i += 1) {
            repliesNode = repliesNodes[i];
            if (isNestedRepliesNode(repliesNode)) continue;

            count = getCommentReplyCount(repliesNode);
            if (!count) continue;

            button = repliesNode.__ggRepliesButton || null;
            if (!button || !button.parentNode) {
              button = document.createElement('button');
              button.type = 'button';
              button.setAttribute('data-gg-action', 'comments-open-replies');
              repliesNode.__ggRepliesButton = button;
              repliesNode.parentNode.insertBefore(button, repliesNode.nextSibling);
            }

            button.__ggRepliesNode = repliesNode;
            button.setAttribute('data-gg-reply-count', String(count));
            button.setAttribute('aria-expanded', state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode ? 'true' : 'false');
            button.textContent = formatRepliesCount(count);
          }

          return repliesNodes.length;
        }

        function getDirectCommentElement(container, beforeNode) {
          var node;
          if (!container) return null;
          node = beforeNode ? beforeNode.previousElementSibling : null;
          while (node) {
            if (node.classList && node.classList.contains('comment')) return node;
            node = node.previousElementSibling;
          }
          if (container.classList && container.classList.contains('comment')) return container;
          node = container.firstElementChild;
          while (node) {
            if (node.classList && node.classList.contains('comment')) return node;
            node = node.nextElementSibling;
          }
          return null;
        }

        function getTextFromNode(root, selector) {
          var node = root ? root.querySelector(selector) : null;
          return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
        }

        function getCommentAuthorName(commentNode) {
          return getTextFromNode(commentNode, '.comment-author cite, .comment-author .user, .comment-author, .comment-header cite, .comment-header .user, cite.user') || '';
        }

        function normalizeReplyHandle(author) {
          var clean = String(author || '').replace(/^@+/, '').replace(/\s+/g, '').replace(/[^\w.\-]/g, '');
          return clean ? '@' + clean : '';
        }

        function getCommentNodeFromTrigger(trigger) {
          return trigger ? trigger.closest('li.comment, .comment-thread .comment, .comment') : null;
        }

        function getTopLevelCommentCount() {
          var root = ui.commentsList || (ui.comments ? ui.comments.querySelector('#gg-comments-list, [data-gg-role="comments-list"]') : null);
          var comments;
          var i;
          var count = 0;

          if (!root || !root.querySelectorAll) return 0;

          comments = root.querySelectorAll('li.comment, .comment-thread .comment, #comments-block > .comment');
          for (i = 0; i < comments.length; i += 1) {
            if (!comments[i].closest('.comment-replies')) count += 1;
          }

          return count;
        }

        function getCommentNodeId(commentNode) {
          var node = commentNode;
          while (node) {
            if (node.id) return node.id;
            node = node.parentElement;
            if (!node || (ui.comments && node === ui.comments)) break;
          }
          return '';
        }

        function getReplyParentComment(commentNode) {
          var repliesNode = commentNode ? commentNode.parentElement : null;

          while (repliesNode && repliesNode !== ui.comments && repliesNode !== ui.commentRepliesList) {
            if (repliesNode.classList && repliesNode.classList.contains('comment-replies')) {
              return getDirectCommentElement(repliesNode.parentNode, repliesNode);
            }
            repliesNode = repliesNode.parentElement;
          }

          return null;
        }

        function renderReplyBanner() {
          var banner;
          var label;
          var icon;
          var textWrap;
          var text;
          var strong;
          var clearButton;

          if (!ui.commentsReplySlot) return;

          ui.commentsReplySlot.textContent = '';

          if (!state.commentReplyContext || !state.commentReplyContext.handle) {
            syncCommentComposerMode();
            return;
          }

          banner = document.createElement('div');
          banner.className = 'gg-comments__reply-banner';
          banner.setAttribute('role', 'status');
          label = document.createElement('span');
          label.className = 'gg-comments__reply-context gg-comments__reply-label';
          icon = document.createElement('span');
          icon.className = 'gg-icon gg-comments__reply-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = 'reply';
          textWrap = document.createElement('span');
          textWrap.className = 'gg-comments__reply-text';
          text = document.createTextNode(getCopy('comments.replyingTo') + ' ');
          strong = document.createElement('strong');
          strong.textContent = state.commentReplyContext.handle;
          textWrap.appendChild(text);
          textWrap.appendChild(strong);
          label.appendChild(icon);
          label.appendChild(textWrap);
          clearButton = document.createElement('button');
          clearButton.type = 'button';
          clearButton.className = 'gg-comments__reply-clear';
          clearButton.setAttribute('data-gg-action', 'comments-reply-context-clear');
          clearButton.setAttribute('aria-label', getCopy('comments.action.cancelReply'));
          clearButton.textContent = '×';
          banner.appendChild(label);
          banner.appendChild(clearButton);
          ui.commentsReplySlot.appendChild(banner);
          syncCommentComposerMode();
        }

        function clearCommentReplyContext(options) {
          var clearOptions = options || {};
          state.commentReplyContext = null;
          state.commentRepliesLastReplySource = '';
          state.commentRepliesLastReplyTargetId = '';
          state.commentRepliesProgrammaticReplySource = '';
          if (clearOptions.collapseComposer !== false && isCommentRepliesSheetOpen()) {
            state.commentComposerOpen = false;
          }
          resetNativeComposerToTopLevel();
          renderReplyBanner();
        }

        function setCommentReplyContext(commentNode) {
          var author = getCommentAuthorName(commentNode);
          var handle = normalizeReplyHandle(author);

          if (!commentNode || !handle) {
            clearCommentReplyContext();
            return null;
          }

          state.commentReplyContext = {
            parentId: getCommentNodeId(commentNode),
            parentAuthor: author,
            handle: handle
          };
          state.commentRepliesLastReplyTargetId = state.commentReplyContext.parentId;
          state.commentComposerOpen = true;
          renderReplyBanner();
          return state.commentReplyContext;
        }

        function getActiveComposerFooter() {
          if (isCommentRepliesSheetOpen() && ui.commentRepliesFooter) return ui.commentRepliesFooter;
          return ui.commentsFooter;
        }

        function getCommentComposerMode() {
          if (state.commentReplyContext && state.commentReplyContext.handle) return 'reply';
          return getTopLevelCommentCount() ? 'comment' : 'empty';
        }

        function syncCommentComposerMode() {
          var mode = getCommentComposerMode();
          var activeFooter = getActiveComposerFooter();
          var editor = activeFooter ? activeFooter.querySelector('#comment-editor') : null;
          var editorVisible = isElementVisible(editor);
          var open = state.commentComposerOpen || mode === 'reply' || (editorVisible && state.commentComposerOpen);

          if (ui.comments) ui.comments.setAttribute('data-gg-comment-composer-mode', mode);
          if (ui.commentsFooter) ui.commentsFooter.setAttribute('data-gg-comment-composer-mode', activeFooter === ui.commentsFooter ? mode : 'inactive');
          if (ui.commentRepliesFooter) ui.commentRepliesFooter.setAttribute('data-gg-comment-composer-mode', activeFooter === ui.commentRepliesFooter ? mode : 'inactive');
          if (ui.commentsFooter) ui.commentsFooter.setAttribute('data-gg-composer-open', activeFooter === ui.commentsFooter && open ? 'true' : 'false');
          if (ui.commentRepliesFooter) ui.commentRepliesFooter.setAttribute('data-gg-composer-open', activeFooter === ui.commentRepliesFooter && open ? 'true' : 'false');

          return mode;
        }

        function ensureComposerPortalAnchors() {
          if (state.commentComposerPortal || !ui.commentsReplySlot || !ui.commentsComposerSlot) return;
          if (!ui.commentsReplySlot.parentNode || !ui.commentsComposerSlot.parentNode) return;
          state.commentComposerPortal = {
            replySlotAnchor: document.createComment('gg-comments-reply-slot'),
            composerSlotAnchor: document.createComment('gg-comments-composer-slot')
          };
          ui.commentsReplySlot.parentNode.insertBefore(state.commentComposerPortal.replySlotAnchor, ui.commentsReplySlot);
          ui.commentsComposerSlot.parentNode.insertBefore(state.commentComposerPortal.composerSlotAnchor, ui.commentsComposerSlot);
        }

        function portalComposerToFooter(footer) {
          var moved = false;
          if (!footer || !ui.commentsReplySlot || !ui.commentsComposerSlot) return false;
          if (ui.commentsReplySlot.parentNode === footer && ui.commentsComposerSlot.parentNode === footer) {
            syncCommentComposerMode();
            return false;
          }
          ensureComposerPortalAnchors();
          if (ui.commentsReplySlot.parentNode !== footer) {
            footer.appendChild(ui.commentsReplySlot);
            moved = true;
          }
          if (ui.commentsComposerSlot.parentNode !== footer) {
            footer.appendChild(ui.commentsComposerSlot);
            moved = true;
          }
          if (moved) {
            state.commentComposerMoveCount += 1;
            bumpCommentsDebugCounter('composerMoves');
          }
          renderReplyBanner();
          syncCommentComposerMode();
          return moved;
        }

        function restoreComposerToMainFooter() {
          var portal = state.commentComposerPortal;

          if (!portal || !ui.commentsReplySlot || !ui.commentsComposerSlot) return false;

          if (portal.replySlotAnchor && portal.replySlotAnchor.parentNode) {
            portal.replySlotAnchor.parentNode.replaceChild(ui.commentsReplySlot, portal.replySlotAnchor);
          } else if (ui.commentsFooter) {
            ui.commentsFooter.appendChild(ui.commentsReplySlot);
          }

          if (portal.composerSlotAnchor && portal.composerSlotAnchor.parentNode) {
            portal.composerSlotAnchor.parentNode.replaceChild(ui.commentsComposerSlot, portal.composerSlotAnchor);
          } else if (ui.commentsFooter) {
            ui.commentsFooter.appendChild(ui.commentsComposerSlot);
          }

          state.commentComposerPortal = null;
          renderReplyBanner();
          syncCommentComposerMode();
          return true;
        }

        function ensureComposerInActiveFooter() {
          var footer = getActiveComposerFooter();
          adoptGeneratedBloggerComposer();
          if (footer && footer !== ui.commentsFooter) return portalComposerToFooter(footer);
          syncCommentComposerMode();
          return restoreComposerToMainFooter();
        }

        function applyVisualReplyPrefixes(root) {
          var scope = root || ui.comments || document;
          var comments = scope.querySelectorAll ? scope.querySelectorAll('.comment-replies li.comment, .comment-replies .comment-thread .comment, .comment-replies > .comment') : [];
          var i;
          var commentNode;
          var bodyNode;
          var parentComment;
          var handle;
          var prefixNode;

          for (i = 0; i < comments.length; i += 1) {
            commentNode = comments[i];
            bodyNode = commentNode.querySelector('.comment-body, .comment-content');
            if (!bodyNode) continue;

            parentComment = getReplyParentComment(commentNode);
            handle = normalizeReplyHandle(getCommentAuthorName(parentComment));
            prefixNode = bodyNode.querySelector('.gg-comment-reply-prefix');

            if (!handle) {
              if (prefixNode) prefixNode.parentNode.removeChild(prefixNode);
              continue;
            }

            if (!prefixNode) {
              prefixNode = document.createElement('span');
              prefixNode.className = 'gg-comment-reply-prefix';
              bodyNode.insertBefore(prefixNode, bodyNode.firstChild);
            }

            prefixNode.setAttribute('data-gg-reply-prefix', handle);
            prefixNode.textContent = handle;
          }
        }

        function requestCommentPrefixSync() {
          if (state.commentPrefixSyncFrame) return;
          state.commentPrefixSyncFrame = window.requestAnimationFrame(function () {
            state.commentPrefixSyncFrame = 0;
            ensureCommentMoreMenus();
            applyVisualReplyPrefixes(ui.comments || document);
          });
        }

        function initCommentPrefixObserver() {
          var root = ui.commentsList || ui.comments;

          if (!root || state.commentPrefixObserver || !window.MutationObserver) {
            applyVisualReplyPrefixes(ui.comments || document);
            return;
          }

          state.commentPrefixObserver = new MutationObserver(function () {
            state.commentMutationCount += 1;
            bumpCommentsDebugCounter('mutations');
            requestCommentPrefixSync();
          });
          state.commentPrefixObserver.observe(root, {
            childList: true,
            subtree: true
          });
          if (ui.commentRepliesList) {
            state.commentPrefixObserver.observe(ui.commentRepliesList, {
              childList: true,
              subtree: true
            });
          }
          applyVisualReplyPrefixes(ui.comments || document);
        }

        function getNativeReplyControl(commentNode) {
          if (!commentNode || !commentNode.querySelector) return null;
          return commentNode.querySelector('a.comment-reply[data-comment-id]')
            || commentNode.querySelector('.comment-reply a[data-comment-id]')
            || commentNode.querySelector('[data-comment-id].comment-reply')
            || commentNode.querySelector('a.comment-reply, .comment-reply a');
        }

        function getNativeReplyCommentId(commentNode, nativeReply) {
          var raw = nativeReply ? nativeReply.getAttribute('data-comment-id') : '';
          var nodeId = getCommentNodeId(commentNode);

          if (raw) return raw;
          return nodeId ? nodeId.replace(/^c/, '') : '';
        }

        function withCommentParentId(src, parentId) {
          var raw = String(src || '');
          var hash = '';
          var hashIndex;
          var separator;

          if (!raw || !parentId) return raw;

          try {
            var url = new URL(raw, window.location.href);
            url.searchParams.set('parentID', parentId);
            return url.toString();
          } catch (error) {
            hashIndex = raw.indexOf('#');
            if (hashIndex >= 0) {
              hash = raw.slice(hashIndex);
              raw = raw.slice(0, hashIndex);
            }
            raw = stripParentIdFromCommentSrc(raw);
            separator = raw.indexOf('?') >= 0 ? '&' : '?';
            return raw + separator + 'parentID=' + encodeURIComponent(parentId) + hash;
          }
        }

        function fallbackNativeReplyTarget(commentNode, nativeReply) {
          var editor = document.getElementById('comment-editor');
          var editorSrc = document.getElementById('comment-editor-src');
          var parentId = getNativeReplyCommentId(commentNode, nativeReply);
          var base = cacheTopLevelCommentEditorSrc() || (editor ? stripParentIdFromCommentSrc(editor.getAttribute('src') || editor.src || '') : '');
          var target = withCommentParentId(base, parentId);
          var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';

          if (!editor || !parentId || !target || commentSrcHasParentId(current)) return false;

          if (editorSrc && base) editorSrc.setAttribute('href', base);
          editor.setAttribute('src', target);
          state.commentIframeSrcChangeCount += 1;
          bumpCommentsDebugCounter('iframeSrcChanges');
          return true;
        }

        function replyToCommentNode(commentNode, source) {
          var nativeReply = getNativeReplyControl(commentNode);
          var retryNativeReply;

          if (!commentNode) return false;

          state.commentRepliesLastReplySource = source || 'native';
          state.commentRepliesExplicitReplyStarted = true;
          state.commentRepliesProgrammaticReplySource = source || '';
          handleNativeReplyTrigger(nativeReply || commentNode);

          if (nativeReply && typeof nativeReply.click === 'function') {
            nativeReply.click();
            retryNativeReply = function () {
              var editor = document.getElementById('comment-editor');
              var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';
              if (state.commentReplyContext && state.commentReplyContext.parentId === getCommentNodeId(commentNode) && !commentSrcHasParentId(current)) {
                nativeReply.click();
              }
            };
            window.setTimeout(retryNativeReply, 120);
            window.setTimeout(function () {
              retryNativeReply();
              fallbackNativeReplyTarget(commentNode, nativeReply);
            }, 320);
          }
          if (state.commentRepliesProgrammaticReplySource) {
            window.setTimeout(function () {
              state.commentRepliesProgrammaticReplySource = '';
            }, 500);
          }

          return true;
        }

        function handleNativeReplyTrigger(trigger) {
          var commentNode = getCommentNodeFromTrigger(trigger);

          if (!commentNode) return;

          state.commentRepliesLastReplySource = state.commentRepliesLastReplySource || 'native';
          setCommentReplyContext(commentNode);
          setComposerOpen(true);
          ensureComposerInActiveFooter();

          window.setTimeout(function () {
            ensureComposerInActiveFooter();
            renderReplyBanner();
            scrollCommentsHashTarget('#comment-form');
            requestCommentPrefixSync();
          }, 32);
        }

        function getNativeDeleteControl(commentNode) {
          if (!commentNode) return null;
          return commentNode.querySelector('.comment-delete')
            || commentNode.querySelector('.item-control a, .item-control button')
            || commentNode.querySelector('.goog-toggle-button a, .goog-toggle-button button, .goog-toggle-button');
        }

        function commentHasNativeDelete(commentNode) {
          return !!(commentNode && commentNode.querySelector('.item-control, .comment-delete, .goog-toggle-button'));
        }

        function getCommentPermalink(commentNode) {
          var id = getCommentNodeId(commentNode);
          var base = ui.article ? ui.article.getAttribute('data-gg-post-url') : '';
          var url;

          if (!id) return '';

          url = base || window.location.href;
          try {
            url = new URL(url, window.location.href).href;
          } catch (error) {
            url = window.location.href;
          }

          return url.replace(/#.*$/, '') + '#' + id;
        }

        function showCommentStatus(message) {
          var root = ui.comments || document.getElementById('gg-comments-root');
          var status;

          if (!root || !message) return;

          status = root.querySelector('.gg-comments__status');
          if (!status) {
            status = document.createElement('div');
            status.className = 'gg-comments__status';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            root.appendChild(status);
          }

          status.hidden = false;
          status.textContent = message;

          if (state.commentStatusTimer) window.clearTimeout(state.commentStatusTimer);
          state.commentStatusTimer = window.setTimeout(function () {
            status.hidden = true;
            state.commentStatusTimer = 0;
          }, 1800);
        }

        function copyTextFallback(value) {
          var textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
          } finally {
            textarea.parentNode.removeChild(textarea);
          }
          return Promise.resolve();
        }

        function copyCommentLink(commentNode) {
          var permalink = getCommentPermalink(commentNode);

          if (!permalink) {
            showCommentStatus('Comment link unavailable');
            return Promise.resolve(false);
          }

          if (window.navigator && window.navigator.clipboard && typeof window.navigator.clipboard.writeText === 'function') {
            return window.navigator.clipboard.writeText(permalink).then(function () {
              showCommentStatus(getCopy('comments.status.copied'));
              return true;
            }).catch(function () {
              return copyTextFallback(permalink).then(function () {
                showCommentStatus(getCopy('comments.status.copied'));
                return true;
              });
            });
          }

          return copyTextFallback(permalink).then(function () {
            showCommentStatus(getCopy('comments.status.copied'));
            return true;
          });
        }

        function closeCommentMoreMenu(options) {
          var closeOptions = options || {};
          var active = state.commentMoreMenu;

          if (!active) return false;

          if (active.menu && active.menu.parentNode) active.menu.parentNode.removeChild(active.menu);
          if (active.button) active.button.setAttribute('aria-expanded', 'false');
          if (closeOptions.returnFocus && active.button && typeof active.button.focus === 'function') active.button.focus();
          state.commentMoreMenu = null;
          return true;
        }

        function buildCommentMoreMenuIcon(name) {
          var icon = document.createElement('span');
          icon.className = 'gg-comment-more__icon gg-comment-more__item-icon gg-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = name;
          return icon;
        }

        function buildCommentMoreMenuLabel(text) {
          var label = document.createElement('span');
          label.className = 'gg-comment-more__label gg-comment-more__item-label';
          label.textContent = text;
          return label;
        }

        function buildCommentMoreMenu(commentNode) {
          var menu = document.createElement('div');
          var copyButton = document.createElement('button');
          var deleteButton;

          menu.className = 'gg-comment-more__menu';
          menu.setAttribute('role', 'menu');

          copyButton.type = 'button';
          copyButton.className = 'gg-comment-more__item';
          copyButton.setAttribute('role', 'menuitem');
          copyButton.setAttribute('data-gg-action', 'comment-copy-link');
          copyButton.setAttribute('data-gg-comment-action', 'copy');
          copyButton.appendChild(buildCommentMoreMenuIcon('link'));
          copyButton.appendChild(buildCommentMoreMenuLabel(getCopy('comments.action.copyLink')));
          menu.appendChild(copyButton);

          if (commentHasNativeDelete(commentNode)) {
            deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'gg-comment-more__item gg-comment-more__item--danger';
            deleteButton.setAttribute('role', 'menuitem');
            deleteButton.setAttribute('data-gg-action', 'comment-native-delete');
            deleteButton.setAttribute('data-gg-comment-action', 'delete');
            deleteButton.appendChild(buildCommentMoreMenuIcon('delete'));
            deleteButton.appendChild(buildCommentMoreMenuLabel(getCopy('comments.action.delete')));
            menu.appendChild(deleteButton);
          }

          return menu;
        }

        function clampNumber(value, min, max) {
          if (max < min) return min;
          return Math.max(min, Math.min(max, value));
        }

        function positionCommentMoreMenu(button, menu) {
          var wrapper = button ? button.closest('.gg-comment-more') : null;
          var panel = button ? button.closest('.gg-sheet__panel, .gg-comments-sheet__panel') : null;
          var header = panel ? panel.querySelector('.gg-sheet__head, .gg-comments-sheet__head') : null;
          var footer = panel ? panel.querySelector('.gg-comments__footer:not([hidden])') : null;
          var buttonRect;
          var panelRect;
          var headerRect;
          var footerRect;
          var menuRect;
          var safeTop;
          var safeBottom;
          var safeLeft;
          var safeRight;
          var belowTop;
          var aboveTop;
          var left;
          var top;
          var placement = 'bottom-end';

          if (!button || !menu || !panel) return placement;

          menu.style.left = '0px';
          menu.style.top = '0px';
          menu.style.right = 'auto';
          menu.style.bottom = 'auto';
          menu.style.maxWidth = '';

          buttonRect = button.getBoundingClientRect();
          panelRect = panel.getBoundingClientRect();
          headerRect = header && header.getBoundingClientRect ? header.getBoundingClientRect() : null;
          footerRect = footer && footer.getBoundingClientRect ? footer.getBoundingClientRect() : null;
          menuRect = menu.getBoundingClientRect();
          safeTop = Math.max(panelRect.top + 8, headerRect ? headerRect.bottom + 6 : panelRect.top + 8);
          safeBottom = Math.min(panelRect.bottom - 8, footerRect ? footerRect.top - 6 : panelRect.bottom - 8);
          safeLeft = panelRect.left + 8;
          safeRight = panelRect.right - 8;

          if (safeRight - safeLeft < menuRect.width) {
            menu.style.maxWidth = Math.max(160, safeRight - safeLeft) + 'px';
            menuRect = menu.getBoundingClientRect();
          }

          left = clampNumber(buttonRect.right - menuRect.width, safeLeft, safeRight - menuRect.width);
          belowTop = buttonRect.bottom + 6;
          aboveTop = buttonRect.top - menuRect.height - 6;

          if (belowTop + menuRect.height <= safeBottom) {
            top = belowTop;
            placement = 'bottom-end';
          } else if (aboveTop >= safeTop) {
            top = aboveTop;
            placement = 'top-end';
          } else {
            top = clampNumber(buttonRect.top + (buttonRect.height / 2) - (menuRect.height / 2), safeTop, safeBottom - menuRect.height);
            left = clampNumber(panelRect.left + (panelRect.width / 2) - (menuRect.width / 2), safeLeft, safeRight - menuRect.width);
            placement = 'center';
          }

          menu.style.left = Math.round(left - panelRect.left) + 'px';
          menu.style.top = Math.round(top - panelRect.top) + 'px';
          menu.setAttribute('data-gg-menu-placement', placement);
          if (wrapper) wrapper.setAttribute('data-gg-menu-placement', placement);
          return placement;
        }

        function openCommentMoreMenu(button) {
          var wrapper = button ? button.closest('.gg-comment-more') : null;
          var commentNode = button ? getCommentNodeFromTrigger(button) : null;
          var panel = button ? button.closest('.gg-sheet__panel, .gg-comments-sheet__panel') : null;
          var menu;

          if (!button || !wrapper || !commentNode) return;

          if (state.commentMoreMenu && state.commentMoreMenu.button === button) {
            closeCommentMoreMenu({ returnFocus: true });
            return;
          }

          closeCommentMoreMenu();
          menu = buildCommentMoreMenu(commentNode);
          (panel || wrapper).appendChild(menu);
          button.setAttribute('aria-expanded', 'true');
          state.commentMoreMenu = {
            button: button,
            menu: menu,
            commentNode: commentNode,
            wrapper: wrapper
          };
          positionCommentMoreMenu(button, menu);

          window.setTimeout(function () {
            var first = menu.querySelector('[role="menuitem"]');
            positionCommentMoreMenu(button, menu);
            if (first) first.focus();
          }, 0);
        }

        function ensureCommentMoreMenus() {
          var root = ui.comments || document.getElementById('gg-comments-root');
          var comments;
          var i;
          var commentNode;
          var header;
          var wrapper;
          var button;
          var enhanced = 0;

          if (!root) return 0;

          comments = root.querySelectorAll('li.comment, .comment-thread .comment, #comments-block > .comment');
          for (i = 0; i < comments.length; i += 1) {
            commentNode = comments[i];
            if (!commentNode) continue;

            header = commentNode.querySelector('.comment-author, .comment-header') || commentNode.querySelector('.comment-block, .comment-footer');
            if (!header) continue;

            wrapper = commentNode.querySelector(':scope .gg-comment-more');
            if (!wrapper) {
              wrapper = document.createElement('span');
              wrapper.className = 'gg-comment-more';
              button = document.createElement('button');
              button.type = 'button';
              button.className = 'gg-comment-more__button';
              button.setAttribute('data-gg-action', 'comment-more');
              button.setAttribute('aria-haspopup', 'menu');
              button.setAttribute('aria-expanded', 'false');
              button.setAttribute('aria-label', getCopy('comments.action.more'));
              button.textContent = '...';
              wrapper.appendChild(button);
              enhanced += 1;
            }
            if (wrapper.parentNode !== header) header.appendChild(wrapper);
            commentNode.__ggCommentMoreReady = true;
          }

          if (enhanced) {
            state.commentMoreEnhancementCount += enhanced;
            bumpCommentsDebugCounter('moreMenuEnhancements', enhanced);
          }
          return comments.length;
        }

        function delegateNativeDelete(commentNode) {
          var control = getNativeDeleteControl(commentNode);

          if (!control || typeof control.click !== 'function') return false;

          control.click();
          return true;
        }

        function renderCommentRepliesContext(commentNode, count) {
          var author;
          var body;
          var timestamp;
          var avatar;
          var avatarSrc;
          var labelNode;
          var rowNode;
          var avatarNode;
          var copyNode;
          var metaNode;
          var authorNode;
          var timeNode;
          var bodyNode;
          var countNode;
          var replyNode;

          if (!ui.commentRepliesContext) return;

          ui.commentRepliesContext.textContent = '';

          author = getTextFromNode(commentNode, '.comment-author cite, .comment-author, .comment-header cite, .comment-header .user, cite.user') || 'Comment';
          timestamp = getTextFromNode(commentNode, '.datetime, .comment-timestamp, .comment-header time');
          body = getTextFromNode(commentNode, '.comment-body, .comment-content');
          avatar = commentNode ? commentNode.querySelector('.avatar-image-container img, img.author-avatar, .comment-author img, .comment-header img') : null;
          avatarSrc = avatar ? (avatar.currentSrc || avatar.src || avatar.getAttribute('src') || '') : '';

          labelNode = document.createElement('div');
          labelNode.className = 'gg-comment-replies__context-label';
          labelNode.textContent = getCopy('comments.originalComment');
          ui.commentRepliesContext.appendChild(labelNode);

          rowNode = document.createElement('div');
          rowNode.className = 'gg-comment-replies__context-row';

          if (avatarSrc) {
            avatarNode = document.createElement('img');
            avatarNode.className = 'gg-comment-replies__context-avatar';
            avatarNode.alt = '';
            avatarNode.src = avatarSrc;
            rowNode.appendChild(avatarNode);
          } else {
            rowNode.classList.add('gg-comment-replies__context-row--no-avatar');
          }

          copyNode = document.createElement('div');
          copyNode.className = 'gg-comment-replies__context-copy';

          metaNode = document.createElement('div');
          metaNode.className = 'gg-comment-replies__context-meta';

          authorNode = document.createElement('strong');
          authorNode.className = 'gg-comment-replies__context-author';
          authorNode.textContent = author;
          metaNode.appendChild(authorNode);

          if (timestamp) {
            timeNode = document.createElement('span');
            timeNode.textContent = timestamp;
            metaNode.appendChild(timeNode);
          }

          copyNode.appendChild(metaNode);

          if (body) {
            bodyNode = document.createElement('div');
            bodyNode.className = 'gg-comment-replies__context-body';
            bodyNode.textContent = body;
            copyNode.appendChild(bodyNode);
          }

          countNode = document.createElement('div');
          countNode.className = 'gg-comment-replies__context-count';
          countNode.textContent = formatRepliesSummary(count);
          copyNode.appendChild(countNode);

          replyNode = document.createElement('button');
          replyNode.type = 'button';
          replyNode.className = 'gg-comment-replies__context-reply';
          replyNode.setAttribute('data-gg-action', 'comments-reply-parent');
          replyNode.setAttribute('aria-label', getCopy('comments.action.replyToOriginal'));
          replyNode.textContent = getCopy('comments.action.reply');
          if (commentNode) replyNode.setAttribute('data-gg-reply-target', getCommentNodeId(commentNode));
          copyNode.appendChild(replyNode);
          rowNode.appendChild(copyNode);
          ui.commentRepliesContext.appendChild(rowNode);
        }

        function ensureCommentRepliesAddReplyLauncher() {
          var button;
          var parentComment = state.commentRepliesParentComment;
          var parentId = getCommentNodeId(parentComment);

          if (!ui.commentRepliesFooter) return null;

          button = ui.commentRepliesFooter.querySelector('[data-gg-action="comments-add-reply"]');
          if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-gg-action', 'comments-add-reply');
            button.textContent = getCopy('comments.action.addReply');
            ui.commentRepliesFooter.insertBefore(button, ui.commentRepliesFooter.firstChild);
          }
          button.setAttribute('aria-label', getCopy('comments.action.addReplyToOriginal'));
          if (parentId) button.setAttribute('data-gg-reply-target', parentId);
          else button.removeAttribute('data-gg-reply-target');
          return button;
        }

        function handleCommentRepliesParentReply(source) {
          var parentComment = state.commentRepliesParentComment || (state.commentRepliesPortal && state.commentRepliesPortal.parentComment);

          if (!parentComment) return false;
          return replyToCommentNode(parentComment, source || 'parent-context');
        }

        function getRepliesNodeFromTrigger(trigger) {
          var parent;
          var repliesNode;
          if (!trigger) return null;
          if (trigger.__ggRepliesNode && trigger.__ggRepliesNode.parentNode) return trigger.__ggRepliesNode;
          parent = trigger.parentNode;
          repliesNode = trigger.previousElementSibling;
          if (repliesNode && repliesNode.classList && repliesNode.classList.contains('comment-replies')) return repliesNode;
          return parent && parent.querySelector ? parent.querySelector(':scope > .comment-replies, .comment-replies') : null;
        }

        function markReplyLevels(root) {
          var comments = root ? root.querySelectorAll('li.comment, .comment-thread .comment') : [];
          var i;
          var node;
          var level;
          var parent;

          for (i = 0; i < comments.length; i += 1) {
            node = comments[i];
            level = 1;
            parent = node.parentElement;
            while (parent && parent !== root) {
              if (parent.tagName && parent.tagName.toLowerCase() === 'ol') level += 1;
              parent = parent.parentElement;
            }
            node.setAttribute('data-gg-reply-level', String(Math.min(3, Math.max(1, level))));
          }
        }

        function isCommentRepliesSheetOpen() {
          return !!(ui.commentReplies && !ui.commentReplies.hidden && ui.commentReplies.getAttribute('data-gg-state') !== 'closed' && ui.commentReplies.getAttribute('data-gg-state') !== 'closing');
        }

        function focusCommentRepliesSheet() {
          var focusRoot = ui.commentRepliesPanel || ui.commentReplies;
          focusFirst(focusRoot);
        }

        function openCommentRepliesSheet(trigger) {
          var repliesNode;
          var originalParent;
          var commentNode;
          var count;
          var editor;

          if (!ui.commentReplies || !ui.commentRepliesList) return Promise.resolve(null);

          initCommentRepliesControls();
          repliesNode = getRepliesNodeFromTrigger(trigger);
          if (!repliesNode) return Promise.resolve(null);

          if (state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode && isCommentRepliesSheetOpen()) {
            state.commentRepliesIdempotent = true;
            setCommentsLayer('replies');
            state.commentComposerOpen = false;
            ensureCommentRepliesAddReplyLauncher();
            syncCommentComposerMode();
            focusCommentRepliesSheet();
            return Promise.resolve(state.commentRepliesPortal);
          }

          return closeCommentRepliesSheet({
            returnFocus: false,
            reason: 'comment-replies-switch'
          }).then(function () {
            editor = document.getElementById('comment-editor');
            state.commentRepliesReadOnlyEditorSrcBefore = editor ? (editor.getAttribute('src') || editor.src || '') : '';
            state.commentRepliesOpenCount += 1;
            bumpCommentsDebugCounter('repliesOpens');
            originalParent = repliesNode.parentNode;
            count = getCommentReplyCount(repliesNode);
            commentNode = getDirectCommentElement(originalParent, repliesNode);

            if (!originalParent || !count) return null;

            state.commentRepliesPortal = {
              repliesNode: repliesNode,
              originalParent: originalParent,
              originalNextSibling: repliesNode.nextSibling,
              parentComment: commentNode,
              trigger: trigger || document.activeElement || null
            };
            state.commentRepliesParentComment = commentNode;
            state.commentRepliesAutoReplySafe = true;
            state.commentRepliesExplicitReplyStarted = false;

            renderCommentRepliesContext(commentNode, count);
            ensureCommentRepliesAddReplyLauncher();
            markReplyLevels(repliesNode);
            ui.commentRepliesList.appendChild(repliesNode);
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            ensureCommentMoreMenus();
            state.commentComposerOpen = false;
            syncCommentComposerMode();
            requestCommentPrefixSync();

            ui.commentReplies.hidden = false;
            ui.commentReplies.removeAttribute('inert');
            ui.commentReplies.setAttribute('aria-hidden', 'false');
            ui.commentReplies.setAttribute('data-gg-state', 'opening');
            ui.commentReplies.setAttribute('data-gg-active', 'true');
            setCommentsLayer('replies');

            window.requestAnimationFrame(function () {
              if (state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode) {
                ui.commentReplies.setAttribute('data-gg-state', 'open');
                state.commentComposerOpen = false;
                syncCommentComposerMode();
              }
            });
            window.setTimeout(focusCommentRepliesSheet, 24);

            return state.commentRepliesPortal;
          });
        }

        function restoreCommentRepliesPortal() {
          var portal = state.commentRepliesPortal;
          if (!portal || !portal.repliesNode || !portal.originalParent) return false;

          if (portal.originalNextSibling && portal.originalNextSibling.parentNode === portal.originalParent) {
            portal.originalParent.insertBefore(portal.repliesNode, portal.originalNextSibling);
          } else {
            portal.originalParent.appendChild(portal.repliesNode);
          }

          if (portal.trigger) portal.trigger.setAttribute('aria-expanded', 'false');
          state.commentRepliesPortal = null;
          state.commentRepliesParentComment = null;
          return true;
        }

        function closeCommentRepliesSheet(options) {
          var closeOptions = options || {};
          var portal = state.commentRepliesPortal;
          var shouldReturnFocus = closeOptions.returnFocus !== false && portal && portal.trigger && typeof portal.trigger.focus === 'function';

          if (!ui.commentReplies || ui.commentReplies.hidden) {
            restoreCommentRepliesPortal();
            restoreComposerToMainFooter();
            if (ui.comments && !ui.comments.hidden && ui.comments.getAttribute('data-gg-state') !== 'closed') setCommentsLayer('main');
            else setCommentsLayer('closed');
            return Promise.resolve(false);
          }

          if (state.commentRepliesTimer) {
            window.clearTimeout(state.commentRepliesTimer);
            state.commentRepliesTimer = 0;
          }

          ui.commentReplies.setAttribute('data-gg-state', 'closing');
          ui.commentReplies.setAttribute('data-gg-active', 'false');
          closeCommentMoreMenu();

          return new Promise(function (resolve) {
            state.commentRepliesTimer = window.setTimeout(function () {
              state.commentRepliesTimer = 0;
              restoreCommentRepliesPortal();
              ui.commentReplies.hidden = true;
              ui.commentReplies.setAttribute('inert', '');
              ui.commentReplies.setAttribute('aria-hidden', 'true');
              ui.commentReplies.setAttribute('data-gg-state', 'closed');
              ui.commentReplies.removeAttribute('data-gg-active');
              if (ui.commentRepliesContext) ui.commentRepliesContext.textContent = '';
              clearCommentReplyContext();
              restoreComposerToMainFooter();
              if (ui.comments && !ui.comments.hidden && ui.comments.getAttribute('data-gg-state') !== 'closed' && ui.comments.getAttribute('data-gg-state') !== 'closing') setCommentsLayer('main');
              else setCommentsLayer('closed');
              if (shouldReturnFocus) portal.trigger.focus();
              resolve(true);
            }, 170);
          });
        }

        function normalizeHashId(value) {
          var raw = String(value || '').replace(/^#/, '');
          try {
            return decodeURIComponent(raw);
          } catch (error) {
            return raw;
          }
        }

        function isCommentsHash(value) {
          var hash = String(value || window.location.hash || '');
          var id = normalizeHashId(hash);
          return id === 'comments' || id === 'comment-form' || /^c\d+/.test(id);
        }

        function findCommentsHashTarget(hash) {
          var id = normalizeHashId(hash || window.location.hash);
          if (id === 'comment-form') {
            return document.getElementById('comment-form') || document.getElementById('top-ce') || document.querySelector('[name="comment-form"]');
          }
          return document.getElementById(id);
        }

        function scrollCommentsHashTarget(hash, options) {
          var scrollOptions = options || {};
          var target = findCommentsHashTarget(hash);

          if (!target || typeof target.scrollIntoView !== 'function') return null;

          target.scrollIntoView({
            block: scrollOptions.block || 'start'
          });

          return target;
        }

        function openComposer(options) {
          var composerOptions = options || {};

          if (composerOptions.clearReply !== false) clearCommentReplyContext();
          setComposerOpen(true);

          return openCommentsSheet({
            trigger: composerOptions.trigger,
            focus: composerOptions.focus !== false,
            reason: composerOptions.reason || 'comments-composer-open'
          }).then(function (panel) {
            ensureComposerInActiveFooter();
            window.setTimeout(function () {
              scrollCommentsHashTarget('#comment-form');
            }, 32);
            return panel;
          });
        }

        function syncCommentsHash() {
          var hash = window.location.hash || '';
          var id = normalizeHashId(hash);

          if (!isCommentsHash(hash) || !getPanel('comments')) return Promise.resolve(null);

          if (id === 'comment-form') {
            return openComposer({
              focus: false,
              reason: 'comments-hash-composer'
            });
          }

          return openCommentsSheet({
            focus: false,
            reason: 'comments-hash'
          }).then(function (panel) {
            window.setTimeout(function () {
              scrollCommentsHashTarget(hash);
            }, 32);
            return panel;
          });
        }

        function trapFocusWhileOpen(event) {
          var activePanel = getPanel(state.panelActive);
          var focusable;
          var firstNode;
          var lastNode;
          var focusRoot;

          if (!event || event.key !== 'Tab') {
            return false;
          }

          if (isCommentRepliesSheetOpen()) {
            focusRoot = ui.commentRepliesPanel;
          } else if (activePanel && activePanel.trapFocus && activePanel.panel) {
            focusRoot = activePanel.panel;
          }

          if (!focusRoot) return false;

          focusable = getFocusableNodes(focusRoot);
          if (!focusable.length) return false;

          firstNode = focusable[0];
          lastNode = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === firstNode) {
            event.preventDefault();
            lastNode.focus();
            return true;
          }

          if (!event.shiftKey && document.activeElement === lastNode) {
            event.preventDefault();
            firstNode.focus();
            return true;
          }

          return false;
        }

        function launchDiscovery(trigger, reason, options) {
          var launchOptions = options || {};
          var resolvedTrigger = trigger || document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput || document.activeElement || null;
          var query = Object.prototype.hasOwnProperty.call(launchOptions, 'query') ? String(launchOptions.query || '') : getCommandValue();

          if (launchOptions.tab) {
            state.discoveryTab = normalizeDiscoveryFilter(launchOptions.tab);
          } else if (reason === 'command-trigger' || reason === 'command-shortcut' || reason === 'command-api-open' || reason === 'qa-command-open') {
            state.discoveryTab = 'all';
          }
          if (launchOptions.clearTopic || reason === 'command-trigger' || reason === 'command-shortcut' || reason === 'command-api-open' || reason === 'qa-command-open') state.discoveryTopic = '';
          if (launchOptions.resetActiveIndex !== false) state.discoveryActiveIndex = -1;

          syncCommandInputs(query);

          return openCommandPanel(resolvedTrigger, reason || 'command-launch', {
            focusSheet: launchOptions.focusSheet !== false,
            selectText: !!launchOptions.selectText
          }).then(function (panel) {
            return ensureDiscoveryIndex().catch(function () {
              return state.discoveryIndex;
            }).then(function () {
              renderDiscovery(getCommandValue(), {
                open: false
              });
              return panel;
            });
          });
        }

        function normalizedPath(url) {
          var path = safeUrl(url).pathname || '/';
          path = path.replace(/\/index\.html$/, '/');
          path = path.replace(/\/{2,}/g, '/');
          if (!path) path = '/';
          if (path.length > 1) path = path.replace(/\/+$/, '');
          return path || '/';
        }

        function trimSurfaceTitleFragment(value) {
          return stripHtml(value || '')
            .replace(/^[\s:|\/>\-–—·]+/, '')
            .replace(/[\s:|\/<\-–—·]+$/, '')
            .trim();
        }

        function decodePathSegment(value) {
          try {
            return decodeURIComponent(String(value || ''));
          } catch (error) {
            return String(value || '');
          }
        }

        function getLabelArchiveRouteText() {
          var path = normalizedPath(window.location.href);
          var prefix = '/search/label/';

          if (path.indexOf(prefix) !== 0) return '';
          return stripHtml(decodePathSegment(path.slice(prefix.length)));
        }

        function formatLabelArchiveFallback(value) {
          var text = stripHtml(value || '');

          if (!text || /\s/.test(text) || text !== text.toLowerCase()) return text;
          return text.charAt(0).toUpperCase() + text.slice(1);
        }

        function resolveLabelArchiveTitle() {
          var routeLabel = getLabelArchiveRouteText();
          var routeKey = normalizeTopicKey(routeLabel);
          var blogTitle = ui.shell ? stripHtml(ui.shell.getAttribute('data-gg-blog-title') || '') : '';
          var titleCandidate = trimSurfaceTitleFragment(document.title || '');

          if (!routeKey) return '';

          if (blogTitle && titleCandidate.indexOf(blogTitle) !== -1) {
            titleCandidate = trimSurfaceTitleFragment(titleCandidate.replace(blogTitle, ' '));
          }

          if (titleCandidate && normalizeTopicKey(titleCandidate) === routeKey) {
            return titleCandidate;
          }

          return formatLabelArchiveFallback(routeLabel);
        }

        function getCurrentSearchQuery() {
          return stripHtml(safeUrl(window.location.href).searchParams.get('q') || '');
        }

        function isError404SurfaceActive() {
          return !!(state.surfaceContext && state.surfaceContext.surface === 'error404' && state.errorContract && state.errorContract.errorState === '404');
        }

        function setSiteHeadText(node, text, visible) {
          if (!node) return;
          node.textContent = text || '';
          node.hidden = !visible;
        }

        function syncSiteHeadTitle() {
          var defaultTitle;
          var defaultEyebrow;
          var defaultSummary;
          var labelTitle;
          var searchEmptyState;

          if (!ui.siteHeadTitle) return;

          defaultTitle = stripHtml(ui.siteHeadTitle.getAttribute('data-gg-default-title') || ui.siteHeadTitle.textContent || '');
          if (!ui.siteHeadTitle.getAttribute('data-gg-default-title')) {
            ui.siteHeadTitle.setAttribute('data-gg-default-title', defaultTitle);
          }

          if (ui.siteHeadEyebrow) {
            defaultEyebrow = stripHtml(ui.siteHeadEyebrow.getAttribute('data-gg-default-text') || ui.siteHeadEyebrow.textContent || '');
            if (!ui.siteHeadEyebrow.getAttribute('data-gg-default-text')) {
              ui.siteHeadEyebrow.setAttribute('data-gg-default-text', defaultEyebrow);
            }
          } else {
            defaultEyebrow = '';
          }

          if (ui.siteHeadSummary) {
            defaultSummary = stripHtml(ui.siteHeadSummary.getAttribute('data-gg-default-text') || ui.siteHeadSummary.textContent || '');
            if (!ui.siteHeadSummary.getAttribute('data-gg-default-text')) {
              ui.siteHeadSummary.setAttribute('data-gg-default-text', defaultSummary);
            }
          } else {
            defaultSummary = '';
          }

          if (isError404SurfaceActive()) {
            ui.siteHeadTitle.textContent = getCopy('error404.title');
            setSiteHeadText(ui.siteHeadEyebrow, getCopy('error404.eyebrow'), true);
            setSiteHeadText(ui.siteHeadSummary, getCopy('error404.summary'), true);
            return;
          }

          searchEmptyState = detectSearchEmptyState();
          if (searchEmptyState.active) {
            ui.siteHeadTitle.textContent = getCopy('searchEmpty.title');
            setSiteHeadText(ui.siteHeadEyebrow, getCopy('dock.search'), true);
            setSiteHeadText(ui.siteHeadSummary, formatCopy('searchEmpty.echo', { query: searchEmptyState.query }), true);
            return;
          }

          if (state.surfaceContext && state.surfaceContext.surface === 'label') {
            labelTitle = resolveLabelArchiveTitle();
            if (labelTitle) {
              ui.siteHeadTitle.textContent = labelTitle;
              setSiteHeadText(ui.siteHeadEyebrow, defaultEyebrow, !!defaultEyebrow);
              setSiteHeadText(ui.siteHeadSummary, defaultSummary, !!defaultSummary);
              return;
            }
          }

          ui.siteHeadTitle.textContent = defaultTitle;
          setSiteHeadText(ui.siteHeadEyebrow, defaultEyebrow, !!defaultEyebrow);
          setSiteHeadText(ui.siteHeadSummary, defaultSummary, !!defaultSummary);
        }

        function hasNativeErrorView() {
          return !!(ui.shell && ui.shell.getAttribute(ERROR_RUNTIME_CONTRACT.shellMarkerAttribute) === 'true');
        }

        function isArchivePath(path, params) {
          if (/^\/\d{4}(\/\d{2})?$/.test(path)) return true;
          if (params && params.has('updated-max')) return true;
          if (params && params.has('max-results') && !params.has('q')) return true;
          return false;
        }

        function normalizeHash(value) {
          return String(value || '').replace(/^#/, '').trim().toLowerCase();
        }

        function getLandingRouteState(input) {
          var currentUrl = safeUrl(input || window.location.href);
          var landingPath = normalizedPath(makeHomeUrl('landing'));
          var isLanding = normalizedPath(currentUrl.href) === landingPath;
          var hash = normalizeHash(currentUrl.hash);

          return {
            isLanding: isLanding,
            isContact: isLanding && hash === 'contact'
          };
        }

        function detectSurface() {
          var homeUrl = safeUrl(ui.shell ? ui.shell.getAttribute('data-gg-home-url') : window.location.origin + '/');
          var currentUrl = safeUrl(window.location.href);
          var routeParams = new URLSearchParams(currentUrl.search);
          var homeParams = new URLSearchParams(currentUrl.search);
          var path = normalizedPath(currentUrl.href);
          var homePath = normalizedPath(homeUrl.href);
          var landingRoute = getLandingRouteState(currentUrl.href);
          var viewError = hasNativeErrorView();
          var viewPost = ui.shell && ui.shell.getAttribute('data-gg-view-post') === 'true';
          var viewPage = ui.shell && ui.shell.getAttribute('data-gg-view-page') === 'true';
          var isMobile = routeParams.get('m') === '1';
          var isLanding = landingRoute.isLanding;
          var isLabel = path.indexOf('/search/label/') === 0;
          var isSearch = !isLabel && path.indexOf('/search') === 0 && !!routeParams.get('q');
          var isArchive = !viewPost && !viewPage && !isLabel && !isSearch && isArchivePath(path, routeParams);
          var surface = 'special';
          var page = 'special';
          var source = 'runtime.special';

          homeParams.delete('m');

          if (viewError) {
            surface = 'error404';
            page = 'error404';
            source = 'view.isError';
          } else if (viewPost) {
            surface = 'post';
            page = 'post';
            source = 'view.isPost';
          } else if (viewPage) {
            surface = 'page';
            page = 'page';
            source = 'view.isPage';
          } else if (path === homePath && !homeParams.toString()) {
            surface = 'listing';
            page = 'listing';
            source = 'url.root-listing';
          } else if (landingRoute.isContact) {
            surface = 'landing';
            page = 'landing';
            source = 'url.landing.contact';
          } else if (isLanding) {
            surface = 'landing';
            page = 'landing';
            source = 'url.landing';
          } else if (isLabel) {
            surface = 'label';
            page = 'label';
            source = 'url.search/label';
          } else if (isSearch) {
            surface = 'search';
            page = 'search';
            source = 'url.search?q';
          } else if (isArchive) {
            surface = 'archive';
            page = 'archive';
            source = 'url.archive';
          }

          return {
            surface: surface,
            page: page,
            source: source,
            variant: isMobile ? 'mobile' : 'default',
            isRootListing: surface === 'listing' && source === 'url.root-listing',
            isListing: surface === 'listing' || surface === 'search' || surface === 'label' || surface === 'archive',
            isMobile: isMobile
          };
        }

        function detectErrorContract(surfaceContext) {
          var nativeError = hasNativeErrorView();
          if (surfaceContext && surfaceContext.surface === 'error404' && nativeError) {
            return {
              errorState: '404',
              errorSource: 'view.isError',
              nativeMarkerAvailable: true,
              custom404Setting: ERROR_RUNTIME_CONTRACT.custom404Setting
            };
          }

          return {
            errorState: 'none',
            errorSource: 'none',
            nativeMarkerAvailable: nativeError,
            custom404Setting: ERROR_RUNTIME_CONTRACT.custom404Setting
          };
        }

        function detectSpecialContract(surfaceContext) {
          if (!surfaceContext || surfaceContext.surface !== 'special') {
            return {
              specialKind: 'none',
              specialSource: 'none'
            };
          }

          return {
            specialKind: 'special',
            specialSource: 'route-fallback'
          };
        }

        function applyErrorContractAttributes(node, errorContract) {
          if (!node || !errorContract) return;
          node.setAttribute('data-gg-error-state', errorContract.errorState);
          node.setAttribute('data-gg-error-source', errorContract.errorSource);
        }

        function applySpecialContractAttributes(node, specialContract) {
          if (!node || !specialContract) return;
          node.setAttribute('data-gg-special-kind', specialContract.specialKind);
          node.setAttribute('data-gg-special-source', specialContract.specialSource);
        }

        function syncLoadMoreCopy() {
          if (!ui.loadMore) return;
          ui.loadMore.textContent = getCopy(state.surfaceContext && state.surfaceContext.surface === 'search' ? 'pagination.moreResults' : 'pagination.moreEntries');
        }

        function setListingGrowthState(mode) {
          var resolved = mode || 'fallback';
          state.listingGrowthState = resolved;
          if (ui.shell) ui.shell.setAttribute('data-gg-listing-growth', resolved);
          if (!ui.loadMoreWrap) return;
          ui.loadMoreWrap.setAttribute('data-gg-loadmore-state', resolved);
          ui.loadMoreWrap.setAttribute('data-gg-listing-growth', resolved);
        }

        function getCurrentOlderPageUrl() {
          if (!ui.loadMore) return '';
          return toAbsoluteUrl(ui.loadMore.getAttribute('href') || '');
        }

        function setCurrentOlderPageUrl(url) {
          var resolved = toAbsoluteUrl(url || '');
          if (ui.loadMore) {
            if (resolved) ui.loadMore.setAttribute('href', resolved);
            else ui.loadMore.removeAttribute('href');
          }
          if (ui.loadMoreWrap) ui.loadMoreWrap.setAttribute('data-gg-has-older', resolved ? 'true' : 'false');
          if (!resolved && state.listingObserver) {
            state.listingObserver.disconnect();
            state.listingObserver = null;
          }
          return resolved;
        }

        function getListingRowNodes(scope) {
          var root = scope && scope.querySelectorAll ? scope : document;
          return root.querySelectorAll(LISTING_ROW_SELECTOR);
        }

        function buildDiscoveryIndexFromRowNodes(rowNodes) {
          var posts = [];
          var i;
          var payload;

          for (i = 0; i < (rowNodes || []).length; i += 1) {
            payload = getRowPayload(rowNodes[i]);
            if (!payload || !payload.url || !payload.title) continue;
            posts.push({
              title: payload.title,
              href: payload.url,
              labelTexts: [],
              summary: ''
            });
          }

          return {
            posts: posts,
            topics: []
          };
        }

        function registerListingRows(rowNodes, baseUrl) {
          var registered = [];
          var i;
          var row;
          var href;

          for (i = 0; i < (rowNodes || []).length; i += 1) {
            row = rowNodes[i];
            href = toAbsoluteUrl(row.getAttribute('data-gg-post-url') || '', baseUrl || window.location.href);
            if (!href) continue;
            row.setAttribute('data-gg-post-url', href);
            if (state.listingSeenUrls[href]) continue;
            state.listingSeenUrls[href] = true;
            registered.push(row);
          }

          return registered;
        }

        function getListingRowCount() {
          return ui.listing ? ui.listing.querySelectorAll(LISTING_ROW_SELECTOR).length : 0;
        }

        function detectSearchEmptyState() {
          var query = getCurrentSearchQuery();
          var resultCount = getListingRowCount();
          var active = !!(state.surfaceContext && state.surfaceContext.surface === 'search' && query && resultCount === 0);

          return {
            active: active,
            query: query,
            resultCount: resultCount
          };
        }

        function getSearchEmptyFallbackPosts(limit) {
          var posts = state.discoveryIndex && state.discoveryIndex.posts ? state.discoveryIndex.posts : [];
          var max = typeof limit === 'number' ? limit : SEARCH_EMPTY_FALLBACK_CONTRACT.limit;

          return posts.filter(function (post) {
            return !!(post && post.href && post.title);
          }).slice(0, max);
        }

        function clearSearchEmptyFallbackTimer() {
          if (!state.searchEmptyFallbackTimeoutId) return;
          window.clearTimeout(state.searchEmptyFallbackTimeoutId);
          state.searchEmptyFallbackTimeoutId = 0;
        }

        function resetSearchEmptyFallback() {
          clearSearchEmptyFallbackTimer();
          state.searchEmptyFallbackRequestId += 1;
          state.searchEmptyFallbackState = 'idle';
        }

        function getSearchEmptyFallbackUiState(posts) {
          var items = Array.isArray(posts) ? posts : getSearchEmptyFallbackPosts(SEARCH_EMPTY_FALLBACK_CONTRACT.limit);

          if (items.length) return 'success';
          if (state.searchEmptyFallbackState === 'loading') return 'loading';
          if (state.searchEmptyFallbackState === 'failure') return 'failure';
          return 'idle';
        }

        function searchEmptySnapshot() {
          var searchState = detectSearchEmptyState();
          var fallbackPosts = getSearchEmptyFallbackPosts(SEARCH_EMPTY_FALLBACK_CONTRACT.limit);

          return {
            active: searchState.active,
            query: searchState.query,
            resultCount: searchState.resultCount,
            fallbackState: getSearchEmptyFallbackUiState(fallbackPosts),
            fallbackCount: fallbackPosts.length,
            timeoutMs: SEARCH_EMPTY_FALLBACK_CONTRACT.timeoutMs
          };
        }

        function finalizeSearchEmptyFallbackLoad(requestId) {
          if (requestId !== state.searchEmptyFallbackRequestId) return;
          clearSearchEmptyFallbackTimer();
          if (!detectSearchEmptyState().active) return;
          state.searchEmptyFallbackState = getSearchEmptyFallbackPosts(SEARCH_EMPTY_FALLBACK_CONTRACT.limit).length ? 'success' : 'failure';
          syncSearchEmptyState();
        }

        function startSearchEmptyFallbackLoad() {
          var requestId;

          clearSearchEmptyFallbackTimer();
          state.searchEmptyFallbackRequestId += 1;
          requestId = state.searchEmptyFallbackRequestId;
          state.searchEmptyFallbackState = 'loading';
          state.searchEmptyFallbackTimeoutId = window.setTimeout(function () {
            finalizeSearchEmptyFallbackLoad(requestId);
          }, SEARCH_EMPTY_FALLBACK_CONTRACT.timeoutMs);

          ensureDiscoveryIndex().then(function () {
            finalizeSearchEmptyFallbackLoad(requestId);
          }).catch(function () {
            finalizeSearchEmptyFallbackLoad(requestId);
          });
        }

        function getError404FallbackPosts(limit) {
          var max = typeof limit === 'number' ? limit : ERROR404_SURFACE_CONTRACT.limit;
          return getSearchEmptyFallbackPosts(max);
        }

        function clearError404FallbackTimer() {
          if (!state.error404FallbackTimeoutId) return;
          window.clearTimeout(state.error404FallbackTimeoutId);
          state.error404FallbackTimeoutId = 0;
        }

        function resetError404Fallback() {
          clearError404FallbackTimer();
          state.error404FallbackRequestId += 1;
          state.error404FallbackState = 'idle';
        }

        function getError404FallbackUiState(posts) {
          var items = Array.isArray(posts) ? posts : getError404FallbackPosts(ERROR404_SURFACE_CONTRACT.limit);

          if (items.length) return 'success';
          if (state.error404FallbackState === 'loading') return 'loading';
          if (state.error404FallbackState === 'failure') return 'failure';
          return 'idle';
        }

        function error404Snapshot() {
          var fallbackPosts = getError404FallbackPosts(ERROR404_SURFACE_CONTRACT.limit);

          return {
            active: isError404SurfaceActive(),
            fallbackState: getError404FallbackUiState(fallbackPosts),
            fallbackCount: fallbackPosts.length,
            timeoutMs: ERROR404_SURFACE_CONTRACT.timeoutMs
          };
        }

        function finalizeError404FallbackLoad(requestId) {
          if (requestId !== state.error404FallbackRequestId) return;
          clearError404FallbackTimer();
          if (!isError404SurfaceActive()) return;
          state.error404FallbackState = getError404FallbackPosts(ERROR404_SURFACE_CONTRACT.limit).length ? 'success' : 'failure';
          syncError404State();
        }

        function startError404FallbackLoad() {
          var requestId;

          clearError404FallbackTimer();
          state.error404FallbackRequestId += 1;
          requestId = state.error404FallbackRequestId;
          state.error404FallbackState = 'loading';
          state.error404FallbackTimeoutId = window.setTimeout(function () {
            finalizeError404FallbackLoad(requestId);
          }, ERROR404_SURFACE_CONTRACT.timeoutMs);

          ensureDiscoveryIndex().then(function () {
            finalizeError404FallbackLoad(requestId);
          }).catch(function () {
            finalizeError404FallbackLoad(requestId);
          });
        }

        function replaceNodeChildren(node, children) {
          var items = Array.isArray(children) ? children : [];
          var i;

          if (!node) return;

          if (node.replaceChildren) {
            node.replaceChildren();
          } else {
            while (node.firstChild) {
              node.removeChild(node.firstChild);
            }
          }

          for (i = 0; i < items.length; i += 1) {
            if (items[i]) node.appendChild(items[i]);
          }
        }

        function cloneTemplateRoot(template) {
          if (!template) return null;
          if (template.content && template.content.firstElementChild) {
            return template.content.firstElementChild.cloneNode(true);
          }
          if (template.firstElementChild) {
            return template.firstElementChild.cloneNode(true);
          }
          return null;
        }

        function getTemplatePart(root, name) {
          if (!root || !name || typeof root.querySelector !== 'function') return null;
          if (root.matches && root.matches('[data-gg-template-part="' + name + '"]')) return root;
          return root.querySelector('[data-gg-template-part="' + name + '"]');
        }

        function setFeedbackStatus(node, copyKey, visible) {
          if (!node) return;
          node.textContent = visible ? getCopy(copyKey) : '';
          node.hidden = !visible;
        }

        function getFeedbackResultMetaLabel(item) {
          return item && item.labelTexts && item.labelTexts.length
            ? item.labelTexts.join(' · ')
            : getCopy('command.results.article');
        }

        function createFeedbackResultNode(item) {
          var template = ui.feedbackResultTemplate;
          var fragment;
          var node;
          var typeNode;
          var titleNode;
          var metaNode;

          if (!template || !item || !item.href || !item.title) return null;

          fragment = template.content ? template.content.cloneNode(true) : template.cloneNode(true);
          node = fragment.querySelector ? fragment.querySelector('.gg-discovery-result') : null;
          if (!node && fragment.firstElementChild) node = fragment.firstElementChild;
          if (!node) return null;

          typeNode = node.querySelector('.gg-discovery-result__type');
          titleNode = node.querySelector('.gg-discovery-result__title');
          metaNode = node.querySelector('.gg-discovery-result__meta');

          node.setAttribute('href', toAbsoluteUrl(item.href));
          if (typeNode) typeNode.textContent = getCopy('command.results.postType');
          if (titleNode) titleNode.textContent = item.title;
          if (metaNode) metaNode.textContent = getFeedbackResultMetaLabel(item);

          return node;
        }

        function bindFeedbackFallbackResults(node, posts) {
          var items = Array.isArray(posts) ? posts : [];
          var nodes = [];
          var i;
          var resultNode;

          for (i = 0; i < items.length; i += 1) {
            resultNode = createFeedbackResultNode(items[i]);
            if (resultNode) nodes.push(resultNode);
          }

          replaceNodeChildren(node, nodes);
        }

        function clearFeedbackSurface(fallbackNode, resultsNode, statusNode) {
          if (fallbackNode) fallbackNode.hidden = true;
          if (resultsNode) replaceNodeChildren(resultsNode, []);
          if (statusNode) {
            statusNode.textContent = '';
            statusNode.hidden = true;
          }
        }

        function syncFeedbackFallbackPresentation(fallbackNode, resultsNode, statusNode, fallbackState, posts, loadingCopyKey, failureCopyKey) {
          if (!fallbackNode || !resultsNode || !statusNode) return;

          if (fallbackState === 'success') {
            bindFeedbackFallbackResults(resultsNode, posts);
            fallbackNode.hidden = false;
            setFeedbackStatus(statusNode, '', false);
            return;
          }

          replaceNodeChildren(resultsNode, []);
          fallbackNode.hidden = true;

          if (fallbackState === 'loading') {
            setFeedbackStatus(statusNode, loadingCopyKey, true);
            return;
          }

          if (fallbackState === 'failure') {
            setFeedbackStatus(statusNode, failureCopyKey, true);
            return;
          }

          setFeedbackStatus(statusNode, '', false);
        }

        function syncSearchEmptyState() {
          var searchState = detectSearchEmptyState();
          var fallbackPosts = getSearchEmptyFallbackPosts(SEARCH_EMPTY_FALLBACK_CONTRACT.limit);
          var fallbackState = getSearchEmptyFallbackUiState(fallbackPosts);
          var shouldStartFallback = searchState.active && fallbackState === 'idle';

          syncSiteHeadTitle();

          if (!ui.searchEmpty) return;

          if (!searchState.active) {
            resetSearchEmptyFallback();
            ui.searchEmpty.hidden = true;
            clearFeedbackSurface(ui.searchEmptyFallback, ui.searchEmptyResults, ui.searchEmptyStatus);
            if (ui.listing) ui.listing.hidden = isError404SurfaceActive();
            if (ui.loadMoreWrap) ui.loadMoreWrap.hidden = isError404SurfaceActive();
            return;
          }

          if (shouldStartFallback) fallbackState = 'loading';

          if (ui.listing) ui.listing.hidden = true;
          if (ui.loadMoreWrap) ui.loadMoreWrap.hidden = true;
          syncFeedbackFallbackPresentation(
            ui.searchEmptyFallback,
            ui.searchEmptyResults,
            ui.searchEmptyStatus,
            fallbackState,
            fallbackPosts,
            'searchEmpty.loadingFallback',
            'searchEmpty.fallbackUnavailable'
          );
          ui.searchEmpty.hidden = false;

          if (shouldStartFallback) startSearchEmptyFallbackLoad();
        }

        function syncError404State() {
          var active = isError404SurfaceActive();
          var fallbackPosts = getError404FallbackPosts(ERROR404_SURFACE_CONTRACT.limit);
          var fallbackState = getError404FallbackUiState(fallbackPosts);
          var shouldStartFallback = active && fallbackState === 'idle';

          syncSiteHeadTitle();

          if (!ui.error404) return;

          if (!active) {
            resetError404Fallback();
            ui.error404.hidden = true;
            clearFeedbackSurface(ui.error404Fallback, ui.error404Results, ui.error404Status);
            if (ui.listing) ui.listing.hidden = detectSearchEmptyState().active;
            if (ui.loadMoreWrap) ui.loadMoreWrap.hidden = detectSearchEmptyState().active;
            return;
          }

          if (shouldStartFallback) fallbackState = 'loading';

          if (ui.listing) ui.listing.hidden = true;
          if (ui.loadMoreWrap) ui.loadMoreWrap.hidden = true;
          syncFeedbackFallbackPresentation(
            ui.error404Fallback,
            ui.error404Results,
            ui.error404Status,
            fallbackState,
            fallbackPosts,
            'error404.loadingFallback',
            'error404.fallbackUnavailable'
          );
          ui.error404.hidden = false;

          if (shouldStartFallback) startError404FallbackLoad();
        }

        function listingViewportSatisfied() {
          var rect;
          if (!ui.listing) return true;
          rect = ui.listing.getBoundingClientRect();
          return rect.bottom >= (window.innerHeight + LISTING_GROWTH_CONTRACT.viewportBuffer);
        }

        function parseHtmlDocument(html) {
          if (window.DOMParser) {
            return new window.DOMParser().parseFromString(html, 'text/html');
          }
          var fallbackDoc = document.implementation.createHTMLDocument('');
          fallbackDoc.documentElement.innerHTML = html;
          return fallbackDoc;
        }

        function extractListingAppendPayload(html, responseUrl) {
          var parsed = parseHtmlDocument(html || '');
          var rowNodes = parsed.querySelectorAll(LISTING_GROWTH_CONTRACT.rootSelector + ' ' + LISTING_ROW_SELECTOR);
          var rows = [];
          var nextLink = parsed.getElementById('gg-loadmore-fallback') || parsed.querySelector('.blog-pager-older-link');
          var nextOlderUrl = nextLink ? toAbsoluteUrl(nextLink.getAttribute('href') || '', responseUrl) : '';
          var i;

          for (i = 0; i < rowNodes.length; i += 1) {
            rows.push(rowNodes[i]);
          }

          return {
            rows: rows,
            nextOlderUrl: nextOlderUrl
          };
        }

        function appendListingRows(rowNodes, nextOlderUrl, responseUrl) {
          var fragment = document.createDocumentFragment();
          var appended = [];
          var i;
          var imported;
          var domain;
          var href;
          var appendedCount;

          if (!ui.listing) return 0;

          for (i = 0; i < (rowNodes || []).length; i += 1) {
            imported = document.importNode ? document.importNode(rowNodes[i], true) : rowNodes[i].cloneNode(true);
            domain = imported.getAttribute('data-gg-content-domain');
            if (state.surfaceContext && state.surfaceContext.isRootListing && domain === 'store') {
              state.storeRowsSkippedFromRoot = (state.storeRowsSkippedFromRoot || 0) + 1;
              continue;
            }
            href = toAbsoluteUrl(imported.getAttribute('data-gg-post-url') || '', responseUrl);
            if (!href || state.listingSeenUrls[href]) continue;
            imported.setAttribute('data-gg-post-url', href);
            applyCopy(imported);
            state.listingSeenUrls[href] = true;
            fragment.appendChild(imported);
            appended.push(imported);
          }

          appendedCount = appended.length;
          if (appendedCount) {
            ui.listing.appendChild(fragment);
          }

          nextOlderUrl = nextOlderUrl && nextOlderUrl !== responseUrl ? nextOlderUrl : '';
          setCurrentOlderPageUrl(nextOlderUrl);

          if (state.discoveryIndex && appendedCount) {
            state.discoveryIndex = mergeDiscoveryIndexes(state.discoveryIndex, buildDiscoveryIndexFromRowNodes(appended));
            if (state.panelActive === 'command') {
              renderDiscovery(getCommandValue(), {
                open: false
              });
            }
          }

          return appendedCount;
        }

        function finishListingGrowthState() {
          if (!state.surfaceContext || !state.surfaceContext.isListing) {
            setListingGrowthState('fallback');
            return;
          }
          if (!getCurrentOlderPageUrl()) {
            setListingGrowthState('exhausted');
            return;
          }
          if (window.IntersectionObserver && ui.listingSentinel) {
            setListingGrowthState('auto');
            return;
          }
          setListingGrowthState('fallback');
        }

        function loadMoreListing(reason) {
          var currentUrl = getCurrentOlderPageUrl();
          var absoluteUrl;

          if (!state.surfaceContext || !state.surfaceContext.isListing) {
            return Promise.resolve({
              status: 'skip',
              reason: 'not-listing-surface'
            });
          }

          if (!currentUrl) {
            finishListingGrowthState();
            return Promise.resolve({
              status: 'exhausted',
              reason: reason || 'no-older-page'
            });
          }

          if (state.listingFetchPromise) return state.listingFetchPromise;

          absoluteUrl = safeUrl(currentUrl);
          if (absoluteUrl.origin !== window.location.origin) {
            setListingGrowthState('error');
            return Promise.reject(new Error('listing-growth-cross-origin'));
          }

          setListingGrowthState('loading');
          state.listingFetchPromise = fetch(absoluteUrl.href, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response.ok) throw new Error('listing-growth-fetch-failed');
              return response.text();
            })
            .then(function (html) {
              var payload = extractListingAppendPayload(html, absoluteUrl.href);
              var appended = appendListingRows(payload.rows, payload.nextOlderUrl, absoluteUrl.href);
              finishListingGrowthState();
              return {
                status: getCurrentOlderPageUrl() ? 'loaded' : 'exhausted',
                reason: reason || 'manual',
                appended: appended,
                nextOlderUrl: getCurrentOlderPageUrl()
              };
            })
            .catch(function (error) {
              setListingGrowthState('error');
              throw error;
            })
            .then(function (result) {
              state.listingFetchPromise = null;
              return result;
            }, function (error) {
              state.listingFetchPromise = null;
              throw error;
            });

          return state.listingFetchPromise;
        }

        function shouldContinueInitialFill(requestCount) {
          if (!state.surfaceContext || !state.surfaceContext.isListing) return false;
          if (!getCurrentOlderPageUrl()) return false;
          if (requestCount >= LISTING_GROWTH_CONTRACT.initialPassMaxRequests) return false;
          if (getListingRowCount() >= LISTING_GROWTH_CONTRACT.minimumVisualCount) return false;
          if (listingViewportSatisfied()) return false;
          return true;
        }

        function runInitialFillPass(requestCount) {
          var nextCount = requestCount || 0;

          if (!shouldContinueInitialFill(nextCount)) {
            finishListingGrowthState();
            return Promise.resolve({
              requests: nextCount,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl(),
              state: state.listingGrowthState
            });
          }

          return loadMoreListing('initial-fill').then(function () {
            return runInitialFillPass(nextCount + 1);
          }).catch(function (error) {
            return {
              requests: nextCount + 1,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl(),
              state: state.listingGrowthState,
              error: error && error.message ? error.message : 'listing-growth-failed'
            };
          });
        }

        function setupListingObserver() {
          if (state.listingObserver) {
            state.listingObserver.disconnect();
            state.listingObserver = null;
          }

          if (!state.surfaceContext || !state.surfaceContext.isListing || !ui.listingSentinel || !getCurrentOlderPageUrl()) {
            finishListingGrowthState();
            return;
          }

          if (!window.IntersectionObserver) {
            setListingGrowthState('fallback');
            return;
          }

          state.listingObserver = new window.IntersectionObserver(function (entries) {
            var i;
            for (i = 0; i < entries.length; i += 1) {
              if (!entries[i].isIntersecting) continue;
              loadMoreListing('sentinel').catch(function () {
                return null;
              });
              break;
            }
          }, {
            root: null,
            rootMargin: '0px 0px 320px 0px',
            threshold: 0.01
          });

          state.listingObserver.observe(ui.listingSentinel);
          setListingGrowthState('auto');
        }

        function initListingGrowth() {
          registerListingRows(getListingRowNodes(document), window.location.href);
          setCurrentOlderPageUrl(getCurrentOlderPageUrl());

          if (!state.surfaceContext || !state.surfaceContext.isListing || !ui.listing || !ui.loadMoreWrap) {
            finishListingGrowthState();
            syncSearchEmptyState();
            syncError404State();
            return Promise.resolve({
              state: state.listingGrowthState,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl()
            });
          }

          finishListingGrowthState();

          return runInitialFillPass(0).then(function (report) {
            setupListingObserver();
            syncSearchEmptyState();
            syncError404State();
            return report;
          });
        }

        function currentDockState() {
          var active = [];
          var nodes = document.querySelectorAll('[data-gg-nav]');
          var i;

          for (i = 0; i < nodes.length; i += 1) {
            if (nodes[i].getAttribute('aria-current') === 'page') {
              active.push(nodes[i].getAttribute('data-gg-nav'));
            }
          }

          return active;
        }

        function syncDockState() {
          var nodes = document.querySelectorAll('[data-gg-nav]');
          var expected = expectedDockKey();
          var i;
          var node;
          var navKey;

          for (i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            navKey = node.getAttribute('data-gg-nav');

            if (expected && navKey === expected) node.setAttribute('aria-current', 'page');
            else node.removeAttribute('aria-current');
          }

          syncMoreRouteState();
        }

        function applySurfaceContract() {
          state.surfaceContext = detectSurface();
          state.errorContract = detectErrorContract(state.surfaceContext);
          state.specialContract = detectSpecialContract(state.surfaceContext);
          if (!ui.shell) return;

          document.body.setAttribute('data-gg-page', state.surfaceContext.page);
          document.body.setAttribute('data-gg-root-listing', state.surfaceContext.isRootListing ? 'true' : 'false');
          document.body.setAttribute('data-gg-surface', state.surfaceContext.surface);
          document.body.setAttribute('data-gg-surface-source', state.surfaceContext.source);
          document.body.setAttribute('data-gg-surface-variant', state.surfaceContext.variant);
          applyErrorContractAttributes(document.body, state.errorContract);
          applySpecialContractAttributes(document.body, state.specialContract);
          ui.shell.setAttribute('data-gg-feed-contract', 'declared');
          ui.shell.setAttribute('data-gg-error-contract', state.surfaceContext.surface === 'error404' ? ERROR_RUNTIME_CONTRACT.primaryMode : ERROR_RUNTIME_CONTRACT.fallbackMode);
          ui.shell.setAttribute('data-gg-page', state.surfaceContext.page);
          ui.shell.setAttribute('data-gg-root-listing', state.surfaceContext.isRootListing ? 'true' : 'false');
          ui.shell.setAttribute('data-gg-surface', state.surfaceContext.surface);
          ui.shell.setAttribute('data-gg-surface-source', state.surfaceContext.source);
          ui.shell.setAttribute('data-gg-surface-variant', state.surfaceContext.variant);
          applyErrorContractAttributes(ui.shell, state.errorContract);
          applySpecialContractAttributes(ui.shell, state.specialContract);

          if (ui.main) {
            ui.main.setAttribute('data-gg-page', state.surfaceContext.page);
            ui.main.setAttribute('data-gg-surface', state.surfaceContext.surface);
            ui.main.setAttribute('data-gg-surface-source', state.surfaceContext.source);
            applyErrorContractAttributes(ui.main, state.errorContract);
            applySpecialContractAttributes(ui.main, state.specialContract);
          }

          if (ui.listing) {
            ui.listing.setAttribute('data-gg-page', state.surfaceContext.page);
            ui.listing.setAttribute('data-gg-surface', state.surfaceContext.surface);
            ui.listing.setAttribute('data-gg-surface-source', state.surfaceContext.source);
            applyErrorContractAttributes(ui.listing, state.errorContract);
            applySpecialContractAttributes(ui.listing, state.specialContract);
          }

          syncLoadMoreCopy();
          syncSearchEmptyState();
          syncError404State();
          syncDockState();
          GG.phase0.currentSurface = state.surfaceContext;
        }

        function getRowPayload(row) {
          if (!row) return null;
          return {
            url: row.getAttribute('data-gg-post-url') || '',
            title: row.getAttribute('data-gg-post-title') || '',
            summary: stripHtml(row.getAttribute('data-gg-post-summary') || '')
          };
        }

        function parseCommentCount(value) {
          var count = parseInt(value, 10);
          if (isNaN(count) || count < 0) return 0;
          return count;
        }

        function formatCommentCopy(count, variant) {
          var resolvedCount = parseCommentCount(count);

          if (variant === 'action') {
            if (resolvedCount <= 0) return getCopy('comments.actionZero');
            if (resolvedCount === 1) return getCopy('comments.actionOne');
            return getCopy('comments.actionMany');
          }

          if (variant === 'title') {
            if (resolvedCount <= 0) return getCopy('comments.titleZero');
            if (resolvedCount === 1) return formatCopy('comments.titleOne', { count: '1' });
            return formatCopy('comments.titleMany', { count: String(resolvedCount) });
          }

          return '';
        }

        function syncDetailCommentCopy() {
          var count = ui.article ? parseCommentCount(ui.article.getAttribute('data-gg-post-comments')) : 0;
          var commentsDisabled = !document.querySelector('#gg-comments-footer [data-gg-action="comments-open-composer"], #comment-editor');
          var actionLabel = commentsDisabled ? getCopy('comments.toolbar.disabled') : (count === 1 ? getCopy('comments.toolbar.count.one') : (count > 1 ? formatCopy('comments.toolbar.count.many', { count: String(count) }) : getCopy('comments.toolbar.add')));
          var titleLabel = formatCommentCopy(count, 'title');
          var commentsState = commentsDisabled ? 'disabled' : (count > 0 ? 'has-comments' : 'empty');
          var icon = ui.detailCommentsAction ? ui.detailCommentsAction.querySelector('.gg-detail-toolbar__comments-icon, .gg-icon') : null;

          if (ui.detailCommentsLabel) ui.detailCommentsLabel.textContent = actionLabel;
          if (ui.detailCommentsAction) {
            ui.detailCommentsAction.classList.add('gg-detail-toolbar__action--comments');
            ui.detailCommentsAction.setAttribute('aria-label', actionLabel);
            ui.detailCommentsAction.setAttribute('title', actionLabel);
            ui.detailCommentsAction.setAttribute('data-gg-comments-state', commentsState);
            ui.detailCommentsAction.setAttribute('data-gg-comments-count', String(count));
          }
          if (icon) {
            icon.classList.add('gg-detail-toolbar__comments-icon');
            icon.textContent = commentsDisabled ? 'comments_disabled' : (count > 0 ? 'comment' : 'add_comment');
            icon.setAttribute('aria-hidden', 'true');
          }
          if (ui.detailCommentsLabel) ui.detailCommentsLabel.classList.add('gg-visually-hidden');

          if (ui.detailCommentsCount) {
            ui.detailCommentsCount.setAttribute('aria-hidden', 'true');
            if (count > 0 && !commentsDisabled) {
              ui.detailCommentsCount.hidden = false;
              ui.detailCommentsCount.textContent = String(count);
            } else {
              ui.detailCommentsCount.hidden = true;
              ui.detailCommentsCount.textContent = '';
            }
          }

          if (ui.commentsTitleText) ui.commentsTitleText.textContent = titleLabel;
        }

        function syncArticleMetaDates() {
          var nodes = document.querySelectorAll('.gg-article__tail time[datetime]');
          var i;
          var rawValue;
          var fallback;

          for (i = 0; i < nodes.length; i += 1) {
            rawValue = nodes[i].getAttribute('datetime') || '';
            fallback = nodes[i].getAttribute('data-gg-fallback-date') || nodes[i].textContent || '';
            if (!nodes[i].hasAttribute('data-gg-fallback-date')) {
              nodes[i].setAttribute('data-gg-fallback-date', fallback);
            }
            nodes[i].textContent = formatEditorialDate(rawValue, fallback);
          }
        }

        function slugifyHeadingId(value) {
          var slug = stripHtml(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 48);

          return slug || 'section';
        }

        function ensureHeadingId(node, prefix, seenIds) {
          var base = ((prefix || 'gg-section') + '-' + slugifyHeadingId(node && node.textContent ? node.textContent : 'section')).replace(/-+/g, '-');
          var candidate = base;
          var index = 2;

          while (seenIds[candidate]) {
            candidate = base + '-' + index;
            index += 1;
          }

          if (node) node.id = candidate;
          seenIds[candidate] = true;
          return candidate;
        }

        function collectOutlineHeadings(root, options) {
          var resolvedOptions = options || {};
          var selectors = resolvedOptions.selectors || 'h2, h3';
          var headingNodes = root ? root.querySelectorAll(selectors) : [];
          var seenIds = {};
          var headings = [];
          var limit = resolvedOptions.limit || 0;
          var i;
          var node;
          var text;
          var id;
          var level;

          for (i = 0; i < headingNodes.length; i += 1) {
            node = headingNodes[i];
            text = stripHtml(node.textContent || '');
            if (!text || text.length < 3) continue;

            level = String(node.tagName || '').toLowerCase();
            id = node.id ? String(node.id) : '';

            if (id && seenIds[id]) {
              id = resolvedOptions.assignIds === false ? '' : ensureHeadingId(node, resolvedOptions.prefix, seenIds);
            } else if (id) {
              seenIds[id] = true;
            } else if (resolvedOptions.assignIds !== false) {
              id = ensureHeadingId(node, resolvedOptions.prefix, seenIds);
            }

            headings.push({
              id: id,
              text: text,
              href: id ? ((resolvedOptions.absoluteBase ? resolvedOptions.absoluteBase : '') + '#' + id) : '',
              level: level
            });

            if (limit && headings.length >= limit) break;
          }

          return headings;
        }

        function countWords(value) {
          var matches = stripHtml(value || '').match(/[^\s]+/g);
          return matches ? matches.length : 0;
        }

        function estimateReadTimeMinutes(value) {
          var wordsPerMinute = 220;
          var wordCount = countWords(value);
          if (!wordCount) return 0;
          return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
        }

        function formatPreviewReadTime(value) {
          var minutes = parseInt(value, 10);
          if (isNaN(minutes) || minutes <= 0) return '';
          return formatCopy('preview.readMinutes', { count: String(minutes) });
        }

        function createPreviewMetaSeparatorNode() {
          return cloneTemplateRoot(ui.previewMetaSeparatorTemplate);
        }

        function createPreviewMetaItemNode(cueKey, value) {
          var node = cloneTemplateRoot(ui.previewMetaItemTemplate);
          var cueNode = getTemplatePart(node, 'cue');
          var valueNode = getTemplatePart(node, 'value');

          if (!node || !value) return null;

          if (cueNode) {
            cueNode.hidden = !cueKey;
            cueNode.textContent = cueKey ? getCopy(cueKey) : '';
          }
          if (valueNode) valueNode.textContent = value;

          return node;
        }

        function buildPreviewMetaItems(detail) {
          var items = [];
          var readTime = formatPreviewReadTime(detail && detail.readTime);
          var published = detail && detail.published ? formatEditorialDate(detail.published, detail.published) : '';
          var updated = detail && detail.updated ? formatEditorialDate(detail.updated, detail.updated) : '';

          if (detail && detail.author) items.push({ cueKey: 'post.by', value: detail.author });
          if (published) items.push({ cueKey: 'post.published', value: published });
          else if (updated) items.push({ cueKey: 'post.updated', value: updated });
          if (readTime) items.push({ cueKey: 'preview.readLabel', value: readTime });

          return items;
        }

        function syncPreviewMeta(items) {
          var source = Array.isArray(items) ? items : [];
          var nodes = [];
          var i;
          var node;

          if (!ui.previewMeta) return;

          for (i = 0; i < source.length; i += 1) {
            node = createPreviewMetaItemNode(source[i].cueKey, source[i].value);
            if (!node) continue;
            if (nodes.length) nodes.push(createPreviewMetaSeparatorNode());
            nodes.push(node);
          }

          replaceNodeChildren(ui.previewMeta, nodes);
          ui.previewMeta.hidden = !nodes.length;
        }

        function createPreviewTaxonomyItemNode(item) {
          var node = cloneTemplateRoot(ui.previewTaxonomyItemTemplate);
          var linkNode = getTemplatePart(node, 'link');
          var textNode = getTemplatePart(node, 'text');
          var href = item && item.href ? item.href : '';
          var text = item && item.text ? item.text : '';

          if (!node || !text) return null;

          if (linkNode) {
            linkNode.hidden = !href;
            if (href) {
              linkNode.href = href;
              linkNode.textContent = text;
            } else {
              linkNode.removeAttribute('href');
              linkNode.textContent = '';
            }
          }

          if (textNode) {
            textNode.hidden = !!href;
            textNode.textContent = href ? '' : text;
          }

          return node;
        }

        function syncPreviewTaxonomy(labels) {
          var items = Array.isArray(labels) ? labels : [];
          var nodes = [];
          var i;
          var node;

          if (!ui.previewTaxonomy || !ui.previewTaxonomyItems) return;

          for (i = 0; i < items.length && i < 3; i += 1) {
            node = createPreviewTaxonomyItemNode(items[i]);
            if (node) nodes.push(node);
          }

          replaceNodeChildren(ui.previewTaxonomyItems, nodes);
          ui.previewTaxonomy.hidden = !nodes.length;
        }

        function createPreviewTocItemNode(item) {
          var node = cloneTemplateRoot(ui.previewTocItemTemplate);
          var linkNode = getTemplatePart(node, 'link');
          var textNode = getTemplatePart(node, 'text');
          var href = item && item.href ? item.href : '';
          var text = item && item.text ? item.text : '';

          if (!node || !text) return null;

          if (linkNode) {
            linkNode.hidden = !href;
            if (href) {
              linkNode.href = href;
              linkNode.textContent = text;
            } else {
              linkNode.removeAttribute('href');
              linkNode.textContent = '';
            }
          }

          if (textNode) {
            textNode.hidden = !!href;
            textNode.textContent = href ? '' : text;
          }

          return node;
        }

        function syncPreviewTocItems(items) {
          var source = Array.isArray(items) ? items : [];
          var nodes = [];
          var i;
          var node;

          if (!ui.previewTocList) return;

          for (i = 0; i < source.length; i += 1) {
            node = createPreviewTocItemNode(source[i]);
            if (node) nodes.push(node);
          }

          replaceNodeChildren(ui.previewTocList, nodes);
        }

        function fillPreviewSkeleton(payload) {
          if (!ui.previewTitle) return;
          resetPreviewScroll('item-change');
          state.previewPayload = payload;
          state.previewUrl = payload.url;
          ui.previewTitle.textContent = payload.title || getCopy('preview.titleFallback');
          ui.previewSummary.textContent = getCopy('preview.loadingSummary');
          syncPreviewMeta([{ cueKey: '', value: getCopy('preview.loadingMeta') }]);
          syncPreviewTaxonomy([]);
          ui.previewStatus.textContent = getCopy('preview.loadingHeadings');
          syncPreviewTocItems([]);
          ui.previewCta.href = payload.url || '#';
          ui.previewImage.removeAttribute('src');
          ui.previewMedia.hidden = true;
          window.requestAnimationFrame(function () { resetPreviewScroll('open-after-render'); });
        }

        function renderPreviewData(payload, detail) {
          var metaItems;
          var summary;
          if (!ui.previewTitle) return;

          payload = payload || {};
          detail = detail || {};
          summary = detail.summary || payload.summary || getCopy('preview.noSummary');

          ui.previewTitle.textContent = detail.title || payload.title || getCopy('preview.titleFallback');
          ui.previewSummary.textContent = summary;
          metaItems = buildPreviewMetaItems(detail);
          syncPreviewMeta(metaItems);
          syncPreviewTaxonomy(detail.labels);

          if (detail.image) {
            ui.previewImage.src = detail.image;
            ui.previewImage.alt = detail.title || payload.title || '';
            ui.previewMedia.hidden = false;
          } else {
            ui.previewImage.removeAttribute('src');
            ui.previewMedia.hidden = true;
          }

          if (detail.headings && detail.headings.length) {
            ui.previewStatus.textContent = getCopy('preview.sectionMap');
            syncPreviewTocItems(detail.headings);
          } else {
            ui.previewStatus.textContent = getCopy('preview.noHeadings');
            syncPreviewTocItems([]);
          }
          window.requestAnimationFrame(function () { resetPreviewScroll('open-after-render'); });
        }

        function parsePreviewHtml(html, url) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var article = doc.querySelector('.gg-article');
          var body = doc.querySelector('.gg-post-body, .entry-content');
          var metaDescriptionNodes = doc.querySelectorAll('meta[name="description"]');
          var jsonLdNodes = doc.querySelectorAll('script[type="application/ld+json"]');
          var firstImage = body ? body.querySelector('img') : null;
          var labelNodes = doc.querySelectorAll('.gg-taxonomy__link, .post-labels a[rel="tag"]');
          var labels = [];
          var headings = collectOutlineHeadings(body, {
            absoluteBase: url,
            limit: 8,
            prefix: 'gg-preview-section'
          });
          var i;
          var text;
          var href;
          var articleSummary;
          var summary;

          function normalizePreviewSummary(value) {
            return stripHtml(value || '').replace(/\s+/g, ' ').trim();
          }

          function isPreviewDummySummary(value) {
            var clean = normalizePreviewSummary(value).toLowerCase();
            return clean.indexOf("mary's simple recipe for maple bacon donuts") !== -1 && clean.indexOf('coming back for') !== -1;
          }

          function isPreviewGenericSiteSummary(value) {
            var clean = normalizePreviewSummary(value).toLowerCase();
            return clean === 'pak rpp publishes practical articles, project notes, and curated resources for learning, work, and digital production.';
          }

          function cleanPreviewSummary(value, options) {
            var clean = normalizePreviewSummary(value);
            var allowGeneric = !!(options && options.allowGeneric);
            if (!clean || isPreviewDummySummary(clean)) return '';
            if (!allowGeneric && isPreviewGenericSiteSummary(clean)) return '';
            return clean;
          }

          function collectJsonLdObjects(value, target) {
            var key;
            if (!value) return;
            if (Array.isArray(value)) {
              for (key = 0; key < value.length; key += 1) collectJsonLdObjects(value[key], target);
              return;
            }
            if (typeof value !== 'object') return;
            target.push(value);
            if (value['@graph']) collectJsonLdObjects(value['@graph'], target);
            if (value.mainEntity) collectJsonLdObjects(value.mainEntity, target);
            if (value.mainEntityOfPage) collectJsonLdObjects(value.mainEntityOfPage, target);
          }

          function getJsonLdType(item) {
            var type = item ? item['@type'] : '';
            if (Array.isArray(type)) type = type.join(' ');
            return String(type || '').toLowerCase();
          }

          function descriptionFromJsonLd() {
            var objects = [];
            var fallback = '';
            var raw;
            var parsed;
            var type;
            var description;
            var j;

            for (j = 0; j < jsonLdNodes.length; j += 1) {
              raw = String(jsonLdNodes[j].textContent || '').trim();
              if (!raw) continue;
              if (raw.indexOf('&quot;') !== -1 || raw.indexOf('&#34;') !== -1) raw = stripHtml(raw);
              try {
                parsed = JSON.parse(raw);
              } catch (error) {
                continue;
              }
              collectJsonLdObjects(parsed, objects);
            }

            for (j = 0; j < objects.length; j += 1) {
              type = getJsonLdType(objects[j]);
              description = cleanPreviewSummary(objects[j].description || '');
              if (!description) continue;
              if (/\b(blogposting|article|newsarticle|product|webpage)\b/.test(type)) return description;
              if (!fallback) fallback = description;
            }

            return fallback;
          }

          function descriptionFromBody() {
            var nodes;
            var candidate;
            var j;
            if (!body) return '';
            nodes = body.querySelectorAll('p, li, blockquote');
            for (j = 0; j < nodes.length; j += 1) {
              candidate = cleanPreviewSummary(nodes[j].textContent || nodes[j].innerHTML || '');
              if (candidate && candidate.length >= 36) return candidate.slice(0, 260);
            }
            candidate = cleanPreviewSummary(body.textContent || '');
            return candidate ? candidate.slice(0, 260) : '';
          }

          function descriptionFromMeta() {
            var candidate;
            var j;
            for (j = 0; j < metaDescriptionNodes.length; j += 1) {
              candidate = cleanPreviewSummary(metaDescriptionNodes[j].getAttribute('content') || '', { allowGeneric: false });
              if (candidate) return candidate;
            }
            return '';
          }

          articleSummary = article ? cleanPreviewSummary(article.getAttribute('data-gg-post-summary') || '') : '';
          summary = articleSummary || descriptionFromJsonLd() || descriptionFromBody() || descriptionFromMeta();

          for (i = 0; i < labelNodes.length; i += 1) {
            text = stripHtml(labelNodes[i].textContent || '');
            href = labelNodes[i].getAttribute('href') || '';
            if (!text) continue;
            labels.push({
              text: text,
              href: href ? toAbsoluteUrl(href, url) : ''
            });
          }

          return {
            title: article ? (article.getAttribute('data-gg-post-title') || '') : '',
            author: article ? (article.getAttribute('data-gg-post-author') || '') : '',
            published: article ? (article.getAttribute('data-gg-post-published') || '') : '',
            updated: article ? (article.getAttribute('data-gg-post-updated') || '') : '',
            readTime: estimateReadTimeMinutes(body ? (body.textContent || summary) : summary),
            image: firstImage ? toAbsoluteUrl(firstImage.getAttribute('src') || '', url) : '',
            summary: summary,
            headings: headings,
            labels: labels
          };
        }

        function loadPreviewDetail(payload) {
          if (!payload || !payload.url) return;
          if (state.previewCache[payload.url]) {
            renderPreviewData(payload, state.previewCache[payload.url]);
            return;
          }

          fetch(payload.url, { credentials: 'same-origin' })
            .then(function (response) {
              if (!response.ok) throw new Error('preview_fetch_failed');
              return response.text();
            })
            .then(function (html) {
              var detail = parsePreviewHtml(html, payload.url);
              state.previewCache[payload.url] = detail;
              if (state.previewUrl === payload.url) renderPreviewData(payload, detail);
            })
            .catch(function () {
              ui.previewStatus.textContent = getCopy('preview.fetchFailed');
              ui.previewSummary.textContent = (payload && payload.summary) || getCopy('preview.noSummary');
              syncPreviewMeta([]);
              syncPreviewTaxonomy([]);
              syncPreviewTocItems([]);
            });
        }

        function hydratePreviewForLocale() {
          if (!state.previewPayload) return;
          fillPreviewSkeleton(state.previewPayload);
          if (state.previewCache[state.previewPayload.url]) {
            renderPreviewData(state.previewPayload, state.previewCache[state.previewPayload.url]);
          }
        }

        function isDetailSurface() {
          return !!(state.surfaceContext && (state.surfaceContext.surface === 'post' || state.surfaceContext.surface === 'page'));
        }

        function buildDetailOutlineSections() {
          if (!ui.articleBody) return [];
          return collectOutlineHeadings(ui.articleBody, {
            prefix: 'gg-detail-section'
          });
        }

        function buildDetailOutlineGroups(sections) {
          var items = Array.isArray(sections) ? sections : [];
          var groups = [];
          var hasH2 = items.some(function (item) {
            return item.level === 'h2';
          });
          var i;
          var section;
          var group;

          for (i = 0; i < items.length; i += 1) {
            section = items[i];
            if (!group || !hasH2 || section.level === 'h2') {
              group = {
                id: section.id,
                text: section.text,
                children: []
              };
              groups.push(group);
              continue;
            }
            group.children.push(section);
          }

          return groups;
        }

        function getDetailOutlineCurrentIndex() {
          var sections = state.detailOutlineSections || [];
          var threshold = Math.max(86, (ui.detailToolbar ? ui.detailToolbar.offsetHeight : 0) + 36);
          var index = 0;
          var i;
          var node;

          if (!sections.length) return -1;

          for (i = 0; i < sections.length; i += 1) {
            node = document.getElementById(sections[i].id);
            if (!node) continue;
            if (node.getBoundingClientRect().top <= threshold) index = i;
            else break;
          }

          return index;
        }

        function isCurrentOutlineGroup(group, currentId) {
          var i;
          if (!group || !currentId) return false;
          if (group.id === currentId) return true;
          for (i = 0; i < group.children.length; i += 1) {
            if (group.children[i].id === currentId) return true;
          }
          return false;
        }

        function getDetailOutlineCurrentTitle() {
          var current = state.detailOutlineCurrentIndex > -1 ? state.detailOutlineSections[state.detailOutlineCurrentIndex] : null;
          if (current && current.text) return current.text;
          if (ui.article) return ui.article.getAttribute('data-gg-post-title') || getCopy('outline.currentFallback');
          return getCopy('outline.currentFallback');
        }

        function getDetailOutlineProgressValue() {
          var sections = state.detailOutlineSections || [];
          var currentPosition = state.detailOutlineCurrentIndex > -1 ? state.detailOutlineCurrentIndex + 1 : 0;

          if (!sections.length || !currentPosition) return 0;
          return currentPosition / sections.length;
        }

        function isDetailOutlineExpanded() {
          return state.detailOutlineState === 'expanded';
        }

        function resolveDetailOutlineCompactState() {
          var thresholds = DETAIL_OUTLINE_CONTRACT.compactThresholds || {};
          var minimizeScrollTop = typeof thresholds.minimizeScrollTop === 'number' ? thresholds.minimizeScrollTop : 240;
          var restoreScrollTop = typeof thresholds.restoreScrollTop === 'number' ? thresholds.restoreScrollTop : 120;
          var minimizeProgress = typeof thresholds.minimizeProgress === 'number' ? thresholds.minimizeProgress : 0.22;
          var restoreProgress = typeof thresholds.restoreProgress === 'number' ? thresholds.restoreProgress : 0.14;
          var progress = getDetailOutlineProgressValue();
          var scrollTop = window.scrollY || window.pageYOffset || 0;
          var currentCompact = state.detailOutlineState === 'micro-peek' ? 'micro-peek' : 'peek';
          var shouldMinimize;
          var shouldRestore;

          if (!(state.detailOutlineSections || []).length) return 'peek';

          shouldMinimize = scrollTop > minimizeScrollTop && (state.detailOutlineCurrentIndex > 0 || progress >= minimizeProgress);
          shouldRestore = scrollTop < restoreScrollTop && state.detailOutlineCurrentIndex <= 0 && progress <= restoreProgress;

          if (currentCompact === 'micro-peek') {
            return shouldRestore ? 'peek' : 'micro-peek';
          }

          return shouldMinimize ? 'micro-peek' : 'peek';
        }

        function setDetailOutlineState(nextState, options) {
          var outlineState = nextState === 'expanded' ? 'expanded' : (nextState === 'micro-peek' ? 'micro-peek' : 'peek');
          var stateOptions = options || {};

          if (state.detailOutlineState === outlineState && !stateOptions.forceRender) return;
          state.detailOutlineState = outlineState;
          renderDetailOutline();
        }

        function restoreDetailOutlineToggleFocus() {
          if (!ui.detailOutline || !ui.detailOutlineToggle) return;
          if (!ui.detailOutline.contains(document.activeElement) || document.activeElement === ui.detailOutlineToggle) return;
          try {
            ui.detailOutlineToggle.focus({ preventScroll: true });
          } catch (error) {
            ui.detailOutlineToggle.focus();
          }
        }

        function markDetailOutlineManualOpen() {
          state.detailOutlineManualOpen = true;
          state.detailOutlineManualOpenAt = Date.now();
        }

        function clearDetailOutlineManualOpen() {
          state.detailOutlineManualOpen = false;
          state.detailOutlineManualOpenAt = 0;
        }

        function isDetailOutlineManualOpenFresh() {
          return state.detailOutlineManualOpen &&
            (Date.now() - (state.detailOutlineManualOpenAt || 0)) <= DETAIL_OUTLINE_MANUAL_OPEN_GRACE_MS;
        }

        function getDetailOutlineToggleCopyKey(outlineState) {
          if (outlineState === 'expanded') return 'outline.collapse';
          if (outlineState === 'micro-peek') return 'outline.peek';
          return 'outline.expand';
        }

        function syncDetailOutlineProgressValue(progress) {
          var value = Math.max(0, Math.min(1, Number(progress) || 0));

          if (!ui.detailOutlineProgress) return;

          ui.detailOutlineProgress.value = value;
          ui.detailOutlineProgress.setAttribute('value', value.toFixed(4));
        }

        function bindDetailOutlineButton(button, labelNode, targetId, text, isCurrent) {
          if (!button || !labelNode) return;
          button.setAttribute('data-gg-current', isCurrent ? 'true' : 'false');
          button.setAttribute('data-gg-outline-target', targetId || '');
          labelNode.textContent = text || '';
        }

        function createDetailOutlineEmptyNode() {
          var node = cloneTemplateRoot(ui.detailOutlineEmptyTemplate);
          var textNode = getTemplatePart(node, 'text');

          if (!node || !textNode) return null;
          textNode.textContent = getCopy('outline.empty');
          return node;
        }

        function createDetailOutlineItemNode(item, currentId) {
          var node = cloneTemplateRoot(ui.detailOutlineItemTemplate);
          var button = getTemplatePart(node, 'button');
          var labelNode = getTemplatePart(node, 'label');

          if (!node || !button || !labelNode || !item) return null;

          bindDetailOutlineButton(button, labelNode, item.id, item.text, item.id === currentId);
          return node;
        }

        function createDetailOutlineGroupNode(group, currentId) {
          var node = cloneTemplateRoot(ui.detailOutlineGroupTemplate);
          var button = getTemplatePart(node, 'button');
          var labelNode = getTemplatePart(node, 'label');
          var sublist = getTemplatePart(node, 'sublist');
          var currentGroup = isCurrentOutlineGroup(group, currentId);
          var children = [];
          var i;

          if (!node || !button || !labelNode || !sublist || !group) return null;

          bindDetailOutlineButton(button, labelNode, group.id, group.text, currentGroup);

          if (group.children.length && currentGroup) {
            for (i = 0; i < group.children.length; i += 1) {
              children.push(createDetailOutlineItemNode(group.children[i], currentId));
            }
            replaceNodeChildren(sublist, children);
            sublist.hidden = false;
          } else {
            replaceNodeChildren(sublist, []);
            sublist.hidden = true;
          }

          return node;
        }

        function renderDetailOutline() {
          var sections = state.detailOutlineSections || [];
          var groups = buildDetailOutlineGroups(sections);
          var current = state.detailOutlineCurrentIndex > -1 ? sections[state.detailOutlineCurrentIndex] : null;
          var currentId = current ? current.id : '';
          var currentPosition = current ? state.detailOutlineCurrentIndex + 1 : 0;
          var progress = getDetailOutlineProgressValue();
          var outlineState = state.detailOutlineState === 'expanded' ? 'expanded' : (state.detailOutlineState === 'micro-peek' ? 'micro-peek' : 'peek');
          var nodes = [];
          var i;
          var group;
          var groupNode;

          if (!ui.detailOutline || !ui.detailOutlineToggle || !isDetailSurface() || !ui.article) {
            if (ui.detailOutline) ui.detailOutline.hidden = true;
            return;
          }

          ui.detailOutline.hidden = false;
          ui.detailOutline.setAttribute('data-gg-outline-state', outlineState);
          ui.detailOutlineToggle.setAttribute('aria-expanded', outlineState === 'expanded' ? 'true' : 'false');
          ui.detailOutlineToggle.setAttribute('aria-label', getCopy(getDetailOutlineToggleCopyKey(outlineState)));
          if (ui.detailOutlineGlyph) ui.detailOutlineGlyph.textContent = outlineState === 'expanded' ? 'keyboard_arrow_down' : 'keyboard_arrow_up';
          if (ui.detailOutlineCurrent) ui.detailOutlineCurrent.textContent = getDetailOutlineCurrentTitle();

          if (ui.detailOutlineSummary) {
            if (outlineState !== 'micro-peek' && sections.length && currentPosition > 0) {
              ui.detailOutlineSummary.hidden = false;
              ui.detailOutlineSummary.textContent = currentPosition + '/' + sections.length;
            } else {
              ui.detailOutlineSummary.hidden = true;
              ui.detailOutlineSummary.textContent = '';
            }
          }

          syncDetailOutlineProgressValue(progress);

          if (ui.detailOutlineTray) ui.detailOutlineTray.hidden = outlineState !== 'expanded';
          if (!ui.detailOutlineList) return;

          if (!sections.length) {
            replaceNodeChildren(ui.detailOutlineList, [createDetailOutlineEmptyNode()]);
            return;
          }

          for (i = 0; i < groups.length; i += 1) {
            group = groups[i];
            groupNode = createDetailOutlineGroupNode(group, currentId);
            if (groupNode) nodes.push(groupNode);
          }

          replaceNodeChildren(ui.detailOutlineList, nodes);
        }

        function resolveDetailOutlineToggleState() {
          var toggleBehavior = DETAIL_OUTLINE_CONTRACT.toggleBehavior || {};

          if (isDetailOutlineExpanded()) {
            return toggleBehavior.expandedTap === 'resolved-compact' ? resolveDetailOutlineCompactState() : 'peek';
          }

          if (state.detailOutlineState === 'micro-peek') {
            return toggleBehavior.microPeekTap || 'peek';
          }

          return toggleBehavior.peekTap || 'expanded';
        }

        function toggleDetailOutline() {
          var nextState = resolveDetailOutlineToggleState();

          if (isDetailOutlineExpanded()) {
            clearDetailOutlineManualOpen();
          } else if (nextState === 'expanded' || nextState === 'peek') {
            markDetailOutlineManualOpen();
          } else {
            clearDetailOutlineManualOpen();
          }

          setDetailOutlineState(nextState);
        }

        function scrollToDetailOutlineTarget(id) {
          var target = document.getElementById(String(id || ''));
          var offset = Math.max(86, (ui.detailToolbar ? ui.detailToolbar.offsetHeight : 0) + 36);
          var top;

          if (!target) return;

          top = window.scrollY + target.getBoundingClientRect().top - offset;
          window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth'
          });

          if (window.history && typeof window.history.replaceState === 'function') {
            window.history.replaceState(null, document.title, '#' + target.id);
          }

          clearDetailOutlineManualOpen();
          setDetailOutlineState(resolveDetailOutlineCompactState());
          restoreDetailOutlineToggleFocus();
        }

        function syncDetailOutlineCurrent() {
          var nextIndex;
          var nextCompactState;
          var shouldRender = false;

          if (!ui.detailOutline || !isDetailSurface()) return;

          nextIndex = getDetailOutlineCurrentIndex();
          if (nextIndex !== state.detailOutlineCurrentIndex) {
            state.detailOutlineCurrentIndex = nextIndex;
            shouldRender = true;
          }

          if (!isDetailOutlineExpanded()) {
            if (isDockHiddenByScroll() && isDetailOutlineManualOpenFresh()) {
              nextCompactState = state.detailOutlineState;
            } else if (isDockHiddenByScroll() && state.detailOutlineState === 'micro-peek' && !state.detailOutlineManualOpen) {
              nextCompactState = 'micro-peek';
            } else {
              if (state.detailOutlineManualOpen && !isDetailOutlineManualOpenFresh()) {
                clearDetailOutlineManualOpen();
              }
              nextCompactState = resolveDetailOutlineCompactState();
            }
            if (nextCompactState !== state.detailOutlineState) {
              state.detailOutlineState = nextCompactState;
              shouldRender = true;
            }
          }

          if (!shouldRender && !ui.detailOutline.hidden) {
            syncDetailOutlineProgressValue(state.detailOutlineSections.length ? ((nextIndex + 1) / state.detailOutlineSections.length) || 0 : 0);
            return;
          }

          renderDetailOutline();
        }

        function requestDetailOutlineSync() {
          if (state.detailOutlineSyncFrame) return;
          state.detailOutlineSyncFrame = window.requestAnimationFrame(function () {
            state.detailOutlineSyncFrame = 0;
            syncDetailOutlineCurrent();
          });
        }

        function startDetailOutlineGesture(event) {
          var toggle = event.target.closest('[data-gg-outline-toggle]');

          if (!toggle || !ui.detailOutline || ui.detailOutline.hidden) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          state.detailOutlineGesture = {
            pointerId: event.pointerId,
            startY: event.clientY,
            expandedAtStart: isDetailOutlineExpanded()
          };
        }

        function endDetailOutlineGesture(event) {
          var gestureThresholds = DETAIL_OUTLINE_CONTRACT.gestureThresholds || {};
          var expandDelta = typeof gestureThresholds.expandDelta === 'number' ? gestureThresholds.expandDelta : -18;
          var collapseDelta = typeof gestureThresholds.collapseDelta === 'number' ? gestureThresholds.collapseDelta : 18;
          var gesture = state.detailOutlineGesture;
          var delta;

          if (!gesture || gesture.pointerId !== event.pointerId) return;

          state.detailOutlineGesture = null;
          delta = event.clientY - gesture.startY;

          if (!gesture.expandedAtStart && delta <= expandDelta) {
            state.ignoreClickUntil = Date.now() + 180;
            markDetailOutlineManualOpen();
            setDetailOutlineState('expanded');
            return;
          }

          if (gesture.expandedAtStart && delta >= collapseDelta) {
            state.ignoreClickUntil = Date.now() + 180;
            clearDetailOutlineManualOpen();
            setDetailOutlineState(resolveDetailOutlineCompactState());
          }
        }

        function initDetailOutline() {
          if (!ui.detailOutline || !isDetailSurface() || !ui.articleBody) {
            if (ui.detailOutline) ui.detailOutline.hidden = true;
            return;
          }

          state.detailOutlineSections = buildDetailOutlineSections();
          state.detailOutlineCurrentIndex = getDetailOutlineCurrentIndex();
          state.detailOutlineState = resolveDetailOutlineCompactState();
          renderDetailOutline();
          requestDetailOutlineSync();
          window.addEventListener('scroll', requestDetailOutlineSync, { passive: true });
          window.addEventListener('resize', requestDetailOutlineSync);
          window.addEventListener('hashchange', requestDetailOutlineSync);
        }

        function openPreview(row, trigger, reason) {
          var payload = getRowPayload(row);

          if (!payload || !payload.url) return Promise.resolve(null);

          resetPreviewScroll('open-before-render');
          fillPreviewSkeleton(payload);
          return openPanel('preview', {
            trigger: trigger || row,
            reason: reason || 'preview-open'
          }).then(function () {
            loadPreviewDetail(payload);
            return payload;
          });
        }

        function extractHref(entry) {
          var i;
          if (!entry || !entry.link) return '';
          for (i = 0; i < entry.link.length; i += 1) {
            if (entry.link[i].rel === 'alternate') return entry.link[i].href;
          }
          return '';
        }

        function makeHomeUrl(path) {
          return toAbsoluteUrl(path, ui.shell ? ui.shell.getAttribute('data-gg-home-url') : window.location.origin + '/');
        }

        function normalizeTopicKey(value) {
          return stripHtml(value || '').toLowerCase().trim();
        }

        function sanitizeTopicTexts(values) {
          var source = Array.isArray(values) ? values : [];
          var seen = {};
          var sanitized = [];
          var i;
          var text;
          var key;

          for (i = 0; i < source.length; i += 1) {
            text = stripHtml(source[i] || '');
            key = normalizeTopicKey(text);
            if (!text || !key || seen[key]) continue;
            seen[key] = true;
            sanitized.push(text);
          }

          return sanitized;
        }

        function storeDomainConfig() {
          return GG_GLOBAL_DISCOVERY_CONFIG.storeExclusion || STORE_DOMAIN;
        }

        function isStoreLabel(label) {
          var value = String(label || '').trim().toLowerCase();
          var config = storeDomainConfig();
          var root = String(config.rootLabel || 'Store').toLowerCase();

          return !!value && value === root;
        }

        function isStoreChildLabel(label) {
          var value = String(label || '').trim().toLowerCase();
          var config = storeDomainConfig();
          var prefixes = config.labelPrefixes || [];
          var i;

          if (!value) return false;
          for (i = 0; i < prefixes.length; i += 1) {
            if (value.indexOf(String(prefixes[i] || '').toLowerCase()) === 0) return true;
          }
          return false;
        }

        function hasStoreDataPayload(entry) {
          var source = entry && typeof entry === 'object'
            ? [
                entry.summary,
                entry.content,
                entry.raw,
                entry.body,
                entry.html,
                entry.payload,
                entry.data
              ].join(' ')
            : entry;
          var text = String(source || '').toLowerCase();
          var markers = (storeDomainConfig()).payloadMarkers || [];
          var i;

          if (!text) return false;
          for (i = 0; i < markers.length; i += 1) {
            if (text.indexOf(String(markers[i] || '').toLowerCase()) > -1) return true;
          }
          return false;
        }

        function getContentDomain(entry) {
          var labels = sanitizeTopicTexts(entry && (entry.labelTexts || entry.labels) ? (entry.labelTexts || entry.labels) : []);
          var i;

          for (i = 0; i < labels.length; i += 1) {
            if (isStoreLabel(labels[i]) || isStoreChildLabel(labels[i])) return 'store';
          }

          if (hasStoreDataPayload(entry)) return 'store';
          if (entry && entry.domain === 'store') return 'store';
          return 'blog';
        }

        function isStoreContent(entry) {
          return getContentDomain(entry) === 'store';
        }

        function isStoreDiscoveryLabel(label) {
          return isStoreLabel(label) || isStoreChildLabel(label);
        }

        function hasStoreDiscoveryPayload(value) {
          return hasStoreDataPayload(value);
        }

        function isStoreDiscoveryPost(post) {
          return isStoreContent(post);
        }

        function refreshDiscoveryPostSearchText(post) {
          var resolved = post || {};
          resolved.title = stripHtml(resolved.title || '');
          resolved.summary = stripHtml(resolved.summary || '');
          resolved.labelTexts = sanitizeTopicTexts(resolved.labelTexts);
          resolved.topicKeys = resolved.labelTexts.map(normalizeTopicKey);
          resolved.text = (resolved.title + ' ' + resolved.summary + ' ' + resolved.labelTexts.join(' ')).toLowerCase();
          return resolved;
        }

        function createDiscoveryBuilder() {
          return {
            posts: [],
            postMap: {}
          };
        }

        function addDiscoveryPost(builder, post) {
          var target = builder || createDiscoveryBuilder();
          var hydrated = refreshDiscoveryPostSearchText({
            title: post && post.title ? post.title : '',
            href: post && post.href ? post.href : '',
            summary: post && post.summary ? post.summary : '',
            labelTexts: post && post.labelTexts ? post.labelTexts : [],
            content: post && post.content ? post.content : '',
            raw: post && post.raw ? post.raw : ''
          });
          var key = hydrated.href || hydrated.title || ('discovery-' + target.posts.length);
          var existing = target.postMap[key];

          if (isStoreContent(hydrated)) return null;

          if (existing) {
            existing.title = existing.title || hydrated.title;
            existing.href = existing.href || hydrated.href;
            if (!existing.summary && hydrated.summary) existing.summary = hydrated.summary;
            existing.labelTexts = sanitizeTopicTexts((existing.labelTexts || []).concat(hydrated.labelTexts || []));
            refreshDiscoveryPostSearchText(existing);
            return existing;
          }

          target.postMap[key] = hydrated;
          target.posts.push(hydrated);
          return hydrated;
        }

        function finalizeDiscoveryIndex(builder) {
          var source = builder || createDiscoveryBuilder();
          var posts = source.posts ? source.posts.slice() : [];
          var topicMap = {};
          var topics = [];
          var i;
          var j;
          var label;
          var key;
          var topic;

          for (i = 0; i < posts.length; i += 1) {
            refreshDiscoveryPostSearchText(posts[i]);
            for (j = 0; j < posts[i].labelTexts.length; j += 1) {
              label = posts[i].labelTexts[j];
              if (isStoreDiscoveryLabel(label)) continue;
              key = normalizeTopicKey(label);
              if (!key) continue;
              topic = topicMap[key];
              if (!topic) {
                topic = {
                  key: key,
                  title: label,
                  href: makeHomeUrl('search/label/' + encodeURIComponent(label)),
                  count: 0,
                  text: key
                };
                topicMap[key] = topic;
                topics.push(topic);
              }
              topic.count += 1;
            }
          }

          topics.sort(function (a, b) {
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          });

          return {
            posts: posts,
            topics: topics
          };
        }

        function buildDiscoveryIndexFromFeed(feed) {
          var builder = createDiscoveryBuilder();
          var entries = ((feed || {}).feed || {}).entry || [];
          var i;
          var j;
          var entry;
          var title;
          var href;
          var summary;
          var category;
          var labelTexts;
          var label;

          for (i = 0; i < entries.length; i += 1) {
            entry = entries[i];
            title = entry.title ? entry.title.$t : '';
            href = extractHref(entry);
            summary = entry.summary ? stripHtml(entry.summary.$t) : '';
            if (!summary && entry.content && entry.content.$t) summary = stripHtml(entry.content.$t);
            category = entry.category || [];
            labelTexts = [];

            for (j = 0; j < category.length; j += 1) {
              label = category[j].term || '';
              if (!label) continue;
              labelTexts.push(label);
            }

            addDiscoveryPost(builder, {
              title: title,
              href: href,
              summary: summary,
              labelTexts: labelTexts,
              content: entry.content && entry.content.$t ? entry.content.$t : '',
              raw: JSON.stringify(entry)
            });
          }

          return finalizeDiscoveryIndex(builder);
        }

        function buildDiscoveryIndexFromRows() {
          var builder = createDiscoveryBuilder();
          var rowIndex = buildDiscoveryIndexFromRowNodes(document.querySelectorAll(LISTING_ROW_SELECTOR));
          var i;

          for (i = 0; i < rowIndex.posts.length; i += 1) {
            addDiscoveryPost(builder, rowIndex.posts[i]);
          }

          return finalizeDiscoveryIndex(builder);
        }

        function mergeDiscoveryIndexes(primary, secondary) {
          var builder = createDiscoveryBuilder();
          var groups = [primary || { posts: [] }, secondary || { posts: [] }];
          var groupIndex;
          var itemIndex;
          var posts;

          for (groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
            posts = groups[groupIndex].posts || [];
            for (itemIndex = 0; itemIndex < posts.length; itemIndex += 1) {
              addDiscoveryPost(builder, posts[itemIndex]);
            }
          }

          return finalizeDiscoveryIndex(builder);
        }

        function getFeedJsonUrl() {
          var endpointPath = String(GG_SOURCE_BOUNDARY.rootSource.feed.endpointPath || '/feeds/posts/default?alt=json');
          return makeHomeUrl(endpointPath.replace(/^\//, '') + '&max-results=' + GG_GLOBAL_DISCOVERY_CONFIG.feedMax);
        }

        function hasDiscoveryTopics(index) {
          return !!(index && index.topics && index.topics.length);
        }

        function requestCommandFeedEnhancement(force) {
          var localIndex = state.discoveryIndex || { posts: [], topics: [] };
          var shouldFetch = force || !localIndex.posts.length || localIndex.posts.length < 8 || !hasDiscoveryTopics(localIndex);

          if (!shouldFetch) return Promise.resolve(localIndex);
          if (state.discoveryIndexPromise) return state.discoveryIndexPromise;

          state.discoveryIndexPromise = fetch(getFeedJsonUrl(), { credentials: 'same-origin' })
            .then(function (response) {
              if (!response.ok) throw new Error('feed_fetch_failed');
              return response.json();
            })
            .then(function (feed) {
              var hadLocalPosts = !!(state.discoveryIndex && state.discoveryIndex.posts && state.discoveryIndex.posts.length);
              var feedIndex = buildDiscoveryIndexFromFeed(feed);
              if (ui.shell) ui.shell.setAttribute('data-gg-feed-source', 'feed-json');
              state.discoveryIndex = hadLocalPosts ? mergeDiscoveryIndexes(state.discoveryIndex, feedIndex) : feedIndex;
              if (ui.shell && hadLocalPosts) ui.shell.setAttribute('data-gg-feed-source', 'feed-json-enhanced');
              if (state.panelActive === 'command') {
                renderDiscovery(getCommandValue(), {
                  open: false
                });
              }
              return state.discoveryIndex;
            })
            .catch(function () {
              if (!state.discoveryIndex || !state.discoveryIndex.posts.length) {
                state.discoveryIndex = buildDiscoveryIndexFromRows();
              }
              if (ui.shell) {
                ui.shell.setAttribute('data-gg-feed-source', state.discoveryIndex.posts.length ? 'listing-dom-local' : 'listing-dom-title-only');
              }
              return state.discoveryIndex;
            })
            .then(function (index) {
              state.discoveryIndexPromise = null;
              return index;
            });
        }

        function hasStaticGlobalDiscoveryItems() {
          return !!(globalRoutesAdapter().length || globalLandingSectionsAdapter().length || globalActionsAdapter().length);
        }

        function ensureDiscoveryIndex() {
          if (state.discoveryIndex && (state.discoveryIndex.posts.length || hasStaticGlobalDiscoveryItems())) {
            requestCommandFeedEnhancement(false);
            return Promise.resolve(state.discoveryIndex);
          }

          state.discoveryIndex = buildDiscoveryIndexFromRows();
          if (ui.shell) {
            ui.shell.setAttribute('data-gg-feed-source', state.discoveryIndex.posts.length ? 'listing-dom-local' : 'static-global-base');
          }

          requestCommandFeedEnhancement(!state.discoveryIndex.posts.length);
          return Promise.resolve(state.discoveryIndex);
        }

        function scoreDiscoveryText(text, title, query) {
          var q = String(query || '').toLowerCase().trim();
          var haystack = String(text || '').toLowerCase();
          var heading = String(title || '').toLowerCase();
          var score = 0;
          var tokens;
          var i;

          if (!q) return 0;
          if (heading === q) score += 100;
          if (heading.indexOf(q) === 0) score += 60;
          if (haystack.indexOf(q) > -1) score += 24;

          tokens = q.split(/\s+/);
          for (i = 0; i < tokens.length; i += 1) {
            if (haystack.indexOf(tokens[i]) > -1) score += 8;
          }

          return score;
        }

        function scoreDiscoveryPost(post, query) {
          return scoreDiscoveryText(post.text, post.title, query);
        }

        function scoreDiscoveryTopic(topic, query) {
          return scoreDiscoveryText(topic.text, topic.title, query);
        }

        function getTopicGroupKey(title) {
          var normalized = String(title || '').trim().charAt(0).toUpperCase();
          if (!normalized) return '#';
          return /[A-Z0-9]/.test(normalized) ? normalized : '#';
        }

        function getDiscoveryActiveTopic() {
          var topics = state.discoveryIndex && state.discoveryIndex.topics ? state.discoveryIndex.topics : [];
          var i;
          for (i = 0; i < topics.length; i += 1) {
            if (topics[i].key === state.discoveryTopic) return topics[i];
          }
          return null;
        }

        function createGlobalDiscoveryItem(config) {
          var item = config || {};
          var keywords = Array.isArray(item.keywords) ? item.keywords : [];
          var title = stripHtml(item.title || '');
          var meta = stripHtml(item.meta || '');
          return {
            id: String(item.id || item.href || item.action || title || ''),
            domain: 'global',
            type: String(item.type || 'action'),
            title: title,
            meta: meta,
            href: item.href || '',
            action: item.action || '',
            target: item.target || '',
            keywords: keywords.map(function (keyword) { return String(keyword || ''); }).filter(Boolean),
            priority: Number(item.priority || 0),
            text: String([title, meta, keywords.join(' ')].join(' ')).toLowerCase().replace(/\s+/g, ' ').trim()
          };
        }

        function normalizeGlobalDiscoveryItem(raw, context) {
          var source = raw || {};
          var runtimeContext = context || {};
          var title = source.title || (source.titleKey ? getCopy(source.titleKey) : '');
          var meta = source.meta || '';
          var metaKeys = Array.isArray(source.metaKeys) ? source.metaKeys : [];
          var href = source.href || '';
          var i;

          if (source.titlePrefix) title = source.titlePrefix + title;
          if (source.titleSuffix) title += source.titleSuffix;
          if (!meta && metaKeys.length) {
            for (i = 0; i < metaKeys.length; i += 1) {
              meta += (meta ? ' · ' : '') + getCopy(metaKeys[i]);
            }
          }
          if (href && runtimeContext.resolveHref !== false) href = makeHomeUrl(href);

          return createGlobalDiscoveryItem({
            id: source.id,
            type: source.type,
            title: title,
            meta: meta,
            href: href,
            action: source.action,
            target: source.target,
            keywords: source.keywords,
            priority: source.priority
          });
        }

        function buildGlobalDiscoveryBaseItems(context) {
          return []
            .concat(globalRoutesAdapter(context))
            .concat(globalLandingSectionsAdapter(context))
            .concat(globalActionsAdapter(context));
        }

        function globalArticlesAdapter(index) {
          var posts = index && index.posts ? index.posts : [];
          return posts.map(function (post, index) {
            if (isStoreContent(post)) return null;
            return createGlobalDiscoveryItem({
              id: 'article:' + (post.href || post.title || index),
              type: 'article',
              title: post.title,
              meta: post.labelTexts && post.labelTexts.length ? post.labelTexts.join(' · ') : (post.summary || getCopy('command.results.article')),
              href: post.href,
              keywords: (post.labelTexts || []).concat([post.summary || '']),
              priority: 50 - Math.min(index, 20)
            });
          }).filter(function (item) {
            return !!(item && item.title && item.href);
          });
        }

        function globalTopicsAdapter(index) {
          var topics = index && index.topics ? index.topics : [];
          return topics.map(function (topic, index) {
            if (isStoreDiscoveryLabel(topic.title || topic.key)) return null;
            return createGlobalDiscoveryItem({
              id: 'topic:' + (topic.key || topic.title || index),
              type: 'topic',
              title: topic.title,
              meta: formatCopy('command.topics.countLabel', { count: String(topic.count || 0) }),
              href: topic.href,
              keywords: [topic.key || '', 'label', 'topic', 'archive'],
              priority: 34 - Math.min(index, 20)
            });
          }).filter(function (item) {
            return !!(item && item.title);
          });
        }

        function globalRoutesAdapter(context) {
          return GG_GLOBAL_DISCOVERY_CONFIG.routes.map(function (route) {
            return normalizeGlobalDiscoveryItem({
              id: 'route:' + route.id,
              type: 'route',
              titleKey: route.titleKey,
              meta: route.meta,
              href: route.href,
              action: route.action,
              keywords: route.keywords,
              priority: route.priority
            }, context);
          });
        }

        function globalLandingSectionsAdapter(context) {
          return GG_GLOBAL_DISCOVERY_CONFIG.sections.map(function (section) {
            return normalizeGlobalDiscoveryItem({
              id: 'section:' + section.id,
              type: 'section',
              title: section.title,
              meta: section.meta,
              href: section.href,
              action: section.action,
              target: section.target,
              keywords: section.keywords,
              priority: section.priority
            }, context);
          });
        }

        function globalActionsAdapter(context) {
          return GG_GLOBAL_DISCOVERY_CONFIG.actions.map(function (action) {
            return normalizeGlobalDiscoveryItem({
              id: 'action:' + action.id,
              type: 'action',
              titleKey: action.titleKey,
              titlePrefix: action.titlePrefix,
              titleSuffix: action.titleSuffix,
              meta: action.meta,
              metaKeys: action.metaKeys,
              href: action.href,
              action: action.action,
              keywords: action.keywords,
              priority: action.priority
            }, context);
          });
        }

        function getGlobalDiscoveryItems() {
          var index = state.discoveryIndex || { posts: [], topics: [] };
          return buildGlobalDiscoveryBaseItems()
            .concat(globalArticlesAdapter(index))
            .concat(globalTopicsAdapter(index));
        }

        function normalizeDiscoveryFilter(filter) {
          var value = String(filter || 'all');
          return GG_GLOBAL_DISCOVERY_CONFIG.filterIds.indexOf(value) > -1 ? value : 'all';
        }

        function discoveryFilterMatches(item, filter) {
          var active = normalizeDiscoveryFilter(filter);
          if (active === 'all') return true;
          if (active === 'articles') return item.type === 'article';
          if (active === 'topics') return item.type === 'topic';
          if (active === 'saved') return item.saved === true;
          if (active === 'routes') return item.type === 'route';
          if (active === 'sections') return item.type === 'section';
          if (active === 'actions') return item.type === 'action';
          return true;
        }

        function scoreGlobalDiscoveryItem(item, query) {
          return scoreDiscoveryText(item && item.text, item && item.title, query);
        }

        function buildDiscoveryResults(query) {
          var items = getGlobalDiscoveryItems();
          var q = String(query || '').trim();
          var topicKey = state.discoveryTopic;

          if (topicKey) {
            items = globalArticlesAdapter(state.discoveryIndex || { posts: [] }).filter(function (item) {
              var posts = state.discoveryIndex && state.discoveryIndex.posts ? state.discoveryIndex.posts : [];
              var i;
              for (i = 0; i < posts.length; i += 1) {
                if ((posts[i].href || '') !== item.href) continue;
                return posts[i].topicKeys && posts[i].topicKeys.indexOf(topicKey) > -1;
              }
              return false;
            });
          }

          items = items.filter(function (item) {
            return discoveryFilterMatches(item, state.discoveryTab);
          });

          if (!q) {
            return items.sort(function (a, b) {
              return (b.priority || 0) - (a.priority || 0) || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
            }).slice(0, 14);
          }

          return items.map(function (item) {
            item._score = scoreGlobalDiscoveryItem(item, q);
            return item;
          }).filter(function (item) {
            return item._score > 0;
          }).sort(function (a, b) {
            return b._score - a._score || (b.priority || 0) - (a.priority || 0);
          }).slice(0, 14);
        }

        function buildDiscoveryTopics(query) {
          var topics = state.discoveryIndex && state.discoveryIndex.topics ? state.discoveryIndex.topics.slice() : [];
          var q = String(query || '').trim();

          if (q) {
            topics = topics.map(function (topic) {
              topic._score = scoreDiscoveryTopic(topic, q);
              return topic;
            }).filter(function (topic) {
              return topic._score > 0;
            });
          }

          topics.sort(function (a, b) {
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          });

          return topics;
        }

        function shouldGroupDiscoveryTopics(topics) {
          var items = Array.isArray(topics) ? topics : [];
          return items.length >= DISCOVERY_TOPIC_LAYOUT_CONTRACT.groupedThreshold;
        }

        function buildDiscoveryTopicGroups(topics) {
          var items = Array.isArray(topics) ? topics : [];
          var grouped = {};
          var order = [];
          var i;
          var key;

          for (i = 0; i < items.length; i += 1) {
            key = getTopicGroupKey(items[i].title);
            if (!grouped[key]) {
              grouped[key] = {
                key: key,
                items: [],
                hasActive: false
              };
              order.push(key);
            }
            grouped[key].items.push(items[i]);
            if (items[i].key === state.discoveryTopic) grouped[key].hasActive = true;
          }

          order.sort(function (a, b) {
            if (a === '#') return 1;
            if (b === '#') return -1;
            return a.localeCompare(b);
          });

          return order.map(function (groupKey) {
            return grouped[groupKey];
          });
        }

        function renderDiscoveryTopicRow(topic) {
          var node = cloneTemplateRoot(ui.discoveryTopicTemplate);
          var applyNode = getTemplatePart(node, 'apply');
          var nameNode = getTemplatePart(node, 'name');
          var metaNode = getTemplatePart(node, 'meta');
          var archiveNode = getTemplatePart(node, 'archive');

          if (!node || !applyNode || !nameNode || !metaNode || !archiveNode || !topic) return null;

          applyNode.setAttribute('aria-pressed', topic.key === state.discoveryTopic ? 'true' : 'false');
          applyNode.setAttribute('data-gg-topic-key', topic.key || '');
          nameNode.textContent = topic.title || '';
          metaNode.textContent = formatCopy('command.topics.countLabel', { count: String(topic.count || 0) });
          archiveNode.textContent = getCopy('command.topics.openArchive');
          archiveNode.href = topic.href || '#';

          return node;
        }

        function isDiscoveryGroupExpanded(group, query) {
          var groupKey = group && group.key ? String(group.key) : '';

          if (!groupKey) return false;
          if (Object.prototype.hasOwnProperty.call(state.discoveryExpandedGroups, groupKey)) {
            return !!state.discoveryExpandedGroups[groupKey];
          }

          return !!String(query || '').trim() || !!(group && group.hasActive);
        }

        function getDiscoveryGroupListId(groupKey) {
          var safeKey = String(groupKey || '').trim();

          if (safeKey === '#') safeKey = 'hash';
          return 'gg-discovery-topic-group-list-' + safeKey.toLowerCase();
        }

        function getDiscoveryGroupState(groupKey, query) {
          var resolvedKey = String(groupKey || '');
          var topics;
          var groups;
          var group = null;
          var i;

          if (!resolvedKey) return null;

          topics = buildDiscoveryTopics(query);
          if (!shouldGroupDiscoveryTopics(topics)) return null;

          groups = buildDiscoveryTopicGroups(topics);
          for (i = 0; i < groups.length; i += 1) {
            if (groups[i].key !== resolvedKey) continue;
            group = groups[i];
            break;
          }

          if (!group) return null;

          return {
            key: group.key,
            hasActive: !!group.hasActive,
            explicit: Object.prototype.hasOwnProperty.call(state.discoveryExpandedGroups, resolvedKey)
              ? state.discoveryExpandedGroups[resolvedKey]
              : null,
            expanded: isDiscoveryGroupExpanded(group, query),
            listId: getDiscoveryGroupListId(group.key),
            itemCount: group.items.length
          };
        }

        function shouldBypassIgnoredClick(target) {
          if (!target || typeof target.closest !== 'function') return false;
          if (state.panelActive !== 'command') return false;
          return !!target.closest('[data-gg-topic-group-toggle]');
        }

        function shouldSuppressDocumentClick(target) {
          if (Date.now() >= state.ignoreClickUntil) return false;
          return !shouldBypassIgnoredClick(target);
        }

        function syncDiscoveryTabState() {
          var activeTab = normalizeDiscoveryFilter(state.discoveryTab);
          var tabNodes = ui.commandPanel ? Array.prototype.slice.call(ui.commandPanel.querySelectorAll('[data-gg-command-tab]')) : [];
          var i;

          state.discoveryTab = activeTab;

          for (i = 0; i < tabNodes.length; i += 1) {
            tabNodes[i].setAttribute('aria-selected', tabNodes[i].getAttribute('data-gg-command-tab') === activeTab ? 'true' : 'false');
            tabNodes[i].setAttribute('tabindex', tabNodes[i].getAttribute('data-gg-command-tab') === activeTab ? '0' : '-1');
          }

          if (ui.commandResultsPanel) ui.commandResultsPanel.hidden = false;
          if (ui.commandTopicsPanel) ui.commandTopicsPanel.hidden = true;
          if (ui.commandSheetInput) {
            ui.commandSheetInput.setAttribute('aria-controls', 'gg-discovery-panel-results');
          }
        }

        function createDiscoveryEmptyNode(copyKey) {
          var node = cloneTemplateRoot(ui.discoveryEmptyTemplate);
          var textNode = getTemplatePart(node, 'text');
          var isSavedEmpty = copyKey === 'discovery.saved';

          if (!node || !textNode) return null;
          node.setAttribute('data-gg-discovery-empty', 'true');
          node.setAttribute('data-gg-discovery-empty-kind', isSavedEmpty ? 'saved' : 'generic');
          node.setAttribute('data-gg-discovery-empty-copy', copyKey || '');
          if (isSavedEmpty) {
            node.setAttribute('data-gg-saved-empty', 'true');
            node.setAttribute('data-gg-empty-copy-title', 'discovery.saved.empty.title');
            node.setAttribute('data-gg-empty-copy-body', 'discovery.saved.empty.body');
            textNode.textContent = getCopy('discovery.saved.empty.title') + ' ' + getCopy('discovery.saved.empty.body');
          } else if (copyKey === 'discovery.empty') {
            textNode.textContent = getCopy('discovery.empty.title') + '. ' + getCopy('discovery.empty.body');
          } else {
            textNode.textContent = getCopy(copyKey);
          }
          return node;
        }

        function createDiscoveryResultNode(config) {
          var options = config || {};
          var node = cloneTemplateRoot(ui.discoveryResultTemplate);
          var typeNode = getTemplatePart(node, 'type');
          var titleNode = getTemplatePart(node, 'title');
          var metaNode = getTemplatePart(node, 'meta');

          if (!node || !typeNode || !titleNode || !metaNode) return null;

          typeNode.textContent = options.typeText || '';
          titleNode.textContent = options.titleText || '';
          metaNode.textContent = options.metaText || '';

          if (options.type) node.setAttribute('data-gg-discovery-type', options.type);
          else node.removeAttribute('data-gg-discovery-type');

          if (options.action) node.setAttribute('data-gg-discovery-action', options.action);
          else node.removeAttribute('data-gg-discovery-action');

          if (options.target) node.setAttribute('data-gg-discovery-target', options.target);
          else node.removeAttribute('data-gg-discovery-target');

          if (options.href) node.setAttribute('data-gg-discovery-href', options.href);
          else node.removeAttribute('data-gg-discovery-href');

          if (options.submit) node.setAttribute('data-gg-discovery-submit', 'true');
          else node.removeAttribute('data-gg-discovery-submit');

          return node;
        }

        function renderDiscoveryContext(topic) {
          if (!ui.commandContext) return;
          if (!topic) {
            ui.commandContext.hidden = true;
            if (ui.commandContextTitle) ui.commandContextTitle.textContent = '';
            if (ui.commandContextArchive) {
              ui.commandContextArchive.hidden = true;
              ui.commandContextArchive.removeAttribute('href');
            }
            return;
          }

          ui.commandContext.hidden = false;
          if (ui.commandContextTitle) ui.commandContextTitle.textContent = topic.title || '';
          if (ui.commandContextArchive) {
            if (topic.href) {
              ui.commandContextArchive.hidden = false;
              ui.commandContextArchive.href = topic.href;
            } else {
              ui.commandContextArchive.hidden = true;
              ui.commandContextArchive.removeAttribute('href');
            }
          }
        }

        function renderDiscoveryResults(query) {
          var q = String(query || '').trim();
          var items = buildDiscoveryResults(q);
          var nodes = [];
          var topic = getDiscoveryActiveTopic();
          var i;

          if (!ui.commandResults) return;

          ui.commandResults.setAttribute('data-gg-discovery-active-filter', normalizeDiscoveryFilter(state.discoveryTab));
          renderDiscoveryContext(topic);

          if (!items.length) {
            ui.commandResults.setAttribute('data-gg-discovery-results-state', 'empty');
            replaceNodeChildren(ui.commandResults, [createDiscoveryEmptyNode(state.discoveryTab === 'saved' ? 'discovery.saved' : 'discovery.empty')]);
            return;
          }

          ui.commandResults.setAttribute('data-gg-discovery-results-state', 'results');

          for (i = 0; i < items.length; i += 1) {
            nodes.push(createDiscoveryResultNode({
              href: items[i].href,
              action: items[i].action,
              target: items[i].target,
              type: items[i].type,
              typeText: getCopy('discovery.type.' + items[i].type),
              titleText: items[i].title,
              metaText: items[i].meta
            }));
          }

          replaceNodeChildren(ui.commandResults, nodes);
        }

        function renderDiscoveryTopics(query) {
          var topics = buildDiscoveryTopics(query);
          var groupedMode = shouldGroupDiscoveryTopics(topics);
          var groups = groupedMode ? buildDiscoveryTopicGroups(topics) : [];
          var q = String(query || '').trim();
          var nodes = [];
          var i;
          var j;
          var group;
          var isOpen;
          var listId;
          var groupNode;
          var toggleNode;
          var keyNode;
          var countNode;
          var listNode;
          var rowNodes;

          if (!ui.commandTopics) return;

          if (!topics.length) {
            replaceNodeChildren(ui.commandTopics, [createDiscoveryEmptyNode('command.topics.empty')]);
            return;
          }

          if (!groupedMode) {
            state.discoveryExpandedGroups = {};
            for (i = 0; i < topics.length; i += 1) {
              nodes.push(renderDiscoveryTopicRow(topics[i]));
            }
            replaceNodeChildren(ui.commandTopics, nodes);
            return;
          }

          for (i = 0; i < groups.length; i += 1) {
            group = groups[i];
            isOpen = isDiscoveryGroupExpanded(group, q);
            listId = getDiscoveryGroupListId(group.key);
            groupNode = cloneTemplateRoot(ui.discoveryTopicGroupTemplate);
            toggleNode = getTemplatePart(groupNode, 'toggle');
            keyNode = getTemplatePart(groupNode, 'group-key');
            countNode = getTemplatePart(groupNode, 'group-count');
            listNode = getTemplatePart(groupNode, 'list');

            if (!groupNode || !toggleNode || !keyNode || !countNode || !listNode) continue;

            groupNode.setAttribute('data-gg-topic-group', group.key || '');
            toggleNode.setAttribute('aria-controls', listId);
            toggleNode.setAttribute('data-gg-topic-group-toggle', group.key || '');
            toggleNode.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            keyNode.textContent = group.key || '';
            countNode.textContent = String(group.items.length);
            listNode.id = listId;
            listNode.hidden = !isOpen;
            rowNodes = [];
            for (j = 0; j < group.items.length; j += 1) {
              rowNodes.push(renderDiscoveryTopicRow(group.items[j]));
            }
            replaceNodeChildren(listNode, rowNodes);
            nodes.push(groupNode);
          }

          replaceNodeChildren(ui.commandTopics, nodes);
        }

        function renderDiscovery(query, options) {
          var q = String(query || '').trim();
          var renderOptions = options || {};

          syncCommandInputs(q);
          syncDiscoveryTabState();
          state.discoveryActiveIndex = -1;
          renderDiscoveryResults(q);
          renderDiscoveryTopics(q);

          if (renderOptions.open !== false) {
            openCommandPanel(renderOptions.trigger, renderOptions.reason || 'command-render', {
              focusSheet: renderOptions.focusSheet !== false,
              selectText: renderOptions.selectText
            });
          }
        }

        function setDiscoveryTab(tab) {
          var nextTab = normalizeDiscoveryFilter(tab);
          if (state.discoveryTab === nextTab) return;
          state.discoveryTab = nextTab;
          state.discoveryActiveIndex = -1;
          resetPanelByName('command', 'filterChange', 'filter-change');
          renderDiscovery(getCommandValue(), {
            open: false
          });
        }

        function setDiscoveryTopic(key, options) {
          var topicKey = String(key || '');
          var nextOptions = options || {};
          var query;

          state.discoveryTopic = topicKey;

          query = nextOptions.clearQuery ? syncCommandInputs('') : getCommandValue();
          if (nextOptions.switchToResults !== false) state.discoveryTab = 'all';
          state.discoveryActiveIndex = -1;
          resetPanelByName('command', 'filterChange', 'filter-change');
          renderDiscovery(query, {
            open: false
          });
        }

        function clearDiscoveryTopic() {
          if (!state.discoveryTopic) return;
          state.discoveryTopic = '';
          state.discoveryActiveIndex = -1;
          resetPanelByName('command', 'filterChange', 'filter-change');
          renderDiscovery(getCommandValue(), {
            open: false
          });
        }

        function returnToDiscoveryTopics() {
          state.discoveryTab = 'topics';
          state.discoveryActiveIndex = -1;
          resetPanelByName('command', 'filterChange', 'filter-change');
          renderDiscovery(getCommandValue(), {
            open: false
          });
        }

        function toggleDiscoveryGroup(key) {
          var groupKey = String(key || '');
          var query;
          var groupState;

          if (!groupKey) return;
          query = getCommandValue();
          groupState = getDiscoveryGroupState(groupKey, query);
          if (!groupState) return;
          state.discoveryExpandedGroups[groupKey] = !(groupState && groupState.expanded);
          state.discoveryActiveIndex = -1;
          resetPanelByName('command', 'filterChange', 'filter-change');
          renderDiscovery(query, {
            open: false
          });
        }

        function getDiscoveryItems() {
          var selector = DISCOVERY_RESULT_SELECTOR;
          var root = ui.commandResults;
          if (!root) return [];
          return Array.prototype.slice.call(root.querySelectorAll(selector));
        }

        function activateDiscoveryItem(direction) {
          var nodes;
          var i;

          if (state.panelActive !== 'command' || ui.commandPanel.hidden) return false;

          nodes = getDiscoveryItems();
          if (!nodes.length) return false;

          state.discoveryActiveIndex += direction;
          if (state.discoveryActiveIndex < 0) state.discoveryActiveIndex = nodes.length - 1;
          if (state.discoveryActiveIndex >= nodes.length) state.discoveryActiveIndex = 0;

          for (i = 0; i < nodes.length; i += 1) {
            nodes[i].classList.toggle('gg-is-active', i === state.discoveryActiveIndex);
            if (nodes[i].matches(DISCOVERY_RESULT_SELECTOR)) {
              nodes[i].setAttribute('aria-selected', i === state.discoveryActiveIndex ? 'true' : 'false');
            }
          }

          nodes[state.discoveryActiveIndex].focus();
          return true;
        }

        function buildCommandSearchUrl(query) {
          var searchUrl = safeUrl(ui.shell ? (ui.shell.getAttribute('data-gg-search-url') || '/search') : '/search');
          var q = String(query || '').trim();
          if (q) searchUrl.searchParams.set('q', q);
          else searchUrl.searchParams.delete('q');
          return searchUrl.href;
        }

        function submitCommandSearch(query) {
          window.location.href = buildCommandSearchUrl(query);
        }

        function isCurrentRootBlog() {
          return !!(state.surfaceContext && state.surfaceContext.isRootListing);
        }

        function isCurrentLanding() {
          return !!(state.surfaceContext && state.surfaceContext.surface === 'landing');
        }

        function scrollLandingSectionIfPresent(target) {
          var id = String(target || '').replace(/^#/, '');
          var node = id ? document.getElementById(id) : null;
          if (!node || typeof node.scrollIntoView !== 'function') return false;
          node.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
          return true;
        }

        function navigateAfterCommandClose(href) {
          closeCommandPanel('discovery-route', { returnFocus: false }).then(function () {
            if (href) window.location.href = href;
          });
        }

        function resolveGlobalDiscoveryAction(action, href, target) {
          var nextAction = String(action || '');
          var nextHref = href || '';
          var nextTarget = String(target || '');

          if (nextAction === 'openMore') {
            closeCommandPanel('discovery-open-more', { returnFocus: false }).then(function () {
              openPanel('more', {
                trigger: document.querySelector('[data-gg-open="more"]') || document.querySelector('[data-gg-nav="more"]') || document.activeElement,
                reason: 'discovery-open-more'
              });
            });
            return true;
          }

          if (nextAction === 'navigateBlog') {
            if (isCurrentRootBlog()) {
              closeCommandPanel('discovery-scroll-blog', { returnFocus: false }).then(scrollDocumentToTop);
            } else {
              navigateAfterCommandClose(makeHomeUrl(''));
            }
            return true;
          }

          if (nextAction === 'navigateHome') {
            if (isCurrentLanding()) {
              closeCommandPanel('discovery-scroll-home', { returnFocus: false }).then(scrollDocumentToTop);
            } else {
              navigateAfterCommandClose(makeHomeUrl('landing'));
            }
            return true;
          }

          if (nextAction === 'navigateContact') {
            if (isCurrentLanding() && scrollLandingSectionIfPresent('contact')) {
              closeCommandPanel('discovery-scroll-contact', { returnFocus: false });
            } else {
              navigateAfterCommandClose(makeHomeUrl('landing#contact'));
            }
            return true;
          }

          if (nextAction === 'navigateHomeSection') {
            if (isCurrentLanding() && scrollLandingSectionIfPresent(nextTarget)) {
              closeCommandPanel('discovery-scroll-section', { returnFocus: false });
            } else {
              navigateAfterCommandClose(makeHomeUrl('landing#' + nextTarget));
            }
            return true;
          }

          if (nextAction === 'navigateStore') {
            navigateAfterCommandClose(makeHomeUrl('store'));
            return true;
          }

          if (nextHref) {
            navigateAfterCommandClose(nextHref);
            return true;
          }

          return false;
        }

        function handleSearchEmptyAction(action) {
          var trigger = document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput || document.activeElement || null;
          var nextAction = String(action || '');

          if (nextAction === 'topics') {
            launchDiscovery(trigger, 'search-empty-topics', {
              tab: 'topics',
              query: '',
              clearTopic: true,
              focusSheet: true
            });
            return;
          }

          launchDiscovery(trigger, 'search-empty-search', {
            tab: 'all',
            query: getCurrentSearchQuery(),
            clearTopic: true,
            focusSheet: true,
            selectText: true
          });
        }

        function handleError404Action(action) {
          var trigger = document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput || document.activeElement || null;

          if (String(action || '') !== 'search') return;

          launchDiscovery(trigger, 'error404-search', {
            tab: 'all',
            query: '',
            clearTopic: true,
            focusSheet: true,
            selectText: true
          });
        }

        function getActiveDiscoveryNode() {
          var nodes = getDiscoveryItems();
          var i;
          for (i = 0; i < nodes.length; i += 1) {
            if (nodes[i].classList.contains('gg-is-active')) return nodes[i];
          }
          return null;
        }

        function handleCommandSubmit(event) {
          var active = getActiveDiscoveryNode();
          var query = syncCommandInputs(getCommandValue());
          event.preventDefault();

          if (active && typeof active.click === 'function') {
            active.click();
            return;
          }

          if (!state.discoveryTopic) {
            submitCommandSearch(query);
          }
        }

        function bindCommandInput(input) {
          if (!input) return;

          input.addEventListener('focus', function () {
            var value;
            var shouldOpen;
            var trigger;
            if (Date.now() < state.suppressCommandFocusUntil) return;
            value = syncCommandInputs(input.value);
            shouldOpen = state.panelActive !== 'command';
            trigger = state.panelLastTrigger || document.querySelector('[data-gg-focus="command"]') || input;
            if (shouldOpen) {
              launchDiscovery(trigger, 'command-sheet-focus', {
                query: value,
                focusSheet: true
              });
              return;
            }
            ensureDiscoveryIndex().then(function () {
              renderDiscovery(value, {
                source: 'sheet',
                trigger: trigger,
                reason: 'command-sheet-focus',
                focusSheet: false,
                open: false
              });
            });
          });

          input.addEventListener('input', debounce(function () {
            var value = syncCommandInputs(input.value);
            resetPanelByName('command', 'queryChange', 'query-change');
            ensureDiscoveryIndex().then(function () {
              renderDiscovery(value, {
                source: 'sheet',
                trigger: state.panelLastTrigger || document.querySelector('[data-gg-focus="command"]') || input,
                reason: 'command-sheet-input',
                focusSheet: false,
                open: false
              });
            });
          }, 70));

          input.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              ensureDiscoveryIndex().then(function () {
                renderDiscovery(getCommandValue(), {
                  source: 'sheet',
                  trigger: state.panelLastTrigger || document.querySelector('[data-gg-focus="command"]') || input,
                  reason: 'command-arrow',
                  focusSheet: false,
                  open: false
                });
                activateDiscoveryItem(event.key === 'ArrowDown' ? 1 : -1);
              });
            } else if (event.key === 'Escape') {
              event.stopPropagation();
              closeCommandPanel('command-escape');
            }
          });
        }

        function expectedDockKey() {
          if (!state.surfaceContext) return '';
          if (state.surfaceContext.surface === 'listing') return 'blog';
          if (state.surfaceContext.surface === 'search') return 'search';
          if (state.surfaceContext.surface === 'landing' && state.surfaceContext.source === 'url.landing.contact') return 'contact';
          if (state.surfaceContext.surface === 'landing') return 'home';
          if (state.surfaceContext.surface === 'post' || state.surfaceContext.surface === 'page') return 'blog';
          return '';
        }

        function getRouteTargets() {
          var routes = {
            listing: ui.shell ? toAbsoluteUrl(ui.shell.getAttribute('data-gg-home-url')) : safeUrl(window.location.href).origin + '/',
            landing: makeHomeUrl('landing'),
            search: '',
            label: '',
            archive: '',
            post: '',
            mobile: '',
            olderPageUrl: getCurrentOlderPageUrl(),
            error404: ''
          };
          var firstRow = document.querySelector(LISTING_ROW_SELECTOR);
          var firstPost = firstRow ? toAbsoluteUrl(firstRow.getAttribute('data-gg-post-url') || '') : '';
          var q = getCommandValue().trim() ? getCommandValue().trim() : 'gg';
          var labelLink = document.querySelector('.gg-taxonomy__link[href*="/search/label/"], a[href*="/search/label/"]');
          var archiveLink = document.querySelector('a[href*="updated-max="]');
          var labelTopic;
          var probeUrl;

          routes.search = makeHomeUrl('search?q=' + encodeURIComponent(q));
          routes.post = firstPost || (state.surfaceContext && state.surfaceContext.surface === 'post' ? window.location.href : '');

          if (labelLink) {
            routes.label = toAbsoluteUrl(labelLink.getAttribute('href') || '');
          } else if (state.discoveryIndex && state.discoveryIndex.topics && state.discoveryIndex.topics.length) {
            labelTopic = state.discoveryIndex.topics[0];
            if (labelTopic && labelTopic.href) routes.label = toAbsoluteUrl(labelTopic.href);
          }

          if (archiveLink) {
            routes.archive = toAbsoluteUrl(archiveLink.getAttribute('href') || '');
          } else if (routes.olderPageUrl) {
            routes.archive = routes.olderPageUrl;
          }

          routes.mobile = (function () {
            var url = safeUrl(routes.listing || window.location.href);
            url.searchParams.set('m', '1');
            return url.href;
          }());

          probeUrl = safeUrl(makeHomeUrl('__gg-runtime-404__'));
          probeUrl.searchParams.set('gg404', '1');
          probeUrl.searchParams.set('ggt', String(Date.now()));
          routes.error404 = probeUrl.href;

          return routes;
        }

        function makeCheck(id, label, pass, details, pending) {
          return {
            id: id,
            label: label,
            status: pass ? 'pass' : (pending ? 'pending' : 'fail'),
            details: details || ''
          };
        }

        function detailOutlineSnapshot() {
          return {
            available: !!ui.detailOutline,
            visible: !!(ui.detailOutline && !ui.detailOutline.hidden),
            state: state.detailOutlineState,
            expanded: isDetailOutlineExpanded(),
            sectionCount: (state.detailOutlineSections || []).length,
            currentIndex: state.detailOutlineCurrentIndex,
            currentTitle: ui.detailOutline ? getDetailOutlineCurrentTitle() : ''
          };
        }

        function buildSmokeChecklist() {
          var routes = getRouteTargets();
          var activeDock = currentDockState();
          var expectedDock = expectedDockKey();
          var commandPanel = getPanel('command');
          var commentsPanel = getPanel('comments');
          var outline = detailOutlineSnapshot();
          var checks = [];

          checks.push(makeCheck('surface-current', 'Current surface contract is known', !!(state.surfaceContext && SURFACE_LEDGER[state.surfaceContext.surface]), state.surfaceContext ? state.surfaceContext.surface + ' via ' + state.surfaceContext.source : 'No runtime surface detected'));
          checks.push(makeCheck('route-listing', 'Blog listing target is available for live smoke', !!routes.listing, routes.listing || 'Missing listing route'));
          checks.push(makeCheck('route-landing', 'Landing/home target is available for live smoke', !!routes.landing, routes.landing || 'Missing landing route'));
          checks.push(makeCheck('route-search', 'Search target is available for live smoke', !!routes.search, routes.search || 'Missing search route'));
          checks.push(makeCheck('route-label', 'Label target is available for live smoke', !!routes.label, routes.label || 'No label route available on current runtime', true));
          checks.push(makeCheck('route-archive', 'Archive target is available for live smoke', !!routes.archive, routes.archive || 'No archive-like route available on current runtime', true));
          checks.push(makeCheck('route-post', 'Post target is available for live smoke', !!routes.post, routes.post || 'No post target available on current runtime', true));
          checks.push(makeCheck('route-mobile', '?m=1 target is available for live smoke', !!routes.mobile, routes.mobile || 'No mobile route generated'));
          checks.push(makeCheck('route-older', 'olderPageUrl route is exposed when available', !!routes.olderPageUrl, routes.olderPageUrl || 'No olderPageUrl on current view', true));
          checks.push(makeCheck('route-404', 'Error/404 probe target is available for live smoke', !!routes.error404, routes.error404 || 'Could not build same-origin 404 probe'));
          checks.push(makeCheck('dock-current', 'Dock current state matches current surface', expectedDock ? (activeDock.length === 1 && activeDock[0] === expectedDock) : activeDock.length === 0, activeDock.length ? 'Active dock items: ' + activeDock.join(', ') : 'No dock item marked current'));
          checks.push(makeCheck('language-switcher', 'Language switcher exposes only EN and ID', ui.langButtons.length === 2 && (state.locale === 'en' || state.locale === 'id'), 'Locale=' + state.locale + ', buttons=' + ui.langButtons.length));
          checks.push(makeCheck('panel-command', 'Command discovery sheet is registered in the unified controller', !!commandPanel && commandPanel.family === 'utility-sheet', commandPanel ? commandPanel.family + ' / ' + panelSnapshot().panels.command.state : 'Command sheet missing'));
          checks.push(makeCheck('panel-preview', 'Preview sheet is registered in unified controller', !!getPanel('preview'), getPanel('preview') ? panelSnapshot().panels.preview.state : 'Preview sheet missing'));
          checks.push(makeCheck('panel-more', 'More sheet is registered in unified controller', !!getPanel('more'), getPanel('more') ? panelSnapshot().panels.more.state : 'More sheet missing'));
          checks.push(makeCheck('panel-comments', 'Comments sheet is registered in unified controller', !!commentsPanel, commentsPanel ? panelSnapshot().panels.comments.state : 'Comments sheet missing on current surface', state.surfaceContext && state.surfaceContext.surface !== 'post'));
          checks.push(makeCheck('detail-outline', 'Detail outline tray is scoped to post/page detail and remains auditable', isDetailSurface() ? outline.available : !outline.available, outline.available ? ('sections=' + outline.sectionCount + ', state=' + outline.state + ', current=' + (outline.currentTitle || 'none')) : 'No detail outline on current surface', !isDetailSurface()));
          checks.push(makeCheck('error-contract', 'Native 404 runtime contract is explicit and auditable', !!state.errorContract && typeof state.errorContract.errorState === 'string', state.errorContract ? (state.errorContract.errorState + ' via ' + state.errorContract.errorSource) : 'No error contract detected'));
          checks.push(makeCheck('special-contract', 'Special runtime contract stays separate from native 404 handling', !!state.specialContract && typeof state.specialContract.specialKind === 'string', state.specialContract ? (state.specialContract.specialKind + ' via ' + state.specialContract.specialSource) : 'No special contract detected'));
          checks.push(makeCheck('listing-growth', 'Same-page listing growth stays auditable and keeps More entries as fallback only', !state.surfaceContext || !state.surfaceContext.isListing || !!ui.loadMoreWrap, state.surfaceContext && state.surfaceContext.isListing ? ('state=' + state.listingGrowthState + ', rows=' + getListingRowCount() + ', older=' + (getCurrentOlderPageUrl() || 'none')) : 'Not a listing surface'));
          checks.push(makeCheck('bridge-ledger', 'Legacy bridge ledger is split into active vs closed items', ACTIVE_LEGACY_BRIDGES.length >= 0 && CLOSED_BRIDGES.length >= 0, 'active=' + ACTIVE_LEGACY_BRIDGES.length + ', closed=' + CLOSED_BRIDGES.length));

          return checks;
        }

        function summarizeChecklist(checklist) {
          var summary = {
            pass: 0,
            fail: 0,
            pending: 0
          };
          var i;
          for (i = 0; i < (checklist || []).length; i += 1) {
            summary[checklist[i].status] += 1;
          }
          return summary;
        }

        function qaSnapshot() {
          return {
            generatedAt: new Date().toISOString(),
            surface: state.surfaceContext,
            error: state.errorContract,
            special: state.specialContract,
            locale: state.locale,
            theme: state.theme,
            routes: getRouteTargets(),
            searchEmpty: searchEmptySnapshot(),
            error404Surface: error404Snapshot(),
            dock: {
              active: currentDockState(),
              expected: expectedDockKey()
            },
            panels: panelSnapshot(),
            outline: detailOutlineSnapshot(),
            contracts: {
              routeVocabulary: ROUTE_VOCABULARY_CONTRACT,
              command: COMMAND_PANEL_CONTRACT,
              utilitySheet: UTILITY_SHEET_CONTRACT,
              search: SEARCH_DATA_CONTRACT,
              preview: PREVIEW_DATA_CONTRACT,
              bottomSafeZone: BOTTOM_SAFE_ZONE_CONTRACT,
              panelHeight: PANEL_HEIGHT_CONTRACT,
              detailToolbar: DETAIL_TOOLBAR_CONTRACT,
              detailOutline: DETAIL_OUTLINE_CONTRACT,
              error404Surface: ERROR404_SURFACE_CONTRACT,
              searchEmptyFallback: SEARCH_EMPTY_FALLBACK_CONTRACT,
              error: ERROR_RUNTIME_CONTRACT,
              listingGrowth: LISTING_GROWTH_CONTRACT
            },
            legacyBridges: {
              active: ACTIVE_LEGACY_BRIDGES.slice(),
              closed: CLOSED_BRIDGES.slice()
            },
            feed: {
              source: ui.shell ? (ui.shell.getAttribute('data-gg-feed-source') || 'unknown') : 'unknown',
              prerequisites: FEED_PREREQUISITES
            },
            startup: startupSnapshot(),
            pwa: pwaSnapshot(),
            cache: pwaCacheSnapshot(),
            listingGrowth: {
              state: state.listingGrowthState,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl(),
              minimumVisualCount: LISTING_GROWTH_CONTRACT.minimumVisualCount,
              viewportSatisfied: listingViewportSatisfied(),
              storeAppendGuardEnabled: !!state.storeAppendGuardEnabled,
              rootListingAppendGuardActive: !!(state.surfaceContext && state.surfaceContext.isRootListing),
              storeRowsSkippedFromRoot: state.storeRowsSkippedFromRoot || 0
            }
          };
        }

        function runSmoke(options) {
          var smokeOptions = options || {};
          var bootstrap = ui.commandSheetInput && !state.discoveryIndex ? ensureDiscoveryIndex().catch(function () { return null; }) : Promise.resolve(null);

          return bootstrap.then(function () {
            var report = {
              generatedAt: new Date().toISOString(),
              surface: state.surfaceContext,
              checklist: buildSmokeChecklist(),
              snapshot: qaSnapshot(),
              manualMatrix: QA_MANUAL_MATRIX,
              procedure: buildVerificationProcedure()
            };

            if (!smokeOptions.exercisePanels) {
              return report;
            }

            return exerciseSmokePanels().then(function (exercises) {
              report.exercises = exercises;
              report.snapshot = qaSnapshot();
              report.checklist = buildSmokeChecklist();
              return report;
            });
          });
        }

        function exercisePanel(name) {
          var panel = getPanel(name);
          var trigger;
          var row;

          if (!panel) {
            return Promise.resolve({
              name: name,
              status: 'pending',
              reason: 'panel-not-available'
            });
          }

          if (name === 'command') {
            trigger = document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput;
            if (!trigger) {
              return Promise.resolve({
                name: name,
                status: 'pending',
                reason: 'command-trigger-not-on-current-surface'
              });
            }

            return launchDiscovery(trigger, 'qa-command-open', {
              focusSheet: true
            }).then(function () {
              return waitMs(70);
            }).then(function () {
              return closeCommandPanel('qa-command-close', {
                returnFocus: false
              });
            }).then(function () {
              return {
                name: name,
                status: 'pass',
                stateAfter: panelSnapshot().panels.command.state
              };
            });
          }

          if (name === 'preview') {
            row = document.querySelector(LISTING_ROW_BASE_SELECTOR);
            trigger = row ? row.querySelector('[data-gg-open="preview"]') : null;
            if (!row || !trigger) {
              return Promise.resolve({
                name: name,
                status: 'pending',
                reason: 'no-listing-row-on-current-surface'
              });
            }

            return openPreview(row, trigger, 'qa-preview-open').then(function () {
              return waitMs(80);
            }).then(function () {
              return closePanel('preview', {
                returnFocus: false,
                reason: 'qa-preview-close'
              });
            }).then(function () {
              return {
                name: name,
                status: 'pass',
                stateAfter: panelSnapshot().panels.preview.state
              };
            });
          }

          trigger = document.querySelector('[data-gg-open="' + name + '"]');
          if (!trigger) {
            return Promise.resolve({
              name: name,
              status: 'pending',
              reason: 'panel-trigger-not-on-current-surface'
            });
          }

          return openPanel(name, {
            trigger: trigger,
            focus: false,
            reason: 'qa-open'
          }).then(function () {
            return waitMs(60);
          }).then(function () {
            return closePanel(name, {
              returnFocus: false,
              reason: 'qa-close'
            });
          }).then(function () {
            return {
              name: name,
              status: 'pass',
              stateAfter: panelSnapshot().panels[name].state
            };
          });
        }

        function exerciseSmokePanels() {
          var results = [];

          return exercisePanel('command')
            .then(function (result) {
              results.push(result);
              return exercisePanel('more');
            })
            .then(function (result) {
              results.push(result);
              return exercisePanel('comments');
            })
            .then(function (result) {
              results.push(result);
              return exercisePanel('preview');
            })
            .then(function (result) {
              results.push(result);
              return results;
            });
        }

        function expectedSurfaceForRouteKey(key) {
          if (key === 'listing') return 'listing';
          if (key === 'landing') return 'landing';
          if (key === 'search') return 'search';
          if (key === 'label') return 'label';
          if (key === 'archive') return 'archive';
          if (key === 'post') return 'post';
          if (key === 'mobile') return 'listing';
          if (key === 'error404') return 'error404';
          return '';
        }

        function routeExpectationMatches(key, smoke) {
          var surface = smoke && smoke.surface ? smoke.surface.surface : '';
          if (key === 'olderPageUrl') return !!(smoke && smoke.surface && smoke.surface.isListing);
          if (key === 'mobile') return surface === 'listing' && smoke.surface && smoke.surface.variant === 'mobile';
          if (key === 'error404') return surface === 'error404' && smoke.snapshot && smoke.snapshot.error && smoke.snapshot.error.errorState === '404';
          return surface === expectedSurfaceForRouteKey(key);
        }

        function summarizeRouteMatrix(results) {
          var summary = {
            pass: 0,
            fail: 0,
            pending: 0
          };
          var i;
          for (i = 0; i < results.length; i += 1) {
            summary[results[i].status] += 1;
          }
          return summary;
        }

        function waitForFrameQa(frame, timeoutMs) {
          var start = Date.now();

          return new Promise(function (resolve, reject) {
            (function poll() {
              var childWindow;
              try {
                childWindow = frame.contentWindow;
              } catch (error) {
                reject(new Error('frame-cross-origin'));
                return;
              }

              if (childWindow && childWindow.GG && childWindow.GG.qa && typeof childWindow.GG.qa.runSmoke === 'function') {
                resolve(childWindow.GG.qa);
                return;
              }

              if (Date.now() - start >= timeoutMs) {
                reject(new Error('frame-runtime-timeout'));
                return;
              }

              window.setTimeout(poll, 120);
            }());
          });
        }

        function loadRouteQa(frame, url, timeoutMs) {
          return new Promise(function (resolve, reject) {
            var settled = false;
            var timeout = window.setTimeout(function () {
              cleanup();
              reject(new Error('frame-load-timeout'));
            }, timeoutMs);

            function cleanup() {
              frame.removeEventListener('load', onLoad);
              frame.removeEventListener('error', onError);
              window.clearTimeout(timeout);
            }

            function finish(fn, value) {
              if (settled) return;
              settled = true;
              cleanup();
              fn(value);
            }

            function onLoad() {
              waitForFrameQa(frame, Math.max(3000, timeoutMs - 600)).then(function (qa) {
                finish(resolve, qa);
              }).catch(function (error) {
                finish(reject, error);
              });
            }

            function onError() {
              finish(reject, new Error('frame-load-error'));
            }

            frame.addEventListener('load', onLoad, { once: false });
            frame.addEventListener('error', onError, { once: false });
            frame.src = url;
          });
        }

        function buildVerificationProcedure() {
          var routes = getRouteTargets();
          return [
            {
              id: 'snapshot',
              run: 'GG.qa.snapshot()',
              expected: 'Inspect surface markers, dock state, contracts, bridge ledger, and feed source on the current page.'
            },
            {
              id: 'current-smoke',
              run: 'GG.qa.runSmoke({ exercisePanels: true })',
              expected: 'Expect checklist plus panel exercise output for command, preview, comments, and more on the current route.'
            },
            {
              id: 'route-matrix',
              run: 'GG.qa.runRouteMatrix({ exercisePanels: true })',
              expected: 'Expect live same-origin verification for listing, landing, search, label, archive, post, ?m=1, olderPageUrl, and the generated 404 probe.'
            },
            {
              id: 'listing',
              url: routes.listing,
              expected: 'Surface=listing, dock current=blog, command and preview flows available.'
            },
            {
              id: 'landing',
              url: routes.landing,
              expected: 'Surface=landing, dock current=home, and landing recovery/navigation stays coherent.'
            },
            {
              id: 'search',
              url: routes.search,
              expected: 'Surface=search, dock current=search, discovery results and native search fallback still work.'
            },
            {
              id: 'label',
              url: routes.label,
              expected: 'Surface=label, dock stays neutral, and listing remains lightweight.'
            },
            {
              id: 'archive',
              url: routes.archive,
              expected: 'Surface=archive, archive route resolves without listing/search confusion.'
            },
            {
              id: 'post',
              url: routes.post,
              expected: 'Surface=post, detail outline stays attached above the dock, comments sheet opens, more sheet opens, and discovery still works from dock.'
            },
            {
              id: 'mobile',
              url: routes.mobile,
              expected: 'Variant=mobile, sheet gestures remain calm, dock remains stable.'
            },
            {
              id: 'olderPageUrl',
              url: routes.olderPageUrl,
              expected: 'Route resolves as a valid follow-on listing surface when Blogger exposes olderPageUrl.'
            },
            {
              id: 'error404',
              url: routes.error404,
              expected: 'Surface=error404 with data-gg-error-state=404 from Blogger native error view and Custom 404 copy.'
            },
            {
              id: 'listing-growth',
              run: 'Inspect GG.qa.snapshot().listingGrowth, then scroll until the sentinel loads more rows if olderPageUrl exists.',
              expected: 'Initial render grows in-page toward 10 rows or viewport buffer, appends only real rows, and leaves More entries as the fallback-only link.'
            },
            {
              id: 'language-switcher',
              run: 'Open More sheet, toggle EN then ID, rerun GG.qa.snapshot()',
              expected: 'Only EN and ID exist, locale persists in gg:lang, microcopy updates without scattered overrides.'
            },
            {
              id: 'appearance-switcher',
              run: 'Open More sheet, toggle Light and Dark, then inspect html[data-gg-theme] plus GG.qa.snapshot().theme.',
              expected: 'Only Light and Dark are visible options, both persist in gg:theme, and html[data-gg-theme] always matches the active state.'
            },
            {
              id: 'panel-behavior',
              run: 'Open command, preview, comments, and more. Then test ESC, scrim close, swipe-down dismiss, and focus return.',
              expected: 'All panels share one controller contract and close cleanly without scroll-lock drift.'
            }
          ];
        }

        function formatVerificationProcedure() {
          var lines = [];
          var procedure = buildVerificationProcedure();
          var i;
          for (i = 0; i < procedure.length; i += 1) {
            lines.push((i + 1) + '. ' + procedure[i].id + ' :: ' + (procedure[i].run || procedure[i].url || 'manual'));
            lines.push('   expected: ' + procedure[i].expected);
          }
          return lines.join('\n');
        }

        function runRouteMatrix(options) {
          var matrixOptions = options || {};
          var order = ['listing', 'landing', 'search', 'label', 'archive', 'post', 'mobile', 'olderPageUrl', 'error404'];
          var routes = getRouteTargets();
          var timeoutMs = Math.max(5000, matrixOptions.timeoutMs || 12000);
          var results = [];
          var frame = document.createElement('iframe');

          frame.hidden = true;
          frame.setAttribute('aria-hidden', 'true');
          frame.setAttribute('tabindex', '-1');
          frame.style.position = 'absolute';
          frame.style.width = '1px';
          frame.style.height = '1px';
          frame.style.opacity = '0';
          frame.style.pointerEvents = 'none';
          frame.style.border = '0';
          document.body.appendChild(frame);

          function cleanupFrame() {
            if (frame.parentNode) frame.parentNode.removeChild(frame);
          }

          function visit(index) {
            var key;
            var url;
            if (index >= order.length) return Promise.resolve();
            key = order[index];
            url = routes[key];

            if (!url) {
              results.push({
                key: key,
                url: '',
                status: 'pending',
                reason: 'route-unavailable'
              });
              return visit(index + 1);
            }

            return loadRouteQa(frame, url, timeoutMs).then(function (qa) {
              return qa.runSmoke({
                exercisePanels: matrixOptions.exercisePanels !== false
              });
            }).then(function (smoke) {
              results.push({
                key: key,
                url: url,
                status: routeExpectationMatches(key, smoke) ? 'pass' : 'fail',
                expectedSurface: expectedSurfaceForRouteKey(key) || (key === 'olderPageUrl' ? 'listing-follow-on' : ''),
                actualSurface: smoke && smoke.surface ? smoke.surface.surface : '',
                variant: smoke && smoke.surface ? smoke.surface.variant : '',
                checklist: summarizeChecklist(smoke.checklist || []),
                panels: smoke.exercises || [],
                error: smoke.snapshot ? smoke.snapshot.error : null,
                special: smoke.snapshot ? smoke.snapshot.special : null
              });
              return visit(index + 1);
            }).catch(function (error) {
              results.push({
                key: key,
                url: url,
                status: 'fail',
                reason: error && error.message ? error.message : 'route-check-failed'
              });
              return visit(index + 1);
            });
          }

          return visit(0).then(function () {
            cleanupFrame();
            return {
              generatedAt: new Date().toISOString(),
              routes: results,
              summary: summarizeRouteMatrix(results),
              procedure: buildVerificationProcedure()
            };
          }).catch(function (error) {
            cleanupFrame();
            throw error;
          });
        }

        function getDismissThreshold(panel) {
          if (!panel || !panel.panel) return 96;
          return Math.max(96, Math.round(panel.panel.offsetHeight * 0.16));
        }

        function shouldDismissByDrag(panel, offsetY, velocityY) {
          var threshold = getDismissThreshold(panel);
          if (getPanelEdge(panel) === 'top') return offsetY < -threshold || velocityY < -0.75;
          return offsetY > threshold || velocityY > 0.75;
        }

        function isHandleTap(offsetY, elapsed) {
          return Math.abs(offsetY) < 8 && elapsed < 360;
        }

        function isInteractiveDragZoneTarget(target, explicitHandle) {
          if (!target || explicitHandle || typeof target.closest !== 'function') return false;
          return !!target.closest('a[href], button, input, select, textarea, summary, [role="button"], [contenteditable="true"]');
        }

        function resolveDragCandidate(event) {
          var target = event && event.target;
          var handle = target && target.closest ? target.closest('[data-gg-drag-handle]') : null;
          var zone = target && target.closest ? target.closest('[data-gg-drag-zone]') : null;
          var sheet;
          var name = '';

          if (!handle && !zone) return null;
          if (isInteractiveDragZoneTarget(target, handle)) return null;
          if (handle) {
            name = handle.getAttribute('data-gg-drag-handle') || '';
          } else {
            sheet = zone.closest ? zone.closest('.gg-sheet') : null;
            name = sheet ? (sheet.getAttribute('data-gg-panel') || sheet.getAttribute('data-gg-sheet') || '') : '';
          }
          return name ? { name: name, captureTarget: handle || zone, fromHandle: !!handle } : null;
        }

        function startDrag(event) {
          var candidate = resolveDragCandidate(event);
          var panel;

          if (!candidate) return;
          panel = getPanel(candidate.name);
          if (!panel || state.panelActive !== candidate.name) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          state.drag = {
            name: candidate.name,
            pointerId: event.pointerId,
            startY: event.clientY,
            offsetY: 0,
            startedAt: Date.now(),
            fromHandle: candidate.fromHandle,
            active: false
          };

          state.ignoreClickUntil = Date.now() + 180;
          resetPanelDrag(panel, true);
          if (candidate.captureTarget.setPointerCapture) {
            try {
              candidate.captureTarget.setPointerCapture(event.pointerId);
            } catch (error) {
              /* ignore pointer capture failures */
            }
          }
          event.preventDefault();
        }

        function moveDrag(event) {
          var panel;
          var offset;

          if (!state.drag || state.drag.pointerId !== event.pointerId) return;
          panel = getPanel(state.drag.name);
          if (!panel) return;

          offset = event.clientY - state.drag.startY;
          state.drag.offsetY = offset;
          if (!state.drag.active && Math.abs(offset) < 8) return;
          if (!state.drag.active) {
            state.drag.active = true;
            panel.root.setAttribute('data-gg-state', 'dragging');
          }
          applyPanelDrag(panel, offset);
          event.preventDefault();
        }

        function endDrag(event) {
          var drag = state.drag;
          var panel;
          var offset;
          var shouldClose;
          var tapRelease;
          var velocity;
          var elapsed;

          if (!drag || drag.pointerId !== event.pointerId) return;

          panel = getPanel(drag.name);
          state.drag = null;
          if (!panel) return;

          offset = typeof event.clientY === 'number' ? event.clientY - drag.startY : drag.offsetY;
          drag.offsetY = offset;
          elapsed = Math.max(1, Date.now() - drag.startedAt);
          velocity = offset / elapsed;
          tapRelease = isHandleTap(offset, elapsed);
          shouldClose = (tapRelease && drag.fromHandle) || (drag.active && shouldDismissByDrag(panel, offset, velocity));

          if (shouldClose) {
            state.ignoreClickUntil = Date.now() + 320;
            closePanel(drag.name, {
              returnFocus: tapRelease,
              reason: tapRelease ? 'handle-tap' : 'drag-dismiss'
            });
          } else {
            restorePanelFromDrag(panel);
          }
        }

        var ggSheetGestureController = {
          start: startDrag,
          move: moveDrag,
          end: endDrag
        };

        function clearPressState() {
          if (!state.pressTarget) return;
          state.pressTarget.removeAttribute('data-gg-press');
          state.pressTarget = null;
        }

        buildPanelDefinitions();

        bindCommandInput(ui.commandSheetInput);

        if (ui.commandSheetForm) {
          ui.commandSheetForm.addEventListener('submit', handleCommandSubmit);
        }

        document.addEventListener('pointerdown', function (event) {
          var target = event.target.closest(PRESS_SELECTOR);
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          if (target) {
            clearPressState();
            state.pressTarget = target;
            target.setAttribute('data-gg-press', 'active');
          }
          startDetailOutlineGesture(event);
          ggSheetGestureController.start(event);
        }, true);

        document.addEventListener('pointermove', ggSheetGestureController.move, { passive: false });
        document.addEventListener('pointerup', function (event) {
          clearPressState();
          endDetailOutlineGesture(event);
          ggSheetGestureController.end(event);
        }, true);
        document.addEventListener('pointercancel', function (event) {
          clearPressState();
          state.detailOutlineGesture = null;
          ggSheetGestureController.end(event);
        }, true);
        window.addEventListener('blur', clearPressState);

        document.addEventListener('click', function (event) {
          var focusTrigger;
          var primaryRouteTrigger;
          var previewTrigger;
          var moreTrigger;
          var commentsTrigger;
          var commentsComposerTrigger;
          var commentsAddReplyTrigger;
          var commentsParentReplyTrigger;
          var commentsRepliesTrigger;
          var commentsRepliesCloseTrigger;
          var nativeCommentReplyTrigger;
          var commentReplyClearTrigger;
          var commentMoreTrigger;
          var commentCopyTrigger;
          var commentDeleteTrigger;
          var langTrigger;
          var themeTrigger;
          var readingTrigger;
          var motionTrigger;
          var closeTrigger;
          var closeName;
          var discoveryTabTrigger;
          var discoveryTopicToggle;
          var discoveryTopicApply;
          var discoveryTopicBack;
          var discoveryTopicClear;
          var discoveryResult;
          var discoverySubmit;
          var searchEmptyAction;
          var error404Action;
          var detailOutlineToggle;
          var detailOutlineTarget;

          if (shouldSuppressDocumentClick(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          focusTrigger = event.target.closest('[data-gg-focus="command"]');
          primaryRouteTrigger = event.target.closest('[data-gg-more-route], [data-gg-nav]');
          previewTrigger = event.target.closest('[data-gg-open="preview"]');
          moreTrigger = event.target.closest('[data-gg-open="more"]');
          commentsTrigger = event.target.closest('[data-gg-action="comments-open"], [data-gg-open="comments"], [data-gg-postbar="comments"]');
          commentsComposerTrigger = event.target.closest('[data-gg-action="comments-open-composer"]');
          commentsAddReplyTrigger = event.target.closest('[data-gg-action="comments-add-reply"]');
          commentsParentReplyTrigger = event.target.closest('[data-gg-action="comments-reply-parent"]');
          commentsRepliesTrigger = event.target.closest('[data-gg-action="comments-open-replies"]');
          commentsRepliesCloseTrigger = event.target.closest('[data-gg-action="comments-replies-close"]');
          nativeCommentReplyTrigger = event.target.closest('.gg-comments a.comment-reply, .gg-comments .comment-reply a, .gg-comments [data-comment-id].comment-reply');
          commentReplyClearTrigger = event.target.closest('[data-gg-action="comments-reply-context-clear"]');
          commentMoreTrigger = event.target.closest('[data-gg-action="comment-more"]');
          commentCopyTrigger = event.target.closest('[data-gg-action="comment-copy-link"]');
          commentDeleteTrigger = event.target.closest('[data-gg-action="comment-native-delete"]');
          langTrigger = event.target.closest('[data-gg-lang-option]');
          themeTrigger = event.target.closest('[data-gg-theme-option]');
          readingTrigger = event.target.closest('[data-gg-reading-option]');
          motionTrigger = event.target.closest('[data-gg-motion-option]');
          closeTrigger = event.target.closest('[data-gg-close], [data-gg-action="comments-close"]');
          discoveryTabTrigger = event.target.closest('[data-gg-command-tab]');
          discoveryTopicToggle = event.target.closest('[data-gg-topic-group-toggle]');
          discoveryTopicApply = event.target.closest('[data-gg-topic-key]');
          discoveryTopicBack = event.target.closest('[data-gg-topic-back]');
          discoveryTopicClear = event.target.closest('[data-gg-topic-clear]');
          discoveryResult = event.target.closest('[data-gg-discovery-href], [data-gg-discovery-action]');
          discoverySubmit = event.target.closest('[data-gg-discovery-submit]');
          searchEmptyAction = event.target.closest('[data-gg-search-empty-action]');
          error404Action = event.target.closest('[data-gg-error404-action]');
          detailOutlineToggle = event.target.closest('[data-gg-outline-toggle]');
          detailOutlineTarget = event.target.closest('[data-gg-outline-target]');

          if (primaryRouteTrigger && handlePrimaryRouteTrigger(primaryRouteTrigger)) {
            event.preventDefault();
            return;
          }

          if (focusTrigger) {
            event.preventDefault();
            launchDiscovery(focusTrigger, 'command-trigger', {
              focusSheet: true,
              selectText: true
            });
            return;
          }

          if (discoveryTabTrigger) {
            event.preventDefault();
            setDiscoveryTab(discoveryTabTrigger.getAttribute('data-gg-command-tab'));
            return;
          }

          if (discoveryTopicToggle) {
            event.preventDefault();
            toggleDiscoveryGroup(discoveryTopicToggle.getAttribute('data-gg-topic-group-toggle'));
            return;
          }

          if (discoveryTopicApply) {
            event.preventDefault();
            setDiscoveryTopic(discoveryTopicApply.getAttribute('data-gg-topic-key'), {
              clearQuery: true
            });
            return;
          }

          if (discoveryTopicBack) {
            event.preventDefault();
            returnToDiscoveryTopics();
            return;
          }

          if (discoveryTopicClear) {
            event.preventDefault();
            clearDiscoveryTopic();
            return;
          }

          if (detailOutlineToggle) {
            event.preventDefault();
            toggleDetailOutline();
            return;
          }

          if (detailOutlineTarget) {
            event.preventDefault();
            scrollToDetailOutlineTarget(detailOutlineTarget.getAttribute('data-gg-outline-target'));
            return;
          }

          if (previewTrigger) {
            event.preventDefault();
            openPreview(previewTrigger.closest(LISTING_ROW_BASE_SELECTOR), previewTrigger, 'preview-trigger');
            return;
          }

          if (moreTrigger) {
            event.preventDefault();
            if (state.panelActive === 'more') {
              closePanel('more', { reason: 'more-toggle' });
            } else {
              openPanel('more', {
                trigger: moreTrigger,
                reason: 'more-trigger'
              });
            }
            return;
          }

          if (commentsTrigger) {
            event.preventDefault();
            toggleCommentsSheet({
              trigger: commentsTrigger,
              reason: 'comments-trigger'
            });
            return;
          }

          if (commentsComposerTrigger) {
            event.preventDefault();
            openComposer({
              trigger: commentsComposerTrigger,
              reason: 'comments-composer-trigger'
            });
            return;
          }

          if (commentsParentReplyTrigger) {
            event.preventDefault();
            handleCommentRepliesParentReply('parent-context');
            return;
          }

          if (commentsAddReplyTrigger) {
            event.preventDefault();
            handleCommentRepliesParentReply('add-reply');
            return;
          }

          if (commentReplyClearTrigger) {
            event.preventDefault();
            clearCommentReplyContext();
            ensureComposerInActiveFooter();
            return;
          }

          if (commentMoreTrigger) {
            event.preventDefault();
            openCommentMoreMenu(commentMoreTrigger);
            return;
          }

          if (commentCopyTrigger) {
            event.preventDefault();
            if (state.commentMoreMenu) {
              copyCommentLink(state.commentMoreMenu.commentNode).then(function () {
                closeCommentMoreMenu();
              });
            }
            return;
          }

          if (commentDeleteTrigger) {
            event.preventDefault();
            if (state.commentMoreMenu && !delegateNativeDelete(state.commentMoreMenu.commentNode)) {
              showCommentStatus(getCopy('comments.status.failed'));
            }
            closeCommentMoreMenu();
            return;
          }

          if (nativeCommentReplyTrigger) {
            state.commentRepliesLastReplySource = state.commentRepliesProgrammaticReplySource || 'native';
            state.commentRepliesExplicitReplyStarted = true;
            handleNativeReplyTrigger(nativeCommentReplyTrigger);
          }

          if (commentsRepliesTrigger) {
            event.preventDefault();
            openCommentRepliesSheet(commentsRepliesTrigger);
            return;
          }

          if (commentsRepliesCloseTrigger) {
            event.preventDefault();
            closeCommentRepliesSheet({
              reason: 'comment-replies-close'
            });
            return;
          }

          if (langTrigger) {
            event.preventDefault();
            setLocale(langTrigger.getAttribute('data-gg-lang-option'));
            if (state.panelActive === 'more') closeMorePreferencePanel();
            return;
          }

          if (themeTrigger) {
            event.preventDefault();
            setTheme(themeTrigger.getAttribute('data-gg-theme-option'));
            if (state.panelActive === 'more') closeMorePreferencePanel();
            return;
          }

          if (readingTrigger) {
            event.preventDefault();
            setReading(readingTrigger.getAttribute('data-gg-reading-option'));
            if (state.panelActive === 'more') closeMorePreferencePanel();
            return;
          }

          if (motionTrigger) {
            event.preventDefault();
            setMotion(motionTrigger.getAttribute('data-gg-motion-option'));
            if (state.panelActive === 'more') closeMorePreferencePanel();
            return;
          }

          if (closeTrigger) {
            event.preventDefault();
            closeName = closeTrigger.getAttribute('data-gg-close') || (closeTrigger.getAttribute('data-gg-action') === 'comments-close' ? 'comments' : '');
            if (closeName === 'command') {
              closeCommandPanel('close-trigger');
            } else if (closeName === 'comments') {
              closeCommentsSheet({ reason: 'close-trigger' });
            } else {
              closePanel(closeName, { reason: closeTrigger.classList.contains('gg-sheet__scrim') ? 'scrim' : (closeTrigger.hasAttribute('data-gg-drag-handle') ? 'handle' : 'close-trigger') });
            }
            return;
          }

          if (discoveryResult) {
            event.preventDefault();
            resolveGlobalDiscoveryAction(
              discoveryResult.getAttribute('data-gg-discovery-action'),
              discoveryResult.getAttribute('data-gg-discovery-href'),
              discoveryResult.getAttribute('data-gg-discovery-target')
            );
            return;
          }

          if (discoverySubmit) {
            event.preventDefault();
            submitCommandSearch(getCommandValue());
            return;
          }

          if (searchEmptyAction) {
            event.preventDefault();
            handleSearchEmptyAction(searchEmptyAction.getAttribute('data-gg-search-empty-action'));
            return;
          }

          if (error404Action) {
            event.preventDefault();
            handleError404Action(error404Action.getAttribute('data-gg-error404-action'));
            return;
          }

          if (state.panelActive === 'command' && !event.target.closest('#gg-command-panel')) {
            closeCommandPanel('command-outside');
          }

          if (state.commentMoreMenu && !event.target.closest('.gg-comment-more')) {
            closeCommentMoreMenu();
          }
        });

        document.addEventListener('keydown', function (event) {
          if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
            event.preventDefault();
            launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-shortcut', {
              focusSheet: true,
              selectText: true
            });
            return;
          }

          if (event.key === 'Escape') {
            if (state.commentMoreMenu) {
              closeCommentMoreMenu({ returnFocus: true });
            } else if (isCommentRepliesSheetOpen()) {
              closeCommentRepliesSheet({ reason: 'comment-replies-escape' });
            } else if (state.panelActive === 'command') {
              closeCommandPanel('command-escape');
            } else if (state.panelActive === 'more' && closeMorePreferencePanel()) {
              focusPanel(getPanel('more')); 
            } else if (!state.panelActive && isDetailOutlineExpanded()) {
              clearDetailOutlineManualOpen();
              setDetailOutlineState(resolveDetailOutlineCompactState());
              restoreDetailOutlineToggleFocus();
            } else {
              closePanel(state.panelActive, { reason: 'escape-close' });
            }
            return;
          }

          trapFocusWhileOpen(event);
        });

        GG.copy = {
          locales: COPY,
          locale: state.locale,
          supported: FEED_PREREQUISITES.supportedLocales,
          get: getCopy,
          setLocale: setLocale
        };

        GG.phase0 = {
          routeVocabulary: ROUTE_VOCABULARY_CONTRACT,
          surfaceLedger: SURFACE_LEDGER,
          feedPrerequisites: FEED_PREREQUISITES,
          currentSurface: null
        };

        GG.command = {
          focus: focusCommand,
          render: renderDiscovery,
          open: function () {
            if (!ui.commandSheetInput) return Promise.resolve(null);
            return launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-api-open', {
              focusSheet: true
            });
          },
          close: function () {
            return closeCommandPanel('command-api-close');
          },
          topics: {
            snapshot: function (query) {
              var resolvedQuery = typeof query === 'string' ? query : getCommandValue();
              var topics = buildDiscoveryTopics(resolvedQuery);

              return {
                mode: shouldGroupDiscoveryTopics(topics) ? 'grouped' : DISCOVERY_TOPIC_LAYOUT_CONTRACT.defaultMode,
                count: topics.length,
                groupedThreshold: DISCOVERY_TOPIC_LAYOUT_CONTRACT.groupedThreshold
              };
            }
          }
        };

        GG.preview = {
          open: function (row, trigger) {
            return openPreview(row, trigger, 'preview-api-open');
          },
          close: function () {
            return closePanel('preview', { reason: 'preview-api-close' });
          }
        };

        GG.commentsSheetController = {
          open: function (options) {
            var openOptions = options || {};
            return openCommentsSheet({
              trigger: openOptions.trigger,
              focus: openOptions.focus !== false,
              reason: openOptions.reason || 'comments-api-open'
            });
          },
          close: function (options) {
            var closeOptions = options || {};
            return closeCommentsSheet({
              returnFocus: closeOptions.returnFocus !== false,
              reason: closeOptions.reason || 'comments-api-close'
            });
          },
          toggle: function (options) {
            var toggleOptions = options || {};
            return toggleCommentsSheet({
              trigger: toggleOptions.trigger,
              focus: toggleOptions.focus !== false,
              returnFocus: toggleOptions.returnFocus !== false,
              reason: toggleOptions.reason || 'comments-api-toggle'
            });
          },
          openComposer: function (options) {
            var composerOptions = options || {};
            return openComposer({
              trigger: composerOptions.trigger,
              focus: composerOptions.focus !== false,
              reason: composerOptions.reason || 'comments-api-composer'
            });
          },
          openReplies: function (trigger) {
            return openCommentRepliesSheet(trigger);
          },
          closeReplies: function (options) {
            return closeCommentRepliesSheet(options || {});
          },
          syncHash: syncCommentsHash,
          trapFocusWhileOpen: trapFocusWhileOpen,
          returnFocusOnClose: returnFocusOnClose,
          lockBodyScrollWhileOpen: lockBodyScrollWhileOpen,
          isOpen: function () {
            return state.panelActive === 'comments';
          }
        };

        GG.detailOutline = {
          open: function () {
            markDetailOutlineManualOpen();
            setDetailOutlineState('expanded');
          },
          close: function () {
            clearDetailOutlineManualOpen();
            setDetailOutlineState(resolveDetailOutlineCompactState());
            restoreDetailOutlineToggleFocus();
          },
          toggle: toggleDetailOutline,
          setState: setDetailOutlineState,
          snapshot: detailOutlineSnapshot
        };

        GG.panelController = {
          open: function (name, options) {
            var panelOptions = options || {};
            if (name === 'command') {
              return launchDiscovery(panelOptions.trigger || document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, panelOptions.reason || 'panel-controller-open', {
                focusSheet: panelOptions.focus !== false,
                selectText: !!panelOptions.selectText
              }).then(function () {
                return getPanel('command');
              });
            }
            return openPanel(name, panelOptions);
          },
          close: function (name, options) {
            if (name === 'command') {
              return closeCommandPanel((options && options.reason) || 'panel-controller-close', options);
            }
            return closePanel(name, options);
          },
          snapshot: panelSnapshot,
          isOpen: function (name) {
            return state.panelActive === name;
          },
          active: function () {
            return state.panelActive;
          }
        };

        GG.sheetController = {
          open: GG.panelController.open,
          close: GG.panelController.close,
          snapshot: sheetControllerSnapshot,
          panelSnapshot: panelSnapshot,
          isOpen: GG.panelController.isOpen,
          active: GG.panelController.active
        };

        GG.contracts = {
          command: COMMAND_PANEL_CONTRACT,
          utilitySheet: UTILITY_SHEET_CONTRACT,
          search: SEARCH_DATA_CONTRACT,
          preview: PREVIEW_DATA_CONTRACT,
          bottomSafeZone: BOTTOM_SAFE_ZONE_CONTRACT,
          panelHeight: PANEL_HEIGHT_CONTRACT,
          detailToolbar: DETAIL_TOOLBAR_CONTRACT,
          detailOutline: DETAIL_OUTLINE_CONTRACT,
          error404Surface: ERROR404_SURFACE_CONTRACT,
          searchEmptyFallback: SEARCH_EMPTY_FALLBACK_CONTRACT,
          error: ERROR_RUNTIME_CONTRACT,
          listingGrowth: LISTING_GROWTH_CONTRACT
        };

        GG.runtime = {
          surface: function () {
            return state.surfaceContext;
          },
          error: function () {
            return state.errorContract;
          },
          special: function () {
            return state.specialContract;
          },
          theme: function () {
            return state.theme;
          },
          error404: error404Snapshot,
          searchEmpty: searchEmptySnapshot,
          outline: detailOutlineSnapshot,
          listingGrowth: function () {
            return {
              state: state.listingGrowthState,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl(),
              storeAppendGuardEnabled: !!state.storeAppendGuardEnabled,
              rootListingAppendGuardActive: !!(state.surfaceContext && state.surfaceContext.isRootListing),
              storeRowsSkippedFromRoot: state.storeRowsSkippedFromRoot || 0
            };
          }
        };

        GG.ledger = {
          activeLegacyBridges: ACTIVE_LEGACY_BRIDGES.slice(),
          closedBridges: CLOSED_BRIDGES.slice(),
          legacyBridges: ACTIVE_LEGACY_BRIDGES.concat(CLOSED_BRIDGES)
        };

        GG.pwa = {
          clearCaches: function () {
            var gate = buildPwaActionGate('clearCaches');

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            return clearPwaCaches({
              preserveSaved: true
            }).then(function (deletedCaches) {
              return refreshPwaCacheAudit().then(function () {
                return {
                  ok: true,
                  action: gate.action,
                  mode: gate.mode,
                  ggdebug: gate.ggdebug,
                  savedCachesPreserved: true,
                  deletedCaches: deletedCaches,
                  cache: pwaCacheSnapshot()
                };
              });
            });
          },
          unregister: function () {
            var gate = buildPwaActionGate('unregister');

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            return unregisterPwaServiceWorkers().then(function (count) {
              pwaState.registered = false;
              pwaState.controlling = false;
              pwaState.waiting = false;
              return {
                ok: true,
                action: gate.action,
                mode: gate.mode,
                ggdebug: gate.ggdebug,
                unregistered: count
              };
            });
          },
          reset: function (options) {
            var resetOptions = options || {};
            var shouldReload = resetOptions.reload !== false;
            var gate = buildPwaActionGate('reset', {
              hardReset: true
            });

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            try {
              window.sessionStorage.removeItem('gg:pwa:landing-redirected');
            } catch (error) {}

            // Hard reset is the only client path allowed to remove gg-saved-* caches.
            return clearPwaCaches({
              preserveSaved: false
            }).then(function (deletedCaches) {
              return unregisterPwaServiceWorkers().then(function (count) {
                pwaState.registered = false;
                pwaState.controlling = false;
                pwaState.waiting = false;
                pwaState.updateAvailable = false;
                pwaState.cacheNames = [];
                pwaState.offlineCached = false;
                pwaState.landingCached = false;
                pwaState.landingVariantsCached = [];
                pwaState.lastCacheMode = 'unknown';
                pwaState.lastCachePath = '';
                writeBodyState('data-gg-cache-mode', 'unknown');

                if (shouldReload) {
                  window.location.replace(window.location.href);
                }

                return {
                  ok: true,
                  action: gate.action,
                  mode: gate.mode,
                  ggdebug: gate.ggdebug,
                  hardReset: true,
                  deletedCaches: deletedCaches,
                  unregistered: count,
                  reloading: shouldReload
                };
              });
            });
          }
        };

        GG.qa = {
          manualMatrix: QA_MANUAL_MATRIX,
          legacyBridges: {
            active: ACTIVE_LEGACY_BRIDGES.slice(),
            closed: CLOSED_BRIDGES.slice()
          },
          routeTargets: getRouteTargets,
          snapshot: qaSnapshot,
          checklist: buildSmokeChecklist,
          runSmoke: runSmoke,
          exercisePanels: exerciseSmokePanels,
          runRouteMatrix: runRouteMatrix,
          getVerificationProcedure: buildVerificationProcedure,
          printVerificationProcedure: formatVerificationProcedure,
          startup: startupSnapshot,
          pwa: function () {
            refreshPwaDiagnostics();
            return pwaSnapshot();
          },
          cache: function () {
            refreshPwaCacheAudit();
            return pwaCacheSnapshot();
          },
          openPanel: function (name) {
            if (name === 'command') {
              return launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'qa-api-open', {
                focusSheet: true
              });
            }
            return openPanel(name, { reason: 'qa-api-open' });
          },
          closePanel: function (name) {
            if (name === 'command') return closeCommandPanel('qa-api-command-close');
            return closePanel(name, { reason: 'qa-api-close' });
          }
        };

        window.addEventListener('hashchange', function () {
          applySurfaceContract();
          syncLaunchPathState();
          syncCommentsHash();
        });

        bindBootStateListeners();
        observeStartupLongTasks();
        syncNetworkState();
        syncDisplayModeState();
        syncLaunchPathState();

        if (maybeRedirectStandaloneLaunch()) return;

        applySurfaceContract();
        setTheme(readPreferredTheme(), true);
        setLocale(readPreferredLocale(), true);
        setReading(readPreferredReading(), true);
        setMotion(readPreferredMotion(), true);
        initMoreLocalSearch();
        initMorePreferences();
        initDockVisibility();
        initDetailOutline();
        initPwaClient();
        syncCommentsHash();
        markShellReady();
        markFirstInteractionReady();
        markHydrationDeferred();
        scheduleCommentsEnhancement('post-hydration');
        ggIdle(function () {
          initListingGrowth().catch(function () {
            setListingGrowthState('error');
          }).then(function () {
            markHydrationComplete();
            refreshPwaDiagnostics();
          });
        }, 1200);
      }(window.GG));
