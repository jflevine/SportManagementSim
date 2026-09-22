# Marketing Arena — SPM 343 Decision Lab 1

A multiplayer classroom simulation for Jeffrey Levine's September 2026 esports-marketing module. Six fictional consumer brands build competing campaigns with 100 credits, face a common authenticity/creator shock, and justify their decisions.

## Live routes

- Student: https://jflevine.github.io/SportManagementSim/spm343/marketing-arena/
- Instructor: append `?view=instructor`
- Projector: append `?view=projector&room=ROOMCODE`

Instructor access is a private 256-bit key delivered outside the repository. The student and projector links never contain that key. Keep the instructor console on the private monitor and project only the separate feed.

## What this implements

- Six brands with distinct mandates, profiles and metric weights; fixed 100-credit budgets.
- Individual entry with full name and school email; independent initial position before peer recommendations become visible.
- Functional role intelligence. Smaller teams combine roles. Roles and team recorder rotate at the shock.
- Strategy before tactics, all Five Ps, separate distribution and communication-channel choices, creator selection, campaign voice and before/during/after activation.
- Shared market: bounded crowding adjustments, coherent differentiation and deterministic results. No random market shocks or AI grading.
- Instructor-controlled rounds, pausing, synchronized optional timer, separate projector feed, aggregate market signals and explicit debrief reveal.
- Server-side validation, immutable locked submissions, shared drafts, recorder ownership and stale-draft rejection.
- Student refresh/recovery, private recovery keys, instructor-assisted access reset, pre-submission team corrections, absent-student controls.
- 75 group rubric points and 25 individual points, nullable ungraded criteria, comments, grade CSV and complete evidence JSON export.
- Approved individual alternative room (one brand, all roles, same criteria, no comparable competitive rank).

## Teaching source alignment

Based on the supplied `26-9-21-Marketing Slides.pptx` (23 slides) and the current SPM 343 syllabus. No slides or syllabus files are republished in this repository.

| Source | Implementation |
| --- | --- |
| Slides 7–9: marketing value; players, spectators, fans | Brand mandate, consumer action, audience diagnosis and value proposition |
| Slides 10–11: consumer motivations | Independent recommendation, audience rationale and role research brief |
| Slide 13: Product, Price, Place, Promotion, Public relations | Five consequential paid categories; Place means delivery/distribution, separate from the digital channel |
| Slide 14: marketing of / through esports | Required explanation in the group decision memo |
| Slides 17–19: digital and influencer marketing | Channel/creator choices, audience fit, cost, risk and relationship rationale |
| Slide 20: authenticity and avoiding stereotypes | Independent authenticity index, contextual fit, voice and shock resilience |
| Slide 22: consumption before/during/after events | Three-part activation journey and a written relationship explanation |
| Syllabus: independent position before deliberation | Server-gated peer disclosure; locked individual recommendation |
| Syllabus: incomplete information, stakeholder tensions, change | Private role briefs, shared market signals, risk memo and common shock |
| Syllabus: individual assessment | Initial position (10) and final defense (15), separate from shared reasoning (75) |

Gender is not used as a deterministic audience variable. The classroom model does not generalize the slide 12 study into stereotypes.

## Model and interpretation

`model.mjs` defines all fictional brands, tactics, costs, compatibility rules, rubric and scoring. The server imports the identical module from `backend/model.mjs`. Keep these two copies synchronized when editing. The score is a teaching index, not an empirical prediction of real reach, revenue or consumer behavior.

Each metric starts at a fixed baseline, then receives tactic effects and explicit context effects: brand/category, audience/creator/channel alignment, objective fit, pricing coherence, voice, participation and the event journey. Authenticity also affects engagement. Results are clamped to 0–100 and weighted using the brand's fixed board mandate (choosing a different objective does not change the weight to game the score). Written rationales are not algorithmically evaluated.

Crowding reduces reach by at most 11 index points (channel + audience), with smaller creator engagement and giveaway-trust adjustments. Coherent channel differentiation can add three reach points. Each campaign is re-evaluated when another team locks. Same-score ties share rank. Initial results are frozen when the instructor advances from campaign build; final results are frozen when all shock responses are locked. The shock applies to all teams under the same rules. A pivot changes 1–2 paid choices at five credits per change; double down adds ten credits and eight points to the chosen metric. All response costs stay inside the original 100 credits.

## Private records and security

GitHub Pages serves only static application code. A dedicated Supabase Edge Function `spm343-marketing-arena` stores private room state in `spm343_arena_rooms`. `spm343_arena_access` stores only the hash of the dedicated instructor key. Both tables enable RLS, revoke all permissions from PUBLIC/anon/authenticated, and grant access only to the server service role. No public RLS policies is intentional deny-by-default behavior, not an incomplete configuration.

The function implements custom authorization, so gateway JWT verification is disabled. Instructor actions require the dedicated hashed key. Student actions require a cryptographically random per-student key whose hash is stored in the room. The projector endpoint explicitly projects only safe fields. Every write uses optimistic compare-and-swap on the room version, bounded retries and server-side phase/ownership validation. API responses never include token hashes. No service-role key, instructor key, names, school emails or real submissions belong in this repo.

Student names/emails are self-entered classroom identities, not institution-verified SSO accounts. The instructor should verify the roster. Students keep private recovery keys; the instructor can reset access after checking identity. The instructor key grants access to this application's sessions, not the rest of the Supabase project. To rotate it, update the SHA-256 hash in the access table and distribute a new private key. No credentials are embedded in public links.

The projector and student state poll every three seconds (near-real-time, network-dependent). Drafts are saved to private records after a short debounce; local storage is a recovery cache. An unsynced message means submission is not confirmed. Timers never auto-submit. Team edits are deliberately restricted to one recorder to prevent overwriting simultaneous substantive decisions.

## Development and deployment

This folder is dependency-free ES modules and HTML/CSS. Serve it with an HTTP server; file:// will not load modules reliably. Update the existing GitHub Pages repository on main to publish the static frontend. Deploy `backend/index.ts` and `backend/model.mjs` as the function files; use the existing project service credentials through Supabase-managed environment variables. Apply `backend/schema.sql` before the first deployment. Seed the instructor key hash privately (never commit the raw key).

## Verification

`tests/classroom.mjs` uses 24 fictional identities across six brands to exercise simultaneous joins, independent submissions, six campaigns, concurrent writes, immutable submissions, private/public separation, shared saturation, role rotation, the shock, final defenses, rubric grading and access failures. Supply `ARENA_KEY_FILE` pointing to a private JSON file with a `key` property. Test records are deliberately marked REHEARSAL and use example.invalid addresses. Do not point test exports into the repository.

For in-class use: retain the complete evidence JSON and CSV as appropriate to course assessment; the app does not send grades to Canvas automatically. Exported CSV escapes formula-like cells. The instructor manually evaluates the eight rubric criteria; winning the market does not generate a course grade.
