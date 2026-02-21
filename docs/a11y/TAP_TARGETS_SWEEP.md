# TAP TARGETS SWEEP

Minimum hit target policy:
- Interactive controls must have minimum hit area `44px`.
- Do not shrink interactive hit boxes; shrink icons instead.

Mobile manual checklist:
- [ ] Dock items are easy to tap with thumb (no precision tapping).
- [ ] Dock search input focuses reliably when tapping anywhere on the field.
- [ ] Tree toggles in listing/sitemap have no micro-target behavior.
- [ ] Post tools (share/copy/etc.) are easy to hit without repeated taps.
- [ ] Share sheet close button is easy to hit and does not cause frequent miss taps.

Controls to spot-check:
- `nav.gg-dock .gg-dock__search input`
- `.gg-tree-toggle`
- `.gg-post-card__tool`
- `.gg-post__tool`
- `.gg-lt__collapse`
- `.gg-lt__panelbtn`
- `.gg-pi__toggle`
- `.gg-toc__toggle`
- `.gg-share-sheet__close-btn`
