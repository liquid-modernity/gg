(function(w){
'use strict';
var GG=w.GG=w.GG||{};
GG.modules=GG.modules||{};
GG.services=GG.services||{};
GG.__uiBuckets=GG.__uiBuckets||{};
if(GG.__uiBuckets.authors)return;
GG.__uiBuckets.authors=true;

(function(GG,w,d){
'use strict';
function clean(v){ return String(v||'').replace(/\s+/g,' ').trim(); }
function slugify(raw){ return clean(raw).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function titleCase(raw){ var s=slugify(raw).replace(/-/g,' '); return s?s.replace(/\b[a-z]/g,function(m){ return m.toUpperCase(); }):''; }
function normHref(raw,slug){ var href=clean(raw); if(!href) return '/p/'+slug+'.html'; if(/^https?:\/\//i.test(href)||href.charAt(0)==='/') return href; return '/'+href.replace(/^\/+/,''); }
function initials(name){ var src=clean(name),m=src.match(/\b[^\W_]/g)||[],a=(m[0]||src.slice(0,1)||'').toUpperCase(),b=(m[1]||src.slice(1,2)||'').toUpperCase(); return (a+b)||'A'; }
function tagSlugify(raw){ return clean(raw).toLowerCase().replace(/^#/,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]+/g,'').replace(/^-+|-+$/g,''); }
function tagHref(key){ return key?('/p/tags.html?tag='+encodeURIComponent(key)):'#'; }
function escRe(raw){ return String(raw||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function extractJsonScript(html,id){
var src=String(html||''),safe='',re=null,m=null,raw='';
if(!src||!id) return '';
safe=escRe(id);
re=new RegExp('<script[^>]*\\bid=[\\"\\\']'+safe+'[\\"\\\'][^>]*\\btype=[\\"\\\']application\\/json[\\"\\\'][^>]*>([\\s\\S]*?)<\\/script>','i');
m=re.exec(src);
if(!m||!m[1]){
re=new RegExp('<script[^>]*\\btype=[\\"\\\']application\\/json[\\"\\\'][^>]*\\bid=[\\"\\\']'+safe+'[\\"\\\'][^>]*>([\\s\\S]*?)<\\/script>','i');
m=re.exec(src);
}
if(!m||!m[1]) return '';
raw=String(m[1]||'').trim();
return raw||'';
}
function parseJsonFromScript(html,id){
var raw=extractJsonScript(html,id);
if(!raw) return null;
try{ return JSON.parse(raw); }catch(_){}
try{
raw=raw.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
return JSON.parse(raw);
}catch(_){}
return null;
}

GG.services.authorsDir = GG.services.authorsDir || (function(){
var KEY_PREFIX='gg_authors_dir_v',ACTIVE_KEY='gg_authors_dir_active',LEGACY_KEY='gg_authors_dir_v1',URL='/p/author.html',cache=null,pending=null,warnedMissing=Object.create(null);
function asVersion(v){ var n=parseInt(v,10); return isFinite(n)&&n>0?n:1; }
function cacheKey(v){ return KEY_PREFIX+String(asVersion(v)); }
function isDevMode(){ return !!(GG&&GG.env&&GG.env.mode==='dev'); }
function warnMissingOnce(slug){ if(!isDevMode()||!slug||warnedMissing[slug]) return; warnedMissing[slug]=1; try{ if(w.console&&typeof w.console.warn==='function') w.console.warn('author slug not in directory',slug); }catch(_){} }
function normalizeCacheRecord(parsed,key){ var out={ v:1, map:{}, aliases:{} },v=1; if(!parsed||typeof parsed!=='object') return null; if(parsed.map&&typeof parsed.map==='object'){ v=asVersion(parsed.v); out.v=v; out.map=parsed.map; out.aliases=parsed.aliases&&typeof parsed.aliases==='object'&&!Array.isArray(parsed.aliases)?parsed.aliases:{}; return out; } if(Array.isArray(parsed)) return null; v=key&&/^gg_authors_dir_v(\d+)$/.test(key)?asVersion(RegExp.$1):1; out.v=v; if(parsed.authors&&typeof parsed.authors==='object'&&!Array.isArray(parsed.authors)){ out.map=parsed.authors; out.aliases=parsed.aliases&&typeof parsed.aliases==='object'&&!Array.isArray(parsed.aliases)?parsed.aliases:{}; if(Object.prototype.hasOwnProperty.call(parsed,'v')) out.v=asVersion(parsed.v); return out; } out.map=parsed; return out; }
function readCacheByKey(key){ try{ var raw=w.sessionStorage&&key?w.sessionStorage.getItem(key):'',parsed=null; if(!raw) return null; parsed=JSON.parse(raw); return normalizeCacheRecord(parsed,key); }catch(_){ return null; } }
function readCache(){ var active='',hit=null; try{ active=w.sessionStorage?clean(w.sessionStorage.getItem(ACTIVE_KEY)||''):''; }catch(_){ active=''; } if(active){ hit=readCacheByKey(active); if(hit) return hit; } hit=readCacheByKey(LEGACY_KEY); return hit||null; }
function writeCache(record){ var key=''; try{ if(!w.sessionStorage||!record) return; key=cacheKey(record.v); w.sessionStorage.setItem(key,JSON.stringify({ v:asVersion(record.v), map:(record.map&&typeof record.map==='object')?record.map:{}, aliases:(record.aliases&&typeof record.aliases==='object'&&!Array.isArray(record.aliases))?record.aliases:{} })); w.sessionStorage.setItem(ACTIVE_KEY,key); }catch(_){} }
function authorsDirUrl(){ var url=URL,sep='?'; if(url.indexOf('?')>-1) sep='&'; if(isDevMode()) url+=sep+'x='+Date.now(); return url; }
function addEntry(out,key,val){ var s=slugify(key),name='',href=''; if(!s) return; if(typeof val==='string'){ out[s]={ name:titleCase(s), href:normHref(val,s) }; return; } if(!val||typeof val!=='object') return; name=clean(val.name||val.title||''); href=normHref(val.href||val.url||'',s); out[s]={ name:name||titleCase(s), href:href }; }
function normalizePayload(payload){ var out={},src=payload,i=0,item=null,key=''; if(!payload) return out; if(typeof payload==='object'&&!Array.isArray(payload)){ if(payload.authors&&typeof payload.authors==='object') src=payload.authors; else if(Array.isArray(payload.items)) src=payload.items; } if(Array.isArray(src)){ for(i=0;i<src.length;i++){ item=src[i]; if(!item||typeof item!=='object') continue; addEntry(out,item.slug||item.id||item.key||item.name,item); } return out; } if(!src||typeof src!=='object') return out; for(key in src){ if(!Object.prototype.hasOwnProperty.call(src,key)) continue; if(key==='v'||key==='authors'||key==='items'||key==='aliases') continue; addEntry(out,key,src[key]); } return out; }
function normalizeAliases(payload,map){ var out={},src=null,key='',val=null,alias='',target=''; if(!payload||typeof payload!=='object'||Array.isArray(payload)) return out; src=payload.aliases; if(!src||typeof src!=='object'||Array.isArray(src)) return out; for(key in src){ if(!Object.prototype.hasOwnProperty.call(src,key)) continue; alias=slugify(key); if(!alias) continue; val=src[key]; if(typeof val==='string'){ target=slugify(val); if(target){ out[alias]=target; continue; } } if(val&&typeof val==='object'){ target=slugify(val.slug||val.key||val.id||val.author||''); if(target){ out[alias]=target; continue; } if(clean(val.href||val.url||val.name||val.title)){ addEntry(map,alias,val); out[alias]=alias; } } } return out; }
function parsePayload(payload){ var v=1,map={},aliases={}; if(payload&&typeof payload==='object'&&!Array.isArray(payload)&&Object.prototype.hasOwnProperty.call(payload,'v')) v=asVersion(payload.v); map=normalizePayload(payload); if(!map||typeof map!=='object') map={}; aliases=normalizeAliases(payload,map); if(!aliases||typeof aliases!=='object') aliases={}; return { v:v, map:map, aliases:aliases }; }
function parseHtml(html){ var payload=parseJsonFromScript(html,'gg-authors-dir'),href=''; if(!payload||typeof payload!=='object'||Array.isArray(payload)||!payload.authors||typeof payload.authors!=='object') return { v:1, map:{}, aliases:{} }; href=clean(payload.authors&&payload.authors.pakrpp&&payload.authors.pakrpp.href||''); if(!href) return { v:1, map:{}, aliases:{} }; return parsePayload(payload); }
function resolveOne(raw,map,aliases,strict){ var orig=slugify(raw),s=orig,target='',it=null,name='',href='',src='fallback'; if(!s) return { slug:'', name:'', href:'', src:'fallback' }; target=aliases&&aliases[s]?slugify(aliases[s]):''; if(target) s=target; it=s&&map?map[s]:null; if(!it&&strict) warnMissingOnce(orig); name=clean(it&&it.name?it.name:''); href=clean(it&&(it.href||it.url)?(it.href||it.url):''); if(href){ href=normHref(href,s); src='dir'; } else href='/p/'+s+'.html'; if(!name) name=titleCase(s)||'Author'; return { slug:s, name:name, href:href, src:src }; }
function loadAuthorsDir(){ var fallback=readCache(); if(cache&&cache.map) return Promise.resolve(cache.map); if(pending) return pending; if(!w.fetch){ cache=fallback||{ v:1, map:{}, aliases:{} }; return Promise.resolve(cache.map); } pending=w.fetch(authorsDirUrl(),{ method:'GET', cache:'no-store', credentials:'same-origin' }).then(function(res){ if(!res||!res.ok) throw new Error('authors-dir'); return res.text(); }).then(function(html){ cache=parseHtml(html); if(!cache||typeof cache!=='object') cache={ v:1, map:{}, aliases:{} }; if(!cache.map||typeof cache.map!=='object') cache.map={}; if(!cache.aliases||typeof cache.aliases!=='object'||Array.isArray(cache.aliases)) cache.aliases={}; cache.v=asVersion(cache.v); writeCache(cache); return cache.map; }).catch(function(){ cache=fallback||cache||{ v:1, map:{}, aliases:{} }; if(!cache.map||typeof cache.map!=='object') cache.map={}; if(!cache.aliases||typeof cache.aliases!=='object'||Array.isArray(cache.aliases)) cache.aliases={}; return cache.map; }).finally(function(){ pending=null; }); return pending; }
function resolveMany(raw){ var list=Array.isArray(raw)?raw:[raw],slugs=[],seen={},i=0,s='',aliases={}; for(i=0;i<list.length;i++){ s=slugify(list[i]); if(!s||seen[s]) continue; seen[s]=1; slugs.push(s); } if(!slugs.length) return Promise.resolve([]); return loadAuthorsDir().then(function(map){ aliases=cache&&cache.aliases&&typeof cache.aliases==='object'&&!Array.isArray(cache.aliases)?cache.aliases:{}; return slugs.map(function(it){ return resolveOne(it,map,aliases,true); }); }).catch(function(){ return slugs.map(function(it){ return resolveOne(it,{},null,false); }); }); }
function resolve(raw){ return resolveMany([raw]).then(function(rows){ return rows[0]||resolveOne(raw,{},null,false); }); }
return { keyPrefix:KEY_PREFIX, key:LEGACY_KEY, activeKey:ACTIVE_KEY, url:URL, slugify:slugify, titleCase:titleCase, fallback:function(raw){ return resolveOne(raw,{},null,false); }, load:loadAuthorsDir, loadAuthorsDir:loadAuthorsDir, resolveMany:resolveMany, resolve:resolve };
})();

GG.services.tagsDir = GG.services.tagsDir || (function(){
var KEY='gg_tags_dir_v1',URL='/p/tags.html',cache=null,pending=null;
function keyOf(raw){ var x=raw&&typeof raw==='object'?raw:{}; return tagSlugify(x.key||x.slug||x.text||x.name||raw); }
function resolveOne(raw,map){ var x=raw&&typeof raw==='object'?raw:{},k=keyOf(raw),it=k&&map?map[k]:null,name=''; if(!k) return { key:'', text:'', href:'#' }; name=clean(it&&it.name?it.name:'')||clean(x.text||x.name||raw)||titleCase(k)||k; return { key:k, text:name, href:tagHref(k) }; }
function readCache(){ try{ var raw=w.sessionStorage&&w.sessionStorage.getItem(KEY),parsed=null; if(!raw) return null; parsed=JSON.parse(raw); return parsed&&typeof parsed==='object'?parsed:null; }catch(_){ return null; } }
function writeCache(map){ try{ if(w.sessionStorage) w.sessionStorage.setItem(KEY,JSON.stringify(map||{})); }catch(_){} }
function addEntry(out,key,val){ var k=tagSlugify(key),name=''; if(!k) return; if(typeof val==='string'){ out[k]={ name:clean(val)||titleCase(k) }; return; } if(!val||typeof val!=='object') return; name=clean(val.name||val.title||val.text||''); out[k]={ name:name||titleCase(k) }; }
function normalizePayload(payload){ var out={},i=0,item=null,key=''; if(!payload) return out; if(Array.isArray(payload)){ for(i=0;i<payload.length;i++){ item=payload[i]; if(!item||typeof item!=='object') continue; addEntry(out,item.key||item.slug||item.id||item.name,item); } return out; } if(typeof payload!=='object') return out; if(payload.tags&&typeof payload.tags==='object'&&!Array.isArray(payload.tags)) return normalizePayload(payload.tags); if(Array.isArray(payload.tags)) return normalizePayload(payload.tags); if(Array.isArray(payload.items)) return normalizePayload(payload.items); for(key in payload){ if(!Object.prototype.hasOwnProperty.call(payload,key)) continue; if(key==='v'||key==='tags'||key==='items') continue; addEntry(out,key,payload[key]); } return out; }
function parseHtml(html){ var payload=parseJsonFromScript(html,'gg-tags-dir'); if(!payload||typeof payload!=='object') return {}; return normalizePayload(payload); }
function load(){ if(cache) return Promise.resolve(cache); cache=readCache(); if(cache) return Promise.resolve(cache); if(pending) return pending; if(!w.fetch){ cache={}; return Promise.resolve(cache); } pending=w.fetch(URL,{ method:'GET', cache:'no-store', credentials:'same-origin' }).then(function(res){ if(!res||!res.ok) throw new Error('tags-dir'); return res.text(); }).then(function(html){ cache=parseHtml(html); if(!cache||typeof cache!=='object') cache={}; writeCache(cache); return cache; }).catch(function(){ cache=cache||{}; return cache; }).finally(function(){ pending=null; }); return pending; }
function resolveMany(raw){ var list=Array.isArray(raw)?raw:[raw],uniq=[],seen={},i=0,k=''; for(i=0;i<list.length;i++){ k=keyOf(list[i]); if(!k||seen[k]) continue; seen[k]=1; uniq.push(list[i]); } if(!uniq.length) return Promise.resolve([]); return load().then(function(map){ return uniq.map(function(it){ return resolveOne(it,map); }); }).catch(function(){ return uniq.map(function(it){ return resolveOne(it,{}); }); }); }
function resolve(raw){ return resolveMany([raw]).then(function(rows){ return rows[0]||resolveOne(raw,{}); }); }
return { key:KEY, url:URL, slugify:tagSlugify, fallback:function(raw){ return resolveOne(raw,{}); }, load:load, resolveMany:resolveMany, resolve:resolve };
})();

GG.modules.postInfoAuthors = GG.modules.postInfoAuthors || {};
function qs(sel, root){ return (root||d).querySelector(sel); }
function splitSlugs(raw){ var src=clean(raw),parts=[],out=[],seen={},i=0,s=''; if(!src) return out; parts=src.split(/\s*;\s*/); for(i=0;i<parts.length;i++){ s=slugify(parts[i]); if(!s||seen[s]) continue; seen[s]=1; out.push(s); } return out; }
function renderPeople(slot,rows,role){
var list=rows||[],i=0,row=null,name='',href='',a=null,av=null,meta=null,pn=null,pr=null;
if(!slot) return;
slot.textContent='';
for(i=0;i<list.length;i++){
row=list[i]||{};
name=clean(row.name||'');
href=clean(row.href||'#');
if(!name) continue;
a=d.createElement('a'); a.className='gg-pi__person'; a.href=href||'#'; a.setAttribute('data-src',clean(row.src||'fallback')||'fallback');
av=d.createElement('span'); av.className='gg-pi__avatar'; av.setAttribute('aria-hidden','true'); av.textContent=initials(name);
meta=d.createElement('span'); meta.className='gg-pi__pmeta';
pn=d.createElement('span'); pn.className='gg-pi__pname'; pn.textContent=name;
pr=d.createElement('span'); pr.className='gg-pi__prole'; pr.textContent=role||'Contributor';
meta.appendChild(pn); meta.appendChild(pr); a.appendChild(av); a.appendChild(meta); slot.appendChild(a);
}
}
GG.modules.postInfoAuthors.init = function(root){
var scope=root&&root.querySelector?root:d,info=qs('#gg-postinfo',scope),article=null,metaNode=null;
var authorSlug='',contributors=[],authorSlot=null,contribSlot=null,contribSec=null,list=[],i=0,token=0,fb=[],svc=GG.services&&GG.services.authorsDir?GG.services.authorsDir:null;
if(!info||!svc) return;
article=qs('.gg-post[data-gg-module="post-detail"]',scope)||qs('.gg-post',scope);
metaNode=qs('.gg-postmeta',article||scope)||qs('.gg-postmeta',scope);
authorSlug=svc.slugify((metaNode&&metaNode.getAttribute('data-author'))||(article&&article.getAttribute('data-author'))||'');
contributors=splitSlugs((metaNode&&metaNode.getAttribute('data-contributors'))||'').filter(function(slug){ return slug&&slug!==authorSlug; });
authorSlot=qs('[data-slot="author"]',info);
contribSlot=qs('[data-slot="contributors"]',info);
contribSec=qs('.gg-pi__sec--contributors',info);
if(authorSlug) list.push(authorSlug);
for(i=0;i<contributors.length;i++) list.push(contributors[i]);
if(authorSlot) renderPeople(authorSlot,authorSlug?[svc.fallback(authorSlug)]:[],'Author');
if(contribSlot){ fb=contributors.map(function(slug){ return svc.fallback(slug); }); renderPeople(contribSlot,fb,'Contributor'); }
if(contribSec) contribSec.hidden=contributors.length===0;
if(!list.length) return;
token=(info.__ggAuthorsToken||0)+1;
info.__ggAuthorsToken=token;
svc.resolveMany(list).then(function(rows){
var out=Array.isArray(rows)?rows:[],authorRows=[],contribRows=[],idx=0;
if(!info||info.__ggAuthorsToken!==token) return;
if(authorSlug&&out[0]) authorRows=[out[0]];
for(idx=authorSlug?1:0;idx<out.length;idx++) contribRows.push(out[idx]);
if(authorSlot) renderPeople(authorSlot,authorRows,'Author');
if(contribSlot) renderPeople(contribSlot,contribRows,'Contributor');
if(contribSec) contribSec.hidden=contribRows.length===0;
}).catch(function(){});
};

GG.modules.postInfoTags = GG.modules.postInfoTags || {};
function parseTags(raw){ var src=clean(raw),parts=[],out=[],seen={},i=0,key='',text=''; if(!src) return out; parts=src.split(/\s*,\s*/); for(i=0;i<parts.length;i++){ text=clean(parts[i]); key=tagSlugify(text); if(!key||seen[key]) continue; seen[key]=1; out.push({ key:key, text:text||key, href:tagHref(key) }); } return out; }
function renderTags(slot,rows){ var list=rows||[],i=0,row=null,name='',href='',a=null; if(!slot) return; slot.textContent=''; for(i=0;i<list.length;i++){ row=list[i]||{}; name=clean(row.text||row.name||''); href=clean(row.href||''); if(!name) continue; a=d.createElement('a'); a.className='gg-pi__chip'; a.href=href||'#'; a.textContent=name; slot.appendChild(a); } }
GG.modules.postInfoTags.init = function(root){
var scope=root&&root.querySelector?root:d,info=qs('#gg-postinfo',scope),article=null,metaNode=null,slot=null,sec=null,svc=GG.services&&GG.services.tagsDir?GG.services.tagsDir:null;
var tags=[],raw='',m=[],i=0,token=0;
if(!info) return;
article=qs('.gg-post[data-gg-module="post-detail"]',scope)||qs('.gg-post',scope);
metaNode=qs('.gg-postmeta',article||scope)||qs('.gg-postmeta',scope);
slot=qs('[data-slot="tags"]',info);
sec=qs('.gg-pi__sec--tags',info);
if(!slot) return;
tags=parseTags((metaNode&&metaNode.getAttribute('data-tags'))||'');
if(!tags.length&&article){ raw=clean((qs('.gg-post-tags',article)||{}).textContent||''); m=raw.match(/#[^#\s]+/g)||[]; if(m.length){ raw=''; for(i=0;i<m.length;i++) raw+=(raw?',':'')+m[i].replace(/^#/,''); tags=parseTags(raw); } }
if(sec) sec.hidden=!tags.length;
if(!tags.length){ renderTags(slot,[]); return; }
renderTags(slot,tags);
if(!svc||typeof svc.resolveMany!=='function') return;
token=(info.__ggTagsToken||0)+1;
info.__ggTagsToken=token;
svc.resolveMany(tags).then(function(rows){ if(!info||info.__ggTagsToken!==token) return; renderTags(slot,Array.isArray(rows)?rows:[]); }).catch(function(){});
};
})(window.GG=window.GG||{},window,document);
})(window);
