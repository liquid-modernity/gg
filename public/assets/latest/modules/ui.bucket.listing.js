(function(w){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.__uiBuckets = GG.__uiBuckets || {};
  if (GG.__uiBuckets.listing) return;
  GG.__uiBuckets.listing = true;

(function(){
  var run = function(){
    const v = document.getElementById("ggHeroVideo");
    const hero = document.getElementById("gg-landing-hero");
    if (!v || !hero || !("IntersectionObserver" in window)) return;

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



(function(GG, w, d){
  'use strict';
  if (!GG) return;
  GG.modules = GG.modules || {};
  GG.modules.labelTree = GG.modules.labelTree || (function(){
    var shared = { loaded:false, loading:false, map:null, promise:null, cacheChecked:false, fromCache:false, refreshing:false, maxPosts:10 };

    function getCfg(root){
      var cfg = (GG.store && GG.store.config) ? GG.store.config : {};
      var maxPosts = parseInt(cfg.maxPosts || (root && root.getAttribute('data-max-posts')) || '10', 10);
      if (!isFinite(maxPosts) || maxPosts <= 0) maxPosts = 10;
      var filter = Array.isArray(cfg.labelTreeLabels) ? cfg.labelTreeLabels.filter(Boolean) : null;
      var exclude = Array.isArray(cfg.labelTreeExclude) ? cfg.labelTreeExclude.filter(Boolean) : null;
      return { maxPosts: maxPosts, filter: filter, exclude: exclude };
    }

    function pickAltLink(entry){
      var links = entry && entry.link ? entry.link : [];
      for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'alternate' && links[i].href) return links[i].href;
      }
      return '';
    }

    function isBadLabel(term){
      var t = String(term || '').trim();
      if (!t) return true;
      var low = t.toLowerCase();
      if (low.indexOf('schemas.google.com/blogger') !== -1) return true;
      if (low.indexOf('http') === 0) return true;
      return false;
    }

    function buildMap(entries, map, maxPosts){
      var out = map || Object.create(null);
      (entries || []).forEach(function(entry){
        var cats = entry && entry.category ? entry.category : [];
        if (!cats || !cats.length) return;
        var title = (entry.title && entry.title.$t) || 'Untitled';
        var url = pickAltLink(entry);
        if (!url) return;
        for (var i = 0; i < cats.length; i++) {
          var term = cats[i] && cats[i].term ? cats[i].term : '';
          if (isBadLabel(term)) continue;
          if (!out[term]) out[term] = [];
          if (out[term].length < maxPosts) out[term].push({ title: title, url: url });
        }
      });
      var keys = Object.keys(out);
      keys.forEach(function(label){
        var seen = Object.create(null);
        out[label] = out[label].filter(function(p){
          var key = (p && p.url) ? p.url : '';
          if (!key || seen[key]) return false;
          seen[key] = 1;
          return true;
        });
        if (out[label].length > maxPosts) out[label] = out[label].slice(0, maxPosts);
      });
      return out;
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
      if (state.exclude && state.exclude.length) {
        var excludeMap = {};
        state.exclude.forEach(function(l){ excludeMap[String(l).toLowerCase()] = 1; });
        labels = labels.filter(function(l){ return !excludeMap[String(l).toLowerCase()]; });
      }
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

    function getCacheTTLMin(){
      var cfg = (GG.store && GG.store.config) ? GG.store.config : {};
      var ttl = parseInt(cfg.labelTreeCacheTTLMin, 10);
      if (!isFinite(ttl) || ttl <= 0) ttl = 360;
      return ttl;
    }

    function readCache(){
      try {
        var ls = w.localStorage;
        if (!ls) return null;
        var raw = ls.getItem('gg_labeltree_v1');
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (!data || !data.map || typeof data.map !== 'object') return null;
        var ts = parseInt(data.ts, 10);
        if (!isFinite(ts) || ts <= 0) return null;
        var ttlMs = getCacheTTLMin() * 60 * 1000;
        if ((Date.now() - ts) > ttlMs) return null;
        return data.map;
      } catch (_) {
        return null;
      }
    }

    function writeCache(map){
      try {
        var ls = w.localStorage;
        if (!ls) return;
        var payload = { ts: Date.now(), map: map };
        ls.setItem('gg_labeltree_v1', JSON.stringify(payload));
      } catch (_) {}
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
// @gg-allow-html-in-js LEGACY:LEGACY-0042
      ul.innerHTML = '';
      var posts = (shared.map && shared.map[label]) ? shared.map[label] : [];
      posts = posts.slice(0, state.maxPosts || 10);
      if (!posts.length) {
// @gg-allow-html-in-js LEGACY:LEGACY-0043
        ul.innerHTML = '<li class="gg-lt__muted" role="presentation">No posts</li>';
        return;
      }
      posts.forEach(function(p){
        var li = d.createElement('li');
        li.className = 'gg-lt__post';
        li.setAttribute('role', 'none');
// @gg-allow-html-in-js LEGACY:LEGACY-0044
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
// @gg-allow-html-in-js LEGACY:LEGACY-0045
        treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">No labels found</li>';
        return;
      }
// @gg-allow-html-in-js LEGACY:LEGACY-0046
      treeEl.innerHTML = '';
      labels.forEach(function(label){
        var node = d.createElement('li');
        node.className = 'gg-lt__node';
        node.setAttribute('data-label', label);
        node.setAttribute('role', 'treeitem');
        node.setAttribute('aria-expanded', 'false');
// @gg-allow-html-in-js LEGACY:LEGACY-0047
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

    function loadData(opts){
      opts = opts || {};
      if (shared.loading && shared.promise) return shared.promise;
      if (shared.promise && !opts.force) return shared.promise;
      shared.loading = true;
      shared.refreshing = !!opts.background;
      var maxPosts = parseInt(opts.maxPosts || shared.maxPosts || 10, 10);
      if (!isFinite(maxPosts) || maxPosts <= 0) maxPosts = 10;
      var pageSize = 150;
      var maxPages = 6;
      var startIndex = 1;
      var pages = 0;
      var totalResults = 0;
      var map = Object.create(null);

      function fetchPage(){
        pages++;
        var params = { summary: true, 'max-results': pageSize, 'start-index': startIndex };
        return GG.services.api.getFeed(params).then(function(json){
          var feed = json && json.feed ? json.feed : null;
          var entries = (feed && feed.entry) ? feed.entry : [];
          var before = Object.keys(map).length;
          map = buildMap(entries, map, maxPosts);
          var after = Object.keys(map).length;
          var delta = after - before;
          var total = feed && feed['openSearch$totalResults'] ? parseInt(feed['openSearch$totalResults'].$t, 10) : 0;
          if (isFinite(total) && total > 0) totalResults = total;
          var nextStart = startIndex + pageSize;
          var hasMore = true;
          if (!entries || !entries.length) hasMore = false;
          if (delta <= 0) hasMore = false;
          if (pages >= maxPages) hasMore = false;
          if (totalResults && nextStart > totalResults) hasMore = false;
          if (!hasMore) return map;
          startIndex = nextStart;
          return fetchPage();
        });
      }

      shared.promise = fetchPage().then(function(result){
        shared.map = result;
        shared.loaded = true;
        shared.loading = false;
        shared.refreshing = false;
        shared.fromCache = false;
        shared.promise = null;
        writeCache(result);
        return shared;
      }).catch(function(err){
        shared.loading = false;
        shared.refreshing = false;
        shared.promise = null;
        if (!shared.map) shared.loaded = false;
        throw err;
      });
      return shared.promise;
    }

    function addDebug(state, msg){
      if (!window.GG_DEBUG) return;
      if (!state || !state.tree) return;
      var el = state.debugEl;
      if (!el) {
        el = document.createElement('li');
        el.className = 'gg-lt__debug';
        el.setAttribute('role', 'presentation');
        state.debugEl = el;
        state.tree.appendChild(el);
      }
      el.textContent = msg;
    }

    function clearDebug(state){
      if (!state) return;
      if (state.debugTimer) {
        clearTimeout(state.debugTimer);
        state.debugTimer = null;
      }
      if (state.debugEl && state.debugEl.parentNode) {
        state.debugEl.parentNode.removeChild(state.debugEl);
      }
      state.debugEl = null;
    }

    function init(root){
      var roots = root ? [root] : Array.prototype.slice.call(d.querySelectorAll('.gg-labeltree[data-gg-module="labeltree"]'));
      if (!roots.length) return;
      if (window.GG_DEBUG && !window.__GG_LABELTREE_INIT_LOGGED) {
        window.__GG_LABELTREE_INIT_LOGGED = true;
        try { console.info('[labelTree] init called'); } catch (_) {}
      }
      if (!shared.cacheChecked) {
        shared.cacheChecked = true;
        var cached = readCache();
        if (cached) {
          shared.map = cached;
          shared.loaded = true;
          shared.fromCache = true;
        }
      }

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
        state.exclude = cfg.exclude;
        shared.maxPosts = Math.max(shared.maxPosts || 10, state.maxPosts || 10);

        bindEvents(state);
        setPanel(state, state.panelOpen);

        if (shared.loaded && shared.map) {
          renderLabels(el, state);
          applyActive(el, state);
          clearDebug(state);
          if (shared.fromCache && !shared.refreshing) {
            loadData({ maxPosts: shared.maxPosts, force: true, background: true }).then(function(){
              renderLabels(el, state);
              applyActive(el, state);
              clearDebug(state);
            }).catch(function(err){
              if (window.GG_DEBUG) {
                try { console.warn('[labelTree] feed failed', err); } catch (_) {}
              }
            });
          }
          return;
        }

// @gg-allow-html-in-js LEGACY:LEGACY-0048
        treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">Loading labels...</li>';
        if (window.GG_DEBUG) {
          if (state.debugTimer) clearTimeout(state.debugTimer);
          state.debugTimer = setTimeout(function(){
            if (!shared.loaded) addDebug(state, 'LabelTree: waiting for feed...');
          }, 2000);
        }
        loadData({ maxPosts: shared.maxPosts }).then(function(){
          renderLabels(el, state);
          applyActive(el, state);
          clearDebug(state);
        }).catch(function(err){
// @gg-allow-html-in-js LEGACY:LEGACY-0049
          treeEl.innerHTML = '<li class="gg-lt__muted" role="presentation">Unable to load labels</li>';
          if (window.GG_DEBUG) {
            try { console.warn('[labelTree] feed failed', err); } catch (_) {}
            clearDebug(state);
            addDebug(state, 'LabelTree: feed failed');
          }
        });
      });
    }

    function refresh(root){
      init(root);
    }

    return { init: init, refresh: refresh };
  })();
})(window.GG = window.GG || {}, window, document);

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

// @gg-allow-html-in-js LEGACY:LEGACY-0050
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

// @gg-allow-html-in-js LEGACY:LEGACY-0051
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

// @gg-allow-html-in-js LEGACY:LEGACY-0052
      grid.innerHTML = "";
      state.cols = null;
      state.colHeights = null;
      state.queue = [];
      ensureCols();

      loadBatch();
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { GG.core.state.remove(x, "active"); });
        GG.core.state.add(b, "active");
        state.type = (b.getAttribute("data-type") || "all").toLowerCase();
        reset();
      });
    });

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

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function () {
        if (!state.done) loadBatch();
      }, { rootMargin: "800px 0px" });
      io.observe(loader);
    }

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

(function(G,w,d){'use strict';
  var p=(w.location&&w.location.pathname?w.location.pathname:''),q='';
  if(p.indexOf('/search')!==0) return;
  try{ q=(new URLSearchParams(w.location.search||'').get('q')||'').trim(); }catch(_){}
  if(!q) return;
  var r=d.getElementById('postcards')||d.querySelector('#Blog1 .blog-posts')||d.querySelector('.blog-posts');
  var m=(r&&r.parentNode)||d.querySelector('main')||d.getElementById('Blog1')||d.getElementById('gg-main');
  if(!m) return;
  var e=function(s){ return String(s||'').replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var go=function(u){
    if(!u) return;
    try{
      var x=new URL(u,w.location.href),h=x.origin===w.location.origin?(x.pathname+x.search+x.hash):x.toString();
      if(x.origin===w.location.origin&&x.pathname.indexOf('/search')!==0&&G.core&&G.core.router&&typeof G.core.router.navigate==='function') G.core.router.navigate(h);
      else w.location.assign(h);
    }catch(_){ w.location.assign(u); }
  };
  var b=d.getElementById('gg-search-assist');
  if(!b){ b=d.createElement('section'); b.id='gg-search-assist'; b.className='gg-search-assist'; b.setAttribute('aria-label','Local suggestions'); m.insertBefore(b,r||m.firstChild); }
  b.onclick=function(ev){ var a=ev.target&&ev.target.closest?ev.target.closest('a.gg-search-assist__item'):null; if(!a) return; ev.preventDefault(); go(a.getAttribute('href')); };
  var draw=function(list,msg){
    var h='<div class="h"><b>Local suggestions</b><small>From your library</small></div>';
    if(msg) h+='<p class="e">'+e(msg)+'</p>';
    else if(list&&list.length){
      h+='<div class="l">';
      for(var i=0;i<list.length;i++) h+='<a class="gg-search-assist__item" href="'+e(list[i].url)+'"><span>'+e(list[i].title)+'</span>'+(list[i].label?'<small>'+e(list[i].label)+'</small>':'')+'</a>';
      h+='</div>';
    }else h+='<p class="e">No local matches for "<strong>'+e(q)+'</strong>".</p>';
// @gg-allow-html-in-js LEGACY:LEGACY-0053
    b.innerHTML=h+'<p class="f">Server results below</p>';
  };
  var api=G.services&&G.services.api&&G.services.api.getFeed;
  if(typeof api!=='function'){ draw(0,'Local suggestions unavailable'); return; }
  api({summary:1,'max-results':500}).then(function(j){
    var en=j&&j.feed&&j.feed.entry?j.feed.entry:[],qq=q.toLowerCase(),tk=qq.split(/\s+/),out=[],i,k;
    for(i=0;i<en.length;i++){
      var it=en[i]||{},ln=it.link||[],tt=it.title&&it.title.$t?it.title.$t:'',t=tt.toLowerCase(),u='',s='',lb='',ls='',sc=0,c=it.category||[];
      if(!t) continue;
      for(k=0;k<ln.length;k++) if(ln[k].rel==='alternate'&&ln[k].href){ u=ln[k].href; break; }
      if(!u) continue;
      s=(it.summary&&it.summary.$t)||(it.content&&it.content.$t)||'';
      s=String(s).replace(/<[^>]*>/g,' ').toLowerCase();
      for(k=0;k<c.length;k++){ var y=c[k]&&c[k].term?c[k].term:''; if(!y) continue; if(!lb) lb=y; ls+=' '+y.toLowerCase(); }
      if(t.indexOf(qq)===0) sc=9; else if(t.indexOf(qq)>0) sc=6;
      for(k=0;k<tk.length;k++){ var z=tk[k]; if(!z) continue; if(t.indexOf(z)>-1) sc+=3; if(ls.indexOf(z)>-1) sc+=2; if(s.indexOf(z)>-1) sc+=1; }
      if(sc) out.push({s:sc,title:tt,url:u,label:lb});
    }
    out.sort(function(a,b){ return b.s-a.s; });
    if(out.length>5) out.length=5;
    draw(out);
  }).catch(function(){ draw(0,'Local suggestions unavailable'); });
})(window.GG=window.GG||{},window,document);

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

      byId: new Map(),
      order: [],
      seenDropdownId: new Set(),

      years: new Set(),
      ymByYear: new Map(),
      labels: new Map(),
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
// @gg-allow-html-in-js LEGACY:LEGACY-0054
      yearSel.innerHTML = '<option value="">All years</option>' + arr.map(function(y){
        return '<option value="'+esc(y)+'">'+esc(y)+'</option>';
      }).join("");
      if(cur && arr.indexOf(cur)!==-1) yearSel.value = cur;
    }

    function rebuildMonthOptions(){
      var y = state.year;
      if(!y){
        monthSel.disabled = true;
// @gg-allow-html-in-js LEGACY:LEGACY-0055
        monthSel.innerHTML = '<option value="">All months</option>';
        monthSel.value = "";
        state.month = "";
        return;
      }
      var set = state.ymByYear.get(y);
      var arr = set ? Array.from(set) : [];
      arr.sort();
      monthSel.disabled = false;
// @gg-allow-html-in-js LEGACY:LEGACY-0056
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
// @gg-allow-html-in-js LEGACY:LEGACY-0057
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

      if(state.type === "youtube") out = out.filter(isYT);
      else if(state.type === "image") out = out.filter(function(x){
        return !isYT(x);
      });

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

      if(state.label){
        out = out.filter(function(x){
          if (Array.isArray(x.labels)) return x.labels.indexOf(state.label) !== -1;
          return String(x.labels||"") === state.label;
        });
      }

      if(state.q){
        var q = state.q.toLowerCase();
        out = out.filter(function(x){
          var t = String(x.title||"").toLowerCase();
          var l = Array.isArray(x.labels) ? x.labels.join(" ").toLowerCase() : String(x.labels||"").toLowerCase();
          return (t.indexOf(q)!==-1) || (l.indexOf(q)!==-1);
        });
      }

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
      var map = new Map();
      items.forEach(function(x){
        var d = parseDateISO(x.published);
        var k = d ? fmtDate(d) : "Unknown date";
        if(!map.has(k)) map.set(k, []);
        map.get(k).push(x);
      });

      var keys = Array.from(map.keys());
      keys.sort(function(a,b){
        if(a==="Unknown date") return 1;
        if(b==="Unknown date") return -1;
        if(state.sort === "oldest") return a.localeCompare(b);
        return b.localeCompare(a);
      });

      return { keys: keys, map: map };
    }

    function render(){
// @gg-allow-html-in-js LEGACY:LEGACY-0058
      groupsEl.innerHTML = "";

      var items = state.order.map(function(id){ return state.byId.get(id); }).filter(Boolean);
      var filtered = applyFilters(items);

      var grouped = groupByDate(filtered);
      var focusables = [];

      grouped.keys.forEach(function(day){
        var arr = grouped.map.get(day);

        var group = document.createElement("div");
        group.className = "gg-group";
// @gg-allow-html-in-js LEGACY:LEGACY-0059
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
// @gg-allow-html-in-js LEGACY:LEGACY-0060
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
      state.focusIndex = 0;
      render();
    }

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

    document.addEventListener("keydown", function(e){
      if(e.key === "/" && document.activeElement !== qInput){
        e.preventDefault();
        qInput.focus();
        return;
      }
      if(e.key === "Escape"){
        if(document.activeElement === qInput && qInput.value){
          qInput.value = "";
          state.q = "";
          reset();
        }
        return;
      }

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
// @gg-allow-html-in-js LEGACY:LEGACY-0061
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
// @gg-allow-html-in-js LEGACY:LEGACY-0062
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
// @gg-allow-html-in-js LEGACY:LEGACY-0063
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
// @gg-allow-html-in-js LEGACY:LEGACY-0064
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

(function(G,w,d){'use strict';if(!G||!d.querySelector('[data-gg-module="mixed-media"]'))return;function i(){if(G.modules&&G.modules.mixedMedia&&G.modules.mixedMedia.init){G.modules.mixedMedia.init();return;}if(!(G.boot&&G.boot.loadModule))return;G.boot.loadModule('ui.bucket.mixed.js').then(function(){if(G.modules&&G.modules.mixedMedia&&G.modules.mixedMedia.init)G.modules.mixedMedia.init();}).catch(function(){});}if(G.boot&&G.boot.onReady)G.boot.onReady(i);else if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',i,{once:true});else i();})(window.GG=window.GG||{},window,document);

(function(G,w,d){'use strict';if(!G)return;function p(){var x=(w.location&&w.location.pathname)||'';return /^\/search\/label\/[^/?#]+/i.test(x);}function i(){if(!p())return;if(G.modules&&G.modules.labelChannel&&G.modules.labelChannel.init){G.modules.labelChannel.init(d);return;}if(!(G.boot&&G.boot.loadModule))return;G.boot.loadModule('ui.bucket.channel.js').then(function(){if(G.modules&&G.modules.labelChannel&&G.modules.labelChannel.init)G.modules.labelChannel.init(d);}).catch(function(){});}if(G.boot&&G.boot.onReady)G.boot.onReady(i);else if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',i,{once:true});else i();})(window.GG=window.GG||{},window,document);


})(window);

