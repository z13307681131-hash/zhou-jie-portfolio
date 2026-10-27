/* One native media element, with request tokens guarding rapid track changes. */
window.createRondelAudio = function(records, media, changed) {
 let index=0, requested=false, unlocked=false, playing=false, state='idle', epoch=0, inflight=null, error='';
 const emit=()=>changed({index,requested,playing,state,error});
 const fail=(e,token)=>{if(token!==epoch||e?.name==='AbortError')return;requested=false;playing=false;state='error';error=e?.name==='NotAllowedError'?'请再次点击播放以开启声音。':'音频暂时无法加载，请重试。';emit();};
 function start(){
  if(!unlocked||!requested||(!media.paused&&playing)||inflight===epoch)return;
  const token=epoch;inflight=token;state='loading';error='';emit();
  Promise.resolve(media.play()).then(()=>{if(token===epoch&&!requested)media.pause();}).catch(e=>fail(e,token)).finally(()=>{if(inflight===token)inflight=null;});
 }
 function select(i){
  if(!Number.isInteger(i)||!records[i]||i===index)return;
  epoch++;inflight=null;media.pause();playing=false;index=i;error='';state='idle';media.src=records[i].audioUrl;media.load();emit();start();
 }
 function needle(on){requested=!!on;if(on)start();else{epoch++;inflight=null;media.pause();playing=false;if(state!=='error'&&state!=='ended')state='paused';emit();}}
 function unlock(){unlocked=true;start();}
 media.preload='none';media.src=records[0].audioUrl;media.volume=.8;
 media.addEventListener('playing',()=>{if(!requested){media.pause();return;}playing=true;state='playing';error='';emit();});
 media.addEventListener('pause',()=>{playing=false;if(!requested&&state!=='error'&&state!=='ended')state='paused';emit();});
 media.addEventListener('waiting',()=>{if(requested){playing=false;state='loading';emit();}});
 media.addEventListener('error',()=>{if(media.error)fail(media.error,epoch);});
 media.addEventListener('ended',()=>{if(!media.ended)return;requested=false;playing=false;state='ended';emit();});
 media.addEventListener('loadedmetadata',()=>{if(state==='idle')state='ready';emit();});
 return {select,needle,unlock,get index(){return index;},get requested(){return requested;},get playing(){return playing;},get state(){return state;},get ready(){return media.readyState>=1;},get audible(){return playing&&!media.muted&&media.volume>0;},get muted(){return media.muted;},toggleMute(){media.muted=!media.muted;emit();},setVolume(v){media.volume=Math.max(0,Math.min(1,Number(v)||0));media.muted=false;emit();},seek(v){if(Number.isFinite(media.duration)){media.currentTime=Math.max(0,Math.min(media.duration,v));}},get duration(){return media.duration;},get time(){return media.currentTime;}};
};
