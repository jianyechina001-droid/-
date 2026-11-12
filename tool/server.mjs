import {BRANDS,GROUPS,SEASONS,TYPES,PUBLIC_SEARCH,parsePage,validateRecord,exportCsv} from './core.mjs';
import {validateBrand,readBrands,readObjects,parseBrandImport,assertPublicHost,reservePaidCall} from './registry.mjs';
import {putRecord,createJob,stepJob,controlJob} from './jobs.mjs';
import {searchBrand,readHtml} from './engine.mjs';
import {MEMBER_PROVIDERS,memberStatus,memberReports} from './memberships.mjs';
import {aiStatus,aiHeartbeat,enqueueAI,claimAI,completeAI} from './ai-queue.mjs';
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/api/'))return new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src https: data:; connect-src 'self'; frame-ancestors 'self' https://*.chatgpt.com https://chatgpt.com"}});
 if(!['GET','POST'].includes(request.method))return json({error:'请求方法不支持'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return json({error:'请求来源不匹配'},403);
 const bucket=env.BUCKET;if(!bucket)return json({error:'数据存储未连接'},503);
 try{
  const records=()=>readObjects(bucket,'records/');const brands=()=>readBrands(bucket);
  if(url.pathname==='/api/membership'&&request.method==='GET')return json({providers:await Promise.all(MEMBER_PROVIDERS.map(p=>memberStatus(p.id,env,bucket)))});
  if(url.pathname==='/api/membership/reports'&&request.method==='GET')return json({reports:await memberReports(url.searchParams.get('provider'),env,bucket,url.searchParams.get('q'))});
  if(url.pathname==='/api/state'){const localAI=await aiStatus(bucket);return json({brands:await brands(),health:await readObjects(bucket,'health/'),groups:GROUPS,seasons:SEASONS,types:TYPES,records:(await records()).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')),searchReady:true,expandedSearchReady:!!(env.FIRECRAWL_API_KEY||env.TAVILY_API_KEY),publicSearchBrands:PUBLIC_SEARCH,aiReady:localAI.ready,localAI})}
  if(url.pathname==='/api/ai/status'&&request.method==='GET')return json(await aiStatus(bucket));
  if(url.pathname==='/api/export')return new Response(exportCsv(await records()),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename=trend-workbench.csv'}});
  if(url.pathname==='/api/brands'&&request.method==='GET')return json({brands:await brands()});
  if(request.method==='GET')return json({error:'接口不存在'},404);
  const raw=await request.text();if(raw.length>1_000_000)return json({error:'提交内容过大'},413);const body=JSON.parse(raw);
  if(url.pathname.startsWith('/api/ai/worker/')&&request.headers.get('oai-authenticated-user-id'))return json({error:'此接口仅供已授权的本机AI服务使用'},403);
  if(url.pathname==='/api/ai/worker/heartbeat')return json(await aiHeartbeat(bucket,body));
  if(url.pathname==='/api/ai/worker/next')return json({job:await claimAI(bucket)});
  if(url.pathname==='/api/ai/worker/complete')return json({job:await completeAI(bucket,body)});
  if(url.pathname==='/api/ai/request'){const row=await bucket.get('records/'+body.productId+'.json');if(!row)throw Error('款式不存在');const product=await row.json();if(product.kind!=='product')throw Error('只能复核商品图片');const queued=await enqueueAI(bucket,product,body.query||product.title);if(body.taskId&&/^[a-zA-Z0-9-]{1,80}$/.test(body.taskId)){const taskObject=await bucket.get('records/'+body.taskId+'.json');if(taskObject){const task=await taskObject.json();if(task.kind==='task'&&task.resultIds?.includes(product.id)){task.aiJobIds={...(task.aiJobIds||{}),[product.id]:queued.id};await bucket.put('records/'+task.id+'.json',JSON.stringify(task))}}}return json({job:queued})}
  if(url.pathname==='/api/membership/preference'){if(!MEMBER_PROVIDERS.some(p=>p.id===body.provider)||typeof body.enabled!=='boolean')throw Error('会员功能参数无效');if(body.enabled){const verified=await memberStatus(body.provider,env,bucket);if(!verified.authenticated)throw Error('尚未验证会员登录，不能启用此功能')}await bucket.put('member-preferences/'+body.provider+'.json',JSON.stringify({disabled:!body.enabled}));return json({provider:await memberStatus(body.provider,env,bucket)})}
  if(url.pathname==='/api/records'){const clean={...body};delete clean.aiReview;delete clean.aiReviews;if(body.kind==='product'){let old=null;if(body.id){const object=await bucket.get('records/'+body.id+'.json');if(object)old=await object.json()}else old=(await records()).find(p=>p.kind==='product'&&p.url===body.url&&p.group===body.group&&p.season===body.season);clean.aiReview=undefined;clean.aiReviews=undefined;if(old&&['image','title','material','group','season'].every(k=>(body[k]??old[k])===old[k])){clean.aiReview=old.aiReview;clean.aiReviews=old.aiReviews}}return json({item:await putRecord(bucket,clean)})}
  if(url.pathname==='/api/delete'){if(!/^[a-zA-Z0-9-]{1,80}$/.test(body.id||''))throw Error('记录编号无效');const row=await bucket.get('records/'+body.id+'.json');if(row){const record=await row.json();record.archived=true;await putRecord(bucket,record)}return json({ok:true})}
  if(url.pathname==='/api/import'){const list=await brands();const page=await readHtml(body.url,list);const item=parsePage(page.html,page.url);return json({item,notice:item.isProduct?'已读取商品结构化信息，请核对后保存':'仅识别到网页信息，未确认是商品，请核对后保存'})}
  if(url.pathname==='/api/brands/save'){
   const b=validateBrand(body);const list=await brands();const duplicate=list.find(v=>v.name.toLowerCase()===b.name.toLowerCase()&&v.id!==b.id);if(duplicate)throw Error('已存在同名品牌，请编辑原品牌');b.updatedAt=new Date().toISOString();await bucket.put('brands/'+b.id+'.json',JSON.stringify(b));const old=list.find(v=>v.id===b.id);if(old&&(old.url!==b.url||old.adapter!==b.adapter||old.searchTemplate!==b.searchTemplate))await bucket.delete('health/'+b.id+'.json');return json({brand:b});
  }
  if(url.pathname==='/api/brands/import'){
   const parsed=parseBrandImport(body.content,body.format);if(!body.commit)return json(parsed);
   const list=await brands();const saved=[];for(const b of parsed.brands){const identity=s=>s.toLowerCase().replace(/[\s&._-]/g,'');const domain=u=>new URL(u).hostname.replace(/^www\./,'');const old=list.find(v=>identity(v.name)===identity(b.name)||domain(v.url)===domain(b.url));const next={...b,...(old?{id:old.id,name:old.name,adapter:old.adapter,searchTemplate:old.searchTemplate,notes:old.notes,groupUrls:old.groupUrls,enabled:old.enabled}:{}),url:b.url,groups:body.keepExistingGroups!==false&&old?old.groups:b.groups,updatedAt:new Date().toISOString()};await bucket.put('brands/'+next.id+'.json',JSON.stringify(next));if(old&&old.url!==next.url)await bucket.delete('health/'+next.id+'.json');saved.push(next)}return json({brands:saved,errors:parsed.errors});
  }
  if(url.pathname==='/api/brands/test'){
   const b=(await brands()).find(v=>v.id===body.id);if(!b)throw Error('品牌不存在');const result=await searchBrand({...b,enabled:true},body.query||'shirt',body.group||b.groups[0],{...env,reservePaidCall:()=>reservePaidCall(bucket)},await brands());const health={brandId:b.id,status:result.items.length?'completed':result.errors?.length?'failed':'empty',method:result.method,count:result.items.length,errors:result.errors||[],requiresConnection:result.requiresConnection||false,checkedAt:new Date().toISOString()};await bucket.put('health/'+b.id+'.json',JSON.stringify(health));return json({health,sample:result.items.slice(0,1)});
  }
  if(url.pathname==='/api/backup'){
   if(!Array.isArray(body.records)||body.records.length>500)throw Error('每次最多恢复500条记录');const valid=body.records.map(validateRecord);const bs=(body.brands||[]).map(validateBrand);for(const v of valid)if(v.id&&!/^[a-zA-Z0-9-]{1,80}$/.test(v.id))throw Error('备份含无效编号');for(const b of bs)await bucket.put('brands/'+b.id+'.json',JSON.stringify(b));for(const v of valid)await putRecord(bucket,v);return json({count:valid.length,brandCount:bs.length});
  }
  if(url.pathname==='/api/search'||url.pathname==='/api/jobs/create')return json({job:await createJob(bucket,body)});
  if(url.pathname==='/api/jobs/step')return json(await stepJob(bucket,body.id,env));
  if(url.pathname==='/api/jobs/control')return json({job:await controlJob(bucket,body.id,body.action)});
  return json({error:'接口不存在'},404);
 }catch(e){return json({error:e.message||'操作失败，请重试'},400)}
}};
