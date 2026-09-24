import {replayFrames,leagueSensitivity,replayMoney as money} from './replay-model.js?v=20260924b';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let dispose=()=>{};
export function stopReplay(){dispose();}

// A diagram of the club, with visual states tied to real proposal IDs.
// Seating dots represent the recorded occupied proportion, not individual spectators.
function venue(record){
 const has=id=>record.commitments.some(x=>x.id===id);
 const newIds=new Set(record.realized.map(x=>x.id));
 const cls=id=>`venue-feature ${has(id)?'built':''} ${newIds.has(id)?'new-project':''}`;
 const occupied=Math.round(clamp(record.attendance/record.capacity,0,1)*100);
 const seats=Array.from({length:100},(_,i)=>{const row=Math.floor(i/25),col=i%25;return `<circle cx="${205+col*16}" cy="${224+row*13}" r="3.7" class="seat ${i<occupied?'occupied':''}" style="--seat:${i%12}"/>`;}).join('');
 const players=Array.from({length:6},(_,i)=>`<g class="court-player player-${i}" style="--move:${i};--dx:${i%2?30:-24}px;--dy:${i%3?18:-15}px"><circle cx="${295+(i%3)*95}" cy="${314+Math.floor(i/3)*56}" r="7"/><path d="M${295+(i%3)*95} ${321+Math.floor(i/3)*56}v12"/></g>`).join('');
 return `<svg class="venue-diagram" viewBox="0 0 800 500" role="img" aria-label="Your franchise venue. Occupied seats reflect recorded attendance. Funded projects light up during the replay.">
 <defs><linearGradient id="night" x2="0" y2="1"><stop stop-color="#142b46"/><stop offset="1" stop-color="#254660"/></linearGradient><linearGradient id="court" x2="0" y2="1"><stop stop-color="#477962"/><stop offset="1" stop-color="#325c51"/></linearGradient></defs>
 <rect width="800" height="500" fill="url(#night)" rx="16"/>
 <g fill="#223e55">${Array.from({length:12},(_,i)=>`<rect x="${i*73-15}" y="${70+(i%3)*20}" width="52" height="190"/>`).join('')}</g>
 <path d="M50 447H755" stroke="#537087" stroke-width="2"/>
 <g class="league-pool"><rect x="315" y="25" width="170" height="49" rx="8"/><text x="400" y="46" text-anchor="middle">LEAGUE MEDIA POOL</text><text x="400" y="64" text-anchor="middle" class="pool-amount">${money(record.revenue.shared)} per club</text></g>
 <g class="league-routes" fill="none" stroke="#6ed1cf" stroke-width="3"><path d="M400 74v38H103v28"/><path d="M400 74v77"/><path d="M400 74v38h298v28"/></g>
 <g class="rival-clubs"><rect x="45" y="140" width="115" height="49" rx="6"/><text x="102" y="160" text-anchor="middle">SMALL MARKET</text><text x="102" y="179" text-anchor="middle">${money(record.revenue.shared)}</text><rect x="640" y="140" width="115" height="49" rx="6"/><text x="697" y="160" text-anchor="middle">LARGE MARKET</text><text x="697" y="179" text-anchor="middle">${money(record.revenue.shared)}</text></g>
 <path d="M178 232Q178 169 400 156Q622 169 622 232V395Q622 435 400 448Q178 435 178 395Z" fill="#587181" stroke="#a8bbc4" stroke-width="3"/>
 <path d="M194 241Q194 195 400 189Q606 195 606 241V390Q606 418 400 426Q194 418 194 390Z" fill="#253d50"/>
 <text x="400" y="181" text-anchor="middle" class="arena-label">YOUR FRANCHISE</text>
 <g class="crowd">${seats}</g>
 <rect x="249" y="285" width="302" height="114" rx="5" fill="url(#court)"/>
 <g fill="none" stroke="#b4d2bf" stroke-width="2"><path d="M274 285v114m25-114v114m25-114v114m25-114v114m25-114v114m26-114v114m26-114v114m25-114v114m25-114v114m25-114v114m25-114v114" opacity=".5"/><path d="M249 298h302v88H249Z"/></g>
 <g class="team-on-court">${players}<circle class="ball" cx="381" cy="339" r="5" fill="#f5e1a9"/></g>
 <g class="${cls('c_premium')}" data-feature="c_premium"><rect x="193" y="196" width="414" height="22" rx="4"/><path d="M255 196v22m80-22v22m130-22v22m80-22v22" stroke="#102e46"/><text x="400" y="212" text-anchor="middle">PREMIUM CLUB</text></g>
 <g class="${cls('c_training')}" data-feature="c_training"><rect x="30" y="287" width="118" height="88" rx="6"/><path d="M45 317h85M60 308v20m55-20v20" stroke="#83ccce" stroke-width="4"/><text x="89" y="348" text-anchor="middle">PERFORMANCE</text><text x="89" y="363" text-anchor="middle">CENTER</text></g>
 <g class="${cls('c_district')}" data-feature="c_district"><rect x="643" y="304" width="123" height="111" rx="6"/><path d="M654 335h100m-100 28h100m-100 28h100M677 316v88m42-88v88" stroke="#8ca7ae"/><text x="704" y="296" text-anchor="middle">EVENT DISTRICT</text></g>
 <g class="${cls('c_video')}" data-feature="c_video"><rect x="329" y="240" width="142" height="33" rx="3"/><text x="400" y="262" text-anchor="middle">${(record.wins*100).toFixed(1)}% WIN RATE</text></g>
 <g class="${cls('c_fantech')}" data-feature="c_fantech"><rect x="643" y="213" width="48" height="70" rx="7"/><path d="M652 227h30m-30 12h23m-23 12h30" stroke="#bceae6" stroke-width="3"/><text x="716" y="238" text-anchor="middle">FAN</text><text x="716" y="254" text-anchor="middle">TECH</text></g>
 <g class="${cls('r_digital')}" data-feature="r_digital"><path d="M702 272q23-38 48 0m-40-5q16-25 32 0" fill="none" stroke-width="3"/><text x="728" y="287" text-anchor="middle">DIGITAL</text></g>
 <g class="${cls('r_events')}" data-feature="r_events"><rect x="311" y="397" width="178" height="22"/><text x="400" y="412" text-anchor="middle">NON-GAME EVENTS</text></g>
 <g class="${cls('r_sponsor')}" data-feature="r_sponsor"><rect x="588" y="279" width="20" height="106"/><text transform="translate(602 332) rotate(-90)" text-anchor="middle">PARTNERSHIPS</text></g>
 <g class="${cls('r_ticket')}" data-feature="r_ticket"><rect x="199" y="398" width="81" height="28" rx="3"/><text x="239" y="416" text-anchor="middle">TICKETS</text></g>
 <g class="${cls('r_retention')}" data-feature="r_retention"><rect x="522" y="398" width="78" height="28" rx="3"/><text x="561" y="416" text-anchor="middle">FAN CARE</text></g>
 <g class="roster-banner ${record.commitments.some(x=>x.type==='player')?'built':''}" data-feature="roster"><rect x="30" y="209" width="120" height="53" rx="6"/><text x="90" y="231" text-anchor="middle">ROSTER +</text><text x="90" y="248" text-anchor="middle">DEVELOPMENT</text></g>
 <g class="funding-flow ${record.realized.length?'':'no-new-funding'}"><rect x="27" y="20" width="746" height="125" rx="10" fill="#102c44"/>
 <text x="165" y="52" text-anchor="middle">CLUB CASH INVESTED</text><text x="165" y="79" text-anchor="middle" class="funding-number">${money(record.upfrontCash)}</text>
 <text x="636" y="52" text-anchor="middle">NEW BORROWING</text><text x="636" y="79" text-anchor="middle" class="funding-number">${money(record.newDebt)}</text>
 <path d="M225 80h99l55 53m196-53h-99l-55 53" fill="none" stroke="#e6bc70" stroke-width="3" stroke-dasharray="8 8"/>
 <text x="400" y="113" text-anchor="middle">${record.realized.length?'YOUR PORTFOLIO':'CASH HELD'}</text></g>
 <g class="cash-ledger"><rect x="198" y="458" width="404" height="28" rx="5"/><text x="400" y="477" text-anchor="middle">ENDING CASH ${money(record.cash)}   /   DEBT ${money(record.debt)}</text></g>
 </svg>`;
}
export function mountReplay(host,record){
 stopReplay();
 const frames=replayFrames(record);
 let at=0,timer=null,playing=false;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 host.innerHTML=`<section class="season-replay" aria-label="Your decisions in action"><div class="replay-heading"><div><span class="panel-kicker">YOUR DECISIONS IN ACTION</span><h2>Cycle ${record.cycle}, on the ground</h2></div><button class="ghost dark" data-replay="play">Play recap</button></div><p class="replay-intro">A short replay of this recorded result. Dim features are inactive this cycle. Highlighted features show your investments.</p><div class="replay-layout"><div class="venue-wrap">${venue(record)}<p class="venue-caption">Schematic view · features and attendance reflect this cycle · no additional simulation</p></div><div class="replay-story"><p class="replay-position"></p><h3 class="replay-title" tabindex="-1"></h3><p class="replay-text"></p><dl class="replay-figures"></dl><p class="replay-status" role="status" aria-live="polite"></p></div></div><div class="replay-controls"><button class="ghost dark" data-replay="previous">Previous</button><button class="ghost dark" data-replay="next">Next moment</button><button class="ghost dark" data-replay="skip">Skip to cash result</button><span>About ${frames.length*3} seconds · pause or step through at any time</span></div><details class="replay-transcript"><summary>Read the complete recap</summary>${frames.map(f=>`<p><b>${esc(f.title)}.</b> ${esc(f.text)}</p>`).join('')}</details></section>`;
 const $=s=>host.querySelector(s);
 const cancel=()=>{clearTimeout(timer);timer=null;};
 function show(index,announce=false){
   at=clamp(index,0,frames.length-1);const f=frames[at];
   $('.replay-position').textContent=`MOMENT ${at+1} OF ${frames.length}`;
   $('.replay-title').textContent=f.title;$('.replay-text').textContent=f.text;
   $('.replay-figures').innerHTML=f.figures.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
   $('.season-replay').dataset.moment=f.kind;
   host.querySelectorAll('[data-feature]').forEach(n=>n.classList.toggle('highlight',n.dataset.feature===f.focus||(f.proposal?.type==='player'&&n.dataset.feature==='roster')));
   $('[data-replay="previous"]').disabled=at===0;
   $('[data-replay="next"]').disabled=at===frames.length-1;
   if(announce)$('.replay-status').textContent=`${at+1} of ${frames.length}: ${f.title}`;
 }
 function controls(){
   $('[data-replay="play"]').textContent=playing?'Pause recap':at===frames.length-1?'Replay recap':'Play recap';
   $('.season-replay').classList.toggle('is-playing',playing&&!motion.matches);
 }
 function advance(){cancel();if(!playing)return;if(at===frames.length-1){playing=false;controls();return;}timer=setTimeout(()=>{show(at+1);advance();},3000);}
 function pause(){playing=false;cancel();controls();}
 $('[data-replay="play"]').onclick=()=>{if(playing){pause();return;}if(at===frames.length-1)show(0);playing=true;controls();advance();};
 $('[data-replay="previous"]').onclick=()=>{pause();show(at-1,true);controls();};
 $('[data-replay="next"]').onclick=()=>{pause();show(at+1,true);controls();};
 $('[data-replay="skip"]').onclick=()=>{pause();show(frames.length-1,true);controls();};
 const visibility=()=>{if(document.hidden)pause();};
 const motionChanged=()=>{if(motion.matches)pause();};
 document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',motionChanged);
 dispose=()=>{cancel();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',motionChanged);};
 show(0); // Results never force students to wait for an animation.
 return {play(){if(!motion.matches){playing=true;controls();advance();}},pause};
}
export function mountLeagueLens(host,record){
 host.innerHTML=`<details class="league-lens"><summary>Day 2 lens: how much does your club rely on the league?</summary><p>Teams jointly supply the competition sold to media partners. This fictional model gives every market the same league distribution. Local revenue and costs still differ.</p><label class="league-switch"><input type="checkbox" data-league-cut> Explore a 20% cut in this cycle’s shared distribution</label><div class="league-comparison" aria-live="polite"></div><p class="lens-boundary">One-cycle sensitivity only: all other revenue, costs, wins and decisions stay fixed. This comparison changes neither your saved result nor your board score. It does not model how owners or players would respond.</p><p><b>Discuss:</b> Would sharing alone make clubs equally competitive? What would a salary floor change? A cap constrains spending; a payroll tax raises its marginal cost. Those rules are discussed in class and are not simulated here.</p></details>`;
 const output=host.querySelector('.league-comparison');
 function render(cut){const x=leagueSensitivity(record,cut);output.innerHTML=`<table><caption>${cut?'With 20% less shared revenue':'Recorded cycle'} · ${Math.round(x.share*100)}% of recorded revenue came from the league</caption><thead><tr><th>Measure</th><th>Recorded</th><th>${cut?'What if?':'Comparison'}</th></tr></thead><tbody>${[['League distribution',record.revenue.shared,x.shared],['Operating profit',record.profit,x.profit],['Ending cash',record.cash,x.cash]].map(([label,a,b])=>`<tr><th>${label}</th><td>${money(a)}</td><td>${money(b)}</td></tr>`).join('')}</tbody></table>${cut?`<p>The ${money(x.lost)} loss lowers operating profit and ending cash by the same amount under these fixed assumptions.</p>`:''}`;}
 host.querySelector('[data-league-cut]').onchange=e=>render(e.target.checked?.2:0);render(0);
}
