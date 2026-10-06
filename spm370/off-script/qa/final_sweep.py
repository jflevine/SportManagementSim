"""Synthetic browser QA. Never uses real student identities or instructor keys.
Run from repository root after installing playwright==1.57.0 and its browsers.
NOVA_LIVE=1 adds one clearly marked synthetic live submission; remove it afterward.
"""
import copy
import functools
import http.server
import json
import os
from pathlib import Path
import threading
import traceback
import uuid
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[4]
PAGE_PATH = '/spm370/off-script/'
PROD = 'https://jflevine.github.io/SportManagementSim/spm370/off-script/'
API = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-offscript-nova'
KEY = 'spm370.offscript.nova.v2'
GOOD = [1, 2, 0, 1, 2]
TEXT = ['SYNTHETIC QA: Nova should negotiate specific approval rights because clause 4 excludes the proposed AI uses.', 'SYNTHETIC QA: Require approval of each final script and audio. The tradeoff is less additional compensation.']
OUT = Path('nova-qa-results'); OUT.mkdir(exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
LOCAL = 'http://127.0.0.1:8765' + PAGE_PATH
results = []

def state(first=None):
    return dict(version='2.0.0', stage=4, answers=GOOD[:], first=(first or GOOD)[:], checked=[True]*5,
                route='ai', final='ai', reflections=TEXT[:], firstName='', lastName='', email='',
                consent=False, attemptId='', pending=None, receipt=None)

def seeded(browser, data=None, suffix='', width=1440, init=None):
    ctx = browser.new_context(viewport={'width': width, 'height': 1000}, accept_downloads=True)
    page = ctx.new_page(); page.set_default_timeout(8000)
    errors=[]; page.on('pageerror', lambda err: errors.append(str(err)))
    if init: ctx.add_init_script(init)
    if data is not None:
        page.goto(LOCAL + suffix)
        page.evaluate('([key,value])=>localStorage.setItem(key,JSON.stringify(value))', [KEY + ('.demo' if 'demo=1' in suffix else ''), data])
    page.goto(LOCAL + suffix)
    return ctx,page,errors

def q(page, index, value):
    page.locator(f'input[name="q{index}"][value="{value}"]').check()

def checks(page, indices, values=GOOD):
    for i in indices: q(page,i,values[i])
    page.locator('[data-act="check"]').click()

def choice(page, group, value):
    page.locator(f'input[name="{group}"][value="{value}"]').check()

def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Horizontal overflow'

def fill_identity(page):
    page.locator('#fn').fill('Synthetic'); page.locator('#ln').fill('NovaQA')
    page.locator('#email').fill('synthetic-qa@example.invalid'); page.locator('#consent').check()

def receipt(value, code='NOVA-SYNTHETIC-LOCAL'):
    return dict(ok=True,receipt=code,score=sum(2 for i,a in enumerate(value['answers']) if a==GOOD[i]),submittedAt='2026-10-06T19:30:00.000Z')

def mock(page, handler):
    page.route('**/functions/v1/spm370-offscript-nova**',handler)

def fulfill(route, data, status=200):
    route.fulfill(status=status,content_type='application/json',headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(data))

def run(name, fn):
    try:
        fn(); results.append({'test':name,'status':'PASS'}); print('PASS',name,flush=True)
    except Exception as error:
        results.append({'test':name,'status':'FAIL','error':str(error)}); print('FAIL',name,str(error),flush=True)
        traceback.print_exc()

with sync_playwright() as pw:
    browsers={name:getattr(pw,name).launch() for name in ['chromium','firefox','webkit']}
    def walkthrough(browser, width, route='ai', final='ai'):
        ctx,p,errors=seeded(browser,width=width)
        try:
            p.locator('[data-act="start"]').click(); no_overflow(p)
            assert p.locator('[data-act="next"]').is_disabled()
            checks(p,[0,1],[0,2,0,1,2]); assert p.locator('.feedback.wrong').count()==1
            q(p,0,1); assert p.locator('[data-act="next"]').is_disabled()
            p.locator('[data-act="check"]').click(); p.reload()
            saved=p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
            assert saved['first'][0]==0 and saved['answers'][0]==1
            p.locator('[data-act="next"]').click(); no_overflow(p)
            choice(p,'route',route); checks(p,[2,3]); p.locator('[data-act="next"]').click()
            choice(p,'final',final); checks(p,[4]); no_overflow(p)
            p.locator('[data-act="review"]').click(); assert p.locator('#r0').count()==1
            p.locator('#r0').fill(TEXT[0]); p.locator('#r1').fill(TEXT[1]); p.reload()
            assert p.locator('#r0').input_value()==TEXT[0]
            p.locator('[data-act="review"]').click(); fill_identity(p)
            calls=[]
            def send(r):
                payload=r.request.post_data_json; calls.append(payload); fulfill(r,receipt(payload),201)
            mock(p,send); p.locator('#submit button').click()
            p.get_by_role('heading',name='Submission received',exact=True).wait_for()
            assert len(calls)==1 and calls[0]['proposal']==route and calls[0]['recommendation']==final
            assert calls[0]['firstAnswers'][0]==0
            p.reload(); p.get_by_role('heading',name='Submission received',exact=True).wait_for()
            with p.expect_download() as d: p.locator('[data-act="download"]').click()
            text=Path(d.value.path()).read_text(); assert 'NOVA-SYNTHETIC-LOCAL' in text and '10/10' in text
            no_overflow(p); assert not errors,errors
            if route=='ai' and final=='ai': p.screenshot(path=str(OUT/f'{browser.browser_type.name}-{width}.png'),full_page=True)
        finally: ctx.close()
    for name,b in browsers.items():
        for width in [390,820,1440]:
            run(f'{name} {width}px: start, retry, reload, writing, submit, receipt, export',lambda b=b,w=width:walkthrough(b,w))
    for route in ['ai','human','decline']:
        for final in ['ai','human','decline','accept']:
            run(f'Proposal {route} / recommendation {final}',lambda r=route,f=final:walkthrough(browsers['chromium'],1280,r,f))
    b=browsers['chromium']
    def network_retry():
        ctx,p,errors=seeded(b,state()); calls=[]
        try:
            def send(r):
                payload=r.request.post_data_json; calls.append(payload)
                if len(calls)==1:r.abort('failed')
                else:fulfill(r,receipt(payload),201)
            mock(p,send); fill_identity(p); p.locator('#submit button').click()
            p.get_by_role('button',name='Retry the same saved submission').wait_for()
            assert p.locator('#fn').is_disabled(); p.reload()
            p.get_by_role('button',name='Retry the same saved submission').click()
            p.get_by_role('heading',name='Submission received',exact=True).wait_for()
            assert len(calls)==2 and calls[0]==calls[1]; assert not errors,errors
        finally:ctx.close()
    run('Interrupted connection + reload retries the identical attempt',network_retry)
    def validation_recovery():
        ctx,p,errors=seeded(b,state()); calls=[]
        try:
            def send(r):
                value=r.request.post_data_json; calls.append(value)
                if len(calls)==1:fulfill(r,{'error':'Complete the required fields within the displayed limits.'},400)
                else:fulfill(r,receipt(value),201)
            mock(p,send); fill_identity(p); p.locator('#submit button').click(); p.locator('#error:not([hidden])').wait_for()
            assert p.locator('#fn').is_enabled(),'Definitively rejected input leaves the student permanently locked'
            p.locator('#fn').fill('CorrectedSynthetic'); p.locator('#submit button').click()
            p.get_by_role('heading',name='Submission received',exact=True).wait_for()
            assert calls[1]['firstName']=='CorrectedSynthetic'; assert not errors,errors
        finally:ctx.close()
    run('A definite validation rejection can be corrected without losing writing',validation_recovery)
    def legacy_timeout():
        ctx,p,errors=seeded(b,state(),init='Object.defineProperty(AbortSignal,"timeout",{value:undefined,configurable:true});')
        try:
            mock(p,lambda r:fulfill(r,receipt(r.request.post_data_json),201))
            fill_identity(p); p.locator('#submit button').click()
            p.get_by_role('heading',name='Submission received',exact=True).wait_for()
            assert not errors,errors
        finally:ctx.close()
    run('Submission works without AbortSignal.timeout browser support',legacy_timeout)
    def demo():
        ctx,p,errors=seeded(b,state(),suffix='?demo=1'); calls=[]
        try:
            mock(p,lambda r:(calls.append(r.request.url),r.abort()))
            assert p.locator('#submit').count()==0
            p.on('dialog',lambda d:d.accept())
            p.locator('[data-act="reset-demo"]').click()
            assert p.locator('[data-act="start"]').count()==1
            assert not calls and not errors
        finally:ctx.close()
    run('Demo cannot submit and can restart independently',demo)
    def storage_failure():
        ctx,p,errors=seeded(b,init='Storage.prototype.setItem=()=>{throw new Error("storage blocked")};')
        try:
            p.locator('[data-act="start"]').click(); checks(p,[0,1]); p.locator('[data-act="next"]').click()
            assert 'Browser saving is unavailable' in p.inner_text('body')
            assert p.locator('.top a').get_attribute('target')=='_blank','Guide should not navigate away from an unsaved activity'
            assert not errors,errors
        finally:ctx.close()
    run('Blocked storage warns clearly and guide does not replace the activity',storage_failure)
    def malformed_response():
        ctx,p,errors=seeded(b,state())
        try:
            mock(p,lambda r:fulfill(r,{'ok':True,'score':10},200)); fill_identity(p);p.locator('#submit button').click()
            p.locator('#error:not([hidden])').wait_for(); assert p.get_by_role('heading',name='Submission received',exact=True).count()==0
            assert p.locator('#fn').is_disabled(); assert not errors,errors
        finally:ctx.close()
    run('Malformed response is never displayed as a confirmed submission',malformed_response)
    def duplicate():
        ctx,p,errors=seeded(b,state())
        try:
            mock(p,lambda r:fulfill(r,{'error':'A Nova lab is already submitted for this email. Its record has not been changed. Use the earlier receipt or contact your instructor.'},409))
            fill_identity(p);p.locator('#submit button').click();p.locator('#error:not([hidden])').wait_for()
            assert p.get_by_role('heading',name='Submission received',exact=True).count()==0
            with p.expect_download() as d:p.locator('[data-act="download"]').click()
            assert 'No confirmed online receipt' in Path(d.value.path()).read_text();assert not errors,errors
        finally:ctx.close()
    run('Duplicate rejection preserves writing and provides a fallback export',duplicate)
    def instructor():
        ctx,p,errors=seeded(b,suffix='?instructor=1'); rows=[dict(id=str(uuid.uuid4()),first_name='Synthetic',last_name='NovaQA',email='qa@example.invalid',submitted_at='2026-10-06T19:30:00Z',score=10,first_score=8,grade_override=None,grader_notes='',graded_at=None,work=dict(proposal='ai',recommendation='ai',answers=GOOD,firstAnswers=[0,2,0,1,2],reflections=TEXT))]
        try:
            def handler(r):
                if r.request.headers.get('x-instructor-key')!='synthetic-local-fixture':return fulfill(r,{'error':'Invalid instructor key.'},401)
                if r.request.method=='POST':
                    v=r.request.post_data_json;rows[0].update(grade_override=v['grade'],grader_notes=v['notes'],graded_at='2026-10-06T19:30:00Z');return fulfill(r,{'ok':True})
                fulfill(r,{'ok':True,'submissions':rows})
            mock(p,handler);p.locator('#access').fill('invalid');p.locator('#login button').click();p.locator('#login-error:not([hidden])').wait_for()
            p.locator('#access').fill('synthetic-local-fixture');p.locator('#login button').click();p.locator('[data-student]').click()
            p.locator('#grade-number').fill('8.5');p.locator('#grade-notes').fill('=SYNTHETIC CSV FORMULA SAFETY CHECK')
            p.locator('#grade button').click();p.get_by_text('Reviewed grade saved.',exact=True).wait_for()
            assert rows[0]['grade_override']==8.5
            with p.expect_download() as d:p.locator('[data-act="csv"]').click()
            text=Path(d.value.path()).read_text();assert '8.5' in text and "'=SYNTHETIC" in text
            p.locator('[data-act="lock"]').click();assert p.locator('#access').count()==1;assert not errors,errors
        finally:ctx.close()
    run('Instructor login, synthetic response review, grade override, CSV safety, lock',instructor)
    if os.environ.get('NOVA_LIVE')=='1':
        def live():
            ctx=b.new_context();p=ctx.new_page();p.set_default_timeout(20000)
            try:
                # Serve the tested candidate at the production origin; the API is NOT mocked.
                p.route(PROD,lambda r:r.fulfill(content_type='text/html',body=(ROOT/'spm370/off-script/index.html').read_text()))
                p.goto(PROD);p.evaluate('([k,v])=>localStorage.setItem(k,JSON.stringify(v))',[KEY,state([0,2,0,1,2])]);p.reload()
                email='nova-final-qa-'+os.environ.get('GITHUB_RUN_ID','local')+'-'+os.environ.get('GITHUB_RUN_ATTEMPT','1')+'@example.invalid'
                p.locator('#fn').fill('Synthetic');p.locator('#ln').fill('FinalNovaQA');p.locator('#email').fill(email);p.locator('#consent').check()
                p.locator('#submit button').click();p.get_by_role('heading',name='Submission received',exact=True).wait_for()
                saved=p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY);payload=saved['receipt']['submitted']
                assert saved['receipt']['score']==10; print('SYNTHETIC_CLEANUP',email,flush=True)
                r=ctx.request.post(API,data=json.dumps(payload),headers={'Content-Type':'application/json','Origin':'https://jflevine.github.io'})
                assert r.status==200 and r.json()['receipt']==saved['receipt']['receipt']
                payload['attemptId']=str(uuid.uuid4())
                assert ctx.request.post(API,data=json.dumps(payload),headers={'Content-Type':'application/json'}).status==409
                assert ctx.request.get(API+'/instructor').status==401
                assert ctx.request.get(API+'/instructor',headers={'x-instructor-key':'deliberately-invalid-qa'}).status==401
                assert ctx.request.get(API,headers={'Origin':'https://not-authorized.invalid'}).status==403
                assert ctx.request.get(API).json()['storageReady'] is True
            finally:ctx.close()
        run('Real browser-to-live-API submission, receipt replay, duplicate and access controls',live)
    for browser in browsers.values():browser.close()
server.shutdown()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print('NOVA_FINAL_QA_SUMMARY',json.dumps({'passed':sum(x['status']=='PASS' for x in results),'failed':sum(x['status']=='FAIL' for x in results),'total':len(results)}),flush=True)
raise SystemExit(1 if any(x['status']=='FAIL' for x in results) else 0)
