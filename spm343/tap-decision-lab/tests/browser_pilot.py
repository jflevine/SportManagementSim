"""Independent deterministic browser QA. Does not use real student or instructor data.
Auto-starts repository server, or uses TAP_BASE_URL. Endpoint requests are mocked,
with no live network mutation or production authorization claims.
"""
import copy, datetime, functools, hashlib, http.server, json, os, pathlib, sys, threading, traceback
from playwright.sync_api import sync_playwright, expect
SOURCE=pathlib.Path(__file__).resolve().parents[1]
ROOT=pathlib.Path(os.environ.get('TAP_QA_OUTPUT','/tmp/tap-qa')); ROOT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('TAP_BASE_URL','').rstrip('/')+'/' if os.environ.get('TAP_BASE_URL') else None
ENGINE='chromium'
ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2'
KEY='spm343-tap-lab2-pilot-v1'
FIELDS=['format-reason','access-requirement','tech-requirement','verify-question','arrival-minutes','play-minutes','closing-minutes','operations-role','success-metric','andrew-insight','revision-action','revision-decision','revision-consequence']
TEXT=['format-reason','access-requirement','tech-requirement','verify-question','operations-role','success-metric']
SECRET='LOCAL_ONLY_SYNTHETIC_TEXT_never_send_314159'
RESULTS=[]
REQUESTS=[]
ERRORS=[]

def record(name, fn):
    try:
        detail=fn()
        RESULTS.append({'name':name,'engine':ENGINE,'status':'PASS','detail':detail})
        print('PASS',name, detail or '',flush=True)
    except Exception as e:
        RESULTS.append({'name':name,'engine':ENGINE,'status':'FAIL','detail':str(e),'traceback':traceback.format_exc()})
        print('FAIL',name,str(e),flush=True)
    persist()

def persist():
    sources={str(p.relative_to(SOURCE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in SOURCE.rglob('*') if p.is_file() and 'tests' not in p.parts}
    (ROOT/'browser-qa-results.json').write_text(json.dumps({'timestampUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Browser runtime and synthetic mocked endpoint; live checks only when explicitly labelled; no real student data or credentials','results':RESULTS,'requests':REQUESTS,'consoleErrors':ERRORS,'sourceSHA256':sources},indent=2))

class Fixture:
    def __init__(self):
        self.calls=[]; self.fail=False; self.unauthorized=False; self.drop_review_once=False
        self.record={'attemptId':'synthetic-guided','firstName':'SYNTHETIC_PRIVATE_NAME','lastName':'EXAMPLE','email':'synthetic-private@example.invalid','status':'submitted','receipt':'SYNTHETIC-RECEIPT','version':1,'responses':[SECRET]*4,'review':None,'guest':{'summary':'A synthetic screened proposal for a welcoming event.','published':False}}
        self.guest={'ok':True,'mode':'pilot','synthetic':True,'aggregate':{'started':2,'initialPlans':2,'completedRevisions':1,'formats':{'guided':1,'tournament':1}},'demo':{'format':'guided','stage':'plan_locked','summary':'<img src=x onerror="window.XSS=true"> Synthetic demonstration'},'proposals':[{'label':'Proposal A','format':'tournament','summary':'<script>window.XSS=true</script> Screened synthetic summary','firstName':'PRIVATE_MUST_NOT_RENDER','email':'private-no-display@example.invalid','review':{'total':8}}],'firstName':'PRIVATE_MUST_NOT_RENDER','email':'private-no-display@example.invalid','grades':{'someone':9},'responses':[SECRET]}
    def route(self, route):
        req=route.request
        if req.method=='OPTIONS':return route.fulfill(status=204,headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-instructor-key'})
        data=req.post_data_json if req.method=='POST' else None
        entry={'method':req.method,'url':req.url,'body':data,'mock':True}
        self.calls.append(entry);REQUESTS.append(entry)
        headers={'access-control-allow-origin':'*'}
        if self.fail:return route.abort('failed')
        if req.method=='GET':return route.fulfill(status=200,json=self.guest,headers=headers)
        action=data.get('action')
        if action=='pilotProgress':return route.fulfill(status=200,json={'ok':True,'synthetic':True,'demo':{'format':data['format'],'stage':data['stage']}},headers=headers)
        if self.unauthorized:return route.fulfill(status=401,json={'ok':False,'error':{'code':'UNAUTHORIZED','message':'Synthetic unauthorized fixture'}},headers=headers)
        if action=='instructorList':body={'ok':True,'mode':'pilot','liveEnabled':False,'submissions':[self.record]}
        elif action=='instructorTest':body={'ok':True,'submission':self.record}
        elif action=='instructorReview':
            self.record['review']={'scores':data['scores'],'total':sum(data['scores'])};self.record['version']+=1
            if self.drop_review_once:self.drop_review_once=False;return route.abort('failed')
            body={'ok':True,'submission':self.record}
        elif action=='instructorPublish':
            self.record['guest']['published']=data['published'];self.record['version']+=1;body={'ok':True,'submission':self.record}
        else:body={'ok':False,'error':{'code':'UNKNOWN','message':'Unexpected test action'}}
        return route.fulfill(status=200,json=body,headers=headers)

def page_for(browser, fixture=None, viewport=None, init=None):
    context=browser.new_context(viewport=viewport or {'width':1440,'height':1000},accept_downloads=True)
    fix=fixture or Fixture();context.route(ENDPOINT+'**',fix.route)
    if init:context.add_init_script(init)
    page=context.new_page();page.on('pageerror',lambda error:ERRORS.append(str(error)));page.goto(BASE)
    return context,page,fix

def start(page):page.locator('#start-lab').click()
def fill_initial(page):
    page.locator('input[value="guided"]').check()
    for field in TEXT:page.locator('#'+field).fill(SECRET+' '+field)
    for field,val in zip(['arrival-minutes','play-minutes','closing-minutes'],['15','60','15']):page.locator('#'+field).fill(val)
def finish(page):
    for field in ['andrew-insight','revision-decision','revision-consequence']:page.locator('#'+field).fill(SECRET+' '+field)
    page.locator('#revision-action').select_option('keep');page.locator('#submit-final').click()
def saved(page):return page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
def overflow(page):
    return page.evaluate('''()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(e=>({tag:e.tagName,id:e.id,cls:e.className})).slice(0,15)})''')
def check_no_overflow(page):
    o=overflow(page);assert o['scroll']<=o['width']+1,o
    return o

def student_flow(browser):
    ctx,p,fix=page_for(browser)
    expect(p.locator('#landing')).to_be_visible();expect(p.locator('#workspace')).to_be_hidden()
    for field in FIELDS:assert p.locator('#'+field).count()==1,field
    p.keyboard.press('Tab');assert p.locator(':focus').inner_text()=='Skip to the lab'
    start(p);expect(p.locator('#format-reason')).to_be_focused();expect(p.locator('#guest-consent')).not_to_be_checked()
    p.locator('#save-initial').click();expect(p.locator('input[value="tournament"]')).to_be_focused();assert 'Choose an event format' in p.locator('#form-feedback').inner_text()
    fill_initial(p);p.wait_for_timeout(1000);assert saved(p)['status']=='draft'
    p.reload();expect(p.locator('#format-reason')).to_have_value(SECRET+' format-reason')
    p.locator('#save-initial').click();expect(p.locator('#andrew-insight')).to_be_focused();assert saved(p)['status']=='plan_locked';p.wait_for_timeout(1000)
    snapshot=copy.deepcopy(saved(p)['initialPlan']);expect(p.locator('#format-reason')).to_be_disabled();expect(p.locator('#original-plan')).to_contain_text(SECRET)
    p.reload();expect(p.locator('#revision-stage')).to_be_visible();assert saved(p)['initialPlan']==snapshot
    p.locator('#submit-final').click();assert saved(p)['status']=='plan_locked';expect(p.locator('#andrew-insight')).to_be_focused()
    finish(p);expect(p.locator('#submission-receipt')).to_be_visible();assert saved(p)['initialPlan']==snapshot
    receipt=saved(p)['receipt'];expect(p.locator('#andrew-insight')).to_be_disabled();expect(p.locator('#guest-consent')).to_be_disabled()
    p.evaluate("document.querySelector('#submit-final').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
    assert saved(p)['receipt']==receipt
    p.wait_for_timeout(1000);p.reload();expect(p.locator('#submission-receipt')).to_be_visible();assert saved(p)['receipt']==receipt
    p.goto(BASE+'guest/');p.go_back();expect(p.locator('#submission-receipt')).to_be_visible();assert saved(p)['receipt']==receipt
    p.go_forward();assert '/guest/' in p.url;p.go_back();expect(p.locator('#submission-receipt')).to_be_visible()
    with p.expect_download() as d:p.locator('#download-receipt').click()
    path=ROOT/'synthetic-completed-practice.txt';d.value.save_as(path);content=path.read_text();assert SECRET in content and receipt['id'] in content
    p.screenshot(path=str(ROOT/f'{ENGINE}-student-complete-desktop.png'),full_page=True)
    for req in fix.calls:
        if req['method']=='POST':assert set(req['body'])=={'action','format','stage'} and SECRET not in json.dumps(req) and req['body']['action']=='pilotProgress',req
    ctx.close();return 'Draft, locked snapshot, submitted reload, back/forward, stable receipt, local download, 13 field IDs, opt-in default, enum-only payload verified.'

def minutes_validation(browser):
    ctx,p,_=page_for(browser);start(p);fill_initial(p)
    cases=[('15.5','59.5','15'),('0','75','15'),('-1','76','15'),('15','60','14'),('91','-16','15'),('','75','15')]
    for vals in cases:
        for field,value in zip(['arrival-minutes','play-minutes','closing-minutes'],vals):p.locator('#'+field).fill(value)
        p.locator('#save-initial').click();assert saved(p)['status']=='draft',vals
        assert 'positive whole minutes' in p.locator('#form-feedback').inner_text(),vals
    for field,value in zip(['arrival-minutes','play-minutes','closing-minutes'],['1','88','1']):p.locator('#'+field).fill(value)
    p.locator('#save-initial').click();assert saved(p)['status']=='plan_locked'
    ctx.close();return 'Fractional, zero, negative, wrong total, out-of-range, blank rejected; 1+88+1 accepted.'

def storage_failure(browser):
    script="window.blockStorage=true; const orig=Storage.prototype.setItem; Storage.prototype.setItem=function(...args){if(window.blockStorage)throw new DOMException('Synthetic quota full','QuotaExceededError'); return orig.apply(this,args)}"
    ctx,p,_=page_for(browser,init=script);start(p);fill_initial(p)
    expect(p.locator('#retry-save')).to_be_visible();assert 'not saved' in p.locator('#save-status').inner_text()
    with p.expect_download() as d:p.locator('#download-draft').click()
    dest=ROOT/'synthetic-storage-failure-draft.txt';d.value.save_as(dest);assert SECRET in dest.read_text()
    p.evaluate('window.blockStorage=false');p.locator('#retry-save').click();expect(p.locator('#retry-save')).to_be_hidden();assert SECRET in saved(p)['values']['format-reason'];p.reload();expect(p.locator('#format-reason')).to_have_value(SECRET+' format-reason')
    ctx.close();return 'Quota failure visible; writing downloadable; Retry persists and survives reload.'

def multi_tab(browser):
    ctx,a,_=page_for(browser);start(a);fill_initial(a);b=ctx.new_page();b.goto(BASE)
    b.locator('#format-reason').fill('NEWER_SYNTHETIC_WRITING');expect(a.locator('#save-status')).to_have_text('Another tab changed this practice');expect(a.locator('#format-reason')).to_be_disabled()
    a.evaluate("document.querySelector('#format-reason').dispatchEvent(new Event('input',{bubbles:true}))")
    assert saved(a)['values']['format-reason']=='NEWER_SYNTHETIC_WRITING'
    with a.expect_download() as d:a.locator('#download-draft').click()
    dest=ROOT/'synthetic-conflicting-tab-draft.txt';d.value.save_as(dest);assert SECRET in dest.read_text()
    a.reload();expect(a.locator('#format-reason')).to_have_value('NEWER_SYNTHETIC_WRITING');expect(a.locator('#format-reason')).to_be_enabled()
    ctx.close();return 'Old tab freezes, cannot overwrite newer tab, keeps old download, reload adopts latest.'

def guest_render(browser):
    ctx,p,fix=page_for(browser);p.goto(BASE+'guest/');expect(p.locator('#started')).to_have_text('2');expect(p.locator('#proposals')).to_contain_text('<script>')
    assert p.locator('#proposals script,#demo-summary img').count()==0;assert p.evaluate('window.XSS') is None
    text=p.locator('body').inner_text();assert SECRET not in text and 'private-no-display@example.invalid' not in text and 'PRIVATE_MUST_NOT_RENDER' not in text
    fix.fail=True;p.locator('#refresh').click();expect(p.locator('#refresh-status')).to_contain_text('Connection interrupted');expect(p.locator('#started')).to_have_text('2')
    fix.fail=False;fix.guest['aggregate']['started']=3;p.locator('#refresh').click();expect(p.locator('#started')).to_have_text('3')
    p.screenshot(path=str(ROOT/f'{ENGINE}-guest-desktop.png'),full_page=True);ctx.close();return 'textContent blocks markup execution; ignores extra private fields; keeps labelled stale data on outage; manual refresh recovers.'

def login(p):p.goto(BASE+'instructor/');p.locator('#instructor-key').fill('SYNTHETIC_MOCK_KEY_NOT_A_CREDENTIAL');p.locator('#login-button').click();expect(p.locator('#private-workspace')).to_be_visible()
def instructor_flow(browser):
    ctx,p,fix=page_for(browser);login(p);assert p.locator('#instructor-key').input_value()=='';assert p.evaluate('JSON.stringify(localStorage)')=='{}';assert p.evaluate('JSON.stringify(sessionStorage)')=='{}'
    inputs=p.locator('.rubric-grid input')
    for scores in [['3','3','3','2'],['-1','3','3','2'],['1.5','3','3','2'],['','3','3','2']]:
        before=len(fix.calls)
        for i,v in enumerate(scores):inputs.nth(i).fill(v)
        p.get_by_role('button',name='Save synthetic grade').click();assert len(fix.calls)==before;expect(p.locator('#instructor-status')).to_contain_text('whole-number')
    for i,v in enumerate(['2','3','3','2']):inputs.nth(i).fill(v)
    p.get_by_role('button',name='Save synthetic grade').click();expect(p.locator('.review-record')).to_contain_text('10 / 10')
    count=len(fix.calls);p.get_by_role('button',name='Release this synthetic summary').click();assert len(fix.calls)==count;expect(p.locator('#screen-synthetic-guided')).to_be_focused()
    p.locator('#screen-synthetic-guided').check();p.get_by_role('button',name='Release this synthetic summary').click();expect(p.get_by_role('button',name='Hide from guest view')).to_be_visible()
    p.get_by_role('button',name='Hide from guest view').click();expect(p.get_by_role('button',name='Release this synthetic summary')).to_be_visible()
    before=copy.deepcopy(fix.record);p.locator('#test-guided').dblclick();expect(p.locator('.review-record')).to_have_count(1)
    p.goto(BASE+'guest/');p.go_back();expect(p.locator('#private-workspace')).to_be_hidden();expect(p.locator('#login-panel')).to_be_visible()
    login(p);p.locator('#logout').click();expect(p.locator('#records')).to_be_empty();expect(p.locator('#private-workspace')).to_be_hidden()
    ctx.close();return 'Mock-only: bounded integer scoring, 10-point save, screening gate, publish/hide, single fixture, key absent from storage, pagehide/logout locking.'

def instructor_unauthorized_refresh(browser):
    ctx,p,fix=page_for(browser);login(p);fix.unauthorized=True;p.locator('#reload').click();expect(p.locator('#private-workspace')).to_be_hidden();expect(p.locator('#instructor-status')).to_contain_text('locked');expect(p.locator('#records')).to_be_empty();ctx.close();return 'Private view clears on auth rejection during refresh.'

def instructor_retry(browser):
    ctx,p,fix=page_for(browser);login(p)
    for i,v in enumerate(['2','3','2','1']):p.locator('.rubric-grid input').nth(i).fill(v)
    fix.drop_review_once=True;p.get_by_role('button',name='Save synthetic grade').click();expect(p.locator('#instructor-status')).to_contain_text('No success is assumed')
    first=copy.deepcopy(fix.calls[-1]['body']);p.get_by_role('button',name='Save synthetic grade').click();expect(p.locator('#instructor-status')).to_contain_text('saved privately');assert fix.calls[-1]['body']==first
    ctx.close();return 'Mock-only dropped response: retry retains same action, scores, expected version, and request ID.'

def responsive_labels(browser):
    report=[]
    for width in [390,1440]:
        ctx,p,fix=page_for(browser,viewport={'width':width,'height':900});report.append({'view':'landing','width':width,**check_no_overflow(p)});p.screenshot(path=str(ROOT/f'{ENGINE}-landing-{width}.png'),full_page=True)
        start(p);fill_initial(p);report.append({'view':'draft','width':width,**check_no_overflow(p)})
        labels=p.locator('input,textarea,select').evaluate_all("els=>els.filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id||e.name)")
        assert labels==[],labels
        p.locator('#save-initial').click();finish(p);report.append({'view':'finished','width':width,**check_no_overflow(p)});p.screenshot(path=str(ROOT/f'{ENGINE}-student-complete-{width}.png'),full_page=True)
        p.goto(BASE+'guest/');expect(p.locator('#started')).to_have_text('2');report.append({'view':'guest','width':width,**check_no_overflow(p)});p.screenshot(path=str(ROOT/f'{ENGINE}-guest-{width}.png'),full_page=True)
        login(p);p.locator('.review-record details > summary').click();report.append({'view':'instructor-expanded','width':width,**check_no_overflow(p)});p.screenshot(path=str(ROOT/f'{ENGINE}-instructor-{width}.png'),full_page=True)
        labels=p.locator('input,textarea,select').evaluate_all("els=>els.filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id||e.name)")
        assert labels==[],labels
        ctx.close()
    return report

def guest_retry(browser):
    fix=Fixture();fix.fail=True;ctx,p,_=page_for(browser,fixture=fix);start(p);fill_initial(p);expect(p.locator('#guest-sync-status')).to_contain_text('pending',timeout=5000)
    assert saved(p)['values']['format-reason']==SECRET+' format-reason'
    fix.fail=False;p.evaluate("window.dispatchEvent(new Event('online'))");expect(p.locator('#guest-sync-status')).to_contain_text('updated:',timeout=5000)
    ctx.close();return 'Guest sync failure leaves local draft intact; online event retries successfully.'


def main():
    global BASE, ENGINE
    server=None
    if not BASE:
        handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(pathlib.Path(__file__).resolve().parents[3]))
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        BASE=f'http://127.0.0.1:{server.server_address[1]}/spm343/tap-decision-lab/'
    suites=[('Student completion and persistence',student_flow),('Positive whole 90-minute validation',minutes_validation),('Storage failure, download, and retry',storage_failure),('Multi-tab overwrite guard',multi_tab),('Guest privacy, XSS, and stale recovery',guest_render),('Instructor mock scoring, screening, key lifetime',instructor_flow),('Instructor unauthorized refresh clears private view',instructor_unauthorized_refresh),('Instructor mutation retry idempotency payload',instructor_retry),('Mobile and desktop overflow, labels',responsive_labels),('Student guest sync retry',guest_retry)]
    try:
        with sync_playwright() as pw:
            for engine in os.environ.get('TAP_BROWSERS','chromium').split(','):
                ENGINE=engine.strip()
                options={'headless':True}
                if os.environ.get('TAP_BROWSER_EXECUTABLE'):
                    options['executable_path']=os.environ['TAP_BROWSER_EXECUTABLE']
                try:
                    browser=getattr(pw,ENGINE).launch(**options)
                except Exception as e:
                    RESULTS.append({'name':'Browser launch','engine':ENGINE,'status':'BLOCKED','detail':str(e)})
                    persist();continue
                for name,fn in suites:
                    record(name,lambda f=fn:f(browser))
                    for context in browser.contexts:context.close()
                browser.close()
    finally:
        if server:server.shutdown()
        persist()
    counts={status.lower():sum(x['status']==status for x in RESULTS) for status in ['PASS','FAIL','BLOCKED']}
    print(json.dumps(counts,indent=2))
    return 1 if counts['fail'] or counts['blocked'] else 0

if __name__=='__main__':
    try:sys.exit(main())
    except Exception as e:
        RESULTS.append({'name':'Test environment setup','engine':ENGINE,'status':'BLOCKED','detail':str(e),'traceback':traceback.format_exc()});persist();raise
