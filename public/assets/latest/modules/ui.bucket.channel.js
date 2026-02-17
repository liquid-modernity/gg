(function(G,w,d){
  'use strict';
  if(!G) return;
  G.modules = G.modules || {};
  var M = G.modules.labelChannel = G.modules.labelChannel || {};
  if (M.__defined) return;
  M.__defined = true;

  var CHANNEL_MODE_MAP = M.MODE_BY_LABEL || {
    podcast: 'podcast',
    podcasts: 'podcast',
    video: 'videos',
    videos: 'videos',
    photography: 'photography',
    photo: 'photography',
    photos: 'photography'
  };
  var CHANNEL_COUNTS = { podcast: 6, youtube: 3, shorts: 5, photography: 12 };
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

  function cardHtml(item, ratioClass, extraClass){
    var klass = 'gg-label-channel__card ' + (extraClass || '');
    var thumbClass = 'gg-label-channel__thumb ' + ratioClass;
    var img = item.thumb ? '<img alt="" decoding="async" loading="lazy" src="' + esc(item.thumb) + '"/>' : '';
    var ago = asTimeLabel(item.published || '');
    return (
      '<a class="' + esc(klass.trim()) + '" href="' + esc(item.url) + '">' +
        '<span class="' + esc(thumbClass.trim()) + '">' + img + '</span>' +
        '<span class="gg-label-channel__meta">' +
          '<span class="gg-label-channel__titleline">' + esc(item.title || '') + '</span>' +
          '<span class="gg-label-channel__time">' + esc(ago || 'recently') + '</span>' +
        '</span>' +
      '</a>'
    );
  }
  function skeletonCard(ratioClass, extraClass){
    var klass = 'gg-label-channel__card gg-label-channel__card--skeleton ' + (extraClass || '');
    return (
      '<article class="' + esc(klass.trim()) + '" aria-hidden="true">' +
        '<span class="gg-label-channel__thumb ' + esc(ratioClass) + '"></span>' +
        '<span class="gg-label-channel__meta">' +
          '<span class="gg-label-channel__titleline"></span>' +
          '<span class="gg-label-channel__time"></span>' +
        '</span>' +
      '</article>'
    );
  }

  function renderSkeleton(body, mode){
    if (!body) return;
    if (mode === 'podcast') {
      var p = [];
      for (var i = 0; i < CHANNEL_COUNTS.podcast; i++) p.push(skeletonCard('gg-label-channel__thumb--sq'));
      body.innerHTML = '<div class="gg-label-channel__section"><div class="gg-label-channel__rail">' + p.join('') + '</div></div>';
      return;
    }
    if (mode === 'videos') {
      var yt = [];
      var sh = [];
      for (var y = 0; y < CHANNEL_COUNTS.youtube; y++) yt.push(skeletonCard('gg-label-channel__thumb--yt'));
      for (var s = 0; s < CHANNEL_COUNTS.shorts; s++) sh.push(skeletonCard('gg-label-channel__thumb--short'));
      body.innerHTML =
        '<div class="gg-label-channel__section">' +
          '<p class="gg-label-channel__subhead">YOUTUBEISH</p>' +
          '<div class="gg-label-channel__rail">' + yt.join('') + '</div>' +
        '</div>' +
        '<div class="gg-label-channel__section">' +
          '<p class="gg-label-channel__subhead">SHORTISH</p>' +
          '<div class="gg-label-channel__rail">' + sh.join('') + '</div>' +
        '</div>';
      return;
    }
    var m = [];
    for (var k = 0; k < CHANNEL_COUNTS.photography; k++) {
      var mod = (k % 5 === 0) ? 'gg-label-channel__card--tall' : '';
      m.push(skeletonCard('gg-label-channel__thumb--photo', mod));
    }
    body.innerHTML = '<div class="gg-label-channel__masonry">' + m.join('') + '</div>';
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
    if (!body) return 0;
    if (mode === 'podcast') {
      var podcast = cap(items, CHANNEL_COUNTS.podcast);
      body.innerHTML =
        '<div class="gg-label-channel__section">' +
          '<div class="gg-label-channel__rail">' +
            podcast.map(function(it){ return cardHtml(it, 'gg-label-channel__thumb--sq'); }).join('') +
          '</div>' +
        '</div>';
      return podcast.length;
    }
    if (mode === 'videos') {
      var split = resolveVideos(items);
      body.innerHTML =
        '<div class="gg-label-channel__section">' +
          '<p class="gg-label-channel__subhead">YOUTUBEISH</p>' +
          '<div class="gg-label-channel__rail">' +
            split.youtube.map(function(it){ return cardHtml(it, 'gg-label-channel__thumb--yt'); }).join('') +
          '</div>' +
        '</div>' +
        '<div class="gg-label-channel__section">' +
          '<p class="gg-label-channel__subhead">SHORTISH</p>' +
          '<div class="gg-label-channel__rail">' +
            split.shorts.map(function(it){ return cardHtml(it, 'gg-label-channel__thumb--short'); }).join('') +
          '</div>' +
        '</div>';
      return split.youtube.length + split.shorts.length;
    }
    var photos = cap((items || []).filter(function(it){ return !it.isVideo; }), CHANNEL_COUNTS.photography);
    if (!photos.length) photos = cap(items, CHANNEL_COUNTS.photography);
    body.innerHTML =
      '<div class="gg-label-channel__masonry">' +
        photos.map(function(it, idx){
          var mod = (idx % 5 === 0) ? 'gg-label-channel__card--tall' : '';
          return cardHtml(it, 'gg-label-channel__thumb--photo', mod);
        }).join('') +
      '</div>';
    return photos.length;
  }

  function ensureHost(main, root, mode, label){
    var host = d.getElementById('gg-label-channel');
    if (!host) {
      host = d.createElement('section');
      host.id = 'gg-label-channel';
      host.className = 'gg-label-channel';
      if (root && root.parentNode) root.parentNode.insertBefore(host, root);
    }
    host.setAttribute('data-gg-mode', mode);
    host.setAttribute('data-gg-label', label);
    host.innerHTML =
      '<header class="gg-label-channel__hd">' +
        '<p class="gg-label-channel__kicker">CHANNEL</p>' +
        '<h2 class="gg-label-channel__title">' + esc(label) + '</h2>' +
      '</header>' +
      '<div class="gg-label-channel__body" data-role="body"></div>' +
      '<p class="gg-label-channel__error" data-role="error" hidden>Channel feed is unavailable.</p>';
    if (main) {
      main.setAttribute('data-gg-label-mode-active', '1');
      main.setAttribute('data-gg-label-mode', mode);
      main.setAttribute('data-gg-label-key', norm(label));
    }
    if (root) root.setAttribute('hidden', 'hidden');
    return host;
  }

  function restoreDefault(main, root){
    if (main) {
      main.removeAttribute('data-gg-label-mode-active');
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
