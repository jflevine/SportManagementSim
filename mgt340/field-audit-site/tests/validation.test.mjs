import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const text = readFileSync(new URL('../backend/index.ts', import.meta.url), 'utf8');
const fakeDeno = {env:{get:()=>''},serve:()=>{}};
const fakeCrypto = {randomUUID:()=> 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
const {normalize,receipt,identical} = new Function('Deno','crypto',text+'\nreturn {normalize,receipt,identical};')(fakeDeno,fakeCrypto);
const base = {
  attemptId:'11111111-1111-4111-8111-111111111111',
  formVersion:'mgt340-field-audit-site-v1',
  firstName:'  Test  ',
  lastName:' Student ',
  email:'test.student@lasalle.edu'
};
const site = {
  ...base,requestKind:'site',siteCategory:'lasalle-varsity',
  siteName:'La Salle varsity soccer',
  eventDate:'2026-10-13',eventTime:'16:00',
  venueLocation:'Philadelphia, PA',
  observationFocus:'Staffing, ticket entry, and crowd flow'
};

test('eligible La Salle athletics site receives preapproved status', () => {
  const row=normalize(site);
  assert.equal(row.approval_status,'approved');
  assert.equal(row.first_name,'Test');
  assert.equal(row.event_date,'2026-10-13');
});
test('other sites are pending faculty review', () => {
  assert.equal(normalize({...site,siteCategory:'youth-community'}).approval_status,'pending_review');
});
test('student assistance request is captured without site fields',()=>{
  const row=normalize({...base,requestKind:'assistance',siteCategory:null,siteName:null,eventDate:null,eventTime:null,venueLocation:null,observationFocus:null});
  assert.equal(row.approval_status,'assistance_requested');
  assert.equal(row.site_name,null);
});
test('off-domain emails and missing observations are rejected',()=>{
  assert.throws(()=>normalize({...site,email:'test@gmail.com'}));
  assert.throws(()=>normalize({...site,observationFocus:''}));
});
test('dates after November 8 and malformed dates are rejected',()=>{
  assert.throws(()=>normalize({...site,eventDate:'2026-11-09'}));
  assert.throws(()=>normalize({...site,eventDate:'2026-02-30'}));
});
test('changed retries are distinguishable',()=>{
  const row=normalize(site);
  assert.ok(identical(row,normalize(site)));
  assert.equal(identical(row,normalize({...site,siteName:'Another game'})),false);
});
test('receipt labels late submissions at Philadelphia deadline',()=>{
  const row=normalize(site);
  assert.equal(receipt({...row,submitted_at:'2026-10-19T03:59:59.999Z'}).late,false);
  assert.equal(receipt({...row,submitted_at:'2026-10-19T04:00:00.000Z'}).late,true);
});
