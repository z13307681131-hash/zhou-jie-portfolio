import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { PdfViewer } from "../pdf-viewer";
import { IPGallery } from "../ip-gallery";
import "../ip-gallery.css";
import { ExperienceRuntime } from "@/app/experience-runtime";
import { getProject, listProjects } from "@/lib/project-store";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "little-yellow-dog") redirect("/work/wang-yu-xia");
  const project = await getProject(slug);
  if (!project) return { title: "项目未找到 · 周杰" };
  return {
    title: `${project.title} · 周杰作品集`,
    description: project.subtitle || project.description.slice(0, 120),
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "little-yellow-dog") redirect("/work/wang-yu-xia");
  const project = await getProject(slug);
  if (!project) notFound();
  const projects = await listProjects();
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const isIP = project.slug === "wang-yu-xia";
  const pdfUrl = project.pdfKey ? `/media/${project.pdfKey}` : project.pdfUrl ?? null;
  const gallery = project.gallery.length ? project.gallery : [project.coverUrl];

  return (
    <main className={`work-page ${isIP ? "ip-case" : ""}`}>
      <ExperienceRuntime />
      <nav className="work-nav shell">
        <Link className="monogram" href="/">ZJ<span>®</span></Link>
        <Link href="/#projects"><ArrowLeft size={16} /> 返回项目</Link>
      </nav>

      <header className="work-header shell reveal">
        <div className="work-index">SELECTED WORK / {String(currentIndex + 1).padStart(2, "0")}</div>
        <h1>{project.title}</h1>
        <div className="work-intro">
          <h2>{project.subtitle}</h2>
          <p>{project.description}</p>
          <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        </div>
        {project.slug === "aoleao-global-catalog" && (
          <div className="work-facts" aria-label="项目规格">
            <div><strong>116</strong><span>PAGES</span></div>
            <div><strong>A3</strong><span>LANDSCAPE</span></div>
            <div><strong>EN</strong><span>GLOBAL CATALOG</span></div>
          </div>
        )}
      </header>

      {isIP && <div className="ip-cover-note shell"><span>WANG YU XIA / IP & PACKAGING</span><span>年轻表达，经典新生。</span></div>}
      <figure className="work-cover shell reveal">
        <img src={project.coverUrl} width={isIP ? 1536 : undefined} height={isIP ? 1024 : undefined} alt={`${project.title} 项目封面`} />
      </figure>

      {isIP && <IPGallery images={gallery} coverUrl={project.coverUrl} title={project.title} />}
      {!isIP && gallery.length > 0 && (
        <section className="work-gallery shell">
          <div className="work-section-title reveal">
            <span>PROJECT DETAILS</span>
            <h2>{pdfUrl ? "精选页面预览" : "完整项目展示"}</h2>
          </div>
          <div className="work-pages">
            {gallery.map((image, index) => (
              <figure className="reveal" key={image}>
                <a href={image} target="_blank" rel="noreferrer" aria-label={`打开第 ${index + 1} 页原图，可缩放查看`}><img src={image} alt={`${project.title} 第 ${index + 1} 页`} loading={index < 2 ? "eager" : "lazy"} /></a>
                {gallery.length > 1 && <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {pdfUrl && (
        <section className="work-pdf shell">
          <div className="work-section-title reveal">
            <span>FULL PDF</span>
            <h2>{project.slug === "aoleao-global-catalog" ? "完整 116 页画册" : "完整项目文件"}</h2>
            <a href={pdfUrl} target="_blank"><Download size={16} /> 单独打开 PDF</a>
          </div>
          <PdfViewer url={pdfUrl} title={project.title} />
        </section>
      )}

      <footer className="work-footer shell">
        <Link href="/#projects"><ArrowLeft size={18} /> 返回全部项目</Link>
        <Link href={`/work/${nextProject.slug}`}>下一项目 · {nextProject.title} <ArrowUpRight size={18} /></Link>
      </footer>
    </main>
  );
}
