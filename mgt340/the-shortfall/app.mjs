// THE SHORTFALL — student page. The job is a budget decision with a text message waiting, so
// the page is a budget board first: amounts you move, a running total against the envelope,
// drafts you save and show to people. Messages sit beside the board, because the captain's
// text is the interruption, not the job. What happens is decided by casefile.mjs.
import cf, { LINES, TARGET } from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { formatClock, causalChain } from '../../simkit/kernel.mjs';
import { describe, esc } from '../../simkit/describe.mjs';

const first = n => n.split(' ')[0];
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const PREFIX = 'shortfall.';
const ss = {
  get(k) { try { return sessionStorage.getItem(PREFIX + k) || ''; } catch { return ''; } },
  set(k, v) { try { sessionStorage.setItem(PREFIX + k, v); } catch { /* fine */ } },
};
const ORIG = Object.fromEntries(LINES.map(([id, , amt]) => [id, amt]));

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const ui = { who: 'maya', busy: false, error: '', notice: '', doc: null, seen: JSON.parse(ss.get('seen') || '{}'), board: null, briefTo: 'maya' };
  const view = () => sim.view;
  const fmt = t => formatClock(cf, t);

  const drafts = () => view().events.filter(e => e.type === 'student.act' && e.act === 'save_draft');
  const latest = () => drafts().at(-1)?.params || null;
  const shown = () => view().events.filter(e => e.type === 'student.act' && e.act === 'brief').map(e => ({ who: e.params.who, v: drafts().filter(d => d.seq < e.seq).length, t: e.t }));
  const sum = b => LINES.reduce((n, [id]) => n + (b?.[id] || 0), 0);
  const boardKey = () => 'board.' + (sim.run?.runId || '');
  function loadBoard() {
    try { ui.board = JSON.parse(ss.get(boardKey()) || 'null'); } catch { ui.board = null; }
    ui.board ||= { ...(latest() || ORIG) };
  }
  const saveBoard = () => ss.set(boardKey(), JSON.stringify(ui.board));
  const unsaved = () => { const l = latest() || ORIG; return LINES.some(([id]) => l[id] !== ui.board[id]); };

  const thread = id => view().events.filter(e => (e.type === 'student.message' && e.to === id) || (e.type === 'actor.message' && e.from === id));
  const unread = id => thread(id).some(e => e.type === 'actor.message' && e.seq > (ui.seen[id] || 0));
  const markSeen = () => { if (view()) { ui.seen[ui.who] = view().seq; ss.set('seen', JSON.stringify(ui.seen)); } };

  try { await sim.resume(); } catch { ui.error = 'The server could not be reached. Check the connection and reload; your team’s work is saved.'; }
  if (view()) { loadBoard(); markSeen(); }
  render();

  if (sim.driver.kind === 'remote') setInterval(async () => {
    if (!view() || ui.busy || document.hidden || view().submitted) return;
    const before = view().seq;
    try { await sim.refresh(); } catch { return; }
    if (view().seq === before) return;
    const el = document.activeElement, id = el?.id, pos = el?.selectionStart;
    ui.notice = 'A teammate just acted. The file is up to date.'; render();
    const again = id && root.querySelector('#' + CSS.escape(id));
    if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch { /* not text */ } }
  }, 6000);

  async function act(action, after) {
    if (ui.busy) return;
    ui.busy = true; ui.error = ''; ui.notice = action.type === 'message' ? 'Sending…' : 'Working…'; render();
    try {
      const before = view().seq;
      await sim.send(action);
      ui.notice = '';
      const fresh = view().events.filter(e => e.seq > before);
      const from = [...new Set(fresh.filter(e => e.type === 'actor.message').map(e => e.from))].filter(f => f !== ui.who);
      const notes = fresh.filter(e => e.type === 'note' && !/^Draft \d+ saved/.test(e.text));
      if (from.length) ui.notice = `New message from ${from.map(o => first(cf.actors[o].name)).join(' and ')}.`;
      if (notes.length && !view().submitted) ui.notice = [ui.notice, notes.map(n => n.text).join(' ')].filter(Boolean).join(' ');
      after?.(); markSeen();
    } catch (e) {
      ui.notice = '';
      ui.error = e.public ? e.message : 'That did not go through. Nothing was lost and nothing was sent twice. Try again.';
    } finally { ui.busy = false; render(); }
  }

  // ------------------------------------------------------------------ render
  function render() {
    root.innerHTML = !view() ? welcome() : view().submitted ? debrief() : office();
    const log = root.querySelector('.log'); if (log) log.scrollTop = log.scrollHeight;
  }

  function welcome() {
    return `<main class="welcome">
      <p class="kicker">${esc(cf.course)}</p>
      <h1>The Shortfall</h1>
      <p class="lede">You are the <strong>Director of Athletics</strong> at Wissahickon University. It is Tuesday, 1:30 PM.</p>
      <p>A sponsor has pulled out. Finance needs a revised athlete-experience budget, $200,000 smaller, by 5:00 PM. And a team captain has just texted you about a rumour.</p>
      <ul class="plain">
        <li>Move amounts on the budget board. Save drafts; show them to people if you choose. They react to what they can see.</li>
        <li>Text, message or email the people involved. What you say is on the record, and people repeat it.</li>
        <li>Time moves when you act. Other people act on their own clock. Doing nothing is also a decision.</li>
        <li>There is no score. After you submit, you see what happened on Tuesday night and Wednesday morning, and why.</li>
      </ul>
      <p class="small">Everyone and everything here is fictional, including the university, its policy and its numbers. All characters are adults.</p>
      <form id="start" class="card">
        <label>Team name<input name="team" required maxlength="60" placeholder="e.g. Pod 3"></label>
        <label>Who is on the team<input name="members" maxlength="200" placeholder="First names"></label>
        <label>Class code from your instructor<input name="classCode" maxlength="40" placeholder="e.g. MGT340-TUE"></label>
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Open the budget file</button>
      </form>
      <form id="join" class="card slim">
        <label>Joining teammates on another device? Enter the team code<input name="code" maxlength="8" placeholder="6 characters"></label>
        <button ${ui.busy ? 'disabled' : ''}>Join team</button>
      </form>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
      ${sim.driver.kind === 'local' ? '<p class="badge">Offline preview: runs in this browser with prepared voices. Nothing is sent anywhere.</p>' : ''}
    </main>`;
  }

  function office() {
    const v = view();
    const practiceDone = v.t >= 15 * 60 + 30;
    return `<div class="office">
      <header class="top">
        <div><strong>Wissahickon University Athletics</strong><span>Revised budget file · ${esc(sim.run.team)}</span></div>
        <div class="clock"><b>${fmt(v.t)}</b>
          <span class="deadlines"><i class="${practiceDone ? 'past' : ''}">Maya’s practice 3:30 PM</i><i>Finance 5:00 PM</i></span></div>
        <div class="right"><span>Team code <b>${esc(sim.run.joinCode)}</b></span><span class="${sim.online ? 'ok' : 'bad'}">${sim.driver.kind === 'local' ? 'Offline preview' : sim.online ? 'Saved' : 'Reconnecting…'}</span></div>
      </header>
      <div class="status" aria-live="polite">${ui.notice ? `<p class="notice">${esc(ui.notice)}</p>` : ''}${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
        ${v.ended ? '<p class="notice strong">It is 5:00 PM. You can no longer change the draft or message anyone. Submit what you have.</p>' : ''}</div>
      <main class="work">${board()}${binder()}${submitPanel()}</main>
      <aside class="phone">${phone()}${record()}</aside>
      ${ui.doc ? docModal() : ''}
    </div>`;
  }

  function board() {
    const v = view(), b = ui.board, n = sum(b), gap = n - TARGET, l = latest();
    const pct = Math.min(100, (n / 600000) * 100), tgt = (TARGET / 600000) * 100;
    const locked = v.ended || ui.busy;
    return `<section class="board" aria-labelledby="bh"><header><h1 id="bh">Athlete-experience budget</h1>
        <p class="small">Provisional $600,000 → revised $400,000. Lines can be reduced, not increased. Amounts move in $5,000 steps; type any amount to the nearest $1,000.</p></header>
      <table class="lines"><thead><tr><th>Line</th><th class="num">Provisional</th><th class="num">Revised</th><th class="num">Change</th></tr></thead><tbody>
      ${LINES.map(([id, label, amt, who]) => { const c = b[id] - amt; return `<tr>
        <th scope="row"><b>${esc(label)}</b><span>${esc(who)}</span><div class="fill" aria-hidden="true"><i style="width:${(b[id] / amt) * 100}%"></i></div></th>
        <td class="num">${money(amt)}</td>
        <td class="num"><div class="amt"><button type="button" data-step="${id}" data-d="-5000" aria-label="Reduce ${esc(label)} by $5,000" ${locked || b[id] <= 0 ? 'disabled' : ''}>−</button><input id="amt-${id}" data-line="${id}" type="number" inputmode="numeric" min="0" max="${amt}" step="1000" value="${b[id]}" aria-label="${esc(label)} revised amount" ${locked ? 'disabled' : ''}><button type="button" data-step="${id}" data-d="5000" aria-label="Increase ${esc(label)} by $5,000" ${locked || b[id] >= amt ? 'disabled' : ''}>+</button></div></td>
        <td class="num ${c < 0 ? 'neg' : ''}">${c ? '−' + money(-c) : '—'}</td></tr>`; }).join('')}
      </tbody></table>
      <div class="total ${gap === 0 ? 'even' : 'off'}">
        <div class="meter" aria-hidden="true"><i style="width:${pct}%"></i><b style="left:${tgt}%"></b></div>
        <p><strong>${money(n)}</strong> of ${money(TARGET)} · ${gap === 0 ? 'balanced' : gap > 0 ? `${money(gap)} still to cut` : `${money(-gap)} below the envelope`}</p>
      </div>
      <div class="board-actions">
        <button class="primary" data-save ${locked || (!unsaved() && l) ? 'disabled' : ''}>Save this draft to the file <small>· 10 min</small></button>
        ${unsaved() ? '<span class="warnline">Unsaved changes. Nobody, including Finance, sees a draft until you save it.</span>' : l ? `<span class="small">Board matches draft ${drafts().length}.</span>` : ''}
        <button data-reset ${locked || !unsaved() ? 'disabled' : ''}>Undo unsaved changes</button>
      </div>
      ${l ? `<form id="brief" class="brief-row"><label>Show draft ${drafts().length} to
          <select name="who">${cf.acts.brief.fields[0].options.map(([id, lbl]) => `<option value="${id}" ${id === ui.briefTo ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}</select></label>
          <button ${locked ? 'disabled' : ''}>Show it <small>· 10 min</small></button></form>
        <p class="small">${shown().length ? 'Seen so far: ' + shown().map(s => `${first(cf.actors[s.who].name)} (draft ${s.v}, ${fmt(s.t)})`).join(' · ') : 'Nobody has seen a draft.'}</p>` : ''}
    </section>`;
  }

  function binder() {
    const v = view();
    return `<section class="binder"><h2>Binder</h2><div class="docs">${v.documents.map(d => `<button data-doc="${d.id}" ${ui.busy ? 'disabled' : ''}><b>${esc(d.title)}</b><span>${esc(d.kind)} · ${d.opened ? 'read' : 'about 5 min to read'}</span></button>`).join('')}</div>
      <button class="ghost" data-wait ${ui.busy || v.ended ? 'disabled' : ''}>Step away until something happens</button></section>`;
  }

  function submitPanel() {
    const l = latest(), ok = l && sum(l) === TARGET;
    return `<section class="submit"><h2>Submit to Finance</h2>
      <p class="small">Finance receives your <b>latest saved draft</b>${l ? ` (draft ${drafts().length}, ${money(sum(l))})` : ' — you have not saved one yet'}${unsaved() ? '. Your unsaved changes on the board will not be included.' : '.'} Once you submit, the file closes and you see what happened next.</p>
      <form id="memo">${cf.memoFields.map(f => `<label>${esc(f.label)}<textarea name="${f.id}" id="memo-${f.id}" maxlength="900" required rows="3">${esc(ss.get('memo' + f.id))}</textarea></label>`).join('')}
      ${ok ? '' : '<p class="warnline">Your latest saved draft does not total $400,000. You can still submit, and Finance will respond to what it receives.</p>'}
      <button class="primary" ${ui.busy ? 'disabled' : ''}>Submit the revised budget</button></form></section>`;
  }

  function phone() {
    const v = view(), a = cf.actors[ui.who], items = thread(ui.who);
    return `<section class="msgs"><nav class="who" aria-label="People">${v.people.map(p => `<button data-who="${p.id}" class="${p.id === ui.who ? 'on' : ''}"><b>${esc(first(p.name))}</b><span>${esc(p.channel)}</span>${unread(p.id) ? '<em aria-label="unread">●</em>' : ''}</button>`).join('')}</nav>
      <header><h2>${esc(a.name)}</h2><p class="small">${esc(a.role)} · ${esc(a.channel)}</p></header>
      <div class="log ${a.channel === 'Text' ? 'sms' : 'mail'}" role="log">${items.length ? items.map(e => `<div class="msg ${e.type === 'student.message' ? 'me' : 'them'}"><span class="when">${fmt(e.t)}</span><p>${esc(e.text)}</p></div>`).join('') : `<p class="empty">Nothing yet between you and ${esc(first(a.name))}.</p>`}</div>
      <form id="compose"><label class="sr" for="msg">Message to ${esc(a.name)}</label><textarea id="msg" maxlength="900" rows="3" placeholder="Write to ${esc(first(a.name))}. What you say is on the record." ${v.ended ? 'disabled' : ''}>${esc(ss.get('msg' + ui.who))}</textarea>
      <div class="row"><span class="small">About 10 minutes.</span><button class="primary" ${ui.busy || v.ended ? 'disabled' : ''}>Send</button></div></form></section>`;
  }

  function record() {
    const rows = view().events.filter(e => ['commitment.made', 'note', 'fact.learned'].includes(e.type) && !(e.type === 'note' && /^Draft \d+ saved/.test(e.text)));
    return `<section class="record"><h2>On the record</h2><p class="small">What you have said that people will hold you to, what has happened, and what you have learned.</p>
      <div class="entries">${rows.map(e => `<div class="entry ${e.type === 'commitment.made' ? 'commit' : e.type === 'note' ? 'event' : 'fact'}"><span class="when">${fmt(e.t)}</span><p>${esc(describe(cf, e).text)}</p></div>`).join('') || '<p class="empty">Nothing yet.</p>'}</div></section>`;
  }

  function docModal() {
    const d = view().documents.find(x => x.id === ui.doc);
    return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="dh"><article class="paper"><button class="close" data-close aria-label="Close document">×</button>
      <p class="kicker">${esc(d.kind)}</p><h1 id="dh">${esc(d.title)}</h1>${(d.body || []).map(x => `<p>${esc(x)}</p>`).join('')}</article></div>`;
  }

  function debrief() {
    const v = view(), o = v.debrief;
    const why = seq => {
      if (!seq) return '';
      const chain = causalChain(v.events, seq).map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor || x.d.why);
      return `<details><summary>Why this happened</summary><ol class="chain">${chain.map(({ e, d }) => `<li class="${d.why ? 'because' : d.kind}"><span class="when">${fmt(e.t)}</span> ${esc(d.text)}</li>`).join('')}</ol></details>`;
    };
    const found = [['tutoringFloor', 'The $66,000 tutoring floor for 38 athletes on academic progress plans', 'Renee Coles had it; no document stated it.'],
      ['charter', 'The $40,000 signed fall charter inside the travel line', 'It was in the worksheet; Ellen Marsh had the cancellation terms.'],
      ['breakfast', 'That the fueling station is breakfast for three early-lift teams', 'Only Maya knew; she would have said if asked what mattered.'],
      ['source', 'Where the rumour started', 'Coach Ruiz told his players this morning.']];
    return `<article class="debrief"><p class="kicker">Submitted ${fmt(v.submitted.t)} · saved</p><h1>What happened, and why</h1>
      <p class="saved">Your budget was received. Your instructor can see this same page for your team.</p>
      ${o.promises.length ? `<section><h2>What you told Maya</h2>${o.promises.map(p => `<blockquote>“${esc(p.quote)}”</blockquote><p>${esc(p.label)}. That ended up <strong>${esc(p.status)}</strong>.</p>${why(p.resolvedSeq || p.seq)}`).join('')}</section>` : ''}
      <div class="outcomes">${o.people.map(p => `<section><h2>${esc(p.who)}</h2><p class="head">${esc(p.headline)}</p><p>${esc(p.detail)}</p>${why(p.seq)}</section>`).join('')}</div>
      ${o.budget ? `<section><h2>The budget Finance received</h2><table class="lines final"><thead><tr><th>Line</th><th class="num">Was</th><th class="num">Now</th><th class="num">Change</th></tr></thead><tbody>${o.budget.map(r => `<tr><th scope="row">${esc(r.label)}</th><td class="num">${money(r.was)}</td><td class="num">${money(r.now)}</td><td class="num ${r.now < r.was ? 'neg' : ''}">${r.now < r.was ? '−' + money(r.was - r.now) : '—'}</td></tr>`).join('')}</tbody></table>
        <p class="small">${o.drafts} draft${o.drafts === 1 ? '' : 's'} saved. ${o.mayaSaw ? `Maya saw draft ${o.mayaSaw}.` : 'Maya never saw a draft.'}</p></section>` : ''}
      ${o.aftermath.length ? `<section><h2>Tuesday night and Wednesday morning</h2>${o.aftermath.map(n => `<p>${esc(n)}</p>`).join('')}</section>` : ''}
      <section><h2>What you found out, and what you did not</h2><ul class="found">${found.map(([key, what, where]) => `<li class="${o.found[key] ? 'yes' : 'no'}"><b>${o.found[key] ? 'Found' : 'Missed'}:</b> ${esc(what)}. <span class="small">${esc(where)}</span></li>`).join('')}</ul></section>
      <section><h2>Your note to Finance</h2>${cf.memoFields.map(f => `<h3>${esc(f.label)}</h3><p>${esc(v.submitted.memo[f.id])}</p>`).join('')}</section>
      <button data-leave>Leave this device</button></article>`;
  }

  // ------------------------------------------------------------------ events
  const clamp = (id, n) => Math.min(ORIG[id], Math.max(0, Math.round((Number(n) || 0) / 1000) * 1000));
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.who) { ui.who = b.dataset.who; ui.error = ''; markSeen(); return render(); }
    if (b.dataset.step) { const id = b.dataset.step; ui.board[id] = clamp(id, ui.board[id] + Number(b.dataset.d)); saveBoard(); return render(); }
    if ('save' in b.dataset) return act({ type: 'act', act: 'save_draft', params: { ...ui.board } }, () => saveBoard());
    if ('reset' in b.dataset) { ui.board = { ...(latest() || ORIG) }; saveBoard(); return render(); }
    if (b.dataset.doc) { const d = view().documents.find(x => x.id === b.dataset.doc); return d.opened ? (ui.doc = d.id, render()) : act({ type: 'open', doc: d.id }, () => { ui.doc = d.id; }); }
    if ('close' in b.dataset) { ui.doc = null; return render(); }
    if ('wait' in b.dataset) return act({ type: 'wait' });
    if ('leave' in b.dataset) { sim.leave(); ui.board = null; render(); }
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ui.doc) { ui.doc = null; render(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.id === 'msg') { e.preventDefault(); root.querySelector('#compose')?.requestSubmit(); }
  });
  root.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.line) { ui.board[t.dataset.line] = clamp(t.dataset.line, t.value); saveBoard(); render(); }
    if (t.name === 'who') ui.briefTo = t.value;
  });
  root.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'msg') ss.set('msg' + ui.who, t.value);
    if (t.id?.startsWith('memo-')) ss.set('memo' + t.name, t.value);
  });
  root.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f));
    if (f.id === 'start' || f.id === 'join') {
      ui.busy = true; ui.error = ''; render();
      try { if (f.id === 'start') await sim.start({ team: data.team, members: data.members, classCode: data.classCode, mode: sim.driver.kind === 'local' ? 'test' : 'live' }); else await sim.join(data.code); loadBoard(); markSeen(); }
      catch (err) { ui.error = err.public ? err.message : 'Could not reach the server. Check the connection and try again.'; }
      ui.busy = false; return render();
    }
    if (f.id === 'compose') { const who = ui.who, text = root.querySelector('#msg').value.trim(); if (!text) return; return act({ type: 'message', to: who, text }, () => ss.set('msg' + who, '')); }
    if (f.id === 'brief') return act({ type: 'act', act: 'brief', params: { who: data.who } }, () => { ui.who = data.who; });
    if (f.id === 'memo') {
      if (unsaved() && !confirm('Your board has unsaved changes. Finance will receive your latest SAVED draft, not what is on the board. Submit anyway?')) return;
      return act({ type: 'submit', memo: data }, () => cf.memoFields.forEach(m => ss.set('memo' + m.id, '')));
    }
  });
}
