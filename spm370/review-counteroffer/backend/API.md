# Counteroffer Lab backend

Base URL: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-counteroffer`

This activity has no AI/provider dependency. The function implements class-code and instructor-key authentication; it does not require a Supabase browser key or student account. Names and school emails are self-reported, not verified school single sign-on. Submit only from the published GitHub origin or the allowed local preview origins.

## Public routes

`GET /health` returns `{ok, configured, accepts_submissions}` as booleans. It does not return credentials, hashes, records, or rubric answers.

`GET /meta` returns `{ok, case_version, schema_version, accepts_submissions, limits}`. Current case version is `decision-lab-3-v1`, schema version is `1`; clauses are `1–6`. Name is 3–120 characters, recommendation 20–4000, and clarification 10–2000. Limits count trimmed JavaScript string length; they are not word-count requirements.

## Submit

`POST /submit`, headers `Content-Type: application/json` and `X-Class-Code`.

```json
{
  "submission_id": "client-generated UUID",
  "submission_token": "64–128 random URL-safe characters",
  "schema_version": 1,
  "case_version": "decision-lab-3-v1",
  "name": "Student name",
  "email": "student@lasalle.edu",
  "decision": "counter",
  "recommendation": "Student-authored recommendation...",
  "clause_number": 3,
  "clarification": "Student-authored clarification..."
}
```

The decision is `proceed`, `counter`, or `decline`. Generate and save the UUID, token, and complete payload **before** sending. Two joined `crypto.randomUUID()` values are a suitable 72-character token. Retrying an uncertain request must resend the same ID, token, and answers; do not create a replacement ID or silently edit the saved request.

Success: `{ok:true, submission_id, receipt, submitted_at, case_version, replayed}`. The server timestamp and receipt confirm durable storage. An exact retry returns the original receipt even after submissions close. The server never returns another student's response or allows changes by knowing their email. One response per normalized email/case is enforced. New IDs with an already-used email receive a conflict without revealing the old record.

If the server does not confirm the request, preserve the local answer/download and retry the saved request. A student cannot edit a confirmed submission through this API. There is no student list/grade route.

## Instructor routes

All require `X-Instructor-Key`. Keep the key in page memory, not localStorage, source, URLs, or exported student records.

`GET /instructor` returns `{ok, settings, submissions}`. Each submission contains the normalized student fields, `submission_id`, `receipt`, `submitted_at`, and `grade:null` or the grade below. Optional `?submission_id=UUID` returns only that record, useful for controlled testing and focused retrieval. No token hashes, payload hashes, or credentials are included.

`POST /grade`, JSON:

```json
{
  "submission_id": "UUID",
  "expected_grade_revision": 0,
  "points": {"recommendation": 4, "concept": 2, "clarification": 4},
  "feedback": "Instructor feedback"
}
```

Use revision `0` for an ungraded response or the displayed current `grade.revision` for an update. Points allow whole or half increments within `4 / 2 / 4`; `concept` is labelled **Applied course concept**. Feedback may be empty or up to 5000 characters. Result: `{ok, submission_id, replayed, grade:{revision,points,feedback,total,graded_at}}`. Grade updates append a revision. An exact retry after an uncertain save returns the same revision; stale conflicting edits return `409 grade_conflict` and must be refreshed, not overwritten.

`PUT /settings`, JSON `{accepts_submissions:true}` or `{accepts_submissions:false}`. Result: `{ok,settings}`. Closing prevents new submissions but preserves receipt retries and instructor access. No fixed timer or submission date is enforced by the backend. Default is open for the classroom activity.

## Error handling

Responses contain `{ok:false,error,code}`. In particular:

- `403 class_code_invalid`: ask for the class code again; preserve answers.
- `401 instructor_access_denied`: require the instructor credential.
- `409 duplicate_email`: existing work was not changed; instructor resolves any issue.
- `409 retry_mismatch`: do not overwrite; retry the original saved request or contact the instructor.
- `409 activity_closed`: preserve/download the local work and contact the instructor.
- `409 grade_conflict`: refresh the instructor record before another edit.
- `409 version_mismatch`: download work before reloading the current activity.
- `503 server_unavailable`: delivery is uncertain; retry exactly the same request.

CORS allows `https://jflevine.github.io`, `http://localhost:8765`, and `http://127.0.0.1:8765`; no wildcard. Browser CORS is not the authentication mechanism. The credential check applies to command-line requests too.

## Isolation and deployment

The three new tables and four SQL functions use the `spm370_counteroffer_` namespace. RLS is enabled; `anon`/`authenticated` roles have no table or RPC access. Only the server's Supabase-managed service-role credential reaches them. The private settings row stores hashes, never raw instructor/class credentials. Submissions reject updates, grade revisions reject updates, and service-role delete permission is withheld. Approved database-owner maintenance can remove known synthetic test IDs or perform institutional retention work; there is no public delete endpoint.

`schema.sql` is a fresh-install schema, not a repeatable reset. Apply it only once through the Supabase migration tool. Do not rerun against an existing installation. Deploy only `spm370-counteroffer` from `index.ts` and its relative modules. `verify_jwt=false` is deliberate because the function implements custom class/instructor authentication. No existing Avery function, case policy, or classroom record is read or changed.
