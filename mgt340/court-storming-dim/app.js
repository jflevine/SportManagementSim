'use strict';
(() => {
  const STORAGE_KEY = 'mgt340-court-storming-dim-v1';
  const AP_URL = 'https://apnews.com/article/caitlin-clark-fans-storming-court-7f226a252df600432734db409d3b5b3e';
  const STEP_NAMES = ['Case', 'Develop', 'Implement', 'Manage', 'Update', 'Your plan'];
  const FIELDS = {
    risk: 'Risk and people affected', prevent1: 'Preventive action 1', prevent2: 'Preventive action 2',
    deployment: 'Who, where, and when', communication: 'Briefing and communication',
    monitor: 'Monitoring during the game', review: 'Evidence and improvement after the game', response: 'Response to the hypothetical update'
  };
  const GROUPS = [[], ['risk', 'prevent1', 'prevent2'], ['deployment', 'communication'], ['monitor', 'review'], ['response']];
  const PLAN_KEYS = Object.keys(FIELDS).filter(k => k !== 'response');
  const fresh = () => ({version:1, step:0, unlocked:0, mode:'solo', name1:'', name2:'', answers:Object.fromEntries(Object.keys(FIELDS).map(k=>[k,''])), created:new Date().toISOString()});
  let state = fresh();
  let storageAvailable = true;
  let storageNote = '';
  let toastTimer;
  const $ = s => document.querySelector(s);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wordCount = text => text.trim().split(/\s+/).filter(Boolean).length;
  const hasIdentity = () => Boolean(state.name1.trim() && (state.mode === 'solo' || state.name2.trim()));
  function validStep(step) { return step === 0 ? hasIdentity() : (GROUPS[step] || []).every(k => state.answers[k].trim()); }
  function safeReach() { let reach = 0; while(reach < 5 && validStep(reach)) reach++; return reach; }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1 || !saved.answers || typeof saved.answers !== 'object') throw new Error('Invalid saved plan');
      const clean = fresh();
      clean.mode = saved.mode === 'pair' ? 'pair' : 'solo';
      for (const k of ['name1','name2']) clean[k] = typeof saved[k] === 'string' ? saved[k].slice(0,100) : '';
      for (const k of Object.keys(FIELDS)) clean.answers[k] = typeof saved.answers[k] === 'string' ? saved.answers[k].slice(0,1600) : '';
      if (typeof saved.created === 'string' && !Number.isNaN(Date.parse(saved.created))) clean.created = saved.created;
      state = clean;
      const requested = Number.isInteger(saved.unlocked) ? Math.max(0,Math.min(5,saved.unlocked)) : 0;
      state.unlocked = Math.min(requested,safeReach());
      state.step = Number.isInteger(saved.step) ? Math.max(0,Math.min(state.unlocked,saved.step)) : 0;
      storageNote = 'Saved work restored on this device.';
    }
  } catch (error) {
    storageNote = 'A saved plan could not be restored. You can start a new plan.';
  }
  function storageStatus() {
    $('#save-status').textContent = storageAvailable ? (storageNote || 'Saved on this device · Submit separately in Canvas') : 'Device saving unavailable · Export your work before closing';
  }
  function save() {
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageAvailable=true;storageNote='';}
    catch {storageAvailable=false;}
    storageStatus();
  }
  // Probe writable storage without changing an existing plan.
  try {localStorage.setItem(STORAGE_KEY+'-check','1');localStorage.removeItem(STORAGE_KEY+'-check');} catch {storageAvailable=false;}
  const count = () => PLAN_KEYS.reduce((n,k)=>n+wordCount(state.answers[k]),0);
  const court = `<figure class="court-panel"><svg viewBox="0 0 330 340" role="img" aria-label="Illustrative court layout: spectator area above the court and a team exit route to the right. Not Ohio State’s actual venue layout."><rect x="18" y="15" width="270" height="37" rx="3" fill="#152c3c"/><text x="153" y="38" fill="white" text-anchor="middle" font-size="12" font-family="Arial">SPECTATORS</text><g fill="#a53032"><circle cx="45" cy="70" r="4"/><circle cx="68" cy="70" r="4"/><circle cx="91" cy="70" r="4"/><circle cx="114" cy="70" r="4"/><circle cx="137" cy="70" r="4"/><circle cx="160" cy="70" r="4"/><circle cx="183" cy="70" r="4"/><circle cx="206" cy="70" r="4"/><circle cx="229" cy="70" r="4"/><circle cx="252" cy="70" r="4"/></g><rect x="20" y="87" width="265" height="157" rx="2" fill="#d5b98e" stroke="#fff" stroke-width="2"/><path d="M152 87v157M20 126h48v80H20M285 126h-48v80h48" fill="none" stroke="white" stroke-width="2"/><circle cx="152" cy="165" r="27" fill="none" stroke="white" stroke-width="2"/><path d="M40 105c70 0 70 120 0 120M265 105c-70 0-70 120 0 120" fill="none" stroke="white" stroke-width="2"/><path d="M40 268h268v-45" fill="none" stroke="#286653" stroke-width="8"/><path d="m298 234 10-14 10 14" fill="none" stroke="#286653" stroke-width="4"/><text x="153" y="297" text-anchor="middle" font-size="12" font-family="Arial" fill="#152c3c">TEAM EXIT ROUTE</text><text x="153" y="320" text-anchor="middle" font-size="10" font-family="Arial" fill="#52636b">Who protects it? When? How?</text></svg><figcaption>Planning schematic · not the actual venue</figcaption></figure>`;
  function field(key, label, hint, rows=3) {
    return `<div class="field"><label for="${key}">${label}<span class="hint" id="${key}-hint">${hint}</span></label><textarea id="${key}" name="${key}" rows="${rows}" maxlength="1600" required aria-describedby="${key}-hint">${esc(state.answers[key])}</textarea></div>`;
  }
  const backNext = (next, number) => `<div class="actions"><button type="button" class="secondary" data-go="${number-1}">Back</button><button type="submit" class="primary">${next}<span class="next-arrow" aria-hidden="true">→</span></button></div>`;
  function context() {
    return `<details class="context"><summary>Your plan so far</summary>${PLAN_KEYS.filter(k=>state.answers[k].trim()).map(k=>`<p class="label">${FIELDS[k]}</p><p>${esc(state.answers[k])}</p>`).join('')}</details>`;
  }
  function stageHeader(letter, title, intro) {return `<div class="section-head"><div><p class="eyebrow">${STEP_NAMES[state.step].toUpperCase()} · ${state.step} OF 3</p><h1>${title}</h1></div><span class="phase-letter" aria-hidden="true">${letter}</span></div><p class="lead">${intro}</p><p class="word-count" id="word-count">D.I.M. plan: ${count()} words · Aim for about 200 words in total.</p>`;}
  function intro() {return `<div class="intro-grid"><div><p class="eyebrow">RISK MANAGEMENT · 15 MINUTES</p><h1>Court Storming:<br>The Manager’s Plan</h1><p class="lead">You run the event. Build a plan to protect people when the final buzzer sounds.</p><div class="case-note"><strong>The case: Caitlin Clark at Ohio State</strong><p>On January 21, 2024, Clark collided with a spectator during a court storming after Iowa’s loss at Ohio State. AP reported that she was shaken up but not injured.</p><a href="${AP_URL}" target="_blank" rel="noopener noreferrer">Read the AP article <span class="small">(opens a new tab)</span></a></div></div>${court}</div><div class="form-block"><p><strong>Your assignment:</strong> Role-play as Ohio State’s event manager reviewing the incident. Prepare a D.I.M. plan for the next home game, then respond to one hypothetical update.</p><form id="activity-form" class="start-form"><fieldset class="mode-picker"><legend>How are you working?</legend><label><input type="radio" name="mode" value="solo" ${state.mode==='solo'?'checked':''}> By myself</label><label><input type="radio" name="mode" value="pair" ${state.mode==='pair'?'checked':''}> With a partner</label></fieldset><div class="form-row"><div class="field"><label for="name1">Your name</label><input type="text" id="name1" maxlength="100" autocomplete="name" required value="${esc(state.name1)}"></div><div class="field" id="partner-field" ${state.mode==='pair'?'':'hidden'}><label for="name2">Partner’s name</label><input type="text" id="name2" maxlength="100" ${state.mode==='pair'?'required':''} autocomplete="off" value="${esc(state.name2)}"></div></div><p class="small">Read the case first. Choose one risk, write a practical plan, and check how you would respond under pressure. Short bullets are welcome.</p><div class="actions"><button type="submit" class="primary">Develop your plan<span class="next-arrow" aria-hidden="true">→</span></button></div><p class="action-note" style="margin-top:15px">Your names and responses stay on this device. At the end, download or copy your plan and submit it in Canvas.</p></form></div>`;}
  function develop() {return `<div class="form-block">${stageHeader('D','Develop the plan.','Define one collision risk and two actions that could reduce it at the next game.')}<form id="activity-form">${field('risk','What is the risk, and who could be harmed?','Connect your risk to a fact from the Clark incident. Consider athletes, officials, spectators, and staff.')}${field('prevent1','Preventive action 1','Describe a concrete action the host university could take before a crowd enters the court.',2)}${field('prevent2','Preventive action 2','Add a different action that supports the same safety goal.',2)}${backNext('Put it into practice',1)}</form></div>`;}
  function implement() {return `<div class="form-block">${stageHeader('I','Put it into practice.','A written plan needs people, resources, and an activation point. Make your two actions workable.')}${context()}<form id="activity-form">${field('deployment','Who does what, where, and when?','Name staff roles, their locations, and the time or signal that activates your plan. “More security” needs specifics.',4)}${field('communication','How will staff be prepared and communicate?','Describe the pregame briefing or rehearsal and how staff share instructions and report a problem.',3)}${backNext('Check how it works',2)}</form></div>`;}
  function manage() {return `<div class="form-block">${stageHeader('M','Check and improve it.','Decide how you will know whether staff are carrying out the plan and whether it needs to change.')}${context()}<form id="activity-form">${field('monitor','What will a supervisor monitor during the game?','Identify one observable check and the warning sign that would trigger an adjustment.',3)}${field('review','What will you review afterward?','Name the evidence you would use to judge the plan and one finding that would lead you to revise it.',3)}<p class="small">The next step adds a new situation. You can still revisit your plan.</p>${backNext('Reveal the update',3)}</form></div>`;}
  function update() {return `<div class="form-block"><p class="eyebrow">APPLY YOUR PLAN · HYPOTHETICAL UPDATE</p><h1>Thirty seconds remain.</h1><p class="lead">Use the plan you just made to respond as the situation changes.</p><div class="update-banner"><p class="eyebrow">STAFF RADIO · NEXT HOME GAME</p><div class="clock" aria-label="30 seconds">00:30</div><p>The game is close. Spectators begin gathering near the court. A staff member reports that the visiting team’s planned exit route is becoming crowded.</p></div>${context()}<form id="activity-form">${field('response','What do you do now, and who carries it out?','Write two sentences. State your immediate action, name the responsible role, and explain any adjustment to your plan.',4)}<p class="small">This update is invented for the exercise. It is not a reconstruction of the 2024 incident.</p>${backNext('Review your completed plan',4)}</form></div>`;}
  function summarySection(title, keys, step) {return `<section class="summary-section"><div class="summary-heading"><h2>${title}</h2><button type="button" class="text-button" data-go="${step}">Edit ${STEP_NAMES[step].toLowerCase()}</button></div>${keys.map(k=>`<h3>${FIELDS[k]}</h3><p class="answer">${esc(state.answers[k])}</p>`).join('')}</section>`;}
  function summary() {
    const names = state.mode === 'pair' ? `${state.name1} & ${state.name2}` : state.name1;
    return `<p class="eyebrow">MGT 340 · COURT-STORMING RISK MANAGEMENT</p><h1>Your D.I.M. plan</h1><div class="summary-meta"><span><strong>${esc(names)}</strong></span><span>${state.mode==='pair'?'Pair':'Individual'} activity</span><span>${count()} D.I.M. words</span></div><div class="notice"><strong>Your plan is ready to export.</strong> It has not been submitted. Download or copy it, then submit it in Canvas as your instructor directs.</div><div class="actions"><button type="button" class="primary" id="download-button">Download plan (.txt)</button><button type="button" class="secondary" id="copy-button">Copy for Canvas</button><button type="button" class="secondary" id="print-button">Print / Save PDF</button></div><div id="copy-fallback" class="copy-fallback" hidden><label for="export-text">Copy this text manually</label><textarea id="export-text" readonly></textarea></div>${summarySection('D · Develop',GROUPS[1],1)}${summarySection('I · Implement',GROUPS[2],2)}${summarySection('M · Manage',GROUPS[3],3)}<section class="summary-section"><div class="summary-heading"><h2>The update</h2><button type="button" class="text-button" data-go="4">Edit response</button></div><p class="small">Hypothetical: With 30 seconds remaining, spectators gather near the court and the visiting team’s planned exit route becomes crowded.</p><p class="answer">${esc(state.answers.response)}</p></section><div class="receipt"><strong>For the class discussion</strong><p>If nobody is injured, is that enough evidence that your plan worked?</p><p>This is an applied planning exercise. Completing the prompts does not automatically evaluate the quality of your plan.</p></div><p class="small">Case source: <a href="${AP_URL}" target="_blank" rel="noopener noreferrer">Associated Press · Caitlin Clark’s collision with a fan</a>. Planning scenario and update are instructional hypotheticals.</p>`;
  }
  const pages = [intro,develop,implement,manage,update,summary];
  function nav() {
    const reach = Math.min(state.unlocked,safeReach());
    $('#steps').innerHTML = STEP_NAMES.map((name,i)=>`<button type="button" class="step ${state.step===i?'current':''} ${i<reach?'done':''}" data-go="${i}" ${i>reach?'disabled':''} ${state.step===i?'aria-current="step"':''}><span class="step-num" aria-hidden="true">${i<reach?'✓':i+1}</span><span>${name}</span></button>`).join('');
  }
  function navigate(step) {
    if (step<0 || step>Math.min(state.unlocked,safeReach())) return;
    state.step=step;save();render();$('#main').focus();window.scrollTo({top:0,behavior:'instant'});
  }
  function render() {
    nav();$('#main').innerHTML=pages[state.step]();storageStatus();
    const form=$('#activity-form');
    if (form) {
      form.addEventListener('input',event=>{
        const el=event.target;
        el.setCustomValidity('');
        if (el.id==='name1'||el.id==='name2') state[el.id]=el.value;
        else if (Object.hasOwn(FIELDS,el.id)) state.answers[el.id]=el.value;
        if (el.name==='mode') {
          state.mode=el.value==='pair'?'pair':'solo';
          $('#partner-field').hidden=state.mode!=='pair';$('#name2').required=state.mode==='pair';
        }
        save();nav();if($('#word-count')) $('#word-count').textContent=`D.I.M. plan: ${count()} words · Aim for about 200 words in total.`;
      });
      form.addEventListener('submit',event=>{
        event.preventDefault();
        const invalid=[...form.querySelectorAll('[required]')].find(el=>!el.value.trim());
        if(invalid){invalid.setCustomValidity('Please add a response before continuing.');invalid.reportValidity();return;}
        if (!validStep(state.step)) return;
        state.unlocked=Math.max(state.unlocked,state.step+1);navigate(state.step+1);
      });
    }
    if (state.step===5) {
      $('#download-button').addEventListener('click',download);
      $('#copy-button').addEventListener('click',copy);
      $('#print-button').addEventListener('click',()=>window.print());
    }
  }
  function exportText() {
    const names=state.mode==='pair'?`${state.name1} and ${state.name2}`:state.name1;
    return ['COURT STORMING: THE MANAGER’S PLAN','MGT 340 | Jeffrey Levine | La Salle University',`Student(s): ${names}`,`Mode: ${state.mode==='pair'?'Pair':'Individual'}`,`Exported: ${new Date().toLocaleString()}`,'','CASE: Caitlin Clark’s 2024 court-storming collision at Ohio State. AP reported no injury. The plan is a role-play for the next game.','',...[[1,'DEVELOP'],[2,'IMPLEMENT'],[3,'MANAGE']].flatMap(([i,title])=>[title,...GROUPS[i].flatMap(k=>[`${FIELDS[k]}:`,state.answers[k].trim(),''])]),'HYPOTHETICAL UPDATE','Thirty seconds remain in a close game. Spectators gather near the court. Staff report that the visiting team’s planned exit route is becoming crowded.','Response:',state.answers.response.trim(),'','DEBRIEF','If nobody is injured, is that enough evidence that the plan worked?','',`Case source: ${AP_URL}`,'Planning scenario and update are instructional hypotheticals.','This export is not proof of submission. Submit through Canvas as directed.'].join('\n');
  }
  function toast(message){$('#toast').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').textContent='';},6000);}
  function download(){
    const blob=new Blob([exportText()],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;
    const base=(state.name1.trim().replace(/[^a-z0-9_-]+/gi,'_').slice(0,50)||'Student');
    link.download=`DIM_Court_Storming_${base}.txt`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    toast('Download requested. Check your Downloads folder, then submit in Canvas.');
  }
  async function copy(){
    try{await navigator.clipboard.writeText(exportText());toast('Plan copied. Paste it into Canvas to submit.');}
    catch{$('#copy-fallback').hidden=false;$('#export-text').value=exportText();$('#export-text').focus();$('#export-text').select();toast('Select and copy the text below, then paste it into Canvas.');}
  }
  document.addEventListener('click',event=>{const b=event.target.closest('[data-go]');if(b&&!b.disabled) navigate(Number(b.dataset.go));});
  $('#guide-button').addEventListener('click',()=>$('#guide-dialog').showModal());
  $('#close-guide').addEventListener('click',()=>$('#guide-dialog').close());
  $('#reset-button').addEventListener('click',()=>$('#reset-dialog').showModal());
  $('#cancel-reset').addEventListener('click',()=>$('#reset-dialog').close());
  $('#confirm-reset').addEventListener('click',()=>{state=fresh();save();$('#reset-dialog').close();render();$('#main').focus();toast('A new plan is ready.');});
  render();
  if(new URLSearchParams(location.search).get('guide')==='1') $('#guide-dialog').showModal();
})();
