import {adminEnvironment} from '@/lib/admin-auth';
import {isSameOrigin,logout,requestSession,sessionCookie} from '@/lib/admin-security';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'请求来源无效。'},{status:403});
 try{await logout(await adminEnvironment(),requestSession(request));}catch{return Response.json({error:'退出失败，请重试。'},{status:503,headers:{'Cache-Control':'no-store'}});}
 return new Response(null,{status:303,headers:{Location:'/admin/login','Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});
}
