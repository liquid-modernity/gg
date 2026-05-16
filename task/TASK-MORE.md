# TASK-MORE-001 — Native App More Sheet Enhancement

## Status
Ready for implementation

## Objective
Meningkatkan tampilan dan perilaku `More Sheet` agar terasa seperti native app settings surface: rapi, premium, touch-first, konsisten dengan dark/light mode, serta tetap aman untuk Blogger XML, SEO, dan performa.

Target visual mengacu pada mockup:
- Header sheet dengan handle dan title `More`
- Profile/account card di bagian atas
- Grouped card untuk Navigation, Discover, Info, Preferences
- Preferences row-style: `Language`, `Appearance`, `Reading`, `Motion`
- Local search bar sticky di atas footer
- Share block yang rapi
- Footer legal yang halus
- Rasio visual mobile 9:16, tetapi tetap responsif untuk sheet width ±600px

---

## Scope

### A. XML / HTML
Update struktur HTML `More Sheet` di `index.xml` atau partial terkait.

### B. CSS
Replace atau refactor `more.css` agar tidak ada rule dobel, tabrakan cascade, atau style warisan yang merusak visual.

### C. JS Brain
Update `gg-app` / module terkait More Sheet untuk:
- local search/filter di dalam More Sheet
- sync value Preferences
- profile card interaction
- state attribute untuk active/current row
- optional progressive enhancement untuk Preferences panels

---

# 1. HTML/XML Requirements

## 1.1 Preserve Existing Navigation Semantics

Navigation wajib tetap:

```html
<a data-gg-more-route="home" href="/landing">Home</a>
<a data-gg-more-route="blog" href="/">Blog</a>
<a data-gg-more-route="store" href="/store">Store</a>
<a data-gg-more-route="contact" href="/landing#contact">Contact</a>

Route truth:

Home = /landing
Blog = /
Store = /store
Contact = /landing#contact

Jangan ubah IA publik.

1.2 Add Profile Card

Tambahkan profile card di bagian atas .gg-more-body, sebelum Navigation.

<section class='gg-more-profile' data-gg-module='profile'>
  <a class='gg-more-profile__card' href='/p/about.html' aria-label='Open profile'>
    <span class='gg-more-profile__avatar' aria-hidden='true'>
      <img class='gg-more-profile__image' src='PROFILE_IMAGE_URL' alt='' loading='lazy'/>
    </span>
    <span class='gg-more-profile__copy'>
      <span class='gg-more-profile__name'>PakRPP</span>
      <span class='gg-more-profile__meta'>Editorial tools, learning resources, and digital workspace</span>
    </span>
    <span class='gg-more-profile__chevron' aria-hidden='true'>›</span>
  </a>
</section>

Notes:

Kalau belum ada foto final, gunakan logo/avatar fallback.
Jangan pakai nama dummy seperti Jane Cheng di production.
alt='' boleh karena avatar dekoratif; nama sudah tersedia di teks.
1.3 Preferences Structure

Jangan pakai segmented control permanen untuk Preferences utama. Gunakan grouped row-style agar terasa seperti native settings.

Gunakan row berikut:

<section aria-labelledby='gg-more-preferences-title' class='gg-more-section gg-more-section--preferences'>
  <h3 class='gg-more-section__title' data-gg-copy='more.section.preferences' id='gg-more-preferences-title'>Preferences</h3>

  <div class='gg-more-list gg-more-preferences-list'>
    <button class='gg-more-list__link gg-more-pref-row' data-gg-pref-open='language' type='button'>
      <span class='gg-more-row__icon' aria-hidden='true'>◎</span>
      <span class='gg-more-row__label' data-gg-copy='more.section.language'>Language</span>
      <span class='gg-more-row__value' data-gg-pref-value='language'>English</span>
    </button>

    <button class='gg-more-list__link gg-more-pref-row' data-gg-pref-open='appearance' type='button'>
      <span class='gg-more-row__icon' aria-hidden='true'>◐</span>
      <span class='gg-more-row__label' data-gg-copy='more.section.appearance'>Appearance</span>
      <span class='gg-more-row__value' data-gg-pref-value='appearance'>System</span>
    </button>

    <button class='gg-more-list__link gg-more-pref-row' data-gg-pref-open='reading' type='button'>
      <span class='gg-more-row__icon' aria-hidden='true'>Aa</span>
      <span class='gg-more-row__label' data-gg-copy='more.section.reading'>Reading</span>
      <span class='gg-more-row__value' data-gg-pref-value='reading'>Comfortable</span>
    </button>

    <button class='gg-more-list__link gg-more-pref-row' data-gg-pref-open='motion' type='button'>
      <span class='gg-more-row__icon' aria-hidden='true'>↝</span>
      <span class='gg-more-row__label' data-gg-copy='more.section.motion'>Motion</span>
      <span class='gg-more-row__value' data-gg-pref-value='motion'>Balanced</span>
    </button>
  </div>
</section>

Hard truth: <details> tanpa JS tadi terbukti buruk secara visual. Untuk production-quality, gunakan button row + JS panel/sheet kecil. Jangan paksa native details kalau hasilnya bocor seperti screenshot.

1.4 Preference Panels

Tambahkan panel tersembunyi di dalam More Sheet, bukan navigasi page baru.

<div class='gg-more-pref-panels' data-gg-pref-panels hidden='hidden'>
  <section class='gg-more-pref-panel' data-gg-pref-panel='language' hidden='hidden'>
    <header class='gg-more-pref-panel__head'>
      <button class='gg-more-pref-panel__back' data-gg-pref-back='true' type='button'>‹</button>
      <h4 class='gg-more-pref-panel__title'>Language</h4>
    </header>
    <div class='gg-more-pref-panel__options' role='group' aria-label='Language'>
      <button class='gg-more-pref-option' data-gg-lang-option='en' type='button'>English</button>
      <button class='gg-more-pref-option' data-gg-lang-option='id' type='button'>Bahasa Indonesia</button>
    </div>
  </section>

  <section class='gg-more-pref-panel' data-gg-pref-panel='appearance' hidden='hidden'>
    <header class='gg-more-pref-panel__head'>
      <button class='gg-more-pref-panel__back' data-gg-pref-back='true' type='button'>‹</button>
      <h4 class='gg-more-pref-panel__title'>Appearance</h4>
    </header>
    <div class='gg-more-pref-panel__options' role='group' aria-label='Appearance'>
      <button class='gg-more-pref-option' data-gg-theme-option='system' type='button'>System</button>
      <button class='gg-more-pref-option' data-gg-theme-option='light' type='button'>Light</button>
      <button class='gg-more-pref-option' data-gg-theme-option='dark' type='button'>Dark</button>
    </div>
  </section>

  <section class='gg-more-pref-panel' data-gg-pref-panel='reading' hidden='hidden'>
    <header class='gg-more-pref-panel__head'>
      <button class='gg-more-pref-panel__back' data-gg-pref-back='true' type='button'>‹</button>
      <h4 class='gg-more-pref-panel__title'>Reading</h4>
    </header>
    <div class='gg-more-pref-panel__options' role='group' aria-label='Reading'>
      <button class='gg-more-pref-option' data-gg-reading-option='comfortable' type='button'>Comfortable</button>
      <button class='gg-more-pref-option' data-gg-reading-option='compact' type='button'>Compact</button>
      <button class='gg-more-pref-option' data-gg-reading-option='focus' type='button'>Focus</button>
    </div>
  </section>

  <section class='gg-more-pref-panel' data-gg-pref-panel='motion' hidden='hidden'>
    <header class='gg-more-pref-panel__head'>
      <button class='gg-more-pref-panel__back' data-gg-pref-back='true' type='button'>‹</button>
      <h4 class='gg-more-pref-panel__title'>Motion</h4>
    </header>
    <div class='gg-more-pref-panel__options' role='group' aria-label='Motion'>
      <button class='gg-more-pref-option' data-gg-motion-option='balanced' type='button'>Balanced</button>
      <button class='gg-more-pref-option' data-gg-motion-option='reduced' type='button'>Reduced</button>
    </div>
  </section>
</div>
1.5 Add Local Search Bar Sticky Above Footer

Search bar wajib berada setelah Preferences dan sebelum Share/Footer.

<div class='gg-more-local-search' data-gg-module='more-local-search'>
  <label class='gg-more-local-search__label' for='gg-more-local-search-input'>Search More</label>
  <div class='gg-more-local-search__field'>
    <span class='gg-more-local-search__icon' aria-hidden='true'>⌕</span>
    <input
      autocomplete='off'
      class='gg-more-local-search__input'
      data-gg-more-search-input='true'
      id='gg-more-local-search-input'
      placeholder='Search'
      type='search'/>
  </div>
</div>

Behavior:

Sticky di atas footer/share ketika scroll.
Filter item lokal: Navigation, Discover, Info, Preferences.
Jangan membuka global search/discovery. Ini hanya search lokal More Sheet.
2. CSS Requirements
2.1 Replace Old More CSS

Hapus style lama untuk:

.gg-more-body
.gg-more-section__title
.gg-more-grid
.gg-more-list
.gg-more-list__link
.gg-langswitch*
.gg-appearance*
.gg-more-footer*

Masalah lama: CSS dobel dan saling menimpa. Jangan ulangi.

2.2 Visual Tokens

Gunakan prinsip:

border radius card: 15px–18px
row min-height: 48px
icon width: 28px
side padding: 15px–18px
active state: left rail kecil, bukan full gray block
dark mode: translucent native-card feel
footer: segmented share, bukan teks mentah
2.3 Required CSS Skeleton
/* More Sheet Layout */
.gg-more-sheet {
  display: grid;
  align-content: start;
}

.gg-more-body {
  display: grid;
  gap: 18px;
  padding: 14px 0 8px;
}

/* Profile */
.gg-more-profile__card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 86px;
  padding: 14px 18px;
  border: 1px solid var(--gg-divider);
  border-radius: 18px;
  background: var(--gg-surface-interactive);
  color: var(--gg-ink);
  text-decoration: none;
}

.gg-more-profile__avatar {
  width: 58px;
  height: 58px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gg-surface-interactive-strong);
}

.gg-more-profile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gg-more-profile__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.gg-more-profile__name {
  overflow: hidden;
  color: var(--gg-ink);
  font: 650 20px/1.15 var(--gg-font-sans);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gg-more-profile__meta {
  overflow: hidden;
  color: var(--gg-accent-soft);
  font: 500 13px/1.25 var(--gg-font-sans);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gg-more-profile__chevron {
  color: var(--gg-accent-soft);
  font: 400 24px/1 var(--gg-font-sans);
}

/* Section */
.gg-more-section {
  display: grid;
  gap: 7px;
  padding-top: 0;
  border-top: 0;
}

.gg-more-section__title,
.gg-more-footer__label {
  margin: 0;
  padding: 0 3px;
  color: var(--gg-accent-soft);
  font: 600 12px/1.2 var(--gg-font-sans);
  letter-spacing: .12em;
  text-transform: uppercase;
}

/* Grouped Cards */
.gg-more-grid,
.gg-more-list {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  border: 1px solid var(--gg-divider);
  border-radius: 16px;
  background: var(--gg-surface-interactive);
}

/* Rows */
.gg-more-list__link,
.gg-more-grid .gg-more-list__link {
  position: relative;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  align-items: center;
  min-height: 52px;
  width: 100%;
  padding: 0 38px 0 15px;
  border: 0;
  border-bottom: 1px solid var(--gg-divider);
  border-radius: 0;
  background: transparent;
  color: var(--gg-ink);
  font: 500 15px/1.25 var(--gg-font-sans);
  text-align: left;
  text-decoration: none;
  appearance: none;
  cursor: pointer;
}

.gg-more-list__link:last-child,
.gg-more-grid .gg-more-list__link:last-child {
  border-bottom: 0;
}

.gg-more-list__link::after,
.gg-more-grid .gg-more-list__link::after {
  content: "›";
  position: absolute;
  right: 15px;
  top: 50%;
  color: var(--gg-accent-soft);
  font: 400 23px/1 var(--gg-font-sans);
  opacity: .82;
  transform: translateY(-52%);
}

.gg-more-list__link[aria-current='page'],
.gg-more-list__link[data-gg-active='true'] {
  background: color-mix(in srgb, var(--gg-surface-interactive-strong) 72%, transparent);
}

.gg-more-list__link[aria-current='page']::before,
.gg-more-list__link[data-gg-active='true']::before {
  content: "";
  position: absolute;
  left: 0;
  top: 11px;
  bottom: 11px;
  width: 3px;
  border-radius: 999px;
  background: var(--gg-accent);
}

.gg-more-list__link:hover,
.gg-more-list__link:focus-visible {
  background: var(--gg-surface-quiet);
  outline: 0;
}

/* Optional row internals */
.gg-more-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  color: var(--gg-accent-soft);
  font: 500 16px/1 var(--gg-font-sans);
}

.gg-more-row__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gg-more-row__value {
  color: var(--gg-accent-soft);
  font: 500 14px/1.25 var(--gg-font-sans);
  white-space: nowrap;
}

/* Local Search */
.gg-more-local-search {
  position: sticky;
  bottom: calc(var(--gg-more-footer-height, 96px) + 8px);
  z-index: 3;
  display: grid;
  gap: 0;
}

.gg-more-local-search__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.gg-more-local-search__field {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  align-items: center;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--gg-divider);
  border-radius: 14px;
  background: var(--gg-surface-interactive);
}

.gg-more-local-search__icon {
  color: var(--gg-accent-soft);
  font: 500 18px/1 var(--gg-font-sans);
}

.gg-more-local-search__input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--gg-ink);
  font: 500 15px/1.25 var(--gg-font-sans);
  outline: 0;
}

/* Footer */
.gg-more-footer {
  display: grid;
  gap: 8px;
  margin-top: 0;
  padding: 0 0 6px;
  border-top: 0;
}

.gg-more-footer__social {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.gg-more-footer__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--gg-divider);
  border-radius: 13px;
  background: var(--gg-surface-interactive);
  color: var(--gg-ink);
  font: 600 13px/1.2 var(--gg-font-sans);
  text-decoration: none;
}

.gg-more-footer__legal {
  display: block;
  margin: 6px 0 0;
  color: var(--gg-accent-soft);
  font: 500 11px/1.45 var(--gg-font-sans);
  text-align: center;
  opacity: .72;
}

/* Hidden filtered rows */
.gg-more-list__link[hidden],
.gg-more-grid .gg-more-list__link[hidden],
.gg-more-section[data-gg-filter-empty='true'] {
  display: none;
}
3. JavaScript Brain Requirements
3.1 More Local Search

Implement local filter.

Target:

Search query filters visible rows inside .gg-more-body
Match against textContent and data-gg-copy
Hide sections with no matching rows
Profile card may remain visible unless query is active; when query active and profile does not match, hide profile
Footer remains visible
Search bar remains visible

Pseudo:

function initMoreLocalSearch(root) {
  const input = root.querySelector('[data-gg-more-search-input]');
  if (!input) return;

  const searchableSections = root.querySelectorAll(
    '.gg-more-profile, .gg-more-section'
  );

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();

    searchableSections.forEach((section) => {
      const rows = section.querySelectorAll(
        '.gg-more-list__link, .gg-more-profile__card'
      );

      if (!q) {
        section.removeAttribute('data-gg-filter-empty');
        rows.forEach((row) => row.hidden = false);
        return;
      }

      let hasMatch = false;

      rows.forEach((row) => {
        const haystack = [
          row.textContent || '',
          row.getAttribute('data-gg-copy') || '',
          row.getAttribute('data-gg-more-route') || '',
          row.getAttribute('data-gg-pref-open') || ''
        ].join(' ').toLowerCase();

        const match = haystack.includes(q);
        row.hidden = !match;
        if (match) hasMatch = true;
      });

      section.toggleAttribute('data-gg-filter-empty', !hasMatch);
    });
  });
}
3.2 Preferences Panel Brain

Implement simple panel navigation.

Behavior:

Click row with data-gg-pref-open='language' opens panel.
.gg-more-pref-panels becomes visible.
Matching .gg-more-pref-panel becomes visible.
Back closes panel.
Escape closes panel.
After selecting option, update:
actual app state
aria-pressed
data-gg-active
visible row value [data-gg-pref-value]

Required state attributes:

html[data-gg-theme='system|light|dark']
html[data-gg-reading='comfortable|compact|focus']
html[data-gg-motion='balanced|reduced']
existing language state, according to current app architecture

Pseudo:

function initMorePreferences(root) {
  const panelRoot = root.querySelector('[data-gg-pref-panels]');
  if (!panelRoot) return;

  const openers = root.querySelectorAll('[data-gg-pref-open]');
  const panels = panelRoot.querySelectorAll('[data-gg-pref-panel]');
  const backButtons = panelRoot.querySelectorAll('[data-gg-pref-back]');

  function openPanel(name) {
    panelRoot.hidden = false;
    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute('data-gg-pref-panel') !== name;
    });
    root.setAttribute('data-gg-pref-active', name);
  }

  function closePanel() {
    panelRoot.hidden = true;
    panels.forEach((panel) => panel.hidden = true);
    root.removeAttribute('data-gg-pref-active');
  }

  openers.forEach((button) => {
    button.addEventListener('click', () => {
      openPanel(button.getAttribute('data-gg-pref-open'));
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener('click', closePanel);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panelRoot.hidden) closePanel();
  });
}
3.3 Preference Values

Add helpers:

function setMorePrefValue(root, key, label) {
  const target = root.querySelector(`[data-gg-pref-value="${key}"]`);
  if (target) target.textContent = label;
}

Value mapping:

language:
en → English
id → Bahasa Indonesia
appearance:
system → System
light → Light
dark → Dark
reading:
comfortable → Comfortable
compact → Compact
focus → Focus
motion:
balanced → Balanced
reduced → Reduced

Persist:

Theme: existing gg:theme
Language: existing language mechanism
Reading: localStorage.setItem('gg:reading', value)
Motion: localStorage.setItem('gg:motion', value)

Apply on bootstrap:

document.documentElement.setAttribute('data-gg-reading', storedReading || 'comfortable');
document.documentElement.setAttribute('data-gg-motion', storedMotion || 'balanced');
4. Reading Mode CSS Behavior

Implement basic reading state.

html[data-gg-reading='compact'] {
  --gg-entry-density-scale: .92;
}

html[data-gg-reading='comfortable'] {
  --gg-entry-density-scale: 1;
}

html[data-gg-reading='focus'] {
  --gg-entry-density-scale: 1.05;
}

Then apply only where safe:

article body
entry rows
preview text
not global nav/dock sizes

Do not break hit targets. Minimum touch target remains 44px.

5. Motion Preference CSS Behavior
html[data-gg-motion='reduced'] *,
html[data-gg-motion='reduced'] *::before,
html[data-gg-motion='reduced'] *::after {
  scroll-behavior: auto !important;
  transition-duration: .01ms !important;
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
}

Also respect system setting:

@media (prefers-reduced-motion: reduce) {
  html:not([data-gg-motion='balanced']) *,
  html:not([data-gg-motion='balanced']) *::before,
  html:not([data-gg-motion='balanced']) *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
  }
}
6. Acceptance Criteria
Visual
More Sheet visually resembles native app settings surface.
Profile card appears above Navigation.
Navigation, Discover, Info, Preferences are grouped cards.
Current page uses subtle left rail, not ugly full-row block.
Preferences rows show label + current value + chevron.
Local search bar appears above Share/Footer and remains sticky during sheet scroll.
Share links appear as clean buttons, not raw X FB WA text.
Footer legal text is centered and subtle.
Interaction
Navigation links still route correctly.
Search filters local More Sheet rows only.
Preference rows open panels.
Back closes preference panel.
Escape closes preference panel.
Selecting preference updates active option and row value.
Theme continues to work.
Language continues to work.
Reading and Motion persist across reloads.
Accessibility
Buttons have correct type='button'.
Links remain links.
Search input has label.
Preference panel back button is keyboard accessible.
Focus visible remains clear.
Minimum hit target remains at least 44px.
Motion preference respects reduced motion.
Performance
No external dependency.
No heavy icon library required.
No layout thrashing on search.
No network request for local search.
No Worker-authored UI required.
Blogger/XML Safety
XML must validate.
All attributes use single quotes in XML template where appropriate.
Every <div>, <section>, <footer>, and <details> if used must close cleanly.
Avoid unescaped &.
Do not introduce invalid nested interactive elements.
7. QA Checklist

Run after implementation:

(() => {
  const more = document.querySelector('.gg-more-body');
  return {
    hasMoreBody: !!more,
    hasProfile: !!document.querySelector('.gg-more-profile__card'),
    hasNavigation: !!document.querySelector('.gg-more-section--navigation'),
    hasPreferences: !!document.querySelector('.gg-more-section--preferences'),
    hasLocalSearch: !!document.querySelector('[data-gg-more-search-input]'),
    hasFooter: !!document.querySelector('.gg-more-footer'),
    currentRows: [...document.querySelectorAll('.gg-more-list__link[aria-current="page"], .gg-more-list__link[data-gg-active="true"]')].map(el => el.textContent.trim()),
    prefRows: [...document.querySelectorAll('[data-gg-pref-open]')].map(el => el.getAttribute('data-gg-pref-open')),
    panels: [...document.querySelectorAll('[data-gg-pref-panel]')].map(el => el.getAttribute('data-gg-pref-panel'))
  };
})();

Expected:

{
  hasMoreBody: true,
  hasProfile: true,
  hasNavigation: true,
  hasPreferences: true,
  hasLocalSearch: true,
  hasFooter: true,
  currentRows: ["Blog"], // depends current route
  prefRows: ["language", "appearance", "reading", "motion"],
  panels: ["language", "appearance", "reading", "motion"]
}

Search test:

(() => {
  const input = document.querySelector('[data-gg-more-search-input]');
  input.value = 'privacy';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return [...document.querySelectorAll('.gg-more-list__link:not([hidden])')]
    .map(el => el.textContent.trim());
})();

Expected:

Visible result includes Privacy Policy
Irrelevant rows hidden
Footer/search remain visible
8. Implementation Order
Clean old more.css.
Implement profile card HTML.
Convert Navigation/Discover/Info rows to icon-capable row structure if desired.
Add Preferences rows.
Add Preference panels.
Add local search bar before footer.
Restyle footer.
Implement JS local search.
Implement JS preference panels.
Implement reading/motion persistence.
Run XML validation.
Run visual smoke test on:
/landing
/
/store
one post detail page
one static page
9. Non-Goals

Do not:

Replace Blogger native routing.
Add external JS/CSS libraries.
Add full account/auth system.
Use fake settings that do nothing.
Keep old duplicated CSS.
Use <details> for Preferences if visual quality remains poor.
Turn More Sheet into admin dashboard.
10. Final Direction

Use this model:

Profile
Navigation
Discover
Info
Preferences
Sticky local search
Share
Legal footer

Keep the sheet calm, dense, and native-feeling. The goal is not “more features”; the goal is controlled hierarchy, fast interaction, and premium restraint.


Kritik penting: jangan implementasikan mockup secara mentah dengan icon random dan profile dummy. Yang harus Anda ambil dari mockup adalah **struktur rasa native app-nya**: grouped cards, profile identity, row value, chevron, sticky local search, dan footer yang rapi. Kalau Anda meniru terlalu literal tanpa sistem state yang jelas, hasilnya akan kembali jadi “UI tempelan”.