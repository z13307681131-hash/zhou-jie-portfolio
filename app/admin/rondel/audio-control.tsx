'use client';
import {useRef,useState} from 'react';
export default function AudioControl({url,filename,label,onChange,onBusy,onError}:{url:string;filename:string;label:string;onChange:(patch:{audioUrl:string;sourceFile:string;side:string})=>void;onBusy:(n:number)=>void;onError:(s:string)=>void}){
 const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false);
 async function upload(file?:File){
  if(!file)return;if(file.size>24*1024*1024){onError('音频须小于 24MB');return;}
  setBusy(true);onBusy(1);const objectUrl=URL.createObjectURL(file);
  try{
   const duration=await new Promise<number>((resolve,reject)=>{const a=new Audio();a.preload='metadata';const timeout=setTimeout(()=>finish(new Error('读取音频超时')),15000);function finish(error?:Error){clearTimeout(timeout);a.onloadedmetadata=null;a.onerror=null;const duration=a.duration;a.removeAttribute('src');a.load();error?reject(error):resolve(duration);}a.onloadedmetadata=()=>Number.isFinite(a.duration)&&a.duration>0?finish():finish(new Error('无法读取音频时长'));a.onerror=()=>finish(new Error('浏览器无法解码此音频，请使用 MP3、M4A 或 WAV'));a.src=objectUrl;});
   const response=await fetch('/api/admin/rondel/audio',{method:'PUT',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});const data=await response.json();if(!response.ok)throw Error(data.error||'音乐上传失败');
   onChange({audioUrl:data.url,sourceFile:file.name.slice(0,240),side:`${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}`});
  }catch(e){onError(e instanceof Error?e.message:'音乐上传失败');}finally{URL.revokeObjectURL(objectUrl);setBusy(false);onBusy(-1);if(input.current)input.current.value='';}
 }
 return <div className="re-audio-control"><label>{label}</label><p>{filename}</p><audio controls preload="none" src={url} aria-label={`${label}试听`}/><input type="file" accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav" hidden ref={input} onChange={e=>upload(e.target.files?.[0])}/><button type="button" className="re-outline" disabled={busy} onClick={()=>input.current?.click()}>{busy?'音乐上传中…':'上传 / 更换音乐'}</button><small>支持 MP3、M4A、WAV，单个文件不超过 24MB。试听确认后，点击顶部「保存并应用」。</small></div>;
}
