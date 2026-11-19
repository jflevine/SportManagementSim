"""Browser check for MGT 340 The Shortfall (optional; needs Python Playwright and Chrome).
Start the dev server first:  node simkit/dev-server.mjs   (or PORT=8799 node simkit/dev-server.mjs)
Then:                        python3 simkit/checks/shortfall_browser_check.py [base_url] [screenshot_dir]
Plays one team through the dev server: answer Maya, move the board, save, refresh, show Maya the
draft, let practice pass, submit, read the debrief, find the same team in the instructor room;
then the offline preview (?local=1) of both pages, including the two-team projector."""
import sys
from playwright.sync_api import sync_playwright, expect
ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787"
BASE = ORIGIN.rstrip("/") + "/mgt340/the-shortfall/"
shots = sys.argv[2] if len(sys.argv) > 2 else None
def shot(page, name):
    if shots: page.screenshot(path=f"{shots}/{name}.png", full_page=True)
def set_line(page, line, value):
    f = page.locator(f'#amt-{line}'); f.fill(str(value)); f.press('Tab'); page.wait_for_timeout(100)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "?dev"); shot(page, "01-welcome")
    page.fill('input[name=team]', 'Browser Check'); page.fill('input[name=members]', 'Fictional'); page.fill('input[name=classCode]', 'CHECK')
    page.click('#start button'); expect(page.locator('.log')).to_contain_text('fueling station'); shot(page, "02-office")
    page.fill('#msg', 'The sponsor fell through, so we have to cut $200,000 today. Nothing is final yet. What matters most to your team?')
    page.click('#compose button'); expect(page.locator('.log')).to_contain_text('that IS breakfast')
    page.fill('#msg', 'I will show you the numbers before I send them to Finance.'); page.click('#compose button')
    expect(page.locator('.entries')).to_contain_text('On the record')
    for line, v in [('tutoring', 70000), ('counselor', 35000), ('fueling', 70000), ('travel', 60000), ('lights', 65000), ('summeraid', 50000)]:
        set_line(page, line, v)
    expect(page.locator('.total')).to_contain_text('balanced'); expect(page.locator('.board-actions')).to_contain_text('Unsaved')
    page.click('[data-save]'); expect(page.locator('.board-actions')).to_contain_text('matches draft 1')
    shot(page, "03-draft-saved")
    page.reload(); expect(page.locator('.board-actions')).to_contain_text('matches draft 1'); expect(page.locator('#amt-fueling')).to_have_value('70000')
    # retry-safety through the real endpoint: same requestId twice applies once
    n = page.evaluate("""async () => { const c = JSON.parse(localStorage.getItem('simkit.cred.mgt340-the-shortfall.remote'));
      const body = JSON.stringify({op:'act', ...c, requestId:'fixed-retry-id', action:{type:'open', doc:'policy'}});
      const send = () => fetch('/simkit-api',{method:'POST',headers:{'content-type':'application/json'},body}).then(r=>r.json());
      const a = await send(), b2 = await send(); return [a.view.seq, b2.view.seq, !!b2.replay]; }""")
    assert n[0] == n[1] and n[2] is True, n
    page.reload()
    page.select_option('#brief select', 'maya'); page.click('#brief button'); expect(page.locator('.log')).to_contain_text('thank you for showing me first')
    page.click('[data-doc=worksheet]'); expect(page.locator('.modal')).to_contain_text('signed August 28'); shot(page, "04-document"); page.click('[data-close]')
    page.click('[data-wait]'); expect(page.locator('.entries')).to_contain_text('3:30 PM. Maya told the team'); shot(page, "05-after-practice")
    page.fill('#memo-cuts', 'Browser check: kept tutoring above the floor, travel above the charter.'); page.fill('#memo-athletes', 'Maya has seen it.')
    page.click('#memo button'); expect(page.locator('.debrief')).to_contain_text('Your budget was received')
    expect(page.locator('.debrief')).to_contain_text('Briefed before Finance'); page.locator('.debrief details summary').first.click(); shot(page, "06-debrief")
    page.reload(); expect(page.locator('.debrief')).to_contain_text('No post; invited the AD')
    ins = ctx.new_page(); ins.on("pageerror", lambda e: errors.append(str(e)))
    ins.goto(BASE + "instructor.html?dev"); ins.fill('input[name=key]', 'dev'); ins.fill('input[name=classCode]', 'CHECK'); ins.click('#gate button')
    expect(ins.locator('.cards')).to_contain_text('Browser Check'); expect(ins.locator('.cards')).to_contain_text('Maya saw draft 1')
    ins.click('.team .open'); expect(ins.locator('.timeline')).to_contain_text('less comforting and more usable'); shot(ins, "07-instructor-team")
    ins.click('[data-tab=knows]'); shot(ins, "08-who-knew-what"); ins.click('[data-tab=brief]'); expect(ins.locator('.brief')).to_contain_text('On their mind')
    # offline preview: student page and seeded instructor room
    off = ctx.new_page(); off.on("pageerror", lambda e: errors.append(str(e)))
    off.goto(BASE + "?local=1"); expect(off.locator('.badge')).to_contain_text('Offline preview')
    off.fill('input[name=team]', 'Offline Check'); off.click('#start button'); expect(off.locator('.log')).to_contain_text('fueling station')
    off.fill('#msg', 'Nobody is cutting anything, it is just a rumor.'); off.click('#compose button'); expect(off.locator('.log')).to_contain_text('so it’s fake')
    pre = ctx.new_page(); pre.on("pageerror", lambda e: errors.append(str(e)))
    pre.goto(BASE + "instructor.html?local=1"); expect(pre.locator('.cards')).to_contain_text('Team Birch'); expect(pre.locator('.cards')).to_contain_text('Offline Check'); shot(pre, "09-preview-board")
    pre.locator('.team', has_text='Alder').locator('input').check(); pre.locator('.team', has_text='Birch').locator('input').check()
    pre.click('[data-compare]'); expect(pre.locator('.question')).to_be_visible(); expect(pre.locator('.budgets')).to_contain_text('Fueling station'); shot(pre, "10-projector")
    assert not errors, errors
    print("shortfall browser check passed")
    b.close()
