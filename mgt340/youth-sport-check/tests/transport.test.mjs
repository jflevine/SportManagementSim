import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sendFrozen} from '../transport.mjs';

const config={submissionEndpoint:'https://example.test/submit',publicApiKey:'public-test-key'};
const payload={attemptId:'11111111-1111-4111-8111-111111111111',assessmentVersion:'mgt340-youth-sport-v2',answers:[0,1,2,3,0,1,2,3],briefs:{q5:{a:'Goal',b:'Evidence'},q10:{a:'Condition',b:'Tradeoff'}}};

test('blocked retry storage prevents any network attempt',async()=>{
 for(const ensureRetrySaved of [()=>false,()=>{throw new Error('Blocked storage');}]){
  let calls=0;
  await assert.rejects(()=>sendFrozen(payload,{config,ensureRetrySaved,fetchImpl:async()=>{calls++;}}),{code:'RETRY_STORAGE_BLOCKED'});
  assert.equal(calls,0);
 }
});

test('lost acknowledgment retries the exact frozen attempt without cookies or redirects',async()=>{
 const requests=[];
 const fetchImpl=async(url,options)=>{requests.push({url,options});if(requests.length===1)throw new Error('Lost acknowledgment');return {ok:true,json:async()=>({ok:true})};};
 const args={config,ensureRetrySaved:()=>true,fetchImpl};
 await assert.rejects(()=>sendFrozen(payload,args),/Lost acknowledgment/);
 await sendFrozen(payload,args);
 assert.equal(requests.length,2);
 assert.equal(requests[0].options.body,requests[1].options.body);
 assert.equal(requests[1].url,config.submissionEndpoint);
 assert.equal(requests[1].options.credentials,'omit');
 assert.equal(requests[1].options.redirect,'error');
 assert.equal(requests[1].options.headers.Authorization,'Bearer public-test-key');
 assert.deepEqual(JSON.parse(requests[1].options.body),payload);
});

test('malformed acknowledgment does not turn into a successful receipt',async()=>{
 await assert.rejects(()=>sendFrozen(payload,{config,ensureRetrySaved:()=>true,fetchImpl:async()=>({ok:true,json:async()=>{throw new SyntaxError('Invalid JSON');}})}),SyntaxError);
});

test('preview completion returns before payload creation and network submission',async()=>{
 const app=await readFile(new URL('../app.mjs',import.meta.url),'utf8');
 const submit=app.slice(app.indexOf('async function submit()'),app.indexOf('function backupText()'));
 const pilotGuard=submit.indexOf("if(pilot){state.status='pilot-complete';persist();render(true);return;}");
 assert.ok(pilotGuard>0);
 assert.ok(pilotGuard<submit.indexOf('state.frozen=buildPayload(state)'));
 assert.ok(pilotGuard<submit.indexOf('await sendFrozen'));
 assert.ok(app.includes('const identity=pilot?{}:readIdentity(e.currentTarget)'));
 assert.match(app,/Work individually\. This is an open-notes knowledge check\./);
 assert.match(submit,/Save your identity changes before submitting/);
});
