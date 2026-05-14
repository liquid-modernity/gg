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
          comments: document.querySelector('#gg-comments-sheet, #ggPanelComments, #gg-comments-panel, [data-gg-sheet="comments"], [data-gg-panel="comments"]'),
          commentsPanel: document.querySelector('#gg-comments-sheet .gg-sheet__panel, #gg-comments-sheet .gg-comments-sheet__panel, #ggPanelComments .gg-sheet__panel, #ggPanelComments .gg-comments-sheet__panel, #gg-comments-panel .gg-sheet__panel, #gg-comments-panel .gg-comments-sheet__panel, [data-gg-sheet="comments"] .gg-sheet__panel, [data-gg-sheet="comments"] .gg-comments-sheet__panel, [data-gg-panel="comments"] .gg-sheet__panel, [data-gg-panel="comments"] .gg-comments-sheet__panel'),
          commentsScrim: document.querySelector('#gg-comments-sheet .gg-sheet__scrim, #gg-comments-sheet .gg-comments-sheet__scrim, #ggPanelComments .gg-sheet__scrim, #ggPanelComments .gg-comments-sheet__scrim, #gg-comments-panel .gg-sheet__scrim, #gg-comments-panel .gg-comments-sheet__scrim, [data-gg-sheet="comments"] .gg-sheet__scrim, [data-gg-sheet="comments"] .gg-comments-sheet__scrim, [data-gg-panel="comments"] .gg-sheet__scrim, [data-gg-panel="comments"] .gg-comments-sheet__scrim'),
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
          commentRepliesPortal: null,
          commentRepliesTimer: 0,
          commentReplyContext: null,
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
            var isVisible = function (element) {
              var style;
              var rect;
              if (!element || element.hidden) return false;
              style = window.getComputedStyle ? window.getComputedStyle(element) : null;
              if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
              rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
              return !rect || (rect.width > 0 && rect.height > 0);
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
            replyActionsVertical = Array.prototype.slice.call(document.querySelectorAll('#gg-comment-replies-sheet a.comment-reply, #gg-comment-replies-sheet .thread-toggle, #gg-comment-replies-sheet .continue, #gg-comment-replies-sheet [data-gg-action="comments-open-replies"]')).filter(isVisible).some(function (node) {
              var rect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
              var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
              return !!(rect && style && (style.writingMode !== 'horizontal-tb' || rect.width <= rect.height));
            });
            zeroStateDuplicateLabels = !getTopLevelCommentCount || getTopLevelCommentCount() ? false : (visibleFooterNodes.reduce(function (count, footer) {
              return count + Array.prototype.slice.call(footer.querySelectorAll('[data-gg-action="comments-open-composer"], #comment-post-message')).filter(isVisible).length;
            }, 0) > 1);
            excessiveCommentVerticalGap = Array.prototype.slice.call(document.querySelectorAll('#gg-comments-sheet li.comment, #gg-comments-sheet .comment-thread .comment')).filter(isVisible).slice(0, 6).some(function (commentNode) {
              var bodyNode = commentNode.querySelector ? commentNode.querySelector('.comment-body, .comment-content') : null;
              var actionNode = commentNode.querySelector ? commentNode.querySelector('.comment-actions, .comment-footer, [data-gg-action="comments-open-replies"], .continue') : null;
              var bodyRect = bodyNode && bodyNode.getBoundingClientRect ? bodyNode.getBoundingClientRect() : null;
              var actionRect = actionNode && actionNode.getBoundingClientRect ? actionNode.getBoundingClientRect() : null;
              return !!(bodyRect && actionRect && actionRect.top - bodyRect.bottom > 24);
            });

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
              loadMoreInsideFooter: loadMoreInsideFooter,
              replyActionsVertical: replyActionsVertical,
              zeroStateDuplicateLabels: zeroStateDuplicateLabels,
              excessiveCommentVerticalGap: excessiveCommentVerticalGap,
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
              !result.loadMoreInsideFooter &&
              !result.replyActionsVertical &&
              !result.zeroStateDuplicateLabels &&
              !result.excessiveCommentVerticalGap &&
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
