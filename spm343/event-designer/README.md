# SPM 343 — Design an esports event

An ungraded, 30-minute activity for self-selected pods of 2–3; solo work is supported. Students design one event, compare two fictional venue offers, allocate a fixed budget, and export one shared proposal for a short pitch.

## Classroom use

Open `index.html` through GitHub Pages. All five sections are immediately editable. No sign-in or entry button is required. Use `instructor.html` for timing, chapter connections, and debrief guidance. The optional staffing update is an extension, not a required sixth stage.

## Data and assessment

There is no backend, grade, online submission, tracking, external script, or API request. Anonymous draft content stays in local browser storage under `spm343-event-designer-v1`. It is automatically restored and can be reset after confirmation. Blocked storage does not prevent completing or downloading a plan. The download is plain text; the print button opens the browser print dialog, which supports Save PDF where available. Completing the form does not demonstrate correctness or produce a score.

This activity is separate from the prior TAP graded lab and does not change its records, backend, or instructor dashboard. It does not automatically satisfy one of the syllabus's four graded Decision Labs.

## Source grounding

- Gil Fried and David P. Hedlund, *Esports Events*, assigned Chapter 9: purpose and target market, format, venue selection, budgeting, operating responsibilities, run of show, and post-event evaluation.
- Gil Fried, *Esports Venues*, assigned Chapter 8: event–venue fit, usable equipment and space, staffing, access, and participant experience.
- Instructor-supplied October 6 Events and October 8 Venues slides.

All venue prices, capacity, equipment, and staffing arrangements are invented teaching assumptions, not verified TAP operating data or an endorsement. The $1,000 is confirmed event funding; no revenue estimation is required. Both venue offers include the room, equipment, technical support, setup/teardown, and arranged travel; the optional enhancements are the only added costs.

## Checks

`node --test spm343/event-designer/tests/model.test.mjs`

`python spm343/event-designer/tests/browser_test.py`

Browser tests require Python Playwright and its Chromium, Firefox, and WebKit engines. They use synthetic anonymous plans and a local static HTTP server. `EVENT_BASE_URL` may target the deployed activity, with local-only browser state. `EVENT_QA_OUTPUT` selects the results directory, and `EVENT_BROWSERS` selects comma-separated engines.
