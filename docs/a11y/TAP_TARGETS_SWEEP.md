# TAP TARGETS SWEEP

Minimum hit target policy:
- Interactive controls must have minimum hit area `44px`.
- Do not shrink interactive hit boxes; shrink icons instead.

Mobile manual checklist:
- [ ] Dock items are easy to tap with thumb (no precision tapping).
- [ ] Dock search input focuses reliably when tapping anywhere on the field.
- [ ] Dock search icon buttons (`nav.gg-dock .gg-dock__search .gg-icon-btn`) are not micro targets.
- [ ] Global icon buttons (`.gg-icon-btn`) keep full 44px hit box while icon glyph stays visually compact.
- [ ] Sidebar links (`.gg-leftnav__link`) are easy to tap line-by-line.
- [ ] Labeltree header button (`.gg-lt[data-gg-module="labeltree"] .gg-lt__headbtn`) is easy to tap.
- [ ] TOC header button (`#gg-toc .gg-toc__headbtn`) is easy to tap.
- [ ] Tree toggles in listing/sitemap have no micro-target behavior.
- [ ] Post tools (share/copy/etc.) are easy to hit without repeated taps.
- [ ] Share sheet close button is easy to hit and does not cause frequent miss taps.

Controls to spot-check:
- `.gg-icon-btn`
- `nav.gg-dock .gg-dock__search .gg-icon-btn`
- `.gg-leftnav__link`
- `.gg-lt[data-gg-module="labeltree"] .gg-lt__headbtn`
- `#gg-toc .gg-toc__headbtn`
- `nav.gg-dock .gg-dock__search input`
- `.gg-tree-toggle`
- `.gg-post-card__tool`
- `.gg-post__tool`
- `.gg-lt__collapse`
- `.gg-lt__panelbtn`
- `.gg-pi__toggle`
- `.gg-toc__toggle`
- `.gg-share-sheet__close-btn`
