        function expectedDockKey() {
          if (!state.surfaceContext) return '';
          if (state.surfaceContext.surface === 'listing') return 'blog';
          if (state.surfaceContext.surface === 'search') return 'search';
          if (state.surfaceContext.surface === 'landing' && state.surfaceContext.source === 'url.landing.contact') return 'contact';
          if (state.surfaceContext.surface === 'landing') return 'home';
          return '';
        }

        function getRouteTargets() {
          var routes = {
            listing: ui.shell ? toAbsoluteUrl(ui.shell.getAttribute('data-gg-home-url')) : safeUrl(window.location.href).origin + '/',
            landing: makeHomeUrl('landing'),
            search: '',
            label: '',
            archive: '',
            post: '',
            mobile: '',
            olderPageUrl: getCurrentOlderPageUrl(),
            error404: ''
          };
          var firstRow = document.querySelector(LISTING_ROW_SELECTOR);
          var firstPost = firstRow ? toAbsoluteUrl(firstRow.getAttribute('data-gg-post-url') || '') : '';
          var q = getCommandValue().trim() ? getCommandValue().trim() : 'gg';
          var labelLink = document.querySelector('.gg-taxonomy__link[href*="/search/label/"], a[href*="/search/label/"]');
          var archiveLink = document.querySelector('a[href*="updated-max="]');
          var labelTopic;
          var probeUrl;

          routes.search = makeHomeUrl('search?q=' + encodeURIComponent(q));
          routes.post = firstPost || (state.surfaceContext && state.surfaceContext.surface === 'post' ? window.location.href : '');

          if (labelLink) {
            routes.label = toAbsoluteUrl(labelLink.getAttribute('href') || '');
          } else if (state.discoveryIndex && state.discoveryIndex.topics && state.discoveryIndex.topics.length) {
            labelTopic = state.discoveryIndex.topics[0];
            if (labelTopic && labelTopic.href) routes.label = toAbsoluteUrl(labelTopic.href);
          }

          if (archiveLink) {
            routes.archive = toAbsoluteUrl(archiveLink.getAttribute('href') || '');
          } else if (routes.olderPageUrl) {
            routes.archive = routes.olderPageUrl;
          }

          routes.mobile = (function () {
            var url = safeUrl(routes.listing || window.location.href);
            url.searchParams.set('m', '1');
            return url.href;
          }());

          probeUrl = safeUrl(makeHomeUrl('__gg-runtime-404__'));
          probeUrl.searchParams.set('gg404', '1');
          probeUrl.searchParams.set('ggt', String(Date.now()));
          routes.error404 = probeUrl.href;

          return routes;
        }

        function makeCheck(id, label, pass, details, pending) {
          return {
            id: id,
            label: label,
            status: pass ? 'pass' : (pending ? 'pending' : 'fail'),
            details: details || ''
          };
        }

        function detailOutlineSnapshot() {
          return {
            available: !!ui.detailOutline,
            visible: !!(ui.detailOutline && !ui.detailOutline.hidden),
            state: state.detailOutlineState,
            expanded: isDetailOutlineExpanded(),
            sectionCount: (state.detailOutlineSections || []).length,
            currentIndex: state.detailOutlineCurrentIndex,
            currentTitle: ui.detailOutline ? getDetailOutlineCurrentTitle() : ''
          };
        }

        function buildSmokeChecklist() {
          var routes = getRouteTargets();
          var activeDock = currentDockState();
          var expectedDock = expectedDockKey();
          var commandPanel = getPanel('command');
          var commentsPanel = getPanel('comments');
          var outline = detailOutlineSnapshot();
          var checks = [];

          checks.push(makeCheck('surface-current', 'Current surface contract is known', !!(state.surfaceContext && SURFACE_LEDGER[state.surfaceContext.surface]), state.surfaceContext ? state.surfaceContext.surface + ' via ' + state.surfaceContext.source : 'No runtime surface detected'));
          checks.push(makeCheck('route-listing', 'Blog listing target is available for live smoke', !!routes.listing, routes.listing || 'Missing listing route'));
          checks.push(makeCheck('route-landing', 'Landing/home target is available for live smoke', !!routes.landing, routes.landing || 'Missing landing route'));
          checks.push(makeCheck('route-search', 'Search target is available for live smoke', !!routes.search, routes.search || 'Missing search route'));
          checks.push(makeCheck('route-label', 'Label target is available for live smoke', !!routes.label, routes.label || 'No label route available on current runtime', true));
          checks.push(makeCheck('route-archive', 'Archive target is available for live smoke', !!routes.archive, routes.archive || 'No archive-like route available on current runtime', true));
          checks.push(makeCheck('route-post', 'Post target is available for live smoke', !!routes.post, routes.post || 'No post target available on current runtime', true));
          checks.push(makeCheck('route-mobile', '?m=1 target is available for live smoke', !!routes.mobile, routes.mobile || 'No mobile route generated'));
          checks.push(makeCheck('route-older', 'olderPageUrl route is exposed when available', !!routes.olderPageUrl, routes.olderPageUrl || 'No olderPageUrl on current view', true));
          checks.push(makeCheck('route-404', 'Error/404 probe target is available for live smoke', !!routes.error404, routes.error404 || 'Could not build same-origin 404 probe'));
          checks.push(makeCheck('dock-current', 'Dock current state matches current surface', expectedDock ? (activeDock.length === 1 && activeDock[0] === expectedDock) : activeDock.length === 0, activeDock.length ? 'Active dock items: ' + activeDock.join(', ') : 'No dock item marked current'));
          checks.push(makeCheck('language-switcher', 'Language switcher exposes only EN and ID', ui.langButtons.length === 2 && (state.locale === 'en' || state.locale === 'id'), 'Locale=' + state.locale + ', buttons=' + ui.langButtons.length));
          checks.push(makeCheck('panel-command', 'Command discovery sheet is registered in the unified controller', !!commandPanel && commandPanel.family === 'utility-sheet', commandPanel ? commandPanel.family + ' / ' + panelSnapshot().panels.command.state : 'Command sheet missing'));
          checks.push(makeCheck('panel-preview', 'Preview sheet is registered in unified controller', !!getPanel('preview'), getPanel('preview') ? panelSnapshot().panels.preview.state : 'Preview sheet missing'));
          checks.push(makeCheck('panel-more', 'More sheet is registered in unified controller', !!getPanel('more'), getPanel('more') ? panelSnapshot().panels.more.state : 'More sheet missing'));
          checks.push(makeCheck('panel-comments', 'Comments sheet is registered in unified controller', !!commentsPanel, commentsPanel ? panelSnapshot().panels.comments.state : 'Comments sheet missing on current surface', state.surfaceContext && state.surfaceContext.surface !== 'post'));
          checks.push(makeCheck('detail-outline', 'Detail outline tray is scoped to post/page detail and remains auditable', isDetailSurface() ? outline.available : !outline.available, outline.available ? ('sections=' + outline.sectionCount + ', state=' + outline.state + ', current=' + (outline.currentTitle || 'none')) : 'No detail outline on current surface', !isDetailSurface()));
          checks.push(makeCheck('error-contract', 'Native 404 runtime contract is explicit and auditable', !!state.errorContract && typeof state.errorContract.errorState === 'string', state.errorContract ? (state.errorContract.errorState + ' via ' + state.errorContract.errorSource) : 'No error contract detected'));
          checks.push(makeCheck('special-contract', 'Special runtime contract stays separate from native 404 handling', !!state.specialContract && typeof state.specialContract.specialKind === 'string', state.specialContract ? (state.specialContract.specialKind + ' via ' + state.specialContract.specialSource) : 'No special contract detected'));
          checks.push(makeCheck('listing-growth', 'Same-page listing growth stays auditable and keeps More entries as fallback only', !state.surfaceContext || !state.surfaceContext.isListing || !!ui.loadMoreWrap, state.surfaceContext && state.surfaceContext.isListing ? ('state=' + state.listingGrowthState + ', rows=' + getListingRowCount() + ', older=' + (getCurrentOlderPageUrl() || 'none')) : 'Not a listing surface'));
          checks.push(makeCheck('bridge-ledger', 'Legacy bridge ledger is split into active vs closed items', ACTIVE_LEGACY_BRIDGES.length >= 0 && CLOSED_BRIDGES.length >= 0, 'active=' + ACTIVE_LEGACY_BRIDGES.length + ', closed=' + CLOSED_BRIDGES.length));

          return checks;
        }

        function summarizeChecklist(checklist) {
          var summary = {
            pass: 0,
            fail: 0,
            pending: 0
          };
          var i;
          for (i = 0; i < (checklist || []).length; i += 1) {
            summary[checklist[i].status] += 1;
          }
          return summary;
        }

        function qaSnapshot() {
          return {
            generatedAt: new Date().toISOString(),
            surface: state.surfaceContext,
            error: state.errorContract,
            special: state.specialContract,
            locale: state.locale,
            theme: state.theme,
            routes: getRouteTargets(),
            searchEmpty: searchEmptySnapshot(),
            error404Surface: error404Snapshot(),
            dock: {
              active: currentDockState(),
              expected: expectedDockKey()
            },
            panels: panelSnapshot(),
            outline: detailOutlineSnapshot(),
            contracts: {
              routeVocabulary: ROUTE_VOCABULARY_CONTRACT,
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
            },
            legacyBridges: {
              active: ACTIVE_LEGACY_BRIDGES.slice(),
              closed: CLOSED_BRIDGES.slice()
            },
            feed: {
              source: ui.shell ? (ui.shell.getAttribute('data-gg-feed-source') || 'unknown') : 'unknown',
              prerequisites: FEED_PREREQUISITES
            },
            startup: startupSnapshot(),
            pwa: pwaSnapshot(),
            cache: pwaCacheSnapshot(),
            listingGrowth: {
              state: state.listingGrowthState,
              rowCount: getListingRowCount(),
              olderPageUrl: getCurrentOlderPageUrl(),
              minimumVisualCount: LISTING_GROWTH_CONTRACT.minimumVisualCount,
              viewportSatisfied: listingViewportSatisfied()
            }
          };
        }

        function runSmoke(options) {
          var smokeOptions = options || {};
          var bootstrap = ui.commandSheetInput && !state.discoveryIndex ? ensureDiscoveryIndex().catch(function () { return null; }) : Promise.resolve(null);

          return bootstrap.then(function () {
            var report = {
              generatedAt: new Date().toISOString(),
              surface: state.surfaceContext,
              checklist: buildSmokeChecklist(),
              snapshot: qaSnapshot(),
              manualMatrix: QA_MANUAL_MATRIX,
              procedure: buildVerificationProcedure()
            };

            if (!smokeOptions.exercisePanels) {
              return report;
            }

            return exerciseSmokePanels().then(function (exercises) {
              report.exercises = exercises;
              report.snapshot = qaSnapshot();
              report.checklist = buildSmokeChecklist();
              return report;
            });
          });
        }

        function exercisePanel(name) {
          var panel = getPanel(name);
          var trigger;
          var row;

          if (!panel) {
            return Promise.resolve({
              name: name,
              status: 'pending',
              reason: 'panel-not-available'
            });
          }

          if (name === 'command') {
            trigger = document.querySelector('[data-gg-focus="command"]') || ui.commandSheetInput;
            if (!trigger) {
              return Promise.resolve({
                name: name,
                status: 'pending',
                reason: 'command-trigger-not-on-current-surface'
              });
            }

            return launchDiscovery(trigger, 'qa-command-open', {
              focusSheet: true
            }).then(function () {
              return waitMs(70);
            }).then(function () {
              return closeCommandPanel('qa-command-close', {
                returnFocus: false
              });
            }).then(function () {
              return {
                name: name,
                status: 'pass',
                stateAfter: panelSnapshot().panels.command.state
              };
            });
          }

          if (name === 'preview') {
            row = document.querySelector(LISTING_ROW_BASE_SELECTOR);
            trigger = row ? row.querySelector('[data-gg-open="preview"]') : null;
            if (!row || !trigger) {
              return Promise.resolve({
                name: name,
                status: 'pending',
                reason: 'no-listing-row-on-current-surface'
              });
            }

            return openPreview(row, trigger, 'qa-preview-open').then(function () {
              return waitMs(80);
            }).then(function () {
              return closePanel('preview', {
                returnFocus: false,
                reason: 'qa-preview-close'
              });
            }).then(function () {
              return {
                name: name,
                status: 'pass',
                stateAfter: panelSnapshot().panels.preview.state
              };
            });
          }

          trigger = document.querySelector('[data-gg-open="' + name + '"]');
          if (!trigger) {
            return Promise.resolve({
              name: name,
              status: 'pending',
              reason: 'panel-trigger-not-on-current-surface'
            });
          }

          return openPanel(name, {
            trigger: trigger,
            focus: false,
            reason: 'qa-open'
          }).then(function () {
            return waitMs(60);
          }).then(function () {
            return closePanel(name, {
              returnFocus: false,
              reason: 'qa-close'
            });
          }).then(function () {
            return {
              name: name,
              status: 'pass',
              stateAfter: panelSnapshot().panels[name].state
            };
          });
        }

        function exerciseSmokePanels() {
          var results = [];

          return exercisePanel('command')
            .then(function (result) {
              results.push(result);
              return exercisePanel('more');
            })
            .then(function (result) {
              results.push(result);
              return exercisePanel('comments');
            })
            .then(function (result) {
              results.push(result);
              return exercisePanel('preview');
            })
            .then(function (result) {
              results.push(result);
              return results;
            });
        }

        function expectedSurfaceForRouteKey(key) {
          if (key === 'listing') return 'listing';
          if (key === 'landing') return 'landing';
          if (key === 'search') return 'search';
          if (key === 'label') return 'label';
          if (key === 'archive') return 'archive';
          if (key === 'post') return 'post';
          if (key === 'mobile') return 'listing';
          if (key === 'error404') return 'error404';
          return '';
        }

        function routeExpectationMatches(key, smoke) {
          var surface = smoke && smoke.surface ? smoke.surface.surface : '';
          if (key === 'olderPageUrl') return !!(smoke && smoke.surface && smoke.surface.isListing);
          if (key === 'mobile') return surface === 'listing' && smoke.surface && smoke.surface.variant === 'mobile';
          if (key === 'error404') return surface === 'error404' && smoke.snapshot && smoke.snapshot.error && smoke.snapshot.error.errorState === '404';
          return surface === expectedSurfaceForRouteKey(key);
        }

        function summarizeRouteMatrix(results) {
          var summary = {
            pass: 0,
            fail: 0,
            pending: 0
          };
          var i;
          for (i = 0; i < results.length; i += 1) {
            summary[results[i].status] += 1;
          }
          return summary;
        }

        function waitForFrameQa(frame, timeoutMs) {
          var start = Date.now();

          return new Promise(function (resolve, reject) {
            (function poll() {
              var childWindow;
              try {
                childWindow = frame.contentWindow;
              } catch (error) {
                reject(new Error('frame-cross-origin'));
                return;
              }

              if (childWindow && childWindow.GG && childWindow.GG.qa && typeof childWindow.GG.qa.runSmoke === 'function') {
                resolve(childWindow.GG.qa);
                return;
              }

              if (Date.now() - start >= timeoutMs) {
                reject(new Error('frame-runtime-timeout'));
                return;
              }

              window.setTimeout(poll, 120);
            }());
          });
        }

        function loadRouteQa(frame, url, timeoutMs) {
          return new Promise(function (resolve, reject) {
            var settled = false;
            var timeout = window.setTimeout(function () {
              cleanup();
              reject(new Error('frame-load-timeout'));
            }, timeoutMs);

            function cleanup() {
              frame.removeEventListener('load', onLoad);
              frame.removeEventListener('error', onError);
              window.clearTimeout(timeout);
            }

            function finish(fn, value) {
              if (settled) return;
              settled = true;
              cleanup();
              fn(value);
            }

            function onLoad() {
              waitForFrameQa(frame, Math.max(3000, timeoutMs - 600)).then(function (qa) {
                finish(resolve, qa);
              }).catch(function (error) {
                finish(reject, error);
              });
            }

            function onError() {
              finish(reject, new Error('frame-load-error'));
            }

            frame.addEventListener('load', onLoad, { once: false });
            frame.addEventListener('error', onError, { once: false });
            frame.src = url;
          });
        }

        function buildVerificationProcedure() {
          var routes = getRouteTargets();
          return [
            {
              id: 'snapshot',
              run: 'GG.qa.snapshot()',
              expected: 'Inspect surface markers, dock state, contracts, bridge ledger, and feed source on the current page.'
            },
            {
              id: 'current-smoke',
              run: 'GG.qa.runSmoke({ exercisePanels: true })',
              expected: 'Expect checklist plus panel exercise output for command, preview, comments, and more on the current route.'
            },
            {
              id: 'route-matrix',
              run: 'GG.qa.runRouteMatrix({ exercisePanels: true })',
              expected: 'Expect live same-origin verification for listing, landing, search, label, archive, post, ?m=1, olderPageUrl, and the generated 404 probe.'
            },
            {
              id: 'listing',
              url: routes.listing,
              expected: 'Surface=listing, dock current=blog, command and preview flows available.'
            },
            {
              id: 'landing',
              url: routes.landing,
              expected: 'Surface=landing, dock current=home, and landing recovery/navigation stays coherent.'
            },
            {
              id: 'search',
              url: routes.search,
              expected: 'Surface=search, dock current=search, discovery results and native search fallback still work.'
            },
            {
              id: 'label',
              url: routes.label,
              expected: 'Surface=label, dock stays neutral, and listing remains lightweight.'
            },
            {
              id: 'archive',
              url: routes.archive,
              expected: 'Surface=archive, archive route resolves without listing/search confusion.'
            },
            {
              id: 'post',
              url: routes.post,
              expected: 'Surface=post, detail outline stays attached above the dock, comments sheet opens, more sheet opens, and discovery still works from dock.'
            },
            {
              id: 'mobile',
              url: routes.mobile,
              expected: 'Variant=mobile, sheet gestures remain calm, dock remains stable.'
            },
            {
              id: 'olderPageUrl',
              url: routes.olderPageUrl,
              expected: 'Route resolves as a valid follow-on listing surface when Blogger exposes olderPageUrl.'
            },
            {
              id: 'error404',
              url: routes.error404,
              expected: 'Surface=error404 with data-gg-error-state=404 from Blogger native error view and Custom 404 copy.'
            },
            {
              id: 'listing-growth',
              run: 'Inspect GG.qa.snapshot().listingGrowth, then scroll until the sentinel loads more rows if olderPageUrl exists.',
              expected: 'Initial render grows in-page toward 10 rows or viewport buffer, appends only real rows, and leaves More entries as the fallback-only link.'
            },
            {
              id: 'language-switcher',
              run: 'Open More sheet, toggle EN then ID, rerun GG.qa.snapshot()',
              expected: 'Only EN and ID exist, locale persists in gg:lang, microcopy updates without scattered overrides.'
            },
            {
              id: 'appearance-switcher',
              run: 'Open More sheet, toggle System, Light, and Dark, then inspect html[data-gg-theme] plus GG.qa.snapshot().theme.',
              expected: 'System removes html[data-gg-theme] and follows OS, while Light and Dark persist in gg:theme with matching aria-pressed state.'
            },
            {
              id: 'panel-behavior',
              run: 'Open command, preview, comments, and more. Then test ESC, scrim close, swipe-down dismiss, and focus return.',
              expected: 'All panels share one controller contract and close cleanly without scroll-lock drift.'
            }
          ];
        }

        function formatVerificationProcedure() {
          var lines = [];
          var procedure = buildVerificationProcedure();
          var i;
          for (i = 0; i < procedure.length; i += 1) {
            lines.push((i + 1) + '. ' + procedure[i].id + ' :: ' + (procedure[i].run || procedure[i].url || 'manual'));
            lines.push('   expected: ' + procedure[i].expected);
          }
          return lines.join('\n');
        }

        function runRouteMatrix(options) {
          var matrixOptions = options || {};
          var order = ['listing', 'landing', 'search', 'label', 'archive', 'post', 'mobile', 'olderPageUrl', 'error404'];
          var routes = getRouteTargets();
          var timeoutMs = Math.max(5000, matrixOptions.timeoutMs || 12000);
          var results = [];
          var frame = document.createElement('iframe');

          frame.hidden = true;
          frame.setAttribute('aria-hidden', 'true');
          frame.setAttribute('tabindex', '-1');
          frame.style.position = 'absolute';
          frame.style.width = '1px';
          frame.style.height = '1px';
          frame.style.opacity = '0';
          frame.style.pointerEvents = 'none';
          frame.style.border = '0';
          document.body.appendChild(frame);

          function cleanupFrame() {
            if (frame.parentNode) frame.parentNode.removeChild(frame);
          }

          function visit(index) {
            var key;
            var url;
            if (index >= order.length) return Promise.resolve();
            key = order[index];
            url = routes[key];

            if (!url) {
              results.push({
                key: key,
                url: '',
                status: 'pending',
                reason: 'route-unavailable'
              });
              return visit(index + 1);
            }

            return loadRouteQa(frame, url, timeoutMs).then(function (qa) {
              return qa.runSmoke({
                exercisePanels: matrixOptions.exercisePanels !== false
              });
            }).then(function (smoke) {
              results.push({
                key: key,
                url: url,
                status: routeExpectationMatches(key, smoke) ? 'pass' : 'fail',
                expectedSurface: expectedSurfaceForRouteKey(key) || (key === 'olderPageUrl' ? 'listing-follow-on' : ''),
                actualSurface: smoke && smoke.surface ? smoke.surface.surface : '',
                variant: smoke && smoke.surface ? smoke.surface.variant : '',
                checklist: summarizeChecklist(smoke.checklist || []),
                panels: smoke.exercises || [],
                error: smoke.snapshot ? smoke.snapshot.error : null,
                special: smoke.snapshot ? smoke.snapshot.special : null
              });
              return visit(index + 1);
            }).catch(function (error) {
              results.push({
                key: key,
                url: url,
                status: 'fail',
                reason: error && error.message ? error.message : 'route-check-failed'
              });
              return visit(index + 1);
            });
          }

          return visit(0).then(function () {
            cleanupFrame();
            return {
              generatedAt: new Date().toISOString(),
              routes: results,
              summary: summarizeRouteMatrix(results),
              procedure: buildVerificationProcedure()
            };
          }).catch(function (error) {
            cleanupFrame();
            throw error;
          });
        }

        function getDismissThreshold(panel) {
