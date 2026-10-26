import { defaultProjects, getDefaultProject, type Project } from "./projects";

type RuntimeEnv = {
  DB?: D1Database;
};

type ProjectRow = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string;
  cover_url: string;
  cover_key: string | null;
  pdf_key: string | null;
  gallery: string;
  sort_order: number;
  layout: string;
  published: number;
  deleted: number;
};

function rowToProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    tags: JSON.parse(row.tags || "[]"),
    coverUrl: row.cover_url,
    coverKey: row.cover_key,
    pdfKey: row.pdf_key,
    pdfUrl: null,
    gallery: JSON.parse(row.gallery || "[]"),
    sortOrder: row.sort_order,
    layout: row.layout === "wide" ? "wide" : "standard",
    published: Boolean(row.published),
    deleted: Boolean(row.deleted),
  };
}

async function projectRows(): Promise<ProjectRow[]> {
  const { env } = (await import("cloudflare:workers")) as { env: RuntimeEnv };
  const db = env.DB;
  if (!db) return [];
  const result = await db
    .prepare("SELECT slug, title, subtitle, description, tags, cover_url, cover_key, pdf_key, gallery, sort_order, layout, published, deleted FROM projects")
    .all<ProjectRow>();
  return result.results;
}

export async function listProjects(options?: { includeUnpublished?: boolean; includeDeleted?: boolean }) {
  try {
    const overrides = new Map((await projectRows()).map((row) => [row.slug, rowToProject(row)]));
    const defaults = defaultProjects.map((project) => {
      const override = overrides.get(project.slug);
      return override ? { ...override, pdfUrl: project.pdfUrl ?? null } : project;
    });
    const custom = [...overrides.values()].filter(
      (project) => !defaultProjects.some((item) => item.slug === project.slug),
    );
    return [...defaults, ...custom]
      .filter((project) => (options?.includeUnpublished || project.published) && (options?.includeDeleted || !project.deleted))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error("Unable to load project overrides", error);
    return [];
  }
}

export async function getProject(slug: string, options?: { includeUnpublished?: boolean; includeDeleted?: boolean }) {
  try {
    const { env } = (await import("cloudflare:workers")) as { env: RuntimeEnv };
    const db = env.DB;
    if (db) {
      const row = await db
        .prepare("SELECT slug, title, subtitle, description, tags, cover_url, cover_key, pdf_key, gallery, sort_order, layout, published, deleted FROM projects WHERE slug = ?")
        .bind(slug)
        .first<ProjectRow>();
      if (row) {
        const project = {
          ...rowToProject(row),
          pdfUrl: getDefaultProject(slug)?.pdfUrl ?? null,
        };
        return (options?.includeUnpublished || project.published) && (options?.includeDeleted || !project.deleted) ? project : null;
      }
    }
  } catch (error) {
    console.error("Unable to load project", error);
    return null;
  }
  const project = getDefaultProject(slug);
  return project && (options?.includeUnpublished || project.published) ? project : null;
}

export async function writeProject(project: Project, deleted = false) {
 const {env} = await import("cloudflare:workers");
 const now=Date.now();
 await env.DB.prepare(`INSERT INTO projects (slug,title,subtitle,description,tags,cover_url,cover_key,pdf_key,gallery,sort_order,layout,published,deleted,created_at,updated_at)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,subtitle=excluded.subtitle,description=excluded.description,tags=excluded.tags,cover_url=excluded.cover_url,cover_key=excluded.cover_key,pdf_key=excluded.pdf_key,gallery=excluded.gallery,sort_order=excluded.sort_order,layout=excluded.layout,published=excluded.published,deleted=excluded.deleted,updated_at=excluded.updated_at`)
 .bind(project.slug,project.title,project.subtitle,project.description,JSON.stringify(project.tags),project.coverUrl,project.coverKey,project.pdfKey,JSON.stringify(project.gallery),project.sortOrder,project.layout,project.published?1:0,deleted?1:0,now,now).run();
}
