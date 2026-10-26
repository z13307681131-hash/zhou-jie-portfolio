import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root,'github-pages/generated');
fs.mkdirSync(target,{recursive:true});
let home=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
home=home.replace('export const dynamic = "force-dynamic";', '')
 .replace('export default async function Home()', 'export default function Home()')
 .replace('await listProjects()', 'listProjects()')
 .replaceAll('from "./experience-runtime"','from "@/app/experience-runtime"')
 .replaceAll('from "./site-nav"','from "@/app/site-nav"')
 .replaceAll('from "./project-showcase"','from "@/app/project-showcase"');
fs.writeFileSync(path.join(target,'home.tsx'),home);
let detail=fs.readFileSync(path.join(root,'app/work/[slug]/page.tsx'),'utf8');
detail=detail.replace('import type { Metadata } from "next";', '')
 .replace('import { notFound, redirect } from "next/navigation";', '')
 .replace('export const dynamic = "force-dynamic";', '')
 .replace('params: Promise<{ slug: string }>', 'params: { slug: string }');
detail=detail.slice(0,detail.indexOf('export async function generateMetadata'))+detail.slice(detail.indexOf('export default async function WorkDetailPage'));
detail=detail.replace('export default async function WorkDetailPage','export default function WorkDetailPage')
 .replace('await params','params').replace('await getProject(slug)','getProject(slug)').replace('await listProjects()','listProjects()')
 .replace('if (slug === "little-yellow-dog") redirect("/work/wang-yu-xia");','')
 .replace('if (!project) notFound();','if (!project) return null;')
 .replaceAll('"../pdf-viewer"','"@/app/work/pdf-viewer"')
 .replaceAll('"../ip-gallery"','"@/app/work/ip-gallery"')
 .replaceAll('"../ip-gallery.css"','"@/app/work/ip-gallery.css"');
fs.writeFileSync(path.join(target,'detail.tsx'),detail);
