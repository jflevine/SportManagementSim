import { SCENARIOS, FACILITY_OPTIONS, FOCUS_OPTIONS, createGame, defaultDecisions, projectSeason, runSeason, finalScore, gradeLabel, formatMoney } from './model.js';

const $ = (id) => document.getElementById(id);
let selectedScenario = 'growth';
let playMode = 'pod';
let state = null;
let decisions = null;
let lastProjection = null;
let lastResult = null;

function pct(v){ return `${(v*100).toFixed(1)}%`; }
function winFmt(v){ return v.toFixed(3).replace(/^0/, ''); }
function money0(v){ const sign=v<0?'-':''; return `${sign}$${Math.abs(v).toFixed(0)}M`; }

function renderScenarioCards(){
  const wrap = $('scenarioCards'); wrap.innerHTML='';
  Object.values(SCENARIOS).forEach(s=>{
    const el=document.createElement('article');
    el.className=`scenario-card ${s.id===selectedScenario?'selected':''}`;
    el.innerHTML=`<h4>${s.name}</h4><p>${s.description}</p><div class="scenario-stats"><span>Local media<strong>${money0(s.localMedia)}</strong></span><span>Cash<strong>${money0(s.cash)}</strong></span><span>Debt<strong>${money0(s.debt)}</strong></span></div><button aria-label="Choose ${s.name}" data-scenario="${s.id}"></button>`;
    wrap.appendChild(el);
  });
  wrap.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectedScenario=b.dataset.scenario;renderScenarioCards();}));
}

function renderChoices(){
  $('facilityChoices').innerHTML='';
  Object.values(FACILITY_OPTIONS).forEach(o=>{
    const b=document.createElement('button'); b.className=`choice ${decisions.facilityOption===o.id?'selected':''}`; b.dataset.id=o.id;
    b.innerHTML=`<strong>${o.name}</strong><small>${o.description}</small>`;
    b.addEventListener('click',()=>{decisions.facilityOption=o.id;renderChoices();refreshProjection();});
    $('facilityChoices').appendChild(b);
  });
  $('focusChoices').innerHTML='';
  Object.values(FOCUS_OPTIONS).forEach(o=>{
    const b=document.createElement('button'); b.className=`choice ${decisions.focus===o.id?'selected':''}`; b.dataset.id=o.id;
    b.innerHTML=`<strong>${o.name}</strong><small>${o.description}</small>`;
    b.addEventListener('click',()=>{decisions.focus=o.id;renderChoices();refreshProjection();});
    $('focusChoices').appendChild(b);
  });
}

function renderSeasonDots(){
  $('seasonDots').innerHTML='';
  for(let i=1;i<=5;i++){
    const d=document.createElement('i');
    if(i<state.season)d.className='done'; else if(i===state.season)d.className='active';
    $('seasonDots').appendChild(d);
  }
}

function setControls(){
  ['ticketPrice','rosterSpend','fanExperience','marketing'].forEach(id=>{ $(id).value=decisions[id]; });
  updateOutputs();
}
function readControls(){
  decisions.ticketPrice=+$('ticketPrice').value;
  decisions.rosterSpend=+$('rosterSpend').value;
  decisions.fanExperience=+$('fanExperience').value;
  decisions.marketing=+$('marketing').value;
  updateOutputs(); refreshProjection();
}
function updateOutputs(){
  $('ticketOut').value=`$${decisions.ticketPrice}`;
  $('rosterOut').value=`$${decisions.rosterSpend}M`;
  $('fanOut').value=`$${decisions.fanExperience}M`;
  $('marketingOut').value=`$${decisions.marketing}M`;
}

function showScreen(id){ ['introScreen','gameScreen','resultScreen','finalScreen'].forEach(x=>$(x).classList.toggle('hidden',x!==id)); window.scrollTo({top:0,behavior:'smooth'}); }

function startGame(){
  const teamName=$('teamName').value.trim()||'Explorer City FC';
  const seed=$('seedInput').value.trim()||Math.random().toString(36).slice(2,8).toUpperCase();
  state=createGame({scenarioId:selectedScenario,seed,teamName});
  decisions=defaultDecisions(selectedScenario);
  $('franchiseTitle').textContent=teamName; $('scenarioLabel').textContent=SCENARIOS[selectedScenario].name.toUpperCase();
  renderChoices(); setControls(); refreshDashboard(); refreshProjection(); showScreen('gameScreen');
}

function refreshDashboard(){
  $('seasonNumber').textContent=Math.min(state.season,5); renderSeasonDots();
  $('cashMetric').textContent=formatMoney(state.cash); $('debtMetric').textContent=formatMoney(state.debt);
  $('fansMetric').textContent=Math.round(state.fans); $('brandMetric').textContent=Math.round(state.brand); $('facilityMetric').textContent=Math.round(state.facility);
  $('valueMetric').textContent=`$${state.value.toFixed(2)}B`;
  $('cashTrend').textContent=state.cash<20?'thin liquidity':state.cash>110?'strong liquidity':'liquidity';
  const concepts=[
    ['Revenue is not profit.','Your job is to manage both what flows in and what flows out.'],
    ['Profit is not cash.','Capital spending and debt principal can drain cash even when operations are profitable.'],
    ['Winning has an economic return—up to a point.','Roster investment can lift demand, but payroll can outrun the revenue it creates.'],
    ['Debt buys assets and future obligations.','A renovation can improve revenue capacity while interest and principal reduce flexibility.'],
    ['Diversification is resilience.','A franchise overly dependent on one stream is more exposed when the market changes.']
  ];
  const c=concepts[Math.min(state.season-1,4)]; $('conceptTitle').textContent=c[0]; $('conceptText').textContent=c[1];
  const questions=[
    'What tradeoff are you making—and what could go wrong?',
    'Are you growing revenue, or simply spending more to chase it?',
    'How much is one additional win actually worth to your business?',
    'Will this capital investment strengthen the franchise or trap it in debt?',
    'Is your final strategy resilient—or dependent on one fragile revenue stream?'
  ]; $('boardQuestion').textContent=questions[Math.min(state.season-1,4)];
}

function refreshProjection(){
  if(!state)return;
  lastProjection=projectSeason(state,decisions);
  $('projectedRevenue').textContent=formatMoney(lastProjection.totalRevenue);
  $('projectedExpenses').textContent=formatMoney(lastProjection.totalExpenses);
  $('projectedProfit').textContent=formatMoney(lastProjection.operatingProfit);
  $('projectedMargin').textContent=`${pct(lastProjection.margin)} operating margin`;
  $('profitBox').classList.toggle('negative',lastProjection.operatingProfit<0);
  renderBars('revenueBars',lastProjection.revenue, lastProjection.totalRevenue, {
    tickets:'Tickets',concessions:'Concessions',premium:'Premium',sponsorship:'Sponsors',localMedia:'Local media',nationalMedia:'National share',merchDigital:'Merch + digital'
  });
  renderBars('expenseBars',lastProjection.expenses,lastProjection.totalExpenses,{
    roster:'Roster',payrollSurcharge:'Payroll charge',venueOps:'Venue ops',salesMarketing:'Sales/marketing',staffTravel:'Staff/travel',leagueAssessments:'League',gameDayVariable:'Game-day',interest:'Interest',medical:'Medical',shock:'Shock'
  });
  const cap=FACILITY_OPTIONS[decisions.facilityOption];
  $('cashNote').textContent=`Capital decision: ${cap.name}. ${money0(lastProjection.capex)} capex this season; ${money0(lastProjection.newDebt)} new debt. Projected cash change before a market shock: ${formatMoney(lastProjection.cashChange)}.`;
}

function renderBars(id,obj,total,labels){
  const el=$(id); el.innerHTML='';
  Object.entries(obj).filter(([,v])=>v>0.05).forEach(([k,v])=>{
    const row=document.createElement('div'); row.className='bar-row'; const share=total?Math.min(100,v/total*100):0;
    row.innerHTML=`<span>${labels[k]||k}</span><div class="bar-track"><div class="bar-fill" style="width:${share}%"></div></div><b>${money0(v)}</b>`; el.appendChild(row);
  });
}

function executeSeason(){
  const out=runSeason(state,decisions); state=out.state; lastResult=out.result; renderResult(); showScreen('resultScreen');
}

function renderResult(){
  const r=lastResult; const e=r.event||{title:'Stable operating environment',text:''};
  $('resultTitle').textContent = r.operatingProfit>=0 ? 'The books are closed.' : 'The board has questions.';
  $('winPct').textContent=winFmt(r.winPct); $('eventTitle').textContent=e.title; $('eventText').textContent=e.text||'Execution—not an external shock—drove the result.';
  $('actualRevenue').textContent=formatMoney(r.totalRevenue); $('actualExpenses').textContent=formatMoney(r.totalExpenses); $('actualProfit').textContent=formatMoney(r.operatingProfit); $('actualMargin').textContent=`${pct(r.margin)} margin`; $('cashChange').textContent=formatMoney(r.cashChange);
  const proj=lastProjection?.totalRevenue||r.totalRevenue; const delta=r.totalRevenue-proj; $('revenueDelta').textContent=`${delta>=0?'+':''}${formatMoney(delta)} vs. no-shock projection`;
  const topRev=Object.entries(r.revenue).sort((a,b)=>b[1]-a[1])[0];
  const names={tickets:'ticketing',concessions:'concessions',premium:'premium/hospitality',sponsorship:'sponsorship',localMedia:'local media',nationalMedia:'shared national media',merchDigital:'merchandise/digital'};
  $('whatMoved').textContent=`Your largest revenue source was ${names[topRev[0]]} at ${formatMoney(topRev[1])}. Attendance finished at ${(r.attendanceRate*100).toFixed(0)}% of capacity.`;
  const profitCashGap=r.operatingProfit-r.cashChange;
  $('financeTakeaway').textContent=Math.abs(profitCashGap)>18?`Operating profit and cash diverged by ${formatMoney(profitCashGap)} because capital spending and debt principal sit outside the operating P&L.`:`Profit and cash were relatively close this season, but they measure different things and can separate quickly when capital spending rises.`;
  $('boardPressure').textContent=state.cash<25?`Liquidity is now thin at ${formatMoney(state.cash)}. Even a profitable franchise can face a cash problem.`:state.debt>280?`Debt has climbed to ${formatMoney(state.debt)}. Future interest and principal reduce strategic flexibility.`:state.fans<50?`Fan trust fell to ${Math.round(state.fans)}. Revenue decisions can create long-run demand consequences.`:`The balance sheet remains workable. The board will now ask whether your next dollar should chase wins, revenue capacity, or resilience.`;
  $('distressWarning').classList.toggle('hidden',state.alive);
  $('nextSeasonBtn').textContent=(!state.alive||state.season>state.maxSeasons)?'See final board review →':'Advance to next season →';
}

function nextSeason(){
  if(!state.alive||state.season>state.maxSeasons){renderFinal();showScreen('finalScreen');return;}
  decisions=defaultDecisions(state.scenarioId);
  // carry forward a little strategy inertia: default ticket prices rise modestly over time.
  decisions.ticketPrice += (state.season-1)*3;
  renderChoices();setControls();refreshDashboard();refreshProjection();showScreen('gameScreen');
}

function renderFinal(){
  const s=finalScore(state); $('finalTeam').textContent=state.teamName; $('finalScore').textContent=s.total; $('finalLabel').textContent=gradeLabel(s.total,state.alive);
  const pairs=[['Financial',s.financial],['Fan',s.fan],['Competitive',s.competitive],['Asset',s.asset],['Diversification',s.diversification]];
  pairs.forEach(([name,val])=>{ $(`score${name}`).textContent=Math.round(val); $(`bar${name}`).style.width=`${Math.round(val)}%`; });
  const avgProfit=state.history.length?state.cumulativeProfit/state.history.length:0; const avgRev=state.history.length?state.cumulativeRevenue/state.history.length:0;
  $('finalNumbers').innerHTML=`
    <div class="final-number"><span>Cumulative operating profit</span><strong>${formatMoney(state.cumulativeProfit)}</strong></div>
    <div class="final-number"><span>Average annual revenue</span><strong>${formatMoney(avgRev)}</strong></div>
    <div class="final-number"><span>Ending cash</span><strong>${formatMoney(state.cash)}</strong></div>
    <div class="final-number"><span>Ending debt</span><strong>${formatMoney(state.debt)}</strong></div>
    <div class="final-number"><span>Average win %</span><strong>${winFmt(s.avgWin)}</strong></div>
    <div class="final-number"><span>Franchise value</span><strong>$${state.value.toFixed(2)}B</strong></div>`;
  $('historyTable').innerHTML=''; state.history.forEach((h,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${i+1}</td><td>${winFmt(h.winPct)}</td><td>${formatMoney(h.totalRevenue)}</td><td>${formatMoney(h.totalExpenses)}</td><td>${formatMoney(h.operatingProfit)}</td><td>${formatMoney(h.endCash)}</td><td>${formatMoney(h.endDebt)}</td>`;$('historyTable').appendChild(tr);});
}

function copyReport(){
  const s=finalScore(state); const rows=state.history.map((h,i)=>`S${i+1}: win ${winFmt(h.winPct)}, revenue ${formatMoney(h.totalRevenue)}, expenses ${formatMoney(h.totalExpenses)}, profit ${formatMoney(h.operatingProfit)}, cash ${formatMoney(h.endCash)}, debt ${formatMoney(h.endDebt)}`).join('\n');
  const txt=`OWNER'S BOX — ${state.teamName}\nSeed: ${state.seed} | Market: ${SCENARIOS[state.scenarioId].name}\nBoard score: ${s.total}/100 — ${gradeLabel(s.total,state.alive)}\nCumulative operating profit: ${formatMoney(state.cumulativeProfit)}\nEnding cash: ${formatMoney(state.cash)} | Ending debt: ${formatMoney(state.debt)}\nAverage win %: ${winFmt(s.avgWin)} | Franchise value: $${state.value.toFixed(2)}B\n\n${rows}\n\nDEBRIEF\n1. Which revenue stream mattered most—and why?\n2. Which expense or investment created the hardest tradeoff?\n3. When did profit and cash tell different stories?\n4. What would change if national revenue sharing disappeared?`;
  navigator.clipboard?.writeText(txt).then(()=>{$('copyReportBtn').textContent='Copied ✓';setTimeout(()=>$('copyReportBtn').textContent='Copy board report',1600)}).catch(()=>alert(txt));
}

function reset(){ state=null;decisions=null;lastProjection=null;lastResult=null;showScreen('introScreen'); }

renderScenarioCards();
document.querySelectorAll('.segment').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.segment').forEach(x=>x.classList.remove('active'));b.classList.add('active');playMode=b.dataset.mode;}));
['ticketPrice','rosterSpend','fanExperience','marketing'].forEach(id=>$(id).addEventListener('input',readControls));
$('startBtn').addEventListener('click',startGame); $('runSeasonBtn').addEventListener('click',executeSeason); $('nextSeasonBtn').addEventListener('click',nextSeason); $('playAgainBtn').addEventListener('click',reset); $('restartBtn').addEventListener('click',()=>{if(confirm('Restart the simulation?'))reset();}); $('copyReportBtn').addEventListener('click',copyReport);
$('rulesBtn').addEventListener('click',()=>$('rulesDialog').showModal()); $('closeRules').addEventListener('click',()=>$('rulesDialog').close());
