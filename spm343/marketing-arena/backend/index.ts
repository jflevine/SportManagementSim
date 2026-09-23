import { BRANDS, PHASES, ROUND_MINUTES, OPTIONS, AUDIENCES, OBJECTIVES, RUBRIC, SHOCK, makeRoom, marketResults, marketSignals, validateCampaign, roleFor, roleIntel, totalGrade, clone } from './model.mjs';
const URL=Deno.env.get('SUPABASE_URL')!,KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const reply=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function db(path:string,method='GET',body?:any){const r=await fetch(URL+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error('Storage unavailable. Your work has not been confirmed; retry.');return r.status===204?[]:await r.json();}
const need=(ok:any,msg:string)=>{if(!ok)throw Error(msg);};
function text(v:any,min=1,max=2500){need(typeof v==='string'&&v.trim().length>=min&&v.length<=max,'Please complete the required response.');return v.trim();}
function cleanCampaign(v:any){const allowed=[...Object.keys(OPTIONS),'audience','objective','tone','before','during','after','strategy','behavior','audienceReason','mixReason','activationReason','authReason','riskReason','marketingType','response','protect','adaptationReason'];let c:any={};for(const k of allowed)if(typeof v?.[k]==='string')c[k]=v[k].slice(0,2500);return c;}
function publicState(r:any){
 const results=r.phase>=6?(r.finalResults||marketResults(r.teams,true)):r.phase>=3?marketResults(r.teams,r.phase>=5):[];
 return {code:r.code,label:r.label,lab:r.lab,phase:r.phase,paused:r.paused,makeup:r.makeup,timer:r.timer,serverNow:Date.now(),shock:r.phase>=5?SHOCK:null,
 teams:r.teams.map((t:any)=>({id:t.id,brand:t.brand,count:r.students.filter((s:any)=>s.team===t.id).length,locked:!!t.initial,adapted:!!t.final})),
 results:results.map((x:any)=>({team:x.team,brand:x.brand,rank:x.rank,power:x.power,metrics:x.metrics,delta:r.initialResults?x.power-(r.initialResults.find((a:any)=>a.team===x.team)?.power||x.power):null,initialRank:r.initialResults?.find((a:any)=>a.team===x.team)?.rank||null})),
 signals:marketSignals(r.teams,r.phase>=5),initialResults:r.phase>=4?r.initialResults?.map((x:any)=>({team:x.team,power:x.power,rank:x.rank,metrics:x.metrics})):null,
 choices:r.revealChoices&&r.phase>=6?r.teams.filter((t:any)=>t.initial).map((t:any)=>({brand:t.brand,...Object.fromEntries([...Object.keys(OPTIONS),'audience','objective','tone','before','during','after'].map(k=>[k,(t.final||t.initial)[k]]))})):null};
}
function safeStudent(s:any){const {tokenHash,...out}=s;return out;}
function view(r:any,admin:boolean,hash:string){let out:any=publicState(r);if(admin){out.admin=true;out.students=r.students.map(safeStudent);out.privateTeams=r.teams;out.events=r.events;return out;}
 const s=r.students.find((s:any)=>s.tokenHash===hash);if(s){out.me=safeStudent(s);out.role=roleFor(r,s,r.phase>=5?1:0);out.intel=s.initial&&r.phase>=2?roleIntel(r,s):[];
 const t=r.teams.find((t:any)=>t.id===s.team);out.editor=t.editor;
 if(s.initial&&r.phase>=2){out.team=t;out.peers=r.students.filter((p:any)=>p.team===s.team).map((p:any)=>({id:p.id,name:p.name,ready:!!p.initial,role:roleFor(r,p,r.phase>=5?1:0),initial:p.initial}));out.ownResult=(r.phase>=6?(r.finalResults||marketResults(r.teams,true)):marketResults(r.teams,r.phase>=5)).find((x:any)=>x.team===t.id);}
 }return out;
}
function mutate(r:any,b:any,admin:boolean,hash:string){
 const now=new Date().toISOString();const s=r.students.find((s:any)=>s.tokenHash===hash),t=s?r.teams.find((t:any)=>t.id===s.team):null;
 const event=(type:string,detail:any={})=>{r.events.push({type,at:now,actor:admin?'instructor':s?.id||'join',...detail});};
 if(b.action==='join'){
  need(r.phase<=3&&!r.paused,'Joining is closed for this round. Ask your instructor.');need(/^[a-f0-9]{64}$/.test(b.token||''),'A recovery key is required.');
  if(s)return;
  const email=text(b.email,5,160).toLowerCase();need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter your school email address.');
  need(!r.students.some((x:any)=>x.email===email),'This email already joined. Use your recovery key or ask the instructor to reset access.');
  const team=r.teams.find((x:any)=>x.id===b.team);need(team,'Choose a team.');need(r.students.filter((x:any)=>x.team===b.team).length<(r.makeup?1:6),'This team is full.');
  const id=crypto.randomUUID();r.students.push({id,name:text(b.name,2,100),email,team:b.team,tokenHash:hash,joinedAt:now,initial:null,defense:null,grades:{}});if(!team.editor)team.editor=id;event('join',{student:id,team:b.team});return;
 }
 if(admin){
  if(b.action==='advance'){
   need(r.phase<8,'The session is complete.');
   if(r.phase===1)need(r.students.length&&r.students.every((x:any)=>x.initial||x.excused),'Some individual positions are missing. Complete them or mark absent students excused.');
   if(r.phase===3)need(r.teams.filter((x:any)=>r.students.some((s:any)=>s.team===x.id&&!s.excused)).every((x:any)=>x.initial),'Some active teams have not locked a campaign.');
   if(r.phase===5)need(r.teams.filter((x:any)=>x.initial).every((x:any)=>x.final),'Some teams have not locked a shock response.');
   if(r.phase===7)need(r.students.every((x:any)=>x.defense||x.excused),'Some individual defenses are missing. Complete them or excuse the student.');
   r.phase++;r.paused=false;r.timer={end:Date.now()+ROUND_MINUTES[r.phase]*60000,remaining:ROUND_MINUTES[r.phase]*60000};
   if(r.phase===4)r.initialResults=marketResults(r.teams,false);
   if(r.phase===5)r.teams.forEach((t:any)=>{const p=r.students.filter((x:any)=>x.team===t.id&&!x.excused);if(p.length)t.editor=p[1%p.length].id;t.draft=clone(t.initial);t.draftVersion++;});
   if(r.phase===6)r.finalResults=marketResults(r.teams,true);event('phase',{phase:r.phase});return;
  }
  if(b.action==='pause'){r.paused=!r.paused;if(r.timer){if(r.paused){r.timer.remaining=Math.max(0,r.timer.end-Date.now());r.timer.end=null;}else r.timer.end=Date.now()+r.timer.remaining;}event('pause',{paused:r.paused});return;}
  if(b.action==='timer'){const seconds=Number(b.seconds);need(Number.isFinite(seconds)&&seconds>=0&&seconds<=3600,'Choose 0–60 minutes.');r.timer=seconds?{end:r.paused?null:Date.now()+seconds*1000,remaining:seconds*1000}:null;return;}
  if(b.action==='reveal'){need(r.phase>=6,'Available after the final reveal.');r.revealChoices=!r.revealChoices;return;}
  if(b.action==='move'){
   const p=r.students.find((x:any)=>x.id===b.student);need(p&&r.phase<3&&!p.initial,'Move teams before the student locks an individual position.');need(r.teams.some((x:any)=>x.id===b.team),'Choose a team.');need(r.students.filter((x:any)=>x.team===b.team).length<6,'This team is full.');p.team=b.team;r.teams.forEach((t:any)=>{if(!r.students.some((x:any)=>x.id===t.editor&&x.team===t.id))t.editor=r.students.find((x:any)=>x.team===t.id)?.id;});event('move',{student:p.id,team:p.team});return;
  }
  if(b.action==='excuse'){const p=r.students.find((x:any)=>x.id===b.student);need(p,'Student not found.');p.excused=!p.excused;event('excuse',{student:p.id,excused:p.excused});return;}
  if(b.action==='editor'){const p=r.students.find((x:any)=>x.id===b.student);need(p&&p.initial&&!p.excused,'Choose a participating student with an initial position.');r.teams.find((x:any)=>x.id===p.team).editor=p.id;event('editor',{student:p.id});return;}
  if(b.action==='recover'){const p=r.students.find((x:any)=>x.id===b.student);need(p&&/^[a-f0-9]{64}$/.test(b.newHash),'Student not found or key invalid.');p.tokenHash=b.newHash;event('recover',{student:p.id});return;}
  if(b.action==='grade'){
   const target=b.level==='group'?r.teams.find((x:any)=>x.id===b.target):r.students.find((x:any)=>x.id===b.target);need(target,'Record not found.');let scores:any={};for(const c of RUBRIC.filter((x:any)=>x.level===b.level)){const v=b.scores?.[c.id];need(v===null||(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=c.max),'Score out of range: '+c.label);scores[c.id]=v;}
   target.grades=scores;target.comment=typeof b.comment==='string'?b.comment.slice(0,5000):'';target.gradedAt=now;event('grade',{level:b.level,target:b.target,scores});return;
  }
  throw Error('Unknown instructor action.');
 }
 need(s,'Your access key is not recognized. Rejoin with your saved recovery key.');need(!r.paused,'The instructor has paused the activity. Your draft is retained.');need(!s.excused,'This record is marked excused. Ask your instructor to reactivate it.');
 if(b.action==='initial'){
  need(r.phase>=1&&r.phase<=3,'The individual-position round is not open.');if(s.initial)return;
  need(AUDIENCES[b.position?.audience]&&OBJECTIVES[b.position?.objective],'Choose an audience and objective.');s.initial={audience:b.position.audience,objective:b.position.objective,text:text(b.position.text,80,1800),at:now};event('initial');return;
 }
 if(b.action==='personalDraft'){need((r.phase<=3&&!s.initial)||(r.phase===7&&!s.defense),'This response is already locked.');s[r.phase===7?'defenseDraft':'personalDraft']=typeof b.text==='string'?b.text.slice(0,2500):'';return;}
 if(b.action==='draft'||b.action==='campaign'){
  need(s.initial,'Lock your individual position before team deliberation.');need(r.phase===3||r.phase===5,'The campaign round is not open.');need(t.editor===s.id,'Only the current team recorder can save or lock the shared campaign.');
  const final=r.phase===5;need(!(final?t.final:t.initial),'This campaign has already been locked.');need(b.draftVersion===t.draftVersion,'Your team draft changed. Refresh the campaign before saving.');
  const c=cleanCampaign(b.campaign);if(b.action==='campaign'){validateCampaign(c,final?t.initial:null);if(!final)need(r.students.filter((x:any)=>x.team===t.id&&!x.excused).every((x:any)=>x.initial),'Every present teammate must lock an individual position first.');t[final?'final':'initial']={...c,at:now,submittedBy:s.id};event(final?'adaptation':'campaign',{team:t.id});}
  t.draft=c;t.draftVersion++;return;
 }
 if(b.action==='defense'){need(r.phase===7,'The individual-defense round is not open.');need(s.initial&&t.final,'Complete the earlier decisions first.');if(s.defense)return;s.defense={text:text(b.text,140,2500),at:now};event('defense');return;}
 throw Error('Unknown action.');
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('',{headers});if(req.method!=='POST')return reply({error:'Use POST.'},405);
 try{
  need(Number(req.headers.get('content-length')||0)<60000,'Request is too large.');const raw=await req.text();need(raw.length<60000,'Request is too large.');const b=JSON.parse(raw);
  let admin=false;const hash=await digest(typeof b.token==='string'?b.token:'');
  if(b.adminKey){need(typeof b.adminKey==='string'&&b.adminKey.length<=150,'Invalid instructor key.');const keys=await db('spm343_arena_access?id=eq.instructor&select=key_hash');admin=keys[0]?.key_hash===await digest(b.adminKey);need(admin,'Instructor key not recognized.');}
  if(b.action==='list'){need(admin,'Instructor access required.');const rows=await db('spm343_arena_rooms?select=code,state,updated_at&order=updated_at.desc&limit=100');return reply({rooms:rows.map((x:any)=>({code:x.code,label:x.state.label,phase:x.state.phase,students:x.state.students.length,updatedAt:x.updated_at,makeup:x.state.makeup}))});}
  if(b.action==='create'){need(admin,'Instructor access required.');const code=Array.from(crypto.getRandomValues(new Uint8Array(8))).map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');const room=makeRoom(code,text(b.label,2,100),b.makeup===true);await db('spm343_arena_rooms','POST',{code,state:room});return reply(view(room,true,hash));}
  need(typeof b.code==='string'&&/^[A-Z2-9]{8}$/.test(b.code),'Enter the eight-character room code.');
  for(let attempt=0;attempt<18;attempt++){
   const rows=await db('spm343_arena_rooms?code=eq.'+b.code+'&select=state,version');need(rows.length,'Room not found. Check the code with your instructor.');const {state:r,version}=rows[0];
   if(b.action==='state'){if(b.token)need(r.students.some((s:any)=>s.tokenHash===hash),'Your recovery key is not recognized in this room.');return reply({...view(r,admin,hash),version});}
   mutate(r,b,admin,hash);
   const saved=await db(`spm343_arena_rooms?code=eq.${b.code}&version=eq.${version}`,'PATCH',{state:r,version:version+1,updated_at:new Date().toISOString()});
   if(saved.length)return reply({...view(r,admin,hash),version:version+1});
   await new Promise(res=>setTimeout(res,40+Math.random()*180));
  }
  return reply({error:'The class is saving at once. Please retry; nothing was overwritten.'},409);
 }catch(e){return reply({error:e instanceof Error?e.message:'Unable to complete request.'},400);}
});
