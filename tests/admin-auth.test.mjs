import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {pbkdf2Sync,webcrypto} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function moduleAt(path,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:name=>name in imports?imports[name]:require(name),crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,Request,Response,URL,console});return exports;}
const security=moduleAt('lib/admin-security.ts');
const password='TEST-password-only',salt='a3'.repeat(16);
const passwordHash=`pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex')}`;
function setup(){
 const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync('drizzle/'+fs.readdirSync('drizzle').find(p=>p.startsWith('0003_')&&p.endsWith('.sql')),'utf8'));
 function prepare(query,args=[]){const s=sql.prepare(query);return {bind:(...values)=>prepare(query,values),first:async()=>s.get(...args)||null,run:async()=>s.run(...args)};}
 const env={DB:{prepare,batch:async entries=>{sql.exec('BEGIN');try{const result=[];for(const s of entries)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}},ADMIN_USERNAME:'test-owner',ADMIN_PASSWORD_HASH:passwordHash};return {env,sql};
}
test('password verification fails closed; only the configured owner can create a session',async()=>{
 const{env,sql}=setup();assert.equal(await security.verifyPassword(password,passwordHash),true);assert.equal(await security.verifyPassword('wrong',passwordHash),false);assert.equal(await security.verifyPassword(password,'broken'),false);
 assert.equal((await security.login(env,'stranger',password,'ip1')).status,401);assert.equal((await security.login(env,'test-owner','wrong','ip1')).status,401);assert.equal(sql.prepare('SELECT count(*) AS n FROM admin_sessions').get().n,0);assert.equal((await security.login({...env,ADMIN_PASSWORD_HASH:undefined},'test-owner',password,'ip1')).status,503);
});
test('sessions are random, hashed at rest, expire, revoke at logout and invalidate on credential rotation',async()=>{
 const{env,sql}=setup(),now=Date.now();const a=await security.login(env,'test-owner',password,'ip2',now),b=await security.login(env,'test-owner',password,'ip2',now);
 assert.equal(a.status,200);assert.notEqual(a.token,b.token);assert.equal((await security.authenticateSession(env,a.token,now)).displayName,'test-owner');const row=sql.prepare('SELECT token_hash FROM admin_sessions LIMIT 1').get();assert.notEqual(row.token_hash,a.token);assert.match(row.token_hash,/^[a-f0-9]{64}$/);
 assert.equal(await security.authenticateSession(env,a.token,now+security.SESSION_SECONDS*1000),null);assert.equal(await security.authenticateSession(env,'0'.repeat(64),now),null);assert.equal(await security.authenticateSession({...env,ADMIN_USERNAME:'changed'},a.token,now),null);await security.logout(env,a.token);assert.equal(await security.authenticateSession(env,a.token,now),null);assert.ok(await security.authenticateSession(env,b.token,now));
});
test('login throttling is durable, atomic, IP-scoped and recovers after its window',async()=>{
 const{env}=setup(),now=Date.now();const calls=await Promise.all(Array.from({length:12},()=>security.login(env,'test-owner','wrong','same-ip',now)));assert.equal(calls.filter(x=>x.status===429).length,2);assert.equal(calls.filter(x=>x.status===401).length,10);assert.equal((await security.login(env,'test-owner',password,'same-ip',now)).status,429);assert.equal((await security.login(env,'test-owner',password,'other-ip',now)).status,200);assert.equal((await security.login(env,'test-owner',password,'same-ip',now+900001)).status,200);
});
test('cookies are HTTPS-only and script-inaccessible; redirects and origins reject foreign destinations',()=>{
 const cookie=security.sessionCookie('abc');for(const flag of ['__Host-zj_admin=','HttpOnly','Secure','SameSite=Lax','Path=/','Max-Age=28800'])assert.ok(cookie.includes(flag));assert.equal(security.safeAdminPath('//evil.test'),'/admin');assert.equal(security.safeAdminPath('/admin/rondel'),'/admin/rondel');assert.equal(security.isSameOrigin(new Request('https://site.test/api',{headers:{origin:'https://site.test'}})),true);for(const headers of [{},{origin:'https://evil.test'},{origin:'https://site.test','sec-fetch-site':'cross-site'}])assert.equal(security.isSameOrigin(new Request('https://site.test/api',{headers})),false);
});
test('login endpoint enforces origin, body bounds, malformed JSON and never returns credentials',async()=>{
 const{env}=setup();const route=moduleAt('app/api/admin/login/route.ts',{'@/lib/admin-auth':{adminEnvironment:async()=>env},'@/lib/admin-security':security});const req=(body,origin='https://site.test')=>new Request('https://site.test/api/admin/login',{method:'POST',headers:{origin,'content-type':'application/json'},body});assert.equal((await route.POST(req('{}','https://evil.test'))).status,403);assert.equal((await route.POST(req('x'.repeat(2049)))).status,413);assert.equal((await route.POST(req('invalid-json'))).status,400);assert.equal((await route.POST(req('null'))).status,400);const response=await route.POST(req(JSON.stringify({username:'test-owner',password,next:'https://evil.test'})));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(response.headers.get('set-cookie'));const body=await response.text();assert.equal(JSON.parse(body).redirect,'/admin');assert.ok(!body.includes(password)&&!body.includes(passwordHash));
});
test('logout invalidates the database session and clears the cookie; foreign origin cannot log owner out',async()=>{
 const{env}=setup();const signed=await security.login(env,'test-owner',password,'ip');const route=moduleAt('app/api/admin/logout/route.ts',{'@/lib/admin-auth':{adminEnvironment:async()=>env},'@/lib/admin-security':security});const req=origin=>new Request('https://site.test/api/admin/logout',{method:'POST',headers:{origin,cookie:`${security.SESSION_COOKIE}=${signed.token}`}});assert.equal((await route.POST(req('https://evil.test'))).status,403);assert.ok(await security.authenticateSession(env,signed.token));const res=await route.POST(req('https://site.test'));assert.equal(res.status,303);assert.match(res.headers.get('set-cookie'),/Max-Age=0/);assert.equal(await security.authenticateSession(env,signed.token),null);
});
test('all content and upload handlers reject anonymous calls before touching storage',async()=>{
 const imports={'@/lib/admin-auth':{getAdminUser:async()=>null},'@/lib/admin-security':security,'@/lib/project-store':{},'@/lib/rondel/store':{},'@/lib/rondel/content':{},'@/lib/rondel/audio-format':{},'next/server':{NextResponse:Response}};
 for(const name of ['projects','upload','rondel','rondel/image','rondel/audio']){const route=moduleAt(`app/api/admin/${name}/route.ts`,imports);for(const method of ['GET','POST','PUT','DELETE','PATCH'])if(route[method])assert.equal((await route[method](new Request(`https://site.test/api/admin/${name}`,{method,headers:{origin:'https://site.test'}}))).status,403,`${method} ${name}`);}
});
