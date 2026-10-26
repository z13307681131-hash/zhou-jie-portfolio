import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'pages-dist');
const base=process.env.PAGES_BASE||'/zhou-jie-portfolio/';
const files=execFileSync('git',['ls-files','-z','--','public'],{cwd:root}).toString().split('\0').filter(Boolean);
for(const file of files){const dest=path.join(out,file.slice('public/'.length));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);}
const content=JSON.parse(fs.readFileSync(path.join(root,'github-pages/content/rondel.json'),'utf8'));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const json=JSON.stringify(content).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
let html=fs.readFileSync(path.join(root,'lib/rondel/template.html'),'utf8')
 .replace('<html lang="en">','<html lang="zh-CN">')
 .replace('</head>','<link rel="stylesheet" href="/rondel-assets/responsive.css"><script defer src="/rondel-assets/responsive.js"></script></head>')
 .replace(/@@RONDEL:(t\d+)@@/g,(_,k)=>esc(content.texts[k]||''))
 .replace('<!--RONDEL_CONTENT-->',`<script>window.RONDEL_CONTENT=${json};window.RONDEL_COPY=function(k,f){return window.RONDEL_CONTENT.texts[k]??f;};</script>`)
 .replace(/(["'`])\/(assets\/|work\/|rondel-assets\/|media\/)/g,(_,q,part)=>q+base+part)
 .replace(/<link[^>]+rel="preconnect"[^>]*>/g,'');
fs.mkdirSync(path.join(out,'rondel'),{recursive:true});
fs.writeFileSync(path.join(out,'rondel/index.html'),html);
// Public JS files are copied without Vite transforms; fix their local asset URLs too.
for (const name of fs.readdirSync(path.join(out,'rondel-assets'))) {
 if (!/\.(js|css)$/.test(name)) continue;
 const file=path.join(out,'rondel-assets',name);
 fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/(["'`])\/rondel-assets\//g,(_,q)=>q+base+'rondel-assets/'));
}
const index=fs.readFileSync(path.join(out,'index.html'),'utf8');
const projects=JSON.parse(fs.readFileSync(path.join(root,'github-pages/content/projects.json'),'utf8'));
const slugs=projects.map(p=>p.slug);
for(const slug of [...slugs,'little-yellow-dog']) {
 const dir=path.join(out,'work',slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),index);
}
fs.writeFileSync(path.join(out,'404.html'),index);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Pages ready: ${slugs.length} project routes, home, Rondel, local assets.`);
