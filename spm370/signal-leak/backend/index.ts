import {createHandler,httpAdapter} from '../engine/handler.mjs';
import {authoredVoice} from '../engine/voice.mjs';
import {createSupabaseStore} from './store.mjs';
import cf from '../casefile.mjs';
const base=createSupabaseStore({url:Deno.env.get('SUPABASE_URL')||'',key:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||''});
const scoped={...base,async getRun(id){const r=await base.getRun(id);return r?.caseId===cf.id?r:null},async getRunByJoinCode(code){const r=await base.getRunByJoinCode(code);return r?.caseId===cf.id?r:null}};
Deno.serve(async req=>{if(req.method==='POST'){try{const body=await req.clone().json();if(['start','join','act'].includes(body.op))return new Response(JSON.stringify({error:'Course collection is not open. Use the local practice version and keep your export; Professor Levine will confirm the submission route.'}),{status:503,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'https://jflevine.github.io'}})}catch{}}let instructorKeyHash=null;try{instructorKeyHash=await base.setting('instructor_key_hash')}catch{};return httpAdapter(createHandler({store:scoped,cases:{[cf.id]:cf},voice:authoredVoice(),instructorKeyHash}),{allowedOrigins:['https://jflevine.github.io']})(req)});
