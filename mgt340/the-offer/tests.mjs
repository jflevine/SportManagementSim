import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const model=html.match(/<script id="offer-model">([\s\S]*?)<\/script>/)?.[1];
assert.ok(model,'embedded model script found');
const ctx={};vm.createContext(ctx);vm.runInContext(model,ctx);
const E=ctx.TheOfferModel;
assert.ok(E,'TheOfferModel exported');

let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
const S=['S1','S2','S3'],T=['a','b','c'];
const MULT={a:1,b:.85,c:.7},T2ADJ={a:.5,b:0,c:-.3},T3ADJ={a:0,b:0,c:-.5},BASE={S1:6,S2:4,S3:.8};
const close=(a,b)=>Math.abs(a-b)<1e-9;
function all(){const out=[];for(const s of S)for(const t1 of T)for(const t2 of T)for(const t3 of T)for(const buyback of [false,true])out.push({s,t1,t2,t3,buyback});return out;}
function noNaN(x,path='o'){
  if(typeof x==='number')assert.ok(Number.isFinite(x),path+' is finite');
  else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))noNaN(v,path+'.'+k);
  else if(typeof x==='string')assert.ok(!/NaN|undefined/.test(x),path+' text has no NaN/undefined');
}

test('Capped fee is 310 x 1.03^5 rounded = $359',()=>{assert.equal(E.CAP_FEE,359);assert.equal(Math.round(310*1.03**5),359);});

test('Capital math matches base x T1 + T2 + T3 for all 81 term sheets; S3 is always $0.8M',()=>{
  let n=0;
  for(const s of S)for(const t1 of T)for(const t2 of T)for(const t3 of T){
    const c=E.capital(s,t1,t2,t3);
    const want=s==='S3'?.8:BASE[s]*MULT[t1]+T2ADJ[t2]+T3ADJ[t3];
    assert.ok(close(c.total,Math.round(want*100)/100),`${s}${t1}${t2}${t3}: ${c.total} vs ${want}`);
    if(s!=='S3')assert.ok(close(c.base+c.fees+c.data+c.gov,c.total),'ledger lines sum to total');
    n++;
  }
  assert.equal(n,81);
});

test('Capital ranges: S1 $3.4M–$6.5M, S2 $2.0M–$4.5M',()=>{
  const r=s=>{const v=[];for(const a of T)for(const b of T)for(const c of T)v.push(E.capital(s,a,b,c).total);return [Math.min(...v),Math.max(...v)];};
  assert.deepEqual(r('S1'),[3.4,6.5]);assert.deepEqual(r('S2'),[2,4.5]);
});

test('Facility thresholds: S1 dome at >= $4.5M else bubble; S2 full hours at >= $3.0M else reduced',()=>{
  for(const o of all().map(E.outcome)){
    const c=o.capital.total;
    if(o.structure==='S1'){assert.equal(o.facility.full,c>=4.5);assert.equal(o.players.year5,c>=4.5?1400:1200);}
    if(o.structure==='S2'){assert.equal(o.facility.full,c>=3.0);assert.equal(o.players.year5,c>=3.0?1250:1100);}
  }
  assert.equal(E.outcome({s:'S1',t1:'b',t2:'c',t3:'c'}).facility.full,false); // 4.3
  assert.equal(E.outcome({s:'S1',t1:'b',t2:'b',t3:'c'}).facility.full,true);  // 4.6
  assert.equal(E.outcome({s:'S2',t1:'b',t2:'c',t3:'b'}).facility.full,true);  // 3.1
  assert.equal(E.outcome({s:'S2',t1:'c',t2:'b',t3:'a'}).facility.full,false); // 2.8
});

test('All 3x3x3x3 combinations (x buy-back choice): fees, players, shares within stated values; no NaN',()=>{
  const FEES=new Set([640,430,340,359,800,538]),PLAYERS=new Set([1400,1200,1250,1100,950]);
  let n=0;
  for(const sel of all()){
    const o=E.outcome(sel);noNaN(o);
    assert.ok(FEES.has(o.fee.year5),'fee '+o.fee.year5);
    assert.ok(PLAYERS.has(o.players.year5),'players '+o.players.year5);
    assert.ok(o.lowIncome.year5>=5&&o.lowIncome.year5<=22,'share '+o.lowIncome.year5);
    if(sel.s!=='S3'){
      const capped=sel.t1!=='a',base={S1:640,S2:430}[sel.s],share={S1:9,S2:15}[sel.s];
      assert.equal(o.fee.capped,capped);
      assert.equal(o.fee.year5,capped?359:Math.round(base*1.25));
      const planned=sel.t1==='a'?share:sel.t1==='b'?share+6:Math.max(22,share);
      assert.equal(o.lowIncome.planned,planned);
      assert.equal(o.lowIncome.year5,capped?planned:planned-4);
      if(sel.t1==='c')assert.ok(o.lowIncome.year5>=22);
      assert.equal(o.shock.kind,'resale');assert.equal(o.shock.capExpires,capped);
    }
    n++;
  }
  assert.equal(n,162);
});

test('Reference outcomes from the brief',()=>{
  const o=(s,t1='a',t2='b',t3='a',bb=false)=>E.outcome({s,t1,t2,t3,buyback:bb});
  assert.equal(o('S1').fee.planned,640);assert.equal(o('S2').fee.planned,430);assert.equal(o('S3').fee.year5,340);
  assert.equal(o('S1').lowIncome.planned,9);assert.equal(o('S2').lowIncome.planned,15);assert.equal(o('S3').lowIncome.year5,21);
  assert.equal(o('S1','b').lowIncome.year5,15);assert.equal(o('S2','b').lowIncome.year5,21);
  assert.equal(o('S1','c').lowIncome.year5,22);assert.equal(o('S2','c').lowIncome.year5,22);
  assert.equal(o('S1').lowIncome.year5,5);assert.equal(o('S2').lowIncome.year5,11);
  assert.equal(o('S1').fee.year5,800);assert.equal(o('S2').fee.year5,538);
  assert.equal(o('S3').players.year5,950);assert.equal(o('S3').players.shockSeason,880);
});

test('S3 ignores every term: identical results across all 27 term sheets',()=>{
  const ref=JSON.stringify(E.outcome({s:'S3'}));
  for(const t1 of T)for(const t2 of T)for(const t3 of T)for(const buyback of [true,false])
    assert.equal(JSON.stringify(E.outcome({s:'S3',t1,t2,t3,buyback})),ref);
  const o=E.outcome({s:'S3'});
  assert.equal(o.termsApply,false);assert.equal(o.capital.total,.8);assert.equal(o.accountability.level,'High');assert.equal(o.shock.kind,'city');assert.equal(o.buyback.available,false);
});

test('Accountability levels follow the brief',()=>{
  const lv=(s,t3)=>E.outcome({s,t1:'b',t2:'b',t3}).accountability.level;
  assert.equal(lv('S1','a'),'Low');assert.equal(lv('S1','b'),'Low–Medium');assert.equal(lv('S1','c'),'Medium');
  assert.equal(lv('S2','a'),'Medium');assert.equal(lv('S2','b'),'Medium');assert.equal(lv('S2','c'),'High');
});

test('Buy-back is available only with T3c plus a fee cap; T3c without a cap is flagged as unusable',()=>{
  for(const sel of all()){
    const o=E.outcome(sel);
    const avail=sel.s!=='S3'&&sel.t3==='c'&&sel.t1!=='a';
    assert.equal(o.shock.canBuyBack,avail);assert.equal(o.buyback.available,avail);
    assert.equal(o.buyback.triggered,avail&&sel.buyback===true);
    assert.equal(o.shock.orphanBuyBack,sel.s!=='S3'&&sel.t3==='c'&&sel.t1==='a');
    if(avail)assert.match(o.shock.buybackNote,/borrow|debt/);
    if(sel.s!=='S3'&&sel.t1!=='a')assert.ok(o.shock.effects.some(e=>/expires after Year 5/.test(e.text)));
  }
});

test('Media text follows T2; T2a carries the illustrative paywall wording',()=>{
  assert.match(E.outcome({s:'S1',t1:'a',t2:'a',t3:'a'}).media.text,/\$14\.99 per game.*no full-game posting/);
  assert.match(E.outcome({s:'S2',t1:'a',t2:'b',t3:'a'}).media.text,/families may record/);
  assert.match(E.outcome({s:'S2',t1:'a',t2:'c',t3:'a'}).media.text,/Club controls/);
});

test('Compare returns all three structures with the same terms and S3 unchanged',()=>{
  const c=E.compare({s:'S2',t1:'c',t2:'a',t3:'c'});
  assert.deepEqual(Array.from(c,o=>o.structure),['S1','S2','S3']);
  assert.equal(c[0].lowIncome.year5,22);assert.equal(c[1].accountability.level,'High');assert.equal(c[2].fee.year5,340);
  const d=E.compare({s:'S3',t1:'c',t2:'c',t3:'c'});assert.equal(d[0].fee.year5,800);
});

test('Incomplete and invalid sheets are rejected; outputs are frozen and deterministic',()=>{
  assert.equal(E.isComplete({}),false);assert.equal(E.isComplete({s:'S1',t1:'a',t2:'b'}),false);
  assert.equal(E.isComplete({s:'S3'}),true);assert.equal(E.isComplete({s:'S4'}),false);
  assert.throws(()=>E.outcome({s:'S1',t1:'z',t2:'a',t3:'a'}));assert.throws(()=>E.capital('S9'));
  const a=E.outcome({s:'S1',t1:'a',t2:'a',t3:'a'});assert.ok(Object.isFrozen(a)&&Object.isFrozen(a.fee));
  assert.equal(JSON.stringify(a),JSON.stringify(E.outcome({s:'S1',t1:'a',t2:'a',t3:'a'})));
  assert.ok(Object.isFrozen(E.STRUCTURES)&&Object.isFrozen(E.T1[0]));
});

test('Self-contained: no network APIs, remote assets, storage, or external fonts',()=>{
  assert.equal(/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\s*[.(]/.test(html),false);
  assert.equal(/<(?:script|img|link|iframe)[^>]+(?:src|href)\s*=\s*["'](?:https?:)?\/\//i.test(html),false);
  assert.equal(/@import|url\(\s*["']?https?:/i.test(html),false);
});

test('Scripts parse; required affordances and labels are present; no real company names',()=>{
  for(const s of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);
  for(const text of ['Fictional scenario. Simplified model, not a forecast.','Times New Roman','#14213d','#c79a3b','#f4f0e8','prefers-reduced-motion','aria-live','?guide=1','Board chair','Treasurer','Family advocate','Skeptic','Copy text','Download .txt','Print','Compare all three structures','Who decides access now?','Which protection survives a resale?','NFHS','classroom assumptions'])
    assert.ok(html.includes(text),text);
  for(const name of ['GameChanger','Unrivaled','BlueStar','Josh Harris','Sports Illustrated','LeagueApps','TeamSnap','Hudl'])
    assert.ok(!html.includes(name),'no real company: '+name);
});

console.log('\n'+count+' checks passed. Browser UI must also be smoke-tested.');
