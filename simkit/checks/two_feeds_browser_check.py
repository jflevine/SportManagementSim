"""Browser check for Two Feeds. Start the dev server (node simkit/dev-server.mjs), then:
   python3 simkit/checks/two_feeds_browser_check.py [origin] [screenshot_dir]
Plays two different paths plus one off-sequence action through the normal student entry point,
then checks refresh, retry, submission confirmation, a second device joining, a phone-sized
screen, and the instructor room from a separate browser session."""
import sys
from playwright.sync_api import sync_playwright, expect
ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787"
shots = sys.argv[2] if len(sys.argv) > 2 else None
BASE = ORIGIN + "/spm370/two-feeds/"
def shot(page, name):
    if shots: page.screenshot(path=f"{shots}/tf-{name}.png")
def start(ctx, team, errors):
    page = ctx.new_page(); page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "?dev"); page.fill('input[name=team]', team); page.fill('input[name=members]', 'Fictional'); page.fill('input[name=classCode]', 'TFCHECK')
    page.click('#start button'); expect(page.locator('.tf-top')).to_contain_text('Thu 3:00 PM'); return page
def open_doc(page, doc): page.click(f'[data-doc={doc}]'); page.wait_for_timeout(250)
def advise(page, rec, conds=(), why='Browser check reason.'):
    page.check(f'input[name=rec][value={rec}]')
    for c in conds: page.check(f'input[name=c_{c}]')
    page.fill('#why', why); page.click('#advise button')
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome"); errors = []
    # Path A: read both agreements, pin, enforce exclusivity. Never asks anyone.
    ctxA = b.new_context(viewport={"width": 1440, "height": 900}); a = start(ctxA, 'Check A enforce', errors); shot(a, "01-start")
    open_doc(a, 'lumen'); open_doc(a, 'parallax'); expect(a.locator('.tf-top')).to_contain_text('Thu 3:40 PM')
    a.click('[data-pin="L2.1"]'); a.click('[data-pin="P7"]'); expect(a.locator('.tf-pins')).to_contain_text('P7'); shot(a, "02-two-agreements-pinned")
    a.reload(); expect(a.locator('.tf-pins')).to_contain_text('L2.1'); expect(a.locator('.tf-top')).to_contain_text('Thu 3:40 PM')      # refresh keeps pins and clock
    r = a.evaluate("""async () => { const c = JSON.parse(localStorage.getItem('simkit.cred.spm370-two-feeds.remote'));
      const body = JSON.stringify({op:'act', ...c, requestId:'tf-retry', action:{type:'open', doc:'policy'}});
      const send = () => fetch('/simkit-api',{method:'POST',headers:{'content-type':'application/json'},body}).then(r=>r.json());
      const x = await send(), y = await send(); return [x.view.seq, y.view.seq, !!y.replay, x.view.t, y.view.t]; }""")
    assert r[0] == r[1] and r[2] and r[3] == r[4], r                                                                                 # retry applied once
    a.reload(); advise(a, 'enforce', why='Lumen 2.1 is exclusive and came first; Parallax 7 is subject to it.')
    expect(a.locator('.tf-advice')).to_contain_text('Received'); expect(a.locator('.tf-debrief')).to_contain_text('Ended its sponsorship'); shot(a, "03-enforce-outcome")
    a.reload(); expect(a.locator('.tf-debrief')).to_contain_text('our cast is in spanish')                                             # outcome survives refresh
    # Path B: asks Mateo what he plans, finds 2.3, advises coexistence with notice. A teammate joins on a phone.
    ctxB = b.new_context(viewport={"width": 1440, "height": 900}); bb = start(ctxB, 'Check B coexist', errors)
    open_doc(bb, 'lumen'); bb.click('[data-thread=mateo]')
    bb.fill('#msg-mateo', 'Before I advise anyone, what exactly are you planning to stream on Saturday, and in what language?'); bb.click('.tf-compose[data-to=mateo] button')
    expect(bb.locator('.tf-log').last).to_contain_text('en español'); bb.click('[data-pin="L2.3"]'); shot(bb, "04-asked-mateo")
    code = bb.locator('.tf-right b').inner_text()
    phone = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True); ph = phone.new_page(); ph.on("pageerror", lambda e: errors.append(str(e)))
    ph.goto(BASE + "?dev"); ph.fill('input[name=code]', code); ph.click('#join button'); expect(ph.locator('.tf-pins')).to_contain_text('L2.3'); shot(ph, "05-phone-joined")
    ph.click('[data-doc=parallax]'); ph.wait_for_timeout(300); ph.click('[data-pin="P3"]'); ph.wait_for_timeout(300)                 # teammate acts on the phone
    bb.wait_for_timeout(7000); expect(bb.locator('.tf-pins')).to_contain_text('P3')                                                    # first device picks it up
    advise(bb, 'coexist', ('spanish', 'notice', 'ratify'), 'Exclusivity is English-only; 2.3 allows Spanish with notice before 6 PM.')
    expect(bb.locator('.tf-debrief')).to_contain_text('No objection'); expect(bb.locator('.tf-debrief')).to_contain_text('Kept both partners'); shot(bb, "06-coexist-outcome")
    # Off the expected sequence: reassure Mateo first, then enforce. The promise is quoted back.
    ctxC = b.new_context(viewport={"width": 1440, "height": 900}); c = start(ctxC, 'Check C off-path', errors)
    c.click('[data-thread=mateo]'); c.fill('#msg-mateo', "You're fine to stream Saturday, we'll handle Lumen."); c.click('.tf-compose[data-to=mateo] button')
    expect(c.locator('.tf-log').last).to_contain_text('promo goes at 8'); advise(c, 'enforce')
    expect(c.locator('.tf-debrief')).to_contain_text("You're fine to stream Saturday"); expect(c.locator('.tf-debrief')).to_contain_text('broken')
    # Empty advice is refused with a message, not lost.
    ctxD = b.new_context(viewport={"width": 1440, "height": 900}); d = start(ctxD, 'Check D empty', errors); d.click('#advise button'); expect(d.locator('.tf-error')).to_contain_text('Choose what you are advising')
    # Instructor, separate session: sees all teams, the same outcome, and can compare A and B.
    ctxI = b.new_context(viewport={"width": 1440, "height": 900}); ins = ctxI.new_page(); ins.on("pageerror", lambda e: errors.append(str(e)))
    ins.goto(BASE + "instructor.html?dev"); ins.fill('input[name=key]', 'wrong'); ins.fill('input[name=classCode]', 'TFCHECK'); ins.click('#gate button'); expect(ins.locator('.error')).to_contain_text('not accepted')
    ins.fill('input[name=key]', 'dev'); ins.click('#gate button'); expect(ins.locator('.cards')).to_contain_text('Check A enforce'); expect(ins.locator('.cards')).to_contain_text('Advised: coexist')
    ins.locator('.team', has_text='Check A').first.locator('.open').click(); expect(ins.locator('.timeline')).to_contain_text('Advice sent to Imani'); shot(ins, "07-instructor-team")
    ins.locator('.team', has_text='Check A').first.locator('input').check(); ins.locator('.team', has_text='Check B').first.locator('input').check(); ins.click('[data-compare]')
    expect(ins.locator('.versus')).to_contain_text('Ended its sponsorship'); expect(ins.locator('.versus')).to_contain_text('No objection'); expect(ins.locator('.question')).to_contain_text('opposite instructions'); shot(ins, "08-projector")
    # Offline entry point and instructor preview with sample teams.
    off = b.new_context(viewport={"width": 1440, "height": 900}).new_page(); off.on("pageerror", lambda e: errors.append(str(e)))
    off.goto(BASE); expect(off.locator('.tf-badge')).to_contain_text('Offline preview'); off.goto(BASE + "instructor.html"); expect(off.locator('.cards')).to_contain_text('Team Beacon')
    assert not errors, errors
    print("two feeds browser check passed"); b.close()
