import test from 'node:test';import assert from 'node:assert/strict';import {testHandler,fakeStore,testKey,validActivity} from './test-support.mjs';
const token='a'.repeat(48),other='b'.repeat(48),essay='This synthetic response is long enough to test validation and demonstrates the input handling without using any real student information.';
test('Private submissions, grading, retries, concurrency, recovery and access boundaries',async()=>{
 const store=fakeStore(),handler=await testHandler(store);
 async function request(body,t=token,path='',key){const r=await handler(new Request('https://test.invalid/'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json','x-attempt-token':t,...(key?{'x-instructor-key':key}:{})},...(body?{body:JSON.stringify(body)}:{})}));return {status:r.status,body:await r.json()};}
 let x=await request({action:'start',name:'Synthetic QA',email:'qa@lasalle.edu',attest:true});assert.equal(x.status,200);assert.equal(x.body.email,'qa@lasalle.edu');let rev=x.body.revision;const id=x.body.id;
 assert.equal((await request(null,token,'instructor')).status,401);
 assert.equal((await request({action:'start',name:'Other QA',email:'qa@lasalle.edu',attest:true},other)).status,409);
 assert.equal((await request({action:'resume'},other)).status,401);
 assert.equal((await request({action:'submitQuiz',revision:rev,answers:[],attest:true})).status,409);
 assert.equal((await request({action:'activity',revision:rev,activity:{...validActivity,notes:['short']}})).status,400);
 x=await request({action:'activity',revision:rev,activity:validActivity,score:999});assert.equal(x.status,200);const receipt=x.body.activityReceipt;assert(receipt);rev=x.body.revision;
 assert.equal((await request({action:'activity',revision:0,activity:validActivity})).body.activityReceipt,receipt);
 assert(!JSON.stringify(x.body.assessment).includes('"answer"'));assert(!JSON.stringify(x.body.assessment).includes('"model"'));
 const answers=[...Array(12).fill(0),essay,essay];
 const concurrent=await Promise.all([request({action:'saveQuiz',revision:rev,answers}),request({action:'saveQuiz',revision:rev,answers})]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);rev++;
 assert.equal((await request({action:'submitQuiz',revision:rev,answers:[...Array(12).fill(9),essay,essay],attest:true})).status,400);
 assert.equal((await request({action:'submitQuiz',revision:rev,answers,attest:false})).status,400);
 x=await request({action:'submitQuiz',revision:rev,answers,attest:true,score:0});assert.equal(x.status,200);assert(x.body.quizReceipt);assert.equal(x.body.mc_score,undefined);rev=x.body.revision;
 assert.equal((await request({action:'submitQuiz',revision:0,answers,attest:true})).body.quizReceipt,x.body.quizReceipt);
 x=await request(null,token,'instructor',testKey);assert.equal(x.body.submissions.length,1);assert.equal(x.body.submissions[0].mc_score,12);assert.equal(x.body.submissions[0].token_hash,undefined);
 assert.equal((await request({action:'grade',id,revision:rev,activityScore:9,essayScores:[3,4],notes:'Good reasoning'},token,'instructor',testKey)).status,200);rev++;
 x=await request(null,token,'instructor',testKey);assert.equal(x.body.submissions[0].activity_score,9);assert.deepEqual(x.body.submissions[0].essay_scores,[3,4]);
 x=await request({action:'recover',id,revision:rev},token,'instructor',testKey);assert.equal(x.status,200);assert.equal((await request({action:'resume'},token)).status,401);assert.equal((await request({action:'resume'},x.body.recoveryCode)).status,200);
 const badOrigin=await handler(new Request('https://test.invalid/',{headers:{origin:'https://attacker.invalid'}}));assert.equal(badOrigin.status,403);
});
