import template from './template.html?raw';
import type { RondelContent } from './content';
const escape = (s:string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function renderRondel(content:RondelContent){
 const json=JSON.stringify(content).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return template.replace('<html lang="en">','<html lang="zh-CN">').replace('</head>','<link rel="stylesheet" href="/rondel-assets/responsive.css"><script defer src="/rondel-assets/responsive.js"></script></head>').replace(/@@RONDEL:(t\d+)@@/g,(_,key)=>escape((content.texts as Record<string,string>)[key]??'')).replace('<!--RONDEL_CONTENT-->',`<script>window.RONDEL_CONTENT=${json};window.RONDEL_COPY=function(k,f){return window.RONDEL_CONTENT.texts[k]??f;};</script>`);
}
