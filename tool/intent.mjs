export const FABRIC_FEATURES=[
 {id:'knitted',group:'针织与组织',label:'针织',match:/针织|\bknitted\b|\bknit\b(?!wear)/i,terms:['knit','knitted'],technical:true},
 {id:'woven',group:'针织与组织',label:'梭织',match:/梭织|\bwoven\b/i,terms:['woven'],technical:true},
 {id:'texture',label:'肌理',match:/肌理|纹理|凹凸|textured|texture/i,terms:['textured','textured fabric']},
 {id:'jacquard',label:'提花',match:/提花|jacquard|brocade/i,terms:['jacquard','brocade'],technical:true},
 {id:'openwork',label:'镂空',match:/镂空|透孔|openwork|open[ -]knit|pointelle/i,terms:['openwork','pointelle','open knit']},
 {id:'crochet',label:'钩编',match:/钩编|钩织|勾编|勾织|crochet/i,terms:['crochet','crocheted'],technical:true},
 {id:'ribbed',label:'罗纹',match:/罗纹|坑条|ribbed|rib knit/i,terms:['ribbed','rib knit']},
 {id:'cable',label:'绞花',match:/绞花|麻花|cable knit/i,terms:['cable knit','cable']},
 {id:'lace',label:'蕾丝',match:/蕾丝|lace\b/i,terms:['lace']},
 {id:'eyelet',label:'绣孔',match:/绣孔|鸡眼绣|英式刺绣|eyelet|broderie anglaise/i,terms:['eyelet','broderie anglaise'],technical:true},
 {id:'crinkle',label:'绉感',match:/绉感|绉布|褶皱肌理|crinkle|crepe\b/i,terms:['crinkle','crepe']},
 {id:'sweaterlike',group:'针织与组织',label:'仿毛衫',match:/仿毛衫|毛衫感|毛衣感|sweater[ -]?(?:look|like|knit)|sweater jersey/i,terms:['sweater knit','sweater jersey'],allowFaux:true,hint:'按毛衫外观和针织质感查找，不表示含羊毛'},
 {id:'plain',group:'针织与组织',label:'平纹',match:/平纹|plain (?:weave|knit|jersey)/i,terms:['plain jersey','plain weave'],technical:true,hint:'涵盖平纹针织/梭织；需要更精确时输入完整组织名'},
 {id:'jersey',group:'针织与组织',label:'汗布',match:/汗布|单面针织|single jersey/i,terms:['single jersey','jersey'],technical:true},
 {id:'interlock',group:'针织与组织',label:'双面布',match:/双面布|双面针织|interlock|double knit/i,terms:['interlock','double knit'],technical:true},
 {id:'ponte',group:'针织与组织',label:'罗马布',match:/罗马布|罗马针织|ponte/i,terms:['ponte','ponte knit'],technical:true},
 {id:'pique',group:'针织与组织',label:'珠地',match:/珠地|珠地网眼|pique|piqué/i,terms:['pique','piqué'],technical:true},
 {id:'waffle',group:'针织与组织',label:'华夫格',match:/华夫|蜂巢|waffle|honeycomb/i,terms:['waffle','honeycomb']},
 {id:'twill',group:'针织与组织',label:'斜纹',match:/斜纹|twill/i,terms:['twill'],technical:true},
 {id:'herringbone',group:'针织与组织',label:'人字纹',match:/人字纹|herringbone/i,terms:['herringbone']},
 {id:'tweed',group:'针织与组织',label:'粗花呢',match:/粗花呢|小香风面料|tweed/i,terms:['tweed'],technical:true},
 {id:'boucle',group:'绒感与表面',label:'圈圈纱',match:/圈圈纱|圈圈呢|boucl[eé]/i,terms:['boucle','bouclé']},
 {id:'velvet',group:'绒感与表面',label:'丝绒',match:/丝绒|天鹅绒|金丝绒|velvet|velour/i,terms:['velvet','velour'],technical:true,hint:'丝绒不等于真丝成分'},
 {id:'corduroy',group:'绒感与表面',label:'灯芯绒',match:/灯芯绒|条绒|corduroy/i,terms:['corduroy'],technical:true,hint:'区分罗纹坑条与灯芯绒绒条'},
 {id:'chenille',group:'绒感与表面',label:'雪尼尔',match:/雪尼尔|chenille/i,terms:['chenille'],technical:true},
 {id:'terry',group:'绒感与表面',label:'毛圈',match:/毛圈|毛巾布|terry|towelling|toweling/i,terms:['terry','towelling'],technical:true},
 {id:'fleece',group:'绒感与表面',label:'摇粒绒',match:/摇粒绒|polar fleece/i,terms:['polar fleece','fleece'],technical:true},
 {id:'brushed',group:'绒感与表面',label:'磨毛',match:/磨毛|拉绒|起绒|brushed|brushing/i,terms:['brushed'],technical:true},
 {id:'flannel',group:'绒感与表面',label:'法兰绒',match:/法兰绒|flannel/i,terms:['flannel'],technical:true},
 {id:'suede',group:'绒感与表面',label:'麂皮感',match:/麂皮|绒面革|suede/i,terms:['suede','faux suede'],hint:'只确认绒面外观，不认定为动物皮革'},
 {id:'fauxfur',group:'绒感与表面',label:'仿皮草',match:/仿皮草|人造毛皮|faux fur|fake fur/i,terms:['faux fur'],technical:true,allowFaux:true},
 {id:'sherpa',group:'绒感与表面',label:'羊羔绒',match:/羊羔绒|泰迪绒|sherpa|teddy fleece/i,terms:['sherpa','teddy fleece'],hint:'羊羔绒外观不等于羊毛成分'},
 {id:'seersucker',group:'肌理与垂感',label:'泡泡纱',match:/泡泡纱|seersucker/i,terms:['seersucker'],technical:true},
 {id:'satin',group:'肌理与垂感',label:'缎面',match:/缎面|色丁|satin|sateen/i,terms:['satin','sateen'],hint:'缎面外观不等于真丝'},
 {id:'chiffon',group:'肌理与垂感',label:'雪纺',match:/雪纺|chiffon/i,terms:['chiffon'],technical:true},
 {id:'organza',group:'肌理与垂感',label:'欧根纱',match:/欧根纱|organza/i,terms:['organza'],technical:true},
 {id:'tulle',group:'肌理与垂感',label:'薄纱',match:/薄纱|网纱|tulle/i,terms:['tulle','mesh']},
 {id:'mesh',group:'肌理与垂感',label:'网眼',match:/网眼|网布|mesh/i,terms:['mesh']},
 {id:'denim',group:'肌理与垂感',label:'牛仔布',match:/牛仔(?!裤)|denim/i,terms:['denim'],technical:true},
 {id:'poplin',group:'肌理与垂感',label:'府绸',match:/府绸|poplin/i,terms:['poplin'],technical:true},
 {id:'oxford',group:'肌理与垂感',label:'牛津布',match:/牛津布|oxford fabric|oxford cloth/i,terms:['oxford'],technical:true},
 {id:'canvas',group:'肌理与垂感',label:'帆布',match:/帆布|canvas/i,terms:['canvas'],technical:true},
 {id:'scuba',group:'肌理与垂感',label:'空气层',match:/空气层|太空棉|scuba|spacer fabric/i,terms:['scuba','spacer fabric'],technical:true},
 {id:'stripe',group:'花型',label:'条纹',match:/条纹|横条|竖条|海魂条|striped|stripes?|breton/i,terms:['striped','stripe'],hint:'色彩或图案条纹，不等于罗纹凹凸坑条'},
 {id:'check',group:'花型',label:'格纹',match:/格纹|格子|格仔|plaid|checked|check pattern/i,terms:['plaid','checked']},
 {id:'gingham',group:'花型',label:'维希格',match:/维希格|gingham/i,terms:['gingham']},
 {id:'houndstooth',group:'花型',label:'千鸟格',match:/千鸟格|犬牙纹|houndstooth/i,terms:['houndstooth']},
 {id:'floral',group:'花型',label:'碎花',match:/碎花|花卉|花朵图案|floral/i,terms:['floral']},
 {id:'polkadot',group:'花型',label:'波点',match:/波点|圆点图案|polka dot/i,terms:['polka dot']},
 {id:'leopard',group:'花型',label:'豹纹',match:/豹纹|leopard/i,terms:['leopard']},
 {id:'zebra',group:'花型',label:'斑马纹',match:/斑马纹|zebra/i,terms:['zebra']},
 {id:'paisley',group:'花型',label:'佩斯利',match:/佩斯利|腰果花|paisley/i,terms:['paisley']},
 {id:'print',group:'工艺',label:'印花',match:/印花|printed|print fabric/i,terms:['printed']},
 {id:'embroidery',group:'工艺',label:'刺绣',match:/刺绣|绣花|embroider/i,terms:['embroidered'],technical:true},
 {id:'pleated',group:'工艺',label:'压褶',match:/压褶|百褶|风琴褶|pleated|pliss[eé]/i,terms:['pleated','plisse']},
 {id:'smocked',group:'工艺',label:'抽褶',match:/抽褶|橡筋褶|smock|shirred|shirring/i,terms:['smocked','shirred']},
 {id:'quilted',group:'工艺',label:'绗缝',match:/绗缝|绗棉|quilte/i,terms:['quilted']},
 {id:'burnout',group:'工艺',label:'烂花',match:/烂花|burnout|devor[eé]/i,terms:['burnout','devore'],technical:true},
 {id:'flocked',group:'工艺',label:'植绒',match:/植绒|flock/i,terms:['flocked'],technical:true},
 {id:'sequin',group:'工艺',label:'亮片',match:/亮片|珠片|sequin/i,terms:['sequin']},
 {id:'metallic',group:'工艺',label:'金属光泽',match:/金属光泽|金银丝|lurex|metallic|lam[eé]\b/i,terms:['metallic','lurex']},
 {id:'tiedye',group:'工艺',label:'扎染',match:/扎染|tie[ -]dye/i,terms:['tie dye'],technical:true},
 {id:'washed',group:'工艺',label:'水洗做旧',match:/水洗|做旧|acid wash|washed|distressed/i,terms:['washed','acid wash'],technical:true},
 {id:'cotton',group:'纤维成分',label:'棉',match:/(?<!仿)(?<!太空)棉(?!感|服|衣|花糖)|\bcotton\b/i,terms:['cotton'],sourceOnly:true,technical:true},
 {id:'linen',group:'纤维成分',label:'亚麻',match:/(?<!仿)亚麻(?!感)|\blinen\b(?![ -]+(?:look|effect|like))/i,terms:['linen'],sourceOnly:true,technical:true},
 {id:'wool',group:'纤维成分',label:'羊毛',match:/(?<!仿)羊毛(?!感)|\bwool\b(?![ -]+(?:look|effect|like))/i,terms:['wool'],sourceOnly:true,technical:true},
 {id:'cashmere',group:'纤维成分',label:'羊绒',match:/(?<!仿)羊绒(?!感)|\bcashmere\b(?![ -]+(?:look|effect|like))/i,terms:['cashmere'],sourceOnly:true,technical:true},
 {id:'silk',group:'纤维成分',label:'真丝',match:/(?<!仿)真丝(?!感)|\bsilk\b(?![ -]+(?:look|effect|like))/i,terms:['silk'],sourceOnly:true,technical:true},
 {id:'viscose',group:'纤维成分',label:'粘胶',match:/粘胶|黏胶|人造丝|viscose|rayon/i,terms:['viscose','rayon'],sourceOnly:true,technical:true},
 {id:'lyocell',group:'纤维成分',label:'莱赛尔',match:/莱赛尔|天丝|lyocell|tencel/i,terms:['lyocell','tencel'],sourceOnly:true,technical:true},
 {id:'modal',group:'纤维成分',label:'莫代尔',match:/莫代尔|modal/i,terms:['modal'],sourceOnly:true,technical:true},
 {id:'polyester',group:'纤维成分',label:'涤纶',match:/涤纶|聚酯纤维|polyester/i,terms:['polyester'],sourceOnly:true,technical:true},
 {id:'nylon',group:'纤维成分',label:'锦纶',match:/锦纶|尼龙|nylon|polyamide/i,terms:['nylon','polyamide'],sourceOnly:true,technical:true},
 {id:'acrylic',group:'纤维成分',label:'腈纶',match:/腈纶|acrylic/i,terms:['acrylic'],sourceOnly:true,technical:true},
 {id:'elastane',group:'纤维成分',label:'氨纶',match:/氨纶|spandex|elastane/i,terms:['elastane','spandex'],sourceOnly:true,technical:true},
 {id:'stretch',group:'性能与手感',label:'弹力',match:/弹力|弹性|stretch/i,terms:['stretch'],sourceOnly:true,technical:true},
 {id:'linenlook',group:'性能与手感',label:'亚麻感',match:/仿亚麻|亚麻感|linen[ -](?:look|effect|like)/i,terms:['linen look'],allowFaux:true,hint:'只找亚麻外观，不认定亚麻成分'},
 {id:'woollook',group:'性能与手感',label:'羊毛感',match:/仿羊毛|羊毛感|wool[ -](?:look|effect|like)/i,terms:['wool look'],allowFaux:true},
 {id:'silklike',group:'性能与手感',label:'真丝感',match:/仿真丝|真丝感|silk[ -](?:look|effect|like)/i,terms:['silk like'],allowFaux:true},
 {id:'soft',group:'性能与手感',label:'柔软',match:/柔软|软糯|soft touch|soft fabric/i,terms:['soft touch','soft'],sourceOnly:true,technical:true,hint:'手感无法凭图片确认，依赖来源说明'},
 {id:'drape',group:'性能与手感',label:'垂感',match:/垂感|垂坠|drapey|fluid fabric/i,terms:['drapey','fluid']},
 {id:'waterproof',group:'性能与手感',label:'防水',match:/防水|waterproof/i,terms:['waterproof'],sourceOnly:true,technical:true},
 {id:'breathable',group:'性能与手感',label:'透气',match:/透气|breathable/i,terms:['breathable'],sourceOnly:true,technical:true}
];
export function parseSearchIntent(value,group='女装'){
 const query=String(value||'').trim();const positive=query.replace(/(?:不要|排除|不含|别找|不需要|exclude|without)\s*[^，,。；;\n]+/gi,' ').toLowerCase();
 let category='any',label='未限定品类',terms=[];
 const set=(id,name,words)=>{category=id;label=name;terms=words};
 if(/吊带(?:上衣|背心)|(?:cami|camisole|strappy)\s+top/.test(positive))set('cami_top','吊带上衣',['cami','camisole','tank top']);
 else if(/吊带(?:连衣)?裙|(?:slip|cami|camisole|strappy)\s+dress/.test(positive))set('slip_dress','吊带连衣裙',['slip dress','cami dress']);
 else if(/吊带|\bcamisole\b|\bcami\b/.test(positive))set('cami_top','吊带上衣',group==='男装'?['tank top','singlet']:['cami','camisole','tank top']);
 else if(/连衣裙|\bdress(?:es)?\b/.test(positive))set('dress','连衣裙',['dress']);
 else if(/半身裙|短裙|\bskirt\b/.test(positive))set('skirt','半身裙',['skirt']);
 else if((/衬衫|\bblouse\b|\bshirt\b/.test(positive))&&!/\bt[ -]?shirt\b/.test(positive))set('shirt','衬衫',['shirt','blouse']);
 else if(/t恤|\bt[ -]?shirt\b|\btee\b/.test(positive))set('tee','T恤',['tee']);
 else if(/牛仔裤|\bjeans\b/.test(positive))set('jeans','牛仔裤',['jeans']);
 else if(/短裤|\bshorts\b/.test(positive))set('shorts','短裤',['shorts']);
 else if(/长裤|裤装|\bpants\b|\btrousers\b/.test(positive))set('pants','长裤',['pants']);
 else if(/开衫|\bcardigan\b/.test(positive))set('cardigan','开衫',['cardigan']);
 else if(/毛衣|\bsweater\b/.test(positive))set('sweater','毛衣',['sweater']);
 else if(/针织衫|\bknitwear\b/.test(positive))set('knitwear','针织',['knit']);
 else if(/大衣|\bcoat\b/.test(positive))set('coat','大衣',['coat']);
 else if(/外套|夹克|\bjacket\b/.test(positive))set('jacket','外套',['jacket']);
 else if(/背心|\btank\b|\bsinglet\b/.test(positive))set('tank','背心',['tank top']);
 else if(/上衣|\btop\b/.test(positive))set('top','上衣',['top']);
 else if(/卫衣|\bhoodie\b|\bsweatshirt\b/.test(positive))set('hoodie','卫衣',['hoodie']);
 const features=FABRIC_FEATURES.filter(f=>f.match.test(positive)).map(f=>f.id);
 const material=features.find(id=>['linen','wool','cashmere','silk','cotton'].includes(id))||'';
 if(!terms.length){terms=(positive.match(/[a-z]{3,}/g)||[]).filter(t=>!['women','men','kids','find','some','please'].includes(t)).slice(0,4);if(material&&!terms.includes(material))terms.unshift(material)}
 const negative=[...query.matchAll(/(?:不要|排除|不含|别找|不需要|exclude|without)\s*([^，,。；;\n]+)/gi)].map(m=>m[1]).join(' ');
 const excludedFeatures=FABRIC_FEATURES.filter(f=>f.match.test(negative)).map(f=>f.id);
 if(new Set([...features,...excludedFeatures]).size>6)throw Error('一次最多组合6个面料条件，请分批检索，以便逐项准确核对');
 if(!terms.length&&!features.length)throw Error('请写明品类或面料特征，例如“钩编吊带”“提花”“镂空针织”');
 const base=(features.length&&category==='any'?[]:terms).map(t=>material&&!t.includes(material)?t+' '+material:t);
 const defs=features.filter(id=>category==='any'||id!==material).map(id=>FABRIC_FEATURES.find(f=>f.id===id));
 const searches=defs.length?[...new Set([defs.map(f=>f.terms[0]).join(' ')+' '+(base[0]||''),...defs.map(f=>f.terms[0]+' '+(base[0]||'')),...defs.flatMap(f=>f.terms.slice(1).map(t=>t+' '+(base[0]||'')))].map(t=>t.trim()))].slice(0,4):base;
 return {query,category,label,material,features,excludedFeatures,searches,primary:searches[0]};
}
export function categoryGate(product,intent){
 const title=String(product.title||'').toLowerCase();const type=String(product.productType||product.type||'').toLowerCase();let path='';try{path=decodeURIComponent(new URL(product.url).pathname).replaceAll('-',' ')}catch{}
 const identity=[title,type,path].join(' ');const dress=/\bdress(?:es)?\b|\bgown\b|连衣裙|吊带裙|裙装/.test(identity),skirt=/\bskirt(?:s)?\b|半身裙|短裙|长裙/.test(identity),onepiece=/\bjumpsuit\b|\bromper\b|\bbodysuit\b|连体|连衣裤/.test(identity);
 const tee=/\btee\b|\bt[ -]?shirt\b|t恤/.test(identity),bottom=/\bjeans\b|\bpants\b|\btrousers\b|\bshorts\b|裤/.test(identity);
 const cami=/\bcami\b|\bcamisole\b|\bsinglet\b|\btank(?:\s+top)?\b|\bstrappy\b|\bspaghetti\b|吊带|细肩带/.test(identity);
 const underwear=/\bbra\b|\bbikini\b|\bbralette\b|\bswim|文胸|比基尼|泳衣|内衣/.test(identity);
 let accept=true,reason='';
 if(['cami_top','tank','top'].includes(intent.category)){
  if(dress||skirt||onepiece||bottom||underwear){accept=false;reason='上衣需求排除裙装、连体、下装和内衣'}
  else if(intent.category==='cami_top'&&!cami){accept=false;reason='商品名称、品类或链接未确认是吊带上衣'}
  else if(intent.category==='tank'&&!/tank|singlet|vest|背心/.test(identity)){accept=false;reason='未确认是背心'}
 }
 if(intent.category==='slip_dress'&&(!dress||!cami&&!/\bslip\b/.test(identity))){accept=false;reason='未确认是吊带连衣裙'}
 if(intent.category==='dress'&&!dress){accept=false;reason='不是连衣裙'}
 if(intent.category==='skirt'&&(!skirt||dress)){accept=false;reason='不是半身裙'}
 if(intent.category==='shirt'&&(tee||dress||skirt||onepiece||bottom||!/\bshirt\b|\bblouse\b|衬衫/.test(identity))){accept=false;reason='不是衬衫，已排除T恤、裙装和下装'}
 if(intent.category==='tee'&&(!tee||dress||onepiece)){accept=false;reason='不是T恤'}
 if(intent.category==='jeans'&&!/\bjeans\b|牛仔裤/.test(identity)){accept=false;reason='不是牛仔裤'}
 if(intent.category==='shorts'&&!/\bshorts\b|短裤/.test(identity)){accept=false;reason='不是短裤'}
 if(intent.category==='pants'&&(!bottom||/\bshorts\b/.test(identity))){accept=false;reason='不是长裤'}
 if(intent.category==='cardigan'&&!/cardigan|开衫/.test(identity)){accept=false;reason='不是开衫'}
 if(intent.category==='sweater'&&!/sweater|jumper|毛衣/.test(identity)){accept=false;reason='不是毛衣'}
 if(intent.category==='coat'&&!/\bcoat\b|大衣/.test(identity)){accept=false;reason='不是大衣'}
 if(intent.category==='jacket'&&!/jacket|blazer|外套|夹克/.test(identity)){accept=false;reason='不是外套'}
 if(intent.category==='hoodie'&&!/hoodie|sweatshirt|卫衣/.test(identity)){accept=false;reason='不是卫衣'}
 return {accept,reason:reason||'品类文字匹配：'+intent.label};
}
