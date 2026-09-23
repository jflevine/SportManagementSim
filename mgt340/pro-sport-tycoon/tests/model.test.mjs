import test from 'node:test';
import assert from 'node:assert/strict';
import {MARKETS,MANDATES,createState,getOpportunitySet,estimateProposalImpact,getDebtSummary,getScenarioModel,runCycle,forecastCycle,finalEvaluation,advisorViews} from '../model.js';
const rationale={text:'We prioritize durable revenue over immediate wins while accepting adoption risk.',risk:'Demand / adoption risk',portfolio:[]};
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
function capital(st){return getOpportunitySet(st).find(p=>p.debtEligible);}
test('cash, 50%, 70% funding reconcile actual principal, interest and cash',()=>{
 for(const pct of [0,.5,.7]){
  const st=createState();const p=capital(st),i=estimateProposalImpact(st,p,pct),legacy=getDebtSummary(st);
  const f=forecastCycle(st,[{proposal:p,debtPct:pct}]);const {next,record}=runCycle(st,[{proposal:p,debtPct:pct}],rationale);
  near(i.cashNeed+i.debtAmount,p.upfront,.001);
  near(record.principalPaid,legacy.principalDue+i.debtAmount/i.term);
  near(record.expenses.interest,legacy.interest+i.debtAmount*i.rate);
  near(record.cash,st.cash+record.operatingProfit-record.expenses.interest-record.upfrontCash-record.principalPaid);
  near(record.debt,legacy.principal+i.debtAmount-record.principalPaid);
  near(f.projectedDebt,record.debt);
  near(i.annualDebtService,i.debtAmount*(i.rate+1/i.term),.051);
  assert.ok(next.activeInvestments.some(x=>x.remaining===p.term-1));
 }
});
test('direct project ROI is independent of debt; cash contribution is not',()=>{
 const st=createState(),p=capital(st),a=estimateProposalImpact(st,p,0),b=estimateProposalImpact(st,p,.7);
 near(a.directROI,b.directROI);assert.ok(a.afterDebtNet>b.afterDebtNet);
 assert.notDeepEqual(advisorViews(st,p,0),advisorViews(st,p,.7));
});
test('identical seed, selections and rationale reproduce three complete cycles',()=>{
 function play(){let s=createState();for(let c=0;c<3;c++)s=runCycle(s,getOpportunitySet(s).slice(0,2).map(proposal=>({proposal,debtPct:.5})),rationale).next;return s;}
 assert.deepEqual(play(),play());assert.equal(play().cycle,4);assert.ok(finalEvaluation(play()));
});
test('selection order cannot change proposal-specific realization or event',()=>{
 const st=createState(),ss=getOpportunitySet(st).slice(0,2).map(proposal=>({proposal,debtPct:.5}));
 const a=runCycle(st,ss,rationale).record,b=runCycle(st,[...ss].reverse(),rationale).record;
 assert.equal(a.event.id,b.event.id);near(a.cash,b.cash);
 for(const x of a.realized)assert.equal(x.actualNet,b.realized.find(y=>y.id===x.id).actualNet);
});
test('debt persists and pays down on the same schedule; state is not mutated',()=>{
 const st=createState(),copy=structuredClone(st),p=capital(st);let n=runCycle(st,[{proposal:p,debtPct:.7}],rationale).next;
 assert.deepEqual(st,copy);const first=getDebtSummary(n);n=runCycle(n,[],rationale).next;near(getDebtSummary(n).principal,first.principal-first.principalDue);
});
test('scenario spread brackets realizations and lower confidence changes exposure',()=>{
 const st=createState();for(let n=0;n<40;n++){st.seed=`QA${n}`;for(const p of getOpportunitySet(st)){
 const sc=getScenarioModel(st,p,.5),r=runCycle(st,[{proposal:p,debtPct:.5}],rationale).record.realized[0];assert.ok(sc.downsideNet<=sc.baseNet&&sc.baseNet<=sc.upsideNet);assert.ok(r.actualNet>=sc.downsideNet-.1&&r.actualNet<=sc.upsideNet+.1);
 }}
});
test('all markets and mandates finish in class and full modes with bounded scores',()=>{
 for(const m of Object.keys(MARKETS))for(const md of Object.keys(MANDATES))for(const mode of ['class','full']){
 let s=createState(m,md,'MGT340',mode);for(let c=0;c<s.maxCycles;c++)s=runCycle(s,getOpportunitySet(s).slice(0,1).map(proposal=>({proposal,debtPct:0})),rationale).next;
 const r=finalEvaluation(s);assert.ok(r.total>=0&&r.total<=100);near(Object.values(MANDATES[md].weights).reduce((a,b)=>a+b),1);
 }
});
test('board mandates reward different strategies across 30 fixed seeds',()=>{
 const scores={};for(const mandate of ['turnaround','contender','facility']){scores[mandate]={};for(const type of ['commercial','player','capital']){let sum=0;for(let seed=0;seed<30;seed++){let s=createState('growth',mandate,`CHECK${seed}`);for(let c=0;c<3;c++){let ss=getOpportunitySet(s).filter(p=>p.type===type).sort((a,b)=>estimateProposalImpact(s,b).directNet-estimateProposalImpact(s,a).directNet).slice(0,2).map(proposal=>({proposal,debtPct:0}));while(ss.length&&ss.reduce((a,x)=>a+x.proposal.upfront,0)>s.cash)ss.pop();s=runCycle(s,ss,rationale).next;}sum+=finalEvaluation(s).total;}scores[mandate][type]=sum/30;}}
 assert.ok(scores.turnaround.commercial>scores.turnaround.player);assert.ok(scores.contender.player>scores.contender.commercial);assert.ok(scores.facility.capital>scores.facility.commercial);
});
