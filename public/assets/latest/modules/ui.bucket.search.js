(function(w){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.__uiBuckets = GG.__uiBuckets || {};
  if (GG.__uiBuckets.search) return;
  GG.__uiBuckets.search = true;

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
      var trigger = target.closest('[data-gg-search],.gg-search-trigger');
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


})(window);
