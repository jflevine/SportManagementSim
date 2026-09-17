const ROLES={
 publisher:{name:'パブリッシャー',sig:'P',tag:'IP所有者 / エコシステム設計者',desc:'ゲームを所有・管理し、デジタル商品、メディア、イベント、パートナーシップから収益化できます。ただし、プレイヤーの注目と市場需要には依存します。',bias:{digital:1.18,media:1.05,sponsor:1.0,merch:.9,events:.9,prize:.55,creator:.82}},
 team:{name:'プロチーム',sig:'T',tag:'高い固定費 / 複数の収益源',desc:'スポンサー、パブリッシャー連動収益、コンテンツ、商品販売、イベント、競技成績を組み合わせます。持続可能性には、繰り返し得られる運営収益が必要です。',bias:{digital:1.04,media:.85,sponsor:1.08,merch:1.0,events:.82,prize:.65,creator:1.06}},
 organizer:{name:'大会運営者',sig:'O',tag:'ゲームを所有せず価値を生む',desc:'スポンサー、メディア、チケット、運営実績によってイベント価値を作りますが、パブリッシャーの許可と観客需要に構造的に依存します。',bias:{digital:.55,media:1.08,sponsor:1.1,merch:.72,events:1.12,prize:.35,creator:.78}},
 creator:{name:'選手 / クリエイター',sig:'C',tag:'観客主導 / 個人ブランド中心',desc:'プラットフォーム、スポンサー、クリエイター収益、商品、出演、賞金を通じて注目を収益化します。個人ブランドとアクセスへの依存が大きいモデルです。',bias:{digital:.45,media:1.08,sponsor:1.05,merch:.95,events:.7,prize:.78,creator:1.2}}
};

const STREAMS=[
 {id:'sponsor',name:'スポンサー収益',sub:'Sponsorships / ブランド契約・カテゴリー権',color:'#f1b93a',base:.72},
 {id:'media',name:'メディア & 配信',sub:'Media & Streaming / 配信・広告分配・放映権',color:'#4ee7ff',base:.62},
 {id:'digital',name:'デジタル / パブリッシャー連動',sub:'Digital / Publisher-Linked / デジタル商品・レベニューシェア・支援金',color:'#9c84ff',base:.76},
 {id:'merch',name:'商品販売',sub:'Merchandise / グッズ・直接販売',color:'#ff8b68',base:.68},
 {id:'events',name:'ライブイベント & チケット',sub:'Live Events & Ticketing / 入場料・会場収益',color:'#65d6a0',base:.6},
 {id:'prize',name:'賞金',sub:'Prize Money / 目立つが競技成績に依存',color:'#ff6576',base:.38},
 {id:'creator',name:'クリエイター / コンテンツ収益',sub:'Creator / Content Revenue / プラットフォーム収益・ファンへの到達',color:'#61a9ff',base:.58}
];

const SHOCKS=[
 {id:1,title:'スポンサー撤退',desc:'最大スポンサーが契約を更新しません。主要な商業収益が直ちに失われます。',mult:{sponsor:.3},fixed:0,fitDeps:['スポンサー集中','消費者需要'],fitContracts:['スポンサー契約 / カテゴリー権']},
 {id:2,title:'レベニューシェア削減',desc:'パブリッシャー連動のエコシステム収益が40%悪化します。デジタル収益や共有収益を支えていた関係の価値が低下します。',mult:{digital:.6},fixed:0,fitDeps:['パブリッシャー戦略'],fitContracts:['参加契約 / レベニューシェア契約','パブリッシャーの大会ライセンス / ポリシー']},
 {id:3,title:'視聴者減少',desc:'視聴者数が30%減少します。メディア価値が下がり、スポンサーも到達価値を低く評価します。',mult:{media:.55,sponsor:.8,events:.85,creator:.85},fixed:0,fitDeps:['観客需要','消費者需要'],fitContracts:['メディア権契約','スポンサー契約 / カテゴリー権']},
 {id:4,title:'大会出場失敗',desc:'主要大会への出場機会を失います。賞金はゼロになり、露出に連動する収益も弱まります。',mult:{prize:0,media:.82,sponsor:.86,events:.9},fixed:0,fitDeps:['競技資格 / 大会出場'],fitContracts:['参加契約 / レベニューシェア契約','選手 / タレント契約','スポンサー契約 / カテゴリー権']},
 {id:5,title:'プラットフォーム変更',desc:'主要プラットフォームが収益化・配信条件を変更します。コンテンツの経済性が一夜で変わります。',mult:{media:.64,creator:.62,sponsor:.9},fixed:0,fitDeps:['プラットフォームへのアクセス'],fitContracts:['プラットフォーム / コンテンツライセンス条件','メディア権契約']},
 {id:6,title:'新しいコンプライアンス費用',desc:'新しい規則により、予想外の12ポイント分の運営負担が発生します。収益そのものは残りますが、利益余地が減ります。',mult:{events:.9},fixed:12,fitDeps:['規制 / ガバナンス遵守','会場 / イベント運営'],fitContracts:['保険 / コンプライアンス負担条項','会場 / イベント契約','パブリッシャーの大会ライセンス / ポリシー']}
];

const dependencies=['スポンサー集中','パブリッシャー戦略','プラットフォームへのアクセス','観客需要','競技資格 / 大会出場','タレント / クリエイター確保','会場 / イベント運営','消費者需要','規制 / ガバナンス遵守'];
const contracts=['スポンサー契約 / カテゴリー権','参加契約 / レベニューシェア契約','プラットフォーム / コンテンツライセンス条件','メディア権契約','選手 / タレント契約','会場 / イベント契約','パブリッシャーの大会ライセンス / ポリシー','保険 / コンプライアンス負担条項'];

let state={screen:'intro',role:null,alloc:Object.fromEntries(STREAMS.map(s=>[s.id,0])),shock:null,pivot:Object.fromEntries(STREAMS.map(s=>[s.id,0]))};

function q(id){return document.getElementById(id)}
function show(id,phase){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));q(id).classList.add('active');state.screen=id;document.querySelectorAll('.phase-dot').forEach((d,i)=>d.classList.toggle('on',i<=phase));window.scrollTo({top:0,behavior:'smooth'})}

function renderRoles(){
 q('roleGrid').innerHTML=Object.entries(ROLES).map(([id,r])=>`<button class="role ${state.role===id?'active':''}" data-role="${id}"><div class="sig">${r.sig}</div><h3>${r.name}</h3><p>${r.desc}</p><div class="tag">${r.tag}</div></button>`).join('');
 document.querySelectorAll('.role').forEach(b=>b.onclick=()=>selectRole(b.dataset.role))
}
function selectRole(id){state.role=id;renderRoles();q('roleStatus').textContent=`選択中：${ROLES[id].name}`;q('lockRole').disabled=false}
function totalAlloc(){return Object.values(state.alloc).reduce((a,b)=>a+b,0)}
function concentration(alloc=state.alloc){const vals=Object.values(alloc);return Math.max(...vals)}
function diversityScore(alloc=state.alloc){const active=Object.values(alloc).filter(v=>v>=8).length;return Math.min(100,active*14 + (100-concentration(alloc))*.45)}

function renderStreams(){
 q('streamList').innerHTML=STREAMS.map(s=>`<div class="stream"><div class="stream-name"><b style="color:${s.color}">${s.name}</b><small>${s.sub}</small></div><input class="slider" type="range" min="0" max="60" step="5" value="${state.alloc[s.id]}" data-stream="${s.id}" aria-label="${s.name}"><div class="val"><output id="out-${s.id}">${state.alloc[s.id]}</output><span>pt</span></div></div>`).join('');
 document.querySelectorAll('.slider').forEach(x=>x.oninput=()=>{state.alloc[x.dataset.stream]=+x.value;q('out-'+x.dataset.stream).value=x.value;updateBuild()});
 updateBuild()
}

function updateBuild(){
 const t=totalAlloc();
 q('total').textContent=`${t} / 100`;
 q('total').className='total '+(t===100?'ok':'bad');
 q('remainingHint').textContent=t<=100?`残り${100-t}ポイント。収益の集中は効率を高めますが、ショックへの弱さも高めます。`:`予算を${t-100}ポイント超えています。確定する前に減らしてください。`;
 q('lockBuild').disabled=t!==100;
 renderTower();
 const top=STREAMS.slice().sort((a,b)=>state.alloc[b.id]-state.alloc[a.id])[0];
 q('topExposure').textContent=top&&state.alloc[top.id]?`${state.alloc[top.id]}%`:'—';
 const ds=Math.round(diversityScore());
 q('diversity').textContent=ds>=75?'高い':ds>=50?'中程度':'低い';
 q('depCount').textContent=Object.values(state.alloc).filter(v=>v>=10).length;
 q('forecast').textContent=ds>=75?'比較的強い':ds>=50?'混合型':'集中型'
}

function renderTower(damaged=false){
 let entries=STREAMS.filter(s=>state.alloc[s.id]>0).slice().sort((a,b)=>state.alloc[a.id]-state.alloc[b.id]);
 q('tower').innerHTML=entries.map(s=>`<div class="block ${damaged&&shockAffects(s.id)?'hit':''}" style="color:${s.color};height:${Math.max(40,34+state.alloc[s.id]*.65)}px"><b>${s.name}</b><span>${state.alloc[s.id]}</span></div>`).join('')||'<div style="color:#6f838f;padding:30px;text-align:center">収益を配分するとタワーが作られます。</div>'
}

function renderDeck(){
 q('shockDeck').innerHTML=SHOCKS.map(s=>`<button class="crate" data-shock="${s.id}"><span>${String(s.id).padStart(2,'0')}</span><small>封印ケース</small></button>`).join('');
 document.querySelectorAll('.crate').forEach(b=>b.onclick=()=>revealShock(+b.dataset.shock))
}
function shockAffects(id){return state.shock && (state.shock.mult[id]!==undefined && state.shock.mult[id]<1)}
function postShockAlloc(){let out={};STREAMS.forEach(s=>out[s.id]=state.alloc[s.id]*(state.shock.mult[s.id]??1));return out}
function revealShock(id){state.shock=SHOCKS.find(s=>s.id===id);state.pivot=Object.fromEntries(STREAMS.map(s=>[s.id,0]));renderShock();show('rebuild',3);setTimeout(()=>renderDamagedMini(),160)}

function renderShock(){
 let s=state.shock, impacts=[];
 let post=postShockAlloc();
 let postTotal=Math.max(0,Object.values(post).reduce((a,b)=>a+b,0)-s.fixed);
 let lost=Math.round(100-postTotal);
 STREAMS.forEach(st=>{let m=s.mult[st.id];if(m!==undefined&&m<1) impacts.push(`<div class="impact-row"><span>${st.name}</span><strong>-${Math.round((1-m)*100)}%</strong></div>`)});
 if(s.fixed) impacts.push(`<div class="impact-row"><span>予想外の運営負担</span><strong>-${s.fixed} pt</strong></div>`);
 q('shockCard').innerHTML=`<div class="num">SHOCK ${String(s.id).padStart(2,'0')} // ${ROLES[state.role].name}</div><h3>${s.title}</h3><p style="color:#c4d1d7;line-height:1.5">${s.desc}</p><div style="margin:18px 0;padding:10px 12px;border:1px solid rgba(255,101,95,.35);background:rgba(255,101,95,.06)"><b style="color:var(--red)">直ちに失った価値：${lost}ポイント</b><br><small style="color:#9eb0ba">元の100ポイントは、再構築前の時点で実質${Math.round(postTotal)}ポイントになりました。</small></div><div class="impact">${impacts.join('')}</div>`;
 q('moveList').innerHTML=STREAMS.map(st=>`<div class="move-row"><span><b style="color:${st.color}">${st.name}</b> <small style="color:#708591">（ショック後 ${Math.round(post[st.id])}）</small></span><div class="move-controls"><button data-id="${st.id}" data-dir="-">−</button><output id="pivot-${st.id}">0</output><button data-id="${st.id}" data-dir="+">+</button></div></div>`).join('');
 document.querySelectorAll('.move-controls button').forEach(b=>b.onclick=()=>pivot(b.dataset.id,b.dataset.dir));
 q('dependency').innerHTML='<option value="">選んでください...</option>'+dependencies.map(x=>`<option>${x}</option>`).join('');
 q('contract').innerHTML='<option value="">選んでください...</option>'+contracts.map(x=>`<option>${x}</option>`).join('');
 q('pivotUsed').textContent='0 / 20';
 q('resolve').disabled=true;
 q('dependency').onchange=checkResolve;
 q('contract').onchange=checkResolve
}

function renderDamagedMini(){/* ショックの影響はショックパネル内で表示 */}
function pivot(id,dir){
 let used=Object.values(state.pivot).reduce((a,b)=>a+b,0);
 if(dir==='+'&&used<20)state.pivot[id]+=5;
 if(dir==='-'&&state.pivot[id]>0)state.pivot[id]-=5;
 STREAMS.forEach(s=>q('pivot-'+s.id).value=state.pivot[s.id]);
 used=Object.values(state.pivot).reduce((a,b)=>a+b,0);
 q('pivotUsed').textContent=`${used} / 20`
}
function checkResolve(){q('resolve').disabled=!(q('dependency').value&&q('contract').value)}

function calcResult(){
 let post=postShockAlloc();
 let remaining=Object.values(post).reduce((a,b)=>a+b,0)-state.shock.fixed;
 remaining=Math.max(0,remaining);
 let pivot=Object.values(state.pivot).reduce((a,b)=>a+b,0);
 let final={};
 STREAMS.forEach(s=>final[s.id]=(post[s.id]||0)+(state.pivot[s.id]||0));
 let role=ROLES[state.role];
 let quality=0,total=0;
 STREAMS.forEach(s=>{let v=final[s.id],w=s.base*(role.bias[s.id]||1);quality+=v*w;total+=v});
 quality=total?quality/total:0;
 let conc=concentration(final);
 let div=diversityScore(final);
 let pivotVar=Object.values(state.pivot).filter(v=>v>0).length;
 let depFit=state.shock.fitDeps.includes(q('dependency').value);
 let contractFit=state.shock.fitContracts.includes(q('contract').value);
 let pivotQuality=Math.min(100,(pivot?42:18)+pivotVar*9+(depFit?18:8)+(contractFit?18:8));
 let score=Math.round(Math.max(0,Math.min(100,remaining*.48 + quality*30 + div*.16 + pivotQuality*.12 - Math.max(0,conc-45)*.28)));
 return {score,remaining:Math.round(remaining),conc:Math.round(conc),pivotQuality:Math.round(pivotQuality),final}
}

function renderResult(){
 let r=calcResult(),s=state.shock;
 q('score').textContent=r.score;
 let verdict,cls,copy;
 if(r.score>=76){verdict='生存 — 選択肢が残っている';cls='good';copy='ショックを受けても、単一の代替収益源に危険なほど依存せずに済みました。組織にはまだ戦略的な選択肢があります。'}
 else if(r.score>=56){verdict='生存 — ただし脆弱';cls='mid';copy='12か月は生き残れますが、再構築によって重要な依存関係が生まれました。次のショックが来ると問題が表面化する可能性があります。'}
 else{verdict='危機的 — モデルに大きな負荷';cls='bad';copy='ショックによって収益構造の弱点が明確になりました。問題は単なる収益減少ではなく、集中と代替手段の少なさです。'}
 q('verdict').textContent=verdict;
 q('verdict').className='verdict '+cls;
 q('resultTitle').textContent=`${ROLES[state.role].name} // ${s.title}`;
 q('resultCopy').textContent=copy;
 q('mRemain').textContent=r.remaining+' pt';
 q('mConc').textContent=r.conc+'%';
 q('mPivot').textContent=r.pivotQuality+' / 100';
 let dep=q('dependency').value||'未解決の依存関係';
 let ct=q('contract').value||'未特定の法的手段';
 let depFit=state.shock.fitDeps.includes(dep),contractFit=state.shock.fitContracts.includes(ct);
 let fitNote=(depFit&&contractFit)?'あなたの分析は、このショックの中心的な依存関係と法的構造によく対応しています。':'別の考え方も可能ですが、なぜその選択が今回のショックへの対応になるのか説明できるようにしてください。';
 q('lesson').innerHTML=`<b>デブリーフ：</b> あなたの再構築は現在、<strong>${dep}</strong> に依存しています。より注意すべき法的・契約上の仕組みは <strong>${ct}</strong> です。${fitNote} 収益分散とは「依存しないこと」ではなく、<em>どの依存関係なら管理できるか</em>を選ぶことです。`;
 state.lastResult=r;
 show('result',4)
}

function fullReset(){
 state={screen:'intro',role:null,alloc:Object.fromEntries(STREAMS.map(s=>[s.id,0])),shock:null,pivot:Object.fromEntries(STREAMS.map(s=>[s.id,0]))};
 renderRoles();
 q('roleStatus').textContent='役割はまだ選ばれていません。';
 q('lockRole').disabled=true;
 q('teacherSheet').classList.remove('open');
 show('intro',0)
}

q('begin').onclick=()=>show('roles',0);
q('randomRole').onclick=()=>selectRole(Object.keys(ROLES)[Math.floor(Math.random()*4)]);
q('lockRole').onclick=()=>{
 q('roleChip').textContent=ROLES[state.role].name;
 q('buildPrompt').textContent=`${ROLES[state.role].desc} 100ポイントをちょうど配分してください。このフェーズを確定すると元の配分は変更できません。`;
 renderStreams();
 show('build',1)
};
q('lockBuild').onclick=()=>{renderDeck();show('draw',2)};
q('resolve').onclick=renderResult;
q('newShock').onclick=()=>{renderDeck();show('draw',2)};
q('copyReport').onclick=async()=>{
 let r=state.lastResult||calcResult();
 let top=STREAMS.slice().sort((a,b)=>state.alloc[b.id]-state.alloc[a.id])[0];
 let text=`Revenue Jenga グループ報告\n役割: ${ROLES[state.role].name}\n最大の元収益依存: ${top.name} (${state.alloc[top.id]} pt)\nショック: ${state.shock.title}\nショック後の収益: ${r.remaining} pt\nレジリエンス・スコア: ${r.score}/100\n新しい依存関係: ${q('dependency').value}\n重要になった契約・法的手段: ${q('contract').value}`;
 try{await navigator.clipboard.writeText(text);q('copyReport').textContent='コピーしました';setTimeout(()=>q('copyReport').textContent='グループ報告をコピー',1400)}catch(e){alert(text)}
};
q('startOver').onclick=fullReset;
q('resetTop').onclick=fullReset;
q('teacherBtn').onclick=()=>q('teacherSheet').classList.toggle('open');
renderRoles();
