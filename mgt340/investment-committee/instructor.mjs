// Instructor room. Patterns reused from the reference room (live board, signals, timeline with
// "why", two-pod projector with a question for the room). The casefile supplies everything
// case-specific: cardLine, signals, lenses and describeEvent.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { reduce, formatClock } from '../../simkit/kernel.mjs';
import { describe, esc } from '../../simkit/describe.mjs';

const KEY = cf.id + '.instructor';
const mem = {};
const saved = { get() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch { return mem; } }, set(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { Object.assign(mem, v); } } };

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const local = sim.driver.kind === 'local';
  const ui = { key: '', classCode: '', ...saved.get(), runs: [], error: '', open: null, pick: [], project: false, loaded: false, lens: null };
  const time = t => formatClock(cf, t).replace(/^.*? (\d)/, '$1');
  if (local) ui.classCode = '';

  // Offline preview: play the casefile's scripted sample pods so the room is not empty.
  async function seed() {
    const have = (await sim.driver.call('instructor.runs', { caseId: cf.id })).runs.map(r => r.team);
    for (const s of cf.samples) {
      if (have.includes(s.team)) continue;
      const run = await sim.driver.call('start', { caseId: cf.id, team: s.team, members: s.members, classCode: 'PREVIEW' });
      for (const action of s.steps) await sim.driver.call('act', { runId: run.runId, token: run.token, requestId: crypto.randomUUID(), action });
    }
  }
  async function load(quiet) {
    try { const res = await sim.instructor(ui.key, ui.classCode); ui.runs = res.runs.map(r => ({ ...r, s: reduce(cf, r.events) })); ui.loaded = true; ui.error = ''; }
    catch (e) { if (!quiet) ui.error = e.public ? e.message : 'Could not reach the server.'; }
  }
  const run = id => ui.runs.find(r => r.runId === id);
  const status = r => r.s.submitted ? ['Sent', 'done'] : r.s.ended ? ['Out of time', 'warn'] : ['Working', 'live'];

  function render() {
    root.innerHTML = ui.project ? projector() : `<div class="room">
      <header class="bar"><div><strong>${esc(cf.title)}</strong><span>Instructor room · ${esc(cf.course)}</span></div>
        <form id="gate" class="gate">${local ? '<span class="badge">Offline preview · sample pods are fictional</span>' : `<label>Instructor key<input name="key" type="password" value="${esc(ui.key)}" autocomplete="off"></label>`}
          <label>Class code<input name="classCode" value="${esc(ui.classCode)}" placeholder="all"></label><button>Show pods</button></form></header>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
      ${!ui.loaded ? '<p class="empty pad">Enter the instructor key to see pods.</p>' : `
      <section><div class="board-head"><h2>${ui.runs.length} pod${ui.runs.length === 1 ? '' : 's'}</h2><p class="small">Tick two pods to put them side by side. Click a pod to see its timeline.</p>
        <button data-compare ${ui.pick.length === 2 ? '' : 'disabled'} class="primary">Compare ${ui.pick.length}/2 selected</button></div>
        <div class="cards">${ui.runs.map(card).join('') || '<p class="empty">No pods yet for this class code.</p>'}</div></section>
      ${ui.open && run(ui.open) ? detail(run(ui.open)) : ''}`}</div>`;
  }
  function card(r) {
    const [label, tone] = status(r);
    return `<article class="team ${ui.open === r.runId ? 'on' : ''}"><label class="tick"><input type="checkbox" data-pick="${r.runId}" ${ui.pick.includes(r.runId) ? 'checked' : ''}><span class="sr">Select ${esc(r.team)}</span></label>
      <button class="open" data-open="${r.runId}"><h3>${esc(r.team)}</h3><p class="small">${esc(r.members || '')}</p><p><span class="pill ${tone}">${label}</span> ${esc(cf.cardLine(r.s))}</p>
      <div class="chips">${cf.signals(r.s).map(c => `<span class="chip ${c.tone}">${esc(c.label)}</span>`).join('')}</div></button></article>`;
  }
  function detail(r) {
    const rows = r.events.map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor);
    return `<section style="margin-top:1.2rem"><h2>${esc(r.team)} · timeline</h2><p class="small">Grey lines are things the pod could not see while working.</p>
      <div class="timeline">${rows.map(({ e, d }) => `<div class="ev ${d.kind} ${d.why ? 'why' : ''}"><span class="small">${time(e.t)}</span> ${esc(d.text)}</div>`).join('')}</div></section>`;
  }
  function projector() {
    const [a, b] = ui.pick.map(run);
    const rows = cf.lenses.map(l => ({ l, va: l.value(a.s), vb: l.value(b.s) }));
    const diff = rows.filter(x => x.va !== x.vb), lens = diff.find(x => x.l.id === ui.lens) || diff[0];
    const said = r => (cf.projectorQuote?.(r.s) || '');
    return `<div class="room project"><p style="padding-top:1rem"><button data-back>← Back to the room</button></p><h1>${esc(cf.title)} · two pods, same file</h1>
      <table class="lens"><thead><tr><th></th><th>${esc(a.team)}</th><th>${esc(b.team)}</th></tr></thead><tbody>
        ${said(a) || said(b) ? `<tr><th>In their words</th><td>${esc(said(a))}</td><td>${esc(said(b))}</td></tr>` : ''}
        ${rows.map(x => `<tr class="${x.va !== x.vb ? 'diff' : ''}"><th>${esc(x.l.label)}</th><td>${esc(x.va)}</td><td>${esc(x.vb)}</td></tr>`).join('')}</tbody></table>
      ${lens ? `<section class="card"><p class="kicker">Question for the room</p><h2 class="q">${esc(lens.l.question)}</h2><p>${diff.map(x => `<button data-lens="${x.l.id}" ${x === lens ? 'class="primary"' : ''}>${esc(x.l.label)}</button>`).join(' ')}</p></section>`
        : '<section class="card"><h2>These two pods made the same choices at every point. Pick a different pair.</h2></section>'}</div>`;
  }

  root.addEventListener('submit', async e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); ui.key = d.key ?? ui.key; ui.classCode = (d.classCode || '').trim(); saved.set({ key: ui.key, classCode: ui.classCode }); await load(); render(); });
  root.addEventListener('change', e => { const t = e.target; if (t.dataset.pick) { ui.pick = t.checked ? [...ui.pick, t.dataset.pick].slice(-2) : ui.pick.filter(x => x !== t.dataset.pick); render(); } });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.open) ui.open = ui.open === b.dataset.open ? null : b.dataset.open;
    else if ('compare' in b.dataset) { ui.project = true; ui.lens = null; }
    else if ('back' in b.dataset) ui.project = false;
    else if (b.dataset.lens) ui.lens = b.dataset.lens;
    else return;
    render();
  });

  if (local) await seed();
  if (local || ui.key) await load();
  render();
  setInterval(async () => { if (root.isConnected && ui.loaded && !ui.project && !document.hidden && !document.activeElement?.matches('input')) { await load(true); render(); } }, 6000);
}
