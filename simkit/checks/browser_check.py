"""Browser check for The Report (optional; needs Python Playwright and Chrome).
Start the dev server first:  node simkit/dev-server.mjs
Then:                        python3 simkit/checks/browser_check.py [screenshot_dir]
It plays the before/after test in a real page: promise, refresh, retry, refer, consequence,
submit, and then finds the same outcome in the instructor room."""
import sys, re
from playwright.sync_api import sync_playwright, expect
import os
BASE = os.environ.get("SIMKIT_BASE", "http://localhost:8787") + "/spm370/the-report/"   # e.g. SIMKIT_BASE=http://localhost:8799
shots = sys.argv[1] if len(sys.argv) > 1 else None
def shot(page, name):
    if shots: page.screenshot(path=f"{shots}/{name}.png", full_page=False)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "?dev"); shot(page, "01-welcome")
    page.fill('input[name=team]', 'Browser Check'); page.fill('input[name=members]', 'Fictional'); page.fill('input[name=classCode]', 'CHECK')
    page.click('#start button'); expect(page.locator('.thread-log')).to_contain_text('can it stay between us'); shot(page, "02-desk")
    page.fill('#msg', 'Of course. This stays between us, I promise.'); page.click('#compose button')
    expect(page.locator('.thread-log')).to_contain_text('i have screenshots')
    expect(page.locator('.file-log')).to_contain_text('On the record'); shot(page, "03-promise-recorded")
    # refresh mid-activity: the promise survives
    page.reload(); expect(page.locator('.file-log')).to_contain_text('This stays between us, I promise.')
    # retry: resend the identical request; it must not apply twice
    n = page.evaluate("""async () => { const c = JSON.parse(localStorage.getItem('simkit.cred.spm370-the-report.remote'));
      const body = JSON.stringify({op:'act', ...c, requestId:'fixed-retry-id', action:{type:'open', doc:'handbook'}});
      const send = () => fetch('/simkit-api',{method:'POST',headers:{'content-type':'application/json'},body}).then(r=>r.json());
      const a = await send(), b2 = await send(); return [a.view.seq, b2.view.seq, !!b2.replay]; }""")
    assert n[0] == n[1] and n[2] is True, n
    page.reload(); page.click('[data-act=refer]'); page.fill('textarea[name=summary]', 'Player reports repeated personal DMs from the assistant coach and a cut in scrim time.')
    page.click('#formal button'); expect(page.locator('.file-log')).to_contain_text('Referral sent')
    page.click('[data-wait]'); page.wait_for_timeout(300); page.click('[data-wait]'); page.wait_for_timeout(300)
    page.click('[data-thread=rin]'); expect(page.locator('.thread-log')).to_contain_text('you said this would stay between us'); shot(page, "04-consequence")
    page.click('[data-memo]')
    for f in ('knew', 'did', 'risk'): page.fill(f'textarea[name={f}]', 'Browser check memo.')
    page.click('#memo button'); expect(page.locator('.debrief')).to_contain_text('Your memo was received')
    expect(page.locator('.debrief')).to_contain_text('broken'); page.locator('.debrief details summary').first.click(); shot(page, "05-debrief")
    page.reload(); page.click('[data-debrief]'); expect(page.locator('.debrief')).to_contain_text('Rin: Withdrew')
    # instructor retrieves the outcome the student saw
    ins = ctx.new_page(); ins.on("pageerror", lambda e: errors.append(str(e)))
    ins.goto(BASE + "instructor.html?dev"); ins.fill('input[name=key]', 'dev'); ins.fill('input[name=classCode]', 'CHECK'); ins.click('#gate button')
    expect(ins.locator('.cards')).to_contain_text('Browser Check'); expect(ins.locator('.cards')).to_contain_text('Promise broken'); expect(ins.locator('.cards')).to_contain_text('Rin withdrew')
    ins.click('.team .open'); expect(ins.locator('.timeline')).to_contain_text('holds the student to those words'); shot(ins, "06-instructor-team")
    ins.click('[data-tab=knows]'); shot(ins, "07-who-knew-what"); ins.click('[data-tab=brief]'); expect(ins.locator('.brief')).to_contain_text('On their mind'); shot(ins, "08-briefing")
    # offline preview: sample teams, compare two on the projector
    pre = ctx.new_page(); pre.on("pageerror", lambda e: errors.append(str(e)))
    pre.goto(BASE + "instructor.html?local=1"); expect(pre.locator('.cards')).to_contain_text('Team Osprey'); shot(pre, "09-preview-board")
    pre.locator('.team', has_text='Kestrel').locator('input').check(); pre.locator('.team', has_text='Osprey').locator('input').check()
    pre.click('[data-compare]'); expect(pre.locator('.question')).to_contain_text('Which Rin is better off'); shot(pre, "10-projector")
    assert not errors, errors
    print("browser check passed")
    b.close()
