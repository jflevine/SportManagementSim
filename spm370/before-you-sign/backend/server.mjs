const ORIGIN='https://jflevine.github.io';
const PRACTICE=[1,2,0,1,0,2,1,0,2,1];
const choices=['Revise before signing','Seek more information before deciding','Decline this draft'];
export const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const words=s=>typeof s==='string'?(s.trim().match(/\S+/g)||[]).length:0;
const tokenOK=t=>typeof t==='string'&&/^[a-f0-9]{48}$/.test(t);
const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
const err=(message,status=400)=>{const e=Error(message);e.status=status;throw e;};
const validText=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.length<=max;
function activityInput(a){
 if(!a||!Array.isArray(a.notes)||a.notes.length!==5||a.notes.some(x=>!validText(x,1,6000)||words(x)<20))err('Complete all five case notes with at least 20 words each.');
 if(!Array.isArray(a.practice)||a.practice.length!==10||a.practice.some((v,i)=>v!==PRACTICE[i]))err('Clear all ten practice decisions before submitting.');
 if(!choices.includes(a.decision)||!validText(a.recommendation,1,12000)||words(a.recommendation)<100||a.attest!==true)err('Complete the recommendation and individual-work affirmation.');
 return {notes:a.notes.map(x=>x.trim()),practice:[...a.practice],decision:a.decision,recommendation:a.recommendation.trim(),attest:true};
}
function quizInput(values,assessment,complete){
 if(!Array.isArray(values)||values.length!==14)err('The check needs 14 responses.');
 return assessment.items.map((q,i)=>{
  const value=values[i];
  if(q.type==='mc'){if(value===null&&!complete)return null;if(!Number.isInteger(value)||value<0||value>=q.options.length)err('Choose one answer for question '+(i+1)+'.');return value;}
  if(typeof value!=='string'||value.length>6000)err('Check the response for question '+(i+1)+'.');
  if(complete&&words(value)<15)err('Write at least 15 words for question '+(i+1)+'; aim for 40–70.');
  return value.trim();
 });
}
function publicAssessment(a){return {title:a.title,instructions:a.instructions,items:a.items.map(({id,type,points,q,options})=>({id,type,points,q,...(options?{options}:{})}))};}
function view(row,assessment){return {ok:true,id:row.id,name:row.full_name,email:row.email,revision:row.revision,activity:row.activity,activitySubmittedAt:row.activity_submitted_at,activityReceipt:row.activity_receipt,quizAnswers:row.quiz_answers,quizSubmittedAt:row.quiz_submitted_at,quizReceipt:row.quiz_receipt,...(row.activity_submitted_at?{assessment:publicAssessment(assessment)}:{})};}
const numberGrade=(v,max)=>v===null||(typeof v==='number'&&v>=0&&v<=max&&v*2===Math.round(v*2));
export function createHandler({store,instructorKeyHash,rateSecret}){
 if(!store||!instructorKeyHash||!rateSecret)throw Error('Missing private configuration');
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type, x-instructor-key, x-attempt-token','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const send=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&origin!==ORIGIN&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))return send({error:'This origin is not allowed.'},403);
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
   const path=new URL(req.url).pathname;
   if(req.method==='GET'&&!path.endsWith('/instructor'))return send({ok:true,course:'SPM 370',version:'2.0-submissions'});
   if(!['GET','POST'].includes(req.method))return send({error:'Method not allowed.'},405);
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
   const bucket=await hash(rateSecret+':bys:'+ip+':'+Math.floor(Date.now()/60000));
   if(!await store.limit(bucket,160))return send({error:'Too many requests. Wait one minute and try again.'},429);
   let body={};
   if(req.method==='POST'){
    if(!(req.headers.get('content-type')||'').startsWith('application/json'))err('Use JSON for this request.');
    if(Number(req.headers.get('content-length')||0)>90000)err('This request is too large.',413);
    const raw=await req.text();if(raw.length>90000)err('This request is too large.',413);
    try{body=JSON.parse(raw);}catch{err('The request could not be read.');}
    if(!body||typeof body!=='object'||Array.isArray(body))err('Invalid request.');
   }
   if(path.endsWith('/instructor')){
    const key=req.headers.get('x-instructor-key')||'';
    if(key.length<1||key.length>200||await hash(key)!==instructorKeyHash)err('Invalid instructor access key.',401);
    if(req.method==='GET'){const settings=await store.settings();return send({ok:true,submissions:await store.list(),isOpen:settings.is_open,assessment:settings.assessment});}
    if(body.action==='setOpen'){if(typeof body.isOpen!=='boolean')err('Choose an open or closed status.');await store.setOpen(body.isOpen);return send({ok:true});}
    if(!/^[a-f0-9-]{36}$/i.test(body.id||''))err('Select a valid submission.');
    const row=await store.byId(body.id);if(!row)err('Submission not found.',404);
    if(body.revision!==row.revision)err('This record changed. Refresh before saving.',409);
    if(body.action==='recover'){
     const token=newToken();const updated=await store.update(row.id,row.revision,{token_hash:await hash(token)});
     if(!updated)err('This record changed. Refresh and try again.',409);
     return send({ok:true,recoveryCode:token});
    }
    if(body.action==='grade'){
     if(!numberGrade(body.activityScore,10)||(!row.activity_submitted_at&&body.activityScore!==null))err('Enter an activity grade from 0 to 10.');
     if(body.essayScores!==null&&(!row.quiz_submitted_at||!Array.isArray(body.essayScores)||body.essayScores.length!==2||body.essayScores.some(x=>x===null||!numberGrade(x,4))))err('Enter both short-response grades from 0 to 4, or leave both blank.');
     if(typeof body.notes!=='string'||body.notes.length>4000)err('Instructor notes are too long.');
     const updated=await store.update(row.id,row.revision,{activity_score:body.activityScore,essay_scores:body.essayScores,grader_notes:body.notes,reviewed_at:new Date().toISOString()});
     if(!updated)err('This record changed. Refresh and try again.',409);
     return send({ok:true});
    }
    err('Unknown instructor action.');
   }
   if(req.method!=='POST')err('Method not allowed.',405);
   const token=req.headers.get('x-attempt-token')||'';
   if(!tokenOK(token))err('Your private resume code is missing or invalid.',401);
   const tokenHash=await hash(token);
   let row=await store.byToken(tokenHash);
   const settings=await store.settings();
   if(body.action==='start'){
    if(row)return send(view(row,settings.assessment));
    if(!settings.is_open)err('This assignment is closed to new attempts. Contact your instructor.',403);
    const name=typeof body.name==='string'?body.name.trim():'';
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
    if(!validText(name,2,120)||!/^[^\s@]{1,100}@lasalle\.edu$/.test(email))err('Enter your full name and La Salle email ending in @lasalle.edu.');
    if(body.attest!==true)err('Confirm that you are using your own name and email.');
    if(!await store.limit('start:'+bucket,15))err('Too many new attempts. Wait one minute.',429);
    if(await store.byEmail(email))err('An attempt already exists for this email. Resume on your original browser, use your saved resume code, or ask the instructor for a recovery code.',409);
    try{row=await store.insert({full_name:name,email,token_hash:tokenHash});}catch(e){if(e.code==='23505')err('An attempt already exists. Resume your saved attempt.',409);throw e;}
    return send(view(row,settings.assessment));
   }
   if(!row)err('Saved attempt not found. Use your saved resume code or contact your instructor.',401);
   if(body.action==='resume')return send(view(row,settings.assessment));
   if(body.action==='activity'&&row.activity_submitted_at)return send(view(row,settings.assessment));
   if(['saveQuiz','submitQuiz'].includes(body.action)&&row.quiz_submitted_at)return send(view(row,settings.assessment));
   if(!settings.is_open)err('Submissions are currently closed. Your saved work is safe; contact the instructor.',403);
   if(body.revision!==row.revision)err('Progress changed in another tab. Resume to load the saved version before trying again.',409);
   let patch;
   if(body.action==='activity')patch={activity:activityInput(body.activity),activity_submitted_at:new Date().toISOString(),activity_receipt:'BYS-'+crypto.randomUUID().toUpperCase()};
   else if(['saveQuiz','submitQuiz'].includes(body.action)){
    if(!row.activity_submitted_at)err('Submit the activity before beginning Legal Literacy Check 3.',409);
    const complete=body.action==='submitQuiz';
    const answers=quizInput(body.answers,settings.assessment,complete);
    patch={quiz_answers:answers};
    if(complete){if(body.attest!==true)err('Confirm the individual-work statement.');patch={...patch,quiz_submitted_at:new Date().toISOString(),quiz_receipt:'LLC3-'+crypto.randomUUID().toUpperCase(),mc_score:settings.assessment.items.reduce((n,q,i)=>n+(q.type==='mc'&&q.answer===answers[i]?1:0),0)};}
   }else err('Unknown student action.');
   const updated=await store.update(row.id,row.revision,patch);
   if(!updated)err('Progress changed in another tab. Resume before trying again.',409);
   return send(view(updated,settings.assessment));
  }catch(e){return send({error:e.status?e.message:'The server could not confirm this request. Your draft is safe. Please retry.'},e.status||503);}
 };
}
