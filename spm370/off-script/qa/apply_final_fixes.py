"""One-time, guarded final-QA patch. Does not access student records or credentials."""
from pathlib import Path
import hashlib

p=Path('spm370/off-script/index.html')
text=p.read_text()
original_blob=hashlib.sha1(b'blob '+str(len(text.encode())).encode()+b'\0'+text.encode()).hexdigest()
if 'Build 2.0.1.' in text:
    print('Final QA fixes already applied.');raise SystemExit(0)
assert original_blob=='8cbfaed23af3e1d3419052951cbbc00b04c8c0cf', 'Source changed: review before applying this patch.'

def replace(old,new):
    global text
    assert text.count(old)==1, 'Unexpected source match: '+old[:90]
    text=text.replace(old,new)

def function(prefix,new):
    global text
    found=[line for line in text.splitlines() if line.startswith(prefix)]
    assert len(found)==1, prefix
    replace(found[0],new)

replace('<a href="?guide=1">Instructor guide</a>', '<a href="?guide=1" target="_blank" rel="noopener">Instructor guide <span class="small">(new tab)</span></a>')
replace('Build 2.0.0.', 'Build 2.0.1.')
replace('Instructor guide · Simplified edition 2.0.0', 'Instructor guide · Simplified edition 2.0.1')
replace('You are interpreting the existing permission—not deciding a lawsuit.', 'Treat the supplied agreement as valid. You are identifying what it permits—not deciding a lawsuit or testing contract-formation rules.')
replace('Your client’s instructions remain the same.</p></div><p class="tag">', 'Your client’s instructions remain the same. Answer the final AI-license check even if you recommend a non-AI option.</p></div><p class="tag">')
replace("let s=fresh(),storageOK=true,busy=false,rows=[],access='',selected=null;", "let s=fresh(),storageOK=true,busy=false,rows=[],access='',selected=null,gradeDirty=false,gradeBusy=false;")
function('function banner()', '''function banner(){return (DEMO?'<div class="notice">Instructor demo · separate browser save · no student submission will be sent. <button class="btn link" data-act="reset-demo">Restart demo</button></div>':'')+(!storageOK?'<div class="notice">Browser saving is unavailable. Keep this tab open and save your summary before leaving. <button class="btn link" data-act="download">Save a backup now</button></div>':'');}''')
function('function total(', "function total(a=s.answers){return QUESTIONS.reduce((v,q,i)=>v+(a?.[i]===q.correct?2:0),0);}")
function('async function submit()', r'''// AbortController supports browsers that lack AbortSignal.timeout. Keep the
// timeout active while reading JSON, not just until response headers arrive.
async function apiRequest(url,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    let data;
    try{data=await response.json();}catch(error){
      if(controller.signal.aborted)throw error;
      throw Error('The server response could not be confirmed. Keep your work and retry.');
    }
    return {response,data};
  }finally{clearTimeout(timer);}
}
async function submit(){
  if(DEMO||busy||s.receipt)return;
  if(!s.pending){
    if(!s.firstName.trim()||!s.lastName.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())||!s.consent||!gate([0,1,2,3,4])||!ROUTES[s.route]||!FINAL[s.final]||s.reflections.some(t=>t.trim().length<30)){
      flash('Complete your name, email, five checked answers, choices, and both explanations.');return;
    }
    s.attemptId=s.attemptId||crypto.randomUUID();s.pending=record();save();
  }
  busy=true;s.error='';render();
  try{
    const {response:r,data:d}=await apiRequest(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s.pending)});
    if(!r.ok){
      // These statuses are definite pre-insert validation failures in this API.
      // Let the student correct the rejected input; preserve all of their work.
      // Keep 409, 429, 5xx, timeouts and uncertain responses frozen for safe retry.
      if([400,413,415].includes(r.status)){s.pending=null;s.attemptId='';}
      throw Error(d?.error||'Submission was not confirmed.');
    }
    if(!d?.ok||typeof d.receipt!=='string'||!d.receipt||!Number.isInteger(d.score)||d.score<0||d.score>10||typeof d.submittedAt!=='string'||!Number.isFinite(Date.parse(d.submittedAt)))throw Error('The server did not return a valid receipt.');
    s.receipt={...d,submitted:clone(s.pending)};s.pending=null;s.error='';
  }catch(e){s.error=['AbortError','TimeoutError'].includes(e.name)?'No save was confirmed before the connection timed out. Retry the same saved submission.':e.message;}
  finally{busy=false;save();render();}
}''')
function('async function loadRows(', r'''async function loadRows(key){
  const {response:r,data:d}=await apiRequest(API+'/instructor',{headers:{'x-instructor-key':key}});
  if(!r.ok||!d?.ok)throw Error(d?.error||'The gradebook could not be loaded.');
  if(!Array.isArray(d.submissions))throw Error('Unexpected gradebook response.');
  rows=d.submissions;access=key;gradeDirty=false;instructor();
  if(d.truncated)flash('Only the first 2,000 submissions were returned.');
}''')
replace("main.addEventListener('input',e=>{if(e.target.id==='search')", "main.addEventListener('input',e=>{if(INSTRUCTOR&&['grade-number','grade-notes'].includes(e.target.id)){gradeDirty=true;return;}if(e.target.id==='search')")
function("main.addEventListener('click',", r'''main.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(INSTRUCTOR&&gradeBusy){flash('Wait for the grade save to finish.');return;}
  if(b.dataset.student){
    if(gradeDirty&&!confirm('You have unsaved grade or feedback changes. Discard them and open another student?'))return;
    gradeDirty=false;selected=b.dataset.student;instructor();document.getElementById('student')?.scrollIntoView({block:'start'});return;
  }
  const a=b.dataset.act;if(!a)return;
  if(INSTRUCTOR){
    if(['refresh','lock'].includes(a)&&gradeDirty&&!confirm('Discard your unsaved grade or feedback changes?'))return;
    try{
      if(a==='refresh')await loadRows(access);
      if(a==='lock'){access='';rows=[];selected=null;gradeDirty=false;instructor();}
      if(a==='csv'){
        const lines=[['Last name','First name','Email','Automatic /10','Recorded /10','First-check /10','Reviewed at','Feedback'],...rows.map(r=>[r.last_name,r.first_name,r.email,r.score,r.grade_override??r.score,r.first_score,r.graded_at||'',r.grader_notes||''])];
        download(lines.map(row=>row.map(csvCell).join(',')).join('\r\n'),'SPM370_Decision_Lab_2_Nova_Grades.csv');
      }
    }catch(err){flash(err.message);}return;
  }
  if(a==='download'){download(summary(),'Off_Script_Nova_Summary.txt');return;}
  if(a==='print'){window.print();return;}
  if(a==='reset-demo'&&DEMO){if(confirm('Restart this demo? Student work is separate and will not be changed.')){s=fresh();save();render(true);}return;}
  if(a==='new'&&s.receipt){if(!confirm('Save your receipt first. Start a separate individual attempt? The server record will not be changed.'))return;s=fresh();save();render(true);return;}
  if(s.pending||s.receipt)return;
  if(a==='check'){
    const ids=b.dataset.ids.split(',').map(Number);
    if(ids.some(i=>s.answers[i]===null)){flash('Select one answer for each check first.');return;}
    for(const i of ids){if(s.first[i]===null)s.first[i]=s.answers[i];s.checked[i]=true;}
    save();render();main.querySelector('.feedback')?.scrollIntoView({block:'center'});return;
  }
  if(a==='start')s.stage=1;
  if(a==='back')s.stage=Math.max(1,s.stage-1);
  if(a==='next'){if(s.stage===1&&!gate([0,1]))return;if(s.stage===2&&(!s.route||!gate([2,3])))return;s.stage++;}
  if(a==='review'){
    if(!s.final||!gate([0,1,2,3,4])||s.reflections.some(t=>t.trim().length<30)){flash('Check all five answers and write both explanations before reviewing. Use at least 30 characters in each.');return;}
    s.stage=4;
  }
  if(a==='edit')s.stage=3;
  save();render(true);
});''')
function("main.addEventListener('submit',", r'''main.addEventListener('submit',async e=>{
  e.preventDefault();
  if(e.target.id==='submit'){await submit();return;}
  if(e.target.id==='login'){
    const key=document.getElementById('access').value.trim(),b=e.target.querySelector('button');b.disabled=true;
    try{await loadRows(key);}catch(err){access='';const p=document.getElementById('login-error');p.textContent=err.message;p.hidden=false;b.disabled=false;}return;
  }
  if(e.target.id==='grade'){
    if(gradeBusy)return;
    const form=e.target,id=selected,grade=Number(document.getElementById('grade-number').value),notes=document.getElementById('grade-notes').value;
    const controls=[...form.querySelectorAll('input,textarea,button')];controls.forEach(el=>el.disabled=true);gradeBusy=true;
    try{
      const {response:r,data:d}=await apiRequest(API+'/instructor',{method:'POST',headers:{'Content-Type':'application/json','x-instructor-key':access},body:JSON.stringify({id,grade,notes})});
      if(!r.ok||!d?.ok)throw Error(d?.error||'Grade was not saved.');
      gradeDirty=false;await loadRows(access);flash('Reviewed grade saved.');
    }catch(err){const p=document.getElementById('grade-error');if(p){p.textContent=err.message;p.hidden=false;}controls.forEach(el=>el.disabled=false);}
    finally{gradeBusy=false;}
  }
});''')
# The payload version and browser storage key intentionally remain 2.0.0 / v2.
assert "version:'2.0.0'" in text and 'spm370.offscript.nova.v2' in text
p.write_text(text)
readme=Path('spm370/off-script/README.md')
r=readme.read_text().replace('Nova’s Next Deal (2.0.0)','Nova’s Next Deal (2.0.1)')
r+='\n## Final classroom-readiness sweep\n\nBuild 2.0.1 preserves the v2 browser save, the 2.0.0 submission format, existing records, and the five-check scoring scheme. It clarifies that students treat the supplied contract as valid and answer the final AI question regardless of their chosen deal. It adds a separate demo restart, safe correction after definite validation failures, browser-compatible request timeouts, a new-tab instructor guide, emergency backup when browser storage is blocked, and protection against discarding unsaved instructor feedback. The QA workflow runs synthetic regression tests before committing these source changes on its isolated branch. Its live test uses one clearly marked example.invalid record that must be removed after verification.\n'
readme.write_text(r)
print('Applied targeted source fixes; storage keys, submission format, and scoring preserved.')
