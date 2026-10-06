'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../model.js');
const plan=(overrides={})=>({...M.fresh(),mission:'compete',format:'groups',features:['coaching','cast'],featuresConfirmed:true,adjustment:'backup',step:5,...overrides});
test('bounded choices, unique identifiers, honest goals and all zero-cost responses',()=>{
 assert.equal(M.MISSIONS.length,3);assert.equal(M.FORMATS.length,3);assert.equal(M.FEATURES.length,6);assert.equal(M.ADJUSTMENTS.length,3);
 for(const list of [M.MISSIONS,M.FORMATS,M.FEATURES,M.ADJUSTMENTS])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
 for(const a of M.ADJUSTMENTS)assert.equal(a.cost,0);
 for(const m of M.MISSIONS){assert.ok(m.goal.includes('Target:'));assert.ok(m.measure.length>20);}
});
test('no negative budget, fourth feature, duplicate or unknown feature can be added',()=>{
 let s=plan({features:[]});
 for(const id of ['creator','cast'])s=M.toggleFeature(s,id).state;
 assert.equal(M.total(s),8);assert.equal(M.toggleFeature(s,'coaching').ok,false);
 s=M.toggleFeature(s,'freeplay').state;assert.equal(M.total(s),10);
 assert.equal(M.toggleFeature(s,'predictions').ok,false);
 s=M.toggleFeature(s,'creator').state;assert.equal(M.total(s),6);
 assert.equal(M.toggleFeature(s,'bogus').ok,false);assert.equal(s.adjustment,'');
});
test('every feasible combination and response has a deterministic, finite recap',()=>{
 let checked=0;
 for(const mission of M.MISSIONS)for(const format of M.FORMATS)for(let mask=0;mask<64;mask++){
  const features=M.FEATURES.filter((_,i)=>mask&(1<<i)).map(x=>x.id);
  const s=plan({mission:mission.id,format:format.id,features});
  if(features.length>3||M.total(s)>10)continue;
  for(const a of M.ADJUSTMENTS){s.adjustment=a.id;const r=M.recap(s);assert.ok(r);assert.deepEqual(r,M.recap(s));assert.ok(r.remaining>=0&&r.remaining<=10);assert.equal(r.spent+r.remaining,10);assert.equal(r.features.length,features.length);assert.ok(r.goalEvidence.includes('Not measured'));checked++;}
 }
 assert.ok(checked>900);console.log('Feasible complete combinations checked:',checked);
});
test('core format conflict cannot be erased by buying features',()=>{
 const r=M.recap(plan({mission:'compete',format:'rotation',features:['coaching','freeplay','creator'],adjustment:'delay'}));
 assert.equal(r.experienceLevel,'Mixed priorities');assert.match(r.experienceText,/core format/);
});
test('empty feature plan is valid, confirmation keeps the sequence deliberate',()=>{
 const s=plan({features:[]});assert.equal(M.total(s),0);assert.equal(M.recap(s).remaining,10);
 assert.equal(M.maxStep({...s,featuresConfirmed:false}),3);
 assert.equal(M.recap({...s,featuresConfirmed:false}),null);
});
test('reload sanitation preserves good work and rejects impossible state',()=>{
 const s=plan({name:'<script>alert(1)</script>',reflection:'test',features:['cast','coaching']});assert.deepEqual(M.restore(JSON.parse(JSON.stringify(s))),s);
 const bad=M.restore({...s,features:['cast','cast','creator','coaching','predictions','unknown'],step:200});assert.equal(M.total(bad),10);assert.equal(bad.features.length,3);assert.equal(bad.step,5);
 for(const input of [null,{},[],{version:2},'text'])assert.deepEqual(M.restore(input),M.fresh());
 const invalid=M.restore({...s,mission:'bad'});assert.equal(invalid.mission,'');assert.equal(invalid.format,'');assert.equal(invalid.adjustment,'');assert.deepEqual(invalid.features,[]);assert.equal(invalid.step,1);
 const invalidFormat=M.restore({...s,format:'bad'});assert.equal(invalidFormat.adjustment,'');assert.deepEqual(invalidFormat.features,[]);assert.equal(invalidFormat.step,2);
});
test('replay is stable, has no random number or clock-dependent outcome',()=>{
 const r=M.recap(plan());for(let i=0;i<100;i++)assert.deepEqual(M.recap(plan()),r);
 const src=require('node:fs').readFileSync(require.resolve('../model.js'),'utf8');assert.doesNotMatch(src,/Math\.random|Date\.now|new Date/);
});
test('input sizes are bounded and control characters removed',()=>{
 const s=M.restore(plan({name:'a'.repeat(100),reflection:'b'.repeat(500)}));assert.equal(s.name.length,50);assert.equal(s.reflection.length,300);assert.equal(M.cleanText('a\u0000b'),'a b');
});
