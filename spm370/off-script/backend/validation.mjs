import model from './model.mjs';
export const VERSION='1.2.0';
export const MAX_SCORE=10;
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const control=/[\x00-\x1f\x7f]/;
export class InputError extends Error { constructor(message,status=400,code='INVALID_REQUEST'){super(message);this.status=status;this.code=code;} }
function bounded(value,min,max,label,multiline=false){
  if(typeof value!=='string')throw new InputError(`Enter ${label}.`);
  const clean=value.trim();
  if(clean.length<min||clean.length>max||(!multiline&&control.test(clean))||(multiline&&/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(clean)))throw new InputError(`Check ${label}.`);
  return clean;
}
export function validateSubmission(body){
  if(!body||typeof body!=='object'||Array.isArray(body)||body.action!=='submit')throw new InputError('Unknown request.');
  if(body.version!==VERSION)throw new InputError('Refresh the page before submitting; your local story is preserved.',409,'VERSION_MISMATCH');
  if(typeof body.attemptId!=='string'||!UUID.test(body.attemptId))throw new InputError('The submission could not be identified. Return to your saved lab.',400,'INVALID_ATTEMPT');
  const first_name=bounded(body.firstName,1,60,'your first name'),last_name=bounded(body.lastName,1,60,'your last name');
  const email=bounded(body.email,5,120,'your email').toLowerCase();
  if(!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email))throw new InputError('Enter a valid email address.');
  const partner_name=body.partnerName===undefined||body.partnerName===''?null:bounded(body.partnerName,1,80,'the optional partner name');
  if(!Array.isArray(body.choices)||body.choices.length!==6||!body.choices.every(x=>typeof x==='string'&&x.length<=30))throw new InputError('Complete all six story decisions.');
  let state;try{state=model.rebuild(body.choices);}catch{throw new InputError('The six choices do not form a valid OFF SCRIPT story. Resume your saved story.');}
  if(state.step!==6||model.audit(state).length)throw new InputError('Complete a valid six-decision story.');
  const options=[['permissions','identity','ownership'],['new-agreement','label','money']];
  if(!Array.isArray(body.checks)||body.checks.length!==2||!body.checks.every((v,i)=>typeof v==='string'&&options[i].includes(v)))throw new InputError('Answer both legal-understanding checks.');
  if(!Array.isArray(body.reflections)||body.reflections.length!==2)throw new InputError('Complete both short explanations.');
  const reflections=body.reflections.map((v,i)=>bounded(v,20,3000,`explanation ${i+1}`,true));
  const source_version=body.sourceVersion===undefined?VERSION:bounded(body.sourceVersion,1,40,'the source version');
  if(!['1.0.0','1.1.0','1.1.1',VERSION].includes(source_version))throw new InputError('The saved story version is not supported.',409,'VERSION_MISMATCH');
  let client_completed_at=null;
  if(body.completedAt!==undefined&&body.completedAt!==null&&body.completedAt!==''){
    if(typeof body.completedAt!=='string'||body.completedAt.length>40||Number.isNaN(Date.parse(body.completedAt)))throw new InputError('The completion time is invalid.');
    client_completed_at=new Date(body.completedAt).toISOString();
  }
  const concept_score=(body.checks[0]==='permissions'?2:0)+(body.checks[1]==='new-agreement'?2:0);
  return {attempt_id:body.attemptId.toLowerCase(),version:VERSION,source_version,first_name,last_name,email,partner_name,choices:[...body.choices],checks:[...body.checks],reflections,ending_id:model.ending(state).id,completion_score:6,concept_score,client_completed_at};
}
export function validateGrade(body){
  if(!body||typeof body!=='object'||Array.isArray(body)||body.action!=='grade'||typeof body.id!=='string'||!UUID.test(body.id)||typeof body.grade!=='number'||!Number.isInteger(body.grade)||body.grade<0||body.grade>10)throw new InputError('Enter a grade from 0 to 10 for a valid submission.');
  const notes=body.notes===undefined?'':bounded(body.notes,0,2000,'instructor notes',true);
  return {id:body.id,grade_override:body.grade,grader_notes:notes||null};
}
export function requestFingerprintInput(value){
  // The client clock is informational and may change between safe retries.
  const {client_completed_at,...stable}=value;return JSON.stringify(stable);
}
