import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createHandler,hash} from './v3-server.mjs';
globalThis.crypto??=webcrypto;
const assessment={title:'Synthetic test',version:'3.0.0',maxPoints:20,rubric:{notes:'note rubric',brief:'brief rubric',noteGuidance:['private guidance']},stages:Array.from({length:6},(_,i)=>({title:'Stage '+i,questions:[0,1].map(()=>({prompt:'Synthetic question',options:['wrong','right','other','fourth'],answer:1,why:'Private explanation'}))}))};
const note='This synthetic case note identifies a relevant contract concept and connects it with facts and a practical step.';
const brief=Array(110).fill('synthetic').join(' ');
async function setup(){
 const rows=[],settings={is_open:true,assessment:structuredClone(assessment)};
 const store={settings:async()=>settings,setOpen:async v=>{settings.is_open=v;},limit:async()=>true,byToken:async t=>rows.find(r=>r.token_hash===t),byEmail:async e=>rows.find(r=>r.email===e),byId:async id=>rows.find(r=>r.id===id),list:async()=>rows.map(({token_hash,...r})=>r),insert:async data=>{const r={...data,id:crypto.randomUUID(),created_at:new Date().toISOString(),revision:0,stage_answers:Array(6).fill(null),notes:Array(6).fill(''),final_decision:'',final_brief:'',submitted_at:null,receipt:null,mc_score:0,note_scores:null,brief_score:null,grader_notes:'',reviewed_at:null};rows.push(r);return structuredClone(r);},update:async(id,revision,patch)=>{const r=rows.find(r=>r.id===id&&r.revision===revision);if(!r)return null;Object.assign(r,structuredClone(patch),{revision:revision+1});return structuredClone(r);}};
 const handler=createHandler({store,instructorKeyHash:await hash('private-test-key'),rateSecret:'test-rate-secret'});
 const token='a'.repeat(48);
 async function call(body,opts={}){const admin=opts.admin===true,req=new Request('https://example.invalid/function'+(admin?'/instructor':''),{method:opts.method||'POST',headers:{'Content-Type':'application/json',...(opts.noAuth?{}:admin?{'x-instructor-key':opts.key||'private-test-key'}:{'x-attempt-token':opts.token||token}),...(opts.origin?{Origin:opts.origin}:{})},...(opts.method==='GET'?{}:{body:JSON.stringify(body)})});const r=await handler(req);return {status:r.status,body:await r.json()};}
 const start=()=>call({action:'start',name:'Synthetic Student',email:'synthetic@lasalle.edu',attest:true});
 return {call,start,rows,settings,token};
}
test('Scored path, immutable MC, pending writing, semantic grades, duplicate receipt, and recovery',async()=>{
 const {call,start,rows,token}=await setup();let r=(await start()).body;
 assert.equal(r.mcScore,0);assert.equal(r.finalScore,null);assert.ok(!JSON.stringify(r).includes('Private explanation'));assert.ok(!JSON.stringify(r).includes('private guidance'));assert.ok(!('answer' in r.assessment.stages[0].questions[0]));assert.equal(r.feedback[0],null);
 assert.equal((await call({action:'lockStage',stage:1,answers:[1,1],revision:0})).status,409);
 assert.equal((await call({action:'saveNote',stage:0,note,revision:0})).status,409);
 r=(await call({action:'lockStage',stage:0,answers:[0,1],revision:r.revision})).body;
 assert.equal(r.mcScore,1);assert.equal(r.feedback[0][0].correct,1);assert.equal(r.feedback[1],null);
 let duplicate=await call({action:'lockStage',stage:0,answers:[1,1],revision:0});assert.equal(duplicate.body.mcScore,1);assert.deepEqual(duplicate.body.stageAnswers[0],[0,1]);
 assert.equal((await call({action:'saveNote',stage:0,note:'short',revision:r.revision})).status,400);
 assert.equal((await call({action:'saveNote',stage:0,note,revision:0})).status,409);
 for(let i=0;i<6;i++){if(i)r=(await call({action:'lockStage',stage:i,answers:[1,1],revision:r.revision})).body;r=(await call({action:'saveNote',stage:i,note,revision:r.revision})).body;}
 assert.equal(r.mcScore,11);assert.equal((await call({action:'submit',decision:'Decline this draft',brief:'short',attest:true,revision:r.revision})).status,400);
 const submit={action:'submit',decision:'Revise before signing',brief,attest:true,revision:r.revision};r=(await call(submit)).body;
 assert.ok(r.receipt.startsWith('LLC3-'));assert.equal(r.finalScore,null);assert.equal(r.writingScore,null);assert.equal(rows[0].notes.length,6);
 assert.equal((await call(submit)).body.receipt,r.receipt);assert.equal((await call({action:'saveNote',stage:0,note:'changed',revision:r.revision})).body.notes[0],note);
 const list=(await call(null,{admin:true,method:'GET'})).body;assert.equal(list.submissions.length,1);assert.ok(!JSON.stringify(list).includes(await hash(token)));
 const grading={action:'grade',id:r.id,revision:r.revision,noteScores:[1,1,.5,1,1,1],briefScore:1.5,notes:'Synthetic semantic review.'};
 assert.equal((await call({...grading,noteScores:[1,1,1,1,1,1.5]},{admin:true})).status,400);
 const grade=(await call(grading,{admin:true})).body;assert.equal(grade.score.writingScore,7);assert.equal(grade.score.finalScore,18);assert.equal(grade.score.reviewed,true);
 r=(await call({action:'resume'})).body;assert.equal(r.finalScore,18);assert.equal(r.receipt,(await call(submit)).body.receipt);
 const recovered=(await call({action:'recover',id:r.id,revision:r.revision},{admin:true})).body;assert.equal(recovered.recoveryCode.length,48);assert.equal((await call({action:'resume'})).status,401);assert.equal((await call({action:'resume'},{token:recovered.recoveryCode})).body.finalScore,18);
});
test('Authorization, self-reported identity validation, duplicate email, and closure',async()=>{
 const {call,start,settings}=await setup();assert.equal((await call({action:'resume'},{noAuth:true})).status,401);assert.equal((await call(null,{admin:true,method:'GET',key:'wrong'})).status,401);assert.equal((await call({action:'start'},{origin:'https://unrelated.example'})).status,403);
 assert.equal((await call({action:'start',name:'Person',email:'person@example.com',attest:true})).status,400);
 const r=(await start()).body;assert.equal((await start()).body.id,r.id);assert.equal((await call({action:'start',name:'Other',email:'synthetic@lasalle.edu',attest:true},{token:'b'.repeat(48)})).status,409);
 assert.equal((await call({action:'grade',id:r.id,revision:r.revision,noteScores:[1,1,1,1,1,1],briefScore:2,notes:''},{admin:true})).status,400);
 await call({action:'setOpen',isOpen:false},{admin:true});assert.equal(settings.is_open,false);assert.equal((await call({action:'resume'})).status,200);assert.equal((await call({action:'lockStage',stage:0,answers:[1,1],revision:r.revision})).status,403);
});
