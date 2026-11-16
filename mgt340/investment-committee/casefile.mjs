// THE INVESTMENT COMMITTEE — MGT 340, professional sport week (Tuesday).
//
// A casefile has NO imports (see simkit/AUTHORING_GUIDE.md §7).
//
// The professional task: a pod advises the investment committee of a league-owned growth
// fund. Round 1 asks for an instinct: which sector should the fund pursue, and why. That
// answer is recorded and stays on the page. Round 2 hands the pod the staff memo for a
// company in that sector and a complication: the company's value depends on a right the
// fund does not own. The pod can read the committee's charter, make up to three calls, and
// must then say what the committee can authorize today, what it would put in writing, and
// whose agreement it needs.
//
// The skill: tell apart what a body can decide alone from what needs someone else's consent,
// and name the document or fact that says so — including when the record does not settle it.
//
// The exercise is modelled on the kind of vehicle the NFL's clubs approved in October 2026.
// Everything inside the exercise is invented for class: the League Growth Fund, its charter,
// its committee, the four companies, every person and every number. No real agreement, rule
// or statistic is quoted. Every character is an adult.

const YOU = 'you';
const at = (h, m = 0) => h * 60 + m;
const flag = (s, k) => s.flags[k]?.value;
const did = (s, id, pred) => s.acts.some(a => a.id === id && (!pred || pred(a.params)));
const txt = (v, n = 600) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

// ---------------------------------------------------------------- the four sectors
// holder: who controls the right the company's plan depends on. The `asks` are the three
// calls a pod can make. Each returns a partial answer: the record stays incomplete on purpose.
export const SECTORS = {
  fan: {
    label: 'Fan engagement', company: 'TurnstileIQ', what: 'a ticketing and fan-identity app', holder: 'clubs',
    right: 'ticket-buyer data held by each of the 32 clubs',
    assumes: 'TurnstileIQ’s plan assumes it will receive ticket-buyer data from all 32 clubs.',
    confirmed: ['Ticket-buyer data is collected at each stadium and is held by the individual club, not by the league or the Fund.', 'Nine clubs have told staff they are interested. The other 23 have not been asked.', 'Each club has its own contract with a ticketing vendor.'],
    unknown: 'Staff has not seen the clubs’ ticketing-vendor contracts and does not know whether they let a club share buyer data with a new company.',
    asks: {
      holder: ['kessler', 'I can speak for one club. We would share buyer data if our ticketing-vendor contract allows it and once we have seen TurnstileIQ’s terms. I cannot speak for the other 31, and neither can your committee. Each club decides for itself. If the league office canvassed all 32, you would have answers in about six weeks.'],
      counsel: ['raman', 'I have read two of the 32 ticketing-vendor contracts. One lets the club share buyer data with a league-affiliated company. The other requires the vendor’s written consent first. I have not seen the other 30, so I cannot tell you how many clubs are free to say yes. Nothing in our charter lets the Committee waive either contract.'],
      company: ['ceo_fan', 'Our model works at 20 clubs. Below that, the valuation you were shown does not hold. We would take the money in two parts: $10 million now and $30 million when 20 clubs have signed data agreements. I should tell you that our other offer expires in 30 days.'],
    },
    later: {
      approve: 'Six weeks later the league office had canvassed the clubs. Fourteen could share buyer data; TurnstileIQ needed 20. The $40 million was already wired. Staff marked the stake down toward the low case.',
      condition: 'Six weeks later fourteen clubs could share buyer data; TurnstileIQ needed 20. The condition was not met, so the money that depended on it did not move. The Fund kept that capital and its seat at the table.',
      revise: 'The narrower deal closed. Six weeks later fourteen clubs could share buyer data, short of the 20 the full plan needed. The Fund’s exposure was limited to what it put in.',
      consent: 'The league office canvassed the clubs. It took six weeks. Fourteen could share buyer data. By then TurnstileIQ had taken its other offer. The Fund spent nothing and now knows the answer.',
      walk: 'The Committee passed. TurnstileIQ took its other offer. Nobody at the Fund learned how many clubs could have shared buyer data.',
    },
  },
  media: {
    label: 'Media', company: 'ClipDeck', what: 'a short-form highlights app', holder: 'media',
    right: 'game footage licensed league-wide through media-partner agreements',
    assumes: 'ClipDeck’s plan assumes it can use game footage within minutes of each play.',
    confirmed: ['Game footage is licensed league-wide by the clubs acting together, through agreements with media partners.', 'The Fund does not hold any footage rights.', 'ClipDeck has no agreement with any media partner.'],
    unknown: 'Staff has asked league media counsel whether an existing media-partner agreement gives someone else exclusive rights to short highlights. No answer yet.',
    asks: {
      holder: ['okafor', 'Footage is licensed by the clubs together, through the league’s media committee. A new licence for near-live highlights would have to come through that committee. If a current partner already holds those minutes exclusively, it would also need that partner to agree. I cannot tell you today whether one does.'],
      counsel: ['raman', 'I have read one of the five media-partner agreements. It gives that partner exclusive short highlights during its own game windows and for two hours afterward. I have not read the other four. League media counsel says a full answer will take about ten days. The Committee cannot license footage the Fund does not hold.'],
      company: ['ceo_media', 'Near-live is the product. If we have to wait a day for footage we are a different and much smaller company. We would sign a deal that only funds once a footage licence is in place. Our other term sheet expires in 30 days.'],
    },
    later: {
      approve: 'Ten days later counsel finished reading. Two media partners hold exclusive short highlights in their own game windows. ClipDeck could get footage only after a delay, or by paying those partners. The $40 million was already wired, and the company was now the smaller business its chief executive described.',
      condition: 'Ten days later counsel finished reading: two media partners hold exclusive short highlights in their windows. The licence the condition required was not available on the plan’s terms, so the money that depended on it did not move.',
      revise: 'The narrower deal closed. Ten days later counsel confirmed two media partners hold exclusive short highlights in their windows. The Fund owns a piece of a delayed-highlights business and paid a price that matched it.',
      consent: 'The media committee took the question up. The answer came in ten days: two partners hold exclusivity, and one was willing to talk about a licence for a fee. ClipDeck’s other term sheet was still open. The Committee meets again with a real number in front of it.',
      walk: 'The Committee passed. Ten days later counsel’s answer arrived anyway: two partners hold exclusivity, one was open to a licence. Nobody was in the room to use it.',
    },
  },
  hosp: {
    label: 'Hospitality', company: 'Fieldhouse Hospitality', what: 'an operator of premium pregame villages', holder: 'stadium',
    right: 'space on stadium grounds controlled by each club or its stadium authority',
    assumes: 'Fieldhouse’s plan assumes space on stadium grounds at 12 venues.',
    confirmed: ['Stadium grounds are controlled by each club or by the public authority that owns the stadium.', 'Three clubs have signed letters of interest. A letter of interest is not a lease.', 'At least some of the 12 stadiums are publicly owned.'],
    unknown: 'Staff has not reviewed any stadium lease and does not know whether a club may bring in an outside hospitality operator without the stadium authority’s approval.',
    asks: {
      holder: ['delgado', 'I run one stadium authority. Our lease gives the club the grounds on game days, but a new commercial operator on the property needs a vote of our board, and the board meets quarterly. I can speak for this building only. Other stadiums have other landlords and other leases.'],
      counsel: ['raman', 'I have read three of the twelve leases. Two are publicly owned stadiums, and both require the authority’s approval before an outside operator sets up. The third is club-owned and needs no one else. I have not read the other nine. The Committee has no power over any of them.'],
      company: ['ceo_hosp', 'We break even at eight venues. We would take the money in stages: $15 million for the three venues with letters of interest, and the rest as each lease or approval is signed. We can wait a quarter. We cannot wait a year.'],
    },
    later: {
      approve: 'Over the next year nine of the twelve venues approved Fieldhouse, one more than it needed to break even. The approvals came two quarters late. The investment is holding. Nothing in the Committee’s file on the day it voted said that it would.',
      condition: 'Approvals arrived venue by venue. Money moved as each one was signed. After a year nine of twelve venues were open, one more than break-even, and the Fund had paid only for the venues that existed.',
      revise: 'The staged deal closed on the three venues with letters of interest. Over the year six more were approved and the Fund chose whether to fund each one.',
      consent: 'The clubs took the question to their stadium authorities. The first board votes came a quarter later. Fieldhouse waited. The Committee meets again with signed approvals for five venues in front of it.',
      walk: 'The Committee passed. A year later Fieldhouse was operating at nine venues with another investor’s money.',
    },
  },
  perf: {
    label: 'Performance tech', company: 'PulseLine', what: 'a maker of wearable player sensors', holder: 'union',
    right: 'in-game player data, which the league bargains with the players’ union',
    assumes: 'PulseLine’s plan assumes it can collect player data during games and sell it to broadcasters.',
    confirmed: ['How player sensor data is collected and used is a subject the league bargains with the players’ union.', 'Neither the Fund nor any single club can agree to this on the players’ behalf.', 'Several teams already use PulseLine sensors in practice with players who agreed to wear them.'],
    unknown: 'Staff has not confirmed what the current agreement with the players permits for in-game collection or commercial sale of player data.',
    asks: {
      holder: ['vasquez', 'Collecting data from players during games and selling it are matters the league has to bargain with us. Nobody has brought us a proposal. An investment decision by a fund does not bind a single player. If a proposal came through the league’s bargaining team, we would start with two questions: is it the player’s choice, and where does the money go.'],
      counsel: ['raman', 'As I read the current agreement, it allows sensors in practice when the player agrees. It does not allow in-game use or commercial sale of the data. Changing that takes a bargained amendment between the league’s labor staff and the union. That is not this Committee, and I cannot tell you whether or when they would reach one.'],
      company: ['ceo_perf', 'Practice-only is a real business. Teams pay us a subscription. It is also your low case. We would take $15 million at a $90 million valuation for the practice business, with an option for the Fund to invest the rest if in-game use is ever bargained.'],
    },
    later: {
      approve: 'The league’s labor staff raised in-game data with the union that spring. The union declined to reopen the agreement before it expires. PulseLine remained a practice-only company. The $40 million had bought 20 percent of a company valued for a product it could not sell.',
      condition: 'The league’s labor staff raised in-game data with the union that spring. The union declined to reopen the agreement before it expires. The condition was not met, so the money that depended on it did not move.',
      revise: 'The practice-only deal closed at the lower valuation. The union declined to reopen the agreement that spring. The Fund owns a piece of the business that exists and holds an option on the one that might.',
      consent: 'The Committee asked the league’s labor staff to raise it. The union declined to reopen the agreement before it expires. The Fund spent nothing. PulseLine is still selling to teams for practice.',
      walk: 'The Committee passed. PulseLine kept selling practice subscriptions to teams. Nobody at the Fund asked whether a smaller deal for that business was available.',
    },
  },
};
const SECTOR_IDS = Object.keys(SECTORS);
export const HOLDERS = {
  clubs: 'The member clubs, each deciding for itself',
  media: 'The league’s media committee, and any media partner that holds the footage exclusively',
  stadium: 'Each club and, where it has one, its stadium authority',
  union: 'The players’ union, through the league’s bargaining team',
  none: 'No one. The Committee can do this on its own.',
};
export const CALLS = {
  approve: 'Approve the $40 million as proposed',
  condition: 'Approve, with a condition in writing',
  revise: 'Revise the deal',
  consent: 'Seek consent first; no money today',
  walk: 'Walk away',
};
export const ASKS = {
  holder: 'Call the party that controls the right',
  counsel: 'Ask Fund counsel what the contracts say',
  company: 'Call the company’s chief executive',
};
const sector = s => flag(s, 'sector');
const sec = s => SECTORS[sector(s)];
const asked = s => Object.keys(ASKS).filter(w => did(s, 'ask', p => p.whom === w));
const memo = s => s.submitted?.memo || null;
const named = s => { const m = memo(s); return !m ? null : m.consent === sec(s)?.holder ? 'right' : m.consent === 'none' ? 'none' : 'other'; };

export const CHARTER = [
  ['4.1', 'The Committee may approve an investment of up to $50 million in one company, using Fund capital.'],
  ['4.2', 'An investment above $50 million requires a vote of the member clubs.'],
  ['4.3', 'The Committee may not grant, license, or promise any right the Fund does not own. This includes league marks and game footage, club stadiums, club customer data, and player data.'],
  ['4.4', 'Where a company’s plan depends on a right held by someone else, the Committee shall record whose agreement is required and may make its approval conditional on that agreement.'],
  ['4.5', 'Fund staff recommend. The Committee approves. League and club staff carry out what was approved.'],
];
const memoBody = k => { const c = SECTORS[k]; return [
  `Company: ${c.company}, ${c.what}.`, 'Proposed deal: $40 million for 20% of the company (a $200 million valuation).',
  `What the valuation assumes: ${c.assumes}`, 'If that assumption fails: staff’s low-case value for the company is $60–90 million.',
  'What staff has confirmed:', ...c.confirmed.map(x => '• ' + x), `What staff has not confirmed: ${c.unknown}`,
  'Staff recommendation: none yet. Staff asks the Committee what it is prepared to authorize.'].join('\n'); };

export default {
  id: 'mgt340-investment-committee',
  version: 1,
  title: 'The Investment Committee',
  course: 'MGT 340 · Professional sport',
  role: 'Adviser to the Investment Committee, League Growth Fund',
  clock: { start: at(13), end: at(16), days: ['Committee day'] },
  costs: { message: 10, open: 10, act: 40 },
  sectors: SECTORS, holders: HOLDERS, calls: CALLS, asks: ASKS, charter: CHARTER,

  actors: {
    whitlock: { name: 'Dana Whitlock', role: 'Committee chair; a club owner', channel: 'in the committee room', reachable: false, voice: 'Brief, exact, asks one question at a time.', wants: 'A recommendation the Committee can defend to the other clubs.', fears: 'Voting for something the Committee had no power to deliver.', concern: 'What can we actually approve today?' },
    oyelaran: { name: 'Marcus Oyelaran', role: 'Managing director, League Growth Fund', channel: 'email', reachable: false, voice: 'Organised, neutral, staff-memo prose.', wants: 'A clear instruction from the Committee.', fears: 'Losing the deal while the Committee deliberates.', concern: 'The Committee meets at 4:00.' },
    raman: { name: 'Priya Raman', role: 'Counsel to the Fund', channel: 'phone', reachable: false, voice: 'Careful; says what she has read and what she has not.', wants: 'Nobody promising a right the Fund does not hold.', fears: 'Being quoted as certain about contracts she has not seen.', concern: 'Most of the contracts are still unread.' },
    kessler: { name: 'Tom Kessler', role: 'President of one member club', channel: 'phone', reachable: false, voice: 'Friendly, protective of his own club.', wants: 'His club’s data used on his club’s terms.', fears: 'The league office speaking for his club.', concern: 'Nobody has shown him the terms.' },
    okafor: { name: 'Grace Okafor', role: 'League senior vice president, media', channel: 'phone', reachable: false, voice: 'Precise about process.', wants: 'No conflict with current media partners.', fears: 'A breach claim from a partner.', concern: 'Counsel has not finished reading the agreements.' },
    delgado: { name: 'Luis Delgado', role: 'Executive director of one stadium authority', channel: 'phone', reachable: false, voice: 'Public-sector plain speech.', wants: 'His board to decide what happens on public property.', fears: 'Learning about a new operator from the newspaper.', concern: 'The board meets quarterly.' },
    vasquez: { name: 'Andre Vasquez', role: 'General counsel, players’ union', channel: 'phone', reachable: false, voice: 'Direct, unhurried.', wants: 'Players deciding how data from their bodies is used.', fears: 'A deal about players made without players.', concern: 'Nobody has brought the union a proposal.' },
    ceo_fan: { name: 'Lena Brandt', role: 'Chief executive, TurnstileIQ', channel: 'phone', reachable: false, voice: 'Candid founder.', wants: 'The full investment.', fears: 'Losing both offers.', concern: 'Another offer expires in 30 days.' },
    ceo_media: { name: 'Omar Haddad', role: 'Chief executive, ClipDeck', channel: 'phone', reachable: false, voice: 'Fast, product-minded.', wants: 'Near-live footage.', fears: 'Becoming a next-day highlights app.', concern: 'Another term sheet expires in 30 days.' },
    ceo_hosp: { name: 'Renata Silva', role: 'Chief executive, Fieldhouse Hospitality', channel: 'phone', reachable: false, voice: 'Operator; talks in venues and quarters.', wants: 'Twelve venues.', fears: 'A year of waiting on leases.', concern: 'Break-even is eight venues.' },
    ceo_perf: { name: 'Ian Castellano', role: 'Chief executive, PulseLine', channel: 'phone', reachable: false, voice: 'Engineer turned founder.', wants: 'In-game data.', fears: 'Being valued on a product he cannot sell.', concern: 'Practice-only is the low case.' },
  },

  facts: Object.fromEntries([
    ['F_charter', { text: 'The charter lets the Committee approve up to $50 million alone, forbids it to promise rights the Fund does not own, and lets it make approval conditional on someone else’s agreement.' }],
    ...SECTOR_IDS.flatMap(k => [
      [`F_${k}_memo`, { text: `${SECTORS[k].assumes} ${SECTORS[k].unknown}` }],
      ...Object.keys(ASKS).map(w => [`F_${k}_${w}`, { text: SECTORS[k].asks[w][1] }]),
    ]),
  ]),

  documents: {
    charter: { title: 'Investment Committee Charter, Section 4', kind: 'Charter', cost: 10, reveals: ['F_charter'], available: s => !!sector(s),
      body: CHARTER.map(([n, t]) => `${n}  ${t}`).join('\n') },
    ...Object.fromEntries(SECTOR_IDS.map(k => [`memo_${k}`, { title: `Staff memo to the Committee: ${SECTORS[k].company}`, kind: 'Staff memo', cost: 10, reveals: [`F_${k}_memo`], available: s => sector(s) === k, body: memoBody(k) }])),
  },

  speechActs: {},
  detect: () => [],

  opening: () => [
    { say: { from: 'oyelaran', voice: false, text: 'The Committee meets at 4:00. Before I send you anything, the chair wants your instinct on one question: which industry or business opportunity should the Fund pursue, and why? Your answer goes on the record and stays there.' } },
  ],

  rules: [
    { id: 'three_calls', why: 'The pod used all three calls before recommending, so it heard from the right-holder, counsel and the company.',
      when: s => asked(s).length === 3, then: () => [{ flag: { key: 'heard_all' } }] },
  ],
  timers: {},

  acts: {
    round1: {
      label: 'Record your Round 1 recommendation', blurb: 'One sector and one or two sentences. This is saved and shown beside your final recommendation.', cost: 0,
      fields: [{ id: 'sector', label: 'Sector', type: 'select', options: SECTOR_IDS.map(k => [k, SECTORS[k].label]) }, { id: 'reason', label: 'Why', type: 'text' }],
      available: s => !sector(s),
      clean: p => ({ sector: SECTOR_IDS.includes(p.sector) ? p.sector : 'fan', reason: txt(p.reason, 400) || '(no reason given)' }),
      effect: (s, p) => { const c = SECTORS[p.sector]; return [
        { flag: { key: 'sector', value: p.sector } },
        { commit: { id: 'round1', label: `Round 1: ${c.label}`, quote: p.reason, to: 'whitlock' } },
        { say: { from: 'oyelaran', voice: false, text: `Recorded. Staff has a company in ${c.label.toLowerCase()}: ${c.company}, ${c.what}. The proposed deal is $40 million for 20 percent. Here is the complication. ${c.assumes} That is a right the Fund does not own. The staff memo and Section 4 of the Committee’s charter are in your file. You have time for a few calls before 4:00. Then the chair will ask what the Committee can authorize today, what it should put in writing, and whose agreement it needs.` } },
      ]; },
    },
    ask: {
      label: 'Make a call', blurb: 'Each call takes 40 minutes. You will get what that person knows, which may not settle the question.', cost: 40,
      fields: [{ id: 'whom', label: 'Call', type: 'select', options: Object.entries(ASKS) }],
      available: s => !!sector(s),
      clean: p => ({ whom: ASKS[p.whom] ? p.whom : 'counsel' }),
      effect: (s, p) => { const [from, text] = sec(s).asks[p.whom];
        return did(s, 'ask', q => q.whom === p.whom) && s.acts.filter(a => a.id === 'ask' && a.params.whom === p.whom).length > 1
          ? [{ say: { from, voice: false, text: 'I have told you what I know. I do not have more today.' } }]
          : [{ learn: { who: YOU, fact: `F_${sector(s)}_${p.whom}`, via: from } }, { say: { from, voice: false, text } }]; },
    },
  },

  cleanMemo: m => ({
    call: CALLS[m.call] ? m.call : '', consent: HOLDERS[m.consent] ? m.consent : '',
    authorize: txt(m.authorize), condition: txt(m.condition), evidence: txt(m.evidence), unknown: txt(m.unknown),
  }),
  memoFields: [
    { id: 'call', label: 'Your call', type: 'select', options: Object.entries(CALLS) },
    { id: 'authorize', label: 'What can the Committee authorize today? Cite the charter section.' },
    { id: 'condition', label: 'What would you put in writing? Use a number, a date and a named party where you can.' },
    { id: 'consent', label: 'Whose agreement or cooperation is needed?', type: 'select', options: Object.entries(HOLDERS) },
    { id: 'evidence', label: 'Which document, section or fact tells you that?' },
    { id: 'unknown', label: 'If the file does not settle it: what must be checked, who could establish it, and how would the answer change your recommendation?' },
  ],
  checkSubmit(s, m) {
    if (!sector(s)) return 'Record your Round 1 recommendation first.';
    if (!m.call) return 'Choose your call.';
    if (!m.consent) return 'Say whose agreement is needed, or choose “No one”.';
    if (!m.evidence) return 'Name the document, section or fact you are relying on.';
    return null;
  },

  describeEvent(e) {
    if (e.type === 'run.started') return { kind: 'world', text: 'The file opens. The Committee meets at 4:00 PM.' };
    if (e.type === 'run.ended') return { kind: 'world', text: '4:00 PM. The Committee is seated. Send your recommendation.' };
    if (e.type === 'run.submitted') return { kind: 'you', text: `Recommendation to the Committee: ${CALLS[e.memo.call]}. Agreement needed from: ${HOLDERS[e.memo.consent]}` };
    if (e.type === 'student.act' && e.act === 'round1') return { kind: 'you', text: `Round 1 recommendation: ${SECTORS[e.params.sector].label}. “${e.params.reason}”` };
    if (e.type === 'student.act' && e.act === 'ask') return { kind: 'you', text: ASKS[e.params.whom] };
    return null;
  },

  // ---------------------------------------------------------------- after submission
  afterSubmit(s) {
    const m = memo(s), c = sec(s), n = named(s), calls = asked(s), fx = [];
    const read = !!s.docs.charter;
    let chair;
    if (m.call === 'approve') {
      chair = `We can approve $40 million under 4.1, so the vote is ours to take. But ${c.company}’s value rests on ${c.right}, and under 4.3 we cannot promise that. ${n === 'right' ? 'You named whose agreement the plan needs and recommended we commit the money before we have it.' : 'Your recommendation does not tell me who has to say yes before this company is worth what we would be paying.'}`;
      fx.push({ flag: { key: 'exposed' } });
    } else if (m.call === 'condition') {
      chair = n === 'right' ? `This is what 4.4 is for. We approve within our limit, we record that the plan needs agreement from ${HOLDERS[c.holder].toLowerCase()}, and the money that depends on it waits. ${m.condition ? 'I will read your condition into the minutes as written.' : 'You have not given me the condition in words. I need a number, a date and a named party before I can put it to a vote.'}`
        : `A condition only protects us if it is tied to the party that controls the right. ${c.company}’s plan depends on ${c.right}. ${n === 'none' ? 'You have told me no one else needs to agree.' : 'The party you named does not control that.'} As written, the condition could be satisfied and the company still could not do what we are paying for.`;
      fx.push({ flag: { key: n === 'right' ? 'conditioned' : 'misaimed' } });
    } else if (m.call === 'revise') {
      chair = calls.includes('company') ? `A smaller deal for the business that exists today. You asked ${c.company} what it would accept before you proposed it, so I can put real terms to a vote.` : `A smaller deal may be right. Did anyone ask ${c.company} whether it would take one? I cannot vote on terms the other side has not seen.`;
      fx.push({ flag: { key: calls.includes('company') ? 'revised_informed' : 'revised_blind' } });
    } else if (m.call === 'consent') {
      chair = n === 'right' ? `No money today, and a request to ${HOLDERS[c.holder].toLowerCase()}. That costs us time. ${calls.includes('company') ? 'You know what the delay may cost because you asked the company.' : 'Nobody asked the company how long it can wait.'}` : `You want consent before money moves. From whom? ${c.company}’s plan depends on ${c.right}. ${n === 'none' ? 'You have told me no one else needs to agree.' : 'The party you named does not control that.'}`;
      fx.push({ flag: { key: n === 'right' ? 'sought_consent' : 'misaimed' } });
    } else {
      chair = calls.length ? 'We keep our capital. You made your calls first, so I can tell the clubs why we passed.' : 'We keep our capital. What would have had to be true for you to stay in? Nobody picked up the phone to find out.';
      fx.push({ flag: { key: calls.length ? 'walked_informed' : 'walked_blind' } });
    }
    if (!read) chair += ' One more thing: nobody opened the charter. Everything I just said is in Section 4.';
    fx.push({ say: { from: 'whitlock', voice: false, text: chair } });
    const key = (m.call === 'condition' || m.call === 'consent') && n !== 'right' ? 'approve' : m.call;
    fx.push({ note: (key !== m.call ? 'The Committee recorded your recommendation as written. Because it was not tied to the party that controls the right, it gave no protection. ' : '') + c.later[key] });
    return fx;
  },

  outcome(s) {
    const m = memo(s), c = sec(s), r1 = s.commitments.round1;
    const calls = asked(s);
    return {
      round1: r1 ? { sector: c.label, why: r1.quote } : null,
      company: c.company, right: c.right, holder: HOLDERS[c.holder],
      final: { call: CALLS[m.call], consent: HOLDERS[m.consent], authorize: m.authorize, condition: m.condition, evidence: m.evidence, unknown: m.unknown },
      named: named(s),
      chair: (s.threads.whitlock || []).at(-1)?.text || '',
      later: s.notes.filter(n => n.seq > s.submitted.seq).map(n => n.text),
      record: [
        { label: 'Read the charter', done: !!s.docs.charter },
        { label: 'Read the staff memo', done: !!s.docs[`memo_${sector(s)}`] },
        ...Object.entries(ASKS).map(([w, label]) => ({ label, done: calls.includes(w) })),
      ],
      stillOpen: c.unknown,
    };
  },

  // ---------------------------------------------------------------- for the instructor
  projectorQuote(s) { const m = memo(s); return m ? [m.condition && `In writing: ${m.condition}`, m.evidence && `Relying on: ${m.evidence}`].filter(Boolean).join(' — ') : ''; },
  cardLine(s) { const m = memo(s); return sector(s) ? `${sec(s).label}${m ? ' → ' + CALLS[m.call] : ''}` : 'Round 1 not recorded yet'; },
  signals(s) {
    const out = [], m = memo(s), n = named(s);
    if (sector(s)) out.push({ label: `Round 1: ${sec(s).label}`, tone: 'ok', seq: s.flags.sector.seq });
    if (s.docs.charter) out.push({ label: 'Read the charter', tone: 'ok', seq: s.docs.charter.seq });
    for (const w of asked(s)) out.push({ label: ({ holder: 'Called the right-holder', counsel: 'Asked counsel', company: 'Called the company' })[w], tone: 'ok' });
    if (m) out.push({ label: CALLS[m.call], tone: m.call === 'approve' ? 'warn' : 'ok', seq: s.submitted.seq });
    if (n === 'right') out.push({ label: 'Named the party that holds the right', tone: 'ok' });
    if (n === 'other') out.push({ label: 'Named a party that does not hold the right', tone: 'bad' });
    if (n === 'none') out.push({ label: 'Said no one else must agree', tone: 'bad' });
    if (m && !s.docs.charter) out.push({ label: 'Never opened the charter', tone: 'warn' });
    if (m?.unknown) out.push({ label: 'Said what still must be checked', tone: 'ok' });
    return out;
  },
  lenses: [
    { id: 'sector', label: 'Round 1 sector', value: s => sector(s) ? sec(s).label : 'Not recorded',
      question: 'Both pods chose a sector before they knew who controlled what. What did your Round 1 answer assume the Fund could deliver on its own?' },
    { id: 'call', label: 'Round 2 call', value: s => memo(s) ? CALLS[memo(s).call] : 'Not submitted',
      question: 'What could your committee authorize today, what would it need someone else to agree to, and which document or fact tells you that?' },
    { id: 'consent', label: 'Whose agreement they said was needed', value: s => memo(s) ? HOLDERS[memo(s).consent] : 'Not submitted',
      question: 'One pod named the party that controls the right; the other named someone else or no one. Which line of the staff memo tells you who controls it?' },
    { id: 'calls', label: 'Calls made before recommending', value: s => asked(s).map(w => ({ holder: 'right-holder', counsel: 'counsel', company: 'company' })[w]).join(', ') || 'None',
      question: 'Counsel had read only some of the contracts. What exactly did the pod that called her learn, and what did it still not know when it recommended?' },
    { id: 'charter', label: 'Opened the charter', value: s => s.docs.charter ? 'Yes' : 'No',
      question: 'Which section says the Committee may approve this amount, and which section says what it may not promise? Could you have answered without opening it?' },
    { id: 'unknown', label: 'Said what must still be checked', value: s => memo(s)?.unknown ? 'Yes' : 'No',
      question: 'The file did not settle the question. Who could establish the missing fact, and how would each possible answer change the recommendation?' },
  ],

  // ---------------------------------------------------------------- scripted sample pods
  samples: [
    { team: 'Pod A (sample)', members: 'Fictional', note: 'Fan engagement. Read the charter, called counsel and the company, approved with a condition tied to the clubs.', steps: [
      { type: 'act', act: 'round1', params: { sector: 'fan', reason: 'Every club sells tickets, so one fan-identity platform could serve all 32 at once.' } },
      { type: 'open', doc: 'memo_fan' }, { type: 'open', doc: 'charter' },
      { type: 'act', act: 'ask', params: { whom: 'counsel' } }, { type: 'act', act: 'ask', params: { whom: 'company' } },
      { type: 'submit', memo: { call: 'condition', consent: 'clubs', authorize: 'Up to $50 million in one company under 4.1, so $40 million is within the Committee’s limit.', condition: 'Release $10 million now. Release $30 million only when 20 clubs have signed data agreements with TurnstileIQ, by 12 months from today.', evidence: 'Staff memo: buyer data is held by each club. Charter 4.3 and 4.4.', unknown: 'How many ticketing-vendor contracts allow sharing. Counsel has read 2 of 32. The league office could canvass the clubs in about six weeks. Fewer than 20 means the second payment never moves.' } },
    ] },
    { team: 'Pod B (sample)', members: 'Fictional', note: 'Fan engagement. Same sector as Pod A; called a club president and sought consent before any money moved.', steps: [
      { type: 'act', act: 'round1', params: { sector: 'fan', reason: 'Fan data is the most valuable thing the league has not yet used.' } },
      { type: 'open', doc: 'memo_fan' }, { type: 'open', doc: 'charter' },
      { type: 'act', act: 'ask', params: { whom: 'holder' } },
      { type: 'submit', memo: { call: 'consent', consent: 'clubs', authorize: 'The Committee could approve $40 million under 4.1 but should not yet.', condition: 'No money until the league office has canvassed all 32 clubs and at least 24 have agreed in writing.', evidence: 'The club president: each club decides for itself. Charter 4.3.', unknown: 'Whether the other 23 clubs will agree, and how long TurnstileIQ can wait. We did not ask the company.' } },
    ] },
    { team: 'Pod C (sample)', members: 'Fictional', note: 'Performance tech. Approved as proposed without opening the charter or calling anyone, and said no one else needed to agree.', steps: [
      { type: 'act', act: 'round1', params: { sector: 'perf', reason: 'Broadcasters and bettors will pay for live player data.' } },
      { type: 'open', doc: 'memo_perf' },
      { type: 'submit', memo: { call: 'approve', consent: 'none', authorize: 'The full $40 million.', condition: '', evidence: 'The staff memo says several teams already use the sensors.', unknown: '' } },
    ] },
    { team: 'Pod D (sample)', members: 'Fictional', note: 'Performance tech. Same sector as Pod C; called the union and the company, then revised to a practice-only deal.', steps: [
      { type: 'act', act: 'round1', params: { sector: 'perf', reason: 'Player performance data is a growing business and the league sits on the source.' } },
      { type: 'open', doc: 'memo_perf' }, { type: 'open', doc: 'charter' },
      { type: 'act', act: 'ask', params: { whom: 'holder' } }, { type: 'act', act: 'ask', params: { whom: 'company' } },
      { type: 'submit', memo: { call: 'revise', consent: 'union', authorize: '$15 million under 4.1 for the practice-only business.', condition: '$15 million at a $90 million valuation, with an option to invest the rest if the league and the union bargain in-game use.', evidence: 'Union counsel: in-game collection and sale must be bargained. Charter 4.3 lists player data.', unknown: 'What the current agreement permits. Counsel could read it; the league’s labor staff could say whether bargaining is realistic.' } },
    ] },
  ],
};
