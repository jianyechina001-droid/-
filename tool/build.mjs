import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {FABRIC_FEATURES} from './intent.mjs';
const root=path.resolve(import.meta.dirname,'..');
let html=await readFile(path.join(root,'tool/index.html'),'utf8');const catalog=FABRIC_FEATURES.map(({id,label,group,hint})=>({id,label,group:group||({texture:'肌理与垂感',jacquard:'针织与组织',openwork:'针织与组织',crochet:'针织与组织',ribbed:'针织与组织',cable:'针织与组织',lace:'肌理与垂感',eyelet:'工艺',crinkle:'肌理与垂感'})[id]||'其他',hint:hint||''}));
const client='const FABRIC_CATALOG='+JSON.stringify(catalog)+';\n'+await readFile(path.join(root,'tool/client.js'),'utf8')+'\n'+await readFile(path.join(root,'tool/client-additions.js'),'utf8')+'\n'+await readFile(path.join(root,'tool/client-ai.js'),'utf8');html=html.replace('// APP_SCRIPT',()=>'(function(){\n'+client+'\n})();');
let core='';for(const file of ['intent.mjs','core.mjs','registry.mjs','quality.mjs','engine.mjs','ai-queue.mjs','jobs.mjs','memberships.mjs'])core+='\n'+(await readFile(path.join(root,'tool',file),'utf8')).replace(/^import .*?;\r?\n/gm,'').replaceAll('export ','');
const server=(await readFile(path.join(root,'tool/server.mjs'),'utf8')).replace(/^import .*?;\r?\n/gm,'');
await mkdir(path.join(root,'dist/server'),{recursive:true});await mkdir(path.join(root,'dist/.openai'),{recursive:true});
await writeFile(path.join(root,'dist/server/index.js'),'const HTML='+JSON.stringify(html)+';\n'+core+'\n'+server);
await writeFile(path.join(root,'dist/.openai/hosting.json'),await readFile(path.join(root,'.openai/hosting.json')));
console.log('Built self-contained Worker: dist/server/index.js');
// Export the exact same UI; file:// cannot run the server or GPU models.
const fileEntry=`if(location.protocol==='file:'){
document.body.innerHTML='<main style="max-width:680px;margin:12vh auto;padding:32px;font:16px/1.8 system-ui;color:#203b35"><h1>款研 · HTML 版</h1><p>完整页面已包含在这个 HTML 中。搜索、AI 看图和资料保存由你电脑上的本地引擎提供。</p><p>首次使用或重启电脑后，双击同目录的 <b>启动HTML版.cmd</b>，会自动启动并打开完整页面。</p><p><a style="display:inline-block;padding:12px 24px;background:#203b35;color:white;border-radius:10px" href="http://127.0.0.1:4175/款研.html">引擎已启动，进入工具 →</a></p><p style="font-size:13px;color:#64736c">浏览器不能直接启动本地程序。请保留现有项目、模型和资料目录；会员平台和品牌的现有接入状态沿用原版。</p></main>';
}else{(function(){\n${client}\n})();}`;
const standalone= (await readFile(path.join(root,'tool/index.html'),'utf8')).replace('// APP_SCRIPT',()=>fileEntry);
await writeFile(path.join(root,'款研.html'),standalone);
await mkdir(path.join(root,'outputs/html版'),{recursive:true});
await writeFile(path.join(root,'outputs/html版/款研.html'),standalone);
await writeFile(path.join(root,'outputs/面料关键词词库.md'),'# 面料关键词词库\n\n可单独按面料搜索，无需填写款式。多条件同时核对，每次最多6项；来源不清楚的技术属性进入待复核。\n\n'+[...new Set(catalog.map(f=>f.group))].map(group=>'## '+group+'\n\n'+catalog.filter(f=>f.group===group).map(f=>'- '+f.label+'：'+FABRIC_FEATURES.find(d=>d.id===f.id).terms.join(' / ')+(f.hint?'。'+f.hint:'')).join('\n')).join('\n\n')+'\n');
const launcher=await readFile(path.join(root,'启动选款工具.cmd'),'utf8');
await writeFile(path.join(root,'启动HTML版.cmd'),launcher.replace("http://127.0.0.1:4175'","http://127.0.0.1:4175/款研.html'"));
await writeFile(path.join(root,'outputs/html版/使用说明.txt'),'完整HTML页面：款研.html\r\n推荐启动：本文件夹\\启动HTML版.cmd\r\nHTML版与本地原版共用界面、接口、模型和.local-data资料，不复制模型或会员凭证。\r\n不能脱离原项目单独运行搜索和本地AI；这不是纯离线的单文件应用。\r\n现有功能与限制保持一致：WGSN/POP入口不等于已完成会员自动接入，品牌搜索以实际连接结果为准。\r\n');
console.log('Exported HTML edition: 款研.html + 启动HTML版.cmd');
await import('./build-browser-helper.mjs');
