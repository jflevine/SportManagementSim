'use strict';
(() => {
  const ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2';
  const mode=['pilot','test'].includes(new URLSearchParams(location.search).get('mode'))?new URLSearchParams(location.search).get('mode'):'live';
  const KEY=`spm343-tap-lab2-v2-${mode}`, $=id=>document.getElementById(id);
  const proposals={cup:{name:'Rivalry Mini-Cup',cost:280,stations:12},open:{name:'Play & Connect',cost:180,stations:10},showcase:{name:'Campus Showcase',cost:240,stations:8}};
  const radioNames=['initialChoice','finalChoice','adjustment','priority'];
  const textFields={initialPosition:'initial-position',finalReason:'final-reason',tradeoff:'tradeoff',runnerUp:'runner-up'};
  const blank=()=>({initialChoice:'',initialPosition:'',finalChoice:'',adjustment:'',priority:'',finalReason:'',runnerUp:'',tradeoff:'',guestConsent:false});
  let state=null,shown=false,storageOK=true,conflict=false,running=null,queue=Promise.resolve(),saveTimer=null,retryTimer=null,critical=false;
  const stable=v=>JSON.stringify(v);
  function status(title,detail,error=false){$('save-status').textContent=title;$('save-detail').textContent=detail;$('retry-save').hidden=!error;}
  function feedback(text,good=false){for(const id of ['form-feedback','identity-feedback']){if(!$(id))continue;$(id).textContent=text;$(id).hidden=!text;$(id).classList.toggle('success',good);}}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;return true;}catch{storageOK=false;status('This browser is not saving','Keep this page open and download your work. Enable browser storage, then choose Retry. New requests are paused until the recovery information can be saved.',true);return false;}}
  function token(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function fresh(identity){return {schema:2,mode,attemptId:crypto.randomUUID(),token:token(),identity,answers:blank(),serverAnswers:blank(),version:0,status:'draft',initialSnapshot:null,receipt:null,grade:null,pending:null};}
  function capture(){if(!state||conflict||state.status==='submitted')return;for(const name of radioNames){if(state.initialSnapshot&&name==='initialChoice')continue;state.answers[name]=document.querySelector(`[name="${name}"]:checked`)?.value||'';}for(const [name,id]of Object.entries(textFields)){if(state.initialSnapshot&&name==='initialPosition')continue;state.answers[name]=$(id).value;}state.answers.guestConsent=$('guest-consent').checked;}
  function populate(){if(!state)return;for(const name of radioNames)document.querySelectorAll(`[name="${name}"]`).forEach(n=>n.checked=n.value===state.answers[name]);for(const [name,id]of Object.entries(textFields))$(id).value=state.answers[name]||'';$('guest-consent').checked=!!state.answers.guestConsent;}
  function fit(){const p=proposals[state?.answers.finalChoice];if(!p){$('fit-message').textContent='Choose a final event and adjustment to check the plan.';return;}const a=state.answers.adjustment,total=p.cost+(a==='extra_host'?75:0);$('fit-cost').textContent=`$${total}`;$('fit-budget').textContent=total<=300?`$${300-total} remaining`:`$${total-300} over the limit`;$('fit-stations').textContent=String(p.stations);$('fit-spare-stations').textContent=String(12-p.stations);$('fit-hosts').textContent=a==='extra_host'?'3':'2';$('fit-time').textContent=a==='orientation'?'10 arrival + 10 orientation + 60 main program + 10 closing':'10 arrival + 70 program + 10 closing';$('fit-message').textContent=total>300?'This plan exceeds the $300 cap. Choose another event or adjustment before submitting.':!a?'Choose an adjustment to finish the resource check.':a==='rotations'?'The plan stays within the listed limits. More turns mean less uninterrupted play or exhibition time; explain how you will manage that tradeoff.':a==='orientation'?'The plan stays within the listed limits. Orientation uses 10 minutes that the original main program would have used.':'The plan stays within the listed limits. The extra host costs $75; explain what that person will cover.';$('fit-strip').classList.toggle('over-budget',total>300);}
  function render(){if($('use-server'))$('use-server').hidden=!conflict;
    $('landing').hidden=shown;$('workspace').hidden=!shown;$('resume-attempt').hidden=!state;if($('resume-panel'))$('resume-panel').hidden=!state;$('start-lab').disabled=critical||!!state;
    $('mode-pill').textContent=mode==='live'?'Decision Lab 2 · 10 points':mode==='test'?'Synthetic test · no course credit':'Pilot · no submission';
    $('pilot-notice').hidden=mode==='live';$('pilot-notice').textContent=mode==='pilot'?'Practice preview: your writing stays in this browser. No class submission or grade is created.':mode==='test'?'Synthetic test mode: use example.invalid identities only. Test records are separate from the class gradebook.':'';
    if($('identity-fields'))$('identity-fields').hidden=mode==='pilot';if($('pilot-identity'))$('pilot-identity').hidden=mode!=='pilot';
    if(!state)return;
    $('student-identity').textContent=mode==='pilot'?'Practice reviewer':`${state.identity.firstName} ${state.identity.lastName} · ${state.identity.email}`;
    $('initial-fields').disabled=!!state.initialSnapshot||critical||conflict||state.status==='submitted';$('lock-initial').hidden=!!state.initialSnapshot;if($('lock-panel'))$('lock-panel').hidden=!!state.initialSnapshot;if($('revision-nav'))$('revision-nav').hidden=!state.initialSnapshot;$('lock-initial').disabled=critical||conflict;
    $('revision-stage').hidden=!state.initialSnapshot;$('revision-stage').disabled=critical||conflict||state.status==='submitted';$('guest-consent').disabled=critical||conflict||state.status==='submitted';
    $('submit-final').disabled=critical||conflict;$('submit-final').hidden=!state.initialSnapshot||state.status==='submitted';
    $('initial-snapshot').hidden=!state.initialSnapshot;
    if(state.initialSnapshot){const s=state.initialSnapshot;$('original-plan').textContent=`${proposals[s.initialChoice]?.name||s.initialChoice}\n${s.initialPosition||''}`;}
    $('receipt').hidden=state.status!=='submitted';
    if(state.status==='submitted'){
      $('receipt-id').textContent=state.receipt||'';if($('receipt-time'))$('receipt-time').textContent=state.submittedAt?new Date(state.submittedAt).toLocaleString():'';
      $('receipt-status').textContent=mode==='pilot'?'Practice completed on this device. Nothing was submitted for a grade.':mode==='test'?'Synthetic submission confirmed. This is not course credit.':'Your submission is confirmed and saved privately.';
      const grade=state.grade;$('receipt-score').textContent=grade&&typeof grade.total==='number'?`Instructor score: ${grade.total} / 10`:'Awaiting instructor review · not yet graded';
      if(mode==='pilot')$('receipt-score').textContent='Practice preview · no grade assigned';
      if($('receipt-feedback'))$('receipt-feedback').textContent=grade?.notes||'';
    }
    $('live-status').textContent=mode==='live'?'Names, email, answers, and grades are private. The guest sees only anonymous choices and progress.':mode==='test'?'Synthetic records are kept apart from the class.':'Practice answers stay on this device.';
    fit();
  }
  function validateInitial(){capture();if(!proposals[state.answers.initialChoice]){feedback('Choose an initial proposal.');document.querySelector('[name="initialChoice"]').focus();return false;}if(state.answers.initialPosition.trim().length<40){feedback('Give a short initial position using a venue or audience fact.');$('initial-position').focus();return false;}return true;}
  function validateFinal(){capture();const a=state.answers,p=proposals[a.finalChoice];if(!p){feedback('Choose your final proposal.');document.querySelector('[name="finalChoice"]').focus();return false;}for(const name of ['adjustment','priority'])if(!a[name]){feedback(`Choose ${name==='priority'?'a priority stakeholder':'one adjustment'}.`);document.querySelector(`[name="${name}"]`).focus();return false;}if(p.cost+(a.adjustment==='extra_host'?75:0)>300){feedback('The selected event plus the extra host exceeds $300. Adjust the plan before submitting.');$('fit-strip').scrollIntoView({behavior:'smooth',block:'center'});return false;}if(!proposals[a.runnerUp]||a.runnerUp===a.finalChoice){feedback('Choose a different event as your runner-up.');$('runner-up').focus();return false;}for(const [name,min] of [['finalReason',40],['tradeoff',40]])if(a[name].trim().length<min){feedback(name==='finalReason'?'Explain how the new information affects your plan, whose interest you prioritize, and one risk with a practical response.':'Explain why you rejected the runner-up and what benefit you give up.');$(textFields[name]).focus();return false;}return true;}
  async function api(body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);try{const response=await fetch(ENDPOINT,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-attempt-token':state.token},body:JSON.stringify(body),signal:controller.signal});let data;try{data=await response.json();}catch{throw Error('The server did not return a readable confirmation.');}if(!response.ok||!data.ok){const e=new Error(data.error?.message||'The request was not confirmed.');e.code=data.error?.code;e.http=response.status;throw e;}return data;}finally{clearTimeout(timer);}}
  function accept(data,{replace=false}={}){const s=data.submission;if(!s||s.attemptId!==state.attemptId||!Number.isInteger(s.version)||s.version<1)throw Error('The saved attempt could not be verified.');if(s.mode&&s.mode!==mode)throw Error('The server returned a different record type.');state.version=s.version;state.status=s.status;state.serverAnswers={...blank(),...s.answers};state.initialSnapshot=s.initialPlan||null;state.receipt=s.receipt||null;state.submittedAt=s.submittedAt||null;state.grade=s.review??null;state.identity={firstName:s.firstName,lastName:s.lastName,email:s.email,individualWork:true};if(replace||s.status==='submitted')state.answers={...state.serverAnswers};else if(state.initialSnapshot){state.answers.initialChoice=state.initialSnapshot.initialChoice;state.answers.initialPosition=state.initialSnapshot.initialPosition;}render();}
  function makeBody(action){const b={action,mode,attemptId:state.attemptId};if(action==='resume')return b;b.requestId=crypto.randomUUID();b.expectedVersion=state.version;if(action==='start')b.identity=state.identity;else if(action==='save')b.answers={...state.answers};return b;}
  function retryLater(){clearTimeout(retryTimer);retryTimer=setTimeout(()=>{if(state&&!conflict)send('save');},15000);}
  async function perform(action){
    if(!state||conflict)return false;
    if(mode==='pilot'){
      if(action==='lockPlan'){state.initialSnapshot={initialChoice:state.answers.initialChoice,initialPosition:state.answers.initialPosition};state.status='plan_locked';state.version++;}
      if(action==='submit'){state.status='submitted';state.receipt=`PRACTICE-${state.attemptId.slice(0,8).toUpperCase()}`;state.version++;}
      persist();render();status(storageOK?'Practice saved on this device':'Practice is not saved',storageOK?'No server submission or grade is created in pilot mode.':'Download your work before leaving this page.',!storageOK);return storageOK;
    }
    try{
      if(state.pending){const retry=state.pending;status('Confirming saved work…','Retrying the same request safely.');const d=await api(retry);if(conflict)return false;accept(d);state.pending=null;if(!persist())return false;const latest=await api(makeBody('resume'));if(conflict)return false;const previous=state.version;if(latest.submission.version>previous&&stable(state.answers)!==stable(state.serverAnswers)&&latest.submission.status!=='submitted'){conflict=true;state.recoveryNeeded=true;persist();render();status('Newer server work needs review','Download this browser draft, then reload and resume before changing it.',true);return false;}accept(latest);if(!persist())return false;}
      if((action==='save'||action==='submit')&&state.status==='submitted'){status('Submission confirmed','Your final receipt is saved. Resume later to check for an instructor grade.');return true;}
      if(action==='save'&&stable(state.answers)===stable(state.serverAnswers)&&state.version>0){status('Saved privately','All current responses are confirmed by the server.');return true;}
      if(action==='lockPlan'&&state.initialSnapshot)return true;const body=makeBody(action);state.pending=body;if(!persist())return false;
      status(action==='submit'?'Submitting your final decision…':action==='lockPlan'?'Saving your initial position…':'Saving privately…','Keep this page open until the server confirms.');
      const result=await api(body);if(conflict)return false;accept(result);state.pending=null;if(!persist())return false;
      status(state.status==='submitted'?'Submission confirmed':'Saved privately',state.status==='submitted'?'Keep your receipt. A completion status is not a grade; your instructor will review the reasoning.':'Your current responses are saved on the server.');
      if(action==='lockPlan'){populate();feedback('Your initial position is saved. Read the registration update before deciding what to change.',true);$('final-reason').focus();}
      if(action==='submit'){populate();feedback('Your final decision is submitted. The instructor will assign the 10-point score.',true);$('receipt').focus();}
      return true;
    }catch(e){
      if(e.code==='VERSION_CONFLICT'){conflict=true;state.recoveryNeeded=true;persist();status('A newer version exists','Download this browser’s work, then reload and resume before making another change.',true);render();}
      else if(e.code==='INVALID_INPUT'||e.http===400){state.pending=null;persist();feedback(e.message);status('Check the response','Your draft remains on this device. Correct the highlighted issue and retry.',true);}
      else{status('Not yet confirmed',`${e.name==='AbortError'?'The connection timed out.':e.message} Your saved request will be retried; do not start another attempt.`,true);retryLater();}
      return false;
    }
  }
  function send(action){
    clearTimeout(saveTimer);
    const job=queue.then(async()=>{
      if(!state||conflict)return false;
      if(['lockPlan','submit'].includes(action)&&mode!=='pilot'){capture();if(!await perform('save'))return false;}
      else if(action==='save')capture();
      return await perform(action);
    });
    queue=job.catch(()=>false);running=job;
    return job.finally(()=>{if(running===job)running=null;});
  }
  async function resume(){if(!state||critical)return;shown=true;critical=true;populate();render();if(state.recoveryNeeded){conflict=true;critical=false;render();status('Choose which copy to keep','Download this browser draft first. Use Load saved server version to replace it with the newer server copy.',true);return;}if(mode==='pilot'){critical=false;render();status('Practice restored','This is local practice, with no class submission.');return;}try{if(state.pending){const ok=await send('save');if(!ok)return;}const d=await api(makeBody('resume'));const s=d.submission;const dirty=stable(state.answers)!==stable(state.serverAnswers);if(s?.version>state.version&&dirty&&s.status!=='submitted'){conflict=true;state.recoveryNeeded=true;persist();status('A newer server draft exists','Download this browser’s work before reloading. Do not overwrite the newer draft.',true);return;}accept(d,{replace:!dirty});persist();populate();status('Saved attempt restored',state.status==='submitted'?'Your receipt and current instructor grade are shown below.':'You can continue where you left off.');if(dirty&&state.status!=='submitted')await send('save');}catch(e){status('Working from this device’s saved draft',`${e.message} Your answers have not been discarded. Use Retry to confirm the server copy.`,true);}finally{critical=false;render();}}
  function download(){capture();const a=state?.answers||blank();const text=`SPM 343 · Decision Lab 2 · Which esports event should TAP host?\nMode: ${mode}\n${state?.identity?.firstName||''} ${state?.identity?.lastName||''}\n${state?.identity?.email||''}\n\nINITIAL POSITION\n${proposals[a.initialChoice]?.name||''}\n${a.initialPosition}\n\nFINAL DECISION\n${proposals[a.finalChoice]?.name||''}\nAdjustment: ${a.adjustment}\nPriority: ${a.priority}\n${a.finalReason}\n\nRUNNER-UP AND TRADEOFF\n${proposals[a.runnerUp]?.name||''}\n${a.tradeoff}\n\n${state?.receipt?`Confirmed receipt: ${state.receipt}`:'No final server receipt yet'}\n${state?.grade?`Instructor score: ${state.grade.total}/10\n${state.grade.notes||''}`:'Not yet graded'}\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='TAP-Decision-Lab-2.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('identity-form').addEventListener('submit',async e=>{e.preventDefault();if(state||critical)return;const identity=mode==='pilot'?{firstName:'Practice',lastName:'Reviewer',email:'practice@example.invalid',individualWork:true}:mode==='test'?{firstName:'Synthetic',lastName:'Fixture',email:'tap-v2@example.invalid',individualWork:true}:{firstName:$('firstName').value.trim(),lastName:$('lastName').value.trim(),email:$('email').value.trim().toLowerCase(),individualWork:$('individualWork').checked};if(mode!=='pilot'&&(!identity.firstName||!identity.lastName||!identity.individualWork||!(mode==='test'?/^[^\s@]+@example\.invalid$/:/^[^\s@]+@lasalle\.edu$/).test(identity.email))){feedback(mode==='test'?'Use a synthetic name and an example.invalid email, and confirm individual work.':'Enter your name, a La Salle email ending @lasalle.edu, and the individual-work confirmation.');return;}state=fresh(identity);if(!persist()){state=null;feedback('Browser storage is blocked. Enable storage before starting; no server attempt has been created.');return;}shown=true;critical=true;render();await send(mode==='pilot'?'save':'start');critical=false;render();$('initial-position').focus();});
  $('resume-attempt').onclick=resume;
  $('decision-form').addEventListener('submit',e=>e.preventDefault());
  function changed(){if(critical||conflict||!state||state.status==='submitted')return;capture();persist();fit();clearTimeout(saveTimer);saveTimer=setTimeout(()=>send('save'),900);}
  $('decision-form').addEventListener('input',changed);$('decision-form').addEventListener('change',changed);
  $('lock-initial').onclick=async()=>{if(critical||!validateInitial())return;critical=true;render();const ok=await send('lockPlan');critical=false;render();if(ok&&mode==='pilot'){$('final-reason').focus();feedback('Your initial practice position is kept below. Read the new information.',true);}};
  $('submit-final').onclick=async()=>{if(critical||!state.initialSnapshot||!validateFinal())return;critical=true;render();const ok=await send('submit');critical=false;render();if(ok&&mode==='pilot'){$('receipt').focus();feedback('Practice completed locally. No class submission was made.',true);}};
  $('retry-save').onclick=()=>{if(conflict){feedback('Download this browser draft, then use Load saved server version.');return;}if(!state){feedback('Retry starting after browser storage is available.');return;}if(!persist())return;resume();};
  $('download-draft').onclick=download;$('download-receipt').onclick=download;
  function clearLocal(){try{localStorage.removeItem(KEY);}catch{feedback('This browser could not remove the local copy.');return;}location.reload();}
  $('clear-device').onclick=()=>{$('clear-confirmation').hidden=false;};
  $('confirm-clear-device').onclick=()=>{if(!$('confirm-clear').checked){feedback('Confirm that you have kept your downloaded copy before clearing this device.');$('confirm-clear').focus();return;}clearLocal();};
  $('cancel-clear').onclick=()=>{$('clear-confirmation').hidden=true;$('confirm-clear').checked=false;};
  $('discard-draft').onclick=()=>{if(confirm('Clear this browser’s saved attempt and resume access? This does not delete a server record. Continue only if it is your work and you have kept any copy you need.'))clearLocal();};
  window.addEventListener('storage',e=>{if(e.key!==KEY||!state)return;conflict=true;status('Another tab changed this attempt','Download this tab’s writing before reloading. Editing is paused to prevent an overwrite.',true);render();});
  window.addEventListener('online',()=>{if(state&&!conflict)send('save');});
  window.addEventListener('beforeunload',e=>{if(state&&(!storageOK||state.pending||stable(state.answers)!==stable(state.serverAnswers))&&mode!=='pilot'){e.preventDefault();e.returnValue='';}});

  const useServer=document.createElement('button');useServer.id='use-server';useServer.type='button';useServer.className='button button-secondary button-small';useServer.textContent='Load saved server version';useServer.hidden=true;$('save-detail').after(useServer);
  useServer.onclick=async()=>{if(!state||critical)return;if(!confirm('Replace this browser draft with the saved server version? Download your local writing first if you need to keep it.'))return;critical=true;render();try{await queue;const d=await api(makeBody('resume'));accept(d,{replace:true});state.pending=null;state.recoveryNeeded=false;conflict=false;persist();populate();status('Server version loaded','This browser now uses the latest confirmed work.');}catch(e){status('Server copy not loaded',e.message,true);}finally{critical=false;render();}};

  try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s.schema===2&&s.mode===mode&&s.attemptId&&s.token&&s.answers){state=s;conflict=!!s.recoveryNeeded;}else feedback('A saved browser copy could not be recognized. Keep it for your instructor rather than starting duplicate work.');}}catch{storageOK=false;feedback('Browser storage is unavailable. Enable it before starting, or use another normal browser window.');}
  if(mode==='test'){$('firstName').value='Synthetic';$('lastName').value='Fixture';$('email').value='tap-v2@example.invalid';$('firstName').readOnly=true;$('lastName').readOnly=true;$('email').readOnly=true;}
  if(mode==='pilot'){$('firstName').required=false;$('lastName').required=false;$('email').required=false;$('individualWork').required=false;}
  render();
})();
