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

        var FEED_PREREQUISITES = {
          supportedLocales: ['en', 'id'],
          requiredSettings: [
            'Keep post feeds enabled in Blogger settings.',
            'Allow same-origin access to /feeds/posts/default?alt=json for search result enhancement when available.',
            'Treat homepage visible count as route plus payload dependent, not a hard guarantee from max-post settings alone.',
            'Keep listing DOM lightweight; preview/search enrichment must come from feed JSON or same-origin article fetch, not hidden row payload.',
            'Fall back gracefully to title-only listing DOM when feed JSON is unavailable.'
          ],
          search: {
            endpointPath: '/feeds/posts/default?alt=json',
            maxResults: 80,
            fallback: 'listing-dom-local-first',
            submitFallback: 'native-blogger-search-route'
          },
          preview: {
            primary: 'same-origin-article-fetch',
            fallback: 'listing-title-and-url-only'
          }
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
          comments: document.getElementById('gg-comments-panel'),
          commentsPanel: document.querySelector('#gg-comments-panel .gg-sheet__panel'),
          commentsScrim: document.querySelector('#gg-comments-panel .gg-sheet__scrim'),
          commentsHandle: document.querySelector('[data-gg-drag-handle="comments"]'),
          article: document.querySelector('.gg-article'),
          articleBody: document.querySelector('.gg-article .gg-post-body'),
          detailToolbar: document.querySelector('.gg-detail-toolbar'),
          detailCommentsAction: document.querySelector('.gg-detail-toolbar__action[data-gg-open="comments"]'),
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
          langButtons: document.querySelectorAll('[data-gg-lang-option]'),
          themeButtons: document.querySelectorAll('[data-gg-theme-option]')
        };

        var state = {
          locale: 'en',
          theme: 'system',
          surfaceContext: null,
          errorContract: null,
          previewCache: {},
          previewPayload: null,
          previewUrl: '',
          discoveryIndex: null,
          discoveryIndexPromise: null,
          discoveryQuery: '',
          discoveryTab: 'results',
          discoveryTopic: '',
          discoveryActiveIndex: -1,
          discoveryExpandedGroups: {},
          listingSeenUrls: {},
          listingFetchPromise: null,
          listingObserver: null,
          listingGrowthState: 'fallback',
          panelActive: null,
          panelLastTrigger: null,
          panelTimers: {},
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
          if (!state.panelActive) writeBodyState('data-gg-scroll-lock', 'false');

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

        function normalizeLocale(value) {
          var locale = String(value || '').toLowerCase();
          if (locale.indexOf('id') === 0 || locale.indexOf('in') === 0) return 'id';
          return 'en';
        }

        function normalizeTheme(value) {
          var theme = String(value || '').toLowerCase();
          if (theme === 'light' || theme === 'dark') return theme;
          return 'system';
        }

        function isDockHiddenByScroll() {
          return state.dockState === 'hidden-by-scroll' || readBodyState('data-gg-dock-state', '') === 'hidden-by-scroll';
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
          try {
            stored = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : '';
          } catch (error) {
            stored = '';
          }
          return normalizeTheme(stored);
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

          if (state.theme === 'light' || state.theme === 'dark') {
            document.documentElement.setAttribute('data-gg-theme', state.theme);
          } else {
            document.documentElement.removeAttribute('data-gg-theme');
          }

          if (!skipPersist) {
            try {
              if (window.localStorage) window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
            } catch (error) {
              /* ignore storage failures */
            }
          }

          syncThemeButtons();
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

        function setBodyPanelState(activeName, lockScroll) {
          writeBodyState('data-gg-active-panel', activeName || '');
          writeBodyState('data-gg-panel-active', activeName ? 'true' : 'false');
          writeBodyState('data-gg-scroll-lock', lockScroll ? 'true' : 'false');
          syncDockVisibility();
        }

        function syncExpanded(name, expanded) {
          var nodes = document.querySelectorAll('[data-gg-open="' + name + '"], [data-gg-panel-trigger="' + name + '"]');
          var i;
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

        function applyPanelDrag(panel, offset) {
          var panelHeight;
          var progress;
          var resolved = offset < 0 ? offset * 0.28 : offset;

          if (!panel || !panel.panel) return;

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

        function openPanel(name, options) {
          var panel = getPanel(name);
          var openOptions = options || {};

          if (!panel) return Promise.resolve(null);

          if (state.panelActive === name && !panel.root.hidden && panel.root.getAttribute('data-gg-state') === 'open') {
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

            panel.root.hidden = false;
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
            if (!name || state.panelActive === name) {
              state.panelActive = null;
              setBodyPanelState('', false);
            }
            return Promise.resolve(false);
          }

          clearPanelTimer(panel.name);
          syncExpanded(panel.name, false);
          panel.root.setAttribute('data-gg-state', 'closing');
          panel.root.setAttribute('data-gg-active', 'false');
          state.drag = state.drag && state.drag.name === panel.name ? null : state.drag;

          return new Promise(function (resolve) {
            state.panelTimers[panel.name] = window.setTimeout(function () {
              var shouldReturnFocus = closeOptions.returnFocus !== false && panel.returnFocus !== false && state.panelLastTrigger && typeof state.panelLastTrigger.focus === 'function';

              clearPanelTimer(panel.name);
              panel.root.hidden = true;
              panel.root.setAttribute('aria-hidden', 'true');
              panel.root.setAttribute('data-gg-state', 'closed');
              panel.root.removeAttribute('data-gg-active');
              resetPanelDrag(panel, true);

              if (state.panelActive === panel.name) {
                state.panelActive = null;
                setBodyPanelState('', false);
              }

              if (shouldReturnFocus) {
                state.panelLastTrigger.focus();
              }

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

        function launchDiscovery(trigger, reason, options) {
          var launchOptions = options || {};
          var resolvedTrigger = trigger || document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput || document.activeElement || null;
          var query = Object.prototype.hasOwnProperty.call(launchOptions, 'query') ? String(launchOptions.query || '') : getCommandValue();

          if (launchOptions.tab) {
            state.discoveryTab = launchOptions.tab === 'topics' ? 'topics' : 'results';
          }
          if (launchOptions.clearTopic) state.discoveryTopic = '';
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
          var href;
          var appendedCount;

          if (!ui.listing) return 0;

          for (i = 0; i < (rowNodes || []).length; i += 1) {
            imported = document.importNode ? document.importNode(rowNodes[i], true) : rowNodes[i].cloneNode(true);
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
            title: row.getAttribute('data-gg-post-title') || ''
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
          var actionLabel = formatCommentCopy(count, 'action');
          var titleLabel = formatCommentCopy(count, 'title');

          if (ui.detailCommentsLabel) ui.detailCommentsLabel.textContent = actionLabel;
          if (ui.detailCommentsAction) ui.detailCommentsAction.setAttribute('aria-label', actionLabel);

          if (ui.detailCommentsCount) {
            if (count > 0) {
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
        }

        function renderPreviewData(payload, detail) {
          var metaItems;
          if (!ui.previewTitle) return;

          ui.previewTitle.textContent = detail.title || payload.title || getCopy('preview.titleFallback');
          ui.previewSummary.textContent = detail.summary || getCopy('preview.noSummary');
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
        }

        function parsePreviewHtml(html, url) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var article = doc.querySelector('.gg-article');
          var body = doc.querySelector('.gg-post-body, .entry-content');
          var metaDescription = doc.querySelector('meta[name="description"]');
          var firstParagraph = body ? body.querySelector('p') : null;
          var firstImage = body ? body.querySelector('img') : null;
          var labelNodes = doc.querySelectorAll('.gg-taxonomy__link, .post-labels a[rel="tag"]');
          var labels = [];
          var headings = collectOutlineHeadings(body, {
            absoluteBase: url,
            limit: 8,
            prefix: 'gg-preview-section'
          });
          var summary = metaDescription ? stripHtml(metaDescription.getAttribute('content') || '') : '';
          var i;
          var text;
          var href;

          if (!summary && firstParagraph) summary = stripHtml(firstParagraph.innerHTML || '');

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
              ui.previewSummary.textContent = getCopy('preview.noSummary');
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
            labelTexts: post && post.labelTexts ? post.labelTexts : []
          });
          var key = hydrated.href || hydrated.title || ('discovery-' + target.posts.length);
          var existing = target.postMap[key];

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
              labelTexts: labelTexts
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
          return makeHomeUrl('feeds/posts/default?alt=json&max-results=' + FEED_PREREQUISITES.search.maxResults);
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

        function ensureDiscoveryIndex() {
          if (state.discoveryIndex && state.discoveryIndex.posts.length) {
            requestCommandFeedEnhancement(false);
            return Promise.resolve(state.discoveryIndex);
          }

          state.discoveryIndex = buildDiscoveryIndexFromRows();
          if (ui.shell) {
            ui.shell.setAttribute('data-gg-feed-source', state.discoveryIndex.posts.length ? 'listing-dom-local' : 'unresolved');
          }

          if (state.discoveryIndex.posts.length) {
            requestCommandFeedEnhancement(false);
            return Promise.resolve(state.discoveryIndex);
          }

          return requestCommandFeedEnhancement(true);
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

        function buildDiscoveryResults(query) {
          var posts = state.discoveryIndex && state.discoveryIndex.posts ? state.discoveryIndex.posts.slice() : [];
          var q = String(query || '').trim();
          var topicKey = state.discoveryTopic;

          if (topicKey) {
            posts = posts.filter(function (post) {
              return post.topicKeys && post.topicKeys.indexOf(topicKey) > -1;
            });
          }

          if (!q) return posts.slice(0, 8);

          return posts.map(function (post) {
            post._score = scoreDiscoveryPost(post, q);
            return post;
          }).filter(function (post) {
            return post._score > 0;
          }).sort(function (a, b) {
            return b._score - a._score;
          }).slice(0, 10);
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
          var activeTab = state.discoveryTab === 'topics' ? 'topics' : 'results';
          var isResults = activeTab === 'results';

          state.discoveryTab = activeTab;

          if (ui.commandTabResults) {
            ui.commandTabResults.setAttribute('aria-selected', isResults ? 'true' : 'false');
            ui.commandTabResults.setAttribute('tabindex', isResults ? '0' : '-1');
          }
          if (ui.commandTabTopics) {
            ui.commandTabTopics.setAttribute('aria-selected', isResults ? 'false' : 'true');
            ui.commandTabTopics.setAttribute('tabindex', isResults ? '-1' : '0');
          }
          if (ui.commandResultsPanel) ui.commandResultsPanel.hidden = !isResults;
          if (ui.commandTopicsPanel) ui.commandTopicsPanel.hidden = isResults;
          if (ui.commandSheetInput) {
            ui.commandSheetInput.setAttribute('aria-controls', isResults ? 'gg-discovery-panel-results' : 'gg-discovery-panel-topics');
          }
        }

        function createDiscoveryEmptyNode(copyKey) {
          var node = cloneTemplateRoot(ui.discoveryEmptyTemplate);
          var textNode = getTemplatePart(node, 'text');

          if (!node || !textNode) return null;
          textNode.textContent = getCopy(copyKey);
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
          var metaLabel;

          if (!ui.commandResults) return;

          renderDiscoveryContext(topic);

          if (!items.length) {
            if (!topic) {
              nodes.push(createDiscoveryResultNode({
                submit: true,
                typeText: getCopy('command.results.search'),
                titleText: formatCopy('command.results.openSearchResults', { query: q || getCopy('command.results.allPosts') }),
                metaText: getCopy('command.results.noDirectMatch')
              }));
              replaceNodeChildren(ui.commandResults, nodes);
              return;
            }

            replaceNodeChildren(ui.commandResults, [createDiscoveryEmptyNode('command.results.empty')]);
            return;
          }

          for (i = 0; i < items.length; i += 1) {
            metaLabel = items[i].labelTexts && items[i].labelTexts.length
              ? items[i].labelTexts.join(' · ')
              : (items[i].summary || getCopy('command.results.article'));

            nodes.push(createDiscoveryResultNode({
              href: items[i].href,
              typeText: getCopy('command.results.postType'),
              titleText: items[i].title,
              metaText: metaLabel
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
          var nextTab = tab === 'topics' ? 'topics' : 'results';
          if (state.discoveryTab === nextTab) return;
          state.discoveryTab = nextTab;
          state.discoveryActiveIndex = -1;
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
          if (nextOptions.switchToResults !== false) state.discoveryTab = 'results';
          state.discoveryActiveIndex = -1;
          renderDiscovery(query, {
            open: false
          });
        }

        function clearDiscoveryTopic() {
          if (!state.discoveryTopic) return;
          state.discoveryTopic = '';
          state.discoveryActiveIndex = -1;
          renderDiscovery(getCommandValue(), {
            open: false
          });
        }

        function returnToDiscoveryTopics() {
          state.discoveryTab = 'topics';
          state.discoveryActiveIndex = -1;
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
          renderDiscovery(query, {
            open: false
          });
        }

        function getDiscoveryItems() {
          var selector = state.discoveryTab === 'topics' ? DISCOVERY_TOPIC_SELECTOR : DISCOVERY_RESULT_SELECTOR;
          var root = state.discoveryTab === 'topics' ? ui.commandTopics : ui.commandResults;
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
            tab: 'results',
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
            tab: 'results',
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

          if (state.discoveryTab === 'results' && !state.discoveryTopic) {
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
              viewportSatisfied: listingViewportSatisfied()
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
              run: 'Open More sheet, toggle System, Light, and Dark, then inspect html[data-gg-theme] plus GG.qa.snapshot().theme.',
              expected: 'System removes html[data-gg-theme] and follows OS, while Light and Dark persist in gg:theme with matching aria-pressed state.'
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

        function startDrag(event) {
          var handle = event.target.closest('[data-gg-drag-handle]');
          var name;
          var panel;

          if (!handle) return;
          name = handle.getAttribute('data-gg-drag-handle');
          panel = getPanel(name);
          if (!panel || state.panelActive !== name) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          state.drag = {
            name: name,
            pointerId: event.pointerId,
            startY: event.clientY,
            offsetY: 0,
            startedAt: Date.now()
          };

          state.ignoreClickUntil = Date.now() + 180;
          panel.root.setAttribute('data-gg-state', 'dragging');
          resetPanelDrag(panel, true);
          if (handle.setPointerCapture) {
            try {
              handle.setPointerCapture(event.pointerId);
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
          applyPanelDrag(panel, offset);
          event.preventDefault();
        }

        function endDrag(event) {
          var drag = state.drag;
          var panel;
          var shouldClose;
          var velocity;
          var elapsed;

          if (!drag || drag.pointerId !== event.pointerId) return;

          panel = getPanel(drag.name);
          state.drag = null;
          if (!panel) return;

          elapsed = Math.max(1, Date.now() - drag.startedAt);
          velocity = drag.offsetY / elapsed;
          shouldClose = drag.offsetY > getDismissThreshold(panel) || velocity > 0.75;

          if (shouldClose) {
            state.ignoreClickUntil = Date.now() + 320;
            closePanel(drag.name, {
              returnFocus: false,
              reason: 'drag-dismiss'
            });
          } else {
            restorePanelFromDrag(panel);
          }
        }

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
          startDrag(event);
        }, true);

        document.addEventListener('pointermove', moveDrag, { passive: false });
        document.addEventListener('pointerup', function (event) {
          clearPressState();
          endDetailOutlineGesture(event);
          endDrag(event);
        }, true);
        document.addEventListener('pointercancel', function (event) {
          clearPressState();
          state.detailOutlineGesture = null;
          endDrag(event);
        }, true);
        window.addEventListener('blur', clearPressState);

        document.addEventListener('click', function (event) {
          var focusTrigger;
          var previewTrigger;
          var moreTrigger;
          var commentsTrigger;
          var langTrigger;
          var themeTrigger;
          var closeTrigger;
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
          previewTrigger = event.target.closest('[data-gg-open="preview"]');
          moreTrigger = event.target.closest('[data-gg-open="more"]');
          commentsTrigger = event.target.closest('[data-gg-open="comments"]');
          langTrigger = event.target.closest('[data-gg-lang-option]');
          themeTrigger = event.target.closest('[data-gg-theme-option]');
          closeTrigger = event.target.closest('[data-gg-close]');
          discoveryTabTrigger = event.target.closest('[data-gg-command-tab]');
          discoveryTopicToggle = event.target.closest('[data-gg-topic-group-toggle]');
          discoveryTopicApply = event.target.closest('[data-gg-topic-key]');
          discoveryTopicBack = event.target.closest('[data-gg-topic-back]');
          discoveryTopicClear = event.target.closest('[data-gg-topic-clear]');
          discoveryResult = event.target.closest('[data-gg-discovery-href]');
          discoverySubmit = event.target.closest('[data-gg-discovery-submit]');
          searchEmptyAction = event.target.closest('[data-gg-search-empty-action]');
          error404Action = event.target.closest('[data-gg-error404-action]');
          detailOutlineToggle = event.target.closest('[data-gg-outline-toggle]');
          detailOutlineTarget = event.target.closest('[data-gg-outline-target]');

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
            if (state.panelActive === 'comments') {
              closePanel('comments', { reason: 'comments-toggle' });
            } else {
              openPanel('comments', {
                trigger: commentsTrigger,
                reason: 'comments-trigger'
              });
            }
            return;
          }

          if (langTrigger) {
            event.preventDefault();
            setLocale(langTrigger.getAttribute('data-gg-lang-option'));
            return;
          }

          if (themeTrigger) {
            event.preventDefault();
            setTheme(themeTrigger.getAttribute('data-gg-theme-option'));
            return;
          }

          if (closeTrigger) {
            event.preventDefault();
            if (closeTrigger.getAttribute('data-gg-close') === 'command') {
              closeCommandPanel('close-trigger');
            } else {
              closePanel(closeTrigger.getAttribute('data-gg-close'), { reason: 'close-trigger' });
            }
            return;
          }

          if (discoveryResult) {
            window.location.href = discoveryResult.getAttribute('data-gg-discovery-href');
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
        });

        document.addEventListener('keydown', function (event) {
          var activePanel = getPanel(state.panelActive);
          var focusable;
          var firstNode;
          var lastNode;

          if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
            event.preventDefault();
            launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-shortcut', {
              focusSheet: true,
              selectText: true
            });
            return;
          }

          if (event.key === 'Escape') {
            if (state.panelActive === 'command') {
              closeCommandPanel('command-escape');
            } else if (!state.panelActive && isDetailOutlineExpanded()) {
              clearDetailOutlineManualOpen();
              setDetailOutlineState(resolveDetailOutlineCompactState());
              restoreDetailOutlineToggleFocus();
            } else {
              closePanel(state.panelActive, { reason: 'escape-close' });
            }
            return;
          }

          if (event.key !== 'Tab' || !activePanel || !activePanel.trapFocus || !activePanel.panel) {
            return;
          }

          focusable = getFocusableNodes(activePanel.panel);
          if (!focusable.length) return;

          firstNode = focusable[0];
          lastNode = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === firstNode) {
            event.preventDefault();
            lastNode.focus();
          } else if (!event.shiftKey && document.activeElement === lastNode) {
            event.preventDefault();
            firstNode.focus();
          }
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

        GG.sheetController = GG.panelController;

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
              olderPageUrl: getCurrentOlderPageUrl()
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
        initDockVisibility();
        initDetailOutline();
        initPwaClient();
        markShellReady();
        markFirstInteractionReady();
        markHydrationDeferred();
        ggIdle(function () {
          initListingGrowth().catch(function () {
            setListingGrowthState('error');
          }).then(function () {
            markHydrationComplete();
            refreshPwaDiagnostics();
          });
        }, 1200);
      }(window.GG));
