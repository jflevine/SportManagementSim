# 30-minute update — 23 September 2026

- Deployed-service rehearsal: **71 checks passed**, 24 fictional students across six brands through all rounds and grading. Includes shorter individual responses, consolidated campaign reasoning, and automatically started phase timers.
- Model suite: **6 tests passed**. The suggested schedule totals 30 minutes; concise campaign evidence remains valid; all marketing choices, response costs and scoring constraints remain in place.
- Timing is an instructor-led plan, not a measured student completion time. It assumes the marketing concepts have already been taught, prompt transitions, and grading after class. Five minutes are reserved for the debrief.

# Verification — 22 September 2026

- Deployed-service rehearsal: **70 checks passed**, 24 fictional students, six brands, concurrent joins and submissions, all rounds through completion, group and individual grades retained.
- Model suite: **5 tests passed** including 6,000 brand/campaign bound checks, deterministic scoring, shared-rank ties, saturation, contextual authenticity, response budget constraints, role coverage for 1–6 students, and nullable grading.
- Browser walkthrough: **passed** on desktop Chromium, with a 390-pixel mobile entry check. Exercised student join, initial position, private briefing, all campaign sections, draft save, refresh restoration, campaign lock, shock response, individual defense, instructor group/individual rubric grading, CSV download and separate projector feed. Final academic total was 98; Market Power remained a separate field. No JavaScript page errors.
- Access checks: public feed excludes synthetic names/emails, written rationales and token hashes; students cannot grade, read other teams' private responses, or overwrite another recorder's draft. Stale draft versions are rejected.
- Database verification: row-level security enabled on both dedicated tables; anon and authenticated roles have no SELECT privileges. Advisor reports informational “RLS enabled, no policy” findings, consistent with the intentional service-only access model. Existing unrelated project tables were not modified.
- Synthetic rehearsal data uses example.invalid addresses. No real student information was used in testing or committed.

Scope: classroom-scale rehearsal, not a production load test or institution-wide security certification. The application uses a private instructor key and self-entered student identities; it does not integrate institutional SSO. The network-dependent projector refreshes approximately every three seconds. Export/post official course grades through the instructor’s normal Canvas process.
