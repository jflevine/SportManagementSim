// Intentionally not deployed. Server-only values are taken from the hosting environment.
import { handler } from './handler.mjs';
const api = Deno.env.get('SUPABASE_URL');
const role = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const pub = Deno.env.get('SUPABASE_ANON_KEY');
const institution = Deno.env.get('SIGNAL_LEAK_APPROVED_PROVIDER');
Deno.serve(handler({
 origin: Deno.env.get('SIGNAL_LEAK_PILOT_ORIGIN'),
 enabled: Deno.env.get('SIGNAL_LEAK_PILOT_ENABLED') === 'true' && !!(api && role && pub && institution),
 async verifyUser(token: string) {
  const res = await fetch(api+'/auth/v1/user',{headers:{apikey:pub!,Authorization:'Bearer '+token},signal:AbortSignal.timeout(5000)});
  if(res.status===401||res.status===403)return null;
  if(!res.ok)throw new Error('Auth unavailable');
  const u = await res.json();
  return {id:u.id,verified:!!u.email_confirmed_at && !u.is_anonymous
    && Array.isArray(u.app_metadata?.providers) && u.app_metadata.providers.length===1
    && u.app_metadata.providers[0]===institution};
 },
 async save(userId: string, p: {attemptId:string,choices:number[],answers:string[]}) {
  const res=await fetch(api+'/rest/v1/rpc/spm370_signal_leak_submit_pilot',{
   method:'POST',headers:{apikey:role!,Authorization:'Bearer '+role,'Content-Type':'application/json'},
   body:JSON.stringify({p_student:userId,p_attempt:p.attemptId,p_choices:p.choices,p_answers:p.answers}),
   signal:AbortSignal.timeout(7000)
  });
  if(!res.ok)throw new Error('Store unavailable');
  return await res.json();
 }
}));
