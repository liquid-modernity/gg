(function(w, d){
  'use strict';
  var key = '__gg_core_loader__';
  if (w[key]) return;
  w[key] = true;

  var s = d.currentScript;
  if (!s || !s.src) return;
  var coreUrl = s.src.replace(/main\.js(?=\?|#|$)/, 'core.js');

  var el = d.createElement('script');
  el.src = coreUrl;
  el.async = true;
  (d.head || d.documentElement).appendChild(el);

  try {
    var m = d.querySelector('meta[name="gg:mode"]');
    if (m && (m.getAttribute('content') || '') === 'dev') {
      if (w.console && console.info) console.info('GG loader: core.js requested');
    }
  } catch (_) {}
})(window, document);
