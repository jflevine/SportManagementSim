(()=>{
'use strict';
const LOCAL='spm343_rpg_state_v1', CREDS='spm343_rpg_creds_v1', PREFIX='spm343_classroom_director_v1_';
const game=()=>document.getElementById('gameScreen');
const visible=()=>{const g=game();return !!g&&!g.classList.contains('hidden')};
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const mandates=[
 {id:'community',title:'COMMUNITY FIRST',icon:'◆',text:'Build something people would miss if it disappeared. When scale and community conflict, defend participation, trust, and belonging.'},
 {id:'sustainable',title:'SUSTAINABLE OPERATOR',icon:'$',text:'Hype is not a business model. Favor repeatable value, diversified revenue, and decisions your organization can afford twice.'},
 {id:'players',title:'PLAYER ADVOCATE',icon:'♥',text:'Treat players as people and long-term assets. When performance, content, and welfare collide, protect sustainable careers.'},
 {id:'independent',title:'INDEPENDENCE',icon:'⚡',text:'Do not let one stakeholder quietly own your future. Scrutinize publisher, sponsor, and platform dependence before you commit.'},
 {id:'growth',title:'AUDIENCE BUILDER',icon:'▲',text:'Grow attention without losing authenticity. Favor creators, distribution, and experiences that turn viewers into a durable community.'},
 {id:'systems',title:'SYSTEMS THINKER',icon:'◎',text:'Your advantage is coordination. Favor choices that connect segments, clarify roles, and reduce single points of failure.'}
];
const shocks=[
 {id:'sponsor',at:2,kicker:'BREAKING NEWS',title:'SPONSOR FREEZE',text:'A major partner freezes discretionary esports spending. Your next major choice must be defensible even if sponsor money gets tighter.',prompt:'What value does your organization create without the sponsor?'},
 {id:'publisher',at:4,kicker:'PATCH ALERT',title:'THE RULES JUST CHANGED',text:'The publisher changes tournament rules and tightens co-streaming permissions. Access to the title is now less predictable.',prompt:'Who actually controls the asset your strategy depends on?'},
 {id:'burnout',at:6,kicker:'PLAYER ALERT',title:'STAR PLAYER STEPS BACK',text:'A top player cites burnout and asks to reduce competitive and content obligations. Fans and sponsors immediately react.',prompt:'What does sustainable talent management require now?'},
 {id:'capital',at:7,kicker:'BOARD ALERT',title:'INVESTORS WANT A PATH TO PROFIT',text:'Your investors are done rewarding growth alone. They want runway, revenue quality, and a reason the organization survives the next downturn.',prompt:'What is your durable asset if one revenue stream disappears?'},
 {id:'integrity',at:8,kicker:'INTEGRITY ALERT',title:'SUSPICIOUS BETTING ACTIVITY',text:'Unusual wagers appear around an upcoming competition. The issue could involve players, organizers, platforms, and regulators.',prompt:'Whose claim has the greatest power, legitimacy, and urgency?'}
];
let run=null,timer=null,poll=null,lastCompleted=-1,overlayOpen=false;
function injectStyle(){
 if(document.getElementById('classroomDirectorStyle'))return;
 const s=document.createElement('style');s.id='classroomDirectorStyle';s.textContent=`
 #classDirectorHud{position:fixed;right:18px;bottom:18px;z-index:1500;display:flex;gap:8px;align-items:center;font-family:Inter,system-ui,sans-serif;pointer-events:auto}
 #classDirectorHud.hidden{display:none}.cd-chip{border:1px solid rgba(150,231,255,.35);background:rgba(5,15,28,.92);box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 0 18px rgba(75,206,255,.05);color:#eaf8ff;border-radius:999px;padding:9px 12px;font-size:12px;letter-spacing:.05em}.cd-chip strong{color:#7fe8ff;margin-left:5px}.cd-btn{cursor:pointer}.cd-btn:hover{border-color:#7fe8ff;transform:translateY(-1px)}
 #classDirectorOverlay{position:fixed;inset:0;z-index:4000;display:none;place-items:center;background:radial-gradient(circle at 50% 35%,rgba(14,44,72,.72),rgba(2,6,12,.92));backdrop-filter:blur(5px);font-family:Inter,system-ui,sans-serif;padding:20px}
 #classDirectorOverlay.show{display:grid}.cd-card{position:relative;width:min(760px,94vw);overflow:hidden;border:1px solid rgba(129,229,255,.38);border-radius:18px;background:linear-gradient(145deg,rgba(7,20,35,.98),rgba(11,31,49,.98));box-shadow:0 28px 90px rgba(0,0,0,.62),0 0 55px rgba(40,202,255,.13);color:#eefaff;padding:30px}
 .cd-card:before{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 4px,rgba(255,255,255,.014) 5px)}.cd-kicker{color:#76e7ff;font-weight:800;font-size:12px;letter-spacing:.18em}.cd-title{font-size:clamp(30px,6vw,54px);line-height:.98;margin:8px 0 14px;font-weight:900;letter-spacing:-.03em}.cd-body{font-size:17px;line-height:1.55;color:#c9dce8;max-width:64ch}.cd-prompt{margin:20px 0 0;border-left:3px solid #ffd166;padding:11px 14px;background:rgba(255,209,102,.07);color:#fff2c9;font-weight:700}.cd-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}.cd-action{border:0;border-radius:10px;padding:11px 16px;font-weight:800;cursor:pointer;background:#7fe8ff;color:#06111b}.cd-action.alt{background:transparent;color:#cdeefa;border:1px solid rgba(127,232,255,.4)}
 .cd-flash{animation:cdPulse .55s ease}@keyframes cdPulse{0%{filter:brightness(1)}45%{filter:brightness(1.35)}100%{filter:brightness(1)}}
 @media(max-width:700px){#classDirectorHud{right:8px;bottom:8px;flex-wrap:wrap;justify-content:flex-end}.cd-chip{font-size:10px;padding:7px 9px}.cd-card{padding:22px}.cd-body{font-size:15px}}
 @media(prefers-reduced-motion:reduce){.cd-btn:hover{transform:none}.cd-flash{animation:none}}
 `;document.head.appendChild(s);
}
function getRunKey(){const c=read(CREDS),s=read(LOCAL);if(c?.saveId)return c.saveId;if(s?.playerName)return `${s.playerName}_${s.archetype||'career'}_${s.avatar||'x'}`;return null}
function loadRun(key){let r=read(PREFIX+key);if(!r){const m=mandates[Math.floor(Math.random()*mandates.length)];r={key,mandate:m.id,start:Date.now(),shown:[],briefed:false,expired:false};localStorage.setItem(PREFIX+key,JSON.stringify(r))}return r}
function store(){if(run)try{localStorage.setItem(PREFIX+run.key,JSON.stringify(run))}catch{}}
function mandate(){return mandates.find(m=>m.id===run?.mandate)||mandates[0]}
function ensureHud(){
 let h=document.getElementById('classDirectorHud');if(h)return h;
 h=document.createElement('div');h.id='classDirectorHud';h.className='hidden';h.innerHTML=`<button id="cdMandate" class="cd-chip cd-btn" type="button">BOARD MANDATE <strong>VIEW</strong></button><div class="cd-chip">MISSION CLOCK <strong id="cdClock">20:00</strong></div>`;document.body.appendChild(h);
 h.querySelector('#cdMandate').onclick=()=>showMandate(false);return h;
}
function ensureOverlay(){let o=document.getElementById('classDirectorOverlay');if(o)return o;o=document.createElement('div');o.id='classDirectorOverlay';o.innerHTML='<div class="cd-card" role="dialog" aria-modal="true"><div id="cdKicker" class="cd-kicker"></div><div id="cdTitle" class="cd-title"></div><div id="cdBody" class="cd-body"></div><div id="cdPrompt" class="cd-prompt"></div><div class="cd-actions"><button id="cdClose" class="cd-action" type="button">Back to the City</button></div></div>';document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)closeOverlay()});o.querySelector('#cdClose').onclick=closeOverlay;return o}
function showCard(kicker,title,body,prompt,button='Back to the City'){
 const o=ensureOverlay();overlayOpen=true;o.querySelector('#cdKicker').textContent=kicker;o.querySelector('#cdTitle').textContent=title;o.querySelector('#cdBody').textContent=body;o.querySelector('#cdPrompt').textContent=prompt||'';o.querySelector('#cdPrompt').style.display=prompt?'block':'none';o.querySelector('#cdClose').textContent=button;o.classList.add('show');document.body.classList.add('cd-flash');setTimeout(()=>document.body.classList.remove('cd-flash'),600)
}
function closeOverlay(){const o=document.getElementById('classDirectorOverlay');if(o)o.classList.remove('show');overlayOpen=false}
function showMandate(first){const m=mandate();showCard(first?'YOUR SECRET BOARD MANDATE':'BOARD MANDATE',`${m.icon} ${m.title}`,m.text,'Your pod should let this mandate influence at least one major decision. Be ready to defend where it helped — and where it hurt.');run.briefed=true;store()}
function showShock(s){run.shown.push(s.id);store();showCard(s.kicker,s.title,s.text,s.prompt,'Accept the Challenge')}
function showBoardMeeting(){if(run.expired)return;run.expired=true;store();showCard('TIME','BOARD MEETING', 'The twenty-minute operating window is over. Finish the decision currently on screen, then stop moving through the city.','Your pod must defend one choice, identify one stakeholder dependency, and name one decision you would change.','Prepare the Defense')}
function completedCount(){const s=read(LOCAL);return Array.isArray(s?.flags?.completed)?s.flags.completed.length:0}
function maybeShock(){if(!run||overlayOpen)return;const count=completedCount();if(count===lastCompleted)return;lastCompleted=count;const pending=shocks.find(s=>count>=s.at&&!run.shown.includes(s.id));if(pending&&visible())showShock(pending)}
function tick(){
 const h=ensureHud();h.classList.toggle('hidden',!visible());if(!visible()||!run)return;
 const remain=Math.max(0,20*60*1000-(Date.now()-run.start));const mm=Math.floor(remain/60000),ss=Math.floor((remain%60000)/1000),clock=document.getElementById('cdClock');if(clock)clock.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;if(remain<=0&&!run.expired&&!overlayOpen)showBoardMeeting();maybeShock();
}
function boot(){injectStyle();ensureHud();ensureOverlay();poll=setInterval(()=>{if(!visible())return;const key=getRunKey();if(!key)return;if(!run||run.key!==key){run=loadRun(key);lastCompleted=-1;if(!run.briefed&&!overlayOpen)setTimeout(()=>{if(visible()&&run&&!run.briefed)showMandate(true)},700)}},500);timer=setInterval(tick,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
