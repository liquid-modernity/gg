TASK: Polish Store filter tray micro-peek and toast placement so /store feels cleaner and avoids overlap with sheets/dock.

Context:
The /store surface already uses the final Store contract:
- Dock: Store / Contact / Discover / Saved / More
- Filter tray is dock-attached
- Preview uses top sheet
- Discovery/Saved/More use bottom sheets
- Saved/Copy toast feedback already exists

Do NOT change:
- Worker route mapping
- sw.js
- canonical /store
- dock vocabulary
- feed label architecture
- preview sheet architecture
- Discovery/Saved/More sheet architecture
- marketplace CTA hierarchy

Files likely involved:
- store.html
- qa/store-artifact-smoke.sh only if selectors need updating

Goal:
1. Make the filter tray micro-peek single-line and less wasteful.
2. Use a dynamic icon beside the active filter text.
3. Remove visual “FILTER” eyebrow from the collapsed/micro state.
4. Fix duplicate `id="store-filter-current"` if still present.
5. Move toast feedback into the active UI context so it does not overlap dock/sheets.

====================================================================
A. FILTER TRAY MICRO-PEEK: SINGLE-LINE DESIGN
====================================================================

Current issue:
The collapsed filter tray is too tall/verbose because it shows:
FILTER
All

Desired visual:
[dynamic icon] All                  5 produk   [arrow]

No visible eyebrow in the micro-peek state.

Important:
- “Filter” can remain in aria-label, but should not appear as a separate visual row in collapsed state.
- The active filter text should be a single-line value: All / Fashion / Skincare / Workspace / Tech / Etc.
- The icon should change according to active filter.
- Count remains on the right.
- Arrow remains on the far right.

Replace current peek markup with a single-line structure like:

<button
  class="store-filter-outline__peek"
  id="store-filter-toggle"
  type="button"
  aria-expanded="false"
  aria-controls="store-filter-panel"
  aria-label="Open Store filter"
>
  <span class="store-filter-outline__main">
    <span class="gg-icon store-filter-outline__current-icon" id="store-filter-current-icon" aria-hidden="true">filter_list</span>
    <span class="store-filter-outline__current" id="store-filter-current">All</span>
  </span>
  <span class="store-filter-outline__count" id="store-filter-count">0 produk</span>
  <span class="gg-icon store-filter-outline__icon" id="store-filter-toggle-icon" aria-hidden="true">keyboard_arrow_up</span>
</button>

Remove from visual micro-peek:
- `.store-filter-outline__eyebrow`
- visual text “FILTER”
- nested duplicate icon inside `#store-filter-current`

Acceptance:
- Collapsed filter tray is one line.
- It does not waste vertical space.
- It reads visually as “icon + active filter + count + arrow”.
- There is no duplicate `id="store-filter-current"`.
- `document.getElementById('store-filter-current')` returns only the active filter label element.

====================================================================
B. FILTER ICON MAP
====================================================================

Add a dynamic icon map for filter state.

Suggested:

var STORE_FILTER_ICON_MAP = {
  all: 'filter_list',
  fashion: 'checkroom',
  skincare: 'spa',
  workspace: 'desktop_windows',
  tech: 'devices',
  etc: 'category'
};

If some Material Symbols names are not available in the current font subset, either:
- ensure the font request includes these icon names if using icon_names,
or
- choose existing loaded icons,
or
- do not restrict icon_names in the font URL.

Update filter peek whenever active filter changes:
- Update `#store-filter-current` text.
- Update `#store-filter-current-icon` icon text.
- Update `#store-filter-count` as before.
- Update `#store-filter-toggle-icon`:
  - collapsed/micro: `keyboard_arrow_up`
  - expanded: `keyboard_arrow_down`

Acceptance:
- All → filter_list
- Fashion → checkroom
- Skincare → spa
- Workspace → desktop_windows
- Tech → devices
- Etc → category
- If icon unavailable, fallback to filter_list.
- Arrow reflects collapsed/expanded state.

====================================================================
C. FILTER TRAY CSS CLEANUP
====================================================================

Update CSS for the single-line micro-peek.

Suggested:

.store-filter-outline__peek {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: var(--gg-hit-min);
  padding: 9px 12px;
  border: 0;
  background: transparent;
  color: var(--gg-ink);
  text-align: left;
}

.store-filter-outline__main {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.store-filter-outline__current-icon {
  flex: 0 0 auto;
  font-size: 17px;
  color: var(--gg-accent-soft);
}

.store-filter-outline__current {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 760 15px/1.15 var(--gg-font-sans);
  letter-spacing: -.025em;
}

.store-filter-outline__count {
  color: var(--gg-ink-soft);
  font: 650 12px/1.15 var(--gg-font-sans);
  white-space: nowrap;
}

Remove or stop using:
.store-filter-outline__eyebrow
.store-filter-outline__label-icon if only used for the old eyebrow

Keep expanded panel unchanged unless necessary.

Acceptance:
- Looks compact.
- Count and arrow stay aligned right.
- Long category labels truncate instead of wrapping.
- Hidden-by-scroll still moves tray to bottom viewport.
- Sheet active still hides/inerts tray.

====================================================================
D. TOAST PLACEMENT: CONTEXTUAL, NOT GLOBAL OVERLAP
====================================================================

Current issue:
Toast is fixed near bottom of viewport and may overlap with dock, filter tray, or appear outside the active sheet context.

Goal:
Toast should appear inside or attached to the active interaction context:
- Preview toast near Save/Copy secondary action row.
- Saved toast inside Saved sheet body or near top of saved results.
- Discovery toast rarely needed; if used, inside Discovery sheet.
- Fallback global toast should avoid dock/filter tray.

Preferred implementation:
Keep one toast element, but place it contextually if possible.

Option 1, preferred:
Create local toast containers:
- `#store-preview-toast` inside `.store-preview__surface` near secondary action row
- `#store-saved-toast` inside saved sheet body
- optional `#store-discovery-toast`

Example:

<div class="store-inline-toast" id="store-preview-toast" role="status" aria-live="polite" hidden></div>

Place preview toast:
- after `.store-preview__secondary-actions`
- before notes

Place saved toast:
- above `#store-saved-results`

Then update showToast(message, context):
- context "preview" → use preview toast
- context "saved" → use saved toast
- context "discovery" → use discovery toast if exists
- fallback → use global toast but position above dock/filter safely

Option 2, if keeping global toast:
Set bottom offset dynamically:
- when no sheet active:
  bottom: calc(var(--gg-dock-clearance) + 54px)
- when panel active:
  place toast inside panel instead of viewport bottom

Do not let toast sit underneath:
- dock
- filter tray
- sheet handle
- marketplace CTA row

Recommended CSS for inline toast:

.store-inline-toast {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  max-width: min(100%, 320px);
  padding: 0 14px;
  border: 1px solid var(--gg-line-strong);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gg-surface-interactive-strong) 88%, transparent);
  color: var(--gg-ink);
  font: 700 12px/1.2 var(--gg-font-sans);
  text-align: center;
  box-shadow: var(--gg-shadow-soft);
}

.store-inline-toast[hidden] {
  display: none !important;
}

Acceptance:
- Save toast appears in preview sheet, near secondary actions.
- Copy success/failure toast appears in preview sheet, not over dock.
- Remove-from-saved toast appears in Saved sheet.
- Toast does not overlap dock/filter tray.
- Toast remains accessible with role="status" aria-live="polite".
- Toast disappears after the existing duration.

====================================================================
E. TOAST JS BEHAVIOR
====================================================================

Update toast function.

Suggested:

function showToast(message, context) {
  var node =
    context === 'preview' ? previewToast :
    context === 'saved' ? savedToast :
    context === 'discovery' ? discoveryToast :
    globalToast;

  if (!node) return;

  node.textContent = message;
  node.hidden = false;

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(function () {
    node.hidden = true;
    node.textContent = '';
  }, 1600);
}

Update callers:
- Save product → showToast(copy('savedToast'), 'preview')
- Remove from saved inside Saved sheet → showToast(copy('removedToast'), 'saved')
- Copy links success → showToast(copy('copyToast'), 'preview')
- Copy links failure → showToast(copy('copyFailToast'), 'preview')

If the same timer is shared across contexts, ensure previously visible toast is hidden before showing another.
A simple helper can hide all toast nodes first.

Acceptance:
- Multiple quick interactions do not leave stale toast text.
- Toast context is correct.
- No silent copy failure.

====================================================================
F. ACCESSIBILITY CHECKS
====================================================================

Ensure:
- Filter tray button has clear aria-label.
- Filter tray expanded state updates aria-expanded true/false.
- Dynamic icon is aria-hidden.
- Active filter text is visible text.
- Toast role/status remains polite.
- Toast is not focusable.
- Closed sheets still use hidden + aria-hidden + inert.

Acceptance:
- Keyboard users can activate filter tray.
- Screen reader users hear active filter state through visible label/count or aria-label.
- Toast announcements are not disruptive.

====================================================================
G. UPDATE QA
====================================================================

Update qa/store-artifact-smoke.sh if needed.

Add checks:
- no duplicate `id="store-filter-current"`
- `id="store-filter-current-icon"` exists
- visual `FILTER` eyebrow old structure is absent or not used in peek
- filter peek contains current icon + current text + count + toggle icon
- toast inline containers exist:
  - `store-preview-toast`
  - `store-saved-toast`
- copy/save code calls toast with preview context
- remove saved code calls toast with saved context
- global fixed toast does not remain the only toast mechanism if inline toasts are added

Keep existing checks:
- no store-topbar
- no store-card__quick
- no Read the article
- no visible close button
- dock Store / Contact / Discover / Saved / More
- WhatsApp href is full https://wa.me/
- hidden sheets use hidden/aria-hidden/inert

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker

Do not run live smoke as a pre-deploy blocker.

====================================================================
FINAL ACCEPTANCE
====================================================================

Done only if:
- Filter tray collapsed state is one-line.
- Dynamic icon changes with active filter.
- No duplicate `store-filter-current` ID.
- Count and arrow align cleanly.
- Toast feedback appears inside active sheet context.
- Toast never overlaps dock/filter tray.
- Save, Copy, and Remove feedback still work.
- Accessibility hidden-state remains intact.
- Store dock and route contracts remain unchanged.