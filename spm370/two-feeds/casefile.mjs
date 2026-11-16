// TWO FEEDS — SPM 370 (Esports, Video Games, and the Law)
//
// The professional task: a business and legal affairs associate at a tournament organizer
// has three hours to advise the CEO after two partners each claim the right to broadcast
// Saturday's Grand Final. The skill is reading two agreements against each other, noticing
// what the documents do NOT say, asking the one question that fills the gap, and sending
// advice the CEO will act on exactly as written, including what it leaves out.
//
// No imports. Everything is fictional. The only "law" is the text of the documents below.

const YOU = 'you';
const THU = 0;
const at = (h, m = 0) => THU + h * 60 + m;
const knows = (s, who, f) => !!s.knows[who]?.[f];
const flag = (s, k) => s.flags[k]?.value;
const open = (s, id) => s.commitments[id]?.status === 'open';
const isMsg = (ev, to, act) => ev.type === 'student.message' && ev.to === to && (!act || ev.acts.includes(act));
const money = n => '$' + n.toLocaleString('en-US');
const NOTICE_DEADLINE = at(18);

// Pins are part of the ledger so a pod shares them and the instructor sees them live.
const pins = s => { const set = new Set(); for (const a of s.acts) { if (a.id === 'pin') set.add(a.params.clause); if (a.id === 'unpin') set.delete(a.params.clause); } return [...set]; };

const DOCS = {
  lumen: { title: 'Media Rights Agreement — Lumen Live (signed March 4)', kind: 'Agreement', cost: 20, reveals: ['F_excl_english', 'F_carveout', 'F_makegood'], body: [
    { id: 'L1.1', text: '1.1 “Broadcast” means a live audiovisual transmission of the Event carrying English-language commentary.' },
    { id: 'L2.1', text: '2.1 Grant. Organizer grants Lumen the exclusive worldwide right to Broadcast the Event, including the Grand Final.' },
    { id: 'L2.3', text: '2.3 Other languages. Organizer may permit a third party to transmit the Event with commentary in a language other than English, provided Organizer gives Lumen written notice naming the third party no later than 48 hours before that transmission begins.' },
    { id: 'L5.1', text: '5.1 Fee. Lumen will pay Organizer $120,000.' },
    { id: 'L9.2', text: '9.2 Fee reduction. If a third party transmits any part of the Event with English-language commentary with Organizer’s permission, or a transmission under 2.3 proceeds without the required notice, Lumen may reduce the Fee by 40%.' },
    { id: 'L9.4', text: '9.4 Termination. Lumen may terminate only after written notice of breach and five business days to cure.' },
    { id: 'Lsig', text: 'Signed for Organizer: Imani Cole, Chief Executive Officer.' },
  ] },
  parallax: { title: 'Community Partner Agreement — Parallax Network (signed August 19)', kind: 'Agreement', cost: 20, reveals: ['F_grant', 'F_subject', 'F_refund'], body: [
    { id: 'P1', text: '1. Sponsorship. Parallax will pay Organizer $30,000 and be named Presenting Community Partner of the Grand Final.' },
    { id: 'P3', text: '3. Stream. Organizer grants Parallax a non-exclusive right to stream the Grand Final on Parallax’s channels.' },
    { id: 'P7', text: '7. Existing commitments. The rights in clause 3 are subject to Organizer’s media commitments existing at the date of this Agreement. Organizer will tell Parallax in writing of any existing commitment that limits clause 3.' },
    { id: 'P9', text: '9. Withdrawal. If Organizer withdraws the rights in clause 3, Parallax may end its sponsorship and Organizer will refund the amount paid.' },
    { id: 'Psig', text: 'Signed for Organizer: Devon Hale, Partnerships Manager.' },
  ] },
  policy: { title: 'Ninth Street Events — Signing authority policy', kind: 'Internal policy', cost: 20, reveals: ['F_authority'], body: [
    { id: 'A1', text: '1. Any agreement that grants media or broadcast rights, or is worth more than $25,000, must be signed by the Chief Executive Officer.' },
    { id: 'A2', text: '2. Staff may negotiate terms. Staff may not sign, or tell a counterparty that an agreement is approved, before the CEO has signed.' },
    { id: 'A3', text: 'Contract register, August: Parallax Network — Community Partner Agreement — signed D. Hale — CEO approval: none recorded.' },
  ] },
  licence: { title: 'Riftline Tournament Licence — Kestrel Interactive (excerpt)', kind: 'Publisher licence', cost: 20, reveals: ['F_consent'], body: [
    { id: 'K4.1', text: '4.1 Organizer may sublicense the right to transmit the Event.' },
    { id: 'K4.2', text: '4.2 An exclusive sublicense requires Kestrel’s written consent.' },
    { id: 'K4.3', text: '4.3 Non-exclusive sublicenses need no consent. Every transmission must display the Riftline licence slate.' },
    { id: 'Kc', text: 'Consent on file (February 27): “Approved: exclusive English-language live broadcast sublicense to Lumen Live.”' },
  ] },
  emails: { title: 'Email thread — Devon Hale and Mateo Rivas (August to this week)', kind: 'Correspondence', cost: 20, reveals: ['F_oral'], body: [
    { id: 'E1', text: 'Aug 15, Mateo Rivas: “We want the finals on our channel. That’s the whole point of the partnership for us.”' },
    { id: 'E2', text: 'Aug 15, Devon Hale: “You’re good for finals. I’ll paper it this week.”' },
    { id: 'E3', text: 'Nov 10, Mateo Rivas: “Teaser is up. Full promo goes out Thursday night for Saturday.”' },
    { id: 'E4', text: 'Nothing in the thread mentions Lumen Live, exclusivity, or what language the stream will be in.' },
  ] },
};

export default {
  id: 'spm370-two-feeds',
  version: 1,
  title: 'Two Feeds',
  course: 'SPM 370 · Contracts and media rights',
  role: 'Business & Legal Affairs Associate, Ninth Street Events',
  clock: { start: at(15), end: at(19), days: ['Thu', 'Fri', 'Sat'] },
  costs: { message: 15, open: 20, act: 0 },
  limits: { message: 700 },

  actors: {
    imani: { name: 'Imani Cole', role: 'CEO, Ninth Street Events', channel: 'Email',
      voice: 'Founder-CEO. Short, direct, decent. Wants an answer she can send in one email. Says “tell me what to send and to whom.”',
      wants: 'One clear instruction she can act on tonight, with the reason in a sentence.',
      fears: 'Losing Lumen’s fee or Parallax’s sponsorship; finding out later that she was not told something.',
      concern: 'Two partners both say Saturday is theirs. You signed Lumen yourself. You did not know the Parallax agreement granted a stream until today.' },
    grace: { name: 'Grace Oyelaran', role: 'Partner Manager, Lumen Live', channel: 'Email',
      voice: 'Polished account manager. Courteous, precise, never raises her voice. Refers to “our agreement” and “our advertiser”.',
      wants: 'The English-language audience Lumen promised its advertiser, undivided.',
      fears: 'Being blindsided on Saturday and having to explain it upward.',
      concern: s => flag(s, 'told_grace_exclusive') ? 'You have been told no one else will broadcast. You have passed that to your advertiser.' : 'You saw Parallax’s teaser this morning and sent a firm letter. You are waiting for a confirmation by end of day.' },
    mateo: { name: 'Mateo Rivas', role: 'Founder, Parallax Network', channel: 'Discord DM',
      voice: 'Thirty, built a Spanish-language esports channel from nothing. Fast, warm, a little combative. Mixes in the odd Spanish word. Talks about “my community”.',
      wants: 'The Grand Final on his channel, as he was told in August.',
      fears: 'Telling 80,000 followers it is off after the teaser went out.',
      concern: s => flag(s, 'told_mateo_ok') ? 'You have been told you are fine to stream. Promo goes out tonight.' : 'Promo is scheduled for tonight. You have a signed agreement and an email saying you are good. You want a straight answer.' },
    devon: { name: 'Devon Hale', role: 'Partnerships Manager, Ninth Street Events', channel: 'Slack',
      voice: 'Late twenties, eager, defensive today. Over-explains. Says “to be fair” a lot.',
      wants: 'For this to be solved without it becoming about him.',
      fears: 'That signing the Parallax deal himself will cost him his job.',
      concern: 'You signed the Parallax agreement without Imani and never told Mateo about Lumen. You hope nobody asks who approved it.' },
  },

  facts: {
    F_claims: { text: 'Lumen Live says it holds exclusive rights to the Grand Final and wants confirmation today that no one else will broadcast it. Parallax Network says it has a signed right to stream it and is sending promo tonight. The Grand Final is Saturday at 6:00 PM.', initial: [YOU, 'imani', 'grace', 'mateo', 'devon'] },
    F_excl_english: { text: 'Lumen’s exclusivity covers live transmission with English-language commentary only (Lumen 1.1, 2.1).', initial: ['grace'] },
    F_carveout: { text: 'Lumen’s agreement lets the organizer permit a non-English transmission by a third party if Lumen gets written notice naming them at least 48 hours before it starts (Lumen 2.3). For a Saturday 6:00 PM final that means Thursday 6:00 PM.', initial: ['grace'], guarded: () => true },
    F_makegood: { text: 'If a third party transmits in English with the organizer’s permission, or a non-English transmission goes ahead without the notice, Lumen may cut its $120,000 fee by 40% (Lumen 9.2).', initial: ['grace'] },
    F_grant: { text: 'Parallax’s agreement grants a non-exclusive right to stream the Grand Final and says nothing about language (Parallax 3).', initial: ['mateo', 'devon'] },
    F_subject: { text: 'Parallax’s stream right is subject to the organizer’s existing media commitments, and the organizer had to tell Parallax in writing of any that limit it (Parallax 7).', initial: ['mateo', 'devon'], guarded: () => true },
    F_refund: { text: 'If the organizer withdraws the stream right, Parallax may end its $30,000 sponsorship and be refunded (Parallax 9).', initial: ['mateo', 'devon'] },
    F_authority: { text: 'Company policy requires the CEO to sign any agreement granting media rights or worth more than $25,000. Devon signed the Parallax agreement alone; no CEO approval is recorded.', initial: ['imani', 'devon'], guarded: (s, who) => who === 'devon' },
    F_consent: { text: 'The publisher consented only to an exclusive English-language sublicense to Lumen. Non-exclusive sublicenses need no consent.', initial: [] },
    F_oral: { text: 'In August Devon emailed Mateo “You’re good for finals.” Nothing in their thread mentions Lumen or language.', initial: ['mateo', 'devon'], guarded: (s, who) => who === 'devon' },
    F_spanish: { text: 'Parallax’s Grand Final broadcast is planned with Spanish-language commentary by its own casters.', initial: ['mateo', 'devon'], guarded: () => true },
    F_preshow: { text: 'Mateo also wants to add a 30-minute English-language pre-show if he gets the green light.', initial: ['mateo'], guarded: () => true },
    F_lumen_ok: { text: 'Lumen’s real concern is the English-language audience it promised an advertiser. A Spanish-language stream with proper notice would not trouble it; being surprised would.', initial: ['grace'], guarded: () => true },
  },

  documents: DOCS,

  speechActs: {
    ask_plan: { to: ['mateo', 'devon'], describe: 'Asks what Parallax actually plans to stream on Saturday, or in what language.' },
    ask_concern: { to: ['grace'], describe: 'Asks what Lumen is actually worried about, or whether a particular arrangement would be acceptable to it.' },
    assure_stream: { to: ['mateo'], describe: 'Tells Mateo that Parallax can stream Saturday / is fine / has the right.' },
    assure_exclusive: { to: ['grace'], describe: 'Tells Grace that no one else will broadcast / Lumen’s exclusivity will be honoured.' },
  },

  detect(to, text) {
    const t = text.toLowerCase().replace(/[’‘]/g, "'"); const out = []; const has = re => re.test(t);
    const hedge = has(/(can'?t|cannot|not able to|unable to|won'?t|not going to) (yet )?(confirm|promise|say|tell)|not yet|until (i|we)|before (i|we) (confirm|promise|say)|no promises/);
    if (to === 'mateo' || to === 'devon') {
      if (has(/what (exactly )?(are|were|is|was) (you|parallax|they|he|mateo) (planning|going|intending)|wh(at|ich) language|in (english|spanish)|(your|their|parallax'?s) (plan|stream|broadcast|cast|casters|commentary)|how (are|do|did) (you|they) (plan|intend)|commentary|what will (you|they) (stream|show|air)/)) out.push('ask_plan');
    }
    if (to === 'mateo' && !hedge && has(/(you'?re|you are|parallax is) (fine|good|clear|cleared|okay|ok|all set)|you can (stream|go ahead|broadcast|run)|go ahead|green light|you (do )?have the right/)) out.push('assure_stream');
    if (to === 'grace') {
      if (has(/what matters|worr(y|ied)|concern|care(s)? (most )?about|what (do|does|would) (you|lumen) need|would (you|lumen) (accept|be (ok|okay|fine|comfortable)|object|mind)|why does|what'?s driving|advertiser/)) out.push('ask_concern');
      if (!hedge && has(/no (one|other|third)[^.]{0,30}(broadcast|stream|transmit)|won'?t (be|allow|let|permit)[^.]{0,30}(broadcast|stream|anyone)|honou?r (your |the |lumen'?s )?exclusiv|exclusiv\w* (is|will be) (safe|honou?red|respected|protected)|you have my word|consider it (confirmed|done)/)) out.push('assure_exclusive');
    }
    return out;
  },

  opening: () => [
    { say: { from: 'imani', voice: false, text: 'Need your advice before I send anything. Lumen’s letter (1:40 PM): “Our agreement grants exclusive rights to the Grand Final. Confirm by end of day that no other broadcast will occur, or we will exercise our rights under clause 9.” And Mateo at Parallax says he has a signed right to stream it and his promo goes out tonight. I signed Lumen. I’ve only just seen the Parallax paper. The agreements and the rest are in the binder. Tell me what to send, to whom, and why. I’m in meetings until 7 but I’ll act on whatever you send me the moment I see it.' } },
    { say: { from: 'mateo', voice: false, text: 'hey. somebody at lumen is telling people we can’t run saturday. I have a signed agreement and an email from devon. promo goes at 8 tonight. are we good or not?' } },
    { at: NOTICE_DEADLINE, id: 'notice_deadline' },
  ],

  rules: [
    { id: 'mateo_plan', why: 'Asked what he actually planned to stream, Mateo said what no document says: the cast is in Spanish, and he would like an English pre-show.',
      when: (s, ev) => isMsg(ev, 'mateo', 'ask_plan'),
      then: () => [{ learn: { who: YOU, fact: 'F_spanish', via: 'mateo' } }, { learn: { who: YOU, fact: 'F_preshow', via: 'mateo' } },
        { say: { from: 'mateo', text: 'the final? full cast en español, my casters, my overlays. that’s what my community comes for. and if you give me the green light I’d add a 30 min english pre-show to pull in new people. nobody asked me that until now btw.',
          must: 'The Grand Final stream is planned with Spanish-language commentary by his own casters. He would also like to add a 30-minute English-language pre-show if given the green light. Notes that nobody had asked him before.' } }] },
    { id: 'devon_plan', why: 'Asked what Parallax planned, Devon knew the cast was Spanish. He had never written it down.',
      when: (s, ev) => isMsg(ev, 'devon', 'ask_plan'),
      then: () => [{ learn: { who: YOU, fact: 'F_spanish', via: 'devon' } },
        { say: { from: 'devon', text: 'To be fair, it’s a Spanish-language channel, so it’s a Spanish cast. That’s why I didn’t think it touched Lumen. I should have put that in the agreement. I didn’t.',
          must: 'Parallax is a Spanish-language channel and the cast will be in Spanish; that is why he thought it did not affect Lumen. Admits he did not write that into the agreement.' } }] },
    { id: 'grace_concern', why: 'Asked what Lumen was actually worried about, Grace said it: the English audience, and not being surprised.',
      when: (s, ev) => isMsg(ev, 'grace', 'ask_concern'),
      then: () => [{ learn: { who: YOU, fact: 'F_lumen_ok', via: 'grace' } },
        { say: { from: 'grace', voice: false, text: 'Candidly: we sold an advertiser the English-language audience for the Grand Final, undivided. That is what I have to protect. Our agreement already deals with other languages, with notice. What I cannot have is a surprise on Saturday.' } }] },
    { id: 'told_mateo', why: 'The student told Mateo he was fine to stream before any advice had gone to the CEO. He took it as the answer.',
      when: (s, ev) => isMsg(ev, 'mateo', 'assure_stream'),
      then: (s, ev) => [{ commit: { id: 'C_mateo', to: 'mateo', label: 'You told Mateo that Parallax could stream', quote: ev.text } }, { flag: { key: 'told_mateo_ok' } },
        { say: { from: 'mateo', text: 'perfecto. that’s all I needed. promo goes at 8.', must: 'Relieved. Takes it as confirmation. Promo goes out at 8 tonight.' } }] },
    { id: 'told_grace', why: 'The student told Grace no one else would broadcast before any advice had gone to the CEO. She passed it on.',
      when: (s, ev) => isMsg(ev, 'grace', 'assure_exclusive'),
      then: (s, ev) => [{ commit: { id: 'C_grace', to: 'grace', label: 'You told Grace that no one else would broadcast', quote: ev.text } }, { flag: { key: 'told_grace_exclusive' } },
        { say: { from: 'grace', voice: false, text: 'Thank you. I’ll let our advertiser know it’s handled.' } }] },
  ],

  timers: {
    notice_deadline: s => [{ flag: { key: 'window_closed' } }, ...(knows(s, YOU, 'F_carveout') ? [{ note: 'It is 6:00 PM. The Grand Final starts in 48 hours. Any notice under Lumen 2.3 sent from now on is late.' }] : [])],
  },
  timerWhy: { notice_deadline: 'Thursday 6:00 PM passed: 48 hours before the Grand Final.' },

  acts: {
    pin: { label: 'Pin a clause', cost: 0, clean: p => ({ clause: String(p.clause || '').slice(0, 12) }), available: s => !s.submitted },
    unpin: { label: 'Unpin a clause', cost: 0, clean: p => ({ clause: String(p.clause || '').slice(0, 12) }), available: s => !s.submitted },
  },

  fallbackReply(s, who) {
    return ({
      imani: 'I need it in a form I can send. What do I tell Lumen, what do I tell Parallax, and what’s the clause?',
      grace: 'Our position is in the letter. I’m happy to answer a specific question about our agreement.',
      mateo: flag(s, 'told_mateo_ok') ? 'we’re good then. promo at 8.' : 'I just need to know if saturday is on. what do you need from me?',
      devon: 'To be fair, I was trying to land a sponsor. What do you need to know?',
    })[who] || '…';
  },

  // The advice IS the submission. The CEO acts on exactly what it says and nothing it leaves out.
  recommendations: [
    ['enforce', 'Hold Lumen’s exclusivity: tell Parallax it cannot stream the Grand Final'],
    ['both', 'Let both go ahead under their agreements as signed'],
    ['coexist', 'Let both go ahead, on conditions'],
    ['defer', 'Send nothing tonight; get more information first'],
  ],
  conditions: [
    ['spanish', 'Parallax’s stream carries non-English commentary only; no English segments'],
    ['notice', 'Send Lumen written notice naming Parallax, now'],
    ['ratify', 'Imani signs the Parallax agreement herself, with the language condition written in'],
  ],
  cleanMemo(m) {
    const rec = ['enforce', 'both', 'coexist', 'defer'].includes(m.rec) ? m.rec : '';
    const c = m.conds || {};
    return { rec, conds: rec === 'coexist' ? { spanish: !!c.spanish, notice: !!c.notice, ratify: !!c.ratify } : {}, why: String(m.why || '').slice(0, 900) };
  },
  checkSubmit: (s, memo) => !memo.rec ? 'Choose what you are advising Imani to do.' : !memo.why.trim() ? 'Give Imani your reason in a sentence or two.' : null,

  afterSubmit(s) {
    const m = s.submitted.memo, fx = [];
    const onTime = !flag(s, 'window_closed');
    const streams = m.rec !== 'enforce';
    const english = streams && !(m.rec === 'coexist' && m.conds.spanish);
    const noticed = m.rec === 'coexist' && m.conds.notice && onTime;
    if (m.rec === 'enforce') {
      fx.push({ note: 'Thursday evening. Imani writes to Parallax: the Grand Final stream is withdrawn because of an existing exclusive commitment (Parallax clause 7). She confirms to Lumen that no other broadcast will occur.' });
      fx.push({ say: { from: 'mateo', voice: false, text: 'an “existing commitment” nobody told us about in writing, which your own clause 7 says you had to. and for the record our cast is in spanish. did anyone read lumen’s contract before pulling us 48 hours out? we’re ending the sponsorship under clause 9. refund the 30k.' } });
      fx.push({ flag: { key: 'sponsor_lost' } });
      if (open(s, 'C_mateo')) fx.push({ resolve: { id: 'C_mateo', status: 'broken' } }, { say: { from: 'mateo', voice: false, text: `and this afternoon your own people told me: “${s.commitments.C_mateo.quote}” I’m posting that.` } });
      if (open(s, 'C_grace')) fx.push({ resolve: { id: 'C_grace', status: 'kept' } });
      return fx;
    }
    if (m.rec === 'defer') fx.push({ note: 'Thursday evening. Imani sends nothing. Parallax’s promo goes out at 8:00 PM. Lumen’s end-of-day deadline passes without a reply.' });
    else {
      const lang = m.rec === 'coexist' && m.conds.spanish ? ', with non-English commentary only and no English segments' : ' as agreed';
      const notice = !(m.rec === 'coexist' && m.conds.notice) ? ' Nothing is sent to Lumen about Parallax.' : onTime ? ' She sends Lumen written notice naming Parallax, inside the 48-hour window.' : ' She sends Lumen written notice naming Parallax, but it is after 6:00 PM: less than 48 hours before the final.';
      const sign = m.rec === 'coexist' && m.conds.ratify ? ' She countersigns the Parallax agreement with the language condition added.' : '';
      fx.push({ note: `Thursday evening. Imani writes to Parallax that the stream may go ahead${lang}.${notice}${sign}` });
    }
    if (open(s, 'C_mateo')) fx.push({ resolve: { id: 'C_mateo', status: 'kept' } });
    if (m.rec === 'coexist' && m.conds.ratify) fx.push({ flag: { key: 'ratified' } });
    if (english) fx.push({ note: 'Saturday, 5:30 PM. With no restriction on language in anything he was sent, Mateo runs a 30-minute English-language pre-show before the Spanish cast.' }, { flag: { key: 'english_aired' } });
    else fx.push({ note: 'Saturday. Parallax streams the Grand Final with Spanish-language commentary only.' });
    if (!english && noticed) {
      fx.push({ flag: { key: 'clean' } }, { say: { from: 'grace', voice: false, text: 'Notice received in time, thank you. A Spanish-language stream by Parallax is within clause 2.3. We have no objection.' } });
    } else {
      fx.push({ flag: { key: 'makegood' } });
      fx.push({ say: { from: 'grace', voice: false, text: `We are exercising clause 9.2. ${english ? 'A third party transmitted English-language commentary with your permission.' : 'A transmission went ahead under 2.3 without the notice the clause requires.'} The fee is reduced by 40%: ${money(48000)}.` } });
    }
    if (open(s, 'C_grace')) fx.push({ resolve: { id: 'C_grace', status: 'broken' } }, { say: { from: 'grace', voice: false, text: `I also told our advertiser it was handled, because on Thursday I was told: “${s.commitments.C_grace.quote}”` } });
    return fx;
  },

  outcome(s, events) {
    const m = s.submitted?.memo || {}; const seq = k => s.flags[k]?.seq;
    const lumen = flag(s, 'clean') ? ['No objection', 'Notice arrived in time and the stream was Spanish-language only. Full fee paid.', seq('clean')]
      : flag(s, 'makegood') ? ['Cut its fee by $48,000', flag(s, 'english_aired') ? 'English-language commentary aired on Parallax with the organizer’s permission.' : 'A non-English stream went ahead without the 48-hour notice.', seq('makegood')]
      : ['Exclusivity confirmed', 'No other broadcast occurred. Full fee paid.', undefined];
    const par = flag(s, 'sponsor_lost') ? ['Ended its sponsorship; $30,000 refunded', 'Its stream was withdrawn 48 hours out, citing a commitment it was never told about in writing.', seq('sponsor_lost')]
      : ['Streamed the Grand Final', flag(s, 'english_aired') ? 'Spanish cast, plus an English pre-show nobody told it not to run.' : 'Spanish-language commentary only.', seq('english_aired')];
    const cost = (flag(s, 'makegood') ? 48000 : 0) + (flag(s, 'sponsor_lost') ? 30000 : 0);
    const org = [cost ? `Down ${money(cost)}` : 'Kept both partners and both payments', flag(s, 'ratified') ? 'The Parallax agreement now carries the CEO’s signature and the language condition.' : 'The Parallax agreement is still signed only by Devon, against company policy.', undefined];
    return {
      advice: { rec: m.rec, label: (this.recommendations.find(r => r[0] === m.rec) || [])[1], conds: m.conds, why: m.why, pins: pins(s), sentAt: s.submitted?.t },
      people: [{ who: 'Lumen Live', headline: lumen[0], detail: lumen[1], seq: lumen[2] }, { who: 'Parallax Network', headline: par[0], detail: par[1], seq: par[2] }, { who: 'Ninth Street Events', headline: org[0], detail: org[1], seq: org[2] }],
      promises: Object.values(s.commitments).map(c => ({ label: c.label, quote: c.quote, status: c.status, seq: c.resolvedSeq || c.seq })),
      found: { spanish: knows(s, YOU, 'F_spanish'), carveout: knows(s, YOU, 'F_carveout'), preshow: knows(s, YOU, 'F_preshow'), authority: knows(s, YOU, 'F_authority') },
      aftermath: s.notes.filter(n => n.seq > (s.submitted?.seq ?? Infinity)).map(n => n.text),
    };
  },

  describeEvent(e) {
    if (e.type === 'run.started') return { kind: 'world', text: 'Thursday, 3:00 PM. The binder opens.' };
    if (e.type === 'student.act' && e.act === 'pin') return { kind: 'you', text: `Pinned clause ${e.params.clause}.` };
    if (e.type === 'student.act' && e.act === 'unpin') return { kind: 'you', text: `Unpinned clause ${e.params.clause}.`, minor: true };
    if (e.type === 'run.ended') return { kind: 'world', text: '7:00 PM. Imani is out of her meetings and needs your advice now.' };
    if (e.type === 'run.submitted') return { kind: 'you', text: `Advice sent to Imani: ${(this.recommendations.find(r => r[0] === e.memo.rec) || [])[1]}${e.memo.rec === 'coexist' ? ' — ' + (this.conditions.filter(c => e.memo.conds[c[0]]).map(c => c[1]).join('; ') || 'no conditions named') : ''}. “${e.memo.why}”` };
    return null;
  },

  signals(s) {
    const out = [], p = pins(s);
    if (knows(s, YOU, 'F_carveout')) out.push({ label: 'Read Lumen 2.3', tone: 'ok', seq: s.knows[YOU].F_carveout.seq });
    if (knows(s, YOU, 'F_spanish')) out.push({ label: `Knows the cast is Spanish (asked ${s.knows[YOU].F_spanish.via === 'mateo' ? 'Mateo' : 'Devon'})`, tone: 'ok', seq: s.knows[YOU].F_spanish.seq });
    if (knows(s, YOU, 'F_preshow')) out.push({ label: 'Knows about the English pre-show', tone: 'ok', seq: s.knows[YOU].F_preshow.seq });
    if (s.commitments.C_mateo) out.push({ label: 'Told Mateo he could stream', tone: 'warn', seq: s.commitments.C_mateo.seq });
    if (s.commitments.C_grace) out.push({ label: 'Told Grace no one else would broadcast', tone: 'warn', seq: s.commitments.C_grace.seq });
    if (p.length) out.push({ label: `Pinned ${p.join(', ')}`, tone: '', seq: s.seq });
    if (flag(s, 'window_closed') && !s.submitted) out.push({ label: 'Notice window closed', tone: 'bad', seq: s.flags.window_closed.seq });
    if (s.submitted) out.push({ label: `Advised: ${s.submitted.memo.rec}`, tone: flag(s, 'clean') ? 'ok' : (flag(s, 'makegood') || flag(s, 'sponsor_lost')) ? 'bad' : '', seq: s.submitted.seq });
    return out;
  },

  lenses: [
    { id: 'advice', label: 'What they advised Imani to do',
      value: s => s.submitted ? (s.submitted.memo.rec === 'coexist' ? 'Both, on conditions: ' + (['spanish', 'notice', 'ratify'].filter(k => s.submitted.memo.conds[k]).join(', ') || 'none named') : { enforce: 'Hold exclusivity; withdraw Parallax', both: 'Both, as signed', defer: 'Send nothing tonight' }[s.submitted.memo.rec]) : 'No advice sent',
      question: 'Both teams read the same two agreements and gave Imani opposite instructions. Which clause is each team standing on, and what did each one have to assume about a fact neither agreement states?' },
    { id: 'language', label: 'Did they find out the cast was Spanish?',
      value: s => knows(s, YOU, 'F_spanish') ? `Yes, by asking ${s.knows[YOU].F_spanish.via === 'mateo' ? 'Mateo' : 'Devon'}` : 'No',
      question: 'The language of the stream decides which Lumen clause applies, and it is in no document. One team asked. What should have told the other team there was something to ask?' },
    { id: 'notice', label: 'Lumen 2.3 notice',
      value: s => !s.submitted ? 'No advice sent' : s.submitted.memo.rec === 'coexist' && s.submitted.memo.conds.notice ? (s.flags.window_closed && s.flags.window_closed.t <= s.submitted.t ? 'Advised, but after 6:00 PM' : 'Advised in time') : knows(s, YOU, 'F_carveout') ? 'Read the clause; did not advise notice' : 'Never read the clause',
      question: 'A one-paragraph notice was worth $48,000. Imani sent exactly what she was told to send. Whose omission was it: the adviser’s, the CEO’s, or the drafter’s?' },
    { id: 'said', label: 'What they told the parties before advising',
      value: s => Object.values(s.commitments).map(c => c.to === 'mateo' ? 'Told Mateo he could stream' : 'Told Grace no one else would broadcast').join('; ') || 'Nothing that committed the organizer',
      question: 'One team reassured a partner before it had advised its own client. Devon did the same thing in August. What is the difference between asking a counterparty a question and giving them an answer?' },
    { id: 'pins', label: 'Clauses they relied on',
      value: s => pins(s).join(', ') || 'None pinned',
      question: 'Put the two sets of pinned clauses side by side. Which clause appears on one list and not the other, and would the first team’s advice survive reading it?' },
    { id: 'authority', label: 'Did they deal with who signed?',
      value: s => s.submitted?.memo.conds?.ratify ? 'Advised the CEO to sign' : knows(s, YOU, 'F_authority') ? 'Read the policy; left it' : 'Did not read the policy',
      question: 'Devon had no authority to sign, yet Parallax paid and promoted in reliance on his signature. Should Ninth Street be able to walk away from an agreement its own manager signed? Who should bear the cost of that gap?' },
  ],

  samples: [
    { team: 'Team Anchor (sample)', members: 'Fictional', note: 'Reads both agreements, enforces exclusivity, never asks anyone anything.', steps: [
      { type: 'open', doc: 'lumen' }, { type: 'open', doc: 'parallax' },
      { type: 'act', act: 'pin', params: { clause: 'L2.1' } }, { type: 'act', act: 'pin', params: { clause: 'P7' } },
      { type: 'submit', memo: { rec: 'enforce', conds: {}, why: 'Lumen 2.1 is exclusive and came first. Parallax clause 7 makes its stream subject to existing commitments.' } },
    ] },
    { team: 'Team Beacon (sample)', members: 'Fictional', note: 'Reads, asks Mateo what he plans to stream, finds the notice clause in time.', steps: [
      { type: 'open', doc: 'lumen' }, { type: 'open', doc: 'parallax' },
      { type: 'message', to: 'mateo', text: 'Before I advise anyone: what exactly are you planning to stream on Saturday, and in what language?', acts: ['ask_plan'] },
      { type: 'act', act: 'pin', params: { clause: 'L1.1' } }, { type: 'act', act: 'pin', params: { clause: 'L2.3' } }, { type: 'act', act: 'pin', params: { clause: 'P3' } },
      { type: 'message', to: 'grace', text: 'What matters most to Lumen here? Would you object to a stream that is not in English?', acts: ['ask_concern'] },
      { type: 'open', doc: 'policy' },
      { type: 'submit', memo: { rec: 'coexist', conds: { spanish: true, notice: true, ratify: true }, why: 'Lumen’s exclusivity is English-only (1.1). 2.3 allows a non-English stream with 48 hours’ notice, which expires at 6 PM today. Parallax’s cast is Spanish; bar the English pre-show.' } },
    ] },
    { team: 'Team Current (sample)', members: 'Fictional', note: 'Off the expected path: reassures Mateo first, then advises both as signed.', steps: [
      { type: 'message', to: 'mateo', text: 'You’re fine to stream Saturday. We will sort Lumen out on our side.', acts: ['assure_stream'] },
      { type: 'open', doc: 'parallax' }, { type: 'act', act: 'pin', params: { clause: 'P3' } },
      { type: 'submit', memo: { rec: 'both', conds: {}, why: 'Parallax has a signed non-exclusive right (clause 3) and paid for it. Both agreements can stand.' } },
    ] },
    { team: 'Team Drift (sample)', members: 'Fictional', note: 'Reassures Lumen, then finds the Spanish cast and advises coexistence without the notice.', steps: [
      { type: 'message', to: 'grace', text: 'Understood. No one else will broadcast the final.', acts: ['assure_exclusive'] },
      { type: 'open', doc: 'parallax' }, { type: 'open', doc: 'emails' },
      { type: 'message', to: 'devon', text: 'What was Parallax planning to stream, and in what language?', acts: ['ask_plan'] },
      { type: 'act', act: 'pin', params: { clause: 'P3' } }, { type: 'act', act: 'pin', params: { clause: 'E2' } },
      { type: 'submit', memo: { rec: 'coexist', conds: { spanish: true, notice: false, ratify: false }, why: 'The cast is Spanish, so it should not compete with Lumen’s English broadcast. Keep Parallax to Spanish only.' } },
    ] },
  ],
};
