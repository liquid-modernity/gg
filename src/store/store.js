(function () {
  'use strict';

    var STORE_SURFACE_CONTRACT = {
      route: '/store',
      scope: 'standalone-store-surface',
      title: 'Yellow Cart',
      family: 'special-editorial-commerce-surface',
      feedLabel: 'Store',
      legacyFeedLabel: 'yellowcard',
      preview: 'top-content-sheet',
      previewHero: 'sticky-early-scroll-stage',
      previewOverlay: 'moves-with-content-layer',
      previewCarousel: 'manual-snap-no-autoplay',
      previewDots: 'synced-to-carousel',
      previewSecondaryActions: ['save', 'copy-links'],
      utilitySheets: ['discovery', 'saved', 'more'],
      dock: ['store', 'contact', 'discover', 'saved', 'more'],
      dockRule: 'preview-active-beats-dock-and-near-bottom',
      gridAspectRatio: '4:5',
      savedPersistence: 'localStorage',
      hiddenState: 'hidden + aria-hidden + inert',
      reducedMotion: 'respected'
    };

    var STORE_MOTION_CONTRACT = {
      sheetOpen: '220-260ms transform/opacity',
      sheetClose: '170-200ms transform/opacity',
      press: '80-100ms scale/opacity',
      filterTray: '160-220ms transform/opacity',
      toast: '120-180ms opacity/translate',
      carousel: 'manual snap, no autoplay',
      reducedMotion: 'disable non-essential smooth motion'
    };

    var STORE_QA_MATRIX = [
      'Route /store returns canonical Yellow Cart surface.',
      'Feed source is Blogger label Store with legacy label fallback only.',
      'Grid uses 4:5 cards, 2 columns mobile, 3 columns tablet, optional 4 columns wide.',
      'Product card opens top preview sheet with sticky hero staging and moving overlay copy.',
      'Preview carousel is manual, snap-based, uses dots, and keeps Copy Links secondary to marketplace CTAs.',
      'Preview footer uses a handle and no visible close button.',
      'Preview active hides and inerts dock.',
      'Discover opens a command center with search, quick intents, and live result rows.',
      'Saved opens local saved picks from localStorage.',
      'More sheet contains Blog, Home, language switcher, theme switcher, social links, and legal text.',
      'Marketplace CTAs stay primary and open in a new tab with sponsored/nofollow/noopener/noreferrer.',
      'Hidden sheets use hidden, aria-hidden, and inert, and reduced motion is respected.',
      'Escape, scrim, and footer handle dismiss active sheets and restore focus.'
    ];

    var COPY = {
      id: {
        eyebrow: 'PAKRPP · Curated affiliate store',
        summary: 'Kurasi produk pilihan.',
        affiliateDisclosureLabel: 'Pengungkapan afiliasi',
        affiliateDisclosure: 'Affiliate links may be used · Harga dan ketersediaan mengikuti marketplace.',
        searchPlaceholder: 'Cari produk atau kategori',
        filtersLabel: 'Filter',
        contactEyebrow: 'Kontak',
        contactTitle: 'Kolaborasi, pengajuan produk, pengungkapan afiliasi, dan permintaan koreksi.',
        contactBody: 'Untuk kolaborasi brand, pengajuan produk, koreksi data, atau pertanyaan affiliate, hubungi PakRPP melalui WhatsApp.',
        contactCta: 'WhatsApp',
        backToTop: 'Kembali ke Atas',
        archiveCta: 'Lihat arsip Store',
        curatedTitle: 'Belum ada produk yang ditampilkan.',
        curatedBody: 'Koleksi Yellow Cart sedang dikurasi.',
        notesTitle: 'Catatan',
        legalText: 'Beberapa tautan keluar dapat bersifat afiliasi. Harga dan ketersediaan dapat berubah.',
        copyrightText: 'Hak Cipta © 2026 PakRPP. Semua hak dilindungi.',
        copyLinksLabel: 'Salin tautan produk',
        copyLinksCopied: 'Tersalin',
        saveLabel: 'Simpan',
        savedLabel: 'Tersimpan',
        savedOnDevice: 'Tersimpan di perangkat ini.',
        savedEmptyTitle: 'Belum ada produk tersimpan.',
        savedEmptyBody: 'Buka produk dan tekan Simpan.',
        savedToast: 'Disimpan',
        removedToast: 'Dihapus dari Saved',
        copyToast: 'Tautan tersalin',
        copyFailToast: 'Gagal menyalin tautan',
        removeSavedLabel: 'Hapus dari Saved',
        countLoading: 'Memuat produk…',
        countFail: 'Gagal memuat produk',
        emptyTitle: 'Produk tidak ditemukan.',
        emptyBody: 'Coba filter lain atau kosongkan pencarian.',
        feedStore: 'Feed: Store',
        feedStatic: 'Snapshot: Store',
        feedLegacy: 'Feed: arsip Store cadangan',
        filterActive: 'Filter aktif',
        allVisible: 'Semua produk ditampilkan.',
        discoveryTitle: 'Discovery',
        resultsLabel: 'Hasil',
        quickIntentsLabel: 'Pilihan cepat',
        featuredLabel: 'Unggulan',
        latestLabel: 'Terbaru',
        under500Label: 'Di bawah 500k',
        priceFiltersLabel: 'Harga',
        sortLabel: 'Urutkan',
        priceAllLabel: 'Semua harga',
        priceUnder50Label: '<50k',
        price50To100Label: '50k-100k',
        price100To200Label: '100k-200k',
        price200To500Label: '200k-500k',
        priceOver500Label: '>500k',
        priceUnknownLabel: 'Tanpa harga',
        sortRecommendedLabel: 'Rekomendasi',
        sortNewestLabel: 'Terbaru',
        sortPriceAscLabel: 'Harga naik',
        sortPriceDescLabel: 'Harga turun',
        sortAzLabel: 'A-Z',
        intentDailyLabel: 'Harian',
        intentTravelLabel: 'Travel',
        intentWorkspaceLabel: 'Workspace',
        moreTitle: 'Lainnya',
        navigateLabel: 'Navigasi',
        languageLabel: 'Bahasa',
        appearanceLabel: 'Tampilan',
        systemLabel: 'Sistem',
        lightLabel: 'Terang',
        darkLabel: 'Gelap',
        homeLabel: 'Home',
        blogLabel: 'Blog',
        storeLabel: 'Store',
        contactLabel: 'Kontak',
        discoverLabel: 'Discovery',
        savedDockLabel: 'Saved',
        moreDockLabel: 'Lainnya',
        previewProductLabel: 'Pratinjau produk',
        curatedFallback: 'Kurasi',
        untitledProduct: 'Produk tanpa judul',
        closePreview: 'Tutup pratinjau',
        closeDiscovery: 'Tutup Discovery',
        closeSaved: 'Tutup Saved',
        closeMore: 'Tutup panel lainnya',
        openStoreFilter: 'Buka filter Store',
        closeStoreFilter: 'Tutup filter Store',
        skipToCatalog: 'Lewati ke katalog',
        storeNavigationLabel: 'Navigasi Store',
        storeCatalogueLabel: 'Katalog produk Yellow Cart',
        storeIntroLabel: 'Pengenalan Yellow Cart',
        storeFiltersSectionLabel: 'Filter Store',
        previewHeroLabel: 'Hero pratinjau produk',
        productImagesLabel: 'Gambar produk',
        productImagePositionLabel: 'Posisi gambar produk',
        marketplaceLinksLabel: 'Tautan marketplace',
        socialLinksLabel: 'Tautan sosial',
        shareXLabel: 'Bagikan ke X',
        shareFacebookLabel: 'Bagikan ke Facebook',
        shareWhatsAppLabel: 'Bagikan ke WhatsApp',
        showImageLabel: 'Tampilkan gambar',
        curatedPickMeta: 'Pilihan kurasi',
        previewMetaFallback: 'PakRPP · Pilihan kurasi',
        previewSummaryFallback: 'Produk kurasi Yellow Cart.',
        marketplaceCtaLabel: 'Cek harga',
        marketplaceFootnote: 'Harga, stok, pengiriman, dan retur mengikuti marketplace masing-masing.',
        copyLinksAttribution: 'Kurasi via Yellow Cart · PakRPP',
        semanticProductsTitle: 'Catatan Kuratorial',
        semanticProductsLead: 'Alasan singkat, kecocokan, dan catatan sebelum membuka marketplace.',
        semanticShortlistTitle: 'Pilihan Utama',
        semanticShortlistLead: 'Tiga pilihan awal agar pembaca tidak perlu menelusuri semuanya.',
        semanticBrowseTitle: 'Category',
        semanticBrowseLead: 'Buka kategori untuk melihat catatan produk yang lebih lengkap.',
        semanticShortlistBadgeOne: 'Paling berguna',
        semanticShortlistBadgeTwo: 'Harian',
        semanticShortlistBadgeThree: 'Paling visual',
        semanticWhyPickedLabel: 'Kenapa dipilih',
        semanticBestForLabel: 'Cocok untuk',
        semanticCaveatLabel: 'Catatan',
        semanticEditorialDetailLabel: 'Detail editorial',
        semanticStoreLinkLabel: 'Buka produk',
        semanticMoreLabel: 'Lihat {count} lainnya',
        semanticLessLabel: 'Tampilkan lebih sedikit',
        semanticEmptyLabel: 'Pilih produk untuk membaca alasan pemilihan, kecocokan penggunaan, dan catatan sebelum membeli.',
        filterAllLabel: 'Semua',
        filterFashionLabel: 'Fashion',
        filterSkincareLabel: 'Skincare',
        filterWorkspaceLabel: 'Workspace',
        filterTechLabel: 'Tech',
        filterEverydayLabel: 'Lainnya',
        loadMoreLabel: 'Muat lebih banyak',
        productUnit: 'produk'
      },
      en: {
        eyebrow: 'PAKRPP · Curated affiliate store',
        summary: 'Curated product picks.',
        affiliateDisclosureLabel: 'Affiliate disclosure',
        affiliateDisclosure: 'Affiliate links may be used · Prices and availability follow the marketplace.',
        searchPlaceholder: 'Search products or categories',
        filtersLabel: 'Filters',
        contactEyebrow: 'Contact',
        contactTitle: 'Collaborations, product submissions, affiliate disclosures, and correction requests.',
        contactBody: 'For brand collaborations, product submissions, data corrections, or affiliate questions, contact PakRPP through WhatsApp.',
        contactCta: 'WhatsApp',
        backToTop: 'Back to Top',
        archiveCta: 'View Store archive',
        curatedTitle: 'No products are displayed yet.',
        curatedBody: 'Yellow Cart is still being curated.',
        notesTitle: 'Notes',
        legalText: 'Some outbound links may be affiliate links. Prices and availability may change.',
        copyrightText: 'Copyright © 2026 PakRPP. All rights reserved.',
        copyLinksLabel: 'Copy product links',
        copyLinksCopied: 'Copied',
        saveLabel: 'Save',
        savedLabel: 'Saved',
        savedOnDevice: 'Saved on this device.',
        savedEmptyTitle: 'No saved picks yet.',
        savedEmptyBody: 'Open a product and tap Save.',
        savedToast: 'Saved',
        removedToast: 'Removed from Saved',
        copyToast: 'Copied links',
        copyFailToast: 'Copy failed',
        removeSavedLabel: 'Remove from Saved',
        countLoading: 'Loading products…',
        countFail: 'Failed to load products',
        emptyTitle: 'No products found.',
        emptyBody: 'Try another filter or clear the search.',
        feedStore: 'Feed: Store',
        feedStatic: 'Snapshot: Store',
        feedLegacy: 'Feed: Store archive fallback',
        filterActive: 'Active filter',
        allVisible: 'All products are visible.',
        discoveryTitle: 'Discovery',
        resultsLabel: 'Results',
        quickIntentsLabel: 'Quick intents',
        featuredLabel: 'Featured',
        latestLabel: 'Latest',
        under500Label: 'Under 500k',
        priceFiltersLabel: 'Price',
        sortLabel: 'Sort',
        priceAllLabel: 'All prices',
        priceUnder50Label: '<50k',
        price50To100Label: '50k-100k',
        price100To200Label: '100k-200k',
        price200To500Label: '200k-500k',
        priceOver500Label: '>500k',
        priceUnknownLabel: 'No price',
        sortRecommendedLabel: 'Recommended',
        sortNewestLabel: 'Newest',
        sortPriceAscLabel: 'Price asc',
        sortPriceDescLabel: 'Price desc',
        sortAzLabel: 'A-Z',
        intentDailyLabel: 'Daily',
        intentTravelLabel: 'Travel',
        intentWorkspaceLabel: 'Workspace',
        moreTitle: 'More',
        navigateLabel: 'Navigate',
        languageLabel: 'Language',
        appearanceLabel: 'Appearance',
        systemLabel: 'System',
        lightLabel: 'Light',
        darkLabel: 'Dark',
        homeLabel: 'Home',
        blogLabel: 'Blog',
        storeLabel: 'Store',
        contactLabel: 'Contact',
        discoverLabel: 'Discover',
        savedDockLabel: 'Saved',
        moreDockLabel: 'More',
        previewProductLabel: 'Preview product',
        curatedFallback: 'Curated',
        untitledProduct: 'Untitled product',
        closePreview: 'Close preview',
        closeDiscovery: 'Close Discovery',
        closeSaved: 'Close Saved',
        closeMore: 'Close more panel',
        openStoreFilter: 'Open Store filter',
        closeStoreFilter: 'Close Store filter',
        skipToCatalog: 'Skip to catalogue',
        storeNavigationLabel: 'Store navigation',
        storeCatalogueLabel: 'Yellow Cart product catalogue',
        storeIntroLabel: 'Yellow Cart introduction',
        storeFiltersSectionLabel: 'Store filters',
        previewHeroLabel: 'Product preview hero',
        productImagesLabel: 'Product images',
        productImagePositionLabel: 'Product image position',
        marketplaceLinksLabel: 'Marketplace links',
        socialLinksLabel: 'Social links',
        shareXLabel: 'Share to X',
        shareFacebookLabel: 'Share to Facebook',
        shareWhatsAppLabel: 'Share to WhatsApp',
        showImageLabel: 'Show image',
        curatedPickMeta: 'Curated pick',
        previewMetaFallback: 'PakRPP · Curated pick',
        previewSummaryFallback: 'Curated Yellow Cart product.',
        marketplaceCtaLabel: 'Check price',
        marketplaceFootnote: 'Price, stock, shipping, and returns follow each marketplace.',
        copyLinksAttribution: 'Curated via Yellow Cart · PakRPP',
        semanticProductsTitle: 'Editorial Notes',
        semanticProductsLead: 'A concise curation layer based on function, look, use context, and what to consider before buying.',
        semanticShortlistTitle: 'Shortlist',
        semanticShortlistLead: 'Start with the most relevant picks before opening the full catalogue.',
        semanticBrowseTitle: 'Category',
        semanticBrowseLead: 'All product notes remain available for readers and search systems, but are grouped so the page does not become a duplicate catalogue.',
        semanticShortlistBadgeOne: 'Paling berguna',
        semanticShortlistBadgeTwo: 'Harian',
        semanticShortlistBadgeThree: 'Paling visual',
        semanticWhyPickedLabel: 'Why picked',
        semanticBestForLabel: 'Best for',
        semanticCaveatLabel: 'Caveat',
        semanticEditorialDetailLabel: 'Editorial detail',
        semanticStoreLinkLabel: 'Open product',
        semanticMoreLabel: 'Show {count} more',
        semanticLessLabel: 'Show fewer',
        semanticEmptyLabel: 'Open a product to see why it was picked, who it suits, and what to consider before buying.',
        filterAllLabel: 'All',
        filterFashionLabel: 'Fashion',
        filterSkincareLabel: 'Skincare',
        filterWorkspaceLabel: 'Workspace',
        filterTechLabel: 'Tech',
        filterEverydayLabel: 'Lainnya',
        loadMoreLabel: 'Load more',
        productUnit: 'products'
      }
    };

    var STORE_CANONICAL_ORIGIN = 'https://www.pakrpp.com';
    var STORE_CANONICAL_PATH = '/store';
    var STORE_MANIFEST_URL = '/store/data/manifest.json';
    var STORE_MANIFEST_VERSION = 'store-manifest-v1';
    var STORE_WEBSITE_ID = STORE_CANONICAL_ORIGIN + '/#website';
    var STORE_ORGANIZATION_ID = STORE_CANONICAL_ORIGIN + '/#organization';
    var STORE_COLLECTION_ID = STORE_CANONICAL_ORIGIN + STORE_CANONICAL_PATH + '#collection';
    var STORE_ITEMLIST_ID = STORE_CANONICAL_ORIGIN + STORE_CANONICAL_PATH + '#itemlist';
    var STORE_SCHEMA_DESCRIPTION = 'Yellow Cart is PakRPP\'s affiliate product curation and discovery page for editorially selected fashion, skincare, workspace, tech, and everyday picks.';
    // Static featured card seed. Build-time prerender sync keeps this aligned with the first snapshot product.
    // STORE_LCP_PRODUCT_START
    var STORE_LCP_PRODUCT = {
      slug: "foldable-reusable-bag",
      name: "Foldable Reusable Bag",
      category: "Lainnya",
      priceText: "Rp39.000",
      image: "https://picsum.photos/seed/yellowcart-foldable-reusable-bag-1/900/1125",
      alt: "Foldable Reusable Bag"
    };
    // STORE_LCP_PRODUCT_END
    var STORE_CATEGORY_CONFIG = {
      all: {
        labelKey: 'filterAllLabel',
        icon: 'filter_list',
        title: {
          id: 'Semua Kurasi',
          en: 'All Picks'
        },
        description: {
          id: 'Kumpulan produk pilihan Yellow Cart untuk gaya hidup, kerja, dan kebutuhan harian yang dikurasi secara editorial.',
          en: 'A curated Yellow Cart selection for lifestyle, work, and everyday use.'
        },
        keywords: ['yellow cart', 'kurasi produk', 'affiliate store']
      },
      fashion: {
        labelKey: 'filterFashionLabel',
        icon: 'checkroom',
        title: {
          id: 'Fashion',
          en: 'Fashion'
        },
        description: {
          id: 'Pilihan fashion dengan tampilan bersih, netral, dan mudah dipadukan untuk kerja, perjalanan, dan gaya harian.',
          en: 'Clean, neutral, and wearable fashion picks for work, travel, and daily style.'
        },
        keywords: ['fashion minimalis', 'daily wear', 'workwear']
      },
      skincare: {
        labelKey: 'filterSkincareLabel',
        icon: 'spa',
        title: {
          id: 'Skincare',
          en: 'Skincare'
        },
        description: {
          id: 'Kurasi skincare sederhana untuk rutinitas yang realistis, termasuk kebutuhan dasar kulit di iklim tropis.',
          en: 'Simple skincare picks for realistic routines, including basic needs in tropical climates.'
        },
        keywords: ['skincare tropis', 'skin barrier', 'daily skincare']
      },
      workspace: {
        labelKey: 'filterWorkspaceLabel',
        icon: 'desktop_windows',
        title: {
          id: 'Workspace',
          en: 'Workspace'
        },
        description: {
          id: 'Produk untuk setup kerja remote, meja kecil, dan ruang kerja yang rapi tanpa terasa berlebihan.',
          en: 'Products for remote work setups, small desks, and calm workspaces.'
        },
        keywords: ['remote work setup', 'workspace minimalis', 'WFH']
      },
      tech: {
        labelKey: 'filterTechLabel',
        icon: 'devices',
        title: {
          id: 'Tech',
          en: 'Tech'
        },
        description: {
          id: 'Perangkat dan aksesori teknologi yang dipilih untuk fungsi, kerapian, dan kemudahan penggunaan harian.',
          en: 'Tech devices and accessories selected for function, neatness, and everyday usability.'
        },
        keywords: ['tech accessories', 'minimal setup', 'daily tech']
      },
      everyday: {
        labelKey: 'filterEverydayLabel',
        icon: 'category',
        title: {
          id: 'Lainnya',
          en: 'Other'
        },
        description: {
          id: 'Produk lintas kategori yang tetap relevan dengan prinsip kurasi Yellow Cart.',
          en: 'Cross-category products that still fit the Yellow Cart curation logic.'
        },
        keywords: ['daily essentials', 'curated picks']
      }
    };
    var PUBLIC_FILTERS = Object.keys(STORE_CATEGORY_CONFIG);
    var DISCOVERY_PRICE_BANDS = ['all', 'under-50k', '50k-100k', '100k-200k', '200k-500k', 'over-500k', 'unknown'];
    var DISCOVERY_SORTS = ['recommended', 'newest', 'price-asc', 'price-desc', 'az'];
    var STORE_FILTER_ICON_MAP = Object.keys(STORE_CATEGORY_CONFIG).reduce(function (out, key) {
      out[key] = STORE_CATEGORY_CONFIG[key].icon;
      return out;
    }, {});
    var SYSTEM_LABELS = ['store', 'yellowcard', 'yellowcart'];
    var MARKET = ['shopee', 'tiktok', 'tokopedia', 'lazada', 'website', 'official'];
    var PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#d8d0ce"/><stop offset="1" stop-color="#817674"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="42" fill="#fff" fill-opacity=".78">Yellow Cart</text></svg>');

    var app = document.getElementById('store-app');
    var grid = document.getElementById('store-grid');
    var skeletonGrid = document.getElementById('store-grid-skeleton');
    var empty = document.getElementById('store-empty');
    var emptyTitle = document.getElementById('store-empty-title');
    var emptyBody = document.getElementById('store-empty-body');
    var count = document.getElementById('store-count');
    var source = document.getElementById('store-source');
    var categoryContext = document.getElementById('store-category-context');
    var categoryTitle = document.getElementById('store-category-title');
    var categoryDescription = document.getElementById('store-category-description');
    var loadMore = document.getElementById('store-loadmore');
    var semanticList = document.getElementById('store-semantic-product-list');
    var semanticRail = document.getElementById('store-semantic-category-rail');
    var semanticShortlist = document.getElementById('store-semantic-shortlist-grid');
    var discoverySearch = document.getElementById('store-discovery-search');
    var previewSheet = document.getElementById('store-preview-sheet');
    var previewPanel = document.getElementById('store-preview-panel');
    var discoverySheet = document.getElementById('store-discovery-sheet');
    var discoveryPanel = document.getElementById('store-discovery-panel');
    var moreSheet = document.getElementById('store-more-sheet');
    var morePanel = document.getElementById('store-more-panel');
    var discoverOpen = document.getElementById('store-dock-discover');
    var moreOpen = document.getElementById('store-more-open');
    var storeDockLink = document.querySelector('[data-store-dock="store"]');
    var contactLink = document.getElementById('store-contact-link');
    var discoveryStatus = document.getElementById('store-discovery-status');
    var discoveryResults = document.getElementById('store-discovery-results');
    var savedOpen = document.getElementById('store-saved-open');
    var savedSheet = document.getElementById('store-saved-sheet');
    var savedPanel = document.getElementById('store-saved-panel');
    var savedResults = document.getElementById('store-saved-results');
    var filterOutline = document.getElementById('store-filter-outline');
    var filterToggle = document.getElementById('store-filter-toggle');
    var filterToggleIcon = document.getElementById('store-filter-toggle-icon');
    var filterCurrentIcon = document.getElementById('store-filter-current-icon');
    var filterCurrent = document.getElementById('store-filter-current');
    var filterCount = document.getElementById('store-filter-count');
    var savedToast = document.getElementById('store-saved-toast');
    var globalToast = document.getElementById('store-toast');
    var copyBuffer = document.getElementById('store-copy-buffer');
    var staticProductsScript = document.getElementById('store-static-products');
    var itemListJsonLd = document.getElementById('store-itemlist-jsonld');
    var dock = document.getElementById('gg-dock');
    var dragHandles = [].slice.call(document.querySelectorAll('[data-store-drag-handle]'));
    var quickIntentButtons = [].slice.call(document.querySelectorAll('[data-store-intent]'));
    var priceBandButtons = [].slice.call(document.querySelectorAll('[data-store-price-band]'));
    var sortButtons = [].slice.call(document.querySelectorAll('[data-store-sort]'));
    var filterButtons = [].slice.call(document.querySelectorAll('[data-store-filter]'));
    var langButtons = [].slice.call(document.querySelectorAll('[data-store-lang]'));
    var themeButtons = [].slice.call(document.querySelectorAll('[data-store-theme]'));
    var closeButtons = [].slice.call(document.querySelectorAll('[data-store-close]'));

    var preview = {
      carousel: document.getElementById('store-preview-carousel'),
      dots: document.getElementById('store-preview-dots'),
      category: document.getElementById('store-preview-category'),
      title: document.getElementById('store-preview-title'),
      meta: document.getElementById('store-preview-meta'),
      summary: document.getElementById('store-preview-summary'),
      price: document.getElementById('store-preview-price'),
      whyPicked: document.getElementById('store-preview-why-picked'),
      whyPickedValue: document.getElementById('store-preview-why-picked-value'),
      caveat: document.getElementById('store-preview-caveat'),
      caveatValue: document.getElementById('store-preview-caveat-value'),
      save: document.getElementById('store-preview-save'),
      saveIcon: document.getElementById('store-preview-save-icon'),
      saveLabel: document.getElementById('store-preview-save-label'),
      copy: document.getElementById('store-copy-links'),
      copyIcon: document.getElementById('store-copy-links-icon'),
      handle: document.querySelector('#store-preview-sheet .store-preview__handle'),
      toast: document.getElementById('store-preview-toast'),
      notes: document.getElementById('store-preview-notes'),
      notesList: document.getElementById('store-preview-notes-list'),
      links: {
        shopee: document.getElementById('store-link-shopee'),
        tiktok: document.getElementById('store-link-tiktok'),
        tokopedia: document.getElementById('store-link-tokopedia')
      }
    };
    var storeManifestCache = null;
    var storeManifestPromise = null;

    var state = {
      products: [],
      filtered: [],
      discoveryItems: [],
      discoveryFiltered: [],
      discoveryManifestState: 'idle',
      discoveryPrice: 'all',
      discoverySort: 'recommended',
      query: '',
      filter: 'all',
      semanticCategory: '',
      intent: '',
      currentPreviewItem: null,
      currentPreviewImageIndex: 0,
      currentProductKey: '',
      saved: readSaved(),
      visibleLimit: initialVisibleLimit(),
      hasLoadedMore: false,
      panelActive: '',
      lastFocus: null,
      locale: normalizeLocale(readStorage('gg:lang')),
      theme: readStorage('gg:theme') || 'system',
      feedSource: 'Store',
      storeDeepLinkSlug: '',
      dockLastScrollTop: 0,
      dockDirectionStart: 0,
      dockSyncFrame: 0,
      previewDotSyncFrame: 0,
      previewScrollSettleTimer: 0,
      copyFeedbackTimer: 0,
      toastTimer: 0,
      activeToastNode: null,
      dragSession: null,
      resizeSyncFrame: 0
    };
    var DEBUG_FLAGS = {
      overflow: queryFlag('debugOverflow'),
      vitals: queryFlag('debugVitals')
    };
    var debugState = {
      clsSources: [],
      clsValue: 0,
      lcpEntry: null,
      overflowAuditTimer: 0,
      paintEntries: [],
      vitalsObserversStarted: false
    };

    if (!app || !grid) return;

    function cloneTemplate(id) {
      var template = document.getElementById(id);
      if (!template || !template.content || !template.content.firstElementChild) {
        throw new Error('Missing template: ' + id);
      }
      return template.content.firstElementChild.cloneNode(true);
    }

    function normalizeLocale(value) { return value === 'en' ? 'en' : 'id'; }
    function readStorage(key) { try { return window.localStorage && window.localStorage.getItem(key); } catch (error) { return null; } }
    function writeStorage(key, value) { try { if (window.localStorage) window.localStorage.setItem(key, value); } catch (error) {} }
    function removeStorage(key) { try { if (window.localStorage) window.localStorage.removeItem(key); } catch (error) {} }
    function readSaved() {
      try {
        var raw = window.localStorage && window.localStorage.getItem('store:saved');
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch (error) { return []; }
    }
    function writeSaved() { writeStorage('store:saved', JSON.stringify(state.saved || [])); }
    function itemKey(item) { return item && (item.url || item.title) ? String(item.url || item.title) : ''; }
    function isSaved(item) { var key = typeof item === 'string' ? item : itemKey(item); return !!key && state.saved.indexOf(key) > -1; }
    function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
    function cleanTextList(value) { return arr(value).map(clean).filter(Boolean); }
    function cleanFirst(value) {
      if (Array.isArray(value)) return clean(value[0]);
      if (value && typeof value === 'object') return clean(value.name || value.label || value.value || value.title || '');
      return clean(value);
    }
    function slugify(value) {
      var base = clean(value).toLowerCase();
      if (!base) return '';
      if (typeof base.normalize === 'function') base = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    function text(node) { return node && typeof node.$t === 'string' ? node.$t : ''; }
    function arr(value) { return Array.isArray(value) ? value : (value ? [value] : []); }
    function lower(value) { return clean(value).toLowerCase(); }
    function searchText(value) {
      var out = lower(value);
      if (typeof out.normalize === 'function') out = out.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      return out;
    }
    function queryFlag(name) {
      try { return new URLSearchParams(window.location.search || '').get(name) === '1'; }
      catch (error) { return false; }
    }
    function copy(key) { return (COPY[normalizeLocale(state.locale)] && COPY[normalizeLocale(state.locale)][key]) || COPY.id[key] || key; }
    function setScopedCopy(root) {
      if (!root || !(root instanceof Element)) return;
      if (root.matches('[data-copy]')) root.textContent = copy(root.getAttribute('data-copy'));
      [].slice.call(root.querySelectorAll('[data-copy]')).forEach(function (node) { node.textContent = copy(node.getAttribute('data-copy')); });
      if (root.matches('[data-copy-aria]')) root.setAttribute('aria-label', copy(root.getAttribute('data-copy-aria')));
      [].slice.call(root.querySelectorAll('[data-copy-aria]')).forEach(function (node) { node.setAttribute('aria-label', copy(node.getAttribute('data-copy-aria'))); });
      if (root.matches('[data-copy-title]')) root.setAttribute('title', copy(root.getAttribute('data-copy-title')));
      [].slice.call(root.querySelectorAll('[data-copy-title]')).forEach(function (node) { node.setAttribute('title', copy(node.getAttribute('data-copy-title'))); });
    }
    function setNodeText(node, value) { if (node) node.textContent = value; }
    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
    function productUnit() { return copy('productUnit'); }
    function describeNode(node) {
      var parts;
      if (!node || node.nodeType !== 1) return '';
      parts = [node.tagName.toLowerCase()];
      if (node.id) parts.push('#' + node.id);
      if (node.classList && node.classList.length) parts.push('.' + [].slice.call(node.classList).slice(0, 3).join('.'));
      return parts.join('');
    }
    function textSnippet(node) {
      return clean(node && node.textContent ? node.textContent : '').slice(0, 120);
    }
    function debugLog(channel, payload) {
      console.info('[store][' + channel + ']', payload);
    }
    function initialVisibleLimit() {
      return window.matchMedia && window.matchMedia('(min-width: 720px)').matches ? 12 : 8;
    }
    function visibleStepLimit() {
      return window.matchMedia && window.matchMedia('(min-width: 720px)').matches ? 12 : 8;
    }
    function prefersReducedMotion() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    function smoothBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }
    function setSkeletonVisible(visible) {
      if (skeletonGrid) skeletonGrid.hidden = !visible;
      if (grid) grid.hidden = visible;
    }
    function matchesConfiguredLcpProduct(item) {
      return !!(item && STORE_LCP_PRODUCT.slug && slugify(item.slug) === slugify(STORE_LCP_PRODUCT.slug));
    }
    function shouldPrioritizeConfiguredLcpProduct() {
      return !state.query && state.filter === 'all' && !state.intent;
    }
    function prioritizeConfiguredLcpProduct(items) {
      var next;
      var index;
      if (!shouldPrioritizeConfiguredLcpProduct()) return items;
      index = (items || []).findIndex(matchesConfiguredLcpProduct);
      if (index <= 0) return items;
      next = items.slice();
      next.unshift(next.splice(index, 1)[0]);
      return next;
    }
    function scheduleOverflowAudit(reason) {
      if (!DEBUG_FLAGS.overflow) return;
      if (debugState.overflowAuditTimer) window.clearTimeout(debugState.overflowAuditTimer);
      debugState.overflowAuditTimer = window.setTimeout(function () {
        debugState.overflowAuditTimer = 0;
        runOverflowAudit(reason);
      }, 90);
    }
    function runOverflowAudit(reason) {
      var viewport = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      var offenders = [];
      if (!DEBUG_FLAGS.overflow || !document.body || !viewport) return;
      [].slice.call(document.body.querySelectorAll('*')).forEach(function (node) {
        var rect;
        var style;
        var overflowLeft;
        var overflowRight;
        var exceed;
        if (!node || !node.getClientRects || !node.getClientRects().length) return;
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT') return;
        style = window.getComputedStyle(node);
        if (!style || style.display === 'none' || style.visibility === 'hidden') return;
        rect = node.getBoundingClientRect();
        overflowLeft = Math.max(0, 0 - rect.left);
        overflowRight = Math.max(0, rect.right - viewport);
        exceed = Math.max(overflowLeft, overflowRight);
        if (exceed <= 1) return;
        offenders.push({
          node: describeNode(node),
          overflow: Number(exceed.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          text: textSnippet(node)
        });
      });
      debugLog('overflow', {
        reason: reason,
        viewport: viewport,
        offenders: offenders
      });
    }
    function reportDebugVitals(reason) {
      var lcpEntry;
      var lcpNode;
      if (!DEBUG_FLAGS.vitals) return;
      lcpEntry = debugState.lcpEntry;
      lcpNode = lcpEntry && lcpEntry.element;
      debugLog('vitals', {
        reason: reason,
        now: Math.round(window.performance.now()),
        readyState: document.readyState,
        lcpTime: lcpEntry ? Math.round(lcpEntry.startTime) : 0,
        lcpTag: lcpNode && lcpNode.tagName ? lcpNode.tagName.toLowerCase() : '',
        lcpSelector: describeNode(lcpNode),
        lcpCurrentSrc: lcpNode && lcpNode.currentSrc ? lcpNode.currentSrc : '',
        lcpText: textSnippet(lcpNode),
        paints: debugState.paintEntries.slice(),
        clsValue: Number(debugState.clsValue.toFixed(4)),
        clsSources: debugState.clsSources.slice()
      });
    }
    function scheduleDebugVitalsReport(reason) {
      if (!DEBUG_FLAGS.vitals) return;
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          reportDebugVitals(reason);
        }, 0);
      });
    }
    function setupDebugVitals() {
      if (!DEBUG_FLAGS.vitals || debugState.vitalsObserversStarted || !('PerformanceObserver' in window)) return;
      debugState.vitalsObserversStarted = true;
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (entry) {
            debugState.paintEntries.push({
              name: entry.name,
              startTime: Math.round(entry.startTime)
            });
          });
        }).observe({ type: 'paint', buffered: true });
      } catch (error) {}
      try {
        new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          if (entries.length) debugState.lcpEntry = entries[entries.length - 1];
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {}
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (entry) {
            if (entry.hadRecentInput) return;
            debugState.clsValue += entry.value || 0;
            (entry.sources || []).forEach(function (source) {
              var label = describeNode(source && source.node);
              if (label && debugState.clsSources.indexOf(label) === -1) debugState.clsSources.push(label);
            });
          });
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (error) {}
    }
    function isStorePath() {
      return window.location.pathname.replace(/\/+$/, '') === '/store';
    }
    function isEditableElement(node) {
      if (!node || !(node instanceof Element)) return false;
      if (node.closest('[contenteditable="true"]')) return true;
      var field = node.closest('input, textarea, select');
      return !!field;
    }
    function filterCopyKey(filter) {
      var config = STORE_CATEGORY_CONFIG[filter] || STORE_CATEGORY_CONFIG.all;
      return config.labelKey || 'filterAllLabel';
    }
    function currentFilterLabel() {
      return copy(filterCopyKey(state.filter));
    }
    function categoryLocaleValue(field, filter) {
      var config = STORE_CATEGORY_CONFIG[filter] || STORE_CATEGORY_CONFIG.all;
      var locale = normalizeLocale(state.locale);
      return clean(config && config[field] && config[field][locale] ? config[field][locale] : (config && config[field] && config[field].id) || '');
    }
    function updateCategoryContext() {
      if (!categoryContext) return;
      setNodeText(categoryTitle, categoryLocaleValue('title', state.filter));
      setNodeText(categoryDescription, categoryLocaleValue('description', state.filter));
    }
    function absoluteUrl(value) {
      var raw = clean(value);
      var url;
      if (!raw) return '';
      if (raw === '#') return '';
      try {
        url = new URL(raw, STORE_CANONICAL_ORIGIN);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
        return url.toString();
      }
      catch (error) { return ''; }
    }
    function parsePriceValue(value) {
      var raw;
      var compact;
      var parsed;
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      raw = clean(value);
      if (!raw) return 0;
      compact = lower(raw).replace(/[^0-9,.\-]/g, '');
      if (!compact) return 0;
      if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(compact)) compact = compact.replace(/\./g, '').replace(',', '.');
      if (compact.indexOf(',') > -1 && compact.indexOf('.') > -1) compact = compact.replace(/\./g, '').replace(',', '.');
      else if (compact.indexOf(',') > -1) compact = compact.replace(',', '.');
      parsed = parseFloat(compact);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    function detectPriceCurrency(priceText, explicitCurrency) {
      var currency = clean(explicitCurrency).toUpperCase();
      var raw = lower(priceText);
      if (currency) return currency;
      if (raw.indexOf('rp') > -1 || raw.indexOf('idr') > -1) return 'IDR';
      return '';
    }
    function storeRelativeUrl(slug) {
      return slug ? (STORE_CANONICAL_PATH + '?item=' + encodeURIComponent(slug)) : STORE_CANONICAL_PATH;
    }
    function storeAbsoluteUrl(slug) {
      return STORE_CANONICAL_ORIGIN + storeRelativeUrl(slug);
    }
    function productStoreUrl(item) {
      return clean(item && item.storeUrl) || storeRelativeUrl(item && item.slug);
    }
    function productStoreAbsoluteUrl(item) {
      return absoluteUrl(productStoreUrl(item)) || storeAbsoluteUrl(item && item.slug);
    }
    function canonicalProductUrl(item) {
      return absoluteUrl(item && (item.canonicalUrl || item.url));
    }
    function isNonSpecificOfferUrl(value) {
      var href = clean(value);
      return /\/search\b|[?&](q|query|keyword|keywords)=|[?&]st=product(?:&|$)/i.test(href);
    }
    function marketplaceDisplayName(key) {
      if (key === 'shopee') return 'Shopee';
      if (key === 'tokopedia') return 'Tokopedia';
      if (key === 'tiktok') return 'TikTok';
      if (key === 'lazada') return 'Lazada';
      if (key === 'website') return normalizeLocale(state.locale) === 'id' ? 'website produk' : 'product website';
      return 'marketplace';
    }
    function specificOfferMeta(item) {
      var links = item && item.links ? item.links : {};
      var keys = ['shopee', 'tokopedia', 'tiktok', 'lazada', 'website'];
      var index;
      var href;
      for (index = 0; index < keys.length; index += 1) {
        href = absoluteUrl(links[keys[index]]);
        if (href && !isNonSpecificOfferUrl(href)) return { url: href, key: keys[index] };
      }
      return null;
    }
    function specificOfferUrl(item) {
      var meta = specificOfferMeta(item);
      return meta ? meta.url : '';
    }
    function requestedItemSlug() {
      var search;
      var querySlug = '';
      var hash = clean((window.location.hash || '').replace(/^#/, ''));
      try { search = new URLSearchParams(window.location.search || ''); }
      catch (error) { search = null; }
      if (search) querySlug = slugify(search.get('item') || '');
      if (querySlug) return querySlug;
      return /^item-/.test(hash) ? slugify(hash.slice(5)) : '';
    }
    function updateHistoryUrl(url) {
      if (!isStorePath()) return;
      try { history.replaceState(null, '', url); } catch (error) {}
    }
    function syncPreviewUrl(item) {
      if (!item || !item.slug) return;
      state.storeDeepLinkSlug = item.slug;
      updateHistoryUrl(storeRelativeUrl(item.slug));
    }
    function clearPreviewUrl() {
      var next;
      if (!isStorePath()) return;
      try {
        next = new URL(window.location.href);
        next.searchParams.delete('item');
        if (/^#item-/.test(next.hash || '')) next.hash = '';
        updateHistoryUrl(next.pathname + next.search + next.hash);
      } catch (error) {
        updateHistoryUrl(STORE_CANONICAL_PATH);
      }
      state.storeDeepLinkSlug = '';
    }
    function previewImageActionLabel(index) { return copy('showImageLabel') + ' ' + (index + 1); }
    function previewCopyLabel() { return copy('copyLinksLabel'); }
    function previewCopiedLabel() { return copy('copyLinksCopied'); }
    function previewMetaText(item) {
      return ['PakRPP', item && item.published, copy('curatedPickMeta')].filter(Boolean).join(' · ');
    }
    function displayProductTitle(item) {
      return clean(item && item.title ? item.title : '') || copy('untitledProduct');
    }
    function displayProductBadge(item) {
      return clean(item && (item.badge || item.category) ? (item.badge || item.category) : '') || copy('curatedFallback');
    }
    function previewSummaryText(item) {
      return clean(item && item.summary ? item.summary : '') || copy('previewSummaryFallback');
    }
    function previewVerdictText(item) {
      return clean(item && item.verdict ? item.verdict : '') || previewSummaryText(item);
    }
    function savedEmptyLabel() {
      return copy('savedEmptyTitle') + ' ' + copy('savedEmptyBody');
    }
    function semanticSummaryText(item) {
      return previewSummaryText(item);
    }
    function semanticBestForText(item) {
      return cleanTextList(item && item.bestFor).join(' · ') || clean(item && item.useCase) || clean(item && item.geoContext);
    }
    function semanticTags(item) {
      return cleanTextList(item && item.tags).slice(0, 6);
    }
    function productSearchHaystack(item) {
      return [
        item.title,
        item.category,
        item.summary,
        item.verdict,
        item.whyPicked,
        cleanTextList(item.bestFor).join(' '),
        item.caveat,
        item.useCase,
        item.geoContext,
        item.priceText,
        item.labels.join(' '),
        (item.tags || []).join(' '),
        (item.contents || []).join(' ')
      ].join(' ').toLowerCase();
    }
    function findItemBySlug(slug) {
      var expected = slugify(slug);
      var index;
      if (!expected) return null;
      for (index = 0; index < state.products.length; index += 1) {
        if (slugify(state.products[index].slug) === expected) return state.products[index];
      }
      return null;
    }
    function updateItemListJsonLd(items) {
      var list = (items || []).map(function (item, index) {
        var itemUrl = canonicalProductUrl(item) || productStoreAbsoluteUrl(item);
        var images = arr(item && item.images).map(absoluteUrl).filter(Boolean);
        var offerMeta = specificOfferMeta(item);
        var product = {
          '@type': 'Product',
          '@id': itemUrl + '#product',
          name: displayProductTitle(item),
          description: semanticSummaryText(item),
          brand: {
            '@type': 'Brand',
            name: clean(item && item.brand) || 'Generic'
          }
        };
        var offerPrice = item && item.price ? Number(item.price) : 0;
        var offerCurrency = clean(item && item.priceCurrency).toUpperCase();
        if (images.length) product.image = images;
        if (item && item.category) product.category = item.category;
        if (offerPrice > 0 && offerCurrency && offerMeta && offerMeta.url) {
          product.offers = {
            '@type': 'Offer',
            url: offerMeta.url,
            price: String(offerPrice),
            priceCurrency: offerCurrency
          };
          if (offerMeta.key !== 'website') {
            product.offers.seller = {
              '@type': 'Organization',
              name: marketplaceDisplayName(offerMeta.key)
            };
          }
        }
        return {
          '@type': 'ListItem',
          position: index + 1,
          url: itemUrl,
          item: product
        };
      });
      if (!itemListJsonLd) return;
      itemListJsonLd.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': STORE_WEBSITE_ID,
            name: 'PakRPP',
            url: STORE_CANONICAL_ORIGIN
          },
          {
            '@type': 'Organization',
            '@id': STORE_ORGANIZATION_ID,
            name: 'PakRPP',
            url: STORE_CANONICAL_ORIGIN
          },
          {
            '@type': 'CollectionPage',
            '@id': STORE_COLLECTION_ID,
            name: 'Yellow Cart',
            url: STORE_CANONICAL_ORIGIN + STORE_CANONICAL_PATH,
            isPartOf: { '@id': STORE_WEBSITE_ID },
            publisher: { '@id': STORE_ORGANIZATION_ID },
            description: STORE_SCHEMA_DESCRIPTION,
            mainEntity: { '@id': STORE_ITEMLIST_ID }
          },
          {
            '@type': 'ItemList',
            '@id': STORE_ITEMLIST_ID,
            name: 'Yellow Cart product picks',
            url: STORE_CANONICAL_ORIGIN + STORE_CANONICAL_PATH,
            numberOfItems: list.length,
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            itemListElement: list
          }
        ]
      });
    }
    function clearToastTimer() {
      if (!state.toastTimer) return;
      window.clearTimeout(state.toastTimer);
      state.toastTimer = 0;
    }
    function currentFilterIcon() {
      return STORE_FILTER_ICON_MAP[state.filter] || STORE_FILTER_ICON_MAP.all;
    }
    function filterToggleAriaLabel(expanded, label, countLabel) {
      return copy(expanded ? 'closeStoreFilter' : 'openStoreFilter') + '. ' + copy('filterActive') + ': ' + label + '. ' + countLabel + '.';
    }
    function toastNodes() {
      return [preview.toast, savedToast, globalToast].filter(Boolean);
    }
    function hideToastNode(node) {
      if (!node) return;
      node.hidden = true;
      node.textContent = '';
    }
    function hideAllToasts() {
      toastNodes().forEach(hideToastNode);
      state.activeToastNode = null;
    }
    function resolveToastNode(context) {
      if (context === 'preview') return preview.toast || globalToast;
      if (context === 'saved') return savedToast || globalToast;
      if (context === 'discovery') return globalToast;
      if (state.panelActive === 'preview' && preview.toast) return preview.toast;
      if (state.panelActive === 'saved' && savedToast) return savedToast;
      return globalToast;
    }
    function showToast(message, context) {
      var node = resolveToastNode(context);
      if (!node || !message) return;
      clearToastTimer();
      hideAllToasts();
      node.hidden = false;
      node.textContent = message;
      state.activeToastNode = node;
      state.toastTimer = window.setTimeout(function () {
        state.toastTimer = 0;
        hideToastNode(node);
        if (state.activeToastNode === node) state.activeToastNode = null;
      }, 1600);
    }
    function clearCopyFeedbackTimer() {
      if (!state.copyFeedbackTimer) return;
      window.clearTimeout(state.copyFeedbackTimer);
      state.copyFeedbackTimer = 0;
    }
    function setPreviewCopyState(nextState) {
      if (!preview.copy) return;
      var copied = nextState === 'copied';
      var label = copied ? previewCopiedLabel() : previewCopyLabel();
      preview.copy.setAttribute('data-copy-state', copied ? 'copied' : 'idle');
      preview.copy.setAttribute('aria-label', label);
      preview.copy.setAttribute('title', label);
      if (preview.copyIcon) preview.copyIcon.textContent = copied ? 'check' : 'content_copy';
    }
    function setPreviewSaveState(saved) {
      if (!preview.save) return;
      preview.save.setAttribute('aria-pressed', saved ? 'true' : 'false');
      preview.save.setAttribute('aria-label', saved ? copy('savedLabel') : copy('saveLabel'));
      setNodeText(preview.saveLabel, saved ? copy('savedLabel') : copy('saveLabel'));
      if (preview.saveIcon) preview.saveIcon.textContent = saved ? 'bookmark' : 'bookmark_add';
    }
    function togglePreviewFact(node, valueNode, value) {
      if (!node || !valueNode) return;
      if (clean(value)) {
        node.hidden = false;
        valueNode.textContent = clean(value);
      } else {
        node.hidden = true;
        valueNode.textContent = '';
      }
    }
    function marketplaceAriaLabel(key, item) {
      var title = displayProductTitle(item);
      if (normalizeLocale(state.locale) === 'id') {
        return 'Cek harga ' + title + ' di ' + marketplaceDisplayName(key);
      }
      return 'Check price for ' + title + ' on ' + marketplaceDisplayName(key);
    }
    function syncFilterToggleState(expanded) {
      var label = filterCurrent ? clean(filterCurrent.textContent) || currentFilterLabel() : currentFilterLabel();
      var countLabel = filterCount ? clean(filterCount.textContent) || ('0 ' + productUnit()) : ('0 ' + productUnit());
      if (filterToggle) {
        filterToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        filterToggle.setAttribute('aria-label', filterToggleAriaLabel(expanded, label, countLabel));
      }
      if (filterToggleIcon) filterToggleIcon.textContent = expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up';
    }
    function updateFilterPeek(countLabel) {
      var label = currentFilterLabel();
      if (filterCurrentIcon) setNodeText(filterCurrentIcon, currentFilterIcon());
      if (filterCurrent) setNodeText(filterCurrent, label);
      if (filterCount) setNodeText(filterCount, countLabel || (state.filtered.length + ' ' + productUnit()));
      syncFilterToggleState(filterOutline && filterOutline.getAttribute('data-store-filter-state') === 'expanded');
    }
    function setPanelEnvironment(active) {
      if (dock) {
        if (active) {
          dock.setAttribute('inert', '');
          dock.setAttribute('aria-hidden', 'true');
        } else {
          dock.removeAttribute('inert');
          dock.removeAttribute('aria-hidden');
        }
      }
      if (filterOutline) {
        if (active) {
          filterOutline.setAttribute('inert', '');
          filterOutline.setAttribute('aria-hidden', 'true');
        } else {
          filterOutline.removeAttribute('inert');
          filterOutline.removeAttribute('aria-hidden');
        }
      }
    }
    function setCopy() {
      [].slice.call(document.querySelectorAll('[data-copy]')).forEach(function (node) { node.textContent = copy(node.getAttribute('data-copy')); });
      [].slice.call(document.querySelectorAll('[data-copy-placeholder]')).forEach(function (node) { node.setAttribute('placeholder', copy(node.getAttribute('data-copy-placeholder'))); });
      [].slice.call(document.querySelectorAll('[data-copy-aria]')).forEach(function (node) { node.setAttribute('aria-label', copy(node.getAttribute('data-copy-aria'))); });
      [].slice.call(document.querySelectorAll('[data-copy-title]')).forEach(function (node) { node.setAttribute('title', copy(node.getAttribute('data-copy-title'))); });
      [].slice.call(document.querySelectorAll('[data-copy-value]')).forEach(function (node) { node.value = copy(node.getAttribute('data-copy-value')); });
      if (discoverySearch) discoverySearch.setAttribute('aria-label', copy('searchPlaceholder'));
      if (discoveryStatus) discoveryStatus.setAttribute('aria-live', 'polite');
      langButtons.forEach(function (button) { button.setAttribute('aria-pressed', button.getAttribute('data-store-lang') === state.locale ? 'true' : 'false'); });
      document.documentElement.lang = normalizeLocale(state.locale);
      setPreviewCopyState(preview.copy && preview.copy.getAttribute('data-copy-state') === 'copied' ? 'copied' : 'idle');
      setPreviewSaveState(preview.save && preview.save.getAttribute('aria-pressed') === 'true');
      syncFilterToggleState(filterOutline && filterOutline.getAttribute('data-store-filter-state') === 'expanded');
      updateCounts();
    }
    function applyTheme() {
      themeButtons.forEach(function (button) { button.setAttribute('aria-pressed', button.getAttribute('data-store-theme') === state.theme ? 'true' : 'false'); });
      if (state.theme === 'light' || state.theme === 'dark') {
        document.documentElement.setAttribute('data-gg-theme', state.theme);
        writeStorage('gg:theme', state.theme);
      } else {
        document.documentElement.removeAttribute('data-gg-theme');
        removeStorage('gg:theme');
      }
    }

    function labels(entry) {
      return (entry.category || []).map(function (cat) { return clean(cat.term); }).filter(Boolean);
    }
    function altUrl(entry) {
      var links = entry.link || [];
      for (var i = 0; i < links.length; i += 1) if (links[i].rel === 'alternate') return links[i].href;
      return '#';
    }
    function dateLabel(raw) {
      if (!raw) return '';
      var date = new Date(raw);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleDateString(state.locale === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'short', day: '2-digit' });
    }
    function publicLabels(labs) {
      return labs.filter(function (label) { return SYSTEM_LABELS.indexOf(label.toLowerCase()) === -1; });
    }
    function publicFilter(category) {
      var c = lower(category);
      return PUBLIC_FILTERS.indexOf(c) > -1 && c !== 'all' ? c : 'everyday';
    }
    function marketplaceInfo(href) {
      var value = clean(href);
      var url;
      var host;
      if (!value) return null;
      try {
        url = new URL(value, window.location.origin);
      } catch (error) {
        return null;
      }
      if (url.protocol !== 'https:') return null;
      host = lower(url.hostname).replace(/^www\./, '');
      if (/(^|\.)shopee\.[a-z.]+$/.test(host)) return { key: 'shopee', href: url.toString() };
      if (host === 'tokopedia.com' || /(^|\.)tokopedia\.com$/.test(host)) return { key: 'tokopedia', href: url.toString() };
      if (host === 'tiktok.com' || /(^|\.)tiktok\.com$/.test(host)) return { key: 'tiktok', href: url.toString() };
      if (host === 'lazada.com' || /(^|\.)lazada\.[a-z.]+$/.test(host)) return { key: 'lazada', href: url.toString() };
      return null;
    }
    function marketplaceHref(raw, key) {
      var info = marketplaceInfo(raw);
      var genericUrl;
      if (key === 'website') {
        genericUrl = absoluteUrl(raw);
        return genericUrl || '';
      }
      return info && info.key === key ? info.href : '';
    }
    function parseJsonScript(doc) {
      var scripts = [].slice.call(doc.querySelectorAll('script.gg-store-data, script[type="application/json"].gg-store-data, .gg-store-data[type="application/json"], script.gg-yellowcard-data, script[type="application/json"].gg-yellowcard-data, .gg-yellowcard-data[type="application/json"]'));
      for (var i = 0; i < scripts.length; i += 1) {
        try { return JSON.parse(scripts[i].textContent || '{}') || {}; } catch (error) {}
      }
      return {};
    }
    function parseContent(html) {
      var out = { data: {}, images: [], links: {}, contents: [], summary: '' };
      if (!html || !window.DOMParser) return out;
      var doc = new DOMParser().parseFromString(html, 'text/html');
      out.data = parseJsonScript(doc);
      var anchors = [].slice.call(doc.querySelectorAll('a[href]'));
      var imgs = [].slice.call(doc.querySelectorAll('img'));
      var heads = [].slice.call(doc.querySelectorAll('h2, h3'));
      imgs.forEach(function (img) {
        var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (src) out.images.push(src);
      });
      anchors.forEach(function (a) {
        var info = marketplaceInfo(a.getAttribute('href') || '');
        if (info && !out.links[info.key]) out.links[info.key] = info.href;
      });
      [].slice.call(doc.querySelectorAll('script, style, noscript')).forEach(function (n) { n.remove(); });
      out.contents = heads.map(function (head) { return clean(head.textContent); }).filter(Boolean).slice(0, 4);
      out.summary = clean(doc.body ? doc.body.textContent : '').slice(0, 220);
      return out;
    }
    function deriveSlug(data, entry, fallbackTitle) {
      var entryUrl = altUrl(entry);
      var fromUrl = '';
      try { fromUrl = entryUrl ? new URL(entryUrl).pathname.split('/').filter(Boolean).pop() : ''; }
      catch (error) { fromUrl = ''; }
      return slugify(data.slug || data.handle || data.storeSlug || fromUrl || fallbackTitle || entryUrl || 'product');
    }
    function normalize(entry) {
      var html = text(entry.content) || text(entry.summary);
      var parsed = parseContent(html);
      var data = parsed.data || {};
      var labs = labels(entry);
      var publicLabs = publicLabels(labs);
      var title = clean(data.name || data.productName || text(entry.title) || '');
      var category = clean(data.category || publicLabs[0] || '');
      var images = arr(data.images || data.gallery || data.image || parsed.images).map(clean).filter(Boolean).slice(0, 8);
      var dataLinks = data.links || {};
      var canonicalUrl = absoluteUrl(data.canonicalUrl || data.url || altUrl(entry));
      var slug = deriveSlug(data, entry, title);
      var priceText = clean(data.priceText || data.priceLabel || data.price || 'Rp—');
      var price = parsePriceValue(data.price) || priceNumber(priceText);
      var priceCurrency = detectPriceCurrency(priceText, data.priceCurrency || data.currency);
      var notes = cleanTextList(data.notes || data.contents || data.sections || parsed.contents).slice(0, 6);
      var tags = cleanTextList(data.tags || data.keywords || data.labels || data.topics);
      var linksOut = {};
      MARKET.forEach(function (key) { linksOut[key] = marketplaceHref(dataLinks[key], key) || marketplaceHref(parsed.links[key], key) || ''; });
      return {
        id: canonicalUrl || altUrl(entry),
        slug: slug,
        name: title,
        title: title,
        url: altUrl(entry),
        canonicalUrl: canonicalUrl,
        storeUrl: clean(data.storeUrl) || storeAbsoluteUrl(slug),
        labels: labs,
        category: category,
        filter: publicFilter(category),
        badge: clean(arr(data.badges)[0] || category || ''),
        summary: clean(data.summary || data.tagline || parsed.summary || ''),
        verdict: clean(data.verdict || data.takeaway || ''),
        whyPicked: clean(data.whyPicked || data.why || data.reason || ''),
        bestFor: cleanTextList(data.bestFor || data.best_for || data.audience),
        caveat: clean(data.caveat || data.consider || data.warning || ''),
        material: clean(data.material || ''),
        useCase: clean(data.useCase || data.use_case || ''),
        geoContext: clean(data.geoContext || data.geo || data.locationContext || ''),
        brand: cleanFirst(data.brand),
        availability: clean(data.availability || ''),
        condition: clean(data.condition || data.itemCondition || ''),
        tags: tags,
        notes: notes,
        priceText: priceText,
        price: price > 0 ? price : 0,
        priceCurrency: priceCurrency,
        images: images.length ? images : [PLACEHOLDER_IMAGE],
        links: linksOut,
        contents: notes,
        published: dateLabel(text(entry.published)),
        updated: dateLabel(text(entry.updated)),
        datePublished: clean(data.datePublished || text(entry.published)),
        dateModified: clean(data.dateModified || text(entry.updated))
      };
    }
    function normalizeStaticProduct(item) {
      var raw = item && typeof item === 'object' ? item : {};
      var title = clean(raw.title || raw.name || '');
      var slug = slugify(raw.slug || raw.id || title || raw.storeUrl || raw.canonicalUrl || '');
      var category = clean(raw.category || '') || 'Lainnya';
      var images = arr(raw.images || raw.image).map(clean).filter(Boolean);
      var tags = cleanTextList(raw.tags);
      var notes = cleanTextList(raw.notes || raw.contents);
      var canonicalUrl = absoluteUrl(raw.canonicalUrl || raw.url || raw.storeUrl);
      var storeUrl = absoluteUrl(raw.storeUrl) || storeAbsoluteUrl(slug);
      var priceText = clean(raw.priceText || raw.priceLabel || raw.price || 'Rp—');
      var price = parsePriceValue(raw.price) || parsePriceValue(priceText);
      var datePublished = clean(raw.datePublished || '');
      var dateModified = clean(raw.dateModified || '');
      var links = {};

      MARKET.forEach(function (key) {
        links[key] = raw.links && raw.links[key] ? clean(raw.links[key]) : '';
      });

      return {
        id: clean(raw.id || slug || canonicalUrl || storeUrl),
        slug: slug,
        name: title,
        title: title,
        url: canonicalUrl || storeUrl,
        canonicalUrl: canonicalUrl || storeUrl,
        storeUrl: storeUrl,
        labels: arr(raw.labels).map(clean).filter(Boolean),
        category: category,
        filter: publicFilter(category),
        badge: clean(raw.badge || category),
        summary: clean(raw.summary || raw.verdict || ''),
        verdict: clean(raw.verdict || ''),
        whyPicked: clean(raw.whyPicked || ''),
        bestFor: cleanTextList(raw.bestFor),
        caveat: clean(raw.caveat || ''),
        material: clean(raw.material || ''),
        useCase: cleanFirst(raw.useCase),
        geoContext: cleanFirst(raw.geoContext),
        brand: cleanFirst(raw.brand),
        availability: clean(raw.availability || ''),
        condition: clean(raw.condition || ''),
        tags: tags,
        notes: notes,
        priceText: priceText,
        price: price > 0 ? price : 0,
        priceCurrency: detectPriceCurrency(priceText, raw.priceCurrency || raw.currency),
        images: images.length ? images : [PLACEHOLDER_IMAGE],
        links: links,
        contents: notes,
        published: dateLabel(datePublished),
        updated: dateLabel(dateModified),
        datePublished: datePublished,
        dateModified: dateModified
      };
    }
    function readStaticProducts() {
      var payload;
      var parsed;
      try {
        payload = staticProductsScript ? staticProductsScript.textContent : '';
        if (!clean(payload)) return [];
        parsed = JSON.parse(payload);
        return Array.isArray(parsed) ? parsed.map(normalizeStaticProduct).filter(function (item) { return !!(item && item.slug && item.title); }) : [];
      } catch (error) {
        return [];
      }
    }
    function hydrateStaticProducts(products) {
      if (!products.length) return false;
      state.products = products.slice();
      state.visibleLimit = initialVisibleLimit();
      state.hasLoadedMore = false;
      state.feedSource = 'static';
      empty.hidden = true;
      setSkeletonVisible(false);
      applyFilters();
      app.setAttribute('data-store-state', state.filtered.length ? 'ready' : 'empty');
      syncRequestedPreview();
      scheduleOverflowAudit('static-bootstrap');
      scheduleDebugVitalsReport('static-bootstrap');
      return true;
    }

    function feedUrl(kind) {
      return kind === 'legacy' ? app.getAttribute('data-store-legacy-feed-url') : app.getAttribute('data-store-feed-url');
    }
    function fetchFeed(kind) {
      return fetch(feedUrl(kind), { credentials: 'same-origin', cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('feed-' + kind);
        return res.json();
      }).then(function (payload) {
        var entries = payload && payload.feed && payload.feed.entry ? payload.feed.entry : [];
        if (!entries.length && kind !== 'legacy') throw new Error('empty-store-feed');
        state.feedSource = kind === 'legacy' ? 'legacy' : 'Store';
        return entries;
      });
    }
    function loadProducts() {
      var staticProducts = readStaticProducts();
      var hadStatic = hydrateStaticProducts(staticProducts);
      if (!hadStatic) {
        app.setAttribute('data-store-state', 'loading');
        setSkeletonVisible(true);
        setNodeText(count, copy('countLoading'));
        setNodeText(source, copy('feedStore'));
        empty.hidden = true;
      }
      fetchFeed('primary').catch(function () { return fetchFeed('legacy'); }).then(function (entries) {
        state.products = entries.map(normalize).filter(Boolean);
        state.visibleLimit = initialVisibleLimit();
        state.hasLoadedMore = false;
        applyFilters();
        syncRequestedPreview();
        scheduleOverflowAudit('feed-render');
        scheduleDebugVitalsReport('feed-render');
      }).catch(function () {
        if (hadStatic || state.products.length) {
          setSkeletonVisible(false);
          empty.hidden = !!state.filtered.length;
          app.setAttribute('data-store-state', state.filtered.length ? 'ready' : 'empty');
          updateCounts();
          scheduleOverflowAudit('feed-fallback-static');
          scheduleDebugVitalsReport('feed-fallback-static');
          return;
        }
        state.products = [];
        state.filtered = [];
        setSkeletonVisible(false);
        renderCards();
        renderSemanticProducts();
        applyDiscoveryFilters();
        updateCategoryContext();
        updateItemListJsonLd([]);
        app.setAttribute('data-store-state', 'error');
        setNodeText(emptyTitle, copy('curatedTitle'));
        setNodeText(emptyBody, copy('curatedBody'));
        setNodeText(count, copy('countFail'));
        setNodeText(source, copy('feedStore'));
        empty.hidden = false;
        scheduleOverflowAudit('feed-error');
        scheduleDebugVitalsReport('feed-error');
      });
    }

    function priceNumber(text) {
      var raw = lower(text).replace(/[^0-9,.k]/g, '');
      if (!raw) return 0;
      var isK = raw.indexOf('k') > -1;
      raw = raw.replace(/k/g, '').replace(/\./g, '').replace(/,/g, '.');
      var num = parseFloat(raw);
      if (!num) return 0;
      return isK ? num * 1000 : num;
    }
    function priceBandForPrice(value) {
      var amount = typeof value === 'number' ? value : parsePriceValue(value);
      if (!Number.isFinite(amount) || amount <= 0) return 'unknown';
      if (amount < 50000) return 'under-50k';
      if (amount < 100000) return '50k-100k';
      if (amount < 200000) return '100k-200k';
      if (amount < 500000) return '200k-500k';
      return 'over-500k';
    }
    function normalizeDiscoveryList(value) {
      return cleanTextList(value).map(slugify).filter(Boolean);
    }
    function validateStoreManifest(payload) {
      var items;
      var countValue;
      var required = ['slug', 'name', 'categoryKey', 'categoryLabel', 'url', 'storeUrl', 'image'];
      if (!payload || typeof payload !== 'object') throw new Error('manifest-shape');
      if (clean(payload.version) !== STORE_MANIFEST_VERSION) throw new Error('manifest-version');
      if (!Array.isArray(payload.items)) throw new Error('manifest-items');
      countValue = Number(payload.count);
      items = payload.items;
      if (!Number.isFinite(countValue) || countValue !== items.length) throw new Error('manifest-count');
      items.forEach(function (item, index) {
        required.forEach(function (field) {
          if (!clean(item && item[field])) throw new Error('manifest-item-' + index + '-' + field);
        });
      });
      return payload;
    }
    function loadStoreManifest() {
      if (storeManifestCache) return Promise.resolve(storeManifestCache);
      if (storeManifestPromise) return storeManifestPromise;
      if (!window.fetch) return Promise.reject(new Error('manifest-fetch-unavailable'));
      storeManifestPromise = fetch(STORE_MANIFEST_URL, { credentials: 'same-origin', cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('manifest-http-' + res.status);
        return res.json();
      }).then(function (payload) {
        storeManifestCache = validateStoreManifest(payload);
        return storeManifestCache;
      }).catch(function (error) {
        storeManifestPromise = null;
        throw error;
      });
      return storeManifestPromise;
    }
    function normalizeDiscoveryCategoryKey(value, label) {
      var key = lower(value);
      if (STORE_CATEGORY_CONFIG[key] && key !== 'all') return key;
      return publicFilter(label || value);
    }
    function normalizeManifestDiscoveryItem(raw) {
      var price = Number(raw && raw.price ? raw.price : 0);
      var categoryKey = normalizeDiscoveryCategoryKey(raw && raw.categoryKey, raw && raw.categoryLabel);
      var image = absoluteUrl(raw && raw.image) || clean(raw && raw.image) || PLACEHOLDER_IMAGE;
      var sort = raw && raw.sort && typeof raw.sort === 'object' ? raw.sort : {};
      var sortPrice = Number(sort.price || price || 0);
      if (!Number.isFinite(price)) price = parsePriceValue(raw && raw.priceText);
      if (!Number.isFinite(sortPrice)) sortPrice = price || 0;
      return {
        id: clean(raw && (raw.url || raw.storeUrl || raw.slug)),
        slug: slugify(raw && raw.slug),
        name: clean(raw && raw.name),
        title: clean(raw && raw.name),
        url: absoluteUrl(raw && raw.url),
        canonicalUrl: absoluteUrl(raw && raw.url),
        storeUrl: absoluteUrl(raw && raw.storeUrl) || storeAbsoluteUrl(slugify(raw && raw.slug)),
        labels: [],
        category: clean(raw && raw.categoryLabel) || categoryLocaleValue('title', categoryKey),
        categoryKey: categoryKey,
        filter: categoryKey,
        summary: clean(raw && raw.summary),
        priceText: clean(raw && raw.priceText) || 'Rp—',
        price: price > 0 ? price : 0,
        priceBand: DISCOVERY_PRICE_BANDS.indexOf(clean(raw && raw.priceBand)) > -1 ? clean(raw && raw.priceBand) : priceBandForPrice(price),
        images: [image],
        tags: normalizeDiscoveryList(raw && raw.tags).slice(0, 8),
        intent: normalizeDiscoveryList(raw && raw.intent).slice(0, 8),
        datePublished: clean(raw && raw.datePublished),
        dateModified: clean(raw && raw.dateModified),
        published: dateLabel((raw && raw.dateModified) || (raw && raw.datePublished)),
        updated: dateLabel(raw && raw.dateModified),
        sort: {
          name: searchText(sort.name || (raw && raw.name)),
          date: clean(sort.date || (raw && raw.dateModified) || (raw && raw.datePublished)),
          price: sortPrice > 0 ? sortPrice : price,
          score: Number(sort.score || 0) || 0
        }
      };
    }
    function fallbackIntentForItem(item) {
      var categoryKey = normalizeDiscoveryCategoryKey(item && item.filter, item && item.category);
      var hay = searchText([
        categoryKey,
        item && item.category,
        item && item.useCase,
        item && item.geoContext,
        cleanTextList(item && item.tags).join(' '),
        cleanTextList(item && item.bestFor).join(' ')
      ].join(' '));
      var values = [];
      if (categoryKey === 'fashion') values.push('daily');
      else if (categoryKey === 'skincare') values.push('skincare-routine');
      else if (categoryKey === 'workspace') values.push('workspace');
      else if (categoryKey === 'tech') values.push('portable');
      else values.push('daily');
      if (hay.indexOf('travel') > -1 || hay.indexOf('commute') > -1) values.push('travel');
      if (hay.indexOf('workwear') > -1 || hay.indexOf('office') > -1) values.push('workwear');
      if (hay.indexOf('wfh') > -1 || hay.indexOf('remote') > -1) values.push('wfh');
      if (hay.indexOf('hydration') > -1 || hay.indexOf('moistur') > -1) values.push('hydration');
      if (hay.indexOf('cable') > -1) values.push('cable-management');
      if (hay.indexOf('compact') > -1 || hay.indexOf('slim') > -1) values.push('compact');
      return values.filter(function (value, index) { return value && values.indexOf(value) === index; }).slice(0, 8);
    }
    function normalizeFallbackDiscoveryItem(item) {
      var categoryKey = normalizeDiscoveryCategoryKey(item && item.filter, item && item.category);
      var image = arr(item && item.images)[0] || PLACEHOLDER_IMAGE;
      var price = Number(item && item.price ? item.price : 0) || priceNumber(item && item.priceText);
      return {
        id: itemKey(item),
        slug: slugify(item && item.slug),
        name: displayProductTitle(item),
        title: displayProductTitle(item),
        url: canonicalProductUrl(item),
        canonicalUrl: canonicalProductUrl(item),
        storeUrl: productStoreAbsoluteUrl(item),
        labels: arr(item && item.labels).map(clean).filter(Boolean),
        category: clean(item && item.category) || categoryLocaleValue('title', categoryKey),
        categoryKey: categoryKey,
        filter: categoryKey,
        summary: previewSummaryText(item),
        priceText: clean(item && item.priceText) || 'Rp—',
        price: price > 0 ? price : 0,
        priceBand: priceBandForPrice(price),
        images: [image],
        tags: normalizeDiscoveryList(item && item.tags).slice(0, 8),
        intent: fallbackIntentForItem(item),
        datePublished: clean(item && item.datePublished),
        dateModified: clean(item && item.dateModified),
        published: clean(item && item.published),
        updated: clean(item && item.updated),
        sort: {
          name: searchText(displayProductTitle(item)),
          date: clean((item && item.dateModified) || (item && item.datePublished) || (item && item.updated) || (item && item.published)),
          price: price > 0 ? price : 0,
          score: 0
        },
        sourceProduct: item
      };
    }
    function fallbackDiscoveryItems() {
      return (state.products || []).map(normalizeFallbackDiscoveryItem).filter(function (item) {
        return !!(item && item.slug && item.title);
      });
    }
    function discoverySourceItems() {
      if (state.discoveryManifestState === 'ready') return state.discoveryItems;
      return fallbackDiscoveryItems();
    }
    function discoverySearchHaystack(item) {
      return searchText([
        item && (item.name || item.title),
        item && (item.categoryLabel || item.category),
        item && item.summary,
        cleanTextList(item && item.tags).join(' '),
        cleanTextList(item && item.intent).join(' '),
        item && item.priceText
      ].join(' '));
    }
    function discoveryDateValue(item) {
      var raw = clean(item && item.sort && item.sort.date) || clean(item && item.dateModified) || clean(item && item.datePublished);
      var parsed = raw ? Date.parse(raw) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    }
    function discoveryNameValue(item) {
      return searchText((item && item.sort && item.sort.name) || (item && (item.name || item.title)) || '');
    }
    function discoveryPriceValue(item) {
      var value = Number(item && item.sort && item.sort.price ? item.sort.price : item && item.price);
      return Number.isFinite(value) && value > 0 ? value : 0;
    }
    function discoveryRecommendedCompare(a, b) {
      var scoreDiff = (Number(b && b.sort && b.sort.score) || 0) - (Number(a && a.sort && a.sort.score) || 0);
      if (scoreDiff) return scoreDiff;
      return discoveryDateValue(b) - discoveryDateValue(a) || discoveryNameValue(a).localeCompare(discoveryNameValue(b));
    }
    function sortDiscoveryItems(items) {
      var sort = DISCOVERY_SORTS.indexOf(state.discoverySort) > -1 ? state.discoverySort : 'recommended';
      var rows = (items || []).slice();
      if (sort === 'newest') return rows.sort(function (a, b) {
        return discoveryDateValue(b) - discoveryDateValue(a) || discoveryNameValue(a).localeCompare(discoveryNameValue(b));
      });
      if (sort === 'price-asc') return rows.sort(function (a, b) {
        var ap = discoveryPriceValue(a) || Number.POSITIVE_INFINITY;
        var bp = discoveryPriceValue(b) || Number.POSITIVE_INFINITY;
        return ap - bp || discoveryNameValue(a).localeCompare(discoveryNameValue(b));
      });
      if (sort === 'price-desc') return rows.sort(function (a, b) {
        return discoveryPriceValue(b) - discoveryPriceValue(a) || discoveryNameValue(a).localeCompare(discoveryNameValue(b));
      });
      if (sort === 'az') return rows.sort(function (a, b) {
        return discoveryNameValue(a).localeCompare(discoveryNameValue(b));
      });
      return rows.sort(discoveryRecommendedCompare);
    }
    function matchDiscoveryIntent(item, intent) {
      var normalized = slugify(intent);
      var intents = normalizeDiscoveryList(item && item.intent);
      if (!normalized) return true;
      if (normalized === 'featured') return (Number(item && item.sort && item.sort.score) || 0) > 0 || discoverySearchHaystack(item).indexOf('pilihan') > -1;
      if (normalized === 'latest') return true;
      if (normalized === 'under500') return discoveryPriceValue(item) > 0 && discoveryPriceValue(item) <= 500000;
      return intents.indexOf(normalized) > -1;
    }
    function applyDiscoveryFilters() {
      var q = searchText(state.query);
      var priceFilter = DISCOVERY_PRICE_BANDS.indexOf(state.discoveryPrice) > -1 ? state.discoveryPrice : 'all';
      state.discoveryFiltered = discoverySourceItems().filter(function (item) {
        var categoryKey = normalizeDiscoveryCategoryKey(item && (item.categoryKey || item.filter), item && item.category);
        var matchesQuery = !q || discoverySearchHaystack(item).indexOf(q) !== -1;
        var matchesFilter = state.filter === 'all' || categoryKey === state.filter;
        var matchesPrice = priceFilter === 'all' || clean(item && item.priceBand) === priceFilter;
        var matchesIntent = matchDiscoveryIntent(item, state.intent);
        return matchesQuery && matchesFilter && matchesPrice && matchesIntent;
      });
      state.discoveryFiltered = sortDiscoveryItems(state.discoveryFiltered);
      renderDiscoveryResults();
      updateDiscoveryCounts();
      updateChipState();
    }
    function updateDiscoveryCounts() {
      var unit = productUnit();
      var active = state.query || state.filter !== 'all' || state.intent || state.discoveryPrice !== 'all' || state.discoverySort !== 'recommended';
      if (!discoveryStatus) return;
      if (state.discoveryManifestState === 'loading' && !state.discoveryFiltered.length) {
        setNodeText(discoveryStatus, copy('countLoading'));
        return;
      }
      setNodeText(discoveryStatus, active ? (state.discoveryFiltered.length + ' ' + unit) : copy('allVisible'));
    }
    function ensureDiscoveryManifest() {
      if (state.discoveryManifestState === 'ready' || state.discoveryManifestState === 'loading' || state.discoveryManifestState === 'fallback') return;
      state.discoveryManifestState = 'loading';
      applyDiscoveryFilters();
      loadStoreManifest().then(function (manifest) {
        state.discoveryItems = manifest.items.map(normalizeManifestDiscoveryItem).filter(function (item) {
          return !!(item && item.slug && item.title);
        });
        state.discoveryManifestState = 'ready';
        applyDiscoveryFilters();
      }).catch(function () {
        state.discoveryItems = [];
        state.discoveryManifestState = 'fallback';
        applyDiscoveryFilters();
      });
    }
    function matchIntent(item, intent) {
      var hay = productSearchHaystack(item);
      if (intent === 'featured') return hay.indexOf('featured') > -1 || hay.indexOf('curated') > -1 || hay.indexOf('pilihan') > -1;
      if (intent === 'under500') return priceNumber(item.priceText) > 0 && priceNumber(item.priceText) <= 500000;
      if (intent === 'latest') return true;
      return true;
    }
    function applyFilters() {
      var q = lower(state.query);
      state.filtered = state.products.filter(function (item) {
        var hay = productSearchHaystack(item);
        var matchesQuery = !q || hay.indexOf(q) !== -1;
        var matchesFilter = state.filter === 'all' || item.filter === state.filter || lower(item.category) === state.filter;
        var matchesIntent = !state.intent || matchIntent(item, state.intent);
        return matchesQuery && matchesFilter && matchesIntent;
      });
      if (state.intent === 'latest') state.filtered = state.filtered.slice().sort(function (a, b) { return String(b.published || '').localeCompare(String(a.published || '')); });
      else state.filtered = prioritizeConfiguredLcpProduct(state.filtered);
      renderCards();
      renderSemanticProducts();
      applyDiscoveryFilters();
      renderSavedResults();
      updateCategoryContext();
      updateItemListJsonLd(state.filtered);
      app.setAttribute('data-store-state', state.filtered.length ? 'ready' : 'empty');
      empty.hidden = !!state.filtered.length;
      if (!state.filtered.length) {
        setNodeText(emptyTitle, copy('emptyTitle'));
        setNodeText(emptyBody, copy('emptyBody'));
      }
      updateChipState();
      updateCounts();
    }
    function updateCounts() {
      var unit = productUnit();
      var filterCountLabel = state.filtered.length + ' ' + unit;
      updateFilterPeek(filterCountLabel);
      if (!count || !source) return;
      if (app.getAttribute('data-store-state') === 'loading') { setNodeText(count, copy('countLoading')); return; }
      setNodeText(count, state.filtered.length + ' ' + unit);
      setNodeText(source, state.query || state.filter !== 'all' ? copy('filterActive') : (state.feedSource === 'legacy' ? copy('feedLegacy') : (state.feedSource === 'static' ? copy('feedStatic') : copy('feedStore'))));
      updateDiscoveryCounts();
    }
    function updateChipState() {
      filterButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-store-filter') === state.filter ? 'true' : 'false');
      });
      quickIntentButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', slugify(button.getAttribute('data-store-intent')) === slugify(state.intent) ? 'true' : 'false');
      });
      priceBandButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-store-price-band') === state.discoveryPrice ? 'true' : 'false');
      });
      sortButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-store-sort') === state.discoverySort ? 'true' : 'false');
      });
    }
    function titleCase(value) {
      value = clean(value || 'All');
      return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All';
    }
    function renderCardDots(node, total) {
      if (!node) return;
      if (!total || total < 2) {
        node.hidden = true;
        node.replaceChildren();
        return;
      }
      var fragment = document.createDocumentFragment();
      var dotIndex;
      for (dotIndex = 0; dotIndex < total; dotIndex += 1) {
        var dot = cloneTemplate('store-card-dot-template');
        if (dotIndex === 0) dot.classList.add('is-active');
        fragment.appendChild(dot);
      }
      node.hidden = false;
      node.replaceChildren(fragment);
    }
    function setCardImagePriority(img, index) {
      var loading = index === 0 ? 'eager' : 'lazy';
      var fetchPriority = index === 0 ? 'high' : 'auto';
      if (!img) return;
      img.loading = loading;
      img.setAttribute('loading', loading);
      if ('fetchPriority' in img) img.fetchPriority = fetchPriority;
      img.setAttribute('fetchpriority', fetchPriority);
      img.decoding = 'async';
    }
    function renderCardNode(item, index) {
      var node = cloneTemplate('store-card-template');
      var button = node.querySelector('[data-store-open-preview]');
      var img = node.querySelector('img');
      var badge = node.querySelector('[data-store-card-badge]');
      var price = node.querySelector('[data-store-card-price]');
      var title = node.querySelector('[data-store-card-title]');
      var dots = node.querySelector('[data-store-card-dots]');
      var displayTitle = displayProductTitle(item);

      node.dataset.storeCardIndex = String(index);
      node.dataset.storeProductId = item.slug || item.id || '';
      button.dataset.storeOpenPreview = String(index);
      button.dataset.storeProductSlug = item.slug || '';
      button.href = canonicalProductUrl(item) || productStoreAbsoluteUrl(item);
      button.setAttribute('aria-label', copy('previewProductLabel') + ': ' + displayTitle);

      img.src = item.images[0] || PLACEHOLDER_IMAGE;
      img.alt = displayTitle;
      img.width = 900;
      img.height = 1125;
      setCardImagePriority(img, index);

      badge.textContent = displayProductBadge(item);
      price.textContent = item.priceText || 'Rp—';
      title.textContent = displayTitle;

      renderCardDots(dots, item.images.length);
      return node;
    }
    function renderResultRowNode(item, index, action) {
      var node = cloneTemplate('store-result-row-template');
      var img = node.querySelector('img');
      var title = node.querySelector('[data-store-result-title]');
      var meta = node.querySelector('[data-store-result-meta]');
      var displayTitle = displayProductTitle(item);

      node.dataset.storeResultIndex = String(index);
      if (action) node.setAttribute('data-store-result-action', action);
      node.setAttribute('aria-label', copy('previewProductLabel') + ': ' + displayTitle);
      img.src = item.images[0] || PLACEHOLDER_IMAGE;
      img.alt = displayTitle;
      title.textContent = displayTitle;
      meta.textContent = [item.category, item.priceText, action === 'preview' ? item.summary : ''].filter(Boolean).join(' · ');

      return node;
    }
    function renderSavedRowNode(item, index) {
      var node = cloneTemplate('store-saved-row-template');
      var row = node.querySelector('[data-store-result-index]');
      var img = node.querySelector('img');
      var title = node.querySelector('[data-store-result-title]');
      var meta = node.querySelector('[data-store-result-meta]');
      var removeButton = node.querySelector('[data-store-remove-saved]');
      var displayTitle = displayProductTitle(item);

      row.dataset.storeResultIndex = String(index);
      row.setAttribute('data-store-result-action', 'saved-preview');
      row.setAttribute('aria-label', copy('previewProductLabel') + ': ' + displayTitle);
      img.src = item.images[0] || PLACEHOLDER_IMAGE;
      img.alt = displayTitle;
      title.textContent = displayTitle;
      meta.textContent = [item.category, item.priceText].filter(Boolean).join(' · ');
      removeButton.dataset.storeRemoveSaved = String(index);
      removeButton.setAttribute('aria-label', copy('removeSavedLabel') + ': ' + displayTitle);

      return node;
    }
    function renderEmptyRowNode(message) {
      var node = cloneTemplate('store-empty-row-template');
      node.textContent = message;
      return node;
    }
    function renderDiscoveryResults() {
      if (!discoveryResults) return;
      var rows = state.discoveryFiltered.slice(0, 8);
      var fragment = document.createDocumentFragment();
      if (rows.length) {
        rows.forEach(function (item, index) {
          fragment.appendChild(renderResultRowNode(item, index, 'preview'));
        });
      } else {
        fragment.appendChild(renderEmptyRowNode(copy('emptyTitle')));
      }
      discoveryResults.replaceChildren(fragment);
    }
    function renderSavedResults() {
      if (!savedResults) return;
      var savedItems = (state.products || []).filter(function (item) { return isSaved(item); });
      var fragment = document.createDocumentFragment();
      if (savedItems.length) {
        savedItems.forEach(function (item) {
          fragment.appendChild(renderSavedRowNode(item, state.products.indexOf(item)));
        });
      } else {
        fragment.appendChild(renderEmptyRowNode(savedEmptyLabel()));
      }
      savedResults.replaceChildren(fragment);
    }
    function toggleSemanticFact(node, valueNode, value) {
      if (!node || !valueNode) return;
      if (clean(value)) {
        node.hidden = false;
        valueNode.textContent = clean(value);
      } else {
        node.hidden = true;
        valueNode.textContent = '';
      }
    }
    function semanticShortlistBadge(index) {
      var keys = ['semanticShortlistBadgeOne', 'semanticShortlistBadgeTwo', 'semanticShortlistBadgeThree'];
      return copy(keys[index] || 'semanticShortlistBadgeOne');
    }
    function semanticCategoryKey(item) {
      var fromFilter = clean(item && item.filter).toLowerCase();
      var fromCategory = lower(item && item.category);
      if (fromFilter && STORE_CATEGORY_CONFIG[fromFilter] && fromFilter !== 'all') return fromFilter;
      if (fromCategory && STORE_CATEGORY_CONFIG[fromCategory] && fromCategory !== 'all') return fromCategory;
      return publicFilter(item && item.category);
    }
    function semanticCategoryTitle(key) {
      return categoryLocaleValue('title', key) || copy(filterCopyKey(key));
    }
    function semanticCategoryDescription(key) {
      return categoryLocaleValue('description', key) || copy('semanticBrowseLead');
    }
    function semanticCategoryIcon(key) {
      return STORE_FILTER_ICON_MAP[key] || STORE_FILTER_ICON_MAP.everyday || 'category';
    }
    function renderSemanticProductNode(item) {
      var node = cloneTemplate('store-semantic-product-template');
      var categoryNode = node.querySelector('[data-store-semantic-category]');
      var titleNode = node.querySelector('[data-store-semantic-title]');
      var summaryNode = node.querySelector('[data-store-semantic-summary]');
      var whyNode = node.querySelector('[data-store-semantic-why]');
      var whyValue = node.querySelector('[data-store-semantic-why-value]');
      var bestForNode = node.querySelector('[data-store-semantic-best-for]');
      var bestForValue = node.querySelector('[data-store-semantic-best-for-value]');
      var caveatNode = node.querySelector('[data-store-semantic-caveat]');
      var caveatValue = node.querySelector('[data-store-semantic-caveat-value]');
      var tagsNode = node.querySelector('[data-store-semantic-tags]');
      var detailLink = node.querySelector('[data-store-semantic-detail-link]');
      var storeLink = node.querySelector('[data-store-semantic-store-link]');
      var tags = semanticTags(item);

      setScopedCopy(node);
      setNodeText(categoryNode, item.category || semanticCategoryTitle(semanticCategoryKey(item)) || currentFilterLabel());
      setNodeText(titleNode, displayProductTitle(item));
      setNodeText(summaryNode, semanticSummaryText(item));
      toggleSemanticFact(whyNode, whyValue, item.whyPicked);
      toggleSemanticFact(bestForNode, bestForValue, semanticBestForText(item));
      toggleSemanticFact(caveatNode, caveatValue, item.caveat);

      if (detailLink) detailLink.href = canonicalProductUrl(item) || STORE_CANONICAL_PATH;
      if (storeLink) {
        storeLink.href = productStoreUrl(item);
        storeLink.setAttribute('data-store-open-slug', item.slug || '');
      }
      if (tagsNode) {
        tagsNode.replaceChildren();
        if (tags.length) {
          tagsNode.hidden = false;
          tags.forEach(function (tag) {
            var tagNode = cloneTemplate('store-semantic-tag-template');
            tagNode.textContent = tag;
            tagsNode.appendChild(tagNode);
          });
        } else tagsNode.hidden = true;
      }
      return node;
    }
    function renderSemanticShortlist(items) {
      var fragment = document.createDocumentFragment();
      if (!semanticShortlist) return;
      items.slice(0, 3).forEach(function (item, index) {
        var node = cloneTemplate('store-semantic-shortlist-template');
        var badge = node.querySelector('[data-store-semantic-shortlist-badge]');
        var title = node.querySelector('[data-store-semantic-shortlist-title]');
        var reason = node.querySelector('[data-store-semantic-shortlist-reason]');
        var link = node.querySelector('[data-store-semantic-shortlist-link]');
        setScopedCopy(node);
        setNodeText(badge, semanticShortlistBadge(index));
        setNodeText(title, displayProductTitle(item));
        setNodeText(reason, clean(item && item.whyPicked) || semanticSummaryText(item));
        if (link) {
          link.href = productStoreUrl(item);
          link.setAttribute('data-store-open-slug', item.slug || '');
        }
        fragment.appendChild(node);
      });
      semanticShortlist.replaceChildren(fragment);
    }
    function semanticPanelId(key) {
      return 'store-semantic-panel-' + clean(key || 'category').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    }
    function semanticChipId(key) {
      return 'store-semantic-chip-' + clean(key || 'category').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    }
    function syncSemanticRailActive(activeKey) {
      if (!semanticRail) return;
      [].slice.call(semanticRail.querySelectorAll('[data-store-semantic-category]')).forEach(function (button) {
        var selected = button.getAttribute('data-store-semantic-category') === activeKey;
        button.setAttribute('aria-selected', selected ? 'true' : 'false');
        if (selected && button.scrollIntoView) button.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
    }
    function setSemanticCategory(key) {
      if (!key) return;
      state.semanticCategory = key;
      if (semanticList) {
        [].slice.call(semanticList.querySelectorAll('[data-store-semantic-panel]')).forEach(function (panel) {
          var active = panel.getAttribute('data-store-semantic-panel') === key;
          panel.open = active;
          panel.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
      }
      syncSemanticRailActive(key);
    }
    function renderSemanticRail(order, groups, activeKey) {
      var fragment = document.createDocumentFragment();
      if (!semanticRail) return;
      order.forEach(function (key) {
        var button = document.createElement('button');
        var icon = document.createElement('span');
        var label = document.createElement('span');
        var count = document.createElement('span');
        var selected = key === activeKey;
        button.type = 'button';
        button.className = 'store-semantic-category-chip';
        button.id = semanticChipId(key);
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', selected ? 'true' : 'false');
        button.setAttribute('aria-controls', semanticPanelId(key));
        button.setAttribute('data-store-semantic-category', key);
        icon.className = 'gg-icon store-semantic-category-chip__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = semanticCategoryIcon(key);
        label.textContent = semanticCategoryTitle(key);
        count.className = 'store-semantic-category-chip__count';
        count.textContent = String((groups[key] || []).length);
        button.appendChild(icon);
        button.appendChild(label);
        button.appendChild(count);
        fragment.appendChild(button);
      });
      semanticRail.replaceChildren(fragment);
    }
    function renderSemanticMoreButton(extraCount) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'store-button store-semantic-more';
      button.setAttribute('data-store-semantic-more', String(extraCount));
      button.textContent = copy('semanticMoreLabel').replace('{count}', String(extraCount));
      return button;
    }
    function renderSemanticProducts() {
      var items = state.filtered.slice();
      var fragment = document.createDocumentFragment();
      var groups = {};
      var order = [];
      var activeKey;
      if (!semanticList) return;
      renderSemanticShortlist(items);
      if (!items.length) {
        if (semanticRail) semanticRail.replaceChildren();
        var emptyNode = cloneTemplate('store-semantic-empty-template');
        setScopedCopy(emptyNode);
        emptyNode.textContent = copy('semanticEmptyLabel');
        fragment.appendChild(emptyNode);
        semanticList.replaceChildren(fragment);
        return;
      }
      items.forEach(function (item) {
        var key = semanticCategoryKey(item);
        if (!groups[key]) {
          groups[key] = [];
          order.push(key);
        }
        groups[key].push(item);
      });
      activeKey = state.semanticCategory && groups[state.semanticCategory] ? state.semanticCategory : order[0];
      state.semanticCategory = activeKey;
      renderSemanticRail(order, groups, activeKey);
      order.forEach(function (key) {
        var group = cloneTemplate('store-semantic-group-template');
        var icon = group.querySelector('[data-store-semantic-group-icon]');
        var title = group.querySelector('[data-store-semantic-group-title]');
        var description = group.querySelector('[data-store-semantic-group-description]');
        var countNode = group.querySelector('[data-store-semantic-group-count]');
        var body = group.querySelector('[data-store-semantic-group-body]');
        var groupItems = groups[key] || [];
        var active = key === activeKey;
        setScopedCopy(group);
        group.id = semanticPanelId(key);
        group.setAttribute('data-store-semantic-panel', key);
        group.setAttribute('role', 'tabpanel');
        group.setAttribute('aria-labelledby', semanticChipId(key));
        group.setAttribute('aria-hidden', active ? 'false' : 'true');
        group.open = active;
        setNodeText(icon, semanticCategoryIcon(key));
        setNodeText(title, semanticCategoryTitle(key));
        setNodeText(description, semanticCategoryDescription(key));
        setNodeText(countNode, groupItems.length + ' ' + productUnit());
        groupItems.forEach(function (item) {
          if (body) body.appendChild(renderSemanticProductNode(item));
        });
        if (body && groupItems.length > 3) body.appendChild(renderSemanticMoreButton(groupItems.length - 3));
        fragment.appendChild(group);
      });
      semanticList.replaceChildren(fragment);
      syncSemanticRailActive(activeKey);
    }

    function renderCards() {
      if (!grid) return;
      var visible = state.filtered.slice(0, state.visibleLimit);
      var fragment = document.createDocumentFragment();
      setSkeletonVisible(false);
      visible.forEach(function (item, index) {
        fragment.appendChild(renderCardNode(item, index));
      });
      grid.replaceChildren(fragment);
      if (loadMore) loadMore.hidden = state.filtered.length <= state.visibleLimit;
      scheduleOverflowAudit('cards-render');
      scheduleDebugVitalsReport('cards-render');
    }

    function activeItem(index) { return state.filtered[index]; }
    function previewImageCount() {
      var item = state.currentPreviewItem;
      return item && item.images && item.images.length ? item.images.length : 0;
    }
    function syncPreviewDots() {
      if (!preview.dots) return;
      [].slice.call(preview.dots.querySelectorAll('[data-store-preview-dot]')).forEach(function (button, index) {
        button.setAttribute('aria-pressed', index === state.currentPreviewImageIndex ? 'true' : 'false');
      });
    }
    function renderPreviewDots(total) {
      if (!preview.dots) return;
      if (!total || total < 2) {
        preview.dots.hidden = true;
        preview.dots.replaceChildren();
        return;
      }
      var fragment = document.createDocumentFragment();
      var index;
      var button;
      preview.dots.hidden = false;
      for (index = 0; index < total; index += 1) {
        button = cloneTemplate('store-preview-dot-template');
        button.dataset.storePreviewDot = String(index);
        button.setAttribute('aria-label', previewImageActionLabel(index));
        button.setAttribute('aria-pressed', index === state.currentPreviewImageIndex ? 'true' : 'false');
        fragment.appendChild(button);
      }
      preview.dots.replaceChildren(fragment);
    }
    function renderPreviewSlides(images, title) {
      if (!preview.carousel) return;
      var fragment = document.createDocumentFragment();
      images.forEach(function (src) {
        var slide = cloneTemplate('store-preview-slide-template');
        var img = slide.querySelector('img');
        img.src = src;
        img.alt = title || '';
        fragment.appendChild(slide);
      });
      preview.carousel.replaceChildren(fragment);
    }
    function renderPreviewNotes(noteList) {
      if (!preview.notes || !preview.notesList) return;
      if (!noteList.length) {
        preview.notes.hidden = true;
        preview.notesList.replaceChildren();
        return;
      }
      var fragment = document.createDocumentFragment();
      noteList.forEach(function (note) {
        var node = cloneTemplate('store-preview-note-template');
        node.textContent = note;
        fragment.appendChild(node);
      });
      preview.notes.hidden = false;
      preview.notesList.replaceChildren(fragment);
    }
    function syncPreviewImageIndexFromScroll() {
      if (!preview.carousel) return;
      var total = previewImageCount();
      if (total < 2) {
        state.currentPreviewImageIndex = 0;
        syncPreviewDots();
        return;
      }
      var width = preview.carousel.clientWidth || preview.carousel.getBoundingClientRect().width || 1;
      var nextIndex = clamp(Math.round(preview.carousel.scrollLeft / width), 0, total - 1);
      if (nextIndex !== state.currentPreviewImageIndex) {
        state.currentPreviewImageIndex = nextIndex;
        syncPreviewDots();
      }
    }
    function schedulePreviewImageSync() {
      if (state.previewDotSyncFrame) return;
      state.previewDotSyncFrame = window.requestAnimationFrame(function () {
        state.previewDotSyncFrame = 0;
        syncPreviewImageIndexFromScroll();
      });
      clearPreviewScrollSettleTimer();
      state.previewScrollSettleTimer = window.setTimeout(function () {
        state.previewScrollSettleTimer = 0;
        settlePreviewCarousel();
      }, 120);
    }
    function goToPreviewImage(index, behavior) {
      if (!preview.carousel) return;
      var total = previewImageCount();
      if (!total) return;
      var nextIndex = clamp(index, 0, total - 1);
      var left = (preview.carousel.clientWidth || preview.carousel.getBoundingClientRect().width || 0) * nextIndex;
      state.currentPreviewImageIndex = nextIndex;
      syncPreviewDots();
      if (typeof preview.carousel.scrollTo === 'function') preview.carousel.scrollTo({ left: left, behavior: behavior || smoothBehavior() });
      else preview.carousel.scrollLeft = left;
    }
    function resetPreviewCarousel() {
      if (!preview.carousel) return;
      state.currentPreviewImageIndex = 0;
      syncPreviewDots();
      if (typeof preview.carousel.scrollTo === 'function') preview.carousel.scrollTo({ left: 0, behavior: 'auto' });
      else preview.carousel.scrollLeft = 0;
    }
    function copyLinksText(item) {
      var lines = [displayProductTitle(item), copy('copyLinksAttribution')];
      if (item && item.slug) lines.push('', 'Store:', productStoreAbsoluteUrl(item));
      [
        ['shopee', 'Shopee'],
        ['tokopedia', 'Tokopedia'],
        ['tiktok', 'TikTok']
      ].forEach(function (entry) {
        var href = item && item.links ? clean(item.links[entry[0]]) : '';
        if (!href) return;
        lines.push('', entry[1] + ':', href);
      });
      return lines.join('\n');
    }
    function fallbackCopyText(value) {
      if (!copyBuffer) return false;
      copyBuffer.value = value;
      copyBuffer.select();
      copyBuffer.setSelectionRange(0, copyBuffer.value.length);
      try { return document.execCommand('copy'); } catch (error) { return false; }
      finally { copyBuffer.value = ''; }
    }
    function writeClipboardText(value) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') return navigator.clipboard.writeText(value);
      return fallbackCopyText(value) ? Promise.resolve() : Promise.reject(new Error('clipboard-unavailable'));
    }
    function clearPreviewScrollSettleTimer() {
      if (!state.previewScrollSettleTimer) return;
      window.clearTimeout(state.previewScrollSettleTimer);
      state.previewScrollSettleTimer = 0;
    }
    function settlePreviewCarousel() {
      clearPreviewScrollSettleTimer();
      if (previewImageCount() < 2) return;
      goToPreviewImage(state.currentPreviewImageIndex, smoothBehavior());
    }
    function showCopyFeedback() {
      clearCopyFeedbackTimer();
      setPreviewCopyState('copied');
      showToast(copy('copyToast'), 'preview');
      state.copyFeedbackTimer = window.setTimeout(function () {
        state.copyFeedbackTimer = 0;
        setPreviewCopyState('idle');
      }, 1600);
    }
    function fillPreview(item) {
      if (!item) return;
      var images = item.images && item.images.length ? item.images : [PLACEHOLDER_IMAGE];
      renderPreviewSlides(images, displayProductTitle(item));
      state.currentPreviewItem = item;
      state.currentPreviewImageIndex = 0;
      clearCopyFeedbackTimer();
      setPreviewCopyState('idle');
      renderPreviewDots(images.length);
      setNodeText(preview.category, item.category || copy('storeLabel'));
      setNodeText(preview.title, displayProductTitle(item));
      setNodeText(preview.meta, previewMetaText(item));
      setNodeText(preview.price, item.priceText || 'Rp—');
      setNodeText(preview.summary, previewVerdictText(item));
      togglePreviewFact(preview.whyPicked, preview.whyPickedValue, item.whyPicked);
      togglePreviewFact(preview.caveat, preview.caveatValue, item.caveat);
      state.currentProductKey = itemKey(item);
      if (preview.save) setPreviewSaveState(isSaved(item));
      ['shopee', 'tokopedia', 'tiktok'].forEach(function (key) {
        var link = preview.links[key];
        var href = item.links && item.links[key];
        if (!link) return;
        link.href = href || '#';
        link.setAttribute('aria-label', marketplaceAriaLabel(key, item));
        link.setAttribute('aria-disabled', href ? 'false' : 'true');
        link.hidden = !href;
      });
      var noteList = item.contents && item.contents.length ? item.contents : [];
      renderPreviewNotes(noteList);
      clearToastTimer();
      hideAllToasts();
      window.requestAnimationFrame(resetPreviewCarousel);
    }
    function syncRequestedPreview() {
      var slug = requestedItemSlug();
      var item = findItemBySlug(slug);
      if (!slug || !item) return;
      if (state.panelActive === 'preview' && state.currentPreviewItem && slugify(state.currentPreviewItem.slug) === slug) {
        syncPreviewUrl(item);
        return;
      }
      openPreviewItem(item, document.querySelector('[data-store-open-slug="' + slug + '"]') || document.querySelector('[data-store-open-preview="' + state.filtered.indexOf(item) + '"]'));
    }
    function refreshPreviewLocale() {
      if (!state.currentPreviewItem) return;
      var item = state.currentPreviewItem;
      var noteList = item.contents && item.contents.length ? item.contents : [];
      setNodeText(preview.category, item.category || copy('storeLabel'));
      setNodeText(preview.title, displayProductTitle(item));
      setNodeText(preview.meta, previewMetaText(item));
      setNodeText(preview.price, item.priceText || 'Rp—');
      setNodeText(preview.summary, previewVerdictText(item));
      togglePreviewFact(preview.whyPicked, preview.whyPickedValue, item.whyPicked);
      togglePreviewFact(preview.caveat, preview.caveatValue, item.caveat);
      setPreviewSaveState(isSaved(item));
      setPreviewCopyState(preview.copy && preview.copy.getAttribute('data-copy-state') === 'copied' ? 'copied' : 'idle');
      ['shopee', 'tokopedia', 'tiktok'].forEach(function (key) {
        var link = preview.links[key];
        if (!link) return;
        link.setAttribute('aria-label', marketplaceAriaLabel(key, item));
      });
      renderPreviewNotes(noteList);
      [].slice.call(preview.dots.querySelectorAll('[data-store-preview-dot]')).forEach(function (button, index) {
        button.setAttribute('aria-label', previewImageActionLabel(index));
      });
    }
    function refreshLocaleUI() {
      setCopy();
      renderCards();
      renderSemanticProducts();
      renderDiscoveryResults();
      renderSavedResults();
      updateCounts();
      updateChipState();
      updateFilterPeek();
      updateCategoryContext();
      updateItemListJsonLd(state.filtered);
      refreshPreviewLocale();
    }

    function getPanel(name) {
      if (name === 'preview') return { sheet: previewSheet, panel: previewPanel };
      if (name === 'discovery') return { sheet: discoverySheet, panel: discoveryPanel };
      if (name === 'saved') return { sheet: savedSheet, panel: savedPanel };
      if (name === 'more') return { sheet: moreSheet, panel: morePanel };
      return null;
    }
    function focusable(panel) {
      return [].slice.call(panel.querySelectorAll('a[href]:not([aria-disabled="true"]):not([hidden]), button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"]):not([hidden])')).filter(function (el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      });
    }
    function openPanel(name, trigger, options) {
      var config = getPanel(name);
      if (!config || !config.sheet || !config.panel) return;
      if (state.panelActive && state.panelActive !== name) closePanel(state.panelActive, { restoreFocus: false });
      clearToastTimer();
      hideAllToasts();
      state.panelActive = name;
      state.lastFocus = trigger || document.activeElement;
      config.sheet.hidden = false;
      config.sheet.removeAttribute('inert');
      config.sheet.setAttribute('aria-hidden', 'false');
      config.sheet.setAttribute('data-gg-state', 'opening');
      document.body.setAttribute('data-gg-active-panel', name);
      document.body.setAttribute('data-gg-panel-active', 'true');
      document.body.setAttribute('data-gg-scroll-lock', 'true');
      document.body.setAttribute('data-gg-dock-state', 'panel-locked');
      setPanelEnvironment(true);
      window.requestAnimationFrame(function () {
        config.sheet.setAttribute('data-gg-state', 'open');
        var target = options && options.focusTarget ? options.focusTarget : (focusable(config.panel)[0] || config.panel);
        try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
        if (options && options.selectText && target.select) target.select();
      });
    }
    function closePanel(name, options) {
      var panelName = name || state.panelActive;
      var config = getPanel(panelName);
      if (!config || !config.sheet) return;
      config.sheet.setAttribute('data-gg-state', 'closed');
      config.sheet.setAttribute('aria-hidden', 'true');
      config.sheet.setAttribute('inert', '');
      config.sheet.hidden = true;
      if (!name || state.panelActive === name) state.panelActive = '';
      document.body.setAttribute('data-gg-active-panel', '');
      document.body.setAttribute('data-gg-panel-active', 'false');
      document.body.setAttribute('data-gg-scroll-lock', 'false');
      clearPreviewScrollSettleTimer();
      clearToastTimer();
      hideAllToasts();
      if (panelName === 'preview') clearPreviewUrl();
      setPanelEnvironment(false);
      syncDockState(true);
      if (!options || options.restoreFocus !== false) restoreFocus();
    }
    function restoreFocus() {
      var node = state.lastFocus;
      state.lastFocus = null;
      if (node && typeof node.focus === 'function') {
        try { node.focus({ preventScroll: true }); } catch (error) { node.focus(); }
      }
    }
    function trapFocus(event) {
      if (event.key !== 'Tab' || !state.panelActive) return;
      var config = getPanel(state.panelActive);
      if (!config || !config.panel) return;
      var nodes = focusable(config.panel);
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function openDiscovery(trigger) {
      if (discoverySearch) discoverySearch.value = state.query;
      applyDiscoveryFilters();
      openPanel('discovery', trigger, { focusTarget: discoverySearch, selectText: true });
      ensureDiscoveryManifest();
    }
    function scrollToStoreTarget(targetId, nextUrl) {
      var target = document.getElementById(targetId) || document.getElementById('store-grid');
      var run = function () {
        if (target) target.scrollIntoView({ behavior: smoothBehavior(), block: 'start' });
        try { history.replaceState(null, '', nextUrl); } catch (error) {}
      };
      if (state.panelActive) {
        closePanel(state.panelActive, { restoreFocus: false });
        window.setTimeout(run, 40);
      } else run();
    }
    function scrollToStoreTop() {
      scrollToStoreTarget('store-top', '/store');
    }
    function syncResponsiveVisibleLimit() {
      var next = initialVisibleLimit();
      if (state.hasLoadedMore || app.getAttribute('data-store-state') === 'loading') return;
      if (state.visibleLimit === next) return;
      state.visibleLimit = next;
      renderCards();
    }
    function scheduleResponsiveVisibleSync() {
      if (state.resizeSyncFrame) return;
      state.resizeSyncFrame = window.requestAnimationFrame(function () {
        state.resizeSyncFrame = 0;
        syncResponsiveVisibleLimit();
      });
    }
    function syncQuery(value) {
      state.query = clean(value);
      state.intent = '';
      if (discoverySearch && discoverySearch.value !== value) discoverySearch.value = value;
      state.visibleLimit = initialVisibleLimit();
      state.hasLoadedMore = false;
      applyFilters();
    }
    function setFilter(filter) {
      state.intent = '';
      state.filter = PUBLIC_FILTERS.indexOf(filter) > -1 ? filter : 'all';
      state.visibleLimit = initialVisibleLimit();
      state.hasLoadedMore = false;
      applyFilters();
    }
    function syncDockState(force) {
      if (state.panelActive || document.body.getAttribute('data-gg-panel-active') === 'true') return;
      if (force) document.body.setAttribute('data-gg-dock-state', 'visible');
      else document.body.setAttribute('data-gg-dock-state', resolveDockState());
    }
    function resolveDockState() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewport = window.innerHeight || document.documentElement.clientHeight || 0;
      var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      var nearBottom = scrollTop + viewport >= docHeight - 160;
      if (nearBottom) return 'visible';
      var delta = scrollTop - state.dockLastScrollTop;
      if (Math.abs(delta) < 6) return document.body.getAttribute('data-gg-dock-state') || 'visible';
      document.body.setAttribute('data-gg-scroll-direction', delta > 0 ? 'down' : 'up');
      state.dockLastScrollTop = scrollTop;
      if (delta > 0 && scrollTop > 220) return 'hidden-by-scroll';
      return 'visible';
    }
    function scheduleDockSync() {
      if (state.dockSyncFrame) return;
      state.dockSyncFrame = window.requestAnimationFrame(function () {
        state.dockSyncFrame = 0;
        syncDockState(false);
      });
    }
    function setSavedForItem(item, shouldSave) {
      var key = itemKey(item);
      var pos = state.saved.indexOf(key);
      if (!key) return false;
      if (shouldSave) {
        if (pos === -1) state.saved.push(key);
      } else if (pos > -1) {
        state.saved.splice(pos, 1);
      }
      writeSaved();
      renderSavedResults();
      if (state.currentProductKey === key) setPreviewSaveState(shouldSave);
      return shouldSave;
    }
    function toggleSavedItem(item) {
      var nextSaved = !isSaved(item);
      setSavedForItem(item, nextSaved);
      showToast(copy(nextSaved ? 'savedToast' : 'removedToast'), 'preview');
      return nextSaved;
    }
    function beginDragSession(name, handle, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      state.dragSession = {
        name: name,
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY
      };
      if (handle && handle.setPointerCapture) {
        try { handle.setPointerCapture(event.pointerId); } catch (error) {}
      }
    }
    function moveDragSession(event) {
      if (!state.dragSession || state.dragSession.pointerId !== event.pointerId) return;
      state.dragSession.lastY = event.clientY;
    }
    function endDragSession(event) {
      if (!state.dragSession || state.dragSession.pointerId !== event.pointerId) return;
      var session = state.dragSession;
      var deltaY = (session.lastY || event.clientY) - session.startY;
      state.dragSession = null;
      if (session.name === 'preview' && deltaY <= -84) closePanel('preview');
      if (session.name !== 'preview' && deltaY >= 84) closePanel(session.name);
    }

    function openPreviewItem(item, trigger) {
      if (!item) return;
      if (previewPanel) previewPanel.scrollTop = 0;
      fillPreview(item);
      openPanel('preview', trigger || document.activeElement);
      syncPreviewUrl(item);
    }
    function previewItemForDiscovery(item) {
      if (!item) return null;
      return item.sourceProduct || findItemBySlug(item.slug);
    }
    function navigateToDiscoveryItem(item) {
      var target = productStoreUrl(item) || canonicalProductUrl(item);
      if (!target) return;
      window.location.assign(target);
    }

    grid.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-store-open-preview]');
      if (!trigger) return;
      var index = Number(trigger.getAttribute('data-store-open-preview'));
      var item = activeItem(index);
      if (!item) return;
      event.preventDefault();
      openPreviewItem(item, trigger);
    });
    if (storeDockLink) storeDockLink.addEventListener('click', function (event) {
      if (!isStorePath()) return;
      event.preventDefault();
      scrollToStoreTop();
    });
    if (loadMore) loadMore.addEventListener('click', function () {
      state.hasLoadedMore = true;
      state.visibleLimit += visibleStepLimit();
      renderCards();
    });
    if (discoverySearch) discoverySearch.addEventListener('input', function () { syncQuery(discoverySearch.value); });
    if (discoverOpen) discoverOpen.addEventListener('click', function () { openDiscovery(discoverOpen); });
    if (savedOpen) savedOpen.addEventListener('click', function () { renderSavedResults(); openPanel('saved', savedOpen); });
    if (filterToggle) filterToggle.addEventListener('click', function () {
      var expanded = filterOutline && filterOutline.getAttribute('data-store-filter-state') === 'expanded';
      if (filterOutline) filterOutline.setAttribute('data-store-filter-state', expanded ? 'micro' : 'expanded');
      syncFilterToggleState(!expanded);
    });
    if (discoveryResults) discoveryResults.addEventListener('click', function (event) {
      var row = event.target.closest('[data-store-result-index]');
      if (!row) return;
      var index = Number(row.getAttribute('data-store-result-index'));
      var item = state.discoveryFiltered[index];
      var previewItem = previewItemForDiscovery(item);
      closePanel('discovery', { restoreFocus: false });
      if (previewItem) openPreviewItem(previewItem, row);
      else navigateToDiscoveryItem(item);
    });
    if (savedResults) savedResults.addEventListener('click', function (event) {
      var removeButton = event.target.closest('[data-store-remove-saved]');
      if (removeButton) {
        var removeIndex = Number(removeButton.getAttribute('data-store-remove-saved'));
        var removeItem = state.products[removeIndex];
        if (!removeItem) return;
        setSavedForItem(removeItem, false);
        showToast(copy('removedToast'), 'saved');
        return;
      }
      var row = event.target.closest('[data-store-result-index]');
      if (!row) return;
      var index = Number(row.getAttribute('data-store-result-index'));
      var item = state.products[index];
      closePanel('saved', { restoreFocus: false });
      openPreviewItem(item, row);
    });
    if (semanticRail) semanticRail.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-store-semantic-category]');
      if (!chip) return;
      event.preventDefault();
      setSemanticCategory(chip.getAttribute('data-store-semantic-category'));
    });
    if (semanticList) semanticList.addEventListener('click', function (event) {
      var moreButton = event.target.closest('[data-store-semantic-more]');
      var panel;
      var expanded;
      var extraCount;
      var link;
      var item;
      if (moreButton) {
        panel = moreButton.closest('[data-store-semantic-panel]');
        if (!panel) return;
        expanded = !panel.classList.contains('is-expanded');
        extraCount = moreButton.getAttribute('data-store-semantic-more') || '0';
        panel.classList.toggle('is-expanded', expanded);
        moreButton.textContent = expanded ? copy('semanticLessLabel') : copy('semanticMoreLabel').replace('{count}', extraCount);
        return;
      }
      link = event.target.closest('[data-store-open-slug]');
      if (!link || !isStorePath()) return;
      item = findItemBySlug(link.getAttribute('data-store-open-slug'));
      if (!item) return;
      event.preventDefault();
      openPreviewItem(item, link);
    });
    if (preview.save) preview.save.addEventListener('click', function () {
      if (!state.currentPreviewItem) return;
      toggleSavedItem(state.currentPreviewItem);
    });
    if (preview.copy) preview.copy.addEventListener('click', function () {
      if (!state.currentPreviewItem) return;
      var value = copyLinksText(state.currentPreviewItem);
      writeClipboardText(value).then(showCopyFeedback).catch(function () {
        if (fallbackCopyText(value)) showCopyFeedback();
        else showToast(copy('copyFailToast'), 'preview');
      });
    });
    if (preview.carousel) preview.carousel.addEventListener('scroll', schedulePreviewImageSync, { passive: true });
    if (preview.carousel && 'onscrollend' in preview.carousel) preview.carousel.addEventListener('scrollend', settlePreviewCarousel);
    if (preview.dots) preview.dots.addEventListener('click', function (event) {
      var button = event.target.closest('[data-store-preview-dot]');
      if (!button) return;
      goToPreviewImage(Number(button.getAttribute('data-store-preview-dot')), smoothBehavior());
    });
    if (preview.handle) preview.handle.addEventListener('pointerdown', function (event) { beginDragSession('preview', preview.handle, event); });
    dragHandles.forEach(function (handle) {
      handle.addEventListener('pointerdown', function (event) { beginDragSession(handle.getAttribute('data-store-drag-handle'), handle, event); });
    });
    window.addEventListener('pointermove', moveDragSession, { passive: true });
    window.addEventListener('pointerup', endDragSession);
    window.addEventListener('pointercancel', endDragSession);
    if (moreOpen) moreOpen.addEventListener('click', function () { openPanel('more', moreOpen); });
    if (contactLink) contactLink.addEventListener('click', function (event) {
      if (!isStorePath()) return;
      event.preventDefault();
      scrollToStoreTarget('contact', '/store#contact');
    });
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () { setFilter(button.getAttribute('data-store-filter')); });
    });
    quickIntentButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.intent = button.getAttribute('data-store-intent') || '';
        state.query = '';
        state.filter = 'all';
        if (discoverySearch) discoverySearch.value = '';
        state.visibleLimit = initialVisibleLimit();
        state.hasLoadedMore = false;
        applyFilters();
      });
    });
    priceBandButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var next = button.getAttribute('data-store-price-band') || 'all';
        state.discoveryPrice = DISCOVERY_PRICE_BANDS.indexOf(next) > -1 ? next : 'all';
        applyDiscoveryFilters();
      });
    });
    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var next = button.getAttribute('data-store-sort') || 'recommended';
        state.discoverySort = DISCOVERY_SORTS.indexOf(next) > -1 ? next : 'recommended';
        applyDiscoveryFilters();
      });
    });
    closeButtons.forEach(function (button) {
      button.addEventListener('click', function () { closePanel(button.getAttribute('data-store-close')); });
    });
    langButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.locale = normalizeLocale(button.getAttribute('data-store-lang'));
        writeStorage('gg:lang', state.locale);
        refreshLocaleUI();
      });
    });
    themeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.theme = button.getAttribute('data-store-theme') || 'system';
        applyTheme();
      });
    });
    window.addEventListener('popstate', function () {
      if (!isStorePath()) return;
      if (requestedItemSlug()) syncRequestedPreview();
      else if (state.panelActive === 'preview') closePanel('preview', { restoreFocus: false });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.panelActive) closePanel(state.panelActive);
      trapFocus(event);
      if (state.panelActive === 'preview' && !isEditableElement(event.target)) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goToPreviewImage(state.currentPreviewImageIndex - 1, smoothBehavior());
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goToPreviewImage(state.currentPreviewImageIndex + 1, smoothBehavior());
        } else if (event.key === 'Home') {
          event.preventDefault();
          goToPreviewImage(0, smoothBehavior());
        } else if (event.key === 'End') {
          event.preventDefault();
          goToPreviewImage(previewImageCount() - 1, smoothBehavior());
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !isEditableElement(event.target)) {
        event.preventDefault();
        openDiscovery(document.activeElement || discoverOpen);
      }
      if (event.key === '/' && !state.panelActive && !isEditableElement(event.target)) {
        event.preventDefault();
        openDiscovery(document.activeElement || discoverOpen);
      }
    });
    window.addEventListener('scroll', scheduleDockSync, { passive: true });
    window.addEventListener('resize', function () {
      scheduleResponsiveVisibleSync();
      scheduleOverflowAudit('resize');
    }, { passive: true });
    setupDebugVitals();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        scheduleOverflowAudit('dom-content-loaded');
        scheduleDebugVitalsReport('dom-content-loaded');
      }, { once: true });
    } else {
      scheduleOverflowAudit('dom-content-loaded');
      scheduleDebugVitalsReport('dom-content-loaded');
    }
    window.addEventListener('load', function () {
      scheduleOverflowAudit('window-load');
      scheduleDebugVitalsReport('window-load');
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') reportDebugVitals('visibility-hidden');
    });

    window.StoreSurface = {
      contracts: {
        surface: STORE_SURFACE_CONTRACT,
        motion: STORE_MOTION_CONTRACT,
        qa: STORE_QA_MATRIX
      },
      openPreview: function (index) {
        var item = activeItem(index || 0);
        openPreviewItem(item, document.querySelector('[data-store-open-preview="' + (index || 0) + '"]'));
      },
      openDiscovery: function () { openDiscovery(discoverOpen); },
      openMore: function () { openPanel('more', moreOpen); },
      openSaved: function () { renderSavedResults(); openPanel('saved', savedOpen); },
      close: function () { if (state.panelActive) closePanel(state.panelActive); },
      snapshot: function () {
        return {
          products: state.products.length,
          filtered: state.filtered.length,
          discoveryFiltered: state.discoveryFiltered.length,
          discoveryManifestState: state.discoveryManifestState,
          discoveryPrice: state.discoveryPrice,
          discoverySort: state.discoverySort,
          filter: state.filter,
          intent: state.intent,
          query: state.query,
          saved: state.saved.length,
          panelActive: state.panelActive,
          theme: state.theme,
          locale: state.locale,
          feedSource: state.feedSource,
          dockState: document.body.getAttribute('data-gg-dock-state')
        };
      }
    };

    setCopy();
    applyTheme();
    updateCategoryContext();
    loadProducts();
}());
