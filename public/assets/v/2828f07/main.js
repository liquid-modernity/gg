(function(w, d){
  'use strict';
  var key = '__gg_core_loader__';
  if (w[key]) return;
  w[key] = true;

  var s = d.currentScript;
  if (!s || !s.src) return;
  var coreUrl = s.src.replace(/main\.js(?=\?|#|$)/, 'core.js');

  function setBootStage(stage){
    try {
      if (w.GG_BOOT && typeof w.GG_BOOT.setStage === 'function') {
        w.GG_BOOT.setStage(stage);
        return;
      }
    } catch (_) {}
    try {
      var el = d.documentElement;
      if (!el) return;
      var cur = '';
      if (el.dataset && typeof el.dataset.ggBoot !== 'undefined') cur = el.dataset.ggBoot;
      else cur = el.getAttribute('data-gg-boot') || '';
      var curNum = parseInt(cur, 10) || 0;
      if (stage > curNum) {
        if (el.dataset) el.dataset.ggBoot = String(stage);
        else el.setAttribute('data-gg-boot', String(stage));
      }
    } catch (_) {}
  }

  function readPageMarker(node){
    if (!node) return '';
    try {
      if (node.dataset && typeof node.dataset.ggPage !== 'undefined') {
        return String(node.dataset.ggPage || '');
      }
      return String(node.getAttribute('data-gg-page') || '');
    } catch (_) {
      return '';
    }
  }

  function isLegalPage(){
    var rootPage = readPageMarker(d.documentElement).trim().toLowerCase();
    var bodyPage = readPageMarker(d.body).trim().toLowerCase();
    return rootPage === 'legal' || bodyPage === 'legal';
  }

  if (isLegalPage()) {
    w.__GG_LEGAL_PAGE = true;
    setBootStage(2);
    return;
  }

  var el = d.createElement('script');
  el.src = coreUrl;
  el.async = true;
  el.onerror = function(){
    try { if (w.console && console.warn) console.warn('GG loader: core.js failed to load'); } catch (_) {}
  };
  (d.head || d.documentElement).appendChild(el);
  setBootStage(2);

  try {
    var m = d.querySelector('meta[name="gg:mode"]');
    if (m && (m.getAttribute('content') || '') === 'dev') {
      if (w.console && console.info) console.info('GG loader: core.js requested');
    }
  } catch (_) {}
})(window, document);
