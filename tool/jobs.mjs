import {GROUPS,SEASONS,validateRecord} from './core.mjs';
import {readBrands,readObjects,reservePaidCall} from './registry.mjs';
import {searchBrand} from './engine.mjs';
import {qualityCheck} from './quality.mjs';
import {parseSearchIntent} from './intent.mjs';
import {enqueueAI} from './ai-queue.mjs';
export async function productRecordId(p){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode([p.url,p.group,p.season].join('|')));return 'product-'+[...new Uint8Array(bytes)].slice(0,16).map(v=>v.toString(16).padStart(2,'0')).join('')}
export async function putRecord(bucket,raw){let v=validateRecord(raw);if(!v.id&&v.kind==='product'){const old=(await readObjects(bucket,'records/')).find(r=>r.kind==='product'&&r.url===v.url&&r.group===v.group&&r.season===v.season);v={...old,...v,id:old?.id||await productRecordId(v)}}v.id=v.id||crypto.randomUUID();if(!/^[a-zA-Z0-9-]{1,80}$/.test(v.id))throw Error('记录编号无效');v.updatedAt=new Date().toISOString();await bucket.put('records/'+v.id+'.json',JSON.stringify(v));return v}
export async function createJob(bucket,body){
 if(!GROUPS.includes(body.group)||!SEASONS.includes(body.season)||!body.query?.trim())throw Error('请填写需求、人群和开发季节');
 const brands=(await readBrands(bucket)).filter(b=>b.enabled&&b.groups.includes(body.group)&&(body.brandIds?.includes(b.id)||body.brands?.includes(b.name)));
 if(!brands.length)throw Error('请至少选择一个已启用且适用当前人群的品牌');if(brands.length>60)throw Error('每个任务最多60个品牌');
 return putRecord(bucket,{kind:'task',title:body.query,intent:parseSearchIntent(body.query,body.group),group:body.group,season:body.season,market:'欧美',brandIds:brands.map(b=>b.id),brands:brands.map(b=>b.name),status:'pending',resultIds:[],sources:brands.map(b=>({brandId:b.id,name:b.name,status:'pending',attempts:0,resultIds:[]})),failures:[],tags:[],createdAt:new Date().toISOString()});
}
export async function stepJob(bucket,id,env,runner=searchBrand){
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(id||''))throw Error('任务编号不正确');
 const key='records/'+id+'.json';const object=await bucket.get(key);if(!object)throw Error('任务不存在');const job=await object.json();if(job.kind!=='task'||!job.sources)throw Error('这条旧任务需要重新执行');
 if(['completed','paused'].includes(job.status))return {job};
 if(job.leaseUntil>Date.now())return {job,busy:true};
 const source=job.sources.find(s=>s.status==='pending'||s.status==='running');if(!source){job.status='completed';return {job:await putRecord(bucket,job)}}
 job.leaseUntil=Date.now()+90000;job.status='running';source.status='running';source.attempts++;job.updatedAt=new Date().toISOString();
 const acquired=await bucket.put(key,JSON.stringify(job),{onlyIf:{etagMatches:object.etag}});if(!acquired)return {busy:true,job};
 const brands=await readBrands(bucket);const brand=brands.find(b=>b.id===source.brandId);
 try{
  if(!brand)throw Error('品牌已移除，请更新来源');const result=await runner(brand,job.title,job.group,{...env,reservePaidCall:()=>reservePaidCall(bucket)},brands);const checked=result.items.map(p=>qualityCheck(p,job.title,job.group));source.excluded=checked.filter(p=>!p.accept).map(p=>p.reason);result.items=checked.filter(p=>p.accept).map(p=>p.item);
  source.method=result.method;source.errors=result.errors||[];source.requiresConnection=result.requiresConnection||false;
  const existingProducts=(await readObjects(bucket,'records/')).filter(v=>v.kind==='product');
  for(const p of result.items){const productId=await productRecordId({...p,group:job.group,season:job.season});
   let item=existingProducts.find(v=>v.url===p.url&&v.group===job.group&&v.season===job.season);if(!item)item=await putRecord(bucket,{...p,id:productId,kind:'product',group:job.group,season:job.season,evidenceIds:[],tags:[],saved:false,note:'人群、面料和风格待复核。实际搜索词：'+(p.searchTerms||''),capturedAt:new Date().toISOString()});
   const ai=await enqueueAI(bucket,item,job.title);job.aiJobIds={...(job.aiJobIds||{}),[item.id]:ai.id};
   if(!source.resultIds.includes(item.id))source.resultIds.push(item.id);if(!job.resultIds.includes(item.id))job.resultIds.push(item.id);
  }
  source.status=result.items.length?'completed':result.errors?.length?'failed':'empty';
  await bucket.put('health/'+brand.id+'.json',JSON.stringify({brandId:brand.id,status:source.status,method:source.method,count:result.items.length,errors:source.errors,checkedAt:new Date().toISOString(),query:job.title}));
 }catch(e){source.status='failed';source.errors=[e.message]}
 const fresh=await bucket.get(key);const current=await fresh.json();if(current.status==='paused')job.status='paused';else job.status=job.sources.some(s=>['pending','running'].includes(s.status))?'running':'completed';job.leaseUntil=0;
 job.failures=job.sources.filter(s=>s.status==='failed').map(s=>({brandId:s.brandId,name:s.name,error:(s.errors||[]).join('；'),url:brands.find(b=>b.id===s.brandId)?.url||''}));
 return {job:await putRecord(bucket,job)};
}
export async function controlJob(bucket,id,action){
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(id||''))throw Error('任务编号不正确');const object=await bucket.get('records/'+id+'.json');if(!object)throw Error('任务不存在');const job=await object.json();if(job.kind!=='task'||!job.sources)throw Error('旧任务请用“使用这条需求”重新执行');
 if(action==='pause')job.status='paused';
 else if(action==='resume'){job.status='pending';if(job.leaseUntil<Date.now())job.leaseUntil=0}
 else if(action==='retry'){for(const s of job.sources)if(['failed','empty'].includes(s.status)){s.status='pending';s.errors=[]}job.failures=[];job.status='pending'}
 else throw Error('不支持的任务操作');return putRecord(bucket,job);
}
