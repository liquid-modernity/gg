(function(w){
'use strict';
var GG = w.GG = w.GG || {};
GG.__uiBuckets = GG.__uiBuckets || {};
if (GG.__uiBuckets.core) return;
GG.__uiBuckets.core = true;


(function(w){
'use strict';
var GG = w.GG = w.GG || {};
GG.core = GG.core || {};
GG.store = GG.store || {};
GG.store.config = GG.store.config || {};
GG.services = GG.services || {};
GG.ui = GG.ui || {};
GG.actions = GG.actions || {};
GG.boot = GG.boot || {};
GG.boot.defer = GG.boot.defer || function(fn){
if (typeof fn !== 'function') return;
var done = false;
var run = function(){ if (done) return; done = true; try { fn(); } catch (_) {} };
if (w.requestIdleCallback) w.requestIdleCallback(function(){ run(); }, { timeout: 1200 });
else w.setTimeout(run, 1);
};
GG.core.isProdHost = GG.core.isProdHost || function(hostname){
var host = (hostname || (w.location ? w.location.hostname : '') || '').toLowerCase();
return /(^|\.)pakrpp\.com$/.test(host);
};
GG.core.hasWorker = GG.core.hasWorker || function(){
return !!(GG.env && GG.env.worker === true);
};
GG.core.blogHomePath = GG.core.blogHomePath || function(basePath, hostname){
var base = (typeof basePath === 'string' && basePath) ? basePath : '/';
if (base.charAt(0) !== '/') base = '/' + base;
if (base.charAt(base.length - 1) !== '/') base += '/';
var useBlog = GG.core.isProdHost(hostname) && GG.core.hasWorker && GG.core.hasWorker();
if (useBlog) {
  return base.replace(/\/$/, '') + '/blog';
}
return base + '?view=blog';
};
GG.core.isBlogHomePath = GG.core.isBlogHomePath || function(pathname, search, hostname){
var path = (pathname || '').replace(/\/+$/, '') || '/';
var view = '';
try { view = (new URLSearchParams(search || '').get('view') || '').toLowerCase(); } catch (_) {}
var workerOk = GG.core.hasWorker && GG.core.hasWorker();
if (workerOk && path === '/blog') return true;
if (path === '/' && view === 'blog') return true;
return false;
};
GG.core.normalizeBlogAlias = GG.core.normalizeBlogAlias || function(){
try {
  var loc = w.location;
  if (!loc) return;
  var env = (GG && GG.env) ? GG.env : (w.GG_ENV || {});
  if (typeof env.worker !== 'boolean') return;
  var workerOk = env.worker === true;
  var isProd = GG.core && GG.core.isProdHost ? GG.core.isProdHost(loc.hostname) : false;
  var path = (loc.pathname || '').replace(/\/+$/, '') || '/';
  var params = new URLSearchParams(loc.search || '');
  var view = (params.get('view') || '').toLowerCase();
  if (workerOk && isProd) {
    if (path !== '/' || view !== 'blog') return;
    var dest = '/blog';
    if (params.get('m') === '1') dest += '?m=1';
    if (loc.hash) dest += loc.hash;
    if (w.history && w.history.replaceState) {
      w.history.replaceState(w.history.state || {}, '', dest);
    }
    return;
  }
  if (path !== '/blog') return;
  params.set('view', 'blog');
  var fallback = '/?' + params.toString();
  if (loc.hash) fallback += loc.hash;
  if (w.history && w.history.replaceState) {
    w.history.replaceState(w.history.state || {}, '', fallback);
  }
} catch (_) {}
};
(function(){
try { if (GG.core && GG.core.normalizeBlogAlias) GG.core.normalizeBlogAlias(); } catch (_) {}
})();
GG.core.state = GG.core.state || (function(){
function stateList(el){
  if (!el || !el.getAttribute) return [];
  var raw = el.getAttribute('data-gg-state') || '';
  if (!raw) return [];
  var parts = raw.split(/\s+/);
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    if (parts[i]) out.push(parts[i]);
  }
  return out;
}
function set(el, list){
  if (!el || !el.setAttribute) return;
  if (!list || !list.length) { el.removeAttribute('data-gg-state'); return; }
  el.setAttribute('data-gg-state', list.join(' '));
}
function has(el, stateName){
  if (!el || !stateName) return false;
  var list = stateList(el);
  return list.indexOf(stateName) !== -1;
}
function add(el, stateName){
  if (!el || !stateName) return;
  var list = stateList(el);
  if (list.indexOf(stateName) !== -1) return;
  list.push(stateName);
  set(el, list);
}
function remove(el, stateName){
  if (!el || !stateName) return;
  var list = stateList(el);
  var idx = list.indexOf(stateName);
  if (idx === -1) return;
  list.splice(idx, 1);
  set(el, list);
}
function toggle(el, stateName, force){
  if (!el || !stateName) return false;
  if (force === true) { add(el, stateName); return true; }
  if (force === false) { remove(el, stateName); return false; }
  var list = stateList(el);
  var idx = list.indexOf(stateName);
  if (idx === -1) {
    list.push(stateName);
    set(el, list);
    return true;
  }
  list.splice(idx, 1);
  set(el, list);
  return false;
}
return { has: has, add: add, remove: remove, toggle: toggle };
})();
GG.core.telemetry = GG.core.telemetry || function(payload){
try {
  var ep = '/api/telemetry';
  var body = JSON.stringify(payload || {});
  if (w.navigator && w.navigator.sendBeacon) {
    try { w.navigator.sendBeacon(ep, w.Blob ? new Blob([body], { type: 'application/json' }) : body); } catch (e) {}
  } else if (w.fetch) {
    w.fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function(){});
  }
} catch (e) {}
};
GG.core.meta = GG.core.meta || (function(){
function findMeta(selector){
  return w.document ? w.document.querySelector(selector) : null;
}
function update(data){
  if(!data) return;
  if(typeof data.title === 'string'){
    w.document.title = data.title;
  }
  if(typeof data.description === 'string'){
    var desc = findMeta('meta[name="description"]');
    if(desc) desc.setAttribute('content', data.description);
  }
  var ogTitle = (typeof data.ogTitle === 'string') ? data.ogTitle : (typeof data.title === 'string' ? data.title : null);
  if(ogTitle !== null){
    var og = findMeta('meta[property="og:title"]');
    if(og) og.setAttribute('content', ogTitle);
  }
}
function titleFromUrl(url){
  try {
    var u = new URL(url, w.location.href);
    var path = (u.pathname || '').replace(/\/+$/, '');
    if(!path || path === '/') return w.document.title;
    var parts = path.split('/');
    var slug = decodeURIComponent(parts[parts.length - 1] || '').replace(/[-_]+/g, ' ').trim();
    if(!slug) return w.document.title;
    return slug.replace(/\b\w/g, function(m){ return m.toUpperCase(); });
  } catch (e) {
    return w.document.title;
  }
}
return { update: update, titleFromUrl: titleFromUrl };
})();
GG.core.render = GG.core.render || (function(){
function fail(code, info){
  var err = new Error('render-failed');
  err.name = 'GGRenderError';
  err.code = code || 'render';
  if (info) err.info = info;
  return err;
}
function findTarget(doc){
  if (!doc || !doc.querySelector) return null;
  var selectors = ['.gg-blog-main', '.blog-posts', '#main', 'main.gg-main', 'main'];
  for (var i = 0; i < selectors.length; i++) {
    var el = doc.querySelector(selectors[i]);
    if (el) return el;
  }
  return null;
}
function extractMeta(doc){
  var out = { title: '', description: '', ogTitle: '' };
  if (!doc) return out;
  out.title = doc.title || '';
  var desc = doc.querySelector && doc.querySelector('meta[name="description"]');
  if (desc) out.description = desc.getAttribute('content') || '';
  var og = doc.querySelector && doc.querySelector('meta[property="og:title"]');
  if (og) out.ogTitle = og.getAttribute('content') || '';
  return out;
}
function rehydrateComments(root){
  var cfg = (GG.store && GG.store.config) ? GG.store.config : {};
  if (cfg.commentsEnabled === false) return 0;
  if (!root || !root.querySelectorAll) return 0;
  var scripts = root.querySelectorAll('script');
  if (!scripts || !scripts.length) return 0;
  var count = 0;
  for (var i = 0; i < scripts.length; i++) {
    var code = scripts[i].text || scripts[i].textContent || '';
    if (code.indexOf('BLOG_CMT_createIframe') === -1) continue;
    try {
      var s = w.document.createElement('script');
      s.type = 'text/javascript';
      s.text = code;
      (w.document.body || w.document.documentElement).appendChild(s);
      if (s.parentNode) s.parentNode.removeChild(s);
      count++;
    } catch (e) {}
  }
  return count;
}
function apply(html, url){
  if (!html) throw fail('empty', { url: url });
  if (!w.DOMParser) throw fail('parser', { url: url });
  var parser = new w.DOMParser();
  var doc = parser.parseFromString(html, 'text/html');
  if (!doc) throw fail('parse', { url: url });
  var source = findTarget(doc);
  var target = findTarget(w.document);
  if (!source || !target) throw fail('target', { url: url });
  var meta = extractMeta(doc);
  function shouldReduceMotion(){
    try{
      if(GG.store&&GG.store.get){
        var st=GG.store.get();
        if(st&&typeof st.reducedMotion==='boolean') return st.reducedMotion;
      }
    }catch(e){}
    try{
      if(GG.services&&GG.services.a11y&&GG.services.a11y.reducedMotion){
        return !!GG.services.a11y.reducedMotion.get();
      }
    }catch(e){}
    return !!(w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function announceRoute(){
    var main=w.document.getElementById('gg-main')||w.document.querySelector('main.gg-main');
    if(main){
      if(!main.hasAttribute('tabindex')) main.setAttribute('tabindex','-1');
      try{ main.focus({ preventScroll: true }); }catch(e){ try{ main.focus(); }catch(_){} }
    }
    var title=(meta&&meta.title)||(doc&&doc.title)||w.document.title||'Page loaded';
    if(GG.services&&GG.services.a11y&&GG.services.a11y.announce){
      GG.services.a11y.announce(title,{politeness:'polite'});
      return;
    }
    try{
      var live=w.document.querySelector('.gg-sr-announcer,[data-gg-announcer]');
      if(!live&&w.document.body){
        live=w.document.createElement('div');
        live.className='gg-sr-announcer gg-visually-hidden';
        live.setAttribute('aria-live','polite');
        live.setAttribute('aria-atomic','true');
        w.document.body.appendChild(live);
      }
      if(live){
        live.textContent='';
        w.setTimeout(function(){ live.textContent=String(title||'Page loaded'); },10);
      }
    }catch(e){}
  }
  var doSwap = function(){
    target.innerHTML = source.innerHTML;
    if (GG.ui && GG.ui.layout && typeof GG.ui.layout.sync === 'function') {
      try { GG.ui.layout.sync(doc, url); } catch (_) {}
    }
    if (GG.core && GG.core.surface && typeof GG.core.surface.update === 'function') {
      try { GG.core.surface.update(url); } catch (_) {}
    }
    if (GG.core && GG.core.meta && GG.core.meta.update) {
      var payload = {};
      if (meta.title) payload.title = meta.title;
      if (meta.description) payload.description = meta.description;
      if (meta.ogTitle) payload.ogTitle = meta.ogTitle;
      if (payload.title || payload.description || payload.ogTitle) GG.core.meta.update(payload);
    }
    var rehydrated = rehydrateComments(target);
    if (!rehydrated) rehydrateComments(doc);
    if (GG.app && typeof GG.app.rehydrate === 'function') {
      try { GG.app.rehydrate({ doc: doc, url: url }); } catch (_) {}
    }
    GG.core.render._lastUrl = url || '';
    GG.core.render._lastAt = Date.now();
    announceRoute();
  };
  var docRef = w.document;
  if (docRef && docRef.startViewTransition && !shouldReduceMotion()) {
    try { docRef.startViewTransition(function(){ doSwap(); }); }
    catch (e) { doSwap(); }
  } else {
    doSwap();
  }
  return true;
}
return { apply: apply, findTarget: findTarget, rehydrateComments: rehydrateComments };
})();
GG.core.surface = GG.core.surface || {};
GG.core.surface.update = GG.core.surface.update || function(url){
var body = w.document && w.document.body;
if (!body) return '';
if (body.classList) body.classList.remove('gg-is-landing');
else body.className = body.className.replace(/\bgg-is-landing\b/g, '').trim();
var href = url || w.location.href;
var surface = 'post';
try {
  var u = new URL(href, w.location.href);
  var path = (u.pathname || '').replace(/\/+$/, '') || '/';
  var view = (u.searchParams.get('view') || '').toLowerCase();
  var isBlogHome = (GG.core && GG.core.isBlogHomePath) ? GG.core.isBlogHomePath(path, u.search || '', u.hostname || w.location.hostname) : (path === '/blog' || (path === '/' && view === 'blog'));
  if (isBlogHome) {
    surface = 'listing';
  } else if (path === '/') {
    surface = 'landing';
  } else if (path.indexOf('/search') !== -1) {
    surface = 'listing';
  } else if (path.indexOf('/p/') !== -1) {
    surface = 'page';
  } else {
    surface = 'post';
  }
} catch (_) {}
body.setAttribute('data-gg-surface', surface);
if (surface === 'landing') {
  if (body.classList) body.classList.add('gg-is-landing');
  else if (!/\bgg-is-landing\b/.test(body.className)) body.className = (body.className + ' gg-is-landing').trim();
}
if (GG.ui && GG.ui.layout && typeof GG.ui.layout.applySurface === 'function') {
  try { GG.ui.layout.applySurface(surface, null, href); } catch (_) {}
}
return surface;
};
GG.core.init = GG.core.init || function(){
if (GG.core._init) return;
GG.core._init = true;
if (GG.core.surface && GG.core.surface.update) GG.core.surface.update(w.location.href);
};
var ENV = w.GG_ENV;
if (!ENV) {
try {
  var doc = w.document;
  var mMode = doc && doc.querySelector('meta[name="gg:mode"]');
  var mAsset = doc && doc.querySelector('meta[name="gg:asset-base"]');
  if (mMode || mAsset) {
    ENV = { mode: mMode ? (mMode.getAttribute('content') || '') : '', assetBase: mAsset ? (mAsset.getAttribute('content') || '') : '' };
    w.GG_ENV = ENV;
  }
} catch(_) {}
}
ENV = ENV || {};
var ASSET_BASE = ENV.assetBase || "";
var IS_DEV = ENV.mode === "dev";
GG.env = GG.env || ENV;
GG.core.ensureWorker = GG.core.ensureWorker || function(){
if (GG.core._workerPromise) return GG.core._workerPromise;
GG.core._workerPromise = new Promise(function(resolve){
  var env = GG.env = GG.env || {};
  if (typeof env.worker === 'boolean') { resolve(env.worker); return; }
  if (!w.fetch) { env.worker = false; env.workerDegraded = false; resolve(false); return; }
  var key = 'gg_worker_ok';
  var ttl = 6048e5;
  var tries = 0;
  var done = false;
  function finish(ok, degraded, reason, ageDays){
    if (done) return;
    done = true;
    env.worker = ok === true;
    env.workerDegraded = degraded === true;
    if (reason && GG.core && GG.core.telemetry) {
      var p = { type: 'worker_detect', result: reason, attempts: tries };
      if (degraded) p.degraded = 1;
      if (typeof ageDays === 'number') p.lkg_days = ageDays;
      GG.core.telemetry(p);
    }
    resolve(env.worker);
  }
  function readLkg(){
    try {
      var v = w.localStorage ? w.localStorage.getItem(key) : '';
      var n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    } catch (_) { return 0; }
  }
  function writeLkg(ts){
    try { if (w.localStorage) w.localStorage.setItem(key, String(ts)); } catch (_) {}
  }
  function attempt(){
    tries++;
    var timer = null;
    var doneAttempt = false;
    function end(ok){
      if (done || doneAttempt) return;
      doneAttempt = true;
      if (timer) clearTimeout(timer);
      if (ok) {
        writeLkg(Date.now());
        finish(true, false, 'ok');
        return;
      }
      if (tries < 3) {
        var delays = [300, 800, 1500];
        w.setTimeout(attempt, delays[tries - 1] || 800);
        return;
      }
      var ts = readLkg();
      var age = Date.now() - ts;
      if (ts && age < ttl) {
        finish(true, true, 'lkg', Math.round(age / 86400000));
        return;
      }
      finish(false, false, 'fail');
    }
    timer = setTimeout(function(){ end(false); }, 1200);
    try {
      w.fetch('/__gg_worker_ping?x=1', { method: 'GET', cache: 'no-store', credentials: 'same-origin' })
        .then(function(res){
          var ver = res && res.headers ? res.headers.get('X-GG-Worker-Version') : '';
          end(!!ver);
        })
        .catch(function(){ end(false); });
    } catch (e) {
      end(false);
    }
  }
  attempt();
}).then(function(ok){
  try { if (GG.core && GG.core.normalizeBlogAlias) GG.core.normalizeBlogAlias(); } catch (_) {}
  return ok;
});
return GG.core._workerPromise;
};
if (GG.core && GG.core.ensureWorker) {
if (GG.boot && GG.boot.defer) GG.boot.defer(function(){ GG.core.ensureWorker(); });
else GG.core.ensureWorker();
}
(function(){
try {
  var root = w.document && w.document.documentElement;
  if (!root || root.hasAttribute('data-gg-prehome')) return;
  var pre = 'landing';
  var search = (w.location && w.location.search) ? w.location.search : '';
  var m = search.match(/[?&]prehome=(blog|landing)(?:&|$)/i);
  var view = '';
  try { view = (new URLSearchParams(search || '').get('view') || '').toLowerCase(); } catch (_) {}
  if (m && m[1]) {
    pre = (m[1] + '').toLowerCase();
  } else if (view === 'blog' || view === 'landing') {
    pre = view;
  } else {
    var hash = (w.location && w.location.hash ? w.location.hash : '').replace(/^#/, '').toLowerCase();
    if (hash === 'blog' || hash === 'landing') {
      pre = hash;
    } else {
      var p = (w.location && w.location.pathname ? w.location.pathname : '/').replace(/\/+$/, '') || '/';
      var isBlog = (GG.core && GG.core.isBlogHomePath) ? GG.core.isBlogHomePath(p, search, w.location ? w.location.hostname : '') : (p === '/blog');
      if (isBlog) pre = 'blog';
    }
  }
  root.setAttribute('data-gg-prehome', pre);
} catch(_) {}
})();
w.GG_ASSET_BASE = ASSET_BASE;
w.GG_IS_DEV = IS_DEV;
w.GG_ASSET = w.GG_ASSET || function(path){
if (!ASSET_BASE || !path) return path;
if (/^https?:\/\//i.test(path)) return path;
if (path.charAt(0) !== "/") path = "/" + path;
return ASSET_BASE + path;
};
w.GG_DIAG = w.GG_DIAG || { modules: {}, errors: [] };
if (!w.GG_DIAG._init) {
w.GG_DIAG._init = true;
w.addEventListener('error', function(e){
  try {
    w.GG_DIAG.errors.push({
      type: 'error',
      message: (e && e.message) ? e.message : 'error',
      source: (e && e.filename) ? e.filename : '',
      line: (e && e.lineno) ? e.lineno : 0,
      col: (e && e.colno) ? e.colno : 0,
      stack: (e && e.error && e.error.stack) ? e.error.stack : '',
      at: Date.now()
    });
    if (w.GG_DIAG_RENDER) w.GG_DIAG_RENDER();
  } catch(_) {}
});
w.addEventListener('unhandledrejection', function(e){
  try {
    var reason = e && e.reason ? e.reason : null;
    w.GG_DIAG.errors.push({
      type: 'rejection',
      message: (reason && reason.message) ? reason.message : String(reason || 'rejection'),
      stack: (reason && reason.stack) ? reason.stack : '',
      at: Date.now()
    });
    if (w.GG_DIAG_RENDER) w.GG_DIAG_RENDER();
  } catch(_) {}
});
}
if(!w.GG_TELEM){
w.GG_TELEM=1;(function(){
  var ep='/api/telemetry',b=0;
  function s(p){
    if(b) return; b=1;
    try{
      var d=JSON.stringify(p||{});
      if(w.navigator&&w.navigator.sendBeacon){
        try{w.navigator.sendBeacon(ep,w.Blob?new Blob([d],{type:'application/json'}):d);}catch(e){}
      }else if(w.fetch){
        w.fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:d,keepalive:true}).catch(function(){});
      }
    }catch(e){}
    b=0;
  }
  w.onerror=function(m,f,l,c,e){
    s({m:m?''+m:'error',f:f||'',l:l||0,c:c||0,st:e&&e.stack?e.stack:''});
    return false;
  };
  w.onunhandledrejection=function(e){
    var r=e&&e.reason;
    s({m:r&&r.message?r.message:''+(r||'rejection'),f:'',l:0,c:0,st:r&&r.stack?r.stack:''});
    return false;
  };
})();
}
window.GG_BUILD = "dev";
if (window.GG_DEBUG) console.log("[GG_BUILD]", window.GG_BUILD);
if(!GG.store || !GG.store.get){
(function(){
  var state = {};
  var subs = [];
  function get(){ return state; }
  function set(patch){
    if(!patch || typeof patch !== 'object') return state;
    var prev = state;
    state = Object.assign({}, state, patch);
    subs.slice().forEach(function(fn){
      try{ fn(state, prev, patch); }catch(e){}
    });
    return state;
  }
  function subscribe(fn){
    if(typeof fn !== 'function') return function(){};
    subs.push(fn);
    return function(){
      var i = subs.indexOf(fn);
      if(i > -1) subs.splice(i, 1);
    };
  }
  GG.store = { get: get, set: set, subscribe: subscribe };
})();
}
GG.view = GG.view || {};
GG.config = GG.config || {};
GG.state = GG.state || {};
GG.core.util = GG.core.util || GG.util || {};
GG.util = GG.core.util;
GG.core.config = GG.core.config || GG.config || {};
GG.config = GG.core.config;
GG.store.state = GG.store.state || GG.state || {};
GG.state = GG.store.state;
GG.ui.view = GG.ui.view || GG.view || {};
GG.view = GG.ui.view;
})(window);

GG.store.set({
lang: 'id-ID',
timeZone: 'Asia/Jakarta',
inputMode: 'touch', // or 'kbd'
dockOpen: false,
rightPanelOpen: false,
reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
GG.ui = GG.ui || {};
GG.ui.applyRootState = GG.ui.applyRootState || function(root, s){
root.dataset.ggLang = s.lang;
root.dataset.ggInput = s.inputMode;
root.dataset.ggDock = s.dockOpen ? '1' : '0';
GG.core.state.toggle(root, 'reduced-motion', !!s.reducedMotion);
};
GG.view = GG.view || {};
GG.view.applyRootState = GG.ui.applyRootState;
(function(){
function run(){
try{
  var root = document.documentElement;
  if(!root || !window.GG || !GG.store || !GG.store.get || !GG.store.subscribe || !GG.ui || !GG.ui.applyRootState) return;
  GG.ui.applyRootState(root, GG.store.get());
  GG.store.subscribe(function(s){
    try{ GG.ui.applyRootState(root, s); }catch(e){}
  });
}catch(e){}
}
if (GG.boot && GG.boot.defer) GG.boot.defer(run);
else run();
})();

(function(GG, w, d){
'use strict';
GG.ui = GG.ui || {};
GG.actions = GG.actions || {};
GG.services = GG.services || {};
var ui = GG.ui, actions = GG.actions;
actions._map = actions._map || {};
actions.register = actions.register || function(name, fn){ if(!name || !fn) return; (actions._map[name] = actions._map[name] || []).push(fn); };
actions.dispatch = actions.dispatch || function(name, evt, el){ var list = actions._map[name]; if(!list) return; list.slice().forEach(function(fn){ try{ fn({ name: name, event: evt, element: el }); }catch(e){}; }); };
actions._handle = actions._handle || function(evt){ var el = evt && evt.target && evt.target.closest ? evt.target.closest('[data-gg-action]') : null; if(!el) return; var name = el.getAttribute('data-gg-action'); if(name) actions.dispatch(name, evt, el); };
actions.init = actions.init || function(){
if(actions._init) return;
actions._init = true;
d.addEventListener('click', actions._handle);
if(GG.core && GG.core.router && GG.core.router.handleClick && !actions._routerBound){
  var bindRouter = function(){
    if (actions._routerBound) return;
    actions._routerBound = true;
    GG.core.router._bound = true;
    d.addEventListener('click', GG.core.router.handleClick);
  };
  if (GG.boot && GG.boot.onReady) GG.boot.onReady(bindRouter);
  else if (GG.boot && GG.boot.defer) GG.boot.defer(bindRouter);
  else w.setTimeout(bindRouter, 1);
}
};
actions.back = actions.back || function(){
try {
  var ref = d.referrer || '';
  var host = w.location && w.location.hostname ? w.location.hostname : '';
  var internal = false;
  if (ref && host) {
    try {
      internal = (new URL(ref)).hostname === host;
    } catch (_) {
      internal = ref.indexOf(host) !== -1;
    }
  }
  if (internal && w.history && typeof w.history.back === 'function') {
    w.history.back();
    return;
  }
  if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
    GG.core.router.go('/');
    return;
  }
  w.location.href = '/';
} catch (_) {
  try { w.location.href = '/'; } catch (e) {}
}
};
if (!actions._backBound) {
actions._backBound = true;
actions.register('back', function(){ actions.back(); });
}
function host(sel){ return d.querySelector(sel); }
function toggleHost(sel, open){
var el = host(sel);
if(!el) return null;
if(open){
  el.hidden = false;
  GG.core.state.remove(el, 'hidden');
  GG.core.state.add(el, 'open');
} else {
  GG.core.state.remove(el, 'open');
  GG.core.state.add(el, 'hidden');
  el.hidden = true;
}
el.setAttribute('aria-hidden', open ? 'false' : 'true');
return el;
}
ui.toast = ui.toast || {};
ui.toast.show = ui.toast.show || function(message, opts){ var el = d.getElementById('gg-toast') || d.getElementById('pc-toast') || host('.gg-toast'); if(!el) return; var textNode = el.querySelector('.gg-toast__message') || el.querySelector('.gg-toast__text'); var msg = (message !== undefined && message !== null) ? String(message) : ''; if(textNode) textNode.textContent = msg; else el.textContent = msg; el.hidden = false; GG.core.state.remove(el, 'hidden'); GG.core.state.add(el, 'visible'); clearTimeout(ui.toast._t); ui.toast._t = setTimeout(function(){ GG.core.state.remove(el, 'visible'); GG.core.state.add(el, 'hidden'); el.hidden = true; }, (opts && opts.duration) ? opts.duration : 2200); };
ui.toast.hide = ui.toast.hide || function(){ var el = d.getElementById('gg-toast') || d.getElementById('pc-toast') || host('.gg-toast'); if(!el) return; GG.core.state.remove(el, 'visible'); GG.core.state.add(el, 'hidden'); el.hidden = true; };
ui.dialog = ui.dialog || {};
ui.dialog.open = ui.dialog.open || function(){ return toggleHost('.gg-dialog-host,[data-gg-ui="dialog"]', true); };
ui.dialog.close = ui.dialog.close || function(){ return toggleHost('.gg-dialog-host,[data-gg-ui="dialog"]', false); };
ui.overlay = ui.overlay || {};
ui.overlay.open = ui.overlay.open || function(){ var el = d.getElementById('gg-overlay'); if(!el) return; el.hidden = false; GG.core.state.remove(el, 'hidden'); GG.core.state.add(el, 'open'); };
ui.overlay.close = ui.overlay.close || function(){ var el = d.getElementById('gg-overlay'); if(!el) return; GG.core.state.remove(el, 'open'); GG.core.state.add(el, 'hidden'); el.hidden = true; };
ui.skeleton = ui.skeleton || {};
ui.skeleton.markup = ui.skeleton.markup || '' +
'<div class="gg-skeleton" aria-hidden="true">' +
  '<div class="gg-skeleton__bar gg-skeleton__hero"></div>' +
  '<div class="gg-skeleton__bar gg-skeleton__title"></div>' +
  '<div class="gg-skeleton__bar gg-skeleton__line"></div>' +
  '<div class="gg-skeleton__bar gg-skeleton__line"></div>' +
  '<div class="gg-skeleton__bar gg-skeleton__line gg-skeleton__line--short"></div>' +
'</div>';
ui.skeleton.render = ui.skeleton.render || function(target){
if(!target) return;
target.innerHTML = ui.skeleton.markup;
};
ui.layout = ui.layout || {};
ui.layout._inferSurfaceFromUrl = ui.layout._inferSurfaceFromUrl || function(url){
try {
  var u = new URL(url || w.location.href, w.location.href);
  var path = (u.pathname || '').replace(/\/+$/, '') || '/';
  var view = (u.searchParams.get('view') || '').toLowerCase();
  var isBlogHome = (GG.core && GG.core.isBlogHomePath) ? GG.core.isBlogHomePath(path, u.search || '', u.hostname || w.location.hostname) : (path === '/blog' || (path === '/' && view === 'blog'));
  if (isBlogHome) return 'listing';
  if (path === '/') {
    return 'landing';
  }
  if (path.indexOf('/search') !== -1) return 'listing';
  if (path.indexOf('/p/') !== -1) return 'page';
} catch (_) {}
return 'post';
};
ui.layout.detectSurface = ui.layout.detectSurface || function(doc, url){
var ref = doc || d;
var inferred = ui.layout._inferSurfaceFromUrl(url || w.location.href);
if (inferred === 'listing') return 'listing';
var body = ref && ref.body ? ref.body : null;
var attr = body ? (body.getAttribute('data-gg-surface') || (body.dataset && body.dataset.ggSurface)) : '';
if (attr) return attr;
var main = ref && ref.querySelector ? ref.querySelector('main.gg-main[data-gg-surface]') : null;
if (main) {
  var m = main.getAttribute('data-gg-surface') || '';
  if (m === 'home') return 'landing';
  if (m === 'feed') return 'listing';
  if (m === 'page') return 'page';
  if (m === 'post') return 'post';
}
return ui.layout._inferSurfaceFromUrl(url || w.location.href);
};
ui.layout.setSurface = ui.layout.setSurface || function(surface){
if (!surface) return;
if (d.body) {
  d.body.setAttribute('data-gg-surface', surface);
}
if (GG.state) GG.state.surface = surface;
};
ui.layout._ensureLandingProfile = ui.layout._ensureLandingProfile || function(){
var sidebar = d.querySelector('.gg-blog-sidebar--right');
if (!sidebar) return;
var existing = sidebar.querySelector('[data-gg-profile="landing"]');
if (existing) return;
var source = d.querySelector('.gg-leftnav__profile');
if (!source) return;
var clone = source.cloneNode(true);
clone.setAttribute('data-gg-profile', 'landing');
clone.classList.add('gg-right-profile');
sidebar.insertBefore(clone, sidebar.firstChild);
};
ui.layout._clearLandingProfile = ui.layout._clearLandingProfile || function(){
var sidebar = d.querySelector('.gg-blog-sidebar--right');
if (!sidebar) return;
var existing = sidebar.querySelectorAll('[data-gg-profile="landing"]');
for (var i = 0; i < existing.length; i++) {
  if (existing[i] && existing[i].parentNode) {
    existing[i].parentNode.removeChild(existing[i]);
  }
}
};
ui.layout._setHeroVisible = ui.layout._setHeroVisible || function(show){
var landing = d.querySelector('[data-gg-home-layer="landing"], .gg-home-landing');
if (landing) {
  landing.style.display = show ? 'block' : 'none';
  landing.setAttribute('aria-hidden', show ? 'false' : 'true');
}
var hero = d.getElementById('gg-landing-hero');
if (hero) {
  hero.style.display = show ? '' : 'none';
  hero.setAttribute('aria-hidden', show ? 'false' : 'true');
}
};
ui.layout._dockComments = ui.layout._dockComments || function(){
var panel = d.querySelector('.gg-comments-panel [data-gg-slot="comments"]');
if (!panel) return;
var comments = d.querySelector('.gg-post__comments') || d.querySelector('#comments') || d.querySelector('.gg-comments');
if (!comments) return;
if (comments.__ggDocked) return;
panel.appendChild(comments);
comments.__ggDocked = true;
};
ui.layout._listingFlowOrder = ui.layout._listingFlowOrder || {
top: ['gg-mixed-featuredstrip', 'gg-mixed-newsish-1', 'gg-mixed-bookish'],
deferred: ['gg-mixed-youtubeish', 'gg-mixed-shortish', 'gg-mixed-newsish-2', 'gg-mixed-podcastish'],
disabled: ['gg-mixed-instagramish', 'gg-mixed-newsish-3', 'gg-mixed-newsish-4', 'gg-mixed-pinterestish']
};
ui.layout._normalizeListingFlow = ui.layout._normalizeListingFlow || function(){
var main = d.querySelector('main.gg-main[data-gg-surface="listing"] .gg-blog-main');
if (!main) return;

function mixedWidgetById(id){
  var section = id ? d.getElementById(id) : null;
  if (!section) return null;
  return section.closest('.widget') || section;
}
function moveWidget(widget, anchor){
  if (!widget || !main || !anchor) return;
  widget.classList.add('gg-mixed-widget--flow');
  if (widget.parentNode !== main || widget.nextSibling !== anchor) {
    main.insertBefore(widget, anchor);
  }
}
function markWidget(widget, orderIdx, isDeferred){
  if (!widget) return;
  widget.classList.add('gg-mixed-widget--flow');
  widget.setAttribute('data-gg-flow-order', String(orderIdx));
  if (isDeferred) widget.classList.add('gg-mixed-widget--deferred');
  else widget.classList.remove('gg-mixed-widget--deferred');
}
function hideSectionById(id){
  var section = id ? d.getElementById(id) : null;
  if (!section) return;
  section.setAttribute('data-gg-disabled', '1');
  var widget = section.closest('.widget');
  if (widget) {
    widget.hidden = true;
    widget.setAttribute('data-gg-disabled', '1');
  }
}

var blogSection = d.getElementById('blog');
if (!blogSection || blogSection.parentNode !== main) return;

var order = ui.layout._listingFlowOrder || {};
var top = Array.isArray(order.top) ? order.top : [];
var deferred = Array.isArray(order.deferred) ? order.deferred : [];
var disabled = Array.isArray(order.disabled) ? order.disabled : [];
var ssrReady = main.getAttribute('data-gg-listing-flow-ssr') === '1';
var topWidgets = [];
var deferredWidgets = [];

for (var i = 0; i < top.length; i++) {
  var topWidget = mixedWidgetById(top[i]);
  if (!topWidget) continue;
  markWidget(topWidget, i + 1, false);
  topWidgets.push(topWidget);
}

for (var j = 0; j < deferred.length; j++) {
  var deferredWidget = mixedWidgetById(deferred[j]);
  if (!deferredWidget) continue;
  markWidget(deferredWidget, top.length + j + 1, true);
  deferredWidgets.push(deferredWidget);
}

if (!ssrReady) {
  for (var m = 0; m < topWidgets.length; m++) {
    moveWidget(topWidgets[m], blogSection);
  }
  var cursor = blogSection;
  for (var n = 0; n < deferredWidgets.length; n++) {
    var widget = deferredWidgets[n];
    if (widget.parentNode !== main || widget.previousSibling !== cursor) {
      main.insertBefore(widget, cursor.nextSibling);
    }
    cursor = widget;
  }
}

for (var k = 0; k < disabled.length; k++) {
  hideSectionById(disabled[k]);
}

var featuredWidget = d.getElementById('FeaturedPost1');
if (featuredWidget) {
  featuredWidget.hidden = true;
  featuredWidget.setAttribute('data-gg-relocated', '1');
}

main.setAttribute('data-gg-listing-flow', 'reading-first');
};
ui.layout.applySurface = ui.layout.applySurface || function(surface, doc, url){
var next = surface || ui.layout.detectSurface(doc, url);
ui.layout.setSurface(next);

if (GG.core && GG.core.state && d.body) {
  GG.core.state.toggle(d.body, 'landing', next === 'landing');
}

var main = d.querySelector('main.gg-main[data-gg-surface]') || d.querySelector('main.gg-main');
var hasHomeRoot = !!(main && main.hasAttribute('data-gg-home-root'));

if (hasHomeRoot && GG.modules && GG.modules.homeState && typeof GG.modules.homeState.setState === 'function') {
  if (next === 'landing') {
    GG.modules.homeState.setState('landing');
  } else if (next === 'listing') {
    GG.modules.homeState.setState('blog');
  }
}

ui.layout._setHeroVisible(next === 'landing');

if (next === 'listing') {
  ui.layout._normalizeListingFlow();
} else if (next === 'post') {
  ui.layout._clearLandingProfile();
  ui.layout._dockComments();
} else {
  ui.layout._ensureLandingProfile();
  if (main) main.removeAttribute('data-gg-right-mode');
  var commentsPanel = d.querySelector('.gg-comments-panel');
  if (commentsPanel) {
    commentsPanel.hidden = true;
    commentsPanel.setAttribute('inert','');
  }
}

if (GG.modules && GG.modules.Dock && typeof GG.modules.Dock.updateActive === 'function') {
  try { GG.modules.Dock.updateActive(); } catch (_) {}
}
};
ui.layout.sync = ui.layout.sync || function(doc, url){
function pickMain(ref){
  if (!ref || !ref.querySelector) return null;
  return ref.querySelector('main.gg-main') || ref.querySelector('main');
}
function inferSurface(mainEl){
  if (!mainEl || !mainEl.querySelector) return '';
  var surfaceEl = mainEl.querySelector('[data-gg-surface]');
  if (surfaceEl && surfaceEl.getAttribute('data-gg-surface')) {
    return surfaceEl.getAttribute('data-gg-surface');
  }
  if (mainEl.querySelector('.gg-blog-layout--post')) return 'post';
  if (mainEl.querySelector('.gg-blog-layout--list')) return 'home';
  return '';
}
var targetMain = pickMain(d);
if (!targetMain) return null;
var sourceMain = pickMain(doc);
var attrs = ['data-gg-surface', 'data-gg-home-state', 'data-gg-home-root'];
if (sourceMain) {
  for (var i = 0; i < attrs.length; i++) {
    var name = attrs[i];
    if (sourceMain.hasAttribute(name)) {
      targetMain.setAttribute(name, sourceMain.getAttribute(name));
    } else {
      targetMain.removeAttribute(name);
    }
  }
} else {
  var surface = inferSurface(targetMain);
  if (surface) targetMain.setAttribute('data-gg-surface', surface);
}
ui.layout.applySurface(ui.layout.detectSurface(doc, url), doc, url);
return targetMain;
};
ui.layout.refresh = ui.layout.refresh || function(doc){
ui.layout.sync(doc);
if (GG.modules && GG.modules.Panels && GG.modules.Panels.init) {
  GG.modules.Panels.init();
}
if (GG.modules && GG.modules.Dock && typeof GG.modules.Dock.updateActive === 'function') {
  try { GG.modules.Dock.updateActive(); } catch (_) {}
}
};
ui.inputMode = ui.inputMode || {};
ui.inputMode.get = ui.inputMode.get || function(){ if(GG.store && GG.store.get){ var s = GG.store.get(); return s && s.inputMode; } return d.documentElement ? d.documentElement.dataset.ggInput : ''; };
ui.inputMode.set = ui.inputMode.set || function(mode){ if(!mode) return; if(GG.store && GG.store.set) GG.store.set({ inputMode: mode }); else if(d.documentElement) d.documentElement.dataset.ggInput = mode; };
GG.services.actions = GG.services.actions || {};
GG.services.actions.init = GG.services.actions.init || function(){ if(GG.services.actions._init) return; GG.services.actions._init = true; actions.init(); };
})(window.GG = window.GG || {}, window, document);


GG.actions.register('dock:toggle', () => {
const s = GG.store.get();
GG.store.set({ dockOpen: !s.dockOpen });
});
GG.ui = GG.ui || {};
GG.ui.ggToast = GG.ui.ggToast || function(message){
if(window.GG && GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function'){
GG.ui.toast.show(message);
return;
}
if(window.GG && GG.util && typeof GG.util.showToast === 'function'){
GG.util.showToast(message);
return;
}
};
GG.ui._initPosterModules = GG.ui._initPosterModules || function(){
if (GG.modules.shareSheet && typeof GG.modules.shareSheet.init === 'function') GG.modules.shareSheet.init();
if (GG.modules.posterCanvas && typeof GG.modules.posterCanvas.init === 'function') GG.modules.posterCanvas.init();
if (GG.modules.posterEngine && typeof GG.modules.posterEngine.init === 'function') GG.modules.posterEngine.init();
if (GG.modules.shareMotion && typeof GG.modules.shareMotion.init === 'function') GG.modules.shareMotion.init();
};
GG.ui.toggleCommentsHelp = GG.ui.toggleCommentsHelp || function(open){
var modal = document.querySelector('[data-gg-modal=\"comments-help\"]');
if(!modal) return;
modal.hidden = !open;
modal.setAttribute('aria-hidden', open ? 'false' : 'true');
GG.core.state.toggle(modal, 'open', !!open);
};
GG.actions.register('comments-help', function(){
GG.ui.toggleCommentsHelp(true);
});
GG.actions.register('comments-help-close', function(){
GG.ui.toggleCommentsHelp(false);
});
GG.actions.register('like', function(){
GG.ui.ggToast('Coming soon');
});
GG.actions.register('bookmark', function(ctx){
var event = ctx && ctx.event;
var element = ctx && ctx.element;
if (event && event.defaultPrevented) return;
if (GG.modules.library && typeof GG.modules.library.toggleFromAction === 'function') {
if (event && event.preventDefault) event.preventDefault();
GG.modules.library.toggleFromAction(element);
}
});
function ggOpenShareSheet(meta){
if (GG.modules.shareSheet && typeof GG.modules.shareSheet.open === 'function') {
GG.modules.shareSheet.open(meta);
return true;
}
if (GG.util && typeof GG.util.openShareSheet === 'function') {
GG.util.openShareSheet(meta);
return true;
}
return false;
}
function ggFallbackShare(meta){
var url = (meta && (meta.url || meta.href)) ? (meta.url || meta.href) : window.location.href;
var title = (meta && meta.title) ? meta.title : document.title;
if (navigator.share) {
navigator.share({ title: title, url: url }).catch(function(){});
return true;
}
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(url).then(function(){
  if (GG.ui && typeof GG.ui.ggToast === 'function') GG.ui.ggToast('Link copied');
});
return true;
}
return false;
}
function ggRequestPosterBucket(meta){
if (ggOpenShareSheet(meta)) return;
if (GG.boot && typeof GG.boot.loadModule === 'function') {
GG.boot.loadModule('ui.bucket.poster.js').then(function(){
  if (GG.ui && typeof GG.ui._initPosterModules === 'function') GG.ui._initPosterModules();
  if (!ggOpenShareSheet(meta)) ggFallbackShare(meta);
}).catch(function(){
  ggFallbackShare(meta);
});
return;
}
ggFallbackShare(meta);
}
GG.actions.register('share', function(ctx){
var event = ctx && ctx.event;
var element = ctx && ctx.element;
var sheet = document.getElementById('gg-share-sheet') || document.getElementById('pc-poster-sheet');
if (sheet && GG.core.state.has(sheet, 'open')) return;
var meta = (GG.util && typeof GG.util.getMetaFromElement === 'function')
? GG.util.getMetaFromElement(element)
: null;
if (event && event.preventDefault) event.preventDefault();
if (GG.services && GG.services.share && GG.services.share.open) {
GG.services.share.open(meta);
return;
}
ggFallbackShare(meta);
});
GG.actions.register('jump', function(ctx){
var event = ctx && ctx.event;
var element = ctx && ctx.element;
if (event && event.defaultPrevented) return;
if (event && event.preventDefault) event.preventDefault();
var icon = element && element.querySelector ? element.querySelector('.gg-icon') : null;
var dirDown = icon && icon.textContent && icon.textContent.indexOf('_down') > -1;
var doc = document.documentElement;
var maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
window.scrollTo({ top: dirDown ? maxY : 0, behavior: 'smooth' });
});

(function(GG, w, d){
'use strict';
GG.services = GG.services || {};
GG.boot = GG.boot || {};
var services = GG.services;

services.api = services.api || {};
services.api._buildQuery = services.api._buildQuery || function(params){
if (!params) return '';
var list = [];
for (var key in params) {
  if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
  var val = params[key];
  if (val === undefined || val === null || val === '') continue;
  list.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)));
}
return list.join('&');
};
services.api.getFeedBase = services.api.getFeedBase || function(summary){
var cfg = (GG.store && GG.store.config) ? GG.store.config : {};
var base = summary ? (cfg.feedSummaryBase || '/feeds/posts/summary') : (cfg.feedBase || '/feeds/posts/default');
if (base.charAt(0) !== '/') base = '/' + base;
return base.replace(/\/$/, '');
};
services.api._error = services.api._error || function(code, message, info){
var err = new Error(message || 'api-error');
err.name = 'GGApiError';
err.code = code;
if (info) err.info = info;
return err;
};
services.api._log = services.api._log || function(payload){
try {
  if (GG.core && typeof GG.core.telemetry === 'function') GG.core.telemetry(payload);
} catch (e) {}
};
services.api.fetch = services.api.fetch || function(url, type){
var mode = type || 'json';
if (!url) return Promise.reject(services.api._error('invalid', 'invalid-url', { url: url }));
var opts = { method: 'GET', cache: 'default', credentials: 'same-origin' };
return w.fetch(url, opts).then(function(res){
  if (!res || !res.ok) {
    var err = services.api._error('http', 'request-failed', { url: url, status: res ? res.status : 0, type: mode });
    services.api._log({ type: 'api', stage: 'response', url: url, status: res ? res.status : 0, code: err.code });
    throw err;
  }
  if (mode === 'text' || mode === 'html') return res.text();
  return res.json();
}).catch(function(err){
  if (err && err.name === 'GGApiError') {
    services.api._log({ type: 'api', stage: 'error', url: url, code: err.code });
    throw err;
  }
  var wrapped = services.api._error('network', 'network-failure', { url: url, type: mode, message: err && err.message ? err.message : '' });
  services.api._log({ type: 'api', stage: 'error', url: url, code: wrapped.code });
  throw wrapped;
});
};
services.api.getFeed = services.api.getFeed || function(params){
var opts = params || {};
var base = opts.base || services.api.getFeedBase(!!opts.summary);
var source = (opts.query && typeof opts.query === 'object') ? opts.query : opts;
var query = {};
for (var key in source) {
  if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
  if (key === 'summary' || key === 'base' || key === 'query' || key === 'type') continue;
  query[key] = source[key];
}
if (!query.alt) query.alt = 'json';
var qs = services.api._buildQuery(query);
var url = base + (qs ? '?' + qs : '');
return services.api.fetch(url, 'json');
};
services.api.getHtml = services.api.getHtml || function(url){
return services.api.fetch(url, 'text');
};

services.comments = services.comments || (function(){
var moved = false;
function qs(sel, root){ return (root || document).querySelector(sel); }
function findBloggerCommentsRoot(){
  return qs('.gg-post__comments') ||
         qs('#comments') ||
         qs('#comment-holder') ||
         qs('.comments') ||
         qs('.comment-thread') ||
         qs('div[id*="comments"]');
}
function ensureSlot(){
  return qs('.gg-comments-panel[data-gg-panel="comments"] [data-gg-slot="comments"]');
}
function setLoading(slot, on){
  if (!slot) return;
  if (on){
    if (slot.__ggLoading) return;
    slot.__ggLoading = true;
    slot.innerHTML = "<div class='gg-comments-loading' role='status' aria-live='polite'>Loading comments...</div>";
  } else {
    slot.__ggLoading = false;
    var el = slot.querySelector('.gg-comments-loading');
    if (el) el.remove();
  }
}

function mount(){
  var slot = ensureSlot();
  if (!slot) return false;

  var src = findBloggerCommentsRoot();
  if (!src) return false;

  if (src.parentNode !== slot){
    setLoading(slot, false);
    slot.innerHTML = '';
    slot.appendChild(src);
  } else {
    setLoading(slot, false);
  }
  moved = true;
  return true;
}

function mountWithRetry(){
  var tries = 0;
  var max = 10;          // ~5s total
  var delay = 500;

  var slot = ensureSlot();
  if (!slot) return;

  if (mount()){
    setLoading(ensureSlot(), false);
    return;
  }

  setLoading(slot, true);

  function tick(){
    tries++;
    if (mount()){
      setLoading(ensureSlot(), false);
      return;
    }
    if (tries >= max) {
      var s = ensureSlot();
      if (s){
        s.innerHTML = "<div class='gg-comments-loading' role='status' aria-live='polite'>Comments are not available right now.</div>";
      }
      return;
    }
    setTimeout(tick, delay);
  }
  tick();
}

return { mountWithRetry: mountWithRetry };
})();

services.share = services.share || (function(){
function hasHost(){
  return !!document.querySelector('#gg-share-sheet,#pc-poster-sheet');
}
function getMeta(meta){
  meta = meta || {};
  return {
    url: meta.url || meta.href || location.href,
    title: meta.title || document.title,
    text: meta.text || ''
  };
}
function clipboardFallback(meta){
  meta = getMeta(meta);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(meta.url).then(function(){
      try{ if (GG.ui && typeof GG.ui.ggToast === 'function') GG.ui.ggToast('Link copied'); }catch(_){}
    }).catch(function(){
      try{ window.prompt('Copy link:', meta.url); }catch(_){}
    });
  }
  try{ window.prompt('Copy link:', meta.url); }catch(_){}
  return Promise.resolve();
}
function nativeOrClipboard(meta){
  meta = getMeta(meta);
  if (navigator.share) {
    return navigator.share({ title: meta.title, text: meta.text, url: meta.url })
      .catch(function(){ return clipboardFallback(meta); });
  }
  return clipboardFallback(meta);
}
function open(meta){
  meta = getMeta(meta);
  if (hasHost() && GG.boot && GG.boot.loadModule) {
    return GG.boot.loadModule('ui.bucket.poster.js').then(function(){
      var S = GG.modules && GG.modules.shareSheet;
      if (S && typeof S.init === 'function') {
        try { S.init(); } catch(_) {}
      }
      if (S && S.open) {
        try { return Promise.resolve(S.open(meta)); } catch(e) { return nativeOrClipboard(meta); }
      }
      return nativeOrClipboard(meta);
    }).catch(function(){
      return nativeOrClipboard(meta);
    });
  }
  return nativeOrClipboard(meta);
}

return { open: open };
})();

GG.boot.onReady = GG.boot.onReady || function(fn){
if (typeof fn !== 'function') return;
GG.boot._readyQueue = GG.boot._readyQueue || [];
GG.boot._readyQueue.push(fn);
var flush = function(){
  var q = GG.boot._readyQueue || [];
  GG.boot._readyQueue = [];
  for (var i = 0; i < q.length; i++) {
    try { q[i](); } catch (e) {}
  }
};
if (d.readyState !== 'loading') {
  GG.boot._readyBound = true;
  if (GG.boot._readyFlushScheduled) return;
  GG.boot._readyFlushScheduled = true;
  var run = function(){
    GG.boot._readyFlushScheduled = false;
    flush();
  };
  if (w.queueMicrotask) w.queueMicrotask(run);
  else w.setTimeout(run, 0);
  return;
}
if (GG.boot._readyBound) return;
GG.boot._readyBound = true;
if (GG.util && GG.util.initOnce) {
  GG.util.initOnce('GG.boot.onReady', function(){
    d.addEventListener('DOMContentLoaded', flush, { once: true });
  });
} else {
  d.addEventListener('DOMContentLoaded', flush, { once: true });
}
};

GG.boot._initStage1 = GG.boot._initStage1 || function(){
if (GG.boot._stage1) return;
GG.boot._stage1 = true;
try {
  var cfgEl = d.getElementById('gg-config');
  if (cfgEl) {
    var rawCfg = cfgEl.getAttribute('data-json') || '';
    if (rawCfg) {
      try {
        var parsedCfg = JSON.parse(rawCfg);
        if (parsedCfg && typeof parsedCfg === 'object') {
          GG.store.config = Object.assign({}, GG.store.config || {}, parsedCfg);
        }
      } catch (e) {
        if (GG.core && typeof GG.core.telemetry === 'function') {
          GG.core.telemetry({ type: 'config', stage: 'parse', message: e && e.message ? e.message : 'parse-failed' });
        }
      }
    }
  }
} catch (_) {}
if (GG.core && GG.core.init) GG.core.init();
if (services.pwa && services.pwa.init) services.pwa.init();
if (GG.boot.onReady) {
  GG.boot.onReady(function(){
    var run = function(){ if (GG.app && typeof GG.app.init === 'function') GG.app.init(); };
    if (GG.boot && GG.boot.defer) GG.boot.defer(run);
    else run();
  });
}
};

GG.boot.init = GG.boot.init || function(){
if(GG.boot._init) return;
GG.boot._init = true;
var isDev = !!(GG.env && GG.env.mode === 'dev');
if (isDev && w.performance && performance.mark) {
  performance.mark('gg_stage0_start');
}
if (GG.services && GG.services.actions && GG.services.actions.init) {
  GG.services.actions.init();
}
var schedule = function(){
  if (GG.boot && GG.boot._initStage1) GG.boot._initStage1();
};
if (GG.boot && GG.boot.defer) GG.boot.defer(schedule);
else w.setTimeout(schedule, 1);
if (isDev && w.performance && performance.mark && performance.measure) {
  performance.mark('gg_stage0_end');
  try { performance.measure('gg_stage0', 'gg_stage0_start', 'gg_stage0_end'); } catch (_) {}
  try {
    var entries = performance.getEntriesByName('gg_stage0');
    if (entries && entries.length && w.console && console.info) {
      console.info('GG DEV: stage0', Math.round(entries[entries.length - 1].duration) + 'ms');
    } else if (w.console && console.info) {
      console.info('GG DEV: stage0');
    }
  } catch (_) {
    try { if (w.console && console.info) console.info('GG DEV: stage0'); } catch (_) {}
  }
}
};

})(window.GG = window.GG || {}, window, document);
(function(GG){
'use strict';
if(!GG || !GG.boot || !GG.services || !GG.services.actions) return;
if(!GG.boot._actionsPatched){
var prevInit = GG.boot.init;
GG.boot._actionsPatched = true;
GG.boot.init = function(){
  if(prevInit) prevInit();
  if(GG.services.actions && GG.services.actions.init) GG.services.actions.init();
  var run = function(){
    if(GG.core && GG.core.router && GG.core.router.init) GG.core.router.init();
    if(GG.services.a11y && GG.services.a11y.init) GG.services.a11y.init();
  };
  if (GG.boot && GG.boot.defer) GG.boot.defer(run);
  else setTimeout(run, 1);
};
}
})(window.GG = window.GG || {});



(function(){
var run = function(){
const v = document.getElementById("ggHeroVideo");
const hero = document.getElementById("gg-landing-hero");
if (!v || !hero || !("IntersectionObserver" in window)) return;
var reduced = false;
try{
  if (window.GG && GG.store && GG.store.get) {
    var st = GG.store.get();
    if (st && typeof st.reducedMotion === 'boolean') reduced = st.reducedMotion;
  }
}catch(e){}
if (!reduced) {
  try{
    if (window.GG && GG.services && GG.services.a11y && GG.services.a11y.reducedMotion) {
      reduced = !!GG.services.a11y.reducedMotion.get();
    }
  }catch(e){}
}
if (!reduced && window.matchMedia) {
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
}
var nav = navigator || {};
var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
var slowNet = !!(conn && (conn.saveData || (typeof conn.effectiveType === 'string' && /2g|slow-2g/i.test(conn.effectiveType)) || (typeof conn.downlink === 'number' && conn.downlink < 1.0)));
if (reduced || slowNet) {
  try { v.pause(); } catch (_) {}
  try { v.autoplay = false; v.removeAttribute('autoplay'); } catch (_) {}
  try { v.controls = true; } catch (_) {}
  return;
}

v.play().catch(()=>{});
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=> e.isIntersecting ? v.play().catch(()=>{}) : v.pause());
}, { threshold: 0.25 });
io.observe(hero);
};
if (window.GG && GG.boot && GG.boot.defer) GG.boot.defer(run);
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
else run();
})();




window.GG = window.GG || {};
GG.config  = GG.config  || {};
GG.state   = GG.state   || {};
GG.modules = GG.modules || {};
GG.util    = GG.util    || {};
GG.state.surface   = GG.state.surface   || null;
GG.state.homeState = GG.state.homeState || null;

GG.util = GG.util || {};
GG.util.homeRouter = GG.util.homeRouter || (function(){
var BASE_PATH = '';
function normalizeBase(){
var base = BASE_PATH || '';
if (!base) return '';
if (base.charAt(0) !== '/') base = '/' + base;
if (base.length > 1 && base.charAt(base.length - 1) === '/') base = base.slice(0, -1);
return base;
}
function stripBase(path){
var base = normalizeBase();
if (!base) return path || '/';
if (path && path.indexOf(base) === 0){
  return path.slice(base.length) || '/';
}
return path || '/';
}
function isHomeRoute(main){
if(!main) return false;
var surface = main.getAttribute('data-gg-surface') || '';
if(surface === 'post') return false;
var hasLanding = !!main.querySelector('[data-gg-home-layer="landing"], .gg-home-landing');
var hasBlog = !!main.querySelector('[data-gg-home-layer="blog"], .gg-home-blog');
return hasLanding && hasBlog;
}
function desiredHomeStateFromPath(pathname, search){
var path = stripBase(pathname || location.pathname || '/');
var query = (typeof search === 'string') ? search : (location.search || '');
var view = '';
try { view = (new URLSearchParams(query).get('view') || '').toLowerCase(); } catch (_) {}
if (path === '/' || path === '') {
  if (view === 'blog') return 'blog';
  if (view === 'landing') return 'landing';
  return 'landing';
}
if (GG.core && GG.core.isBlogHomePath && GG.core.isBlogHomePath(path, query, location.hostname)) return 'blog';
return null;
}
function pushState(state, path){
var base = normalizeBase();
var dest = (path || '/');
if (dest.charAt(0) !== '/') dest = '/' + dest;
try{ history.pushState({ ggHome: state }, '', base + dest); }catch(_){}
}
return {
isHomeRoute: isHomeRoute,
desiredHomeStateFromPath: desiredHomeStateFromPath,
pushState: pushState
};
})();

GG.util.initOnce = GG.util.initOnce || (function(){
var ran = {};
return function(key, fn){
if (!key || typeof fn !== 'function') return;
if (ran[key]) return;
ran[key] = true;
return fn();
};
})();

GG.util.isDebug = GG.util.isDebug || function(){
return /(?:\?|&)ggdebug=1(?:&|$)/.test(location.search || '');
};

GG.homePrepaint = GG.homePrepaint || (function(){
function log(msg){
if (GG.util && GG.util.isDebug && GG.util.isDebug()) {
  try { console.log(msg); } catch(_){}
}
}
function removeAttr(){
document.documentElement.removeAttribute('data-gg-prehome');
}
function disarm(){
if (GG.util && GG.util.initOnce) {
  return GG.util.initOnce('homePrepaint.disarm', function(){
    var hasHomeRoot = !!document.querySelector('[data-gg-home-root="1"]');
    if (!hasHomeRoot) {
      removeAttr();
      log('[prehome] disarm (no home root)');
      return;
    }
    removeAttr();
    log('[prehome] disarm (home root)');
  });
}
var hasHomeRoot = !!document.querySelector('[data-gg-home-root="1"]');
if (!hasHomeRoot) {
  removeAttr();
  log('[prehome] disarm (no home root)');
  return;
}
removeAttr();
log('[prehome] disarm (home root)');
}
return { disarm: disarm };
})();

GG.modules.homeState = (function () {
var root = null;
var landingLayer = null;
var blogLayer = null;
var ALLOWED = ['landing', 'blog'];
var popBound = false;

function findLayers() {
if (!root) return;
landingLayer = root.querySelector('[data-gg-home-layer="landing"], .gg-home-landing');
blogLayer    = root.querySelector('[data-gg-home-layer="blog"], .gg-home-blog');
}

function applyVisibility(state) {
if (!root) return;
var isLanding = (state === 'landing');

if (landingLayer) {
  landingLayer.style.display = isLanding ? 'block' : 'none';
  landingLayer.setAttribute('aria-hidden', isLanding ? 'false' : 'true');
}

if (blogLayer) {
  var showBlog = !isLanding;
  blogLayer.style.display = showBlog ? 'block' : 'none';
  blogLayer.setAttribute('aria-hidden', showBlog ? 'false' : 'true');
}

GG.core.state.toggle(root, 'landing', isLanding);
GG.core.state.toggle(root, 'blog', !isLanding);
if (document.body) {
  GG.core.state.toggle(document.body, 'landing', isLanding);
  GG.core.state.toggle(document.body, 'blog', !isLanding);
}
}

function setState(next) {
if (!root) return;
if (!landingLayer && !blogLayer) return;
var state = ALLOWED.indexOf(next) !== -1 ? next : 'landing';
if (state === 'landing' && !landingLayer) state = 'blog';
if (state === 'blog' && !blogLayer) state = 'landing';
GG.state.homeState = state;
root.setAttribute('data-gg-home-state', state);
applyVisibility(state);
if (window.GG_DEBUG) console.log('[homeState]', state);
}

function init(mainEl) {
root = mainEl || document.querySelector('main.gg-main');
if (!root) return;
if (!root.hasAttribute('data-gg-home-root')) return;
findLayers();
if (!landingLayer || !blogLayer) return;

var desired = null;
if (GG.util && GG.util.homeRouter && typeof GG.util.homeRouter.desiredHomeStateFromPath === 'function') {
desired = GG.util.homeRouter.desiredHomeStateFromPath(location.pathname, location.search);
}
var attr = root.getAttribute('data-gg-home-state');
var initial = (ALLOWED.indexOf(attr) !== -1) ? attr : 'landing';
if (desired === 'landing' || desired === 'blog') initial = desired;

setState(initial);
if (GG.homePrepaint && GG.homePrepaint.disarm) {
GG.homePrepaint.disarm();
}
if (initial === 'blog') {
requestAnimationFrame(function(){
  var anchor = document.getElementById('gg-home-blog-anchor') || document.querySelector('#gg-home-blog-anchor');
  if (anchor && anchor.scrollIntoView) anchor.scrollIntoView({ block:'start', behavior:'auto' });
});
}
if (!popBound) {
popBound = true;
window.addEventListener('popstate', function(){
  var next = null;
  if (GG.util && GG.util.homeRouter && typeof GG.util.homeRouter.desiredHomeStateFromPath === 'function') {
    next = GG.util.homeRouter.desiredHomeStateFromPath(location.pathname, location.search);
  }
  if (!next || !root) return;
  var cur = root.getAttribute('data-gg-home-state') || 'landing';
  if (next !== cur) setState(next);
});
}
}


return {
init: init,
setState: setState
};
})();

GG.modules.Dock = (function () {
var dockEl;
var mainEl;
var buttons = [];
var homeUrl = '/';
var searchUrl = null;
var isSearchMode = false;
var searchForm = null;
var searchInput = null;
var sizeRaf = null;
var homeObs = null;
var autoHideRaf = 0;
var lastScrollY = 0;
var dockHidden = false;
var autoHideBound = false;

function scrollToAnchor(sel) {
if (!sel) return;
var t = document.querySelector(sel);
if (!t) return;
try {
  t.scrollIntoView({ behavior: 'smooth', block: 'start' });
} catch (e) {
  t.scrollIntoView(true);
}
}

function goHome(anchor) {
var hash = (anchor  && anchor.charAt(0) === '#') ? anchor : '';
var base = homeUrl || '/';
var cleanBase = base.split('#')[0].replace(/\/+$/, '');
var url = hash ? (cleanBase + '/' + hash) : (cleanBase + '/');
window.location.href = url;
}

function enterSearch(){
if (isSearchMode) return;
isSearchMode = true;
GG.core.state.add(dockEl, 'search');
revealDock();
if (searchInput){
  try { searchInput.focus(); } catch(e){}
}
scheduleWidthUpdate();
}

function exitSearch(){
if (!isSearchMode) return;
isSearchMode = false;
GG.core.state.remove(dockEl, 'search');
revealDock();
scheduleWidthUpdate();
}

function currentHomeState() {
if (!mainEl) return 'landing';
var attr = mainEl.getAttribute('data-gg-home-state');
return (attr === 'blog') ? 'blog' : 'landing';
}

function isHomeCapable(){
return !!(mainEl && GG.util && GG.util.homeRouter && GG.util.homeRouter.isHomeRoute && GG.util.homeRouter.isHomeRoute(mainEl));
}
function effectiveDockState() {
if (isHomeCapable()) return currentHomeState();
return 'blog';
}

function visibleButtons(){
var ctrls = Array.prototype.slice.call(
  dockEl.querySelectorAll('.gg-dock__item, .gg-panel-x')
);
return ctrls.filter(function(btn){
  return btn.offsetParent !== null && getComputedStyle(btn).display !== 'none';
});
}

function updateDockWidth(){
if(!dockEl) return;
var count = Math.max(1, visibleButtons().length);
dockEl.style.setProperty('--gg-dock-count', count);
}

function scheduleWidthUpdate(){
if(sizeRaf) cancelAnimationFrame(sizeRaf);
sizeRaf = requestAnimationFrame(updateDockWidth);
}

function setDockHidden(hidden){
if (!dockEl) return;
var next = !!hidden && !isSearchMode;
if (next === dockHidden) return;
dockHidden = next;
GG.core.state.toggle(dockEl, 'autohide-hidden', next);
}

function revealDock(){
setDockHidden(false);
}

function runAutoHide(){
autoHideRaf = 0;
if (!dockEl) return;
if (dockEl.contains(document.activeElement)) {
  setDockHidden(false);
  return;
}
var y = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
var delta = y - lastScrollY;
var absDelta = Math.abs(delta);
lastScrollY = y;
if (isSearchMode || y < 72 || absDelta < 6) {
  setDockHidden(false);
  return;
}
if (delta > 0) setDockHidden(true);
else setDockHidden(false);
}

function handleScrollAutoHide(){
if (autoHideRaf) return;
autoHideRaf = requestAnimationFrame(runAutoHide);
}

function handleGlobalPointer(){ revealDock(); }

function updateActive() {
var state = effectiveDockState();

buttons.forEach(function (btn) {
  var action = btn.getAttribute('data-gg-action');
  var match =
    (state === 'landing'  && action === 'home-landing') ||
    (state === 'blog'     && action === 'home-blog');

  GG.core.state.toggle(btn, 'active', !!match);
  btn.setAttribute('aria-pressed', match ? 'true' : 'false');

  if (match) btn.setAttribute('aria-current', 'page');
  else       btn.removeAttribute('aria-current');
});
scheduleWidthUpdate();
}

function handleClick(evt) {
var btn = evt.currentTarget;
var action = btn.getAttribute('data-gg-action');
var anchor = btn.getAttribute('data-gg-anchor');
if (window.GG_DEBUG) console.log('[dock]', action, anchor || '');
if (action === 'home-landing') {
  if (isHomeCapable()  && GG.modules.homeState) {
    GG.modules.homeState.setState('landing');
    if (GG.util && GG.util.homeRouter && GG.util.homeRouter.pushState) {
      GG.util.homeRouter.pushState('landing', '/');
    } else {
      history.pushState({ ggHome:'landing' }, '', '/');
    }
    updateActive();
    scrollToAnchor(anchor || '#gg-landing-hero');
  } else {
    goHome(anchor || '#gg-landing-hero');
  }
  return;
}
if (action === 'home-blog') {
  evt.preventDefault();
  var blogHref = (GG.core && GG.core.blogHomePath) ? GG.core.blogHomePath('/') : '/blog';
  if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
    GG.core.router.go(blogHref);
  } else {
    window.location.href = blogHref;
  }
  return;
}
if (action === 'search') {
  evt.preventDefault();
  if (!isSearchMode){
    enterSearch();
  } else if (searchForm){
    searchForm.submit();
  }
  return;
}
if (action === 'search-exit'){
  exitSearch();
  return;
}
if (action === 'contact') {
  if (isHomeCapable()  && GG.modules.homeState) {
    GG.modules.homeState.setState('landing');
    if (GG.util && GG.util.homeRouter && GG.util.homeRouter.pushState) {
      GG.util.homeRouter.pushState('landing', '/');
    }
    updateActive();
    scrollToAnchor(anchor || '#gg-landing-hero-5');
  } else {
    goHome(anchor || '#gg-landing-hero-5');
  }
  return;
}
if (anchor) {
  scrollToAnchor(anchor);
}
}

function init(el, main) {
dockEl = el || document.querySelector('nav.gg-dock[data-gg-module="dock"]');
if (!dockEl) return;

mainEl = main || document.querySelector('main.gg-main[data-gg-surface]');

homeUrl   = dockEl.getAttribute('data-home-url')   || '/';
searchUrl = dockEl.getAttribute('data-search-url') || null;

buttons = Array.prototype.slice.call(
  dockEl.querySelectorAll('.gg-dock__item')
);

searchForm  = dockEl.querySelector('.gg-dock__search form');
searchInput = dockEl.querySelector('.gg-dock__search input');

buttons.forEach(function (btn) {
  btn.addEventListener('click', handleClick);
});
if (dockEl.querySelector('[data-gg-action="search-exit"]')){
  dockEl.querySelector('[data-gg-action="search-exit"]').addEventListener('click', handleClick);
}
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') exitSearch();
});

updateActive();
updateDockWidth();
lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
revealDock();
if (dockEl && !dockEl.__ggDockAutoHideBound){
  dockEl.__ggDockAutoHideBound = true;
  dockEl.addEventListener('pointerenter', revealDock, true);
  dockEl.addEventListener('pointerdown', revealDock, true);
  dockEl.addEventListener('focusin', revealDock, true);
}
if (!autoHideBound){
  autoHideBound = true;
  window.addEventListener('scroll', handleScrollAutoHide, { passive: true });
  document.addEventListener('pointerdown', handleGlobalPointer, true);
}
window.addEventListener('resize', scheduleWidthUpdate);
window.addEventListener('popstate', updateActive, true);
if (mainEl && window.MutationObserver){
  homeObs = new MutationObserver(function(){
    updateActive();
  });
  homeObs.observe(mainEl, { attributes:true, attributeFilter:['data-gg-home-state','data-gg-surface'] });
}
}

return {
init: init,
updateActive: updateActive
};
})();

(function(){
window.GG = window.GG || {};
GG.modules = GG.modules || {};

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function text(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }

function showToast(msg){
var toast = document.getElementById('gg-toast') || document.getElementById('pc-toast') || document.querySelector('.gg-toast');
if(!toast){ return; }
var inner = toast.querySelector('.gg-toast__message');
if(inner){ inner.textContent = msg; }
toast.hidden = false;
GG.core.state.remove(toast, 'hidden');
GG.core.state.add(toast, 'visible');
clearTimeout(showToast._t);
showToast._t = setTimeout(function(){
  GG.core.state.remove(toast, 'visible');
  GG.core.state.add(toast, 'hidden');
  toast.hidden = true;
}, 2200);
}

function normalizeUrl(u){
return String(u || '').split('#')[0].replace(/\/+$/,'');
}

GG.modules.PostDetail = (function(){
function collectTags(article){
  var chips = qsa('.gg-post-tags__chip', article);
  var tags = chips.map(function(a){
    var t = text(a);
    return { text: t, href: a.getAttribute('href') || '#' };
  }).filter(function(x){ return x.text; });
  if(tags.length) return tags;

  var raw = text(qs('.gg-post-tags', article));
  if(!raw) return [];
  var matches = raw.match(/#[^#\s]+/g) || [];
  var uniq = Array.from(new Set(matches));
  return uniq.map(function(t){
    return { text: t, href: '#' };
  });
}

function renderFooterTags(article){
  var slot = qs('[data-gg-slot="footer-tags"]', article);
  if(!slot) return;
  var tags = collectTags(article);
  if(!tags.length){
    slot.hidden = true;
    slot.innerHTML = '';
    return;
  }
  slot.hidden = false;
  slot.innerHTML = '';
  tags.slice(0, 16).forEach(function(tag){
    var chip = document.createElement('a');
    chip.className = 'gg-post__tag';
    chip.textContent = tag.text;
    chip.href = tag.href || '#';
    slot.appendChild(chip);
  });
}

function savePost(article){
  var id = article.getAttribute('data-id') || normalizeUrl(location.href);
  var title = text(qs('.gg-post__title', article)) || document.title;
  var url = normalizeUrl(location.href);
  var payload = { id:id, title:title, url:url, savedAt: Date.now() };
  try{
    var key = 'ggSavedPosts';
    var existing = JSON.parse(localStorage.getItem(key) || '[]');
    if(!Array.isArray(existing)) existing = [];
    var already = existing.some(function(it){ return it.id === id || normalizeUrl(it.url) === url; });
    if(!already) existing.unshift(payload);
    localStorage.setItem(key, JSON.stringify(existing.slice(0,50)));
    showToast('Post saved to Library');
  }catch(_){}
}

function openShareSheet(meta){
  if (GG.modules && GG.modules.shareSheet && typeof GG.modules.shareSheet.open === 'function') {
    GG.modules.shareSheet.open(meta);
    return true;
  }
  if (GG.util && typeof GG.util.openShareSheet === 'function') {
    GG.util.openShareSheet(meta);
    return true;
  }
  return false;
}

function requestPosterShare(meta, fallback){
  if (openShareSheet(meta)) return;
  if (GG.boot && typeof GG.boot.loadModule === 'function') {
    GG.boot.loadModule('ui.bucket.poster.js').then(function(){
      if (GG.ui && typeof GG.ui._initPosterModules === 'function') GG.ui._initPosterModules();
      if (!openShareSheet(meta)) fallback();
    }).catch(function(){
      fallback();
    });
    return;
  }
  fallback();
}

function sharePost(article){
  var title = text(qs('.gg-post__title', article)) || document.title;
  var url = location.href;
  var meta = (GG.util && typeof GG.util.getMetaFromElement === 'function')
    ? GG.util.getMetaFromElement(article)
    : null;
  if (GG.services && GG.services.share && GG.services.share.open) {
    GG.services.share.open(meta || { title: title, url: url });
    return;
  }
  var fallback = function(){
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function(){
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function(){ showToast('Link copied'); }).catch(function(){
            try{ window.prompt('Copy link:', url); }catch(_){}
          });
          return;
        }
        try{ window.prompt('Copy link:', url); }catch(_){}
      });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){ showToast('Link copied'); }).catch(function(){
        try{ window.prompt('Copy link:', url); }catch(_){}
      });
      return;
    }
    try{ window.prompt('Copy link:', url); }catch(_){}
  };
  if (meta) {
    requestPosterShare(meta, fallback);
    return;
  }
  fallback();
}

function posterPost(article){
  if (GG.modules && GG.modules.poster && typeof GG.modules.poster.shareFromArticle === 'function') {
    GG.modules.poster.shareFromArticle(article);
    return;
  }
  if (GG.boot && typeof GG.boot.loadModule === 'function') {
    GG.boot.loadModule('ui.bucket.poster.js').then(function(){
      if (GG.ui && typeof GG.ui._initPosterModules === 'function') GG.ui._initPosterModules();
      if (GG.modules && GG.modules.poster && typeof GG.modules.poster.shareFromArticle === 'function') {
        GG.modules.poster.shareFromArticle(article);
        return;
      }
      sharePost(article);
    }).catch(function(){
      sharePost(article);
    });
    return;
  }
  sharePost(article);
}

/* @GG_PATCH: X-015+X-016 (dev) */
function init(){
var article = qs('.gg-post[data-gg-module="post-detail"]');
if(!article) return;

var main = qs('main.gg-main[data-gg-surface]');
var bar  = qs('[data-gg-module="post-toolbar"]', article);
if(!main || !bar) return;
if(bar.__ggBound) return;
bar.__ggBound = true;

var leftSidebar    = qs('.gg-blog-sidebar--left', main);
var rightSidebar   = qs('.gg-blog-sidebar--right', main);
var commentsPanel  = rightSidebar ? qs('[data-gg-panel="comments"]', rightSidebar) : null;
var infoPanelRight = rightSidebar ? qs('[data-gg-panel="info"]', rightSidebar) : null;
var comments     = qs('.gg-post__comments', article);
var commentsSlot = rightSidebar ? qs('[data-gg-panel="comments"] [data-gg-slot="comments"]', rightSidebar) : null;
if(comments && commentsSlot && !comments.__ggMoved){
commentsSlot.appendChild(comments);
comments.__ggMoved = true;
}
function btnByAct(act){
return bar.querySelector('[data-gg-postbar="'+act+'"]');
}

function ensurePosterButton(){
if (btnByAct('poster')) return;
var shareBtn = btnByAct('share');
var btn = document.createElement('button');
btn.type = 'button';
btn.className = 'gg-post__tool gg-post__action--poster';
btn.setAttribute('data-gg-postbar', 'poster');
btn.setAttribute('aria-label', 'Share as Poster');
btn.innerHTML = '<span aria-hidden="true" class="gg-icon material-symbols-rounded">image</span>';
if (shareBtn && shareBtn.parentNode) {
  shareBtn.parentNode.insertBefore(btn, shareBtn.nextSibling);
} else {
  bar.appendChild(btn);
}
}

function setBtnActive(act, on){
var b = btnByAct(act);
if(!b) return;
GG.core.state.toggle(b, 'active', !!on);
if(b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', on ? 'true' : 'false');
if(b.hasAttribute('aria-pressed'))  b.setAttribute('aria-pressed',  on ? 'true' : 'false');
}

function setFocusIcon(on){
var b = btnByAct('focus');
if(!b) return;
var icon = b.querySelector('.gg-icon.material-symbols-rounded');
if(icon) icon.textContent = on ? 'center_focus_strong' : 'center_focus_weak';
GG.core.state.toggle(b, 'active', !!on);           // filled via CSS [data-gg-state~="active"]
b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function leftState(){ return main.getAttribute('data-gg-left-panel') || 'closed'; }
function rightState(){
return main.getAttribute('data-gg-right-panel') || main.getAttribute('data-gg-info-panel') || 'closed';
}
function rightMode(){ return main.getAttribute('data-gg-right-mode') || ''; }

function setLeftState(state){
main.setAttribute('data-gg-left-panel', state);
if(GG.modules.Panels && GG.modules.Panels.setLeft) GG.modules.Panels.setLeft(state);
}
function setRightState(state){
main.setAttribute('data-gg-right-panel', state);
main.setAttribute('data-gg-info-panel', state);
if(GG.modules.Panels && GG.modules.Panels.setRight) GG.modules.Panels.setRight(state);
}
function setRightMode(mode){
if(mode) main.setAttribute('data-gg-right-mode', mode);
else main.removeAttribute('data-gg-right-mode');
}

function applyFromAttrs(){
var leftOpen = leftState() === 'open';
var rightOpen = rightState() === 'open';
var mode = rightMode();
var focusOn = GG.core.state.has(document.body, 'focus-mode');

setBtnActive('info', leftOpen);
setBtnActive('comments', rightOpen && mode === 'comments');
setFocusIcon(focusOn);

if (leftSidebar) {
  leftSidebar.setAttribute('aria-hidden', leftOpen ? 'false' : 'true');
}
if (rightSidebar) {
  rightSidebar.setAttribute('aria-hidden', rightOpen ? 'false' : 'true');
}

var showComments = rightOpen && mode === 'comments';
var showInfo = rightOpen && mode && mode !== 'comments';

if(commentsPanel){
  commentsPanel.hidden = !showComments;
  commentsPanel.setAttribute('inert','');
  commentsPanel.setAttribute('tabindex','-1');
  if(showComments){
    commentsPanel.removeAttribute('inert');
    try { commentsPanel.focus({ preventScroll:true }); } catch(_) {}
  }
}
if(infoPanelRight){
  infoPanelRight.hidden = !showInfo;
  infoPanelRight.setAttribute('inert','');
  infoPanelRight.setAttribute('tabindex','-1');
  if(showInfo){
    infoPanelRight.removeAttribute('inert');
    try { infoPanelRight.focus({ preventScroll:true }); } catch(_) {}
  }
}
}

function clearCommentsHashIfAny(){
var h = location.hash || '';
if(h === '#comments' || /^#c\d+/.test(h)){
  history.replaceState(null, document.title, location.pathname + location.search);
}
}
function setLeft(open, triggerBtn){
setLeftState(open ? 'open' : 'closed');
applyFromAttrs();
if (!open && triggerBtn && typeof triggerBtn.focus === 'function') {
  try { triggerBtn.focus({ preventScroll: true }); } catch(_) {}
}
}
function showRightPanel(mode){
var useMode = mode || 'comments';
setRightMode(useMode);
setRightState('open');
applyFromAttrs();
if (useMode === 'comments' && GG.services && GG.services.comments && GG.services.comments.mountWithRetry) {
  GG.services.comments.mountWithRetry();
}
}

function hideRightPanel(focusBackBtn){
setRightMode('');
setRightState('closed');
applyFromAttrs();
clearCommentsHashIfAny();

if(focusBackBtn) focusBackBtn.focus({ preventScroll:true });
}

function isCommentsOpen(){
return rightState() === 'open' && rightMode() === 'comments';
}

function toggleComments(triggerBtn){
if(isCommentsOpen()) hideRightPanel(triggerBtn);
else showRightPanel('comments');
}
var prevLeft, prevRight, prevMode;
function rememberPanels(){
prevLeft = leftState();
prevRight = rightState();
prevMode = rightMode();
}

function restorePanels(){
var pl = prevLeft || 'closed';
var pr = prevRight || 'closed';
var pm = prevMode || 'comments';

setLeftState(pl);
if(pr === 'open') showRightPanel(pm);
else hideRightPanel();

prevLeft = prevRight = prevMode = null;
}

function setFocus(on){
GG.core.state.toggle(document.body, 'focus-mode', !!on);
setFocusIcon(!!on);

if(on){
  rememberPanels();
  setLeft(false);
  hideRightPanel();
} else {
  restorePanels();
}
}
(function(){
hideRightPanel();
setLeft(leftState() === 'open');
ensurePosterButton();

var h = location.hash || '';
if(h === '#comments' || /^#c\d+/.test(h)){
  showRightPanel('comments');
}
})();
bar.addEventListener('click', function(e){
var btn = e.target.closest('[data-gg-postbar]');
if(!btn) return;

e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();

var act = btn.getAttribute('data-gg-postbar');

if(act === 'back'){
  if(window.GGBack) window.GGBack.go();
  return;
}

if(act === 'info'){
  setLeft(leftState() !== 'open', btn);
  return;
}

if(act === 'focus'){
  setFocus(!GG.core.state.has(document.body, 'focus-mode'));
  return;
}

if(act === 'save'){ savePost(article); return; }

if(act === 'comments'){
  toggleComments(btn); // <- ini sekarang bener-bener toggle (open/close)
  return;
}

if(act === 'share'){ sharePost(article); return; }
if(act === 'poster'){ posterPost(article); return; }
}, true);

if(!bar.__ggEscBound){
bar.__ggEscBound = true;
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  if(!GG.core.state.has(document.body, 'focus-mode')) return;
  if(rightState() === 'open' || leftState() === 'open') return;
  setFocus(false);
});
}

if(!bar.__ggAttrObs && window.MutationObserver){
bar.__ggAttrObs = new MutationObserver(function(){
  applyFromAttrs();
});
bar.__ggAttrObs.observe(main, {
  attributes: true,
  attributeFilter: ['data-gg-left-panel','data-gg-right-panel','data-gg-info-panel','data-gg-right-mode']
});
}
applyFromAttrs();

renderFooterTags(article);
}

return { init: init };



})();

GG.modules.BackToTop = (function(){
function init(){
  var btn = document.querySelector('.gg-backtotop');
  if(!btn) return;
  var main = document.querySelector('main.gg-main[data-gg-surface]');
  var icon = btn.querySelector('.gg-icon');
  var lastY = window.scrollY || 0;
  var lastDir = 'down';
  var rafId = null;
  var minDelta = 6;

  function allowedSurface(){
    var surface = main ? main.getAttribute('data-gg-surface') : '';
    return surface === 'post' || surface === 'page';
  }

  function setDirection(dir){
    lastDir = dir;
    if(icon) icon.textContent = dir === 'down' ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up';
    btn.setAttribute('aria-label', dir === 'down' ? 'Go to bottom' : 'Back to top');
  }

  function setVisibility(){
    if(!allowedSurface()){
      btn.hidden = true;
      GG.core.state.remove(btn, 'visible');
      return;
    }
    var scrollable = (document.documentElement.scrollHeight - window.innerHeight) > 200;
    btn.hidden = !scrollable;
    GG.core.state.toggle(btn, 'visible', scrollable);
  }

  function onScroll(){
    var y = window.scrollY || window.pageYOffset || 0;
    var delta = y - lastY;
    if(Math.abs(delta) >= minDelta){
      setDirection(delta > 0 ? 'down' : 'up');
      lastY = y;
    }
    if(rafId) return;
    rafId = window.requestAnimationFrame(function(){
      rafId = null;
      setVisibility();
    });
  }

  function onClick(){
    var doc = document.documentElement;
    var maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
    if(lastDir === 'down'){
      window.scrollTo({ top: maxY, behavior: 'smooth' });
    }else{
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function setInitialDirection(){
    var doc = document.documentElement;
    var maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
    var nearBottom = (window.scrollY || 0) >= (maxY - 60);
    setDirection(nearBottom ? 'up' : 'down');
  }

  setInitialDirection();
  setVisibility();
  btn.addEventListener('click', function(e){
    e.preventDefault();
    onClick();
  });
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', function(){
    setInitialDirection();
    setVisibility();
  });
}
return { init: init };
})();

GG.modules.FooterAccordion = (function(){
var bound = false;
var mq;

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function closest(el, sel){
  if (!el) return null;
  if (el.closest) return el.closest(sel);
  while (el && el.nodeType === 1){
    if (el.matches && el.matches(sel)) return el;
    el = el.parentElement;
  }
  return null;
}

function enhanceSection(sec){
  if (!sec || sec.__ggAcc) return;
  var h = qs('.gg-footer__heading', sec);
  var ul = qs('.gg-footer__list', sec);
  if (!h || !ul) return;
  var txt = (h.textContent || '').trim();
  h.textContent = '';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'gg-footer__acc-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = txt;

  h.appendChild(btn);
  sec.__ggAcc = true;
}

function setSectionOpen(sec, open){
  var btn = qs('.gg-footer__acc-btn', sec);
  var ul = qs('.gg-footer__list', sec);
  if (!btn || !ul) return;

  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  ul.hidden = !open;
  if (!open) ul.setAttribute('inert','');
  else ul.removeAttribute('inert');
}

function applyMobile(enabled){
  var grids = qsa('.gg-footer__grid', document);
  grids.forEach(function(grid){
    var secs = qsa(':scope > div', grid);
    secs.forEach(function(sec){
      enhanceSection(sec);
    });
    if (!enabled){
      secs.forEach(function(sec){ setSectionOpen(sec, true); });
      return;
    }
    secs.forEach(function(sec, i){ setSectionOpen(sec, i === 0); });
  });
}

function onClick(e){
  var btn = closest(e.target, '.gg-footer__acc-btn');
  if (!btn) return;
  if (!(mq && mq.matches)) return;

  var sec = closest(btn, '.gg-footer__grid > div');
  if (!sec) return;

  var isOpen = btn.getAttribute('aria-expanded') === 'true';
  setSectionOpen(sec, !isOpen);
  e.preventDefault();
}

function init(){
  if (bound) return;
  bound = true;

  mq = window.matchMedia ? window.matchMedia('(max-width: 960px)') : null;
  applyMobile(!!(mq && mq.matches));

  document.addEventListener('click', onClick);

  if (mq){
    var handler = function(){ applyMobile(mq.matches); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
}

return { init: init };
})();

GG.modules.LoadMore = (function(){
function init(){
  var wrap = document.querySelector('[data-gg-module="loadmore"]');
  if(!wrap) return;
  var btn = wrap.querySelector('#loadmore');
  if(!btn) return;
  if (btn.__ggLoadMoreBound) return;
  btn.__ggLoadMoreBound = true;
  var list = document.querySelector('#postcards');
  if(!list) return;

  var fallback = wrap.querySelector('#more-fallback');
  if(fallback) fallback.hidden = true;

  var labelEl = btn.querySelector('.gg-loadmore__label');
  var baseLabel = labelEl ? labelEl.textContent.trim() : 'Load More Articles';
  var isLoading = false;

  function setLabel(txt){
    if(labelEl) labelEl.textContent = txt;
  }

  function setLoading(state){
    isLoading = state;
    GG.core.state.toggle(btn, 'loading', state);
    if(!GG.core.state.has(btn, 'disabled')){
      btn.disabled = state;
    }
    btn.setAttribute('aria-busy', state ? 'true' : 'false');
  }

  function setDisabled(message){
    GG.core.state.add(btn, 'disabled');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    if(message) setLabel(message);
  }

  function getNextUrl(){
    return btn.getAttribute('data-next') || '';
  }

  function updateNext(doc){
    var next = '';
    var nextBtn = doc.querySelector('#loadmore');
    if(nextBtn) next = nextBtn.getAttribute('data-next') || '';
    if(!next){
      var nextLink = doc.querySelector('#more-fallback');
      next = nextLink ? (nextLink.getAttribute('href') || '') : '';
    }
    if(next){
      btn.setAttribute('data-next', next);
      return true;
    }
    btn.removeAttribute('data-next');
    return false;
  }

  function extractPosts(doc){
    var cards = doc.querySelectorAll('#postcards .gg-post-card');
    return Array.prototype.slice.call(cards || []);
  }

  function appendPosts(nodes){
    nodes.forEach(function(node){
      list.appendChild(node);
    });
  }

  function fetchNext(){
    var next = getNextUrl();
    if(!next || isLoading) return;
    setLoading(true);
    setLabel('Loading...');

    fetch(next, { credentials: 'same-origin' })
      .then(function(res){
        if(!res.ok) throw new Error('Request failed');
        return res.text();
      })
      .then(function(html){
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var nodes = extractPosts(doc);
        if(nodes.length) appendPosts(nodes);
        if(updateNext(doc)){
          setLabel(baseLabel);
        }else{
          setDisabled('No more posts');
        }
      })
      .catch(function(){
        setLabel('Retry loading');
      })
      .finally(function(){
        setLoading(false);
      });
  }

  btn.addEventListener('click', function(e){
    e.preventDefault();
    fetchNext();
  });
}
return { init: init };
})();

GG.modules.PopularCarousel = (function(){
function sanitize(text){
  return (text || '').replace(/\s+/g,' ').trim();
}

function buildCard(data){
  var item = document.createElement('div');
  item.className = 'gg-pp__item';

  var a = document.createElement('a');
  a.className = 'gg-pp__card';
  a.href = data.href || '#';
  a.setAttribute('aria-label', data.title || 'Popular post');

  var thumb = document.createElement('div');
  thumb.className = 'gg-pp__thumb';
  if(data.img){
    var img = document.createElement('img');
    img.src = data.img;
    img.alt = data.title || '';
    thumb.appendChild(img);
  }
  a.appendChild(thumb);

  var body = document.createElement('div');
  body.className = 'gg-pp__body';

  var tag = document.createElement('p');
  tag.className = 'gg-pp__tag';
  tag.textContent = 'Popular';
  body.appendChild(tag);

  var title = document.createElement('p');
  title.className = 'gg-pp__title';
  title.textContent = data.title || '';
  body.appendChild(title);

  a.appendChild(body);
  item.appendChild(a);
  return item;
}

function init(){
  var feed = document.querySelector('#gg-popularpost1 .widget-content [role="feed"]');
  if(!feed) return;

  var rawItems = Array.prototype.slice.call(feed.children || []).filter(function(node){
    return node.nodeType === 1;
  });
  if(!rawItems.length) return;

  var items = rawItems.slice(0, 10).map(function(node){
    var link = node.querySelector('a');
    var img = node.querySelector('img');
    return {
      href: link ? link.href : '#',
      title: link ? sanitize(link.textContent) : '',
      img: img ? img.src : ''
    };
  });

  feed.innerHTML = '';
  feed.classList.add('gg-pp__track');
  items.forEach(function(data){
    feed.appendChild(buildCard(data));
});

var cards = Array.prototype.slice.call(feed.querySelectorAll('.gg-pp__item'));
if(!cards.length) return;

var current = 0;
var timer = null;
var gap = 0;
var cardWidth = 0;

function recalc(){
  var style = window.getComputedStyle(feed);
  gap = parseFloat(style.columnGap || style.gap || '0') || 0;
  var first = cards[0];
  cardWidth = first ? first.getBoundingClientRect().width : 0;
  jump(current, false);
}

function jump(index, smooth){
  var offset = index * (cardWidth + gap);
  feed.scrollTo({ left: offset, behavior: smooth ? 'smooth' : 'auto' });
}

function start(){
  if(cards.length <= 3) return;
  if(timer) clearInterval(timer);
  timer = setInterval(function(){
    current = (current + 1) % cards.length;
    jump(current, current !== 0);
  }, 3200);
}

recalc();
start();
window.addEventListener('resize', function(){
  recalc();
});
}

return { init: init };
})();
})();

window.GG = window.GG || {};
GG.modules = GG.modules || {};
GG.modules.InfoPanel = (function () {
var main, panel;
var lastTrigger = null;
var closeObserver = null;
var backdrop = null;
var selectedCardKey = null;
var hoverCardKey = '';
var hoverIntentCardKey = '';
var hoverIntentTimer = 0;
var HOVER_INTENT_MS = 160;
var TOC_CAP = 24;
var TOC_TTL_MS = 6e5;
var TOC_LRU_MAX = 24;
var TOC_HINT_LOCK = 'Hover preview. Click or tap to lock.';
var tocCache = Object.create(null);
var tocPending = Object.create(null);
var tocAborters = Object.create(null);
var postMetaCache = new Map();

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function syncSlotInfoSelected(value){
try {
var st = (typeof slotInfoState !== 'undefined' && slotInfoState) ? slotInfoState : (window && window.slotInfoState);
if (!st || typeof st.set !== 'function') return;
st.set({ selected: value || null });
} catch (_) {}
}
function closest(el, sel){
if (!el) return null;
if (el.closest) return el.closest(sel);
while (el && el.nodeType === 1){
if (el.matches && el.matches(sel)) return el;
el = el.parentElement;
}
return null;
}

function onBackdropClick(e){
var surface = main ? main.getAttribute('data-gg-surface') : '';
if (surface !== 'home' && surface !== 'feed') return;
if (!main || main.getAttribute('data-gg-info-panel') !== 'open') return;
e.preventDefault();
handleClose();
}

function ensureBackdrop(){
if (backdrop) return backdrop;
backdrop = document.querySelector('.gg-infopanel-backdrop');
if (!backdrop) {
backdrop = document.createElement('div');
backdrop.className = 'gg-infopanel-backdrop';
backdrop.setAttribute('aria-hidden', 'true');
backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);';
document.body.appendChild(backdrop);
}
if (!backdrop.__ggInfoBound) {
backdrop.__ggInfoBound = true;
backdrop.addEventListener('click', onBackdropClick);
}
return backdrop;
}

function setBackdropVisible(show){
var bd = ensureBackdrop();
if (!bd) return;
var surface = main ? (main.getAttribute('data-gg-surface') || '') : '';
GG.core.state.toggle(bd, 'visible', !!show && surface === 'post');
}

function ensurePanelSkeleton(){
if (!panel) return;
if (qs('.gg-editorial-preview', panel)) return;
function row(id, icon, label, value, hidden){ return '<div class="gg-epanel__row" data-row="'+id+'"'+(hidden?' hidden':'')+'><span class="gg-icon gg-epanel__icon" aria-hidden="true">'+icon+'</span><div class="gg-epanel__cell"><dt class="gg-epanel__label">'+label+'</dt><dd class="gg-epanel__value">'+value+'</dd></div></div>'; }
var rows=[row('title','article','Title','<a data-s="title" href="#"></a>'),row('author','person','Written by','<a data-s="author-link" href="#"><span data-s="author"></span></a>'),row('contributors','groups','Contributor by','<div class="gg-chip-row gg-epanel__chips" data-gg-slot="contributors"></div>',true),row('labels','label','Label','<div class="gg-chip-row gg-epanel__chips" data-gg-slot="labels"></div>',true),row('tags','sell','Tags','<div class="gg-chip-row gg-epanel__chips" data-gg-slot="tags"></div>',true),row('date','calendar_today','Date','<span data-s="date"></span>'),row('updated','event_repeat','Updated','<span data-s="updated"></span>',true),row('comments','comment','Comments','<span data-s="comments"></span>'),row('readtime','schedule','Read time','<span data-s="readtime"></span>'),row('snippet','text_snippet','Snippet','<span data-s="snippet"></span>',true),row('toc','toc','Table of Contents','<div class="gg-epanel__value--toc"><ol class="gg-info-panel__toclist" data-gg-slot="toc"></ol><p class="gg-info-panel__tochint" data-gg-slot="toc-hint"></p></div>')].join('');
panel.innerHTML = '<div class="gg-info-panel__card gg-editorial-preview gg-epanel"><div class="gg-epanel__head"><span class="gg-epanel__eyebrow">Editorial Preview</span></div><div class="gg-epanel__media"><img class="gg-info-panel__thumb-img" alt=""/></div><div class="gg-epanel__body gg-info-panel__details"><dl class="gg-epanel__rows">'+rows+'</dl></div><div class="gg-epanel__foot"><a class="gg-info-panel__hero-cta gg-epanel__cta" href="#"><span class="gg-icon material-symbols-rounded" aria-hidden="true">visibility</span><span>Read this post</span></a></div></div>';
renderTocSkeleton(6, TOC_HINT_LOCK);
}

function extractThumbSrc(card){
var img = qs('.gg-post-card__thumb-img', card);
if (img) return (img.currentSrc || img.src || img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || '').trim();
var thumb = qs('.gg-post-card__thumb', card);
if (thumb) {
var bg = (thumb.style.backgroundImage || getComputedStyle(thumb).backgroundImage || ''), m = bg.match(/url\((['"]?)(.*?)\1\)/);
if (m && m[2]) return m[2];
}
return '';
}

function setText(sel, val){ var el = qs(sel, panel); if (el) el.textContent = val || ''; }
function setHref(sel, val){ var el = qs(sel, panel); if (el) el.setAttribute('href', val || '#'); }
function setS(key, val){ setText('[data-s="'+key+'"]', val); }
function setImg(src, alt){
var img = qs('.gg-info-panel__thumb-img', panel);
if (!img) return;
var wrap = closest(img, '.gg-epanel__media') || closest(img, '.gg-editorial-preview__media') || img.parentElement;
if (!wrap) return;
if (!src) {
img.removeAttribute('src');
img.style.display = 'none';
GG.core.state.add(wrap, 'noimg');
wrap.style.display = '';
return;
}
GG.core.state.remove(wrap, 'noimg');
wrap.style.display = '';
img.style.display = '';
img.src = src;
img.alt = alt || '';
}

function setRow(name, visible){ var row = qs('[data-row="'+name+'"]', panel); if (row) row.hidden = !visible; }
function cleanText(raw){ return String(raw || '').replace(/\s+/g, ' ').trim(); }
function cardAttr(card, name){ return card ? cleanText(card.getAttribute(name) || '') : ''; }
function splitItems(raw, rx){ var src=cleanText(raw),parts=[],out=[],i=0,text=''; if(!src) return out; parts=src.split(rx||/\s*(?:\r?\n|[|;,])\s*/); for(i=0;i<parts.length;i++){ text=cleanText(parts[i]); if(text) out.push({ text:text, href:'' }); } return out; }
function parseIsoDate(raw){ var v=cleanText(raw); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''; }
function calcReadTime(root){ if(!root) return ''; var clone=root.cloneNode(true),drop=clone.querySelectorAll('nav,footer'),i=0,text=''; for(;i<drop.length;i++) drop[i].remove(); text=cleanText(clone.textContent||''); if(!text) return ''; return Math.max(1,Math.ceil(text.split(/\s+/).length/200))+' min read'; }
function authorDir(){ return GG.services&&GG.services.authorsDir ? GG.services.authorsDir : null; }
function authorSlug(raw){ var svc=authorDir(),v=''; if(svc&&svc.slugify) return svc.slugify(raw); v=cleanText(raw).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); return v; }
function authorTitle(slug){ var text=String(slug||'').replace(/-/g,' ').trim(); return text?text.replace(/\b[a-z]/g,function(m){ return m.toUpperCase(); }):''; }
function splitSlugs(raw, rx){ var items=splitItems(raw,rx),out=[],seen={},i=0,s=''; for(;i<items.length;i++){ s=authorSlug(items[i].text); if(!s||seen[s]) continue; seen[s]=1; out.push(s); } return out; }
function authorFallback(raw){ var svc=authorDir(),s=authorSlug(raw),name=''; if(svc&&svc.fallback) return svc.fallback(raw); name=authorTitle(s)||cleanText(raw)||'Author'; return { slug:s, name:name, href:s?('/p/'+s+'.html'):'#' }; }
function authorResolveMany(list){ var svc=authorDir(),items=list||[]; if(svc&&svc.resolveMany) return svc.resolveMany(items); if(GG.boot&&typeof GG.boot.loadModule==='function') return GG.boot.loadModule('ui.bucket.authors.js').then(function(){ var x=authorDir(); return x&&x.resolveMany ? x.resolveMany(items) : items.map(authorFallback); }).catch(function(){ return items.map(authorFallback); }); return Promise.resolve(items.map(authorFallback)); }
function tagDir(){ return GG.services&&GG.services.tagsDir ? GG.services.tagsDir : null; }
function tagSlug(raw){ var svc=tagDir(),v=''; if(svc&&svc.slugify) return svc.slugify(raw); v=cleanText(raw).toLowerCase().replace(/^#/,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]+/g,'').replace(/^-+|-+$/g,''); return v; }
function tagHref(key){ return key?('/p/tags.html?tag='+encodeURIComponent(key)):'#'; }
function parseTagItems(raw){ var items=splitItems(raw,/\s*,\s*/),out=[],seen={},i=0,text='',key=''; for(;i<items.length;i++){ text=cleanText(items[i].text); key=tagSlug(text); if(!key||seen[key]) continue; seen[key]=1; out.push({ key:key, text:text||key, href:tagHref(key) }); } return out; }
function tagFallback(raw){ var x=raw&&typeof raw==='object'?raw:{},key=tagSlug(x.key||x.text||raw),text=cleanText(x.text||x.name||raw)||key; return { key:key, text:text, href:tagHref(key) }; }
function tagResolveMany(list){ var svc=tagDir(),items=list||[]; if(svc&&svc.resolveMany) return svc.resolveMany(items); if(GG.boot&&typeof GG.boot.loadModule==='function') return GG.boot.loadModule('ui.bucket.authors.js').then(function(){ var x=tagDir(); return x&&x.resolveMany ? x.resolveMany(items) : items.map(tagFallback); }).catch(function(){ return items.map(tagFallback); }); return Promise.resolve(items.map(tagFallback)); }
function setTocHint(message){
var hint = qs('[data-gg-slot="toc-hint"]', panel), text = String(message || '').trim();
if (!hint) return;
hint.textContent = text;
hint.hidden = !text;
}

function renderTocSkeleton(count, hint){ var list=qs('[data-gg-slot="toc"]', panel),n=parseInt(count,10),i=0,li,row,line; if(!list) return; if(!isFinite(n)||n<1) n=6; if(n>8) n=8; list.innerHTML=''; for(;i<n;i++){ li=document.createElement('li'); li.className='gg-info-panel__tocitem gg-info-panel__tocitem--skeleton'; row=document.createElement('span'); row.className='gg-info-panel__toclink'; line=document.createElement('span'); line.className='gg-info-panel__tocline'; row.appendChild(line); li.appendChild(row); list.appendChild(li); } setTocHint(hint||''); }
function renderTocItems(items){ var list=qs('[data-gg-slot="toc"]', panel),rows=Array.isArray(items)?items:[],i=0,item,li,level,link,num,text; if(!list) return; list.innerHTML=''; if(!rows.length){ setTocHint('No headings found.'); return; } for(;i<rows.length;i++){ item=rows[i]||{}; li=document.createElement('li'); level=parseInt(item.level,10); if(!isFinite(level)||level<2) level=2; if(level>4) level=4; li.className='gg-info-panel__tocitem gg-info-panel__toclvl-'+level; link=document.createElement('a'); link.className='gg-info-panel__toclink'; link.href=item.href||'#'; num=document.createElement('span'); num.className='gg-info-panel__tocnum'; num.textContent=String(i+1).padStart(2,'0'); text=document.createElement('span'); text.className='gg-info-panel__toctext'; text.textContent=item.text||'Section'; link.appendChild(num); link.appendChild(text); li.appendChild(link); list.appendChild(li); } setTocHint(''); }

function toAbsUrl(raw){ try { return new URL(String(raw || ''), window.location.href).toString(); } catch (_) { return ''; } }
function tocCacheKey(url){ var abs = toAbsUrl(url), parsed; if (!abs) return ''; try { parsed = new URL(abs); return parsed.origin + parsed.pathname + parsed.search; } catch (_) { return abs; } }

function pruneToc(now){ var keys=Object.keys(tocCache),i=0,key='',rows=null,ts=0,drop=''; for(;i<keys.length;i++){ key=keys[i]; rows=tocCache[key]; ts=rows&&rows._t?rows._t:0; if(!rows||!Array.isArray(rows)||(TOC_TTL_MS>0&&ts&&now-ts>TOC_TTL_MS)){ delete tocCache[key]; postMetaCache.delete(key); } } keys=Object.keys(tocCache); while(keys.length>TOC_LRU_MAX){ drop=keys.shift(); delete tocCache[drop]; postMetaCache.delete(drop); } }
function readToc(key){ var rows=tocCache[key],now=Date.now(); if(!rows||!Array.isArray(rows)) return null; if(TOC_TTL_MS>0&&rows._t&&now-rows._t>TOC_TTL_MS){ delete tocCache[key]; postMetaCache.delete(key); return null; } rows._t=now; delete tocCache[key]; tocCache[key]=rows; return rows; }
function writeToc(key,rows){ var out=Array.isArray(rows)?rows.slice(0,TOC_CAP):[]; out._t=Date.now(); tocCache[key]=out; pruneToc(out._t); }
function abortToc(keepKey){ for(var key in tocAborters){ if(keepKey&&key===keepKey) continue; try{ if(tocAborters[key]) tocAborters[key].abort(); }catch(_){} delete tocAborters[key]; delete tocPending[key]; } }

function parseHeadingItems(html,sourceUrl){ if(!html||!window.DOMParser) return []; var doc=new DOMParser().parseFromString(String(html||''),'text/html'); if(!doc) return []; var root=doc.querySelector('.post-body, .post-body.entry-content'),metaNode=doc.querySelector('.gg-postmeta'),out=[],headings,max=0,tags=[],contributors=[],updated='',readTime='',author=''; if(metaNode){ tags=parseTagItems(metaNode.getAttribute('data-tags')||''); author=authorSlug(metaNode.getAttribute('data-author')||''); contributors=splitSlugs(metaNode.getAttribute('data-contributors')||'',/\s*;\s*/).filter(function(s){ return s&&s!==author; }); updated=parseIsoDate(metaNode.getAttribute('data-updated')||''); } readTime=calcReadTime(root); out._m={ t:tags, a:author, c:contributors, u:updated, r:readTime }; if(!root) return out; headings=root.querySelectorAll('h2, h3, h4'); max=Math.min(headings.length,TOC_CAP); for(var i=0;i<max;i++){ var node=headings[i],text=(node.textContent||'').replace(/\s+/g,' ').trim(); if(!text) continue; var tag=String(node.tagName||'').toLowerCase(),level=tag==='h3'?3:(tag==='h4'?4:2),headingId=(node.getAttribute('id')||'').trim(),href=sourceUrl||'#'; if(headingId) href+='#'+encodeURIComponent(headingId); out.push({ text:text, level:level, href:href }); } return out; }

function fetchPostHtml(url,signal){ var abs=toAbsUrl(url); if(!abs) return Promise.reject(new Error('u')); if(!window.fetch) return Promise.reject(new Error('n')); return window.fetch(abs,{ method:'GET', cache:'no-store', credentials:'same-origin', signal:signal }).then(function(res){ if(!res||!res.ok) throw new Error('f'); return res.text(); }); }
function clearHoverIntent(){ if(hoverIntentTimer){ clearTimeout(hoverIntentTimer); hoverIntentTimer = 0; } hoverIntentCardKey = ''; }

function resolveTocItems(href, opts){
opts = opts || {};
var key = tocCacheKey(href), abs = toAbsUrl(href), cached;
if (!key || !abs) return Promise.resolve([]);
cached = readToc(key);
if (Array.isArray(cached)) return Promise.resolve(cached);
if (opts.abortOthers) abortToc(key);
if (!tocPending[key]) {
var controller = window.AbortController ? new window.AbortController() : null;
tocAborters[key] = controller;
tocPending[key] = fetchPostHtml(abs, controller ? controller.signal : null).then(function(html){
  var items = parseHeadingItems(html, abs);
  var meta = items && items._m ? items._m : null;
  if (meta && ((meta.t && meta.t.length) || meta.a || (meta.c && meta.c.length) || meta.u || meta.r)) postMetaCache.set(key, meta);
  else postMetaCache.delete(key);
  writeToc(key, items);
  return items;
}).catch(function(err){
  if (controller && controller.signal && controller.signal.aborted) return [];
  throw err;
}).finally(function(){ delete tocPending[key]; delete tocAborters[key]; });
}
return tocPending[key];
}

function prefetchToc(href){ return resolveTocItems(href, { abortOthers: true }).catch(function(){ return []; }); }

function hydrateToc(card, href){ if(!card) return Promise.resolve([]); var key=tocCacheKey(href),abs=toAbsUrl(href),cached; if(!key||!abs){ renderTocSkeleton(6,'Unable to open.'); return Promise.resolve([]); } cached=readToc(key); if(Array.isArray(cached)){ applyPostMeta(key); renderTocItems(cached); return Promise.resolve(cached); } return resolveTocItems(abs,{ abortOthers:true }).then(function(items){ var active=panel&&panel.__ggPreviewCard?panel.__ggPreviewCard:null; if(active&&cardKey(active)===cardKey(card)){ applyPostMeta(key); renderTocItems(items||[]); } return items||[]; }).catch(function(){ var active=panel&&panel.__ggPreviewCard?panel.__ggPreviewCard:null; if(active&&cardKey(active)===cardKey(card)) renderTocSkeleton(6,'Open article for headings.'); return []; }); }
function updateTocForCard(card, href){ if(!card||!href){ abortToc(''); renderTocSkeleton(6,TOC_HINT_LOCK); return; } var key=tocCacheKey(href),cached; if(!key){ abortToc(''); renderTocSkeleton(6,'Unable to open.'); return; } cached=readToc(key); if(Array.isArray(cached)){ applyPostMeta(key); renderTocItems(cached); return; } abortToc(key); renderTocSkeleton(6,'Loading headings...'); hydrateToc(card, href); }

function fillChipsToSlot(slot, items, max){ var chipRow=qs('[data-gg-slot="'+slot+'"]', panel),list=items||[],i=0,x=null,href='',el=null,tx=null,n=Math.min(list.length,max||12); if(!chipRow) return; chipRow.innerHTML=''; for(i=0;i<n;i++){ x=list[i]||{}; href=cleanText(x.href||''); el=document.createElement(href?'a':'span'); el.className='gg-chip'; if(href) el.href=href; tx=document.createElement('span'); tx.className='gg-chip__text'; tx.textContent=x.text||''; el.appendChild(tx); chipRow.appendChild(el); } }
function applyPostMeta(key){ var m=key?postMetaCache.get(key):null,t=m&&Array.isArray(m.t)?m.t:[],c=m&&Array.isArray(m.c)?m.c:[],u=cleanText(m&&m.u?m.u:''),r=cleanText(m&&m.r?m.r:''),a=cleanText(m&&m.a?m.a:''),list=[],chips=[],resolved=[],i=0,base=0,token=0,one=null,ttoken=0; setS('updated',u); setRow('updated',!!u); setRow('contributors',!!c.length); setRow('tags',!!t.length); if(t.length){ fillChipsToSlot('tags',t,14); ttoken=panel?(panel.__ggTagMetaToken=(panel.__ggTagMetaToken||0)+1):0; tagResolveMany(t).then(function(rows){ if(!panel||panel.__ggMetaKey!==key||(ttoken&&panel.__ggTagMetaToken!==ttoken)) return; fillChipsToSlot('tags',Array.isArray(rows)?rows:[],14); }).catch(function(){}); } else fillChipsToSlot('tags',[],14); if(a) list.push(a); for(i=0;i<c.length;i++){ if(c[i]) list.push(c[i]); } if(list.length){ for(i=0;i<list.length;i++){ one=authorFallback(list[i]); chips.push({ text:one&&one.name?one.name:'', href:one&&one.href?one.href:'' }); } base=a?1:0; if(a&&chips[0]){ setS('author',chips[0].text); setHref('[data-s="author-link"]',chips[0].href||'#'); setRow('author',!!chips[0].text); } fillChipsToSlot('contributors',chips.slice(base),12); token=panel?(panel.__ggAuthorMetaToken=(panel.__ggAuthorMetaToken||0)+1):0; authorResolveMany(list).then(function(rows){ var x=null; if(!panel||panel.__ggMetaKey!==key||(token&&panel.__ggAuthorMetaToken!==token)) return; resolved=[]; base=a?1:0; if(Array.isArray(rows)){ if(a&&rows[0]){ x=rows[0]||{}; setS('author',x.name||''); setHref('[data-s="author-link"]',x.href||'#'); setRow('author',!!(x.name)); } for(i=base;i<rows.length;i++){ x=rows[i]||{}; resolved.push({ text:x.name||'', href:x.href||'' }); } fillChipsToSlot('contributors',resolved,12); } }).catch(function(){}); } else fillChipsToSlot('contributors',[],12); if(r){ setS('readtime',r); setRow('readtime',true); } }

function extractLabels(card){ var seen={},tags=qsa('.gg-post-card__labels a, a[rel="tag"]', card).map(function(a){ return { text:cleanText(a.textContent), href:cleanText(a.getAttribute('href')||'') }; }).filter(function(x){ var k=x.text.toLowerCase(); return k&&!seen[k]&&(seen[k]=1); }),a; if(tags.length) return tags; a=qs('.gg-post-card__label a', card); return a?[{ text:cleanText(a.textContent), href:cleanText(a.getAttribute('href')||'') }]:[]; }
function extractAuthor(card){ return { text:cardAttr(card,'data-author-name')||cardAttr(card,'data-author'), href:cardAttr(card,'data-author-url') }; }

function cardHref(card){
var titleLink = !card ? null : qs('.gg-post-card__title-link', card);
return titleLink ? (titleLink.getAttribute('href') || '#') : '#';
}

function cardKey(card){ return card ? String(card.getAttribute('data-id') || card.getAttribute('data-url') || '').trim() : ''; }

function normalizeReadTimeText(raw){ var txt=cleanText(raw),m,mins; if(!txt) return ''; m=txt.match(/(\d+)/); if(!m) return txt; mins=Math.max(1,parseInt(m[1],10)||1); return mins+' min read'; }
function estimateReadTime(card){ if(!card) return '—'; var inline=qs('[data-slot="readtime"]', card),txt=normalizeReadTimeText(inline?inline.textContent:''); if(txt) return txt; txt=normalizeReadTimeText(cardAttr(card,'data-readtime')||cardAttr(card,'data-read-time')); return txt||'—'; }

function canHoverPreview(){
if (!main || !window.matchMedia) return false;
var surface = main.getAttribute('data-gg-surface') || '';
return (surface === 'home' || surface === 'feed' || surface === 'listing') && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function openWithCard(card, trigger, opts){ if(!card) return; opts=opts||{}; ensurePanelSkeleton(); if(trigger) lastTrigger=trigger; if(panel) panel.__ggPreviewCard=card; var titleLink=qs('.gg-post-card__title-link', card),title=cleanText(titleLink?titleLink.textContent:''),href=cardHref(card),metaKey=tocCacheKey(href),imgSrc=extractThumbSrc(card),dateNode=qs('.gg-post-card__date', card),commentsNode=qs('.gg-post-card__meta-item--comments', card),dateText=cleanText(dateNode&&dateNode.textContent?dateNode.textContent:'')||cardAttr(card,'data-date'),commentsText=cleanText(commentsNode&&commentsNode.textContent?commentsNode.textContent:'')||cardAttr(card,'data-comments')||'—',readTimeText=estimateReadTime(card),author=extractAuthor(card),labels=extractLabels(card),excerptEl=qs('.gg-post-card__excerpt', card),quickSnippet=cleanText(excerptEl?(excerptEl.textContent||''):''); if(panel) panel.__ggMetaKey=metaKey||''; setS('title',title||'—'); setHref('[data-s="title"]',href); setHref('.gg-epanel__cta',href); setS('author',author.text); setHref('[data-s="author-link"]',author.href||href); setS('date',dateText); setS('updated',''); setS('comments',commentsText); setS('readtime',readTimeText); setS('snippet',quickSnippet); setImg(imgSrc,title); setRow('author',!!author.text); setRow('contributors',false); setRow('labels',!!labels.length); setRow('tags',false); setRow('date',!!dateText); setRow('updated',false); setRow('comments',!!commentsText); setRow('readtime',!!readTimeText); setRow('snippet',!!quickSnippet); if(labels.length) fillChipsToSlot('labels',labels,10); applyPostMeta(metaKey); if(panel) panel.hidden=false; setBackdropVisible(true); if(GG.modules.Panels&&GG.modules.Panels.setRight) GG.modules.Panels.setRight('open'); else if(main) main.setAttribute('data-gg-info-panel', 'open'); if(opts.select){ selectedCardKey=cardKey(card)||null; syncSlotInfoSelected(selectedCardKey); } updateTocForCard(card, href); if(opts.focusPanel!==false&&panel&&panel.focus){ panel.setAttribute('tabindex','-1'); try{ panel.focus({ preventScroll:true }); }catch(_){} } }

function resetPanelState(){
if (panel) {
panel.hidden = true;
panel.__ggPreviewCard = null;
panel.__ggMetaKey = '';
}
selectedCardKey = null;
syncSlotInfoSelected(null);
hoverCardKey = '';
clearHoverIntent();
setBackdropVisible(false);
abortToc('');
renderTocSkeleton(6, TOC_HINT_LOCK);
if (lastTrigger && typeof lastTrigger.focus === 'function') {
try { lastTrigger.focus({ preventScroll: true }); } catch(_) {}
}
}

function handleClose(){
if (GG.modules.Panels && GG.modules.Panels.setRight) GG.modules.Panels.setRight('closed');
else if (main) main.setAttribute('data-gg-info-panel', 'closed');
resetPanelState();
}

function handlePreviewHover(evt){
if (!canHoverPreview()) return;
if (evt.pointerType && evt.pointerType !== 'mouse' && evt.pointerType !== 'pen') return;
var card = closest(evt.target, '.gg-post-card'), key = cardKey(card);
if (!card || !key) return;
if (selectedCardKey && selectedCardKey !== key) return;
if (key === hoverCardKey || (hoverIntentTimer && key === hoverIntentCardKey)) return;
clearHoverIntent();
hoverIntentCardKey = key;
var href = cardHref(card);
hoverIntentTimer = w.setTimeout(function(){
hoverIntentTimer = 0;
if (!card) return;
if (typeof card.isConnected === 'boolean' && !card.isConnected) return;
if (selectedCardKey && key !== selectedCardKey) return;
prefetchToc(href);
hoverCardKey = key;
openWithCard(card, null, { focusPanel: false });
}, HOVER_INTENT_MS);
}

function handlePreviewOut(evt){
if (!canHoverPreview()) return;
var card = closest(evt.target, '.gg-post-card');
if (!card) return;
var nextCard = closest(evt.relatedTarget, '.gg-post-card');
if (nextCard && cardKey(nextCard) === cardKey(card)) return;
if (selectedCardKey) return;
clearHoverIntent();
abortToc('');
}

function handlePreviewFocus(evt){
if (!canHoverPreview()) return;
var card = closest(evt.target, '.gg-post-card'), key = cardKey(card);
if (!card || !key) return;
if (selectedCardKey && selectedCardKey !== key) return;
if (key === hoverCardKey) return;
clearHoverIntent();
prefetchToc(cardHref(card));
hoverCardKey = key;
openWithCard(card, null, { focusPanel: false });
}

function handleClick(evt){
var infoBtn = closest(evt.target, '[data-gg-action="info"]');
if (!infoBtn) return;
var card = closest(infoBtn, '.gg-post-card');
if (!card) return;
evt.preventDefault();
var key = cardKey(card);
if (selectedCardKey && selectedCardKey === key) {
selectedCardKey = null;
syncSlotInfoSelected(null);
return;
}
selectedCardKey = key || null;
syncSlotInfoSelected(selectedCardKey);
clearHoverIntent();
hoverCardKey = key;
openWithCard(card, infoBtn, { focusPanel: true, select: true });
}

function init(mainEl){
main = mainEl || qs('main.gg-main[data-gg-surface]');
if (!main) return;

panel = qs('.gg-info-panel', main);
var isPostLayout = !!qs('.gg-blog-layout--post', main);
if (isPostLayout){
if (panel) panel.style.display = 'none';
return;
}
if (!panel) return;

if (!main.__ggInfoPanelBound){
main.__ggInfoPanelBound = true;
main.addEventListener('click', handleClick, true);
main.addEventListener('pointerover', handlePreviewHover, true);
main.addEventListener('pointerout', handlePreviewOut, true);
main.addEventListener('focusin', handlePreviewFocus, true);
}
if (!panel.__ggInfoPanelBound) panel.__ggInfoPanelBound = true;
if (!closeObserver && main && window.MutationObserver) {
closeObserver = new MutationObserver(function (muts) {
  for (var i = 0; i < muts.length; i++) {
    if (muts[i].attributeName === 'data-gg-info-panel' && main.getAttribute('data-gg-info-panel') === 'closed') resetPanelState();
  }
});
closeObserver.observe(main, { attributes: true, attributeFilter: ['data-gg-info-panel'] });
}
ensurePanelSkeleton();
}

return { init: init };
})();

GG.modules.LeftNav = (function () {
var CUSTOM_WIDGET_IDS=[];for(var i=17;i<=26;i++)CUSTOM_WIDGET_IDS.push('HTML'+i);
var ICON_MAP = {
'community': 'forum',
'portfolio': 'work',
'library': 'menu_book',
'authors': 'account_circle',
'about': 'info',
'faq': 'quiz',
'contact': 'mail',
'support': 'volunteer_activism'
};

function textOf(el){
return el ? String(el.textContent || '').trim() : '';
}

function pickIcon(text){
var key = (text || '').toLowerCase();
var found = Object.keys(ICON_MAP).find(function(k){ return key.indexOf(k) !== -1; });
return found ? ICON_MAP[found] : 'description';
}

function pickLinkIcon(text, url){
var key = ((text || '') + ' ' + (url || '')).toLowerCase();
if (/privacy|term|disclaimer|gdpr|policy/.test(key)) return 'gavel';
if (/accessibility/.test(key)) return 'accessibility_new';
if (/llms|chatgpt|gemini|claude|ai/.test(key)) return 'smart_toy';
if (/ads/.test(key)) return 'ads_click';
if (/sitemap|index|topic|glossary|library/.test(key)) return 'menu_book';
if (/support|help|contact|faq|career|media/.test(key)) return 'support_agent';
if (/about|author|editorial|transparency/.test(key)) return 'info';
return pickIcon(text || url || '');
}

function pickGroupIcon(id, title){
if (id === 'HTML17' || id === 'HTML22') return 'verified_user';
if (id === 'HTML18' || id === 'HTML23') return 'hub';
if (id === 'HTML19' || id === 'HTML24') return 'support_agent';
if (id === 'HTML20' || id === 'HTML25') return 'gavel';
if (id === 'HTML21' || id === 'HTML26') return 'article';
  return pickLinkIcon(title || id || '', '');
}

function setWidgetIcon(id, icon){
  var el = document.getElementById(id);
  if (!el) return;
  el.setAttribute('data-gg-icon', icon);
}

function cleanUrl(raw){
  return (raw || '').replace(/[)\],.;]+$/g, '');
}

function normalizeTitle(raw){
  var title = String(raw || '').trim();
  title = title.replace(/^page\s*\d+\s*custom\s*:\s*/i, '');
  return title || 'Pages';
}

function guessLabelFromUrl(url){
  try {
    var u = new URL(url, window.location.href);
    var p = (u.pathname || '').split('/').filter(Boolean).pop() || u.hostname || url;
    p = p.replace(/\.[a-z0-9]+$/i, '');
    p = p.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return p.replace(/\b\w/g, function(m){ return m.toUpperCase(); });
  } catch (_) {
    return (url || '').replace(/^https?:\/\//i, '');
  }
}

function looksLikeUrlText(text){
  var v = String(text || '').trim();
  return /^https?:\/\//i.test(v) || /^www\./i.test(v) || /^[-a-z0-9]+\.[a-z]{2,}(\/|$)/i.test(v);
}

function parseWidgetEntries(raw){
  var lines = (raw || '')
    .split(/\r?\n/)
    .map(function(line){ return line.trim(); })
    .filter(Boolean);
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var pair = line.match(/^([^:]+):\s*(https?:\/\/\S+)$/i);
    if (pair) {
      out.push({
        label: (pair[1] || '').trim(),
        url: cleanUrl(pair[2]),
        note: ''
      });
      continue;
    }

    var direct = line.match(/^(https?:\/\/\S+)$/i);
    if (direct) {
      out.push({
        label: guessLabelFromUrl(cleanUrl(direct[1])),
        url: cleanUrl(direct[1]),
        note: ''
      });
      continue;
    }

    if (/^fungsi\s*:/i.test(line) && out.length) {
      var last = out[out.length - 1];
      if (!last.note) last.note = line.replace(/^fungsi\s*:\s*/i, '').trim();
    }
  }
  return out;
}

function renderEntriesAsList(itemsRoot, entries){
  if (!itemsRoot || !entries || !entries.length) return;
  var ul = document.createElement('ul');
  ul.className = 'gg-navtree__list';

  entries.forEach(function(item){
    if (!item.url) return;
    var li = document.createElement('li');
    li.className = 'gg-navtree__item';

    var a = document.createElement('a');
    a.className = 'gg-leftnav__link gg-leftnav__link--page gg-navtree__link';
    a.href = item.url;
    a.textContent = item.label || guessLabelFromUrl(item.url);
    a.setAttribute('data-gg-icon', pickLinkIcon(a.textContent, item.url));
    li.appendChild(a);

    if (item.note) {
      var note = document.createElement('small');
      note.className = 'gg-navtree__note';
      note.textContent = item.note;
      li.appendChild(note);
    }
    ul.appendChild(li);
  });

  itemsRoot.innerHTML = '';
  itemsRoot.appendChild(ul);
}

function normalizeItems(itemsRoot){
  if (!itemsRoot) return;
  itemsRoot.classList.add('gg-navtree__items');

  var hasAnchors = qsa('a[href]', itemsRoot).length > 0;
  if (!hasAnchors) {
    var parsed = parseWidgetEntries(itemsRoot.textContent || '');
    if (parsed.length) {
      renderEntriesAsList(itemsRoot, parsed);
      hasAnchors = true;
    }
  }

  var list = qs('.gg-navtree__list', itemsRoot) || qs('ul,ol', itemsRoot);
  if (list && !list.classList.contains('gg-navtree__list')) {
    list.classList.add('gg-navtree__list');
  }

  if (!list && hasAnchors) {
    list = document.createElement('ul');
    list.className = 'gg-navtree__list';
    var anchors = qsa('a[href]', itemsRoot);
    anchors.forEach(function(a){
      var li = document.createElement('li');
      li.className = 'gg-navtree__item';
      li.appendChild(a);
      list.appendChild(li);
    });
    itemsRoot.innerHTML = '';
    itemsRoot.appendChild(list);
  }

  if (!list) return;

  Array.prototype.slice.call(list.children || []).forEach(function(li){
    if (!li || li.nodeType !== 1) return;
    li.classList.add('gg-navtree__item');
    qsa('small,p', li).forEach(function(note){
      note.classList.add('gg-navtree__note');
      note.textContent = textOf(note).replace(/^fungsi\s*:\s*/i, '');
    });
  });

  qsa('a[href]', list).forEach(function(a){
    var href = a.getAttribute('href') || '';
    var txt = textOf(a);
    a.classList.add('gg-leftnav__link', 'gg-leftnav__link--page', 'gg-navtree__link');
    if (!txt || looksLikeUrlText(txt) || txt === href) {
      a.textContent = guessLabelFromUrl(href || txt);
    }
    if (!a.getAttribute('data-gg-icon')) {
      a.setAttribute('data-gg-icon', pickLinkIcon(textOf(a), href));
    }
  });
}

function ensureSummary(details, title, icon){
  if (!details) return;
  var summary = qs('.gg-navtree__summary', details);
  if (!summary) {
    summary = document.createElement('summary');
    summary.className = 'gg-navtree__summary';
    summary.innerHTML =
      '<span class="gg-navtree__summary-icon material-symbols-rounded" aria-hidden="true"></span>' +
      '<span class="gg-navtree__summary-text"></span>' +
      '<span class="gg-navtree__summary-chev material-symbols-rounded" aria-hidden="true">expand_more</span>';
    details.insertBefore(summary, details.firstChild);
  }

  var ico = qs('.gg-navtree__summary-icon', summary);
  var txt = qs('.gg-navtree__summary-text', summary);
  var chev = qs('.gg-navtree__summary-chev', summary);
  if (ico) ico.textContent = icon || 'folder';
  if (txt && !textOf(txt)) txt.textContent = title;
  if (txt && textOf(txt)) txt.textContent = normalizeTitle(textOf(txt));
  if (chev && !textOf(chev)) chev.textContent = 'expand_more';
}

function ensureNavTreeWidget(widget){
  if (!widget) return;
  var titleText = normalizeTitle(widget.getAttribute('title') || textOf(qs('.widget-title,.title', widget)));
  var icon = pickGroupIcon(widget.id || '', titleText);

  var details = qs('details.gg-navtree', widget) || qs('details', widget);
  if (!details) {
    var content = qs('.widget-content', widget);
    if (!content) return;
    details = document.createElement('details');
    details.className = 'gg-navtree';
    details.setAttribute('data-gg-default', 'closed');
    widget.insertBefore(details, widget.firstChild);
    details.appendChild(content);
  }

  details.classList.add('gg-navtree');
  details.setAttribute('data-gg-icon', icon);

  ensureSummary(details, titleText, icon);

  var items = qs('.gg-navtree__items', details) || qs('.widget-content', details);
  if (!items) {
    items = document.createElement('div');
    items.className = 'widget-content gg-navtree__items';
    details.appendChild(items);
  } else {
    items.classList.add('widget-content', 'gg-navtree__items');
  }
  normalizeItems(items);

  if (!details.hasAttribute('data-gg-default')) {
    details.setAttribute('data-gg-default', 'closed');
  }
  if ((details.getAttribute('data-gg-default') || '').toLowerCase() !== 'open') {
    details.removeAttribute('open');
  }
}

function enhanceCustomPages(root){
  var widgets = [];
  CUSTOM_WIDGET_IDS.forEach(function(id){
    var el = document.getElementById(id);
    if (el && root.contains(el)) widgets.push(el);
  });
  if (!widgets.length) return;
  widgets.forEach(function(widget){
    ensureNavTreeWidget(widget);
  });
}

function decorateLinks(root){
  qsa('.PageList ul li a, .LinkList ul li a', root).forEach(function (a) {
    a.classList.add('gg-leftnav__link');
    a.setAttribute('data-gg-icon', pickIcon(textOf(a)));
  });

  qsa('.Label ul > li > a', root).forEach(function (a) {
    a.classList.add('gg-leftnav__link');
    if (!a.getAttribute('data-gg-icon')) {
      a.setAttribute('data-gg-icon', 'folder');
    }
  });

  qsa('.Label ul li ul li > a', root).forEach(function (a) {
    a.classList.add('gg-leftnav__link');
    a.setAttribute('data-gg-icon', 'description');
  });
}

function seedLabelTree(root){
  qsa('.Label ul', root).forEach(function (ul) {
    ul.classList.add('gg-label-tree');
    qsa(':scope > li', ul).forEach(function (li) {
      var link = qs('a', li);
      if (!link) return;
      link.classList.add('gg-leftnav__link');
      link.setAttribute('data-gg-icon', 'folder');

      li.classList.add('gg-tree');
      GG.core.state.add(li, 'open');
      GG.core.state.remove(li, 'collapsed');

      var toggle = qs('.gg-tree-toggle', li);
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'gg-tree-toggle';
        toggle.setAttribute('data-gg-action', 'tree-toggle');
        toggle.setAttribute('aria-expanded', 'true');
        li.insertBefore(toggle, li.firstChild);
      } else {
        toggle.setAttribute('aria-expanded', 'true');
      }

      var name = textOf(link);
      if (name === 'Label 1' || name === 'Label 6') {
        if (!qs(':scope > ul', li)) {
          var childUl = document.createElement('ul');
          ['Post 1 of ' + name, 'Post 2 of ' + name].forEach(function (title) {
            var childLi = document.createElement('li');
            var a = document.createElement('a');
            a.className = 'gg-leftnav__link';
            a.setAttribute('data-gg-icon', 'description');
            a.href = link.getAttribute('href') || '#';
            a.textContent = title;
            childLi.appendChild(a);
            childUl.appendChild(childLi);
          });
          li.appendChild(childUl);
        }
      }
    });
  });
}

function init(mainEl){
  var scope = mainEl || document;
  var left = qs('.gg-blog-sidebar--left', scope);
  if (!left) return;
  left.classList.add('gg-leftnav-ready');

  setWidgetIcon('Profile1', 'verified_user');
  setWidgetIcon('PageList2', 'collections_bookmark');
  setWidgetIcon('Label1', 'inventory_2');
  setWidgetIcon('Label2', 'inventory_2');
  setWidgetIcon('PageList1', 'list_alt');

  decorateLinks(left);
  seedLabelTree(left);
  enhanceCustomPages(left);
}

return { init: init };
})();

(function(){
'use strict';
window.GG = window.GG || {};
GG.modules = GG.modules || {};

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/* ========== SHORTCODES (btn, alert, youtube, accordion) ========== */
GG.modules.Shortcodes = (function(){
function attr(raw, key){
  if(!raw) return '';
  var re = new RegExp(key + '\\s*=\\s*"([^"]+)"', 'i');
  var m = raw.match(re);
  if(m && m[1]) return m[1];
  re = new RegExp(key + "\\s*=\\s*'([^']+)'", 'i');
  m = raw.match(re);
  if(m && m[1]) return m[1];
  re = new RegExp(key + '\\s*=\\s*([^\\s]+)', 'i');
  m = raw.match(re);
  return (m && m[1]) ? m[1] : '';
}

function mapAlertType(t){
  var type = (t || '').toLowerCase();
  if(type === 'warning' || type === 'warn') return { type:'warning', ico:'warning' };
  if(type === 'success' || type === 'ok') return { type:'success', ico:'check_circle' };
  if(type === 'danger' || type === 'error') return { type:'danger', ico:'error' };
  return { type:'info', ico:'info' };
}

function wireAccordions(scope){
  qsa('.gg-sc-accordion', scope).forEach(function(acc){
    if(acc.__ggAccReady) return;
    var btn = qs('.gg-sc-accordion__toggle', acc);
    var body = qs('.gg-sc-accordion__body', acc);
    acc.__ggAccReady = true;
    GG.core.state.remove(acc, 'open');
    if(body) body.style.display = 'none';
    if(btn){
      btn.addEventListener('click', function(){
        var open = GG.core.state.toggle(acc, 'open');
        if(body) body.style.display = open ? 'block' : 'none';
      });
    }
  });
}

function transform(el){
  if(!el || el.__ggShortcodesDone) return;
  var html = el.innerHTML;

  html = html.replace(/\[btn\s+([^\]]+)\](.*?)\[\/btn\]/gis, function(_, attrs, body){
    var url = attr(attrs, 'url') || '#';
    return '<a class="gg-sc-btn" href="'+url+'">'+body+'</a>';
  });

  html = html.replace(/\[alert(?:\s+([^\]]+))?\](.*?)\[\/alert\]/gis, function(_, attrs, body){
    var info = mapAlertType(attr(attrs || '', 'type'));
    return '<div class="gg-sc-alert" data-gg-type="'+info.type+'" data-gg-ico="'+info.ico+'">'+body+'</div>';
  });

  html = html.replace(/\[youtube\s+([^\]]*?)\]/gi, function(_, attrs){
    var id = attr(attrs, 'id') || '';
    if(!id) return _;
    var src = 'https://www.youtube.com/embed/' + encodeURIComponent(id);
    return '<div class="gg-sc-youtube"><iframe src="'+src+'" loading="lazy" allowfullscreen title="YouTube video"></iframe></div>';
  });

  html = html.replace(/\[accordion\s+([^\]]*?)\](.*?)\[\/accordion\]/gis, function(_, attrs, body){
    var title = attr(attrs, 'title') || 'Accordion';
    return '' +
      '<div class="gg-sc-accordion">' +
        '<button class="gg-sc-accordion__toggle" type="button">' +
          '<span class="gg-sc-accordion__title">'+title+'</span>' +
          '<span class="gg-sc-accordion__icon" aria-hidden="true">expand_more</span>' +
        '</button>' +
        '<div class="gg-sc-accordion__body">'+body+'</div>' +
        '</div>';
    });

    el.innerHTML = html;
    el.__ggShortcodesDone = true;
    wireAccordions(el);
  }

  function init(){
    var areas = qsa('.gg-post__content.post-body.entry-content, .post-body.entry-content, .entry-content');
    if(!areas.length) return;
    areas.forEach(transform);
  }

  return { init:init, transform:transform };
})();

/* ========== SKELETON PLACEHOLDER ========== */
GG.modules.Skeleton = (function(){
  function buildCard(){
    var card = document.createElement('div');
    card.className = 'gg-skeleton-card';
    card.innerHTML =
      '<div class="gg-skeleton-thumb gg-shimmer"></div>' +
      '<div class="gg-skeleton-line gg-shimmer"></div>' +
      '<div class="gg-skeleton-line gg-shimmer" style="width:80%"></div>' +
      '<div class="gg-skeleton-line gg-shimmer" style="width:65%"></div>';
    return card;
  }

  function init(){
    var list = qs('#postcards');
    var main = qs('main.gg-main[data-gg-surface]');
    var surface = main ? main.getAttribute('data-gg-surface') : '';
    if(!list || surface === 'post' || surface === 'page') return;
    if(list.dataset.ggSkeletonInit) return;
    list.dataset.ggSkeletonInit = '1';

    var skeleton = document.createElement('div');
    skeleton.className = 'gg-skeleton-grid gg-skeleton-grid--overlay';

    var count = Math.min(8, Math.max(4, list.children.length || 6));
    for(var i=0;i<count;i++){
      skeleton.appendChild(buildCard());
    }

    list.setAttribute('data-gg-skeleton', 'on');
    list.appendChild(skeleton);

    var revealed = false;
    function reveal(){
      if(revealed) return;
      revealed = true;
      list.removeAttribute('data-gg-skeleton');
      GG.core.state.add(skeleton, 'fading');
      setTimeout(function(){
        if(skeleton && skeleton.parentNode){ skeleton.parentNode.removeChild(skeleton); }
      }, 240);
    }

    window.addEventListener('load', reveal, { once:true });
    setTimeout(reveal, 900);
  }

  return { init:init };
})();

/* ========== READING PROGRESS ========== */
GG.modules.ReadingProgress = (function(){
  var barEl = null;
  var mainEl = null;
  var article = null;

  function clamp(n){ return Math.min(1, Math.max(0, n)); }

  function ensureBar(dock){
    if(barEl) return barEl;
    if(!dock) return null;
    var track = document.createElement('div');
    track.className = 'gg-dock__progress';
    var bar = document.createElement('span');
    bar.className = 'gg-dock__progress-bar';
    track.appendChild(bar);
    dock.appendChild(track);
    barEl = bar;
    return barEl;
  }

  function update(){
    if(!barEl || !article) return;
    var rect = article.getBoundingClientRect();
    var start = rect.top + window.pageYOffset;
    var end = start + article.offsetHeight - window.innerHeight;
    var pct = clamp((window.pageYOffset - start) / Math.max(120, end - start));
    barEl.style.width = (pct * 100).toFixed(2) + '%';
  }

  function init(dock, main){
    mainEl = main || qs('main.gg-main[data-gg-surface]');
    var surface = mainEl ? mainEl.getAttribute('data-gg-surface') : '';
    if(surface !== 'post' && surface !== 'postdetail' && surface !== 'page') return;

    article = qs('.gg-post__content.post-body.entry-content') ||
              qs('.post-body.entry-content') ||
              qs('.entry-content');
    if(!article) return;

    ensureBar(dock || qs('nav.gg-dock[data-gg-module="dock"]'));
    if(!barEl) return;

    update();
    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
  }

  return { init:init };
})();

/* ========== DOCK PERIMETER PROGRESS ========== */
GG.modules.DockPerimeter = (function(){
  var dock, bar, svgWrap, svg, trackPath, progPath;
  var pathLen = 0;
  var rafId = null;
  var resizeObs = null;
  var mutObs = null;
  var SW = 2;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function ensureSvg(){
    if(svgWrap) return svgWrap;
    if(!dock) return null;
    svgWrap = document.createElement('div');
    svgWrap.className = 'gg-dock__perimeter';
    svgWrap.setAttribute('aria-hidden', 'true');

    svg = document.createElementNS(SVG_NS, 'svg');
    trackPath = document.createElementNS(SVG_NS, 'path');
    progPath = document.createElementNS(SVG_NS, 'path');
    trackPath.classList.add('gg-dock__perimeter-track');
    progPath.classList.add('gg-dock__perimeter-progress');
    svg.appendChild(trackPath);
    svg.appendChild(progPath);
    svgWrap.appendChild(svg);
    dock.appendChild(svgWrap);
    return svgWrap;
  }

  function pathData(){
    if(!dock) return null;
    var rect = dock.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if(!w || !h) return null;
    var inset = SW / 2;
    var innerW = Math.max(0, w - SW);
    var innerH = Math.max(0, h - SW);
    var r = Math.min(innerH / 2, innerW / 2);
    var x0 = inset;
    var y0 = inset;
    var x1 = x0 + innerW;
    var y1 = y0 + innerH;
    var d = [
      'M', x0 + r, y1,
      'L', x1 - r, y1,
      'Q', x1, y1, x1, y1 - r,
      'L', x1, y0 + r,
      'Q', x1, y0, x1 - r, y0,
      'L', x0 + r, y0,
      'Q', x0, y0, x0, y0 + r,
      'L', x0, y1 - r,
      'Q', x0, y1, x0 + r, y1
    ].join(' ');
    return { d:d, w:w, h:h };
  }

  function syncPath(){
    if(!dock || !trackPath || !progPath || !svg) return;
    var data = pathData();
    if(!data) return;
    svg.setAttribute('viewBox', '0 0 ' + data.w + ' ' + data.h);
    trackPath.setAttribute('d', data.d);
    progPath.setAttribute('d', data.d);
    trackPath.setAttribute('stroke-width', SW);
    progPath.setAttribute('stroke-width', SW);
    pathLen = progPath.getTotalLength();
    trackPath.style.strokeDasharray = pathLen;
    progPath.style.strokeDasharray = pathLen;
    applyProgress();
  }

  function readProgress(){
    if(!bar || !bar.style || !bar.style.width) return 0;
    var pct = parseFloat(bar.style.width);
    if(isNaN(pct)) return 0;
    return Math.min(1, Math.max(0, pct / 100));
  }

  function applyProgress(){
    if(!progPath || !pathLen) return;
    var pct = readProgress();
    var off = pathLen * (1 - pct);
    progPath.style.strokeDashoffset = off;
  }

  function scheduleProgress(){
    if(rafId) return;
    rafId = requestAnimationFrame(function(){
      rafId = null;
      applyProgress();
    });
  }

  function observe(){
    if(window.MutationObserver && bar && !mutObs){
      mutObs = new MutationObserver(scheduleProgress);
      mutObs.observe(bar, { attributes:true, attributeFilter:['style'] });
    }
    if(window.ResizeObserver && dock && !resizeObs){
      resizeObs = new ResizeObserver(function(){ syncPath(); });
      resizeObs.observe(dock);
    } else {
      window.addEventListener('resize', syncPath);
    }
  }

  function init(dockEl){
    dock = dockEl || qs('nav.gg-dock[data-gg-module="dock"]');
    bar = qs('.gg-dock__progress-bar', dock);
    if(!dock || !bar) return;
    ensureSvg();
    syncPath();
    applyProgress();
    observe();
  }

  return { init:init };
})();

/* ========== RELATED INLINE ========== */
GG.modules.RelatedInline = (function(){
  var inserted = false;

  function normalizeUrl(u){
    return String(u || '').split('#')[0].replace(/\/+$/,'');
  }

  function getBase(){
    var alt = qs('link[rel="alternate"][type="application/atom+xml"]');
    if(alt && alt.href){
      try{
        var u = new URL(alt.href, location.href);
        return (u.origin + u.pathname).replace(/\/feeds\/posts\/default.*$/,'').replace(/\/$/,'');
      }catch(_){}
    }
    return (location.origin || '').replace(/\/$/,'');
  }

  function pickAltLink(entry){
    var links = entry && entry.link ? entry.link : [];
    for(var i=0;i<links.length;i++){
      if(links[i].rel === 'alternate' && links[i].href) return links[i].href;
    }
    return '';
  }

  function parseEntry(entry){
    if(!entry) return null;
    var title = (entry.title && entry.title.$t) || '';
    var href = pickAltLink(entry);
    var thumb = '';
    var media = entry['media$thumbnail'] || entry.media$thumbnail;
    if(media && media.url) thumb = media.url.replace(/=s72-c/,'=s640');
    var published = entry.published && entry.published.$t ? new Date(entry.published.$t) : null;
    var date = published ? published.toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
    return { title:title, href:href, thumb:thumb, date:date };
  }

  function fetchRelated(label){
    var feedBase = (GG.services && GG.services.api && GG.services.api.getFeedBase)
      ? GG.services.api.getFeedBase(false)
      : '/feeds/posts/default';
    var url = getBase() + feedBase + '/-/' + encodeURIComponent(label) + '?alt=json&max-results=6';
    return fetch(url, { credentials:'same-origin' })
      .then(function(res){ if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
      .then(function(json){
        var entries = (json && json.feed && json.feed.entry) || [];
        return entries.map(parseEntry).filter(function(x){ return x && x.title && x.href; });
      })
      .catch(function(){ return []; });
  }

  function buildCard(item){
    var wrap = document.createElement('aside');
    wrap.className = 'gg-related-inline';
    wrap.setAttribute('role','complementary');
    wrap.innerHTML =
      '<div class="gg-related-inline__eyebrow">Baca juga</div>' +
      '<a class="gg-related-inline__title" href="'+item.href+'">'+item.title+'</a>' +
      (item.thumb ? '<img class="gg-related-inline__thumb" src="'+item.thumb+'" alt="'+item.title+'"/>' : '') +
      '<div class="gg-related-inline__meta">' +
        '<span class="material-symbols-rounded" aria-hidden="true">auto_stories</span>' +
        '<span>'+(item.date || 'Artikel terkait')+'</span>' +
      '</div>';
    return wrap;
  }

  function findLabel(){
    var link = qs('.gg-post__label-link[href*="/search/label/"]') || qs('.gg-post__breadcrumbs a[href*="/search/label/"]');
    return link ? (link.textContent || '').trim() : '';
  }

  function init(){
    if(inserted) return;
    var article = qs('.gg-post__content.post-body.entry-content') ||
                  qs('.post-body.entry-content') ||
                  qs('.entry-content');
    if(!article) return;

    var paras = qsa('p', article).filter(function(p){
      return (p.textContent || '').trim().length > 28;
    });
    if(paras.length < 3) return;

    var label = findLabel();
    if(!label) return;

    var targetIdx = Math.min(paras.length - 1, Math.max(2, Math.round(paras.length / 2)));
    var target = paras[targetIdx];
    if(!target || !target.parentNode) return;

    fetchRelated(label).then(function(items){
      if(inserted || !items.length) return;
      var current = normalizeUrl(location.href);
      var pick = null;
      for(var i=0;i<items.length;i++){
        if(normalizeUrl(items[i].href) !== current){ pick = items[i]; break; }
      }
      if(!pick) return;
      var card = buildCard(pick);
      inserted = true;
      target.parentNode.insertBefore(card, target.nextSibling);
    });
  }

  return { init:init };
})();
})();

GG.boot = GG.boot || {};
GG.core = GG.core || {};
GG.boot.safeInit = GG.boot.safeInit || function(name, fn){
try {
  if (typeof fn === 'function') fn();
  if (window.GG_DIAG && GG_DIAG.modules) GG_DIAG.modules[name] = 'ok';
} catch (e) {
  if (window.GG_DIAG && GG_DIAG.modules) GG_DIAG.modules[name] = 'err';
  try { if (window.console && console.error) console.error('[GG_INIT]', name, e); } catch(_) {}
  try {
    if (window.GG_DIAG && GG_DIAG.errors) {
      GG_DIAG.errors.push({
        type: 'init',
        name: name,
        message: (e && e.message) ? e.message : String(e || 'error'),
        stack: (e && e.stack) ? e.stack : '',
        at: Date.now()
      });
    }
  } catch(_) {}
} finally {
  try { if (window.GG_DIAG_RENDER) window.GG_DIAG_RENDER(); } catch(_) {}
}
};

GG.boot.initDebugOverlay = GG.boot.initDebugOverlay || function(){
try {
  var debug = false;
  try { debug = new URL(window.location.href).searchParams.get('ggdebug') === '1'; } catch (e) {}
  if (!debug) return;

  var el = document.getElementById('gg-debug-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gg-debug-overlay';
    el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;max-width:60vw;max-height:45vh;overflow:auto;padding:8px 10px;background:#111;color:#e6e6e6;border:1px solid #333;border-radius:6px;font:11px/1.3 monospace;white-space:pre;pointer-events:none;opacity:0.92;';
    document.body.appendChild(el);
  }

  window.GG_DIAG_RENDER = function(){
    var env = (window.GG && GG.env) ? GG.env : {};
    var surfaceEl = document.querySelector('[data-gg-surface]') || document.documentElement;
    var surface = surfaceEl ? (surfaceEl.getAttribute('data-gg-surface') || '') : '';
    var homeState = surfaceEl ? (surfaceEl.getAttribute('data-gg-home-state') || '') : '';
    var modules = (window.GG_DIAG && GG_DIAG.modules) ? GG_DIAG.modules : {};
    var keys = Object.keys(modules).sort();
    var lines = [];
    lines.push('mode: ' + (env.mode || ''));
    lines.push('assets: ' + (env.assets || ''));
    lines.push('surface: ' + surface);
    lines.push('homeState: ' + homeState);
    lines.push('modules:');
    if (keys.length) {
      keys.forEach(function(k){
        lines.push('  ' + k + ': ' + modules[k]);
      });
    } else {
      lines.push('  (none)');
    }
    var lastErr = (window.GG_DIAG && GG_DIAG.errors && GG_DIAG.errors.length) ? GG_DIAG.errors[GG_DIAG.errors.length - 1] : null;
    if (lastErr) {
      lines.push('lastError: ' + (lastErr.message || 'error'));
    } else {
      lines.push('lastError: none');
    }
    el.textContent = lines.join('\n');
  };

  window.GG_DIAG_RENDER();
} catch(_) {}
};

GG.boot.initHomePrepaint = GG.boot.initHomePrepaint || function(){
var hasHomeRoot = !!document.querySelector('[data-gg-home-root="1"]');
if (GG.util && GG.util.isDebug && GG.util.isDebug()) {
  var pre = document.documentElement.getAttribute('data-gg-prehome');
  try {
    console.log('[prehome] value:', pre);
    console.log('[prehome] has home root:', hasHomeRoot);
  } catch(_){}
}

function disarm(){
  if (GG.homePrepaint && GG.homePrepaint.disarm) {
    GG.boot.safeInit('homePrepaint.disarm', function(){ GG.homePrepaint.disarm(); });
  }
}

if (!hasHomeRoot) {
  disarm();
  return;
}

var main = document.querySelector('main.gg-main[data-gg-surface]');
var hasLanding = !!(main && main.querySelector('[data-gg-home-layer="landing"], .gg-home-landing'));
var hasBlog = !!(main && main.querySelector('[data-gg-home-layer="blog"], .gg-home-blog'));

if (!hasLanding || !hasBlog || !GG.modules || !GG.modules.homeState) {
  disarm();
}

setTimeout(function(){
  if (document.documentElement.hasAttribute('data-gg-prehome')) {
    disarm();
  }
}, 1500);
};

GG.boot.initHomeState = GG.boot.initHomeState || function(){
var main = document.querySelector('main.gg-main[data-gg-surface]');
var hasHomeRoot = !!document.querySelector('[data-gg-home-root="1"]');
var hasLanding = !!(main && main.querySelector('[data-gg-home-layer="landing"], .gg-home-landing'));
var hasBlog = !!(main && main.querySelector('[data-gg-home-layer="blog"], .gg-home-blog'));
if (!main || !hasHomeRoot || !hasLanding || !hasBlog || !GG.modules || !GG.modules.homeState) return;
if (GG.util && GG.util.initOnce) {
  GG.util.initOnce('homeState.init', function(){
    GG.modules.homeState.init(main);
  });
} else {
  GG.modules.homeState.init(main);
}
};

GG.core.resolveSelector = GG.core.resolveSelector || function(sel){
if (!sel) return null;
if (typeof sel === 'function') return sel();
if (Array.isArray(sel)) {
  for (var i = 0; i < sel.length; i++) {
    var el = document.querySelector(sel[i]);
    if (el) return el;
  }
  return null;
}
return document.querySelector(sel);
};

GG.core.selectorLabel = GG.core.selectorLabel || function(sel){
if (!sel) return '';
if (Array.isArray(sel)) return sel.join(' | ');
if (typeof sel === 'function') return '(custom)';
return sel;
};

GG.app = GG.app || {};
GG.app.plan = [
{ name: 'debugOverlay', selector: 'body', init: GG.boot.initDebugOverlay, optional: true },
{ name: 'homePrepaint.guard', selector: null, init: GG.boot.initHomePrepaint, optional: true },
{ name: 'homeState.init', selector: 'main.gg-main[data-gg-surface="home"]', init: GG.boot.initHomeState },
{ name: 'Shortcodes.init', selector: '.gg-post__content.post-body.entry-content, .post-body.entry-content, .entry-content', init: function(){ if (GG.modules.Shortcodes) GG.modules.Shortcodes.init(); } },
{ name: 'ShortcodesLite.init', selector: '.post-body, .entry-content, #post-body', init: function(){ if (GG.modules.shortcodesLite && GG.modules.shortcodesLite.init) GG.modules.shortcodesLite.init(); } },
{ name: 'Skeleton.init', selector: '#postcards', init: function(){ if (GG.modules.Skeleton) GG.modules.Skeleton.init(); } },
{ name: 'Panels.init', selector: 'main.gg-main[data-gg-surface]', init: function(){ if (GG.modules.Panels) GG.modules.Panels.init(); } },
{ name: 'InfoPanel.init', selector: '.gg-info-panel[data-gg-panel="info"]', init: function(){ var main = document.querySelector('main.gg-main[data-gg-surface]'); if (main && GG.modules.InfoPanel) GG.modules.InfoPanel.init(main); } },
{ name: 'PostDetail.init', selector: 'main.gg-main[data-gg-surface="post"], main.gg-main[data-gg-surface="page"], main.gg-main[data-gg-surface="postdetail"]', init: function(){ var main = document.querySelector('main.gg-main[data-gg-surface]'); if (main && GG.modules.PostDetail) GG.modules.PostDetail.init(main); } },
{ name: 'labelTree.init', selector: '.gg-labeltree[data-gg-module="labeltree"]', init: function(){ if (GG.modules.labelTree) GG.modules.labelTree.init(); } },
{ name: 'breadcrumbs.init', selector: 'nav.gg-post__breadcrumbs', init: function(){ if (GG.modules.breadcrumbs) GG.modules.breadcrumbs.init(document); } },
{ name: 'readTime.init', selector: '[data-slot="readtime"]', init: function(){ if (GG.modules.readTime) GG.modules.readTime.init(document); } },
{ name: 'LeftNav.init', selector: '.gg-blog-sidebar--left', init: function(){ var main = document.querySelector('main.gg-main[data-gg-surface]'); if (main && GG.modules.LeftNav) GG.modules.LeftNav.init(main); } },
{ name: 'Dock.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); var main = document.querySelector('main.gg-main[data-gg-surface]'); if (dock && GG.modules.Dock) GG.modules.Dock.init(dock, main); } },
{ name: 'ReadingProgress.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); var main = document.querySelector('main.gg-main[data-gg-surface]'); if (dock && GG.modules.ReadingProgress) GG.modules.ReadingProgress.init(dock, main); } },
{ name: 'DockPerimeter.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); if (dock && GG.modules.DockPerimeter) GG.modules.DockPerimeter.init(dock); } },
{ name: 'FooterAccordion.init', selector: '.gg-footer__grid', init: function(){ if (GG.modules.FooterAccordion) GG.modules.FooterAccordion.init(); }, optional: true },
{ name: 'BackToTop.init', selector: '.gg-backtotop', init: function(){ if (GG.modules.BackToTop) GG.modules.BackToTop.init(); } },
{ name: 'LoadMore.init', selector: '[data-gg-module="loadmore"]', init: function(){ if (GG.modules.LoadMore) GG.modules.LoadMore.init(); } },
{ name: 'PopularCarousel.init', selector: '#gg-popularpost1 .widget-content [role="feed"]', init: function(){ if (GG.modules.PopularCarousel) GG.modules.PopularCarousel.init(); } },
{ name: 'RelatedInline.init', selector: '.gg-post__content.post-body.entry-content, .post-body.entry-content, .entry-content', init: function(){ if (GG.modules.RelatedInline) GG.modules.RelatedInline.init(); } },
{ name: 'tagDirectory.init', selector: '.gg-tags-directory', init: function(){ if (GG.modules.tagDirectory && GG.modules.tagDirectory.init) GG.modules.tagDirectory.init(document.querySelector('.gg-tags-directory')); } },
{ name: 'tagHubPage.init', selector: '.gg-tags-page', init: function(){ if (GG.modules.tagHubPage && GG.modules.tagHubPage.init) GG.modules.tagHubPage.init(document); } },
{ name: 'postTagsInline.init', selector: '.gg-post-tags', init: function(){ if (GG.modules.postTagsInline && GG.modules.postTagsInline.init) GG.modules.postTagsInline.init(document); } },
{ name: 'library.autoInit', selector: '#gg-library-list, .gg-library-list, .gg-post-card__action--bookmark, .gg-post__action--bookmark', init: function(){ if (GG.modules.library && GG.modules.library.autoInit) GG.modules.library.autoInit(); } },
{ name: 'shareSheet.init', selector: '#gg-share-sheet, #pc-poster-sheet', init: function(){ if (GG.modules.shareSheet && GG.modules.shareSheet.init) GG.modules.shareSheet.init(); } },
{ name: 'posterCanvas.init', selector: '#gg-share-sheet, #pc-poster-sheet', init: function(){ if (GG.modules.posterCanvas && GG.modules.posterCanvas.init) GG.modules.posterCanvas.init(); } },
{ name: 'posterEngine.init', selector: '#gg-share-sheet, #pc-poster-sheet', init: function(){ if (GG.modules.posterEngine && GG.modules.posterEngine.init) GG.modules.posterEngine.init(); } },
{ name: 'shareMotion.init', selector: '#gg-share-sheet, #pc-poster-sheet', init: function(){ if (GG.modules.shareMotion && GG.modules.shareMotion.init) GG.modules.shareMotion.init(); } },
{ name: 'langSwitcher.init', selector: '.gg-lang-switcher', init: function(){ if (GG.modules.langSwitcher && GG.modules.langSwitcher.init) GG.modules.langSwitcher.init(); } },
{ name: 'imgDims.init', selector: 'img', init: function(){ if (GG.modules.imgDims && GG.modules.imgDims.init) GG.modules.imgDims.init(document); } },
{ name: 'a11yFix.init', selector: 'body', init: function(){ if (GG.modules.a11yFix && GG.modules.a11yFix.init) GG.modules.a11yFix.init(document); } },
{ name: 'interactiveModules.init', selector: 'body', init: function(){ if (GG.util && GG.util.initInteractiveModules) GG.util.initInteractiveModules(document); } },
{ name: 'feed.init', selector: '#gg-feed', init: function(){ if (GG.modules.feed && GG.modules.feed.init) GG.modules.feed.init(); } },
{ name: 'sitemap.init', selector: '#gg-sitemap', init: function(){ if (GG.modules.sitemap && GG.modules.sitemap.init) GG.modules.sitemap.init(); } },
{ name: 'backPolicy.init', selector: 'body', init: function(){ if (GG.modules.backPolicy && GG.modules.backPolicy.init) GG.modules.backPolicy.init(); } },
{ name: 'prefetch.init', selector: '#postcards', init: function(){ if (GG.modules.prefetch && GG.modules.prefetch.init) GG.modules.prefetch.init(); } }
];

GG.app.selectorMap = GG.app.selectorMap || {};
GG.app.plan.forEach(function(item){
GG.app.selectorMap[item.name] = GG.core.selectorLabel(item.selector);
});

GG.app.init = GG.app.init || function(){
if (GG.app._init) return;
GG.app._init = true;
for (var i = 0; i < GG.app.plan.length; i++) {
  (function(item){
    if (!item || typeof item.init !== 'function') return;
    var host = GG.core.resolveSelector(item.selector);
    if (item.selector && !host && !item.optional) {
      if (window.GG_DIAG && GG_DIAG.modules) GG_DIAG.modules[item.name] = 'skip';
      return;
    }
    GG.boot.safeInit(item.name, function(){ item.init(host); });
  })(GG.app.plan[i]);
}
};

GG.app.rehydrate = GG.app.rehydrate || function(context){
var ctx = context || {};
if (GG.ui && GG.ui.layout && typeof GG.ui.layout.refresh === 'function') {
  GG.ui.layout.refresh(ctx.doc || null);
}
var main = document.querySelector('main.gg-main[data-gg-surface]') || document.querySelector('main.gg-main');
var tasks = [
  { name: 'homeState.reinit', fn: function(){ if (GG.boot && GG.boot.initHomeState) GG.boot.initHomeState(); } },
  { name: 'Panels.reinit', fn: function(){ if (GG.modules.Panels) GG.modules.Panels.init(); } },
  { name: 'InfoPanel.reinit', fn: function(){ if (main && GG.modules.InfoPanel) GG.modules.InfoPanel.init(main); } },
  { name: 'PostDetail.reinit', fn: function(){ if (main && GG.modules.PostDetail) GG.modules.PostDetail.init(main); } },
  { name: 'LeftNav.reinit', fn: function(){ if (main && GG.modules.LeftNav) GG.modules.LeftNav.init(main); } },
  { name: 'labelTree.reinit', fn: function(){ if (GG.modules.labelTree) GG.modules.labelTree.init(); } },
  { name: 'breadcrumbs.reinit', fn: function(){ if (GG.modules.breadcrumbs) GG.modules.breadcrumbs.init(document); } },
  { name: 'readTime.reinit', fn: function(){ if (GG.modules.readTime) GG.modules.readTime.init(document); } },
  { name: 'LoadMore.reinit', fn: function(){ if (GG.modules.LoadMore) GG.modules.LoadMore.init(); } },
  { name: 'tagHubPage.reinit', fn: function(){ if (GG.modules.tagHubPage && GG.modules.tagHubPage.init) GG.modules.tagHubPage.init(document); } },
  { name: 'interactiveModules.reinit', fn: function(){ if (GG.util && GG.util.initInteractiveModules) GG.util.initInteractiveModules(document); } }
];
for (var i = 0; i < tasks.length; i++) {
  GG.boot.safeInit(tasks[i].name, tasks[i].fn);
}
};

(function(){
var w = window;
var d = document;
var GG = w.GG = w.GG || {};
GG.core = GG.core || {};

GG.core.commentsGate = GG.core.commentsGate || (function(){
  function isSlowDevice(){
    var nav = w.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn && conn.saveData) return true;
    if (conn && typeof conn.effectiveType === 'string' && /2g/i.test(conn.effectiveType)) return true;
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2) return true;
    return false;
  }
  function idle(fn){
    if (GG.boot && typeof GG.boot.defer === 'function') {
      GG.boot.defer(fn);
      return;
    }
    if (w.requestIdleCallback) w.requestIdleCallback(function(){ fn(); }, { timeout: 1200 });
    else w.setTimeout(fn, 1);
  }
  function load(host, reason){
    if (!host || host.__ggCommentsLoaded) return;
    host.__ggCommentsLoaded = true;
    var gate = host.querySelector('[data-gg-comments-gate="ui"]');
    var btn = host.querySelector('[data-gg-comments-load]');
    var tpl = host.querySelector('template#gg-comments-template');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }
    var frag = null;
    if (tpl && tpl.content) {
      frag = tpl.content.cloneNode(true);
    } else if (tpl) {
      var tmp = d.createElement('div');
      tmp.innerHTML = tpl.innerHTML || '';
      frag = d.createDocumentFragment();
      while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    }
    if (tpl && tpl.parentNode) tpl.parentNode.removeChild(tpl);
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    if (frag) host.appendChild(frag);

    if (GG.core && GG.core.render && typeof GG.core.render.rehydrateComments === 'function') {
      GG.core.render.rehydrateComments(host);
    }
    if (GG.services && GG.services.comments && typeof GG.services.comments.mountWithRetry === 'function') {
      GG.services.comments.mountWithRetry();
    }
    if (reason && GG.core && GG.core.telemetry) {
      GG.core.telemetry({ type: 'comments_gate', action: 'load', reason: reason });
    }
  }
  function initHost(host){
    if (!host || host.__ggCommentsGateInit) return;
    host.__ggCommentsGateInit = true;
    var btn = host.querySelector('[data-gg-comments-load]');
    if (btn) {
      btn.addEventListener('click', function(){ load(host, 'click'); }, { once: true });
    }
    var hash = w.location && w.location.hash ? w.location.hash : '';
    if (hash === '#comments' || /^#c\d+/.test(hash)) {
      load(host, 'hash');
      return;
    }
    if (isSlowDevice()) return;
    var sentinel = host.querySelector('[data-gg-comments-sentinel]') || host;
    if (w.IntersectionObserver && sentinel) {
      var io = new IntersectionObserver(function(entries){
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            io.disconnect();
            idle(function(){ load(host, 'scroll'); });
            return;
          }
        }
      }, { rootMargin: '200px 0px' });
      io.observe(sentinel);
    } else {
      idle(function(){ load(host, 'idle'); });
    }
  }
  function init(){
    var host = d.querySelector('.gg-post__comments[data-gg-comments-gate="1"]');
    if (!host) return;
    initHost(host);
  }
  return { init: init, load: load };
})();

function hookCommentsGate(){
  if (!GG.core || !GG.core.commentsGate) return false;
  if (GG.app && typeof GG.app.rehydrate === 'function') {
    if (!GG.app.__ggCommentsGateWrapped) {
      var prev = GG.app.rehydrate;
      GG.app.rehydrate = function(ctx){
        try { return prev ? prev.apply(this, arguments) : undefined; }
        finally { try { GG.core.commentsGate.init(); } catch (_) {} }
      };
      GG.app.__ggCommentsGateWrapped = true;
    }
    return true;
  }
  return false;
}

function boot(){
  if (GG.core && GG.core.commentsGate) GG.core.commentsGate.init();
  if (hookCommentsGate()) return;
  var tries = 0;
  var t = w.setInterval(function(){
    tries++;
    if (hookCommentsGate() || tries >= 20) {
      w.clearInterval(t);
    }
  }, 500);
}

if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(function(){
  var GG = window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  var Lite = GG.modules.shortcodesLite = GG.modules.shortcodesLite || {};
  const SHORT_RE = /\[youtube\]([\s\S]*?)\[\/youtube\]/gi;

  function extractYouTubeId(input){
    if(!input) return null;
    const s = String(input).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    let m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];
    m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];
    m = s.match(/\/embed\/([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];
    m = s.match(/\/shorts\/([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];

    return null;
  }

  function replaceShortcodes(root=document){
    root.querySelectorAll('.post-body, .entry-content, #post-body').forEach(el => {
      if (!el || !el.innerHTML) return;
      if (el.dataset.ggShortcodeDone === '1') return;

      el.innerHTML = el.innerHTML.replace(SHORT_RE, (_, raw) => {
        const id = extractYouTubeId(raw);
        if (!id) {
          return `[youtube]${raw}[/youtube]`;
        }
        return `
  <div class="gg-yt-lite" data-id="${id}">
    <img loading="lazy" alt="" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg">
    <div class="gg-yt-play"></div>
  </div>
`;
      });

      el.dataset.ggShortcodeDone = '1';
    });
  }



  function shouldAutoPlayMedia(){
    var reduced = false;
    try{
      if (GG.store && GG.store.get) {
        var st = GG.store.get();
        if (st && typeof st.reducedMotion === 'boolean') reduced = st.reducedMotion;
      }
    }catch(e){}
    if (!reduced) {
      try{
        if (GG.services && GG.services.a11y && GG.services.a11y.reducedMotion) {
          reduced = !!GG.services.a11y.reducedMotion.get();
        }
      }catch(e){}
    }
    if (!reduced && window.matchMedia) {
      try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
    }
    if (reduced) return false;
    var nav = window.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn && conn.saveData) return false;
    if (conn && typeof conn.effectiveType === 'string' && /2g|slow-2g/i.test(conn.effectiveType)) return false;
    if (conn && typeof conn.downlink === 'number' && conn.downlink < 1.0) return false;
    return true;
  }

  function hydrateLiteEmbeds(root=document){
    root.querySelectorAll('.gg-yt-lite').forEach(box => {
      if (box.dataset.ggHydrated === '1') return;
      box.dataset.ggHydrated = '1';

      const id = box.getAttribute('data-id');
      if (!id) return;

      const img = box.querySelector('img');
      if (img && !img.getAttribute('src')) {
        img.setAttribute('src', `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
      }


      const load = () => {
        const allowAuto = shouldAutoPlayMedia();
        const autoplay = allowAuto ? '1' : '0';
        const allowAttr = allowAuto
          ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          : 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        box.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${id}?autoplay=${autoplay}"
            style="width:100%;height:100%;border:0;"
            allow="${allowAttr}"
            allowfullscreen></iframe>`;
      };

      box.addEventListener('click', load, { passive:true });
      box.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); load(); }
      });
      box.setAttribute('tabindex','0');
      box.setAttribute('role','button');
    });
  }

  function runAll(root=document){
    replaceShortcodes(root);
    hydrateLiteEmbeds(root);
  }

  function init(){
    if (Lite._init) return;
    Lite._init = true;
    runAll();

    if (window.MutationObserver && !Lite._mo) {
      Lite._mo = new MutationObserver(muts => {
        for (const m of muts) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) runAll(n);
          }
        }
      });
      Lite._mo.observe(document.body, { childList:true, subtree:true });
    }
  }

  Lite.init = Lite.init || init;
})();

(function(){
  'use strict';
  var HOME_ANCHOR = '#gg-home-blog-anchor'; // target "mentok" utama
  var HOME_FALLBACK = '#gg-landing-hero';   // fallback kalau anchor utama gak ada
  var HOME_LANDING_PATH = '/';
  var HOME_BLOG_PATH = '/blog';
  function homeRoot(){
    var raw = (window.homeUrl || '/');
    var path = '/';
    try{
      if (typeof raw === 'string' && raw.indexOf('://') !== -1){
        path = new URL(raw, location.origin).pathname || '/';
      } else {
        path = String(raw || '/');
      }
    }catch(e){
      path = '/';
    }
    if (!path) path = '/';
    if (path.charAt(0) !== '/') path = '/' + path;
    if (path.charAt(path.length - 1) !== '/') path += '/';
    return path;
  }

  function homeBlogPath(){
    if (GG.core && GG.core.blogHomePath) return GG.core.blogHomePath(homeRoot(), location.hostname);
    return homeRoot().replace(/\/$/,'') + HOME_BLOG_PATH;
  }

function isSystemPath(pathname){
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/feeds/')
  ) return true;
  if (pathname.endsWith('.xml') || pathname.endsWith('.txt') || pathname.endsWith('.ico')) return true;
  return false;
}


  function pageGroup(){
    var b = document.body;
    if(!b) return 'listing';
    if (b.classList.contains('item') || b.classList.contains('static_page')) return 'content';
    return 'listing';
  }

  function currentMobileMode(){
    try { return new URLSearchParams(location.search).get('m'); } catch(e){ return null; }
  }

  function canonicalKey(urlStr){
    var u = new URL(urlStr, location.origin);
    if (isSystemPath(u.pathname)) return null;

    var view = (u.searchParams.get('view') || '').toLowerCase();
    var keep = new URLSearchParams();
    var q = u.searchParams.get('q');
    var umin = u.searchParams.get('updated-min');
    var umax = u.searchParams.get('updated-max');

    if(q) keep.set('q', q);
    if(umin) keep.set('updated-min', umin);
    if(umax) keep.set('updated-max', umax);

    u.search = keep.toString() ? ('?' + keep.toString()) : '';

    var path = (u.pathname || '/').replace(/\/$/,'');
    if(path === '') path = '/';
    var landingPath = homeRoot().replace(/\/$/,'');
    if(landingPath === '') landingPath = '/';
    var isProdHost = (GG.core && GG.core.isProdHost) ? GG.core.isProdHost(u.hostname || location.hostname) : false;
    var workerOk = (GG.core && GG.core.hasWorker) ? GG.core.hasWorker() : false;
    var isBlogHome = (GG.core && GG.core.isBlogHomePath) ? GG.core.isBlogHomePath(path, u.search || '', u.hostname || location.hostname) : ((workerOk && path === '/blog') || (path === '/' && view === 'blog'));
    var blogKey = '';
    if (isProdHost && workerOk) {
      blogKey = homeRoot().replace(/\/$/,'') + '/blog' + u.search;
    } else {
      var blogParams = new URLSearchParams(u.search || '');
      blogParams.set('view', 'blog');
      blogKey = homeRoot() + '?' + blogParams.toString();
    }

    if(path === landingPath && view === 'blog'){
      return blogKey;
    }
    if(path === landingPath && view === 'landing'){
      return landingPath + u.search;
    }
    if(path === landingPath && u.hash === HOME_ANCHOR){
      return blogKey;
    }
    if(isBlogHome){
      return blogKey;
    }
    if(path === landingPath){
      return landingPath + u.search;
    }
    if(u.hash !== HOME_ANCHOR && u.hash !== HOME_FALLBACK) u.hash = '';
    return path + u.search + u.hash;
  }
  function applyMobile(dest){
    var m = currentMobileMode();
    if(m !== '1') return dest;
    var u = new URL(dest, location.origin);
    if(isSystemPath(u.pathname)) return dest;
    u.searchParams.set('m','1');
    return u.pathname + '?' + u.searchParams.toString() + (u.hash || '');
  }

  function readStack(){
    try { return JSON.parse(sessionStorage.getItem('gg_stack') || '[]'); }
    catch(e){ return []; }
  }
  function writeStack(st){
    sessionStorage.setItem('gg_stack', JSON.stringify(st.slice(-80)));
  }

  function navType(){
    try{
      var e = performance.getEntriesByType('navigation');
      return (e && e[0] && e[0].type) ? e[0].type : 'navigate';
    } catch(e){ return 'navigate'; }
  }

  function setEntryRefOnce(){
    if(sessionStorage.getItem('gg_entry_ref')) return;
    var ref = document.referrer;
    if(!ref) return;
    try{
      if(new URL(ref).origin !== location.origin){
        sessionStorage.setItem('gg_entry_ref', ref);
      }
    } catch(e){}
  }

  function homeLanding(){
    var blogPath = homeBlogPath();
    if(blogPath) return blogPath;
    var base = homeRoot();
    return base + HOME_FALLBACK;
  }
  function track(){
    setEntryRefOnce();

    var group = pageGroup();
    if(!sessionStorage.getItem('gg_first_group')){
      sessionStorage.setItem('gg_first_group', group);
    }
    if (group === 'listing') {
      sessionStorage.setItem('gg_last_listing', canonicalKey(location.href));
    } else {
      if (!sessionStorage.getItem('gg_last_listing')) {
        sessionStorage.setItem('gg_last_listing', canonicalKey(homeLanding()));
      }
    }
    if(sessionStorage.getItem('gg_nav_action') === 'back'){
      sessionStorage.removeItem('gg_nav_action');
      return;
    }
    if(navType() === 'back_forward') return;

    var cur = canonicalKey(location.href);
    if(!cur) return;

    var st = readStack();
    if(st.length === 0 || st[st.length-1] !== cur){
      st.push(cur);
      writeStack(st);
    }
  }
  function bindHashChange(){
    if(pageGroup() !== 'listing') return;
    window.addEventListener('hashchange', function(){
      var h = location.hash;
      if(h === HOME_ANCHOR || h === HOME_FALLBACK){
        sessionStorage.setItem('gg_last_listing', canonicalKey(location.href));
      }
    });
  }
  function goBack(){
    var cur = canonicalKey(location.href);
    var st = readStack();
    if(cur && (st.length === 0 || st[st.length-1] !== cur)){
      st.push(cur);
    }
    if(st.length > 1){
      st.pop();
      var dest = st[st.length-1];
      writeStack(st);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(dest);
      return;
    }
    var lastListing = sessionStorage.getItem('gg_last_listing') || homeBlogPath();
    var group = pageGroup();

    if(group === 'content'){
      writeStack([lastListing]);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(lastListing);
      return;
    }
    var first = sessionStorage.getItem('gg_first_group'); // 'listing' / 'content'
    var entry = sessionStorage.getItem('gg_entry_ref');

    if(first === 'listing' && entry){
      sessionStorage.removeItem('gg_entry_ref');
      sessionStorage.removeItem('gg_stack');
      location.href = entry;
      return;
    }
    var homeKey = canonicalKey(homeLanding());
    if(cur !== homeKey){
      writeStack([homeKey]);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(homeKey);
      return;
    }
  }
  window.GGBack = { go: goBack };

  function init(){
    track();
    bindHashChange();
  }

  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.modules.backPolicy = GG.modules.backPolicy || {};
  GG.modules.backPolicy.init = GG.modules.backPolicy.init || init;
})();


(function () {
  'use strict';
  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.state = GG.state || {};

  if (GG.__GAGA_MOCKUP_V3__) return;
  GG.__GAGA_MOCKUP_V3__ = true;

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function closest(el, sel){
    if (!el) return null;
    if (el.closest) return el.closest(sel);
    while (el && el.nodeType === 1){
      if (el.matches && el.matches(sel)) return el;
      el = el.parentElement;
    }
    return null;
  }
  function setAttr(el, name, val){ if (el) el.setAttribute(name, val); }
  function getText(el){ return el ? (el.textContent || '').trim() : ''; }

  function ensureBackdrop(){
    var bd = qs('.gg-panels-backdrop');
    if (bd) return bd;
    bd = document.createElement('div');
    bd.className = 'gg-panels-backdrop gg-backdrop';
    bd.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bd);
    return bd;
  }

  function lockScroll(locked){
    GG.core.state.toggle(document.documentElement, 'scroll-lock', !!locked);
    GG.core.state.toggle(document.body, 'scroll-lock', !!locked);
  }

  function shouldMobile(){
    return window.matchMedia && window.matchMedia('(max-width: 960px)').matches;
  }

  GG.modules.Panels = (function () {
    var main, left, right, backdrop;
    var bound = false;
    var lastFocus = null;
    var pendingFocus = null;

    function getAttr(el, name){ return el ? el.getAttribute(name) : null; }
    function getRightState(){
      return getAttr(main, 'data-gg-right-panel') || getAttr(main, 'data-gg-info-panel') || 'closed';
    }
    function setRightAttr(state){
      if (!main) return;
      setAttr(main, 'data-gg-right-panel', state);
      setAttr(main, 'data-gg-info-panel', state);
    }
    function rememberFocus(el){
      if (!el || el === document.body || el === document.documentElement) return;
      if (!document.contains(el)) return;
      lastFocus = el;
    }
    function restoreFocus(){
      var el = lastFocus;
      lastFocus = null;
      if (el && document.contains(el) && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch(_) {
          try { el.focus(); } catch(_) {}
        }
      }
    }
    function focusPanel(side){
      var panel = side === 'left' ? left : right;
      if (side === 'right' && main) {
        var mode = getAttr(main, 'data-gg-right-mode') || '';
        if (mode === 'comments') {
          panel = qs('[data-gg-panel="comments"]', right) || qs('.gg-comments-panel', right) || right;
        } else if (mode) {
          panel = qs('[data-gg-panel="info"]', right) || qs('.gg-info-panel', right) || right;
        }
      }
      if (!panel) return;
      var focusable = panel.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!focusable) {
        panel.setAttribute('tabindex', '-1');
        focusable = panel;
      }
      if (focusable && typeof focusable.focus === 'function') {
        try { focusable.focus({ preventScroll: true }); } catch(_) {
          try { focusable.focus(); } catch(_) {}
        }
      }
    }
    function setMainInert(on){
      if (!main) return;
      if (on){
        main.setAttribute('inert', '');
        main.setAttribute('aria-hidden', 'true');
      } else {
        main.removeAttribute('inert');
        main.removeAttribute('aria-hidden');
      }
    }

    function setLeft(state, opts){
      if (!main) return;
      opts = opts || {};
      var prev = getAttr(main, 'data-gg-left-panel') || 'closed';
      if (state === 'open' && prev !== 'open') {
        rememberFocus(opts.from || document.activeElement);
        pendingFocus = 'left';
        if (shouldMobile() && getRightState() === 'open') {
          setRightAttr('closed');
        }
      }
      setAttr(main, 'data-gg-left-panel', state);
      if (!opts.skipUpdate) updateBackdrop();
      if (state === 'closed' && prev === 'open' && opts.restoreFocus) restoreFocus();
    }

    function setRight(state, opts){
      if (!main) return;
      opts = opts || {};
      var prev = getRightState();
      if (state === 'open' && prev !== 'open') {
        rememberFocus(opts.from || document.activeElement);
        pendingFocus = 'right';
        if (shouldMobile() && getAttr(main, 'data-gg-left-panel') === 'open') {
          setAttr(main, 'data-gg-left-panel', 'closed');
        }
      }
      if (state === 'closed' && prev === 'open' && opts.clearMode && main) {
        main.removeAttribute('data-gg-right-mode');
      }
      setRightAttr(state);
      if (!opts.skipUpdate) updateBackdrop();
      if (state === 'closed' && prev === 'open' && opts.restoreFocus) restoreFocus();
    }

    function updateBackdrop(){
      var surface = getAttr(main, 'data-gg-surface') || '';
      var leftOpen  = getAttr(main, 'data-gg-left-panel') === 'open';
      var rightOpen = getRightState() === 'open';
      var show = surface === 'post' && (leftOpen || rightOpen);
      if (backdrop) GG.core.state.toggle(backdrop, 'visible', show);
      lockScroll(show);
      setMainInert(show);
      if (left) left.setAttribute('aria-hidden', leftOpen ? 'false' : 'true');
      if (right) right.setAttribute('aria-hidden', rightOpen ? 'false' : 'true');
      if (show && pendingFocus) {
        focusPanel(pendingFocus);
        pendingFocus = null;
      }
    }

    function closeAll(opts){
      opts = opts || {};
      if (main) main.removeAttribute('data-gg-right-mode');
      setLeft('closed', { skipUpdate: true });
      setRight('closed', { skipUpdate: true });
      updateBackdrop();
      if (opts.restoreFocus) restoreFocus();
    }
    function injectLeftHeader(){
      if (!left) return;
      if (qs('.gg-left-panel__head', left)) return;

      var head = document.createElement('div');
      head.className = 'gg-left-panel__head';
      head.innerHTML =
        '<div class="gg-left-panel__brand">' +
          '<span class="gg-left-panel__brand-title"></span>' +
        '</div>' +
        '';

      var wrap = qs('.gg-blog-sidebar__section', left) || left;
      wrap.insertBefore(head, wrap.firstChild);
    }

    function injectLeftFab(){
      if (qs('.gg-left-fab')) return;
      var btn = document.createElement('button');
      btn.className = 'gg-left-fab';
      btn.type = 'button';
      btn.setAttribute('data-gg-action', 'left-toggle');
      btn.setAttribute('aria-label', 'Toggle sidebar');
      document.body.appendChild(btn);
    }

    function enhanceTree(){
      if (!left) return;
      var roots = qsa('.LinkList ul, .PageList ul, .Label ul, .widget ul', left)
        .filter(function (ul) {
          return !ul.closest('.gg-lt');
        });

      roots.forEach(function (ul) {
        qsa(':scope > li', ul).forEach(function (li) {
          var childUl = qs(':scope > ul', li);
          if (!childUl) return;

          li.classList.add('gg-tree');
          GG.core.state.add(li, 'open');
          if (qs(':scope > .gg-tree-toggle', li)) return;

          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gg-tree-toggle';
          btn.setAttribute('aria-expanded', 'true');
          btn.setAttribute('data-gg-action', 'tree-toggle');

          li.insertBefore(btn, li.firstChild);
        });
      });
    }

    function handleClick(evt){
      var t = evt.target;

      if (closest(t, '[data-gg-action="left-toggle"]')){
        var isOpen = main && main.getAttribute('data-gg-left-panel') === 'open';
        setLeft(isOpen ? 'closed' : 'open', { restoreFocus: isOpen }); evt.preventDefault(); return;
      }
      if (closest(t, '[data-gg-toggle="left-panel"]')){
        var isOpenL = main && main.getAttribute('data-gg-left-panel') === 'open';
        setLeft(isOpenL ? 'closed' : 'open', { restoreFocus: isOpenL }); evt.preventDefault(); return;
      }
      if (closest(t, '[data-gg-toggle="right-panel"]')){
        var isOpenR = main && getRightState() === 'open';
        setRight(isOpenR ? 'closed' : 'open', { restoreFocus: isOpenR, clearMode: isOpenR }); evt.preventDefault(); return;
      }

      var treeBtn = closest(t, '[data-gg-action="tree-toggle"]');
      if (treeBtn){
        var li = closest(treeBtn, 'li.gg-tree');
        if (!li) return;
        var isOpen = GG.core.state.has(li, 'open');
        GG.core.state.toggle(li, 'open', !isOpen);
        GG.core.state.toggle(li, 'collapsed', isOpen);
        treeBtn.setAttribute('aria-expanded', (!isOpen).toString());
        evt.preventDefault();
        return;
      }

      if (backdrop && t === backdrop){
        closeAll({ restoreFocus: true });
        evt.preventDefault();
        return;
      }

      if (closest(t, '[data-gg-action="info-close"]')){
        setRight('closed', { restoreFocus: true, clearMode: true }); evt.preventDefault(); return;
      }
    }

    function handleKey(evt){
      if (evt.key !== 'Escape') return;
      var leftOpen = main && getAttr(main, 'data-gg-left-panel') === 'open';
      var rightOpen = main && getRightState() === 'open';
      if (!leftOpen && !rightOpen) return;
      if (rightOpen) setRight('closed', { skipUpdate: true, clearMode: true });
      if (leftOpen) setLeft('closed', { skipUpdate: true });
      updateBackdrop();
      restoreFocus();
      evt.preventDefault();
    }

    function bindEvents(){
      if (bound) return;
      bound = true;
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKey, true);
      window.addEventListener('resize', updateBackdrop);
    }

    function init(){
      main = qs('main.gg-main[data-gg-surface]') || qs('main.gg-main') || qs('main');
      if (!main) return;
      var surface = main.getAttribute('data-gg-surface') || '';
      var isPostSurface = surface === 'post';
      var surfaceChanged = main.__ggPanelsSurface !== surface;
      if (surfaceChanged) main.__ggPanelsSurface = surface;

      left  = qs('.gg-blog-sidebar--left', main);
      right = qs('.gg-blog-sidebar--right', main);

      if (isPostSurface){
        if (surfaceChanged || !main.hasAttribute('data-gg-left-panel')){
          setAttr(main, 'data-gg-left-panel', 'closed');
        }
        if (surfaceChanged || !main.hasAttribute('data-gg-right-panel')){
          setRightAttr('closed');
        }
        if (surfaceChanged || !main.hasAttribute('data-gg-right-mode')){
          setAttr(main, 'data-gg-right-mode', 'comments');
        }
      } else {
        if (surfaceChanged || !main.hasAttribute('data-gg-left-panel')){
          setAttr(main, 'data-gg-left-panel', shouldMobile() ? 'closed' : 'open');
        }
        if (surfaceChanged || !main.hasAttribute('data-gg-right-panel')){
          setRightAttr('closed');
        }
        if (!isPostSurface && main.hasAttribute('data-gg-right-mode')){
          main.removeAttribute('data-gg-right-mode');
        }
      }

      backdrop = ensureBackdrop();

      injectLeftHeader();
      injectLeftFab();
      enhanceTree();

      bindEvents();
      updateBackdrop();
    }

    return { init: init, setLeft: setLeft, setRight: setRight };
  })();
})();


(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.state = GG.state || {};
  GG.data = GG.data || {};
  GG.data.tagFeedCache = GG.data.tagFeedCache || {};

  var TagUtils = GG.modules.tagUtils = GG.modules.tagUtils || {};
  function getBasePath() {
    if (TagUtils._basePath) return TagUtils._basePath;
    var base = '';
    var alt = d.querySelector('link[rel="alternate"][type="application/atom+xml"]');
    if (alt && alt.href) {
      try {
        var urlObj = new URL(alt.href, w.location.href);
        base = urlObj.origin + urlObj.pathname.replace(/\/feeds\/posts\/default.*$/, '');
      } catch (err) {
        base = '';
      }
    }
    if (!base) {
      base = (w.location.origin || '').replace(/\/$/, '');
    }
    TagUtils._basePath = base.replace(/\/$/, '');
    return TagUtils._basePath;
  }

  TagUtils.normalizeTag = function (raw) {
    if (!raw) { return ''; }
    var slug = String(raw).replace(/^#+/, '').trim().toLowerCase();
    slug = slug.replace(/[^a-z0-9_-]+/g, '-');
    slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    return slug;
  };

  TagUtils.buildTagUrl = function (slug) {
    var clean = TagUtils.normalizeTag(slug);
    var base = getBasePath() || '';
    var path = base + '/p/tags.html';
    return clean ? path + '?tag=' + encodeURIComponent(clean) : path;
  };

  TagUtils.buildFeedUrl = function (params) {
    var feedBase = (GG.services && GG.services.api && GG.services.api.getFeedBase)
      ? GG.services.api.getFeedBase(false)
      : '/feeds/posts/default';
    var base = getBasePath() + feedBase;
    var url = new URL(base, w.location.href);
    url.searchParams.set('alt', 'json');
    if (params && params['max-results']) {
      url.searchParams.set('max-results', params['max-results']);
    }
    if (params && params.q) {
      url.searchParams.set('q', params.q);
    }
    return url.toString();
  };

  TagUtils.formatTagLabel = function (slug) {
    if (!slug) { return ''; }
    var parts = slug.split(/[-_]/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) { continue; }
      parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    return parts.join(' ');
  };

  TagUtils.extractTagsFromHtml = function (html) {
    if (!html) { return []; }
    var text = String(html).replace(/<[^>]+>/g, ' ');
    var matches = text.match(/#[^#\s]+/g) || [];
    var tags = [];
    for (var i = 0; i < matches.length; i++) {
      var slug = TagUtils.normalizeTag(matches[i]);
      if (slug) { tags.push(slug); }
    }
    return tags;
  };

  TagUtils.getLang = function () {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('tags') : {};
  };

})(window.GG, window, document);

(function (GG, d) {
  'use strict';
  GG.util = GG.util || {};
  function initInteractive(root) {
    var scope = root || d;
    var mods = (GG && GG.modules) || {};
    if (mods.postCardMedia && typeof mods.postCardMedia.init === 'function') {
      mods.postCardMedia.init(scope);
    }
    if (mods.postCardMotion && typeof mods.postCardMotion.init === 'function') {
      mods.postCardMotion.init();
    }
    if (mods.library && typeof mods.library.init === 'function') {
      mods.library.init(scope);
    }
    if (mods.shareSheet && typeof mods.shareSheet.initShareButtons === 'function') {
      mods.shareSheet.initShareButtons(scope);
    } else if (GG.util.initShareButtons) {
      GG.util.initShareButtons(scope);
    }
  }
  GG.util.initInteractiveModules = initInteractive;
})(window.GG, document);
(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.util = GG.util || {};
  GG.config = GG.config || {};
  var Library = GG.modules.library = GG.modules.library || {};
  var cfg = GG.config.library = GG.config.library || {};
  var selectors = cfg.selectors || {};
  var SELECTOR_BUTTONS = selectors.buttons || '.gg-post-card__action--bookmark, .gg-post__action--bookmark';
  var LIST_SELECTOR = selectors.list || '.gg-library-list, #gg-library-list';
  var EMPTY_SELECTOR = selectors.empty || '#gg-library-empty';
  var STORE_KEY = cfg.storageKey || 'GG_LIBRARY_V1';
  function getMessages() {
    var libraryText = (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('library') : {};
    var actionsText = (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('actions') : {};
    var defaults = cfg.messages || {};
    return {
      add: defaults.add || libraryText.bookmark_add || actionsText.bookmark_add || 'Tambahkan ke Library',
      in: defaults.in || libraryText.bookmark_inLibrary || actionsText.bookmark_inLibrary || 'Dalam Library',
      saved: defaults.saved || libraryText.toast_saved || 'Disimpan ke Library',
      removed: defaults.removed || libraryText.toast_removed || 'Dihapus dari Library',
      empty: defaults.empty || libraryText.empty || 'Belum ada posting disimpan',
      removeBtn: defaults.removeBtn || libraryText.remove_button || 'Hapus dari Library'
    };
  }
  var stateCache;

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function collectTagsFromHost(host) {
    var tags = [];
    if (!host || !host.querySelectorAll) return tags;
    var tagUtils = (GG.modules && GG.modules.tagUtils) || null;
    var chips = host.querySelectorAll('.gg-post-tags__chip');
    for (var i = 0; i < chips.length; i++) {
      var slug = chips[i].getAttribute('data-gg-tag') || chips[i].textContent || '';
      slug = slug.trim();
      if (tagUtils && typeof tagUtils.normalizeTag === 'function') {
        slug = tagUtils.normalizeTag(slug);
      }
      if (slug && tags.indexOf(slug) === -1) {
        tags.push(slug);
      }
    }
    return tags;
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];
    var map = {};
    list.forEach(function (item) {
      if (!item || item.id == null) return;
      var key = String(item.id);
      var existing = map[key];
      if (!existing || ((item.addedAt || 0) > (existing.addedAt || 0))) {
        map[key] = item;
      }
    });
    return Object.keys(map).map(function (key) { return map[key]; });
  }

  function readState() {
    if (!Array.isArray(stateCache)) {
      try {
        var raw = w.localStorage.getItem(STORE_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        stateCache = normalizeList(parsed);
        if (parsed.length !== stateCache.length) {
          writeState(stateCache);
        }
      } catch (err) {
        stateCache = [];
      }
    }
    return stateCache;
  }

  function writeState(list) {
    stateCache = list.slice();
    try {
      w.localStorage.setItem(STORE_KEY, JSON.stringify(stateCache));
    } catch (err) {}
  }

  function cloneState() {
    return readState().slice();
  }

  function findIndex(list, id) {
    var target = String(id || '');
    if (!target) return -1;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i] && list[i].id || '') === target) {
        return i;
      }
    }
    return -1;
  }

  function getButtonId(btn) {
    var host = btn.closest('[data-id]');
    var hd = host && host.dataset ? host.dataset : {};
    var ds = btn.dataset || {};
    return String(ds.bmId || hd.id || ds.bmUrl || hd.url || '');
  }

  function extractData(btn) {
    var host = btn.closest('[data-id]') || d.body;
    var hd = host.dataset || {};
    var ds = btn.dataset || {};
    var id = ds.bmId || hd.id || ds.bmUrl || hd.url || '';
    var cover = ds.bmCover || hd.cover || '';
    var date = ds.bmDate || hd.date || '';
    var item = {
      id: String(id || (ds.bmUrl || hd.url || '')),
      title: ds.bmTitle || hd.title || btn.getAttribute('data-bm-title') || '',
      url: ds.bmUrl || hd.url || '',
      label: ds.bmLabel || hd.label || '',
      author: ds.bmAuthor || hd.author || '',
      siteIcon: ds.bmSiteIcon || hd.siteIcon || '',
      cover: cover,
      date: date,
      tags: collectTagsFromHost(host),
      addedAt: Date.now()
    };
    if (!item.id) {
      item.id = item.url || String(Date.now());
    }
    if (!item.url) {
      item.url = w.location.href;
    }
    if (!item.title) {
      item.title = d.title;
    }
    return item;
  }

  function syncButton(btn, isOn) {
    if (!btn) return;
    var active = !!isOn;
    var msg = getMessages();
    var labelText = active ? msg.in : msg.add;
    if (GG.a11y && typeof GG.a11y.setToggle === 'function') {
      GG.a11y.setToggle(btn, active);
    }
    GG.core.state.toggle(btn, 'active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    GG.core.state.toggle(btn, 'marked', active);
    GG.core.state.remove(btn, 'just-added');
    btn.setAttribute('aria-label', labelText);
    var label = btn.querySelector('.gg-post-card__action-label, .gg-post__action-label');
    if (label) label.textContent = labelText;
  }

  function syncButtonsById(id, isOn, except) {
    if (!id) return;
    toArray(d.querySelectorAll(SELECTOR_BUTTONS)).forEach(function (btn) {
      if (btn === except) return;
      if (getButtonId(btn) === String(id)) {
        syncButton(btn, isOn);
      }
    });
  }

  function showToast(message, options) {
    if (GG.util && typeof GG.util.showToast === 'function' && message) {
      GG.util.showToast(message, options || {});
    }
  }

  function removeById(id) {
    if (!id) return;
    var list = cloneState();
    var idx = findIndex(list, id);
    if (idx === -1) return;
    list.splice(idx, 1);
    writeState(list);
    syncButtonsById(id, false);
    renderList();
    var msg = getMessages();
    showToast(msg.removed, { icon: '#gg-ic-check-circle-solid' });
  }

  function toggleBookmark(btn) {
    var item = extractData(btn);
    var list = cloneState();
    var idx = findIndex(list, item.id);
    var msg = getMessages();
    if (idx > -1) {
      list.splice(idx, 1);
      writeState(list);
      syncButton(btn, false);
      syncButtonsById(item.id, false, btn);
      renderList();
      showToast(msg.removed, { icon: '#gg-ic-check-circle-solid' });
    } else {
      list.push(item);
      writeState(list);
      syncButton(btn, true);
      syncButtonsById(item.id, true, btn);
      renderList();
      showToast(msg.saved, { icon: '#gg-ic-bookmark-added-line' });
    }
  }
  Library.toggleFromAction = function(btn){
    toggleBookmark(btn);
  };

  function handleClick(e) {
    e.preventDefault();
    toggleBookmark(e.currentTarget || e.target);
  }

  function initButton(btn) {
    if (!btn || btn.dataset.ggLibraryInit) return;
    btn.dataset.ggLibraryInit = '1';
    var list = readState();
    var idx = findIndex(list, getButtonId(btn));
    syncButton(btn, idx > -1);
    btn.addEventListener('click', handleClick);
  }

  function init(root) {
    var scope = root || d;
    toArray(scope.querySelectorAll(SELECTOR_BUTTONS)).forEach(initButton);
  }

  function formatDate(raw) {
    if (!raw) return '';
    var date = new Date(raw);
    if (isNaN(date.getTime())) {
      return String(raw);
    }
    var day = date.getDate();
    var month = date.toLocaleString('en-US', { month: 'short' });
    var year = date.getFullYear();
    return day + ' ' + month + ' ' + year;
  }

  function renderList(root) {
    var scope = root || d;
    var wrap = scope.querySelector('#gg-library-list') || scope.querySelector(LIST_SELECTOR);
    var empty = scope.querySelector(EMPTY_SELECTOR);
    if (!wrap) return;
    var msg = getMessages();
    var list = cloneState();
    wrap.innerHTML = '';
    if (!list.length) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    var ul = d.createElement('ul');
    ul.className = 'gg-library-list__items';
    list.sort(function (a, b) {
      return (b.addedAt || 0) - (a.addedAt || 0);
    });
    list.forEach(function (item) {
      var li = d.createElement('li');
      li.className = 'gg-library-list__item';

      var link = d.createElement('a');
      link.className = 'gg-library-list__link';
      link.href = item.url || '#';
      link.textContent = item.title || item.url || '';
      li.appendChild(link);

      var formatted = formatDate(item.date);
      if (formatted) {
        var meta = d.createElement('span');
        meta.className = 'gg-library-list__meta';
        meta.textContent = formatted;
        li.appendChild(meta);
      }

      var removeBtn = d.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'gg-library-list__remove-btn';
      removeBtn.setAttribute('data-remove-id', item.id);
      removeBtn.setAttribute('aria-label', msg.removeBtn);
      var removeIcon = d.createElement('span');
      removeIcon.className = 'gg-icon gg-library-list__remove-icon';
      removeIcon.innerHTML = '<svg class="gg-icon__svg"><use href="#gg-ic-bookmark-remove-line"/></svg>';
      var removeLabel = d.createElement('span');
      removeLabel.className = 'gg-library-list__remove-label';
      removeLabel.textContent = msg.removeBtn;
      removeBtn.appendChild(removeIcon);
      removeBtn.appendChild(removeLabel);
      removeBtn.addEventListener('click', function () {
        GG.core.state.add(removeBtn, 'removed');
        var iconUse = removeBtn.querySelector('.gg-library-list__remove-icon use');
        if (iconUse) {
          iconUse.setAttribute('href', '#gg-ic-check-circle-solid');
        }
        removeBtn.setAttribute('aria-label', msg.removed);
        removeLabel.textContent = msg.removed;
        setTimeout(function () {
          removeById(item.id);
        }, 400);
      });
      li.appendChild(removeBtn);

      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }

  function boot() {
    if (Library._booted) return;
    Library._booted = true;
    init();
    renderList();
  }

  Library.init = init;
  Library.renderList = renderList;
  Library.remove = removeById;
  Library.autoInit = boot;
})(window.GG, window, document);


(function (GG, w, doc) {
  'use strict';

  GG.modules = GG.modules || {};
  GG.config = GG.config || {};

  var STORAGE_KEY = 'gg.lang';

  function initLangSwitcher() {
    var root = doc.querySelector('.gg-lang-switcher');
    if (!root) return;

    var toggleBtn   = root.querySelector('[data-gg-lang-toggle]');
    var menu        = root.querySelector('#gg-lang-switcher-menu');
    var options     = root.querySelectorAll('[data-gg-lang-option]');
    var currentSpan = root.querySelector('[data-gg-lang-current]');

    if (!toggleBtn || !menu || !options.length) return;
    var savedLang   = null;
    try {
      savedLang = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    } catch (e) {}

    var htmlLang    = (doc.documentElement.getAttribute('lang') || 'id').toLowerCase();
    var initialLang = savedLang || GG.config.lang || htmlLang;

    GG.config.lang = initialLang;
    updateUI(initialLang);
    toggleBtn.addEventListener('click', function () {
      var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var code = opt.getAttribute('data-lang-code');
        if (!code) return;

        GG.config.lang = code;

        try {
          if (window.localStorage) {
            localStorage.setItem(STORAGE_KEY, code);
          }
        } catch (e) {}

        updateUI(code);
        closeMenu();
      });
    });
    doc.addEventListener('click', function (evt) {
      if (!root.contains(evt.target)) {
        closeMenu();
      }
    });
    root.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        if (toggleBtn.getAttribute('aria-expanded') === 'true') {
          closeMenu();
          toggleBtn.focus();
        }
      }
    });

    function openMenu() {
      toggleBtn.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }

    function closeMenu() {
      toggleBtn.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }

    function updateUI(langCode) {
      var currentLabel = '';

      options.forEach(function (opt) {
        var code = opt.getAttribute('data-lang-code');
        var selected = code === langCode;

        opt.setAttribute('aria-selected', selected ? 'true' : 'false');

        if (selected && !currentLabel) {
          var nameEl = opt.querySelector('.gg-lang-switcher__option-name');
          currentLabel = nameEl ? nameEl.textContent : code;
        }
      });

      if (currentSpan && currentLabel) {
        currentSpan.textContent = currentLabel;
      }
    }
  }

  GG.modules.langSwitcher = {
    init: initLangSwitcher
  };

})(window.GG, window, document);

(function (GG, w, d) {
  'use strict';

  GG.util = GG.util || {};
  GG.a11y = GG.a11y || {};

  GG.util.getLangPack = function (namespace) {
    var langCode = (GG.config && GG.config.lang) || 'id';
    var packs = GG.lang || {};
    var active = packs[langCode] || packs.id || {};
    var fallback = packs.id || {};
    return active[namespace] || fallback[namespace] || {};
  };
  GG.i18n = GG.i18n || {};
  (function(i18n){
    function loc(){ return i18n._locale || (GG.config && GG.config.lang) || (d.documentElement && d.documentElement.getAttribute('lang')) || 'id'; }
    function tz(){ var s = (GG.store && GG.store.get && GG.store.get()); return i18n._timeZone || (s && s.timeZone) || (w.Intl && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '') || 'UTC'; }
    function rtl(l){ return /^(ar|fa|he|ur|ps|dv|ku|yi)(-|$)/.test((l || '').toLowerCase()); }
    function applyDir(l){ var root = d.documentElement; if(!root) return; var dir = rtl(l) ? 'rtl' : 'ltr'; if(!root.getAttribute('dir')) root.setAttribute('dir', dir); root.dataset.ggDir = dir; }
    function pack(){ var lang = (GG.config && GG.config.lang) || loc(); var packs = GG.lang || {}; return packs[lang] || packs.id || {}; }
    function get(obj, path){ if(!obj || !path) return null; var parts = String(path).split('.'); for(var i=0;i<parts.length;i++){ obj = obj[parts[i]]; if(obj == null) return null; } return obj; }
    i18n.dir = i18n.dir || function(l){ return rtl(l || loc()) ? 'rtl' : 'ltr'; };
    i18n.setLocale = i18n.setLocale || function(l){ if(!l) return loc(); i18n._locale = l; if(GG.config) GG.config.lang = l; if(GG.store && GG.store.set) GG.store.set({ lang: l }); applyDir(l); return l; };
    i18n.setTimeZone = i18n.setTimeZone || function(t){ if(!t) return tz(); i18n._timeZone = t; if(GG.store && GG.store.set) GG.store.set({ timeZone: t }); return t; };
    i18n.t = i18n.t || function(key, fallback, vars){ var val = get(pack(), key); if(val == null) val = fallback; if(val == null) val = ''; val = String(val); if(vars){ Object.keys(vars).forEach(function(k){ val = val.replace(new RegExp('\\{' + k + '\\}','g'), vars[k]); }); } return val; };
    i18n._nf = i18n._nf || {};
    i18n.nf = i18n.nf || function(val, opts){ if(!w.Intl || !Intl.NumberFormat) return String(val); var key = loc() + '|' + JSON.stringify(opts || {}); var fmt = i18n._nf[key] || (i18n._nf[key] = new Intl.NumberFormat(loc(), opts)); return fmt.format(val); };
    i18n.cf = i18n.cf || function(val, currency, opts){ var o = {}, src = opts || {}; for(var k in src) o[k] = src[k]; o.style = 'currency'; o.currency = currency || o.currency || 'USD'; return i18n.nf(val, o); };
    i18n._df = i18n._df || {};
    i18n.df = i18n.df || function(val, opts){ if(!w.Intl || !Intl.DateTimeFormat) return String(val); var o = opts || {}, tzName = o.timeZone || tz(), key = loc() + '|' + tzName + '|' + JSON.stringify(o); if(!i18n._df[key]){ var cfg = { timeZone: tzName }; for(var k in o) cfg[k] = o[k]; i18n._df[key] = new Intl.DateTimeFormat(loc(), cfg); } return i18n._df[key].format(val); };
    i18n._rtf = i18n._rtf || {};
    i18n.rtf = i18n.rtf || function(val, unit, opts){ if(!w.Intl || !Intl.RelativeTimeFormat) return String(val); var key = loc() + '|' + JSON.stringify(opts || {}); var fmt = i18n._rtf[key] || (i18n._rtf[key] = new Intl.RelativeTimeFormat(loc(), opts)); return fmt.format(val, unit); };
    if(!i18n._dirInit){ i18n._dirInit = true; applyDir(loc()); }
  })(GG.i18n);

  GG.util.copyToClipboard = function (text) {
    if (!text) return Promise.reject(new Error('no-text'));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      });
    }
    try {
      var temp = d.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      d.body.appendChild(temp);
      temp.select();
      var ok = false;
      try {
        ok = d.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      d.body.removeChild(temp);
      return ok ? Promise.resolve(true) : Promise.reject(new Error('copy-failed'));
    } catch (err) {
      return Promise.reject(err);
    }
  };

  GG.a11y.setToggle = function (button, isOn) {
    if (!button) return;
    var active = !!isOn;
    GG.core.state.toggle(button, 'active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  };
  GG.services = GG.services || {};
  GG.services.a11y = GG.services.a11y || {};
  GG.a11y = GG.a11y || {};
  (function(a11y, A){
    A._inertStack = A._inertStack || [];
    A._announcer = A._announcer || null;
    A.reducedMotion = A.reducedMotion || {};
    A.reducedMotion.get = A.reducedMotion.get || function(){ return !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches); };
    A.reducedMotion.watch = A.reducedMotion.watch || function(cb){ if(!w.matchMedia) return function(){}; var mq = w.matchMedia('(prefers-reduced-motion: reduce)'); var h = function(e){ if(cb) cb(!!e.matches); }; if(mq.addEventListener) mq.addEventListener('change', h); else if(mq.addListener) mq.addListener(h); return function(){ if(mq.removeEventListener) mq.removeEventListener('change', h); else if(mq.removeListener) mq.removeListener(h); }; };
    A.announce = A.announce || function(message, opts){ if(message === undefined || message === null) return; var el = A._announcer || d.querySelector('.gg-sr-announcer,[data-gg-announcer]'); if(!el){ if(!d.body) return; el = d.createElement('div'); el.className = 'gg-sr-announcer gg-visually-hidden'; el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true'); d.body.appendChild(el); } A._announcer = el; el.setAttribute('aria-live', (opts && opts.politeness) || el.getAttribute('aria-live') || 'polite'); el.textContent = ''; setTimeout(function(){ el.textContent = String(message); }, 10); };
    function setInert(el, inert){ if(!el || el.nodeType !== 1) return null; var prev = { el: el, aria: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') }; if(inert){ el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); }else{ if(prev.aria === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', prev.aria); if(prev.inert) el.setAttribute('inert',''); else el.removeAttribute('inert'); } return prev; }
    A.inert = A.inert || function(root, keep){ var host = root || d.body || d.documentElement; if(!host) return null; var kids = Array.prototype.slice.call(host.children || []); var record = []; kids.forEach(function(el){ if(!el || el === keep) return; record.push(setInert(el, true)); }); A._inertStack.push(record); return record; };
    A.restoreInert = A.restoreInert || function(){ var record = A._inertStack.pop(); if(!record) return; record.forEach(function(item){ if(item && item.el) setInert(item.el, false); }); };
    A.focusTrap = A.focusTrap || function(container, opts){ if(!container) return function(){}; var options = opts || {}; var selector = options.selector || 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex=\"-1\"])'; function focusables(){ return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function(el){ return el.offsetParent !== null && !el.hasAttribute('disabled'); }); } function onKey(e){ if(e.key !== 'Tab') return; var list = focusables(); if(!list.length){ container.focus(); e.preventDefault(); return; } var first = list[0]; var last = list[list.length - 1]; if(e.shiftKey && d.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && d.activeElement === last){ e.preventDefault(); first.focus(); } } container.addEventListener('keydown', onKey); if(options.autofocus !== false){ var list = focusables(); if(list[0]) list[0].focus(); } return function(){ container.removeEventListener('keydown', onKey); }; };
    A.init = A.init || function(){ if(A._init) return; A._init = true; function sync(val){ if(GG.store && GG.store.set) GG.store.set({ reducedMotion: !!val }); if(GG.ui && GG.ui.applyRootState && GG.store && GG.store.get) GG.ui.applyRootState(d.documentElement, GG.store.get()); else if(d.documentElement) GG.core.state.toggle(d.documentElement, 'reduced-motion', !!val); } var initial = A.reducedMotion.get(); sync(initial); A._rmUnsub = A.reducedMotion.watch(sync); };
    a11y.announce = a11y.announce || function(message, opts){ return A.announce(message, opts); };
    a11y.focusTrap = a11y.focusTrap || function(container, opts){ return A.focusTrap(container, opts); };
    a11y.inertManager = a11y.inertManager || { push: function(root, keep){ return A.inert(root, keep); }, pop: function(){ return A.restoreInert(); }, clear: function(){ while(A._inertStack.length) A.restoreInert(); } };
    a11y.reducedMotion = a11y.reducedMotion || { get: function(){ return A.reducedMotion.get(); }, watch: function(cb){ return A.reducedMotion.watch(cb); } };
  })(GG.a11y, GG.services.a11y);

})(window.GG, window, document);

(function (GG) {
  'use strict';

  GG.lang = GG.lang || {};
  GG.lang.id = GG.lang.id || {
    actions: {
      comments: 'Komentar',
      share: 'Bagikan',
      bookmark_add: 'Tambahkan ke Library',
      bookmark_inLibrary: 'Dalam Library',
      menu_more: 'Menu lainnya'
    },
    library: {
      empty: 'Belum ada postingan di Library.',
      hint: 'Simpan postingan yang ingin kamu baca nanti. Klik tombol “Tambahkan ke Library” di setiap kartu postingan.',
      remove_button: 'Hapus dari Library',
      toast_saved: 'Disimpan ke Library',
      toast_removed: 'Dihapus dari Library'
    },
    share: {
      copied: 'Link disalin',
      copy_error: 'Gagal menyalin link',
      cta_poster: 'Bagikan sebagai poster',
      cta_link: 'Salin tautan',
      cta_story: 'Bagikan ke Story',
      cta_download: 'Unduh poster',
      download_success: 'Poster diunduh',
      download_error: 'Poster gagal diunduh',
      hint_mobile: 'Bagikan ke Story = Mobile',
      hint_desktop: 'Unduh poster = Desktop'
    },
    loadmore: {
      default: 'Load more posts',
      loading: 'Memuat postingan...'
    },
    tags: {
      directoryTitle: 'Tag',
      directoryDescription: 'Jelajahi artikel berdasarkan topik.',
      pagePrefix: 'Tag: ',
      pageSubtitlePrefix: 'Artikel dengan tag ',
      emptyMessage: 'Belum ada artikel dengan tag ini.',
      errorMessage: 'Tag tidak dapat dimuat. Coba segarkan halaman.',
      breadcrumbTagsLabel: 'tags'
    },
    toast: {
      default_message: 'Berhasil disimpan.',
      error_generic: 'Terjadi kesalahan. Coba lagi nanti.'
    }
  };
  GG.lang.en = GG.lang.en || {
    actions: {
      comments: 'Comments',
      share: 'Share',
      bookmark_add: 'Add to Library',
      bookmark_inLibrary: 'In Library',
      menu_more: 'More options'
    },
    library: {
      empty: 'There are no posts in your Library yet.',
      hint: 'Save posts you want to read later. Click the “Add to Library” button on any post card.',
      remove_button: 'Remove from Library',
      toast_saved: 'Saved to Library',
      toast_removed: 'Removed from Library'
    },
    share: {
      copied: 'Link copied',
      copy_error: 'Unable to copy the link',
      cta_poster: 'Share as a poster',
      cta_link: 'Copy link',
      cta_story: 'Share to Story',
      cta_download: 'Download poster',
      download_success: 'Poster downloaded',
      download_error: 'Poster could not be downloaded',
      hint_mobile: 'Share to Story = Mobile',
      hint_desktop: 'Download poster = Desktop'
    },
    loadmore: {
      default: 'Load more posts',
      loading: 'Loading posts...'
    },
    tags: {
      directoryTitle: 'Tags',
      directoryDescription: 'Browse articles by topic.',
      pagePrefix: 'Tag: ',
      pageSubtitlePrefix: 'Articles with the tag ',
      emptyMessage: 'There are no articles with this tag yet.',
      errorMessage: 'Tags could not be loaded. Please refresh the page.',
      breadcrumbTagsLabel: 'tags'
    },
    toast: {
      default_message: 'Saved successfully.',
      error_generic: 'Something went wrong. Please try again later.'
    }
  };

})(window.GG);

(function (w) {
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.config = GG.config || {};
  GG.util = GG.util || {};
  GG.state = GG.state || {};
  GG.data = GG.data || {};
  GG.a11y = GG.a11y || {};
  GG.lang = GG.lang || {};
  var doc = w.document;
  var htmlLang = (doc && doc.documentElement && doc.documentElement.getAttribute('lang')) || 'id';
  GG.config.lang = (GG.config.lang || htmlLang || 'id').toLowerCase();
})(window);

(function(){
  var GG = window.GG = window.GG || {};
  GG.a11y = GG.a11y || {};
  GG.state = GG.state || {};
  function normSpace(s){ return (s||'').replace(/\s+/g,' ').trim(); }
  function getLabel(el){
    if(!el) return '';
    var lbl = normSpace(el.getAttribute('aria-label'));
    if(lbl) return lbl;
    var by = el.getAttribute('aria-labelledby');
    if(by){
      var ref = document.getElementById(by);
      if(ref) {
        var t = normSpace(ref.textContent);
        if(t) return t;
      }
    }
    var t = normSpace(el.getAttribute('title'));
    if(t) return t;
    var txt = normSpace(el.textContent);
    if(txt) return txt;
    var img = el.querySelector('img[alt]');
    if(img){
      var a = normSpace(img.getAttribute('alt'));
      if(a) return a;
    }
    var data = normSpace(el.getAttribute('data-label'));
    if(data) return data;
    var href = normSpace(el.getAttribute('href'));
    if(href){
      try{
        var u = new URL(href, location.href);
        var path = u.pathname.replace(/\/+$/,'');
        var last = path.split('/').filter(Boolean).pop();
        if(last) return last.replace(/[-_]/g,' ');
        if(u.host) return u.host;
      }catch(e){}
    }
    return 'Link';
  }

  function hasDiscernibleName(a){
    if(!a) return true;
    if(normSpace(a.getAttribute('aria-label'))) return true;
    if(normSpace(a.getAttribute('title'))) return true;
    var txt = normSpace(a.textContent);
    if(txt) return true;
    var img = a.querySelector('img[alt]:not([alt=""])');
    if(img) return true;
    return false;
  }

  function fixLinkNames(){
    var links = document.querySelectorAll('a[href]');
    for(var i=0;i<links.length;i++){
      var a = links[i];
      if(hasDiscernibleName(a)) continue;
      var lbl = getLabel(a);
      if(lbl){
        a.removeAttribute('aria-labelledby');
        a.setAttribute('aria-label', lbl);
      }
    }
  }

  function fixIdenticalLinks(){
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href]'));
    var groups = Object.create(null);
    var chromeSel = 'header,nav,footer,.gg-footer,.gg-toolbar,.gg-sidebar,.gg-panel,.gg-comments,.gg-lt,.gg-toc,.gg-nav,.gg-post-card,.gg-post-card__meta,.gg-post-card__body';

    function isIconLike(a){
      if(!a) return false;
      var txt = normSpace(a.textContent);
      if(txt) return false;
      if(a.querySelector('svg, img, .gg-icon, [class*="icon"], [data-icon]')) return true;
      return false;
    }

    for(var i=0;i<links.length;i++){
      var a = links[i];
      var href;
      try{ href = new URL(a.getAttribute('href'), location.href).href; }
      catch(e){ href = a.getAttribute('href'); }
      (groups[href] = groups[href] || []).push(a);
    }

    Object.keys(groups).forEach(function(href){
      var g = groups[href];
      if(g.length < 2) return;

      var labels = g.map(getLabel);
      var uniq = Object.create(null);
      labels.forEach(function(l){ uniq[l] = true; });
      var keys = Object.keys(uniq);
      if(keys.length <= 1) return;
      var best = labels
        .filter(function(l){ return l && l !== 'Link' && l.length >= 2; })
        .sort(function(a,b){ return b.length - a.length; })[0] || labels[0] || 'Link';
      var primary = null;
      for(var j=0;j<g.length;j++){
        var a0 = g[j];
        var t0 = normSpace(a0.textContent);
        if(t0 && t0.length === best.length && t0.toLowerCase() === best.toLowerCase()){
          primary = a0; break;
        }
      }
      if(!primary){
        for(var k=0;k<g.length;k++){
          if(!isIconLike(g[k])){ primary = g[k]; break; }
        }
      }
      primary = primary || g[0];
      g.forEach(function(a){
        if(a === primary){
          a.removeAttribute('aria-labelledby');
          a.setAttribute('aria-label', best);
          return;
        }

        var inChrome = a.closest && a.closest(chromeSel);
        if(inChrome && isIconLike(a)){
          a.setAttribute('aria-hidden','true');
          a.setAttribute('tabindex','-1');
          a.setAttribute('data-gg-a11y-hidden','1');
          return;
        }

        a.removeAttribute('aria-labelledby');
        a.setAttribute('aria-label', best);
      });
    });
  }


  function removeEmptyHeadings(){
    var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    for(var i=0;i<hs.length;i++){
      var h = hs[i];
      var txt = normSpace(h.textContent);
      if(!txt){
        if(h.parentNode) h.parentNode.removeChild(h);
      }
    }
  }

  function fixTouchTargets(){
    var chromeSel = 'header,nav,footer,.gg-footer,.gg-toolbar,.gg-sidebar,.gg-panel,.gg-comments,.gg-lt,.gg-toc,.gg-nav,.gg-post-card,.gg-post-card__meta,.gg-post-card__label,.gg-post-card__body,.gg-post-card__thumb,.post-body,.post,.blog-posts,.widget,.widget-content';
    var els = document.querySelectorAll('a[href],button,[role="button"],summary,input[type="button"],input[type="submit"],[tabindex]:not([tabindex="-1"])');
    for(var i=0;i<els.length;i++){
      var el = els[i];
      if(!el.closest || !el.closest(chromeSel)) continue;
      if(el.getClientRects && el.getClientRects().length===0) continue;
      var cs = window.getComputedStyle ? getComputedStyle(el) : null;
      if(cs && (cs.display==='none' || cs.visibility==='hidden')) continue;

      var r = el.getBoundingClientRect();
      if((r.width && r.width < 48) || (r.height && r.height < 48)){
        el.classList.add('gg-touch');
      }
    }
  }

  function run(){
    removeEmptyHeadings();
    fixLinkNames();
    fixIdenticalLinks();
    fixTouchTargets();
  }

  GG.a11y.run = run;

  function scheduleRun(){
    if(scheduleRun._t) return;
    scheduleRun._t = setTimeout(function(){
      scheduleRun._t = 0;
      try{ run(); }catch(e){}
    }, 120);
  }

  function init(){
    if (GG.state.a11yFixBooted) {
      run();
      return;
    }
    GG.state.a11yFixBooted = true;

    run();
    scheduleRun();

    if(window.MutationObserver){
      var mo = new MutationObserver(function(){
        scheduleRun();
      });
      try{
        mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['href','aria-label','aria-labelledby','class','style']});
      }catch(e){}
    }

    window.addEventListener('load', function(){ scheduleRun(); }, {once:true});
  }

  GG.modules = GG.modules || {};
  GG.modules.a11yFix = GG.modules.a11yFix || {};
  GG.modules.a11yFix.init = GG.modules.a11yFix.init || function(){ init(); };
  GG.modules.a11yFix.run = GG.modules.a11yFix.run || function(){ run(); };
  GG.a11y.run = GG.a11y.run || function(){ try{ run(); }catch(e){} };
})();

(function(){
  var GG = window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.state = GG.state || {};

  function setDims(img){
    try{
      if(!img || img.nodeType !== 1) return;
      if(img.hasAttribute('width') && img.hasAttribute('height')) return;

      var w = img.naturalWidth, h = img.naturalHeight;
      if(w && h){
        img.setAttribute('width', w);
        img.setAttribute('height', h);
      }
    }catch(e){}
  }

  function scan(root){
    root = root || document;
    var imgs = root.querySelectorAll('img:not([width]):not([height])');
    for(var i=0;i<imgs.length;i++){
      var img = imgs[i];
      if(img.complete) setDims(img);
      else img.addEventListener('load', function(){ setDims(this); }, {once:true});
    }
  }

  function init(root){
    if (GG.state.imgDimsBooted) return;
    GG.state.imgDimsBooted = true;
    scan(root || document);
  }

  GG.modules.imgDims = GG.modules.imgDims || {};
  GG.modules.imgDims.init = GG.modules.imgDims.init || init;

})();


})(window);
