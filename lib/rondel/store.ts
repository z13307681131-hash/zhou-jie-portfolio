import { normalize, type RondelContent, type RondelSnapshot } from './content';
export async function getRondel():Promise<RondelSnapshot> {
 const { env }=await import('cloudflare:workers');
 const row=await env.DB.prepare('SELECT content, revision, updated_at FROM site_content WHERE key = ?').bind('rondel').first<{content:string;revision:number;updated_at:number}>();
 return {content:normalize(row?JSON.parse(row.content):{}),revision:row?.revision??0,updatedAt:row?.updated_at??null};
}
export async function saveRondel(content:RondelContent, revision:number):Promise<RondelSnapshot|null> {
 const {env}=await import('cloudflare:workers');const updatedAt=Date.now();const data=JSON.stringify(normalize(content));
 const result= revision===0 ? await env.DB.prepare('INSERT OR IGNORE INTO site_content (key, content, revision, updated_at) VALUES (?, ?, 1, ?)').bind('rondel',data,updatedAt).run() : await env.DB.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updated_at = ? WHERE key = ? AND revision = ?').bind(data,updatedAt,'rondel',revision).run();
 if(!result.meta.changes)return null;return {content:JSON.parse(data),revision:revision+1,updatedAt};
}
