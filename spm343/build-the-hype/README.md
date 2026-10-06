# Build the Hype

A small, creative event-planning sandbox for **SPM 343: Esports Events**. Work solo or in pairs on one device. About 12–15 minutes; no grades, accounts, leaderboard, or backend.

## Run it

Serve this directory as ordinary static files. No build step is needed. From the repository root:

```sh
python3 -m http.server 8000
# Open /spm343/build-the-hype/ in your browser.
```

The student route is the directory itself. There is no instructor unlock or secret route. `How to play` contains the brief. The included artwork is original SVG; there are no remote fonts, image services, APIs, or runtime packages.

## The experience

1. Choose **Just me** or **With a partner** and optionally give the event a name. Do not enter student names.
2. Pick a purpose and audience: credible campus competition, welcoming new/casual players, or a spectator showcase. Each comes with a concrete target and a way to measure it.
3. Pick a format: knockout cup, group play + final, or rotating mini-challenges.
4. Choose **up to three** optional features using **10 planning credits**. A zero-extra-feature event is also valid. The visual event poster updates with each choice.
5. The headline host is delayed 20 minutes. Choose one response: delay the headline and warm up; use the backup host; or open with a community challenge. All cost zero extra credits and involve a different operational tradeoff.
6. Review illustrative turnout and player/guest-experience signals, credits left, and the explicit tradeoffs. Write an optional one-sentence defense, download a one-page HTML recap, or print/save PDF.
7. Remix the plan with the same surprise. The same choices always produce the same teaching signals.

### Feature menu

| Feature | Credits | What guests get |
| --- | ---: | --- |
| Beginner free-play | 2 | A low-pressure introduction at a side station |
| Campus creator exhibition | 4 | A familiar campus face and a hosted show match |
| Live commentary + stream | 4 | Explained plays and a simple stream |
| Spectator prediction game | 2 | Fun audience polls; no money, wagering, or prizes |
| Quick coaching corner | 3 | Short tips from experienced peers |
| Player spotlight station | 3 | Player introductions and a photo backdrop |

Credits are invented planning units bundling a feature’s helpers and supplies, not dollars. Venue, game permissions, equipment, core officials, check-in, safety, accessibility support, and basic contingency support are already provided. A backup host, activity guides, and a reserved warm-up station make all three responses feasible. Optional-feature staff do not replace core safety or access roles. Venue selection is deliberately outside this activity.

## Instructor run-of-show

A compact 15-minute class use:

- **0:00–1:30**: Launch. “Make an event for a specific audience. You may work alone or with one partner. Your job is to defend a coherent plan, not hunt for a perfect score.”
- **1:30–5:30**: Choose purpose, format, features. In pairs, one student drives and the other challenges whether each choice serves the audience.
- **5:30–8:00**: Open the doors. Switch the driver in pairs; choose one contingency response.
- **8:00–10:00**: Read the recap and write the one-sentence defense.
- **10:00–13:00**: Hear two contrasting plans. Ask why each works for its own audience.
- **13:00–15:00**: Close on the planning chain: mission → measurable goal → audience → format → resources/staff → adapt → evaluate with evidence.

If extending discussion to a **10-minute debrief**, use:

1. **2 minutes:** Two contrasting audience goals. Which choice clearly served each goal?
2. **3 minutes:** Compare formats and features. What did one plan deliberately give up? Would more features actually fix a mismatch in the core format?
3. **3 minutes:** Compare responses to the same host delay. What stayed protected? What would the operations lead tell the crew and guests?
4. **2 minutes:** “What evidence would tell you whether your real goal was achieved?” Distinguish an appealing poster and a simulated signal from actual attendance, retention, or survey data.

No submission is required by the app. If the instructor wants a record, students choose to download/print the recap and share it through the instructor’s normal channel. The app never sends the report anywhere.

## Teaching alignment and model boundaries

The activity applies the course’s Esports Events planning framework: mission/goals/tactics, matching an event to its audience, format and staffing consequences, contingency planning, and post-event evaluation. These are teaching applications, not quotations or quantitative findings from the assigned chapter.

`model.js` exposes the complete model. Turnout and experience are qualitative **illustrative signals**, built from an invented audience/format/feature fit matrix and a small, fixed contingency tradeoff. They are not attendance predictions, satisfaction measurements, grades, or research-supported estimates. No actual turnout count is fabricated. Targets remain **unmeasured** in the recap, with a proposed real measurement method.

- Turnout signal: “A focused crowd,” “Steady interest,” or “Broad pull.” Bigger is not automatically better; a small event may achieve its mission.
- Experience: “A mixed fit,” “Good foundations,” or “Strong fit.” A core format that conflicts with the mission instead remains “Mixed priorities”; feature purchases cannot erase that caveat.
- Budget: the exact planning credits remaining; no money or revenue calculations.
- No combined score, winning configuration, random roll, or performance leaderboard exists.
- Every format is operationally possible within the provided event setup. Features are mutually compatible, subject only to the three-feature and ten-credit limits.

## Privacy and persistence

Only this browser’s `localStorage` is used, under `spm343-build-the-hype-v1`. It stores the mode, optional event name, planning choices, optional reflection, and current step. There is no student identity field, login, analytics, network request, grade, central record, or submission. Reload restores work when local storage is available; blocked/corrupted storage gets a visible notice and the app remains playable. Do not rely on persistence in private browsing. Start over requires an in-app confirmation and does not touch other activities’ data.

Downloaded reports are ordinary HTML files with embedded print styling. They include no external resources and do not load the activity or send data. Their only script is the user-operated browser print button. Reports can be viewed offline and printed to PDF.

## Development checks

Node 20 or later. Runtime has no package dependencies. `jsdom` is a development-only dependency for DOM tests.

```sh
npm install
npm test
# Model-only checks need no install:
node --test tests/model.test.cjs
```

`tests/model.test.cjs` exhaustively checks all 1,080 feasible purpose/format/feature/response combinations, including no extras. `tests/interface.test.cjs` exercises the real client through JSDOM with browser download/dialog/print APIs replaced by explicit test doubles. See `VERIFICATION.md` for exact coverage and outstanding live-browser checks.
