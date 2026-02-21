# CLS_POLICY.md
Last updated: 2026-02-22

## Contract
- Every `<img>` created by JavaScript must receive integer `width` and `height` attributes.
- Every `<iframe>` embed created by JavaScript must receive integer `width` and `height` attributes.
- CSS `aspect-ratio` wrappers stay in place as the primary layout model; intrinsic `width`/`height` is mandatory fallback.
- Attribute values must be integer-only (no `%`, `auto`, `px`, or decimal strings).

## Why
- Intrinsic dimensions reserve layout space before media fully loads.
- This reduces layout shifts (CLS), especially on lazy/deferred media.

## Implementation notes
- Use `GG.services.images.setIntrinsicDims(el, w, h)` for JS-created media.
- Keep values as ratio pairs, for example `40/27`, `16/9`, `9/16`, `4/6`, `100/148`.
- Do not force image crop mode just to satisfy ratio; ratio fallback is independent from thumb URL crop flags.

## Manual debug snippet
```js
new PerformanceObserver((list)=>{
  for(const e of list.getEntries()){
    if(!e.hadRecentInput) console.log('CLS', e.value, e.sources);
  }
}).observe({type:'layout-shift', buffered:true});
```
