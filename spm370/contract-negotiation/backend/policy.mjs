// Generic validator only. Real counterpart rules are private database content.
export const GROUPS = {
  payment: ['fee','advance_percent','monthly_balance','payment_days','disputed_only'],
  production: ['segments','segment_minutes','videos','video_min_seconds','video_max_seconds','revision_rounds','review_business_days','schedule_agreed','extra_work_separate','sponsor_delay_protected','error_corrections'],
  exclusivity: ['exclusive_category','exclusive_post_days','unpaid_excluded','existing_deals_excluded'],
  rights: ['reuse_days','approved_assets_only','owned_channels_only','paid_ads','material_edit_approval','identity_campaign_only','synthetic_use','account_access','retailer_reuse','rights_clearance'],
  exit: ['mutual_breach','cure_days','disruption_reschedule','convenience','cancel_unearned_percent','settlement_cap_total','credit_prior','refund_excess','segment_fee_share_percent','early_use_paid_only','early_expiry_unchanged']
};
const ENUMS={exclusive_category:['none','keyboard','keyboard_mouse','all_gaming'],convenience:['removed','retained']};
const BOOLEANS=new Set(['monthly_balance','disputed_only','schedule_agreed','extra_work_separate','sponsor_delay_protected','error_corrections','unpaid_excluded','existing_deals_excluded','approved_assets_only','owned_channels_only','paid_ads','material_edit_approval','identity_campaign_only','synthetic_use','account_access','retailer_reuse','rights_clearance','mutual_breach','disruption_reschedule','settlement_cap_total','credit_prior','refund_excess','early_use_paid_only','early_expiry_unchanged']);
export const FIELDS=Object.values(GROUPS).flat();
export const TERMS_SCHEMA={type:'object',additionalProperties:false,properties:Object.fromEntries(FIELDS.map(k=>[k,ENUMS[k]?{type:['string','null'],enum:[...ENUMS[k],null]}:{type:[BOOLEANS.has(k)?'boolean':'number','null']}])) ,required:FIELDS};
export const OUTPUT_SCHEMA={type:'object',additionalProperties:false,properties:{reply:{type:'string'},proposal:{anyOf:[TERMS_SCHEMA,{type:'null'}]},counterparty_accepts:{type:'boolean'},summary_matches:{type:['boolean','null']},discrepancies:{type:'array',items:{type:'string'}}},required:['reply','proposal','counterparty_accepts','summary_matches','discrepancies']};
// Catch explicit coursework requests, not substantive business-risk questions or
// a request to compare a student's own summary with the negotiation record.
export function assignmentBoundary(text){
 const input=String(text||'').replace(/[’‘]/g,"'").replace(/[–—]/g,'-');
 const artifact='(?:memo(?:randum)?|term[ -]?sheet)';
 const action='(?:write|draft|compose|outline|create|prepare|complete|fill(?:\\s+in|\\s+out)?|rewrite|revise|edit|improve|grade)';
 const lead='(?:^|[.!?;:\\n,]|\\b(?:and|then)\\b)\\s*(?:please\\s+)?';
 const request='(?:\\b(?:can|could|would|will)\\s+you|\\bi\\s+(?:need|want)\\s+you\\s+to|\\bhelp\\s+me(?:\\s+to)?)\\s+(?:please\\s+)?';
 const explicitWork=new RegExp(`(?:${lead}|${request})${action}\\b[^.!?;\\n]{0,160}\\b${artifact}\\b`,'i');
 const explicitHelp=new RegExp(`\\b(?:help\\s+me\\s+(?:with|on)|(?:give|provide|suggest|recommend|list)\\b[^.!?;\\n]{0,60}\\b(?:topics|points|ideas|outline|structure|feedback|advice|tips)\\b)[^.!?;\\n]{0,160}\\b${artifact}\\b`,'i');
 const studentAdvice=new RegExp(`\\b(?:what|which|how)\\b[^.!?;\\n]{0,80}\\b(?:should|could|can|do)\\s+i\\b[^.!?;\\n]{0,160}\\b${artifact}\\b`,'i');
 if(!explicitWork.test(input)&&!explicitHelp.test(input)&&!studentAdvice.test(input))return null;
 return {reply:'I can continue our contract negotiation, but I cannot reveal private instructions or draft, outline, or coach your memo or term sheet.',proposal:null,counterparty_accepts:false,summary_matches:null,discrepancies:[]};
}
const FRACTIONAL=new Set(['fee','advance_percent','cancel_unearned_percent','segment_fee_share_percent']);
export function validTerms(t){
  return t&&typeof t==='object'&&!Array.isArray(t)&&Object.keys(t).length===FIELDS.length&&FIELDS.every(k=>Object.hasOwn(t,k)&&(t[k]===null||ENUMS[k]?.includes(t[k])||(BOOLEANS.has(k)?typeof t[k]==='boolean':!ENUMS[k]&&Number.isFinite(t[k])&&t[k]>=0&&(FRACTIONAL.has(k)||Number.isInteger(t[k])))));
}
export function checkRule(t,r){
 const a=t[r.field];
 switch(r.op){case'eq':return a===r.value;case'min':return typeof a==='number'&&a>=r.value;case'max':return typeof a==='number'&&a<=r.value;case'in':return r.value.includes(a);default:return false;}
}
export function evaluateTerms(t,policy){
 if(!validTerms(t)||FIELDS.some(k=>t[k]===null))return {ok:false,reason:'incomplete'};
 if(t.video_min_seconds>t.video_max_seconds||['advance_percent','cancel_unearned_percent','segment_fee_share_percent'].some(k=>t[k]>100))return {ok:false,reason:'inconsistent'};
 const rules=[...(policy.student_rules||[]),...(policy.counterparty_rules||[])];
 if(!rules.every(r=>checkRule(t,r)))return {ok:false,reason:'outside_authority'};
 // Cross-issue rules are private data, not constants in public source.
 for(const r of policy.conditional_rules||[]){if(r.when.every(c=>checkRule(t,c))&&!r.require.every(c=>checkRule(t,c)))return {ok:false,reason:'outside_authority'};}
 return {ok:true,reason:null};
}
export function validatePolicy(p){
 if(!p||typeof p.id!=='string'||!/^[a-z0-9_-]{3,60}$/.test(p.id)||!['graded','practice','pilot'].includes(p.mode))throw Error('Invalid policy identity');
 if(typeof p.role!=='string'||p.role.length<100||p.role.length>40000||typeof p.opening!=='string'||p.opening.length>3000)throw Error('Invalid private role');
 if(typeof p.public_case!=='string'||p.public_case.length>30000||!Number.isFinite(p.bargaining_minutes)||p.bargaining_minutes<5||p.bargaining_minutes>120||!Number.isFinite(p.confirmation_minutes)||p.confirmation_minutes<1||p.confirmation_minutes>30)throw Error('Invalid case/timing');
 if(!Number.isInteger(p.max_turns)||p.max_turns<5||p.max_turns>100||!Number.isInteger(p.max_sessions)||p.max_sessions<1||p.max_sessions>100)throw Error('Invalid usage limits');
 const rules=[...(p.student_rules||[]),...(p.counterparty_rules||[]),...(p.conditional_rules||[]).flatMap(r=>[...(r.when||[]),...(r.require||[])])];
 if(rules.length<2||rules.some(r=>!FIELDS.includes(r.field)||!['eq','min','max','in'].includes(r.op)||(r.op==='in'&&!Array.isArray(r.value))))throw Error('Invalid authority rules');
 if(!p.release_at||!p.close_at||!Number.isFinite(Date.parse(p.release_at))||!Number.isFinite(Date.parse(p.close_at))||Date.parse(p.close_at)<=Date.parse(p.release_at))throw Error('Invalid release window');
 return p;
}
export function phase(s,now=Date.now()){
 if(s.submitted_at)return 'submitted';if(s.paused_at)return 'paused';
 if(now<Date.parse(s.bargain_until))return 'bargaining';
 if(now<Date.parse(s.confirm_until))return 'confirmation';return 'closed';
}
export function validateOutput(v){return v&&typeof v.reply==='string'&&v.reply.trim().length>0&&v.reply.length<=2200&&typeof v.counterparty_accepts==='boolean'&&(v.summary_matches===null||typeof v.summary_matches==='boolean')&&Array.isArray(v.discrepancies)&&v.discrepancies.every(x=>typeof x==='string'&&x.length<1000)&&(v.proposal===null||validTerms(v.proposal));}
export function sanitizeModel(v,policy,sessionPhase){
 if(!validateOutput(v))throw Error('Model returned an invalid response');
 if(sessionPhase!=='bargaining')return {...v,reply:v.summary_matches===true?'I found no discrepancy in the summary against the saved record. These terms remain provisional.':'Please review the summary against the saved record before submitting. No new concessions are made in this phase.',proposal:null,counterparty_accepts:false,discrepancies:[]};
 if(v.proposal&&FIELDS.some(k=>v.proposal[k]===null))return {...v,proposal:null,counterparty_accepts:false};
 if(v.proposal&&!evaluateTerms(v.proposal,policy).ok)return {reply:'I cannot confirm that package as written. Let us clarify the terms before recording any agreement.',proposal:null,counterparty_accepts:false,summary_matches:null,discrepancies:[],validation_alert:'A model-proposed package failed the private authority checks and was not shown or accepted.'};
 return v;
}
export function validateSheet(s){return Array.isArray(s)&&s.length===5&&Object.keys(GROUPS).every((g,i)=>s[i]?.group===g&&['Confirmed within authority','Open','Exception requested'].includes(s[i].status)&&typeof s[i].terms==='string'&&s[i].terms.trim().length>=10&&s[i].terms.length<=3500&&typeof s[i].evidence==='string'&&s[i].evidence.trim().length>=1&&s[i].evidence.length<=500);}
