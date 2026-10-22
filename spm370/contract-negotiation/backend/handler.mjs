import {evaluateTerms,phase,validatePolicy,validateSheet} from './policy.mjs';
export async function digest(text){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
const idOK=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const token=()=>crypto.randomUUID()+crypto.randomUUID();
const fail=(status,message)=>Object.assign(Error(message),{status});
export function createHandler({store,provider,instructorHash,classHash,allowedOrigins,released=false,now=()=>Date.now()}){
 async function authenticate(req,id){
  if(!idOK(id))throw fail(400,'Invalid session');
  const key=req.headers.get('x-session-token')||'';
  if(key.length<30||key.length>200)throw fail(401,'A private resume credential is required');
  const s=await store.session(id);
  if(!s||await digest(key)!==s.token_hash)throw fail(401,'Session access was not verified');return s;
 }
 async function view(s){const p=await store.policyById(s.case_id);return {id:s.id,name:s.name,email:s.email,mode:s.mode,case_id:s.case_id,phase:phase(s,now()),bargain_until:s.bargain_until,confirm_until:s.confirm_until,pending:!!s.lock_id,sheet:s.sheet,accepted:s.accepted,receipt:s.receipt,submitted_at:s.submitted_at,outcome:s.outcome,public_case:p.public_case,student_brief:p.student_brief||'',events:(await store.events(s.id)).map(e=>({seq:e.seq,actor:e.actor,text:e.text,created_at:e.created_at,payload:{proposal:e.payload?.proposal||null,counterparty_accepts:e.payload?.counterparty_accepts||false,accepted_proposal:e.payload?.accepted_proposal||null,request_id:e.payload?.request_id||null}}))};}
 return async req=>{
  const origin=req.headers.get('origin'),cors={'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Session-Token,X-Instructor-Key','Cache-Control':'no-store','Content-Type':'application/json','Vary':'Origin'};
  if(origin&&allowedOrigins.includes(origin))cors['Access-Control-Allow-Origin']=origin;
  const send=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:cors});
  try{
   if(origin&&!allowedOrigins.includes(origin))throw fail(403,'This origin is not allowed');
   if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
   const u=new URL(req.url),path=u.pathname.replace(/^.*\/spm370-contract-negotiation/,'');
   let body={};if(req.method==='POST'){
    if(!req.headers.get('content-type')?.startsWith('application/json'))throw fail(415,'Use JSON');
    const raw=await req.text();if(raw.length>90000)throw fail(413,'Request too large');
    try{body=JSON.parse(raw);}catch{throw fail(400,'Invalid request');}
   }else if(req.method!=='GET')throw fail(405,'Method not supported');
   if(path==='/health')return send({ok:true,aiConfigured:provider.configured,providerKeyConfigured:provider.keyConfigured,modelConfigured:provider.modelConfigured,instructorConfigured:!!instructorHash,classAccessConfigured:!!classHash,assessedReleased:released});
   if(path.startsWith('/instructor')){
    const key=req.headers.get('x-instructor-key')||'';
    if(!instructorHash||key.length<12||key.length>200||await digest(key)!==instructorHash)throw fail(401,'Instructor access was not verified');
    if(path==='/instructor'&&req.method==='GET')return send({ok:true,sessions:await store.list(),aiConfigured:provider.configured,assessedReleased:released});
    if(path==='/instructor/policy'&&req.method==='POST')return send({ok:true,result:await store.savePolicy(validatePolicy(body))});
    if(path.startsWith('/instructor/session/')&&req.method==='GET'){
     const id=path.split('/').pop();if(!idOK(id))throw fail(400,'Invalid session');const s=await store.session(id);if(!s)throw fail(404,'Session not found');return send({ok:true,session:await view(s)});
    }
    if(path==='/instructor/control'&&req.method==='POST'){
     if(!idOK(body.session_id)||!['pause','resume','extend','recover','reset_token'].includes(body.action)||typeof body.note!=='string'||body.note.trim().length<5||body.note.length>1000)throw fail(400,'Provide the session, action, and a brief reason');
     const args={session_id:body.session_id,note:body.note,minutes:body.minutes};let resumeToken;
     if(body.action==='reset_token'){resumeToken=token();args.token_hash=await digest(resumeToken);}
     const result=await store.command(body.action,args);return send({ok:true,result,resumeToken});
    }
    throw fail(404,'Instructor route not found');
   }
   if(path==='/start'&&req.method==='POST'){
    if(!provider.configured)throw fail(503,'The AI negotiation is not active. Ask your instructor for the assigned arrangement.');
    if(!['graded','practice','pilot'].includes(body.mode))throw fail(400,'Choose a session mode');
    if(body.mode==='graded'&&!released)throw fail(403,'The assessed session has not been released');
    const expectedHash=body.mode==='pilot'?instructorHash:classHash;
    if(!expectedHash||typeof body.classCode!=='string'||await digest(body.classCode)!==expectedHash)throw fail(403,body.mode==='pilot'?'Instructor test access was not verified. Use your instructor access credential.':'Class access code was not verified');
    if(typeof body.name!=='string'||body.name.trim().length<3||body.name.length>120||typeof body.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)||body.email.length>160||body.consent!==true)throw fail(400,'Enter your name, school email, and submission acknowledgement');
    if(body.mode==='pilot'&&!body.email.endsWith('@example.invalid'))throw fail(400,'Pilot sessions require a synthetic example.invalid identity');
    const p=await store.policy(body.mode);if(!p)throw fail(503,'This session has not been configured');
    const id=body.attempt_id,credential=body.attempt_token;
    if(!idOK(id)||typeof credential!=='string'||!/^[0-9a-f-]{72}$/i.test(credential))throw fail(400,'Invalid private attempt credential');
    const existing=await store.session(id);
    if(existing){if(await digest(credential)!==existing.token_hash)throw fail(401,'Attempt could not be resumed');return send({ok:true,token:credential,session:await view(existing)});}
    if(now()<Date.parse(p.release_at))throw fail(403,'This session opens October 22 at 3:30 p.m. Eastern. Return at the opening time.');
    if(now()>=Date.parse(p.close_at))throw fail(403,'The deadline for starting this session has passed. Resume your saved record or contact Professor Levine.');
    try{await store.command('create',{id,case_id:p.id,model_name:p.model_name||provider.model,token_hash:await digest(credential),name:body.name.trim(),email:body.email.trim().toLowerCase()});}catch(e){if(/duplicate|unique/i.test(e.message))throw fail(409,'An attempt already exists for this email. Resume on the original browser or ask your instructor to restore access.');throw e;}
    return send({ok:true,token:credential,session:await view(await store.session(id))});
   }
   if(path.startsWith('/session/')&&req.method==='GET'){const s=await authenticate(req,path.split('/').pop());return send({ok:true,session:await view(s)});}
   if(req.method!=='POST')throw fail(404,'Route not found');
   const s=await authenticate(req,body.session_id),p=await store.policyById(s.case_id);
   if(path==='/turn'){
    if(typeof body.text!=='string'||body.text.trim().length<1||body.text.length>2500||!idOK(body.request_id))throw fail(400,'Enter a message of 1–2,500 characters');
    const begun=await store.command('begin_turn',{session_id:s.id,request_id:body.request_id,text:body.text.trim()});
    if(begun.status!=='started')return send({ok:true,status:begun.status,session:await view(await store.session(s.id))});
    try{
     const result=await provider.reply({policy:p,session:s,events:await store.events(s.id),text:body.text,sessionPhase:begun.phase,termSheet:begun.phase==='confirmation'?s.sheet:null});
     // Provider output is already shape/authority validated. No private diagnostics leave here.
     await store.command('finish_turn',{session_id:s.id,request_id:body.request_id,text:result.value.reply,payload:{...result.value,usage:result.usage}});
    }catch(e){console.error('Avery turn failed',JSON.stringify({providerStatus:Number.isInteger(e.providerStatus)?e.providerStatus:null,providerCode:/^[a-z_]{1,60}$/.test(e.providerCode||'')?e.providerCode:null,kind:e.name==='AbortError'?'timeout':'request_or_validation'}));await store.command('fail_turn',{session_id:s.id,request_id:body.request_id});return send({ok:false,error:'The AI reply could not be confirmed. Your message is saved and the session is paused. Ask your instructor to resume or use the human alternative.',session:await view(await store.session(s.id))},503);}
    return send({ok:true,session:await view(await store.session(s.id))});
   }
   if(path==='/accept'){
    const events=await store.events(s.id),source=events.find(e=>e.seq===body.source_seq);
    const lastCounterpart=events.filter(e=>e.actor==='counterpart').at(-1);
    if(source!==lastCounterpart||!source?.payload?.counterparty_accepts||!evaluateTerms(source.payload.proposal,p).ok)throw fail(400,'No current complete package is available for provisional acceptance');
    await store.command('accept',{session_id:s.id,source_seq:source.seq,proposal:source.payload.proposal});
   }else if(path==='/sheet'){
    if(s.mode==='practice'){if(!Array.isArray(body.sheet)||body.sheet.length!==1||typeof body.sheet[0]?.terms!=='string'||body.sheet[0].terms.trim().length<20||body.sheet[0].terms.length>5000)throw fail(400,'Record your practice terms and one tradeoff');}
    else if(!validateSheet(body.sheet))throw fail(400,'Complete all five term-sheet rows and transcript references');
    await store.command('sheet',{session_id:s.id,sheet:body.sheet});
   }else if(path==='/end'){await store.command('end',{session_id:s.id});}
   else if(path==='/submit'){
    if(s.mode==='practice')body.outcome='Practice complete';
    if(s.mode!=='practice'&&!['Agreement in principle','Partial agreement','No deal'].includes(body.outcome))throw fail(400,'Choose and support the session outcome');
    const receipt=await store.command('submit',{session_id:s.id,outcome:body.outcome});return send({ok:true,...receipt,outcome:body.outcome,session:await view(await store.session(s.id))});
   }else throw fail(404,'Route not found');
   return send({ok:true,session:await view(await store.session(s.id))});
  }catch(e){return send({ok:false,error:e.status?e.message:'The request could not be completed. Your saved record is unchanged; refresh or contact the instructor.'},e.status||500);}
 };
}
