import {getRondel} from '@/lib/rondel/store';
import {renderRondel} from '@/lib/rondel/render';
export const dynamic='force-dynamic';
export async function GET(){const {content}=await getRondel();return new Response(renderRondel(content),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
