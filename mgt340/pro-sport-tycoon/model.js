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

const PLAYERS = [
  {id:'p_star',type:'player',name:'Acquire Jalen Cross',subtitle:'27-year-old star scorer',upfront:8,annualCost:38,term:4,risk:.34,wins:.060,brand:5,fan:3,annualRevenue:10,down:-8,base:9,up:28,confidence:'Low',detail:'Elite production and national visibility. Expensive, injury-sensitive, and difficult to exit after Year 2.'},
  {id:'p_rising',type:'player',name:'Sign Andre Vega',subtitle:'23-year-old two-way starter',upfront:4,annualCost:18,term:4,risk:.21,wins:.036,brand:2,fan:1,annualRevenue:4.5,down:2,base:8,up:16,confidence:'Medium',detail:'Lower star effect, stronger contract flexibility, and a more balanced downside profile.'},
  {id:'p_vet',type:'player',name:'Add veteran depth',subtitle:'Two-year rotation package',upfront:2,annualCost:9,term:2,risk:.14,wins:.018,brand:0.5,fan:.5,annualRevenue:1.2,down:1,base:6,up:10,confidence:'High',detail:'Modest upside, reliable availability, and limited long-run commitment.'},
  {id:'p_dev',type:'player',name:'Fund player development lab',subtitle:'Development + analytics staff',upfront:6,annualCost:5,term:4,risk:.18,wins:.015,brand:.5,fan:.5,annualRevenue:1.4,development:.012,down:0,base:7,up:14,confidence:'Medium',detail:'Less immediate than a star signing; compounds through development and availability.'}
];

const CAPITAL = [
  {id:'c_premium',type:'capital',name:'Build a premium club',subtitle:'New hospitality inventory',upfront:42,annualCost:4.1,term:8,risk:.20,wins:0,brand:2,fan:1,facility:6,annualRevenue:9.5,debtEligible:true,down:4,base:13,up:18,confidence:'High',detail:'Contracted hospitality revenue with construction, occupancy, and servicing-cost risk.'},
  {id:'c_training',type:'capital',name:'Build a performance center',subtitle:'Training + recovery infrastructure',upfront:32,annualCost:2.5,term:8,risk:.15,wins:.012,development:.008,brand:1,fan:.5,facility:5,annualRevenue:1.5,debtEligible:true,down:2,base:7,up:12,confidence:'Medium',detail:'Weak direct revenue but potential development, availability, and recruiting benefits.'},
  {id:'c_fantech',type:'capital',name:'Install a fan-tech platform',subtitle:'CRM, mobile, loyalty + concessions',upfront:18,annualCost:1.8,term:6,risk:.28,wins:0,brand:2,fan:3,facility:2,annualRevenue:5.2,debtEligible:true,down:-2,base:14,up:24,confidence:'Low',detail:'Creates data and sponsor inventory; payoff depends on adoption and execution.'},
  {id:'c_video',type:'capital',name:'Replace video + ribbon boards',subtitle:'In-venue experience + sponsor inventory',upfront:24,annualCost:1.2,term:7,risk:.17,wins:0,brand:1.5,fan:2.5,facility:3,annualRevenue:4.2,debtEligible:true,down:3,base:10,up:15,confidence:'High',detail:'Moderate revenue upside with a visible fan-experience benefit and low strategic optionality.'},
  {id:'c_district',type:'capital',name:'Develop an event district',subtitle:'Year-round venue activation',upfront:68,annualCost:7.5,term:10,risk:.36,wins:0,brand:4,fan:1,facility:7,annualRevenue:16,debtEligible:true,down:-5,base:12,up:25,confidence:'Low',detail:'Large, long-horizon bet with non-game revenue upside and significant capital exposure.'}
];

const COMMERCIAL = [
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

export function createState(marketId='growth',mandateId='growth',seed='MGT340',mode='class'){
  const m=MARKETS[marketId];
  return {
    marketId, mandateId, seed, mode, cycle:1, maxCycles:mode==='full'?5:3,
    cash:m.cash, brand:m.brand, fanTrust:m.fanTrust, facility:m.facility,
    franchiseValue:m.value, rosterQuality:m.rosterQuality, developmentBonus:0,
    activeInvestments:[], debtTranches:[{id:'legacy',name:'Existing franchise debt',principal:m.startingDebt,rate:.048,remaining:12,original:m.startingDebt}],
    history:[], rationales:[], distress:false
  };
}

export function getDebtSummary(state){
  let principal=0,interest=0,principalDue=0;
  for(const d of state.debtTranches){
    principal+=d.principal;
    interest+=d.principal*d.rate;
    principalDue+=d.remaining>0?Math.min(d.principal,d.original/Math.max(1,d.remaining)):0;
  }
  return {principal:round(principal),interest:round(interest),principalDue:round(principalDue),service:round(interest+principalDue)};
}

export function getActiveEffects(state){
  const e={annualRevenue:0,annualCost:0,wins:0,brand:0,fan:0,facility:0,development:state.developmentBonus,streams:{}};
  for(const inv of state.activeInvestments){
    if(inv.remaining<=0)continue;
    if(inv.stream)e.streams[inv.stream]=(e.streams[inv.stream]||0)+(inv.annualRevenue||0);
    else e.annualRevenue+=inv.annualRevenue||0;
    if(inv.type!=='player')e.annualCost+=inv.annualCost||0;
    e.wins+=inv.wins||0;
    e.brand+=inv.brand||0;
    e.fan+=inv.fan||0;
    e.facility+=inv.facility||0;
    e.development+=inv.development||0;
  }
  return e;
}

export function getOpportunitySet(state){
  const r=rngFor(state.seed,state.cycle,'opps');
  const used=new Set(state.activeInvestments.map(x=>x.id));
  const players=shuffle(PLAYERS.filter(x=>!used.has(x.id)),r).slice(0,2);
  const capitals=shuffle(CAPITAL.filter(x=>!used.has(x.id)),r).slice(0,2);
  const commercials=shuffle(COMMERCIAL.filter(x=>!used.has(x.id)),r).slice(0,2);
  let pool=[];
  if(state.cycle===1) pool=[...commercials.slice(0,2),...capitals.slice(0,1),...players.slice(0,1)];
  else if(state.cycle===2) pool=[...players.slice(0,2),...capitals.slice(0,1),...commercials.slice(0,1)];
  else pool=shuffle([...players,...capitals,...commercials],r).slice(0,4);
  return pool.map(x=>({...x}));
}

export function estimateProposalImpact(state,proposal,debtPct=0){
  const debtAllowed=proposal.debtEligible?clamp(debtPct,0,.7):0;
  const debtAmount=proposal.upfront*debtAllowed;
  const cashNeed=proposal.upfront-debtAmount;
  const rate=.058;
  const term=proposal.type==='capital'?10:6;
  const annualDebtService=debtAmount?debtAmount*(rate/(1-Math.pow(1+rate,-term))):0;
  const baseNet=(proposal.annualRevenue||0)-(proposal.annualCost||0)-annualDebtService;
  const simpleROI=proposal.upfront?baseNet/proposal.upfront*100:0;
  return {debtPct:debtAllowed,debtAmount:round(debtAmount),cashNeed:round(cashNeed),annualDebtService:round(annualDebtService),baseNet:round(baseNet),simpleROI:round(simpleROI),term};
}

export function advisorViews(state,p){
  const impact=estimateProposalImpact(state,p,p.debtEligible?.5:0);
  const cfo = impact.cashNeed>state.cash*.45 ? 'Caution: this consumes a large share of available cash.' : (impact.simpleROI>8?'Support: the base-case economics are workable.':'Conditional: the strategic case may be stronger than the direct cash return.');
  const gm = p.type==='player' ? (p.wins>=.05?'Strong support: this materially changes the competitive ceiling.':'Support if the roster need matches the role; the performance gain is useful but not transformational.') : (p.wins>0?'Support: there is a competitive benefit beyond direct revenue.':'Neutral: this does not directly solve a roster problem.');
  const cro = (p.annualRevenue||0)>=7 ? 'Support: the proposal creates meaningful monetizable inventory or demand.' : (p.stream?'Support with targets: define the conversion or renewal metric before funding.':'Neutral: direct commercial upside is limited.');
  const cmo = p.brand>=2 || p.fan>=2 ? 'Support: the brand/fan effect is strategically useful if execution is strong.' : 'Neutral: this is not primarily a brand investment.';
  const coo = p.type==='capital' ? (p.risk>.28?'Caution: construction and lifecycle assumptions need stress testing.':'Support: manageable project risk if the operating plan is funded.') : 'Neutral: limited facilities exposure.';
  const analytics = `Base return ${p.base}% | downside ${p.down}% | upside ${p.up}% | confidence ${p.confidence}. The key issue is whether the downside fits the mandate.`;
  const fan = p.fan>=2 ? 'Support: this should improve the fan relationship if pricing remains credible.' : (p.type==='player'&&p.brand>=4?'Support: star value can increase engagement, but only if the team performs.':'Neutral: limited direct fan benefit.');
  return {CFO:cfo,'General Manager':gm,'Chief Revenue Officer':cro,'Chief Marketing Officer':cmo,'COO / Facilities':coo,'Analytics Director':analytics,'Fan Insights Director':fan};
}

function proposalRealization(state,p,index){
  const r=rngFor(state.seed,state.cycle,`proposal-${p.id}-${index}`);
  const shock=(r()-.5)*2;
  const spread=Math.max(3,(p.up-p.down)/2);
  const realizedPct=p.base+shock*spread*p.risk*1.45;
  return clamp(realizedPct,p.down,p.up);
}

function applyProposalToState(state,p,debtPct,index){
  const impact=estimateProposalImpact(state,p,debtPct);
  const realizedReturn=proposalRealization(state,p,index);
  const ratio=p.base===0?1:realizedReturn/p.base;
  const realizedRevenue=Math.max(0,(p.annualRevenue||0)*clamp(ratio,.35,1.8));
  const inv={...p,annualRevenue:realizedRevenue,remaining:p.term,forecastReturn:p.base,realizedReturn,debtPct:impact.debtPct};
  const debts=[...state.debtTranches];
  if(impact.debtAmount>0){debts.push({id:`${p.id}-${state.cycle}`,name:p.name,principal:impact.debtAmount,rate:.058,remaining:impact.term,original:impact.debtAmount});}
  return {investment:inv,cashNeed:impact.cashNeed,debtTranches:debts,impact,realizedReturn};
}

export function forecastCycle(state,selections=[]){
  const m=MARKETS[state.marketId];
  const active=getActiveEffects(state);
  let upfrontCash=0,newDebt=0,annualNewCost=0,annualNewRevenue=0,winsAdd=0;
  for(const s of selections){
    const impact=estimateProposalImpact(state,s.proposal,s.debtPct||0);
    upfrontCash+=impact.cashNeed;newDebt+=impact.debtAmount;
    annualNewCost+=s.proposal.annualCost||0;annualNewRevenue+=s.proposal.annualRevenue||0;winsAdd+=s.proposal.wins||0;
  }
  const debt=getDebtSummary(state);
  const expectedWin=clamp(state.rosterQuality+active.wins+winsAdd+active.development*.5,.30,.75);
  const price=m.baseTicket;
  const demand=.86+expectedWin*.25+state.fanTrust/550+state.brand/950;
  const attendance=clamp(m.baseAttendance*demand,m.capacity*.48,m.capacity*.99);
  const tickets=attendance*9*price/1e6+(active.streams.tickets||0);
  const premium=m.premiumBase*m.localFactor*(.82+state.facility/120+expectedWin*.18)+(active.streams.premium||0);
  const sponsor=m.sponsorBase*(.82+state.brand/250+expectedWin*.12)+(active.streams.sponsor||0);
  const merch=m.merchandiseBase*m.localFactor*(.76+state.brand/210+expectedWin*.22);
  const digital=10*m.localFactor*(.8+state.brand/250)+(active.streams.digital||0);
  const other=14*m.localFactor+Math.max(0,state.facility-55)*.20+(active.streams.other||0);
  const shared=m.sharedRevenue;
  const revenue=shared+tickets+premium+sponsor+merch+digital+other+active.annualRevenue+annualNewRevenue;
  const rosterBase=(state.marketId==='small'?196:state.marketId==='large'?236:216);
  const activePlayerCost=state.activeInvestments.filter(x=>x.type==='player'&&x.remaining>0).reduce((a,b)=>a+(b.annualCost||0),0);
  const expenses=m.operatingBase+rosterBase+activePlayerCost+active.annualCost+annualNewCost+debt.interest;
  return {expectedWin,attendance,revenue,expenses,profit:revenue-expenses,upfrontCash,newDebt,projectedEndingCash:state.cash+(revenue-expenses)-upfrontCash-debt.principalDue,existingDebt:debt.principal};
}

export function runCycle(state,selections,rationale){
  let working={...state,activeInvestments:[...state.activeInvestments],debtTranches:[...state.debtTranches]};
  const realized=[];
  let upfrontCash=0;
  selections.forEach((s,i)=>{
    const a=applyProposalToState(working,s.proposal,s.debtPct||0,i);
    working.debtTranches=a.debtTranches;
    working.activeInvestments.push(a.investment);
    upfrontCash+=a.cashNeed;
    realized.push({id:s.proposal.id,name:s.proposal.name,forecast:s.proposal.base,actual:round(a.realizedReturn),cashNeed:a.cashNeed,debt:a.impact.debtAmount});
  });
  const active=getActiveEffects(working);
  const m=MARKETS[working.marketId];
  const r=rngFor(working.seed,working.cycle,'cycle');
  const event=EVENTS[Math.floor(r()*EVENTS.length)];
  const mods=event.mods||{};
  const debtBefore=getDebtSummary(working);
  let expectedWin=clamp(working.rosterQuality+active.wins+active.development*.5,.30,.78);
  const wins=clamp(expectedWin+(r()-.5)*.055+(mods.wins||0),.22,.82);
  const demand=.86+wins*.26+working.fanTrust/540+working.brand/950;
  const attendance=clamp(m.baseAttendance*demand*(mods.tickets||1),m.capacity*.44,m.capacity*.995);
  let revenue={
    shared:m.sharedRevenue+(mods.shared||0),
    tickets:attendance*9*m.baseTicket/1e6+(active.streams.tickets||0),
    premium:m.premiumBase*m.localFactor*(.82+working.facility/120+wins*.19)+(active.streams.premium||0),
    sponsor:m.sponsorBase*(.82+working.brand/250+wins*.13)+(active.streams.sponsor||0),
    merchandise:m.merchandiseBase*m.localFactor*(.76+working.brand/210+wins*.25),
    digital:10*m.localFactor*(.8+working.brand/250)+(active.streams.digital||0),
    other:14*m.localFactor+Math.max(0,working.facility-55)*.20+(active.streams.other||0),
    investment:active.annualRevenue
  };
  ['premium','sponsor','digital','other'].forEach(k=>{if(mods[k])revenue[k]*=mods[k]});
  if(mods.merch)revenue.merchandise*=mods.merch;
  const rosterBase=(working.marketId==='small'?196:working.marketId==='large'?236:216);
  const playerCost=working.activeInvestments.filter(x=>x.type==='player'&&x.remaining>0).reduce((a,b)=>a+(b.annualCost||0),0);
  let operating=m.operatingBase+active.annualCost;
  if(mods.opex)operating*=mods.opex;
  const expenses={roster:rosterBase+playerCost,operations:operating,interest:debtBefore.interest};
  const revTotal=Object.values(revenue).reduce((a,b)=>a+b,0);
  const expTotal=Object.values(expenses).reduce((a,b)=>a+b,0);
  const profit=revTotal-expTotal;
  const principalPaid=debtBefore.principalDue;
  const cashChange=profit-upfrontCash-principalPaid;
  const cash=working.cash+cashChange;
  const newDebts=working.debtTranches.map(d=>({
    ...d,
    principal:Math.max(0,d.principal-Math.min(d.principal,d.original/Math.max(1,d.remaining))),
    remaining:Math.max(0,d.remaining-1)
  })).filter(d=>d.principal>.05&&d.remaining>0);
  const debtAfter=newDebts.reduce((a,b)=>a+b.principal,0);
  const fan=clamp(working.fanTrust+(wins-.5)*10+active.fan*.55+(mods.fan||0)-.5,20,95);
  const brand=clamp(working.brand+(wins-.5)*9+active.brand*.45+(mods.brand||0),20,95);
  const facility=clamp(working.facility+active.facility*.28-.6,20,100);
  const rosterQuality=clamp(working.rosterQuality+(wins-expectedWin)*.05+active.development*.10,.32,.70);
  const margin=profit/revTotal;
  const valueGrowth=clamp(.015+(wins-.5)*.055+(brand-working.brand)/250+(facility-working.facility)/330+margin*.07,-.07,.13);
  const franchiseValue=Math.max(2,working.franchiseValue*(1+valueGrowth));
  const distress=cash<-25||debtAfter>560||(margin<-.10&&working.cycle>=2);
  const agedInvestments=working.activeInvestments.map(x=>({...x,remaining:Math.max(0,x.remaining-1)})).filter(x=>x.remaining>0);
  const record={cycle:working.cycle,event,wins,attendance,revenue,expenses,revTotal,expTotal,profit,cash,cashChange,debt:debtAfter,principalPaid,fan,brand,facility,franchiseValue,realized,rationale,upfrontCash};
  const next={...working,cycle:working.cycle+1,cash,fanTrust:fan,brand,facility,rosterQuality,franchiseValue,activeInvestments:agedInvestments,debtTranches:newDebts,history:[...working.history,record],rationales:[...working.rationales,rationale],distress:working.distress||distress};
  return {next,record,event,distress};
}

export function finalEvaluation(state){
  const h=state.history;
  if(!h.length)return null;
  const m=MARKETS[state.marketId],mandate=MANDATES[state.mandateId];
  const avgMargin=h.reduce((a,b)=>a+b.profit/b.revTotal,0)/h.length;
  const avgWins=h.reduce((a,b)=>a+b.wins,0)/h.length;
  const debt=getDebtSummary(state).principal;
  const financial=clamp(52+avgMargin*120+(state.cash/180)*22-(state.distress?28:0),0,100);
  const fan=clamp((state.fanTrust+state.brand)/2,0,100);
  const competitive=clamp(25+avgWins*95,0,100);
  const asset=clamp(42+(state.franchiseValue-m.value)*16+(state.facility-m.facility)*.45,0,100);
  const flexibility=clamp(75+(state.cash-m.cash)*.14-(debt-(m.startingDebt||0))*.08-(state.activeInvestments.length>7?8:0),0,100);
  const s={financial,fan,competitive,asset,flexibility};
  let total=0;for(const [k,w] of Object.entries(mandate.weights))total+=s[k]*w;
  if(state.distress)total=Math.min(total,58);
  return {total:round(total,0),...Object.fromEntries(Object.entries(s).map(([k,v])=>[k,round(v,0)])),avgMargin,avgWins,mandate};
}