"""Anonymous browser verification. No server submissions or real student data."""
import functools, hashlib, http.server, json, os, pathlib, threading, traceback
from playwright.sync_api import sync_playwright, expect

SOURCE=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('EVENT_QA_OUTPUT','/tmp/event-designer-qa')); OUT.mkdir(parents=True,exist_ok=True)
KEY='spm343-event-designer-v1'
RESULTS=[]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=None
BASE=os.environ.get('EVENT_BASE_URL','').rstrip('/')+'/' if os.environ.get('EVENT_BASE_URL') else None
if not BASE:
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(SOURCE)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    BASE=f'http://127.0.0.1:{server.server_port}/'

def fill(p):
    values={'eventName':'Welcome to Play','podName':'Synthetic Pod','audience':'New student gamers','purpose':'Help students meet two people and feel welcome.','experience':'Short coached games alternate with introductions in the social area.','venueReason':'Twenty PCs reduce waiting and the gaming atmosphere suits the event. We accept less funding for refreshments.','operations':'Organizer1 welcomes, Organizer2 manages timing, and Organizer3 helps the social group. If a PC fails, the technician repairs it and Organizer2 offers another activity.','success':'24 of30 report meeting two people on exit cards.'}
    for key,value in values.items():p.locator('#'+key).fill(value)
    p.locator('#format').select_option('beginner');p.locator('#venue-lounge').check();p.locator('#extra-coach').check();p.locator('#extra-prizes').check()

def download(p,name):
    with p.expect_download() as event:p.locator('#download-plan').click()
    d=event.value;dest=OUT/f'{name}.txt';d.save_as(dest);return dest.read_text()

def overflow(p):
    assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),p.evaluate('({viewport:innerWidth,width:document.documentElement.scrollWidth})')

def run(browser,engine,name,fn,init=None,width=1440):
    context=browser.new_context(viewport={'width':width,'height':950},accept_downloads=True)
    if init:context.add_init_script(init)
    page=context.new_page();errors=[];posts=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r: posts.append(r.url) if r.method=='POST' else None)
    try:
        page.goto(BASE,wait_until='networkidle');expect(page.locator('#proposal-preview')).to_contain_text('SPM 343')
        fn(page,engine);assert not errors,errors;assert not posts,posts
        RESULTS.append({'browser':engine,'test':name,'status':'PASS'});print('PASS',engine,name,flush=True)
    except Exception as e:
        RESULTS.append({'browser':engine,'test':name,'status':'FAIL','error':str(e),'traceback':traceback.format_exc()})
        page.screenshot(path=str(OUT/f'{engine}-{name}-failure.png'),full_page=True)
        print('FAIL',engine,name,str(e),flush=True)
    finally:context.close()

def fresh(p,engine):
    expect(p.locator('#eventName')).to_be_editable();expect(p.locator('#completion-summary')).to_have_text('0 of 5 sections filled')
    assert p.locator('input[type=email],input[type=password]').count()==0
    assert p.locator('[disabled]').count()==0
    missing=p.locator('input,textarea,select').evaluate_all('(els)=>els.filter(e=>!e.labels.length).map(e=>e.id)');assert not missing,missing
    expect(p.locator('#optional-update')).not_to_have_attribute('open','')
    overflow(p);p.screenshot(path=str(OUT/f'{engine}-desktop.png'),full_page=True)
    assert 'DRAFT' in download(p,engine+'-blank-draft')

def budgets(p,engine):
    p.locator('#venue-lounge').check()
    for key in ['coach','prizes','refreshments']:p.locator('#extra-'+key).check()
    expect(p.locator('#cost-total')).to_have_text('$1,100');expect(p.locator('#budget-message')).to_contain_text('$100 over')
    p.locator('#venue-campus').check();expect(p.locator('#cost-total')).to_have_text('$800');expect(p.locator('#budget-remaining')).to_have_text('$200')
    for key in ['coach','prizes','refreshments']:p.locator('#extra-'+key).uncheck()
    expect(p.locator('#cost-total')).to_have_text('$350')
    p.locator('#mainMinutes').fill('100');expect(p.locator('#schedule-total')).to_have_text('130 / 120 minutes')
    expect(p.locator('#schedule-status')).to_have_class('inline-status invalid')
    p.locator('#mainMinutes').fill('');expect(p.locator('#schedule-status')).to_have_class('inline-status invalid')
    p.locator('#openingMinutes').fill('20');p.locator('#mainMinutes').fill('80');p.locator('#closingMinutes').fill('20')
    expect(p.locator('#schedule-status')).to_have_class('inline-status')

def complete(p,engine):
    fill(p);expect(p.locator('#completion-summary')).to_have_text('5 of 5 sections filled')
    expect(p.locator('#review-status')).to_contain_text('budget and time totals fit')
    p.locator('#optional-update summary').click();p.locator('#updateResponse').fill('Combine welcome and social duties. Reduce the number of simultaneous activities.')
    text=download(p,engine+'-complete');assert 'Total planned spending: $1000' in text and 'Combine welcome and social duties' in text and 'DRAFT —' not in text
    payload='<img src=x onerror="window.injected=1">';p.locator('#purpose').fill(payload)
    assert p.evaluate('window.injected') is None
    assert payload in download(p,engine+'-literal-content')
    p.evaluate('window.print=()=>{window.printCalled=true}')
    p.locator('#print-plan').click();assert p.evaluate('window.printCalled') is True
    p.emulate_media(media='print');expect(p.locator('#print-proposal')).to_be_visible();expect(p.locator('main')).not_to_be_visible()
    assert payload in p.locator('#print-proposal').inner_text()

def restore(p,engine):
    fill(p);p.reload(wait_until='networkidle');expect(p.locator('#draft-banner')).to_be_visible();expect(p.locator('#eventName')).to_have_value('Welcome to Play')
    expect(p.locator('#venue-lounge')).to_be_checked();expect(p.locator('#cost-total')).to_have_text('$1,000')
    p.once('dialog',lambda d:d.dismiss());p.locator('#reset-plan').click();expect(p.locator('#eventName')).to_have_value('Welcome to Play')
    p.once('dialog',lambda d:d.accept());p.locator('#reset-plan').click();expect(p.locator('#eventName')).to_have_value('');expect(p.locator('#completion-summary')).to_have_text('0 of 5 sections filled')
    p.reload(wait_until='networkidle');expect(p.locator('#eventName')).to_have_value('')

def blocked(p,engine):
    fill(p);expect(p.locator('#storage-warning')).to_be_visible();assert 'Welcome to Play' in download(p,engine+'-blocked-storage')
    expect(p.locator('#completion-summary')).to_have_text('5 of 5 sections filled')

def layouts(p,engine):
    overflow(p);fill(p);overflow(p);p.screenshot(path=str(OUT/f'{engine}-mobile.png'),full_page=True)
    p.set_viewport_size({'width':1440,'height':1000});p.evaluate("document.documentElement.style.fontSize='200%'");overflow(p)
    p.locator('#venue-campus').check();expect(p.locator('#cost-total')).to_have_text('$700')
    p.screenshot(path=str(OUT/f'{engine}-text-200.png'),full_page=True)
    p.goto(BASE+'instructor.html',wait_until='networkidle');expect(p.locator('h1')).to_contain_text('Run the event planning activity');overflow(p)
    if engine=='chromium':p.pdf(path=str(OUT/'instructor-guide.pdf'),print_background=True)

with sync_playwright() as pw:
    for engine in os.environ.get('EVENT_BROWSERS','chromium,firefox,webkit').split(','):
        engine=engine.strip();browser=getattr(pw,engine).launch()
        run(browser,engine,'fresh-entry-and-draft',fresh)
        run(browser,engine,'budget-and-schedule',budgets)
        run(browser,engine,'complete-export-print-safety',complete)
        run(browser,engine,'restore-and-reset',restore)
        run(browser,engine,'blocked-storage',blocked,init="Storage.prototype.getItem=function(){throw new Error('blocked')};Storage.prototype.setItem=function(){throw new Error('blocked')};")
        run(browser,engine,'mobile-large-text-and-guide',layouts,width=390)
        browser.close()
report={'results':RESULTS,'scope':'Synthetic local-only plans. No backend or grade system exists.','sourceSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in SOURCE.iterdir() if p.is_file()}}
(OUT/'results.json').write_text(json.dumps(report,indent=2))
if server:server.shutdown()
raise SystemExit(any(r['status']!='PASS' for r in RESULTS))
