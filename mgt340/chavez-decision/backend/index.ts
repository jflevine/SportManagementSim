import {PublicError,sha,UUID,initial,view,validateMessage,transition} from './core.mjs';
const base=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={'apikey':service,'Authorization':`Bearer ${service}`,'Content-Type':'application/json'};
const tokenPattern=/^[0-9a-f]{64}$/;
async function db(path:string,method='GET',data?:unknown){const r=await fetch(`${base}/rest/v1/${path}`,{method,headers,body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new PublicError('Could not save this request. Please retry.',503);return r.status===204?null:r.json();}
const rpc=(name:string,data:unknown)=>db('rpc/mgt340_ad_chat_'+name,'POST',data);
async function generate(instructions:string,input:unknown){
 let key=(Deno.env.get('OPENAI_API_KEY')||'').trim().replace(/^OPENAI_API_KEY\s*=\s*/,'');
 if((key.startsWith('"')&&key.endsWith('"'))||(key.startsWith("'")&&key.endsWith("'")))key=key.slice(1,-1);
 if(!key)throw new PublicError('Live stakeholder chat is temporarily unavailable.',503);
 let r:Response;
 try{r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(35000),body:JSON.stringify({model:Deno.env.get('MGT340_AD_CHAT_MODEL')||'gpt-4.1-2025-04-14',temperature:0.55,store:false,instructions,input,max_output_tokens:400,text:{format:{type:'json_schema',name:'stakeholder_reply',strict:true,schema:{type:'object',properties:{reply:{type:'string'}},required:['reply'],additionalProperties:false}}}})});}catch{throw new PublicError('The live stakeholder connection timed out. Please retry; your saved messages are safe.',503);}
 if(!r.ok)throw new PublicError('Live stakeholder chat is temporarily unavailable. Please retry.',503);
 const data=await r.json();
 if(data.status!=='completed')throw new PublicError('The response was incomplete. Please retry.',503);
 try{return JSON.parse(data.output.flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('')).reply;}catch{throw new PublicError('The response could not be read. Please retry.',503);}
}
Deno.serve(async(req)=>{
 const origin=req.headers.get('origin');
 const allowed=!origin||origin==='https://jflevine.github.io'||/^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origin);
 const cors={'Access-Control-Allow-Origin':allowed?(origin||'https://jflevine.github.io'):'https://jflevine.github.io','Access-Control-Allow-Headers':'content-type, x-session-token','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
 const respond=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(!allowed)return respond({error:'This origin is not allowed.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method==='GET')return respond({ok:true,service:'ad-decision-chat',version:1,configured:!!Deno.env.get('OPENAI_API_KEY')});
 if(req.method!=='POST')return respond({error:'Use POST.'},405);
 let lock:string|undefined,id:string|undefined,original:any;
 try{
  const raw=await req.text();if(raw.length>5000)throw new PublicError('Request too large.',413);
  let b:any;try{b=JSON.parse(raw);}catch{throw new PublicError('Invalid request.');}
  if(!b||typeof b!=='object'||Array.isArray(b))throw new PublicError('Invalid request.');
  if(b.action==='health')return respond({ok:true,service:'ad-decision-chat',version:1,configured:!!Deno.env.get('OPENAI_API_KEY')});
  if(!['start','resume','message'].includes(b.action))throw new PublicError('Choose start, resume, or message.');
  const token=req.headers.get('x-session-token')||'';
  if(!tokenPattern.test(token))throw new PublicError('Session access is missing. Reopen this activity in the same browser.',401);
  const hash=await sha(token);
  if(b.action==='start'){
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
   const bucket=await sha(ip+':'+Math.floor(Date.now()/600000));
   const result=await rpc('start',{p_hash:hash,p_bucket:bucket,p_state:initial()});
   if(result.error)throw new PublicError(result.error,result.status||429);
   return respond({session:view(result.id,result.state)});
  }
  id=b.id;if(!UUID.test(id||''))throw new PublicError('Session access is missing.',401);
  if(b.action==='resume'){
   const [s]=await db(`mgt340_ad_chat_sessions?id=eq.${id}&token_hash=eq.${hash}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=state`);
   if(!s)throw new PublicError('This session was not found or has expired.',401);
   return respond({session:view(id,s.state)});
  }
  validateMessage(b);
  lock=crypto.randomUUID();const claimed=await rpc('claim',{p_id:id,p_hash:hash,p_lock:lock,p_request:b.requestId});
  if(claimed.error){lock=undefined;throw new PublicError(claimed.error,claimed.status||429);}
  original=claimed.state;
  const prior=original.done.find((d:any)=>d.requestId===b.requestId);
  if(prior){lock=undefined;return respond({session:view(id,original),reply:prior.reply,requestId:b.requestId});}
  const next=await transition(structuredClone(original),b,generate);
  if(!await rpc('commit',{p_id:id,p_lock:lock,p_state:next}))throw new PublicError('Save conflict. Resume your conversation before retrying.',409);
  lock=undefined;return respond({session:view(id,next),reply:next.lastReply.reply,requestId:b.requestId});
 }catch(e){
  if(lock&&id&&original){try{await rpc('commit',{p_id:id,p_lock:lock,p_state:original});}catch{/* The lease expires automatically. */}}
  return respond({error:e instanceof PublicError?e.message:'The request could not be completed. Please retry.'},e instanceof PublicError?e.status:500);
 }
});
