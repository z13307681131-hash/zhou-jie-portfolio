import {cookies} from 'next/headers';
import {authenticateSession,SESSION_COOKIE,type AdminEnvironment} from './admin-security';
export async function adminEnvironment():Promise<AdminEnvironment>{const {env}=await import('cloudflare:workers');return env as unknown as AdminEnvironment;}
export async function getAdminUser(){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;try{return await authenticateSession(await adminEnvironment(),token);}catch{return null;}}
