// THE SHORTFALL — MGT 340, college athletics week.
//
// A casefile has NO imports (see simkit/AUTHORING_GUIDE.md §7). Data plus small pure
// functions, so it runs in the browser preview, in Node checks and in the Edge Function.
//
// The professional task: the athletic director at a fictional university must take $200,000
// out of a $600,000 provisional athlete-experience budget by 5:00 PM, after a sponsor pulled
// out. At 1:30 PM a student-athlete captain texts: she has heard the fueling station is being
// cut entirely, she has practice at 3:30, and the Student-Athlete Advisory Committee (SAAC)
// meets at 8:00 PM. The skills are allocating a cut across lines with unequal claims, finding
// out what cannot move before cutting it, and deciding what to tell a stakeholder before the
// decision exists.
//
// Everything here is fictional: the university, the people, the sponsor, the numbers and the
// department policy. Every character is an adult. No real law is cited; the only "rules" are
// documents inside the fiction (a department policy and a budget worksheet).

const YOU = 'you';
const TUE = 0;
const at = (day, h, m = 0) => day + h * 60 + m;
const knows = (s, who, f) => !!s.knows[who]?.[f];
const flag = (s, k) => s.flags[k]?.value;
const open = (s, id) => s.commitments[id]?.status === 'open';
const isMsg = (ev, to, act) => ev.type === 'student.message' && ev.to === to && (!act || ev.acts.includes(act));
const clock = t => { const m = t % 1440, h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const k = n => '$' + Math.round(n / 1000) + 'k';

// ---------------------------------------------------------------- the budget
// [id, label, provisional amount, who relies on it (shown on the board)]
export const LINES = [
  ['tutoring', 'Academic support: tutoring hours', 110000, 'All teams; required hours for athletes on academic progress plans'],
  ['counselor', 'Sport psychologist (0.5 FTE contract from January)', 70000, 'All teams; new service'],
  ['fueling', 'Fueling station (breakfast, snacks, recovery)', 90000, 'All teams; open 6:00 AM to 7:00 PM'],
  ['travel', 'Charter travel upgrades', 130000, 'Men’s and women’s basketball, soccer, lacrosse'],
  ['lights', 'Turf lighting: extended evening hours', 80000, 'Field teams; fewer 6:00 AM practice slots'],
  ['summeraid', 'Summer school aid', 70000, 'Athletes taking summer courses'],
  ['reserve', 'Uncommitted reserve', 50000, 'Nobody yet'],
];
const ORIG = Object.fromEntries(LINES.map(([id, , amt]) => [id, amt]));
const LABEL = Object.fromEntries(LINES.map(([id, label]) => [id, label.split(':')[0].split(' (')[0]]));
export const TARGET = 400000;
const APP_FLOOR = 66000, CHARTER = 40000;

// The latest saved draft (an `act`, so every version stays on the ledger).
const drafts = s => s.acts.filter(a => a.id === 'save_draft');
const draft = s => drafts(s).at(-1)?.params || null;
const version = s => drafts(s).length;
const total = d => LINES.reduce((n, [id]) => n + (d?.[id] || 0), 0);
const cut = (d, id) => ORIG[id] - (d?.[id] ?? ORIG[id]);
const balanced = d => !!d && total(d) === TARGET;

// Which line a promise to Maya is about. The rumour is about the fueling station, so that is
// the default when the student does not name one.
const lineIn = text => {
  const t = text.toLowerCase();
  if (/tutor/.test(t)) return 'tutoring';
  if (/psycholog|counsel/.test(t)) return 'counselor';
  if (/travel|charter|bus/.test(t)) return 'travel';
  if (/light/.test(t)) return 'lights';
  if (/summer/.test(t)) return 'summeraid';
  return 'fueling';
};

export default {
  id: 'mgt340-the-shortfall',
  version: 1,
  title: 'The Shortfall',
  course: 'MGT 340 · College athletics',
  role: 'Director of Athletics, Wissahickon University',
  clock: { start: at(TUE, 13, 30), end: at(TUE, 17), days: ['Tue', 'Wed'] },
  costs: { message: 10, open: 5, act: 10 },
  limits: { message: 900 },
  lines: LINES, target: TARGET,

  // ---------------------------------------------------------------- people
  actors: {
    maya: {
      name: 'Maya Okonkwo', role: 'Women’s soccer captain and SAAC vice-president, age 21', channel: 'Text', trust: 0,
      voice: 'Twenty-one, a senior, direct and a little out of breath between class and practice. Texts in lowercase, short bursts, the odd "??". Not hostile; she needs something true she can repeat to twenty-six teammates. Never uses budget words like "allocation" or "line item".',
      wants: 'A straight answer she can give the team at 3:30, and for athletes to hear about cuts from the AD rather than from a rumour.',
      fears: 'Standing in front of the team and repeating something that turns out to be false. Being the captain who "got handled".',
      concern: s => flag(s, 'brushed_off') ? 'You asked a direct question and got brushed off. You have stopped expecting a straight answer.'
        : open(s, 'C_keep') || open(s, 'C_nocuts') ? 'The AD gave you an answer. You have told the team, or are about to, and your name is now on it.'
        : flag(s, 'process_explained') ? 'You know a cut is coming and nothing is final. You want to know what it means for the fueling station and when athletes will hear.'
        : 'You heard at lunch that the fueling station is being cut entirely. Practice is at 3:30 and the team will ask you. You want to know if it is true.',
    },
    ellen: {
      name: 'Ellen Marsh', role: 'Associate Vice President for Finance', channel: 'Email', trust: 0,
      voice: 'Precise, unhurried, polite. Short complete sentences, numbers written out in full. Has no view on which programme matters more; cares whether the total is right and the savings are real.',
      wants: 'A revised plan that totals exactly $400,000, with savings that are real, on her desk by 5:00 PM.',
      fears: 'A budget that balances on paper and not in practice. Being asked in January why money was spent twice.',
      concern: s => balanced(draft(s)) ? 'You have seen that a balanced draft exists. You are waiting for the final submission.'
        : 'You need a revised plan by 5:00 PM and have not seen one yet.',
    },
    renee: {
      name: 'Renee Coles', role: 'Associate AD for Student-Athlete Services (Dr. Coles)', channel: 'Teams chat', trust: 0,
      voice: 'Warm, organised, a former academic adviser. Numbers her points. Calm until a number threatens an athlete’s eligibility, then very firm. Does not speculate about other departments’ budgets.',
      wants: 'Tutoring hours that cover every academic progress plan, and a sport psychologist in January even if part-time.',
      fears: 'An athlete losing eligibility because the department did not fund hours it requires.',
      concern: s => knows(s, YOU, 'F_app') ? 'The AD knows the tutoring floor. You want to see that it holds in the final numbers.'
        : 'You know the athletic department has to cut $200,000 today. Nobody has asked you what your lines can bear.',
    },
    ruiz: {
      name: 'Tony Ruiz', role: 'Head coach, men’s basketball', channel: 'Text', trust: 0,
      voice: 'Fifty, twenty years in the job, loud and likeable. Texts like he talks: sports metaphors, "listen", "bottom line". Defends his program first. Will own something he said if asked straight.',
      wants: 'The charter travel upgrade, which he has already described to two recruits.',
      fears: 'His team on a six-hour bus to an away game the night before. Looking weak to recruits.',
      concern: s => flag(s, 'ruiz_corrected') ? 'You have agreed to tell your players nothing is decided. You still want your travel money.'
        : 'You heard about the sponsor at this morning’s staff meeting. You want travel protected and you said as much to your players.',
    },
  },

  // ---------------------------------------------------------------- facts
  facts: {
    F_shortfall: { text: 'Keystone Mutual has withdrawn its $200,000 sponsorship. The provisional athlete-experience budget falls from $600,000 to $400,000. A revised plan totalling exactly $400,000 is due to Finance at 5:00 PM today.', initial: [YOU, 'ellen', 'renee', 'ruiz'] },
    F_rumor: { text: 'Athletes are saying the fueling station is being cut entirely.', initial: ['maya'] },
    F_saac: { text: 'Maya has practice at 3:30 PM. SAAC meets at 8:00 PM and some members want to post a statement.', initial: ['maya'] },
    F_heard: { text: 'Maya heard the rumour at lunch from a men’s basketball player, who said Coach Ruiz told the team this morning.', initial: ['maya'] },
    F_breakfast: { text: 'For the early-lift teams (women’s soccer, rowing, track) the fueling station is breakfast: lifts start at 6:00 AM and dining halls open at 7:30.', initial: ['maya'] },
    F_rumor_source: { text: 'At this morning’s team meeting Coach Ruiz told his players the department would “gut the fueling station before it touches travel”.', initial: ['ruiz'], guarded: (s, who) => who === 'ruiz' },
    F_recruits: { text: 'Coach Ruiz has already described the charter travel upgrade to two recruits.', initial: ['ruiz'], guarded: (s, who) => who === 'ruiz' },
    F_charter_signed: { text: 'Of the $130,000 travel line, $40,000 is a signed contract for fall charter buses.', initial: ['ellen'] },
    F_charter_terms: { text: 'Cancelling the fall charter forfeits the full $40,000, so cutting the travel line below $40,000 saves nothing.', initial: ['ellen'] },
    F_app_policy: { text: 'Department policy 4.2: an athlete on an academic progress plan must complete six department-funded tutor hours a week; an unmet plan puts the athlete’s eligibility at risk.', initial: ['renee'] },
    F_app: { text: '38 athletes are on academic progress plans this year. Funding their required tutor hours costs at least $66,000; below that, some plans cannot be met.', initial: ['renee'] },
    F_counselor: { text: 'The sport psychologist contract starts in January and can be reduced to 0.25 FTE ($35,000) without penalty.', initial: ['renee'] },
    F_usage: { text: 'Fueling station records, Sept–Oct: about 410 visits a day; 62% before 9:00 AM.', initial: ['renee'] },
  },

  // ---------------------------------------------------------------- documents
  documents: {
    worksheet: { title: 'Provisional athlete-experience budget — line-item worksheet', kind: 'Budget worksheet', reveals: ['F_charter_signed'], body: [
      'Approved provisionally in September against expected revenue of $600,000, of which $200,000 was the Keystone Mutual sponsorship. These are new initiatives; existing obligations and baseline services are funded separately and are not in this worksheet.',
      'Academic support, tutoring hours — $110,000. Expands the tutoring centre’s evening hours and covers required hours for athletes on academic progress plans (see policy 4.2).',
      'Sport psychologist — $70,000. A 0.5 FTE contract beginning in January. Not yet started.',
      'Fueling station — $90,000. Food and staffing, 6:00 AM to 7:00 PM, in the field house. Vendor is paid monthly.',
      'Charter travel upgrades — $130,000. Replaces the longest van and coach trips with chartered buses. Includes fall charter buses, $40,000, signed August 28.',
      'Turf lighting, extended evening hours — $80,000. Allows field teams to practise until 10:00 PM, reducing 6:00 AM sessions.',
      'Summer school aid — $70,000. Tuition support for athletes taking summer courses.',
      'Uncommitted reserve — $50,000.',
    ] },
    policy: { title: 'Department policy 4.2 — Academic progress plans', kind: 'Department policy', reveals: ['F_app_policy'], body: [
      '4.2.1 An athlete whose term grade-point average falls below the department standard is placed on an academic progress plan for the following term.',
      '4.2.2 Each plan requires six tutor hours a week, scheduled through Student-Athlete Services and funded by the department.',
      '4.2.3 An athlete who does not complete the plan may be withheld from competition. Student-Athlete Services reports plan completion each month.',
      '4.2.4 The number of athletes on plans is set each term by Student-Athlete Services and is not published.',
    ] },
    usage: { title: 'Fueling station usage, Sept–Oct', kind: 'Operations record', reveals: ['F_usage'], body: [
      'Average visits per day: 410. Share of visits before 9:00 AM: 62%.',
      'Highest morning use: rowing, women’s soccer, track and field.',
      'Vendor: paid monthly; hours or menu can change with two weeks’ notice.',
    ] },
  },

  // ---------------------------------------------------------------- what a message can do
  speechActs: {
    promise_keep: { to: ['maya'], describe: 'Promises Maya that a specific line (usually the fueling station) will not be cut, or will be kept or protected.' },
    deny_cuts: { to: ['maya'], describe: 'Tells Maya the rumour is false or that nothing is being cut, without acknowledging that cuts are coming.' },
    explain_process: { to: ['maya'], describe: 'Tells Maya honestly that a sponsor fell through and cuts are coming, but that nothing is final yet, or when it will be decided.' },
    ask_input: { to: ['maya'], describe: 'Asks Maya what matters most to athletes or what a cut would do to them.' },
    ask_source: { to: ['maya', 'ruiz'], describe: 'Asks where the rumour came from, or (to the coach) whether he told his players about cuts.' },
    commit_followup: { to: ['maya'], describe: 'Promises to tell Maya or SAAC the decision, or show her the numbers, before it is final or by a stated time.' },
    minimize: { to: ['maya'], describe: 'Tells Maya not to worry, to focus on practice, that it is just a rumour, or that the AD cannot discuss it.' },
    ask_correct: { to: ['ruiz'], describe: 'Asks the coach to tell his players nothing is decided, or to stop discussing the budget with them.' },
    ask_constraints: { to: ['renee', 'ellen'], describe: 'Asks what cannot be cut: minimums, contracts, commitments, penalties or required amounts.' },
  },

  // Deterministic fallback for offline preview, tests and outages.
  detect(to, text) {
    const t = text.toLowerCase().replace(/[’‘]/g, "'"); const out = [];
    const has = re => re.test(t);
    if (to === 'maya') {
      const process = has(/sponsor|200,?000|\$?200k|shortfall|have to (cut|find|trim|take)|cuts? (are|is) (coming|happening)|nothing('?s| is) (final|decided)|not (final|decided)|haven'?t decided|still deciding|deciding (today|this afternoon|by)/);
      const noPromise = has(/(can'?t|cannot|won'?t|not going to|not able to) promise/);
      const keep = !noPromise && has(/(fueling|fuel station|tutoring|psychologist|travel|lights|summer).{0,30}(isn'?t|is not|won'?t be|will not be|not) (being |getting )?(cut|touched|going anywhere|gone)|(i|we)('?ll| will) (keep|protect|save) (the )?(fueling|fuel|tutoring)|(fueling|fuel station).{0,20}(is )?safe|(keeping|keep) (the )?(fuel|fueling)|(fuel|fueling)( station)? (stays|is staying|will stay)|i promise|you have my word/);
      const deny = !process && has(/nobody('?s| is) cutting|no one('?s| is) cutting|nothing('?s| is) (being|getting) cut|there (are|will be) no cuts|(rumou?r|it)('?s| is) (false|not true)|that'?s not true|isn'?t true/);
      if (keep) out.push('promise_keep');
      if (deny) out.push('deny_cuts');
      if (process) out.push('explain_process');
      if (has(/what (matters|would matter|do (you|athletes|people) (need|use|want)|would hurt|would help)|what('?s| is) most important|if you had to (pick|choose)|how (much|often) do (you|people|athletes) use/)) out.push('ask_input');
      if (has(/where did you hear|who (told|said)|where('?s| is) (that|this) coming from|where did (that|this|it) come from|who did you hear/)) out.push('ask_source');
      if (has(/i('?ll| will| promise to) (let you know|tell you|come to|talk to (saac|the team|you)|update you|get back to you|text you|show you|walk you)|before (it'?s|it is|anything is|i submit|i send)|i'?ll have (an answer|the numbers|something)|you'?ll hear (it )?from me/)) out.push('commit_followup');
      if (has(/don'?t worry|focus on (practice|soccer|the game|school)|can'?t (talk|discuss|comment|get into)|just a rumou?r|ignore (it|the rumou?r)/)) out.push('minimize');
    } else if (to === 'ruiz') {
      if (has(/did you (tell|say|mention)|where('?s| is) (that|this) coming from|who (told|said)|(told|telling) your (players|guys|team)/)) out.push('ask_source');
      if (has(/(tell|let) (your|the) (players|guys|team) (that )?(nothing|it'?s not|we haven'?t)|tell them (that )?(nothing|it'?s not)|nothing('?s| is) (decided|final)|correct (it|that|this)|walk (it|that) back|stop (saying|telling)|please don'?t (say|tell|talk)|keep (budget|it|this) (talk )?out of/)) out.push('ask_correct');
    } else if (to === 'renee' || to === 'ellen') {
      if (has(/minimum|floor|can'?t (be )?(cut|move)|cannot (be )?(cut|move)|contract|committed|locked|obligat|penalt|how low|required|what (can|can'?t) (move|go)|anything (i|we) (can'?t|shouldn'?t) (cut|touch)/)) out.push('ask_constraints');
    }
    return out;
  },

  // ---------------------------------------------------------------- how it starts
  opening: () => [
    { say: { from: 'ellen', voice: false, text: 'Keystone Mutual has withdrawn its sponsorship. That was $200,000 of the $600,000 provisional athlete-experience budget. I need a revised plan totalling exactly $400,000 from you by 5:00 PM today. Existing obligations and baseline services are funded separately and are not in play.' } },
    { say: { from: 'maya', voice: false, text: 'hey sorry to text you directly. someone said at lunch you’re cutting the fueling station. like all of it?? is that true. i have practice at 3:30 and the team is going to ask me. saac meets at 8 tonight too and people already want to post something' } },
    { learn: { who: YOU, fact: 'F_rumor', via: 'maya' } }, { learn: { who: YOU, fact: 'F_saac', via: 'maya' } },
    { at: at(TUE, 15, 30), id: 'practice' },
    { at: at(TUE, 16, 30), id: 'ellen_nudge' },
  ],

  // ---------------------------------------------------------------- rules
  rules: [
    { id: 'maya_promised', why: 'The AD told Maya a line would not be cut. She was relieved, and it became the answer she would give her team.',
      when: (s, ev) => isMsg(ev, 'maya', 'promise_keep') && !s.commitments.C_keep,
      then: (s, ev) => { const line = lineIn(ev.text); return [
        { commit: { id: 'C_keep', to: 'maya', line, label: `You told Maya the ${LABEL[line].toLowerCase()} would not be cut`, quote: ev.text } },
        { trust: { who: 'maya', delta: 2, why: 'got a clear answer' } }, { flag: { key: 'answered' } },
        { say: { from: 'maya', text: 'ok. thank you. seriously. that’s what i’ll tell them at 3:30.', must: `Relieved. Thanks the AD and says she will tell the team at practice that the ${LABEL[line].toLowerCase()} is not being cut.` } } ]; } },
    { id: 'maya_denied', why: 'The AD told Maya nothing was being cut. She believed it and planned to say so at practice — but $200,000 was being cut that afternoon.',
      when: (s, ev) => isMsg(ev, 'maya', 'deny_cuts') && !s.commitments.C_nocuts && !s.commitments.C_keep,
      then: (s, ev) => [
        { commit: { id: 'C_nocuts', to: 'maya', label: 'You told Maya nothing was being cut', quote: ev.text } },
        { trust: { who: 'maya', delta: 1, why: 'was reassured' } }, { flag: { key: 'answered' } },
        { say: { from: 'maya', text: 'wait so it’s fake? ok good. i’ll tell them it’s not happening', must: 'Relieved: so the rumour is false. Says she will tell the team it is not happening.' } }] },
    { id: 'maya_process', why: 'The AD told Maya the truth: a cut is coming and nothing is final. It was less comforting and more usable.',
      when: (s, ev) => isMsg(ev, 'maya', 'explain_process') && !flag(s, 'process_explained'),
      then: () => [{ flag: { key: 'process_explained' } }, { flag: { key: 'answered' } }, { trust: { who: 'maya', delta: 1, why: 'was told the truth' } },
        { say: { from: 'maya', text: 'ok so something IS getting cut. i’d rather know that. is it the fueling station? and what do i say at 3:30, that it’s not decided?', must: 'Takes in that a cut is coming and nothing is final; would rather know. Asks whether the fueling station is part of it and what she should tell the team at practice.' } }] },
    { id: 'maya_input', why: 'Asked what mattered, Maya told the AD something no document said: for early-lift teams the fueling station is breakfast.',
      when: (s, ev) => isMsg(ev, 'maya', 'ask_input'),
      then: () => [{ learn: { who: YOU, fact: 'F_breakfast', via: 'maya' } }, { trust: { who: 'maya', delta: 1, why: 'was asked' } },
        { say: { from: 'maya', text: 'honestly the fueling station. we lift at 6, dining hall doesn’t open till 7:30, so for us and rowing and track that IS breakfast. the travel stuff is mostly hoops. tutoring matters a lot to the people who have to do hours.', must: 'Says the fueling station matters most: early-lift teams (her team, rowing, track) lift at 6 AM and the dining hall opens at 7:30, so it is their breakfast. Travel mostly benefits basketball. Tutoring matters to athletes who have required hours.' } }] },
    { id: 'maya_source', why: 'Asked where she heard it, Maya named the source: a basketball player quoting his coach.',
      when: (s, ev) => isMsg(ev, 'maya', 'ask_source'),
      then: () => [{ learn: { who: YOU, fact: 'F_heard', via: 'maya' } },
        { say: { from: 'maya', text: 'one of the hoops guys at lunch. he said coach ruiz told them this morning.', must: 'Heard it at lunch from a men’s basketball player, who said Coach Ruiz told the team this morning.' } }] },
    { id: 'maya_followup', why: 'The AD promised to tell Maya before the decision was final. She will hold them to it.',
      when: (s, ev) => isMsg(ev, 'maya', 'commit_followup') && !s.commitments.C_followup,
      then: (s, ev) => [{ commit: { id: 'C_followup', to: 'maya', label: 'You told Maya she would hear the decision from you before it was final', quote: ev.text } },
        { trust: { who: 'maya', delta: 1, why: 'was promised a heads-up' } },
        ...(ev.acts.some(a => ['promise_keep', 'deny_cuts', 'explain_process', 'ask_input', 'ask_source'].includes(a)) ? [] : [{ say: { from: 'maya', text: 'ok. holding you to that.', must: 'Accepts, and says she is holding the AD to it.' } }])] },
    { id: 'maya_brushed', why: 'The AD told Maya not to worry without answering her question. She took that as the answer.',
      when: (s, ev) => isMsg(ev, 'maya', 'minimize') && !ev.acts.some(a => ['promise_keep', 'deny_cuts', 'explain_process'].includes(a)) && !flag(s, 'answered'),
      then: () => [{ flag: { key: 'brushed_off' } }, { flag: { key: 'answered' } }, { trust: { who: 'maya', delta: -2, why: 'was brushed off' } },
        { say: { from: 'maya', text: 'ok. so i tell them nothing. cool.', must: 'Flat. Takes it as a non-answer: she will have nothing to tell the team.' } }] },
    { id: 'maya_hedged', once: false, why: 'The AD wrote back without answering Maya’s question, so she asked again.',
      when: (s, ev) => isMsg(ev, 'maya') && ev.acts.length === 0 && !flag(s, 'answered') && s.t < at(TUE, 15, 30),
      then: () => [{ say: { from: 'maya', text: 'sorry but is it true or not?? i need something to tell them at 3:30', must: 'Asks again, politely but urgently, whether it is true; she needs something to tell the team at 3:30.' } }] },

    { id: 'ruiz_source', why: 'Asked straight, Coach Ruiz owned what he had told his players.',
      when: (s, ev) => isMsg(ev, 'ruiz', 'ask_source'),
      then: () => [{ learn: { who: YOU, fact: 'F_rumor_source', via: 'ruiz' } }, { learn: { who: YOU, fact: 'F_recruits', via: 'ruiz' } }, { flag: { key: 'ruiz_admitted' } },
        { say: { from: 'ruiz', text: 'Listen, yeah, I said it. Told my guys this morning they’d gut the fueling station before they touched travel. I’ve already sold two recruits on that charter. Bottom line, don’t make me a liar.', must: 'Admits he told his players this morning the department would gut the fueling station before touching travel. Says he has already described the charter travel to two recruits and does not want to be made a liar.' } }] },
    { id: 'ruiz_correct', why: 'The AD asked Coach Ruiz to tell his players nothing was decided. He agreed, grudgingly.',
      when: (s, ev) => isMsg(ev, 'ruiz', 'ask_correct'),
      then: () => [{ flag: { key: 'ruiz_corrected' } },
        { say: { from: 'ruiz', text: 'Fine. I’ll tell them nothing’s decided. But protect my charter money.', must: 'Grudgingly agrees to tell his players nothing is decided. Asks the AD to protect the travel money.' } }] },

    { id: 'renee_constraints', why: 'The AD asked Student-Athlete Services what could not move, and learned the tutoring floor that no document stated.',
      when: (s, ev) => isMsg(ev, 'renee', 'ask_constraints'),
      then: () => [{ learn: { who: YOU, fact: 'F_app', via: 'renee' } }, { learn: { who: YOU, fact: 'F_app_policy', via: 'renee' } }, { learn: { who: YOU, fact: 'F_counselor', via: 'renee' } },
        { say: { from: 'renee', voice: false, text: 'Two things. 1) 38 athletes are on academic progress plans this year. Under policy 4.2 each needs six tutor hours a week, and covering those hours costs at least $66,000. Below that I cannot meet every plan, and those athletes’ eligibility is at risk. 2) The sport psychologist contract starts in January and can drop to 0.25 FTE, $35,000, with no penalty. The rest of my lines can move.' } }] },
    { id: 'ellen_constraints', why: 'The AD asked Finance what was committed, and learned that $40,000 of travel could not be saved.',
      when: (s, ev) => isMsg(ev, 'ellen', 'ask_constraints'),
      then: () => [{ learn: { who: YOU, fact: 'F_charter_signed', via: 'ellen' } }, { learn: { who: YOU, fact: 'F_charter_terms', via: 'ellen' } },
        { say: { from: 'ellen', voice: false, text: '$40,000 of the travel line is the signed fall charter. Cancelling it forfeits the full $40,000, so the travel line cannot usefully go below $40,000. Nothing else in the worksheet is committed until you submit. The total must be exactly $400,000.' } }] },
  ],

  // ---------------------------------------------------------------- timers
  timers: {
    practice: s => {
      const said = (s.threads.maya || []).some(m => m.from === YOU);
      const c = s.commitments.C_keep?.status === 'open' ? s.commitments.C_keep : s.commitments.C_nocuts?.status === 'open' ? s.commitments.C_nocuts : null;
      const sawDraft = flag(s, 'seen_maya');
      if (flag(s, 'brushed_off')) return [{ flag: { key: 'rumor_spread' } }, { trust: { who: 'maya', delta: -1, why: 'had nothing to tell the team' } },
        { note: '3:30 PM. Maya told the team the AD would not say. By the end of warm-ups the women’s soccer team believed the fueling station was gone.' }];
      if (c) return [{ flag: { key: 'promise_public' } },
        { note: `3:30 PM. Maya told the team, and then the SAAC group chat, what the AD had said: “${c.quote}”` }];
      if (sawDraft) return [{ flag: { key: 'team_informed' } }, { note: '3:30 PM. Maya told the team the sponsor had fallen through, showed them roughly what the AD’s draft did to the fueling station, and said it was not final.' }];
      if (flag(s, 'process_explained')) return [{ flag: { key: 'team_informed' } }, { note: '3:30 PM. Maya told the team that a sponsor had fallen through, that cuts were coming, and that nothing was final yet.' }];
      if (!said) return [{ flag: { key: 'rumor_spread' } }, { trust: { who: 'maya', delta: -1, why: 'no reply before practice' } },
        { note: '3:30 PM. Maya went to practice with nothing from you. The rumour stood: the fueling station was gone.' },
        { say: { from: 'maya', text: 'at practice. never heard back. guess that’s an answer', must: 'At practice; never heard back; takes the silence as an answer.' } }];
      return [{ flag: { key: 'rumor_spread' } }, { note: '3:30 PM. Maya went to practice without an answer she could repeat. The rumour stood.' }];
    },
    ellen_nudge: s => balanced(draft(s)) ? [] : [{ say: { from: 'ellen', voice: false, text: 'Thirty minutes. I do not yet have a draft that totals $400,000. Please save one before 5:00 PM.' } }],
  },
  timerWhy: {
    practice: '3:30 PM: Maya went to practice and told the team whatever she had.',
    ellen_nudge: '4:30 PM: Finance checked for a balanced draft.',
  },

  // ---------------------------------------------------------------- formal actions
  acts: {
    save_draft: {
      label: 'Save this draft to the file', blurb: 'Records the amounts on the board as a dated draft. Only you can see it until you show it to someone.', cost: 10,
      fields: LINES.map(([id, label, amt]) => ({ id, label, type: 'number', min: 0, max: amt, step: 5000 })),
      clean: p => Object.fromEntries(LINES.map(([id, , amt]) => { const n = Math.round(Number(p[id]) / 1000) * 1000; return [id, Number.isFinite(n) ? Math.min(amt, Math.max(0, n)) : amt]; })),
      effect: (s, p) => { const n = total(p), gap = n - TARGET;
        return [{ note: `Draft ${version(s)} saved: ${money(n)}${gap === 0 ? ', balanced.' : gap > 0 ? `, ${money(gap)} over the $400,000 envelope.` : `, ${money(-gap)} under the envelope.`}` }]; },
    },
    brief: {
      label: 'Show the latest draft to…', blurb: 'They see every line of your latest saved draft and will react to what it does to them.', cost: 10,
      fields: [{ id: 'who', label: 'Show it to', type: 'select', options: [['maya', 'Maya Okonkwo (SAAC)'], ['renee', 'Renee Coles (Student-Athlete Services)'], ['ruiz', 'Tony Ruiz (men’s basketball)'], ['ellen', 'Ellen Marsh (Finance)']] }],
      available: s => !!draft(s),
      clean: p => ({ who: ['maya', 'renee', 'ruiz', 'ellen'].includes(p.who) ? p.who : 'ellen' }),
      effect: (s, p) => {
        const d = draft(s), v = version(s), fx = [{ flag: { key: `seen_${p.who}`, value: v } }];
        if (p.who === 'maya') {
          const c = s.commitments.C_keep, fc = cut(d, 'fueling');
          if (open(s, 'C_keep') && cut(d, c.line) > 0) return [...fx, { resolve: { id: 'C_keep', status: 'revised' } }, { trust: { who: 'maya', delta: -1, why: 'promise taken back, but shown first' } },
            { say: { from: 'maya', text: `you told me the ${LABEL[c.line].toLowerCase()} wasn’t getting cut. this cuts it by ${k(cut(d, c.line))}. …ok. at least you showed me before it went in.`, must: `Hurt: the AD had said the ${LABEL[c.line].toLowerCase()} would not be cut, and this draft cuts it by ${money(cut(d, c.line))}. Accepts it a little because she was shown before it was final.` } }];
          if (open(s, 'C_nocuts')) return [...fx, { resolve: { id: 'C_nocuts', status: 'revised' } }, { trust: { who: 'maya', delta: -1, why: 'reassurance taken back' } },
            { say: { from: 'maya', text: `you said nothing was getting cut. this is $200k of cuts. fueling station down ${k(fc)}. i already told people it was fake`, must: `Upset: the AD had said nothing was being cut; this draft cuts $200,000, including ${money(fc)} from the fueling station. She has already told people the rumour was false.` } }];
          return [...fx, { trust: { who: 'maya', delta: 1, why: 'was shown the numbers' } },
            { say: { from: 'maya', text: fc === 0 ? 'ok. fueling station stays whole. thank you for showing me. i can explain the rest.' : fc <= 30000 ? `fueling down ${k(fc)}. that hurts but i can explain it. thank you for showing me first.` : `that’s ${k(fc)} off the fueling station. that’s breakfast for half of us. i’ll take it to saac but they’re not going to like it.`,
              must: fc === 0 ? 'Relieved the fueling station is untouched; thanks the AD for showing her; says she can explain the rest.' : fc <= 30000 ? `Notes the fueling station is cut by ${money(fc)}; it hurts but she can explain it; thanks the AD for showing her first.` : `Dismayed that the fueling station is cut by ${money(fc)}; says it is breakfast for many athletes; will take it to SAAC but they will not like it.` } }];
        }
        if (p.who === 'renee') {
          if (d.tutoring < APP_FLOOR) return [...fx, { learn: { who: YOU, fact: 'F_app', via: 'renee' } }, { learn: { who: YOU, fact: 'F_app_policy', via: 'renee' } },
            { say: { from: 'renee', voice: false, text: `This puts tutoring at ${money(d.tutoring)}. 38 athletes are on academic progress plans, and under policy 4.2 their required hours cost at least $66,000. At ${money(d.tutoring)} I cannot meet every plan. Which athletes would you like me to tell?` } }];
          return [...fx, { say: { from: 'renee', voice: false, text: `Tutoring at ${money(d.tutoring)} covers every academic progress plan. ${d.counselor >= 35000 ? 'The sport psychologist can start in January.' : 'Below $35,000 the sport psychologist cannot start in January at all.'} I can work with this.` } }];
        }
        if (p.who === 'ruiz') {
          const tc = cut(d, 'travel');
          return [...fx, tc > 50000
            ? { say: { from: 'ruiz', text: `You’re taking ${k(tc)} off travel? Listen, that’s my guys on a six-hour bus the night before a game. I’ve got recruits asking about this.`, must: `Angry that travel is cut by ${money(tc)}: his team will ride long buses the night before games; recruits have asked about it.` } }
            : { say: { from: 'ruiz', text: `Travel down ${k(tc)}. I can live with that. Appreciate you looking out for us.`, must: `Accepts a ${money(tc)} travel cut and thanks the AD.` } }];
        }
        const n = total(d);
        return [...fx, { say: { from: 'ellen', voice: false, text: n !== TARGET ? `This totals ${money(n)}. I need exactly $400,000.` : d.travel < CHARTER ? `This totals $400,000, but it puts travel at ${money(d.travel)}. $40,000 of travel is a signed charter that will be paid regardless, so ${money(CHARTER - d.travel)} of these savings is not real.` : 'This totals $400,000 and the savings are real. Submit it when you are ready.' } }];
      },
    },
  },

  fallbackReply(s, who) {
    return ({
      maya: flag(s, 'brushed_off') ? 'k.' : flag(s, 'answered') ? 'ok. just tell me when you know more.' : 'is it true or not? i need something for practice',
      ellen: 'I can only speak to the numbers. I need a revised plan totalling $400,000 by 5:00 PM.',
      renee: knows(s, YOU, 'F_app') ? 'As long as tutoring stays at or above the plan floor, I can manage the rest.' : 'Happy to help. What would you like to know about my lines?',
      ruiz: flag(s, 'ruiz_corrected') ? 'I said I’d handle my guys. Protect the charter.' : 'Bottom line, travel is recruiting. What do you need from me?',
    })[who] || '…';
  },

  cleanMemo: m => ({ cuts: String(m.cuts || '').slice(0, 900), athletes: String(m.athletes || '').slice(0, 900) }),
  memoFields: [
    { id: 'cuts', label: 'To Ellen Marsh: what you cut, and why' },
    { id: 'athletes', label: 'What athletes will hear from you, and when' },
  ],

  // Shared describe() hook: case-specific wording for the timeline and the student's file.
  describeEvent(e) {
    if (e.type === 'run.started') return { kind: 'world', text: 'The budget file opens.' };
    if (e.type === 'run.ended') return { kind: 'world', text: '5:00 PM. Finance’s deadline has passed.' };
    if (e.type === 'run.submitted') return { kind: 'you', text: 'Revised budget submitted to Finance.' };
    if (e.type === 'student.act' && e.act === 'save_draft') return { kind: 'you', text: `Saved a draft: ${LINES.map(([id]) => `${LABEL[id]} ${k(e.params[id])}`).join(' · ')} (total ${k(total(e.params))})` };
    if (e.type === 'student.act' && e.act === 'brief') return { kind: 'you', text: `Showed the latest draft to ${({ maya: 'Maya', renee: 'Renee', ruiz: 'Coach Ruiz', ellen: 'Ellen' })[e.params.who]}` };
    return null;
  },

  // ---------------------------------------------------------------- after submission
  afterSubmit(s) {
    const d = draft(s), v = version(s), fx = [];
    if (!d) fx.push({ flag: { key: 'finance_returned', value: 'no draft' } }, { note: '5:00 PM. Finance has no saved draft from you. Ellen returns the file and asks for one by 9:00 AM.' });
    else if (total(d) !== TARGET) fx.push({ flag: { key: 'finance_returned', value: 'unbalanced' } }, { note: `5:00 PM. Ellen returns the budget: it totals ${money(total(d))}, not $400,000.` });
    else if (d.travel < CHARTER) fx.push({ flag: { key: 'finance_returned', value: 'charter' } }, { note: `5:00 PM. Ellen returns the budget: travel at ${money(d.travel)} is below the $40,000 signed charter, so ${money(CHARTER - d.travel)} of the cut is money that will be spent anyway.` });
    else fx.push({ flag: { key: 'finance_accepted' } }, { note: '5:00 PM. Finance accepts the revised plan.' });

    const kc = s.commitments.C_keep, keepBroken = open(s, 'C_keep') && d && cut(d, kc.line) > 0;
    const nocutsBroken = open(s, 'C_nocuts');
    const sawFinal = d && flag(s, 'seen_maya') === v;
    const followBroken = open(s, 'C_followup') && !sawFinal;
    if (open(s, 'C_keep')) fx.push({ resolve: { id: 'C_keep', status: keepBroken ? 'broken' : 'kept' } });
    if (nocutsBroken) fx.push({ resolve: { id: 'C_nocuts', status: 'broken' } });
    if (open(s, 'C_followup')) fx.push({ resolve: { id: 'C_followup', status: followBroken ? 'broken' : 'kept' } });

    const fc = d ? cut(d, 'fueling') : 0;
    const broken = keepBroken ? kc : nocutsBroken ? s.commitments.C_nocuts : null;
    if (broken && flag(s, 'promise_public')) fx.push({ flag: { key: 'saac_quote' } }, { trust: { who: 'maya', delta: -4, why: 'repeated a promise that was broken' } },
      { note: `8:00 PM. SAAC posts on Instagram: “At ${clock(broken.t)} our captain was told by the AD: ‘${broken.quote}’ At 5 PM the department cut ${money(200000)}${fc ? `, including ${money(fc)} from the fueling station` : ''}.” Maya’s name is on the screenshot.` });
    else if (broken) fx.push({ flag: { key: 'maya_burned' } }, { trust: { who: 'maya', delta: -3, why: 'promise broken' } },
      { note: '8:00 PM. Maya tells the SAAC officers privately what you told her and what the budget did. SAAC asks for a meeting. Maya says she will not be the one to set it up.' });
    else if (sawFinal) fx.push({ flag: { key: 'saac_briefed' } },
      { note: `8:00 PM. Maya walks SAAC through the numbers she saw before Finance did. ${fc ? `The officers do not like the ${money(fc)} fueling cut, but` : 'The fueling station is whole;'} they post nothing and invite you to their next meeting.` });
    else if (flag(s, 'rumor_spread')) fx.push({ flag: { key: 'saac_rumor' } },
      { note: `8:00 PM. SAAC posts: “The fueling station is being cut. Nobody from the department will tell us anything.” ${d && fc < ORIG.fueling ? `Your budget ${fc ? `cuts it by ${money(fc)}, not all of it` : 'does not cut it at all'}; the post is still up on Wednesday.` : ''}` });
    else if (flag(s, 'promise_public')) fx.push({ flag: { key: 'saac_reassured' } },
      { note: '8:00 PM. SAAC posts nothing. The captain had told them the AD protected what she was asked about, and the budget did.' });
    else fx.push({ flag: { key: 'saac_waiting' } }, { note: '8:00 PM. SAAC decides to wait for the official budget. Maya asks you to come to the next meeting.' });
    if (followBroken && !broken) fx.push({ note: `Maya had been told: “${s.commitments.C_followup.quote}” She learned the final numbers from the SAAC chat.` });

    if (d && d.tutoring < APP_FLOOR) fx.push({ flag: { key: 'app_short' } },
      { note: `Wednesday 9:00 AM. Dr. Coles writes: tutoring at ${money(d.tutoring)} cannot cover the required hours for all 38 athletes on academic progress plans. She asks which athletes should be told their plans are unfunded.` });
    if (d && fc >= 45000) fx.push({ note: `Wednesday 6:00 AM. With ${money(d.fueling)} for the year, the fueling station opens with shakes only. Rowing, women’s soccer and track lift at 6:00; the dining hall opens at 7:30.` });
    if (flag(s, 'ruiz_admitted') && !flag(s, 'ruiz_corrected')) fx.push({ note: 'Coach Ruiz never told his players anything different. The men’s basketball team still believes the fueling station was “gutted to save travel”.' });
    return fx;
  },

  // ---------------------------------------------------------------- evidence, not a score
  outcome(s, events) {
    const d = draft(s), v = version(s);
    const flagSeq = key => s.flags[key]?.seq;
    const promises = ['C_keep', 'C_nocuts', 'C_followup'].map(id => s.commitments[id]).filter(Boolean)
      .map(c => ({ label: c.label, quote: c.quote, status: c.status, seq: c.seq, resolvedSeq: c.resolvedSeq }));
    const maya = flag(s, 'saac_quote') ? ['Her name is on a broken promise', 'She repeated the AD’s words to her team and the SAAC chat. The budget contradicted them.', flagSeq('saac_quote')]
      : flag(s, 'maya_burned') ? ['Feels burned', 'The AD’s words to her did not survive the budget. She will not front the next conversation.', flagSeq('maya_burned')]
      : flag(s, 'saac_briefed') ? ['Briefed before Finance', 'She saw the final numbers first and could explain them to SAAC.', flagSeq('saac_briefed')]
      : flag(s, 'brushed_off') ? ['Brushed off', 'She asked a direct question and went to practice with nothing.', flagSeq('brushed_off')]
      : flag(s, 'rumor_spread') ? ['Went to practice without an answer', 'The rumour she was asked about was never answered.', flagSeq('rumor_spread')]
      : flag(s, 'team_informed') ? ['Told the truth, waiting for numbers', 'She knew cuts were coming and nothing was final; she did not see the final plan.', flagSeq('team_informed')]
      : ['Reassured', 'What she was told held.', flagSeq('saac_reassured')];
    const saac = flag(s, 'saac_quote') ? ['Posted the AD’s words', 'The post quotes what the AD told the captain.', flagSeq('saac_quote')]
      : flag(s, 'saac_rumor') ? ['Posted the rumour', 'The post says the fueling station is gone and nobody will talk to athletes.', flagSeq('saac_rumor')]
      : flag(s, 'saac_briefed') ? ['No post; invited the AD', 'They heard the numbers from their own officer first.', flagSeq('saac_briefed')]
      : flag(s, 'maya_burned') ? ['Asked for a meeting', 'No post, but the officers want answers.', flagSeq('maya_burned')]
      : ['No post', flag(s, 'saac_reassured') ? 'The captain’s reassurance held.' : 'They are waiting for the official budget.', flagSeq('saac_reassured') ?? flagSeq('saac_waiting')];
    const fin = flag(s, 'finance_accepted') ? ['Accepted', 'The plan totals $400,000 and the savings are real.', flagSeq('finance_accepted')]
      : ['Returned', ({ 'no draft': 'No draft was saved.', unbalanced: `The plan totals ${d ? money(total(d)) : '—'}.`, charter: 'Part of the cut was a signed charter that will be paid anyway.' })[flag(s, 'finance_returned')] || 'Returned.', flagSeq('finance_returned')];
    const app = !d ? ['Unchanged for now', 'No plan was accepted.', undefined]
      : flag(s, 'app_short') ? ['Plans unfunded', `Tutoring at ${money(d.tutoring)} is below the $66,000 the 38 plans require.`, flagSeq('app_short')]
      : ['Covered', `Tutoring at ${money(d.tutoring)} covers every academic progress plan.`, undefined];
    return {
      people: [
        { who: 'Maya', headline: maya[0], detail: maya[1], seq: maya[2] },
        { who: 'SAAC', headline: saac[0], detail: saac[1], seq: saac[2] },
        { who: 'Finance', headline: fin[0], detail: fin[1], seq: fin[2] },
        { who: 'Academic progress plans', headline: app[0], detail: app[1], seq: app[2] },
      ],
      promises,
      budget: d ? LINES.map(([id, label, amt]) => ({ id, label, was: amt, now: d[id] })) : null,
      drafts: v, mayaSaw: flag(s, 'seen_maya') || 0,
      found: { tutoringFloor: knows(s, YOU, 'F_app'), charter: knows(s, YOU, 'F_charter_terms') || knows(s, YOU, 'F_charter_signed'), breakfast: knows(s, YOU, 'F_breakfast'), source: knows(s, YOU, 'F_rumor_source') || knows(s, YOU, 'F_heard') },
      aftermath: s.notes.filter(n => n.seq > (s.submitted?.seq ?? Infinity)).map(n => n.text),
    };
  },

  // ---------------------------------------------------------------- for the instructor
  signals(s) {
    const out = []; const d = draft(s);
    const kc = s.commitments.C_keep, nc = s.commitments.C_nocuts, fc = s.commitments.C_followup;
    const tone = c => c.status === 'open' ? 'warn' : c.status === 'broken' ? 'bad' : 'ok';
    if (kc) out.push({ label: `Promised ${LABEL[kc.line].toLowerCase()} safe${kc.status !== 'open' ? ' · ' + kc.status : ''}`, tone: tone(kc), seq: kc.seq });
    if (nc) out.push({ label: `Said “no cuts”${nc.status !== 'open' ? ' · ' + nc.status : ''}`, tone: nc.status === 'revised' ? 'warn' : 'bad', seq: nc.seq });
    if (flag(s, 'process_explained')) out.push({ label: 'Explained: cut coming, not final', tone: 'ok', seq: s.flags.process_explained.seq });
    if (flag(s, 'brushed_off')) out.push({ label: 'Brushed Maya off', tone: 'bad', seq: s.flags.brushed_off.seq });
    if (flag(s, 'rumor_spread')) out.push({ label: 'No answer by practice', tone: 'bad', seq: s.flags.rumor_spread.seq });
    if (fc) out.push({ label: `Promised a heads-up${fc.status !== 'open' ? ' · ' + fc.status : ''}`, tone: tone(fc), seq: fc.seq });
    if (knows(s, YOU, 'F_breakfast')) out.push({ label: 'Learned: fueling = breakfast', tone: 'ok', seq: s.knows[YOU].F_breakfast.seq });
    if (knows(s, YOU, 'F_app')) out.push({ label: 'Found tutoring floor', tone: 'ok', seq: s.knows[YOU].F_app.seq });
    if (knows(s, YOU, 'F_charter_terms')) out.push({ label: 'Found charter terms', tone: 'ok', seq: s.knows[YOU].F_charter_terms.seq });
    if (flag(s, 'ruiz_admitted')) out.push({ label: 'Traced rumour to Ruiz', tone: 'ok', seq: s.flags.ruiz_admitted.seq });
    if (d) out.push({ label: `Draft ${version(s)}: ${k(total(d))}`, tone: balanced(d) ? 'ok' : 'warn' });
    if (flag(s, 'seen_maya')) out.push({ label: `Maya saw draft ${flag(s, 'seen_maya')}`, tone: 'ok', seq: s.flags.seen_maya.seq });
    if (flag(s, 'saac_quote')) out.push({ label: 'SAAC quoted the AD', tone: 'bad', seq: s.flags.saac_quote.seq });
    if (flag(s, 'saac_rumor')) out.push({ label: 'SAAC posted the rumour', tone: 'bad', seq: s.flags.saac_rumor.seq });
    if (flag(s, 'app_short')) out.push({ label: 'Plans unfunded', tone: 'bad', seq: s.flags.app_short.seq });
    if (flag(s, 'finance_returned')) out.push({ label: 'Finance returned it', tone: 'bad', seq: s.flags.finance_returned.seq });
    return out;
  },
  lenses: [
    { id: 'answer', label: 'What they told Maya',
      value: s => s.commitments.C_keep ? `Promised the ${LABEL[s.commitments.C_keep.line].toLowerCase()} would not be cut` : s.commitments.C_nocuts ? 'Said nothing was being cut' : flag(s, 'process_explained') ? 'A cut is coming; nothing final' : flag(s, 'brushed_off') ? 'Told her not to worry' : 'No answer before practice',
      question: 'One AD gave Maya certainty at 2 PM; the other told her a cut was coming and nothing was final. Which answer could she repeat at practice, and which could the AD still stand behind at 8 PM?' },
    { id: 'where', label: 'Where the $200,000 came from',
      value: s => { const d = draft(s); if (!d) return 'No draft saved'; return LINES.map(([id]) => [id, cut(d, id)]).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, c]) => `${LABEL[id]} −${k(c)}`).join(', ') || 'Nothing cut'; },
      question: 'Both teams found $200,000. For each of their biggest cuts: who was in the thread when it was decided, and who never heard about it until Wednesday?' },
    { id: 'fueling', label: 'Fueling station',
      value: s => { const d = draft(s); return d ? `${k(d.fueling)} (was $90k)` : 'Unchanged (no draft)'; },
      question: 'One team learned that the fueling station is breakfast for three teams; the other never asked. Did knowing it change the number — and should it have?' },
    { id: 'floors', label: 'What they found out could not move',
      value: s => [knows(s, YOU, 'F_app') && 'tutoring floor ($66k)', (knows(s, YOU, 'F_charter_terms') || knows(s, YOU, 'F_charter_signed')) && 'signed charter ($40k)'].filter(Boolean).join(' + ') || 'Nothing',
      question: 'The tutoring floor was in nobody’s document; Renee had it. Before you cut a line, whose job is it to tell you what the line cannot lose — theirs, or yours to ask?' },
    { id: 'shown', label: 'Who saw a draft before Finance',
      value: s => ['maya', 'renee', 'ruiz', 'ellen'].filter(w => flag(s, `seen_${w}`)).map(w => ({ maya: 'Maya', renee: 'Renee', ruiz: 'Ruiz', ellen: 'Ellen' })[w]).join(', ') || 'Nobody',
      question: 'One AD showed a student-athlete the numbers before they were final. Is that transparency, a promise in itself, or a risk to the department? What would you have needed to say alongside it?' },
    { id: 'finance', label: 'Finance’s verdict',
      value: s => flag(s, 'finance_accepted') ? 'Accepted' : flag(s, 'finance_returned') ? `Returned (${flag(s, 'finance_returned')})` : 'Not yet submitted',
      question: 'One budget balanced on paper and not in practice. What did that team not know, and who in this building knew it?' },
  ],

  // ---------------------------------------------------------------- scripted sample teams
  samples: [
    { team: 'Team Alder (sample)', members: 'Fictional', note: 'Promised the fueling station was safe and kept the promise by cutting tutoring below the plan floor without asking.', steps: [
      { type: 'message', to: 'maya', text: 'The fueling station is not being cut, I promise. Tell the team that from me.', acts: ['promise_keep'] },
      { type: 'open', doc: 'worksheet' },
      { type: 'act', act: 'save_draft', params: { tutoring: 60000, counselor: 40000, fueling: 90000, travel: 90000, lights: 60000, summeraid: 40000, reserve: 20000 } },
      { type: 'act', act: 'brief', params: { who: 'ellen' } },
      { type: 'wait' }, { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { cuts: 'Protected the fueling station as promised; spread the rest across tutoring, travel, lights, summer aid and the reserve.', athletes: 'Maya already knows the fueling station is safe.' } },
    ] },
    { team: 'Team Birch (sample)', members: 'Fictional', note: 'Told Maya the truth, asked what mattered, asked both offices what could not move, showed Maya the final draft first.', steps: [
      { type: 'message', to: 'maya', text: 'Our sponsor fell through, so I have to cut $200,000 from the new budget today. Nothing is final yet. What matters most to your team?', acts: ['explain_process', 'ask_input'] },
      { type: 'message', to: 'maya', text: 'That helps. I will show you the numbers before I send them to Finance.', acts: ['commit_followup'] },
      { type: 'message', to: 'renee', text: 'Before I cut anything: what is the minimum we need in tutoring, and is anything in your lines locked?', acts: ['ask_constraints'] },
      { type: 'message', to: 'ellen', text: 'Is any of the travel line already committed under contract?', acts: ['ask_constraints'] },
      { type: 'open', doc: 'worksheet' },
      { type: 'act', act: 'save_draft', params: { tutoring: 70000, counselor: 35000, fueling: 70000, travel: 60000, lights: 65000, summeraid: 50000, reserve: 50000 } },
      { type: 'act', act: 'brief', params: { who: 'maya' } },
      { type: 'act', act: 'brief', params: { who: 'ellen' } },
      { type: 'wait' }, { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { cuts: 'Kept tutoring above the plan floor, kept travel above the signed charter, reduced the psychologist to 0.25 FTE, trimmed fueling by $20k.', athletes: 'Maya has seen the final numbers; I will attend SAAC next week.' } },
    ] },
    { team: 'Team Cedar (sample)', members: 'Fictional', note: 'Off the expected path: reassured Maya it was only a rumour, then went to the coach who started it, and cut the fueling station to protect travel.', steps: [
      { type: 'message', to: 'maya', text: 'Honestly nobody is cutting anything, it is just a rumor. Don\'t worry about it.', acts: ['deny_cuts', 'minimize'] },
      { type: 'message', to: 'ruiz', text: 'Did you tell your players we are cutting the fueling station? Please tell them nothing is decided.', acts: ['ask_source', 'ask_correct'] },
      { type: 'act', act: 'save_draft', params: { tutoring: 80000, counselor: 70000, fueling: 40000, travel: 100000, lights: 50000, summeraid: 40000, reserve: 20000 } },
      { type: 'act', act: 'brief', params: { who: 'ellen' } },
      { type: 'wait' }, { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { cuts: 'Protected tutoring, the psychologist and most of travel. Fueling station reduced.', athletes: 'I will send a department email next week.' } },
    ] },
    { team: 'Team Dogwood (sample)', members: 'Fictional', note: 'Worked the numbers alone and never answered Maya; cut travel below the signed charter.', steps: [
      { type: 'open', doc: 'worksheet' },
      { type: 'act', act: 'save_draft', params: { tutoring: 90000, counselor: 50000, fueling: 60000, travel: 30000, lights: 60000, summeraid: 60000, reserve: 50000 } },
      { type: 'wait' }, { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { cuts: 'Took most of the cut from charter travel, which serves the fewest athletes.', athletes: 'A department announcement on Thursday.' } },
    ] },
  ],
};
