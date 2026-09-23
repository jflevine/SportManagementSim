import assert from 'node:assert/strict';
import {MARKETS,LEAGUE_RULES,PLAYERS,CAPITAL,COMMERCIAL,DILEMMAS,EVENTS,createState,payment,getOpportunitySet,getBoardDilemma,getDebtSummary,getBorrowingCapacity,estimateProposalImpact,forecastCycle,runCycle,validateDecision,finalEvaluation} from './model.js';

const near=(a,b,msg='numbers reconcile')=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-7,`${msg}: ${a} vs ${b}`);
const rationale={text:'We accept the disclosed downside to pursue our board mandate.',risk:'Demand / fan trust'};
const planFor=s=>({ticketYield:1,boardChoice:getBoardDilemma(s).options.at(-1).id});
let tests=0,closes=0;
function test(name,fn){fn();tests++;console.log('PASS '+name);}
function checkClose(before,result){
 const {next:s,record:r}=result;closes++;
 near(r.revTotal,Object.values(r.revenue).reduce((a,b)=>a+b,0),'revenue');
 near(r.expTotal,Object.values(r.expenses).reduce((a,b)=>a+b,0),'expenses');
 near(r.operatingResult,r.revTotal-r.expTotal,'operating result');
 near(r.netIncome,r.operatingResult-r.interest,'net income');
 near(r.cash,r.beginningCash+r.netIncome+r.depreciation-r.capex+r.newDebt+r.newEquity+r.newPublic-r.principalPaid+r.emergencyDebt+r.newArrears-r.arrearsPaid,'cash bridge');
 near(s.cash+s.bookAssets,getDebtSummary(s).principal+s.arrears+s.bookEquity,'balance sheet');
 near(r.debt,getDebtSummary(before).principal+r.newDebt+r.emergencyDebt-r.principalPaid,'debt rollforward');
 near(s.bookAssets,before.bookAssets+r.capex-r.depreciation,'capital assets');
 near(s.bookEquity,before.bookEquity+r.netIncome+r.newEquity+r.newPublic,'equity');
 assert.ok(s.cash>=0&&s.arrears>=0&&r.debt>=0&&s.ownerShare>0&&s.ownerShare<=1);
 for(const d of s.debtTranches)assert.ok(d.principal>=0&&d.payment>=0&&d.remaining>0);
 for(const r of s.rivals)assert.ok(Number.isFinite(r.cash)&&r.wins>=.25&&r.wins<=.75);
 assert.equal(r.why.length,5);assert.equal(s.history.length,before.history.length+1);
}
function fixture(predicate){
 for(let n=0;n<1000;n++){const s=createState('growth','growth','QA-'+n);if(predicate(s))return s;}
 throw Error('Fixture not found');
}
test('initial balances, modes and source constraints',()=>{
 for(const market of Object.keys(MARKETS)){const s=createState(market);near(s.cash+s.bookAssets,getDebtSummary(s).principal+s.bookEquity);}
 assert.throws(()=>createState('missing'));assert.throws(()=>createState('growth','growth','x','missing'));
 const s=createState(),p=CAPITAL[0];
 for(const f of [{debtPct:-.1},{debtPct:Infinity},{debtPct:NaN},{equityPct:.6},{publicPct:.3},{debtPct:.7,equityPct:.5}])assert.throws(()=>estimateProposalImpact(s,p,f));
 assert.throws(()=>estimateProposalImpact(s,PLAYERS[0],{debtPct:.3}));
 assert.ok(validateDecision(s,[],{ticketYield:-1}).length);
});
test('amortizing debt, zero-interest loan and complete repayment',()=>{
 near(payment(100,0,10),10);
 let balance=100;const annual=payment(100,.06,10);let paid=0;
 for(let n=0;n<10;n++){const principal=annual-balance*.06;balance-=principal;paid+=principal;}
 near(balance,0);near(paid,100);
});
test('ROI, capital stack, DSCR and total equity denominator',()=>{
 const s=createState(),p=CAPITAL[0],i=estimateProposalImpact(s,p,{debtPct:.5,equityPct:.3,publicPct:.1});
 near(i.cashNeed+i.debtAmount+i.equityAmount+i.publicAmount,p.upfront);
 near(i.directROI,(p.annualRevenue*.92-p.annualCost)/p.upfront*100);
 near(i.dscr,i.directNet/i.annualDebtService);
 near(i.equityCashYield,i.afterDebtNet/(i.cashNeed+i.equityAmount)*100);
 assert.equal(estimateProposalImpact(s,p).dscr,null);
});
test('forecast and realized engine agree with uncertainty disabled',()=>{
 let s=createState('growth','growth','MGT340','full');
 for(let n=0;n<5;n++){const sel=getOpportunitySet(s).slice(0,2).map(proposal=>({proposal})),p=planFor(s),snapshot=JSON.stringify(s),f=forecastCycle(s,sel,p),r=runCycle(s,sel,rationale,p,{noUncertainty:true});
  for(const k of ['revTotal','operatingResult','netIncome','cash','debt','wins','bookAssets','bookEquity'])near(f.record[k],r.record[k],k);
  assert.equal(JSON.stringify(s),snapshot,'input state not mutated');checkClose(s,r);s=r.next;}
 assert.throws(()=>runCycle(s));
});
test('common seeds, named proposal draws and selection-order invariance',()=>{
 const s=createState(),sel=getOpportunitySet(s).slice(0,2).map(proposal=>({proposal})),p=planFor(s);
 const a=runCycle(s,sel,rationale,p),b=runCycle(s,[...sel].reverse(),rationale,p),c=runCycle(createState(),sel,rationale,p);
 assert.deepEqual(a,c);
 for(const k of ['cash','debt','revTotal','wins','bookAssets'])near(a.record[k],b.record[k]);
 assert.deepEqual(a.record.realized.map(x=>[x.id,x.actualNet]).sort(),b.record.realized.map(x=>[x.id,x.actualNet]).sort());
});
test('invalid, duplicate and tampered proposals cannot change quoted economics',()=>{
 const s=createState(),p=getOpportunitySet(s)[0],plan=planFor(s);
 assert.ok(validateDecision(s,[{proposal:p},{proposal:p}],plan).length);
 assert.ok(validateDecision(s,[{proposal:{id:'made-up'}}],plan).length);
 const a=runCycle(s,[{proposal:p}],rationale,plan),b=runCycle(s,[{proposal:{...p,upfront:-9999,annualRevenue:1e9}}],rationale,plan);
 near(a.record.cash,b.record.cash);
});
test('all four board dilemmas and all twelve responses reconcile',()=>{
 for(const d of DILEMMAS){const s=fixture(x=>getBoardDilemma(x).id===d.id);
  for(const choice of d.options){const r=runCycle(s,[],rationale,{ticketYield:1,boardChoice:choice.id},{noUncertainty:true});checkClose(s,r);
   if(d.id==='maintenance'&&choice.id==='renew')near(r.next.facility,s.facility+9-1.5);
   if(d.id==='sponsor'&&choice.id==='national'){const base=runCycle(s,[],rationale,{ticketYield:1,boardChoice:'pass'},{noUncertainty:true});near(r.next.fanTrust-base.next.fanTrust,-4);}
  }
 }
});
test('each of fourteen proposals and four financing mixes executes',()=>{
 for(const p of [...PLAYERS,...CAPITAL,...COMMERCIAL]){const s=fixture(x=>getOpportunitySet(x).some(z=>z.id===p.id));
  const mixes=p.debtEligible?[{}, {debtPct:.7},{equityPct:.5},{debtPct:.5,equityPct:.3,publicPct:.2}]:[{}];
  for(const mix of mixes){const r=runCycle(s,[{proposal:p,...mix}],rationale,planFor(s));checkClose(s,r);if(mix.equityPct)assert.ok(r.next.ownerShare<1);}
 }
});
test('public affordability covenant persists and capital limits bind',()=>{
 const s=fixture(x=>getOpportunitySet(x).some(p=>p.type==='capital')),p=getOpportunitySet(s).find(p=>p.type==='capital'),sel=[{proposal:p,publicPct:.2}];
 assert.ok(validateDecision(s,sel,{...planFor(s),ticketYield:1.25}).some(x=>x.includes('105%')));
 const r=runCycle(s,sel,rationale,planFor(s));
 assert.ok(validateDecision(r.next,[],{...planFor(r.next),ticketYield:1.25}).some(x=>x.includes('105%')));
 const poor={...s,cash:0,bookEquity:s.bookEquity-s.cash};assert.ok(validateDecision(poor,[{proposal:p}],planFor(s)).length);
 const noInvestors={...s,equityRaised:65};assert.ok(validateDecision(noInvestors,[{proposal:p,equityPct:.5}],planFor(s)).some(x=>x.includes('$65M')));
});
test('league mechanisms affect different causes and rival budgets are disclosed',()=>{
 const outcomes={};for(const rule of Object.keys(LEAGUE_RULES)){const s=createState('small','survivor','MGT340','class',rule);outcomes[rule]=runCycle(s,[],rationale,planFor(s),{noUncertainty:true}).record;}
 near(outcomes.sharing.revenue.shared-outcomes.statusQuo.revenue.shared,18);
 near(outcomes.sharing.expenses.roster,outcomes.statusQuo.expenses.roster);
 near(outcomes.floor.expenses.roster,245);near(outcomes.floor.wins,outcomes.statusQuo.wins);
 assert.ok(outcomes.draft.wins>outcomes.statusQuo.wins);
 assert.ok(outcomes.cap.rivals.rows.find(r=>r.market==='large').payroll<=280);
 assert.ok(outcomes.tax.rivals.taxPool>0);
 const tax=outcomes.tax;near(tax.rivals.rows.reduce((n,r)=>n+r.taxSupport,0),tax.rivals.taxPool);
 for(const r of outcomes.sharing.rivals.rows)near(r.cashChange,r.resources+r.taxSupport-r.payroll-r.tax);
 assert.ok(new Set(Object.values(outcomes).map(r=>r.leagueHealth.toFixed(6))).size>=4);
});
test('all eight shocks, construction delay, overrun and player injury occur deterministically',()=>{
 const events=new Set();let delay=false,overrun=false,injury=false;
 for(let n=0;n<400;n++){const s=createState('growth','growth','RISK-'+n),sel=getOpportunitySet(s).filter(p=>p.type==='capital'||p.type==='player').slice(0,2).map(proposal=>({proposal,debtPct:proposal.debtEligible?.5:0}));
  const r=runCycle(s,sel,rationale,planFor(s));checkClose(s,r);events.add(r.record.event.id);
  for(const x of r.record.realized){delay||=!!x.delay;overrun||=x.overrun>0;injury||=!!x.injury;
   if(x.overrun>0){const inv=r.next.activeInvestments.find(i=>i.id===x.id);near(inv.assetBasis,sel.find(z=>z.proposal.id===x.id)?.proposal.upfront+x.overrun||inv.assetBasis);}
  }
 }
 assert.equal(events.size,EVENTS.length);assert.ok(delay&&overrun&&injury);
});
test('cash rescue, default, persistent arrears and repayment do not dead-end',()=>{
 let s=createState('small','survivor','STRESS','full','floor');s.bookEquity-=s.cash;s.cash=0;
 // An explicitly constructed boundary fixture puts debt at the disclosed ceiling.
 const extra=getBorrowingCapacity(s);s.debtTranches.push({id:'stress',name:'Boundary fixture',principal:extra,original:extra,rate:.2,remaining:3,payment:payment(extra,.2,3)});s.bookEquity-=extra;
 let everArrears=false;for(let i=0;i<5;i++){const r=runCycle(s,[],rationale,planFor(s));checkClose(s,r);everArrears||=r.next.arrears>0;s=r.next;}assert.ok(everArrears);
 const recovery=createState();recovery.arrears=10;recovery.bookEquity-=10;const r=runCycle(recovery,[],rationale,planFor(recovery));checkClose(recovery,r);near(r.record.arrearsPaid,10);
});

const strategies=['hold','commercial','roster','assets','debt','balanced'];
const results=[];
test('2,160 complete deterministic strategy runs across markets, policies and modes',()=>{
 for(const market of Object.keys(MARKETS))for(const rule of Object.keys(LEAGUE_RULES))for(const mode of ['class','full'])for(let seed=0;seed<10;seed++)for(const strategy of strategies){
  let s=createState(market,'growth','SWEEP-'+seed,mode,rule);
  while(s.cycle<=s.maxCycles){
   const opp=getOpportunitySet(s),d=getBoardDilemma(s);
   const order={commercial:['commercial','capital','player'],roster:['player','commercial','capital'],assets:['capital','commercial','player'],debt:['capital','player','commercial'],balanced:['capital','commercial','player']}[strategy];
   const chosen=strategy==='hold'?[]:[...opp].sort((a,b)=>order.indexOf(a.type)-order.indexOf(b.type)).slice(0,strategy==='balanced'?1:2).map(proposal=>({proposal,debtPct:strategy==='debt'&&proposal.debtEligible?.7:0}));
   const plan={ticketYield:strategy==='commercial'?1.15:strategy==='hold'?1:1.05,boardChoice:d.options[strategy==='hold'?d.options.length-1:strategy==='roster'?0:1].id};
   let sel=chosen;while(sel.length&&validateDecision(s,sel,plan).length)sel=sel.slice(0,-1);
   if(validateDecision(s,sel,plan).length){plan.boardChoice=d.options.at(-1).id;plan.ticketYield=1;sel=[];}
   assert.deepEqual(validateDecision(s,sel,plan),[],'a hold path remains possible');
   const r=runCycle(s,sel,rationale,plan);checkClose(s,r);s=r.next;
  }
  const f=finalEvaluation(s);assert.ok(f&&Number.isFinite(f.concentration));
  results.push({market,rule,mode,seed,strategy,cash:s.cash,net:f.cumulativeNet,wins:f.avgWins,facility:s.facility,fans:s.fanTrust,debt:f.debt,distress:s.distress,profile:f.profile});
 }
 assert.equal(results.length,2160);
});
const averages=Object.fromEntries(strategies.map(strategy=>{const rows=results.filter(x=>x.strategy===strategy);return [strategy,Object.fromEntries(['cash','net','wins','facility','fans','debt','distress'].map(key=>[key,rows.reduce((n,r)=>n+Number(r[key]),0)/rows.length]))];}));
const leaders=Object.fromEntries(['cash','net','wins','facility','fans'].map(key=>[key,strategies.reduce((a,b)=>averages[a][key]>averages[b][key]?a:b)]));
assert.ok(new Set(Object.values(leaders)).size>1,'no single tested strategy leads every mean outcome');
console.log(JSON.stringify({tests,accountingCloses:closes,completedGames:results.length,averages,leaders,limits:'Finite scripted sweep, not a proof that no exploit or dominant strategy exists. No student pilot or real-league calibration.'},null,2));
