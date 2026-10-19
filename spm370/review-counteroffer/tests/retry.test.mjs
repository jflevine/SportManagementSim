import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {submission, digest, CASE_VERSION, SCHEMA_VERSION} from '../backend/validation.mjs';
import {createHandler} from '../backend/handler.mjs';
import * as core from '../core.mjs';
const input = overrides => ({submission_id:'10000000-0000-4000-8000-000000000001',submission_token:'a'.repeat(72),case_version:CASE_VERSION,schema_version:SCHEMA_VERSION,name:'Synthetic Student',email:'synthetic@lasalle.edu',decision:'counter',recommendation:'Counter because payment should follow publication and approval.',clause_number:3,clarification:'Does payment follow approval or publication?',...overrides});

test('retry marker is explicitly true or absent and participates in canonical hash', async()=>{
 const original=submission(input()), retry=submission(input({retry_attempt:true}));
 assert(!Object.hasOwn(original,'retry_attempt')); assert.equal(retry.retry_attempt,true);
 assert.notEqual(await digest(JSON.stringify(original)), await digest(JSON.stringify(retry)));
 const {retry_attempt,...rest}=retry; assert.deepEqual(rest,original);
 for(const retry_attempt of [false,null,0,1,'true','false',{},[]]) assert.throws(()=>submission(input({retry_attempt})));
 assert.equal(submission(input({email:' SYNTHETIC@LASALLE.EDU ',retry_attempt:true})).email,'synthetic@lasalle.edu');
});

test('retry metadata reaches store only after class authentication and errors disclose no original', async()=>{
 const code='SYNTHETIC_CLASS_CODE_1234567890';let calls=[];
 const store={settings:async()=>({class_code_hash:await digest(code)}),submit:async args=>{calls.push(args);throw Error('RETRY_NOT_AUTHORIZED');}};
 const handler=createHandler({store});
 const request=(body,credential=code)=>new Request('https://example.invalid/spm370-counteroffer/submit',{method:'POST',headers:{'Content-Type':'application/json','X-Class-Code':credential},body:JSON.stringify(body)});
 assert.equal((await handler(request(input({retry_attempt:true}),'incorrect-code'))).status,403);assert.equal(calls.length,0);
 const r=await handler(request(input({retry_attempt:true})));assert.equal(r.status,409);
 const result=await r.json();assert.equal(result.code,'retry_not_authorized');assert.deepEqual(Object.keys(result).sort(),['code','error','ok']);
 assert.equal(calls[0].payload.retry_attempt,true);assert.equal(calls[0].payload_hash,await digest(JSON.stringify(submission(input({retry_attempt:true})))));
});

test('only exact attempt=2 selects separate storage namespace',async()=>{
 const prior=globalThis.location;
 try{for(const [search,expected] of [['',false],['?attempt=1',false],['?attempt=2',true],['?attempt=3',false],['?attempt=true',false],['?foo=1&attempt=2',true]]){
 globalThis.location={search};const m=await import('../core.mjs?test='+encodeURIComponent(search));assert.equal(m.RETRY_ATTEMPT,expected);assert.equal(m.STORAGE_KEY,'spm370-review-counteroffer-v1'+(expected?'-attempt-2':''));
 }}finally{if(prior===undefined)delete globalThis.location;else globalThis.location=prior;}
});

const appSource=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import .*?;\n/,'');
async function browser({retry=true,reject=false,pending=null}={}){
 const originalKey='spm370-review-counteroffer-v1',key=originalKey+(retry?'-attempt-2':'');
 const map=new Map([[originalKey,JSON.stringify({case_version:CASE_VERSION,draft:{name:'Original'},receipt:{receipt:'ORIGINAL',submitted_at:'2026-10-19T00:00:00Z'}})]]);
 if(retry)map.set(key,JSON.stringify({case_version:CASE_VERSION,draft:input(),pending,receipt:null}));
 const nodes=new Map();
 function node(id){if(!nodes.has(id))nodes.set(id,{id,value:'',listeners:{},disabled:false,textContent:'',addEventListener(t,f){this.listeners[t]=f;},before(){},reportValidity(){return true;},setCustomValidity(){},focus(){},querySelector(){return null;}});return nodes.get(id);}
 const form=node('student-form');form.elements=['name','email','decision','recommendation','clause_number','clarification','class-code','submit-button','download-button','clear-button'].map(node);for(const n of form.elements)form.elements[n.id]=n;
 const sent=[];let reloads=0;
 const context={...core,RETRY_ATTEMPT:retry,STORAGE_KEY:key,document:{getElementById:node,createElement:()=>node('created')},localStorage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},FormData:class{get(k){return k==='decision'?'counter':node(k).value;}},crypto:globalThis.crypto,confirm:()=>true,location:{reload(){reloads++;}},request:async(path,options)=>{if(path==='/meta')return{accepts_submissions:true};sent.push(options.body);if(reject)throw Object.assign(Error('Denied'),{status:409,code:'retry_not_authorized'});return{receipt:'NEW',submitted_at:'2026-10-19T00:01:00Z',attempt_number:retry?2:1};},console};
 vm.runInNewContext(appSource,context);await Promise.resolve();
 return{map,key,originalKey,node,form,sent,reloads:()=>reloads,submit:async()=>{node('class-code').value='SYNTHETIC_CLASS_CODE';await form.listeners.submit({preventDefault(){}});}};
}
test('attempt-2 form preserves original receipt, sends marker, and locks only new confirmed copy',async()=>{
 const b=await browser(),original=b.map.get(b.originalKey);assert.equal(b.node('submit-button').disabled,false);await b.submit();
 assert.equal(b.sent.length,1);assert.equal(b.sent[0].retry_attempt,true);assert.equal(b.map.get(b.originalKey),original);assert.equal(JSON.parse(b.map.get(b.key)).receipt.attempt_number,2);assert.equal(b.node('submit-button').disabled,true);
 b.node('clear-button').listeners.click();assert.equal(b.map.get(b.originalKey),original);assert(!b.map.has(b.key));assert.equal(b.reloads(),1);
});
test('unauthorized retry returns to editable draft without changing original browser record',async()=>{
 const b=await browser({reject:true}),original=b.map.get(b.originalKey);await b.submit();assert.equal(JSON.parse(b.map.get(b.key)).pending,null);assert.equal(b.node('email').disabled,false);assert.equal(b.map.get(b.originalKey),original);assert.equal(b.node('submit-button').disabled,false);
});
test('uncertain pending attempt-2 reuses exact saved ID and payload',async()=>{
 const pending=input({retry_attempt:true});const b=await browser({pending});await b.submit();assert.deepEqual(JSON.parse(JSON.stringify(b.sent[0])),pending);
});
test('downloaded confirmed attempt has authoritative attempt number',()=>{
 assert.match(core.responseText(input({retry_attempt:true}),{receipt:'TEST',submitted_at:'2026-10-19',attempt_number:2}),/Attempt: 2/);
 assert.match(core.responseText(input()),/Attempt: 1/);
});
