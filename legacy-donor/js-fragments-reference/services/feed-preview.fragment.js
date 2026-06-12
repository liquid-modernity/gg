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
