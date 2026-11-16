// NEGOTIATE A WORKABLE CHANGE — MGT 340, professional sport week (Thursday).
//
// A casefile has NO imports (see simkit/AUTHORING_GUIDE.md §7).
//
// The professional task: a league office wants players to wear sensors in games and wants to
// put the data on the broadcast. A pod is assigned to management or to the players'
// representatives. It reads what the current agreement says, reads the league's three
// proposed terms, and decides what to do with one term: accept it, revise it, reject it or
// defer it, in its own words. The other side then answers, and the answer depends on which
// term the pod chose and what it did with it. The pod reports to its own principal with a
// final term, the party whose agreement is needed, and the provision or fact it relies on.
//
// The skill: recognise that a change to players' working conditions is negotiated, read the
// operative language before proposing, and adjust a term because another party has a say.
//
// What is real and what is invented. The document "What the current agreement says" is a
// summary, in our own words, of the wearables section of the 2023 NBA–NBPA collective
// bargaining agreement (Article XXII, Section 13) as reported in public sources; Jeff should
// check it against the agreement before class. Everything else is invented for class: the
// league's proposal and its three terms, the broadcast offer, the player representatives'
// resolution, every person, and every response. Every character is an adult.

const YOU = 'you';
const at = (h, m = 0) => h * 60 + m;
const flag = (s, k) => s.flags[k]?.value;
const txt = (v, n = 600) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export const ROLES = {
  management: { label: 'Management', title: 'League office negotiator', counterpart: 'baptiste', principal: 'lindqvist',
    brief: ['You negotiate for the league office.', 'The league’s broadcast partner has offered a new fee for live player data on game broadcasts. The offer depends on data being collected in games this coming season.', 'The owners’ labor committee has authorized you to offer limits on how data is used, a share of new revenue for players, and joint oversight.', 'The committee has not authorized you to drop in-game collection altogether.', 'You report to the chair of the labor committee, a club owner.'] },
  players: { label: 'Player representatives', title: 'Players association negotiator', counterpart: 'ellis', principal: 'cole',
    brief: ['You negotiate for the players association.', 'The board of player representatives passed a resolution with three points. One: data from a player’s body is never used in contract talks, trades or waivers. Two: no data goes to a betting operator without that player’s consent. Three: a player keeps the right to decline a device.', 'The board has authorized you to explore health uses, a share of new revenue, joint oversight and a limited trial.', 'You report to the chair of the board, a veteran player.'] },
};
export const TERMS = {
  t1: { label: 'Term 1 · Wear', text: 'Beginning next season, every player shall wear a League-approved sensor during all games.' },
  t2: { label: 'Term 2 · Share', text: 'The League may provide live sensor data to its broadcast partners and to licensed commercial partners, including sports-betting operators.' },
  t3: { label: 'Term 3 · Use', text: 'Teams may use game sensor data for any basketball purpose, including player evaluation.' },
};
export const MOVES = { accept: 'Accept (keep) the term as written', revise: 'Revise it', reject: 'Reject it', defer: 'Defer it' };
export const LEVERS = {
  consent: 'Make it each player’s choice (opt in, with the right to stop)',
  limit: 'Limit who gets the data or what it may be used for',
  share: 'Give players a share of the new revenue',
  joint: 'Require approval by the joint league–players committee',
  pilot: 'Run a limited trial first, then review',
};
export const CONSENT = {
  union_player: 'The players association, and each player who would wear the device',
  union: 'The players association, as the players’ bargaining representative',
  owners: 'The club owners, by vote',
  commissioner: 'The commissioner, acting alone',
  broadcaster: 'The broadcast partner',
};
export const CURRENT = [
  'Source: 2023 NBA–NBPA collective bargaining agreement, Article XXII (Player Health and Wellness), Section 13 (Wearables). Parties: the league and the players association. In force since July 2023. Summarised for class; check the agreement itself before relying on any line.',
  '1. A team may ask a player to use an approved wearable in practice. Use is voluntary, and the player may stop at any time.',
  '2. Wearables may not be used in games.',
  '3. A joint committee of league and players association appointees reviews and approves devices and sets data-security standards.',
  '4. Data may be used for player health and performance and for team tactics. It may not be used or referred to in contract negotiations or in other contract transactions such as trades and waivers.',
  '5. The data may not be used commercially.',
  '6. The player has access to his own data. A team that misuses data can be fined.',
];

// ---------------------------------------------------------------- the other side's answer
// RESPONSES[the pod's role][term][move or lever] = [stance, what the counterpart says].
// stance: agree | counter | refuse. A pod on the management side hears from the players
// association; a pod on the players' side hears from the league office.
export const RESPONSES = {
  management: {
    t1: {
      accept: ['refuse', 'The current agreement says a player may stop using a wearable at any time and that wearables are not used in games. You are asking every player to give up both. I will not take that to our members.'],
      reject: ['agree', 'Then there is nothing to discuss on Term 1. Games stay as they are.'],
      defer: ['agree', 'Fine. Put it on the list for the next full negotiation. Nothing changes in games until then.'],
      consent: ['counter', 'Voluntary is where we start. A player who opts in has to be able to opt out mid-season without it being held against him. Put that in writing and we can talk.'],
      limit: ['refuse', 'This term is about whether a player has to wear it. Limits on use belong in Terms 2 and 3. As long as wearing it is mandatory, the answer is no.'],
      share: ['refuse', 'You are offering to pay players for something they currently have the right to refuse. Money does not replace the choice.'],
      joint: ['counter', 'The joint committee already approves devices. It could approve in-game devices and what they measure. That still leaves whether wearing one is the player’s choice.'],
      pilot: ['counter', 'A trial is something I could take to the player representatives, if it is voluntary and the joint committee reviews it before anything expands.'],
    },
    t2: {
      accept: ['refuse', 'Under the current agreement this data is for health, performance and team tactics, and it is not for sale. You are proposing to sell it, betting operators included. No.'],
      reject: ['agree', 'Agreed. The data stays inside the team and with the player.'],
      defer: ['agree', 'We can leave commercial use for the next full negotiation. Until then the current rule stands.'],
      consent: ['counter', 'Each player’s consent, partner by partner, and nothing to betting operators. On those terms we can discuss the broadcast.'],
      limit: ['agree', 'Broadcast only, no betting operators, and only measures the joint committee approves. I would take that to the player representatives.'],
      share: ['counter', 'A revenue share is necessary and it is not enough. Players also decide which data and which partners.'],
      joint: ['counter', 'Joint approval of partners and data fields helps. Betting operators stay out, and players share in the revenue.'],
      pilot: ['counter', 'A trial on the broadcast only, no betting partners, and then both sides look at what was shown on air.'],
    },
    t3: {
      accept: ['refuse', 'The agreement says this data may not be used in contract negotiations. Of everything in the section, that is the line our members care about most.'],
      reject: ['agree', 'Good. With that gone, the other two terms are easier to talk about.'],
      defer: ['agree', 'Leave it. Until then the current limits apply to anything collected in a game.'],
      consent: ['refuse', 'A player in a contract negotiation cannot freely consent to his team using his own data against him.'],
      limit: ['agree', 'Health, performance and tactics only. Never in contract talks, trades or waivers, and the fine stays. That is the current rule applied to games. Yes.'],
      share: ['refuse', 'There is no price at which a team gets to use a player’s heart rate in his contract negotiation.'],
      joint: ['counter', 'A committee cannot approve use in contract talks. It could audit teams to confirm they are not doing it.'],
      pilot: ['refuse', 'There is no trial version of using a player’s data in his contract negotiation.'],
    },
  },
  players: {
    t1: {
      accept: ['agree', 'Then we have Term 1. Every player wears it in games. We will send a draft.'],
      reject: ['refuse', 'Without collection in games there is no proposal. Our broadcast partner’s offer depends on it.'],
      defer: ['refuse', 'The broadcast partner needs an answer for this coming season. We cannot wait for the next full negotiation.'],
      consent: ['counter', 'Voluntary works for us only if enough players opt in to make something worth broadcasting. Would the association encourage participation, or accept a minimum number per team?'],
      limit: ['counter', 'We can talk about limits under Terms 2 and 3. On Term 1 we need players wearing the device.'],
      share: ['agree', 'Players share in the new revenue in exchange for wearing the device in every game. We can put a number on that.'],
      joint: ['agree', 'The joint committee approves the in-game device and what it measures, and every player wears it. Agreed.'],
      pilot: ['counter', 'A voluntary preseason trial is less than we came for. We would do it if the trial data can go on the broadcast.'],
    },
    t2: {
      accept: ['agree', 'Then we have Term 2 as written: broadcast partners and licensed commercial partners, betting operators included.'],
      reject: ['refuse', 'The broadcast feature is the reason for this proposal. We cannot drop it.'],
      defer: ['counter', 'We will defer betting partners. The broadcast cannot wait.'],
      consent: ['counter', 'Player-by-player consent for betting partners, fine. For the broadcast we need everyone on the floor or the graphic does not work.'],
      limit: ['agree', 'Broadcast only, approved measures only, no betting operators for now. We can live with that.'],
      share: ['agree', 'Players share the revenue from broadcast and commercial partners, betting operators included. Agreed.'],
      joint: ['counter', 'Joint approval of what is measured, yes. Joint approval of each commercial partner gives the association a veto over league business. We would accept consultation.'],
      pilot: ['counter', 'A broadcast-only trial for one season. We would agree if it is the regular season and not only the preseason.'],
    },
    t3: {
      accept: ['agree', 'Then we have Term 3. Teams may use game data for any basketball purpose, including evaluation.'],
      reject: ['counter', 'We will take contract negotiations out. Coaches and medical staff still need the data for health, performance and tactics.'],
      defer: ['agree', 'Leave it. Until then the current limits apply to anything collected in a game.'],
      consent: ['counter', 'A team cannot run a training staff on a player-by-player permission slip. Health and tactics by default and contracts never would be simpler.'],
      limit: ['agree', 'Health, performance and tactics only. Not in contract talks, trades or waivers. That mirrors the current rule. Agreed.'],
      share: ['refuse', 'There is no revenue in Term 3 to share. It is about how teams use the data.'],
      joint: ['counter', 'The committee can audit how teams use the data. We would agree to annual audits, not audits on demand.'],
      pilot: ['refuse', 'The rules on use have to be settled before any data exists. They cannot be tried out afterwards.'],
    },
  },
};
// What each side's principal will not accept, whatever the other side says.
const key = p => p.move === 'revise' ? p.lever : p.move;
const breach = (role, p) => {
  const k = key(p);
  if (role === 'players') {
    if (p.term === 't1' && ['accept', 'share', 'joint'].includes(k)) return 'You agreed that every player wears it. The board’s resolution says a player keeps the right to decline, and so does the current agreement. We did not authorize you to trade that away.';
    if (p.term === 't2' && ['accept', 'share'].includes(k)) return 'You agreed that data can go to betting operators without each player’s consent. The board’s resolution says the opposite.';
    if (p.term === 't3' && k === 'accept') return 'You agreed that teams may use game data in evaluating players. That reaches contract talks. It is the first point of the board’s resolution and the first thing players will ask about.';
  } else if (p.term === 't1' && k === 'reject') return 'You withdrew in-game collection. The committee did not authorize that, and without it the broadcast partner has nothing to buy.';
  return '';
};
const STANCE = { agree: 'Agrees', counter: 'Counters', refuse: 'Refuses' };
const role = s => flag(s, 'role');
const proposals = s => s.acts.filter(a => a.id === 'propose').map(a => a.params);
const lastOn = (s, term) => proposals(s).filter(p => p.term === term).at(-1) || null;
const respond = (r, p) => RESPONSES[r][p.term][key(p)];
const memo = s => s.submitted?.memo || null;
const finalP = s => memo(s) && lastOn(s, memo(s).term);
const describeP = p => `${TERMS[p.term].label}: ${p.move === 'revise' ? 'revise — ' + LEVERS[p.lever].toLowerCase() : MOVES[p.move].toLowerCase()}`;

export default {
  id: 'mgt340-workable-change',
  version: 1,
  title: 'Negotiate a Workable Change',
  course: 'MGT 340 · Professional sport',
  role: 'a negotiator for the league office or for the players association',
  clock: { start: at(10), end: at(16), days: ['Negotiating day'] },
  costs: { message: 10, open: 5, act: 30 },
  roles: ROLES, terms: TERMS, moves: MOVES, levers: LEVERS, consent: CONSENT, stance: STANCE, maxProposals: 3,

  actors: {
    ellis: { name: 'Jordan Ellis', role: 'Senior vice president, league office', channel: 'across the table', reachable: false, voice: 'Commercial, quick, courteous.', wants: 'Data collected in games this coming season.', fears: 'Losing the broadcast partner’s offer.', concern: 'The broadcast partner wants an answer.' },
    baptiste: { name: 'Simone Baptiste', role: 'Deputy general counsel, players association', channel: 'across the table', reachable: false, voice: 'Exact; quotes the agreement.', wants: 'Players deciding what happens to data from their bodies.', fears: 'Data reaching a contract negotiation or a sportsbook.', concern: 'What the current agreement already says.' },
    lindqvist: { name: 'Carol Lindqvist', role: 'Club owner; chair of the owners’ labor committee', channel: 'phone', reachable: false, voice: 'Businesslike.', wants: 'A deal the broadcast partner will pay for.', fears: 'A grievance, or a term the league cannot enforce.', concern: 'What can we actually put in place?' },
    cole: { name: 'Darius Cole', role: 'Veteran guard; chair of the board of player representatives', channel: 'phone', reachable: false, voice: 'Plain, protective of younger players.', wants: 'The three points of the board’s resolution kept.', fears: 'A rookie’s heart rate showing up in his contract talks.', concern: 'What did you agree to in our name?' },
  },

  facts: {
    F_current: { text: 'Under the current agreement wearables are voluntary in practice, are not used in games, and their data may not be used in contract negotiations or commercially.' },
    F_proposal: { text: 'The league proposes mandatory in-game sensors, live data to broadcast and commercial partners including betting operators, and team use for any basketball purpose.' },
    F_brief_management: { text: 'The labor committee authorized limits on use, revenue sharing and joint oversight, but not dropping in-game collection.' },
    F_brief_players: { text: 'The board of player representatives resolved: no use in contract matters, nothing to betting operators without consent, and the right to decline stays.' },
  },

  documents: {
    current: { title: 'What the current agreement says', kind: 'Summary of the agreement in force', cost: 5, reveals: ['F_current'], available: s => !!role(s), body: CURRENT.join('\n') },
    proposal: { title: 'The league’s proposed side letter', kind: 'Proposal (invented for class)', cost: 5, reveals: ['F_proposal'], available: s => !!role(s),
      body: ['Proposed by the league office to the players association. Not agreed. Invented for MGT 340.', ...Object.values(TERMS).map(t => `${t.label}. ${t.text}`)].join('\n') },
    brief_management: { title: 'Your instructions: league office', kind: 'Private to your side', cost: 5, reveals: ['F_brief_management'], available: s => role(s) === 'management', body: ROLES.management.brief.join('\n') },
    brief_players: { title: 'Your instructions: players association', kind: 'Private to your side', cost: 5, reveals: ['F_brief_players'], available: s => role(s) === 'players', body: ROLES.players.brief.join('\n') },
  },

  speechActs: {},
  detect: () => [],
  opening: () => [{ note: 'Your instructor has assigned your pod a side. Choose it to open the file.' }],

  rules: [
    { id: 'moved_after_no', why: 'The pod changed its proposal on a term after the other side refused or countered.',
      when: (s, ev) => ev.type === 'student.act' && ev.act === 'propose' && proposals(s).filter(p => p.term === ev.params.term).length > 1,
      then: () => [{ flag: { key: 'moved' } }] },
  ],
  timers: {},

  acts: {
    side: {
      label: 'Take your assigned side', blurb: 'Management or player representatives.', cost: 0,
      fields: [{ id: 'role', label: 'Side', type: 'select', options: Object.entries(ROLES).map(([k, r]) => [k, r.label]) }],
      available: s => !role(s),
      clean: p => ({ role: ROLES[p.role] ? p.role : 'management' }),
      effect: (s, p) => [{ flag: { key: 'role', value: p.role } },
        { note: p.role === 'management' ? 'You are at the table for the league office. Across from you: Simone Baptiste of the players association. Read the three documents before you propose anything.' : 'You are at the table for the players association. Across from you: Jordan Ellis of the league office. Read the three documents before you propose anything.' }],
    },
    propose: {
      label: 'Put a term to the other side', blurb: 'Choose one term and say what you would do with it, in your own words. The other side answers what you actually proposed.', cost: 30,
      fields: [
        { id: 'term', label: 'Term', type: 'select', options: Object.entries(TERMS).map(([k, t]) => [k, t.label]) },
        { id: 'move', label: 'Your move', type: 'select', options: Object.entries(MOVES) },
        { id: 'lever', label: 'If you revise: what your revision does', type: 'select', options: Object.entries(LEVERS) },
        { id: 'wording', label: 'Your wording', type: 'text' },
      ],
      available: s => !!role(s) && proposals(s).length < 3,
      clean: p => { const move = MOVES[p.move] ? p.move : 'revise'; return { term: TERMS[p.term] ? p.term : 't1', move, lever: move === 'revise' ? (LEVERS[p.lever] ? p.lever : 'limit') : '', wording: txt(p.wording, 500) || '(no wording given)' }; },
      effect: (s, p) => { const r = role(s), [stance, text] = respond(r, p), b = breach(r, p);
        return [
          { commit: { id: `p${proposals(s).length}`, label: describeP(p), quote: p.wording, to: ROLES[r].counterpart } },
          { flag: { key: `stance_${p.term}`, value: stance } },
          ...(b ? [{ flag: { key: `breach_${p.term}`, value: true } }] : [{ flag: { key: `breach_${p.term}`, value: false } }]),
          { say: { from: ROLES[r].counterpart, voice: false, text } },
          { note: `${STANCE[stance]}. ${proposals(s).length < 3 ? `You may put ${3 - proposals(s).length} more proposal${proposals(s).length === 2 ? '' : 's'} before you report.` : 'That was your last proposal. Report to your side.'}` },
        ]; },
    },
  },

  cleanMemo: m => ({ term: TERMS[m.term] ? m.term : '', consent: CONSENT[m.consent] ? m.consent : '', wording: txt(m.wording), reason: txt(m.reason), evidence: txt(m.evidence), changed: txt(m.changed) }),
  memoFields: [
    { id: 'term', label: 'Which term are you reporting on?', type: 'select', options: Object.entries(TERMS).map(([k, t]) => [k, t.label]) },
    { id: 'wording', label: 'The term as you would now write it (or: accept, reject or defer, and why)' },
    { id: 'consent', label: 'Whose agreement is needed before this can take effect?', type: 'select', options: Object.entries(CONSENT) },
    { id: 'reason', label: 'Why that person or body?' },
    { id: 'evidence', label: 'Which provision of the current agreement, or which fact in your file, supports you?' },
    { id: 'changed', label: 'What changed in your proposal because the other side had a say?' },
  ],
  checkSubmit(s, m) {
    if (!role(s)) return 'Take your assigned side first.';
    if (!m.term) return 'Choose the term you are reporting on.';
    if (!m.consent) return 'Say whose agreement is needed.';
    if (!m.evidence) return 'Name the provision or fact you are relying on.';
    return null;
  },

  describeEvent(e) {
    if (e.type === 'run.started') return { kind: 'world', text: 'The file opens.' };
    if (e.type === 'run.ended') return { kind: 'world', text: 'The session has ended. Report to your side.' };
    if (e.type === 'run.submitted') return { kind: 'you', text: `Report on ${TERMS[e.memo.term].label}. Agreement needed from: ${CONSENT[e.memo.consent]}` };
    if (e.type === 'student.act' && e.act === 'side') return { kind: 'you', text: `Took a side: ${ROLES[e.params.role].label}` };
    if (e.type === 'student.act' && e.act === 'propose') return { kind: 'you', text: `Proposed — ${describeP(e.params)}: “${e.params.wording}”` };
    return null;
  },

  // ---------------------------------------------------------------- after submission
  afterSubmit(s) {
    const m = memo(s), r = role(s), p = finalP(s), who = ROLES[r].principal, fx = [];
    const alone = ['commissioner', 'owners', 'broadcaster'].includes(m.consent);
    let line, later;
    if (!p) {
      line = `You are reporting on ${TERMS[m.term].label} without having put it to the other side. I have your view. I do not have theirs.`;
      later = 'Nothing was put across the table on this term, so nothing changed. The current agreement continues to govern: no wearables in games.';
      fx.push({ flag: { key: 'result', value: 'untested' } });
    } else {
      const [stance] = respond(r, p), b = breach(r, p);
      if (b) { line = b; later = r === 'players' ? 'The board of player representatives declined to recommend the term to the membership. The league office said it had been told there was a deal. The next meeting started with less trust than the first.' : 'The broadcast partner withdrew its offer for the coming season. The labor committee asked why its negotiator gave up the one thing it had not authorized.'; fx.push({ flag: { key: 'result', value: 'disowned' } }); }
      else if (stance === 'agree') { line = r === 'management' ? 'That is less than the league office first wrote down, and it is something the players association will take to its members. I can bring it to the owners.' : 'That keeps the board’s three points. I can take it to the player representatives.'; later = 'Both negotiators initialled the term. It still has to be approved on each side before it changes the agreement. Until then the current rule stands: no wearables in games.'; fx.push({ flag: { key: 'result', value: 'tentative' } }); }
      else if (stance === 'counter') { line = 'Not settled, and you know exactly what they need next. Tell me whether we can give it.'; later = 'The sides scheduled another session. The term on the table is no longer the one the league office first wrote.'; fx.push({ flag: { key: 'result', value: 'open' } }); }
      else { line = r === 'management' ? 'You are bringing me a term the players association has already refused. We cannot put it in place ourselves. It changes players’ working conditions, and the agreement we signed covers it.' : 'They refused, and you held the board’s position. Tell me what they would need to hear to move.'; later = 'No change. The current agreement continues to govern: no wearables in games, and no use of the data in contract matters.'; fx.push({ flag: { key: 'result', value: 'refused' } }); }
    }
    if (alone) line += ` One correction. You wrote that the agreement needed is from ${CONSENT[m.consent].toLowerCase()}. This is covered by the agreement between the league and the players association, so the association has to agree${m.term === 't1' ? ', and under the current rule each player decides whether to wear a device' : ''}.`;
    fx.push({ say: { from: who, voice: false, text: line } }, { note: later });
    return fx;
  },

  outcome(s) {
    const m = memo(s), r = role(s), p = finalP(s), all = proposals(s);
    return {
      role: ROLES[r].label, counterpart: ROLES[r].counterpart, principal: ROLES[r].principal,
      term: TERMS[m.term], final: { wording: m.wording, consent: CONSENT[m.consent], reason: m.reason, evidence: m.evidence, changed: m.changed },
      exchanges: all.map(q => ({ what: describeP(q), wording: q.wording, stance: STANCE[respond(r, q)[0]], reply: respond(r, q)[1] })),
      lastStance: p ? STANCE[respond(r, p)[0]] : 'Never put to the other side',
      result: flag(s, 'result'),
      principalSaid: (s.threads[ROLES[r].principal] || []).at(-1)?.text || '',
      later: s.notes.filter(n => n.seq > s.submitted.seq).map(n => n.text),
      read: { current: !!s.docs.current, proposal: !!s.docs.proposal, brief: !!s.docs[`brief_${r}`] },
    };
  },

  // ---------------------------------------------------------------- for the instructor
  projectorQuote(s) { const p = proposals(s); return p.length ? p.map(q => `${describeP(q)} — “${q.wording}”`).join(' | ') : ''; },
  cardLine(s) { const p = proposals(s).at(-1); return role(s) ? `${ROLES[role(s)].label}${p ? ' · ' + describeP(p) : ''}` : 'No side taken yet'; },
  signals(s) {
    const out = [], r = role(s), m = memo(s);
    if (!r) return out;
    out.push({ label: ROLES[r].label, tone: 'ok' });
    if (s.docs.current) out.push({ label: 'Read the current agreement', tone: 'ok' }); else if (proposals(s).length) out.push({ label: 'Proposed before reading the agreement', tone: 'warn' });
    for (const p of proposals(s)) { const st = respond(r, p)[0]; out.push({ label: `${TERMS[p.term].label.split(' · ')[1]}: ${key(p)} → ${STANCE[st].toLowerCase()}`, tone: st === 'agree' ? 'ok' : st === 'counter' ? 'warn' : 'bad' }); if (breach(r, p)) out.push({ label: 'Outside its instructions', tone: 'bad' }); }
    if (flag(s, 'moved')) out.push({ label: 'Changed a proposal after the answer', tone: 'ok' });
    if (m && ['commissioner', 'owners', 'broadcaster'].includes(m.consent)) out.push({ label: `Said agreement needed from: ${m.consent}`, tone: 'bad' });
    if (m?.consent === 'union_player') out.push({ label: 'Named the association and the player', tone: 'ok' });
    return out;
  },
  lenses: [
    { id: 'role', label: 'Side', value: s => role(s) ? ROLES[role(s)].label : 'None',
      question: 'Same three terms, opposite sides of the table. Which term did each side go to first, and what does that tell you about what each side’s principal cares about?' },
    { id: 'first', label: 'First proposal', value: s => proposals(s)[0] ? describeP(proposals(s)[0]) : 'None',
      question: 'Both pods read the same agreement. Which line of it should have told a pod how its first proposal would be received?' },
    { id: 'answer', label: 'The other side’s last answer', value: s => { const p = proposals(s).at(-1); return p ? STANCE[respond(role(s), p)[0]] : 'No proposal made'; },
      question: 'What changed in the proposal because another party had a meaningful say?' },
    { id: 'moved', label: 'Changed a proposal after hearing the answer', value: s => flag(s, 'moved') ? 'Yes' : 'No',
      question: 'One pod came back with different wording after the first answer. What did the other side say that made the second version possible?' },
    { id: 'consent', label: 'Whose agreement they said was needed', value: s => memo(s) ? CONSENT[memo(s).consent] : 'Not reported',
      question: 'One pod named the players association; another named the commissioner or the owners. Where does a commissioner’s authority come from, and who else signed a document that covers this?' },
    { id: 'result', label: 'Where it ended', value: s => ({ tentative: 'Tentative agreement on the term', open: 'Still open; another session', refused: 'Refused; no change', disowned: 'Agreed at the table, rejected by its own side', untested: 'Never put to the other side' })[flag(s, 'result')] || 'Not reported',
      question: 'A negotiator agreed at the table and was overruled by the people she represents. Who actually had authority to say yes?' },
  ],

  // ---------------------------------------------------------------- scripted sample pods
  samples: [
    { team: 'Pod M1 (sample)', members: 'Fictional', note: 'Management. Put Term 1 as written, was refused, came back with a voluntary trial.', steps: [
      { type: 'act', act: 'side', params: { role: 'management' } }, { type: 'open', doc: 'proposal' }, { type: 'open', doc: 'brief_management' },
      { type: 'act', act: 'propose', params: { term: 't1', move: 'accept', lever: '', wording: 'Every player wears the sensor in all games starting next season.' } },
      { type: 'open', doc: 'current' },
      { type: 'act', act: 'propose', params: { term: 't1', move: 'revise', lever: 'pilot', wording: 'A voluntary trial in the preseason. Players may opt out at any time. The joint committee reviews the trial before any regular-season use.' } },
      { type: 'submit', memo: { term: 't1', consent: 'union_player', wording: 'Voluntary preseason trial, opt out at any time, joint committee review before expansion.', reason: 'Wearing a device in games changes a working condition covered by the agreement, and the agreement lets each player decline.', evidence: 'Current agreement, points 1 and 2: voluntary, and not used in games.', changed: 'We dropped mandatory wear after the association pointed to the right to decline.' } },
    ] },
    { team: 'Pod M2 (sample)', members: 'Fictional', note: 'Management. Read the agreement first and went straight to limited versions of Terms 3 and 2.', steps: [
      { type: 'act', act: 'side', params: { role: 'management' } }, { type: 'open', doc: 'current' }, { type: 'open', doc: 'proposal' }, { type: 'open', doc: 'brief_management' },
      { type: 'act', act: 'propose', params: { term: 't3', move: 'revise', lever: 'limit', wording: 'Game data may be used only for health, performance and tactics. Never in contract talks, trades or waivers.' } },
      { type: 'act', act: 'propose', params: { term: 't2', move: 'revise', lever: 'limit', wording: 'Broadcast partners only. No betting operators. Only measures the joint committee approves.' } },
      { type: 'submit', memo: { term: 't2', consent: 'union', wording: 'Broadcast only, committee-approved measures, no betting operators.', reason: 'Commercial use of player data is barred by the current agreement, so only the parties to it can change that.', evidence: 'Current agreement, point 5: no commercial use.', changed: 'Nothing was refused, because we started from what the agreement already says.' } },
    ] },
    { team: 'Pod P1 (sample)', members: 'Fictional', note: 'Player representatives. Traded mandatory wear for a revenue share; the league agreed and the board did not.', steps: [
      { type: 'act', act: 'side', params: { role: 'players' } }, { type: 'open', doc: 'proposal' },
      { type: 'act', act: 'propose', params: { term: 't1', move: 'revise', lever: 'share', wording: 'Players wear the sensor in games and receive half of the new broadcast revenue.' } },
      { type: 'submit', memo: { term: 't1', consent: 'commissioner', wording: 'Mandatory wear in exchange for 50 percent of new revenue.', reason: 'The commissioner runs the league.', evidence: 'The league’s proposal.', changed: 'We added a revenue share.' } },
    ] },
    { team: 'Pod P2 (sample)', members: 'Fictional', note: 'Player representatives. Locked in limits on use, then offered opt-in wear and got a counter.', steps: [
      { type: 'act', act: 'side', params: { role: 'players' } }, { type: 'open', doc: 'current' }, { type: 'open', doc: 'proposal' }, { type: 'open', doc: 'brief_players' },
      { type: 'act', act: 'propose', params: { term: 't3', move: 'revise', lever: 'limit', wording: 'Game data is for health, performance and tactics. It is never used in contract talks, trades or waivers.' } },
      { type: 'act', act: 'propose', params: { term: 't1', move: 'revise', lever: 'consent', wording: 'A player may opt in to wearing a sensor in games and may stop at any time without penalty.' } },
      { type: 'submit', memo: { term: 't1', consent: 'union_player', wording: 'Opt-in wear in games; a player may stop at any time.', reason: 'The association bargains the rule; the player decides whether to wear it.', evidence: 'Current agreement, point 1, and the board’s resolution, point three.', changed: 'The league asked for a minimum number of players per team. We have not agreed to that.' } },
    ] },
  ],
};
