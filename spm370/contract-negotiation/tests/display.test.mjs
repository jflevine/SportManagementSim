import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELDS} from '../backend/policy.mjs';
import {DISPLAY_FIELDS,proposalGroups,proposalText} from '../display.mjs';
test('plain-English proposal record covers every stored term once across five groups',()=>{
 assert.deepEqual([...DISPLAY_FIELDS].sort(),[...FIELDS].sort());assert.equal(new Set(DISPLAY_FIELDS).size,FIELDS.length);
 const p=Object.fromEntries(FIELDS.map(x=>[x,null]));const g=proposalGroups(p);assert.equal(g.length,5);assert(g.every(x=>x.terms.every(([k,v])=>!k.includes('_')&&v==='Not specified')));
});
test('proposal display makes amounts, percentages, periods, and permissions explicit',()=>{
 const t=proposalText({fee:1234,advance_percent:17,reuse_days:60,paid_ads:false,exclusive_category:'keyboard_mouse',segment_fee_share_percent:40});
 assert.match(t,/\$1,234/);assert.match(t,/17%/);assert.match(t,/April 1, 2027/);assert.match(t,/Keyboards and mice/);assert.match(t,/Paid advertising from Northline’s accounts permitted: No/);assert.match(t,/remaining 60%/);
});
