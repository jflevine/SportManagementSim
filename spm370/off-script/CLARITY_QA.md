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
