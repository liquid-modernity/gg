        function bindBootStateListeners() {
          if (pwaState.listenersBound) return;
          pwaState.listenersBound = true;

          window.addEventListener('online', syncNetworkState);
          window.addEventListener('offline', syncNetworkState);

          if (window.matchMedia) {
            try {
              var displayModeQuery = window.matchMedia('(display-mode: standalone)');
              var syncMode = function () {
                syncDisplayModeState();
              };

              if (displayModeQuery.addEventListener) {
                displayModeQuery.addEventListener('change', syncMode);
              } else if (displayModeQuery.addListener) {
                displayModeQuery.addListener(syncMode);
              }
            } catch (error) {}
          }
        }

        function readSwVersionMeta() {
          var release = ui.fingerprint ? (ui.fingerprint.getAttribute('data-release') || '') : '';
          var templateFingerprint = ui.fingerprint ? (ui.fingerprint.getAttribute('data-gg-template-fingerprint') || '') : '';

          return {
            release: release,
            templateFingerprint: templateFingerprint,
            version: release && templateFingerprint ? (release + '-' + templateFingerprint) : ''
          };
        }

        function syncExpectedSwVersion() {
          var meta = readSwVersionMeta();
          pwaState.versionExpected = meta.version || pwaState.versionExpected || '';
          return meta;
        }

        function hasPwaDebugQuery() {
          return safeUrl(window.location.href).searchParams.get('ggdebug') === '1';
        }

        function isPwaDebugAllowed(mode) {
          var currentMode = mode || pwaState.mode || 'unknown';
          if (hasPwaDebugQuery()) return true;
          return currentMode === 'development' || currentMode === 'staging';
        }

        function buildPwaActionGate(action, options) {
          var gateOptions = options || {};
          var currentMode = pwaState.mode || 'unknown';
          var ggdebug = hasPwaDebugQuery();
          var allowed = isPwaDebugAllowed(currentMode);

          return {
            ok: allowed,
            allowed: allowed,
            action: action || 'pwa-action',
            mode: currentMode,
            ggdebug: ggdebug,
            hardReset: !!gateOptions.hardReset,
            error: allowed ? '' : 'pwa_action_blocked',
            reason: allowed ? 'allowed' : 'requires_development_or_staging_mode_or_ggdebug',
            message: allowed
              ? 'PWA action allowed.'
              : 'PWA reset APIs are disabled unless mode is development/staging or ?ggdebug=1 is present.'
          };
        }

        function pwaCacheSnapshot() {
          return {
            supported: pwaState.cacheSupported,
            cacheNames: pwaState.cacheNames.slice(),
            offlineCached: !!pwaState.offlineCached,
            landingCached: !!pwaState.landingCached,
            landingVariantsCached: pwaState.landingVariantsCached.slice(),
            lastCacheMode: pwaState.lastCacheMode || 'unknown'
          };
        }

        function pwaSnapshot() {
          return {
            supported: pwaState.supported,
            registered: pwaState.registered,
            controlling: pwaState.controlling,
            version: pwaState.version || pwaState.versionExpected || '',
            expectedVersion: pwaState.versionExpected || '',
            mode: pwaState.mode,
            enabled: pwaState.enabled,
            navigationPreload: pwaState.navigationPreload,
            devAggressiveUpdate: pwaState.devAggressiveUpdate,
            updateAvailable: pwaState.updateAvailable,
            cacheNames: pwaState.cacheNames.slice(),
            offlineCached: !!pwaState.offlineCached,
            landingCached: !!pwaState.landingCached,
            lastCacheMode: pwaState.lastCacheMode || 'unknown',
            lastCachePath: pwaState.lastCachePath || '',
            scope: pwaState.scope || ''
          };
        }

        function applyPwaStatus(status) {
          if (!status || typeof status !== 'object') return;

          if (typeof status.enabled === 'boolean') pwaState.enabled = status.enabled;
          if (typeof status.navigationPreload === 'boolean') pwaState.navigationPreload = status.navigationPreload;
          if (typeof status.devAggressiveUpdate === 'boolean') pwaState.devAggressiveUpdate = status.devAggressiveUpdate;
          if (typeof status.mode === 'string' && status.mode) pwaState.mode = status.mode;
          if (typeof status.version === 'string' && status.version) pwaState.version = status.version;
          if (typeof status.lastCacheMode === 'string' && status.lastCacheMode) {
            pwaState.lastCacheMode = status.lastCacheMode;
            writeBodyState('data-gg-cache-mode', status.lastCacheMode);
          }
          if (typeof status.lastCachePath === 'string') pwaState.lastCachePath = status.lastCachePath;
          if (Array.isArray(status.cacheNames)) pwaState.cacheNames = status.cacheNames.slice();

          pwaState.debugAllowed = isPwaDebugAllowed(pwaState.mode);
        }

        function refreshPwaCacheAudit() {
          var offlineUrl = makeHomeUrl('offline.html');
          var landingUrls = [
            makeHomeUrl('landing'),
            makeHomeUrl('landing?source=pwa'),
            makeHomeUrl('landing?source=pwa-launch'),
            makeHomeUrl('landing?source=pwa-shortcut')
          ];

          pwaState.cacheSupported = !!window.caches;

          if (!window.caches || !window.caches.keys) {
            pwaState.cacheNames = [];
            pwaState.offlineCached = false;
            pwaState.landingCached = false;
            pwaState.landingVariantsCached = [];
            return Promise.resolve(pwaCacheSnapshot());
          }

          return window.caches.keys().then(function (names) {
            pwaState.cacheNames = names.slice();

            return Promise.all(names.map(function (name) {
              return window.caches.open(name).then(function (cache) {
                return Promise.all([
                  cache.match(offlineUrl),
                  Promise.all(landingUrls.map(function (url) {
                    return cache.match(url);
                  }))
                ]).then(function (matches) {
                  return {
                    offline: !!matches[0],
                    landing: matches[1]
                  };
                });
              }).catch(function () {
                return {
                  offline: false,
                  landing: []
                };
              });
            }));
          }).then(function (groups) {
            var landingSeen = {};
            var landingMatches = [];
            var i;
            var j;

            pwaState.offlineCached = false;

            for (i = 0; i < groups.length; i += 1) {
              if (groups[i].offline) pwaState.offlineCached = true;

              for (j = 0; j < landingUrls.length; j += 1) {
                if (!groups[i].landing[j]) continue;
                if (landingSeen[landingUrls[j]]) continue;
                landingSeen[landingUrls[j]] = true;
                landingMatches.push(landingUrls[j]);
              }
            }

            pwaState.landingVariantsCached = landingMatches;
            pwaState.landingCached = landingMatches.length > 0;
            return pwaCacheSnapshot();
          }).catch(function () {
            pwaState.offlineCached = false;
            pwaState.landingCached = false;
            pwaState.landingVariantsCached = [];
            return pwaCacheSnapshot();
          });
        }

        function queryServiceWorkerStatus(registration) {
          var worker = registration && (registration.active || registration.waiting || registration.installing);

          if (!worker && window.navigator && window.navigator.serviceWorker) {
            worker = window.navigator.serviceWorker.controller;
          }

          if (!worker || !window.MessageChannel) {
            return Promise.resolve(null);
          }

          return new Promise(function (resolve) {
            var settled = false;
            var channel = new MessageChannel();
            var timeout = window.setTimeout(function () {
              if (settled) return;
              settled = true;
              resolve(null);
            }, 1200);

            channel.port1.onmessage = function (event) {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              resolve(event && event.data ? event.data : null);
            };

            try {
              worker.postMessage({ type: 'GG_SW_STATUS' }, [channel.port2]);
            } catch (error) {
              if (!settled) {
                settled = true;
                window.clearTimeout(timeout);
                resolve(null);
              }
            }
          });
        }

        function refreshPwaDiagnostics(registration) {
          return queryServiceWorkerStatus(registration).then(function (status) {
            if (status) applyPwaStatus(status);
            return refreshPwaCacheAudit();
          }).catch(function () {
            return refreshPwaCacheAudit();
          }).then(function () {
            pwaState.controlling = !!(window.navigator && window.navigator.serviceWorker && window.navigator.serviceWorker.controller);
            pwaState.debugAllowed = isPwaDebugAllowed(pwaState.mode);
            return pwaSnapshot();
          });
        }

        function maybePromoteWaitingWorker(registration) {
          if (!registration || !registration.waiting || !pwaState.devAggressiveUpdate) return false;

          try {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return true;
          } catch (error) {
            return false;
          }
        }

        function bindServiceWorkerMessaging() {
          if (!pwaState.supported || pwaState.messagingBound) return;
          pwaState.messagingBound = true;

          window.navigator.serviceWorker.addEventListener('message', function (event) {
            var data = event && event.data ? event.data : {};

            if (data.type === 'GG_SW_CACHE_MODE') {
              if (typeof data.cacheMode === 'string' && data.cacheMode) {
                pwaState.lastCacheMode = data.cacheMode;
                writeBodyState('data-gg-cache-mode', data.cacheMode);
              }
              if (typeof data.path === 'string') pwaState.lastCachePath = data.path;
              if (typeof data.version === 'string' && data.version) pwaState.version = data.version;
              return;
            }

            if (data.type === 'GG_SW_READY') {
              pwaState.registered = true;
              pwaState.controlling = !!window.navigator.serviceWorker.controller;
              pwaState.updateAvailable = false;
              applyPwaStatus(data);
              refreshPwaDiagnostics();
              return;
            }

            if (data.type === 'GG_SW_DISABLED') {
              pwaState.enabled = false;
              pwaState.registered = false;
              pwaState.controlling = false;
              pwaState.cacheNames = [];
              pwaState.offlineCached = false;
              pwaState.landingCached = false;
              pwaState.landingVariantsCached = [];
              pwaState.lastCacheMode = 'unknown';
              writeBodyState('data-gg-cache-mode', 'unknown');
              return;
            }

            if (data.type === 'GG_SW_STATUS') {
              applyPwaStatus(data);
            }
          });

          window.navigator.serviceWorker.addEventListener('controllerchange', function () {
            pwaState.controlling = !!window.navigator.serviceWorker.controller;
            pwaState.updateAvailable = false;
            refreshPwaDiagnostics();
          });
        }

        function bindServiceWorkerUpdateFlow(registration) {
          if (!registration) return;

          if (registration.waiting) {
            pwaState.waiting = true;
            pwaState.updateAvailable = !!(window.navigator.serviceWorker && window.navigator.serviceWorker.controller);
            maybePromoteWaitingWorker(registration);
          }

          registration.addEventListener('updatefound', function () {
            var installing = registration.installing;
            if (!installing) return;

            installing.addEventListener('statechange', function () {
              if (installing.state === 'installed') {
                pwaState.waiting = !!registration.waiting;
                pwaState.updateAvailable = !!window.navigator.serviceWorker.controller;
                maybePromoteWaitingWorker(registration);
                refreshPwaDiagnostics(registration);
              } else if (installing.state === 'activated') {
                pwaState.waiting = false;
                pwaState.updateAvailable = false;
                refreshPwaDiagnostics(registration);
              }
            });
          });
        }

        function registerPwaServiceWorker() {
          if (!pwaState.supported) return Promise.resolve(null);

          bindServiceWorkerMessaging();
          syncExpectedSwVersion();

          return window.navigator.serviceWorker.register(makeHomeUrl('sw.js'), {
            scope: '/'
          }).then(function (registration) {
            pwaState.registered = true;
            pwaState.scope = registration.scope || '/';
            pwaState.waiting = !!registration.waiting;
            pwaState.registrationError = '';
            bindServiceWorkerUpdateFlow(registration);
            return refreshPwaDiagnostics(registration).then(function () {
              maybePromoteWaitingWorker(registration);
              return registration;
            });
          }).catch(function (error) {
            pwaState.registrationError = error && error.message ? error.message : 'service-worker-registration-failed';
            return null;
          });
        }

        function isStandaloneLaunchRedirectBlocked(url) {
          var source = url.searchParams.get('source') || '';
          var path = normalizedPath(url.href);

          if (path.indexOf('/b/') === 0) return true;
          if (path.indexOf('/admin') === 0) return true;
          if (path.indexOf('/preview') === 0) return true;
          if (path.indexOf('/draft') === 0) return true;
          if (path.indexOf('/comment-iframe') === 0) return true;
          if (path.indexOf('/edit') !== -1) return true;
          if (url.searchParams.get('ggdebug') === '1') return true;
          if (url.searchParams.get('gg_nopwa_redirect') === '1') return true;
          if (url.searchParams.get('gg_no_pwa_redirect') === '1') return true;
          if (source === 'pwa') return true;
          if (source === 'pwa-launch') return true;
          if (source === 'pwa-shortcut') return true;
          if (url.searchParams.has('preview')) return true;
          if (url.searchParams.has('token')) return true;
          return false;
        }

        function maybeRedirectStandaloneLaunch() {
          if (!(GG.pwaConfig && GG.pwaConfig.rootFallbackRedirect === true)) return false;

          var currentUrl = safeUrl(window.location.href);
          var homePath = normalizedPath(makeHomeUrl(''));
          var mobileQuery = currentUrl.searchParams.get('m');

          syncDisplayModeState();
          syncLaunchPathState();

          if (!isStandaloneDisplayMode()) return false;
          if (normalizedPath(currentUrl.href) !== homePath) return false;
          if (mobileQuery === '0' || mobileQuery === '1') return false;
          if (isStandaloneLaunchRedirectBlocked(currentUrl)) return false;

          try {
            if (window.sessionStorage.getItem('gg:pwa:landing-redirected')) return false;
            window.sessionStorage.setItem('gg:pwa:landing-redirected', '1');
          } catch (error) {
            return false;
          }

          window.location.replace(makeHomeUrl('landing?source=pwa-launch'));
          return true;
        }

        function clearPwaCaches(options) {
          var clearOptions = options || {};
          var preserveSaved = clearOptions.preserveSaved !== false;

          if (!window.caches || !window.caches.keys) return Promise.resolve([]);

          return window.caches.keys().then(function (names) {
            return Promise.all(names.map(function (name) {
              if (String(name || '').indexOf('gg-') !== 0) return Promise.resolve('');
              if (preserveSaved && String(name || '').indexOf('gg-saved-') === 0) return Promise.resolve('');
              return window.caches.delete(name).then(function () {
                return name;
              }).catch(function () {
                return '';
              });
            }));
          }).then(function (deleted) {
            return deleted.filter(function (name) {
              return !!name;
            });
          });
        }

        function unregisterPwaServiceWorkers() {
          if (!pwaState.supported || !window.navigator.serviceWorker.getRegistrations) {
            return Promise.resolve(0);
          }

          return window.navigator.serviceWorker.getRegistrations().then(function (registrations) {
            return Promise.all(registrations.map(function (registration) {
              return registration.unregister().then(function () {
                return 1;
              }).catch(function () {
                return 0;
              });
            }));
          }).then(function (results) {
            var total = 0;
            var i;
            for (i = 0; i < results.length; i += 1) total += results[i];
            return total;
          });
        }

        function initPwaClient() {
