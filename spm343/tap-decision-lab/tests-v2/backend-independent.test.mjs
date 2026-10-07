/** Independent synthetic protocol/security tests. In-memory store; SQL is separate. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID, randomBytes, webcrypto} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
globalThis.crypto ||= webcrypto;
const directory = process.env.TAP_BACKEND_DIR || fileURLToPath(new URL('../backend-v2/', import.meta.url));
const {createHandler} = await import(pathToFileURL(path.join(directory, 'handler.mjs')));
const {VERSION, sha256, InputError, transition, projection, safePublication} = await import(pathToFileURL(path.join(directory, 'model.mjs')));
assert.equal(VERSION, '2.0.1', 'Independent tests must point to the v2 backend');
const API_URL = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2';
const KEY = 'SYNTHETIC_IN_MEMORY_KEY_NEVER_A_REAL_CREDENTIAL';
const IDENTITY = {firstName: 'Synthetic', lastName: 'Fixture', email: 'tap-v2@example.invalid', individualWork: true};
const EMPTY = {initialChoice:'', initialPosition:'', finalChoice:'', adjustment:'', priority:'', finalReason:'', runnerUp:'', tradeoff:'', guestConsent:false};
const PRIVATE = 'SYNTHETIC_PRIVATE_RESPONSE_MUST_NOT_ENTER_PUBLIC_PROJECTION';
const INITIAL = {...EMPTY, initialChoice:'cup', initialPosition:PRIVATE + ': 12 stations and $280 are feasible before the audience mix is known.'};
const FINAL = {finalChoice:'open', adjustment:'extra_host', priority:'newcomers', finalReason:PRIVATE + ': A third host can support the sixteen novices while retaining a short competitive finish.', runnerUp:'showcase', tradeoff:PRIVATE + ': We give up the shared spectacle in exchange for supported hands-on access.'};
const clone = value => structuredClone(value);

class MemoryStore {
  constructor(){ this.rows = new Map(); this.ops = new Map(); this.publications = new Map(); this.reads = []; this.writes = 0; this.dropAfterCommit = false; }
  id(mode, id){ return `${mode}:${id}`; }
  async get(mode,id){ this.reads.push('get'); return clone(this.rows.get(this.id(mode,id)) || null); }
  async list(mode){ this.reads.push('list'); return [...this.rows.values()].filter(v=>v.state.mode===mode).map(v=>clone(v.state)); }
  async replay(mode,id,rid,hash){ const v=this.ops.get(`${mode}:${id}:${rid}`); if(!v)return null; if(v.hash!==hash)throw new InputError('REQUEST_CONFLICT','Same request ID, different payload.',409); return clone(v.response); }
  async apply(v){
    const key=this.id(v.mode,v.attemptId), current=this.rows.get(key);
    if(current && current.tokenHash!==v.tokenHash)throw new InputError('STATE_CONFLICT','Token binding changed.',409);
    const previous=await this.replay(v.mode,v.attemptId,v.requestId,v.requestHash); if(previous)return previous;
    if((current?.state.version||0)!==v.expectedVersion)throw new InputError('VERSION_CONFLICT','Stale version.',409);
    this.rows.set(key,{state:clone(v.next),tokenHash:v.tokenHash});
    this.publications.set(key,clone(v.publication));
    this.ops.set(`${key}:${v.requestId}`,{hash:v.requestHash,response:clone(v.response)});this.writes++;
    if(this.dropAfterCommit){this.dropAfterCommit=false;throw Error('Synthetic response lost after commit');}
    return clone(v.response);
  }
  async guest(){
    this.reads.push('guest-projection-only');
    const p=[...this.publications.values()].filter(v=>v.mode==='live');
    const counts=field=>Object.fromEntries(['cup','open','showcase'].map(c=>[c,p.filter(v=>v[field]===c).length]));
    return {aggregate:{started:p.length,initialPlans:p.filter(v=>v.stage!=='draft').length,completedRevisions:p.filter(v=>v.stage==='submitted').length,initialChoices:counts('initial_choice'),finalChoices:counts('final_choice')},publications:p.filter(v=>v.published)};
  }
}

async function setup(){
  const store=new MemoryStore(), handler=createHandler({store,instructorKeyHash:await sha256(KEY),now:()=> '2026-10-07T12:00:00Z'});
  const call=async(body,{token,key,origin,query='',method,headers={},raw}={})=>{
    const request=new Request(API_URL+query,{method:method||(body||raw!==undefined?'POST':'GET'),headers:{'Content-Type':'application/json',...(token?{'x-attempt-token':token}:{}),...(key?{'x-instructor-key':key}:{}),...(origin?{Origin:origin}:{}),...headers},body:raw!==undefined?raw:body?JSON.stringify(body):undefined});
    const response=await handler(request);const data=response.status===204?null:await response.json();
    assert.match(response.headers.get('cache-control')||'',/no-store/);
    return {status:response.status,data};
  };
  return {store,call};
}
function operation(a,action,extra={},version=a.version){return {action,mode:a.mode,attemptId:a.id,requestId:randomUUID(),expectedVersion:version,...extra};}
function ok(result){assert.equal(result.status,200,JSON.stringify(result));return result.data;}
function studentPrivate(state){ for(const field of ['review','finalGrade','scores','notes','feedback'])assert(!Object.hasOwn(state,field), `Student projection leaked ${field}`);assert(!JSON.stringify(state).includes('SYNTHETIC PRIVATE FEEDBACK')); }
function denied(result,status,code){assert.equal(result.status,status,JSON.stringify(result));if(code)assert.equal(result.data.error.code,code);}
async function act(env,a,action,extra={}){const body=operation(a,action,extra);const result=ok(await env.call(body,{token:a.token}));studentPrivate(result.submission);a.version=result.submission.version;a.state=result.submission;a.last=body;return result;}
async function start(env,mode='test') {const a={id:randomUUID(),token:randomBytes(32).toString('base64url'),mode,version:0};await act(env,a,'start',{identity:mode==='test'?IDENTITY:{firstName:'Synthetic',lastName:'InMemory',email:'synthetic-in-memory@lasalle.edu',individualWork:true}});return a;}
async function complete(env,mode='test',consent=false){const a=await start(env,mode);await act(env,a,'save',{answers:INITIAL});await act(env,a,'lockPlan');await act(env,a,'save',{answers:{...INITIAL,...FINAL,guestConsent:consent}});await act(env,a,'submit');return a;}

test('v2 health exposes manual rubric, no automatic grade, approved origin only',async()=>{
 const env=await setup();const h=ok(await env.call());assert.equal(h.grading,'instructor-only');assert.equal(h.maxScore,10);assert.deepEqual(h.rubricMax,[2,3,3,2]);assert.equal(h.identityVerification,'self-reported');
 denied(await env.call(undefined,{origin:'https://evil.example.invalid'}),403,'ORIGIN_DENIED');
 const preflight=await env.call(undefined,{method:'OPTIONS',origin:'https://jflevine.github.io'});assert.equal(preflight.status,204);
});

test('test mode accepts fixed invented identity only; live mode enforces La Salle domain',async()=>{
 const env=await setup();const a={id:randomUUID(),token:randomBytes(32).toString('base64url'),version:0,mode:'test'};
 for(const identity of [{...IDENTITY,individualWork:false},{...IDENTITY,firstName:'Someone'},{...IDENTITY,email:'user@lasalle.edu'},{...IDENTITY,email:'other@example.invalid'}])denied(await env.call(operation(a,'start',{identity}),{token:a.token}),400,'INVALID_INPUT');
 a.mode='live';for(const email of ['person@gmail.com','person@lasalle.edu.evil.invalid','person@example.invalid','person@lasalle.edu.invalid','@lasalle.edu'])denied(await env.call(operation(a,'start',{identity:{...IDENTITY,email}}),{token:a.token}),400,'INVALID_INPUT');
 assert.equal(env.store.rows.size,0);
});

test('attempt capability is required, attempt bound, mode bound and never returned',async()=>{
 const env=await setup();const a=await start(env);const b=await start(env);
 const resume={action:'resume',mode:'test',attemptId:a.id};
 denied(await env.call(resume),401,'UNAUTHORIZED');denied(await env.call(resume,{token:'short'}),401,'UNAUTHORIZED');denied(await env.call(resume,{token:b.token}),401,'UNAUTHORIZED');
 denied(await env.call({...resume,mode:'live'},{token:a.token}),401,'UNAUTHORIZED');
 const own=ok(await env.call(resume,{token:a.token}));assert.equal(own.submission.attemptId,a.id);
 assert(!JSON.stringify(own).includes(a.token));assert(!JSON.stringify(own).includes('tokenHash'));
 const stored=env.store.rows.get('test:'+a.id);assert.match(stored.tokenHash,/^[0-9a-f]{64}$/);assert.notEqual(stored.tokenHash,a.token);
});

test('uncertain committed start replays exact request once; changed body cannot reuse ID',async()=>{
 const env=await setup();const a={id:randomUUID(),token:randomBytes(32).toString('base64url'),version:0,mode:'test'};
 const body=operation(a,'start',{identity:IDENTITY});env.store.dropAfterCommit=true;
 denied(await env.call(body,{token:a.token}),503,'STORAGE_UNAVAILABLE');
 const replay=ok(await env.call(body,{token:a.token}));assert.equal(replay.submission.version,1);assert.equal(env.store.writes,1);
 denied(await env.call({...body,identity:{...IDENTITY,firstName:'Changed'}},{token:a.token}),409,'REQUEST_CONFLICT');
 assert.equal(env.store.rows.size,1);
});

test('initial lock precedes new-information fields and stays immutable',async()=>{
 const env=await setup();const a=await start(env);
 denied(await env.call(operation(a,'lockPlan'),{token:a.token}),400,'INVALID_INPUT');
 denied(await env.call(operation(a,'save',{answers:{...INITIAL,...FINAL}}),{token:a.token}),409,'STATE_CONFLICT');
 await act(env,a,'save',{answers:INITIAL});await act(env,a,'lockPlan');const snap=clone(a.state.initialPlan);
 denied(await env.call(operation(a,'save',{answers:{...INITIAL,initialPosition:'Changed initial position with enough characters to otherwise pass.'}}),{token:a.token}),409,'STATE_CONFLICT');
 denied(await env.call(operation(a,'lockPlan'),{token:a.token}),409,'STATE_CONFLICT');
 await act(env,a,'save',{answers:{...INITIAL,...FINAL}});await act(env,a,'submit');assert.deepEqual(a.state.initialPlan,snap);
});

test('strict fields reject injected score, identity, script-sized response and early grade',async()=>{
 const env=await setup();const a=await start(env);
 for(const body of [operation(a,'save',{answers:{...INITIAL,grade:10}}),{...operation(a,'save',{answers:INITIAL}),score:10},operation(a,'save',{answers:{...INITIAL,initialPosition:'x'.repeat(1801)}}),{...operation(a,'save',{answers:INITIAL}),identity:IDENTITY}])denied(await env.call(body,{token:a.token}),400,'INVALID_INPUT');
 denied(await env.call(operation(a,'instructorReview',{scores:[2,3,3,2],notes:''}),{token:a.token}),401,'UNAUTHORIZED');
 assert.equal(env.store.rows.get('test:'+a.id).state.version,1);
});

test('all three formats can submit while Cup/Showcase plus host exceed budget',async()=>{
 for(const [choice,adjustment] of [['cup','orientation'],['open','extra_host'],['showcase','rotations']]){
  const env=await setup(),a=await start(env);const initial={...INITIAL,initialChoice:choice};await act(env,a,'save',{answers:initial});await act(env,a,'lockPlan');
  const final={...initial,...FINAL,finalChoice:choice,runnerUp:choice==='showcase'?'cup':'showcase'};
  if(choice!=='open'){await act(env,a,'save',{answers:{...final,adjustment:'extra_host'}});denied(await env.call(operation(a,'submit'),{token:a.token}),400,'BUDGET_EXCEEDED');}
  await act(env,a,'save',{answers:{...final,adjustment}});await act(env,a,'submit');assert.equal(a.state.status,'submitted');studentPrivate(a.state);assert.equal(a.state.reviewStatus,'pending');assert.match(a.state.receipt,/^TAP2-TEST-/);
 }
});

test('CAS rejects stale writes; old idempotent replies do not replace current server state',async()=>{
 const env=await setup(),a=await start(env);const startBody=a.last,original=clone(a.state);
 await act(env,a,'save',{answers:INITIAL});
 denied(await env.call(operation(a,'save',{answers:INITIAL},1),{token:a.token}),409,'VERSION_CONFLICT');
 assert.deepEqual(ok(await env.call(startBody,{token:a.token})).submission,original);
 const current=ok(await env.call({action:'resume',mode:'test',attemptId:a.id},{token:a.token})).submission;assert.equal(current.version,2);assert.deepEqual(current.answers,INITIAL);
});

test('submitted receipt replays durably; student cannot mutate final answers',async()=>{
 const env=await setup(),a=await complete(env);const receipt=clone(a.state),body=a.last;
 studentPrivate(receipt);assert.equal(receipt.reviewStatus,'pending');assert.equal(receipt.guest.consent,false);assert.equal(receipt.guest.published,false);
 assert.deepEqual(ok(await env.call(body,{token:a.token})).submission,receipt);
 denied(await env.call(operation(a,'submit'),{token:a.token}),409,'STATE_CONFLICT');
 denied(await env.call(operation(a,'save',{answers:{...INITIAL,...FINAL}}),{token:a.token}),409,'STATE_CONFLICT');
 assert.deepEqual(ok(await env.call({action:'resume',mode:'test',attemptId:a.id},{token:a.token})).submission,receipt);
});

test('instructor-only scoring preserves zero while student resume/replay redact scores and feedback',async()=>{
 const env=await setup(),a=await complete(env),locked=clone(a.state);
 for(const scores of [[3,3,3,2],[-1,0,0,0],[1.5,2,2,1],[0,4,0,0],[0,0,4,0],[0,0,0,3],[0,0,0]])denied(await env.call(operation(a,'instructorReview',{scores,notes:''}),{key:KEY}),400,'INVALID_INPUT');
 const zero=ok(await env.call(operation(a,'instructorReview',{scores:[0,0,0,0],notes:'SYNTHETIC PRIVATE FEEDBACK'}),{key:KEY})).submission;
 assert.equal(zero.finalGrade,0);assert.equal(zero.review.total,0);assert.equal(zero.receipt,locked.receipt);assert.deepEqual(zero.answers,locked.answers);assert.deepEqual(zero.initialPlan,locked.initialPlan);
 const resume=ok(await env.call({action:'resume',mode:'test',attemptId:a.id},{token:a.token})).submission;studentPrivate(resume);assert.equal(resume.reviewStatus,'reviewed');
 const replay=ok(await env.call(a.last,{token:a.token})).submission;studentPrivate(replay);assert.equal(replay.receipt,locked.receipt);
 const historical=env.store.ops.get(`test:${a.id}:${a.last.requestId}`);historical.response.submission.review=clone(zero.review);historical.response.submission.finalGrade=0;historical.response.privateDebug='SYNTHETIC PRIVATE FEEDBACK';
 const oldFullReplay=ok(await env.call(a.last,{token:a.token}));studentPrivate(oldFullReplay.submission);assert(!Object.hasOwn(oldFullReplay,'privateDebug'));assert(!JSON.stringify(oldFullReplay).includes('SYNTHETIC PRIVATE FEEDBACK'));
 const detail=ok(await env.call({action:'instructorDetail',mode:'test',attemptId:a.id},{key:KEY})).submission;assert.equal(detail.finalGrade,0);assert.deepEqual(detail.review.scores,[0,0,0,0]);assert.equal(detail.review.notes,'SYNTHETIC PRIVATE FEEDBACK');
 const listed=ok(await env.call({action:'instructorList',mode:'test'},{key:KEY})).submissions;assert.equal(listed[0].finalGrade,0);
 denied(await env.call({action:'instructorList',mode:'test'}),401,'UNAUTHORIZED');denied(await env.call({action:'instructorList',mode:'test'},{key:'fake-wrong-key'}),401,'UNAUTHORIZED');
});

test('public release needs opt-in and safe template; test rows never enter live guest counts',async()=>{
 const env=await setup(),optout=await complete(env,'live',false),optin=await complete(env,'live',true),testOnly=await complete(env,'test',true);
 denied(await env.call(operation(optout,'instructorPublish',{published:true,template:'decision'}),{key:KEY}),409,'STATE_CONFLICT');
 denied(await env.call({...operation(optin,'instructorPublish',{published:true,template:'decision'}),summary:PRIVATE},{key:KEY}),400,'INVALID_INPUT');
 const release=ok(await env.call(operation(optin,'instructorPublish',{published:true,template:'decision'}),{key:KEY}));assert.equal(release.submission.guest.published,true);
 ok(await env.call(operation(testOnly,'instructorPublish',{published:true,template:'decision'}),{key:KEY}));
 env.store.reads=[];const guest=ok(await env.call(undefined,{query:'?view=guest'}));assert.deepEqual(env.store.reads,['guest-projection-only']);assert.equal(guest.aggregate.started,2);assert.equal(guest.proposals.length,1);
 assert.deepEqual(Object.keys(guest.proposals[0]).sort(),['label','initialChoice','finalChoice','adjustment','priority','runnerUp'].sort());
 const encoded=JSON.stringify(guest);for(const forbidden of [PRIVATE,'Synthetic','@lasalle.edu','tap-v2@example.invalid','receipt','finalGrade','review','notes','attemptId','answers'])assert(!encoded.includes(forbidden),forbidden);
 const gradebook=ok(await env.call({action:'instructorList',mode:'live'},{key:KEY}));assert.equal(gradebook.submissions.length,2);assert(gradebook.submissions.every(v=>v.mode==='live'));
});

test('body/media/route boundaries return safe errors, never stack traces or secrets',async()=>{
 const env=await setup(),a=await start(env);
 denied(await env.call(undefined,{raw:'{broken'}),400,'INVALID_INPUT');
 denied(await env.call(undefined,{raw:'x'.repeat(18001),token:a.token}),413,'BODY_TOO_LARGE');
 denied(await env.call({action:'resume',mode:'test',attemptId:a.id},{token:a.token,headers:{'content-type':'text/plain'}}),415,'UNSUPPORTED_MEDIA');
 denied(await env.call({action:'resume',mode:'test',attemptId:a.id},{token:a.token,headers:{'content-encoding':'gzip'}}),415,'UNSUPPORTED_MEDIA');
 const unknown=await env.call(undefined,{query:'?view=private'});denied(unknown,404,'NOT_FOUND');assert(!JSON.stringify(unknown).includes('stack'));assert(!JSON.stringify(unknown).includes(KEY));
});
