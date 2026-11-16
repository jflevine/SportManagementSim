// THE INVESTMENT COMMITTEE — student page. The job is a recommendation in two rounds, so the
// page is a single column a pod can read on one phone: the Round 1 answer stays pinned at the
// top, the file (staff memo, charter, three calls) sits in the middle, and the recommendation
// form is at the bottom. What happens is decided by casefile.mjs.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { formatClock } from '../../simkit/kernel.mjs';
import { esc } from '../../simkit/describe.mjs';

const PREFIX = 'invcom.';
const ss = { get(k) { try { return sessionStorage.getItem(PREFIX + k) || ''; } catch { return ''; } }, set(k, v) { try { sessionStorage.setItem(PREFIX + k, v); } catch { /* fine */ } } };
const time = t => formatClock(cf, t).replace(/^.*? (\d)/, '$1');

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const ui = { busy: false, error: '', notice: '' };
  const view = () => sim.view;
  const local = sim.driver.kind === 'local';
  const acts = id => view().events.filter(e => e.type === 'student.act' && e.act === id);
  const round1 = () => acts('round1')[0]?.params || null;
  const called = w => acts('ask').some(e => e.params.whom === w);
  const draft = k => ss.get((sim.run?.runId || '') + k);

  async function act(action, note) {
    if (ui.busy) return;
    ui.busy = true; ui.error = ''; ui.notice = 'Working…'; render();
    try { await sim.send(action); ui.notice = note || ''; }
    catch (e) { ui.notice = ''; ui.error = e.public ? e.message : 'That did not go through. Nothing was lost and nothing was sent twice. Try again.'; }
    finally { ui.busy = false; render(); }
  }

  function render() {
    const y = window.scrollY;
    root.innerHTML = !view() ? welcome() : view().submitted ? debrief() : desk();
    if (view()) window.scrollTo(0, y);
  }

  function welcome() {
    return `<main class="welcome"><p class="kicker">${esc(cf.course)}</p><h1>The Investment Committee</h1>
      <p class="lede">Your pod advises the investment committee of a league-owned growth fund. The Committee meets at 4:00 PM.</p>
      <ul class="plain"><li><b>Round 1:</b> one question, answered on instinct. Your answer is saved and stays on the page.</li>
        <li><b>Round 2:</b> a staff memo, the Committee’s charter, and time for a few calls. Then you tell the chair what the Committee can do today.</li>
        <li>There is no score. After you send your recommendation you see what the chair said and what happened next.</li></ul>
      <p class="small">This exercise is modelled on the kind of investment vehicle the NFL’s clubs approved in 2026. The League Growth Fund, its charter, the companies, the people and every number here are invented for class.</p>
      <form id="start" class="card"><label>Pod name<input name="team" required maxlength="60" placeholder="e.g. Pod 3"></label>
        <label>Who is in the pod<input name="members" maxlength="200" placeholder="First names"></label>
        <label>Class code from your instructor<input name="classCode" maxlength="40" placeholder="e.g. MGT340-TUE"></label>
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Open the file</button></form>
      <form id="join" class="card slim"><label>Joining your pod from a second device? Enter the pod code<input name="code" maxlength="8" placeholder="6 characters"></label><button ${ui.busy ? 'disabled' : ''}>Join pod</button></form>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}${local ? '<p class="badge">Offline preview: runs in this browser. Nothing is sent anywhere.</p>' : ''}</main>`;
  }

  const top = () => `<header class="top"><strong>League Growth Fund</strong><span>${esc(sim.run.team)} · pod code <b>${esc(sim.run.joinCode)}</b></span><span>Now <b>${time(view().t)}</b> · Committee meets 4:00</span><span>${local ? 'Offline preview' : sim.online ? 'Saved' : 'Reconnecting…'}</span></header>`;
  const status = () => `<div aria-live="polite">${ui.notice ? `<p class="notice">${esc(ui.notice)}</p>` : ''}${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}</div>`;
  const pinned = () => { const r = round1(); return `<section class="pinned" id="round1-pinned"><p class="kicker">Your Round 1 recommendation · saved ${time(acts('round1')[0].t)}</p><p><b>${esc(cf.sectors[r.sector].label)}</b> — <q>${esc(r.reason)}</q></p></section>`; };
  const says = () => view().events.filter(e => e.type === 'actor.message').map(e => { const a = cf.actors[e.from]; return `<article class="msg ${e.from === 'whitlock' ? 'chair' : e.from === 'oyelaran' ? '' : 'them'}"><b>${esc(a.name)}</b><i>${esc(a.role)} · ${time(e.t)}</i><p>${esc(e.text)}</p></article>`; }).join('');

  function desk() {
    const v = view(), r = round1();
    if (!r) return `${top()}<div class="wrap">${status()}${says()}
      <form id="round1" class="card"><p class="kicker">Round 1 · 3 minutes</p><h2>Which industry or business opportunity should the Fund pursue, and why?</h2>
        <label>Choose one<select name="sector" id="r1-sector">${Object.entries(cf.sectors).map(([k, c]) => `<option value="${k}" ${draft('sector') === k ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
        <p class="small">If your pod wrote “Other” on paper, choose the closest of the four.</p>
        <label>Why (one or two sentences)<textarea name="reason" id="r1-reason" maxlength="400" required>${esc(draft('reason'))}</textarea></label>
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Save Round 1</button></form></div>`;
    const docs = v.documents.map(d => d.opened ? `<details class="doc" ${ss.get('open' + d.id) ? 'open' : ''} data-doc="${d.id}"><summary>${esc(d.title)}</summary><pre>${esc(d.body)}</pre></details>`
      : `<button class="docbtn" data-open="${d.id}" ${ui.busy || v.ended ? 'disabled' : ''}>${esc(d.title)}<span>${esc(d.kind)} · tap to read (10 minutes)</span></button>`).join('');
    const calls = Object.entries(cf.asks).map(([w, label]) => `<button data-ask="${w}" ${ui.busy || v.ended || called(w) ? 'disabled' : ''}>${esc(label)}<span>${called(w) ? 'Done. The reply is in the messages above.' : '40 minutes'}</span></button>`).join('');
    const f = id => esc(draft('m' + id));
    return `${top()}<div class="wrap">${status()}${pinned()}
      ${v.ended ? '<p class="notice"><b>It is 4:00 PM.</b> The Committee is seated. Send your recommendation with what you have.</p>' : ''}
      <section>${says()}</section>
      <div class="cols"><section class="card"><p class="kicker">Round 2 · the file</p><h2>Read</h2>${docs}<h2 style="margin-top:1rem">Call</h2><div class="choices">${calls}</div>
        <p class="small">You do not have to make every call. Each one uses time before 4:00.</p></section>
      <form id="memo" class="card"><p class="kicker">Round 2 · your recommendation to the chair</p>
        ${cf.memoFields.map(m => m.type === 'select'
          ? `<label>${esc(m.label)}<select name="${m.id}" id="memo-${m.id}"><option value="">Choose…</option>${m.options.map(([k, l]) => `<option value="${k}" ${draft('m' + m.id) === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`
          : `<label>${esc(m.label)}<textarea name="${m.id}" id="memo-${m.id}" maxlength="600">${f(m.id)}</textarea></label>`).join('')}
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Send to the Committee</button><p class="small">You can send once. Your Round 1 answer is sent with it.</p></form></div></div>`;
  }

  function debrief() {
    const o = view().debrief, m = o.final;
    const row = (l, t) => t ? `<h3>${esc(l)}</h3><p>${esc(t)}</p>` : '';
    return `${top()}<div class="wrap"><p class="notice">Sent ${time(view().submitted.t)} and saved. Your instructor can see this file.</p>
      <h1>What the Committee did with it</h1>
      <div class="pair"><div><p class="kicker">Round 1 · before the file</p><h2>${esc(o.round1.sector)}</h2><p>${esc(o.round1.why)}</p></div>
        <div><p class="kicker">Round 2 · after the file</p><h2>${esc(m.call)}</h2>${row('Agreement needed from', m.consent)}${row('Authorize today', m.authorize)}${row('In writing', m.condition)}${row('Relying on', m.evidence)}${row('Still to check', m.unknown)}</div></div>
      <article class="msg chair"><b>${esc(cf.actors.whitlock.name)}</b><i>${esc(cf.actors.whitlock.role)}</i><p>${esc(o.chair)}</p></article>
      <section class="later"><h2>Afterward</h2>${o.later.map(t => `<p>${esc(t)}</p>`).join('')}</section>
      <section class="card"><h2>What your pod had in hand when it recommended</h2><ul class="ticks">${o.record.map(r => `<li class="${r.done ? '' : 'no'}">${r.done ? '✓' : '○'} ${esc(r.label)}</li>`).join('')}</ul>
        <p class="small" style="margin-top:.6rem"><b>${esc(o.company)}</b>’s plan depended on ${esc(o.right)}. That is controlled by: ${esc(o.holder.toLowerCase())}. What staff never confirmed: ${esc(o.stillOpen)}</p></section>
      <section class="card"><p class="kicker">For the debrief</p><h2>What could your committee authorize today, what would it need someone else to agree to, and which document or fact tells you that?</h2>
        <p>Look at Round 1 beside Round 2. What did your first answer assume the Fund could deliver on its own?</p></section>
      <p><button data-leave>Start a new file on this device</button></p></div>`;
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.open) { ss.set('open' + t.dataset.open, '1'); return act({ type: 'open', doc: t.dataset.open }); }
    if (t.dataset.ask) return act({ type: 'act', act: 'ask', params: { whom: t.dataset.ask } }, 'The reply is in the messages above the file.');
    if (t.dataset.leave !== undefined && confirm('Leave this file on this device? The submitted file stays saved for your instructor.')) { sim.leave(); render(); }
  });
  root.addEventListener('toggle', e => { const d = e.target.closest?.('details.doc'); if (d) ss.set('open' + d.dataset.doc, d.open ? '1' : ''); }, true);
  root.addEventListener('input', e => { const t = e.target; if (t.id?.startsWith('memo-')) ss.set(sim.run.runId + 'm' + t.name, t.value); if (t.id?.startsWith('r1-')) ss.set((sim.run?.runId || '') + t.name, t.value); });
  root.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f));
    if (f.id === 'start' || f.id === 'join') {
      ui.busy = true; ui.error = ''; render();
      try { if (f.id === 'start') await sim.start({ team: data.team, members: data.members, classCode: data.classCode, mode: local ? 'test' : 'live' }); else await sim.join(data.code); }
      catch (err) { ui.error = err.public ? err.message : 'Could not reach the server. Check the connection and try again.'; }
      ui.busy = false; return render();
    }
    if (f.id === 'round1') return act({ type: 'act', act: 'round1', params: data }, 'Round 1 saved. It stays at the top of this page.');
    if (f.id === 'memo') return act({ type: 'submit', memo: data });
  });

  try { await sim.resume(); } catch { ui.error = 'The server could not be reached. Check the connection and reload; your pod’s work is saved.'; }
  render();

  if (!local) setInterval(async () => {
    if (!view() || ui.busy || document.hidden || view().submitted) return;
    const before = view().seq; try { await sim.refresh(); } catch { return; }
    if (view().seq === before) return;
    const el = document.activeElement, id = el?.id, pos = el?.selectionStart;
    ui.notice = 'A teammate just acted on another device. This page is up to date.'; render();
    const again = id && root.querySelector('#' + CSS.escape(id)); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch { /* not text */ } }
  }, 6000);
}
