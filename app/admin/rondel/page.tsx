import {redirect} from 'next/navigation';
import {getAdminUser} from '@/lib/admin-auth';
import {getRondel} from '@/lib/rondel/store';
import RondelEditor from './rondel-editor';
export const dynamic='force-dynamic';
export default async function Page(){if(!await getAdminUser())redirect('/admin/login?next=/admin/rondel');return <RondelEditor initial={await getRondel()}/>;}
