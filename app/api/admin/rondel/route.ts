import {isSameOrigin} from '@/lib/admin-security';
import {getAdminUser} from '@/lib/admin-auth';
import {saveSchema} from '@/lib/rondel/content';
import {getRondel,saveRondel} from '@/lib/rondel/store';
export const dynamic='force-dynamic';
export async function GET(){if(!await getAdminUser())return Response.json({error:'无管理员权限'},{status:403});return Response.json(await getRondel(),{headers:{'Cache-Control':'no-store'}});}
export async function PUT(request:Request){
 if(!await getAdminUser())return Response.json({error:'无管理员权限'},{status:403});
 if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'请提交 JSON 内容'},{status:415});
 if(Number(request.headers.get('content-length'))>256000)return Response.json({error:'内容过长'},{status:413});
 const body=await request.text();if(body.length>256000)return Response.json({error:'内容过长'},{status:413});
 let parsed;try{parsed=saveSchema.safeParse(JSON.parse(body));}catch{return Response.json({error:'内容格式无效'},{status:400});}
 if(!parsed.success)return Response.json({error:'内容格式无效，请检查文字、图片及音频'},{status:400});
 const saved=await saveRondel(parsed.data.content as Parameters<typeof saveRondel>[0],parsed.data.revision);
 if(!saved)return Response.json({error:'内容已在其他页面更新，请重新打开后台后编辑'},{status:409});return Response.json(saved);
}
