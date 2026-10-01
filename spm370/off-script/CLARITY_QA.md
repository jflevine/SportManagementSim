# First-time-player clarity review — OFF SCRIPT v1.1.0

## What failed in v1.0

The first decision relied on names and a project the player had not been adequately introduced to. The student welcome placed its short role explanation below the start control. The instructor demo bypassed that welcome entirely. Passing branch calculations and control tests did not establish that a first-time player understood the assignment.

Additional problems found in source review: character roles were hidden on small screens; essential contract facts appeared in collapsed notes; generic decision headings and several scene titles substituted atmosphere for an actual task; later scenes used unexplained professional shorthand; the creator-led sponsor-conflict option described an edit even though that branch concerned a new personal-channel promotion.

## What was changed

1. Two-part orientation before the first decision, including in demo mode and on migration of an existing save. Part one establishes organization, event, role, commercial request, and mission. Part two introduces the creators and sponsor, explains production funding, and demonstrates the reading/selection/confirmation sequence.
2. A persistent Story & people reference with character descriptions and plain-English meanings. New participants are introduced in their scene and identified beside their dialogue. Roles are no longer hidden on mobile.
3. Every decision has a location in the campaign timeline, two explanatory paragraphs, visible facts, and a specific task question. Facts needed to interpret choices do not depend on opening an optional panel.
4. Clearer option labels and narrative transitions. The original radio selection and separate confirmation remain; there are no new timers, quiz gates, or grading mechanics.
5. Explicit distinctions between the event and its promotion, money offered and money received, an approved recording and an AI imitation, and the original campaign and a proposed follow-on campaign. The 30-day license runs from signing.
6. The creator-led conflict now consistently describes the extra personal-channel promotion rather than an unrelated clip edit.

## Model regression checks

The narrative adapter was compared to the original model for all 729 complete choice sequences and all 1,093 traversed history states. Funds, ledger entries, relationship values, agreement scope, conditional payments, permissions, launch states, and ending families were equal for the same choices. The 14 scene variants each supply an explicit task, two setup paragraphs, visible facts, and the same three underlying action IDs.

## Browser and interface checks

Twenty-four full primary runs: eight paths at each of 390, 768, and 1440 CSS pixels. These paths cover all 14 conditional scene variants. Checks verify visible facts and role labels, no page-level horizontal overflow, complete progression, and final summaries. No JavaScript page errors were observed.

Additional checks cover old saves at first decision, later decision, consequence, ending, and completed-summary stages; a refresh midway through orientation; demonstration/student save isolation; character/term and deal dialogs with keyboard close and selection/focus preservation; a two-decision alternate while preserving the first ending; escaped names; clipboard-denial fallback; text download; print view; a complete run with native storage denied; corrupt-save warning; and instructor-guide rendering.

## Interpretation and limitations

This is an editorial/cognitive walkthrough plus controlled browser testing. No actual novice student has yet been observed completing the revised game, so comprehension and enjoyment are not claimed as validated classroom outcomes. The instructor guide recommends asking players to explain who they work for, what CROSSPLAY is, and what Seatline is buying before choosing.

Browser network navigation is blocked in this environment. Exact HTML, styles, and scripts are loaded into an offline test document; only the query-string input is substituted for route tests. Successful storage uses an explicit in-memory test double, with native denied storage checked separately. These checks do not claim live interactive navigation, Safari testing, or physical-device testing. GitHub file hashes and Pages deployment are checked separately.

## v1.1.1 first-time-player follow-up (October 1, 2026)

The follow-up combines an independent interactive walkthrough of the live v1.1.0 game with source review and executable tests of the revised local files. It does not claim a novice-student usability study.

### Focused corrections

- Explain NIL in the mandatory setup, rather than only in the optional glossary.
- Make trailer options reflect whether the earlier chair conflict was actually resolved. Both trailer variants explicitly disclose the approved-recording fallback.
- Keep the deal file current: distinguish the original event grant from the new 90-day fixed-ad permissions, record the separately approved shoot and official-art extension, and clearly show withdrawal/postponement with no new consent or unpaid conditional funds.
- Disclose the existing story's 24-hour postponement of CROSSPLAY and its campaign before selecting the extension. The producer can arrange that shift; the consequence no longer reveals the event-wide impact for the first time.
- Allow a rewind to decision six for a one-choice comparison. Returning to the first ending and reopening an alternate preserves its consequence screen or uncommitted choice.
- Use a neutral, accurate accessible name for the close button shared by both reference dialogs.
- Accept v1.0 and v1.1.0 saves in v1.1.1. Track the orientation version separately, so this maintenance update does not force an already-oriented v1.1 player through setup again.

### Engagement without additional rules

Short story hooks replace the dry next-scene setting labels. The AI dilemma uses a more immediate cancellation hook and less repeated explanation; the sponsor's final offer is also tighter. Distinct illustrated portraits replace initials in campaign chat and cast introductions, with a shared visual identity on the welcome poster. Names and roles remain readable beside every conversation portrait; decorative images do not replace text. ECHO Studio uses a waveform studio mark. A scene-specific subject under #crossplay-campaign and a concise trailer-review request add realistic context without new interaction. Existing creator dialogue, visible costs, and consequences remain. There are still six decisions, three actions per decision, one confirmation control, no timer, and no new scoring system.

### Repeatable local checks

Run from the repository root with Node.js 18 or newer:

```sh
node --test spm370/off-script/tests/*.test.js
node --check spm370/off-script/app.js
node --check spm370/off-script/experience.js
git diff --check
```

All 18 tests passed against the revised files. The model comparison traverses all 1,093 states and 729 complete paths, covering all 14 conditional scenes and six ending families. For identical actions, budgets, ledger entries, trust/community values, permission state, available option IDs, and ending families match the original engine. The engine itself is unchanged.

The interface tests execute the real application script against an explicitly limited DOM/storage test double. They cover mandatory setup, old-save restoration, v1.1 migration, decision-six rewinds, interrupted alternate consequences and selections, duplicate commits, reference dialogs, summary generation, clipboard denial, blocked/corrupt storage, canceled reset, and student/demo/guide isolation. These are controller and generated-markup checks, not native-browser or layout tests.

The earlier 24-run browser suite described above belongs to v1.1.0. Revised-build browser rendering, mobile layout, native download, and native printing have not yet been rerun: this environment prevents the installed Chromium process from opening its required socket. The independent live-site walkthrough covers the pre-patch game. After authorized publication, verify the exact deployed version and repeat the affected interactions on the live game before classroom release.
