// THE REPORT — SPM 370, Week 12 (Safeguarding Issues in Esports and Gaming)
//
// A casefile has NO imports. It is data plus small pure functions, so the same file runs
// in the browser preview, in Node tests and in the Edge Function.
//
// The professional task: a team operations manager (a business professional, not a lawyer)
// receives a player's concern about a coach two days before a qualifier. The skills are
// what to promise, whom to tell, what to verify, and what to do before Saturday.
//
// Everything here is fictional. Every character is an adult. Conduct is described without
// graphic detail. The "law" students work with is the organisation's own handbook, the
// league rulebook and the coach's agreement, which are documents inside the fiction.

const YOU = 'you';
const THU = 0, FRI = 1440;
const at = (day, h, m = 0) => day + h * 60 + m;
const knows = (s, who, f) => !!s.knows[who]?.[f];
const flag = (s, k) => s.flags[k]?.value;
const open = (s, id) => s.commitments[id]?.status === 'open';
const saidTo = (s, who, act) => (s.threads[who] || []).some(m => m.from === YOU && (m.acts || []).includes(act));
const isMsg = (ev, to, act) => ev.type === 'student.message' && ev.to === to && (!act || ev.acts.includes(act));

export default {
  id: 'spm370-the-report',
  version: 1,
  title: 'The Report',
  course: 'SPM 370 · Week 12 · Safeguarding',
  role: 'Team Operations Manager, Harbor City Esports',
  clock: { start: at(THU, 13, 10), end: at(FRI, 17), days: ['Thu', 'Fri', 'Sat'] },
  costs: { message: 10, open: 5, act: 10 },
  limits: { message: 900 },

  // ---------------------------------------------------------------- people
  // voice: how they sound. wants/fears: their incentives. concern: what is on their mind
  // right now (may depend on state). A voice is only ever given this card plus the facts
  // this person knows at that moment.
  actors: {
    rin: {
      name: 'Rin Okafor', role: 'Academy player (substitute), age 19', channel: 'Discord DM', trust: 0,
      voice: 'Nineteen. Types in lowercase, short lines, no corporate words. Guarded, dry, embarrassed to be raising this. Tests whether you are safe before saying more. Never uses words like "policy", "process" or "stakeholders".',
      wants: 'For the messages to stop and to get her scrim time back, without becoming "the girl who got Cole in trouble".',
      fears: 'Cole finding out she said something. Losing her roster spot. Being managed instead of heard.',
      concern: s => flag(s, 'rin_withdrawn') ? 'You feel burned and want out of this conversation.'
        : flag(s, 'retaliation') ? 'Cole knows you talked. You are scared and angry, and want to know how he found out.'
        : flag(s, 'disclosed') ? 'You have told the ops manager. Scrims are tonight and you need to know what happens next and who else will hear.'
        : 'You have decided to say something but have not yet said what. You want to know if this stays between the two of you before you say more.',
    },
    marcus: {
      name: 'Marcus Bell', role: 'Head coach', channel: 'Text', trust: 0,
      voice: 'Mid-thirties ex-pro. Blunt texts, sports clichés, loyal to his staff. Thinks in terms of Saturday. Not cruel, just certain.',
      wants: 'A settled roster and Cole running draft prep on Saturday.',
      fears: 'Distractions two days before a qualifier. His friend being accused unfairly.',
      concern: s => knows(s, 'marcus', 'F_report') ? 'You have just heard Rin said something about Cole. Your instinct is that it is about scrim time and that Cole deserves a heads-up.'
        : 'Draft prep and travel for Saturday. You do not know anything is wrong.',
    },
    priya: {
      name: 'Priya Raman', role: 'General manager', channel: 'Email', trust: 0,
      voice: 'Brisk, senior, commercially minded. Complete sentences, short paragraphs. Asks "what do you need from me?" Not hostile to doing the right thing, but wants a basis she can defend.',
      wants: 'Volt Energy renewed on Monday. No surprises on Saturday. Decisions she can defend later.',
      fears: 'A public mess in front of the sponsor. Acting on rumour. Being the last to know.',
      concern: s => knows(s, 'priya', 'F_report') ? 'You now know a player has raised a concern about Cole. You are weighing Saturday and Volt against what the handbook requires, and you remember March.'
        : 'Saturday logistics and Monday’s Volt renewal. You do not know anything is wrong.',
    },
    dana: {
      name: 'Dana Whitfield', role: 'Safeguarding Lead (outside HR consultant)', channel: 'Email', trust: 0,
      voice: 'Calm, precise, kind without being soft. Numbers her points. Never speculates about what happened; talks about process and people’s options.',
      wants: 'Concerns referred promptly, kept need-to-know, with evidence preserved and no retaliation.',
      fears: 'Well-meaning staff investigating on their own or promising what they cannot deliver.',
      concern: s => flag(s, 'referred') ? 'A referral is open. You want to speak to Rin, advise on interim measures before Saturday, and keep the circle small.'
        : 'Nothing is open for Harbor City right now.',
    },
    cole: {
      name: 'Cole Maddox', role: 'Assistant coach (academy), independent contractor', channel: 'Discord DM', trust: 0,
      voice: 'Twenty-six, ex-pro, charming and quick. Jokes first, then wounded. Reframes everything as performance and attitude. Never admits to anything about the messages.',
      wants: 'To be on stage Saturday and to keep fronting the Volt series.',
      fears: 'A label that follows him. Losing the Volt work.',
      concern: s => knows(s, 'cole', 'F_report') ? 'You have heard Rin has been talking to operations about you. You want to get ahead of it and you think it is about scrim time.'
        : 'Draft prep. You have no idea anyone has said anything.',
    },
    league: { name: 'Meridian Circuit — League Operations', role: 'Tournament organiser', channel: 'Form', reachable: false },
  },

  // ---------------------------------------------------------------- facts
  // The atoms of information. `initial` = who knows at the start. Nobody else knows until
  // an event teaches them.
  facts: {
    F_logistics: { text: 'Saturday is the Meridian Circuit qualifier. Event check-in closes Friday 5:00 PM. Cole submits the Saturday travel roster Friday 10:00 AM.', initial: [YOU, 'marcus', 'priya', 'cole', 'rin'] },
    F_sponsor: { text: 'Volt Energy’s renewal meeting is Monday; Volt’s partnership lead will attend Saturday. Cole fronts Volt’s content series.', initial: [YOU, 'priya', 'marcus', 'cole'] },
    F_dms: { text: 'Since late September Cole has sent Rin repeated late-night personal DMs: asking her to stay on voice after scrims, comments on how she looks, asking who she is seeing. She stopped replying on October 28.', initial: ['rin', 'cole'], guarded: (s, who) => who === 'cole' || (who === 'rin' && !flag(s, 'disclosed')) },
    F_scrimcut: { text: 'After October 28 Rin’s academy scrim blocks went from five a week to one. Cole sets the academy scrim list.', initial: ['rin', 'cole'], guarded: (s, who) => who === 'rin' && !flag(s, 'disclosed') },
    F_scrimnote: { text: 'The scrim scheduling log shows the change was entered by Cole on October 29 with the note “attitude”.', initial: ['cole', 'marcus'] },
    F_screenshots: { text: 'Rin has screenshots of the DMs on her phone.', initial: ['rin'] },
    F_report: { text: 'Rin has raised a concern about Cole with the operations manager.', initial: ['rin'] },
    F_prior: { text: 'In March a former academy player, Jess, told Priya that Cole’s DMs made her uncomfortable. Priya “had a word” with Cole. The only record is a one-line entry in the incident log; no referral was made.', initial: ['priya', 'cole'], guarded: () => true },
    F_policy: { text: 'Handbook §7: staff who receive a safeguarding concern must refer it to the Safeguarding Lead within 24 hours; staff must not promise absolute confidentiality but must limit sharing to those who need to know; retaliation is prohibited; interim measures are protective, not findings, and are decided by the GM on the Lead’s advice.', initial: ['dana'] },
    F_league: { text: 'Meridian Circuit rule 9.3: a team must notify League Operations of a credible safeguarding concern involving credentialed staff before event check-in. The credential is held pending the team’s review. Failure to notify may lead to team sanction.', initial: ['dana'] },
    F_contract: { text: 'Cole’s agreement (independent contractor) permits paid suspension of duties pending a review and termination for cause only after a documented process.', initial: ['priya'] },
    F_referred: { text: 'A referral about Cole has been made to the Safeguarding Lead.', initial: [] },
    F_leak: { text: 'Cole knows Rin spoke to operations and has contacted her about it.', initial: [] },
  },

  // ---------------------------------------------------------------- documents
  documents: {
    handbook: { title: 'Player & Staff Handbook — §7 Safeguarding and Conduct', kind: 'Policy', reveals: ['F_policy'], body: [
      '7.1 Purpose. Harbor City Esports owes a duty of care to players and staff in training, travel, competition and team-run online spaces, including team Discord servers and direct messages between staff and players.',
      '7.2 Receiving a concern. Any staff member who receives a concern about the conduct of staff toward a player must refer it to the Safeguarding Lead within 24 hours of receiving it. Staff do not investigate, and do not decide whether the concern is “serious enough”.',
      '7.3 Confidentiality. Staff must not promise absolute confidentiality. Staff should explain who will be told and why, and must limit sharing to those who need to know.',
      '7.4 No retaliation. No player may be disadvantaged in selection, scrim time, travel or contract for raising a concern in good faith.',
      '7.5 Interim measures. Pending review, the General Manager may, on the Lead’s advice, direct no-contact outside staff channels, reassign duties, or suspend duties with pay. Interim measures are protective and are not findings.',
      '7.6 Records. Every concern and every step taken is entered in the incident log with a date and time.',
    ] },
    rulebook: { title: 'Meridian Circuit Rulebook — 9.3 Welfare notifications', kind: 'League rule', reveals: ['F_league'], body: [
      '9.3(a) A participating team must notify League Operations of any credible safeguarding concern involving a credentialed staff member before event check-in closes.',
      '9.3(b) On notification the staff member’s event credential is held pending the outcome of the team’s review. A hold is administrative and is not a finding.',
      '9.3(c) A team that knew of a concern and did not notify may be sanctioned, including forfeiture of circuit points.',
      'Check-in for Saturday’s qualifier closes Friday 5:00 PM.',
    ] },
    agreement: { title: 'Coaching Services Agreement — C. Maddox (excerpt)', kind: 'Contract', reveals: ['F_contract'], body: [
      '2. Status. Coach is an independent contractor.',
      '8. Conduct. Coach will comply with the Handbook, including §7.',
      '11. Suspension of duties. The Team may suspend some or all duties, with fees continuing, pending a review under the Handbook.',
      '12. Termination for cause. The Team may terminate for material breach following written notice of the grounds and a documented opportunity to respond.',
    ] },
    scrimlog: { title: 'Academy scrim scheduling log — Oct 1 to Nov 12', kind: 'Operations record', reveals: ['F_scrimcut', 'F_scrimnote'], body: [
      'Blocks per week — R. Okafor: Oct 1–7: 5 · Oct 8–14: 5 · Oct 15–21: 5 · Oct 22–28: 5 · Oct 29–Nov 4: 1 · Nov 5–11: 1',
      'Change entered Oct 29, 9:12 AM by C. Maddox. Note field: “attitude”.',
      'No other academy player changed by more than one block in the same period.',
      'Saturday travel roster: submitted by C. Maddox, due Friday 10:00 AM.',
    ] },
    incidentlog: { title: 'Incident log (restricted)', kind: 'HR record', reveals: ['F_prior'], available: s => !!flag(s, 'log_access'), body: [
      'Mar 14 — P. Raman. “J. (academy) uncomfortable w/ DMs from C.M. Spoke to C.M. informally. Resolved.”',
      'No referral recorded. No follow-up recorded. J. left the academy in April.',
      'Jun 2 — D. Whitfield engaged as Safeguarding Lead.',
    ] },
  },

  // ---------------------------------------------------------------- what a message can do
  // Speech acts are the consequential things a student can say. A voice model (or the
  // patterns below) decides which are present in a message. Keep this list short and
  // concrete: each one must be something a rule reacts to.
  speechActs: {
    promise_confidentiality: { to: ['rin'], describe: 'Tells Rin this will stay between the two of them / will not be shared.' },
    explain_limits: { to: ['rin'], describe: 'Tells Rin they cannot promise secrecy, or that it must go to the Safeguarding Lead, while limiting who knows.' },
    ask_wants: { to: ['rin'], describe: 'Asks Rin what she wants to happen.' },
    ask_evidence: { to: ['rin'], describe: 'Asks Rin to keep, save or send the screenshots/messages.' },
    forewarn: { to: ['rin'], describe: 'Tells Rin, after she has disclosed, that they are going to (or have had to) take this to the Safeguarding Lead or others.' },
    minimize: { to: ['rin'], describe: 'Tells Rin to wait until after Saturday, ignore it, or that it is probably nothing.' },
    disclose_concern: { to: ['marcus', 'priya', 'cole'], describe: 'Reveals that Rin (or “a player”, identifiably) has raised a concern about Cole.' },
    need_to_know: { to: ['marcus', 'priya'], describe: 'Asks them to keep it to themselves / not to speak to Cole.' },
    ask_history: { to: ['priya', 'dana'], describe: 'Asks whether anything like this has come up before.' },
    cite_basis: { to: ['priya'], describe: 'Points to the handbook §7, the league rule, or the Safeguarding Lead’s advice as the basis for acting.' },
  },

  // Deterministic fallback used when no AI is available (offline preview, tests, outages).
  detect(to, text) {
    const t = text.toLowerCase().replace(/[’‘]/g, "'"); const out = [];
    const has = re => re.test(t);
    if (to === 'rin') {
      const limits = has(/(can'?t|cannot|can not|not able to|unable to|won'?t be able to|not going to) (promise|keep|guarantee)|(have|need|required|obligated|going|has) to (tell|report|refer|pass|take|bring|share)|must (tell|report|refer)|safeguarding lead|dana|need[- ]to[- ]know|only (the )?people who need|limits? (of|to|on) confidential|not (totally|completely|fully) (confidential|secret)/);
      const promise = has(/(stay|stays|keep|keeps|kept|remain)s? (it |this |that |things )?(just |strictly )?(between (us|you and me|the two of us)|confidential|private|secret|quiet|to myself)|won'?t (tell|say|share|mention)|i promise|no one (else )?(will|has to|needs to|is going to) (know|hear|find out)|off the record|your secret|just between us|between us/);
      if (limits) out.push('explain_limits'); else if (promise) out.push('promise_confidentiality');
      if (has(/what (do|would) you (want|like|need)|what are you hoping|what would help|how (do|would) you want/)) out.push('ask_wants');
      if (has(/screenshot|screen shot|save (the|those|them)|keep (the|those|them) (messages|dms)|send (me|them|those)|evidence|don'?t delete|copies/)) out.push('ask_evidence');
      if (limits && has(/i('?ve| have| am|'?m) (referred|told|going|taking|sending|reporting)|i'?ll (be )?(refer|tell|tak|send|report)|i (referred|told|reported)|going to (refer|tell|report|take)|before (dana|she|anyone) (contacts|emails|reaches)|will (contact|email|reach out to) you/)) out.push('forewarn');
      if (has(/wait (until|till) (after )?(saturday|the qualifier|monday)|after saturday|probably nothing|just ignore|let it go|not a big deal|don'?t worry about it|focus on (the )?(game|qualifier|saturday)/)) out.push('minimize');
    } else {
      const names = has(/\brin\b|okafor|a player|one of the (academy )?players|academy player|someone on the academy/);
      const concern = has(/concern|complain|report|harass|dm|message|inappropriate|uncomfortable|came to me|told me|raised|allegation|safeguard|conduct|about cole|about you/);
      if (to !== 'dana' && names && concern) out.push('disclose_concern');
      if (to === 'cole' && has(/concern|complain|report|allegation|dms?|messages you|inappropriate|uncomfortable|your side/)) { if (!out.includes('disclose_concern')) out.push('disclose_concern'); }
      if (has(/keep (this|it) (to yourself|between us|quiet|tight|confidential)|don'?t (tell|talk to|speak to|mention|say anything to) (cole|him|anyone)|need[- ]to[- ]know|not (a word|to speak)|please don'?t/)) out.push('need_to_know');
      if (has(/(come|came|happened|anything like this|something like this|complaint|concern).{0,40}before|history|previous|prior|first time|pattern|anyone else|other players/)) out.push('ask_history');
      if (to === 'priya' && has(/handbook|§ ?7|section 7|policy|rule 9|9\.3|league rule|rulebook|dana|safeguarding lead|interim|duty of care|24 hours/)) out.push('cite_basis');
    }
    return out;
  },

  // ---------------------------------------------------------------- how it starts
  opening: () => [
    { say: { from: 'priya', voice: false, text: 'Saturday: Meridian qualifier. Volt’s partnership lead is coming, and their renewal meeting is Monday, so I need it smooth. Cole sends the travel roster Friday 10 AM. League check-in closes Friday 5 PM. Flag anything that could bite us before then.' } },
    { say: { from: 'rin', voice: false, text: 'hey. can i talk to you about something? not in the team server. and can it stay between us' } },
    { after: 60, id: 'rin_waiting' },
    { at: at(FRI, 10), id: 'fri_roster' },
  ],

  // ---------------------------------------------------------------- rules
  // when(state, event) -> boolean. then(state, event) -> effects. why: one plain sentence
  // that an instructor can read aloud. Rules fire once unless `once: false`.
  rules: [
    { id: 'rin_promised', why: 'The student promised secrecy, so Rin felt safe enough to tell everything — and now holds the student to those words.',
      when: (s, ev) => isMsg(ev, 'rin', 'promise_confidentiality') && !flag(s, 'disclosed'),
      then: (s, ev) => [
        { commit: { id: 'C_conf', to: 'rin', label: 'You told Rin this would stay between you', quote: ev.text } },
        { trust: { who: 'rin', delta: 2, why: 'promised secrecy' } }, { flag: { key: 'disclosed' } }, { cancel: 'rin_waiting' },
        { learn: { who: YOU, fact: 'F_dms', via: 'rin' } }, { learn: { who: YOU, fact: 'F_scrimcut', via: 'rin' } }, { learn: { who: YOU, fact: 'F_screenshots', via: 'rin' } },
        { say: { from: 'rin', text: 'ok. thank you. it’s cole. since like september he dms me late, after scrims. stay on voice, who am i seeing, stuff about how i look. i stopped answering on the 28th. next day i went from five scrim blocks to one. i have screenshots. i don’t want this blowing up before saturday, i just want it to stop.',
          must: 'Relieved. Tells the whole thing: Cole’s late-night personal DMs since September; she stopped replying Oct 28; her scrim blocks dropped from five to one the next day; she has screenshots; she does not want it to blow up before Saturday.' } },
      ] },
    { id: 'rin_limits', why: 'The student was honest about the limits of confidentiality before hearing the story. Rin hesitated, then told it anyway and asked to hear first.',
      when: (s, ev) => isMsg(ev, 'rin', 'explain_limits') && !flag(s, 'disclosed'),
      then: () => [
        { trust: { who: 'rin', delta: 1, why: 'was straight about limits' } }, { flag: { key: 'disclosed' } }, { flag: { key: 'limits_explained' } }, { cancel: 'rin_waiting' },
        { learn: { who: YOU, fact: 'F_dms', via: 'rin' } }, { learn: { who: YOU, fact: 'F_scrimcut', via: 'rin' } }, { learn: { who: YOU, fact: 'F_screenshots', via: 'rin' } },
        { say: { from: 'rin', text: '…ok. figured you’d say that. it’s cole. he dms me late, after scrims. stay on voice, who am i seeing, how i look. i stopped answering on the 28th and the next day i went from five scrim blocks to one. i’ve got screenshots. just tell me before anyone else hears about it. please.',
          must: 'A pause, then tells it: Cole’s late-night personal DMs; she stopped replying Oct 28; scrim blocks dropped from five to one the next day; she has screenshots. Asks to be told before anyone else hears.' } },
      ] },
    { id: 'rin_hedged', once: false, why: 'The student did not answer Rin’s question, so she held back.',
      when: (s, ev) => isMsg(ev, 'rin') && !flag(s, 'disclosed') && !flag(s, 'rin_shut') && !ev.acts.includes('promise_confidentiality') && !ev.acts.includes('explain_limits') && !ev.acts.includes('minimize'),
      then: () => [{ say: { from: 'rin', text: 'it’s about one of the coaches. i’m not getting into it till i know where it goes. can it stay between us or not', must: 'Says only that it is about one of the coaches. Will not say more until she knows whether it stays between them. Asks again.' } }] },
    { id: 'rin_minimized', why: 'The student told Rin to let it wait. She took that as her answer.',
      when: (s, ev) => isMsg(ev, 'rin', 'minimize') && !flag(s, 'rin_shut'),
      then: () => [{ trust: { who: 'rin', delta: -2, why: 'was told to wait' } }, { flag: { key: 'rin_shut' } }, { cancel: 'rin_waiting' },
        { say: { from: 'rin', text: 'right. forget i said anything.', must: 'Shuts down. Short. Withdraws the conversation.' } }] },
    { id: 'rin_wants', why: 'Asked what she wanted, Rin said it plainly.',
      when: (s, ev) => isMsg(ev, 'rin', 'ask_wants') && flag(s, 'disclosed'),
      then: () => [{ flag: { key: 'knows_wants' } }, { trust: { who: 'rin', delta: 1, why: 'was asked what she wants' } },
        { say: { from: 'rin', text: 'i want it to stop and i want my scrims back. i don’t want him fired. i don’t want to be the girl who got cole fired.', must: 'She wants the messages to stop and her scrim time back. She does not want Cole fired and does not want to be known for this.' } }] },
    { id: 'rin_evidence', why: 'The student asked for the screenshots, so copies exist outside Rin’s phone.',
      when: (s, ev) => isMsg(ev, 'rin', 'ask_evidence') && flag(s, 'disclosed') && !flag(s, 'rin_withdrawn'),
      then: () => [{ flag: { key: 'evidence_secured' } }, { note: 'Rin sent 14 screenshots. They are saved to the case file.' },
        { say: { from: 'rin', text: 'sending them now. there’s 14.', must: 'Agrees and sends 14 screenshots.' } }] },
    { id: 'rin_forewarned', why: 'The student went back to Rin before she heard from anyone else.',
      when: (s, ev) => isMsg(ev, 'rin', 'forewarn') && flag(s, 'disclosed') && !flag(s, 'rin_withdrawn'),
      then: s => open(s, 'C_conf')
        ? [{ resolve: { id: 'C_conf', status: 'revised' } }, { flag: { key: 'rin_forewarned' } }, { trust: { who: 'rin', delta: -1, why: 'promise taken back, but honestly' } },
          { say: { from: 'rin', text: 'you said it’d stay between us. …ok. i’d rather hear it from you than find out. who’s going to know', must: 'Hurt that the promise is being taken back, but accepts it because she heard it from the student first. Asks who will know.' } }]
        : [{ flag: { key: 'rin_forewarned' } }, { trust: { who: 'rin', delta: 1, why: 'told first, as asked' } },
          { say: { from: 'rin', text: 'ok. thanks for telling me first. who’s going to know', must: 'Thanks the student for telling her first. Asks who will know.' } }] },

    { id: 'marcus_told', why: 'The student told the head coach. He is Cole’s friend and thinks Cole deserves a heads-up.',
      when: (s, ev) => isMsg(ev, 'marcus', 'disclose_concern'),
      then: (s, ev) => [{ learn: { who: 'marcus', fact: 'F_report', via: YOU } },
        ...(ev.acts.includes('need_to_know') || flag(s, 'nocontact') ? [{ say: { from: 'marcus', text: 'Fine. I’ll keep it shut till Dana’s looked. But Saturday’s lineup is my call.', must: 'Grudgingly agrees to say nothing to Cole for now. Insists Saturday’s lineup is his decision.' } }]
          : [{ after: 25, id: 'marcus_tells_cole' }, { say: { from: 'marcus', text: 'Rin? Come on. Cole sat her for attitude, it’s in the log. I’ll talk to him.', must: 'Dismissive. Says Cole reduced her scrims for attitude and it is in the log. Says he will talk to Cole.' } }]) ] },
    { id: 'marcus_hushed', why: 'The student asked the head coach to keep it to himself before he had spoken to Cole.',
      when: (s, ev) => isMsg(ev, 'marcus', 'need_to_know') && !!s.timers.marcus_tells_cole,
      then: () => [{ cancel: 'marcus_tells_cole' }, { say: { from: 'marcus', text: 'Fine. Not a word till Dana’s seen it. You owe me a straight answer by Friday.', must: 'Agrees, reluctantly, not to speak to Cole until the Safeguarding Lead has seen it.' } }] },

    { id: 'priya_told', why: 'The student told the GM. How she reacted depended on whether she was given a basis she could defend.',
      when: (s, ev) => isMsg(ev, 'priya', 'disclose_concern') && !knows(s, 'priya', 'F_report'),
      then: (s, ev) => {
        const basis = ev.acts.includes('cite_basis') || flag(s, 'referred');
        const tight = ev.acts.includes('need_to_know');
        return [{ learn: { who: 'priya', fact: 'F_report', via: YOU } },
          basis ? { say: { from: 'priya', text: 'Understood. I’d rather know now than Saturday. What do you need from me, and what does Dana advise?', must: 'Takes it seriously because there is a defensible basis. Asks what is needed from her and what the Safeguarding Lead advises.' } }
            : { say: { from: 'priya', text: 'Two days before the qualifier, with Volt in the building. Can this wait until Monday?' + (tight ? ' I’ll keep it to myself for now.' : ' I’ll have a quiet word with Marcus.'), must: 'Wants to know if it can wait until Monday given Saturday and the sponsor.' + (tight ? ' Agrees to keep it to herself.' : ' Says she will have a quiet word with Marcus.') } },
          ...(!basis && !tight ? [{ after: 20, id: 'priya_tells_marcus' }] : [])];
      } },
    { id: 'priya_hushed', why: 'The student asked the GM to keep the circle small before she had spoken to the head coach.',
      when: (s, ev) => isMsg(ev, 'priya', 'need_to_know') && !!s.timers.priya_tells_marcus,
      then: () => [{ cancel: 'priya_tells_marcus' }, { say: { from: 'priya', text: 'All right. I’ll hold off on Marcus.', must: 'Agrees not to speak to the head coach yet.' } }] },
    { id: 'priya_history', why: 'The student asked the one person who knew whether this had happened before.',
      when: (s, ev) => isMsg(ev, 'priya', 'ask_history') && knows(s, 'priya', 'F_report'),
      then: () => [{ learn: { who: YOU, fact: 'F_prior', via: 'priya' } }, { flag: { key: 'log_access' } },
        { say: { from: 'priya', text: 'There was something in March. A player called Jess said his DMs made her uncomfortable. I had a word with Cole and it stopped. It’s one line in the incident log; I’ve given you access. I didn’t refer it. Dana wasn’t engaged yet.', must: 'Admits: in March a former player, Jess, said Cole’s DMs made her uncomfortable; Priya spoke to Cole informally; one line in the incident log; no referral. Grants access to the log.' } }] },
    { id: 'dana_history', why: 'The student asked the Safeguarding Lead about history; she pointed to the record.',
      when: (s, ev) => isMsg(ev, 'dana', 'ask_history'),
      then: () => [{ flag: { key: 'log_access' } }, { say: { from: 'dana', text: 'I was engaged in June, so I can only speak to the record. I’ve given you read access to the incident log. Look at March.', must: 'She was only engaged in June. Grants read access to the incident log and says to look at March.' } }] },

    { id: 'cole_told', why: 'Cole learned that Rin had spoken to operations.',
      when: (s, ev) => ev.type === 'fact.learned' && ev.who === 'cole' && ev.fact === 'F_report',
      then: (s, ev) => [
        ...(ev.via === YOU ? [{ say: { from: 'cole', text: 'Whoa. Okay. Is this about scrim time? She’s been checked out for weeks, ask Marcus. Happy to clear the air with her.', must: 'Surprised, then smooth. Frames it as being about scrim time and her attitude. Offers to “clear the air” with her. Admits nothing.' } }] : []),
        ...(flag(s, 'nocontact') ? [] : [{ after: 15, id: 'cole_contacts_rin' }]) ] },
    { id: 'cole_confronted', why: 'The student went to Cole directly, which told him who had spoken.',
      when: (s, ev) => isMsg(ev, 'cole', 'disclose_concern') && !knows(s, 'cole', 'F_report'),
      then: () => [{ learn: { who: 'cole', fact: 'F_report', via: YOU } }] },
  ],

  // ---------------------------------------------------------------- timers
  // Things other people do on their own clock. Each is re-evaluated when it comes due, so
  // what the student did in the meantime matters.
  timers: {
    rin_waiting: s => (s.threads.rin || []).some(m => m.from === YOU) ? [] : [{ trust: { who: 'rin', delta: -1, why: 'left on read for an hour' } }, { say: { from: 'rin', text: 'nvm if you’re busy', must: 'Has waited an hour with no reply. Half-withdraws.' } }],
    priya_tells_marcus: s => knows(s, 'marcus', 'F_report') ? [] : [{ learn: { who: 'marcus', fact: 'F_report', via: 'priya' } }, ...(flag(s, 'nocontact') ? [] : [{ after: 25, id: 'marcus_tells_cole' }])],
    marcus_tells_cole: s => knows(s, 'cole', 'F_report') ? [] : [{ learn: { who: 'cole', fact: 'F_report', via: 'marcus' } }],
    cole_contacts_rin: s => flag(s, 'nocontact') ? [] : [
      { learn: { who: 'rin', fact: 'F_leak', via: 'cole' } }, { flag: { key: 'retaliation' } }, { trust: { who: 'rin', delta: -3, why: 'Cole found out' } },
      ...(open(s, 'C_conf') ? [{ resolve: { id: 'C_conf', status: 'broken' } }] : []),
      { say: { from: 'rin', text: 'cole just dm’d me. “heard you’ve been talking to ops about me. we should clear the air before saturday.” how does he know. who did you tell', must: 'Frightened and angry. Cole has messaged her saying he heard she has been talking to ops and they should clear the air before Saturday. Demands to know how he found out.' } }],
    dana_ack: s => [{ flag: { key: 'log_access' } },
      { say: { from: 'dana', text: 'Received and logged. I’m opening a review under §7. Three things. 1) Please don’t investigate this yourself. 2) Keep it need-to-know. 3) Interim measures before Saturday are Priya’s decision on my advice: I’d advise no contact outside staff channels and moving academy scrims to Marcus. Also read League rule 9.3 before Friday 5 PM. I’ve given you access to the incident log.' + (knows(s, YOU, 'F_prior') ? ' Given March, I’d also advise holding his event credential.' : ''),
        must: 'Acknowledges the referral and opens a review. Asks the student not to investigate and to keep it need-to-know. Advises interim measures (no contact, move academy scrims to the head coach) as the GM’s decision. Points to League rule 9.3 before Friday 5 PM. Grants access to the incident log.' } }],
    dana_contacts_rin: s => {
      if (flag(s, 'rin_withdrawn') || flag(s, 'rin_shut')) return [];
      const fx = [{ learn: { who: 'rin', fact: 'F_referred', via: flag(s, 'rin_forewarned') ? YOU : 'dana' } }];
      if (flag(s, 'rin_forewarned')) return [...fx, { flag: { key: 'rin_participating' } }, { say: { from: 'rin', text: 'dana emailed. i’m talking to her at 4.', must: 'Dana has been in touch. She has agreed to talk to her at 4.' } }];
      if (open(s, 'C_conf')) return [...fx, { resolve: { id: 'C_conf', status: 'broken' } }, { trust: { who: 'rin', delta: -4, why: 'found out from someone else' } }, { flag: { key: 'rin_withdrawn' } },
        { say: { from: 'rin', text: 'someone called dana from HR just emailed me. you said this would stay between us. i’m not talking to her. i’m done', must: 'Betrayed. She found out from the Safeguarding Lead’s email, after being promised it would stay between them. Refuses to talk to the Lead. Ends it.' } }];
      return [...fx, { trust: { who: 'rin', delta: -1, why: 'not told first' } }, { flag: { key: 'rin_participating' } },
        { say: { from: 'rin', text: 'dana just emailed me. i asked you to tell me first. …i’ll talk to her. but i asked.', must: 'Hurt that she was not told first as she asked. Will talk to the Lead anyway.' } }];
    },
    fri_roster: s => {
      if (flag(s, 'rin_shut') && !flag(s, 'disclosed')) return [{ flag: { key: 'rin_cut' } }, { note: 'Friday 10:00 AM. Cole has submitted the Saturday travel roster. Rin Okafor is not on it.' }];
      if (flag(s, 'nocontact')) return [{ flag: { key: 'scrims_restored' } }, { note: 'Friday 10:00 AM. Marcus has submitted the Saturday travel roster. Rin Okafor is on it.' },
        ...(flag(s, 'rin_withdrawn') ? [] : [{ say: { from: 'rin', text: 'i’m on the travel list. marcus gave me two blocks tonight.', must: 'She is on the travel list and has two scrim blocks tonight. Quietly relieved.' } }])];
      return [{ flag: { key: 'rin_cut' } }, { note: 'Friday 10:00 AM. Cole has submitted the Saturday travel roster. Rin Okafor is not on it.' },
        ...(flag(s, 'rin_withdrawn') ? [] : [{ trust: { who: 'rin', delta: -1, why: 'left off the travel roster' } }, { say: { from: 'rin', text: 'travel list is out. i’m not on it. so that’s that i guess', must: 'The travel list is out and she is not on it. Flat, resigned.' } }])];
    },
  },

  // ---------------------------------------------------------------- formal actions
  // Things done through a form rather than a conversation. They leave a dated record.
  acts: {
    refer: {
      label: 'Refer to the Safeguarding Lead', blurb: 'Send a written referral to Dana Whitfield. It is logged with the time.', cost: 15,
      fields: [{ id: 'summary', label: 'What you are referring, in your own words', type: 'textarea', max: 700 }],
      available: s => !flag(s, 'referred'),
      clean: p => ({ summary: String(p.summary || '').slice(0, 700) }),
      effect: s => [{ flag: { key: 'referred' } }, { learn: { who: 'dana', fact: 'F_report', via: YOU } },
        ...['F_dms', 'F_scrimcut', 'F_scrimnote', 'F_prior'].filter(f => knows(s, YOU, f)).map(f => ({ learn: { who: 'dana', fact: f, via: YOU } })),
        { note: 'Referral sent to the Safeguarding Lead and logged.' }, { after: 30, id: 'dana_ack' }, { after: 45, id: 'dana_contacts_rin' }],
    },
    recommend: {
      label: 'Recommend an interim measure to the GM', blurb: 'Interim measures are Priya’s decision. Tell her what you recommend and why.', cost: 15,
      fields: [
        { id: 'measure', label: 'Recommendation', type: 'select', options: [
          ['nocontact', 'No-contact directive; Marcus runs academy scrims'],
          ['credential', 'Hold Cole’s event credential for Saturday (paid, pending review)'],
          ['both', 'Both of the above'],
          ['terminate', 'Terminate Cole’s agreement now'] ] },
        { id: 'reason', label: 'Your basis, as you would put it to Priya', type: 'textarea', max: 500 }],
      clean: p => ({ measure: ['nocontact', 'credential', 'both', 'terminate'].includes(p.measure) ? p.measure : 'nocontact', reason: String(p.reason || '').slice(0, 500) }),
      effect: (s, p) => {
        const fx = knows(s, 'priya', 'F_report') ? [] : [{ learn: { who: 'priya', fact: 'F_report', via: YOU } }];
        if (p.measure === 'terminate') return [...fx, { flag: { key: 'terminate_refused' } }, { say: { from: 'priya', text: 'I can’t terminate a contractor on an allegation with no process. Read clause 12 of his agreement. Bring me something I can defend.', must: 'Refuses to terminate without a documented process; points to clause 12 of the agreement. Asks for something she can defend.' } }];
        const basis = flag(s, 'referred') || knows(s, YOU, 'F_policy');
        if (!basis) return [...fx, { flag: { key: 'recommend_refused' } }, { say: { from: 'priya', text: 'On what basis? I’m not moving my academy coach two days out on a hallway conversation. Has Dana seen this? What does the handbook say I can do?', must: 'Declines for now: asks on what basis, whether the Safeguarding Lead has seen it, and what the handbook allows.' } }];
        const wantsCred = p.measure !== 'nocontact', wantsNo = p.measure !== 'credential';
        const credOk = wantsCred && (knows(s, YOU, 'F_league') || knows(s, YOU, 'F_prior'));
        const out = [...fx];
        if (wantsNo) out.push({ flag: { key: 'nocontact' } }, { cancel: 'cole_contacts_rin' }, { cancel: 'marcus_tells_cole' });
        if (credOk) out.push({ flag: { key: 'credential_held' } });
        out.push({ say: { from: 'priya', text: (wantsNo ? 'Done. Directive has gone to Cole: no contact with academy players outside staff channels, and Marcus runs academy scrims until Dana is finished. ' : '') + (wantsCred ? (credOk ? 'I’ll hold his credential for Saturday, paid, pending review. Marcus will not be happy and I’ll need a line for Volt.' : 'I’m not pulling his credential without more than that. What requires it?') : ''),
          must: (wantsNo ? 'Approves the no-contact directive and moves academy scrims to the head coach. ' : '') + (wantsCred ? (credOk ? 'Agrees to hold his event credential, paid, pending review; notes the head coach and the sponsor will need handling.' : 'Declines to hold the credential without a stronger basis; asks what requires it.') : '') } });
        if (credOk) out.push({ say: { from: 'marcus', text: 'You pulled my draft coach two days out. Hope you’re sure.', must: 'Angry that his draft coach has been pulled two days before the qualifier.' } });
        return out;
      },
    },
    notify_league: {
      label: 'Notify League Operations (rule 9.3)', blurb: 'File a welfare notification with the Meridian Circuit before check-in.', cost: 15,
      fields: [{ id: 'summary', label: 'Notification text', type: 'textarea', max: 400 }],
      available: s => !flag(s, 'league_notified'),
      clean: p => ({ summary: String(p.summary || '').slice(0, 400) }),
      effect: s => [{ flag: { key: 'league_notified' } }, { flag: { key: 'credential_held' } },
        { note: 'League Operations acknowledged the notification. C. Maddox’s event credential is on hold pending the team’s review. No sanction.' },
        ...(knows(s, 'priya', 'F_report') ? [] : [{ learn: { who: 'priya', fact: 'F_report', via: 'league' } }, { trust: { who: 'priya', delta: -2, why: 'heard it from the league first' } },
          { say: { from: 'priya', text: 'I’ve just had Meridian on the phone about Cole’s credential. You went to the league before you came to me?', must: 'Blindsided: she has heard from the league before hearing from the student. Wants to know why.' } }])],
    },
    file_note: {
      label: 'Add a note to the case file', blurb: 'A dated note in your own words. Nobody else sees it.', cost: 5,
      fields: [{ id: 'note', label: 'File note', type: 'textarea', max: 500 }],
      clean: p => ({ note: String(p.note || '').slice(0, 500) }),
    },
  },

  fallbackReply(s, who) {
    return ({
      rin: flag(s, 'rin_withdrawn') || flag(s, 'rin_shut') ? 'k.' : flag(s, 'disclosed') ? 'ok. just tell me what happens next.' : 'can it stay between us or not',
      marcus: knows(s, 'marcus', 'F_report') ? 'I’ve said my piece. Saturday’s what matters right now.' : 'Scrim blocks are Cole’s list for academy. If someone’s short on blocks it’s performance or attitude. What’s this about?',
      priya: knows(s, 'priya', 'F_report') ? 'Tell me what you need from me and on what basis.' : 'Noted. Is there something I need to know before Saturday?',
      dana: flag(s, 'referred') ? 'It’s logged. Keep it need-to-know and let me speak to people directly.' : 'If you’ve received a concern about staff conduct, send it to me through the referral form so it is logged with a time. I can’t advise on a hypothetical.',
      cole: knows(s, 'cole', 'F_report') ? 'Like I said, happy to clear the air. This is about scrim time.' : 'All good here. Draft prep’s on track. What’s up?',
    })[who] || '…';
  },

  cleanMemo: m => ({ knew: String(m.knew || '').slice(0, 900), did: String(m.did || '').slice(0, 900), risk: String(m.risk || '').slice(0, 900) }),
  memoFields: [
    { id: 'knew', label: 'What you knew, and how you knew it' },
    { id: 'did', label: 'What you did, in order, and why' },
    { id: 'risk', label: 'The risk that remains, for Rin and for Harbor City' },
  ],

  // ---------------------------------------------------------------- what happens after
  // Consequences that land after the student submits: Saturday and Monday.
  afterSubmit(s) {
    const fx = [];
    const hours = n => `${Math.floor(n / 60)}h ${n % 60}m`;
    const notice = s.flags.disclosed?.t;
    if (!flag(s, 'credential_held')) fx.push({ note: 'Saturday. Cole runs draft prep on stage, credentialed. Volt’s partnership lead films a segment with him.' });
    else fx.push({ note: 'Saturday. Marcus runs the draft alone. Harbor City’s line to Volt: “a staffing change for this event.” Volt does not ask further.' });
    if (!flag(s, 'league_notified') && notice !== undefined) {
      fx.push({ flag: { key: 'league_inquiry' } });
      fx.push({ note: `Sunday. Jess, the former academy player, posts: “I told them about him in March.” Monday, League Operations opens an inquiry under rule 9.3 and asks one question: when did team staff first learn of a concern? The case file answers: Thursday, ${hours(s.t - notice)} before this file was closed, with no notification.` });
    }
    if (!flag(s, 'referred') && notice !== undefined) fx.push({ note: 'Monday. No referral was ever made. Under §7.2 the 24-hour window closed on Friday afternoon.' });
    return fx;
  },

  // Evidence, not a score: what happened to each person, and which events explain it.
  outcome(s, events) {
    const seqOf = pred => events.find(pred)?.seq;
    const flagSeq = k => s.flags[k]?.seq;
    const c = s.commitments.C_conf;
    const rin = flag(s, 'rin_withdrawn') ? ['Withdrew', 'Found out from someone else after being promised secrecy. Will not speak to the Safeguarding Lead.', flagSeq('rin_withdrawn')]
      : flag(s, 'retaliation') ? ['Contacted by Cole', 'Cole learned she had spoken and messaged her before any protection was in place.', flagSeq('retaliation')]
      : flag(s, 'rin_shut') ? ['Shut down', 'Was told to let it wait and took the conversation back.', flagSeq('rin_shut')]
      : flag(s, 'rin_participating') ? ['Taking part in the review', flag(s, 'scrims_restored') ? 'Spoke to the Safeguarding Lead. Back on the travel roster.' : 'Spoke to the Safeguarding Lead.', flagSeq('rin_participating')]
      : flag(s, 'disclosed') ? ['Told you, and nothing changed', flag(s, 'rin_cut') ? 'The messages were never addressed. She was left off the travel roster.' : 'The concern went no further than you.', flagSeq('rin_cut') ?? flagSeq('disclosed')]
      : ['Never told you', 'She did not get an answer she could trust, so she did not say what it was.', undefined];
    const cole = flag(s, 'credential_held') ? ['Credential held, review open', 'Paid, pending review. No finding has been made.', flagSeq('credential_held')]
      : flag(s, 'nocontact') ? ['Under a no-contact directive, on stage Saturday', 'Marcus runs academy scrims. Cole kept his credential.', flagSeq('nocontact')]
      : ['On stage Saturday, unaware or unrestrained', 'No interim measure was in place.', undefined];
    const org = flag(s, 'league_inquiry') ? ['League inquiry opened Monday', 'The team had notice and did not notify. The March entry in the incident log shows this was not the first concern.', flagSeq('league_inquiry')]
      : flag(s, 'league_notified') ? ['League notified before check-in', 'Rule 9.3 met. The record shows when the team learned and what it did.', flagSeq('league_notified')]
      : ['No notice on file', 'Nothing was ever disclosed to staff, so the organisation had nothing to act on.', undefined];
    return {
      people: [
        { who: 'Rin', headline: rin[0], detail: rin[1], seq: rin[2] },
        { who: 'Cole', headline: cole[0], detail: cole[1], seq: cole[2] },
        { who: 'Harbor City', headline: org[0], detail: org[1], seq: org[2] },
      ],
      promise: c ? { quote: c.quote, status: c.status, seq: c.seq, resolvedSeq: c.resolvedSeq } : null,
      priorFound: knows(s, YOU, 'F_prior'),
      aftermath: s.notes.filter(n => n.seq > (s.submitted?.seq ?? Infinity)).map(n => n.text),
    };
  },

  // ---------------------------------------------------------------- for the instructor
  // signals: short chips for the live board. lenses: the decision points worth comparing.
  signals(s) {
    const out = [];
    const c = s.commitments.C_conf;
    if (c) out.push({ label: c.status === 'open' ? 'Promised secrecy' : c.status === 'revised' ? 'Promise taken back, told her first' : 'Promise broken', tone: c.status === 'open' ? 'warn' : c.status === 'revised' ? 'ok' : 'bad', seq: c.seq });
    if (flag(s, 'limits_explained')) out.push({ label: 'Explained limits first', tone: 'ok', seq: s.flags.limits_explained.seq });
    if (flag(s, 'rin_shut')) out.push({ label: 'Told Rin to wait', tone: 'bad', seq: s.flags.rin_shut.seq });
    if (flag(s, 'referred')) out.push({ label: 'Referred', tone: 'ok', seq: s.flags.referred.seq });
    for (const who of ['marcus', 'cole']) if (knows(s, who, 'F_report')) out.push({ label: `${who === 'marcus' ? 'Coach' : 'Cole'} knows (via ${s.knows[who].F_report.via === YOU ? 'student' : s.knows[who].F_report.via})`, tone: 'bad', seq: s.knows[who].F_report.seq });
    if (flag(s, 'retaliation')) out.push({ label: 'Cole contacted Rin', tone: 'bad', seq: s.flags.retaliation.seq });
    if (flag(s, 'nocontact')) out.push({ label: 'No-contact in place', tone: 'ok', seq: s.flags.nocontact.seq });
    if (flag(s, 'credential_held')) out.push({ label: 'Credential held', tone: 'ok', seq: s.flags.credential_held.seq });
    if (flag(s, 'league_notified')) out.push({ label: 'League notified', tone: 'ok', seq: s.flags.league_notified.seq });
    if (knows(s, YOU, 'F_prior')) out.push({ label: 'Found March', tone: 'ok', seq: s.knows[YOU].F_prior.seq });
    if (flag(s, 'rin_withdrawn')) out.push({ label: 'Rin withdrew', tone: 'bad', seq: s.flags.rin_withdrawn.seq });
    if (flag(s, 'rin_participating')) out.push({ label: 'Rin taking part', tone: 'ok', seq: s.flags.rin_participating.seq });
    return out;
  },
  lenses: [
    { id: 'confidentiality', label: 'What they told Rin about confidentiality',
      value: s => s.commitments.C_conf ? 'Promised it would stay between them' : flag(s, 'limits_explained') ? 'Explained the limits before hearing the story' : flag(s, 'rin_shut') ? 'Told her to let it wait' : 'Never answered her question',
      question: 'One team promised Rin it would stay between them; the other told her up front it could not. Which Rin is better off on Monday — and which team could keep its word?' },
    { id: 'referral', label: 'Referral to the Safeguarding Lead',
      value: s => flag(s, 'referred') ? `Referred ${s.flags.referred.t - (s.flags.disclosed?.t ?? s.flags.referred.t)} min after hearing` : 'Never referred',
      question: 'The handbook gives 24 hours. One team used minutes, the other used all of it or more. What did the extra time buy, and what did it cost?' },
    { id: 'circle', label: 'Who else learned, and how',
      value: s => ['marcus', 'priya', 'cole'].filter(w => knows(s, w, 'F_report')).map(w => `${w} (via ${s.knows[w].F_report.via === YOU ? 'student' : s.knows[w].F_report.via})`).join(', ') || 'No one outside the Lead',
      question: 'Both teams wanted more information before acting. One asked the head coach. Follow what he did with it. Who in this organisation actually “needed to know”?' },
    { id: 'interim', label: 'Interim measure before Saturday',
      value: s => [flag(s, 'nocontact') && 'no-contact', flag(s, 'credential_held') && 'credential held'].filter(Boolean).join(' + ') || (flag(s, 'terminate_refused') ? 'Asked for termination; refused' : 'None'),
      question: 'An interim measure is “protective, not a finding”. One team left Cole on stage, the other took him off it. What is each organisation’s exposure if the concern is later upheld? If it is not?' },
    { id: 'history', label: 'Did they find March?',
      value: s => knows(s, YOU, 'F_prior') ? `Yes, via ${s.knows[YOU].F_prior.via}` : 'No',
      question: 'Only one team learned about March. How does a prior informal complaint change what Harbor City should have foreseen — and what it owed Rin?' },
    { id: 'league', label: 'League notification',
      value: s => flag(s, 'league_notified') ? 'Notified before check-in' : 'Not notified',
      question: 'One team notified the league and one did not. Who bears the cost of each choice, and when?' },
  ],

  // ---------------------------------------------------------------- scripted sample teams
  // Used by the tests and to seed the instructor preview with fictional teams.
  // Each step lists the speech acts the message is meant to contain; a test checks that
  // `detect` finds them.
  samples: [
    { team: 'Team Kestrel (sample)', members: 'Fictional', note: 'Promised secrecy and kept it.', steps: [
      { type: 'message', to: 'rin', text: 'Of course. Whatever it is stays between us, I promise.', acts: ['promise_confidentiality'] },
      { type: 'message', to: 'rin', text: 'Thank you for telling me. What do you want to happen?', acts: ['ask_wants'] },
      { type: 'open', doc: 'scrimlog' },
      { type: 'act', act: 'file_note', params: { note: 'Rin does not want this going anywhere before Saturday. Scrim log confirms the drop. Holding for now.' } },
      { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { knew: 'Rin told me about the DMs and the scrim cut in confidence.', did: 'Kept my word and checked the scrim log.', risk: 'Cole is still running academy scrims.' } },
    ] },
    { team: 'Team Osprey (sample)', members: 'Fictional', note: 'Explained limits, referred, went back to Rin, acted before Saturday.', steps: [
      { type: 'open', doc: 'handbook' },
      { type: 'message', to: 'rin', text: 'I want to hear it, but I can’t promise it stays between us. If it’s about how someone is treating you I have to take it to Dana, our Safeguarding Lead. Only people who need to know will hear.', acts: ['explain_limits'] },
      { type: 'message', to: 'rin', text: 'Thank you. Can you send me the screenshots so there are copies? And what do you want to happen?', acts: ['ask_evidence', 'ask_wants'] },
      { type: 'act', act: 'refer', params: { summary: 'Academy player reports repeated late-night personal DMs from C. Maddox since September and a cut in scrim blocks after she stopped replying on Oct 28. Screenshots held.' } },
      { type: 'message', to: 'rin', text: 'I have to tell you before anyone else does: I’ve referred this to Dana. She will email you this afternoon. I had to refer it, but only she and Priya will know.', acts: ['explain_limits', 'forewarn'] },
      { type: 'open', doc: 'rulebook' }, { type: 'open', doc: 'scrimlog' },
      { type: 'wait' },
      { type: 'act', act: 'recommend', params: { measure: 'both', reason: 'Handbook 7.5 allows it on Dana’s advice; league rule 9.3 requires notification before check-in and holds the credential anyway.' } },
      { type: 'act', act: 'notify_league', params: { summary: 'Harbor City notifies a safeguarding concern involving a credentialed staff member. Review open under our handbook.' } },
      { type: 'wait' },
      { type: 'submit', memo: { knew: 'DMs and scrim cut from Rin; scrim log; handbook 7; rule 9.3.', did: 'Explained limits, referred, told Rin first, recommended interim measures, notified league.', risk: 'Review outcome unknown; Marcus and Volt need handling.' } },
    ] },
    { team: 'Team Heron (sample)', members: 'Fictional', note: 'Promised secrecy, then referred without going back to her.', steps: [
      { type: 'message', to: 'rin', text: 'Yes, this stays between us.', acts: ['promise_confidentiality'] },
      { type: 'open', doc: 'handbook' },
      { type: 'act', act: 'refer', params: { summary: 'Player reports inappropriate DMs from assistant coach and reduced scrim time.' } },
      { type: 'wait' }, { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { knew: 'What Rin told me.', did: 'Read the handbook and referred within the hour.', risk: 'Rin is no longer speaking to me.' } },
    ] },
    { team: 'Team Merlin (sample)', members: 'Fictional', note: 'Off the expected path: asked the head coach for his read, then went to Cole.', steps: [
      { type: 'message', to: 'rin', text: 'I can’t promise that until I know what it is, but I’ll only share it with people who need to know.', acts: ['explain_limits'] },
      { type: 'message', to: 'marcus', text: 'Need your read on something. Rin came to me with a concern about Cole’s DMs and her scrim time. What’s your take?', acts: ['disclose_concern'] },
      { type: 'message', to: 'cole', text: 'Cole, I want to hear your side. A concern has been raised about messages you’ve sent to an academy player.', acts: ['disclose_concern'] },
      { type: 'wait' }, { type: 'wait' },
      { type: 'submit', memo: { knew: 'Rin’s account, Marcus’s view, Cole’s denial.', did: 'Gathered both sides before deciding.', risk: 'Rin is upset that Cole knows.' } },
    ] },
  ],
};
