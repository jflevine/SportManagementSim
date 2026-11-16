"""Browser check for MGT 340 The Investment Committee (optional; needs Python Playwright and Chrome).
Start the dev server first:  PORT=8799 node simkit/dev-server.mjs
Then:  python3 simkit/checks/investment_committee_browser_check.py http://localhost:8799 [screenshot_dir]
Plays one pod on a phone-sized screen through the dev server (Round 1, reload, read, call, second
device joins and sees Round 1, submit, debrief), finds it in the instructor room, then runs the
offline preview (?local=1) of both pages including the two-pod projector."""
import sys
from playwright.sync_api import sync_playwright, expect
ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787"
BASE = ORIGIN.rstrip("/") + "/mgt340/investment-committee/"
shots = sys.argv[2] if len(sys.argv) > 2 else None
def shot(page, name):
    if shots: page.screenshot(path=f"{shots}/{name}.png", full_page=True)
REASON = "Every club sells tickets, so one fan platform could serve all 32."
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    phone = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = phone.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "?dev"); shot(page, "tue-01-welcome")
    page.fill('input[name=team]', 'Browser Check'); page.fill('input[name=members]', 'Fictional'); page.fill('input[name=classCode]', 'CHECK')
    page.click('#start button'); expect(page.locator('#round1')).to_contain_text('Which industry'); shot(page, "tue-02-round1")
    assert page.locator('[data-open]').count() == 0, 'no file before Round 1'
    page.select_option('#r1-sector', 'fan'); page.fill('#r1-reason', REASON); page.click('#round1 button')
    expect(page.locator('#round1-pinned')).to_contain_text(REASON); expect(page.locator('body')).to_contain_text('TurnstileIQ'); shot(page, "tue-03-round2")
    page.reload(); expect(page.locator('#round1-pinned')).to_contain_text(REASON)
    page.click('[data-open=charter]'); expect(page.locator('details.doc')).to_contain_text('4.3')
    page.click('[data-open=memo_fan]'); expect(page.locator('body')).to_contain_text('Nine clubs')
    page.click('[data-ask=counsel]'); expect(page.locator('body')).to_contain_text('two of the 32'); shot(page, "tue-04-after-call")
    # no horizontal scrolling on a phone, and tap targets are at least 44px tall
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), 'page scrolls sideways on a phone'
    assert page.evaluate("[...document.querySelectorAll('button,select,summary')].every(e => e.getBoundingClientRect().height >= 44)"), 'small tap target'
    # a second device joins with the pod code and sees the same Round 1 answer
    code = page.locator('.top b').first.inner_text()
    other = b.new_context(viewport={"width": 1280, "height": 800}).new_page(); other.goto(BASE + "?dev")
    other.fill('input[name=code]', code); other.click('#join button'); expect(other.locator('#round1-pinned')).to_contain_text(REASON); shot(other, "tue-05-second-device")
    # typed text survives a re-render caused by a teammate's action
    page.fill('#memo-authorize', 'Up to $50 million under 4.1.')
    other.click('[data-ask=company]'); expect(other.locator('body')).to_contain_text('20 clubs')
    expect(page.locator('body')).to_contain_text('A teammate just acted', timeout=15000); expect(page.locator('#memo-authorize')).to_have_value('Up to $50 million under 4.1.')
    page.select_option('#memo-call', 'condition'); page.select_option('#memo-consent', 'clubs')
    page.fill('#memo-condition', '$10 million now; $30 million when 20 clubs sign data agreements within 12 months.')
    page.fill('#memo-evidence', 'Staff memo: each club holds its buyer data. Charter 4.3 and 4.4.')
    page.click('#memo button'); expect(page.locator('h1')).to_contain_text('What the Committee did'); expect(page.locator('body')).to_contain_text(REASON)
    expect(page.locator('.msg.chair')).to_contain_text('4.4'); expect(page.locator('.later')).to_contain_text('did not move'); shot(page, "tue-06-debrief")
    page.reload(); expect(page.locator('.later')).to_contain_text('did not move')
    room = b.new_context(viewport={"width": 1440, "height": 900}).new_page(); room.on("pageerror", lambda e: errors.append(str(e)))
    room.goto(BASE + "instructor.html?dev"); room.fill('input[name=key]', 'dev'); room.fill('input[name=classCode]', 'CHECK'); room.click('#gate button')
    expect(room.locator('.cards')).to_contain_text('Browser Check'); expect(room.locator('.cards')).to_contain_text('Named the party that holds the right'); shot(room, "tue-07-room")
    room.goto(BASE + "instructor.html?local=1"); expect(room.locator('.cards')).to_contain_text('Pod D (sample)')
    for i in (0, 1): room.locator('[data-pick]').nth(i).check()
    room.click('[data-compare]'); expect(room.locator('.project')).to_contain_text('Question for the room'); shot(room, "tue-08-projector")
    off = phone.new_page(); off.on("pageerror", lambda e: errors.append(str(e))); off.goto(BASE + "?local=1")
    off.fill('input[name=team]', 'Offline'); off.click('#start button'); off.select_option('#r1-sector', 'perf'); off.fill('#r1-reason', 'Live data.'); off.click('#round1 button')
    expect(off.locator('body')).to_contain_text('PulseLine'); off.click('[data-ask=holder]'); expect(off.locator('body')).to_contain_text('bargain with us')
    off.select_option('#memo-call', 'approve'); off.select_option('#memo-consent', 'none'); off.fill('#memo-evidence', 'Staff memo.'); off.click('#memo button')
    expect(off.locator('.later')).to_contain_text('could not sell'); shot(off, "tue-09-offline-debrief")
    assert not errors, errors
    print("investment committee browser check: ok")
    b.close()
