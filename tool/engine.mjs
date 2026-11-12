import {parseSearchIntent} from './intent.mjs';
import {searchKeywords,parsePage,safeUrl,textOnly} from './core.mjs';
import {sameBrand,assertPublicHost} from './registry.mjs';
import {classifyAudience,qualityCheck} from './quality.mjs';
const SEARCH_PATHS={ZARA:'/cn/zh/search?searchTerm={query}',Reformation:'/search?q={query}',MANGO:'/hk/en/search?kw={query}',Aritzia:'/intl/en/search?q={query}','Pull&Bear':'/gb/search?searchTerm={query}',Stradivarius:'/us/search?searchTerm={query}',Bershka:'/es/search.html?searchTerm={query}','Free People':'/search/?q={query}','Urban Outfitters':'/search?q={query}',Hollister:'/shop/wd/search?searchTerm={query}',Garage:'/us/search?q={query}','Gina Tricot':'/eu/search?q={query}','New Look':'/uk/search/?text={query}',Glassons:'/search?q={query}',Weekday:'/en-ww/search/?q={query}','Massimo Dutti':'/sg/search?searchTerm={query}'};
export function productLinks(html,pageUrl,brand){
 const found=new Set();const push=u=>{try{const v=new URL(safeUrl(new URL(u.replaceAll('&amp;','&'),pageUrl).href));if(!sameBrand(v.href,brand))return;if(!/\/products?\/|\/p\/|productpage\.|-p\d|\/product\//i.test(v.pathname))return;v.search='';v.hash='';found.add(v.href)}catch{}};
 for(const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi))push(m[1]);
 for(const m of html.matchAll(/["'](?:url|productUrl|pdpUrl|href)["']\s*:\s*["']([^"']+)["']/g))push(m[1].replaceAll('\\/','/'));
 return [...found].slice(0,6);
}
export async function readHtml(url,brands,fetcher=fetch){
 let u=safeUrl(url,true,brands);for(let i=0;i<3;i++){
  await assertPublicHost(u,fetcher);
  const r=await fetcher(u,{redirect:'manual',headers:{Accept:'text/html','User-Agent':'TrendAtelier/0.2 public product research'},signal:AbortSignal.timeout(8000)});
  if([301,302,303,307,308].includes(r.status)){if(!r.headers.get('location'))throw Error('缺少跳转地址');u=safeUrl(new URL(r.headers.get('location'),u).href,true,brands);continue}
  if(!r.ok)throw Error('官网返回 '+r.status+'，可能需要登录、地区选择或稍后重试');
  if(!/html/i.test(r.headers.get('content-type')||''))throw Error('官网未返回可读取的网页');
  const reader=r.body.getReader();const chunks=[];let total=0;try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>2_000_000)throw Error('网页内容过大');chunks.push(value)}}finally{await reader.cancel().catch(()=>{})}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return {html:new TextDecoder().decode(bytes),url:u};
 }throw Error('官网跳转次数过多，请更新品牌地区入口');
}
export async function shopifySearch(brand,query,group,fetcher=fetch){
 const intent=parseSearchIntent(query,group),items=[],seen=new Set();
 for(const term of intent.searches.slice(0,intent.features?.length?4:intent.category==='cami_top'?3:2)){
  const scoped=brand.name==='Kith'?({女装:'women ',男装:'',小童:'kids ',大童:'kids '}[group]||'')+term:term;
  const u=new URL('/search/suggest.json',brand.url);u.searchParams.set('q',scoped);u.searchParams.set('resources[type]','product');u.searchParams.set('resources[limit]','10');
  await assertPublicHost(u.href,fetcher);const r=await fetcher(u.href,{redirect:'manual',headers:{Accept:'application/json'},signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error('公开商品搜索返回 '+r.status);
  const raw=await r.text();if(raw.length>700000)throw Error('搜索响应过大');let data;try{data=JSON.parse(raw)}catch{throw Error('该官网不提供此类公开商品接口')}
  if(!data.resources?.results||!Array.isArray(data.resources.results.products))throw Error('官网搜索数据格式不匹配');
  for(const p of data.resources.results.products.slice(0,10)){
   const url=new URL(safeUrl(new URL(p.url,brand.url).href));url.search='';if(!sameBrand(url.href,brand))throw Error('返回商品不属于品牌域名');if(seen.has(url.href))continue;seen.add(url.href);
   let image=typeof p.image==='object'?p.image?.url:p.image;try{image=image?safeUrl(new URL(image,brand.url).href):''}catch{image=''}
   const candidate={title:textOnly(p.title),productType:textOnly(p.type||''),url:url.href,image,brand:brand.name,sourceAudience:classifyAudience(p),description:textOnly(p.body||'').slice(0,3000),material:'',originalSeason:'未知',searchTerms:scoped,isProduct:true,method:'官网商品接口'};
   const checked=qualityCheck(candidate,query,group);if(checked.accept)items.push(checked.item);
  }
  if(items.length>=4)break;
 }
 return items.slice(0,8);
}
async function providerSearch(brand,query,group,env,brands,fetcher){
 if(env.reservePaidCall)await env.reservePaidCall();
 const audience={女装:'women',男装:'men',小童:'younger kids',大童:'older kids'}[group];
 const host=new URL(brand.url).hostname;const q=audience+' '+searchKeywords(query)+' site:'+host;
 let results=[];
 if(env.FIRECRAWL_API_KEY){const r=await fetcher('https://api.firecrawl.dev/v2/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.FIRECRAWL_API_KEY},body:JSON.stringify({query:q,limit:4,sources:[{type:'web'}],includeDomains:[host],country:'US',scrapeOptions:{formats:['html']}}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('扩展搜索服务返回 '+r.status);const d=await r.json();if(!d.success)throw Error('扩展搜索服务未成功执行');results=d.data?.web||[]}
 else if(env.TAVILY_API_KEY){const r=await fetcher('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.TAVILY_API_KEY},body:JSON.stringify({query:q,max_results:4,include_domains:[host],include_domains_mode:'restrict',search_depth:'basic'}),signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('扩展搜索服务返回 '+r.status);results=(await r.json()).results||[]}
 else throw Error('扩展网页搜索尚未连接');
 const settled=await Promise.allSettled(results.slice(0,4).map(async r=>{const u=safeUrl(r.url,true,brands);if(!sameBrand(u,brand))throw Error('搜索结果域名不符');let html=r.html;if(!html)html=(await readHtml(u,brands,fetcher)).html;const p=parsePage(html,u);if(!p.isProduct)throw Error('没有可验证的商品结构');return {...p,brand:brand.name,method:'扩展网页搜索',searchTerms:q}}));
 return settled.filter(v=>v.status==='fulfilled').map(v=>v.value);
}
async function retrieveBrand(brand,query,group,env,brands,fetcher=fetch){
 const errors=[];if(!brand.enabled)throw Error('该品牌已停用');
 if(!brand.groups.includes(group))throw Error('该品牌未配置此人群');
 if(['auto','shopify'].includes(brand.adapter))try{return {items:await shopifySearch(brand,query,group,fetcher),method:'官网商品接口',errors}}catch(e){errors.push(e.message)}
 if(brand.adapter!=='external')try{
  const template=brand.searchTemplate||new URL(SEARCH_PATHS[brand.name]||'/search?q={query}',brand.url).href.replaceAll('%7Bquery%7D','{query}');
  const pageUrl=template.replaceAll('{query}',encodeURIComponent(searchKeywords(query))).replaceAll('{group}',encodeURIComponent({女装:'women',男装:'men',小童:'kids',大童:'kids'}[group]));
  const page=await readHtml(pageUrl,brands,fetcher);let links=productLinks(page.html,page.url,brand);
  if(!links.length&&brand.groupUrls?.[group]){const entry=await readHtml(brand.groupUrls[group],brands,fetcher);links=productLinks(entry.html,entry.url,brand)}
  const fetched=await Promise.allSettled(links.slice(0,3).map(async u=>{const p=await readHtml(u,brands,fetcher);const v=parsePage(p.html,p.url);if(!v.isProduct)throw Error('商品页未提供可核验结构');return {...v,brand:brand.name,searchTerms:searchKeywords(query),method:'官网搜索页面'}}));
  const items=fetched.filter(v=>v.status==='fulfilled').map(v=>v.value);if(items.length)return {items,method:'官网搜索页面',errors};errors.push(links.length?'商品详情暂不可读取':'官网搜索页面未返回可读取商品，可能是动态页面');
 }catch(e){errors.push(e.message)}
 if(env.FIRECRAWL_API_KEY||env.TAVILY_API_KEY)try{const items=await providerSearch(brand,query,group,env,brands,fetcher);return {items,method:'扩展网页搜索',errors}}catch(e){errors.push(e.message)}
 return {items:[],method:'未完成',errors,requiresConnection:!env.FIRECRAWL_API_KEY&&!env.TAVILY_API_KEY};
}

export async function searchBrand(brand,query,group,env,brands,fetcher=fetch){const intent=parseSearchIntent(query,group);const raw=await retrieveBrand(brand,query,group,env,brands,fetcher);const checked=raw.items.map(p=>qualityCheck(p,query,group));return {...raw,items:checked.filter(p=>p.accept).map(p=>p.item),excluded:checked.filter(p=>!p.accept).map(p=>p.reason),intent};}
