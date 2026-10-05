# KC2 submission backend: review-only package

Status: implemented and tested locally; **not deployed or enabled**. No migration has been applied, no credentials have been changed, and no student records have been queried. KC1 remains separate.

## Identity and security boundaries

This intentionally retains KC1's simplest identity model: students type a first name, last name, and `@lasalle.edu` email. **The email and name are unverified. There is no sign-in or proof of account ownership.** Do not describe a submission as authenticated or verified. A script can forge the allowed Origin header or claim another email; CORS is a browser boundary, not authentication. The design cannot prevent impersonation, intentional consumption of somebody else's email/version slot, or repeated submissions under invented addresses. Instructor review remains necessary for disputes.

Production CORS accepts only `https://jflevine.github.io`. The route accepts POST and OPTIONS only, and there is no result lookup by email, public analytics, instructor API, or client-side database access. Local origins can be injected only by a local test harness; the production entrypoint never adds them.

The proposed table has RLS enabled and forced, no policies granting browser access, explicit revocation from `PUBLIC`, `anon`, and `authenticated`, and only SELECT/INSERT granted to `service_role`. Supabase's existing server-runtime service-role value is used only inside the edge function. No key is included in this package or needed in the student client. This is a privileged server endpoint, so validation and database uniqueness are its security boundary.

No application code logs request bodies, names, email, answers, scores, IP, user-agent, credentials, or rubric contents. The application persists no IP address or user-agent. Provider infrastructure access-log behavior is separate and has not been changed.

## Files

- `handler.mjs`: runtime-independent Fetch API handler and private rubric validation
- `supabase-store.mjs`: dependency-free, service-role-only PostgREST adapter
- `index.ts`: proposed Deno/Supabase function entrypoint, `submit-mgt340-kc2`
- `deployment-config.mjs`: public, disabled defaults; may be privately substituted only in an approved server deployment file list
- `schema.proposal.sql`: review-only SQL; not a migration and never applied here
- `config.proposal.toml`: proposed `verify_jwt = false`, matching unverified typed identity
- `../tests/server.test.mjs`: Node's built-in test runner, in-memory stores and mocked fetch only

None of the backend modules should be imported or bundled by the public student page. Public backend source contains no real answer key or explanations. No real grading data or test fixtures derived from it belong in Git, Pages, source maps, HTML, or browser bundles.

## Request contract

POST JSON to the eventual `submit-mgt340-kc2` function with these fields:

| Field | Requirement |
| --- | --- |
| `attemptId` | `crypto.randomUUID()` UUID v4, generated once and reused for a retry |
| `assessmentVersion` | Exactly matches the privately configured assessment version |
| `firstName`, `lastName` | Nonempty strings, at most 80 characters after trim/space normalization, include a letter, no control characters |
| `email` | A syntactically valid email at exactly `lasalle.edu`; trim and lowercase are applied |
| `answers` | Exactly ten integer option indices, each 0–2, in the unchanged public item order |
| `clientStartedAt` | UTC ISO timestamp from `new Date().toISOString()`; recorded as untrusted client time |

Do not send rubric versions, answer keys, explanations, extra identity fields, or client telemetry. Submitted `score`, `financeScore`, or `legalScore`, if present, are ignored entirely. All other unknown fields are rejected. The client timestamp must be a real timestamp from 2000 onward and cannot exceed server time by more than five minutes. The full body is capped at 16 KiB, including chunked requests, and compressed bodies are rejected.

The canonical submission consists of the normalized UUID, version, names, email, ten answers, and client timestamp. Keep these frozen after the first submission attempt. On an uncertain save, keep the same UUID and canonical payload. Changing an ignored client score does not change the submission.

### Success, only after a durable save

HTTP 200 returns `ok: true`, `receipt`, and `feedback`:

- `receipt`: `receiptId`, `attemptId`, `assessmentVersion`, `submittedAt`, `score`, `maxScore: 10`, `financeScore`, `legalScore`
- `feedback`: ten objects containing `questionId`, `selectedIndex`, `correctIndex`, `correct`, and `explanation`

The server grades exactly five finance and five legal questions, one point each. The server-generated timestamp is captured once the payload is validated, immediately before the database insert. Display explanations as text, never HTML. The complete original response is stored privately as the receipt so retries remain identical even if the configured rubric later changes.

### Failures

Every failure is `{ok:false,error:{code,message}}`, never includes a grade/key/feedback, and is sent with `Cache-Control: no-store`.

| Status | Meaning |
| --- | --- |
| 400 | Invalid submission/JSON or version mismatch; correct fields or reload as appropriate |
| 403 | Missing or non-allowed Origin |
| 405 | Method not allowed; no GET result route |
| 409 | Generic submission conflict; retry the exact original attempt or contact instructor |
| 413 | Body too large |
| 415 | Non-JSON or compressed body |
| 503 `SUBMISSIONS_UNAVAILABLE` | Disabled or missing/invalid private configuration |
| 503 `SAVE_UNCONFIRMED` | Storage failure or deadline; retry the same frozen submission |

The handler has an eight-second total deadline, cancels incoming reads and outgoing fetches on timeout, and discloses no internal exception text. A save can commit even if its acknowledgment is lost; a same-payload retry recovers the stored receipt.

## Idempotency and races

A single atomic INSERT is protected by two database constraints:

1. `attempt_id` primary key
2. Unique normalized `(email, assessment_version)`

On a unique violation, the server looks up only the supplied unpredictable UUID. If the canonical payload matches that record, it returns the original saved response. A changed payload with the same UUID, or a new UUID for an existing email/version, gets the same generic 409. No prior result or other attempt ID is exposed. The server does not perform a race-prone email check followed by an insert and has no overwrite/upsert path.

Keep attempt IDs private to the submitting browser. A UUID v4 is a 128-bit identifier with 122 random bits after its fixed version/variant bits; its role is retry correlation, not account authentication. This design does not support result recovery from email alone or from another browser without the original attempt payload.

## Exact stored data

The new table `public.mgt340_kc2_submissions` stores only:

- `attempt_id`, `assessment_version`, `rubric_version`
- `first_name`, `last_name`, normalized `email`
- ten-element `answers`
- `score`, `finance_score`, `legal_score`
- `client_started_at`, server `submitted_at`
- `receipt`, the original post-save response, including feedback

There is no student ID, roster lookup, IP, user-agent, browser fingerprint, password, auth token, or tracking data. Receipt feedback is part of the private submission record, never a public view. No retention/deletion job is introduced; the instructor must approve a retention policy separately.

## Private rubric configuration

`MGT340_KC2_RUBRIC` is optional server-only JSON configuration, not a newly generated credential. Alternatively, an approved server deployment can receive the same rubric through a private deployment-only module. Keep every real rubric value and private deployment module in an approved private location outside the repository until a separately approved deployment. The required shape is:

- `assessmentVersion`: immutable version string matching the public assessment
- `rubricVersion`: grading revision string
- `items`: ten ordered objects with `questionId`, `category`, `correctIndex`, `explanation`
- `category`: `finance` or `legal`, exactly five of each
- `questionId`: unique stable identifier matching the public item order
- `correctIndex`: integer 0–2
- `explanation`: nonempty string, at most 2,400 characters

### Optional private deployment-file configuration

The checked-in `deployment-config.mjs` exports only `deploymentConfig = { enabled: false, rubric: null }`. It is safe to publish and remains disabled. When the instructor approves deployment, the deployment tool may substitute a private file with the same export containing `enabled: true` and the approved rubric **directly in the server-only deployment file list**. This avoids needing to change or create Supabase credentials or environment entries. Keep the private replacement outside this repository and never commit, print, publish, or serve it from GitHub Pages. Only its public disabled placeholder belongs in Git.

Explicit environment values take precedence: an unset `MGT340_KC2_ENABLED` uses the bundled flag; any set value other than exactly `true` disables it. An unset `MGT340_KC2_RUBRIC` uses the bundled rubric; a set malformed/empty value fails closed rather than falling back. Thus the normal repository file list remains disabled even if deployed accidentally. A valid rubric, an enabled flag from one approved source, the exact project URL, and the existing server service-role runtime value are all required.

Version and question-ID strings use letters, digits, periods, underscores, or hyphens, start with a letter/digit, and have at most 80 characters. Missing or malformed configuration disables submissions. No real or sample answer-index array is included in this document. Tests generate independent ephemeral synthetic grading values at runtime and never write them to disk.

## Approval-gated deployment checklist

This package does not authorize any of these actions. Obtain deployment/database-change approval first.

1. Review identity limitations, assessment/rubric version and item ordering, data retention, privacy wording, and the database proposal with the instructor.
2. In an isolated/local review environment, execute and verify the proposed SQL, including role-denial tests. Actual PostgreSQL RLS behavior has not been exercised by the in-memory test suite. After review, use the normal Supabase CLI migration-generation workflow; do not treat `schema.proposal.sql` as an already applied migration.
3. For the already identified project `havsvkhddvdbzbsmhqbr`, add the new function using `index.ts` plus `handler.mjs`, `supabase-store.mjs`, and the appropriate `deployment-config.mjs`. Do not replace or modify KC1's route/table.
4. Apply the approved new table, preserving RLS/revocations and SELECT/INSERT only for `service_role`. Verify permissions, uniqueness, and security advisors without reading student records.
5. Supply the approved private rubric through an approved private deployment-file substitution or server runtime configuration. Keep the bundled flag false (and any environment flag unset or false) until configuration and isolated verification pass. The function also requires the existing `SUPABASE_URL` to exactly match `https://havsvkhddvdbzbsmhqbr.supabase.co` and the existing server-only `SUPABASE_SERVICE_ROLE_KEY`. Never retrieve or expose that key in a browser or public file.
6. Add the proposed function configuration with `verify_jwt = false`. This explicitly means no student authentication, as documented above.
7. Verify the public client uses the new endpoint and version, sends no secret, freezes its retry payload, and handles generic conflicts and unavailable saves. Approve a controlled synthetic end-to-end test before any live test insert.
8. Enable with a deployment-only private `enabled: true` substitution or `MGT340_KC2_ENABLED=true` only after explicit approval and configuration. Changing production origins, identity model, security permissions, or credentials requires separate review.

No CLI deploy command, SQL application, environment mutation, live POST, credential read, or student data read was performed to prepare this package.

## Local verification

From repository root:

```sh
node --test mgt340/knowledge-check-2/tests/server.test.mjs
```

The suite uses only memory stores and mocked fetch calls. It checks correct/wrong/mixed server grading, exact stored fields, tampered client scores, retries across rubric changes, changed-payload rejection, concurrent insert conflicts, version/email uniqueness, invalid payloads/config, CORS/media/body limits, save-gated feedback, timeouts, lost acknowledgments, and private adapter behavior. SQL tests inspect proposal text only; they are not proof that an unexecuted schema is installed or that real RLS has been exercised.

## Documentation checked

Checked Supabase's changelog and current official docs on 2026-10-05. The Data API opt-in change is addressed by explicitly granting only the service role access. No SDK package is added; adapters use standard Fetch APIs, so there is no unpinned SDK dependency.

- [Edge Function authorization](https://supabase.com/docs/guides/functions/auth)
- [CORS behavior](https://supabase.com/docs/guides/functions/cors)
- [Row Level Security and service roles](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [New table API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
