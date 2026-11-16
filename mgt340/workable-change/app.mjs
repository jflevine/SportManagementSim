// NEGOTIATE A WORKABLE CHANGE — student page. The job is to put one term across a table and
// adjust it when the other side answers, so the page keeps the three terms and the running
// exchange in view, on one phone-width column. What the other side says is decided by
// casefile.mjs from the term and the move the pod actually chose.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { esc } from '../../simkit/describe.mjs';

const PREFIX = 'workable.';
const ss = { get(k) { try { return sessionStorage.getItem(PREFIX + k) || ''; } catch { return ''; } }, set(k, v) { try { sessionStorage.setItem(PREFIX + k, v); } catch { /* fine */ } } };

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const ui = { busy: false, error: '', notice: '' };
  const view = () => sim.view;
  const local = sim.driver.kind === 'local';
  const acts = id => view().events.filter(e => e.type === 'student.act' && e.act === id);
  const role = () => acts('side')[0]?.params.role || null;
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
    return `<main class="welcome"><p class="kicker">${esc(cf.course)}</p><h1>Negotiate a Workable Change</h1>
      <p class="lede">A league office wants players to wear sensors in games and wants the data on the broadcast. Your pod sits on one side of the table.</p>
      <ul class="plain"><li>Read what the current agreement says and what the league proposes.</li>
        <li>Put one term to the other side in your own words. They answer what you actually proposed.</li>
        <li>You may make up to three proposals. Then report to the people you represent.</li></ul>
      <p class="small">The summary of the current agreement is drawn from the NBA–NBPA collective bargaining agreement. The league’s proposal, the people, the instructions and every response are invented for class.</p>
      <form id="start" class="card"><label>Pod name<input name="team" required maxlength="60" placeholder="e.g. Pod 3"></label>
        <label>Who is in the pod<input name="members" maxlength="200" placeholder="First names"></label>
        <label>Class code from your instructor<input name="classCode" maxlength="40" placeholder="e.g. MGT340-THU"></label>
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Open the file</button></form>
      <form id="join" class="card slim"><label>Joining your pod from a second device? Enter the pod code<input name="code" maxlength="8" placeholder="6 characters"></label><button ${ui.busy ? 'disabled' : ''}>Join pod</button></form>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}${local ? '<p class="badge">Offline preview: runs in this browser. Nothing is sent anywhere.</p>' : ''}</main>`;
  }
  const top = () => `<header class="top"><strong>${role() ? esc(cf.roles[role()].title) : 'Negotiate a Workable Change'}</strong><span>${esc(sim.run.team)} · pod code <b>${esc(sim.run.joinCode)}</b></span><span>${local ? 'Offline preview' : sim.online ? 'Saved' : 'Reconnecting…'}</span></header>`;
  const status = () => `<div aria-live="polite">${ui.notice ? `<p class="notice">${esc(ui.notice)}</p>` : ''}${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}</div>`;
  const what = p => `${cf.terms[p.term].label}: ${p.move === 'revise' ? 'revise — ' + cf.levers[p.lever].toLowerCase() : cf.moves[p.move].toLowerCase()}`;
  const stanceOf = text => Object.entries(cf.stance).find(([, l]) => text.startsWith(l + '.'))?.[0] || '';
  // The running exchange: each proposal, then the other side's reply and its stance.
  function exchange() {
    const ev = view().events, out = [];
    for (const e of ev) {
      if (e.type === 'student.act' && e.act === 'propose') out.push(`<article class="msg"><b>Your pod proposed</b><i>${esc(what(e.params))}</i><p>“${esc(e.params.wording)}”</p></article>`);
      if (e.type === 'actor.message') { const a = cf.actors[e.from], note = ev.find(n => n.type === 'note' && n.seq > e.seq), st = note ? stanceOf(note.text) : '';
        out.push(`<article class="msg them"><b>${esc(a.name)} ${st ? `<span class="stance ${st}">${esc(cf.stance[st])}</span>` : ''}</b><i>${esc(a.role)}</i><p>${esc(e.text)}</p></article>`); }
    }
    return out.join('');
  }

  function desk() {
    const v = view(), r = role();
    if (!r) return `${top()}<div class="wrap">${status()}<form id="side" class="card"><p class="kicker">Before you start</p><h2>Which side did your instructor assign your pod?</h2>
      <div class="choices">${Object.entries(cf.roles).map(([k, x]) => `<button name="role" value="${k}" ${ui.busy ? 'disabled' : ''}>${esc(x.label)}<span>${esc(x.title)}</span></button>`).join('')}</div></form></div>`;
    const left = cf.maxProposals - acts('propose').length;
    const docs = v.documents.map(d => d.opened ? `<details class="doc" ${ss.get('open' + d.id) ? 'open' : ''} data-doc="${d.id}"><summary>${esc(d.title)}</summary><pre>${esc(d.body)}</pre></details>`
      : `<button class="docbtn" data-open="${d.id}" ${ui.busy ? 'disabled' : ''}>${esc(d.title)}<span>${esc(d.kind)} · tap to read</span></button>`).join('');
    const sel = (name, opts, id) => `<select name="${name}" id="${id}">${opts.map(([k, l]) => `<option value="${k}" ${draft(id) === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const revising = (draft('p-move') || 'accept') === 'revise';
    return `${top()}<div class="wrap">${status()}
      <section class="pinned"><p class="kicker">Your side</p><p><b>${esc(cf.roles[r].label)}</b> — across the table: ${esc(cf.actors[cf.roles[r].counterpart].name)}, ${esc(cf.actors[cf.roles[r].counterpart].role.toLowerCase())}</p></section>
      <div class="cols"><section class="card"><p class="kicker">Read first</p>${docs}
        <h2 style="margin-top:1rem">The three proposed terms</h2>${Object.values(cf.terms).map(t => `<div class="term"><b>${esc(t.label)}</b><br>${esc(t.text)}</div>`).join('')}</section>
      <section><div id="exchange">${exchange() || '<p class="empty">Nothing has been put across the table yet.</p>'}</div>
        ${left > 0 ? `<form id="propose" class="card"><p class="kicker">Put a term to the other side · ${left} of ${cf.maxProposals} left</p>
          <label>Term${sel('term', Object.entries(cf.terms).map(([k, t]) => [k, t.label]), 'p-term')}</label>
          <label>Your move${sel('move', Object.entries(cf.moves), 'p-move')}</label>
          ${revising ? `<label>What your revision does${sel('lever', Object.entries(cf.levers), 'p-lever')}</label>` : ''}
          <label>Your wording<textarea name="wording" id="p-wording" maxlength="500" required placeholder="Write the term the way you would want it to read, or say why you accept, reject or defer it.">${esc(draft('p-wording'))}</textarea></label>
          <button class="primary" ${ui.busy ? 'disabled' : ''}>Put it across the table</button></form>` : '<p class="notice">You have made all three proposals. Report to your side.</p>'}
        <form id="memo" class="card"><p class="kicker">Report to your side</p>
          ${cf.memoFields.map(m => m.type === 'select' ? `<label>${esc(m.label)}<select name="${m.id}" id="memo-${m.id}"><option value="">Choose…</option>${m.options.map(([k, l]) => `<option value="${k}" ${draft('memo-' + m.id) === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`
            : `<label>${esc(m.label)}<textarea name="${m.id}" id="memo-${m.id}" maxlength="600">${esc(draft('memo-' + m.id))}</textarea></label>`).join('')}
          <button class="primary" ${ui.busy ? 'disabled' : ''}>Send the report</button><p class="small">You can send once.</p></form></section></div></div>`;
  }

  function debrief() {
    const o = view().debrief, pr = cf.actors[o.principal];
    const row = (l, t) => t ? `<h3>${esc(l)}</h3><p>${esc(t)}</p>` : '';
    return `${top()}<div class="wrap"><p class="notice">Report sent and saved. Your instructor can see this file.</p><h1>What your side did with it</h1>
      <section class="card"><p class="kicker">${esc(o.role)} · reporting on ${esc(o.term.label)}</p><p><i>As the league first wrote it:</i> ${esc(o.term.text)}</p>
        ${row('As your pod would now write it', o.final.wording)}${row('Agreement needed from', o.final.consent)}${row('Why', o.final.reason)}${row('Relying on', o.final.evidence)}${row('What changed because the other side had a say', o.final.changed)}</section>
      <h2>Across the table</h2>${o.exchanges.map(x => `<article class="msg"><b>Your pod proposed</b><i>${esc(x.what)}</i><p>“${esc(x.wording)}”</p></article><article class="msg them"><b>${esc(cf.actors[o.counterpart].name)} <span class="stance ${x.stance === 'Agrees' ? 'agree' : x.stance === 'Counters' ? 'counter' : 'refuse'}">${esc(x.stance)}</span></b><p>${esc(x.reply)}</p></article>`).join('') || '<p class="empty">Your pod reported without putting anything to the other side.</p>'}
      <article class="msg chair"><b>${esc(pr.name)}</b><i>${esc(pr.role)}</i><p>${esc(o.principalSaid)}</p></article>
      <section class="later"><h2>Afterward</h2>${o.later.map(t => `<p>${esc(t)}</p>`).join('')}</section>
      <section class="card"><p class="kicker">For the debrief</p><h2>What changed in the proposal because another party had a meaningful say?</h2>
        <ul class="ticks"><li class="${o.read.current ? '' : 'no'}">${o.read.current ? '✓' : '○'} Read the current agreement before reporting</li><li class="${o.read.brief ? '' : 'no'}">${o.read.brief ? '✓' : '○'} Read your side’s instructions</li></ul></section>
      <p><button data-leave>Start a new file on this device</button></p></div>`;
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.open) { ss.set('open' + t.dataset.open, '1'); return act({ type: 'open', doc: t.dataset.open }); }
    if (t.name === 'role') { e.preventDefault(); return act({ type: 'act', act: 'side', params: { role: t.value } }); }
    if (t.dataset.leave !== undefined && confirm('Leave this file on this device? The report stays saved for your instructor.')) { sim.leave(); render(); }
  });
  root.addEventListener('toggle', e => { const d = e.target.closest?.('details.doc'); if (d) ss.set('open' + d.dataset.doc, d.open ? '1' : ''); }, true);
  const keep = e => { const t = e.target; if (t.id?.startsWith('memo-') || t.id?.startsWith('p-')) ss.set(sim.run.runId + t.id, t.value); };
  root.addEventListener('input', keep);
  root.addEventListener('change', e => { keep(e); if (e.target.id === 'p-move') render(); });
  root.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f));
    if (f.id === 'start' || f.id === 'join') {
      ui.busy = true; ui.error = ''; render();
      try { if (f.id === 'start') await sim.start({ team: data.team, members: data.members, classCode: data.classCode, mode: local ? 'test' : 'live' }); else await sim.join(data.code); }
      catch (err) { ui.error = err.public ? err.message : 'Could not reach the server. Check the connection and try again.'; }
      ui.busy = false; return render();
    }
    if (f.id === 'propose') { await act({ type: 'act', act: 'propose', params: data }); if (!ui.error) { ss.set(sim.run.runId + 'p-wording', ''); render(); root.querySelector('#exchange')?.lastElementChild?.scrollIntoView({ block: 'center' }); } return; }
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
