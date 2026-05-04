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

