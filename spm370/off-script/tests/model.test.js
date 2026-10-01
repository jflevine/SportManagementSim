'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../experience.js');
const original=require('../model.js');
const substantive=s=>{
  const {version,history,...state}=s;
  return {...state,history:history.map(({index,sceneId,option,evidence,callbackFrom,delta,trustDelta,openBefore,openAfter,concept,source})=>({index,sceneId,option,evidence,callbackFrom,delta,trustDelta,openBefore,openAfter,concept,source}))};
};
const doc=(s,title)=>M.documents(s).find(d=>d.title===title).text;

test('all 729 endings, 1,093 states and 14 scene variants preserve the original model',()=>{
  let states=0,endings=0;const scenes=new Set(),families=new Set();
  function walk(a,b){
    states++;
    assert.deepEqual(substantive(a),substantive(b));
    assert.deepEqual(M.audit(a),[]);
    assert.deepEqual(substantive(M.rebuild(a.history)),substantive(a));
    const before=JSON.stringify(a);M.documents(a);assert.equal(JSON.stringify(a),before);
    if(a.step===6){endings++;assert.equal(M.ending(a).id,original.ending(b).id);families.add(M.ending(a).id);return;}
    const v=M.scene(a);scenes.add(v.id);
    assert.ok(v.task);assert.ok(v.hook);assert.ok(v.hook.split(/\s+/).length<20);assert.equal(v.paragraphs.length,2);assert.equal(v.evidence.length,2);
    assert.deepEqual(v.options.map(o=>o.id),original.scene(b).options.map(o=>o.id));
    for(const o of v.options)walk(M.choose(a,o.id),original.choose(b,o.id));
  }
  walk(M.initial(),original.initial());
  assert.equal(states,1093);assert.equal(endings,729);assert.equal(scenes.size,14);assert.equal(families.size,6);
});

test('trailer language matches resolved and unresolved sponsor conflicts',()=>{
  for(const first of M.scene(M.initial()).options){
    const s=M.choose(M.initial(),first.id);
    for(const second of M.scene(s).options){
      const next=M.choose(s,second.id),v=M.scene(next);
      for(const o of v.options.slice(0,2)){
        assert.equal(o.body.includes('disputed chair'),!next.sponsorOK);
        if(next.sponsorOK)assert.match(o.body,/signed agreement/);
      }
      assert.match(v.evidence[1][1],/approved recorded Nova greeting/);
    }
  }
});

test('deal file distinguishes an unsigned offer, a fallback and a completed broader agreement',()=>{
  assert.match(doc(M.initial(),'Identity permission'),/No agreement has been signed/);
  assert.equal(M.dealName(M.rebuild(['broad','narrow'])),'Event-only fallback agreement');
  assert.equal(M.dealName(M.rebuild(['broad','waiver'])),'Agreed all-channel campaign');
  assert.match(doc(M.rebuild(['creator','optin']),'Sponsor scope'),/separate, limited Seatline shoot/);
});

test('extension records identify the new permissions while retaining original limits',()=>{
  const s=M.rebuild(['event','boundary','original','collab','human','extend']);
  for(const title of ['Sponsor scope','Identity permission','Fan art'])assert.match(doc(s,title),/90.day/);
  assert.match(doc(s,'Identity permission'),/30.*signing/);
  assert.match(doc(s,'Fan art'),/original satire remains independent/);
  assert.match(doc(s,'Media rights'),/separately agreed component permissions/);
});

test('postponement records do not imply a launch, new consent, or unpaid conditional funds',()=>{
  const s=M.rebuild(['broad','override','ship','demand','preview','reset']);
  assert.match(doc(s,'Current campaign status'),/no campaign launches and no new Nova license/);
  assert.match(doc(s,'Sponsor scope'),/conditional \$10,000 was not paid/);
  assert.doesNotMatch(doc(s,'Sponsor scope'),/remains conditional/);
  assert.match(doc(s,'Media rights'),/withdrawn/);
  assert.match(doc(s,'Voice / AI'),/withdrawn/);
  assert.match(doc(s,'Ending / retirement'),/no replacement campaign or future license is presumed approved/);
});

test('the event-wide extension delay is disclosed before selecting the action',()=>{
  const s=M.rebuild(['broad','waiver','license','space','specific']),v=M.scene(s);
  assert.match(v.evidence[1][1],/Mara can arrange a 24-hour postponement of CROSSPLAY and its campaign launch/);
  const o=v.options.find(o=>o.id==='extend');
  assert.match(o.body,/postponement of CROSSPLAY/);
  assert.match(o.trade,/CROSSPLAY and its campaign launch move back 24 hours/);
});
