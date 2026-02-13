(function(w, d){
  'use strict';
  var GG_BOOT = w.GG_BOOT = w.GG_BOOT || {};
  function setBootStage(stage){
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
  setBootStage(1);
  GG_BOOT.setStage = GG_BOOT.setStage || setBootStage;
  if (GG_BOOT._booted) return;
  GG_BOOT._booted = true;

  function isDev(){
    if (GG_BOOT._isDev !== undefined) return GG_BOOT._isDev;
    var val = false;
    try {
      var m = d.querySelector('meta[name="gg:mode"]');
      val = !!(m && (m.getAttribute('content') || '') === 'dev');
    } catch (_) { val = false; }
    GG_BOOT._isDev = val;
    return val;
  }

  function warn(){
    try { if (w.console && console.warn) console.warn.apply(console, arguments); } catch (_) {}
  }

  function getScriptSrc(){
    var s = d.currentScript;
    if (s && s.src) return s.src;
    var list = d.getElementsByTagName('script');
    for (var i = list.length - 1; i >= 0; i--) {
      var src = list[i].src || '';
      if (src.indexOf('/boot.js') !== -1) return src;
    }
    return '';
  }

  var src = getScriptSrc();
  var base = '';
  var search = '';
  try {
    if (src) {
      var u = new URL(src, w.location.href);
      search = u.search || '';
      if (u.pathname.indexOf('/assets/latest/boot.js') !== -1) {
        base = '/assets/latest';
      } else {
        var m = u.pathname.match(/\/assets\/v\/([^/]+)\/boot\.js/);
        if (m && m[1]) base = '/assets/v/' + m[1];
      }
    }
  } catch (_) {}

  if (!base) {
    try {
      var mAsset = d.querySelector('meta[name="gg:asset-base"]');
      base = mAsset ? (mAsset.getAttribute('content') || '') : '';
    } catch (_) { base = ''; }
  }
  if (!base) base = '/assets/latest';

  var mainUrl = base + '/main.js' + search;
  var loaded = false;
  var loading = false;

  function loadInstant(){
    if (GG_BOOT._instant) return;
    GG_BOOT._instant = true;
    var s = d.createElement('script');
    s.src = 'https://instant.page/5.2.0';
    s.type = 'module';
    s.integrity = 'sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z';
    s.crossOrigin = 'anonymous';
    (d.head || d.documentElement).appendChild(s);
  }

  function loadMain(){
    if (loaded || loading || GG_BOOT._mainRequested) return;
    GG_BOOT._mainRequested = true;
    loading = true;
    var s = d.createElement('script');
    s.src = mainUrl;
    s.async = true;
    s.onload = function(){
      loading = false;
      loaded = true;
      if (!isDev()) loadInstant();
    };
    s.onerror = function(){
      loading = false;
      warn('GG boot: main.js failed to load');
    };
    (d.head || d.documentElement).appendChild(s);
  }

  var fired = false;
  function fire(){
    if (fired) return;
    fired = true;
    cleanup();
    loadMain();
  }

  function onInteract(){
    fire();
  }

  function cleanup(){
    try { d.removeEventListener('pointerdown', onInteract, true); } catch (_) {}
    try { d.removeEventListener('keydown', onInteract, true); } catch (_) {}
  }

  function scheduleIdle(timeoutMs){
    var idle = function(){ if (!fired) fire(); };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(idle, { timeout: timeoutMs });
    } else {
      w.setTimeout(idle, timeoutMs);
    }
  }

  function afterPaint(){
    if (!w.requestAnimationFrame) { scheduleIdle(1500); return; }
    w.requestAnimationFrame(function(){
      w.requestAnimationFrame(function(){
        scheduleIdle(1500);
      });
    });
  }

  function afterLoad(){
    var run = function(){ scheduleIdle(5000); };
    if (d.readyState === 'complete') {
      run();
      return;
    }
    w.addEventListener('load', run, { once: true });
  }

  d.addEventListener('pointerdown', onInteract, { passive: true, capture: true, once: true });
  d.addEventListener('keydown', onInteract, { passive: true, capture: true, once: true });
  if (isDev()) afterPaint();
  else afterLoad();
})(window, document);
