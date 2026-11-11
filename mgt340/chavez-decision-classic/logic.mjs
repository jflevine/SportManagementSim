export const BUDGETS = Object.freeze({initial:600000,revised:400000,shortfall:200000,increment:25000});
export const CATEGORIES = Object.freeze([
 {id:'payments',label:'Institutional athlete payments',short:'Athlete payments',detail:'Additional annual institutional payment commitments under the case assumptions. Separate from outside NIL deals.'},
 {id:'scholarships',label:'Additional scholarships',short:'Scholarships',detail:'Additional annual athletics aid. Explain whose educational costs this would address.'},
 {id:'support',label:'Enhanced athlete support',short:'Athlete support',detail:'Additional academic and wellbeing capacity above the already funded baseline.'},
 {id:'compliance',label:'Compliance and NIL education',short:'Compliance / NIL education',detail:'Annual administrative capacity, education, and recordkeeping. This is not funding for outside NIL deals.'},
 {id:'facilities',label:'Annual facility maintenance and access',short:'Maintenance / access',detail:'Recurring maintenance and access improvements. No new building or one-time capital project is priced in this exercise.'}
]);
export const PRIORITIES = Object.freeze({financial_security:'Address athletes’ financial needs',academic_wellbeing:'Improve academic and wellbeing support',development_access:'Improve daily development and facility access',reliable_operations:'Make support and administration more reliable',sustainable_choices:'Preserve flexibility while identifying the causes'});
export const EVIDENCE = Object.freeze({interviews:'Confidential conversations with departing and continuing athletes',costs:'Review of educational costs and existing aid',academics:'Review of course conflicts and support access',development:'Review of development opportunities and facility access',process:'Review of service information, processes, and follow-through'});
export const OWNERS = Object.freeze(['Athletics leadership','Business office','Academic and athlete-support leadership','Compliance leadership','Facilities and operations leadership']);
export const ROLE_NAMES = Object.freeze({finance:'Business office',athlete:'Athlete representative',academic:'Academic support director',coach:'Basketball coach',compliance:'Compliance and NIL education staff',facilities:'Facilities and operations manager',sponsor:'Sponsorship partner'});
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const blankAllocation=()=>Object.fromEntries(CATEGORIES.map(c=>[c.id,0]));
export const total=a=>CATEGORIES.reduce((n,c)=>n+a[c.id],0);
export const remainder=(a,budget)=>budget-total(a);
export function allocationErrors(a,budget){
 if(!a||typeof a!=='object'||Array.isArray(a))return ['Enter a valid resource plan.'];
 const e=[];
 for(const c of CATEGORIES){const n=a[c.id];if(!Number.isSafeInteger(n)||n<0||n%BUDGETS.increment!==0)e.push(`${c.short}: use nonnegative $25,000 increments.`);}
 if(!e.length&&total(a)>budget)e.push(`Reduce planned spending by ${money(total(a)-budget)} to fit the available resources.`);
 return e;
}
export function createState(seed){return {version:1,seed:seed>>>0,step:0,team:'',priority:'',hypothesis:'',evidence:'',question:'',initial:blankAllocation(),initialReason:'',revised:blankAllocation(),revealed:false,tradeoff:'',owner:'',partners:'',measure1:'',measure2:'',statement:'',questions:[]};}
export function strategyReady(s){return Boolean(Object.hasOwn(PRIORITIES,s.priority)&&Object.hasOwn(EVIDENCE,s.evidence)&&s.hypothesis.trim()&&s.question.trim());}
export function revealUpdate(s){
 if(s.revealed)return s;
 if(!strategyReady(s)||!s.initialReason.trim()||allocationErrors(s.initial,BUDGETS.initial).length)throw new Error('Complete a feasible initial plan first.');
 return {...s,initial:{...s.initial},revised:{...s.initial},revealed:true,step:2};
}
export function finalReady(s){return s.revealed&&allocationErrors(s.revised,BUDGETS.revised).length===0&&OWNERS.includes(s.owner)&&['tradeoff','partners','measure1','measure2','statement'].every(k=>s[k].trim());}
export function restoreState(raw){
 if(!raw||raw.version!==1||!Number.isInteger(raw.seed)||!Number.isInteger(raw.step)||raw.step<0||raw.step>4||typeof raw.revealed!=='boolean')return null;
 const s=createState(raw.seed);
 for(const k of ['team','priority','hypothesis','evidence','question','initialReason','tradeoff','owner','partners','measure1','measure2','statement']){if(typeof raw[k]!=='string'||raw[k].length>1200)return null;s[k]=raw[k];}
 if((s.priority&&!Object.hasOwn(PRIORITIES,s.priority))||(s.evidence&&!Object.hasOwn(EVIDENCE,s.evidence))||(s.owner&&!OWNERS.includes(s.owner)))return null;
 for(const name of ['initial','revised']){
  if(!raw[name]||typeof raw[name]!=='object'||Array.isArray(raw[name]))return null;
  for(const c of CATEGORIES){const n=raw[name][c.id];if(!Number.isSafeInteger(n)||n<0||n%BUDGETS.increment!==0||n>600000)return null;s[name][c.id]=n;}
 }
 if(!Array.isArray(raw.questions)||!raw.questions.every(x=>['payments','reserve','facilities','capacity','evidence'].includes(x)))return null;
 s.questions=[...new Set(raw.questions)];s.step=raw.step;s.revealed=raw.revealed;
 if(s.step>0&&!strategyReady(s))return null;
 if(s.revealed&&(!s.initialReason.trim()||allocationErrors(s.initial,600000).length))return null;
 if((s.step>=2&&!s.revealed)||(s.revealed&&s.step<2))return null;
 if(s.step>=3&&allocationErrors(s.revised,400000).length)return null;
 if(s.step===4&&!finalReady(s))return null;
 return s;
}
export function variant(seed,key,length){let n=seed>>>0;for(const c of key)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n%length;}
const BANK={
 finance:{buffer:['Uncommitted resources leave room to respond. Explain why this buffer fits your strategy.','A reserve preserves choices; it does not by itself address the causes of departures.','Tell us what evidence or event would justify using the uncommitted resources.'],full:['Every available dollar is assigned. What would you change if a cost estimate moved?','A fully allocated plan leaves no uncommitted buffer in this exercise. Make that tradeoff explicit.','Your commitments use the entire envelope. Identify a review point before any agreement is signed.'],over:['The revised resource plan exceeds $400,000. Decide what to postpone before making new commitments.','The sponsorship update changes the available recurring resources. Revise the plan rather than assume replacement revenue.','Separate your preferred plan from a plan the remaining resources can support.']},
 athlete:{funded:['Explain how these allocations address the concern you identified, and ask athletes whether that diagnosis fits.','Different athletes may value these uses differently. Whose experience would you examine first?','Tell us what improves in daily life and how we can give feedback before commitments are made.'],zero:['A larger reserve may be deliberate. Explain when athletes would see a decision and what evidence would trigger it.','If spending waits, make the listening and decision process clear to athletes.','Preserving options is a choice. Explain how athletes can influence the next allocation.']},
 academic:{funded:['Additional support could address a need, but identify the access or service problem you intend to improve.','An allocation is not evidence that support reaches the students who need it. Choose a usable measure.','Define the extra capacity this would buy above the funded baseline and who would deliver it.'],zero:['Baseline services remain funded. Explain whether current evidence supports postponing additional capacity.','A zero here means no enhancement in this plan, not the removal of baseline academic or wellbeing services.','If your diagnosis concerns academic experience, explain how your other choices address that concern.']},
 coach:{funded:['Payments and aid may be part of a response. They do not establish why athletes leave or guarantee that they stay.','Explain what you would ask athletes before concluding that this financial allocation addresses retention.','Connect the proposed financial commitments to a stated need, then choose a way to evaluate the response.'],zero:['If you postpone additional payments and aid, explain the alternative response to the problem you identified.','A retention strategy can involve several needs. Show how your chosen uses address the current hypothesis.','Do not infer that a zero additional allocation means existing aid or agreements have disappeared.']},
 compliance:{funded:['Describe the additional education or administrative capacity this allocation supports. Outside NIL deals remain a separate category.','The exercise assumes capacity, but implementation still requires the relevant reviews and documentation.','A larger education allocation does not promise NIL deals. Specify the knowledge or process you want to improve.'],zero:['Required compliance is already funded. Explain whether postponing extra capacity fits the complexity of your plan.','Zero additional funding does not remove existing reporting and review responsibilities.','Identify who will review the proposed payment and aid arrangements using the funded baseline capacity.']},
 facilities:{funded:['Specify an annual maintenance or access improvement. This budget does not price a new capital project.','Connect the recurring facility allocation to access, reliability, or another stated athlete need.','An attractive facility is not a retention guarantee. Define the maintenance or access outcome you would check.'],zero:['Baseline operations remain protected. Explain whether extra maintenance or access work can wait under your strategy.','If you postpone this enhancement, identify what evidence would make it a higher priority later.','A zero additional allocation is different from closing facilities or eliminating existing maintenance.']},
 sponsor:{update:['The scenario removes $200,000 in expected annual sponsorship. Do not assume another partner will replace it.','Our reaction does not create a new offer. Keep your revised plan within the remaining $400,000.','Revisit the commitments before signing. No replacement sponsorship is supplied in this exercise.']}
};
export function feedback(s,phase='initial'){
 const a=phase==='initial'?s.initial:s.revised,b=phase==='initial'?600000:400000,left=remainder(a,b);
 const lead=CATEGORIES.reduce((best,c)=>a[c.id]>a[best.id]?c:best,CATEGORIES[0]);
 const role=total(a)===0?'athlete':({payments:'coach',scholarships:'athlete',support:'academic',compliance:'compliance',facilities:'facilities'})[lead.id];
 const selected=phase==='initial'?['finance',role]:['sponsor',role==='athlete'?'academic':'athlete'];
 return selected.map(r=>{
  let mode=r==='finance'?(left<0?'over':left===0?'full':'buffer'):r==='sponsor'?'update':r==='academic'?(a.support>0?'funded':'zero'):r==='coach'?(a.payments+a.scholarships>0?'funded':'zero'):r==='compliance'?(a.compliance>0?'funded':'zero'):r==='facilities'?(a.facilities>0?'funded':'zero'):(total(a)>0?'funded':'zero');
  const lines=BANK[r][mode];return {role:r,name:ROLE_NAMES[r],text:lines[variant(s.seed,`${phase}:${r}:${mode}:${s.priority}`,lines.length)]};
 });
}
export const FOLLOWUPS={
 payments:['Are payments the same as outside NIL?','No. This plan concerns institutional allocations. Third-party NIL involves separate outside arrangements; no outside deal is promised here.'],
 reserve:['Is the reserve another expense?','No. It is the part of this annual resource envelope not committed to the five spending categories. It is not an assumed cash balance carried from an earlier year.'],
 facilities:['Can we build a facility with this amount?','No capital project is priced. Use this category for annual maintenance and access improvements; a capital proposal would need its own costs and funding plan.'],
 capacity:['Does the resource envelope equal a benefits cap?','No. The exercise assumes enough applicable capacity for proposed payments and aid. The $600,000 and $400,000 figures describe available resources, not regulatory cap calculations.'],
 evidence:['Do we already know why athletes left?','The chapter motivates the concern, including reported NIL opportunities elsewhere. This extension supplies no verified diagnosis of all current departures. Treat your explanation as a hypothesis to investigate.']
};
export function report(s){
 const rows=CATEGORIES.map(c=>`${c.label}: ${money(s.initial[c.id])} → ${money(s.revised[c.id])} (${money(s.revised[c.id]-s.initial[c.id])})`).join('\n');
 return `CHAVEZ: THE RETENTION DECISION — MGT 340\nFictional classroom extension; no agreements signed\n${s.team?'Pod: '+s.team+'\n':''}\nSTRATEGY BEFORE SPENDING\nPriority: ${PRIORITIES[s.priority]}\nWorking hypothesis: ${s.hypothesis}\nEvidence to seek: ${EVIDENCE[s.evidence]}\nQuestion: ${s.question}\n\nINITIAL PLAN — $600,000 ADDITIONAL RECURRING RESOURCES\n${s.initialReason}\n\nANNUAL RESOURCE COMPARISON — INITIAL → REVISED\n${rows}\nUncommitted reserve: ${money(remainder(s.initial,600000))} → ${money(remainder(s.revised,400000))}\nInitial spending: ${money(total(s.initial))}; revised spending: ${money(total(s.revised))}\n\nUPDATE\n$200,000 of expected annual sponsorship will not materialize before commitments are signed. Revised recurring resource envelope: $400,000. Existing obligations and baseline services remain funded outside this exercise.\n\nPRIORITY AND TRADEOFF\n${s.tradeoff}\n\nIMPLEMENTATION\nLead: ${s.owner}\nPartners / responsibilities: ${s.partners}\n\nMEASURES BEYOND WINS\n1. ${s.measure1}\n2. ${s.measure2}\n\nPUBLIC STATEMENT\n${s.statement}\n\nThis allocation is not a benefits-cap calculation. Appropriate review still applies. No allocation guarantees retention, NIL deals, or wins. Stakeholder reactions are authored perspectives, not new facts or live messages. This download is not an automatic submission.\n`;
}
