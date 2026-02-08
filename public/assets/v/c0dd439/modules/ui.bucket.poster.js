(function(w){
  'use strict';
  var GG = w.GG = w.GG || {};
  GG.modules = GG.modules || {};
  GG.__uiBuckets = GG.__uiBuckets || {};
  if (GG.__uiBuckets.poster) return;
  GG.__uiBuckets.poster = true;

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


})(window);
