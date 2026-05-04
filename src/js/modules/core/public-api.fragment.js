        GG.copy = {
          locales: COPY,
          locale: state.locale,
          supported: FEED_PREREQUISITES.supportedLocales,
          get: getCopy,
          setLocale: setLocale
        };

        GG.phase0 = {
          routeVocabulary: ROUTE_VOCABULARY_CONTRACT,
          surfaceLedger: SURFACE_LEDGER,
          feedPrerequisites: FEED_PREREQUISITES,
          currentSurface: null
        };

        GG.command = {
          focus: focusCommand,
          render: renderDiscovery,
          open: function () {
            if (!ui.commandSheetInput) return Promise.resolve(null);
            return launchDiscovery(document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, 'command-api-open', {
              focusSheet: true
            });
          },
          close: function () {
            return closeCommandPanel('command-api-close');
          },
          topics: {
            snapshot: function (query) {
              var resolvedQuery = typeof query === 'string' ? query : getCommandValue();
              var topics = buildDiscoveryTopics(resolvedQuery);

              return {
                mode: shouldGroupDiscoveryTopics(topics) ? 'grouped' : DISCOVERY_TOPIC_LAYOUT_CONTRACT.defaultMode,
                count: topics.length,
                groupedThreshold: DISCOVERY_TOPIC_LAYOUT_CONTRACT.groupedThreshold
              };
            }
          }
        };

        GG.preview = {
          open: function (row, trigger) {
            return openPreview(row, trigger, 'preview-api-open');
          },
          close: function () {
            return closePanel('preview', { reason: 'preview-api-close' });
          }
        };

        GG.detailOutline = {
          open: function () {
            markDetailOutlineManualOpen();
            setDetailOutlineState('expanded');
          },
          close: function () {
            clearDetailOutlineManualOpen();
            setDetailOutlineState(resolveDetailOutlineCompactState());
            restoreDetailOutlineToggleFocus();
          },
          toggle: toggleDetailOutline,
          setState: setDetailOutlineState,
          snapshot: detailOutlineSnapshot
        };

        GG.panelController = {
          open: function (name, options) {
            var panelOptions = options || {};
            if (name === 'command') {
              return launchDiscovery(panelOptions.trigger || document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput, panelOptions.reason || 'panel-controller-open', {
                focusSheet: panelOptions.focus !== false,
                selectText: !!panelOptions.selectText
              }).then(function () {
                return getPanel('command');
              });
            }
            return openPanel(name, panelOptions);
          },
          close: function (name, options) {
            if (name === 'command') {
              return closeCommandPanel((options && options.reason) || 'panel-controller-close', options);
            }
            return closePanel(name, options);
          },
          snapshot: panelSnapshot,
          isOpen: function (name) {
            return state.panelActive === name;
          },
          active: function () {
            return state.panelActive;
          }
        };

        GG.sheetController = GG.panelController;

        GG.contracts = {
          command: COMMAND_PANEL_CONTRACT,
          utilitySheet: UTILITY_SHEET_CONTRACT,
          search: SEARCH_DATA_CONTRACT,
          preview: PREVIEW_DATA_CONTRACT,
          bottomSafeZone: BOTTOM_SAFE_ZONE_CONTRACT,
          panelHeight: PANEL_HEIGHT_CONTRACT,
          detailToolbar: DETAIL_TOOLBAR_CONTRACT,
          detailOutline: DETAIL_OUTLINE_CONTRACT,
          error404Surface: ERROR404_SURFACE_CONTRACT,
          searchEmptyFallback: SEARCH_EMPTY_FALLBACK_CONTRACT,
          error: ERROR_RUNTIME_CONTRACT,
          listingGrowth: LISTING_GROWTH_CONTRACT
        };

        GG.runtime = {
          surface: function () {
            return state.surfaceContext;
          },
          error: function () {
            return state.errorContract;
          },
          special: function () {
            return state.specialContract;
          },
          theme: function () {
            return state.theme;
          },
          error404: error404Snapshot,
          searchEmpty: searchEmptySnapshot,
          outline: detailOutlineSnapshot,
          listingGrowth: function () {
            return {
              state: state.listingGrowthState,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl()
            };
          }
        };

        GG.ledger = {
          activeLegacyBridges: ACTIVE_LEGACY_BRIDGES.slice(),
          closedBridges: CLOSED_BRIDGES.slice(),
          legacyBridges: ACTIVE_LEGACY_BRIDGES.concat(CLOSED_BRIDGES)
        };

        GG.pwa = {
          clearCaches: function () {
            var gate = buildPwaActionGate('clearCaches');

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            return clearPwaCaches({
              preserveSaved: true
            }).then(function (deletedCaches) {
              return refreshPwaCacheAudit().then(function () {
                return {
                  ok: true,
                  action: gate.action,
                  mode: gate.mode,
                  ggdebug: gate.ggdebug,
                  savedCachesPreserved: true,
                  deletedCaches: deletedCaches,
                  cache: pwaCacheSnapshot()
                };
              });
            });
          },
          unregister: function () {
            var gate = buildPwaActionGate('unregister');

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            return unregisterPwaServiceWorkers().then(function (count) {
              pwaState.registered = false;
              pwaState.controlling = false;
              pwaState.waiting = false;
              return {
                ok: true,
                action: gate.action,
                mode: gate.mode,
                ggdebug: gate.ggdebug,
                unregistered: count
              };
            });
          },
          reset: function (options) {
            var resetOptions = options || {};
            var shouldReload = resetOptions.reload !== false;
            var gate = buildPwaActionGate('reset', {
              hardReset: true
            });

            if (!gate.allowed) {
              return Promise.resolve(gate);
            }

            try {
              window.sessionStorage.removeItem('gg:pwa:landing-redirected');
            } catch (error) {}

            // Hard reset is the only client path allowed to remove gg-saved-* caches.
            return clearPwaCaches({
              preserveSaved: false
            }).then(function (deletedCaches) {
              return unregisterPwaServiceWorkers().then(function (count) {
                pwaState.registered = false;
                pwaState.controlling = false;
                pwaState.waiting = false;
                pwaState.updateAvailable = false;
                pwaState.cacheNames = [];
                pwaState.offlineCached = false;
                pwaState.landingCached = false;
                pwaState.landingVariantsCached = [];
                pwaState.lastCacheMode = 'unknown';
                pwaState.lastCachePath = '';
                writeBodyState('data-gg-cache-mode', 'unknown');

                if (shouldReload) {
                  window.location.replace(window.location.href);
                }

                return {
                  ok: true,
                  action: gate.action,
                  mode: gate.mode,
                  ggdebug: gate.ggdebug,
                  hardReset: true,
                  deletedCaches: deletedCaches,
                  unregistered: count,
                  reloading: shouldReload
                };
              });
            });
          }
        };

        GG.qa = {
          manualMatrix: QA_MANUAL_MATRIX,
          legacyBridges: {
            active: ACTIVE_LEGACY_BRIDGES.slice(),
            closed: CLOSED_BRIDGES.slice()
          },
          routeTargets: getRouteTargets,
          snapshot: qaSnapshot,
          checklist: buildSmokeChecklist,
          runSmoke: runSmoke,
          exercisePanels: exerciseSmokePanels,
          runRouteMatrix: runRouteMatrix,
          getVerificationProcedure: buildVerificationProcedure,
          printVerificationProcedure: formatVerificationProcedure,
          startup: startupSnapshot,
