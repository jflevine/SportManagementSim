'use strict';
(() => {
  const VERSION = 1;
  const KEY = 'spm343-tap-lab2-pilot-v1';
  const $ = id => document.getElementById(id);
  const fieldIds = ['format-reason','access-requirement','tech-requirement','verify-question','arrival-minutes','play-minutes','closing-minutes','operations-role','success-metric','andrew-insight','revision-action','revision-decision','revision-consequence'];
  let state = {version:VERSION, id:crypto.randomUUID(), status:'new', values:{}, format:'', consent:false, initialPlan:null, receipt:null, updatedAt:null};
  let storageOK = true, conflict = false;
  const ENDPOINT = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2';
  let guestBusy=false, guestSent='', guestTarget=null, guestTimer=null;
  function guestStatus(text) { const node=$('guest-sync-status'); if(node)node.textContent=text; }
  function queueGuest() {
    if(!['guided','tournament'].includes(state.format)||conflict)return;
    const stage=['plan_locked','submitted'].includes(state.status)?state.status:'draft';
    guestTarget={action:'pilotProgress',format:state.format,stage};
    clearTimeout(guestTimer);guestTimer=setTimeout(syncGuest,800);
  }
  async function syncGuest() {
    if(guestBusy||!guestTarget||conflict)return;
    const body=JSON.stringify(guestTarget);if(body===guestSent)return;
    guestBusy=true;guestStatus('Updating the shared guest demonstration…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(ENDPOINT,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body,signal:controller.signal});
      const data=await response.json();if(!response.ok||!data.ok||data.synthetic!==true||!data.demo)throw Error('Guest update not confirmed');
      guestSent=body;guestStatus('Guest demonstration updated: format and stage only. Your writing stays here.');
    }catch{guestStatus('Guest demonstration update pending. Your writing is safe in this browser if local saving succeeded. Retrying automatically.');}
    finally{clearTimeout(timeout);guestBusy=false;if(JSON.stringify(guestTarget)!==guestSent)guestTimer=setTimeout(syncGuest,15000);}
  }
  window.addEventListener('online',()=>{clearTimeout(guestTimer);syncGuest();});
  const read = () => {
    try {
      const value = localStorage.getItem(KEY); if (!value) return;
      const parsed=JSON.parse(value);
      if (parsed.version!==VERSION || !['new','draft','plan_locked','submitted'].includes(parsed.status) || !parsed.values || !parsed.id) throw Error('Unrecognized saved practice');
      state=parsed;
    } catch (e) { storageOK=false; feedback('Your saved practice could not be loaded. Start a new practice in another browser window, or download anything you enter here before leaving.'); }
  };
  function feedback(message, success=false) { $('form-feedback').classList.toggle('success',success); $('form-feedback').textContent=message; $('form-feedback').hidden=!message; }
  function syncInputs() {
    fieldIds.forEach(id=>{if ($(id)) $(id).value=state.values[id]??'';});
    document.querySelectorAll('[name="format"]').forEach(el=>{el.checked=el.value===state.format;});
    $('guest-consent').checked=!!state.consent;
  }
  function capture() {
    if (conflict || state.status==='submitted') return;
    fieldIds.forEach(id=>{if ($(id) && (!state.initialPlan || !$(id).closest('#initial-fields'))) state.values[id]=$(id).value;});
    if (!state.initialPlan) state.format=document.querySelector('[name="format"]:checked')?.value||'';
    state.consent=$('guest-consent').checked;
    state.updatedAt=new Date().toISOString();
  }
  function updateTotals() {
    const nums=['arrival-minutes','play-minutes','closing-minutes'].map(id=>Number($(id).value)||0);
    const total=nums.reduce((a,b)=>a+b,0);
    $('time-total').textContent=`${total} / 90 minutes`;
    $('time-total').classList.toggle('is-valid',total===90);
    const words=fieldIds.filter(id=>$(id)?.tagName==='TEXTAREA').map(id=>$(id).value).join(' ').trim().split(/\s+/).filter(Boolean).length;
    $('word-count').textContent=`${words} words`;
  }
  function save() {
    if (conflict) return false;
    try {localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}
    catch {storageOK=false;}
    $('save-status').textContent=storageOK?'Practice saved in this browser':'Practice is not saved';
    $('save-detail').textContent=storageOK?'Reload on this device to resume. Your writing is not sent to the instructor.': 'Browser storage is blocked or full. Keep this page open and download your practice. Use Retry after storage is available.';
    $('retry-save').hidden=storageOK;
    queueGuest();
    return storageOK;
  }
  function textPlan(values=state.values, format=state.format) {
    return `1. EVENT\n${format==='tournament'?'Beginner-friendly mini-tournament':'Guided play + short team exhibition'}\n${values['format-reason']||''}\n\n2. VENUE\nAccess/layout: ${values['access-requirement']||''}\nTechnology/reliability: ${values['tech-requirement']||''}\nVerify with TAP: ${values['verify-question']||''}\n\n3. OPERATIONS\nArrival ${values['arrival-minutes']||0} min · Play ${values['play-minutes']||0} min · Closing ${values['closing-minutes']||0} min\nRole/task: ${values['operations-role']||''}\nSuccess/measurement: ${values['success-metric']||''}`;
  }
  function render() {
    const started=state.status!=='new';
    $('landing').hidden=started; $('workspace').hidden=!started;
    $('initial-fields').disabled=!!state.initialPlan||conflict||state.status==='submitted';
    $('save-initial').hidden=!!state.initialPlan;
    $('revision-stage').hidden=!state.initialPlan;
    if($('revision-nav'))$('revision-nav').hidden=!state.initialPlan;
    if($('initial-save-panel'))$('initial-save-panel').hidden=!!state.initialPlan;
    $('revision-stage').disabled=conflict||state.status==='submitted';
    $('guest-consent').disabled=conflict||state.status==='submitted';
    $('submit-final').hidden=!state.initialPlan||state.status==='submitted';
    $('submission-receipt').hidden=state.status!=='submitted';
    if ($('start-over')) $('start-over').hidden=!started;
    if (state.initialPlan) {
      $('original-plan').textContent=textPlan(state.initialPlan.values,state.initialPlan.format);
      $('original-plan').closest('details')?.removeAttribute('hidden');
    }
    if (state.receipt) {
      $('receipt-id').textContent=state.receipt.id;
      $('receipt-time').textContent=new Date(state.receipt.at).toLocaleString();
      $('receipt-status').textContent='Practice complete on this device. This is not a class submission or a grade.';
    }
    $('live-status').textContent='Real class submissions are closed during instructor review';
    updateTotals();
  }
  function validateInitial() {
    const format=document.querySelector('[name="format"]:checked');
    if (!format) {feedback('Choose an event format first.');document.querySelector('[name="format"]').focus();return false;}
    for(const id of ['format-reason','access-requirement','tech-requirement','verify-question','operations-role','success-metric']) {
      if(!$(id).value.trim()){feedback('Add a brief answer for each part of your initial plan.');$(id).focus();return false;}
    }
    const ids=['arrival-minutes','play-minutes','closing-minutes'];
    if(ids.some(id=>!Number.isInteger(Number($(id).value))||Number($(id).value)<=0||Number($(id).value)>90)||ids.reduce((n,id)=>n+Number($(id).value),0)!==90){feedback('Use positive whole minutes for arrival, play, and closing, totaling 90.');$('arrival-minutes').focus();return false;}
    return true;
  }
  $('start-lab').addEventListener('click',()=>{state.status='draft';capture();save();render();$('format-reason').focus();});
  $('decision-form').addEventListener('submit',e=>e.preventDefault());
  $('decision-form').addEventListener('input',()=>{if(conflict)return;capture();save();updateTotals();});
  $('decision-form').addEventListener('change',()=>{if(conflict)return;capture();save();updateTotals();});
  $('save-initial').addEventListener('click',()=>{
    if(conflict||state.initialPlan||!validateInitial())return;
    capture();state.initialPlan={format:state.format,values:{...state.values},at:new Date().toISOString()};state.status='plan_locked';save();feedback('Your initial plan is kept below. Now listen to Andrew; one useful note is enough during the conversation.',true);render();$('andrew-insight').focus();
  });
  $('submit-final').addEventListener('click',()=>{
    if(conflict||state.status==='submitted'||!state.initialPlan)return;
    for(const id of ['andrew-insight','revision-action','revision-decision','revision-consequence'])if(!$(id).value.trim()){feedback('Finish the interview reflection, including the consequence for your plan.');$(id).focus();return;}
    capture();state.status='submitted';state.receipt={id:`PRACTICE-${state.id.slice(0,8).toUpperCase()}`,at:new Date().toISOString()};save();feedback('Practice finished. Download a copy if you would like to keep it; no official submission was sent.',true);render();$('submission-receipt').setAttribute('tabindex','-1');$('submission-receipt').focus();
  });
  $('retry-save').addEventListener('click',()=>{if(conflict)return;capture();save();});
  $('download-draft').addEventListener('click',()=>{
    capture();const text=`SPM 343 · A FIRST VISIT TO TAP\nPILOT PRACTICE ONLY · Not a class submission\nNo names, email addresses, or typed answers were sent; only format and stage can update the shared synthetic guest demo\n\n${textPlan()}\n\n4. INTERVIEW REFLECTION\nAndrew insight: ${state.values['andrew-insight']||''}\n${state.values['revision-action']||'Decision'}: ${state.values['revision-decision']||''}\nConsequence: ${state.values['revision-consequence']||''}\n\nGuest-sharing preference for a future live lab: ${state.consent?'Allow instructor to consider a screened anonymous summary':'Keep proposal private'}\n${state.receipt?`Practice confirmation: ${state.receipt.id}\n${state.receipt.at}`:'Practice incomplete'}\n`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='TAP-Decision-Lab-2-practice.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('download-receipt')?.addEventListener('click',()=>{$('download-draft').click();});
  $('start-over')?.addEventListener('click',()=>{
    if(!confirm('Clear this practice from this browser? Download a copy first if you want to keep it.'))return;
    try{localStorage.removeItem(KEY);}catch{}location.reload();
  });
  window.addEventListener('storage',event=>{
    if(event.key!==KEY)return;
    conflict=true;$('save-status').textContent='Another tab changed this practice';$('save-detail').textContent='Download this tab’s writing before reloading. Reload to use the latest saved version and avoid overwriting it.';$('retry-save').hidden=true;render();
  });
  window.addEventListener('beforeunload',e=>{if(!storageOK&&state.status!=='new'){e.preventDefault();e.returnValue='';}});
  read();syncInputs();render();if(state.status!=='new')save();
})();
