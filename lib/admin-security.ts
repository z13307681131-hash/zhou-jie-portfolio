// Server-only credential verification and revocable eight-hour sessions.
export const SESSION_COOKIE='__Host-zj_admin';
export const SESSION_SECONDS=8*60*60;
export type AdminEnvironment={DB:D1Database;ADMIN_USERNAME?:string;ADMIN_PASSWORD_HASH?:string};
const encoder=new TextEncoder();
const hex=(bytes:ArrayBuffer|Uint8Array)=>Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function digest(value:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
function constantEqual(a:string,b:string){let mismatch=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return mismatch===0;}
export function configured(env:AdminEnvironment){return Boolean(env.DB&&env.ADMIN_USERNAME&&/^pbkdf2-sha256\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH||''));}
export async function verifyPassword(password:string,stored:string){
 const [algorithm,iterations,salt,expected]=stored.split('$');
 if(algorithm!=='pbkdf2-sha256'||iterations!=='100000'||!/^[a-f0-9]{32}$/.test(salt||'')||!/^[a-f0-9]{64}$/.test(expected||''))return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Uint8Array.from(salt.match(/../g)!,x=>parseInt(x,16)),iterations:100000},key,256);
 return constantEqual(hex(bits),expected);
}
export function safeAdminPath(path:unknown){return path==='/admin/rondel'?'/admin/rondel':'/admin';}
export function isSameOrigin(request:Request){return request.headers.get('sec-fetch-site')!=='cross-site'&&request.headers.get('origin')===new URL(request.url).origin;}
export function sessionCookie(token:string,maxAge=SESSION_SECONDS){return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
export function requestSession(request:Request){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1)||'';}
export async function authenticateSession(env:AdminEnvironment,token:string,now=Date.now()){
 if(!configured(env)||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await env.DB.prepare('SELECT expires_at, credential_version FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).first<{expires_at:number;credential_version:string}>();
 if(!row||row.expires_at<=now||!constantEqual(row.credential_version,await digest(`${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD_HASH}`)))return null;
 return {id:'site-owner',displayName:env.ADMIN_USERNAME!};
}
async function takeAttempt(env:AdminEnvironment,key:string,windowMs:number,limit:number,now:number){
 const row=await env.DB.prepare(`INSERT INTO admin_login_attempts (key, window_start, attempts) VALUES (?, ?, 1)
 ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
 window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END
 RETURNING attempts, window_start`).bind(key,now,now-windowMs,now-windowMs).first<{attempts:number;window_start:number}>();
 return row&&row.attempts<=limit;
}
export async function login(env:AdminEnvironment,username:string,password:string,ip:string,now=Date.now()){
 if(!configured(env))return {status:503,error:'登录服务暂不可用，请稍后重试。'};
 const allowed=await takeAttempt(env,`ip:${await digest(ip)}`,15*60*1000,10,now);
 const globalAllowed=await takeAttempt(env,'global',60*1000,120,now);
 if(!allowed||!globalAllowed)return {status:429,error:'尝试次数过多，请 15 分钟后重试。'};
 const passwordValid=await verifyPassword(password,env.ADMIN_PASSWORD_HASH!);
 if(!constantEqual(username,env.ADMIN_USERNAME!)||!passwordValid)return {status:401,error:'账号或密码不正确。'};
 const token=hex(crypto.getRandomValues(new Uint8Array(32)));
 await env.DB.batch([
 env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now),
 env.DB.prepare('DELETE FROM admin_login_attempts WHERE window_start < ?').bind(now-86400000),
 env.DB.prepare('INSERT INTO admin_sessions (token_hash, expires_at, credential_version) VALUES (?, ?, ?)').bind(await digest(token),now+SESSION_SECONDS*1000,await digest(`${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD_HASH}`)),
 ]);return {status:200,token};
}
export async function logout(env:AdminEnvironment,token:string){if(/^[a-f0-9]{64}$/.test(token))await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).run();}
