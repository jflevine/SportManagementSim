import {MARKETS,MANDATES,createState,getOpportunitySet,advisorViews,estimateProposalImpact,getScenarioModel,forecastCycle,runCycle,finalEvaluation,getDebtSummary} from './model.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=v=>`${v<0?'−':''}$${Math.abs(v).toFixed(Math.abs(v)>=100?0:1)}M`;
const pct=v=>`${(v*100).toFixed(1)}%`;
let marketId='growth', mandateId='growth', mode='class', state=null, opportunities=[], selections=[], activeProposal=null, lastResult=null;

function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function team(){return $('#teamName').value.trim()||'Explorer Sport Group';}
function seed(){return $('#seed').value.trim()||'MGT340';}
function esc(s=''){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function renderSetup(){
  $('#marketOptions').innerHTML=Object.values(MARKETS).map(m=>`<button class="select-card ${m.id===marketId?'selected':''}" data-market="${m.id}"><span>MARKET</span><b>${m.name}</b><small>${m.subtitle}</small></button>`).join('');
  $('#mandateOptions').innerHTML=Object.values(MANDATES).map(m=>`<button class="select-card mandate ${m.id===mandateId?'selected':''}" data-mandate="${m.id}"><span>BOARD MANDATE</span><b>${m.name}</b><small>${m.tag}</small></button>`).join('');
  $$('[data-market]').forEach(b=>b.onclick=()=>{marketId=b.dataset.market;renderSetup()});
  $$('[data-mandate]').forEach(b=>b.onclick=()=>{mandateId=b.dataset.mandate;renderSetup()});
}

$$('[data-mode]').forEach(b=>b.onclick=()=>{$$('[data-mode]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');mode=b.dataset.mode;});
$('#launchBtn').onclick=()=>{state=createState(marketId,mandateId,seed(),mode);beginCycle();};
$('#resetBtn').onclick=()=>{state=null;selections=[];activeProposal=null;show('welcome');};
$('#howBtn').onclick=()=>$('#howDialog').showModal();
$('#closeHow').onclick=()=>$('#howDialog').close();

function beginCycle(){
  opportunities=getOpportunitySet(state);selections=[];activeProposal=opportunities[0];
  renderBriefing();renderDecisionCenter();show('decisionCenter');
}

function renderBriefing(){
  const m=MARKETS[state.marketId],md=MANDATES[state.mandateId],debt=getDebtSummary(state);
  $('#cycleLabel').textContent=`CYCLE ${state.cycle} / ${state.maxCycles}`;
  $('#teamTitle').textContent=team();
  $('#marketName').textContent=m.name;
  $('#mandateName').textContent=md.name;
  $('#mandateBrief').textContent=md.brief;
  $('#healthCash').textContent=money(state.cash);
  $('#healthDebt').textContent=money(debt.principal);
  $('#healthFans').textContent=Math.round(state.fanTrust);
  $('#healthBrand').textContent=Math.round(state.brand);
  $('#healthFacility').textContent=Math.round(state.facility);
  $('#healthValue').textContent=`$${state.franchiseValue.toFixed(1)}B`;
  $('#commitments').innerHTML=state.activeInvestments.length?state.activeInvestments.map(x=>`<li><b>${x.name}</b><span>${x.remaining} yr${x.remaining===1?'':'s'} · ${money(x.annualRevenue||0)} benefit / ${money(x.annualCost||0)} cost</span></li>`).join(''):'<li class="empty">No new commitments yet.</li>';
}

function renderDecisionCenter(){
  $('#proposalGrid').innerHTML=opportunities.map(p=>{
    const chosen=selections.find(s=>s.proposal.id===p.id);
    return `<button class="proposal ${activeProposal?.id===p.id?'active':''} ${chosen?'chosen':''}" data-proposal="${p.id}">
      <span class="proposal-type">${p.type.toUpperCase()}</span><b>${p.name}</b><small>${p.subtitle}</small>
      <div class="proposal-numbers"><em>${money(p.upfront)} upfront</em><em>${p.confidence} confidence</em></div>
    </button>`;
  }).join('');
  $$('[data-proposal]').forEach(b=>b.onclick=()=>{activeProposal=opportunities.find(p=>p.id===b.dataset.proposal);renderDecisionCenter();});
  renderProposalDetail();renderPortfolio();
}

function renderProposalDetail(){
  const p=activeProposal;if(!p)return;
  $('#proposalType').textContent=p.type.toUpperCase();$('#proposalTitle').textContent=p.name;$('#proposalSubtitle').textContent=p.subtitle;$('#proposalDetail').textContent=p.detail;
  const scenario=getScenarioModel(state,p,selections.find(s=>s.proposal.id===p.id)?.debtPct||0);
  $('#forecastDown').textContent=money(scenario.downsideNet);$('#forecastBase').textContent=money(scenario.baseNet);$('#forecastUp').textContent=money(scenario.upsideNet);$('#forecastConfidence').textContent=p.confidence;
  $('#proposalCost').textContent=money(p.upfront);$('#proposalAnnual').textContent=money(p.annualRevenue||0);$('#proposalOpex').textContent=money(p.annualCost||0);$('#proposalTerm').textContent=`${p.term} yrs`;
  $('#fundingWrap').classList.toggle('hidden',!p.debtEligible);
  const existing=selections.find(s=>s.proposal.id===p.id);const debtPct=existing?.debtPct||0;
  $$('[data-debt]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.debt)===debtPct);b.onclick=()=>{const x=selections.find(s=>s.proposal.id===p.id);if(x){x.debtPct=Number(b.dataset.debt);renderDecisionCenter();}else{selectProposal(p,Number(b.dataset.debt));}});
  $('#selectBtn').textContent=existing?'Remove from portfolio':'Add to portfolio';
  $('#selectBtn').onclick=()=>existing?removeProposal(p.id):selectProposal(p,0);
  renderDocuments(p,debtPct);
}

function selectProposal(p,debtPct=0){
  if(selections.find(s=>s.proposal.id===p.id))return;
  if(selections.length>=2){flash('Choose no more than two investments this cycle.');return;}
  selections.push({proposal:p,debtPct:p.debtEligible?debtPct:0});renderDecisionCenter();
}
function removeProposal(id){selections=selections.filter(s=>s.proposal.id!==id);renderDecisionCenter();}

function renderDocuments(p,debtPct){
  const impact=estimateProposalImpact(state,p,debtPct);const scenario=getScenarioModel(state,p,debtPct);const views=advisorViews(state,p);
  const roiLabel=p.type==='capital'?'Direct project ROI':'Year-1 direct cash ROI';
  $('#docWorkbook').innerHTML=`<div class="sheet"><table><tbody>
    <tr><th>Initial commitment</th><td>${money(p.upfront)}</td></tr><tr><th>Cash required now</th><td>${money(impact.cashNeed)}</td></tr>
    <tr><th>New debt</th><td>${money(impact.debtAmount)}</td></tr><tr><th>Base annual gross benefit</th><td>${money(p.annualRevenue||0)}</td></tr>
    <tr><th>Annual recurring cost</th><td>${money(p.annualCost||0)}</td></tr><tr><th>Estimated annual debt service</th><td>${money(impact.annualDebtService)}</td></tr>
    <tr class="strong"><th>Base annual cash contribution</th><td>${money(scenario.baseNet)}</td></tr>
    <tr class="strong"><th>${roiLabel}</th><td>${impact.directROI.toFixed(1)}%</td></tr>
    <tr><th>Approx. break-even</th><td>${impact.breakEvenYears?`${impact.breakEvenYears.toFixed(1)} years`:'No direct-cash break-even in base case'}</td></tr>
  </tbody></table><p class="sheet-note">Direct ROI captures modeled cash economics only. Player wins, brand value, fan effects, and strategic flexibility are shown separately because they are not guaranteed cash receipts.</p></div>`;
  const maxAbs=Math.max(1,Math.abs(scenario.downsideNet),Math.abs(scenario.baseNet),Math.abs(scenario.upsideNet));
  const bar=v=>Math.max(10,Math.round(Math.abs(v)/maxAbs*95));
  $('#docScenario').innerHTML=`<div class="scenario-bars"><div><span>Downside</span><b>${money(scenario.downsideNet)}</b><i style="width:${bar(scenario.downsideNet)}%"></i></div><div><span>Base</span><b>${money(scenario.baseNet)}</b><i style="width:${bar(scenario.baseNet)}%"></i></div><div><span>Upside</span><b>${money(scenario.upsideNet)}</b><i style="width:${bar(scenario.upsideNet)}%"></i></div></div><p><b>Confidence:</b> ${p.confidence}. These are annual cash-contribution scenarios after recurring cost${impact.annualDebtService?' and modeled debt service':''}. Ask which assumption is doing the most work.</p>`;
  $('#docAdvisors').innerHTML=Object.entries(views).map(([name,text])=>`<article class="advisor"><span>${name}</span><p>${text}</p></article>`).join('');
  $('#docMemo').innerHTML=departmentMemo(p);
  $$('.doc-tab').forEach(b=>b.onclick=()=>{const id=b.dataset.doc;$$('.doc-tab').forEach(x=>x.classList.toggle('selected',x===b));$$('.doc-panel').forEach(x=>x.classList.toggle('active',x.id===id));});
}

function departmentMemo(p){
  if(p.type==='player')return `<div class="memo"><h4>PLAYER / SCOUTING REPORT</h4><p><b>Competitive contribution:</b> ${(p.wins*100).toFixed(1)} expected win-percentage points before uncertainty.</p><p><b>Commercial effect:</b> ${p.brand>=4?'High star / brand potential':'Moderate or limited star effect'}.</p><p><b>Contract burden:</b> ${money(p.annualCost||0)} per year for ${p.term} years, plus ${money(p.upfront)} upfront.</p><p><b>Risk lens:</b> Direct cash ROI may be negative even when the competitive case is strong. Availability and performance can move the realized value materially.</p><p><b>Exit flexibility:</b> ${p.term>=4?'Long commitment; later years matter.':'Shorter commitment; easier to reset.'}</p></div>`;
  if(p.type==='capital')return `<div class="memo"><h4>FACILITY / OPERATIONS MEMO</h4><p><b>Planning horizon:</b> ${p.term} years in this teaching model.</p><p><b>Facility benefit:</b> +${p.facility||0} long-run facility points before annual depreciation.</p><p><b>Lifecycle cost:</b> ${money(p.annualCost||0)} recurring annual operating cost.</p><p><b>Financing choice:</b> Debt preserves cash today but creates fixed annual debt service and reduces future flexibility.</p><p><b>Key risk:</b> ${p.risk>.28?'High construction / adoption uncertainty.':'Moderate project and demand uncertainty.'}</p></div>`;
  return `<div class="memo"><h4>REVENUE / FAN MEMO</h4><p><b>Primary engine:</b> ${p.stream||'commercial operations'}.</p><p><b>Expected annual gross contribution:</b> ${money(p.annualRevenue||0)} before recurring program cost.</p><p><b>Fan effect:</b> ${p.fan>=2?'Meaningful relationship benefit.':'Limited direct fan effect.'}</p><p><b>Watch:</b> Marginal return can decline as the local market saturates.</p></div>`;
}

function renderPortfolio(){
  const forecast=forecastCycle(state,selections);
  $('#portfolioList').innerHTML=selections.length?selections.map(s=>{const i=estimateProposalImpact(state,s.proposal,s.debtPct);return `<div class="portfolio-item"><b>${s.proposal.name}</b><span>${money(i.cashNeed)} cash + ${money(i.debtAmount)} debt</span></div>`}).join(''):'<p class="empty-copy">Select one or two proposals. You are not expected to fund everything.</p>';
  $('#portCash').textContent=money(forecast.upfrontCash);$('#portDebt').textContent=money(forecast.newDebt);$('#portProfit').textContent=money(forecast.profit);$('#portEndCash').textContent=money(forecast.projectedEndingCash);
  $('#portfolioWarning').textContent=forecast.upfrontCash>state.cash?'Your selected cash commitment exceeds current cash. Add debt where eligible or remove a proposal.':forecast.projectedEndingCash<15?'This portfolio leaves very little projected liquidity. That may be defensible—but it is a real risk.':'The portfolio is fundable under the current projection.';
  $('#commitBtn').disabled=!selections.length||forecast.upfrontCash>state.cash;
}

function flash(msg){$('#flash').textContent=msg;$('#flash').classList.add('show');setTimeout(()=>$('#flash').classList.remove('show'),1800);}

$('#commitBtn').onclick=()=>{if(!selections.length)return;renderRationale();show('rationaleScreen');};
function renderRationale(){
  $('#rationalePortfolio').innerHTML=selections.map(s=>`<li>${s.proposal.name}</li>`).join('');
  $('#rationaleText').value='';$('#riskChoice').value='';
}
$('#runCycleBtn').onclick=()=>{
  const text=$('#rationaleText').value.trim(),risk=$('#riskChoice').value;
  if(text.length<12||!risk){flash('Add a short board rationale and identify the risk you are accepting.');return;}
  const rationale={text,risk,portfolio:selections.map(s=>s.proposal.name)};
  const r=runCycle(state,selections,rationale);state=r.next;lastResult=r;renderResults(r);show('resultScreen');
};

function renderResults({record,event,distress}){
  $('#resultCycle').textContent=`CYCLE ${record.cycle} CLOSE`;
  $('#resultEvent').textContent=event.title;$('#resultEventText').textContent=event.desc;
  $('#resWins').textContent=pct(record.wins);$('#resRevenue').textContent=money(record.revTotal);$('#resProfit').textContent=money(record.profit);$('#resCash').textContent=money(record.cash);$('#resDebt').textContent=money(record.debt);
  $('#actualVsForecast').innerHTML=record.realized.length?record.realized.map(x=>`<tr><td>${x.name}</td><td>${money(x.forecastNet)}</td><td>${money(x.actualNet)}</td><td>${x.actualNet>=x.forecastNet?'Above / at forecast':'Below forecast'}</td></tr>`).join(''):'<tr><td colspan="4">No new proposal results.</td></tr>';
  $('#originalRationale').textContent=`“${record.rationale.text}” Risk accepted: ${record.rationale.risk}.`;
  $('#diagnosis').textContent=record.cashChange<record.profit-10?'Operating profit and cash diverged because upfront investment and principal repayment consumed liquidity.':record.profit<0?'The core operating result was negative this cycle. Look first at recurring costs and demand—not merely the event shock.':'Operating performance translated reasonably well into cash this cycle, but persistent commitments still shape the next decision.';
  $('#distress').classList.toggle('hidden',!distress);
  $('#advanceBtn').textContent=state.cycle>state.maxCycles?'Go to board review →':'Next capital committee →';
}
$('#advanceBtn').onclick=()=>state.cycle>state.maxCycles?renderFinal():beginCycle();

function renderFinal(){
  const s=finalEvaluation(state);$('#finalTeam').textContent=team();$('#finalMandate').textContent=s.mandate.name;$('#finalScore').textContent=s.total;
  $('#finalVerdict').textContent=s.total>=82?'Board confidence: the strategy matched the mandate while preserving resilience.':s.total>=68?'Board approval with conditions: the model works, but one or two exposures deserve attention.':s.total>=52?'Fragile outcome: the franchise survived, but flexibility or mandate execution is thin.':'Board intervention: financial or strategic pressure became unsustainable.';
  const vals=[['Financial health',s.financial],['Fan + brand',s.fan],['Competitive',s.competitive],['Asset growth',s.asset],['Flexibility',s.flexibility]];
  $('#scorecards').innerHTML=vals.map(([n,v])=>`<div><span>${n}</span><b>${v}</b><i style="width:${v}%"></i></div>`).join('');
  $('#history').innerHTML=state.history.map(h=>`<tr><td>${h.cycle}</td><td>${pct(h.wins)}</td><td>${money(h.revTotal)}</td><td>${money(h.profit)}</td><td>${money(h.cash)}</td><td>${money(h.debt)}</td><td>${h.event.title}</td></tr>`).join('');
  $('#rationaleHistory').innerHTML=state.history.map(h=>`<article><span>Cycle ${h.cycle}</span><b>${esc(h.rationale.portfolio.join(' + '))}</b><p>${esc(h.rationale.text)}</p></article>`).join('');
  show('finalScreen');
}
$('#againBtn').onclick=()=>show('welcome');
$('#copyReport').onclick=async()=>{const s=finalEvaluation(state);const txt=`${team()} | PRO SPORT TYCOON\nMandate: ${s.mandate.name}\nBoard score: ${s.total}/100\nCash: ${money(state.cash)} | Debt: ${money(getDebtSummary(state).principal)} | Value: $${state.franchiseValue.toFixed(1)}B`;try{await navigator.clipboard.writeText(txt);$('#copyReport').textContent='Copied ✓'}catch{alert(txt)}};

renderSetup();