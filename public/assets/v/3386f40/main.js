/* @GG_CAPSULE_V1
VERSION: 2026-01-28
LAST_PATCH: 2026-02-04 FIX-007 surface state logic overhaul
NEXT_TASK: QA-001 smoke test checklist (deferred)
GOAL: single-file main.js (pure JS), modular MVC-lite (Store/Services/UI primitives) for Blogger theme + Cloudflare (mode B)

=== CONTEXT (immutable unless infra changes) ===
DEPLOYMENT:
- Cloudflare edge in front of Blogger (Mode B).
- Can set HTTP security headers at edge (CSP/HSTS/etc).
- Can host root assets at Cloudflare origin: /sw.js, /manifest.webmanifest

FILES (canonical roles):
- index.xml: template (head/body hooks only; no heavy logic)
- main.css : styles
- main.js  : MUST be pure JavaScript (NO HTML entities like quote-entity, NO script tags, NO C-DATA)

PWA:
- Service Worker: /sw.js (scope: /)
- Manifest: /manifest.webmanifest

SECURITY:
- Prefer CSP frame-ancestors at edge for anti-iframe.
- JS framebusting is fallback only; must not break Blogger preview/admin if allowlisted.

=== LEDGER (mutable; must be updated every patch) ===
CORE INVARIANTS:
- One init entry: GG.boot.init()
- One event gateway: GG.actions (delegated)
- One state source: GG.store (get/set/subscribe)
- Side effects only via GG.services.*
- Native Blogger tags are immutable.
- UI primitives live in GG.ui.* (toast/dialog/overlay/palette/inputMode)
- i18n uses Intl.* (not string-only)
- a11y is systemic (focus trap, inert, announce, reduced motion)

MODULE LAYERS:
1) GG.core     : dom helpers, log, scheduler
2) GG.store    : state + subscribe
3) GG.services : storage(version+migration), sw, searchIndex, telemetry(optional)
4) GG.i18n     : t(), nf(), cf(), df(), rtf(), setLocale(), setTimeZone(), dir
5) GG.a11y     : focusTrap, inertManager, announce, audit
6) GG.ui       : overlay, dialog, toast, commandPalette, inputMode
7) GG.actions  : registry + dispatcher (data-gg-action)
8) GG.modules  : feature modules (Dock, Panels, Library, ShareSheet, Poster, TagHub, etc.)

CURRENT FEATURE MODULES FOUND:
homeState, Dock, PostDetail, BackToTop, LoadMore, PopularCarousel, LeftNav,
Shortcodes, Skeleton, ReadingProgress, DockPerimeter, RelatedInline, Panels, InfoPanel,
labelTree, breadcrumbs, readTime, tagDirectory, tagHubPage, postTagsInline, tagUtils, library, shareSheet, posterCanvas,
posterEngine, shareMotion, langSwitcher, imgDims, a11yFix

OPEN TASKS (update every patch):
T-001 (done) Make main.js pure JS (remove script tags / C-DATA / HTML entities)
T-002 (done) Index.xml cleanup: purge inline JS + keep single main.js entry
T-003 (done) Architecture relocation: move globals into GG.core/store/services/ui/actions/boot
C-001 (done) Define CSS layers & z-index variables (no visual change)
X-001 (done) State contract: JS writes data-gg-state, CSS reads data-gg-state
X-002 (done) Hook alignment: static toast/dialog/overlay containers in XML + UI selects by id
F-001 (done) Router engine: History API navigation with scroll restore + fallback
F-003 (done) Metadata discipline: update title/description for client-only navigation
F-004 (done) Centralized data fetching: GG.services.api fetch/getFeed/getHtml
F-005 (done) SPA content injection: router fetch + render + comment script rehydrate
F-002 (done) Super Search: Fuse.js + IDB cache + command palette
F-006 (done) Native transitions + skeleton UI for SPA navigation
F-007 (done) Share poster + image proxy for CORS-safe canvas
T-004 (done) Promote primitives + config migration (gg-config -> GG.store.config)
T-005 (done) UI/UX re-integration after SPA render (layout + smart components)
T-006 (done) Surface logic + context refinement (SSR body surface + client updates)
T-007 (done) Surface precision + smart navigation (listing/page + smart back)
FIX-003 (done) Navigation + route logic fixes (view=blog + breadcrumb route)
FIX-004 (done) Edge-side surface rewrite for view=blog SSR
FIX-005 (done) Strict query routing + anchor removal for blog view
FIX-007 (done) Surface state logic overhaul (central update + gg-is-landing class)

STYLE INVARIANTS:
- No behavior changes in T-001/T-002.
- No stylistic changes (including adding/removing `window.` prefixes).
- Only change code where necessary to make the file parse as pure JS.

OUTPUT RULES (keep output under 80 lines):
- If only capsule fields changed -> OUTPUT: CAPSULE_ONLY (print an updated capsule block summary not exceeding 80 lines).
- Otherwise -> OUTPUT: DIFF (only changed hunks, no file headers).

PROOF REQUIRED (T-001 completion gate):
- PATCHLOG must include counts for:
  closing-script, opening-script, html-comment, C-DATA, quote-entity, apos-entity, gt-entity, lt-entity
- T-001 is NOT DONE unless all counts are 0.

PATCHLOG (append newest first; keep last 10):
- 2026-02-04 FIX-007: surface state logic overhaul (central update + gg-is-landing class).
- 2026-02-03 FIX-005: strict query routing + remove blog anchor usage.
- 2026-02-03 FIX-004: edge rewrite for view=blog surface.
- 2026-02-03 FIX-003: view=blog surface + breadcrumb home blog route.
- 2026-02-03 T-007: refine surface precision + smart back navigation.
- 2026-02-03 T-006: surface awareness + contextual right panel handling.
- 2026-02-03 T-005: rehydrate layout + smart UI modules after SPA swaps.
- 2026-02-03 F-007: add poster share module + worker proxy usage.
- 2026-02-03 F-006: add skeleton UI + view transitions for router swaps.
- 2026-02-03 F-002: add super search (Fuse.js + IDB) with command palette.
*/
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
      };
      var docRef = w.document;
      if (docRef && docRef.startViewTransition) {
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
      if (path === '/' && (u.searchParams.get('view') || '').toLowerCase() === 'blog') {
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
  (function(){
    try {
      var root = w.document && w.document.documentElement;
      if (!root || root.hasAttribute('data-gg-prehome')) return;
      var pre = 'landing';
      var search = (w.location && w.location.search) ? w.location.search : '';
      var m = search.match(/[?&]prehome=(blog|landing)(?:&|$)/i);
      if (m && m[1]) {
        pre = (m[1] + '').toLowerCase();
      } else {
        var hash = (w.location && w.location.hash ? w.location.hash : '').replace(/^#/, '').toLowerCase();
        if (hash === 'blog' || hash === 'landing') {
          pre = hash;
        } else {
          var p = (w.location && w.location.pathname ? w.location.pathname : '/').replace(/\/+$/, '') || '/';
          if (p === '/blog') pre = 'blog';
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
  paletteOpen: false,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
GG.ui = GG.ui || {};
GG.ui.applyRootState = GG.ui.applyRootState || function(root, s){
  root.dataset.ggLang = s.lang;
  root.dataset.ggInput = s.inputMode;
  root.dataset.ggDock = s.dockOpen ? '1' : '0';
  root.dataset.ggPalette = s.paletteOpen ? '1' : '0';
  GG.core.state.toggle(root, 'reduced-motion', !!s.reducedMotion);
};
GG.view = GG.view || {};
GG.view.applyRootState = GG.ui.applyRootState;

// Keep <html> dataset/class in sync with GG.store
(function(){
  try{
    var root = document.documentElement;
    if(!root || !window.GG || !GG.store || !GG.store.get || !GG.store.subscribe || !GG.ui || !GG.ui.applyRootState) return;
    // initial
    GG.ui.applyRootState(root, GG.store.get());
    // on updates
    GG.store.subscribe(function(s){
      try{ GG.ui.applyRootState(root, s); }catch(e){}
    });
  }catch(e){}
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
      actions._routerBound = true;
      GG.core.router._bound = true;
      d.addEventListener('click', GG.core.router.handleClick);
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
  ui.palette = ui.palette || {};
  ui.palette.open = ui.palette.open || function(){ return toggleHost('.gg-palette-host,[data-gg-ui="palette"]', true); };
  ui.palette.close = ui.palette.close || function(){ return toggleHost('.gg-palette-host,[data-gg-ui="palette"]', false); };
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

    if (next === 'post') {
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
(function(GG, w, d){
  'use strict';
  GG.core = GG.core || {};
  GG.core.router = GG.core.router || {};
  var router = GG.core.router;

  function getScrollY(){
    return w.pageYOffset || (d.documentElement && d.documentElement.scrollTop) || 0;
  }

  router._supports = router._supports || function(){
    return !!(w.history && w.history.pushState);
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
      var samePath = (url.pathname === w.location.pathname && url.search === w.location.search);
      if (samePath && url.hash) return;
      evt.preventDefault();
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
      if (w.console && console.log) console.log('[GG.router] Navigating to', url);
      router._load(url, { pop: false });
    } catch (e) {
      router.fallback(url);
    }
  };

  router._onPopState = router._onPopState || function(evt){
    try {
      var state = (evt && evt.state) ? evt.state : (w.history ? w.history.state : null);
      var y = (state && state.gg && typeof state.gg.scrollY === 'number') ? state.gg.scrollY : 0;
      if (w.console && console.log) console.log('[GG.router] Popstate', w.location.href);
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
    var title = (GG.core.meta.titleFromUrl) ? GG.core.meta.titleFromUrl(url) : w.document.title;
    GG.core.meta.update({ title: title, description: title, ogTitle: title });
  };
  router.onPopState = router.onPopState || function(url){
    if(!GG.core || !GG.core.meta || !GG.core.meta.update) return;
    if (GG.core.render && GG.core.render._lastUrl === url) return;
    var title = (GG.core.meta.titleFromUrl) ? GG.core.meta.titleFromUrl(url) : w.document.title;
    GG.core.meta.update({ title: title, description: title, ogTitle: title });
  };
})(window.GG = window.GG || {}, window, document);

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.search = GG.modules.search || (function(){
    var state = {
      ready: false,
      loading: false,
      items: [],
      fuse: null,
      lastQuery: '',
      ttlMin: 60,
      ui: null,
      _init: false,
      _indexPromise: null,
      _libs: null
    };
    var KEY = 'gg_search_index_v1';

    function getCfg(){
      return (GG.store && GG.store.config) ? GG.store.config : {};
    }

    function getTTL(){
      var cfg = getCfg();
      var ttl = parseInt(cfg.searchCacheTTL, 10);
      return isNaN(ttl) || ttl <= 0 ? 60 : ttl;
    }

    function isTypingTarget(el){
      if (!el) return false;
      if (el.isContentEditable) return true;
      var tag = (el.tagName || '').toUpperCase();
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function importLibs(){
      if (state._libs) return state._libs;
      state._libs = Promise.all([
        import('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs'),
        import('https://unpkg.com/idb-keyval@6.2.1/dist/index.js')
      ]).then(function(mods){
        var Fuse = mods[0] && (mods[0].default || mods[0].Fuse || mods[0]);
        var idb = mods[1] || {};
        return { Fuse: Fuse, idb: idb };
      });
      return state._libs;
    }

    function getStore(idb){
      if (idb && typeof idb.createStore === 'function') return idb.createStore('gg', 'search');
      return null;
    }

    function idbGet(idb, key){
      var store = getStore(idb);
      return store ? idb.get(key, store) : idb.get(key);
    }

    function idbSet(idb, key, val){
      var store = getStore(idb);
      return store ? idb.set(key, val, store) : idb.set(key, val);
    }

    function logError(stage, err){
      if (GG.core && typeof GG.core.telemetry === 'function') {
        GG.core.telemetry({
          type: 'search',
          stage: stage,
          message: err && err.message ? err.message : 'error'
        });
      }
    }

    function stripHtml(str){
      return String(str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function pickAltLink(entry){
      var links = entry && entry.link ? entry.link : [];
      for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'alternate' && links[i].href) return links[i].href;
      }
      return '';
    }

    function parseFeed(json){
      var entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
      var items = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i] || {};
        var title = (e.title && e.title.$t) ? e.title.$t : '';
        var url = pickAltLink(e);
        var summary = '';
        if (e.summary && e.summary.$t) summary = e.summary.$t;
        else if (e.content && e.content.$t) summary = e.content.$t;
        summary = stripHtml(summary);
        if (title && url) items.push({ title: title, url: url, summary: summary });
      }
      return items;
    }

    function buildFuse(Fuse, items){
      if (!Fuse) return null;
      return new Fuse(items || [], {
        keys: ['title', 'summary'],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2
      });
    }

    function ensureIndex(){
      if (state.ready) return Promise.resolve(state.items);
      if (state._indexPromise) return state._indexPromise;
      state._indexPromise = loadIndex().finally(function(){
        state._indexPromise = null;
      });
      return state._indexPromise;
    }

    async function loadIndex(){
      state.loading = true;
      state.ttlMin = getTTL();
      try {
        var libs = await importLibs();
        var idb = libs.idb || {};
        var Fuse = libs.Fuse;
        var cached = null;
        try { cached = await idbGet(idb, KEY); } catch (e) {}
        var ttlMs = state.ttlMin * 60 * 1000;
        if (cached && cached.ts && Array.isArray(cached.items) && (Date.now() - cached.ts) < ttlMs) {
          state.items = cached.items;
          state.fuse = buildFuse(Fuse, state.items);
          state.ready = true;
          state.loading = false;
          return state.items;
        }
        if (!GG.services || !GG.services.api || !GG.services.api.getFeed) {
          throw new Error('api-missing');
        }
        var json = await GG.services.api.getFeed({ summary: true, 'max-results': 500 });
        var items = parseFeed(json);
        state.items = items;
        state.fuse = buildFuse(Fuse, items);
        state.ready = true;
        state.loading = false;
        try { await idbSet(idb, KEY, { ts: Date.now(), items: items }); } catch (e2) {}
        return items;
      } catch (err) {
        state.loading = false;
        state.ready = false;
        logError('load', err);
        throw err;
      }
    }

    function ensureUI(){
      if (state.ui && state.ui.root) return state.ui;
      var host = d.getElementById('gg-dialog') || d.querySelector('.gg-dialog-host,[data-gg-ui="dialog"]');
      if (!host) return null;
      host.setAttribute('role', 'dialog');
      host.setAttribute('aria-label', 'Search');
      host.innerHTML = '' +
        '<div class="gg-search" data-gg-search-root>' +
          '<div class="gg-search__header">' +
            '<input class="gg-search__input" data-gg-search-input type="search" placeholder="Search..." aria-label="Search"/>' +
            '<button class="gg-search__close" data-gg-search-close type="button" aria-label="Close">Close</button>' +
          '</div>' +
          '<div class="gg-search__status" data-gg-search-status></div>' +
          '<div class="gg-search__results" data-gg-search-results role="listbox"></div>' +
        '</div>';
      var input = host.querySelector('[data-gg-search-input]');
      var results = host.querySelector('[data-gg-search-results]');
      var status = host.querySelector('[data-gg-search-status]');
      var closeBtn = host.querySelector('[data-gg-search-close]');
      state.ui = { root: host, input: input, results: results, status: status, close: closeBtn };

      if (input) {
        input.addEventListener('input', function(){
          state.lastQuery = input.value || '';
          renderResults();
        });
        input.addEventListener('keydown', function(e){
          if (e.key === 'Escape') {
            e.preventDefault();
            close();
          }
          if (e.key === 'Enter') {
            var first = state.ui && state.ui.results ? state.ui.results.querySelector('[data-gg-search-item]') : null;
            if (first) {
              e.preventDefault();
              navigate(first.getAttribute('data-url'));
            }
          }
        });
      }
      if (results) {
        results.addEventListener('click', function(e){
          var item = e.target && e.target.closest ? e.target.closest('[data-gg-search-item]') : null;
          if (!item) return;
          e.preventDefault();
          navigate(item.getAttribute('data-url'));
        });
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', function(){
          close();
        });
      }
      return state.ui;
    }

    function setStatus(msg){
      if (!state.ui || !state.ui.status) return;
      state.ui.status.textContent = msg || '';
      state.ui.status.style.display = msg ? 'block' : 'none';
    }

    var _escNode = null;
    function escapeHtml(str){
      if (!d || !d.createElement) return String(str || '');
      if (!_escNode) _escNode = d.createElement('span');
      _escNode.textContent = String(str || '');
      return _escNode.innerHTML;
    }

    function renderResults(){
      var ui = ensureUI();
      if (!ui) return;
      var q = (ui.input && ui.input.value) ? ui.input.value.trim() : '';
      if (!q) {
        ui.results.innerHTML = '';
        setStatus('Type to search');
        return;
      }
      if (!state.ready) {
        setStatus('Loading search index…');
        ensureIndex().then(function(){ renderResults(); }).catch(function(){ setStatus('Search unavailable'); });
        return;
      }
      if (!state.fuse) {
        setStatus('Search unavailable');
        return;
      }
      var found = state.fuse.search(q, { limit: 12 });
      if (!found.length) {
        ui.results.innerHTML = '';
        setStatus('No results');
        return;
      }
      setStatus('');
      var html = found.map(function(res){
        var item = res && res.item ? res.item : {};
        var title = escapeHtml(item.title || '');
        var summary = escapeHtml(item.summary || '');
        var url = item.url || '';
        return '' +
          '<button class="gg-search__result" data-gg-search-item data-url="' + url + '" type="button">' +
            '<span class="gg-search__title">' + title + '</span>' +
            (summary ? '<span class="gg-search__summary">' + summary + '</span>' : '') +
          '</button>';
      }).join('');
      ui.results.innerHTML = html;
    }

    function open(){
      var ui = ensureUI();
      if (!ui) return;
      if (GG.ui && GG.ui.dialog && GG.ui.dialog.open) GG.ui.dialog.open();
      if (GG.ui && GG.ui.overlay && GG.ui.overlay.open) GG.ui.overlay.open();
      setStatus(state.ready ? '' : 'Loading search index…');
      ensureIndex().then(function(){
        setStatus('');
        renderResults();
      }).catch(function(){
        setStatus('Search unavailable');
      });
      try { if (ui.input) { ui.input.value = state.lastQuery || ''; ui.input.focus(); } } catch (e) {}
    }

    function close(){
      if (GG.ui && GG.ui.dialog && GG.ui.dialog.close) GG.ui.dialog.close();
      if (GG.ui && GG.ui.overlay && GG.ui.overlay.close) GG.ui.overlay.close();
    }

    function navigate(url){
      if (!url) return;
      close();
      if (GG.core && GG.core.router && typeof GG.core.router.navigate === 'function') {
        GG.core.router.navigate(url);
      } else {
        w.location.href = url;
      }
    }

    function onKeydown(e){
      if (!e) return;
      if (isTypingTarget(e.target)) return;
      var key = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        open();
      }
    }

    function onClick(e){
      var target = e && e.target ? e.target : null;
      if (!target || !target.closest) return;
      var trigger = target.closest('[data-gg-search],[data-gg-action="search"],.gg-dock__item--search,.gg-search-trigger,button[aria-label="Search"],a[aria-label="Search"]');
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      open();
    }

    function bindTriggers(){
      d.addEventListener('keydown', onKeydown);
      d.addEventListener('click', onClick, true);
    }

    function warmIndex(){
      var run = function(){
        ensureIndex().catch(function(){});
      };
      if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 2000 });
      else w.setTimeout(run, 1200);
    }

    function init(){
      if (state._init) return;
      state._init = true;
      state.ttlMin = getTTL();
      bindTriggers();
      warmIndex();
    }

    return { init: init, open: open, close: close };
  })();

  if (GG.boot && GG.boot.onReady) {
    GG.boot.onReady(function(){
      if (GG.modules && GG.modules.search && GG.modules.search.init) GG.modules.search.init();
    });
  }
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
// X-018A ACTION BRIDGE
GG.actions.register('bookmark', function(ctx){
  var event = ctx && ctx.event;
  var element = ctx && ctx.element;
  if (event && event.defaultPrevented) return;
  if (GG.modules.library && typeof GG.modules.library.toggleFromAction === 'function') {
    if (event && event.preventDefault) event.preventDefault();
    GG.modules.library.toggleFromAction(element);
  }
});
GG.actions.register('share', function(ctx){
  var event = ctx && ctx.event;
  var element = ctx && ctx.element;
  var sheet = document.getElementById('gg-share-sheet') || document.getElementById('pc-poster-sheet');
  if (sheet && GG.core.state.has(sheet, 'open')) return;
  var meta = (GG.util && typeof GG.util.getMetaFromElement === 'function')
    ? GG.util.getMetaFromElement(element)
    : null;
  if (!meta) return;
  if (event && event.preventDefault) event.preventDefault();
  if (GG.modules.shareSheet && typeof GG.modules.shareSheet.open === 'function') {
    GG.modules.shareSheet.open(meta);
  } else if (GG.util && typeof GG.util.openShareSheet === 'function') {
    GG.util.openShareSheet(meta);
  }
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

  services.manifest = services.manifest || {};
  services.manifest.init = services.manifest.init || function(opts){
    var options = opts || {};
    var href = options.href || (w.GG_ASSET ? w.GG_ASSET('/manifest.webmanifest') : '/manifest.webmanifest');
    var link = d.querySelector('link[rel="manifest"]');
    if(!link){
      if(!d.head) return null;
      link = d.createElement('link');
      link.setAttribute('rel', 'manifest');
      d.head.appendChild(link);
    }
    if(href && link.getAttribute('href') !== href){
      link.setAttribute('href', href);
    }
    return link;
  };

  services.sw = services.sw || {};
  services.sw.init = services.sw.init || function () {
    if (services.sw._init) return;
    services.sw._init = true;
  
    if (!w.navigator || !("serviceWorker" in w.navigator)) return;
    if (w.location && w.location.protocol !== "https:") return;

    var debug = false;
    try { debug = new URL(w.location.href).searchParams.get("ggdebug") === "1"; } catch (e) {}
    function log(){
      if(!debug || !w.console || !console.log) return;
      console.log.apply(console, ["[GG_SW]"].concat([].slice.call(arguments)));
    }

    if (w.GG_IS_DEV) {
      log("pwa disabled in dev mode");
      return;
    }

    var FLAGS_URL = "/gg-flags.json";
    var reloadKey = "gg_sw_disabled_reload";
    var disableInFlight = false;

    function fetchFlags(){
      // no-store so kill-switch flips immediately (avoid stale cache)
      return w.fetch(FLAGS_URL + "?t=" + Date.now(), { cache: "no-store" })
        .then(function(res){ return res && res.ok ? res.json() : null; })
        .then(function(data){
          var enabled = !(data && data.sw && data.sw.enabled === false);
          return { enabled: enabled };
        })
        .catch(function(){
          return { enabled: true };
        });
    }

    function disableSw(reason){
      if(disableInFlight) return;
      disableInFlight = true;
      log("sw disabled", reason || "");

      var tasks = [];
      try {
        tasks.push(
          w.navigator.serviceWorker.getRegistrations()
            .then(function(list){
              return Promise.all(list.map(function(reg){
                try { return reg.unregister(); } catch (e) { return null; }
              }));
            })
            .catch(function(){})
        );
      } catch (e) {}

      try {
        if (w.caches && w.caches.keys) {
          tasks.push(
            w.caches.keys()
              .then(function(keys){
                return Promise.all(keys.map(function(k){ return w.caches.delete(k); }));
              })
              .catch(function(){})
          );
        }
      } catch (e) {}

      Promise.all(tasks).then(function(){
        var controlled = !!(w.navigator && w.navigator.serviceWorker && w.navigator.serviceWorker.controller);
        var already = false;
        try { already = !!(w.sessionStorage && w.sessionStorage.getItem(reloadKey)); } catch (e) {}
        // Guard reload to avoid infinite loop while SW is disabled.
        if (controlled && !already) {
          try { w.sessionStorage && w.sessionStorage.setItem(reloadKey, "1"); } catch (e) {}
          w.location.reload();
        }
      });
    }

    var refreshing = false;
    function onControllerChange(){
      if(refreshing) return;
      refreshing = true;
      w.location.reload();
    }

    function requestUpdate(reg){
      if(!reg || !reg.waiting) return;
      var ok = true;
      try { ok = w.confirm ? w.confirm("Update tersedia. Muat ulang sekarang?") : true; } catch (e) { ok = true; }
      if(!ok) return;
      try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
      try { w.navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true }); } catch (e) {}
    }

    function trackUpdates(reg){
      if(!reg) return;
      if(reg.waiting) requestUpdate(reg);

      reg.addEventListener("updatefound", function(){
        var next = reg.installing;
        if(!next) return;
        next.addEventListener("statechange", function(){
          if(next.state === "installed" && w.navigator.serviceWorker.controller){
            log("update available");
            requestUpdate(reg);
          }
        });
      });
    }
  
    function register() {
      try {
        w.navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then(function (reg) {
            // optional: paksa cek update lebih cepat (aman)
            try { reg.update(); } catch (e) {}
            trackUpdates(reg);
          })
          .catch(function (err) {
            if (w.console && console.error) console.error(err);
          });
      } catch (e) {}
    }

    try {
      w.navigator.serviceWorker.addEventListener("message", function(evt){
        var data = evt && evt.data ? evt.data : {};
        if (data.type === "GG_SW_DISABLED") disableSw("message");
      });
    } catch (e) {}

    fetchFlags().then(function(flags){
      if (!flags || flags.enabled === false) {
        disableSw("flags");
        return;
      }
      try { w.sessionStorage && w.sessionStorage.removeItem(reloadKey); } catch (e) {}
      if (d.readyState === "complete") register();
      else w.addEventListener("load", register, { once: true });
    });
  };
  

  services.pwa = services.pwa || {};
  services.pwa.init = services.pwa.init || function(){
    if (w.GG_IS_DEV) return;
    services.manifest.init();
    services.sw.init();
  };

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

  GG.boot.onReady = GG.boot.onReady || function(fn){
    if (typeof fn !== 'function') return;
    if (d.readyState !== 'loading') { fn(); return; }
    GG.boot._readyQueue = GG.boot._readyQueue || [];
    GG.boot._readyQueue.push(fn);
    if (GG.boot._readyBound) return;
    GG.boot._readyBound = true;
    var flush = function(){
      var q = GG.boot._readyQueue || [];
      GG.boot._readyQueue = [];
      for (var i = 0; i < q.length; i++) {
        try { q[i](); } catch (e) {}
      }
    };
    if (GG.util && GG.util.initOnce) {
      GG.util.initOnce('GG.boot.onReady', function(){
        d.addEventListener('DOMContentLoaded', flush, { once: true });
      });
    } else {
      d.addEventListener('DOMContentLoaded', flush, { once: true });
    }
  };

  GG.boot.init = GG.boot.init || function(){
    if(GG.boot._init) return;
    GG.boot._init = true;
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
    services.pwa.init();
    if (GG.boot.onReady) {
      GG.boot.onReady(function(){
        if (GG.app && typeof GG.app.init === 'function') GG.app.init();
      });
    }
  };

  GG.boot.init();
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
      if(GG.core && GG.core.router && GG.core.router.init) GG.core.router.init();
      if(GG.services.a11y && GG.services.a11y.init) GG.services.a11y.init();
    };
  }
  if(GG.boot._init){
    if(GG.services.actions && GG.services.actions.init) GG.services.actions.init();
    if(GG.core && GG.core.router && GG.core.router.init) GG.core.router.init();
    if(GG.services.a11y && GG.services.a11y.init) GG.services.a11y.init();
  }
})(window.GG = window.GG || {});



(function(){
    const v = document.getElementById("ggHeroVideo");
    const hero = document.getElementById("gg-landing-hero");
    if (!v || !hero || !("IntersectionObserver" in window)) return;

    v.play().catch(()=>{});
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=> e.isIntersecting ? v.play().catch(()=>{}) : v.pause());
    }, { threshold: 0.25 });
    io.observe(hero);
  })();


(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.labelTree = GG.modules.labelTree || (function(){
    var shared = { loaded:false, loading:false, map:null, promise:null };

    function getCfg(root){
      var cfg = (GG.store && GG.store.config) ? GG.store.config : {};
      var maxPosts = parseInt(cfg.maxPosts || (root && root.getAttribute('data-max-posts')) || '10', 10);
      if (!isFinite(maxPosts) || maxPosts <= 0) maxPosts = 10;
      var filter = Array.isArray(cfg.searchLabels) ? cfg.searchLabels.filter(Boolean) : null;
      return { maxPosts: maxPosts, filter: filter };
    }

    function pickAltLink(entry){
      var links = entry && entry.link ? entry.link : [];
      for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'alternate' && links[i].href) return links[i].href;
      }
      return '';
    }

    function buildMap(entries){
      var map = Object.create(null);
      (entries || []).forEach(function(entry){
        var cats = entry && entry.category ? entry.category : [];
        if (!cats || !cats.length) return;
        var title = (entry.title && entry.title.$t) || 'Untitled';
        var url = pickAltLink(entry);
        if (!url) return;
        for (var i = 0; i < cats.length; i++) {
          var term = cats[i] && cats[i].term ? cats[i].term : '';
          if (!term) continue;
          if (!map[term]) map[term] = [];
          map[term].push({ title: title, url: url });
        }
      });
      var keys = Object.keys(map);
      keys.forEach(function(label){
        var seen = Object.create(null);
        map[label] = map[label].filter(function(p){
          var key = (p && p.url) ? p.url : '';
          if (!key || seen[key]) return false;
          seen[key] = 1;
          return true;
        });
      });
      return map;
    }

    function sortLabels(list){
      return list.sort(function(a, b){
        a = String(a || '').toLowerCase();
        b = String(b || '').toLowerCase();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
    }

    function normalizeUrl(u){
      return String(u || '').split('#')[0].replace(/\/$/,'');
    }

    function escapeHtml(str){
      return String(str || '').replace(/[&<>"']/g, function(m){
        return ({'&':'\u0026amp;','<':'\u0026lt;','>':'\u0026gt;','"':'\u0026quot;',"'":'\u0026#39;'}[m]);
      });
    }

    function labelListForRoot(state){
      if (!shared.map) return [];
      var labels = Object.keys(shared.map).filter(Boolean);
      labels = sortLabels(labels);
      if (state.filter && state.filter.length) {
        var labelMap = {};
        labels.forEach(function(l){ labelMap[String(l).toLowerCase()] = l; });
        var filtered = [];
        state.filter.forEach(function(l){
          var key = String(l).toLowerCase();
          if (labelMap[key]) filtered.push(labelMap[key]);
        });
        if (filtered.length) labels = filtered;
      }
      return labels;
    }

    function getActiveLabel(){
      var main = d.querySelector('main.gg-main[data-gg-surface="post"]') || d.querySelector('main.gg-main[data-gg-surface="page"]');
      if (main) {
        var post = main.querySelector('article.gg-post') || main.querySelector('.post');
        if (post) {
          var links = post.querySelectorAll('.post-labels a[rel="tag"]');
          for (var i = 0; i < links.length; i++) {
            var t = (links[i].textContent || '').trim();
            if (t) return t;
          }
          var a = post.querySelector('.gg-post__label-link[href*="/search/label/"]');
          if (a && a.textContent) return a.textContent.trim();
        }
      }

      var head = d.querySelector('.gg-post__label-link[href*="/search/label/"]');
      if (head && head.textContent) return head.textContent.trim();
      var bc = d.querySelector('.gg-post__breadcrumbs a[href*="/search/label/"]');
      if (bc && bc.textContent) return bc.textContent.trim();
      var foot = d.querySelector('.gg-post__labels a[href*="/search/label/"]');
      if (foot && foot.textContent) return foot.textContent.trim();
      return '';
    }

    function getActivePostUrl(){
      return normalizeUrl(w.location.href);
    }

    function shouldAutoOpen(root){
      var mode = root.getAttribute('data-gg-labeltree');
      return (mode === 'detail' || mode === 'post');
    }

    function clearActive(treeEl){
      if (!treeEl) return;
      var current = treeEl.querySelectorAll('[data-gg-state~="current"]');
      for (var i = 0; i < current.length; i++) {
        GG.core.state.remove(current[i], 'current');
      }
      var actives = treeEl.querySelectorAll('[data-gg-state~="active"]');
      for (var j = 0; j < actives.length; j++) {
        GG.core.state.remove(actives[j], 'active');
      }
    }

    function setNodeOpen(node, open){
      GG.core.state.toggle(node, 'open', open);
      var row = node.querySelector('.gg-lt__row');
      if (row) row.setAttribute('aria-expanded', open ? 'true' : 'false');
      var folder = node.querySelector('.gg-lt__folder');
      if (folder) folder.textContent = open ? 'folder_open' : 'folder';
    }

    function renderPosts(state, node, label){
      var ul = node.querySelector('.gg-lt__children');
      if (!ul) return;
      ul.innerHTML = '';
      var posts = (shared.map && shared.map[label]) ? shared.map[label] : [];
      posts = posts.slice(0, state.maxPosts || 10);
      if (!posts.length) {
        ul.innerHTML = '<li class="gg-lt__muted" role="presentation">No posts</li>';
        return;
      }
      posts.forEach(function(p){
        var li = d.createElement('li');
        li.className = 'gg-lt__post';
        li.setAttribute('role', 'none');
        li.innerHTML =
          '<a href="'+p.url+'" role="treeitem">' +
            '<span class="material-symbols-rounded gg-lt__doc" aria-hidden="true">article</span>' +
            '<span>'+escapeHtml(p.title)+'</span>' +
          '</a>';
        ul.appendChild(li);
      });
      var activeUrl = getActivePostUrl();
      var links = ul.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) {
        if (normalizeUrl(links[i].href) === activeUrl) {
          GG.core.state.add(links[i], 'active');
        }
      }
    }

    function toggleNode(state, node){
      var label = node.getAttribute('data-label');
      if (!label) return;
      var isOpen = GG.core.state.has(node, 'open');
      if (isOpen) {
        setNodeOpen(node, false);
        return;
      }
      setNodeOpen(node, true);
      renderPosts(state, node, label);
    }

    function renderLabels(root, state){
      var treeEl = state.tree;
      if (!treeEl) return;
      var labels = labelListForRoot(state);
      if (!labels.length) {
        treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">No labels found</li>';
        return;
      }
      treeEl.innerHTML = '';
      labels.forEach(function(label){
        var node = d.createElement('li');
        node.className = 'gg-lt__node';
        node.setAttribute('data-label', label);
        node.setAttribute('role', 'treeitem');
        node.setAttribute('aria-expanded', 'false');
        node.innerHTML =
          '<button class="gg-lt__row" type="button" aria-expanded="false">' +
            '<span class="material-symbols-rounded gg-lt__folder" aria-hidden="true">folder</span>' +
            '<span class="gg-lt__labeltxt">'+escapeHtml(label)+'</span>' +
          '</button>' +
          '<ul class="gg-lt__children" role="group"></ul>';
        treeEl.appendChild(node);
      });
    }

    function applyActive(root, state){
      var treeEl = state.tree;
      if (!treeEl) return;
      clearActive(treeEl);
      var activeLabel = getActiveLabel();
      if (!activeLabel) return;
      var nodes = Array.prototype.slice.call(treeEl.querySelectorAll('.gg-lt__node'));
      var match = nodes.find(function(n){
        return (n.getAttribute('data-label') || '').toLowerCase() === activeLabel.toLowerCase();
      });
      if (!match) return;
      GG.core.state.add(match, 'current');
      var row = match.querySelector('.gg-lt__row');
      if (row) GG.core.state.add(row, 'current');
      if (shouldAutoOpen(root)) {
        setNodeOpen(match, true);
        renderPosts(state, match, match.getAttribute('data-label') || '');
      }
    }

    function setPanel(state, open){
      state.panelOpen = open;
      GG.core.state.toggle(state.root, 'collapsed', !open);
      if (state.headBtn) state.headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (state.panelBtn) {
        state.panelBtn.setAttribute('aria-label', open ? 'Collapse panel' : 'Expand panel');
        var icon = state.panelBtn.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = open ? 'collapse_content' : 'expand_content';
      }
    }

    function bindEvents(state){
      if (state.bound) return;
      state.bound = true;
      state.root.addEventListener('click', function(e){
        if (e.target.closest('.gg-lt__headbtn') || e.target.closest('.gg-lt__panelbtn')) {
          setPanel(state, !state.panelOpen);
          return;
        }
        var row = e.target.closest('.gg-lt__row');
        if (row && state.root.contains(row)) {
          var node = row.closest('.gg-lt__node');
          if (node) toggleNode(state, node);
        }
      });
      state.root.addEventListener('keydown', function(e){
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var row = e.target.closest('.gg-lt__row');
        if (row) {
          e.preventDefault();
          var node = row.closest('.gg-lt__node');
          if (node) toggleNode(state, node);
        }
      });
    }

    function loadData(maxResults){
      if (shared.promise) return shared.promise;
      shared.loading = true;
      var params = { summary: true, 'max-results': maxResults || 500 };
      shared.promise = GG.services.api.getFeed(params).then(function(json){
        var entries = (json && json.feed && json.feed.entry) ? json.feed.entry : [];
        shared.map = buildMap(entries);
        shared.loaded = true;
        shared.loading = false;
        return shared;
      }).catch(function(err){
        shared.loading = false;
        shared.map = null;
        shared.promise = null;
        throw err;
      });
      return shared.promise;
    }

    function init(root){
      var roots = root ? [root] : Array.prototype.slice.call(d.querySelectorAll('.gg-labeltree[data-gg-module="labeltree"]'));
      if (!roots.length) return;
      roots.forEach(function(el){
        if (!el) return;
        var treeEl = el.querySelector('.gg-lt__tree');
        if (!treeEl) return;

        var state = el.__ggLabelTree || {};
        el.__ggLabelTree = state;
        state.root = el;
        state.tree = treeEl;
        state.headBtn = el.querySelector('.gg-lt__headbtn');
        state.panelBtn = el.querySelector('.gg-lt__panelbtn');
        state.panelOpen = (state.panelOpen !== false);

        var cfg = getCfg(el);
        state.maxPosts = cfg.maxPosts;
        state.filter = cfg.filter;

        bindEvents(state);
        setPanel(state, state.panelOpen);

        if (shared.loaded && shared.map) {
          renderLabels(el, state);
          applyActive(el, state);
          return;
        }

        treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">Loading labels...</li>';
        loadData(500).then(function(){
          renderLabels(el, state);
          applyActive(el, state);
        }).catch(function(){
          treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">Unable to load labels</li>';
        });
      });
    }

    function refresh(root){
      init(root);
    }

    return { init: init, refresh: refresh };
  })();
})(window.GG = window.GG || {}, window, document);
// [END LABELTREE MODULE]

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.breadcrumbs = GG.modules.breadcrumbs || (function(){
    function text(el){
      return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim();
    }
    function setHomeLinks(nav){
      if (!nav) return;
      var homeLanding = nav.querySelector('.gg-post__breadcrumbs-link--home') || nav.querySelector('.breadcrumbs__link--home');
      if (homeLanding) homeLanding.setAttribute('href', '/');

      var links = Array.prototype.slice.call(nav.querySelectorAll('a.gg-post__breadcrumbs-link'));
      var blogLink = null;
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (a === homeLanding) continue;
        var href = a.getAttribute('href') || '';
        if (href.indexOf('gg-home-blog-anchor') !== -1) { blogLink = a; break; }
      }
      if (!blogLink) {
        for (var j = 0; j < links.length; j++) {
          var b = links[j];
          if (b === homeLanding) continue;
          var href2 = b.getAttribute('href') || '';
          if (href2.indexOf('/search/label/') !== -1) continue;
          if (b.classList.contains('gg-post__breadcrumbs-link--label')) continue;
          blogLink = b;
          break;
        }
      }
      if (blogLink) {
        blogLink.setAttribute('href', '/?view=blog');
        if (!blogLink.__ggBlogBound) {
          blogLink.__ggBlogBound = true;
          blogLink.addEventListener('click', function(e){
            if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
              e.preventDefault();
              GG.core.router.go('/?view=blog');
            }
          });
        }
      }
    }
    function labelFromUrl(){
      try {
        var u = new URL(w.location.href);
        var m = u.pathname.match(/\/search\/label\/([^/]+)/i);
        if (m && m[1]) return decodeURIComponent(m[1]).replace(/\+/g, ' ');
      } catch (_) {}
      return '';
    }
    function init(root){
      var scope = (root && root.querySelector) ? root : d;
      if (scope.querySelector('.gg-tags-page')) return;
      var nav = scope.querySelector('nav.gg-post__breadcrumbs') || scope.querySelector('nav.breadcrumbs.gg-post__breadcrumbs');
      if (!nav) return;
      setHomeLinks(nav);
      var current = nav.querySelector('.gg-post__breadcrumbs-current') || nav.querySelector('.breadcrumbs__current');
      var titleEl = scope.querySelector('.gg-post__title') || scope.querySelector('h1');
      var title = text(titleEl) || d.title || '';
      if (current && title) current.textContent = title;

      var labelSrc = scope.querySelector('.gg-post__label-link[href*="/search/label/"]') ||
                     scope.querySelector('.post-labels a[rel="tag"]') ||
                     scope.querySelector('.gg-post__labels a[href*="/search/label/"]');
      var labelLink = nav.querySelector('.gg-post__breadcrumbs-link[href*="/search/label/"]') ||
                      nav.querySelector('.gg-post__breadcrumbs-link--label');
      var labelText = labelSrc ? text(labelSrc) : '';
      if (!labelText) labelText = labelFromUrl();
      if (labelLink && labelText) {
        var labelSpan = labelLink.querySelector('.gg-post__breadcrumbs-label') || labelLink;
        labelSpan.textContent = labelText;
        if (labelSrc && labelSrc.getAttribute('href')) {
          labelLink.setAttribute('href', labelSrc.getAttribute('href'));
        }
      }
    }
    return { init: init };
  })();
  GG.modules.breadcrumb = GG.modules.breadcrumbs;
})(window.GG = window.GG || {}, window, document);

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.readTime = GG.modules.readTime || (function(){
    var WPM = 200;
    function findBody(scope){
      return scope.querySelector('.gg-post__content.post-body.entry-content') ||
             scope.querySelector('.post-body.entry-content') ||
             scope.querySelector('.entry-content') ||
             scope.querySelector('[itemprop="articleBody"]') ||
             scope.querySelector('.post-body');
    }
    function compute(text){
      var raw = String(text || '').replace(/\s+/g,' ').trim();
      if (!raw) return '';
      var words = raw.split(' ').filter(Boolean).length;
      var mins = Math.max(1, Math.round(words / WPM));
      return mins + ' minutes read';
    }
    function init(root){
      var scope = (root && root.querySelector) ? root : d;
      var body = findBody(scope);
      if (!body) return;
      var label = compute(body.innerText || body.textContent || '');
      if (!label) return;
      var slots = scope.querySelectorAll('[data-slot="readtime"]');
      for (var i = 0; i < slots.length; i++) {
        slots[i].textContent = label;
      }
    }
    return { init: init };
  })();
})(window.GG = window.GG || {}, window, document);

(function(){
  var root = document.getElementById('gg-toc');
  if(!root) return;

  // prevent double init
  if(root.dataset.ggInit === '1') return;
  root.dataset.ggInit = '1';

  var list = root.querySelector('.gg-toc__list');
  var empty = root.querySelector('.gg-toc__empty');
  var headBtn = root.querySelector('.gg-toc__headbtn');
  var toggleBtn = root.querySelector('.gg-toc__toggle');
  var io = null;

  function qs(sel, scope){ return (scope || document).querySelector(sel); }
  function qsa(sel, scope){ return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function txt(el){ return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim(); }

  function setCollapsed(collapsed){
    GG.core.state.toggle(root, 'collapsed', collapsed);
    if(headBtn) headBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if(toggleBtn){
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expand' : 'Collapse');
      var i = toggleBtn.querySelector('.material-symbols-rounded');
      if(i) i.textContent = collapsed ? 'expand_content' : 'collapse_content';
    }
  }

  function getOffset(){
    var off = parseInt(root.getAttribute('data-scroll-offset') || '84', 10);
    return isFinite(off) ? off : 84;
  }

  function findPostBody(){
    // sesuai struktur kamu
    return qs('.gg-post__content.post-body.entry-content') ||
           qs('.post-body.entry-content') ||
           qs('.entry-content') ||
           qs('[itemprop="articleBody"]') ||
           qs('.post-body');
  }

  function slugify(s){
    return String(s||'')
      .toLowerCase()
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g,'')
      .replace(/[^\w\s\-]/g,'')
      .replace(/\s+/g,'-')
      .replace(/\-+/g,'-')
      .replace(/^\-+|\-+$/g,'') || 'section';
  }

  function ensureId(h){
    if(h.id && document.getElementById(h.id) === h) return h.id;
    var base = slugify(txt(h));
    var id = base;
    var i = 2;
    while(document.getElementById(id)) id = base + '-' + (i++);
    h.id = id;
    return id;
  }

  function getLevel(h){
    var t = (h.tagName || 'H2').toLowerCase();
    return t === 'h2' ? 2 : (t === 'h3' ? 3 : 4);
  }

  // numbering: h2 "1.", h3 "1.1", h4 "1.1.1"
  function nextNumber(level, state){
    if(level === 2){
      state.c2++; state.c3 = 0; state.c4 = 0;
      return String(state.c2) + '.';
    }
    if(level === 3){
      if(state.c2 === 0) state.c2 = 1;
      state.c3++; state.c4 = 0;
      return state.c2 + '.' + state.c3;
    }
    if(state.c2 === 0) state.c2 = 1;
    if(state.c3 === 0) state.c3 = 1;
    state.c4++;
    return state.c2 + '.' + state.c3 + '.' + state.c4;
  }

  function setActiveById(id){
    qsa('.gg-toc__item', list).forEach(function(x){ GG.core.state.remove(x, 'active'); });
    if(!id) return;

    var a = list.querySelector('a.gg-toc__link[href="#' + id.replace(/"/g,'') + '"]');
    if(!a) return;

    var li = a.closest('.gg-toc__item');
    if(li){
      GG.core.state.add(li, 'active');
      a.scrollIntoView({ block:'nearest' });
    }
  }

  function setupScrollSpy(headings){
    if(io && io.disconnect) io.disconnect();
    io = null;
    if(!('IntersectionObserver' in window)) return;

    var offset = getOffset();
    var lastActive = '';

    io = new IntersectionObserver(function(entries){
      var visible = entries.filter(function(e){ return e.isIntersecting; });
      if(!visible.length) return;

      visible.sort(function(a,b){ return a.boundingClientRect.top - b.boundingClientRect.top; });
      var id = visible[0].target && visible[0].target.id;
      if(!id || id === lastActive) return;
      lastActive = id;

      setActiveById(id);
    }, {
      root: null,
      rootMargin: ('-' + (offset+8) + 'px 0px -70% 0px'),
      threshold: [0.01, 0.1, 0.2]
    });

    headings.forEach(function(h){ io.observe(h); });
  }

  function build(){
    list.innerHTML = '';
    empty.hidden = true;

    var body = findPostBody();
    if(!body) return false;

    var sel = (root.getAttribute('data-headings') || 'h2,h3')
      .split(',').map(function(x){ return x.trim(); }).filter(Boolean).join(',');

    var headings = qsa(sel, body).filter(function(h){ return txt(h).length > 0; });

    if(!headings.length){
      empty.hidden = false;
      return true;
    }

    var offset = getOffset();
    var numState = {c2:0, c3:0, c4:0};

    headings.forEach(function(h){
      var id = ensureId(h);
      try{ h.style.scrollMarginTop = offset + 'px'; }catch(_){}

      var level = getLevel(h);
      var num = nextNumber(level, numState);

      var li = document.createElement('li');
      li.className = 'gg-toc__item gg-toc__lvl-' + level;

      var a = document.createElement('a');
      a.className = 'gg-toc__link';
      a.href = '#' + id;

      var n = document.createElement('span');
      n.className = 'gg-toc__num';
      n.textContent = num;

      var t = document.createElement('span');
      t.className = 'gg-toc__txt';
      t.textContent = txt(h);

      a.appendChild(n);
      a.appendChild(t);
      li.appendChild(a);
      list.appendChild(li);
    });

    setupScrollSpy(headings);

    // set active by hash if exists
    var hash = (location.hash || '').replace('#','');
    if(hash && document.getElementById(hash)){
      setActiveById(hash);
      // ensure jump to section even though IDs are created at runtime
      var target = document.getElementById(hash);
      if(target){
        var y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    }

    return true;
  }

  function boot(){
    var tries = 0;
    var max = 80; // 80 x 100ms = 8 detik

    (function tick(){
      tries++;
      var ok = build();
      if(ok) return;

      if(tries >= max){
        empty.hidden = false;
        return;
      }
      setTimeout(tick, 100);
    })();
  }

  // collapse/expand panel
  root.addEventListener('click', function(e){
    if(e.target.closest('.gg-toc__headbtn') || e.target.closest('.gg-toc__toggle')){
      setCollapsed(!GG.core.state.has(root, 'collapsed'));
      return;
    }
  });

  // smooth scroll with offset
  list.addEventListener('click', function(e){
    var a = e.target.closest('a.gg-toc__link');
    if(!a) return;

    var id = (a.getAttribute('href') || '').replace('#','');
    var target = id ? document.getElementById(id) : null;
    if(!target) return;

    e.preventDefault();

    var y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);

    setActiveById(id);
  });

  setCollapsed(false);
  boot();
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
  function desiredHomeStateFromPath(pathname){
    var path = stripBase(pathname || location.pathname || '/');
    if (path === '/' || path === '') return 'landing';
    if (/^\/blog\/?$/.test(path)) return 'blog';
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
    desired = GG.util.homeRouter.desiredHomeStateFromPath(location.pathname);
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
        next = GG.util.homeRouter.desiredHomeStateFromPath(location.pathname);
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
    if (searchInput){
      try { searchInput.focus(); } catch(e){}
    }
    scheduleWidthUpdate();
  }

  function exitSearch(){
    if (!isSearchMode) return;
    isSearchMode = false;
    GG.core.state.remove(dockEl, 'search');
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

  // Untuk dock: semua NON-home dianggap "blog mode"
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

    // HOME &#8594; landing hero
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

    // BLOG &#8594; blog sheet
    if (action === 'home-blog') {
      evt.preventDefault();
      if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
        GG.core.router.go('/?view=blog');
      } else {
        window.location.href = '/?view=blog';
      }
      return;
    }

    // SEARCH &#8594; pakai search bawaan Blogger
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

    // CONTACT: selalu tampil; di landing -> pindah ke landing lalu scroll; di luar home -> balik ke homepage + anchor
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

    // fallback: cuma scroll ke anchor
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

  function sharePost(article){
    var title = text(qs('.gg-post__title', article)) || document.title;
    var url = location.href;
      if (window.GG && GG.modules && GG.modules.shareSheet && typeof GG.modules.shareSheet.open === 'function' && GG.util && typeof GG.util.getMetaFromElement === 'function'){
        var meta = GG.util.getMetaFromElement(article);
        if (meta) { GG.modules.shareSheet.open(meta); return; }
      }
      if(navigator.share){
        navigator.share({ title:title, url:url }).catch(function(){});
        return;
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(function(){ showToast('Link copied'); });
      }
    }

    function posterPost(article){
      if (window.GG && GG.modules && GG.modules.poster && typeof GG.modules.poster.shareFromArticle === 'function') {
        GG.modules.poster.shareFromArticle(article);
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

  // bind once (kalau init kepanggil 2x, toggle jadi “batal” dan terasa nggak bisa nutup)
  if(bar.__ggBound) return;
  bar.__ggBound = true;

  var rightSidebar   = qs('.gg-blog-sidebar--right', main);
  var commentsPanel  = rightSidebar ? qs('[data-gg-panel="comments"]', rightSidebar) : null;
  var infoPanelRight = rightSidebar ? qs('[data-gg-panel="info"]', rightSidebar) : null;

  // move comments into right sidebar panel (once)
  var comments     = qs('.gg-post__comments', article);
  var commentsSlot = rightSidebar ? qs('[data-gg-panel="comments"] [data-gg-slot="comments"]', rightSidebar) : null;
  if(comments && commentsSlot && !comments.__ggMoved){
    commentsSlot.appendChild(comments);
    comments.__ggMoved = true;
  }

  // -------- toolbar helpers --------
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

  // -------- SINGLE SOURCE OF TRUTH (attributes) --------
  function leftState(){ return main.getAttribute('data-gg-left-panel') || 'closed'; }
  function rightState(){ return main.getAttribute('data-gg-info-panel') || 'closed'; }
  function rightMode(){ return main.getAttribute('data-gg-right-mode') || ''; }

  function setLeftState(state){
    main.setAttribute('data-gg-left-panel', state);
    if(GG.modules.Panels && GG.modules.Panels.setLeft) GG.modules.Panels.setLeft(state);
  }
  function setRightState(state){
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
      // hilangkan hash tanpa bikin scroll jump
      history.replaceState(null, document.title, location.pathname + location.search);
    }
  }

  // -------- left panel (info) --------
  function setLeft(open){
    setLeftState(open ? 'open' : 'closed');
    applyFromAttrs();
  }

  // -------- right panel (comments) --------
  function showRightPanel(mode){
    var useMode = mode || 'comments';
    setRightMode(useMode);
    setRightState('open');
    applyFromAttrs();
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

  // -------- focus mode (native restore) --------
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

  // -------- initial deep link: open comments if hash points to comments/comment id --------
  (function(){
    // default close
    hideRightPanel();
    setLeft(leftState() === 'open');
    ensurePosterButton();

    var h = location.hash || '';
    if(h === '#comments' || /^#c\d+/.test(h)){
      showRightPanel('comments');
    }
  })();

  // -------- events (capture + stopImmediatePropagation => ngalahin handler lain yang mungkin masih nyangkut) --------
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
      setLeft(leftState() !== 'open');
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
      attributeFilter: ['data-gg-left-panel','data-gg-info-panel','data-gg-right-mode']
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
  var WPM = 200;
  var lastTrigger = null;
  var closeObserver = null;
  var backdrop = null;

  // in-memory cache { url: { ts, tocItems, snippet, readtime } }
  var cache = Object.create(null);
  var inflight = null; // AbortController

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

  function ensureBackdrop(){
    if (backdrop) return backdrop;
    backdrop = document.querySelector('.gg-infopanel-backdrop');
    if (backdrop){
      if (!backdrop.__ggInfoBound){
        backdrop.__ggInfoBound = true;
        backdrop.addEventListener('click', function(e){
          var surface = main ? main.getAttribute('data-gg-surface') : '';
          if(surface !== 'home' && surface !== 'feed') return;
          if(!main || main.getAttribute('data-gg-info-panel') !== 'open') return;
          e.preventDefault();
          handleClose();
        });
      }
      return backdrop;
    }
    backdrop = document.createElement('div');
    backdrop.className = 'gg-infopanel-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);';
    document.body.appendChild(backdrop);
    if (!backdrop.__ggInfoBound){
      backdrop.__ggInfoBound = true;
      backdrop.addEventListener('click', function(e){
        var surface = main ? main.getAttribute('data-gg-surface') : '';
        if(surface !== 'home' && surface !== 'feed') return;
        if(!main || main.getAttribute('data-gg-info-panel') !== 'open') return;
        e.preventDefault();
        handleClose();
      });
    }
    return backdrop;
  }

  function setBackdropVisible(show){
    var bd = ensureBackdrop();
    if (!bd) return;
    GG.core.state.toggle(bd, 'visible', !!show);
  }

  function ensurePanelSkeleton(){
    if (!panel) return;
    if (qs('.gg-info-panel__head', panel)) return;

    panel.innerHTML =
  '<div class="gg-info-panel__card">' +

    '<div class="gg-info-panel__thumb gg-info-panel__hero">' +
      '<img class="gg-info-panel__thumb-img" alt=""/>' +
      '<div class="gg-info-panel__scrim" aria-hidden="true"></div>' +

      '<div class="gg-info-panel__herohead">' +
        '<div class="gg-info-panel__herohead-left">' +
          '<span aria-hidden="true" class="gg-icon material-symbols-rounded">info</span>' +
          '<span class="gg-info-panel__herotitle-sm">Information</span>' +
        '</div>' +
        '<button class="gg-info-panel__close" type="button" data-gg-action="info-close" aria-label="Close">×</button>' +
      '</div>' +

      '<div class="gg-info-panel__hero-title"></div>' +

      '<a class="gg-info-panel__hero-cta" href="#">' +
        '<span class="gg-icon material-symbols-rounded" aria-hidden="true">visibility</span>' +
        '<span>Read this post</span>' +
      '</a>' +
    '</div>' +

    '<div class="gg-info-panel__details">' +
      '<div class="gg-info-panel__sec" data-gg-sec="author">' +
        '<div class="gg-info-panel__sechead">' +
          '<span class="gg-icon material-symbols-rounded" aria-hidden="true">person</span>' +
          '<div class="gg-info-panel__kicker">Written by</div>' +
        '</div>' +
        '<div class="gg-info-panel__people" data-gg-slot="author"></div>' +
      '</div>' +

      '<div class="gg-info-panel__sec" data-gg-sec="contributors" hidden>' +
        '<div class="gg-info-panel__sechead">' +
          '<span class="gg-icon material-symbols-rounded" aria-hidden="true">groups</span>' +
          '<div class="gg-info-panel__kicker">Contributors</div>' +
        '</div>' +
        '<div class="gg-info-panel__people" data-gg-slot="contributors"></div>' +
      '</div>' +

'<div class="gg-info-panel__row gg-info-panel__row--labels" hidden>' +
  '<span class="gg-icon" aria-hidden="true">label</span>' +
  '<div class="gg-chip-row" data-gg-slot="labels"></div>' +
'</div>' +



      '<div class="gg-info-panel__row gg-info-panel__row--tags" hidden>' +
        '<span class="gg-icon material-symbols-rounded" aria-hidden="true">sell</span>' +
        '<div class="gg-chip-row" data-gg-slot="tags"></div>' +
      '</div>' +

'<div class="gg-info-panel__meta gg-info-panel__meta--icons">' +

  '<span class="gg-info-panel__metaitem">' +
    '<span class="gg-icon" aria-hidden="true">calendar_today</span>' +
    '<span class="gg-info-panel__date"></span>' +
  '</span>' +

  '<span class="gg-meta-sep">•</span>' +

  '<span class="gg-info-panel__metaitem">' +
    '<span class="gg-icon" aria-hidden="true">comment</span>' +
    '<span class="gg-info-panel__comments"></span>' +
  '</span>' +

  '<span class="gg-meta-sep">•</span>' +

  '<span class="gg-info-panel__metaitem">' +
    '<span class="gg-icon" aria-hidden="true">schedule</span>' +
    '<span class="gg-info-panel__readtime"></span>' +
  '</span>' +

'</div>' +




      '<div class="gg-info-panel__row gg-info-panel__row--snippet">' +
'<span class="gg-icon" aria-hidden="true">text_snippet</span>' +
        '<p class="gg-info-panel__snippet"></p>' +
      '</div>' +

      '<div class="gg-info-panel__sec gg-info-panel__sec--toc">' +
        '<div class="gg-info-panel__sechead">' +
          '<span class="gg-icon material-symbols-rounded" aria-hidden="true">format_list_bulleted</span>' +
          '<div class="gg-info-panel__kicker">Table of Contents</div>' +
        '</div>' +
        '<ol class="gg-info-panel__toclist" data-gg-slot="toc"></ol>' +
         '<div class="gg-info-panel__toc-empty" data-gg-slot="toc-empty" hidden></div>' +
      '</div>' +
    '</div>' +

  '</div>';
  }

function extractThumbSrc(card){
  var img = qs('.gg-post-card__thumb-img', card);
  if (img) {
    return (
      img.currentSrc ||
      img.src ||
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-lazy-src') ||
      img.getAttribute('data-original') ||
      ''
    ).trim();
  }

  // fallback: background-image on wrapper
  var thumb = qs('.gg-post-card__thumb', card);
  if (thumb) {
    var bg = (thumb.style.backgroundImage || getComputedStyle(thumb).backgroundImage || '');
    var m = bg.match(/url\((['"]?)(.*?)\1\)/);
    if (m && m[2]) return m[2];
  }

  return '';
}


  function setText(sel, val){
    var el = qs(sel, panel);
    if (el) el.textContent = val || '';
  }

  function setHref(sel, val){
    var el = qs(sel, panel);
    if (el) el.setAttribute('href', val || '#');
  }

  function setImg(src, alt){
      var img = qs('.gg-info-panel__thumb-img', panel);
      if(!img) return;
      var wrap = closest(img, '.gg-info-panel__thumb') || img.parentElement;
      if(!wrap) return;
      if(!src){
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

  function setSectionVisible(name, visible){
    var sec = qs('[data-gg-sec="'+name+'"]', panel);
    if (sec) sec.hidden = !visible;
  }

  function setRowVisible(rowClass, visible){
    var row = qs(rowClass, panel);
    if (row) row.hidden = !visible;
  }

  function initials(name){
    name = (name||'').trim();
    if(!name) return '?';
    var parts = name.split(/\s+/).filter(Boolean);
    var a = parts[0] ? parts[0][0] : '';
    var b = parts.length > 1 ? parts[parts.length-1][0] : '';
    return (a + b).toUpperCase() || '?';
  }

  function renderPeople(slot, people){
    var wrap = qs('[data-gg-slot="'+slot+'"]', panel);
    if(!wrap) return;
    wrap.innerHTML = '';

    (people || []).forEach(function(p){
      var row = document.createElement('div');
      row.className = 'gg-info-person';

      var av = document.createElement('div');
      av.className = 'gg-info-person__avatar';

      if(p.avatar){
        av.style.backgroundImage = 'url(' + p.avatar + ')';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.textContent = '';
      }else{
        av.textContent = initials(p.name);
      }

      var meta = document.createElement('div');
      meta.className = 'gg-info-person__meta';

      var nm = document.createElement('div');
      nm.className = 'gg-info-person__name';
      nm.textContent = p.name || 'Unknown';

      var rl = document.createElement('div');
      rl.className = 'gg-info-person__role';
      rl.textContent = p.role || '';
      rl.style.display = p.role ? '' : 'none';

      meta.appendChild(nm);
      meta.appendChild(rl);

      row.appendChild(av);
      row.appendChild(meta);

      if(p.href){
        var a = document.createElement('a');
        a.href = p.href;
        a.appendChild(row);
        wrap.appendChild(a);
      }else{
        wrap.appendChild(row);
      }
    });

    if(!people || !people.length){
      wrap.innerHTML =
        '<div class="gg-info-person">' +
          '<div class="gg-info-person__avatar">?</div>' +
          '<div class="gg-info-person__meta"><div class="gg-info-person__name">Unknown</div></div>' +
        '</div>';
    }
  }

function fillChipsToSlot(slot, items, max){
  var chipRow = qs('[data-gg-slot="'+slot+'"]', panel);
  if (!chipRow) return;

  chipRow.innerHTML = '';

  (items || []).slice(0, max || 12).forEach(function (x) {
    var a = document.createElement('a');
    a.className = 'gg-chip';
    a.href = x.href || '#';

    // folder icon INSIDE chip for labels
    if (slot === 'labels') {
      var ic = document.createElement('span');
      ic.className = 'gg-icon gg-chip__icon';
      ic.setAttribute('aria-hidden','true');
      ic.textContent = 'folder_open';
      a.appendChild(ic);
    }

    var tx = document.createElement('span');
    tx.className = 'gg-chip__text';
    tx.textContent = x.text || '';
    a.appendChild(tx);

    chipRow.appendChild(a);
  });
}




  function slugify(s){
    return String(s||'')
      .toLowerCase()
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g,'')
      .replace(/[^\w\s\-]/g,'')
      .replace(/\s+/g,'-')
      .replace(/\-+/g,'-')
      .replace(/^\-+|\-+$/g,'') || 'section';
  }

  function uniqueIds(items){
    var seen = Object.create(null);
    items.forEach(function(it){
      var base = it.id;
      var k = base;
      var n = 2;
      while(seen[k]){ k = base + '-' + (n++); }
      seen[k] = true;
      it.id = k;
    });
    return items;
  }

  function getLevel(h){
    var t = (h.tagName || 'H2').toLowerCase();
    return t === 'h2' ? 2 : (t === 'h3' ? 3 : 4);
  }

  function nextNumber(level, state){
    if(level === 2){ state.c2++; state.c3 = 0; state.c4 = 0; return String(state.c2) + '.'; }
    if(level === 3){ if(state.c2 === 0) state.c2 = 1; state.c3++; state.c4 = 0; return state.c2 + '.' + state.c3; }
    if(state.c2 === 0) state.c2 = 1;
    if(state.c3 === 0) state.c3 = 1;
    state.c4++; return state.c2 + '.' + state.c3 + '.' + state.c4;
  }

  function renderToc(items, postUrl){  
     var ol = qs('[data-gg-slot="toc"]', panel);
if(!ol) return;
var empty = qs('[data-gg-slot="toc-empty"]', panel); // optional

    if(!ol || !empty) return;

    ol.innerHTML = '';

    if(!items || !items.length){
      empty.textContent = 'No headings found.';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    items.forEach(function(it){
      var li = document.createElement('li');
      li.className = 'gg-info-panel__tocitem gg-info-panel__toclvl-' + it.level;

      var a = document.createElement('a');
      a.className = 'gg-info-panel__toclink';
      a.href = postUrl + '#' + it.id;

      var n = document.createElement('span');
      n.className = 'gg-info-panel__tocnum';
     n.textContent = (it.num || '').trim() + ' ';



      var t = document.createElement('span');
      t.className = 'gg-info-panel__toctxt';
      t.textContent = it.text;

      a.appendChild(n);
      a.appendChild(t);
      li.appendChild(a);
      ol.appendChild(li);
    });
  }

  function computeReadTimeFromText(text){
    var raw = String(text || '').replace(/\s+/g,' ').trim();
    if(!raw) return '—';
    var words = raw.split(' ').filter(Boolean).length;
    var mins = Math.max(1, Math.round(words / WPM));
    return mins + ' minutes read';
  }

  function clipWords(text, maxWords){
    var raw = String(text || '').replace(/\s+/g,' ').trim();
    if(!raw) return '';
    var w = raw.split(' ').filter(Boolean);
    if(w.length <= maxWords) return raw;
    return w.slice(0, maxWords).join(' ') + '…';
  }

  function findBody(doc){
    return qs('.gg-post__content.post-body.entry-content', doc) ||
           qs('.post-body.entry-content', doc) ||
           qs('.post-body', doc) ||
           qs('.entry-content', doc) ||
           qs('[itemprop="articleBody"]', doc);
  }

  function extractHeadingsFromDoc(doc){
    var body = findBody(doc);
    if(!body) return [];
    var hs = qsa('h2, h3, h4', body).filter(function(h){
      return ((h.textContent||'').replace(/\s+/g,' ').trim()).length > 0;
    });

    var out = [];
    var state = {c2:0, c3:0, c4:0};

    hs.forEach(function(h){
      var level = getLevel(h);
      var text = (h.textContent||'').replace(/\s+/g,' ').trim();
      var id = slugify(text);
      var num = nextNumber(level, state);
      out.push({ level: level, text: text, id: id, num: num });
    });

    return uniqueIds(out);
  }

  function extractTextFromDoc(doc, maxWords){
    var body = findBody(doc);
    if(!body) return '';
    // best-effort cleanup
    qsa('script,style,noscript', body).forEach(function(el){ el.remove(); });
    var raw = (body.innerText || body.textContent || '').replace(/\s+/g,' ').trim();
    return maxWords ? clipWords(raw, maxWords) : raw;
  }

  function extractSnippetFromDoc(doc, maxWords){
    var body = findBody(doc);
    if(!body) return '';

    var pick = '';
    var ps = qsa('p', body);
    for(var i=0;i<ps.length;i++){
      var t = (ps[i].textContent||'').replace(/\s+/g,' ').trim();
      if(!t) continue;
      if(t.length < 60) continue;
      if(/^table of contents/i.test(t) || /^daftar isi/i.test(t)) continue;
      pick = t; break;
    }

    if(!pick){
      var lis = qsa('li', body);
      for(var j=0;j<lis.length;j++){
        var t2 = (lis[j].textContent||'').replace(/\s+/g,' ').trim();
        if(!t2) continue;
        if(t2.length < 60) continue;
        pick = t2; break;
      }
    }

    if(!pick){
      pick = (body.innerText || body.textContent || '').replace(/\s+/g,' ').trim();
    }

    return maxWords ? clipWords(pick, maxWords) : pick;
  }

  function getBlogBaseFromUrl(postUrl){
    try{
      var u = new URL(postUrl, location.href);
      return u.origin;
    }catch(_){
      return location.origin || '';
    }
  }

  async function fetchViaHtml(url, signal){
    var res = await fetch(url, { method: 'GET', credentials: 'same-origin', signal: signal });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    var html = await res.text();
    return new DOMParser().parseFromString(html, 'text/html');
  }

  async function fetchViaFeed(postUrl, postId, signal){
    if(!postId) throw new Error('No post id');
    var base = getBlogBaseFromUrl(postUrl);
    var feedBase = (GG.services && GG.services.api && GG.services.api.getFeedBase)
      ? GG.services.api.getFeedBase(false)
      : '/feeds/posts/default';
    var feedUrl = base.replace(/\/$/,'') + feedBase + '/' + encodeURIComponent(postId) + '?alt=json';
    var res = await fetch(feedUrl, { method: 'GET', credentials: 'same-origin', signal: signal });
    if(!res.ok) throw new Error('Feed HTTP ' + res.status);
    var json = await res.json();
    var entry = json && json.entry;
    var html = entry && entry.content && entry.content.$t ? entry.content.$t : '';
    if(!html) throw new Error('No feed content');
    // wrap as doc
    return new DOMParser().parseFromString('<div class="post-body entry-content">' + html + '</div>', 'text/html');
  }

  async function loadPostDoc(postUrl, postId){
    if(inflight && inflight.abort) inflight.abort();
    inflight = new AbortController();
    var signal = inflight.signal;

    // 1) try HTML
    try{
      return await fetchViaHtml(postUrl, signal);
    }catch(err){
      // 2) fallback feed
      return await fetchViaFeed(postUrl, postId, signal);
    }
  }

  function extractLabels(card){
    // prefer hidden anchors rel=tag (kalau kamu sudah tanam di card)
    var tags = qsa('a[rel="tag"]', card).map(function (a) {
      return { text: (a.textContent||'').trim(), href: a.getAttribute('href') || '#' };
    }).filter(function (x) { return x.text; });
    if (tags.length) return tags;

    // fallback: label span
    var lab = qs('.gg-post-card__label', card);
    var t = lab ? (lab.textContent||'').trim() : '';
    return t ? [{ text: t, href: '#' }] : [];
  }

  function extractAuthor(card){
    var name = (card.getAttribute('data-author-name') || '').trim();
    var href = (card.getAttribute('data-author-url') || '').trim();
    var avatar = (card.getAttribute('data-author-avatar') || '').trim();
    if(name) return { name: name, href: href, role: '', avatar: avatar };

    // hard fallback
    return { name: 'Unknown', href: '', role: '', avatar: '' };
  }

  function extractContributors(card){
    var raw = card.getAttribute('data-contributors') || '';
    if(!raw) return [];
    return raw.split(',').map(function(x){ return x.trim(); }).filter(Boolean).map(function(item){
      var parts = item.split('|');
      return { name: (parts[0]||'').trim(), role: (parts[1]||'').trim(), href:'', avatar:'' };
    }).filter(function(p){ return p.name; });
  }

  function extractTags(card){
    var raw = card.getAttribute('data-tags') || '';
    if(!raw) return [];
    return raw.split(',').map(function(t){ return t.trim(); }).filter(Boolean).map(function(t){
      return { text: t.startsWith('#') ? t : ('#'+t), href:'#' };
    });
  }

  function setLoadingState(){
    var empty = qs('[data-gg-slot="toc-empty"]', panel);
    if(empty){ empty.textContent = 'Loading…'; empty.hidden = false; }
    var ol = qs('[data-gg-slot="toc"]', panel);
    if(ol) ol.innerHTML = '';
    setText('.gg-info-panel__readtime', '…');
  }

  function openWithCard(card, trigger){
    ensurePanelSkeleton();
    if (trigger) lastTrigger = trigger;

    var titleLink = qs('.gg-post-card__title-link', card) || qs('a[href]', card);
    var title = titleLink ? (titleLink.textContent||'').trim() : '';
    var href  = titleLink ? (titleLink.getAttribute('href') || '#') : '#';

    var imgSrc = extractThumbSrc(card);


    var dateText = (qs('.gg-post-card__date', card)?.textContent || '').trim();
    var commentsText = (qs('.gg-post-card__meta-item--comments', card)?.textContent || '').trim();

    var labels = extractLabels(card);
labels = (labels || []).filter(function(x){ return x && x.text; });
(function(){
  var seen = Object.create(null);
  labels = labels.filter(function(x){
    var k = String(x.text).toLowerCase();
    if(seen[k]) return false;
    seen[k] = 1;
    return true;
  });
})();

    var primaryLabel = labels[0] ? labels[0].text : '';

    setText('.gg-info-panel__hero-title', title);
    setHref('.gg-info-panel__hero-cta', href);
    setText('.gg-info-panel__date', dateText);
    setText('.gg-info-panel__comments', commentsText);
    setText('.gg-info-panel__readtime', '…');
    setHref('.gg-info-panel__link', href);
    setImg(imgSrc, title);




    // author & placeholder blocks
    var author = extractAuthor(card);
    renderPeople('author', [author]);
    setSectionVisible('author', true);

    var contrib = extractContributors(card);
    renderPeople('contributors', contrib);
    setSectionVisible('contributors', contrib.length > 0);

    // labels row
    if(labels && labels.length){
      fillChipsToSlot('labels', labels, 10);
      setRowVisible('.gg-info-panel__row--labels', true);
    }else{
      setRowVisible('.gg-info-panel__row--labels', false);
    }

    // tags section
    var tags = extractTags(card);
    fillChipsToSlot('tags', tags, 12);
    setRowVisible('.gg-info-panel__row--tags', tags.length > 0);


    // snippet: quick from card (if any)
    var excerptEl = qs('.gg-post-card__excerpt', card);
    var quickSnippet = (excerptEl ? (excerptEl.textContent || '') : '').replace(/\s+/g,' ').trim();
    if(quickSnippet){
      setText('.gg-info-panel__snippet', quickSnippet);
      setRowVisible('.gg-info-panel__row--snippet', true);
    }else{
      setText('.gg-info-panel__snippet', '');
      setRowVisible('.gg-info-panel__row--snippet', false);
    }

    // TOC async load
    setLoadingState();
    hydrateFromPost(href, card.getAttribute('data-id') || '');

    if (panel) panel.hidden = false;
    setBackdropVisible(true);
    if (GG.modules.Panels && GG.modules.Panels.setRight) {
      GG.modules.Panels.setRight('open');
    } else if (main) {
      main.setAttribute('data-gg-info-panel', 'open');
    }
    var closeBtn = qs('.gg-info-panel__close', panel);
    if (closeBtn && closeBtn.focus) {
      try { closeBtn.focus({ preventScroll: true }); } catch(_) {}
    } else if (panel && panel.focus) {
      panel.setAttribute('tabindex', '-1');
      try { panel.focus({ preventScroll: true }); } catch(_) {}
    }
  }

  function handleClose(){
    if (GG.modules.Panels && GG.modules.Panels.setRight) {
      GG.modules.Panels.setRight('closed');
    } else if (main) {
      main.setAttribute('data-gg-info-panel', 'closed');
    }
    if (panel) panel.hidden = true;
    setBackdropVisible(false);
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      try { lastTrigger.focus({ preventScroll: true }); } catch(_) {}
    }
  }

  async function hydrateFromPost(postUrl, postId){
    // cache hit
    var c = cache[postUrl];
    if(c && (Date.now() - c.ts) < 1000 * 60 * 60 * 12){
      if(c.readtime) setText('.gg-info-panel__readtime', c.readtime);
      if(c.snippet){
        setText('.gg-info-panel__snippet', c.snippet);
        setRowVisible('.gg-info-panel__row--snippet', true);
      }
      renderToc(c.tocItems || [], postUrl);
      return;
    }

    try{
      var doc = await loadPostDoc(postUrl, postId);
      var bodyText = extractTextFromDoc(doc);
      var tocItems = extractHeadingsFromDoc(doc);
      var readtime = computeReadTimeFromText(bodyText);
      var snippet = extractSnippetFromDoc(doc, 45);

      cache[postUrl] = { ts: Date.now(), tocItems: tocItems, snippet: snippet, readtime: readtime };

      setText('.gg-info-panel__readtime', readtime);
      if(snippet){
        setText('.gg-info-panel__snippet', snippet);
        setRowVisible('.gg-info-panel__row--snippet', true);
      }
      renderToc(tocItems, postUrl);

    }catch(err){
      var empty = qs('[data-gg-slot="toc-empty"]', panel);
      if(empty){ empty.textContent = 'Failed to load TOC.'; empty.hidden = false; }
      setText('.gg-info-panel__readtime', '—');
    }
  }

  function handleClick(evt){
    var infoBtn = closest(evt.target, '[data-gg-action="info"]');
    if (!infoBtn) return;
    var card = closest(infoBtn, '.gg-post-card');
    if (!card) return;
    evt.preventDefault();
    openWithCard(card, infoBtn);
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
    }
    if (!panel.__ggInfoPanelBound){
      panel.__ggInfoPanelBound = true;
      panel.addEventListener('click', function(e){
        if (closest(e.target, '[data-gg-action="info-close"]')) {
          e.preventDefault();
          handleClose();
        }
      }, true);
    }
    if (!closeObserver && main && window.MutationObserver) {
      closeObserver = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].attributeName === 'data-gg-info-panel') {
            if (main.getAttribute('data-gg-info-panel') === 'closed' && lastTrigger) {
              if (panel) panel.hidden = true;
              setBackdropVisible(false);
              if (typeof lastTrigger.focus === 'function') {
                try { lastTrigger.focus({ preventScroll: true }); } catch(_) {}
              }
            }
          }
        }
      });
      closeObserver.observe(main, { attributes: true, attributeFilter: ['data-gg-info-panel'] });
    }
    ensurePanelSkeleton();
  }

  return { init: init };
})();

// /GAGA PANEL KANAN

  GG.modules.LeftNav = (function () {
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

    function pickIcon(text){
      var key = (text || '').toLowerCase();
      var found = Object.keys(ICON_MAP).find(function(k){ return key.indexOf(k) !== -1; });
      return found ? ICON_MAP[found] : 'description';
    }

    function setWidgetIcon(id, icon){
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-gg-icon', icon);
    }

    function decorateLinks(root){
      qsa('.PageList ul li a, .LinkList ul li a', root).forEach(function (a) {
        a.classList.add('gg-leftnav__link');
        a.setAttribute('data-gg-icon', pickIcon(getText(a)));
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

          var name = getText(link);
          if (name === 'Label 1' || name === 'Label 6') {
            if (!qs(':scope > ul', li)) {
              var childUl = document.createElement('ul');
              ['Post 1 of ' + name, 'Post 2 of ' + name].forEach(function (title, idx) {
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
      skeleton.className = 'gg-skeleton-grid';

      var count = Math.min(8, Math.max(4, list.children.length || 6));
      for(var i=0;i<count;i++){
        skeleton.appendChild(buildCard());
      }

      list.setAttribute('data-gg-skeleton', 'on');
      list.parentNode.insertBefore(skeleton, list);

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
  var GG = window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  var Lite = GG.modules.shortcodesLite = GG.modules.shortcodesLite || {};

  // match: [youtube]...[/youtube]
  const SHORT_RE = /\[youtube\]([\s\S]*?)\[\/youtube\]/gi;

  function extractYouTubeId(input){
    if(!input) return null;
    const s = String(input).trim();

    // Jika user cuma kasih ID 11 char
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

    // youtu.be/ID
    let m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];

    // youtube.com/watch?v=ID
    m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];

    // youtube.com/embed/ID
    m = s.match(/\/embed\/([A-Za-z0-9_-]{11})/i);
    if (m) return m[1];

    // shorts
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
          // kalau URL invalid, jangan diapa-apain biar kamu sadar ada typo
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
        box.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${id}?autoplay=1"
            style="width:100%;height:100%;border:0;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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

(function () {
  function qs(root, sel){ return (root || document).querySelector(sel); }
  function qsa(root, sel){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function setText(el, t){ if (el) el.textContent = t; }
  function esc(s){
    s = (s == null) ? "" : String(s);
    return s.replace(/[&<>"']/g, function (c) {
      return ({ "&":"\u0026amp;","<":"\u0026lt;",">":"\u0026gt;",'"':"\u0026quot;","'":"\u0026#039;" })[c];
    });
  }

  function isYT(item){
    var type = item && item.type ? String(item.type).toLowerCase() : "";
    if (type === "youtube") return true;
    var thumb = item && item.thumb ? String(item.thumb) : "";
    var media = item && item.media ? String(item.media) : "";
    if (thumb.indexOf("i.ytimg.com/vi/") !== -1) return true;
    if (media.indexOf("youtube.com") !== -1 || media.indexOf("youtu.be") !== -1) return true;
    return false;
  }

  function hash32(str){
    str = String(str || "");
    var h = 2166136261;
    for (var i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  function jsonp(url, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    return new Promise(function (resolve, reject) {
      var cb = "ggcb_" + Math.random().toString(36).slice(2);
      var s = document.createElement("script");
      var done = false;

      function cleanup(){
        if (done) return;
        done = true;
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }

      var t = setTimeout(function(){
        cleanup();
        reject(new Error("JSONP timeout"));
      }, timeoutMs);

      window[cb] = function(data){
        clearTimeout(t);
        cleanup();
        resolve(data);
      };

      s.onerror = function(){
        clearTimeout(t);
        cleanup();
        reject(new Error("JSONP blocked (CSP?)"));
      };

      s.src = url + (url.indexOf("?") !== -1 ? "&" : "?") + "callback=" + encodeURIComponent(cb);
      document.body.appendChild(s);
    });
  }

  function initFeed(root){
    if (!root || root.dataset.ggBound === "1") return;
    root.dataset.ggBound = "1";

    var api = root.getAttribute("data-api") || "";
    var grid = qs(root, ".grid");
    var loader = qs(root, ".loader");
    var qInput = qs(root, ".q");
    var btns = qsa(root, "button[data-type]");

    if (!api || !grid || !loader) {
      setText(loader, "Missing data-api / .grid / .loader");
      return;
    }

    var state = {
      type: "all",
      q: "",
      offset: 0,
      limit: 40,
      loading: false,
      done: false,
      maxDom: 250,
      emptySkips: 0,

      // masonry
      cols: null,
      colHeights: null,
      queue: [],
      run: 0,
      lastCols: 0
    };

    function getColCount(){
      if (window.matchMedia("(max-width:560px)").matches) return 1;
      if (window.matchMedia("(max-width:980px)").matches) return 2;
      return 3;
    }

    function ensureCols(){
      var n = getColCount();
      if (state.cols && state.cols.length === n) return;

      grid.innerHTML = "";
      state.cols = [];
      state.colHeights = [];
      state.queue = [];

      for (var i=0;i<n;i++){
        var c = document.createElement("div");
        c.className = "col";
        grid.appendChild(c);
        state.cols.push(c);
        state.colHeights.push(0);
      }
    }

    function weightFromClasses(cls){
      if (cls.indexOf("ar-9x16") !== -1) return 177.78;
      if (cls.indexOf("featured") !== -1) return 120;
      if (cls.indexOf("ar-3x4") !== -1) return 133.33;
      if (cls.indexOf("ar-1x1") !== -1) return 100;
      if (cls.indexOf("ar-4x3") !== -1) return 75;
      return 56.25;
    }

    function pickColIndex(w){
      var best = 0;
      for (var i=1;i<state.colHeights.length;i++){
        if (state.colHeights[i] < state.colHeights[best]) best = i;
      }
      state.colHeights[best] += w;
      return best;
    }

    function trimDom(){
      while (state.queue.length > state.maxDom){
        var t = state.queue.shift();
        if (t && t.el && t.el.parentNode) t.el.parentNode.removeChild(t.el);
        if (t && typeof t.col === "number" && typeof t.w === "number") {
          state.colHeights[t.col] = Math.max(0, state.colHeights[t.col] - t.w);
        }
      }
    }

    function buildUrl(){
      var u = new URL(api);
      u.searchParams.set("limit", String(state.limit));
      u.searchParams.set("offset", String(state.offset));
      u.searchParams.set("type", "all"); // server always all
      if (state.q) u.searchParams.set("q", state.q);
      return u.toString();
    }

    function applyFilter(items){
      if (state.type === "all") return items;
      if (state.type === "youtube") return items.filter(isYT);
      if (state.type === "image") return items.filter(function(x){ return !isYT(x); });
      return items;
    }

    function addTile(item){
      ensureCols();

      var yt = (item.type === "youtube") || isYT(item);
      var isShort = yt && String(item.media || "").indexOf("/shorts/") !== -1;

      var key = item.id || item.postUrl || item.media || item.thumb || "";
      var h = hash32(key);

      var cls = ["tile"];
      if (yt) {
        cls.push(isShort ? "ar-9x16" : "ar-16x9");
        if (!isShort && (h % 100) < 12) cls.push("featured");
      } else {
        var ratios = ["ar-16x9","ar-4x3","ar-1x1","ar-3x4"];
        cls.push(ratios[h % ratios.length]);
        if ((h % 100) < 18) cls.push("featured");
      }

      var tile = document.createElement("div");
      tile.className = cls.join(" ");

      var badge = yt ? "YouTube" : "Image";
      var title = esc(item.title || "");
      var postUrl = esc(item.postUrl || "#");
      var thumb = esc(item.thumb || "");
      var href = postUrl;

      tile.innerHTML =
        '<div class="shade"></div>' +
        '<div class="thumb"><img loading="lazy" alt="' + title + '" src="' + thumb + '"></div>' +
        '<div class="meta"><span class="badge">' + badge + '</span><span class="title">' + title + '</span></div>' +
        '<a href="' + href + '" aria-label="' + title + '"></a>';

      var w = weightFromClasses(tile.className);
      var idx = pickColIndex(w);
      state.cols[idx].appendChild(tile);

      state.queue.push({ el: tile, w: w, col: idx });
      trimDom();
    }

    function loadBatch(){
      if (state.loading || state.done) return;
      state.loading = true;

      var run = state.run;
      setText(loader, "Loading...");

      jsonp(buildUrl(), 12000).then(function (data) {
        if (run !== state.run) return;

        var serverItems = (data && data.items) ? data.items : [];
        var filtered = applyFilter(serverItems);

        state.offset += serverItems.length;

        if (!serverItems.length) {
          state.done = true;
          setText(loader, "Selesai.");
          return;
        }

        if (!filtered.length) {
          state.emptySkips += 1;
          if (state.emptySkips >= 10) {
            state.done = true;
            setText(loader, "No results for this filter.");
            return;
          }
          state.loading = false;
          setTimeout(loadBatch, 0);
          return;
        }

        state.emptySkips = 0;
        for (var i=0;i<filtered.length;i++) addTile(filtered[i]);
        setText(loader, "Scroll to load more...");
      }).catch(function (e) {
        console.error("GG FEED ERROR:", e);
        state.done = true;
        setText(loader, "Load failed. Check Console.");
      }).finally(function () {
        state.loading = false;
      });
    }

    function reset(){
      state.run += 1;
      state.loading = false;

      state.offset = 0;
      state.done = false;
      state.emptySkips = 0;

      grid.innerHTML = "";
      state.cols = null;
      state.colHeights = null;
      state.queue = [];
      ensureCols();

      loadBatch();
    }

    // Bind buttons
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { GG.core.state.remove(x, "active"); });
        GG.core.state.add(b, "active");
        state.type = (b.getAttribute("data-type") || "all").toLowerCase();
        reset();
      });
    });

    // Search debounce
    if (qInput) {
      var timer = null;
      qInput.addEventListener("input", function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = (qInput.value || "").trim();
          reset();
        }, 300);
      });
    }

    // Infinite scroll
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function () {
        if (!state.done) loadBatch();
      }, { rootMargin: "800px 0px" });
      io.observe(loader);
    }

    // Resize repack (POIN E)
    state.lastCols = getColCount();
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var now = getColCount();
        if (now !== state.lastCols) {
          state.lastCols = now;
          reset();
        }
      }, 200);
    });

    ensureCols();
    console.log("GG FEED INIT OK");
    loadBatch();
  }

  function init(){
    var root = document.getElementById("gg-feed");
    if (!root) return;
    initFeed(root);
  }

  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.modules.feed = GG.modules.feed || {};
  GG.modules.feed.init = GG.modules.feed.init || init;
})();

(function(){
  function qs(root, sel){ return (root||document).querySelector(sel); }
  function qsa(root, sel){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function setText(el, t){ if(el) el.textContent = t; }
  function esc(s){
    s = (s==null) ? "" : String(s);
    return s.replace(/[&<>"']/g, function(c){
      return ({ "&":"\u0026amp;","<":"\u0026lt;",">":"\u0026gt;",'"':"\u0026quot;","'":"\u0026#039;" })[c];
    });
  }

  function isYT(item){
    // works only if API provides type/thumb/media
    var type = item && item.type ? String(item.type).toLowerCase() : "";
    if(type === "youtube") return true;
    var media = item && item.media ? String(item.media) : "";
    var thumb = item && item.thumb ? String(item.thumb) : "";
    return (media.indexOf("youtube.com") !== -1) || (media.indexOf("youtu.be") !== -1) || (thumb.indexOf("i.ytimg.com/vi/") !== -1);
  }

  function parseDateISO(s){
    if(!s) return null;
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDate(d){
    var y = d.getFullYear();
    var m = String(d.getMonth()+1).padStart(2,"0");
    var day = String(d.getDate()).padStart(2,"0");
    return y + "-" + m + "-" + day;
  }

  function fetchJson(url, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    return new Promise(function(resolve, reject){
      var done = false;
      var t = setTimeout(function(){
        if(done) return;
        done = true;
        reject(new Error("JSON fetch timeout"));
      }, timeoutMs);

      fetch(url, { credentials: "same-origin" })
        .then(function(res){
          if(!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function(data){
          if(done) return;
          done = true;
          clearTimeout(t);
          resolve(data);
        })
        .catch(function(err){
          if(done) return;
          done = true;
          clearTimeout(t);
          reject(err);
        });
    });
  }

  function jsonp(url, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    return new Promise(function(resolve, reject){
      var cb = "ggcb_" + Math.random().toString(36).slice(2);
      var s = document.createElement("script");
      var done = false;

      function cleanup(){
        if(done) return;
        done = true;
        try { delete window[cb]; } catch(e){ window[cb] = undefined; }
        if(s && s.parentNode) s.parentNode.removeChild(s);
      }

      var t = setTimeout(function(){
        cleanup();
        reject(new Error("JSONP timeout"));
      }, timeoutMs);

      window[cb] = function(data){
        clearTimeout(t);
        cleanup();
        resolve(data);
      };

      s.onerror = function(){
        clearTimeout(t);
        cleanup();
        reject(new Error("JSONP script blocked / network error"));
      };

      s.src = url + (url.indexOf("?") !== -1 ? "&" : "?") + "callback=" + encodeURIComponent(cb);
      document.body.appendChild(s);
    });
  }

  function loadJson(url, timeoutMs){
    var useJsonp = (url.indexOf("callback=") !== -1) || (url.indexOf("alt=json-in-script") !== -1);
    return useJsonp ? jsonp(url, timeoutMs) : fetchJson(url, timeoutMs);
  }

  function stripHtml(s){
    return String(s || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pickAltLink(entry){
    var links = entry && entry.link ? entry.link : [];
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === "alternate" && links[i].href) return links[i].href;
    }
    return "";
  }

  function extractLabels(entry){
    var cats = entry && entry.category ? entry.category : [];
    var out = [];
    for (var i = 0; i < cats.length; i++) {
      if (cats[i] && cats[i].term) out.push(String(cats[i].term));
    }
    return out;
  }

  function normalizeEntry(entry){
    if(!entry) return null;
    var id = entry.id && entry.id.$t ? entry.id.$t : "";
    var title = (entry.title && entry.title.$t) ? entry.title.$t : "";
    var postUrl = pickAltLink(entry);
    var published = entry.published && entry.published.$t ? entry.published.$t : "";
    var summary = entry.summary && entry.summary.$t ? entry.summary.$t : "";
    var content = entry.content && entry.content.$t ? entry.content.$t : "";
    var snippet = stripHtml(summary || content);
    var labels = extractLabels(entry);

    var thumb = "";
    var media = "";
    var mediaThumb = entry["media$thumbnail"] || entry.media$thumbnail;
    if(mediaThumb && mediaThumb.url){
      thumb = mediaThumb.url;
      media = mediaThumb.url;
    }
    if(!media) media = content || summary || "";

    return {
      id: id || postUrl || title,
      title: title || "(untitled)",
      postUrl: postUrl || "#",
      published: published,
      labels: labels,
      snippet: snippet,
      media: media,
      thumb: thumb
    };
  }

  function findRelLink(feed, rel){
    var links = feed && feed.link ? feed.link : [];
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === rel && links[i].href) return links[i].href;
    }
    return "";
  }

  function parseFeed(data){
    var feed = data && data.feed ? data.feed : null;
    var entries = feed && feed.entry ? feed.entry : [];
    var items = entries.map(normalizeEntry).filter(Boolean);
    var total = null;
    var totalNode = feed && feed["openSearch$totalResults"];
    if(totalNode && totalNode.$t){
      var n = Number(totalNode.$t);
      if(!isNaN(n)) total = n;
    }
    var nextUrl = findRelLink(feed, "next");
    return { items: items, total: total, nextUrl: nextUrl };
  }

  function boot(){
    var root = document.getElementById("gg-sitemap");
    if(!root || root.dataset.ggBound === "1") return;
    root.dataset.ggBound = "1";

    var api = root.getAttribute("data-api") || "";
    var groupsEl = qs(root, "#gg-groups");
    var meta = qs(root, "#gg-meta");
    var stats = qs(root, "#gg-stats");
    var loader = qs(root, "#gg-loader");
    var moreBtn = qs(root, ".gg-more");

    var qInput = qs(root, ".gg-q");
    var yearSel = qs(root, ".gg-year");
    var monthSel = qs(root, ".gg-month");
    var labelSel = qs(root, ".gg-label");
    var sortSel = qs(root, ".gg-sort");
    var resetBtn = qs(root, ".gg-reset");
    var tabs = qsa(root, ".gg-tab");

    if(!api){
      setText(meta, "Missing data-api");
      return;
    }

    var state = {
      type:"all", q:"", year:"", month:"", label:"", sort:"newest",
      offset:0, limit:80, loading:false, done:false, emptySkips:0,
      totalFromServer:null, nextUrl:"",

      // store all loaded unique items so we can regroup/re-render instantly
      byId: new Map(),     // id -> item
      order: [],           // ids in arrival order (for "Loaded X")
      seenDropdownId: new Set(), // prevent label/year counts exploding

      years: new Set(),
      ymByYear: new Map(), // year -> Set(month)
      labels: new Map(),   // label -> count (unique posts)
    };

    function showLoader(on){
      GG.core.state.toggle(loader, "hidden", !on);
    }

    function buildUrl(){
      if (state.nextUrl) return state.nextUrl;
      return api;
    }

    function rebuildYearOptions(){
      var arr = Array.from(state.years);
      arr.sort(function(a,b){ return Number(b)-Number(a); });
      var cur = state.year;
      yearSel.innerHTML = '<option value="">All years</option>' + arr.map(function(y){
        return '<option value="'+esc(y)+'">'+esc(y)+'</option>';
      }).join("");
      if(cur && arr.indexOf(cur)!==-1) yearSel.value = cur;
    }

    function rebuildMonthOptions(){
      var y = state.year;
      if(!y){
        monthSel.disabled = true;
        monthSel.innerHTML = '<option value="">All months</option>';
        monthSel.value = "";
        state.month = "";
        return;
      }
      var set = state.ymByYear.get(y);
      var arr = set ? Array.from(set) : [];
      arr.sort();
      monthSel.disabled = false;
      monthSel.innerHTML = '<option value="">All months</option>' + arr.map(function(m){
        return '<option value="'+esc(m)+'">'+esc(m)+'</option>';
      }).join("");
      if(state.month && arr.indexOf(state.month)!==-1) monthSel.value = state.month;
      else { monthSel.value=""; state.month=""; }
    }

    function rebuildLabelOptions(){
      var arr = Array.from(state.labels.keys());
      arr.sort(function(a,b){ return a.localeCompare(b,"id"); });
      var cur = state.label;
      labelSel.innerHTML = '<option value="">All labels</option>' + arr.map(function(lbl){
        var cnt = state.labels.get(lbl)||0;
        return '<option value="'+esc(lbl)+'">'+esc(lbl)+' ('+cnt+')</option>';
      }).join("");
      if(cur && state.labels.has(cur)) labelSel.value = cur;
    }

    function updateMeta(){
      if(state.totalFromServer != null) setText(meta, "Total " + state.totalFromServer);
      else setText(meta, "");
    }

    function updateStats(shown){
      var loaded = state.order.length;
      var t = (state.totalFromServer!=null) ? state.totalFromServer : "—";
      setText(stats, "Showing " + shown + " • Loaded " + loaded + " • Total " + t);
    }

    function applyFilters(items){
      var out = items;

      // type
      if(state.type === "youtube") out = out.filter(isYT);
      else if(state.type === "image") out = out.filter(function(x){
        // if API doesn't provide youtube signals, they all become "image-ish"
        return !isYT(x);
      });

      // year/month
      if(state.year){
        out = out.filter(function(x){
          var d = parseDateISO(x.published);
          return d && String(d.getFullYear()) === state.year;
        });
      }
      if(state.month){
        out = out.filter(function(x){
          var d = parseDateISO(x.published);
          if(!d) return false;
          var mm = String(d.getMonth()+1).padStart(2,"0");
          return mm === state.month;
        });
      }

      // label
      if(state.label){
        out = out.filter(function(x){
          if (Array.isArray(x.labels)) return x.labels.indexOf(state.label) !== -1;
          return String(x.labels||"") === state.label;
        });
      }

      // search
      if(state.q){
        var q = state.q.toLowerCase();
        out = out.filter(function(x){
          var t = String(x.title||"").toLowerCase();
          var l = Array.isArray(x.labels) ? x.labels.join(" ").toLowerCase() : String(x.labels||"").toLowerCase();
          return (t.indexOf(q)!==-1) || (l.indexOf(q)!==-1);
        });
      }

      // sort
      out = out.slice();
      if(state.sort === "newest"){
        out.sort(function(a,b){
          var da = parseDateISO(a.published); var db = parseDateISO(b.published);
          return (db?db.getTime():0) - (da?da.getTime():0);
        });
      } else if(state.sort === "oldest"){
        out.sort(function(a,b){
          var da = parseDateISO(a.published); var db = parseDateISO(b.published);
          return (da?da.getTime():0) - (db?db.getTime():0);
        });
      } else if(state.sort === "title_asc"){
        out.sort(function(a,b){ return String(a.title||"").localeCompare(String(b.title||""), "id"); });
      } else if(state.sort === "title_desc"){
        out.sort(function(a,b){ return String(b.title||"").localeCompare(String(a.title||""), "id"); });
      }

      return out;
    }

    function groupByDate(items){
      // key: YYYY-MM-DD
      var map = new Map();
      items.forEach(function(x){
        var d = parseDateISO(x.published);
        var k = d ? fmtDate(d) : "Unknown date";
        if(!map.has(k)) map.set(k, []);
        map.get(k).push(x);
      });

      // order keys by date based on state.sort for date groups
      var keys = Array.from(map.keys());
      keys.sort(function(a,b){
        if(a==="Unknown date") return 1;
        if(b==="Unknown date") return -1;
        // compare as strings works for YYYY-MM-DD
        if(state.sort === "oldest") return a.localeCompare(b);
        return b.localeCompare(a);
      });

      return { keys: keys, map: map };
    }

    function render(){
      groupsEl.innerHTML = "";

      var items = state.order.map(function(id){ return state.byId.get(id); }).filter(Boolean);
      var filtered = applyFilters(items);

      var grouped = groupByDate(filtered);
      var focusables = []; // for keyboard nav

      grouped.keys.forEach(function(day){
        var arr = grouped.map.get(day);

        var group = document.createElement("div");
        group.className = "gg-group";
        group.innerHTML =
          '<div class="gg-group-title"><span>'+esc(day)+'</span><span class="count">'+arr.length+'</span></div>' +
          '<div class="gg-list"></div>';

        var list = qs(group, ".gg-list");

        arr.forEach(function(item){
          var d = parseDateISO(item.published);
          var dateTxt = d ? fmtDate(d) : "";

          var title = esc(item.title || "(untitled)");
          var url = esc(item.postUrl || "#");
          var labelText = Array.isArray(item.labels) ? (item.labels[0] || "") : (item.labels || "");
          var lbl = esc(labelText);

          // type badge (will be Unknown if API doesn't provide signals)
          var yt = isYT(item);
          var hasSignals = !!(item.type || item.media || item.thumb);
          var badgeText = !hasSignals ? "Type?" : (yt ? "YouTube" : "Image");
          var badgeState = !hasSignals ? "unk" : (yt ? "yt" : "img");

          var snippet = item && item.snippet ? esc(item.snippet) : "";

          var el = document.createElement("div");
          el.className = "gg-item";
          el.setAttribute("role","listitem");
          el.setAttribute("tabindex","0");
          el.dataset.url = item.postUrl || "";
          el.innerHTML =
            '<div class="gg-date">'+esc(dateTxt)+'</div>' +
            '<div class="gg-main">' +
              '<a class="gg-link" href="'+url+'">'+title+'</a>' +
              '<div class="gg-badges">' +
                '<span class="gg-badge" data-gg-state="'+badgeState+'">'+badgeText+'</span>' +
                (lbl ? '<span class="gg-badge">'+lbl+'</span>' : '') +
              '</div>' +
              '<div class="gg-snippet">'+ (snippet || "") +'</div>' +
            '</div>' +
            '<button class="gg-toggle" type="button" aria-label="Toggle details">Details</button>';

          var btn = qs(el, ".gg-toggle");
          btn.addEventListener("click", function(e){
            e.stopPropagation();
            GG.core.state.toggle(el, "open");
          });

          el.addEventListener("click", function(e){
            // click row opens link (but keep Details clickable)
            if(e.target && String(e.target.className||"").indexOf("gg-toggle")!==-1) return;
            var a = qs(el, ".gg-link");
            if(a) a.click();
          });

          list.appendChild(el);
          focusables.push(el);
        });

        groupsEl.appendChild(group);
      });

      updateStats(filtered.length);

      // keyboard nav registry
      state.focusables = focusables;
      state.focusIndex = Math.min(state.focusIndex || 0, Math.max(0, focusables.length-1));
      applyFocus(state.focusIndex);
    }

    function applyFocus(idx){
      if(!state.focusables) return;
      state.focusables.forEach(function(el){ GG.core.state.remove(el, "focus"); });
      var el = state.focusables[idx];
      if(el){
        GG.core.state.add(el, "focus");
        // keep it in view without jumping too hard
        el.scrollIntoView({block:"nearest"});
        el.focus({preventScroll:true});
      }
    }

    function trackDropdownsOnce(item){
      var id = item && item.id ? String(item.id) : "";
      if(!id) return;
      if(state.seenDropdownId.has(id)) return;
      state.seenDropdownId.add(id);

      var d = parseDateISO(item.published);
      if(d){
        var y = String(d.getFullYear());
        state.years.add(y);
        var set = state.ymByYear.get(y);
        if(!set){ set = new Set(); state.ymByYear.set(y, set); }
        set.add(String(d.getMonth()+1).padStart(2,"0"));
      }

      var lbls = Array.isArray(item.labels) ? item.labels : (item.labels ? [String(item.labels)] : []);
      var seenLbl = {};
      lbls.forEach(function(lbl){
        var key = String(lbl || "").trim();
        if(!key || seenLbl[key]) return;
        seenLbl[key] = true;
        state.labels.set(key, (state.labels.get(key)||0) + 1);
      });
    }

    function mergeItems(serverItems){
      serverItems.forEach(function(x){
        if(!x || !x.id) return;
        if(!state.byId.has(x.id)){
          state.byId.set(x.id, x);
          state.order.push(x.id);
          trackDropdownsOnce(x);
        } else {
          // update existing (if updated fields change)
          state.byId.set(x.id, x);
        }
      });

      rebuildYearOptions();
      rebuildMonthOptions();
      rebuildLabelOptions();
    }

    function loadBatch(){
      if(state.loading || state.done) return;
      state.loading = true;
      showLoader(true);
      moreBtn.disabled = true;

      loadJson(buildUrl(), 12000).then(function(data){
        var parsed = parseFeed(data);
        var serverItems = parsed.items || [];
        if(parsed.total != null) state.totalFromServer = parsed.total;
        state.nextUrl = parsed.nextUrl || "";
        state.done = !state.nextUrl;

        if(serverItems.length){
          mergeItems(serverItems);
        } else if(!state.nextUrl){
          state.done = true;
        }

        updateMeta();
        render();

        showLoader(false);
        moreBtn.disabled = false;
        moreBtn.style.display = state.done ? "none" : "";

      }).catch(function(err){
        console.error("SITEMAP ERROR:", err);
        state.done = true;
        showLoader(false);
        moreBtn.style.display = "none";
        setText(loader, "Load failed. Check Console.");
      }).finally(function(){
        state.loading = false;
      });
    }

    function reset(){
      // don’t wipe loaded cache (fast UX). just re-render with new filters
      state.focusIndex = 0;
      render();
    }

    // ---- events ----
    tabs.forEach(function(btn){
      btn.addEventListener("click", function(){
        tabs.forEach(function(x){ GG.core.state.remove(x, "active"); });
        GG.core.state.add(btn, "active");
        state.type = String(btn.getAttribute("data-type")||"all").toLowerCase();
        reset();
      });
    });

    var qTimer=null;
    qInput.addEventListener("input", function(){
      if(qTimer) clearTimeout(qTimer);
      qTimer = setTimeout(function(){
        state.q = (qInput.value||"").trim();
        reset();
      }, 250);
    });

    yearSel.addEventListener("change", function(){
      state.year = yearSel.value || "";
      rebuildMonthOptions();
      reset();
    });

    monthSel.addEventListener("change", function(){
      state.month = monthSel.value || "";
      reset();
    });

    labelSel.addEventListener("change", function(){
      state.label = labelSel.value || "";
      reset();
    });

    sortSel.addEventListener("change", function(){
      state.sort = sortSel.value || "newest";
      reset();
    });

    resetBtn.addEventListener("click", function(){
      qInput.value = ""; state.q = "";
      state.type = "all";
      tabs.forEach(function(x){ GG.core.state.remove(x, "active"); });
      GG.core.state.add(tabs[0], "active");

      state.year=""; state.month=""; state.label="";
      yearSel.value=""; rebuildMonthOptions(); labelSel.value="";

      state.sort="newest"; sortSel.value="newest";

      state.focusIndex = 0;
      render();
    });

    moreBtn.addEventListener("click", function(){
      loadBatch();
    });

    // ---- keyboard navigation ----
    document.addEventListener("keydown", function(e){
      // "/" focus search (like GitHub)
      if(e.key === "/" && document.activeElement !== qInput){
        e.preventDefault();
        qInput.focus();
        return;
      }
      // Esc clears search
      if(e.key === "Escape"){
        if(document.activeElement === qInput && qInput.value){
          qInput.value = "";
          state.q = "";
          reset();
        }
        return;
      }

      // only handle arrow nav if focus is inside sitemap
      var inSitemap = root.contains(document.activeElement);
      if(!inSitemap) return;

      if(!state.focusables || !state.focusables.length) return;

      if(e.key === "ArrowDown"){
        e.preventDefault();
        state.focusIndex = Math.min(state.focusIndex+1, state.focusables.length-1);
        applyFocus(state.focusIndex);
      } else if(e.key === "ArrowUp"){
        e.preventDefault();
        state.focusIndex = Math.max(state.focusIndex-1, 0);
        applyFocus(state.focusIndex);
      } else if(e.key === "Enter"){
        var el = state.focusables[state.focusIndex];
        if(el){
          var a = qs(el, ".gg-link");
          if(a) a.click();
        }
      }
    });

    // initial load
    showLoader(true);
    loadBatch();
  }

  function init(){
    boot();
  }

  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.modules.sitemap = GG.modules.sitemap || {};
  GG.modules.sitemap.init = GG.modules.sitemap.init || init;
})();

(function(){
  'use strict';

  // ====== KONFIG ======
  var HOME_ANCHOR = '#gg-home-blog-anchor'; // target "mentok" utama
  var HOME_FALLBACK = '#gg-landing-hero';   // fallback kalau anchor utama gak ada
  var HOME_LANDING_PATH = '/';
  var HOME_BLOG_PATH = '/blog';

  // ====== UTIL ======
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
    return homeRoot().replace(/\/$/,'') + HOME_BLOG_PATH;
  }

function isSystemPath(pathname){
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/feeds/')
  ) return true;

  // safety net
  if (pathname.endsWith('.xml') || pathname.endsWith('.txt') || pathname.endsWith('.ico')) return true;
  return false;
}


  function pageGroup(){
    // Blogger body class yang umum: item, static_page, index, archive, label, search
    var b = document.body;
    if(!b) return 'listing';
    if (b.classList.contains('item') || b.classList.contains('static_page')) return 'content';
    return 'listing';
  }

  function currentMobileMode(){
    try { return new URLSearchParams(location.search).get('m'); } catch(e){ return null; }
  }

  // Buat "key" stack yang stabil:
  // - buang m=1 dari identitas (biar gak pecah)
  // - keep query penting untuk search filtering: q, updated-min/max
  // - keep hash cuma untuk home anchor yang kita peduli
// abaikan pagination params biar gak pecah jadi banyak halaman listing
// (jangan di-keep)

  function canonicalKey(urlStr){
    var u = new URL(urlStr, location.origin);
    if (isSystemPath(u.pathname)) return null;

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
    var blogPath = homeBlogPath().replace(/\/$/,'');

    if(path === landingPath && u.hash === HOME_ANCHOR){
      return blogPath + u.search;
    }
    if(path === blogPath){
      return blogPath + u.search;
    }
    if(path === landingPath){
      return landingPath + u.search;
    }

    // hash: hanya simpan 2 state home; lainnya dibuang
    if(u.hash !== HOME_ANCHOR && u.hash !== HOME_FALLBACK) u.hash = '';

    // return sebagai path+query+hash biar ringkas
    return path + u.search + u.hash;
  }

  // Saat navigasi, kalau user sedang di m=1, paksa tujuan juga m=1
  function applyMobile(dest){
    var m = currentMobileMode();
    if(m !== '1') return dest;
    var u = new URL(dest, location.origin);
    // jangan inject m ke path sistem (seharusnya gak kejadian)
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
      // hanya simpan referrer luar domain
      if(new URL(ref).origin !== location.origin){
        sessionStorage.setItem('gg_entry_ref', ref);
      }
    } catch(e){}
  }

  function homeLanding(){
    // prioritas route /blog sebagai mentok listing utama
    var blogPath = homeBlogPath();
    if(blogPath) return blogPath;
    var base = homeRoot();
    return base + HOME_FALLBACK;
  }

  // ====== TRACKING (jalan tiap page load) ======
  function track(){
    setEntryRefOnce();

    var group = pageGroup();

    // set first_group sekali per tab-session
    if(!sessionStorage.getItem('gg_first_group')){
      sessionStorage.setItem('gg_first_group', group);
    }

    // update last_listing:
    if (group === 'listing') {
      if (location.pathname === '/' || location.pathname === '/blog' || location.pathname === '/blog/') {
        sessionStorage.setItem('gg_last_listing', canonicalKey(location.href));
      } else {
        sessionStorage.setItem('gg_last_listing', canonicalKey(location.href));
      }
    } else {
      if (!sessionStorage.getItem('gg_last_listing')) {
        sessionStorage.setItem('gg_last_listing', canonicalKey(homeLanding()));
      }
    }


    // kalau ini navigasi yang dipicu tombol back kita, jangan push ulang
    if(sessionStorage.getItem('gg_nav_action') === 'back'){
      sessionStorage.removeItem('gg_nav_action');
      return;
    }

    // kalau user browser back/forward, jangan push
    if(navType() === 'back_forward') return;

    var cur = canonicalKey(location.href);
    if(!cur) return;

    var st = readStack();
    if(st.length === 0 || st[st.length-1] !== cur){
      st.push(cur);
      writeStack(st);
    }
  }

  // hashchange untuk home (biar hero/anchor update last_listing tanpa reload)
  function bindHashChange(){
    if(pageGroup() !== 'listing') return;
    window.addEventListener('hashchange', function(){
      var h = location.hash;
      if(h === HOME_ANCHOR || h === HOME_FALLBACK){
        sessionStorage.setItem('gg_last_listing', canonicalKey(location.href));
      }
    });
  }

  // ====== BACK POLICY ======
  function goBack(){
    var cur = canonicalKey(location.href);
    var st = readStack();

    // sync kalau stack kosong/beda
    if(cur && (st.length === 0 || st[st.length-1] !== cur)){
      st.push(cur);
    }

    // 1) kalau ada history internal → mundur 1 langkah internal
    if(st.length > 1){
      st.pop();
      var dest = st[st.length-1];
      writeStack(st);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(dest);
      return;
    }

    // 2) tidak ada history internal → jatuh ke last listing (mentok di anchor)
    var lastListing = sessionStorage.getItem('gg_last_listing') || homeBlogPath();
    var group = pageGroup();

    if(group === 'content'){
      // content -> listing
      writeStack([lastListing]);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(lastListing);
      return;
    }

    // 3) sudah listing:
    //    kalau sesi dimulai dari listing, boleh balik ke asal visitor (referrer luar domain)
    //    kalau sesi dimulai dari content, mentok di homeLanding
    var first = sessionStorage.getItem('gg_first_group'); // 'listing' / 'content'
    var entry = sessionStorage.getItem('gg_entry_ref');

    if(first === 'listing' && entry){
      // keluar sekali saja
      sessionStorage.removeItem('gg_entry_ref');
      sessionStorage.removeItem('gg_stack');
      location.href = entry;
      return;
    }

    // mentok
    var homeKey = canonicalKey(homeLanding());
    if(cur !== homeKey){
      writeStack([homeKey]);
      sessionStorage.setItem('gg_nav_action','back');
      location.href = applyMobile(homeKey);
      return;
    }

    // sudah mentok: do nothing
  }

  // expose
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
    bd.className = 'gg-panels-backdrop';
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

    function getAttr(el, name){ return el ? el.getAttribute(name) : null; }

    function setLeft(state){
      if (!main) return;
      setAttr(main, 'data-gg-left-panel', state);
      updateBackdrop();
    }

    function setRight(state){
      if (!main) return;
      setAttr(main, 'data-gg-info-panel', state);
      updateBackdrop();
    }

    function updateBackdrop(){
      if (!backdrop) return;
      var mobile = shouldMobile();
      var leftOpen  = getAttr(main, 'data-gg-left-panel') === 'open';
      var rightOpen = getAttr(main, 'data-gg-info-panel') === 'open';
      var show = mobile && (leftOpen || rightOpen);
      GG.core.state.toggle(backdrop, 'visible', show);
      lockScroll(show);
    }

// GAGA TOGGLE SIDEBAR
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
// /GAGA TOGGLE SIDEBAR

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
          // Hindari custom Label Tree (gg-lt) supaya markup-nya tidak diubah
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
        setLeft(isOpen ? 'closed' : 'open'); evt.preventDefault(); return;
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
        if (main) main.removeAttribute('data-gg-right-mode');
        setLeft('closed');
        setRight('closed');
        evt.preventDefault();
        return;
      }

      if (closest(t, '[data-gg-action="info-close"]')){
        setRight('closed'); evt.preventDefault(); return;
      }
    }

    function handleKey(evt){
      if (evt.key !== 'Escape') return;
      if (main && main.getAttribute('data-gg-info-panel') === 'open'){ if (main) main.removeAttribute('data-gg-right-mode'); setRight('closed'); return; }
      if (main && main.getAttribute('data-gg-left-panel') === 'open'){ setLeft('closed'); }
    }

    function bindEvents(){
      if (bound) return;
      bound = true;
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKey);
      window.addEventListener('resize', updateBackdrop);
    }

    function init(){
      main = qs('main.gg-main[data-gg-surface]') || qs('main.gg-main') || qs('main');
      if (!main) return;
      var surface = main.getAttribute('data-gg-surface') || '';
      var isPostSurface = surface === 'post';
      var isDesktopPost = isPostSurface && !shouldMobile();

      left  = qs('.gg-blog-sidebar--left', main);
      right = qs('.gg-blog-sidebar--right', main);

      if (isDesktopPost){
        if (!main.hasAttribute('data-gg-left-panel')){
          setAttr(main, 'data-gg-left-panel', 'open');
        }
        if (!main.hasAttribute('data-gg-info-panel')){
          setAttr(main, 'data-gg-info-panel', 'open');
        }
        setAttr(main, 'data-gg-right-mode', 'comments');
      } else {
        if (!main.hasAttribute('data-gg-left-panel')){
          setAttr(main, 'data-gg-left-panel', shouldMobile() ? 'closed' : 'open');
        }
        if (!main.hasAttribute('data-gg-info-panel')){
          setAttr(main, 'data-gg-info-panel', 'closed');
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

(function (GG, d) {
  'use strict';
  GG.modules = GG.modules || {};
  var TagUtils = GG.modules.tagUtils || {};
  var tagLang = TagUtils.getLang ? TagUtils.getLang() : {};

  GG.modules.tagDirectory = GG.modules.tagDirectory || {};

  GG.modules.tagDirectory.init = function (root) {
    var target = root && root.querySelector ? root : document.querySelector('.gg-tags-directory');
    if (!target || target.getAttribute('data-gg-tags-directory-init') === 'true') {
      return;
    }
    target.setAttribute('data-gg-tags-directory-init', 'true');

    var url = TagUtils.buildFeedUrl({ 'max-results': '50' });
    fetch(url, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('network');
        }
        return res.json();
      })
      .then(function (json) {
        var entries = json && json.feed && json.feed.entry ? json.feed.entry : [];
        var map = buildTagMap(entries);
        renderDirectory(target, map);
      })
      .catch(function () {
        target.textContent = (tagLang && tagLang.errorMessage) || 'Tag tidak dapat dimuat. Coba segarkan halaman.';
      });
  };

  function buildTagMap(entries) {
    var map = {};
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var source = '';
      if (entry.summary && entry.summary.$t) {
        source = entry.summary.$t;
      } else if (entry.content && entry.content.$t) {
        source = entry.content.$t;
      }
      var tags = TagUtils.extractTagsFromHtml(source);
      for (var j = 0; j < tags.length; j++) {
        var key = tags[j];
        map[key] = map[key] ? map[key] + 1 : 1;
      }
    }
    return map;
  }

  function renderDirectory(target, map) {
    target.innerHTML = '';
    var keys = [];
    for (var key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        keys.push(key);
      }
    }
    if (!keys.length) {
      var empty = document.createElement('p');
      empty.className = 'gg-tags-directory__empty';
      empty.textContent = (tagLang && tagLang.emptyMessage) || 'Belum ada artikel dengan tag ini.';
      target.appendChild(empty);
      return;
    }
    keys.sort();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < keys.length; i++) {
      var slug = keys[i];
      var chip = document.createElement('a');
      chip.className = 'gg-tags-directory__chip';
      chip.href = TagUtils.buildTagUrl(slug);
      chip.textContent = '#' + slug + ' (' + map[slug] + ')';
      chip.setAttribute('data-gg-tag', slug);
      chip.addEventListener('click', function (event) {
        var targetSlug = event.currentTarget.getAttribute('data-gg-tag') || '';
        if (GG.analytics && typeof GG.analytics.track === 'function') {
          GG.analytics.track('tag_click', { tag: targetSlug, location: 'tag_directory' });
        }
      });
      frag.appendChild(chip);
    }
    target.appendChild(frag);
  }

  function autoInitDirectory() {
    var target = d.querySelector('.gg-tags-directory');
    if (target) {
      GG.modules.tagDirectory.init(target);
    }
  }

  GG.modules.tagDirectory.autoInit = autoInitDirectory;
})(window.GG, document);

(function (GG, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.data = GG.data || {};
  GG.data.tagFeedCache = GG.data.tagFeedCache || {};

  var TagUtils = GG.modules.tagUtils || {};
  var tagLang = TagUtils.getLang ? TagUtils.getLang() : {};

  GG.modules.tagHubPage = GG.modules.tagHubPage || {};
  GG.modules.tagDirectory = GG.modules.tagDirectory || {};

  GG.modules.tagHubPage.getActiveTag = function () {
    try {
      var params = new URLSearchParams(window.location.search);
      var raw = params.get('tag');
      var slug = TagUtils.normalizeTag(raw);
      return slug || null;
    } catch (e) {
      return null;
    }
  };

  GG.modules.tagHubPage.fetchPostsByTag = function (tagSlug) {
    var feedUrl = TagUtils.buildFeedUrl({
      'max-results': '20',
      q: '#' + tagSlug
    });
    var cache = GG.data.tagFeedCache;
    if (cache[feedUrl]) {
      return Promise.resolve(cache[feedUrl]).then(function (res) { return res; });
    }

    var promise = fetch(feedUrl, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('network');
        }
        return res.json();
      })
      .then(function (json) {
        var feed = json && json.feed ? json.feed : {};
        var entries = feed.entry || [];
        var posts = [];

        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var linkHref = '';
          if (entry.link && entry.link.length) {
            for (var j = 0; j < entry.link.length; j++) {
              if (entry.link[j].rel === 'alternate') {
                linkHref = entry.link[j].href;
                break;
              }
            }
          }
          var title = entry.title && entry.title.$t ? entry.title.$t : 'Untitled';
          var published = '';
          if (entry.published && entry.published.$t) {
            published = entry.published.$t;
          } else if (entry.updated && entry.updated.$t) {
            published = entry.updated.$t;
          }
          var snippetSource = '';
          if (entry.summary && entry.summary.$t) {
            snippetSource = entry.summary.$t;
          } else if (entry.content && entry.content.$t) {
            snippetSource = entry.content.$t;
          }
          var snippet = snippetSource.replace(/<[^>]+>/g, ' ');
          snippet = snippet.replace(/\s+/g, ' ').trim();
          if (snippet.length > 180) {
            snippet = snippet.slice(0, 177) + '...';
          }
          var tags = TagUtils.extractTagsFromHtml(snippetSource);
          posts.push({
            title: title,
            url: linkHref,
            publishedDate: published,
            publishedStamp: published ? Date.parse(published) || 0 : 0,
            snippet: snippet,
            tag: tagSlug,
            tags: tags
          });
        }
        cache[feedUrl] = posts;
        return posts;
      })
      .catch(function (err) {
        cache[feedUrl] = null;
        throw err;
      });

    cache[feedUrl] = promise;
    return promise;
  };

  GG.modules.tagHubPage.renderPosts = function (listRoot, posts) {
    if (!listRoot) { return; }
    listRoot.innerHTML = '';
    GG.core.state.remove(listRoot, 'loading');
    GG.core.state.remove(listRoot, 'empty');
    GG.core.state.remove(listRoot, 'error');
    if (!posts || !posts.length) {
      GG.core.state.add(listRoot, 'empty');
      var emptyMsg = document.createElement('p');
      emptyMsg.className = 'gg-post-list__empty';
      emptyMsg.textContent = (tagLang && tagLang.emptyMessage) || 'Belum ada artikel dengan tag ini.';
      listRoot.appendChild(emptyMsg);
      return;
    }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < posts.length; i++) {
      frag.appendChild(buildTagCard(posts[i]));
    }
    listRoot.appendChild(frag);
  };

  GG.modules.tagHubPage.renderError = function (listRoot) {
    if (!listRoot) { return; }
    listRoot.innerHTML = '';
    GG.core.state.remove(listRoot, 'loading');
    GG.core.state.remove(listRoot, 'empty');
    GG.core.state.add(listRoot, 'error');
    var errMsg = document.createElement('p');
    errMsg.className = 'gg-post-list__error';
    errMsg.textContent = (tagLang && tagLang.errorMessage) || 'Tag tidak dapat dimuat. Coba segarkan halaman.';
    listRoot.appendChild(errMsg);
  };

  // Upgrade breadcrumb untuk halaman /p/tags.html dan /p/tags.html?tag=...
  GG.modules.tagHubPage.updateBreadcrumb = function (tagSlug) {
    var nav = document.querySelector('nav.gg-post__breadcrumbs') || document.querySelector('nav.breadcrumbs.gg-post__breadcrumbs');
    if (!nav) { return; }

    // Jangan dua kali enhance
    if (nav.getAttribute('data-gg-tags-breadcrumb-enhanced') === 'true') {
      return;
    }

    var homeLink = nav.querySelector('.gg-post__breadcrumbs-link--home') || nav.querySelector('.breadcrumbs__link--home');
    var current = nav.querySelector('.gg-post__breadcrumbs-current') || nav.querySelector('.breadcrumbs__current');
    var sepTemplate = nav.querySelector('.gg-post__breadcrumbs-sep') || nav.querySelector('.breadcrumbs__sep');

    if (!homeLink || !current || !sepTemplate) {
      return;
    }

    var labelText = (current.textContent || '').trim();
    if (!labelText) {
      labelText = 'tags';
    }

    // Ubah current <span> "tags" menjadi <a> "tags" yang bisa diklik
    var tagsLink = document.createElement('a');
    tagsLink.className = 'gg-post__breadcrumbs-link gg-post__breadcrumbs-link--label gg-tags-page__crumb-tags';
    tagsLink.href = '/p/tags.html';
    tagsLink.textContent = labelText;

    // Kalau TIDAK ada tagSlug (mode direktori), jadikan link ini current page
    if (!tagSlug) {
      tagsLink.setAttribute('aria-current', 'page');
      nav.replaceChild(tagsLink, current);
      nav.setAttribute('data-gg-tags-breadcrumb-enhanced', 'true');
      return;
    }

    // Kalau ADA tagSlug (mode Tag detail): "tags" jadi link biasa
    nav.replaceChild(tagsLink, current);

    // Tambah separator baru
    var sepClone = sepTemplate.cloneNode(true);
    nav.appendChild(sepClone);

    // Tambah crumb terakhir "#blogger" sebagai current page
    var currentTag = document.createElement('span');
    currentTag.className = 'gg-post__breadcrumbs-current gg-tags-page__crumb-current';
    currentTag.setAttribute('aria-current', 'page');
    currentTag.textContent = '#' + tagSlug;

    nav.appendChild(currentTag);
    nav.setAttribute('data-gg-tags-breadcrumb-enhanced', 'true');
  };


  GG.modules.tagHubPage.init = function (root) {
    var scope = root && root.querySelector ? root : document;
    var page = scope.querySelector('.gg-tags-page');
    if (!page) { return; }
    var alreadyInit = page.getAttribute('data-gg-tags-init') === 'true';
    page.setAttribute('data-gg-tags-init', 'true');

    var titleEl = page.querySelector('.gg-tags-page__title');
    var descEl = page.querySelector('.gg-tags-page__description');
    var listRoot = page.querySelector('.gg-post-list');
    var resultsSection = page.querySelector('.gg-tags-page__results');
    var directorySection = page.querySelector('.gg-tags-page__directory');
    var directoryRoot = page.querySelector('.gg-tags-directory');
    var sortSelect = page.querySelector('.gg-tags-page__sort');
    var crumbTags = page.querySelector('.gg-tags-page__crumb-tags');
    var crumbCurrent = page.querySelector('.gg-tags-page__crumb-current');

    var tagSlug = GG.modules.tagHubPage.getActiveTag();
    var currentPosts = [];

    function applyBreadcrumb(slug) {
      if (crumbTags) {
        crumbTags.textContent = (tagLang && tagLang.breadcrumbTagsLabel) || 'tags';
        if (!slug) {
          crumbTags.setAttribute('aria-current', 'page');
        } else {
          crumbTags.removeAttribute('aria-current');
        }
      }
      if (crumbCurrent) {
        if (slug) {
          crumbCurrent.style.removeProperty('display');
          crumbCurrent.textContent = '#' + slug;
          crumbCurrent.setAttribute('aria-current', 'page');
        } else {
          crumbCurrent.textContent = '';
          crumbCurrent.style.display = 'none';
          crumbCurrent.removeAttribute('aria-current');
        }
      }
    }

    function sortAndRender(order) {
      if (!listRoot) { return; }
      var sorted = currentPosts.slice();
      sorted.sort(function (a, b) {
        var aStamp = a.publishedStamp || 0;
        var bStamp = b.publishedStamp || 0;
        if (order === 'oldest') {
          return aStamp - bStamp;
        }
        return bStamp - aStamp;
      });
      GG.modules.tagHubPage.renderPosts(listRoot, sorted);
    }

    if (sortSelect && !alreadyInit) {
      sortSelect.addEventListener('change', function () {
        sortAndRender(sortSelect.value);
      });
    }

 // Upgrade breadcrumb lama jadi: Home › tags (› #tag kalau ada)
    if (GG.modules.tagHubPage.updateBreadcrumb) {
      GG.modules.tagHubPage.updateBreadcrumb(tagSlug);
    }

    if (tagSlug) {
      if (resultsSection) { resultsSection.style.removeProperty('display'); }
      if (directorySection) { directorySection.style.display = 'none'; }
      if (titleEl) { titleEl.textContent = ((tagLang && tagLang.pagePrefix) || 'Tag: ') + TagUtils.formatTagLabel(tagSlug); }
      if (descEl) { descEl.textContent = ((tagLang && tagLang.pageSubtitlePrefix) || 'Artikel dengan tag ') + '#' + tagSlug; }
      applyBreadcrumb(tagSlug);
      if (listRoot) {
        GG.core.state.add(listRoot, 'loading');
        GG.modules.tagHubPage.fetchPostsByTag(tagSlug)
          .then(function (posts) {
            currentPosts = posts || [];
            sortAndRender(sortSelect && sortSelect.value);
          })
          .catch(function () {
            GG.modules.tagHubPage.renderError(listRoot);
          });
      }
    } else {
      if (resultsSection) { resultsSection.style.display = 'none'; }
      if (directorySection) { directorySection.style.removeProperty('display'); }
      if (listRoot) {
        listRoot.innerHTML = '';
        GG.core.state.remove(listRoot, 'loading');
        GG.core.state.remove(listRoot, 'error');
      }
      applyBreadcrumb(null);
      if (titleEl) { titleEl.textContent = (tagLang && tagLang.directoryTitle) || 'Tag'; }
      if (descEl) { descEl.textContent = (tagLang && tagLang.directoryDescription) || 'Jelajahi artikel berdasarkan topik.'; }
      if (directoryRoot && GG.modules.tagDirectory && typeof GG.modules.tagDirectory.init === 'function') {
        GG.modules.tagDirectory.init(directoryRoot);
      }
    }
  };

  function buildTagCard(post) {
    // Option A: show only the active tag badge for clarity on per-tag view.
    var article = document.createElement('article');
    article.className = 'gg-post-card gg-post-card--no-thumb gg-post-card--tag';

    var link = document.createElement('a');
    link.className = 'gg-post-card__link';
    link.href = post.url || '#';
    link.setAttribute('data-gg-tag', post.tag || '');

    var visual = document.createElement('div');
    visual.className = 'gg-post-card__visual';

    var body = document.createElement('div');
    body.className = 'gg-post-card__body';

    var metaTop = document.createElement('div');
    metaTop.className = 'gg-post-card__meta-top';

    var pill = document.createElement('span');
    pill.className = 'gg-post-card__pill gg-post-card__pill--type';
    pill.textContent = post.tag ? '#' + post.tag : 'Tag';

    var datePill = document.createElement('span');
    datePill.className = 'gg-post-card__pill gg-post-card__pill--time';
    var time = document.createElement('time');
    time.className = 'gg-tags-page__date';
    if (post.publishedDate) {
      time.setAttribute('datetime', post.publishedDate);
      time.textContent = post.publishedDate.split('T')[0];
    } else {
      time.textContent = 'Published';
    }
    datePill.appendChild(time);

    metaTop.appendChild(pill);
    metaTop.appendChild(datePill);

    var title = document.createElement('h3');
    title.className = 'gg-post-card__title';
    title.textContent = post.title || 'Untitled';

    var snippet = document.createElement('p');
    snippet.className = 'gg-tags-page__snippet';
    snippet.textContent = post.snippet || '';

    body.appendChild(metaTop);
    body.appendChild(title);
    body.appendChild(snippet);

    visual.appendChild(body);
    link.appendChild(visual);
    article.appendChild(link);

    return article;
  }

  GG.modules.tagHubPage.autoInit = function (root) {
    GG.modules.tagHubPage.init(root || d);
  };
})(window.GG, document);

(function (GG, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.modules.postTagsInline = GG.modules.postTagsInline || {};
  var TagUtils = GG.modules.tagUtils || {};

  function trackClick(slug, location) {
    if (GG.analytics && typeof GG.analytics.track === 'function') {
      GG.analytics.track('tag_click', { tag: slug, location: location || 'post_footer' });
    }
  }

  function createChip(slug, location) {
    var chip = document.createElement('a');
    chip.className = 'gg-post-tags__chip';
    chip.href = TagUtils.buildTagUrl(slug);
    chip.textContent = '#' + slug;
    chip.setAttribute('data-gg-tag', slug);
    chip.setAttribute('rel', 'tag');
    chip.addEventListener('click', function () { trackClick(slug, location); });
    return chip;
  }

  GG.modules.postTagsInline.init = function (root) {
    var scope = root && root.querySelectorAll ? root : d;
    var blocks = scope.querySelectorAll ? scope.querySelectorAll('.gg-post-tags') : [];
    if (!blocks.length) { return; }

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.getAttribute('data-gg-tags-enhanced') === 'true') {
        continue;
      }
      block.setAttribute('data-gg-tags-enhanced', 'true');

      var raw = block.textContent || '';
      var matches = raw.match(/#[^#\s]+/g) || [];
      var frag = document.createDocumentFragment();
      var hasTag = false;

      for (var j = 0; j < matches.length; j++) {
        var slug = TagUtils.normalizeTag(matches[j]);
        if (!slug) { continue; }
        hasTag = true;
        frag.appendChild(createChip(slug, 'post_footer'));
      }

      block.innerHTML = '';
      if (hasTag) {
        block.appendChild(frag);
      } else if (GG.state && GG.state.isAdmin) {
        var hint = document.createElement('span');
        hint.className = 'gg-post-tags__hint';
        hint.textContent = 'Tambahkan tag manual di sini, misalnya: #blogger #ui';
        block.appendChild(hint);
      } else {
        block.setAttribute('data-gg-tags-empty', 'true');
      }
    }
  };

  function autoInitPostTags() {
    GG.modules.postTagsInline.init(d);
  }

  GG.modules.postTagsInline.autoInit = autoInitPostTags;
})(window.GG, document);

(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.state = GG.state || {};
  GG.data = GG.data || {};
  GG.data.tagFeedCache = GG.data.tagFeedCache || {};

  var TagUtils = GG.modules.tagUtils = GG.modules.tagUtils || {};

  // GAGA TAG UTILS
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
    if (mods.postcardKebab && typeof mods.postcardKebab.init === 'function') {
      mods.postcardKebab.init(scope);
    }
    if (mods.shareSheet && typeof mods.shareSheet.initShareButtons === 'function') {
      mods.shareSheet.initShareButtons(scope);
    } else if (GG.util.initShareButtons) {
      GG.util.initShareButtons(scope);
    }
  }
  GG.util.initInteractiveModules = initInteractive;
})(window.GG, document);

// SUPER LIBRARY – Add to Library (bookmark) + Library page
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

  // X-018A ACTION BRIDGE
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

(function (GG, w, d) {
  'use strict';

  GG.modules = GG.modules || {};
  GG.config = GG.config || {};
  GG.util = GG.util || {};
  GG.state = GG.state || {};

  var shareModule = GG.modules.shareSheet = GG.modules.shareSheet || {};
  var shareState = GG.state.shareSheet = GG.state.shareSheet || {};
  var focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var shareSheetEl = null;
  var lastActiveElement = null;
  var SHARE_TRIGGER_SELECTOR = '.gg-post-card__action--share, .gg-post__action--share';
  var SHARE_LABEL_SELECTOR = '.gg-post-card__action-label, .gg-post__action-label';

  var shareCfg = GG.config.sharePoster = GG.config.sharePoster || {
    width: 900,
    height: 1600,
    cardRatio: 4 / 6,
    cardScale: 0.78,
    padding: 48,
    radius: 36,
    gradientTop: '#4c1d95',
    gradientBottom: '#0f172a',
    overlayTop: 'rgba(15,23,42,0.7)',
    overlayBottom: 'rgba(15,23,42,0.9)',
    textColor: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.78)',
    cardText: '#0f172a',
    cardMeta: '#64748b'
  };
  function getShareText() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('share') : {};
  }

  function getActionsText() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('actions') : {};
  }

  function getToastText() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('toast') : {};
  }

  function sanitizeValue(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') {
      var trimmed = val.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
      return trimmed;
    }
    return val;
  }

  function getDatasetValue(node, key) {
    if (!node || !key) return '';
    var ds = node.dataset || {};
    if (Object.prototype.hasOwnProperty.call(ds, key)) {
      return sanitizeValue(ds[key]);
    }
    var attr = node.getAttribute && node.getAttribute('data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase());
    return sanitizeValue(attr);
  }

  function getMetaContent(prop) {
    if (!prop) return '';
    var el = d.querySelector('meta[property="' + prop + '"]');
    if (el && typeof el.content === 'string') {
      return sanitizeValue(el.content);
    }
    return '';
  }

  function getPosterCanvas() {
    return d.getElementById('gg-share-canvas') || d.getElementById('pc-poster-canvas') || d.getElementById('pc-share-canvas');
  }

  function noop() {}

  function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(w.navigator.userAgent || '');
  }

  function getDomain(url) {
    try {
      var u = new URL(url, w.location.href);
      return u.host.replace(/^www\./, '');
    } catch (e) {
      return (url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  function normalizeUrl(url) {
    var clean = sanitizeValue(url);
    if (!clean) return w.location.href;
    try {
      return new URL(clean, w.location.href).href;
    } catch (e) {
      return w.location.href;
    }
  }

  function resolveCtaMode() {
    var nav = w.navigator || {};
    if (isMobile() && typeof nav.share === 'function' && typeof nav.canShare === 'function') {
      return 'share';
    }
    return 'download';
  }

  function showToast(message, options) {
    var el = d.getElementById('gg-toast') || d.getElementById('pc-toast');
    if (!el) return;
    var opts = options || {};
    var toastText = getToastText();
    var textNode = el.querySelector('.gg-toast__text');
    var iconUse = el.querySelector('.gg-toast__icon use');
    var finalMessage = message || toastText.default_message || 'Berhasil disimpan.';
    if (textNode) {
      textNode.textContent = finalMessage;
    } else {
      el.textContent = finalMessage;
    }
    if (iconUse) {
      iconUse.setAttribute('href', opts.icon || '#gg-ic-check-circle-solid');
    }
    el.hidden = false;
    GG.core.state.remove(el, 'hidden');
    GG.core.state.add(el, 'visible');
    GG.core.state.add(el, 'show');
    clearTimeout(shareState.toastTimer);
    shareState.toastTimer = setTimeout(function () {
      GG.core.state.remove(el, 'visible');
      GG.core.state.remove(el, 'show');
      GG.core.state.add(el, 'hidden');
      el.hidden = true;
    }, 2000);
  }
  GG.util.showToast = showToast;

  function copyWithToast(text, options) {
    var opts = options || {};
    var shareText = getShareText();
    var toastText = getToastText();
    var successMessage = opts.message || shareText.copied || toastText.default_message || 'Link disalin';
    var errorMessage = opts.errorMessage || shareText.copy_error || toastText.error_generic || 'Gagal menyalin link';
    var successIcon = opts.icon || '#gg-ic-check-circle-solid';
    var errorIcon = opts.errorIcon || '#gg-ic-cancel-line';
    var shouldToast = opts.toast !== false;
    var copyFn = (GG.util && typeof GG.util.copyToClipboard === 'function') ? GG.util.copyToClipboard : null;
    if (!text || !copyFn) {
      if (shouldToast) {
        showToast(errorMessage, { icon: errorIcon });
      }
      return Promise.reject(new Error('copy-unavailable'));
    }
    return copyFn(text).then(function (result) {
      if (result === false) {
        throw new Error('copy-failed');
      }
      if (shouldToast) {
        showToast(successMessage, { icon: successIcon });
      }
      return result;
    }).catch(function (err) {
      if (shouldToast) {
        showToast(errorMessage, { icon: errorIcon });
      }
      throw err;
    });
  }
  function lockScroll() {
    if (d.documentElement) GG.core.state.add(d.documentElement, 'sheet-locked');
    if (d.body) GG.core.state.add(d.body, 'sheet-locked');
  }

  function unlockScroll() {
    if (d.documentElement) GG.core.state.remove(d.documentElement, 'sheet-locked');
    if (d.body) GG.core.state.remove(d.body, 'sheet-locked');
  }

  function setCtaState(sheet, state) {
    var root = sheet || shareSheetEl || d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!root) return;
    var idleIcon = root.querySelector('.gg-share-sheet__cta-icon--idle');
    var loadingIcon = root.querySelector('.gg-share-sheet__cta-icon--loading');
    var doneIcon = root.querySelector('.gg-share-sheet__cta-icon--done');
    [idleIcon, loadingIcon, doneIcon].forEach(function (el) {
      if (el) el.style.display = 'none';
    });
    var target;
    if (state === 'loading') target = loadingIcon;
    else if (state === 'done') target = doneIcon;
    else target = idleIcon;
    if (target) target.style.display = 'inline-flex';
  }

  function updateCtaLabel(sheet) {
    var root = sheet || shareSheetEl || d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!root) return resolveCtaMode();
    var labelEl = root.querySelector('.gg-share-sheet__cta-label');
    var shareText = getShareText();
    var mode = resolveCtaMode();
    var storyLabel = shareText.cta_story || shareText.cta_poster || 'Bagikan sebagai poster';
    var downloadLabel = shareText.cta_download || 'Unduh poster';
    var label = mode === 'share' ? storyLabel : downloadLabel;
    if (labelEl) {
      labelEl.textContent = label;
    }
    var ctaBtn = root.querySelector('[data-role="gg-share-cta"], [data-role="pc-share-cta"]');
    if (ctaBtn) {
      ctaBtn.setAttribute('aria-label', label);
      ctaBtn.setAttribute('data-cta-mode', mode);
    }
    var iconUse = root.querySelector('.gg-share-sheet__cta-icon--idle use');
    if (iconUse) {
      iconUse.setAttribute('href', mode === 'share' ? '#gg-ic-share-line' : '#gg-ic-arrow-down-line');
    }
    var hintEl = root.querySelector('.gg-share-sheet__hint');
    if (hintEl) {
      var mobileHint = shareText.hint_mobile || 'Bagikan ke Story = Mobile';
      var desktopHint = shareText.hint_desktop || 'Unduh poster = Desktop';
      hintEl.textContent = mobileHint + ' • ' + desktopHint;
    }
    shareState.ctaMode = mode;
    return mode;
  }

  function getMetaFromElement(trigger) {
    if (!trigger) return null;
    var host = trigger.closest('.gg-post, .post, .gg-post-card, .postcard') || trigger.closest('[data-url]');
    var url = normalizeUrl(
      getDatasetValue(trigger, 'shareUrl') ||
      getDatasetValue(host, 'url') ||
      getMetaContent('og:url')
    );
    var cover =
      getDatasetValue(trigger, 'shareCover') ||
      getDatasetValue(trigger, 'cover') ||
      getDatasetValue(host, 'cover') ||
      getMetaContent('og:image') ||
      getMetaContent('twitter:image');
    var title =
      getDatasetValue(trigger, 'shareTitle') ||
      getDatasetValue(host, 'title') ||
      getMetaContent('og:title') ||
      d.title ||
      '';
    var label =
      getDatasetValue(trigger, 'shareLabel') ||
      getDatasetValue(host, 'label') ||
      '';
    var author =
      getDatasetValue(trigger, 'shareAuthor') ||
      getDatasetValue(host, 'author') ||
      getMetaContent('article:author') ||
      '';
    var siteName =
      getDatasetValue(trigger, 'shareSiteName') ||
      getDatasetValue(host, 'siteName') ||
      getMetaContent('og:site_name') ||
      d.title ||
      '';
    var siteIcon =
      getDatasetValue(trigger, 'shareSiteIcon') ||
      getDatasetValue(host, 'siteIcon') ||
      (GG.config && (GG.config.defaultSiteIcon || GG.config.siteIcon)) ||
      '';
    if (!siteIcon && w.location && w.location.origin) {
      siteIcon = w.location.origin.replace(/\/$/, '') + '/favicon.ico';
    }
    var comments = parseInt(
      getDatasetValue(trigger, 'shareComments') ||
      getDatasetValue(host, 'comments') ||
      '0',
      10
    );
    if (!isFinite(comments)) comments = 0;
    var id =
      getDatasetValue(trigger, 'shareId') ||
      getDatasetValue(trigger, 'id') ||
      getDatasetValue(host, 'id') ||
      '';
    if (!author) author = siteName || getDomain(url);
    return {
      id: id,
      url: url,
      title: title,
      label: label,
      author: author,
      siteIcon: siteIcon,
      cover: cover,
      comments: comments,
      domain: getDomain(url),
      siteName: siteName || getDomain(url)
    };
  }

  function drawRoundedRect(ctx, x, y, wdt, hgt, radius, fillStyle) {
    var r = Math.min(radius, wdt / 2, hgt / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + wdt - r, y);
    ctx.quadraticCurveTo(x + wdt, y, x + wdt, y + r);
    ctx.lineTo(x + wdt, y + hgt - r);
    ctx.quadraticCurveTo(x + wdt, y + hgt, x + wdt - r, y + hgt);
    ctx.lineTo(x + r, y + hgt);
    ctx.quadraticCurveTo(x, y + hgt, x, y + hgt - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  }

  function drawCover(ctx, img, x, y, wdt, hgt) {
    if (!img) return;
    var scale = Math.max(wdt / img.width, hgt / img.height);
    var sw = img.width * scale;
    var sh = img.height * scale;
    var sx = x + (wdt - sw) / 2;
    var sy = y + (hgt - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
  }

  function getCover(meta) {
    var cover = meta.cover || '';
    if (cover) return Promise.resolve(cover);
    if (!meta.url) return Promise.resolve('');
    var proxy = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=';
    return fetch(proxy + encodeURIComponent(meta.url))
      .then(function (res) { return res.json(); })
      .then(function (json) {
        var audits = json && json.lighthouseResult && json.lighthouseResult.audits;
        var screenshot = audits && audits['final-screenshot'];
        var details = screenshot && screenshot.details;
        var data = details && details.data;
        return data || '';
      })
      .catch(function () { return ''; });
  }

  function renderPoster(meta, mode) {
    mode = mode || 'author';
    var canvas = getPosterCanvas();
    if (!canvas) return Promise.resolve();
    var ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve();

    canvas.width = shareCfg.width;
    canvas.height = shareCfg.height;

    var coverImg = new Image();
    var coverPromise = meta.cover ? Promise.resolve(meta.cover) : getCover(meta);

    return coverPromise.then(function (src) {
      return new Promise(function (resolve) {
        if (!src) { resolve(null); return; }
        coverImg.crossOrigin = 'anonymous';
        coverImg.onload = function () { resolve(coverImg); };
        coverImg.onerror = function () { resolve(null); };
        coverImg.src = src;
      });
    }).then(function (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, shareCfg.gradientTop);
      grad.addColorStop(1, shareCfg.gradientBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (img) {
        drawCover(ctx, img, 0, 0, canvas.width, canvas.height);
        var ov = ctx.createLinearGradient(0, 0, 0, canvas.height);
        ov.addColorStop(0, shareCfg.overlayTop);
        ov.addColorStop(1, shareCfg.overlayBottom);
        ctx.fillStyle = ov;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      var cardW = canvas.width * shareCfg.cardScale;
      var cardH = cardW / shareCfg.cardRatio;
      var cardX = (canvas.width - cardW) / 2;
      var cardY = (canvas.height - cardH) / 2;

      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, shareCfg.radius, '#fff');

      ctx.fillStyle = shareCfg.cardText;
      ctx.font = '700 48px var(--gg-font-family-base, system-ui)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      var title = meta.title || '';
      var words = title.split(/\s+/);
      var line = '';
      var lineY = cardY + shareCfg.padding;
      var maxWidth = cardW - shareCfg.padding * 2;
      var lineHeight = 54;

      words.forEach(function (word) {
        var test = line ? line + ' ' + word : word;
        var measure = ctx.measureText(test);
        if (measure.width > maxWidth && line) {
          ctx.fillText(line, cardX + shareCfg.padding, lineY);
          line = word;
          lineY += lineHeight;
        } else {
          line = test;
        }
      });
      if (line) ctx.fillText(line, cardX + shareCfg.padding, lineY);

      ctx.fillStyle = shareCfg.cardMeta;
      ctx.font = '600 28px var(--gg-font-family-base, system-ui)';
      ctx.fillText(meta.author || meta.domain, cardX + shareCfg.padding, cardY + cardH - shareCfg.padding - 40);
      ctx.fillText(meta.domain, cardX + shareCfg.padding, cardY + cardH - shareCfg.padding);
    });
  }

  function makePosterBlob(meta, mode) {
    return renderPoster(meta, mode).then(function () {
      var canvas = getPosterCanvas();
      if (!canvas) return Promise.reject(new Error('missing canvas'));
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('blob failed'));
        }, 'image/png', 0.92);
      });
    });
  }

  function canShareFile(file) {
    try {
      return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (e) {
      return false;
    }
  }

  function downloadBlob(blob, filename) {
    if (!blob) return;
    var url = URL.createObjectURL(blob);
    var a = d.createElement('a');
    a.href = url;
    a.download = filename || 'story.png';
    d.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }

  function updateModeButtons(mode) {
    if (!shareSheetEl) shareSheetEl = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!shareSheetEl) return;
    shareState.mode = mode;
    shareSheetEl.querySelectorAll('.gg-share-sheet__mode-btn').forEach(function (btn) {
      var m = btn.getAttribute('data-mode') || 'author';
      var isActive = m === mode;
      GG.core.state.toggle(btn, 'active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function applyPosterBackground(meta) {
    if (!shareSheetEl) return;
    var bg = shareSheetEl.querySelector('.gg-share-sheet__bg');
    if (!bg) return;
    if (meta.cover) {
      bg.style.backgroundImage = 'url(' + meta.cover + ')';
    } else {
      bg.style.backgroundImage = '';
    }
  }

  function focusEntry() {
    if (!shareSheetEl) return;
    var heading = shareSheetEl.querySelector('.gg-share-sheet__head');
    if (heading) {
      heading.focus();
      return;
    }
    var closeBtn = shareSheetEl.querySelector('.gg-share-sheet__close-btn');
    if (closeBtn) {
      closeBtn.focus();
      return;
    }
    var focusables = shareSheetEl.querySelectorAll(focusableSelector);
    if (focusables.length) {
      focusables[0].focus();
      return;
    }
    shareSheetEl.focus();
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    if (!shareSheetEl || !GG.core.state.has(shareSheetEl, 'open')) return;
    var focusables = shareSheetEl.querySelectorAll(focusableSelector);
    if (!focusables.length) {
      shareSheetEl.focus();
      event.preventDefault();
      return;
    }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && d.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && d.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openShareSheet(meta) {
    if (!meta) return;
    shareSheetEl = shareSheetEl || d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!shareSheetEl) return;
    shareState.meta = meta;
    shareState.mode = shareState.mode || 'author';
    lastActiveElement = d.activeElement;
    shareSheetEl.setAttribute('aria-hidden', 'false');
    GG.core.state.add(shareSheetEl, 'open');
    lockScroll();
    applyPosterBackground(meta);
    updateModeButtons(shareState.mode);
    updateCtaLabel(shareSheetEl);
    setCtaState(shareSheetEl, 'idle');
    focusEntry();
    renderPoster(meta, shareState.mode).catch(noop);
  }

  function closeShareSheet() {
    if (!shareSheetEl) shareSheetEl = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!shareSheetEl) return;
    GG.core.state.remove(shareSheetEl, 'open');
    unlockScroll();
    shareSheetEl.setAttribute('aria-hidden', 'true');
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function handleChannelShare(channel, meta) {
    var url = meta.url || w.location.href;
    var title = meta.title || d.title || '';
    var shareUrl = '';
    var shareText = getShareText();
    switch (channel) {
      case 'wa':
        shareUrl = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
        break;
      case 'fb':
        shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        break;
      case 'li':
        shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
        break;
      case 'tg':
        shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
        break;
      case 'x':
        shareUrl = 'https://x.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
        break;
      case 'mail':
        w.location.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url);
        return;
      case 'copy':
      default:
        var textToCopy = title + ' ' + url;
        copyWithToast(textToCopy).catch(function (err) { console.error('Copy failed', err); });
        return;
    }
    if (shareUrl) {
      w.open(shareUrl, '_blank', 'noopener');
    }
  }

  function sharePoster(blob, meta, filename) {
    var nav = w.navigator || {};
    var fallbackCopy = function () {
      if (!meta || !meta.url) return Promise.reject(new Error('share-unsupported'));
      return copyWithToast(meta.url, { toast: false }).then(function () { return 'copied'; });
    };
    var sharePayload = {
      title: meta.title || '',
      text: meta.title || '',
      url: meta.url || ''
    };
    if (blob && nav.share && nav.canShare && typeof w.File === 'function') {
      try {
        var file = new File([blob], filename, { type: 'image/png' });
        if (nav.canShare({ files: [file] })) {
          return nav.share({
            files: [file],
            title: sharePayload.title,
            text: sharePayload.text,
            url: sharePayload.url
          }).then(function () { return 'shared'; }).catch(function () {
            return fallbackCopy();
          });
        }
      } catch (err) {
        console.error('[GG.shareSheet] File share failed:', err);
      }
    }
    if (nav.share) {
      return nav.share(sharePayload).then(function () { return 'shared'; }).catch(function () {
        return fallbackCopy();
      });
    }
    return fallbackCopy();
  }

  function handleCtaClick() {
    var meta = shareState.meta;
    var posterMode = shareState.mode || 'author';
    var toastText = getToastText();
    var shareText = getShareText();
    if (!shareSheetEl || !meta) return;
    var ctaMode = shareState.ctaMode || updateCtaLabel(shareSheetEl);
    setCtaState(shareSheetEl, 'loading');
    makePosterBlob(meta, posterMode)
      .then(function (blob) {
        var filename = 'poster-' + (meta.id || Date.now()) + '.png';
        if (ctaMode === 'download') {
          downloadBlob(blob, filename);
          showToast(shareText.download_success || toastText.default_message || 'Poster diunduh', { icon: '#gg-ic-check-circle-solid' });
          setCtaState(shareSheetEl, 'done');
          setTimeout(function () { setCtaState(shareSheetEl, 'idle'); }, 1200);
          return null;
        }
        return sharePoster(blob, meta, filename).then(function (result) {
          if (result === 'copied') {
            showToast(shareText.copied || 'Link disalin', { icon: '#gg-ic-check-circle-solid' });
          } else {
            showToast(toastText.default_message || 'Berhasil dibagikan.', { icon: '#gg-ic-check-circle-solid' });
          }
          setCtaState(shareSheetEl, 'done');
          setTimeout(function () { setCtaState(shareSheetEl, 'idle'); }, 1200);
          return null;
        });
      })
      .catch(function (err) {
        console.error('[GG.shareSheet] Error:', err);
        var errorMessage = ctaMode === 'download'
          ? (shareText.download_error || toastText.error_generic || 'Poster gagal diunduh')
          : (toastText.error_generic || 'Terjadi kesalahan. Coba lagi nanti.');
        showToast(errorMessage, { icon: '#gg-ic-cancel-line' });
        setCtaState(shareSheetEl, 'idle');
      });
  }

  function initShareSheet() {
    shareSheetEl = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!shareSheetEl) return;
    shareModule.sheet = shareSheetEl;
    shareSheetEl.setAttribute('aria-hidden', 'true');
    shareSheetEl.setAttribute('tabindex', '-1');
    var closeBtn = shareSheetEl.querySelector('.gg-share-sheet__close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeShareSheet);
    var backdrop = shareSheetEl.querySelector('.gg-share-sheet__overlay');
    if (backdrop) backdrop.addEventListener('click', closeShareSheet);
    d.addEventListener('keydown', function (e) {
      if (!shareSheetEl || !GG.core.state.has(shareSheetEl, 'open')) return;
      if (e.key === 'Escape') {
        closeShareSheet();
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    });
    shareSheetEl.querySelectorAll('.gg-share-sheet__mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode') || 'author';
        updateModeButtons(mode);
        if (shareState.meta) {
          renderPoster(shareState.meta, mode).catch(noop);
        }
      });
    });
    var cta = shareSheetEl.querySelector('[data-role="gg-share-cta"], [data-role="pc-share-cta"]');
    if (cta) cta.addEventListener('click', handleCtaClick);
    shareSheetEl.querySelectorAll('.gg-share-sheet__social-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!shareState.meta) return;
        var channel = btn.getAttribute('data-channel');
        handleChannelShare(channel, shareState.meta);
      });
    });
    w.addEventListener('resize', function () {
      if (!shareSheetEl || !GG.core.state.has(shareSheetEl, 'open')) return;
      updateCtaLabel(shareSheetEl);
    });
  }

  function initShareButtons(root) {
    var scope = root || d;
    var triggers = scope.querySelectorAll(SHARE_TRIGGER_SELECTOR);
    if (!triggers.length) return;
    triggers.forEach(function (btn) {
      if (btn.dataset && btn.dataset.ggShareInit) return;
      if (btn.dataset) {
        btn.dataset.ggShareInit = '1';
      }
      var actionsText = getActionsText();
      var labelText = (actionsText.share) || btn.getAttribute('aria-label') || 'Bagikan';
      btn.setAttribute('aria-label', labelText);
      var labelEl = btn.querySelector(SHARE_LABEL_SELECTOR);
      if (labelEl) {
        labelEl.textContent = labelText;
      }
      btn.addEventListener('click', function (ev) {
        if (ev && ev.defaultPrevented) return;
        var meta = getMetaFromElement(btn);
        if (!meta) return;
        openShareSheet(meta);
      });
    });
  }

  function boot() {
    initShareSheet();
    initShareButtons(d);
  }

  shareModule.open = openShareSheet;
  shareModule.close = closeShareSheet;
  shareModule.renderPoster = renderPoster;
  shareModule.init = boot;
  shareModule.initShareButtons = initShareButtons;

  GG.util.getMetaFromElement = getMetaFromElement;
  GG.util.openShareSheet = openShareSheet;
  GG.util.closeShareSheet = closeShareSheet;
  GG.util.initShareButtons = initShareButtons;
})(window.GG, window, document);

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.poster = GG.modules.poster || (function(){
    var cfg = {
      width: 1080,
      height: 1920,
      padding: 80,
      brand: 'pakrpp.com'
    };

    function proxyUrl(src){
      if (!src) return '';
      if (/^data:|^blob:/i.test(src)) return src;
      try {
        var u = new URL(src, w.location.href);
        if (u.pathname.indexOf('/api/proxy') === 0) return u.toString();
        return '/api/proxy?url=' + encodeURIComponent(u.toString());
      } catch (e) {
        return '';
      }
    }

    function loadImage(src){
      return new Promise(function(resolve){
        if (!src) { resolve(null); return; }
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function(){ resolve(img); };
        img.onerror = function(){ resolve(null); };
        img.src = src;
      });
    }

    function getCanvas(){
      return d.getElementById('gg-share-canvas') ||
        d.getElementById('pc-poster-canvas') ||
        (function(){ var c = d.createElement('canvas'); return c; })();
    }

    function getMeta(article){
      if (GG.util && typeof GG.util.getMetaFromElement === 'function') {
        var meta = GG.util.getMetaFromElement(article);
        if (meta) return meta;
      }
      var title = article ? (article.querySelector('.gg-post__title') || {}).textContent : '';
      title = (title || d.title || '').trim();
      var imgEl = article ? article.querySelector('img') : null;
      var cover = imgEl ? (imgEl.getAttribute('src') || '') : '';
      if (!cover) {
        var og = d.querySelector('meta[property="og:image"], meta[name="og:image"]');
        cover = og ? (og.getAttribute('content') || '') : '';
      }
      return {
        title: title,
        url: w.location.href,
        cover: cover,
        domain: (w.location && w.location.hostname) || '',
        siteName: (w.location && w.location.hostname) || ''
      };
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight){
      if (!text) return y;
      var words = String(text).split(/\s+/);
      var line = '';
      for (var i = 0; i < words.length; i++) {
        var test = line ? line + ' ' + words[i] : words[i];
        var wdt = ctx.measureText(test).width;
        if (wdt > maxWidth && line) {
          ctx.fillText(line, x, y);
          line = words[i];
          y += lineHeight;
        } else {
          line = test;
        }
      }
      if (line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
      }
      return y;
    }

    function draw(meta){
      var canvas = getCanvas();
      canvas.width = cfg.width;
      canvas.height = cfg.height;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var coverSrc = proxyUrl(meta.cover || '');
      return loadImage(coverSrc).then(function(img){
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (img) {
          var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          var iw = img.width * scale;
          var ih = img.height * scale;
          var ix = (canvas.width - iw) / 2;
          var iy = (canvas.height - ih) / 2;
          ctx.drawImage(img, ix, iy, iw, ih);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '700 64px system-ui, -apple-system, Segoe UI, sans-serif';
        var x = cfg.padding;
        var y = cfg.padding + 120;
        var maxWidth = canvas.width - cfg.padding * 2;
        y = wrapText(ctx, meta.title || '', x, y, maxWidth, 72);

        ctx.font = '500 34px system-ui, -apple-system, Segoe UI, sans-serif';
        ctx.fillText(cfg.brand, x, canvas.height - cfg.padding - 40);

        return canvas;
      });
    }

    function toBlob(canvas){
      return new Promise(function(resolve, reject){
        canvas.toBlob(function(blob){
          if (blob) resolve(blob);
          else reject(new Error('blob-failed'));
        }, 'image/png', 0.92);
      });
    }

    function share(meta){
      return draw(meta).then(function(canvas){
        return toBlob(canvas);
      }).then(function(blob){
        var file = new File([blob], 'poster.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], title: meta.title || d.title }).catch(function(){});
        }
        var url = URL.createObjectURL(blob);
        var a = d.createElement('a');
        a.href = url;
        a.download = 'poster.png';
        d.body.appendChild(a);
        a.click();
        setTimeout(function(){
          URL.revokeObjectURL(url);
          a.remove();
        }, 1000);
        return null;
      }).catch(function(err){
        if (GG.util && typeof GG.util.showToast === 'function') {
          GG.util.showToast('Poster gagal dibuat', { icon: '#gg-ic-cancel-line' });
        }
        if (GG.core && typeof GG.core.telemetry === 'function') {
          GG.core.telemetry({ type: 'poster', stage: 'share', message: err && err.message ? err.message : 'error' });
        }
        return null;
      });
    }

    function shareFromArticle(article){
      var meta = getMeta(article || d.querySelector('.gg-post[data-gg-module="post-detail"]'));
      if (!meta) return;
      if (meta.cover && meta.cover.indexOf('data:') === 0) meta.cover = '';
      return share(meta);
    }

    return { share: share, shareFromArticle: shareFromArticle };
  })();
})(window.GG, window, document);

(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.util = GG.util || {};
  GG.config = GG.config || {};
  var PosterCanvas = GG.modules.posterCanvas = GG.modules.posterCanvas || {};
  var U  = GG.util;
  var SHARE_TRIGGER_SELECTOR = '.gg-post-card__action--share, .gg-post__action--share';
  function shareSheetPresent(){
    return !!(d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet'));
  }
  if (shareSheetPresent() && GG.modules.shareSheet && typeof GG.modules.shareSheet.open === 'function') {
    PosterCanvas.disabled = true;
    return;
  }
  function getShareLang() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('share') : {};
  }

  var sheet, canvas, ctx, btnClose, btnSave, hint;

  function initPosterSheet() {
    sheet   = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet) return;

    canvas  = sheet.querySelector('#gg-share-canvas') || sheet.querySelector('#pc-share-canvas');
    if (!canvas || !canvas.getContext) return;
    ctx     = canvas.getContext('2d');

    btnClose = sheet.querySelector('.gg-share-sheet__close-btn');
    btnSave  = sheet.querySelector('.gg-share-sheet__cta');
    hint     = sheet.querySelector('.gg-share-sheet__hint');

    // Set label CTA + hint berdasar dukungan Web Share API (file)
    var fileShareSupported = false;
    try {
      fileShareSupported = !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.txt', { type: 'text/plain' })] }));
    } catch (e) {}

    var ctaLabel = sheet.querySelector('.gg-share-sheet__cta-label');
    var shareLang = getShareLang();
    var posterLabel = shareLang.cta_poster || 'Bagikan sebagai poster';
    var fallbackLabel = shareLang.cta_link || 'Salin tautan';
    if (ctaLabel) {
      ctaLabel.textContent = fileShareSupported ? posterLabel : fallbackLabel;
    }
    if (hint) {
      hint.textContent = fileShareSupported
        ? posterLabel + ' = Mobile • ' + fallbackLabel + ' = Desktop'
        : fallbackLabel + ' = Desktop';
    }

    if (btnClose) {
      btnClose.addEventListener('click', closeSheet);
    }
    // klik di luar panel untuk tutup
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) closeSheet();
    });

    if (btnSave) {
      btnSave.addEventListener('click', function () {
        saveOrShare(fileShareSupported);
      });
    }

    // binding tombol share di kartu & post detail
    d.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest(SHARE_TRIGGER_SELECTOR);
      if (!btn) return;
      e.preventDefault();

      var meta = {
        title:  btn.getAttribute('data-share-title')  || (btn.dataset && btn.dataset.shareTitle)  || d.title,
        url:    btn.getAttribute('data-share-url')    || (btn.dataset && btn.dataset.shareUrl)    || location.href,
        label:  btn.getAttribute('data-share-label')  || (btn.dataset && btn.dataset.shareLabel)  || '',
        author: btn.getAttribute('data-share-author') || (btn.dataset && btn.dataset.shareAuthor) || '',
        site:   (w.location && w.location.hostname) || ''
      };

      // kalau ada thumbnail, pakai sebagai blur background (CSS, bukan canvas)
      var cover = btn.getAttribute('data-share-cover') || (btn.dataset && btn.dataset.shareCover) || '';
      var bg = sheet.querySelector('.gg-share-sheet__bg');
      if (bg && cover) {
        bg.style.backgroundImage = 'url(' + cover + ')';
      }

      openSheet(meta);
    });

    // icon sosial di bawah (untuk share link biasa)
    sheet.querySelectorAll('.gg-share-sheet__social-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        var ch = el.getAttribute('data-channel');
        shareLinkBasic(ch);
      });
    });
  }

  function openSheet(meta) {
    if (!sheet || !ctx) return;
    drawPoster(meta);
    GG.core.state.add(sheet, 'open');
  }

  function closeSheet() {
    if (!sheet) return;
    GG.core.state.remove(sheet, 'open');
  }

  // gambar poster sederhana (background gradient + kartu putih + title + author + site)
  function drawPoster(meta) {
    var w = canvas.width;
    var h = canvas.height;

    // background gradient (sesuai mockup)
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1d105f');
    g.addColorStop(1, '#020617');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // kartu 4:5 di tengah
    var cardW = w * 0.78;
    var cardH = cardW * 5 / 4;
    var cardX = (w - cardW) / 2;
    var cardY = (h - cardH) / 2;
    var radius = 40;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // judul
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'top';
    wrapText(ctx, meta.title || '', cardX + 52, cardY + 110, cardW - 104, 54);

    // author (kiri bawah)
    ctx.fillStyle = '#4b5563';
    ctx.font = '24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    if (meta.author) {
      ctx.fillText(meta.author, cardX + 52, cardY + cardH - 70);
    }

    // site (kanan bawah)
    var site = meta.site || meta.url;
    if (site) {
      var m = ctx.measureText(site);
      ctx.fillText(site, cardX + cardW - 52 - m.width, cardY + cardH - 70);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    var words = String(text).split(/\s+/);
    var line  = '';
    for (var n = 0; n < words.length; n++) {
      var testLine = line + (line ? ' ' : '') + words[n];
      var metrics  = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  // simpan / share file PNG
  function saveOrShare(fileShareSupported) {
    if (!canvas) return;
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], 'story.png', { type: 'image/png' });

      if (fileShareSupported && navigator.share && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: d.title || 'Story'
        }).catch(function(){});
      } else {
        var a = d.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'story.png';
        d.body.appendChild(a);
        a.click();
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 2000);
      }
    }, 'image/png', 0.92);
  }

  // share link biasa dari ikon sosmed
  function shareLinkBasic(channel) {
    var url  = encodeURIComponent(location.href);
    var text = encodeURIComponent(d.title || '');
    var shareUrl = '';

    if (channel === 'wa') {
      shareUrl = 'https://wa.me/?text=' + text + '%20' + url;
    } else if (channel === 'tg') {
      shareUrl = 'https://t.me/share/url?url=' + url + '&text=' + text;
    } else if (channel === 'fb') {
      shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    } else if (channel === 'li') {
      shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
    } else if (channel === 'mail') {
      shareUrl = 'mailto:?subject=' + text + '&body=' + url;
    } else if (channel === 'copy') {
      if (GG.util && typeof GG.util.copyToClipboard === 'function') {
        GG.util.copyToClipboard(location.href).then(function () {
          if (GG.util && typeof GG.util.showToast === 'function') {
            var shareLang = getShareLang();
            GG.util.showToast(shareLang.copied || 'Link disalin', { icon: '#gg-ic-check-circle-solid' });
          }
        }).catch(function (err) {
          if (GG.util && typeof GG.util.showToast === 'function') {
            var shareLang = getShareLang();
            GG.util.showToast(
              shareLang.copy_error || 'Gagal menyalin link',
              { icon: '#gg-ic-cancel-line' }
            );
          }
          console.error('Copy failed', err);
        });
      }
    }

    if (shareUrl) {
      w.open(shareUrl, '_blank', 'noopener');
    }
  }

  PosterCanvas.open = openSheet;
  PosterCanvas.close = closeSheet;
  PosterCanvas.init = initPosterSheet;
})(window.GG, window, document);
(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  GG.util = GG.util || {};
  GG.config = GG.config || {};
  var PosterEngine = GG.modules.posterEngine = GG.modules.posterEngine || {};
  var U  = GG.util;
  var SHARE_TRIGGER_SELECTOR = '.gg-post-card__action--share, .gg-post__action--share';

  function getShareLang() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('share') : {};
  }

  function getToastLang() {
    return (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('toast') : {};
  }

  /* ============ CONFIG POSTER ============ */
  GG.config.poster = GG.config.poster || {
    width: 1080,
    height: 1920,
    cardScale: 0.80,   // lebar kartu relatif pada canvas
    cardRadius: 64,
    headerHeight: 112,
    footerHeight: 96,
    headerRadius: 28,  // ~1.5rem
    footerRadius: 28
  };


  /* ====== LIBRARY CONFIG ====== */
  GG.config.library = GG.config.library || {};
  if (!GG.config.library.storageKey) {
    GG.config.library.storageKey = 'GG_LIBRARY_V1';
  }
  GG.config.library.pageUrl = GG.config.library.pageUrl || 'https://pakrpp.blogspot.com/p/library.html';
  var libLang = (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('library') : {};
  var actionsLang = (GG.util && GG.util.getLangPack) ? GG.util.getLangPack('actions') : {};
  var LIB_DEFAULT_MESSAGES = {
    add: libLang.bookmark_add || actionsLang.bookmark_add || 'Tambahkan ke Library',
    in: libLang.bookmark_inLibrary || actionsLang.bookmark_inLibrary || 'Dalam Library',
    saved: libLang.toast_saved || 'Disimpan ke Library',
    removed: libLang.toast_removed || 'Dihapus dari Library',
    empty: libLang.empty || 'Belum ada posting disimpan',
    removeBtn: libLang.remove_button || 'Hapus dari Library'
  };
  GG.config.library.messages = GG.config.library.messages || {};
  Object.keys(LIB_DEFAULT_MESSAGES).forEach(function (key) {
    if (!GG.config.library.messages.hasOwnProperty(key) || !GG.config.library.messages[key]) {
      GG.config.library.messages[key] = LIB_DEFAULT_MESSAGES[key];
    }
  });
  GG.config.library.selectors = GG.config.library.selectors || {};
  GG.config.library.selectors.buttons = GG.config.library.selectors.buttons || '.gg-post-card__action--bookmark, .gg-post__action--bookmark';
  GG.config.library.selectors.list = GG.config.library.selectors.list || '.gg-library-list, #gg-library-list';
  GG.config.library.selectors.empty = GG.config.library.selectors.empty || '#gg-library-empty';


  // Avatar & favicon default
  GG.config.authorAvatarMap = GG.config.authorAvatarMap || {
  // pakai URL asli yang kamu mau:
  'Pak RPP'    : 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvwoyib0SbHdRWPvh0kkeSCu_rlWeb2bXM2XylpGu9Zl7Pmeg5csuPXuyDW0Tq1Q6Q3C3y0aOaxfGd6PCyQeus6XITellrxOutl2Y9c6jLv_KmvlfOCGCY8O2Zmud32hwghg_a0HfskdDAnCI108_vQ4U-DNilI_QF9r0gphOdThjtHLg/s1600/OGcircle.png',
  'Adi Putra'  : 'https://via.placeholder.com/512x512.png?text=AP',   // ganti kalau sudah punya
  'Bella Putri': 'https://via.placeholder.com/512x512.png?text=BP'    // ganti kalau sudah punya
};

  GG.config.defaultAuthorAvatar = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjvwoyib0SbHdRWPvh0kkeSCu_rlWeb2bXM2XylpGu9Zl7Pmeg5csuPXuyDW0Tq1Q6Q3C3y0aOaxfGd6PCyQeus6XITellrxOutl2Y9c6jLv_KmvlfOCGCY8O2Zmud32hwghg_a0HfskdDAnCI108_vQ4U-DNilI_QF9r0gphOdThjtHLg/s1600/OGcircle.png';
  GG.config.defaultSiteIcon   = 'https://gagabibliotheke.blogspot.com/favicon.ico';

GG.config.labelPillMap = GG.config.labelPillMap || {
  // key pakai lower-case
  'blog' : { bg: '#FF00FF', text: '#fef2f2' },
  'vlog' : { bg: '#00FFFF', text: '#000000' },
  'alog' : { bg: '#fff000', text: '#000000' },

  // fallback global
  'default': { bg: '#111827', text: '#f9fafb' }
};

  GG.config.authors = GG.config.authors || {};
  if (!GG.config.authors['Pak RPP']) {
    GG.config.authors['Pak RPP'] = '/p/pak-rpp.html';
  }


  /* ============ HELPER DASAR ============ */

U.getLabelPillStyle = function (label) {
  var map = GG.config.labelPillMap || {};
  var key = String(label || '').trim().toLowerCase();
  var conf = map[key] || map['default'] || { bg: '#ef4444', text: '#fef2f2' };
  return conf;
};


U.getAuthorAvatar = function (name, meta) {
  var map = GG.config.authorAvatarMap || {};
  var raw = String(name || '').trim();
  if (!raw) return meta.siteIcon || meta.cover || '';

  // coba exact
  if (map[raw]) return map[raw];

  // coba lower-case
  var lower = raw.toLowerCase();
  if (map[lower]) return map[lower];

  // coba slug (pak-rpp)
  var slug = lower.replace(/\s+/g, '-');
  if (map[slug]) return map[slug];

  // fallback favicon / cover
  return meta.siteIcon || meta.cover || '';
};



  function loadImage(src) {
    return new Promise(function (resolve) {
      if (!src) { resolve(null); return; }
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillRoundedRect(ctx, x, y, w, h, r, color) {
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function wrapText(text, ctx, maxWidth, lineHeight) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var testLine = line ? (line + ' ' + words[i]) : words[i];
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    // batasi 4 baris
    if (lines.length > 4) {
      var rest = lines.slice(3).join(' ');
      lines = lines.slice(0, 3);
      lines.push(rest);
    }
    return lines;
  }

  function getDomain(url) {
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      return (url || '').replace(/^https?:\/\//, '');
    }
  }

  function getSiteName(meta) {
    if (meta.siteName) return meta.siteName;
    var og = d.querySelector('meta[property="og:site_name"]');
    if (og && og.content) return og.content;
    var title = d.title || '';
    if (title.indexOf('-') > -1) {
      return title.split('-')[0].trim();
    }
    return getDomain(meta.url);
  }

  function isMobileViewport() {
    return !!(w.matchMedia && w.matchMedia('(max-width: 768px)').matches);
  }

  function showToast(msg, options) {
    if (GG.util && typeof GG.util.showToast === 'function') {
      GG.util.showToast(msg || (getToastLang().default_message || 'Berhasil disimpan.'), options || {});
    }
  }

  /* ============ BACA META DARI TOMBOL SHARE ============ */
  U.buildShareMeta = function (btn) {
    var ds = btn.dataset || {};
    var host = btn.closest('[data-url]') || d.body;
    var hs = host.dataset || {};

    var meta = {
      title:   ds.shareTitle   || hs.title   || d.title,
      url:     ds.shareUrl     || hs.url     || w.location.href,
      label:   ds.shareLabel   || hs.label   || '',
      author:  ds.shareAuthor  || hs.author  || '',
      siteIcon:ds.shareSiteIcon|| hs.siteIcon|| '',
      cover:   ds.shareCover   || hs.cover   || '',
      comments:parseInt(ds.shareComments || hs.comments || '0', 10) || 0,
      siteName:ds.shareSiteName|| hs.siteName|| ''
    };

    meta.domain   = getDomain(meta.url);
    meta.siteName = getSiteName(meta);

    return meta;
  };

  /* ============ RENDER POSTER KE CANVAS ============ */
  U.renderPoster = function (meta, mode) {
    if (!meta) return Promise.resolve(null);
    mode = mode || 'author';

    var cfg = GG.config.poster;
    var canvas = d.getElementById('gg-share-canvas') || d.getElementById('pc-poster-canvas');
    if (!canvas) return Promise.resolve(null);

    canvas.width  = cfg.width;
    canvas.height = cfg.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cfg.width, cfg.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // kartu: lebar fix, tinggi = header + gambar(4:5) + footer
    var cardW = cfg.width * cfg.cardScale;
    var imageH = cardW * 5 / 4; // area foto 4:5
    var cardH = cfg.headerHeight + imageH + cfg.footerHeight;

    var cardX = (cfg.width  - cardW) / 2;
    var cardY = (cfg.height - cardH) / 2;

    var headerH = cfg.headerHeight;
    var footerH = cfg.footerHeight;
    var headerPadX   = 40;
    var bodyPadSide  = 56;

    return loadImage(meta.cover).then(function (coverImg) {
      // ===== bg 9:16 blur =====
      if (coverImg) {
        var s = Math.max(cfg.width / coverImg.width, cfg.height / coverImg.height);
        var iw = coverImg.width * s;
        var ih = coverImg.height * s;
        var ix = (cfg.width  - iw) / 2;
        var iy = (cfg.height - ih) / 2;
ctx.save();
ctx.filter = 'blur(26px)';
ctx.drawImage(coverImg, ix, iy, iw, ih);
ctx.filter = 'none';
ctx.restore();

var gBg = ctx.createLinearGradient(0, 0, 0, cfg.height);
gBg.addColorStop(0, 'rgba(15,23,42,0.20)');
gBg.addColorStop(1, 'rgba(15,23,42,0.70)');
ctx.fillStyle = gBg;
ctx.fillRect(0, 0, cfg.width, cfg.height);
      } else {
        var gg = ctx.createLinearGradient(0, 0, 0, cfg.height);
        gg.addColorStop(0, '#4c1d95');
        gg.addColorStop(1, '#0f172a');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, cfg.width, cfg.height);
      }

// ===== kartu putih 4:5 + bayangan halus =====
ctx.save();
ctx.shadowColor   = 'rgba(15,23,42,0.30)'; // warna bayangan tipis
ctx.shadowBlur    = 40;                    // lembut
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 24;

// gambar kartu putih + shadow
fillRoundedRect(ctx, cardX, cardY, cardW, cardH, cfg.cardRadius, '#ffffff');

ctx.restore();


      // ===== area gambar 4:5 (di tengah kartu) =====
      if (coverImg) {
        var imgY = cardY + headerH;
        var imgH = imageH;

        ctx.save();
        // tidak ada radius: murni 4:5
        ctx.beginPath();
        ctx.rect(cardX, imgY, cardW, imgH);
        ctx.closePath();
        ctx.clip();

        var s2 = Math.max(cardW / coverImg.width, imgH / coverImg.height);
        var iw2 = coverImg.width * s2;
        var ih2 = coverImg.height * s2;
        var ix2 = cardX + (cardW - iw2) / 2;
        var iy2 = imgY + (imgH - ih2) / 2;
        ctx.drawImage(coverImg, ix2, iy2, iw2, ih2);

        // overlay gelap utk teks
        var gOv = ctx.createLinearGradient(0, imgY, 0, imgY + imgH);
        gOv.addColorStop(0, 'rgba(15,23,42,0.20)');
        gOv.addColorStop(1, 'rgba(15,23,42,0.55)');
        ctx.fillStyle = gOv;
        ctx.fillRect(cardX, imgY, cardW, imgH);
        ctx.restore();
      }

      // ===== header & footer putih dgn radius 1.5rem =====
      // header: radius di pojok atas
      (function () {
        var r = cfg.headerRadius;
        var x = cardX;
        var y = cardY;
        var w = cardW;
        var h = headerH;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }());

      // footer: radius di pojok bawah
      (function () {
        var r = cfg.footerRadius;
        var x = cardX;
        var h = footerH;
        var w = cardW;
        var y = cardY + cardH - h;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }());

      // ===== header: avatar circle + nama + label =====
      var centerHeaderY = cardY + headerH / 2;
      var avatarSize = 48;
      var avatarX = cardX + headerPadX;
      var avatarY = centerHeaderY - avatarSize / 2;

      var avatarSrc;
      var authorKey = (meta.author || '').trim(); // normalisasi nama author
      if (mode === 'author') {
        avatarSrc =
          (GG.config.authorAvatarMap && GG.config.authorAvatarMap[meta.author]) ||
          GG.config.defaultAuthorAvatar ||
          meta.siteIcon ||
          meta.cover;
      } else {
        avatarSrc =
          meta.siteIcon ||
          GG.config.defaultSiteIcon ||
          GG.config.defaultAuthorAvatar;
      }

      var headerName = (mode === 'author'
        ? (meta.author || meta.siteName)
        : meta.siteName);

      return loadImage(avatarSrc).then(function (avatarImg) {
        var aCx = avatarX + avatarSize / 2;
        var aCy = centerHeaderY;
        ctx.save();
        ctx.beginPath();
        ctx.arc(aCx, aCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (avatarImg) {
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        } else {
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
        }
        ctx.restore();

        // nama
        ctx.fillStyle = '#111827';
        ctx.font = '600 30px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(headerName || '', avatarX + avatarSize + 18, centerHeaderY);

// pill label di kanan
if (meta.label) {
  var pillText = meta.label;
  var pillStyle = U.getLabelPillStyle(pillText);

  ctx.font = '600 22px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif';
  var tw = ctx.measureText(pillText).width;
  var padX = 22;
  var pillW = tw + padX * 2;
  var pillH = 40;
  var pillX = cardX + cardW - headerPadX - pillW;
  var pillY = centerHeaderY - pillH / 2;

  fillRoundedRect(ctx, pillX, pillY, pillW, pillH, 999, pillStyle.bg);

  ctx.fillStyle = pillStyle.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, pillX + padX, centerHeaderY);
}


        // ===== body text =====
        var bodyTop = cardY + headerH + 32;
        var bodyBottom = cardY + headerH + imageH - 32;
        var bodyHeight = bodyBottom - bodyTop;
        var bodyWidth  = cardW - bodyPadSide * 2;

        ctx.font = '700 40px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif';
        ctx.fillStyle = '#f9fafb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        var lines = wrapText(meta.title, ctx, bodyWidth, 48);
        var totalHeight = lines.length * 48 + (lines.length - 1) * 10;
        var startY = bodyTop + (bodyHeight - totalHeight) / 2;

        for (var i = 0; i < lines.length; i++) {
          var ly = startY + i * (48 + 10);
          ctx.fillText(lines[i], cfg.width / 2, ly);
        }

        // ===== footer =====
        var footerCenterY = cardY + cardH - footerH / 2;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111827';
        ctx.font = '400 22px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif';

        if (meta.comments && meta.comments > 0) {
          // bubble comment ala ic-comment
          var bW = 44;
          var bH = 30;
          var bX = cardX + headerPadX;
          var bY = footerCenterY - bH / 2;
          var r = 8;

          ctx.beginPath();
          ctx.moveTo(bX + r, bY);
          ctx.lineTo(bX + bW - r, bY);
          ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + r);
          ctx.lineTo(bX + bW, bY + bH - r - 6);
          ctx.quadraticCurveTo(bX + bW, bY + bH - 6, bX + bW - r, bY + bH - 6);
          ctx.lineTo(bX + bW / 2 + 6, bY + bH - 6);
          ctx.lineTo(bX + bW / 2, bY + bH);
          ctx.lineTo(bX + bW / 2 - 6, bY + bH - 6);
          ctx.lineTo(bX + r, bY + bH - 6);
          ctx.quadraticCurveTo(bX, bY + bH - 6, bX, bY + bH - r - 6);
          ctx.lineTo(bX, bY + r);
          ctx.quadraticCurveTo(bX, bY, bX + r, bY);
          ctx.closePath();
          ctx.fillStyle = '#0f172a';
          ctx.fill();

          // tiga titik
          ctx.fillStyle = '#f9fafb';
          var dotY = bY + bH / 2 - 2;
          var dotR = 2;
          var dotSpace = 6;
          ctx.beginPath();
          for (var j = -1; j <= 1; j++) {
            var cx = bX + bW / 2 + j * dotSpace;
            ctx.moveTo(cx + dotR, dotY);
            ctx.arc(cx, dotY, dotR, 0, Math.PI * 2);
          }
          ctx.fill();

          // angka komentar
          ctx.fillStyle = '#111827';
          ctx.font = '400 22px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(String(meta.comments), bX + bW + 10, footerCenterY);
        }

        // domain kanan
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6b7280';
        ctx.font = '400 20px system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif';
        ctx.fillText(meta.domain, cardX + cardW - headerPadX, footerCenterY);

        ctx.textAlign = 'left';
        return canvas;
      });
    });
  };

  /* ============ UI SHEET ADD STORY ============ */
  function setModeUi(sheet, mode) {
    sheet.setAttribute('data-mode', mode);
    var btns = sheet.querySelectorAll('.gg-share-sheet__mode-btn');
    for (var i = 0; i < btns.length; i++) {
      var m = btns[i].getAttribute('data-mode');
      if (m === mode) GG.core.state.add(btns[i], 'active');
      else GG.core.state.remove(btns[i], 'active');
    }
  }

  function updateCtaLabel() {
    var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet) return;
    var btn = sheet.querySelector('.gg-share-sheet__cta');
    if (!btn) return;
    var shareLang = getShareLang();
    var label = isMobileViewport()
      ? (shareLang.cta_poster || 'Bagikan sebagai poster')
      : (shareLang.cta_link || 'Salin tautan');
    btn.textContent = label;
  }

function openPosterSheet(meta, mode) {
  var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
  if (!sheet || !meta) return;
  mode = mode || 'author';
  sheet._pcMeta = meta;
  setModeUi(sheet, mode);
  GG.core.state.add(sheet, 'open');
  sheet.setAttribute('aria-hidden', 'false');

  // 🔹 Trigger gesture SUPER SHARE PREMIUM saat sheet dibuka
  if (w.GG && w.GG.modules && w.GG.modules.shareMotion && typeof w.GG.modules.shareMotion.onOpen === 'function') {
    w.GG.modules.shareMotion.onOpen();
  }

  U.renderPoster(meta, mode);
}


  function closePosterSheet() {
    var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet) return;
    GG.core.state.remove(sheet, 'open');
    sheet.setAttribute('aria-hidden', 'true');
  }

  function shareViaChannel(channel, meta) {
    if (!meta) return;
    var url   = encodeURIComponent(meta.url || '');
    var text  = encodeURIComponent(meta.title || '');
    var win   = null;

    switch (channel) {
      case 'wa':
        win = 'https://wa.me/?text=' + text + '%20' + url;
        break;
      case 'tg':
        win = 'https://t.me/share/url?url=' + url + '&text=' + text;
        break;
      case 'fb':
        win = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
        break;
      case 'in':
        win = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
        break;
      case 'x':
        win = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text;
        break;
      case 'mail':
        win = 'mailto:?subject=' + text + '&body=' + text + '%0A%0A' + url;
        break;
      case 'copy':
        if (GG.util && typeof GG.util.copyToClipboard === 'function') {
          GG.util.copyToClipboard(meta.url || w.location.href).then(function () {
            showToast(getShareLang().copied || 'Link disalin', { icon: '#gg-ic-check-circle-solid' });
          }).catch(function () {
            showToast(
              getShareLang().copy_error || getToastLang().error_generic || 'Gagal menyalin link',
              { icon: '#gg-ic-cancel-line' }
            );
          });
        }
        return;
    }
    if (win) window.open(win, '_blank', 'noopener');
  }

  function initPosterUiOnce() {
    var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet || sheet._pcInit) return;
    sheet._pcInit = true;

    // close
    var btnClose = sheet.querySelector('.gg-share-sheet__close-btn');
    if (btnClose) {
      btnClose.addEventListener('click', function () { closePosterSheet(); });
    }
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) closePosterSheet();
    });

    // toggle Author / Site
    var mBtns = sheet.querySelectorAll('.gg-share-sheet__mode-btn');
    for (var i = 0; i < mBtns.length; i++) {
      mBtns[i].addEventListener('click', function () {
        var mode = this.getAttribute('data-mode') || 'author';
        var sh = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
        if (!sh || !sh._pcMeta) return;
        setModeUi(sh, mode);
        U.renderPoster(sh._pcMeta, mode);
      });
    }

    // CTA utama
    var btnSave = sheet.querySelector('.gg-share-sheet__cta');
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        var sh = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
        if (!sh || !sh._pcMeta) return;
        var mode = sh.getAttribute('data-mode') || 'author';

        U.renderPoster(sh._pcMeta, mode).then(function (canvas) {
          if (!canvas) return;

          var isMob = isMobileViewport();

          // mobile: auto copy link
          if (isMob && navigator.clipboard && sh._pcMeta.url) {
            navigator.clipboard.writeText(sh._pcMeta.url).catch(function () {});
          }

          // Web Share API file (mobile)
          var canFileShare = !!(navigator.canShare && w.Blob && w.File);
          if (isMob && navigator.share && canFileShare) {
            canvas.toBlob(function (blob) {
              if (!blob) return downloadPng(canvas, sh._pcMeta);
              var file = new File([blob], 'story.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                navigator.share({
                  files: [file],
                  title: sh._pcMeta.title || '',
                  text:  sh._pcMeta.title || '',
                  url:   sh._pcMeta.url   || ''
                }).catch(function () {
                  downloadPng(canvas, sh._pcMeta);
                });
              } else {
                downloadPng(canvas, sh._pcMeta);
              }
            }, 'image/png', 0.92);
          } else {
            // desktop: langsung download
            downloadPng(canvas, sh._pcMeta);
          }
        });
      });
    }

    // ikon sosial bawah
    var socials = sheet.querySelectorAll('.gg-share-sheet__social-btn[data-channel]');
    for (var s = 0; s < socials.length; s++) {
      socials[s].addEventListener('click', function () {
        var channel = this.getAttribute('data-channel');
        var sh = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
        if (!sh || !sh._pcMeta) return;
        shareViaChannel(channel, sh._pcMeta);
      });
    }

    // label tombol mengikuti viewport
    updateCtaLabel();
    w.addEventListener('resize', updateCtaLabel);
  }

  function downloadPng(canvas, meta) {
    var a = d.createElement('a');
    a.href = canvas.toDataURL('image/png');
    var slug = (meta && meta.title ? meta.title : 'story')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    a.download = (slug || 'story') + '.png';
    d.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); }, 0);
  }

  /* ============ INIT SHARE BUTTONS ============ */
  U.initSuperShare = function () {
    initPosterUiOnce();
    var buttons = d.querySelectorAll(SHARE_TRIGGER_SELECTOR);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        var meta = U.buildShareMeta(this);
        openPosterSheet(meta, 'author');
      });
    }
  };

  PosterEngine.init = U.initSuperShare;
})(window.GG, window, document);

// SUPER SHARE PREMIUM &#8211; Motion & Microinteraction
(function (GG, w, d) {
  'use strict';
  GG.modules = GG.modules || {};
  var Motion = GG.modules.shareMotion = GG.modules.shareMotion || {};
  var SHARE_TRIGGER_SELECTOR = '.gg-post-card__action--share, .gg-post__action--share';
  var prefersReduced = w.matchMedia &&
                       w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Motion.onOpen = function () {
    if (prefersReduced) return;

    var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet) return;

    var panel = sheet.querySelector('.gg-share-sheet');
    if (panel) {
      GG.core.state.remove(panel, 'anim-in');
      void panel.offsetWidth;
      GG.core.state.add(panel, 'anim-in');
    }

    var firstSocial = sheet.querySelector('.gg-share-sheet__social-btn');
    if (firstSocial) {
      GG.core.state.remove(firstSocial, 'nudge');
      void firstSocial.offsetWidth;
      GG.core.state.add(firstSocial, 'nudge');
      setTimeout(function () {
        GG.core.state.remove(firstSocial, 'nudge');
      }, 320);
    }
  };

  Motion.init = function () {
    var sheet = d.getElementById('gg-share-sheet') || d.getElementById('pc-poster-sheet');
    if (!sheet || sheet._motionInit) return;
    sheet._motionInit = true;

    var card    = sheet.querySelector('.gg-share-sheet');
    var canvas  = sheet.querySelector('.gg-share-sheet__canvas');
    var saveBtn = sheet.querySelector('.gg-share-sheet__cta');
    var socials = sheet.querySelectorAll('.gg-share-sheet__social-btn');
    var modeBtns = sheet.querySelectorAll('.gg-share-sheet__mode-btn');

    /* ========== 1. Parallax halus pada card & canvas ==========
       - aktif hanya jika tidak prefers-reduced-motion
       - hanya untuk pointer mouse biar layar sentuh tidak goyang   */
    if (!prefersReduced && card) {
      var maxTilt = 8;     // derajat
      var maxMove = 12;    // px

      var onMove = function (evt) {
        if (evt.pointerType && evt.pointerType !== 'mouse') return;

        var rect = sheet.getBoundingClientRect();
        var x = evt.clientX - rect.left;
        var y = evt.clientY - rect.top;

        var cx = rect.width  / 2;
        var cy = rect.height / 2;

        var dx = (x - cx) / cx;   // -1 s/d 1
        var dy = (y - cy) / cy;

        var rotX = dy * -maxTilt;
        var rotY = dx *  maxTilt;
        var tx   = dx *  maxMove;
        var ty   = dy *  maxMove;

        card.style.transform =
          'translate3d(' + tx + 'px,' + ty + 'px,0) ' +
          'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';

        if (canvas) {
          var innerTx = dx * -6;
          var innerTy = dy * -6;
          canvas.style.transform =
            'translate3d(' + innerTx + 'px,' + innerTy + 'px,0)';
        }
      };

      var reset = function () {
        card.style.transform = '';
        if (canvas) canvas.style.transform = '';
      };

      sheet.addEventListener('pointermove', onMove);
      sheet.addEventListener('pointerleave', reset);
    }

    /* ========== 2. Press-effect untuk tombol ==========
       tambahkan/removekan data-gg-state="pressed" supaya bisa di-style CSS  */
    function addPressEffect(el, className) {
      if (!el) return;
      var stateName = String(className || 'pressed').replace(/^gg-is-/, '').replace(/^is-/, '');

      el.addEventListener('pointerdown', function () {
        GG.core.state.add(el, stateName);
      });

      w.addEventListener('pointerup', function () {
        GG.core.state.remove(el, stateName);
      });

      el.addEventListener('blur', function () {
        GG.core.state.remove(el, stateName);
      });
      el.addEventListener('pointerleave', function () {
        GG.core.state.remove(el, stateName);
      });
    }

    addPressEffect(saveBtn);
    socials.forEach(function (btn) { addPressEffect(btn); });
    modeBtns.forEach(function (btn) { addPressEffect(btn); });
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (prefersReduced) return;
        GG.core.state.remove(btn, 'pop');
        void btn.offsetWidth;
        GG.core.state.add(btn, 'pop');
      });
    });

    /* ========== 3. Pop-in ikon sosial ketika sheet dibuka dari share btn */
    var shareBtns = d.querySelectorAll(SHARE_TRIGGER_SELECTOR);
    shareBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (prefersReduced) return;
        var icons = sheet.querySelectorAll('.gg-share-sheet__social-btn');
        if (!icons.length) return;

        icons.forEach(function (icon, idx) {
          GG.core.state.remove(icon, 'pop');
          // force reflow supaya animasi bisa di-retrigger
          void icon.offsetWidth;
          setTimeout(function () {
            GG.core.state.add(icon, 'pop');
          }, 40 * idx); // sedikit stagger
        });
      });
    });
  };

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

    // 1) Tentukan bahasa awal
    var savedLang   = null;
    try {
      savedLang = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    } catch (e) {}

    var htmlLang    = (doc.documentElement.getAttribute('lang') || 'id').toLowerCase();
    var initialLang = savedLang || GG.config.lang || htmlLang;

    GG.config.lang = initialLang;
    updateUI(initialLang);

    // 2) Event: buka/tutup dropdown
    toggleBtn.addEventListener('click', function () {
      var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // 3) Event: pilih bahasa
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

        // OPSIONAL: reload penuh supaya semua teks yang
        // dirender server/templating ikut bahasa baru
        // location.reload();
      });
    });

    // 4) Tutup kalau klik di luar
    doc.addEventListener('click', function (evt) {
      if (!root.contains(evt.target)) {
        closeMenu();
      }
    });

    // 5) Escape key
    root.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        if (toggleBtn.getAttribute('aria-expanded') === 'true') {
          closeMenu();
          toggleBtn.focus();
        }
      }
    });

    // --- helpers internal ---

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

  // Bahasa Indonesia (default)
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

  // English – British
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

  // Default language: from config, <html lang>, or fallback id
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

      // Prefer label from linked image alt if present (even empty alt means decorative; keep searching)
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

      // Choose the most informative label (prefer non-generic, longest)
      var best = labels
        .filter(function(l){ return l && l !== 'Link' && l.length >= 2; })
        .sort(function(a,b){ return b.length - a.length; })[0] || labels[0] || 'Link';

      // Pick a primary link to keep in the accessibility tree
      var primary = null;
      for(var j=0;j<g.length;j++){
        var a0 = g[j];
        var t0 = normSpace(a0.textContent);
        if(t0 && t0.length === best.length && t0.toLowerCase() === best.toLowerCase()){
          primary = a0; break;
        }
      }
      if(!primary){
        // Prefer a non-icon link as primary
        for(var k=0;k<g.length;k++){
          if(!isIconLike(g[k])){ primary = g[k]; break; }
        }
      }
      primary = primary || g[0];

      // Normalize names or hide redundant icon/image duplicates in chrome
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
      // Do not skip fixed-position elements (offsetParent can be null)
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
  var src = window.GG_ASSET ? window.GG_ASSET('/assets/main.js') : 'https://www.pakrpp.com/assets/main.js';
  function load(){
    if(window.__ggMainLoaded) return;
    window.__ggMainLoaded=true;
    var s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.crossOrigin='anonymous';
    document.head.appendChild(s);
  }
  if('requestIdleCallback' in window){
    requestIdleCallback(load,{timeout:2500});
  }else{
    setTimeout(load,2500);
  }
  ['pointerdown','keydown','touchstart','mousedown'].forEach(function(ev){
    window.addEventListener(ev, load, {once:true, passive:true});
  });
})();




(function(){
  var GG = window.GG = window.GG || {};
  GG.state = GG.state || {};
  GG.boot = GG.boot || {};

  var SRC = window.GG_ASSET ? window.GG_ASSET('/assets/main.js') : 'https://www.pakrpp.com/assets/main.js';

  function loadMain(){
    if(GG.state.mainLoaded) return;
    GG.state.mainLoaded = true;

    var s = document.createElement('script');
    s.src = SRC;
    s.defer = true;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  GG.boot.loadMain = loadMain;

  function once(fn){
    var called = false;
    return function(){
      if(called) return;
      called = true;
      try{ fn(); }catch(e){}
    };
  }

  // Idle preload (non-blocking)
  if('requestIdleCallback' in window){
    requestIdleCallback(loadMain, {timeout: 2500});
  } else {
    setTimeout(loadMain, 2500);
  }

  // Fast path on first user intent
  var trigger = once(loadMain);
  ['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
    window.addEventListener(ev, trigger, {passive:true, once:true});
  });
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
/* GG prefetch — HOME/LISTING only (safe, no PJAX) */
(() => {
  const CACHE_PAGES = "gg-pages-v2"; // HARUS sama dengan CACHE_PAGES di public/sw.js
  const MAX_PREFETCH = 10;
  const MAX_INFLIGHT = 2;

  function init() {
    const container = document.querySelector("#postcards");
    if (!container) return;

    // extra guard: jangan jalan di post page (/YYYY/MM/...)
    if (/^\/\d{4}\/\d{2}\//.test(location.pathname)) return;

    // hormati data saver / koneksi buruk
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return;

    if (!("caches" in window) || !window.fetch) return;

    let budget = MAX_PREFETCH;
    let inflight = 0;
    const seen = new Set();

    function normalizePostUrl(href) {
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return null;

        // hanya post pages (Blogger umum: /YYYY/MM/slug.html)
        if (!/^\/\d{4}\/\d{2}\//.test(url.pathname)) return null;

        // buang hash (#comments) & param aneh (mis: ?m=1)
        url.hash = "";
        if (url.searchParams.has("m")) url.searchParams.delete("m");

        return url.toString();
      } catch (e) {
        return null;
      }
    }

    function schedule(fn) {
      if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 1200 });
      else setTimeout(fn, 150);
    }

    async function prefetchToCache(urlStr) {
      if (!urlStr || budget <= 0) return;
      if (seen.has(urlStr)) return;
      if (inflight >= MAX_INFLIGHT) return;

      seen.add(urlStr);
      budget--;
      inflight++;

      try {
        const cache = await caches.open(CACHE_PAGES);

        // kalau sudah ada, stop
        const hit = await cache.match(urlStr);
        if (hit) return;

        const res = await fetch(urlStr, {
          credentials: "same-origin",
          headers: { Accept: "text/html" },
        });

        const ct = res.headers.get("content-type") || "";
        if (res.ok && ct.includes("text/html")) {
          await cache.put(urlStr, res.clone());
        }
      } catch (e) {
        // prefetch harus silent: jangan bikin error noisy
      } finally {
        inflight--;
      }
    }

    // Kandidat link: hanya thumb + title link
    function getCandidateAnchors() {
      return container.querySelectorAll(
        'a.gg-post-card__thumb[href], a.gg-post-card__title-link[href]'
      );
    }

    // 1) Hover/pointerover prefetch (paling efektif)
    container.addEventListener(
      "pointerover",
      (e) => {
        const a = e.target && e.target.closest
          ? e.target.closest('a.gg-post-card__thumb[href], a.gg-post-card__title-link[href]')
          : null;
        if (!a) return;
        const u = normalizePostUrl(a.getAttribute("href"));
        if (u) schedule(() => prefetchToCache(u));
      },
      { passive: true }
    );

    // 2) Keyboard focus prefetch (aksesibilitas)
    container.addEventListener(
      "focusin",
      (e) => {
        const a = e.target && e.target.closest
          ? e.target.closest('a.gg-post-card__thumb[href], a.gg-post-card__title-link[href]')
          : null;
        if (!a) return;
        const u = normalizePostUrl(a.getAttribute("href"));
        if (u) schedule(() => prefetchToCache(u));
      }
    );

    // 3) Viewport prefetch (pelan + disiplin)
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (!ent.isIntersecting) continue;
          io.unobserve(ent.target);
          const u = normalizePostUrl(ent.target.getAttribute("href"));
          if (u) schedule(() => prefetchToCache(u));
        }
      },
      { rootMargin: "200px" }
    );

    getCandidateAnchors().forEach((a) => io.observe(a));

    // 4) Warm-up 4 link pertama saat idle
    schedule(() => {
      const anchors = Array.from(getCandidateAnchors()).slice(0, 4);
      anchors.forEach((a) => {
        const u = normalizePostUrl(a.getAttribute("href"));
        if (u) prefetchToCache(u);
      });
    });
  }

  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.modules.prefetch = GG.modules.prefetch || {};
  GG.modules.prefetch.init = GG.modules.prefetch.init || init;
})();
