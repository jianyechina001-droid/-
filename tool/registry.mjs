import {BRANDS,GROUPS,PUBLIC_SEARCH,safeUrl,textOnly} from './core.mjs';
export function brandId(name){let h=2166136261;for(const c of name.toLowerCase()){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return 'brand-'+(h>>>0).toString(16)}
export function defaults(){return BRANDS.map(b=>({...b,id:brandId(b.name),enabled:true,adapter:PUBLIC_SEARCH.includes(b.name)?'shopify':'auto',searchTemplate:'',groupUrls:{},notes:'从私人导航台导入；地区及人群覆盖需以实际商品核验。',status:'untested'}))}
export function sameBrand(url,brand){const h=new URL(url).hostname.replace(/^www\./,'');const root=new URL(brand.url).hostname.replace(/^www\./,'');return h===root||h.endsWith('.'+root)}
export function validateBrand(raw){
 if(typeof raw?.name!=='string'||!raw.name.trim())throw Error('请输入品牌名称');
 const b={id:raw.id||crypto.randomUUID(),name:raw.name.trim().slice(0,100),url:safeUrl(raw.url),groups:Array.isArray(raw.groups)?[...new Set(raw.groups.filter(g=>GROUPS.includes(g)))]:[],enabled:raw.enabled!==false,adapter:['auto','shopify','html','external'].includes(raw.adapter)?raw.adapter:'auto',searchTemplate:String(raw.searchTemplate||'').slice(0,1500),notes:String(raw.notes||'').slice(0,3000),groupUrls:{}};
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(b.id))throw Error('品牌编号不正确');if(!b.groups.length)throw Error('请至少选择一个适用人群');
 if(b.searchTemplate){if(!b.searchTemplate.includes('{query}'))throw Error('搜索模板需要包含 {query}');const sample=safeUrl(b.searchTemplate.replaceAll('{query}','shirt').replaceAll('{group}','women'));if(!sameBrand(sample,b))throw Error('搜索模板必须属于该品牌域名');}
 for(const [g,u]of Object.entries(raw.groupUrls||{})){if(!GROUPS.includes(g)||!u)continue;const valid=safeUrl(u);if(!sameBrand(valid,b))throw Error(g+'入口必须属于该品牌域名');b.groupUrls[g]=valid}
 return b;
}
export async function readBrands(bucket){const overrides=await readObjects(bucket,'brands/');const map=new Map(defaults().map(b=>[b.id,b]));for(const b of overrides)map.set(b.id,b);return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name))}
export async function readObjects(bucket,prefix){const rows=[];let cursor;do{const list=await bucket.list({prefix,cursor});for(const v of list.objects){const item=await bucket.get(v.key);if(item)rows.push(await item.json())}cursor=list.truncated?list.cursor:undefined}while(cursor);return rows}
export function parseBrandImport(content,format='auto'){
 if(typeof content!=='string'||content.length>800000)throw Error('文件内容为空或超过800KB');let rows=[];
 if(format==='json'||/^\s*[\[{]/.test(content)){const v=JSON.parse(content);rows=Array.isArray(v)?v:v.brands;if(!Array.isArray(rows))throw Error('JSON需要是品牌数组或包含brands字段')}
 else if(/<a\b/i.test(content)){
  const section=content.includes('品牌网站')?content.slice(content.lastIndexOf('品牌网站')):content;
  rows=[...section.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({name:textOnly(m[2]),url:m[1].replaceAll('&amp;','&'),groups:['女装']}));
 }else{
  const lines=content.replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>l.trim());
  const split=line=>{const out=[];let s='',quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quote&&line[i+1]==='"'){s+='"';i++}else quote=!quote}else if((c===','||c==='\t')&&!quote){out.push(s.trim());s=''}else s+=c}out.push(s.trim());return out};
  for(const line of lines){const [name,url,groups]=split(line);if(/^(name|品牌|品牌名称)$/i.test(name))continue;rows.push({name,url,groups:groups?groups.split(/[|、;/]/):['女装']})}
 }
 if(!rows.length||rows.length>200)throw Error('每次请导入1～200个品牌');
 const seen=new Set(),valid=[],errors=[];for(let i=0;i<rows.length;i++){try{const b=validateBrand({...rows[i],groups:rows[i].groups||['女装']});const key=b.name.toLowerCase();if(seen.has(key))continue;seen.add(key);valid.push(b)}catch(e){errors.push({row:i+1,name:rows[i]?.name||'',error:e.message})}}
 return {brands:valid,errors};
}
export function publicAddress(value){
 const v=value.toLowerCase();if(v.includes(':'))return /^[23][0-9a-f]{0,3}:/.test(v)&&!v.startsWith('2001:db8:');
 const n=v.split('.').map(Number);if(n.length!==4||n.some(x=>!Number.isInteger(x)||x<0||x>255))return false;
 const [a,b]=n;return !(a===0||a===10||a===127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0)||a===100&&b>=64&&b<=127||a>=224||a===198&&(b===18||b===19));
}
export async function assertPublicHost(url,fetcher=fetch){
 const host=new URL(safeUrl(url)).hostname;let found=false;
 for(const type of ['A','AAAA']){const u='https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(host)+'&type='+type;const r=await fetcher(u,{headers:{Accept:'application/dns-json'},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('无法验证品牌域名DNS，请稍后重试');const data=await r.json();const answers=(data.Answer||[]).filter(a=>a.type===1||a.type===28);if(answers.some(a=>!publicAddress(a.data)))throw Error('品牌域名指向内网或保留地址，无法接入');if(answers.length)found=true}
 if(found)return true;
 throw Error('品牌域名没有可访问的公网地址');
}
export function usageDay(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(t=>parts.find(p=>p.type===t).value).join('-')}
export async function reservePaidCall(bucket,limit=20){const key='usage/'+usageDay()+'.json';for(let i=0;i<5;i++){const old=await bucket.get(key);const count=old?Number(await old.text()):0;if(count>=limit)throw Error('今日扩展搜索已达20次保护上限；官网直连仍可使用');const saved=await bucket.put(key,String(count+1),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});if(saved)return count+1}throw Error('扩展搜索计数繁忙，请稍后重试')}
