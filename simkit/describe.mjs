// Plain-language descriptions of ledger events, shared by student and instructor pages.
// kind: 'you' (student did it) | 'world' (someone else did it) | 'hidden' (the student
// could not see it at the time) | 'record' (goes on the case file).
import { YOU, formatClock } from './kernel.mjs';

const name = (cf, id) => id === YOU ? 'the student' : cf.actors[id]?.name.split(' ')[0] || id;

export function describe(cf, e) {
  const who = id => name(cf, id);
  switch (e.type) {
    case 'run.started': return { kind: 'world', text: 'The desk opens.' };
    case 'student.message': return { kind: 'you', text: `To ${who(e.to)}: “${e.text}”`, acts: e.acts };
    case 'actor.message': return { kind: 'world', text: `${who(e.from)}: “${e.text}”`, source: e.source };
    case 'doc.opened': return { kind: 'you', text: `Read: ${cf.documents[e.doc].title}` };
    case 'student.act': return { kind: 'you', text: `${cf.acts[e.act].label}${e.params?.measure ? ' — ' + (cf.acts[e.act].fields[0].options.find(o => o[0] === e.params.measure) || [])[1] : ''}${e.params?.summary ? ': “' + e.params.summary + '”' : ''}${e.params?.reason ? ' Basis: “' + e.params.reason + '”' : ''}${e.params?.note ? ': “' + e.params.note + '”' : ''}` };
    case 'commitment.made': return { kind: 'record', text: `On the record — ${e.label}: “${e.quote}”` };
    case 'commitment.resolved': return { kind: 'hidden', text: `That promise is now: ${e.status}.` };
    case 'fact.learned': return { kind: e.who === YOU ? 'record' : 'hidden', text: `${e.who === YOU ? 'You learned' : who(e.who) + ' learned'} (from ${e.via.startsWith('doc:') ? 'a document' : who(e.via)}): ${cf.facts[e.fact].text}` };
    case 'trust.changed': return { kind: 'hidden', text: `${who(e.who)}’s trust in the student ${e.delta > 0 ? 'rose' : 'fell'} (${e.why}).` };
    case 'flag.set': return { kind: 'hidden', text: `State: ${e.key.replace(/_/g, ' ')}.`, minor: true };
    case 'rule.fired': return { kind: 'hidden', text: e.why, why: true };
    case 'timer.set': return { kind: 'hidden', text: `Set in motion: ${e.id.replace(/_/g, ' ')} at ${formatClock(cf, e.at)}.`, minor: true };
    case 'timer.cancelled': return { kind: 'hidden', text: `Headed off: ${e.id.replace(/_/g, ' ')}.` };
    case 'timer.due': return { kind: 'hidden', text: `Came due: ${e.id.replace(/_/g, ' ')}.`, minor: true };
    case 'note': return { kind: 'world', text: e.text };
    case 'clock': return { kind: 'world', text: 'Time passes.', minor: true };
    case 'run.ended': return { kind: 'world', text: 'League check-in has closed. Time is up.' };
    case 'run.submitted': return { kind: 'you', text: 'Memo submitted to the GM.' };
    default: return { kind: 'hidden', text: e.type, minor: true };
  }
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
