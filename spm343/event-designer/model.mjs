export const VENUES = Object.freeze({
  lounge: { name: 'Gaming lounge', cost: 650, pcs: 20, socialPlaces: 10 },
  campus: { name: 'Campus activity room', cost: 350, pcs: 10, socialPlaces: 20 }
});
export const EXTRAS = Object.freeze({
  coach: { name: 'Beginner coach', cost: 150 },
  prizes: { name: 'Prize package', cost: 200 },
  refreshments: { name: 'Snacks and drinks', cost: 100 }
});
export const FORMATS = Object.freeze({ tournament: 'Tournament', social: 'Social gaming', beginner: 'Beginner session', showcase: 'Showcase or exhibition', other: 'Our own format' });
export function freshPlan() {
  return { podName: '', eventName: '', audience: '', purpose: '', format: '', experience: '', venue: '', venueReason: '', extras: [], openingMinutes: 15, mainMinutes: 90, closingMinutes: 15, operations: '', success: '', updateResponse: '' };
}
export function normalizePlan(raw) {
  const plan = freshPlan();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return plan;
  for (const key of Object.keys(plan)) {
    if (key === 'extras') plan.extras = Array.isArray(raw.extras) ? [...new Set(raw.extras.filter(x => Object.hasOwn(EXTRAS, x)))] : [];
    else if (key.endsWith('Minutes')) plan[key] = typeof raw[key] === 'number' && Number.isFinite(raw[key]) ? raw[key] : raw[key] === '' ? '' : plan[key];
    else if (typeof raw[key] === 'string') plan[key] = raw[key].slice(0, ['podName', 'eventName', 'audience'].includes(key) ? 160 : 2400);
  }
  if (!Object.hasOwn(VENUES, plan.venue)) plan.venue = '';
  if (!Object.hasOwn(FORMATS, plan.format)) plan.format = '';
  return plan;
}
export function totals(plan) {
  const venue = VENUES[plan.venue];
  const extrasCost = [...new Set(plan.extras || [])].reduce((sum, key) => sum + (EXTRAS[key]?.cost || 0), 0);
  const minutes = [plan.openingMinutes, plan.mainMinutes, plan.closingMinutes];
  const validMinutes = minutes.every(n => typeof n === 'number' && Number.isInteger(n) && n > 0 && n <= 120);
  const totalMinutes = minutes.reduce((sum, n) => sum + (typeof n === 'number' && Number.isFinite(n) ? n : 0), 0);
  const total = (venue?.cost || 0) + extrasCost;
  return { venueCost: venue?.cost || 0, extrasCost, total, remaining: 1000 - total, withinBudget: !!venue && total <= 1000, totalMinutes, validSchedule: validMinutes && totalMinutes === 120, pcs: venue?.pcs || 0 };
}
export function readiness(plan) {
  const has = key => typeof plan[key] === 'string' && plan[key].trim().length > 0;
  const t = totals(plan);
  const sections = [
    { id: 'purpose-section', label: 'Purpose and audience', complete: ['eventName', 'audience', 'purpose'].every(has) },
    { id: 'experience-section', label: 'Event experience', complete: !!FORMATS[plan.format] && has('experience') && t.validSchedule },
    { id: 'venue-section', label: 'Venue choice', complete: !!VENUES[plan.venue] && has('venueReason') },
    { id: 'operations-section', label: 'Resources and risk', complete: t.withinBudget && has('operations') },
    { id: 'success-section', label: 'Success measure', complete: has('success') }
  ];
  const issues = [];
  if (!has('eventName')) issues.push({ id: 'eventName', message: 'Give your event a name.' });
  if (!has('audience')) issues.push({ id: 'audience', message: 'Identify your intended student audience.' });
  if (!has('purpose')) issues.push({ id: 'purpose', message: 'Explain what you want the event to achieve.' });
  if (!FORMATS[plan.format]) issues.push({ id: 'format', message: 'Choose an event format.' });
  if (!has('experience')) issues.push({ id: 'experience', message: 'Describe what attendees will do, including anyone away from the PCs.' });
  if (!t.validSchedule) issues.push({ id: 'openingMinutes', message: 'Give each event stage a positive whole number of minutes, totaling 120.' });
  if (!VENUES[plan.venue]) issues.push({ id: 'venue-lounge', message: 'Choose a venue.' });
  if (!has('venueReason')) issues.push({ id: 'venueReason', message: 'Explain two reasons for your venue choice and one tradeoff.' });
  if (VENUES[plan.venue] && !t.withinBudget) issues.push({ id: 'budget-panel', message: `Reduce the plan by $${Math.abs(t.remaining)} to meet the $1,000 limit.` });
  if (!has('operations')) issues.push({ id: 'operations', message: 'Assign the organizers’ work and explain one operating risk and response.' });
  if (!has('success')) issues.push({ id: 'success', message: 'Set one measurable success target and explain how and when you will check it.' });
  return { sections, issues, complete: issues.length === 0 };
}
export function proposalText(plan) {
  const t = totals(plan), r = readiness(plan), venue = VENUES[plan.venue];
  const text = [
    'SPM 343 · DESIGN AN ESPORTS EVENT',
    'Ungraded pod activity · one shared proposal',
    `Status: ${r.complete ? 'All five sections filled; review the quality and feasibility before pitching.' : 'DRAFT — see the remaining checks below.'}`,
    plan.podName.trim() ? `Pod: ${plan.podName.trim()}` : 'Pod: not named',
    `Event: ${plan.eventName || '(add an event name)'}`,
    '', 'CASE PARAMETERS',
    '30 student attendees · 120-minute public event · $1,000 confirmed funding · three unpaid student organizers',
    'All prices, equipment, capacities, staffing, and arrangements are fictional classroom assumptions. This is not a TAP quotation or endorsement.',
    '', '1. PURPOSE AND AUDIENCE', `Audience: ${plan.audience || '(not yet entered)'}`, plan.purpose || '(not yet entered)',
    '', '2. EVENT EXPERIENCE', `Format: ${FORMATS[plan.format] || '(not yet selected)'}`, plan.experience || '(not yet entered)',
    `Welcome and briefing: ${plan.openingMinutes || 0} minutes`, `Main experience: ${plan.mainMinutes || 0} minutes`, `Close and feedback: ${plan.closingMinutes || 0} minutes`,
    `Total: ${t.totalMinutes} / 120 minutes${t.validSchedule ? '' : ' — revise the schedule'}`,
    '', '3. VENUE CHOICE', venue ? `${venue.name}: ${venue.pcs} gaming PCs + ${venue.socialPlaces} social-area places; $${venue.cost}` : '(choose a venue)',
    plan.venueReason || '(explain two features and one tradeoff)',
    '', '4. RESOURCES AND RISK', `Venue: ${venue ? `$${t.venueCost}` : 'not selected'}`,
    ...(plan.extras.length ? plan.extras.map(key => `${EXTRAS[key]?.name || key}: $${EXTRAS[key]?.cost || 0}`) : ['Optional enhancements: none']),
    `Total planned spending: $${t.total}${venue ? '' : ' (venue not yet included)'}`,
    `${t.remaining >= 0 ? 'Budget remaining' : 'Over budget'}: $${Math.abs(t.remaining)}`,
    plan.operations || '(assign organizers and explain one risk response)',
    '', '5. SUCCESS MEASURE', plan.success || '(add a target, evidence source, and time)',
    ...(plan.updateResponse.trim() ? ['', 'OPTIONAL STAFFING UPDATE', 'Only two of the three student organizers are now available. Venue technical support and any paid coach remain unchanged.', plan.updateResponse] : []),
    ...(!r.complete ? ['', 'REMAINING CHECKS', ...r.issues.map(x => `- ${x.message}`)] : []),
    '', '60-SECOND PITCH', 'Tell the class what you propose, why the venue fits, and the biggest tradeoff you accepted.',
    '', 'This file was downloaded to your device. It was not sent to an instructor or recorded for a grade.'
  ];
  return text.join('\n');
}
