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
