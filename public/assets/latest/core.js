(function(w, d){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.core = GG.core || {};
  GG.store = GG.store || {};
  GG.store.config = GG.store.config || {};
  GG.services = GG.services || {};
  GG.ui = GG.ui || {};
  GG.actions = GG.actions || {};
  GG.boot = GG.boot || {};
  GG.modules = GG.modules || {};

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
  // Normalize blog home alias once worker state is known.
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
      return d ? d.querySelector(selector) : null;
    }
    function update(data){
      if(!data || !d) return;
      if(typeof data.title === 'string'){
        d.title = data.title;
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
        if(!path || path === '/') return d ? d.title : '';
        var parts = path.split('/');
        var slug = decodeURIComponent(parts[parts.length - 1] || '').replace(/[-_]+/g, ' ').trim();
        if(!slug) return d ? d.title : '';
        return slug.replace(/\b\w/g, function(m){ return m.toUpperCase(); });
      } catch (e) {
        return d ? d.title : '';
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
          var s = d.createElement('script');
          s.type = 'text/javascript';
          s.text = code;
          (d.body || d.documentElement).appendChild(s);
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
      var target = findTarget(d);
      if (!source || !target) throw fail('target', { url: url });
      var meta = extractMeta(doc);
      function swapZone(selector){
        var s = doc.querySelector(selector);
        var t = d.querySelector(selector);
        if (!s || !t) return false;
        t.innerHTML = s.innerHTML;
        return true;
      }
      var doSwap = function(){
        target.innerHTML = source.innerHTML;
        swapZone('aside.gg-blog-sidebar--left');
        swapZone('aside.gg-blog-sidebar--right');
        var page = doc.body && (doc.body.getAttribute('data-gg-page') || (doc.body.dataset && doc.body.dataset.ggPage));
        if (page && d.body) d.body.setAttribute('data-gg-page', page);
        var sMain = doc.querySelector('main.gg-main');
        var tMain = d.querySelector('main.gg-main');
        if (sMain && tMain && sMain.hasAttribute('data-gg-page')) {
          tMain.setAttribute('data-gg-page', sMain.getAttribute('data-gg-page'));
        }
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
      };
      if (d && d.startViewTransition) {
        try { d.startViewTransition(function(){ doSwap(); }); }
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
    var body = d && d.body;
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
      var mMode = d && d.querySelector('meta[name="gg:mode"]');
      var mAsset = d && d.querySelector('meta[name="gg:asset-base"]');
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
      if (!w.fetch) { env.worker = false; resolve(false); return; }
      var done = false;
      var timer = null;
      var controller = w.AbortController ? new AbortController() : null;
      function finish(ok){
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        env.worker = ok === true;
        resolve(env.worker);
      }
      timer = setTimeout(function(){
        try { if (controller) controller.abort(); } catch (e) {}
        finish(false);
      }, 1200);
      try {
        var opts = { method: 'GET', cache: 'no-store', credentials: 'same-origin' };
        if (controller) opts.signal = controller.signal;
        w.fetch('/__gg_worker_ping?x=1', opts)
          .then(function(res){
            var ver = res && res.headers ? res.headers.get('X-GG-Worker-Version') : '';
            finish(!!ver);
          })
          .catch(function(){ finish(false); });
      } catch (e) {
        finish(false);
      }
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
      var root = d && d.documentElement;
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
          var d2=JSON.stringify(p||{});
          if(w.navigator&&w.navigator.sendBeacon){
            try{w.navigator.sendBeacon(ep,w.Blob?new Blob([d2],{type:'application/json'}):d2);}catch(e){}
          }else if(w.fetch){
            w.fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:d2,keepalive:true}).catch(function(){});
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
  w.GG_BUILD = w.GG_BUILD || "dev";
  if (w.GG_DEBUG && w.console && console.log) console.log("[GG_BUILD]", w.GG_BUILD);

  // Minimal GG.store (get/set/subscribe) if missing
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
})(window, document);

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.services = GG.services || {};
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
    for (var key2 in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key2)) continue;
      if (key2 === 'summary' || key2 === 'base' || key2 === 'query' || key2 === 'type') continue;
      query[key2] = source[key2];
    }
    if (!query.alt) query.alt = 'json';
    var qs = services.api._buildQuery(query);
    var url = base + (qs ? '?' + qs : '');
    return services.api.fetch(url, 'json');
  };
  services.api.getHtml = services.api.getHtml || function(url){
    return services.api.fetch(url, 'text');
  };
})(window.GG = window.GG || {}, window, document);

(function(GG, w, d){
  'use strict';
  GG.core = GG.core || {};
  GG.core.router = GG.core.router || {};
  var router = GG.core.router;

  function isDev(){
    try {
      if (GG.env && GG.env.mode) return GG.env.mode === 'dev';
      var m = d.querySelector('meta[name="gg:mode"]');
      return !!(m && (m.getAttribute('content') || '') === 'dev');
    } catch (_) { return false; }
  }

  function getScrollY(){
    return w.pageYOffset || (d.documentElement && d.documentElement.scrollTop) || 0;
  }

  router._supports = router._supports || function(){
    return !!(w.history && w.history.pushState);
  };
  router._shouldIntercept = router._shouldIntercept || function(url){
    if (!url || !url.pathname) return false;
    var path = (url.pathname || '').toLowerCase();
    if (path.indexOf('/assets/') === 0) return false;
    if (path === '/robots.txt' || path === '/sitemap.xml' || path === '/favicon.ico' ||
        path === '/manifest.json' || path === '/manifest.webmanifest') return false;
    var exts = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
      '.json', '.xml', '.txt', '.map', '.woff', '.woff2', '.ttf'];
    for (var i = 0; i < exts.length; i++) {
      var ext = exts[i];
      if (path.length >= ext.length && path.slice(-ext.length) === ext) return false;
    }
    return true;
  };
  router._inferSurface = router._inferSurface || function(url){
    if (GG.ui && GG.ui.layout && typeof GG.ui.layout._inferSurfaceFromUrl === 'function') {
      return GG.ui.layout._inferSurfaceFromUrl(url);
    }
    try {
      var u = new URL(url || w.location.href, w.location.href);
      var path = (u.pathname || '').replace(/\/+$/, '') || '/';
      if (path === '/') {
        var view = (u.searchParams.get('view') || '').toLowerCase();
        if (view === 'blog') return 'listing';
        return 'landing';
      }
      if (path.indexOf('/search') !== -1) return 'listing';
      if (path.indexOf('/p/') !== -1) return 'page';
    } catch (_) {}
    return 'post';
  };
  router._applySurface = router._applySurface || function(url){
    var surface = '';
    if (GG.core && GG.core.surface && typeof GG.core.surface.update === 'function') {
      surface = GG.core.surface.update(url);
      if (surface) return surface;
    }
    surface = router._inferSurface(url);
    if (GG.ui && GG.ui.layout && typeof GG.ui.layout.setSurface === 'function') {
      GG.ui.layout.setSurface(surface);
    } else if (d.body) {
      d.body.setAttribute('data-gg-surface', surface);
    }
    if (GG.ui && GG.ui.layout && typeof GG.ui.layout.applySurface === 'function') {
      try { GG.ui.layout.applySurface(surface, null, url); } catch (_) {}
    }
    return surface;
  };
  router.go = router.go || function(url){
    if (!url) return;
    if (!router._supports()) return router.fallback(url);
    return router.navigate(url);
  };

  router._mergeState = router._mergeState || function(next){
    var base = (w.history && w.history.state) ? w.history.state : {};
    if (!base || typeof base !== 'object') base = {};
    var out = {};
    for (var k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (var k2 in next) {
      if (Object.prototype.hasOwnProperty.call(next, k2)) out[k2] = next[k2];
    }
    return out;
  };

  router._stateFor = router._stateFor || function(url){
    return router._mergeState({ gg: { url: url, scrollY: 0 } });
  };

  router.saveScroll = router.saveScroll || function(url){
    if(!router._supports()) return;
    var href = url || w.location.href;
    try {
      w.history.replaceState(router._mergeState({ gg: { url: href, scrollY: getScrollY() } }), '', href);
    } catch (e) {}
  };

  router.fallback = router.fallback || function(url){
    if(!url) return;
    try { w.location.href = url; } catch (e) {}
  };
  router._setLoading = router._setLoading || function(on){
    var body = d.body;
    if(!body) return;
    if (on) {
      if (body.classList) body.classList.add('is-loading');
      else body.className += ' is-loading';
      if (GG.core && GG.core.state) GG.core.state.add(body, 'loading');
    } else {
      if (body.classList) body.classList.remove('is-loading');
      else body.className = body.className.replace(/\bis-loading\b/g, '').trim();
      if (GG.core && GG.core.state) GG.core.state.remove(body, 'loading');
    }
  };
  router._load = router._load || function(url, opts){
    if(!url) return;
    if(!GG.services || !GG.services.api || !GG.services.api.getHtml) return router.fallback(url);
    var options = opts || {};
    var scrollY = (typeof options.scrollY === 'number') ? options.scrollY : null;
    var target = (GG.core && GG.core.render && GG.core.render.findTarget)
      ? GG.core.render.findTarget(d)
      : null;
    if (target && GG.ui && GG.ui.skeleton && GG.ui.skeleton.render) {
      GG.ui.skeleton.render(target);
    }
    try { w.scrollTo(0, 0); } catch (e) {}
    var done = false;
    function finish(){
      if (done) return;
      done = true;
      router._setLoading(false);
    }
    router._setLoading(true);
    return GG.services.api.getHtml(url).then(function(html){
      if (!GG.core || !GG.core.render || !GG.core.render.apply) throw new Error('render-missing');
      var ok = GG.core.render.apply(html, url);
      if (!ok) throw new Error('render-failed');
      if (typeof scrollY === 'number') w.scrollTo(0, scrollY);
      else w.scrollTo(0, 0);
      if (options.pop && typeof router.onPopState === 'function') router.onPopState(url, w.history ? w.history.state : null);
      if (!options.pop && typeof router.onNavigate === 'function') router.onNavigate(url);
      finish();
    }).catch(function(){
      finish();
      router.fallback(url);
    });
  };

  router.handleClick = router.handleClick || function(evt){
    try {
      if(!evt || evt.defaultPrevented) return;
      if (evt.button && evt.button !== 0) return;
      if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return;
      var anchor = evt.target && evt.target.closest ? evt.target.closest('a[href]') : null;
      if(!anchor) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.getAttribute('data-gg-action')) return;
      var target = anchor.getAttribute('target');
      if (target && target !== '_self') return;
      var href = anchor.getAttribute('href');
      if(!href || href.charAt(0) === '#') return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      var rel = anchor.getAttribute('rel') || '';
      if (/\bexternal\b/i.test(rel)) return;
      var url = new URL(href, w.location.href);
      if (url.origin !== w.location.origin) return;
      if (router._shouldIntercept && !router._shouldIntercept(url)) return;
      var samePath = (url.pathname === w.location.pathname && url.search === w.location.search);
      if (samePath && url.hash) return;
      evt.preventDefault();
      var canRoute = !!(router && typeof router.navigate === 'function' && router._supports && router._supports());
      if (!canRoute) {
        if (isDev() && w.console && console.warn) console.warn('[GG] intercept fallback: router unavailable -> hard nav');
        try { w.location.href = url.href; } catch (_) {}
        return;
      }
      if (isDev() && w.console && console.info) console.info('[GG] intercept click: routed without UI');
      router.navigate(url.href);
    } catch (e) {
      router.fallback((evt && evt.target && evt.target.href) ? evt.target.href : w.location.href);
    }
  };

  router.navigate = router.navigate || function(url){
    if(!router._supports()) return router.fallback(url);
    try {
      if(!url) return;
      var from = w.location.href;
      router.saveScroll(from);
      if (url === from) return;
      w.history.pushState(router._stateFor(url), '', url);
      router._applySurface(url);
      if ((isDev() || w.GG_DEBUG) && w.console && console.log) console.log('[GG.router] Navigating to', url);
      router._load(url, { pop: false });
    } catch (e) {
      router.fallback(url);
    }
  };

  router._onPopState = router._onPopState || function(evt){
    try {
      var state = (evt && evt.state) ? evt.state : (w.history ? w.history.state : null);
      var y = (state && state.gg && typeof state.gg.scrollY === 'number') ? state.gg.scrollY : 0;
      if ((isDev() || w.GG_DEBUG) && w.console && console.log) console.log('[GG.router] Popstate', w.location.href);
      router._applySurface(w.location.href);
      router._load(w.location.href, { pop: true, scrollY: y });
    } catch (e) {
      router.fallback(w.location.href);
    }
  };

  router.init = router.init || function(){
    if(router._init) return;
    router._init = true;
    if(!router._supports()) return;
    try {
      if ('scrollRestoration' in w.history) w.history.scrollRestoration = 'manual';
    } catch (e) {}
    router.saveScroll(w.location.href);
    if (!router._bound) {
      router._bound = true;
      d.addEventListener('click', router.handleClick);
    }
    w.addEventListener('popstate', router._onPopState);
  };
  router.onNavigate = router.onNavigate || function(url){
    if(!GG.core || !GG.core.meta || !GG.core.meta.update) return;
    if (GG.core.render && GG.core.render._lastUrl === url) return;
    var title = (GG.core.meta.titleFromUrl) ? GG.core.meta.titleFromUrl(url) : d.title;
    GG.core.meta.update({ title: title, description: title, ogTitle: title });
  };
  router.onPopState = router.onPopState || function(url){
    if(!GG.core || !GG.core.meta || !GG.core.meta.update) return;
    if (GG.core.render && GG.core.render._lastUrl === url) return;
    var title = (GG.core.meta.titleFromUrl) ? GG.core.meta.titleFromUrl(url) : d.title;
    GG.core.meta.update({ title: title, description: title, ogTitle: title });
  };
})(window.GG = window.GG || {}, window, document);

(function(GG, w, d){
  'use strict';
  GG.boot = GG.boot || {};
  GG.modules = GG.modules || {};

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
    d.addEventListener('DOMContentLoaded', flush, { once: true });
  };

  GG.boot.loadScript = GG.boot.loadScript || function(url){
    if (!url) return Promise.reject(new Error('script-url-missing'));
    GG.boot._scriptPromises = GG.boot._scriptPromises || {};
    if (GG.boot._scriptPromises[url]) return GG.boot._scriptPromises[url];
    GG.boot._scriptPromises[url] = new Promise(function(resolve, reject){
      var s = d.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = function(){ resolve(url); };
      s.onerror = function(){ reject(new Error('script-load-failed')); };
      (d.head || d.documentElement).appendChild(s);
    });
    return GG.boot._scriptPromises[url];
  };

  function isDev(){
    try {
      if (GG.env && GG.env.mode) return GG.env.mode === 'dev';
      var m = d.querySelector('meta[name="gg:mode"]');
      return !!(m && (m.getAttribute('content') || '') === 'dev');
    } catch (_) { return false; }
  }

  function getCoreSrc(){
    var s = d.currentScript;
    if (s && s.src) return s.src;
    var list = d.getElementsByTagName('script');
    for (var i = list.length - 1; i >= 0; i--) {
      var src = list[i].src || '';
      if (src.indexOf('/core.js') !== -1) return src;
    }
    return '';
  }

  function moduleUrl(name){
    var src = getCoreSrc();
    if (src) return src.replace(/core\.js(?=\?|#|$)/, 'modules/' + name);
    var base = (GG.env && GG.env.assetBase) ? GG.env.assetBase : '/assets/latest';
    if (base && base.charAt(base.length - 1) === '/') base = base.slice(0, -1);
    return base + '/modules/' + name;
  }

  GG.boot.moduleUrl = GG.boot.moduleUrl || function(name){
    if (!name) return '';
    return moduleUrl(name);
  };

  GG.boot.loadModule = GG.boot.loadModule || function(name){
    if (!name) return Promise.reject(new Error('module-name-missing'));
    var url = GG.boot.moduleUrl ? GG.boot.moduleUrl(name) : moduleUrl(name);
    return GG.boot.loadScript(url);
  };

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

  function scheduleIdle(fn, timeoutMs){
    var t = typeof timeoutMs === 'number' ? timeoutMs : 2000;
    if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: t });
    else w.setTimeout(fn, t);
  }

  function loadPwa(){
    var url = moduleUrl('pwa.js');
    return GG.boot.loadScript(url).then(function(){
      if (GG.modules && GG.modules.pwa && typeof GG.modules.pwa.init === 'function') {
        GG.modules.pwa.init();
      }
    }).catch(function(err){
      if (isDev() && w.console && console.warn) console.warn('GG core: pwa module failed', err && err.message ? err.message : err);
    });
  }

  function loadUi(){
    var url = moduleUrl('ui.js');
    if (GG.boot._uiPromise) return GG.boot._uiPromise;
    GG.boot._uiPromise = GG.boot.loadScript(url).then(function(){
      if (GG.modules && GG.modules.ui && typeof GG.modules.ui.init === 'function') {
        try { GG.modules.ui.init(); } catch (_) {}
      }
      GG.boot._uiReady = true;
      return true;
    }).catch(function(err){
      GG.boot._uiPromise = null;
      if (isDev() && w.console && console.warn) console.warn('GG core: ui module failed', err && err.message ? err.message : err);
      throw err;
    });
    return GG.boot._uiPromise;
  }

  GG.boot.requestUi = GG.boot.requestUi || function(reason){
    if (GG.boot._uiReady) return Promise.resolve(true);
    if (reason === 'click' && isDev() && !GG.boot._uiClickLogged) {
      GG.boot._uiClickLogged = true;
      try { if (w.console && console.info) console.info('UI module requested by internal click'); } catch (_) {}
    }
    setBootStage(3);
    return loadUi();
  };

  function bindUiInteractRequest(){
    if (GG.boot._uiInteractBound) return;
    GG.boot._uiInteractBound = true;
    var onPointer = function(){
      if (GG.boot && typeof GG.boot.requestUi === 'function') GG.boot.requestUi('interact');
    };
    var onKey = function(e){
      var key = (e && e.key ? e.key : '').toLowerCase();
      if (e && (e.ctrlKey || e.metaKey) && key === 'k') return;
      if (GG.boot && typeof GG.boot.requestUi === 'function') GG.boot.requestUi('key');
    };
    try { d.addEventListener('pointerdown', onPointer, { passive: true, capture: true, once: true }); } catch (_) {}
    try { d.addEventListener('keydown', onKey, { capture: true, once: true }); } catch (_) {}
  }

  function bindPendingCmdK(){
    if (GG.boot._pendingCmdkBound) return;
    GG.boot._pendingCmdkBound = true;
    d.addEventListener('keydown', function(e){
      if (!e) return;
      var key = (e.key || '').toLowerCase();
      if (!(e.ctrlKey || e.metaKey) || key !== 'k') return;
      if (GG.boot && GG.boot._uiReady) return;
      try { e.preventDefault(); } catch (_) {}
      w.__GG_PENDING_SEARCH = true;
      if (GG.boot && typeof GG.boot.requestUi === 'function') {
        GG.boot.requestUi('cmdk');
      }
    }, true);
  }

  bindUiInteractRequest();
  bindPendingCmdK();

  // Router binding for native feel
  if (GG.boot.onReady) {
    GG.boot.onReady(function(){
      if (GG.core && GG.core.router && GG.core.router.init) GG.core.router.init();
    });
  }

  // Load PWA module after window load + idle (prod conservative)
  if (d.readyState === 'complete') {
    scheduleIdle(loadPwa, 2000);
  } else {
    w.addEventListener('load', function(){ scheduleIdle(loadPwa, 2000); }, { once: true });
  }

  function surfaceHint(){
    var body = d && d.body ? d.body : null;
    if (!body) return '';
    return (body.getAttribute('data-gg-surface') || (body.dataset && body.dataset.ggSurface) || '').toLowerCase();
  }

  function isLandingSurface(){
    return surfaceHint() === 'landing';
  }

  function afterPaint(fn){
    if (!w.requestAnimationFrame) { w.setTimeout(fn, 0); return; }
    w.requestAnimationFrame(function(){
      w.requestAnimationFrame(fn);
    });
  }

  function uiPrefetchSkipReason(ignoreScheduled){
    if (GG.boot && (GG.boot._uiReady === true || GG.boot._uiPromise || (!ignoreScheduled && GG.boot._uiPrefetchScheduled))) {
      return 'already requested';
    }
    if (!w.requestIdleCallback) return 'no requestIdleCallback';
    if (d.visibilityState && d.visibilityState !== 'visible') return 'tab not visible';
    var nav = w.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn && conn.saveData) return 'saveData';
    if (conn && typeof conn.effectiveType === 'string' && /2g/i.test(conn.effectiveType)) return '2g';
    if (conn && typeof conn.downlink === 'number' && conn.downlink < 1.0) return 'slow downlink';
    return '';
  }

  function scheduleUiPrefetch(mode){
    var reason = uiPrefetchSkipReason(false);
    if (reason) {
      if (isDev() && w.console && console.info) console.info('UI prefetch skipped: ' + reason);
      return;
    }
    GG.boot._uiPrefetchScheduled = true;
    if (isDev() && w.console && console.info) {
      var label = mode === 'early' ? 'early idle' : 'idle';
      console.info('UI prefetch scheduled (' + label + ')');
    }
    var run = function(){
      var r = uiPrefetchSkipReason(true);
      if (r) {
        if (isDev() && w.console && console.info) console.info('UI prefetch skipped: ' + r);
        return;
      }
      if (GG.boot && typeof GG.boot.requestUi === 'function') {
        GG.boot.requestUi('idle');
      }
    };
    if (mode === 'early') {
      afterPaint(function(){
        w.requestIdleCallback(run, { timeout: 1200 });
      });
      return;
    }
    w.requestIdleCallback(run);
  }

  if (w.requestIdleCallback) {
    if (!isLandingSurface()) {
      scheduleUiPrefetch('early');
    }
    if (d.readyState === 'complete') scheduleUiPrefetch();
    else w.addEventListener('load', function(){ scheduleUiPrefetch(); }, { once: true });
  }

})(window.GG = window.GG || {}, window, document);
