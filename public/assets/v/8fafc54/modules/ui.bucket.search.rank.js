(function(w){'use strict';
var GG=w.GG=w.GG||{},M=GG.modules=GG.modules||{};
if(M.searchRank&&typeof M.searchRank.run==='function')return;
var SW={the:1,and:1,for:1,with:1,from:1,into:1,yang:1,dan:1,untuk:1,atau:1,dengan:1,dari:1,ini:1,itu:1,di:1,ke:1,of:1,to:1,a:1};
var NOW=(function(d){return d.getFullYear()*12+d.getMonth()+1;})(new Date());
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
function run(items,query,limit){
var n=toks(query),q=n.q,tk=n.t,out=[],i,k,it,t,s,l,u,tw,lw,sc,z,r,ft=tk[0]||q;
if(!q||!items||!items.length)return [];
for(i=0;i<items.length;i++){
it=items[i]||{};t=it.t||'';if(!t)continue;
s=it.s||'';l=(it.labels||'').toLowerCase();u=(it.url||'').toLowerCase();sc=0;
if((q&&t.indexOf(q)===0)||(ft&&t.indexOf(ft)===0))sc+=100;
tw=it._tw||(it._tw=(' '+t.replace(/[^a-z0-9]+/g,' ')+' '));
lw=it._lw||(it._lw=(','+l.replace(/\s*,\s*/g,',')+','));
for(k=0;k<tk.length;k++){
z=tk[k];if(!z)continue;
if(tw.indexOf(' '+z+' ')>-1)sc+=60;else if(t.indexOf(z)>-1)sc+=25;
if(lw!==',,'){if(lw.indexOf(','+z+',')>-1)sc+=50;else if(lw.indexOf(z)>-1)sc+=15;}
if(s&&s.indexOf(z)>-1)sc+=10;
if(u&&u.indexOf(z)>-1)sc+=8;
}
r=rec(u);sc+=r;
if(sc>0)out.push({i:it,s:sc,r:r,tl:t.length,u:u,n:i});
}
out.sort(function(a,b){return b.s-a.s||b.r-a.r||a.tl-b.tl||(a.u<b.u?-1:a.u>b.u?1:0)||a.n-b.n;});
limit=(typeof limit==='number'&&limit>0)?limit:10;
for(i=0;i<out.length&&i<limit;i++)out[i]=out[i].i;
out.length=Math.min(out.length,limit);
return out;
}
M.searchRank={run:run,toks:toks};
})(window);
