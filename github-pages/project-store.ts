import type { Project } from '@/lib/projects';
import snapshot from './content/projects.json';
const defaultProjects = snapshot as Project[];
export function listProjects() {
  return defaultProjects.filter(p => p.published && !p.deleted).sort((a,b) => a.sortOrder-b.sortOrder);
}
export function getProject(slug: string) { return listProjects().find(p => p.slug === slug) || null; }
