"""Browser check for MGT 340 Negotiate a Workable Change (optional; needs Python Playwright and Chrome).
Start the dev server first:  PORT=8799 node simkit/dev-server.mjs
Then:  python3 simkit/checks/workable_change_browser_check.py http://localhost:8799 [screenshot_dir]
Plays a management pod on a phone-sized screen (refused on Term 1 as written, comes back with a
trial, reports), a player pod offline taking a different term, and the instructor room."""
import sys
from playwright.sync_api import sync_playwright, expect
ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787"
BASE = ORIGIN.rstrip("/") + "/mgt340/workable-change/"
shots = sys.argv[2] if len(sys.argv) > 2 else None
def shot(page, name):
    if shots: page.screenshot(path=f"{shots}/{name}.png", full_page=True)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    phone = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = phone.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e))); page.on("dialog", lambda d: d.accept())
    page.goto(BASE + "?dev"); page.fill('input[name=team]', 'Browser Check'); page.fill('input[name=classCode]', 'CHECK'); page.click('#start button')
    expect(page.locator('#side')).to_contain_text('Which side'); page.click('button[value=management]')
    expect(page.locator('.pinned')).to_contain_text('Simone Baptiste'); assert page.locator('[data-open=brief_players]').count() == 0
    page.click('[data-open=proposal]'); shot(page, "thu-01-desk")
    page.select_option('#p-term', 't1'); page.select_option('#p-move', 'accept'); page.fill('#p-wording', 'Every player wears the sensor in all games.'); page.click('#propose button')
    expect(page.locator('#exchange')).to_contain_text('give up both'); expect(page.locator('#exchange .stance')).to_have_text('Refuses')
    page.reload(); expect(page.locator('#exchange')).to_contain_text('give up both')
    page.click('[data-open=current]'); expect(page.locator('body')).to_contain_text('Wearables may not be used in games')
    page.select_option('#p-term', 't1'); page.select_option('#p-move', 'revise'); page.select_option('#p-lever', 'pilot')
    page.fill('#p-wording', 'A voluntary preseason trial; players may opt out at any time; joint committee review.'); page.click('#propose button')
    expect(page.locator('#exchange .stance').nth(1)).to_have_text('Counters'); shot(page, "thu-02-exchange")
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), 'page scrolls sideways on a phone'
    assert page.evaluate("[...document.querySelectorAll('button,select,summary')].every(e => e.getBoundingClientRect().height >= 44)"), 'small tap target'
    page.select_option('#memo-term', 't1'); page.select_option('#memo-consent', 'union_player'); page.fill('#memo-wording', 'Voluntary preseason trial.')
    page.fill('#memo-evidence', 'Current agreement, points 1 and 2.'); page.fill('#memo-changed', 'Dropped mandatory wear.'); page.click('#memo button')
    expect(page.locator('h1')).to_contain_text('What your side did'); expect(page.locator('.later')).to_contain_text('no longer the one'); shot(page, "thu-03-debrief")
    off = phone.new_page(); off.on("pageerror", lambda e: errors.append(str(e))); off.goto(BASE + "?local=1")
    off.fill('input[name=team]', 'Offline'); off.click('#start button'); off.click('button[value=players]')
    off.select_option('#p-term', 't3'); off.select_option('#p-move', 'revise'); off.select_option('#p-lever', 'limit'); off.fill('#p-wording', 'Health and tactics only.'); off.click('#propose button')
    expect(off.locator('#exchange .stance')).to_have_text('Agrees'); expect(off.locator('#exchange')).to_contain_text('mirrors the current rule')
    room = b.new_context(viewport={"width": 1440, "height": 900}).new_page(); room.on("pageerror", lambda e: errors.append(str(e)))
    room.goto(BASE + "instructor.html?dev"); room.fill('input[name=key]', 'dev'); room.fill('input[name=classCode]', 'CHECK'); room.click('#gate button')
    expect(room.locator('.cards')).to_contain_text('Browser Check'); expect(room.locator('.cards')).to_contain_text('Changed a proposal after the answer')
    room.goto(BASE + "instructor.html?local=1"); expect(room.locator('.cards')).to_contain_text('Pod P2 (sample)')
    room.locator('[data-pick]').nth(0).check(); room.locator('[data-pick]').nth(2).check()
    room.click('[data-compare]'); expect(room.locator('.project')).to_contain_text('Question for the room'); shot(room, "thu-04-projector")
    assert not errors, errors
    print("workable change browser check: ok")
    b.close()
