# PAKRPP 85 Architecture North Star

The goal is to harden pakrpp.com into a Blogger-first, semantic, crawlable, accessible, mobile-first, native-feeling PWA-like site with centralized behavior contracts and minimal edge fallback.

Blogger XML remains the SSR source of truth. Cloudflare Worker must not author normal UI during healthy Blogger rendering. JavaScript enhances behavior but must not be the only source of meaningful content. HTML fallback must remain useful without JavaScript. Structured data must reflect visible page content and route truth. Global components must share one visual rhythm, one public API convention, and one sheet/dialog contract.

This is a rewrite only in the architectural sense: remove duplicated sources of behavior and consolidate them into clear contracts. Do not stack override CSS/JS on top of old override CSS/JS. Do not destroy stable features just to make the code look cleaner.

## Route Truth

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface

Breadcrumb/schema route truth:
Home(/landing) -> Blog(/) -> current page/post
```

## Rewrite, Not Override/Patch

```txt
Rewrite means:
- remove duplicated behavior sources;
- consolidate repeated patterns into one contract;
- replace fragile local patches with global, documented primitives;
- make behavior easier to reason about for humans and AI coding agents.

Rewrite does NOT mean:
- rebuild the site from scratch;
- replace Blogger-native rendering;
- replace native Blogger comments;
- rewrite stable Store, Discovery, Preview, Shell, Theme, or Comments systems without proof of defect;
- add new override-only CSS or JS;
- hide old code while adding another layer on top.
```
