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

