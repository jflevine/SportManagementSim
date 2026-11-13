/* Private, server-verified assessment. No answer key or credential is bundled. */
(function(){'use strict';
const API='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-labor-v3';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const REQUEST_TIMEOUT_MS=30000,AUTOSAVE_DELAY_MS=1500;
let ctx=null,token='',record=null,busy=false,error='',notice='',uncertain=false,pendingWork=null;
let identity={name:'',email:'',attest:false},pendingStart=null,retryStartReady=false;
let autosaveTimer=null,autosavePaused=false,activeAction='',activeAutomatic=false,savedSignature=null,finalAttest=false,recoveryReview=false;
const $=id=>document.getElementById(id);
const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');
const submitted=()=>!!record?.receipt;
function collect(){
  if(!record||submitted()||!$('graded-form'))return;
  record.assessment.questions.forEach((q,i)=>{const c=document.querySelector(`input[name="mc-${i}"]:checked`);record.answers[i]=c?c.value:null;});
  if($('explanation'))record.explanation=$('explanation').value;
  const attest=document.querySelector('input[name="final-attest"]');if(attest)finalAttest=attest.checked;
}
function workOf(r=record,gameplay=ctx?.gameplay){return r?{answers:structuredClone(r.answers),explanation:r.explanation,gameplay:structuredClone(gameplay||{})}:null;}
function signature(work){return work?JSON.stringify([work.answers,work.explanation,work.gameplay]):null;}
function isDirty(){return !!record&&!submitted()&&signature(workOf())!==savedSignature;}
function payload(action){collect();return {action,revision:record.revision,...workOf(),...(action==='submit'?{attest:true}:{})};}
function clearAutosave(){if(autosaveTimer!==null){clearTimeout(autosaveTimer);autosaveTimer=null;}}
function saveStatus(){
  if(uncertain)return 'Save confirmation is missing. Keep this page open and check saved status before submitting.';
  if(busy&&activeAction==='saveDraft')return activeAutomatic?'Saving your draft… You can keep working while automatic saving finishes.':'Saving your draft. Keep this page open until saving is confirmed.';
  if(busy&&activeAction==='submit')return 'Submitting your assessment. Wait for the server-confirmed receipt.';
  if(recoveryReview)return 'Review your recovered answers, then choose Save draft or Submit assessment. Automatic saving is paused until you confirm them.';
  if(autosavePaused)return 'Automatic saving is paused. Keep this page open, download an answer backup, and use Save draft when the connection is ready.';
  return isDirty()?'Changes are waiting to be saved automatically.':'Draft saved on the server. Final submission is still required.';
}
function updateControls(){
  const status=$('save-status');if(status&&status.textContent!==saveStatus())status.textContent=saveStatus();
  const controls=document.querySelector('#graded-form .assessment-controls');if(controls)controls.disabled=busy&&!activeAutomatic;
  const save=document.querySelector('[data-grade="save"]');if(save)save.disabled=busy||uncertain;
  const submit=document.querySelector('#graded-form button[type="submit"]');if(submit)submit.disabled=busy||uncertain;
}
function scheduleAutosave(){
  clearAutosave();if(!isDirty()||busy||uncertain||autosavePaused)return;
  autosaveTimer=setTimeout(()=>{autosaveTimer=null;if(isDirty()&&!busy&&!uncertain&&!autosavePaused)run(payload('saveDraft'),{automatic:true});},AUTOSAVE_DELAY_MS);
  autosaveTimer?.unref?.();
}
function preserve(){collect();scheduleAutosave();updateControls();}
function beforeLeaving(e){
  collect();
  if(isDirty()||uncertain||(busy&&['start','saveDraft','submit'].includes(activeAction))){e.preventDefault();e.returnValue='';}
}
function shell(){return `<p class="eyebrow">Private graded submission · 10 points</p><h2 id="assessment-title" tabindex="-1">${submitted()?'Your recorded assessment':ctx.resumeOnly&&!record?'Resume or check your grade':'Show your applied understanding.'}</h2><p>Eight multiple-choice questions are worth 8 points. One brief explanation is worth 2. Your MC score is calculated on the server; your final total stays pending until the explanation is reviewed.</p><p class="fine">The earlier adviser choices are ungraded. A different lawful strategy can earn full writing credit. No deductions just for grammar, citation style, or recommending hard bargaining.</p>${error?`<div class="feedback caution" role="alert"><b>${uncertain?'Submission status needs checking.':'Action not completed.'}</b><p>${esc(error)}</p>${uncertain?`<button type="button" data-grade="check" ${busy?'disabled':''}>Check saved status</button>${retryStartReady?` <button type="button" data-grade="retry-start" ${busy?'disabled':''}>Retry starting with the same code</button>`:''}`:''}</div>`:''}${notice?`<p class="status" role="status">${esc(notice)}</p>`:''}`;}
function formStart(){return `${ctx.resumeOnly?`<section class="note" aria-label="First-time entry"><h3>Haven’t started yet?</h3><p>You do not need a resume code for a first visit. Return to the start, choose an adviser role and a client priority, then enter the bargaining room. Resume codes are created only when you begin the graded assessment.</p><button type="button" class="primary" data-action="reset" ${busy?'disabled':''}>First visit? Start the activity</button></section>`:''}<div class="grid"><form id="identity-form" class="card"><h3>Start your assessment</h3><p><b>Selected role:</b> ${esc(ctx.roleName)}. This role will be fixed for your one recorded attempt. Save and resume as needed before final submission.</p><label class="field" for="student-name"><b>Full name</b><input id="student-name" name="name" autocomplete="name" required minlength="2" maxlength="120" value="${esc(identity.name)}" ${busy||uncertain?'disabled':''}></label><label class="field" for="student-email"><b>La Salle email</b><input id="student-email" name="email" type="email" autocomplete="email" placeholder="you@lasalle.edu" required maxlength="150" value="${esc(identity.email)}" ${busy||uncertain?'disabled':''}></label><label class="consent"><input type="checkbox" name="attest" required ${identity.attest?'checked':''} ${busy||uncertain?'disabled':''}> I am submitting my own work and agree to save my name, email, role, answers, and explanation for course grading.</label><p class="fine">Identity is self-reported, not verified by a campus sign-in. Only you with your private code and authorized course staff can retrieve this attempt.</p><button class="primary" type="submit" ${busy||uncertain?'disabled':''}>${busy?'Connecting…':'Begin graded assessment'}</button></form><form id="resume-form" class="card"><h3>Continue or check your grade</h3><p>Already started? Use your private resume code. Do not start again after an uncertain connection.</p><label class="field" for="resume-code"><b>Private resume code</b><input id="resume-code" name="code" type="password" autocomplete="off" spellcheck="false" minlength="48" maxlength="48" required ${busy||uncertain?'disabled':''}></label><button type="submit" ${busy||uncertain?'disabled':''}>Resume saved attempt</button><p class="fine">Keep this code private. If you lost it, ask your instructor for recovery. The page does not store it in your browser between visits.</p></form></div>${token?codePanel():''}`;}
function codePanel(){return `<details class="resume-panel"><summary>Keep your private resume code</summary><div><p>This code retrieves your responses and grade. Save it privately before leaving. Do not post it in a group, public document, or URL.</p><label class="field" for="your-code"><b>Your resume code</b><input id="your-code" type="password" readonly value="${esc(token)}" autocomplete="off" spellcheck="false"></label><button type="button" data-grade="show-code">Show / hide code</button> <button type="button" data-grade="download-code">Download private resume slip</button><p class="fine">Only work confirmed saved or submitted can be recovered. Unsaved edits remain in this page.</p></div></details>`;}
function assessmentForm(){const a=record.assessment;return `<p><b>Student:</b> ${esc(record.name)} · ${esc(record.email)}<br><b>Role:</b> ${esc(record.role==='management'?'Management adviser':'Union adviser')}</p>${codePanel()}<p class="note">You may revise all answers before final submission. Feedback is shown only after the server records the submission. ${esc(a.attemptPolicyLabel||'One recorded attempt per student. You can save and resume before final submission; submitted answers are locked.')} Your draft saves automatically while you work. Wait for the saved confirmation before closing and keep your private resume code. Press <b>Submit assessment</b> when finished; a saved draft or downloaded backup is not a submission.</p><p id="save-status" class="status" role="status" aria-live="polite">${esc(saveStatus())}</p><button type="button" data-grade="download-backup">Download answer backup</button><form id="graded-form"><fieldset class="assessment-controls" aria-label="Assessment responses" ${busy&&!activeAutomatic?'disabled':''}>${a.questions.map((q,i)=>`<fieldset class="mc-question"><legend><span class="eyebrow">Question ${i+1} of ${a.questions.length} · 1 point</span>${esc(q.prompt)}</legend>${q.options.map(o=>`<label class="mc-option"><input type="radio" name="mc-${i}" value="${esc(o.id)}" ${record.answers[i]===o.id?'checked':''} required><span>${esc(o.text)}</span></label>`).join('')}</fieldset>`).join('')}<section class="brief"><h3>Brief explanation · 2 points</h3><p>${esc(a.explanationPrompt)}</p><p class="fine">Full credit recognizes an accurate relevant idea and a meaningful connection to a case fact, practical next step, and consequence. Partial understanding can earn partial credit. Plain language is welcome.</p><label class="field" for="explanation"><b>Your explanation</b><textarea id="explanation" name="explanation" rows="5" maxlength="1800" required>${esc(record.explanation)}</textarea></label><p id="word-count" class="fine">${words(record.explanation)} words · Target 40–80; minimum ${a.explanationMinWords||20} to prevent empty submissions.</p></section><label class="consent"><input type="checkbox" name="final-attest" required ${finalAttest?'checked':''}> I have reviewed my answers. I understand final submission records this work and the writing score will be added only after review.</label><div class="nav"><button type="button" data-grade="save" ${busy||uncertain?'disabled':''}>Save draft</button><button type="submit" class="primary" ${busy||uncertain?'disabled':''}>${busy&&!activeAutomatic?'Saving…':'Submit assessment'}</button></div></fieldset></form>`;}
function receipt(){const a=record.assessment;return `<section class="feedback"><p class="eyebrow">Server-confirmed submission</p><h3>${record.reviewed?'Reviewed total available':'Submitted · Writing review pending'}</h3><p><b>Receipt:</b> ${esc(record.receipt)}<br><b>Recorded:</b> ${esc(record.submittedAt)}<br><b>Student:</b> ${esc(record.name)}<br><b>Role:</b> ${esc(record.role==='management'?'Management adviser':'Union adviser')}</p><p><b>Multiple choice:</b> ${record.mcScore} / ${a.mcMax}<br><b>Written explanation:</b> ${record.reviewed?`${record.writingScore} / ${a.writingMax}`:'Pending review'}<br><b>Final total:</b> ${record.reviewed?`${record.finalScore} / ${a.maxPoints}`:'Pending, not zero'}</p>${record.reviewed&&record.graderNotes?`<p><b>Writing feedback:</b> ${esc(record.graderNotes)}</p>`:''}<p>Your recorded answers cannot be edited here. A receipt confirms submission; a local file alone does not.</p><div class="nav"><button type="button" data-grade="check" ${busy?'disabled':''}>Refresh review status</button><button type="button" data-grade="download-receipt">Download receipt and responses</button><button type="button" data-grade="print">Print receipt</button></div></section>${codePanel()}<h3>Your explanation</h3><p class="student-writing">${esc(record.explanation)}</p><h3>MC feedback</h3>${a.questions.map((q,i)=>{const f=(record.feedback||[]).find(x=>x.questionId===q.id),selected=q.options.find(o=>o.id===record.answers[i]);return `<article class="card question-feedback"><h3>${i+1}. ${esc(q.prompt)}</h3><p><b>Your choice:</b> ${esc(selected?.text||'Not recorded')}<br><b>Points:</b> ${f?.earned??'—'} / 1</p><p>${esc(f?.why||'Feedback unavailable; refresh status.')}</p></article>`;}).join('')}`;}
function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean).length;}
function render(){if(!$('assessment-host'))return;$('assessment-host').innerHTML=shell()+(record?(submitted()?receipt():assessmentForm()):formStart());if(ctx.resumeOnly&&!record){const f=$('identity-form');if(f)f.remove();}}
async function request(body,attemptToken){
  const controller=typeof AbortController==='function'?new AbortController():null;
  let timer;
  const operation=(async()=>{
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-attempt-token':attemptToken},body:JSON.stringify(body),cache:'no-store',...(controller?{signal:controller.signal}:{})});
    let data;try{data=await response.json();}catch{throw new Error('The server returned an unreadable response. Keep this page open and check saved status before retrying.');}
    if(!response.ok){const e=new Error(data.error||'The request was not completed.');e.code=data.code;e.http=response.status;throw e;}
    if(!data.ok||!data.assessment)throw new Error('The response did not confirm a saved attempt.');
    if(body.action==='submit'&&(!data.receipt||!data.submittedAt))throw new Error('The response did not confirm a submission receipt. Check saved status before retrying.');
    return data;
  })();
  // Cover the entire exchange, including a stalled response body. Aborting does not prove
  // the server failed to commit; recovery must check the same attempt before another write.
  const deadline=new Promise((resolve,reject)=>{timer=setTimeout(()=>{
    const e=new Error('The connection did not confirm a result within 30 seconds. Your work is still on this page. Keep it open, save your private code, and check saved status before retrying.');e.code='TIMEOUT';reject(e);controller?.abort();
  },REQUEST_TIMEOUT_MS);timer?.unref?.();});
  try{return await Promise.race([operation,deadline]);}finally{clearTimeout(timer);}
}
async function run(body,{automatic=false}={}){
  if(busy)return;
  const write=['start','saveDraft','submit'].includes(body.action);
  if(write&&uncertain&&!(body.action==='start'&&retryStartReady))return;
  collect();clearAutosave();body=structuredClone(body);
  const attemptToken=token,wasUncertain=uncertain;
  busy=true;activeAction=body.action;activeAutomatic=automatic;error='';notice='';retryStartReady=false;
  if(body.action==='start')pendingStart={token:attemptToken,body:structuredClone(body)};
  if(['submit','saveDraft'].includes(body.action)&&record)pendingWork={id:record.id,token:attemptToken,...workOf()};
  if(automatic)updateControls();else render();
  try{
    const result=await request(body,attemptToken);
    collect();
    const latest=record&&record.id===result.id?workOf():pendingWork?.id===result.id&&pendingWork.token===attemptToken?workOf(pendingWork,pendingWork.gameplay):null;
    const confirmedSignature=signature(workOf(result,result.gameplay));
    const sent=body.answers?{answers:body.answers,explanation:body.explanation,gameplay:body.gameplay}:null;
    const hasPendingLocal=latest&&(signature(latest)!==savedSignature||(pendingWork?.id===result.id&&pendingWork.token===attemptToken));
    const keepLocal=!result.receipt&&latest&&((body.action==='resume'&&hasPendingLocal)||(['saveDraft','submit'].includes(body.action)&&signature(latest)!==signature(sent)));
    let restored=false;
    if(keepLocal&&signature(latest)!==confirmedSignature){Object.assign(result,latest);restored=true;}
    record=result;savedSignature=confirmedSignature;ctx.role=result.role;
    if(result.gameplay&&Object.keys(result.gameplay).length)ctx.gameplay=result.gameplay;
    pendingStart=null;uncertain=false;recoveryReview=restored&&body.action==='resume';autosavePaused=recoveryReview;
    pendingWork=isDirty()?{id:record.id,token:attemptToken,...workOf()}:null;
    notice=body.action==='saveDraft'?'Draft saved on the server. It has not been submitted.':body.action==='submit'?'Your submission is confirmed by the receipt below.':body.action==='resume'?'Saved status retrieved.':'';
    if(restored&&body.action==='resume')notice='The saved draft differs from the work on this page. Your unsaved answers and explanation have been kept here. Review them, then Save draft or Submit assessment.';
    ctx.onRole?.(record.role,ctx.gameplay);
  }catch(e){
    collect();if(record&&!submitted())pendingWork={id:record.id,token:attemptToken,...workOf()};
    error=e.message;autosavePaused=true;
    uncertain=wasUncertain||(write&&(!e.http||e.http>=500))||(e.http===409&&!!record);
    if(body.action==='start'&&e.http>=400&&e.http<500&&!record&&!wasUncertain){
      token='';pendingStart=null;pendingWork=null;uncertain=false;
      if(e.code==='ATTEMPT_EXISTS')error='An attempt already exists for that email. Use the private resume code from your original still-open page or saved slip, or ask your instructor for recovery. No new attempt was created.';
    }
    if(body.action==='resume'&&wasUncertain&&!record&&pendingStart?.token===attemptToken&&(e.http===401||e.http===404)){
      retryStartReady=true;uncertain=true;
      error='The server has not found a saved attempt for this code. Retry starting with the same code below. Your name and email have been kept; do not create a different attempt.';
    }else if(e.http===409&&record)error+=' Check saved status before making another change.';
  }finally{
    busy=false;activeAction='';activeAutomatic=false;
    if(automatic&&!error&&!submitted())updateControls();else{render();if(!automatic)$('assessment-title')?.focus();}
    scheduleAutosave();
  }
}
function backupText(){
  collect();return `Pixel Forge · UNSUBMITTED ANSWER BACKUP\nThis is a local copy, not a submission receipt. Give this file to your instructor if your connection prevents submission.\nBackup created: ${new Date().toISOString()}\nStudent: ${record.name}\nEmail: ${record.email}\nRole: ${record.role}\n\n${record.assessment.questions.map((q,i)=>`${i+1}. ${q.prompt}\nSelected: ${q.options.find(o=>o.id===record.answers[i])?.text||'Not answered'}`).join('\n\n')}\n\nExplanation:\n${record.explanation}\n`;
}
function download(name,text){const u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function receiptText(){return `Pixel Forge · Recorded assessment\nReceipt: ${record.receipt}\nRecorded: ${record.submittedAt}\nStudent: ${record.name}\nEmail: ${record.email}\nRole: ${record.role}\nMC: ${record.mcScore}/${record.assessment.mcMax}\nWriting: ${record.reviewed?record.writingScore+'/'+record.assessment.writingMax:'PENDING REVIEW'}\nFinal: ${record.reviewed?record.finalScore+'/'+record.assessment.maxPoints:'PENDING REVIEW, NOT ZERO'}\n\n${record.assessment.questions.map((q,i)=>`${i+1}. ${q.prompt}\nSelected: ${q.options.find(o=>o.id===record.answers[i])?.text||''}\nFeedback: ${(record.feedback||[]).find(f=>f.questionId===q.id)?.why||''}`).join('\n\n')}\n\nExplanation:\n${record.explanation}\n\nWriting feedback: ${record.graderNotes||'Pending'}\n`;}
document.addEventListener('submit',e=>{
  if(!['identity-form','resume-form','graded-form'].includes(e.target.id))return;
  e.preventDefault();if(busy||uncertain)return;
  if(e.target.id==='identity-form'){
    const fd=new FormData(e.target);identity={name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim(),attest:true};
    if(!/^[^\s@]+@lasalle\.edu$/i.test(identity.email)){error='Please use your La Salle email address.';render();return;}
    if(!token)token=newToken();run({action:'start',name:identity.name,email:identity.email,role:ctx.role,attest:true});
  }else if(e.target.id==='resume-form'){
    const fd=new FormData(e.target),code=String(fd.get('code')||'').trim().toLowerCase();
    if(!/^[a-f0-9]{48}$/.test(code)){error='Enter the complete 48-character resume code.';render();return;}
    token=code;run({action:'resume'});
  }else{
    collect();if(words(record.explanation)<(record.assessment.explanationMinWords||20)){error='Please add a little more explanation to show the idea you are applying.';render();$('explanation')?.focus();return;}
    if(!confirm('Submit this assessment? The server will record and lock these answers. The final grade stays pending until your explanation is reviewed.'))return;
    run(payload('submit'));
  }
});
document.addEventListener('input',e=>{
  if(e.target.closest('#identity-form')){
    if(e.target.name==='name'||e.target.name==='email')identity[e.target.name]=e.target.value;
    if(e.target.name==='attest')identity.attest=e.target.checked;
  }
  if(e.target.closest('#graded-form')){
    collect();if($('word-count'))$('word-count').textContent=`${words(record.explanation)} words · Target 40–80; minimum ${record.assessment.explanationMinWords||20}.`;
    updateControls();scheduleAutosave();
  }
});
window.addEventListener?.('beforeunload',beforeLeaving);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'&&isDirty()&&!busy&&!uncertain&&!autosavePaused){clearAutosave();run(payload('saveDraft'),{automatic:true});}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-grade]');if(!b||b.disabled)return;const act=b.dataset.grade;if(act==='show-code')$('your-code').type=$('your-code').type==='password'?'text':'password';else if(act==='download-code')download('Pixel-Forge-PRIVATE-resume.txt',`PRIVATE · Keep secure. Do not post or share publicly.\nPixel Forge resume code: ${token}\nReturn to https://jflevine.github.io/SportManagementSim/spm370/labor-relations-decision-lab/ and choose Resume saved attempt.\nOnly server-confirmed saved/submitted work can be recovered.\n`);else if(act==='download-backup'&&record&&!submitted())download('Pixel-Forge-UNSUBMITTED-answers.txt',backupText());else if(act==='retry-start'&&retryStartReady&&pendingStart?.token===token)run(pendingStart.body);else if(act==='save'&&record&&!submitted())run(payload('saveDraft'));else if(act==='check')run({action:'resume'});else if(act==='download-receipt'&&submitted())download('Pixel-Forge-submission-receipt.txt',receiptText());else if(act==='print'&&submitted()){const output=$('print-output');output.innerHTML=`<h1>Pixel Forge · Submission receipt</h1><pre class="receipt-print">${esc(receiptText())}</pre>`;output.classList.remove('hidden');window.print();}});
window.LAB_ASSESS={mount(options){ctx=options;render();},preserve,hasAttempt:()=>!!record,hasWork:()=>!!token,canReset(){return !record||submitted();},openResume(options){ctx=options;render();document.querySelector('#resume-form input')?.focus();},state:()=>({record:record?structuredClone(record):null,busy,uncertain,dirty:isDirty()}),forget(){clearAutosave();token='';record=null;error='';notice='';uncertain=false;pendingWork=null;pendingStart=null;retryStartReady=false;identity={name:'',email:'',attest:false};savedSignature=null;autosavePaused=false;finalAttest=false;recoveryReview=false;},receiptText};
})();

