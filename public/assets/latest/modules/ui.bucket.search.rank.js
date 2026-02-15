(function(w){'use strict';
var GG=w.GG=w.GG||{},M=GG.modules=GG.modules||{};
if(M.searchRank&&typeof M.searchRank.run==='function')return;
var SW={the:1,and:1,for:1,with:1,from:1,into:1,yang:1,dan:1,untuk:1,atau:1,dengan:1,dari:1,ini:1,itu:1,di:1,ke:1,of:1,to:1,a:1};
var NOW=(function(d){return d.getFullYear()*12+d.getMonth()+1;})(new Date());
var LAST={f:'',r:'',x:1,s:0,h:''};
var CMD={home:1,blog:1,offline:1,full:1,reload:1,clear:1,copy:1};
var NH={blog:1,vlog:1};
function hint(f,items){
if(!f||NH[f])return '';
if(CMD[f])return 'Try: > '+f;
if(f.length<2)return '';
var p=f.slice(0,2),i,l,a,j,z;
for(i=0;i<items.length;i++){
l=(items[i]&&items[i].labels||'').toLowerCase();
if(!l)continue;
a=l.split(',');
for(j=0;j<a.length;j++){
z=(a[j]||'').trim();
if(z&&z!==f&&z.indexOf(p)===0)return 'Did you mean: /'+z;
}
}
return '';
}
function setLast(f,r,x,s,h){LAST.f=f||'';LAST.r=r||'';LAST.x=!!x;LAST.s=!!s;LAST.h=h||'';}
function parse(q){
q=String(q||'').trim();
if(!q)return {f:'',r:'',s:0};
if(q.charAt(0)!=='/')return {f:'',r:q,s:0};
q=q.slice(1).trim();
if(!q)return {f:'',r:'',s:1};
var i=q.indexOf(' ');
if(i<0)return {f:q.toLowerCase(),r:'',s:1};
return {f:q.slice(0,i).toLowerCase(),r:q.slice(i+1).trim(),s:1};
}
function toks(q){
q=String(q||'').toLowerCase().trim();
if(!q)return {q:'',t:[]};
q=q.replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
var p=q.split(' '),t=[],i,z;
for(i=0;i<p.length;i++){z=p[i];if(!z||z.length<2||SW[z])continue;t.push(z);}
if(!t.length&&q.length>1&&!SW[q])t=[q];
return {q:q,t:t};
}
function rec(url){
if(!url)return 0;
var m=String(url).match(/\/(20\d{2})\/(0[1-9]|1[0-2])\//);
if(!m)return 0;
var ym=(+m[1])*12+(+m[2]),d=NOW-ym,r=10-Math.floor((d<0?0:d)/6);
if(r<0)return 0;
return r>10?10:r;
}
function h(el,text,q,d){
if(!el)return;
text=String(text||'');
q=String(q||'');
if(!q||q.length<2){el.textContent=text;return;}
var i=text.toLowerCase().indexOf(q);
if(i<0){el.textContent=text;return;}
el.textContent='';
if(i>0)el.appendChild(d.createTextNode(text.slice(0,i)));
var m=d.createElement('span');
m.className='hl';
m.textContent=text.slice(i,i+q.length);
el.appendChild(m);
if(i+q.length<text.length)el.appendChild(d.createTextNode(text.slice(i+q.length)));
}
function resetDockUI(w,d,S,r){
try{if(w.GG&&w.GG.ui&&w.GG.ui.dock&&typeof w.GG.ui.dock.closeSearch==='function')w.GG.ui.dock.closeSearch();}catch(_){}
var u=S&&S.u,p,n,i,k,b;
if(!u){k=d.querySelector('[data-gg-dock-search],#gg-dock .gg-dock__search');u={dock:k,input:k&&k.querySelector('input[type="search"]'),close:k&&k.querySelector('[data-gg-dock-close]'),panel:d.getElementById('gg-search-panel')};if(S)S.u=u;}
p=d.getElementById('gg-cmdp');
if(p&&p.parentNode)p.parentNode.removeChild(p);
p=u&&u.panel;
if(p){p.hidden=true;p.setAttribute('aria-hidden','true');n=p.querySelectorAll('[aria-selected="true"],[data-active],[data-selected]');for(i=0;i<n.length;i++){n[i].removeAttribute('aria-selected');n[i].removeAttribute('data-active');n[i].removeAttribute('data-selected');}}
if(u&&u.input){u.input.removeAttribute('aria-activedescendant');u.input.removeAttribute('aria-expanded');}
if(u&&u.close)u.close.setAttribute('aria-expanded','false');
if(u&&u.dock){n=u.dock.querySelectorAll('[aria-expanded="true"]');for(i=0;i<n.length;i++)n[i].setAttribute('aria-expanded','false');}
if(S){S.o=0;S.a=-1;}
k=d.querySelector('nav.gg-dock');
if(k)k.removeAttribute('data-gg-state');
b=u&&u.input;
if(b&&b.focus){try{b.focus({preventScroll:true});}catch(_){try{b.focus();}catch(__){}}}
else if(d&&d.body){if(!d.body.hasAttribute('tabindex'))d.body.setAttribute('tabindex','-1');try{d.body.focus({preventScroll:true});}catch(_){try{d.body.focus();}catch(__){}}}
}
function onError(w,d,S,x,a,q){
var lg;
try{
lg=w.__gg_err=w.__gg_err||[];
lg.push({t:Date.now(),where:'palette',action:String(a||''),msg:String(x&&x.message||x)});
if(lg.length>20)lg.splice(0,lg.length-20);
}catch(_){}
w.__gg_recovering_until=Date.now()+500;
resetDockUI(w,d,S,'error:'+String(a||''));
if((a==='f'||a==='F')&&q){
var v=parse(q),n=v&&v.s?(v.r||v.f||''):q;
if(n)w.location.assign('/search?q='+encodeURIComponent(n));
}
}
function e(w,d,S,a,q,x){onError(w,d,S,x,a,q);}
function run(items,query,limit){
var p=parse(query),f=p.f,q=f?p.r:query,n=toks(q),qq=n.q,tk=n.t,out=[],i,k,it,t,s,l,u,tw,lw,sc,base,z,r,ft=tk[0]||qq,work=items,tmp=[],ok=1,h='';
if(!items||!items.length){setLast(f,q,1,p.s,'');return [];}
if(f){
ok=0;
for(i=0;i<items.length;i++){
it=items[i]||{};
l=(it.labels||'').toLowerCase();
lw=it._lw||(it._lw=(','+l.replace(/\s*,\s*/g,',')+','));
if(lw.indexOf(','+f+',')>-1){ok=1;tmp.push(it);}
}
work=tmp;
}
if(f&&!ok)h=hint(f,items);
setLast(f,q,ok,p.s,h);
if(p.s&&!f)return [];
if(!work.length)return [];
if(f&&!qq){
for(i=0;i<work.length;i++){
it=work[i]||{};
t=it.t||'';
if(!t)continue;
u=(it.url||'').toLowerCase();
r=rec(u);
out.push({i:it,r:r,tl:t.length,u:u,n:i});
}
out.sort(function(a,b){return b.r-a.r||a.tl-b.tl||(a.u<b.u?-1:a.u>b.u?1:0)||a.n-b.n;});
limit=(typeof limit==='number'&&limit>0)?limit:10;
for(i=0;i<out.length&&i<limit;i++)out[i]=out[i].i;
out.length=Math.min(out.length,limit);
return out;
}
if(!qq)return [];
for(i=0;i<work.length;i++){
it=work[i]||{};t=it.t||'';if(!t)continue;
s=it.s||'';l=(it.labels||'').toLowerCase();u=(it.url||'').toLowerCase();sc=0;base=0;
if((qq&&t.indexOf(qq)===0)||(ft&&t.indexOf(ft)===0))base+=100;
tw=it._tw||(it._tw=(' '+t.replace(/[^a-z0-9]+/g,' ')+' '));
lw=it._lw||(it._lw=(','+l.replace(/\s*,\s*/g,',')+','));
for(k=0;k<tk.length;k++){
z=tk[k];if(!z)continue;
if(tw.indexOf(' '+z+' ')>-1)base+=60;else if(t.indexOf(z)>-1)base+=25;
if(lw!==',,'){if(lw.indexOf(','+z+',')>-1)base+=50;else if(lw.indexOf(z)>-1)base+=15;}
if(s&&s.indexOf(z)>-1)base+=10;
if(u&&u.indexOf(z)>-1)base+=8;
}
r=rec(u);sc=base+r;
if(base>0&&sc>=10)out.push({i:it,s:sc,r:r,tl:t.length,u:u,n:i});
}
out.sort(function(a,b){return b.s-a.s||b.r-a.r||a.tl-b.tl||(a.u<b.u?-1:a.u>b.u?1:0)||a.n-b.n;});
limit=(typeof limit==='number'&&limit>0)?limit:10;
for(i=0;i<out.length&&i<limit;i++)out[i]=out[i].i;
out.length=Math.min(out.length,limit);
return out;
}
M.searchRank={run:run,toks:toks,parse:parse,last:LAST,h:h,e:e};
})(window);
