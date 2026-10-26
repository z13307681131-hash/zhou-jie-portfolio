(() => {
 const stage=document.querySelector('#stage');
 if(stage){const poster=document.createElement('img');poster.className='scene-poster';poster.src='/rondel-assets/asset-19.jpg';poster.alt='胡桃木唱片机';stage.append(poster);}
 const note=document.createElement('p');note.className='scene-note';note.textContent='当前设备暂不支持 3D 预览，可继续浏览和选片播放。';document.body.append(note);
 const loader=document.querySelector('#loader');
 if(loader){const sync=()=>document.body.classList.toggle('scene-unavailable',loader.classList.contains('error'));new MutationObserver(sync).observe(loader,{attributes:true,attributeFilter:['class']});sync();}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const summary=document.querySelector('.rp-summary');if(summary?.getAttribute('aria-expanded')==='true'){summary.click();summary.focus();}}});
})();
