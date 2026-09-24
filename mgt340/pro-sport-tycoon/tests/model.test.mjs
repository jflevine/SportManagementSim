import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,getOpportunitySet,runCycle,forecastCycle,estimateProposalImpact,getDebtSummary,finalEvaluation} from '../model.js';
import {replayFrames,leagueSensitivity} from '../replay-model.js';
const rationale={text:'We choose the asset for durable revenue, reject the roster upgrade and accept demand risk.',risk:'Demand risk',portfolio:['Test']};
const close=(a,b,tolerance=.12)=>assert.ok(Math.abs(a-b)<tolerance,`${a} should equal ${b}`);
function proposal(type){for(let i=0;i<20;i++){const s=createState('growth','growth','case'+i);const p=getOpportunitySet(s).find(p=>p.type===type);if(p)return p;}throw Error('Missing type');}
test('financing preserves project ROI and matches equal-principal year-one service',()=>{
 const s=createState(),p=proposal('capital');const cash=estimateProposalImpact(s,p,0),debt=estimateProposalImpact(s,p,.7);
 assert.equal(cash.directROI,debt.directROI);close(debt.annualDebtService,debt.debtAmount/10+debt.debtAmount*.058);
 close(cash.cashNeed-debt.cashNeed,debt.debtAmount);close(cash.afterDebtNet-debt.afterDebtNet,debt.annualDebtService);
 const out=runCycle(s,[{proposal:p,debtPct:.7}],rationale).record;
 close(out.debt,s.debtTranches[0].principal+debt.debtAmount-out.principalPaid);
});
test('replay and league comparison read saved results without mutation or rerolls',()=>{
 const s=createState(),out=runCycle(s,[{proposal:proposal('capital'),debtPct:.5}],rationale);const before=JSON.stringify(out);
 const a=replayFrames(out.record),b=replayFrames(out.record);assert.deepEqual(a,b);assert.equal(a.length,5);
 const sensitivity=leagueSensitivity(out.record,.2);close(out.record.profit-sensitivity.profit,out.record.revenue.shared*.2);close(out.record.cash-sensitivity.cash,out.record.revenue.shared*.2);
 assert.equal(JSON.stringify(out),before);
 assert.throws(()=>leagueSensitivity(out.record,1.1));
});
test('changing portfolio order does not change a proposal realization or total result',()=>{
 const s=createState(),a={proposal:proposal('capital'),debtPct:.5},b={proposal:proposal('commercial'),debtPct:0};
 const x=runCycle(s,[a,b],rationale),y=runCycle(s,[b,a],rationale);
 close(x.record.cash,y.record.cash,.001);assert.equal(x.event.id,y.event.id);
 for(const p of x.record.realized)assert.equal(p.actualNet,y.record.realized.find(q=>q.id===p.id).actualNet);
});
test('three and five cycles reconcile revenue, operating profit, interest, cash and debt',()=>{
 for(const market of ['small','growth','large'])for(const mode of ['class','full'])for(let seed=0;seed<12;seed++){
 let s=createState(market,'growth','test'+seed,mode);
 for(let i=0;i<s.maxCycles;i++){
  const opps=getOpportunitySet(s);const selected=seed%3===0?[]:opps.slice(0,seed%2+1).map(p=>({proposal:p,debtPct:p.debtEligible?.7:0}));
  const before=JSON.stringify(s),f=forecastCycle(s,selected),out=runCycle(s,selected,rationale),r=out.record;
  assert.equal(JSON.stringify(s),before,'runCycle must not mutate opening state');
  close(r.revTotal,Object.values(r.revenue).reduce((a,b)=>a+b,0),.00001);
  close(r.profit,r.revTotal-r.expenses.roster-r.expenses.operations,.00001);
  close(r.cash,r.openingCash+r.profit-r.expenses.interest-r.upfrontCash-r.principalPaid,.00001);
  close(r.debt,r.openingDebt+r.newDebt-r.principalPaid,.15);
  close(f.projectedEndingCash,s.cash+f.profit-f.interest-f.upfrontCash-getDebtSummary(s).principalDue-f.newPrincipalDue,.00001);
  assert.ok(Number.isFinite(r.cash));assert.equal(replayFrames(r).length,4+selected.length);
  s=out.next;
 }
 assert.equal(s.history.length,mode==='class'?3:5);assert.ok(finalEvaluation(s).total>=0&&finalEvaluation(s).total<=100);
 }
});
test('shared distributions match across markets for the same seeded event',()=>{
 const records=['small','growth','large'].map(m=>runCycle(createState(m,'growth','MGT340'),[],rationale).record);
 assert.ok(records.every(r=>r.revenue.shared===records[0].revenue.shared));
 assert.ok(leagueSensitivity(records[0]).share>leagueSensitivity(records[2]).share);
});
test('commitment term ages while debt persists and hold-cash recap explains obligations',()=>{
 let s=createState('growth','growth','MGT340','full');const p=proposal('capital');s=runCycle(s,[{proposal:p,debtPct:.7}],rationale).next;
 const out=runCycle(s,[],rationale);assert.equal(out.next.activeInvestments[0].remaining,p.term-2);assert.ok(out.record.expenses.interest>0);assert.ok(out.record.principalPaid>0);
 assert.match(replayFrames(out.record)[0].text,/held cash/);assert.ok(out.record.commitments.some(x=>x.id===p.id));
});

test('proposal direct result includes applicable operating-cost inflation',()=>{
 const p=proposal('commercial');let record;
 for(let i=0;i<100;i++){const r=runCycle(createState('growth','growth','inflation'+i),[{proposal:p,debtPct:0}],rationale).record;if(r.event.id==='inflation'){record=r;break;}}
 assert.ok(record);const x=record.realized[0];close(x.actualCost,p.annualCost*1.055,.00001);close(x.actualNet,x.realizedRevenue-x.actualCost,.051);
});
