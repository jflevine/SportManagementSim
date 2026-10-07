"""TAP v2 browser contract QA. Synthetic fixtures only; no live API writes.

Run on a host with HTTP sockets and Playwright engines. Unavailable runtime stages
are BLOCKED and return a nonzero exit code. Results record exact source hashes.
"""
from __future__ import annotations
import copy
import base64
import csv
import io
import datetime
import functools
import hashlib
import http.server
import json
import os
import pathlib
import re
import sys
import threading
import time
import traceback
import uuid

from playwright.sync_api import sync_playwright, expect

SOURCE = pathlib.Path(__file__).resolve().parents[1]
REPO = pathlib.Path(__file__).resolve().parents[3]
OUTPUT = pathlib.Path(os.environ.get('TAP_QA_OUTPUT', '/tmp/tap-v2-qa'))
OUTPUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('TAP_BASE_URL', '').rstrip('/') + '/' if os.environ.get('TAP_BASE_URL') else None
ENDPOINT = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2'
ENGINE = 'chromium'
RESULTS, REQUESTS, ERRORS = [], [], []
SECRET = 'SYNTHETIC_PRIVATE_RESPONSE_314159'
FAKE_KEY = 'SYNTHETIC_FIXTURE_KEY_NOT_A_REAL_CREDENTIAL'
UUID_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.I)
TOKEN_RE = re.compile(r'^[A-Za-z0-9_-]{43}$')


def persist():
    hashes = {str(p.relative_to(SOURCE)): hashlib.sha256(p.read_bytes()).hexdigest()
              for p in SOURCE.rglob('*') if p.is_file() and not any(part.startswith('tests') for part in p.parts)}
    data = {'timestampUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'scope': 'Synthetic mocked browser API. Real credentials, production persistence and real instructor authentication are not exercised.',
            'results': RESULTS, 'requests': REQUESTS, 'consoleErrors': ERRORS, 'sourceSHA256': hashes}
    (OUTPUT / 'browser-qa-results.json').write_text(json.dumps(data, indent=2))


def record(name, fn):
    before = len(ERRORS)
    try:
        detail = fn()
        if len(ERRORS) > before:
            raise AssertionError('Unexpected uncaught page errors: ' + repr(ERRORS[before:]))
        RESULTS.append({'name': name, 'engine': ENGINE, 'status': 'PASS', 'detail': detail})
        print('PASS', name, flush=True)
    except Exception as exc:
        RESULTS.append({'name': name, 'engine': ENGINE, 'status': 'FAIL', 'detail': str(exc), 'traceback': traceback.format_exc()})
        print('FAIL', name, str(exc), flush=True)
    persist()


def wait_until(page, predicate, timeout=8000, message='Expected condition did not occur'):
    deadline = time.monotonic() + timeout / 1000
    while time.monotonic() < deadline:
        if predicate():
            return
        page.wait_for_timeout(50)
    raise AssertionError(message)


def actions(fixture, action):
    return [c for c in fixture.calls if (c.get('body') or {}).get('action') == action]


def shot(page, name):
    page.screenshot(path=str(OUTPUT / f'{ENGINE}-{name}.png'), full_page=True)
    if ENGINE == 'chromium' and name in {'landing-1440', 'landing-390', 'revision-1440', 'guest-1440'}:
        if name == 'revision-1440':
            page.locator('#revision-stage').evaluate("element => element.scrollIntoView({block: 'start'})")
        pixels = page.screenshot(path=str(OUTPUT / f'{ENGINE}-{name}-viewport.jpg'), type='jpeg', quality=60, full_page=False)
        print(f'TAP_VISUAL:{name}:' + base64.b64encode(pixels).decode('ascii'), flush=True)


def no_overflow(page):
    info = page.evaluate('''() => ({width: innerWidth, scroll: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')].filter(e => { const r=e.getBoundingClientRect();
        return r.width>0 && (r.right>innerWidth+1 || r.left< -1) }).map(e=>e.id||e.tagName).slice(0,15)})''')
    assert info['scroll'] <= info['width'] + 1, info
    return info


def labelled(page):
    missing = page.locator('input:not([type="hidden"]),textarea,select').evaluate_all('''els => els.filter(e =>
      !e.labels?.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(e=>e.id||e.name)''')
    assert missing == [], missing


class Fixture:
    """Strict in-memory v2 protocol fixture. Header token is never logged."""
    def __init__(self):
        self.calls = []
        self.records = {}
        self.tokens = {}
        self.requests = {}
        self.fail = False
        self.unauthorized = False
        self.drop_once = None
        self.hold_once = None
        self.held = None
        self.private_record = None
        self.guest_payload = None
        self.inject_legacy_grade = False

    def answer(self, route, status, body):
        headers = {'access-control-allow-origin': '*', 'cache-control': 'no-store'}
        route.fulfill(status=status, json=body, headers=headers)

    def error(self, route, code, status=400):
        return self.answer(route, status, {'ok': False, 'error': {'code': code, 'message': 'Synthetic fixture ' + code}})

    def guest(self):
        return self.guest_payload or {'ok': True, 'mode': 'live', 'liveEnabled': True,
          'aggregate': {'started': 2, 'initialPlans': 2, 'completedRevisions': 1,
                        'initialChoices': {'cup': 1, 'open': 1, 'showcase': 0}, 'finalChoices': {'cup': 1, 'open': 0, 'showcase': 0}}, 'proposals': []}

    def release(self, drop=False):
        assert self.held, 'No held response exists'
        route, status, body = self.held
        self.held = None
        if drop:
            route.abort('failed')
        else:
            self.answer(route, status, body)

    def route(self, route):
        req = route.request
        if req.method == 'OPTIONS':
            return route.fulfill(status=204, headers={'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,POST,OPTIONS',
              'access-control-allow-headers': 'content-type,x-instructor-key,x-attempt-token'})
        data = req.post_data_json if req.method == 'POST' else None
        entry = {'method': req.method, 'url': req.url, 'body': copy.deepcopy(data), 'mock': True}
        self.calls.append(entry)
        REQUESTS.append(entry)
        if self.fail:
            return route.abort('failed')
        if req.method == 'GET':
            if 'view=guest' in req.url:
                return self.answer(route, 200, self.guest())
            return self.answer(route, 200, {'ok': True, 'version': '2.0.1', 'mode': 'live', 'liveEnabled': True,
                'studentStorage': 'private-server', 'identityVerification': 'self-reported', 'grading': 'instructor-only', 'maxScore': 10, 'rubricMax': [2,3,3,2]})
        action = data.get('action')
        if action.startswith('instructor'):
            return self.instructor(route, data)
        status, body = self.student(data, req.headers.get('x-attempt-token', ''))
        if self.drop_once == action:
            self.drop_once = None
            return route.abort('failed')
        if self.hold_once == action:
            self.hold_once = None
            self.held = (route, status, body)
            return
        return self.answer(route, status, body)

    def last_record(self):
        assert self.records, 'No fixture attempt has been started'
        return list(self.records.values())[-1]

    def project(self, state, student=False):
        v = copy.deepcopy(state)
        v['finalGrade'] = v['review']['total'] if v.get('review') else None
        v['guest'] = {'consent': v['answers']['guestConsent'], 'published': v.get('guestPublished', False),
                      'template': 'decision', 'summary': 'Synthetic safe structured decision template'}
        v.pop('guestPublished', None)
        if student:
            v['reviewStatus'] = 'reviewed' if v.get('review') else 'pending'
            if not self.inject_legacy_grade:
                v.pop('review', None)
                v.pop('finalGrade', None)
        return {'ok': True, 'mode': v['mode'], 'submission': v}

    def student(self, data, token):
        def error(code, status=400):
            return status, {'ok': False, 'error': {'code': code, 'message': 'Synthetic fixture ' + code}}
        action, mode, aid = data.get('action'), data.get('mode'), data.get('attemptId')
        if mode not in ['live', 'test'] or not UUID_RE.fullmatch(aid or ''):
            return error('INVALID_INPUT')
        if not TOKEN_RE.fullmatch(token):
            return error('UNAUTHORIZED', 401)
        state = self.records.get(aid)
        if state and (self.tokens.get(aid) != token or state['mode'] != mode):
            return error('UNAUTHORIZED', 401)
        if action == 'resume':
            if set(data) != {'action', 'mode', 'attemptId'}:
                return error('INVALID_INPUT')
            if not state:
                return error('UNAUTHORIZED', 401)
            return 200, self.project(state, student=True)
        allowed = {'start': {'identity'}, 'save': {'answers'}, 'lockPlan': set(), 'submit': set()}
        if action not in allowed or set(data) != {'action', 'mode', 'attemptId', 'requestId', 'expectedVersion'} | allowed[action]:
            return error('INVALID_INPUT')
        rid = data['requestId']
        if not UUID_RE.fullmatch(rid or '') or type(data['expectedVersion']) is not int:
            return error('INVALID_INPUT')
        reqkey = (mode, aid, rid)
        signature = json.dumps(data, sort_keys=True)
        if reqkey in self.requests:
            previous, response = self.requests[reqkey]
            return (200, copy.deepcopy(response)) if previous == signature else error('REQUEST_CONFLICT', 409)
        if data['expectedVersion'] != (state['version'] if state else 0):
            return error('VERSION_CONFLICT', 409)
        state = copy.deepcopy(state)
        now = '2026-10-07T12:00:00Z'
        if action == 'start':
            if state:
                return error('STATE_CONFLICT', 409)
            ident = data['identity']
            if mode == 'test' and ident != {'firstName': 'Synthetic', 'lastName': 'Fixture', 'email': 'tap-v2@example.invalid', 'individualWork': True}:
                return error('INVALID_INPUT')
            if mode == 'live' and not re.fullmatch(r'[^@\s]+@lasalle\.edu', ident.get('email', '')):
                return error('INVALID_INPUT')
            state = {'attemptId': aid, 'mode': mode, 'classRun': 'tap-events-2026-10', 'synthetic': mode == 'test',
                **ident, 'identityVerified': False,
                'answers': {'initialChoice': '', 'initialPosition': '', 'finalChoice': '', 'adjustment': '',
                            'priority': '', 'finalReason': '', 'runnerUp': '', 'tradeoff': '', 'guestConsent': False},
                'initialPlan': None, 'status': 'draft', 'version': 0, 'receipt': None, 'createdAt': now,
                'submittedAt': None, 'review': None, 'guestPublished': False}
            self.tokens[aid] = token
        elif not state:
            return error('UNAUTHORIZED', 401)
        elif action == 'save':
            answer = data['answers']
            if set(answer) != set(state['answers']):
                return error('INVALID_INPUT')
            if state['status'] == 'submitted':
                return error('STATE_CONFLICT', 409)
            if state['initialPlan'] and any(answer[k] != state['initialPlan'][k] for k in ['initialChoice', 'initialPosition']):
                return error('STATE_CONFLICT', 409)
            if not state['initialPlan'] and any(answer[k] for k in ['finalChoice', 'adjustment', 'priority', 'finalReason', 'runnerUp', 'tradeoff']):
                return error('STATE_CONFLICT', 409)
            state['answers'] = copy.deepcopy(answer)
        elif action == 'lockPlan':
            answer = state['answers']
            if state['status'] != 'draft':
                return error('STATE_CONFLICT', 409)
            if answer['initialChoice'] not in ['cup', 'open', 'showcase'] or len(answer['initialPosition'].strip()) < 40:
                return error('INVALID_INPUT')
            state['initialPlan'] = {k: answer[k] for k in ['initialChoice', 'initialPosition']}
            state['initialPlan']['lockedAt'] = now
            state['status'] = 'plan_locked'
        elif action == 'submit':
            answer = state['answers']
            if state['status'] != 'plan_locked':
                return error('STATE_CONFLICT', 409)
            if (answer['finalChoice'] not in ['cup', 'open', 'showcase'] or answer['runnerUp'] not in ['cup', 'open', 'showcase']
                or answer['runnerUp'] == answer['finalChoice'] or answer['adjustment'] not in ['orientation', 'extra_host', 'rotations']
                or answer['priority'] not in ['newcomers', 'club', 'operator']
                or min(len(answer[k].strip()) for k in ['finalReason', 'tradeoff']) < 40):
                return error('INVALID_INPUT')
            if {'cup': 280, 'open': 180, 'showcase': 240}[answer['finalChoice']] + (75 if answer['adjustment'] == 'extra_host' else 0) > 300:
                return error('BUDGET_EXCEEDED')
            state['status'] = 'submitted'
            state['receipt'] = 'TAP2-TEST-' + aid
            state['submittedAt'] = now
        state['version'] += 1
        self.records[aid] = state
        response = self.project(state, student=True)
        self.requests[reqkey] = (signature, copy.deepcopy(response))
        return 200, response

    def seed_private(self):
        aid = str(uuid.uuid4())
        self.records[aid] = {'attemptId': aid, 'mode': 'test', 'classRun': 'tap-events-2026-10', 'synthetic': True,
            'firstName': 'Synthetic', 'lastName': 'Fixture', 'email': 'tap-v2@example.invalid', 'identityVerified': False,
            'answers': {'initialChoice': 'cup', 'initialPosition': SECRET + ' Initially 12 stations supports a Cup inside the cap.',
              'finalChoice': 'open', 'adjustment': 'extra_host', 'priority': 'newcomers', 'finalReason': SECRET + ' Support the sixteen novices with a third host.',
              'runnerUp': 'showcase', 'tradeoff': SECRET + ' Club players lose uninterrupted play but retain a short finish.', 'guestConsent': True},
            'initialPlan': {'initialChoice': 'cup', 'initialPosition': SECRET + ' Initially 12 stations supports a Cup inside the cap.', 'lockedAt': '2026-10-07T12:00:00Z'},
            'status': 'submitted', 'version': 4, 'receipt': 'TAP2-TEST-' + aid, 'createdAt': '2026-10-07T12:00:00Z',
            'submittedAt': '2026-10-07T12:01:00Z', 'review': None, 'guestPublished': False}
        self.private_record = aid
        return aid

    def instructor(self, route, data):
        if self.unauthorized or route.request.headers.get('x-instructor-key') != FAKE_KEY:
            return self.error(route, 'UNAUTHORIZED', 401)
        if not self.private_record:
            if self.records:
                self.private_record = next(iter(self.records))
            else:
                self.seed_private()
        action = data['action']
        if action == 'instructorList':
            records = [self.project(v)['submission'] for v in self.records.values() if v['mode'] == data.get('mode', 'live')]
            return self.answer(route, 200, {'ok': True, 'mode': data.get('mode', 'live'), 'classRun': 'tap-events-2026-10', 'submissions': records, 'maxScore': 10})
        state = self.records.get(data.get('attemptId'))
        if not state:
            return self.error(route, 'NOT_FOUND', 404)
        if action == 'instructorDetail':
            return self.answer(route, 200, self.project(state))
        rid = data.get('requestId', '')
        reqkey = (state['mode'], state['attemptId'], rid)
        signature = json.dumps(data, sort_keys=True)
        if reqkey in self.requests:
            previous, body = self.requests[reqkey]
            if previous != signature: return self.error(route, 'REQUEST_CONFLICT', 409)
            return self.answer(route, 200, body)
        if not UUID_RE.fullmatch(rid) or data.get('expectedVersion') != state['version']:
            return self.error(route, 'VERSION_CONFLICT', 409)
        if action == 'instructorReview':
            scores = data.get('scores')
            if not isinstance(scores, list) or len(scores) != 4 or any(type(v) is not int or not 0 <= v <= cap for v, cap in zip(scores, [2, 3, 3, 2])):
                return self.error(route, 'INVALID_INPUT')
            state['review'] = {'scores': scores, 'total': sum(scores), 'notes': data.get('notes', ''), 'reviewedAt': '2026-10-07T12:02:00Z'}
        elif action == 'instructorPublish':
            if set(data) != {'action', 'mode', 'attemptId', 'requestId', 'expectedVersion', 'published', 'template'} or data['template'] != 'decision':
                return self.error(route, 'INVALID_INPUT')
            if data['published'] and not state['answers']['guestConsent']:
                return self.error(route, 'STATE_CONFLICT', 409)
            state['guestPublished'] = data['published']
        else:
            return self.error(route, 'INVALID_INPUT')
        state['version'] += 1
        body = self.project(state)
        self.requests[reqkey] = (signature, copy.deepcopy(body))
        if self.drop_once == action:
            self.drop_once = None
            return route.abort('failed')
        return self.answer(route, 200, body)


def page_for(browser, fixture=None, width=1440, mode='test', init=None):
    ctx = browser.new_context(viewport={'width': width, 'height': 1000}, accept_downloads=True)
    ctx.set_default_timeout(8000)
    fix = fixture or Fixture()
    def unexpected(route):
        entry = {'url': route.request.url, 'method': route.request.method, 'unexpectedNetwork': True}
        fix.calls.append(entry); REQUESTS.append(entry)
        route.abort('blockedbyclient')
    # Register broad guard first: Playwright tries the last matching route first.
    ctx.route('https://*.supabase.co/**', unexpected)
    ctx.route(ENDPOINT + '**', fix.route)
    if init:
        ctx.add_init_script(init)
    p = ctx.new_page()
    p.on('pageerror', lambda error: ERRORS.append(str(error)))
    p.on('dialog', lambda dialog: dialog.accept())
    p.goto(BASE + (('?mode=' + mode) if mode else ''))
    return ctx, p, fix


def identity(page, email='tap-v2@example.invalid'):
    if page.locator('#identity-fields').is_visible() and page.locator('#firstName').is_editable():
        page.locator('#firstName').fill('Synthetic')
        page.locator('#lastName').fill('Fixture')
        page.locator('#email').fill(email)
    page.locator('#individualWork').check()


def start(page, email='tap-v2@example.invalid'):
    identity(page, email)
    page.locator('#start-lab').click()
    expect(page.locator('#workspace')).to_be_visible()


def resume_if_needed(page):
    page.wait_for_timeout(150)
    if page.locator('#resume-attempt').is_visible():
        page.locator('#resume-attempt').click()


def reload_resume(page):
    page.reload()
    resume_if_needed(page)


def initial(page, choice='cup'):
    page.locator(f'input[name="initialChoice"][value="{choice}"]').check()
    page.locator('#initial-position').fill(SECRET + ' The initial Cup fits 12 stations and a competitive event within $300; the visitor experience mix is still unknown.')


def lock(page):
    page.locator('#lock-initial').click()
    expect(page.locator('#revision-stage')).to_be_visible()
    expect(page.locator('#initial-position')).to_be_disabled()


def final_fields(page, choice='open', adjustment='extra_host'):
    page.locator(f'input[name="finalChoice"][value="{choice}"]').check()
    page.locator(f'input[name="adjustment"][value="{adjustment}"]').check()
    page.locator('input[name="priority"][value="newcomers"]').check()
    page.locator('#runner-up').select_option('showcase' if choice != 'showcase' else 'cup')
    page.locator('#final-reason').fill(SECRET + ' Sixteen novices need supported turns. My adjustment makes joining easier while reserving a credible competitive finish for the club.')
    page.locator('#tradeoff').fill(SECRET + ' Experienced club members risk less uninterrupted competition. I would explain the rotations in advance; Showcase is the runner-up but its eight stations create a greater waiting risk.')


def submit(page):
    page.locator('#submit-final').click()
    expect(page.locator('#receipt')).to_be_visible()


def student_flow(browser):
    ctx, p, fix = page_for(browser)
    expect(p.locator('#landing')).to_be_visible()
    assert p.locator('textarea').count() == 3
    expect(p.locator('#revision-stage')).to_be_hidden()
    start(p)
    expect(p.locator('#workspace-title')).to_be_focused()
    expect(p.locator('#guest-consent')).not_to_be_checked()
    initial(p)
    expect(p.locator('#revision-stage')).to_be_hidden()
    lock(p)
    expect(p.locator('#registration-heading')).to_be_focused()
    first = copy.deepcopy(fix.last_record()['initialPlan'])
    expect(p.locator('#original-plan')).to_contain_text(SECRET)
    expect(p.locator('#revision-stage')).to_contain_text('16')
    expect(p.locator('#revision-stage')).to_contain_text(re.compile('Eight|8'))
    reload_resume(p)
    expect(p.locator('#revision-stage')).to_be_visible()
    expect(p.locator('#initial-position')).to_be_disabled()
    assert fix.last_record()['initialPlan'] == first
    final_fields(p)
    submit(p)
    expect(p.locator('#receipt-score')).to_contain_text(re.compile('pending|manual|review', re.I))
    assert not re.search(r'\b0\s*/\s*10', p.locator('#receipt-score').inner_text())
    receipt = p.locator('#receipt-id').inner_text()
    assert receipt.strip()
    assert fix.last_record()['answers']['guestConsent'] is False
    assert fix.last_record()['initialPlan'] == first
    reload_resume(p)
    expect(p.locator('#receipt-id')).to_have_text(receipt)
    p.goto(BASE + 'guest/')
    p.go_back()
    resume_if_needed(p)
    expect(p.locator('#receipt-id')).to_have_text(receipt)
    p.go_forward()
    p.go_back()
    resume_if_needed(p)
    expect(p.locator('#receipt-id')).to_have_text(receipt)
    before = len(actions(fix, 'submit'))
    p.evaluate("document.querySelector('#submit-final').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
    p.wait_for_timeout(300)
    assert len(actions(fix, 'submit')) == before
    with p.expect_download() as download:
        p.locator('#download-receipt').click()
    dest = OUTPUT / f'{ENGINE}-synthetic-receipt.txt'
    download.value.save_as(dest)
    content = dest.read_text()
    assert SECRET in content
    assert all(token not in content for token in fix.tokens.values()), 'Private recovery capability leaked into receipt export'
    shot(p, 'receipt-desktop')
    ctx.close()
    return 'Three responses; locked initial snapshot; update after lock; opt-out; pending manual grade; durable stable receipt; reload and history.'


def identity_validation(browser):
    ctx, p, fix = page_for(browser, mode=None)
    p.locator('#start-lab').click()
    assert not actions(fix, 'start')
    for email in ['invalid', 'student@gmail.com', 'student@lasalle.edu.evil.invalid', 'student@lasalle.edu.invalid', 'student@example.invalid']:
        identity(p, email)
        p.locator('#start-lab').click()
        p.wait_for_timeout(50)
        assert not actions(fix, 'start'), email
        expect(p.locator('#workspace')).to_be_hidden()
    identity(p, 'synthetic-browser@lasalle.edu')
    p.locator('#individualWork').uncheck()
    p.locator('#start-lab').click()
    assert not actions(fix, 'start')
    ctx.close()
    ctx, p, fix = page_for(browser)
    identity(p)
    p.locator('#start-lab').click()
    expect(p.locator('#workspace')).to_be_visible()
    assert actions(fix, 'start')[0]['body']['mode'] == 'test'
    assert actions(fix, 'start')[0]['body']['identity'] == {'firstName': 'Synthetic', 'lastName': 'Fixture', 'email': 'tap-v2@example.invalid', 'individualWork': True}
    ctx.close()
    return 'Blank identity, malformed/foreign/suffix-spoofed email and unchecked individual-work confirmation rejected before any start request.'


def feasible_choices(browser):
    detail = []
    for choice, adjustment, amount, accepted in [('cup', 'extra_host', 355, False), ('showcase', 'extra_host', 315, False),
            ('open', 'extra_host', 255, True), ('cup', 'orientation', 280, True), ('showcase', 'rotations', 240, True)]:
        ctx, p, fix = page_for(browser)
        start(p); initial(p, choice); lock(p); final_fields(p, choice, adjustment)
        expect(p.locator('#fit-cost')).to_contain_text(str(amount))
        p.locator('#submit-final').click()
        if accepted:
            expect(p.locator('#receipt')).to_be_visible()
            assert actions(fix, 'submit')
        else:
            expect(p.locator('#receipt')).to_be_hidden()
            assert not actions(fix, 'submit')
            expect(p.locator('#form-feedback')).to_contain_text(re.compile('budget|300|cost', re.I))
        detail.append({'choice': choice, 'adjustment': adjustment, 'amount': amount, 'accepted': accepted})
        ctx.close()
    return detail


def unknown_start(browser):
    for reload in [False, True]:
        fix = Fixture(); fix.drop_once = 'start'
        ctx, p, _ = page_for(browser, fix)
        identity(p); p.locator('#start-lab').click()
        wait_until(p, lambda: len(actions(fix, 'start')) == 1)
        expect(p.locator('#revision-stage')).to_be_hidden()
        expect(p.locator('#receipt')).to_be_hidden()
        original = copy.deepcopy(actions(fix, 'start')[0]['body'])
        if reload:
            p.reload()
        else:
            # A changed form must not mutate an uncertain already-sent start request.
            if p.locator('#identity-fields').is_visible() and p.locator('#firstName').is_editable():
                p.locator('#firstName').fill('ChangedAfterUnknownResult')
        retry = p.locator('#retry-save')
        if retry.is_visible():
            retry.click()
        elif p.locator('#resume-attempt').is_visible():
            p.locator('#resume-attempt').click()
        else:
            p.locator('#start-lab').click()
        expect(p.locator('#workspace')).to_be_visible()
        replay = actions(fix, 'start')
        if len(replay) > 1:
            assert replay[1]['body'] == original
        else:
            assert actions(fix, 'resume'), 'Unknown start must replay its exact request or securely resume the same attempt'
        assert len(fix.records) == 1
        ctx.close()
    return 'Dropped start acknowledgement recovers one attempt, including after reload; edited identity cannot mutate an uncertain start payload.'


def autosave_queue(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p)
    wait_until(p, lambda: actions(fix, 'save'))
    wait_until(p, lambda: not p.locator('#retry-save').is_visible())
    fix.hold_once = 'save'
    p.locator('#initial-position').fill(SECRET + ' FIRST IN-FLIGHT SAVE')
    wait_until(p, lambda: fix.held is not None)
    pending = copy.deepcopy(actions(fix, 'save')[-1]['body'])
    p.locator('#initial-position').fill(SECRET + ' NEWER EDIT WHILE PENDING')
    fix.release(drop=True)
    wait_until(p, lambda: p.locator('#retry-save').is_visible() or fix.last_record()['answers'].get('initialPosition', '').endswith('NEWER EDIT WHILE PENDING'))
    if p.locator('#retry-save').is_visible():
        p.locator('#retry-save').click()
    wait_until(p, lambda: len([c for c in actions(fix, 'save') if c['body'] == pending]) >= 2)
    wait_until(p, lambda: fix.last_record()['answers'].get('initialPosition', '').endswith('NEWER EDIT WHILE PENDING'),
               message='Newer edit was not flushed after exact lost-ack replay')
    reload_resume(p)
    expect(p.locator('#initial-position')).to_have_value(SECRET + ' NEWER EDIT WHILE PENDING')
    ctx.close()
    return 'Lost save acknowledgement replays identical payload/request ID and then sends the newer queued edit; reload keeps newest writing.'


def offline_recovery(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p)
    wait_until(p, lambda: actions(fix, 'save'))
    fix.fail = True
    p.locator('#initial-position').fill(SECRET + ' OFFLINE WRITING')
    expect(p.locator('#retry-save')).to_be_visible()
    with p.expect_download() as download:
        p.locator('#download-draft').click()
    dest = OUTPUT / f'{ENGINE}-synthetic-offline-draft.txt'
    download.value.save_as(dest)
    assert 'OFFLINE WRITING' in dest.read_text()
    fix.fail = False
    p.locator('#retry-save').click()
    wait_until(p, lambda: fix.last_record()['answers'].get('initialPosition', '').endswith('OFFLINE WRITING'))
    reload_resume(p)
    expect(p.locator('#initial-position')).to_have_value(SECRET + ' OFFLINE WRITING')
    ctx.close()
    return 'Connection failure preserves and exports writing; retry confirms private save and survives reload.'


def lost_final_receipt(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p); lock(p); final_fields(p)
    fix.drop_once = 'submit'
    p.locator('#submit-final').click()
    expect(p.locator('#receipt')).to_be_hidden()
    expect(p.locator('#retry-save')).to_be_visible()
    original = copy.deepcopy(actions(fix, 'submit')[-1]['body'])
    p.locator('#retry-save').click()
    expect(p.locator('#receipt')).to_be_visible()
    assert actions(fix, 'submit')[-1]['body'] == original
    receipt = p.locator('#receipt-id').inner_text()
    reload_resume(p)
    expect(p.locator('#receipt-id')).to_have_text(receipt)
    assert len(fix.records) == 1
    ctx.close()
    return 'Receipt appears only after acknowledgement; dropped final response retries one exact request and one durable receipt.'


def student_grade_privacy(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p); lock(p); final_fields(p); submit(p)
    fix.last_record()['review'] = {'scores': [0, 0, 0, 0], 'total': 0, 'notes': 'SYNTHETIC PRIVATE INSTRUCTOR NOTE', 'reviewedAt': '2026-10-07T12:00:00Z'}
    public = fix.project(fix.last_record(), student=True)['submission']
    assert public['reviewStatus'] == 'reviewed'
    for key in ['review', 'finalGrade', 'scores', 'notes']:
        assert key not in public
    for legacy_response in [False, True]:
        # The second pass also models an old unsanitized response: the view must ignore it.
        fix.inject_legacy_grade = legacy_response
        reload_resume(p)
        expect(p.locator('#receipt-score')).to_contain_text(re.compile('review|instructor|recorded', re.I))
        assert not re.search(r'\b\d+\s*/\s*10', p.locator('#receipt-score').inner_text())
        assert 'SYNTHETIC PRIVATE INSTRUCTOR NOTE' not in p.locator('body').inner_text()
        with p.expect_download() as download:
            p.locator('#download-receipt').click()
        dest = OUTPUT / f'{ENGINE}-student-grade-private-{legacy_response}.txt'
        download.value.save_as(dest)
        text = dest.read_text()
        assert 'SYNTHETIC PRIVATE INSTRUCTOR NOTE' not in text
        assert 'Instructor score:' not in text
        assert not re.search(r'\b\d+\s*/\s*10', text)
    ctx.close()
    return 'Student resume/export exposes only review status; actual 0/10 and private notes remain instructor-only, including ignored legacy grade fields.'


def storage_failure(browser):
    script = "window.blockStorage=true; const original=Storage.prototype.setItem; Storage.prototype.setItem=function(...a){if(window.blockStorage)throw new DOMException('Synthetic storage full','QuotaExceededError'); return original.apply(this,a)}"
    ctx, p, fix = page_for(browser, init=script)
    identity(p); p.locator('#start-lab').click()
    # A durable capability must not be silently lost before a server attempt starts.
    assert not actions(fix, 'start'), 'Server start occurred without persistable recovery token'
    expect(p.locator('#save-status')).to_contain_text(re.compile('storage|device|save|recover', re.I))
    p.evaluate('window.blockStorage=false')
    if p.locator('#retry-save').is_visible():
        p.locator('#retry-save').click()
    else:
        p.locator('#start-lab').click()
    expect(p.locator('#workspace')).to_be_visible()
    initial(p)
    p.evaluate('window.blockStorage=true')
    p.locator('#initial-position').fill(SECRET + ' STORAGE FAILURE DRAFT')
    with p.expect_download() as download:
        p.locator('#download-draft').click()
    dest = OUTPUT / f'{ENGINE}-synthetic-storage-failure.txt'
    download.value.save_as(dest)
    assert 'STORAGE FAILURE DRAFT' in dest.read_text()
    p.evaluate('window.blockStorage=false')
    if p.locator('#retry-save').is_visible(): p.locator('#retry-save').click()
    ctx.close()
    return 'Blocked storage cannot silently orphan a started attempt; draft export preserves writing during later quota failure.'


def pilot_local(browser):
    ctx, p, fix = page_for(browser, mode='pilot')
    expect(p.locator('#pilot-notice')).to_be_visible()
    p.locator('#individualWork').check()
    p.locator('#start-lab').click()
    expect(p.locator('#workspace')).to_be_visible()
    initial(p); lock(p); final_fields(p); submit(p)
    assert not [c for c in fix.calls if c['method'] == 'POST'], 'Pilot must not send identity or answer writes'
    expect(p.locator('#receipt')).to_contain_text(re.compile('practice|pilot|not submitted|not.*grade', re.I))
    reload_resume(p); expect(p.locator('#receipt')).to_be_visible()
    ctx.close()
    return 'Pilot completes and reloads locally, is visibly ungraded and sends no private student API writes.'


def guest_privacy(browser):
    fix = Fixture()
    fix.guest_payload = {'ok': True, 'mode': 'live', 'liveEnabled': True,
      'aggregate': {'started': 2, 'initialPlans': 2, 'completedRevisions': 1, 'initialChoices': {'cup': 1, 'open': 1, 'showcase': 0}, 'finalChoices': {'cup': 1, 'open': 0, 'showcase': 0}},
      'proposals': [{'label': '<img src=x onerror="window.XSS=true"> Proposal A', 'initialChoice': 'cup', 'finalChoice': 'open', 'adjustment': 'extra_host', 'priority': 'newcomers', 'runnerUp': 'showcase', 'summary': SECRET,
                     'firstName': 'PRIVATE_MUST_NOT_RENDER', 'email': 'private@example.invalid', 'answers': {'initialPosition': SECRET}, 'review': {'total': 8}}],
      'firstName': 'PRIVATE_MUST_NOT_RENDER', 'email': 'private@example.invalid', 'answers': {'initialPosition': SECRET}, 'grades': [8]}
    ctx, p, _ = page_for(browser, fix)
    p.goto(BASE + 'guest/')
    expect(p.locator('#started')).to_have_text('2')
    expect(p.locator('#proposals')).not_to_be_empty()
    assert p.locator('#proposals img, #proposals script').count() == 0
    assert p.evaluate('window.XSS') is None
    text = p.locator('body').inner_text()
    for forbidden in [SECRET, 'PRIVATE_MUST_NOT_RENDER', 'private@example.invalid']:
        assert forbidden not in text
    fix.fail = True
    p.locator('#refresh').click()
    expect(p.locator('#refresh-status')).to_contain_text(re.compile('interrupt|stale|unable|retry|failed', re.I))
    expect(p.locator('#started')).to_have_text('2')
    fix.fail = False
    fix.guest_payload['aggregate']['started'] = 3
    p.locator('#refresh').click()
    expect(p.locator('#started')).to_have_text('3')
    shot(p, 'guest-desktop')
    ctx.close()
    return 'Guest renders safe projection only; injected markup cannot execute; failed refresh keeps labelled stale counts; retry recovers.'


def completion_validation(browser):
    ctx, p, fix = page_for(browser)
    start(p)
    p.locator('#lock-initial').click()
    assert not actions(fix, 'lockPlan')
    initial(p)
    p.locator('#initial-position').fill('Too short')
    p.locator('#lock-initial').click()
    assert not actions(fix, 'lockPlan')
    initial(p); lock(p)
    p.locator('#submit-final').click()
    assert not actions(fix, 'submit')
    final_fields(p)
    p.locator('#runner-up').select_option('open')
    p.locator('#submit-final').click()
    assert not actions(fix, 'submit')
    p.locator('#runner-up').select_option('cup')
    for field in ['final-reason', 'tradeoff']:
        old = p.locator('#' + field).input_value()
        p.locator('#' + field).fill('Too short')
        p.locator('#submit-final').click()
        assert not actions(fix, 'submit')
        p.locator('#' + field).fill(old)
    submit(p)
    ctx.close()
    return 'Missing choices, short initial/final text and matching runner-up cannot cross the lock or submit boundaries.'


def dom_injection(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p)
    attack = '<img src=x onerror="window.XSS=true"> ' + SECRET + ' My practical initial argument is still ordinary text.'
    p.locator('#initial-position').fill(attack)
    lock(p)
    expect(p.locator('#original-plan')).to_contain_text('<img')
    assert p.locator('#original-plan img, #original-plan script').count() == 0
    assert p.evaluate('window.XSS') is None
    final_fields(p)
    p.locator('#final-reason').fill(attack + ' Final plan with supported turns.')
    submit(p)
    assert p.locator('#receipt img, #receipt script').count() == 0
    assert p.evaluate('window.XSS') is None
    ctx.close()
    return 'Typed HTML is inert in locked snapshot and final receipt; no native DOM element or handler is injected.'


def version_conflict(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p)
    wait_until(p, lambda: bool(actions(fix, 'save')))
    p.wait_for_timeout(800)
    fix.last_record()['version'] += 1
    fix.last_record()['answers']['initialPosition'] = SECRET + ' NEWER OTHER-TAB SERVER WRITING'
    p.locator('#initial-position').fill(SECRET + ' LOCAL CONFLICTED WRITING')
    wait_until(p, lambda: any((c.get('body') or {}).get('answers', {}).get('initialPosition', '').endswith('LOCAL CONFLICTED WRITING') for c in actions(fix, 'save')))
    expect(p.locator('#save-status')).to_contain_text(re.compile('conflict|newer|another|changed', re.I))
    assert fix.last_record()['answers']['initialPosition'].endswith('NEWER OTHER-TAB SERVER WRITING')
    with p.expect_download() as download:
        p.locator('#download-draft').click()
    dest = OUTPUT / f'{ENGINE}-synthetic-conflicted-draft.txt'
    download.value.save_as(dest)
    assert 'LOCAL CONFLICTED WRITING' in dest.read_text()
    reload_resume(p)
    expect(p.locator('#use-server')).to_be_visible()
    p.locator('#use-server').click()
    expect(p.locator('#initial-position')).to_have_value(SECRET + ' NEWER OTHER-TAB SERVER WRITING')
    ctx.close()
    return 'CAS rejects stale overwrite; conflicted local writing remains exportable; explicit reload/resume adopts current server version.'


def clear_shared_device(browser):
    ctx, p, fix = page_for(browser)
    start(p); initial(p); lock(p); final_fields(p); submit(p)
    receipt = fix.last_record()['receipt']
    p.locator('#clear-device').click()
    expect(p.locator('#clear-confirmation')).to_be_visible()
    p.locator('#cancel-clear').click()
    expect(p.locator('#clear-confirmation')).to_be_hidden()
    expect(p.locator('#receipt')).to_be_visible()
    p.locator('#clear-device').click()
    p.locator('#confirm-clear-device').click()
    expect(p.locator('#receipt')).to_be_visible()
    p.locator('#confirm-clear').check()
    p.locator('#confirm-clear-device').click()
    expect(p.locator('#landing')).to_be_visible()
    p.reload()
    expect(p.locator('#receipt')).to_be_hidden()
    expect(p.locator('#resume-panel')).to_be_hidden()
    assert fix.last_record()['receipt'] == receipt
    ctx.close()
    return 'Clear-device cancellation works; confirmation is required; local identity/capability are removed without deleting the private submitted record.'


def instructor_login(page):
    page.goto(BASE + 'instructor/')
    page.locator('#instructor-key').fill(FAKE_KEY)
    page.locator('#login-button').click()
    expect(page.locator('#private-workspace')).to_be_visible()
    # The real gradebook is the default. Synthetic records need an explicit mode change.
    expect(page.locator('#record-mode')).to_have_value('live')
    page.locator('#record-mode').select_option('test')
    expect(page.locator('.review-record')).to_have_count(1)


def fill_scores(page, values):
    inputs = page.locator('.rubric-grid input')
    for i, value in enumerate(values):
        inputs.nth(i).fill(str(value))


def instructor_review(browser):
    fix = Fixture(); aid = fix.seed_private()
    ctx, p, _ = page_for(browser, fix)
    instructor_login(p)
    expect(p.locator('#instructor-key')).to_have_value('')
    assert FAKE_KEY not in p.evaluate('JSON.stringify(localStorage) + JSON.stringify(sessionStorage)')
    for values in [[3, 3, 3, 2], [-1, 3, 3, 2], [1.5, 3, 3, 2], ['', 3, 3, 2], [2, 4, 3, 2], [2, 3, 3, 3]]:
        before = len(actions(fix, 'instructorReview'))
        fill_scores(p, values)
        p.get_by_role('button', name='Save score', exact=True).click()
        assert len(actions(fix, 'instructorReview')) == before, values
        expect(p.locator('#instructor-status')).to_contain_text(re.compile('whole|integer|range', re.I))
    fill_scores(p, [0, 0, 0, 0])
    p.locator('#notes-' + aid).fill('SYNTHETIC PRIVATE FEEDBACK')
    p.get_by_role('button', name='Save score', exact=True).click()
    expect(p.locator('.review-record')).to_contain_text(re.compile(r'0\s*/\s*10'))
    assert fix.records[aid]['review']['total'] == 0
    p.locator('#show-ungraded').check()
    expect(p.locator('.review-record')).to_have_count(0)
    p.locator('#show-ungraded').uncheck()
    expect(p.locator('.review-record')).to_have_count(1)
    fill_scores(p, [2, 3, 3, 2])
    p.get_by_role('button', name='Save score', exact=True).click()
    expect(p.locator('.review-record')).to_contain_text(re.compile(r'10\s*/\s*10'))
    p.locator('#logout').click()
    expect(p.locator('#private-workspace')).to_be_hidden()
    expect(p.locator('#records')).to_be_empty()
    assert FAKE_KEY not in p.evaluate('JSON.stringify(localStorage) + JSON.stringify(sessionStorage)')
    ctx.close()
    return 'Mock-only private grading: 2/3/3/2 integer bounds, notes, actual 0/10, ungraded filtering, 10/10, cleared key input and logout.'


def instructor_replay_and_release(browser):
    fix = Fixture(); aid = fix.seed_private()
    ctx, p, _ = page_for(browser, fix)
    instructor_login(p)
    fill_scores(p, [2, 3, 2, 1])
    fix.drop_once = 'instructorReview'
    p.get_by_role('button', name='Save score', exact=True).click()
    expect(p.locator('#instructor-status')).to_contain_text(re.compile('retry|unconfirmed|not confirmed|No success', re.I))
    original = copy.deepcopy(actions(fix, 'instructorReview')[-1]['body'])
    p.get_by_role('button', name='Save score', exact=True).click()
    expect(p.locator('.review-record')).to_contain_text(re.compile(r'8\s*/\s*10'))
    assert actions(fix, 'instructorReview')[-1]['body'] == original
    count = len(actions(fix, 'instructorPublish'))
    p.get_by_role('button', name='Release anonymous summary', exact=True).click()
    assert len(actions(fix, 'instructorPublish')) == count
    p.locator('#screen-' + aid).check()
    p.get_by_role('button', name='Release anonymous summary', exact=True).click()
    wait_until(p, lambda: fix.records[aid]['guestPublished'] is True)
    payload = actions(fix, 'instructorPublish')[-1]['body']
    assert set(payload) == {'action', 'mode', 'attemptId', 'requestId', 'expectedVersion', 'published', 'template'}
    assert payload['template'] == 'decision' and payload['published'] is True
    assert SECRET not in json.dumps(payload)
    p.get_by_role('button', name=re.compile('Hide.*guest|Hide.*summary', re.I)).click()
    wait_until(p, lambda: fix.records[aid]['guestPublished'] is False)
    p.goto(BASE + 'guest/')
    p.go_back()
    expect(p.locator('#private-workspace')).to_be_hidden()
    expect(p.locator('#login-panel')).to_be_visible()
    ctx.close()
    return 'Mock-only lost grade reply replays exact request; publication requires screened safe-template release; hiding and pagehide key lock work.'


def instructor_unauthorized(browser):
    ctx, p, fix = page_for(browser)
    instructor_login(p)
    fix.unauthorized = True
    p.locator('#reload').click()
    expect(p.locator('#private-workspace')).to_be_hidden()
    expect(p.locator('#records')).to_be_empty()
    expect(p.locator('#instructor-status')).to_contain_text(re.compile('locked|key|access|authoriz', re.I))
    ctx.close()
    return 'A rejected refresh clears all private records and locks the view.'


def instructor_csv(browser):
    fix = Fixture(); aid = fix.seed_private()
    fix.records[aid]['answers']['initialPosition'] = '=SUM(1,1) ' + SECRET
    fix.records[aid]['initialPlan']['initialPosition'] = '=SUM(1,1) ' + SECRET
    fix.records[aid]['answers']['finalReason'] = '+SUM(1,1) ' + SECRET
    fix.records[aid]['answers']['tradeoff'] = ' \t@SUM(1,1) ' + SECRET
    ctx, p, _ = page_for(browser, fix)
    instructor_login(p)
    with p.expect_download() as download:
        p.locator('#export-csv').click()
    dest = OUTPUT / f'{ENGINE}-synthetic-private-export.csv'
    download.value.save_as(dest)
    text = dest.read_text(encoding='utf-8-sig')
    assert SECRET in text and FAKE_KEY not in text
    rows = list(csv.reader(io.StringIO(text)))
    assert len(rows) == 2
    dangerous = [cell for row in rows for cell in row if cell.lstrip(' \t\r\n').startswith(('=', '+', '-', '@'))]
    assert dangerous == [], 'Spreadsheet formula prefixes not neutralized: ' + repr(dangerous)
    assert any(cell.startswith("'") and SECRET in cell for cell in rows[1]), 'Export omitted rather than escaped synthetic written responses'
    ctx.close()
    return 'Authorized mock CSV includes private work while escaping formula-leading strings and excluding the instructor key.'


def responsive_labels(browser):
    report = []
    for width in [390, 1440]:
        ctx, p, fix = page_for(browser, width=width)
        labelled(p)
        p.keyboard.press('Tab')
        assert 'skip' in p.locator(':focus').inner_text().lower()
        for view in ['landing', 'draft', 'revision', 'receipt', 'guest', 'instructor']:
            if view == 'draft': start(p); initial(p)
            elif view == 'revision': lock(p); final_fields(p)
            elif view == 'receipt': submit(p)
            elif view == 'guest': p.goto(BASE + 'guest/'); expect(p.locator('#started')).to_have_text('2')
            elif view == 'instructor':
                instructor_login(p)
                if p.locator('.review-record details > summary').count(): p.locator('.review-record details > summary').first.click()
            report.append({'view': view, 'width': width, **no_overflow(p)})
            labelled(p)
            shot(p, f'{view}-{width}')
        ctx.close()
    return report


def main():
    global BASE, ENGINE
    server = None
    try:
        if not BASE:
            handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(REPO))
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            BASE = f'http://127.0.0.1:{server.server_address[1]}/spm343/tap-decision-lab/'
        suites = [('Live identity validation', identity_validation), ('Completion and runner-up validation', completion_validation), ('Complete student flow and durable receipt', student_flow),
          ('All proposals and budget caps', feasible_choices), ('Unknown-outcome start retry and reload', unknown_start),
          ('Autosave lost acknowledgement with newer queued edit', autosave_queue), ('Offline writing and save recovery', offline_recovery),
          ('Final submit lost acknowledgement', lost_final_receipt), ('Student receipt and export keep grades instructor-only', student_grade_privacy),
          ('Storage failure and export', storage_failure), ('Version conflict preserves both drafts', version_conflict),
          ('Shared-device clearing confirmation', clear_shared_device), ('Native DOM injection resistance', dom_injection), ('Browser-local ungraded pilot', pilot_local),
          ('Guest privacy, markup and stale recovery', guest_privacy),
          ('Instructor score bounds, zero and key lifetime', instructor_review), ('Instructor lost-ack retry and safe release', instructor_replay_and_release),
          ('Instructor unauthorized refresh clears private data', instructor_unauthorized), ('Private CSV formula neutralization', instructor_csv), ('390/1440 layout and accessible labels', responsive_labels)]
        if os.environ.get('TAP_SUITES'):
            selected = [value.strip().lower() for value in os.environ['TAP_SUITES'].split(',')]
            suites = [(name, fn) for name, fn in suites if any(value in name.lower() for value in selected)]
            if not suites: raise ValueError('TAP_SUITES did not match a test name')
        with sync_playwright() as pw:
            for engine in os.environ.get('TAP_BROWSERS', 'chromium').split(','):
                ENGINE = engine.strip()
                options = {'headless': True}
                if os.environ.get('TAP_BROWSER_EXECUTABLE'):
                    options['executable_path'] = os.environ['TAP_BROWSER_EXECUTABLE']
                try:
                    browser = getattr(pw, ENGINE).launch(**options)
                except Exception as exc:
                    RESULTS.append({'name': 'Browser launch', 'engine': ENGINE, 'status': 'BLOCKED', 'detail': str(exc)})
                    persist()
                    continue
                for name, fn in suites:
                    record(name, lambda f=fn: f(browser))
                    for ctx in browser.contexts:
                        ctx.close()
                browser.close()
    except Exception as exc:
        RESULTS.append({'name': 'Test environment setup', 'engine': ENGINE, 'status': 'BLOCKED', 'detail': str(exc), 'traceback': traceback.format_exc()})
    finally:
        if server: server.shutdown()
        persist()
    counts = {status.lower(): sum(r['status'] == status for r in RESULTS) for status in ['PASS', 'FAIL', 'BLOCKED']}
    print(json.dumps(counts, indent=2))
    return 1 if counts['fail'] or counts['blocked'] or not counts['pass'] else 0


if __name__ == '__main__':
    sys.exit(main())
