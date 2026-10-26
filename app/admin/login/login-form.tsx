 'use client';
import {useState} from 'react';
export function LoginForm(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <form onSubmit={async event=>{
 event.preventDefault();if(busy)return;setBusy(true);setError('');const data=new FormData(event.currentTarget);
 try{const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:data.get('username'),password:data.get('password'),next:new URLSearchParams(location.search).get('next')})});const result=await response.json();if(!response.ok)throw new Error(result.error||'登录失败，请重试。');location.assign(result.redirect==='/admin/rondel'?'/admin/rondel':'/admin');}catch(error){setError(error instanceof Error?error.message:'网络异常，请稍后重试。');setBusy(false);}
 }}><label htmlFor="username">管理员账号</label><input id="username" name="username" autoComplete="username" required maxLength={100} autoCapitalize="none" spellCheck={false}/><label htmlFor="password">密码</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256}/><p className="login-error" role="alert" aria-live="polite">{error}</p><button type="submit" disabled={busy}>{busy?'正在登录…':'登录管理后台'}<span aria-hidden="true">↗</span></button></form>;
}
