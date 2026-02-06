(function(w, d){
  'use strict';
  var key = '__gg_app_loader__';
  if (w[key]) return;
  w[key] = true;

  var s = d.currentScript;
  if (!s || !s.src) return;
  var appUrl = s.src.replace(/main\.js(?=\?|#|$)/, 'app.js');

  var el = d.createElement('script');
  el.src = appUrl;
  el.async = true;
  (d.head || d.documentElement).appendChild(el);

  try {
    var m = d.querySelector('meta[name="gg:mode"]');
    if (m && (m.getAttribute('content') || '') === 'dev') {
      if (w.console && console.info) console.info('GG loader: app.js requested');
    }
  } catch (_) {}
})(window, document);
