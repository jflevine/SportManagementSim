/** Pure, deterministic classroom logic. No network, DOM, storage, or side effects. */
export const BUDGETS=Object.freeze({initial:600000,revised:400000,shortfall:200000,shift:25000});
export const CATEGORIES=Object.freeze([
 {id:'payments',label:'Institutional athlete payments'},
 {id:'aid',label:'Additional scholarships'},
 {id:'support',label:'Support and compliance enhancements'},
 {id:'facilities',label:'Annual facility maintenance and access'},
 {id:'reserve',label:'Uncommitted reserve'}
].map(Object.freeze));
const IDS=CATEGORIES.map(c=>c.id),PHASES=['initial','revised'];
export const PLAN_IDS=Object.freeze(['financial','experience','balanced']);
export const EVIDENCE=Object.freeze({
 aid:Object.freeze({amount:75000,period:'annual',text:'A fictional aid review across both basketball teams identifies $75,000 in combined annual unmet educational costs. This does not automatically establish individual aid eligibility or an award.'}),
 support:Object.freeze({respondents:20,reportingDifficulty:8,text:'Eight of 20 voluntary current-athlete respondents report difficulty accessing support at useful times. This is not a representative survey or proof of why athletes leave.'}),
 facilities:Object.freeze({sessions:6,period:'last month',text:'A fictional operations log records six development sessions displaced last month by maintenance or facility-access conflicts. The case does not establish an unsafe facility.'})
});
export const ROLES=Object.freeze({
 coach:Object.freeze({name:'Coach',opening:'I want a competitive program and athletes who can develop here. Ask me how an investment fits that goal—and what spending alone cannot fix.',starters:Object.freeze(['Which problem should we address first?','Would more payments solve the departures?','What can coaching change without a new budget line?'])}),
 business:Object.freeze({name:'Business officer',opening:'I will help you distinguish a feasible annual plan from a desirable one. Ask about recurring resources, commitments, and the uncommitted reserve.',starters:Object.freeze(['What does this plan commit us to each year?','How much flexibility should we preserve?','What changes after the sponsorship shortfall?'])}),
 athlete:Object.freeze({name:'Student athlete',opening:'I can offer an athlete perspective, not a vote from every team. Ask how the choices might affect educational costs, daily support, and development access.',starters:Object.freeze(['Which evidence should shape our priority?','How would the plans affect athletes differently?','What should we measure beyond wins?'])})
});
function makePlan(id,name,budget,values,summary){return Object.freeze({id,name,budget,allocations:Object.freeze(Object.fromEntries(IDS.map((k,i)=>[k,values[i]]))),summary});}
export const PLANS=Object.freeze({
 initial:Object.freeze({
  financial:makePlan('financial','Financial commitments',600000,[250000,75000,125000,75000,75000],'Places more resources in institutional payments while funding additional aid, service capacity, annual access work, and a reserve.'),
  experience:makePlan('experience','Daily athlete experience',600000,[125000,75000,200000,125000,75000],'Places more resources in support and annual facility access while retaining institutional payments, additional aid, and a reserve.'),
  balanced:makePlan('balanced','Flexibility and targeted support',600000,[150000,75000,125000,100000,150000],'Preserves a larger reserve while targeting financial needs, support, and annual access. More resources remain uncommitted while evidence is tested.')
 }),
 revised:Object.freeze({
  financial:makePlan('financial','Financial commitments',400000,[175000,75000,75000,50000,25000],'Protects a larger institutional-payment allocation; offers less room for support, access enhancements, and uncertainty.'),
  experience:makePlan('experience','Daily athlete experience',400000,[75000,75000,125000,100000,25000],'Protects more support and annual access funding; provides fewer additional institutional payments and a small reserve.'),
  balanced:makePlan('balanced','Flexibility and targeted support',400000,[100000,75000,75000,75000,75000],'Preserves more uncommitted resources; postpones some immediate enhancement in exchange for flexibility.')
 })
});
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const total=allocations=>IDS.reduce((sum,k)=>sum+allocations[k],0);
export const spending=allocations=>total(allocations)-allocations.reserve;
function phaseOK(phase){if(!PHASES.includes(phase))throw new Error('Choose initial or revised phase.');}
function planOK(id){if(!PLAN_IDS.includes(id))throw new Error('Choose one of the three plans.');}
function validateShift(shift){if(!shift||typeof shift!=='object'||Array.isArray(shift)||!IDS.includes(shift.from)||!IDS.includes(shift.to)||shift.from===shift.to)throw new Error('Choose two different valid categories for the $25,000 adjustment.');}
export function getPlan(phase,id,shift=null){
 phaseOK(phase);planOK(id);const base=PLANS[phase][id],out={...base,allocations:{...base.allocations},shift:null};
 if(shift!==null){if(phase!=='revised')throw new Error('The optional adjustment is available only for the revised plan.');validateShift(shift);if(out.allocations[shift.from]<BUDGETS.shift)throw new Error('The source category does not contain $25,000.');out.allocations[shift.from]-=BUDGETS.shift;out.allocations[shift.to]+=BUDGETS.shift;out.shift={from:shift.from,to:shift.to};}
 return out;
}
export const getPlans=phase=>{phaseOK(phase);return PLAN_IDS.map(id=>getPlan(phase,id));};
const blankChats=()=>Object.fromEntries(PHASES.map(p=>[p,Object.fromEntries(Object.keys(ROLES).map(r=>[r,[]]))]));
export function createState(){return {version:1,phase:'initial',initialPlanId:'',revisedPlanId:'',provisional:null,shift:null,eventRevealed:false,completed:false,final:{decision:'',evidence:'',tradeoff:'',implementation:''},chats:blankChats()};}
export function currentPlan(s){const id=s.phase==='initial'?s.initialPlanId:s.revisedPlanId;return id?getPlan(s.phase,id,s.phase==='revised'?s.shift:null):null;}
export function choosePlan(s,id){planOK(id);phaseOK(s.phase);if(s.phase==='initial'){if(s.eventRevealed)throw new Error('The provisional plan has already been recorded.');return {...s,initialPlanId:id,completed:false};}return {...s,revisedPlanId:id,shift:s.revisedPlanId===id?s.shift:null,completed:false};}
export function recordProvisional(s){
 if(s.eventRevealed)return s;
 if(s.phase!=='initial'||!PLAN_IDS.includes(s.initialPlanId))throw new Error('Choose a provisional plan before revealing the funding update.');
 return {...s,phase:'revised',provisional:getPlan('initial',s.initialPlanId),eventRevealed:true,revisedPlanId:'',shift:null,completed:false};
}
export function setShift(s,from,to){if(s.phase!=='revised'||!s.eventRevealed||!s.revisedPlanId)throw new Error('Choose a revised plan before adjusting it.');const shift={from,to};getPlan('revised',s.revisedPlanId,shift);return {...s,shift,completed:false};}
export function clearShift(s){return {...s,shift:null,completed:false};}
const FINAL_FIELDS=Object.freeze(['decision','evidence','tradeoff','implementation']);
export function setFinal(s,fields){if(!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Provide final response fields.');const next={...s.final};for(const key of Object.keys(fields)){if(!FINAL_FIELDS.includes(key)||typeof fields[key]!=='string'||fields[key].length>1200)throw new Error('Use the four short response fields, up to 1,200 characters each.');next[key]=fields[key];}return {...s,final:next,completed:false};}
export function canFinish(s){try{return Boolean(s.phase==='revised'&&s.eventRevealed&&PLAN_IDS.includes(s.revisedPlanId)&&FINAL_FIELDS.every(k=>typeof s.final?.[k]==='string'&&s.final[k].trim())&&total(getPlan('revised',s.revisedPlanId,s.shift).allocations)===400000);}catch{return false;}}
export function finish(s){if(!canFinish(s))throw new Error('Choose a revised plan and complete the decision, evidence, tradeoff, and implementation fields.');return {...s,completed:true};}
const TOPICS=['funding','payments','aid','support','facilities','reserve','nil','coaching','equity','evidence','implementation','strategy','outcomes','capacity'];
export function questionTopic(question){const q=question.toLowerCase();const rules=[['outcomes',/guarantee|predict|retention rate|how many.*(stay|retain)|more wins/],['capacity',/benefits.cap|cap space|cap limit|roster|regulatory capacity/],['nil',/\bnil\b|endorsement|outside deal|third.party/],['equity',/title ix|\bequity\b|\bfair\b|gender|\bwomen\b|\bmen\b/],['facilities',/facilit|maintenance|\bcourt\b|building|arena|six sessions|6 sessions/],['aid',/scholarship|\baid\b|tuition|unmet|educational cost/],['payments',/\bpay\b|payment|compensat|salary|salaries/],['support',/\bsupport\b|tutor|counsel|wellbeing|well.being|mental health|eight of|8 of/],['reserve',/reserve|buffer|contingency|uncommitted|unspent|flexibility/],['funding',/sponsor|shortfall|budget|600|400|funding|afford|\bcut\b|resources|signed|contract|commitment/],['coaching',/playing time|role clarity|coaching|\bcoach\b|development goal|communication/],['implementation',/implement|measure|evaluate|\bowner\b|\blead\b|success|monitor|follow.up/],['evidence',/evidence|proof|\bdata\b|cause|depart|retention|\bleav(e|ing)\b/]];return rules.find(([,re])=>re.test(q))?.[0]||'strategy';}
const LENSES={
 coach:{outcomes:'I can explain the competitive rationale, but I cannot promise who stays or how many games we win.',capacity:'The case gives us enough applicable capacity; it does not give us unlimited resources.',funding:'I would identify which parts of the competitive plan matter most before reducing allocations.',payments:'Institutional payments can be one response to financial competition, but I cannot promise they will keep an athlete here.',aid:'An athlete’s ability to meet educational costs matters to the program as well as to that individual.',support:'Useful support has to fit athletes’ actual schedules; a larger budget line alone does not demonstrate access.',facilities:'Development depends on usable time and reliable access, not just an attractive facility.',reserve:'A reserve can protect later choices, but it also means postponing something we could improve now.',nil:'The chapter’s NIL concern is a reason to ask better questions, not to promise outside deals.',coaching:'I can improve how I explain role criteria, development goals, and expectations using assigned existing staff time.',equity:'I need to consider the effects across teams rather than treating the most visible team as the whole department.',evidence:'I would separate what athletes have reported from what we assume will retain them.',implementation:'I would assign someone to deliver the change and schedule a review with athletes.',strategy:'I care about competitive opportunity and development. The strongest plan explains how its spending addresses the problem.'},
 business:{outcomes:'A feasible budget does not establish a retention forecast or investment return.',capacity:'Permission and affordability are separate. The departmental envelope is not the regulatory benefits cap.',funding:'I would keep the recurring resource envelope separate from regulatory permission or hoped-for new income.',payments:'A permitted payment still creates a commitment the department must be able to support.',aid:'The aid finding helps identify a need; award decisions still need the appropriate review.',support:'The support category includes added academic and wellbeing capacity plus compliance and NIL-education enhancements.',facilities:'This category funds annual maintenance and access. No capital project or new arena is priced.',reserve:'Uncommitted reserve is part of this year’s available envelope, not extra spending or a cash balance from an earlier year.',nil:'An outside NIL agreement is not an institutional payment or new department funding.',coaching:'An operational change can avoid a new budget line while still using staff time that must be assigned.',equity:'Neither a balanced total nor settlement compliance establishes that all obligations have been met.',evidence:'An evidence-based allocation needs both a plausible problem and a feasible way to deliver the response.',implementation:'Name the delivery owner and the review point before signing a new commitment.',strategy:'Each preset is feasible within its stated annual envelope. None is a complete implementation plan by itself.'},
 athlete:{outcomes:'Athletes can make different reasonable choices. No spending mix guarantees that someone stays.',capacity:'A permitted allocation still needs to make sense for athletes and their actual needs.',funding:'I would want to understand what changes in our experience and what remains protected when resources fall.',payments:'Athletes can value financial arrangements differently. Ask what need the payment is meant to address.',aid:'Educational affordability can shape an athlete’s choices, but the aid finding does not tell every athlete’s story.',support:'A service is useful only if athletes can actually reach it at a workable time.',facilities:'Reliable access matters to development. Ask how the proposed work would reduce displacement.',reserve:'If money stays uncommitted, tell athletes what evidence or event would release it and when the decision will be reviewed.',nil:'Clear information can help athletes navigate opportunities without promising that a deal will appear.',coaching:'A conversation about role criteria and development can help, provided athletes can raise concerns and receive follow-through.',equity:'I can offer one perspective. Seek views across sports and circumstances instead of assuming everyone wants the same package.',evidence:'The supplied signals are useful starting points, not a vote from all athletes or proof of why everyone leaves.',implementation:'I would want a way to tell the university whether the change is reaching the athletes it is supposed to help.',strategy:'Explain the need you chose to prioritize and what another group may have to wait for.'}
};
const FOLLOW={
 outcomes:['Which result would you observe rather than promise?','What evidence would tell you that the approach is helping?','How would you explain the uncertainty to university leadership?'],
 capacity:['Which campus partners should review the actual commitments?','How would more cap space change funding that is actually available?','What additional operational checks would still be needed?'],
 funding:['Which commitment would you protect first, and why?','What would you postpone without removing funded baseline services?','Which assumption would you verify before signing?'],
 payments:['What evidence supports payments rather than another use?','What concern would remain even if this payment allocation were approved?','How would you assess the response without promising retention?'],
 aid:['Which costs and eligibility details would you verify before awards?','How would you explain this allocation alongside the other needs?','What would show whether the aid reached its intended purpose?'],
 support:['Which access problem would the enhancement address first?','Could a scheduling change address part of the concern?','Who will check whether the service becomes easier to use?'],
 facilities:['What annual access or maintenance outcome would you specify?','How would you tell whether displaced sessions decrease?','What could be addressed through scheduling with existing staff?'],
 reserve:['What would trigger a later allocation from the reserve?','When would you revisit the amount left uncommitted?','Which immediate benefit are you postponing to preserve that flexibility?'],
 nil:['Which responsibility belongs to the institution and which to an outside payer?','What information do athletes need, rather than a promise of a deal?','Who would help athletes understand the applicable review and reporting responsibilities?'],
 coaching:['Would you set a four-week follow-up on the agreed development goals?','How could athletes raise concerns beyond an individual coach?','What would you document without promising playing time?'],
 equity:['Whose needs are missing from the evidence so far?','Which campus partners should review the effects across athletes?','What would a fair process require beyond identical dollar amounts?'],
 evidence:['What further evidence could change your priority?','Which signal supports your choice, and what does it not establish?','What would you investigate before treating the hypothesis as a finding?'],
 implementation:['Who leads, who helps, and when will they review progress?','Which observable measure would matter beyond wins?','What result would prompt you to revise the plan?'],
 strategy:['Which need does your largest allocation address?','What does this approach give up compared with another preset?','What could you improve through management action without adding a budget line?']
};
function topicFacts(topic,phase){const revised=phase==='revised';return ({
 outcomes:'No preset or $25,000 adjustment has a supplied retention effect, win forecast, or promised outside NIL return. The evidence identifies needs to investigate, not a prediction of athlete decisions.',
 capacity:'Applicable payment and aid capacity are assumed for this classroom exercise. Existing obligations remain funded; the $600,000 and $400,000 amounts are available annual resources, not benefits-cap calculations.',
 funding:revised?'The fixed sponsorship shortfall removes $200,000 from the planned $600,000 annual resources, leaving $400,000. It occurs before new commitments; no replacement sponsorship is supplied.':'The additional planned annual envelope is $600,000. Existing obligations and baseline services are funded separately; cap capacity are assumed for the exercise.',
 payments:'Institutional payments, scholarships, and third-party NIL are different arrangements. No allocation in this exercise guarantees retention, a deal, or wins.',
 aid:EVIDENCE.aid.text,
 support:`${EVIDENCE.support.text} Required baseline services remain funded outside this additional plan.`,
 facilities:`${EVIDENCE.facilities.text} Proposed spending here is recurring maintenance and access enhancement, not a one-time capital purchase.`,
 reserve:'All five amounts, including the reserve, sum to the phase’s resource envelope. The optional $25,000 adjustment changes the revised mix without creating additional money.',
 nil:'Support includes extra compliance and NIL-education capacity; required compliance is already funded. No third-party offer or new outside income is established in the case.',
 coaching:'A structured coach–athlete conversation can clarify role criteria and development goals, with a four-week follow-up. It uses existing staff time and does not promise playing time.',
 equity:'The exercise protects existing obligations and baseline services. Participation, financial aid, and treatment require relevant review; the case supplies no formula for dividing direct payments.',
 evidence:'The fixed signals are $75,000 in annual unmet educational costs, 8 of 20 voluntary respondents reporting support-access difficulty, and six displaced development sessions last month. They do not establish a single cause of departures.',
 implementation:'Implementation includes a responsible office, partner contributions, and a specific review measure and time. A completed allocation does not itself deliver a service.',
 strategy:'The three presets emphasize financial commitments, daily athlete experience, or flexibility with targeted support. Each has tradeoffs; there is no hidden preferred plan.'
 })[topic];}
function planContext(plan,topic){if(!plan)return 'No preset is selected for this phase yet; you can compare the three approaches before choosing.';
 const a=plan.allocations;
 if(topic==='aid'){const relation=a.aid<75000?'below':a.aid>75000?'above':'equal to';return `Your selected plan assigns ${money(a.aid)} to additional scholarships, ${relation} the $75,000 evidence figure. That comparison is not an automatic award decision.`;}
 if(topic==='funding'||topic==='reserve')return `Your current ${money(plan.budget)} mix assigns ${money(spending(a))} to spending and leaves ${money(a.reserve)} uncommitted${a.reserve===0?', so this mix has no uncommitted buffer':''}.`;
 const category=({payments:'payments',nil:'support',support:'support',facilities:'facilities'})[topic];
 if(category)return `The selected plan assigns ${money(a[category])} to ${CATEGORIES.find(c=>c.id===category).label.toLowerCase()}.`;
 return `You are considering “${plan.name},” with ${money(a.reserve)} remaining uncommitted.`;
}
export function fallbackReply(s,role,question,phase=s.phase){
 phaseOK(phase);if(!Object.hasOwn(ROLES,role))throw new Error('Choose one of the three stakeholder roles.');if(typeof question!=='string'||!question.trim()||question.length>1200)throw new Error('Ask a question of 1 to 1,200 characters.');
 const topic=questionTopic(question),id=phase==='initial'?s.initialPlanId:s.revisedPlanId,plan=id?getPlan(phase,id,phase==='revised'?s.shift:null):null;
 const turn=(s.chats?.[phase]?.[role]?.length||0)/2;let hash=0;for(const c of question.toLowerCase().trim())hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
 const follow=FOLLOW[topic][(hash+Math.floor(turn))%3];
 return {text:`${LENSES[role][topic]}\n\n${topicFacts(topic,phase)} ${planContext(plan,topic)}\n\n${follow}`,topic,source:'authored',role,phase};
}
export function addExchange(s,role,question,response,options={}){
 const phase=options.phase||s.phase;phaseOK(phase);if(!Object.hasOwn(ROLES,role))throw new Error('Unknown stakeholder role.');
 const content=typeof response==='string'?response:response?.text,source=options.source||response?.source||'authored',topic=options.topic||response?.topic||questionTopic(question);
 if(typeof question!=='string'||!question.trim()||question.length>1200||typeof content!=='string'||!content.trim()||content.length>6000||!['authored','api'].includes(source)||typeof topic!=='string'||topic.length>60)throw new Error('Invalid conversation exchange.');
 if(phase==='revised'&&!s.eventRevealed)throw new Error('The revised phase is not available before the funding update.');
 const history=s.chats[phase][role];if(history.length>=40)throw new Error('This stakeholder has reached 20 exchanges in this phase. Use the conversation to make your recommendation.');
 return {...s,chats:{...s.chats,[phase]:{...s.chats[phase],[role]:[...history,{role:'user',content:question.trim(),source:'user'},{role:'assistant',content:content.trim(),source,topic}]}},completed:false};
}
export function restoreState(raw){
 try{
  if(!raw||raw.version!==1||!PHASES.includes(raw.phase)||typeof raw.eventRevealed!=='boolean'||typeof raw.completed!=='boolean')return null;
  if(raw.phase==='initial'&&(raw.eventRevealed||raw.completed||raw.provisional!==null||raw.revisedPlanId!==''||raw.shift!==null))return null;
  if(raw.phase==='revised'&&!raw.eventRevealed)return null;
  const s=createState();s.phase=raw.phase;s.eventRevealed=raw.eventRevealed;s.completed=raw.completed;
  for(const k of ['initialPlanId','revisedPlanId']){if(typeof raw[k]!=='string'||(raw[k]&&!PLAN_IDS.includes(raw[k])))return null;s[k]=raw[k];}
  if(s.eventRevealed){if(!s.initialPlanId)return null;const expected=getPlan('initial',s.initialPlanId);if(!raw.provisional||raw.provisional.id!==expected.id||raw.provisional.budget!==600000||!raw.provisional.allocations||IDS.some(k=>raw.provisional.allocations[k]!==expected.allocations[k]))return null;s.provisional=expected;}
  if(raw.shift!==null){if(s.phase!=='revised'||!s.revisedPlanId)return null;getPlan('revised',s.revisedPlanId,raw.shift);s.shift={from:raw.shift.from,to:raw.shift.to};}
  if(!raw.final||typeof raw.final!=='object'||Array.isArray(raw.final))return null;for(const k of FINAL_FIELDS){if(typeof raw.final[k]!=='string'||raw.final[k].length>1200)return null;s.final[k]=raw.final[k];}
  if(!raw.chats||typeof raw.chats!=='object')return null;
  for(const phase of PHASES){if(!raw.chats[phase]||typeof raw.chats[phase]!=='object')return null;for(const role of Object.keys(ROLES)){const a=raw.chats[phase][role];if(!Array.isArray(a)||a.length>40||a.length%2)return null;if(phase==='revised'&&!s.eventRevealed&&a.length)return null;const copied=[];for(let i=0;i<a.length;i++){const m=a[i],user=i%2===0;if(!m||m.role!==(user?'user':'assistant')||typeof m.content!=='string'||!m.content.trim()||m.content.length>(user?1200:6000)||!(user?m.source==='user':['authored','api'].includes(m.source)))return null;if(!user&&(typeof m.topic!=='string'||m.topic.length>60))return null;copied.push(user?{role:'user',content:m.content,source:'user'}:{role:'assistant',content:m.content,source:m.source,topic:m.topic});}s.chats[phase][role]=copied;}}
  if(s.completed&&!canFinish(s))return null;return s;
 }catch{return null;}
}
export function report(s){
 const initial=s.provisional||(s.initialPlanId?getPlan('initial',s.initialPlanId):null),final=s.revisedPlanId?getPlan('revised',s.revisedPlanId,s.shift):null;
 const planText=p=>p?`${p.name}\n${CATEGORIES.map(c=>`${c.label}: ${money(p.allocations[c.id])}`).join('\n')}\nTotal annual resource envelope: ${money(p.budget)}\nPlanned spending: ${money(spending(p.allocations))}`:'No plan selected';
 const transcript=PHASES.filter(phase=>phase==='initial'||s.eventRevealed).map(phase=>`${phase==='initial'?'INITIAL CONSULTATION — $600,000':'REVISED CONSULTATION — $400,000'}\n${Object.keys(ROLES).map(role=>`${ROLES[role].name}\n${s.chats[phase][role].length?s.chats[phase][role].map(m=>`${m.role==='user'?'AD':'Stakeholder ('+m.source+')'}: ${m.content}`).join('\n\n'):'No exchange recorded'}`).join('\n\n')}`).join('\n\n');
 return `THE AD DECISION — MGT 340\nFictional State University / Marcela Chavez teaching adaptation\nNo new agreements signed\n\nPROVISIONAL PLAN\n${planText(initial)}\n\nFUNDING UPDATE\n${s.eventRevealed?'$600,000 − $200,000 expected annual sponsorship = $400,000 additional recurring resources. Existing obligations and baseline services remain funded.':'Funding update not yet revealed.'}\n\nREVISED PLAN\n${planText(final)}\nOptional adjustment: ${s.shift?`${money(25000)} of annual allocation from ${CATEGORIES.find(c=>c.id===s.shift.from).label} to ${CATEGORIES.find(c=>c.id===s.shift.to).label}`:'None'}\n\nFINAL RECOMMENDATION\nDecision: ${s.final.decision}\nEvidence: ${s.final.evidence}\nTradeoff: ${s.final.tradeoff}\nImplementation and review: ${s.final.implementation}\n\nCONVERSATION TRANSCRIPT\n${transcript}\n\nSupport includes academic/wellbeing and compliance/NIL-education enhancements. Facilities means annual maintenance and access. Reserve is uncommitted annual capacity, not an assumed cash balance. Benefits-cap capacity are assumed; appropriate reviews still apply. Stakeholder responses are classroom perspectives, not new events, guarantees, or actual offers. No allocation guarantees retention, outside NIL income, or wins. This download is not an automatic course submission.\n`;
}
