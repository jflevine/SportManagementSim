# SPM 343 Decision Lab 2: A first visit to TAP

**Instructor-review pilot, October 7, 2026. Real class submissions are closed.**

This isolated addition does not change any other assignment or either lecture deck.

## Review links

- Student pilot: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/
- Auto-refreshing guest pilot: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/guest/
- Private instructor pilot: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/instructor/

These are planned publication addresses, not live pilot links yet. The tested source is in draft PR #30 awaiting explicit approval to publish. Real class submissions remain closed; use invented practice answers only.

## Classroom concept

Students independently propose a hypothetical 90-minute welcome event for 24 first-time college visitors. They choose a beginner-friendly mini-tournament or guided play with a short exhibition, explain an audience tradeoff, connect access/layout and technical requirements to venue fit, build a 90-minute operating sequence with a responsibility and success measure, then use one real interview insight to reconsider a decision. No Andrew quote or TAP business claim is invented.

Suggested pacing replaces the existing seven-minute practice block: one minute of introduction and six minutes for prompts 1–3 before the guest. During the October 8, 11:45 a.m.–12:15 p.m. Eastern interview, listen and capture one useful point. Allow three minutes near the end or afterward for the revision. An optional guest reaction must fit the remaining time; it does not add a separate 30-minute lab.

The goal, format choices, duration, and attendance are classroom assumptions, not facts about TAP's capacity, services, availability, or priorities. Real implementation would require checking permissions, safety, usable equipment, staffing, access, site availability, and cost.

## What this pilot does

- Student typed answers and the original-plan snapshot stay in local browser storage
- Reloading the same browser resumes the practice; a local download preserves the text if storage fails or the device is shared
- Finishing produces a clearly labeled local practice confirmation, not a class receipt or grade
- Only the structured format and progress stage reach a shared synthetic server demonstration
- The guest page polls every 10 seconds while visible and shows those saved updates, not keystrokes
- Guest example prose is fixed synthetic content, never a paraphrase of the reviewer's private typing
- Other pilot testers can overwrite the one shared demonstration; this is disclosed in both views
- Existing instructor authentication gates fixed synthetic private records, test receipts, manual grades, and explicit release/hide controls for screened synthetic summaries
- Private tests are isolated from all existing course submissions and are idempotent
- No new API keys or instructor credentials are created; no email is sent

## Proposed grade: 10 points, assigned by the instructor

1. Event (2): audience/goal fit; genuine tradeoff
2. Venue (3): access or layout need with reason; technology or reliability need with reason; concrete fact to verify
3. Operations (3): usable sequence totaling 90 minutes; responsible role and task; measurable target and collection method
4. Interview (2): specific actual insight; reasoned revision or retention with practical consequence

A well-supported decision to keep the original plan can earn full credit. No AI or client-side grade is assigned. Writing polish and a particular format choice are not the scoring target.

## Privacy and live-class launch

This draft deliberately cannot accept real student submissions. Backend student actions return `LIVE_DISABLED` regardless of client flags. Pilot private records use fixed invented names and `example.invalid` email addresses. The public demo endpoint accepts only enumerated format/stage values and rejects additional fields.

Before a live class launch, implement and test the authorized real-student identity and submission path, confirm retention and instructor access, test at least one real classroom device/network, and review the live guest-sharing policy. A student opt-in alone does not guarantee anonymous free text: screen or paraphrase it separately before publication. Automatic aggregate format/stage progress can remain separate from free-text releases. A future live guest view must never query private student rows directly.

The instructor page displays a future guest-sharing workflow and allows only fixed, already-redacted synthetic summaries to be released in this pilot. Student names, email addresses, raw answers, grades, and instructor notes are not part of the guest API response.

## Development and verification

Static HTML/CSS/JavaScript is deployed on the existing GitHub Pages platform. Supabase resources are additive and narrowly prefixed `spm343_tap_lab2_*`. See `backend/CONTRACT.md` for API details and `QA.md` for checks actually completed and their limits.

Hosted verification passed 30 browser cases across Chromium, Firefox, and WebKit at mobile/desktop sizes, 24 backend tests, and the live synthetic guest loop. See [the verified run](https://github.com/jflevine/SportManagementSim/actions/runs/37629471680).

Browser tests live in `tests/`; backend tests live in `backend/`. Keep fixtures synthetic. Do not delete any test or user record without approval.
