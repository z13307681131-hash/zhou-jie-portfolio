(() => {
 const records=window.RONDEL_CONTENT.records,panel=document.createElement('aside');
 panel.id='record-player';panel.setAttribute('aria-label','唱片播放器');
 panel.innerHTML=`<button class="rp-summary" aria-expanded="false" aria-controls="rp-body"><img alt="当前唱片封面"><span><small>ZHOUJIE · MUSIC ROOM</small><strong></strong></span><b>♫</b></button><div id="rp-body" hidden><p class="rp-artist"></p><p class="rp-status" role="status">点击播放，开启唱片收藏。</p><input class="rp-progress" type="range" min="0" max="1000" step="1" value="0" aria-label="播放进度"><div class="rp-times"><span class="rp-elapsed">0:00</span><span class="rp-duration">0:00</span></div><div class="rp-actions"><button class="rp-prev" aria-label="上一张唱片">←</button><button class="rp-play">播放</button><button class="rp-next" aria-label="下一张唱片">→</button><button class="rp-mute" aria-label="静音">声音</button><input class="rp-volume" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="音量"></div><div class="rp-list" aria-label="选择唱片"></div></div>`;
 document.body.append(panel);
 const $=s=>panel.querySelector(s),summary=$('.rp-summary'),body=$('#rp-body'),status=$('.rp-status'),play=$('.rp-play'),list=$('.rp-list'),media=document.createElement('audio');
 media.id='rondel-audio';media.setAttribute('aria-label','当前唱片音频');panel.append(media);
 let engine;
 const time=v=>Number.isFinite(v)?`${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`:'0:00';
 function progress(){ $('.rp-elapsed').textContent=time(media.currentTime);$('.rp-duration').textContent=Number.isFinite(media.duration)?time(media.duration):records[engine.index].side;$('.rp-progress').value=media.duration?String(Math.round(media.currentTime/media.duration*1000)):'0'; }
 function update(s){
  const r=records[s.index];summary.querySelector('strong').textContent=r.title;summary.querySelector('img').src=r.imageUrl;$('.rp-artist').textContent=r.artist;
  play.textContent=s.requested?'暂停':'播放';$('.rp-mute').textContent=media.muted?'静音中':'声音';$('.rp-mute').setAttribute('aria-label',media.muted?'开启声音':'静音');
  panel.classList.toggle('rp-playing',s.playing);
  status.textContent=s.error||({idle:'已选择 · '+r.title,ready:'已就绪',playing:'正在播放',loading:'音乐加载中…',paused:'已暂停',ended:'播放结束 · 可选择下一张唱片'}[s.state]);
  [...list.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===s.index)));
  if(engine)progress();window.dispatchEvent(new CustomEvent('rondel:music-state'));
  if((s.state==='ended'||s.state==='error')&&window.TT?.active)window.TT.stop();
 }
 engine=window.createRondelAudio(records,media,update);
 function choose(i){i=(i+records.length)%records.length;engine.unlock();engine.select(i);window.dispatchEvent(new CustomEvent('rondel:choose-record',{detail:i}));if(window.TT){window.TT.setRecord(i);if(!window.TT.active)window.TT.play();}engine.needle(true);}
 function toggle(){const stop=engine.requested&&engine.state!=='idle';engine.unlock();if(stop){engine.needle(false);if(window.TT?.active)window.TT.stop();}else{engine.needle(true);if(window.TT&&!window.TT.active)window.TT.play();}}
 records.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','播放 '+r.title);const n=document.createElement('small');n.textContent=String(i+1).padStart(2,'0');const t=document.createElement('span');t.textContent=r.title;const d=document.createElement('small');d.textContent=r.side;b.append(n,t,d);b.onclick=()=>choose(i);list.append(b);});
 summary.onclick=()=>{body.hidden=!body.hidden;summary.setAttribute('aria-expanded',String(!body.hidden));};
 play.onclick=toggle;$('.rp-prev').onclick=()=>choose(engine.index-1);$('.rp-next').onclick=()=>choose(engine.index+1);$('.rp-mute').onclick=()=>engine.toggleMute();$('.rp-volume').oninput=e=>engine.setVolume(e.target.value);$('.rp-progress').oninput=e=>engine.seek(Number(e.target.value)/1000*media.duration);
 media.addEventListener('timeupdate',progress);media.addEventListener('durationchange',progress);
 window.RONDEL_MUSIC={select:engine.select,unlock:engine.unlock,needle:engine.needle,toggle,toggleMute:engine.toggleMute,get index(){return engine.index;},get audible(){return engine.audible;},get ready(){return engine.ready;},get muted(){return engine.muted;},get playing(){return engine.playing;},get requested(){return engine.requested;},get state(){return engine.state;}};
 window.addEventListener('pagehide',()=>engine.needle(false));
 update({index:0,requested:false,playing:false,state:'idle',error:''});
})();
