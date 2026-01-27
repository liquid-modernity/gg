(function(){
  "use strict";
  window.GG = window.GG || {};
  GG.modules = GG.modules || {};
  GG.VERSION = GG.VERSION || "2026-01-27";

  function once(key){
    GG.__once = GG.__once || {};
    if (GG.__once[key]) return false;
    GG.__once[key] = true;
    return true;
  }

  function ggDisabled(){
    try{
      const u = new URL(location.href);
      if (u.searchParams.get("gg") === "0") return true;
      if (localStorage.getItem("GG_DISABLE") === "1") return true;
    }catch(e){}
    return false;
  }

  function boot(){
    if (GG.__BOOTED__) return false;
    GG.__BOOTED__ = true;
    if (ggDisabled()) return false;
    return true;
  }

  GG.boot = boot;
  if (!boot()) return;

  // Script #3
  
    
  

  // Script #4
  
  
  

  // Script #5
  
  
  

  // Script #6
  
  
  

  // Script #7
  
  
  

  // Script #10
  
  (function(){
    if (!once('adsPush')) return;
    if (typeof window === 'undefined' || !window.adsbygoogle) return;
    (adsbygoogle = window.adsbygoogle || []).push({});
  }());
    
  
  // Script #13
   
  (function(){
    if (!once('commentsEnhancer')) return;
    var rootEl = document.getElementById('comments') || document.getElementById('comments-ssr');
    if (!rootEl) return;
    // Root container untuk threaded comments; fallback ke document
    var rootId = 'cmt2-holder';
  
    // Helper singkat untuk querySelector / querySelectorAll
    function qsa(root, sel){ return (root || document).querySelectorAll(sel); }
    function qs(root, sel){ return (root || document).querySelector(sel); }
  
    /* ------------------------------------------------------------------
     * 1. CLEANUP
     *    Bersihkan elemen bawaan Blogger yang secara visual tidak dipakai
     * ------------------------------------------------------------------ */
    function cleanse(root){
      var scope = root || document;
  
      // 1a. Hapus link "continue"/"balasan" default Blogger
      qsa(scope, 'a > span[id*="comment-continue"]').forEach(function(s){
        var a = s.closest('a');
        if (a) a.remove();
      });
  
      // 1b. Hapus label "Replies"/"Balasan" liar di dalam .comment-replies
      qsa(scope, '.comment-replies').forEach(function(rep){
        qsa(rep, '*').forEach(function(n){
          var txt = (n.textContent || '').trim().toLowerCase();
          if (!txt) return;
  
          // Jangan menyentuh wrapper / isi .comment asli
          if (n.classList.contains('comment')) return;
          if (n.querySelector('.comment')) return;
  
          if (/^(replies|balasan)$/i.test(txt)){
            n.remove();
          }
        });
      });
    }
  
    /* ------------------------------------------------------------------
     * 2. LAYOUT HEADER
     *    Atur header komentar jadi grid + sisipkan garis pemisah .c-sep
     * ------------------------------------------------------------------ */
    function headerLayout(root){
      qsa(root, '.comment-thread .comment').forEach(function(c){
        var hdr = qs(c, '.comment-header');
        if (hdr){
          hdr.style.display = 'grid';
        }
  
        // Tambahkan garis pemisah halus setelah header jika belum ada
        var sep = c.querySelector('.c-sep');
        if (!sep){
          var s = document.createElement('div');
          s.className = 'c-sep';
          var after = qs(c, '.comment-content');
          if (after){
            after.parentNode.insertBefore(s, after);
          }
        }
      });
    }
  
    /* ------------------------------------------------------------------
     * 3. ACTIONS &#8594; PILL BUTTONS
     *    Semua tombol di bar aksi dijadikan pill (Reply, toggle, Like, dll.)
     * ------------------------------------------------------------------ */
    function beautifyActions(root){
      qsa(root, '.comment-actions a, a.comment-reply, .comment-actions button')
        .forEach(function(a){
          a.classList.add('btn-pill');
        });
    }
  
    /* ------------------------------------------------------------------
     * 4. HELPER: CARI LINK DELETE BAWAAN BLOGGER
     *    Meng-cover:
     *      - <a class='comment-delete'/>
     *      - ataupun anchor lain dengan teks "Delete/Hapus"
     * ------------------------------------------------------------------ */
    function findDeleteLink(c){
      // Prioritas: class bawaan kalau ada
      var del = qs(c, 'a.comment-delete');
      if (del  && del.href) return del;
  
      // Fallback: anchor lain yang teksnya Delete/Hapus (bukan Reply)
      qsa(c, 'a').forEach(function(a){
        if (del) return; // sudah ketemu
  
        var txt = (a.textContent || '').trim().toLowerCase();
        if (!txt) return;
  
        if (a.classList.contains('comment-reply')) return;
  
        if (/^(delete|hapus|hapus komentar)$/i.test(txt)  && a.href){
          del = a;
        }
      });
  
      return del  && del.href ? del : null;
    }
  
      /* ------------------------------------------------------------------
     * 5. Helper kecil untuk set label tombol (dipakai toggle & lain-lain) &#8943;
     * ------------------------------------------------------------------ */
    
    function setBtnLabel(el, text){
    if (!el) return;
    var labelSpan = el.querySelector('.cmt2-btn-text');
    if (labelSpan){
      labelSpan.textContent = text;
    } else {
      el.textContent = text;
    }
    el.setAttribute('aria-label', text);
  }
  
    /* ------------------------------------------------------------------
     * 5. TOGGLE BALASAN + MENU &#8943;
     *    - Buat tombol "Lihat X balasan / Sembunyikan X balasan"
     *    - Buat menu &#8943; di header dengan aksi "Hapus Komentar"
     * ------------------------------------------------------------------ */
  function setupToggles(root){
    qsa(root, '.comment-thread .comment').forEach(function(c){
      var replies = qs(c, '.comment-replies');
  
      // Pastikan bar aksi ada
      var actions = qs(c, '.comment-actions');
      if (!actions){
        actions = document.createElement('div');
        actions.className = 'comment-actions';
        c.appendChild(actions);
      }
  
      // Pastikan link Reply cuma satu dan di bar aksi
      var replyLinks = qsa(c, 'a.comment-reply');
      if (replyLinks.length){
        replyLinks.forEach(function(link, idx){
          if (idx === 0){
            if (actions && !actions.contains(link)){
              actions.appendChild(link);
            }
            // &#8674; pasang ikon reply kalau belum
            if (!link.dataset.iconReady){
              var lbl = link.dataset.originalLabel || (link.textContent || 'Reply').trim() || 'Balas';
              link.dataset.originalLabel = lbl;
              link.setAttribute('aria-label', lbl);
              link.innerHTML =
                "<span aria-hidden='true' class='ms'>reply</span>" +
                "<span class='cmt2-btn-text'>" + lbl + "</span>";
              link.dataset.iconReady = '1';
            }
          } else {
            link.remove();
          }
        });
      }
  
      // ----- tombol Lihat / Sembunyikan balasan -----
      if (replies){
        var count = replies.querySelectorAll('.comment').length;
        if (count > 0){
          var btnToggle = qs(c, '.cmt2-toggle');
          if (!btnToggle){
            btnToggle = document.createElement('button');
            btnToggle.type = 'button';
            btnToggle.className = 'btn-pill cmt2-toggle';
            btnToggle.innerHTML =
              "<span aria-hidden='true' class='ms'>forum</span>" +
              "<span class='cmt2-btn-text'/>";
            actions.prepend(btnToggle);
  
            btnToggle.addEventListener('click', function(){
              var open = replies.classList.toggle('is-open');
              var cc = replies.querySelectorAll('.comment').length;
              var txt = (open ? 'Hide ' : 'View ') + cc + (cc > 1 ? ' replies' : ' reply');
  setBtnLabel(btnToggle, txt);
              btnToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
          }
          if (!replies.classList.contains('is-open')) replies.classList.add('is-open');
          var openNow = replies.classList.contains('is-open');
  var txt0 = (openNow ? 'Hide ' : 'View ') + count + (count > 1 ? ' replies' : ' reply');
  setBtnLabel(btnToggle, txt0);
          btnToggle.setAttribute('aria-expanded', openNow ? 'true' : 'false');
        } 
      }
  
    
     /* ------------------------------------------------------------------
     * 5.1. menu + Hapus Komentar + Copy Link Komenta &#8943;
     *    - Buat menu &#8943; di header dengan aksi "Hapus Komentar"
          - Buat menu &#8943; di header dengan aksi "Salin tautan Komentar"
     * ------------------------------------------------------------------ */
    
      // ----- menu &#8943; + Hapus Komentar + Copy Link Komentar -----
      var delLink = findDeleteLink(c);
      var ctx     = qs(c, '.cmt2-ctx');
      var pop, btn3;
  
      if (delLink){
        delLink.style.display = 'none';
  
        if (!ctx){
          ctx = document.createElement('div');
          ctx.className = 'cmt2-ctx';
  
          btn3 = document.createElement('button');
          btn3.type = 'button';
          btn3.className = 'cmt2-ctx-btn';
          btn3.setAttribute('aria-label', 'Lainnya');
          btn3.innerHTML = "<span aria-hidden='true' class='material-symbols-rounded'>more_vert</span>";
  
          pop = document.createElement('div');
          pop.className = 'cmt2-ctx-pop';
  
          ctx.appendChild(btn3);
          ctx.appendChild(pop);
          c.appendChild(ctx);
  
          btn3.addEventListener('click', function(e){
            e.stopPropagation();
            pop.classList.toggle('is-open');
          });
          document.addEventListener('click', function(){
            pop.classList.remove('is-open');
          });
        } else {
          pop = qs(ctx, '.cmt2-ctx-pop');
        }
  
        if (pop && !pop.querySelector('.cmt2-del')){
          var btnDel = document.createElement('button');
          var btnCop = document.createElement('button');
          btnDel.className = 'cmt2-del';
          btnCop.className = 'cmt2-cop';
    
          var delLabel = 'Delete comment';
          btnDel.setAttribute('aria-label', delLabel);
          btnDel.innerHTML =
            "<span aria-hidden='true' class='ms'>delete</span>" +
            "<span class='cmt2-btn-text'>" + delLabel + "</span>";
    
          var copyLabel = 'Copy link';
          btnCop.setAttribute('aria-label', copyLabel);
          btnCop.innerHTML =
            "<span aria-hidden='true' class='ms'>link</span>" +
            "<span class='cmt2-btn-text'>" + copyLabel + "</span>";
  
          btnDel.addEventListener('click', function(){
            if (typeof delLink.click === 'function'){
              delLink.click();
            } else if (delLink.href){
              window.location.href = delLink.href;
            }
          });
    // --- Event listener BARU untuk tombol Copy Link ---
          btnCop.addEventListener('click', function(){
            // 1. Temukan tautan permanen komentar (permalink)
            // Di Blogger, permalink seringkali ada di dalam elemen tanggal/waktu.
            // Kita asumsikan permalink ada di dalam tautan dengan class 'timestamp-link' atau sejenisnya
            var permalinkEl = qs(c, '.secondary-text a') || qs(c, '.comment-permalink'); // Sesuaikan selektor ini jika perlu
            
            if (permalinkEl && permalinkEl.href) {
              var commentUrl = permalinkEl.href;
              
              // 2. Salin URL ke clipboard
              var copyTask = (GG.util && typeof GG.util.copyToClipboard === 'function')
                ? GG.util.copyToClipboard(commentUrl)
                : Promise.reject(new Error('copy util missing'));
              copyTask.then(function() {
                // Opsional: Beri feedback ke pengguna
                var textNode = qs(btnCop, '.cmt2-btn-text');
                var originalText = textNode && textNode.textContent;
                if (textNode) {
                  textNode.textContent = 'Link Tersalin!';
                }
                setTimeout(function() {
                  if (textNode && originalText) {
                    textNode.textContent = originalText;
                  }
                }, 1500);
              }).catch(function(err) {
                console.error('Gagal menyalin URL: ', err);
              });
            } else {
              if (GG.util && typeof GG.util.showToast === 'function') {
              GG.util.showToast('Tautan komentar tidak ditemukan.', { icon: '' });
              }
            }
          });
          // ------------------------------------------------
    pop.appendChild(btnCop);      
    pop.appendChild(btnDel);
          
        }
      } else if (ctx){
        ctx.remove();
      }
    });
  }
  
  
    /* ------------------------------------------------------------------
     * 6. LIKE LOKAL
     *    Tombol "Suka / Disukai" per komentar (disimpan di localStorage)
     * ------------------------------------------------------------------ */
    function setupLikes(root){
    var scope = root || document;
  
    qsa(scope, '.gg-comments .comment, .comments2 .comment, .comment-thread .comment').forEach(function(c){
      if (c.dataset.likeReady) return;
  
      var id = c.id || c.getAttribute('data-comment-id');
      if (!id) return;
  
      var actions = qs(c, '.comment-actions');
      if (!actions){
        actions = document.createElement('div');
        actions.className = 'comment-actions';
        c.appendChild(actions);
      }
  
      var likeKey = 'cmt2_like:' + id;
      var store   = null;
      try { store = window.localStorage; } catch(e){}
  
      var liked = store ? (store.getItem(likeKey) === '1') : false;
  
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-pill cmt2-like';
  
      var ico = document.createElement('span');
      ico.className = 'ms';
      ico.setAttribute('aria-hidden', 'true');
      ico.textContent = 'favorite';
      var txtSpan = document.createElement('span');
      txtSpan.className = 'cmt2-btn-text';
  
      btn.appendChild(ico);
      btn.appendChild(txtSpan);
  
      function render(){
        txtSpan.textContent = liked ? 'Liked' : 'Like';
        btn.classList.toggle('is-liked', liked);
        var ggA11y = window.GG &&window.GG.a11y;
        if (ggA11y && typeof ggA11y.setToggle === 'function') {
          ggA11y.setToggle(btn, liked);
        } else {
          btn.classList.toggle('gg-is-active', liked);
          btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
        }
        btn.setAttribute('aria-label', liked ? 'Batalkan suka komentar ini' : 'Sukai komentar ini');
  
        ico.classList.toggle('ms--filled', liked);
      }
      render();
  
      btn.addEventListener('click', function(){
        liked = !liked;
        if (store){
          if (liked) store.setItem(likeKey, '1');
          else store.removeItem(likeKey);
        }
        render();
      });
  
      var toggle = qs(actions, '.cmt2-toggle');
      if (toggle && toggle.nextSibling){
        actions.insertBefore(btn, toggle.nextSibling);
      } else if (toggle){
        actions.appendChild(btn);
      } else {
        actions.prepend(btn);
      }
  
      c.dataset.likeReady = '1';
    });
  }
  
  
      /* ------------------------------------------------------------------
     * 7. BADGE AUTHOR
     *    Tambahkan icon verified di nama author (kelas .by-blog-author)
     * ------------------------------------------------------------------ */
    
    
    //var rootId = 'cmt2-holder';
    //function qsa(r, sel){ return (r || document).querySelectorAll(sel); }
    //function qs(r, sel){ return (r || document).querySelector(sel); }
  
    /* ... fungsi cleanse, headerLayout, beautifyActions, findDeleteLink,
          setupToggles, setupLikes, highlightTarget, onReplyScroll
          BIARKAN seperti sekarang ... */
  
    /* === 7. Badge "Verified" untuk komentar author === */
    var VERIFIED_AUTHORS = ['Pak RPP','lung']; 
    // &#8593; silakan sesuaikan / tambah nama lain kalau ada co-author
    
    
      function setupAuthorBadges(root){
      var holder = root || document;
  
      qsa(holder, '.comment-thread .comment').forEach(function(c){
        if (c.dataset.authorReady) return;
  
        var nameEl = qs(c, 'cite.user, .user');
        if (!nameEl) return;
  
        var name = (nameEl.textContent || '').trim();
        if (!name) return;
  
        var isAuthor = VERIFIED_AUTHORS.indexOf(name) !== -1;
  
        // kalau suatu saat Blogger kasih class bawaan:
        if (c.classList.contains('by-blog-author') || c.classList.contains('blog-author')){
          isAuthor = true;
        }
  
        if (!isAuthor) return;
  
        c.dataset.authorReady = '1';
        c.classList.add('cmt2-author');
  
        // highlight avatar
        var avatar = qs(c, '.avatar-image-container');
        if (avatar){
          avatar.classList.add('cmt2-avatar-author');
  
          if (!qs(avatar, '.cmt2-verified-ico')){
            var badge = document.createElement('span');
            badge.className = 'cmt2-verified-ico';
            badge.innerHTML = "<span aria-hidden='true' class='ms ms--filled'>verified</span>";
            avatar.appendChild(badge);
          }
        }
  
        // optional: warna nama
        nameEl.classList.add('cmt2-author-name');
      });
    }
  
  
    
    /* ------------------------------------------------------------------
     * 8. DEEP-LINK (#c123)
     *    Kalau URL mengandung #cID &#8594; buka thread  & highlight komentar target
     * ------------------------------------------------------------------ */
    function highlightTarget(){
      if (!location.hash || !/^(#c\d+)/.test(location.hash)) return;
      var el = document.querySelector(location.hash);
      if (!el) return;
  
      var parent = el.closest('.comment-replies');
      if (parent){
        parent.classList.add('is-open');
      }
  
      el.classList.add('is-highlight');
      el.scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(function(){
        el.classList.remove('is-highlight');
      }, 2200);
    }
  
    /* ------------------------------------------------------------------
     * 9. INTERAKSI REPLY
     *    Klik "Reply" &#8594; highlight kartu yang di-reply + scroll ke form
     * ------------------------------------------------------------------ */
    function onReplyScroll(){
      document.addEventListener('click', function(e){
        var a = e.target.closest  && e.target.closest('a.comment-reply');
        if (!a) return;
  
        var comment = a.closest('.comment');
  
        // Reset highlight lama
        qsa(document, '.comment.is-reply-target').forEach(function(c){
          c.classList.remove('is-reply-target');
        });
  
        // Tandai komentar yang sedang di-reply
        if (comment){
          comment.classList.add('is-reply-target');
        }
  
        // Scroll halus ke form komentar
        setTimeout(function(){
          var f = document.getElementById('comment-editor');
          if (f){
            f.scrollIntoView({behavior:'smooth', block:'center'});
          }
        }, 80);
      });
    }
  
      /* ------------------------------------------------------------------
     * 9.1. ICON ADD COMMENT
     *    Klik "Reply" &#8594; highlight kartu yang di-reply + scroll ke form
     * ------------------------------------------------------------------ */
    function enhanceReplyButtons(){
    var btns = qsa(document, 'a.comment-reply');
  
    btns.forEach(function(a){
      if (a.dataset.iconified) return;   // biar nggak dobel
      a.dataset.iconified = '1';
  
      var label = a.textContent.trim() || 'Reply';
  
      a.classList.add('btn-pill');
  
      a.innerHTML =
        "<span aria-hidden='true' class='ms'>reply</span>" +
        "<span class='cmt2-btn-text'>" + label + "</span>";
    });
  }
  
  document.addEventListener('DOMContentLoaded', function(){
    enhanceReplyButtons();
  //  onReplyScroll(); // fungsi yang kamu punya tadi
  });
  
    /* ------------------------------------------------------------------
     * 10. ORKESTRATOR
     *    Jalankan semua modul di atas + pasang observer untuk DOM dinamis
     * ------------------------------------------------------------------ */
    function runAll(){
      var holder = document.getElementById(rootId) || document;
      cleanse(holder);
      headerLayout(holder);
      beautifyActions(holder);
      setupToggles(holder);
      setupLikes(holder);
      setupAuthorBadges(holder);   // panggil di sini
      highlightTarget();
      onReplyScroll();
  
      if (window.MutationObserver && holder){
        new MutationObserver(function(){
          cleanse(holder);
          headerLayout(holder);
          beautifyActions(holder);
          setupToggles(holder);
          setupLikes(holder);
          setupAuthorBadges(holder); // dan di sini
        }).observe(holder, {childList:true, subtree:true});
      }
  
      window.addEventListener('hashchange', highlightTarget);
    }
  
    //if(document.readyState === 'loading'){
   //   document.addEventListener('DOMContentLoaded', runAll);
    //} else {
    //  runAll();
    //}
  
  
    /* ------------------------------------------------------------------
     * 10. INIT
     *     Pastikan runAll() terpanggil setelah DOM siap
     * ------------------------------------------------------------------ */
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', runAll);
    } else {
      runAll();
    }
  
    
    /* === GAGA COMMENTS &#8211; REPLY MENTION DINAMIS v5 ======================= */
  (function(){
    var HOLDER_ID = 'cmt2-holder';
  
    function $all(root, sel){
      return (root || document).querySelectorAll(sel);
    }
    function $one(root, sel){
      return (root || document).querySelector(sel);
    }
    
      // Ambil ID numerik komentar dari <li id='c123456'/> atau data-comment-id
    function getCommentNumericId(comment){
      if (!comment) return null;
  
      // contoh id: "c6090181497010611202"
      var idAttr = comment.getAttribute('id') || '';
      var m = idAttr.match(/^c(\d+)$/);
      if (m && m[1]) return m[1];
  
      var dataId = comment.getAttribute('data-comment-id');
      if (dataId) return dataId;
  
      return null;
    }
  
    
      // Pindahkan iframe comment-editor ke reply box tertentu + set parentID
    // Tambah catatan kecil di atas editor reply
    function ensureReplyHint(box){
      if (!box) return;
  
      // jangan dobel kalau sudah ada
      var hint = box.querySelector('.cmt2-reply-hint');
      if (!hint){
        hint = document.createElement('div');
        hint.className = 'cmt2-reply-hint';
        hint.innerHTML =
        '&#8226; Use Ctrl/Cmd+V (or Tap & Hold > Paste) to insert references accurately.<br/>' +
        '&#8226; &#10003; Notify me via email of new replies.<br/>' +
        '&#8226; [quote]...[/quote]<br/>' +
  '&#8226; [code]...[/code]<br/>' +
  '&#8226; [link]Text | https://example.com[/link]<br/>' +
  '&#8226; [image]https://example.com/pic.jpg[/image]<br/>' +
  '&#8226; Only http/https URLs are rendered.';
        
      // taruh di paling atas, sebelum iframe/form editor
        box.insertBefore(hint, box.firstChild || null);
      }
    }
  
    // Pindahkan iframe comment-editor ke reply box tertentu + set parentID
    function moveEditorTo(parentId, boxId){
      var iframe = document.getElementById('comment-editor');
      if (!iframe) return;
  
      var box = document.getElementById(boxId || 'top-ce');
      if (!box) return;
  
      // pindahkan iframe ke container tujuan
      if (!box.contains(iframe)){
        box.appendChild(iframe);
      }
  
      // pastikan hint satu baris muncul di atas editor
      ensureReplyHint(box);
  
      // Atur ulang query ?parentID=...
      var src   = iframe.getAttribute('src') || '';
      var parts = src.split('#');
      var base  = parts[0];
      var hash  = parts.length > 1 ? '#' + parts.slice(1).join('#') : '';
  
      // buang parentID lama (kalau ada)
      base = base
        .replace(/([?&])parentID=\d+/,'$1')
        .replace(/([?&])$/,'');
  
      if (parentId){
        base += (base.indexOf('?') === -1 ? '?parentID=' : '&parentID=') + parentId;
      }
  
      iframe.src = base + hash;
      iframe.style.display = 'block';
      iframe.removeAttribute('data-resized');
      try {
        iframe.dispatchEvent(new Event('iframeMoved'));
      } catch(e){}
    }
  
  
  
    // ---------- helper ambil data dari kartu komentar ----------
    function getProfileId(c){
      if (!c) return null;
      var link = $one(c,
        'cite.user a[href*="blogger.com/profile"], .user a[href*="blogger.com/profile"]'
      );
      if (!link || !link.href) return null;
      var m = link.href.match(/profile\/([^/?#]+)/);
      return m && m[1] ? m[1] : null;
    }
  
    function getName(c){
      if (!c) return null;
      var el = $one(c, 'cite.user, .user');
      if (!el) return null;
      var t = (el.textContent || '').trim();
      return t || null;
    }
  
    function getPermalink(c){
      if (!c) return null;
      var el =
        $one(c, '.datetime.secondary-text a') ||
        $one(c, '.secondary-text a') ||
        $one(c, '.comment-permalink') ||
        $one(c, 'a[href*="#c"]');
      return (el && el.href) ? el.href : null;
    }
  
    function getProfileUrl(c){
      if (!c) return null;
      var link = $one(c,
        'cite.user a[href*="blogger.com/profile"], .user a[href*="blogger.com/profile"]'
      );
      return (link && link.href) ? link.href : null;
    }
  
    // ---------- index profileId -> { name, url, profileUrl } ----------
    function buildCommentIndex(holder){
      var root = holder || document;
      var idx  = {};
  
      $all(root, '.comment-thread .comment').forEach(function(c){
        var pid = getProfileId(c);
        if (!pid) return;
  
        var name       = getName(c);
        var permalink  = getPermalink(c);
        var profileUrl = getProfileUrl(c);
  
        if (!idx[pid]) idx[pid] = {};
        if (name)       idx[pid].name       = name;
        if (permalink)  idx[pid].url        = permalink;
        if (profileUrl) idx[pid].profileUrl = profileUrl;
      });
  
      return idx;
    }
  
    // ---------- bikin tombol Reply untuk komentar level 2 ----------
    function ensureReplyButtons(holder){
      var root = holder || document;
  
      $all(root, '.comment-thread .comment').forEach(function(c){
        var actions = $one(c, '.comment-actions');
        if (!actions){
          actions = document.createElement('div');
          actions.className = 'comment-actions';
          c.appendChild(actions);
        }
  
        var realReply = $one(actions, 'a.comment-reply');   // bawaan Blogger (level 1)
        var pseudo    = $one(actions, '.cmt2-reply-btn');   // tombol custom (level 2)
  
        if (!realReply && !pseudo){
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-pill cmt2-reply-btn';
          btn.innerHTML =
            "<span aria-hidden='true' class='ms'>reply</span>" +
            "<span class='cmt2-btn-text'>Reply</span>";
          actions.appendChild(btn);
        }
      });
    }
  
      // ---------- parse [reply ...] + bikin meta "Replying to @Nama" ----------
    function processReplyMetadata(holder, index){
      var root = holder || document;
  
      $all(root, '.comment-thread .comment').forEach(function(c){
        var content = $one(c, '.comment-content, .comment-body, .comment-text');
        if (!content || content.dataset.replyReady) return;
  
        var text = (content.textContent || '').replace(/^\s+/, '');
        var headerMatch = text.match(/^\[reply\s+([^\]]+)\]/i);
        if (!headerMatch) return;
  
        var attrStr      = headerMatch[1] || '';
        var profileMatch = attrStr.match(/profile="([^"]+)"/i);
        var urlMatch     = attrStr.match(/url="([^"]+)"/i);
  
        var profileId = profileMatch && profileMatch[1];
        var replyUrl  = urlMatch && urlMatch[1];
        if (!profileId) return;
  
        // buang header [reply ...] dari isi paragraf
        var headerRe = /^\s*\[reply\s+[^\]]+\]\s*/i;
        var html     = content.innerHTML;
        content.innerHTML = html.replace(headerRe, '');
  
        // ==== buang <br/> pembuka (max 2) + whitespace kosong ====
        var drop = 0;
        while (content.firstChild && drop < 2){
          var fc = content.firstChild;
  
          // <br/> pembuka
          if (fc.nodeType === 1 && fc.tagName === 'BR'){
            content.removeChild(fc);
            drop++;
            continue;
          }
  
          // text node berisi spasi/newline saja
          if (fc.nodeType === 3 && !fc.textContent.replace(/\s+/g,'')){
            content.removeChild(fc);
            continue;
          }
  
          break; // ketemu konten beneran
        }
        // ========================================================
  
        // ambil nama terbaru dari index (dinamis)
        var info = index[profileId] || {};
        var name = info.name || profileId;
  
        // --- ambil ID komentar dari URL (&#8230;#c123&#8230;) kalau ada ---
        var commentIdFromUrl = null;
        if (replyUrl){
          var m = replyUrl.match(/#(c\d+)/);
          if (m && m[1]) commentIdFromUrl = m[1];
        }
  
        // tentukan href yang dipakai di @mention
        // prioritas: hash lokal "#c123" supaya scroll tanpa reload
        var href;
        if (commentIdFromUrl){
          href = '#' + commentIdFromUrl;
        } else if (info.url){
          var m2 = info.url.match(/#(c\d+)/);
          if (m2 && m2[1]){
            commentIdFromUrl = m2[1];
            href = '#' + commentIdFromUrl;
          } else {
            href = info.url;
          }
        } else if (info.profileUrl){
          href = info.profileUrl;
        } else {
          href = '#';
        }
  
        // --- deteksi pseudo level-3 (balas reply, bukan root) ---
        var isDeep = false;
        if (commentIdFromUrl){
          var target = document.getElementById(commentIdFromUrl);
          if (target){
            var rootComment = c;
            while (true){
              var parent = rootComment.parentElement;
              if (!parent) break;
              var parentComment = parent.closest ? parent.closest('.comment') : null;
              if (!parentComment) break;
              rootComment = parentComment;
            }
            if (target !== rootComment){
              isDeep = true;  // pseudo level-3
            }
          }
        }
  
        // meta "Replying to @Nama"
        var meta = document.createElement('div');
        meta.className = 'cmt2-reply-meta';
  
        var label = document.createElement('span');
        label.className = 'cmt2-reply-label';
        label.textContent = 'Replying to ';
  
        var a = document.createElement('a');
        a.className = 'cmt2-reply-mention';
        a.textContent = '@' + name;
        a.href = href;
  
        meta.appendChild(label);
        meta.appendChild(a);
  
        if (content.parentNode){
          content.parentNode.insertBefore(meta, content);
        }
  
        content.dataset.replyReady = '1';
        c.classList.add('cmt2-replying');
        if (isDeep){
          c.classList.add('cmt2-replying-deep');
        }
      });
    }
  
    // ---------- klik Reply (level 1/2) -> generate snippet ----------
    function initReplySnippet(){
      document.addEventListener('click', function(e){
        var trigger = e.target.closest &&
                     e.target.closest('a.comment-reply, .cmt2-reply-btn');
        if (!trigger) return;
  
        var comment = trigger.closest('.comment');
        if (!comment) return;
  
        var pid  = getProfileId(comment);
        var url  = getPermalink(comment);
        if (!pid || !url) return;
  
        var snippet = '[reply profile="' + pid + '" url="' + url + '"]\n\n';
  
        var copyPromise;
        try {
          if (window.GG && GG.util && typeof GG.util.copyToClipboard === 'function'){
            copyPromise = GG.util.copyToClipboard(snippet);
          } else if (navigator.clipboard && navigator.clipboard.writeText){
            copyPromise = navigator.clipboard.writeText(snippet);
          } else {
            copyPromise = Promise.resolve();
          }
        } catch (err){
          copyPromise = Promise.resolve();
        }
  
        copyPromise.then(function(){
          if (window.GG && GG.util && typeof GG.util.showToast === 'function'){
            GG.util.showToast(
              'Template balasan tersalin. Tempel di kolom komentar sebelum mengetik.',
              { icon: '' }
            );
          }
        }).catch(function(){
          if (window.GG && GG.util && typeof GG.util.showToast === 'function'){
            GG.util.showToast(
              'Snippet dibuat tapi clipboard diblokir. Silakan salin manual.',
              { icon: '' }
            );
          }
        });
      });
    }
  
    // Klik pseudo-Reply (level 2, 3, dst) -> pindah editor ke replybox komentar tsb
    function initPseudoReplyScroll(){
      document.addEventListener('click', function(e){
        var btn = e.target.closest && e.target.closest('.cmt2-reply-btn');
        if (!btn) return;
  
        var comment = btn.closest('.comment');
        if (!comment) return;
  
        // ID numerik untuk ?parentID=...
        var parentId = getCommentNumericId(comment);
        if (!parentId) return;
  
        // replybox yang benar: "c{ID}-ce"
        var boxId = 'c' + parentId + '-ce';
  
        // 1) pindahkan iframe + set parentID ke komentar ini
        moveEditorTo(parentId, boxId);
  
        // 2) highlight kartu yang dibalas
        $all(document, '.comment.is-reply-target').forEach(function(cmt){
          cmt.classList.remove('is-reply-target');
        });
        comment.classList.add('is-reply-target');
  
        // 3) scroll halus ke editor
        setTimeout(function(){
          var f = document.getElementById('comment-editor');
          if (f){
            f.scrollIntoView({behavior:'smooth', block:'center'});
          }
        }, 80);
      });
    }
  
  
  
    // ---------- pipeline sekali jalan + rerun via MutationObserver ----------
    function runReplyPipeline(){
      var holder = document.getElementById(HOLDER_ID) || document;
      var idx    = buildCommentIndex(holder);
      ensureReplyButtons(holder);       // bikin tombol Reply level 2
      processReplyMetadata(holder, idx);
    }
  
    function init(){
      runReplyPipeline();
  
      var holder = document.getElementById(HOLDER_ID);
      if (window.MutationObserver && holder){
        new MutationObserver(function(){
          runReplyPipeline();
        }).observe(holder, { childList:true, subtree:true });
      }
  
      initReplySnippet();
      initPseudoReplyScroll();
    }
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }());
  /* === /GAGA COMMENTS &#8211; REPLY MENTION DINAMIS v5 ====================== */
    
    
  }());
    
   
  

  // Script #14
  
  (function(){
    if (!once('commentSort')) return;
    var root = document.querySelector('.gg-comments') || document.querySelector('.comments2.threaded');
    if (!root) return;
    var CURRENT_MODE = 'asc'; // default: terlama dulu
  
    // --- ambil <ol id='top-ra'/> yang berisi komentar level 1 ---
    function getTopList(){
      return document.getElementById('top-ra');
    }
  
    // --- kumpulkan li.comment level 1 + kunci waktu dari showComment ---
    function collectTopComments(list){
      var items = [];
      if (!list) return items;
  
      var children = list.children;
      for (var i = 0; i < children.length; i++){
        var li = children[i];
        if (!li.classList || !li.classList.contains('comment')) continue;
  
        var a    = li.querySelector('.datetime.secondary-text a, .secondary-text a');
        var href = a && a.href || '';
        var key  = 0;
  
        // coba ambil ?showComment=TIMESTAMP
        var m = href && href.match(/[?&]showComment=(\d+)/);
        if (m && m[1]){
          key = parseInt(m[1], 10);
        } else if (a && a.textContent){
          var d = Date.parse(a.textContent);
          if (!isNaN(d)) key = d;
        }
  
        items.push({
          el:  li,
          key: key || 0,
          idx: items.length    // index asli sebagai tie-breaker
        });
      }
      return items;
    }
  
    // --- apply sort ascending / descending untuk level 1 ---
    function applySort(mode){
      var list  = getTopList();
      if (!list) return;
  
      var items = collectTopComments(list);
      if (!items.length) return;
  
      items.sort(function(a,b){
        if (a.key === b.key){
          return a.idx - b.idx;
        }
        if (mode === 'desc'){
          return b.key - a.key;   // terbaru dulu
        }
        return a.key - b.key;     // terlama dulu
      });
  
      items.forEach(function(item){
        list.appendChild(item.el);  // re-append > urutan baru
      });
  
      CURRENT_MODE = mode;
  
      // update icon & aria pada toggle
      var root = document.querySelector('.gg-comments') || document.querySelector('.comments2.threaded');
      if (!root) return;
  
      var btn = root.querySelector('.gg-comments__sort-toggle') || root.querySelector('.cmt2-sort-toggle');
      if (!btn) return;
  
      btn.dataset.mode = mode;
      btn.setAttribute(
        'aria-label',
        mode === 'asc'
          ? 'Urutkan: komentar terlama dulu'
          : 'Urutkan: komentar terbaru dulu'
      );
  
      var ico = btn.querySelector('.ms');
      if (ico){
        ico.textContent = mode === 'asc' ? 'south' : 'north';
      }
    }
  
    // --- bikin 1 tombol toggle di kanan "X Comments" ---
    function setupSortToggle(){
      var head = document.querySelector('.gg-comments .gg-comments__head') || document.querySelector('.comments2.threaded .cmt2-head');
      if (!head) return;
      if (head.querySelector('.gg-comments__sort-toggle') || head.querySelector('.cmt2-sort-toggle')) return; // sudah ada
  
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gg-comments__sort-toggle cmt2-sort-toggle';
      btn.dataset.mode = 'asc';
      var ggA11y = window.GG && window.GG.a11y;
      if (ggA11y && typeof ggA11y.setToggle === 'function') {
        ggA11y.setToggle(btn, false);
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
      btn.setAttribute('aria-label', 'Urutkan: komentar terlama dulu');
  
      // icon awal (asc) &#8212; nanti akan disetel ulang oleh applySort()
      btn.innerHTML =
        "<span aria-hidden='true' class='ms'>south</span>";
  
      head.appendChild(btn);
  
      btn.addEventListener('click', function(){
        var next = (btn.dataset.mode === 'asc' ? 'desc' : 'asc');
        applySort(next);
        var a11y = window.GG && window.GG.a11y;
        if (a11y && typeof a11y.setToggle === 'function') {
          a11y.setToggle(btn, true);
        } else {
          btn.setAttribute('aria-pressed', 'true');
        }
      });
    }
  
    function init(){
      setupSortToggle();
      // pastikan icon & state langsung di-init pakai CURRENT_MODE
      applySort(CURRENT_MODE);
    }
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }());
  

  // Script #15
  
  (function(){
    if (!once('commentsPanel')) return;
    var mainEl = document.querySelector('main.gg-main');
    var commentsRoot = document.getElementById('comments') || document.getElementById('comments-ssr');
    if (!mainEl && !commentsRoot) return;
    var mq = window.matchMedia('(min-width: 1024px)');
    function isDesktop(){ return mq.matches; }
  
    function findHelpModal(target){
      var scope = target && target.closest ? target.closest('.gg-comments') : null;
      return (scope && scope.querySelector('[data-gg-modal="comments-help"]')) ||
             document.querySelector('[data-gg-modal="comments-help"]');
    }
  
    function toggleHelpModal(target, open){
      var modal = (target && target.matches && target.matches('[data-gg-modal="comments-help"]'))
        ? target
        : findHelpModal(target);
      if (!modal) return;
      var show = !!open;
      modal.classList.toggle('is-open', show);
      modal.setAttribute('aria-hidden', show ? 'false' : 'true');
      document.body.classList.toggle('gg-comments-help-open', show);
    }
  
    function openCommentsPanel(){
      var main = document.querySelector('main.gg-main');
      if (main){
        main.setAttribute('data-gg-right-mode','comments');
        main.setAttribute('data-gg-info-panel','open');
      }
      var holder = document.getElementById('comments') || document.getElementById('comments-ssr');
      if (holder && !isDesktop()){
        holder.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    }
  
    function handleHashComments(){
      if (location.hash === '#comments' && isDesktop()){
        history.replaceState(null, '', location.href.replace(/#comments$/, ''));
        openCommentsPanel();
      }
    }
  
    document.addEventListener('click', function(e){
      var trigger = e.target.closest('a[href$="#comments"], button[data-gg-postbar="comments"], .gg-post-card__tool[href*="#comments"]');
      if (!trigger) return;
      if (isDesktop()){
        e.preventDefault();
        openCommentsPanel();
      }
    });
  
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-gg-action]');
      if (!btn) return;
      var act = btn.getAttribute('data-gg-action');
  
      if (act === 'comments-help'){
        e.preventDefault();
        toggleHelpModal(btn, true);
        return;
      }
  
      if (act === 'comments-help-close'){
        e.preventDefault();
        toggleHelpModal(btn, false);
        return;
      }
    });
  
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape') return;
      var openModal = document.querySelector('[data-gg-modal="comments-help"].is-open');
      if (openModal){
        toggleHelpModal(openModal, false);
      }
    });
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', handleHashComments);
    } else {
      handleHashComments();
    }
  
    if (mq.addEventListener){
      mq.addEventListener('change', function(ev){
        if (ev.matches && location.hash === '#comments'){
          handleHashComments();
        }
      });
    }
  })();
  

  // Script #16
  
  (function(){
    if (!once('richComments')) return;
    if (!document.querySelector('.gg-comments, .comments2')) return;
    var CONTENT_SEL = '.gg-comments .comment-content, .comments2 .comment-content';
  
  function escapeHtml(str) {
    var map = {
      '\x26': '&',
      '\x3C': '<',
      '\x3E': '>',
      '\x22': '"',
      '\x27': "'"
    };
    
    return String(str || '').replace(/[\x26\x3C\x3E\x22\x27]/g, function(m) {
      return map[m];
    });
  }
  
    function safeUrl(url){
      return /^https?:\/\//i.test(url) ? url : '';
    }
  
    function safeImage(url){
      return /^https?:\/\/[^\s]+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url) ? url : '';
    }
  
    function applyRich(el){
      if (!el || el.dataset.richReady === '1') return;
      var raw = el.textContent || '';
      if (!/\[(quote|code|link|image)\]/i.test(raw)) return;
  
      var html = escapeHtml(raw).replace(/\r\n/g, '\n');
  
      html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, function(_, body){
        var b = body.trim().replace(/\n/g, '<br/>');
        return '<blockquote class="cmt2-quote"><p class="cmt2-quote__text">'+b+'</p></blockquote>';
      });

      html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, function(_, body){
        var b = body.replace(/\n/g, '<br/>');
        return '<pre class="cmt2-code"><code>'+b+'</code></pre>';
      });
  
      html = html.replace(/\[link\](.+?)\|(\s*https?:\/\/[^\s\]]+)\[\/link\]/gi, function(_, text, url){
        var safe = safeUrl((url || '').trim());
        if (!safe) return _;
        return '<a class="cmt2-link" href="'+safe+'" rel="nofollow noopener" target="_blank">'+text.trim()+'</a>';
      });
  
      html = html.replace(/\[image\](https?:\/\/[^\s\]]+)\[\/image\]/gi, function(_, url){
        var safe = safeImage((url || '').trim());
        if (!safe) return _;
        return '<figure class="cmt2-image"><img alt="Comment attachment" loading="lazy" src="'+safe+'"/><figcaption>'+safe+'</figcaption></figure>';
      });
  
      html = html.replace(/\n/g, '<br/>');
      el.innerHTML = html;
      el.dataset.richReady = '1';
    }
  
    function scan(root){
      (root || document).querySelectorAll(CONTENT_SEL).forEach(applyRich);
    }
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){ scan(); });
    } else {
      scan();
    }
  
    if (window.MutationObserver){
      new MutationObserver(function(muts){
        muts.forEach(function(m){
          (m.addedNodes || []).forEach(function(node){
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches(CONTENT_SEL)){
              applyRich(node);
            } else {
              scan(node);
            }
          });
        });
      }).observe(document.body, { childList:true, subtree:true });
    }
  })();
  

  // Script #17
   //<![CDATA[
  (function(){
    if (!once('commentsFooter')) return;
    if (!document.querySelector('section#comments')) return;
    var ROOT_SEL = 'section#comments';
    var ADD_ID = 'top-continue';
    var COMP_ID = 'top-ce';
  
    function resetParentId(iframe){
      if (!iframe) return;
      var src = iframe.getAttribute('src') || '';
      var parts = src.split('#');
      var base = parts.shift() || '';
      var hash = parts.length ? '#' + parts.join('#') : '';
      base = base.replace(/([?&])parentID=\d+/, '$1').replace(/([?&])$/, '');
      iframe.src = base + hash;
    }
  
    function ensureFooter(){
      var root = document.querySelector(ROOT_SEL);
      var add = document.getElementById(ADD_ID);
      if (!root || !add) return null;
  
      var footer = root.querySelector('.gg-comments__footer');
      if (!footer){
        footer = document.createElement('footer');
        footer.className = 'gg-comments__footer';
        footer.dataset.ggOpen = '0';
        var innerNew = document.createElement('div');
        innerNew.className = 'gg-comments__footer-inner';
        footer.appendChild(innerNew);
  
        var host = root.closest('.gg-comments-panel__body') ||
                   root.closest('.gg-post__comments') ||
                   root;
        host.appendChild(footer);
      }
      if (!footer.dataset.ggOpen) footer.dataset.ggOpen = '0';
  
      var inner = footer.querySelector('.gg-comments__footer-inner');
      if (!inner){
        inner = document.createElement('div');
        inner.className = 'gg-comments__footer-inner';
        while (footer.firstChild) inner.appendChild(footer.firstChild);
        footer.appendChild(inner);
      }
  
      return { root: root, footer: footer, inner: inner };
    }
  
    function moveUi(){
      var ctx = ensureFooter();
      if (!ctx) return null;
  
      var add = document.getElementById(ADD_ID);
      if (add){
        add.classList.remove('hidden');
        add.style.display = '';
        ctx.inner.appendChild(add);
      }
  
      var composer = document.getElementById(COMP_ID);
      if (composer){
        ctx.inner.appendChild(composer);
      }
  
      return { root: ctx.root, footer: ctx.footer, inner: ctx.inner, add: add, composer: composer };
    }
  
    function ensureIframeHome(ctx){
      ctx = ctx || moveUi();
      if (!ctx) return;
      var iframe = document.getElementById('comment-editor');
      if (!iframe) return;
  
      var inReply = !!iframe.closest('.comment-replybox-single');
      if (inReply){
        ctx.footer.dataset.ggOpen = '0';
        return;
      }
  
      if (ctx.composer && !ctx.composer.contains(iframe)){
        ctx.composer.appendChild(iframe);
        resetParentId(iframe);
      }
    }
  
    function syncState(){
      var ctx = moveUi();
      if (!ctx) return;
      ensureIframeHome(ctx);
      if (ctx.footer.dataset.ggOpen !== '1'){
        ctx.footer.dataset.ggOpen = '0';
      }
    }
  
    function bindClicks(){
      document.addEventListener('click', function(e){
        var addBtn = e.target.closest('#' + ADD_ID + ' a.comment-reply');
        if (addBtn){
          var ctx = moveUi();
          if (ctx){
            ctx.footer.dataset.ggOpen = '1';
            setTimeout(function(){ ensureIframeHome(ctx); }, 50);
          }
          return;
        }
  
        var replyBtn = e.target.closest('a.comment-reply');
        if (replyBtn && !replyBtn.closest('#' + ADD_ID)){
          var ctx2 = moveUi();
          if (ctx2){
            ctx2.footer.dataset.ggOpen = '0';
            setTimeout(function(){ ensureIframeHome(ctx2); }, 50);
          }
        }
      }, true);
    }
  
    function observe(){
      var root = document.querySelector(ROOT_SEL);
      if (!root || !window.MutationObserver) return;
      new MutationObserver(function(){
        syncState();
      }).observe(root, { childList:true, subtree:true });
    }
  
    function init(){
      var ctx = moveUi();
      if (ctx){
        ctx.footer.dataset.ggOpen = '0';
      }
      syncState();
      bindClicks();
      observe();
    }
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  //]]>
  

  // Script #18
  
    //<![CDATA[
  (function(){
    if (!once('commentsDock')) return;
    var comments, header, footer, headSpacer, footerSpacer, scrollRoot;
    var topSentinel, bottomSentinel, io, replyObserver, rafId;
  
    function qs(root, sel){ return (root || document).querySelector(sel); }
  
    function isScrollable(el){
      if (!el) return false;
      var st = getComputedStyle(el);
      if (!st) return false;
      var y = st.overflowY || st.overflow;
      var x = st.overflowX || st.overflow;
      var hasOverflow = /(auto|scroll)/i.test(y) || /(auto|scroll)/i.test(x);
      return hasOverflow && el.scrollHeight > el.clientHeight;
    }
  
    function pickScrollRoot(){
      var body = comments && comments.closest('.gg-comments-panel__body');
      if (body && isScrollable(body)) return body;
  
      var contentEl = qs(comments, '.gg-comments__content');
      if (contentEl && isScrollable(contentEl)) return contentEl;
  
      return null;
    }
  
    function ensureSentinel(pos){
      var sel = '.gg-comments__sentinel--' + pos;
      var el = qs(comments, sel);
      if (el) return el;
      el = document.createElement('div');
      el.className = 'gg-comments__sentinel gg-comments__sentinel--' + pos;
      if (pos === 'top'){
        comments.insertBefore(el, comments.firstChild);
      } else {
        comments.appendChild(el);
      }
      return el;
    }
  
    function ensureSpacer(cls, beforeEl){
      var el = qs(comments, '.' + cls);
      if (!el){
        el = document.createElement('div');
        el.className = cls;
        el.setAttribute('aria-hidden', 'true');
        if (beforeEl && beforeEl.parentNode){
          beforeEl.parentNode.insertBefore(el, beforeEl);
        } else {
          comments.insertBefore(el, comments.firstChild);
        }
      }
      return el;
    }
  
    function getRootRect(root){
      if (!root || root === window){
        var w = window.innerWidth || document.documentElement.clientWidth || 0;
        var h = window.innerHeight || document.documentElement.clientHeight || 0;
        return { top: 0, bottom: h, left: 0, right: w };
      }
      var rect = root.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
    }
  
    function isCommentsInView(){
      if (!comments) return false;
      var rootRect = getRootRect(scrollRoot);
      var cRect = comments.getBoundingClientRect();
      return (cRect.bottom > rootRect.top) && (cRect.top < rootRect.bottom);
    }
  
    function measureContainer(){
      var container = comments.closest('.gg-comments-panel') || comments;
      return container.getBoundingClientRect();
    }
  
    function updateReplyState(){
      var iframe = qs(comments, 'iframe#comment-editor');
      var replying = !!(iframe && iframe.closest('.comment-replybox-single'));
      comments.classList.toggle('gg-comments--replying', replying);
      return replying;
    }
  
    function resetDock(){
      if (headSpacer) headSpacer.style.height = '0px';
      if (footerSpacer) footerSpacer.style.height = '0px';
      if (header){
        header.style.left = '';
        header.style.width = '';
        header.style.right = '';
        header.style.top = '';
        header.style.bottom = '';
      }
      if (footer){
        footer.style.left = '';
        footer.style.width = '';
        footer.style.right = '';
        footer.style.top = '';
        footer.style.bottom = '';
      }
      comments.style.removeProperty('--gg-dock-left');
      comments.style.removeProperty('--gg-dock-width');
      comments.dataset.docked = '0';
    }
  
    function updateDock(){
      var replying = updateReplyState();
      var post = comments.closest('.gg-blog-layout--post');
      var rootRect = getRootRect(scrollRoot);
      var postRect = post ? post.getBoundingClientRect() : null;
      var postInView = postRect
        ? (postRect.bottom > rootRect.top && postRect.top < rootRect.bottom)
        : true;
  
      var shouldDock = isCommentsInView() && postInView && !replying;
      comments.dataset.docked = shouldDock ? '1' : '0';
      comments.classList.toggle('gg-comments--docked', shouldDock);
  
      if (!header || !footer || !shouldDock){
        resetDock();
        return;
      }
  
      var rect = measureContainer();
      var left = rect.left + 'px';
      var width = rect.width + 'px';
  
      comments.style.setProperty('--gg-dock-left', left);
      comments.style.setProperty('--gg-dock-width', width);
  
      header.style.left = left;
      header.style.width = width;
      header.style.right = 'auto';
      if (headSpacer){
        headSpacer.style.height = header.offsetHeight + 'px';
      }
  
      footer.style.left = left;
      footer.style.width = width;
      footer.style.right = 'auto';
      if (footerSpacer){
        footerSpacer.style.height = footer.offsetHeight + 'px';
      }
    }
  
    function schedule(){
      if (rafId) return;
      rafId = requestAnimationFrame(function(){
        rafId = null;
        updateDock();
      });
    }
  
    function bind(){
      if (scrollRoot){
        scrollRoot.addEventListener('scroll', schedule, { passive:true });
      }
      window.addEventListener('scroll', schedule, { passive:true });
      window.addEventListener('resize', schedule);
  
      if (window.IntersectionObserver){
        var observerRoot = scrollRoot;
        if (observerRoot && topSentinel && !observerRoot.contains(topSentinel)){
          observerRoot = null;
        }
        io = new IntersectionObserver(function(){ schedule(); }, {
          root: observerRoot || null,
          threshold: [0, 0.1, 0.5, 1]
        });
        if (topSentinel) io.observe(topSentinel);
        if (bottomSentinel) io.observe(bottomSentinel);
      }
  
      if (window.MutationObserver){
        replyObserver = new MutationObserver(function(){
          schedule();
        });
        replyObserver.observe(comments, { childList:true, subtree:true });
      }
    }
  
    function init(){
      comments = document.querySelector('section#comments.gg-comments');
      var panelMode = document.querySelector('main.gg-main[data-gg-right-mode="comments"]') ||
        (comments && comments.closest('.gg-blog-sidebar--right'));
      if (panelMode) return; // in-panel: rely on 3-zone layout, skip viewport docking
      if (!comments) return;
  
      header = qs(comments, '.gg-comments__head');
      footer = qs(comments, '.gg-comments__footer');
      if (!header || !footer) return;
  
      headSpacer = ensureSpacer('gg-comments__head-spacer', header);
      footerSpacer = ensureSpacer('gg-comments__footer-spacer', footer);
  
      scrollRoot = pickScrollRoot();
      topSentinel = ensureSentinel('top');
      bottomSentinel = ensureSentinel('bottom');
  
      updateDock();
      bind();
    }
  
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }());
  //]]>
  

  // Script #19
  
  (function(){
    if (!once('commentIframeTheme')) return;
    if (!document.querySelector('iframe#comment-editor, iframe[name="comment-editor"], #top-continue')) return;
    const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial';
  
    function cssVar(name){
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
  
    function hexToRgb(hex){
      const h = hex.replace('#','').trim();
      if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  
      if (h.length === 3){
        const r = parseInt(h[0]+h[0], 16);
        const g = parseInt(h[1]+h[1], 16);
        const b = parseInt(h[2]+h[2], 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      if (h.length === 6){
        const r = parseInt(h.slice(0,2), 16);
        const g = parseInt(h.slice(2,4), 16);
        const b = parseInt(h.slice(4,6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return null;
    }
  
    function normalizeToRgb(value, fallback){
      if (!value) return fallback;
  
      // already rgb(...)
      if (/^rgb\(/i.test(value)) return value;
  
      // hex
      if (value.startsWith('#')){
        return hexToRgb(value) || fallback;
      }
  
      // rgba/gradient/var(...) -> fallback
      return fallback;
    }
  
    function buildPayload(){
      const ink = normalizeToRgb(cssVar('--gg-ink'), 'rgb(15, 23, 42)');
      const surface = normalizeToRgb(cssVar('--gg-surface'), 'rgb(255, 255, 255)');
      const muted = normalizeToRgb(cssVar('--gg-muted'), ink);
  
      return {
        color: ink,
        backgroundColor: surface,
        unvisitedLinkColor: muted, // atau ink kalau kamu mau link sama
        fontFamily: FONT
      };
    }
  
    function applyToIframe(){
      const iframe = document.querySelector('iframe#comment-editor, iframe[name="comment-editor"]');
      if (!iframe) return;
  
      const base = iframe.src.split('#')[0];
      const payload = buildPayload();
      const hash = encodeURIComponent(JSON.stringify(payload));
      const next = `${base}#${hash}`;
  
      if (iframe.src !== next) iframe.src = next;
    }
  
    // Run on load (sekali)
    window.addEventListener('load', () => setTimeout(applyToIframe, 0));
  
    // Run saat Add comment dibuka (sekali per klik)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#top-continue a.comment-reply')) {
        setTimeout(applyToIframe, 80);
      }
    }, true);
  
  })();
  

})();
