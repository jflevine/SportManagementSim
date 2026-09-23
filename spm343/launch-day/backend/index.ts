// Answer key and question bank are stored privately, never in this public repository.
const URL = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers = {'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
class ApiError extends Error {constructor(message:string,public status=400){super(message)}}
const need=(v:any,m:string,status=400)=>{if(!v)throw new ApiError(m,status)};
const reply=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function db(path:string,method='GET',body?:any){
 const r=await fetch(URL+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){if(r.status===409)throw new ApiError('This email is already registered in this session. Return to the original browser or ask your instructor for help.',409);throw new ApiError('Unable to confirm the save. Your answers are retained on this device; please retry.',503)}
 return r.status===204?[]:r.json();
}
const clean=(x:any,min:number,max:number)=>{need(typeof x==='string'&&x.trim().length>=min&&x.length<=max,'Complete the required fields.');return x.trim()};
function answers(value:any){need(value&&typeof value==='object'&&!Array.isArray(value),'Invalid answers.');const a:any={};for(const [k,v] of Object.entries(value)){need(/^(?:[1-9]|1[0-2])$/.test(k)&&['A','B','C','D'].includes(v as string),'Invalid answer selection.');a[k]=v;}return a;}
function safe(a:any,session:any){return {id:a.id,name:a.student_name,email:a.email,answers:a.answers,version:a.version,startedAt:a.started_at,submittedAt:a.submitted_at,score:session.results_released?a.score:null,roundScores:session.results_released?a.round_scores:null,receipt:a.submitted_at?a.id:null}}
async function bank(){const r=await db('spm343_kc2_assessments?id=eq.kc2&select=questions,answer_key');need(r[0],'Assessment unavailable. Ask your instructor.',503);return r[0]}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('',{headers});if(req.method!=='POST')return reply({error:'Use POST.'},405);
 try{
  const raw=await req.text();need(raw.length<=12000,'Request too large.',413);let b:any;try{b=JSON.parse(raw)}catch{throw new ApiError('Invalid request.')}
  need(b&&typeof b==='object','Invalid request.');
  const actions=['list','create','configure','results','recover'];
  if(actions.includes(b.action)){
   const key=clean(b.adminKey,20,150);const r=await db('spm343_arena_access?id=eq.instructor&select=key_hash');need(r[0]?.key_hash===await digest(key),'Instructor key not recognized.',401);
   if(b.action==='list')return reply({sessions:await db('spm343_kc2_sessions?select=*&order=created_at.desc&limit=200')});
   if(b.action==='create'){
    const code=Array.from(crypto.getRandomValues(new Uint8Array(8))).map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
    const rows=await db('spm343_kc2_sessions','POST',{code,label:clean(b.label,2,100)});return reply({session:rows[0]});
   }
   need(typeof b.code==='string'&&/^[A-Z2-9]{8}$/.test(b.code),'Enter a valid session code.');
   if(b.action==='configure'){
    const changes:any={};if(typeof b.isOpen==='boolean')changes.is_open=b.isOpen;if(typeof b.release==='boolean')changes.results_released=b.release;
    need(Object.keys(changes).length,'No setting supplied.');const rows=await db('spm343_kc2_sessions?code=eq.'+b.code,'PATCH',changes);need(rows[0],'Session not found.',404);return reply({session:rows[0]});
   }
   if(b.action==='recover'){
    need(typeof b.id==='string'&&/^[a-f0-9-]{36}$/.test(b.id),'Invalid attempt.');need(typeof b.token==='string'&&/^[a-f0-9]{64}$/.test(b.token),'Invalid recovery token.');
    const rows=await db('spm343_kc2_attempts?id=eq.'+b.id+'&session_code=eq.'+b.code,'PATCH',{token_hash:await digest(b.token)});need(rows[0],'Attempt not found.',404);return reply({ok:true});
   }
   const [sessions,rows]=await Promise.all([db('spm343_kc2_sessions?code=eq.'+b.code),db('spm343_kc2_attempts?session_code=eq.'+b.code+'&select=id,student_name,email,answers,version,started_at,submitted_at,score,round_scores&order=started_at.asc&limit=1000')]);
   need(sessions[0],'Session not found.',404);return reply({session:sessions[0],attempts:rows});
  }
  need(['join','resume','save','submit'].includes(b.action),'Unknown action.');
  need(typeof b.code==='string'&&/^[A-Z2-9]{8}$/.test(b.code),'Enter the eight-character session code.');
  need(typeof b.token==='string'&&/^[a-f0-9]{64}$/.test(b.token),'Your access token is missing. Rejoin or contact your instructor.',401);
  const hash=await digest(b.token);const sessions=await db('spm343_kc2_sessions?code=eq.'+b.code);const s=sessions[0];need(s,'Session not found. Check the code with your instructor.',404);
  let rows=await db('spm343_kc2_attempts?session_code=eq.'+b.code+'&token_hash=eq.'+hash);let a=rows[0];
  if(b.action==='join'&&!a){
   need(s.is_open,'The session is not open yet. Wait for your instructor.',403);
   const name=clean(b.name,2,100),email=clean(b.email,5,160).toLowerCase();need(/^[^\s@]+@lasalle\.edu$/.test(email),'Use your La Salle email address.');
   a=(await db('spm343_kc2_attempts','POST',{session_code:b.code,student_name:name,email,token_hash:hash}))[0];
  }
  need(a,'Attempt not found. Use your original browser or recovery token.',401);
  const response=async()=>({attempt:safe(a,s),session:{code:s.code,label:s.label,isOpen:s.is_open,resultsReleased:s.results_released},questions:(await bank()).questions,serverNow:Date.now()});
  if(b.action==='join'||b.action==='resume'||a.submitted_at)return reply(await response());
  need(s.is_open,'The session is closed. Your answers remain on this device. Ask your instructor to reopen it.',403);
  const selected=answers(b.answers);need(Number.isInteger(b.version)&&a.version===b.version,'Your attempt changed in another tab. Reload this page to restore the latest saved answers.',409);
  const changes:any={answers:selected,version:a.version+1};
  if(b.action==='submit'){
   need(Object.keys(selected).length===12,'Answer all 12 questions before submitting.');const key=(await bank()).answer_key;
   const counts=[0,0,0];for(let i=1;i<=12;i++){if(selected[i]===key[i])counts[i<=3?0:i<=8?1:2]++}
   changes.score=counts.reduce((x,y)=>x+y,0);changes.round_scores=counts;changes.submitted_at=new Date().toISOString();
  }
  const saved=await db('spm343_kc2_attempts?id=eq.'+a.id+'&version=eq.'+a.version+'&submitted_at=is.null','PATCH',changes);
  if(!saved.length){a=(await db('spm343_kc2_attempts?id=eq.'+a.id+'&token_hash=eq.'+hash))[0];if(a?.submitted_at)return reply(await response());throw new ApiError('Your attempt changed in another tab. Reload to restore the latest saved answers.',409)}
  a=saved[0];return reply(await response());
 }catch(e){return reply({error:e instanceof ApiError?e.message:'Unable to complete the request. Please retry.'},e instanceof ApiError?e.status:500)}
});
