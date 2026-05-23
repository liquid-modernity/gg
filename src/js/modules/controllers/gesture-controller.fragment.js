          if (!panel || !panel.panel) return 96;
          return Math.max(96, Math.round(panel.panel.offsetHeight * 0.16));
        }

        function shouldDismissByDrag(panel, offsetY, velocityY) {
          var threshold = getDismissThreshold(panel);
          if (getPanelEdge(panel) === 'top') return offsetY < -threshold || velocityY < -0.75;
          return offsetY > threshold || velocityY > 0.75;
        }

        function isHandleTap(offsetY, elapsed) {
          return Math.abs(offsetY) < 8 && elapsed < 360;
        }

        function startDrag(event) {
          var handle = event.target.closest('[data-gg-drag-handle]');
          var name;
          var panel;

          if (!handle) return;
          name = handle.getAttribute('data-gg-drag-handle');
          panel = getPanel(name);
          if (!panel || state.panelActive !== name) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          state.drag = {
            name: name,
            pointerId: event.pointerId,
            startY: event.clientY,
            offsetY: 0,
            startedAt: Date.now()
          };

          state.ignoreClickUntil = Date.now() + 180;
          panel.root.setAttribute('data-gg-state', 'dragging');
          resetPanelDrag(panel, true);
          if (handle.setPointerCapture) {
            try {
              handle.setPointerCapture(event.pointerId);
            } catch (error) {
              /* ignore pointer capture failures */
            }
          }
          event.preventDefault();
        }

        function moveDrag(event) {
          var panel;
          var offset;

          if (!state.drag || state.drag.pointerId !== event.pointerId) return;
          panel = getPanel(state.drag.name);
          if (!panel) return;

          offset = event.clientY - state.drag.startY;
          state.drag.offsetY = offset;
          applyPanelDrag(panel, offset);
          event.preventDefault();
        }

        function endDrag(event) {
          var drag = state.drag;
          var panel;
          var offset;
          var shouldClose;
          var tapRelease;
          var velocity;
          var elapsed;

          if (!drag || drag.pointerId !== event.pointerId) return;

          panel = getPanel(drag.name);
          state.drag = null;
          if (!panel) return;

          offset = typeof event.clientY === 'number' ? event.clientY - drag.startY : drag.offsetY;
          drag.offsetY = offset;
          elapsed = Math.max(1, Date.now() - drag.startedAt);
          velocity = offset / elapsed;
          tapRelease = isHandleTap(offset, elapsed);
          shouldClose = tapRelease || shouldDismissByDrag(panel, offset, velocity);

          if (shouldClose) {
            state.ignoreClickUntil = Date.now() + 320;
            closePanel(drag.name, {
              returnFocus: tapRelease,
              reason: tapRelease ? 'handle-tap' : 'drag-dismiss'
            });
          } else {
            restorePanelFromDrag(panel);
          }
        }

        var ggSheetGestureController = {
          start: startDrag,
          move: moveDrag,
          end: endDrag
        };

        function clearPressState() {
