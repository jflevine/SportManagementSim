// TWO FEEDS — student page: a reading table. Two documents (or a document and a
// conversation) sit side by side; clauses are pinned as the basis for advice; the advice
// form on the right is what the CEO will act on. This is not The Report's desk: here the
// work is reading and comparing, and talking is how you fill a gap the documents leave.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { formatClock, causalChain } from '../../simkit/kernel.mjs';
import { describe, esc } from '../../simkit/describe.mjs';

const first = n => n.split(' ')[0];
const D = 'twofeeds.';
const draft = { get(k) { try { return sessionStorage.getItem(D + k) || ''; } catch { return ''; } }, set(k, v) { try { sessionStorage.setItem(D + k, v); } catch { /* fine */ } } };

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const ui = { slots: JSON.parse(draft.get('slots') || 'null') || [{ kind: 'thread', id: 'imani' }, { kind: 'thread', id: 'mateo' }], active: 0, busy: false, error: '', notice: '', showDebrief: true };
  const view = () => sim.view;
  const fmt = t => formatClock(cf, t);
  const thread = id => view().events.filter(e => (e.type === 'student.message' && e.to === id) || (e.type === 'actor.message' && e.from === id));
  const pinned = () => { const s = new Set(); for (const e of view().events) if (e.type === 'student.act') { if (e.act === 'pin') s.add(e.params.clause); if (e.act === 'unpin') s.delete(e.params.clause); } return [...s]; };
  const clauseText = id => { for (const d of Object.values(cf.documents)) { const c = d.body.find(x => x.id === id); if (c) return c.text; } return ''; };
  const advice = () => { try { return JSON.parse(draft.get('advice') || '{}'); } catch { return {}; } };

  try { await sim.resume(); } catch { ui.error = 'The server could not be reached. Reload the page; your team’s work is saved.'; }
  render();
  if (sim.driver.kind === 'remote') setInterval(async () => {
    if (!view() || ui.busy || document.hidden || view().submitted) return;
    const before = view().seq; try { await sim.refresh(); } catch { return; }
    if (view().seq === before) return;
    const el = document.activeElement, key = el?.id, pos = el?.selectionStart;
    ui.notice = 'A teammate just acted. This page is up to date.'; render();
    const again = key && root.querySelector('#' + CSS.escape(key)); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch { /* not text */ } }
  }, 6000);

  async function act(action, after) {
    if (ui.busy) return; ui.busy = true; ui.error = ''; render();
    try { await sim.send(action); ui.notice = ''; after?.(); }
    catch (e) { ui.error = e.public ? e.message : 'That did not go through. Nothing was lost and nothing was sent twice. Try again.'; }
    finally { ui.busy = false; render(); }
  }
  function put(slot) { ui.slots[ui.active] = slot; ui.active = ui.active ? 0 : 1; draft.set('slots', JSON.stringify(ui.slots)); }

  function render() {
    const keep = [...root.querySelectorAll('.tf-slot-body')].map(e => e.scrollTop);
    root.innerHTML = view() ? table() : welcome();
    root.querySelectorAll('.tf-slot-body').forEach((e, i) => { e.scrollTop = e.classList.contains('tf-log') ? e.scrollHeight : (keep[i] || 0); });
  }

  function welcome() {
    return `<main class="tf-welcome"><p class="tf-kicker">${esc(cf.course)}</p><h1>Two Feeds</h1>
      <p class="tf-lede">You are the <strong>Business &amp; Legal Affairs Associate</strong> at Ninth Street Events. It is Thursday, 3:00 PM. The Grand Final is Saturday at 6:00 PM, and two partners each say the broadcast is theirs.</p>
      <ul><li>Your CEO will send exactly what you advise, and nothing you leave out.</li>
      <li>Reading a document takes 20 minutes of the afternoon; a message takes 15. Pinning a clause is free.</li>
      <li>You are not asked what a court would do. Work from what the documents say and what people tell you.</li></ul>
      <form id="start" class="tf-card"><label>Team name<input name="team" required maxlength="60" placeholder="e.g. Pod 2"></label>
        <label>Who is on the team<input name="members" maxlength="200" placeholder="First names"></label>
        <label>Class code from your instructor<input name="classCode" maxlength="40" placeholder="e.g. SPM370"></label>
        <button class="tf-primary" ${ui.busy ? 'disabled' : ''}>Open the binder</button></form>
      <form id="join" class="tf-card tf-slim"><label>Joining teammates on another device? Team code<input name="code" maxlength="8"></label><button ${ui.busy ? 'disabled' : ''}>Join team</button></form>
      ${ui.error ? `<p class="tf-error" role="alert">${esc(ui.error)}</p>` : ''}
      ${sim.driver.kind === 'local' ? '<p class="tf-badge">Offline preview: runs in this browser with prepared voices. Nothing is sent anywhere.</p>' : ''}</main>`;
  }

  function table() {
    const v = view(), done = !!v.submitted;
    return `<div class="tf-app">
      <header class="tf-top"><div><strong>Ninth Street Events</strong><span>Rights file · ${esc(sim.run.team)}</span></div>
        <div class="tf-clock"><b>${fmt(v.t)}</b><span>Imani needs your advice by 7:00 PM · Grand Final Sat 6:00 PM</span></div>
        <div class="tf-right"><span>Team code <b>${esc(sim.run.joinCode)}</b></span><span>${sim.driver.kind === 'local' ? 'Offline preview' : sim.online ? 'Saved' : 'Reconnecting…'}</span></div></header>
      <nav class="tf-binder" aria-label="Binder"><h2>Binder</h2>
        ${v.documents.map(d => `<button data-doc="${d.id}" class="${ui.slots.some(s => s.kind === 'doc' && s.id === d.id) ? 'tf-on' : ''}"><b>${esc(d.title.split(' — ')[0])}</b><span>${esc(d.kind)}${d.opened ? ' · read' : ' · 20 min'}</span></button>`).join('')}
        <h2>People</h2>
        ${v.people.map(p => `<button data-thread="${p.id}" class="${ui.slots.some(s => s.kind === 'thread' && s.id === p.id) ? 'tf-on' : ''}"><b>${esc(p.name)}</b><span>${esc(p.role)}</span></button>`).join('')}
        <p class="tf-small">Whatever you open goes into the highlighted side of the table.</p></nav>
      <section class="tf-table">${ui.error ? `<p class="tf-error" role="alert">${esc(ui.error)}</p>` : ''}${ui.notice ? `<p class="tf-note">${esc(ui.notice)}</p>` : ''}
        ${done && ui.showDebrief ? debrief() : `<div class="tf-slots">${ui.slots.map(slot).join('')}</div>`}</section>
      <aside class="tf-advice">${done ? sent() : adviceForm()}</aside></div>`;
  }

  function slot(s, i) {
    const v = view(), head = `<button class="tf-pick ${ui.active === i ? 'tf-active' : ''}" data-active="${i}" aria-pressed="${ui.active === i}">${ui.active === i ? 'Next item opens here' : 'Open next item here'}</button>`;
    if (s.kind === 'doc') {
      const d = v.documents.find(x => x.id === s.id), p = pinned();
      return `<article class="tf-slot">${head}<h2>${esc(d.title)}</h2><div class="tf-slot-body">${d.body.map(c => `<div class="tf-clause ${p.includes(c.id) ? 'tf-pinned' : ''}"><p>${esc(c.text)}</p>${v.submitted ? '' : `<button data-pin="${c.id}" ${ui.busy ? 'disabled' : ''}>${p.includes(c.id) ? 'Unpin' : 'Pin ' + esc(c.id)}</button>`}</div>`).join('')}</div></article>`;
    }
    const a = cf.actors[s.id], items = thread(s.id);
    return `<article class="tf-slot tf-talk">${head}<h2>${esc(a.name)} <span>${esc(a.role)} · ${esc(a.channel)}</span></h2>
      <div class="tf-slot-body tf-log" role="log">${items.map(e => `<div class="tf-msg ${e.type === 'student.message' ? 'tf-me' : ''}"><span class="tf-when">${fmt(e.t)}</span><p>${esc(e.text)}</p></div>`).join('') || `<p class="tf-small">Nothing yet between you and ${esc(first(a.name))}.</p>`}</div>
      ${v.submitted ? '' : `<form class="tf-compose" data-to="${s.id}"><label class="tf-sr" for="msg-${s.id}">Message to ${esc(a.name)}</label><textarea id="msg-${s.id}" maxlength="700" rows="2" placeholder="Ask ${esc(first(a.name))} something, or tell them something. Either way it is on the record." ${v.ended ? 'disabled' : ''}>${esc(draft.get('msg' + s.id))}</textarea><button ${ui.busy || v.ended ? 'disabled' : ''}>Send · 15 min</button></form>`}</article>`;
  }

  function adviceForm() {
    const a = advice(), p = pinned(), v = view();
    return `<form id="advise"><h2>Advice to Imani</h2><p class="tf-small">She will send exactly this. If it is not here, it does not happen.</p>
      ${v.ended ? '<p class="tf-note"><strong>It is 7:00 PM.</strong> Imani needs your advice now.</p>' : ''}
      <fieldset><legend>What should she do?</legend>${cf.recommendations.map(([id, label]) => `<label class="tf-radio"><input type="radio" name="rec" value="${id}" ${a.rec === id ? 'checked' : ''}> ${esc(label)}</label>`).join('')}</fieldset>
      ${a.rec === 'coexist' ? `<fieldset><legend>On which conditions?</legend>${cf.conditions.map(([id, label]) => `<label class="tf-radio"><input type="checkbox" name="c_${id}" ${a['c_' + id] ? 'checked' : ''}> ${esc(label)}</label>`).join('')}</fieldset>` : ''}
      <h3>Clauses you are relying on</h3>
      ${p.length ? `<ul class="tf-pins">${p.map(id => `<li><b>${esc(id)}</b> ${esc(clauseText(id))}</li>`).join('')}</ul>` : '<p class="tf-small">None pinned yet. Open a document and pin the clauses your advice rests on.</p>'}
      <label for="why">Your reason, as you would put it to her</label><textarea id="why" name="why" maxlength="900" rows="4">${esc(a.why || '')}</textarea>
      <button class="tf-primary" ${ui.busy ? 'disabled' : ''}>Send advice to Imani</button></form>`;
  }

  function sent() {
    const o = view().debrief.advice;
    return `<h2>Advice sent ${fmt(o.sentAt)}</h2><p class="tf-saved">Received. Your instructor can see this file.</p><p><strong>${esc(o.label)}</strong></p>
      ${o.rec === 'coexist' ? `<ul>${cf.conditions.map(([id, l]) => `<li>${o.conds[id] ? '☑' : '☐'} ${esc(l)}</li>`).join('')}</ul>` : ''}<p>“${esc(o.why)}”</p>
      <p class="tf-small">Relied on: ${esc(o.pins.join(', ') || 'no pinned clauses')}</p>
      <button data-toggle>${ui.showDebrief ? 'Reread the documents' : 'Back to what happened'}</button> <button data-leave>Leave this device</button>`;
  }

  function debrief() {
    const v = view(), o = v.debrief;
    const why = seq => { if (!seq) return ''; const chain = causalChain(v.events, seq).map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor || x.d.why);
      return `<details><summary>Why this happened</summary><ol class="tf-chain">${chain.map(({ e, d }) => `<li class="${d.why ? 'tf-because' : ''}"><span class="tf-when">${fmt(e.t)}</span> ${esc(d.text)}</li>`).join('')}</ol></details>`; };
    const miss = [[o.found.carveout, 'Lumen 2.3 lets a non-English stream go ahead with 48 hours’ written notice.', 'It is in the Lumen agreement.'],
      [o.found.spanish, 'Parallax’s cast was always going to be in Spanish.', 'No document says so. Mateo and Devon both knew.'],
      [o.found.preshow, 'Mateo wanted to add an English pre-show.', 'Only Mateo knew, and only if asked what he planned.'],
      [o.found.authority, 'Devon signed the Parallax agreement without the authority to do so.', 'It is in the signing policy.']];
    return `<article class="tf-debrief"><h1>What happened, and why</h1>
      ${o.aftermath.map(n => `<p>${esc(n)}</p>`).join('')}
      ${v.events.filter(e => e.type === 'actor.message' && e.seq > v.submitted.seq).map(e => `<div class="tf-reply"><b>${esc(cf.actors[e.from].name)}</b> <span class="tf-small">${esc(cf.actors[e.from].role)}</span><p>${esc(e.text)}</p></div>`).join('')}
      ${o.people.map(p => `<section><h2>${esc(p.who)}: ${esc(p.headline)}</h2><p>${esc(p.detail)}</p>${why(p.seq)}</section>`).join('')}
      ${o.promises.map(p => `<section><h2>${esc(p.label)}</h2><blockquote>“${esc(p.quote)}”</blockquote><p>That ended up <strong>${esc(p.status)}</strong>.</p>${why(p.seq)}</section>`).join('')}
      <section><h2>What was there to find</h2><ul>${miss.map(([got, t, where]) => `<li>${got ? '✓ You found it:' : '✗ You did not find it:'} ${esc(t)} <span class="tf-small">${esc(where)}</span></li>`).join('')}</ul></section></article>`;
  }

  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.active) { ui.active = +b.dataset.active; return render(); }
    if (b.dataset.thread) { put({ kind: 'thread', id: b.dataset.thread }); ui.showDebrief = false; return render(); }
    if (b.dataset.doc) { const d = view().documents.find(x => x.id === b.dataset.doc), go = () => { put({ kind: 'doc', id: d.id }); ui.showDebrief = false; }; if (d.opened) { go(); return render(); } return act({ type: 'open', doc: d.id }, go); }
    if (b.dataset.pin) return act({ type: 'act', act: pinned().includes(b.dataset.pin) ? 'unpin' : 'pin', params: { clause: b.dataset.pin } });
    if ('toggle' in b.dataset) { ui.showDebrief = !ui.showDebrief; return render(); }
    if ('leave' in b.dataset) { sim.leave(); render(); }
  });
  root.addEventListener('input', e => {
    const t = e.target, f = t.closest('form'); if (!f) return;
    if (f.id === 'advise') { const a = advice(); if (t.type === 'radio') a.rec = t.value; else if (t.type === 'checkbox') a[t.name] = t.checked; else a.why = t.value; draft.set('advice', JSON.stringify(a)); if (t.type === 'radio') render(); }
    else if (f.classList.contains('tf-compose')) draft.set('msg' + f.dataset.to, t.value);
  });
  root.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f));
    if (f.id === 'start' || f.id === 'join') {
      ui.busy = true; ui.error = ''; render();
      try { if (f.id === 'start') await sim.start({ team: data.team, members: data.members, classCode: data.classCode, mode: sim.driver.kind === 'local' ? 'test' : 'live' }); else await sim.join(data.code); }
      catch (err) { ui.error = err.public ? err.message : 'Could not reach the server. Check the connection and try again.'; }
      ui.busy = false; return render();
    }
    if (f.classList.contains('tf-compose')) { const to = f.dataset.to, text = f.querySelector('textarea').value.trim(); if (!text) return; return act({ type: 'message', to, text }, () => draft.set('msg' + to, '')); }
    if (f.id === 'advise') { const a = advice(); return act({ type: 'submit', memo: { rec: a.rec, conds: { spanish: !!a.c_spanish, notice: !!a.c_notice, ratify: !!a.c_ratify }, why: a.why || '' } }, () => { ui.showDebrief = true; }); }
  });
}
