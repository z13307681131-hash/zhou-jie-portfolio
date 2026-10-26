import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../lib/rondel/content.ts',import.meta.url));
function compile(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require,TextDecoder});return exports;}
const {normalize,saveSchema}=compile('lib/rondel/content.ts');
const {detectAudio,MAX_AUDIO_BYTES}=compile('lib/rondel/audio-format.ts');
const catalog=JSON.parse(fs.readFileSync('lib/rondel/music-catalog.json'));
test('previous edition migrates to ten native files, retains page text and range',()=>{
 const c=normalize({musicEdition:1,texts:{t002:'zhouJie'},records:[{title:'Old loop'}],range:[{title:'Custom deck'}]});
 assert.equal(c.records.length,10);assert.equal(c.records[0].title,'One Last Kiss');assert.equal(c.texts.t002,'zhouJie');assert.equal(c.range[0].title,'Custom deck');assert.ok(saveSchema.safeParse({revision:4,content:c}).success);
 c.records[2].title='Edited track';c.records[2].audioUrl='/media/uploads/rondel-audio/123-abc.mp3';assert.equal(normalize(c).records[2].title,'Edited track');assert.ok(saveSchema.safeParse({revision:4,content:c}).success);
 c.records[2].audioUrl='https://external.test/music.mp3';assert.equal(saveSchema.safeParse({revision:4,content:c}).success,false);
});
test('all ten provided files are decodable-format MP3s within hosting limits',()=>{
 for(const r of catalog){const bytes=fs.readFileSync('public'+r.audioUrl);assert.equal(detectAudio(bytes)?.ext,'mp3',r.sourceFile);assert.ok(bytes.length<MAX_AUDIO_BYTES);}
 assert.equal(detectAudio(Buffer.from('not really an audio file at all')),null);
 assert.equal(detectAudio(Buffer.from('ID3\0\0\0\0\0\0\0not an audio file')),null);
});
function setup(){
 class Media extends EventTarget{paused=true;muted=false;volume=1;currentTime=0;duration=252;readyState=0;plays=[];loads=0;ended=false;error=null;
 play(){this.paused=false;return new Promise((resolve,reject)=>this.plays.push({resolve,reject}));}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
 load(){this.loads++;this.readyState=0;this.error=null;this.currentTime=0;}
 fire(type){this.dispatchEvent(new Event(type));}}
 const win={},m=new Media();vm.runInNewContext(fs.readFileSync('public/rondel-assets/audio-engine.js','utf8'),{window:win});const states=[];return {m,states,a:win.createRondelAudio(catalog,m,s=>states.push(s))};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('no automatic sound before interaction; track selection uses one media element',()=>{
 const {a,m}=setup();a.needle(true);assert.equal(m.plays.length,0);a.select(3);a.select(9);a.unlock();assert.equal(m.plays.length,1);assert.equal(m.src,catalog[9].audioUrl);assert.equal(a.index,9);m.fire('playing');assert.equal(a.audible,true);
});
test('rapid switching ignores old playback failure and retains latest request',async()=>{
 const {a,m}=setup();a.unlock();a.needle(true);a.select(2);a.select(7);m.plays[0].reject(new Error('old'));m.plays[1].reject(new Error('old'));m.plays[2].resolve();m.fire('playing');await flush();assert.equal(a.index,7);assert.equal(a.state,'playing');assert.equal(a.requested,true);assert.equal(m.src,catalog[7].audioUrl);
});
test('pausing during pending playback cannot restart audio',async()=>{
 const {a,m}=setup();a.unlock();a.needle(true);a.needle(false);m.plays[0].resolve();m.fire('playing');await flush();assert.equal(a.requested,false);assert.equal(a.playing,false);assert.equal(m.paused,true);
});
test('mute, volume, progress, ended and decode failure reflect actual media',()=>{
 const {a,m}=setup();a.unlock();a.needle(true);m.fire('playing');a.toggleMute();assert.equal(a.audible,false);a.setVolume(.4);assert.equal(m.volume,.4);assert.equal(a.audible,true);a.seek(100);assert.equal(m.currentTime,100);a.seek(999);assert.equal(m.currentTime,252);m.ended=true;m.fire('ended');assert.equal(a.requested,false);assert.equal(a.state,'ended');m.error={code:3};m.fire('error');assert.equal(a.state,'error');a.needle(false);assert.equal(a.state,'error');assert.equal(a.audible,false);
});
test('blocked playback surfaces error and allows retry',async()=>{
 const {a,m}=setup();a.unlock();a.needle(true);m.plays[0].reject({name:'NotAllowedError'});await flush();assert.equal(a.state,'error');assert.equal(a.requested,false);a.needle(true);assert.equal(m.plays.length,2);m.fire('playing');assert.equal(a.state,'playing');
});
function uploadRoute(admin){const exports={},puts=[];const localRequire=(name)=>name==='@/lib/admin-auth'?{getAdminUser:async()=>admin}:name==='@/lib/admin-security'?{isSameOrigin:r=>r.headers.get('origin')===new URL(r.url).origin&&r.headers.get('sec-fetch-site')!=='cross-site'}:name==='@/lib/rondel/audio-format'?{detectAudio,MAX_AUDIO_BYTES}:name==='cloudflare:workers'?{env:{BUCKET:{put:async(...args)=>puts.push(args)}}}:require(name);vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/admin/rondel/audio/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:localRequire,Response,crypto,Uint8Array});return {put:exports.PUT,puts};}
test('audio uploads require admin, reject cross-site, oversized and non-audio data',async()=>{
 const unauthorized=uploadRoute(null);assert.equal((await unauthorized.put(new Request('https://site.test/api/admin/rondel/audio',{method:'PUT',body:'test'}))).status,403);assert.equal(unauthorized.puts.length,0);
 const t=uploadRoute({id:'admin'});assert.equal((await t.put(new Request('https://site.test/api/admin/rondel/audio',{method:'PUT',headers:{'sec-fetch-site':'cross-site'},body:'test'}))).status,403);
 assert.equal((await t.put(new Request('https://site.test/api/admin/rondel/audio',{method:'PUT',headers:{origin:'https://site.test','content-length':String(MAX_AUDIO_BYTES+1)},body:'test'}))).status,413);
 assert.equal((await t.put(new Request('https://site.test/api/admin/rondel/audio',{method:'PUT',headers:{origin:'https://site.test'},body:'<html>not audio</html>'}))).status,400);assert.equal(t.puts.length,0);
});
test('valid admin upload persists original audio and returns allowed content path',async()=>{
 const t=uploadRoute({id:'admin'}),bytes=fs.readFileSync('public'+catalog[0].audioUrl);const response=await t.put(new Request('https://site.test/api/admin/rondel/audio',{method:'PUT',headers:{origin:'https://site.test'},body:bytes}));assert.equal(response.status,200);const {url}=await response.json();assert.match(url,/^\/media\/uploads\/rondel-audio\/[a-z0-9-]+\.mp3$/);assert.equal(t.puts.length,1);assert.equal(Buffer.compare(Buffer.from(t.puts[0][1]),bytes),0);assert.equal(t.puts[0][2].httpMetadata.contentType,'audio/mpeg');
});
