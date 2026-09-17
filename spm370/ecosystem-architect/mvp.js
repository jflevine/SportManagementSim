/* Ecosystem Architect: Season One — MVP classroom layer */
(()=>{
'use strict';
const APP_VERSION='Season One MVP 1.0';
const CRISIS_COUNTS={sprint:2,standard:3,deep:4};
const MODE_LABELS={sprint:'Sprint · 10–12 min',standard:'Standard Class · 18–22 min',deep:'Deep Dive · 25–30 min'};
const nowIso=()=>new Date().toISOString();
const safe=(v='')=>String(v).replace(/[<>]/g,'');
const ensureMvp=()=>{
  state.mvp=state.mvp||{};
  state.mvp.version=APP_VERSION;
  state.mvp.mode=state.mvp.mode||'standard';
  state.mvp.sessionId=state.mvp.sessionId||`NX-${Math.random().toString(36).slice(2,7).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  state.mvp.startedAt=state.mvp.startedAt||null;
  state.mvp.completedAt=state.mvp.completedAt||null;
  state.mvp.journal=Array.isArray(state.mvp.journal)?state.mvp.journal:[];
  state.mvp.forcedCrisis=state.mvp.forcedCrisis||null;
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
  wrap.innerHTML=`<div class="mvp-mode-head"><b>CLASSROOM RUN MODE</b><span>Changes crisis depth, not core concepts.</span></div>
  <div class="mvp-modes">
    <button class="mvp-mode" data-mode="sprint"><strong>SPRINT</strong><em>10–12 MIN · 2 CRISES</em><small>Fast pod activity. Best for a lecture block or recap.</small></button>
    <button class="mvp-mode" data-mode="standard"><strong>STANDARD CLASS</strong><em>18–22 MIN · 3 CRISES</em><small>Recommended. Full arc with enough pressure for discussion.</small></button>
    <button class="mvp-mode" data-mode="deep"><strong>DEEP DIVE</strong><em>25–30 MIN · 4 CRISES</em><small>More strategic variance for extended discussion or assessment.</small></button>
  </div>
  <div class="mvp-session-chip">SESSION <b id="mvpSessionId"></b> · <span id="mvpModeLabel"></span></div>
  <div class="mvp-privacy">No student response data is transmitted by this MVP. Progress stays in this browser unless exported.</div>`;
  const teamEntry=brief.querySelector('.team-entry');
  brief.insertBefore(wrap,teamEntry);
  wrap.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    state.mvp.mode=btn.dataset.mode;save();renderMode();
  }));
  renderMode();
}
function renderMode(){
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===state.mvp.mode));
  const id=document.getElementById('mvpSessionId'),label=document.getElementById('mvpModeLabel');
  if(id)id.textContent=state.mvp.sessionId;if(label)label.textContent=MODE_LABELS[state.mvp.mode];
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
  p.innerHTML=`<div class="mvp-kicker">Projector / Demo Controls</div><h3>Instructor Console</h3><p>These controls affect only this browser. They do not remotely control student devices in the current MVP.</p>
  <div class="mvp-instructor"><label>Run mode</label><select id="mvpInstructorMode"><option value="sprint">Sprint · 2 crises</option><option value="standard">Standard · 3 crises</option><option value="deep">Deep Dive · 4 crises</option></select><label>Force next spotlight crisis</label><select id="mvpCrisisSelect"><option value="">No override</option>${crisisBank.map(c=>`<option value="${c.id}">${c.title}</option>`).join('')}</select><div class="mvp-instructor-actions"><button id="mvpSetCrisis">Set Next Crisis</button><button id="mvpRevealConcepts">Reveal Concepts</button><button id="mvpCopyDebrief">Copy Debrief</button><button id="mvpJumpFinal">Jump to Final Board</button></div></div>
  <div class="mvp-progress-card"><div class="line"><span>Session</span><b>${state.mvp.sessionId}</b></div><div class="line"><span>Mode</span><b>${MODE_LABELS[state.mvp.mode]}</b></div><div class="line"><span>Elapsed</span><b>${elapsed()}</b></div><div class="line"><span>Current architecture</span><b>${architectureName()}</b></div></div>`;
  const mode=document.getElementById('mvpInstructorMode');mode.value=state.mvp.mode;mode.onchange=()=>{state.mvp.mode=mode.value;save();renderMode();renderInstructor()};
  const crisis=document.getElementById('mvpCrisisSelect');crisis.value=state.mvp.forcedCrisis||'';
  document.getElementById('mvpSetCrisis').onclick=()=>{state.mvp.forcedCrisis=crisis.value||null;save();journal('instructor','Crisis override',state.mvp.forcedCrisis?crisisBank.find(c=>c.id===state.mvp.forcedCrisis)?.title:'Override cleared');renderInstructor()};
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
  const count=CRISIS_COUNTS[state.mvp.mode]||3;
  const categories=[['pathway','capital','platform'],['sponsor','labor','consumer'],['betting','antitrust','license','governance']];
  let picks=categories.map(g=>g[Math.floor(Math.random()*g.length)]);
  const pool=crisisBank.map(c=>c.id).filter(id=>!picks.includes(id));
  while(picks.length<count&&pool.length){picks.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}
  if(state.mvp.forcedCrisis){picks=picks.filter(x=>x!==state.mvp.forcedCrisis);picks.unshift(state.mvp.forcedCrisis);state.mvp.forcedCrisis=null}
  return picks.slice(0,count);
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
    journal('season launch',MODE_LABELS[state.mvp.mode],`${state.crises.length} Year One incidents armed.`);
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
  box.innerHTML=`<h3>Complete the board defense</h3><p>Select a Year Two decision and defend it in at least 30 characters. This creates a portable session record for discussion or submission.</p><div class="mvp-complete-actions"><button class="primary" id="mvpComplete" disabled>COMPLETE RUN</button><button id="mvpExport">Download Session JSON</button><button id="mvpCopySummary">Copy Debrief</button></div>`;
  area.appendChild(box);
  document.getElementById('mvpComplete').onclick=completeRun;
  document.getElementById('mvpExport').onclick=exportSession;
  document.getElementById('mvpCopySummary').onclick=()=>copyText(buildDebrief());
  updateCompletionGate();
}
function updateCompletionGate(){const b=document.getElementById('mvpComplete');if(!b)return;const reason=(document.getElementById('yearReason')?.value||'').trim();b.disabled=!(state.yearDecision&&reason.length>=30)}
function completeRun(){
  const reason=(document.getElementById('yearReason')?.value||'').trim();if(!state.yearDecision||reason.length<30)return;
  state.mvp.completedAt=nowIso();state.mvp.yearReason=reason;journal('completion','Board defense completed',`${state.yearDecision} · ${reason}`);save();showCompletion();
}
function showCompletion(){
  let modal=document.getElementById('mvpCompletion');if(!modal){modal=document.createElement('div');modal.id='mvpCompletion';modal.className='mvp-completion';document.body.appendChild(modal)}
  const leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  modal.innerHTML=`<div class="mvp-completion-card"><span class="seal">RUN COMPLETE</span><h2>${archetype()}</h2><p>${safe(state.team)} completed ${MODE_LABELS[state.mvp.mode]} in ${elapsed()}.</p><div class="mvp-completion-grid"><div><small>Architecture</small><b>${architectureName()}</b></div><div><small>Legal resilience</small><b>${state.metrics.resilience}/100</b></div><div><small>Salience leader</small><b>${leader.role}</b></div><div><small>Publisher dependency</small><b>${publisherDependency()}%</b></div><div><small>Concepts unlocked</small><b>${state.unlocked.length}</b></div><div><small>Session</small><b>${state.mvp.sessionId}</b></div></div><div class="mvp-complete-actions"><button class="primary" id="mvpModalCopy">COPY DEBRIEF</button><button id="mvpModalExport">DOWNLOAD JSON</button><button id="mvpModalClose">RETURN TO REPORT</button></div></div>`;
  modal.classList.add('open');document.getElementById('mvpModalCopy').onclick=()=>copyText(buildDebrief());document.getElementById('mvpModalExport').onclick=exportSession;document.getElementById('mvpModalClose').onclick=()=>modal.classList.remove('open');
}
function sessionPayload(){
  const leader=stakeholderDefs.find(s=>s.id===salienceLeader()[0]);
  return {app:'Ecosystem Architect: Season One',version:APP_VERSION,sessionId:state.mvp.sessionId,team:state.team,mode:state.mvp.mode,startedAt:state.mvp.startedAt,completedAt:state.mvp.completedAt,architecture:state.architecture,priorities:state.priorities,revenue:state.revenue,contracts:state.contracts,metrics:state.metrics,publisherDependency:publisherDependency(),salienceLeader:leader?.role,crises:state.crises,crisisAnswers:state.crisisAnswers,conceptsUnlocked:state.unlocked,yearDecision:state.yearDecision,yearReason:state.mvp.yearReason||document.getElementById('yearReason')?.value||'',journal:state.mvp.journal,privacy:'Local browser export; no centralized submission in MVP.'};
}
function exportSession(){const data=JSON.stringify(sessionPayload(),null,2),blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ecosystem-architect-${state.mvp.sessionId}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
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
