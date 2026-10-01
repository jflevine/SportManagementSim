import {VERSION,MAX_SCORE,InputError,validateSubmission,validateGrade,requestFingerprintInput} from './validation.mjs';
const TABLE='spm370_offscript_submissions';
const ORIGINS=new Set(['https://jflevine.github.io']);
const PUBLIC_COLUMNS='receipt,submitted_at,score,max_score,completion_score,concept_score,review_status';
const INSTRUCTOR_COLUMNS='id,first_name,last_name,email,partner_name,choices,checks,reflections,ending_id,score,max_score,completion_score,concept_score,review_status,grade_override,grader_notes,graded_at,receipt,submitted_at,source_version,version';
const encoder=new TextEncoder();
export async function sha256(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
function safeCompare(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function receipt(row,replayed=false){return {ok:true,receipt:row.receipt,submittedAt:row.submitted_at,score:row.score,maxScore:row.max_score,completionScore:row.completion_score,conceptScore:row.concept_score,reviewStatus:row.review_status,status:'SUBMITTED',replayed};}
async function readJSON(req,maxBytes){
  if(!(req.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))throw new InputError('Send a JSON request.',415);
  if(Number(req.headers.get('content-length')||0)>maxBytes)throw new InputError('The submission is too large.',413);
  const reader=req.body?.getReader();if(!reader)throw new InputError('The request is empty.');
  const parts=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new InputError('The submission is too large.',413);}parts.push(value);}}finally{reader.releaseLock();}
  const joined=new Uint8Array(size);let offset=0;for(const part of parts){joined.set(part,offset);offset+=part.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined));}catch{throw new InputError('The request could not be read.');}
}

// Dependency injection enables complete local synthetic tests with no real records.
export function createHandler({db,instructorKeyHash,rateSecret,clock=()=>new Date()}){
  return async function handle(req){
    const origin=req.headers.get('origin');
    const headers={'Access-Control-Allow-Origin':origin&&ORIGINS.has(origin)?origin:'https://jflevine.github.io','Access-Control-Allow-Headers':'content-type, x-instructor-key','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const send=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
    if(origin&&!ORIGINS.has(origin))return send({error:'Origin not allowed.',code:'ORIGIN_DENIED'},403);
    const url=new URL(req.url),path=url.pathname.replace(/\/$/,'');
    const base=path==='/spm370-offscript'||path==='/functions/v1/spm370-offscript';
    const instructor=path==='/spm370-offscript/instructor'||path==='/functions/v1/spm370-offscript/instructor';
    if(!base&&!instructor)return send({error:'Route not found.',code:'NOT_FOUND'},404);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(!['GET','POST'].includes(req.method))return send({error:'Method not allowed.',code:'METHOD_NOT_ALLOWED'},405);
    try{
      // Instructor authorization occurs before any database operation.
      if(instructor){
        const key=req.headers.get('x-instructor-key')||'';
        if(!key||key.length>200||!instructorKeyHash||!safeCompare(await sha256(key),instructorKeyHash))return send({error:'Invalid instructor access key.',code:'UNAUTHORIZED'},401);
      }
      if(base&&req.method==='GET')return send({ok:true,version:VERSION,assessment:'SPM 370 Legal Decision Lab 2 — OFF SCRIPT',maxScore:MAX_SCORE,identity:'self-reported'});
      const database=db();
      async function limit(identity,max){
        const window=Math.floor(clock().getTime()/600000);
        const bucket=await sha256(`${rateSecret}\n${window}\n${identity}`);
        const {data,error}=await database.rpc('spm370_offscript_check_rate',{p_bucket:bucket,p_limit:max});
        if(error)throw new Error('Rate service unavailable');
        if(data!==true)throw new InputError('Too many requests. Wait a few minutes, then retry your saved submission.',429,'RATE_LIMITED');
      }
      if(instructor){
        if(req.method==='GET'){
          const {data,error}=await database.from(TABLE).select(INSTRUCTOR_COLUMNS).order('submitted_at',{ascending:false}).limit(2000);
          if(error)throw new Error('Instructor read failed');
          return send({ok:true,version:VERSION,submissions:data||[],maxScore:MAX_SCORE,truncated:(data||[]).length===2000});
        }
        const grade=validateGrade(await readJSON(req,12000));
        const {id,...patch}=grade;
        const {data,error}=await database.from(TABLE).update({...patch,review_status:'REVIEWED',graded_at:clock().toISOString()}).eq('id',id).select('id,grade_override,review_status,grader_notes,graded_at').maybeSingle();
        if(error)throw new Error('Grade update failed');
        if(!data)return send({error:'Submission not found.',code:'NOT_FOUND'},404);
        return send({ok:true,submission:data});
      }
      // Large campus networks share an IP. Cap generously; identity and unique
      // database constraints provide separate controls. Raw addresses are never saved.
      const address=(req.headers.get('x-forwarded-for')||'unavailable').split(',')[0].trim().slice(0,128);
      await limit(`submit-network:${address}`,600);
      const value=validateSubmission(await readJSON(req,32000));
      await limit(`submit-email:${value.email}`,20);
      const fingerprint=await sha256(requestFingerprintInput(value));
      const retry=async()=>{
        const {data,error}=await database.from(TABLE).select(`attempt_id,request_hash,${PUBLIC_COLUMNS}`).eq('attempt_id',value.attempt_id).maybeSingle();
        if(error)throw new Error('Submission lookup failed');
        if(!data)return null;
        if(!safeCompare(data.request_hash,fingerprint))throw new InputError('This submission identifier was already used for different work. Keep your receipt and ask your instructor before changing it.',409,'ATTEMPT_CONFLICT');
        return send(receipt(data,true));
      };
      const prior=await retry();if(prior)return prior;
      const now=clock().toISOString();
      const record={...value,request_hash:fingerprint,receipt:`SPM370-LDL2-${crypto.randomUUID().toUpperCase()}`,submitted_at:now};
      const {data,error}=await database.from(TABLE).insert(record).select(PUBLIC_COLUMNS).single();
      if(error){
        if(error.code==='23505'){
          const repeated=await retry();if(repeated)return repeated;
          return send({error:'A lab submission already exists for this email. Your earlier submission has not been changed. Use your original saved receipt or ask your instructor.',code:'EMAIL_ALREADY_SUBMITTED'},409);
        }
        throw new Error('Submission insert failed');
      }
      return send(receipt(data),201);
    }catch(error){
      if(error instanceof InputError)return send({error:error.message,code:error.code},error.status);
      // Never log identities, reflections, headers, credentials, or raw DB errors.
      console.error('OFF_SCRIPT_REQUEST_FAILED');
      return send({error:'The server could not confirm this request. Keep this page open and retry the same saved submission.',code:'SERVER_ERROR'},500);
    }
  };
}
