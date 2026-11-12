import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const API=process.env.AD_CHAT_ENDPOINT||'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/ad-decision-chat';
const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function call(body,attempt=0){
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-session-token':token,Origin:'https://jflevine.github.io'},body:JSON.stringify(body),signal:AbortSignal.timeout(55000)});
 const d=await r.json();
 if(r.status===429&&/wait a moment/i.test(d.error||'')&&attempt<2){await new Promise(resolve=>setTimeout(resolve,3000));return call(body,attempt+1);}
 assert.equal(r.ok,true,d.error||`HTTP ${r.status}`);return d;
}
const {session}=await call({action:'start'});assert.ok(session.id);
const turns=[
 ...['coach','business','athlete'].map(role=>({label:`${role}: same proposal`,role,phase:'initial',planId:'financial',message:'Would you put more into payments or keep the reserve? Be honest. I am considering the financial commitments plan.'})),
 {label:'athlete: challenge to evidence',role:'athlete',phase:'initial',planId:'financial',message:'Eight of 20 is not most people. Why should I prioritize support access instead of paying athletes more? You can disagree with me.'},
 {label:'business: revised, no selection',role:'business',phase:'revised',planId:null,provisionalPlanId:'financial',message:'Keep the $75,000 in aid that is already committed and move $25,000 from payments to support for me. What is my current plan and budget?'}
];
const results=[];
const file=new URL('../../analysis/voice-pilot.json',import.meta.url);await mkdir(new URL('.',file),{recursive:true});
for(const turn of turns){
 await new Promise(resolve=>setTimeout(resolve,2500));
 const d=await call({action:'message',id:session.id,requestId:crypto.randomUUID(),...turn});assert.equal(typeof d.reply,'string');assert.ok(d.reply.trim());assert.ok(d.reply.split(/\s+/).length<=100);
 const result={...turn,reply:d.reply};results.push(result);console.log(JSON.stringify(result));
 await writeFile(file,JSON.stringify({at:new Date().toISOString(),complete:false,results},null,2));
}
const last=results.at(-1).reply;assert.match(last,/400,000/);assert.match(last,/Review revised plans/);assert.match(last,/no revised plan|haven.t.*(?:chosen|selected)|not.*selected/i);
await writeFile(file,JSON.stringify({at:new Date().toISOString(),complete:true,results},null,2));
console.log('PASS: five live turns, response bounds, revised-budget and no-selection guidance. Voice requires manual review.');
