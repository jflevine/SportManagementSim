/* Ecosystem Architect: Season One — MVP classroom layer */
(()=>{
'use strict';
const APP_VERSION='Season One MVP 1.2 · Legal Decision Lab 1';
const MODE_LABELS={standard:'Legal Decision Lab · 18–22 min · 3 fixed crises'};
const FIXED_LAB_CRISES=['pathway','sponsor','license'];
const SUBMISSION_ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/submit-spm370-ldl1';
const nowIso=()=>new Date().toISOString();
const safe=(v='')=>String(v).replace(/[<>]/g,'');
const ensureMvp=()=>{
  state.mvp=state.mvp||{};
  state.mvp.version=APP_VERSION;
  state.mvp.mode='standard';
  state.mvp.sessionId=state.mvp.sessionId||`NX-${Math.random().toString(36).slice(2,7).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  state.mvp.startedAt=state.mvp.startedAt||null;
  state.mvp.completedAt=state.mvp.completedAt||null;
  state.mvp.journal=Array.isArray(state.mvp.journal)?state.mvp.journal:[];
  state.mvp.forcedCrisis=null;
  state.mvp.reduceMotion=!!state.mvp.reduceMotion;
  save();
};
const journal=(type,title,detail)=>{
  ensureMvp();
  const key=`${type}:${title}:${detail}`;
  if(state.mvp.journal.some(x=>x.key===key))return;
  state.mvp.journal.push({key,type,title,detail,at:nowIso()});
  if(state.mvp.journal.length>40)state.mvp.journal=state.mvp.journal.slice(-40);
  save();
};
const stakeholderName=id=>stakeholderDefs.find(s=>s.id===id)?.role||id;
const architectureName=()=>architectureDefs.find(a=>a.id===state.architecture)?.name||'Unset';
const elapsed=()=>{
  if(!state.mvp?.startedAt)return 'Not started';
  const end=state.mvp.completedAt?new Date(state.mvp.completedAt):new Date();
  const mins=Math.max(1,Math.round((end-new Date(state.mvp.startedAt))/60000));
  return `${mins} min`;
};
function appendMissionMode(){
  const brief=document.querySelector('.brief-panel');
  if(!brief||document.getElementById('mvpModeWrap'))return;
  const wrap=document.createElement('div');
  wrap.id='mvpModeWrap';wrap.className='mvp-mode-wrap';
  wrap.innerHTML=`<div class="mvp-mode-head"><b>LEGAL DECISION LAB 1</b><span>Graded standardized run</span></div>
  <div class="mvp-modes"><div class="mvp-mode selected mvp-mode-locked"><strong>STANDARDIZED LAB</strong><em>18–22 MIN · 3 FIXED CRISES</em><small>Every group receives the same three legal fact patterns in the same order so grading is comparable across the class.</small></div></div>
  <div class="mvp-session-chip">SESSION <b id="mvpSessionId"></b> · <span id="mvpModeLabel"></span></div>
  <div class="mvp-privacy">Group gameplay is saved locally. Each student's final individual legal analysis is submitted securely to the instructor record system using their La Salle email.</div>`;
  const teamEntry=brief.querySelector('.team-entry');
  brief.insertBefore(wrap,teamEntry);
  renderMode();
}
function renderMode(){
  const id=document.getElementById('mvpSessionId'),label=document.getElementById('mvpModeLabel');
  if(id)id.textContent=state.mvp.sessionId;if(label)label.textContent=MODE_LABELS.standard;
}
function buildDock(){
  if(document.getElementById('mvpDock'))return;
  const dock=document.createElement('div');dock.id='mvpDock';dock.className='mvp-dock';
  dock.innerHTML=`<button data-open-pane="help">HOW TO PLAY</button><button data-open-pane="journal">DECISIONS</button><button class="mvp-dock-primary" data-open-pane="playbook">PLAYBOOK</button><button data-open-pane="instructor">INSTRUCTOR</button>`;
  document.body.appendChild(dock);
  dock.querySelectorAll('[data-open-pane]').forEach(b=>b.addEventListener('click',()=>openDrawer(b.dataset.openPane)));
}
function buildDrawer(){
  if(document.getElementById('mvpDrawer'))return;
  const d=document.createElement('div');d.id='mvpDrawer';d.className='mvp-drawer';d.setAttribute('aria-hidden','true');
  d.innerHTML=`<aside class="mvp-drawer-panel" role="dialog" aria-modal="true" aria-label="Simulation tools">
    <div class="mvp-drawer-head"><div><small>ECOSYSTEM ARCHITECT</small><h2>Mission Console</h2></div><button class="mvp-close" id="mvpClose">CLOSE ×</button></div>
    <div class="mvp-tabs"><button class="mvp-tab" data-pane="help">How to Play</button><button class="mvp-tab" data-pane="journal">Decision Log</button><button class="mvp-tab" data-pane="playbook">Playbook</button><button class="mvp-tab" data-pane="instructor">Instructor</button></div>
    <section class="mvp-pane" data-pane-body="help"></section><section class="mvp-pane" data-pane-body="journal"></section><section class="mvp-pane" data-pane-body="playbook"></section><section class="mvp-pane" data-pane-body="instructor"></section>
  </aside>`;
  document.body.appendChild(d);
  document.getElementById('mvpClose').onclick=closeDrawer;
  d.addEventListener('click',e=>{if(e.target===d)closeDrawer()});
  d.querySelectorAll('[data-pane]').forEach(b=>b.onclick=()=>activatePane(b.dataset.pane));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.classList.contains('open'))closeDrawer()});
}
function openDrawer(pane='playbook'){const d=document.getElementById('mvpDrawer');d.classList.add('open');d.setAttribute('aria-hidden','false');activatePane(pane);}
function closeDrawer(){const d=document.getElementById('mvpDrawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');}
function activatePane(name){
  document.querySelectorAll('.mvp-tab').forEach(b=>b.classList.toggle('active',b.dataset.pane===name));
  document.querySelectorAll('.mvp-pane').forEach(p=>p.classList.toggle('active',p.dataset.paneBody===name));
  renderPanes(name);
}
function renderPanes(name){
  if(name==='help')renderHelp();
  if(name==='journal')renderJournal();
  if(name==='playbook')renderPlaybookPane();
  if(name==='instructor')renderInstructor();
}
function renderHelp(){
  const p=document.querySelector('[data-pane-body="help"]');
  p.innerHTML=`<div class="mvp-kicker">Student Guide</div><h3>How to play Season One</h3><p>You are designing the competitive ecosystem for NEXUS//ARENA. There is no perfect build. Every decision changes who has leverage, where money comes from, and which risks become more important.</p>
  <div class="mvp-help-grid"><div class="mvp-help-card"><b>1 · Stakeholders</b><p>Power = capacity to influence. Legitimacy = recognized credibility. Urgency = need for immediate attention.</p></div><div class="mvp-help-card"><b>2 · Architecture</b><p>Closed, open, and hybrid models distribute access, certainty, control, and volatility differently.</p></div><div class="mvp-help-card"><b>3 · Revenue</b><p>Capital funds runway; recurring operating revenue sustains the ecosystem. Publisher-linked revenue can be stable yet dependent.</p></div><div class="mvp-help-card"><b>4 · Legal Loadout</b><p>Choose five protections. Omitted clauses are not automatically mistakes; they represent accepted risk.</p></div><div class="mvp-help-card"><b>5 · Crises</b><p>Make a management decision before reading the legal concept. Watch stakeholder salience move after the shock.</p></div><div class="mvp-help-card"><b>6 · Board Defense</b><p>Decide whether Year Two should proceed and explain which tradeoff mattered most.</p></div></div>
  <div class="mvp-progress-card"><div class="line"><span>Run mode</span><b>${MODE_LABELS[state.mvp.mode]}</b></div><div class="line"><span>Current episode</span><b>${state.episode||1} / 7</b></div><div class="line"><span>Concepts unlocked</span><b>${state.unlocked.length} / ${Object.keys(concepts).length}</b></div><div class="line"><span>Session</span><b>${state.mvp.sessionId}</b></div></div>
  <label style="display:flex;gap:8px;align-items:center;margin-top:14px;color:#c3d0e8"><input type="checkbox" id="mvpMotion" ${state.mvp.reduceMotion?'checked':''}> Reduce motion and animated transitions</label>`;
  document.getElementById('mvpMotion').onchange=e=>{state.mvp.reduceMotion=e.target.checked;document.body.classList.toggle('mvp-reduce-motion',state.mvp.reduceMotion);save()};
}
function renderJournal(){
  const p=document.querySelector('[data-pane-body="journal"]');
  const items=state.mvp.journal||[];
  p.innerHTML=`<div class="mvp-kicker">Decision Trail</div><h3>Your strategy journal</h3><p>This log records major commitments rather than every click, so students can explain how the ecosystem evolved.</p><div class="mvp-journal">${items.length?items.map(x=>`<div class="mvp-journal-item"><small>${new Date(x.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · ${safe(x.type).toUpperCase()}</small><b>${safe(x.title)}</b><p>${safe(x.detail)}</p></div>`).join(''):'<div class="mvp-journal-item"><b>No major decisions logged yet.</b><p>Advance through the episodes and the journal will build automatically.</p></div>'}</div>`;
}
function renderPlaybookPane(){
  const p=document.querySelector('[data-pane-body="playbook"]');
  p.innerHTML=`<div class="mvp-kicker">Concept Library</div><h3>Legal & Business Playbook</h3><p>Unlocked concepts are the ideas your team has encountered through decisions and crises.</p><div class="mvp-concepts">${Object.entries(concepts).map(([id,[title,body]])=>{const unlocked=state.unlocked.includes(id);return `<div class="mvp-concept ${unlocked?'':'locked'}"><span class="status">${unlocked?'UNLOCKED':'LOCKED'}</span><b>${title}</b><p>${unlocked?body:'Encounter this concept during the simulation to reveal the explanation.'}</p></div>`}).join('')}</div>`;
}
function renderInstructor(){
  const p=document.querySelector('[data-pane-body="instructor"]');
  p.innerHTML=`<div class="mvp-kicker">Projector / Demo Controls</div><h3>Instructor Console</h3>
  <p>Legal Decision Lab 1 is locked to a standardized three-crisis sequence for scoring consistency. Student devices all receive the same fact patterns in the same order.</p>
  <div class="mvp-progress-card"><div class="line"><span>Assessment</span><b>Legal Decision Lab 1</b></div><div class="line"><span>Fixed crises</span><b>The Pathway Disappears · The Sponsor Walks · The Unlicensed Major</b></div><div class="line"><span>Session</span><b>${state.mvp.sessionId}</b></div><div class="line"><span>Elapsed</span><b>${elapsed()}</b></div><div class="line"><span>Current architecture</span><b>${architectureName()}</b></div></div>
  <div class="mvp-instructor-actions"><button id="mvpRevealConcepts">Reveal Concepts</button><button id="mvpCopyDebrief">Copy Debrief</button><button id="mvpJumpFinal">Jump to Final Board</button></div>`;
  document.getElementById('mvpRevealConcepts').onclick=()=>{state.unlocked=Object.keys(concepts);save();renderIntel();renderInstructor()};
  document.getElementById('mvpCopyDebrief').onclick=()=>copyText(buildDebrief());
  document.getElementById('mvpJumpFinal').onclick=()=>{closeDrawer();showEpisode(7);renderFinal();enhanceFinal()};
}
function buildDebrief(){
  const leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  return `ECOSYSTEM ARCHITECT — CLASS DEBRIEF\nTeam: ${state.team}\nSession: ${state.mvp.sessionId}\nMode: ${MODE_LABELS[state.mvp.mode]}\nArchitecture: ${architectureName()}\nFinancial: ${state.metrics.financial}/100\nAccess: ${state.metrics.access}/100\nControl: ${state.metrics.control}/100\nResilience: ${state.metrics.resilience}/100\nLegitimacy: ${state.metrics.legitimacy}/100\nPublisher-linked revenue: ${publisherDependency()}%\nSalience leader: ${leader.role}\nConcepts unlocked: ${state.unlocked.length}\nYear Two: ${state.yearDecision||'Not selected'}`;
}
async function copyText(txt){try{await navigator.clipboard.writeText(txt);const t=document.getElementById('toast');if(t){t.textContent='Copied to clipboard.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}}catch(e){console.warn(e)}}
function chooseCrises(){
  return [...FIXED_LAB_CRISES];
}
function installSeasonOverride(){
  const button=document.getElementById('launchSeason');if(!button)return;
  button.onclick=()=>{
    applyPriorityBias();
    state.metrics.resilience=clamp(state.metrics.resilience+state.contracts.length*3);
    if(state.contracts.includes('exit'))state.metrics.resilience=clamp(state.metrics.resilience+4);
    if(state.contracts.includes('format'))state.metrics.resilience=clamp(state.metrics.resilience+5);
    if(state.contracts.includes('rulebook'))unlockConcept('rulebook',false);
    unlockConcept('contractWeb',false);
    state.crises=chooseCrises();state.crisisIndex=0;state.crisisAnswers={};
    journal('legal loadout','Five protections selected',state.contracts.map(id=>contractDefs.find(c=>c.id===id)?.name).filter(Boolean).join(' · '));
    journal('season launch',MODE_LABELS.standard,`Standardized crises: The Pathway Disappears · The Sponsor Walks · The Unlicensed Major.`);
    save();showEpisode(6);showCrisisCutin();
  };
}
function installDecisionLogging(){
  const priority=document.getElementById('toArchitecture');if(priority)priority.addEventListener('click',()=>journal('board priorities','Priority stakeholders',state.priorities.map(stakeholderName).join(' · ')));
  const arch=document.getElementById('toRevenue');if(arch)arch.addEventListener('click',()=>journal('architecture',architectureName(),architectureDefs.find(a=>a.id===state.architecture)?.lesson||''));
  const rev=document.getElementById('toLegal');if(rev)rev.addEventListener('click',()=>{const top=revenueDefs.map(r=>[r.short,state.revenue[r.id]||0]).sort((a,b)=>b[1]-a[1])[0];journal('money engine',`Lead revenue: ${top[0]} ${top[1]}%`,`Stability ${revenueStability()}/100 · Publisher-linked ${publisherDependency()}%`)});
  document.querySelectorAll('[data-year]').forEach(b=>b.addEventListener('click',()=>{journal('year two',b.textContent.trim(),'Board selected a Year Two posture.');setTimeout(updateCompletionGate,0)}));
  const reason=document.getElementById('yearReason');if(reason)reason.addEventListener('input',updateCompletionGate);
}
function installCrisisWrapper(){
  const original=answerCrisis;
  answerCrisis=function(i){const c=currentCrisis(),opt=c?.options?.[i];original(i);if(c&&opt)journal('crisis decision',c.title,opt.label);};
}
function enhanceFinal(){
  const area=document.querySelector('.year-two');if(!area||document.getElementById('mvpCompleteWrap'))return;
  const box=document.createElement('div');box.id='mvpCompleteWrap';box.className='mvp-complete-wrap';
  box.innerHTML=`<h3>Complete the board defense</h3><p>Your group selects a Year Two decision and defends it in at least 30 characters. This completes the shared deliberation portion of Legal Decision Lab 1.</p><div class="mvp-complete-actions"><button class="primary" id="mvpComplete" disabled>COMPLETE GROUP RUN</button><button id="mvpCopySummary">Copy Group Debrief</button></div>`;
  area.appendChild(box);

  const lab=document.createElement('section');lab.id='mvpLabWrap';lab.className='mvp-lab-wrap';
  const crisisOptions=FIXED_LAB_CRISES.map(id=>{const c=crisisBank.find(x=>x.id===id);return c?`<option value="${c.id}">${safe(c.title)}</option>`:''}).join('');
  lab.innerHTML=`<div class="mvp-kicker">LEGAL DECISION LAB 1 · INDIVIDUAL SUBMISSION</div>
    <h3>Individual legal decision memo</h3>
    <p class="mvp-lab-intro">Complete this section <strong>individually</strong> after your group finishes the simulation. Choose one of the three standardized crises and demonstrate issue spotting, application of legal principles, stakeholder analysis, and a recommended course of action. Your group's simulation record is shared evidence; the writing below must be your own.</p>
    <div class="mvp-lab-grid">
      <label><span>First name</span><input id="labFirstName" maxlength="60" autocomplete="given-name" placeholder="First name"></label>
      <label><span>Last name</span><input id="labLastName" maxlength="60" autocomplete="family-name" placeholder="Last name"></label>
      <label><span>La Salle email</span><input id="labEmail" type="email" maxlength="120" autocomplete="email" placeholder="student@lasalle.edu"></label>
      <label><span>Crisis you are analyzing</span><select id="labCrisis"><option value="">Select one crisis…</option>${crisisOptions}</select></label>
      <label class="wide"><span>1 · Issue spotting <em>2 pts</em></span><textarea id="labIssue" maxlength="2000" placeholder="Identify the one or two legally significant issues raised by this crisis."></textarea></label>
      <label class="wide"><span>2 · Legal principle + application <em>3 pts</em></span><textarea id="labLaw" maxlength="4000" placeholder="State the relevant legal principle, doctrine, contractual concept, or rule and apply it to the facts your group faced."></textarea></label>
      <label class="wide"><span>3 · Stakeholder analysis <em>2 pts</em></span><textarea id="labStakeholder" maxlength="3000" placeholder="Which stakeholders' rights, power, risk, or interests matter most here, and why?"></textarea></label>
      <label class="wide"><span>4 · Recommended course of action <em>3 pts</em></span><textarea id="labRecommendation" maxlength="4000" placeholder="What should management do next? Give a specific recommendation and defend it using the law and the tradeoffs revealed by the simulation."></textarea></label>
    </div>
    <div class="mvp-lab-rubric"><b>10-point rubric</b><span>Issue spotting 2</span><span>Legal application 3</span><span>Stakeholder analysis 2</span><span>Recommendation 3</span></div>
    <div class="mvp-lab-note"><strong>Official submission:</strong> your name, La Salle email, group simulation record, and individual analysis will be saved securely for instructor grading. The public GitHub site does not display student submissions.</div>
    <div class="mvp-complete-actions"><button class="primary" id="labSubmit" disabled>SUBMIT LEGAL DECISION LAB</button><button id="labDownload" disabled>DOWNLOAD BACKUP</button><button id="labClear">CLEAR FOR NEXT STUDENT</button></div>
    <div id="labReady" class="mvp-lab-ready">Complete the group run and all individual fields to submit.</div>
    <div id="labReceipt" class="mvp-lab-receipt hidden"></div>`;
  area.appendChild(lab);

  document.getElementById('mvpComplete').onclick=completeRun;
  document.getElementById('mvpCopySummary').onclick=()=>copyText(buildDebrief());
  document.getElementById('labSubmit').onclick=submitLabOfficial;
  document.getElementById('labDownload').onclick=downloadLabSubmission;
  document.getElementById('labClear').onclick=clearLabSubmission;
  ['labFirstName','labLastName','labEmail','labCrisis','labIssue','labLaw','labStakeholder','labRecommendation'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',updateLabGate);
    document.getElementById(id)?.addEventListener('change',updateLabGate);
  });
  updateCompletionGate();updateLabGate();
}
function updateCompletionGate(){const b=document.getElementById('mvpComplete');if(!b)return;const reason=(document.getElementById('yearReason')?.value||'').trim();b.disabled=!(state.yearDecision&&reason.length>=30)}
function completeRun(){
  const reason=(document.getElementById('yearReason')?.value||'').trim();if(!state.yearDecision||reason.length<30)return;
  state.mvp.completedAt=nowIso();state.mvp.yearReason=reason;journal('completion','Board defense completed',`${state.yearDecision} · ${reason}`);save();showCompletion();updateLabGate();
}
function showCompletion(){
  let modal=document.getElementById('mvpCompletion');if(!modal){modal=document.createElement('div');modal.id='mvpCompletion';modal.className='mvp-completion';document.body.appendChild(modal)}
  const leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  modal.innerHTML=`<div class="mvp-completion-card"><span class="seal">GROUP RUN COMPLETE</span><h2>${archetype()}</h2><p>${safe(state.team)} completed the standardized Legal Decision Lab run in ${elapsed()}.</p><div class="mvp-completion-grid"><div><small>Architecture</small><b>${architectureName()}</b></div><div><small>Legal resilience</small><b>${state.metrics.resilience}/100</b></div><div><small>Salience leader</small><b>${leader.role}</b></div><div><small>Publisher dependency</small><b>${publisherDependency()}%</b></div><div><small>Fixed crises</small><b>3 / 3 complete</b></div><div><small>Session</small><b>${state.mvp.sessionId}</b></div></div><div class="mvp-complete-actions"><button class="primary" id="mvpModalClose">CONTINUE TO INDIVIDUAL LAB</button><button id="mvpModalCopy">COPY GROUP DEBRIEF</button></div></div>`;
  modal.classList.add('open');
  document.getElementById('mvpModalCopy').onclick=()=>copyText(buildDebrief());
  document.getElementById('mvpModalClose').onclick=()=>{modal.classList.remove('open');document.getElementById('mvpLabWrap')?.scrollIntoView({behavior:'smooth',block:'start'})};
}
function sessionPayload(){
  const leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  return {app:'Ecosystem Architect: Season One',version:APP_VERSION,assessment:'SPM 370 Legal Decision Lab 1',sessionId:state.mvp.sessionId,team:state.team,mode:'standard',startedAt:state.mvp.startedAt,completedAt:state.mvp.completedAt,architecture:state.architecture,priorities:state.priorities,revenue:state.revenue,contracts:state.contracts,metrics:state.metrics,publisherDependency:publisherDependency(),salienceLeader:leader?.role,crises:state.crises,crisisAnswers:state.crisisAnswers,conceptsUnlocked:state.unlocked,yearDecision:state.yearDecision,yearReason:state.mvp.yearReason||document.getElementById('yearReason')?.value||'',journal:state.mvp.journal,privacy:'Student identity and individual analysis are stored only in the secure assessment backend, not in the public GitHub repository.'};
}
function exportSession(){const data=JSON.stringify(sessionPayload(),null,2),blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ecosystem-architect-${state.mvp.sessionId}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}

function labFormData(){
  return {
    first:(document.getElementById('labFirstName')?.value||'').trim(),
    last:(document.getElementById('labLastName')?.value||'').trim(),
    email:(document.getElementById('labEmail')?.value||'').trim().toLowerCase(),
    crisisId:(document.getElementById('labCrisis')?.value||'').trim(),
    issue:(document.getElementById('labIssue')?.value||'').trim(),
    law:(document.getElementById('labLaw')?.value||'').trim(),
    stakeholder:(document.getElementById('labStakeholder')?.value||'').trim(),
    recommendation:(document.getElementById('labRecommendation')?.value||'').trim()
  };
}
function labIsReady(d=labFormData()){
  return !!(state.mvp?.completedAt&&d.first&&d.last&&/^[^\s@]+@lasalle\.edu$/i.test(d.email)&&FIXED_LAB_CRISES.includes(d.crisisId)&&d.issue.length>=20&&d.law.length>=40&&d.stakeholder.length>=20&&d.recommendation.length>=40);
}
function updateLabGate(){
  const d=labFormData(),ready=labIsReady(d),submit=document.getElementById('labSubmit'),download=document.getElementById('labDownload'),status=document.getElementById('labReady');
  if(submit)submit.disabled=!ready;if(download)download.disabled=!ready;
  if(!status)return;
  let msg='Complete the group run and all individual fields to submit.';
  if(state.mvp?.completedAt&&!d.first)msg='Enter your first name.';
  else if(state.mvp?.completedAt&&!d.last)msg='Enter your last name.';
  else if(state.mvp?.completedAt&&d.email&&!/^[^\s@]+@lasalle\.edu$/i.test(d.email))msg='Use your La Salle email ending in @lasalle.edu.';
  else if(state.mvp?.completedAt&&!d.email)msg='Enter your La Salle email.';
  else if(state.mvp?.completedAt&&!d.crisisId)msg='Choose one of the three standardized crises.';
  else if(state.mvp?.completedAt&&d.issue.length<20)msg='Complete the issue-spotting response.';
  else if(state.mvp?.completedAt&&d.law.length<40)msg='Complete the legal principle and application response.';
  else if(state.mvp?.completedAt&&d.stakeholder.length<20)msg='Complete the stakeholder analysis.';
  else if(state.mvp?.completedAt&&d.recommendation.length<40)msg='Complete the recommended course of action.';
  else if(ready)msg='Ready for official submission.';
  status.textContent=msg;status.classList.toggle('ready',ready);
}
function buildLabSubmission(){
  const d=labFormData();if(!labIsReady(d))return '';
  const crisis=crisisBank.find(c=>c.id===d.crisisId),leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  const crisisTrail=(state.crises||[]).map(id=>{const c=crisisBank.find(x=>x.id===id),answer=state.crisisAnswers?.[id],opt=c&&answer!==undefined?c.options?.[answer]:null;return c?`- ${c.title}: ${opt?.label||'No recorded response'}`:''}).filter(Boolean).join('\n');
  const priorities=(state.priorities||[]).map(stakeholderName).join(' · ')||'Not recorded';
  const protections=(state.contracts||[]).map(id=>contractDefs.find(c=>c.id===id)?.name).filter(Boolean).join(' · ')||'Not recorded';
  return `SPM 370 — LEGAL DECISION LAB 1
ECOSYSTEM ARCHITECT: SEASON ONE

STUDENT
Name: ${d.first} ${d.last}
Email: ${d.email}
Session: ${state.mvp?.sessionId||'—'}
Team: ${state.team||'—'}
Completed: ${new Date().toLocaleString()}

SHARED GROUP EVIDENCE
Architecture: ${architectureName()}
Board priorities: ${priorities}
Legal protections selected: ${protections}
Financial sustainability: ${state.metrics.financial}/100
Competitive access: ${state.metrics.access}/100
Publisher control: ${state.metrics.control}/100
Legal resilience: ${state.metrics.resilience}/100
Legitimacy: ${state.metrics.legitimacy}/100
Publisher-linked revenue: ${publisherDependency()}%
Salience leader: ${leader?.role||'—'}
Group Year Two decision: ${state.yearDecision||'Not selected'}
Group defense: ${state.mvp?.yearReason||document.getElementById('yearReason')?.value||'Not recorded'}

CRISIS TRAIL
${crisisTrail}

INDIVIDUAL ANALYSIS
Chosen crisis: ${crisis?.title||d.crisisId}
Scenario: ${crisis?.text||''}

1. ISSUE SPOTTING (0–2)
${d.issue}

2. LEGAL PRINCIPLE + APPLICATION (0–3)
${d.law}

3. STAKEHOLDER ANALYSIS (0–2)
${d.stakeholder}

4. RECOMMENDED COURSE OF ACTION (0–3)
${d.recommendation}

INSTRUCTOR SCORE
Issue spotting: ____ / 2
Legal principle + application: ____ / 3
Stakeholder analysis: ____ / 2
Recommended course of action: ____ / 3
TOTAL: ____ / 10`;
}
async function submitLabOfficial(){
  const d=labFormData();if(!labIsReady(d))return;
  const submit=document.getElementById('labSubmit'),status=document.getElementById('labReady'),receiptBox=document.getElementById('labReceipt');
  submit.disabled=true;submit.textContent='SUBMITTING SECURELY…';status.textContent='Saving your official submission…';status.classList.remove('ready');
  try{
    const payload={
      firstName:d.first,lastName:d.last,email:d.email,chosenCrisis:d.crisisId,
      issueSpotting:d.issue,legalApplication:d.law,stakeholderAnalysis:d.stakeholder,recommendation:d.recommendation,
      teamName:state.team,sessionId:state.mvp.sessionId,version:APP_VERSION,
      startedAt:state.mvp.startedAt,completedAt:state.mvp.completedAt,simulationPayload:sessionPayload()
    };
    const res=await fetch(SUBMISSION_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await res.json().catch(()=>({}));
    if(!res.ok){
      const err=new Error(result.error||'Submission could not be saved.');err.code=result.code;err.receipt=result.receipt;throw err;
    }
    setLabFieldsDisabled(true);
    submit.textContent='SUBMISSION SAVED';
    status.textContent='Official submission saved for instructor grading.';
    status.classList.add('ready');
    if(receiptBox){receiptBox.classList.remove('hidden');receiptBox.innerHTML=`<strong>Submission receipt</strong><span>${safe(result.receipt)}</span><small>No file upload is required. Keep this receipt until your grade is posted.</small>`;}
  }catch(e){
    if(e.code==='ALREADY_SUBMITTED'){
      submit.textContent='ALREADY SUBMITTED';
      status.textContent='A Legal Decision Lab 1 submission already exists for this La Salle email.';
      if(receiptBox&&e.receipt){receiptBox.classList.remove('hidden');receiptBox.innerHTML=`<strong>Existing receipt</strong><span>${safe(e.receipt)}</span><small>Notify your instructor if you believe you need a replacement submission.</small>`;}
    }else{
      submit.textContent='TRY SUBMISSION AGAIN';submit.disabled=false;
      status.textContent=e.message||'Submission could not be saved. Download a backup and notify your instructor.';
    }
  }
}
function setLabFieldsDisabled(disabled){
  ['labFirstName','labLastName','labEmail','labCrisis','labIssue','labLaw','labStakeholder','labRecommendation'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=disabled});
  const download=document.getElementById('labDownload');if(download)download.disabled=false;
}
function downloadLabSubmission(){
  const txt=buildLabSubmission();if(!txt)return;
  const d=labFormData(),safeName=(d.first+'-'+d.last).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'student';
  const blob=new Blob([txt],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`spm370-legal-decision-lab-1-${safeName}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function clearLabSubmission(){
  ['labFirstName','labLastName','labEmail','labCrisis','labIssue','labLaw','labStakeholder','labRecommendation'].forEach(id=>{const el=document.getElementById(id);if(el){el.disabled=false;el.value=''}});
  const submit=document.getElementById('labSubmit');if(submit){submit.textContent='SUBMIT LEGAL DECISION LAB';submit.disabled=true}
  const receiptBox=document.getElementById('labReceipt');if(receiptBox){receiptBox.classList.add('hidden');receiptBox.innerHTML=''}
  updateLabGate();document.getElementById('labFirstName')?.focus();
}

function installErrorBoundary(){
  const box=document.createElement('div');box.id='mvpError';box.className='mvp-error';box.innerHTML='<b>Simulation issue detected.</b> Your local progress is still saved. Reload the page to resume.';document.body.appendChild(box);
  window.addEventListener('error',e=>{console.error(e.error||e.message);box.classList.add('show')});window.addEventListener('unhandledrejection',e=>{console.error(e.reason);box.classList.add('show')});
}
function trackStart(){const begin=document.getElementById('beginMission');if(begin)begin.addEventListener('click',()=>{if(!state.mvp.startedAt)state.mvp.startedAt=nowIso();journal('mission','Season One started',MODE_LABELS[state.mvp.mode]);save()})}
function patchFinalRender(){const original=renderFinal;renderFinal=function(){original();enhanceFinal();if(state.mvp?.completedAt)showCompletion();}}
function init(){
  ensureMvp();document.body.classList.toggle('mvp-reduce-motion',state.mvp.reduceMotion);appendMissionMode();buildDock();buildDrawer();installErrorBoundary();trackStart();installDecisionLogging();installSeasonOverride();installCrisisWrapper();patchFinalRender();
  if(new URLSearchParams(location.search).get('instructor')==='1')setTimeout(()=>openDrawer('instructor'),600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
