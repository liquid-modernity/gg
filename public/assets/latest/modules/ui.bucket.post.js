(function(w){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.__uiBuckets = GG.__uiBuckets || {};
  if (GG.__uiBuckets.post) return;
  GG.__uiBuckets.post = true;

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
        var blogHref = (GG.core && GG.core.blogHomePath) ? GG.core.blogHomePath('/') : '/blog';
        blogLink.setAttribute('href', blogHref);
        if (!blogLink.__ggBlogBound) {
          blogLink.__ggBlogBound = true;
          blogLink.addEventListener('click', function(e){
            if (GG.core && GG.core.router && typeof GG.core.router.go === 'function') {
              e.preventDefault();
              GG.core.router.go(blogHref);
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

(function(GG, w, d){
  'use strict';
  GG.modules = GG.modules || {};
  GG.modules.TOC = GG.modules.TOC || (function(){
    var TOC_SELECTOR_DEFAULT = 'h2,h3';
    var TOC_MAX_ITEMS = 12;
    function clean(v){ return String(v || '').replace(/\s+/g, ' ').trim(); }
    function resolveRoot(scope){
      var host = (scope && scope.querySelector) ? scope : d;
      return (host.querySelector && host.querySelector('#gg-toc')) || d.getElementById('gg-toc');
    }
    function resolveBody(scope){
      var host = (scope && scope.querySelector) ? scope : d;
      return host.querySelector('.gg-post__content.post-body.entry-content') ||
             host.querySelector('.post-body.entry-content') ||
             host.querySelector('.entry-content') ||
             host.querySelector('[itemprop="articleBody"]') ||
             host.querySelector('.post-body');
    }
    function resolveHeadingSelector(root, opts){
      var fromOpts = (opts && typeof opts.headings === 'string') ? clean(opts.headings) : '';
      var fromRoot = clean(root && root.getAttribute ? root.getAttribute('data-headings') : '');
      var raw = fromOpts || fromRoot || TOC_SELECTOR_DEFAULT;
      var selectors = raw.split(',').map(function(x){ return clean(x).toLowerCase(); }).filter(Boolean);
      var out = [];
      var i = 0;
      var one = '';
      for (; i < selectors.length; i++) {
        one = selectors[i];
        if (one !== 'h2' && one !== 'h3') continue;
        if (out.indexOf(one) !== -1) continue;
        out.push(one);
      }
      return out.length ? out.join(',') : TOC_SELECTOR_DEFAULT;
    }
    function slugify(text){
      var raw = clean(text || '').toLowerCase();
      if (!raw) return 'section';
      var normalized = raw;
      try {
        normalized = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
      } catch (_) {}
      normalized = normalized
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      return normalized || 'section';
    }
    function collectExistingIds(scope){
      var set = {};
      var host = (scope && scope.querySelectorAll) ? scope : d;
      var all = host.querySelectorAll ? host.querySelectorAll('[id]') : [];
      var i = 0;
      var id = '';
      for (; i < all.length; i++) {
        id = clean(all[i].getAttribute('id'));
        if (!id) continue;
        set[id] = true;
      }
      return set;
    }
    function isEligibleHeading(node){
      if (!node || !node.tagName) return false;
      var tag = node.tagName.toLowerCase();
      if (tag !== 'h2' && tag !== 'h3') return false;
      if (!clean(node.textContent || '')) return false;
      if (node.hidden) return false;
      if (String(node.getAttribute && node.getAttribute('aria-hidden') || '').toLowerCase() === 'true') return false;
      if (!node.closest) return true;
      if (node.closest('pre,code,script,style,template')) return false;
      if (node.closest('[hidden],[aria-hidden="true"],.gg-visually-hidden,.visually-hidden')) return false;
      return true;
    }
    function ensureId(h){
      if (!h) return '';
      var existing = clean(h.getAttribute && h.getAttribute('id'));
      if (existing) return existing;
      var state = ensureId._state || { ids: collectExistingIds(d), counts: {} };
      ensureId._state = state;
      var base = slugify(h && h.textContent ? h.textContent : '');
      var count = state.counts[base] || 0;
      var id = '';
      do {
        count += 1;
        id = count === 1 ? base : (base + '-' + count);
      } while (state.ids[id] || (d.getElementById(id) && d.getElementById(id) !== h));
      state.counts[base] = count;
      state.ids[id] = true;
      h.id = id;
      return id;
    }
    function getOffset(root){
      var off = parseInt((root && root.getAttribute('data-scroll-offset')) || '84', 10);
      return isFinite(off) ? off : 84;
    }
    function setCollapsed(root, collapsed){
      if (!root) return;
      if (GG.core && GG.core.state && typeof GG.core.state.toggle === 'function') {
        GG.core.state.toggle(root, 'collapsed', !!collapsed);
      }
      var headBtn = root.querySelector('.gg-toc__headbtn');
      var toggleBtn = root.querySelector('.gg-toc__toggle');
      if (headBtn) headBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', collapsed ? 'Expand' : 'Collapse');
        var icon = toggleBtn.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = collapsed ? 'expand_content' : 'collapse_content';
      }
    }
    function bind(root){
      if (!root || root.__ggTocBound) return;
      root.__ggTocBound = true;
      root.addEventListener('click', function(e){
        if (!e || !e.target || !e.target.closest) return;
        if (e.target.closest('.gg-toc__headbtn,.gg-toc__toggle')) {
          var collapsed = GG.core && GG.core.state && typeof GG.core.state.has === 'function' ? GG.core.state.has(root, 'collapsed') : false;
          setCollapsed(root, !collapsed);
          return;
        }
        var a = e.target.closest('a.gg-toc__link');
        if (!a) return;
        var id = (a.getAttribute('href') || '').replace(/^#/, '');
        var target = id ? d.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        w.scrollTo({ top: target.getBoundingClientRect().top + (w.pageYOffset || 0) - getOffset(root), behavior: 'smooth' });
        try { if (w.history && w.history.replaceState) w.history.replaceState(w.history.state || null, '', '#' + id); } catch (_) {}
      });
    }
    function reset(scope){
      var root = resolveRoot(scope);
      var list = root ? root.querySelector('.gg-toc__list') : null;
      var empty = root ? root.querySelector('.gg-toc__empty') : null;
      if (!root || !list) return false;
      list.textContent = '';
      if (empty) empty.hidden = true;
      root.hidden = true;
      return true;
    }
    function build(scope, opts){
      var root = resolveRoot(scope);
      var list = root ? root.querySelector('.gg-toc__list') : null;
      var empty = root ? root.querySelector('.gg-toc__empty') : null;
      var body = resolveBody(scope);
      var headings = resolveHeadingSelector(root, opts);
      var items = [];
      var i = 0;
      var h = null;
      var li = null;
      var a = null;
      var n = null;
      var t = null;
      var off = 0;
      if (!root || !list) return false;
      bind(root);
      ensureId._state = { ids: collectExistingIds(body || d), counts: {} };
      list.textContent = '';
      if (empty) empty.hidden = true;
      if (!body) {
        root.hidden = true;
        return true;
      }
      items = Array.prototype.slice.call(body.querySelectorAll(headings)).filter(function(x){
        return isEligibleHeading(x);
      });
      if (!items.length) {
        root.hidden = true;
        return true;
      }
      root.hidden = false;
      off = getOffset(root);
      for (; i < items.length && i < TOC_MAX_ITEMS; i++) {
        h = items[i];
        try { h.style.scrollMarginTop = off + 'px'; } catch (_) {}
        li = d.createElement('li');
        li.className = 'gg-toc__item gg-toc__lvl-2';
        a = d.createElement('a');
        a.className = 'gg-toc__link';
        a.href = '#' + ensureId(h);
        n = d.createElement('span');
        n.className = 'gg-toc__num';
        n.textContent = String(i + 1) + '.';
        t = d.createElement('span');
        t.className = 'gg-toc__txt';
        t.textContent = clean(h.textContent);
        a.appendChild(n);
        a.appendChild(t);
        li.appendChild(a);
        list.appendChild(li);
      }
      setCollapsed(root, false);
      return true;
    }
    function init(scope, opts){
      var retries = 0;
      function run(){
        build(scope, opts);
        var root = resolveRoot(scope);
        var body = resolveBody(scope);
        if (!root || !body) return;
        if (!root.hidden) return;
        if (!body.querySelector('h2,h3')) return;
        if (retries >= 4) return;
        retries += 1;
        w.setTimeout(run, 120 * retries);
      }
      run();
      return true;
    }
    return { init: init, reset: reset, build: build };
  })();
  function autoInitToc(){
    if (GG.modules && GG.modules.TOC && typeof GG.modules.TOC.init === 'function') {
      GG.modules.TOC.init(d, { headings: 'h2,h3' });
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', autoInitToc, { once: true });
  else autoInitToc();
})(window.GG = window.GG || {}, window, document);

(function(GG, w, d){
  'use strict';
  if (!GG) return;
  function patchFocusTrap(){
    var S = GG.services = GG.services || {};
    var A = S.a11y;
    if (!A || typeof A.focusTrap !== 'function' || A.__ggCommentsTrapPatched) return false;
    var original = A.focusTrap;
    function trapComments(container, opts){
      if (!container) return function(){};
      var options = opts || {};
      var selector = options.selector || 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
      function visible(el){
        if (!el || el.hidden || (el.getAttribute && el.getAttribute('aria-hidden') === 'true')) return false;
        return !!(el.getClientRects && el.getClientRects().length);
      }
      function focusNoScroll(el){
        if (!el || typeof el.focus !== 'function') return;
        var x = w.pageXOffset || 0, y = w.pageYOffset || 0;
        try { el.focus({ preventScroll: true }); }
        catch (_) { try { el.focus(); w.scrollTo(x, y); } catch(__){} }
      }
      function focusables(){
        return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function(el){
          return !el.hasAttribute('disabled') && visible(el);
        });
      }
      function onKey(e){
        if (!e || e.key !== 'Tab') return;
        var list = focusables();
        if (!list.length) {
          container.setAttribute('tabindex', '-1');
          focusNoScroll(container);
          e.preventDefault();
          return;
        }
        var first = list[0], last = list[list.length - 1], active = d.activeElement;
        var out = !(active && container.contains(active));
        if (e.shiftKey && (out || active === first)) { e.preventDefault(); focusNoScroll(last); return; }
        if (!e.shiftKey && (out || active === last)) { e.preventDefault(); focusNoScroll(first); }
      }
      container.addEventListener('keydown', onKey);
      if (options.autofocus !== false) {
        var list = focusables();
        if (list[0]) focusNoScroll(list[0]);
      }
      return function(){ container.removeEventListener('keydown', onKey); };
    }
    A.focusTrap = function(container, opts){
      var panel = container && container.querySelector ? (
        container.matches && (container.matches('[data-gg-panel="comments"]') || container.matches('.gg-comments-panel')) ? container :
        container.querySelector('[data-gg-panel="comments"]:not([hidden])') || container.querySelector('.gg-comments-panel:not([hidden])')
      ) : null;
      return panel ? trapComments(panel, opts) : original(container, opts);
    };
    A.__ggCommentsTrapPatched = true;
    try {
      if (GG.modules && GG.modules.Panels && typeof GG.modules.Panels.init === 'function') GG.modules.Panels.init();
    } catch (_) {}
    return true;
  }
  if (!patchFocusTrap()) {
    if (GG.boot && typeof GG.boot.onReady === 'function') GG.boot.onReady(patchFocusTrap);
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', patchFocusTrap, { once: true });
    else w.setTimeout(patchFocusTrap, 0);
  }
})(window.GG = window.GG || {}, window, document);

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

      block.textContent = '';
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
  if (!GG || !GG.boot || typeof GG.boot.loadModule !== 'function') return;
  function init(){
    GG.boot.loadModule('ui.bucket.authors.js').then(function(){
      if (GG.modules && GG.modules.postInfoAuthors && typeof GG.modules.postInfoAuthors.init === 'function') {
        GG.modules.postInfoAuthors.init(d);
      }
    }).catch(function(){});
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window.GG = window.GG || {}, window, document);

})(window);
