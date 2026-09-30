/* Esports Industry Tycoon: Break-Even Arena — v1.0.0
   Local-first classroom activity. No accounts, requests, analytics, or backend.
   Standard costs: Gil Fried, Esports Finance and Economics, Tables 11.2–11.3.
   All demand forecasts, alternative packages, and turnout conditions are invented teaching assumptions. */
'use strict';
(() => {
  const VERSION = '1.0.0';
  const FEES = [30, 40, 50];
  const PACKAGES = {
    lean: { name: 'Community Cup', short: 'COMMUNITY CUP', tag: 'Lower commitment', fixed: 2800,
      description: 'A modest prize, a simpler room, and a community-first feel.',
      items: [500, 800, 300, 600, 600], forecast: {30:180, 40:150, 50:105}, accent: '#dafa68', stations: 6 },
    standard: { name: 'Campus Classic', short: 'CAMPUS CLASSIC', tag: 'Chapter baseline', fixed: 4000,
      description: 'The reading’s event: staffed competition, a rented venue, and a $1,000 prize.',
      items: [500, 1000, 500, 1000, 1000], forecast: {30:240, 40:210, 50:120}, accent: '#81dfe2', stations: 9 },
    showcase: { name: 'Spotlight Showcase', short: 'SPOTLIGHT SHOWCASE', tag: 'Bigger production', fixed: 5600,
      description: 'More production, a larger prize, and stronger modeled demand at premium prices.',
      items: [500, 1200, 900, 1400, 1600], forecast: {30:240, 40:240, 50:225}, accent: '#ffc781', stations: 12 }
  };
  const COST_NAMES = ['Insurance', 'Administrator / event staff', 'Supplies and equipment', 'Facility rental', 'Prize money'];
  const VARIABLE = 10;
  const STAGES = ['welcome','plan','running1','results','revise','running2','reflect','complete'];
  const params = new URLSearchParams(location.search);
  const GUIDE = params.get('guide') === '1';
  const DEMO = params.get('demo') === '1';
  const KEY = 'spm343.breakEvenArena.v1.' + (DEMO ? 'demo' : 'student');
  const app = document.getElementById('app');
  let storageOK = true, restored = false, restoreWarning = '', animationToken = 0, finishEvent = null, toastTimer;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const dollars = n => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US');
  const signedDollars = n => n > 0 ? '+' + dollars(n) : dollars(n);
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toLocaleString('en-US');
  const tone = n => n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral';
  const resultLabel = n => n > 0 ? 'profit' : n < 0 ? 'loss' : 'break-even';
  const text = (value, max = 700) => typeof value === 'string' ? value.slice(0,max) : '';
  const validPlan = p => p && Object.hasOwn(PACKAGES,p.packageId) && FEES.includes(p.fee);
  const changes = (a,b) => Number(a.packageId !== b.packageId) + Number(a.fee !== b.fee);
  function calc(packageId, fee) {
    if (!Object.hasOwn(PACKAGES,packageId) || !FEES.includes(fee)) throw new Error('Choose a valid package and entry fee.');
    const pkg = PACKAGES[packageId], cm = fee - VARIABLE, forecast = pkg.forecast[fee];
    // All nine forecasts are divisible by three. No randomized or player-specific shocks.
    const actual = forecast * 2 / 3;
    const book = n => ({ players:n, revenue:n*fee, variable:n*VARIABLE, fixed:pkg.fixed,
      expenses:pkg.fixed+n*VARIABLE, contribution:n*cm, profit:n*cm-pkg.fixed });
    return { packageId, fee, pkg, cm, fixed:pkg.fixed, forecast, actual,
      rawBE:pkg.fixed/cm, be:Math.ceil(pkg.fixed/cm), budget:book(forecast), actuals:book(actual) };
  }
  // Pure model exposed for transparent inspection and automated QA; this is not a secure graded test.
  window.BreakEvenArena = Object.freeze({ version:VERSION, packages:PACKAGES, fees:FEES, calc, changes });
  function newState() {
    const id = globalThis.crypto?.randomUUID?.() || 'local-' + Date.now().toString(36);
    return { version:VERSION, id, stage:DEMO?'plan':'welcome', names:DEMO?['Instructor preview','']:['',''],
      packageId:'standard', fee:50, guess:'', rationale:'', original:null, revised:null,
      revisionType:'fee', altPackage:'', altFee:0, reflections:['',''], completedAt:'' };
  }
  function load() {
    const fresh = newState();
    if (GUIDE) return fresh;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh;
      const p = JSON.parse(raw);
      if (p.version !== VERSION || !STAGES.includes(p.stage) || !validPlan(p)) throw new Error('Incompatible save');
      const s = { ...fresh, id:text(p.id,80) || fresh.id, stage:p.stage, names:[text(p.names?.[0],80),text(p.names?.[1],80)],
        packageId:p.packageId, fee:p.fee, guess:text(p.guess,10), rationale:text(p.rationale),
        revisionType:p.revisionType==='package'?'package':'fee',
        altPackage:Object.hasOwn(PACKAGES,p.altPackage)?p.altPackage:'', altFee:FEES.includes(p.altFee)?p.altFee:0,
        reflections:[text(p.reflections?.[0],1000),text(p.reflections?.[1],1000)], completedAt:text(p.completedAt,60) };
      if (validPlan(p.original)) s.original = { packageId:p.original.packageId, fee:p.original.fee,
        guess:text(p.original.guess,10), rationale:text(p.original.rationale) };
      if (validPlan(p.revised) && s.original && changes(s.original,p.revised)===1)
        s.revised = {packageId:p.revised.packageId,fee:p.revised.fee};
      if (s.stage!=='welcome' && !s.names[0].trim()) s.stage='welcome';
      if (['running1','results','revise','running2','reflect','complete'].includes(s.stage) && !s.original) s.stage='plan';
      if (['running2','reflect','complete'].includes(s.stage) && !s.revised) s.stage='revise';
      if (s.stage==='complete' && (!s.reflections[0].trim() || !s.reflections[1].trim())) s.stage='reflect';
      restored = s.stage !== 'welcome';
      return s;
    } catch(err) {
      restoreWarning = err.name === 'SecurityError' ? 'Browser storage is unavailable. Keep this tab open and export your final summary.' : 'Previous work could not be restored. You can start a new tournament.';
      if (err.name === 'SecurityError') storageOK = false;
      return fresh;
    }
  }
  let state = load();
  let reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  try { if (localStorage.getItem('spm343.breakEvenArena.motion') === 'reduced') reduced = true; } catch { storageOK=false; }
  function save() {
    if (GUIDE) return;
    try { localStorage.setItem(KEY,JSON.stringify(state)); storageOK=true; }
    catch { storageOK=false; }
    const el = document.getElementById('save-status');
    if (el) el.textContent = storageOK ? 'Saved on this browser only' : 'Storage unavailable: keep this tab open and export your summary';
  }
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent=message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('visible'),5000);
  }
  function go(stage) { state.stage=stage; save(); render(true); }
  function planData(p) { return calc(p.packageId,p.fee); }
  function revisionPlan() {
    if (!state.original) return null;
    const p = state.revisionType==='fee'
      ? {packageId:state.original.packageId,fee:state.altFee}
      : {packageId:state.altPackage,fee:state.original.fee};
    return validPlan(p) && changes(state.original,p)===1 ? p : null;
  }
  function header() {
    return `<header class="masthead"><div class="wrap"><a class="brand" href="${DEMO?'?demo=1':'./'}" aria-label="Break-Even Arena home"><span class="brand-mark" aria-hidden="true">BE</span><span><strong>ESPORTS INDUSTRY TYCOON</strong><small>Break-Even Arena · SPM 343</small></span></a><div class="top-actions"><label class="motion-control"><input id="motion" type="checkbox" ${reduced?'checked':''}>Less motion</label><a class="text-button" href="?guide=1">Instructor guide</a>${!GUIDE && state.stage!=='welcome'?'<button class="text-button" data-action="reset">New run</button>':''}</div></div></header>`;
  }
  function footer() {
    return `<footer class="footer"><div class="wrap"><span>La Salle University · SPM 343 · Jeffrey Levine, J.D., Ph.D.</span><span id="save-status">${GUIDE?'Teaching guide · v'+VERSION:storageOK?'Saved on this browser only':'Storage unavailable: keep this tab open and export your summary'}</span></div></footer>`;
  }
  function stepper() {
    const idx = {plan:0,running1:1,results:1,revise:2,running2:2,reflect:3,complete:3}[state.stage] ?? 0;
    return `<ol class="stepper" aria-label="Activity progress">${['Build a plan','Run & review','Change one thing','Explain the result'].map((label,i)=>`<li class="${i===idx?'current':i<idx?'done':''}" ${i===idx?'aria-current="step"':''}><span class="step-no">${i<idx?'✓':i+1}</span>${label}</li>`).join('')}</ol>`;
  }
  function head(eyebrow,title,lead,badge='One tournament. Two decisions.') {
    return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1 tabindex="-1" id="page-title">${title}</h1><p>${lead}</p></div><span class="pill">${badge}</span></div>`;
  }
  function arena(packageId, mode='preview', count=0) {
    const p=PACKAGES[packageId], accent=p.accent;
    let desks='';
    for(let i=0;i<p.stations;i++) {
      const row=Math.floor(i/3), col=i%3, x=115+col*151-row*9, y=238+row*37;
      desks+=`<g transform="translate(${x},${y})"><path d="M-31 4L21-6 45 8-8 20z" fill="#304047" stroke="#51636a"/><path d="M-8 20v14M40 10v14" stroke="#50636a" stroke-width="3"/><path d="M-13-14L18-17 19 3-12 6z" fill="#091519" stroke="${accent}" stroke-width="1.2"/><path d="M-10-11L14-13 15 0-9 2z" fill="${accent}" opacity=".22"/><path d="M-7-5L8-8" stroke="${accent}" opacity=".7"/><ellipse cx="1" cy="30" rx="10" ry="5" fill="#0b1519"/><path d="M-8 21Q1 13 10 21v12H-8z" fill="#294148" stroke="#45616b"/><circle cx="1" cy="16" r="5" fill="#607a80"/></g>`;
    }
    let people='';
    for(let i=0;i<36;i++) {
      const col=i%18, row=Math.floor(i/18), x=65+col*30, y=386+row*20;
      const opacity=mode==='event' ? 0.08 : i<25?.85:.15;
      people+=`<g data-person="${i}" class="seat-person" opacity="${opacity}"><circle cx="${x}" cy="${y-4}" r="3" fill="${i%3===0?accent:'#a4b8bc'}"/><path d="M${x-4} ${y+1}q4-3 8 0v6h-8z" fill="${i%3===0?accent:'#657e86'}"/></g>`;
    }
    const truss=p.stations>=9?`<path d="M60 211V73H580V211M62 83h516M72 74v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9m28-9v9" fill="none" stroke="#587079" stroke-width="3"/>`:'';
    const beams=p.stations===12?`<path class="beam" d="M97 92L300 350H20z" fill="${accent}"/><path class="beam" d="M546 92L620 360H320z" fill="${accent}"/>`:'';
    return `<div class="arena-shell" id="arena-shell"><div class="arena-top"><strong>${p.short}</strong><span class="pill ${mode==='event'?'lime':''}" id="arena-badge"><span class="dot"></span>${mode==='event'?'EVENT IN PROGRESS':'VENUE PREVIEW'}</span></div><svg class="arena-svg" viewBox="0 0 640 455" role="img" aria-label="Illustrative ${p.name} gaming venue with a stage, gaming stations, and player check-in area. Not a literal seat map."><defs><pattern id="floor-grid" width="32" height="22" patternUnits="userSpaceOnUse"><path d="M32 0H0v22" fill="none" stroke="#2b3d45" stroke-width=".8"/></pattern><linearGradient id="back-wall" x2="0" y2="1"><stop stop-color="#1b2d35"/><stop offset="1" stop-color="#0e1d23"/></linearGradient></defs><path d="M54 228h532l37 190H17z" fill="#14252d" stroke="#3b545e"/><path d="M54 228h532l37 190H17z" fill="url(#floor-grid)"/><path d="M17 418h606v11H17z" fill="#223740" stroke="#3b545e"/><rect x="65" y="85" width="510" height="149" rx="3" fill="url(#back-wall)" stroke="#35505b"/>${truss}${beams}<path d="M187 205h269l26 27H160z" fill="#2b3b40" stroke="#59737b"/><path d="M160 232h322v11H160z" fill="#132128"/><path d="M169 237h305" stroke="${accent}" opacity=".6"/><rect x="202" y="101" width="236" height="98" rx="3" fill="#071519" stroke="${accent}" stroke-width="2"/><path class="led-line" d="M212 109H428M212 190H428" stroke="${accent}"/><text x="320" y="126" text-anchor="middle" fill="${accent}" font-size="10" letter-spacing="3" class="arena-subtitle">BREAK-EVEN ARENA</text><text id="arena-score" x="320" y="165" text-anchor="middle" fill="#f0f3e9" font-size="${mode==='event'?31:28}" class="arena-title">${mode==='event'?'0 PLAYERS':'CAMPUS CLASH'}</text><text x="320" y="183" text-anchor="middle" fill="#9caeb2" font-size="8" letter-spacing="2" class="arena-subtitle">COMPETE. CONNECT. COVER YOUR COSTS.</text><rect x="85" y="120" width="26" height="92" rx="4" fill="#091519" stroke="#3f5964"/><rect x="531" y="120" width="26" height="92" rx="4" fill="#091519" stroke="#3f5964"/><circle cx="98" cy="149" r="8" fill="#192e37"/><circle cx="98" cy="183" r="11" fill="#192e37"/><circle cx="544" cy="149" r="8" fill="#192e37"/><circle cx="544" cy="183" r="11" fill="#192e37"/>${desks}${people}<path d="M269 421h102" stroke="${accent}" stroke-width="3"/><text x="320" y="447" text-anchor="middle" fill="#b4c2c6" font-size="9" letter-spacing="3" class="arena-subtitle">PLAYER CHECK-IN</text>${mode==='event'?'<g class="visitor"><circle cx="316" cy="401" r="4" fill="#dafa68"/><path d="M311 407h10v9h-10z" fill="#dafa68"/></g>':''}</svg><div class="arena-bottom"><span>${p.stations===6?'Community atmosphere':p.stations===9?'Competition-ready production':'Premium production & larger prize'}</span><span>Illustration, not a seat map</span></div></div>`;
  }
  function metrics(d, mode='budget') {
    const actual=mode==='actual', revised=mode==='revision';
    const n=actual||revised?d.actual:d.forecast, profit=actual||revised?d.actuals.profit:d.budget.profit;
    return `<div class="finance-strip" aria-label="Financial dashboard"><div class="metric"><span class="label">${actual?'Actual paying players':revised?'Estimated test turnout':'Forecast paying players'}</span><strong class="value">${n}</strong><small>${revised?'Under observed conditions':actual?'Paid entries, not spectators':'Estimate, not paid sales'}</small></div><div class="metric"><span class="label">Players needed to break even</span><strong class="value cyan">${d.be}</strong><small>Rounded up to whole players</small></div><div class="metric"><span class="label">${actual?'Actual event result':revised?'Estimated test result':'Projected event result'}</span><strong class="value ${tone(profit)}">${dollars(profit)}</strong><small>${resultLabel(profit)} · after all modeled costs</small></div></div>`;
  }
  function meter(d, n=d.actual, live=false) {
    const max=Math.max(d.forecast,d.be,n)+Math.ceil(Math.max(d.forecast,d.be,n)*.12), target=d.be/max*100;
    return `<div class="break-meter"><div class="meter-head"><span>${live?'Cost-recovery progress':'Paying players vs. break-even'}</span><strong class="cyan">${d.be} needed</strong></div><div class="meter-track" role="progressbar" aria-label="Paying players toward break-even" aria-valuemin="0" aria-valuemax="${Math.max(d.be,n)}" aria-valuenow="${n}" id="event-meter" data-max="${max}"><div class="meter-fill" id="meter-fill" style="width:${n/max*100}%"></div><div class="meter-target" style="left:${target}%" title="Break-even: ${d.be} players"></div></div><div class="meter-labels"><span>0 players</span><span class="positive">Lime line = ${d.be} players</span><span>${max}</span></div><p class="meter-outcome" id="meter-outcome">${live?'Fixed costs must be recovered before contributions become profit.':n>=d.be?`The event reached its cost-recovery threshold with ${n} paying players.`:`${d.be-n} more paying players were needed to cover costs at this fee.`}</p></div>`;
  }
  function packageChoices(selected, revision=false) {
    return `<div class="options" role="radiogroup" aria-label="Event package">${Object.entries(PACKAGES).map(([id,p])=>{
      const locked=revision&&state.original.packageId===id;
      return `<label class="choice ${selected===id?'selected':''} ${locked?'locked':''}"><input type="radio" name="${revision?'altPackage':'packageId'}" value="${id}" id="${revision?'alt-':''}pkg-${id}" ${selected===id?'checked':''} ${locked?'disabled':''}><span class="tag">${locked?'Original package':p.tag}</span><span class="name">${p.name}</span><span class="price">${dollars(p.fixed)}</span><span class="note">fixed costs</span><span class="detail">${p.description}</span></label>`;
    }).join('')}</div>`;
  }
  function feeChoices(selected,revision=false) {
    return `<div class="options" role="radiogroup" aria-label="Entry fee">${FEES.map(f=>{
      const locked=revision&&state.original.fee===f;
      return `<label class="choice fee ${selected===f?'selected':''} ${locked?'locked':''}"><input type="radio" name="${revision?'altFee':'fee'}" value="${f}" id="${revision?'alt-':''}fee-${f}" ${selected===f?'checked':''} ${locked?'disabled':''}><span class="price">${dollars(f)}</span><span class="note">per paying player</span><span class="detail">${locked?'Original fee':dollars(f-VARIABLE)+' contribution / player'}</span></label>`;
    }).join('')}</div>`;
  }
  function costDetails(d) {
    return `<details><summary>Open the cost breakdown</summary>${COST_NAMES.map((name,i)=>`<div class="cost-line"><span>${name}</span><strong>${dollars(d.pkg.items[i])}</strong></div>`).join('')}<div class="cost-line"><span>Total fixed costs</span><strong>${dollars(d.fixed)}</strong></div><div class="cost-line"><span>Licensing + food, per player</span><strong>$5 + $5 = $10</strong></div><p style="margin-top:12px">${d.packageId==='standard'?'Campus Classic reproduces the chapter’s costs in Tables 11.2–11.3.':'This package is an instructor-created alternative, not a quoted market price.'} Fixed costs stay fixed for this one event. Variable costs apply to each paying player.</p></details>`;
  }
  function budgetDetails(d) {
    return `<details><summary>Open the planned event budget</summary><div class="table-wrap"><table><thead><tr><th>At ${d.forecast} projected players</th><th>Budget</th></tr></thead><tbody><tr><td>Entry revenue</td><td>${dollars(d.budget.revenue)}</td></tr><tr><td>Variable costs</td><td>${dollars(d.budget.variable)}</td></tr><tr><td>Fixed costs</td><td>${dollars(d.fixed)}</td></tr><tr class="total-row"><td>Projected event result</td><td>${dollars(d.budget.profit)}</td></tr></tbody></table></div></details>`;
  }
  function sourceNote() {
    return `<p class="source-note">Reading basis: Gil Fried, “Esports Finance and Economics,” Chapter 11 of <em>Esports Business Management</em>, Tables 11.2–11.3 (printed pp. 197–198), and the SPM 343 finance slides. Only Campus Classic’s cost baseline is reproduced from the chapter. Other packages, all demand estimates, and the common turnout scenario are fictional teaching assumptions—not market forecasts. This is a simplified event operating summary, not a complete corporate income statement.</p>`;
  }
  function assumptions(reveal=false) {
    return `<details><summary>Model notes: what is real, and what is assumed?</summary><p><strong>From the reading:</strong> Campus Classic has $4,000 fixed costs, $10 variable cost per entrant, and 100 break-even entrants at a $50 fee. The other packages are invented alternatives.</p><p><strong>Invented demand estimates:</strong> use the table below. A package and its price jointly affect turnout. Premium production can support a higher fee; a cheaper entry is not automatically more profitable. These are interest-based estimates, not confirmed registrations.</p><div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Forecast paying players</th><th>$30 fee</th><th>$40 fee</th><th>$50 fee</th></tr></thead><tbody>${Object.values(PACKAGES).map(p=>`<tr><td>${p.name}</td><td>${p.forecast[30]}</td><td>${p.forecast[40]}</td><td>${p.forecast[50]}</td></tr>`).join('')}</tbody></table></div><p><strong>Scope:</strong> one event, a maximum of 240 paid entrants, all entrants paying the chosen fee, and no spectator ticket revenue. Costs include only the five fixed lines plus $10 per player. No borrowing, tax, depreciation, sponsor revenue, or carried-forward debt is modeled. The licensing and food assumptions come from the chapter; they are not universal event-pricing rules.</p><p><strong>Fair comparison:</strong> everyone faces the same demand conditions. ${reveal?'Actual paying turnout is two-thirds of the forecast in every plan. The revision uses that same observed condition; it is not another season.':'The actual turnout condition is revealed when the event runs. A revision keeps that condition unchanged.'}</p></details>`;
  }
  function welcome() {
    return `<div class="hero"><section><div class="eyebrow">Esports Industry Tycoon · Finance edition</div><h1 tabindex="-1" id="page-title">Break-even<br><em>Arena.</em></h1><p class="hero-lead">Build the hype. Open the doors.<br>Find out whether the numbers work.</p><div class="btn-row"><span class="pill">Solo or with a partner</span><span class="pill">≈30 minutes with discussion</span></div><form id="start-form" class="panel"><div class="intro-fields"><div class="field"><label for="name1">Your name</label><input id="name1" name="name1" autocomplete="name" maxlength="80" value="${esc(state.names[0])}" placeholder="First and last name" required></div><div class="field"><label for="name2">Partner <span class="muted">(optional)</span></label><input id="name2" name="name2" autocomplete="off" maxlength="80" value="${esc(state.names[1])}" placeholder="One device per pair"></div></div><div class="btn-row"><button class="btn" type="submit">Enter the arena <span aria-hidden="true">→</span></button><a class="text-button" href="?demo=1">Try an instructor demo</a></div><p class="small muted" style="margin-top:14px">Names and work stay on this browser. Nothing is automatically sent to your instructor. You will copy or save your final summary for Canvas.</p></form></section><div class="hero-art">${arena('showcase')}<div class="callout" style="margin-top:18px"><strong>Your mission</strong><br>Host a campus tournament that attracts paying players and covers its costs. Then defend your choices with financial evidence.</div></div></div><div class="flow-notes"><div><strong>01 / Build a plan</strong><p>Choose an event package and an entry fee. Check the break-even point.</p></div><div><strong>02 / Watch it play out</strong><p>See check-ins, revenue, costs, and the gap between forecast and reality.</p></div><div><strong>03 / Change one thing</strong><p>Test an alternative under the same conditions. Explain what changed.</p></div></div>`;
  }
  function planner() {
    const d=calc(state.packageId,state.fee), headroom=d.forecast-d.be;
    return `${stepper()}${head('01 / The proposal','A great event still needs a workable budget.','Choose the experience. Set the fee. Your goal is to attract paying players while covering the costs you commit to.')}<div class="split plan-layout"><section><div class="panel"><div class="form-block"><div class="section-label"><span class="number">1</span>Choose your event package</div>${packageChoices(state.packageId)}</div><div class="form-block"><div class="section-label"><span class="number">2</span>Set the entry fee</div>${feeChoices(state.fee)}</div><div class="formula">Contribution from each paying player<strong>${dollars(d.fee)} − $10 = ${dollars(d.cm)}</strong><small>Entry fee − variable cost. This covers fixed costs first; it is not all profit.</small></div></div><div class="mobile-metrics">${metrics(d)}</div><form id="plan-form" class="panel checkpoint"><h3>Before you open the doors</h3><p class="small muted">A practice check, not a grade. Any calculation error will be explained when the event runs.</p><div class="fields"><div class="field"><label for="guess">Players to break even</label><input id="guess" name="guess" type="number" inputmode="numeric" min="1" max="10000" step="1" value="${esc(state.guess)}" placeholder="e.g., 100" required><p class="hint">Round up to a whole paying player.</p></div><div class="field"><label for="rationale">Why is your plan financially workable?</label><textarea id="rationale" name="rationale" maxlength="700" placeholder="We expect … paying players. That is … above/below break-even, so …" required>${esc(state.rationale)}</textarea></div></div><button class="btn" type="submit">Run the tournament <span aria-hidden="true">→</span></button><p class="small muted" style="margin-top:12px">Your choices lock when the doors open. You get one comparison afterward.</p></form></section><aside class="sticky">${arena(state.packageId)}${metrics(d)}<div class="callout ${headroom<0?'warning':'info'}">${headroom<0?`<strong>Your forecast is ${Math.abs(headroom)} players below break-even.</strong> This plan does not cover costs even before a turnout shortfall.${d.be>240?` Its ${d.be}-player threshold is above the 240-player event limit.`:""}`:`<strong>${headroom} players of forecast breathing room.</strong> That is an estimate, not a guarantee. Interest is not the same as paid registration.`}</div><div class="panel" style="margin-top:20px">${costDetails(d)}${budgetDetails(d)}${assumptions()}</div></aside></div>${sourceNote()}`;
  }
  function eventScreen(second=false) {
    const p=second?state.revised:state.original, d=planData(p);
    return `${stepper()}${head(second?'03 / Controlled comparison':'02 / Doors open',second?'Same tournament. One different decision.':'The doors are open. The books are not closed.',second?'The same two-thirds turnout condition applies. This is a what-if comparison, not another event or another season.':'Watch each paying player contribute toward fixed costs. Revenue is not the same thing as profit.',second?'One variable changed':'No random advantages')}<div class="event-layout"><div>${arena(p.packageId,'event')}${meter(d,0,true)}</div><section class="panel"><div class="eyebrow">${d.pkg.name} · ${dollars(d.fee)} entry</div><div class="event-status" aria-live="polite"><h2 id="event-title">Bookings are committed.</h2><p id="event-description">${dollars(d.fixed)} in fixed costs will not disappear if fewer players arrive.</p></div><div class="event-counter" id="event-count">0</div><div class="event-counter-label">paying players checked in · <span class="cyan">${d.be} needed to break even</span></div><div class="event-ledger"><div><span>Entry revenue</span><strong id="event-revenue">$0</strong></div><div><span>Variable costs · $10 / player</span><strong id="event-variable">$0</strong></div><div><span>Fixed commitments</span><strong>${dollars(d.fixed)}</strong></div><div><span>Contributions less fixed costs</span><strong id="event-profit" class="negative">${dollars(-d.fixed)}</strong></div></div><p class="small muted">Each entry adds ${dollars(d.fee)} in revenue and $10 in variable cost. The remaining ${dollars(d.cm)} goes toward fixed costs, then profit.</p><div id="event-actions" class="event-actions"><button class="btn secondary" data-action="skip-event">Skip animation</button></div></section></div>`;
  }
  function budgetActualTable(d) {
    const rows=[['Paying players','players',false],['Entry revenue','revenue',true],['Variable costs','variable',true],['Fixed costs','fixed',true],['Total expenses','expenses',true],['Event result','profit',true]];
    return `<div class="table-wrap"><table><caption class="sr-only">Budget versus actual results. Differences equal actual minus budget.</caption><thead><tr><th>Event operating summary</th><th>Budget</th><th>Actual</th><th>Difference<br>(actual − budget)</th></tr></thead><tbody>${rows.map(([label,key,money])=>{const diff=d.actuals[key]-d.budget[key];return `<tr class="${key==='profit'?'total-row':''}"><td>${label}</td><td>${money?dollars(d.budget[key]):d.budget[key]}</td><td class="${key==='profit'?tone(d.actuals[key]):''}">${money?dollars(d.actuals[key]):d.actuals[key]}</td><td class="${key==='profit'?tone(diff):''}">${money?signedDollars(diff):signed(diff)}</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function outcomeTitle(profit) { return profit>0?'The event covered its costs.':profit===0?'You reached break-even.':'The event did not cover its costs.'; }
  function results() {
    const d=planData(state.original), lost=d.forecast-d.actual, correct=Number(state.original.guess)===d.be;
    return `${stepper()}${head('02 / The event review','The crowd tells one story. The books tell another.','Compare what you budgeted with what actually happened. This is variance analysis—not a comparison of two different years.')}<div class="split wide-left"><section class="stack"><div class="panel"><div class="result-head"><div class="result-icon ${d.actuals.profit<0?'loss':''}" aria-hidden="true">${d.actuals.profit>=0?'✓':'↘'}</div><div><h2>${outcomeTitle(d.actuals.profit)}</h2><p class="muted small" style="margin-top:8px">${d.pkg.name} · ${dollars(d.fee)} entry · ${d.actual} paying players</p></div></div>${budgetActualTable(d)}<p class="small muted" style="margin-top:12px">All differences are actual minus budget. Lower variable spending here came from fewer entrants—not a cheaper per-player service.</p></div><div class="panel"><div class="eyebrow">Make the gap make sense</div><h3>${lost} fewer paying players. ${dollars(lost*d.cm)} less profit.</h3><p class="muted" style="margin-top:12px">You collected ${dollars(lost*d.fee)} less in entry fees and saved ${dollars(lost*VARIABLE)} in variable costs. But the ${dollars(d.fixed)} fixed-cost commitment stayed the same.</p><div class="formula">Profit variance = change in players × contribution per player<strong>(${d.actual} − ${d.forecast}) × ${dollars(d.cm)} = ${dollars(d.actuals.profit-d.budget.profit)}</strong><small>That is an unfavorable profit variance, even if the event still made a profit.</small></div></div><div class="btn-row"><button class="btn" data-action="revise">Test one change <span aria-hidden="true">→</span></button><span class="muted">Keep the event conditions. Change only the package or the fee.</span></div></section><aside class="stack"><div class="callout"><strong>The shared turnout condition</strong><br>The interest survey overestimated paid turnout. Actual paying registrations reached <strong>two-thirds of the forecast</strong> for every plan. Fixed bookings could not be cancelled. This is the same invented condition for everyone—not a random penalty.</div><div class="panel"><h3>Your break-even check</h3><p class="small muted" style="margin-top:12px">You entered <strong>${esc(state.original.guess)}</strong>. ${correct?'That is correct.':'The correct whole-player threshold is '+d.be+'. No points are lost; this is practice.'}</p><div class="formula">Fixed costs ÷ contribution per player<strong>${dollars(d.fixed)} ÷ ${dollars(d.cm)} = ${Number.isInteger(d.rawBE)?d.be:d.rawBE.toFixed(2)}</strong><small>${Number.isInteger(d.rawBE)?`Exactly ${d.be} paying players cover the modeled costs.`:`Round up: ${d.be} paying players are needed to avoid a loss.`}</small></div>${meter(d)}</div><details><summary>Revisit your original reasoning</summary><p>${esc(state.original.rationale)}</p></details></aside></div>${sourceNote()}`;
  }
  function revision() {
    const orig=planData(state.original), alt=revisionPlan(), d=alt?planData(alt):orig;
    return `${stepper()}${head('03 / One controlled revision','Change one thing. Learn what it changes.','You now know the turnout condition. Test a different entry fee OR a different event package—not both. The original result stays intact.')}<div class="split"><section><div class="panel"><div class="eyebrow">Your original decision</div><p><strong>${orig.pkg.name}</strong> · ${dollars(orig.fee)} entry · <strong class="${tone(orig.actuals.profit)}">${dollars(orig.actuals.profit)} ${resultLabel(orig.actuals.profit)}</strong></p><div class="mode-switch" role="group" aria-label="Choose which decision to revise"><button class="${state.revisionType==='fee'?'active':''}" aria-pressed="${state.revisionType==='fee'}" data-action="revision-fee">Change the entry fee<small>Keep ${orig.pkg.name}</small></button><button class="${state.revisionType==='package'?'active':''}" aria-pressed="${state.revisionType==='package'}" data-action="revision-package">Change the event package<small>Keep the ${dollars(orig.fee)} fee</small></button></div><div class="locked-banner">${state.revisionType==='fee'?`<strong>Locked:</strong> ${orig.pkg.name} and ${dollars(orig.fixed)} fixed costs. Choose a different fee below.`:`<strong>Locked:</strong> ${dollars(orig.fee)} entry fee and $10 per-player variable cost. Choose a different package below.`}</div>${state.revisionType==='fee'?feeChoices(state.altFee,true):packageChoices(state.altPackage,true)}${alt?`<div class="formula">Use the evidence from the first run<strong>${d.forecast} forecast × ⅔ = ${d.actual} paying players</strong><small>The dashboard is now a what-if estimate under the observed turnout condition—not the original optimistic budget.</small></div><div class="callout ${d.actuals.profit<orig.actuals.profit?'warning':'info'}" style="margin-top:16px"><strong>${signedDollars(d.actuals.profit-orig.actuals.profit)} change in the event result.</strong><br>${state.revisionType==='fee'?`Contribution per player changes from ${dollars(orig.cm)} to ${dollars(d.cm)}; modeled turnout changes from ${orig.actual} to ${d.actual}.`:`Fixed costs change from ${dollars(orig.fixed)} to ${dollars(d.fixed)}; modeled turnout changes from ${orig.actual} to ${d.actual}.`}</div>`:'<p class="small muted" style="margin-top:18px">Select a different option to see the controlled comparison. You can inspect alternatives before committing your one revision.</p>'}<div class="btn-row" style="margin-top:22px"><button class="btn" data-action="run-revision" ${alt?'':'disabled'}>Run the comparison <span aria-hidden="true">→</span></button></div><p class="small muted" style="margin-top:12px">A test can confirm your original plan or reveal a better one. A worse result still teaches something.</p></div></section><aside class="sticky">${arena(d.packageId)}${alt?metrics(d,'revision'):'<div class="callout info" style="margin-top:16px">The venue above shows your original package until you choose an alternative. Your revised financial estimate will appear here.</div>'}<div class="panel" style="margin-top:20px">${costDetails(d)}${assumptions(true)}</div></aside></div>${sourceNote()}`;
  }
  function comparisonTable(a,b) {
    const rows=[['Paying players',a.actual,b.actual,false],['Contribution per player',a.cm,b.cm,true],['Entry revenue',a.actuals.revenue,b.actuals.revenue,true],['Variable costs',a.actuals.variable,b.actuals.variable,true],['Fixed costs',a.fixed,b.fixed,true],['Event result',a.actuals.profit,b.actuals.profit,true]];
    return `<div class="table-wrap"><table><thead><tr><th>Same event conditions</th><th>Original result</th><th>What-if result</th><th>Change</th></tr></thead><tbody>${rows.map(([label,x,y,money],i)=>`<tr class="${i===rows.length-1?'total-row':''}"><td>${label}</td><td>${money?dollars(x):x}</td><td>${money?dollars(y):y}</td><td>${money?signedDollars(y-x):signed(y-x)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function comparisonCards(a,b) {
    return `<div class="comparison"><div class="panel"><div class="eyebrow">Original event</div><strong>${a.pkg.name} · ${dollars(a.fee)}</strong><div class="big-result ${tone(a.actuals.profit)}">${dollars(a.actuals.profit)}</div><p class="small muted">${a.actual} paying players · ${resultLabel(a.actuals.profit)}</p></div><span class="arrow" aria-hidden="true">→</span><div class="panel"><div class="eyebrow">One-change comparison</div><strong>${b.pkg.name} · ${dollars(b.fee)}</strong><div class="big-result ${tone(b.actuals.profit)}">${dollars(b.actuals.profit)}</div><p class="small muted">${b.actual} paying players · ${resultLabel(b.actuals.profit)}</p></div></div>`;
  }
  function reflection() {
    const a=planData(state.original), b=planData(state.revised), delta=b.actuals.profit-a.actuals.profit;
    return `${stepper()}${head('04 / The management brief','Now defend the decision.','Financial outcomes are evidence—not your academic grade. Use the numbers to explain the original result and the effect of your one change.')} ${comparisonCards(a,b)}<div class="callout ${delta<0?'warning':'info'}"><strong>${delta>0?'The revised plan improved the result by '+dollars(delta)+'.':delta<0?'The revised plan reduced the result by '+dollars(-delta)+'.':'Both plans produced the same financial result.'}</strong> ${b.actuals.profit<0?(delta>0?'The loss is smaller, but this alternative still does not cover its costs.':'This alternative still does not cover its costs.'):b.actuals.profit===0?'This alternative covers exactly its modeled costs; it does not generate a profit.':'A positive result does not prove that the initial forecast was reliable.'} This is a controlled what-if comparison, not horizontal analysis across different periods.</div><div class="split" style="margin-top:24px"><section class="panel reflection"><form id="reflection-form"><div class="field"><label for="reflection1">1. Explain your original result.</label><textarea id="reflection1" maxlength="1000" required placeholder="Our original plan produced … because … . Use paying players, contribution margin, fixed costs, or the budget gap.">${esc(state.reflections[0])}</textarea></div><div class="field"><label for="reflection2">2. Explain the effect of your one change.</label><textarea id="reflection2" maxlength="1000" required placeholder="We changed … . This affected … and changed the result by … . We would defend … because … .">${esc(state.reflections[1])}</textarea></div><p class="small muted" style="margin:18px 0">One or two substantive sentences per response is enough. Discuss with your partner; each student can submit the shared results with their own explanation if instructed.</p><button class="btn" type="submit">Create my Canvas summary <span aria-hidden="true">→</span></button></form></section><aside class="stack"><div class="panel"><h3 style="margin-bottom:16px">The evidence behind your explanation</h3>${comparisonTable(a,b)}</div><div class="panel"><details><summary>Discussion bridge: sponsorship</summary><p>Would sponsored equipment solve the same problem as unrestricted cash? Equipment can replace a planned equipment cost; it cannot directly pay every other bill. Cash can meet other obligations, subject to any restrictions.</p></details><details><summary>Discussion bridge: annual reports</summary><p>Look to the income statement for revenue, expenses, and the reported result over a period. Look to management’s discussion and analysis (MD&amp;A) for management’s explanation of financial changes. A balance sheet is a snapshot of assets, liabilities, and equity—not this event’s profit calculation.</p></details></div></aside></div>${sourceNote()}`;
  }
  function receiptText() {
    const a=planData(state.original),b=planData(state.revised);
    const row=(label,d)=>`${label}: ${d.pkg.name}; entry fee ${dollars(d.fee)}\n  Fixed costs ${dollars(d.fixed)}; variable cost $10 per player\n  Contribution per player ${dollars(d.cm)}; break-even ${d.be} paying players\n  Original forecast ${d.forecast} paying players; budgeted result ${dollars(d.budget.profit)}\n  ${label==='ORIGINAL EVENT'?'Actual':'What-if'} turnout ${d.actual}; revenue ${dollars(d.actuals.revenue)}\n  Variable costs ${dollars(d.actuals.variable)}; total expenses ${dollars(d.actuals.expenses)}\n  Event result ${dollars(d.actuals.profit)} (${resultLabel(d.actuals.profit)})`;
    return `ESPORTS INDUSTRY TYCOON: BREAK-EVEN ARENA\nSPM 343 | La Salle University\nParticipants: ${state.names.filter(n=>n.trim()).join(' and ')}\n${DEMO?'INSTRUCTOR DEMO — not a student submission\n':''}Completed: ${state.completedAt}\nLocal run reference: ${state.id}\nVersion: ${VERSION}\n\n${row('ORIGINAL EVENT',a)}\n  Profit variance (actual minus budget): ${signedDollars(a.actuals.profit-a.budget.profit)}\n\nBREAK-EVEN PRACTICE CHECK\nEntered ${state.original.guess}; correct whole-player threshold ${a.be}.\nOriginal plan justification: ${state.original.rationale}\n\n${row('ONE-CHANGE COMPARISON',b)}\nChanged only: ${a.fee!==b.fee?'entry fee ('+dollars(a.fee)+' to '+dollars(b.fee)+')':'event package ('+a.pkg.name+' to '+b.pkg.name+')'}\nChange in event result: ${signedDollars(b.actuals.profit-a.actuals.profit)}\nBoth plans use the same two-thirds turnout condition. This is not a second season.\n\n1. EXPLANATION OF ORIGINAL RESULT\n${state.reflections[0]}\n\n2. EFFECT OF THE ONE CHANGE\n${state.reflections[1]}\n\nMODEL AND SUBMISSION NOTE\nCampus Classic's costs are from Gil Fried, Chapter 11, Tables 11.2–11.3. Other packages, forecasts, and turnout are invented teaching assumptions. No tax, financing, sponsor revenue, or continuing debt is modeled. Profit is not an academic score. This is a locally generated, editable learning summary, not a verified gradebook receipt. Nothing has been automatically sent to Canvas or the instructor. Submit this summary through the class assignment.\n`;
  }
  function complete() {
    const a=planData(state.original),b=planData(state.revised), receipt=receiptText();
    return `${stepper()}${head('Activity complete','Your tournament is in the books.','Your original plan, controlled comparison, and explanations are ready to submit. Copy the summary below into Canvas, or save the text file.','No automatic submission')}<div class="callout"><strong>One final step: submit your work in Canvas.</strong><br>This site has saved your work only in this browser. The buttons below do not create a gradebook record or send anything to your instructor.</div>${comparisonCards(a,b)}<div class="panel"><div class="btn-row"><button class="btn" data-action="copy">Copy Canvas summary</button><button class="btn secondary" data-action="download">Save summary (.txt)</button><button class="btn ghost" data-action="print">Print summary</button><button class="text-button" data-action="edit-reflection">Edit explanations</button></div><label class="sr-only" for="receipt">Complete results summary</label><textarea id="receipt" class="receipt" readonly spellcheck="false">${esc(receipt)}</textarea><pre class="print-report" style="display:none;overflow-wrap:anywhere">${esc(receipt)}</pre><p class="small muted">Copying unavailable? Select the text above and copy it manually. Save a copy before using “New run” or clearing browser data.</p></div>${sourceNote()}`;
  }
  function guide() {
    return `<div class="guide" style="margin:auto">${head('Instructor field guide','Teach the decision. Keep the interface simple.','Esports Industry Tycoon: Break-Even Arena · a 30-minute application of the chapter’s tournament budget.','SPM 343')}<div class="btn-row"><a class="btn" href="./">Open student activity</a><a class="btn secondary" href="?demo=1">Open instructor demo</a><button class="btn ghost" data-action="print">Print guide</button></div><div class="panel"><h2>Launch it in one minute</h2><blockquote>“You’re managing a campus esports tournament. Choose an event package and an entry fee. Decide whether your forecast can cover your costs, then run the event. You’ll get one chance to change a decision under the same conditions. Your job is not just to make money—it is to explain why the numbers changed.”</blockquote><p>Students work alone or in pairs on one device. Names are local only. No room code, account, class opening, instructor key, leaderboard, or database is needed. Each player faces the same turnout assumption. The demo uses a separate browser-save slot and automatically enters “Instructor preview.”</p><div class="timing"><div><strong>3m</strong><span>Introduce mission</span></div><div><strong>8m</strong><span>Build and justify</span></div><div><strong>4m</strong><span>Run and review</span></div><div><strong>6m</strong><span>Test one change</span></div><div><strong>9m</strong><span>Explain and debrief</span></div></div><p>These are facilitation targets, not enforced timers. A quick individual playthrough will be shorter. Ask students to compare and explain, rather than waiting for a countdown.</p></div><div class="panel"><h2>Where it fits</h2><p>Use after the contribution-margin and break-even explanation in the uploaded finance deck (slide 19). Replace the short tournament calculation exercise rather than adding the game to a full 75-minute lecture. Keep the asset/liability exercise and annual-report interpretation separate.</p><p>The game concentrates on revenue and expenses, fixed and variable costs, contribution margin, break-even analysis, and budget-versus-actual variance. The one-change comparison is a counterfactual for the same event, not horizontal analysis across years. The game does not introduce a balance sheet, ROI meter, financing round, or persistent debt.</p></div><div class="panel"><h2>Model, sources, and a fair comparison</h2><p><strong>Reading baseline:</strong> Campus Classic has fixed costs of $4,000: insurance $500, administrator $1,000, supplies/equipment $500, facility $1,000, and prize money $1,000. Licensing and food are $5 each per player. At a $50 fee, contribution is $40 and break-even is 100 entrants. See Gil Fried’s Chapter 11, Tables 11.2–11.3, printed pp. 197–198 (PDF pages 11–12), and slides 18–19.</p><p><strong>Invented teaching assumptions:</strong> Community Cup and Spotlight Showcase costs; all nine forecast attendance figures; a maximum of 240 entrants; and a common shortfall in paid registration. Actual paying turnout equals two-thirds of each plan’s forecast. Nothing is random. All forecasts are divisible by three, so there are no fractional players. Fixed commitments are unchanged once selected. All entrants pay; there are no spectators, sponsors, refunds, taxes, financing, or depreciation in the model.</p><p>Forecasts are based on interest, not deposits or prepaid sales. The exact shortfall is revealed after the first plan is committed. Revision estimates correctly use the now-observed two-thirds condition. Students may inspect alternatives, but the committed revision changes exactly one decision.</p><div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Package</th><th>Fee</th><th>Forecast</th><th>Actual</th><th>Break-even</th><th>Budget result</th><th>Actual result</th></tr></thead><tbody>${Object.keys(PACKAGES).flatMap(id=>FEES.map(f=>{const d=calc(id,f);return `<tr><td>${d.pkg.name}</td><td>${dollars(f)}</td><td>${d.forecast}</td><td>${d.actual}</td><td>${d.be}</td><td>${dollars(d.budget.profit)}</td><td class="${tone(d.actuals.profit)}">${dollars(d.actuals.profit)}</td></tr>`;})).join('')}</tbody></table></div><p>Whole-player break-even is rounded up. Community Cup at $50 breaks even exactly with 70 actual entrants. Spotlight Showcase at $30 needs 280 entrants, above the modeled 240-player limit: its plan cannot break even at that price. The larger production is not a universally better choice, and a lower entry fee is not automatically safer.</p><p>Financial outcomes are not academic grades. A sound initial decision can suffer an unfavorable variance. Several plans remain viable while serving different audiences or requiring different fixed commitments. The model is deliberately small and transparent, not a market forecast or a secure exam.</p></div><div class="panel"><h2>Recommended demonstration</h2><p>Leave the default at Campus Classic / $50. Forecast: 120 paying players and $800 profit. Actual: 80 players and an $800 loss. The 40-player shortfall costs $2,000 of revenue, saves $400 in variable cost, and lowers profit by $1,600. The $4,000 fixed cost does not shrink.</p><p>Then change only the fee to $40. Under the same turnout condition, the model produces 140 paying players and $200 profit. Contribution falls from $40 to $30, but the modeled turnout increase more than offsets it. This supports an explanation about the interaction of demand and contribution; it does not establish that $40 is the right price for an actual event.</p></div><div class="panel"><h2>Debrief prompts and teaching points</h2><details open><summary>“Revenue grew. Did that prove the event was successful?”</summary><p>No. Compare revenue with both fixed and variable costs. Then consider the event’s objectives and whether the turnout estimate was credible. A positive result is not proof that the initial forecasting process was reliable.</p></details><details open><summary>“Why not divide fixed costs by the entry fee?”</summary><p>Because each player also triggers $10 in variable cost. Only the contribution margin—fee minus that $10—is available to cover fixed costs. Round up if the quotient is not a whole player.</p></details><details open><summary>“Your revised plan was worse. Did you fail?”</summary><p>No. The controlled comparison may support keeping the original plan. Assess the explanation and use of evidence, not speed, visual crowd size, or the final profit alone. A lower loss is an improvement, but not yet a profitable event.</p></details><details open><summary>“Would donated equipment solve the same problem as cash?”</summary><p>Equipment can replace a relevant planned purchase or rental; it is not cash for unrelated bills. Unrestricted cash can cover other obligations. Do not subtract a sponsor’s advertised retail equipment value from all event costs.</p></details><details open><summary>“Where do we find the results and the explanation in an annual report?”</summary><p>The income statement reports revenue, expenses, and results over a period. MD&amp;A supplies management’s explanation. The balance sheet reports assets, liabilities, and equity at a date. The game does not use the mismatched EA / Activision numerical examples or speaker notes in the uploaded deck.</p></details></div><div class="panel"><h2>Collect the learning—not a leaderboard</h2><p>At completion, students get a summary containing participant names, original choices, budget and actual figures, their practice break-even answer, the single changed decision, comparison figures, and two explanations. They copy it into Canvas or save the text file. Nothing is sent automatically; no score is stored centrally. The local run reference is not proof of identity or a tamper-proof assessment receipt.</p><p>Evaluate whether students correctly distinguish revenue from profit, explain fixed versus variable costs, use contribution margin, and connect the one changed decision to its financial consequences. This version does not invent an assignment point value or assessment weight.</p><p>Refreshing restores work in the same browser when storage is available. An interrupted animation can replay, but it cannot change the outcome. “New run” asks for confirmation and clears only this activity’s current save slot. On a shared device, export first, then start a new run. Private-browser or blocked-storage sessions should keep the tab open and export before leaving.</p></div>${sourceNote()}</div>`;
  }
  function render(scroll=false,focusId='') {
    animationToken++; finishEvent=null;
    document.body.classList.toggle('reduce-motion',reduced);
    const views={welcome,plan:planner,running1:()=>eventScreen(false),results,revise:revision,running2:()=>eventScreen(true),reflect:reflection,complete};
    const content=GUIDE?guide():views[state.stage]();
    app.innerHTML=header()+`<main id="main" class="main wrap">${DEMO&&!GUIDE?'<div class="pill cyan" style="margin-bottom:16px">INSTRUCTOR DEMO · separate local save</div>':''}${content}</main>`+footer();
    if(scroll){ window.scrollTo({top:0,behavior:'instant'}); document.getElementById('page-title')?.focus({preventScroll:true}); }
    if(focusId) document.getElementById(focusId)?.focus({preventScroll:true});
    if(!GUIDE && ['running1','running2'].includes(state.stage)) animateEvent(state.stage==='running2');
  }
  function animateEvent(second) {
    const token=animationToken,d=planData(second?state.revised:state.original), start=performance.now();
    const ids=Object.fromEntries(['event-count','event-revenue','event-variable','event-profit','arena-score','event-title','event-description','event-actions','meter-fill','event-meter','meter-outcome','arena-badge'].map(id=>[id,document.getElementById(id)]));
    const people=[...document.querySelectorAll('[data-person]')];
    let last=-1,done=false,announced=false;
    function count(n) {
      if(n===last)return; last=n;
      ids['event-count'].textContent=n; ids['arena-score'].textContent=n+' PLAYERS';
      ids['event-revenue'].textContent=dollars(n*d.fee); ids['event-variable'].textContent=dollars(n*VARIABLE);
      ids['event-profit'].textContent=dollars(n*d.cm-d.fixed); ids['event-profit'].className=tone(n*d.cm-d.fixed);
      ids['meter-fill'].style.width=n/Number(ids['event-meter'].dataset.max)*100+'%';
      ids['event-meter'].setAttribute('aria-valuenow',n);
      ids['event-meter'].setAttribute('aria-valuemax',Math.max(d.be,n));
      people.forEach((person,i)=>person.setAttribute('opacity',i<Math.round(n/d.forecast*people.length)?'.95':'.08'));
      if(n>=d.be){ids['meter-fill'].style.background='var(--lime)';ids['meter-outcome'].textContent='Break-even reached. Further contributions become event profit.';}
    }
    function finish() {
      if(done || token!==animationToken)return; done=true; count(d.actual);
      ids['event-title'].textContent=outcomeTitle(d.actuals.profit);
      ids['event-description'].textContent=`${d.actual} paying players contributed ${dollars(d.actuals.contribution)} toward ${dollars(d.fixed)} in fixed costs. Final result: ${dollars(d.actuals.profit)} (${resultLabel(d.actuals.profit)}).`;
      ids['arena-badge'].textContent='BOOKS CLOSED';
      ids['meter-outcome'].textContent=d.actual>=d.be?'The cost-recovery threshold was reached.':`${d.be-d.actual} additional paying players were needed to cover costs at this fee.`;
      ids['event-actions'].innerHTML=`<button class="btn" data-action="${second?'to-reflect':'to-results'}">${second?'Compare and explain':'Review the books'} <span aria-hidden="true">→</span></button>`;
      if(d.actuals.profit>0&&!reduced){const confetti=document.createElement('div');confetti.className='confetti';confetti.setAttribute('aria-hidden','true');confetti.innerHTML=Array.from({length:25},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${i%5*.06}s"></i>`).join('');document.getElementById('arena-shell').append(confetti);}
    }
    finishEvent=finish;
    function frame(now) {
      if(done || token!==animationToken)return;
      const duration=reduced?450:10500, progress=Math.min(1,(now-start)/duration);
      if(progress>.13&&!announced){announced=true;ids['event-title'].textContent='Players are checking in.';ids['event-description'].textContent=`Every entry contributes ${dollars(d.cm)} after its $10 variable cost. Watch the break-even line.`;}
      const entryProgress=Math.max(0,Math.min(1,(progress-.14)/.73));
      count(Math.floor(d.actual*entryProgress));
      if(progress>=1)finish();else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener('input',event=>{
    const el=event.target;
    if(el.id==='name1')state.names[0]=el.value;
    else if(el.id==='name2')state.names[1]=el.value;
    else if(el.id==='guess')state.guess=el.value;
    else if(el.id==='rationale')state.rationale=el.value;
    else if(el.id==='reflection1')state.reflections[0]=el.value;
    else if(el.id==='reflection2')state.reflections[1]=el.value;
    else return;
    el.setCustomValidity(''); save();
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='motion') {
      reduced=el.checked;document.body.classList.toggle('reduce-motion',reduced);
      try{localStorage.setItem('spm343.breakEvenArena.motion',reduced?'reduced':'normal');}catch{}
      if(reduced&&finishEvent)finishEvent();return;
    }
    if(state.stage==='plan' && el.name==='packageId' && Object.hasOwn(PACKAGES,el.value))state.packageId=el.value;
    else if(state.stage==='plan' && el.name==='fee' && FEES.includes(Number(el.value)))state.fee=Number(el.value);
    else if(state.stage==='revise' && el.name==='altPackage' && Object.hasOwn(PACKAGES,el.value))state.altPackage=el.value;
    else if(state.stage==='revise' && el.name==='altFee' && FEES.includes(Number(el.value)))state.altFee=Number(el.value);
    else return;
    save();render(false,el.id);
  });
  function requireTrim(el,message) {if(!el.value.trim()){el.setCustomValidity(message);el.reportValidity();return false;}el.setCustomValidity('');return true;}
  document.addEventListener('submit',event=>{
    const form=event.target;event.preventDefault();
    if(form.id==='start-form' && state.stage==='welcome') {
      if(!requireTrim(document.getElementById('name1'),'Please enter your name.'))return;
      state.names=state.names.map(n=>n.trim());go('plan');
    } else if(form.id==='plan-form' && state.stage==='plan') {
      if(!form.reportValidity() || !requireTrim(document.getElementById('rationale'),'Write a short reason for your plan.'))return;
      state.original={packageId:state.packageId,fee:state.fee,guess:state.guess,rationale:state.rationale.trim()};
      go('running1');
    } else if(form.id==='reflection-form' && state.stage==='reflect') {
      if(!requireTrim(document.getElementById('reflection1'),'Explain the original result.')||!requireTrim(document.getElementById('reflection2'),'Explain the effect of your change.'))return;
      state.reflections=state.reflections.map(s=>s.trim());state.completedAt=new Date().toISOString();go('complete');
    }
  });
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
    const action=button.dataset.action;
    if(action==='reset') {
      if(!confirm('Start a new tournament? This replaces only this activity’s current local run. Copy or save your summary first.'))return;
      state=newState();save();render(true);
    } else if(action==='skip-event' && finishEvent) finishEvent();
    else if(action==='to-results' && state.stage==='running1')go('results');
    else if(action==='revise' && state.stage==='results')go('revise');
    else if(action==='revision-fee' && state.stage==='revise'){state.revisionType='fee';save();render();document.querySelector('[data-action="revision-fee"]').focus({preventScroll:true});}
    else if(action==='revision-package' && state.stage==='revise'){state.revisionType='package';save();render();document.querySelector('[data-action="revision-package"]').focus({preventScroll:true});}
    else if(action==='run-revision' && state.stage==='revise') {
      const p=revisionPlan();if(!p){toast('Choose a different fee or package. Change only one decision.');return;}
      state.revised=p;go('running2');
    } else if(action==='to-reflect' && state.stage==='running2')go('reflect');
    else if(action==='edit-reflection' && state.stage==='complete')go('reflect');
    else if(action==='copy' && state.stage==='complete') {
      try{await navigator.clipboard.writeText(receiptText());toast('Summary copied. Paste it into your Canvas assignment.');}
      catch{const el=document.getElementById('receipt');el.focus();el.select();toast('Summary selected. Press Ctrl+C or Command+C, then paste into Canvas.');}
    } else if(action==='download' && state.stage==='complete') {
      const blob=new Blob([receiptText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='Break-Even-Arena-summary.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      toast('Text file created. Submit it through your Canvas assignment.');
    } else if(action==='print')window.print();
  });
  window.addEventListener('beforeprint',()=>{if(GUIDE)document.querySelectorAll('details').forEach(d=>d.open=true);});
  render();
  if(restoreWarning)toast(restoreWarning);else if(restored)toast('Your work has been restored from this browser.');
  if(!GUIDE && DEMO && !restored)save();
})();
