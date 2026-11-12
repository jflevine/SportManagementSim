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
 coach:Object.freeze({name:'Coach',opening:"I want players to see a reason to build their future here. Money matters. So does whether we can deliver a real development plan. Tell me what you're considering.",revisedOpening:"We're down to $400,000. I still need a plan we can carry out. The earlier proposal isn't a commitment, and we haven't selected a revised one yet. What are you trying to protect?",starters:Object.freeze(['What would you push to protect first?','Would more payments solve the departures?','What can you change without more money?'])}),
 business:Object.freeze({name:'Business officer',opening:"We have $600,000 in additional annual resources. I want to know what we'll promise, how we'll pay for it each year, and what we'll leave uncommitted. Show me your thinking.",revisedOpening:"We have $400,000 now. The missing sponsorship is gone for this exercise. Nothing in the earlier proposal is already committed. Open Review revised plans when you're ready to choose a new proposal.",starters:Object.freeze(['What are we giving up with this plan?','How much should we leave uncommitted?','What must we check before making a promise?'])}),
 athlete:Object.freeze({name:'Student athlete',opening:"I want to get better, finish school, and feel like what athletes say matters. Money is part of that. I also want to know what would actually change for us with your plan.",revisedOpening:"That's a lot less to work with. I get that we can't do everything. I still want to know what changes for athletes. We haven't chosen a revised plan yet, right?",starters:Object.freeze(['What would matter most to you?','What would bother you about this plan?','What would make you believe a change is working?'])})
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
 coach:{outcomes:"I want wins and players who stay. I can't promise either from a budget sheet.",capacity:"Having room under a rule doesn't put more money in our account.",funding:"I don't want every line cut just to make the arithmetic look tidy. Protect something we can actually deliver.",payments:"I want a competitive offer. I also need a reason for players to believe in the program beyond that offer.",aid:"I'd take educational costs seriously. A development plan doesn't make those costs disappear.",support:"Adding support sounds good. It needs to be available when athletes can use it.",facilities:"Six development sessions displaced last month gets my attention. I want a schedule we can deliver.",reserve:"I see why you'd keep a cushion. I don't want us waiting indefinitely on something we could improve now.",nil:"I'd like athletes to see opportunities here. I'm not going to sell them an outside deal we don't have.",coaching:"I can be clearer about roles and development goals. That's on me; I don't need a new budget line to start.",equity:"I have competitive priorities. That doesn't make the most visible team the whole department.",evidence:"The departures worry me. I still need to know what drove them before I claim one fix will work.",implementation:"Give the work an owner and a date. Then let's check whether athletes see a difference.",strategy:"I want a plan I can explain to a player without making promises we can't keep."},
 business:{outcomes:"The numbers can balance without producing the result we want. I won't put a retention forecast on this.",capacity:"The spending budget and the benefits cap are different things. Cap room isn't cash.",funding:"We need to pay for this each year. A hoped-for sponsor doesn't fund a promise.",payments:"I'm open to payments. Tell me what we'd give up to fund them.",aid:"The need is real in the case. The aid awards aren't approved just because a line matches the need.",support:"Who will provide the extra support, and when? The budget line doesn't deliver it by itself.",facilities:"We're pricing annual maintenance and access here, not a new arena.",reserve:"I like having room to respond. Keeping money uncommitted also delays something we could do now.",nil:"Outside NIL earnings aren't new department funding in this case.",coaching:"Use existing staff time if it can help. Someone still needs to own the work.",equity:"A balanced budget doesn't settle every obligation. We still need the appropriate campus reviews.",evidence:"Show me the need and a workable response. We don't have to pretend the evidence proves more than it does.",implementation:"Name the person responsible before we make the promise. Put the review date on the calendar.",strategy:"All three plans fit the available money. I'd ask what each one leaves us unable to do."},
 athlete:{outcomes:"I'd love an easy answer about keeping everyone here. I don't think money gives us that.",capacity:"If we're allowed to spend it, fine. I still care what it actually changes for us.",funding:"I get that the money has a limit. I don't want the explanation to end at 'we made cuts.' Tell me what changes for athletes.",payments:"Honestly, I'd take the money part seriously. That doesn't mean I'd stop caring about getting better or being heard.",aid:"I'd want school costs taken seriously. I also wouldn't assume the same amount helps everyone in the same way.",support:"More support sounds good. If the hours still don't work, what really changed?",facilities:"I want a chance to get better. Reliable access matters more to me than a facility looking impressive.",reserve:"Seeing money left uncommitted would bother me a little. I get the cushion, but when do athletes see something from it?",nil:"I'd want straight answers about NIL. Getting my hopes up about a deal that isn't there wouldn't help.",coaching:"I'd want a straight conversation about where I stand and how to improve. Then I'd want someone to follow through.",equity:"I can tell you what I'd care about. Please don't turn that into 'the athletes all agree.'",evidence:"Those signals get my attention. I don't know that they explain why people left.",implementation:"I'd believe the change more if athletes could tell you whether it's actually working.",strategy:"I want something that helps now. I know we can't do everything, but I want you to be honest about who has to wait."}
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
 capacity:`We assume enough applicable benefits-cap capacity. The ${money(BUDGETS[phase])} is an annual resource budget, not benefits-cap calculations or new cash from cap room.`,
 funding:revised?'The $200,000 sponsorship shortfall leaves $400,000, before any new commitments. No replacement funding is supplied.':'We have $600,000 in additional annual resources. Existing obligations and baseline services are funded separately.',
 payments:'Institutional payments, scholarships, and third-party NIL are different arrangements. No allocation in this exercise guarantees retention, a deal, or wins.',
 aid:'The aid review shows $75,000 in combined annual unmet educational costs across both basketball teams. That is not an approved or committed award.',
 support:'Eight of 20 voluntary respondents reported trouble accessing support at useful times. That is a limited signal, not a finding about everyone or why players left.',
 facilities:'The log records six development sessions displaced last month. It establishes neither a safety finding nor why athletes left. This money is for annual maintenance and access.',
 reserve:'All five amounts, including the reserve, sum to the phase’s resource envelope. The optional $25,000 adjustment changes the revised mix without creating additional money.',
 nil:'Support includes extra compliance and NIL-education capacity; required compliance is already funded. No third-party offer or new outside income is established in the case.',
 coaching:'A structured coach–athlete conversation can clarify role criteria and development goals, with a four-week follow-up. It uses existing staff time and does not promise playing time.',
 equity:'The exercise protects existing obligations and baseline services. Participation, financial aid, and treatment require relevant review; the case supplies no formula for dividing direct payments.',
 evidence:'The fixed signals are $75,000 in annual unmet educational costs, 8 of 20 voluntary respondents reporting support-access difficulty, and six displaced development sessions last month. They do not establish a single cause of departures.',
 implementation:'Implementation includes a responsible office, partner contributions, and a specific review measure and time. A completed allocation does not itself deliver a service.',
 strategy:'The three presets emphasize financial commitments, daily athlete experience, or flexibility with targeted support. Each has tradeoffs; there is no hidden preferred plan.'
 })[topic];}
function planContext(plan,topic,phase){if(!plan)return phase==='revised'?'We have $400,000 and no revised plan selected. The earlier proposal is not committed. Open “Review revised plans” to choose; chat cannot change allocations.':'No initial plan is selected yet. Use “Review the three plans” to choose; chat cannot change allocations.';
 const a=plan.allocations;
 if(topic==='aid'){const relation=a.aid<75000?'below':a.aid>75000?'above':'equal to';return `Your proposed plan assigns ${money(a.aid)} to additional scholarships, ${relation} the $75,000 evidence figure. That comparison is not an automatic award decision.`;}
 if(topic==='funding'||topic==='reserve')return `Your proposed ${money(plan.budget)} mix assigns ${money(spending(a))} to spending and leaves ${money(a.reserve)} uncommitted${a.reserve===0?', so this mix has no uncommitted buffer':''}.`;
 const category=({payments:'payments',nil:'support',support:'support',facilities:'facilities'})[topic];
 if(category)return `The proposed plan assigns ${money(a[category])} to ${CATEGORIES.find(c=>c.id===category).label.toLowerCase()}.`;
 return `You are considering “${plan.name},” with ${money(a.reserve)} remaining uncommitted.`;
}
export function fallbackReply(s,role,question,phase=s.phase){
 phaseOK(phase);if(!Object.hasOwn(ROLES,role))throw new Error('Choose one of the three stakeholder roles.');if(typeof question!=='string'||!question.trim()||question.length>1200)throw new Error('Ask a question of 1 to 1,200 characters.');
 const topic=questionTopic(question),id=phase==='initial'?s.initialPlanId:s.revisedPlanId,plan=id?getPlan(phase,id,phase==='revised'?s.shift:null):null;
 const turn=(s.chats?.[phase]?.[role]?.length||0)/2;let hash=0;for(const c of question.toLowerCase().trim())hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
 const follow=role==='athlete'?['What would change for athletes first?','When would we hear whether this helped?','Would athletes get a say before that is decided?'][(hash+Math.floor(turn))%3]:role==='coach'?['What are you asking us to deliver first?','Who owns that change?','When do we check whether it is working?'][(hash+Math.floor(turn))%3]:FOLLOW[topic][(hash+Math.floor(turn))%3];
 const changeRequested=/\b(move|shift|transfer|switch|select|choose|change)\b.{0,70}(25,?000|\$25k|\bplan\b|\bpreset\b|\bfrom\b|\bto\b)/i.test(question);
 const context=planContext(plan,topic,phase);
 const boundary=changeRequested?' Chat can discuss that change, but cannot apply it. Use '+(phase==='revised'?'“Review revised plans”':'“Review the three plans”')+' for the selection.':'';
 const facts=topicFacts(topic,phase);
 const closing=plan&&!changeRequested&&turn%2===0?' '+follow:'';
 return {text:`${LENSES[role][topic]} ${facts} ${context}${boundary}${closing}`,topic,source:'authored',role,phase};
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
