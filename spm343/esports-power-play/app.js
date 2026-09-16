(()=>{
'use strict';
const $=id=>document.getElementById(id);
const stage=$('stage'),hud=$('hud'),footer=$('footerStatus'),toastEl=$('toast');
const SAVE_KEY='spm343_esports_power_play_v1';
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
let shotTimer=null,audioCtx=null,soundOn=true;

const initialState=()=>({
  screen:'intro',score:0,streak:1,name:'Commissioner',metrics:{access:70,welfare:70,fans:70,runway:70,stability:70},
  influence:{Publisher:2,Players:2,Fans:2,Sponsor:1,Investor:1,Government:1,Broadcaster:1,Team:2},
  soccer:{step:0,wrong:0,shock:null},hockey:{ratings:{},responses:[]},basketball:{selected:[],locked:false},
  evaluation:{team:null,metrics:[]},finale:{crises:{},extras:[]},history:[]
});
let state=load()||initialState();

const soccerPasses=[
 {from:'Publisher',to:'Tournament Organizer',clue:'Who needs legal and technical consent to run competition around the title?',teach:'Publishers own the title and can act as gatekeepers over rules, updates, permissions, and competitive access.'},
 {from:'Tournament Organizer',to:'Broadcaster',clue:'Who converts the live competition into distributed content for a broader audience?',teach:'Tournament and league organizers create the competitive product; broadcasters and streaming platforms extend its reach.'},
 {from:'Broadcaster',to:'Fans',clue:'Who turns distribution into attention, culture, participation, and legitimacy?',teach:'Fans are not passive consumers. Their attention and participation are core inputs into the esports business model.'},
 {from:'Fans',to:'Sponsor',clue:'Who pays to reach this audience and wants measurable, authentic value in return?',teach:'Sponsors are buying access to a community, not merely logo placement.'},
 {from:'Sponsor',to:'Team',clue:'Who can use commercial revenue to support rosters, staff, content, and competition?',teach:'Professional organizations need revenue diversity because sponsor dependence can become a structural vulnerability.'},
 {from:'Team',to:'Players',clue:'Who signs, compensates, develops, and depends on elite competitive talent?',teach:'Players are essential stakeholders whose careers, welfare, bargaining power, and public influence shape the ecosystem.'}
];
const soccerStakeholders=['Publisher','Tournament Organizer','Broadcaster','Fans','Sponsor','Team','Players','Investor','Government'];

const hockeyClaims={
 government:{name:'Government',text:'New youth-gaming rules take effect in 48 hours.',ideal:[3,3,3],effects:{stability:6,access:1},miss:{stability:-12},influence:'Government'},
 publisher:{name:'Publisher',text:'The publisher will change tournament rules next month.',ideal:[3,3,2],effects:{access:8,stability:3},miss:{access:-14},influence:'Publisher'},
 players:{name:'Players',text:'Players report burnout and demand a schedule change.',ideal:[2,3,3],effects:{welfare:10,stability:3},miss:{welfare:-13},influence:'Players'},
 sponsor:{name:'Sponsor',text:'A major partner threatens to leave over brand-safety concerns.',ideal:[2,2,3],effects:{runway:8},miss:{runway:-10},influence:'Sponsor'},
 fans:{name:'Fans',text:'Fans organize against rising paywalls and ticket prices.',ideal:[2,3,2],effects:{fans:10,stability:2},miss:{fans:-11},influence:'Fans'}
};

const survivalMoves={
 cut:{name:'Cut one expensive roster',desc:'Immediate savings; competitive and brand risk.',effects:{runway:12,fans:-5,stability:-2},influence:{Investor:1}},
 creators:{name:'Sign two creators',desc:'Audience upside; uncertain conversion into durable revenue.',effects:{fans:10,runway:-4,stability:2},influence:{Fans:2,Broadcaster:1}},
 membership:{name:'Launch paid fan membership',desc:'Recurring revenue opportunity; works only if community trust is strong.',effects:{runway:7,fans:5,stability:3},influence:{Fans:2}},
 capital:{name:'Take new investor capital',desc:'Runway today; return expectations and dependence tomorrow.',effects:{runway:15,stability:-4},influence:{Investor:3}},
 expand:{name:'Expand into another title',desc:'Growth potential; adds cost and another publisher dependency.',effects:{access:-4,runway:-8,fans:5},influence:{Publisher:2}},
 sponsor:{name:'Double down on sponsorship',desc:'Fastest monetization path; increases concentration risk.',effects:{runway:11,fans:-2,stability:-5},influence:{Sponsor:3}}
};

const evalData={
 basketball:{name:'Atlas Basketball',icon:'🏀',rows:[['Wins','↑','up'],['Attendance','↓','down'],['Player retention','↓','down'],['Social engagement','↑↑','up']]},
 hockey:{name:'Atlas Hockey',icon:'🏒',rows:[['Wins','↓','down'],['Young-player development','↑↑','up'],['Revenue','↑','up'],['Season-ticket renewals','↑','up']]},
 soccer:{name:'Atlas FC',icon:'⚽',rows:[['First-team performance','→','flat'],['Academy value','↑↑','up'],['Payroll efficiency','↑','up'],['Fan satisfaction','↑','up']]}
};
const evalMetrics=['Competitive results','Player welfare & retention','Revenue quality','Fan trust','Publisher dependence','Talent development','Sponsor concentration','Audience growth'];

const finalCrises={
 patch:{title:'PATCH SHOCK',text:'The publisher releases a controversial balance update 72 hours before Worlds.',options:{freeze:{name:'Negotiate a tournament patch freeze',effects:{access:4,stability:8},influence:{Publisher:2}},defy:{name:'Run the old patch without permission',effects:{access:-18,fans:5,stability:-6},influence:{Fans:1}},accept:{name:'Accept the update immediately',effects:{access:8,welfare:-5,stability:-3},influence:{Publisher:3}}}},
 sponsor:{title:'BRAND SHOCK',text:'A major sponsor demands removal of a controversial creator or it will exit.',options:{replace:{name:'Replace the sponsor and protect editorial independence',effects:{runway:-8,fans:7,stability:3},influence:{Fans:2}},comply:{name:'Comply with the sponsor demand',effects:{runway:8,fans:-9},influence:{Sponsor:3}},mediate:{name:'Negotiate conduct standards and a revised activation',effects:{runway:3,fans:3,stability:4},influence:{Sponsor:1,Fans:1}}}},
 player:{title:'PLAYER SHOCK',text:'A star reports burnout and refuses media appearances before the event.',options:{protect:{name:'Protect recovery time and reduce obligations',effects:{welfare:14,fans:-2,stability:4},influence:{Players:3}},force:{name:'Enforce the contract and appearance schedule',effects:{welfare:-16,runway:3,stability:-5},influence:{Team:2}},shared:{name:'Create a player-led compromise on competition and media duties',effects:{welfare:8,fans:3,stability:5},influence:{Players:2,Team:1}}}},
 integrity:{title:'INTEGRITY SHOCK',text:'Regulators announce concerns about suspicious betting patterns around the tournament.',options:{monitor:{name:'Bring in an independent integrity monitor',effects:{runway:-3,stability:12,fans:5},influence:{Government:2}},pause:{name:'Pause affected betting markets and investigate',effects:{runway:-5,stability:10,fans:3},influence:{Government:2}},quiet:{name:'Handle the issue privately to protect the event',effects:{stability:-14,fans:-8},influence:{Team:1}}}}
};
const extras={
 cost:{name:'Create an emergency cost-control plan',effects:{runway:9,stability:2},influence:{Investor:1}},
 creator:{name:'Open creator co-streaming access',effects:{fans:9,access:-2},influence:{Broadcaster:2,Fans:2}},
 welfare:{name:'Fund player wellness & career support',effects:{welfare:10,runway:-4},influence:{Players:2}},
 sponsor:{name:'Build a diversified sponsor pool',effects:{runway:6,stability:6},influence:{Sponsor:1}},
 council:{name:'Create a publisher-team-fan working group',effects:{access:4,fans:4,stability:7},influence:{Publisher:1,Team:1,Fans:1}}
};

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{}}
function load(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{return null}}
function reset(){clearInterval(shotTimer);shotTimer=null;state=initialState();try{localStorage.removeItem(SAVE_KEY)}catch{};render()}
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastEl._t);toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),1800)}
function apply(e={}){Object.entries(e).forEach(([k,v])=>{if(k in state.metrics)state.metrics[k]=clamp(state.metrics[k]+v)});updateHud()}
function influence(e={}){Object.entries(e).forEach(([k,v])=>state.influence[k]=(state.influence[k]||1)+v)}
function points(n){state.score+=Math.round(n*state.streak);state.streak=Math.min(5,state.streak+.15);updateHud();sound('score')}
function miss(){state.streak=1;updateHud();sound('miss')}
function updateHud(){
 $('scoreValue').textContent=state.score;$('streakValue').textContent='x'+state.streak.toFixed(1);
 Object.entries(state.metrics).forEach(([k,v])=>{const val=$(k+'Value'),bar=$(k+'Bar');if(val)val.textContent=v;if(bar)bar.style.width=v+'%'});
}
function setFooter(t){footer.textContent=t}
function screen(html,{hudOn=true,status='Live simulation'}={}){hud.classList.toggle('hidden',!hudOn);stage.innerHTML=html;stage.focus({preventScroll:true});setFooter(status);updateHud();save()}
function sound(type='click'){
 if(!soundOn)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const now=audioCtx.currentTime;const f=type==='score'?620:type==='miss'?160:type==='alarm'?230:380;o.type=type==='alarm'?'sawtooth':'triangle';o.frequency.setValueAtTime(f,now);if(type==='score')o.frequency.exponentialRampToValueAtTime(930,now+.09);g.gain.setValueAtTime(.055,now);g.gain.exponentialRampToValueAtTime(.0001,now+.13);o.start(now);o.stop(now+.14)}catch{}}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function render(){clearInterval(shotTimer);shotTimer=null;const fn={intro:renderIntro,soccer:renderSoccer,hockey:renderHockey,basketball:renderBasketball,evaluation:renderEvaluation,finale:renderFinale,simulation:renderSimulation,final:renderFinal}[state.screen]||renderIntro;fn()}

function renderIntro(){
 const hasSave=!!load()&&state.screen!=='intro';
 screen(`<div class="hero-screen">
   <section class="hero-copy"><div class="kicker">WHO CONTROLS THE ECOSYSTEM?</div><h1>POWER<br>PLAY.</h1>
   <p>You are the commissioner of the <strong>Champions of Valor World Series</strong>. Publishers, players, teams, fans, sponsors, broadcasters, investors, and governments all want something from you.</p>
   <div class="hero-note"><strong>Your job:</strong> keep the ecosystem alive without letting one stakeholder quietly control everything. Every decision changes who has leverage.</div>
   <label class="eyebrow" for="callsign">COMMISSIONER CALLSIGN — OPTIONAL</label><input id="callsign" maxlength="24" value="${esc(state.name==='Commissioner'?'':state.name)}" placeholder="e.g., Nova" style="width:100%;margin:8px 0 14px;padding:13px;border-radius:10px;border:1px solid #31506b;background:#081522;color:white">
   <button id="startBtn" class="primary-btn" type="button">Enter the Arena</button> ${hasSave?'<button id="resumeBtn" class="secondary-btn" type="button">Resume Saved Run</button>':''}
   <div class="round-strip"><div class="round-chip"><b>⚽ PASSING NETWORK</b><span>Interdependence + gatekeepers</span></div><div class="round-chip"><b>🏒 POWER PLAY</b><span>Power · legitimacy · urgency</span></div><div class="round-chip"><b>🏀 SHOT CLOCK</b><span>Team sustainability + dependence</span></div><div class="round-chip"><b>🏆 WORLDS</b><span>Stakeholder crisis command</span></div></div></section>
   <section class="hero-arena"><div class="arena-grid"></div><div class="arena-lockup"><div><div class="arena-emblem"><span>🎮</span></div><h2>Champions of Valor</h2><p style="color:#8fa9bd">WORLD SERIES · ECOSYSTEM COMMAND</p></div></div></section>
 </div>`,{hudOn:false,status:'Commissioner briefing'});
 $('startBtn').onclick=()=>{state=initialState();state.name=$('callsign').value.trim()||'Commissioner';state.screen='soccer';save();sound('score');render()};
 if($('resumeBtn'))$('resumeBtn').onclick=()=>{const s=load();if(s){state=s;render()}};
}

function renderSoccer(){
 const step=state.soccer.step,done=step>=soccerPasses.length;
 if(done)return renderSoccerShock();
 const m=soccerPasses[step];
 const cards=soccerStakeholders.map(name=>`<button type="button" class="stake-btn ${name===m.from?'current':''}" data-stake="${name}" ${name===m.from?'disabled':''}><b>${name}</b><span class="stake-role">${name===m.from?'BALL HOLDER':'Available pass'}</span></button>`).join('');
 screen(`<div class="screen-title"><div><div class="kicker">ROUND 1 · SOCCER</div><h2>Build the Passing Network</h2><p>The ball only moves when stakeholder dependencies make sense.</p></div><div class="round-badge">PASS ${step+1} / ${soccerPasses.length}</div></div>
 <div class="game-layout"><section class="game-panel"><div class="broadcast-callout"><div><span class="ball"></span><b>${m.from}</b></div><div><span class="eyebrow">COMMENTARY</span><div>${m.clue}</div></div></div><div class="pitch"><div class="stakeholder-grid">${cards}</div></div></section>
 <aside class="side-stack"><div class="brief-card"><div class="kicker">MISSION</div><h3>Move the ecosystem forward</h3><p>Pick the stakeholder that best completes the dependency. Wrong passes cost your combo, not the whole run.</p></div><div class="mission-list">${soccerPasses.map((p,i)=>`<div class="mission-item ${i<step?'done':i===step?'active':''}">${i<step?'✓':'○'} ${p.from} → ${i<step?p.to:'?'}</div>`).join('')}</div><div class="lesson-box"><strong>Nobody owns football.</strong><br>In esports, the publisher owns the title and can control legal and technical access to competition.</div></aside></div>`,{status:'Round 1 · Stakeholder passing network'});
 document.querySelectorAll('[data-stake]').forEach(btn=>btn.onclick=()=>{
   if(btn.dataset.stake===m.to){btn.classList.add('correct');points(100);state.history.push(m.teach);toast('COMPLETE PASS · +'+Math.round(100*(state.streak-.15)));state.soccer.step++;save();setTimeout(renderSoccer,420)}
   else{btn.classList.add('wrong');state.soccer.wrong++;miss();toast('TURNOVER — rethink the dependency');setTimeout(()=>btn.classList.remove('wrong'),350)}
 });
}

function renderSoccerShock(){
 if(state.soccer.shock){state.screen='hockey';save();return render()}
 screen(`<div class="screen-title"><div><div class="kicker">VAR REVIEW · PUBLISHER SHOCK</div><h2>The rules just changed.</h2><p>The publisher pushes a major competitive patch days before your tournament.</p></div><div class="round-badge">GATEKEEPER MOMENT</div></div>
 <div class="game-panel"><div class="pitch" style="min-height:380px;display:grid;place-items:center"><div style="position:relative;z-index:2;max-width:820px;text-align:center"><div style="font-size:72px">⚠️</div><h2>“We built the community. Do we actually need permission?”</h2><p style="color:#d0e2d7">Choose your response. Publisher ownership means this is not the same governance problem as changing the rules of soccer.</p><div class="command-options">
 <button class="choice-btn" data-shock="negotiate">NEGOTIATE A PATCH FREEZE<br><small>Clarify permission and protect competitive integrity.</small></button>
 <button class="choice-btn" data-shock="defy">RUN THE OLD PATCH ANYWAY<br><small>Protect community preferences, risk access.</small></button>
 <button class="choice-btn" data-shock="surrender">GIVE THE PUBLISHER TOTAL CONTROL<br><small>Protect access, accept dependency.</small></button>
 </div></div></div></div>`,{status:'Publisher gatekeeper shock'});
 document.querySelectorAll('[data-shock]').forEach(b=>b.onclick=()=>{const v=b.dataset.shock;state.soccer.shock=v;if(v==='negotiate'){apply({access:7,stability:8});influence({Publisher:1,Team:1});points(180)}else if(v==='defy'){apply({access:-18,fans:8,stability:-7});influence({Fans:2});points(90)}else{apply({access:12,fans:-5,stability:-4});influence({Publisher:3});points(110)};state.history.push('Publisher shock: '+v);save();toast('ECOSYSTEM SHIFT');setTimeout(()=>{state.screen='hockey';render()},500)});
}

function renderHockey(){
 const claimHtml=Object.entries(hockeyClaims).map(([id,c])=>{const r=state.hockey.ratings[id]||[0,0,0],checked=state.hockey.responses.includes(id);return `<article class="claim-card"><h4>${c.name}</h4><p>${c.text}</p>${['POWER','LEGITIMACY','URGENCY'].map((lab,idx)=>`<div class="puck-row"><b>${lab[0]}</b>${[0,1,2,3].map(n=>`<button type="button" class="puck-btn ${r[idx]===n?'selected':''}" data-rate="${id}" data-dim="${idx}" data-val="${n}">${n}</button>`).join('')}</div>`).join('')}<label class="respond-check"><input type="checkbox" data-response="${id}" ${checked?'checked':''}> Put on response line</label></article>`}).join('');
 screen(`<div class="screen-title"><div><div class="kicker">ROUND 2 · HOCKEY</div><h2>Stakeholder Power Play</h2><p>Five claims. Three response slots. Rate salience, then set your line.</p></div><div class="round-badge">5-ON-3</div></div>
 <div class="game-layout"><section class="game-panel"><div class="hockey-rink"><div class="claims">${claimHtml}</div></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button id="lockLine" class="primary-btn" type="button">Lock Response Line</button></div></section>
 <aside class="side-stack"><div class="brief-card"><div class="kicker">SCOUTING REPORT</div><h3>Power · Legitimacy · Urgency</h3><p><b>Power:</b> ability to impose will.<br><b>Legitimacy:</b> whether the claim is seen as appropriate.<br><b>Urgency:</b> whether it demands immediate attention.</p></div><div class="lesson-box">You cannot simply respond to whoever is loudest. Stakeholder salience is a management judgment about leverage, legitimacy, and time.</div></aside></div>`,{status:'Round 2 · Stakeholder salience'});
 document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const id=b.dataset.rate,dim=+b.dataset.dim,val=+b.dataset.val;const r=state.hockey.ratings[id]||[0,0,0];r[dim]=val;state.hockey.ratings[id]=r;save();renderHockey()});
 document.querySelectorAll('[data-response]').forEach(cb=>cb.onchange=()=>{const id=cb.dataset.response;if(cb.checked){if(state.hockey.responses.length>=3){cb.checked=false;toast('Only three response slots');return}state.hockey.responses.push(id)}else state.hockey.responses=state.hockey.responses.filter(x=>x!==id);save()});
 $('lockLine').onclick=()=>{
   if(Object.keys(state.hockey.ratings).length<5){toast('Rate all five claims first');return}if(state.hockey.responses.length!==3){toast('Choose exactly three stakeholders to respond to');return}
   let accuracy=0;Object.entries(hockeyClaims).forEach(([id,c])=>{const r=state.hockey.ratings[id]||[0,0,0];accuracy+=Math.max(0,9-(Math.abs(r[0]-c.ideal[0])+Math.abs(r[1]-c.ideal[1])+Math.abs(r[2]-c.ideal[2]))*2)});points(accuracy*5);
   Object.entries(hockeyClaims).forEach(([id,c])=>{if(state.hockey.responses.includes(id)){apply(c.effects);influence({[c.influence]:2})}else apply(c.miss)});
   state.history.push('Response line: '+state.hockey.responses.join(', '));state.screen='basketball';save();sound('score');setTimeout(render,350);
 };
}

function renderBasketball(){
 screen(`<div class="screen-title"><div><div class="kicker">ROUND 3 · BASKETBALL</div><h2>Atlas Esports Survival Clock</h2><p>Growth is not sustainability. You can call only two plays.</p></div><div class="round-badge">24-SECOND DECISION</div></div>
 <div class="shotclock-wrap"><div class="shotclock"><div><div class="clock-label">SHOT CLOCK</div><div id="clockNum" class="clock-num">24</div><div class="clock-label">RUNWAY · 7 MONTHS</div></div></div><section class="game-panel"><div class="broadcast-callout"><div><b>60%</b><small> Sponsors</small></div><div><b>22%</b><small> Content/Creator</small></div><div><b>10%</b><small> Merch/Events</small></div><div><b>8%</b><small> Publisher/Prize</small></div></div><div class="moves-grid">${Object.entries(survivalMoves).map(([id,m])=>`<article class="move-card ${state.basketball.selected.includes(id)?'selected':''}"><h4>${m.name}</h4><p>${m.desc}</p><button type="button" class="move-btn" data-move="${id}">${state.basketball.selected.includes(id)?'SELECTED':'CALL PLAY'}</button></article>`).join('')}</div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button id="shootBtn" class="primary-btn" type="button">Take the Shot</button></div></section></div>`,{status:'Round 3 · Team sustainability'});
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const id=b.dataset.move;if(state.basketball.selected.includes(id))state.basketball.selected=state.basketball.selected.filter(x=>x!==id);else if(state.basketball.selected.length<2)state.basketball.selected.push(id);else return toast('Only two plays — choose your tradeoff');save();renderBasketball()});
 const lock=()=>{if(state.basketball.locked)return;if(state.basketball.selected.length<2){const fill=Object.keys(survivalMoves).filter(k=>!state.basketball.selected.includes(k)).slice(0,2-state.basketball.selected.length);state.basketball.selected.push(...fill);toast('BUZZER — board forces emergency action')}state.basketball.locked=true;state.basketball.selected.forEach(id=>{apply(survivalMoves[id].effects);influence(survivalMoves[id].influence)});points(220);state.history.push('Survival plays: '+state.basketball.selected.join(', '));state.screen='evaluation';save();clearInterval(shotTimer);shotTimer=null;setTimeout(render,450)};
 $('shootBtn').onclick=()=>{if(state.basketball.selected.length!==2)return toast('Call exactly two plays');lock()};
 let remaining=24;shotTimer=setInterval(()=>{remaining--;const c=$('clockNum');if(c)c.textContent=remaining;if(remaining<=7)sound('alarm');if(remaining<=0){clearInterval(shotTimer);shotTimer=null;lock()}},1000);
}

function renderEvaluation(){
 screen(`<div class="screen-title"><div><div class="kicker">HALFTIME FILM ROOM</div><h2>What Counts as Performance?</h2><p>Three organizations. Contradictory evidence. Decide what deserves corrective action.</p></div><div class="round-badge">EVALUATING</div></div>
 <section class="game-panel"><div class="dashboard-grid">${Object.entries(evalData).map(([id,t])=>`<article class="team-dashboard"><h3>${t.icon} ${t.name}</h3>${t.rows.map(r=>`<div class="kpi-row"><span>${r[0]}</span><b class="kpi-${r[2]}">${r[1]}</b></div>`).join('')}<label class="respond-check"><input type="radio" name="teamEval" value="${id}" ${state.evaluation.team===id?'checked':''}> Prioritize corrective action here</label></article>`).join('')}</div>
 <div class="brief-card" style="margin-top:12px"><div class="kicker">BOARD DASHBOARD</div><h3>Choose exactly three measures you would manage against.</h3><div class="metric-picker">${evalMetrics.map(m=>`<label class="metric-choice"><input type="checkbox" data-evalmetric="${m}" ${state.evaluation.metrics.includes(m)?'checked':''}> ${m}</label>`).join('')}</div></div><div style="display:flex;justify-content:flex-end"><button id="evalBtn" class="primary-btn" type="button">Commit Evaluation</button></div></section>`,{status:'Evaluation lab · define success'});
 document.querySelectorAll('input[name="teamEval"]').forEach(r=>r.onchange=()=>{state.evaluation.team=r.value;save()});
 document.querySelectorAll('[data-evalmetric]').forEach(cb=>cb.onchange=()=>{const m=cb.dataset.evalmetric;if(cb.checked){if(state.evaluation.metrics.length>=3){cb.checked=false;return toast('Choose exactly three measures')}state.evaluation.metrics.push(m)}else state.evaluation.metrics=state.evaluation.metrics.filter(x=>x!==m);save()});
 $('evalBtn').onclick=()=>{if(!state.evaluation.team)return toast('Choose one organization for corrective action');if(state.evaluation.metrics.length!==3)return toast('Choose exactly three performance measures');points(200);if(state.evaluation.metrics.includes('Player welfare & retention'))apply({welfare:5});if(state.evaluation.metrics.includes('Fan trust'))apply({fans:5});if(state.evaluation.metrics.includes('Revenue quality'))apply({runway:5});if(state.evaluation.metrics.includes('Publisher dependence'))apply({access:3,stability:3});state.history.push('Evaluation lens: '+state.evaluation.metrics.join(', '));state.screen='finale';save();setTimeout(render,350)};
}

function renderFinale(){
 const crisisHtml=Object.entries(finalCrises).map(([cid,c])=>`<article class="command-card"><div class="kicker">${c.title}</div><h4>${c.text}</h4><div class="command-options">${Object.entries(c.options).map(([oid,o])=>`<button type="button" class="choice-btn ${state.finale.crises[cid]===oid?'selected':''}" data-crisis="${cid}" data-option="${oid}">${o.name}</button>`).join('')}</div></article>`).join('');
 const extraHtml=Object.entries(extras).map(([id,e])=>`<button type="button" class="choice-btn ${state.finale.extras.includes(id)?'selected':''}" data-extra="${id}">${e.name}</button>`).join('');
 const used=Object.keys(state.finale.crises).length+state.finale.extras.length;
 screen(`<div class="screen-title"><div><div class="kicker">CHAMPIONSHIP ROUND</div><h2>Worlds Crisis Command</h2><p>Four shocks. Six executive moves. Every solution creates a dependency.</p></div><div class="round-badge"><span class="action-counter">${6-used}</span> MOVES LEFT</div></div>
 <div class="command-grid"><section class="crisis-stack">${crisisHtml}</section><aside class="side-stack"><div class="brief-card"><div class="kicker">DISCRETIONARY PLAYBOOK</div><h3>After resolving four crises, choose two additional moves.</h3><div class="command-options" style="grid-template-columns:1fr">${extraHtml}</div></div><div class="lesson-box">Your task is not to make everyone happy. It is to manage interdependence without allowing one stakeholder dependency to make the whole ecosystem brittle.</div><button id="simulateBtn" class="primary-btn" type="button">SIMULATE WORLDS</button></aside></div>`,{status:'Championship round · ecosystem crisis'});
 document.querySelectorAll('[data-crisis]').forEach(b=>b.onclick=()=>{state.finale.crises[b.dataset.crisis]=b.dataset.option;save();renderFinale()});
 document.querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>{const id=b.dataset.extra;if(state.finale.extras.includes(id))state.finale.extras=state.finale.extras.filter(x=>x!==id);else if(state.finale.extras.length<2)state.finale.extras.push(id);else return toast('Only two discretionary moves remain');save();renderFinale()});
 $('simulateBtn').onclick=()=>{if(Object.keys(state.finale.crises).length!==4)return toast('Resolve all four crisis cards');if(state.finale.extras.length!==2)return toast('Choose exactly two discretionary plays');Object.entries(state.finale.crises).forEach(([cid,oid])=>{const o=finalCrises[cid].options[oid];apply(o.effects);influence(o.influence)});state.finale.extras.forEach(id=>{apply(extras[id].effects);influence(extras[id].influence)});points(400);state.screen='simulation';save();render()};
}

function renderSimulation(){
 const headlines=buildHeadlines();screen(`<div class="screen-title"><div><div class="kicker">LIVE SIMULATION</div><h2>Champions of Valor Worlds</h2><p>Your decisions are now colliding in public.</p></div><div class="round-badge">SYSTEM IN MOTION</div></div><div class="simulator"><div class="broadcast-callout"><div><span class="live-dot"></span> WORLD FEED</div><b>${state.name}</b></div><div id="ticker" class="ticker"></div><div id="simActions" style="display:flex;justify-content:flex-end;margin-top:16px"></div></div>`,{status:'Simulating championship consequences'});
 const t=$('ticker');headlines.forEach((h,i)=>setTimeout(()=>{if(!t)return;const d=document.createElement('div');d.className='ticker-item';d.textContent=h;t.appendChild(d);sound(i===headlines.length-1?'score':'click');if(t.children.length>5)t.removeChild(t.firstChild)},i*650));
 setTimeout(()=>{const a=$('simActions');if(a){a.innerHTML='<button id="boardroomBtn" class="primary-btn" type="button">Enter the Boardroom</button>';$('boardroomBtn').onclick=()=>{state.screen='final';save();render()}}},headlines.length*650+300);
}
function buildHeadlines(){
 const m=state.metrics,h=[];
 h.push(m.access>=70?'PUBLISHER CONFIRMS TOURNAMENT ACCESS':'PUBLISHER RELATIONSHIP REMAINS FRAGILE');
 h.push(m.welfare>=70?'PLAYER COUNCIL PRAISES WELFARE RESPONSE':'PLAYER TRUST FALLS AS WORKLOAD CONCERNS LINGER');
 h.push(m.fans>=70?'FAN SENTIMENT TRENDS POSITIVE AFTER WORLDS':'FAN BACKLASH BUILDS AROUND COMMERCIAL DECISIONS');
 h.push(m.runway>=70?'BOARD EXTENDS OPERATING RUNWAY':'FINANCE TEAM WARNS OF REVENUE CONCENTRATION');
 h.push(m.stability>=70?'WORLDS CLOSES WITH ECOSYSTEM STABLE':'POST-EVENT REVIEW FLAGS SYSTEMIC DEPENDENCY RISK');
 return h;
}

function renderFinal(){
 const profile=getProfile(),nodes=Object.entries(state.influence).sort((a,b)=>b[1]-a[1]);const max=Math.max(...nodes.map(n=>n[1]));
 const positions=[[90,110],[250,55],[430,105],[555,210],[430,320],[245,350],[85,285],[295,205]];
 const svgNodes=nodes.slice(0,8).map(([name,val],i)=>{const [x,y]=positions[i],r=24+24*(val/max);return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${i===0?'#f1c75c':'#17314a'}" stroke="${i===0?'#ffe59b':'#5f88a8'}" stroke-width="2"/><text x="${x}" y="${y-2}" text-anchor="middle" fill="${i===0?'#07111d':'#eef7ff'}" font-size="11" font-weight="700">${name}</text><text x="${x}" y="${y+13}" text-anchor="middle" fill="${i===0?'#07111d':'#8fb1c9'}" font-size="9">POWER ${val}</text></g>`}).join('');
 const top=nodes[0][0];
 screen(`<div class="screen-title"><div><div class="kicker">POSTGAME REPORT</div><h2>Your Ecosystem</h2><p>You did not merely manage stakeholders. Your decisions changed who holds leverage.</p></div><div class="round-badge">FINAL SCORE ${state.score}</div></div>
 <div class="final-grid"><section class="profile-card"><div class="kicker">MANAGEMENT PROFILE</div><div class="profile-name">${profile.name}</div><p>${profile.text}</p><div class="lesson-box"><strong>Most empowered stakeholder:</strong> ${top}<br><br>${profile.lesson}</div><div style="margin-top:14px"><button id="playAgain" class="secondary-btn" type="button">Play Again</button></div></section>
 <section class="network-viz"><svg viewBox="0 0 640 420" role="img" aria-label="Stakeholder power map"><defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g stroke="#29445d" stroke-width="2" opacity=".7">${positions.slice(0,8).map((p,i)=>positions.slice(i+1,8).filter((_,j)=>((i+j)%3===0)).map(q=>`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`).join('')).join('')}</g>${svgNodes}</svg></section></div>
 <div class="reflection"><div class="kicker">BOARDROOM REFLECTION</div><h3>Which stakeholder became more powerful because of your own decisions — and what would you change if you replayed the simulation?</h3><p style="color:#a9bdce">Use your answer to connect the game back to power, legitimacy, urgency, gatekeeping, revenue dependence, and stakeholder fragmentation.</p></div>`,{status:'Postgame · stakeholder power map'});
 $('playAgain').onclick=reset;
}
function getProfile(){const m=state.metrics,vals=Object.values(m),spread=Math.max(...vals)-Math.min(...vals);const top=Object.entries(m).sort((a,b)=>b[1]-a[1])[0][0];if(spread<=18)return{name:'THE BALANCER',text:'You distributed concessions broadly and kept competing stakeholder claims within a relatively narrow range.',lesson:'Balance can create resilience, but it can also hide the need to make a decisive strategic choice.'};if(top==='access')return{name:'THE GATEKEEPER OPERATOR',text:'You protected access to the title and worked comfortably with concentrated publisher power.',lesson:'Access is essential, but dependency on a private gatekeeper can reduce strategic flexibility.'};if(top==='welfare')return{name:'THE PLAYER ADVOCATE',text:'You treated player welfare and legitimacy as strategic assets rather than side constraints.',lesson:'Protecting labor conditions can strengthen the ecosystem, but managers still have to fund the model.'};if(top==='fans')return{name:'THE COMMUNITY BUILDER',text:'You treated fans as active stakeholders whose legitimacy and participation create commercial value.',lesson:'Community trust can be monetized, but over-commercialization can destroy the resource you are trying to monetize.'};if(top==='runway')return{name:'THE CAPITAL OPERATOR',text:'You prioritized survival, revenue quality, and operating runway under pressure.',lesson:'Capital solves immediate constraints, but every source of money creates expectations and dependence.'};return{name:'THE SYSTEM STABILIZER',text:'You consistently chose actions that reduced fragmentation and kept the ecosystem functioning under shock.',lesson:'Stability is valuable, but managers must still ask who benefits from the structure they preserve.'}}

$('restartBtn').onclick=()=>{if(confirm('Restart the entire simulation?'))reset()};
$('soundBtn').onclick=()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'Sound On':'Sound Off';$('soundBtn').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound('score')};
render();
})();