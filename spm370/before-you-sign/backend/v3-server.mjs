const ORIGIN='https://jflevine.github.io';
export const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
const tokenOK=s=>typeof s==='string'&&/^[a-f0-9]{48}$/.test(s);
const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
const words=s=>typeof s==='string'?(s.trim().match(/\S+/g)||[]).length:0;
const fail=(message,status=400)=>{const e=Error(message);e.status=status;throw e;};
const validText=(s,max)=>typeof s==='string'&&s.length<=max;
const decisions=['Revise before signing','Seek more information before deciding','Decline this draft'];
const grade=(n,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max&&Number.isInteger(n*2);
export function scoreView(row){
 const reviewed=!!row.submitted_at&&Array.isArray(row.note_scores)&&row.note_scores.length===6&&row.note_scores.every(n=>grade(n,1))&&grade(row.brief_score,2);
 const writing=reviewed?row.note_scores.reduce((a,b)=>a+b,0)+row.brief_score:null;
 return {mcScore:row.mc_score,writingScore:writing,finalScore:reviewed?row.mc_score+writing:null,reviewed};
}
function view(row,a){
 const assessment={title:a.title,subtitle:a.subtitle,version:a.version,maxPoints:a.maxPoints,stages:a.stages.map(s=>({title:s.title,short:s.short,minutes:s.minutes,concept:s.concept,slides:s.slides,message:s.message,evidence:s.evidence,teach:s.teach,note:s.note,scenarioNotice:s.scenarioNotice,questions:s.questions.map(q=>({prompt:q.prompt,options:q.options}))})),rubric:{notes:a.rubric.notes,brief:a.rubric.brief}};
 const feedback=a.stages.map((s,i)=>row.stage_answers[i]?s.questions.map((q,j)=>({selected:row.stage_answers[i][j],correct:q.answer,why:q.why,earned:row.stage_answers[i][j]===q.answer?1:0})):null);
 return {ok:true,id:row.id,name:row.full_name,email:row.email,revision:row.revision,stageAnswers:row.stage_answers,notes:row.notes,decision:row.final_decision,brief:row.final_brief,submittedAt:row.submitted_at,receipt:row.receipt,assessment,feedback,...scoreView(row)};
}
export function createHandler({store,instructorKeyHash,rateSecret}){
 if(!store||!instructorKeyHash||!rateSecret)throw Error('Missing private configuration');
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type, x-instructor-key, x-attempt-token','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const send=(b,status=200)=>new Response(JSON.stringify(b),{status,headers});
  if(origin&&origin!==ORIGIN&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))return send({error:'This origin is not allowed.'},403);
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
   const admin=new URL(req.url).pathname.endsWith('/instructor');
   if(req.method==='GET'&&!admin)return send({ok:true,course:'SPM 370',version:'3.0.0',maxPoints:20});
   if(!['GET','POST'].includes(req.method))fail('Method not allowed.',405);
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
   const bucket=await hash(rateSecret+':llc3-v3:'+ip+':'+Math.floor(Date.now()/60000));
   if(!await store.limit(bucket,600))fail('Too many requests. Wait one minute and retry.',429);
   let b={};
   if(req.method==='POST'){
    if(!(req.headers.get('content-type')||'').startsWith('application/json'))fail('Use JSON for this request.');
    if(Number(req.headers.get('content-length')||0)>60000)fail('Request too large.',413);
    const raw=await req.text();if(raw.length>60000)fail('Request too large.',413);
    try{b=JSON.parse(raw);}catch{fail('The request could not be read.');}
    if(!b||typeof b!=='object'||Array.isArray(b))fail('Invalid request.');
   }
   if(admin){
    const key=req.headers.get('x-instructor-key')||'';
    if(key.length<1||key.length>200||await hash(key)!==instructorKeyHash)fail('Invalid instructor access key.',401);
    if(req.method==='GET'){const s=await store.settings();return send({ok:true,isOpen:s.is_open,assessment:s.assessment,submissions:(await store.list()).map(r=>({...r,...scoreView(r)}))});}
    if(b.action==='setOpen'){if(typeof b.isOpen!=='boolean')fail('Choose an open or closed status.');await store.setOpen(b.isOpen);return send({ok:true});}
    if(!/^[a-f0-9-]{36}$/i.test(b.id||''))fail('Choose a valid submission.');
    const r=await store.byId(b.id);if(!r)fail('Submission not found.',404);
    if(b.revision!==r.revision)fail('This record changed. Refresh before saving.',409);
    let patch,token;
    if(b.action==='recover'){token=newToken();patch={token_hash:await hash(token)};}
    else if(b.action==='grade'){
     if(!r.submitted_at)fail('The student must submit before writing is graded.');
     if(!Array.isArray(b.noteScores)||b.noteScores.length!==6||b.noteScores.some(n=>!grade(n,1))||!grade(b.briefScore,2))fail('Enter six note grades (0, 0.5, or 1) and a final-brief grade from 0 to 2.');
     if(!validText(b.notes,4000))fail('Review notes are too long.');
     patch={note_scores:b.noteScores,brief_score:b.briefScore,grader_notes:b.notes,reviewed_at:new Date().toISOString()};
    }else fail('Unknown instructor action.');
    const updated=await store.update(r.id,r.revision,patch);if(!updated)fail('This record changed. Refresh and try again.',409);
    return send({ok:true,...(token?{recoveryCode:token}:{score:scoreView(updated)})});
   }
   if(req.method!=='POST')fail('Method not allowed.',405);
   const token=req.headers.get('x-attempt-token')||'';if(!tokenOK(token))fail('Your private resume code is missing or invalid.',401);
   const tokenHash=await hash(token),s=await store.settings(),a=s.assessment;
   let r=await store.byToken(tokenHash);
   if(b.action==='start'){
    if(r)return send(view(r,a));
    if(!s.is_open)fail('This check is closed to new attempts. Contact your instructor.',403);
    const name=typeof b.name==='string'?b.name.trim():'';const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';
    if(name.length<2||name.length>120||!/^[^\s@]{1,100}@lasalle\.edu$/.test(email)||b.attest!==true)fail('Enter your full name and La Salle email, then confirm individual work.');
    if(!await store.limit('start:'+bucket,120))fail('Too many new attempts. Wait one minute.',429);
    if(await store.byEmail(email))fail('An attempt already exists for this email. Use the original browser, your resume code, or an instructor recovery code.',409);
    try{r=await store.insert({full_name:name,email,token_hash:tokenHash});}catch(e){if(e.code==='23505')fail('An attempt already exists. Resume your saved attempt.',409);throw e;}
    return send(view(r,a));
   }
   if(!r)fail('Saved attempt not found. Check the resume code or contact your instructor.',401);
   if(b.action==='resume')return send(view(r,a));
   if(r.submitted_at&&['lockStage','saveNote','saveBrief','submit'].includes(b.action))return send(view(r,a));
   const index=b.stage;
   if(b.action==='lockStage'&&Number.isInteger(index)&&index>=0&&index<6&&r.stage_answers[index])return send(view(r,a));
   if(!s.is_open)fail('Submissions are closed. Your saved work remains available.',403);
   if(b.revision!==r.revision)fail('Your record changed in another tab. Select Reconnect to load the saved version.',409);
   let patch;
   if(['lockStage','saveNote'].includes(b.action)){
    if(!Number.isInteger(index)||index<0||index>=6)fail('Choose a valid vignette.');
    if(index>0&&(!r.stage_answers[index-1]||words(r.notes[index-1])<15))fail('Complete the preceding vignette and save its case note first.',409);
    if(b.action==='lockStage'){
     if(!Array.isArray(b.answers)||b.answers.length!==2||b.answers.some((v,j)=>!Number.isInteger(v)||v<0||v>=a.stages[index].questions[j].options.length))fail('Choose one answer for each of the two questions.');
     const answers=[...r.stage_answers];answers[index]=[...b.answers];
     const score=answers.reduce((total,values,i)=>total+(values?a.stages[i].questions.reduce((n,q,j)=>n+(q.answer===values[j]?1:0),0):0),0);
     patch={stage_answers:answers,mc_score:score};
    }else{
     if(!r.stage_answers[index])fail('Submit the multiple-choice answers before writing the case note.',409);
     if(!validText(b.note,6000)||words(b.note)<15)fail('Write at least 15 words; aim for 30–50 with a concept and a fact.');
     const notes=[...r.notes];notes[index]=b.note.trim();patch={notes};
    }
   }else if(['saveBrief','submit'].includes(b.action)){
    if(r.stage_answers.some(v=>!v)||r.notes.some(n=>words(n)<15))fail('Complete all six vignettes and case notes first.',409);
    if(!validText(b.brief,12000)||typeof b.decision!=='string'||(b.decision&&!decisions.includes(b.decision)))fail('Check the final recommendation.');
    patch={final_brief:b.brief.trim(),final_decision:b.decision};
    if(b.action==='submit'){
     if(!decisions.includes(b.decision)||words(b.brief)<100||b.attest!==true)fail('Choose a recommendation, write at least 100 words, and confirm individual work.');
     patch={...patch,submitted_at:new Date().toISOString(),receipt:'LLC3-'+crypto.randomUUID().toUpperCase()};
    }
   }else fail('Unknown student action.');
   const updated=await store.update(r.id,r.revision,patch);if(!updated)fail('Progress changed in another tab. Reconnect before retrying.',409);
   return send(view(updated,a));
  }catch(e){return send({error:e.status?e.message:'The server could not confirm this request. Keep your draft and retry.'},e.status||503);}
 };
}
