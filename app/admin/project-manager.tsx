"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle, Pencil, Plus, Upload, Trash2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/projects";

type FormState = Project & { tagText: string };

const blankProject: FormState = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  tags: [],
  tagText: "",
  coverUrl: "",
  coverKey: null,
  pdfKey: null,
  gallery: [],
  sortOrder: 110,
  layout: "standard",
  published: true,
};

function toForm(project: Project): FormState {
  return { ...project, tagText: project.tags.join(", ") };
}

export function ProjectManager({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState<FormState>(blankProject);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleted,setShowDeleted]=useState(false);
  const [deletePending,setDeletePending]=useState(false);
  const galleryRef=useRef<HTMLInputElement>(null);
  function resetFiles(){for(const ref of [coverRef,pdfRef,galleryRef])if(ref.current)ref.current.value="";}
  const coverRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const sortedProjects = useMemo(
    () => projects.filter(p=>Boolean(p.deleted)===showDeleted).sort((a, b) => a.sortOrder - b.sortOrder),
    [projects,showDeleted],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startNew() {
    resetFiles();setDeletePending(false);setShowDeleted(false);
    setEditingSlug(null);
    setForm({ ...blankProject, sortOrder: Math.max(0,...projects.map(p=>p.sortOrder))+10 });
    setStatus("");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function startEdit(project: Project) {
    resetFiles();setDeletePending(false);
    setEditingSlug(project.slug);
    setForm(toForm(project));
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function upload(file: File, kind: "cover" | "pdf") {
    const response = await fetch(`/api/admin/upload?kind=${kind}`, {
      method: "PUT",
      headers: {
        "content-type": file.type,
        "x-file-name": encodeURIComponent(file.name),
      },
      body: file,
    });
    const result = await response.json() as {error?:string;key:string;url:string;project:Project};
    if (!response.ok) throw new Error(result.error || "上传失败");
    return result as { key: string; url: string };
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("正在保存…");
    try {
      let coverKey = form.coverKey;
      let coverUrl = form.coverUrl;
      let pdfKey = form.pdfKey;
      const coverFile = coverRef.current?.files?.[0];
      const pdfFile = pdfRef.current?.files?.[0];

      if (coverFile) {
        setStatus("正在上传封面…");
        const uploaded = await upload(coverFile, "cover");
        coverKey = uploaded.key;
        coverUrl = uploaded.url;
      }
      if (pdfFile) {
        setStatus("正在上传 PDF，大文件请耐心等待…");
        const uploaded = await upload(pdfFile, "pdf");
        pdfKey = uploaded.key;
      }

      const gallery=[...form.gallery];
      const files=Array.from(galleryRef.current?.files||[]);
      if(gallery.length+files.length>100)throw new Error("详情图片最多 100 张");
      for(let i=0;i<files.length;i++){setStatus(`正在上传详情图片 ${i+1} / ${files.length}…`);gallery.push((await upload(files[i],"cover")).url);}
      setStatus("正在保存项目信息…");
      const payload = {
        ...form,
        tags: form.tagText.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
        coverKey,
        coverUrl,
        pdfKey,
        gallery,
        intent:editingSlug?"update":"create",
      };
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as {error?:string;key:string;url:string;project:Project};
      if (!response.ok) throw new Error(result.error || "保存失败");

      const saved = result.project as Project;
      setProjects((current) => {
        const exists = current.some((project) => project.slug === saved.slug);
        return exists
          ? current.map((project) => (project.slug === saved.slug ? saved : project))
          : [...current, saved];
      });
      resetFiles();
      setForm(toForm(saved));
      setEditingSlug(saved.slug);
      if (coverRef.current) coverRef.current.value = "";
      if (pdfRef.current) pdfRef.current.value = "";
      setStatus("已保存并同步到网站");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function changeDeleted(project:Project,deleted:boolean){
    setSaving(true);setStatus(deleted?"正在删除…":"正在恢复…");
    try{
      const response=await fetch("/api/admin/projects",{method:deleted?"DELETE":"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({slug:project.slug})});
      const result=await response.json() as {error?:string;project:Project};
      if(!response.ok)throw new Error(result.error||"操作失败");
      setProjects(current=>current.map(p=>p.slug===project.slug?result.project:p));
      if(deleted&&editingSlug===project.slug)startNew();
      setDeletePending(false);setStatus(deleted?"卡片已删除，可在回收站恢复":"卡片已恢复并同步到网站");
    }catch(error){setStatus(error instanceof Error?error.message:"操作失败");}finally{setSaving(false);}
  }
  return (
    <div className="admin-layout">
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-heading">
          <div>
            <span>{editingSlug ? "EDIT PROJECT" : "NEW PROJECT"}</span>
            <h1>{editingSlug ? "编辑作品" : "添加作品"}</h1>
          </div>
          <Button type="button" variant="outline" onClick={startNew} disabled={saving} className="admin-secondary-button">
            <Plus size={16} /> 新建
          </Button>
        </div>

        <fieldset disabled={saving} className="admin-edit-fields">
        <div className="admin-field-grid">
          <div className="admin-field">
            <Label htmlFor="title">作品名称</Label>
            <Input id="title" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          </div>
          <div className="admin-field">
            <Label htmlFor="slug">网址标识</Label>
            <Input id="slug" value={form.slug} onChange={(event) => update("slug", event.target.value.toLowerCase())} disabled={Boolean(editingSlug)} placeholder="example-project" required />
          </div>
        </div>

        <div className="admin-field">
          <Label htmlFor="subtitle">中文副标题</Label>
          <Input id="subtitle" value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} />
        </div>
        <div className="admin-field">
          <Label htmlFor="description">项目介绍</Label>
          <Textarea id="description" value={form.description} onChange={(event) => update("description", event.target.value)} rows={6} />
        </div>
        <div className="admin-field">
          <Label htmlFor="tags">标签（用逗号分隔）</Label>
          <Input id="tags" value={form.tagText} onChange={(event) => update("tagText", event.target.value)} placeholder="Brand Identity, VIS, Editorial" />
        </div>

        <div className="admin-field-grid">
          <div className="admin-field">
            <Label htmlFor="sortOrder">排序数字</Label>
            <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} />
          </div>
          <div className="admin-field"><Label>首页卡片与详情</Label><p className="admin-help">封面用于卡片展示，PDF 与详情图片用于展示完整作品。</p></div>
        </div>

        <div className="admin-upload-grid">
          <div className="admin-upload">
            <Upload size={18} />
            <div><Label htmlFor="cover">封面图片</Label><p>JPG、PNG 或 WebP</p></div>
            <Input ref={coverRef} id="cover" type="file" accept="image/jpeg,image/png,image/webp" />
          </div>
          <div className="admin-upload">
            <Upload size={18} />
            <div><Label htmlFor="pdf">详情 PDF</Label><p>{form.pdfKey || form.pdfUrl ? "已关联 PDF，可重新上传替换" : "上传后详情页可直接浏览"}</p></div>
            <Input ref={pdfRef} id="pdf" type="file" accept="application/pdf" />
          </div>
        </div>

        {form.coverUrl&&<img className="admin-cover-preview" src={form.coverUrl} alt="当前卡片封面"/>}
        <details className="admin-gallery-editor"><summary>详情图片 · {form.gallery.length} 张</summary><p className="admin-help">按上传顺序展示，可移除不需要的图片。最多 100 张。</p>
          <div className="admin-gallery-grid">{form.gallery.map((url,i)=><div key={`${url}-${i}`}><img src={url} alt={`详情图片 ${i+1}`} loading="lazy"/><button type="button" aria-label={`移除第 ${i+1} 张详情图片`} onClick={()=>update("gallery",form.gallery.filter((_,n)=>n!==i))}><X size={14}/></button><span>{i+1}</span></div>)}</div>
          <Label htmlFor="gallery">添加详情图片（可多选）</Label><Input id="gallery" ref={galleryRef} type="file" multiple accept="image/jpeg,image/png,image/webp"/>
        </details>
        <div className="admin-publish-row">
          <div><strong>在精选作品中显示</strong><p>关闭后卡片与详情保留在后台，前台不显示。</p></div>
          <Switch checked={form.published} onCheckedChange={(checked) => update("published", checked)} aria-label="在精选作品中显示" />
        </div>

        </fieldset>
        <div className="admin-submit-row">
          <Button type="submit" disabled={saving} className="admin-primary-button">
            {saving ? <LoaderCircle className="admin-spinner" size={17} /> : <Check size={17} />}
            {saving ? "处理中" : "保存作品"}
          </Button>
          <span aria-live="polite">{status}</span>
        </div>
        {editingSlug&&<div className="admin-delete-zone">{deletePending?<><p>删除后首页和详情页将不再显示，内容可在回收站恢复。</p><div><Button type="button" disabled={saving} className="admin-danger-button" onClick={()=>changeDeleted(form,true)}>确认删除</Button><Button type="button" variant="outline" disabled={saving} onClick={()=>setDeletePending(false)}>取消</Button></div></>:<button className="admin-delete-trigger" type="button" disabled={saving} onClick={()=>setDeletePending(true)}><Trash2 size={16}/> 删除这张卡片</button>}</div>}
      </form>

      <aside className="admin-project-list">
        <div className="admin-list-heading"><span>作品卡片</span><strong>{projects.filter(p=>!p.deleted).length}</strong></div>
        <div className="admin-list-tabs"><button type="button" disabled={saving} aria-pressed={!showDeleted} onClick={()=>setShowDeleted(false)}>全部卡片</button><button type="button" disabled={saving} aria-pressed={showDeleted} onClick={()=>setShowDeleted(true)}>回收站 ({projects.filter(p=>p.deleted).length})</button></div>
        {sortedProjects.map(project=>project.deleted?<div className="admin-project-item" key={project.slug}><img src={project.coverUrl} alt=""/><span><strong>{project.title}</strong><em>已删除</em></span><button className="admin-restore" type="button" disabled={saving} aria-label={`恢复 ${project.title}`} onClick={()=>changeDeleted(project,false)}><RotateCcw size={16}/>恢复</button></div>:<button type="button" disabled={saving} className={`admin-project-item ${editingSlug===project.slug?"is-active":""}`} key={project.slug} onClick={()=>startEdit(project)}><img src={project.coverUrl} alt=""/><span><strong>{project.title}</strong><em>{project.published?"已发布":"未发布"}</em></span><Pencil size={15}/></button>)}
        {!sortedProjects.length&&<p className="admin-list-empty">{showDeleted?"回收站为空":"还没有卡片，点击新建添加作品。"}</p>}
        <a className="admin-view-site" href="/" target="_blank">查看网站 <ArrowUpRight size={16} /></a>
      </aside>
    </div>
  );
}
