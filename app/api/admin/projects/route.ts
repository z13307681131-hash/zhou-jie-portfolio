import {isSameOrigin} from '@/lib/admin-security';
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { getProject, listProjects, writeProject } from "@/lib/project-store";

export const dynamic = "force-dynamic";

const projectSchema = z.object({
  intent: z.enum(["create","update"]).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).default(""),
  description: z.string().max(4000).default(""),
  tags: z.array(z.string().max(40)).max(10).default([]),
  coverUrl: z.string().max(500).default(""),
  coverKey: z.string().max(500).nullable().default(null),
  pdfKey: z.string().max(500).nullable().default(null),
  gallery: z.array(z.string().max(500)).max(100).default([]),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  layout: z.enum(["wide", "standard"]).default("standard"),
  published: z.boolean().default(true),
});

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  return NextResponse.json({ projects: await listProjects({ includeUnpublished: true, includeDeleted: true }) }, {headers:{"Cache-Control":"no-store"}});
}

function crossSite(request: Request) { return !isSameOrigin(request); }
export async function POST(request: Request) {
 if (!(await getAdminUser()) || crossSite(request)) return NextResponse.json({error:"无管理员权限"},{status:403});
 let body; try { body=await request.json(); } catch {return NextResponse.json({error:"无效请求"},{status:400});}
 const parsed=projectSchema.safeParse(body);
 if(!parsed.success)return NextResponse.json({error:"请检查项目字段",details:parsed.error.flatten()},{status:400});
 try {
  const p=parsed.data;
  if(p.intent==='create' && await getProject(p.slug,{includeUnpublished:true,includeDeleted:true}))return NextResponse.json({error:"此网址标识已存在，请更换，或在回收站恢复原作品"},{status:409});
  await writeProject(p);
  return NextResponse.json({project:await getProject(p.slug,{includeUnpublished:true})});
 } catch(error){ console.error(error);return NextResponse.json({error:"保存失败，请稍后重试"},{status:500});}
}
async function changeDeleted(request: Request, deleted: boolean){
 if (!(await getAdminUser()) || crossSite(request)) return NextResponse.json({error:"无管理员权限"},{status:403});
 let body;try{body=await request.json();}catch{return NextResponse.json({error:"无效请求"},{status:400});}
 const slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).safeParse(body.slug);
 if(!slug.success)return NextResponse.json({error:"无效作品标识"},{status:400});
 try{
 const project=await getProject(slug.data,{includeUnpublished:true,includeDeleted:true});
 if(!project)return NextResponse.json({error:"作品不存在"},{status:404});
 await writeProject(project,deleted);
 return NextResponse.json({project:{...project,deleted}});
 }catch(error){console.error(error);return NextResponse.json({error:"操作失败，请稍后重试"},{status:500});}
}
export async function DELETE(request: Request){return changeDeleted(request,true);}
export async function PATCH(request: Request){return changeDeleted(request,false);}
