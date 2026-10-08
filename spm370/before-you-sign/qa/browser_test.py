import json, threading, functools, subprocess, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'before-you-sign-qa';OUT.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
api=subprocess.Popen(['node',str(ROOT/'spm370/before-you-sign/qa/mock-api.mjs')])
URL='http://127.0.0.1:8765/spm370/before-you-sign/'
ANS=[1,2,0,1,0,2,1,0,2,1]
NOTE='I would review the actual contract language, identify the relevant promise, and seek a specific revision that protects Maya while giving the organization workable rights in the agreed services.'
BRIEF='I recommend revising this draft before Maya signs. First, she needs a clear termination payment because a six month term alone does not guarantee the full thirty thousand dollars. I would ask for notice and defined pay if the organization ends the agreement without a serious uncured breach. Second, the agreement should reserve her existing channel and independent work while giving the team a limited license to identified deliverables. That change protects future income without denying the team useful promotional rights. Maya may need to accept a narrower license fee or fewer benefits to obtain those protections. I would ask counsel which law applies to the termination terms and whether the proposed sponsor activity conflicts with her existing headset agreement.'
ESSAY='This is a synthetic test response about permission and contract scope. The instructor should be able to read this response, evaluate its reasoning, and enter a manual grade without any student data being made public.'
results=[]
def record(s):results.append({'test':s,'status':'PASS'})
def overflow(p):assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
def route_api(ctx,lost_ack=False):
 lost=set()
 def route(route,req):
  action=json.loads(req.post_data or '{}').get('action')
  suffix='/instructor' if req.url.endswith('/instructor') else '/'
  res=ctx.request.fetch('http://127.0.0.1:8766'+suffix,method=req.method,headers=req.headers,data=req.post_data)
  if lost_ack and action in ['activity','submitQuiz'] and action not in lost:
   lost.add(action);route.abort('failed');return
  route.fulfill(status=res.status,headers=dict(res.headers),body=res.body())
 ctx.route('https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-before-you-sign**',route)
def walk(p,engine):
 p.goto(URL);p.locator('#start').click();expect(p.locator('#startError')).to_contain_text('email')
 p.locator('#name').fill('Synthetic '+engine);p.locator('#email').fill('synthetic-'+engine+'@lasalle.edu');p.locator('#identityHonor').check();p.locator('#start').click();expect(p.locator('#decide')).to_be_visible()
 for i in range(5):
  p.locator('#decide').click()
  for j in range(2):
   ans=ANS[i*2+j];p.locator('input[name=choice][value="%s"]'%((ans+1)%3)).check();p.locator('#checkQ').click();expect(p.locator('.feedback')).to_contain_text('Reconsider')
   p.locator('input[name=choice][value="%s"]'%ans).check();p.locator('#checkQ').click();p.locator('#nextQ').click()
  p.locator('#note').fill(NOTE);p.locator('#clearFile').click()
 record(engine+' full five-file activity and correction feedback')
 p.locator('#decision').select_option(label='Revise before signing');p.locator('#recommendation').fill(BRIEF);p.locator('#attest').check();p.locator('#finish').click()
 expect(p.locator('h1')).to_contain_text('Ready to send');p.locator('#submitActivity').click();expect(p.locator('#submitError')).not_to_have_text('Sending your activity…')
 expect(p.locator('#submitActivity')).to_be_enabled();p.locator('#submitActivity').click();expect(p.locator('h1')).to_have_text('Your activity is submitted.')
 p.reload();expect(p.locator('h1')).to_have_text('Your activity is submitted.');overflow(p)
 p.screenshot(path=str(OUT/(engine+'-activity-receipt.png')),full_page=True)
 record(engine+' activity persists and lost acknowledgement retry returns original receipt')
 with p.expect_download() as d:p.locator('#backupEnd').click()
 backup=OUT/(engine+'-backup.json');d.value.save_as(backup)
 p.get_by_role('link',name='Continue to Legal Literacy Check 3').click();expect(p.locator('#next')).to_be_visible()
 for i in range(12):
  p.locator('input[name=answer][value="0"]').check();p.locator('#next').click();expect(p.locator('[aria-current=step]')).to_have_text(str(i+2))
  if i==4:p.reload();expect(p.locator('#next')).to_be_visible()
 for i in range(2):
  p.locator('#essay').fill(ESSAY);p.locator('#next').click();expect(p.locator('[aria-current=step]')).to_have_text('14' if i==0 else 'Review')
 expect(p.locator('#submitQuiz')).to_be_enabled();p.locator('#submitQuiz').click();expect(p.locator('#notice')).to_contain_text('Confirm');p.locator('#attestQuiz').check();p.locator('#submitQuiz').click();expect(p.locator('#submitQuiz')).to_be_enabled();p.locator('#submitQuiz').click();expect(p.locator('h1')).to_have_text('Your work is submitted.')
 with p.expect_download() as d:p.locator('#receiptDownload').click()
 txt=Path(d.value.path()).read_text();assert 'BYS-' in txt and 'LLC3-' in txt and 'synthetic-'+engine+'@lasalle.edu' in txt
 p.reload();expect(p.locator('h1')).to_have_text('Your work is submitted.');overflow(p);p.screenshot(path=str(OUT/(engine+'-both-receipts.png')),full_page=True)
 record(engine+' quiz draft recovery, affirmation, duplicate-safe submit, and both receipts')
 # Fresh device restores private access from a backup and verifies server state.
 ctx=p.context.browser.new_context(viewport={'width':390,'height':844});route_api(ctx)
 mobile=ctx.new_page();mobile.goto(URL);mobile.locator('#resourcesButton').click();mobile.on('dialog',lambda d:d.accept());mobile.locator('#restoreFile').set_input_files(str(backup));expect(mobile.locator('h1')).to_have_text('Your activity is submitted.');overflow(mobile);mobile.get_by_role('link',name='Continue to Legal Literacy Check 3').click();expect(mobile.locator('h1')).to_have_text('Your work is submitted.');overflow(mobile);mobile.evaluate('document.documentElement.style.fontSize="200%"');overflow(mobile);ctx.close();record(engine+' fresh-device recovery and mobile enlarged layout')
 # Instructor authorization and durable review through the same handler.
 p.goto(URL+'instructor/');p.locator('#key').fill('incorrect');p.locator('#open').click();expect(p.locator('#notice')).to_contain_text('Invalid instructor');p.locator('#key').fill('synthetic-instructor-key-only');p.locator('#open').click();expect(p.locator('#dashboard')).to_be_visible()
 p.locator('#search').fill('synthetic-'+engine+'@lasalle.edu');card=p.locator('#rows > details');card.locator('summary').first.click();card.locator('input[name=activity]').fill('9');card.locator('input[name=essay1]').fill('3');card.locator('input[name=essay2]').fill('4');card.get_by_role('button',name='Save review',exact=True).click();expect(p.locator('#notice')).to_have_text('Review saved.');expect(p.locator('#rows')).to_contain_text('19/20')
 with p.expect_download() as d:p.locator('#export').click()
 csv=Path(d.value.path()).read_text();assert 'synthetic-'+engine+'@lasalle.edu' in csv and BRIEF in csv and ESSAY in csv
 p.screenshot(path=str(OUT/(engine+'-instructor.png')),full_page=True);p.locator('#logout').click();expect(p.locator('#dashboard')).to_be_hidden();assert not p.locator('#rows').inner_text();record(engine+' instructor access, review, export, and logout clearing')
try:
 with sync_playwright() as runtime:
  for engine in ['chromium','firefox','webkit']:
   browser=getattr(runtime,engine).launch();ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True);route_api(ctx,True);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));walk(p,engine);assert not errors,errors;record(engine+' no browser exceptions');browser.close()
 (OUT/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
finally:api.terminate();server.shutdown()
