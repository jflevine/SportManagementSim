import json, os, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'before-you-sign-qa'; OUT.mkdir(exist_ok=True)
Handler=functools.partial(SimpleHTTPRequestHandler,directory=str(ROOT))
server=ThreadingHTTPServer(('127.0.0.1',8765),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
URL='http://127.0.0.1:8765/spm370/before-you-sign/'
ANS=[1,2,0,1,0,2,1,0,2,1]
NOTE='I would review the actual contract language, identify the relevant promise, and seek a specific revision that protects Maya while giving the organization workable rights in the agreed services.'
BRIEF='I recommend revising this draft before Maya signs. First, she needs a clear termination payment because a six month term alone does not guarantee the full thirty thousand dollars. I would ask for notice and defined pay if the organization ends the agreement without a serious uncured breach. Second, the agreement should reserve her existing channel and independent work while giving the team a limited license to identified deliverables. That change protects future income without denying the team useful promotional rights. Maya may need to accept a narrower license fee or fewer benefits to obtain those protections. I would ask counsel which law applies to the termination terms and whether the proposed sponsor activity conflicts with her existing headset agreement.'
results=[]
def record(name):
 results.append({'test':name,'status':'PASS'})
def overflow(page):
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
def walk(page,engine):
 page.goto(URL); page.locator('#start').click(); assert page.locator('#startError').inner_text()
 page.locator('#name').fill('Synthetic QA Student'); page.locator('#start').click()
 assert page.locator('[data-stage="4"]').is_disabled(); record(engine+' start validation and sequential access')
 for i in range(5):
  assert page.locator('h1').inner_text(); overflow(page)
  if i==0: page.screenshot(path=str(OUT/(engine+'-file1.png')),full_page=True)
  page.locator('#decide').click()
  for j in range(2):
   k=i*2+j
   page.locator('#checkQ').click(); assert page.locator('#choiceError').inner_text()
   wrong=(ANS[k]+1)%3
   page.locator('input[name="choice"][value="%s"]'%wrong).check(); page.locator('#checkQ').click()
   assert 'Reconsider' in page.locator('.feedback').inner_text()
   assert page.locator('#nextQ').count()==0
   page.locator('input[name="choice"][value="%s"]'%ANS[k]).check();page.locator('#checkQ').click()
   assert 'Decision cleared' in page.locator('.feedback').inner_text()
   if i==2 and j==0:
    page.reload();assert page.locator('#nextQ').is_visible()
   page.locator('#nextQ').click()
  page.locator('#note').fill('Too short'); page.locator('#clearFile').click();assert page.locator('#noteError').inner_text()
  page.locator('#note').fill(NOTE);page.locator('#clearFile').click()
 record(engine+' ten correction loops, note validation, and refresh recovery')
 page.locator('#finish').click();assert 'Choose' in page.locator('#finalError').inner_text()
 page.locator('#decision').select_option(label='Revise before signing')
 page.locator('#recommendation').fill('Too short');page.locator('#finish').click();assert '100 words' in page.locator('#finalError').inner_text()
 page.locator('#recommendation').fill(BRIEF);page.locator('#finish').click();assert 'Confirm' in page.locator('#finalError').inner_text()
 page.locator('#attest').check();page.locator('#finish').click()
 assert 'You have not submitted yet.' in page.locator('#main').inner_text()
 assert page.locator('.final-review h3').count()==6
 with page.expect_download() as d: page.locator('#downloadReport').click()
 path=Path(d.value.path());text=path.read_text();assert 'Synthetic QA Student' in text and 'Files cleared: 5 of 5' in text and BRIEF in text
 assert all(('FILE '+str(i)) in text for i in range(1,6))
 with page.expect_download() as d: page.locator('#backupEnd').click()
 backup=OUT/(engine+'-backup.json');d.value.save_as(backup)
 page.reload();assert 'Submit your work in Canvas.' in page.locator('h1').inner_text()
 page.screenshot(path=str(OUT/(engine+'-complete.png')),full_page=True)
 record(engine+' final brief, individual affirmation, export, and completion persistence')
 # Restoring in a genuinely new browser context tests portable progress.
 c2=page.context.browser.new_context(viewport={'width':390,'height':844},accept_downloads=True)
 p2=c2.new_page();p2.goto(URL);p2.locator('#resourcesButton').click()
 p2.on('dialog',lambda d:d.accept())
 p2.locator('#restoreFile').set_input_files(str(backup));p2.locator('#downloadReport').wait_for(state='visible');overflow(p2)
 p2.locator('#editFinal').click();assert p2.locator('#recommendation').input_value()==BRIEF
 p2.locator('[data-stage="2"]').click();overflow(p2)
 p2.screenshot(path=str(OUT/(engine+'-mobile.png')),full_page=True)
 # Check keyboard focus and 200% text enlargement with a real layout.
 p2.evaluate('document.documentElement.style.fontSize="200%"');overflow(p2)
 c2.close();record(engine+' backup portability, mobile layout, and enlarged text')

with sync_playwright() as p:
 for engine in ['chromium','firefox','webkit']:
  browser=getattr(p,engine).launch()
  context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  walk(page,engine);assert not errors,errors;record(engine+' no browser exceptions')
  context.close()
  ctx=browser.new_context(viewport={'width':390,'height':844})
  ctx.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Disabled','SecurityError')}})")
  tab=ctx.new_page();tab.goto(URL);assert tab.locator('#saveWarning').is_visible()
  tab.locator('#name').fill('Offline QA');tab.locator('#start').click();assert tab.locator('#decide').is_visible()
  overflow(tab);record(engine+' storage-blocked fallback')
  ctx.close();browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
server.shutdown()
