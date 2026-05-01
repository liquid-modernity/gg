TASK: Normalize /store ID/EN language system so all UI chrome is fully localized and locale switching refreshes static + dynamic UI.

Context:
The /store surface already has the final architecture:
- Route: /store
- Dock: Store / Contact / Discover / Saved / More
- Blog/Home inside More
- Product content comes from Blogger feed label Store
- Dynamic UI uses <template> clones, not HTML strings
- CSS owns styling; JS handles state/data binding only

Problem:
The current ID/EN language switcher is incomplete.
Some UI text still remains hardcoded or mixed-language.
The switcher updates some `data-copy` elements, but not all static text, aria labels, titles, fallback text, card fallback labels, active preview text, or dynamic renderer output.

Goal:
Create a disciplined Store i18n system:
- All UI chrome must be controlled by the COPY registry.
- Product content from posts/feed may remain in its original language.
- Switching EN/ID must update static UI, dynamic UI, active preview, Discovery, Saved, filter tray, aria-labels, placeholders, titles, fallback text, and toast copy.

Do NOT change:
- Worker route mapping
- sw.js
- canonical /store
- feed label architecture
- dock vocabulary
- visual layout
- carousel behavior
- template rendering architecture
- Saved behavior
- Discovery behavior
- marketplace CTA hierarchy

====================================================================
A. DEFINE LOCALIZATION BOUNDARY
====================================================================

Hard rule:

1. Translate UI chrome:
- dock labels
- sheet titles
- section labels
- buttons
- placeholders
- aria labels
- title attributes
- fallback labels
- empty states
- toast messages
- filter labels
- quick intents
- status text
- theme/language labels
- legal/footer text
- close fallback text

2. Do NOT auto-translate product feed content:
- product title
- product summary
- product notes
- product names
- marketplace links

Reason:
Product content is editorial content from the post/feed. It should remain as authored.

Acceptance:
- UI chrome changes with EN/ID.
- Product data remains from feed/post.

====================================================================
B. CLEAN COPY.id AND COPY.en
====================================================================

Audit the COPY registry.

Make sure COPY.id is truly Indonesian and COPY.en is truly English.

Examples for COPY.id:

summary: 'Kurasi produk pilihan.'
affiliateDisclosure: 'Affiliate links may be used · Harga dan ketersediaan mengikuti marketplace.'
searchPlaceholder: 'Cari produk atau kategori'
filtersLabel: 'Filter'
contactEyebrow: 'Kontak'
contactTitle: 'Kolaborasi, pengajuan produk, pengungkapan afiliasi, dan permintaan koreksi.'
contactBody: 'Untuk kolaborasi brand, pengajuan produk, koreksi data, atau pertanyaan affiliate, hubungi PakRPP melalui WhatsApp.'
contactCta: 'WhatsApp'
backToTop: 'Kembali ke Atas'
archiveCta: 'Lihat arsip Store'
curatedTitle: 'Belum ada produk yang ditampilkan.'
curatedBody: 'Koleksi Yellow Cart sedang dikurasi.'
notesTitle: 'Catatan'
legalText: 'Beberapa tautan keluar dapat bersifat afiliasi. Harga dan ketersediaan dapat berubah.'
copyLinksLabel: 'Salin tautan produk'
copyLinksCopied: 'Tersalin'
saveLabel: 'Simpan'
savedLabel: 'Tersimpan'
savedOnDevice: 'Tersimpan di perangkat ini.'
savedEmptyTitle: 'Belum ada produk tersimpan.'
savedEmptyBody: 'Buka produk dan tekan Simpan.'
savedToast: 'Disimpan'
removedToast: 'Dihapus dari Saved'
copyToast: 'Tautan tersalin'
copyFailToast: 'Gagal menyalin tautan'
removeSavedLabel: 'Hapus dari Saved'
countLoading: 'Memuat produk…'
countFail: 'Gagal memuat produk'
emptyTitle: 'Produk tidak ditemukan.'
emptyBody: 'Coba filter lain atau kosongkan pencarian.'
feedStore: 'Feed: Store'
feedLegacy: 'Feed: arsip Store cadangan'
filterActive: 'Filter aktif'
allVisible: 'Semua produk ditampilkan.'
discoveryTitle: 'Discovery'
resultsLabel: 'Hasil'
quickIntentsLabel: 'Pilihan cepat'
featuredLabel: 'Unggulan'
latestLabel: 'Terbaru'
under500Label: 'Di bawah 500k'
moreTitle: 'Lainnya'
navigateLabel: 'Navigasi'
languageLabel: 'Bahasa'
appearanceLabel: 'Tampilan'
systemLabel: 'Sistem'
lightLabel: 'Terang'
darkLabel: 'Gelap'
homeLabel: 'Home'
blogLabel: 'Blog'
storeLabel: 'Store'
contactLabel: 'Kontak'
discoverLabel: 'Discovery'
savedDockLabel: 'Saved'
moreDockLabel: 'Lainnya'
previewProductLabel: 'Pratinjau produk'
curatedFallback: 'Kurasi'
untitledProduct: 'Produk tanpa judul'
closePreview: 'Tutup pratinjau'
closeDiscovery: 'Tutup Discovery'
closeSaved: 'Tutup Saved'
closeMore: 'Tutup panel lainnya'

Examples for COPY.en:

summary: 'Curated product picks.'
affiliateDisclosure: 'Affiliate links may be used · Prices and availability follow the marketplace.'
searchPlaceholder: 'Search products or categories'
filtersLabel: 'Filters'
contactEyebrow: 'Contact'
contactTitle: 'Collaborations, product submissions, affiliate disclosures, and correction requests.'
contactBody: 'For brand collaborations, product submissions, data corrections, or affiliate questions, contact PakRPP through WhatsApp.'
contactCta: 'WhatsApp'
backToTop: 'Back to Top'
archiveCta: 'View Store archive'
curatedTitle: 'No products are displayed yet.'
curatedBody: 'Yellow Cart is still being curated.'
notesTitle: 'Notes'
legalText: 'Some outbound links may be affiliate links. Prices and availability may change.'
copyLinksLabel: 'Copy product links'
copyLinksCopied: 'Copied'
saveLabel: 'Save'
savedLabel: 'Saved'
savedOnDevice: 'Saved on this device.'
savedEmptyTitle: 'No saved picks yet.'
savedEmptyBody: 'Open a product and tap Save.'
savedToast: 'Saved'
removedToast: 'Removed from Saved'
copyToast: 'Copied links'
copyFailToast: 'Copy failed'
removeSavedLabel: 'Remove from Saved'
countLoading: 'Loading products…'
countFail: 'Failed to load products'
emptyTitle: 'No products found.'
emptyBody: 'Try another filter or clear the search.'
feedStore: 'Feed: Store'
feedLegacy: 'Feed: Store archive fallback'
filterActive: 'Active filter'
allVisible: 'All products are visible.'
discoveryTitle: 'Discovery'
resultsLabel: 'Results'
quickIntentsLabel: 'Quick intents'
featuredLabel: 'Featured'
latestLabel: 'Latest'
under500Label: 'Under 500k'
moreTitle: 'More'
navigateLabel: 'Navigate'
languageLabel: 'Language'
appearanceLabel: 'Appearance'
systemLabel: 'System'
lightLabel: 'Light'
darkLabel: 'Dark'
homeLabel: 'Home'
blogLabel: 'Blog'
storeLabel: 'Store'
contactLabel: 'Contact'
discoverLabel: 'Discover'
savedDockLabel: 'Saved'
moreDockLabel: 'More'
previewProductLabel: 'Preview product'
curatedFallback: 'Curated'
untitledProduct: 'Untitled product'
closePreview: 'Close preview'
closeDiscovery: 'Close Discovery'
closeSaved: 'Close Saved'
closeMore: 'Close more panel'

Acceptance:
- COPY.id no longer contains accidental English except deliberate brand/feature names such as Yellow Cart, Store, Saved, Discovery if intentionally retained.
- COPY.en is coherent English.
- No UI text is stuck in the wrong language.

====================================================================
C. ADD ATTRIBUTE LOCALIZATION HOOKS
====================================================================

Extend the localization system beyond `data-copy`.

Support these hooks:

1. Text content:
data-copy="key"

2. Placeholder:
data-copy-placeholder="key"

3. aria-label:
data-copy-aria="key"

4. title:
data-copy-title="key"

5. Optional value or label if needed:
data-copy-value="key"

Update `setCopy()` so it handles all of them.

Pseudo:

function setCopy() {
  var dict = COPY[state.locale] || COPY.id;

  document.documentElement.lang = state.locale === 'en' ? 'en' : 'id';

  document.querySelectorAll('[data-copy]').forEach(function (node) {
    var key = node.getAttribute('data-copy');
    if (dict[key] != null) node.textContent = dict[key];
  });

  document.querySelectorAll('[data-copy-placeholder]').forEach(function (node) {
    var key = node.getAttribute('data-copy-placeholder');
    if (dict[key] != null) node.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('[data-copy-aria]').forEach(function (node) {
    var key = node.getAttribute('data-copy-aria');
    if (dict[key] != null) node.setAttribute('aria-label', dict[key]);
  });

  document.querySelectorAll('[data-copy-title]').forEach(function (node) {
    var key = node.getAttribute('data-copy-title');
    if (dict[key] != null) node.setAttribute('title', dict[key]);
  });

  updateLanguageButtons();
}

Acceptance:
- data-copy, data-copy-placeholder, data-copy-aria, and data-copy-title all work.
- html lang switches between id and en.

====================================================================
D. ADD DATA-COPY HOOKS TO STATIC BODY TEXT
====================================================================

Add localization hooks to static markup.

Required static UI hooks:

Dock:
- Store label → data-copy="storeLabel"
- Contact label → data-copy="contactLabel"
- Discover label → data-copy="discoverLabel"
- Saved label → data-copy="savedDockLabel"
- More label → data-copy="moreDockLabel"

Contact:
- Contact eyebrow → data-copy="contactEyebrow"
- Contact title → data-copy="contactTitle"
- Contact body → data-copy="contactBody"
- WhatsApp button → data-copy="contactCta"
- Back to Top → data-copy="backToTop"

Preview:
- Preview scrim aria-label → data-copy-aria="closePreview"
- Preview footer handle aria-label → data-copy-aria="closePreview"
- Copy button aria-label/title → data-copy-aria="copyLinksLabel" data-copy-title="copyLinksLabel"
- Notes title → data-copy="notesTitle"

Discovery:
- sheet title → data-copy="discoveryTitle"
- scrim aria-label → data-copy-aria="closeDiscovery"
- visually hidden close button → data-copy="closeDiscovery"
- search input placeholder → data-copy-placeholder="searchPlaceholder"
- Filters label → data-copy="filtersLabel"
- Quick intents label → data-copy="quickIntentsLabel"
- Featured button → data-copy="featuredLabel"
- Latest button → data-copy="latestLabel"
- Under 500k button → data-copy="under500Label"
- Results label → data-copy="resultsLabel"

Saved:
- sheet title → data-copy="savedDockLabel"
- scrim aria-label → data-copy-aria="closeSaved"
- visually hidden close button → data-copy="closeSaved"
- summary → data-copy="savedOnDevice"

More:
- title → data-copy="moreTitle"
- scrim aria-label → data-copy-aria="closeMore"
- visually hidden close button → data-copy="closeMore"
- Navigate → data-copy="navigateLabel"
- Home → data-copy="homeLabel"
- Blog → data-copy="blogLabel"
- Language → data-copy="languageLabel"
- Appearance → data-copy="appearanceLabel"
- System → data-copy="systemLabel"
- Light → data-copy="lightLabel"
- Dark → data-copy="darkLabel"
- legal text → data-copy="legalText"

Filter tray:
- aria-label and button label should reflect active filter if possible.
- Current visual label is updated dynamically by updateFilterPeek().

Acceptance:
- Searching the body should reveal very few hardcoded UI strings.
- Remaining hardcoded text should be product content, brand names, or deliberate non-localized labels.

====================================================================
E. LOCALIZE DYNAMIC RENDERER FALLBACKS
====================================================================

Update all dynamic renderer fallbacks to use `copy()`.

Product card:
- aria-label: copy('previewProductLabel') + ': ' + item.title
- fallback badge: copy('curatedFallback')
- fallback title: copy('untitledProduct')

Discovery row:
- aria-label localized
- empty row text localized
- meta fallback localized if any

Saved row:
- remove button aria-label:
  copy('removeSavedLabel') + ': ' + item.title
- empty state localized:
  copy('savedEmptyTitle') + ' ' + copy('savedEmptyBody')

Preview:
- Save label updates via copy('saveLabel') / copy('savedLabel')
- Copy label/title uses copy('copyLinksLabel') / copy('copyLinksCopied')
- Close labels localized
- Notes title localized through data-copy

Counts/status:
- count loading/fail localized
- all visible status localized
- filter active status localized
- product count format localized:
  ID: "5 produk"
  EN: "5 products"

Acceptance:
- Dynamic UI created from templates respects active locale.
- No dynamic fallback remains hardcoded English unless deliberately a brand/feature name.

====================================================================
F. LOCALE SWITCH MUST REFRESH STATIC + DYNAMIC UI
====================================================================

Create one central refresh function.

Suggested:

function refreshLocaleUI() {
  setCopy();
  renderCards();
  renderDiscoveryResults();
  renderSavedResults();
  updateCounts();
  updateChipState();
  updateFilterPeek();
  syncCopyButtonState();
  syncSaveButtonState();

  if (state.currentPreviewItem) {
    fillPreview(state.currentPreviewItem);
  }
}

Update language switch handler:

on click [data-store-lang]:
- update state.locale
- persist to localStorage key `gg:lang`
- call refreshLocaleUI()

Do not call only `setCopy()`.

Acceptance:
- Switching language updates dock, sheets, buttons, statuses, card aria labels, active preview controls, Saved rows, Discovery rows, filter tray, and toast labels.
- Active preview does not need to close to reflect new locale.

====================================================================
G. KEEP PRODUCT CONTENT UNTRANSLATED
====================================================================

Do not translate:
- item.title
- item.summary
- item.notes
- item.category if taken from post label, except display normalization can be applied
- marketplace names Shopee/Tokopedia/TikTok

Category labels:
You may map filter labels separately via COPY if desired:
- All / Semua
- Fashion
- Skincare
- Workspace
- Tech
- Etc / Lainnya

But product category from feed can remain as authored unless the system already normalizes categories.

Acceptance:
- Product editorial content remains stable across language switch.
- UI chrome changes.

====================================================================
H. LOCALSTORAGE AND INITIAL LANGUAGE
====================================================================

Ensure initial locale is read safely from localStorage `gg:lang`.

Allowed values:
- id
- en

Fallback:
- id

On load:
- state.locale = saved locale or 'id'
- documentElement.lang updated
- language buttons pressed state reflects current locale
- UI rendered in current locale on first paint after JS initializes

Acceptance:
- Reload preserves selected language.
- Invalid localStorage value falls back to id.

====================================================================
I. QA / ARTIFACT SMOKE UPDATES
====================================================================

Update qa/store-artifact-smoke.sh.

Add checks:
- COPY.id exists
- COPY.en exists
- `data-copy-placeholder` is handled in JS
- `data-copy-aria` is handled in JS
- `data-copy-title` is handled in JS
- `refreshLocaleUI` exists
- language handler calls refreshLocaleUI
- dock labels have data-copy hooks
- sheet titles have data-copy hooks
- quick intent labels have data-copy hooks
- More settings labels have data-copy hooks
- copy button has data-copy-aria and data-copy-title
- close controls have data-copy or data-copy-aria
- Saved summary has data-copy
- `html.lang` is updated in JS

Regression checks:
- fail if obvious hardcoded strings remain without data-copy:
  - "All products are visible."
  - "Saved on this device."
  - "Quick intents"
  - "Results"
  - "Navigate"
  - "Language"
  - "Appearance"
  - "Back to Top"
  - "Close discovery"
  - "Close saved"
  - "Close more panel"

Keep existing checks:
- templates exist
- no innerHTML UI rendering
- no insertAdjacentHTML
- no JS inline visual styling
- no #home
- Store dock href remains /store
- hidden sheets use hidden/aria-hidden/inert
- WhatsApp href is https://wa.me/

====================================================================
J. MANUAL TEST CHECKLIST
====================================================================

After implementation, manually test:

1. Load /store in default ID.
2. Open More.
3. Switch to EN.
4. Confirm:
   - dock labels update
   - hero summary updates
   - disclosure updates
   - Contact copy updates
   - Discovery labels update
   - Saved summary updates
   - More settings labels update
   - buttons update
   - placeholders update
   - aria/title labels update where inspectable
5. Open preview, then switch language while preview active.
6. Confirm:
   - Save/Saved label updates
   - Copy title/aria updates
   - Notes title updates
   - marketplace names remain unchanged
   - product title/summary remain as authored
7. Open Discovery and type a query.
8. Switch language and confirm result rows/status remain sane.
9. Save product, open Saved, switch language, remove item.
10. Reload page and confirm selected language persists.

====================================================================
K. RUN COMMANDS
====================================================================

Run:
node tools/preflight.mjs
bash -n qa/store-artifact-smoke.sh
bash qa/store-artifact-smoke.sh
npm run build
npm run gaga:verify-store-artifact
npm run gaga:verify-worker
git diff --check

Do not run live smoke as a pre-deploy blocker.

====================================================================
FINAL ACCEPTANCE
====================================================================

Done only if:
- UI chrome is fully localized through COPY registry.
- Product content remains as authored.
- EN/ID switching updates static and dynamic UI.
- Active preview updates without closing.
- Discovery and Saved update after locale switch.
- Copy/Save/toast/fallback labels use active locale.
- QA catches future hardcoded-language regressions.
- No visual redesign or route changes.