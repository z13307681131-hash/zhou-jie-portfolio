// Reapply the music integration when regenerating the original template.
export function personalizeMusic(html) {
 if(html.includes('src="/rondel-assets/record-player.js"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Music template anchor missing: '+a.slice(0,70));html=html.replace(a,b);};
 replace('</head>','<link rel="stylesheet" href="/rondel-assets/record-player.css"></head>');
 replace('<body>','<body>\n<script src="/rondel-assets/audio-engine.js"></script><script src="/rondel-assets/record-player.js"></script>');
 const a=html.indexOf('const RECORDS = ['),b=html.indexOf('const LABEL_PX =',a);
 if(a<0||b<0)throw Error('Record catalog anchor missing');
 html=html.slice(0,a)+`const RECORDS = window.RONDEL_CONTENT.records.map((item,i)=>{
 const key='custom_'+i; LABEL_ART[key]=item.imageUrl;
 return {...item,art:key,bg:'#171714',ink:'#f3ece1',dark:true};
});
`+html.slice(b);
 // The original layout already has ten record slots.
 html=html.replace('${r.year} · side A', '${r.year || "收藏"} · side A');
 replace('const REC_TARGET = 5;', 'const REC_TARGET = RECORDS.length - 1;');
 replace('function carMeta(idx) {','function carMeta(idx) {\n  window.RONDEL_MUSIC.select(idx);');
 replace('function putOn() { const tt = TT();','function putOn() { car.pending = car.idx; car.bias = car.biasCur = car.idx - REC_TARGET; const tt = TT();');
 // Keep explicit selection stable across the scroll-to-drop animation.
 replace('car.pos = car.target = browseStep(p) + car.biasCur;', 'car.pos = car.target = car.pending ?? (browseStep(p) + car.biasCur);');
 replace('} else if (car.dropI >= 0) { car.dropI = -1;', '} else if (car.dropI >= 0) { car.pending = null; car.dropI = -1;');
 replace('const N_REC = RECORDS.length;',`const N_REC = RECORDS.length;
window.addEventListener('rondel:choose-record',e=>{
 const i=e.detail; if(!Number.isInteger(i)||!RECORDS[i])return;
 car.bias += i-car.idx;car.biasCur=car.bias;car.idx=i;if(car.pending!=null)car.pending=i;
 if(car.dropI>=0){car.dropI=i;car.chosen=i;TT()?.carousel.scrub(i,car.flight,car.part);}
 carMeta(i);dom.recNowTitle.textContent=RECORDS[i].title;dom.recNowArtist.textContent=RECORDS[i].artist;
});
window.addEventListener('rondel:music-state',()=>{const t=TT();if(t)onState({phase:t.phase,speed:t.rpm,muted:t.muted,audible:t.audible});});`);
 html=html.replace("if (!window.TT) return;\n  // the deck","if (!window.TT) {window.RONDEL_MUSIC.toggle();return;}\n  // the deck");
 // Do not enable external sound on unrelated clicks elsewhere in the page.
 const unlockStart=html.indexOf('// browsers only let sound start after a click');
 const unlockEnd=html.indexOf('// ---- Lenis',unlockStart);
 if(unlockStart<0||unlockEnd<0)throw Error('Gesture anchor missing');
 html=html.slice(0,unlockStart)+html.slice(unlockEnd);
 replace("const t = window.TT; if (!t) return;\n  const wantOn", "const t = window.TT; if (!t) {window.RONDEL_MUSIC.toggle();return;}\n  const wantOn");
 replace('window.RONDEL_CONTENT.heroRecordImage || "/rondel-assets/asset-14.jpg"','window.RONDEL_CONTENT.heroRecordImage || window.RONDEL_CONTENT.records[0].imageUrl');
 const audioStart=html.indexOf('const audio = {'),audioEnd=html.indexOf('const meterBars =',audioStart);
 if(audioStart<0||audioEnd<0)throw Error('Audio anchor missing');
 html=html.slice(0,audioStart)+`// User-supplied recordings play directly through the native audio engine.
const audio={ctx:null,master:null,level:0,music:{buffer:null,src:null,loopLen:0},get muted(){return window.RONDEL_MUSIC.muted;}};
function audioUnlock(){window.RONDEL_MUSIC.unlock();}
function audioStylusDown(){window.RONDEL_MUSIC.needle(true);}
function audioStylusUp(){window.RONDEL_MUSIC.needle(false);}
function prerenderMusic(){}
function toggleMute(){window.RONDEL_MUSIC.toggleMute();updateUI();}
function updateAudio(){}
`+html.slice(audioEnd);
 replace("const audibleNow = () => !!(audio.ctx && audio.ctx.state === 'running' && !audio.muted);","const audibleNow = () => window.RONDEL_MUSIC.audible;");
 const specStart=html.indexOf('    const spec = it.rec.music;'),specEnd=html.indexOf('    return true;',specStart);
 if(specStart<0||specEnd<0)throw Error('Track switch anchor missing');
 html=html.slice(0,specStart)+'    window.RONDEL_MUSIC.select(i);\n'+html.slice(specEnd);
 html=html.replaceAll('get musicReady() { return !!audio.music.buffer; }','get musicReady() { return window.RONDEL_MUSIC.ready; }');
 html=html.replaceAll("get audioContextState() { return audio.ctx ? audio.ctx.state : 'none'; }","get audioContextState() { return window.RONDEL_MUSIC.state; }");
 replace('get musicPlaying() { return !!audio.music.src; }','get musicPlaying() { return window.RONDEL_MUSIC.playing; }');
 return html;
}
