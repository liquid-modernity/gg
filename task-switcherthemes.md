TASK: Add Appearance Switcher to More Sheet

File:
- index.xml

Goal:
Add a small Apple-HIG-like Appearance control inside the existing More sheet, near the existing language switcher. The control must support three modes: System, Light, and Dark. Default mode must be System.

Placement:
- Locate the existing More panel:
  #gg-more-panel
  section.gg-more-sheet.gg-sheet__panel
- Keep existing .gg-more-list.
- Keep existing .gg-langswitch.
- Insert the new appearance switcher after .gg-langswitch and before .gg-more-footer.

Do not:
- Do not move the dock.
- Do not add an Appearance button to the dock.
- Do not add it to top actions.
- Do not replace Material Symbols.
- Do not change route logic, Blogger widgets, SSR contracts, canonical logic, or Worker logic.
- Do not solve live drift/proof failures in this task.
- Do not publish. Local XML only.

Markup requirement:
Add a block parallel to .gg-langswitch:

<div class='gg-appearance' data-gg-module='appearance'>
  <p class='gg-appearance__title' data-gg-copy='appearance.label' id='gg-appearance-title'>Appearance</p>
  <div aria-labelledby='gg-appearance-title' class='gg-appearance__actions' role='group'>
    <button class='gg-appearance__button' data-gg-active='false' data-gg-copy='appearance.system' data-gg-theme-option='system' type='button'>System</button>
    <button class='gg-appearance__button' data-gg-active='false' data-gg-copy='appearance.light' data-gg-theme-option='light' type='button'>Light</button>
    <button class='gg-appearance__button' data-gg-active='false' data-gg-copy='appearance.dark' data-gg-theme-option='dark' type='button'>Dark</button>
  </div>
</div>

CSS requirement:
- Style .gg-appearance as a sibling system to .gg-langswitch.
- Reuse visual grammar from .gg-langswitch.
- Buttons must have at least 44px hit target.
- Keep visual density compact.
- Use calm segmented-control styling.
- Active state must use surface/background and aria-pressed, not icon fill.
- Do not create a visually loud settings card.

Suggested CSS:
.gg-appearance {
  display: grid;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--gg-line);
}

.gg-appearance__title {
  margin: 0;
  color: var(--gg-accent-soft);
  font: 650 11px/1.2 var(--gg-font-sans);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.gg-appearance__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.gg-appearance__button {
  min-height: var(--gg-hit-min, 44px);
  padding: 0 10px;
  border: 1px solid var(--gg-border-interactive);
  border-radius: 999px;
  background: var(--gg-surface-interactive);
  color: var(--gg-accent-soft);
  font: 600 12px/1.2 var(--gg-font-sans);
  cursor: pointer;
}

.gg-appearance__button:hover,
.gg-appearance__button:focus-visible,
.gg-appearance__button[data-gg-active='true'],
.gg-appearance__button[aria-pressed='true'] {
  background: var(--gg-surface-interactive-strong);
  color: var(--gg-ink);
  border-color: var(--gg-line-strong);
}

Theme behavior:
- Add theme state to JS:
  state.theme = 'system';

- Add UI query:
  themeButtons: document.querySelectorAll('[data-gg-theme-option]')

- Add storage key:
  gg:theme

- Valid values:
  system
  light
  dark

- On boot:
  read localStorage.getItem('gg:theme')
  if value is light or dark, set document.documentElement.setAttribute('data-gg-theme', value)
  if value is system or invalid, remove data-gg-theme

- On click:
  setTheme(option)
  persist to localStorage as gg:theme
  sync theme buttons
  update aria-pressed and data-gg-active

CSS theme contract:
- Existing default CSS and @media (prefers-color-scheme: dark) should remain the System mode.
- Add explicit overrides:
  html[data-gg-theme='light'] { color-scheme: light; }
  html[data-gg-theme='dark'] { color-scheme: dark; }

- For explicit light mode, ensure dark media query does not override the light tokens.
- For explicit dark mode, apply the same token set currently used in @media (prefers-color-scheme: dark).

Preferred pattern:
1. Keep :root as light.
2. Keep @media (prefers-color-scheme: dark) for System mode.
3. Add html[data-gg-theme='dark'] token block equal to dark tokens.
4. Add @media (prefers-color-scheme: dark) { html[data-gg-theme='light'] { ...light tokens... } } only if needed to force light tokens when system is dark.

No-flash requirement:
Add a tiny early head script before CSS paint if possible:

<script>
(function () {
  try {
    var theme = window.localStorage && window.localStorage.getItem('gg:theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-gg-theme', theme);
    }
  } catch (error) {}
}());
</script>

Copy registry:
Add bilingual copy keys:
appearance.label
appearance.system
appearance.light
appearance.dark

English:
Appearance
System
Light
Dark

Indonesian:
Tampilan
Sistem
Terang
Gelap

QA:
- Open More sheet.
- Verify Language and Appearance both render cleanly.
- Click System, Light, Dark.
- Verify aria-pressed changes correctly.
- Verify data-gg-active changes correctly.
- Verify html[data-gg-theme] is removed for system.
- Verify html[data-gg-theme='light'] for light.
- Verify html[data-gg-theme='dark'] for dark.
- Reload page and verify preference persists.
- Test while OS/browser is dark: System follows OS, Light forces light, Dark forces dark.
- Test while OS/browser is light: System follows OS, Light forces light, Dark forces dark.
- Confirm no route contract changed.
- Confirm no Blogger XML syntax error.
- Run:
  node qa/template-fingerprint.mjs --check
  npm run gaga:template:status
  npm run gaga:template:proof

Acceptance criteria:
- Appearance switcher appears inside More sheet after Language.
- Default is System.
- User override persists.
- No visual bloat.
- No dock/top-action pollution.
- No SSR/route changes.
- No new external dependency.