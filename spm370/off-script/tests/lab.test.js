'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../experience.js'),L=require('../lab.js');
const path=['event','boundary','original','collab','human','scoped'];
function fixture(){return {version:'1.2.0',sourceVersion:'1.1.1',primary:M.rebuild(path),completedAt:'2026-10-01T19:00:00Z',reflections:['Creator approval does not clear the music in an advertisement.','I would negotiate a defined duration and identify everyone whose permission is required.'],lab:{...L.fresh(),firstName:'Synthetic',lastName:'Tester',email:'synthetic@example.com',checks:['permissions','new-agreement'],consent:true,feedback:true}};}
const success={ok:true,receipt:'test-receipt',score:10,maxScore:10,completionScore:6,conceptScore:4,submittedAt:'2026-10-01T19:00:10Z',reviewStatus:'PENDING_REVIEW'};
test('light score is 6/8/10 and independent of every story outcome',()=>{
 let endings=0;function walk(s){if(s.step===6){endings++;assert.equal(L.score(s.history,['identity','label']).total,6);assert.equal(L.score(s.history,['permissions','label']).total,8);assert.equal(L.score(s.history,['permissions','new-agreement']).total,10);return;}for(const o of M.scene(s).options)walk(M.choose(s,o.id));}walk(M.initial());assert.equal(endings,729);
});
test('payload has the exact submission contract and no client score',()=>{const s=fixture();s.lab.attemptId='123';const p=L.payload(s);assert.equal(p.action,'submit');assert.equal(p.sourceVersion,'1.1.1');assert.deepEqual(p.choices,path);assert.deepEqual(p.checks,['permissions','new-agreement']);assert.ok(!('score'in p));});
test('identity, reflection, feedback and consent gates are explicit',()=>{const s=fixture();assert.equal(L.validate(s),'');s.lab.consent=false;assert.match(L.validate(s),/Confirm/);s.lab.consent=true;s.lab.feedback=false;assert.match(L.validate(s),/Check your answers/);s.lab.feedback=true;s.reflections[0]='x';assert.match(L.validate(s),/20 characters/);});
test('network failure preserves the exact payload through restore, edits and retry',async()=>{
 let s=fixture(),first;await assert.rejects(L.submit(s,{fetch:async(u,init)=>{first=init.body;throw Error('Offline');}}),/Offline/);
 assert.ok(s.lab.pending);const saved=L.restore(s.lab);s.lab=saved;s.reflections[0]='Changed after timeout, which must not replace the pending payload.';
 const r=await L.submit(s,{fetch:async(u,init)=>{assert.equal(init.body,first);return {ok:true,json:async()=>success};}});
 assert.equal(r.score,10);assert.equal(s.lab.pending,null);assert.equal(s.lab.submitted.reflections[0],JSON.parse(first).reflections[0]);
});
test('only definite no-insert errors unlock editing; ambiguous errors stay frozen',async()=>{
 for(const code of ['INVALID_REQUEST','INVALID_ATTEMPT','VERSION_MISMATCH','ATTEMPT_CONFLICT','EMAIL_ALREADY_SUBMITTED','SERVER_ERROR']){
  const s=fixture();await assert.rejects(L.submit(s,{fetch:async()=>({ok:false,json:async()=>({code,error:'Test rejection'})})}));assert.equal(!!s.lab.pending,!['INVALID_REQUEST','INVALID_ATTEMPT','VERSION_MISMATCH'].includes(code));assert.equal(s.lab.receipt,null);
 }
});
test('a malformed response cannot become a successful submission',async()=>{const s=fixture();await assert.rejects(L.submit(s,{fetch:async()=>({ok:true,json:async()=>({ok:true,score:10})})}),/valid receipt/);assert.equal(s.lab.receipt,null);assert.ok(s.lab.pending);});
test('demo refuses submission and an existing receipt prevents duplicate fetch',async()=>{const s=fixture();let calls=0;await assert.rejects(L.submit(s,{demo:true,fetch:async()=>{calls++;}}),/demo/i);s.lab.receipt=success;const result=await L.submit(s,{fetch:async()=>{calls++;}});assert.equal(result.receipt,success.receipt);assert.equal(calls,0);});
test('feedback permits retries and all rendering escapes personal input',()=>{const s=fixture();s.lab.firstName='<script>alert(1)</script>';s.lab.checks=['identity','label'];const html=L.render(s);assert.match(html,/Try again/);assert.match(html,/6 \/ 10/);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);});

test('the exact frontend payload validates with the committed backend contract',async()=>{
 const {validateSubmission}=await import('../backend/validation.mjs');const s=fixture();s.lab.attemptId=crypto.randomUUID();const value=validateSubmission(L.payload(s));assert.equal(value.completion_score,6);assert.equal(value.concept_score,4);assert.equal(value.source_version,'1.1.1');
});
