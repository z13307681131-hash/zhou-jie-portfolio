import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './generated/home';
import WorkDetail from './generated/detail';
import { getProject } from './project-store';
import '@/app/globals.css';
import '@/app/responsive.css';

const base = import.meta.env.BASE_URL;
const route = window.location.pathname.slice(base.length).replace(/\/+$/, '');
const slug = route.startsWith('work/') ? decodeURIComponent(route.slice(5)) : '';
const project = getProject(slug);
if (project) document.title = `${project.title} · 周杰作品集`;
if (slug === 'little-yellow-dog') window.location.replace(`${base}work/wang-yu-xia/`);
function NotFound() {
  return <main className="shell" style={{paddingTop: '20vh'}}><h1>页面未找到</h1><p><a href={base}>返回周杰作品集 ↗</a></p></main>;
}
createRoot(document.getElementById('root')!).render(route === '' ? <Home /> : project ? <WorkDetail params={{slug}} /> : <NotFound />);
