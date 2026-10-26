import {redirect} from 'next/navigation';
import {getAdminUser} from '@/lib/admin-auth';
import {LoginForm} from './login-form';
export const dynamic='force-dynamic';
export const metadata={title:'管理员登录 · 周杰',robots:{index:false,follow:false}};
export default async function LoginPage(){if(await getAdminUser())redirect('/admin');return <main className="login-page"><a className="login-brand" href="/">ZJ<sup>®</sup></a><section className="login-panel"><p className="login-kicker">ZHOU JIE / CONTENT STUDIO</p><h1>管理你的<br/><span>创作空间。</span></h1><p className="login-intro">仅管理员可登录。访客无需账号，即可浏览作品。</p><LoginForm/><a className="login-back" href="/">← 返回作品集</a></section><p className="login-footer">DESIGN IS A CONTINUOUS PROCESS.</p></main>;}
