          ui.commandSheetForm.addEventListener('submit', handleCommandSubmit);
        }

        document.addEventListener('pointerdown', function (event) {
          var target = event.target.closest(PRESS_SELECTOR);
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          if (target) {
            clearPressState();
            state.pressTarget = target;
            target.setAttribute('data-gg-press', 'active');
          }
          startDetailOutlineGesture(event);
          startDrag(event);
        }, true);

        document.addEventListener('pointermove', moveDrag, { passive: false });
        document.addEventListener('pointerup', function (event) {
          clearPressState();
          endDetailOutlineGesture(event);
          endDrag(event);
        }, true);
        document.addEventListener('pointercancel', function (event) {
          clearPressState();
          state.detailOutlineGesture = null;
          endDrag(event);
        }, true);
        window.addEventListener('blur', clearPressState);

        document.addEventListener('click', function (event) {
          var focusTrigger;
          var previewTrigger;
          var moreTrigger;
          var commentsTrigger;
          var langTrigger;
          var themeTrigger;
          var closeTrigger;
          var discoveryTabTrigger;
          var discoveryTopicToggle;
          var discoveryTopicApply;
          var discoveryTopicBack;
          var discoveryTopicClear;
          var discoveryResult;
          var discoverySubmit;
          var searchEmptyAction;
          var error404Action;
          var detailOutlineToggle;
          var detailOutlineTarget;

          if (shouldSuppressDocumentClick(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          focusTrigger = event.target.closest('[data-gg-focus="command"]');
          previewTrigger = event.target.closest('[data-gg-open="preview"]');
          moreTrigger = event.target.closest('[data-gg-open="more"]');
          commentsTrigger = event.target.closest('[data-gg-open="comments"]');
          langTrigger = event.target.closest('[data-gg-lang-option]');
          themeTrigger = event.target.closest('[data-gg-theme-option]');
          closeTrigger = event.target.closest('[data-gg-close]');
          discoveryTabTrigger = event.target.closest('[data-gg-command-tab]');
          discoveryTopicToggle = event.target.closest('[data-gg-topic-group-toggle]');
          discoveryTopicApply = event.target.closest('[data-gg-topic-key]');
          discoveryTopicBack = event.target.closest('[data-gg-topic-back]');
          discoveryTopicClear = event.target.closest('[data-gg-topic-clear]');
          discoveryResult = event.target.closest('[data-gg-discovery-href]');
          discoverySubmit = event.target.closest('[data-gg-discovery-submit]');
          searchEmptyAction = event.target.closest('[data-gg-search-empty-action]');
          error404Action = event.target.closest('[data-gg-error404-action]');
          detailOutlineToggle = event.target.closest('[data-gg-outline-toggle]');
          detailOutlineTarget = event.target.closest('[data-gg-outline-target]');

          if (focusTrigger) {
            event.preventDefault();
            launchDiscovery(focusTrigger, 'command-trigger', {
              focusSheet: true,
              selectText: true
            });
            return;
          }

          if (discoveryTabTrigger) {
            event.preventDefault();
            setDiscoveryTab(discoveryTabTrigger.getAttribute('data-gg-command-tab'));
            return;
          }

          if (discoveryTopicToggle) {
            event.preventDefault();
            toggleDiscoveryGroup(discoveryTopicToggle.getAttribute('data-gg-topic-group-toggle'));
            return;
          }

          if (discoveryTopicApply) {
            event.preventDefault();
            setDiscoveryTopic(discoveryTopicApply.getAttribute('data-gg-topic-key'), {
              clearQuery: true
            });
            return;
          }

          if (discoveryTopicBack) {
            event.preventDefault();
            returnToDiscoveryTopics();
            return;
          }

          if (discoveryTopicClear) {
            event.preventDefault();
            clearDiscoveryTopic();
            return;
          }

          if (detailOutlineToggle) {
            event.preventDefault();
            toggleDetailOutline();
            return;
          }

          if (detailOutlineTarget) {
            event.preventDefault();
            scrollToDetailOutlineTarget(detailOutlineTarget.getAttribute('data-gg-outline-target'));
            return;
          }

          if (previewTrigger) {
            event.preventDefault();
            openPreview(previewTrigger.closest(LISTING_ROW_BASE_SELECTOR), previewTrigger, 'preview-trigger');
            return;
          }

          if (moreTrigger) {
            event.preventDefault();
            if (state.panelActive === 'more') {
              closePanel('more', { reason: 'more-toggle' });
            } else {
              openPanel('more', {
                trigger: moreTrigger,
                reason: 'more-trigger'
              });
            }
            return;
          }

          if (commentsTrigger) {
            event.preventDefault();
            if (state.panelActive === 'comments') {
              closePanel('comments', { reason: 'comments-toggle' });
            } else {
              openPanel('comments', {
                trigger: commentsTrigger,
                reason: 'comments-trigger'
              });
            }
            return;
          }

          if (langTrigger) {
            event.preventDefault();
            setLocale(langTrigger.getAttribute('data-gg-lang-option'));
            return;
          }

          if (themeTrigger) {
            event.preventDefault();
            setTheme(themeTrigger.getAttribute('data-gg-theme-option'));
            return;
          }

          if (closeTrigger) {
            event.preventDefault();
            if (closeTrigger.getAttribute('data-gg-close') === 'command') {
              closeCommandPanel('close-trigger');
            } else {
              closePanel(closeTrigger.getAttribute('data-gg-close'), { reason: 'close-trigger' });
            }
            return;
          }

          if (discoveryResult) {
            window.location.href = discoveryResult.getAttribute('data-gg-discovery-href');
            return;
          }

          if (discoverySubmit) {
            event.preventDefault();
            submitCommandSearch(getCommandValue());
            return;
          }

          if (searchEmptyAction) {
            event.preventDefault();
            handleSearchEmptyAction(searchEmptyAction.getAttribute('data-gg-search-empty-action'));
            return;
          }

          if (error404Action) {
            event.preventDefault();
            handleError404Action(error404Action.getAttribute('data-gg-error404-action'));
            return;
          }

          if (state.panelActive === 'command' && !event.target.closest('#gg-command-panel')) {
            closeCommandPanel('command-outside');
          }
        });

        document.addEventListener('keydown', function (event) {
          var activePanel = getPanel(state.panelActive);
          var focusable;
          var firstNode;
          var lastNode;

          if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
            event.preventDefault();
            launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-shortcut', {
              focusSheet: true,
              selectText: true
            });
            return;
          }

          if (event.key === 'Escape') {
            if (state.panelActive === 'command') {
              closeCommandPanel('command-escape');
            } else if (!state.panelActive && isDetailOutlineExpanded()) {
              clearDetailOutlineManualOpen();
              setDetailOutlineState(resolveDetailOutlineCompactState());
              restoreDetailOutlineToggleFocus();
            } else {
              closePanel(state.panelActive, { reason: 'escape-close' });
            }
            return;
          }

          if (event.key !== 'Tab' || !activePanel || !activePanel.trapFocus || !activePanel.panel) {
            return;
          }

          focusable = getFocusableNodes(activePanel.panel);
          if (!focusable.length) return;

          firstNode = focusable[0];
          lastNode = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === firstNode) {
            event.preventDefault();
            lastNode.focus();
          } else if (!event.shiftKey && document.activeElement === lastNode) {
            event.preventDefault();
            firstNode.focus();
          }
        });

