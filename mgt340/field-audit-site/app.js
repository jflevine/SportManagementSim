import { config } from './config.js';

const el = id => document.getElementById(id);
const form = el('site-form');
const button = el('submit-button');
const status = el('status');
const storageKey = 'mgt340-field-audit-unconfirmed-v1';
const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';
if (previewMode) {
  const notice=document.createElement('p');
  notice.className='inline-note';
  notice.textContent='INSTRUCTOR PREVIEW — No information entered here will be sent or saved. Do not share this preview link as the student submission link.';
  document.querySelector('.hero').append(notice);
  document.title='PREVIEW (not submitted) · MGT 340 Field Audit';
}
let pending = null;
let completed = null;
const fields = Object.freeze({
  firstName:'first-name',lastName:'last-name',email:'email',
  siteCategory:'site-category',siteName:'site-name',eventDate:'event-date',
  eventTime:'event-time',venueLocation:'venue',observationFocus:'focus'
});
const localTime = iso => new Intl.DateTimeFormat('en-US',{
  dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'
}).format(new Date(iso));
const eventDateLabel = iso => iso ? new Intl.DateTimeFormat('en-US',{dateStyle:'long',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z')) : '';
function showStatus(message,kind=''){
  status.textContent = message;
  status.className='status '+kind;
}
function mode(){
  const help = form.elements.requestKind.value === 'assistance';
  el('site-fields').disabled = help;
  el('site-fields').hidden = help;
  el('help-panel').hidden = !help;
  if(!pending) button.firstChild.textContent = help ? 'Request help selecting a site ' : 'Submit site confirmation ';
}
function lockForm(locked){
  for(const input of form.querySelectorAll('input,select,textarea')) input.disabled=locked;
  if(!locked) mode();
}
function readFields(){
  const kind=form.elements.requestKind.value;
  const payload={
    attemptId:crypto.randomUUID(),
    formVersion:config.formVersion,
    firstName:el(fields.firstName).value.trim(),
    lastName:el(fields.lastName).value.trim(),
    email:el(fields.email).value.trim().toLowerCase(),
    requestKind:kind,
    siteCategory:null,siteName:null,eventDate:null,eventTime:null,venueLocation:null,observationFocus:null
  };
  if(kind==='site'){
    for(const key of ['siteCategory','siteName','eventDate','eventTime','venueLocation','observationFocus']){
      payload[key]=el(fields[key]).value.trim();
    }
  }
  return payload;
}
function validate(){
  if(!form.reportValidity()) return false;
  const email=el('email').value.trim().toLowerCase();
  const ok=/^[^@\s]+@lasalle[.]edu$/i.test(email)&&!email.includes('..')&&!email.startsWith('.')&&!email.split('@')[0].endsWith('.');
  if(!ok){el('email').setCustomValidity('Enter your official @lasalle.edu email.');el('email').reportValidity();el('email').setCustomValidity('');return false;}
  if(form.elements.requestKind.value==='site'){
    const date=el('event-date').value;
    if(date<'2026-09-01'||date>'2026-11-08'){showStatus('Select an event date no later than November 8, or contact Professor Levine about an exception.','error');el('event-date').focus();return false;}
  }
  return true;
}
function persist(){
  try {sessionStorage.setItem(storageKey,JSON.stringify(pending));}
  catch {showStatus('Your browser could not store a retry copy. Keep this tab open until your submission is confirmed.','error');}
}
function clearPending(){
  pending=null;
  try {sessionStorage.removeItem(storageKey);} catch {}
}
function updateReceipt(data){
  completed={...data,firstName:pending?.firstName||'',lastName:pending?.lastName||'',email:pending?.email||''};
  const state=data.approvalStatus;
  const details=state==='approved' ?
    'Approved: La Salle varsity athletics is an eligible, preapproved sport setting.' :
    state==='assistance_requested' ? 
      'Assistance requested. Email Professor Levine to arrange an appropriate observation site.' :
      'Pending instructor review. This receipt confirms submission, not approval of your proposed site.';
  el('receipt-summary').textContent=data.requestKind==='assistance' ?
    'Your request for help choosing a field audit setting has been recorded.' :
    'Your selection of '+data.siteName+' on '+eventDateLabel(data.eventDate)+' has been recorded.';
  el('receipt-id').textContent=data.receiptId;
  el('receipt-time').textContent=localTime(data.submittedAt)+(data.late?' · Submitted after October 18 deadline':'');
  el('receipt-review').textContent=details;
  el('receipt-next').textContent=data.requestKind==='assistance' ?
    'Next: contact levinej@lasalle.edu. The November 8 field-notes checkpoint and November 15 report still apply.' :
    data.approvalStatus==='approved' ?
      'Next: attend your selected event as an observer, make contemporaneous notes, and gather permitted evidence. Submit your field notes and at least two evidence items in Canvas by November 8.' :
      'Next: wait for instructor approval before attending this site for the audit. If your event is soon, contact Professor Levine immediately.';
  el('form-panel').hidden=true;
  el('receipt').hidden=false;
  el('receipt').scrollIntoView({block:'start',behavior:'smooth'});
}
async function sendPending(){
  if(!pending) return;
  button.disabled=true;
  button.firstChild.textContent='Saving confirmation… ';
  showStatus('Saving your request securely…');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),config.timeoutMs);
  try{
    const response=await fetch(config.endpoint,{
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json',apikey:config.publicApiKey,Authorization:'Bearer '+config.publicApiKey},
      body:JSON.stringify(pending),
      signal:controller.signal,
      cache:'no-store',
      credentials:'omit',
      redirect:'error'
    });
    let data=null;
    try{data=await response.json();}catch{}
    if(response.ok && data?.ok && data.attemptId===pending.attemptId &&
      typeof data.receiptId==='string' && typeof data.submittedAt==='string' &&
      ['approved','pending_review','assistance_requested','needs_revision'].includes(data.approvalStatus)){
      updateReceipt(data);
      clearPending();
      return;
    }
    if(response.status===400||response.status===409){
      clearPending();lockForm(false);
      showStatus(data?.error?.message||(response.status===409?'A record already exists for this email. Contact Professor Levine to correct it.':'Please review your details.'),'error');
    }else {
      showStatus(data?.error?.message||'The save could not be confirmed. Retry your original submission; do not change its details.','error');
      lockForm(true);
    }
  } catch {
    showStatus('The save could not be confirmed. Retry the same submission. Keep this tab open, or contact Professor Levine.','error');
    lockForm(true);
  } finally {
    clearTimeout(timer);
    button.disabled=false;
    if(pending)button.firstChild.textContent='Retry same submission ';
    else button.firstChild.textContent=form.elements.requestKind.value==='assistance'?'Request help selecting a site ':'Submit site confirmation ';
  }
}
form.addEventListener('change',e=>{if(e.target.name==='requestKind')mode();});
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(previewMode){
    if(!validate()) return;
    pending=readFields();
    const simulated={
      receiptId:'PREVIEW-NOT-SAVED',attemptId:pending.attemptId,
      submittedAt:new Date().toISOString(),late:false,requestKind:pending.requestKind,
      siteName:pending.siteName,eventDate:pending.eventDate,
      approvalStatus:pending.requestKind==='assistance'?'assistance_requested':pending.siteCategory==='lasalle-varsity'?'approved':'pending_review'
    };
    updateReceipt(simulated);
    el('receipt-heading').textContent='Preview only — nothing submitted';
    el('receipt-review').textContent='Simulated status: '+simulated.approvalStatus+'. This is not an instructor decision.';
    el('receipt-next').textContent='No student record was sent or saved. Use the standard link (without ?preview=1) for real submissions.';
    el('download-receipt').hidden=true;
    pending=null;
    return;
  }
  if(!pending){
    if(!validate())return;
    pending=readFields();
    persist();
    lockForm(true);
  }
  await sendPending();
});
el('download-receipt').addEventListener('click',()=>{
  if(!completed)return;
  const lines=[
    'MGT 340 · Philadelphia Sport Management Field Audit',
    'SITE CONFIRMATION RECEIPT · UNGRADED',
    '',
    'Student: '+completed.firstName+' '+completed.lastName,
    'Email: '+completed.email,
    'Received (Philadelphia): '+localTime(completed.submittedAt),
    'Confirmation ID: '+completed.receiptId,
    'Request: '+completed.requestKind,
    'Site: '+(completed.siteName||'Assistance requested'),
    'Event date: '+(completed.eventDate||'To be determined'),
    'Site status: '+completed.approvalStatus,
    '',
    'The field-notes/evidence checkpoint is due November 8 in Canvas.',
    'The final field audit report is due November 15 in Canvas.',
    'A receipt does not constitute instructor approval for a site pending review.'
  ];
  const file=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(file);
  const a=document.createElement('a');a.href=url;a.download='MGT340-Field-Audit-Site-Confirmation.txt';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
if (!previewMode) try{
  const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');
  if(saved && saved.formVersion===config.formVersion &&
    /^[0-9a-f-]{36}$/i.test(saved.attemptId) &&
    ['site','assistance'].includes(saved.requestKind)){
    pending=saved;
    for(const key of ['firstName','lastName','email','siteCategory','siteName','eventDate','eventTime','venueLocation','observationFocus']){
      el(fields[key]).value=saved[key]||'';
    }
    const radio=form.querySelector('input[name="requestKind"][value="'+saved.requestKind+'"]');
    if(radio)radio.checked=true;
    el('ack').checked=true;
    mode();lockForm(true);
    showStatus('An unconfirmed submission was restored in this tab. Select “Retry same submission” to check whether it was saved.','error');
    button.firstChild.textContent='Retry same submission ';
  }
}catch {try {sessionStorage.removeItem(storageKey);}catch{}}
if(!pending)mode();
