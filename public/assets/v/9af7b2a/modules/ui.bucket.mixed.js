(function(G, w, d){
  'use strict';
  if (!G) return;
  G.modules = G.modules || {};
  var mixed = G.modules.mixedMedia = G.modules.mixedMedia || {};
  if (mixed.__v2Defined) return;
  mixed.__v2Defined = true;

  var DEFAULT_FETCH_MAX = 84;
  var DEFAULT_ORDER = 'published';
  var globalPayload = null;
  var globalFetchPromise = null;
  var labelFetchPromises = Object.create(null);

  function esc(v) {
    return String(v || '').replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function clampInt(v, fallback, min, max) {
    var n = parseInt(v, 10);
    if (!isFinite(n)) n = fallback;
    if (isFinite(min)) n = Math.max(min, n);
    if (isFinite(max)) n = Math.min(max, n);
    return n;
  }

  function normalizeLabel(v) {
    return String(v || '').trim().toLowerCase();
  }

  function inferType(raw) {
    var v = normalizeLabel(raw);
    if (v === 'youtubeish' || v === 'youtube') return 'youtube';
    if (v === 'shortish' || v === 'shorts' || v === 'short') return 'shorts';
    if (v === 'podcastish' || v === 'podcast') return 'podcast';
    if (v === 'instagramish' || v === 'instagram') return 'instagram';
    if (v === 'newsish' || v === 'newsdeck' || v === 'news') return 'newsdeck';
    if (v === 'bookish' || v === 'popular') return 'bookish';
    if (v === 'pinterestish' || v === 'pinterest') return 'instagram';
    return v || 'bookish';
  }

  function isRailType(type) {
    return type === 'youtube' || type === 'shorts' || type === 'podcast';
  }

  function titleCaseLabel(label) {
    var clean = String(label || '').trim();
    if (!clean) return 'Mixed';
    return clean
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(function(p){ return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); })
      .join(' ');
  }

  function getFeedBase() {
    var cfg = (G.store && G.store.config) ? G.store.config : {};
    var base = String(cfg.feedSummaryBase || '/feeds/posts/summary');
    if (base.charAt(0) !== '/') base = '/' + base;
    return base.replace(/\/$/, '');
  }

  function buildFeedUrl(opts) {
    var o = opts || {};
    var label = String(o.label || '').trim();
    var max = clampInt(o.max, 8, 1, 120);
    var order = String(o.order || DEFAULT_ORDER).trim() || DEFAULT_ORDER;
    var path = getFeedBase();
    var lowLabel = normalizeLabel(label);
    if (label && lowLabel !== 'blog') {
      path += '/-/' + encodeURIComponent(label);
    }
    return (
      path +
      '?alt=json' +
      '&orderby=' + encodeURIComponent(order) +
      '&max-results=' + encodeURIComponent(max)
    );
  }

  function fetchJson(url) {
    if (G.services && G.services.api && typeof G.services.api.fetch === 'function') {
      return G.services.api.fetch(url, 'json');
    }
    return w.fetch(url, { credentials: 'same-origin' }).then(function(res){
      if (!res || !res.ok) throw new Error('feed-unavailable');
      return res.json();
    });
  }

  function pickAltUrl(entry) {
    var links = (entry && entry.link) ? entry.link : [];
    for (var i = 0; i < links.length; i++) {
      if (links[i] && links[i].rel === 'alternate' && links[i].href) {
        return String(links[i].href);
      }
    }
    return '';
  }

  function extractImage(entry) {
    var thumb = entry && (entry['media$thumbnail'] || entry.media$thumbnail);
    if (thumb && thumb.url) return String(thumb.url);
    var html = '';
    if (entry && entry.content && entry.content.$t) html = entry.content.$t;
    if (!html && entry && entry.summary && entry.summary.$t) html = entry.summary.$t;
    var m = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    return (m && m[1]) ? String(m[1]) : '';
  }

  function normalizeEntry(entry) {
    var title = (entry && entry.title && entry.title.$t) ? String(entry.title.$t).trim() : '';
    var url = pickAltUrl(entry);
    if (!title || !url) return null;

    var cats = (entry && entry.category) ? entry.category : [];
    var labels = [];
    for (var i = 0; i < cats.length; i++) {
      var term = cats[i] && cats[i].term ? String(cats[i].term).trim() : '';
      if (term) labels.push(term);
    }

    return {
      title: title,
      url: url,
      image: extractImage(entry),
      labels: labels,
      published: (entry && entry.published && entry.published.$t) ? String(entry.published.$t) : ''
    };
  }

  function toEntries(json) {
    var feed = json && json.feed ? json.feed : {};
    var raw = Array.isArray(feed.entry) ? feed.entry : [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var item = normalizeEntry(raw[i]);
      if (item) out.push(item);
    }
    return out;
  }

  function dedupe(entries) {
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var key = e && e.url ? String(e.url) : '';
      if (!key || seen[key]) continue;
      seen[key] = 1;
      out.push(e);
    }
    return out;
  }

  function groupByLabel(entries) {
    var groups = Object.create(null);
    for (var i = 0; i < entries.length; i++) {
      var item = entries[i];
      var labels = Array.isArray(item.labels) ? item.labels : [];
      if (!labels.length) {
        if (!groups.blog) groups.blog = [];
        groups.blog.push(item);
        continue;
      }
      for (var j = 0; j < labels.length; j++) {
        var key = normalizeLabel(labels[j]);
        if (!key) continue;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
    }
    return groups;
  }

  function parseConfig() {
    var cfg = {
      fetch: {
        max_results: DEFAULT_FETCH_MAX,
        order: DEFAULT_ORDER,
      },
      sectionsById: Object.create(null),
    };

    var el = d.getElementById('gg-mixed-config');
    if (!el) return cfg;

    try {
      var raw = JSON.parse(el.textContent || '{}');
      if (raw && raw.fetch && typeof raw.fetch === 'object') {
        cfg.fetch.max_results = clampInt(raw.fetch.max_results, DEFAULT_FETCH_MAX, 1, 120);
        cfg.fetch.order = String(raw.fetch.order || DEFAULT_ORDER).trim() || DEFAULT_ORDER;
      }
      var sections = Array.isArray(raw && raw.sections) ? raw.sections : [];
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i] || {};
        var id = String(s.id || '').trim();
        if (!id) continue;
        cfg.sectionsById[id] = {
          id: id,
          type: inferType(s.type),
          label: String(s.label || '').trim(),
          max: clampInt(s.max, 8, 1, 16),
          order: String(s.order || cfg.fetch.order || DEFAULT_ORDER).trim() || DEFAULT_ORDER,
          kicker: String(s.kicker || '').trim(),
          title: String(s.title || '').trim(),
        };
      }
    } catch (_) {
      return cfg;
    }

    return cfg;
  }

  function resolveSectionConfig(slot, cfg) {
    var id = String(slot.id || '').trim();
    var fromJson = (id && cfg.sectionsById[id]) ? cfg.sectionsById[id] : null;

    var typeRaw = (fromJson && fromJson.type) || slot.getAttribute('data-type') || slot.getAttribute('data-gg-kind') || 'bookish';
    var type = inferType(typeRaw);
    var kindRaw = slot.getAttribute('data-gg-kind') || (fromJson && fromJson.type) || typeRaw || type;
    var label = (fromJson && fromJson.label) || slot.getAttribute('data-label') || slot.getAttribute('data-gg-label') || 'blog';
    var maxRaw = (fromJson && fromJson.max) || slot.getAttribute('data-max') || slot.getAttribute('data-gg-max') || '8';
    var order = (fromJson && fromJson.order) || slot.getAttribute('data-order') || cfg.fetch.order || DEFAULT_ORDER;

    var section = {
      id: id,
      type: type,
      kind: normalizeLabel(kindRaw || type),
      label: String(label || '').trim(),
      max: clampInt(maxRaw, 8, 1, 16),
      order: String(order || DEFAULT_ORDER).trim() || DEFAULT_ORDER,
      kicker: (fromJson && fromJson.kicker) ? String(fromJson.kicker).trim() : '',
      title: (fromJson && fromJson.title) ? String(fromJson.title).trim() : '',
    };

    if (!section.kicker) {
      section.kicker = titleCaseLabel(section.label || section.type).toUpperCase();
    }
    return section;
  }

  function buildSeeAllUrl(label) {
    var clean = String(label || '').trim();
    if (!clean) return '/blog';
    return '/search/label/' + encodeURIComponent(clean);
  }

  function applySectionUi(slot, section) {
    slot.setAttribute('data-type', section.type);
    slot.setAttribute('data-label', section.label);
    slot.setAttribute('data-gg-max', String(section.max));
    slot.setAttribute('data-max', String(section.max));
    slot.setAttribute('data-order', section.order);

    var kickerEl = slot.querySelector('[data-role="kicker"]');
    if (kickerEl && section.kicker) kickerEl.textContent = section.kicker;

    var titleEl = slot.querySelector('.gg-mixed__title');
    if (titleEl && section.title && !String(titleEl.textContent || '').trim()) {
      titleEl.textContent = section.title;
    }

    var moreEl = slot.querySelector('[data-role="more"]') || slot.querySelector('.gg-mixed__more');
    if (moreEl) {
      moreEl.setAttribute('href', buildSeeAllUrl(section.label));
      moreEl.textContent = 'See all';
    }
  }

  function setState(slot, state) {
    if (!slot) return;
    slot.setAttribute('data-gg-state', state);
  }

  function setError(slot, msg) {
    var el = slot.querySelector('[data-role="error"]');
    if (!el) return;
    el.textContent = String(msg || 'Feed unavailable.');
    el.removeAttribute('hidden');
  }

  function clearError(slot) {
    var el = slot.querySelector('[data-role="error"]');
    if (!el) return;
    el.setAttribute('hidden', 'hidden');
  }

  function skeletonCountFor(section) {
    var count = clampInt(section && section.max, 8, 1, 16);
    if (inferType(section && section.type) === 'newsdeck') return count;
    return count;
  }

  function skeletonCardHtml(section) {
    return (
      '<article class="gg-mixed__card gg-mixed__card--placeholder" aria-hidden="true">' +
        '<span class="gg-mixed__thumb"></span>' +
        '<span class="gg-mixed__body">' +
          '<span class="gg-mixed__kicker"></span>' +
          '<span class="gg-mixed__headline"></span>' +
        '</span>' +
      '</article>'
    );
  }

  function newsDeckSkeletonHtml(section, count) {
    var cols = [[], [], []];
    for (var i = 0; i < count; i++) {
      cols[i % cols.length].push(
        '<article class="gg-newsdeck__item gg-newsdeck__item--placeholder" aria-hidden="true">' +
          '<span class="gg-newsdeck__body">' +
            '<span class="gg-newsdeck__kicker"></span>' +
            '<span class="gg-newsdeck__title"></span>' +
          '</span>' +
          '<span class="gg-newsdeck__thumb"></span>' +
        '</article>'
      );
    }

    var out = [];
    for (var c = 0; c < cols.length; c++) {
      if (!cols[c].length) continue;
      out.push('<div class="gg-newsdeck__col">' + cols[c].join('') + '</div>');
    }
    return '<div class="gg-newsdeck">' + out.join('') + '</div>';
  }

  function renderSkeleton(slot, section) {
    if (!slot) return;
    var grid = slot.querySelector('[data-role="grid"]');
    var rail = slot.querySelector('[data-role="rail"]');
    var count = skeletonCountFor(section);
    var cards = [];

    slot.setAttribute('data-gg-skeleton-count', String(count));
    if (section.type === 'newsdeck') {
      if (grid) {
        grid.innerHTML = newsDeckSkeletonHtml(section, count);
        grid.removeAttribute('hidden');
      }
      if (rail) rail.setAttribute('hidden', 'hidden');
      return;
    }

    for (var i = 0; i < count; i++) {
      cards.push(skeletonCardHtml(section));
    }

    if (isRailType(section.type)) {
      if (rail) {
        rail.innerHTML = cards.join('');
        rail.removeAttribute('hidden');
      }
      if (grid) grid.setAttribute('hidden', 'hidden');
      return;
    }

    if (grid) {
      grid.innerHTML = cards.join('');
      grid.removeAttribute('hidden');
    }
    if (rail) rail.setAttribute('hidden', 'hidden');
  }

  function ensureGlobal(cfg) {
    if (globalPayload) return Promise.resolve(globalPayload);
    if (globalFetchPromise) return globalFetchPromise;

    var fetchMax = clampInt(cfg.fetch.max_results, DEFAULT_FETCH_MAX, 1, 120);
    var fetchOrder = cfg.fetch.order || DEFAULT_ORDER;
    var url = buildFeedUrl({ max: fetchMax, order: fetchOrder });

    globalFetchPromise = fetchJson(url)
      .then(function(json){
        var entries = dedupe(toEntries(json));
        globalPayload = {
          entries: entries,
          groups: groupByLabel(entries),
        };
        return globalPayload;
      })
      .catch(function(){
        globalPayload = {
          entries: [],
          groups: Object.create(null),
        };
        return globalPayload;
      });

    return globalFetchPromise;
  }

  function ensureLabelFeed(section) {
    var label = String(section.label || '').trim();
    if (!label) return Promise.resolve([]);

    var key = [normalizeLabel(label), section.max, section.order].join('|');
    if (labelFetchPromises[key]) return labelFetchPromises[key];

    var url = buildFeedUrl({ label: label, max: section.max, order: section.order });
    labelFetchPromises[key] = fetchJson(url)
      .then(function(json){ return dedupe(toEntries(json)); })
      .catch(function(){ return []; });

    return labelFetchPromises[key];
  }

  function pickFromGroup(globalData, label, max) {
    var key = normalizeLabel(label);
    var groups = globalData && globalData.groups ? globalData.groups : {};
    var entries = globalData && Array.isArray(globalData.entries) ? globalData.entries : [];

    var out = [];
    if (key && groups[key]) out = groups[key].slice(0, max);
    if (!out.length && (key === 'blog' || !key)) out = entries.slice(0, max);
    return out;
  }

  function resolveEntries(section, cfg) {
    return ensureGlobal(cfg).then(function(globalData){
      var max = section.max;
      var selected = pickFromGroup(globalData, section.label, max);

      if (selected.length >= max) {
        return selected.slice(0, max);
      }

      return ensureLabelFeed(section).then(function(labelEntries){
        var merged = dedupe(selected.concat(labelEntries || []));
        if (merged.length < max) {
          merged = dedupe(merged.concat(globalData.entries || []));
        }
        return merged.slice(0, max);
      });
    });
  }

  function cardHtml(item, section) {
    var kicker = titleCaseLabel((item.labels && item.labels[0]) || section.label || section.type);
    var img = item.image
      ? '<img alt="" decoding="async" loading="lazy" src="' + esc(item.image) + '"/>'
      : '';

    return (
      '<a class="gg-mixed__card" href="' + esc(item.url) + '">' +
        '<span class="gg-mixed__thumb">' + img + '</span>' +
        '<span class="gg-mixed__body">' +
          '<span class="gg-mixed__kicker">' + esc(kicker) + '</span>' +
          '<span class="gg-mixed__headline">' + esc(item.title) + '</span>' +
        '</span>' +
      '</a>'
    );
  }

  function newsDeckHtml(items, section) {
    if (!items.length) return '';

    var cols = [[], [], []];
    for (var i = 0; i < items.length; i++) {
      cols[i % cols.length].push(items[i]);
    }

    var colHtml = [];
    for (var c = 0; c < cols.length; c++) {
      if (!cols[c].length) continue;
      var rows = [];
      for (var r = 0; r < cols[c].length; r++) {
        var item = cols[c][r];
        var kicker = titleCaseLabel((item.labels && item.labels[0]) || section.label || 'News');
        var img = item.image
          ? '<img alt="" decoding="async" loading="lazy" src="' + esc(item.image) + '"/>'
          : '';

        rows.push(
          '<a class="gg-newsdeck__item" href="' + esc(item.url) + '">' +
            '<span class="gg-newsdeck__body">' +
              '<span class="gg-newsdeck__kicker">' + esc(kicker) + '</span>' +
              '<span class="gg-newsdeck__title">' + esc(item.title) + '</span>' +
            '</span>' +
            '<span class="gg-newsdeck__thumb">' + img + '</span>' +
          '</a>'
        );
      }
      colHtml.push('<div class="gg-newsdeck__col">' + rows.join('') + '</div>');
    }

    return '<div class="gg-newsdeck">' + colHtml.join('') + '</div>';
  }

  function render(slot, section, items) {
    var grid = slot.querySelector('[data-role="grid"]');
    var rail = slot.querySelector('[data-role="rail"]');
    var html = '';

    if (section.type === 'newsdeck') {
      html = newsDeckHtml(items, section);
      if (grid) {
        grid.innerHTML = html;
        grid.removeAttribute('hidden');
      }
      if (rail) rail.setAttribute('hidden', 'hidden');
      return;
    }

    html = items.map(function(item){ return cardHtml(item, section); }).join('');

    if (isRailType(section.type)) {
      if (rail) {
        rail.innerHTML = html;
        rail.removeAttribute('hidden');
      }
      if (grid) grid.setAttribute('hidden', 'hidden');
      return;
    }

    if (grid) {
      grid.innerHTML = html;
      grid.removeAttribute('hidden');
    }
    if (rail) rail.setAttribute('hidden', 'hidden');
  }

  function loadSlot(slot, cfg) {
    if (!slot || slot.__ggMixedLoading) return Promise.resolve();
    if (slot.getAttribute('data-gg-loaded') === '1') return Promise.resolve();

    var section = slot.__ggMixedSection || resolveSectionConfig(slot, cfg);
    slot.__ggMixedSection = section;
    applySectionUi(slot, section);
    renderSkeleton(slot, section);

    slot.__ggMixedLoading = true;
    setState(slot, 'loading');
    clearError(slot);

    return resolveEntries(section, cfg)
      .then(function(items){
        if (!items.length) {
          setState(slot, 'error');
          setError(slot, 'No posts yet.');
          return;
        }
        render(slot, section, items);
        slot.setAttribute('data-gg-loaded', '1');
        setState(slot, 'loaded');
      }, function(){
        setState(slot, 'error');
        setError(slot, 'Feed unavailable.');
      })
      .then(function(){
        slot.__ggMixedLoading = false;
      });
  }

  function collectSlots(root) {
    var base = root && root.querySelectorAll ? root : d;
    var list = Array.prototype.slice.call(base.querySelectorAll('[data-gg-module="mixed-media"]'));
    if (root && root.nodeType === 1 && root.matches && root.matches('[data-gg-module="mixed-media"]')) {
      list.unshift(root);
    }
    return list;
  }

  function init(root) {
    var cfg = parseConfig();
    var slots = collectSlots(root);
    if (!slots.length) return;

    for (var i = 0; i < slots.length; i++) {
      slots[i].__ggMixedSection = resolveSectionConfig(slots[i], cfg);
      applySectionUi(slots[i], slots[i].__ggMixedSection);
      if (slots[i].getAttribute('data-gg-loaded') !== '1') {
        renderSkeleton(slots[i], slots[i].__ggMixedSection);
      }
    }

    var eagerCount = Math.min(2, slots.length);
    for (var j = 0; j < eagerCount; j++) {
      loadSlot(slots[j], cfg);
    }

    if (!('IntersectionObserver' in w)) {
      for (var k = eagerCount; k < slots.length; k++) {
        loadSlot(slots[k], cfg);
      }
      return;
    }

    var io = new IntersectionObserver(function(entries){
      for (var z = 0; z < entries.length; z++) {
        var entry = entries[z];
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        loadSlot(entry.target, cfg);
      }
    }, { rootMargin: '800px 0px' });

    for (var m = eagerCount; m < slots.length; m++) {
      if (slots[m].getAttribute('data-gg-loaded') === '1') continue;
      io.observe(slots[m]);
    }
  }

  mixed.init = mixed.init || init;

  if (G.boot && typeof G.boot.onReady === 'function') {
    G.boot.onReady(function(){ mixed.init(d); });
  } else if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', function(){ mixed.init(d); }, { once: true });
  } else {
    mixed.init(d);
  }
})(window.GG = window.GG || {}, window, document);
