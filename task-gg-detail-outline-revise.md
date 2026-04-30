TASK: Restore gg-detail-outline opening behavior while dock is hidden

File:
- index.xml

Goal:
Fix `.gg-detail-outline` so it remains bottom-attached when `.gg-dock` is hidden by scroll, but still opens normally when tapped. Also preserve the original outline width; hidden-by-scroll state must not make the outline wider.

Current observed bug:
- Dock hidden-by-scroll works.
- Outline moves down to bottom viewport.
- But outline cannot open the detail TOC.
- Width also appears wider/different, making it feel like a different product.

Correct behavior:
1. Dock visible:
   - outline is attached above dock.
   - outline can toggle micro-peek → peek → expanded.

2. Dock hidden-by-scroll:
   - outline is attached to bottom viewport.
   - outline initially appears as micro-peek.
   - tapping it must still open detail TOC normally.
   - expanded tray should grow upward from the bottom.
   - width must remain the same as normal outline.
   - no floating/pill behavior.
   - no wider standalone variant.

3. Panel/sheet active:
   - existing behavior remains: outline hides while panel is active.

Do not:
- Do not hide the outline when dock is hidden.
- Do not disable pointer events.
- Do not force `micro-peek` continuously while dock is hidden.
- Do not use `border-radius: 999px`.
- Do not use wider width such as `calc(100% - 32px)`.
- Do not alter route logic, Worker logic, Appearance switcher, fingerprint, or Blogger widgets.

CSS fix:
Find any hidden-by-scroll override for `.gg-detail-outline`.

Replace hidden width with the original/default width:
body[data-gg-dock-state='hidden-by-scroll'] .gg-detail-outline {
  bottom: 0;
  width: min(calc(100% - 66px), var(--gg-detail-outline-width));
  border-bottom: 0;
  border-radius: var(--gg-detail-outline-radius) var(--gg-detail-outline-radius) 0 0;
}

Ensure this does NOT exist:
- width: min(calc(100% - 32px), var(--gg-detail-outline-width));
- border-radius: 999px;
- pointer-events: none;
- opacity: 0;
- transform that removes horizontal centering

Keep:
transform: translateX(-50%);

Safe-area rule:
Only apply extra safe-area padding to the micro-peek button, not to expanded tray globally:

body[data-gg-dock-state='hidden-by-scroll']
.gg-detail-outline[data-gg-outline-state='micro-peek'] .gg-detail-outline__peek {
  min-height: calc(var(--gg-detail-outline-micro-min-height) + env(safe-area-inset-bottom));
  padding-top: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

JS fix:
Find the logic added in the previous task that forces outline state to `micro-peek` when dock state becomes `hidden-by-scroll`.

Change it from continuous enforcement to one-time auto-collapse only.

Bad behavior to remove:
- Every `syncDockVisibility()` or scroll event sets outline to micro-peek while dockState === 'hidden-by-scroll'.
- Any guard that prevents opening when dockState === 'hidden-by-scroll'.
- Any click handler that returns early because dock is hidden.

Correct behavior:
- When dock state transitions from visible/forced-visible to hidden-by-scroll:
  collapse outline to micro-peek once, unless user has manually opened it very recently.
- When user taps the outline toggle:
  allow the existing state machine:
  micro-peek → peek
  peek → expanded
  expanded → resolved compact
- Set a manual-open flag/timestamp on user toggle:
  state.detailOutlineManualOpen = true;
  state.detailOutlineManualOpenAt = Date.now();

Recommended logic:
- Track previous dock state:
  state.previousDockState

- In syncDockVisibility(), after computing new dockState:
  var wasHidden = state.dockState === 'hidden-by-scroll';
  var willHide = dockState === 'hidden-by-scroll';
  var becameHidden = !wasHidden && willHide;

- Only on becameHidden:
  if (!state.detailOutlineManualOpen) {
    setDetailOutlineState('micro-peek');
  }

- In outline toggle handler:
  state.detailOutlineManualOpen = true;
  state.detailOutlineManualOpenAt = Date.now();

- Optional reset:
  If dock returns visible, reset:
  state.detailOutlineManualOpen = false;

Do not invent a second outline state machine.
Use the existing function that currently sets:
- data-gg-outline-state
- aria-expanded
- tray hidden/open

Acceptance criteria:
- In hidden-by-scroll state, outline is bottom-attached.
- Tapping the bottom-attached micro-peek opens TOC.
- Tapping again follows existing outline behavior.
- Expanded tray grows upward and remains readable.
- Width matches normal outline width.
- It does not become a wider separate component.
- Dock returning visible reattaches outline above dock.
- Panel active still hides outline.
- XML remains valid.

Run:
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:template:status
npm run gaga:template:proof