// Phase 3 — Manager Development & Career Capital
// Loaded after the core game. This module intentionally avoids rewriting game.js.
(function(){
  const D=window.RPG_DATA||{};
  const LOCAL_KEY='spm343_rpg_state_v1';
  const SAVE_ENDPOINT_FRAGMENT='spm343-rpg-save';
  const nativeSet=Storage.prototype.setItem;
  const nativeFetch=window.fetch.bind(window);
  const clone=o=>JSON.parse(JSON.stringify(o||{}));

  const PERKS={
    strategy_lens:{skill:'Strategy',tier:1,cost:1,name:'Scenario Scan',desc:'Adds a strategic lens to future decisions and emphasizes sequencing, dependencies, and tradeoffs.'},
    strategy_adapt:{skill:'Strategy',tier:2,cost:2,name:'Adaptive Planning',desc:'Future choices that build Strategy gain +1 additional Strategy.',requires:'strategy_lens',item:'campus_map'},
    finance_reserve:{skill:'Finance',tier:1,cost:1,name:'Contingency Reserve',desc:'Softens negative Sponsor and Pro relationship consequences by 2 points.'},
    finance_efficiency:{skill:'Finance',tier:2,cost:2,name:'Capital Discipline',desc:'Future choices that build Finance gain +1 additional Finance.',requires:'finance_reserve',item:'runway_sheet'},
    marketing_pulse:{skill:'Marketing',tier:1,cost:1,name:'Audience Pulse',desc:'Positive Creator and Sponsor relationship gains receive a +2 bonus.'},
    marketing_activation:{skill:'Marketing',tier:2,cost:2,name:'Activation Engine',desc:'Future choices that build Marketing gain +1 additional Marketing.',requires:'marketing_pulse',item:'sponsor_brief'},
    operations_backup:{skill:'Operations',tier:1,cost:1,name:'Redundancy Plan',desc:'EventPartner and Player penalties are softened by 2 points; positive gains receive +1.'},
    operations_resilience:{skill:'Operations',tier:2,cost:2,name:'Live Ops Mastery',desc:'Future choices that build Operations gain +1 additional Operations.',requires:'operations_backup',item:'event_ops_plan'},
    community_trust:{skill:'Community',tier:1,cost:1,name:'Trust Network',desc:'Community and School gains receive +2; penalties are softened by 2.'},
    community_network:{skill:'Community',tier:2,cost:2,name:'Community Flywheel',desc:'Future choices that build Community gain +1 additional Community.',requires:'community_trust',item:'community_playbook'},
    governance_counsel:{skill:'Governance',tier:1,cost:1,name:'Counsel Review',desc:'Publisher and Campus penalties are softened by 2; positive gains receive +1.'},
    governance_leverage:{skill:'Governance',tier:2,cost:2,name:'Negotiating Leverage',desc:'Future choices that build Governance gain +1 additional Governance.',requires:'governance_counsel',item:'tournament_license'}
  };
  const skillOrder=['Strategy','Finance','Marketing','Operations','Community','Governance'];
  const lensCopy={
    Strategy:'Sequence the decision: what must happen first, what depends on it, and what option preserves future flexibility?',
    Finance:'Separate visible growth from durable economics. Which option protects runway and repeatable value?',
    Marketing:'Start with the audience and the value exchange. Which choice creates behavior, not just impressions?',
    Operations:'Identify the critical dependency. Which option keeps the system playable, safe, credible, and recoverable?',
    Community:'Ask who participates, who benefits, and whether the decision strengthens trust beyond one event.',
    Governance:'Identify who controls permission, authority, and change. Which dependency needs to be explicit before you commit?'
  };

  const BASE_EFFECTS={};
  Object.entries(D.quests||{}).forEach(([qid,q])=>{
    BASE_EFFECTS[qid]=(q.decision?.choices||[]).map(c=>clone(c.effects||{}));
  });

  let meta={points:0,perks:{},highestLevelCredited:1};
  let identity=null,lastSeenXp=0;

  function normalizeMeta(m,level=1){
    const out={points:Math.max(0,Number(m?.points)||0),perks:{...(m?.perks||{})},highestLevelCredited:Math.max(1,Number(m?.highestLevelCredited)||1)};
    if(out.highestLevelCredited<level){out.points+=level-out.highestLevelCredited;out.highestLevelCredited=level;}
    return out;
  }
  function freshMeta(level=1){return {points:Math.max(0,level-1),perks:{},highestLevelCredited:Math.max(1,level)}}
  function stateIdentity(s){return [s?.playerName||'',s?.archetype||'',s?.avatar||''].join('|')}
  function absorbState(s){
    if(!s||typeof s!=='object')return s;
    const level=Math.max(1,Number(s.level)||1),xp=Math.max(0,Number(s.xp)||0),id=stateIdentity(s);
    const reset=(identity&&id===identity&&xp<lastSeenXp)||(identity&&id!==identity);
    if(reset){meta=s.managerDevelopment?normalizeMeta(s.managerDevelopment,level):freshMeta(level);}
    else if(s.managerDevelopment){meta=normalizeMeta(s.managerDevelopment,level);}
    else if(!identity){meta=freshMeta(level);}
    else if(level>meta.highestLevelCredited){meta.points+=level-meta.highestLevelCredited;meta.highestLevelCredited=level;}
    identity=id;lastSeenXp=xp;s.managerDevelopment=clone(meta);return s;
  }
  function currentState(){
    try{const s=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');return s&&typeof s==='object'?s:null}catch{return null}
  }
  function persist(){
    const s=currentState();if(s){s.managerDevelopment=clone(meta);nativeSet.call(localStorage,LOCAL_KEY,JSON.stringify(s));}
    refreshUI();applyPerkModifiers();
  }

  // Seed from an existing local career before any new save occurs.
  const initial=currentState();if(initial)absorbState(initial);

  // Preserve Manager Development inside every normal local save without changing game.js.
  Storage.prototype.setItem=function(key,value){
    if(this===localStorage&&key===LOCAL_KEY&&typeof value==='string'){
      try{const s=absorbState(JSON.parse(value));value=JSON.stringify(s);}catch{}
    }
    return nativeSet.call(this,key,value);
  };

  // Preserve Manager Development in cloud create/save payloads as well.
  window.fetch=function(input,init){
    let next=init;
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.includes(SAVE_ENDPOINT_FRAGMENT)&&init&&typeof init.body==='string'){
        const body=JSON.parse(init.body);
        if(body&&body.state){body.state=absorbState(body.state);next={...init,body:JSON.stringify(body)};}
      }
    }catch{}
    return nativeFetch(input,next);
  };

  function owns(id){return !!meta.perks[id]}
  function adjustRel(e,key,positiveBonus=0,negativeRelief=0){
    if(!e.relationships||typeof e.relationships[key]!=='number')return;
    const v=e.relationships[key];
    if(v>0)e.relationships[key]=v+positiveBonus;
    else if(v<0)e.relationships[key]=Math.min(0,v+negativeRelief);
  }
  function bonusSkill(e,skill){if(e.skills&&typeof e.skills[skill]==='number'&&e.skills[skill]>0)e.skills[skill]+=1}

  function applyPerkModifiers(){
    Object.entries(D.quests||{}).forEach(([qid,q])=>{
      (q.decision?.choices||[]).forEach((c,i)=>{c.effects=clone(BASE_EFFECTS[qid]?.[i]||{});});
    });
    Object.values(D.quests||{}).forEach(q=>(q.decision?.choices||[]).forEach(c=>{
      const e=c.effects||{};
      if(owns('community_trust')){adjustRel(e,'Community',2,2);adjustRel(e,'Schools',2,2)}
      if(owns('marketing_pulse')){adjustRel(e,'Creators',2,0);adjustRel(e,'Sponsors',2,0)}
      if(owns('finance_reserve')){adjustRel(e,'Sponsors',0,2);adjustRel(e,'Pro',0,2)}
      if(owns('operations_backup')){adjustRel(e,'EventPartners',1,2);adjustRel(e,'Players',1,2)}
      if(owns('governance_counsel')){adjustRel(e,'Publisher',1,2);adjustRel(e,'Campus',1,2)}
      if(owns('strategy_adapt'))bonusSkill(e,'Strategy');
      if(owns('finance_efficiency'))bonusSkill(e,'Finance');
      if(owns('marketing_activation'))bonusSkill(e,'Marketing');
      if(owns('operations_resilience'))bonusSkill(e,'Operations');
      if(owns('community_network'))bonusSkill(e,'Community');
      if(owns('governance_leverage'))bonusSkill(e,'Governance');
    }));
  }
  applyPerkModifiers();

  function inventory(){return currentState()?.inventory||[]}
  function canBuy(id){
    const p=PERKS[id];if(!p||owns(id)||meta.points<p.cost)return false;
    if(p.requires&&!owns(p.requires))return false;
    if(p.item&&!inventory().includes(p.item))return false;
    return true;
  }
  function requirementText(p){
    const parts=[];
    if(p.requires&&!owns(p.requires))parts.push('Tier I required');
    if(p.item&&!inventory().includes(p.item))parts.push(`Requires ${D.items?.[p.item]?.name||p.item}`);
    return parts.join(' · ');
  }
  function buy(id){
    const p=PERKS[id];if(!canBuy(id))return;
    meta.points-=p.cost;meta.perks[id]=true;persist();
    if(window.RPG_AUDIO?.confirm)window.RPG_AUDIO.confirm();
    openDevelopment();
  }

  function addStyles(){
    if(document.getElementById('managerDevelopmentStyles'))return;
    const st=document.createElement('style');st.id='managerDevelopmentStyles';st.textContent=`
      .dev-hud{display:flex;align-items:center;gap:7px}.dev-token{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:linear-gradient(135deg,#f5d573,#c9922e);color:#101318;font-weight:800;box-shadow:0 0 18px rgba(241,199,92,.18)}
      .dev-summary{margin:0 0 14px;padding:13px 15px;border:1px solid #cad5e2;border-radius:14px;background:linear-gradient(135deg,#fff,#eef4fb);display:flex;justify-content:space-between;align-items:center;gap:15px}.dev-summary strong{font-size:1.45rem}.dev-summary span{color:#647287;font-size:.84rem}
      .dev-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.dev-branch{border:1px solid #ced8e4;border-radius:15px;background:#fff;padding:12px;box-shadow:0 8px 20px rgba(29,50,77,.05)}.dev-branch h4{margin:0 0 8px;color:#172642;letter-spacing:.04em;text-transform:uppercase;font-size:.78rem}.dev-perk{border:1px solid #d7dee8;border-radius:12px;padding:10px;margin-top:8px;background:#f8fafc}.dev-perk.owned{border-color:#8fcbb0;background:#eff9f3}.dev-perk.locked{opacity:.68}.dev-perk strong{display:block;font-size:.92rem;color:#17233c}.dev-perk p{margin:4px 0 8px;font-size:.8rem;line-height:1.35;color:#66748a}.dev-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.72rem;color:#68758a}.dev-cost{font-weight:700;color:#8a651a}.dev-buy{border:1px solid #345b86;border-radius:8px;padding:5px 8px;background:#17365b;color:#fff;cursor:pointer;font-weight:700}.dev-buy:disabled{cursor:not-allowed;opacity:.45}.dev-owned{color:#2d7251;font-weight:700}.manager-lens{margin:12px 0 0;padding:11px 13px;border-left:4px solid #d0a13a;border-radius:8px;background:#fff8e7;color:#493b21;font-size:.86rem;line-height:1.45}.manager-lens strong{display:block;margin-bottom:3px}.dev-close{margin-top:16px}
      @media(max-width:700px){.dev-grid{grid-template-columns:1fr}.dev-summary{align-items:flex-start;flex-direction:column}}
    `;document.head.appendChild(st);
  }

  function perkCard(id){
    const p=PERKS[id],owned=owns(id),req=requirementText(p),buyable=canBuy(id);
    return `<div class="dev-perk ${owned?'owned':(!buyable?'locked':'')}"><strong>${p.name}</strong><p>${p.desc}</p><div class="dev-meta"><span>${req||`Tier ${p.tier}`}</span>${owned?'<span class="dev-owned">UNLOCKED</span>':`<span><span class="dev-cost">${p.cost} MP</span> <button class="dev-buy" data-perk-buy="${id}" ${buyable?'':'disabled'}>Unlock</button></span>`}</div></div>`;
  }
  function openDevelopment(){
    addStyles();const back=document.getElementById('modalBackdrop'),ey=document.getElementById('modalEyebrow'),title=document.getElementById('modalTitle'),body=document.getElementById('modalBody');if(!back||!body)return;
    ey.textContent='CAREER CAPITAL';title.textContent='Manager Development';
    body.innerHTML=`<div class="dev-summary"><div><strong>${meta.points} Management Point${meta.points===1?'':'s'}</strong><br><span>XP remains your permanent experience total. Levels award spendable Management Points.</span></div><span>Build a specialty rather than maxing everything.</span></div><div class="dev-grid">${skillOrder.map(skill=>{const ids=Object.keys(PERKS).filter(id=>PERKS[id].skill===skill).sort((a,b)=>PERKS[a].tier-PERKS[b].tier);return `<section class="dev-branch"><h4>${skill}</h4>${ids.map(perkCard).join('')}</section>`}).join('')}</div><button class="btn btn-primary dev-close" id="closeDevelopment">Back to World</button>`;
    back.classList.remove('hidden');body.querySelectorAll('[data-perk-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.perkBuy));document.getElementById('closeDevelopment').onclick=()=>back.classList.add('hidden');
  }

  function refreshUI(){
    const count=document.getElementById('managementPointCount');if(count)count.textContent=String(meta.points);
    const side=document.getElementById('managerDevelopmentCard');if(side){const owned=Object.keys(meta.perks).filter(owns).length;side.querySelector('.dev-side-copy').textContent=`${owned} perks unlocked · ${meta.points} MP available`;}
  }
  function installUI(){
    addStyles();
    const top=document.querySelector('.world-topbar .top-right');
    if(top&&!document.getElementById('developmentBtn')){const b=document.createElement('button');b.id='developmentBtn';b.className='hud-pill dev-hud';b.innerHTML='Develop <span id="managementPointCount" class="dev-token">'+meta.points+'</span>';b.onclick=openDevelopment;top.prepend(b);}
    const player=document.querySelector('.player-card');
    if(player&&!document.getElementById('managerDevelopmentCard')){const d=document.createElement('div');d.id='managerDevelopmentCard';d.className='section';d.innerHTML='<div class="section-title"><h4>Manager Development</h4><span>CAREER CAPITAL</span></div><button class="btn btn-secondary" id="developmentSideBtn" style="width:100%;text-align:left"><strong>Spend Management Points</strong><br><span class="small dev-side-copy"></span></button>';player.insertAdjacentElement('afterend',d);d.querySelector('#developmentSideBtn').onclick=openDevelopment;}
    refreshUI();
  }

  function creditFromHud(){
    const level=Math.max(1,Number(document.getElementById('levelLabel')?.textContent)||1);
    if(level>meta.highestLevelCredited){const gained=level-meta.highestLevelCredited;meta.points+=gained;meta.highestLevelCredited=level;persist();}
  }

  function injectLens(){
    const body=document.getElementById('modalBody');if(!body||body.querySelector('.manager-lens'))return;
    const choice=body.querySelector('.choice,.mini-card,[data-budget],[data-check]');if(!choice)return;
    const skills=skillOrder.filter(skill=>Object.entries(PERKS).some(([id,p])=>p.skill===skill&&p.tier===1&&owns(id)));
    if(!skills.length)return;
    const active=skills[0];const lens=document.createElement('div');lens.className='manager-lens';lens.innerHTML=`<strong>${active} Lens</strong>${lensCopy[active]}`;body.insertBefore(lens,body.firstChild);
  }

  const initialTimer=setInterval(()=>{if(document.getElementById('gameScreen')){clearInterval(initialTimer);installUI();creditFromHud();const lvl=document.getElementById('levelLabel');if(lvl)new MutationObserver(()=>{creditFromHud();refreshUI()}).observe(lvl,{childList:true,subtree:true,characterData:true});const mb=document.getElementById('modalBody');if(mb)new MutationObserver(()=>setTimeout(injectLens,0)).observe(mb,{childList:true,subtree:true});}},25);

  window.RPG_DEVELOPMENT={open:openDevelopment,getState:()=>clone(meta),apply:applyPerkModifiers};
})();
