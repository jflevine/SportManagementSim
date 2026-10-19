import {CASE_VERSION,SCHEMA_VERSION,STORAGE_KEY,RETRY_ATTEMPT,wordCount,token,responseText,download,request} from './core.mjs?retry-v1';
const $=id=>document.getElementById(id), form=$('student-form');
if(RETRY_ATTEMPT){const note=document.createElement('p');note.className='hint';note.textContent='Additional attempt: use your original La Salle email and class code. This form accepts one additional submission only with your instructor’s approval. Your original submission is preserved. The full 10-point rubric applies.';form.before(note);$('response-heading').textContent='Your advice · Additional attempt';}
let state={draft:{},pending:null,receipt:null};let canStore=true;
try {const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(s&&typeof s==='object'&&s.case_version===CASE_VERSION)state=s;}catch{canStore=false;}
const fields=['name','email','decision','recommendation','clause_number','clarification'];
function data(){const f=new FormData(form);return Object.fromEntries(fields.map(k=>[k,k==='clause_number'?Number(f.get(k)):String(f.get(k)||'').trim()]));}
function message(text,kind=''){const node=$('status');node.textContent=text;node.className='status '+kind;}
function persist(){state.case_version=CASE_VERSION;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('draft-status').textContent=state.receipt?'A confirmed copy is saved on this device.':'Draft saved on this device. Not yet submitted.';}catch{canStore=false;$('draft-status').textContent='Browser saving is unavailable. Use “Save a copy” to keep your work.';}}
function count(){const n=wordCount($('recommendation').value)+wordCount($('clarification').value);$('word-count').textContent=`${n} words across both answers · Suggested total: 120–180`;}
function lock(locked){for(const el of form.elements)if(!['class-code','submit-button','download-button'].includes(el.id))el.disabled=locked;}
function populate(d){for(const k of fields){if(k==='decision'){const radio=form.querySelector(`input[name="decision"][value="${['proceed','counter','decline'].includes(d[k])?d[k]:''}"]`);if(radio)radio.checked=true;}else if(form.elements[k])form.elements[k].value=d[k]??'';}count();}
function confirmed(){lock(true);$('submit-button').disabled=true;$('submit-button').textContent='Submitted';$('class-code').required=false;$('class-code').disabled=true;$('class-code').value='';$('receipt').hidden=false;$('receipt-details').textContent=`Receipt ${state.receipt.receipt} · ${new Date(state.receipt.submitted_at).toLocaleString()}`;message('Your responses were saved successfully.','success');}
populate(state.pending||state.draft||{});
if(state.receipt)confirmed();else if(state.pending){lock(true);$('submit-button').textContent='Retry saved submission';message('A prior submission has not been confirmed in this browser. Enter the class code and retry the same saved answers.','warning');}
if(canStore)persist();else $('draft-status').textContent='Browser saving is unavailable. Use “Save a copy” to keep your work.';
form.addEventListener('input',e=>{if(e.target.id==='class-code'||state.pending||state.receipt)return;state.draft=data();count();persist();});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(state.receipt)return;
 const code=$('class-code').value.trim();if(!code){$('class-code').reportValidity();return;}
 if(!state.pending){
  const d=data();if(!/^[^\s@]+@lasalle\.edu$/i.test(d.email)){$('email').setCustomValidity('Use your La Salle email address ending in @lasalle.edu.');$('email').reportValidity();return;}$('email').setCustomValidity('');
  if(!form.reportValidity())return;
  state.draft=d;state.pending={...d,schema_version:SCHEMA_VERSION,case_version:CASE_VERSION,...(RETRY_ATTEMPT?{retry_attempt:true}:{}),submission_id:crypto.randomUUID(),submission_token:token()};persist();
 }
 lock(true);$('submit-button').disabled=true;$('clear-button').disabled=true;message('Submitting your advice…');
 try{const result=await request('/submit',{method:'POST',headers:{'X-Class-Code':code},body:state.pending});
  if(!result.receipt||!result.submitted_at)throw new Error('The server did not provide a submission receipt.');
  state.receipt=result;persist();confirmed();$('receipt').focus();
 }catch(err){
  const knownRejected=[400,422].includes(err.status)||err.code==='retry_not_authorized';
  if(knownRejected){state.pending=null;persist();lock(false);$('submit-button').textContent='Submit my advice';message(err.message+' Your answers remain available.','error');}
  else{$('submit-button').textContent='Retry saved submission';message(([401,403,409].includes(err.status)?err.message:'We could not confirm submission. Retry sends the same answers and will not create a duplicate.')+' You can save a copy below; contact your instructor if this continues.','error');}
  $('submit-button').disabled=false;
 }finally{$('clear-button').disabled=false;}
});
$('email').addEventListener('input',()=>$('email').setCustomValidity(''));
$('download-button').addEventListener('click',()=>{const p=state.pending||state.draft||data();download('SPM370_Decision_Lab_3.txt',responseText({...p,...(RETRY_ATTEMPT?{retry_attempt:true}:{})},state.receipt));});
$('clear-button').addEventListener('click',()=>{if(!confirm('Clear this device’s saved answers? This does not delete a submitted response. Save a copy first if needed.'))return;try{localStorage.removeItem(STORAGE_KEY);}catch{}location.reload();});
request('/meta').then(meta=>{if(!state.receipt&&!state.pending&&meta.accepts_submissions===false)message('Submissions are currently closed. You may read the case and save a draft; contact your instructor about access.','warning');}).catch(()=>{if(!state.receipt&&!state.pending)message('The submission service could not be reached yet. You can still read, write, and save a copy. Try submitting when connected.','warning');});

