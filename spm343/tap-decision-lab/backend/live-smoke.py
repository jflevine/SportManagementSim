import urllib.request,urllib.error,json
BASE='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2'
def req(data=None,query='',origin='https://jflevine.github.io',key=None):
 headers={'Origin':origin,'Content-Type':'application/json'}
 if key: headers['x-instructor-key']=key
 r=urllib.request.Request(BASE+query,data=None if data is None else json.dumps(data).encode(),headers=headers)
 try:
  with urllib.request.urlopen(r,timeout=20) as x:return x.status,json.load(x)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
results=[]
def check(name,data,expected,query='',**kwargs):
 code,body=req(data,query,**kwargs)
 assert code==expected,(name,code,body)
 results.append({'test':name,'status':code,'passed':True})
 return body
check('public status',None,200)
g=check('guest initial read',None,200,'?view=guest')
assert g['liveEnabled'] is False
for a in ['start','resume','save','lockPlan','submit']:check('live blocked '+a,{'action':a,'mode':'live'},403)
for a in ['instructorList','instructorTest','instructorReview','instructorPublish']:check('private authentication '+a,{'action':a,'fixture':'guided'},401,key='invalid-synthetic-test-key')
check('identity payload rejected',{'action':'pilotProgress','format':'guided','stage':'draft','email':'fictional@example.invalid'},400)
check('foreign origin denied',{'action':'pilotProgress','format':'guided','stage':'draft'},403,origin='https://disallowed.example')
first=check('shared demo draft',{'action':'pilotProgress','format':'guided','stage':'draft'},200)
repeat=check('idempotent shared demo retry',{'action':'pilotProgress','format':'guided','stage':'draft'},200)
assert first==repeat
for stage in ['plan_locked','submitted']:
 check('shared demo '+stage,{'action':'pilotProgress','format':'guided','stage':stage},200)
 g=check('guest cross-request '+stage,None,200,'?view=guest')
 assert g['demo']['stage']==stage
 assert g['aggregate']['started']==1
 assert g['aggregate']['initialPlans']==1
 assert g['aggregate']['completedRevisions']==(1 if stage=='submitted' else 0)
 assert not any(x in json.dumps(g) for x in ['example.invalid','firstName','lastName','receipt','responses','scores','review'])
# Leave the public walkthrough at a clear initial demo state after smoke testing.
check('restore shared demo draft',{'action':'pilotProgress','format':'guided','stage':'draft'},200)
print(json.dumps({'passed':len(results),'results':results},indent=2))
