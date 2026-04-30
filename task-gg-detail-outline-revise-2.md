TASK: Harden gg-detail-outline manual-open behavior while dock is hidden

File:
- index.xml

Goal:
Prevent `.gg-detail-outline` from auto-collapsing back to `micro-peek` after the user manually opens it while `.gg-dock` is `hidden-by-scroll`. Also make manual-open state expire/clear correctly when the user closes/selects/collapses the outline.

Current issue:
- CSS position is now correct.
- Outline is bottom-attached when dock is hidden.
- Outline can open.
- But `syncDetailOutlineCurrent()` may still resolve compact state and return it to `micro-peek` after manual open.
- Manual-open state is marked on toggle/gesture, but not cleared consistently.

Do not:
- Do not change CSS positioning.
- Do not change outline width.
- Do not hide outline when dock is hidden.
- Do not alter route logic, Worker logic, Appearance switcher, fingerprint logic, or Blogger widgets.

Required changes:

1. Add a manual-open grace constant:
var DETAIL_OUTLINE_MANUAL_OPEN_GRACE_MS = 1600;

Place near the other detail/dock constants.

2. Add helpers:
function markDetailOutlineManualOpen() {
  state.detailOutlineManualOpen = true;
  state.detailOutlineManualOpenAt = Date.now();
}

function clearDetailOutlineManualOpen() {
  state.detailOutlineManualOpen = false;
  state.detailOutlineManualOpenAt = 0;
}

function isDetailOutlineManualOpenFresh() {
  return state.detailOutlineManualOpen &&
    (Date.now() - (state.detailOutlineManualOpenAt || 0)) <= DETAIL_OUTLINE_MANUAL_OPEN_GRACE_MS;
}

If markDetailOutlineManualOpen already exists, update it rather than duplicating it.

3. Patch syncDetailOutlineCurrent():
Current behavior probably does:
if (!isDetailOutlineExpanded()) {
  nextCompactState = isDockHiddenByScroll() && state.detailOutlineState === 'micro-peek' && !state.detailOutlineManualOpen
    ? 'micro-peek'
    : resolveDetailOutlineCompactState();
}

Replace with:
if (!isDetailOutlineExpanded()) {
  if (isDockHiddenByScroll() && isDetailOutlineManualOpenFresh()) {
    nextCompactState = state.detailOutlineState;
  } else if (isDockHiddenByScroll() && state.detailOutlineState === 'micro-peek' && !state.detailOutlineManualOpen) {
    nextCompactState = 'micro-peek';
  } else {
    if (state.detailOutlineManualOpen && !isDetailOutlineManualOpenFresh()) {
      clearDetailOutlineManualOpen();
    }
    nextCompactState = resolveDetailOutlineCompactState();
  }

  if (nextCompactState !== state.detailOutlineState) {
    state.detailOutlineState = nextCompactState;
    shouldRender = true;
  }
}

4. Patch toggleDetailOutline():
- If user toggles open from micro-peek/peek, mark manual open.
- If user toggles from expanded to resolved compact, clear manual open.

Suggested:
function toggleDetailOutline() {
  var nextState = resolveDetailOutlineToggleState();

  if (nextState === 'expanded' || nextState === 'peek') {
    markDetailOutlineManualOpen();
  } else {
    clearDetailOutlineManualOpen();
  }

  setDetailOutlineState(nextState);
}

5. Patch gesture handling:
- Upward gesture to expanded = mark manual open.
- Downward gesture collapse = clear manual open, not mark.

6. Patch scrollToDetailOutlineTarget():
When user selects a heading:
- clear manual open
- set compact state

7. Patch Escape behavior:
If Escape closes expanded detail outline:
- clear manual open
- set compact state

8. Patch GG.detailOutline API:
- open() should mark manual open before expanded.
- close() should clear manual open before compact.
- toggle() can remain bound to toggleDetailOutline.
- setState() may remain low-level unless currently used as public manual control. If it is public, consider marking manual open for `peek`/`expanded` and clearing for `micro-peek`.

Acceptance criteria:
- Dock hidden: outline sits at viewport bottom.
- Tap micro-peek: opens to peek.
- Scroll slightly: does not immediately collapse back to micro-peek.
- Tap again: expands.
- Select heading: closes/compacts normally.
- Escape: closes/compacts and clears manual-open.
- Downward collapse gesture clears manual-open.
- After grace period, auto compact behavior may resume calmly.
- Dock visible again resets manual-open as it already does.
- No CSS width/position regressions.

Run:
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:template:status
npm run gaga:template:proof