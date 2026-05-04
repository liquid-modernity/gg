          try {
            return new URL(value, window.location.href);
          } catch (error) {
            return new URL(window.location.href);
          }
        }

        function toAbsoluteUrl(value, base) {
          if (!value) return '';
          try {
            return new URL(value, base || window.location.href).href;
          } catch (error) {
            return value;
          }
        }

        function ggIdle(fn, timeout) {
          var limit = typeof timeout === 'number' ? timeout : 1200;

          if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(fn, { timeout: limit });
          }

          return window.setTimeout(function () {
            fn({
              didTimeout: true,
              timeRemaining: function () {
                return 0;
              }
            });
          }, 64);
        }

        function isStandaloneDisplayMode() {
          var standalone = false;

          try {
            standalone = !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
          } catch (error) {
            standalone = false;
          }

          if (!standalone && window.navigator && window.navigator.standalone === true) {
            standalone = true;
          }

          return standalone;
        }

        function syncDisplayModeState() {
          var mode = isStandaloneDisplayMode() ? 'standalone' : 'browser';
          startupState.displayMode = mode;
          writeBodyState('data-gg-display-mode', mode);
          return mode;
        }

        function syncNetworkState() {
          writeBodyState('data-gg-network', window.navigator && window.navigator.onLine === false ? 'offline' : 'online');
        }

        function syncLaunchPathState() {
          var path = normalizedPath(window.location.href);
          startupState.launchPath = path;
          writeBodyState('data-gg-launch-path', path);
          return path;
        }

        function markBootPerformance(name) {
          try {
            performance.mark(name);
          } catch (error) {}
        }

        function markShellReady() {
          if (!startupState.shellReadyAt) startupState.shellReadyAt = ggNow();
          writeBodyState('data-gg-boot', 'shell-ready');
          markBootPerformance('gg:boot:shell-ready');
        }

        function markFirstInteractionReady() {
          if (!startupState.firstInteractionReadyAt) startupState.firstInteractionReadyAt = ggNow();
          writeBodyState('data-gg-boot', 'interactive');
          writeBodyState('data-gg-hydration', 'critical');
          markBootPerformance('gg:boot:first-interaction-ready');
        }

        function markHydrationDeferred() {
          writeBodyState('data-gg-hydration', 'deferred');
        }

        function markHydrationComplete() {
          if (!startupState.hydrationCompleteAt) startupState.hydrationCompleteAt = ggNow();
          writeBodyState('data-gg-boot', 'hydrated');
          writeBodyState('data-gg-hydration', 'complete');
          markBootPerformance('gg:boot:hydration-complete');
        }

        function startupSnapshot() {
          return {
            bootState: readBodyState('data-gg-boot', 'unknown'),
            hydration: readBodyState('data-gg-hydration', 'unknown'),
            displayMode: readBodyState('data-gg-display-mode', 'browser'),
            launchPath: readBodyState('data-gg-launch-path', normalizedPath(window.location.href)),
            shellReadyMs: startupState.shellReadyAt ? roundTiming(startupState.shellReadyAt - startupState.startedAt) : null,
            firstInteractionReadyMs: startupState.firstInteractionReadyAt ? roundTiming(startupState.firstInteractionReadyAt - startupState.startedAt) : null,
            hydrationCompleteMs: startupState.hydrationCompleteAt ? roundTiming(startupState.hydrationCompleteAt - startupState.startedAt) : null,
            longTasks: startupState.longTasks.slice()
          };
        }

        function observeStartupLongTasks() {
          if (startupState.longTaskObserverStarted) return;
          startupState.longTaskObserverStarted = true;

          if (!window.PerformanceObserver) return;

          try {
            startupState.longTaskObserver = new PerformanceObserver(function (list) {
              var entries = list.getEntries();
              var i;
              for (i = 0; i < entries.length; i += 1) {
                startupState.longTasks.push({
                  name: entries[i].name || 'longtask',
                  startTime: roundTiming(entries[i].startTime),
                  duration: roundTiming(entries[i].duration)
                });
              }
              if (startupState.longTasks.length > 20) {
                startupState.longTasks = startupState.longTasks.slice(startupState.longTasks.length - 20);
              }
            });

            startupState.longTaskObserver.observe({
              type: 'longtask',
              buffered: true
            });
          } catch (error) {}
        }

