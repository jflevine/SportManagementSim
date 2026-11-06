import {InputError,reject,isObject,validateAssessment,selectAssessment,publicAssessment,exactKeys,validateIdentity,validateWork,validateGrade,scoreAnswers} from './validation.mjs';
const BASE = '/spm370-labor-v3';
const TOKEN = /^[a-f0-9]{48}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const encoder = new TextEncoder();
export const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
export const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
function equal(a,b) { if(a.length!==b.length)return false;let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);return difference===0; }
async function readBody(req) {
  if (!(req.headers.get('content-type')||'').toLowerCase().startsWith('application/json')) reject('Send a JSON request.',415,'CONTENT_TYPE');
  if (Number(req.headers.get('content-length')||0)>40000) reject('The request is too large.',413,'TOO_LARGE');
  const reader=req.body?.getReader();if(!reader)reject('The request is empty.');
  const chunks=[];let size=0;
  try { for (;;) { const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>40000){await reader.cancel();reject('The request is too large.',413,'TOO_LARGE');}chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{reject('The request could not be read.');}
  if(!isObject(body))reject('The request must be an object.');return body;
}
export function scoreView(row) {
  const reviewed = !!row.submitted_at && row.reviewed_at !== null && typeof row.writing_score === 'number' && Number.isFinite(row.writing_score);
  return {mcScore:row.submitted_at?row.mc_score:null,writingScore:reviewed?row.writing_score:null,finalScore:reviewed?row.mc_score+row.writing_score:null,reviewed,reviewedAt:reviewed?row.reviewed_at:null};
}
export function studentView(row, replayed=false) {
  const a=validateAssessment(row.assessment_snapshot),score=scoreView(row);
  return {ok:true,id:row.id,name:row.full_name,email:row.email,revision:row.revision,assessmentVersion:row.assessment_version,role:row.role,assessment:publicAssessment(a),answers:row.answers,explanation:row.explanation,gameplay:row.gameplay,status:score.reviewed?'REVIEWED':row.submitted_at?'SUBMITTED_PENDING_REVIEW':'DRAFT',submittedAt:row.submitted_at,receipt:row.receipt,...score,graderNotes:score.reviewed?row.grader_notes:'',feedback:row.submitted_at?a.questions.map((q,i)=>({questionId:q.id,selected:row.answers[i],correct:q.answer,earned:q.answer===row.answers[i]?q.points:0,why:q.why})):null,replayed};
}
export function instructorView(row) {
  const {token_hash,assessment_snapshot,submission_fingerprint,...safe}=row;
  return {...safe,reviewQuestions:assessment_snapshot?.questions??null,reviewRubric:assessment_snapshot?.rubric??null,reviewPrompt:assessment_snapshot?.explanationPrompt??null,writingMax:assessment_snapshot?.writingMax??null,...scoreView(row)};
}
export function createHandler({store,instructorKeyHash,rateSecret,clock=()=>new Date(),origins=['https://jflevine.github.io']}) {
  if(!store||!instructorKeyHash||!rateSecret)throw Error('Missing private configuration');
  const allowedOrigins=new Set(origins);
  return async req=>{
    const origin=req.headers.get('origin');
    const headers={'Access-Control-Allow-Origin':origin&&allowedOrigins.has(origin)?origin:origins[0],'Access-Control-Allow-Headers':'content-type, x-attempt-token, x-instructor-key','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const send=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
    if(origin&&!allowedOrigins.has(origin))return send({error:'This origin is not allowed.',code:'ORIGIN_DENIED'},403);
    const path=new URL(req.url).pathname.replace(/\/$/,'').replace(/^\/functions\/v1/,'');
    const instructor=path===BASE+'/instructor';
    if(path!==BASE&&!instructor)return send({error:'Route not found.',code:'NOT_FOUND'},404);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(!['GET','POST'].includes(req.method))return send({error:'Method not allowed.',code:'METHOD_NOT_ALLOWED'},405);
    try {
      const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
      const minute=Math.floor(clock().getTime()/60000);
      if(instructor){
        const key=req.headers.get('x-instructor-key')||'';
        if(key.length<1||key.length>200||!equal(await hash(key),instructorKeyHash)){
          // Failed authentication has its own buckets. Neither keys nor plain IPs are stored.
          // Check the global cap first to bound distinct per-IP bucket creation during abuse.
          // Valid instructor access and all student traffic bypass these failure-only counters.
          const globalBucket=await hash(`${rateSecret}:labor-v3:instructor-failure:global:${minute}`);
          const ipBucket=await hash(`${rateSecret}:labor-v3:instructor-failure:ip:${ip}:${minute}`);
          if(!await store.limit(globalBucket,200)||!await store.limit(ipBucket,20)){
            headers['Retry-After']='60';
            reject('Too many unsuccessful access attempts. Wait one minute and retry.',429,'RATE_LIMITED');
          }
          reject('Invalid instructor access key.',401,'UNAUTHORIZED');
        }
      }
      if(!instructor&&req.method==='GET')return send({ok:true,course:'SPM 370',version:'3.0.0',assessment:'Pixel Forge Labor Decision Lab',identity:'self-reported',textGrading:'semantic review pending after submission'});
      const token=req.headers.get('x-attempt-token')||'';
      if(!instructor&&!TOKEN.test(token))reject('Your private resume code is missing or invalid.',401,'UNAUTHORIZED');
      const bucket=await hash(`${rateSecret}:labor-v3:ip:${ip}:${minute}`);
      if(!await store.limit(bucket,1200))reject('Too many requests. Wait one minute and retry.',429,'RATE_LIMITED');
      let body={};if(req.method==='POST')body=await readBody(req);
      if(instructor){
        if(req.method==='GET'){const settings=await store.settings();selectAssessment(settings.assessment,'management');selectAssessment(settings.assessment,'union');return send({ok:true,isOpen:settings.is_open,assessment:settings.assessment,submissions:(await store.list()).map(instructorView)});}
        if(body.action==='setOpen'){exactKeys(body,['action','isOpen']);if(typeof body.isOpen!=='boolean')reject('Choose an open or closed status.');await store.setOpen(body.isOpen);return send({ok:true,isOpen:body.isOpen});}
        if(!UUID.test(body.id||'')||!Number.isInteger(body.revision)||body.revision<0)reject('Choose a valid submission and revision.');
        const row=await store.byId(body.id);if(!row)reject('Submission not found.',404,'NOT_FOUND');
        const a=validateAssessment(row.assessment_snapshot);let patch,recoveryCode;
        if(body.action==='grade'){exactKeys(body,['action','id','revision','writingScore','notes','reviewerType']);if(!row.submitted_at)reject('The student must submit before writing can be graded.',409,'NOT_SUBMITTED');patch=validateGrade(body,a);}
        else if(body.action==='recover'){exactKeys(body,['action','id','revision']);recoveryCode=newToken();patch={token_hash:await hash(recoveryCode)};}
        else reject('Unknown instructor action.');
        const updated=await store.change(row.id,body.revision,body.action,patch);
        if(!updated)reject('This record changed. Refresh before saving.',409,'REVISION_CONFLICT');
        return send(recoveryCode?{ok:true,recoveryCode,revision:updated.revision}:{ok:true,submission:instructorView(updated),score:scoreView(updated)});
      }
      if(req.method!=='POST')reject('Method not allowed.',405,'METHOD_NOT_ALLOWED');
      const tokenHash=await hash(token);
      if(!await store.limit(await hash(`${rateSecret}:labor-v3:attempt:${tokenHash}:${minute}`),90))reject('Too many requests. Wait one minute and retry.',429,'RATE_LIMITED');
      let row=await store.byToken(tokenHash);
      if(body.action==='start'){
        exactKeys(body,['action','name','email','attest','role']);
        if(row)return send(studentView(row,true));
        const settings=await store.settings(),a=selectAssessment(settings.assessment,body.role);
        if(!settings.is_open)reject('This lab is closed to new attempts. Contact your instructor.',403,'CLOSED');
        const identity=validateIdentity(body);
        if(await store.byEmail(identity.email,a.version))reject('An attempt already exists. Resume with your original browser or private resume code, or ask your instructor for recovery.',409,'ATTEMPT_EXISTS');
        try {row=await store.insert({...identity,token_hash:tokenHash,assessment_version:a.version,role:body.role,assessment_snapshot:a,answers:a.questions.map(()=>null)});} catch(e) {if(e.code!=='23505')throw e;row=await store.byToken(tokenHash);if(!row)reject('An attempt already exists. Resume your saved attempt.',409,'ATTEMPT_EXISTS');}
        return send(studentView(row));
      }
      if(!row)reject('Saved attempt not found. Check your resume code or contact your instructor.',401,'UNAUTHORIZED');
      if(body.action==='resume'){exactKeys(body,['action']);return send(studentView(row));}
      if(!['saveDraft','submit'].includes(body.action))reject('Unknown student action.');
      exactKeys(body,['action','revision','answers','explanation','gameplay',...(body.action==='submit'?['attest']:[])]);
      // An uncertain network retry must return the original immutable receipt, never replace answers.
      if(row.submitted_at)return send(studentView(row,true));
      if(!Number.isInteger(body.revision)||body.revision<0)reject('A valid saved revision is required.');
      const settings=await store.settings();if(!settings.is_open)reject('Submissions are closed. Your saved work remains available.',403,'CLOSED');
      const a=validateAssessment(row.assessment_snapshot),work=validateWork(body,a,body.action==='submit');
      let patch={...work};
      if(body.action==='submit')patch={...patch,mc_score:scoreAnswers(work.answers,a),receipt:'LABOR-'+crypto.randomUUID().toUpperCase(),submission_fingerprint:await hash(JSON.stringify({version:row.assessment_version,answers:work.answers,explanation:work.explanation,gameplay:work.gameplay}))};
      const updated=await store.change(row.id,body.revision,body.action,patch);
      if(!updated)reject('Your record changed in another tab. Reconnect before retrying.',409,'REVISION_CONFLICT');
      return send(studentView(updated));
    }catch(e){if(e instanceof InputError)return send({error:e.message,code:e.code},e.status);return send({error:'The server could not confirm this request. Keep your draft and reconnect before retrying.',code:'SERVER_UNAVAILABLE'},503);}
  };
}
