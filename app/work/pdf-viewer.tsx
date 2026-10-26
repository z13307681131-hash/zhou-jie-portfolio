'use client';
import {useEffect,useState} from 'react';
export function PdfViewer({url,title}:{url:string;title:string}){
 const [embed,setEmbed]=useState(false);
 useEffect(()=>{const query=matchMedia('(min-width:821px)');const sync=()=>setEmbed(query.matches);sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync);},[]);
 return embed?<iframe src={`${url}#toolbar=1&navpanes=0`} title={`${title} PDF`} loading="lazy"/>:<div className="pdf-mobile"><p>完整作品已整理为 PDF，可打开后缩放阅读或保存。</p><a href={url} target="_blank" rel="noreferrer">打开完整 PDF ↗</a></div>;
}
