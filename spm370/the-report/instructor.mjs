// THE REPORT — instructor room. Built for running a class, not for grading afterwards:
// see every team at once, open one team's chain of cause and effect, check what any
// character knew at any moment, and put two contrasting teams on the projector.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { reduce, formatClock, causalChain, briefFor, YOU } from '../../simkit/kernel.mjs';
import { describe, esc } from '../../simkit/describe.mjs';

const KEY = 'thereport.instructor';
const mem = {};
const saved = { get() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch { return mem; } }, set(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { Object.assign(mem, v); } } };

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const local = sim.driver.kind === 'local';
  const ui = { ...{ key: '', classCode: '' }, ...saved.get(), runs: [], error: '', open: null, moment: null, tab: 'chain', pick: [], project: false, loaded: false, actor: 'rin' };
  const fmt = t => formatClock(cf, t);
  const who = id => id === YOU ? 'Student' : cf.actors[id].name.split(' ')[0];


  // Offline preview: play the casefile's scripted sample teams so the room is not empty.
  async function seed() {
    const have = (await sim.driver.call('instructor.runs', { caseId: cf.id })).runs.map(r => r.team);
    for (const s of cf.samples) {
      if (have.includes(s.team)) continue;
      const run = await sim.driver.call('start', { caseId: cf.id, team: s.team, members: s.members, classCode: 'PREVIEW' });
      for (const action of s.steps) await sim.driver.call('act', { runId: run.runId, token: run.token, requestId: crypto.randomUUID(), action });
    }
  }
  async function load(quiet) {
    try {
      const res = await sim.instructor(ui.key, ui.classCode);
      ui.runs = res.runs.map(r => ({ ...r, s: reduce(cf, r.events) })); ui.loaded = true; ui.error = '';
    } catch (e) { if (!quiet) ui.error = e.public ? e.message : 'Could not reach the server.'; }
  }
  const run = id => ui.runs.find(r => r.runId === id);
  const status = r => r.s.submitted ? ['Closed', 'done'] : r.s.ended ? ['Out of time', 'warn'] : ['Working', 'live'];
  const idle = r => { const last = r.events[r.events.length - 1]?.wall; return last ? Math.max(0, Math.round((Date.now() - new Date(last)) / 60000)) : 0; };

  function render() {
    const keepScroll = root.querySelector('.timeline')?.scrollTop;
    root.innerHTML = ui.project ? projector() : `<div class="room">
      <header class="bar"><div><strong>The Report</strong><span>Instructor room · ${esc(cf.course)}</span></div>
        <form id="gate" class="gate">${local ? '<span class="badge">Offline preview · sample teams are fictional</span>' : `<label>Instructor key<input name="key" type="password" value="${esc(ui.key)}" autocomplete="off"></label>`}
          <label>Class code<input name="classCode" value="${esc(ui.classCode)}" placeholder="all"></label><button>Show teams</button></form></header>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
      ${!ui.loaded ? '<p class="empty pad">Enter the instructor key to see teams.</p>' : `
      <section class="board"><div class="board-head"><h2>${ui.runs.length} team${ui.runs.length === 1 ? '' : 's'}</h2>
        <p class="small">Tick two teams to compare them. Click a team to open its file.</p>
        <button data-compare ${ui.pick.length === 2 ? '' : 'disabled'} class="primary">Compare ${ui.pick.length}/2 selected</button></div>
        <div class="cards">${ui.runs.map(card).join('') || '<p class="empty">No teams yet for this class code.</p>'}</div></section>
      ${ui.open && run(ui.open) ? detail(run(ui.open)) : ''}`}
    </div>`;
    const tl = root.querySelector('.timeline'); if (tl && keepScroll != null) tl.scrollTop = keepScroll;
  }

  function card(r) {
    const [label, tone] = status(r); const m = idle(r);
    return `<article class="card team ${ui.open === r.runId ? 'on' : ''}">
      <label class="tick"><input type="checkbox" data-pick="${r.runId}" ${ui.pick.includes(r.runId) ? 'checked' : ''}><span class="sr">Select ${esc(r.team)}</span></label>
      <button class="open" data-open="${r.runId}"><h3>${esc(r.team)}</h3><p class="small">${esc(r.members || '')}</p>
        <p class="state"><span class="pill ${tone}">${label}</span> <b>${fmt(r.s.t)}</b>${tone === 'live' && !local && m >= 4 ? ` <span class="pill warn">quiet ${m} min</span>` : ''}</p>
        <div class="chips">${cf.signals(r.s).map(c => `<span class="chip ${c.tone}">${esc(c.label)}</span>`).join('') || '<span class="chip">Has not answered Rin yet</span>'}</div></button></article>`;
  }

  function detail(r) {
    const moment = ui.moment ?? r.s.seq;
    const rows = r.events.map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor);
    const at = reduce(cf, r.events, moment);
    const chainFrom = ui.moment ?? ([...r.events].reverse().find(e => e.type === 'actor.message' && e.rule)?.seq || moment);
    return `<section class="detail"><header><h2>${esc(r.team)}</h2><p class="small">Click any line to set “the moment”. The panels on the right show the world as of that line.</p></header>
      <div class="split"><ol class="timeline">${rows.map(({ e, d }) => `<li class="${d.kind} ${d.why ? 'because' : ''} ${e.seq === moment ? 'now' : ''} ${e.seq > moment ? 'later' : ''}"><button data-moment="${e.seq}"><span class="when">${fmt(e.t)}</span><span>${esc(d.text)}${d.acts?.length ? ` <i class="acts">read as: ${d.acts.map(a => a.replace(/_/g, ' ')).join(', ')}</i>` : ''}${d.source === 'ai' ? ' <i class="acts">AI voice</i>' : ''}</span></button></li>`).join('')}</ol>
      <div class="inspect"><nav class="tabs">${[['chain', 'Why this happened'], ['knows', 'Who knew what'], ['brief', 'A character’s briefing']].map(([k, l]) => `<button data-tab="${k}" class="${ui.tab === k ? 'on' : ''}">${l}</button>`).join('')}</nav>
        <p class="small">As of ${fmt(at.t)}</p>
        ${ui.tab === 'chain' ? `<ol class="chain">${causalChain(r.events, chainFrom).map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor || x.d.why).map(({ e, d }) => `<li class="${d.why ? 'because' : d.kind}"><span class="when">${fmt(e.t)}</span> ${esc(d.text)}</li>`).join('')}</ol>`
        : ui.tab === 'knows' ? knowsTable(at)
        : briefPanel(at)}
      </div></div></section>`;
  }

  function knowsTable(s) {
    const cols = [YOU, ...Object.keys(cf.actors).filter(a => cf.actors[a].reachable !== false)];
    return `<table class="knows"><thead><tr><th>Fact</th>${cols.map(c => `<th>${esc(who(c))}</th>`).join('')}</tr></thead><tbody>
      ${Object.entries(cf.facts).map(([fid, f]) => `<tr><td>${esc(f.text)}</td>${cols.map(c => { const k = s.knows[c][fid]; return `<td class="${k ? 'yes' : ''}" title="${k ? 'via ' + esc(k.via === 'start' ? 'already knew' : k.via.startsWith('doc:') ? 'a document' : who(k.via)) + ' at ' + fmt(k.t) : 'does not know'}">${k ? (k.via === 'start' ? '●' : '◆') : ''}</td>`; }).join('')}</tr>`).join('')}
      </tbody></table><p class="small">● knew from the start · ◆ learned during play (hover for how and when)</p>`;
  }

  function briefPanel(s) {
    const b = briefFor(cf, s, ui.actor);
    return `<div class="brief"><label>Character <select data-actor>${Object.entries(cf.actors).filter(([, a]) => a.reachable !== false).map(([id, a]) => `<option value="${id}" ${id === ui.actor ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      <p class="small">This is everything the voice for this person is given at this moment. Nothing else about the situation reaches it.</p>
      <dl><dt>On their mind</dt><dd>${esc(b.concern)}</dd><dt>Wants</dt><dd>${esc(b.wants)}</dd><dt>Fears</dt><dd>${esc(b.fears)}</dd><dt>Sounds like</dt><dd>${esc(b.voice)}</dd>
      <dt>Knows</dt><dd><ul>${b.knows.map(f => `<li>${esc(f.text)}${f.guarded ? ' <i class="acts">keeps this to themselves</i>' : ''}</li>`).join('')}</ul></dd></dl></div>`;
  }

  function projector() {
    const [a, b] = ui.pick.map(run);
    const lenses = cf.lenses.map(l => ({ l, va: l.value(a.s), vb: l.value(b.s) }));
    const diff = lenses.filter(x => x.va !== x.vb);
    const lens = diff.find(x => x.l.id === ui.lens) || diff[0];
    const said = r => r.events.find(e => e.type === 'student.message' && e.to === 'rin')?.text;
    const end = r => cf.outcome(r.s, r.events).people.map(p => `<li><b>${esc(p.who)}:</b> ${esc(p.headline)}</li>`).join('');
    return `<div class="projector"><header><button data-back>← Back to the room</button><span>${esc(cf.title)} · two teams, same Thursday</span></header>
      <div class="versus">${[a, b].map(r => `<section><h2>${esc(r.team)}</h2>
        ${said(r) ? `<p class="kicker">First words to Rin</p><blockquote>“${esc(said(r))}”</blockquote>` : '<p class="kicker">Never replied to Rin</p>'}
        <table>${lenses.map(x => `<tr class="${x.va !== x.vb ? 'differs' : ''}"><th>${esc(x.l.label)}</th><td>${esc(r === a ? x.va : x.vb)}</td></tr>`).join('')}</table>
        <p class="kicker">By Monday</p><ul>${end(r)}</ul></section>`).join('')}</div>
      ${lens ? `<footer><p class="kicker">Question for the room</p><p class="question">${esc(lens.l.question)}</p>
        <div class="lenses">${diff.map(x => `<button data-lens="${x.l.id}" class="${x === lens ? 'on' : ''}">${esc(x.l.label)}</button>`).join('')}</div></footer>`
        : '<footer><p class="question">These two teams made the same choices at every decision point. Pick a different pair.</p></footer>'}</div>`;
  }

  root.addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    ui.key = d.key ?? ui.key; ui.classCode = (d.classCode || '').trim(); saved.set({ key: ui.key, classCode: ui.classCode });
    await load(); render();
  });
  root.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.pick) { ui.pick = t.checked ? [...ui.pick, t.dataset.pick].slice(-2) : ui.pick.filter(x => x !== t.dataset.pick); render(); }
    if ('actor' in t.dataset) { ui.actor = t.value; render(); }
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.open) { ui.open = ui.open === b.dataset.open ? null : b.dataset.open; ui.moment = null; }
    else if (b.dataset.moment) ui.moment = +b.dataset.moment;
    else if (b.dataset.tab) ui.tab = b.dataset.tab;
    else if ('compare' in b.dataset) { ui.project = true; ui.lens = null; }
    else if ('back' in b.dataset) ui.project = false;
    else if (b.dataset.lens) ui.lens = b.dataset.lens;
    else return;
    render();
  });

  if (local) await seed();
  if (local || ui.key) await load();
  render();
  setInterval(async () => { if (ui.loaded && !ui.project && !document.hidden) { await load(true); render(); } }, 6000);
}
