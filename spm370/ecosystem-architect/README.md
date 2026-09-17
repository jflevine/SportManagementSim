# Ecosystem Architect: Season One

**Power. Money. Law.**

A narrative classroom simulation for **SPM 370 — Esports, Video Games, and the Law**. Students act as the Director of Competitive Ecosystem Strategy for the fictional esport **NEXUS//ARENA**, then design the competitive ecosystem, fund it, allocate legal protections, respond to Year One crises, and defend whether the ecosystem should continue into Year Two.

## Live app

https://jflevine.github.io/SportManagementSim/spm370/ecosystem-architect/

## MVP status

**Season One MVP 1.0** is classroom-ready as a browser-based, dependency-free application hosted on GitHub Pages.

The MVP is intentionally local-first. Student progress is stored in the browser and no student response data is transmitted to a central server. A completed run can be exported as JSON or copied as a boardroom debrief.

## Learning design

The experience follows this instructional sequence:

1. **Stakeholder briefing** — power, legitimacy, and urgency.
2. **Board priorities** — students select three stakeholder constituencies to prioritize.
3. **Competitive architecture** — Closed / Partnered, Open Circuit, or Hybrid.
4. **Money engine** — students allocate 100 operating-revenue points and distinguish recurring revenue from outside capital.
5. **Legal loadout** — students choose five legal protections and accept tradeoffs created by omitted protections.
6. **Crisis arc** — Year One shocks expose dependencies, contract gaps, governance problems, and shifting stakeholder salience.
7. **Final Board Meeting** — students decide whether to approve Year Two and defend the choice.

The central learning loop is:

**Scene → Decision → Consequence → Concept Unlock → Reflection**

## Core concepts operationalized

- stakeholder salience: power, legitimacy, urgency
- publisher IP control and gatekeeping
- publisher meta-governance
- closed / partnered, open-circuit, and hybrid business models
- capital versus recurring operating revenue
- publisher-linked revenue and strategic dependency
- sponsorship and commercial-rights conflicts
- participation, licensing, player, sponsor, revenue-sharing, rulebook, exit, change-of-format, and dispute-resolution provisions
- contract cascades and rulebook incorporation
- labor classification
- Section 1 coordination versus unilateral conduct
- consumer protection and youth-data/privacy issues
- integrity governance
- tournament licensing
- investor and common-ownership risk
- streaming-platform leverage
- esports betting and integrity risk

## Classroom run modes

The MVP supports three pacing modes:

- **Sprint** — 10–12 minutes, 2 crises
- **Standard Class** — 18–22 minutes, 3 crises
- **Deep Dive** — 25–30 minutes, 4 crises

Standard Class is the recommended default.

## Student-facing MVP features

- anime / motion-comic cold open
- recurring fictional stakeholder characters
- narrative episode structure
- live ecosystem intelligence panel
- stakeholder salience shifts
- concept unlocks and legal/business playbook
- decision journal
- autosave / resume through localStorage
- reduced-motion option
- mobile-responsive layout
- local sound effects toggle
- Year Two board defense
- copyable debrief
- printable / PDF board report
- downloadable JSON session record
- completion gate requiring a Year Two decision and written defense
- error boundary that preserves locally saved progress

## Instructor features

The floating **Instructor** console is designed for projector/demo use and currently controls only the browser on which it is opened.

Instructor controls include:

- switch Sprint / Standard / Deep Dive mode
- force the next spotlight crisis
- reveal all concepts for debriefing
- copy a compact classroom debrief
- jump directly to the Final Board Meeting

Add `?instructor=1` to the live URL to open the instructor console automatically.

Example:

`https://jflevine.github.io/SportManagementSim/spm370/ecosystem-architect/?instructor=1`

## Privacy and FERPA posture

The MVP does **not** require login, student email, student ID, or other personally identifiable information. Team names are free-form and should not be used to collect sensitive student information.

All gameplay state remains in the browser unless the user deliberately exports or copies it. The app currently has no centralized analytics, roster integration, or instructor collection endpoint.

This local-first design is appropriate for classroom playtesting because it minimizes unnecessary student data collection. If centralized submission or analytics are later added, the data model, retention policy, access controls, and institutional/FERPA implications should be reviewed before production use.

## Technical design

- static HTML/CSS/JavaScript
- no framework dependencies
- GitHub Pages hosting
- localStorage persistence
- no secret keys or server-side credentials
- no external database in MVP 1.0

Primary files:

- `index.html` — application shell
- `season-one.css` — narrative visual system
- `season-one.js` — Season One simulation engine
- `mvp.css` — classroom/MVP interface layer
- `mvp.js` — run modes, instructor tools, journal, export, completion, safeguards

## MVP acceptance criteria

A classroom-ready MVP should allow a first-time student group to:

- understand the fictional mission without instructor explanation
- identify stakeholder salience concepts before making architecture decisions
- choose an ecosystem architecture and explain the associated tradeoff
- distinguish capital from operating revenue
- identify publisher dependency in a revenue model
- select legal protections with meaningful opportunity cost
- respond to multiple crises and receive explanatory feedback
- observe stakeholder salience change after events
- complete a Year Two recommendation and written defense
- leave with a usable concept playbook and board report

Operationally, the application should:

- load without a build step
- preserve progress after refresh
- function on modern desktop and mobile browsers
- provide reduced-motion support
- fail visibly rather than silently if a runtime error occurs
- produce a portable completion record without collecting student PII centrally

## Known MVP limitations

These are deliberate boundaries rather than hidden defects:

- no central instructor dashboard
- no remote Professor Chaos control across student devices
- no class-code/session joining
- no centralized submissions or analytics
- no authentication
- no persistent cross-device student account
- no automated grading
- no LMS integration

Those capabilities move the product from a strong classroom MVP toward a reusable platform and should use a proper backend rather than being simulated in static client code.

## Next production phase

The recommended post-MVP architecture is **Supabase + GitHub + Vercel/GitHub Pages**, depending on whether server-side functionality is needed.

The first backend milestone should add:

1. instructor-created class sessions / class codes
2. anonymous or minimally identified team sessions
3. server-side save/submit
4. instructor dashboard showing architecture choices, crisis decisions, concepts unlocked, and Year Two positions
5. live instructor crisis broadcast / Professor Chaos Mode
6. CSV export and aggregate classroom comparison
7. explicit data-retention and deletion controls

Authentication should be added only if the teaching use case actually requires student identity. The product should continue to minimize student PII.

## Release

**Season One MVP 1.0**

Current production host: GitHub Pages
