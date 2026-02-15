(function(w,d){'use strict';
  var GG=w.GG=w.GG||{},M=GG.modules=GG.modules||{};
  if(M.searchCmd)return;
  M.searchCmd=(function(){
    var S={items:[],a:-1,initd:0};
    function qsa(sel,root){return Array.prototype.slice.call((root||d).querySelectorAll(sel));}
    function ui(){
      var input=d.querySelector('nav.gg-dock input[type="search"],nav.gg-dock [data-gg-dock-search-input]');
      var panel=d.getElementById('gg-search-panel');
      if(!input||!panel)return null;
      return {input:input,panel:panel};
    }
    function isCmd(v){return String(v||'').trim().charAt(0)==='>';}
    function norm(v){v=String(v||'').trim();return v.charAt(0)==='>'?v.slice(1).trim().toLowerCase():'';}
    function toast(msg){
      if(GG.ui&&GG.ui.toast&&typeof GG.ui.toast.show==='function'){GG.ui.toast.show(msg);return;}
      if(GG.services&&GG.services.a11y&&typeof GG.services.a11y.announce==='function')GG.services.a11y.announce(msg,{politeness:'polite'});
    }
    function closePanel(){if(M.search&&typeof M.search.close==='function')M.search.close();}
    function fail(a,e){
      var sr=M.searchRank;
      if(sr&&typeof sr.e==='function'){sr.e(w,d,null,'m'+a,'',e);return;}
      try{var q=w.__gg_err=w.__gg_err||[];q.push({t:Date.now(),where:'palette',action:'m'+a,msg:String(e&&e.message||e)});if(q.length>20)q.splice(0,q.length-20);}catch(_){}
      try{closePanel();}catch(_){}
    }
    function nav(url){
      if(!url)return;
      try{
        var u=new URL(url,w.location.href),h=u.origin===w.location.origin?(u.pathname+u.search+u.hash):u.toString();
        if(u.origin===w.location.origin&&u.pathname.indexOf('/search')!==0&&GG.core&&GG.core.router&&typeof GG.core.router.navigate==='function')GG.core.router.navigate(h);
        else w.location.assign(h);
      }catch(_){w.location.assign(url);}
    }
    function cmdList(raw){
      var u=ui(),q=norm(raw),all=[{
        id:'home',title:'home',hint:'/',
        run:function(){closePanel();nav('/');}
      },{
        id:'blog',title:'blog',hint:'/blog',
        run:function(){closePanel();nav('/blog');}
      },{
        id:'offline',title:'offline',hint:'/offline.html',
        run:function(){closePanel();nav('/offline.html');}
      },{
        id:'full',title:'full search',hint:'back to search results',
        run:function(){if(!u)return;u.input.value=(u.input.value||'').replace(/^\s*>\s*/,'');u.input.dispatchEvent(new Event('input',{bubbles:true}));u.input.focus({preventScroll:true});}
      },{
        id:'reload',title:'reload shell',hint:'reload current page',
        run:function(){closePanel();w.location.reload();}
      },{
        id:'clear',title:'clear recents',hint:'remove gg_recents',
        run:function(){try{w.localStorage.removeItem('gg_recents');}catch(_){}toast('Recents cleared');}
      },{
        id:'copy',title:'copy link',hint:'copy canonical/location',
        run:function(){
          var can=d.querySelector('link[rel="canonical"]'),txt=(can&&can.href)||w.location.href;
          var done=function(){toast('Link copied');};
          if(w.navigator&&navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done).catch(function(){});return;}
          var ta=d.createElement('textarea');
          ta.value=txt;
          ta.setAttribute('readonly','');
          ta.style.position='fixed';
          ta.style.opacity='0';
          (d.body||d.documentElement).appendChild(ta);
          ta.select();
          try{d.execCommand&&d.execCommand('copy');done();}catch(_){}
          if(ta.parentNode)ta.parentNode.removeChild(ta);
        }
      }];
      if(!q)return all;
      return all.filter(function(c){return c.title.indexOf(q)>-1||c.id.indexOf(q)>-1||c.hint.indexOf(q)>-1;});
    }
    function pick(i){
      var u=ui();if(!u)return;
      var n=qsa('.gg-search-cmd',u.panel);
      if(!n.length){S.a=-1;return;}
      if(i<0)i=0;if(i>=n.length)i=n.length-1;
      if(S.a>-1&&n[S.a])n[S.a].removeAttribute('aria-selected');
      S.a=i;
      n[i].setAttribute('aria-selected','true');
      u.input.setAttribute('aria-activedescendant',n[i].id||'');
    }
    function move(dir){
      if(!S.items.length)return;
      var i=S.a<0?(dir>0?0:S.items.length-1):(S.a+dir);
      if(i<0)i=S.items.length-1;
      if(i>=S.items.length)i=0;
      pick(i);
    }
    function run(i){
      var it=(i!=null&&i>=0&&S.items&&S.items[i])?S.items[i]:null;
      if(!it||typeof it.run!=='function')return;
      it.run();
    }
    function render(){
      try{
        var u=ui();if(!u)return;
        if(!isCmd(u.input.value))return;
        S.items=cmdList(u.input.value);
        var html='<div class="gg-search__section">Commands</div>';
        if(!S.items.length)html+='<div class="gg-search__hint">No command</div>';
        for(var i=0;i<S.items.length;i++)html+='<a href="#" class="gg-search__result gg-search-item gg-search-cmd" id="c'+i+'" role="option" data-cmd="'+S.items[i].id+'"><span class="gg-search__title">'+S.items[i].title+'</span><span class="gg-search__meta">'+S.items[i].hint+'</span></a>';
        html+='<div class="gg-search__hint">Enter run · Esc close</div>';
        u.panel.innerHTML=html;
        S.a=-1;
        if(S.items.length)pick(0);
      }catch(e){fail('r',e);}
    }
    function ensureOpen(){try{w.dispatchEvent(new CustomEvent('gg:search-open',{detail:{source:'cmd'}}));}catch(_){}}
    function onInput(e){
      try{
        var u=ui(),t=e&&e.target;
        if(!u||t!==u.input)return;
        if(!isCmd(u.input.value))return;
        ensureOpen();
        render();
        w.setTimeout(render,120);
      }catch(x){fail('i',x);}
    }
    function onKey(e){
      try{
        var u=ui();
        if(!u||e.target!==u.input||!isCmd(u.input.value))return;
        var k=e.key||'';
        if(k==='ArrowDown'||k==='ArrowUp'||k==='Enter'||k==='Escape'){
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation&&e.stopImmediatePropagation();
        }
        if(k==='ArrowDown')move(1);
        else if(k==='ArrowUp')move(-1);
        else if(k==='Enter')run(S.a<0?0:S.a);
        else if(k==='Escape')closePanel();
      }catch(x){fail('k',x);}
    }
    function onClick(e){
      try{
        var a=e.target&&e.target.closest?e.target.closest('a.gg-search-cmd'):null;
        if(!a)return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation&&e.stopImmediatePropagation();
        var n=parseInt((a.id||'').replace('c',''),10);
        run(isNaN(n)?-1:n);
      }catch(x){fail('c',x);}
    }
    function init(){
      if(S.initd)return;
      S.initd=1;
      d.addEventListener('input',onInput,true);
      d.addEventListener('keydown',onKey,true);
      d.addEventListener('click',onClick,true);
    }
    return {init:init,render:render};
  })();
  if(GG.boot&&GG.boot.onReady)GG.boot.onReady(function(){if(M.searchCmd&&M.searchCmd.init)M.searchCmd.init();});
})(window,document);
