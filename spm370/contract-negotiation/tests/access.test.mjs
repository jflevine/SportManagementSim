import test from 'node:test';
import assert from 'node:assert/strict';
import {loadAccess} from '../backend/access.mjs';
import {createStore} from '../backend/store.mjs';
const instructor = 'a'.repeat(64), classCode = 'b'.repeat(64), envInstructor = 'c'.repeat(64), envClass = 'd'.repeat(64);
const store = {access: async () => ({instructor_key_hash: instructor, class_code_hash: classCode})};
test('missing environment hashes load private fallback independently', async () => {
 assert.deepEqual(await loadAccess({store}), {instructorHash: instructor, classHash: classCode});
 assert.deepEqual(await loadAccess({store,instructorEnv:envInstructor}), {instructorHash:envInstructor,classHash:classCode});
 assert.deepEqual(await loadAccess({store,classEnv:envClass}), {instructorHash:instructor,classHash:envClass});
});
test('valid environment hashes take precedence and skip fallback lookup', async () => {
 let calls=0; const result=await loadAccess({store:{access:async()=>{calls++;throw Error('not needed');}},instructorEnv:envInstructor,classEnv:envClass});
 assert.equal(calls,0);assert.deepEqual(result,{instructorHash:envInstructor,classHash:envClass});
});
test('present invalid environment hash cannot silently enable an older credential', async () => {
 const result=await loadAccess({store,instructorEnv:'invalid'});assert.equal(result.instructorHash,undefined);assert.equal(result.classHash,classCode);
});
test('missing, malformed, or unreachable fallback fails closed while preserving valid environment access', async () => {
 for(const fallback of [async()=>null,async()=>({instructor_key_hash:'short',class_code_hash:'not a hash'}),async()=>{throw Error('private database diagnostic');}]){
  assert.deepEqual(await loadAccess({store:{access:fallback}}),{instructorHash:undefined,classHash:undefined});
  assert.deepEqual(await loadAccess({store:{access:fallback},instructorEnv:envInstructor}),{instructorHash:envInstructor,classHash:undefined});
 }
});
test('fallback store uses service headers and a bounded read of only hash columns', async () => {
 let observed;
 const s=createStore({url:'https://fixture.invalid',key:'FAKE_SERVICE_ONLY',fetcher:async(url,options)=>{observed={url,options};return Response.json([{instructor_key_hash:instructor,class_code_hash:classCode}]);}});
 assert.deepEqual(await s.access(),{instructor_key_hash:instructor,class_code_hash:classCode});
 assert.match(observed.url,/spm370_contract_access\?id=eq.main&select=instructor_key_hash,class_code_hash$/);
 assert.equal(observed.options.method,'GET');assert.equal(observed.options.headers.apikey,'FAKE_SERVICE_ONLY');assert(observed.options.signal instanceof AbortSignal);
});
