        function lockBodyScrollWhileOpen(activeName, lockScroll) {
          writeBodyState('data-gg-active-panel', activeName || '');
          writeBodyState('data-gg-panel-active', activeName ? 'true' : 'false');
          if (lockScroll && activeName) {
            writeBodyState('data-gg-scroll-lock', 'true');
          } else if (document.body) {
            document.body.removeAttribute('data-gg-scroll-lock');
          }
          syncDockVisibility();
        }

        function setBodyPanelState(activeName, lockScroll) {
          lockBodyScrollWhileOpen(activeName, lockScroll);
        }

        function syncExpanded(name, expanded) {
          var selector = '[data-gg-open="' + name + '"], [data-gg-panel-trigger="' + name + '"]';
          var nodes;
          var i;

          if (name === 'comments') {
            selector += ', [data-gg-action="comments-open"], [data-gg-postbar="comments"]';
          }

          nodes = document.querySelectorAll(selector);
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

        function getPanelEdge(panel) {
          if (!panel || !panel.root) return 'bottom';
          return panel.root.getAttribute('data-gg-edge') === 'top' ? 'top' : 'bottom';
        }

        function applyPanelDrag(panel, offset) {
          var edge;
          var panelHeight;
          var progress;
          var resolved;

          if (!panel || !panel.panel) return;

          edge = getPanelEdge(panel);
          if (edge === 'top') {
            resolved = offset > 0 ? offset * 0.28 : offset;
          } else {
            resolved = offset < 0 ? offset * 0.28 : offset;
          }
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

        function returnFocusOnClose(panel, closeOptions) {
          var shouldReturnFocus = closeOptions.returnFocus !== false && panel && panel.returnFocus !== false && state.panelLastTrigger && typeof state.panelLastTrigger.focus === 'function';

          if (!shouldReturnFocus) return false;

          state.panelLastTrigger.focus();
          return true;
        }

        function openPanel(name, options) {
          var panel = getPanel(name);
          var openOptions = options || {};

          if (!panel) return Promise.resolve(null);

          if (state.panelActive === name && !panel.root.hidden && panel.root.getAttribute('data-gg-state') === 'open') {
            if (panel.name === 'comments') setCommentsLayer('main');
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
            if (panel.name === 'comments') setCommentsLayer('main');

            panel.root.hidden = false;
            panel.root.removeAttribute('inert');
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

          if (panel.name === 'comments') {
            setCommentsLayer('closed');
            closeCommentMoreMenu();
            closeCommentRepliesSheet({
              returnFocus: false,
              reason: 'comments-panel-close'
            });
          }

          clearPanelTimer(panel.name);
          syncExpanded(panel.name, false);
          panel.root.setAttribute('data-gg-state', 'closing');
          panel.root.setAttribute('data-gg-active', 'false');
          state.drag = state.drag && state.drag.name === panel.name ? null : state.drag;

          return new Promise(function (resolve) {
            state.panelTimers[panel.name] = window.setTimeout(function () {
              clearPanelTimer(panel.name);
              panel.root.hidden = true;
              if (panel.name === 'comments') panel.root.setAttribute('inert', '');
              panel.root.setAttribute('aria-hidden', 'true');
              panel.root.setAttribute('data-gg-state', 'closed');
              panel.root.removeAttribute('data-gg-active');
              if (panel.name === 'comments') setCommentsLayer('closed');
              resetPanelDrag(panel, true);

              if (state.panelActive === panel.name) {
                state.panelActive = null;
                setBodyPanelState('', false);
              }

              returnFocusOnClose(panel, closeOptions);

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

        function hasCommentsSurface() {
          return !!(ui.comments || document.getElementById('gg-comments-root') || document.getElementById('comments'));
        }

        function getCommentsDebugCounters() {
          var enabled = !!(window.__GG_COMMENTS_DEBUG__ || window.__GG_COMMENTS_DEBUG_ENABLED__);
          if (!enabled) return null;
          window.__GG_COMMENTS_DEBUG__ = window.__GG_COMMENTS_DEBUG__ || {};
          return window.__GG_COMMENTS_DEBUG__;
        }

        function bumpCommentsDebugCounter(name, amount) {
          var debug = getCommentsDebugCounters();
          var delta = typeof amount === 'number' ? amount : 1;
          if (!debug) return;
          debug[name] = (Number(debug[name]) || 0) + delta;
        }

        function setCommentsLayer(layer) {
          var value = layer || 'closed';

          if (!document.body) return value;

          if (value === 'closed') {
            document.body.removeAttribute('data-gg-comments-layer');
            if (ui.commentsFooter) ui.commentsFooter.hidden = true;
            if (ui.commentRepliesFooter) ui.commentRepliesFooter.hidden = true;
            if (ui.comments) {
              ui.comments.setAttribute('data-gg-active', 'false');
              ui.comments.setAttribute('aria-hidden', 'true');
              ui.comments.setAttribute('inert', '');
            }
            if (ui.commentReplies) {
              ui.commentReplies.setAttribute('data-gg-active', 'false');
              ui.commentReplies.setAttribute('aria-hidden', 'true');
              ui.commentReplies.setAttribute('inert', '');
            }
          } else {
            document.body.setAttribute('data-gg-comments-layer', value);
            if (ui.commentsFooter) ui.commentsFooter.hidden = value === 'replies';
            if (ui.commentRepliesFooter) ui.commentRepliesFooter.hidden = value !== 'replies';
            if (ui.comments) {
              ui.comments.setAttribute('data-gg-active', value === 'main' ? 'true' : 'false');
              ui.comments.setAttribute('aria-hidden', value === 'main' ? 'false' : 'true');
              if (value === 'main') ui.comments.removeAttribute('inert');
              else ui.comments.setAttribute('inert', '');
            }
            if (ui.commentReplies) {
              ui.commentReplies.setAttribute('data-gg-active', value === 'replies' ? 'true' : 'false');
              ui.commentReplies.setAttribute('aria-hidden', value === 'replies' ? 'false' : 'true');
              if (value === 'replies') ui.commentReplies.removeAttribute('inert');
              else ui.commentReplies.setAttribute('inert', '');
            }
          }

          return value;
        }

        function adoptGeneratedBloggerComposer() {
          var slot = ui.commentsComposerSlot || document.getElementById('gg-comments-composer-slot');
          var editor = document.getElementById('comment-editor');
          var editorComposer = editor && editor.closest ? editor.closest('.comment-form, .comment-replybox-thread, .comment-replybox-single') : null;
          var generated = document.querySelector('.comment-replybox-thread#top-ce') || document.getElementById('top-ce');
          var composer = editorComposer || generated;
          var placeholder = slot ? slot.querySelector('.comment-form[data-gg-native-plumbing="composer"], .comment-form[data-gg-native-plumbing="composer-source"], .comment-replybox-thread[data-gg-native-plumbing="composer"], .comment-replybox-thread[data-gg-native-plumbing="composer-source"], .comment-replybox-single[data-gg-native-plumbing="composer"], .comment-replybox-single[data-gg-native-plumbing="composer-source"]') : document.querySelector('.comment-form[data-gg-native-plumbing="composer"], .comment-form[data-gg-native-plumbing="composer-source"], .comment-replybox-thread[data-gg-native-plumbing="composer"], .comment-replybox-thread[data-gg-native-plumbing="composer-source"], .comment-replybox-single[data-gg-native-plumbing="composer"], .comment-replybox-single[data-gg-native-plumbing="composer-source"]');

          if (generated && composer && generated !== composer && generated.id === 'top-ce') {
            generated.removeAttribute('id');
            generated.setAttribute('data-gg-native-plumbing', 'composer-source');
            generated.setAttribute('hidden', 'hidden');
          }

          if (composer && composer.id !== 'top-ce') composer.id = 'top-ce';

          if (composer && placeholder && composer !== placeholder) {
            if (placeholder.id === 'top-ce') placeholder.removeAttribute('id');
            placeholder.setAttribute('data-gg-native-plumbing', 'composer-source');
            placeholder.setAttribute('hidden', 'hidden');
          }

          if (composer && slot && composer.parentNode !== slot) {
            slot.insertBefore(composer, slot.firstChild);
            composer.setAttribute('data-gg-native-plumbing', 'composer');
            state.commentComposerMoveCount += 1;
            bumpCommentsDebugCounter('composerMoves');
          }

          if (composer) {
            composer.hidden = false;
            composer.removeAttribute('hidden');
            if (composer.style) composer.style.display = '';
          }

          cacheTopLevelCommentEditorSrc();

          return !!(composer || placeholder);
        }

        function stripParentIdFromCommentSrc(src) {
          var raw = String(src || '');
          var hash = '';
          var hashIndex;
          var cleaned;

          if (!raw) return raw;

          try {
            var url = new URL(raw, window.location.href);
            url.searchParams.forEach(function (value, key) {
              if (String(key).toLowerCase() === 'parentid') url.searchParams.delete(key);
            });
            return url.toString();
          } catch (error) {
            var queryIndex;
            var basePath;
            var query;
            hashIndex = raw.indexOf('#');
            if (hashIndex >= 0) {
              hash = raw.slice(hashIndex);
              raw = raw.slice(0, hashIndex);
            }
            queryIndex = raw.indexOf('?');
            if (queryIndex < 0) return raw + hash;
            basePath = raw.slice(0, queryIndex);
            query = raw.slice(queryIndex + 1).split('&').filter(function (part) {
              return part && !/^parentID=/i.test(part);
            }).join('&');
            cleaned = basePath + (query ? '?' + query : '');
            return cleaned + hash;
          }
        }

        function commentSrcHasParentId(src) {
          var raw = String(src || '');

          if (!raw) return false;

          try {
            var url = new URL(raw, window.location.href);
            var hasParentId = false;
            url.searchParams.forEach(function (value, key) {
              if (String(key).toLowerCase() === 'parentid') hasParentId = true;
            });
            return hasParentId;
          } catch (error) {
            return /[?&]parentID=/i.test(raw);
          }
        }

        function cacheTopLevelCommentEditorSrc() {
          var editor = document.getElementById('comment-editor');
          var editorSrc = document.getElementById('comment-editor-src');
          var href = editorSrc ? (editorSrc.getAttribute('href') || editorSrc.href || '') : '';
          var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';
          var base = stripParentIdFromCommentSrc(href || state.commentTopLevelEditorSrc || current);

          if (base) {
            state.commentTopLevelEditorSrc = base;
            if (editorSrc && (editorSrc.getAttribute('href') || editorSrc.href || '') !== base) {
              editorSrc.setAttribute('href', base);
            }
          }

          return state.commentTopLevelEditorSrc;
        }

        function resetNativeComposerToTopLevel() {
          var editor = document.getElementById('comment-editor');
          var editorSrc = document.getElementById('comment-editor-src');
          var current = editor ? (editor.getAttribute('src') || editor.src || '') : '';
          var base = cacheTopLevelCommentEditorSrc() || stripParentIdFromCommentSrc(current);
          var target = base || stripParentIdFromCommentSrc(current);

          if (editorSrc && target) editorSrc.setAttribute('href', target);

          if (editor && target && (commentSrcHasParentId(current) || !current)) {
            editor.setAttribute('src', target);
            state.commentIframeSrcChangeCount += 1;
            bumpCommentsDebugCounter('iframeSrcChanges');
          } else if (editor && current && commentSrcHasParentId(current)) {
            editor.setAttribute('src', stripParentIdFromCommentSrc(current));
            state.commentIframeSrcChangeCount += 1;
            bumpCommentsDebugCounter('iframeSrcChanges');
          }

          state.commentReplyResetCount += 1;

          return !commentSrcHasParentId(editor ? (editor.getAttribute('src') || editor.src || '') : '');
        }

        function ensureRepliesSheetHandle() {
          var head = ui.commentReplies ? ui.commentReplies.querySelector('.gg-comments-sheet__head, .gg-sheet__head') : null;
          var back = ui.commentReplies ? ui.commentReplies.querySelector('.gg-comments-sheet__back') : null;
          var handle;
          var label;

          if (!head) return false;
          handle = head.querySelector('.gg-sheet__handle');
          if (handle) return true;

          handle = document.createElement('button');
          handle.type = 'button';
          handle.className = 'gg-comments-sheet__handle gg-sheet__handle';
          handle.setAttribute('data-gg-drag-handle', 'comment-replies');
          handle.setAttribute('aria-label', 'Drag replies sheet');
          label = document.createElement('span');
          label.className = 'gg-visually-hidden';
          label.textContent = 'Drag replies sheet';
          handle.appendChild(label);
          head.insertBefore(handle, back || head.firstChild);
          return true;
        }

        function setComposerOpen(open) {
          state.commentComposerOpen = !!open;
          syncCommentComposerMode();
          return state.commentComposerOpen;
        }

        function isElementVisible(element) {
          var style;
          var rect;
          if (!element || element.hidden) return false;
          style = window.getComputedStyle ? window.getComputedStyle(element) : null;
          if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
          rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
          return !rect || (rect.width > 0 && rect.height > 0);
        }

        function getCommentFromLegacyContinue(continueNode, commentId) {
          var byId = commentId ? document.getElementById('c' + commentId) : null;
          var node = continueNode ? continueNode.previousElementSibling : null;

          if (byId && byId.matches && byId.matches('li.comment, .comment-thread .comment, .comment')) return byId;

          while (node) {
            if (node.matches && node.matches('li.comment, .comment-thread .comment, .comment')) return node;
            node = node.previousElementSibling;
          }
          return null;
        }

        function cleanupLegacyCommentControls() {
          var root = ui.commentsList || ui.comments || document.getElementById('gg-comments-root');
          var replyLinks;
          var i;
          var link;
          var continueNode;
          var commentNode;
          var actionRoot;
          var commentId;
          var existingReply;
          var enhanced = 0;

          if (!root || !root.querySelectorAll) return 0;

          replyLinks = root.querySelectorAll('.continue > a.comment-reply[data-comment-id]');
          for (i = 0; i < replyLinks.length; i += 1) {
            link = replyLinks[i];
            continueNode = link.parentElement;
            if (!continueNode || continueNode.getAttribute('data-gg-legacy-control-ready') === 'true') continue;

            commentId = link.getAttribute('data-comment-id') || '';
            commentNode = getCommentFromLegacyContinue(continueNode, commentId);
            if (!commentNode) continue;

            existingReply = commentId ? commentNode.querySelector('.comment-actions a.comment-reply[data-comment-id="' + commentId + '"], .comment-footer a.comment-reply[data-comment-id="' + commentId + '"]') : null;
            continueNode.setAttribute('data-gg-legacy-control-ready', 'true');

            if (existingReply && existingReply !== link) {
              continueNode.setAttribute('data-gg-legacy-control', 'duplicate-reply');
              continueNode.hidden = true;
              continue;
            }

            actionRoot = commentNode.querySelector('.comment-actions, .comment-footer') || commentNode.querySelector('.comment-block, .comment-content, .comment-body') || commentNode;
            continueNode.classList.add('gg-comment-inline-reply');
            continueNode.setAttribute('data-gg-legacy-control', 'inline-reply');
            actionRoot.appendChild(continueNode);
            enhanced += 1;
          }

          if (enhanced) {
            state.commentInlineReplyEnhancementCount += enhanced;
            bumpCommentsDebugCounter('inlineReplyEnhancements', enhanced);
          }
          return replyLinks.length;
        }

        function runCommentsEnhancement(reason) {
          if (!hasCommentsSurface()) return false;
          state.commentEnhancementScheduled = false;
          state.commentEnhancementReason = reason || 'comments-enhancement';
          state.commentEnhanceRunCount += 1;
          bumpCommentsDebugCounter('enhanceRuns');
          ensureRepliesSheetHandle();
          adoptGeneratedBloggerComposer();
          if (!isCommentRepliesSheetOpen() || state.commentReplyContext) ensureComposerInActiveFooter();
          else syncCommentComposerMode();
          cleanupLegacyCommentControls();
          initCommentRepliesControls();
          ensureCommentMoreMenus();
          initCommentPrefixObserver();
          requestCommentPrefixSync();
          syncCommentComposerMode();
          return true;
        }

        function scheduleCommentsEnhancement(reason) {
          if (!hasCommentsSurface()) return false;
          if (state.commentEnhancementScheduled) return true;

          state.commentEnhancementScheduled = true;
          state.commentEnhancementReason = reason || 'comments-hydration';
          ggIdle(function () {
            runCommentsEnhancement(state.commentEnhancementReason || reason);
          }, 900);
          return true;
        }

        function openCommentsSheet(options) {
          var openOptions = options || {};

          if (!getPanel('comments')) return Promise.resolve(null);

          return openPanel('comments', {
            trigger: openOptions.trigger || document.activeElement || null,
            focus: openOptions.focus !== false,
            reason: openOptions.reason || 'comments-open'
          }).then(function (panel) {
            setCommentsLayer('main');
            runCommentsEnhancement(openOptions.reason || 'comments-open');
            return panel;
          });
        }

        function closeCommentsSheet(options) {
          var closeOptions = options || {};

          return closeCommentRepliesSheet({
            returnFocus: false,
            reason: 'comments-parent-close'
          }).then(function () {
            return closePanel('comments', {
              returnFocus: closeOptions.returnFocus !== false,
              reason: closeOptions.reason || 'comments-close'
            }).then(function (closed) {
              setCommentsLayer('closed');
              return closed;
            });
          });
        }

        function toggleCommentsSheet(options) {
          var toggleOptions = options || {};

          if (state.panelActive === 'comments') {
            return closeCommentsSheet({
              returnFocus: toggleOptions.returnFocus !== false,
              reason: toggleOptions.reason || 'comments-toggle'
            });
          }

          return openCommentsSheet({
            trigger: toggleOptions.trigger,
            focus: toggleOptions.focus !== false,
            reason: toggleOptions.reason || 'comments-toggle'
          });
        }

        function formatRepliesCount(count) {
          var resolved = Math.max(0, Number(count) || 0);
          if (state.locale === 'id') return 'Lihat ' + resolved + ' balasan';
          return 'View ' + resolved + (resolved === 1 ? ' reply' : ' replies');
        }

        function getCommentReplyCount(repliesNode) {
          var liComments;
          if (!repliesNode) return 0;
          liComments = repliesNode.querySelectorAll('li.comment');
          if (liComments.length) return liComments.length;
          return repliesNode.querySelectorAll('.comment-thread .comment, .comment').length;
        }

        function isNestedRepliesNode(repliesNode) {
          var parent = repliesNode ? repliesNode.parentElement : null;
          return !!(parent && parent.closest('.comment-replies'));
        }

        function initCommentRepliesControls() {
          var root = ui.commentsList || (ui.comments ? ui.comments.querySelector('#gg-comments-list, [data-gg-role="comments-list"]') : null);
          var repliesNodes;
          var i;
          var repliesNode;
          var count;
          var button;

          if (!root) return 0;

          repliesNodes = root.querySelectorAll('.comment-replies');
          for (i = 0; i < repliesNodes.length; i += 1) {
            repliesNode = repliesNodes[i];
            if (isNestedRepliesNode(repliesNode)) continue;

            count = getCommentReplyCount(repliesNode);
            if (!count) continue;

            button = repliesNode.__ggRepliesButton || null;
            if (!button || !button.parentNode) {
              button = document.createElement('button');
              button.type = 'button';
              button.setAttribute('data-gg-action', 'comments-open-replies');
              repliesNode.__ggRepliesButton = button;
              repliesNode.parentNode.insertBefore(button, repliesNode.nextSibling);
            }

            button.__ggRepliesNode = repliesNode;
            button.setAttribute('data-gg-reply-count', String(count));
            button.setAttribute('aria-expanded', state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode ? 'true' : 'false');
            button.textContent = formatRepliesCount(count);
          }

          return repliesNodes.length;
        }

        function getDirectCommentElement(container, beforeNode) {
          var node;
          if (!container) return null;
          node = beforeNode ? beforeNode.previousElementSibling : null;
          while (node) {
            if (node.classList && node.classList.contains('comment')) return node;
            node = node.previousElementSibling;
          }
          if (container.classList && container.classList.contains('comment')) return container;
          node = container.firstElementChild;
          while (node) {
            if (node.classList && node.classList.contains('comment')) return node;
            node = node.nextElementSibling;
          }
          return null;
        }

        function getTextFromNode(root, selector) {
          var node = root ? root.querySelector(selector) : null;
          return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
        }

        function getCommentAuthorName(commentNode) {
          return getTextFromNode(commentNode, '.comment-author cite, .comment-author .user, .comment-author, .comment-header cite, .comment-header .user, cite.user') || '';
        }

        function normalizeReplyHandle(author) {
          var clean = String(author || '').replace(/^@+/, '').replace(/\s+/g, '').replace(/[^\w.\-]/g, '');
          return clean ? '@' + clean : '';
        }

        function getCommentNodeFromTrigger(trigger) {
          return trigger ? trigger.closest('li.comment, .comment-thread .comment, .comment') : null;
        }

        function getTopLevelCommentCount() {
          var root = ui.commentsList || (ui.comments ? ui.comments.querySelector('#gg-comments-list, [data-gg-role="comments-list"]') : null);
          var comments;
          var i;
          var count = 0;

          if (!root || !root.querySelectorAll) return 0;

          comments = root.querySelectorAll('li.comment, .comment-thread .comment, #comments-block > .comment');
          for (i = 0; i < comments.length; i += 1) {
            if (!comments[i].closest('.comment-replies')) count += 1;
          }

          return count;
        }

        function getCommentNodeId(commentNode) {
          var node = commentNode;
          while (node) {
            if (node.id) return node.id;
            node = node.parentElement;
            if (!node || (ui.comments && node === ui.comments)) break;
          }
          return '';
        }

        function getReplyParentComment(commentNode) {
          var repliesNode = commentNode ? commentNode.parentElement : null;

          while (repliesNode && repliesNode !== ui.comments && repliesNode !== ui.commentRepliesList) {
            if (repliesNode.classList && repliesNode.classList.contains('comment-replies')) {
              return getDirectCommentElement(repliesNode.parentNode, repliesNode);
            }
            repliesNode = repliesNode.parentElement;
          }

          return null;
        }

        function renderReplyBanner() {
          var banner;
          var label;
          var icon;
          var textWrap;
          var text;
          var strong;
          var clearButton;

          if (!ui.commentsReplySlot) return;

          ui.commentsReplySlot.textContent = '';

          if (!state.commentReplyContext || !state.commentReplyContext.handle) {
            syncCommentComposerMode();
            return;
          }

          banner = document.createElement('div');
          banner.className = 'gg-comments__reply-banner';
          banner.setAttribute('role', 'status');
          label = document.createElement('span');
          label.className = 'gg-comments__reply-context gg-comments__reply-label';
          icon = document.createElement('span');
          icon.className = 'gg-icon gg-comments__reply-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = 'reply';
          textWrap = document.createElement('span');
          textWrap.className = 'gg-comments__reply-text';
          text = document.createTextNode('Replying to ');
          strong = document.createElement('strong');
          strong.textContent = state.commentReplyContext.handle;
          textWrap.appendChild(text);
          textWrap.appendChild(strong);
          label.appendChild(icon);
          label.appendChild(textWrap);
          clearButton = document.createElement('button');
          clearButton.type = 'button';
          clearButton.className = 'gg-comments__reply-clear';
          clearButton.setAttribute('data-gg-action', 'comments-reply-context-clear');
          clearButton.setAttribute('aria-label', 'Cancel reply');
          clearButton.textContent = '×';
          banner.appendChild(label);
          banner.appendChild(clearButton);
          ui.commentsReplySlot.appendChild(banner);
          syncCommentComposerMode();
        }

        function clearCommentReplyContext(options) {
          var clearOptions = options || {};
          state.commentReplyContext = null;
          state.commentRepliesLastReplySource = '';
          state.commentRepliesLastReplyTargetId = '';
          state.commentRepliesProgrammaticReplySource = '';
          if (clearOptions.collapseComposer !== false && isCommentRepliesSheetOpen()) {
            state.commentComposerOpen = false;
          }
          resetNativeComposerToTopLevel();
          renderReplyBanner();
        }

        function setCommentReplyContext(commentNode) {
          var author = getCommentAuthorName(commentNode);
          var handle = normalizeReplyHandle(author);

          if (!commentNode || !handle) {
            clearCommentReplyContext();
            return null;
          }

          state.commentReplyContext = {
            parentId: getCommentNodeId(commentNode),
            parentAuthor: author,
            handle: handle
          };
          state.commentRepliesLastReplyTargetId = state.commentReplyContext.parentId;
          state.commentComposerOpen = true;
          renderReplyBanner();
          return state.commentReplyContext;
        }

        function getActiveComposerFooter() {
          if (isCommentRepliesSheetOpen() && ui.commentRepliesFooter) return ui.commentRepliesFooter;
          return ui.commentsFooter;
        }

        function getCommentComposerMode() {
          if (state.commentReplyContext && state.commentReplyContext.handle) return 'reply';
          return getTopLevelCommentCount() ? 'comment' : 'empty';
        }

        function syncCommentComposerMode() {
          var mode = getCommentComposerMode();
          var activeFooter = getActiveComposerFooter();
          var editor = activeFooter ? activeFooter.querySelector('#comment-editor') : null;
          var editorVisible = isElementVisible(editor);
          var open = state.commentComposerOpen || mode === 'reply' || (editorVisible && state.commentComposerOpen);

          if (ui.comments) ui.comments.setAttribute('data-gg-comment-composer-mode', mode);
          if (ui.commentsFooter) ui.commentsFooter.setAttribute('data-gg-comment-composer-mode', activeFooter === ui.commentsFooter ? mode : 'inactive');
          if (ui.commentRepliesFooter) ui.commentRepliesFooter.setAttribute('data-gg-comment-composer-mode', activeFooter === ui.commentRepliesFooter ? mode : 'inactive');
          if (ui.commentsFooter) ui.commentsFooter.setAttribute('data-gg-composer-open', activeFooter === ui.commentsFooter && open ? 'true' : 'false');
          if (ui.commentRepliesFooter) ui.commentRepliesFooter.setAttribute('data-gg-composer-open', activeFooter === ui.commentRepliesFooter && open ? 'true' : 'false');

          return mode;
        }

        function ensureComposerPortalAnchors() {
          if (state.commentComposerPortal || !ui.commentsReplySlot || !ui.commentsComposerSlot) return;
          if (!ui.commentsReplySlot.parentNode || !ui.commentsComposerSlot.parentNode) return;
          state.commentComposerPortal = {
            replySlotAnchor: document.createComment('gg-comments-reply-slot'),
            composerSlotAnchor: document.createComment('gg-comments-composer-slot')
          };
          ui.commentsReplySlot.parentNode.insertBefore(state.commentComposerPortal.replySlotAnchor, ui.commentsReplySlot);
          ui.commentsComposerSlot.parentNode.insertBefore(state.commentComposerPortal.composerSlotAnchor, ui.commentsComposerSlot);
        }

        function portalComposerToFooter(footer) {
          var moved = false;
          if (!footer || !ui.commentsReplySlot || !ui.commentsComposerSlot) return false;
          if (ui.commentsReplySlot.parentNode === footer && ui.commentsComposerSlot.parentNode === footer) {
            syncCommentComposerMode();
            return false;
          }
          ensureComposerPortalAnchors();
          if (ui.commentsReplySlot.parentNode !== footer) {
            footer.appendChild(ui.commentsReplySlot);
            moved = true;
          }
          if (ui.commentsComposerSlot.parentNode !== footer) {
            footer.appendChild(ui.commentsComposerSlot);
            moved = true;
          }
          if (moved) {
            state.commentComposerMoveCount += 1;
            bumpCommentsDebugCounter('composerMoves');
          }
          renderReplyBanner();
          syncCommentComposerMode();
          return moved;
        }

        function restoreComposerToMainFooter() {
          var portal = state.commentComposerPortal;

          if (!portal || !ui.commentsReplySlot || !ui.commentsComposerSlot) return false;

          if (portal.replySlotAnchor && portal.replySlotAnchor.parentNode) {
            portal.replySlotAnchor.parentNode.replaceChild(ui.commentsReplySlot, portal.replySlotAnchor);
          } else if (ui.commentsFooter) {
            ui.commentsFooter.appendChild(ui.commentsReplySlot);
          }

          if (portal.composerSlotAnchor && portal.composerSlotAnchor.parentNode) {
            portal.composerSlotAnchor.parentNode.replaceChild(ui.commentsComposerSlot, portal.composerSlotAnchor);
          } else if (ui.commentsFooter) {
            ui.commentsFooter.appendChild(ui.commentsComposerSlot);
          }

          state.commentComposerPortal = null;
          renderReplyBanner();
          syncCommentComposerMode();
          return true;
        }

        function ensureComposerInActiveFooter() {
          var footer = getActiveComposerFooter();
          adoptGeneratedBloggerComposer();
          if (footer && footer !== ui.commentsFooter) return portalComposerToFooter(footer);
          syncCommentComposerMode();
          return restoreComposerToMainFooter();
        }

        function applyVisualReplyPrefixes(root) {
          var scope = root || ui.comments || document;
          var comments = scope.querySelectorAll ? scope.querySelectorAll('.comment-replies li.comment, .comment-replies .comment-thread .comment, .comment-replies > .comment') : [];
          var i;
          var commentNode;
          var bodyNode;
          var parentComment;
          var handle;
          var prefixNode;

          for (i = 0; i < comments.length; i += 1) {
            commentNode = comments[i];
            bodyNode = commentNode.querySelector('.comment-body, .comment-content');
            if (!bodyNode) continue;

            parentComment = getReplyParentComment(commentNode);
            handle = normalizeReplyHandle(getCommentAuthorName(parentComment));
            prefixNode = bodyNode.querySelector('.gg-comment-reply-prefix');

            if (!handle) {
              if (prefixNode) prefixNode.parentNode.removeChild(prefixNode);
              continue;
            }

            if (!prefixNode) {
              prefixNode = document.createElement('span');
              prefixNode.className = 'gg-comment-reply-prefix';
              bodyNode.insertBefore(prefixNode, bodyNode.firstChild);
            }

            prefixNode.setAttribute('data-gg-reply-prefix', handle);
            prefixNode.textContent = handle;
          }
        }

        function requestCommentPrefixSync() {
          if (state.commentPrefixSyncFrame) return;
          state.commentPrefixSyncFrame = window.requestAnimationFrame(function () {
            state.commentPrefixSyncFrame = 0;
            ensureCommentMoreMenus();
            applyVisualReplyPrefixes(ui.comments || document);
          });
        }

        function initCommentPrefixObserver() {
          var root = ui.commentsList || ui.comments;

          if (!root || state.commentPrefixObserver || !window.MutationObserver) {
            applyVisualReplyPrefixes(ui.comments || document);
            return;
          }

          state.commentPrefixObserver = new MutationObserver(function () {
            state.commentMutationCount += 1;
            bumpCommentsDebugCounter('mutations');
            requestCommentPrefixSync();
          });
          state.commentPrefixObserver.observe(root, {
            childList: true,
            subtree: true
          });
          if (ui.commentRepliesList) {
            state.commentPrefixObserver.observe(ui.commentRepliesList, {
              childList: true,
              subtree: true
            });
          }
          applyVisualReplyPrefixes(ui.comments || document);
        }

        function getNativeReplyControl(commentNode) {
          if (!commentNode || !commentNode.querySelector) return null;
          return commentNode.querySelector('a.comment-reply[data-comment-id]')
            || commentNode.querySelector('.comment-reply a[data-comment-id]')
            || commentNode.querySelector('[data-comment-id].comment-reply')
            || commentNode.querySelector('a.comment-reply, .comment-reply a');
        }

        function replyToCommentNode(commentNode, source) {
          var nativeReply = getNativeReplyControl(commentNode);

          if (!commentNode) return false;

          state.commentRepliesLastReplySource = source || 'native';
          state.commentRepliesProgrammaticReplySource = source || '';
          handleNativeReplyTrigger(nativeReply || commentNode);

          if (nativeReply && typeof nativeReply.click === 'function') {
            nativeReply.click();
          }
          if (state.commentRepliesProgrammaticReplySource) {
            window.setTimeout(function () {
              state.commentRepliesProgrammaticReplySource = '';
            }, 0);
          }

          return true;
        }

        function handleNativeReplyTrigger(trigger) {
          var commentNode = getCommentNodeFromTrigger(trigger);

          if (!commentNode) return;

          state.commentRepliesLastReplySource = state.commentRepliesLastReplySource || 'native';
          setCommentReplyContext(commentNode);
          setComposerOpen(true);
          ensureComposerInActiveFooter();

          window.setTimeout(function () {
            ensureComposerInActiveFooter();
            renderReplyBanner();
            scrollCommentsHashTarget('#comment-form');
            requestCommentPrefixSync();
          }, 32);
        }

        function getNativeDeleteControl(commentNode) {
          if (!commentNode) return null;
          return commentNode.querySelector('.comment-delete')
            || commentNode.querySelector('.item-control a, .item-control button')
            || commentNode.querySelector('.goog-toggle-button a, .goog-toggle-button button, .goog-toggle-button');
        }

        function commentHasNativeDelete(commentNode) {
          return !!(commentNode && commentNode.querySelector('.item-control, .comment-delete, .goog-toggle-button'));
        }

        function getCommentPermalink(commentNode) {
          var id = getCommentNodeId(commentNode);
          var base = ui.article ? ui.article.getAttribute('data-gg-post-url') : '';
          var url;

          if (!id) return '';

          url = base || window.location.href;
          try {
            url = new URL(url, window.location.href).href;
          } catch (error) {
            url = window.location.href;
          }

          return url.replace(/#.*$/, '') + '#' + id;
        }

        function showCommentStatus(message) {
          var root = ui.comments || document.getElementById('gg-comments-root');
          var status;

          if (!root || !message) return;

          status = root.querySelector('.gg-comments__status');
          if (!status) {
            status = document.createElement('div');
            status.className = 'gg-comments__status';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            root.appendChild(status);
          }

          status.hidden = false;
          status.textContent = message;

          if (state.commentStatusTimer) window.clearTimeout(state.commentStatusTimer);
          state.commentStatusTimer = window.setTimeout(function () {
            status.hidden = true;
            state.commentStatusTimer = 0;
          }, 1800);
        }

        function copyTextFallback(value) {
          var textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
          } finally {
            textarea.parentNode.removeChild(textarea);
          }
          return Promise.resolve();
        }

        function copyCommentLink(commentNode) {
          var permalink = getCommentPermalink(commentNode);

          if (!permalink) {
            showCommentStatus('Comment link unavailable');
            return Promise.resolve(false);
          }

          if (window.navigator && window.navigator.clipboard && typeof window.navigator.clipboard.writeText === 'function') {
            return window.navigator.clipboard.writeText(permalink).then(function () {
              showCommentStatus('Comment link copied');
              return true;
            }).catch(function () {
              return copyTextFallback(permalink).then(function () {
                showCommentStatus('Comment link copied');
                return true;
              });
            });
          }

          return copyTextFallback(permalink).then(function () {
            showCommentStatus('Comment link copied');
            return true;
          });
        }

        function closeCommentMoreMenu(options) {
          var closeOptions = options || {};
          var active = state.commentMoreMenu;

          if (!active) return false;

          if (active.menu && active.menu.parentNode) active.menu.parentNode.removeChild(active.menu);
          if (active.button) active.button.setAttribute('aria-expanded', 'false');
          if (closeOptions.returnFocus && active.button && typeof active.button.focus === 'function') active.button.focus();
          state.commentMoreMenu = null;
          return true;
        }

        function buildCommentMoreMenuIcon(name) {
          var icon = document.createElement('span');
          icon.className = 'gg-comment-more__icon gg-comment-more__item-icon gg-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = name;
          return icon;
        }

        function buildCommentMoreMenuLabel(text) {
          var label = document.createElement('span');
          label.className = 'gg-comment-more__label gg-comment-more__item-label';
          label.textContent = text;
          return label;
        }

        function buildCommentMoreMenu(commentNode) {
          var menu = document.createElement('div');
          var copyButton = document.createElement('button');
          var deleteButton;

          menu.className = 'gg-comment-more__menu';
          menu.setAttribute('role', 'menu');

          copyButton.type = 'button';
          copyButton.className = 'gg-comment-more__item';
          copyButton.setAttribute('role', 'menuitem');
          copyButton.setAttribute('data-gg-action', 'comment-copy-link');
          copyButton.setAttribute('data-gg-comment-action', 'copy');
          copyButton.appendChild(buildCommentMoreMenuIcon('link'));
          copyButton.appendChild(buildCommentMoreMenuLabel('Copy link'));
          menu.appendChild(copyButton);

          if (commentHasNativeDelete(commentNode)) {
            deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'gg-comment-more__item gg-comment-more__item--danger';
            deleteButton.setAttribute('role', 'menuitem');
            deleteButton.setAttribute('data-gg-action', 'comment-native-delete');
            deleteButton.setAttribute('data-gg-comment-action', 'delete');
            deleteButton.appendChild(buildCommentMoreMenuIcon('delete'));
            deleteButton.appendChild(buildCommentMoreMenuLabel('Delete comment'));
            menu.appendChild(deleteButton);
          }

          return menu;
        }

        function clampNumber(value, min, max) {
          if (max < min) return min;
          return Math.max(min, Math.min(max, value));
        }

        function positionCommentMoreMenu(button, menu) {
          var wrapper = button ? button.closest('.gg-comment-more') : null;
          var panel = button ? button.closest('.gg-sheet__panel, .gg-comments-sheet__panel') : null;
          var header = panel ? panel.querySelector('.gg-sheet__head, .gg-comments-sheet__head') : null;
          var footer = panel ? panel.querySelector('.gg-comments__footer:not([hidden])') : null;
          var buttonRect;
          var panelRect;
          var headerRect;
          var footerRect;
          var menuRect;
          var safeTop;
          var safeBottom;
          var safeLeft;
          var safeRight;
          var belowTop;
          var aboveTop;
          var left;
          var top;
          var placement = 'bottom-end';

          if (!button || !menu || !panel) return placement;

          menu.style.left = '0px';
          menu.style.top = '0px';
          menu.style.right = 'auto';
          menu.style.bottom = 'auto';
          menu.style.maxWidth = '';

          buttonRect = button.getBoundingClientRect();
          panelRect = panel.getBoundingClientRect();
          headerRect = header && header.getBoundingClientRect ? header.getBoundingClientRect() : null;
          footerRect = footer && footer.getBoundingClientRect ? footer.getBoundingClientRect() : null;
          menuRect = menu.getBoundingClientRect();
          safeTop = Math.max(panelRect.top + 8, headerRect ? headerRect.bottom + 6 : panelRect.top + 8);
          safeBottom = Math.min(panelRect.bottom - 8, footerRect ? footerRect.top - 6 : panelRect.bottom - 8);
          safeLeft = panelRect.left + 8;
          safeRight = panelRect.right - 8;

          if (safeRight - safeLeft < menuRect.width) {
            menu.style.maxWidth = Math.max(160, safeRight - safeLeft) + 'px';
            menuRect = menu.getBoundingClientRect();
          }

          left = clampNumber(buttonRect.right - menuRect.width, safeLeft, safeRight - menuRect.width);
          belowTop = buttonRect.bottom + 6;
          aboveTop = buttonRect.top - menuRect.height - 6;

          if (belowTop + menuRect.height <= safeBottom) {
            top = belowTop;
            placement = 'bottom-end';
          } else if (aboveTop >= safeTop) {
            top = aboveTop;
            placement = 'top-end';
          } else {
            top = clampNumber(buttonRect.top + (buttonRect.height / 2) - (menuRect.height / 2), safeTop, safeBottom - menuRect.height);
            left = clampNumber(panelRect.left + (panelRect.width / 2) - (menuRect.width / 2), safeLeft, safeRight - menuRect.width);
            placement = 'center';
          }

          menu.style.left = Math.round(left - panelRect.left) + 'px';
          menu.style.top = Math.round(top - panelRect.top) + 'px';
          menu.setAttribute('data-gg-menu-placement', placement);
          if (wrapper) wrapper.setAttribute('data-gg-menu-placement', placement);
          return placement;
        }

        function openCommentMoreMenu(button) {
          var wrapper = button ? button.closest('.gg-comment-more') : null;
          var commentNode = button ? getCommentNodeFromTrigger(button) : null;
          var panel = button ? button.closest('.gg-sheet__panel, .gg-comments-sheet__panel') : null;
          var menu;

          if (!button || !wrapper || !commentNode) return;

          if (state.commentMoreMenu && state.commentMoreMenu.button === button) {
            closeCommentMoreMenu({ returnFocus: true });
            return;
          }

          closeCommentMoreMenu();
          menu = buildCommentMoreMenu(commentNode);
          (panel || wrapper).appendChild(menu);
          button.setAttribute('aria-expanded', 'true');
          state.commentMoreMenu = {
            button: button,
            menu: menu,
            commentNode: commentNode,
            wrapper: wrapper
          };
          positionCommentMoreMenu(button, menu);

          window.setTimeout(function () {
            var first = menu.querySelector('[role="menuitem"]');
            positionCommentMoreMenu(button, menu);
            if (first) first.focus();
          }, 0);
        }

        function ensureCommentMoreMenus() {
          var root = ui.comments || document.getElementById('gg-comments-root');
          var comments;
          var i;
          var commentNode;
          var header;
          var wrapper;
          var button;
          var enhanced = 0;

          if (!root) return 0;

          comments = root.querySelectorAll('li.comment, .comment-thread .comment, #comments-block > .comment');
          for (i = 0; i < comments.length; i += 1) {
            commentNode = comments[i];
            if (!commentNode) continue;

            header = commentNode.querySelector('.comment-author, .comment-header') || commentNode.querySelector('.comment-block, .comment-footer');
            if (!header) continue;

            wrapper = commentNode.querySelector(':scope .gg-comment-more');
            if (!wrapper) {
              wrapper = document.createElement('span');
              wrapper.className = 'gg-comment-more';
              button = document.createElement('button');
              button.type = 'button';
              button.className = 'gg-comment-more__button';
              button.setAttribute('data-gg-action', 'comment-more');
              button.setAttribute('aria-haspopup', 'menu');
              button.setAttribute('aria-expanded', 'false');
              button.setAttribute('aria-label', 'More comment actions');
              button.textContent = '...';
              wrapper.appendChild(button);
              enhanced += 1;
            }
            if (wrapper.parentNode !== header) header.appendChild(wrapper);
            commentNode.__ggCommentMoreReady = true;
          }

          if (enhanced) {
            state.commentMoreEnhancementCount += enhanced;
            bumpCommentsDebugCounter('moreMenuEnhancements', enhanced);
          }
          return comments.length;
        }

        function delegateNativeDelete(commentNode) {
          var control = getNativeDeleteControl(commentNode);

          if (!control || typeof control.click !== 'function') return false;

          control.click();
          return true;
        }

        function renderCommentRepliesContext(commentNode, count) {
          var author;
          var body;
          var timestamp;
          var avatar;
          var avatarSrc;
          var labelNode;
          var rowNode;
          var avatarNode;
          var copyNode;
          var metaNode;
          var authorNode;
          var timeNode;
          var bodyNode;
          var countNode;
          var replyNode;

          if (!ui.commentRepliesContext) return;

          ui.commentRepliesContext.textContent = '';

          author = getTextFromNode(commentNode, '.comment-author cite, .comment-author, .comment-header cite, .comment-header .user, cite.user') || 'Comment';
          timestamp = getTextFromNode(commentNode, '.datetime, .comment-timestamp, .comment-header time');
          body = getTextFromNode(commentNode, '.comment-body, .comment-content');
          avatar = commentNode ? commentNode.querySelector('.avatar-image-container img, img.author-avatar, .comment-author img, .comment-header img') : null;
          avatarSrc = avatar ? (avatar.currentSrc || avatar.src || avatar.getAttribute('src') || '') : '';

          labelNode = document.createElement('div');
          labelNode.className = 'gg-comment-replies__context-label';
          labelNode.textContent = 'Original comment';
          ui.commentRepliesContext.appendChild(labelNode);

          rowNode = document.createElement('div');
          rowNode.className = 'gg-comment-replies__context-row';

          if (avatarSrc) {
            avatarNode = document.createElement('img');
            avatarNode.className = 'gg-comment-replies__context-avatar';
            avatarNode.alt = '';
            avatarNode.src = avatarSrc;
            rowNode.appendChild(avatarNode);
          } else {
            rowNode.classList.add('gg-comment-replies__context-row--no-avatar');
          }

          copyNode = document.createElement('div');
          copyNode.className = 'gg-comment-replies__context-copy';

          metaNode = document.createElement('div');
          metaNode.className = 'gg-comment-replies__context-meta';

          authorNode = document.createElement('strong');
          authorNode.className = 'gg-comment-replies__context-author';
          authorNode.textContent = author;
          metaNode.appendChild(authorNode);

          if (timestamp) {
            timeNode = document.createElement('span');
            timeNode.textContent = timestamp;
            metaNode.appendChild(timeNode);
          }

          copyNode.appendChild(metaNode);

          if (body) {
            bodyNode = document.createElement('div');
            bodyNode.className = 'gg-comment-replies__context-body';
            bodyNode.textContent = body;
            copyNode.appendChild(bodyNode);
          }

          countNode = document.createElement('div');
          countNode.className = 'gg-comment-replies__context-count';
          countNode.textContent = formatRepliesCount(count).replace(/^View /, '').replace(/^Lihat /, '');
          copyNode.appendChild(countNode);

          replyNode = document.createElement('button');
          replyNode.type = 'button';
          replyNode.className = 'gg-comment-replies__context-reply';
          replyNode.setAttribute('data-gg-action', 'comments-reply-parent');
          replyNode.setAttribute('aria-label', 'Reply to original comment');
          replyNode.textContent = 'Reply';
          if (commentNode) replyNode.setAttribute('data-gg-reply-target', getCommentNodeId(commentNode));
          copyNode.appendChild(replyNode);
          rowNode.appendChild(copyNode);
          ui.commentRepliesContext.appendChild(rowNode);
        }

        function ensureCommentRepliesAddReplyLauncher() {
          var button;
          var parentComment = state.commentRepliesParentComment;
          var parentId = getCommentNodeId(parentComment);

          if (!ui.commentRepliesFooter) return null;

          button = ui.commentRepliesFooter.querySelector('[data-gg-action="comments-add-reply"]');
          if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-gg-action', 'comments-add-reply');
            button.textContent = 'Add a reply';
            ui.commentRepliesFooter.insertBefore(button, ui.commentRepliesFooter.firstChild);
          }
          button.setAttribute('aria-label', 'Add a reply to original comment');
          if (parentId) button.setAttribute('data-gg-reply-target', parentId);
          else button.removeAttribute('data-gg-reply-target');
          return button;
        }

        function handleCommentRepliesParentReply(source) {
          var parentComment = state.commentRepliesParentComment || (state.commentRepliesPortal && state.commentRepliesPortal.parentComment);

          if (!parentComment) return false;
          return replyToCommentNode(parentComment, source || 'parent-context');
        }

        function getRepliesNodeFromTrigger(trigger) {
          var parent;
          var repliesNode;
          if (!trigger) return null;
          if (trigger.__ggRepliesNode && trigger.__ggRepliesNode.parentNode) return trigger.__ggRepliesNode;
          parent = trigger.parentNode;
          repliesNode = trigger.previousElementSibling;
          if (repliesNode && repliesNode.classList && repliesNode.classList.contains('comment-replies')) return repliesNode;
          return parent && parent.querySelector ? parent.querySelector(':scope > .comment-replies, .comment-replies') : null;
        }

        function markReplyLevels(root) {
          var comments = root ? root.querySelectorAll('li.comment, .comment-thread .comment') : [];
          var i;
          var node;
          var level;
          var parent;

          for (i = 0; i < comments.length; i += 1) {
            node = comments[i];
            level = 1;
            parent = node.parentElement;
            while (parent && parent !== root) {
              if (parent.tagName && parent.tagName.toLowerCase() === 'ol') level += 1;
              parent = parent.parentElement;
            }
            node.setAttribute('data-gg-reply-level', String(Math.min(3, Math.max(1, level))));
          }
        }

        function isCommentRepliesSheetOpen() {
          return !!(ui.commentReplies && !ui.commentReplies.hidden && ui.commentReplies.getAttribute('data-gg-state') !== 'closed' && ui.commentReplies.getAttribute('data-gg-state') !== 'closing');
        }

        function focusCommentRepliesSheet() {
          var focusRoot = ui.commentRepliesPanel || ui.commentReplies;
          focusFirst(focusRoot);
        }

        function openCommentRepliesSheet(trigger) {
          var repliesNode;
          var originalParent;
          var commentNode;
          var count;
          var editor;

          if (!ui.commentReplies || !ui.commentRepliesList) return Promise.resolve(null);

          initCommentRepliesControls();
          repliesNode = getRepliesNodeFromTrigger(trigger);
          if (!repliesNode) return Promise.resolve(null);

          if (state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode && isCommentRepliesSheetOpen()) {
            state.commentRepliesIdempotent = true;
            setCommentsLayer('replies');
            state.commentComposerOpen = false;
            ensureCommentRepliesAddReplyLauncher();
            syncCommentComposerMode();
            focusCommentRepliesSheet();
            return Promise.resolve(state.commentRepliesPortal);
          }

          return closeCommentRepliesSheet({
            returnFocus: false,
            reason: 'comment-replies-switch'
          }).then(function () {
            editor = document.getElementById('comment-editor');
            state.commentRepliesReadOnlyEditorSrcBefore = editor ? (editor.getAttribute('src') || editor.src || '') : '';
            state.commentRepliesOpenCount += 1;
            bumpCommentsDebugCounter('repliesOpens');
            originalParent = repliesNode.parentNode;
            count = getCommentReplyCount(repliesNode);
            commentNode = getDirectCommentElement(originalParent, repliesNode);

            if (!originalParent || !count) return null;

            state.commentRepliesPortal = {
              repliesNode: repliesNode,
              originalParent: originalParent,
              originalNextSibling: repliesNode.nextSibling,
              parentComment: commentNode,
              trigger: trigger || document.activeElement || null
            };
            state.commentRepliesParentComment = commentNode;
            state.commentRepliesAutoReplySafe = true;

            renderCommentRepliesContext(commentNode, count);
            ensureCommentRepliesAddReplyLauncher();
            markReplyLevels(repliesNode);
            ui.commentRepliesList.appendChild(repliesNode);
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            ensureCommentMoreMenus();
            state.commentComposerOpen = false;
            syncCommentComposerMode();
            requestCommentPrefixSync();

            ui.commentReplies.hidden = false;
            ui.commentReplies.removeAttribute('inert');
            ui.commentReplies.setAttribute('aria-hidden', 'false');
            ui.commentReplies.setAttribute('data-gg-state', 'opening');
            ui.commentReplies.setAttribute('data-gg-active', 'true');
            setCommentsLayer('replies');

            window.requestAnimationFrame(function () {
              if (state.commentRepliesPortal && state.commentRepliesPortal.repliesNode === repliesNode) {
                ui.commentReplies.setAttribute('data-gg-state', 'open');
                state.commentComposerOpen = false;
                syncCommentComposerMode();
              }
            });
            window.setTimeout(focusCommentRepliesSheet, 24);

            return state.commentRepliesPortal;
          });
        }

        function restoreCommentRepliesPortal() {
          var portal = state.commentRepliesPortal;
          if (!portal || !portal.repliesNode || !portal.originalParent) return false;

          if (portal.originalNextSibling && portal.originalNextSibling.parentNode === portal.originalParent) {
            portal.originalParent.insertBefore(portal.repliesNode, portal.originalNextSibling);
          } else {
            portal.originalParent.appendChild(portal.repliesNode);
          }

          if (portal.trigger) portal.trigger.setAttribute('aria-expanded', 'false');
          state.commentRepliesPortal = null;
          state.commentRepliesParentComment = null;
          return true;
        }

        function closeCommentRepliesSheet(options) {
          var closeOptions = options || {};
          var portal = state.commentRepliesPortal;
          var shouldReturnFocus = closeOptions.returnFocus !== false && portal && portal.trigger && typeof portal.trigger.focus === 'function';

          if (!ui.commentReplies || ui.commentReplies.hidden) {
            restoreCommentRepliesPortal();
            restoreComposerToMainFooter();
            if (ui.comments && !ui.comments.hidden && ui.comments.getAttribute('data-gg-state') !== 'closed') setCommentsLayer('main');
            else setCommentsLayer('closed');
            return Promise.resolve(false);
          }

          if (state.commentRepliesTimer) {
            window.clearTimeout(state.commentRepliesTimer);
            state.commentRepliesTimer = 0;
          }

          ui.commentReplies.setAttribute('data-gg-state', 'closing');
          ui.commentReplies.setAttribute('data-gg-active', 'false');
          closeCommentMoreMenu();

          return new Promise(function (resolve) {
            state.commentRepliesTimer = window.setTimeout(function () {
              state.commentRepliesTimer = 0;
              restoreCommentRepliesPortal();
              ui.commentReplies.hidden = true;
              ui.commentReplies.setAttribute('inert', '');
              ui.commentReplies.setAttribute('aria-hidden', 'true');
              ui.commentReplies.setAttribute('data-gg-state', 'closed');
              ui.commentReplies.removeAttribute('data-gg-active');
              if (ui.commentRepliesContext) ui.commentRepliesContext.textContent = '';
              clearCommentReplyContext();
              restoreComposerToMainFooter();
              if (ui.comments && !ui.comments.hidden && ui.comments.getAttribute('data-gg-state') !== 'closed' && ui.comments.getAttribute('data-gg-state') !== 'closing') setCommentsLayer('main');
              else setCommentsLayer('closed');
              if (shouldReturnFocus) portal.trigger.focus();
              resolve(true);
            }, 170);
          });
        }

        function normalizeHashId(value) {
          var raw = String(value || '').replace(/^#/, '');
          try {
            return decodeURIComponent(raw);
          } catch (error) {
            return raw;
          }
        }

        function isCommentsHash(value) {
          var hash = String(value || window.location.hash || '');
          var id = normalizeHashId(hash);
          return id === 'comments' || id === 'comment-form' || /^c\d+/.test(id);
        }

        function findCommentsHashTarget(hash) {
          var id = normalizeHashId(hash || window.location.hash);
          if (id === 'comment-form') {
            return document.getElementById('comment-form') || document.getElementById('top-ce') || document.querySelector('[name="comment-form"]');
          }
          return document.getElementById(id);
        }

        function scrollCommentsHashTarget(hash, options) {
          var scrollOptions = options || {};
          var target = findCommentsHashTarget(hash);

          if (!target || typeof target.scrollIntoView !== 'function') return null;

          target.scrollIntoView({
            block: scrollOptions.block || 'start'
          });

          return target;
        }

        function openComposer(options) {
          var composerOptions = options || {};

          if (composerOptions.clearReply !== false) clearCommentReplyContext();
          setComposerOpen(true);

          return openCommentsSheet({
            trigger: composerOptions.trigger,
            focus: composerOptions.focus !== false,
            reason: composerOptions.reason || 'comments-composer-open'
          }).then(function (panel) {
            ensureComposerInActiveFooter();
            window.setTimeout(function () {
              scrollCommentsHashTarget('#comment-form');
            }, 32);
            return panel;
          });
        }

        function syncCommentsHash() {
          var hash = window.location.hash || '';
          var id = normalizeHashId(hash);

          if (!isCommentsHash(hash) || !getPanel('comments')) return Promise.resolve(null);

          if (id === 'comment-form') {
            return openComposer({
              focus: false,
              reason: 'comments-hash-composer'
            });
          }

          return openCommentsSheet({
            focus: false,
            reason: 'comments-hash'
          }).then(function (panel) {
            window.setTimeout(function () {
              scrollCommentsHashTarget(hash);
            }, 32);
            return panel;
          });
        }

        function trapFocusWhileOpen(event) {
          var activePanel = getPanel(state.panelActive);
          var focusable;
          var firstNode;
          var lastNode;
          var focusRoot;

          if (!event || event.key !== 'Tab') {
            return false;
          }

          if (isCommentRepliesSheetOpen()) {
            focusRoot = ui.commentRepliesPanel;
          } else if (activePanel && activePanel.trapFocus && activePanel.panel) {
            focusRoot = activePanel.panel;
          }

          if (!focusRoot) return false;

          focusable = getFocusableNodes(focusRoot);
          if (!focusable.length) return false;

          firstNode = focusable[0];
          lastNode = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === firstNode) {
            event.preventDefault();
            lastNode.focus();
            return true;
          }

          if (!event.shiftKey && document.activeElement === lastNode) {
            event.preventDefault();
            firstNode.focus();
            return true;
          }

          return false;
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
