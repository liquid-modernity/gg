# KEYBOARD_TRAP_SWEEP
Last updated: 2026-02-21

Use this checklist for repeatable manual QA. Mark each item pass/fail and note the page URL tested.

## Panels (post surface)
- [ ] Open left panel: `Tab` / `Shift+Tab` stays inside panel.
- [ ] Left panel: `Escape` closes panel.
- [ ] Left panel: focus returns to the exact trigger.
- [ ] Open right panel: `Tab` / `Shift+Tab` stays inside panel.
- [ ] Right panel: `Escape` closes panel.
- [ ] Right panel: focus returns to the exact trigger.
- [ ] Open right then left: only one panel remains open at a time.

## Share sheet (true modal)
- [ ] Open share sheet: focus enters dialog.
- [ ] `Tab` cycles within dialog only.
- [ ] `Shift+Tab` cycles within dialog only.
- [ ] `Escape` closes share sheet.
- [ ] Focus returns to the trigger.

## Comments help modal (true modal)
- [ ] Open comments help: focus enters dialog.
- [ ] `Tab` / `Shift+Tab` stays inside dialog.
- [ ] `Escape` closes dialog.
- [ ] Focus returns to the trigger.

## Overlay (if used as true modal)
- [ ] Open overlay: focus enters overlay dialog.
- [ ] `Tab` / `Shift+Tab` stays inside.
- [ ] `Escape` closes overlay.
- [ ] Focus returns to the trigger.

## Search dock (combobox + listbox, not modal)
- [ ] Open search listbox from dock input.
- [ ] Focus stays on input while listbox is open.
- [ ] Arrow keys update `aria-activedescendant`.
- [ ] `Escape` closes listbox and keeps focus in input.
- [ ] `Tab` leaves naturally to the next focusable element (no trap).
