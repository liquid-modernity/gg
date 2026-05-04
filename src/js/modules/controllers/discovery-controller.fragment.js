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
