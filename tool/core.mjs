import {parseSearchIntent} from './intent.mjs';
export const GROUPS = ['女装','男装','小童','大童'];
export const SEASONS = ['27SS','27AW'];
export const TYPES = ['品牌采用信号','趋势预测','消费需求数据'];
export const PUBLIC_SEARCH = ['Edikted','LIONESS','Dairy Boy','Kith'];
export function searchKeywords(query){return parseSearchIntent(query).primary;}
export async function publicSearch(brand,query,group,fetcher=fetch){
 if(!PUBLIC_SEARCH.includes(brand.name))return [];
 const terms=searchKeywords(query);const scoped=brand.name==='Kith'?({女装:'women ',男装:'',小童:'kids ',大童:'kids '}[group]||'')+terms:terms;
 const u=new URL('/search/suggest.json',brand.url);u.searchParams.set('q',scoped);u.searchParams.set('resources[type]','product');u.searchParams.set('resources[limit]','4');
 const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});if(!r.ok)throw new Error('公开搜索接口返回 '+r.status);
 const data=await r.json();return (data.resources?.results?.products||[]).slice(0,4).map(p=>{
  const productUrl=new URL(safeUrl(new URL(p.url,brand.url).href,true));productUrl.search='';
  if(productUrl.hostname!==new URL(brand.url).hostname)throw new Error('商品来源与品牌不一致');
  let image=typeof p.image==='object'?p.image?.url:p.image;try{image=safeUrl(new URL(image,brand.url).href)}catch{image=''}
  return {title:textOnly(p.title),url:productUrl.href,image,brand:brand.name,material:'',originalSeason:'未知',searchTerms:scoped,isProduct:true};
 });
}
export const BRANDS = [
['ZARA','https://www.zara.cn/cn/',['女装','男装','小童','大童']],
['Reformation','https://www.thereformation.com/',['女装']],
['MANGO','https://shop.mango.com/hk/en/h/women',['女装','男装','小童','大童']],
['Aritzia','https://www.aritzia.com/intl/en',['女装']],
['Pull&Bear','https://www.pullandbear.com/gb/',['女装','男装']],
['Stradivarius','https://www.stradivarius.com/us/',['女装']],
['Bershka','https://www.bershka.com/es/h-woman.html',['女装','男装']],
['Edikted','https://edikted.co.uk/',['女装']],
['Free People','https://www.freepeople.com/',['女装']],
['Princess Polly','https://us.princesspolly.com/',['女装']],
['SKIMS','https://skims.com/en-cn',['女装','男装']],
['Alo Yoga','https://www.aloyoga.com/',['女装','男装']],
['Dairy Boy','https://dairyboy.com/',['女装']],
['Pacsun','https://www.pacsun.com/',['女装','男装']],
['Urban Outfitters','https://www.urbanoutfitters.com/',['女装','男装']],
['H&M','https://www.hm.com.cn/',['女装','男装','小童','大童']],
['Kith','https://kith.com/',['女装','男装','小童','大童']],
['KOOKAI','https://www.kookai.us/',['女装']],
['Glassons','https://www.glassons.com/',['女装']],
['Weekday','https://www.weekday.com/en-ww/',['女装','男装']],
['Hollister','https://www.hollisterco.com/shop/wd',['女装','男装']],
['Garage','https://www.garageclothing.com/us/',['女装']],
['Gina Tricot','https://www.ginatricot.com/eu',['女装','大童']],
['New Look','https://www.newlook.com/uk/',['女装','男装','大童']],
['Christopher Esber','https://christopheresber.com.au/',['女装']],
['Massimo Dutti','https://www.massimodutti.com/sg/',['女装','男装']],
['LIONESS','https://lionessfashion.com/collections/hotel-de-lioness',['女装']]
].map(([name,url,groups])=>({name,url,groups,coverage:'待核实地区与品类'}));
const TREND_HOSTS=['vogue.com','voguebusiness.com','wgsn.com','wgsnchina.cn','pop-fashion.com','fashionunited.com','businessoffashion.com','lyst.com','pinterest.com','xiaohongshu.com','taobao.com'];
export function safeUrl(input, allowedOnly=false, brands=BRANDS) {
 let u;try{u=new URL(input)}catch{throw new Error('请输入完整的 https:// 链接')}
 if(u.protocol!=='https:' || u.username || u.password || u.port) throw new Error('只支持不带账户信息和自定义端口的 HTTPS 链接');
 const h=u.hostname.toLowerCase();
 if(!h.includes('.') || /(^|\.)(localhost|local|internal|test|example|invalid)$/.test(h) || /^\d+\./.test(h) || h.includes(':') || h.endsWith('.local')) throw new Error('不支持本地或内网地址');
 if(allowedOnly && ![...brands.map(b=>new URL(b.url).hostname.replace(/^www\./,'')),...TREND_HOSTS].some(d=>h===d || h.endsWith('.'+d))) throw new Error('此域名尚未加入品牌来源，请先添加或更新品牌网址');
 u.hash='';for(const k of [...u.searchParams.keys()]) if(/^utm_|^(gclid|fbclid)$/.test(k))u.searchParams.delete(k);
 return u.href;
}
export function textOnly(s=''){return String(s).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()}
function meta(html,name){for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(x=>[x[1].toLowerCase(),x[2]]));if(a.property===name||a.name===name)return a.content||''}return ''}
export function parsePage(html,url){
 const nodes=[];function walk(v){if(!v || typeof v!=='object')return;if(Array.isArray(v)){v.forEach(walk);return}if([v['@type']].flat().includes('Product'))nodes.push(v);if(v['@graph'])walk(v['@graph']);if(v.mainEntity)walk(v.mainEntity);}
 for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]))}catch{}}
 const p=nodes[0];const image=[p?.image].flat()[0];let imageUrl=typeof image==='object'?image?.url:image;
 imageUrl=imageUrl||meta(html,'og:image');try{imageUrl=imageUrl?safeUrl(new URL(imageUrl,url).href):''}catch{imageUrl=''}
 const brand=p?.brand; const name=textOnly(p?.name||meta(html,'og:title')||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'未命名页面');
 return {title:name.slice(0,300),url,image:imageUrl,brand:typeof brand==='object'?brand?.name:(brand||BRANDS.find(b=>new URL(url).hostname.endsWith(new URL(b.url).hostname.replace(/^www\./,'')))?.name||''),description:textOnly(p?.description||meta(html,'description')||meta(html,'og:description')).slice(0,2500),material:textOnly(p?.material||''),isProduct:!!p,originalSeason:'未知'};
}
export async function fetchPage(url,fetcher=fetch,brands=BRANDS){
 let next=safeUrl(url,true,brands);
 for(let i=0;i<4;i++){
  const response=await fetcher(next,{redirect:'manual',headers:{'Accept':'text/html','User-Agent':'TrendWorkbench/0.1 (product research)'},signal:AbortSignal.timeout(12000)});
  if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');if(!location)throw new Error('网站重定向缺少目标');next=safeUrl(new URL(location,next).href,true,brands);continue;}
  if(!response.ok)throw new Error(`网站返回 ${response.status}，请尝试手动保存页面信息`);
  if(!/text\/html|application\/xhtml/.test(response.headers.get('content-type')||''))throw new Error('此链接不是商品或报告网页');
  const reader=response.body.getReader();let size=0;const chunks=[];try{while(true){const v=await reader.read();if(v.done)break;size+=v.value.length;if(size>2_000_000)throw new Error('页面过大，请使用商品详情链接');chunks.push(v.value)}}finally{await reader.cancel().catch(()=>{})}
  const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length}return parsePage(new TextDecoder().decode(bytes),next);
 }throw new Error('网站重定向过多');
}
export function validateRecord(v){
 if(!v || !['product','evidence','task'].includes(v.kind))throw new Error('记录类型不正确');
 if(!GROUPS.includes(v.group)||!SEASONS.includes(v.season))throw new Error('请选择人群和开发季节');
 if(typeof v.title!=='string'||!v.title.trim())throw new Error('请填写名称或需求');
 const r={...v,title:v.title.trim().slice(0,2000)};
 if(r.kind!=='task')r.url=safeUrl(r.url);
 if(r.image)r.image=safeUrl(r.image);
 if(r.kind==='evidence'){
  if(!TYPES.includes(r.type))throw new Error('请选择证据类型');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')||!Number.isFinite(Date.parse(r.date+'T00:00:00Z'))||new Date(r.date+'T00:00:00Z').toISOString().slice(0,10)!==r.date||r.date>new Date().toISOString().slice(0,10))throw new Error('请填写有效且不晚于今天的来源日期');
  if(!r.quote?.trim())throw new Error('请填写支撑判断的原文摘录或具体指标');
  if(r.type==='消费需求数据' && !r.metric?.trim())throw new Error('消费需求数据需要明确指标和统计范围');
 }
 r.tags=Array.isArray(r.tags)?r.tags.slice(0,15).map(x=>String(x).trim().slice(0,60)).filter(Boolean):[];
 r.evidenceIds=Array.isArray(r.evidenceIds)?r.evidenceIds.filter(x=>typeof x==='string').slice(0,30):[];
 return r;
}
export function evidenceFor(product,records){
 return records.filter(e=>e.kind==='evidence' && e.group===product.group && e.season===product.season && (product.evidenceIds||[]).includes(e.id)).map(e=>({...e,stale:(Date.now()-Date.parse(e.date))/86400000>180}));
}
export function exportCsv(records){const cols=['kind','title','group','season','brand','url','originalSeason','material','type','date','quote','metric'];const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';return '\uFEFF'+[cols.map(cell).join(','),...records.map(r=>cols.map(k=>cell(r[k])).join(','))].join('\r\n')}
