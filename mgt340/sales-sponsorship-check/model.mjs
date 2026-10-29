export const VERSION = 'mgt340-sales-sponsorship-v1';
export const MC_IDS = ['q1','q2','q3','q4','q6','q7','q8','q9'];
export const BRIEF_IDS = ['q5','q10'];
export const MAX_BRIEF_LENGTH = 1200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function cleanIdentity(firstName='',lastName='',email='') { return {firstName:firstName.trim().replace(/\s+/gu,' ').normalize('NFC'),lastName:lastName.trim().replace(/\s+/gu,' ').normalize('NFC'),email:email.trim().toLowerCase()}; }
export function identityError(i) {
  if (!i || typeof i.firstName !== 'string' || typeof i.lastName !== 'string' || typeof i.email !== 'string') return 'Enter your name and La Salle email.';
  if (!i.firstName || !i.lastName || !/\p{L}/u.test(i.firstName) || !/\p{L}/u.test(i.lastName) || /[\u0000-\u001f\u007f]/u.test(i.firstName+i.lastName)) return 'Enter your first and last name.';
  if (i.firstName.length>80 || i.lastName.length>80) return 'Use no more than 80 characters for each name.';
  if (i.email.length>254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@lasalle\.edu$/.test(i.email) || i.email.startsWith('.') || i.email.includes('..') || i.email.split('@')[0].endsWith('.') || i.email.split('@')[0].length>64) return 'Enter your La Salle email ending in @lasalle.edu.';
  return '';
}
export function emptyResponses() { return Object.fromEntries([...MC_IDS.map(id=>[id,null]),...BRIEF_IDS.map(id=>[id,{a:'',b:''}])]); }
export function validBrief(value,complete=false) { if(typeof value!=='string'||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value))return false;const normalized=value.trim().normalize('NFC');return normalized.length<=MAX_BRIEF_LENGTH&&(!complete||normalized.length>0); }
export function completeQuestion(q,response) { return q.kind==='mc' ? Number.isInteger(response)&&response>=0&&response<=3 : response && ['a','b'].every(p=>validBrief(response[p],true)); }
export function validResponses(r,complete=false) {
  return r && typeof r==='object' && !Array.isArray(r) && Object.keys(r).length===10 && MC_IDS.every(id=>(!complete&&r[id]===null)||(Number.isInteger(r[id])&&r[id]>=0&&r[id]<=3)) && BRIEF_IDS.every(id=>r[id]&&typeof r[id]==='object'&&['a','b'].every(p=>validBrief(r[id][p],complete)));
}
export function buildPayload(s) { return {attemptId:s.attemptId,assessmentVersion:VERSION,...cleanIdentity(s.identity.firstName,s.identity.lastName,s.identity.email),answers:MC_IDS.map(id=>s.responses[id]),briefs:Object.fromEntries(BRIEF_IDS.map(id=>[id,{a:s.responses[id].a.trim().normalize('NFC'),b:s.responses[id].b.trim().normalize('NFC')}])),clientStartedAt:s.clientStartedAt}; }
export function validPayload(p) {
  return p && UUID.test(p.attemptId) && p.assessmentVersion===VERSION && !identityError(p) && Array.isArray(p.answers) && p.answers.length===8 && p.answers.every(x=>Number.isInteger(x)&&x>=0&&x<=3) && p.briefs && BRIEF_IDS.every(id=>p.briefs[id]&&['a','b'].every(part=>validBrief(p.briefs[id][part],true))) && typeof p.clientStartedAt==='string' && Number.isFinite(Date.parse(p.clientStartedAt));
}
export function validResult(result,payload) {
  const r=result?.receipt;
  return result?.ok===true && r && r.attemptId===payload.attemptId && r.assessmentVersion===payload.assessmentVersion && typeof r.receiptId==='string' && UUID.test(r.receiptId) && typeof r.submittedAt==='string' && Number.isFinite(Date.parse(r.submittedAt)) && r.maxMcScore===8 && r.maxScore===12 && r.briefPointsPending===4 && r.reviewStatus==='pending_instructor_review' && Number.isInteger(r.mcScore) && Number.isInteger(r.salesMcScore) && Number.isInteger(r.sponsorshipMcScore) && r.salesMcScore>=0 && r.salesMcScore<=4 && r.sponsorshipMcScore>=0 && r.sponsorshipMcScore<=4 && r.mcScore===r.salesMcScore+r.sponsorshipMcScore;
}
export function recoverState(raw,pilot) {
  try {
    const s=JSON.parse(raw);
    if(!s||s.version!==VERSION||s.pilot!==pilot||!UUID.test(s.attemptId)||!Number.isFinite(Date.parse(s.clientStartedAt))||!validResponses(s.responses)||!['answering','pending','error','saved','pilot-complete'].includes(s.status)||!['question','review'].includes(s.view)||!Number.isInteger(s.current)||s.current<0||s.current>9) return null;
    if(!pilot&&identityError(s.identity))return null;
    if(pilot&&['pending','error','saved'].includes(s.status))return null;
    if(!pilot&&s.status==='pilot-complete')return null;
    if(['pending','error','saved'].includes(s.status)&&(!validPayload(s.frozen)||JSON.stringify(s.frozen)!==JSON.stringify(buildPayload(s))))return null;
    if(s.status==='saved'&&!validResult(s.result,s.frozen))return null;
    if(s.status==='pending')s.status='error';
    return s;
  } catch {return null;}
}
export function escapeHTML(v) { return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
