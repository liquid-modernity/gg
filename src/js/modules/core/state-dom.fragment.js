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
