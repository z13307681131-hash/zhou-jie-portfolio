import {isSameOrigin} from '@/lib/admin-security';
import {getAdminUser} from '@/lib/admin-auth';
export const dynamic='force-dynamic';
const MAX=12*1024*1024;
export async function PUT(request:Request){
 if(!await getAdminUser())return Response.json({error:'无管理员权限'},{status:403});
 if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
 const mime=request.headers.get('content-type')||'';
 const types:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
 if(!types[mime])return Response.json({error:'请上传 JPG、PNG、WebP 或 GIF 图片'},{status:400});
 if(!request.body||Number(request.headers.get('content-length'))>MAX)return Response.json({error:'图片须小于 12MB'},{status:413});
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX){await reader.cancel();return Response.json({error:'图片须小于 12MB'},{status:413});}chunks.push(value);}
 const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const text=new TextDecoder().decode(bytes.slice(0,12));
 const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':mime==='image/webp'?text.startsWith('RIFF')&&text.slice(8)==='WEBP':text.startsWith('GIF87a')||text.startsWith('GIF89a');
 if(!valid)return Response.json({error:'文件不是有效的图片格式'},{status:400});
 const {env}=await import('cloudflare:workers');const key=`uploads/rondel/${Date.now()}-${crypto.randomUUID()}.${types[mime]}`;
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime}});return Response.json({url:`/media/${key}`});
}
