// One tab owns one run. Fall back to memory if a browser denies session storage.
import { connect, localDriver } from './engine/client.mjs';
import cf from './casefile.mjs';

const dbKey = 'signal-leak.tab.v2';
const credKey = 'simkit.cred.' + cf.id + '.local';
const draftKey = 'signal-leak.tab.draft';
const memory = new Map();
let temporary = false;
const tab = {
  get(key) {
    if (!temporary) {
      try { const value = sessionStorage.getItem(key); if (value !== null) memory.set(key,value); return value; } catch { temporary = true; }
    }
    return memory.get(key) ?? null;
  },
  set(key, value) {
    memory.set(key, value);
    if (!temporary) {
      try { sessionStorage.setItem(key, value); } catch { temporary = true; }
    }
  },
  del(key) {
    memory.delete(key);
    // Deletion still runs after a quota error so a stale copy cannot survive cleanup.
    try { sessionStorage.removeItem(key); } catch { temporary = true; }
  }
};

export function openPractice() {
  return connect({caseId:cf.id, casefile:cf, driver:localDriver(cf,{storeKey:dbKey,persistence:tab, limits:{maxEvents:Infinity}}), credentials:tab});
}
export const storageWarning = () => temporary ? 'Browser saving is unavailable. Keep this tab open and copy your writing before refreshing.' : '';
export function readDraft() {
  try { return JSON.parse(tab.get(draftKey)) || {}; } catch { return {}; }
}
export function writeDraft(draft) { tab.set(draftKey, JSON.stringify(draft)); }
export function clearTab() { for (const key of [dbKey,credKey,draftKey]) tab.del(key); }
export function hasEarlierRun() {
  try { return !!localStorage.getItem(credKey); } catch { return false; }
}
export async function moveEarlierRun(resume) {
  const oldDbKey = 'signal-leak.local.v1';
  const creds = JSON.parse(localStorage.getItem(credKey));
  const old = JSON.parse(localStorage.getItem(oldDbKey));
  const id = creds?.runId;
  if (!old?.runs?.[id] || !Array.isArray(old.events?.[id])) throw Error('Earlier session is unavailable. Start a new incident.');
  const oldDraftKey = 'signal-leak.draft.' + id;
  const original = JSON.parse(localStorage.getItem(oldDraftKey) || '{}');
  tab.set(dbKey, JSON.stringify({runs:{[id]:old.runs[id]},events:{[id]:old.events[id].map(event=>({...event,caseVersion:1}))}}));
  tab.set(credKey, JSON.stringify(creds));
  writeDraft({memo:original});
  if (temporary || !await resume()) {
    clearTab();
    throw Error('This tab could not recover the session. Your earlier browser record is still available.');
  }
  delete old.runs[id];
  delete old.events[id];
  localStorage.setItem(oldDbKey, JSON.stringify(old));
  localStorage.removeItem(oldDraftKey);
  localStorage.removeItem(credKey);
}
