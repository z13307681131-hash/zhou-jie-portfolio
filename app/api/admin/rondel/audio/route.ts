import {isSameOrigin} from '@/lib/admin-security';
import {getAdminUser} from '@/lib/admin-auth';
import {detectAudio,MAX_AUDIO_BYTES} from '@/lib/rondel/audio-format';
export const dynamic='force-dynamic';
export async function PUT(request:Request){
 if(!await getAdminUser())return Response.json({error:'无管理员权限'},{status:403});
 if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
 if(!request.body||Number(request.headers.get('content-length'))>MAX_AUDIO_BYTES)return Response.json({error:'音频须小于 24MB'},{status:413});
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX_AUDIO_BYTES){await reader.cancel();return Response.json({error:'音频须小于 24MB'},{status:413});}chunks.push(value);}
 const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}chunks.length=0;
 const format=detectAudio(bytes);if(!format)return Response.json({error:'请选择有效的 MP3、M4A 或 WAV 音频'},{status:400});
 const {env}=await import('cloudflare:workers');const key=`uploads/rondel-audio/${Date.now()}-${crypto.randomUUID()}.${format.ext}`;
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:format.mime}});
 return Response.json({url:`/media/${key}`});
}
