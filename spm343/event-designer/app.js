import { VENUES, freshPlan, normalizePlan, totals, readiness, proposalText } from './model.mjs';

const KEY = 'spm343-event-designer-v1';
const $ = id => document.getElementById(id);
const fieldNames = Object.keys(freshPlan()).filter(k => !['venue', 'extras'].includes(k));
let plan = freshPlan();
let storageAvailable = true;
let restored = false;
const money = value => '$' + Math.abs(value).toLocaleString('en-US');

function warnStorage(message) {
  storageAvailable = false;
  $('storage-warning').textContent = message;
  $('storage-warning').hidden = false;
  $('save-status').textContent = 'Not saved in this browser. Download your proposal before leaving.';
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !saved.plan || typeof saved.plan !== 'object' || Array.isArray(saved.plan)) throw new Error('Unrecognized plan');
    plan = normalizePlan(saved.plan);
    restored = true;
    $('draft-banner').hidden = false;
    $('save-status').textContent = 'Saved plan restored. You can edit every section.';
  } catch {
    warnStorage('A saved plan could not be restored, or browser storage is unavailable. You can still design and download a new plan below.');
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, plan, savedAt: new Date().toISOString() }));
    storageAvailable = true;
    $('storage-warning').hidden = true;
    $('save-status').textContent = 'Draft saved on this device · not submitted anywhere';
  } catch {
    warnStorage('This browser cannot save your draft. Keep this tab open and download your proposal before leaving. The planner and downloads still work.');
  }
}
function populate() {
  fieldNames.forEach(key => { $(key).value = plan[key]; });
  document.querySelectorAll('[name="venue"]').forEach(el => { el.checked = el.value === plan.venue; });
  document.querySelectorAll('[name="extras"]').forEach(el => { el.checked = plan.extras.includes(el.value); });
}
function capture() {
  fieldNames.forEach(key => { plan[key] = key.endsWith('Minutes') ? ($(key).value === '' ? '' : Number($(key).value)) : $(key).value; });
  plan.venue = document.querySelector('[name="venue"]:checked')?.value || '';
  plan.extras = [...document.querySelectorAll('[name="extras"]:checked')].map(el => el.value);
}
function render() {
  const t = totals(plan), r = readiness(plan), venue = VENUES[plan.venue];
  $('cost-venue').textContent = venue ? money(t.venueCost) : 'Choose a venue';
  $('cost-extras').textContent = money(t.extrasCost);
  $('cost-total').textContent = money(t.total);
  $('remaining-label').textContent = t.remaining >= 0 ? 'Budget remaining' : 'Over budget';
  $('budget-remaining').textContent = money(t.remaining);
  $('budget-panel').classList.toggle('over-budget', !!venue && !t.withinBudget);
  $('budget-message').textContent = !venue ? 'Choose a venue to complete the budget.' : !t.withinBudget ? `Your plan is ${money(t.remaining)} over the $1,000 limit. Remove an enhancement or choose the other venue.` : `Within the $1,000 limit. ${money(t.remaining)} can remain unspent; explain how your choices serve the event.`;
  $('schedule-total').textContent = `${t.totalMinutes} / 120 minutes`;
  $('schedule-message').textContent = t.validSchedule ? 'The three blocks fit the event window.' : 'Use positive whole minutes in each block and make the total 120.';
  $('schedule-status').classList.toggle('invalid', !t.validSchedule);
  $('quick-venue').textContent = venue?.name || 'Not chosen';
  $('quick-cost').textContent = venue ? `${money(t.total)} / $1,000` : 'Choose a venue';
  $('quick-time').textContent = `${t.totalMinutes} / 120 min`;
  $('completion-summary').textContent = `${r.sections.filter(s => s.complete).length} of 5 sections filled`;
  const items = $('progress-list').children;
  r.sections.forEach((section, index) => { items[index].classList.toggle('done', section.complete); });
  $('review-status').textContent = r.complete ? 'All five sections are filled, and the budget and time totals fit. Review your reasoning before the pitch.' : 'You can download a draft at any time. These items still need attention:';
  const list = $('remaining-checks');
  list.replaceChildren();
  for (const issue of r.issues) {
    const li = document.createElement('li'), link = document.createElement('a');
    link.href = '#' + issue.id; link.textContent = issue.message;
    link.addEventListener('click', () => { $(issue.id)?.focus(); });
    li.append(link); list.append(li);
  }
  list.hidden = r.complete;
  const text = proposalText(plan);
  $('proposal-preview').textContent = text;
  $('print-proposal').textContent = text;
}
function changed() { capture(); save(); render(); }
function reset() {
  if (!window.confirm('Start a new plan on this device? Download your current proposal first if you want to keep it.')) return;
  plan = freshPlan();
  try { localStorage.removeItem(KEY); } catch { /* A storage warning is shown by save below. */ }
  restored = false;
  $('draft-banner').hidden = true;
  $('optional-update').open = false;
  $('download-status').textContent = 'New plan started. Downloads stay on your device.';
  populate(); save(); render();
  $('eventName').focus();
}

$('planner').addEventListener('submit', event => event.preventDefault());
$('planner').addEventListener('input', changed);
$('planner').addEventListener('change', changed);
$('reset-plan').addEventListener('click', reset);
$('reset-restored').addEventListener('click', reset);
$('download-plan').addEventListener('click', () => {
  capture(); render();
  const content = proposalText(plan);
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  const slug = (plan.eventName.trim() || 'Event-Proposal').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0,65) || 'Event-Proposal';
  link.href = url; link.download = `SPM343-${slug}.txt`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  $('download-status').textContent = readiness(plan).complete ? 'Download requested. Check your Downloads folder. Your proposal was not sent to an instructor.' : 'Draft download requested. It includes your work and the remaining checks. Check your Downloads folder.';
});
$('print-plan').addEventListener('click', () => { capture(); render(); window.print(); });
window.addEventListener('beforeprint', () => { capture(); render(); });
load(); populate(); render();
if (!restored && storageAvailable) $('save-status').textContent = 'Your draft will save here as you work.';
