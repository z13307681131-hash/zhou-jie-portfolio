import {personalizeMusic} from './rondel-music.mjs';
import { personalizeBadge } from './rondel-badge.mjs';
import fs from 'node:fs';
import {parse} from 'acorn';
let html=fs.readFileSync('vendor/rondel/original.html','utf8');
html=html.replace(/<script id="aura-preview-performance-controller">[\s\S]*?<\/script>/,'');
const replacements=JSON.parse(fs.readFileSync('vendor/rondel/assets.json','utf8'));
for(const [url,path] of Object.entries(replacements)) html=html.split(url).join(path);
html=html.replace(/https:\/\/fonts.googleapis.com\/css2[^"]+/,'/rondel-assets/fonts.css').replace('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/','/rondel-assets/three/addons/').replace('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js','/rondel-assets/ogl.js');
const stableIds=JSON.parse(fs.readFileSync('vendor/rondel/field-ids.json','utf8'));let nextId=Math.max(0,...Object.values(stableIds).map(k=>Number(k.slice(1))))+1;
const fields=[], index=new Map();
function field(value,group){if(index.has(value))return index.get(value);const key=stableIds[value]||('t'+String(nextId++).padStart(3,'0'));stableIds[value]=key;fields.push({key,group,original:value});index.set(value,key);return key;}
const art={}; for(const m of html.matchAll(/(label_\w+): '(\/rondel-assets\/asset-\d+\.jpg)'/g))art[m[1]]=m[2];
const recSource=html.match(/const RECORDS = \[([\s\S]*?)\n\];/)[1];
const records=[...recSource.matchAll(/\{ cat: '([^']+)', title: '([^']+)', artist: '([^']+)', year: (\d+), side: '([^']+)', art: (null|'[^']+')/g)].map(m=>({cat:m[1],title:m[2],artist:m[3],year:+m[4],side:m[5],imageUrl:art[m[6].replaceAll("'",'')]||'',printLabel:true}));
const rangeSrc=JSON.parse(html.match(/const RANGE_SRC = (\{[^\n]+\});/)[1]);
const range=[...html.matchAll(/\{ key: '([^']+)', title: '([^']+)', subtitle: '([^']+)', alt: '([^']+)' \}/g)].map(m=>({key:m[1],title:m[2],subtitle:m[3],imageUrl:rangeSrc[m[1]]}));
// Tokenize the document without reserializing it, preserving its markup and exact styles.
let group='导航与品牌';let stack=[];
const groupMap={stage:'背景大字',nav:'导航与品牌',hero:'首页',explode:'拆解场景',film:'细节介绍',slide:'横向标语',records:'唱片章节',range:'唱机系列',models:'材质选择',outro:'收尾场景',foot:'页脚',loader:'加载界面'};
const ignoredIds=new Set(['recTitle','recArtist','recCat','recNowTitle','recNowArtist','ftWord','loaderPercent','recIdx','filmCapNum','railNum']);
html=html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]+>|[^<]+/gi,(token)=>{
 if(token.startsWith('<!--')||/^<(script|style)\b/i.test(token))return token;
 if(token.startsWith('<')){
  if(/^<\//.test(token)){const tag=token.match(/^<\/([\w-]+)/)?.[1];let i=stack.map(x=>x.tag).lastIndexOf(tag);if(i>=0)stack.length=i;return token;}
  const tag=token.match(/^<([\w-]+)/)?.[1];const id=token.match(/\bid="([^"]+)"/)?.[1];if(groupMap[id])group=groupMap[id];
  const skip=stack.some(x=>x.skip)||tag==='svg'||ignoredIds.has(id);
  if(tag&&!['meta','link','img','br','hr','input'].includes(tag)&&!token.endsWith('/>'))stack.push({tag,skip});
  if(id==='heroDepth')token=token.replace('data-text="RONDEL"',`data-text="@@RONDEL:${field('RONDEL','导航与品牌')}@@"`);
  if(!skip)token=token.replace(/(aria-label|title)="([^"]+)"/g,(m,a,v)=>`${a}="@@RONDEL:${field(v,group)}@@"`);
  return token;
 }
 if(stack.some(x=>x.skip))return token;
 const trimmed=token.trim();if(!trimmed||!/[A-Za-zÀ-ž€]/.test(trimmed))return token;
 const decoded=trimmed.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"');
 return token.replace(trimmed,`@@RONDEL:${field(decoded,group)}@@`);
});
const dynamic=new Set(['black walnut','ink lacquer','pale oak','The object','The pressings','The range','The lineup','The whole object','Platter','Stylus','Tonearm','Controls','Plinth','Rondel One · walnut, aluminium, steel','300 mm machined aluminium · the record at 33⅓','nude elliptical diamond · 1.8 g on the groove','228 mm gimbal · counterweight on a thread','33⅓ / 45 · start / stop · two lamps','one walnut board, quarter-sawn · four coats of oil','Keep scrolling · it goes on the deck','Scroll to browse the series','Dropping the needle','Stopped','Now playing','Playing · sound off','Sound on','Stop','Play','Playing','Listen','Sound off','Sound is on','Turn sound on','Stop the record','Play the record','Mute audio','Turn the sound on','Ready to play','The 3D view is unavailable. You can still browse the page.','Start','Tonearm · click to lift & return','Tonearm · click to cue','Record · click to stop','Record · click to play','RONDEL PRESSINGS · SERIES ONE']);
html=html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,(whole,open,code,close)=>{
 if(!code.trim()||open.includes('importmap'))return whole;
 const edits=[];let ast;try{ast=parse(code,{ecmaVersion:'latest',sourceType:open.includes('module')?'module':'script'});}catch(e){throw new Error('Template script parse failed: '+e.message)}
 function walk(node){if(!node||typeof node!=='object')return;if(node.type==='Literal'&&dynamic.has(node.value)){const key=field(node.value,'交互提示');edits.push([node.start,node.end,`window.RONDEL_COPY('${key}',${JSON.stringify(node.value)})`]);}for(const [k,v]of Object.entries(node)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
 walk(ast);for(const [a,b,t]of edits.sort((x,y)=>y[0]-x[0]))code=code.slice(0,a)+t+code.slice(b);return open+code+close;
});
html=html.replace('if (!src || src.length < 64)','if (!src)');
html=html.replace('const LABEL_PX =',`RECORDS.forEach((rec,i)=>{const item=window.RONDEL_CONTENT.records[i]; if(!item)return;Object.assign(rec,{title:item.title,artist:item.artist,cat:item.cat,year:item.year,side:item.side,printLabel:item.printLabel});if(item.imageUrl){const key='custom_'+i;LABEL_ART[key]=item.imageUrl;rec.art=key;delete rec.draw;}});\nconst LABEL_PX =`);
// Preserve the fixed original scroll choreography even when record six is renamed.
html=html.replace("RECORDS.findIndex(r => r.title === 'Four Minutes Left')",'5');
html=html.replace("// the series' print","if (rec.printLabel !== false) {\n// the series' print").replace('  x.shadowBlur = 0;\n  // the spindle','  }\n  x.shadowBlur = 0;\n  // the spindle');
html=html.replace('].map(it => Object.assign(it, { src: RANGE_SRC[it.key] }));',`].map((it,i) => {const custom=window.RONDEL_CONTENT.range[i]; return Object.assign(it,custom?{title:custom.title,subtitle:custom.subtitle}: {},{src:custom?.imageUrl||RANGE_SRC[it.key]});});`);
html=html.replace('labelMap: "/rondel-assets/asset-14.jpg"','labelMap: (window.RONDEL_CONTENT.heroRecordImage || "/rondel-assets/asset-14.jpg")');
const brand=field('RONDEL','导航与品牌');
html=html.replace("const depthStage =",`{const label=document.querySelector('.ld-label img');if(window.RONDEL_CONTENT.heroRecordImage)label.src=window.RONDEL_CONTENT.heroRecordImage;const word=window.RONDEL_COPY('${brand}','RONDEL');if(word!=='RONDEL'){const foot=document.querySelector('#ftWord');foot.replaceChildren();for(const char of word){const l=document.createElement('span');l.className='ftl';const s=document.createElement('span');s.className='depth-stage ft-stage';const f=document.createElement('span');f.className='depth-face';f.textContent=char;s.append(f);l.append(s);foot.append(l);}}}\nconst depthStage =`);
html=html.replace('</head>','<!--RONDEL_CONTENT--></head>');
fs.mkdirSync('lib/rondel',{recursive:true});
fs.writeFileSync('lib/rondel/template.html',personalizeMusic(personalizeBadge(html)));fs.writeFileSync('lib/rondel/fields.json',JSON.stringify(fields,null,2));fs.writeFileSync('lib/rondel/defaults.json',JSON.stringify({texts:Object.fromEntries(fields.map(f=>[f.key,f.original])),records,range,heroRecordImage:''},null,2));
console.log({fields:fields.length,records:records.length,range:range.length});
if(records.length!==10||range.length!==6)throw new Error('Original data extraction mismatch');

fs.writeFileSync('vendor/rondel/field-ids.json',JSON.stringify(stableIds,null,2));
