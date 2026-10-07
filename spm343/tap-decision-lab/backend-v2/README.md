# TAP Decision Lab2 live v2 backend

Released 2026-10-07 into existing Supabase project havsvkhddvdbzbsmhqbr as the separate Edge Function spm343-tap-lab2-v2. The old spm343-tap-lab2 synthetic pilot endpoint, tables, records and controls were not changed.

API contract: CONTRACT.md. Status: https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2

## Learning record

Names, La Salle email, individual-work acknowledgment, the three brief written responses and final selections are private. Identity is explicitly self-reported, not university-verified. A fixed class-run identifier separates this case from other work. Initial choice/position lock before the audience update; submitted answers and stable receipt cannot be overwritten. The instructor alone applies the 2/3/3/2 rubric with private feedback. Ungraded is null; zero is an actual grade. Students can resume only their own attempt and see a receipt plus pending/reviewed status. Numeric grades, rubric scores and instructor feedback remain instructor-only. An explicit allowlist filters every student response, including historical idempotency replays.

This is an individual graded decision exercise. No automated content grade or predicted operational outcome is generated. All three proposals can be defended within constraints. The server checks required fields, immutable phases and the $300 cap, not whether the reasoning is pedagogically strong.

## Privacy and access

A client-generated 32-byte random session token is stored on the student's device and submitted only through x-attempt-token. The server stores only its SHA-256 digest bound to mode and class run, checks it before reading/replaying an attempt response, and never includes it in JSON. These are ordinary single-attempt application sessions, not instructor/API credentials. There is no email or cross-device recovery flow. Losing browser data requires contacting the instructor; creating another attempt will not recover the old one.

The instructor endpoint verifies the same existing instructor-key digest already used by the approved pilot deployment. The raw key was not retrieved, generated, changed, logged or written. Public deployment-config.mjs deliberately contains null; deploying public source alone fails closed for instructor access. During the approved private deployment, the existing server configuration file was transferred directly from the existing function's private tool result into the new private deployment. Do not commit or export that private configuration. The managed server role key is accessed only from existing Edge Function runtime variables.

verify_jwt=false is intentional because the handler implements custom attempt-scoped student authorization and existing-key instructor authorization. Status/guest are public. Service-role table access is never exposed to browsers. CORS is restricted to the published GitHub Pages origin; CORS itself is not treated as authorization.

## Database isolation

The additive migration spm343_tap_v2_live_release creates only:
- spm343_tap_v2_live: private live class attempts
- spm343_tap_v2_test: separately constrained fixed-identity test attempts
- spm343_tap_v2_operations: mode-scoped exact idempotency records
- spm343_tap_v2_guest_projection: enum-only structured projection; no private text or identity
- spm343_tap_v2_apply and spm343_tap_v2_guest: security-invoker RPCs with empty search path

Every table has ENABLE and FORCE RLS. PUBLIC, anon and authenticated have no privileges; no permissive browser policies exist. service_role has only required SELECT/INSERT/UPDATE or EXECUTE and no DELETE. No prior resource was altered. The apply RPC uses an attempt/mode-scoped transaction lock, atomically checks token hash and version, preserves locked snapshots/submitted answers/receipts, writes projection and records exact request replay. A different payload cannot reuse a request ID; an uncertain successful request returns its original durable response.

The guest RPC reads only the dedicated projection table, restricted to live mode. The edge function then allowlists each field again. Public data consists of aggregate stage/choice counts and explicitly released structured summaries, with no names, emails, attempts, receipts, raw response text, grades, comments or timestamps. Optional student consent defaults false. Instructor release is a separate explicit action, allowed only for submitted opt-in work. Publication accepts only the fixed structured decision template based on actual choices; arbitrary free text is rejected.

## Verification

- 12/12 independent Node handler tests passed: authorization boundaries, strict identity/input validation, mode/attempt-bound session, exact retry, immutable phases, stale CAS, three valid proposal paths, invalid budget rejection, stable receipts, manual score bounds and null versus zero for instructors, student assessment-field exclusion on resume and historical replay, opt-in/template release, guest segregation and safe errors
- Real PostgreSQL service-role RPC verification passed seven workflow/review/publication transitions in a rollback transaction, retaining no fixture rows; checked original snapshot, original receipt replay, manual zero and test exclusion from guest output
- 9/9 deployed HTTP test groups passed. Three example.invalid test attempts were retained in the separate test table, with final submissions for cup/orientation, open/extra_host and showcase/rotations. Wrong token, stale version, changed payload, immutable snapshot and over-budget cases failed safely. Live guest output was identical before and after. No live-mode student record was seeded
- Live status confirms version2.0.1/private-server/live-enabled. Old pilot status remains version1.0.0/browser-local/live-disabled
- Database privilege query confirmed RLS + FORCE RLS on all four new tables, anon/authenticated SELECT denied, service_role DELETE denied
- RPC checks confirmed security-invoker, empty search path and anon/authenticated EXECUTE denied
- Supabase security advisors reported only expected INFO rls_enabled_no_policy for the deliberately browser-inaccessible new tables, with no new warning/error. Explanation: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

The valid-existing-instructor-key browser success path has not been tested because the instructor must enter their existing key. Local key success uses an ephemeral fixture; direct SQL verification is not proof of possession of that key. Wrong-key denial was checked against the deployed endpoint. Do not claim this limitation is verified away.

## Documentation checked

Supabase changelog was read on2026-10-07 including the recent PostgreSQL minor breaking-change notice. None of its ltree/pgcrypto/custom-operator changes applies to these new dependency-free handlers and standard relational tables. Current official docs were searched for custom-auth Edge Functions, JWT platform verification and API security.
- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/functions/auth-headers
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/database/postgres/row-level-security

No new package dependency or runtime credential was installed. schema.sql is the exact additive schema. generate-sql-verification.mjs regenerates a random isolated rollback test. Keep tests confined to mode:test; never populate live-mode students as a test, and do not delete retained evidence automatically.

## Privacy narrowing, version2.0.1

Student responses are explicitly allowlisted on all success exits, including durable idempotency replays created by earlier versions. Numeric grades and feedback remain instructor-only. Fresh student resume reports only pending/reviewed status. No schema or existing record changes were needed.
