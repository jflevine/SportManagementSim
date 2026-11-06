# Pixel Forge private assessment API

Production endpoint: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-labor-v3`.
Status: deployed and open. One recorded attempt per normalized La Salle email, with save/resume before final submission. JSON requests and responses. No Supabase key is needed in the student browser: the function authenticates each attempt with a random bearer token and instructors separately.

## Browser contract

Generate a 48-character lowercase hex token using `crypto.getRandomValues(new Uint8Array(24))`. Retain it before the first network request. Send it only as `x-attempt-token`, never in a URL. Identity is self-reported, not school-login verified. One attempt per normalized La Salle email per assessment version.

- `GET /`: public availability/version only, no attempts or answer key.
- `POST /`, `{action:"start",name,email,role:"management"|"union",attest:true}`: create or resume this token's attempt. Full name 2–120 chars, email `@lasalle.edu`. Existing email with another token returns generic 409; use the original token or instructor recovery.
- `POST /`, `{action:"resume"}`: retrieve only this attempt, including persisted receipt/review if any.
- `POST /`, `{action:"saveDraft",revision,answers,explanation,gameplay}`: save editable work, no score or answer feedback. `answers` is an ordered array of option IDs (strings) or null; length exactly matches assessment questions. `explanation` is a string, max 1800 chars for the approved assessment (use returned maxExplanationChars). `gameplay` is optional JSON object, max 16000 bytes, containing the requested formative choices/summary only. It is untrusted context, never a grade input. Revision is from the last response.
- `POST /`, `{action:"submit",revision,answers,explanation,gameplay,attest:true}`: atomically lock complete MC and explanation, score MC from private key, persist timestamp and receipt. All MC required, explanation minimum from private assessment policy. No score fields accepted from client. Submit only once; network retries return the saved receipt and original answers without overwriting them.

Successful start/resume/save/submit returns:

```json
{
  "ok": true,
  "id": "uuid",
  "name": "Student Name",
  "email": "student@lasalle.edu",
  "revision": 0,
  "assessmentVersion": "pixel-forge-v3",
  "assessment": {
    "version": "pixel-forge-v3",
    "title": "Pixel Forge Labor Decision Lab",
    "maxPoints": 10,
    "mcMax": 8,
    "writingMax": 2,
    "explanationPrompt": "...",
    "explanationMinWords": 20,
    "maxExplanationChars": 1800,
    "role": "management",
    "questions": [{"id":"q1","prompt":"...","options":[{"id":"a","text":"..."}]}]
  },
  "answers": [null],
  "explanation": "",
  "gameplay": {},
  "status": "DRAFT",
  "submittedAt": null,
  "receipt": null,
  "mcScore": null,
  "writingScore": null,
  "finalScore": null,
  "reviewed": false,
  "reviewedAt": null,
  "graderNotes": "",
  "feedback": null
}
```

On submit, status is `SUBMITTED_PENDING_REVIEW`; MC score becomes a number, feedback becomes an array of `{questionId,selected,correct,earned,why}`. `writingScore` and `finalScore` remain null until semantic review; then status is `REVIEWED`. The student can resume to see the final score and student-facing grader notes. Do not label a network error as submitted; only a persisted receipt confirms it. On 409 reconnect/resume rather than silently overwriting. After an ambiguous submit response, call resume, or retry the identical submit with the same token. Never generate a new token to retry.

## Instructor contract

`x-instructor-key` is existing course instructor access; never include it in bundled JS, URLs, logs, or permanent browser storage.

- `GET /instructor`: authorized settings and private assessment (including rubric/key), plus token-free submissions. No student access to this route.
- `POST /instructor`, `{action:"setOpen",isOpen:boolean}`: open/close starts and writes. Resume/reviewed receipt access remains available.
- `POST /instructor`, `{action:"grade",id,revision,writingScore,notes,reviewerType:"assistant"|"instructor"}`: grade submitted writing semantically using the private rubric. Half-point increments up to policy writing maximum. Lenient applied understanding, not keywords, word count, or grammar. MC is immutable and total derived server-side. Grade and notes saved in append-only audit history.
- `POST /instructor`, `{action:"recover",id,revision}`: rotate only this attempt's resume token, invalidating old one; returns `recoveryCode`. Handle it like a password; share privately with that student only.

Errors are `{error:"human readable",code:"STABLE_CODE"}`. Principal HTTP codes: 400/415 invalid input; 401 missing/incorrect credential; 403 closed or disallowed origin; 409 revision or duplicate identity conflict; 429 rate limited; 503 storage/config unavailable. Responses use `Cache-Control:no-store`. The student never receives rubric, token hash, instructor credential, service credentials, another attempt, or pre-submit answer key.

## Private assessment input (not for publishing)

Author a private JSON object with version, title, explanationPrompt, explanationMinWords, writingMax, rubric, and questions. Each question has id, prompt, options `[{id,text}]`, correct option ID as `answer`, `why`, and points (normally 1). Server validates this and derives maxima. A policy change affecting an active assessment requires a new version; the existing version's snapshot is immutable per attempt.

## Exact instructor response

GET returns `{ok:true,isOpen,assessment,submissions:[...]}`. Each submission uses database-style fields: `id,full_name,email,assessment_version,role,created_at,revision,answers,explanation,gameplay,submitted_at,receipt,mc_score,writing_score,grader_notes,reviewer_type,reviewed_at`, plus camel-case derived `mcScore,writingScore,finalScore,reviewed,reviewedAt`. Drafts are included and must not be graded. Neither token hashes nor per-attempt private snapshots are returned. The top-level assessment is private and includes all role questions and the rubric.

Successful grade returns `{ok:true,submission:<same token-free submission shape>,score:{mcScore,writingScore,finalScore,reviewed,reviewedAt}}`. Successful recovery returns `{ok:true,recoveryCode,revision}`. Role is chosen at start and cannot be changed within that attempt. Questions returned to a student are the six shared plus two applicable role questions, in source order.

Instructor submissions also include `reviewQuestions`, `reviewRubric`, `reviewPrompt`, and `writingMax` from that attempt’s frozen snapshot. Use these to render/review historical work rather than the current top-level assessment. These fields never appear in student responses.
