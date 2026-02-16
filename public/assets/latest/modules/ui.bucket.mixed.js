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

  function toLabelList(raw) {
    var out = [];
    var i;
    if (Array.isArray(raw)) {
      for (i = 0; i < raw.length; i++) {
        var item = String(raw[i] || '').trim();
        if (item) out.push(item);
      }
    } else {
      var str = String(raw || '').trim();
      if (str) {
        out = str.split(',').map(function(part){ return String(part || '').trim(); }).filter(Boolean);
      }
    }
    var seen = Object.create(null);
    var deduped = [];
    for (i = 0; i < out.length; i++) {
      var key = normalizeLabel(out[i]);
      if (!key || seen[key]) continue;
      seen[key] = 1;
      deduped.push(out[i]);
    }
    return deduped;
  }

  function inferType(raw) {
    var v = normalizeLabel(raw);
    if (v === 'youtubeish' || v === 'youtube') return 'youtube';
    if (v === 'shortish' || v === 'shorts' || v === 'short') return 'shorts';
    if (v === 'podcastish' || v === 'podcast') return 'podcast';
    if (v === 'instagramish' || v === 'instagram') return 'instagram';
    if (v === 'newsish' || v === 'newsdeck' || v === 'news') return 'newsdeck';
    if (v === 'popular') return 'popular';
    if (v === 'bookish') return 'bookish';
    if (v === 'pinterestish' || v === 'pinterest') return 'instagram';
    return v || 'bookish';
  }

  function isRailType(type) {
    return type === 'youtube' || type === 'shorts' || type === 'podcast' || type === 'popular';
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
          labels: toLabelList(s.labels || ''),
          cols: clampInt(s.cols, 3, 1, 3),
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
    var labels = toLabelList((fromJson && fromJson.labels) || slot.getAttribute('data-labels') || slot.getAttribute('data-gg-labels') || '');
    var colsRaw = (fromJson && fromJson.cols) || slot.getAttribute('data-cols') || slot.getAttribute('data-gg-cols') || '3';
    var maxRaw = (fromJson && fromJson.max) || slot.getAttribute('data-max') || slot.getAttribute('data-gg-max') || '8';
    var order = (fromJson && fromJson.order) || slot.getAttribute('data-order') || cfg.fetch.order || DEFAULT_ORDER;

    var section = {
      id: id,
      type: type,
      kind: normalizeLabel(kindRaw || type),
      label: String(label || '').trim(),
      labels: labels,
      cols: clampInt(colsRaw, 3, 1, 3),
      max: clampInt(maxRaw, 8, 1, 16),
      order: String(order || DEFAULT_ORDER).trim() || DEFAULT_ORDER,
      kicker: (fromJson && fromJson.kicker) ? String(fromJson.kicker).trim() : '',
      title: (fromJson && fromJson.title) ? String(fromJson.title).trim() : '',
    };

    if (section.type === 'newsdeck') {
      if (!section.labels.length) {
        section.labels = toLabelList(section.label);
      }
      if (!section.labels.length) {
        section.labels = ['news'];
      }
      section.label = section.labels[0];
      section.maxTotal = section.max * section.cols;
    } else {
      section.cols = 1;
      section.maxTotal = section.max;
    }

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
    if (section.labels && section.labels.length) {
      slot.setAttribute('data-gg-labels', section.labels.join(','));
      slot.setAttribute('data-labels', section.labels.join(','));
    }
    slot.setAttribute('data-gg-cols', String(section.cols || 1));
    slot.setAttribute('data-cols', String(section.cols || 1));
    slot.setAttribute('data-gg-max', String(section.max));
    slot.setAttribute('data-max', String(section.max));
    slot.setAttribute('data-gg-max-total', String(section.maxTotal || section.max));
    slot.setAttribute('data-order', section.order);

    var kickerEl = slot.querySelector('[data-role="kicker"]');
    if (kickerEl && section.kicker) kickerEl.textContent = section.kicker;

    var titleEl = slot.querySelector('.gg-mixed__title');
    if (titleEl && section.title && !String(titleEl.textContent || '').trim()) {
      titleEl.textContent = section.title;
    }

    var moreEl = slot.querySelector('[data-role="more"]') || slot.querySelector('.gg-mixed__more');
    if (moreEl) {
      var moreLabel = section.label;
      if (section.type === 'newsdeck' && section.labels && section.labels.length) {
        moreLabel = section.labels[0];
      }
      moreEl.setAttribute('href', buildSeeAllUrl(moreLabel));
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
    if (inferType(section && section.type) === 'newsdeck') {
      return count * clampInt(section && section.cols, 3, 1, 3);
    }
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
    var colCount = clampInt(section && section.cols, 3, 1, 3);
    var rowCount = clampInt(section && section.max, 3, 1, 16);
    var labels = toLabelList(section && section.labels);
    if (!labels.length) labels = [section && section.label ? section.label : 'news'];

    var out = [];
    for (var c = 0; c < colCount; c++) {
      var rows = [];
      for (var i = 0; i < rowCount; i++) {
        rows.push(
          '<article class="gg-newsdeck__item gg-newsdeck__item--placeholder" aria-hidden="true">' +
            '<span class="gg-newsdeck__body">' +
              '<span class="gg-newsdeck__kicker"></span>' +
              '<span class="gg-newsdeck__title"></span>' +
              '<span class="gg-newsdeck__time"></span>' +
            '</span>' +
            '<span class="gg-newsdeck__thumb"></span>' +
          '</article>'
        );
      }
      out.push(
        '<div class="gg-newsdeck__col">' +
          '<p class="gg-newsdeck__col-label">' + esc(titleCaseLabel(labels[c] || labels[labels.length - 1] || 'news')) + '</p>' +
          rows.join('') +
        '</div>'
      );
    }

    if (!out.length) {
      for (var k = 0; k < count; k++) {
        out.push(
        '<article class="gg-newsdeck__item gg-newsdeck__item--placeholder" aria-hidden="true">' +
          '<span class="gg-newsdeck__body">' +
            '<span class="gg-newsdeck__kicker"></span>' +
            '<span class="gg-newsdeck__title"></span>' +
            '<span class="gg-newsdeck__time"></span>' +
          '</span>' +
          '<span class="gg-newsdeck__thumb"></span>' +
        '</article>'
        );
      }
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

  function ensureLabelFeed(label, max, order) {
    label = String(label || '').trim();
    if (!label) return Promise.resolve([]);

    var safeMax = clampInt(max, 8, 1, 120);
    var safeOrder = String(order || DEFAULT_ORDER).trim() || DEFAULT_ORDER;
    var key = [normalizeLabel(label), safeMax, safeOrder].join('|');
    if (labelFetchPromises[key]) return labelFetchPromises[key];

    var url = buildFeedUrl({ label: label, max: safeMax, order: safeOrder });
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

  function fillToCount(items, fallback, max) {
    var out = Array.isArray(items) ? items.slice(0, max) : [];
    var src = Array.isArray(fallback) ? fallback.slice() : [];
    var i = 0;
    if (!src.length) return out.slice(0, max);
    while (out.length < max && src.length) {
      out.push(src[i % src.length]);
      i += 1;
    }
    return out.slice(0, max);
  }

  function resolveNewsDeckColumns(section, cfg) {
    return ensureGlobal(cfg).then(function(globalData){
      var cols = clampInt(section && section.cols, 3, 1, 3);
      var perCol = clampInt(section && section.max, 3, 1, 16);
      var labels = toLabelList(section && section.labels);
      if (!labels.length) labels = toLabelList(section && section.label);
      if (!labels.length) labels = ['news'];
      while (labels.length < cols) {
        labels.push(labels[labels.length - 1]);
      }

      var tasks = [];
      for (var i = 0; i < cols; i++) {
        (function(colLabel){
          tasks.push(
            (function(){
              return ensureLabelFeed(colLabel, perCol, section.order).then(function(labelEntries){
                var selected = pickFromGroup(globalData, colLabel, perCol);
                var merged = dedupe((labelEntries || []).concat(selected));
                if (merged.length < perCol) {
                  merged = dedupe(merged.concat(globalData.entries || []));
                }
                var fallbackPool = dedupe((labelEntries || []).concat(selected).concat(globalData.entries || []));
                return {
                  label: colLabel,
                  items: fillToCount(merged, fallbackPool, perCol)
                };
              });
            })()
          );
        })(labels[i]);
      }

      return Promise.all(tasks);
    });
  }

  function resolveEntries(section, cfg) {
    if (section.type === 'newsdeck') {
      return resolveNewsDeckColumns(section, cfg);
    }
    return ensureGlobal(cfg).then(function(globalData){
      var max = section.max;
      var selected = pickFromGroup(globalData, section.label, max);

      if (selected.length >= max) {
        return selected.slice(0, max);
      }

      return ensureLabelFeed(section.label, section.max, section.order).then(function(labelEntries){
        var merged = dedupe(selected.concat(labelEntries || []));
        if (merged.length < max) {
          merged = dedupe(merged.concat(globalData.entries || []));
        }
        var fallbackPool = dedupe((labelEntries || []).concat(globalData.entries || []).concat(selected));
        return fillToCount(merged, fallbackPool, max);
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

  function timeAgo(iso) {
    var ts = Date.parse(String(iso || ''));
    if (!isFinite(ts)) return '';
    var sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (sec < 60) return 'just now';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + ' min ago';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' hr ago';
    var day = Math.floor(hr / 24);
    if (day < 30) return day + ' d ago';
    var mo = Math.floor(day / 30);
    if (mo < 12) return mo + ' mo ago';
    var yr = Math.floor(day / 365);
    return yr + ' y ago';
  }

  function newsDeckHtml(columns, section) {
    var cols = Array.isArray(columns) ? columns : [];
    if (!cols.length) return '';
    var colHtml = [];
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c] || {};
      var labelName = titleCaseLabel(col.label || (section.labels && section.labels[c]) || section.label || 'News');
      var rows = [];
      var items = Array.isArray(col.items) ? col.items : [];
      for (var r = 0; r < items.length; r++) {
        var item = items[r] || {};
        var img = item.image
          ? '<img alt="" decoding="async" loading="lazy" src="' + esc(item.image) + '"/>'
          : '';
        var sourceName = titleCaseLabel((item.labels && item.labels[0]) || col.label || labelName || 'News');
        var ago = timeAgo(item.published || '');
        var dateIso = String(item.published || '');
        rows.push(
          '<a class="gg-newsdeck__item" href="' + esc(item.url || '#') + '">' +
            '<span class="gg-newsdeck__body">' +
              '<span class="gg-newsdeck__kicker">' + esc(sourceName) + '</span>' +
              '<span class="gg-newsdeck__title">' + esc(item.title || '') + '</span>' +
              '<time class="gg-newsdeck__time" datetime="' + esc(dateIso) + '">' + esc(ago || 'Just published') + '<span aria-hidden="true" class="gg-icon gg-newsdeck__open">open_in_new</span></time>' +
            '</span>' +
            '<span class="gg-newsdeck__thumb">' + img + '</span>' +
          '</a>'
        );
      }
      colHtml.push(
        '<div class="gg-newsdeck__col">' +
          '<p class="gg-newsdeck__col-label">' + esc(labelName) + '</p>' +
          rows.join('') +
        '</div>'
      );
    }
    return '<div class="gg-newsdeck">' + colHtml.join('') + '</div>';
  }

  function countNewsDeckItems(columns) {
    if (!Array.isArray(columns)) return 0;
    var total = 0;
    for (var i = 0; i < columns.length; i++) {
      var items = columns[i] && Array.isArray(columns[i].items) ? columns[i].items : [];
      total += items.length;
    }
    return total;
  }

  function render(slot, section, items) {
    var grid = slot.querySelector('[data-role="grid"]');
    var rail = slot.querySelector('[data-role="rail"]');
    var html = '';

    if (section.type === 'newsdeck') {
      html = newsDeckHtml(items, section);
      slot.setAttribute('data-gg-render-count', String(countNewsDeckItems(items)));
      if (grid) {
        grid.innerHTML = html;
        grid.removeAttribute('hidden');
      }
      if (rail) rail.setAttribute('hidden', 'hidden');
      return;
    }

    html = items.map(function(item){ return cardHtml(item, section); }).join('');
    slot.setAttribute('data-gg-render-count', String(items.length));

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
        var count = section.type === 'newsdeck' ? countNewsDeckItems(items) : (Array.isArray(items) ? items.length : 0);
        if (!count) {
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
