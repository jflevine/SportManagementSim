export const MARKETS = {
  small: {
    id:'small', name:'Small-Market Builder', subtitle:'Loyal fans. Limited corporate base.',
    capacity:61000, baseAttendance:45500, baseTicket:78, localFactor:.78,
    sharedRevenue:390, sponsorBase:55, premiumBase:24, merchandiseBase:22,
    operatingBase:310, cash:118, startingDebt:165, brand:48, fanTrust:72,
    facility:56, value:7.6, rosterQuality:.47
  },
  growth: {
    id:'growth', name:'Growth-Market Challenger', subtitle:'Growing population. Crowded entertainment market.',
    capacity:68000, baseAttendance:51500, baseTicket:94, localFactor:1,
    sharedRevenue:390, sponsorBase:78, premiumBase:34, merchandiseBase:28,
    operatingBase:350, cash:155, startingDebt:205, brand:58, fanTrust:62,
    facility:64, value:9.1, rosterQuality:.50
  },
  large: {
    id:'large', name:'Big-Market Powerhouse', subtitle:'Premium demand. Expensive expectations.',
    capacity:76000, baseAttendance:65000, baseTicket:122, localFactor:1.38,
    sharedRevenue:390, sponsorBase:124, premiumBase:54, merchandiseBase:40,
    operatingBase:460, cash:215, startingDebt:270, brand:72, fanTrust:58,
    facility:74, value:11.8, rosterQuality:.54
  }
};

export const MANDATES = {
  turnaround:{id:'turnaround',name:'The Turnaround',tag:'Restore financial health',brief:'The franchise has posted weak operating results. Stabilize cash and margin without hollowing out the fan base.',weights:{financial:.42,fan:.18,competitive:.10,asset:.12,flexibility:.18}},
  contender:{id:'contender',name:'The Contender',tag:'Use the window without mortgaging it',brief:'Ownership believes the competitive window is open. Improve the team now while preserving enough flexibility to survive a miss.',weights:{financial:.24,fan:.12,competitive:.32,asset:.12,flexibility:.20}},
  growth:{id:'growth',name:'The Growth Story',tag:'Diversify and build value',brief:'The club is healthy but commercially underdeveloped. Grow local revenue, assets, and enterprise value without creating a liquidity problem.',weights:{financial:.24,fan:.17,competitive:.10,asset:.29,flexibility:.20}},
  survivor:{id:'survivor',name:'The Small-Market Survivor',tag:'Compete efficiently',brief:'You cannot outspend the largest markets every year. Build an efficient, durable model that can still produce credible teams.',weights:{financial:.31,fan:.18,competitive:.20,asset:.11,flexibility:.20}},
  newOwner:{id:'newOwner',name:'The New Owner',tag:'Create value under leverage',brief:'Ownership paid a premium and inherited leverage. Improve franchise value while keeping debt service and cash pressure under control.',weights:{financial:.30,fan:.13,competitive:.12,asset:.27,flexibility:.18}},
  facility:{id:'facility',name:'The Facility Crossroads',tag:'Solve the building problem',brief:'The venue is aging. Improve the asset and revenue platform without turning the franchise into a debt-service machine.',weights:{financial:.25,fan:.16,competitive:.09,asset:.31,flexibility:.19}}
};

export const PLAYERS = [
  {id:'p_star',type:'player',name:'Acquire Jalen Cross',subtitle:'27-year-old star scorer',upfront:8,annualCost:38,term:4,risk:.34,wins:.060,brand:5,fan:3,annualRevenue:10,down:-8,base:9,up:28,confidence:'Low',detail:'Elite production and national visibility. Expensive, injury-sensitive, and difficult to exit after Year 2.'},
  {id:'p_rising',type:'player',name:'Sign Andre Vega',subtitle:'23-year-old two-way starter',upfront:4,annualCost:18,term:4,risk:.21,wins:.036,brand:2,fan:1,annualRevenue:4.5,down:2,base:8,up:16,confidence:'Medium',detail:'Lower star effect, stronger contract flexibility, and a more balanced downside profile.'},
  {id:'p_vet',type:'player',name:'Add veteran depth',subtitle:'Two-year rotation package',upfront:2,annualCost:9,term:2,risk:.14,wins:.018,brand:0.5,fan:.5,annualRevenue:1.2,down:1,base:6,up:10,confidence:'High',detail:'Modest upside, reliable availability, and limited long-run commitment.'},
  {id:'p_dev',type:'player',name:'Fund player development lab',subtitle:'Development + analytics staff',upfront:6,annualCost:5,term:4,risk:.18,wins:.015,brand:.5,fan:.5,annualRevenue:1.4,development:.012,down:0,base:7,up:14,confidence:'Medium',detail:'Less immediate than a star signing; compounds through development and availability.'}
];

export const CAPITAL = [
  {id:'c_premium',type:'capital',name:'Build a premium club',subtitle:'New hospitality inventory',upfront:42,annualCost:4.1,term:8,risk:.20,wins:0,brand:2,fan:1,facility:6,annualRevenue:9.5,debtEligible:true,down:4,base:13,up:18,confidence:'High',detail:'Contracted hospitality revenue with construction, occupancy, and servicing-cost risk.'},
  {id:'c_training',type:'capital',name:'Build a performance center',subtitle:'Training + recovery infrastructure',upfront:32,annualCost:2.5,term:8,risk:.15,wins:.012,development:.008,brand:1,fan:.5,facility:5,annualRevenue:1.5,debtEligible:true,down:2,base:7,up:12,confidence:'Medium',detail:'Weak direct revenue but potential development, availability, and recruiting benefits.'},
  {id:'c_fantech',type:'capital',name:'Install a fan-tech platform',subtitle:'CRM, mobile, loyalty + concessions',upfront:18,annualCost:1.8,term:6,risk:.28,wins:0,brand:2,fan:3,facility:2,annualRevenue:5.2,debtEligible:true,down:-2,base:14,up:24,confidence:'Low',detail:'Creates data and sponsor inventory; payoff depends on adoption and execution.'},
  {id:'c_video',type:'capital',name:'Replace video + ribbon boards',subtitle:'In-venue experience + sponsor inventory',upfront:24,annualCost:1.2,term:7,risk:.17,wins:0,brand:1.5,fan:2.5,facility:3,annualRevenue:4.2,debtEligible:true,down:3,base:10,up:15,confidence:'High',detail:'Moderate revenue upside with a visible fan-experience benefit and low strategic optionality.'},
  {id:'c_district',type:'capital',name:'Develop an event district',subtitle:'Year-round venue activation',upfront:68,annualCost:7.5,term:10,risk:.36,wins:0,brand:4,fan:1,facility:7,annualRevenue:16,debtEligible:true,down:-5,base:12,up:25,confidence:'Low',detail:'Large, long-horizon bet with non-game revenue upside and significant capital exposure.'}
];

export const COMMERCIAL = [
  {id:'r_ticket',type:'commercial',name:'Add ticket-sales capacity',subtitle:'Two sellers + CRM support',upfront:1,annualCost:2.4,term:3,risk:.11,wins:0,brand:.5,fan:.5,annualRevenue:5.6,stream:'tickets',down:5,base:18,up:28,confidence:'High',detail:'Strong incremental contribution until the market begins to saturate.'},
  {id:'r_sponsor',type:'commercial',name:'Expand partnership sales',subtitle:'Seller + activation specialist',upfront:2,annualCost:3.3,term:3,risk:.19,wins:0,brand:1,fan:0,annualRevenue:7.4,stream:'sponsor',down:2,base:16,up:30,confidence:'Medium',detail:'Higher gross revenue, but servicing and inventory constraints matter.'},
  {id:'r_digital',type:'commercial',name:'Launch digital membership',subtitle:'Paid content + loyalty bundle',upfront:5,annualCost:2.2,term:4,risk:.30,wins:0,brand:2,fan:2,annualRevenue:4.8,stream:'digital',down:-6,base:11,up:27,confidence:'Low',detail:'Scalable if adoption is strong; uncertain conversion and retention.'},
  {id:'r_events',type:'commercial',name:'Build non-game event sales',subtitle:'Concerts, meetings + special events',upfront:4,annualCost:2.8,term:4,risk:.22,wins:0,brand:1,fan:.5,annualRevenue:6.8,stream:'other',down:1,base:14,up:24,confidence:'Medium',detail:'Diversifies the building beyond games but depends on local event demand.'},
  {id:'r_retention',type:'commercial',name:'Fund retention + service team',subtitle:'Protect renewals and fan trust',upfront:2,annualCost:2.6,term:3,risk:.12,wins:0,brand:.5,fan:3.5,annualRevenue:3.8,stream:'tickets',down:4,base:12,up:18,confidence:'High',detail:'Less flashy than acquisition, but protects recurring ticket and premium relationships.'}
];

export const EVENTS = [
  {id:'stable',title:'Stable market',desc:'Demand and costs land close to forecast.',mods:{}},
  {id:'recession',title:'Consumer slowdown',desc:'Discretionary demand softens, especially premium and ticket spending.',mods:{tickets:.93,premium:.88,sponsor:.96,other:.94,fan:-1}},
  {id:'corporate',title:'Corporate expansion',desc:'New regional employers increase premium and sponsorship demand.',mods:{premium:1.10,sponsor:1.09,brand:1}},
  {id:'media',title:'League media bump',desc:'A national distribution adjustment lifts shared revenue.',mods:{shared:14,digital:1.05}},
  {id:'inflation',title:'Operating-cost inflation',desc:'Labor and vendor costs rise faster than planned.',mods:{opex:1.055}},
  {id:'eventboom',title:'Event calendar boom',desc:'Concert and special-event demand surprises to the upside.',mods:{other:1.14,premium:1.04,brand:1}},
  {id:'injury',title:'Key-player injury cluster',desc:'Availability falls and the team underperforms its roster forecast.',mods:{wins:-.035,merch:.95,fan:-2}},
  {id:'sponsor',title:'Sponsor-category tailwind',desc:'A fast-growing category increases partnership demand.',mods:{sponsor:1.11,brand:1}}
];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,d=1)=>Number(v.toFixed(d));
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function rngFor(seed,cycle,salt=''){return mulberry32(hash(`${seed}|${cycle}|${salt}`))}
function shuffle(arr,r){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// All amounts are fictional $M. Operating result excludes interest; capital spending
// is depreciated, not charged twice. Forecast and actual use the same close engine.
export const LEAGUE_RULES = {
  statusQuo:{name:'National sharing only',effect:'Equal national revenue. No added local redistribution or payroll rule.'},
  sharing:{name:'Share local revenue',effect:'Transfer $22M from large to smaller markets: small +$18M; growth +$4M. Resources, not a payroll requirement.'},
  cap:{name:'Payroll cap',effect:'A $280M roster ceiling limits new commitments. Existing contracts remain payable; excess is grandfathered.'},
  floor:{name:'Payroll floor',effect:'Roster expense must reach $245M. A top-up pays retained depth; talent is not guaranteed.'},
  tax:{name:'Payroll tax',effect:'Each roster dollar above $250M costs an extra $0.65. Proceeds support opponents.'},
  draft:{name:'Reverse-order draft',effect:'Teams below .500 receive priority talent access next season, without a cash transfer.'}
};
export const POD_ROLES = [
  ['CFO','Protect the downside: reconcile cash, debt service and liquidity.'],
  ['Competition','Argue for wins and the roster window; name what you would give up.'],
  ['Commercial','Challenge demand forecasts and revenue concentration.'],
  ['Fan / brand','Test affordability, sponsor fit and long-run trust.'],
  ['Facilities','Price the asset, lifecycle costs and construction risk.'],
  ['Board chair','Record the tradeoff and the dissent before locking the decision.']
];
export const DILEMMAS = [
  {id:'sponsor',title:'The sponsor your fans are questioning',body:'A legal but divisive sponsor offers a three-year deal. A local coalition offers less cash and a stronger relationship.',
    options:[
      {id:'national',name:'Sign the divisive national deal',summary:'+$14M revenue / +$2M servicing each year for 3 years; fan trust −4 each year; brand +1.',annualRevenue:14,annualCost:2,fan:-4,brand:1,term:3},
      {id:'local',name:'Choose the local coalition',summary:'+$6M revenue / +$2M servicing each year for 3 years; fan trust +2.',annualRevenue:6,annualCost:2,fan:2,term:3},
      {id:'pass',name:'Keep the category open',summary:'No new contract. Preserve fan trust and future sponsor flexibility.',term:1}
    ]},
  {id:'extension',title:'The competitive window is closing',body:'Your captain wants a guaranteed extension. Finance wants a shorter commitment. Neither forecast guarantees availability.',
    options:[
      {id:'extend',name:'Guarantee the star extension',summary:'+$12M annual payroll for 3 years; +3 potential win-percentage points before diminishing returns and injury; +$4M forecast attention revenue; brand +2 each year.',annualCost:12,annualRevenue:4,wins:.03,brand:2,term:3,risk:.35,type:'player'},
      {id:'depth',name:'Retain two depth players',summary:'+$5M annual payroll for 2 years; +1.3 potential win-percentage points before diminishing returns and injury; less upside and a shorter commitment.',annualCost:5,wins:.013,term:2,type:'player'},
      {id:'wait',name:'Wait for next year',summary:'No new payroll. Immediate fan trust −2; preserve room for other investments.',fan:-2,term:1}
    ]},
  {id:'maintenance',title:'The building has a deadline',body:'An inspection finds tired public areas and rising repair bills. A capital repair lasts; a patch buys time.',
    options:[
      {id:'renew',name:'Fund a lasting repair',summary:'$16M capex; +9 facility points when completed; $1M annual savings for 6 operating years. Cash-funded; construction risk remains.',upfront:16,annualCost:-1,facility:9,term:6,type:'capital'},
      {id:'patch',name:'Make a one-season patch',summary:'$4M expense now; +2 facility points now. Normal wear continues; more replacement work remains.',upfront:4,facility:2,term:1},
      {id:'defer',name:'Defer the work',summary:'Save cash today; −6 facility and −2 fan points each year; +$3M maintenance cost for 2 years.',annualCost:3,facility:-6,fan:-2,term:2,facilityRecurring:true}
    ]},
  {id:'events',title:'The venue calendar conflict',body:'A concert promoter wants prime dates. Extra events create revenue but add wear and consume staff time.',
    options:[
      {id:'exclusive',name:'Give the promoter an exclusive window',summary:'+$11M forecast event revenue / +$4M cost for 2 years; −2 facility points each year; +1 brand each year.',annualRevenue:11,annualCost:4,facility:-2,brand:1,term:2,facilityRecurring:true},
      {id:'selective',name:'Keep a selective event calendar',summary:'+$5M revenue / +$2M cost for 2 years; retain flexibility and limit wear.',annualRevenue:5,annualCost:2,term:2},
      {id:'protect',name:'Protect the field and calendar',summary:'No event revenue; +2 fan trust this season.',fan:2,term:1}
    ]}
];
export function createState(marketId='growth',mandateId='growth',seed='MGT340',mode='class',leaguePolicy='statusQuo'){
  if(!MARKETS[marketId]||!MANDATES[mandateId]||!LEAGUE_RULES[leaguePolicy])throw new Error('Choose a valid market, mandate and league policy.');
  if(!['class','full'].includes(mode))throw new Error('Choose Class or Full mode.');
  if(!['class','full'].includes(mode))throw new Error('Choose Class or Full mode.');
  const m=MARKETS[marketId];
  const bookAssets=420+(marketId==='large'?90:marketId==='small'?-50:0);
  return {marketId,mandateId,seed:String(seed),mode,leaguePolicy,cycle:1,maxCycles:mode==='full'?5:3,
    cash:m.cash,brand:m.brand,fanTrust:m.fanTrust,facility:m.facility,franchiseValue:m.value,
    rosterQuality:m.rosterQuality,developmentBonus:0,bookAssets,bookEquity:m.cash+bookAssets-m.startingDebt,
    ownerShare:1,equityRaised:0,publicRaised:0,arrears:0,leagueHealth:68,
    rivals:[{market:'small',cash:38,payroll:218,wins:.42},{market:'growth',cash:52,payroll:252,wins:.50},{market:'large',cash:85,payroll:306,wins:.60}],
    activeInvestments:[],debtTranches:[{id:'legacy',name:'Existing franchise debt',principal:m.startingDebt,rate:.048,remaining:12,original:m.startingDebt,payment:payment(m.startingDebt,.048,12)}],
    history:[],rationales:[],distress:false};
}
export function payment(principal,rate,term){
  return principal<=0?0:rate===0?principal/term:principal*rate/(1-Math.pow(1+rate,-term));
}
export function getDebtSummary(state){
  let principal=0,interest=0,principalDue=0;
  for(const d of state.debtTranches){
    principal+=d.principal;
    const i=d.principal*d.rate;
    interest+=i;
    principalDue+=Math.min(d.principal,Math.max(0,(d.payment??payment(d.original,d.rate,d.originalTerm||d.remaining))-i));
  }
  return {principal,interest,principalDue,service:interest+principalDue};
}
export function getBorrowingCapacity(state){
  return Math.max(0,({small:360,growth:430,large:530}[state.marketId])-getDebtSummary(state).principal);
}
function stack(p,funding=0){
  const f=typeof funding==='number'?{debtPct:funding}:funding||{};
  for(const [key,max] of [['debtPct',.7],['equityPct',.5],['publicPct',.2]]){
    const value=Number(f[key]??0);
    if(!Number.isFinite(value)||value<0||value>max)throw new Error('Funding shares must stay within the disclosed source limits.');
    if(!p.debtEligible&&value!==0)throw new Error('Only eligible capital projects accept outside financing.');
  }
  for(const [key,max] of [['debtPct',.7],['equityPct',.5],['publicPct',.2]]){
    if(f[key]!==undefined&&(!Number.isFinite(Number(f[key]))||Number(f[key])<0||Number(f[key])>max))throw new Error('Invalid '+key+' financing share.');
    if(!p.debtEligible&&Number(f[key]||0)!==0)throw new Error('Only eligible capital projects can use outside financing.');
  }
  const debtPct=p.debtEligible?clamp(Number(f.debtPct)||0,0,.7):0;
  const equityPct=p.debtEligible?clamp(Number(f.equityPct)||0,0,.5):0;
  const publicPct=p.debtEligible?clamp(Number(f.publicPct)||0,0,.2):0;
  if(debtPct+equityPct+publicPct>1.00000001)throw new Error('Capital sources exceed 100%.');
  return {debtPct,equityPct,publicPct};
}
export function estimateProposalImpact(state,p,funding=0){
  const s=stack(p,funding),debtAmount=p.upfront*s.debtPct,equityAmount=p.upfront*s.equityPct,publicAmount=p.upfront*s.publicPct;
  const cashNeed=p.upfront-debtAmount-equityAmount-publicAmount;
  const rate=.058+(state.distress?.02:0),term=10;
  const annualDebtService=payment(debtAmount,rate,term);
  const revenue=(p.annualRevenue||0)*(s.publicPct? .92:1);
  const directNet=revenue-(p.annualCost||0),afterDebtNet=directNet-annualDebtService;
  const year1Commitment=p.type==='capital'?p.upfront:Math.max(1,p.upfront+(p.annualCost||0));
  return {...s,debtAmount,equityAmount,publicAmount,cashNeed,rate,term,annualDebtService,directNet,afterDebtNet,year1Commitment,
    directROI:directNet/Math.max(1,year1Commitment)*100,equityCashYield:cashNeed+equityAmount>0?afterDebtNet/(cashNeed+equityAmount)*100:null,
    simpleROI:directNet/Math.max(1,year1Commitment)*100,dscr:annualDebtService?directNet/annualDebtService:null,
    breakEvenYears:directNet>0?p.upfront/directNet:null};
}
export function getScenarioModel(state,p,funding=0){
  const i=estimateProposalImpact(state,p,funding);
  const spread=clamp((p.risk||.15)*(p.confidence==='High'?.7:p.confidence==='Low'?1.25:1),.08,.48);
  const downMult=clamp(1-spread*1.35,.42,.94),upMult=1+spread*1.55;
  const net=mult=>(p.annualRevenue||0)*(i.publicPct?.92:1)*mult-(p.annualCost||0)-i.annualDebtService;
  return {downsideNet:net(downMult),baseNet:net(1),upsideNet:net(upMult),downsideROI:net(downMult)/i.year1Commitment*100,baseROI:net(1)/i.year1Commitment*100,upsideROI:net(upMult)/i.year1Commitment*100,downMult,upMult,confidence:p.confidence};
}
export function getActiveEffects(state){
  const e={annualRevenue:0,annualCost:0,playerCost:0,wins:0,brand:0,fan:0,facility:0,development:state.developmentBonus,streams:{}};
  for(const inv of state.activeInvestments){
    if(inv.remaining<=0)continue;
    const open=!inv.delay;
    const cost=(inv.annualCost||0)*(open?1:.25);
    if(inv.type==='player')e.playerCost+=cost;else e.annualCost+=cost;
    if(!open)continue;
    if(inv.stream)e.streams[inv.stream]=(e.streams[inv.stream]||0)+(inv.annualRevenue||0);
    else e.annualRevenue+=inv.annualRevenue||0;
    e.wins+=inv.wins||0;e.brand+=(inv.brand||0)*(inv.isBoard?1:.45);e.fan+=(inv.fan||0)*(inv.isBoard?1:.55);
    if(inv.facilityRecurring||!inv.commissioned)e.facility+=inv.facility||0;
    e.development+=inv.development||0;
  }
  return e;
}
export function getOpportunitySet(state){
  const r=rngFor(state.seed,state.cycle,'opps'),used=new Set(state.activeInvestments.map(x=>x.id));
  // Sorting is independent of prior selections, and common proposals keep the same uncertainty draw.
  const players=shuffle(PLAYERS.filter(x=>!used.has(x.id)),r),capital=shuffle(CAPITAL.filter(x=>!used.has(x.id)),r),commercial=shuffle(COMMERCIAL.filter(x=>!used.has(x.id)),r);
  const first=[players[0],capital[0],commercial[0]].filter(Boolean);
  const rest=shuffle([...players.slice(1),...capital.slice(1),...commercial.slice(1)],r);
  return [...first,...rest.slice(0,2)].map(p=>({...p}));
}
export function getBoardDilemma(state){
  const offset=Math.floor(rngFor(state.seed,0,'dilemmas')()*DILEMMAS.length);
  return DILEMMAS[(offset+state.cycle-1)%DILEMMAS.length];
}
function normalizePlan(state,plan={}){
  const d=getBoardDilemma(state),choice=d.options.find(o=>o.id===plan.boardChoice)||d.options[d.options.length-1];
  return {ticketYield:clamp(Number(plan.ticketYield)||1,.8,1.25),boardChoice:choice.id,choice,dilemma:d};
}
export function advisorViews(state,p,funding=0){
  const i=estimateProposalImpact(state,p,funding),s=getScenarioModel(state,p,funding);
  return {
    CFO:'Cash needed now: $'+i.cashNeed.toFixed(1)+'M. Annual debt service: $'+i.annualDebtService.toFixed(1)+'M. Downside contribution: $'+s.downsideNet.toFixed(1)+'M.',
    'General Manager':p.wins?'Potential lift: '+(p.wins*100).toFixed(1)+' win-percentage points before diminishing returns and uncertainty. A '+p.term+'-year commitment competes with future payroll.':'This does not directly add talent; explain its opportunity cost.',
    'Commercial / fan':'Gross revenue is not contribution. Test demand, servicing cost and whether fan benefits persist after losses.',
    'Facilities / capital':p.type==='capital'?'Book an asset, then fund its operating life. A delay can remove first-year revenue while the lender still gets paid.':'This is a contract or operating program, not a capital-asset accounting shortcut.',
    'Board chair':'Choose for '+MANDATES[state.mandateId].tag.toLowerCase()+'. Name one defensible alternative and the risk you accept.'
  };
}
export function validateDecision(state,selections=[],plan={}){
  const errors=[];
  if(state.cycle>state.maxCycles)errors.push('This game is complete; start a new franchise.');
  if(selections.length>2)errors.push('Choose at most two new proposals.');
  if(plan.ticketYield!==undefined&&(!Number.isFinite(Number(plan.ticketYield))||Number(plan.ticketYield)<.8||Number(plan.ticketYield)>1.25))errors.push('Ticket yield must be between 80% and 125%.');
  if(plan.boardChoice!==undefined&&!getBoardDilemma(state).options.some(o=>o.id===plan.boardChoice))errors.push('Choose a valid board response.');
  const available=getOpportunitySet(state),seen=new Set();
  let cash=0,debt=0,equity=0,newPlayer=0;
  for(const s of selections){
    const p=available.find(p=>p.id===s.proposal?.id);
    if(!p){errors.push('That proposal is not available this season.');continue;}
    if(seen.has(p.id)){errors.push('A proposal cannot be funded twice.');continue;}
    seen.add(p.id);
    try{const i=estimateProposalImpact(state,p,s);cash+=i.cashNeed;debt+=i.debtAmount;equity+=i.equityAmount;}catch(e){errors.push(e.message);}
    if(p.type==='player')newPlayer+=p.annualCost||0;
  }
  const n=normalizePlan(state,plan),effects=getActiveEffects(state);
  cash+=n.choice.upfront||0;
  if(n.choice.type==='player')newPlayer+=n.choice.annualCost||0;
  if(cash>Math.max(0,state.cash)+.00001)errors.push('Upfront cash exceeds available cash. Revise financing, choose a lower-cost board response, or hold.');
  if(debt>getBorrowingCapacity(state)+.00001)errors.push('New debt exceeds the disclosed credit limit.');
  if(equity+state.equityRaised>65.00001)errors.push('Outside investors have committed no more than $65M across this run.');
  if(state.arrears>0&&selections.some(s=>s.proposal.type==='capital'))errors.push('Unpaid obligations must be cleared before new capital projects.');
  const base={small:196,growth:216,large:236}[state.marketId];
  if(state.leaguePolicy==='cap'&&base+effects.playerCost+newPlayer>280+.00001&&newPlayer>0)errors.push('New roster commitments would breach the $280M payroll cap.');
  const publicActive=state.activeInvestments.some(i=>i.publicPct>0)||selections.some(s=>s.publicPct>0);
  if(publicActive&&n.ticketYield>1.05)errors.push('Your public-capital covenant limits ticket yield to 105% of the base price.');
  return errors;
}
function realizeProposal(state,p,s,actual){
  const impact=estimateProposalImpact(state,p,s);
  const r=rngFor(state.seed,state.cycle,'proposal-'+p.id);
  const scenarios=getScenarioModel(state,p,s),movement=(r()-.5)*2;
  const multiplier=actual?(movement<0?1+movement*(1-scenarios.downMult):1+movement*(scenarios.upMult-1)):1;
  const draw=r(),delay=actual&&p.type==='capital'&&draw<(p.risk||.2)*.32?1:0;
  const overrun=actual&&p.type==='capital'&&draw>.72?(p.upfront*(.06+r()*.12)):0;
  const injury=actual&&p.type==='player'&&draw<(p.risk||.2);
  const revenue=(p.annualRevenue||0)*multiplier*(impact.publicPct?.92:1)*(injury?.55:1);
  const investment={...p,...impact,annualRevenue:revenue,wins:(p.wins||0)*(injury?.35:1),remaining:p.term,delay,assetBasis:p.type==='capital'?p.upfront+overrun:0,bookValue:p.type==='capital'?p.upfront+overrun:0,commissioned:false,
    recoverAfterSeason:injury?{wins:p.wins||0,annualRevenue:(p.annualRevenue||0)*multiplier*(impact.publicPct?.92:1)}:null};
  return {investment,impact,overrun,delay,injury,revenue,multiplier};
}
// Three disclosed benchmark opponents make joint production visible. These are
// illustrative club budgets, not a simulation of every club or a real CBA.
// Policy changes resources, costs or talent access; none awards "health points".
function closeRivals(state,rule,event,actual,ourTax){
  const mods=actual?event.mods:{};
  const drafts=state.rivals.map(r=>rule==='draft'&&r.wins<.5?.025:0);
  const rows=state.rivals.map((r,index)=>{
    const planned=r.plannedPayroll??r.payroll;
    const talentPayroll=rule==='cap'?Math.min(planned,280):planned;
    const payroll=rule==='floor'?Math.max(245,talentPayroll):talentPayroll;
    const floorTopup=payroll-talentPayroll;
    const tax=rule==='tax'?Math.max(0,payroll-250)*.65:0;
    const transfer=rule==='sharing'?{small:18,growth:4,large:-22}[r.market]:0;
    const localBase={small:75,growth:100,large:155}[r.market];
    const localShock=localBase*((mods.premium||1)+(mods.sponsor||1)-2)/2;
    const nationalDelta=390*(.88+.12*state.leagueHealth/68)-390+(mods.shared||0);
    const resources={small:233,growth:264,large:331}[r.market]+localShock+nationalDelta+transfer;
    const rawWins=.5+(talentPayroll-252)*.0015+drafts[index]+(actual?(rngFor(state.seed,state.cycle,'rival-'+r.market)()-.5)*.04+(mods.wins||0):0);
    return {...r,payroll,plannedPayroll:planned,resources,tax,transfer,floorTopup,draftBoost:drafts[index],wins:clamp(rawWins,.25,.75)};
  });
  const taxPool=rows.reduce((n,r)=>n+r.tax,0)+ourTax;
  rows.forEach(r=>{
    r.taxSupport=rule==='tax'?taxPool*({small:.65,growth:.35,large:0}[r.market]):0;
    r.cashChange=r.resources+r.taxSupport-r.payroll-r.tax;
    r.cash=r.cash+r.cashChange;
  });
  const mean=rows.reduce((n,r)=>n+r.wins,0)/rows.length;
  const spread=Math.sqrt(rows.reduce((n,r)=>n+(r.wins-mean)**2,0)/rows.length);
  const competitive=clamp(1-spread/.18,0,1)*100;
  const financial=rows.reduce((n,r)=>n+clamp(r.cash/90,0,1),0)/rows.length*100;
  const health=clamp(state.leagueHealth*.5+(financial*.55+competitive*.45)*.5,25,95);
  return {rows,financial,competitive,health,taxPool,
    explanation:'Rival health combines disclosed cash resilience (55%) and dispersion in rival win percentages (45%), smoothed halfway from last season. It changes next season’s shared media revenue. Floor top-ups are costs, not guaranteed talent.'};
}
function annualClose(state,selections=[],plan={},actual=false){
  const n=normalizePlan(state,plan),m=MARKETS[state.marketId];
  const working={...state,activeInvestments:state.activeInvestments.map(i=>({...i})),debtTranches:state.debtTranches.map(d=>({...d}))};
  let capex=0,launchExpense=0,newDebt=0,newEquity=0,newPublic=0,totalOutlay=0;
  const realized=[];
  const selected=selections.map(s=>({...s,proposal:getOpportunitySet(state).find(p=>p.id===s.proposal.id)||s.proposal}));
  const board={...n.choice,id:'board-'+n.dilemma.id+'-'+state.cycle,type:n.choice.type||'commercial',name:n.choice.name,upfront:n.choice.upfront||0,confidence:'Medium',isBoard:true};
  for(const s of [...selected,{proposal:board}]){
    const p=s.proposal,a=realizeProposal(state,p,s,actual),i=a.impact;
    totalOutlay+=p.upfront+a.overrun;
    if(p.type==='capital')capex+=p.upfront+a.overrun;else launchExpense+=p.upfront;
    newDebt+=i.debtAmount;newEquity+=i.equityAmount;newPublic+=i.publicAmount;
    working.activeInvestments.push(a.investment);
    if(i.debtAmount>0)working.debtTranches.push({id:p.id+'-'+state.cycle,name:p.name,principal:i.debtAmount,original:i.debtAmount,rate:i.rate,remaining:i.term,payment:i.annualDebtService});
    const actualNet=(a.delay?0:a.revenue)-(p.annualCost||0)*(a.delay?.25:1)-i.annualDebtService;
    realized.push({id:p.id,name:p.name,forecastNet:i.afterDebtNet,actualNet,forecastROI:i.directROI,actualROI:((a.delay?0:a.revenue)-(p.annualCost||0)*(a.delay?.25:1))/Math.max(1,i.year1Commitment+a.overrun)*100,
      cashNeed:i.cashNeed+a.overrun,debt:i.debtAmount,equity:i.equityAmount,public:i.publicAmount,overrun:a.overrun,delay:a.delay,injury:a.injury,
      explanation:a.delay?'Opening delayed: first-year revenue is absent; 25% of operating costs and full debt service remain.':a.injury?'Availability shock reduces both playing contribution and attention revenue; guaranteed payroll remains.':a.overrun?'Construction overrun is cash-funded; the original loan and public/equity commitments do not increase.':'Demand / delivery realization changes the proposal benefit, not the contractual cost.'});
  }
  const active=getActiveEffects(working),r=rngFor(state.seed,state.cycle,'cycle');
  const event=EVENTS[Math.floor(r()*EVENTS.length)],mods=actual?event.mods:{};
  const rule=state.leaguePolicy,basePayroll={small:196,growth:216,large:236}[state.marketId];
  const draftBoost=rule==='draft'&&(state.history.at(-1)?.wins??state.rosterQuality)<.5?.016:0;
  const effectiveTalent=active.wins/(1+Math.max(0,active.wins)*1.6);
  const expectedWin=clamp(state.rosterQuality+effectiveTalent+active.development*.5+draftBoost,.28,.77);
  const wins=clamp(expectedWin+(actual?(r()-.5)*.055+(mods.wins||0):0),.2,.82);
  const facilityForDemand=clamp(state.facility+active.facility,15,100);
  const demand=.80+wins*.28+state.fanTrust/620+state.brand/1000;
  const elasticity={small:1.6,growth:1.25,large:1.05}[state.marketId];
  const priceResponse=Math.max(.45,1-elasticity*(n.ticketYield-1));
  const attendance=clamp(m.baseAttendance*demand*priceResponse*(mods.tickets||1),m.capacity*.30,m.capacity*.995);
  const sharing=rule==='sharing'?{small:18,growth:4,large:-22}[state.marketId]:0;
  const leagueFactor=.88+.12*state.leagueHealth/68;
  const revenue={
    shared:(m.sharedRevenue+(mods.shared||0))*leagueFactor+sharing,
    tickets:attendance*9*m.baseTicket*n.ticketYield/1e6+(active.streams.tickets||0),
    premium:(m.premiumBase*m.localFactor*(.82+facilityForDemand/120+wins*.18)+(active.streams.premium||0))*(mods.premium||1),
    sponsor:(m.sponsorBase*(.82+state.brand/250+wins*.12)+(active.streams.sponsor||0))*(mods.sponsor||1),
    merchandise:m.merchandiseBase*m.localFactor*(.76+state.brand/210+wins*.22)*(mods.merch||1),
    digital:(10*m.localFactor*(.8+state.brand/250)+(active.streams.digital||0))*(mods.digital||1),
    other:(14*m.localFactor+Math.max(0,facilityForDemand-55)*.20+(active.streams.other||0))*(mods.other||1),
    investment:active.annualRevenue
  };
  const rawPayroll=basePayroll+active.playerCost,floorTopup=rule==='floor'?Math.max(0,245-rawPayroll):0;
  const payroll=rawPayroll+floorTopup,payrollTax=rule==='tax'?Math.max(0,payroll-250)*.65:0;
  const maintenance=Math.max(0,58-facilityForDemand)*.45;
  const operating=(m.operatingBase+active.annualCost+maintenance)*(mods.opex||1);
  const depreciationFor=i=>i.type==='capital'&&!i.delay?Math.min(i.bookValue||0,i.assetBasis/i.term):0;
  const priorProjectAssets=state.activeInvestments.reduce((sum,i)=>sum+(i.bookValue||0),0);
  const legacyDepreciation=Math.min(Math.max(0,state.bookAssets-priorProjectAssets),8);
  const depreciation=legacyDepreciation+working.activeInvestments.reduce((sum,i)=>sum+depreciationFor(i),0);
  const debtBefore=getDebtSummary(working);
  const expenses={roster:payroll,operations:operating,payrollTax,launch:launchExpense,depreciation};
  const revTotal=Object.values(revenue).reduce((a,b)=>a+b,0),expTotal=Object.values(expenses).reduce((a,b)=>a+b,0);
  const operatingResult=revTotal-expTotal,netIncome=operatingResult-debtBefore.interest;
  const principalPaid=debtBefore.principalDue;
  let cashBeforeRescue=state.cash+netIncome+depreciation-capex+newDebt+newEquity+newPublic-principalPaid;
  const scheduledDebts=working.debtTranches.map(d=>{
    const principal=Math.min(d.principal,Math.max(0,d.payment-d.principal*d.rate));
    return {...d,principal:Math.max(0,d.principal-principal),remaining:Math.max(0,d.remaining-1)};
  }).filter(d=>d.principal>1e-8);
  let emergencyDebt=0,newArrears=0,arrearsPaid=0;
  const currentDebt=scheduledDebts.reduce((sum,d)=>sum+d.principal,0);
  if(cashBeforeRescue<0){
    emergencyDebt=Math.min(-cashBeforeRescue,Math.max(0,({small:360,growth:430,large:530}[state.marketId])-currentDebt),80);
    if(emergencyDebt>0)scheduledDebts.push({id:'bridge-'+state.cycle,name:'Emergency liquidity facility',principal:emergencyDebt,original:emergencyDebt,rate:.095,remaining:3,payment:payment(emergencyDebt,.095,3)});
    newArrears=Math.max(0,-cashBeforeRescue-emergencyDebt);
  }else arrearsPaid=Math.min(state.arrears,cashBeforeRescue);
  const cash=Math.max(0,cashBeforeRescue+emergencyDebt+newArrears-arrearsPaid);
  const arrears=state.arrears+newArrears-arrearsPaid,debt=scheduledDebts.reduce((sum,d)=>sum+d.principal,0);
  const fan=clamp(state.fanTrust+(wins-.5)*10+active.fan+(mods.fan||0)-Math.max(0,n.ticketYield-1)*18+Math.max(0,1-n.ticketYield)*6-.7,10,98);
  const brand=clamp(state.brand+(wins-.5)*9+active.brand+(mods.brand||0),10,98);
  const facility=clamp(state.facility+active.facility-1.5,15,100);
  const rivals=closeRivals(state,rule,event,actual,payrollTax),leagueHealth=rivals.health;
  const bookAssets=Math.max(0,state.bookAssets+capex-depreciation);
  const bookEquity=state.bookEquity+netIncome+newEquity+newPublic;
  const ownerShare=newEquity?state.ownerShare*Math.max(1,state.bookEquity)/(Math.max(1,state.bookEquity)+newEquity):state.ownerShare;
  const franchiseValue=Math.max(2,state.franchiseValue*(1+clamp(.014+(wins-.5)*.055+(brand-state.brand)/250+(facility-state.facility)/330+operatingResult/revTotal*.07,-.08,.13)));
  const aged=working.activeInvestments.map(i=>({...i,...(i.recoverAfterSeason||{}),recoverAfterSeason:null,remaining:i.remaining-(i.type==='capital'&&i.delay?0:1),delay:Math.max(0,(i.delay||0)-1),commissioned:i.commissioned||!i.delay,bookValue:Math.max(0,(i.bookValue||0)-depreciationFor(i))})).filter(i=>i.remaining>0);
  const record={cycle:state.cycle,event:actual?event:{id:'forecast',title:'Base forecast',desc:'No macro shock; proposal assumptions at base case.'},wins,expectedWin,attendance,ticketYield:n.ticketYield,ticketPrice:m.baseTicket*n.ticketYield,
    revenue,expenses,revTotal,expTotal,operatingResult,profit:operatingResult,interest:debtBefore.interest,netIncome,depreciation,
    beginningCash:state.cash,cash,cashChange:cash-state.cash,debt,principalPaid,fan,brand,facility,franchiseValue,
    realized,upfrontCash:totalOutlay-newDebt-newEquity-newPublic,totalOutlay,capex,newDebt,newEquity,newPublic,emergencyDebt,newArrears,arrearsPaid,arrears,bookAssets,bookEquity,ownerShare,
    floorTopup,payrollTax,draftBoost,sharing,leagueHealth,leagueFactor,rivals,boardTitle:n.dilemma.title,boardChoice:n.choice.name,plan:{ticketYield:n.ticketYield,boardChoice:n.boardChoice}};
  const next={...working,cycle:state.cycle+1,cash,fanTrust:fan,brand,facility,franchiseValue,bookAssets,bookEquity,ownerShare,
    equityRaised:state.equityRaised+newEquity,publicRaised:state.publicRaised+newPublic,arrears,leagueHealth,rivals:rivals.rows,activeInvestments:aged,debtTranches:scheduledDebts,
    rosterQuality:clamp(state.rosterQuality+active.development*.1-.008,.3,.7),history:state.history,rationales:state.rationales,distress:state.distress||newArrears>0||emergencyDebt>0};
  return {next,record};
}
export function forecastCycle(state,selections=[],plan={}){
  const {record:r}=annualClose(state,selections,plan,false);
  return {...r,revenue:r.revTotal,expenses:r.expTotal,profit:r.operatingResult,upfrontCash:r.upfrontCash,newDebt:r.newDebt,projectedEndingCash:r.cash,projectedDebt:r.debt,existingDebt:getDebtSummary(state).principal,rawEndingCash:r.cash-r.emergencyDebt-r.newArrears,record:r};
}
export function runCycle(state,selections=[],rationale={text:'Hold and preserve flexibility.',risk:'Opportunity cost'},plan={},options={}){
  const errors=validateDecision(state,selections,plan);
  if(errors.length)throw new Error(errors.join(' '));
  const forecast=forecastCycle(state,selections,plan),{next,record}=annualClose(state,selections,plan,!options.noUncertainty);
  record.forecast={revenue:forecast.record.revTotal,operatingResult:forecast.record.operatingResult,netIncome:forecast.record.netIncome,cash:forecast.record.cash,debt:forecast.record.debt,wins:forecast.record.wins};
  record.rationale=rationale;
  record.why=[
    'Revenue: '+record.event.desc+' Ticket yield was '+Math.round(record.ticketYield*100)+'% of base, with '+Math.round(record.attendance).toLocaleString('en-US')+' attendees per game. Shared revenue contributed $'+record.revenue.shared.toFixed(1)+'M.',
    'Costs: roster $'+record.expenses.roster.toFixed(1)+'M; operations $'+record.expenses.operations.toFixed(1)+'M; launch expense $'+record.expenses.launch.toFixed(1)+'M; depreciation $'+record.depreciation.toFixed(1)+'M; payroll tax $'+record.payrollTax.toFixed(1)+'M.',
    'Profit to cash: $'+record.netIncome.toFixed(1)+'M simplified net income + $'+record.depreciation.toFixed(1)+'M noncash depreciation − $'+record.capex.toFixed(1)+'M capex − $'+record.principalPaid.toFixed(1)+'M principal. Funding and arrears are shown in the cash bridge.',
    'Debt: $'+record.newDebt.toFixed(1)+'M project borrowing + $'+record.emergencyDebt.toFixed(1)+'M emergency liquidity − $'+record.principalPaid.toFixed(1)+'M principal repayment. Interest of $'+record.interest.toFixed(1)+'M reduced net income, not operating result.',
    'Next season: '+next.activeInvestments.length+' commitments remain; available credit $'+getBorrowingCapacity(next).toFixed(1)+'M; unpaid obligations $'+next.arrears.toFixed(1)+'M. Rival health '+Math.round(next.leagueHealth)+'/100 changes next year’s shared media value.'
  ];
  next.history=[...state.history,record];next.rationales=[...state.rationales,rationale];
  return {next,record,event:record.event,distress:record.newArrears>0||record.emergencyDebt>0};
}
export function finalEvaluation(state){
  if(!state.history.length)return null;
  const h=state.history,cumulativeRevenue=h.reduce((s,r)=>s+r.revTotal,0),cumulativeOperating=h.reduce((s,r)=>s+r.operatingResult,0);
  const cumulativeNet=h.reduce((s,r)=>s+r.netIncome,0),avgWins=h.reduce((s,r)=>s+r.wins,0)/h.length;
  const streams={};h.forEach(r=>Object.entries(r.revenue).forEach(([k,v])=>streams[k]=(streams[k]||0)+v));
  const largest=Object.entries(streams).sort((a,b)=>b[1]-a[1])[0],debt=getDebtSummary(state);
  const biggestMiss=[...h].sort((a,b)=>Math.abs(b.cash-b.forecast.cash)-Math.abs(a.cash-a.forecast.cash))[0];
  const profile=state.arrears>0?'Restructuring required':state.distress?'Growth with a liquidity rescue':avgWins>.57&&state.cash>40?'Competitive builder':state.facility>MARKETS[state.marketId].facility+4?'Asset builder':state.cash>MARKETS[state.marketId].cash+70?'Liquidity steward':'Balanced operator';
  return {profile,mandate:MANDATES[state.mandateId],cumulativeRevenue,cumulativeOperating,cumulativeNet,avgWins,avgMargin:cumulativeOperating/cumulativeRevenue,
    debt:debt.principal,debtService:debt.service,concentration:largest[1]/cumulativeRevenue,largestStream:largest[0],biggestMiss,
    originalOwner:state.ownerShare,credit:getBorrowingCapacity(state),streams};
}
