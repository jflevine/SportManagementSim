# SPM343 TAP Decision Lab2 — isolated synthetic pilot

Deployed 2026-10-07 to existing Supabase project `havsvkhddvdbzbsmhqbr` as new Edge Function `spm343-tap-lab2`, version1. This is an instructor-review first draft, not the class launch.

## What is live

- Public status and synthetic guest view
- Public real-time demonstration with ONLY enum format and stage, in ONE shared synthetic row
- Existing-key protected instructor fixture test, list, manual 2/3/3/2 scoring, and release/hide of fixed separately redacted synthetic summaries
- Five-step private persistence model and atomic PostgreSQL operations, tested with synthetic fixtures

Every public student start/resume/save/lockPlan/submit action is hard-disabled server-side. The walkthrough keeps typed drafts on the device. It must not claim that practice completion submits graded work. Only enum format and stage leave the public walkthrough; no typed identity or free text is sent. Two backend-selected instructor fixtures use `example.invalid` identities.

See `CONTRACT.md` for exact request/response shapes. Never send the instructor key in a URL or keep it in localStorage. The frontend must hold it only in memory and display every response as text, never HTML.

## Instructor authorization

The private server deployment reuses the existing verification digest from the SPM370 Legal Literacy Check2 instructor-results endpoint. The same existing verification scheme is used by the OFF SCRIPT backend. No key was generated, retrieved, changed, saved, or disclosed. The public `deployment-config.mjs` intentionally contains `instructorKeyHash: null`; deploying only public source fails closed for instructor access. A separately approved server deployment substitutes the existing digest directly in its file list. Never commit that replacement.

The existing Supabase runtime service credential is read only inside the edge function. No client key, service key, raw instructor key, digest, or account token is included in this source package. `verify_jwt = false` is intentional because the server implements existing-key custom authorization for private controls; public methods are restricted to status and fixed synthetic demonstration data.

## Database boundaries

One additive migration, `spm343_tap_lab2_synthetic_pilot`, created only:

1. `spm343_tap_lab2_pilot_records`: restricted to two fixed synthetic fixture identifiers and synthetic identities
2. `spm343_tap_lab2_operations`: idempotent operation hashes and original private responses
3. `spm343_tap_lab2_guest_publications`: separately redacted fixed synthetic summaries; released false by default
4. `spm343_tap_lab2_shared_demo`: one row containing only allowed format/stage enums and a server update timestamp

Three new security-invoker functions with empty search path provide atomic apply, enum progress, and whitelisted guest data. Every table has ENABLE and FORCE RLS. PUBLIC, anon and authenticated table/function privileges are revoked. Only service_role has required SELECT/INSERT/UPDATE or EXECUTE; no DELETE privilege was granted. There are no browser policies, public views, or direct browser database access.

Atomic operation processing uses an attempt-scoped transaction lock, expected version, and operation identity/hash. Retry of the same request returns its originally stored response. Changed payload using the same ID fails. A stale version cannot overwrite newer work. Initial-plan and final-receipt preservation are checked in both the state machine and database function. No AI grading exists; initial review is null and only bounded instructor scores produce a total.

The public guest query reads only aggregate counts plus the separate synthetic publication/demo projection. The edge handler additionally selects fixed approved summaries from the server fixture definition, preventing raw stored text from being reflected into the guest response. Guest responses contain no names, emails, attempt IDs, receipts, raw answers, grades, instructor notes or unfinished free text. Every guest response declares synthetic pilot mode and live disabled.

## Verification completed

- 24 Node tests passed: authorization-before-data-access, live-route rejection, payload allowlists, synthetic workflow, concurrent idempotency, version conflict, snapshot preservation, lost acknowledgments, save-gated receipt, point limits, separate release/hide, enum-only demonstration, CORS/media/body bounds, and adapter/schema checks
- 20 live HTTP checks passed: status, all five student actions blocked, four wrong-key private actions denied, personal-field rejection, foreign-origin denial, shared draft/locked/submitted progression, stable duplicate updatedAt, and guest counters across separate requests
- Live PostgreSQL transaction exercised the actual service-role RPCs for all five storage stages, manual scoring, separate synthetic publication, original snapshot retention, and original receipt replay. The complete test transaction rolled back; it left no instructor fixture records
- Live table/function privilege queries confirmed RLS, FORCE RLS, denied browser-role access and private EXECUTE
- Supabase security advisors reported only the expected INFO `rls_enabled_no_policy` items for these four intentionally browser-inaccessible tables. No warning/error for these new resources. See https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

The deployed valid-existing-key browser success path has NOT been tested: the instructor must enter their existing key to verify it. Local valid-key tests used an ephemeral test value, and SQL tests used the already connected administrative tool; neither proves possession of the instructor key. Wrong-key denial was verified against the actual deployed function.

## Running local tests

`node --test security.test.mjs`

No dependencies or network calls are needed. `generate-sql-verification.mjs` produces a synthetic transaction script for an authorized database validation; the transaction rolls back. `live-smoke.py` is NOT a read-only test: it changes the one shared synthetic demo row and leaves guided/draft. Run it only within an authorized pilot test window, since other pilot testers may be using that row.

## Deliberate limitations before classroom launch

- The shared public demo is one globally shared example, not one count per student. Other testers can overwrite it. Its fixed summary is not a paraphrase of locally typed responses
- The server cannot be enabled for real student collection with a client flag or environment toggle. Live identity, access, recovery, retention, class session controls, real moderation and guest publication require a separately reviewed implementation
- No email is sent; no automatic grading occurs; no students are enrolled or authenticated
- Typed browser-local practice work can be lost if browser storage is cleared or the student changes devices. Do not describe it as a private server submission
- No existing course resources, tables, keys, policies or student records were modified

## Official documentation checked

Supabase changelog checked 2026-10-07. Recent breaking changes do not affect these dependency-free Fetch handlers, existing managed runtime credentials or security-invoker SQL. No new SDK was installed.

- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/functions/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
