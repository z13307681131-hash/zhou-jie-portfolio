import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { getAdminUser } from "@/lib/admin-auth";
import { listProjects } from "@/lib/project-store";
import { ProjectManager } from "./project-manager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdminUser();

  if (!admin) redirect("/admin/login");

  const projects = await listProjects({ includeUnpublished: true, includeDeleted: true });
  return (
    <main className="admin-page">
      <header className="admin-nav">
        <Link href="/" className="monogram">ZJ<span>®</span></Link>
        <div><LockKeyhole size={15} /> 内容管理</div>
        <div className="admin-logout"><span>{admin.displayName}</span><LogoutButton /></div>
      </header>
      <a href="/admin/rondel" style={{display:"inline-block",margin:"24px 0",color:"#d6bd8e"}}>管理 RONDEL 独立页面 →</a>
      <ProjectManager initialProjects={projects} />
    </main>
  );
}
