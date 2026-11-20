const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX=30000;
export function validate(p){
 if(!p||Object.keys(p).sort().join(',')!=='answers,attemptId,choices'||!uuid.test(p.attemptId)||!Array.isArray(p.choices)||p.choices.length!==3||!p.choices.every(n=>n===0||n===1)||!Array.isArray(p.answers)||p.answers.length!==3||!p.answers.every(s=>typeof s==='string'&&s.trim()&&s.length<=1200&&!s.includes('\0')))return null;
 return {attemptId:p.attemptId.toLowerCase(),choices:p.choices,answers:p.answers.map(s=>s.trim())};
}
async function bounded(req){
 if(!req.body)throw Error();
 const reader=req.body.getReader();const decoder=new TextDecoder('utf-8',{fatal:true});let count=0,text='';
 while(true){const {value,done}=await reader.read();if(done)break;count+=value.byteLength;if(count>MAX){void reader.cancel();throw Error();}text+=decoder.decode(value,{stream:true});}
 return JSON.parse(text+decoder.decode());
}
export function handler({origin,enabled,verifyUser,save}){
 const allowed=typeof origin==='string'&&/^https:\/\/[^/]+$/.test(origin);
 return async req=>{
  const cors=allowed&&req.headers.get('origin')===origin?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'}:{};
  const out=(code,data)=>Response.json(data,{status:code,headers:{...cors,'Cache-Control':'no-store'}});
  if(!cors['Access-Control-Allow-Origin'])return out(403,{error:'Not authorized'});
  if(!enabled)return out(503,{error:'Pilot unavailable'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return out(405,{error:'Method not allowed'});
  const bearer=req.headers.get('authorization')?.match(/^Bearer ([^ ]{1,8000})$/i)?.[1];
  if(!bearer)return out(401,{error:'Verified course session required'});
  let student;
  try{student=await verifyUser(bearer);}catch{return out(503,{error:'Verification unavailable'});}
  if(!student||!uuid.test(student.id)||student.verified!==true)return out(401,{error:'Verified course session required'});
  let body;try{body=validate(await bounded(req));}catch{}
  if(!body)return out(400,{error:'Invalid handoff'});
  try {
   const result=await save(student.id,body);
   if(!result)return out(403,{error:'Not eligible for the pilot'});
   if(result.conflict)return out(409,{error:'A different copy is already on file'});
   return out(200,{attemptId:body.attemptId,receipt:result.receipt,savedAt:result.savedAt});
  }catch{return out(503,{error:'Save not confirmed'});}
 };
}
