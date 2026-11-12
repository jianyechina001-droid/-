let aiRefreshBusy=false;
function currentAIReview(product){const scope=state.records.find(t=>t.id===currentTaskId&&t.kind==='task');const id=scope?.aiJobIds?.[product.id];return id?product.aiReviews?.[id]||null:scope?null:product.aiReview||null}
function aiBadge(product){const review=currentAIReview(product);if(!review)return '<span class="badge">'+(product.image?'等待本机AI看图':'缺少商品图，无法AI复核')+'</span>';const names={accepted:'AI复核通过',rejected:'AI已排除',needs_review:'AI建议人工复核'};return '<span class="badge '+(review.decision==='accepted'?'good':'')+'">'+names[review.decision]+'</span>'}
function setupLocalAI(){const panel=document.createElement('div');panel.className='panel';panel.style.marginBottom='20px';panel.innerHTML='<div class="panel-head"><h2>内置服装AI · 本机免费运行</h2><span class="pill">不使用按次收费接口</span></div><div id="local-ai-state" role="status">正在检查本机引擎…</div><p class="tiny" style="margin-top:10px">FashionSigLIP 做服装分类，Qwen3-VL 8B 复核图片细节。两者冲突或信息不足时进入待复核；支持肌理、提花、镂空、钩编、罗纹、绞花等关键词，指定特征逐项复核。提花工艺还需商品说明支持。模型判断不代表趋势已验证。</p>';
 $('#home').insertBefore(panel,$('#home').firstChild);const filter=document.createElement('label');filter.style.display='flex';filter.style.alignItems='center';filter.innerHTML='<input type="checkbox" id="ai-verified-only" checked> 仅显示AI复核通过';$('#evidence-filter').after(filter);$('#ai-verified-only').onchange=render;
 const all=document.createElement('button');all.className='chip';all.textContent='让本机AI复核当前候选';all.id='request-ai-batch';all.onclick=async()=>{all.disabled=true;try{const scope=state.records.find(t=>t.id===currentTaskId&&t.kind==='task');const products=state.records.filter(p=>p.kind==='product'&&p.group===$('#group').value&&p.season===$('#season').value&&(!scope||scope.resultIds?.includes(p.id))).slice(0,30);if(!products.length)throw Error('当前没有可复核的款式');for(const p of products)await api('ai/request',{productId:p.id,taskId:scope?.id,query:scope?.title||$('#query').value||p.title});await refresh();toast('已加入本机AI队列，电脑运行工具时自动处理')}catch(e){toast(e.message)}finally{all.disabled=false}};$('#ai-verified-only').parentElement.after(all);
}
async function refreshAIState(){if(aiRefreshBusy)return;aiRefreshBusy=true;try{const status=await api('ai/status');const before=JSON.stringify([state.localAI?.completed,state.localAI?.failed,state.localAI?.pending]);state.localAI=status;$('#local-ai-state').innerHTML='<span class="badge '+(status.ready?'good':'')+'">'+(status.ready?'本机AI已连接':'本机AI离线 / 初始化中')+'</span><p class="tiny" style="margin-top:8px">'+esc(status.ready?'正在本机处理图片，无按次调用费。':'请在这台电脑双击“启动选款工具”，等待模型启动。')+' 待处理 '+status.pending+'，已处理 '+status.completed+'。</p>'+(status.error?'<p class="tiny">'+esc(status.error)+'</p>':'');if(before!==JSON.stringify([status.completed,status.failed,status.pending]))await refresh()}catch(e){$('#local-ai-state').textContent='暂时无法获取本机AI状态：'+e.message}finally{aiRefreshBusy=false}}
document.addEventListener('click',async e=>{const b=e.target.closest('button[data-ai-review]');if(!b)return;b.disabled=true;try{const p=state.records.find(v=>v.id===b.dataset.aiReview);const scope=state.records.find(v=>v.id===currentTaskId&&v.kind==='task');await api('ai/request',{productId:p.id,taskId:scope?.id,query:scope?.title||$('#query').value||p.title});toast('已加入本机AI复核队列');await refreshAIState()}catch(e){toast(e.message)}finally{b.disabled=false}});
const fabricReviewHTML=review=>(review.fabricFeatures||[]).length?'<h3 style="margin-top:16px">面料特征逐项核对</h3>'+review.fabricFeatures.map(f=>'<p class="tiny"><b>'+esc((f.excluded?'排除：':'')+f.label)+'</b> · '+esc(({accepted:'符合条件',rejected:'不符合',needs_review:'待核实'})[f.result]||'待核实')+'<br>'+esc(f.evidence)+(f.sourceEvidence?'<br>商品说明：'+esc(f.sourceEvidence):'')+'</p>').join(''):'';
const baseShowDetail=showDetail;showDetail=function(id){baseShowDetail(id);const product=state.records.find(p=>p.id===id),review=currentAIReview(product);const panel=document.createElement('div');panel.className='panel';panel.style.marginTop='18px';panel.innerHTML='<h2>服装AI图片复核</h2>'+(review?'<p>'+aiBadge(product)+'</p><p class="detail-text" style="margin-top:10px">'+esc(review.evidence)+'</p><p class="tiny" style="margin-top:10px">肩带：'+esc(({thin:'细肩带',wide:'宽肩带',none:'无肩带',unknown:'待确认'})[review.attributes.straps]||review.attributes.straps)+' · 长度：'+esc(review.attributes.garmentLength)+' · 袖型：'+esc(review.attributes.sleeves)+'</p><p class="tiny">'+esc(review.attributes.neckline)+' / '+esc(review.attributes.silhouette)+'</p>'+(review.issues?.length?'<p class="danger" style="font-size:12px;margin-top:10px">'+esc(review.issues.join('；'))+'</p>':'')+'<p class="tiny" style="margin-top:12px">模型：FashionSigLIP + Qwen3-VL 8B，本机运行。此结果是服装品类及指定面料外观复核，不构成人群、面料成分或流行趋势的完整认证。</p>':'<p>尚未完成本机AI看图，不会用关键词筛选冒充模型判断。</p>');$('#detail-body').append(panel)};
setupLocalAI();refreshAIState();setInterval(()=>{if(!document.hidden)refreshAIState()},5000);

function acceptBrowserProduct(){if(!location.hash.startsWith('#browser-product='))return;try{const raw=location.hash.slice(17);if(raw.length>30000)throw Error('商品信息过长');const data=JSON.parse(decodeURIComponent(raw));const url=new URL(data.url);if(url.protocol!=='https:')throw Error('来源必须是HTTPS商品页面');let image='';try{const u=new URL(data.image);if(u.protocol==='https:')image=u.href}catch{}const clean=(v,n)=>typeof v==='string'?v.slice(0,n):'';edit('product',{title:clean(data.title,300),url:url.href,image,brand:clean(data.brand,120),description:clean(data.description,2500),material:clean(data.material,300),originalSeason:'未知',tags:[],capturedAt:new Date().toISOString(),note:'从浏览器当前已打开页面导入；商品、人群、面料和来源需核对。'});$('#import-notice').textContent=data.isProduct?'浏览器已读取商品结构化信息，核对后保存。':'当前页面未确认商品结构，请核对是否为商品详情页。';history.replaceState(null,'',location.pathname);toast('已接收浏览器商品信息，请核对后保存')}catch(e){toast('浏览器导入失败：'+e.message)}}
const browserHelp=document.createElement('div');browserHelp.className='panel';browserHelp.innerHTML='<h2>使用已登录的浏览器页面</h2><p class="tiny">自动读取失败时，在你常用浏览器的商品详情页点击“款研 · 当前商品导入”扩展。首次安装见项目目录“浏览器助手 / 安装说明.txt”。它读取当前页面的商品，不传输登录凭证；不会自动解除网站访问限制。</p>';$('#sources').prepend(browserHelp);acceptBrowserProduct();

function browserSourceLink(source,task){if(!['failed','empty'].includes(source.status))return '';const brand=state.brands.find(b=>b.id===source.brandId);if(!brand)return '';const target=brand.searchTemplate?brand.searchTemplate.replaceAll('{query}',encodeURIComponent(task.intent?.primary||task.title)).replaceAll('{group}',encodeURIComponent(({女装:'women',男装:'men',小童:'kids',大童:'kids'})[task.group]||'')):brand.groupUrls?.[task.group]||brand.url;return '<p class="tiny"><a class="link" href="'+link(target)+'" target="_blank" rel="noopener noreferrer">在浏览器打开 '+esc(brand.name)+' ↗</a> · 在常用且已登录的浏览器查看商品，再用款研助手导入。</p>'}

function setupFabricLibrary(){const box=document.createElement('details');box.className='panel';box.style.margin='16px 0';const groups=[...new Set(FABRIC_CATALOG.map(f=>f.group))];box.innerHTML='<summary style="cursor:pointer;font-weight:650">按面料找款 · '+FABRIC_CATALOG.length+'类常用关键词</summary><p class="tiny" style="margin:12px 0">不用先选款式。点击词语加入需求，也可直接输入“仿毛衫”“平纹”“丝绒条纹”等。多个条件按同时满足处理，一次最多6项；“不要蕾丝”等写在句末。平纹针织与平纹梭织、肌理与色彩图案会分别核对。</p>'+groups.map(group=>'<h3 style="font-size:13px;margin:14px 0 8px">'+esc(group)+'</h3><div class="row" style="flex-wrap:wrap">'+FABRIC_CATALOG.filter(f=>f.group===group).map(f=>'<button type="button" class="chip" data-fabric-word="'+esc(f.id)+'" title="'+esc(f.hint||f.label)+'">'+esc(f.id==='ribbed'?'罗纹 / 坑条':f.label)+'</button>').join('')+'</div>').join('')+'<p class="tiny" style="margin-top:14px">提花、钩编等工艺需文字佐证；纤维成分、柔软、防水、透气等按来源说明核对。词库支持检索与审核条件，不代表每个品牌都有对应商品或所有面料已达到同等识别精度。</p>';$('#query').closest('.prompt').parentElement.after(box);box.addEventListener('click',e=>{const b=e.target.closest('[data-fabric-word]');if(!b)return;const f=FABRIC_CATALOG.find(f=>f.id===b.dataset.fabricWord);const input=$('#query');const existing=input.value.trim();if(!existing.includes(f.label)){const split=existing.search(/(?:不要|排除|不含|别找|不需要|exclude|without)/i);input.value=split>=0?existing.slice(0,split).trim()+' '+f.label+'，'+existing.slice(split):[existing,f.label].filter(Boolean).join(' ')}input.focus();toast('已加入：'+f.label+'。点击“开始找款”执行搜索。')})}setupFabricLibrary();

function acceptBrowserImages(){
 const prefix='#browser-images=';
 if(!location.hash.startsWith(prefix))return;
 try{
  const raw=location.hash.slice(prefix.length);
  if(raw.length>500000)throw Error('图片批次过大');
  const rows=JSON.parse(decodeURIComponent(raw));
  const fromPinterest=Array.isArray(rows)&&rows.length>0&&rows.every(row=>{
   try{return ['www.pinterest.com','pinterest.com'].includes(new URL(row.source).hostname)&&new URL(row.image).hostname==='i.pinimg.com';}catch{return false;}
  });
  if(fromPinterest){
   try{
    const saved=JSON.parse(localStorage.getItem('kuanyan-pinterest-search')||'null');
    if(saved&&Date.now()-saved.createdAt<86400000&&typeof saved.query==='string'){
     $('#query').value=saved.query;
    }
   }catch{}
  }
  if(!Array.isArray(rows)||!rows.length||rows.length>100)throw Error('无效的图片批次');
  const box=document.createElement('section');
  box.className='notice';
  const title=document.createElement('p');
  title.textContent=(fromPinterest?'收到 Pinterest 灵感图片 ':'收到品牌网页图片 ')+rows.length+' 张。选择人群和季节，并填写搜图需求后开始复核。';
  const button=document.createElement('button');
  button.textContent=fromPinterest?'用当前需求筛选 Pinterest 图片':'保存图片并开始 AI 复核';
  const status=document.createElement('p');
  box.append(title,button,status);
  document.body.prepend(box);
  const completed=new Set();
  button.onclick=async()=>{
   const query=$('#query').value.trim(),group=$('#group').value,season=$('#season').value;
   if(!query){status.textContent='请先填写搜图需求，例如：女装格纹连衣裙。';return;}
   button.disabled=true;
   let failed=0;
   for(const [i,row] of rows.entries()){
    if(completed.has(i))continue;
    try{
     const source=new URL(row.source),image=new URL(row.image);
     for(const u of [source,image])if(u.protocol!=='https:'||u.username||u.password)throw Error('图片或来源地址无效');
     const key=JSON.stringify([source.href,image.href,group,season]);
     const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
     const id='browser-image-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('').slice(0,48);
     if(!state.records.some(r=>r.id===id)){
      await api('records',{id,kind:'product',title:source.hostname+' · 品牌图片',url:source.href,image:image.href,group,season,originalSeason:'未知',tags:[],note:'来自已登录品牌网页，商品及面料信息需复核。'});
     }
     await api('ai/request',{productId:id,query});
     completed.add(i);
    }catch(e){failed++;status.textContent=e.message;}
   }
   status.textContent='已加入 AI 队列 '+completed.size+' 张'+(failed?'，失败 '+failed+' 张，可重试。':'。');
   button.disabled=!failed;
   if(!failed)history.replaceState(null,'',location.pathname);
   await refresh().catch(()=>{});
  };
 }catch(e){toast('接收图片失败：'+e.message);}
}
acceptBrowserImages();

function setupPinterestSearch(){
 const query=document.querySelector('#query');
 if(!query)return;
 const button=document.createElement('button');
 button.type='button';
 button.className='chip';
 button.textContent='AI 检索 Pinterest';
 button.onclick=async()=>{
  const brief=query.value.trim();
  if(!brief){toast('请先填写选款需求');return;}
  const tab=window.open('about:blank','_blank');
  if(!tab){toast('请允许款研打开 Pinterest 标签页');return;}
  tab.opener=null;
  button.disabled=true;
  button.textContent='AI 正在生成检索词…';
  try{
   const {term}=await api('pinterest/plan',{query:brief});
   const url=new URL('https://www.pinterest.com/search/pins/');
   url.searchParams.set('q',term);
   try{localStorage.setItem('kuanyan-pinterest-search',JSON.stringify({query:brief,createdAt:Date.now()}));}catch{}
   tab.location.replace(url.href);
   toast('AI 检索词：'+term);
  }catch(e){tab.close();toast(e.message);}
  finally{button.disabled=false;button.textContent='AI 检索 Pinterest';}
 };
 query.closest('.prompt').after(button);
}
setupPinterestSearch();