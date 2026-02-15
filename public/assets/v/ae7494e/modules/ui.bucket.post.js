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


})(window);
