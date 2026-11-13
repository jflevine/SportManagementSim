const test=require('node:test');
const assert=require('node:assert/strict');
const {createHarness}=require('./reliability-harness.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));
const answerValues=h=>plain(h.state().record.answers);
const latestRow=h=>[...h.store.rows.values()][0];

test('timeout bounds a never-settling start, preserves identity, and reconciles before same-token retry',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());
 h.faults.push({action:'start',kind:'never-fetch'});
 await h.begin();
 assert.equal(h.state().busy,true);
 assert.equal(h.dom.getElementById('student-name').value,'Synthetic Reliability','connecting render must retain name');
 assert.equal(h.dom.getElementById('student-email').value,'synthetic-management@lasalle.edu','connecting render must retain email');
 assert(h.beforeUnload(),'unresolved start should warn before leaving');
 const originalToken=h.calls[0].token;
 await h.clock.advance(30001);
 assert.equal(h.state().busy,false,'request must release controls within timeout');
 assert.equal(h.state().uncertain,true,'timeout is unknown status, not confirmed failure');
 assert.equal(h.store.rows.size,0);
 const before=h.calls.length;
 await h.submit('identity-form');
 assert.equal(h.calls.length,before,'do not start again until saved status is checked');
 await h.click('check');
 assert.equal(h.calls.at(-1).body.action,'resume');
 assert.equal(h.calls.at(-1).token,originalToken);
 assert.equal(h.calls.at(-1).status,401,'no committed attempt in this synthetic fault');
 await h.click('retry-start');
 assert.equal(h.calls.at(-1).body.action,'start');
 assert.equal(h.calls.at(-1).token,originalToken,'safe retry must retain original attempt token');
 assert.equal(h.store.rows.size,1);
 assert.equal(h.state().record.name,'Synthetic Reliability');
});

test('timeout includes response body decoding and finds a start committed before its body stalled',async(t)=>{
 const h=await createHarness('union');t.after(()=>h.dispose());
 h.faults.push({action:'start',kind:'never-body'});await h.begin();
 assert.equal(h.store.rows.size,1,'server committed the synthetic start');
 const id=latestRow(h).id,token=h.calls[0].token;
 await h.clock.advance(30001);
 assert.equal(h.state().busy,false,'json body must be covered by timeout');
 assert.equal(h.state().uncertain,true);
 await h.click('check');
 assert.equal(h.state().record.id,id);
 assert.equal(h.calls.at(-1).token,token);
 assert.equal(h.store.rows.size,1);
 assert.equal(h.calls.filter(x=>x.body.action==='start').length,1);
});

test('lost successful submit response recovers original receipt without another write or attempt',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 h.faults.push({action:'submit',kind:'lost-after-commit'});await h.submit('graded-form');
 const row=latestRow(h),receipt=row.receipt;
 assert(receipt&&row.submitted_at);
 assert.equal(h.state().uncertain,true);
 assert.equal(h.state().record.receipt,null);
 const count=h.calls.length;
 await h.submit('graded-form');
 assert.equal(h.calls.length,count,'uncertain submission must block repeated write until status check');
 await h.click('check');
 assert.equal(h.state().record.receipt,receipt);
 assert.equal(h.state().record.mcScore,8);
 assert.equal(h.state().record.finalScore,null);
 assert.equal(h.store.rows.size,1);
 assert.equal(h.calls.filter(x=>x.body.action==='submit').length,1);
 assert(!h.beforeUnload(),'confirmed immutable receipt has no unsaved writing');
});

test('uncommitted submit timeout preserves work after status returns an older blank draft',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 const expected=answerValues(h),text=h.dom.getElementById('explanation').value;
 h.faults.push({action:'submit',kind:'never-fetch'});await h.submit('graded-form');
 await h.clock.advance(30001);
 assert.equal(h.state().busy,false);
 assert.equal(h.state().uncertain,true);
 assert.equal(latestRow(h).submitted_at,null);
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,text);
 assert.deepEqual(answerValues(h),expected);
 assert(h.beforeUnload(),'recovered local edits are not yet saved');
 await h.submit('graded-form');
 assert(h.state().record.receipt);
 assert.equal(latestRow(h).explanation,text);
 assert.deepEqual(latestRow(h).answers,expected);
 assert.equal(h.store.rows.size,1);
});

test('autosave keeps newer typing and a changed answer when an older save response arrives',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 const older=h.dom.getElementById('explanation').value;
 h.faults.push({action:'saveDraft',kind:'hold-after-commit'});
 await h.clock.advance(1600);
 assert.equal(h.calls.at(-1).body.action,'saveDraft','editing should trigger a debounced server draft');
 assert.equal(latestRow(h).explanation,older);
 assert(!/class="assessment-controls"[^>]*\sdisabled/.test(h.dom.host.innerHTML),'autosave must allow further input');
 const newer=older+' A later edit adds a distinct practical concern.';
 h.change('explanation',newer);h.choose(0,'b');
 const held=h.pending.find(p=>p.action==='saveDraft'&&p.release);assert(held);held.release();await h.flush();
 assert.equal(h.dom.getElementById('explanation').value,newer,'old response must not overwrite new typing');
 assert.equal(h.state().record.answers[0],'b');
 assert(h.beforeUnload(),'newer changes remain unsaved after old response');
 await h.clock.advance(1700);
 assert.equal(latestRow(h).explanation,newer);
 assert.equal(latestRow(h).answers[0],'b');
 assert(h.calls.filter(c=>c.body.action==='saveDraft').length>=2,'follow-up save must persist newer work');
 assert.equal(latestRow(h).submitted_at,null);
 assert.equal(latestRow(h).mc_score,null);
 assert.equal(latestRow(h).writing_score,null);
 assert(!h.beforeUnload(),'matching confirmed draft needs no warning');
});

test('beforeunload guard distinguishes clean saved work, dirty work, unresolved writes, and receipt',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();
 await h.clock.advance(1600);
 assert(!h.beforeUnload(),'initial practice context is clean after its first autosave');
 h.fill();assert(h.beforeUnload(),'typed work is initially unsaved');
 await h.clock.advance(1600);
 assert(!h.beforeUnload(),'successful autosave clears dirty guard');
 const changed=h.answerText+' Another synthetic editing sentence.';
 h.change('explanation',changed);
 h.faults.push({action:'saveDraft',kind:'never-fetch'});
 await h.clock.advance(1600);
 assert(h.beforeUnload(),'in-flight draft must warn');
 await h.clock.advance(30001);
 assert(h.beforeUnload(),'uncertain write must still warn');
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,changed);
 assert(h.beforeUnload(),'local changes are newer than recovered server draft');
 await h.click('save');
 assert(!h.beforeUnload(),'explicit confirmed save clears guard');
 await h.submit('graded-form');
 assert(h.state().record.receipt);
 assert(!h.beforeUnload(),'confirmed receipt should not warn');
});

test('status failure retains uncertainty and blocks writes until a successful status reconciliation',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 h.faults.push({action:'submit',kind:'503'});await h.submit('graded-form');
 assert.equal(h.state().uncertain,true);
 h.faults.push({action:'resume',kind:'503'});await h.click('check');
 assert.equal(h.state().uncertain,true,'failed status check must not clear unknown write status');
 const before=h.calls.length;await h.forceClick('save');await h.submit('graded-form');
 assert.equal(h.calls.length,before,'all write actions remain blocked while status unresolved');
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,h.answerText);
 await h.submit('graded-form');
 assert(h.state().record.receipt);
});

test('rejected start keeps entered identity available for recovery',async(t)=>{
 const h=await createHarness('union');t.after(()=>h.dispose());
 h.faults.push({action:'start',kind:'503'});await h.begin();
 assert.equal(h.state().busy,false);
 assert.equal(h.state().uncertain,true);
 assert.equal(h.dom.getElementById('student-name').value,'Synthetic Reliability');
 assert.equal(h.dom.getElementById('student-email').value,'synthetic-union@lasalle.edu');
});
test('new edits made during a hung autosave survive timeout and status recovery',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 h.faults.push({action:'saveDraft',kind:'never-fetch'});
 await h.clock.advance(1600);
 const newer=h.answerText+' A newer sentence typed while the save is still pending.';
 h.change('explanation',newer);h.choose(1,'a');
 await h.clock.advance(30001);
 assert.equal(h.state().uncertain,true);
 assert.equal(h.dom.getElementById('explanation').value,newer);
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,newer,'recovery must prefer latest typing over request snapshot');
 assert.equal(h.state().record.answers[1],'a');
 await h.click('save');
 assert.equal(latestRow(h).explanation,newer);
 assert.equal(latestRow(h).answers[1],'a');
});

test('a very late save response cannot overwrite recovered and subsequently saved newer edits',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 h.faults.push({action:'saveDraft',kind:'hold-after-commit'});
 await h.clock.advance(1600);
 const held=h.pending.find(p=>p.action==='saveDraft'&&p.release);assert(held);
 const newer=h.answerText+' This revision was typed after the first autosave started.';
 h.change('explanation',newer);await h.clock.advance(30001);
 assert.equal(h.state().uncertain,true);
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,newer);
 await h.click('save');
 const revision=h.state().record.revision;
 assert.equal(latestRow(h).explanation,newer);
 held.release();await h.flush();
 assert.equal(h.dom.getElementById('explanation').value,newer);
 assert.equal(h.state().record.revision,revision);
 assert.equal(h.state().record.explanation,newer);
});

test('reconciling different local and server drafts pauses autosave until explicit review',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();await h.clock.advance(1600);
 h.fill();const local=h.answerText,localAnswers=answerValues(h),row=latestRow(h);
 const remote='Synthetic work saved in another tab after this page last confirmed its draft. Keep this separate revision safe until the student chooses what to save.';
 const remoteAnswers=Array(8).fill('b');
 await h.store.change(row.id,row.revision,'saveDraft',{answers:remoteAnswers,explanation:remote,gameplay:row.gameplay});
 // Simulate a revision conflict before reconciling through the visible recovery button.
 await h.click('save');
 assert.equal(h.calls.at(-1).status,409);
 assert.equal(h.state().uncertain,true);
 await h.click('check');
 assert.equal(h.dom.getElementById('explanation').value,local,'status recovery retains local unsaved writing');
 assert.deepEqual(answerValues(h),localAnswers);
 assert.match(h.dom.host.innerHTML,/saved draft differs from the work on this page/);
 assert.match(h.dom.host.innerHTML,/Automatic saving is paused until you confirm/);
 const callCount=h.calls.length;
 await h.clock.advance(6000);
 assert.equal(h.calls.length,callCount,'recovery must not silently overwrite another tab');
 assert.equal(latestRow(h).explanation,remote);
 assert(h.beforeUnload());
 await h.click('save');
 assert.equal(latestRow(h).explanation,local,'explicit reviewed save uses latest server revision');
 assert.deepEqual(latestRow(h).answers,localAnswers);
 assert(!h.beforeUnload());
});

test('a clean resumed page adopts newer server work without restoring stale local responses',async(t)=>{
 const h=await createHarness('union');t.after(()=>h.dispose());await h.begin();h.fill();await h.clock.advance(1600);
 assert(!h.state().dirty);
 const row=latestRow(h),remote=h.answerText+' A different tab saved this additional sentence.';
 const remoteAnswers=Array(8).fill('b');
 await h.store.change(row.id,row.revision,'saveDraft',{answers:remoteAnswers,explanation:remote,gameplay:row.gameplay});
 // Invoke the same delegated check action without altering local answer fields.
 await h.forceClick('check');
 assert.equal(h.dom.getElementById('explanation').value,remote);
 assert.deepEqual(answerValues(h),remoteAnswers);
 assert(!h.state().dirty);
 assert(!h.beforeUnload());
 const callCount=h.calls.length;await h.clock.advance(6000);
 assert.equal(h.calls.length,callCount,'a clean resumed draft needs no redundant write');
});

test('answer backup preserves work while excluding resume tokens, receipts, and answer keys',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());await h.begin();h.fill();
 const calls=h.calls.length;await h.click('download-backup');
 assert.equal(h.calls.length,calls,'backup does not create or submit a server record');
 assert.equal(h.downloads.length,1);
 const file=h.downloads[0],text=await file.blob.text();
 assert.equal(file.name,'Pixel-Forge-UNSUBMITTED-answers.txt');
 assert.match(text,/UNSUBMITTED ANSWER BACKUP/);
 assert.match(text,/not a submission receipt/);
 assert(text.includes(h.answerText));
 assert(text.includes('Synthetic Reliability'));
 assert(text.includes('synthetic-management@lasalle.edu'));
 assert(text.includes('1. Synthetic item 1\nSelected: Test option A'));
 assert(!text.includes(h.calls[0].token),'backup must not embed the private resume token');
 assert(!/\bReceipt:|answer\s*key|correct\s*answer|Synthetic feedback/i.test(text),'backup must not imply confirmation or reveal answer feedback');
 assert.equal(latestRow(h).receipt,null);
 assert.equal(latestRow(h).submitted_at,null);
 assert(h.beforeUnload(),'downloading a local backup does not mark work saved');
});

test('a rate-limited same-code retry cannot discard an earlier unresolved start token',async(t)=>{
 const h=await createHarness();t.after(()=>h.dispose());
 h.faults.push({action:'start',kind:'never-fetch'});await h.begin();
 const token=h.calls[0].token;
 await h.clock.advance(30001);await h.click('check');
 assert.equal(h.calls.at(-1).status,401);
 // The backend rate limit runs before token lookup. This rejection of the retry
 // cannot establish whether the original delayed start will eventually commit.
 h.faults.push({action:'start',kind:'429'});await h.click('retry-start');
 assert.equal(h.calls.at(-1).status,429);
 assert.equal(h.state().uncertain,true,'a rejected retry must retain the original unresolved status');
 assert.equal(h.dom.getElementById('your-code')?.value,token,'keep the code that can retrieve a late commit');
 const calls=h.calls.length;await h.submit('identity-form');
 assert.equal(h.calls.length,calls,'do not permit a fresh-token attempt while the original remains unresolved');
 await h.click('check');
 assert.equal(h.calls.at(-1).token,token,'reconciliation must still address the original attempt');
});

