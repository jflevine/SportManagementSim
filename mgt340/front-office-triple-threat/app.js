(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const clamp = (n,min=0,max=100) => Math.max(min,Math.min(max,n));
  const SAVE_KEY = 'mgt340_front_office_triple_threat_v1';
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const intro = $('introScreen');
  const game = $('gameScreen');
  const result = $('resultScreen');
  const host = $('stageHost');
  const nameInput = $('execName');
  const startBtn = $('startBtn');
  const restartBtn = $('restartBtn');
  const soundBtn = $('soundBtn');
  const toastEl = $('toast');

  let timerId = null;
  let audioCtx = null;
  let soundOn = true;

  const freshState = name => ({
    name,
    stage:1,
    metrics:{performance:70,people:70,money:70,fan:70},
    competencies:{planning:0,organizing:0,leading:0,evaluating:0},
    plan:{firstTeam:0,academy:0,analytics:0,facilities:0,marketing:0,scouting:0},
    hockey:{authority:null,structure:null},
    basketball:{choice:null,timeLeft:45},
    evaluation:{team:null,kpis:[]},
    owner:{moves:[]},
    headlines:['Board mandate issued: modernize all three teams.'],
    flags:{}
  });

  let state = freshState('');

  const planDefs = [
    ['firstTeam','First Team','Immediate talent and star power'],
    ['academy','Academy','Long-term player development'],
    ['analytics','Analytics','Better information and decision quality'],
    ['facilities','Facilities','Training environment and infrastructure'],
    ['marketing','Marketing','Attention, demand, and fan growth'],
    ['scouting','Scouting','Future talent identification']
  ];

  const ownerMoves = [
    {id:'cpo',name:'Hire Chief Performance Officer',cost:3,desc:'Connect medical, performance, coaching, and player-development decisions.',effects:{people:5,performance:3},comp:{organizing:7}},
    {id:'analytics',name:'Build Group Analytics Unit',cost:3,desc:'Create shared decision intelligence across all three clubs.',effects:{performance:3,money:3},comp:{planning:4,evaluating:7}},
    {id:'coach',name:'Basketball Leadership Reset',cost:5,desc:'Replace the head coach and rebuild staff-player expectations.',effects:{performance:4,people:3,fan:-1},comp:{leading:6}},
    {id:'academy',name:'Expand Forge FC Academy',cost:4,desc:'Invest in development, scouting, and a sustainable talent pipeline.',effects:{performance:3,money:4,fan:3},comp:{planning:6}},
    {id:'hockeyOps',name:'Reorganize Hockey Operations',cost:2,desc:'Clarify reporting lines and decision authority across hockey operations.',effects:{people:4,performance:2},comp:{organizing:7}},
    {id:'development',name:'Employee Development Fund',cost:2,desc:'Train managers, retain staff, and strengthen succession pathways.',effects:{people:7,money:-1},comp:{leading:4,organizing:3}},
    {id:'crm',name:'Launch Group Fan CRM',cost:2,desc:'Connect ticketing, content, service, and fan relationship data.',effects:{fan:7,money:2},comp:{evaluating:3}},
    {id:'science',name:'Sports Science Upgrade',cost:3,desc:'Improve availability, recovery, and evidence-based workload decisions.',effects:{performance:5,people:3},comp:{evaluating:4,organizing:2}}
  ];

  function ensureAudio(){
    if(!soundOn) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    if(!audioCtx) audioCtx = new Ctx();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function tone(freq=440,dur=.07,type='sine',vol=.035,delay=0){
    const ctx = ensureAudio(); if(!ctx) return;
    const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+dur+.03);
  }
  function clickSound(){tone(520,.045,'triangle',.025);tone(720,.055,'sine',.018,.035)}
  function successSound(){[523,659,784].forEach((f,i)=>tone(f,.12,'triangle',.035,i*.07))}
  function warningSound(){tone(220,.12,'sawtooth',.024);tone(174,.14,'triangle',.022,.1)}
  function crowdSound(){
    const ctx=ensureAudio();if(!ctx)return;
    const len=Math.floor(ctx.sampleRate*.36),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len)*.18;
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buf;f.type='bandpass';f.frequency.value=850;f.Q.value=.8;g.gain.value=.16;src.connect(f);f.connect(g);g.connect(ctx.destination);src.start();
  }

  function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{}}
  function clearSave(){try{localStorage.removeItem(SAVE_KEY)}catch{}}
  function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastEl._t);toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),2000)}
  function addHeadline(text){state.headlines.push(text);if(state.headlines.length>8)state.headlines.shift();$('newsTicker').textContent=text}
  function applyMetrics(delta){Object.entries(delta).forEach(([k,v])=>state.metrics[k]=clamp(state.metrics[k]+v))}
  function applyComp(delta){Object.entries(delta).forEach(([k,v])=>state.competencies[k]=clamp(state.competencies[k]+v))}
  function orgScore(){const m=Object.values(state.metrics);return Math.round(m.reduce((a,b)=>a+b,0)/m.length)}
  function healthText(score){if(score>=86)return 'Board-level momentum';if(score>=78)return 'Strong and improving';if(score>=68)return 'Stable, but exposed';if(score>=58)return 'Under pressure';return 'Board intervention likely'}

  function updateHud(){
    $('execLabel').textContent=(state.name||'PRESIDENT').toUpperCase();
    const score=orgScore();$('orgScore').textContent=score;$('healthText').textContent=healthText(score);
    [['performance','performance'],['people','people'],['money','money'],['fan','fan']].forEach(([key,id])=>{
      $(id+'Value').textContent=Math.round(state.metrics[key]);$(id+'Bar').style.width=state.metrics[key]+'%';
    });
    Object.entries(state.competencies).forEach(([k,v])=>$(k+'Score').textContent=Math.round(v));
    document.querySelectorAll('.progress-step').forEach(el=>{const n=Number(el.dataset.step);el.classList.toggle('active',n===state.stage);el.classList.toggle('done',n<state.stage)});
    const titles={1:'Planning Room',2:'Organization Room',3:'Leadership Timeout',4:'Performance Lab',5:'Owner’s Challenge'};
    $('stageTitle').textContent=titles[state.stage]||'Executive Command';
  }

  function impactChip(label,val){return `<span class="impact-chip ${val>=0?'good':'bad'}">${label} ${val>=0?'+':''}${val}</span>`}
  function consequence(title,body,impacts,lesson,nextLabel,nextHandler){
    return `<div class="consequence"><div class="consequence-head"><strong>${title}</strong><span>DECISION LOCKED</span></div><div class="consequence-body"><p>${body}</p><div class="impact-row">${Object.entries(impacts).map(([k,v])=>impactChip(labelForMetric(k),v)).join('')}</div><div class="lesson-callout"><strong>Management takeaway:</strong> ${lesson}</div><div class="action-row"><button class="primary-btn" id="nextStageBtn" type="button">${nextLabel} →</button></div></div></div>`;
  }
  function labelForMetric(k){return ({performance:'Performance',people:'People',money:'Money',fan:'Fans'})[k]||k}

  function render(){
    clearInterval(timerId);timerId=null;updateHud();
    if(state.stage===1)renderPlanning();
    if(state.stage===2)renderOrganizing();
    if(state.stage===3)renderLeading();
    if(state.stage===4)renderEvaluating();
    if(state.stage===5)renderOwner();
    save();
  }

  function stageIntro(kicker,title,desc,emoji){return `<div class="stage-top"><div><div class="stage-kicker">${kicker}</div><h3>${title}</h3><p>${desc}</p></div><div class="sport-badge" aria-hidden="true">${emoji}</div></div>`}

  function renderPlanning(){
    const used=Object.values(state.plan).reduce((a,b)=>a+b,0),remaining=10-used;
    host.innerHTML=stageIntro('ACT I · SOCCER · PLANNING','Build the Three-Year Plan','Forge FC finished eighth. Ownership wants a contender, but payroll is already stretched. You have 10 planning tokens. Decide where the organization should place its scarce resources.','⚽')+
    `<div class="stage-body"><div class="visual-split"><div class="sport-board soccer"><div class="score-bug"><strong>FORGE FC</strong><span>YEAR 0</span><span>8TH PLACE</span></div><div class="plan-visual">${planDefs.map(([id,label])=>`<div class="plan-node"><strong>${state.plan[id]}</strong><span>${label}</span></div>`).join('')}</div></div><div class="decision-panel"><h4>Allocate 10 planning tokens</h4><p>Every investment creates an opportunity cost. There is no way to maximize everything at once.</p><div class="allocation-list">${planDefs.map(([id,label,desc])=>`<div class="allocation-row"><div class="allocation-label"><strong>${label}</strong><small>${desc}</small></div><div class="counter"><button type="button" data-dec="${id}" aria-label="Remove one token from ${label}">−</button><span>${state.plan[id]}</span><button type="button" data-inc="${id}" aria-label="Add one token to ${label}" ${remaining===0?'disabled':''}>+</button></div></div>`).join('')}</div><div class="budget-status"><span>Planning capital remaining</span><strong>${remaining} / 10</strong></div><div class="action-row"><button id="commitPlan" class="primary-btn" type="button" ${remaining!==0?'disabled':''}>Commit Three-Year Plan</button></div></div></div></div>`;
    host.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>{if(remaining<=0)return;state.plan[b.dataset.inc]++;clickSound();renderPlanning()}));
    host.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.dec;if(state.plan[id]<=0)return;state.plan[id]--;clickSound();renderPlanning()}));
    $('commitPlan').addEventListener('click',commitPlanning);
  }

  function commitPlanning(){
    const p=state.plan;
    const delta={
      performance:clamp(p.firstTeam*2+p.analytics+p.scouting+p.academy-7,-12,12),
      people:clamp(p.academy*2+p.facilities+p.analytics-5,-10,10),
      money:clamp(p.academy+p.scouting+p.analytics-p.firstTeam*2-p.facilities-2,-12,12),
      fan:clamp(p.marketing*2+p.firstTeam+p.academy-4,-10,12)
    };
    const spread=Object.values(p).filter(v=>v>0).length;
    const future=p.academy+p.analytics+p.scouting;
    const planning=clamp(55+spread*5+(future>=5?8:0)+(p.firstTeam<=4?5:0),55,96);
    applyMetrics(delta);state.competencies.planning=planning;state.flags.planDelta=delta;
    const profile=future>=5?'You built capacity as well as a roster. The plan may sacrifice some immediacy, but it creates multiple paths to future performance.':p.firstTeam>=5?'You made an aggressive win-now bet. The upside is visible quickly; the risk is that payroll and organizational capacity do not keep pace.':'You spread risk across the organization. The key question becomes whether your resources are concentrated enough to create a meaningful advantage.';
    addHeadline(`FORGE FC: Three-year plan approved. ${p.firstTeam>=5?'Ownership calls it aggressive.':'Board cites a broader modernization agenda.'}`);successSound();
    host.querySelector('.decision-panel').innerHTML=`<h4>Your plan is now policy</h4><p>${profile}</p>${consequence('YEAR 1 PROJECTION','The board runs your allocation through its operating model.',delta,'Planning means setting objectives and committing resources before results are known. A plan is a set of tradeoffs—not a wish list.','Go to Hockey Operations',()=>{})}`;
    $('nextStageBtn').addEventListener('click',()=>{state.stage=2;render()});updateHud();save();
  }

  const authorityChoices=[
    {id:'medical',title:'Medical Director has final clearance',text:'Coaches set competitive needs; medical owns return-to-play clearance.',delta:{performance:-1,people:7,money:0,fan:0},score:92,headline:'Forge Hockey formalizes medical authority on player clearance.'},
    {id:'gm',title:'General Manager decides',text:'The GM balances roster value, competitive pressure, and medical advice.',delta:{performance:4,people:-4,money:2,fan:2},score:67,headline:'GM takes control of availability decisions amid staff concern.'},
    {id:'coach',title:'Head Coach decides',text:'The coach controls the lineup and makes the final game-readiness call.',delta:{performance:5,people:-7,money:0,fan:3},score:55,headline:'Coach receives final say on player availability.'},
    {id:'committee',title:'Shared decision committee',text:'Medical, coach, GM, and performance staff must reach consensus.',delta:{performance:0,people:4,money:-1,fan:0},score:76,headline:'Forge creates a cross-functional player-availability committee.'}
  ];
  const structureChoices=[
    {id:'functional',title:'Clear functional authority',text:'Medical, coaching, hockey operations, and business each own defined domains.',bonus:10,people:3},
    {id:'owner',title:'Owner-centered structure',text:'Major operational decisions escalate to ownership for a final answer.',bonus:-3,people:-3},
    {id:'matrix',title:'Cross-functional matrix',text:'Shared initiatives connect specialists, with explicit tie-breaking authority.',bonus:7,people:2}
  ];

  function renderOrganizing(){
    host.innerHTML=stageIntro('ACT II · HOCKEY · ORGANIZING','Who Has the Whistle?','Your star forward has been medically cleared for contact, but the performance team says a full workload is unsafe. The coach wants him in the lineup tonight. Define who owns the decision—and how the organization is structured.','🏒')+
    `<div class="stage-body"><div class="hockey-layout"><div class="rink-board"><div class="rink-circle a"></div><div class="rink-circle b"></div><div class="authority-stack"><div class="authority-card"><strong>HEAD COACH</strong><span>“We need him tonight.”</span></div><div class="authority-card"><strong>MEDICAL DIRECTOR</strong><span>“Clearance is not the same as full workload.”</span></div><div class="authority-card"><strong>GENERAL MANAGER</strong><span>“We need one accountable decision rule.”</span></div><div class="authority-card"><strong>PERFORMANCE STAFF</strong><span>“The load data is flashing red.”</span></div></div></div><div class="decision-panel"><h4>Decision authority</h4><p>Who has final authority over whether the player returns tonight?</p><div class="choice-grid">${authorityChoices.map(c=>`<button type="button" class="choice-card ${state.hockey.authority===c.id?'selected':''}" data-authority="${c.id}"><strong>${c.title}</strong><span>${c.text}</span></button>`).join('')}</div><h4 style="margin-top:18px">Operating structure</h4><p>How should Forge prevent this conflict from becoming a recurring organizational problem?</p><div class="choice-grid">${structureChoices.map(c=>`<button type="button" class="choice-card ${state.hockey.structure===c.id?'selected':''}" data-structure="${c.id}"><strong>${c.title}</strong><span>${c.text}</span></button>`).join('')}</div><div class="action-row"><button id="commitHockey" class="primary-btn" type="button" ${!state.hockey.authority||!state.hockey.structure?'disabled':''}>Lock the Org Chart</button></div></div></div></div>`;
    host.querySelectorAll('[data-authority]').forEach(b=>b.addEventListener('click',()=>{state.hockey.authority=b.dataset.authority;clickSound();renderOrganizing()}));
    host.querySelectorAll('[data-structure]').forEach(b=>b.addEventListener('click',()=>{state.hockey.structure=b.dataset.structure;clickSound();renderOrganizing()}));
    $('commitHockey').addEventListener('click',commitHockey);
  }

  function commitHockey(){
    const a=authorityChoices.find(x=>x.id===state.hockey.authority),s=structureChoices.find(x=>x.id===state.hockey.structure);
    const delta={...a.delta,people:clamp(a.delta.people+s.people,-10,12)};
    const score=clamp(a.score+s.bonus,45,98);state.competencies.organizing=score;applyMetrics(delta);state.flags.hockeyDelta=delta;
    addHeadline(a.headline);successSound();
    const structureText=s.id==='owner'?'You created a clear answer, but pushed routine operating authority upward. That can make the organization slower and more dependent on one person.':s.id==='matrix'?'You built coordination into the structure. It works only if shared responsibility is paired with explicit decision rights.':'You clarified specialization and authority. Staff now know which decisions belong to which function.';
    host.querySelector('.decision-panel').innerHTML=`<h4>The structure is live</h4><p>${structureText}</p>${consequence('ORGANIZATION EFFECT','The first test of your new decision architecture arrives immediately.',delta,'Organizing is the work of dividing responsibilities, assigning authority, and coordinating specialized people so decisions can actually be executed.','Take the Basketball Timeout',()=>{})}`;
    $('nextStageBtn').addEventListener('click',()=>{state.stage=3;render()});updateHud();save();
  }

  const leadChoices=[
    {id:'public',title:'Back the coach publicly',text:'Reinforce authority now; address the player privately after the game.',delta:{performance:3,people:-3,money:0,fan:2},score:72,headline:'Basketball president publicly backs head coach after tense timeout.'},
    {id:'private',title:'Private star intervention',text:'Pull the star aside, listen, reset expectations, and preserve public unity.',delta:{performance:2,people:6,money:0,fan:1},score:88,headline:'Forge leadership resolves star-coach clash behind closed doors.'},
    {id:'bench',title:'Bench the star immediately',text:'Make accountability unmistakable, even if tonight’s result suffers.',delta:{performance:-5,people:3,money:0,fan:-2},score:77,headline:'Forge star benched after ignoring coaching staff.'},
    {id:'council',title:'Activate player leadership council',text:'Use captains and coaches to rebuild shared standards and accountability.',delta:{performance:0,people:7,money:0,fan:1},score:91,headline:'Forge turns to player leadership council amid locker-room tension.'}
  ];

  function renderLeading(){
    const c=state.basketball.choice;
    host.innerHTML=stageIntro('ACT III · BASKETBALL · LEADING','The Timeout Everyone Saw','Forge trails 96–89 with 6:32 left. The star ignored the coach in the last timeout. Teammates think stars play by different rules. Cameras caught everything. What does leadership look like under visible pressure?','🏀')+
    `<div class="stage-body"><div class="visual-split"><div class="basket-stage"><div class="basket-scoreboard"><div><span>FORGE</span><strong>89</strong></div><i></i><div><span>RIVALS</span><strong>96</strong></div></div><div class="locker-chat"><div class="quote-card"><strong>HEAD COACH</strong><p>“If standards change for stars, I cannot lead this team.”</p></div><div class="quote-card"><strong>TEAM CAPTAIN</strong><p>“Everyone is watching what you do next.”</p></div></div></div><div class="decision-panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><h4>Leadership decision</h4><p style="margin-bottom:0">You have one timeout to establish what happens next.</p></div><div class="timer-box"><span>⏱</span><strong id="leadTimer">${state.basketball.timeLeft}</strong>s</div></div><div class="choice-grid" style="margin-top:15px">${leadChoices.map(x=>`<button type="button" class="choice-card ${c===x.id?'selected':''}" data-lead="${x.id}"><strong>${x.title}</strong><span>${x.text}</span></button>`).join('')}</div><div class="action-row"><button id="commitLead" class="primary-btn" type="button" ${!c?'disabled':''}>Make the Call</button></div></div></div></div>`;
    host.querySelectorAll('[data-lead]').forEach(b=>b.addEventListener('click',()=>{state.basketball.choice=b.dataset.lead;clickSound();renderLeading()}));
    $('commitLead').addEventListener('click',commitLeading);
    if(!c && state.basketball.timeLeft>0){timerId=setInterval(()=>{state.basketball.timeLeft=Math.max(0,state.basketball.timeLeft-1);const el=$('leadTimer');if(el)el.textContent=state.basketball.timeLeft;if(state.basketball.timeLeft===0){clearInterval(timerId);warningSound();toast('Decision clock expired — pressure bonus lost.')}},1000)}
  }

  function commitLeading(){
    clearInterval(timerId);const c=leadChoices.find(x=>x.id===state.basketball.choice);const speedBonus=state.basketball.timeLeft>=20?5:0;const score=clamp(c.score+speedBonus,50,98);state.competencies.leading=score;applyMetrics(c.delta);state.flags.leadDelta=c.delta;addHeadline(c.headline);crowdSound();
    const response=c.id==='private'?'You protected public alignment while confronting the behavior directly. The challenge is making sure teammates still see consistent standards.':c.id==='council'?'You distributed leadership instead of treating influence as something held only by the person with the highest title.':c.id==='bench'?'You sent an unmistakable accountability signal. Leadership still requires repairing the relationship after the signal is sent.':'You protected formal authority in the moment. The private follow-up now determines whether compliance becomes genuine commitment.';
    host.querySelector('.decision-panel').innerHTML=`<h4>The building reacts</h4><p>${response}</p>${consequence('LOCKER ROOM RESPONSE','Players, coaches, and fans interpret not only the decision—but what it signals about standards.',c.delta,'Leading is influence: aligning people with organizational goals through communication, credibility, motivation, and consistent expectations.','Enter the Performance Lab',()=>{})}`;
    $('nextStageBtn').addEventListener('click',()=>{state.stage=4;render()});updateHud();save();
  }

  const kpiDefs=[
    {id:'wins',label:'Wins / competitive results',type:'outcome'},
    {id:'availability',label:'Player availability',type:'leading'},
    {id:'margin',label:'Operating margin',type:'outcome'},
    {id:'renewal',label:'Fan renewal / retention',type:'stakeholder'},
    {id:'turnover',label:'Employee turnover',type:'stakeholder'},
    {id:'pipeline',label:'Player development pipeline',type:'leading'}
  ];

  function renderEvaluating(){
    const selected=state.evaluation.kpis;
    host.innerHTML=stageIntro('ACT IV · ALL SPORTS · EVALUATING','What Does “Better” Mean?','The season is moving. The board wants a verdict. The problem: every team looks good on one dashboard and concerning on another. Decide what deserves corrective action—and what you will measure going forward.','📊')+
    `<div class="stage-body"><div class="eval-grid"><div class="team-dashboard"><header><strong>FORGE FC</strong><span>⚽</span></header><div class="kpi-list"><div class="kpi"><small>League position</small><strong>8th → 7th</strong></div><div class="kpi"><small>Academy value</small><strong class="up">+24%</strong></div><div class="kpi"><small>Payroll efficiency</small><strong class="up">+11%</strong></div><div class="kpi"><small>Fan satisfaction</small><strong class="up">+8</strong></div></div></div><div class="team-dashboard"><header><strong>FORGE HOCKEY</strong><span>🏒</span></header><div class="kpi-list"><div class="kpi"><small>Wins</small><strong class="down">−6</strong></div><div class="kpi"><small>Young-player minutes</small><strong class="up">+31%</strong></div><div class="kpi"><small>Revenue</small><strong class="up">+9%</strong></div><div class="kpi"><small>Season-ticket renewals</small><strong class="up">+6%</strong></div></div></div><div class="team-dashboard"><header><strong>FORGE BASKETBALL</strong><span>🏀</span></header><div class="kpi-list"><div class="kpi"><small>Wins</small><strong class="up">+7</strong></div><div class="kpi"><small>Player retention</small><strong class="down">−18%</strong></div><div class="kpi"><small>Staff engagement</small><strong class="down">−12</strong></div><div class="kpi"><small>Social engagement</small><strong class="up">+27%</strong></div></div></div></div><div class="eval-prompt"><h4 style="margin:0">1. Where do you intervene first?</h4><p style="color:#95aabd">This is a management judgment, not a trivia question.</p><div class="choice-grid">${[['soccer','Forge FC','Long-term investments are improving, but competitive progress is slow.'],['hockey','Forge Hockey','Results fell even as development and commercial indicators improved.'],['basketball','Forge Basketball','Wins improved while internal people indicators deteriorated.']].map(([id,t,d])=>`<button type="button" class="choice-card ${state.evaluation.team===id?'selected':''}" data-team="${id}"><strong>${t}</strong><span>${d}</span></button>`).join('')}</div><h4 style="margin:18px 0 3px">2. Choose exactly THREE board-level KPIs</h4><p style="color:#95aabd;margin-top:0">What you measure shapes what managers optimize.</p><div class="checkbox-grid">${kpiDefs.map(k=>`<label class="check-option"><input type="checkbox" data-kpi="${k.id}" ${selected.includes(k.id)?'checked':''} ${selected.length>=3&&!selected.includes(k.id)?'disabled':''}><span>${k.label}</span></label>`).join('')}</div><div class="action-row"><span style="color:#8ea4b7;align-self:center">${selected.length} / 3 selected</span><button id="commitEval" class="primary-btn" type="button" ${!state.evaluation.team||selected.length!==3?'disabled':''}>Deliver Performance Review</button></div></div></div>`;
    host.querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>{state.evaluation.team=b.dataset.team;clickSound();renderEvaluating()}));
    host.querySelectorAll('[data-kpi]').forEach(b=>b.addEventListener('change',()=>{const id=b.dataset.kpi;if(b.checked&&!state.evaluation.kpis.includes(id))state.evaluation.kpis.push(id);if(!b.checked)state.evaluation.kpis=state.evaluation.kpis.filter(x=>x!==id);clickSound();renderEvaluating()}));
    $('commitEval').addEventListener('click',commitEvaluation);
  }

  function commitEvaluation(){
    const types=new Set(state.evaluation.kpis.map(id=>kpiDefs.find(k=>k.id===id).type));
    const score=clamp(66+types.size*8+(state.evaluation.kpis.includes('turnover')||state.evaluation.kpis.includes('availability')?5:0),60,97);
    state.competencies.evaluating=score;
    const teamCopy={soccer:'You are not treating league position as the only measure of whether the plan is working. Your intervention tests whether long-term capability is converting into competitive progress.',hockey:'You are distinguishing a bad result from a bad system. The intervention should protect development and commercial gains while diagnosing the competitive decline.',basketball:'You are refusing to let wins hide organizational warning signs. The intervention treats retention and engagement as leading indicators of future performance.'};
    addHeadline(`BOARD REVIEW: ${state.evaluation.team==='basketball'?'Basketball':state.evaluation.team==='hockey'?'Hockey':'Soccer'} selected for corrective-action review.`);successSound();
    host.querySelector('.eval-prompt').innerHTML=`<h4>Your dashboard becomes the organization’s definition of success</h4><p>${teamCopy[state.evaluation.team]}</p><div class="lesson-callout"><strong>Management takeaway:</strong> Evaluating means establishing standards, measuring performance, interpreting what the evidence means, and deciding whether corrective action is necessary. A dashboard is never neutral: the metrics tell people what the organization values.</div><div class="action-row"><button id="nextStageBtn" class="primary-btn" type="button">Face the Owner’s Challenge →</button></div>`;
    $('nextStageBtn').addEventListener('click',()=>{state.stage=5;render()});updateHud();save();
  }

  function ownerSpend(){return state.owner.moves.reduce((sum,id)=>sum+(ownerMoves.find(m=>m.id===id)?.cost||0),0)}
  function renderOwner(){
    const spend=ownerSpend(),remaining=15-spend;
    host.innerHTML=`<div class="owner-board"><div class="owner-header"><div><div class="stage-kicker">FINAL ACT · THE OWNER’S CHALLENGE</div><h3>Modernize Forge Sports Group</h3><p style="color:#9fb2c2;max-width:820px">Three teams now share one ownership group. You have <strong>$15M</strong> and at most <strong>6 executive actions</strong>. Build the portfolio you believe gives the organization the best chance to succeed next season.</p></div><div class="resource-bank"><div class="resource-pill"><strong>$${remaining}M</strong><span>BUDGET LEFT</span></div><div class="resource-pill"><strong>${6-state.owner.moves.length}</strong><span>ACTIONS LEFT</span></div></div></div><div class="investment-grid">${ownerMoves.map(m=>`<button type="button" class="investment-card ${state.owner.moves.includes(m.id)?'selected':''}" data-move="${m.id}"><span class="price-tag">$${m.cost}M</span><strong>${m.name}</strong><p>${m.desc}</p></button>`).join('')}</div><div class="action-row"><button id="simulateBtn" class="primary-btn" type="button" ${state.owner.moves.length<3?'disabled':''}>SIMULATE SEASON →</button></div></div>`;
    host.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.move,m=ownerMoves.find(x=>x.id===id),has=state.owner.moves.includes(id);if(has){state.owner.moves=state.owner.moves.filter(x=>x!==id);clickSound();renderOwner();return}if(state.owner.moves.length>=6){warningSound();toast('You only have 6 executive actions.');return}if(ownerSpend()+m.cost>15){warningSound();toast('That move exceeds the $15M budget.');return}state.owner.moves.push(id);clickSound();renderOwner()}));
    $('simulateBtn').addEventListener('click',simulateSeason);
  }

  function simulateSeason(){
    const chosen=state.owner.moves.map(id=>ownerMoves.find(m=>m.id===id));
    chosen.forEach(m=>{applyMetrics(m.effects);applyComp(m.comp)});
    const events=[];
    if(state.plan.academy+state.plan.scouting>=4)events.push(['good','FORGE FC','Academy graduates begin earning first-team minutes.']);
    else events.push(['bad','FORGE FC','Roster costs rise faster than internal player value.']);
    if(state.hockey.authority==='medical'||state.owner.moves.includes('cpo'))events.push(['good','FORGE HOCKEY','Player availability improves as decision rights become clearer.']);
    else events.push(['bad','FORGE HOCKEY','Another availability dispute exposes unclear authority.']);
    if(['private','council'].includes(state.basketball.choice)||state.owner.moves.includes('coach'))events.push(['good','FORGE BASKETBALL','Locker-room trust stabilizes during a difficult road stretch.']);
    else events.push(['bad','FORGE BASKETBALL','The original leadership conflict resurfaces after another high-profile loss.']);
    if(state.owner.moves.includes('analytics'))events.push(['good','GROUP OFFICE','Shared analytics catches a cost and workload trend before it becomes a crisis.']);
    if(state.owner.moves.includes('crm'))events.push(['good','FAN BUSINESS','Cross-team fan renewal campaign outperforms projection.']);
    if(state.metrics.people<65)events.push(['bad','PEOPLE','Key staff turnover becomes a board-level risk.']);
    else events.push(['good','PEOPLE','Employee retention improves as roles and expectations become clearer.']);
    const bonus=state.owner.moves.length>=4?2:0;applyMetrics({performance:bonus,people:bonus,fan:bonus});
    state.flags.simEvents=events;save();
    host.innerHTML=`<div class="season-sim"><div class="stage-kicker">SEASON SIMULATION // PROCESSING</div><h3 style="font-size:42px;margin:6px 0">One season later…</h3><p style="color:#9eb1c2">Your decisions collide with injuries, performance variance, staff behavior, fan reactions, and financial constraints.</p><div id="simTrack" class="sim-track"></div><div class="action-row"><button id="boardResultBtn" class="primary-btn" type="button" disabled>Enter the Boardroom</button></div></div>`;
    const track=$('simTrack'),btn=$('boardResultBtn');
    events.forEach((e,i)=>setTimeout(()=>{const d=document.createElement('div');d.className=`sim-event ${e[0]}`;d.innerHTML=`<strong>${e[1]}</strong><span>${e[2]}</span>`;track.appendChild(d);if(i===events.length-1){btn.disabled=false;successSound()}},reducedMotion?0:i*380));
    btn.addEventListener('click',showResults);updateHud();
  }

  function profileType(){
    const c=state.competencies,vals=Object.entries(c).sort((a,b)=>b[1]-a[1]);
    if(vals[0][1]-vals[3][1]<=10)return ['THE COMPLETE EXECUTIVE','You built a relatively balanced management profile and resisted treating one function as the whole job.'];
    const pair=new Set([vals[0][0],vals[1][0]]);
    if(pair.has('planning')&&pair.has('evaluating'))return ['THE SYSTEM BUILDER','You prefer to set direction, build feedback loops, and adjust the system as evidence changes.'];
    if(pair.has('planning')&&pair.has('leading'))return ['THE VISION ARCHITECT','You connect long-term direction with the human influence needed to move people toward it.'];
    if(pair.has('organizing')&&pair.has('leading'))return ['THE CULTURE OPERATOR','You focus on roles, authority, standards, and the people who must execute the plan.'];
    if(pair.has('organizing')&&pair.has('evaluating'))return ['THE OPERATING ARCHITECT','You build structures, define accountability, and use evidence to keep the organization aligned.'];
    if(pair.has('leading')&&pair.has('evaluating'))return ['THE ADAPTIVE LEADER','You read people and performance signals quickly, then intervene when the organization starts drifting.'];
    return ['THE STRATEGIC OPERATOR','You combine direction with execution and tend to think in tradeoffs rather than isolated decisions.'];
  }

  function showResults(){
    clearInterval(timerId);game.classList.add('hidden');result.classList.remove('hidden');intro.classList.add('hidden');
    const [title,desc]=profileType(),score=orgScore(),c=state.competencies;
    const low=Object.entries(state.metrics).sort((a,b)=>a[1]-b[1])[0];
    result.innerHTML=`<div class="result-grid"><div class="profile-hero"><div class="eyebrow">BOARD REVIEW // ${state.name.toUpperCase()}</div><h2>YOUR MANAGEMENT PROFILE<span>${title}</span></h2><p>${desc}</p><div class="profile-bars">${Object.entries(c).map(([k,v])=>`<div class="profile-bar"><span>${k[0].toUpperCase()+k.slice(1)}</span><div class="profile-bar-track"><i style="width:${v}%"></i></div><strong>${Math.round(v)}</strong></div>`).join('')}</div><div class="reflection"><strong>Boardroom reflection:</strong> If this were a real organization, which decision would you change—and what new information would you want before making it?</div></div><aside class="final-card"><div class="mini-heading">FORGE SPORTS GROUP · FINAL</div><h3>Season Report</h3><div class="final-stat"><span>Organization score</span><strong>${score}/100</strong></div><div class="final-stat"><span>Performance</span><strong>${Math.round(state.metrics.performance)}</strong></div><div class="final-stat"><span>People</span><strong>${Math.round(state.metrics.people)}</strong></div><div class="final-stat"><span>Money</span><strong>${Math.round(state.metrics.money)}</strong></div><div class="final-stat"><span>Fan confidence</span><strong>${Math.round(state.metrics.fan)}</strong></div><div class="lesson-callout" style="margin-top:16px"><strong>Pressure point:</strong> Your lowest organizational indicator was <strong>${labelForMetric(low[0])}</strong> at ${Math.round(low[1])}. Management functions interact: improving one dimension can create pressure somewhere else.</div><div class="result-actions"><button id="playAgainBtn" class="primary-btn" type="button">Play Again</button></div></aside></div>`;
    $('playAgainBtn').addEventListener('click',resetAll);successSound();clearSave();
  }

  function begin(name){
    state=freshState(name.trim());intro.classList.add('hidden');result.classList.add('hidden');game.classList.remove('hidden');addHeadline(`${state.name} appointed President of Forge Sports Group.`);render();clickSound();window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'});
  }
  function resetAll(){clearInterval(timerId);clearSave();state=freshState('');game.classList.add('hidden');result.classList.add('hidden');intro.classList.remove('hidden');nameInput.value='';startBtn.disabled=true;window.scrollTo({top:0,behavior:'auto'})}

  nameInput.addEventListener('input',()=>startBtn.disabled=!nameInput.value.trim());
  nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&nameInput.value.trim())begin(nameInput.value)});
  startBtn.addEventListener('click',()=>begin(nameInput.value));
  restartBtn.addEventListener('click',()=>{if(confirm('Restart the simulation from the beginning?'))resetAll()});
  soundBtn.addEventListener('click',()=>{soundOn=!soundOn;soundBtn.textContent=soundOn?'🔊 Sound':'🔇 Muted';soundBtn.setAttribute('aria-pressed',String(soundOn));if(soundOn)clickSound()});
  document.addEventListener('pointerdown',()=>ensureAudio(),{once:true});

  // A refresh during a run can recover the current simulation.
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(saved&&saved.name&&saved.stage>=1&&saved.stage<=5){
      const resume=document.createElement('button');resume.type='button';resume.className='secondary-btn';resume.textContent=`Resume ${saved.name}’s simulation`;
      resume.addEventListener('click',()=>{state=saved;intro.classList.add('hidden');game.classList.remove('hidden');result.classList.add('hidden');render()});
      document.querySelector('.start-controls').appendChild(resume);
    }
  }catch{}
})();
