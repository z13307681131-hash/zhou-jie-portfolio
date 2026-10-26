"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
const editions = [
 {id:'character',number:'01',title:'让老字号，有一个新面孔。',label:'角色设定',en:'CHARACTER DESIGN',copy:'从角色表情到三视图，建立统一的形象语言。'},
 {id:'collectibles',number:'02',title:'把糕点时光，变成收藏。',label:'收藏玩偶',en:'COLLECTIBLE SERIES',copy:'七款形象，延展同一个角色的不同姿态。'},
 {id:'packaging',number:'03',title:'从一只盲盒，到一份礼物。',label:'盲盒包装',en:'PACKAGING SYSTEM',copy:'主视觉、六面包装、陈列与开盒配套，构成完整的包装体验。'},
 {id:'merch',number:'04',title:'让角色走进日常。',label:'周边与物料',en:'EVERYDAY & RETAIL',copy:'随身收藏、文具纸品、生活周边与门店传播。'},
 {id:'more',number:'05',title:'更多设计延展',label:'更多作品',en:'FURTHER EXPLORATIONS',copy:''},
];
const art:Record<string,{chapter:string;caption:string;wide?:boolean;width?:number;height?:number}>={
 'character.webp':{chapter:'character',caption:'角色设定 / 造型、表情与色彩',wide:true},
 'three-views.webp':{width:1774,height:887,chapter:'character',caption:'三视图 / 正面 · 侧面 · 背面',wide:true},
 'collectibles.webp':{chapter:'collectibles',caption:'糕点时光 / 七款收藏玩偶',wide:true},
 'packaging-hero.webp':{chapter:'packaging',caption:'盲盒包装 / 单盒主视觉',wide:true},
 'packaging-system.webp':{chapter:'packaging',caption:'包装系统 / 六面视觉设计',wide:true},
 'display-box.webp':{wide:false,chapter:'packaging',caption:'销售陈列 / 六盒装展示盒'},
 'unboxing.webp':{wide:false,chapter:'packaging',caption:'开盒体验 / 卡片与内袋配套'},
 'gift-bags.webp':{chapter:'packaging',caption:'礼赠应用 / 手提袋',wide:true},
 'accessories.webp':{wide:false,chapter:'merch',caption:'随身收藏 / 挂件、徽章与手机挂绳'},
 'stationery.webp':{wide:false,chapter:'merch',caption:'文具纸品 / 贴纸、书签与笔记本'},
 'lifestyle.webp':{chapter:'merch',caption:'日常生活 / 帆布袋、杯具与杯垫',wide:true},
 'retail.webp':{chapter:'merch',caption:'门店宣传 / 海报、桌牌与展示架',wide:true},
};
export function IPGallery({images,coverUrl,title}:{images:string[];coverUrl:string;title:string}){
 const items=images.filter(url=>url!==coverUrl).map((url,i)=>({url,caption:`设计展示 ${i+1}`,chapter:'more',wide:true,width:1536,height:1024,...art[url.split('/').pop()||'']}));
 const chapters=editions.filter(c=>items.some(item=>item.chapter===c.id));
 const [open,setOpen]=useState<number|null>(null);const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open!==null){if(!el.open)el.showModal();}else if(el.open)el.close();},[open]);
 const isOpen=open!==null;
 useEffect(()=>{if(!isOpen)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[isOpen]);
 return <>
  <nav className="ip-chapter-nav shell" aria-label="IP 项目章节"><span>项目导览</span>{chapters.map(c=><a key={c.id} href={`#ip-${c.id}`}><i>{c.number}</i>{c.label}<ArrowUpRight size={14}/></a>)}</nav>
  <div className="ip-editorial shell">
   {chapters.map(chapter=><section className="ip-chapter" id={`ip-${chapter.id}`} key={chapter.id}>
    <header className="ip-chapter-heading reveal"><span className="ip-chapter-number">{chapter.number}</span><div><span className="ip-kicker">{chapter.en}</span><h2>{chapter.title}</h2><p>{chapter.copy}</p></div><span className="ip-chapter-label">{chapter.label}</span></header>
    <div className="ip-art-grid">{items.map((item,i)=>item.chapter!==chapter.id?null:<figure className={`ip-artwork reveal ${item.wide?'ip-art-wide':''}`} key={item.url+'-'+i}>
     <button type="button" className="ip-art-button" aria-label={`放大查看：${item.caption}`} onClick={()=>setOpen(i)}><img src={item.url} width={item.width} height={item.height} alt={`${title} · ${item.caption}`} loading="lazy"/><span className="ip-zoom-hint"><ArrowUpRight size={18}/><span>查看大图</span></span></button>
     <figcaption><span>{item.caption}</span><i>{String(i+1).padStart(2,'0')}</i></figcaption>
    </figure>)}</div>
   </section>)}
  </div>
  <dialog className="ip-lightbox" ref={dialog} onClose={()=>setOpen(null)} onCancel={()=>setOpen(null)} onClick={e=>{if(e.target===e.currentTarget)setOpen(null);}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();setOpen(n=>n===null?null:(n+1)%items.length);}if(e.key==='ArrowLeft'){e.preventDefault();setOpen(n=>n===null?null:(n-1+items.length)%items.length);}}} aria-label="作品大图浏览">
   <button className="ip-lightbox-close" type="button" autoFocus aria-label="关闭大图" onClick={()=>setOpen(null)}><X size={24}/></button>
   {open!==null&&items[open]&&<><img src={items[open].url} alt={items[open].caption}/><div className="ip-lightbox-controls"><button type="button" aria-label="上一张图片" onClick={()=>setOpen((open-1+items.length)%items.length)}><ArrowLeft size={20}/></button><span>{items[open].caption}<small>{open+1} / {items.length}</small><a className="ip-original" href={items[open].url} target="_blank" rel="noreferrer">打开原图 · 缩放查看 ↗</a></span><button type="button" aria-label="下一张图片" onClick={()=>setOpen((open+1)%items.length)}><ArrowRight size={20}/></button></div></>}
  </dialog>
 </>;
}
