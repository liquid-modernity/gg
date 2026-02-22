(function(G,w,d){
  'use strict';
  if(!G) return;
  G.modules = G.modules || {};
  var M = G.modules.labelChannel = G.modules.labelChannel || {};
  if (M.__defined) return;
  M.__defined = true;

  var DEFAULT_MODE_BY_LABEL = {
    podcast: 'podcast',
    podcasts: 'podcast',
    video: 'videos',
    videos: 'videos',
    photography: 'photography',
    photo: 'photography',
    photos: 'photography'
  };
  var CHANNEL_CONFIG = M.CONFIG || {};
  var CHANNEL_MODE_MAP = CHANNEL_CONFIG.modeByLabel || M.MODE_BY_LABEL || DEFAULT_MODE_BY_LABEL;
  var countConfig = CHANNEL_CONFIG.counts || {};
  var CHANNEL_COUNTS = { podcast: 6, youtube: 3, shorts: 5, photography: 12 };
  if (countConfig) {
    if (parseInt(countConfig.podcast, 10) > 0) CHANNEL_COUNTS.podcast = parseInt(countConfig.podcast, 10);
    if (parseInt(countConfig.youtube, 10) > 0) CHANNEL_COUNTS.youtube = parseInt(countConfig.youtube, 10);
    if (parseInt(countConfig.shorts, 10) > 0) CHANNEL_COUNTS.shorts = parseInt(countConfig.shorts, 10);
    if (parseInt(countConfig.photography, 10) > 0) CHANNEL_COUNTS.photography = parseInt(countConfig.photography, 10);
  }
  var activeReq = 0;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function norm(v){ return String(v || '').trim().toLowerCase(); }
  function stripHtml(s){ return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function parseLabelFromPath(pathname){
    var m = String(pathname || '').match(/^\/search\/label\/([^/?#]+)/i);
    if (!m || !m[1]) return '';
    var raw = String(m[1]).replace(/\+/g, '%20');
    try { return decodeURIComponent(raw); } catch (_) { return raw; }
  }
  function pickAltLink(entry){
    var links = entry && entry.link ? entry.link : [];
    for (var i = 0; i < links.length; i++) {
      if (links[i] && links[i].rel === 'alternate' && links[i].href) return String(links[i].href);
    }
    return '';
  }
  function pickThumb(entry){
    var m = entry && (entry['media$thumbnail'] || entry.media$thumbnail);
    if (m && m.url) return String(m.url);
    var html = '';
    if (entry && entry.content && entry.content.$t) html = entry.content.$t;
    if (!html && entry && entry.summary && entry.summary.$t) html = entry.summary.$t;
    var img = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    return img && img[1] ? String(img[1]) : '';
  }
  function looksLikeVideo(url, thumb, labels){
    var u = norm(url);
    var t = norm(thumb);
    if (u.indexOf('youtube.com') > -1 || u.indexOf('youtu.be') > -1) return true;
    if (t.indexOf('i.ytimg.com/vi/') > -1) return true;
    for (var i = 0; i < labels.length; i++) {
      var k = norm(labels[i]);
      if (!k) continue;
      if (k.indexOf('video') > -1 || k.indexOf('youtube') > -1 || k.indexOf('short') > -1) return true;
    }
    return false;
  }
  function looksLikeShort(url, labels){
    var u = norm(url);
    if (u.indexOf('/shorts/') > -1) return true;
    for (var i = 0; i < labels.length; i++) {
      var k = norm(labels[i]);
      if (!k) continue;
      if (k === 'shorts' || k === 'short' || k === 'shortish') return true;
    }
    return false;
  }
  function asTimeLabel(iso){
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
    return Math.floor(day / 365) + ' y ago';
  }
  function dedupe(items){
    var out = [];
    var seen = Object.create(null);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var key = it && it.url ? String(it.url) : '';
      if (!key || seen[key]) continue;
      seen[key] = 1;
      out.push(it);
    }
    return out;
  }
  function cap(items, n){
    return (Array.isArray(items) ? items : []).slice(0, n);
  }

  function parseFeedEntries(json){
    var feed = json && json.feed ? json.feed : {};
    var entries = Array.isArray(feed.entry) ? feed.entry : [];
    var out = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i] || {};
      var title = e.title && e.title.$t ? String(e.title.$t).trim() : '';
      var url = pickAltLink(e);
      if (!title || !url) continue;
      var labels = [];
      var cats = Array.isArray(e.category) ? e.category : [];
      for (var j = 0; j < cats.length; j++) {
        if (cats[j] && cats[j].term) labels.push(String(cats[j].term));
      }
      var thumb = pickThumb(e);
      var published = e.published && e.published.$t ? String(e.published.$t) : '';
      var isVideo = looksLikeVideo(url, thumb, labels);
      out.push({
        title: title,
        url: url,
        labels: labels,
        thumb: thumb,
        published: published,
        snippet: stripHtml((e.summary && e.summary.$t) || (e.content && e.content.$t) || ''),
        isVideo: isVideo,
        isShort: isVideo && looksLikeShort(url, labels)
      });
    }
    return dedupe(out);
  }

  function feedBaseForLabel(label){
    var api = G.services && G.services.api;
    var base = (api && api.getFeedBase) ? api.getFeedBase(true) : '/feeds/posts/summary';
    base = String(base || '/feeds/posts/summary').replace(/\/$/, '');
    return base + '/-/' + encodeURIComponent(label);
  }
  function fetchLabelFeed(label, max){
    var api = G.services && G.services.api;
    var capMax = Math.max(16, parseInt(max, 10) || 40);
    if (api && typeof api.getFeed === 'function') {
      return api.getFeed({
        summary: 1,
        base: feedBaseForLabel(label),
        'max-results': capMax,
        orderby: 'published',
        alt: 'json'
      }).then(parseFeedEntries);
    }
    var url = feedBaseForLabel(label) + '?alt=json&orderby=published&max-results=' + capMax;
    return w.fetch(url, { credentials: 'same-origin' })
      .then(function(res){ if (!res || !res.ok) throw new Error('feed-failed'); return res.json(); })
      .then(parseFeedEntries);
  }

  function clearNode(el){
    if (!el) return;
    el.textContent = '';
  }
  function make(tag, className, text){
    var el = d.createElement(tag);
    if (className) el.className = className;
    if (typeof text === 'string') el.textContent = text;
    return el;
  }
  function makeCardNode(item, ratioClass, extraClass){
    var card = make('a', ('gg-label-channel__card ' + (extraClass || '')).trim());
    var thumb = make('span', ('gg-label-channel__thumb ' + ratioClass).trim());
    var meta = make('span', 'gg-label-channel__meta');
    var title = make('span', 'gg-label-channel__titleline', String((item && item.title) || ''));
    var time = make('span', 'gg-label-channel__time', asTimeLabel(item && item.published || '') || 'recently');
    var img;
    card.href = String((item && item.url) || '#');
    if (item && item.thumb) {
      img = d.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.src = String(item.thumb);
      thumb.appendChild(img);
    }
    meta.appendChild(title);
    meta.appendChild(time);
    card.appendChild(thumb);
    card.appendChild(meta);
    return card;
  }
  function makeSkeletonNode(ratioClass, extraClass){
    var card = make('article', ('gg-label-channel__card gg-label-channel__card--skeleton ' + (extraClass || '')).trim());
    var thumb = make('span', 'gg-label-channel__thumb ' + ratioClass);
    var meta = make('span', 'gg-label-channel__meta');
    card.setAttribute('aria-hidden', 'true');
    meta.appendChild(make('span', 'gg-label-channel__titleline'));
    meta.appendChild(make('span', 'gg-label-channel__time'));
    card.appendChild(thumb);
    card.appendChild(meta);
    return card;
  }
  function makeSection(title){
    var section = make('div', 'gg-label-channel__section');
    if (title) section.appendChild(make('p', 'gg-label-channel__subhead', title));
    return section;
  }

  function renderSkeleton(body, mode){
    var section;
    var rail;
    var masonry;
    var i;
    var y;
    var s;
    var k;
    var mod;
    if (!body) return;
    clearNode(body);
    if (mode === 'podcast') {
      section = makeSection('');
      rail = make('div', 'gg-label-channel__rail');
      for (i = 0; i < CHANNEL_COUNTS.podcast; i++) rail.appendChild(makeSkeletonNode('gg-label-channel__thumb--sq'));
      section.appendChild(rail);
      body.appendChild(section);
      return;
    }
    if (mode === 'videos') {
      section = makeSection('YOUTUBEISH');
      rail = make('div', 'gg-label-channel__rail');
      for (y = 0; y < CHANNEL_COUNTS.youtube; y++) rail.appendChild(makeSkeletonNode('gg-label-channel__thumb--yt'));
      section.appendChild(rail);
      body.appendChild(section);

      section = makeSection('SHORTISH');
      rail = make('div', 'gg-label-channel__rail');
      for (s = 0; s < CHANNEL_COUNTS.shorts; s++) rail.appendChild(makeSkeletonNode('gg-label-channel__thumb--short'));
      section.appendChild(rail);
      body.appendChild(section);
      return;
    }
    masonry = make('div', 'gg-label-channel__masonry');
    for (k = 0; k < CHANNEL_COUNTS.photography; k++) {
      mod = (k % 5 === 0) ? 'gg-label-channel__card--tall' : '';
      masonry.appendChild(makeSkeletonNode('gg-label-channel__thumb--photo', mod));
    }
    body.appendChild(masonry);
  }

  function resolveVideos(items){
    var vids = (items || []).filter(function(it){ return !!(it && it.isVideo); });
    var shorts = cap(vids.filter(function(it){ return it.isShort; }), CHANNEL_COUNTS.shorts);
    var youtube = cap(vids.filter(function(it){ return !it.isShort; }), CHANNEL_COUNTS.youtube);
    if (!youtube.length) youtube = cap(vids, CHANNEL_COUNTS.youtube);
    if (!shorts.length) shorts = cap(vids, CHANNEL_COUNTS.shorts);
    return { youtube: youtube, shorts: shorts };
  }

  function renderMode(body, mode, items){
    var podcast;
    var split;
    var photos;
    var section;
    var rail;
    var masonry;
    var idx;
    var mod;
    if (!body) return 0;
    clearNode(body);
    if (mode === 'podcast') {
      podcast = cap(items, CHANNEL_COUNTS.podcast);
      section = makeSection('');
      rail = make('div', 'gg-label-channel__rail');
      for (idx = 0; idx < podcast.length; idx++) {
        rail.appendChild(makeCardNode(podcast[idx], 'gg-label-channel__thumb--sq'));
      }
      section.appendChild(rail);
      body.appendChild(section);
      return podcast.length;
    }
    if (mode === 'videos') {
      split = resolveVideos(items);
      section = makeSection('YOUTUBEISH');
      rail = make('div', 'gg-label-channel__rail');
      for (idx = 0; idx < split.youtube.length; idx++) {
        rail.appendChild(makeCardNode(split.youtube[idx], 'gg-label-channel__thumb--yt'));
      }
      section.appendChild(rail);
      body.appendChild(section);

      section = makeSection('SHORTISH');
      rail = make('div', 'gg-label-channel__rail');
      for (idx = 0; idx < split.shorts.length; idx++) {
        rail.appendChild(makeCardNode(split.shorts[idx], 'gg-label-channel__thumb--short'));
      }
      section.appendChild(rail);
      body.appendChild(section);
      return split.youtube.length + split.shorts.length;
    }
    photos = cap((items || []).filter(function(it){ return !it.isVideo; }), CHANNEL_COUNTS.photography);
    if (!photos.length) photos = cap(items, CHANNEL_COUNTS.photography);
    masonry = make('div', 'gg-label-channel__masonry');
    for (idx = 0; idx < photos.length; idx++) {
      mod = (idx % 5 === 0) ? 'gg-label-channel__card--tall' : '';
      masonry.appendChild(makeCardNode(photos[idx], 'gg-label-channel__thumb--photo', mod));
    }
    body.appendChild(masonry);
    return photos.length;
  }

  function ensureHost(main, root, mode, label){
    var host = d.getElementById('gg-label-channel');
    var header;
    var title;
    var body;
    var error;
    if (!host) {
      host = d.createElement('section');
      host.id = 'gg-label-channel';
      host.className = 'gg-label-channel';
      if (root && root.parentNode) root.parentNode.insertBefore(host, root);
    }
    host.setAttribute('data-gg-mode', mode);
    host.setAttribute('data-gg-label', label);
    clearNode(host);
    header = make('header', 'gg-label-channel__hd');
    header.appendChild(make('p', 'gg-label-channel__kicker', 'CHANNEL'));
    title = make('h2', 'gg-label-channel__title', String(label || ''));
    header.appendChild(title);
    body = make('div', 'gg-label-channel__body');
    body.setAttribute('data-role', 'body');
    error = make('p', 'gg-label-channel__error', 'Channel feed is unavailable.');
    error.setAttribute('data-role', 'error');
    error.setAttribute('hidden', 'hidden');
    host.appendChild(header);
    host.appendChild(body);
    host.appendChild(error);
    if (main) {
      main.setAttribute('data-gg-label-mode', mode);
      main.setAttribute('data-gg-label-key', norm(label));
      main.removeAttribute('data-gg-label-mode-active');
      main.setAttribute('data-gg-label-mode-pending', '1');
    }
    if (root) root.removeAttribute('hidden');
    return host;
  }

  function activateMode(main, root, mode, label){
    if (main) {
      main.setAttribute('data-gg-label-mode-active', '1');
      main.setAttribute('data-gg-label-mode', mode);
      main.setAttribute('data-gg-label-key', norm(label));
      main.removeAttribute('data-gg-label-mode-pending');
    }
    if (root) root.setAttribute('hidden', 'hidden');
  }

  function restoreDefault(main, root){
    if (main) {
      main.removeAttribute('data-gg-label-mode-active');
      main.removeAttribute('data-gg-label-mode-pending');
      main.removeAttribute('data-gg-label-mode');
      main.removeAttribute('data-gg-label-key');
    }
    if (root) root.removeAttribute('hidden');
    var host = d.getElementById('gg-label-channel');
    if (host && host.parentNode) host.parentNode.removeChild(host);
  }

  function init(rootDoc){
    var ref = rootDoc || d;
    var path = (w.location && w.location.pathname) ? w.location.pathname : '';
    var label = parseLabelFromPath(path);
    var mode = CHANNEL_MODE_MAP[norm(label)] || '';
    var root = ref.getElementById ? ref.getElementById('postcards') : d.getElementById('postcards');
    var main = root && root.closest ? root.closest('.gg-blog-main') : d.querySelector('.gg-blog-main');

    if (!label || !mode || !root || !main) {
      restoreDefault(main, root);
      return;
    }

    var req = ++activeReq;
    var host = ensureHost(main, root, mode, label);
    var body = host.querySelector('[data-role="body"]');
    var error = host.querySelector('[data-role="error"]');
    if (error) error.setAttribute('hidden', 'hidden');
    renderSkeleton(body, mode);
    host.setAttribute('data-gg-state', 'loading');

    fetchLabelFeed(label, 64).then(function(items){
      if (req !== activeReq) return;
      var count = renderMode(body, mode, items || []);
      if (!count) {
        restoreDefault(main, root);
        return;
      }
      activateMode(main, root, mode, label);
      host.setAttribute('data-gg-state', 'loaded');
      host.setAttribute('data-gg-render-count', String(count));
    }).catch(function(){
      if (req !== activeReq) return;
      host.setAttribute('data-gg-state', 'error');
      if (error) error.removeAttribute('hidden');
      restoreDefault(main, root);
    });
  }

  M.init = M.init || init;
})(window.GG = window.GG || {}, window, document);
