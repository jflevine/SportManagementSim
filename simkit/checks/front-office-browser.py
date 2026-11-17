"""Run with local simkit dev server on port 8797. Fictional tests only."""
from playwright.sync_api import sync_playwright
import json
BASE='http://localhost:8797/mgt340/front-office/'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844});page=c.new_page(); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'?dev');page.locator('[name=team]').fill('Browser Maple');page.locator('[name=classCode]').fill('BROWSER-ARENA');page.get_by_role('button',name='Start the case').click();page.locator('[name=choice]').select_option('B');page.locator('[name=assumption]').fill('An earlier game may attract families.');page.locator('[name=approval]').fill('League and broadcast partner');page.get_by_role('button',name='Lock initial decision').click();page.get_by_text('Initial decision: B',exact=True).wait_for();assert page.get_by_text('neither player has agreed',exact=False).count()==0
 page.reload();page.get_by_text('Initial decision: B',exact=True).wait_for();page.get_by_role('button',name='Instructor has said to continue').click();page.get_by_role('button',name='Read the three policies').click()
 data={'offer':'Offer 180 seats at $12 together only after approval and confirmation.','evidence':'Policy 1','approver':'Ticket director approves the rate and block.','delivery':'Ticketing confirms contiguous seats and a coach booking.','fallback':'Remove the unconfirmed promise or postpone.','returnMeasure':'Use a group-specific return code.'}
 page.locator('[name=choice]').select_option('A')
 for k,v in data.items():page.locator(f'[name={k}]').fill(v)
 page.get_by_role('button',name='Save draft for peer review').click();page.locator('[name=peer]').fill('Neighbor asked if seating was confirmed.');page.locator('[name=changed]').fill('Added the confirmation condition.')
 page.reload();page.locator('[name=peer]').wait_for();assert page.locator('[name=peer]').input_value()=='Neighbor asked if seating was confirmed.'
 page.get_by_role('button',name='Submit final recommendation').click();page.get_by_role('heading',name='Recommendation recorded',exact=True).wait_for();assert page.get_by_role('button',name='Submit final recommendation').count()==0
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.screenshot(path='/tmp/arena-student-mobile.png',full_page=True)
 with page.expect_download() as dl:page.get_by_role('button',name='Download decision record').click()
 path=dl.value.path();record=json.load(open(path));assert record['view']['submitted']['memo']['choice']=='A';assert 'token' not in record
 # Instructor context is independent of student localStorage; dev server supplies same data.
 ic=b.new_context(viewport={'width':1280,'height':900});ip=ic.new_page();ip.goto(BASE+'instructor.html?dev');ip.locator('[name=code]').fill('BROWSER-ARENA');ip.locator('[name=key]').fill('dev');ip.get_by_role('button',name='Refresh pods').click();ip.get_by_text('Browser Maple · BROWSER-ARENA · B → A',exact=False).wait_for()
 ip.get_by_role('button',name='Create fictional sample pods').click();ip.locator('input[type=checkbox]').nth(0).wait_for();ip.locator('input[type=checkbox]').nth(0).check();ip.locator('input[type=checkbox]').nth(1).check();ip.get_by_role('heading',name='Debrief',exact=True).wait_for();assert ip.evaluate('document.documentElement.scrollWidth <= innerWidth');ip.screenshot(path='/tmp/arena-instructor-desktop.png',full_page=True)
 # Local default never contacts production, and distinguishes scope.
 lp=b.new_page(viewport={'width':390,'height':844});lp.goto(BASE);lp.get_by_text('PRIVATE LOCAL PREVIEW',exact=False).wait_for();assert lp.get_by_role('button',name='Start the case').count()==1
 assert not errors,errors
 print('PASS: initial lock, separate reveal, reload, unsent-text recovery, final receipt, export, independent instructor retrieval, two-pod comparison, 390px/1280px layout, local-mode warning; no page errors')
 b.close()
