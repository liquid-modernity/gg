(function(w, d){
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
var useListingRoot = GG.core.isProdHost(hostname) && GG.core.hasWorker && GG.core.hasWorker();
if (useListingRoot) {
  var root = base.replace(/\/+$/, '');
  return root || '/';
}
return base + '?view=blog';
};
GG.core.landingPath = GG.core.landingPath || function(basePath, hostname){
var base = (typeof basePath === 'string' && basePath) ? basePath : '/';
if (base.charAt(0) !== '/') base = '/' + base;
if (base.charAt(base.length - 1) !== '/') base += '/';
var useLandingPath = GG.core.isProdHost(hostname) && GG.core.hasWorker && GG.core.hasWorker();
if (useLandingPath) {
  var root = base.replace(/\/+$/, '');
  if (!root) return '/landing';
  return root + '/landing';
}
return base + '?view=landing';
};
GG.core.isBlogHomePath = GG.core.isBlogHomePath || function(pathname, search, hostname){
var path = (pathname || '').replace(/\/+$/, '') || '/';
var view = '';
try { view = (new URLSearchParams(search || '').get('view') || '').toLowerCase(); } catch (_) {}
if (path === '/landing') return false;
if (path === '/blog') return true;
if (path === '/' && view !== 'landing') return true;
return false;
};
GG.core.detectSpecialKind = GG.core.detectSpecialKind || function(pathname){
var path = String(pathname || '').toLowerCase();
if (!path) return '';
if (path.indexOf('/p/tags.html') === 0) return 'tags';
if (path.indexOf('/p/sitemap.html') === 0) return 'sitemap';
if (path.indexOf('/p/library.html') === 0) return 'library';
if (path.indexOf('/p/store.html') === 0) return 'store';
if (path.indexOf('/p/portfolio.html') === 0) return 'portfolio';
if (path.indexOf('/p/author.html') === 0) return 'author';
return '';
};
GG.core.isOfflinePath = GG.core.isOfflinePath || function(pathname, view){
var path = (pathname || '').replace(/\/+$/, '') || '/';
var mode = String(view || '').toLowerCase();
return path === '/offline' || mode === 'offline';
};
GG.core.inferRoute = GG.core.inferRoute || function(url, fallback){
var out = { surface: 'post', page: 'post', view: 'post', special: '' };
if (fallback && typeof fallback === 'object') {
  if (fallback.surface) out.surface = String(fallback.surface);
  if (fallback.page) out.page = String(fallback.page);
  if (fallback.view) out.view = String(fallback.view);
  if (fallback.special) out.special = String(fallback.special);
}
try {
  var u = new URL(url || (w.location ? w.location.href : '/'), w.location ? w.location.href : undefined);
  var path = (u.pathname || '').replace(/\/+$/, '') || '/';
  var viewParam = (u.searchParams.get('view') || '').toLowerCase();
  var isBlogHome = (GG.core && GG.core.isBlogHomePath)
    ? GG.core.isBlogHomePath(path, u.search || '', u.hostname || (w.location ? w.location.hostname : ''))
    : (path === '/blog' || (path === '/' && viewParam !== 'landing'));
  var isOffline = (GG.core && GG.core.isOfflinePath) ? GG.core.isOfflinePath(path, viewParam) : (path === '/offline');
  var special = (GG.core && GG.core.detectSpecialKind) ? GG.core.detectSpecialKind(path) : '';
  if (isOffline) out.surface = 'offline';
  else if (path === '/404' || path === '/404.html') out.surface = 'error';
  else if (isBlogHome) out.surface = 'listing';
  else if (path === '/landing' || (path === '/' && viewParam === 'landing')) out.surface = 'landing';
  else if (path.indexOf('/search') === 0) out.surface = 'listing';
  else if (special) out.surface = 'special';
  else if (path.indexOf('/p/') === 0) out.surface = 'page';
  else if (/^\/\d{4}\/\d{2}\//.test(path)) out.surface = 'post';
  out.special = special || '';
  if (out.surface === 'landing') out.page = 'home';
  else if (out.surface === 'listing') out.page = 'listing';
  else if (out.surface === 'special') out.page = 'special';
  else if (out.surface === 'error') out.page = 'error';
  else if (out.surface === 'offline') out.page = 'offline';
  else if (out.surface === 'page') out.page = 'page';
  else out.page = 'post';
  if (out.surface === 'error') out.view = 'error';
  else if (out.surface === 'offline') out.view = 'offline';
  else if (out.surface === 'landing') out.view = 'home';
  else if (out.surface === 'special') out.view = 'special';
  else if (out.surface === 'page') out.view = 'page';
  else if (out.surface === 'post') out.view = 'post';
  else if (out.surface === 'listing') {
    if (isBlogHome) out.view = 'listing';
    else if (path.indexOf('/search/label/') === 0 || (path.indexOf('/search') === 0 && u.searchParams.get('label'))) out.view = 'label';
    else if (path.indexOf('/search') === 0 && (u.searchParams.get('updated-max') || u.searchParams.get('updated-min'))) out.view = 'archive';
    else if (path.indexOf('/search') === 0) out.view = 'search';
    else out.view = 'listing';
  }
} catch (_) {}
return out;
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
  var hasMobileParam = params.get('m') === '1';
  var hash = loc.hash || '';
  var dest = '';
  if (workerOk && isProd) {
    if (path === '/blog' || (path === '/' && view === 'blog')) {
      dest = '/';
    } else if (path === '/landing' || (path === '/' && view === 'landing')) {
      dest = '/landing';
    } else {
      return;
    }
    if (hasMobileParam) dest += '?m=1';
    if (hash) dest += hash;
    if (w.history && w.history.replaceState) w.history.replaceState(w.history.state || {}, '', dest);
    return;
  }
  if (path === '/blog') params.set('view', 'blog');
  else if (path === '/landing') params.set('view', 'landing');
  else return;
  var fallback = '/?' + params.toString();
  if (hash) fallback += hash;
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
function parseHtmlDoc(html,url){
if(!html) return null;
var MAX=2*1024*1024;
if(String(html).length>MAX) return null;
try{
if(url){
var u=new URL(url,w.location&&w.location.href?w.location.href:'');
if(u.origin!==(w.location&&w.location.origin?w.location.origin:'')) return null;
}
}catch(_){}
if(!w.DOMParser) return null;
// @gg-allow-html-in-js LEGACY:LEGACY-0013
return new DOMParser().parseFromString(String(html),'text/html');
}
GG.core.parseHtmlDoc = GG.core.parseHtmlDoc || parseHtmlDoc;
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
  var doc = parseHtmlDoc(html, url);
  if (!doc) throw fail('parse', { url: url });
  var source = findTarget(doc);
  var target = findTarget(w.document);
  if (!source || !target) throw fail('target', { url: url });
  var meta = extractMeta(doc);
  function cloneSwapContent(srcEl){
    var frag = w.document.createDocumentFragment();
    var nodes = Array.prototype.slice.call(srcEl.childNodes || []);
    function neutralizeScripts(node){
      if (!node || node.nodeType !== 1) return;
      var tag = String(node.tagName || '').toLowerCase();
      if (tag === 'script') {
        node.type = 'text/plain';
        node.setAttribute('data-gg-inert', '1');
      }
      var scripts = node.querySelectorAll ? node.querySelectorAll('script') : [];
      for (var i = 0; i < scripts.length; i++) {
        scripts[i].type = 'text/plain';
        scripts[i].setAttribute('data-gg-inert', '1');
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      var cloned = nodes[i].cloneNode(true);
      neutralizeScripts(cloned);
      frag.appendChild(cloned);
    }
    return frag;
  }
  function showSwapFailToast(){
    if (GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function') {
      try { GG.ui.toast.show('Failed to load, retry'); } catch (_) {}
    }
  }
  function replaceWithFragment(targetEl, frag){
    if (!targetEl || !frag) return;
    if (typeof targetEl.replaceChildren === 'function') {
      targetEl.replaceChildren(frag);
      return;
    }
    while (targetEl.firstChild) targetEl.removeChild(targetEl.firstChild);
    targetEl.appendChild(frag);
  }
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
  function resolveMainScope(targetEl){
    var main = null;
    if (targetEl && typeof targetEl.closest === 'function') {
      main = targetEl.closest('main.gg-main[data-gg-surface]') || targetEl.closest('main.gg-main') || targetEl.closest('main');
    }
    if (!main) {
      main = w.document.querySelector('main.gg-main[data-gg-surface]') ||
             w.document.querySelector('main.gg-main') ||
             findTarget(w.document);
    }
    return main || targetEl || w.document;
  }
  function clearRehydrateFlags(mainScope){
    if (!mainScope || !mainScope.querySelectorAll) return;
    var areas = mainScope.querySelectorAll('.post-body, .entry-content');
    var i = 0;
    for (; i < areas.length; i++) {
      areas[i].removeAttribute('data-gg-shortcodes-done');
    }
    var a11yBound = mainScope.querySelectorAll('.gg-yt-lite[data-gg-a11y-bound], .gg-sc-accordion[data-gg-a11y-bound], [data-gg-acc][data-gg-a11y-bound]');
    for (i = 0; i < a11yBound.length; i++) {
      a11yBound[i].removeAttribute('data-gg-a11y-bound');
    }
    var bound = mainScope.querySelectorAll('[data-gg-bound-load-more]');
    for (i = 0; i < bound.length; i++) {
      bound[i].removeAttribute('data-gg-bound-load-more');
    }
  }
  function runAfterSwapRehydrate(mainScope){
    if (!mainScope || !GG.modules) return;
    if (GG.modules.ShortcodesV2 && typeof GG.modules.ShortcodesV2.transformArea === 'function') {
      try { GG.modules.ShortcodesV2.transformArea(mainScope); } catch (_) {}
    }
    if (GG.modules.ShortcodesV2 && typeof GG.modules.ShortcodesV2.bindA11y === 'function') {
      try { GG.modules.ShortcodesV2.bindA11y(mainScope); } catch (_) {}
    }
    if (GG.modules.TOC && typeof GG.modules.TOC.reset === 'function') {
      try { GG.modules.TOC.reset(mainScope); } catch (_) {}
    }
    if (GG.modules.TOC && typeof GG.modules.TOC.build === 'function') {
      try { GG.modules.TOC.build(mainScope, { headings: 'h1,h2,h3,h4' }); } catch (_) {}
    }
    if (GG.modules.Comments && typeof GG.modules.Comments.reset === 'function') {
      try { GG.modules.Comments.reset(mainScope); } catch (_) {}
    }
  }
  var doSwap = function(){
    var body = w.document && w.document.body;
    var prevVisibility = (target && target.style) ? target.style.visibility : '';
    var swapped = false;
    var mainScope = null;
    try {
      var frag = cloneSwapContent(source);
      if (!frag || !frag.childNodes || !frag.childNodes.length) throw fail('swap-empty', { url: url });
      replaceWithFragment(target, frag);
      swapped = true;
      mainScope = resolveMainScope(target);
      clearRehydrateFlags(mainScope);
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
      runAfterSwapRehydrate(mainScope);
      GG.core.render._lastUrl = url || '';
      GG.core.render._lastAt = Date.now();
    } catch (err) {
      showSwapFailToast();
      throw (err && err.code) ? err : fail('swap', { url: url, error: err && err.message ? err.message : '' });
    } finally {
      if (body) {
        if (body.classList) body.classList.remove('is-loading');
        else body.className = body.className.replace(/\bis-loading\b/g, ' ').trim();
        if (GG.core && GG.core.state) GG.core.state.remove(body, 'loading');
      }
      if (!swapped && target && target.style) target.style.visibility = prevVisibility || '';
    }
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
var main = w.document && w.document.querySelector ? w.document.querySelector('main.gg-main[data-gg-surface],main.gg-main,#gg-main') : null;
if (!body && !main) return '';
var href = url || w.location.href;
var route = (GG.core && GG.core.inferRoute)
  ? GG.core.inferRoute(href, { surface: 'post', page: 'post', view: 'post', special: '' })
  : { surface: 'post', page: 'post', view: 'post', special: '' };
var surface = route.surface || 'post';
var page = route.page || (surface === 'landing' ? 'home' : surface);
var view = route.view || (surface === 'landing' ? 'home' : surface);
var special = route.special || '';
var isHomeSurface = (surface === 'landing' || surface === 'listing');
if (body) {
  if (body.classList) body.classList.remove('gg-is-landing');
  else body.className = body.className.replace(/\bgg-is-landing\b/g, '').trim();
  body.setAttribute('data-gg-surface', surface);
  body.setAttribute('data-gg-page', page);
  body.setAttribute('data-gg-view', view);
  if (special) body.setAttribute('data-gg-special', special);
  else body.removeAttribute('data-gg-special');
  if (surface === 'landing') {
    if (body.classList) body.classList.add('gg-is-landing');
    else if (!/\bgg-is-landing\b/.test(body.className)) body.className = (body.className + ' gg-is-landing').trim();
  }
}
if (main) {
  main.setAttribute('data-gg-surface', surface);
  main.setAttribute('data-gg-page', page);
  main.setAttribute('data-gg-view', view);
  if (isHomeSurface) {
    main.setAttribute('data-gg-home-state', surface === 'landing' ? 'landing' : 'blog');
    main.setAttribute('data-gg-home-root', '1');
  } else {
    main.removeAttribute('data-gg-home-state');
    main.removeAttribute('data-gg-home-root');
  }
  if (special) main.setAttribute('data-gg-special', special);
  else main.removeAttribute('data-gg-special');
}
if (GG.ui && GG.ui.layout && typeof GG.ui.layout.applySurface === 'function') {
try { GG.ui.layout.applySurface(surface, null, href); } catch (_) {}
}
if (GG.core && GG.core.routerCtx && typeof GG.core.routerCtx.refresh === 'function') {
  try { GG.core.routerCtx.refresh(href); } catch (_) {}
}
return surface;
};
GG.core.init = GG.core.init || function(){
if (GG.core._init) return;
GG.core._init = true;
if (GG.core.surface && GG.core.surface.update) GG.core.surface.update(w.location.href);
if (GG.core.routerCtx && typeof GG.core.routerCtx.refresh === 'function') {
  try { GG.core.routerCtx.refresh(w.location.href); } catch (_) {}
}
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
  var pre = 'blog';
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
      var isBlog = (GG.core && GG.core.isBlogHomePath) ? GG.core.isBlogHomePath(p, search, w.location ? w.location.hostname : '') : (p === '/');
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

GG.core.routerCtx = GG.core.routerCtx || (function(){
var cache = null;
var VIEW_SET = { error:1, offline:1, home:1, label:1, search:1, archive:1, listing:1, post:1, page:1, special:1 };
function low(v){ return String(v || '').toLowerCase().trim(); }
function attr(el, name){
  if (!el || !el.getAttribute) return '';
  return low(el.getAttribute(name) || '');
}
function boolish(v){
  var s = low(v);
  return s === '1' || s === 'true' || s === 'yes';
}
function pickMain(doc){
  if (!doc || !doc.querySelector) return null;
  return doc.querySelector('main.gg-main[data-gg-view],main.gg-main[data-gg-surface],main.gg-main,#gg-main');
}
function detectView(main, body, url){
  var view = attr(main, 'data-gg-view') || attr(body, 'data-gg-view');
  if (VIEW_SET[view]) return view;
  var surface = attr(main, 'data-gg-surface') || attr(body, 'data-gg-surface');
  if (surface === 'error') return 'error';
  if (surface === 'offline') return 'offline';
  if (surface === 'landing' || surface === 'home') return 'home';
  if (surface === 'listing' || surface === 'feed') return 'listing';
  if (surface === 'special') return 'special';
  if (surface === 'post') return 'post';
  if (surface === 'page') return 'page';
  try {
    var u = new URL(url || (w.location ? w.location.href : '/'), w.location ? w.location.href : undefined);
    var path = low(u.pathname || '/');
    if (path === '/offline') return 'offline';
    if (path === '/404' || path === '/404.html') return 'error';
    if (path.indexOf('/search/label/') === 0) return 'label';
    if (path.indexOf('/search') === 0) {
      if (u.searchParams.get('label')) return 'label';
      if (u.searchParams.get('updated-max') || u.searchParams.get('updated-min')) return 'archive';
      return 'search';
    }
    if (GG.core && GG.core.detectSpecialKind && GG.core.detectSpecialKind(path)) return 'special';
    if (path === '/landing') return 'home';
    if (path === '/' || path === '/blog') return 'listing';
    if (path.indexOf('/p/') === 0) return 'page';
    if (/^\/\d{4}\/\d{2}\//.test(path)) return 'post';
  } catch (_) {}
  return 'listing';
}
function detectDevice(main, body){
  var device = attr(main, 'data-gg-device') || attr(body, 'data-gg-device');
  if (device === 'mobile' || device === 'desktop') return device;
  if (w.matchMedia) {
    try { return w.matchMedia('(max-width: 920px)').matches ? 'mobile' : 'desktop'; } catch (_) {}
  }
  return 'desktop';
}
function detectSbMode(main, doc){
  var mode = attr(main, 'data-gg-sb-mode');
  if (mode) return mode;
  var left = doc && doc.querySelector ? doc.querySelector('.gg-leftnav[data-gg-sb-mode]') : null;
  mode = attr(left, 'data-gg-sb-mode');
  if (mode) return mode;
  var view = detectView(main, doc && doc.body ? doc.body : null, w.location && w.location.href ? w.location.href : '');
  return (view === 'post' || view === 'page') ? 'post' : 'list';
}
function read(url, doc){
  var ref = doc || d;
  var main = pickMain(ref);
  var body = ref && ref.body ? ref.body : d.body;
  var ctx = {
    url: url || (w.location ? w.location.href : ''),
    view: detectView(main, body, url),
    device: detectDevice(main, body),
    preview: boolish(attr(main, 'data-gg-preview') || attr(body, 'data-gg-preview')),
    layout: boolish(attr(main, 'data-gg-layout') || attr(body, 'data-gg-layout')),
    sbMode: detectSbMode(main, ref),
    label: (main && main.getAttribute ? (main.getAttribute('data-gg-label') || '') : '') || (body && body.getAttribute ? (body.getAttribute('data-gg-label') || '') : ''),
    query: (main && main.getAttribute ? (main.getAttribute('data-gg-query') || '') : '') || (body && body.getAttribute ? (body.getAttribute('data-gg-query') || '') : ''),
    page: attr(main, 'data-gg-page') || attr(body, 'data-gg-page'),
    surface: attr(main, 'data-gg-surface') || attr(body, 'data-gg-surface'),
  };
  ctx.isDetail = ctx.view === 'post' || ctx.view === 'page';
  ctx.isListing = ctx.view === 'listing' || ctx.view === 'label' || ctx.view === 'search' || ctx.view === 'archive';
  ctx.isHome = ctx.view === 'home';
  ctx.isSystem = ctx.sbMode === 'system';
  return ctx;
}
function arr(v){
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return [v];
  return [];
}
function matches(rule, ctx){
  if (!rule) return true;
  var c = ctx || cache || read();
  var views = arr(rule.views);
  if (views.length && views.indexOf(c.view) === -1) return false;
  var devices = arr(rule.devices);
  if (devices.length && devices.indexOf(c.device) === -1) return false;
  var sbModes = arr(rule.sbModes);
  if (sbModes.length && sbModes.indexOf(c.sbMode) === -1) return false;
  if (rule.system === true && c.sbMode !== 'system') return false;
  if (rule.system === false && c.sbMode === 'system') return false;
  if (typeof rule.preview === 'boolean' && c.preview !== rule.preview) return false;
  if (typeof rule.layout === 'boolean' && c.layout !== rule.layout) return false;
  return true;
}
function refresh(url, doc){
  cache = read(url, doc);
  if (GG.state) GG.state.routerCtx = cache;
  return cache;
}
function current(){
  return cache || refresh(w.location ? w.location.href : '', d || w.document || document);
}
return { read: read, refresh: refresh, current: current, matches: matches };
})();
})(window, document);

GG.store.set({
lang: 'en',
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
function scheduleRouteA11y(){
  var raf = w.requestAnimationFrame || function(fn){ return w.setTimeout(fn, 16); };
  raf(function(){
    raf(function(){
      focusMain(true);
      var title = (d.title || '').trim();
      if (!title) return;
      if (GG.services && GG.services.a11y && typeof GG.services.a11y.announce === 'function') {
        GG.services.a11y.announce('Dibuka: ' + title, { politeness:'polite' });
      }
    });
  });
}
function ensureMainFocusTarget(){
  var main = d.getElementById('gg-main') || d.querySelector('main.gg-main');
  if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  return main || null;
}
function focusMain(preventScroll){
  var main = ensureMainFocusTarget();
  if (!main) return null;
  if (preventScroll) {
    try { main.focus({preventScroll:true}); } catch (_) { try { main.focus(); } catch(__){} }
  } else {
    try { main.focus(); } catch (_) {}
  }
  return main;
}
function bindSkipLink(){
  if (actions._skipLinkBound) return;
  actions._skipLinkBound = true;
  d.addEventListener('click', function(evt){
    var link = evt && evt.target && evt.target.closest ? evt.target.closest('a.gg-skip-link[href="#gg-main"],a.gg-skiplink[href="#gg-main"]') : null;
    if (!link) return;
    evt.preventDefault();
    var main = ensureMainFocusTarget();
    if (!main) return;
    try {
      if (w.location.hash !== '#gg-main') w.location.hash = 'gg-main';
    } catch (_) {}
    if (typeof main.scrollIntoView === 'function') {
      try { main.scrollIntoView({ block:'start', behavior:'auto' }); } catch (_) { try { main.scrollIntoView(true); } catch(__){} }
    }
    focusMain(true);
  }, true);
}
function closeActiveModalForRoute(){
  var a11y = GG.services && GG.services.a11y;
  if (!a11y || !a11y._activeModalEl || typeof a11y.modalClose !== 'function') return;
  try { a11y.modalClose(a11y._activeModalEl, { restoreFocus: false }); } catch (_) {}
}
function patchRouteA11y(){
  var router = GG.core && GG.core.router;
  if (!router || router._a11yRoutePatched) return;
  var prevOnNavigate = typeof router.onNavigate === 'function' ? router.onNavigate : null;
  var prevOnPopState = typeof router.onPopState === 'function' ? router.onPopState : null;
  router.onNavigate = function(){
    if (prevOnNavigate) {
      try { prevOnNavigate.apply(this, arguments); } catch (_) {}
    }
    closeActiveModalForRoute();
    scheduleRouteA11y();
  };
  router.onPopState = function(){
    if (prevOnPopState) {
      try { prevOnPopState.apply(this, arguments); } catch (_) {}
    }
    closeActiveModalForRoute();
    scheduleRouteA11y();
  };
  router._a11yRoutePatched = true;
}
function initRouteA11yBindings(){
  patchRouteA11y();
  bindSkipLink();
}
if (GG.boot && GG.boot.onReady) GG.boot.onReady(initRouteA11yBindings);
else if (GG.boot && GG.boot.defer) GG.boot.defer(initRouteA11yBindings);
else w.setTimeout(initRouteA11yBindings, 1);
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
ui.overlay.open = ui.overlay.open || function(){ var el = d.getElementById('gg-overlay'); var trigger = d.activeElement; if(!el) return; el.hidden = false; GG.core.state.remove(el, 'hidden'); GG.core.state.add(el, 'open'); if(GG.services && GG.services.a11y && typeof GG.services.a11y.modalOpen === 'function') GG.services.a11y.modalOpen(el, trigger, { label: 'Overlay' }); };
ui.overlay.close = ui.overlay.close || function(){ var el = d.getElementById('gg-overlay'); if(!el) return; if(GG.services && GG.services.a11y && typeof GG.services.a11y.modalClose === 'function') GG.services.a11y.modalClose(el); GG.core.state.remove(el, 'open'); GG.core.state.add(el, 'hidden'); el.hidden = true; };
ui.skeleton = ui.skeleton || {};
ui.skeleton.render = ui.skeleton.render || function(target){
if(!target) return;
target.textContent = '';
var wrap = d.createElement('div');
wrap.className = 'gg-skeleton';
wrap.setAttribute('aria-hidden', 'true');
function addBar(name){
  var bar = d.createElement('div');
  bar.className = 'gg-skeleton__bar ' + name;
  wrap.appendChild(bar);
}
addBar('gg-skeleton__hero');
addBar('gg-skeleton__title');
addBar('gg-skeleton__line');
addBar('gg-skeleton__line');
addBar('gg-skeleton__line gg-skeleton__line--short');
target.appendChild(wrap);
};
ui.layout = ui.layout || {};
ui.layout._inferSurfaceFromUrl = ui.layout._inferSurfaceFromUrl || function(url){
try {
  if (GG.core && GG.core.inferRoute) {
    var route = GG.core.inferRoute(url || w.location.href, { surface: 'post' });
    if (route && route.surface) return route.surface;
  }
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
ui.layout._getCommentsPanel = ui.layout._getCommentsPanel || function(root){
var scope = root && root.querySelector ? root : d;
return scope.querySelector('#ggPanelComments') ||
  scope.querySelector('.gg-comments-panel[data-gg-panel="comments"]') ||
  scope.querySelector('.gg-comments-panel');
};
ui.layout._getCommentsSidebar = ui.layout._getCommentsSidebar || function(root){
var scope = root && root.querySelector ? root : d;
return scope.querySelector('.gg-blog-sidebar--right');
};
ui.layout._mountCommentsToSidebar = ui.layout._mountCommentsToSidebar || function(root){
var scope = root && root.querySelector ? root : d;
var main = scope.querySelector('main.gg-main[data-gg-surface]') || scope.querySelector('main.gg-main') || scope.querySelector('main');
var panel = ui.layout._getCommentsPanel(scope);
var sidebar = ui.layout._getCommentsSidebar(main || scope);
var infoPanel = null;
var comments = null;
var parent = null;
if (!main || !panel || !sidebar) return panel || null;
if (main.getAttribute('data-gg-surface') !== 'post' && main.getAttribute('data-gg-surface') !== 'page') return panel;
infoPanel = sidebar.querySelector('[data-gg-panel="info"]') || sidebar.querySelector('.gg-info-panel');
parent = panel.parentNode || null;
if (parent !== sidebar) {
  if (infoPanel && infoPanel.parentNode === sidebar) {
    if (infoPanel.nextSibling) sidebar.insertBefore(panel, infoPanel.nextSibling);
    else sidebar.appendChild(panel);
  } else {
    sidebar.insertBefore(panel, sidebar.firstChild || null);
  }
}
sidebar.setAttribute('data-gg-comments-host', '1');
panel.setAttribute('data-gg-runtime-owner', 'sidebar-right');
panel.setAttribute('data-gg-runtime-mount-target', '.gg-blog-sidebar--right');
comments = panel.querySelector ? panel.querySelector('#comments') : null;
if (comments) comments.__ggDocked = true;
return panel;
};
ui.layout._dockComments = ui.layout._dockComments || function(){
var panel = ui.layout._mountCommentsToSidebar();
var slot = panel && panel.querySelector ? panel.querySelector('[data-gg-slot="comments"]') : null;
var comments = slot ? slot.querySelector('#comments') : null;
if (!comments) return;
comments.__ggDocked = true;
};
ui.layout._normalizeListingFlow = ui.layout._normalizeListingFlow || function(){
var main = d.querySelector('main.gg-main[data-gg-surface="listing"] .gg-blog-main');
if (!main) return;
main.setAttribute('data-gg-listing-flow', 'ssr');
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


GG.actions.register('dock:toggle', function(){
var s = GG.store.get();
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
GG.ui.toggleCommentsHelp = GG.ui.toggleCommentsHelp || function(open, triggerEl){
return false;
};
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
  var msg = (GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.copied', 'Link copied') : 'Link copied';
  if (GG.ui && typeof GG.ui.ggToast === 'function') GG.ui.ggToast(msg);
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
window.scrollTo({ top: dirDown ? maxY : 0, behavior: GG.services.a11y.scrollBehavior() });
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
services.api.fetch = function(url, type){
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

services.images = services.images || {};
services.images.isResizableThumbUrl = services.images.isResizableThumbUrl || function(url){
var src = String(url || '').trim();
if (!src) return false;
if (!/blogger\.googleusercontent\.com|googleusercontent\.com/i.test(src)) return false;
if (/\/s\d+(?:-c)?\//i.test(src)) return true;
if (/=s\d+(?:-c)?(?=$|[?#&])/i.test(src)) return true;
return false;
};
services.images.resizeThumbUrl = services.images.resizeThumbUrl || function(url, size, keepCrop){
var src = String(url || '').trim();
var n = parseInt(size, 10);
if (!services.images.isResizableThumbUrl(src)) return null;
if (!isFinite(n) || n <= 0) return null;
var hadCrop = /\/s\d+-c\//i.test(src) || /=s\d+-c(?=$|[?#&])/i.test(src);
var preserve = (keepCrop !== false);
var useCrop = preserve && hadCrop;
var seg = '/s' + String(n) + (useCrop ? '-c' : '') + '/';
if (/\/s\d+(?:-c)?\//i.test(src)) {
  return src.replace(/\/s\d+(?:-c)?\//i, seg);
}
if (/=s\d+(?:-c)?(?=$|[?#&])/i.test(src)) {
  return src.replace(/=s\d+(?:-c)?(?=$|[?#&])/i, '=s' + String(n) + (useCrop ? '-c' : ''));
}
return null;
};
services.images.buildSrcset = services.images.buildSrcset || function(url, widths, opts){
var src = String(url || '').trim();
var conf = opts || {};
var max = parseInt(conf.max, 10);
var hasMax = isFinite(max) && max > 0;
var list = Array.isArray(widths) ? widths : [];
var out = [];
var seen = {};
var i = 0;
if (!services.images.isResizableThumbUrl(src)) return null;
for (i = 0; i < list.length; i++) {
  var n = parseInt(list[i], 10);
  if (!isFinite(n) || n <= 0) continue;
  if (hasMax && n > max) continue;
  if (seen[n]) continue;
  seen[n] = 1;
  out.push(n);
}
if (!out.length) return null;
out.sort(function(a, b){ return a - b; });
var parts = [];
for (i = 0; i < out.length; i++) {
  var resized = services.images.resizeThumbUrl(src, out[i], conf.keepCrop);
  if (!resized) continue;
  parts.push(resized + ' ' + String(out[i]) + 'w');
}
if (!parts.length) return null;
var preferred = services.images.resizeThumbUrl(src, out[0], conf.keepCrop) || src;
return {
  src: preferred,
  srcset: parts.join(', '),
  sizes: conf.sizes || null
};
};
services.images.setIntrinsicDims = services.images.setIntrinsicDims || function(el, w, h){
if (!el || !w || !h) return;
var W = (w|0), H = (h|0);
if (W <= 0 || H <= 0) return;
el.setAttribute('width', String(W));
el.setAttribute('height', String(H));
};
GG.services.images.isResizableThumbUrl = GG.services.images.isResizableThumbUrl || services.images.isResizableThumbUrl;
GG.services.images.resizeThumbUrl = GG.services.images.resizeThumbUrl || services.images.resizeThumbUrl;
GG.services.images.buildSrcset = GG.services.images.buildSrcset || services.images.buildSrcset;
GG.services.images.setIntrinsicDims = GG.services.images.setIntrinsicDims || services.images.setIntrinsicDims;

services.postmeta = services.postmeta || {};
services.postmeta.getFromContext = services.postmeta.getFromContext || function(ctxEl){
var root = ctxEl && ctxEl.querySelector ? ctxEl : d;
var doc = root && root.nodeType === 9 ? root : ((root && root.ownerDocument) ? root.ownerDocument : d);
var nodes = root && root.querySelectorAll ? root.querySelectorAll('.gg-postmeta,[data-gg-postmeta]') : null;
var out = { author: '', contributors: [], tags: [], updated: '', readMin: '', readLabel: '', snippet: '' };
var i = 0, text = '', key = '', body = null, meta = null, seen = {}, parts = [], best = null, bestScore = -1, one = null, a = '', u = '', r = '', s = '', c = null, t = null, sc = 0;
function clean(raw){ return String(raw || '').replace(/\s+/g, ' ').trim(); }
function split(raw, rx){
  var src = clean(raw), list = src ? src.split(rx || /[;,]/) : [], outParts = [];
  seen = {};
  for (var j = 0; j < list.length; j++) {
    var one = clean(list[j]), k = one.toLowerCase();
    if (!one || seen[k]) continue;
    seen[k] = 1;
    outParts.push(one);
  }
  return outParts;
}
function tagKey(raw){ return clean(raw).toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/^-+|-+$/g, ''); }
function excerptFromBody(node, maxLen){
  var max = parseInt(maxLen, 10) || 220;
  var clone = null, drops = null, txt = '';
  if (!node || !node.cloneNode) return '';
  clone = node.cloneNode(true);
  if (clone && clone.querySelectorAll) {
    drops = clone.querySelectorAll('script,style,noscript,svg,pre,code,figure,figcaption,blockquote,.gg-postmeta,[hidden],[aria-hidden=\"true\"]');
    for (var j = 0; j < drops.length; j++) {
      if (drops[j] && drops[j].remove) drops[j].remove();
    }
  }
  txt = clean(clone && clone.textContent ? clone.textContent : '');
  if (!txt) return '';
  if (txt.length <= max) return txt;
  return txt.slice(0, max).replace(/[.,;:!?\s]+$/g, '') + '...';
}
for(i=0;nodes&&i<nodes.length;i++){
  a=clean(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-author')||nodes[i].getAttribute('data-gg-author')||nodes[i].getAttribute('author')):'');
  u=clean(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-updated')||nodes[i].getAttribute('data-gg-updated')):'');
  r=clean(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-read-min')||nodes[i].getAttribute('data-readtime')||nodes[i].getAttribute('data-gg-read-min')||nodes[i].getAttribute('data-gg-readtime')):'');
  s=clean(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-snippet')||nodes[i].getAttribute('data-gg-snippet')):'');
  c=split(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-contributors')||nodes[i].getAttribute('data-gg-contributors')):'',/\s*[;,]\s*/);
  t=split(nodes[i]&&nodes[i].getAttribute?(nodes[i].getAttribute('data-tags')||nodes[i].getAttribute('data-gg-tags')):'',/\s*[;,]\s*/);
  sc=(a?2:0)+(u?2:0)+(r?1:0)+(s?2:0)+c.length*3+t.length*4;
  if(sc>bestScore){ bestScore=sc; best={ author:a, updated:u, readMin:r, snippet:s, contributors:c, tags:t }; }
}
if (best) {
  out.author = clean(best.author || '');
  out.updated = clean(best.updated || '');
  out.readMin = clean(best.readMin || '');
  out.snippet = clean(best.snippet || '');
  parts = Array.isArray(best.contributors) ? best.contributors : [];
  for (i = 0; i < parts.length; i++) {
    if (out.author && parts[i].toLowerCase() === out.author.toLowerCase()) continue;
    out.contributors.push(parts[i]);
  }
  parts = Array.isArray(best.tags) ? best.tags : [];
  for (i = 0; i < parts.length; i++) {
    one=parts[i];
    text=clean(typeof one==='string'?one:(one&&((one.text||one.name||one.key)||'')));
    key = tagKey(typeof one==='string'?one:(one&&((one.key||one.text||one.name)||'')));
    if (!key) continue;
    out.tags.push({ key: key, text: text||key, href: '/p/tags.html?tag=' + encodeURIComponent(key) });
  }
}
if (!out.author && root && root.getAttribute) {
  out.author = clean(root.getAttribute('data-author-name') || root.getAttribute('data-author') || '');
}
if (!out.updated) {
  meta = doc && doc.querySelector ? doc.querySelector('meta[property="article:modified_time"],meta[property="og:updated_time"],meta[property="article:published_time"]') : null;
  out.updated = clean(meta ? meta.getAttribute('content') : '');
}
if (!out.readMin) {
  body = body || (root && root.querySelector ? (root.querySelector('.gg-post__content.post-body.entry-content') || root.querySelector('.post-body.entry-content') || root.querySelector('.entry-content') || root.querySelector('.post-body')) : null);
  text = clean((body && body.textContent) || (root && root.textContent) || '');
  if (text) out.readMin = String(Math.max(1, Math.ceil(text.split(/\s+/).length / 200)));
}
if (!out.snippet) {
  body = body || (root && root.querySelector ? (root.querySelector('.gg-post__content.post-body.entry-content') || root.querySelector('.post-body.entry-content') || root.querySelector('.entry-content') || root.querySelector('.post-body')) : null);
  out.snippet = excerptFromBody(body || root, 220);
}
if (out.readMin) out.readLabel = out.readMin + ' min read';
return out;
};
GG.services.postmeta = GG.services.postmeta || services.postmeta;
function copyText(key, fallback, vars){
  if (GG.copy && typeof GG.copy.t === 'function') return GG.copy.t(key, fallback, vars);
  return String(fallback == null ? '' : fallback);
}

services.comments = services.comments || (function(){
function qs(sel, root){ return (root || document).querySelector(sel); }
function findBloggerCommentsRoot(){
  var root = qs('#ggPanelComments #comments') ||
             qs('.gg-comments-panel[data-gg-panel="comments"] #comments') ||
             qs('.gg-comments-panel[data-gg-panel="comments"] .gg-comments');
  if (root && root.closest && root.closest('.gg-comments-panel,[data-gg-panel="comments"]')) {
    return root;
  }
  return null;
}
function ensureSlot(){
  return qs('.gg-comments-panel[data-gg-panel="comments"] [data-gg-slot="comments"]');
}
function setSlotStatus(slot, message){
  if (!slot) return;
  var text = String(message || '').trim();
  slot.textContent = '';
  if (!text) return;
  var status = document.createElement('div');
  status.className = 'gg-comments-loading';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = text;
  slot.appendChild(status);
}
function setLoading(slot, on){
  if (!slot) return;
  if (on){
    if (slot.__ggLoading) return;
    slot.__ggLoading = true;
    setSlotStatus(slot, copyText('global.loading', 'Loading...'));
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
  if (!slot.contains(src)) return false;
  setLoading(slot, false);
  return true;
}

function mountWithRetry(){
  var tries = 0;
  var max = 20;          // ~10s total
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
        setSlotStatus(s, copyText('global.unavailable', 'Unavailable'));
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
      try {
        if (GG.util && typeof GG.util.showToast === 'function') GG.util.showToast(copyText('share.status.copied', 'Link copied'));
        else if (GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function') GG.ui.toast.show(copyText('share.status.copied', 'Link copied'));
      } catch (_) {}
    }).catch(function(){
      try {
        if (GG.util && typeof GG.util.showToast === 'function') GG.util.showToast(copyText('share.status.unavailable', 'Sharing is unavailable on this device'));
        else if (GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function') GG.ui.toast.show(copyText('share.status.unavailable', 'Sharing is unavailable on this device'));
      } catch (_) {}
    });
  }
  try {
    if (GG.util && typeof GG.util.showToast === 'function') GG.util.showToast(copyText('share.status.unavailable', 'Sharing is unavailable on this device'));
    else if (GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function') GG.ui.toast.show(copyText('share.status.unavailable', 'Sharing is unavailable on this device'));
  } catch (_) {}
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
var v = document.getElementById("ggHeroVideo");
var hero = document.getElementById("gg-landing-hero");
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

var safePlay = function(){
  try {
    var p = v.play();
    if (p && typeof p.catch === 'function') p.catch(function(){});
  } catch (_) {}
};
safePlay();
var io = new IntersectionObserver(function(entries){
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e && e.isIntersecting) safePlay();
    else {
      try { v.pause(); } catch (_) {}
    }
  }
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
if (path === '/landing') {
  return 'landing';
}
if (path === '/' || path === '' || path === '/blog') {
  if (view === 'landing') return 'landing';
  return 'blog';
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
var initial = (ALLOWED.indexOf(attr) !== -1) ? attr : 'blog';
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
  var cur = root.getAttribute('data-gg-home-state') || 'blog';
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
var morePanelEl = null;
var morePanelSheetEl = null;
var morePanelOpen = false;
var morePanelTrapCleanup = null;
var moreInertActive = false;
var moreHideTimer = 0;
var moreButtonEl = null;
var escBound = false;
var pendingBound = false;

function scrollToAnchor(sel) {
if (!sel) return;
var t = document.querySelector(sel);
if (!t) return;
try {
  t.scrollIntoView({ behavior: GG.services.a11y.scrollBehavior(), block: 'start' });
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

function blogHrefFromDock(){
if (!dockEl) return '/';
var blogLink = dockEl.querySelector('.gg-dock__item[data-gg-action="blog"]');
var href = blogLink ? (blogLink.getAttribute('href') || '') : '';
if (!href) href = (GG.core && GG.core.blogHomePath) ? GG.core.blogHomePath('/') : '/';
return href;
}

function clearMoreHash(){
try {
if (window.location && window.location.hash === '#gg-dock-more') {
  if (window.history && typeof history.replaceState === 'function') {
    history.replaceState(history.state || null, '', window.location.pathname + window.location.search);
  } else {
    window.location.hash = '';
  }
}
} catch (_) {}
}

function ensureMorePanel(){
if (!morePanelEl) morePanelEl = document.getElementById('gg-dock-more');
return morePanelEl;
}

function ensureMoreSheet(){
if (!morePanelSheetEl) {
  var panel = ensureMorePanel();
  morePanelSheetEl = panel ? panel.querySelector('.gg-dock-more__sheet') : null;
}
return morePanelSheetEl;
}

function textOf(el){
return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
}

function focusNoScroll(el){
if (!el || typeof el.focus !== 'function') return;
try { el.focus({ preventScroll: true }); }
catch (_) { try { el.focus(); } catch (__ ) {} }
}

function clearMoreFooterItems(list){
if (!list) return;
var stale = list.querySelectorAll('[data-gg-more-origin="footer"]');
for (var i = 0; i < stale.length; i++) {
  if (stale[i] && stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
}
}

function clearMoreNavItems(list){
if (!list) return;
var stale = list.querySelectorAll('[data-gg-more-origin="navtree"]');
for (var i = 0; i < stale.length; i++) {
  if (stale[i] && stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
}
}

function setMoreSectionHidden(list, hidden){
var section = list && list.closest ? list.closest('.gg-dock-more__section') : null;
if (section) section.hidden = !!hidden;
}

function setMoreSurfaceLock(locked){
var root = document.documentElement;
if (root && root.classList) root.classList.toggle('gg-more-sheet-open', !!locked);
if (document.body && document.body.classList) document.body.classList.toggle('gg-more-sheet-open', !!locked);
}

function cleanupMorePanelA11y(){
if (morePanelTrapCleanup) {
  try { morePanelTrapCleanup(); } catch (_) {}
  morePanelTrapCleanup = null;
}
if (moreInertActive && GG.services && GG.services.a11y && GG.services.a11y.inertManager && typeof GG.services.a11y.inertManager.pop === 'function') {
  try { GG.services.a11y.inertManager.pop(); } catch (_) {}
}
moreInertActive = false;
}

function setMoreButtonState(open){
if (!moreButtonEl && dockEl) moreButtonEl = dockEl.querySelector('.gg-dock__item[data-gg-action="more"]');
if (!moreButtonEl) return;
moreButtonEl.setAttribute('aria-haspopup', 'dialog');
moreButtonEl.setAttribute('aria-controls', 'gg-dock-more');
moreButtonEl.setAttribute('aria-expanded', open ? 'true' : 'false');
if (GG.core && GG.core.state && typeof GG.core.state.toggle === 'function') {
  GG.core.state.toggle(moreButtonEl, 'open', !!open);
}
}

function guessMoreIcon(label, href){
var key = ((label || '') + ' ' + (href || '')).toLowerCase();
if (/paypal|payment|donat|support via pay/.test(key)) return 'payments';
if (/install|pwa|web app|device/.test(key)) return 'install_desktop';
if (/privacy|policy|terms|legal/.test(key)) return 'policy';
if (/support|help|faq|contact/.test(key)) return 'support_agent';
if (/about|philosophy|editorial|author/.test(key)) return 'account_balance';
if (/topic|tags|index|sitemap|library/.test(key)) return 'topic';
if (/linkedin/.test(key)) return 'work';
if (/reddit/.test(key)) return 'forum';
if (/tiktok/.test(key)) return 'music_note';
if (/twitter|(^|[^a-z])x([^a-z]|$)/.test(key)) return 'alternate_email';
if (/facebook/.test(key)) return 'public';
if (/youtube/.test(key)) return 'play_circle';
if (/instagram/.test(key)) return 'photo_camera';
if (/telegram/.test(key)) return 'send';
if (/github/.test(key)) return 'code';
return 'link';
}

function resolveMoreItemMeta(label, href){
var key = ((label || '') + ' ' + (href || '')).toLowerCase();
if (/privacy|policy|terms|legal/.test(key)) return 'Review privacy terms and data handling.';
if (/support|help|faq|contact/.test(key)) return 'Support answers and contact paths.';
if (/about|philosophy|editorial|author/.test(key)) return 'Editorial notes and guiding principles.';
if (/topic|tags|index|sitemap|library/.test(key)) return 'Browse topics, labels, and entry points.';
if (/paypal|payment|donat|support via pay/.test(key)) return 'Contribute directly to the project.';
return 'Open this page.';
}

function resolveFooterActionData(title, link){
var titleText = textOf(title);
var label = link ? String(link.getAttribute('aria-label') || '').trim() : '';
var meta = '';
var href = link ? (link.getAttribute('href') || '') : '';
if (!label) label = textOf(link);
var match = label.match(/^([^:]+):\s*(.+)$/);
if (match) {
  label = match[1].trim();
  meta = match[2].trim();
}
if (!label) label = titleText || 'External link';
if (!meta) meta = titleText || 'External profile';
if (meta && !/external/i.test(meta)) meta += ' · External profile';
return {
  label: label,
  meta: meta,
  icon: guessMoreIcon(label, href),
  href: href
};
}

function createMoreActionNode(opts){
if (!opts || !opts.label) return null;
var kind = opts.kind || 'internal';
var trailText = opts.trail || (kind === 'external' ? 'north_east' : (kind === 'action' ? 'download' : 'arrow_forward'));
var node = document.createElement(opts.tag || 'a');
node.className = 'gg-dock-more__action';
node.setAttribute('data-gg-kind', kind);
if (opts.tone) node.setAttribute('data-gg-tone', opts.tone);
if (node.tagName === 'BUTTON') {
  node.type = 'button';
} else {
  node.href = opts.href || '#';
  if (opts.source) {
    var rel = opts.source.getAttribute('rel');
    var target = opts.source.getAttribute('target');
    if (rel) node.setAttribute('rel', rel);
    if (target) node.setAttribute('target', target);
  }
}
if (opts.action) node.setAttribute('data-gg-more-action', opts.action);

var badge = document.createElement('span');
badge.className = 'gg-dock-more__badge';
badge.setAttribute('aria-hidden', 'true');

var iconNode = document.createElement('span');
iconNode.className = 'gg-icon material-symbols-rounded';
iconNode.textContent = opts.icon || guessMoreIcon(opts.label, opts.href);
badge.appendChild(iconNode);

var copy = document.createElement('span');
copy.className = 'gg-dock-more__copy';

var labelNode = document.createElement('span');
labelNode.className = 'gg-dock-more__label';
labelNode.textContent = opts.label;
copy.appendChild(labelNode);

if (opts.meta) {
  var metaNode = document.createElement('span');
  metaNode.className = 'gg-dock-more__meta';
  metaNode.textContent = opts.meta;
  copy.appendChild(metaNode);
}

var trail = document.createElement('span');
trail.className = 'gg-dock-more__trail gg-icon material-symbols-rounded';
trail.setAttribute('aria-hidden', 'true');
trail.textContent = trailText;

node.appendChild(badge);
node.appendChild(copy);
node.appendChild(trail);
return node;
}

function appendMoreFooterLinkItem(list, href, label, meta, icon, source){
if (!list || !label) return;
var li = document.createElement('li');
li.setAttribute('data-gg-more-origin', 'footer');
var node = createMoreActionNode({
  href: href,
  label: label,
  meta: meta,
  icon: icon,
  source: source,
  kind: 'external',
  tone: 'quiet'
});
if (!node) return;
li.appendChild(node);
list.appendChild(li);
}

function appendMoreNavShortcutItem(list, item){
if (!list || !item || !item.label) return;
var li = document.createElement('li');
li.setAttribute('data-gg-more-origin', 'navtree');
var node = createMoreActionNode({
  href: item.href || '#',
  label: item.label,
  meta: item.meta || resolveMoreItemMeta(item.label, item.href),
  icon: (item.icon || '').trim() || guessMoreIcon(item.label, item.href),
  source: item.source,
  kind: item.kind || 'internal',
  tone: item.tone || ''
});
if (!node) return;
li.appendChild(node);
list.appendChild(li);
}

function collectNavTreeShortcuts(){
var out = [];
var seen = {};
var root = document.querySelector('.gg-blog-sidebar--left') || document;
var links = root.querySelectorAll ? root.querySelectorAll('details.gg-navtree .gg-navtree__item > a[href], .gg-navtree__item > a[href]') : [];
if ((!links || !links.length) && root !== document && document.querySelectorAll) {
  links = document.querySelectorAll('details.gg-navtree .gg-navtree__item > a[href], .gg-navtree__item > a[href]');
}
for (var i = 0; i < links.length; i++) {
  var link = links[i];
  if (!link) continue;
  if (link.closest && link.closest('template')) continue;
  var href = (link.getAttribute('href') || '').trim();
  if (!href || href === '#' || /^javascript:/i.test(href)) continue;
  var iconEl = link.querySelector ? link.querySelector('.material-symbols-rounded,.gg-icon.material-symbols-rounded') : null;
  var icon = iconEl ? textOf(iconEl) : '';
  if (!icon) icon = (link.getAttribute('data-gg-icon') || '').trim();
  if (!icon) icon = guessMoreIcon(textOf(link), href);
  var label = textOf(link);
  if (icon && label.indexOf(icon) === 0) label = label.slice(icon.length).trim();
  if (!label) label = (link.getAttribute('aria-label') || '').trim() || 'Shortcut';
  if (!label) continue;
  var key = label.toLowerCase() + '|' + href.replace(/\/+$/, '');
  if (seen[key]) continue;
  seen[key] = 1;
  out.push({
    href: href,
    label: label,
    icon: icon,
    meta: resolveMoreItemMeta(label, href),
    kind: 'internal',
    source: link
  });
  if (out.length >= 8) break;
}
return out;
}

function syncMoreFooterActions(panel){
if (!panel) return;
var footerList = panel.querySelector('[data-gg-more-group="footer"]');
var navList = panel.querySelector('[data-gg-more-group="nav"]');
var navShortcuts = collectNavTreeShortcuts();
clearMoreFooterItems(footerList);
if (navShortcuts.length) clearMoreNavItems(navList);

var footerCount = 0;
var footerActions = document.querySelector('.gg-footer__social');
if (footerActions && footerList) {
  var titles = footerActions.querySelectorAll('.gg-footer__social-title');
  for (var i = 0; i < titles.length; i++) {
    var title = titles[i];
    var cluster = title ? title.nextElementSibling : null;
    while (cluster && (!cluster.classList || !cluster.classList.contains('gg-footer__cluster'))) {
      cluster = cluster.nextElementSibling;
    }
    if (!cluster) continue;
    var links = cluster.querySelectorAll('.gg-footer__social-links a.gg-footer__social-link');
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var item = resolveFooterActionData(title, link);
      appendMoreFooterLinkItem(footerList, item.href || '#', item.label, item.meta, item.icon, link);
      footerCount += 1;
      if (footerCount >= 6) break;
    }
    if (footerCount >= 6) break;
  }
}

for (var n = 0; n < navShortcuts.length; n++) {
  appendMoreNavShortcutItem(navList, navShortcuts[n]);
}

setMoreSectionHidden(navList, !navList || !navList.children.length);
setMoreSectionHidden(footerList, !footerList || !footerList.children.length);
}

function openMorePanel(){
var panel = ensureMorePanel();
var sheet = ensureMoreSheet();
if (!panel || !sheet) return false;
if (moreHideTimer) {
  window.clearTimeout(moreHideTimer);
  moreHideTimer = 0;
}
syncMoreFooterActions(panel);
morePanelOpen = true;
panel.hidden = false;
panel.removeAttribute('inert');
panel.setAttribute('aria-hidden', 'false');
GG.core.state.remove(panel, 'hidden');
GG.core.state.remove(panel, 'closing');
clearMoreHash();
revealDock();
setMoreSurfaceLock(true);
setMoreButtonState(true);
cleanupMorePanelA11y();
if (!moreInertActive && GG.services && GG.services.a11y && GG.services.a11y.inertManager && typeof GG.services.a11y.inertManager.push === 'function') {
  try {
    GG.services.a11y.inertManager.push(document.body, panel);
    moreInertActive = true;
  } catch (_) {}
}
if (GG.services && GG.services.a11y && typeof GG.services.a11y.focusTrap === 'function') {
  morePanelTrapCleanup = GG.services.a11y.focusTrap(sheet, { autofocus: false });
}
requestAnimationFrame(function(){
  if (morePanelOpen) GG.core.state.add(panel, 'open');
});
var closeEl = panel.querySelector('[data-gg-action="more-close"]');
focusNoScroll(closeEl || sheet);
return true;
}

function closeMorePanel(opts){
opts = opts || {};
var panel = ensureMorePanel();
var restoreFocus = opts.restoreFocus !== false;
if (!panel) return;
if (moreHideTimer) {
  window.clearTimeout(moreHideTimer);
  moreHideTimer = 0;
}
morePanelOpen = false;
panel.setAttribute('aria-hidden', 'true');
panel.setAttribute('inert', '');
GG.core.state.remove(panel, 'open');
GG.core.state.add(panel, 'closing');
clearMoreHash();
setMoreSurfaceLock(false);
setMoreButtonState(false);
cleanupMorePanelA11y();
revealDock();
moreHideTimer = window.setTimeout(function(){
  if (morePanelOpen) return;
  panel.hidden = true;
  GG.core.state.remove(panel, 'closing');
  GG.core.state.add(panel, 'hidden');
}, 180);
if (restoreFocus) focusNoScroll(moreButtonEl);
}

function enterSearch(){
if (isSearchMode) return;
if (morePanelOpen) closeMorePanel({ restoreFocus: false });
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
if (!mainEl) return 'blog';
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
var next = !!hidden && !isSearchMode && !morePanelOpen;
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
if (isSearchMode || morePanelOpen || y < 72 || absDelta < 6) {
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
    (state === 'landing'  && action === 'home') ||
    (state === 'blog'     && action === 'blog');

  GG.core.state.toggle(btn, 'active', !!match);
  if (match) btn.setAttribute('aria-current', 'page');
  else       btn.removeAttribute('aria-current');
});
scheduleWidthUpdate();
}

function runAction(action, payload){
var anchor = payload && payload.anchor ? payload.anchor : '';
var href = payload && payload.href ? payload.href : '';
if (!action) return false;

if (action === 'search') {
if (!isSearchMode) {
  enterSearch();
} else if (searchForm) {
  searchForm.submit();
}
try { window.dispatchEvent(new CustomEvent('gg:search-open', { detail: { source: 'dock' } })); } catch (_) {}
return true;
}

if (action === 'search-exit') {
exitSearch();
return true;
}

if (action === 'more') {
if (morePanelOpen) {
  closeMorePanel();
  return true;
}
return openMorePanel();
}

if (action === 'more-close') {
closeMorePanel();
return true;
}

	if (action === 'home') {
	if (isHomeCapable() && GG.modules.homeState) {
	  var alreadyLanding = effectiveDockState() === 'landing';
	  GG.modules.homeState.setState('landing');
	  if (GG.util && GG.util.homeRouter && GG.util.homeRouter.pushState) {
	    GG.util.homeRouter.pushState('landing', '/landing');
	  } else {
	    try { history.pushState({ ggHome:'landing' }, '', '/landing'); } catch (_) {}
	  }
	  updateActive();
	  if (!(alreadyLanding && (!anchor || anchor === '#gg-landing-hero'))) {
	    scrollToAnchor(anchor || '#gg-landing-hero');
	  }
	  return true;
	}
	return false;
	}

if (action === 'blog') {
if (isHomeCapable() && GG.modules.homeState) {
  GG.modules.homeState.setState('blog');
  if (GG.util && GG.util.homeRouter && GG.util.homeRouter.pushState) {
    GG.util.homeRouter.pushState('blog', '/');
  }
  updateActive();
  var homeAnchor = document.getElementById('gg-home-blog-anchor') || document.querySelector('#gg-home-blog-anchor');
  if (homeAnchor && homeAnchor.scrollIntoView) {
    try { homeAnchor.scrollIntoView({ block:'start', behavior:'auto' }); } catch (_) { try { homeAnchor.scrollIntoView(true); } catch (__ ) {} }
  }
  return true;
}
if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
  GG.core.router.go(href || blogHrefFromDock());
  return true;
}
return false;
}

if (action === 'contact') {
if (isHomeCapable() && GG.modules.homeState) {
  var alreadyLanding = effectiveDockState() === 'landing';
  var targetAnchor = anchor || '#contact';
  if (targetAnchor === '#gg-landing-hero-5') targetAnchor = '#contact';
  if (targetAnchor === '#contact' && !document.querySelector(targetAnchor)) targetAnchor = '#gg-landing-hero-5';
  GG.modules.homeState.setState('landing');
  if (!alreadyLanding) {
    if (GG.util && GG.util.homeRouter && GG.util.homeRouter.pushState) {
      GG.util.homeRouter.pushState('landing', '/landing');
    } else {
      try { history.pushState({ ggHome:'landing' }, '', '/landing'); } catch (_) {}
    }
  }
  updateActive();
  scrollToAnchor(targetAnchor);
  return true;
}
return false;
}

if (anchor) {
scrollToAnchor(anchor);
return true;
}

return false;
}

function replayAction(payload){
if (!payload) return false;
var action = payload.action || '';
return runAction(action, payload);
}

function maybeReplayPendingAction(){
var boot = window.GG_BOOT || {};
var pending = boot._pendingDockAction || window.__GG_PENDING_DOCK_ACTION || null;
if (!pending) return;
var ok = false;
try { ok = !!replayAction(pending); } catch (_) { ok = false; }
if (!ok) return;
boot._pendingDockAction = null;
window.__GG_PENDING_DOCK_ACTION = null;
}

function bindMorePanel(){
var panel = ensureMorePanel();
if (!panel || panel.__gD) return;
panel.__gD = true;
panel.addEventListener('click', function(evt){
var closeLink = evt && evt.target && evt.target.closest ? evt.target.closest('[data-gg-action="more-close"]') : null;
var installLink = evt && evt.target && evt.target.closest ? evt.target.closest('[data-gg-more-action="install"]') : null;
var actionLink = evt && evt.target && evt.target.closest ? evt.target.closest('.gg-dock-more__action[href]') : null;
var scrim = evt && evt.target && evt.target.closest ? evt.target.closest('.gg-dock-more__scrim') : null;
if (closeLink) {
  evt.preventDefault();
  closeMorePanel();
  return;
}
if (installLink) {
  evt.preventDefault();
  closeMorePanel();
  var installButton = document.getElementById('install');
  if (installButton && installButton.click) {
    try { installButton.click(); } catch (_) {}
  }
  return;
}
if (actionLink) {
  closeMorePanel({ restoreFocus: false });
  return;
}
if (scrim || (evt && evt.target === panel)) {
  closeMorePanel();
}
}, true);
}

function handleClick(evt) {
var btn = evt.currentTarget;
var action = btn.getAttribute('data-gg-action') || '';
var anchor = btn.getAttribute('data-gg-anchor') || '';
var href = btn.getAttribute('href') || '';
if (window.GG_DEBUG) console.log('[dock]', action, anchor || '', href || '');

if (action === 'search' || action === 'search-exit' || action === 'more' || action === 'more-close') {
evt.preventDefault();
runAction(action, { action: action, anchor: anchor, href: href });
return;
}

if (action === 'home' || action === 'blog' || action === 'contact') {
if (runAction(action, { action: action, anchor: anchor, href: href })) {
  evt.preventDefault();
}
return;
}

if (anchor) {
evt.preventDefault();
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
  dockEl.querySelectorAll('.gg-dock__item[data-gg-action]')
);
moreButtonEl = dockEl.querySelector('.gg-dock__item[data-gg-action="more"]');

searchForm  = dockEl.querySelector('.gg-dock__search form');
searchInput = dockEl.querySelector('.gg-dock__search input');

buttons.forEach(function (btn) {
  btn.addEventListener('click', handleClick);
});
if (dockEl.querySelector('[data-gg-action="search-exit"]')){
  dockEl.querySelector('[data-gg-action="search-exit"]').addEventListener('click', handleClick);
}
if (!escBound){
escBound = true;
document.addEventListener('keydown', function(e){
if (e.key !== 'Escape') return;
  exitSearch();
  closeMorePanel();
});
}
bindMorePanel();
var initMorePanel = ensureMorePanel();
if (initMorePanel) {
  initMorePanel.hidden = true;
  initMorePanel.setAttribute('aria-hidden', 'true');
  initMorePanel.setAttribute('inert', '');
  GG.core.state.add(initMorePanel, 'hidden');
  syncMoreFooterActions(initMorePanel);
}
setMoreButtonState(false);
if (((window.location && window.location.hash) || '') === '#gg-dock-more') openMorePanel();
if (!pendingBound){
pendingBound = true;
window.addEventListener('gg:dock-action-pending', function(evt){
  if (!evt || !evt.detail) return;
  replayAction(evt.detail);
});
}
maybeReplayPendingAction();

updateActive();
updateDockWidth();
lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
revealDock();
if (dockEl && !dockEl.__gAH){
  dockEl.__gAH = true;
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
dockEl.setAttribute('data-gg-ready', '1');
window.__GG_DOCK_READY = true;
try { window.dispatchEvent(new CustomEvent('gg:dock-ready')); } catch (_) {}
}

return {
init: init,
updateActive: updateActive,
replayAction: replayAction,
closeMorePanel: closeMorePanel
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
    slot.textContent = '';
    return;
  }
  slot.hidden = false;
  slot.textContent = '';
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
    showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('library.status.saved', 'Saved to library') : 'Saved to library');
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
          navigator.clipboard.writeText(url).then(function(){
            showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.copied', 'Link copied') : 'Link copied');
          }).catch(function(){
            showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.unavailable', 'Sharing is unavailable on this device') : 'Sharing is unavailable on this device');
          });
          return;
        }
        showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.unavailable', 'Sharing is unavailable on this device') : 'Sharing is unavailable on this device');
      });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){
        showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.copied', 'Link copied') : 'Link copied');
      }).catch(function(){
        showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.unavailable', 'Sharing is unavailable on this device') : 'Sharing is unavailable on this device');
      });
      return;
    }
    showToast((GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t('share.status.unavailable', 'Sharing is unavailable on this device') : 'Sharing is unavailable on this device');
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

var rightSidebar=qs('.gg-blog-sidebar--right',main),commentsPanel=qs('#ggPanelComments',main)||qs('[data-gg-panel="comments"]',main)||(rightSidebar?qs('[data-gg-panel="comments"]',rightSidebar):null),infoPanelRight=rightSidebar?qs('[data-gg-panel="info"]',rightSidebar):null,infoCardPost=infoPanelRight?qs('#gg-postinfo',infoPanelRight):null;
if(infoCardPost) infoCardPost.hidden=false;
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
var icon = document.createElement('span');
icon.setAttribute('aria-hidden', 'true');
icon.className = 'gg-icon material-symbols-rounded';
icon.textContent = 'image';
btn.appendChild(icon);
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
GG.core.state.toggle(b, 'active', !!on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function focusNoScroll(el){
if(!el||typeof el.focus!=='function')return;
var x=w.pageXOffset||0,y=w.pageYOffset||0;
try{el.focus({preventScroll:true});}
catch(_){try{el.focus();w.scrollTo(x,y);}catch(__){}}
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
var rightOpen=rightState()==='open',mode=rightMode(),focusOn=GG.core.state.has(document.body,'focus-mode'),showComments=rightOpen&&mode==='comments',showInfo=rightOpen&&mode==='info';
setBtnActive('info',showInfo);setBtnActive('comments',showComments);setFocusIcon(focusOn);
if(commentsPanel){
commentsPanel.setAttribute('tabindex','-1');
commentsPanel.setAttribute('aria-hidden', showComments ? 'false' : 'true');
commentsPanel.setAttribute('inert','');
GG.core.state.remove(commentsPanel,'closing');
if(showComments){
commentsPanel.hidden=false;
commentsPanel.removeAttribute('inert');
GG.core.state.remove(commentsPanel,'hidden');
GG.core.state.add(commentsPanel,'open');
focusNoScroll(commentsPanel);
}else{
GG.core.state.remove(commentsPanel,'open');
GG.core.state.add(commentsPanel,'hidden');
commentsPanel.hidden=true;
}
}
if(infoPanelRight){infoPanelRight.hidden=!showInfo;infoPanelRight.setAttribute('inert','');infoPanelRight.setAttribute('tabindex','-1');if(showInfo){var infoFocus=qs('#gg-postinfo',infoPanelRight)||infoPanelRight;infoPanelRight.removeAttribute('inert');focusNoScroll(infoFocus);}}
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
if (useMode === 'comments') {
  if(GG.modules&&GG.modules.Comments&&typeof GG.modules.Comments.ensureLoaded==='function') GG.modules.Comments.ensureLoaded({fromPrimaryAction:true,scroll:false});
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
else{
  if(GG.modules&&GG.modules.Comments&&typeof GG.modules.Comments.ensureLoaded==='function') GG.modules.Comments.ensureLoaded({fromPrimaryAction:true,scroll:false});
  showRightPanel('comments');
}
}
function toggleInfo(triggerBtn){
if(rightState() === 'open' && rightMode() === 'info') hideRightPanel(triggerBtn);
else showRightPanel('info');
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
  toggleInfo(btn);
  return;
}

if(act === 'focus'){
  setFocus(!GG.core.state.has(document.body, 'focus-mode'));
  return;
}

if(act === 'save'){ savePost(article); return; }

if(act === 'comments'){
  toggleComments(btn);
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

// Deprecated non-active: retained for backward compatibility, not wired in GG.app.plan.
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
      window.scrollTo({ top: maxY, behavior: GG.services.a11y.scrollBehavior() });
    }else{
      window.scrollTo({ top: 0, behavior: GG.services.a11y.scrollBehavior() });
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

// Deprecated non-active: retained for backward compatibility, not wired in GG.app.plan.
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

GG.modules.LoadMore = GG.modules.LoadMore || (function(){
	function resolveImpl(){
	  return GG.modules && GG.modules.listingLoadMore ? GG.modules.listingLoadMore : null;
	}
	function run(method, root){
	  var impl = resolveImpl();
	  if (impl && typeof impl[method] === 'function') {
	    impl[method](root || document);
	    return;
	  }
	  if (GG.boot && typeof GG.boot.loadModule === 'function') {
	    GG.boot.loadModule('ui.bucket.listing.js').then(function(){
	      var loaded = resolveImpl();
	      if (loaded && typeof loaded[method] === 'function') loaded[method](root || document);
	    }).catch(function(){});
	  }
	}
	function init(root){ run('init', root); }
	function rehydrate(root){ run('rehydrate', root); }
	return { init: init, rehydrate: rehydrate };
})();

// Deprecated non-active: retained for backward compatibility, not wired in GG.app.plan.
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
    if (GG.services && GG.services.images && typeof GG.services.images.setIntrinsicDims === 'function') {
      GG.services.images.setIntrinsicDims(img, 100, 148);
    }
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

  feed.textContent = '';
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
  feed.scrollTo({ left: offset, behavior: smooth ? GG.services.a11y.scrollBehavior() : 'auto' });
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
var TOC_CAP = 3;
var TOC_TTL_MS = 6e5;
var TOC_LRU_MAX = 24;
var TOC_HINT_LOCK = '';
var tocCache = Object.create(null);
var tocPending = Object.create(null);
var tocAborters = Object.create(null);
var postMetaCache = new Map();
var INFO_DEBUG = false;

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
try{ var envMeta=qs('meta[name="gg-env"]'),envVal=String(envMeta&&envMeta.getAttribute?envMeta.getAttribute('content'):'').toLowerCase().trim(); INFO_DEBUG=envVal==='lab'; }catch(_){}
function infoDebug(msg,val){ if(!INFO_DEBUG||!window.console||typeof console.debug!=='function') return; try{ console.debug(msg,val); }catch(_){} }
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

function isListingLikeSurface(){
if (!main) return false;
var surface = String(main.getAttribute('data-gg-surface') || '').toLowerCase();
var homeState = String(main.getAttribute('data-gg-home-state') || '').toLowerCase();
return surface === 'feed' || surface === 'listing' || (surface === 'home' && homeState !== 'landing');
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
var card = null;
if(!panel) return false;
card = qs('.gg-editorial-preview',panel);
if(!card) return false;
return true;
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
function setHref(sel,val,src){ var el=qs(sel,panel); if(!el) return; el.setAttribute('href',val||'#'); if(src) el.setAttribute('data-src',src); }
function setS(key, val){ setText('[data-s="'+key+'"]', val); }
function setImg(src, alt){
var img = qs('.gg-info-panel__thumb-img', panel);
if (!img) return;
var wrap = closest(img, '.gg-epanel__media') || closest(img, '.gg-editorial-preview__media') || img.parentElement;
if (!wrap) return;
if (!src) {
img.onload = null;
img.onerror = null;
img.removeAttribute('src');
img.style.display = 'none';
GG.core.state.remove(wrap, 'ready');
GG.core.state.add(wrap, 'noimg');
wrap.style.display = '';
return;
}
GG.core.state.remove(wrap, 'noimg');
GG.core.state.remove(wrap, 'ready');
wrap.style.display = '';
img.style.display = '';
img.loading = 'eager';
img.decoding = 'async';
img.alt = alt || '';
img.onload = function(){
  GG.core.state.remove(wrap, 'noimg');
  GG.core.state.add(wrap, 'ready');
};
img.onerror = function(){
  img.onload = null;
  img.onerror = null;
  img.removeAttribute('src');
  img.style.display = 'none';
  GG.core.state.remove(wrap, 'ready');
  GG.core.state.add(wrap, 'noimg');
};
img.src = src;
if (img.complete && img.naturalWidth > 0) {
  GG.core.state.remove(wrap, 'noimg');
  GG.core.state.add(wrap, 'ready');
}
}

var PANEL_ICON_TOKENS = Object.freeze({
title: 'article',
author: 'person',
contributors: 'groups',
labels: 'label',
tags: 'sell',
date: 'calendar_today',
updated: 'event_repeat',
comments: 'comment',
readtime: 'schedule',
snippet: 'text_snippet',
toc: 'toc'
});

function setPanelIcon(name, token){
var row = qs('[data-row="'+name+'"]', panel), icon = row ? qs('.gg-epanel__icon', row) : null;
if (icon) icon.textContent = token || '';
}

function setPanelCtaIcon(token){
var icon = qs('.gg-epanel__cta .gg-icon', panel);
if (icon) icon.textContent = token || '';
}

function syncPanelIconTokens(active){
var key = '';
for (key in PANEL_ICON_TOKENS){
  if (!Object.prototype.hasOwnProperty.call(PANEL_ICON_TOKENS, key)) continue;
  setPanelIcon(key, active ? PANEL_ICON_TOKENS[key] : '');
}
setPanelCtaIcon(active ? 'visibility' : '');
}

function setRow(name, visible){ var row = qs('[data-row="'+name+'"]', panel); if (row) row.hidden = !visible; }
function cleanText(raw){ return String(raw || '').replace(/\s+/g, ' ').trim(); }
function cardAttr(card, name){ return card ? cleanText(card.getAttribute(name) || '') : ''; }
function splitList(raw, rx){ var src=cleanText(raw),parts=src?src.split(rx||/\s*[;,]\s*/):[],out=[],i=0,text=''; for(i=0;i<parts.length;i++){ text=cleanText(parts[i]); if(text) out.push(text); } return out; }
function clipText(raw,max){ var txt=cleanText(raw),n=parseInt(max,10)||0; if(!txt||n<8||txt.length<=n) return txt; return txt.slice(0,n).replace(/[.,;:!?\s]+$/,'')+'...'; }
function phraseKey(raw){ return cleanText(raw||'').toLowerCase().replace(/[^a-z0-9\s]+/g,' ').replace(/\s+/g,' ').trim(); }
function phraseWords(raw){ var key=phraseKey(raw); return key?key.split(' ').filter(Boolean):[]; }
function tidySnippet(raw){
var txt=cleanText(raw||'');
if(!txt) return '';
txt=txt.replace(/^[>\-*#\d\.\)\s]+/,'');
txt=txt.replace(/^(title|written by|contributors?|labels?|tags?|date|updated|comments?|read time|snippet|table of contents|toc)\b[:\s-]*/i,'');
txt=txt.replace(/\b(read this post|continue reading|read more)\b\s*$/i,'');
return cleanText(txt);
}
function snippetOutlineLike(raw){
var txt=cleanText(raw||''),lower=txt.toLowerCase(),words=phraseWords(txt);
if(!txt) return true;
if(/^(?:level|heading|section|chapter|part)\s*[0-9ivx]+\b/.test(lower)) return true;
if(/^(?:[0-9]{1,2}|[ivx]{1,4})[.)]\s+[a-z]/i.test(txt)) return true;
if(/^\b(?:introduction|overview|summary|conclusion|faq)\b[:\s-]/i.test(txt)) return true;
if(!/[.!?]/.test(txt) && words.length<=10 && words.every(function(w){ return w.length>2; })) return true;
if(/\s*[>\/|]\s*/.test(txt) && words.length<14) return true;
return false;
}
function snippetWeak(raw){
var txt=cleanText(raw||''),lower=txt.toLowerCase(),words=txt?txt.split(/\s+/).length:0;
if(!txt) return true;
if(words<6||txt.length<36) return true;
if(/^(table of contents|toc|contents?)\b/.test(lower)) return true;
if(snippetOutlineLike(txt)) return true;
if(/^(title|written by|contributors?|labels?|tags?|date|updated|comments?|read time|snippet)\b/.test(lower)) return true;
if(!/[a-z0-9]/i.test(txt)) return true;
return false;
}
function curateSnippet(raw,max){
var txt=tidySnippet(raw||'');
if(!txt) return '';
txt=clipText(txt,max||180);
if(snippetWeak(txt)) return '';
return txt;
}
function scoreSnippet(raw){
var txt=cleanText(raw||''),score=0;
if(!txt) return -1;
if(txt.length>=72) score+=2;
if(txt.length>=120) score+=1;
if(/[.!?]/.test(txt)) score+=2;
if(/^[A-Z]/.test(txt)) score+=1;
if(/\b(table of contents|toc|contents?)\b/i.test(txt)) score-=4;
if(/[:;]$/.test(txt)) score-=1;
return score;
}
function headingWeak(raw){
var txt=cleanText(raw||''),lower=txt.toLowerCase(),words=txt?txt.split(/\s+/).length:0;
if(!txt) return true;
if(txt.length<6||txt.length>90) return true;
if(words<2) return true;
if(/^(table of contents|toc|contents?|overview|summary|daftar isi|ringkasan)$/.test(lower)) return true;
if(/^(title|written by|contributors?|labels?|tags?|date|updated|comments?|read time|snippet)\b/.test(lower)) return true;
if(/^h[1-6]\b/.test(lower)) return true;
return false;
}
function curateHeading(raw){
var txt=cleanText(String(raw||'').replace(/^([0-9]+[.)-]\s*)+/,'').replace(/^#+\s*/,''));
if(headingWeak(txt)) return '';
return clipText(txt,72);
}
function snippetConflictsWithToc(snippet,rows){
var s=phraseKey(snippet),srcWords=s?s.split(' ').filter(Boolean):[],i=0,row='',k='',rowWords=[],j=0,common=0,minCommon=0,firstChunk='';
if(!s||!Array.isArray(rows)||!rows.length) return false;
firstChunk=srcWords.slice(0,9).join(' ');
for(i=0;i<rows.length;i++){
  row=rows[i]&&rows[i].text?rows[i].text:'';
  k=phraseKey(row);
  if(!k) continue;
  rowWords=k.split(' ').filter(Boolean);
  if(!rowWords.length) continue;
  if(s===k) return true;
  if(s.indexOf(k)===0 && rowWords.length>=2) return true;
  if(k.indexOf(s)===0 && srcWords.length>=4) return true;
  common=0;
  for(j=0;j<rowWords.length;j++) if(firstChunk.indexOf(rowWords[j])>=0) common++;
  minCommon=Math.min(4,rowWords.length,srcWords.length);
  if(minCommon>=2 && common>=minCommon) return true;
}
return false;
}
function curateTocRows(rows){
var list=Array.isArray(rows)?rows:[],out=[],seen=Object.create(null),prevKey='',i=0,item=null,text='',key='',level=2;
for(i=0;i<list.length;i++){
  item=list[i]||{};
  text=curateHeading(item.text||'');
  if(!text) continue;
  key=phraseKey(text);
  if(!key||seen[key]) continue;
  if(prevKey&&((key.indexOf(prevKey)===0&&prevKey.length>=18)||(prevKey.indexOf(key)===0&&key.length>=18))) continue;
  seen[key]=1;
  prevKey=key;
  level=parseInt(item.level,10)||2;
  if(level<2) level=2;
  if(level>4) level=4;
  out.push({ text:text, level:level, href:item.href||'#' });
  if(out.length>=TOC_CAP) break;
}
if(out.length<2) return [];
return out;
}
function humanDate(raw){ var txt=cleanText(raw).replace(/februari/ig,'February'),m=txt.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/),y=0,mm=0,d=0,dt=null,opts={ weekday:'long', month:'long', day:'2-digit', year:'numeric' }; if(!txt) return ''; if(m){ y=parseInt(m[1],10)||0; mm=(parseInt(m[2],10)||1)-1; d=parseInt(m[3],10)||1; dt=new Date(Date.UTC(y,mm,d)); if(isFinite(dt.getTime())) return dt.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'2-digit', year:'numeric', timeZone:'UTC' }); } dt=new Date(txt); if(isFinite(dt.getTime())) return dt.toLocaleDateString('en-US',opts); return cleanText(raw); }
function readMinLabel(raw){ var txt=cleanText(raw),m,mins; if(!txt) return ''; m=txt.match(/(\d+)/); if(!m) return ''; mins=Math.max(1,parseInt(m[1],10)||1); return mins+' min read'; }
function parsePostMetaFromCard(card){ var svc=GG.services&&GG.services.postmeta&&typeof GG.services.postmeta.getFromContext==='function'?GG.services.postmeta:null,pm=svc&&card?svc.getFromContext(card):{ author:'',contributors:[],tags:[],updated:'',readMin:'',snippet:'' },meta=card?qs('.gg-postmeta,[data-gg-postmeta]',card):null,raw=''; if(!card) return pm||{}; pm=pm&&typeof pm==='object'?pm:{ author:'',contributors:[],tags:[],updated:'',readMin:'',snippet:'' }; if(meta&&meta.getAttribute){ raw=cleanText(meta.getAttribute('data-author')||meta.getAttribute('data-gg-author')||''); if(raw) pm.author=raw; raw=cleanText(meta.getAttribute('data-updated')||meta.getAttribute('data-gg-updated')||''); if(raw) pm.updated=raw; raw=cleanText(meta.getAttribute('data-read-min')||meta.getAttribute('data-readtime')||meta.getAttribute('data-gg-read-min')||meta.getAttribute('data-gg-readtime')||''); if(raw) pm.readMin=raw; raw=cleanText(meta.getAttribute('data-snippet')||meta.getAttribute('data-gg-snippet')||''); if(raw) pm.snippet=raw; pm.contributors=splitList(meta.getAttribute('data-contributors')||meta.getAttribute('data-gg-contributors')||'',/\s*[;,]\s*/); pm.tags=splitList(meta.getAttribute('data-tags')||meta.getAttribute('data-gg-tags')||'',/\s*[;,]\s*/); } if(!pm.author) pm.author=cardAttr(card,'data-author-name')||cardAttr(card,'data-author'); if(!pm.updated) pm.updated=cardAttr(card,'data-updated')||cardAttr(card,'data-gg-updated'); if(!pm.readMin) pm.readMin=cardAttr(card,'data-read-min')||cardAttr(card,'data-readtime'); if(!pm.snippet) pm.snippet=cardAttr(card,'data-snippet')||cardAttr(card,'data-gg-snippet'); if(!Array.isArray(pm.contributors)||!pm.contributors.length) pm.contributors=splitList(cardAttr(card,'data-contributors'),/\s*[;,]\s*/); if(!Array.isArray(pm.tags)||!pm.tags.length) pm.tags=splitList(cardAttr(card,'data-tags'),/\s*[;,]\s*/); return pm; }
function calcReadTime(root){ if(!root) return ''; var clone=root.cloneNode(true),drop=clone.querySelectorAll('nav,footer'),i=0,text=''; for(;i<drop.length;i++) drop[i].remove(); text=cleanText(clone.textContent||''); if(!text) return ''; return Math.max(1,Math.ceil(text.split(/\s+/).length/200))+' min read'; }
function extractPreviewSnippet(root){
if(!root||!root.cloneNode) return '';
var clone=root.cloneNode(true),drop=clone.querySelectorAll('script,style,noscript,svg,pre,code,figure,figcaption,blockquote,table,h1,h2,h3,h4,.gg-postmeta,.gg-info-panel,.gg-toc,[hidden],[aria-hidden=\"true\"]'),i=0,text='',nodes=null,j=0,candidates=[],safeCandidates=[],headings=[],headingRows=[],pick='',score=-1,bestScore=-1;
for(;i<drop.length;i++) if(drop[i]&&drop[i].remove) drop[i].remove();
headings=Array.prototype.slice.call(root.querySelectorAll('h1,h2,h3,h4')).map(function(node){ return node&&node.textContent?node.textContent:''; }).map(curateHeading).filter(Boolean);
headingRows=headings.map(function(h){ return { text:h }; });
nodes=clone.querySelectorAll('p');
for(j=0;j<nodes.length;j++){
  text=curateSnippet(nodes[j]&&nodes[j].textContent?nodes[j].textContent:'',220);
  if(text) candidates.push(text);
}
safeCandidates=candidates.filter(function(item){ return !snippetConflictsWithToc(item, headingRows); });
if(safeCandidates.length) candidates=safeCandidates;
if(!candidates.length){
  text=curateSnippet(clone.textContent||'',220);
  if(text&&snippetConflictsWithToc(text,headingRows)) text='';
  return text;
}
for(j=0;j<candidates.length;j++){
  score=scoreSnippet(candidates[j]);
  if(score>bestScore){ bestScore=score; pick=candidates[j]; }
}
return pick||candidates[0]||'';
}
function authorDir(){ return GG.services&&GG.services.authorsDir ? GG.services.authorsDir : null; }
function authorFallback(raw){ var svc=authorDir(),name=cleanText(raw),slug=''; if(svc&&svc.fallback) return svc.fallback(raw); slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); return { slug:slug, name:name||'Author', href:slug?('/p/'+slug+'.html'):'#', src:'fallback' }; }
function tagDir(){ return GG.services&&GG.services.tagsDir ? GG.services.tagsDir : null; }
function tagSlug(raw){ var svc=tagDir(),v=''; if(svc&&svc.slugify) return svc.slugify(raw); v=cleanText(raw).toLowerCase().replace(/^#/,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]+/g,'').replace(/^-+|-+$/g,''); return v; }
function tagHref(key){ return key?('/p/tags.html?tag='+encodeURIComponent(key)):'#'; }
function tagFallback(raw){ var x=raw&&typeof raw==='object'?raw:{},key=tagSlug(x.key||x.text||raw),text=cleanText(x.text||x.name||raw)||key; return { key:key, text:text, href:tagHref(key) }; }
function setTocHint(message){
var hint = qs('[data-gg-slot="toc-hint"]', panel), text = String(message || '').trim();
if (!hint) return;
hint.textContent = text;
hint.hidden = !text;
}

function renderTocSkeleton(count, hint){
var list = qs('[data-gg-slot="toc"]', panel), n = parseInt(count, 10), i = 0, li, row, line;
if(!list) return;
setRow('toc', true);
if(!isFinite(n) || n < 1) n = 6;
if(n > 8) n = 8;
list.textContent = '';
for(; i < n; i++){
  li = document.createElement('li');
  li.className = 'gg-info-panel__tocitem gg-info-panel__tocitem--skeleton';
  row = document.createElement('span');
  row.className = 'gg-info-panel__toclink';
  line = document.createElement('span');
  line.className = 'gg-info-panel__tocline';
  row.appendChild(line);
  li.appendChild(row);
  list.appendChild(li);
}
setTocHint(hint || '');
}
function renderTocItems(items){
var list = qs('[data-gg-slot="toc"]', panel), rows = Array.isArray(items) ? items.slice(0, TOC_CAP) : [], i = 0, item, li, level, link, num, text;
if(!list) return;
list.textContent = '';
if(!rows.length){
  setTocHint('');
  setRow('toc', false);
  return;
}
setRow('toc', true);
for(; i < rows.length; i++){
  item = rows[i] || {};
  li = document.createElement('li');
  level = parseInt(item.level, 10);
  if(!isFinite(level) || level < 1) level = 1;
  if(level > 4) level = 4;
  li.className = 'gg-info-panel__tocitem gg-info-panel__toclvl-' + level;
  link = document.createElement('a');
  link.className = 'gg-info-panel__toclink';
  link.href = item.href || '#';
  num = document.createElement('span');
  num.className = 'gg-info-panel__tocnum';
  num.textContent = String(i + 1).padStart(2, '0');
  text = document.createElement('span');
  text.className = 'gg-info-panel__toctext';
  text.textContent = item.text || '';
  link.appendChild(num);
  link.appendChild(text);
  li.appendChild(link);
  list.appendChild(li);
}
setTocHint('');
}

function toAbsUrl(raw){ try { return new URL(String(raw || ''), window.location.href).toString(); } catch (_) { return ''; } }
function normalizePostUrl(raw){ var abs=toAbsUrl(raw),u=null,m=''; if(!abs) return ''; try{ u=new URL(abs); m=cleanText(u.searchParams.get('m')||''); if(m==='0'||m==='1') u.searchParams.delete('m'); u.hash=''; return u.toString(); }catch(_){ return abs; } }
function tocCacheKey(url){ var abs = normalizePostUrl(url), parsed; if (!abs) return ''; try { parsed = new URL(abs); return parsed.origin + parsed.pathname + parsed.search; } catch (_) { return abs; } }

function pruneToc(now){ var keys=Object.keys(tocCache),i=0,key='',rows=null,ts=0,drop=''; for(;i<keys.length;i++){ key=keys[i]; rows=tocCache[key]; ts=rows&&rows._t?rows._t:0; if(!rows||!Array.isArray(rows)||(TOC_TTL_MS>0&&ts&&now-ts>TOC_TTL_MS)){ delete tocCache[key]; postMetaCache.delete(key); } } keys=Object.keys(tocCache); while(keys.length>TOC_LRU_MAX){ drop=keys.shift(); delete tocCache[drop]; postMetaCache.delete(drop); } }
function readToc(key){ var rows=tocCache[key],now=Date.now(); if(!rows||!Array.isArray(rows)) return null; if(TOC_TTL_MS>0&&rows._t&&now-rows._t>TOC_TTL_MS){ delete tocCache[key]; postMetaCache.delete(key); return null; } rows._t=now; delete tocCache[key]; tocCache[key]=rows; return rows; }
function writeToc(key,rows){ var out=Array.isArray(rows)?rows.slice(0,TOC_CAP):[]; out._t=Date.now(); tocCache[key]=out; pruneToc(out._t); }
function abortToc(keepKey){ for(var key in tocAborters){ if(keepKey&&key===keepKey) continue; try{ if(tocAborters[key]) tocAborters[key].abort(); }catch(_){} delete tocAborters[key]; delete tocPending[key]; } }
function parseHtmlSafe(html,url){ var fn=GG&&GG.core&&typeof GG.core.parseHtmlDoc==='function'?GG.core.parseHtmlDoc:null; if(!fn&&typeof parseHtmlDoc==='function') fn=parseHtmlDoc; if(!fn) return null; try{ return fn(html,url); }catch(_){ return null; } }

function parsePostmetaFromDoc(doc){
var out={ author:'', contributors:[], tags:[], updated:'', readMin:'', snippet:'' },nodes=null,best=null,bestScore=-1,i=0,node=null,a='',u='',r='',s='',c=[],t=[],score=0,seen=null;
if(!doc||!doc.querySelectorAll) return out;
nodes=doc.querySelectorAll('.gg-postmeta,[data-gg-postmeta]');
for(i=0;i<nodes.length;i++){
  node=nodes[i];
  a=cleanText(node&&node.getAttribute?(node.getAttribute('data-author')||node.getAttribute('data-gg-author')||node.getAttribute('author')):'');
  u=cleanText(node&&node.getAttribute?(node.getAttribute('data-updated')||node.getAttribute('data-gg-updated')):'');
  r=cleanText(node&&node.getAttribute?(node.getAttribute('data-read-min')||node.getAttribute('data-readtime')||node.getAttribute('data-gg-read-min')||node.getAttribute('data-gg-readtime')):'');
  s=cleanText(node&&node.getAttribute?(node.getAttribute('data-snippet')||node.getAttribute('data-gg-snippet')):'');
  c=splitList(node&&node.getAttribute?(node.getAttribute('data-contributors')||node.getAttribute('data-gg-contributors')):'',/\s*[;,]\s*/);
  t=splitList(node&&node.getAttribute?(node.getAttribute('data-tags')||node.getAttribute('data-gg-tags')):'',/\s*[;,]\s*/);
  score=(a?2:0)+(u?2:0)+(r?1:0)+(s?2:0)+c.length*3+t.length*4;
  if(score>bestScore){ bestScore=score; best={ author:a, updated:u, readMin:r, snippet:s, contributors:c, tags:t }; }
}
if(!best) return out;
out.author=cleanText(best.author||'');
out.updated=cleanText(best.updated||'');
out.readMin=cleanText(best.readMin||'');
out.snippet=cleanText(best.snippet||'');
seen={};
for(i=0;i<(best.contributors||[]).length;i++){
  a=cleanText(best.contributors[i]);
  if(!a) continue;
  if(out.author&&a.toLowerCase()===out.author.toLowerCase()) continue;
  if(seen[a.toLowerCase()]) continue;
  seen[a.toLowerCase()]=1;
  out.contributors.push(a);
}
seen={};
for(i=0;i<(best.tags||[]).length;i++){
  a=cleanText(best.tags[i]);
  if(!a) continue;
  if(seen[a.toLowerCase()]) continue;
  seen[a.toLowerCase()]=1;
  out.tags.push(tagFallback(a));
}
return out;
}

function parseHeadingItems(html,sourceUrl){
var doc=parseHtmlSafe(html,sourceUrl),root=null,out=[],headings,max=0,pm=null,author='',contributors=[],tags=[],updated='',readTime='',snippet='',i=0,node=null,text='',headingId='',href='',baseHref='',level=2,svc=GG.services&&GG.services.postmeta&&typeof GG.services.postmeta.getFromContext==='function'?GG.services.postmeta:null;
if(!doc) return out;
root=doc.querySelector('.gg-post__content.post-body.entry-content, .post-body.entry-content, .post-body.post-body-container, .post-outer .post-body, .post-body');
if(!root) root=doc.querySelector('article .entry-content, .entry-content, article, main');
try{ pm=parsePostmetaFromDoc(doc); }catch(_){ pm={}; }
if((!pm||(!pm.author&&!(pm.contributors&&pm.contributors.length)&&!(pm.tags&&pm.tags.length)&&!pm.updated&&!pm.readMin&&!pm.snippet))&&svc){
  try{ pm=svc.getFromContext(doc)||pm; }catch(_){}
}
author=cleanText(pm&&pm.author||'');contributors=Array.isArray(pm&&pm.contributors)?pm.contributors:[];tags=(Array.isArray(pm&&pm.tags)?pm.tags:[]).map(tagFallback).filter(function(x){return x&&x.text;});updated=cleanText(pm&&pm.updated||'');readTime=readMinLabel(pm&&pm.readMin||'');if(!readTime) readTime=calcReadTime(root);snippet=curateSnippet(pm&&pm.snippet||'',200);if(!snippet) snippet=extractPreviewSnippet(root);
if(!root){ out._m={t:tags,a:author,c:contributors,u:updated,r:readTime,s:snippet}; return out; }
headings=root.querySelectorAll('h1,h2,h3,h4');max=Math.min(headings.length,TOC_CAP);baseHref=normalizePostUrl(sourceUrl)||sourceUrl||'#';
for(i=0;i<max;i++){
  try{
    node=headings[i];
    if(!node||(node.closest&&node.closest('pre,code,[hidden],[aria-hidden=\"true\"]'))) continue;
    level=parseInt((node.tagName||'').slice(1),10)||1;
    if(level<2||level>4) continue;
    text=curateHeading(node.textContent||'');
    if(!text) continue;
    headingId=(node.getAttribute('id')||'').trim();
    href=baseHref;
    if(headingId){
      try{ href+='#'+encodeURIComponent(headingId); }catch(_){ href+='#'+headingId; }
    }
    out.push({text:text,level:level,href:href});
  }catch(_){ }
}
out=curateTocRows(out);
if(snippet&&snippetConflictsWithToc(snippet,out)) snippet='';
if(!snippet) snippet=extractPreviewSnippet(root);
if(snippet&&snippetConflictsWithToc(snippet,out)) snippet='';
out._m={t:tags,a:author,c:contributors,u:updated,r:readTime,s:snippet};
return out;
}

function buildHydrationFallback(html,sourceUrl){
var doc=parseHtmlSafe(html,sourceUrl),root=null,out=[],headings,max=0,pm=null,author='',contributors=[],tags=[],updated='',readTime='',snippet='',i=0,node=null,text='',headingId='',href='',baseHref='',level=2,svc=GG.services&&GG.services.postmeta&&typeof GG.services.postmeta.getFromContext==='function'?GG.services.postmeta:null;
if(!doc) return { items: [], meta: null };
root=doc.querySelector('.gg-post__content.post-body.entry-content, .post-body.entry-content, .post-body.post-body-container, .post-outer .post-body, .post-body');
if(!root) root=doc.querySelector('article .entry-content, .entry-content, article, main');
try{ pm=parsePostmetaFromDoc(doc); }catch(_){ pm={}; }
if((!pm||(!pm.author&&!(pm.contributors&&pm.contributors.length)&&!(pm.tags&&pm.tags.length)&&!pm.updated&&!pm.readMin&&!pm.snippet))&&svc){
  try{ pm=svc.getFromContext(doc)||pm; }catch(_){}
}
author=cleanText(pm&&pm.author||'');
contributors=Array.isArray(pm&&pm.contributors)?pm.contributors:[];
tags=(Array.isArray(pm&&pm.tags)?pm.tags:[]).map(tagFallback).filter(function(x){return x&&x.text;});
updated=cleanText(pm&&pm.updated||'');
readTime=readMinLabel(pm&&pm.readMin||'');
if(!readTime) readTime=calcReadTime(root);
snippet=curateSnippet(pm&&pm.snippet||'',200);
if(!snippet) snippet=extractPreviewSnippet(root);
if(root){
  headings=root.querySelectorAll('h1,h2,h3,h4');
  max=Math.min(headings.length,TOC_CAP);
  baseHref=normalizePostUrl(sourceUrl)||sourceUrl||'#';
  for(i=0;i<max;i++){
    try{
      node=headings[i];
      if(!node||(node.closest&&node.closest('pre,code,[hidden],[aria-hidden=\"true\"]'))) continue;
      level=parseInt((node.tagName||'').slice(1),10)||1;
      if(level<2||level>4) continue;
      text=curateHeading(node.textContent||'');
      if(!text) continue;
      headingId=(node.getAttribute('id')||'').trim();
      href=baseHref;
      if(headingId){
        try{ href+='#'+encodeURIComponent(headingId); }catch(_){ href+='#'+headingId; }
      }
      out.push({text:text,level:level,href:href});
    }catch(_){}
  }
}
out=curateTocRows(out);
if(snippet&&snippetConflictsWithToc(snippet,out)) snippet='';
if(!snippet) snippet=extractPreviewSnippet(root);
if(snippet&&snippetConflictsWithToc(snippet,out)) snippet='';
return { items: out, meta: { t: tags, a: author, c: contributors, u: updated, r: readTime, s: snippet } };
}

function hasPreviewPayload(items){
var m=items&&items._m||0;
return !!(items&&items.length||m.t&&m.t.length||m.c&&m.c.length||cleanText(m.s)||cleanText(m.a)||cleanText(m.r)||cleanText(m.u));
}
function previewPayloadOk(html,abs){ try{ return hasPreviewPayload(parseHeadingItems(html,abs)); }catch(_){ return false; } }

function postLikeHtml(raw){ return /(\bpost-body\b|\bentry-content\b|\bgg-postmeta\b|data-gg-module=['\"]post-detail['\"]|class=['\"][^'\"]*\bgg-post\b)/i.test(String(raw||'')); }
function mobilePostUrl(raw){ try{ var u=new URL(String(raw||'')); u.searchParams.set('m','1'); return u.toString(); }catch(_){ return String(raw||''); } }
function fetchPostHtml(url,signal){
var abs=normalizePostUrl(url),opts={ method:'GET', cache:'no-store', credentials:'same-origin', signal:signal },fallback='';
if(!abs) return Promise.reject(new Error('u'));
if(!window.fetch) return Promise.reject(new Error('n'));
return window.fetch(mobilePostUrl(abs),opts).then(function(res){
  if(!res||!res.ok) throw new Error('f');
  return res.text().then(function(html){
    var txt=String(html||''),moved=/(<title>\s*Moved Temporarily\s*<\/title>|<h1>\s*Moved Temporarily\s*<\/h1>)/i.test(txt),brokenSubst=/Can't find substitution for tag\s*\[post\./i.test(txt),mustFallback=(!postLikeHtml(txt)||moved||brokenSubst||!previewPayloadOk(txt,abs));
    if(!mustFallback) return txt;
    fallback=abs;
    return window.fetch(fallback,opts).then(function(next){
      if(!next||!next.ok) return txt;
      return next.text().then(function(nextHtml){
        var out=String(nextHtml||'');
        if(!postLikeHtml(out)) return txt;
        if(brokenSubst||moved) return out;
        return previewPayloadOk(out,abs)?out:txt;
      });
    }).catch(function(){ return txt; });
  });
});
}
function clearHoverIntent(){ if(hoverIntentTimer){ clearTimeout(hoverIntentTimer); hoverIntentTimer = 0; } hoverIntentCardKey = ''; }

function resolveTocItems(href, opts){
opts = opts || {};
var key = tocCacheKey(href), abs = normalizePostUrl(href), cached;
if (!key || !abs) return Promise.resolve([]);
cached = readToc(key);
if (Array.isArray(cached)) return Promise.resolve(cached);
if (opts.abortOthers) abortToc(key);
if (!tocPending[key]) {
var controller = window.AbortController ? new window.AbortController() : null;
tocAborters[key] = controller;
infoDebug('InfoPanel fetch start', abs);
tocPending[key] = fetchPostHtml(abs, controller ? controller.signal : null).then(function(html){
  var items = [];
  try{ items = parseHeadingItems(html, abs); }catch(_){ items = []; }
  if (!Array.isArray(items)) items = [];
  var meta = items && items._m ? items._m : null,metaStrong=!!(meta&&((meta.t&&meta.t.length)||meta.a||(meta.c&&meta.c.length)||meta.u||meta.s)),panelKey='',fallback=null,fallbackItems=[],fallbackMeta=null,fallbackStrong=false;
  if(!items.length||!metaStrong){
    fallback=buildHydrationFallback(html, abs);
    fallbackItems=fallback&&Array.isArray(fallback.items)?fallback.items:[];
    fallbackMeta=fallback&&fallback.meta?fallback.meta:null;
    fallbackStrong=!!(fallbackMeta&&((fallbackMeta.t&&fallbackMeta.t.length)||fallbackMeta.a||(fallbackMeta.c&&fallbackMeta.c.length)||fallbackMeta.u||fallbackMeta.s));
    if(fallbackItems.length||fallbackStrong){
      items=fallbackItems;
      items._m=fallbackMeta;
      meta=fallbackMeta;
      metaStrong=fallbackStrong;
    }
  }
  infoDebug('InfoPanel fetch meta', meta || {});
  if (meta && ((meta.t && meta.t.length) || meta.a || (meta.c && meta.c.length) || meta.u || meta.r || meta.s)) postMetaCache.set(key, meta);
  else postMetaCache.delete(key);
  if (!items.length && !metaStrong){ writeToc(key, []); return []; }
  writeToc(key, items);
  panelKey=panel&&panel.__gK?String(panel.__gK):'';
  // Apply hydrated metadata/Toc as soon as the active card key matches.
  // Relying on "panel open" introduces a race when fetch resolves before UI state flips.
  if(panel&&panelKey&&panelKey===key){ applyPostMeta(key); renderTocItems(items||[]); }
  return items;
}).catch(function(err){
  if (controller && controller.signal && controller.signal.aborted) return null;
  infoDebug('InfoPanel fetch fail', err);
  throw err;
}).finally(function(){ delete tocPending[key]; delete tocAborters[key]; });
}
return tocPending[key];
}

function prefetchToc(href){ return resolveTocItems(href, { abortOthers: false }).catch(function(){ return []; }); }

function hydrateToc(card, href){ if(!card) return Promise.resolve([]); var norm=normalizePostUrl(href),key=tocCacheKey(norm),abs=normalizePostUrl(norm),cached; if(!key||!abs){ renderTocSkeleton(3,TOC_HINT_LOCK); return Promise.resolve([]); } cached=readToc(key); if(Array.isArray(cached)){ applyPostMeta(key); renderTocItems(cached); return Promise.resolve(cached); } return resolveTocItems(abs,{ abortOthers:true }).then(function(items){ var panelKey=panel&&panel.__gK?String(panel.__gK):''; if(items===null) return []; if(panel&&(!panelKey||panelKey===key)){ applyPostMeta(key); renderTocItems(items||[]); } return Array.isArray(items)?items:[]; }).catch(function(){ var panelKey=panel&&panel.__gK?String(panel.__gK):''; if(panel&&(!panelKey||panelKey===key)){ if(panel&&!panel.__iC){ setRow('contributors',false); fillChipsToSlot('contributors',[],12); } if(panel&&!panel.__iT){ setRow('tags',false); fillChipsToSlot('tags',[],14); } if(panel&&!panel.__iU){ setRow('updated',false); setS('updated',''); } if(panel&&!panel.__iR){ setRow('readtime',false); setS('readtime',''); } renderTocItems([]); } return []; }); }
function updateTocForCard(card, href){ var norm=normalizePostUrl(href); if(!card||!norm){ abortToc(''); renderTocSkeleton(3,TOC_HINT_LOCK); return; } var key=tocCacheKey(norm),cached; if(!key){ abortToc(''); renderTocSkeleton(3,TOC_HINT_LOCK); return; } cached=readToc(key); if(Array.isArray(cached)){ applyPostMeta(key); renderTocItems(cached); return; } abortToc(key); renderTocSkeleton(3,TOC_HINT_LOCK); hydrateToc(card, norm); }

function fillChipsToSlot(slot, items, max){
var chipRow = qs('[data-gg-slot="' + slot + '"]', panel), list = items || [], i = 0, x = null, href = '', el = null, tx = null, n = Math.min(list.length, max || 12);
if(!chipRow) return;
chipRow.textContent = '';
for(i = 0; i < n; i++){
  x = list[i] || {};
  href = cleanText(x.href || '');
  el = document.createElement(href ? 'a' : 'span');
  el.className = 'gg-chip';
  if(href){
    el.href = href;
    if(x.src) el.setAttribute('data-src', x.src);
  }
  tx = document.createElement('span');
  tx.className = 'gg-chip__text';
  tx.textContent = x.text || '';
  el.appendChild(tx);
  chipRow.appendChild(el);
}
}
function applyPostMeta(key){
var m=key?postMetaCache.get(key):null,t=[],c=[],u='',r='',s='',a='',list=[],chips=[],i=0,base=0,one=null,contrib=[],tocRows=key&&Array.isArray(tocCache[key])?tocCache[key]:[];
if(!m) return;
t=(Array.isArray(m.t)?m.t:[]).map(tagFallback).filter(function(x){ return x&&x.text; });
c=(Array.isArray(m.c)?m.c:[]).map(function(x){ return cleanText(typeof x==='string'?x:(x&&((x.name||x.text||x.slug)||''))); }).filter(Boolean);
u=humanDate(m.u||'');
r=readMinLabel(m.r||m.readMin||'')||cleanText(m.r||'');
s=curateSnippet(m.s||m.snippet||'',180);
if(s&&snippetConflictsWithToc(s,tocRows)) s='';
a=cleanText(m.a||'');
if(t.length){
  setRow('tags',true);
  fillChipsToSlot('tags',t,14);
} else if(!(panel&&panel.__iT)){
  setRow('tags',false);
  fillChipsToSlot('tags',[],14);
}
if(a) list.push(a);
for(i=0;i<c.length;i++){ if(c[i]&&(!a||c[i].toLowerCase()!==a.toLowerCase())) list.push(c[i]); }
if(list.length){
  for(i=0;i<list.length;i++){
    one=authorFallback(list[i]);
    chips.push({ text:one&&one.name||'', href:one&&one.href||'', src:one&&one.src||'fallback' });
  }
  base=a?1:0;
  if(a&&chips[0]){
    setS('author',chips[0].text);
    setHref('[data-s="author-link"]',chips[0].href||'#',chips[0].src||'fallback');
    setRow('author',!!chips[0].text);
  }
  contrib=chips.slice(base);
  if(contrib.length){
    setRow('contributors',true);
    fillChipsToSlot('contributors',contrib,12);
  }
  else if(!(panel&&panel.__iC)){ setRow('contributors',false); fillChipsToSlot('contributors',[],12); }
} else if(!(panel&&panel.__iC)){
  setRow('contributors',false);
  fillChipsToSlot('contributors',[],12);
}
if(r){
  setS('readtime',r);
  setRow('readtime',true);
} else if(!(panel&&panel.__iR)){ setS('readtime',''); setRow('readtime',false); }
if(u){
  setS('updated',u);
  setRow('updated',true);
} else if(!(panel&&panel.__iU)){ setS('updated',''); setRow('updated',false); }
if(s){ setS('snippet',s); setRow('snippet',true); }
else if(!(panel&&panel.__iS)||!hasS('snippet')){ setS('snippet',''); setRow('snippet',false); }
}

function extractLabels(card){ var seen={},tags=qsa('.gg-post-card__labels a[rel="tag"], .gg-post-card__label a[rel="tag"], a[rel="tag"]', card).map(function(a){ return { text:cleanText(a.textContent), href:cleanText(a.getAttribute('href')||'') }; }).filter(function(x){ var k=x.text.toLowerCase(); return k&&!seen[k]&&(seen[k]=1); }),a; if(tags.length) return tags; a=qs('.gg-post-card__label a[rel="tag"]', card); return a?[{ text:cleanText(a.textContent), href:cleanText(a.getAttribute('href')||'') }]:[]; }
function extractAuthor(card){ return { text:cardAttr(card,'data-author-name')||cardAttr(card,'data-author'), href:cardAttr(card,'data-author-url') }; }

function cardHref(card){
var titleLink = !card ? null : qs('.gg-post-card__title-link', card);
return titleLink ? (titleLink.getAttribute('href') || '#') : '#';
}

function cardKey(card){ return card ? String(card.getAttribute('data-id') || card.getAttribute('data-url') || '').trim() : ''; }

function estimateReadTime(card){ if(!card) return ''; var inline=qs('[data-slot="readtime"]', card),txt=readMinLabel(inline?inline.textContent:''); if(txt) return txt; return readMinLabel(cardAttr(card,'data-readtime')||cardAttr(card,'data-read-min')); }

function canHoverPreview(){
if (!main || !window.matchMedia) return false;
return isListingLikeSurface() && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function hasS(key){ var node=panel?qs('[data-s="'+key+'"]',panel):null,v=cleanText(node&&node.textContent?node.textContent:''); return !!v&&v!=='—'; }
function seedInitialPreview(){ return false; }

function openWithCard(card, trigger, opts){
if(!card) return;
opts=opts||{};
var p = opts.p===1;
ensurePanelSkeleton();
if(trigger) lastTrigger=trigger;
if(panel) panel.__gP=card;
if(panel){
  var previewCard = qs('.gg-editorial-preview', panel);
  if (previewCard) previewCard.hidden = false;
}
var titleLink=qs('.gg-post-card__title-link', card),href=cardHref(card),hrefFetch=normalizePostUrl(href)||href,title=cleanText(titleLink?titleLink.textContent:''),metaKey=tocCacheKey(hrefFetch),imgSrc=extractThumbSrc(card),dateNode=qs('.gg-post-card__date', card),commentsNode=qs('.gg-post-card__meta-item--comments', card),dateText=cleanText(dateNode&&dateNode.textContent?dateNode.textContent:'')||cardAttr(card,'data-date'),commentsText=cleanText(commentsNode&&commentsNode.textContent?commentsNode.textContent:''),author=extractAuthor(card),labels=extractLabels(card),cardMeta=parsePostMetaFromCard(card),authorText=cleanText(cardMeta.author||author.text),updatedText=humanDate(cardMeta.updated),readTimeText=readMinLabel(cardMeta.readMin||'')||estimateReadTime(card),quickSnippet=curateSnippet(cardMeta.snippet||'',170),hasCardSnippet=!!quickSnippet,af=null,instTags=(Array.isArray(cardMeta.tags)?cardMeta.tags:[]).map(tagFallback).filter(function(x){return x&&x.text;}),instContributors=(Array.isArray(cardMeta.contributors)?cardMeta.contributors:[]).map(function(x){return cleanText(typeof x==='string'?x:(x&&((x.name||x.text||x.slug)||'')));}).filter(function(x){return x&&(!authorText||x.toLowerCase()!==authorText.toLowerCase());}).map(function(x){return { text:x };}),titleKey=phraseKey(title),hasPreviewPayload=false;
if(quickSnippet&&titleKey&&phraseKey(quickSnippet).indexOf(titleKey)===0) quickSnippet='';
hasCardSnippet=!!quickSnippet;
hasPreviewPayload=!!(title||authorText||dateText||commentsText||readTimeText||quickSnippet||instTags.length||instContributors.length||labels.length||imgSrc);
if(!hasPreviewPayload){
if(!p){
if(GG.modules.Panels&&GG.modules.Panels.setRight) GG.modules.Panels.setRight('closed');
else if(main) main.setAttribute('data-gg-info-panel','closed');
}
resetPanelState();
return false;
}
af=authorText&&authorFallback(authorText);
if(panel) panel.__gK=metaKey||'';
syncPanelIconTokens(true);
setS('title',title||'');
setHref('[data-s="title"]',href);
setHref('.gg-epanel__cta,.gg-info-panel__hero-cta',href);
setS('author',authorText);
setHref('[data-s="author-link"]',author.href||(af&&af.href)||'#',author.href?'dir':(af&&af.src)||'fallback');
setS('date',dateText);
setS('updated',updatedText);
setS('comments',commentsText);
setS('readtime',readTimeText);
setS('snippet',quickSnippet);
setImg(imgSrc,title);
if(panel){ panel.__iC=instContributors.length>0; panel.__iT=instTags.length>0; panel.__iU=!!updatedText; panel.__iR=!!readTimeText; panel.__iS=hasCardSnippet; }
setRow('head',false);
setRow('thumbnail',!!imgSrc);
setRow('title',!!title);
setRow('author',!!authorText);
setRow('contributors',instContributors.length>0);
setRow('labels',!!labels.length);
setRow('tags',instTags.length>0);
setRow('date',!!dateText);
setRow('updated',!!updatedText);
setRow('comments',!!commentsText);
setRow('readtime',!!readTimeText);
setRow('snippet',!!quickSnippet);
setRow('cta',!!href&&href!=='#'&&hasPreviewPayload);
if(instContributors.length) fillChipsToSlot('contributors',instContributors,12); else fillChipsToSlot('contributors',[],12);
if(instTags.length) fillChipsToSlot('tags',instTags,14); else fillChipsToSlot('tags',[],14);
if(labels.length) fillChipsToSlot('labels',labels,10); else fillChipsToSlot('labels',[],10);
applyPostMeta(metaKey);
if(panel) panel.hidden=false;
if(opts.select&&metaKey){ abortToc(''); delete tocCache[metaKey]; postMetaCache.delete(metaKey); }
updateTocForCard(card, hrefFetch);
if(!p){ setBackdropVisible(true); if(GG.modules.Panels&&GG.modules.Panels.setRight) GG.modules.Panels.setRight('open'); else if(main) main.setAttribute('data-gg-info-panel','open'); if(opts.select){ selectedCardKey=cardKey(card)||null; syncSlotInfoSelected(selectedCardKey); } if(opts.focusPanel!==false&&panel&&panel.focus){ panel.setAttribute('tabindex','-1'); try{ panel.focus({ preventScroll:true }); }catch(_){} } }
return true;
}

function resetPanelState(){
if (panel) {
panel.hidden = true;
panel.__gP = null;
panel.__gK = '';
panel.__iC = false;
panel.__iT = false;
panel.__iU = false;
panel.__iR = false;
panel.__iS = false;
var previewCard = qs('.gg-editorial-preview', panel);
if (previewCard) previewCard.hidden = true;
syncPanelIconTokens(false);
setRow('head',false);
setRow('thumbnail',false);
setRow('title',false);
setRow('author',false);
setRow('contributors',false);
setRow('labels',false);
setRow('tags',false);
setRow('date',false);
setRow('updated',false);
setRow('comments',false);
setRow('readtime',false);
setRow('snippet',false);
setRow('toc',false);
setRow('cta',false);
setS('title','');
setS('author','');
setS('date','');
setS('updated','');
setS('comments','');
setS('readtime','');
setS('snippet','');
setHref('[data-s="title"]','#');
setHref('[data-s="author-link"]','#');
setHref('.gg-epanel__cta,.gg-info-panel__hero-cta','#');
fillChipsToSlot('contributors',[],12);
fillChipsToSlot('labels',[],10);
fillChipsToSlot('tags',[],14);
setImg('', '');
renderTocItems([]);
setTocHint('');
}
selectedCardKey = null;
syncSlotInfoSelected(null);
hoverCardKey = '';
clearHoverIntent();
setBackdropVisible(false);
abortToc('');
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
if (selectedCardKey) return;
if (key === hoverCardKey || (hoverIntentTimer && key === hoverIntentCardKey)) return;
clearHoverIntent();
hoverIntentCardKey = key;
var href = cardHref(card);
hoverIntentTimer = w.setTimeout(function(){
hoverIntentTimer = 0;
if (!card) return;
if (typeof card.isConnected === 'boolean' && !card.isConnected) return;
if (selectedCardKey) return;
prefetchToc(href);
hoverCardKey = key;
if(!openWithCard(card, null, { focusPanel: false })) return;
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
hoverCardKey = '';
if (evt.relatedTarget && panel && panel.contains && panel.contains(evt.relatedTarget)) return;
handleClose();
}

function handlePreviewFocus(evt){
if (!canHoverPreview()) return;
var card = closest(evt.target, '.gg-post-card'), key = cardKey(card);
if (!card || !key) return;
if (selectedCardKey) return;
if (key === hoverCardKey) return;
clearHoverIntent();
prefetchToc(cardHref(card));
hoverCardKey = key;
openWithCard(card, null, { focusPanel: false });
}

function handlePreviewBlur(evt){
if (!canHoverPreview()) return;
if (selectedCardKey) return;
var card = closest(evt.target, '.gg-post-card');
if (!card) return;
var nextCard = closest(evt.relatedTarget, '.gg-post-card');
if (nextCard) return;
if (evt.relatedTarget && panel && panel.contains && panel.contains(evt.relatedTarget)) return;
hoverCardKey = '';
handleClose();
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
hoverCardKey = '';
handleClose();
return;
}
selectedCardKey = key || null;
syncSlotInfoSelected(selectedCardKey);
clearHoverIntent();
hoverCardKey = key;
if(!openWithCard(card, infoBtn, { focusPanel: true, select: true })){
selectedCardKey = null;
syncSlotInfoSelected(null);
}
}

function init(mainEl){
main = mainEl || qs('main.gg-main[data-gg-surface]');
if (!main) return;

panel = qs('.gg-info-panel', main);
if (!panel) return;
var surface = String(main.getAttribute('data-gg-surface') || '').toLowerCase();
var homeState = String(main.getAttribute('data-gg-home-state') || '').toLowerCase();
var isDetailSurface = surface === 'post' || surface === 'page';
var isListingSurface = isListingLikeSurface();
var isLandingSurface = surface === 'landing' || homeState === 'landing';
var isPostLayout = !!qs('.gg-blog-layout--post', main);
if (isPostLayout || isDetailSurface){
panel.style.display = 'none';
return;
}
if (isLandingSurface || !isListingSurface){
if (main.getAttribute('data-gg-info-panel') !== 'closed') {
  main.setAttribute('data-gg-info-panel', 'closed');
}
resetPanelState();
panel.hidden = true;
panel.style.display = 'none';
return;
}
panel.style.display = '';
if (main.getAttribute('data-gg-info-panel') !== 'closed') {
main.setAttribute('data-gg-info-panel', 'closed');
}
resetPanelState();
panel.hidden = true;

if (!main.__gB){
main.__gB = true;
main.addEventListener('click', handleClick, true);
main.addEventListener('pointerover', handlePreviewHover, true);
main.addEventListener('pointerout', handlePreviewOut, true);
main.addEventListener('focusin', handlePreviewFocus, true);
main.addEventListener('focusout', handlePreviewBlur, true);
}
if (!panel.__gB) panel.__gB = true;
if (!closeObserver && main && window.MutationObserver) {
closeObserver = new MutationObserver(function (muts) {
  for (var i = 0; i < muts.length; i++) {
    if (muts[i].attributeName === 'data-gg-info-panel' && main.getAttribute('data-gg-info-panel') === 'closed') resetPanelState();
    if (muts[i].attributeName === 'data-gg-surface' || muts[i].attributeName === 'data-gg-home-state') {
      var nextSurface = String(main.getAttribute('data-gg-surface') || '').toLowerCase();
      var nextHomeState = String(main.getAttribute('data-gg-home-state') || '').toLowerCase();
      if (nextSurface === 'landing' || nextHomeState === 'landing') {
        resetPanelState();
        panel.hidden = true;
        panel.style.display = 'none';
      }
    }
  }
});
closeObserver.observe(main, { attributes: true, attributeFilter: ['data-gg-info-panel', 'data-gg-surface', 'data-gg-home-state'] });
}
ensurePanelSkeleton();
}

return { init: init };
})();

GG.modules.LeftNav=(function(){
function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
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
if (id === 'HTML17' || id === 'HTML22') return 'policy';
if (id === 'HTML18' || id === 'HTML23') return 'menu_book';
if (id === 'HTML19' || id === 'HTML24') return 'support_agent';
if (id === 'HTML20' || id === 'HTML25') return 'gavel';
if (id === 'HTML21' || id === 'HTML26') return 'smart_toy';
  return pickLinkIcon(title || id || '', '');
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

  itemsRoot.textContent = '';
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
    itemsRoot.textContent = '';
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
    var iconNode = document.createElement('span');
    iconNode.className = 'gg-navtree__summary-icon material-symbols-rounded';
    iconNode.setAttribute('aria-hidden', 'true');
    var textNode = document.createElement('span');
    textNode.className = 'gg-navtree__summary-text';
    var chevNode = document.createElement('span');
    chevNode.className = 'gg-navtree__summary-chev material-symbols-rounded';
    chevNode.setAttribute('aria-hidden', 'true');
    chevNode.textContent = 'expand_more';
    summary.appendChild(iconNode);
    summary.appendChild(textNode);
    summary.appendChild(chevNode);
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

function enhanceCustomPages(root){ var widgets=[],i=0,id='',el=null; for(i=0;i<CUSTOM_WIDGET_IDS.length;i++){ id=CUSTOM_WIDGET_IDS[i]; el=document.getElementById(id); if(el&&root.contains(el)) widgets.push(el); } for(i=0;i<widgets.length;i++) ensureNavTreeWidget(widgets[i]); }

function setHiddenInert(node, hidden){if(!node)return;node.hidden=!!hidden;if(hidden)node.setAttribute('inert','');else node.removeAttribute('inert');}

function detectMode(left){return qs('#gg-toc',left)?'post':'list';}

function pick(root, needle, many){
if(!root||!needle)return many?[]:null;
var s=':scope>.widget:has('+needle+')';
try{return many?qsa(s,root):qs(s,root);}catch(_){}
var ws=qsa(':scope>.widget',root),out=many?[]:null,i=0;
for(;i<ws.length;i++)try{if(ws[i].querySelector(needle)){if(many)out.push(ws[i]);else return ws[i];}}catch(_){}
return many?out:null;
}

function arrangeSegments(left){
var sb=qs('.gg-sb',left),top=qs('.gg-sb__top',sb),body=qs('.gg-sb__body',sb),bot=qs('.gg-sb__bot',sb),mode;
var i=0;
var profileWidget=null,tocWidget=null,interestWidget=null,followWidget=null,navWidgets=[];
var topOrder=[],bodyOrder=[],botOrder=[];
if(!sb||!top||!body||!bot||left.__gM)return;
if(sb.getAttribute('data-gg-sb-native')==='1'){sb.setAttribute('data-gg-sb-ready','1');sb.setAttribute('data-gg-sb-mode',detectMode(left)==='post'?'post':'list');return;}
mode=detectMode(left);
if(mode==='post'){profileWidget=pick(left,'.gg-leftnav__profile');tocWidget=pick(left,'#gg-toc');interestWidget=pick(left,'.gg-labeltree[data-gg-module="labeltree"]');navWidgets=pick(left,'details.gg-navtree',true);followWidget=pick(left,'.gg-leftnav__socialbar');}else{profileWidget=pick(left,'.gg-leftnav__profile');interestWidget=pick(left,'.gg-labeltree[data-gg-module="labeltree"]');navWidgets=pick(left,'details.gg-navtree',true);followWidget=pick(left,'.gg-leftnav__socialbar');}
function pushUnique(list,node){ if(node&&list.indexOf(node)<0) list.push(node); }
function place(host,order){var k=0,node=null;for(k=0;k<order.length;k++){node=order[k];if(!node) continue;setHiddenInert(node,false);if(node.parentElement!==host||host.children[k]!==node) host.insertBefore(node,host.children[k]||null);}}
if(mode==='post'){pushUnique(topOrder,profileWidget);pushUnique(topOrder,tocWidget);pushUnique(bodyOrder,interestWidget);pushUnique(botOrder,followWidget);}else{pushUnique(topOrder,profileWidget);pushUnique(topOrder,interestWidget);pushUnique(botOrder,followWidget);}
for(i=0;navWidgets&&i<navWidgets.length;i++)pushUnique(bodyOrder,navWidgets[i]);
left.__gM=1;
try{place(top,topOrder);place(body,bodyOrder);place(bot,botOrder);setHiddenInert(top,!qsa(':scope > .widget',top).length);setHiddenInert(bot,!qsa(':scope > .widget',bot).length);setHiddenInert(body,false);sb.setAttribute('data-gg-sb-mode',mode==='post'?'post':'list');sb.setAttribute('data-gg-sb-ready','1');}finally{left.__gM=0;}
}

function scheduleRepair(left){arrangeSegments(left);}

function init(mainEl){
var left=qs('.gg-blog-sidebar--left',mainEl)||qs('.gg-blog-sidebar--left',document);
if(!left)return;enhanceCustomPages(left);scheduleRepair(left);
if(window.MutationObserver&&!left.__ggSbObs){var t=0;left.__ggSbObs=1;(new MutationObserver(function(){if(left.__gM||t)return;t=1;requestAnimationFrame(function(){t=0;scheduleRepair(left);});})).observe(left,{childList:true,subtree:true});}
}

return{init:init};
})();

(function(){
'use strict';
window.GG = window.GG || {};
GG.modules = GG.modules || {};

function qs(sel, root){ return (root || document).querySelector(sel); }
function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/* ========== SHORTCODES V2 (youtube, accordion) ========== */
GG.modules.ShortcodesV2 = (function(){
var AREA_SEL = '.post-body, .entry-content';
var RE_YT_BLOCK = /^\[youtube\]([\s\S]+?)\[\/youtube\]$/i;
var RE_YT_ATTR = /^\[youtube\s+([^\]]+)\]$/i;
var RE_ACC_OPEN = /^\[accordion\b([^\]]*)\]$/i;
var RE_ACC_CLOSE = /^\[\/accordion\]$/i;
var ACC_BODY_SEQ = 0;
var YT_LABEL = 'Play video';

function trimText(v){
  return String(v || '').replace(/\u00a0/g, ' ').trim();
}

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

function extractYouTubeId(input){
  if(!input) return '';
  var s = String(input).trim();
  var m = null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
  if (m) return m[1];
  m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
  if (m) return m[1];
  m = s.match(/\/embed\/([A-Za-z0-9_-]{11})/i);
  if (m) return m[1];
  m = s.match(/\/shorts\/([A-Za-z0-9_-]{11})/i);
  if (m) return m[1];
  return '';
}

function cloneTemplateNode(id){
  var tpl = document.getElementById(id);
  var holder = document.createElement('div');
  var nodes = [];
  var i = 0;
  if (!tpl) return null;
  nodes = [].slice.call((tpl.content && tpl.content.childNodes) || tpl.childNodes || []);
  for (; i < nodes.length; i++) holder.appendChild(nodes[i].cloneNode(true));
  return holder.firstElementChild;
}

function buildYoutubeLite(id){
  var node = cloneTemplateNode('gg-tpl-sc-yt-lite');
  var img = null;
  if (!node || !id) return null;
  node.setAttribute('data-id', id);
  img = qs('img', node);
  if (img) {
    img.setAttribute('src', 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg');
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    if (GG.services && GG.services.images && typeof GG.services.images.setIntrinsicDims === 'function') {
      GG.services.images.setIntrinsicDims(img, 16, 9);
    }
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
  }
  return node;
}

function wireAccordion(acc){
  var btn = null, body = null;
  if(!acc) return;
  btn = qs('[data-gg-acc-toggle]', acc);
  body = qs('[data-gg-acc-body]', acc);
  if (!btn || !body) return;
  if (!body.id) body.id = 'gg-acc-body-' + (++ACC_BODY_SEQ);
  btn.setAttribute('aria-controls', body.id);
  body.hidden = btn.getAttribute('aria-expanded') !== 'true';
  if (acc.dataset.ggA11yBound === '1') return;
  btn.addEventListener('click', function(){
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    body.hidden = open;
  });
  acc.dataset.ggA11yBound = '1';
}

function wireAccordions(scope){
  qsa('.gg-sc-accordion[data-gg-acc]', scope).forEach(wireAccordion);
}

function hydrateLiteEmbeds(root){
  function preconnectOnce(href){
    if (!href) return;
    var docEl = document.documentElement;
    if (!docEl) return;
    var safe = String(href).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!safe) return;
    var attr = 'data-gg-preconnect-' + safe;
    if (docEl.getAttribute(attr)) return;
    docEl.setAttribute(attr, '1');
    var head = document.head || (document.getElementsByTagName('head')[0]);
    if (!head) return;
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  }

  qsa('.gg-yt-lite', root).forEach(function(box){
    var id = box.getAttribute('data-id');
    var label = trimText(box.getAttribute('aria-label') || '');
    var load = null;
    var warm = function(){
      preconnectOnce('https://www.youtube-nocookie.com');
      preconnectOnce('https://i.ytimg.com');
    };
    if (!label || label === YT_LABEL) {
      var host = box.closest ? box.closest(AREA_SEL) : null;
      var heading = host && host.querySelector ? host.querySelector('h1,h2,h3') : null;
      var title = trimText(heading && heading.textContent ? heading.textContent : '') || trimText(box.getAttribute('data-title') || '');
      box.setAttribute('aria-label', title ? (YT_LABEL + ': ' + title) : YT_LABEL);
    }
    if (!id || box.dataset.ggA11yBound === '1') return;
    box.addEventListener('pointerenter', warm, { once:true });
    box.addEventListener('focus', warm, { once:true });
    load = function(){
      var t = (box.getAttribute('aria-label') || '').replace(/^Play video:\s*/i, '').trim();
      warm();
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id;
      iframe.style.cssText = 'width:100%;height:100%;border:0';
      iframe.setAttribute('title', t ? ('YouTube video: ' + t) : 'YouTube video player');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share');
      if (GG.services && GG.services.images && typeof GG.services.images.setIntrinsicDims === 'function') {
        GG.services.images.setIntrinsicDims(iframe, 16, 9);
      }
      iframe.setAttribute('allowfullscreen', '');
      box.textContent = '';
      box.appendChild(iframe);
    };
    box.addEventListener('click', load);
    box.addEventListener('keydown', function(e){
      var key = (e && e.key) ? e.key : '';
      if (key === 'Enter' || key === ' ') { e.preventDefault(); load(); }
    });
    box.dataset.ggA11yBound = '1';
  });
}

function bindA11y(root){
  wireAccordions(root || document);
  hydrateLiteEmbeds(root || document);
}

function resolveAreas(root){
  var out = [];
  function push(el){ if (el && out.indexOf(el) === -1) out.push(el); }
  if (!root || root === document) {
    qsa(AREA_SEL, document).forEach(push);
    return out;
  }
  if (root.nodeType !== 1) return out;
  if (root.matches && root.matches(AREA_SEL)) push(root);
  qsa(AREA_SEL, root).forEach(push);
  return out;
}

function findAccordionClose(openEl){
  var cur = null;
  if(!openEl || !openEl.parentNode) return null;
  cur = openEl.nextElementSibling;
  for (; cur; cur = cur.nextElementSibling) {
    if (RE_ACC_CLOSE.test(trimText(cur.textContent || ''))) return cur;
  }
  return null;
}

function transformArea(area){
  var blocks = [];
  var i = 0;
  var el = null;
  var raw = '';
  var m = null;
  var id = '';
  var yt = null;
  var close = null;
  var acc = null;
  var title = '';
  var titleEl = null;
  var bodyEl = null;
  var node = null;
  var next = null;
  if(!area || area.nodeType !== 1) return;
  if (area.dataset.ggShortcodesDone === '1') {
    bindA11y(area);
    return;
  }
  blocks = [].slice.call(area.querySelectorAll('p,div'));
  for (; i < blocks.length; i++) {
    el = blocks[i];
    if (!el || !el.parentNode || !area.contains(el)) continue;
    raw = trimText(el.textContent || '');
    if (!raw) continue;

    m = raw.match(RE_YT_BLOCK);
    if (m) {
      id = extractYouTubeId(m[1]);
      if (!id) continue;
      yt = buildYoutubeLite(id);
      if (yt) el.parentNode.replaceChild(yt, el);
      continue;
    }

    m = raw.match(RE_YT_ATTR);
    if (m) {
      id = extractYouTubeId(attr(m[1] || '', 'id'));
      if (!id) continue;
      yt = buildYoutubeLite(id);
      if (yt) el.parentNode.replaceChild(yt, el);
      continue;
    }

    m = raw.match(RE_ACC_OPEN);
    if (!m) continue;
    close = findAccordionClose(el);
    if (!close || close.parentNode !== el.parentNode) continue;
    acc = cloneTemplateNode('gg-tpl-sc-accordion');
    if (!acc) continue;
    title = attr(m[1] || '', 'title') || 'Accordion';
    titleEl = qs('.gg-sc-accordion__title', acc);
    bodyEl = qs('.gg-sc-accordion__body', acc);
    if (!bodyEl) continue;
    if (titleEl) titleEl.textContent = title;
    node = el.nextSibling;
    while (node && node !== close) {
      next = node.nextSibling;
      bodyEl.appendChild(node);
      node = next;
    }
    el.parentNode.insertBefore(acc, el);
    if (el.parentNode) el.parentNode.removeChild(el);
    if (close.parentNode) close.parentNode.removeChild(close);
  }
  area.dataset.ggShortcodesDone = '1';
  bindA11y(area);
}

function transformRoot(root){
  var areas = resolveAreas(root);
  var i = 0;
  for (; i < areas.length; i++) transformArea(areas[i]);
}

function init(){
  transformRoot(document);
}

/* ShortcodesV2.bindA11y */
return { init:init, transformArea:transformArea, transformRoot:transformRoot, bindA11y:bindA11y, extractYouTubeId:extractYouTubeId };
})();
GG.modules.Shortcodes = GG.modules.Shortcodes || GG.modules.ShortcodesV2;

/* ========== SKELETON PLACEHOLDER ========== */
GG.modules.Skeleton = (function(){
  function buildCard(){
    var card = document.createElement('div');
    card.className = 'gg-skeleton-card';
    var thumb = document.createElement('div');
    thumb.className = 'gg-skeleton-thumb gg-shimmer';
    card.appendChild(thumb);

    function addLine(width){
      var line = document.createElement('div');
      line.className = 'gg-skeleton-line gg-shimmer';
      if (width) line.style.width = width;
      card.appendChild(line);
    }

    addLine('');
    addLine('80%');
    addLine('65%');
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
    if(surface !== 'post' && surface !== 'page') return;

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
    var eyebrow = document.createElement('div');
    eyebrow.className = 'gg-related-inline__eyebrow';
    eyebrow.textContent = 'Baca juga';
    wrap.appendChild(eyebrow);

    var title = document.createElement('a');
    title.className = 'gg-related-inline__title';
    title.href = item.href;
    title.textContent = item.title;
    wrap.appendChild(title);

    if (item.thumb) {
      var img = document.createElement('img');
      img.className = 'gg-related-inline__thumb';
      img.src = item.thumb;
      img.alt = item.title || '';
      if (GG.services && GG.services.images && typeof GG.services.images.setIntrinsicDims === 'function') {
        GG.services.images.setIntrinsicDims(img, 100, 150);
      }
      wrap.appendChild(img);
    }

    var meta = document.createElement('div');
    meta.className = 'gg-related-inline__meta';
    var icon = document.createElement('span');
    icon.className = 'material-symbols-rounded';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'auto_stories';
    var label = document.createElement('span');
    label.textContent = item.date || 'Artikel terkait';
    meta.appendChild(icon);
    meta.appendChild(label);
    wrap.appendChild(meta);
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
  if (!/(?:\?|&)ggdebug=1(?:&|$)/.test(location.search||'')) return;
  if (!GG.debugStatus) { GG.debugStatus = function(t){ var r = document.documentElement, b = document.body, m = document.querySelector('main.gg-main[data-gg-surface],main.gg-main,#gg-main'), sw = navigator.serviceWorker && navigator.serviceWorker.controller, rel = document.querySelector('meta[name="gg-release"]'), fp = document.getElementById('gg-fingerprint'), mods = GG.boot && GG.boot._moduleLoadResults || {}, boot = (r && r.dataset && r.dataset.ggBoot) || (r && r.getAttribute && r.getAttribute('data-gg-boot')) || '0'; function a(n){ return (m && m.getAttribute && m.getAttribute(n)) || (b && b.getAttribute && b.getAttribute(n)) || ''; } try { console.info('[ggdebug:' + (t || '') + '] ggBoot=' + boot + ' release=' + (rel && rel.content || '') + ' fp=' + (fp && fp.getAttribute && fp.getAttribute('data-release') || '') + ' surface=' + a('data-gg-surface') + ' page=' + a('data-gg-page') + ' view=' + a('data-gg-view') + ' sw=' + (!!sw) + ' uiReady=' + (GG.boot && GG.boot._uiReady ? 1 : 0), mods); } catch (_) {} }; GG.debugStatus(); }

  var el = document.getElementById('gg-debug-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gg-debug-overlay';
    el.style.cssText = 'position:fixed;bottom:8px;padding:8px;background:#111;color:#e6e6e6;pointer-events:none;opacity:.9';
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
{ name: 'homeState.init', selector: 'main.gg-main[data-gg-home-root],main.gg-main[data-gg-surface="landing"],main.gg-main[data-gg-surface="home"]', when: { views:['home'] }, init: GG.boot.initHomeState },
{ name: 'ShortcodesV2.init', selector: '.post-body, .entry-content', when: { views:['post','page'] }, init: function(){ if (GG.modules.ShortcodesV2 && GG.modules.ShortcodesV2.init) GG.modules.ShortcodesV2.init(); } },
{ name: 'Skeleton.init', selector: '#postcards', when: { views:['home','listing','label','search','archive'] }, init: function(){ if (GG.modules.Skeleton) GG.modules.Skeleton.init(); } },
{ name: 'Panels.init', selector: 'main.gg-main[data-gg-surface]', init: function(){ if (GG.modules.Panels) GG.modules.Panels.init(); } },
{ name: 'InfoPanel.init', selector: '.gg-info-panel[data-gg-panel="info"]', when: { views:['home','listing','label','search','archive'] }, init: function(){ var main = document.querySelector('main.gg-main[data-gg-surface]'); if (main && GG.modules.InfoPanel) GG.modules.InfoPanel.init(main); } },
{ name: 'PostDetail.init', selector: 'main.gg-main[data-gg-surface="post"], main.gg-main[data-gg-surface="page"]', when: { views:['post','page'] }, init: function(){ var main = document.querySelector('main.gg-main[data-gg-surface]'); if (main && GG.modules.PostDetail) GG.modules.PostDetail.init(main); } },
{ name: 'labelTree.init', selector: '.gg-labeltree[data-gg-module="labeltree"]', init: function(){ if (GG.modules.labelTree) GG.modules.labelTree.init(); } },
{ name: 'breadcrumbs.init', selector: 'nav.gg-post__breadcrumbs', when: { views:['post','page'] }, init: function(){ if (GG.modules.breadcrumbs) GG.modules.breadcrumbs.init(document); } },
{ name: 'readTime.init', selector: '[data-slot="readtime"]', when: { views:['post','page'] }, init: function(){ if (GG.modules.readTime) GG.modules.readTime.init(document); } },
{name:'LeftNav.init',selector:'.gg-blog-sidebar--left',init:function(){var m=document.querySelector('main.gg-main')||document;GG.modules.LeftNav&&GG.modules.LeftNav.init(m);}},
{ name: 'Dock.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); var main = document.querySelector('main.gg-main[data-gg-surface]'); if (dock && GG.modules.Dock) GG.modules.Dock.init(dock, main); } },
{ name: 'ReadingProgress.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); var main = document.querySelector('main.gg-main[data-gg-surface]'); if (dock && GG.modules.ReadingProgress) GG.modules.ReadingProgress.init(dock, main); } },
{ name: 'DockPerimeter.init', selector: 'nav.gg-dock[data-gg-module="dock"]', init: function(){ var dock = document.querySelector('nav.gg-dock[data-gg-module="dock"]'); if (dock && GG.modules.DockPerimeter) GG.modules.DockPerimeter.init(dock); } },
{ name: 'LoadMore.init', selector: '[data-gg-module="loadmore"]', when: { views:['home','listing','label','search','archive'] }, init: function(){ if (GG.modules.LoadMore) GG.modules.LoadMore.init(); } },
{ name: 'RelatedInline.init', selector: '.gg-post__content.post-body.entry-content, .post-body.entry-content, .entry-content', when: { views:['post','page'] }, init: function(){ if (GG.modules.RelatedInline) GG.modules.RelatedInline.init(); } },
{ name: 'tagDirectory.init', selector: '.gg-tags-directory', when: { system:true }, init: function(){ if (GG.modules.tagDirectory && GG.modules.tagDirectory.init) GG.modules.tagDirectory.init(document.querySelector('.gg-tags-directory')); } },
{ name: 'tagHubPage.init', selector: '.gg-tags-page', when: { system:true }, init: function(){ if (GG.modules.tagHubPage && GG.modules.tagHubPage.init) GG.modules.tagHubPage.init(document); } },
{ name: 'postTagsInline.init', selector: '.gg-post-tags', when: { views:['post','page'] }, init: function(){ if (GG.modules.postTagsInline && GG.modules.postTagsInline.init) GG.modules.postTagsInline.init(document); } },
{ name: 'library.autoInit', selector: '#gg-library-list, .gg-library-list, .gg-post-card__action--bookmark, .gg-post__action--bookmark', init: function(){ if (GG.modules.library && GG.modules.library.autoInit) GG.modules.library.autoInit(); } },
{ name: 'shareSheet.init', selector: '#gg-share-sheet, #pc-poster-sheet', when: { views:['post','page'] }, init: function(){ if (GG.modules.shareSheet && GG.modules.shareSheet.init) GG.modules.shareSheet.init(); } },
{ name: 'posterCanvas.init', selector: '#gg-share-sheet, #pc-poster-sheet', when: { views:['post','page'] }, init: function(){ if (GG.modules.posterCanvas && GG.modules.posterCanvas.init) GG.modules.posterCanvas.init(); } },
{ name: 'posterEngine.init', selector: '#gg-share-sheet, #pc-poster-sheet', when: { views:['post','page'] }, init: function(){ if (GG.modules.posterEngine && GG.modules.posterEngine.init) GG.modules.posterEngine.init(); } },
{ name: 'shareMotion.init', selector: '#gg-share-sheet, #pc-poster-sheet', when: { views:['post','page'] }, init: function(){ if (GG.modules.shareMotion && GG.modules.shareMotion.init) GG.modules.shareMotion.init(); } },
{ name: 'langSwitcher.init', selector: '.gg-lang-switcher', init: function(){ if (GG.modules.langSwitcher && GG.modules.langSwitcher.init) GG.modules.langSwitcher.init(); } },
{ name: 'imgDims.init', selector: 'img', init: function(){ if (GG.modules.imgDims && GG.modules.imgDims.init) GG.modules.imgDims.init(document); } },
{ name: 'a11yFix.init', selector: 'body', init: function(){ if (GG.modules.a11yFix && GG.modules.a11yFix.init) GG.modules.a11yFix.init(document); } },
{ name: 'interactiveModules.init', selector: 'body', init: function(){ if (GG.util && GG.util.initInteractiveModules) GG.util.initInteractiveModules(document); } },
{ name: 'feed.init', selector: '#gg-feed', init: function(){ if (GG.modules.feed && GG.modules.feed.init) GG.modules.feed.init(); } },
{ name: 'sitemap.init', selector: '#gg-sitemap', when: { system:true }, init: function(){ if (GG.modules.sitemap && GG.modules.sitemap.init) GG.modules.sitemap.init(); } },
{ name: 'backPolicy.init', selector: 'body', init: function(){ if (GG.modules.backPolicy && GG.modules.backPolicy.init) GG.modules.backPolicy.init(); } },
{ name: 'prefetch.init', selector: '#postcards', when: { views:['home','listing','label','search','archive'] }, init: function(){ if (GG.modules.prefetch && GG.modules.prefetch.init) GG.modules.prefetch.init(); } }
];

GG.app.selectorMap = GG.app.selectorMap || {};
GG.app.plan.forEach(function(item){
GG.app.selectorMap[item.name] = GG.core.selectorLabel(item.selector);
});

GG.app.init = GG.app.init || function(){
if (GG.app._init) return;
GG.app._init = true;
var ctx = GG.core && GG.core.routerCtx && GG.core.routerCtx.current ? GG.core.routerCtx.current() : null;
for (var i = 0; i < GG.app.plan.length; i++) {
  (function(item){
    if (!item || typeof item.init !== 'function') return;
    if (ctx && item.when && GG.core && GG.core.routerCtx && typeof GG.core.routerCtx.matches === 'function' && !GG.core.routerCtx.matches(item.when, ctx)) {
      if (window.GG_DIAG && GG_DIAG.modules) GG_DIAG.modules[item.name] = 'skip:ctx';
      return;
    }
    var host = GG.core.resolveSelector(item.selector);
    if (item.selector && !host && !item.optional) {
      if (window.GG_DIAG && GG_DIAG.modules) GG_DIAG.modules[item.name] = 'skip';
      return;
    }
	    GG.boot.safeInit(item.name, function(){ item.init(host); });
	  })(GG.app.plan[i]);
	}
};

GG.app.normalizeHomepageMixedOrder = GG.app.normalizeHomepageMixedOrder || function(scope){
function qs(sel, root){ return (root || document).querySelector(sel); }
function matches(node, sel){ return !!(node && node.matches && node.matches(sel)); }
function setAttr(node, name, value){
  if (!node || !node.setAttribute) return;
  node.setAttribute(name, String(value));
}
function applySlotContract(node, contract){
  if (!node || !contract) return;
  if (contract.kind) {
    setAttr(node, 'data-gg-kind', contract.kind);
  }
  if (contract.type) {
    setAttr(node, 'data-type', contract.type);
  }
  if (contract.max) {
    setAttr(node, 'data-gg-max', contract.max);
    setAttr(node, 'data-max', contract.max);
  }
  if (contract.cols) {
    setAttr(node, 'data-gg-cols', contract.cols);
    setAttr(node, 'data-cols', contract.cols);
  }
  if (contract.labels) {
    setAttr(node, 'data-gg-labels', contract.labels);
    setAttr(node, 'data-labels', contract.labels);
  }
  setAttr(node, 'data-gg-contract-structure', contract.structure || 'slider');
  setAttr(node, 'data-gg-contract-total', contract.total || contract.max || '');
  setAttr(node, 'data-gg-contract-visible', contract.visible || '');
  setAttr(node, 'data-gg-contract-ratio', contract.ratio || '');
}
var main = matches(scope, 'main.gg-main[data-gg-surface],main.gg-main') ? scope : qs('main.gg-main[data-gg-surface],main.gg-main', document);
var contracts = {
  'gg-mixed-featuredstrip': { kind: 'featured', type: 'rail', max: '4', total: '4', visible: '1', ratio: '16:9', structure: 'slider' },
  'gg-mixed-newsish-1': { kind: 'newsish', type: 'newsdeck', max: '3', cols: '3', labels: 'news,bookish,podcast', total: '9', visible: '3x3', ratio: 'composite', structure: 'newsdeck' },
  'gg-mixed-youtubeish': { kind: 'youtubeish', type: 'youtube', max: '5', total: '5', visible: '3', ratio: '16:9', structure: 'slider' },
  'gg-mixed-shortish': { kind: 'shortish', type: 'shorts', max: '6', total: '6', visible: '4', ratio: '9:16', structure: 'slider' },
  'gg-mixed-newsish-2': { kind: 'newsish', type: 'newsdeck', max: '3', cols: '3', labels: 'news,youtube,shorts', total: '9', visible: '3x3', ratio: 'composite', structure: 'newsdeck' },
  'gg-mixed-podcastish': { kind: 'podcastish', type: 'podcast', max: '7', total: '7', visible: '4', ratio: '1:1', structure: 'slider' },
  'gg-mixed-bookish': { kind: 'bookish', type: 'rail', max: '6', total: '6', visible: '3', ratio: '1:1.48', structure: 'slider' }
};
if (!main) return false;
var surface = String(main.getAttribute('data-gg-surface') || '').toLowerCase();
var homeState = String(main.getAttribute('data-gg-home-state') || '').toLowerCase();
if ((surface !== 'home' && surface !== 'listing') || homeState === 'landing') return false;
var blogMain = qs('.gg-blog-main', main);
var primarySection = blogMain ? qs('#gg-featuredpost1', blogMain) : null;
var deferredSection = blogMain ? qs('#gg-mixed-deferred', blogMain) : null;
var blogSection = blogMain ? qs('#blog', blogMain) : null;
var bookishWidget = blogMain ? qs('#HTML5', blogMain) : null;
var orderChanged = false;
var contractIds = Object.keys(contracts);
var i = 0;
var slot = null;
if (!blogMain || !deferredSection || !blogSection) return false;
for (i = 0; i < contractIds.length; i++) {
  slot = qs('#' + contractIds[i], blogMain);
  if (!slot) continue;
  applySlotContract(slot, contracts[contractIds[i]]);
}
if (bookishWidget && bookishWidget.parentElement !== deferredSection) {
  deferredSection.appendChild(bookishWidget);
  orderChanged = true;
} else if (bookishWidget && bookishWidget.parentElement === deferredSection && bookishWidget !== deferredSection.lastElementChild) {
  deferredSection.appendChild(bookishWidget);
  orderChanged = true;
}
if (bookishWidget) {
  bookishWidget.setAttribute('data-gg-runtime-order', 'deferred-tail');
}
if (primarySection) {
  primarySection.setAttribute('data-gg-runtime-mixed-order', 'featured,newsish-1');
}
deferredSection.setAttribute('data-gg-runtime-mixed-order', 'youtubeish,shortish,newsish-2,podcastish,bookish');
blogMain.setAttribute('data-gg-runtime-home-order', 'listing,featured,newsish-1,youtubeish,shortish,newsish-2,podcastish,bookish');
blogMain.setAttribute('data-gg-runtime-primary-order', 'listing,featured,newsish-1');
blogMain.setAttribute('data-gg-runtime-deferred-order', 'youtubeish,shortish,newsish-2,podcastish,bookish');
deferredSection.hidden = !qs('.widget', deferredSection);
return orderChanged || true;
};

GG.app.ensureBuckets = GG.app.ensureBuckets || function(){
var b = GG.__uiBuckets = GG.__uiBuckets || {};
var loads = [];
var main = document.querySelector('main.gg-main[data-gg-surface],main.gg-main');
var ctx = GG.core && GG.core.routerCtx && GG.core.routerCtx.current ? GG.core.routerCtx.current() : null;
var view = ctx ? (ctx.view || '') : '';
var needPost = view === 'post' || view === 'page';
var needListing = view === 'home' || view === 'listing' || view === 'label' || view === 'search' || view === 'archive';
if (main && GG.app && typeof GG.app.normalizeHomepageMixedOrder === 'function') {
  try { GG.app.normalizeHomepageMixedOrder(main); } catch (_) {}
}
var needMixed = !!document.querySelector('[data-gg-module="mixed-media"]');
function initMixed(){
  if (!needMixed) return;
  if (GG.modules && GG.modules.mixedMedia && typeof GG.modules.mixedMedia.init === 'function') {
    try { GG.modules.mixedMedia.init(document); } catch (_) {}
  }
}
if (!needListing) {
  needListing = !!document.querySelector('#postcards,[data-gg-module="loadmore"],#loadmore,.gg-labeltree[data-gg-module="labeltree"],[data-gg-module="labeltree"]');
}
if (needMixed && GG.modules && GG.modules.mixedMedia && typeof GG.modules.mixedMedia.init === 'function') {
  b.mixed = true;
}
if (!GG.boot || typeof GG.boot.loadModule !== 'function') return Promise.resolve(true);
if (needPost && !b.post) loads.push(GG.boot.loadModule('ui.bucket.post.js'));
if (needPost && !b.authors) loads.push(GG.boot.loadModule('ui.bucket.authors.js'));
if (needListing && !b.listing) loads.push(GG.boot.loadModule('ui.bucket.listing.js'));
if (needMixed && !b.mixed) {
  loads.push(
    GG.boot.loadModule('ui.bucket.mixed.js').then(function(out){
      b.mixed = true;
      return out;
    }, function(err){
      b.mixed = false;
      throw err;
    })
  );
}
if (!loads.length) {
  initMixed();
  return Promise.resolve(true);
}
return Promise.all(loads).then(function(){
  initMixed();
  return true;
}, function(){
  initMixed();
  return false;
});
};

GG.app.rehydrate = GG.app.rehydrate || function(context){
if (GG.ui && GG.ui.layout && typeof GG.ui.layout.refresh === 'function') {
  GG.ui.layout.refresh(context && context.doc ? context.doc : null);
}
function runTasks(){
  var main = document.querySelector('main.gg-main[data-gg-surface]') || document.querySelector('main.gg-main');
  var ctx = GG.core && GG.core.routerCtx && GG.core.routerCtx.refresh ? GG.core.routerCtx.refresh((context && context.url) || (window.location && window.location.href ? window.location.href : ''), document) : null;
  if (main && GG.app && typeof GG.app.normalizeHomepageMixedOrder === 'function') {
    try { GG.app.normalizeHomepageMixedOrder(main); } catch (_) {}
  }
  var tasks = [
    { name: 'homeState.reinit', when: { views:['home'] }, fn: function(){ if (GG.boot && GG.boot.initHomeState) GG.boot.initHomeState(); } },
    { name: 'Panels.reinit', fn: function(){ if (GG.modules.Panels) GG.modules.Panels.init(); } },
    { name: 'InfoPanel.reinit', when: { views:['home','listing','label','search','archive'] }, fn: function(){ if (main && GG.modules.InfoPanel) GG.modules.InfoPanel.init(main); } },
    { name: 'PostDetail.reinit', when: { views:['post','page'] }, fn: function(){ if (main && GG.modules.PostDetail) GG.modules.PostDetail.init(main); } },
    { name: 'ShortcodesV2.reinit', when: { views:['post','page'] }, fn: function(){ if (GG.modules.ShortcodesV2 && GG.modules.ShortcodesV2.transformRoot) GG.modules.ShortcodesV2.transformRoot(document); } },
    {name:'LeftNav.reinit',fn:function(){GG.modules.LeftNav&&GG.modules.LeftNav.init(main||document);}},
    { name: 'labelTree.reinit', fn: function(){ if (GG.modules.labelTree) GG.modules.labelTree.init(); } },
    { name: 'breadcrumbs.reinit', when: { views:['post','page'] }, fn: function(){ if (GG.modules.breadcrumbs) GG.modules.breadcrumbs.init(document); } },
    { name: 'readTime.reinit', when: { views:['post','page'] }, fn: function(){ if (GG.modules.readTime) GG.modules.readTime.init(document); } },
    { name: 'TOC.reinit', when: { views:['post','page'] }, fn: function(){ if (GG.modules.TOC && typeof GG.modules.TOC.init === 'function') GG.modules.TOC.init(document, { headings: 'h1,h2,h3,h4' }); } },
    { name: 'postInfoAuthors.reinit', when: { views:['post','page'] }, fn: function(){ if (GG.modules.postInfoAuthors && GG.modules.postInfoAuthors.init) GG.modules.postInfoAuthors.init(document); } },
    { name: 'LoadMore.reinit', when: { views:['home','listing','label','search','archive'] }, fn: function(){ if (GG.modules.LoadMore) { if (typeof GG.modules.LoadMore.rehydrate === 'function') GG.modules.LoadMore.rehydrate(document); else GG.modules.LoadMore.init(); } } },
    { name: 'tagHubPage.reinit', when: { system:true }, fn: function(){ if (GG.modules.tagHubPage && GG.modules.tagHubPage.init) GG.modules.tagHubPage.init(document); } },
    { name: 'interactiveModules.reinit', fn: function(){ if (GG.util && GG.util.initInteractiveModules) GG.util.initInteractiveModules(document); } }
  ];
	  for (var i = 0; i < tasks.length; i++) {
	    if (ctx && tasks[i] && tasks[i].when && GG.core && GG.core.routerCtx && typeof GG.core.routerCtx.matches === 'function' && !GG.core.routerCtx.matches(tasks[i].when, ctx)) {
	      continue;
	    }
	    GG.boot.safeInit(tasks[i].name, tasks[i].fn);
	  }
	}
var ensured = GG.app && typeof GG.app.ensureBuckets === 'function' ? GG.app.ensureBuckets() : null;
if (ensured && typeof ensured.then === 'function') return ensured.then(runTasks, runTasks);
runTasks();
return true;
};

(function(){
var w = window;
var d = document;
var GG = w.GG = w.GG || {};
GG.core = GG.core || {};

GG.core.commentsGate = GG.core.commentsGate || (function(){
  function panelRoot(){
    var root = d.getElementById('comments');
    if (root && root.closest && root.closest('.gg-comments-panel,[data-gg-panel="comments"]')) {
      return root;
    }
    return d.querySelector('#ggPanelComments #comments, .gg-comments-panel[data-gg-panel="comments"] #comments');
  }
  function markReady(host){
    if (!host || !host.setAttribute) return false;
    host.__gC = true;
    host.setAttribute('data-gg-comments-loaded', '1');
    return true;
  }
  function load(host){
    var root = host && host.id === 'comments' ? host : panelRoot();
    if (!root) return false;
    markReady(root);
    if (GG.modules && GG.modules.Comments && typeof GG.modules.Comments.init === 'function') {
      try { GG.modules.Comments.init(root); } catch (_) {}
    }
    return true;
  }
  function init(){
    return load(panelRoot());
  }
  return { init: init, load: load };
})();

GG.modules = GG.modules || {};
GG.modules.Comments = GG.modules.Comments || (function(){
  var feedFallbackCache = Object.create(null);
  var COMMENTS_PANEL_WIDTH_KEY = 'gg.comments.panelWidth';
  var COMMENTS_SORT_KEY = 'gg.comments.sortOrder';
  var PANEL_WIDTH_MODES = ['sidebar', 'wide'];
  var COMMENT_SORT_MODES = ['newest', 'oldest'];
  function toArray(nodes){
    return Array.prototype.slice.call(nodes || []);
  }
  function cleanText(value){
    return String(value || '').replace(/\s+/g, ' ').trim();
  }
  function safeNumber(value){
    var num = parseInt(String(value || '').trim(), 10);
    return isFinite(num) ? num : 0;
  }
  function readStoredChoice(key, allowed, fallback){
    var raw = '';
    var list = Array.isArray(allowed) ? allowed : [];
    try {
      if (!w.localStorage) return fallback;
      raw = cleanText(w.localStorage.getItem(key)).toLowerCase();
    } catch (_) {
      return fallback;
    }
    return list.indexOf(raw) !== -1 ? raw : fallback;
  }
  function writeStoredChoice(key, value){
    try {
      if (!w.localStorage) return false;
      w.localStorage.setItem(key, String(value || ''));
      return true;
    } catch (_) {
      return false;
    }
  }
  function viewerMayModerate(){
    var body = d.body;
    var cls = cleanText(body && body.className).toLowerCase();
    if (/\blog(?:ger)?-admin\b|\blogged-?in\b|\bis-admin\b|\badmin-user\b/.test(cls)) return true;
    if (d.querySelector('.blog-admin, a.post-edit-link, a[href*="www.blogger.com/blogger.g"], a[href*="www.blogger.com/comment.g"]')) return true;
    return false;
  }
  function commentsFeedInfo(){
    var link = d.querySelector('link[rel="alternate"][type="application/atom+xml"][href*="/feeds/"][href*="/comments/default"]');
    var href = cleanText(link && (link.getAttribute('href') || link.href));
    var match = href.match(/\/feeds\/([0-9]+)\/comments\/default/i);
    var postId = match && match[1] ? cleanText(match[1]) : '';
    if (!href && postId) {
      href = (w.location && w.location.origin ? w.location.origin : '') + '/feeds/' + postId + '/comments/default';
    }
    return {
      feedUrl: href ? href.replace(/[?#].*$/, '') : '',
      postId: postId
    };
  }
  function currentFeedKey(){
    var info = commentsFeedInfo();
    return cleanText(info.feedUrl || info.postId || (w.location && w.location.pathname) || '');
  }
  function fallbackHydrationNeeded(root){
    var key = currentFeedKey();
    var stored = cleanText(root && root.getAttribute ? root.getAttribute('data-gg-feed-source') : '');
    var countAttr = cleanText(root && root.getAttribute ? root.getAttribute('data-num-comments') : '');
    var list = root && root.querySelector ? root.querySelector('#cmt2-holder') : null;
    var empty = root && root.querySelector ? root.querySelector('.gg-cmt-empty') : null;
    var emptyText = '';
    var html = '';
    if (!root || !root.querySelector) return false;
    if (key && stored && key !== stored) return true;
    if (!countAttr) return true;
    html = String(root.innerHTML || '') + '\n' + String((list && list.innerHTML) || '');
    if (/Can't find substitution for tag/i.test(html)) return true;
    if (!root.querySelector('#cmt2-holder li.comment')) {
      if (!empty) return true;
      emptyText = cleanText(empty.textContent || '');
      if (/temporarily unavailable in fallback mode/i.test(emptyText)) return true;
    }
    return false;
  }
  function commentsFeedJsonUrl(feedUrl){
    var url = cleanText(feedUrl || '');
    if (!url) return '';
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'alt=json&max-results=200';
  }
  function fetchJson(url){
    if (!url || !w.fetch) return Promise.reject(new Error('comments-feed-unavailable'));
    return w.fetch(url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    }).then(function(res){
      if (!res || !res.ok) throw new Error('comments-feed-http-' + (res && res.status ? res.status : '0'));
      return res.json();
    });
  }
  function loadCommentsFeed(){
    var info = commentsFeedInfo();
    var key = cleanText(info.feedUrl || info.postId);
    var url = commentsFeedJsonUrl(info.feedUrl);
    if (!key || !url) return Promise.reject(new Error('comments-feed-missing'));
    if (!feedFallbackCache[key]) {
      feedFallbackCache[key] = fetchJson(url);
    }
    return feedFallbackCache[key];
  }
  function commentLink(entry, rel, type){
    var links = Array.isArray(entry && entry.link) ? entry.link : [];
    var i = 0;
    var link = null;
    for (i = 0; i < links.length; i++) {
      link = links[i];
      if (!link || link.rel !== rel) continue;
      if (type && link.type !== type) continue;
      return cleanText(link.href || '');
    }
    return '';
  }
  function commentProp(entry, name){
    var props = Array.isArray(entry && entry['gd$extendedProperty']) ? entry['gd$extendedProperty'] : [];
    var i = 0;
    var one = null;
    for (i = 0; i < props.length; i++) {
      one = props[i];
      if (!one || cleanText(one.name) !== name) continue;
      return cleanText(one.value || '');
    }
    return '';
  }
  function commentIdFromValue(value){
    var raw = cleanText(value || '');
    var match = raw.match(/(?:comments\/default\/|post-)(\d+)(?:[^\d]*)$/i);
    return match && match[1] ? cleanText(match[1]) : '';
  }
  function commentDisplayTime(entry){
    var display = commentProp(entry, 'blogger.displayTime');
    var iso = cleanText(entry && entry.published && entry.published.$t);
    var parsed = iso ? Date.parse(iso) : NaN;
    if (display) return display;
    if (!isFinite(parsed)) return '';
    try {
      return new Date(parsed).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (_) {
      return iso;
    }
  }
  function normalizeFeedComments(feed){
    var entries = Array.isArray(feed && feed.entry) ? feed.entry.slice() : [];
    var items = [];
    var i = 0;
    var entry = null;
    var item = null;
    var byId = Object.create(null);
    var cursor = null;
    var guard = 0;
    entries.sort(function(a, b){
      var left = Date.parse(cleanText(a && a.published && a.published.$t)) || 0;
      var right = Date.parse(cleanText(b && b.published && b.published.$t)) || 0;
      return left - right;
    });
    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      item = {
        id: commentIdFromValue(entry && entry.id && entry.id.$t),
        parentId: commentIdFromValue(commentLink(entry, 'related')),
        authorName: cleanText(entry && entry.author && entry.author[0] && entry.author[0].name && entry.author[0].name.$t) || 'Anonymous',
        authorUrl: cleanText(entry && entry.author && entry.author[0] && entry.author[0].uri && entry.author[0].uri.$t),
        avatar: cleanText(entry && entry.author && entry.author[0] && entry.author[0]['gd$image'] && entry.author[0]['gd$image'].src),
        bodyHtml: String(entry && entry.content && entry.content.$t || ''),
        permalink: commentLink(entry, 'alternate', 'text/html'),
        editUrl: commentLink(entry, 'edit', 'application/atom+xml'),
        timestamp: commentDisplayTime(entry),
        publishedMs: Date.parse(cleanText(entry && entry.published && entry.published.$t)) || 0,
        deleted: commentProp(entry, 'blogger.contentRemoved') === 'true'
      };
      if (!item.id) continue;
      item.children = [];
      items.push(item);
    }
    for (i = 0; i < items.length; i++) {
      byId[items[i].id] = items[i];
    }
    for (i = 0; i < items.length; i++) {
      item = items[i];
      item.depth = 0;
      item.parentAuthor = '';
      cursor = item.parentId ? byId[item.parentId] : null;
      guard = 0;
      while (cursor && guard < 12) {
        item.depth += 1;
        if (!item.parentAuthor) item.parentAuthor = cursor.authorName || '';
        cursor = cursor.parentId ? byId[cursor.parentId] : null;
        guard += 1;
      }
    }
    return items;
  }
  function buildCommentTree(items){
    var byId = Object.create(null);
    var roots = [];
    var i = 0;
    var item = null;
    for (i = 0; i < items.length; i++) {
      byId[items[i].id] = items[i];
    }
    for (i = 0; i < items.length; i++) {
      item = items[i];
      if (item.parentId && byId[item.parentId] && item.parentId !== item.id) byId[item.parentId].children.push(item);
      else roots.push(item);
    }
    return roots;
  }
  function createAvatar(item){
    var box = d.createElement('div');
    var img = null;
    box.className = 'avatar-image-container gg-cmt2__avatar';
    img = d.createElement('img');
    img.className = 'author-avatar';
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.width = 35;
    img.height = 35;
    img.src = item.avatar || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    box.appendChild(img);
    return box;
  }
  function createHiddenReplyLink(){
    var wrap = d.createElement('div');
    var link = d.createElement('a');
    wrap.className = 'continue';
    wrap.hidden = true;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.setAttribute('data-gg-state', 'hidden');
    link.className = 'comment-reply';
    link.href = 'javascript:;';
    link.rel = 'nofollow';
    link.hidden = true;
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('data-gg-state', 'hidden');
    link.textContent = 'Reply';
    wrap.appendChild(link);
    return wrap;
  }
  function createHiddenThreadScaffold(count){
    var toggle = d.createElement('span');
    var threadCount = d.createElement('span');
    var n = Math.max(0, safeNumber(count));
    toggle.className = 'thread-toggle';
    toggle.hidden = true;
    toggle.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('data-gg-state', 'hidden');
    toggle.textContent = copyLabel('comments.replies.show', 'View replies ({count})', { count: n });
    threadCount.className = 'thread-count';
    threadCount.hidden = true;
    threadCount.setAttribute('aria-hidden', 'true');
    threadCount.setAttribute('data-gg-state', 'hidden');
    threadCount.textContent = String(n);
    return { toggle: toggle, count: threadCount };
  }
  function createFallbackDeleteControl(item){
    var wrap = null;
    var link = null;
    if (!item || !item.editUrl || !viewerMayModerate()) return null;
    wrap = d.createElement('span');
    wrap.className = 'item-control blog-admin';
    wrap.hidden = true;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.setAttribute('data-gg-state', 'hidden');
    wrap.setAttribute('data-gg-native-action', 'item-control');
    link = d.createElement('a');
    link.className = 'comment-delete';
    link.href = item.editUrl;
    link.setAttribute('data-gg-delete-feed', '1');
    link.setAttribute('data-gg-native-action', 'delete');
    link.setAttribute('title', copyLabel('comments.action.delete', 'Delete comment'));
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('tabindex', '-1');
    link.textContent = copyLabel('comments.action.delete', 'Delete comment');
    wrap.appendChild(link);
    return wrap;
  }
  function createCommentNode(item){
    var li = d.createElement('li');
    var block = d.createElement('div');
    var header = d.createElement('div');
    var author = d.createElement('cite');
    var authorLink = null;
    var datetime = d.createElement('span');
    var datetimeLink = d.createElement('a');
    var content = d.createElement('div');
    var footer = d.createElement('div');
    var stamp = d.createElement('span');
    var stampLink = d.createElement('a');
    var replies = null;
    var repliesList = null;
    var threadScaffold = null;
    var itemControl = null;
    var children = Array.isArray(item && item.children) ? item.children : [];
    var repliesContent = null;
    var i = 0;

    li.className = 'comment';
    li.id = 'c' + item.id;
    li.setAttribute('data-gg-comment-id', item.id);
    li.setAttribute('data-gg-depth', String(safeNumber(item.depth)));
    if (item.parentId) {
      li.setAttribute('data-gg-parent-id', item.parentId);
      if (item.parentAuthor) li.setAttribute('data-gg-parent-author', item.parentAuthor);
    }
    li.appendChild(createAvatar(item));

    block.className = 'comment-block';
    header.className = 'comment-header';
    author.className = 'user';
    if (item.authorUrl) {
      authorLink = d.createElement('a');
      authorLink.href = item.authorUrl;
      authorLink.rel = 'nofollow noopener';
      authorLink.textContent = item.authorName;
      author.appendChild(authorLink);
    } else {
      author.textContent = item.authorName;
    }
    datetime.className = 'datetime';
    datetimeLink.href = item.permalink || ('#c' + item.id);
    datetimeLink.title = 'comment permalink';
    datetimeLink.textContent = item.timestamp || 'Comment';
    if (item.publishedMs) datetimeLink.setAttribute('data-gg-comment-epoch', String(item.publishedMs));
    datetime.appendChild(datetimeLink);
    header.appendChild(author);
    header.appendChild(datetime);
    block.appendChild(header);

    content.className = 'comment-content';
    if (item.deleted) content.classList.add('deleted');
    content.innerHTML = (item.parentId ? ('[reply commentId="' + item.parentId + '" author="' + String(item.parentAuthor || '').replace(/"/g, '&quot;') + '"] ') : '') + (item.bodyHtml || '');
    block.appendChild(content);

    footer.className = 'comment-footer';
    stamp.className = 'comment-timestamp';
    stampLink.href = datetimeLink.href;
    stampLink.title = 'comment permalink';
    stampLink.textContent = datetimeLink.textContent;
    if (item.publishedMs) stampLink.setAttribute('data-gg-comment-epoch', String(item.publishedMs));
    stamp.appendChild(stampLink);
    footer.appendChild(stamp);
    footer.appendChild(createHiddenReplyLink());
    block.appendChild(footer);

    li.appendChild(block);
    itemControl = createFallbackDeleteControl(item);
    if (itemControl) li.appendChild(itemControl);
    if (children.length) {
      replies = d.createElement('div');
      replies.className = 'comment-replies';
      threadScaffold = createHiddenThreadScaffold(children.length);
      replies.appendChild(threadScaffold.toggle);
      replies.appendChild(threadScaffold.count);
      repliesList = d.createElement('ol');
      repliesContent = d.createElement('div');
      repliesContent.appendChild(repliesList);
      for (i = 0; i < children.length; i++) {
        repliesList.appendChild(createCommentNode(children[i]));
      }
      replies.appendChild(repliesContent);
      li.appendChild(replies);
    }
    return li;
  }
  function setCommentsHeading(root, total){
    var heading = root && root.querySelector ? root.querySelector('.gg-comments__h') : null;
    if (root && root.setAttribute) root.setAttribute('data-num-comments', String(total));
    if (!heading) return;
    heading.textContent = total === 1 ? '1 Comment' : total + ' Comments';
  }
  function ensureFooterSection(root, selector, className, id){
    var footer = commentsFooter(root);
    var main = footer && footer.querySelector ? footer.querySelector('.gg-comments__footer-main') : null;
    var node = root && root.querySelector ? root.querySelector(selector) : null;
    if (node || !main) return node;
    node = d.createElement('div');
    node.className = className;
    if (id) node.id = id;
    main.appendChild(node);
    return node;
  }
  function ensureFooterCta(root){
    var footer = commentsFooter(root);
    var inner = footer && footer.querySelector ? footer.querySelector('.gg-comments__footer-inner') : null;
    var wrap = footer && footer.querySelector ? footer.querySelector('#gg-top-continue') : null;
    var link = null;
    if (!footer || !inner) return null;
    if (!wrap) {
      wrap = d.createElement('div');
      wrap.className = 'gg-comments__footer-cta';
      wrap.id = 'gg-top-continue';
      inner.insertBefore(wrap, inner.firstChild || null);
    }
    link = wrap.querySelector('.comment-reply');
    if (!link) {
      link = d.createElement('a');
      link.href = 'javascript:;';
      link.rel = 'nofollow';
      link.className = 'comment-reply';
      link.setAttribute('data-gg-footer-cta', '1');
      link.setAttribute('aria-expanded', 'false');
      link.textContent = 'Add comment';
      wrap.appendChild(link);
    }
    footer.setAttribute('data-gg-has-cta', '1');
    footer.setAttribute('data-gg-open', footer.getAttribute('data-gg-open') || '0');
    return link;
  }
  function ensureFallbackComposer(root){
    var slot = composerSlot(root) || ensureFooterSection(root, '#gg-composer-slot', 'gg-comments__composerslot', 'gg-composer-slot');
    var composer = slot && slot.querySelector ? slot.querySelector('#top-ce') : null;
    var fieldId = 'gg-comments-fallback-field';
    var label = null;
    var textarea = null;
    var note = null;
    if (!slot) return null;
    if (composer && composerField(composer)) return composer;
    if (composer && composer.parentNode) composer.parentNode.removeChild(composer);
    composer = d.createElement('div');
    composer.id = 'top-ce';
    composer.className = 'comment-form';
    composer.hidden = true;
    composer.setAttribute('aria-hidden', 'true');
    composer.setAttribute('data-gg-state', 'hidden');
    composer.setAttribute('data-gg-fallback', '1');
    composer.setAttribute('data-gg-degraded', '1');
    composer.setAttribute('data-gg-owner', 'fallback-footer');
    label = d.createElement('label');
    label.className = 'gg-comments__fallback-label';
    label.setAttribute('for', fieldId);
    label.textContent = 'Fallback composer';
    textarea = d.createElement('textarea');
    textarea.id = fieldId;
    textarea.className = 'gg-comments__fallback-field';
    textarea.rows = 4;
    textarea.placeholder = 'Native composer unavailable. Draft only.';
    textarea.setAttribute('aria-label', 'Fallback comment draft');
    textarea.setAttribute('data-gg-fallback-field', '1');
    note = d.createElement('p');
    note.className = 'gg-comments__fallback-help';
    note.textContent = 'Native Blogger composer is unavailable in this view. Draft only.';
    composer.appendChild(label);
    composer.appendChild(textarea);
    composer.appendChild(note);
    slot.insertBefore(composer, slot.firstChild || null);
    return composer;
  }
  function footerAllowsComposer(root){
    var footer = commentsFooter(root);
    return !!(footer && footer.getAttribute && footer.getAttribute('data-gg-has-cta') !== '0');
  }
  function footerComposerHost(root){
    var slot = composerSlot(root);
    if (!slot || !slot.querySelectorAll) return null;
    return toArray(slot.querySelectorAll('#top-ce, .comment-replybox-single, .comment-replybox-thread')).find(function(node){
      if (!node) return false;
      if (node.getAttribute && node.getAttribute('data-gg-fallback') === '1') return false;
      if (node.getAttribute && node.getAttribute('data-gg-native-plumbing') === 'composer') return true;
      return !!(node.querySelector && node.querySelector('#comment-editor, #comment-editor-src'));
    }) || null;
  }
  function anyNativeComposerNode(root){
    if (!root || !root.querySelectorAll) return null;
    return toArray(root.querySelectorAll('#top-ce, .comment-replybox-single, .comment-replybox-thread, #comment-editor, #comment-editor-src')).find(function(node){
      if (!node) return false;
      if (node.id === 'comment-editor' || node.id === 'comment-editor-src') return true;
      if (node.getAttribute && node.getAttribute('data-gg-fallback') === '1') return false;
      if (node.getAttribute && node.getAttribute('data-gg-native-plumbing') === 'composer') return true;
      return !!(node.querySelector && node.querySelector('#comment-editor, #comment-editor-src'));
    }) || null;
  }
  function fallbackComposerNode(root){
    var slot = composerSlot(root);
    return slot && slot.querySelector ? slot.querySelector('#top-ce[data-gg-fallback="1"]') : null;
  }
  function removeFallbackComposer(root){
    var fallback = fallbackComposerNode(root);
    if (fallback && fallback.parentNode) fallback.parentNode.removeChild(fallback);
    return null;
  }
  function syncComposerKind(root){
    var kind = 'missing';
    var reason = 'missing';
    var nativeFooter = footerComposerHost(root);
    var nativeAny = anyNativeComposerNode(root);
    var fallback = fallbackComposerNode(root);
    if (!root || !root.setAttribute) return { kind: kind, reason: reason };
    if (nativeFooter) {
      kind = 'native';
      reason = 'footer-native';
    } else if (fallback) {
      kind = 'fallback';
      reason = nativeAny ? 'native-not-mounted' : 'native-markup-missing';
    } else if (nativeAny) {
      kind = 'missing';
      reason = 'native-outside-footer';
    } else if (!footerAllowsComposer(root)) {
      kind = 'missing';
      reason = 'comments-disabled';
    } else {
      kind = 'missing';
      reason = 'native-markup-missing';
    }
    root.setAttribute('data-gg-composer-kind', kind);
    root.setAttribute('data-gg-composer-reason', reason);
    return { kind: kind, reason: reason, native: nativeFooter, fallback: fallback };
  }
  function renderFallbackComments(root, feed){
    var list = root && root.querySelector ? root.querySelector('#cmt2-holder') : null;
    var footer = commentsFooter(root);
    var note = footer && footer.querySelector ? footer.querySelector('.gg-comments__footer-note') : null;
    var items = normalizeFeedComments(feed);
    var roots = buildCommentTree(items);
    var thread = d.createElement('ol');
    var i = 0;
    if (!list) return false;
    setCommentsHeading(root, safeNumber(feed && feed['openSearch$totalResults'] && feed['openSearch$totalResults'].$t));
    thread.className = 'comment-thread';
    list.textContent = '';
    if (!items.length) {
      list.innerHTML = '<div class="gg-cmt-empty"><strong>No comments yet.</strong> Be the first to add one.</div>';
    } else {
      for (i = 0; i < roots.length; i++) {
        thread.appendChild(createCommentNode(roots[i]));
      }
      list.appendChild(thread);
    }
    ensureFooterSection(root, '#gg-addslot', 'gg-comments__addslot', 'gg-addslot');
    ensureFooterSection(root, '#gg-composer-slot', 'gg-comments__composerslot', 'gg-composer-slot');
    if (note) {
      if (footerAllowsComposer(root)) {
        note.textContent = '';
        note.hidden = true;
      } else {
        note.textContent = 'Native composer unavailable in this view.';
        note.hidden = false;
      }
    }
    if (footerAllowsComposer(root)) {
      ensureFooterCta(root);
      ensureFallbackComposer(root);
    } else {
      removeFallbackComposer(root);
    }
    if (root && root.setAttribute) {
      root.setAttribute('data-gg-comment-source', 'feed-fallback');
      root.setAttribute('data-gg-feed-source', currentFeedKey());
    }
    return true;
  }
  function ensureFallbackHydration(root){
    var key = currentFeedKey();
    if (!root || !fallbackHydrationNeeded(root)) return Promise.resolve(root);
    if (root.__ggFallbackPromise && root.__ggFallbackKey === key) return root.__ggFallbackPromise;
    root.__ggFallbackKey = key;
    root.__ggFallbackPromise = loadCommentsFeed().then(function(payload){
      var feed = payload && payload.feed ? payload.feed : {};
      renderFallbackComments(root, feed);
      root.__ggFallbackPromise = null;
      return root;
    }).catch(function(){
      root.__ggFallbackPromise = null;
      return root;
    });
    return root.__ggFallbackPromise;
  }
  function isPanelOwnedComments(node){
    return !!(node && node.closest && node.closest('.gg-comments-panel,[data-gg-panel="comments"]'));
  }
  function commentsRoot(host){
    var root = null;
    if (!host) {
      root = d.getElementById('comments');
      return isPanelOwnedComments(root) ? root : null;
    }
    if (host.id === 'comments') return isPanelOwnedComments(host) ? host : null;
    if (host.querySelector) {
      root = host.querySelector('#comments') || host.querySelector('.gg-comments');
      return isPanelOwnedComments(root) ? root : null;
    }
    return null;
  }
  function hostRoot(){
    return d.querySelector('#ggPanelComments #comments, .gg-comments-panel[data-gg-panel="comments"] #comments');
  }
  function markLoaded(host){
    if (host && host.setAttribute) host.setAttribute('data-gg-comments-loaded', '1');
  }
  function commentAnchor(host){
    return commentsRoot(host) || hostRoot() || host || null;
  }
  function scrollBehavior(){
    try {
      if (GG.services && GG.services.a11y && typeof GG.services.a11y.scrollBehavior === 'function') {
        return GG.services.a11y.scrollBehavior();
      }
    } catch (_) {}
    return 'auto';
  }
  function scrollToComments(host){
    var anchor = commentAnchor(host);
    if (!anchor || typeof anchor.scrollIntoView !== 'function') return;
    w.requestAnimationFrame(function(){
      w.requestAnimationFrame(function(){
        try { anchor.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); }
        catch (_) { try { anchor.scrollIntoView(); } catch(__){} }
      });
    });
  }
  function directChildByClass(node, className){
    if (!node || !node.children) return null;
    var i = 0;
    for (; i < node.children.length; i++) {
      if (node.children[i] && node.children[i].classList && node.children[i].classList.contains(className)) {
        return node.children[i];
      }
    }
    return null;
  }
  function closestComment(node){
    return node && node.closest ? node.closest('li.comment') : null;
  }
  function commentId(comment){
    return cleanText(((comment && comment.id) || '').replace(/^c/, ''));
  }
  function normalizeCommentRef(value){
    var raw = cleanText(value || '');
    var id = '';
    var match = null;
    if (!raw) return '';
    id = commentIdFromValue(raw);
    if (id) return id;
    raw = raw.replace(/^#/, '');
    match = raw.match(/^c(\d+)$/i);
    if (match && match[1]) return cleanText(match[1]);
    match = raw.match(/(\d{6,})/);
    if (match && match[1]) return cleanText(match[1]);
    return '';
  }
  function commentParentRef(comment){
    var attrNames = ['data-gg-parent-id', 'data-parent-id', 'data-comment-parent-id', 'data-reply-to', 'data-reply-to-id'];
    var i = 0;
    var raw = '';
    var id = '';
    if (!comment || !comment.getAttribute) return '';
    for (i = 0; i < attrNames.length; i++) {
      raw = comment.getAttribute(attrNames[i]);
      id = normalizeCommentRef(raw);
      if (id) return id;
    }
    return '';
  }
  function commentParentAuthorHint(comment){
    var raw = '';
    if (!comment || !comment.getAttribute) return '';
    raw = comment.getAttribute('data-gg-parent-author') || comment.getAttribute('data-parent-author') || '';
    return cleanText(raw);
  }
  function commentBlock(comment){
    return directChildByClass(comment, 'comment-block') || (comment && comment.querySelector ? comment.querySelector('.comment-block') : null);
  }
  function commentBody(comment){
    var block = commentBlock(comment);
    if (!block || !block.querySelector) return null;
    return block.querySelector('.comment-content, .comment-body');
  }
  function commentActions(comment){
    var block = commentBlock(comment);
    if (!block) return null;
    return block.querySelector ? block.querySelector('.comment-actions') : null;
  }
  function commentReplyLinks(comment){
    if (!comment || !comment.querySelectorAll) return [];
    return toArray(comment.querySelectorAll('a.comment-reply')).filter(function(link){
      if (!link) return false;
      if (link.classList && link.classList.contains('cmt2-reply-action')) return false;
      return !(link.closest && link.closest('.gg-comments__footer'));
    });
  }
  function isRawReplyScaffold(link){
    return !!(link && link.closest && link.closest('.continue, .comment-replybox-single, .comment-replybox-thread'));
  }
  function pickPrimaryReplyLink(comment){
    var links = commentReplyLinks(comment);
    var i = 0;
    for (i = 0; i < links.length; i++) {
      if (!isRawReplyScaffold(links[i])) return links[i];
    }
    return links[0] || null;
  }
  function commentReplyLink(comment){
    var actions = commentActions(comment);
    return (actions && actions.querySelector ? actions.querySelector('.cmt2-reply-action, a.comment-reply') : null) ||
           pickPrimaryReplyLink(comment);
  }
  function commentPermalink(comment){
    var block = commentBlock(comment);
    if (!block || !block.querySelector) return '';
    var link = block.querySelector('.datetime a, .comment-timestamp a, .comment-footer a[title="comment permalink"], .comment-footer a');
    return cleanText(link && (link.getAttribute('href') || link.href));
  }
  function commentTimestampLinks(comment){
    if (!comment || !comment.querySelectorAll) return [];
    return toArray(comment.querySelectorAll('.datetime a, .comment-timestamp a'));
  }
  function commentTimestampLink(comment){
    var links = commentTimestampLinks(comment);
    return links[0] || null;
  }
  function parseCommentEpoch(link){
    var cached = 0;
    var source = '';
    var queryMatch = null;
    var parsed = NaN;
    if (!link || !link.getAttribute) return NaN;
    cached = safeNumber(link.getAttribute('data-gg-comment-epoch'));
    if (cached > 0) return cached;
    source = cleanText(link.getAttribute('href') || link.href || '');
    queryMatch = source.match(/[?&]showComment=(\d{10,16})/);
    if (queryMatch && queryMatch[1]) {
      cached = safeNumber(queryMatch[1]);
      if (cached > 0) {
        link.setAttribute('data-gg-comment-epoch', String(cached));
        return cached;
      }
    }
    source = cleanText(
      link.getAttribute('data-gg-absolute-datetime') ||
      link.getAttribute('title') ||
      link.textContent
    ).replace(/\u202f/g, ' ').replace(/\bat\b/gi, ' ');
    parsed = source ? Date.parse(source) : NaN;
    if (isFinite(parsed) && parsed > 0) {
      link.setAttribute('data-gg-comment-epoch', String(parsed));
      return parsed;
    }
    return NaN;
  }
  function commentAbsoluteTime(epoch){
    var date = null;
    if (!isFinite(epoch) || epoch <= 0) return '';
    date = new Date(epoch);
    try {
      if (GG.i18n && typeof GG.i18n.df === 'function') {
        return GG.i18n.df(date, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (_) {}
    try {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (_) {}
    return date.toISOString();
  }
  function commentRelativeParts(ms){
    var abs = Math.abs(ms);
    var second = 1000;
    var minute = second * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var month = day * 30;
    var year = day * 365;
    if (abs < minute) return { value: Math.round(ms / second), unit: 'second' };
    if (abs < hour) return { value: Math.round(ms / minute), unit: 'minute' };
    if (abs < day) return { value: Math.round(ms / hour), unit: 'hour' };
    if (abs < week) return { value: Math.round(ms / day), unit: 'day' };
    if (abs < month) return { value: Math.round(ms / week), unit: 'week' };
    if (abs < year) return { value: Math.round(ms / month), unit: 'month' };
    return { value: Math.round(ms / year), unit: 'year' };
  }
  function commentRelativeTime(epoch){
    var parts = null;
    if (!isFinite(epoch) || epoch <= 0) return '';
    parts = commentRelativeParts(epoch - Date.now());
    try {
      if (GG.i18n && typeof GG.i18n.rtf === 'function') {
        return GG.i18n.rtf(parts.value, parts.unit, { numeric: 'always' });
      }
    } catch (_) {}
    return parts.value + ' ' + parts.unit;
  }
  function hydrateCommentTimeLink(link){
    var epoch = parseCommentEpoch(link);
    var absolute = '';
    var relative = '';
    if (!link || !isFinite(epoch) || epoch <= 0) return false;
    absolute = commentAbsoluteTime(epoch);
    relative = commentRelativeTime(epoch);
    if (!relative) return false;
    if (absolute) {
      link.setAttribute('data-gg-absolute-datetime', absolute);
      link.setAttribute('title', absolute);
      link.setAttribute('aria-label', absolute);
    }
    link.setAttribute('data-gg-time-style', 'relative');
    link.textContent = relative;
    return true;
  }
  function hydrateCommentTimes(root){
    var comments = [];
    if (!root || !root.querySelectorAll) return false;
    comments = toArray(root.querySelectorAll('#cmt2-holder li.comment, .comment-thread li.comment'));
    comments.forEach(function(comment){
      commentTimestampLinks(comment).forEach(hydrateCommentTimeLink);
    });
    return !!comments.length;
  }
  function ensureCommentTimeRefresh(root){
    if (!root || root.__ggCommentTimeRefreshTimer) return;
    root.__ggCommentTimeRefreshTimer = w.setInterval(function(){
      if (!root.isConnected) {
        w.clearInterval(root.__ggCommentTimeRefreshTimer);
        root.__ggCommentTimeRefreshTimer = 0;
        return;
      }
      hydrateCommentTimes(root);
    }, 60000);
  }
  function bindCommentTimeLocale(root){
    if (!root || root.__ggCommentTimeLocaleBound) return;
    root.__ggCommentTimeLocaleBound = true;
    d.addEventListener('gg:langchange', function(){
      if (!root.isConnected) return;
      hydrateCommentTimes(root);
    });
  }
  function commentDeleteLink(comment){
    var itemControl = commentItemControl(comment);
    var fallback = null;
    if (itemControl && itemControl.querySelector) {
      fallback = itemControl.querySelector('a.comment-delete, .comment-delete a, a[data-gg-native-action="delete"], a[data-comment-action*="delete"], a[href*="/comment/delete"], a[href*="/comments/default/"], a[href*="delete"], button.comment-delete, button[data-comment-action*="delete"]');
      if (fallback) return fallback;
    }
    return comment && comment.querySelector ? comment.querySelector('a.comment-delete, .comment-delete a, a[data-gg-native-action="delete"], button.comment-delete') : null;
  }
  function commentItemControl(comment){
    return comment && comment.querySelector ? comment.querySelector('.item-control') : null;
  }
  function commentItemControlIsAdmin(itemControl){
    var cls = cleanText(itemControl && itemControl.className).toLowerCase();
    if (!itemControl) return false;
    return /(?:^|\s)(?:blog-admin|is-admin|admin|blog-author|author|owner)(?:\s|$)/.test(cls);
  }
  function commentNativeMoreControl(comment){
    var itemControl = commentItemControl(comment);
    if (!itemControl || !itemControl.querySelector) return null;
    return itemControl.querySelector('[data-gg-native-action="more"], .goog-toggle-button, [aria-haspopup="true"], [role="button"], button, a');
  }
  function commentDeleteInvoker(comment){
    var link = commentDeleteLink(comment);
    var nativeMore = null;
    var itemControl = commentItemControl(comment);
    if (link) {
      if (link.getAttribute && link.getAttribute('data-gg-delete-feed') === '1') return { kind: 'feed-edit', node: link };
      return { kind: 'link', node: link };
    }
    if (itemControl && !commentItemControlIsAdmin(itemControl)) return null;
    nativeMore = commentNativeMoreControl(comment);
    if (nativeMore) return { kind: 'native-more', node: nativeMore };
    return null;
  }
  function commentReplyBox(comment){
    var owned = comment && comment.__ggReplyBoxOwner;
    if (owned && owned.isConnected) return owned;
    return directChildByClass(comment, 'comment-replybox-single') ||
           directChildByClass(comment, 'comment-replybox-thread') ||
           (comment && comment.querySelector ? comment.querySelector('.comment-replybox-single, .comment-replybox-thread') : null);
  }
  function commentReplies(comment){
    return directChildByClass(comment, 'comment-replies') || (comment && comment.querySelector ? comment.querySelector('.comment-replies') : null);
  }
  function commentNativeThreadToggle(comment){
    return comment && comment.querySelector
      ? comment.querySelector('.comment-replies .thread-toggle, .comment-replybox-single .thread-toggle, .comment-replybox-thread .thread-toggle')
      : null;
  }
  function commentNativeThreadCount(comment){
    var node = comment && comment.querySelector
      ? comment.querySelector('.comment-replies .thread-count, .comment-replybox-single .thread-count, .comment-replybox-thread .thread-count')
      : null;
    var txt = cleanText(node && node.textContent);
    var match = txt.match(/(\d+)/);
    return match ? safeNumber(match[1]) : 0;
  }
  function commentsContent(root){
    return root && root.querySelector ? root.querySelector('.gg-comments__content') : null;
  }
  function commentsFooter(root){
    return root && root.querySelector ? root.querySelector('.gg-comments__footer') : null;
  }
  function composerSlot(root){
    return root && root.querySelector ? root.querySelector('#gg-composer-slot, [data-gg-composer-slot="1"], .gg-comments__composerslot') : null;
  }
  function nativeAddCommentLink(root){
    if (!root || !root.querySelector) return null;
    return root.querySelector('#cmt2-holder #top-continue .comment-reply, .gg-comments__list #top-continue .comment-reply');
  }
  function topComposer(root){
    var node = root && root.__ggTopComposer;
    var nodes = null;
    var i = 0;
    if (node && node.isConnected) return node;
    if (!root || !root.querySelector) return null;
    nodes = toArray(root.querySelectorAll('.gg-comments__list #top-ce, #cmt2-holder #top-ce, #top-ce'));
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (!node) continue;
      if (node.classList && node.classList.contains('comment-form')) {
        root.__ggTopComposer = node;
        return node;
      }
      if (composerField(node) || (node.querySelector && node.querySelector('#comment-editor, #comment-editor-src'))) {
        root.__ggTopComposer = node;
        return node;
      }
    }
    return null;
  }
  function composerField(box){
    return box && box.querySelector ? box.querySelector('iframe, textarea, input:not([type="hidden"]), [contenteditable="true"]') : null;
  }
  function focusNoScroll(node){
    if (!node || typeof node.focus !== 'function') return false;
    try {
      node.focus({ preventScroll: true });
      return true;
    } catch (_) {}
    try {
      node.focus();
      return true;
    } catch (__) {}
    return false;
  }
  function composerFocusShell(root, box){
    var slot = composerSlot(root) || ensureFooterSection(root, '#gg-composer-slot', 'gg-comments__composerslot', 'gg-composer-slot');
    if (!slot || !slot.setAttribute) return null;
    slot.setAttribute('data-gg-composer-focus-shell', '1');
    slot.setAttribute('tabindex', '-1');
    slot.setAttribute('role', slot.getAttribute('role') || 'group');
    if (!slot.getAttribute('aria-label')) slot.setAttribute('aria-label', 'Comment composer');
    if (box && box.setAttribute) box.setAttribute('data-gg-composer-focus-host', '1');
    return slot;
  }
  function focusDebug(root){
    if (!root) return { scrolled: false, fallback: false, nativeReady: false };
    root.__ggComposerFocusDebug = root.__ggComposerFocusDebug || {
      scrolled: false,
      fallback: false,
      nativeReady: false
    };
    return root.__ggComposerFocusDebug;
  }
  function syncFocusDebug(root){
    var debug = focusDebug(root);
    if (!root || !root.setAttribute) return debug;
    root.setAttribute('data-gg-composer-focus-scrolled', debug.scrolled ? '1' : '0');
    root.setAttribute('data-gg-composer-focus-fallback', debug.fallback ? '1' : '0');
    root.setAttribute('data-gg-composer-focus-native-ready', debug.nativeReady ? '1' : '0');
    return debug;
  }
  function resetFocusDebug(root){
    if (!root) return focusDebug(root);
    root.__ggComposerFocusDebug = {
      scrolled: false,
      fallback: false,
      nativeReady: false
    };
    return syncFocusDebug(root);
  }
  function viewportVisible(node){
    var rect = null;
    var limit = 0;
    if (!node || !node.getBoundingClientRect) return false;
    rect = node.getBoundingClientRect();
    limit = w.innerHeight || (d.documentElement && d.documentElement.clientHeight) || 0;
    return rect.bottom > 0 && rect.top < limit;
  }
  function withinRect(node, container){
    var inner = null;
    var outer = null;
    if (!node || !container || !node.getBoundingClientRect || !container.getBoundingClientRect) return false;
    inner = node.getBoundingClientRect();
    outer = container.getBoundingClientRect();
    return inner.top >= (outer.top - 1) && inner.bottom <= (outer.bottom + 1);
  }
  function footerInView(root){
    var footer = commentsFooter(root);
    var panel = root && root.closest ? root.closest('#ggPanelComments, .gg-comments-panel') : null;
    var body = panel && panel.querySelector ? panel.querySelector('.gg-comments-panel__body') : null;
    if (!footer || !viewportVisible(footer)) return false;
    return body ? withinRect(footer, body) : true;
  }
  function scrollComposerIntoView(root, target){
    var footer = commentsFooter(root);
    var content = commentsContent(root);
    var node = target || footer || composerSlot(root) || root;
    var debug = focusDebug(root);
    var needsScroll = !footerInView(root);
    if (content && content.scrollHeight > (content.clientHeight + 4)) {
      if (needsScroll || (content.scrollTop + content.clientHeight + 4) < content.scrollHeight) {
        content.scrollTop = Math.max(0, content.scrollHeight - content.clientHeight);
        debug.scrolled = true;
      }
    }
    if (needsScroll && footer && typeof footer.scrollIntoView === 'function') {
      try {
        footer.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
        debug.scrolled = true;
      } catch (_) {
        try {
          footer.scrollIntoView(false);
          debug.scrolled = true;
        } catch (__) {}
      }
    } else if (node && typeof node.scrollIntoView === 'function' && !viewportVisible(node)) {
      try {
        node.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
        debug.scrolled = true;
      } catch (_) {
        try {
          node.scrollIntoView(false);
          debug.scrolled = true;
        } catch (__) {}
      }
    }
    syncFocusDebug(root);
    return debug.scrolled;
  }
  function composerFocusInfo(root, comment){
    var state = replyState(root);
    var box = null;
    var field = null;
    var shell = null;
    if (isRightRailComments(root)) {
      if (comment && state.replyMode === 'reply' && state.replyTargetId) {
        box = activeReplyComposer(comment);
        if (box) box = mountComposerNode(root, box, comment);
      }
      if (!box) box = syncComposerOwner(root);
      field = composerField(box);
    } else {
      box = commentReplyBox(comment) || topComposer(root);
      field = composerField(box);
      if (!field) {
        field = root && root.querySelector ? root.querySelector('#top-ce iframe, #top-ce textarea, #top-ce input:not([type="hidden"]), #top-ce [contenteditable="true"]') : null;
      }
    }
    shell = composerFocusShell(root, box);
    return {
      box: box,
      field: field && isVisibleNode(field) ? field : null,
      shell: shell
    };
  }
  function isFallbackComposerNode(node){
    return !!(node && (
      (node.getAttribute && node.getAttribute('data-gg-fallback') === '1') ||
      (node.closest && node.closest('#top-ce[data-gg-fallback="1"]'))
    ));
  }
  function isComposerFocusTarget(root, node){
    if (!node || !root) return false;
    if (node.id === 'comment-editor') return true;
    if (node.closest && node.closest('[data-gg-composer-focus-shell="1"]')) return true;
    return !!(node.closest && node.closest('#gg-composer-slot') && node.closest('#comments') === root);
  }
  function focusTargetKind(root, node){
    var state = syncComposerKind(root);
    if (!isComposerFocusTarget(root, node)) return 'none';
    if (isFallbackComposerNode(node)) return 'fallback';
    if (node.id === 'comment-editor') return 'native';
    if (node.matches && node.matches('textarea, input:not([type="hidden"]), [contenteditable="true"]')) {
      return state.kind === 'native' ? 'native' : 'fallback';
    }
    if ((node.getAttribute && node.getAttribute('data-gg-composer-focus-shell') === '1') || (node.closest && node.closest('[data-gg-composer-focus-shell="1"]'))) {
      return state.kind === 'native' ? 'native-shell' : 'fallback-shell';
    }
    if (state.kind === 'native') return 'native';
    if (state.kind === 'fallback') return 'fallback';
    return 'missing';
  }
  function replyBoxHasComposer(box){
    return !!composerField(box);
  }
  function activeReplyComposer(comment){
    var box = commentReplyBox(comment);
    return replyBoxHasComposer(box) ? box : null;
  }
  function composerNodes(root){
    var nodes = [];
    var seen = [];
    var top = topComposer(root);
    function push(node){
      if (!node || seen.indexOf(node) !== -1) return;
      seen.push(node);
      nodes.push(node);
    }
    push(top);
    toArray(root && root.querySelectorAll ? root.querySelectorAll('#cmt2-holder li.comment > .comment-replybox-single, #cmt2-holder li.comment > .comment-replybox-thread') : []).forEach(push);
    return nodes;
  }
  function cacheNodeAnchor(node){
    if (!node || node.__ggAnchor) return;
    node.__ggAnchor = {
      parent: node.parentNode || null,
      next: node.nextSibling || null
    };
  }
  function showComposerNode(node){
    if (!node || !node.removeAttribute) return;
    node.hidden = false;
    node.removeAttribute('aria-hidden');
    node.removeAttribute('data-gg-state');
  }
  function hideComposerNode(node){
    if (!node || !node.setAttribute) return;
    node.hidden = true;
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('data-gg-state', 'hidden');
  }
  function restoreNodeAnchor(node, opts){
    var anchor = null;
    var o = opts || {};
    if (!node) return;
    if (node.__ggOwnerComment && node.__ggOwnerComment.__ggReplyBoxOwner === node) {
      node.__ggOwnerComment.__ggReplyBoxOwner = null;
    }
    node.__ggOwnerComment = null;
    anchor = node.__ggAnchor;
    if (anchor && anchor.parent) {
      if (anchor.next && anchor.next.parentNode === anchor.parent) anchor.parent.insertBefore(node, anchor.next);
      else anchor.parent.appendChild(node);
    }
    if (o.hidden) hideComposerNode(node);
    else showComposerNode(node);
  }
  function parkComposerNode(node){
    if (!node) return;
    restoreNodeAnchor(node, { hidden: true });
  }
  function mountComposerNode(root, node, comment){
    var slot = composerSlot(root);
    var nodes = composerNodes(root);
    var i = 0;
    if (!slot || !node) return null;
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i] === node) continue;
      parkComposerNode(nodes[i]);
    }
    cacheNodeAnchor(node);
    if (node.parentNode !== slot) slot.insertBefore(node, slot.firstChild || null);
    showComposerNode(node);
    node.__ggOwnerComment = comment || null;
    if (comment) comment.__ggReplyBoxOwner = node;
    return node;
  }
  function syncComposerOwner(root){
    var reply = replyState(root);
    var node = null;
    var nodes = null;
    var i = 0;
    if (!root || !isRightRailComments(root)) return null;
    if (reply && reply.replyMode === 'reply' && reply.replyTargetId && reply.comment) {
      node = activeReplyComposer(reply.comment) || commentReplyBox(reply.comment);
      if (node) return mountComposerNode(root, node, reply.comment);
      node = topComposer(root);
      if (node) return mountComposerNode(root, node, null);
      nodes = composerNodes(root);
      for (i = 0; i < nodes.length; i++) parkComposerNode(nodes[i]);
      return null;
    }
    node = topComposer(root);
    if (!node) return null;
    return mountComposerNode(root, node, null);
  }
  function footerState(root){
    if (!root) return {};
    root.__ggFooterState = root.__ggFooterState || { manual: false };
    return root.__ggFooterState;
  }
  function isRightRailComments(root){
    var main = root && root.closest ? root.closest('main.gg-main') : null;
    var panel = root && root.closest ? root.closest('.gg-comments-panel, .gg-blog-sidebar--right') : null;
    return !!(main && panel && main.getAttribute('data-gg-right-mode') === 'comments');
  }
  function syncFooterLayout(root){
    var footer = commentsFooter(root);
    var height = 0;
    if (!root || !root.style || !footer) return 0;
    height = Math.ceil((footer.getBoundingClientRect ? footer.getBoundingClientRect().height : footer.offsetHeight) || 0);
    root.style.setProperty('--gg-comments-footer-h', Math.max(0, height) + 'px');
    return height;
  }
  function syncFooterState(root){
    var footer = commentsFooter(root);
    var cta = footer && footer.querySelector ? footer.querySelector('[data-gg-footer-cta="1"]') : null;
    var state = footerState(root);
    var reply = replyState(root);
    var open = false;
    if (!root || !footer) return false;
    if (!footerAllowsComposer(root) && reply && reply.replyMode === 'reply') {
      if (reply.comment && reply.comment.removeAttribute) reply.comment.removeAttribute('data-gg-replying');
      if (reply.banner && reply.banner.parentNode) reply.banner.parentNode.removeChild(reply.banner);
      root.classList.remove('gg-comments--replying');
      if (root && root.setAttribute) root.setAttribute('data-gg-reply-mode', 'default');
      reply.replyMode = 'default';
      reply.replyTargetId = '';
      reply.replyTargetAuthor = '';
      reply.replyPermalink = '';
      reply.comment = null;
      reply.nativeReplyLink = null;
      state.manual = false;
    }
    if (footer.getAttribute('data-gg-has-cta') === '0') open = true;
    else if (reply && reply.replyMode === 'reply' && reply.replyTargetId) open = true;
    else open = !!state.manual;
    footer.setAttribute('data-gg-open', open ? '1' : '0');
    footer.setAttribute('data-gg-context', isRightRailComments(root) ? 'rail' : 'page');
    if (cta) {
      cta.setAttribute('aria-expanded', open ? 'true' : 'false');
      cta.textContent = open ? (reply && reply.replyMode === 'reply' ? 'Reply mode' : 'Close composer') : 'Add comment';
    }
    if (root.classList) root.classList.toggle('gg-comments--footer-open', open);
    if (root.setAttribute) root.setAttribute('data-gg-footer-open', open ? '1' : '0');
    syncComposerOwner(root);
    syncComposerKind(root);
    syncFooterLayout(root);
    return open;
  }
  function setFooterOpen(root, open, opts){
    var state = footerState(root);
    var o = opts || {};
    if (!root) return false;
    if (typeof o.manual === 'boolean') state.manual = !!(o.manual && open);
    else if (!open) state.manual = false;
    syncFooterState(root);
    if (open && o.focus) focusComposer(root, null);
    return open;
  }
  function bindFooterCta(root){
    var footer = commentsFooter(root);
    var cta = footer && footer.querySelector ? footer.querySelector('[data-gg-footer-cta="1"]') : null;
    if (!root || !cta || cta.__ggFooterCtaBound) return false;
    cta.__ggFooterCtaBound = true;
    cta.addEventListener('click', function(e){
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      if (root.getAttribute && root.getAttribute('data-gg-footer-open') === '1' && replyState(root).replyMode !== 'reply') {
        setFooterOpen(root, false, { manual: false });
        return;
      }
      openComposerForRoot(root, { focus: true });
    }, false);
    return true;
  }
  function bindFooterMetrics(root){
    var footer = commentsFooter(root);
    var slot = composerSlot(root);
    if (!root || !footer || root.__ggCommentsFooterMetricsBound) return false;
    root.__ggCommentsFooterMetricsBound = true;
    if (w.ResizeObserver) {
      root.__ggCommentsFooterObserver = new ResizeObserver(function(){
        syncFooterLayout(root);
        runProof(root);
      });
      root.__ggCommentsFooterObserver.observe(footer);
      if (slot) root.__ggCommentsFooterObserver.observe(slot);
    } else {
      root.__ggCommentsFooterSync = function(){ syncFooterLayout(root); runProof(root); };
      w.addEventListener('resize', root.__ggCommentsFooterSync, { passive: true });
    }
    syncFooterLayout(root);
    return true;
  }
  function commentDepth(comment){
    var hinted = safeNumber(comment && comment.getAttribute ? comment.getAttribute('data-gg-depth') : '');
    var depth = 0;
    var parent = comment && comment.parentElement ? comment.parentElement.closest('li.comment') : null;
    if (hinted > 0) return hinted;
    while (parent) {
      depth++;
      parent = parent.parentElement ? parent.parentElement.closest('li.comment') : null;
    }
    return depth;
  }
  function commentDepthFromDom(comment){
    var depth = 0;
    var parent = comment && comment.parentElement ? comment.parentElement.closest('li.comment') : null;
    while (parent) {
      depth++;
      parent = parent.parentElement ? parent.parentElement.closest('li.comment') : null;
    }
    return depth;
  }
  function ensureReplyThreadContainer(parent){
    var replies = commentReplies(parent);
    var list = null;
    var wrap = null;
    var scaffold = null;
    var count = 0;
    if (!parent) return null;
    if (!replies) {
      replies = d.createElement('div');
      replies.className = 'comment-replies';
      parent.appendChild(replies);
    }
    list = replies.querySelector(':scope > div > ol') ||
           replies.querySelector(':scope > ol') ||
           replies.querySelector('ol');
    if (!list) {
      wrap = d.createElement('div');
      list = d.createElement('ol');
      wrap.appendChild(list);
      replies.appendChild(wrap);
    }
    if (!replies.querySelector(':scope > .thread-toggle') || !replies.querySelector(':scope > .thread-count')) {
      count = replyChildrenCount(replies);
      scaffold = createHiddenThreadScaffold(count);
      if (!replies.querySelector(':scope > .thread-toggle')) {
        replies.insertBefore(scaffold.toggle, replies.firstChild || null);
      }
      if (!replies.querySelector(':scope > .thread-count')) {
        replies.insertBefore(scaffold.count, replies.firstChild ? replies.firstChild.nextSibling : null);
      }
    }
    return { replies: replies, list: list };
  }
  function commentRootParentRef(comment, root){
    var id = commentParentRef(comment);
    var ctx = null;
    if (id) return id;
    ctx = resolveReplyContext(comment, root);
    return cleanText(ctx && ctx.id);
  }
  function rethreadCommentIfNeeded(comment, root){
    var parentId = '';
    var parent = null;
    var thread = null;
    var depth = 0;
    if (!comment || !root || !comment.parentElement) return false;
    if (comment.parentElement.closest('li.comment')) return false;
    parentId = commentRootParentRef(comment, root);
    if (!parentId) return false;
    parent = d.getElementById('c' + parentId) || (root.querySelector ? root.querySelector('#c' + parentId) : null);
    if (!parent || parent === comment || parent.contains(comment) || comment.contains(parent)) return false;
    thread = ensureReplyThreadContainer(parent);
    if (!thread || !thread.list) return false;
    thread.list.appendChild(comment);
    depth = commentDepthFromDom(comment);
    comment.setAttribute('data-gg-depth', String(depth));
    if (depth > 0) comment.classList.add('is-reply');
    return true;
  }
  function rethreadDanglingComments(root, comments){
    var list = Array.isArray(comments) ? comments : [];
    var changed = false;
    var i = 0;
    for (i = 0; i < list.length; i++) {
      if (rethreadCommentIfNeeded(list[i], root)) changed = true;
    }
    return changed;
  }
  function replyChildrenCount(replies){
    return replies && replies.querySelectorAll ? replies.querySelectorAll('li.comment').length : 0;
  }
  function commentAuthor(comment){
    var block = commentBlock(comment);
    if (!block || !block.querySelector) return '';
    var author = block.querySelector('cite.user a, cite.user, .comment-author a, .comment-author');
    return cleanText(author && author.textContent);
  }
  function commentStateInfo(comment){
    var body = commentBody(comment);
    var text = '';
    if (!body) return { key: 'active', label: '', interactive: true };
    text = cleanText(body.textContent).toLowerCase();
    if (/awaiting moderation|held for moderation|pending moderation|visible after approval|comment will be visible after approval|after it has been approved/i.test(text)) {
      return { key: 'pending', label: 'Awaiting moderation', interactive: false };
    }
    if (/removed by a blog administrator|removed by blog administrator|removed by admin/i.test(text)) {
      return { key: 'removed-admin', label: 'Removed by admin', interactive: false };
    }
    if (/(^|\s)deleted(\s|$)/.test(body.className || '') || /comment (has been )?(removed|deleted)|deleted by the author|removed by the author|this comment has been removed/i.test(text)) {
      return { key: 'deleted', label: 'Deleted', interactive: false };
    }
    return { key: 'active', label: '', interactive: true };
  }
  function isDeletedComment(comment){
    return commentStateInfo(comment).key !== 'active';
  }
  function setSuppressed(node){
    if (!node || !node.setAttribute) return;
    node.hidden = true;
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('data-gg-state', 'hidden');
  }
  function isVisibleNode(node){
    var style = null;
    if (!node || !node.ownerDocument) return false;
    if (node.hidden || node.getAttribute('aria-hidden') === 'true' || node.getAttribute('data-gg-state') === 'hidden') return false;
    if (w.getComputedStyle) {
      try { style = w.getComputedStyle(node); } catch (_) { style = null; }
    }
    if (style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')) return false;
    return true;
  }
  function firstVisibleNode(nodes){
    var i = 0;
    for (i = 0; i < nodes.length; i++) {
      if (isVisibleNode(nodes[i])) return nodes[i];
    }
    return null;
  }
  function suppressHelperCopy(scope){
    var nodes = null;
    var i = 0;
    var node = null;
    var txt = '';
    if (!scope || !scope.querySelectorAll) return;
    nodes = scope.querySelectorAll('p, div, span, small, li, label');
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (!node || node.querySelector && node.querySelector('iframe, textarea, input, button, select, form, [contenteditable="true"]')) continue;
      txt = cleanText(node.textContent);
      if (!txt) continue;
      if (!/rich comment tags|\[quote\][\s\S]*?\[\/quote\]|\[code\][\s\S]*?\[\/code\]|\[link\][\s\S]*?\[\/link\]|\[image\][\s\S]*?\[\/image\]/i.test(txt)) continue;
      setSuppressed(node);
    }
  }
  function suppressRootScaffolding(root){
    var scopes = null;
    var i = 0;
    if (!root || !root.querySelectorAll) return;
    toArray(root.querySelectorAll('#cmt2-holder #top-continue, #cmt2-holder .continue, #cmt2-holder .thread-toggle, #cmt2-holder .thread-count, #cmt2-holder .item-control, .comment-replybox-single .comment-form-message, .comment-replybox-thread .comment-form-message, #top-ce .comment-form-message')).forEach(setSuppressed);
    scopes = root.querySelectorAll('.comment-replybox-single, .comment-replybox-thread, #top-ce');
    for (i = 0; i < scopes.length; i++) suppressHelperCopy(scopes[i]);
  }
  function notify(message){
    if (!message) return;
    try {
      if (GG.util && typeof GG.util.showToast === 'function') {
        GG.util.showToast(message);
        return;
      }
    } catch (_) {}
    try {
      if (GG.ui && GG.ui.toast && typeof GG.ui.toast.show === 'function') {
        GG.ui.toast.show(message);
      }
    } catch (_) {}
  }
  function copyLabel(key, fallback, vars){
    if (GG.copy && typeof GG.copy.t === 'function') return GG.copy.t(key, fallback, vars);
    return String(fallback == null ? '' : fallback);
  }
  function commentsUiState(root){
    if (!root) return { loaded: true, panelWidth: 'sidebar', sortOrder: 'newest' };
    root.__ggCommentsUi = root.__ggCommentsUi || {
      loaded: false,
      panelWidth: 'sidebar',
      sortOrder: 'newest'
    };
    if (!root.__ggCommentsUi.loaded) {
      root.__ggCommentsUi.panelWidth = readStoredChoice(COMMENTS_PANEL_WIDTH_KEY, PANEL_WIDTH_MODES, 'sidebar');
      root.__ggCommentsUi.sortOrder = readStoredChoice(COMMENTS_SORT_KEY, COMMENT_SORT_MODES, 'newest');
      root.__ggCommentsUi.loaded = true;
    }
    return root.__ggCommentsUi;
  }
  function commentsMain(root){
    return root && root.closest ? root.closest('main.gg-main') : null;
  }
  function commentsHeadSlot(root){
    return root && root.querySelector ? root.querySelector('[data-gg-comments-sort-slot="1"], .gg-comments__sortslot') : null;
  }
  function commentsTopThreadContainer(root){
    var holder = root && root.querySelector ? root.querySelector('#cmt2-holder') : null;
    var directThread = null;
    var i = 0;
    if (!holder) return null;
    directThread = directChildByClass(holder, 'comment-thread');
    if (directThread) {
      if (directThread.tagName === 'OL') return directThread;
      if (directThread.querySelector) {
        var nested = directThread.querySelector('ol');
        if (nested) return nested;
      }
    }
    for (i = 0; i < holder.children.length; i++) {
      if (holder.children[i] && holder.children[i].tagName === 'OL') return holder.children[i];
    }
    return holder;
  }
  function commentsTopLevelRows(container){
    return toArray(container && container.children ? container.children : []).filter(function(node){
      return !!(node && node.classList && node.classList.contains('comment'));
    });
  }
  function commentSortEpoch(comment){
    var link = commentTimestampLink(comment);
    var epoch = parseCommentEpoch(link);
    var fallback = 0;
    if (isFinite(epoch) && epoch > 0) return epoch;
    fallback = safeNumber(comment && comment.getAttribute ? comment.getAttribute('data-gg-comment-epoch') : '');
    if (fallback > 0) return fallback;
    fallback = safeNumber(commentId(comment));
    return fallback > 0 ? fallback : 0;
  }
  function applyCommentSort(root, order, opts){
    var mode = order === 'oldest' ? 'oldest' : 'newest';
    var options = opts || {};
    var container = commentsTopThreadContainer(root);
    var rows = commentsTopLevelRows(container);
    var sorted = [];
    var changed = false;
    var i = 0;
    if (!root || !container) return false;
    if (rows.length > 1) {
      rows.forEach(function(node, index){ node.__ggSortIndex = index; });
      sorted = rows.slice().sort(function(left, right){
        var diff = commentSortEpoch(left) - commentSortEpoch(right);
        if (mode === 'newest') diff *= -1;
        if (diff !== 0) return diff;
        return safeNumber(left.__ggSortIndex) - safeNumber(right.__ggSortIndex);
      });
      for (i = 0; i < rows.length; i++) {
        if (rows[i] !== sorted[i]) {
          changed = true;
          break;
        }
      }
      if (changed) sorted.forEach(function(node){ container.appendChild(node); });
    }
    if (root.setAttribute) root.setAttribute('data-gg-comment-sort', mode);
    if (!options.skipStore) writeStoredChoice(COMMENTS_SORT_KEY, mode);
    return true;
  }
  function applyPanelWidth(root, mode, opts){
    var next = mode === 'wide' ? 'wide' : 'sidebar';
    var options = opts || {};
    var width = next === 'wide' ? '440px' : '240px';
    var main = commentsMain(root);
    if (main && main.style) {
      main.style.setProperty('--gg-comments-rail-w', width);
      main.setAttribute('data-gg-comments-panel-width', next);
    }
    if (root && root.setAttribute) root.setAttribute('data-gg-comment-panel-width', next);
    if (!options.skipStore) writeStoredChoice(COMMENTS_PANEL_WIDTH_KEY, next);
    return next;
  }
  function updateHeadControls(root){
    var state = commentsUiState(root);
    var slot = commentsHeadSlot(root);
    var tools = slot && slot.querySelector ? slot.querySelector('.cmt2-head-tools') : null;
    var widthBtn = tools && tools.querySelector ? tools.querySelector('[data-gg-comment-action="panel-width"]') : null;
    var sortBtn = tools && tools.querySelector ? tools.querySelector('[data-gg-comment-action="sort-order"]') : null;
    var widthMode = applyPanelWidth(root, state.panelWidth, { skipStore: true });
    var sortMode = state.sortOrder === 'oldest' ? 'oldest' : 'newest';
    applyCommentSort(root, sortMode, { skipStore: true });
    state.panelWidth = widthMode;
    state.sortOrder = sortMode;
    if (widthBtn) {
      widthBtn.setAttribute('data-gg-mode', widthMode);
      widthBtn.textContent = widthMode === 'wide'
        ? copyLabel('comments.toolbar.width.wide', 'Wide (440px)')
        : copyLabel('comments.toolbar.width.sidebar', 'Sidebar (240px)');
      widthBtn.setAttribute('aria-label', widthMode === 'wide'
        ? copyLabel('comments.toolbar.width.toggleToSidebar', 'Switch to sidebar width (240px)')
        : copyLabel('comments.toolbar.width.toggleToWide', 'Switch to wide width (440px)'));
    }
    if (sortBtn) {
      sortBtn.setAttribute('data-gg-mode', sortMode);
      sortBtn.textContent = sortMode === 'oldest'
        ? copyLabel('comments.toolbar.sort.oldest', 'Oldest comments')
        : copyLabel('comments.toolbar.sort.newest', 'Newest comments');
      sortBtn.setAttribute('aria-label', sortMode === 'oldest'
        ? copyLabel('comments.toolbar.sort.toggleToNewest', 'Sort comments by newest')
        : copyLabel('comments.toolbar.sort.toggleToOldest', 'Sort comments by oldest'));
    }
    return !!tools;
  }
  function ensureHeadControls(root){
    var slot = commentsHeadSlot(root);
    var tools = null;
    var widthBtn = null;
    var sortBtn = null;
    if (!slot) return false;
    tools = slot.querySelector('.cmt2-head-tools');
    if (!tools) {
      tools = d.createElement('div');
      tools.className = 'cmt2-head-tools';
      widthBtn = d.createElement('button');
      widthBtn.type = 'button';
      widthBtn.className = 'cmt2-head-btn cmt2-head-btn--width';
      widthBtn.setAttribute('data-gg-comment-action', 'panel-width');
      sortBtn = d.createElement('button');
      sortBtn.type = 'button';
      sortBtn.className = 'cmt2-head-btn cmt2-head-btn--sort';
      sortBtn.setAttribute('data-gg-comment-action', 'sort-order');
      tools.appendChild(widthBtn);
      tools.appendChild(sortBtn);
      slot.appendChild(tools);
    }
    updateHeadControls(root);
    return true;
  }
  function cyclePanelWidth(root){
    var state = commentsUiState(root);
    state.panelWidth = state.panelWidth === 'wide' ? 'sidebar' : 'wide';
    applyPanelWidth(root, state.panelWidth);
    updateHeadControls(root);
    runProof(root);
    return state.panelWidth;
  }
  function cycleSortOrder(root){
    var state = commentsUiState(root);
    state.sortOrder = state.sortOrder === 'oldest' ? 'newest' : 'oldest';
    applyCommentSort(root, state.sortOrder);
    updateHeadControls(root);
    runProof(root);
    return state.sortOrder;
  }
  function fallbackCopy(text){
    var ta = null;
    var ok = false;
    try {
      ta = d.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      (d.body || d.documentElement).appendChild(ta);
      ta.select();
      ok = !!(d.execCommand && d.execCommand('copy'));
    } catch (_) {
      ok = false;
    }
    if (ta && ta.parentNode) ta.parentNode.removeChild(ta);
    return ok;
  }
  function copyPermalink(url){
    if (!url) return false;
    if (w.navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){
        notify(copyLabel('comments.status.copied', 'Comment link copied'));
      }).catch(function(){
        if (fallbackCopy(url)) {
          notify(copyLabel('comments.status.copied', 'Comment link copied'));
          return;
        }
        notify(copyLabel('share.status.unavailable', 'Sharing is unavailable on this device'));
      });
      return true;
    }
    if (fallbackCopy(url)) {
      notify(copyLabel('comments.status.copied', 'Comment link copied'));
      return true;
    }
    notify(copyLabel('share.status.unavailable', 'Sharing is unavailable on this device'));
    return false;
  }
  function markTarget(comment){
    if (!comment || !comment.classList) return;
    comment.classList.add('is-targeted');
    clearTimeout(comment.__ggTargetTimer);
    comment.__ggTargetTimer = w.setTimeout(function(){
      if (comment && comment.classList) comment.classList.remove('is-targeted');
    }, 1800);
  }
  function jumpToComment(root, rawId){
    var id = cleanText(String(rawId || '').replace(/^#/, '').replace(/^c/, ''));
    var target = null;
    if (!id) return false;
    target = d.getElementById('c' + id) ||
             (root && root.querySelector ? root.querySelector('#c' + id) : null);
    if (!target) return false;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (_) {}
    try {
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    } catch (_) {
      try { target.scrollIntoView(); } catch(__) {}
    }
    markTarget(target);
    return true;
  }
  function parseReplyToken(body){
    var walker = null;
    var node = null;
    var raw = '';
    var match = null;
    var attrs = null;
    var scan = '';
    var showText = (typeof w.NodeFilter !== 'undefined' && w.NodeFilter && w.NodeFilter.SHOW_TEXT) ? w.NodeFilter.SHOW_TEXT : 4;
    if (!body) return null;
    scan = cleanText(body.textContent || '');
    if (body.__ggReplyTokenParsed) {
      if (body.__ggReplyToken) return body.__ggReplyToken;
      if (body.__ggReplyTokenScan === scan) return null;
    }
    body.__ggReplyTokenParsed = true;
    body.__ggReplyToken = null;
    body.__ggReplyTokenScan = scan;
    if (!d.createTreeWalker) return null;
    walker = d.createTreeWalker(body, showText, null);
    while ((node = walker.nextNode())) {
      raw = String(node.nodeValue || '');
      match = raw.match(/\[reply\s+([^\]]+)\]/i);
      if (!match) continue;
      attrs = {};
      String(match[1] || '').replace(/([a-z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi, function(_, key, valueDq, valueSq, valueBare){
        attrs[String(key || '').toLowerCase()] = cleanText(valueDq || valueSq || valueBare || '');
        return '';
      });
      node.nodeValue = raw.replace(match[0], ' ');
      if (!cleanText(node.nodeValue || '') && node.parentNode) node.parentNode.removeChild(node);
      body.__ggReplyToken = {
        id: cleanText(attrs.commentid || attrs.comment || attrs.id || attrs.parentid || ''),
        author: cleanText(attrs.author || ''),
        url: cleanText(attrs.url || attrs.profile || '')
      };
      body.__ggReplyTokenScan = cleanText(body.textContent || '');
      break;
    }
    return body.__ggReplyToken;
  }
  function resolveReplyContext(comment, root){
    var body = commentBody(comment);
    var parentRef = commentParentRef(comment);
    var parentAuthorHint = commentParentAuthorHint(comment);
    var token = parseReplyToken(body);
    var parent = comment && comment.parentElement ? comment.parentElement.closest('li.comment') : null;
    var target = null;
    if (parentRef) {
      target = d.getElementById('c' + parentRef) || (root && root.querySelector ? root.querySelector('#c' + parentRef) : null);
      return {
        id: cleanText(parentRef),
        author: parentAuthorHint || commentAuthor(target),
        url: commentPermalink(target)
      };
    }
    if (token && token.id) {
      target = d.getElementById('c' + token.id) || (root && root.querySelector ? root.querySelector('#c' + token.id) : null);
      return {
        id: cleanText(String(token.id).replace(/^c/, '')),
        author: token.author || commentAuthor(target) || parentAuthorHint,
        url: token.url || commentPermalink(target)
      };
    }
    if (!parent) return null;
    return {
      id: commentId(parent),
      author: commentAuthor(parent),
      url: commentPermalink(parent)
    };
  }
  function ensureReplyContext(comment, root){
    var block = commentBlock(comment);
    var body = commentBody(comment);
    var ctx = resolveReplyContext(comment, root);
    var meta = null;
    var copy = null;
    var icon = null;
    var author = null;
    if (!block || !body) return;
    meta = block.querySelector('.cmt2-reply-meta');
    if (!ctx || isDeletedComment(comment)) {
      if (meta && meta.parentNode) meta.parentNode.removeChild(meta);
      return;
    }
    if (!meta) {
      meta = d.createElement('button');
      meta.type = 'button';
      meta.className = 'cmt2-reply-meta';
      icon = d.createElement('span');
      icon.className = 'ms cmt2-reply-meta__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'reply';
      copy = d.createElement('span');
      copy.className = 'cmt2-reply-meta__copy';
      author = d.createElement('span');
      author.className = 'cmt2-reply-meta__author';
      meta.appendChild(icon);
      meta.appendChild(copy);
      meta.appendChild(author);
      block.insertBefore(meta, body);
    } else {
      copy = meta.querySelector('.cmt2-reply-meta__copy');
      author = meta.querySelector('.cmt2-reply-meta__author');
    }
    meta.setAttribute('data-gg-comment-jump', ctx.id);
    meta.setAttribute('aria-label', copyLabel('comments.replyTo', 'Reply to {name}', { name: ctx.author ? '@' + ctx.author : copyLabel('comments.parentComment', 'parent comment') }));
    if (copy) copy.textContent = copyLabel('comments.replyingTo', 'Replying to');
    if (author) author.textContent = ctx.author ? '@' + ctx.author : copyLabel('comments.parentComment', 'parent comment');
  }
  function ensureModerationState(comment){
    var block = commentBlock(comment);
    var body = commentBody(comment);
    var state = commentStateInfo(comment);
    var badge = null;
    if (!block || !body) return;
    badge = block.querySelector('.cmt2-state');
    if (state.key === 'active') {
      comment.setAttribute('data-gg-comment-state', 'active');
      if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
      return;
    }
    comment.setAttribute('data-gg-comment-state', state.key);
    if (!badge) {
      badge = d.createElement('p');
      badge.className = 'cmt2-state';
      block.insertBefore(badge, body);
    }
    badge.textContent = state.label;
  }
  function ensureActions(comment){
    var block = commentBlock(comment);
    var body = commentBody(comment);
    var actions = commentActions(comment);
    if (!block || !body) return null;
    if (!actions) {
      actions = d.createElement('div');
      actions.className = 'comment-actions';
      if (body.nextSibling) block.insertBefore(actions, body.nextSibling);
      else block.appendChild(actions);
    }
    return actions;
  }
  function ensureToggleButton(comment){
    var replies = commentReplies(comment);
    var renderedCount = replyChildrenCount(replies);
    var nativeToggle = commentNativeThreadToggle(comment);
    var nativeCount = commentNativeThreadCount(comment);
    var count = renderedCount || nativeCount;
    var actions = ensureActions(comment);
    var state = commentStateInfo(comment);
    var btn = null;
    var before = null;
    var isOpen = true;
    if (!actions) return;
    btn = actions.querySelector('.cmt2-thread-toggle');
    before = actions.querySelector('.cmt2-ctx');
    if ((!replies && !nativeToggle) || !count || !state.interactive) {
      if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
      if (replies) {
        replies.hidden = false;
        replies.removeAttribute('data-gg-state');
      }
      return;
    }
    if (!btn) {
      btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'cmt2-thread-toggle';
      btn.setAttribute('data-gg-comment-toggle', commentId(comment));
      if (before) actions.insertBefore(btn, before);
      else actions.appendChild(btn);
    }
    isOpen = !!(replies && !replies.hidden && replies.getAttribute('data-gg-state') !== 'collapsed');
    if ((!replies || renderedCount <= 0) && nativeToggle) {
      var nativeExpanded = cleanText(nativeToggle.getAttribute && nativeToggle.getAttribute('aria-expanded')).toLowerCase();
      var nativeText = cleanText(nativeToggle.textContent).toLowerCase();
      if (nativeExpanded === 'true' || /hide|sembuny|tutup/i.test(nativeText)) isOpen = true;
      if (nativeExpanded === 'false' || /view|show|lihat|buka/i.test(nativeText)) isOpen = false;
    }
    btn.__ggNativeThreadToggle = nativeToggle && nativeToggle.isConnected ? nativeToggle : null;
    btn.setAttribute('data-gg-thread-count', String(count));
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.setAttribute('aria-label', isOpen
      ? copyLabel('comments.replies.hide', 'Hide replies ({count})', { count: count })
      : copyLabel('comments.replies.show', 'View replies ({count})', { count: count }));
    btn.setAttribute('data-gg-comment-icon', isOpen ? 'unfold_less' : 'unfold_more');
    btn.textContent = isOpen
      ? copyLabel('comments.replies.hide', 'Hide replies ({count})', { count: count })
      : copyLabel('comments.replies.show', 'View replies ({count})', { count: count });
  }
  function normalizeReplyLink(comment, root){
    var actions = ensureActions(comment);
    var links = commentReplyLinks(comment);
    var primary = pickPrimaryReplyLink(comment);
    var state = commentStateInfo(comment);
    var composerEnabled = !root || footerAllowsComposer(root);
    var action = null;
    var before = null;
    var i = 0;
    var parent = null;
    if (!actions) return null;
    before = actions.querySelector('.cmt2-thread-toggle, .cmt2-ctx');
    action = actions.querySelector('.cmt2-reply-action');
    if (!state.interactive || !primary || !composerEnabled) {
      if (action && action.parentNode) action.parentNode.removeChild(action);
      for (i = 0; i < links.length; i++) {
        setSuppressed(links[i]);
        parent = links[i].parentNode;
        if (parent && parent.classList && parent.classList.contains('continue')) setSuppressed(parent);
      }
      return null;
    }
    for (i = 0; i < links.length; i++) {
      setSuppressed(links[i]);
      parent = links[i].parentNode;
      if (parent && parent.classList && parent.classList.contains('continue')) setSuppressed(parent);
    }
    if (!action) {
      action = d.createElement('a');
      action.href = 'javascript:;';
      action.rel = 'nofollow';
      action.className = 'comment-reply cmt2-reply-action';
      action.setAttribute('data-gg-comment-action', 'reply');
    }
    action.textContent = cleanText(primary.textContent) || copyLabel('comments.action.reply', 'Reply');
    action.setAttribute('data-gg-comment-role', 'reply');
    action.setAttribute('aria-label', copyLabel('comments.replyTo', 'Reply to {name}', { name: commentAuthor(comment) ? '@' + commentAuthor(comment) : copyLabel('comments.parentComment', 'comment') }));
    action.setAttribute('data-gg-comment-icon', 'reply');
    action.__ggNativeReplyLink = primary;
    action.removeAttribute('hidden');
    action.removeAttribute('aria-hidden');
    action.removeAttribute('data-gg-state');
    if (action.parentNode !== actions) {
      if (before) actions.insertBefore(action, before);
      else actions.appendChild(action);
    }
    return action;
  }
  function suppressCommentScaffolding(comment){
    var actions = commentActions(comment);
    var hasMore = !!(actions && actions.querySelector && actions.querySelector('.cmt2-ctx'));
    var deletePeers = null;
    var scaffolds = null;
    var itemControls = null;
    var i = 0;
    if (!comment || !comment.querySelectorAll) return;
    deletePeers = comment.querySelectorAll('.comment-footer .comment-delete, .comment-footer .cmt2-del, .comment-actions .comment-delete, .comment-actions .cmt2-del, .gg-cmt2__del');
    if (hasMore) {
      for (i = 0; i < deletePeers.length; i++) setSuppressed(deletePeers[i]);
    }
    itemControls = comment.querySelectorAll('.item-control');
    for (i = 0; i < itemControls.length; i++) setSuppressed(itemControls[i]);
    scaffolds = comment.querySelectorAll('.comment-replies .thread-toggle, .comment-replies .thread-count, .comment-replies .continue, .comment-replybox-single .thread-toggle, .comment-replybox-single .thread-count, .comment-replybox-single .continue, .comment-replybox-thread .thread-toggle, .comment-replybox-thread .thread-count, .comment-replybox-thread .continue');
    for (i = 0; i < scaffolds.length; i++) setSuppressed(scaffolds[i]);
    suppressHelperCopy(commentReplyBox(comment));
  }
  function collectProofIssues(root){
    var issues = [];
    var comments = null;
    var i = 0;
    var comment = null;
    var actions = null;
    var moderation = null;
    var hasMore = false;
    var hasVisibleDelete = false;
    var helperNodes = null;
    var rawReplys = null;
    var footer = null;
    var content = null;
    var footerStyle = null;
    var contentStyle = null;
    var footerHeight = 0;
    var paddingBottom = 0;
    var cta = null;
    var visibleComposerOwners = null;
    var visibleAddOwners = null;
    var hasNativeReply = false;
    var hasVisibleReply = false;
    var moderationBadges = null;
    var visibleTopComposerOwners = null;
    if (!root || !root.querySelectorAll) return issues;
    if (root.querySelector('.cmt2-replying__eyebrow, .cmt2-replying:not([data-gg-tone="inline"])')) issues.push('reply-cue-heavy');
    helperNodes = toArray(root.querySelectorAll('.comment-replybox-single p, .comment-replybox-single div, .comment-replybox-single span, .comment-replybox-thread p, .comment-replybox-thread div, .comment-replybox-thread span, #top-ce p, #top-ce div, #top-ce span')).filter(function(node){
      var txt = '';
      if (!isVisibleNode(node)) return false;
      if (node.querySelector && node.querySelector('iframe, textarea, input, button, select, form, [contenteditable="true"]')) return false;
      txt = cleanText(node.textContent);
      return !!txt && /rich comment tags|\[quote\][\s\S]*?\[\/quote\]|\[code\][\s\S]*?\[\/code\]|\[link\][\s\S]*?\[\/link\]|\[image\][\s\S]*?\[\/image\]/i.test(txt);
    });
    if (helperNodes.length) issues.push('helper-copy-visible');
    if (isRightRailComments(root)) {
      footer = commentsFooter(root);
      content = commentsContent(root);
      cta = footer && footer.querySelector ? footer.querySelector('[data-gg-footer-cta="1"]') : null;
      var composerState = syncComposerKind(root);
      visibleComposerOwners = toArray(root.querySelectorAll('.gg-comments__composerslot > #top-ce, .gg-comments__composerslot > .comment-replybox-single, .gg-comments__composerslot > .comment-replybox-thread, .gg-comments__list #top-ce, #cmt2-holder li.comment > .comment-replybox-single, #cmt2-holder li.comment > .comment-replybox-thread')).filter(function(node){
        if (!isVisibleNode(node)) return false;
        if (node.id === 'top-ce') return true;
        return replyBoxHasComposer(node);
      });
      visibleAddOwners = toArray(root.querySelectorAll('#gg-top-continue .comment-reply, #top-continue .comment-reply')).filter(isVisibleNode);
      if (!footer || !content) issues.push('rail-footer-missing');
      else {
        if (w.getComputedStyle) {
          try { footerStyle = w.getComputedStyle(footer); } catch (_) { footerStyle = null; }
          try { contentStyle = w.getComputedStyle(content); } catch (_) { contentStyle = null; }
        }
        footerHeight = (footer.getBoundingClientRect ? footer.getBoundingClientRect().height : footer.offsetHeight) || 0;
        paddingBottom = contentStyle ? parseFloat(contentStyle.paddingBottom || '0') : 0;
        if (!footerStyle || footerStyle.position !== 'sticky') issues.push('rail-footer-not-sticky');
        if (!contentStyle || !/auto|scroll/i.test(contentStyle.overflowY || '')) issues.push('rail-content-not-scroll');
        if (cta && !isVisibleNode(cta)) issues.push('rail-footer-cta-hidden');
        if (footerHeight > 0 && (paddingBottom + 8) < footerHeight) issues.push('rail-footer-space-low');
      }
      if (cta && composerState.kind !== 'native') issues.push('composer-kind:' + composerState.kind + ':' + composerState.reason);
      if (cta && visibleAddOwners.length !== 1) issues.push('add-comment-owner-count:' + visibleAddOwners.length);
      visibleTopComposerOwners = toArray(root.querySelectorAll('#top-ce')).filter(function(node){
        return isVisibleNode(node) && replyBoxHasComposer(node);
      });
      if (visibleTopComposerOwners.length > 1) issues.push('duplicate-composer-id');
      if (visibleComposerOwners.length > 1) issues.push('composer-owner-duplicate');
      if (visibleAddOwners.length > 1) issues.push('add-comment-duplicate');
      if (firstVisibleNode(toArray(root.querySelectorAll('#cmt2-holder #top-continue .comment-reply, #cmt2-holder .continue .comment-reply')))) {
        issues.push('native-add-comment-visible');
      }
    }
    comments = root.querySelectorAll('#cmt2-holder li.comment, .comment-thread li.comment');
    for (i = 0; i < comments.length; i++) {
      comment = comments[i];
      moderation = commentStateInfo(comment);
      actions = commentActions(comment);
      hasMore = !!(actions && actions.querySelector && actions.querySelector('.cmt2-ctx'));
      hasVisibleDelete = !!firstVisibleNode(toArray(comment.querySelectorAll('.comment-footer .comment-delete, .comment-footer .cmt2-del, .comment-actions .comment-delete, .comment-actions .cmt2-del, .gg-cmt2__del')));
      if (hasMore && hasVisibleDelete) issues.push('delete-peer:' + commentId(comment));
      if (firstVisibleNode(toArray(comment.querySelectorAll('.item-control')))) {
        issues.push('item-control-visible:' + commentId(comment));
      }
      hasNativeReply = !!pickPrimaryReplyLink(comment);
      hasVisibleReply = !!(actions && actions.querySelector && firstVisibleNode(toArray(actions.querySelectorAll('.cmt2-reply-action'))));
      if (moderation.interactive && hasNativeReply && !hasVisibleReply) issues.push('reply-missing:' + commentId(comment));
      rawReplys = toArray(commentReplyLinks(comment)).filter(function(link){
        if (!isVisibleNode(link)) return false;
        if (link.classList && link.classList.contains('cmt2-reply-action')) return false;
        if (link.getAttribute && link.getAttribute('data-gg-footer-cta') === '1') return false;
        return true;
      });
      if (rawReplys.length) issues.push('reply-scaffold:' + commentId(comment));
      if (comment.querySelector('.comment-replies .thread-toggle, .comment-replies .thread-count, .comment-replybox-single .thread-toggle, .comment-replybox-single .thread-count, .comment-replybox-thread .thread-toggle, .comment-replybox-thread .thread-count')) {
        if (firstVisibleNode(toArray(comment.querySelectorAll('.comment-replies .thread-toggle, .comment-replies .thread-count, .comment-replybox-single .thread-toggle, .comment-replybox-single .thread-count, .comment-replybox-thread .thread-toggle, .comment-replybox-thread .thread-count')))) {
          issues.push('thread-scaffold:' + commentId(comment));
        }
      }
      moderationBadges = toArray(comment.querySelectorAll('.cmt2-state')).filter(isVisibleNode);
      if (moderation.key !== 'active') {
        if (moderationBadges.length !== 1) issues.push('moderation-owner:' + commentId(comment));
        else if (cleanText(moderationBadges[0].textContent) !== moderation.label) issues.push('moderation-copy:' + commentId(comment));
      }
    }
    return issues;
  }
  function runProof(root){
    var issues = collectProofIssues(root);
    if (!root || !root.setAttribute) return issues;
    root.setAttribute('data-gg-comment-proof', issues.length ? 'fail' : 'ok');
    root.setAttribute('data-gg-comment-proof-count', String(issues.length));
    root.__ggCommentProofIssues = issues;
    if (issues.length && w.console && typeof w.console.warn === 'function') {
      try { w.console.warn('[GG.comments] proof failed:', issues.join(', ')); } catch (_) {}
    }
    return issues;
  }
  function ensureMenuButton(comment){
    var actions = ensureActions(comment);
    var permalink = commentPermalink(comment);
    var deleteInvoker = commentDeleteInvoker(comment);
    var itemControl = commentItemControl(comment);
    var wrap = null;
    var btn = null;
    var pop = null;
    var copyBtn = null;
    var deleteBtn = null;
    if (!actions || isDeletedComment(comment)) {
      if (itemControl) setSuppressed(itemControl);
      return;
    }
    if (itemControl) {
      itemControl.hidden = true;
      itemControl.setAttribute('aria-hidden', 'true');
      itemControl.setAttribute('data-gg-state', 'hidden');
    }
    if (!permalink && !deleteInvoker) {
      wrap = actions.querySelector('.cmt2-ctx');
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
      return;
    }
    wrap = actions.querySelector('.cmt2-ctx');
    if (!wrap) {
      wrap = d.createElement('div');
      wrap.className = 'cmt2-ctx';
      btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'cmt2-ctx-btn';
      btn.setAttribute('data-gg-comment-action', 'more');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-label', copyLabel('comments.action.more', 'More actions'));
      btn.appendChild((function(){
        var icon = d.createElement('span');
        icon.className = 'ms';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = 'more_horiz';
        return icon;
      })());
      pop = d.createElement('div');
      pop.className = 'cmt2-ctx-pop';
      pop.setAttribute('role', 'menu');
      wrap.appendChild(btn);
      wrap.appendChild(pop);
      actions.appendChild(wrap);
    } else {
      btn = wrap.querySelector('.cmt2-ctx-btn');
      pop = wrap.querySelector('.cmt2-ctx-pop');
    }
    if (!btn || !pop) return;
    copyBtn = pop.querySelector('[data-gg-comment-action="copy-link"]');
    if (permalink && !copyBtn) {
      copyBtn = d.createElement('button');
      copyBtn.type = 'button';
      copyBtn.setAttribute('data-gg-comment-action', 'copy-link');
      copyBtn.appendChild((function(){
        var icon = d.createElement('span');
        icon.className = 'ms';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = 'link';
        return icon;
      })());
      copyBtn.appendChild(d.createTextNode(copyLabel('comments.action.copyLink', 'Copy link')));
      pop.appendChild(copyBtn);
    } else if (!permalink && copyBtn && copyBtn.parentNode) {
      copyBtn.parentNode.removeChild(copyBtn);
    }
    deleteBtn = pop.querySelector('[data-gg-comment-action="delete"]');
    if (deleteInvoker && !deleteBtn) {
      deleteBtn = d.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.setAttribute('data-gg-comment-action', 'delete');
      deleteBtn.className = 'cmt2-ctx-pop__danger';
      deleteBtn.appendChild((function(){
        var icon = d.createElement('span');
        icon.className = 'ms';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = 'delete';
        return icon;
      })());
      deleteBtn.appendChild(d.createTextNode(copyLabel('comments.action.delete', 'Delete comment')));
      pop.appendChild(deleteBtn);
    } else if (!deleteInvoker && deleteBtn && deleteBtn.parentNode) {
      deleteBtn.parentNode.removeChild(deleteBtn);
    }
    if (deleteBtn && deleteInvoker) {
      deleteBtn.setAttribute('data-gg-delete-kind', deleteInvoker.kind || 'link');
    }
  }
  function closeMenus(root, keep){
    var nodes = toArray((root && root.querySelectorAll) ? root.querySelectorAll('.cmt2-ctx') : []);
    nodes.forEach(function(node){
      var btn = node.querySelector('.cmt2-ctx-btn');
      var pop = node.querySelector('.cmt2-ctx-pop');
      if (!btn || !pop || node === keep) return;
      btn.setAttribute('aria-expanded', 'false');
      pop.setAttribute('data-gg-state', 'closed');
    });
  }
  function toggleMenu(wrap){
    var btn = wrap && wrap.querySelector ? wrap.querySelector('.cmt2-ctx-btn') : null;
    var pop = wrap && wrap.querySelector ? wrap.querySelector('.cmt2-ctx-pop') : null;
    var open = false;
    if (!btn || !pop) return false;
    open = pop.getAttribute('data-gg-state') === 'open';
    closeMenus(commentsRoot(hostRoot()), wrap);
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    pop.setAttribute('data-gg-state', open ? 'closed' : 'open');
    if (!open) positionMenu(wrap);
    return !open;
  }
  function menuViewportBounds(wrap){
    var root = null;
    var panel = null;
    var head = null;
    var footer = null;
    var panelRect = null;
    var top = 0;
    var bottom = 0;
    if (!wrap || !wrap.closest) return null;
    root = wrap.closest('#comments') || commentsRoot(hostRoot());
    panel = root && root.closest ? root.closest('#ggPanelComments, .gg-comments-panel') : null;
    if (!root || !root.getBoundingClientRect) return null;
    panelRect = (panel && panel.getBoundingClientRect) ? panel.getBoundingClientRect() : root.getBoundingClientRect();
    top = panelRect.top + 6;
    bottom = panelRect.bottom - 6;
    head = root.querySelector ? root.querySelector('.gg-comments__head') : null;
    footer = root.querySelector ? root.querySelector('.gg-comments__footer') : null;
    if (head && head.getBoundingClientRect) top = Math.max(top, head.getBoundingClientRect().bottom + 4);
    if (footer && footer.getBoundingClientRect) bottom = Math.min(bottom, footer.getBoundingClientRect().top - 4);
    return { top: top, bottom: bottom };
  }
  function positionMenu(wrap){
    var btn = wrap && wrap.querySelector ? wrap.querySelector('.cmt2-ctx-btn') : null;
    var pop = wrap && wrap.querySelector ? wrap.querySelector('.cmt2-ctx-pop') : null;
    var bounds = null;
    var wrapRect = null;
    var popRect = null;
    var availableAbove = 0;
    var availableBelow = 0;
    var placement = 'up';
    if (!btn || !pop || pop.getAttribute('data-gg-state') !== 'open') return;
    pop.setAttribute('data-gg-placement', 'up');
    bounds = menuViewportBounds(wrap);
    if (!bounds || !wrap.getBoundingClientRect || !pop.getBoundingClientRect) return;
    wrapRect = wrap.getBoundingClientRect();
    popRect = pop.getBoundingClientRect();
    availableAbove = wrapRect.top - bounds.top;
    availableBelow = bounds.bottom - wrapRect.bottom;
    if (availableAbove < (popRect.height + 6) && availableBelow > availableAbove) {
      placement = 'down';
    }
    pop.setAttribute('data-gg-placement', placement);
  }
  function replyState(root){
    if (!root) return {};
    root.__ggReplyState = root.__ggReplyState || {
      replyMode: 'default',
      replyTargetId: '',
      replyTargetAuthor: '',
      replyPermalink: '',
      comment: null,
      nativeReplyLink: null,
      banner: null,
      knownCommentIds: null
    };
    return root.__ggReplyState;
  }
  function snapshotCommentIds(root){
    var map = Object.create(null);
    var comments = toArray(root && root.querySelectorAll ? root.querySelectorAll('#cmt2-holder li.comment, .comment-thread li.comment') : []);
    var i = 0;
    var id = '';
    for (i = 0; i < comments.length; i++) {
      id = commentId(comments[i]);
      if (id) map[id] = 1;
    }
    return map;
  }
  function syncPendingReplyContext(root, comments){
    var state = replyState(root);
    var list = Array.isArray(comments) ? comments : [];
    var known = null;
    var i = 0;
    var id = '';
    var comment = null;
    var ctx = null;
    var attached = 0;
    if (!root || !state || state.replyMode !== 'reply' || !state.replyTargetId || !list.length) return false;
    known = state.knownCommentIds;
    if (!known) {
      state.knownCommentIds = snapshotCommentIds(root);
      return false;
    }
    for (i = 0; i < list.length; i++) {
      comment = list[i];
      id = commentId(comment);
      if (!id || known[id]) continue;
      known[id] = 1;
      if (attached > 0 || isDeletedComment(comment)) continue;
      ctx = resolveReplyContext(comment, root);
      if (ctx && ctx.id) continue;
      comment.setAttribute('data-gg-parent-id', state.replyTargetId);
      if (state.replyTargetAuthor) comment.setAttribute('data-gg-parent-author', state.replyTargetAuthor);
      rethreadCommentIfNeeded(comment, root);
      ensureReplyContext(comment, root);
      attached++;
    }
    return attached > 0;
  }
  function buildReplyBanner(root){
    var state = replyState(root);
    var banner = state.banner;
    var body = null;
    var title = null;
    var cancel = null;
    if (banner) return banner;
    banner = d.createElement('div');
    banner.className = 'cmt2-replying';
    banner.setAttribute('data-gg-tone', 'inline');
    body = d.createElement('div');
    body.className = 'cmt2-replying__body';
    title = d.createElement('strong');
    title.className = 'cmt2-replying__title';
    body.appendChild(title);
    cancel = d.createElement('button');
    cancel.type = 'button';
    cancel.className = 'cmt2-replying__cancel';
    cancel.setAttribute('data-gg-comment-action', 'cancel-reply');
    cancel.setAttribute('aria-label', 'Cancel reply');
    cancel.appendChild((function(){
      var icon = d.createElement('span');
      icon.className = 'ms';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'close';
      return icon;
    })());
    banner.appendChild(body);
    banner.appendChild(cancel);
    state.banner = banner;
    return banner;
  }
  function replySlot(root){
    return root.querySelector('#gg-addslot') ||
           root.querySelector('.gg-comments__addslot') ||
           root.querySelector('.gg-comments__footer');
  }
  function mountReplyBanner(root){
    var state = replyState(root);
    var banner = buildReplyBanner(root);
    var slot = replySlot(root);
    var title = banner.querySelector('.cmt2-replying__title');
    if (!slot || !footerAllowsComposer(root) || state.replyMode !== 'reply' || !state.replyTargetId) return;
    if (title) title.textContent = copyLabel('comments.replyingTo', 'Replying to') + ' ' + (state.replyTargetAuthor ? '@' + state.replyTargetAuthor : copyLabel('comments.parentComment', 'comment'));
    if (banner.parentNode !== slot) slot.insertBefore(banner, slot.firstChild || null);
    syncFooterState(root);
  }
  function clearReplyState(root){
    var state = replyState(root);
    if (state.comment && state.comment.removeAttribute) state.comment.removeAttribute('data-gg-replying');
    if (state.banner && state.banner.parentNode) state.banner.parentNode.removeChild(state.banner);
    root.classList.remove('gg-comments--replying');
    if (root && root.setAttribute) root.setAttribute('data-gg-reply-mode', 'default');
    state.replyMode = 'default';
    state.replyTargetId = '';
    state.replyTargetAuthor = '';
    state.replyPermalink = '';
    state.comment = null;
    state.nativeReplyLink = null;
    state.knownCommentIds = null;
    syncFooterState(root);
  }
  function scheduleCommentSync(root, opts){
    var o = opts || {};
    var tries = 0;
    var max = isFinite(o.maxAttempts) && o.maxAttempts > 0 ? o.maxAttempts : 10;
    var delay = isFinite(o.delay) && o.delay > 0 ? o.delay : 120;
    var initialDelay = isFinite(o.initialDelay) && o.initialDelay >= 0 ? o.initialDelay : 60;
    if (!root) return false;
    clearTimeout(root.__ggCommentsSyncTimer);
    function ready(){
      if (typeof o.until !== 'function') return true;
      try { return !!o.until(); } catch (_) { return false; }
    }
    function tick(){
      tries++;
      enhance(root);
      if (o.focus) focusComposer(root, o.comment || null);
      if (!ready() && tries < max) {
        root.__ggCommentsSyncTimer = w.setTimeout(tick, delay);
        return;
      }
      root.__ggCommentsSyncTimer = 0;
    }
    root.__ggCommentsSyncTimer = w.setTimeout(tick, initialDelay);
    return true;
  }
  function focusComposer(root, comment){
    var tries = 0;
    var max = 14;
    if (!root) return;
    var timer = root && root.__ggComposerFocusTimer;
    if (timer) clearTimeout(timer);
    resetFocusDebug(root);
    function attempt(){
      var info = composerFocusInfo(root, comment);
      var debug = focusDebug(root);
      var target = info.field || info.shell;
      var active = null;
      var kind = 'none';
      tries++;
      debug.nativeReady = !!info.field || debug.nativeReady;
      if (!info.field && info.shell) debug.fallback = true;
      scrollComposerIntoView(root, target);
      if (info.field) {
        focusNoScroll(info.field);
      } else if (info.shell) {
        focusNoScroll(info.shell);
      }
      active = d.activeElement;
      kind = focusTargetKind(root, active);
      if (isComposerFocusTarget(root, active)) {
        if (kind === 'native' || !info.field || tries >= max) {
          if (root && root.setAttribute) {
            root.setAttribute('data-gg-composer-focus', 'ok');
            root.setAttribute('data-gg-composer-focus-target', kind);
          }
          syncFocusDebug(root);
          if (kind === 'fallback' && !info.field && tries < max) {
            root.__ggComposerFocusTimer = w.setTimeout(attempt, 120);
          }
          return;
        }
        if (root && root.setAttribute) {
          root.setAttribute('data-gg-composer-focus', 'pending');
          root.setAttribute('data-gg-composer-focus-target', kind);
        }
        syncFocusDebug(root);
        root.__ggComposerFocusTimer = w.setTimeout(attempt, 80);
        return;
      }
      if (root && root.setAttribute) {
        root.setAttribute('data-gg-composer-focus', tries < max ? 'pending' : 'fallback');
        root.setAttribute('data-gg-composer-focus-target', !info.field && info.shell ? 'fallback' : 'pending');
      }
      syncFocusDebug(root);
      if (tries < max) {
        root.__ggComposerFocusTimer = w.setTimeout(attempt, info.field ? 80 : 120);
        return;
      }
      if (info.shell) {
        focusNoScroll(info.shell);
        if (root && root.setAttribute) {
          root.setAttribute('data-gg-composer-focus', 'ok');
          root.setAttribute('data-gg-composer-focus-target', 'fallback');
        }
        debug.fallback = true;
      } else if (root && root.setAttribute) {
        root.setAttribute('data-gg-composer-focus', 'failed');
        root.setAttribute('data-gg-composer-focus-target', 'missing');
      }
      syncFocusDebug(root);
    }
    root.__ggComposerFocusTimer = w.setTimeout(attempt, 40);
  }
  function setReplyState(root, comment, link){
    var state = replyState(root);
    if (!root || !comment) return;
    if (state.comment && state.comment !== comment && state.comment.removeAttribute) {
      state.comment.removeAttribute('data-gg-replying');
    }
    state.replyMode = 'reply';
    state.replyTargetId = commentId(comment);
    state.replyTargetAuthor = commentAuthor(comment);
    state.replyPermalink = commentPermalink(comment);
    state.comment = comment;
    state.nativeReplyLink = link || null;
    state.knownCommentIds = snapshotCommentIds(root);
    comment.setAttribute('data-gg-replying', '1');
    root.classList.add('gg-comments--replying');
    if (root && root.setAttribute) root.setAttribute('data-gg-reply-mode', 'reply');
    syncFooterState(root);
    mountReplyBanner(root);
  }
  function cancelReply(root){
    var state = replyState(root);
    var box = state.comment ? commentReplyBox(state.comment) : null;
    var cancel = null;
    if (box && box.querySelector) {
      cancel = box.querySelector('[data-action*="cancel"], [aria-label*="Cancel"], a[href*="cancel"], button[name*="cancel"]');
    }
    if (cancel && typeof cancel.click === 'function') {
      try { cancel.click(); } catch (_) {}
    } else if (state.nativeReplyLink && typeof state.nativeReplyLink.click === 'function') {
      try { state.nativeReplyLink.click(); } catch (_) {}
    }
    clearReplyState(root);
    scheduleCommentSync(root, {
      initialDelay: 80,
      maxAttempts: 8,
      until: function(){ return !!composerField(syncComposerOwner(root)); }
    });
  }
  function openComposerForRoot(root, opts){
    var o = opts || {};
    var nativeLink = null;
    if (!root) return false;
    if (!footerAllowsComposer(root)) {
      if (replyState(root).replyMode === 'reply' && !o.preserveReply) clearReplyState(root);
      return false;
    }
    if (replyState(root).replyMode === 'reply' && !o.preserveReply) clearReplyState(root);
    setFooterOpen(root, true, { manual: true, focus: false });
    nativeLink = nativeAddCommentLink(root);
    if (nativeLink && o.useNative !== false && typeof nativeLink.click === 'function') {
      try { nativeLink.click(); } catch (_) {}
    }
    scheduleCommentSync(root, {
      comment: null,
      focus: o.focus !== false,
      initialDelay: 80,
      maxAttempts: 10,
      until: function(){ return !!composerField(syncComposerOwner(root)); }
    });
    return true;
  }
  function enterReplyMode(root, comment, nativeLink){
    if (!footerAllowsComposer(root)) return false;
    if (!root || !comment) return false;
    setReplyState(root, comment, nativeLink || null);
    setFooterOpen(root, true, { manual: true, focus: false });
    if (nativeLink && typeof nativeLink.click === 'function') {
      try { nativeLink.click(); } catch (_) {}
    }
    scheduleCommentSync(root, {
      comment: comment,
      focus: true,
      initialDelay: 80,
      maxAttempts: 12,
      until: function(){ return !!composerField(syncComposerOwner(root)); }
    });
    return true;
  }
  function toggleReplies(root, comment){
    var replies = commentReplies(comment);
    var actions = ensureActions(comment);
    var btn = actions ? actions.querySelector('.cmt2-thread-toggle') : null;
    var nativeToggle = null;
    var renderedCount = replyChildrenCount(replies);
    var count = renderedCount;
    var open = true;
    if (!btn) return false;
    nativeToggle = (btn.__ggNativeThreadToggle && btn.__ggNativeThreadToggle.isConnected)
      ? btn.__ggNativeThreadToggle
      : commentNativeThreadToggle(comment);
    if (count <= 0) {
      count = commentNativeThreadCount(comment) || safeNumber(btn.getAttribute('data-gg-thread-count'));
    }
    if (!count) return false;
    if ((!replies || renderedCount <= 0) && nativeToggle && typeof nativeToggle.click === 'function') {
      try { nativeToggle.click(); } catch (_) {}
      if (root) {
        scheduleCommentSync(root, {
          initialDelay: 90,
          maxAttempts: 8,
          until: function(){
            var latestReplies = commentReplies(comment);
            return replyChildrenCount(latestReplies) > 0;
          }
        });
      }
      return true;
    }
    if (!replies) return false;
    open = !replies.hidden && replies.getAttribute('data-gg-state') !== 'collapsed';
    replies.hidden = open;
    replies.setAttribute('data-gg-state', open ? 'collapsed' : 'expanded');
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    btn.setAttribute('aria-label', open
      ? copyLabel('comments.replies.show', 'View replies ({count})', { count: count })
      : copyLabel('comments.replies.hide', 'Hide replies ({count})', { count: count }));
    btn.setAttribute('data-gg-comment-icon', open ? 'unfold_more' : 'unfold_less');
    btn.textContent = open
      ? copyLabel('comments.replies.show', 'View replies ({count})', { count: count })
      : copyLabel('comments.replies.hide', 'Hide replies ({count})', { count: count });
    return !open;
  }
  function triggerDelete(comment){
    var invoker = commentDeleteInvoker(comment);
    var link = invoker && (invoker.kind === 'link' || invoker.kind === 'feed-edit') ? invoker.node : null;
    var nativeMore = invoker && invoker.kind === 'native-more' ? invoker.node : null;
    var menuRoots = null;
    var menuItems = null;
    var deleteItem = null;
    var href = '';
    if (!invoker) return false;
    if (link && invoker.kind === 'feed-edit') {
      href = cleanText(link.getAttribute('href') || link.href || '');
      if (!href) return false;
      w.fetch(href, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
        headers: { 'GData-Version': '2' }
      }).then(function(res){
        if (res && res.ok) {
          notify(copyLabel('comments.status.deleted', 'Comment deleted'));
          return;
        }
        notify(copyLabel('comments.status.failed', 'Comment action failed'));
      }).catch(function(){
        notify(copyLabel('comments.status.failed', 'Comment action failed'));
      });
      return true;
    }
    if (link) {
      try {
        link.click();
        return true;
      } catch (_) {}
      href = link.getAttribute('href') || link.href || '';
      if (href) {
        w.location.href = href;
        return true;
      }
      return false;
    }
    if (!nativeMore) return false;
    try {
      nativeMore.click();
    } catch (_) {}
    w.setTimeout(function(){
      menuRoots = toArray(d.querySelectorAll('.goog-menu, [role="menu"]')).filter(isVisibleNode);
      if (!menuRoots.length) menuRoots = [d];
      menuItems = [];
      menuRoots.forEach(function(root){
        toArray(root.querySelectorAll('.goog-menuitem, [role="menuitem"], a, button')).forEach(function(node){
          if (menuItems.indexOf(node) === -1) menuItems.push(node);
        });
      });
      deleteItem = menuItems.find(function(node){
        var aria = cleanText(node && node.getAttribute ? node.getAttribute('aria-label') : '');
        var txt = cleanText(node && node.textContent);
        return /delete|hapus/i.test(aria) || /delete|hapus/i.test(txt);
      }) || null;
      if (!deleteItem) return;
      try {
        deleteItem.click();
      } catch (_) {
        var target = deleteItem && deleteItem.querySelector ? deleteItem.querySelector('a,button') : null;
        if (target && typeof target.click === 'function') {
          try { target.click(); } catch (__) {}
        }
      }
    }, 40);
    if (nativeMore) {
      return true;
    }
    return false;
  }
  function enhanceComment(comment, root){
    var actions = null;
    var replyLink = null;
    var state = null;
    var depth = commentDepth(comment);
    if (!comment || !comment.querySelector) return;
    comment.setAttribute('data-gg-comment-id', commentId(comment));
    comment.setAttribute('data-gg-depth', String(depth));
    if (depth > 0) comment.classList.add('is-reply');
    else comment.classList.remove('is-reply');
    ensureModerationState(comment);
    ensureReplyContext(comment, root);
    actions = ensureActions(comment);
    replyLink = normalizeReplyLink(comment, root) || commentReplyLink(comment);
    state = commentStateInfo(comment);
    if (replyLink) {
      replyLink.setAttribute('data-gg-comment-role', 'reply');
      if (!cleanText(replyLink.textContent)) replyLink.textContent = 'Reply';
    }
    if (actions && !state.interactive) actions.hidden = true;
    else if (actions) actions.hidden = false;
    ensureMenuButton(comment);
    ensureToggleButton(comment);
    suppressCommentScaffolding(comment);
    hydrateCommentTimeLink(commentTimestampLink(comment));
  }
  function enhance(host){
    var root = commentsRoot(host) || host;
    var comments = null;
    if (!root || !root.querySelectorAll) return false;
    root.classList.add('gg-comments--enhanced');
    root.setAttribute('data-gg-comment-owner', 'enhanced');
    root.setAttribute('data-gg-visible-owner', 'enhanced-footer');
    root.setAttribute('data-gg-comment-contract', 'single-visible-owner');
    bindFooterCta(root);
    bindFooterMetrics(root);
    suppressRootScaffolding(root);
    comments = toArray(root.querySelectorAll('#cmt2-holder li.comment, .comment-thread li.comment'));
    syncPendingReplyContext(root, comments);
    if (rethreadDanglingComments(root, comments)) {
      comments = toArray(root.querySelectorAll('#cmt2-holder li.comment, .comment-thread li.comment'));
    }
    comments.forEach(function(comment){
      enhanceComment(comment, root);
    });
    ensureHeadControls(root);
    hydrateCommentTimes(root);
    ensureCommentTimeRefresh(root);
    bindCommentTimeLocale(root);
    if (replyState(root).replyMode === 'reply' && replyState(root).replyTargetId) mountReplyBanner(root);
    syncComposerKind(root);
    syncFooterState(root);
    runProof(root);
    return !!comments.length;
  }
  function nodeContainsCommentRow(node){
    if (!node || node.nodeType !== 1) return false;
    if (node.matches && node.matches('li.comment')) return true;
    return !!(node.querySelector && node.querySelector('li.comment'));
  }
  function mutationTouchesCommentRows(mutations){
    var i = 0;
    var j = 0;
    var mutation = null;
    var node = null;
    for (i = 0; i < mutations.length; i++) {
      mutation = mutations[i];
      if (!mutation || mutation.type !== 'childList') continue;
      for (j = 0; j < mutation.addedNodes.length; j++) {
        node = mutation.addedNodes[j];
        if (nodeContainsCommentRow(node)) return true;
      }
      for (j = 0; j < mutation.removedNodes.length; j++) {
        node = mutation.removedNodes[j];
        if (nodeContainsCommentRow(node)) return true;
      }
    }
    return false;
  }
  function scheduleHostEnhance(host){
    if (!host || host.__ggCommentsMutationTimer) return false;
    host.__ggCommentsMutationTimer = w.setTimeout(function(){
      var root = commentsRoot(host) || host;
      host.__ggCommentsMutationTimer = 0;
      if (!root || !root.isConnected) return;
      enhance(root);
    }, 120);
    return true;
  }
  function bindHostObserver(host){
    if (!host || host.__ggCommentsMutationObserver || !w.MutationObserver) return false;
    host.__ggCommentsMutationObserver = new MutationObserver(function(mutations){
      if (!mutationTouchesCommentRows(mutations)) return;
      scheduleHostEnhance(host);
    });
    host.__ggCommentsMutationObserver.observe(host, { childList: true, subtree: true });
    return true;
  }
  function bindHost(host){
    if (!host || host.__ggCommentsBound) return false;
    host.__ggCommentsBound = true;
    host.addEventListener('click', function(e){
      var target = e && e.target && e.target.closest ? e.target.closest('[data-gg-comment-action], [data-gg-comment-jump], [data-gg-comment-toggle], a.comment-reply[data-gg-footer-cta]') : null;
      var root = commentsRoot(host) || host;
      var comment = null;
      var wrap = null;
      var id = '';
      var nativeLink = null;
      if (!root) return;
      if (!target || !target.closest || !target.closest('.cmt2-ctx')) closeMenus(root, null);
      if (!target) return;
      comment = closestComment(target);
      if (target.matches && target.matches('a.comment-reply[data-gg-footer-cta]')) {
        e.preventDefault();
        if (root.getAttribute && root.getAttribute('data-gg-footer-open') === '1' && replyState(root).replyMode !== 'reply') {
          setFooterOpen(root, false, { manual: false });
          return;
        }
        openComposerForRoot(root, { focus: true });
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="panel-width"]')) {
        e.preventDefault();
        cyclePanelWidth(root);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="sort-order"]')) {
        e.preventDefault();
        cycleSortOrder(root);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="reply"]')) {
        e.preventDefault();
        nativeLink = target.__ggNativeReplyLink || pickPrimaryReplyLink(comment);
        if (comment) enterReplyMode(root, comment, nativeLink);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="more"]')) {
        e.preventDefault();
        if (comment) ensureMenuButton(comment);
        wrap = target.closest('.cmt2-ctx');
        if (wrap) toggleMenu(wrap);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="copy-link"]')) {
        e.preventDefault();
        if (comment) copyPermalink(commentPermalink(comment));
        closeMenus(root, null);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="delete"]')) {
        e.preventDefault();
        if (comment) triggerDelete(comment);
        closeMenus(root, null);
        scheduleCommentSync(root, { initialDelay: 140, maxAttempts: 8 });
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-action="cancel-reply"]')) {
        e.preventDefault();
        cancelReply(root);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-jump]')) {
        e.preventDefault();
        id = target.getAttribute('data-gg-comment-jump') || '';
        jumpToComment(root, id);
        return;
      }
      if (target.matches && target.matches('[data-gg-comment-toggle]')) {
        e.preventDefault();
        if (comment) toggleReplies(root, comment);
        return;
      }
    }, false);
    host.addEventListener('keydown', function(e){
      var root = commentsRoot(host) || host;
      if (!e || e.key !== 'Escape' || !root) return;
      closeMenus(root, null);
      if (replyState(root).replyMode === 'reply') {
        cancelReply(root);
        return;
      }
      if (root.getAttribute && root.getAttribute('data-gg-footer-open') === '1') {
        setFooterOpen(root, false, { manual: false });
      }
    }, false);
    bindHostObserver(host);
    return true;
  }
  function init(root){
    var hosts = [];
    var host = null;
    var i = 0;
    function hydrateAndEnhance(target){
      ensureFallbackHydration(target).then(function(nextRoot){
        var active = commentsRoot(nextRoot) || nextRoot;
        if (!active) return;
        bindHost(active);
        enhance(active);
      });
    }
    if (root && root.nodeType === 1) {
      host = commentsRoot(root);
      if (host) hosts.push(host);
    }
    if (!hosts.length) {
      host = hostRoot();
      if (host) hosts.push(host);
    }
    for (i = 0; i < hosts.length; i++) {
      host = hosts[i];
      if (!host) continue;
      if (fallbackHydrationNeeded(host)) {
        hydrateAndEnhance(host);
        continue;
      }
      bindHost(host);
      enhance(host);
    }
    return !!hosts.length;
  }
  function ensureLoaded(opts){
    var o = opts || {};
    var host = hostRoot();
    function finish(target){
      var active = commentsRoot(target) || target || host;
      if (!active) return false;
      init(active);
      if (GG.core && GG.core.commentsGate && typeof GG.core.commentsGate.init === 'function') {
        GG.core.commentsGate.init();
      }
      markLoaded(active);
      enhance(active);
      if (shouldScroll) {
        scrollToComments(active);
      }
      return true;
    }
    var fromPrimary = !!o.fromPrimaryAction;
    var shouldScroll = fromPrimary && o.scroll !== false;
    if (!host) return false;
    ensureFallbackHydration(host).then(finish);
    finish(host);
    return true;
  }
  function reset(root){
    var hosts = [];
    var host = null;
    var i = 0;
    host = commentsRoot(root) || hostRoot();
    if (host) hosts = [host];
    if (!hosts.length) return false;
    for (i = 0; i < hosts.length; i++) {
      host = hosts[i];
      if (!host || !host.setAttribute) continue;
      host.removeAttribute('data-gg-comments-loaded');
      host.__gC = false;
    }
    if (GG.core && GG.core.commentsGate && typeof GG.core.commentsGate.init === 'function') {
      try { GG.core.commentsGate.init(); } catch (_) {}
    }
    init(hosts[0]);
    return true;
  }
  function openComposer(opts){
    var o = opts || {};
    var host = hostRoot();
    function openFor(target){
      var active = commentsRoot(target) || target || host;
      if (!active) return false;
      finishLoad(active);
      return openComposerForRoot(active, o);
    }
    function finishLoad(target){
      init(target);
      if (GG.core && GG.core.commentsGate && typeof GG.core.commentsGate.init === 'function') {
        GG.core.commentsGate.init();
      }
      markLoaded(target);
      enhance(target);
    }
    if (!host) return false;
    ensureFallbackHydration(host).then(openFor);
    return openFor(host);
  }
  return { ensureLoaded: ensureLoaded, reset: reset, init: init, enhance: enhance, openComposer: openComposer, runProof: runProof };
})();

function hookCommentsGate(){
  if (!GG.core || !GG.core.commentsGate) return false;
  if (GG.app && typeof GG.app.rehydrate === 'function') {
    if (!GG.app.__ggCommentsGateWrapped) {
      var prev = GG.app.rehydrate;
      GG.app.rehydrate = function(ctx){
        try { return prev ? prev.apply(this, arguments) : undefined; }
        finally {
          try { GG.core.commentsGate.init(); } catch (_) {}
          try {
            if (GG.modules && GG.modules.Comments && typeof GG.modules.Comments.init === 'function') {
              GG.modules.Comments.init();
            }
          } catch (_) {}
        }
      };
      GG.app.__ggCommentsGateWrapped = true;
    }
    return true;
  }
  return false;
}

function boot(){
  if (GG.core && GG.core.commentsGate) GG.core.commentsGate.init();
  if (GG.modules && GG.modules.Comments && typeof GG.modules.Comments.init === 'function') {
    try { GG.modules.Comments.init(); } catch (_) {}
  }
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
  'use strict';
  var HOME_ANCHOR = '#gg-home-blog-anchor'; // target "mentok" utama
  var HOME_FALLBACK = '#gg-landing-hero';   // fallback kalau anchor utama gak ada
  var HOME_CONTACT = '#contact';
  var HOME_CONTACT_LEGACY = '#gg-landing-hero-5';
  var HOME_LANDING_PATH = '/landing';
  var HOME_BLOG_PATH = '/';
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
    var base = homeRoot().replace(/\/$/,'');
    return base || HOME_BLOG_PATH;
  }

  function homeLandingPath(){
    if (GG.core && GG.core.landingPath) return GG.core.landingPath(homeRoot(), location.hostname);
    var base = homeRoot().replace(/\/$/,'');
    if (!base) return HOME_LANDING_PATH;
    return base + HOME_LANDING_PATH;
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
    var listingPath = '/';
    var landingPath = HOME_LANDING_PATH;
    try {
      listingPath = new URL(homeBlogPath(), location.origin).pathname.replace(/\/+$/,'') || '/';
    } catch (_) {
      listingPath = '/';
    }
    try {
      landingPath = new URL(homeLandingPath(), location.origin).pathname.replace(/\/+$/,'') || HOME_LANDING_PATH;
    } catch (_) {
      landingPath = HOME_LANDING_PATH;
    }
    var isBlogHome = (GG.core && GG.core.isBlogHomePath)
      ? GG.core.isBlogHomePath(path, u.search || '', u.hostname || location.hostname)
      : ((path === '/blog') || (path === listingPath && view !== 'landing'));
    var listingKey = listingPath + u.search;
    var landingKey = landingPath + u.search;

    if(path === '/blog') return listingKey;
    if(path === listingPath && view === 'landing') return landingKey;
    if(path === landingPath && view === 'blog') return listingKey;
    if(path === listingPath && u.hash === HOME_ANCHOR) return listingKey;
    if(path === listingPath && u.hash === HOME_CONTACT_LEGACY) return landingPath + u.search + HOME_CONTACT;
    if(path === listingPath && (u.hash === HOME_FALLBACK || u.hash === HOME_CONTACT)) return landingPath + u.search + u.hash;
    if(path === landingPath && u.hash === HOME_ANCHOR) return listingKey;
    if(isBlogHome) return listingKey;
    if(path === landingPath){
      if(u.hash === HOME_CONTACT_LEGACY) u.hash = HOME_CONTACT;
      if(u.hash !== HOME_FALLBACK && u.hash !== HOME_CONTACT) u.hash = '';
      return landingPath + u.search + u.hash;
    }
    if(u.hash === HOME_CONTACT_LEGACY) u.hash = HOME_CONTACT;
    if(u.hash !== HOME_ANCHOR && u.hash !== HOME_FALLBACK && u.hash !== HOME_CONTACT) u.hash = '';
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
    return (base || '/') + HOME_FALLBACK;
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
      if(h === HOME_ANCHOR){
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
    return window.matchMedia && window.matchMedia('(max-width: 1023px)').matches;
  }

  GG.modules.Panels = (function () {
    var main, layout, left, right, backdrop;
    var bound = false;
    var lastFocus = null;
    var pendingFocus = null;
    var trapCleanup = null;

    function focusNoScroll(el){
      if (!el || typeof el.focus !== 'function') return;
      var x = window.pageXOffset || 0;
      var y = window.pageYOffset || 0;
      try {
        el.focus({ preventScroll: true });
      } catch(_) {
        try {
          el.focus();
          window.scrollTo({ left: x, top: y, behavior: 'auto' });
        } catch(__) {}
      }
    }

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
        focusNoScroll(el);
      }
    }
    function focusPanel(side){
      var panel = side === 'left' ? left : right;
      if (side === 'right' && main) {
        var mode = getAttr(main, 'data-gg-right-mode') || '';
        if (mode === 'comments') {
          panel = syncCommentsMount() ||
            right;
        } else if (mode) {
          panel = qs('#gg-postinfo', right) || qs('[data-gg-panel="info"]', right) || qs('.gg-info-panel', right) || right;
        }
      }
      if (!panel) return;
      var focusable = panel.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!focusable) {
        panel.setAttribute('tabindex', '-1');
        focusable = panel;
      }
      if (focusable && typeof focusable.focus === 'function') {
        focusNoScroll(focusable);
      }
    }
    function clearFocusTrap(){
      if (!trapCleanup) return;
      try { trapCleanup(); } catch(_) {}
      trapCleanup = null;
    }
    function setFocusTrap(panel){
      clearFocusTrap();
      var trap = GG.services && GG.services.a11y && GG.services.a11y.focusTrap;
      if (!panel || typeof trap !== 'function') return;
      trapCleanup = trap(panel, { autofocus: false }) || null;
    }
    function parentChildUnderLayout(node){
      if (!layout || !node) return null;
      if (node.parentElement === layout) return node;
      var current = node;
      while (current && current.parentElement && current.parentElement !== layout) {
        current = current.parentElement;
      }
      if (current && current.parentElement === layout) return current;
      return null;
    }
    function clearNodeInert(node){
      if (!node) return;
      node.removeAttribute('inert');
      if (Object.prototype.hasOwnProperty.call(node, '__gH')) {
        var prev = node.__gH;
        if (prev === null) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', prev);
        delete node.__gH;
      }
    }
function setLayoutInert(activeAside){
  if (!layout || !layout.children) return;
  var activeChild = parentChildUnderLayout(activeAside);
  Array.prototype.forEach.call(layout.children, function(child){
    var isInteractiveAside = !!(child && child.matches && child.matches('aside.gg-blog-sidebar'));
    if (activeChild && child !== activeChild) {
          child.setAttribute('inert', '');
          if (!isInteractiveAside) {
            if (!Object.prototype.hasOwnProperty.call(child, '__gH')) {
              child.__gH = child.hasAttribute('aria-hidden') ? child.getAttribute('aria-hidden') : null;
            }
            child.setAttribute('aria-hidden', 'true');
          } else if (Object.prototype.hasOwnProperty.call(child, '__gH')) {
            delete child.__gH;
          }
          return;
        }
        clearNodeInert(child);
      });
    }
    function isPostSurface(){
      var surface = getAttr(main, 'data-gg-surface') || '';
      return surface === 'post' || surface === 'page';
    }
    function commentsPanel(){
      var panel = null;
      if (right) {
        panel = qs('#ggPanelComments', right) ||
          qs('[data-gg-panel="comments"]', right) ||
          qs('.gg-comments-panel', right);
      }
      if (panel) return panel;
      if (!main) return null;
      return qs('#ggPanelComments', main) ||
        qs('[data-gg-panel="comments"]', main) ||
        qs('.gg-comments-panel', main);
    }
    function syncCommentsMount(){
      var panel = null;
      if (!main || !right || !isPostSurface()) return commentsPanel();
      if (GG.ui && GG.ui.layout && typeof GG.ui.layout._mountCommentsToSidebar === 'function') {
        panel = GG.ui.layout._mountCommentsToSidebar(main);
      }
      return panel || commentsPanel();
    }

    function setLeft(state, opts){
      if (!main) return;
      opts = opts || {};
      var prev = getAttr(main, 'data-gg-left-panel') || 'closed';
      if (state === 'open' && prev !== 'open') {
        rememberFocus(opts.from || document.activeElement);
        pendingFocus = 'left';
        if (isPostSurface() && getRightState() === 'open') {
          setRight('closed', { skipUpdate: true });
        } else if (shouldMobile() && getRightState() === 'open') {
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
        if (isPostSurface() && getAttr(main, 'data-gg-left-panel') === 'open') {
          setLeft('closed', { skipUpdate: true });
        } else if (shouldMobile() && getAttr(main, 'data-gg-left-panel') === 'open') {
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
  var mobileOverlay = shouldMobile();
  var isDetailSurface = surface === 'post' || surface === 'page';
  var rightMode = getAttr(main, 'data-gg-right-mode') || '';
  var showInfoSheet = isDetailSurface && rightOpen && rightMode === 'info';
  var showCommentsSheet = isDetailSurface && rightOpen && rightMode === 'comments';
  var commentsHost = showCommentsSheet ? syncCommentsMount() : null;
  var show = (mobileOverlay && isDetailSurface && (leftOpen || rightOpen)) || showInfoSheet;
  var activeAside = showInfoSheet ? (qs('#gg-postinfo', right) || qs('[data-gg-panel="info"]', right) || right) : (rightOpen ? (commentsHost || right) : (leftOpen ? left : null));
  if (backdrop) {
    GG.core.state.toggle(backdrop, 'visible', show);
    if (showInfoSheet) backdrop.setAttribute('data-gg-tone', 'info');
    else backdrop.removeAttribute('data-gg-tone');
  }
      lockScroll(show);
      setLayoutInert(show ? activeAside : null);
      if (show && pendingFocus) {
        focusPanel(pendingFocus);
        pendingFocus = null;
      }
      if (show && activeAside) setFocusTrap(activeAside);
      else clearFocusTrap();
    }

    function closeAll(opts){
      opts = opts || {};
      if (main) main.removeAttribute('data-gg-right-mode');
      setLeft('closed', { skipUpdate: true });
      setRight('closed', { skipUpdate: true });
      updateBackdrop();
      if (opts.restoreFocus) restoreFocus();
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
          var link = qs(':scope > a', li) || qs('a', li);
          var linkName = link ? textOf(link) : '';
          var toggleLabel = linkName ? ('Toggle ' + linkName) : 'Toggle section';
          btn.type = 'button';
          btn.className = 'gg-tree-toggle';
          btn.setAttribute('aria-expanded', 'true');
          btn.setAttribute('data-gg-action', 'tree-toggle');
          btn.setAttribute('aria-label', toggleLabel);

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
      var isPostSurface = surface === 'post' || surface === 'page';
      var surfaceChanged = main.__ggPanelsSurface !== surface;
      if (surfaceChanged) main.__ggPanelsSurface = surface;

      layout = main && main.querySelector ? main.querySelector('.gg-blog-layout') : null;
      left = layout ? layout.querySelector('.gg-blog-sidebar--left') : qs('.gg-blog-sidebar--left', main);
      right = layout ? layout.querySelector('.gg-blog-sidebar--right') : qs('.gg-blog-sidebar--right', main);
      if (isPostSurface) syncCommentsMount();

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
    var copy = (GG.copy && typeof GG.copy.t === 'function') ? GG.copy.t : null;
    function txt(key, fallback) {
      return copy ? copy(key, fallback) : fallback;
    }
    return {
      add: defaults.add || txt('library.action.add', libraryText.bookmark_add || actionsText.bookmark_add || 'Save to library'),
      in: defaults.in || txt('library.action.in', libraryText.bookmark_inLibrary || actionsText.bookmark_inLibrary || 'In library'),
      saved: defaults.saved || txt('library.status.saved', libraryText.toast_saved || 'Saved to library'),
      removed: defaults.removed || txt('library.status.removed', libraryText.toast_removed || 'Removed from library'),
      empty: defaults.empty || txt('library.empty.title', libraryText.empty || 'Your library is empty'),
      removeBtn: defaults.removeBtn || txt('library.action.remove', libraryText.remove_button || 'Remove from library')
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
    wrap.textContent = '';
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
      var removeSvg = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
      removeSvg.setAttribute('class', 'gg-icon__svg');
      var removeUse = d.createElementNS('http://www.w3.org/2000/svg', 'use');
      removeUse.setAttribute('href', '#gg-ic-bookmark-remove-line');
      removeSvg.appendChild(removeUse);
      removeIcon.appendChild(removeSvg);
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


(function (GG, w, d) {
  'use strict';

  GG.modules = GG.modules || {};
  GG.copy = GG.copy || {};
  var state = GG.copy._state || (GG.copy._state = {
    ready: false,
    locale: '',
    manifest: {},
    dicts: { en: {}, id: {} },
    langBound: false
  });

  function normalizeLocale(raw) {
    var val = String(raw || '').toLowerCase();
    if (val.indexOf('id') === 0) return 'id';
    if (val.indexOf('en') === 0) return 'en';
    return 'en';
  }

  function parseScriptJson(id) {
    var node = d.getElementById(id);
    var raw = '';
    if (!node) return {};
    raw = (node.textContent || node.innerText || '').trim();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (_) {
      return {};
    }
  }

  function readRegistry() {
    var manifest = parseScriptJson('gg-copy-manifest');
    var en = parseScriptJson('gg-copy-en');
    var id = parseScriptJson('gg-copy-id');
    state.manifest = manifest && typeof manifest === 'object' ? manifest : {};
    state.dicts = {
      en: en && typeof en === 'object' ? en : {},
      id: id && typeof id === 'object' ? id : {}
    };
    state.ready = true;
  }

  function resolveLocaleChain(locale) {
    var out = [];
    var seen = {};
    var manifest = state.manifest || {};
    var chains = manifest.fallbackChain || {};
    function push(code) {
      var norm = normalizeLocale(code);
      if (!norm || seen[norm]) return;
      seen[norm] = true;
      out.push(norm);
    }
    push(locale);
    if (Array.isArray(chains[locale])) {
      chains[locale].forEach(push);
    }
    push(manifest.defaultLocale || '');
    push('en');
    return out;
  }

  function interpolate(template, vars) {
    var out = String(template == null ? '' : template);
    var map = vars && typeof vars === 'object' ? vars : null;
    if (!map) return out;
    Object.keys(map).forEach(function (key) {
      out = out.replace(new RegExp('\\{' + key + '\\}', 'g'), String(map[key]));
    });
    return out;
  }

  function readVars(el) {
    var raw = el && el.getAttribute ? el.getAttribute('data-gg-copy-vars') : '';
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function setLocale(next) {
    var fallback = '';
    if (!state.ready) readRegistry();
    fallback = normalizeLocale(
      (state.manifest && state.manifest.defaultLocale) ||
      (GG.config && GG.config.lang) ||
      (d.documentElement && d.documentElement.getAttribute('lang')) ||
      'en'
    );
    state.locale = normalizeLocale(next || state.locale || fallback);
    if (GG.config) GG.config.lang = state.locale;
    return state.locale;
  }

  function t(key, fallback, vars, localeOverride) {
    var chain = [];
    var value = null;
    var keyName = String(key || '').trim();
    var i = 0;
    var loc = '';
    var dict = null;
    if (!state.ready) readRegistry();
    if (!keyName) return interpolate(fallback == null ? '' : fallback, vars);
    chain = resolveLocaleChain(normalizeLocale(localeOverride || setLocale()));
    for (i = 0; i < chain.length; i++) {
      loc = chain[i];
      dict = state.dicts[loc];
      if (!dict || typeof dict !== 'object') continue;
      if (Object.prototype.hasOwnProperty.call(dict, keyName)) {
        value = dict[keyName];
        break;
      }
    }
    if (value == null || value === keyName) value = fallback;
    if (value == null || value === keyName) value = '';
    return interpolate(value, vars);
  }

  function applyText(el, vars) {
    var key = el.getAttribute('data-gg-copy');
    var fallback = el.getAttribute('data-gg-copy-fallback');
    var next = '';
    if (!key) return;
    if (fallback == null) {
      fallback = el.textContent || '';
      el.setAttribute('data-gg-copy-fallback', fallback);
    }
    next = t(key, fallback, vars);
    if (!next || next === key) next = fallback;
    if (next != null) el.textContent = String(next);
  }

  function applyAttr(el, keyAttr, targetAttr, fallbackAttr, vars) {
    var key = el.getAttribute(keyAttr);
    var fallback = el.getAttribute(fallbackAttr);
    var current = '';
    var next = '';
    if (!key) return;
    if (fallback == null) {
      current = el.getAttribute(targetAttr);
      fallback = current == null ? '' : current;
      el.setAttribute(fallbackAttr, fallback);
    }
    next = t(key, fallback, vars);
    if (!next || next === key) next = fallback;
    if (next != null) el.setAttribute(targetAttr, String(next));
  }

  function refresh(root) {
    var scope = root && root.querySelectorAll ? root : d;
    var nodes = scope.querySelectorAll('[data-gg-copy],[data-gg-copy-aria],[data-gg-copy-title],[data-gg-copy-placeholder]');
    var i = 0;
    var node = null;
    var vars = null;
    if (!state.ready) readRegistry();
    setLocale(state.locale || (GG.config && GG.config.lang));
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      vars = readVars(node);
      if (node.hasAttribute('data-gg-copy')) applyText(node, vars);
      if (node.hasAttribute('data-gg-copy-aria')) applyAttr(node, 'data-gg-copy-aria', 'aria-label', 'data-gg-copy-fallback-aria', vars);
      if (node.hasAttribute('data-gg-copy-title')) applyAttr(node, 'data-gg-copy-title', 'title', 'data-gg-copy-fallback-title', vars);
      if (node.hasAttribute('data-gg-copy-placeholder')) applyAttr(node, 'data-gg-copy-placeholder', 'placeholder', 'data-gg-copy-fallback-placeholder', vars);
    }
  }

  function init() {
    if (!state.ready) readRegistry();
    setLocale(state.locale || (GG.config && GG.config.lang));
    refresh(d);
    if (!state.langBound) {
      state.langBound = true;
      d.addEventListener('gg:langchange', function (evt) {
        var code = evt && evt.detail ? evt.detail.lang : '';
        setLocale(code || state.locale);
        refresh(d);
      });
    }
  }

  GG.copy.t = t;
  GG.copy.refresh = refresh;
  GG.copy.setLocale = setLocale;
  GG.copy.getLocale = function () { return setLocale(state.locale); };
  GG.copy.init = init;
  GG.modules.copyResolver = GG.modules.copyResolver || { init: init, refresh: refresh };

  if (GG.boot && typeof GG.boot.onReady === 'function') GG.boot.onReady(init);
  else if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window.GG = window.GG || {}, window, document);


(function (GG, w, doc) {
  'use strict';

  GG.modules = GG.modules || {};
  GG.config = GG.config || {};

  var STORAGE_KEY = 'gg.lang';

  function initLangSwitcher() {
    var root = doc.querySelector('.gg-lang-switcher');
    if (!root) return;

    var toggleBtn   = root.querySelector('[data-gg-lang-toggle]');
    var menuId      = toggleBtn ? toggleBtn.getAttribute('aria-controls') : '';
    var menu        = null;
    if (menuId) {
      try { menu = root.querySelector('#' + menuId); } catch (e) {}
      if (!menu) menu = doc.getElementById(menuId);
    }
    if (!menu) menu = root.querySelector('.gg-lang-switcher__menu');
    var options     = root.querySelectorAll('[data-gg-lang-option]');
    var currentSpan = root.querySelector('[data-gg-lang-current]');

    if (!toggleBtn || !menu || !options.length) return;
    var savedLang   = null;
    try {
      savedLang = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    } catch (e) {}

    function normalizeLangCode(raw) {
      var v = String(raw || '').toLowerCase();
      if (v.indexOf('id') === 0) return 'id';
      if (v.indexOf('en') === 0) return 'en';
      return 'en';
    }
    function getOptionCode(opt) {
      if (!opt || !opt.getAttribute) return 'en';
      return normalizeLangCode(opt.getAttribute('data-gg-lang-code'));
    }

    var htmlLang    = (doc.documentElement.getAttribute('lang') || 'en').toLowerCase();
    var initialLang = normalizeLangCode(savedLang || GG.config.lang || htmlLang);

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
        var code = getOptionCode(opt);
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
      var codeNorm = normalizeLangCode(langCode);
      var currentLabel = '';
      var packs = GG.lang || {};
      var active = packs[codeNorm] || packs.en || packs.id || {};
      var activeUi = active.ui || {};
      var fallbackUi = ((packs.en && packs.en.ui) || (packs.id && packs.id.ui) || {});
      var optionNames = {
        id: activeUi.languageBahasa || fallbackUi.languageBahasa || 'Bahasa Indonesia',
        en: activeUi.languageEnglish || fallbackUi.languageEnglish || 'English'
      };

      options.forEach(function (opt) {
        var code = getOptionCode(opt);
        var selected = code === codeNorm;
        var nameEl = opt.querySelector('.gg-lang-switcher__option-name');

        if (nameEl && optionNames[code]) {
          nameEl.textContent = optionNames[code];
        }
        opt.setAttribute('aria-selected', selected ? 'true' : 'false');

        if (selected && !currentLabel) {
          currentLabel = optionNames[code] || (nameEl ? nameEl.textContent : code);
        }
      });

      if (currentSpan && currentLabel) {
        currentSpan.textContent = currentLabel;
      }
      if (GG.copy && typeof GG.copy.setLocale === 'function') {
        GG.copy.setLocale(codeNorm);
        if (typeof GG.copy.refresh === 'function') GG.copy.refresh(doc);
      }
      if (GG.modules && GG.modules.uiCopy && typeof GG.modules.uiCopy.apply === 'function') {
        GG.modules.uiCopy.apply(doc);
      }
      try {
        doc.dispatchEvent(new CustomEvent('gg:langchange', { detail: { lang: codeNorm } }));
      } catch (e) {}
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
    var langCode = (GG.config && GG.config.lang) || 'en';
    var packs = GG.lang || {};
    var active = packs[langCode] || packs.en || packs.id || {};
    var fallback = packs.en || packs.id || {};
    return active[namespace] || fallback[namespace] || {};
  };
  GG.i18n = GG.i18n || {};
  (function(i18n){
    function loc(){ return i18n._locale || (GG.config && GG.config.lang) || (d.documentElement && d.documentElement.getAttribute('lang')) || 'id'; }
    function tz(){ var s = (GG.store && GG.store.get && GG.store.get()); return i18n._timeZone || (s && s.timeZone) || (w.Intl && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '') || 'UTC'; }
    function rtl(l){ return /^(ar|fa|he|ur|ps|dv|ku|yi)(-|$)/.test((l || '').toLowerCase()); }
    function applyDir(l){ var root = d.documentElement; if(!root) return; var dir = rtl(l) ? 'rtl' : 'ltr'; if(!root.getAttribute('dir')) root.setAttribute('dir', dir); root.dataset.ggDir = dir; }
    function pack(){ var lang = (GG.config && GG.config.lang) || loc(); var packs = GG.lang || {}; return packs[lang] || packs.en || packs.id || {}; }
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
    A._activeModalEl = A._activeModalEl || null;
    A._activeModalCleanup = A._activeModalCleanup || null;
    A._activeModalTrigger = A._activeModalTrigger || null;
    A._activeModalEsc = A._activeModalEsc || null;
    A.reducedMotion = A.reducedMotion || {};
    A.reducedMotion.get = A.reducedMotion.get || function(){ return !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches); };
    A.reducedMotion.watch = A.reducedMotion.watch || function(cb){ if(!w.matchMedia) return function(){}; var mq = w.matchMedia('(prefers-reduced-motion: reduce)'); var h = function(e){ if(cb) cb(!!e.matches); }; if(mq.addEventListener) mq.addEventListener('change', h); else if(mq.addListener) mq.addListener(h); return function(){ if(mq.removeEventListener) mq.removeEventListener('change', h); else if(mq.removeListener) mq.removeListener(h); }; };
    A.scrollBehavior = A.scrollBehavior || function(){ try { return A.reducedMotion.get() ? 'auto' : 'smooth'; } catch(e) {} return (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth'; };
    A.announce = A.announce || function(message, opts){ if(message === undefined || message === null) return; var el = A._announcer || d.querySelector('.gg-sr-announcer,[data-gg-announcer]'); if(!el){ if(!d.body) return; el = d.createElement('div'); el.className = 'gg-sr-announcer gg-visually-hidden'; el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true'); d.body.appendChild(el); } A._announcer = el; el.setAttribute('aria-live', (opts && opts.politeness) || el.getAttribute('aria-live') || 'polite'); el.textContent = ''; setTimeout(function(){ el.textContent = String(message); }, 10); };
    function setInert(el, inert){ if(!el || el.nodeType !== 1) return null; var prev = { el: el, aria: el.getAttribute('aria-hidden'), inert: el.hasAttribute('inert') }; if(inert){ el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); }else{ if(prev.aria === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', prev.aria); if(prev.inert) el.setAttribute('inert',''); else el.removeAttribute('inert'); } return prev; }
    A.inert = A.inert || function(root, keep){ var host = root || d.body || d.documentElement; if(!host) return null; var kids = Array.prototype.slice.call(host.children || []); var record = []; kids.forEach(function(el){ if(!el || el === keep) return; record.push(setInert(el, true)); }); A._inertStack.push(record); return record; };
    A.restoreInert = A.restoreInert || function(){ var record = A._inertStack.pop(); if(!record) return; record.forEach(function(item){ if(item && item.el) setInert(item.el, false); }); };
    A.focusTrap = A.focusTrap || function(container, opts){ if(!container) return function(){}; var selector=(opts&&opts.selector)||'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex=\"-1\"])'; function focusNoScroll(el){ if(!el||typeof el.focus!=='function') return; try{el.focus({preventScroll:true});}catch(_){try{el.focus();}catch(__){}} } function focusables(){ return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function(el){ return !el.hidden && !el.disabled && el.getAttribute('aria-hidden')!=='true' && el.getClientRects && el.getClientRects().length; }); } function onKey(e){ if(!e||e.key!=='Tab') return; var list=focusables(); if(!list.length){ container.setAttribute('tabindex','-1'); focusNoScroll(container); e.preventDefault(); return; } var first=list[0], last=list[list.length-1], active=d.activeElement, out=!(active&&container.contains(active)); if(e.shiftKey?(out||active===first||active===container):(out||active===last||active===container)){ e.preventDefault(); focusNoScroll(e.shiftKey?last:first); } } container.addEventListener('keydown', onKey); if(!(opts&&opts.autofocus===false)){ var list=focusables(); if(list[0]) focusNoScroll(list[0]); } return function(){ container.removeEventListener('keydown', onKey); }; };
    function safeFocus(el){ if(!el || typeof el.focus !== 'function') return; try { el.focus({preventScroll:true}); } catch(_) { try { el.focus(); } catch(__){} } }
    A.modalClose = A.modalClose || function(modalEl, opts){
      var target = modalEl || A._activeModalEl;
      var options = opts || {};
      var isActive = !!(target && A._activeModalEl === target);
      var restoreFocus = options.restoreFocus !== false;
      var trigger = isActive ? A._activeModalTrigger : null;
      if (!target || target.nodeType !== 1) return false;
      if (isActive) {
        if (A._activeModalCleanup) {
          try { A._activeModalCleanup(); } catch (_) {}
        }
        A._activeModalCleanup = null;
        A._activeModalEl = null;
        A._activeModalTrigger = null;
        A._activeModalEsc = null;
      }
      target.hidden = true;
      target.setAttribute('aria-hidden', 'true');
      if (GG.core && GG.core.state) GG.core.state.toggle(target, 'open', false);
      if (restoreFocus && trigger && trigger !== target) safeFocus(trigger);
      return true;
    };
    A.modalOpen = A.modalOpen || function(modalEl, triggerEl, opts){
      var options = opts || {};
      var trigger = triggerEl && triggerEl.nodeType === 1 ? triggerEl : d.activeElement;
      var role = '';
      if (!modalEl || modalEl.nodeType !== 1) return false;
      role = String(modalEl.getAttribute('role') || '').toLowerCase();
      if (modalEl.id === 'gg-palette-list' || role === 'listbox') return false;
      if (A._activeModalEl && A._activeModalEl !== modalEl && typeof A.modalClose === 'function') {
        A.modalClose(A._activeModalEl, { restoreFocus: false });
      }
      if (A._activeModalCleanup) {
        try { A._activeModalCleanup(); } catch (_) {}
      }
      A._activeModalCleanup = null;
      A._activeModalEl = modalEl;
      A._activeModalTrigger = trigger && trigger.nodeType === 1 ? trigger : null;
      modalEl.setAttribute('role','dialog');
      modalEl.setAttribute('aria-modal', 'true');
      if (options.label && !modalEl.getAttribute('aria-label') && !modalEl.getAttribute('aria-labelledby')) {
        modalEl.setAttribute('aria-label', String(options.label));
      }
      if (!modalEl.hasAttribute('tabindex')) modalEl.setAttribute('tabindex', '-1');
      modalEl.hidden = false;
      modalEl.setAttribute('aria-hidden', 'false');
      if (GG.core && GG.core.state) GG.core.state.toggle(modalEl, 'open', true);
      var trapCleanup = typeof A.focusTrap === 'function' ? A.focusTrap(modalEl, {autofocus:false}) : function(){};
      var onEsc = function(evt){
        if (!evt || evt.key !== 'Escape') return;
        evt.preventDefault();
        A.modalClose(modalEl);
      };
      d.addEventListener('keydown', onEsc, true);
      A._activeModalEsc = onEsc;
      A._activeModalCleanup = function(){
        try { d.removeEventListener('keydown', onEsc, true); } catch (_) {}
        try { trapCleanup(); } catch (_) {}
      };
      safeFocus(modalEl);
      return true;
    };
    A.init = A.init || function(){ if(A._init) return; A._init = true; function sync(val){ if(GG.store && GG.store.set) GG.store.set({ reducedMotion: !!val }); if(GG.ui && GG.ui.applyRootState && GG.store && GG.store.get) GG.ui.applyRootState(d.documentElement, GG.store.get()); else if(d.documentElement) GG.core.state.toggle(d.documentElement, 'reduced-motion', !!val); } var initial = A.reducedMotion.get(); sync(initial); A._rmUnsub = A.reducedMotion.watch(sync); };
    a11y.announce = a11y.announce || function(message, opts){ return A.announce(message, opts); };
    a11y.focusTrap = a11y.focusTrap || function(container, opts){ return A.focusTrap(container, opts); };
    a11y.modalOpen = a11y.modalOpen || function(modalEl, triggerEl, opts){ return A.modalOpen(modalEl, triggerEl, opts); };
    a11y.modalClose = a11y.modalClose || function(modalEl, opts){ return A.modalClose(modalEl, opts); };
    a11y.inertManager = a11y.inertManager || { push: function(root, keep){ return A.inert(root, keep); }, pop: function(){ return A.restoreInert(); }, clear: function(){ while(A._inertStack.length) A.restoreInert(); } };
    a11y.reducedMotion = a11y.reducedMotion || { get: function(){ return A.reducedMotion.get(); }, watch: function(cb){ return A.reducedMotion.watch(cb); } };
    a11y.scrollBehavior = a11y.scrollBehavior || function(){ return A.scrollBehavior(); };
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
    ui: {
      dockLanding: 'Landing',
      dockHome: 'Home',
      dockContact: 'Kontak',
      dockSearch: 'Cari',
      dockMore: 'Lainnya',
      panelInformation: 'Informasi',
      panelEditorialPreview: 'Pratinjau Editorial',
      metaWrittenBy: 'Ditulis oleh',
      metaContributors: 'Kontributor',
      metaLabel: 'Label',
      metaTags: 'Tag',
      metaDate: 'Tanggal',
      metaUpdated: 'Diperbarui',
      metaComments: 'Komentar',
      metaReadTime: 'Waktu baca',
      metaSnippet: 'Ringkasan',
      metaToc: 'Daftar Isi',
      panelReadPost: 'Baca artikel ini',
      languageBahasa: 'Bahasa Indonesia',
      languageEnglish: 'English'
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
    ui: {
      dockLanding: 'Landing',
      dockHome: 'Home',
      dockContact: 'Contact',
      dockSearch: 'Search',
      dockMore: 'More',
      panelInformation: 'Information',
      panelEditorialPreview: 'Editorial Preview',
      metaWrittenBy: 'Written by',
      metaContributors: 'Contributors',
      metaLabel: 'Label',
      metaTags: 'Tags',
      metaDate: 'Date',
      metaUpdated: 'Updated',
      metaComments: 'Comments',
      metaReadTime: 'Read time',
      metaSnippet: 'Snippet',
      metaToc: 'Table of Contents',
      panelReadPost: 'Read this post',
      languageBahasa: 'Bahasa Indonesia',
      languageEnglish: 'English'
    },
    toast: {
      default_message: 'Saved successfully.',
      error_generic: 'Something went wrong. Please try again later.'
    }
  };

})(window.GG);

(function (GG, doc) {
  'use strict';
  GG.modules = GG.modules || {};

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  function textAll(sel, value, root) {
    if (value == null) return;
    var nodes = qsa(sel, root);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = String(value);
    }
  }

  function attrAll(sel, name, value, root) {
    if (!name || value == null) return;
    var nodes = qsa(sel, root);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(name, String(value));
    }
  }

  function uiPack() {
    var lang = (GG.config && GG.config.lang) || ((doc.documentElement && doc.documentElement.getAttribute('lang')) || 'en');
    var packs = GG.lang || {};
    var active = packs[lang] || packs.en || packs.id || {};
    var fallback = packs.en || packs.id || {};
    return active.ui || fallback.ui || {};
  }

  function t(pack, key, fallback) {
    if (pack && pack[key] != null) return String(pack[key]);
    return String(fallback || '');
  }

  function apply(root) {
    var scope = root && root.querySelectorAll ? root : doc;
    var pack = uiPack();
    textAll('.gg-dock__item--home .gg-dock__label', t(pack, 'dockLanding', 'Landing'), scope);
    textAll('.gg-dock__item--blog .gg-dock__label', t(pack, 'dockHome', 'Home'), scope);
    textAll('.gg-dock__item--contact .gg-dock__label', t(pack, 'dockContact', 'Contact'), scope);
    textAll('.gg-dock__item--search .gg-dock__label', t(pack, 'dockSearch', 'Search'), scope);
    textAll('.gg-dock__item--more .gg-dock__label', t(pack, 'dockMore', 'More'), scope);
    attrAll('.gg-dock__item--home', 'aria-label', t(pack, 'dockLanding', 'Landing'), scope);
    attrAll('.gg-dock__item--blog', 'aria-label', t(pack, 'dockHome', 'Home'), scope);
    attrAll('.gg-dock__item--contact', 'aria-label', t(pack, 'dockContact', 'Contact'), scope);
    attrAll('.gg-dock__item--search', 'aria-label', t(pack, 'dockSearch', 'Search'), scope);
    attrAll('.gg-dock__item--more', 'aria-label', t(pack, 'dockMore', 'More'), scope);

    textAll('.gg-pi__title', t(pack, 'panelInformation', 'Information'), scope);
    textAll('.gg-epanel__eyebrow', t(pack, 'panelEditorialPreview', 'Editorial Preview'), scope);
    textAll('.gg-pi__sec--author .gg-pi__kicker', t(pack, 'metaWrittenBy', 'Written by'), scope);
    textAll('.gg-pi__sec--contributors .gg-pi__kicker', t(pack, 'metaContributors', 'Contributors'), scope);
    textAll('.gg-pi__sec--labels .gg-pi__kicker', t(pack, 'metaLabel', 'Label'), scope);
    textAll('.gg-pi__sec--tags .gg-pi__kicker', t(pack, 'metaTags', 'Tags'), scope);
    textAll('.gg-pi__sec--structure .gg-pi__kicker', t(pack, 'metaToc', 'Table of Contents'), scope);
    textAll('.gg-pi__metaitem--date .gg-pi__kicker', t(pack, 'metaDate', 'Date'), scope);
    textAll('.gg-pi__metaitem--updated .gg-pi__kicker', t(pack, 'metaUpdated', 'Updated'), scope);
    textAll('.gg-pi__metaitem--readtime .gg-pi__kicker', t(pack, 'metaReadTime', 'Read time'), scope);

    textAll('[data-row="author"] .gg-epanel__label', t(pack, 'metaWrittenBy', 'Written by'), scope);
    textAll('[data-row="contributors"] .gg-epanel__label', t(pack, 'metaContributors', 'Contributors'), scope);
    textAll('[data-row="labels"] .gg-epanel__label', t(pack, 'metaLabel', 'Label'), scope);
    textAll('[data-row="tags"] .gg-epanel__label', t(pack, 'metaTags', 'Tags'), scope);
    textAll('[data-row="date"] .gg-epanel__label', t(pack, 'metaDate', 'Date'), scope);
    textAll('[data-row="updated"] .gg-epanel__label', t(pack, 'metaUpdated', 'Updated'), scope);
    textAll('[data-row="comments"] .gg-epanel__label', t(pack, 'metaComments', 'Comments'), scope);
    textAll('[data-row="readtime"] .gg-epanel__label', t(pack, 'metaReadTime', 'Read time'), scope);
    textAll('[data-row="snippet"] .gg-epanel__label', t(pack, 'metaSnippet', 'Snippet'), scope);
    textAll('[data-row="toc"] .gg-epanel__label', t(pack, 'metaToc', 'Table of Contents'), scope);
    textAll('.gg-epanel__cta span:last-child', t(pack, 'panelReadPost', 'Read this post'), scope);
  }

  GG.modules.uiCopy = GG.modules.uiCopy || { apply: apply };
})(window.GG = window.GG || {}, document);

(function (GG, doc) {
  'use strict';
  function run() {
    if (GG.modules && GG.modules.uiCopy && typeof GG.modules.uiCopy.apply === 'function') {
      GG.modules.uiCopy.apply(doc);
    }
  }
  if (GG.boot && typeof GG.boot.onReady === 'function') GG.boot.onReady(run);
  else if (GG.boot && typeof GG.boot.defer === 'function') GG.boot.defer(run);
  else if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})(window.GG = window.GG || {}, document);

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
  var htmlLang = (doc && doc.documentElement && doc.documentElement.getAttribute('lang')) || 'en';
  GG.config.lang = (GG.config.lang || htmlLang || 'en').toLowerCase();
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
