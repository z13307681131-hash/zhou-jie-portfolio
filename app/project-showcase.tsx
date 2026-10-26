"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import "./project-carousel.css";
const filters=[{id:'all',label:'全部'},{id:'brand',label:'品牌 / IP'},{id:'campaign',label:'海报 / 物料'},{id:'digital',label:'UI / H5'},{id:'editorial',label:'画册 / 编辑'}];
function matches(p:Project,f:string){
 if(f==='all')return true;
 const source=`${p.slug} ${p.title} ${p.subtitle} ${p.tags.join(' ')}`.toLowerCase();
 const terms:Record<string,string[]>={brand:['brand','vis','vi manual','logo','ip','packaging','品牌','包装','标志'],campaign:['campaign','poster','e-commerce','material','event','海报','物料','电商'],digital:['ui','ux','h5','digital','prototype','界面','交互'],editorial:['editorial','catalog','guideline','manual','画册','编辑','手册']};
 return terms[f]?.some(x=>source.includes(x));
}
export function ProjectShowcase({projects}:{projects:Project[]}){
 const [filter,setFilter]=useState('all');
 const visible=useMemo(()=>projects.filter(p=>matches(p,filter)),[projects,filter]);
 const [active,setActive]=useState(0);
 const viewport=useRef<HTMLDivElement>(null),pending=useRef(0),target=useRef(0);
 const drag=useRef({startX:0,startScroll:0,down:false,moved:false});
 const index=Math.min(active,Math.max(0,visible.length-1));
 function goTo(next:number,smooth=true){
  const el=viewport.current;if(!el||!visible.length)return;
  next=Math.max(0,Math.min(next,visible.length-1));target.current=next;
  const card=el.children[next] as HTMLElement;
  el.scrollTo({left:card.offsetLeft-(el.clientWidth-card.offsetWidth)/2,behavior:smooth&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});
 }
 useEffect(()=>{setActive(0);target.current=0;if(viewport.current)viewport.current.scrollLeft=0;},[filter,projects]);
 useEffect(()=>{const el=viewport.current;if(!el)return;const o=new ResizeObserver(()=>goTo(target.current,false));o.observe(el);return()=>{o.disconnect();cancelAnimationFrame(pending.current);};},[visible]);
 function onScroll(){cancelAnimationFrame(pending.current);pending.current=requestAnimationFrame(()=>{const el=viewport.current;if(!el)return;const center=el.scrollLeft+el.clientWidth/2;let n=0,d=Infinity;Array.from(el.children).forEach((node,i)=>{const c=node as HTMLElement;const delta=Math.abs(c.offsetLeft+c.offsetWidth/2-center);if(delta<d){d=delta;n=i;}});setActive(n);target.current=n;});}
 return <div className="project-showcase work-carousel reveal">
  <div className="project-filters" aria-label="作品分类">{filters.map(f=><button type="button" key={f.id} className={filter===f.id?'is-active':''} aria-pressed={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label}</button>)}<span>{String(visible.length).padStart(2,'0')} PROJECTS</span></div>
  <div className="work-carousel-region" role="region" aria-label="精选作品卡片" aria-roledescription="轮播" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();goTo(index+(e.key==='ArrowRight'?1:-1));}else if(e.key==='Home'||e.key==='End'){e.preventDefault();goTo(e.key==='Home'?0:visible.length-1);}}}>
   {visible.length?<>
    <div className="work-card-viewport" ref={viewport} onScroll={onScroll}
     onPointerDown={e=>{if(e.pointerType==='mouse'&&e.button===0)drag.current={startX:e.clientX,startScroll:e.currentTarget.scrollLeft,down:true,moved:false};}}
     onPointerMove={e=>{const d=drag.current;if(!d.down)return;const dx=e.clientX-d.startX;if(Math.abs(dx)>6&&!d.moved){d.moved=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging');}if(d.moved)e.currentTarget.scrollLeft=d.startScroll-dx;}}
     onPointerUp={e=>{drag.current.down=false;e.currentTarget.classList.remove('is-dragging');if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(drag.current.moved)goTo(target.current);}}
     onPointerLeave={()=>{if(!drag.current.moved)drag.current.down=false;}}
     onPointerCancel={e=>{drag.current.down=false;e.currentTarget.classList.remove('is-dragging');}}
     onClickCapture={e=>{if(drag.current.moved){e.preventDefault();drag.current.moved=false;}}} onDragStart={e=>e.preventDefault()}>
      {visible.map((p,i)=>{const offset=Math.max(-2,Math.min(2,i-index));return <article key={p.slug} className={`work-slide ${i===index?'is-current':''}`} style={{'--card-turn':`${offset*4}deg`,'--card-scale':i===index?1:.9,'--card-lift':i===index?'0px':'25px'} as CSSProperties} aria-label={`${i+1} / ${visible.length}`} aria-roledescription="幻灯片">
       <a className="work-art-card" href={`/work/${p.slug}`} aria-label={`查看完整作品：${p.title}`} onFocus={()=>goTo(i)}>
        <div className="work-art-image">{p.coverUrl?<img src={p.coverUrl} alt={p.subtitle||p.title} loading={i<3?'eager':'lazy'} draggable={false}/>:<span>{p.title}</span>}<span className="work-art-number">{String(projects.findIndex(item=>item.slug===p.slug)+1).padStart(2,'0')}</span><span className="work-art-open"><ArrowUpRight size={22}/></span></div>
        <div className="work-art-caption"><span>{p.tags[0]||'SELECTED WORK'}</span><h3>{p.title}</h3><p>{p.subtitle}</p><div className="work-art-bottom"><span>查看完整作品</span><ArrowUpRight size={16}/></div></div>
       </a>
      </article>;})}
    </div>
    <div className="work-carousel-toolbar"><p>每一张卡片，都是一个完整项目。<span>左右选择 · 点击查看</span></p><div className="work-carousel-controls"><button type="button" aria-label="上一个作品" onClick={()=>goTo(index-1)} disabled={index===0}><ArrowLeft size={22}/></button><span className="work-carousel-count" aria-live="polite" aria-atomic="true"><strong>{String(index+1).padStart(2,'0')}</strong><i>/</i>{String(visible.length).padStart(2,'0')}</span><button type="button" aria-label="下一个作品" onClick={()=>goTo(index+1)} disabled={index===visible.length-1}><ArrowRight size={22}/></button></div></div>
    <div className="work-carousel-progress" aria-hidden="true"><span style={{width:`${100/visible.length}%`,transform:`translateX(${index*100}%)`}}/></div>
   </>:<div className="work-carousel-empty"><p>这个分类下还没有作品。</p><button onClick={()=>setFilter('all')}>查看全部作品 <ArrowRight size={16}/></button></div>}
  </div>
 </div>;
}
