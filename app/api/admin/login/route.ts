import {adminEnvironment} from '@/lib/admin-auth';
import {isSameOrigin,login,safeAdminPath,sessionCookie} from '@/lib/admin-security';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'请求来源无效。'},{status:403,headers});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'请求格式无效。'},{status:415,headers});
 if(Number(request.headers.get('content-length'))>2048)return Response.json({error:'请求过长。'},{status:413,headers});
 try{
  const reader=request.body?.getReader();if(!reader)return Response.json({error:'请输入账号和密码。'},{status:400,headers});
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return Response.json({error:'请求过长。'},{status:413,headers});}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{return Response.json({error:'请求格式无效。'},{status:400,headers});}
  if(!body||typeof body.username!=='string'||typeof body.password!=='string'||body.username.length>100||!body.password.length||body.password.length>256)return Response.json({error:'请输入有效的账号和密码。'},{status:400,headers});
  const result=await login(await adminEnvironment(),body.username.trim(),body.password,request.headers.get('cf-connecting-ip')||'unknown');
  if(!result.token)return Response.json({error:result.error},{status:result.status,headers:{...headers,...(result.status===429?{'Retry-After':'900'}:{})}});
  return Response.json({redirect:safeAdminPath(body.next)},{headers:{...headers,'Set-Cookie':sessionCookie(result.token)}});
 }catch{return Response.json({error:'登录服务暂不可用，请稍后重试。'},{status:503,headers});}
}
