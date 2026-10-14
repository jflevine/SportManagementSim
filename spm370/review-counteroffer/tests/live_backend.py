"""Opt-in synthetic backend smoke test. Pass a private access JSON path; never prints credentials.
Only generated synthetic IDs are tested. Cleanup is a separate database-owner step.
"""
import argparse, concurrent.futures, json, secrets, urllib.request, urllib.error, uuid
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--access',required=True);parser.add_argument('--ids',required=True);args=parser.parse_args()
access=json.loads(Path(args.access).read_text());base=access['api_base']
ids=[str(uuid.uuid4()),str(uuid.uuid4()),str(uuid.uuid4())];ids_path=Path(args.ids);previous_ids=json.loads(ids_path.read_text()) if ids_path.exists() else [];ids_path.write_text(json.dumps(previous_ids+ids))
def call(path,body=None,admin=False,method=None,code=None,origin='https://jflevine.github.io'):
 headers={'Origin':origin,'Content-Type':'application/json'}
 headers['X-Instructor-Key' if admin else 'X-Class-Code']=access['instructor_key'] if admin else (access['class_code'] if code is None else code)
 req=urllib.request.Request(base+path,data=None if body is None else json.dumps(body).encode(),method=method or ('POST' if body is not None else 'GET'),headers=headers)
 try:
  with urllib.request.urlopen(req,timeout=25) as r:return r.status,json.loads(r.read())
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
def expect(status,pair):
 assert pair[0]==status, f'Expected HTTP {status}; received {pair[0]}: {pair[1].get("code", "no code")}'
 return pair[1]
payload={'submission_id':ids[0],'submission_token':secrets.token_urlsafe(54),'schema_version':1,'case_version':'decision-lab-3-v1','name':'CODEX SYNTHETIC TEST — DELETE','email':'codex-test@lasalle.edu','decision':'counter','recommendation':'Synthetic verification only. Counter with a specific payment trigger and explain the cost of uncertainty.','clause_number':3,'clarification':'Synthetic verification only: which event triggers payment and what date follows?'}
checks=[]
try:
 health=expect(200,call('/health'));assert health=={'ok':True,'configured':True,'accepts_submissions':True};checks.append('ready health')
 expect(401,call('/instructor?submission_id='+ids[0]));expect(403,call('/submit',payload,code='wrong-code-123456'));expect(403,call('/health',origin='https://untrusted.example'));checks.append('access denied without correct credentials/origin')
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  results=list(pool.map(lambda _:call('/submit',payload),range(2)))
 receipts=[expect(200,r) for r in results];assert receipts[0]['receipt']==receipts[1]['receipt'];assert sorted(x['replayed'] for x in receipts)==[False,True];checks.append('concurrent duplicate creates one receipt')
 expect(409,call('/submit',{**payload,'recommendation':'Changed answers must not overwrite the confirmed synthetic submission.'}));expect(409,call('/submit',{**payload,'submission_token':secrets.token_urlsafe(54)}));expect(409,call('/submit',{**payload,'submission_id':ids[1],'submission_token':secrets.token_urlsafe(54)}));checks.append('no payload, token, or email takeover')
 g={'submission_id':ids[0],'expected_grade_revision':0,'points':{'recommendation':3,'concept':2,'clarification':4},'feedback':'Synthetic initial grade'}
 first=expect(200,call('/grade',g,admin=True));assert first['grade']['revision']==1 and first['grade']['total']==9
 replay=expect(200,call('/grade',g,admin=True));assert replay['replayed'] and replay['grade']['revision']==1
 expect(409,call('/grade',{**g,'feedback':'Conflicting stale edit'},admin=True))
 second=expect(200,call('/grade',{**g,'expected_grade_revision':1,'points':{'recommendation':4,'concept':2,'clarification':4}},admin=True));assert second['grade']['revision']==2 and second['grade']['total']==10;checks.append('grade save, retry, conflict, and revision')
 listed=expect(200,call('/instructor?submission_id='+ids[0],admin=True));assert len(listed['submissions'])==1;record=listed['submissions'][0];assert record['recommendation']==payload['recommendation'] and record['grade']['revision']==2;assert not any(x in json.dumps(listed) for x in ['token_hash','payload_hash','class_code_hash','instructor_key_hash']);checks.append('instructor retrieval excludes private authentication material')
 closed=expect(200,call('/settings',{'accepts_submissions':False},admin=True,method='PUT'));assert not closed['settings']['accepts_submissions'];expect(200,call('/submit',payload))
 expect(409,call('/submit',{**payload,'submission_id':ids[2],'email':'codex-test-closed@lasalle.edu'}));checks.append('close prevents new work while receipt retry succeeds')
finally:
 reopened=call('/settings',{'accepts_submissions':True},admin=True,method='PUT')
 assert reopened[0]==200 and reopened[1]['settings']['accepts_submissions'], 'Instructor must reopen activity before release'
print(json.dumps({'passed':checks,'synthetic_ids_file':args.ids,'activity_reopened':True}))
