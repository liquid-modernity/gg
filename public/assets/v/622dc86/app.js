(function(w, d){
  'use strict';
  var key = '__gg_core_from_app__';
  if (w[key]) return;
  w[key] = true;

  var s = d.currentScript;
  if (!s || !s.src) return;
  var coreUrl = s.src.replace(/app\.js(?=\?|#|$)/, 'core.js');

  var el = d.createElement('script');
  el.src = coreUrl;
  el.async = true;
  (d.head || d.documentElement).appendChild(el);

  try {
    var m = d.querySelector('meta[name="gg:mode"]');
    if (m && (m.getAttribute('content') || '') === 'dev') {
      if (w.console && console.info) console.info('GG shim: core.js requested');
    }
  } catch (_) {}
})(window, document);
