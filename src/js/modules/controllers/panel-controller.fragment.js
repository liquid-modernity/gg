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
