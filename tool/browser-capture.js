// Runs only after a user clicks the extension on the current tab.
function captureBrowserProduct(){
 const clean=(v,n=2500)=>String(v||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
 const meta=k=>document.querySelector('meta[property="'+k+'"],meta[name="'+k+'"]')?.content||'';
 const products=[];const walk=(v,depth=0)=>{if(!v||depth>8)return;if(Array.isArray(v)){for(const x of v.slice(0,100))walk(x,depth+1);return}if(typeof v==='object'){if([].concat(v['@type']||[]).some(t=>/^(Product|ProductGroup)$/.test(t)))products.push(v);if(v['@graph'])walk(v['@graph'],depth+1);if(v.mainEntity)walk(v.mainEntity,depth+1)}};
 for(const el of [...document.querySelectorAll('script[type="application/ld+json"]')].slice(0,30)){if(el.textContent.length>500000)continue;try{walk(JSON.parse(el.textContent))}catch{}}
 const source=new URL(location.href);if(source.protocol!=='https:')throw Error('请在HTTPS品牌商品详情页使用');source.hash='';source.search='';
 const p=products.find(p=>{try{return new URL(p.url,source).pathname===source.pathname}catch{return false}})||products[0];
 const urlValue=v=>{try{v=typeof v==='object'?v?.url:v;if(!v)return '';const u=new URL(v,source);return u.protocol==='https:'?u.href:''}catch{return ''}};
 const images=p?.image;const image=urlValue(Array.isArray(images)?images[0]:images)||urlValue(meta('og:image'));
 return {version:1,title:clean(p?.name||meta('og:title')||document.querySelector('h1')?.textContent||document.title,300),url:source.href,image,brand:clean(typeof p?.brand==='object'?p.brand.name:p?.brand,120),description:clean(p?.description||meta('og:description')||meta('description')),material:clean(p?.material,300),isProduct:!!p,capturedAt:new Date().toISOString(),captureMethod:'浏览器当前页面；未传输密码、Cookie或登录令牌'};
}
