from playwright.sync_api import sync_playwright
from pathlib import Path
import json
base=Path(__file__).resolve().parent
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((base/'index.html').as_uri()); assert page.locator('textarea').count()==12
 page.locator('#event').fill('Fictional test response <script>alert(1)</script>');page.reload();assert 'Fictional test response' in page.locator('#event').input_value()
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.screenshot(path=str(base/'mobile-review.png'),full_page=True)
 with page.expect_download() as dl:page.locator('#download').click()
 text=Path(dl.value.path()).read_text();assert 'Fictional test response' in text and 'NOT an online submission' in text
 page.set_viewport_size({'width':1280,'height':900});assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');page.screenshot(path=str(base/'desktop-review.png'),full_page=True)
 page.evaluate('window.dispatchEvent(new Event("beforeprint"))');assert page.locator('.print-answer').count()==12;page.pdf(path=str(base/'print-test.pdf'),format='Letter')
 page.evaluate('window.dispatchEvent(new Event("afterprint"))');assert page.locator('.print-answer').count()==0
 page.locator('summary').click();assert page.locator('details').get_attribute('open') is not None
 page.on('dialog',lambda d:d.accept());page.locator('#clear').click();assert page.locator('#event').input_value()==''
 page.reload();assert page.locator('#event').input_value()==''
 page.keyboard.press('Tab');page.locator('.skip').focus();page.keyboard.press('Enter');assert page.evaluate('document.activeElement.id')=='main'
 assert not errors,errors
 # Block storage and verify honest error without losing typed response.
 c2=b.new_context();c2.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})");q=c2.new_page();q.goto((base/'index.html').as_uri());q.locator('#event').fill('Kept in page');assert 'unavailable' in q.locator('#status').inner_text();assert q.locator('#event').input_value()=='Kept in page'
 print('PASS: 12 labeled fields; reload persistence; escaped text export; desktop/mobile overflow; print response rendering; comparison reveal; confirmed clear; skip focus; storage failure; no page errors')
 b.close()
