TASK: Make gg-detail-outline bottom-attached when dock is hidden by scroll

File:
- index.xml

Goal:
When `.gg-dock` is hidden by scroll, `.gg-detail-outline` must stay visible as a bottom-attached micro-peek at the base of the viewport. It must not float above the viewport with bottom margin. It should behave like a small bottom ledge: visually attached to the bottom edge, with internal safe-area padding for iPhone home indicator safety.

Current observed issue:
- When dock hides, detail outline remains visible but floats above the viewport bottom like a detached pill/card.
- Desired behavior: outline follows the dock downward and rests at the bottom edge of the viewport, without disappearing.

Do not:
- Do not hide the outline when dock is hidden.
- Do not make the outline float with standalone bottom margin.
- Do not use pill radius `999px` for hidden-by-scroll state.
- Do not use external safe-area bottom margin for this state.
- Do not change route logic, Worker logic, Blogger widgets, Appearance switcher, or fingerprint logic.
- Do not weaken QA scripts.

CSS contract:
1. Normal dock-attached state remains unchanged:
   `.gg-detail-outline`
   bottom: calc(var(--gg-dock-clearance) + var(--gg-detail-outline-dock-gap));

2. Hidden dock state:
   `body[data-gg-dock-state='hidden-by-scroll'] .gg-detail-outline`
   must use:
   bottom: 0;

3. Safe area must be internal:
   Apply `env(safe-area-inset-bottom)` to padding/min-height of `.gg-detail-outline__peek`, not to the outline's external bottom position.

Patch CSS:
Remove or override any previous floating standalone token such as:
- --gg-detail-outline-standalone-bottom
- bottom: var(--gg-detail-outline-standalone-bottom)
- border-radius: 999px in hidden-by-scroll state

Add/ensure:

body[data-gg-dock-state='hidden-by-scroll'] .gg-detail-outline {
  bottom: 0;
  width: min(calc(100% - 32px), var(--gg-detail-outline-width));
  border-bottom: 0;
  border-radius: var(--gg-detail-outline-radius) var(--gg-detail-outline-radius) 0 0;
}

body[data-gg-dock-state='hidden-by-scroll']
.gg-detail-outline[data-gg-outline-state='micro-peek'] {
  border-radius: var(--gg-detail-outline-radius) var(--gg-detail-outline-radius) 0 0;
}

body[data-gg-dock-state='hidden-by-scroll']
.gg-detail-outline[data-gg-outline-state='micro-peek'] .gg-detail-outline__peek {
  min-height: calc(var(--gg-detail-outline-micro-min-height) + env(safe-area-inset-bottom));
  padding-top: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

Transform rule:
- Preserve horizontal centering:
  transform: translateX(-50%);
- Do not replace it with translateY-only transforms.
- If using translate3d, use translate3d(-50%, 0, 0).

JS contract:
Find the code that sets:
- `body[data-gg-dock-state]`
- `.gg-detail-outline[data-gg-outline-state]`

When dock state becomes `hidden-by-scroll`:
- Force `.gg-detail-outline` to `micro-peek`.
- Do not leave it in expanded state.
- Do not hide it.
- Do not use floating standalone state.

When dock returns visible:
- Restore normal dock-attached behavior.
- Existing outline state may return to peek/micro-peek according to current scroll logic.

Visual contract:
- Dock visible: outline sits above dock.
- Dock hidden: outline sits at viewport bottom edge.
- The bottom edge of outline may touch viewport edge.
- The content inside outline must not collide with safe area/home indicator.
- No floating gap below outline.
- No 999px pill shape in hidden-by-scroll state.

QA:
1. Open post/detail page with headings.
2. Scroll down until dock hides.
3. Confirm dock moves out of viewport.
4. Confirm detail outline remains visible.
5. Confirm detail outline is attached to bottom edge, not floating.
6. Confirm text/handle/progress inside outline remains above iPhone home indicator due to internal padding.
7. Scroll up until dock returns.
8. Confirm detail outline reattaches above dock.
9. Open any sheet/panel.
10. Confirm existing panel-active behavior still hides outline.

Run:
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:template:status
npm run gaga:template:proof

Acceptance criteria:
- Hidden-by-scroll outline is bottom-attached, not floating.
- Outline remains visible when dock hides.
- Outline becomes micro-peek when dock hides.
- Dock-attached behavior still works when dock returns.
- Safe area handled internally.
- No route/fingerprint/Appearance/Worker changes.