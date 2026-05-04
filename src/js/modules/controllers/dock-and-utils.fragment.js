        function escapeHtml(value) {
          return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
          });
        }

        function stripHtml(value) {
          var div = document.createElement('div');
          div.innerHTML = value || '';
          return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
        }

        function debounce(fn, wait) {
          var timer = null;
          return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(context, args);
            }, wait);
          };
        }

        function waitMs(duration) {
          return new Promise(function (resolve) {
            window.setTimeout(resolve, duration);
          });
        }

        function ggNow() {
          return window.performance && typeof window.performance.now === 'function'
            ? window.performance.now()
            : 0;
        }

        function roundTiming(value) {
          return typeof value === 'number' && value >= 0 ? Math.round(value) : null;
        }

        function readBodyState(name, fallback) {
          if (!document.body) return fallback || '';
          return document.body.getAttribute(name) || fallback || '';
        }

        function writeBodyState(name, value) {
          if (!document.body) return;
          document.body.setAttribute(name, value);
        }

        function resolveDockScrollTop() {
          return Math.max(0, window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0);
        }

        function resolveDockDocumentHeight() {
          var body = document.body;
          var root = document.documentElement;
          return Math.max(
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0,
            root ? root.scrollHeight : 0,
            root ? root.offsetHeight : 0,
            root ? root.clientHeight : 0
          );
        }

        function isDockBottomZone(scrollTop) {
          var viewportHeight = Math.max(window.innerHeight || 0, document.documentElement ? document.documentElement.clientHeight : 0);
          var threshold = Math.max(DOCK_BOTTOM_ZONE_PX, Math.round(viewportHeight * DOCK_BOTTOM_ZONE_VIEWPORT_RATIO));
          return (scrollTop + viewportHeight) >= (resolveDockDocumentHeight() - threshold);
        }

        function resolveDockScrollDirection(scrollTop) {
          var delta = scrollTop - state.dockLastScrollTop;
          var nextDirection = state.dockScrollDirection;

          if (scrollTop <= 0) {
            nextDirection = 'none';
            state.dockDirectionStart = 0;
          } else if (Math.abs(delta) >= DOCK_DIRECTION_DELTA_PX) {
            nextDirection = delta > 0 ? 'down' : 'up';
            if (nextDirection !== state.dockScrollDirection) {
              state.dockDirectionStart = scrollTop;
            }
          }

          state.dockScrollDirection = nextDirection;
          state.dockLastScrollTop = scrollTop;
          return nextDirection;
        }

        function resolveDockVisibilityState(scrollTop, bottomZone) {
          if (state.panelActive) return 'panel-locked';
          if (state.dockFocused) return 'forced-visible';
          if (scrollTop <= DOCK_TOP_ZONE_PX || bottomZone) return 'visible';

          if (state.dockState === 'hidden-by-scroll') {
            if (state.dockScrollDirection === 'up' && (state.dockDirectionStart - scrollTop) >= DOCK_SHOW_THRESHOLD_PX) {
              return 'visible';
            }
            return 'hidden-by-scroll';
          }

          if (state.dockScrollDirection === 'down' && (scrollTop - state.dockDirectionStart) >= DOCK_HIDE_THRESHOLD_PX) {
            return 'hidden-by-scroll';
          }

          return 'visible';
        }

        function syncDockVisibility() {
          var scrollTop = resolveDockScrollTop();
          var bottomZone = isDockBottomZone(scrollTop);
          var direction = resolveDockScrollDirection(scrollTop);
          var dockState = resolveDockVisibilityState(scrollTop, bottomZone);
          var previousDockState = state.dockState;
          var wasHidden = previousDockState === 'hidden-by-scroll';
          var willHide = dockState === 'hidden-by-scroll';
          var becameHidden = !wasHidden && willHide;
          var becameVisible = wasHidden && (dockState === 'visible' || dockState === 'forced-visible');

          state.previousDockState = previousDockState;
          state.dockState = dockState;
          writeBodyState('data-gg-dock-state', dockState);
          writeBodyState('data-gg-scroll-direction', direction || 'none');
          writeBodyState('data-gg-bottom-zone', bottomZone ? 'true' : 'false');

          if (becameHidden && ui.detailOutline && !ui.detailOutline.hidden) {
            if (!isDetailOutlineManualOpenFresh()) {
              clearDetailOutlineManualOpen();
              setDetailOutlineState('micro-peek');
            }
          }

          if (becameVisible) {
            clearDetailOutlineManualOpen();
          }

          requestDetailOutlineSync();
        }

        function requestDockVisibilitySync() {
          if (state.dockSyncFrame) return;
          state.dockSyncFrame = window.requestAnimationFrame(function () {
            state.dockSyncFrame = 0;
            syncDockVisibility();
          });
        }

        function syncDockFocusState() {
          state.dockFocused = !!(ui.dock && ui.dock.contains(document.activeElement));
          syncDockVisibility();
        }

        function initDockVisibility() {
          writeBodyState('data-gg-active-panel', state.panelActive || '');
          writeBodyState('data-gg-panel-active', state.panelActive ? 'true' : 'false');
          if (!state.panelActive) writeBodyState('data-gg-scroll-lock', 'false');

          if (!ui.dock) {
            writeBodyState('data-gg-dock-state', 'visible');
            writeBodyState('data-gg-scroll-direction', 'none');
            writeBodyState('data-gg-bottom-zone', 'false');
            return;
          }

          state.dockLastScrollTop = resolveDockScrollTop();
          state.dockDirectionStart = state.dockLastScrollTop;
          state.dockScrollDirection = 'none';
          state.dockFocused = ui.dock.contains(document.activeElement);

          ui.dock.addEventListener('focusin', syncDockFocusState);
          ui.dock.addEventListener('focusout', function () {
            window.setTimeout(syncDockFocusState, 0);
          });

          window.addEventListener('scroll', requestDockVisibilitySync, { passive: true });
          window.addEventListener('resize', requestDockVisibilitySync);
          window.addEventListener('hashchange', requestDockVisibilitySync);

          syncDockVisibility();
        }

        startupState.startedAt = typeof startupState.startedAt === 'number' && startupState.startedAt > 0
          ? startupState.startedAt
          : ggNow();
        startupState.shellReadyAt = typeof startupState.shellReadyAt === 'number' ? startupState.shellReadyAt : 0;
        startupState.firstInteractionReadyAt = typeof startupState.firstInteractionReadyAt === 'number' ? startupState.firstInteractionReadyAt : 0;
        startupState.hydrationCompleteAt = typeof startupState.hydrationCompleteAt === 'number' ? startupState.hydrationCompleteAt : 0;
        startupState.longTasks = Array.isArray(startupState.longTasks) ? startupState.longTasks : [];
        startupState.launchPath = startupState.launchPath || readBodyState('data-gg-launch-path', '/');
        startupState.displayMode = startupState.displayMode || readBodyState('data-gg-display-mode', 'browser');
