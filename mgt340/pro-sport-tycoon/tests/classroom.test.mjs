import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,optionsFor,selectionFor,closeClassroomCycle,financialView,fanReaction,leagueComparison,reportText,VERSION} from '../classroom-model.js';
import {estimateProposalImpact,getDebtSummary} from '../model.js';
const reason='We choose this benefit while accepting the demand risk and preserving a cash reserve.';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function variants(s){return [...optionsFor(s).flatMap(o=>o.proposal.debtEligible?[[o.id,0],[o.id,.5]]:[[o.id,0]]),['hold',0]];}
test('all 45 classroom strategies reconcile accounts and preserve decisions, debt and fan causes',()=>{
 let runs=0;
 function walk(s){if(s.cycle===4){assert.equal(s.history.length,3);runs++;return;}
 for(const [id,debt]of variants(s)){
  const before=JSON.stringify(s),out=closeClassroomCycle(s,id,debt,reason),r=out.record,f=financialView(r);
  assert.equal(JSON.stringify(s),before);assert.equal(r.realized.length,id==='hold'?0:1);
  close(f.revenue,f.local+f.shared);close(f.operatingResult,f.revenue-f.operatingCosts);close(f.profit,f.operatingResult-f.interest);
  close(f.endingCash,f.openingCash+f.profit-f.investment-f.principal);close(f.debt,r.openingDebt+r.newDebt-r.principalPaid);
  close(f.debt,getDebtSummary(out.next).principal);
  const fanSum=r.openingFan+Object.values(r.fanDrivers).reduce((a,b)=>a+b,0);close(r.fan,Math.max(20,Math.min(95,fanSum)));
  assert.equal(r.rationale.text,reason);assert.deepEqual(r.classroomChoice,{id,label:id==='hold'?'Preserve cash':optionsFor(s).find(o=>o.id===id).label,debtPct:debt});
  assert.equal(out.next.history.at(-1),r);walk(out.next);
 }}walk(newGame());assert.equal(runs,45);
});
test('the classroom accepts only one offered option and only eligible funding',()=>{
 const s=newGame();assert.throws(()=>selectionFor(s,'c_premium',0));assert.throws(()=>selectionFor(s,'r_events',.5));assert.throws(()=>selectionFor(s,'hold',.5));
 assert.throws(()=>closeClassroomCycle(s,'hold',0,' '));assert.throws(()=>selectionFor({...s,cycle:4},'hold'));
 const stage2=closeClassroomCycle(s,'hold',0,reason).next;assert.throws(()=>selectionFor(stage2,'c_video',.7));
 assert.throws(()=>selectionFor({...stage2,cash:0},'c_video',0));assert.deepEqual(selectionFor({...stage2,cash:-1},'hold',0),[]);
});
test('venue ROI is financing-independent and project debt remains after the classroom ends',()=>{
 let s=closeClassroomCycle(newGame(),'hold',0,reason).next;
 const p=optionsFor(s)[0].proposal;const a=estimateProposalImpact(s,p,0),b=estimateProposalImpact(s,p,.5);
 close(a.directROI,(p.annualRevenue-p.annualCost)/p.upfront*100);close(a.directROI,b.directROI);
 close(b.cashNeed+b.debtAmount,p.upfront);close(b.annualDebtService,b.debtAmount/10+b.debtAmount*.058);
 s=closeClassroomCycle(s,p.id,.5,reason).next;s=closeClassroomCycle(s,'hold',0,reason).next;
 const loan=s.debtTranches.find(d=>d.id===p.id+'-2');assert.equal(loan.remaining,8);close(loan.principal,b.debtAmount*.8);
});
test('crowd reflects recorded fan confidence and replay/sensitivity never reroll results',()=>{
 const a=closeClassroomCycle(newGame(),'hold',0,reason).record;const b=closeClassroomCycle(newGame(),'r_retention',0,reason).record;
 assert.equal(fanReaction(a).mood,'boo');assert.equal(fanReaction(b).mood,'cheer');
 const snapshot=JSON.stringify(a);assert.deepEqual(fanReaction(a),fanReaction(a));
 const x=leagueComparison(a);close(a.afterInterest-x.profit,a.revenue.shared*.2);close(a.cash-x.cash,a.revenue.shared*.2);assert.equal(JSON.stringify(a),snapshot);
});
test('downloadable report includes both names, pre-outcome reasons, final reflection and financial bridge',()=>{
 let s=newGame();for(let i=0;i<3;i++)s=closeClassroomCycle(s,'hold',0,reason).next;
 const text=reportText({version:VERSION,state:s,profile:{mode:'pair',names:'Student One & Student Two',club:'Explorers'},reflection:'We would defend holding cash because it preserved our flexibility.'});
 assert.match(text,/Student One & Student Two/);assert.match(text,/CYCLE 3/);assert.match(text,/Final reflection: We would defend/);assert.match(text,/principal repaid/);assert.match(text,/does not send it automatically/);
 assert.equal(text.match(/Reason recorded before outcome:/g).length,3);
});
