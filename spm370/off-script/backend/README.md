# OFF SCRIPT private submission backend

Production endpoint: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-offscript`

The deployed function uses existing server credentials and existing SPM 370 instructor-key verification. Those values and the production entrypoint are private and intentionally absent from this repository. `index.example.ts` documents the wiring with a required server-side environment variable; do not expose the instructor key, its verification digest, or service-role credentials in public client files.

- `schema.sql`: isolated OFF SCRIPT submission and rate-limit tables; RLS enabled; no PUBLIC/anon/authenticated table access or public policies; service-only rate-limit RPC
- `model.mjs`: server copy of the unchanged original branching model for canonical six-choice validation
- `validation.mjs`: bounded identity/reflection inputs, canonical choice/check validation, server-derived completion/concept score, and grade-override validation
- `server.mjs`: submit/idempotency, private instructor list/grade routes, CORS, limits and sanitized errors
- `security.test.mjs`: synthetic unit/security tests, no production credentials or student data

POST to the base route with `action: "submit"` and the documented frontend payload. A UUID identifies one individual's attempt. Identical retries return the same receipt; changed payloads for the same attempt and duplicate emails fail without exposing the existing student's record. The server ignores client-supplied scores. Instructor GET/POST uses `x-instructor-key`; failed authorization is checked before reading submission rows.

Email ownership and student identity are not verified. CORS is not authentication. The submission endpoint is intentionally public for this low-stakes classroom workflow; the database and instructor routes remain private. Reflections are not automatically graded for quality. A recorded grade is an instructor-overridable learning score, not a legal judgment.

Run from the repository root:

```sh
node --test spm370/off-script/tests/*.test.js spm370/off-script/backend/security.test.mjs
```

Database/function deployment is a separate authorized operation. Never paste production secret values into this repository or copy private synthetic receipt files into it.
