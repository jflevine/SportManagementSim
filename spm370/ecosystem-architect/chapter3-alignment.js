/* Chapter 3 learning-outcome alignment layer
   Adds: Tier Lens, actor-specific revenue checks, bargaining-power checks, and GC triage. */
(()=>{
'use strict';

const DOMAINS=['IP','Contract','Labor','Antitrust','Governance','Consumer Protection','Safeguarding'];
const ACTIONS=['Handle operationally','Renegotiate / investigate first','Escalate to counsel now'];
const triageConfig={
  pathway:{domain:'Contract',action:'Renegotiate / investigate first',fact:'What do the participation agreements actually say about format changes, transition rights, seeding, revenue, and exit?'},
  sponsor:{domain:'Contract',action:'Renegotiate / investigate first',fact:'What exact morality, brand-safety, notice, cure, and termination language governs the sponsor’s rights?'},
  capital:{domain:'Governance',action:'Renegotiate / investigate first',fact:'What control rights, information flows, conflict disclosures, and organizational firewalls exist across the ownership network?'},
  betting:{domain:'Governance',action:'Renegotiate / investigate first',fact:'What evidence can be preserved, who has contractual cooperation duties, and which integrity body or regulator has authority?'},
  platform:{domain:'Contract',action:'Renegotiate / investigate first',fact:'What exclusivity, co-streaming, highlight, discoverability, and termination rights are actually negotiable?'},
  labor:{domain:'Labor',action:'Escalate to counsel now',fact:'Which jurisdiction applies, and how much control does the organization actually exercise over training, scheduling, exclusivity, appearances, and economic dependence?'},
  antitrust:{domain:'Antitrust',action:'Escalate to counsel now',fact:'Who agreed with whom, which actors compete for player labor, and what market or competitive effect does the restraint create?'},
  consumer:{domain:'Consumer Protection',action:'Escalate to counsel now',fact:'Who are the users, how are prices and probabilities disclosed, what data is collected from minors, and which consumer/privacy rules apply?'},
  license:{domain:'IP',action:'Escalate to counsel now',fact:'Which copyrighted assets, trademarks, software terms, tournament policies, modified clients, and broadcast permissions are implicated?'},
  governance:{domain:'Governance',action:'Renegotiate / investigate first',fact:'Which agreements or publisher rules recognize the integrity body’s sanctions, and who has contractual authority to enforce them?'}
};

function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
function ensureState(){
  state.chapter3=state.chapter3||{};
  const c=state.chapter3;
  if(typeof c.tierComplete!=='boolean')c.tierComplete=false;
  if(typeof c.revenueComplete!=='boolean')c.revenueComplete=false;
  c.revenueAnswers=c.revenueAnswers||{};
  c.powerArchitecture=c.powerArchitecture||null;
  if(typeof c.powerComplete!=='boolean')c.powerComplete=false;
  c.triage=c.triage||{};
  save();
  return c;
}
function q(sel,root=document){return root.querySelector(sel)}
function qa(sel,root=document){return [...root.querySelectorAll(sel)]}

function installTierLens(){
  const brief=q('.brief-panel');
  if(!brief||q('#tierLens'))return;
  const c=ensureState();
  const objectives=q('.mission-objectives',brief);
  if(objectives&&!q('[data-ch3-objective]',objectives)){
    const chip=document.createElement('span');chip.dataset.ch3Objective='1';chip.textContent='Compare competitive tiers';objectives.prepend(chip);
  }
  const sec=document.createElement('section');
  sec.id='tierLens';sec.className='chapter3-block';
  sec.innerHTML=`
    <div class="chapter3-kicker">Chapter 3 · Tier Lens</div>
    <h3>Same esport. Different business reality.</h3>
    <p>Before designing a professional ecosystem, compare how funding, operating logic, and legal exposure change across the competitive pyramid.</p>
    <div class="tier-grid">
      <article class="tier-card grassroots"><b>Grassroots / Community</b><strong>Access + community development</strong><p>Volunteer labor, small entry fees, modest sponsors, and informal operations.</p><ul><li>Revenue: entry fees, local sponsors, small activations</li><li>Pressure: publisher permission, safeguarding, prize terms</li></ul></article>
      <article class="tier-card scholastic"><b>Scholastic / Amateur</b><strong>Development + institutional purpose</strong><p>Amateur teams often self-fund; scholastic programs rely more heavily on institutional support.</p><ul><li>Revenue/support: budgets, scholarships, modest sponsorship, prize money</li><li>Pressure: eligibility, privacy, governance, clear participation terms</li></ul></article>
      <article class="tier-card pro"><b>Professional</b><strong>Recurring revenue + high fixed costs</strong><p>Salaries, travel, production, and facilities demand durable commercial economics.</p><ul><li>Revenue: sponsorship, media, digital goods, support, merch, live events</li><li>Pressure: IP, contracts, labor, antitrust, governance, cross-border risk</li></ul></article>
    </div>
    <div class="chapter3-check" id="tierCheck">
      <strong>Tier Check · Which statement best captures the chapter’s comparison?</strong>
      <div class="chapter3-options">
        <button data-tier-answer="same">The three tiers use essentially the same revenue and legal structure; only prize size changes.</button>
        <button data-tier-answer="shift">Business logic, funding, governance, and legal exposure change by tier, even though the tiers remain connected.</button>
        <button data-tier-answer="pro">Publisher control and legal risk matter only at the professional tier.</button>
      </div>
      <div class="chapter3-feedback" id="tierFeedback"></div>
    </div>`;
  const anchor=q('#mvpModeWrap',brief)||q('.team-entry',brief);
  brief.insertBefore(sec,anchor);
  const begin=q('#beginMission');
  if(begin)begin.disabled=!c.tierComplete;
  qa('[data-tier-answer]',sec).forEach(btn=>btn.addEventListener('click',()=>{
    qa('[data-tier-answer]',sec).forEach(x=>x.classList.remove('correct','wrong'));
    const good=btn.dataset.tierAnswer==='shift';
    btn.classList.add(good?'correct':'wrong');
    const fb=q('#tierFeedback');
    if(good){
      c.tierComplete=true;save();
      fb.className='chapter3-feedback success';
      fb.innerHTML='<b>Correct.</b> The tiers have different economic logic and risk profiles, but player pipelines, brand relationships, and publisher permissions connect them.';
      if(begin)begin.disabled=false;
    }else{
      fb.className='chapter3-feedback';
      fb.textContent='Not quite. Re-read the three tier cards and focus on what changes in funding, formality, governance, and legal exposure.';
    }
  }));
  if(c.tierComplete){
    const correct=q('[data-tier-answer="shift"]',sec);if(correct)correct.classList.add('correct');
    const fb=q('#tierFeedback');fb.className='chapter3-feedback success';fb.innerHTML='<b>Tier comparison complete.</b> You are ready to design the professional ecosystem.';
  }
}

const revenueChecks={
  publisher:{correct:'digital',question:'Publisher',a:'Digital goods + licensing + publisher-run events',b:'Salary + personal sponsorships + prize winnings'},
  organizer:{correct:'event',question:'League / Tournament Organizer',a:'Event sponsorship + media/streaming + ticketing / entry revenue',b:'Game IP licensing to every downstream actor + player salaries'},
  team:{correct:'team',question:'Team',a:'Sponsorship + league/publisher revenue share + merchandise / team digital items',b:'Consumer loot-box sales across the entire game + tournament license fees'},
  player:{correct:'talent',question:'Player / Creator',a:'Salary/compensation + prize money + streaming/content + personal sponsorships',b:'League-wide media rights + venue rental + publisher licensing fees'},
  stability:{correct:'prize',question:'Stability check',a:'Prize money is usually the least reliable operating base for a professional organization.',b:'Publisher-linked digital revenue can never be recurring because it is controlled by the publisher.'}
};
function revenueCheckMarkup(id,d){
  const values=id==='publisher'?['digital','salary']:id==='organizer'?['event','ipowner']:id==='team'?['team','publisherall']:id==='player'?['talent','leaguewide']:['prize','never'];
  return `<div class="revenue-check" data-revenue-question="${id}"><strong>${d.question}</strong><div class="chapter3-options"><button data-revenue-answer="${values[0]}">${d.a}</button><button data-revenue-answer="${values[1]}">${d.b}</button></div><div class="chapter3-feedback"></div></div>`;
}
function installRevenueLens(){
  const ep=q('#ep4');if(!ep||q('#whoGetsPaid'))return;
  const c=ensureState();
  const zone=q('.revenue-zone',ep);if(!zone)return;
  const sec=document.createElement('section');sec.id='whoGetsPaid';sec.className='chapter3-block';
  sec.innerHTML=`<div class="chapter3-kicker">Revenue Map · Who Gets Paid?</div><h3>Map the money before you build the portfolio.</h3><p>The same revenue category can touch multiple actors. These cards identify the primary streams emphasized in Chapter 3; the quick checks then test whether you can distinguish the roles and relative stability.</p>
  <div class="actor-grid">
    <article class="actor-card"><b>Publisher</b><strong>Owns the game and monetization architecture</strong><p>Digital goods, game sales/subscriptions where applicable, licensing, and publisher-direct events can create value.</p><span class="stability">Digital revenue can recur — but deepens publisher control</span></article>
    <article class="actor-card"><b>League / Organizer</b><strong>Commercializes competition</strong><p>Sponsorship, media/streaming, ticketing, entry fees, and event partnerships depend on event quality and permissions.</p><span class="stability">Often event- or calendar-dependent</span></article>
    <article class="actor-card"><b>Team</b><strong>Monetizes brand, talent, and access</strong><p>Sponsorship, revenue sharing, team-linked digital goods, merchandise, and prize money can all matter.</p><span class="stability">Diversification matters; prize money is volatile</span></article>
    <article class="actor-card"><b>Player / Creator</b><strong>Monetizes labor, performance, and audience</strong><p>Salary or other compensation, prize money, streaming/content, and personal sponsorships create the talent-side mix.</p><span class="stability">Contract terms and audience demand matter</span></article>
  </div>
  <div class="revenue-checks">${Object.entries(revenueChecks).map(([id,d])=>revenueCheckMarkup(id,d)).join('')}</div>
  <div id="revenueCheckStatus"></div>`;
  zone.parentNode.insertBefore(sec,zone);
  wireRevenueChecks();
  updateRevenueGate();
}
function wireRevenueChecks(){
  const c=ensureState(),sec=q('#whoGetsPaid');if(!sec)return;
  qa('[data-revenue-question]',sec).forEach(card=>{
    const id=card.dataset.revenueQuestion,d=revenueChecks[id];
    qa('[data-revenue-answer]',card).forEach(btn=>{
      btn.addEventListener('click',()=>{
        if(c.revenueAnswers[id]===d.correct)return;
        qa('[data-revenue-answer]',card).forEach(x=>x.classList.remove('correct','wrong'));
        const good=btn.dataset.revenueAnswer===d.correct;
        btn.classList.add(good?'correct':'wrong');
        const fb=q('.chapter3-feedback',card);
        if(good){c.revenueAnswers[id]=d.correct;fb.className='chapter3-feedback success';fb.textContent=id==='stability'?'Correct. Prize money is visible but too volatile to anchor recurring operations.':'Correct. That bundle best matches the actor’s primary revenue role in this chapter.';save();}
        else{fb.className='chapter3-feedback';fb.textContent='Try again. Focus on who controls the asset, relationship, or transaction.';}
        updateRevenueCompletion();
      });
    });
    if(c.revenueAnswers[id]===d.correct){
      const good=q(`[data-revenue-answer="${d.correct}"]`,card);if(good)good.classList.add('correct');
      const fb=q('.chapter3-feedback',card);fb.className='chapter3-feedback success';fb.textContent='Complete.';
    }
  });
  updateRevenueCompletion();
}
function updateRevenueCompletion(){
  const c=ensureState();
  c.revenueComplete=Object.entries(revenueChecks).every(([id,d])=>c.revenueAnswers[id]===d.correct);
  save();
  const status=q('#revenueCheckStatus');
  if(status)status.innerHTML=c.revenueComplete?'<span class="chapter3-complete">✓ Revenue map complete · now allocate the 100-point operating portfolio</span>':'';
  updateRevenueGate();
}
function updateRevenueGate(){
  const c=ensureState(),btn=q('#toLegal');if(!btn)return;
  btn.disabled=!c.revenueComplete || revenueTotal()!==100;
}
function patchRevenueGate(){
  const original=renderRevenueIntel;
  renderRevenueIntel=function(){original();updateRevenueGate();};
}

const powerData={
  closed:{cards:[['Publisher leverage','↑↑','shift-up'],['Team access certainty','↑↑','shift-up'],['New entrant access','↓','shift-down'],['Contract dependence','↑↑','shift-up'],['Organizer independence','↓','shift-down']],correct:'depend',question:'Which statement best describes the bargaining-power effect?',options:[['depend','Teams gain access certainty, but their value becomes more dependent on publisher-controlled participation and commercial agreements.'],['free','Durable participation rights make teams independent of publisher governance.'],['open','Closed participation automatically increases open access for new entrants.']]},
  open:{cards:[['Publisher direct control','↓','shift-down'],['Publisher meta-governance','REMAINS','shift-mixed'],['Organizer autonomy','↑','shift-up'],['Competitive access','↑↑','shift-up'],['Commercial certainty','↓','shift-down']],correct:'meta',question:'What happens to publisher power in an open circuit?',options:[['gone','It disappears because independent organizers control the events.'],['meta','It shifts toward licenses, rankings, eligibility rules, and tournament-operating requirements rather than disappearing.'],['team','It transfers entirely to teams and players.']]},
  hybrid:{cards:[['Partner certainty','↑','shift-up'],['Open pathways','↑','shift-up'],['Publisher redesign power','↑','shift-up'],['Transition risk','↑','shift-mixed'],['Contract complexity','↑↑','shift-mixed']],correct:'change',question:'Which legal-management issue becomes especially important?',options:[['simple','Contract simplification because partner and qualifier rights become identical.'],['change','Change-of-format, transition, seeding, revenue-entitlement, and termination provisions.'],['none','Publisher redesign no longer matters once open pathways exist.']]}
};
function installPowerPanel(){
  const detail=q('#visionDetail');if(!detail||q('#powerShift'))return;
  const sec=document.createElement('section');sec.id='powerShift';sec.className='chapter3-block hidden';
  detail.parentNode.insertBefore(sec,detail.nextSibling);
  if(state.architecture)renderPowerShift(state.architecture);
}
function renderPowerShift(id){
  const c=ensureState(),data=powerData[id],sec=q('#powerShift');if(!data||!sec)return;
  if(c.powerArchitecture!==id){c.powerArchitecture=id;c.powerComplete=false;save();}
  sec.classList.remove('hidden');
  sec.innerHTML=`<div class="chapter3-kicker">Bargaining Power · What Changed?</div><h3>${architectureDefs.find(a=>a.id===id)?.name||'Architecture'} shifts leverage.</h3><p>The architecture is not just a competition format. It changes access, dependence, certainty, and which agreements become strategically important.</p><div class="power-grid">${data.cards.map(([label,val,cls])=>`<div class="power-card"><b>${label}</b><strong class="${cls}">${val}</strong></div>`).join('')}</div><div class="chapter3-check"><strong>${data.question}</strong><div class="chapter3-options">${data.options.map(([v,t])=>`<button data-power-answer="${v}">${t}</button>`).join('')}</div><div class="chapter3-feedback" id="powerFeedback"></div></div>`;
  const btn=q('#toRevenue');if(btn)btn.disabled=!c.powerComplete;
  qa('[data-power-answer]',sec).forEach(b=>b.addEventListener('click',()=>{
    qa('[data-power-answer]',sec).forEach(x=>x.classList.remove('correct','wrong'));
    const good=b.dataset.powerAnswer===data.correct;b.classList.add(good?'correct':'wrong');
    const fb=q('#powerFeedback');
    if(good){c.powerComplete=true;save();fb.className='chapter3-feedback success';fb.textContent='Correct. Architecture reallocates bargaining power; it does not simply change the tournament bracket.';if(btn)btn.disabled=false;}
    else{fb.className='chapter3-feedback';fb.textContent='Try again. Focus on who controls access and which agreements make that control operational.';}
  }));
  if(c.powerComplete&&c.powerArchitecture===id){
    const good=q(`[data-power-answer="${data.correct}"]`,sec);if(good)good.classList.add('correct');
    const fb=q('#powerFeedback');fb.className='chapter3-feedback success';fb.textContent='Bargaining-power check complete.';if(btn)btn.disabled=false;
  }
}
function patchArchitecture(){
  const original=selectArchitecture;
  selectArchitecture=function(id){original(id);renderPowerShift(id);};
}

function triageEntry(id){const c=ensureState();c.triage[id]=c.triage[id]||{domain:false,action:false};return c.triage[id];}
function triageMarkup(c){
  const cfg=triageConfig[c.id]||{domain:'Contract',action:'Renegotiate / investigate first',fact:'What agreement, rule, or factual detail determines who has authority and who bears the risk?'};
  return `<div class="gc-triage" data-triage="${c.id}"><h4>GENERAL COUNSEL TRIAGE</h4><p>Management decision made. Now identify the legal domain and decide whether management should handle, investigate/renegotiate, or escalate.</p><div class="gc-grid"><div class="gc-question"><strong>1 · Primary legal domain</strong><div class="gc-options">${DOMAINS.map(x=>`<button data-gc-domain="${x}">${x}</button>`).join('')}</div><div class="gc-feedback" data-gc-domain-feedback></div></div><div class="gc-question"><strong>2 · Best next management posture</strong><div class="gc-options">${ACTIONS.map(x=>`<button data-gc-action="${x}">${x}</button>`).join('')}</div><div class="gc-feedback" data-gc-action-feedback></div></div></div><div class="gc-missing hidden" data-gc-fact><b>FACT YOU STILL NEED:</b> ${cfg.fact}</div><div class="gc-ready hidden" data-gc-ready>✓ Triage complete. You may advance to the next incident.</div></div>`;
}
function patchCrisisTriage(){
  const originalResult=crisisResult;
  crisisResult=function(c,i){
    const o=c.options[i];
    return `<div class="crisis-result"><h4>CONSEQUENCE</h4><p>${o.result}</p><div class="shift-grid"><div><b>FINANCIAL</b><strong>${fmt(o.impact.financial)}</strong></div><div><b>RESILIENCE</b><strong>${fmt(o.impact.resilience)}</strong></div><div><b>LEGITIMACY</b><strong>${fmt(o.impact.legitimacy)}</strong></div></div>${triageMarkup(c)}<button class="nextbtn" id="crisisNext" disabled>${state.crisisIndex<state.crises.length-1?'NEXT INCIDENT →':'CALL THE BOARD →'}</button></div>`;
  };
  const originalRender=renderCrisis;
  renderCrisis=function(){originalRender();wireCurrentTriage();};
}
function wireCurrentTriage(){
  const c=currentCrisis();if(!c)return;
  const panel=q(`[data-triage="${c.id}"]`);if(!panel)return;
  const cfg=triageConfig[c.id]||{domain:'Contract',action:'Renegotiate / investigate first'};
  const entry=triageEntry(c.id),next=q('#crisisNext');
  const refresh=()=>{
    const complete=entry.domain===true&&entry.action===true;
    const fact=q('[data-gc-fact]',panel),ready=q('[data-gc-ready]',panel);
    if(fact)fact.classList.toggle('hidden',!complete);if(ready)ready.classList.toggle('hidden',!complete);if(next)next.disabled=!complete;
    if(complete)save();
  };
  const restore=(type,correct)=>{
    const sel=type==='domain'?'[data-gc-domain]':'[data-gc-action]';
    if(entry[type]===true){qa(sel,panel).forEach(b=>{if((b.dataset.gcDomain||b.dataset.gcAction)===correct)b.classList.add('selected-good');b.disabled=true;});const fb=q(type==='domain'?'[data-gc-domain-feedback]':'[data-gc-action-feedback]',panel);if(fb)fb.textContent='Correct.';}
  };
  restore('domain',cfg.domain);restore('action',cfg.action);
  qa('[data-gc-domain]',panel).forEach(btn=>btn.addEventListener('click',()=>{
    if(entry.domain===true)return;
    qa('[data-gc-domain]',panel).forEach(x=>x.classList.remove('selected-good','selected-bad'));
    const good=btn.dataset.gcDomain===cfg.domain;btn.classList.add(good?'selected-good':'selected-bad');
    const fb=q('[data-gc-domain-feedback]',panel);
    if(good){entry.domain=true;qa('[data-gc-domain]',panel).forEach(x=>x.disabled=true);fb.textContent='Correct. This is the best primary classification for the simulation; overlapping issues may still exist.';save();}
    else fb.textContent='Try again. Identify the legal framework most directly shaping the business decision.';
    refresh();
  }));
  qa('[data-gc-action]',panel).forEach(btn=>btn.addEventListener('click',()=>{
    if(entry.action===true)return;
    qa('[data-gc-action]',panel).forEach(x=>x.classList.remove('selected-good','selected-bad'));
    const good=btn.dataset.gcAction===cfg.action;btn.classList.add(good?'selected-good':'selected-bad');
    const fb=q('[data-gc-action-feedback]',panel);
    if(good){entry.action=true;qa('[data-gc-action]',panel).forEach(x=>x.disabled=true);fb.textContent='Correct. The point is managerial legal literacy: know what can be handled, what must be investigated, and what warrants counsel.';save();}
    else fb.textContent='Try again. Consider urgency, legal exposure, and whether a manager can act safely without specialized review.';
    refresh();
  }));
  refresh();
}

function polishLabels(){
  const ep4=q('#ep4 .episode-heading p');if(ep4)ep4.innerHTML='First map <strong>who gets paid</strong>. Then allocate <strong>100 operating-revenue points</strong> to build a sustainable portfolio.';
  const ep6=q('#ep6 .episode-heading p');if(ep6)ep6.innerHTML='Three shocks will hit Year One. Make the management decision first, then classify the <strong>legal domain</strong>, choose the <strong>management/counsel posture</strong>, and identify the missing fact.';
}

function init(){
  if(typeof state==='undefined'||typeof save!=='function')return;
  ensureState();
  installTierLens();
  installPowerPanel();
  patchArchitecture();
  installRevenueLens();
  patchRevenueGate();
  patchCrisisTriage();
  polishLabels();
}
ready(init);
})();
